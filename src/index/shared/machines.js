import {assign, Machine} from 'xstate'
import {functions} from '../../shared/firebase'

export const slideshowMachine = Machine(
	{
		id: 'slideshow',
		initial: 'noPhotos',
		context: {currentPage: 0, files: []},
		states: {
			photos: {
				on: {
					PREVIOUS: {
						actions: ['decrementPage'],
						cond: 'notAtBeginningOfPhotos',
					},
					NEXT: [
						{
							target: 'newPhoto',
							cond: 'atEndOfPhotos',
						},
						{
							actions: ['incrementPage'],
						},
					],
					REMOVED_PHOTO: [
						{
							actions: ['removePhoto', 'decrementPageOrZero'],
							cond: 'atLeastOnePhotoLeft',
						},
						{
							target: 'noPhotos',
							actions: ['removePhoto'],
						},
					],
				},
			},
			newPhoto: {
				on: {
					PREVIOUS: 'photos',
					ADDED_PHOTOS: {
						target: 'photos',
						actions: ['incrementPage', 'addPhotos'],
					},
				},
			},
			noPhotos: {
				on: {
					ADDED_PHOTOS: {
						target: 'photos',
						actions: ['addPhotos'],
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
	const blob = await functions.get(`gravatar?email=${email}`).blob()
	return URL.createObjectURL(blob)
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
				onDone: [
					{
						target: 'idle.found',
						actions: assign({url: (ctx, event) => event.data}),
					},
				],
				onError: [
					{
						target: 'idle.non_existent',
						cond: (ctx, event) => {
							return event?.data?.response?.status === 404
						},
					},
					{
						target: 'idle.failure',
						actions: assign({error: (ctx, event) => event?.data}),
					},
				],
			},
			on: {FETCH: 'loading'},
		},
	},
})
