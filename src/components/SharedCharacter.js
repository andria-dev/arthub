import {useMachine} from '@xstate/react';
import {useHistory} from 'react-router-dom';

import {CharacterSlideshow} from '../pages/character.js';
import {useSharedCharacterWithImages} from '../shared/firebase.js';
import {slideshowMachine} from '../shared/machines.js';
import {CharacterLayout, CharacterStory} from './character-parts.js';
import {ActionButton} from './ActionButton/ActionButton.js';

export function SharedCharacter({reference, resource}) {
	const {character, imageResources} = useSharedCharacterWithImages(reference, resource);

	const [slideshowState, send] = useMachine(
		slideshowMachine.withContext({
			...slideshowMachine.context,
			numberOfImages: imageResources.length,
		}),
	);

	const history = useHistory();
	function back() {
		history.push('/landing');
	}

	return (
		<CharacterLayout
			mode="display"
			className="Character"
			slideshow={<CharacterSlideshow context={slideshowState.context} send={send} resources={imageResources} />}
			name={<h1 className="Character__name">{character.name}</h1>}
			story={<CharacterStory story={character.story} />}
			actions={(
				<ActionButton key="back" type="button" variant="flat" iconName="Back" onClick={back}>
					Back
				</ActionButton>
			)}
		/>
	);
}
