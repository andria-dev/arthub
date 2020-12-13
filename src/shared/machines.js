import {assign, Machine, spawn} from 'xstate'
import gravatar from 'gravatar'
import {MissingGravatarProfileError, UnreachableGravatarPhotoError, UnreachableGravatarProfileError} from './errors'
import {corsAnywhere} from './firebase'
import {v1 as uuidv1} from 'uuid'
import * as firebase from 'firebase'

export const uploadSlideshowMachine = Machine(
	{
		id: 'upload-slideshow',
		initial: 'noPhotos',
		context: {currentPage: 0, files: []},
		states: {
			photos: {
				on: {
					PREVIOUS: {
						cond: 'notAtBeginningOfPhotos',
						actions: ['decrementPage'],
					},
					NEXT: [
						{
							cond: 'atEndOfPhotos',
							target: 'newPhoto',
						},
						{
							actions: ['incrementPage'],
						},
					],
					REMOVED_PHOTO: [
						{
							cond: 'atLeastOnePhotoLeft',
							actions: ['removePhoto', 'decrementPageOrZero'],
						},
						{
							actions: ['removePhoto'],
							target: 'noPhotos',
						},
					],
				},
			},
			newPhoto: {
				on: {
					PREVIOUS: 'photos',
					ADDED_PHOTOS: {
						actions: ['incrementPage', 'addPhotos'],
						target: 'photos',
					},
				},
			},
			noPhotos: {
				on: {
					ADDED_PHOTOS: {
						actions: ['addPhotos'],
						target: 'photos',
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
			removePhoto: assign({
				files(ctx) {
					return [...ctx.files.slice(0, ctx.currentPage), ...ctx.files.slice(ctx.currentPage + 1)]
				},
			}),
			addPhotos: assign({
				files(ctx, event) {
					return ctx.files.concat(event.data)
				},
			}),
		},
		guards: {
			notAtBeginningOfPhotos: ctx => ctx.currentPage > 0,
			atEndOfPhotos: ctx => ctx.currentPage >= ctx.files.length - 1,
			atLeastOnePhotoLeft: ctx => ctx.files.length > 1,
		},
	},
)

const imageDataURLMap = new Map()
/**
 * Retrieves the URL of an image from a file ID then fetches the image and caches and returns the data URL.
 * @param storage
 * @param userID
 * @param fileID
 * @returns {Promise<string|any>}
 */
async function fetchImageURL({storage, userID, fileID}) {
	if (imageDataURLMap.has(fileID)) return imageDataURLMap.get(fileID)

	const url = await storage.ref().child(`${userID}/${fileID}`).getDownloadURL()
	return await fetch(url)
		.then(res => res.blob())
		.then(blob => {
			const dataURL = URL.createObjectURL(blob)
			imageDataURLMap.set(fileID, dataURL)
			return dataURL
		})
}

// TODO: onError needs to log the error
export const ImageLoadingMachine = Machine({
	id: 'image-loading-machine',
	initial: 'fetching',
	context: {imageURL: ''},
	states: {
		fetching: {
			invoke: {
				src: fetchImageURL,
				onDone: {
					actions: assign({
						imageURL: (ctx, event) => event.data,
					}),
					target: 'loaded',
				},
				onError: 'failed',
			},
		},
		loaded: {type: 'final'},
		failed: {
			on: {
				RETRY: 'fetching',
			},
		},
	},
})

export const plainSlideshowMachine = Machine(
	{
		id: 'slideshow',
		initial: 'idle',
		context: {
			currentPage: 0,
			fileIDs: [],
			imageURLs: [],
			storage: null,
			userID: null,
		},
		states: {
			idle: {
				always: [
					{
						cond: ctx => ctx.fileIDs.length > 0,
						target: 'photos',
					},
					{
						target: 'noPhotos',
					},
				],
			},
			photos: {
				entry: ['spawnImageLoaders'],
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
			spawnImageLoaders: assign({
				imageURLs: ctx =>
					ctx.fileIDs.map(id =>
						spawn(
							ImageLoadingMachine.withContext({
								storage: ctx.storage,
								userID: ctx.userID,
								fileID: id,
							}),
							{
								name: id,
								sync: true,
							},
						),
					),
			}),
		},
		guards: {
			notAtBeginningOfPhotos: ctx => ctx.currentPage > 0,
			notAtEndOfPhotos: ctx => ctx.currentPage < ctx.files.length - 1,
		},
	},
)

export const profileMenuMachine = Machine({
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

async function fetchGravatarThumbnail(email) {
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
			return URL.createObjectURL(blob)
		} catch (error) {
			throw new UnreachableGravatarPhotoError(email, error?.response)
		}
	} catch (error) {
		if (error instanceof UnreachableGravatarPhotoError) throw error
		else if (error?.response?.status === 404) throw new MissingGravatarProfileError(email, error?.response)
		else throw new UnreachableGravatarProfileError(email, error?.response)
	}
}
export const gravatarMachine = Machine({
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

export const newCharacterMachine = Machine(
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
			storage: null,
			firestore: null,
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
					src: ({files, fileIDs, storage, uid}, event) => {
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
					src: ({characterID, fileIDs, firestore, name, story, uid}) => {
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
			getUploadInformation: assign((ctx, {name, story, files, uid, storage, firestore}) => {
				return {name, story, files, uid, storage, firestore}
			}),
			createIDs: assign({
				fileIDs: ({files}) => files.map(() => uuidv1()),
			}),
			setError: assign({error: (ctx, event) => event.data}),
			cleanUpFileTransfers({fileIDs, storage, uid}) {
				for (const fileID of fileIDs) {
					storage
						.ref()
						.child(`${uid}/${fileID}`)
						.delete()
						.catch(() => {})
				}
			},
		},
	},
)
