import {useAuth, useFirestore, useFirestoreDoc} from 'reactfire'
import {motion} from 'framer-motion'
import {Text} from '@fluentui/react'
import 'wicg-inert'
import '../styles/profile-menu.css'
import {ProfileMenu, ProfileMenuItem} from '../components/profile-menu'
import {
	auth,
	clearFirestoreCache,
	createDocumentResource,
	firestore,
	useDocumentResource,
	useUser,
} from '../shared/firebase'
import {colors} from '../shared/theme'
import {ActionButton} from '../components/action-button'
import {useHistory} from 'react-router-dom'
import {CharacterCard} from '../components/CharacterCard'
import {useEffect, useMemo, Suspense} from 'react'

let ref = firestore.collection('users').doc('qyn462H3paOebIjHGqyXlIRJrfl1')
let resource = createDocumentResource(ref)

export function Home() {
	const user = useUser()
	const ref = firestore.collection('users').doc(user.uid)
	const resource = createDocumentResource(ref)
	return (
		<Suspense fallback={<p>Getting user characters</p>}>
			<HomePage documentRef={ref} resource={resource} />
		</Suspense>
	)
}

function HomePage({documentRef, resource}) {
	const user = useUser()

	const history = useHistory()
	function openNewCharacterPage() {
		history.push('/new-character')
	}

	function signOut() {
		auth.signOut().then(() => {
			history.push('/login')
		})
	}

	const document = useDocumentResource(documentRef, resource)
	console.log(document)
	const {characters} = document
	let posts = []
	for (const character of characters) posts.push(<CharacterCard character={character} />)

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
			<main style={{flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>{posts}</main>
			<section style={{position: 'fixed', bottom: 0, left: 0, padding: 10}}>
				<ActionButton variant="round" iconName="Add" onClick={openNewCharacterPage}>
					New
				</ActionButton>
			</section>
		</motion.div>
	)
}
