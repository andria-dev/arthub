import {useEffect, useState} from 'react'

import {motion} from 'framer-motion'
import {debounce} from 'mini-debounce'
import {useMachine} from '@xstate/react'
import {useHistory} from 'react-router-dom'
import {useId} from '@uifabric/react-hooks'
import {Text, Label, FontIcon} from '@fluentui/react'
import {useDropzone} from 'react-dropzone'

import {ActionButton} from '../components/action-button.js'
import {SavingDialog} from '../components/saving-dialog.js'
import {useUser} from '../shared/firebase.js'
import {newCharacterMachine, uploadSlideshowMachine} from '../shared/machines.js'
import {AutoExpandingTextarea} from '../components/auto-expanding-textarea.js'
import {NextButton, artworkStyles, artworkWrapperStyles, PreviousButton} from '../components/slideshow-parts.js'
import {CharacterLayout} from '../components/character-parts.js'

import {colors} from '../shared/theme.js'
import '../styles/new-character.css'

const artistSVGStyles = {
	width: 298,
	height: 220,
	marginBottom: 5,
}
const removeButtonStyles = {
	position: 'absolute',
	top: 0,
	right: 0,
	width: 46,
	height: 46,
	borderRadius: 0,
	borderBottomLeftRadius: 8,
}

function NewCharacterInput({className, multiline, label, ...props}) {
	const [status, setStatus] = useState('idle')
	const focusHandlers = {
		onFocus() {
			setStatus('focus')
		},
		onBlur() {
			setStatus('idle')
		},
	}
	return (
		<div className={'NewCharacterInput ' + (className ?? '')}>
			{label && (
				<Label htmlFor={props.id} style={{textDecoration: status === 'focus' ? 'underline' : 'none'}}>
					{label}
				</Label>
			)}
			{multiline ? (
				<AutoExpandingTextarea fontSize={20} lineHeight={25} minimumRows={5} {...props} {...focusHandlers} />
			) : (
				<input {...props} {...focusHandlers} />
			)}
		</div>
	)
}

function clearStorage() {
	localStorage.setItem('character-name', '')
	localStorage.setItem('character-story', '')
}

const debouncedSetItem = debounce((key, value) => localStorage.setItem(key, value), 100)
function createValueStorer(key, setter) {
	return event => {
		const {value} = event.target

		setter(value)
		debouncedSetItem(key, value)
	}
}

const dropZoneMessages = {
	accepted: 'File is valid, drop it to upload it!',
	rejected: 'This file is not a valid photo.',
	idle: 'Drop your character photos above.',
}

function useSlideshow() {
	const [state, send] = useMachine(uploadSlideshowMachine)
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
	if (state.matches('noPhotos'))
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
	else if (state.matches('newPhoto'))
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
	else if (state.matches('photos'))
		slideshowSection = (
			<div style={artworkWrapperStyles}>
				{state.context.currentPage > 0 && previousButton}
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

	let dropMessageContent
	if (dropzone.isDragReject) dropMessageContent = dropZoneMessages.rejected
	else if (dropzone.isDragAccept) dropMessageContent = dropZoneMessages.accepted
	else dropMessageContent = dropZoneMessages.idle

	const dropID = useId('drop')
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
				htmlFor={dropID}
				variant="higherTitle"
				style={{textAlign: 'right', padding: '0 31px', marginTop: 10}}
			>
				{dropMessageContent}
			</Text>
		)

	return {
		...dropzone,
		dropID,
		dropMessage,
		slideshowSection,
		files: state.context.files,
	}
}

export function NewCharacter() {
	const nameFieldID = useId('name')
	const storyFieldID = useId('character-story')

	const user = useUser()
	const [name, setName] = useState(localStorage.getItem('character-name') ?? '')
	const [story, setStory] = useState(localStorage.getItem('character-story') ?? '')
	const {getInputProps, slideshowSection, dropMessage, dropID, files} = useSlideshow()

	const history = useHistory()
	function cancel() {
		clearStorage()
		history.replace('/')
	}

	const [saveState, send] = useMachine(newCharacterMachine)
	function save(event) {
		event.preventDefault()
		send('SAVE', {name, story, files, uid: user.uid})
	}

	useEffect(() => {
		if (saveState.matches({finished: 'success'})) {
			clearStorage()
			history.push(`/character/${saveState.context.characterID}`)
		}
	}, [history, saveState])

	return (
		<CharacterLayout
			mode="edit"
			onSubmit={save}
			slideshow={
				<div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
					{slideshowSection}
					<input id={dropID} {...getInputProps()} />
					{dropMessage}
				</div>
			}
			name={
				<NewCharacterInput
					id={nameFieldID}
					label="Name"
					placeholder="Lumiére"
					onChange={createValueStorer('character-name', setName)}
					value={name}
					required
				/>
			}
			story={
				<NewCharacterInput
					id={storyFieldID}
					label="Character Story"
					placeholder="Tell your characters story and explain their background..."
					className="CharacterStoryInput"
					onChange={createValueStorer('character-story', setStory)}
					value={story}
					multiline
					required
				/>
			}
			actions={
				<>
					<ActionButton key="cancel" variant="flat" iconName="Back" onClick={cancel} type="button">
						Cancel
					</ActionButton>
					<ActionButton key="save" variant="flat" iconName="Save" type="submit">
						Save
					</ActionButton>
				</>
			}
		>
			<SavingDialog
				isOpen={['uploadingFiles', 'updatingCharacterInfo', {finished: 'error'}].some(saveState.matches)}
				status={saveState.value}
			/>
		</CharacterLayout>
	)
}
