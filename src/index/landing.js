import React from 'react'
import {Center} from '../shared/center'
import {Link} from '@fluentui/react'
import {Link as RouterLink} from 'react-router-dom'
import {motion} from 'framer-motion'

export function Landing() {
	return (
		<Center>
			<motion.div layout>
				<Link as={RouterLink} to="/">
					Open App
				</Link>
			</motion.div>
		</Center>
	)
}
