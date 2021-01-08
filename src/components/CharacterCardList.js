import {useContext} from 'react';

import {Link as RouterLink} from 'react-router-dom';
import {Text} from '@fluentui/react';

import {useCharacters} from '../shared/firebase.js';
import {CharacterCard} from './CharacterCard.js';
import {colors} from '../shared/theme.js';
import {ShareContext} from '../shared/machines.js';
import {Center} from './Center.js';

/**
 * Renders a list of `<CharacterCard>`s.
 */
export function CharacterCardList() {
	const characters = useCharacters();
	const [current, send] = useContext(ShareContext);

	// Render all the Character Cards if there are any.
	if (characters.length > 0) {
		return (
			<>
				{characters.map((character) => (
					<CharacterCard key={character.id} character={character}>
						{current.matches('viewCharacters') && (
							<RouterLink to={`/character/${character.id}`} className="CharacterCard__action-button">
								View Character
							</RouterLink>
						)}
						{current.matches('shareCharacters') && (
							<button
								type="button"
								className="CharacterCard__action-button"
								onClick={() => send('SHARING_CHARACTER', {characterId: character.id})}
							>
								Share Character
							</button>
						)}
					</CharacterCard>
				))}
			</>
		);
	}

	// Otherwise, inform the user of how to create a character.
	// TODO: Add alt for pride-drawing.svg
	return (
		<Center>
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
		</Center>
	);
}
