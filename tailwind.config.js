/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./index.html", 
        "./src/**/*.{ts,tsx,js,jsx}"
    ],
    theme: {
        extend: {
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: 'calc(var(--radius) + 4px)',
                '2xl': 'calc(var(--radius) + 8px)',
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                success: {
                    DEFAULT: '#10B981',
                    foreground: '#ffffff',
                    light: '#D1FAE5',
                    dark: '#047857'
                },
                warning: {
                    DEFAULT: '#F59E0B',
                    foreground: '#ffffff',
                    light: '#FEF3C7',
                    dark: '#B45309'
                },
                info: {
                    DEFAULT: '#3B82F6',
                    foreground: '#ffffff',
                    light: '#DBEAFE',
                    dark: '#1E40AF'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
            },
            spacing: {
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' }
                },
                'fade-out': {
                    from: { opacity: '1' },
                    to: { opacity: '0' }
                },
                'slide-in-from-top': {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(0)' }
                },
                'slide-out-to-top': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-100%)' }
                },
                'slide-in-from-bottom': {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' }
                },
                'slide-out-to-bottom': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(100%)' }
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                },
                'scale-out': {
                    from: { transform: 'scale(1)', opacity: '1' },
                    to: { transform: 'scale(0.95)', opacity: '0' }
                },
                'spin-slow': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' }
                },
                'pulse-fast': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' }
                },
                'bounce-slow': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                'shimmer': {
                    '100%': { transform: 'translateX(100%)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'fade-out': 'fade-out 0.3s ease-out',
                'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
                'slide-out-to-top': 'slide-out-to-top 0.3s ease-out',
                'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
                'slide-out-to-bottom': 'slide-out-to-bottom 0.3s ease-out',
                'scale-in': 'scale-in 0.2s ease-out',
                'scale-out': 'scale-out 0.2s ease-out',
                'spin-slow': 'spin-slow 3s linear infinite',
                'pulse-fast': 'pulse-fast 1.5s ease-in-out infinite',
                'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s infinite',
            },
            screens: {
                'xs': '375px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
                '3xl': '1920px',
                'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
                'mouse': { 'raw': '(hover: hover) and (pointer: fine)' },
            },
            boxShadow: {
                'soft': '0 2px 8px rgba(0,0,0,0.05)',
                'medium': '0 4px 12px rgba(0,0,0,0.08)',
                'hard': '0 8px 24px rgba(0,0,0,0.12)',
                'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
                'inner-soft': 'inset 0 2px 4px rgba(0,0,0,0.02)',
            },
            backdropBlur: {
                'xs': '2px',
            },
            transitionProperty: {
                'height': 'height',
                'spacing': 'margin, padding',
                'width': 'width',
            },
            transitionTimingFunction: {
                'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            },
            zIndex: {
                '1': '1',
                '2': '2',
                '3': '3',
                'max': '9999',
            }
        }
    },
    plugins: [
        require("tailwindcss-animate"),
        require('@tailwindcss/container-queries'),
        require('@tailwindcss/typography'),
    ],
    future: {
        hoverOnlyWhenSupported: true,
    }
}