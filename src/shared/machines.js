import {createContext} from 'react';

import {assign, createMachine} from 'xstate';
import gravatar from 'gravatar';
import {v1 as uuidv1} from 'uuid';

import {corsAnywhere, firestore, storage} from './firebase.js';
import {MissingGravatarProfileError, UnreachableGravatarPhotoError, UnreachableGravatarProfileError} from './errors.js';
import {removeFromArray, replaceInArray} from './helpers.js';

/**
 * @type {import('xstate').StateMachine<
 * 	{currentPage: number, files: any[], preExistingPhotos: any[]},
 * 	import('xstate').DoneInvokeEvent
 * >}
 * */
export const uploadSlideshowMachine = createMachine(
	{
		id: 'upload-slideshow',
		initial: 'idle',
		context: {currentPage: 0, files: [], preExistingPhotos: []},
		states: {
			idle: {
				always: [
					{
						cond: 'atLeastOnePreExistingPhotoLeft',
						target: 'preExistingPhotos',
					},
					{
						// shouldn't happen but makes it future-proof
						cond: 'atLeastOneNewPhotoLeft',
						target: 'newPhotos',
					},
					{
						target: 'noPhotos',
					},
				],
			},
			preExistingPhotos: {
				on: {
					PREVIOUS: {
						cond: 'notAtBeginning',
						actions: ['decrementPage'],
					},
					NEXT: [
						{
							cond: 'atEndOfPreExistingPhotosButNewPhotosRemain',
							target: 'newPhotos',
							actions: ['goToFirstPage'],
						},
						{
							cond: 'atEndOfPreExistingPhotos',
							target: 'newPhotosPage',
						},
						{
							actions: ['incrementPage'],
						},
					],
					SCHEDULE_FOR_REMOVAL: {
						actions: ['scheduleForRemoval'],
					},
					CANCEL_REMOVAL: {
						actions: ['cancelRemoval'],
					},
				},
			},
			newPhotos: {
				on: {
					PREVIOUS: [
						{
							cond: 'notAtBeginning',
							actions: ['decrementPage'],
						},
						{
							cond: 'atLeastOnePreExistingPhotoLeft',
							target: 'preExistingPhotos',
							actions: ['goToLastPageOfPreExistingPhotos'],
						},
					],
					NEXT: [
						{
							cond: 'atEndOfNewPhotos',
							target: 'newPhotosPage',
						},
						{
							actions: ['incrementPage'],
						},
					],
					REMOVED_PHOTO: [
						{
							cond: 'atLeastOneNewPhotoLeftAfterRemoval',
							actions: ['removeNewPhoto', 'decrementPageOrZero'],
						},
						{
							cond: 'atLeastOnePreExistingPhotoLeft',
							target: 'preExistingPhotos',
							actions: ['removeNewPhoto', 'goToLastPageOfPreExistingPhotos'],
						},
						{
							actions: ['removeNewPhoto'],
							target: 'noPhotos',
						},
					],
				},
			},
			newPhotosPage: {
				on: {
					PREVIOUS: [
						{
							cond: 'atLeastOneNewPhotoLeft',
							target: 'newPhotos',
						},
						{
							cond: 'atLeastOnePreExistingPhotoLeft',
							target: 'preExistingPhotos',
						},
						{
							// should be impossible to get here, this is just in case
							target: 'noPhotos',
						},
					],
					ADDED_PHOTOS: {
						actions: ['addNewPhotos', 'goToLastPageOfNewPhotos'],
						target: 'newPhotos',
					},
				},
			},
			noPhotos: {
				on: {
					ADDED_PHOTOS: {
						actions: ['addNewPhotos'],
						target: 'newPhotos',
					},
				},
			},
		},
	},
	{
		actions: {
			decrementPage: assign({currentPage: (ctx) => ctx.currentPage - 1}),
			decrementPageOrZero: assign({currentPage: (ctx) => Math.max(ctx.currentPage - 1, 0)}),
			incrementPage: assign({currentPage: (ctx) => ctx.currentPage + 1}),
			goToFirstPage: assign({
				currentPage(ctx) {
					if (ctx) return 0; // stupid workaround for TS checker to be happy (ctx required)
					return 0;
				},
			}),
			goToLastPageOfPreExistingPhotos: assign({currentPage: (ctx) => ctx.preExistingPhotos.length - 1}),
			goToLastPageOfNewPhotos: assign({currentPage: (ctx) => ctx.files.length - 1}),
			removeNewPhoto: assign({
				files: ({files, currentPage}) => removeFromArray(files, currentPage),
			}),
			addNewPhotos: assign({
				files: (ctx, event) => ctx.files.concat(event.data),
			}),
			scheduleForRemoval: assign({
				preExistingPhotos:
					({preExistingPhotos, currentPage}) => replaceInArray(
						preExistingPhotos,
						currentPage,
						(photo) => ({...photo, scheduledForRemoval: true}),
					),
			}),
			cancelRemoval: assign({
				preExistingPhotos:
					({preExistingPhotos, currentPage}) => replaceInArray(
						preExistingPhotos,
						currentPage,
						(photo) => ({...photo, scheduledForRemoval: false}),
					),
			}),
		},
		guards: {
			atEndOfPreExistingPhotos: (ctx) => ctx.currentPage >= ctx.preExistingPhotos.length - 1,
			atEndOfPreExistingPhotosButNewPhotosRemain:
				(ctx) => ctx.currentPage >= ctx.preExistingPhotos.length - 1 && ctx.files.length > 0,
			noPreExistingPhotos: (ctx) => ctx.preExistingPhotos.length === 0,
			notAtBeginning: (ctx) => ctx.currentPage > 0,
			atEndOfNewPhotos: (ctx) => ctx.currentPage >= ctx.files.length - 1,
			atLeastOneNewPhotoLeft: (ctx) => ctx.files.length > 0,
			atLeastOneNewPhotoLeftAfterRemoval: (ctx) => ctx.files.length > 1,
			atLeastOnePreExistingPhotoLeft: (ctx) => ctx.preExistingPhotos.length > 0,
		},
	},
);

export const slideshowMachine = createMachine(
	{
		id: 'slideshow',
		initial: 'idle',
		context: {
			currentPage: 0,
			numberOfImages: 0,
		},
		states: {
			idle: {
				always: [
					{
						cond: (ctx) => ctx.numberOfImages > 0,
						target: 'photos',
					},
					{
						target: 'noPhotos',
					},
				],
			},
			photos: {
				on: {
					PREVIOUS: {
						cond: 'notAtBeginningOfPhotos',
						actions: ['decrementPage'],
					},
					NEXT: [
						{
							cond: 'notAtEndOfPhotos',
							actions: ['incrementPage'],
						},
					],
				},
			},
			noPhotos: {
				type: 'final',
			},
		},
	},
	{
		actions: {
			decrementPage: assign({currentPage: (ctx) => ctx.currentPage - 1}),
			decrementPageOrZero: assign({currentPage: (ctx) => Math.max(ctx.currentPage - 1, 0)}),
			incrementPage: assign({currentPage: (ctx) => ctx.currentPage + 1}),
		},
		guards: {
			notAtBeginningOfPhotos: (ctx) => ctx.currentPage > 0,
			notAtEndOfPhotos: (ctx) => ctx.currentPage < ctx.numberOfImages - 1,
		},
	},
);

export const ProfileMenuContext = createContext([]);
export const profileMenuMachine = createMachine({
	id: 'profile-menu',
	initial: 'closed',
	states: {
		closed: {
			on: {
				HOVER_START: 'partiallyOpen.hover',
				FOCUS: 'partiallyOpen.focus',
				TAP_TOGGLE: 'open',
			},
		},
		partiallyOpen: {
			initial: 'focus',
			states: {
				hover: {on: {HOVER_END: '#profile-menu.closed'}},
				focus: {on: {BLUR: '#profile-menu.closed'}},
			},
			on: {TAP_TOGGLE: 'open'},
		},
		open: {
			initial: 'profile',
			on: {
				TAP_AWAY: 'closed',
				TAP_TOGGLE: 'partiallyOpen',
				ESC: 'partiallyOpen',
			},
			states: {
				profile: {
					on: {
						OPEN_SHARE_MENU: 'share',
					},
				},
				share: {
					on: {
						MENU_BACK: 'profile',
						SHARE_CHARACTER: '#profile-menu.closed',
						VIEW_SHARED: '#profile-menu.closed',
					},
				},
			},
		},
	},
});

/**
 *
 * @param {{
 * 	onDone?: any,
 * 	onError?: any,
 * 	valueKey?: string,
 * 	valueFrom?: 'event' | 'context',
 * }} options
 */
function makeCopyState({
	onDone = 'copied',
	onError = 'notCopied',
	valueKey = 'value',
	valueFrom = 'event',
}) {
	return {
		invoke: {
			src: async (context, event) => {
				let {clipboard} = navigator;
				// @ts-ignore
				if (!clipboard) clipboard = await import('clipboard-polyfill');

				if (valueFrom === 'event') await clipboard.writeText(event[valueKey]);
				else if (valueFrom === 'context') await clipboard.writeText(context[valueKey]);
			},
			onDone,
			onError,
		},
	};
}

export const ShareContext = createContext([]);
/**
 * @type {import('xstate').StateMachine<
 * 	{characterId: string, url: string, alias: string, userId: string, shareIdsToRevoke: Set<string>},
 * 	import('xstate').EventObject & ({characterId: string} | {url: string} | {shareIdsToRevoke: string[]}),
 * >}
 */
export const shareMachine = createMachine({
	id: 'share',
	initial: 'viewCharacters',
	context: {
		characterId: '', url: '', alias: '', userId: '', shareIdsToRevoke: new Set(),
	},
	states: {
		viewCharacters: {
			on: {
				SHARE_CHARACTER: 'shareCharacters',
				VIEW_SHARED: 'viewShares',
			},
		},
		shareCharacters: {
			initial: 'idle',
			states: {
				idle: {
					on: {
						SHARING_CHARACTER: {
							target: 'confirming',
							actions: ['setCharacterId'],
						},
						CANCEL: '#share.viewCharacters',
						VIEW_SHARED: '#share.viewShares',
					},
				},
				confirming: {
					on: {
						CONFIRMED: {
							target: 'sharing',
							actions: ['setAlias'],
						},
						DISMISS: 'idle',
					},
				},
				sharing: {
					invoke: {
						src: async (context) => {
							const shareReference = firestore.collection('shares').doc();
							await shareReference.set({
								alias: context.alias,
								roles: {owner: context.userId},
								characterId: context.characterId,
							});
							return `${window.location.origin}/shared-character/${shareReference.id}`;
						},
						onDone: {
							target: 'showUrl',
							actions: ['setUrl'],
						},
						onError: 'failure',
					},
				},
				showUrl: {
					exit: ['clearCharacterInfo'],
					on: {
						DISMISS: 'idle',
						VIEW_SHARED: '#share.viewShares',
					},
					initial: 'idle',
					states: {
						idle: {
							on: {
								COPY: 'copying',
							},
						},
						copying: makeCopyState({
							valueKey: 'url',
							valueFrom: 'context',
						}),
						copied: {
							on: {
								COPY: 'copying',
							},
						},
						notCopied: {
							on: {
								COPY: 'copying',
							},
						},
					},
				},
				failure: {
					on: {
						DISMISS: 'idle',
					},
				},
			},
		},
		viewShares: {
			initial: 'idle',
			states: {
				idle: {
					on: {
						REVOKE_SHARES: {
							target: 'revokingShare',
							actions: ['setShareIdsToRevoke'],
						},
						DISMISS: '#share.viewCharacters',
						COPY: 'copying',
					},
					initial: 'none',
					states: {
						none: {},
						revoked: {},
						notRevoked: {},
						copied: {},
						notCopied: {},
					},
				},
				revokingShare: {
					invoke: {
						src: (context) => {
							const promises = [];
							for (const shareId of context.shareIdsToRevoke) {
								promises.push(firestore.collection('shares').doc(shareId).delete());
							}
							return Promise.all(promises);
						},
						onDone: 'idle.revoked',
						onError: 'idle.notRevoked',
					},
				},
				copying: makeCopyState({
					valueKey: 'shareId',
					valueFrom: 'event',
					onDone: 'idle.copied',
					onError: 'idle.notCopied',
				}),
			},
		},
	},
}, {
	actions: {
		setShareIdsToRevoke: assign({
			shareIdsToRevoke: (ctx, event) => new Set(event.shareIdsToRevoke),
		}),
		setCharacterId: assign({
			characterId: (ctx, event) => event.characterId,
		}),
		setAlias: assign({
			alias: (ctx, event) => event.alias,
		}),
		setUrl: assign({
			url: (ctx, event) => event.data,
		}),
		clearCharacterInfo: assign((ctx) => ({
			...ctx, characterId: '', url: '', alias: '',
		})),
	},
});

const gravatarCache = new Map();
async function fetchGravatarThumbnail(email) {
	if (gravatarCache.has(email)) return gravatarCache.get(email);

	const profileURL = gravatar.profile_url(email);
	try {
		const data = await corsAnywhere
			.get(profileURL, {
				// @ts-ignore
				responseType: 'json',
				headers: {
					'X-Requested-With': 'ky',
				},
			})
			.json();
		const photoURL = data.entry[0].thumbnailUrl;

		try {
			const blob = await corsAnywhere.get(photoURL).blob();
			const url = URL.createObjectURL(blob);
			gravatarCache.set(email, url);
			return url;
		} catch (error) {
			throw new UnreachableGravatarPhotoError(email, error?.response);
		}
	} catch (error) {
		if (error instanceof UnreachableGravatarPhotoError) throw error;
		else if (error?.response?.status === 404) throw new MissingGravatarProfileError(email, error?.response);
		else throw new UnreachableGravatarProfileError(email, error?.response);
	}
}
export const gravatarMachine = createMachine({
	id: 'gravatar',
	initial: 'idle',
	context: {url: null, error: null},
	states: {
		idle: {
			initial: 'initial',
			states: {
				initial: {},
				found: {
					type: 'final',
				},
				non_existent: {
					type: 'final',
				},
				failure: {
					type: 'final',
				},
			},
			on: {FETCH: 'loading'},
		},
		loading: {
			invoke: {
				src: (ctx, event) => fetchGravatarThumbnail(event.email),
				onDone: {
					actions: assign({url: (ctx, event) => event.data}),
					target: 'idle.found',
				},
				onError: [
					{
						cond: (ctx, event) => event?.data instanceof MissingGravatarProfileError,
						target: 'idle.non_existent',
					},
					{
						actions: assign({
							error(ctx, event) {
								return event?.data;
							},
						}),
						target: 'idle.failure',
					},
				],
			},
			on: {FETCH: 'loading'},
		},
	},
});

export const saveCharacterMachine = createMachine(
	{
		id: 'save-character',
		initial: 'idle',
		context: {
			mode: '',
			characterId: '',
			fileIds: [],
			error: null,
			name: '',
			story: '',
			files: [],
			preExistingPhotos: [],
			uid: '',
		},
		states: {
			idle: {
				entry: assign({
					characterId: (ctx) => ctx.characterId || uuidv1(),
				}),
				on: {
					SAVE_NEW_CHARACTER: {
						target: 'uploadingFiles',
						actions: [assign({mode: 'new'})],
					},
					SAVE_CHARACTER_EDITS: {
						target: 'uploadingFiles',
						actions: [assign({mode: 'edit'})],
					},
				},
			},
			uploadingFiles: {
				entry: ['getUploadInformation', 'createIdsForNewPhotos'],
				invoke: {
					src: ({files, fileIds, uid}) => Promise.all(
						files.map((file, index) => {
							const ref = storage.ref().child(`${uid}/${fileIds[index]}`);
							return ref.put(file);
						}),
					),
					onDone: [
						{
							cond: 'isNewCharacter',
							target: 'saving.new',
						},
						{
							target: 'saving.edits',
						},
					],
					onError: {
						actions: ['cleanUpFileTransfers', 'setError'],
						target: 'finished.error',
					},
				},
			},
			saving: {
				states: {
					new: {
						invoke: {
							src: ({
								characterId, fileIds, name, story, uid,
							}) => firestore
								.collection('characters')
								.doc(characterId)
								.set({
									files: fileIds, name, story, roles: {owner: uid},
								}),
							onDone: '#save-character.finished.success',
							onError: {
								target: '#save-character.finished.error',
								actions: ['setError', 'cleanUpFileTransfers'],
							},
						},
					},
					edits: {
						invoke: {
							src: ({
								characterId, preExistingPhotos, fileIds, name, story,
							}) => {
								const newFiles = preExistingPhotos
									.filter((photo) => !photo.scheduledForRemoval)
									.map((photo) => photo.id)
									.concat(fileIds);

								return firestore
									.collection('characters')
									.doc(characterId)
									.update({files: newFiles, name, story});
							},
							onDone: 'scheduledRemoval',
							onError: {
								target: '#save-character.finished.error',
								actions: ['setError', 'cleanUpFileTransfers'],
							},
						},
					},
					scheduledRemoval: {
						invoke: {
							src: ({uid, preExistingPhotos}) => Promise.all(
								preExistingPhotos
									.filter((photo) => photo.scheduledForRemoval)
									.map((photo) => storage
										.ref()
										.child(`${uid}/${photo.id}`)
										.delete()
										.catch((error) => {
											// eslint-disable-next-line max-len
											console.warn(`Failed to delete pre-existing art ${uid}/${photo.id}:`, error);
										})),
							),
							onDone: '#save-character.finished.success',
							onError: '#save-character.finished.error',
						},
					},
				},
			},
			finished: {
				states: {
					success: {type: 'final'},
					error: {type: 'final'},
				},
			},
		},
	},
	{
		actions: {
			getUploadInformation: assign(({mode}, {
				// @ts-ignore
				name, story, files, uid, preExistingPhotos, characters,
			}) => {
				if (mode === 'new') {
					return {
						name, story, files, uid,
					};
				}

				if (mode === 'edit') {
					return {
						name, story, preExistingPhotos, files, uid, characters,
					};
				}

				return {};
			}),
			createIdsForNewPhotos: assign({
				fileIds: ({files}) => files.map(() => uuidv1()),
			}),
			setError: assign({
				// @ts-ignore
				error: (ctx, {data: error}) => {
					console.warn('An error occurred while saving your character:', error);
					return error;
				},
			}),
			cleanUpFileTransfers({fileIds, uid}) {
				for (const fileId of fileIds) {
					storage
						.ref()
						.child(`${uid}/${fileId}`)
						.delete()
						.catch((error) => console.warn(`Failed to delete new art ${uid}/${fileId}:`, error));
				}
			},
		},
		guards: {
			isNewCharacter: (ctx) => ctx.mode === 'new',
		},
	},
);
