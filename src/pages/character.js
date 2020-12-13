import {useMemo} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {Text} from '@fluentui/react'
import {useFirestore, useFirestoreDoc, useStorage, useUser} from 'reactfire'
import {motion} from 'framer-motion'
import {colors} from '../shared/theme'
import {ActionButton} from '../components/action-button'
import xss from 'xss'
import marked from 'marked'
import {useMachine, useService} from '@xstate/react'
import {plainSlideshowMachine} from '../shared/machines'

function CharacterSlideshow({service}) {
	const [state, send] = useService(service)
	console.log(state.value)

	switch (state.value) {
		case 'fetching':
			return <Text>Loading...</Text>

		case 'loaded':
			// TODO: add real alt to character art
			return <img src={state.context.imageURL} alt="Artwork" />

		case 'failed':
		default:
			// TODO: add real failure message and retry button
			return <Text>Failed</Text>
	}
}

export function Character() {
	const history = useHistory()
	const {characterID} = useParams()

	function back() {
		history.replace('/')
	}

	const storage = useStorage()
	const user = useUser()
	const userRef = useFirestore().collection('users').doc(user.uid)
	const userInfo = useFirestoreDoc(userRef)

	const character = useMemo(() => {
		const characters = userInfo.data().characters
		return characters.find(character => character.id === characterID)
	}, [userInfo, characterID])

	const [state, send, interpreter] = useMachine(
		plainSlideshowMachine.withContext({
			...plainSlideshowMachine.context,
			storage,
			userID: user.uid,
			fileIDs: character.files,
		}),
	)

	let slideshow = null
	if (state.matches('photos')) {
		const imageService = state.context.imageURLs[state.context.currentPage]

		if (imageService) slideshow = <CharacterSlideshow service={imageService} />
	}

	return (
		<motion.div layout style={{height: '100%'}}>
			<main style={{height: 'calc(100% - 62px)'}}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						padding: '0 0 45px 0',
						height: 'calc(100% - 45px)',
						overflowY: 'scroll',
					}}
				>
					<div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>{slideshow}</div>

					<div style={{padding: '0 31px', display: 'flex', flexDirection: 'column', flexGrow: 1}}>
						<h2 className="Character__name">{character.name}</h2>
						<div className="Character__story" dangerouslySetInnerHTML={{__html: xss(marked(character.story))}} />
					</div>
				</div>
				<section
					style={{
						position: 'fixed',
						display: 'flex',
						justifyContent: 'space-evenly',
						alignItems: 'center',
						width: '100%',
						height: 62,
						backgroundColor: 'white',
						boxShadow: `${colors.lightOrange} 0 -2px 7px 0`,
					}}
				>
					<ActionButton variant="flat" iconName="Back" onClick={back} type="button">
						Back
					</ActionButton>
					<ActionButton variant="flat" iconName="Edit" type="submit">
						Edit
					</ActionButton>
				</section>
			</main>
		</motion.div>
	)
}
