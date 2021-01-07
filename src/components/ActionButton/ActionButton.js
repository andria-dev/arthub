/* eslint-disable react/button-has-type */
import {FontIcon, Text} from '@fluentui/react';
import PropTypes from 'prop-types';
import './ActionButton.css';

/**
 * @param {{
 * 	type?: 'button' | 'submit' | 'reset',
 * 	variant: string,
 * 	iconName?: string,
 * 	[s: string]: any,
 * }} props
 */
export function ActionButton({
	type = 'button', variant, iconName, children, className, ...props
}) {
	return (
		<button
			type={type}
			className={
				`ActionButton ActionButton--${variant} ${children ? 'ActionButton--content' : ''} ${className || ''}`
			}
			{...props}
		>
			<FontIcon iconName={iconName} aria-hidden="true" />
			{children && (
				// @ts-ignore
				<Text as="span" variant="actionButton">
					{children}
				</Text>
			)}
		</button>
	);
}

ActionButton.propTypes = {
	type: PropTypes.oneOf(['button', 'submit', 'reset']),
	variant: PropTypes.string.isRequired,
	iconName: PropTypes.string,
};

ActionButton.defaultProps = {
	type: 'button',
	iconName: null,
};
