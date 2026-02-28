import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { words, songTitle, artist } = await request.json();

        if (!words || !Array.isArray(words) || words.length === 0) {
            return NextResponse.json({ expressions: [] });
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ expressions: null }, { status: 200 });
        }

        const prompt = `You are an English language teacher. The student just played a song fill-in-the-blank game for "${songTitle}" by "${artist}" and correctly answered these words: ${words.join(', ')}.

For each word, generate a JSON explanation with this exact structure:
{
  "word": "string",
  "translation": "Portuguese translation",
  "context": "Cultural/usage context in 1-2 sentences (in Portuguese)",
  "example": "Example sentence in English",
  "formality": "formal" | "informal" | "slang",
  "relatedExpressions": ["expr1", "expr2", "expr3"]
}

Return a JSON array of these objects. Only return valid JSON, no additional text.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 2000,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            return NextResponse.json({ expressions: null });
        }

        const data = await response.json();
        const content = data.content?.[0]?.text || '[]';

        try {
            const expressions = JSON.parse(content);
            return NextResponse.json({ expressions });
        } catch {
            return NextResponse.json({ expressions: null });
        }
    } catch (error) {
        console.error('API explain error:', error);
        return NextResponse.json({ expressions: null }, { status: 500 });
    }
}
