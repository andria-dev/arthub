import {motion} from 'framer-motion'
import {Link} from '@fluentui/react'
import {Link as RouterLink} from 'react-router-dom'

import {Center} from '../components/center.js'
import {FadeLayout} from '../components/page-transitions.js'

export function Landing() {
	return (
		<FadeLayout style={{height: '100vh'}}>
			<Center>
				<motion.div layout>
					<Link as={RouterLink} to="/">
						Open App
					</Link>
				</motion.div>
			</Center>
		</FadeLayout>
	)
}
