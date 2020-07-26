import React, {useState} from 'react'
import {useHistory} from 'react-router-dom'
import {motion} from 'framer-motion'
import {Text, Label} from '@fluentui/react'
import {useId} from '@uifabric/react-hooks'
import './new-character/new-character-styles.css'
import {colors} from '../shared/theme'
import {ActionButton} from './shared/action-button'
import {debounce} from 'mini-debounce'
import {v1 as uuidv1} from 'uuid'
import {useFirestore, useUser} from 'reactfire'
import {useDropzone} from 'react-dropzone'
import {useMachine} from '@xstate/react'
import {slideshowMachine} from './shared/machines'
import {FontIcon} from '@fluentui/react'
import {AutoExpandingTextarea} from './auto-expanding-textarea'

const artistSVGStyles = {
	width: 298,
	height: 220,
	marginBottom: 5,
}
const fadeStyles = {
	position: 'absolute',
	bottom: 0,
	left: 0,
	width: '100%',
	height: 96,
	background: 'linear-gradient(180deg, transparent 0%, hsla(0, 0%, 100%, 0.85) 100%)',
	pointerEvents: 'none',
}
const previewWrapperStyles = {
	position: 'relative',
	backgroundColor: colors.lightOrange,
	width: '100%',
	height: 262,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
}
const previewStyles = {
	objectFit: 'contain',
	maxWidth: '100%',
	maxHeight: '100%',
}
const previousButtonStyles = {
	position: 'absolute',
	top: 0,
	left: 0,
	width: 46,
	height: 46,
	borderBottomRightRadius: 8,
}
const nextButtonStyles = {
	position: 'absolute',
	bottom: 0,
	right: 0,
	width: 46,
	height: 46,
	borderTopLeftRadius: 8,
}
const removeButtonStyles = {
	position: 'absolute',
	top: 0,
	right: 0,
	width: 46,
	height: 46,
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
		}
	}
	return (
		<div className={'NewCharacterInput ' + (className ?? '')}>
			{label && <Label htmlFor={props.id} style={{textDecoration: status === 'focus' ? 'underline' : 'none'}}>{label}</Label>}
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
	const [state, send] = useMachine(slideshowMachine)
	const dropzone = useDropzone({
		accept: 'image/*',
		onDropAccepted(acceptedFiles) {
			// handle cancelled file operations
			const filesWithPreview = acceptedFiles.map(file => Object.assign(file, {preview: URL.createObjectURL(file)}))
			send('ADDED_PHOTOS', {data: filesWithPreview})
		},
	})

	/* TODO: style buttons */
	const previousButton = (
		<ActionButton
			iconName="Back"
			variant="bold-orange"
			type="button"
			title="Previous"
			aria-label="Previous"
			onClick={() => send('PREVIOUS')}
			style={previousButtonStyles}
		/>
	)
	const nextButton = (
		<ActionButton
			iconName="Forward"
			variant="bold-orange"
			type="button"
			title="Next"
			aria-label="Next"
			onClick={() => send('NEXT')}
			style={nextButtonStyles}
		/>
	)

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
				<div style={fadeStyles} />
			</div>
		)
	else if (state.matches('newPhoto'))
		slideshowSection = (
			<div style={previewWrapperStyles}>
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
			<div style={previewWrapperStyles}>
				{state.context.currentPage > 0 && previousButton}
				<img src={state.context.files[state.context.currentPage].preview} alt="" style={previewStyles} />
				<ActionButton
					iconName="Delete"
					variant="bold-orange"
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
	const history = useHistory()

	const [name, setName] = useState(localStorage.getItem('character-name') ?? '')
	const [story, setStory] = useState(localStorage.getItem('character-story') ?? '')

	const user = useUser()
	const [uuid, setUUID] = useState(() => uuidv1())
	const userInfoRef = useFirestore().collection('users').doc(user.uid)

	const {
		getInputProps,
		slideshowSection,
		dropMessage,
		dropID,
	} = useSlideshow()

	function cancel() {
		clearStorage()
		history.replace('/')
	}

	function save() {
		clearStorage()
		// TODO: upload images
		userInfoRef.set({
			[`characters.${uuid}`]: {
				images: [], // TODO: populate `images` list with IDs
				name,
				story,
			},
		})
		setUUID(uuidv1())
	}

	return (
		<motion.div layout style={{height: '100%'}}>
			<main style={{height: 'calc(100% - 62px)'}}>
				<form
					style={{
						display: 'flex',
						flexDirection: 'column',
						padding: '0 0 45px 0',
						height: 'calc(100% - 45px)',
						overflowY: 'scroll',
					}}
				>
					<div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
						{slideshowSection}
						<input id={dropID} {...getInputProps()} />
						{dropMessage}
					</div>

					<div style={{padding: '0 31px', display: 'flex', flexDirection: 'column', flexGrow: 1}}>
						<NewCharacterInput
							id={nameFieldID}
							label="Name"
							placeholder="Imogen Winchester"
							onChange={createValueStorer('character-name', setName)}
							value={name}
							required
						/>
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
					</div>
				</form>
			</main>
			<section
				style={{
					position: 'fixed',
					display: 'flex',
					justifyContent: 'space-evenly',
					alignItems: 'center',
					width: '100%',
					height: 62,
					backgroundColor: 'white',
					boxShadow: `${colors.lightOrange} 0 -2px 7px 0`,
				}}
			>
				<ActionButton variant="flat" iconName="Back" onClick={cancel}>
					Cancel
				</ActionButton>
				<ActionButton variant="flat" iconName="Save" onClick={save}>
					Save
				</ActionButton>
			</section>
		</motion.div>
	)
}
