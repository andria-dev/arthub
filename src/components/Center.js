import {Stack} from '@fluentui/react';
import {emptyObject} from '../shared/empty.js';

export function Center({style = emptyObject, ...props}) {
	return (
		<Stack
			verticalAlign="center"
			horizontalAlign="center"
			style={{height: '100%', width: '100%', ...style}}
			{...props}
		/>
	);
}
