import {StrictMode, Suspense} from 'react'
import ReactDOM from 'react-dom'
import {loadTheme, Spinner} from '@fluentui/react'
import {Route, Redirect} from 'react-router-dom'
import {initializeIcons} from 'office-ui-fabric-react/lib/Icons'

import {Login, Register} from './pages/authentication.js'
import {TransitionRouter} from './components/transition-router.js'
import {Home} from './pages/home.js'
import {Landing} from './pages/landing.js'
import {Center} from './components/center.js'
import {FirebaseProvider, useUser} from './shared/firebase.js'
import {theme} from './shared/theme.js'
import {BasicBoundary} from './components/error-boundary.js'
import {NoRoute} from './pages/404.js'
import {NewCharacter} from './pages/new-character.js'
import {CharacterPage} from './pages/character.js'

import * as serviceWorker from './serviceWorker.js'
import './styles/index.css'
import {EditCharacterPage} from './pages/edit-character'

loadTheme(theme)
initializeIcons()

/**
 * A route that will only render when logged in. Redirects to "/login" when logged out.
 * @returns {JSX.Element}
 * @constructor
 */
function PrivateRoute({as, ...props}) {
	const user = useUser()

	if (user) return <Route component={as} {...props} />
	return <Redirect to="/login" />
}

/**
 * A route for when you're not logged in. Redirects to the home page when logged in.
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
			<Suspense
				fallback={
					<Center>
						<Spinner label="Preparing everything as fast as we can..." />
					</Center>
				}
			>
				<FirebaseProvider>
					<TransitionRouter>
						<PrivateRoute exact as={Home} path="/" />
						<PrivateRoute exact as={NewCharacter} path="/new-character" />
						<PrivateRoute exact as={CharacterPage} path="/character/:characterID" />
						<PrivateRoute exact as={EditCharacterPage} path="/edit-character/:characterID" />
						<Landing exact path="/landing" />
						<UnauthenticatedRoute exact as={Login} path="/login" />
						<UnauthenticatedRoute exact as={Register} path="/register" />
						<NoRoute exact path="*" />
					</TransitionRouter>
				</FirebaseProvider>
			</Suspense>
		</BasicBoundary>
	</StrictMode>,
	document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
