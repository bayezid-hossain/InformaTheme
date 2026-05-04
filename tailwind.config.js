/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Dark Premium
        bg0: '#0d0f12',
        bg1: '#13161c',
        bg2: '#1a1e27',
        bg3: '#222736',
        accent: '#4ade80',
        // Warm Light
        cream: '#faf7f2',
        forest: '#2d7a4a',
      },
      fontFamily: {
        'space-grotesk': ['SpaceGrotesk'],
        'space-mono': ['SpaceMono'],
        'sirin': ['SirinStencil'],
      },
    },
  },
  plugins: [],
};
