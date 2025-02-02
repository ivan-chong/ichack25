// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Update this path according to your project structure
  ],
  theme: {
    extend: {
      animation: {
        'flash-green': 'flashGreen 0.5s ease-in-out', // Define the flash animation
      },
      keyframes: {
        flashGreen: {
          '0%': { backgroundColor: '#1f2937' }, // Dark background
          '50%': { backgroundColor: '#22c55e' }, // Flash green
          '100%': { backgroundColor: '#1f2937' }, // Dark background again
        },
      },
    },
  },
  plugins: [],
}
