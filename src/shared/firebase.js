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

const functionsPrefixURL =
	process.env.NODE_ENV === 'production'
		? 'https://us-central1-private-art-hub-project.cloudfunctions.net/'
		: 'http://localhost:5001/private-art-hub-project/us-central1/'
export const functions = ky.create({prefixUrl: functionsPrefixURL})
