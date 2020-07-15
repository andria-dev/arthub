import {FontIcon, Text} from '@fluentui/react'
import {motion} from 'framer-motion'
import React from 'react'
import {colors} from '../../shared/theme.js'
import './action-button-styles.css'

/*
 * @param {{ variant: 'round' | 'flat' }} options
 */
export function ActionButton({variant, iconName, children}) {
	return (
		<motion.button animate className={`ActionButton ActionButton--${variant}`}>
			<FontIcon iconName={iconName} aria-hidden="true" style={{fontSize: 30, color: colors.realOrange}} />
			<Text as="span" variant="actionButton" style={{color: colors.realOrange}}>
				{children}
			</Text>
		</motion.button>
	)
}
