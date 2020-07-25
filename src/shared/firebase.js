import ky from 'ky'

export const firebaseConfig = {
	apiKey: 'AIzaSyDRi5_luFxHRmlAZzpWB6MXXozfc3PReyE',
	authDomain: 'private-art-hub-project.firebaseapp.com',
	databaseURL: 'https://private-art-hub-project.firebaseio.com',
	projectId: 'private-art-hub-project',
	storageBucket: 'private-art-hub-project.appspot.com',
	messagingSenderId: '548647715304',
	appId: '1:548647715304:web:1e260bd591e4424ab7245d',
	measurementId: 'G-0JR1KQQPJ3',
}

export const corsAnywhere = ky.create({prefixUrl: '//cors-anywhere.herokuapp.com/'})

export function clearFirestoreCache() {
	const map = window._reactFirePreloadedObservables
	for (const key of map.keys()) if (key.includes('firestore')) map.delete(key)
}
