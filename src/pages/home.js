import {Suspense, useCallback, useMemo} from 'react';
import {useHistory} from 'react-router-dom';

import {Text} from '@fluentui/react';
import {useMachine} from '@xstate/react';
import {AnimatePresence, motion} from 'framer-motion';

import {ActionButton} from '../components/ActionButton/ActionButton.js';
import {
	ProfileMenuContext, profileMenuMachine, ShareContext, shareMachine,
} from '../shared/machines.js';
import {Loading} from '../components/Loading.js';
import {CharacterCardList} from '../components/CharacterCardList.js';
import {ProfileHeader} from '../components/ProfileHeader.js';
import {ConfirmShareDialog, SharingCharacterDialog, ShowShareUrlDialog} from '../components/ShareDialogs.js';

import '../styles/ProfileMenu.css';
import 'wicg-inert';
import {useUser} from '../shared/firebase.js';

/**
 * Home page
 * @returns {import('react').ReactNode}
 */
export function Home() {
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
		>
			<ProfileMenuContext.Provider value={profileMenuMachineValues}>
				<ProfileHeader />
			</ProfileMenuContext.Provider>

			<main
				style={{
					flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '95px',
				}}
			>
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
					</ShareContext.Provider>
				</Suspense>
			</main>

			<section
				style={{
					position: 'fixed', bottom: 0, left: 0, padding: 10,
				}}
			>
				{shareState.matches('viewCharacters') && (
					<ActionButton variant="round-light-orange" iconName="Add" onClick={openNewCharacterPage}>
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
