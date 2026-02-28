import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'LyricFill — Learn English Through Music',
    description: 'Master English by filling in song lyrics. Gamified learning with real music, AI explanations, and instant feedback.',
    keywords: ['English learning', 'music', 'lyrics', 'fill in the blank', 'language learning', 'gamified'],
    manifest: '/manifest.json',
    themeColor: '#0a0a0f',
    openGraph: {
        title: 'LyricFill — Learn English Through Music',
        description: 'Fill in song lyrics to learn English in a fun, gamified way.',
        type: 'website',
    },
};

import { NextAuthProvider } from '@/components/NextAuthProvider';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body style={{ background: '#0a0a0f', color: '#f0f0ff', fontFamily: "'DM Sans', sans-serif" }}>
                <NextAuthProvider>
                    {children}
                </NextAuthProvider>
            </body>
        </html>
    );
}
