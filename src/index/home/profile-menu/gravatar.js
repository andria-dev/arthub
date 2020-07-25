import {useMachine} from '@xstate/react'
import {useUser} from 'reactfire'
import React, {useEffect} from 'react'
import {FontIcon, ImageIcon, Spinner} from '@fluentui/react'
import {colors} from '../../../shared/theme'
import {gravatarMachine} from '../../shared/machines'

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
	const [state, send] = useMachine(gravatarMachine)

	useEffect(() => {
		if (email) send('FETCH', {email})
	}, [email, send])

	let photo
	if (user?.photoURL) photo = user.photoURL
	else if (state.matches('idle.found')) photo = state.context.url
	else if (state.matches('idle.non_existent'))
		return (
			<ProfileCircle background={colors.pink} {...props}>
				<FontIcon iconName="Contact" style={{color: colors.realPink, fontSize: '2.5rem'}} />
			</ProfileCircle>
		)
	else if (state.matches('loading'))
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
