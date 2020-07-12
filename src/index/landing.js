import React from 'react'
import {Center} from '../shared/center'
import {Link} from '@fluentui/react'
import {Link as RouterLink} from 'react-router-dom'

export function Landing() {
	return (
		<Center>
			<Link as={RouterLink} to="/">
				Open App
			</Link>
		</Center>
	)
}
