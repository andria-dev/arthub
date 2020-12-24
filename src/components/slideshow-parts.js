import {ActionButton} from './action-button'
import {colors} from '../shared/theme'

export const artworkWrapperStyles = {
	position: 'relative',
	backgroundColor: colors.lightOrange,
	width: '100%',
	height: 262,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
}
export const artworkStyles = {
	objectFit: 'contain',
	maxWidth: '100%',
	maxHeight: '100%',
}

const nextButtonStyles = {
	position: 'absolute',
	bottom: 0,
	right: 0,
	width: 46,
	height: 46,
	borderRadius: 0,
	borderTopLeftRadius: 8,
}
export function NextButton(props) {
	return (
		<ActionButton
			iconName="Forward"
			variant="round-orange"
			type="button"
			title="Next"
			aria-label="Next"
			style={nextButtonStyles}
			{...props}
		/>
	)
}

const previousButtonStyles = {
	position: 'absolute',
	top: 0,
	left: 0,
	width: 46,
	height: 46,
	borderRadius: 0,
	borderBottomRightRadius: 8,
}
export function PreviousButton(props) {
	return (
		<ActionButton
			iconName="Back"
			variant="round-orange"
			type="button"
			title="Previous"
			aria-label="Previous"
			style={previousButtonStyles}
			{...props}
		/>
	)
}
