import {createTheme} from '@fluentui/react';

export const theme = createTheme({
	palette: {
		themePrimary: '#dd1d3d',
		themeLighterAlt: '#fef5f6',
		themeLighter: '#fad7dd',
		themeLight: '#f5b5c0',
		themeTertiary: '#eb7085',
		themeSecondary: '#e23552',
		themeDarkAlt: '#c81a37',
		themeDark: '#a9162e',
		themeDarker: '#7c1022',
		neutralLighterAlt: '#faf9f8',
		neutralLighter: '#f3f2f1',
		neutralLight: '#edebe9',
		neutralQuaternaryAlt: '#e1dfdd',
		neutralQuaternary: '#d0d0d0',
		neutralTertiaryAlt: '#c8c6c4',
		neutralTertiary: '#a19f9d',
		neutralSecondary: '#605e5c',
		neutralPrimaryAlt: '#3b3a39',
		neutralPrimary: '#323130',
		neutralDark: '#201f1e',
		black: '#000000',
		white: '#ffffff',
	},
	fonts: {
		// @ts-ignore
		actionButton: {
			fontSize: 16,
			fontFamily: 'Inter',
			fontWeight: 600,
		},
		medium: {
			fontSize: 20,
		},
		mediumTitle: {
			fontSize: 20,
			fontFamily: 'Inter',
			fontWeight: 600,
		},
		higherTitle: {
			fontSize: 24,
			fontFamily: 'Inter',
			fontWeight: 600,
		},
		title: {
			fontSize: 30,
			fontFamily: 'Inter',
			fontWeight: 600,
		},
	},
});

export const transitions = {
	smooth: {
		type: 'spring',
		mass: 0.5,
		damping: 20,
	},
	menu: {
		type: 'spring',
		stiffness: 500,
		damping: 60,
		mass: 1,
	},
};

export const colors = {
	lightPink: 'hsl(353, 82%, 98%)',
	pink: 'hsl(350, 78%, 91%)',
	realPink: 'hsl(351, 72%, 50%)',
	lightOrange: 'hsl(18, 72%, 93%)',
	orange: 'hsl(19, 72%, 75%)',
	realOrange: 'hsl(19, 72%, 50%)',
	orangeShadow: 'hsla(19, 72%, 75%, 0.25)',
	strongOrangeShadow: 'hsla(19, 72%, 75%, 0.4)',
	dark: 'hsl(0, 0%, 10%)',
	notAsDark: 'hsl(0, 0%, 35%)',
	light: 'hsl(0, 0%, 99%)',
	notAsLight: 'hsl(0, 0%, 92%)',
	lightShadow: 'hsla(0, 0%, 0%, 0.1)',
	danger: 'hsl(0, 87%, 41%)',
	dialogOverlay: 'rgba(88, 38, 14, 0.81)',
};

for (const colorName in colors) {
	const color = colors[colorName];
	const variableName = colorName.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
	document.body.style.setProperty(`--${variableName}`, color);
}
