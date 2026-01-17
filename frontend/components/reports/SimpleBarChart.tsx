'use client';

import React from 'react';
import type { BarDatum } from './reportFormat';

export const SimpleBarChart: React.FC<{ data: BarDatum[]; height?: number }> = ({ data, height = 220 }) => {
    const width = 900;
    const padding = 24;

    const values = data.map((d) => d.value);
    const maxAbs = Math.max(1, ...values.map((v) => Math.abs(v)));

    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    const barGap = 4;
    const barWidth = data.length > 0 ? (chartWidth - barGap * (data.length - 1)) / data.length : chartWidth;

    const yForValue = (v: number) => {
        const hasNeg = values.some((x) => x < 0);
        const baseline = hasNeg ? padding + chartHeight / 2 : padding + chartHeight;
        const scale = hasNeg ? chartHeight / 2 / maxAbs : chartHeight / maxAbs;
        return {
            baseline,
            barHeight: Math.abs(v) * scale,
            isPositive: v >= 0,
        };
    };

    return (
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} aria-label="Bar chart">
            <line
                x1={padding}
                y1={padding + chartHeight}
                x2={padding + chartWidth}
                y2={padding + chartHeight}
                stroke="var(--border)"
                strokeWidth={1}
            />

            {data.map((d, i) => {
                const x = padding + i * (barWidth + barGap);
                const { baseline, barHeight, isPositive } = yForValue(d.value);
                const y = isPositive ? baseline - barHeight : baseline;

                return (
                    <g key={`${d.label}-${i}`}>
                        <rect
                            x={x}
                            y={y}
                            width={Math.max(1, barWidth)}
                            height={Math.max(1, barHeight)}
                            rx={6}
                            fill={isPositive ? 'var(--success)' : 'var(--danger)'}
                            opacity={0.9}
                        />
                    </g>
                );
            })}
        </svg>
    );
};
