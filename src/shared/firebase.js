import {useContext, useEffect, createContext, useState, useMemo} from 'react'

import ky from 'ky'
import firebase from 'firebase'
import 'firebase/firestore'
import 'firebase/storage'

import {
	createDocumentResource,
	createResource,
	createResourceFromSubscription,
	fetchImageURL,
	useDocumentResource,
} from './resources.js'

export const config = {
	apiKey: 'AIzaSyDRi5_luFxHRmlAZzpWB6MXXozfc3PReyE',
	authDomain: 'private-art-hub-project.firebaseapp.com',
	databaseURL: 'https://private-art-hub-project.firebaseio.com',
	projectId: 'private-art-hub-project',
	storageBucket: 'private-art-hub-project.appspot.com',
	messagingSenderId: '548647715304',
	appId: '1:548647715304:web:1e260bd591e4424ab7245d',
	measurementId: 'G-0JR1KQQPJ3',
}
firebase.initializeApp(config)

export default firebase

export const firestore = firebase.firestore()
firestore.settings({timestampsInSnapshots: true})
firestore.enablePersistence().catch(error => console.warn(error))

export const storage = firebase.storage()
export const auth = firebase.auth()
export const provider = new firebase.auth.GoogleAuthProvider()

/**
 * @typedef {Object} FirebaseData
 * @property {firebase.User | null} user
 * @property {[Character]} characters
 */

/** @type {Context<FirebaseData>} */
const FirebaseContext = createContext({user: null, characters: []})

function FirebaseCharactersResource({user, resource, children}) {
	const {characters} = resource.read()
	const value = useMemo(() => ({user, characters}), [user, characters])
	return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}

/**
 * @param {{resource: ResourceReader<firebase.User>, children: any}} props
 * @returns {JSX.Element}
 * @constructor
 */
function FirebaseUserResource({resource, children}) {
	const [user, setUser] = useState(resource.read())

	useEffect(() => {
		return auth.onAuthStateChanged((user, error) => {
			if (error) console.warn(error)
			else setUser(user)
		})
	}, [])

	const userDocumentResource = useMemo(() => {
		return createDocumentResource(firestore.collection('users').doc(user.uid))
	}, [user.uid])

	return (
		<FirebaseCharactersResource user={user} resource={userDocumentResource}>
			{children}
		</FirebaseCharactersResource>
	)
}

/**
 * Provides access to active Firebase values.
 * @returns {JSX.Element}
 * @constructor
 */
export function FirebaseProvider({children}) {
	const resource = createResourceFromSubscription(auth.onAuthStateChanged.bind(auth))
	return <FirebaseUserResource resource={resource}>{children}</FirebaseUserResource>
}

/** @returns {firebase.User} */
export function useUser() {
	const state = useContext(FirebaseContext)
	return state.user
}

export function useCharacters() {
	const state = useContext(FirebaseContext)
	return state.characters
}

/**
 * Takes a character's ID and user document resource and retrieves the specified character.
 * After that, each image is fetched and a resource is created for each fetch
 * @param {string} id The character's ID.
 * @param {ResourceReader<UserData>} resource A resource that contains the user's account data.
 * @returns {{
 * 	character: Character,
 * 	imageResources: [ResourceReader<string>]
 * }}
 */
export function useCharacterWithImages(id) {
	const user = useUser()
	const characters = useCharacters()

	return useMemo(() => {
		const character = characters.find(character => character.id === id)
		const imageResources = character.files.map(id => createResource(fetchImageURL(user.uid, id)))
		return {character, imageResources}
	}, [characters, user.uid, id])
}

export const corsAnywhere = ky.create({prefixUrl: '//cors-anywhere.herokuapp.com/'})
