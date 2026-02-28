/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                bg: '#0a0a0f',
                surface: '#12121a',
                surfaceHigh: '#1a1a28',
                border: '#2a2a3a',
                accent: '#e8ff47',
                accentDim: '#b8cc1a',
                textPrimary: '#f0f0ff',
                textSecondary: '#8888aa',
                success: '#4ade80',
                error: '#f87171',
                warning: '#fbbf24',
                info: '#60a5fa',
            },
            fontFamily: {
                display: ['var(--font-bebas)', 'sans-serif'],
                body: ['var(--font-dm-sans)', 'sans-serif'],
                mono: ['var(--font-space-mono)', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'pulse-correct': 'pulseCorrect 0.6s ease-in-out',
                'shake-wrong': 'shakeWrong 0.4s ease-in-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'combo-burst': 'comboBurst 0.5s ease-out',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 3s ease-in-out infinite',
                'streak': 'streak 1s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseCorrect: {
                    '0%': { transform: 'scale(1)', backgroundColor: '#4ade80' },
                    '50%': { transform: 'scale(1.08)', backgroundColor: '#4ade80' },
                    '100%': { transform: 'scale(1)', backgroundColor: '#4ade8033' },
                },
                shakeWrong: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '20%': { transform: 'translateX(-6px)' },
                    '40%': { transform: 'translateX(6px)' },
                    '60%': { transform: 'translateX(-4px)' },
                    '80%': { transform: 'translateX(4px)' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                comboBurst: {
                    '0%': { transform: 'scale(1)', opacity: '1' },
                    '50%': { transform: 'scale(1.4)', opacity: '1' },
                    '100%': { transform: 'scale(1)', opacity: '0.8' },
                },
                glow: {
                    '0%': { textShadow: '0 0 10px #e8ff4766' },
                    '100%': { textShadow: '0 0 20px #e8ff47, 0 0 40px #e8ff4766' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                streak: {
                    '0%': { transform: 'scale(0.5) rotate(-10deg)', opacity: '0' },
                    '60%': { transform: 'scale(1.2) rotate(5deg)', opacity: '1' },
                    '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-hero': 'radial-gradient(ellipse at top, #1a1a3a 0%, #0a0a0f 60%)',
                'gradient-card': 'linear-gradient(135deg, #12121a 0%, #1a1a28 100%)',
                'gradient-accent': 'linear-gradient(135deg, #e8ff47 0%, #b8cc1a 100%)',
            },
        },
    },
    plugins: [],
}
