import {auth, useUser} from '../shared/firebase'
import {useContext} from 'react'
import {ProfileMenuContext} from '../shared/machines'
import {useHistory} from 'react-router-dom'
import {ProfileMenu, ProfileMenuItem} from './ProfileMenu'
import {colors} from '../shared/theme'
import {Text} from '@fluentui/react'
import {useScrollStatus} from '../shared/helpers'

/**
 * Renders the Home page's header with the profile image. It handles scroll animations.
 * @returns {JSX.Element}
 * @constructor
 */
export function ProfileHeader({changeMode}) {
	const user = useUser()
	const scrollStatus = useScrollStatus()
	const [current, send] = useContext(ProfileMenuContext)
	const history = useHistory()

	function signOut() {
		auth.signOut().then(() => {
			history.push('/login')
		})
	}

	let menuName
	let menuItems
	if (current.matches('open.share')) {
		menuName = 'Share'
		menuItems = (
			<>
				<ProfileMenuItem key="view-shared">View Shared</ProfileMenuItem>
				<ProfileMenuItem
					key="share"
					onClick={() => {
						changeMode('share-characters')
						send('SHARE_CHARACTER')
					}}
				>
					Share Character
				</ProfileMenuItem>
				<ProfileMenuItem key="un-share">Un-share Character</ProfileMenuItem>
				<ProfileMenuItem key="back" onClick={() => send('MENU_BACK')}>
					Back
				</ProfileMenuItem>
			</>
		)
	} else {
		menuName = 'Profile'
		menuItems = (
			<>
				<ProfileMenuItem key="share-menu" onClick={() => send('OPEN_SHARE_MENU')}>
					Share Menu
				</ProfileMenuItem>
				<ProfileMenuItem key="settings">Settings</ProfileMenuItem>
				<ProfileMenuItem key="help">Help</ProfileMenuItem>
				<ProfileMenuItem key="sign-out" onClick={signOut}>
					Sign Out
				</ProfileMenuItem>
			</>
		)
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
			<Text variant="title" as="h1" style={{margin: 0}}>
				<span aria-hidden="true">💛</span> Art Hub
			</Text>
			<ProfileMenu email={user.email} name={user.displayName} menuName={menuName}>
				{menuItems}
			</ProfileMenu>
		</header>
	)
}
