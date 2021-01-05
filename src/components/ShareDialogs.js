import {useContext} from 'react';
import {Image} from '@fluentui/react';

import {
	Dialog, DialogParagraph, DialogTitle, DialogAction, DialogActionBar,
} from './Dialog.js';
import {TextInput} from './Input/Input.js';
import {ShareContext} from '../shared/machines.js';
import {useCharacters} from '../shared/firebase.js';

export function ConfirmShareDialog() {
	const [current, send] = useContext(ShareContext);
	const characters = useCharacters();
	const character = characters.find((currentCharacter) => currentCharacter.id === current.context.characterId);

	function handleSubmit(event) {
		event.preventDefault();
		send('CONFIRMED', {alias: event.target.linkAlias.value});
	}

	function dismiss() {
		send('DISMISS');
	}

	return (
		<Dialog isOpen={current.matches('shareCharacters.confirming')} onDismiss={dismiss}>
			<DialogTitle style={{textAlign: 'center'}}>Shared-Link Details</DialogTitle>
			<DialogParagraph style={{marginBottom: 20, textAlign: 'center'}}>
				You are creating a public link for sharing your character <strong>{character?.name}</strong>.
			</DialogParagraph>

			<form style={{width: '100%'}} onSubmit={handleSubmit}>
				<TextInput
					name="linkAlias"
					label="Link alias"
					placeholder="Jane's link..."
					frameProps={{style: {width: '100%'}}}
					required
				/>
				<DialogActionBar>
					<DialogAction variant="primary" type="submit">Confirm</DialogAction>
					<DialogAction variant="secondary" onClick={dismiss}>Cancel</DialogAction>
				</DialogActionBar>
			</form>
		</Dialog>
	);
}

export function SharingCharacterDialog() {
	const [current] = useContext(ShareContext);

	return (
		<Dialog isOpen={current.matches('shareCharacters.sharing')}>
			<DialogTitle style={{textAlign: 'center'}}>Sharing!</DialogTitle>
			<Image src="/lava-lamp.svg" alt="Lava lamp upload animation" width={170} height={170} />
		</Dialog>
	);
}

export function ShowShareUrlDialog() {
	const [current, send] = useContext(ShareContext);

	function dismiss() {
		send('DISMISS');
	}

	return (
		<Dialog isOpen={current.matches('shareCharacters.showUrl')} onDismiss={dismiss}>
			<DialogTitle style={{textAlign: 'center'}}>Here's your link!</DialogTitle>
			<DialogParagraph style={{textAlign: 'center'}}>
				Give this link to your friends and they will be able to see your cool character!
			</DialogParagraph>
			<div style={{display: 'flex', alignItems: 'flex-end'}}>
				<TextInput
					label="Your link"
					frameProps={{width: '100%'}}
					value={current.context.url}
					readOnly
				/>
				<DialogAction
					variant="tertiary"
					style={{marginLeft: '10px', minWidth: '80px'}}
					onClick={() => send('COPY')}
				>
					Copy
				</DialogAction>
			</div>
			{current.matches('shareCharacters.showUrl.copied') && <DialogParagraph>Copied!</DialogParagraph>}
			{current.matches('shareCharacters.showUrl.notCopied') && <DialogParagraph>Not copied</DialogParagraph>}
			<DialogActionBar>
				<DialogAction variant="primary" onClick={dismiss}>Done</DialogAction>
				<DialogAction variant="secondary" onClick={() => send('VIEW_LINKS')}>View Links</DialogAction>
			</DialogActionBar>
		</Dialog>
	);
}
