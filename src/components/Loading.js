import {Spinner} from '@fluentui/react';

import {Center} from './Center.js';
import {emptyObject} from '../shared/empty.js';

export function Loading({centerStyle = emptyObject, ...props}) {
	return (
		<Center style={centerStyle}>
			<Spinner {...props} />
		</Center>
	);
}
