import {Suspense, useMemo} from 'react'
import {Link as RouterLink} from 'react-router-dom'

import {useUser} from '../shared/firebase.js'
import {createResource, fetchImageURL} from '../shared/resources.js'

import '../styles/character-card.css'
import {Center} from './center'
import {Spinner} from '@fluentui/react'

/**
 * @param {{resource: ResourceReader<string>, alt: string}} props
 * @constructor
 */
function CharacterCardArt({resource, alt}) {
	const imageURL = resource.read()
	return <img className="CharacterCard__cover" src={imageURL} alt={alt} />
}

/**
 *
 * @param {{character: Character}} props
 * @returns {JSX.Element}
 * @constructor
 */
export function CharacterCard({character}) {
	const {uid} = useUser()
	const imageResource = useMemo(() => {
		if (character.files.length > 0) return createResource(fetchImageURL(uid, character.files[0]))
		return null
	}, [character.files])

	return (
		<figure className="CharacterCard">
			{/*TODO: replace alt with alt from data*/}
			{imageResource ? (
				<Suspense
					fallback={
						<Center>
							<Spinner />
						</Center>
					}
				>
					<CharacterCardArt resource={imageResource} alt={`Art of "${character.name}"`} />
				</Suspense>
			) : (
				<span className="CharacterCard__letter">{character.name[0]}</span>
			)}

			<figcaption className="CharacterCard__overlay">
				<p className="CharacterCard__name">{character.name}</p>
				<RouterLink to={`/character/${character.id}`} className="CharacterCard__view-button">
					View Character
				</RouterLink>
			</figcaption>
		</figure>
	)
}
