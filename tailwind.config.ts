import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light mode
        light: {
          bg: '#FFFFFF',
          surface: '#F5F5F7',
          primary: '#6366F1',
          secondary: '#EC4899',
          accent: '#F59E0B',
          text: '#1F2937',
          textSecondary: '#6B7280',
        },
        // Dark mode
        dark: {
          bg: '#0F0F0F',
          surface: '#1A1A1A',
          primary: '#818CF8',
          secondary: '#F472B6',
          accent: '#FBBF24',
          text: '#F9FAFB',
          textSecondary: '#9CA3AF',
        },
        // Stat colors
        stat: {
          strength: '#EF4444',
          intelligence: '#3B82F6',
          vitality: '#10B981',
          spirit: '#8B5CF6',
          charisma: '#F59E0B',
        },
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
