import React, {useEffect, useRef} from 'react'

function autoExpand(element, lineHeight) {
	element.style.overflow = 'unset'
	// adjust rows the smallest possible value
	const minRows = parseInt(element.getAttribute('data-minimum-rows'), 10)
	element.rows = minRows

	// calculate the number of rows required by taking the height of
	// the content past the original height and dividing it by
	// the height of a line.
	const heightDifference = element.scrollHeight - element.baseScrollHeight
	const rows = Math.ceil(heightDifference / lineHeight)
	element.rows = minRows + rows

	// prevent scrollbar
	element.style.overflow = 'hidden'
}

function configureAutoExpantion(element, lineHeight) {
	// save textarea value for later
	const savedValue = element.value

	// get the base scroll height of the textarea
	element.value = ''
	element.baseScrollHeight = element.scrollHeight

	// reset textarea's value
	element.value = savedValue
	autoExpand(element, lineHeight)
}

export function AutoExpandingTextarea({
	fontSize = 16,
	lineHeight = fontSize,
	minimumRows,
	style = {},
	onChange,
	...props
}) {
	const ref = useRef(null)
	useEffect(() => {
		configureAutoExpantion(ref.current, lineHeight)
	}, [ref, lineHeight])

	function handleChange(event) {
		autoExpand(event.target, lineHeight)
		onChange(event)
	}

	return (
		<textarea
			ref={ref}
			onChange={handleChange}
			rows={minimumRows}
			data-minimum-rows={minimumRows}
			style={{fontSize, lineHeight: `${lineHeight}px`, resize: 'none', ...style}}
			{...props}
		/>
	)
}
