import {useEffect, useState} from 'react'
import {useMachine} from '@xstate/react'
import {useHistory} from 'react-router-dom'

import {ActionButton} from '../components/action-button.js'
import {SavingDialog} from '../components/saving-dialog.js'
import {useUser} from '../shared/firebase.js'
import {newCharacterMachine} from '../shared/machines.js'
import {useSlideshow} from '../components/slideshow-parts.js'
import {
	CharacterLayout,
	CharacterNameInput,
	CharacterStoryInput,
	clearStorageKeys,
} from '../components/character-parts.js'
import '../styles/new-character.css'

export function NewCharacter() {
	const [name, setName] = useState(localStorage.getItem('character-name') ?? '')
	const [story, setStory] = useState(localStorage.getItem('character-story') ?? '')

	const user = useUser()
	const {getInputProps, slideshowSection, dropMessage, dropID, files} = useSlideshow()

	const history = useHistory()
	function cancel() {
		clearStorageKeys('character-name', 'character-story')
		history.replace('/')
	}

	const [saveState, send] = useMachine(newCharacterMachine)
	function save(event) {
		event.preventDefault()
		send('SAVE', {name, story, files, uid: user.uid})
	}

	useEffect(() => {
		if (saveState.matches({finished: 'success'})) {
			clearStorageKeys('character-name', 'character-story')
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
			name={<CharacterNameInput storageKey="character-name" setter={setName} value={name} />}
			story={<CharacterStoryInput storageKey="character-story" setter={setStory} value={story} />}
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
