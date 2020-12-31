import {useEffect, useMemo, useState} from 'react'
import {useHistory, useParams} from 'react-router-dom'

import {
	CharacterLayout,
	CharacterNameInput,
	CharacterStoryInput,
	clearStorageKeys,
} from '../components/character-parts.js'
import {useCharacters, useCharacterWithImages, useUser} from '../shared/firebase.js'
import {ActionButton} from '../components/ActionButton.js'
import {useSlideshow} from '../components/slideshow-parts'
import {saveCharacterMachine} from '../shared/machines'
import {useMachine} from '@xstate/react'
import {SaveDialog} from '../components/SaveDialog'

export function EditCharacterPage() {
	const {characterId: id} = useParams()
	const characters = useCharacters()
	const {character, imageResources} = useCharacterWithImages(id)
	const initialPreExistingPhotoData = useMemo(
		() =>
			imageResources.map((resource, index) => ({
				id: character.files[index],
				resource,
				scheduledForRemoval: false,
			})),
		[character?.files, imageResources],
	)
	const {getInputProps, slideshowSection, dropMessage, dropId, files, preExistingPhotos} = useSlideshow(
		initialPreExistingPhotoData,
	)

	const defaultName = localStorage.getItem('edit-character-name') || character.name
	const defaultStory = localStorage.getItem('edit-character-story') || character.story

	const history = useHistory()
	function cancel() {
		clearStorageKeys('edit-character-name', 'edit-character-story')
		history.replace(`/character/${id}`)
	}

	const {uid} = useUser()
	const [saveState, send] = useMachine(
		saveCharacterMachine.withContext({
			...saveCharacterMachine.context,
			characterId: id,
		}),
	)
	function saveChanges(event) {
		event.preventDefault()
		const name = event.target.name.value
		const story = JSON.stringify(event.target.querySelector('trix-editor').editor.toJSON())
		send('SAVE_CHARACTER_EDITS', {name, story, preExistingPhotos, files, uid, characters})
	}

	useEffect(() => {
		if (saveState.matches('finished.success')) {
			clearStorageKeys('edit-character-name', 'edit-character-story')
			history.push(`/character/${saveState.context.characterId}`)
		}
	}, [history, saveState])

	return (
		<CharacterLayout
			mode="edit"
			onSubmit={saveChanges}
			slideshow={
				<div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
					{slideshowSection}
					<input id={dropId} {...getInputProps()} />
					{dropMessage}
				</div>
			}
			name={<CharacterNameInput storageKey="edit-character-name" defaultValue={defaultName} />}
			story={<CharacterStoryInput storageKey="edit-character-story" defaultValue={defaultStory} />}
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
			<SaveDialog
				isOpen={['uploadingFiles', 'saving', 'finished.error'].some(saveState.matches)}
				matches={saveState.matches.bind(saveState)}
			/>
		</CharacterLayout>
	)
}
