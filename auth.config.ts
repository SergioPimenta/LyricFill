import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnProtectedPath = !(
                nextUrl.pathname.startsWith('/login') ||
                nextUrl.pathname.startsWith('/register') ||
                nextUrl.pathname === '/' ||
                nextUrl.pathname.startsWith('/api') ||
                nextUrl.pathname.startsWith('/_next') ||
                nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|css|js)$/)
            );

            const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

            if (isOnProtectedPath) {
                if (isLoggedIn) return true;
                return false; // Redirects to login
            } else if (isLoggedIn && isAuthPage) {
                return Response.redirect(new URL('/home', nextUrl));
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    providers: [], // Add providers with Edge compatibility or rely on auth.ts for node-providers
} satisfies NextAuthConfig;
