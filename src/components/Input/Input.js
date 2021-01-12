import {Text} from '@fluentui/react';
import {useId} from '@reach/auto-id';
import {emptyObject} from '../../shared/empty.js';

import './Input.css';

/**
 * @param {{
 * 	id?: string,
 * 	label?: string,
 * 	frameProps?: Object,
 * 	[s: string]: any,
 * }} params
 */
export function TextInput({
	id = null,
	label,
	frameProps = emptyObject,
	...props
}) {
	const idValue = useId(id);

	return (
		<div className="Input__frame" {...frameProps}>
			{label && (
				/* @ts-ignore */
				<Text variant="mediumTitle" as="label" htmlFor={idValue} className="Input__label">
					{label}
				</Text>
			)}
			<input id={idValue} className="Input__field" {...props} />
		</div>
	);
}
