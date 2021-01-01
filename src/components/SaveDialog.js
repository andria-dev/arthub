import {Image} from '@fluentui/react';
import {Dialog, DialogParagraph, DialogTitle} from './Dialog.js';

const lavaLamp = <Image src="/lava-lamp.svg" alt="Lava lamp upload animation" width={170} height={170} />;
const uploadingFilesData = {
	title: 'Saving',
	image: lavaLamp,
	message: 'Your art is being uploaded!',
};
const savingData = {
	title: 'Saving',
	image: lavaLamp,
	message: 'Sending over your character!',
};
const errorData = {
	title: 'Unable to Save',
	image: null, // TODO: replace with fabric icon "Error"
	message: 'An error occurred while uploading your character.',
};
function getStatusData(matches) {
	if (matches('uploadingFiles')) return uploadingFilesData;
	if (matches('saving')) return savingData;
	if (matches('finished.error')) return errorData;
	return {};
}

export function SaveDialog({isOpen, matches}) {
	const {title, image, message} = getStatusData(matches);
	return (
		<Dialog isOpen={isOpen}>
			<DialogTitle>{title}</DialogTitle>
			{image}
			<DialogParagraph>{message}</DialogParagraph>
		</Dialog>
	);
}
