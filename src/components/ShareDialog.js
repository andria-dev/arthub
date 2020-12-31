import {Dialog, DialogParagraph, DialogTitle} from './Dialog'

export function ShareDialog({isOpen, onDismiss, character}) {
	return (
		<Dialog isOpen={isOpen} onDismiss={onDismiss}>
			<DialogTitle style={{textAlign: 'center'}}>Shared-Link Details</DialogTitle>
			<DialogParagraph>
				You are creating a public link for sharing your character <strong>{character.name}</strong>.
			</DialogParagraph>

			<form>t</form>
		</Dialog>
	)
}
