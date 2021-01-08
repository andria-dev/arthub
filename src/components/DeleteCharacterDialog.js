import {
	Dialog, DialogAction, DialogActionBar, DialogParagraph, DialogTitle,
} from './Dialog.js';

export function DeleteCharacterDialog({isOpen, onDismiss, confirm}) {
	return (
		<Dialog isOpen={isOpen} onDismiss={onDismiss}>
			<DialogTitle>Are you sure?</DialogTitle>
			<DialogParagraph>
				Deleting your character is permanent. You won't be able to restore this data at any point.
			</DialogParagraph>
			<DialogActionBar>
				<DialogAction variant="primary" onClick={confirm}>Yes, delete it</DialogAction>
				<DialogAction variant="secondary" onClick={onDismiss}>No, go back</DialogAction>
			</DialogActionBar>
		</Dialog>
	);
}
