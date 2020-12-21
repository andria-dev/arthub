import ky from 'ky'
import firebase from 'firebase'
import 'firebase/firestore'
import 'firebase/storage'
import {Spinner} from '@fluentui/react'
import {Center} from '../components/center'
import {useContext, useEffect, createContext, useState, useMemo, useReducer} from 'react'
import {createResourceFromSubscription} from './resources'

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

const FirebaseContext = createContext({})
function FirebaseResources({resource, children}) {
	const [user, setUser] = useState(resource.read())

	useEffect(() => {
		return auth.onAuthStateChanged((user, error) => {
			if (error) console.warn(error)
			else setUser(user)
		})
	}, [])

	const value = useMemo(() => ({user}), [user])
	return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}

export function FirebaseProvider({children}) {
	const resource = createResourceFromSubscription(auth.onAuthStateChanged.bind(auth))
	return <FirebaseResources resource={resource}>{children}</FirebaseResources>
}

export function useUser() {
	const state = useContext(FirebaseContext)
	return state.user
}

export const corsAnywhere = ky.create({prefixUrl: '//cors-anywhere.herokuapp.com/'})

// Workaround from https://github.com/FirebaseExtended/reactfire/discussions/228#discussioncomment-182830
export function clearFirestoreCache() {
	const map = window._reactFirePreloadedObservables
	for (const key of map.keys()) if (key.includes('firestore')) map.delete(key)
}
