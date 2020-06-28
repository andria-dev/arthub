import {useAuth} from 'reactfire'
import React, {useState} from 'react'

import {DefaultButton, MessageBar, MessageBarType, PrimaryButton, Stack, Text, TextField} from '@fluentui/react'
import {Link} from '@reach/router'
import * as firebase from 'firebase'
import {Center} from '../shared/center'
import {Notifications} from './authentication/notifications'

import './authentication/transitions.css'

const googleProvider = new firebase.auth.GoogleAuthProvider()
const initialStatus = {type: 'idle', data: null}

const pageData = {
  title: {
    login: 'Login',
    register: 'Register',
  },
  switchMessage: {
    login: (
      <>
        Don't have an account, <Link to={`/register`}>register now.</Link>
      </>
    ),
    register: (
      <>
        Don't have an account, <Link to={`/login`}>login now.</Link>
      </>
    ),
  },
  mainButton: {
    login: 'Sign in',
    register: 'Register',
  },
  googleButton: {
    login: 'Sign in with Google',
    register: 'Register with Google',
  },
  authenticate: {
    login(auth, email, password) {
      return auth.signInWithEmailAndPassword(email, password)
    },
    register(auth, email, password) {
      return auth.createUserWithEmailAndPassword(email, password)
    },
  },
  errorMessage: {
    login: 'Unable to sign in.',
    register: 'Unable to register',
  },
}

function AuthenticationPage({type}) {
  const auth = useAuth()
  const [status, setStatus] = useState(initialStatus)

  function resetStatus() {
    setStatus(initialStatus)
  }

  async function handleEmailSignIn(event) {
    event.preventDefault()
    const email = event.target.email.value
    const password = event.target.password.value

    try {
      await pageData.authenticate[type](auth, email, password)
    } catch (error) {
      setStatus({type: 'auth-error', data: error.message})
    }
  }

  async function handleGoogleSignIn() {
    try {
      await auth.signInWithPopup(googleProvider)
    } catch (error) {
      setStatus({type: 'auth-error', data: error.message})
    }
  }

  return (
    <>
      <Center className="auth-page">
        <Stack as="main" horizontalAlign="center">
          <Text as="h1" variant="superLarge">
            {pageData.title[type]}
          </Text>

          <Stack as="form" style={{width: '20rem'}} onSubmit={handleEmailSignIn}>
            <TextField label="Email" placeholder="name@hey.com" type="email" name="email" required />
            <TextField label="Password" placeholder="•••••••••••••••" type="password" name="password" required />

            <Stack as="section" style={{marginTop: '1rem'}} horizontal horizontalAlign="center">
              <PrimaryButton style={{marginRight: '0.5rem'}} type="submit">
                {pageData.mainButton[type]}
              </PrimaryButton>
              <DefaultButton onClick={handleGoogleSignIn}>{pageData.googleButton[type]}</DefaultButton>
            </Stack>
          </Stack>

          <Text as="p" style={{marginTop: '1rem'}}>
            {pageData.switchMessage[type]}
          </Text>
        </Stack>
      </Center>

      <Notifications>
        {status.type === 'auth-error' && (
          <MessageBar
            messageBarType={MessageBarType.error}
            onDismiss={resetStatus}
            dismissButtonAriaLabel="Close"
            truncated
          >
            {pageData.errorMessage[type]}:
            <br />
            {status.data}
          </MessageBar>
        )}
      </Notifications>
    </>
  )
}

export function Login() {
  return <AuthenticationPage type="login" />
}

export function Register() {
  return <AuthenticationPage type="register" />
}
