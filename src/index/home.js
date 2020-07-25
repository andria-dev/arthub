import React from 'react'
import {useAuth, useFirestore, useFirestoreDoc, useUser} from 'reactfire'
import {motion} from 'framer-motion'
import {Text} from '@fluentui/react'
import 'wicg-inert'
import './home/styles.css'
import {ProfileMenu, ProfileMenuItem} from './home/profile-menu'
import {clearFirestoreCache} from '../shared/firebase'
import {colors} from '../shared/theme'
import {ActionButton} from './shared/action-button'
import {useHistory} from 'react-router-dom'

export function Home() {
	const auth = useAuth()
	const user = useUser()
	const userRef = useFirestore().collection('users').doc(user.uid)
	const userInfo = useFirestoreDoc(userRef)
	const history = useHistory()

	function openNewCharacterPage() {
		history.push('/new-character')
	}

	function signOut() {
		auth.signOut()
		// TODO: Figure out if reactfire fixed this bug yet (https://github.com/FirebaseExtended/reactfire/issues/228)
		clearFirestoreCache()
	}

	let posts = []
	for (const id in userInfo.characters) posts.push(<p>{id} Placeholder</p>)
	if (!posts.length)
		// TODO: Add alt for pride-drawing.svg
		posts = (
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
				<Text variant="mediumTitle" as="h2" style={{textAlign: 'center', maxWidth: 232, color: colors.dark}}>
					To get started, add some characters with the "New" button.
				</Text>
			</div>
		)

	return (
		<motion.div layout style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
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
			<main style={{flexGrow: 1}}>{posts}</main>
			<section style={{position: 'absolute', bottom: 0, left: 0, padding: 10}}>
				<ActionButton variant="round" iconName="Add" onClick={openNewCharacterPage}>
					New
				</ActionButton>
			</section>
		</motion.div>
	)
}
