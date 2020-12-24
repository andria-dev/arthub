import {Stack} from '@fluentui/react'

const empty = {}
export function Center({style = empty, ...props}) {
	return (
		<Stack
			verticalAlign="center"
			horizontalAlign="center"
			style={{height: '100%', width: '100%', ...style}}
			{...props}
		/>
	)
}
