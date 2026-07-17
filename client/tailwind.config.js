/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // SafetyHub design tokens
        ink: '#0B1220',      // background
        surface: '#131B2E',  // cards / raised panels
        surface2: '#1B2540', // hover / active surface
        mist: '#E7ECF3',     // primary text on dark
        muted: '#8B95A7',    // secondary text
        signal: '#F5A623',   // primary action / emergency numbers
        alert: '#E5484D',    // reserved for SOS only
        calm: '#2DD4BF',     // voice assistant / guidance accent
        info: '#5B8DEF',     // police / informational category
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.35)',
      },
      keyframes: {
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        'ping-slow': 'ping-slow 1.8s cubic-bezier(0,0,0.2,1) infinite',
      },
    },
  },
  plugins: [],
};
