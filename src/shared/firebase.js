import {
	createContext, useContext, useEffect, useMemo, useState,
} from 'react';

import ky from 'ky';
import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/storage';

import {
	createQueryResource,
	createResource,
	createResourceFromSubscription,
	useQueryResource,
} from './resources.js';

export const config = {
	apiKey: 'AIzaSyDRi5_luFxHRmlAZzpWB6MXXozfc3PReyE',
	authDomain: 'private-art-hub-project.firebaseapp.com',
	databaseURL: 'https://private-art-hub-project.firebaseio.com',
	projectId: 'private-art-hub-project',
	storageBucket: 'private-art-hub-project.appspot.com',
	messagingSenderId: '548647715304',
	appId: '1:548647715304:web:1e260bd591e4424ab7245d',
	measurementId: 'G-0JR1KQQPJ3',
};
firebase.initializeApp(config);

export default firebase;

export const firestore = firebase.firestore();
window.firestore = firestore;
firestore.settings({timestampsInSnapshots: true});
firestore.enablePersistence().catch((error) => console.warn(error));

export const storage = firebase.storage();
export const auth = firebase.auth();
window.auth = auth;
export const provider = new firebase.auth.GoogleAuthProvider();

/**
 * @typedef {Object} FirebaseData
 * @property {firebase.User | null} user
 * @property {import('./prop-types.js').Character[]} characters
 */

/** @type {React.Context<FirebaseData>} */
const FirebaseContext = createContext({user: null, characters: []});

/**
 * @param {{
 * 	user: import('firebase').User,
 * 	resource: import('./resources.js').ResourceReader<import('./prop-types.js').Character[]>,
 * 	children: any,
 * }} props
 */
function FirebaseCharactersResource({
	user, resource, children,
}) {
	/** @type {import('firebase').firestore.Query<import('./prop-types.js').Character>}
	 * @ts-ignore */
	const query = firestore.collection('characters').where('roles.owner', '==', user.uid);
	const characters = useQueryResource(query, resource);
	const value = useMemo(() => ({user, characters}), [user, characters]);
	return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

/**
 * @param {{resource: import('./resources.js').ResourceReader<firebase.User>, children: any}} props
 * @returns {JSX.Element}
 */
function FirebaseUserResource({resource, children}) {
	const [user, setUser] = useState(resource.read());

	useEffect(() => auth.onAuthStateChanged((newUser, error) => {
		if (error) console.warn(error);
		else setUser(newUser);
	}), []);

	/** @type {import('./resources.js').ResourceReader<import('./prop-types.js').Character[]>}
	 * @ts-ignore */
	const charactersQueryResource = useMemo(() => {
		if (user?.uid) {
			return createQueryResource(
				firestore.collection('characters').where('roles.owner', '==', user.uid),
			);
		}
		return null;
	}, [user?.uid]);

	if (!user) {
		return <FirebaseContext.Provider value={{user, characters: []}}>{children}</FirebaseContext.Provider>;
	}

	return (
		<FirebaseCharactersResource user={user} resource={charactersQueryResource}>
			{children}
		</FirebaseCharactersResource>
	);
}

/**
 * Provides access to active Firebase values.
 * @returns {JSX.Element}
 */
export function FirebaseProvider({children}) {
	const resource = createResourceFromSubscription(auth.onAuthStateChanged.bind(auth));
	return <FirebaseUserResource resource={resource}>{children}</FirebaseUserResource>;
}

/** @returns {firebase.User} */
export function useUser() {
	const state = useContext(FirebaseContext);
	return state.user;
}

/**
 * @returns {Array<import('./prop-types.js').Character>}
 */
export function useCharacters() {
	const state = useContext(FirebaseContext);
	return state.characters;
}

const imageDataURLCache = new Map();

/**
 * Retrieves the URL of an image from a file Id then fetches the image and caches then returns the data URL.
 * @param {string} userId
 * @param {string} fileId
 * @returns {Promise<string|any>}
 */
export async function fetchImageURL(userId, fileId) {
	if (imageDataURLCache.has(fileId)) return imageDataURLCache.get(fileId);

	const url = await storage.ref().child(`${userId}/${fileId}`).getDownloadURL();
	return fetch(url)
		.then((res) => res.blob())
		.then((blob) => {
			const dataURL = URL.createObjectURL(blob);
			imageDataURLCache.set(fileId, dataURL);
			return dataURL;
		});
}

/**
 * Takes a character's Id and user document resource and retrieves the specified character.
 * After that, each image is fetched and a resource is created for each fetch
 * @param {string} id The character's Id.
 * @returns {{
 * 	character: import('./prop-types.js').Character,
 * 	imageResources: Array<import('./resources.js').ResourceReader<string>>
 * }}
 */
export function useCharacterWithImages(id) {
	const user = useUser();
	const characters = useCharacters();

	return useMemo(() => {
		const character = characters.find((currentCharacter) => currentCharacter.id === id);
		const imageResources = character?.files?.map(
			(currentId) => createResource(fetchImageURL(user.uid, currentId)),
		) ?? [];
		return {character, imageResources};
	}, [characters, user?.uid, id]);
}

export const corsAnywhere = ky.create({prefixUrl: '//cors-anywhere.herokuapp.com/'});
