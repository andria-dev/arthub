import React, {Suspense} from 'react'
import ReactDOM from 'react-dom'
import './index/index.css'
import * as serviceWorker from './index/serviceWorker'
import {FirebaseAppProvider, useUser} from 'reactfire'
import {Login, Register} from './index/authentication'
import {loadTheme, Spinner} from '@fluentui/react'

import {initializeIcons} from 'office-ui-fabric-react/lib/Icons'
import {TransitionRouter} from './index/transition-router'
import {Home} from './index/home'
import {Landing} from './index/landing'
import {Center} from './shared/center'
import {Redirect, Route} from 'react-router-dom'
import {firebaseConfig} from './shared/firebase'
import {theme} from './shared/theme'
import {BasicBoundary} from './error-boundary'
import {NoRoute} from './index/404'
import {NewCharacter} from './index/new-character'

loadTheme(theme)
initializeIcons()

function PrivateRoute({as, ...props}) {
	const user = useUser()
	return user ? <Route component={as} {...props} /> : <Login />
}

function UnauthenticatedRoute({as, ...props}) {
	const user = useUser()
	return !user ? <Route component={as} {...props} /> : <Redirect to="/" />
}

ReactDOM.render(
	<React.StrictMode>
		<BasicBoundary>
			<FirebaseAppProvider firebaseConfig={firebaseConfig}>
				<Suspense
					fallback={
						<Center>
							<Spinner label="Preparing everything as fast as we can..." />
						</Center>
					}
				>
					<TransitionRouter>
						<PrivateRoute exact as={Home} path="/" />
						<PrivateRoute exact as={NewCharacter} path="/new-character" />
						<Landing exact path="/landing" />
						<UnauthenticatedRoute exact as={Login} path="/login" />
						<UnauthenticatedRoute exact as={Register} path="/register" />
						<NoRoute exact path="*" />
					</TransitionRouter>
				</Suspense>
			</FirebaseAppProvider>
		</BasicBoundary>
	</React.StrictMode>,
	document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
