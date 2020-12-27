import {assign, createMachine} from 'xstate'
import gravatar from 'gravatar'
import {v1 as uuidv1} from 'uuid'

import * as firebase from 'firebase'
import {firestore, storage, corsAnywhere} from './firebase.js'
import {MissingGravatarProfileError, UnreachableGravatarPhotoError, UnreachableGravatarProfileError} from './errors'
import {removeFromArray, replaceInArray} from './helpers'

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
			decrementPage: assign({currentPage: ctx => ctx.currentPage - 1}),
			decrementPageOrZero: assign({currentPage: ctx => Math.max(ctx.currentPage - 1, 0)}),
			incrementPage: assign({currentPage: ctx => ctx.currentPage + 1}),
			goToFirstPage: assign({currentPage: 0}),
			goToLastPageOfPreExistingPhotos: assign({currentPage: ctx => ctx.preExistingPhotos.length - 1}),
			goToLastPageOfNewPhotos: assign({currentPage: ctx => ctx.files.length - 1}),
			removeNewPhoto: assign({
				files: ({files, currentPage}) => removeFromArray(files, currentPage),
			}),
			addNewPhotos: assign({
				files: (ctx, event) => ctx.files.concat(event.data),
			}),
			scheduleForRemoval: assign({
				preExistingPhotos: ({preExistingPhotos, currentPage}) =>
					replaceInArray(preExistingPhotos, currentPage, photo => ({...photo, scheduledForRemoval: true})),
			}),
			cancelRemoval: assign({
				preExistingPhotos: ({preExistingPhotos, currentPage}) =>
					replaceInArray(preExistingPhotos, currentPage, photo => ({...photo, scheduledForRemoval: false})),
			}),
		},
		guards: {
			atEndOfPreExistingPhotos: ctx => ctx.currentPage >= ctx.preExistingPhotos.length - 1,
			atEndOfPreExistingPhotosButNewPhotosRemain: ctx =>
				ctx.currentPage >= ctx.preExistingPhotos.length - 1 && ctx.files.length > 0,
			noPreExistingPhotos: ctx => ctx.preExistingPhotos.length === 0,
			notAtBeginning: ctx => ctx.currentPage > 0,
			atEndOfNewPhotos: ctx => ctx.currentPage >= ctx.files.length - 1,
			atLeastOneNewPhotoLeft: ctx => ctx.files.length > 0,
			atLeastOneNewPhotoLeftAfterRemoval: ctx => ctx.files.length > 1,
			atLeastOnePreExistingPhotoLeft: ctx => ctx.preExistingPhotos.length > 0,
		},
	},
)

export const plainSlideshowMachine = createMachine(
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
						cond: ctx => ctx.numberOfImages > 0,
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
			decrementPage: assign({currentPage: ctx => ctx.currentPage - 1}),
			decrementPageOrZero: assign({currentPage: ctx => Math.max(ctx.currentPage - 1, 0)}),
			incrementPage: assign({currentPage: ctx => ctx.currentPage + 1}),
		},
		guards: {
			notAtBeginningOfPhotos: ctx => ctx.currentPage > 0,
			notAtEndOfPhotos: ctx => ctx.currentPage < ctx.numberOfImages - 1,
		},
	},
)

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
			on: {
				TAP_AWAY: 'closed',
				TAP_TOGGLE: 'partiallyOpen',
				ESC: 'partiallyOpen',
			},
		},
	},
})

const gravatarCache = new Map()
async function fetchGravatarThumbnail(email) {
	if (gravatarCache.has(email)) return gravatarCache.get(email)

	const profileURL = gravatar.profile_url(email)
	try {
		const data = await corsAnywhere
			.get(profileURL, {
				responseType: 'json',
				headers: {
					'X-Requested-With': 'ky',
				},
			})
			.json()
		const photoURL = data.entry[0].thumbnailUrl

		try {
			const blob = await corsAnywhere.get(photoURL).blob()
			const url = URL.createObjectURL(blob)
			gravatarCache.set(email, url)
			return url
		} catch (error) {
			throw new UnreachableGravatarPhotoError(email, error?.response)
		}
	} catch (error) {
		if (error instanceof UnreachableGravatarPhotoError) throw error
		else if (error?.response?.status === 404) throw new MissingGravatarProfileError(email, error?.response)
		else throw new UnreachableGravatarProfileError(email, error?.response)
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
						cond: (ctx, event) => {
							return event?.data instanceof MissingGravatarProfileError
						},
						target: 'idle.non_existent',
					},
					{
						actions: assign({
							error(ctx, event) {
								console.log(event?.data)
								return event?.data
							},
						}),
						target: 'idle.failure',
					},
				],
			},
			on: {FETCH: 'loading'},
		},
	},
})

export const newCharacterMachine = createMachine(
	{
		id: 'new-character',
		initial: 'idle',
		context: {
			characterID: '',
			fileIDs: [],
			error: null,
			name: '',
			story: '',
			files: [],
			uid: '',
		},
		states: {
			idle: {
				entry: assign({
					characterID: () => uuidv1(),
				}),
				on: {
					SAVE: {
						actions: ['getUploadInformation'],
						target: 'uploadingFiles',
					},
				},
			},
			uploadingFiles: {
				entry: ['createIDs'],
				invoke: {
					src: ({files, fileIDs, uid}, event) => {
						return Promise.all(
							files.map((file, index) => {
								const ref = storage.ref().child(`${uid}/${fileIDs[index]}`)
								return ref.put(file)
							}),
						)
					},
					onDone: 'updatingCharacterInfo',
					onError: {
						action: ['cleanUpFileTransfers', 'setError'],
						target: 'finished.error',
					},
				},
			},
			updatingCharacterInfo: {
				invoke: {
					src: ({characterID, fileIDs, name, story, uid}) => {
						return firestore
							.collection('users')
							.doc(uid)
							.update({
								characters: firebase.firestore.FieldValue.arrayUnion({
									id: characterID,
									files: fileIDs,
									name,
									story,
								}),
							})
					},
					onDone: 'finished.success',
					onError: {
						target: 'finished.error',
						actions: ['setError', 'cleanUpFileTransfers'],
					},
				},
			},
			finished: {
				initial: 'error',
				states: {
					success: {type: 'final'},
					error: {type: 'final'},
				},
			},
		},
	},
	{
		actions: {
			getUploadInformation: assign((ctx, {name, story, files, uid}) => {
				return {name, story, files, uid}
			}),
			createIDs: assign({
				fileIDs: ({files}) => files.map(() => uuidv1()),
			}),
			setError: assign({error: (ctx, event) => event.data}),
			cleanUpFileTransfers({fileIDs, uid}) {
				for (const fileID of fileIDs) {
					storage
						.ref()
						.child(`${uid}/${fileID}`)
						.delete()
						.catch(error => console.warn(`Failed to delete art ${uid}/${fileID}:`, error))
				}
			},
		},
	},
)
