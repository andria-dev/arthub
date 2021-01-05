/* eslint-disable react/button-has-type */
import {createContext, useContext} from 'react';

import {Text} from '@fluentui/react';
import {useId} from '@reach/auto-id';
import {motion} from 'framer-motion';
import {DialogContent, DialogOverlay} from '@reach/dialog';

import '../styles/Dialog.css';

const DialogContext = createContext({titleId: ''});

/**
 * Styled action buttons for a Dialog with two variants.
 * Primary is an orange filled style button.
 * Secondary is a flat no-fill style button.
 *
 * @param {{
 * 	type?: 'button' | 'submit' | 'reset',
 * 	variant: 'primary' | 'secondary' | 'tertiary',
 * 	[s: string]: any,
 * }} props
 */
export function DialogAction({variant, type = 'button', ...props}) {
	return (
		<motion.button
			whileHover={{scale: 1.1}}
			whileTap={{scale: 0.95}}
			className={`Dialog__action Dialog__action--${variant}`}
			type={type}
			{...props}
		/>
	);
}

/**
 * Styles the area around your `<DialogAction>`s.
 * @param {{[s: string]: any}} props
 */
export function DialogActionBar(props) {
	return <div className="Dialog__action-bar" {...props} />;
}

/**
 * Title sized `<h1>` with added margins for Dialog.
 * @param {{[s: string]: any}} props
 */
export function DialogTitle(props) {
	const {titleId} = useContext(DialogContext);
	return <Text id={titleId} variant="title" as="h1" className="Dialog__title" {...props} />;
}

/**
 * Medium sized text for Dialog messages. Defaults to <p> tag.
 * @param {{[s: string]: any}} props
 */
export function DialogParagraph({...props}) {
	return <Text as="p" variant="medium" {...props} />;
}

/**
 * A wrapper around `@reach/dialog` that provides styles and an id
 * for the title of the dialog via Context.
 *
 * @param {{
 * 	isOpen: boolean,
 * 	onDismiss?: function(): void,
 * 	children: import('react').ReactNode,
 * 	[s: string]: any,
 * }} props
 */
export function Dialog({
	isOpen, onDismiss, children, ...props
}) {
	const titleId = useId('title');
	return (
		<DialogOverlay isOpen={isOpen} onDismiss={onDismiss} className="Dialog__overlay" {...props}>
			<DialogContent className="Dialog" aria-labelledby={titleId}>
				<DialogContext.Provider value={{titleId}}>{children}</DialogContext.Provider>
			</DialogContent>
		</DialogOverlay>
	);
}
