import {colors} from '../shared/theme'
import {PROFILE_SIZE, ProfilePhoto} from './profile-photo'
import {AnimatePresence, motion} from 'framer-motion'
import {useMachine} from '@xstate/react'
import {useEffect, useRef} from 'react'
import {forEachNonDescendantTree} from '../shared/helpers'
import {transitions} from '../shared/config'
import {Text} from '@fluentui/react'
import {profileMenuMachine} from '../shared/machines'

const profileMenuStyles = {
	position: 'absolute',
	top: '27px',
	right: '20px',
	display: 'flex',
	flexDirection: 'column',
	backgroundColor: colors.pink,
	borderRadius: '1.6rem',
	zIndex: 2,
	overflow: 'hidden',
}
const backdropStyles = {
	position: 'absolute',
	left: 0,
	top: 0,
	width: '100vw',
	height: '100vh',
	background: 'white',
	zIndex: 1,
}

const profileMenuButtonStyles = {
	position: 'relative',
	display: 'flex',
	alignItems: 'center',
	overflow: 'hidden',
	width: PROFILE_SIZE,
	padding: 0,
	background: colors.lightPink,
	border: 'none',
	borderRadius: '2rem',
	cursor: 'pointer',
	outline: 'none',
	WebkitTapHighlightColor: 'rgba(0,0,0,0)',
	zIndex: 2,
}
const nameWrapperStyles = {
	flexGrow: 1,
	width: '100%',
	position: 'absolute',
	left: `calc(50% + ${PROFILE_SIZE}px / 2)`,
	transform: 'translateX(-50%)',
}
const nameStyles = {
	fontWeight: 400,
	letterSpacing: 1,
	lineHeight: 1.2,
	textAlign: 'center',
}

const listVariants = {
	visible: {
		opacity: 1,
		height: 259 - PROFILE_SIZE,
		transition: {
			staggerChildren: 0.05,
		},
	},
	hidden: {
		opacity: 0,
		height: 0,
		transition: {
			duration: 0,
		},
	},
}
const listStyles = {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	overflow: 'hidden',
}
const itemVariants = {
	visible: {opacity: 1, y: 0},
	hidden: {opacity: 0, y: 25, transition: {duration: 0}},
}
const itemStyles = {
	width: '100%',
	padding: '10px 0',
	margin: '0.1rem 0',
	fontSize: '18px',
	fontFamily: 'Inter',
	fontWeight: 600,
	border: 'none',
	cursor: 'pointer',
}
const itemHoverStyles = {scale: 1.05}
const itemTapStyles = {scale: 0.95}

export function ProfileMenuItem(props) {
	return (
		<motion.button
			variants={itemVariants}
			style={itemStyles}
			initial={false}
			whileHover={itemHoverStyles}
			whileTap={itemTapStyles}
			className="ProfileMenuItem"
			{...props}
		/>
	)
}

export function ProfileMenu({email, name, children}) {
	const [state, send, service] = useMachine(profileMenuMachine)
	const backdropRef = useRef(null)

	// handle TAP_AWAY, ESC, and inert
	useEffect(() => {
		function handleTapAway(event) {
			if (backdropRef.current === event.target) send('TAP_AWAY')
		}
		function handleESC(event) {
			if (event.key === 'Escape' || event.key === 'Esc') send('ESC')
		}

		const nonDescendantTrees = new Set()
		function addListeners() {
			window.addEventListener('click', handleTapAway)
			window.addEventListener('keydown', handleESC)
			forEachNonDescendantTree(document.getElementById('profile-menu'), element => {
				nonDescendantTrees.add(element)
				element.inert = true
			})
		}
		function removeListeners() {
			window.removeEventListener('click', handleTapAway)
			window.removeEventListener('keydown', handleESC)
			for (const element of nonDescendantTrees) element.inert = false
		}

		const subscription = service.subscribe(state => {
			if (state.matches('open')) addListeners()
			else removeListeners()
		})

		return () => {
			removeListeners()
			subscription.unsubscribe()
		}
	}, [service, send])

	let width
	let height = PROFILE_SIZE
	if (state.matches('closed')) width = PROFILE_SIZE
	else if (state.matches('partiallyOpen')) width = PROFILE_SIZE * 3
	else if (state.matches('open')) {
		width = 249
		height = 259
	}

	let buttonLabel = 'Open profile menu'
	if (state.matches('open')) buttonLabel = 'Close profile menu'

	// TODO: Add focus style to profile menu close button (while profile menu is open)
	return (
		<div id="profile-menu">
			<motion.div style={profileMenuStyles} animate={{height}} transition={transitions.menu}>
				{/* Button to open menu */}
				<motion.button
					style={profileMenuButtonStyles}
					animate={{width}}
					onHoverStart={() => send('HOVER_START')}
					onHoverEnd={() => send('HOVER_END')}
					onFocus={() => send('FOCUS')}
					onBlur={() => send('BLUR')}
					onClick={() => send('TAP_TOGGLE')}
					transition={transitions.menu}
					aria-label={buttonLabel}
					title={buttonLabel}
				>
					<motion.span
						animate={{opacity: state.matches('partiallyOpen') || state.matches('open') ? 1 : 0}}
						style={nameWrapperStyles}
						transition={{type: 'spring', mass: 0.2}}
					>
						<Text variant="mediumTitle" style={nameStyles}>
							{state.matches('open') ? 'Profile Menu' : name}
						</Text>
					</motion.span>
					<ProfilePhoto email={email} />
				</motion.button>

				{/* Menu buttons */}
				<AnimatePresence>
					{state.matches('open') && (
						<motion.div initial="hidden" animate="visible" exit="hidden" variants={listVariants} style={listStyles}>
							{children}
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
			<AnimatePresence>
				{(state.matches('open') || state.matches('partiallyOpen')) && (
					<motion.div
						ref={backdropRef}
						initial={{opacity: 0}}
						animate={{opacity: 0.81}}
						exit={{opacity: 0}}
						style={backdropStyles}
					/>
				)}
			</AnimatePresence>
		</div>
	)
}
