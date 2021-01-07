import {Suspense, useContext, useMemo} from 'react';

import {createResource} from '../shared/resources.js';
import {fetchImageURL, useUser} from '../shared/firebase.js';
import {Loading} from './Loading.js';

import '../styles/CharacterCard.css';
import {ShareContext} from '../shared/machines.js';

/**
 * @param {{resource: import('../shared/resources.js').ResourceReader<string>, alt: string}} props
 */
function CharacterCardArt({resource, alt}) {
	const imageURL = resource.read();
	return <img className="CharacterCard__cover" src={imageURL} alt={alt} />;
}

/**
 *
 * @param {import('../shared/prop-types.js').Character} character
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
 * 	character: import('../shared/prop-types.js').Character,
 * 	children: any
 * }} props
 */
export function CharacterCard({character, children}) {
	const imageResource = useFirstImageResourceCreator(character);
	const [current] = useContext(ShareContext);

	let className = 'CharacterCard';
	if (current.matches('shareCharacters')) className += ' CharacterCard--share-characters';

	return (
		<figure className={className}>
			{/* TODO: replace alt with alt from data */}
			{imageResource ? (
				<Suspense fallback={<Loading />}>
					<CharacterCardArt resource={imageResource} alt="" />
				</Suspense>
			) : (
				<span className="CharacterCard__letter">{character.name[0]}</span>
			)}

			<figcaption className="CharacterCard__overlay">
				<p className="CharacterCard__name" style={{margin: 0}}>
					{character.name}
				</p>
				{children}
			</figcaption>
		</figure>
	);
}
