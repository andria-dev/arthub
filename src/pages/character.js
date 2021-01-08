import {useState} from 'react';

import {useMachine} from '@xstate/react';
import {useHistory, useParams} from 'react-router-dom';

import {
	firestore, storage, useCharacterWithImages, useUser,
} from '../shared/firebase.js';
import {ActionButton} from '../components/ActionButton/ActionButton.js';
import {slideshowMachine} from '../shared/machines.js';
import {
	artworkStyles, artworkWrapperStyles, NextButton, PreviousButton,
} from '../components/slideshow-parts.js';
import {CharacterLayout, CharacterStory} from '../components/character-parts.js';
import {FadeLayout} from '../components/FadeLayout.js';
import {Loading} from '../components/Loading.js';
import {DeleteCharacterDialog} from '../components/DeleteCharacterDialog.js';

import '../styles/character.css';

export function CharacterSlideshow({context: {currentPage, numberOfImages}, send, resources}) {
	if (resources.length === 0) return null;

	const url = resources[currentPage].read();
	const previous = <PreviousButton key="prev" onClick={() => send('PREVIOUS')} />;
	const next = <NextButton key="next" onClick={() => send('NEXT')} />;

	// TODO: add real alt from character data
	return (
		<div style={artworkWrapperStyles}>
			{currentPage > 0 ? previous : null}
			<img key="img" src={url} alt="Artwork" style={artworkStyles} />
			{currentPage < numberOfImages - 1 ? next : null}
		</div>
	);
}

export function CharacterPage() {
	// @ts-ignore
	const {characterId: id} = useParams();
	const {character, imageResources} = useCharacterWithImages(id);

	const [slideshowState, send] = useMachine(
		slideshowMachine.withContext({
			...slideshowMachine.context,
			numberOfImages: imageResources.length,
		}),
	);

	const history = useHistory();
	function back() {
		history.replace('/');
	}

	function edit() {
		history.push(`/edit-character/${id}`);
	}

	const {uid} = useUser();
	const [status, setStatus] = useState('viewing');
	function deleteCharacter() {
		setStatus('deleting');

		// Start deletion of the artwork first
		const promises = [];
		for (const fileId of character.files) {
			promises.push(
				storage
					.ref()
					.child(`${uid}/${fileId}`)
					.delete()
					.catch((error) => console.warn(`Failed to delete art ${uid}/${fileId}:`, error)),
			);
		}

		// Then, start deletion of all of the character's shared links. Get shares
		// where the character field matches this character, delete each matching share.
		const characterReference = firestore.collection('characters').doc(id);
		promises.push(
			firestore.collection('shares').where('character', '==', characterReference).get()
				.then((querySnapshot) => {
					const shareDeletionPromises = [];
					querySnapshot.forEach((queryDocumentSnapshot) => {
						shareDeletionPromises.push(
							queryDocumentSnapshot.ref.delete().catch((error) => {
								console.warn(
									`Failed to delete share "${queryDocumentSnapshot.id}" for character "${id}"`,
									error,
								);
							}),
						);
					});
					return Promise.all(shareDeletionPromises);
				}),
		);

		// And finally, start the deletion of the character itself
		promises.push(
			characterReference.delete().catch((error) => console.warn(`Failed to delete character ${id}:`, error)),
		);

		Promise.all(promises).finally(() => {
			history.replace('/');
		});
	}

	if (status === 'deleting') {
		return (
			<FadeLayout style={{height: '100vh'}}>
				<Loading label="Deleting your character for you..." />
			</FadeLayout>
		);
	}

	return (
		<CharacterLayout
			mode="display"
			className="Character"
			slideshow={<CharacterSlideshow context={slideshowState.context} send={send} resources={imageResources} />}
			name={<h1 className="Character__name">{character.name}</h1>}
			story={<CharacterStory story={character.story} />}
			actions={(
				<>
					<ActionButton
						key="delete"
						type="button"
						variant="flat-danger"
						iconName="Trash"
						onClick={() => setStatus('confirming')}
					>
						Delete
					</ActionButton>
					<ActionButton key="back" type="button" variant="flat" iconName="Back" onClick={back}>
						Back
					</ActionButton>
					<ActionButton key="edit" type="button" variant="flat" iconName="Edit" onClick={edit}>
						Edit
					</ActionButton>
				</>
			)}
		>
			<DeleteCharacterDialog
				isOpen={status === 'confirming'}
				onDismiss={() => setStatus('viewing')}
				confirm={deleteCharacter}
			/>
		</CharacterLayout>
	);
}
