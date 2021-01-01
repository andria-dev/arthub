import {Text} from '@fluentui/react';
import {useId} from '@reach/auto-id';

export function InputFrame({label, input}) {
	return (
		<div className="InputFrame">
			<div className="InputFrame__label-wrapper">{label}</div>
			{input}
		</div>
	);
}

export function TextInput({id = 'input', label, ...props}) {
	const idValue = useId(id);

	return (
		<InputFrame
			label={(
				<Text variant="mediumTitle" as="label" htmlFor={idValue} className="InputFrame__label">
					{label}
				</Text>
			)}
			input={(
				<input
					id={idValue}
					className="InputFrame__input"
					{...props}
				/>
			)}
		/>
	);
}
