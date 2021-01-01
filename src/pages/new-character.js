import {useEffect} from 'react';
import {useMachine} from '@xstate/react';
import {useHistory} from 'react-router-dom';

import {ActionButton} from '../components/ActionButton.js';
import {SaveDialog} from '../components/SaveDialog.js';
import {useUser} from '../shared/firebase.js';
import {saveCharacterMachine} from '../shared/machines.js';
import {useSlideshow} from '../components/slideshow-parts.js';
import {
	CharacterLayout,
	CharacterNameInput,
	CharacterStoryInput,
	clearStorageKeys,
} from '../components/character-parts.js';
import '../styles/new-character.css';

export function NewCharacter() {
	const defaultName = localStorage.getItem('character-name');
	const defaultStory = localStorage.getItem('character-story');

	const user = useUser();
	const {
		getInputProps, slideshowSection, dropMessage, dropId, files,
	} = useSlideshow();

	const history = useHistory();
	function cancel() {
		clearStorageKeys('character-name', 'character-story');
		history.replace('/');
	}

	const [saveState, send] = useMachine(saveCharacterMachine);
	function save(event) {
		event.preventDefault();
		const name = event.target.name.value;
		const story = JSON.stringify(event.target.querySelector('trix-editor').editor.toJSON());
		send('SAVE_NEW_CHARACTER', {
			name, story, files, uid: user.uid,
		});
	}

	useEffect(() => {
		if (saveState.matches('finished.success')) {
			clearStorageKeys('character-name', 'character-story');
			history.push(`/character/${saveState.context.characterId}`);
		}
	}, [history, saveState]);

	return (
		<CharacterLayout
			mode="edit"
			onSubmit={save}
			slideshow={(
				<div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
					{slideshowSection}
					<input id={dropId} {...getInputProps()} />
					{dropMessage}
				</div>
			)}
			name={<CharacterNameInput storageKey="character-name" defaultValue={defaultName} />}
			story={<CharacterStoryInput storageKey="character-story" defaultValue={defaultStory} />}
			actions={(
				<>
					<ActionButton key="cancel" variant="flat" iconName="Back" onClick={cancel} type="button">
						Cancel
					</ActionButton>
					<ActionButton key="save" variant="flat" iconName="Save" type="submit">
						Save
					</ActionButton>
				</>
			)}
		>
			<SaveDialog
				isOpen={['uploadingFiles', 'saving', 'finished.error'].some(saveState.matches)}
				matches={(value) => saveState.matches(value)}
			/>
		</CharacterLayout>
	);
}
