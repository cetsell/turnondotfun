/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/client/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy for manual control
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: '#9CFF6D', // vibrant green
          light: '#B8FF9E',
          dark: '#7ED955',
        },
        secondary: {
          DEFAULT: '#6DC2FF', // bright blue
          light: '#9CD5FF',
          dark: '#4A9EE6',
        },
        // Semantic colors
        what: '#9CFF6D',        // vibrant green
        who: '#FF886D',         // coral orange
        where: '#F8DA57',       // sunny yellow
        how: '#6DC2FF',         // bright blue
        
        // Light theme colors - nested structure
        light: {
          background: '#FFFFFF',  // Pure white
          surface: '#FFFFFF',
          card: 'rgba(255, 255, 255, 0.9)',
          border: 'rgba(0, 0, 0, 0.1)',
          glass: {
            background: 'rgba(255, 255, 255, 0.8)',
            border: 'rgba(0, 0, 0, 0.05)',
            highlight: 'rgba(255, 255, 255, 0.9)',
            shadow: 'rgba(0, 0, 0, 0.1)'
          },
          text: {
            DEFAULT: '#000000',  // Pure black
            secondary: '#333333',
            light: '#666666',
          },
        },
        
        // Dark theme colors - nested structure
        dark: {
          background: '#000000',  // Pure black
          surface: '#000000',
          card: 'rgba(0, 0, 0, 0.9)',
          border: 'rgba(255, 255, 255, 0.1)',
          glass: {
            background: 'rgba(0, 0, 0, 0.8)',
            border: 'rgba(255, 255, 255, 0.1)',
            highlight: 'rgba(255, 255, 255, 0.05)',
            shadow: 'rgba(0, 0, 0, 0.2)'
          },
          text: {
            DEFAULT: '#FFFFFF',  // Pure white
            secondary: '#FFFFFF',
            light: '#CCCCCC',
          },
        },
        
        // Flattened theme colors for direct utility access
        'light-background': '#FFFFFF',
        'light-surface': '#FFFFFF',
        'light-card': 'rgba(255, 255, 255, 0.9)',
        'light-border': 'rgba(0, 0, 0, 0.1)',
        'light-glass-background': 'rgba(255, 255, 255, 0.8)',
        'light-glass-border': 'rgba(0, 0, 0, 0.05)',
        'light-glass-highlight': 'rgba(255, 255, 255, 0.9)',
        'light-glass-shadow': 'rgba(0, 0, 0, 0.1)',
        'light-text': '#000000',
        'light-text-secondary': '#333333',
        'light-text-light': '#666666',
        
        'dark-background': '#000000',
        'dark-surface': '#000000',
        'dark-card': 'rgba(0, 0, 0, 0.9)',
        'dark-border': 'rgba(255, 255, 255, 0.1)',
        'dark-glass-background': 'rgba(0, 0, 0, 0.8)',
        'dark-glass-border': 'rgba(255, 255, 255, 0.1)',
        'dark-glass-highlight': 'rgba(255, 255, 255, 0.05)',
        'dark-glass-shadow': 'rgba(0, 0, 0, 0.2)',
        'dark-text': '#FFFFFF',
        'dark-text-secondary': '#FFFFFF',
        'dark-text-light': '#CCCCCC',
        
        // Status colors
        status: {
          error: '#FF5252',
          warning: '#FFD740',
          success: '#69F0AE',
          info: '#40C4FF',
        }
      },
      animation: {
        'gradient-slow': 'gradient 15s ease infinite',
        'gradient-medium': 'gradient 10s ease infinite',
        'gradient-fast': 'gradient 5s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%', 
            transform: 'scale(1.05)',
          },
          '50%': { 
            backgroundPosition: '100% 50%', 
            transform: 'scale(1)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundSize: {
        '200%': '200% 200%',
        '300%': '300% 300%',
      },
      fontFamily: {
        sans: ['sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'md': '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
        'lg': '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
        'dark-sm': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
        'dark-md': '0 3px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
        'dark-lg': '0 10px 20px rgba(0,0,0,0.5), 0 3px 6px rgba(0,0,0,0.4)',
        // Glow effects for buttons and elements
        'glow-primary': '0 0 15px rgba(156, 255, 109, 0.6)',
        'glow-secondary': '0 0 15px rgba(109, 194, 255, 0.6)',
        'glow-error': '0 0 15px rgba(255, 82, 82, 0.6)',
        'glow-success': '0 0 15px rgba(105, 240, 174, 0.6)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
    },
  },
  variants: {
    extend: {
      // Enable dark mode variants for more control
      backgroundColor: ['dark', 'dark-hover', 'hover'],
      textColor: ['dark', 'dark-hover', 'hover'],
      borderColor: ['dark', 'dark-hover', 'hover'],
      opacity: ['dark', 'hover'],
    },
  },
  plugins: [],
}
