import {motion} from 'framer-motion';
import {Text, Link, DefaultButton} from '@fluentui/react';
import {useHistory, Link as RouterLink} from 'react-router-dom';

import {Center} from '../components/Center.js';
import {FadeLayout} from '../components/FadeLayout.js';

export function NoRoute() {
	const history = useHistory();
	return (
		<FadeLayout style={{height: '100vh'}}>
			<Center>
				<motion.div style={{display: 'flex', flexDirection: 'column'}}>
					<Text variant="superLarge" style={{marginBottom: '1rem'}}>
						Nothing here
					</Text>
					<Link as={RouterLink} to="/landing" style={{marginBottom: '0.5rem', textAlign: 'center'}}>
						Take me to the landing page.
					</Link>
					<DefaultButton onClick={() => history.goBack()}>Go back</DefaultButton>
				</motion.div>
			</Center>
		</FadeLayout>
	);
}
