import {FontIcon, Text} from '@fluentui/react'
import {motion} from 'framer-motion'
import {colors} from '../shared/theme'
import '../styles/action-button.css'

/*
 * @param {{ variant: 'round' | 'flat' | 'bold-orange' | 'bold-pink' | 'danger', iconName: string }} options
 */
export function ActionButton({variant, iconName, children, className, ...props}) {
	return (
		<button
			className={`ActionButton ActionButton--${variant} ${children ? 'ActionButton--content' : ''} ${className || ''}`}
			{...props}
		>
			<FontIcon iconName={iconName} aria-hidden="true" />
			{children && (
				<Text as="span" variant="actionButton">
					{children}
				</Text>
			)}
		</button>
	)
}
