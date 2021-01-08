import {useContext} from 'react';
import {useHistory} from 'react-router-dom';

import {Text} from '@fluentui/react';

import {ShepherdTourContext} from 'react-shepherd';
import {auth, useUser} from '../shared/firebase.js';
import {ProfileMenuContext} from '../shared/machines.js';
import {ProfileMenu, ProfileMenuItem} from './ProfileMenu.js';
import {colors} from '../shared/theme.js';
import {useScrollStatus} from '../shared/helpers.js';

/**
 * Renders the Home page's header with the profile image. It handles scroll animations.
 * @returns {JSX.Element}
 */
export function ProfileHeader() {
	const tour = useContext(ShepherdTourContext);

	const user = useUser();
	const scrollStatus = useScrollStatus();
	const [current, send] = useContext(ProfileMenuContext);
	const history = useHistory();

	function signOut() {
		auth.signOut().then(() => {
			history.push('/login');
		});
	}

	let menuName;
	let menuItems;
	if (current.matches('open.share')) {
		menuName = 'Share';
		menuItems = (
			<>
				<ProfileMenuItem
					key="view-shared"
					id="view-shared-button"
					onClick={() => send('VIEW_SHARED')}
				>
					View Shared
				</ProfileMenuItem>
				<ProfileMenuItem
					key="share"
					id="share-button"
					onClick={() => send('SHARE_CHARACTER')}
				>
					Share Character
				</ProfileMenuItem>
				<ProfileMenuItem key="back" id="share-back-button" onClick={() => send('MENU_BACK')}>
					Back
				</ProfileMenuItem>
			</>
		);
	} else {
		menuName = 'Profile';
		menuItems = (
			<>
				<ProfileMenuItem key="share-menu" id="share-menu-button" onClick={() => send('OPEN_SHARE_MENU')}>
					Share Menu
				</ProfileMenuItem>
				<ProfileMenuItem
					key="help"
					id="help-tour-button"
					onClick={() => {
						if (!tour.isActive()) tour.start();
					}}
				>Help
				</ProfileMenuItem>
				<ProfileMenuItem key="sign-out" id="sign-out-button" onClick={signOut}>
					Sign Out
				</ProfileMenuItem>
			</>
		);
	}

	return (
		<header
			style={{
				position: 'fixed',
				display: 'flex',
				width: 'calc(100% - 40px)',
				padding: '27px 20px',
				zIndex: 4,
				background: scrollStatus === 'top' ? 'white' : colors.light,
				boxShadow: scrollStatus === 'top' ? '0 0 7px 2px transparent' : `0 0 7px 2px ${colors.lightShadow}`,
				transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
			}}
		>
			{/* @ts-ignore */}
			<Text variant="title" as="h1" style={{margin: 0}}>
				<span aria-hidden="true">💛</span> Art Hub
			</Text>
			<ProfileMenu email={user.email} name={user.displayName} menuName={menuName}>
				{menuItems}
			</ProfileMenu>
		</header>
	);
}
