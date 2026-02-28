import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getLevelByXp } from '@/data/constants';

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await req.json();
        const { songId, score, accuracy, blanksCorrect, blanksTotal } = body;

        if (!songId || score === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const gameSession = await tx.gameSession.create({
                data: {
                    userId,
                    songId,
                    score,
                    accuracy,
                    blanksCorrect,
                    blanksTotal,
                },
            });

            const profile = await tx.userProfile.findUnique({
                where: { userId },
            });

            if (profile) {
                const newXp = profile.xp + score;
                const newLevelData = getLevelByXp(newXp);

                const updatedProfile = await tx.userProfile.update({
                    where: { userId },
                    data: {
                        xp: newXp,
                        level: parseInt(newLevelData.key) || profile.level, // Assuming newLevelData.key maps to a number level or we can just rely on xp
                    },
                });
                return { gameSession, profile: updatedProfile };
            }

            return { gameSession };
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Progress save error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
