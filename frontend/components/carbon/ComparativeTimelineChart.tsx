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

// 4 distinct colors for up to 4 sites
const PALETTE = ['#0070AD', '#F59E0B', '#DC2626', '#16A34A'];

function formatK(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
  return String(Math.round(val));
}

export function ComparativeTimelineChart({ sites }: Props) {
  const currentYear = new Date().getFullYear();

  const valid = sites.filter(
    (s) => s.constructionYear != null && s.co2Exploitation != null
  );

  if (valid.length < 2) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 16 }}>
        <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
          Sélectionnez au moins 2 sites avec une année de construction pour afficher ce graphique.
        </Text>
      </View>
    );
  }

  const minYear = Math.min(...valid.map((s) => s.constructionYear!));
  const years = Array.from({ length: currentYear - minYear + 1 }, (_, i) => minYear + i);

  // Cumulative CO₂ per site per year
  const seriesData = valid.map((site) => {
    let cum = 0;
    const cumValues = years.map((yr) => {
      if (yr < site.constructionYear!) return null; // site not yet built
      const isFirst = yr === site.constructionYear;
      const annual = isFirst
        ? (site.co2Construction ?? 0) + site.co2Exploitation!
        : site.co2Exploitation!;
      cum += annual;
      return cum;
    });
    return { site, cumValues };
  });

  const allValues = seriesData.flatMap((s) => s.cumValues.filter((v) => v != null) as number[]);
  const maxCum = Math.max(...allValues, 1);

  if (Platform.OS !== 'web') {
    // Native: show final cumulative bar chart
    return (
      <View>
        <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 8 }}>
          CO₂ cumulé total à ce jour (kgCO₂e)
        </Text>
        {seriesData.map(({ site, cumValues }, idx) => {
          const final = cumValues[cumValues.length - 1] ?? 0;
          return (
            <View key={site.id} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: PALETTE[idx % 4] }} numberOfLines={1}>
                  {site.name}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textPrimary }}>
                  {formatK(final)}
                </Text>
              </View>
              <View style={{ height: 10, backgroundColor: Colors.border, borderRadius: 5, overflow: 'hidden' }}>
                <View style={{ width: `${(final / maxCum) * 100}%` as any, height: 10, backgroundColor: PALETTE[idx % 4] }} />
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  // Web SVG: multi-line chart
  const W = 580, H = 220;
  const padL = 56, padR = 16, padT = 16, padB = 44;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = years.length;
  const xStep = chartW / Math.max(n - 1, 1);

  const xOf = (i: number) => padL + i * xStep;
  const yCum = (v: number) => padT + chartH - (v / maxCum) * chartH;

  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => (maxCum / tickCount) * i);
  const labelEvery = n <= 12 ? 1 : n <= 20 ? 2 : 5;

  return (
    <View>
      {/* @ts-ignore */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* Grid */}
        {yTicks.map((t) => {
          const y = yCum(t);
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

        {/* X axis labels */}
        {years.map((yr, i) => {
          if (i % labelEvery !== 0) return null;
          return (
            // @ts-ignore
            <text key={yr} x={xOf(i)} y={H - padB + 14} textAnchor="middle" fontSize={10} fill={Colors.textSecondary}>{yr}</text>
          );
        })}

        {/* Lines per site */}
        {seriesData.map(({ site, cumValues }, sIdx) => {
          const color = PALETTE[sIdx % 4];
          // Build path from first non-null value
          const points: string[] = [];
          cumValues.forEach((v, i) => {
            if (v != null) points.push(`${xOf(i)},${yCum(v)}`);
          });
          if (points.length < 2) return null;
          return (
            // @ts-ignore
            <g key={site.id}>
              {/* @ts-ignore */}
              <path d={`M ${points.join(' L ')}`} fill="none" stroke={color} strokeWidth={2.5} />
              {/* Dot at last point */}
              {(() => {
                const lastIdx = cumValues.map((v, i) => v != null ? i : -1).filter((i) => i >= 0).pop() ?? -1;
                if (lastIdx < 0) return null;
                return (
                  // @ts-ignore
                  <circle cx={xOf(lastIdx)} cy={yCum(cumValues[lastIdx]!)} r={4} fill={color} />
                );
              })()}
            {/* @ts-ignore */}
            </g>
          );
        })}

        {/* Axes */}
        {/* @ts-ignore */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#d1d5db" strokeWidth={1} />
        {/* @ts-ignore */}
        <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#d1d5db" strokeWidth={1} />
      {/* @ts-ignore */}
      </svg>

      {/* Legend */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6, justifyContent: 'center' }}>
        {seriesData.map(({ site }, idx) => (
          <View key={site.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 20, height: 3, backgroundColor: PALETTE[idx % 4], borderRadius: 2 }} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary }} numberOfLines={1}>
              {site.name.length > 20 ? site.name.substring(0, 18) + '…' : site.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
