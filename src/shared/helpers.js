/**
 * Finds all trees above or adjacent to the given element that do not contain the given element or element tree.
 *
 * For example, in the below tree, if we wanted the `#nested-modal` to be the only accessible element tree, we could
 * utilize this function to apply the `inert` attribute to each tree that doesn't contain any elements we'll need access
 * to.
 *
 * ```
 * body
 *   └─╴div#root
 *        ├─╴header
 *        │    ├─╴svg.logo
 *        │    └─╴h1
 *        ├─╴main
 *        │    ├─╴section#nested-modal
 *        │    │    ├─╴h1
 *        │    │    └─╴button
 *        │    └─╴p
 *        └─╴footer
 *             └─╴a
 * ```
 *
 * In this tree, the elements `p`, `header`, and `footer` would be produced by this function when calling it like so:
 * ```js
 * const modal = document.getElementById('nested-modal')
 * forEachNonDescendantTree(modal, element => element.inert = true)
 * ````
 *
 * @param element
 * @param callback
 */
export function forEachNonDescendantTree(element, callback) {
	let currentElement = element
	const root = document.getElementById('root')

	while (currentElement !== root) {
		let previous = currentElement.previousElementSibling
		let next = currentElement.nextElementSibling

		while (previous) {
			callback(previous)
			previous = previous.previousElementSibling
		}

		while (next) {
			callback(next)
			next = next.nextElementSibling
		}

		currentElement = currentElement.parentElement
	}
}
