import {Suspense, useMemo} from 'react'

import {motion} from 'framer-motion'
import {createResource} from '../shared/resources.js'
import {fetchImageURL, useUser} from '../shared/firebase.js'
import {Loading} from './Loading.js'

import '../styles/CharacterCard.css'

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
 * @param {Character} character
 * @returns {ResourceReader<string>}
 */
function useFirstImageResourceCreator(character) {
	const {uid} = useUser()
	return useMemo(() => {
		if (character.files.length > 0) return createResource(fetchImageURL(uid, character.files[0]))
		return null
	}, [character.files, uid])
}

/**
 *
 * @param {{character: Character, children: any}} props
 * @returns {JSX.Element}
 * @constructor
 */
export function CharacterCard({mode, character, children}) {
	const imageResource = useFirstImageResourceCreator(character)

	return (
		<figure className={`CharacterCard CharacterCard--${mode}`}>
			{/*TODO: replace alt with alt from data*/}
			{imageResource ? (
				<Suspense fallback={<Loading />}>
					<motion.div layoutId={`character-art-${character.id}`}>
						<CharacterCardArt resource={imageResource} alt="" />
					</motion.div>
				</Suspense>
			) : (
				<span className="CharacterCard__letter">{character.name[0]}</span>
			)}

			<figcaption className="CharacterCard__overlay">
				<p className="CharacterCard__name" layoutId={`card-title-${character.id}`}>
					{character.name}
				</p>
				{children}
			</figcaption>
		</figure>
	)
}
