'use client';

import { ExpressionExplanation } from '@/types';

interface ExpressionCardProps {
    expression: ExpressionExplanation;
    index: number;
}

const FORMALITY_CONFIG = {
    formal: { label: 'Formal', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' },
    informal: { label: 'Informal', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
    slang: { label: 'Gíria', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
};

export default function ExpressionCard({ expression, index }: ExpressionCardProps) {
    const formality = FORMALITY_CONFIG[expression.formality] || FORMALITY_CONFIG.informal;

    return (
        <div style={{
            background: '#12121a',
            border: '1px solid #2a2a3a',
            borderRadius: '16px',
            padding: '20px',
            animation: `slideUp 0.4s ease-out ${index * 0.1}s both`,
            transition: 'all 0.2s ease',
        }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(232, 255, 71, 0.25)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(232, 255, 71, 0.05)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a3a';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                <div>
                    <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#e8ff47',
                        display: 'block',
                        lineHeight: '1.2',
                    }}>
                        {expression.word}
                    </span>
                    <span style={{ fontSize: '15px', color: '#f0f0ff', fontWeight: '500', marginTop: '2px', display: 'block' }}>
                        {expression.translation}
                    </span>
                </div>
                <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: formality.color,
                    background: formality.bg,
                    border: `1px solid ${formality.color}40`,
                    flexShrink: 0,
                }}>
                    {formality.label}
                </span>
            </div>

            {/* Context */}
            <p style={{ fontSize: '13px', color: '#8888aa', lineHeight: '1.6', marginBottom: '10px' }}>
                {expression.context}
            </p>

            {/* Example */}
            <div style={{
                background: 'rgba(232, 255, 71, 0.04)',
                border: '1px solid rgba(232, 255, 71, 0.12)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '10px',
            }}>
                <span style={{ fontSize: '11px', color: '#4a4a6a', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                    Exemplo
                </span>
                <span style={{ fontSize: '13px', color: '#d0d0ef', fontStyle: 'italic', lineHeight: '1.5' }}>
                    "{expression.example}"
                </span>
            </div>

            {/* Related expressions */}
            {expression.relatedExpressions && expression.relatedExpressions.length > 0 && (
                <div>
                    <span style={{ fontSize: '11px', color: '#4a4a6a', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                        Expressões relacionadas
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {expression.relatedExpressions.map((expr, i) => (
                            <span key={i} style={{
                                background: '#1a1a28',
                                border: '1px solid #2a2a3a',
                                borderRadius: '6px',
                                padding: '3px 10px',
                                fontSize: '12px',
                                color: '#8888aa',
                                fontFamily: "'Space Mono', monospace",
                            }}>
                                {expr}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
