import React from 'react'
import {Center} from '../shared/center'
import {Text, Link} from '@fluentui/react'
import {Link as RouterLink} from 'react-router-dom'
import {motion} from 'framer-motion'

export function NoRoute() {
	return (
		<Center>
			<motion.div layout style={{display: 'flex', flexDirection: 'column'}}>
				<Text variant="superLarge" style={{marginBottom: '1rem'}}>
					Nothing here
				</Text>
				<Link as={RouterLink} to="/landing" style={{textAlign: 'center'}}>
					Take me to the landing page.
				</Link>
			</motion.div>
		</Center>
	)
}
