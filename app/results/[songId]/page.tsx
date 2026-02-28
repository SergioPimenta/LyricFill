'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSongById, SONGS } from '@/data/songs';
import { useUserState } from '@/hooks/useUserState';
import Navbar from '@/components/Navbar';
import ExpressionCard from '@/components/ExpressionCard';
import { ExpressionExplanation, LearnedWord } from '@/types';

// Fallback expressions if Claude API is not configured
function getMockExpressions(words: string[], songId: string, songTitle: string): ExpressionExplanation[] {
    const MOCK: Record<string, ExpressionExplanation> = {
        light: { word: 'light', translation: 'luz / leve', context: "Pode significar luz (física) ou algo leve. Na música, refere-se metaforicamente à orientação ou clareza numa situação difícil.", example: "She was the light in my darkest days.", formality: 'informal', relatedExpressions: ['in the light of', 'light up', 'see the light'] },
        snow: { word: 'snow', translation: 'neve / nevar', context: "'Snow' pode ser substantivo (neve) ou verbo (nevar). É usado metaforicamente para situações frias ou indesejadas.", example: "It started to snow on Christmas Eve.", formality: 'informal', relatedExpressions: ['snowball effect', 'snowed in', 'snow job'] },
        love: { word: 'love', translation: 'amar / amor', context: "Uma das palavras mais versáteis do inglês. Pode ser verbo ou substantivo, exprimindo desde apego a objetos até amor romântico.", example: "I love the way you make me feel.", formality: 'informal', relatedExpressions: ['fall in love', 'love affair', 'head over heels'] },
        fast: { word: 'fast', translation: 'rápido / rápidamente', context: "Adjetivo ou advérbio que descreve velocidade. Também pode significar firme (ex: hold fast) ou jejum.", example: "He speaks too fast for me to understand.", formality: 'informal', relatedExpressions: ['fast-paced', 'hold fast', 'fast track'] },
        bottom: { word: 'bottom', translation: 'fundo / parte inferior', context: "Indica a parte mais baixa de algo. 'Bottom of the glass' significa o fundo do copo — metáfora para desilusão.", example: "She hit rock bottom before seeking help.", formality: 'informal', relatedExpressions: ['rock bottom', 'bottom line', 'bottom out'] },
        understand: { word: 'understand', translation: 'entender / compreender', context: "Verbo irregular (understand/understood). Denota compreensão intelectual ou emocional de algo.", example: "I finally understand what she meant.", formality: 'informal', relatedExpressions: ['come to terms with', 'make sense of', 'grasp'] },
        missing: { word: 'missing', translation: 'sentir falta / desaparecido', context: "'Missing' pode descrever saudade (I miss you) ou algo que está ausente. Muito usado em contextos emocionais.", example: "I've been missing you since you left.", formality: 'informal', relatedExpressions: ['miss out', 'go missing', 'missing link'] },
        lover: { word: 'lover', translation: 'amante / parceiro romântico', context: "'Lover' é mais poético/lírico do que 'boyfriend/girlfriend'. Indica um parceiro íntimo.", example: "He was her lover for three years.", formality: 'informal', relatedExpressions: ['music lover', 'film lover', 'love interest'] },
        conversation: { word: 'conversation', translation: 'conversa / diálogo', context: "Uma troca verbal entre pessoas. 'Start a conversation' é uma expressão muito útil para networking.", example: "They had a deep conversation about life.", formality: 'informal', relatedExpressions: ['start a conversation', 'carry on a conversation', 'spark a conversation'] },
        shape: { word: 'shape', translation: 'forma / contorno', context: "'In shape' significa estar em boa forma física. 'Shape of you' refere-se literalmente ao corpo de alguém.", example: "He's been working out to get in shape.", formality: 'informal', relatedExpressions: ['in shape', 'out of shape', 'take shape'] },
        withdrawals: { word: 'withdrawals', translation: 'síndrome de abstinência / privação', context: "Termo médico para sintomas de parar um vício. Metaforicamente, usado para descrever saudade intensa.", example: "He was going through withdrawals after the break-up.", formality: 'informal', relatedExpressions: ['withdrawal symptoms', 'cold turkey', 'detox'] },
        blinded: { word: 'blinded', translation: 'cegado / ofuscado', context: "'Blinded by the lights' significa ser tão ofuscado pelas luzes da cidade que não consegue ver claramente — metáfora para excesso.", example: "She was blinded by his charm.", formality: 'informal', relatedExpressions: ['blind spot', 'turn a blind eye', 'love is blind'] },
        settled: { word: 'settled', translation: 'se estabeleceu / se acomodou', context: "'Settled down' é um phrasal verb que significa se estabilizar, especialmente em relacionamento ou local.", example: "After years of travel, he finally settled down.", formality: 'informal', relatedExpressions: ['settle down', 'settle for', 'settle in'] },
        dreams: { word: 'dreams', translation: 'sonhos / aspirações', context: "Pode ser sonhos durante o sono ou aspirações de vida. 'Dreams come true' é uma expressão clássica.", example: "She pursued her dreams despite the obstacles.", formality: 'informal', relatedExpressions: ['dream come true', 'pipe dream', 'beyond one\'s wildest dreams'] },
        highway: { word: 'highway', translation: 'rodovia / estrada principal', context: "'Highway' refere-se a uma estrada principal de alta velocidade. 'Desert highway' é uma imagem icônica na música rock.", example: "We drove along the highway for hours.", formality: 'informal', relatedExpressions: ['highway robbery', 'information highway', 'on the highway to hell'] },
    };

    return words
        .filter(w => MOCK[w.toLowerCase()])
        .map(w => MOCK[w.toLowerCase()]);
}

export default function ResultsPage() {
    const params = useParams();
    const router = useRouter();
    const songId = params.songId as string;
    const song = getSongById(songId);
    const { user, recordSession, isLoaded } = useUserState();
    const [expressions, setExpressions] = useState<ExpressionExplanation[]>([]);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [sessionRecorded, setSessionRecorded] = useState(false);
    const [newAchievements, setNewAchievements] = useState<string[]>([]);

    useEffect(() => {
        const stored = sessionStorage.getItem('lastResult');
        if (stored) {
            const parsed = JSON.parse(stored);
            setResult(parsed);

            // Fetch expressions
            const words: string[] = parsed.words || [];
            const exps = getMockExpressions(words, songId, song?.title || '');

            // Try Claude API
            fetch('/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ words, songTitle: song?.title, artist: song?.artist }),
            })
                .then(r => r.ok ? r.json() : null)
                .then((data) => {
                    if (data?.expressions) {
                        setExpressions(data.expressions);
                    } else {
                        setExpressions(exps);
                    }
                })
                .catch(() => setExpressions(exps))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [songId]);

    // Record session once expressions are loaded and user profile is fully merged
    useEffect(() => {
        if (result && !sessionRecorded && !loading && song && isLoaded) {
            const learnedWords: LearnedWord[] = expressions.map(exp => ({
                word: exp.word,
                translation: exp.translation,
                context: exp.context,
                example: exp.example,
                formality: exp.formality,
                relatedExpressions: exp.relatedExpressions,
                songId: song.id,
                songTitle: song.title,
                learnedAt: Date.now(),
            }));

            recordSession({
                songId: song.id,
                songTitle: song.title,
                songArtist: song.artist,
                score: result.score,
                accuracy: result.accuracy,
                blanksCorrect: result.blanksCorrect,
                blanksTotal: result.blanksTotal,
                playedAt: Date.now(),
                learnedWords,
            });
            setSessionRecorded(true);
        }
    }, [result, loading, expressions, isLoaded]);

    const nextSong = SONGS.find(s => s.id !== songId) || SONGS[0];

    if (!song) return <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Link href="/home"><button className="btn-primary">← Voltar</button></Link>
    </div>;

    const scoreGrade = !result ? '' : result.accuracy >= 90 ? 'S' : result.accuracy >= 70 ? 'A' : result.accuracy >= 50 ? 'B' : result.accuracy >= 30 ? 'C' : 'D';
    const gradeColor = scoreGrade ? ({ S: '#e8ff47', A: '#4ade80', B: '#60a5fa', C: '#fbbf24', D: '#f87171' } as Record<string, string>)[scoreGrade] : '#8888aa';

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
                {/* Result hero */}
                <div style={{
                    background: 'linear-gradient(135deg, #12121a, #1a1a28)',
                    border: '1px solid #2a2a3a',
                    borderRadius: '24px',
                    padding: '40px',
                    textAlign: 'center',
                    marginBottom: '32px',
                    animation: 'scaleIn 0.4s ease-out',
                }}>
                    {/* Grade */}
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '96px', lineHeight: 1, color: gradeColor, animation: 'glow 2s ease-in-out infinite alternate', marginBottom: '8px' }}>
                        {scoreGrade}
                    </div>
                    <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '3px', color: '#f0f0ff', marginBottom: '4px' }}>
                        {song.title}
                    </h1>
                    <p style={{ color: '#8888aa', marginBottom: '28px' }}>{song.artist}</p>

                    {/* Stats grid */}
                    {result && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', maxWidth: '500px', margin: '0 auto 24px' }}>
                            {[
                                { label: 'Pontuação', value: result.score.toLocaleString(), icon: '🏆' },
                                { label: 'Precisão', value: `${result.accuracy}%`, icon: '🎯' },
                                { label: 'Acertos', value: `${result.blanksCorrect}/${result.blanksTotal}`, icon: '✅' },
                                { label: 'Palavras', value: `${expressions.length}`, icon: '📚' },
                            ].map(stat => (
                                <div key={stat.label} style={{ background: '#0a0a0f', borderRadius: '12px', padding: '16px 12px' }}>
                                    <div style={{ fontSize: '20px', marginBottom: '6px' }}>{stat.icon}</div>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', color: '#e8ff47', letterSpacing: '1.5px' }}>{stat.value}</div>
                                    <div style={{ fontSize: '11px', color: '#8888aa', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href={`/play/${songId}`}>
                            <button className="btn-ghost" style={{ padding: '10px 24px' }}>↩ Jogar Novamente</button>
                        </Link>
                        <Link href={`/play/${nextSong.id}`}>
                            <button className="btn-primary" style={{ padding: '10px 24px' }}>Próxima Música →</button>
                        </Link>
                    </div>
                </div>

                {/* Expressions learned */}
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '2px', marginBottom: '6px', color: '#f0f0ff' }}>
                        EXPRESSÕES <span style={{ color: '#e8ff47' }}>APRENDIDAS</span>
                    </h2>
                    <p style={{ color: '#8888aa', fontSize: '14px', marginBottom: '20px' }}>
                        Explicações geradas pela IA para cada palavra que você acertou.
                    </p>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#4a4a6a' }}>
                            <div style={{ animation: 'float 1.5s ease-in-out infinite', fontSize: '32px', marginBottom: '12px' }}>🤖</div>
                            <p>Gerando explicações com IA...</p>
                        </div>
                    ) : expressions.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
                            {expressions.map((exp, i) => (
                                <ExpressionCard key={exp.word} expression={exp} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#4a4a6a' }}>
                            <p>Nenhuma palavra para explicar. Tente acertar algumas lacunas!</p>
                        </div>
                    )}
                </div>

                {/* Next songs */}
                <div>
                    <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', letterSpacing: '2px', marginBottom: '16px', color: '#f0f0ff' }}>
                        PRÓXIMAS <span style={{ color: '#e8ff47' }}>MÚSICAS</span>
                    </h2>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {SONGS.filter(s => s.id !== songId).slice(0, 3).map(s => (
                            <Link key={s.id} href={`/play/${s.id}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    background: '#12121a',
                                    border: '1px solid #2a2a3a',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    minWidth: '200px',
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e8ff47'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a3a'; }}>
                                    <div style={{ width: '36px', height: '36px', background: s.coverColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                                        🎵
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f0ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                                        <div style={{ fontSize: '11px', color: '#8888aa' }}>{s.artist}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
