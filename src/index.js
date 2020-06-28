import React, {Suspense} from 'react'
import ReactDOM from 'react-dom'
import './index/index.css'
import * as serviceWorker from './index/serviceWorker'
import {FirebaseAppProvider, useUser} from 'reactfire'
import {Redirect} from '@reach/router'
import {Login, Register} from './index/authentication'
import {Spinner} from '@fluentui/react'
import {Home} from './index/home'
import {Center} from './shared/center'

import {initializeIcons} from 'office-ui-fabric-react/lib/Icons'
import {TransitionRouter} from './index/transition-router'

initializeIcons()

const firebaseConfig = {
  apiKey: 'AIzaSyDRi5_luFxHRmlAZzpWB6MXXozfc3PReyE',
  authDomain: 'private-art-hub-project.firebaseapp.com',
  databaseURL: 'https://private-art-hub-project.firebaseio.com',
  projectId: 'private-art-hub-project',
  storageBucket: 'private-art-hub-project.appspot.com',
  messagingSenderId: '548647715304',
  appId: '1:548647715304:web:1e260bd591e4424ab7245d',
  measurementId: 'G-0JR1KQQPJ3',
}

function PrivateRoute({as: Route, ...props}) {
  const user = useUser()
  return user ? <Route {...props} /> : <Login />
}

function UnauthenticatedRoute({as: Route, ...props}) {
  const user = useUser()
  return !user ? <Route {...props} /> : <Redirect to="/" noThrow />
}

ReactDOM.render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Suspense
        fallback={
          <Center>
            <Spinner label="Preparing everything as fast as we can..." />
          </Center>
        }
      >
        <TransitionRouter>
          <PrivateRoute as={Home} path="/" />
          <UnauthenticatedRoute as={Login} path="/login" />
          <UnauthenticatedRoute as={Register} path="/register" />
        </TransitionRouter>
      </Suspense>
    </FirebaseAppProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
