import React from 'react'
import {useMachine} from '@xstate/react'
import {useUser, useStorage} from 'reactfire'
import {Link as RouterLink} from 'react-router-dom'

import '../styles/character-card.css'
import {ImageLoadingMachine} from '../shared/machines'

export function CharacterCard({character}) {
	const user = useUser()
	const storage = useStorage()
	const [current] = useMachine(
		ImageLoadingMachine.withContext({
			storage,
			userID: user.uid,
			fileID: character.files[0],
		}),
	)

	console.log('Character', character)
	return (
		<figure className="CharacterCard">
			{/*TODO: show skeleton image*/}
			{current.matches('fetching') ? <p>loading</p> : null}
			{/*TODO: replace alt with alt from data*/}
			{current.matches('loaded') ? (
				<img className="CharacterCard__cover" src={current.context.imageURL} alt={`Art of "${character.name}"`} />
			) : null}
			<figcaption className="CharacterCard__overlay">
				<p className="CharacterCard__name">{character.name}</p>
				<RouterLink to={`/character/${character.id}`} className="CharacterCard__view-button">
					View Character
				</RouterLink>
			</figcaption>
		</figure>
	)
}
