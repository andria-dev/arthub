import {memo, useState} from 'react'

import {useMachine} from '@xstate/react'
import {useHistory, useParams} from 'react-router-dom'
import * as firebase from 'firebase'

import {firestore, storage, useCharacterWithImages, useUser} from '../shared/firebase.js'
import {ActionButton} from '../components/ActionButton.js'
import {slideshowMachine} from '../shared/machines.js'
import {artworkStyles, artworkWrapperStyles, NextButton, PreviousButton} from '../components/slideshow-parts.js'
import {CharacterLayout, CharacterStory} from '../components/character-parts.js'

import {FadeLayout} from '../components/FadeLayout'
import {Center} from '../components/Center'
import {Spinner} from '@fluentui/react'

import '../styles/character.css'
import {Loading} from '../components/Loading'

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

export function CharacterPage() {
	const {characterId: id} = useParams()
	const {character, imageResources} = useCharacterWithImages(id)

	const [slideshowState, send] = useMachine(
		slideshowMachine.withContext({
			...slideshowMachine.context,
			numberOfImages: imageResources.length,
		}),
	)

	const history = useHistory()
	function back() {
		history.replace('/')
	}

	function edit() {
		history.push(`/edit-character/${id}`)
	}

	const {uid} = useUser()
	const [status, setStatus] = useState('viewing')
	function deleteCharacter() {
		setStatus('deleting')

		// Delete artwork first
		const promises = []
		for (const fileId of character.files) {
			promises.push(
				storage
					.ref()
					.child(`${uid}/${fileId}`)
					.delete()
					.catch(error => console.warn(`Failed to delete art ${uid}/${fileId}:`, error)),
			)
		}

		// Then delete the character itself
		const ref = firestore.collection('users').doc(uid)
		promises.push(
			ref
				.update({characters: firebase.firestore.FieldValue.arrayRemove(character)})
				.catch(error => console.warn(`Failed to delete character ${id}:`, error)),
		)

		Promise.all(promises).finally(() => {
			history.replace('/')
		})
	}

	if (status === 'deleting') {
		return (
			<FadeLayout style={{height: '100vh'}}>
				<Loading label="Deleting your character for you..." />
			</FadeLayout>
		)
	}

	return (
		<CharacterLayout
			mode="display"
			className="Character"
			slideshow={<CharacterSlideshow context={slideshowState.context} send={send} resources={imageResources} />}
			name={<h1 className="Character__name">{character.name}</h1>}
			story={<CharacterStory story={character.story} />}
			actions={
				<>
					<ActionButton key="delete" variant="flat-danger" iconName="Trash" onClick={deleteCharacter} type="button">
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
