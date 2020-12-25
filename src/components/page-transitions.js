import {motion} from 'framer-motion'

export function FadeLayout(props) {
	return <motion.div layout initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} {...props} />
}
