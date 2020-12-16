import ky from 'ky'
import firebase from 'firebase'
import 'firebase/firestore'
import 'firebase/storage'
import {Spinner} from '@fluentui/react'
import {Center} from '../components/center'
import {useContext, useEffect, createContext, useState, useMemo, useReducer} from 'react'

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
 * Creates a resource for use with the React Suspense API.
 * Usage:
 * ```js
 *	function Post({id}) {
 *		const post = useMemo(() => createResource('post/'+id), [id])
 *		return (
 *			<article>{post.stuff}</article>
 *		)
 *	}
 *
 *	function App() {
 *		return (
 *			<Suspense fallback={<Spinner />}>
 *				<Post id="test-id-1" />
 *			</Suspense>
 *		)
 *	}
 * ```
 * @param promise
 * @returns {{read(): *}|*}
 */
export function createResource(promise) {
	let status = 'loading'
	let result

	const suspender = promise
		.then(value => {
			status = 'success'
			result = value
		})
		.catch(error => {
			status = 'error'
			result = error
		})

	return {
		read() {
			switch (status) {
				case 'loading':
					throw suspender
				case 'success':
					return result
				case 'error':
					throw result
			}
		},
	}
}

const FirebaseContext = createContext({})
export function FirebaseProvider({children}) {
	const [user, setUser] = useState({status: 'loading', value: null})
	const state = useMemo(() => ({user}), [user])

	useEffect(() => {
		return auth.onAuthStateChanged((user, error) => {
			if (error) setUser({status: 'error', value: error})
			else setUser({status: 'success', value: user})
		})
	}, [])

	switch (user.status) {
		case 'loading':
			return (
				<Center>
					<Spinner label="Preparing everything as fast as we can..." />
				</Center>
			)
		case 'error':
			throw user.value
		case 'success':
		default:
			return <FirebaseContext.Provider value={state}>{children}</FirebaseContext.Provider>
	}
}

export function useUser() {
	const state = useContext(FirebaseContext)
	return state.user.value
}

function documentResourceReducer(state, action) {
	switch (action.type) {
		case 'NEW_SNAPSHOT':
			return {
				...state,
				status: 'loaded',
				result: action.result,
			}
		case 'ERROR':
			return {
				...state,
				status: 'error',
				error: action.error,
			}
		default:
			return state
	}
}

/**
 * A Suspense-friendly resource that is used when loading a Firestore document.
 * @typedef {{status: string, result: DocumentData | undefined, ref: DocumentReference<DocumentData>}} DocumentResource
 */

/**
 * A Suspense-friendly hook that creates a resource for getting the value of a document in the Firestore.
 * @param {string} collection
 * @param {string} document
 * @returns {DocumentResource}
 */

export function createDocumentResource(documentRef) {
	return createResource(documentRef.get().then(doc => doc.data()))
}
export function useDocumentResource(documentRef, resource) {
	console.log('useDocumentResource - here')
	const [result, setResult] = useState(resource.read())

	useEffect(() => {
		return documentRef.onSnapshot((snapshot, error) => {
			if (error) console.warn(error)
			else setResult(snapshot.data())
		})
	}, [documentRef])

	return result
}

export const corsAnywhere = ky.create({prefixUrl: '//cors-anywhere.herokuapp.com/'})

// Workaround from https://github.com/FirebaseExtended/reactfire/discussions/228#discussioncomment-182830
export function clearFirestoreCache() {
	const map = window._reactFirePreloadedObservables
	for (const key of map.keys()) if (key.includes('firestore')) map.delete(key)
}
