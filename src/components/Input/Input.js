import {Text} from '@fluentui/react';
import {useId} from '@reach/auto-id';
import {emptyObject} from '../../shared/empty.js';

import './Input.css';

export function TextInput({
	id = 'input', label, frameProps = emptyObject, ...props
}) {
	const idValue = useId(id);

	return (
		<div className="Input__frame" {...frameProps}>
			<Text variant="mediumTitle" as="label" htmlFor={idValue} className="Input__label">
				{label}
			</Text>
			<input id={idValue} className="Input__field" {...props} />
		</div>
	);
}
