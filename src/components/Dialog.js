import {createContext, useContext} from 'react'

import {Text} from '@fluentui/react'
import {DialogContent, DialogOverlay} from '@reach/dialog'
import {useId} from '@reach/auto-id'

import '../styles/Dialog.css'

const DialogContext = createContext({titleId: ''})

export function DialogTitle(props) {
	const {titleId} = useContext(DialogContext)
	return <Text id={titleId} variant="title" as="h1" className="Dialog__title" {...props} />
}

export function DialogParagraph(props) {
	return <Text variant="medium" {...props} />
}

export function Dialog({isOpen, onDismiss, children, ...props}) {
	const titleId = useId('title')
	return (
		<DialogOverlay isOpen={isOpen} onDismiss={onDismiss} className="Dialog__overlay" {...props}>
			<DialogContent className="Dialog" aria-labelledby={titleId}>
				<DialogContext.Provider value={{titleId}}>{children}</DialogContext.Provider>
			</DialogContent>
		</DialogOverlay>
	)
}
