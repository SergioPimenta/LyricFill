'use client';

interface ScoreHUDProps {
    score: number;
    combo: number;
    maxCombo: number;
    totalBlanks: number;
    answeredBlanks: number;
    currentTime: number;
    duration: number;
    comboAnimation: boolean;
}

export default function ScoreHUD({
    score,
    combo,
    maxCombo,
    totalBlanks,
    answeredBlanks,
    currentTime,
    duration,
    comboAnimation,
}: ScoreHUDProps) {
    const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

    const getComboColor = () => {
        if (combo >= 10) return '#e8ff47';
        if (combo >= 5) return '#a78bfa';
        if (combo >= 3) return '#60a5fa';
        return '#4a4a6a';
    };

    const getMultiplierLabel = () => {
        if (combo >= 10) return '×2.0';
        if (combo >= 5) return '×1.5';
        return '×1.0';
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Main HUD */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#12121a',
                border: '1px solid #2a2a3a',
                borderRadius: '14px',
                padding: '10px 20px',
                gap: '20px',
                marginBottom: '10px',
            }}>
                {/* Score */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#8888aa', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                        Score
                    </div>
                    <div style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: '28px',
                        letterSpacing: '2px',
                        color: '#e8ff47',
                        lineHeight: 1,
                        transition: 'all 0.3s ease',
                    }}>
                        {score.toLocaleString()}
                    </div>
                </div>

                {/* Combo */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#8888aa', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                        Combo
                    </div>
                    <div style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: '28px',
                        letterSpacing: '2px',
                        color: getComboColor(),
                        lineHeight: 1,
                        animation: comboAnimation ? 'comboBurst 0.5s ease-out' : 'none',
                        transition: 'color 0.3s ease',
                    }}>
                        {combo > 0 ? `${combo}🔥` : '—'}
                    </div>
                    {combo >= 5 && (
                        <div style={{ fontSize: '10px', color: getComboColor(), fontFamily: "'Space Mono', monospace", marginTop: '1px' }}>
                            {getMultiplierLabel()}
                        </div>
                    )}
                </div>

                {/* Blanks progress */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#8888aa', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                        Lacunas
                    </div>
                    <div style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: '28px',
                        letterSpacing: '2px',
                        color: '#f0f0ff',
                        lineHeight: 1,
                    }}>
                        {answeredBlanks}<span style={{ fontSize: '16px', color: '#4a4a6a' }}>/{totalBlanks}</span>
                    </div>
                </div>

                {/* Max combo */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#8888aa', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                        Melhor
                    </div>
                    <div style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: '28px',
                        letterSpacing: '2px',
                        color: '#4a4a6a',
                        lineHeight: 1,
                    }}>
                        {maxCombo > 0 ? `${maxCombo}` : '—'}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', background: '#2a2a3a', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #b8cc1a, #e8ff47)',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                }} />
            </div>
        </div>
    );
}
