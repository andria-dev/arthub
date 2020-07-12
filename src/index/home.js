import React from 'react'
import {useAuth, useFirestore, useFirestoreDoc, useUser} from 'reactfire'
import {motion} from 'framer-motion'
import {Text} from '@fluentui/react'
import 'wicg-inert'
import './home/styles.css'
import {ProfileMenu, ProfileMenuItem} from './home/profile-menu'

export function Home() {
	const auth = useAuth()
	const user = useUser()
	const userRef = useFirestore().collection('users').doc(user.uid)
	const userInfo = useFirestoreDoc(userRef)

	return (
		<motion.div animate>
			<header style={{display: 'flex', padding: '27px 20px'}}>
				<Text variant="xxLarge">
					<span aria-hidden="true">💛</span> Art Hub
				</Text>
				<ProfileMenu email={user.email} name={user.displayName}>
					<ProfileMenuItem>Share</ProfileMenuItem>
					<ProfileMenuItem>Settings</ProfileMenuItem>
					<ProfileMenuItem>Help</ProfileMenuItem>
					<ProfileMenuItem onClick={() => auth.signOut()}>Sign Out</ProfileMenuItem>
				</ProfileMenu>
			</header>
		</motion.div>
	)
}
