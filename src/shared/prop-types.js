import PropTypes from 'prop-types';

/**
 * @typedef {{
 *   id: string,
 *   files: Array<string>,
 *   name: string,
 *   story: string
 * }} Character
 */
export const CharacterType = PropTypes.shape({
	id: PropTypes.string.isRequired,
	files: PropTypes.arrayOf(PropTypes.string).isRequired,
	name: PropTypes.string.isRequired,
	story: PropTypes.string.isRequired,
});
