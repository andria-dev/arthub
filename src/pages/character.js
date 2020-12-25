import {useMemo} from 'react'

import {useMachine} from '@xstate/react'
import {useParams, useHistory} from 'react-router-dom'

import {fetchImageURL, firestore, useCharacterWithImages, useUser, withUserResource} from '../shared/firebase.js'
import {ActionButton} from '../components/action-button.js'
import {plainSlideshowMachine} from '../shared/machines.js'
import {createDocumentResource, createResource, useDocumentResource} from '../shared/resources.js'
import {artworkStyles, artworkWrapperStyles, NextButton, PreviousButton} from '../components/slideshow-parts.js'
import {CharacterStory, CharacterLayout} from '../components/character-parts.js'

import '../styles/character.css'

function CharacterSlideshow({context, send, resources}) {
	if (resources.length === 0) return null

	const url = resources[context.currentPage].read()
	const previous = <PreviousButton key="prev" onClick={() => send('PREVIOUS')} />
	const next = <NextButton key="next" onClick={() => send('NEXT')} />

	// TODO: add real alt from character data
	return (
		<div style={artworkWrapperStyles}>
			{context.currentPage > 0 ? previous : null}
			<img key="img" src={url} alt="Artwork" style={artworkStyles} />
			{context.currentPage < context.numberOfImages - 1 ? next : null}
		</div>
	)
}

/**
 * @param {{userRef: DocumentRef<UserData>, resource: ResourceReader<UserData>}} props
 * @constructor
 */
export function CharacterPage() {
	const {characterID: id} = useParams()
	const {character, imageResources} = useCharacterWithImages(id)

	const history = useHistory()
	function back() {
		history.replace('/')
	}

	const [state, send] = useMachine(
		plainSlideshowMachine.withContext({
			...plainSlideshowMachine.context,
			numberOfImages: imageResources.length,
		}),
	)

	function edit() {
		history.push(`/edit-character/${id}`)
	}

	return (
		<CharacterLayout
			mode="display"
			slideshow={<CharacterSlideshow context={state.context} send={send} resources={imageResources} />}
			name={<h1 className="Character__name">{character.name}</h1>}
			story={<CharacterStory story={character.story} />}
			actions={
				<>
					<ActionButton key="delete" variant="flat-danger" iconName="Trash" onClick={() => {}} type="button">
						Delete
					</ActionButton>
					<ActionButton key="back" variant="flat" iconName="Back" onClick={back} type="button">
						Back
					</ActionButton>
					<ActionButton key="edit" variant="flat" iconName="Edit" onClick={edit} type="button">
						Edit
					</ActionButton>
				</>
			}
		/>
	)
}
