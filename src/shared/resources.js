import {useEffect, useState} from 'react'

/**
 * This function handles the reading of a resource — suspension, results, and errors.
 * Throws the suspender if loading. Returns the result if successful. Throws the error if one occurred.
 *
 * @template V
 * @param {{status: string, suspender: Promise, result: V}} resource
 * @returns {V}
 */
export function readResource({status, suspender, result}) {
	switch (status) {
		case 'loading':
			throw suspender
		case 'error':
			throw result
		case 'success':
		default:
			return result
	}
}

/**
 * @typedef {Object} ResourceReader
 * @template V
 * @property {function(): V} read
 */

/**
 * Creates a resource for use with the React Suspense API based on a Promise.
 *
 * @template V
 * @param {Promise} promise
 * @returns {ResourceReader<V>}
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
			return readResource({status, suspender, result})
		},
	}
}

/**
 * Attempts to read one value from the subscription and then unsubscribe.
 * During the time it takes for the first value of the subscription to come through, the resource is suspended.
 *
 * @template V
 * @template E
 * @param {function(function(V, E))} subscribe
 * @returns {ResourceReader<V>}
 */
export function createResourceFromSubscription(subscribe) {
	let status = 'loading'
	let result

	const suspender = new Promise((resolve, reject) => {
		const unsubscribe = subscribe((data, error) => {
			unsubscribe()
			if (error) {
				status = 'error'
				result = error
				reject(error)
			} else {
				status = 'success'
				result = data
				resolve(data)
			}
		})
	})

	return {
		read() {
			return readResource({status, suspender, result})
		},
	}
}

/**
 * Creates a resource from a Firebase Document.
 * @template V
 * @param {DocumentReference<V>} documentRef
 * @returns {ResourceReader<V>}
 */
export function createDocumentResource(documentRef) {
	console.log('Creating a new document resource')
	return createResource(documentRef.get().then(doc => doc.data()))
}

/**
 * A Suspense-friendly hook that reads a resource for getting the value of a document in the Firestore.
 * Then, whenever the document's data changes, this hook will update the returned value.
 *
 * @template V
 * @param {DocumentReference<V>} documentRef
 * @param {ResourceReader<V>} resource
 * @returns {V}
 */
export function useDocumentResource(documentRef, resource) {
	const [result, setResult] = useState(resource.read())

	useEffect(() => {
		let isFirst = true
		return documentRef.onSnapshot((snapshot, error) => {
			if (isFirst) {
				isFirst = false
				return
			}

			if (error) console.warn(error)
			else setResult(snapshot.data())
		})
	}, [documentRef])

	return result
}
