import {Suspense, unstable_SuspenseList as SuspenseList, useEffect, useState} from 'react'

import {useHistory} from 'react-router-dom'
import {motion} from 'framer-motion'
import {Text, Spinner} from '@fluentui/react'

import {Center} from '../components/center'
import {ActionButton} from '../components/action-button'
import {CharacterCard} from '../components/CharacterCard'
import {ProfileMenu, ProfileMenuItem} from '../components/profile-menu'

import {colors} from '../shared/theme'
import {auth, firestore, useCharacters, useUser} from '../shared/firebase.js'
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
function CharacterCardList({documentRef, resource}) {
	const characters = useCharacters()

	// Render all the Character Cards if there are any.
	if (characters.length > 0) {
		const listOfCharacters = characters.map((character, index) => <CharacterCard key={index} character={character} />)
		return (
			<SuspenseList revealOrder="forwards" tail="collapsed">
				{listOfCharacters}
			</SuspenseList>
		)
	}

	// Otherwise, inform the user of how to create a character.
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

/**
 * Renders the Home page's header with the profile image. It handles scroll animations.
 * @returns {JSX.Element}
 * @constructor
 */
function ProfileHeader() {
	const user = useUser()
	const [status, setStatus] = useState('flat')

	useEffect(() => {
		function handler() {
			setStatus(prevStatus => {
				if (window.scrollY > 0) return 'floating'
				return 'flat'
			})
		}

		window.addEventListener('scroll', handler)
		return () => {
			window.removeEventListener('scroll', handler)
		}
	}, [])

	const history = useHistory()
	function signOut() {
		auth.signOut().then(() => {
			history.push('/login')
		})
	}

	return (
		<header
			style={{
				position: 'fixed',
				display: 'flex',
				width: 'calc(100% - 40px)',
				padding: '27px 20px',
				zIndex: 2,
				background: status === 'flat' ? 'white' : colors.light,
				boxShadow: status === 'flat' ? '0 0 7px 2px transparent' : `0 0 7px 2px ${colors.lightShadow}`,
				transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
			}}
		>
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
	)
}

/**
 * Home page
 * @returns {JSX.Element}
 * @constructor
 */
export function Home() {
	const history = useHistory()
	function openNewCharacterPage() {
		history.push('/new-character')
	}

	return (
		<motion.div layout style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
			<ProfileHeader />

			<main style={{flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '95px'}}>
				<Suspense
					fallback={
						<Center>
							<Spinner label="Loading your characters..." />
						</Center>
					}
				>
					<CharacterCardList />
				</Suspense>
			</main>

			<section style={{position: 'fixed', bottom: 0, left: 0, padding: 10}}>
				<ActionButton variant="round-light-orange" iconName="Add" onClick={openNewCharacterPage}>
					New
				</ActionButton>
			</section>
		</motion.div>
	)
}
