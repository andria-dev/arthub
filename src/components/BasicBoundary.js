import * as React from 'react';

import {AnimatePresence} from 'framer-motion';

import {FadeLayout} from './FadeLayout.js';
import {Center} from './Center.js';

export function Boundary(Component) {
	return class extends React.Component {
		constructor(props) {
			super(props);
			this.state = {status: 'ok', error: null};
		}

		static getDerivedStateFromError(error) {
			return {status: 'bad', error};
		}

		render() {
			const {status, error} = this.state;
			const {children} = this.props;

			if (status === 'ok') {
				return children;
			}

			if (status === 'bad') {
				return <Component error={error} />;
			}

			return null;
		}
	};
}

export const BasicBoundary = Boundary(({error}) => (
	<AnimatePresence>
		<FadeLayout style={{height: '100vh'}}>
			<Center>
				<h1>An error has occurred.</h1>
				<h2>I don't know why this happened, please help.</h2>
				<p>
					<strong>{error.name}</strong>: {error.message}
				</p>
			</Center>
		</FadeLayout>
	</AnimatePresence>
));
