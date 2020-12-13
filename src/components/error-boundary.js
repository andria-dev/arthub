import * as React from 'react'
import {AnimatePresence, motion} from 'framer-motion'

export function Boundary(Component) {
	return class extends React.Component {
		constructor(props) {
			super(props)
			this.state = {status: 'ok', error: null}
		}

		static getDerivedStateFromError(error) {
			return {status: 'bad', error}
		}

		render() {
			if (this.state.status === 'ok') {
				return this.props.children
			} else if (this.state.status === 'bad') {
				return <Component error={this.state.error} />
			}
			return null
		}
	}
}

export const BasicBoundary = Boundary(({error}) => {
	return (
		<AnimatePresence>
			<motion.main initial={{opacity: 0}} animate={{opacity: 1}}>
				<h1>An error has occurred.</h1>
				<h2>I don't know why this happened, please help.</h2>
				<p>
					<strong>{error.name}</strong>: {error.message}
				</p>
			</motion.main>
		</AnimatePresence>
	)
})
