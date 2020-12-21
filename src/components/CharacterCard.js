import {Link as RouterLink} from 'react-router-dom'

import {useUser} from '../shared/firebase.js'
import {createResource, fetchImageURL} from '../shared/resources'

import '../styles/character-card.css'

/**
 * @param {{resource: ResourceReader<string>, alt: string}} props
 * @constructor
 */
function CharacterCardArt({resource, alt}) {
	const imageURL = resource.read()
	return <img className="CharacterCard__cover" src={imageURL} alt={alt} />
}

export function CharacterCard({userID, character}) {
	const user = useUser()
	const imageResource = createResource(fetchImageURL(userID, character.files[0]))

	return (
		<figure className="CharacterCard">
			{/*TODO: replace alt with alt from data*/}
			<CharacterCardArt resource={imageResource} alt={`Art of "${character.name}"`} />

			<figcaption className="CharacterCard__overlay">
				<p className="CharacterCard__name">{character.name}</p>
				<RouterLink to={`/character/${character.id}`} className="CharacterCard__view-button">
					View Character
				</RouterLink>
			</figcaption>
		</figure>
	)
}
