import {DialogContent, DialogOverlay} from '@reach/dialog'
import {Text} from '@fluentui/react'
import {colors} from '../shared/theme'
import {Image} from '@fluentui/react'

const overlayStyle = {
	backgroundColor: 'rgba(88, 38, 14, 0.81)',
	position: 'absolute',
	top: 0,
	left: 0,
	width: '100vw',
	height: '100vh',
	display: 'grid',
	placeItems: 'center',
}
const dialogStyle = {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'flex-start',
	alignItems: 'center',
	width: 'calc(100vw - 18px * 4)',
	maxWidth: '30rem',
	padding: '19px 18px',
	backgroundColor: '#ebebeb',
	borderRadius: 7,
	boxShadow: `0px 2px 5px 0px ${colors.orangeShadow}`,
}

const lavaLamp = <Image src="/lava-lamp.svg" alt="Lava lamp upload animation" width={170} height={170} />
const statusData = {
	uploadingFiles: {
		title: 'Saving',
		image: lavaLamp,
		message: 'Your art is being uploaded!',
	},
	updatingCharacterInfo: {
		title: 'Saving',
		image: lavaLamp,
		message: 'Sending over your character!',
	},
	'finished.error': {
		title: 'Unable to Save',
		image: null, // TODO: replace with fabric icon "Error"
		message: 'An error occurred while uploading your character.',
	},
}

export function SavingDialog({isOpen, status}) {
	const {title, image, message} = statusData[status] ?? {}
	return (
		<DialogOverlay isOpen={isOpen} style={overlayStyle}>
			<DialogContent style={dialogStyle} aria-labelledby="saving-title">
				<Text id="saving-title" variant="title" as="h1" style={{margin: 0, marginBottom: 20}}>
					{title}
				</Text>
				{image}
				<Text variant="medium">{message}</Text>
			</DialogContent>
		</DialogOverlay>
	)
}
