import {Suspense} from 'react'

import {useHistory} from 'react-router-dom'
import {motion} from 'framer-motion'
import {Text, Spinner} from '@fluentui/react'

import {Center} from '../components/center'
import {ActionButton} from '../components/action-button'
import {CharacterCard} from '../components/CharacterCard'
import {ProfileMenu, ProfileMenuItem} from '../components/profile-menu'

import {colors} from '../shared/theme'
import {auth, firestore, useUser} from '../shared/firebase.js'
import {createDocumentResource, useDocumentResource} from '../shared/resources.js'

import '../styles/profile-menu.css'
import 'wicg-inert'

/**
 * @typedef {{
 *   characterID: string,
 *   files: [string],
 *   name: string,
 *   story: string
 * }} Character
 * @typedef {{characters: [Character]}} UserData
 */

/**
 * Renders a list of `<CharacterCard>`'s from a document and a resource.
 * @param {{
 * 	documentRef: DocumentReference<UserData>,
 * 	resource: ResourceReader<UserData>
 * }} props
 * @returns {JSX.Element|[JSX.Element]}
 * @constructor
 */
function CharacterCardList({userID, documentRef, resource}) {
	const {characters} = useDocumentResource(documentRef, resource)

	if (characters.length > 0) {
		// Render all the Character Cards.
		const characterCards = []
		for (const character of characters) characterCards.push(<CharacterCard userID={userID} character={character} />)
		return characterCards
	} else {
		// Inform the user of how to create a character.
		// TODO: Add alt for pride-drawing.svg
		return (
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
	}
}

/**
 * Home page
 * @returns {JSX.Element}
 * @constructor
 */
export function Home() {
	const user = useUser()

	/** @type {DocumentReference<UserData>} */
	const ref = firestore.collection('users').doc(user.uid)
	const resource = createDocumentResource(ref)

	const history = useHistory()
	function openNewCharacterPage() {
		history.push('/new-character')
	}

	function signOut() {
		auth.signOut().then(() => {
			history.push('/login')
		})
	}

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

			<main style={{flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Suspense
					fallback={
						<Center>
							<Spinner label="Loading your characters..." />
						</Center>
					}
				>
					<CharacterCardList userID={user.uid} documentRef={ref} resource={resource} />
				</Suspense>
			</main>

			<section style={{position: 'fixed', bottom: 0, left: 0, padding: 10}}>
				<ActionButton variant="round" iconName="Add" onClick={openNewCharacterPage}>
					New
				</ActionButton>
			</section>
		</motion.div>
	)
}
