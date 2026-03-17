import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Colors } from '@/constants/colors';

type Site = {
  id: number;
  name: string;
  constructionYear?: number | null;
  co2Construction?: number | null;
  co2Exploitation?: number | null;
};

type Props = { sites: Site[] };

function formatK(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
  return String(Math.round(val));
}

export function PortfolioTimelineChart({ sites }: Props) {
  const currentYear = new Date().getFullYear();

  // Only sites with constructionYear and co2Exploitation
  const valid = sites.filter(
    (s) => s.constructionYear != null && s.co2Exploitation != null
  );

  if (valid.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
          Aucun site avec une année de construction renseignée.
        </Text>
      </View>
    );
  }

  const minYear = Math.min(...valid.map((s) => s.constructionYear!));
  const years = Array.from({ length: currentYear - minYear + 1 }, (_, i) => minYear + i);

  // For each calendar year, compute:
  // - annualConstruction: sites built that year (one-time)
  // - annualExploitation: sum of exploitation for all sites built on or before that year
  const data = years.map((yr) => {
    const annualConstruction = valid
      .filter((s) => s.constructionYear === yr)
      .reduce((sum, s) => sum + (s.co2Construction ?? 0), 0);
    const annualExploitation = valid
      .filter((s) => s.constructionYear! <= yr)
      .reduce((sum, s) => sum + (s.co2Exploitation ?? 0), 0);
    return { yr, annualConstruction, annualExploitation, total: annualConstruction + annualExploitation };
  });

  // Cumulative (running total over all years)
  let cum = 0;
  const cumData = data.map((d) => { cum += d.total; return cum; });

  const maxBar = Math.max(...data.map((d) => d.total), 1);
  const maxCum = Math.max(...cumData, 1);

  // Native fallback
  if (Platform.OS !== 'web') {
    return (
      <View>
        {data.map((d, i) => (
          <View key={d.yr} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{d.yr}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textPrimary }}>
                {formatK(d.total)} kgCO₂e
              </Text>
            </View>
            <View style={{ height: 10, backgroundColor: Colors.border, borderRadius: 5, flexDirection: 'row', overflow: 'hidden' }}>
              <View style={{ width: `${(d.annualConstruction / maxBar) * 100}%` as any, backgroundColor: Colors.primary }} />
              <View style={{ width: `${(d.annualExploitation / maxBar) * 100}%` as any, backgroundColor: Colors.secondary }} />
            </View>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: Colors.primary }} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Construction</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: Colors.secondary }} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Exploitation</Text>
          </View>
        </View>
      </View>
    );
  }

  // Web SVG
  const W = 580, H = 220;
  const padL = 56, padR = 60, padT = 16, padB = 44;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = data.length;
  const groupW = chartW / n;
  const barW = Math.max(Math.min(groupW * 0.7, 32), 4);
  const barOffset = (groupW - barW) / 2;

  const yBar = (v: number) => padT + chartH - (v / maxBar) * chartH;
  const yCum = (v: number) => padT + chartH - (v / maxCum) * chartH;

  const linePts = cumData.map((v, i) => `${padL + i * groupW + groupW / 2},${yCum(v)}`);
  const linePath = `M ${linePts.join(' L ')}`;

  // Only label every N years to avoid clutter
  const labelEvery = n <= 10 ? 1 : n <= 20 ? 2 : 5;
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => (maxBar / tickCount) * i);

  return (
    <View>
      {/* @ts-ignore */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* Grid + left Y axis */}
        {yTicks.map((t) => {
          const y = yBar(t);
          return (
            // @ts-ignore
            <g key={t}>
              {/* @ts-ignore */}
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth={1} />
              {/* @ts-ignore */}
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={10} fill={Colors.textSecondary}>{formatK(t)}</text>
            {/* @ts-ignore */}
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padL + i * groupW + barOffset;
          const baseY = padT + chartH;
          const consH = (d.annualConstruction / maxBar) * chartH;
          const exploH = (d.annualExploitation / maxBar) * chartH;
          return (
            // @ts-ignore
            <g key={d.yr}>
              {/* Exploitation — base floor, grows each year as more buildings are operational */}
              {/* @ts-ignore */}
              <rect x={x} y={baseY - exploH} width={barW} height={exploH} fill={Colors.secondary} rx={1} />
              {/* Construction — one-time spike on top (only in construction year) */}
              {consH > 0 && (
                // @ts-ignore
                <rect x={x} y={baseY - exploH - consH} width={barW} height={consH} fill={Colors.primary} rx={1} />
              )}
              {/* Year label */}
              {i % labelEvery === 0 && (
                // @ts-ignore
                <text x={x + barW / 2} y={H - padB + 14} textAnchor="middle" fontSize={10} fill={Colors.textSecondary}>{d.yr}</text>
              )}
            {/* @ts-ignore */}
            </g>
          );
        })}

        {/* Cumulative line (right axis) */}
        {/* @ts-ignore */}
        <path d={linePath} fill="none" stroke="#f97316" strokeWidth={2} strokeDasharray="4 2" />
        {cumData.map((v, i) => (
          // @ts-ignore
          <circle key={i} cx={padL + i * groupW + groupW / 2} cy={yCum(v)} r={2.5} fill="#f97316" />
        ))}

        {/* Right axis labels (cumulative) */}
        {[0, 0.5, 1].map((frac) => {
          const val = maxCum * frac;
          const y = yCum(val);
          return (
            // @ts-ignore
            <text key={frac} x={W - padR + 4} y={y + 4} fontSize={9} fill="#f97316">{formatK(val)}</text>
          );
        })}

        {/* Axes */}
        {/* @ts-ignore */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#d1d5db" strokeWidth={1} />
        {/* @ts-ignore */}
        <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#d1d5db" strokeWidth={1} />
      {/* @ts-ignore */}
      </svg>

      <View style={{ flexDirection: 'row', gap: 16, marginTop: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: Colors.primary }} />
          <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Construction (année de mise en service)</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: Colors.secondary }} />
          <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Exploitation annuelle (tous bâtiments en service)</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 20, height: 2, backgroundColor: '#f97316' }} />
          <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Cumulé</Text>
        </View>
      </View>
    </View>
  );
}
