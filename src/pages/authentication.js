import {useState} from 'react'

import {motion} from 'framer-motion'
import {Link as RouterLink} from 'react-router-dom'
import {DefaultButton, Link, MessageBar, MessageBarType, PrimaryButton, Stack, Text, TextField} from '@fluentui/react'

import {Center} from '../components/center.js'
import {transitions} from '../shared/theme.js'
import {Notifications} from '../components/notifications.js'
import {firestore, auth, provider as googleProvider} from '../shared/firebase.js'
import {FadeLayout} from '../components/page-transitions'

const initialStatus = {type: 'idle', data: null}

const pageData = {
	title: {
		login: 'Login',
		register: 'Register',
	},
	switchMessage: {
		login: (
			<>
				Don't have an account,{' '}
				<Link as={RouterLink} to="/register">
					register now.
				</Link>
			</>
		),
		register: (
			<>
				Don't have an account,{' '}
				<Link as={RouterLink} to="/login">
					login now.
				</Link>
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
		register(auth, email, password, name) {
			// TODO: add email verification with `user.sendEmailVerification` method
			return auth.createUserWithEmailAndPassword(email, password).then(({user}) => {
				user.updateProfile({
					displayName: name,
				})
				firestore.collection('users').doc(user.uid).set({
					characters: {},
				})
			})
		},
	},
	errorMessage: {
		login: 'Unable to sign in.',
		register: 'Unable to register',
	},
	passwordName: {
		login: 'current-password',
		register: 'new-password',
	},
}

const pageVariants = {
	shown: {opacity: 1},
	hidden: {opacity: 0},
}
const titleVariants = {
	enter: {transform: 'translateX(10rem)'},
	idle: {transform: 'translateX(0rem)'},
	exit: {transform: 'translateX(-10rem)'},
}
const buttonVariants = {
	enter: {transform: 'translateX(-10rem)'},
	idle: {transform: 'translateX(0rem)'},
	exit: {transform: 'translateX(10rem)'},
}

function AuthenticationPage({type}) {
	const [status, setStatus] = useState(initialStatus)

	function resetStatus() {
		setStatus(initialStatus)
	}

	async function handleEmailSignIn(event) {
		event.preventDefault()
		const email = event.target.email.value
		const password = event.target[pageData.passwordName[type]].value
		const name = event.target.name?.value

		try {
			await pageData.authenticate[type](auth, email, password, name)
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
		<FadeLayout style={{height: '100vh'}}>
			<Center className="auth-page">
				<motion.div initial="hidden" animate="shown" exit="hidden" variants={pageVariants}>
					<Stack as="main" horizontalAlign="center">
						<motion.span
							initial="enter"
							animate="idle"
							exit="exit"
							variants={titleVariants}
							transition={transitions.smooth}
						>
							<Text variant="superLarge" as="h1">
								{pageData.title[type]}
							</Text>
						</motion.span>

						<Stack as="form" style={{width: '20rem', maxWidth: 'calc(100vw - 4rem)'}} onSubmit={handleEmailSignIn}>
							{type === 'register' && <TextField label="Name" placeholder="Andria" type="name" name="name" required />}
							<TextField
								label="Email"
								placeholder="name@hey.com"
								autoComplete="email"
								type="email"
								name="email"
								required
							/>
							<TextField
								label="Password"
								placeholder="•••••••••••••••"
								autoComplete="new-password"
								type="password"
								name={pageData.passwordName[type]}
								required
							/>

							<motion.div
								style={{marginTop: '1rem'}}
								initial="enter"
								animate="idle"
								exit="exit"
								variants={buttonVariants}
								transition={transitions.smooth}
							>
								<Stack horizontal horizontalAlign="center">
									<PrimaryButton style={{marginRight: '0.5rem'}} type="submit">
										{pageData.mainButton[type]}
									</PrimaryButton>
									<DefaultButton onClick={handleGoogleSignIn}>{pageData.googleButton[type]}</DefaultButton>
								</Stack>
							</motion.div>
						</Stack>

						<Text as="p" style={{marginTop: '1rem'}}>
							{pageData.switchMessage[type]}
						</Text>
					</Stack>

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
				</motion.div>
			</Center>
		</FadeLayout>
	)
}

export function Login() {
	return <AuthenticationPage type="login" />
}

export function Register() {
	return <AuthenticationPage type="register" />
}
