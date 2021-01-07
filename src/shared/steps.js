import '../styles/Dialog.css';

const actions = {
	prev: {
		classes: 'Dialog__action Dialog__action--secondary',
		text: 'Previous',
		type: 'back',
	},
	next: {
		classes: 'Dialog__action Dialog__action--primary',
		text: 'Next',
		type: 'next',
	},
	done: {
		classes: 'Dialog__action Dialog__action--secondary',
		text: 'Done',
		type: 'cancel',
	},
};

export const tourOptions = {
	useModalOverlay: true,
	defaultStepOptions: {
		classes: 'TourDialog',
		cancelIcon: {enabled: false},
		buttons: [actions.done, actions.prev, actions.next],
		modalOverlayOpeningRadius: 8,
		modalOverlayOpeningPadding: 4,
	},
};

/** @type {import("react-shepherd").ShepherdOptionsWithType[]} */
export const steps = [
	{
		id: 'intro',
		text: 'Welcome to <strong>Art Hub</strong>, click Next to continue this walkthrough.',
		buttons: [actions.done, actions.next],
	},
	{
		attachTo: {element: '#profile-menu > div > button', on: 'bottom'},
		text: 'This button will open your profile menu. In it you can share characters,'
			+ ' view this tour, change settings, and sign out. Try it.',
		buttons: [actions.done, actions.prev],
	},
	{
		beforeShowPromise: () => new Promise((resolve) => setTimeout(resolve, 1000)),
		attachTo: {element: '#share-menu-button', on: 'bottom-start'},
		text: 'If you wish to share, or un-share, one of your characters you can go in here.',
		buttons: [actions.done, actions.prev, actions.next],
		canClickTarget: false,
	},
	{
		attachTo: {element: '#help-tour-button', on: 'bottom'},
		text: 'Clicking this button will re-initiate the tour.',
		buttons: [actions.done, actions.prev, actions.next],
		canClickTarget: false,
	},
	{
		attachTo: {element: '#sign-out-button', on: 'bottom'},
		text: 'Clicking this button will sign you out of your account.',
		buttons: [actions.done, actions.prev, actions.next],
		canClickTarget: false,
	},
	{
		attachTo: {element: '#new-character-button', on: 'top-end'},
		text: 'This is the New Character button. Clicking it will let you fill out'
			+ ' information for and upload photos of your character.',
		canClickTarget: false,
		buttons: [actions.done, actions.prev, actions.next],
		when: {
			show() {
				document.querySelector('#profile-menu-backdrop').click();
			},
		},
	},
	{
		text: 'That\'s all, from there everything else should be fairly self explanatory.',
		buttons: [actions.done],
	},
];
