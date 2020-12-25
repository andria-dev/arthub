import {memo, Suspense} from 'react'

import xss from 'xss'
import marked from 'marked'
import {motion} from 'framer-motion'
import {Spinner} from '@fluentui/react'

import {Center} from './center.js'
import {colors} from '../shared/theme.js'
import {artworkWrapperStyles} from './slideshow-parts.js'
import {FadeLayout} from './page-transitions'

export const CharacterStory = memo(({story}) => (
	<div className="Character__story" dangerouslySetInnerHTML={{__html: xss(marked(story))}} />
))

const empty = {}
/**
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
