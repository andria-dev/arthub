import {Spinner} from '@fluentui/react'
import {Center} from './Center'
import {emptyObject} from '../shared/empty'

export function Loading({centerStyle = emptyObject, ...props}) {
	return (
		<Center style={centerStyle}>
			<Spinner {...props} />
		</Center>
	)
}
