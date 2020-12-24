import {useMemo} from 'react'

import {useParams} from 'react-router-dom'

import {firestore, useCharacterWithImages, useUser, withUserResource} from '../shared/firebase.js'

export const EditCharacterPage = withUserResource(({resource}) => {
	const {characterID: id} = useParams()
	const {character, imageResources} = useCharacterWithImages(id, resource)
})
