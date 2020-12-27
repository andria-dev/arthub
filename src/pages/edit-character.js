import {useEffect, useMemo, useState} from 'react'

import {useId} from '@uifabric/react-hooks'
import {useHistory, useParams} from 'react-router-dom'

import {
	CharacterLayout,
	CharacterNameInput,
	CharacterStoryInput,
	clearStorageKeys,
} from '../components/character-parts.js'
import {useCharacterWithImages, useUser} from '../shared/firebase.js'
import {ActionButton} from '../components/action-button.js'
import {useSlideshow} from '../components/slideshow-parts'

export function EditCharacterPage() {
	const {characterID: id} = useParams()
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
	const {getInputProps, slideshowSection, dropMessage, dropID, files, preExistingPhotos} = useSlideshow(
		initialPreExistingPhotoData,
	)

	const [name, setName] = useState(localStorage.getItem('edit-character-name') || character.name)
	const [story, setStory] = useState(localStorage.getItem('edit-character-story') || character.story)

	const history = useHistory()
	function cancel() {
		clearStorageKeys('edit-character-name', 'edit-character-story')
		history.replace(`/character/${id}`)
	}

	const {uid} = useUser()
	function saveChanges(event) {
		event.preventDefault()
		// send('SAVE', {name, story, files, uid, preExistingPhotos})
	}

	return (
		<CharacterLayout
			mode="edit"
			onSubmit={saveChanges}
			slideshow={
				<div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
					{slideshowSection}
					<input id={dropID} {...getInputProps()} />
					{dropMessage}
				</div>
			}
			name={<CharacterNameInput storageKey="edit-character-name" setter={setName} value={name} />}
			story={<CharacterStoryInput storageKey="edit-character-story" setter={setStory} value={story} />}
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
		/>
	)
}
