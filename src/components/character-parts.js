import {
	Suspense, useEffect, useRef, useState,
} from 'react';

import {Label} from '@fluentui/react';
import {debounce} from 'mini-debounce';
import {useId} from '@reach/auto-id';

import {colors} from '../shared/theme.js';
import {artworkWrapperStyles} from './slideshow-parts.js';
import {FadeLayout} from './FadeLayout.js';
import {Loading} from './Loading.js';

import 'trix';
import 'trix/dist/trix.css';

/**
 * A component to facilitate in reduction of repeating layout code for pages that display character info.
 *
 * @param {{
 *   className?: string,
 *   mode: 'display',
 *   slideshow: JSX.Element,
 *   name: JSX.Element,
 *   story: JSX.Element,
 *   actions: import('react').ReactNode,
 *   children?: any,
 *   onSubmit?: undefined,
 * } | {
 *   className?: string,
 *   mode: 'edit',
 *   onSubmit: function(React.SyntheticEvent): void,
 *   slideshow: JSX.Element,
 *   name: JSX.Element,
 *   story: JSX.Element,
 *   actions: import('react').ReactNode,
 *   children?: any,
 * }} props
 */
export function CharacterLayout({
	className,
	slideshow,
	name,
	story,
	actions,
	mode,
	onSubmit,
	children,
}) {
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

				<article style={{
					padding: '0 31px', display: 'flex', flexDirection: 'column', flexGrow: 1,
				}}
				>
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
	);

	let wrapped;
	if (mode === 'display') {
		wrapped = (
			<FadeLayout style={{height: '100%'}} className={className}>
				{content}
				{children}
			</FadeLayout>
		);
	} else if (mode === 'edit') {
		wrapped = (
			<FadeLayout style={{height: '100%'}} className={className}>
				<form onSubmit={onSubmit} style={{display: 'inline'}}>
					{content}
				</form>
				{children}
			</FadeLayout>
		);
	} else {
		throw new Error(`Invalid mode '${mode}' is not supported.`);
	}

	return wrapped;
}

/**
 *
 * @param {{defaultValue?: string, onChange?: function(string): void, [s: string]: any}} props
 */
export function Trix({defaultValue, onChange, ...props}) {
	const ref = useRef(null);

	useEffect(() => {
		try {
			const json = JSON.parse(defaultValue);
			if (json) ref.current.editor.loadJSON(json);
		} catch {
		}
	}, [defaultValue]);

	useEffect(() => {
		const trix = ref.current;
		function handler() {
			if (onChange) onChange(JSON.stringify(ref.current.editor.toJSON()));
		}
		trix.addEventListener('trix-change', handler);
		return () => {
			trix.removeEventListener('trix-change', handler);
		};
	}, [onChange]);

	// @ts-ignore
	return <trix-editor ref={ref} {...props} />;
}
export const CharacterStory = ({story}) => <Trix contentEditable={false} defaultValue={story} />;

/**
 *
 * @param {{id?: string, className?: string, multiline?: boolean, label: string, [s: string]: any}} props
 */
export function CharacterInput({
	id, className, multiline, label, ...props
}) {
	const [status, setStatus] = useState('idle');
	const focusHandlers = {
		onFocus() {
			setStatus('focus');
		},
		onBlur() {
			setStatus('idle');
		},
	};

	return (
		<div className={`CharacterInput ${className ?? ''}`}>
			{label && (
				<Label htmlFor={id} style={{textDecoration: status === 'focus' ? 'underline' : 'none'}}>
					{label}
				</Label>
			)}
			{
				multiline
					? <Trix id={id} {...props} {...focusHandlers} />
					: <input id={id} {...props} {...focusHandlers} />
			}
		</div>
	);
}

const debouncedSetItem = debounce((key, value) => localStorage.setItem(key, value), 100);
export function createValueStorer(key) {
	return (event) => {
		debouncedSetItem(key, event?.nativeEvent instanceof Event ? event.target.value : event);
	};
}
export function clearStorageKeys(...keys) {
	for (const key of keys) {
		localStorage.setItem(key, '');
	}
}

export function CharacterNameInput({storageKey, defaultValue}) {
	const id = useId('name');
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
	);
}
export function CharacterStoryInput({storageKey, defaultValue}) {
	const id = useId('story');
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
	);
}
