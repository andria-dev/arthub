import {memo, Suspense, useState} from 'react'

import xss from 'xss'
import marked from 'marked'
import {Label, Spinner} from '@fluentui/react'

import {Center} from './center.js'
import {colors} from '../shared/theme.js'
import {artworkWrapperStyles} from './slideshow-parts.js'
import {FadeLayout} from './page-transitions'
import {AutoExpandingTextarea} from './auto-expanding-textarea'
import {debounce} from 'mini-debounce'
import {useId} from '@uifabric/react-hooks'

export const CharacterStory = memo(({story}) => (
	<div className="Character__story" dangerouslySetInnerHTML={{__html: xss(marked(story))}} />
))

/**
 * A component to facilitate in reduction of repeating layout code for pages that display character info.
 *
 * @param {{
 *   mode: 'display',
 *   slideshow: JSX.Element,
 *   name: JSX.Element,
 *   story: JSX.Element,
 *   actions: [JSX.Element],
 *   children: any,
 * } | {
 *   mode: 'edit',
 *   onSubmit: function(React.SyntheticEvent),
 *   slideshow: JSX.Element,
 *   name: JSX.Element,
 *   story: JSX.Element,
 *   actions: [JSX.Element],
 *   children: any,
 * }} props
 * @constructor
 */
export function CharacterLayout({slideshow, name, story, actions, mode, onSubmit, children}) {
	const content = (
		<main style={{height: 'calc(100% - 62px)'}}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					padding: '0 0 45px 0',
					height: 'calc(100% - 45px)',
					overflowY: 'scroll',
				}}
			>
				<Suspense
					fallback={
						<Center style={artworkWrapperStyles}>
							<Spinner label="Fetching artwork" />
						</Center>
					}
				>
					{slideshow}
				</Suspense>

				<article style={{padding: '0 31px', display: 'flex', flexDirection: 'column', flexGrow: 1}}>
					{name}
					{story}
				</article>
			</div>
			<section
				style={{
					position: 'fixed',
					bottom: 0,
					display: 'flex',
					justifyContent: 'space-evenly',
					alignItems: 'center',
					width: '100%',
					height: 62,
					backgroundColor: 'white',
					boxShadow: `${colors.lightOrange} 0 -2px 7px 0`,
				}}
			>
				{actions}
			</section>
		</main>
	)

	let wrapped
	if (mode === 'display') {
		wrapped = (
			<FadeLayout style={{height: '100%'}}>
				{content}
				{children}
			</FadeLayout>
		)
	} else if (mode === 'edit') {
		wrapped = (
			<FadeLayout style={{height: '100%'}}>
				<form onSubmit={onSubmit} style={{display: 'inline'}}>
					{content}
				</form>
				{children}
			</FadeLayout>
		)
	} else {
		throw new Error(`Invalid mode '${mode}' is not supported.`)
	}

	return wrapped
}

export function CharacterInput({className, multiline, label, ...props}) {
	const [status, setStatus] = useState('idle')
	const focusHandlers = {
		onFocus() {
			setStatus('focus')
		},
		onBlur() {
			setStatus('idle')
		},
	}

	return (
		<div className={'CharacterInput ' + (className ?? '')}>
			{label && (
				<Label htmlFor={props.id} style={{textDecoration: status === 'focus' ? 'underline' : 'none'}}>
					{label}
				</Label>
			)}
			{multiline ? (
				<AutoExpandingTextarea fontSize={20} lineHeight={25} minimumRows={5} {...props} {...focusHandlers} />
			) : (
				<input {...props} {...focusHandlers} />
			)}
		</div>
	)
}

const debouncedSetItem = debounce((key, value) => localStorage.setItem(key, value), 100)
export function createValueStorer(key, setter) {
	return event => {
		const {value} = event.target

		setter(value)
		debouncedSetItem(key, value)
	}
}

export function CharacterNameInput({storageKey, setter, value}) {
	const id = useId('name')
	return (
		<CharacterInput
			id={id}
			label="Name"
			placeholder="Lumiére"
			onChange={createValueStorer(storageKey, setter)}
			value={value}
			required
		/>
	)
}
export function CharacterStoryInput({storageKey, setter, value}) {
	const id = useId('story')
	return (
		<CharacterInput
			id={id}
			label="Character Story"
			placeholder="Tell your characters story and explain their background…"
			className="CharacterStoryInput"
			onChange={createValueStorer(storageKey, setter)}
			value={value}
			multiline
			required
		/>
	)
}

export function clearStorageKeys(...keys) {
	for (const key of keys) {
		localStorage.setItem(key, '')
	}
}
