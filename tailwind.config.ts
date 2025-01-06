import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-rubik)'],
        rubik: ['var(--font-rubik)'],
      },
      colors: {
        primary: {
          DEFAULT: '#4754D6',
          light: '#C287EB',
          dark: '#2E2953',
          foreground: '#F6F5F0',
        },
        background: {
          DEFAULT: '#2E2953',
          light: '#3A365C',
          lighter: '#4A466C',
        },
        text: {
          DEFAULT: '#F6F5F0',
          light: '#FFFFFF',
          dark: '#E6E5E0',
        },
        accent: {
          DEFAULT: '#C287EB',
          light: '#D4A4F4',
          dark: '#B06AE2',
          foreground: '#2E2953',
        },
        // הצבעים הנדרשים ל-shadcn
        border: '#3A365C',
        input: '#3A365C',
        ring: '#4754D6',
        foreground: '#F6F5F0',
        secondary: {
          DEFAULT: '#4754D6',
          foreground: '#F6F5F0',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#F6F5F0',
        },
        muted: {
          DEFAULT: '#3A365C',
          foreground: '#F6F5F0',
        },
        popover: {
          DEFAULT: '#2E2953',
          foreground: '#F6F5F0',
        },
        card: {
          DEFAULT: 'rgb(255, 255, 255)',
          foreground: 'rgb(55, 65, 81)',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-grid': 'linear-gradient(to right, #0E5159 1px, transparent 1px), linear-gradient(to bottom, #0E5159 1px, transparent 1px)',
      },
      keyframes: {
        'text-gradient': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'background-shine': {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        "accordion-down": {
          from: { height: '0px' },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: '0px' },
        },
      },
      animation: {
        'text-gradient': 'text-gradient 3s ease infinite',
        'background-shine': 'background-shine 2s linear infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
} satisfies Config

export default config