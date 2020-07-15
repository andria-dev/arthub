import React from 'react'
import {useAuth, useFirestore, useFirestoreDoc, useUser} from 'reactfire'
import {motion} from 'framer-motion'
import {Text, FontIcon} from '@fluentui/react'
import 'wicg-inert'
import './home/styles.css'
import {ProfileMenu, ProfileMenuItem} from './home/profile-menu'
import {clearFirestoreCache} from '../shared/firebase'
import {colors} from '../shared/theme'
import {ActionButton} from './home/action-button.js'

export function Home() {
	const auth = useAuth()
	const user = useUser()
	const userRef = useFirestore().collection('users').doc(user.uid)
	const userInfo = useFirestoreDoc(userRef)

	function signOut() {
		auth.signOut()
		// TODO: Figure out if reactfire fixed this bug yet (https://github.com/FirebaseExtended/reactfire/issues/228)
		clearFirestoreCache()
	}

	return (
		<motion.div animate>
			<header style={{display: 'flex', padding: '27px 20px'}}>
				<Text variant="title" as="h1" style={{margin: 0}}>
					<span aria-hidden="true">💛</span> Art Hub
				</Text>
				<ProfileMenu email={user.email} name={user.displayName}>
					<ProfileMenuItem>Share</ProfileMenuItem>
					<ProfileMenuItem>Settings</ProfileMenuItem>
					<ProfileMenuItem>Help</ProfileMenuItem>
					<ProfileMenuItem onClick={signOut}>Sign Out</ProfileMenuItem>
				</ProfileMenu>
			</header>
			<main></main>
			<section style={{position: 'absolute', bottom: 0, left: 0, padding: 10}}>
				<ActionButton variant="round" iconName="Add">
					New
				</ActionButton>
			</section>
		</motion.div>
	)
}
