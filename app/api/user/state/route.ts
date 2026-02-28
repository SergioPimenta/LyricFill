import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserState } from '@/types';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { profile: true },
        });

        if (!user || !user.profile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        const p = user.profile;

        // Parse Json fields (Prisma returns them as objects/arrays if typed as Json, but fallback parsing just in case)
        const parseJson = (val: any, fallback: any) => {
            if (!val) return fallback;
            if (typeof val === 'string') return JSON.parse(val);
            return val; // already an object
        };

        const state: Partial<UserState> = {
            name: user.name || 'Player',
            level: p.level as any, // Mapped locally usually, we pass the integer or let frontend map it
            xp: p.xp,
            streak: p.streak,
            lastPlayedAt: p.lastPlayedAt.getTime(),
            songsCompleted: p.songsCompleted,
            learnedWords: parseJson(p.learnedWords, []),
            achievements: parseJson(p.achievements, []),
            weeklyActivity: parseJson(p.weeklyActivity, [0, 0, 0, 0, 0, 0, 0]),
            favorites: p.favorites,
            history: parseJson(p.history, []),
            onboardingComplete: p.onboardingComplete
        };

        return NextResponse.json({ success: true, state });

    } catch (error) {
        console.error('Error fetching user state:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body: UserState = await req.json();

        // Convert the timestamp to DateTime
        const lastPlayedAt = new Date(body.lastPlayedAt || Date.now());

        // We only update the profile fields, name is handled via User model if necessary,
        // but for state persistence we focus on profile.
        await prisma.userProfile.update({
            where: { userId: session.user.id },
            data: {
                xp: body.xp,
                streak: body.streak,
                lastPlayedAt,
                songsCompleted: body.songsCompleted,
                learnedWords: body.learnedWords as any,
                achievements: body.achievements as any,
                weeklyActivity: body.weeklyActivity as any,
                favorites: body.favorites,
                history: body.history as any,
                onboardingComplete: body.onboardingComplete
            }
        });

        // Update name in user model if we're saving onboarding name
        if (body.name && body.name !== 'Learner' && body.name !== session.user.name) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { name: body.name }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error saving user state:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
