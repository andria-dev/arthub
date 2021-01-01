import {Suspense, useMemo} from 'react';

import {motion} from 'framer-motion';
import {createResource} from '../shared/resources.js';
import {fetchImageURL, useUser} from '../shared/firebase.js';
import {Loading} from './Loading.js';

import '../styles/CharacterCard.css';

/**
 * @param {{resource: import('../shared/resources.js').ResourceReader<string>, alt: string}} props
 */
function CharacterCardArt({resource, alt}) {
	const imageURL = resource.read();
	return <img className="CharacterCard__cover" src={imageURL} alt={alt} />;
}

/**
 *
 * @param {import('../shared/firebase.js').Character} character
 * @returns {import('../shared/resources.js').ResourceReader<string>}
 */
function useFirstImageResourceCreator(character) {
	const {uid} = useUser();
	return useMemo(() => {
		if (character.files.length > 0) return createResource(fetchImageURL(uid, character.files[0]));
		return null;
	}, [character.files, uid]);
}

/**
 *
 * @param {{
 * 	mode: 'view-characters' | 'share-characters',
 * 	character: import('../shared/firebase.js').Character,
 * 	children: any
 * }} props
 */
export function CharacterCard({mode, character, children}) {
	const imageResource = useFirstImageResourceCreator(character);

	return (
		<figure className={`CharacterCard CharacterCard--${mode}`}>
			{/* TODO: replace alt with alt from data */}
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
				<p className="CharacterCard__name">
					{character.name}
				</p>
				{children}
			</figcaption>
		</figure>
	);
}
