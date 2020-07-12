import React from 'react'
import {useAuth, useFirestore, useFirestoreDoc, useUser} from 'reactfire'
import {motion} from 'framer-motion'
import {Text} from '@fluentui/react'
import 'wicg-inert'
import './home/styles.css'
import {ProfileMenu, ProfileMenuItem} from './home/profile-menu'
import {clearFirestoreCache} from '../shared/firebase';

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
		<motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
			<header style={{display: 'flex', padding: '27px 20px'}}>
				<Text variant="xxLarge">
					<span aria-hidden="true">💛</span> Art Hub
				</Text>
				<ProfileMenu email={user.email} name={user.displayName}>
					<ProfileMenuItem>Share</ProfileMenuItem>
					<ProfileMenuItem>Settings</ProfileMenuItem>
					<ProfileMenuItem>Help</ProfileMenuItem>
					<ProfileMenuItem onClick={signOut}>Sign Out</ProfileMenuItem>
				</ProfileMenu>
			</header>
		</motion.div>
	)
}
