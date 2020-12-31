import {memo, Suspense, useEffect, useRef, useState} from 'react'
import {Label, Spinner} from '@fluentui/react'

import {Center} from './Center.js'
import {colors} from '../shared/theme.js'
import {artworkWrapperStyles} from './slideshow-parts.js'
import {FadeLayout} from './FadeLayout'
import {debounce} from 'mini-debounce'
import {useId} from '@reach/auto-id'
import 'trix'
import 'trix/dist/trix.css'
import xss from 'xss'
import {Loading} from './Loading'

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
export function CharacterLayout({className, slideshow, name, story, actions, mode, onSubmit, children}) {
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
				<Suspense fallback={<Loading centerStyle={artworkWrapperStyles} label="Fetching artwork" />}>
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
			<FadeLayout style={{height: '100%'}} className={className}>
				{content}
				{children}
			</FadeLayout>
		)
	} else if (mode === 'edit') {
		wrapped = (
			<FadeLayout style={{height: '100%'}} className={className}>
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

export function Trix({defaultValue, onChange, ...props}) {
	const ref = useRef()

	useEffect(() => {
		try {
			const json = JSON.parse(defaultValue)
			if (json) ref.current.editor.loadJSON(json)
		} catch {}
	}, [defaultValue])

	useEffect(() => {
		const trix = ref.current
		function handler(event) {
			if (onChange) onChange(JSON.stringify(ref.current.editor.toJSON()))
		}
		trix.addEventListener('trix-change', handler)
		return () => {
			trix.removeEventListener('trix-change', handler)
		}
	}, [onChange])

	return <trix-editor ref={ref} {...props} />
}
export const CharacterStory = ({story}) => <Trix contentEditable={false} defaultValue={story} />

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
			{multiline ? <Trix {...props} {...focusHandlers} /> : <input {...props} {...focusHandlers} />}
		</div>
	)
}

const debouncedSetItem = debounce((key, value) => localStorage.setItem(key, value), 100)
export function createValueStorer(key) {
	return event => {
		debouncedSetItem(key, event instanceof Event ? event.target.value : event)
	}
}
export function clearStorageKeys(...keys) {
	for (const key of keys) {
		localStorage.setItem(key, '')
	}
}

export function CharacterNameInput({storageKey, defaultValue}) {
	const id = useId('name')
	return (
		<CharacterInput
			id={id}
			name="name"
			label="Name"
			placeholder="Lumiére"
			onChange={createValueStorer(storageKey)}
			defaultValue={defaultValue}
			required
		/>
	)
}
export function CharacterStoryInput({storageKey, setter, defaultValue}) {
	const id = useId('story')
	return (
		<CharacterInput
			id={id}
			name="story"
			label="Character Story"
			placeholder="Tell your characters story and explain their background…"
			className="CharacterStoryInput"
			onChange={createValueStorer(storageKey)}
			defaultValue={defaultValue}
			multiline
			required
		/>
	)
}
