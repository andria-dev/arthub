import {ActionButton} from './ActionButton'
import {colors} from '../shared/theme'
import {useMachine} from '@xstate/react'
import {uploadSlideshowMachine} from '../shared/machines'
import {useDropzone} from 'react-dropzone'
import {FontIcon, Text} from '@fluentui/react'
import {useId} from '@reach/auto-id'
import {emptyArray} from '../shared/empty'
import {Center} from './Center'

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
	zIndex: 2,
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

export const artistSVGStyles = {
	width: 298,
	height: 220,
	marginBottom: 5,
}
export const removeButtonStyles = {
	position: 'absolute',
	top: 0,
	right: 0,
	width: 46,
	height: 46,
	borderRadius: 0,
	borderBottomLeftRadius: 8,
}
export const dropZoneMessages = {
	accepted: 'File is valid, drop it to upload it!',
	rejected: 'This file is not a valid photo.',
	idle: 'Drop your character photos above.',
}

/**
 * Handles Suspense part of rendering a pre-existing photo for the character editor
 * @param {ResourceReader<string>} resource
 * @returns {JSX.Element}
 * @constructor
 */
function PreExistingPhoto({resource}) {
	return <img src={resource.read()} alt="" style={artworkStyles} />
}
/**
 *
 * @param {[{id: string, resource: ResourceReader<string>, scheduledForRemoval: boolean}]} preExistingPhotos
 * @returns {{preExistingPhotos: ([]|*), fileRejections: FileRejection[], isFileDialogActive: boolean, dropMessage: JSX.Element, inputRef: React.RefObject<HTMLInputElement>, isDragReject: boolean, isFocused: boolean, getInputProps(props?: DropzoneInputProps): DropzoneInputProps, acceptedFiles: File[], slideshowSection: JSX.Element, draggedFiles: File[], isDragAccept: boolean, rootRef: React.RefObject<HTMLElement>, getRootProps(props?: DropzoneRootProps): DropzoneRootProps, dropId: string, isDragActive: boolean, files, open(): void}}
 */
export function useSlideshow(preExistingPhotos = emptyArray) {
	const [state, send] = useMachine(
		uploadSlideshowMachine.withContext({
			...uploadSlideshowMachine.context,
			preExistingPhotos,
		}),
	)
	const dropzone = useDropzone({
		accept: 'image/*',
		onDropAccepted(acceptedFiles) {
			// handle cancelled file operations
			const filesWithPreview = acceptedFiles.map(file => {
				file.preview = URL.createObjectURL(file)
				return file
			})
			send('ADDED_PHOTOS', {data: filesWithPreview})
		},
	})

	const previousButton = <PreviousButton onClick={() => send('PREVIOUS')} />
	const nextButton = <NextButton onClick={() => send('NEXT')} />

	let slideshowSection
	if (state.matches('noPhotos')) {
		slideshowSection = (
			<div
				style={{
					position: 'relative',
					display: 'flex',
					justifyContent: 'center',
					width: 'calc(100% - 31px * 2)',
					padding: '45px 31px 0',
				}}
			>
				<img
					src="/artist-and-art.svg"
					alt="Artist looking at her art"
					className="drop-target"
					{...dropzone.getRootProps({style: artistSVGStyles})}
				/>
			</div>
		)
	} else if (state.matches('newPhotosPage')) {
		// TODO: Make drop target accessible
		slideshowSection = (
			<div style={artworkWrapperStyles}>
				{previousButton}
				<FontIcon
					iconName="Add"
					className="drop-target"
					{...dropzone.getRootProps({style: {color: colors.realPink, fontSize: 118}})}
				/>
			</div>
		)
	} else if (state.matches('newPhotos')) {
		slideshowSection = (
			<div style={artworkWrapperStyles}>
				{state.context.currentPage > 0 || state.context.preExistingPhotos.length > 0 ? previousButton : null}
				<img src={state.context.files[state.context.currentPage].preview} alt="" style={artworkStyles} />
				<ActionButton
					iconName="Delete"
					variant="round-orange"
					type="button"
					title="Remove photo"
					aria-label="Remove photo"
					onClick={() => send('REMOVED_PHOTO')}
					style={removeButtonStyles}
				/>
				{nextButton}
			</div>
		)
	} else if (state.matches('preExistingPhotos')) {
		const currentPhoto = state.context.preExistingPhotos[state.context.currentPage]
		slideshowSection = (
			<div style={artworkWrapperStyles}>
				{state.context.currentPage > 0 ? previousButton : null}
				<PreExistingPhoto resource={currentPhoto.resource} />
				{currentPhoto.scheduledForRemoval ? (
					<Center style={{position: 'absolute', background: 'hsl(0, 0%, 0%, 0.5)'}}>
						<p style={{color: colors.light, fontSize: 24, letterSpacing: 1}}>Scheduled for removal</p>
					</Center>
				) : null}
				{!currentPhoto.scheduledForRemoval ? (
					<ActionButton
						key="delete"
						iconName="Delete"
						variant="round-orange"
						type="button"
						title="Schedule for removal"
						aria-label="Schedule for removal"
						onClick={() => send('SCHEDULE_FOR_REMOVAL')}
						style={removeButtonStyles}
					/>
				) : (
					<ActionButton
						key="undo"
						iconName="Undo"
						variant="round-orange"
						type="button"
						title="Cancel removal"
						aria-label="Cancel removal"
						onClick={() => send('CANCEL_REMOVAL')}
						style={removeButtonStyles}
					/>
				)}
				{nextButton}
			</div>
		)
	}

	let dropMessageContent
	if (dropzone.isDragReject) dropMessageContent = dropZoneMessages.rejected
	else if (dropzone.isDragAccept) dropMessageContent = dropZoneMessages.accepted
	else dropMessageContent = dropZoneMessages.idle

	const dropId = useId('drop')
	let dropMessage
	/* TODO: align center on Desktop sizes */
	if (state.matches('photos'))
		dropMessage = (
			<Text variant="higherTitle" style={{textAlign: 'right', padding: '0 31px', marginTop: 10}}>
				Edit your character photos above.
			</Text>
		)
	else
		dropMessage = (
			<Text
				as="label"
				htmlFor={dropId}
				variant="higherTitle"
				style={{textAlign: 'right', padding: '0 31px', marginTop: 10}}
			>
				{dropMessageContent}
			</Text>
		)

	return {
		...dropzone,
		dropId,
		dropMessage,
		slideshowSection,
		files: state.context.files,
		preExistingPhotos: state.context.preExistingPhotos,
	}
}
