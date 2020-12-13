import {StrictMode, Suspense} from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import * as serviceWorker from './serviceWorker'
import {FirebaseAppProvider, useUser} from 'reactfire'
import {Login, Register} from './pages/authentication'
import {loadTheme, Spinner} from '@fluentui/react'

import {initializeIcons} from 'office-ui-fabric-react/lib/Icons'
import {TransitionRouter} from './components/transition-router'
import {Home} from './pages/home'
import {Landing} from './pages/landing'
import {Center} from './components/center'
import {Route, Redirect} from 'react-router-dom'
import {firebaseConfig} from './shared/firebase'
import {theme} from './shared/theme'
import {BasicBoundary} from './components/error-boundary'
import {NoRoute} from './pages/404'
import {NewCharacter} from './pages/new-character'
import {Character} from './pages/character'

loadTheme(theme)
initializeIcons()

/**
 * A route that will only render when logged in. Redirects to "/login" when logged out.
 * @param as
 * @param props
 * @returns {JSX.Element|null}
 * @constructor
 */
function PrivateRoute({as, ...props}) {
	const user = useUser()

	if (user) return <Route component={as} {...props} />
	return <Redirect to="/login" />
}

/**
 * A route for when you're not logged in. Redirects to the home page when logged in.
 * @param as
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function UnauthenticatedRoute({as, ...props}) {
	const user = useUser()

	if (!user) return <Route component={as} {...props} />
	return <Redirect to="/" />
}

ReactDOM.render(
	<StrictMode>
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
						<PrivateRoute exact as={Character} path="/character/:characterID" />
						<Landing exact path="/landing" />
						<UnauthenticatedRoute exact as={Login} path="/login" />
						<UnauthenticatedRoute exact as={Register} path="/register" />
						<NoRoute exact path="*" />
					</TransitionRouter>
				</Suspense>
			</FirebaseAppProvider>
		</BasicBoundary>
	</StrictMode>,
	document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
