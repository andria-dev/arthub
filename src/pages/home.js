import {
	Suspense, useCallback, useMemo, useContext, useEffect,
} from 'react';
import {useHistory} from 'react-router-dom';

import {Text} from '@fluentui/react';
import {useMachine} from '@xstate/react';
import {AnimatePresence, motion} from 'framer-motion';

import {ShepherdTourContext} from 'react-shepherd';
import {ActionButton} from '../components/ActionButton/ActionButton.js';
import {
	ProfileMenuContext, profileMenuMachine, ShareContext, shareMachine,
} from '../shared/machines.js';
import {Loading} from '../components/Loading.js';
import {CharacterCardList} from '../components/CharacterCardList.js';
import {ProfileHeader} from '../components/ProfileHeader.js';
import {
	ConfirmShareDialog, SharingCharacterDialog, ShowShareUrlDialog, ViewShareLinksDialog,
} from '../components/ShareDialogs.js';
import {useUser, useCharacters} from '../shared/firebase.js';

import '../styles/ProfileMenu.css';
import '../styles/home.css';
import 'wicg-inert';

/**
 * Home page
 * @returns {import('react').ReactNode}
 */
export function Home() {
	const tour = useContext(ShepherdTourContext);
	const characters = useCharacters();

	useEffect(() => {
		if (localStorage.getItem('first-tour') === null) {
			tour.start();
			localStorage.setItem('first-tour', 'done');
		}
	}, [tour]);

	const user = useUser();
	const [shareState, sendToShare] = useMachine(shareMachine.withContext({
		...shareMachine.context,
		userId: user.uid,
	}));
	const [profileMenuState, sendToProfileMenu, service] = useMachine(profileMenuMachine);

	const send = useCallback((event, payload) => {
		sendToShare(event, payload);
		sendToProfileMenu(event, payload);
	}, [sendToShare, sendToProfileMenu]);
	const shareMachineValues = useMemo(() => [shareState, send], [shareState, send]);
	const profileMenuMachineValues = useMemo(
		() => [profileMenuState, send, service],
		[profileMenuState, send, service],
	);

	const history = useHistory();
	function openNewCharacterPage() {
		history.push('/new-character');
	}

	return (
		<motion.div
			style={{height: '100%', display: 'flex', flexDirection: 'column'}}
			initial={{opacity: 0}}
			animate={{opacity: 1}}
			exit={{opacity: 0}}
			className="Home"
		>
			<ProfileMenuContext.Provider value={profileMenuMachineValues}>
				<ProfileHeader />
			</ProfileMenuContext.Provider>

			<main className="Home__cards-container" style={{minHeight: characters.length ? '' : 'calc(100% - 100px)'}}>
				<AnimatePresence>
					{shareState.matches('shareCharacters') && (
						<motion.div
							style={{overflow: 'hidden'}}
							initial={{height: 0, opacity: 0}}
							animate={{height: 'auto', opacity: 1}}
							exit={{height: 0, opacity: 0}}
						>
							<Text as="h2" variant="xxLarge" block style={{margin: '0 0 10px', textAlign: 'center'}}>
								Share a character
							</Text>
							<Text as="p" block style={{margin: '0 10px 10px', textAlign: 'center'}}>
								By clicking the share button, you can create a public link for your character{' '}
								which you can then share with your friends.
							</Text>
						</motion.div>
					)}
				</AnimatePresence>
				<Suspense fallback={<Loading label="Loading your characters..." />}>
					<ShareContext.Provider value={shareMachineValues}>
						{/* @ts-ignore */}
						<CharacterCardList />
						<ConfirmShareDialog />
						<SharingCharacterDialog />
						<ShowShareUrlDialog />
						<ViewShareLinksDialog />
					</ShareContext.Provider>
				</Suspense>
			</main>

			<section
				style={{
					position: 'fixed', bottom: 0, left: 0, padding: 10,
				}}
			>
				{shareState.matches('viewCharacters') && (
					<ActionButton
						id="new-character-button"
						variant="round-light-orange"
						iconName="Add"
						onClick={openNewCharacterPage}
					>
						New
					</ActionButton>
				)}
				{shareState.matches('shareCharacters') && (
					<ActionButton
						variant="round-light-orange"
						iconName="Cancel"
						onClick={() => send('CANCEL')}
					>
						Cancel
					</ActionButton>
				)}
			</section>
		</motion.div>
	);
}
