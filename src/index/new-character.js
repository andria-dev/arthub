import React from 'react'
import {motion} from 'framer-motion'
import {Text, TextField} from '@fluentui/react'

export function NewCharacter() {
	return (
		<motion.div layout>
			<main>
				<form>
					<img src="/artist-and-art.svg" alt="Artist looking at her art" />
					<Text variant="mediumTitle">Drop your photos here</Text>

					<TextField label="Name" placeholder="Imogen Winchester" borderless />
				</form>
			</main>
		</motion.div>
	)
}
