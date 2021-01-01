import {useState} from 'react';

import {Link as RouterLink} from 'react-router-dom';
import {Text} from '@fluentui/react';

import {useCharacters} from '../shared/firebase.js';
import {CharacterCard} from './CharacterCard.js';
import {colors} from '../shared/theme.js';
import {ShareDialog} from './ShareDialog.js';

function CharacterCardWrapper({character, mode}) {
	const [status, setStatus] = useState('idle');

	return (
		<>
			<CharacterCard key={character.id} character={character} mode={mode}>
				{mode === 'view-characters' && (
					<RouterLink to={`/character/${character.id}`} className="CharacterCard__action-button">
						View Character
					</RouterLink>
				)}
				{mode === 'share-characters' && (
					<button type="button" className="CharacterCard__action-button" onClick={() => setStatus('sharing')}>
						Share Character
					</button>
				)}
			</CharacterCard>
			<ShareDialog isOpen={status === 'sharing'} onDismiss={() => setStatus('idle')} character={character} />
		</>
	);
}

/**
 * Renders a list of `<CharacterCard>`'s from a document and a resource.
 * @param {{mode: 'view-characters' | 'share-characters'}} props
 */
export function CharacterCardList({mode}) {
	const characters = useCharacters();

	// Render all the Character Cards if there are any.
	if (characters.length > 0) {
		return (
			<>
				{characters.map((character) => <CharacterCardWrapper character={character} mode={mode} />)}
			</>
		);
	}

	// Otherwise, inform the user of how to create a character.
	// TODO: Add alt for pride-drawing.svg
	return (
		<div
			style={{
				width: '100%',
				height: 'calc(100% - 100px)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<img src="/pride-drawing.svg" alt="" style={{width: 270, height: 196, marginBottom: 35}} />
			{/* @ts-ignore */}
			<Text variant="mediumTitle" as="h2" style={{textAlign: 'center', maxWidth: 232, color: colors.dark}}>
				To get started, add some characters with the "New" button.
			</Text>
		</div>
	);
}
