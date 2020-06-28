import React from 'react'
import {Stack} from '@fluentui/react'

export function Notifications(props) {
  return <Stack horizontalAlign="right" style={{position: 'absolute', right: 0, top: 0}} {...props} />
}
