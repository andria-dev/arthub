import {assign, Machine} from 'xstate'
import {useMachine} from '@xstate/react'
import {useUser} from 'reactfire'
import React, {useEffect} from 'react'
import {FontIcon, ImageIcon, Spinner} from '@fluentui/react'
import {functions} from '../../../shared/firebase'
import {colors} from '../../../shared/theme'

async function fetchGravatarThumbnail(email) {
	const blob = await functions.get(`gravatar?email=${email}`).blob()
	return URL.createObjectURL(blob)
}

const gravatarMachine = Machine({
	id: 'gravatar',
	initial: 'idle',
	context: {url: null, error: null},
	states: {
		idle: {
			initial: 'initial',
			states: {
				initial: {},
				found: {
					type: 'final',
				},
				non_existent: {
					type: 'final',
				},
				failure: {
					type: 'final',
				},
			},
			on: {FETCH: 'loading'},
		},
		loading: {
			invoke: {
				src: (ctx, event) => fetchGravatarThumbnail(event.email),
				onDone: [
					{
						target: 'idle.found',
						actions: assign({url: (ctx, event) => event.data}),
					},
				],
				onError: [
					{
						target: 'idle.non_existent',
						cond: (ctx, event) => {
							return event?.data?.response?.status === 404
						},
					},
					{
						target: 'idle.failure',
						actions: assign({error: (ctx, event) => event?.data}),
					},
				],
			},
			on: {FETCH: 'loading'},
		},
	},
})

function Circle({children, as: Component = 'div', background = 'none', size, style = {}, ...props}) {
	return (
		<Component
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				background,
				borderRadius: '50%',
				width: size,
				height: size,
				...style,
			}}
			{...props}
		>
			{children}
		</Component>
	)
}

export const PROFILE_SIZE = 50
function ProfileCircle({style = {}, ...props}) {
	return <Circle size={PROFILE_SIZE} style={{border: 'none', overflow: 'hidden', ...style}} {...props} />
}

export function ProfilePhoto({email, ...props}) {
	const user = useUser()
	const [current, send] = useMachine(gravatarMachine)

	useEffect(() => {
		if (email) send('FETCH', {email})
	}, [email, send])

	let photo
	if (user.photoURL) photo = user.photoURL
	else if (current.matches('idle.found')) photo = current.context.url
	else if (current.matches('idle.non_existent'))
		return (
			<ProfileCircle background={colors.pink} {...props}>
				<FontIcon iconName="Contact" style={{color: colors.realPink, fontSize: '2.5rem'}} />
			</ProfileCircle>
		)
	else if (current.matches('loading'))
		return (
			<ProfileCircle background={colors.pink} {...props}>
				<Spinner />
			</ProfileCircle>
		)
	else
		return (
			<ProfileCircle background={colors.pink} {...props}>
				<FontIcon iconName="StatusCircleExclamation" style={{color: colors.realPink, fontSize: '2.25rem'}} />
			</ProfileCircle>
		)

	return (
		<ProfileCircle {...props}>
			<ImageIcon
				className="no-overflow"
				imageProps={{src: photo, objectFit: 'cover', width: PROFILE_SIZE, height: PROFILE_SIZE}}
			/>
		</ProfileCircle>
	)
}
