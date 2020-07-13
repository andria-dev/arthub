import React from 'react'
import {AnimatePresence} from 'framer-motion'
import {BrowserRouter, Route, Switch} from 'react-router-dom'

export function TransitionRouter({children}) {
	function AnimatedSwitch({location}) {
		return (
			<AnimatePresence exitBeforeEnter initial={false}>
				<Switch location={location} key={location.pathname} style={{width: '100%', height: '100%'}}>
					{children}
				</Switch>
			</AnimatePresence>
		)
	}

	return (
		<BrowserRouter>
			<Route render={AnimatedSwitch} />
		</BrowserRouter>
	)
}
