import {useHistory, useParams} from 'react-router-dom'
import {CharacterLayout} from '../components/character-parts.js'
import {useCharacterWithImages, useUser} from '../shared/firebase.js'
import {ActionButton} from '../components/action-button'

function clearStorage() {}

export function EditCharacterPage() {
	const {characterID: id} = useParams()
	const {character, imageResources} = useCharacterWithImages(id)

	const history = useHistory()
	function cancel() {
		clearStorage()
		history.replace(`/character/${id}`)
	}

	function saveChanges(event) {
		event.preventDefault()
	}

	return (
		<CharacterLayout
			mode="edit"
			onSubmit={saveChanges}
			slideshow={null}
			name={null}
			story={null}
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
