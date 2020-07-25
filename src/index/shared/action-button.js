import {FontIcon, Text} from '@fluentui/react'
import {motion} from 'framer-motion'
import React from 'react'
import {colors} from '../../shared/theme'
import '../home/action-button/action-button-styles.css'

/*
 * @param {{ variant: 'round' | 'flat' | 'bold-orange' | 'bold-pink', iconName: string }} options
 */
export function ActionButton({variant, iconName, children, className, ...props}) {
	return (
		<motion.button
			animate
			className={`ActionButton ActionButton--${variant} ${children ? 'ActionButton--content' : ''} ${className || ''}`}
			{...props}
		>
			<FontIcon iconName={iconName} aria-hidden="true" />
			{children && (
				<Text as="span" variant="actionButton" style={{color: colors.realOrange}}>
					{children}
				</Text>
			)}
		</motion.button>
	)
}
