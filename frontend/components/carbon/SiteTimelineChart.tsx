import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Colors } from '@/constants/colors';

type SiteForTimeline = {
  name?: string;
  constructionYear?: number | null;
  co2Construction?: number | null;
  co2Exploitation?: number | null;
};

type Props = {
  site: SiteForTimeline;
  /** Override exploitation CO₂ (for simulation) */
  simCo2Exploitation?: number | null;
  /** Show simulated line overlay */
  showSimulation?: boolean;
};

function formatK(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
  return String(Math.round(val));
}

export function SiteTimelineChart({ site, simCo2Exploitation, showSimulation = false }: Props) {
  const currentYear = new Date().getFullYear();

  if (!site.constructionYear || !site.co2Exploitation) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 16 }}>
        <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
          Renseignez l'année de construction pour afficher la consommation sur la durée de vie.
        </Text>
      </View>
    );
  }

  const startYear = site.constructionYear;
  const co2Construction = site.co2Construction ?? 0;
  const co2Exploitation = site.co2Exploitation;

  // Extend 5 years into the future for projection
  const endYear = currentYear + 5;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  // "Actual" data per year
  const data = years.map((yr) => {
    const isFirstYear = yr === startYear;
    const isProjection = yr > currentYear;
    const annual = isFirstYear
      ? co2Construction + co2Exploitation
      : co2Exploitation;
    return { yr, co2Construction: isFirstYear ? co2Construction : 0, co2Exploitation, annual, isProjection };
  });

  // Cumulative
  let cum = 0;
  const cumActual = data.map((d) => { cum += d.annual; return cum; });

  // Simulated cumulative (only if showSimulation and simCo2Exploitation provided)
  const hasSim = showSimulation && simCo2Exploitation != null;
  let cumSim: number[] = [];
  if (hasSim) {
    let simCum = 0;
    cumSim = data.map((d) => {
      const isFirstYear = d.yr === startYear;
      const annual = isFirstYear
        ? co2Construction + simCo2Exploitation!
        : (d.yr <= currentYear ? co2Exploitation : simCo2Exploitation!);
      simCum += annual;
      return simCum;
    });
  }

  const maxBar = Math.max(...data.map((d) => d.annual), 1);
  const maxCum = Math.max(...cumActual, hasSim ? Math.max(...cumSim) : 0, 1);

  const n = years.length;

  // Native fallback
  if (Platform.OS !== 'web') {
    // Only show last ~8 years on native for readability
    const sliceFrom = Math.max(0, data.length - 8);
    const sliced = data.slice(sliceFrom);
    return (
      <View>
        {sliced.map((d) => (
          <View key={d.yr} style={{ marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ fontSize: 11, color: d.isProjection ? Colors.textTertiary : Colors.textSecondary }}>
                {d.yr}{d.isProjection ? ' (proj.)' : ''}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textPrimary }}>
                {formatK(d.annual)} kgCO₂e
              </Text>
            </View>
            <View style={{ height: 10, backgroundColor: Colors.border, borderRadius: 5, flexDirection: 'row', overflow: 'hidden', opacity: d.isProjection ? 0.5 : 1 }}>
              <View style={{ width: `${(d.co2Construction / maxBar) * 100}%` as any, backgroundColor: Colors.primary }} />
              <View style={{ width: `${(d.co2Exploitation / maxBar) * 100}%` as any, backgroundColor: Colors.secondary }} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // Web SVG
  const W = 580, H = 230;
  const padL = 56, padR = 64, padT = 16, padB = 46;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const groupW = chartW / n;
  const barW = Math.max(Math.min(groupW * 0.65, 28), 3);
  const barOff = (groupW - barW) / 2;
  const baseY = padT + chartH;

  const yBar = (v: number) => padT + chartH - (v / maxBar) * chartH;
  const yCum = (v: number) => padT + chartH - (v / maxCum) * chartH;

  const actualLinePts = cumActual.map((v, i) => `${padL + i * groupW + groupW / 2},${yCum(v)}`);
  const simLinePts = hasSim ? cumSim.map((v, i) => `${padL + i * groupW + groupW / 2},${yCum(v)}`) : [];

  const labelEvery = n <= 12 ? 1 : n <= 20 ? 2 : 5;
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => (maxBar / tickCount) * i);
  const currentYearIdx = years.indexOf(currentYear);

  return (
    <View>
      {/* @ts-ignore */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* Grid */}
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

        {/* Current year vertical separator */}
        {currentYearIdx >= 0 && (
          // @ts-ignore
          <line
            x1={padL + currentYearIdx * groupW + groupW}
            y1={padT}
            x2={padL + currentYearIdx * groupW + groupW}
            y2={baseY}
            stroke="#9CA3AF"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padL + i * groupW + barOff;
          const exploH = (d.co2Exploitation / maxBar) * chartH;
          const consH = (d.co2Construction / maxBar) * chartH;
          const opacity = d.isProjection ? 0.4 : 1;
          return (
            // @ts-ignore
            <g key={d.yr}>
              {/* Exploitation — base floor each year */}
              {/* @ts-ignore */}
              <rect x={x} y={baseY - exploH} width={barW} height={exploH} fill={Colors.secondary} rx={1} opacity={opacity} />
              {/* Construction — one-time spike on top (first year only) */}
              {consH > 0 && (
                // @ts-ignore
                <rect x={x} y={baseY - exploH - consH} width={barW} height={consH} fill={Colors.primary} rx={1} opacity={opacity} />
              )}
              {i % labelEvery === 0 && (
                // @ts-ignore
                <text x={x + barW / 2} y={H - padB + 14} textAnchor="middle" fontSize={10} fill={d.isProjection ? Colors.textTertiary : Colors.textSecondary}>{d.yr}</text>
              )}
            {/* @ts-ignore */}
            </g>
          );
        })}

        {/* Actual cumulative line */}
        {/* @ts-ignore */}
        <path d={`M ${actualLinePts.join(' L ')}`} fill="none" stroke="#f97316" strokeWidth={2} />
        {cumActual.map((v, i) => (
          // @ts-ignore
          <circle key={i} cx={padL + i * groupW + groupW / 2} cy={yCum(v)} r={2.5} fill="#f97316" opacity={data[i].isProjection ? 0.4 : 1} />
        ))}

        {/* Simulated cumulative line */}
        {hasSim && (
          // @ts-ignore
          <path d={`M ${simLinePts.join(' L ')}`} fill="none" stroke={Colors.carbonLow} strokeWidth={2} strokeDasharray="5 3" />
        )}
        {hasSim && cumSim.map((v, i) => (
          // @ts-ignore
          <circle key={i} cx={padL + i * groupW + groupW / 2} cy={yCum(v)} r={2} fill={Colors.carbonLow} />
        ))}

        {/* Right axis labels */}
        {[0, 0.5, 1].map((frac) => {
          const val = maxCum * frac;
          return (
            // @ts-ignore
            <text key={frac} x={W - padR + 4} y={yCum(val) + 4} fontSize={9} fill="#f97316">{formatK(val)}</text>
          );
        })}

        {/* Axes */}
        {/* @ts-ignore */}
        <line x1={padL} y1={padT} x2={padL} y2={baseY} stroke="#d1d5db" strokeWidth={1} />
        {/* @ts-ignore */}
        <line x1={padL} y1={baseY} x2={W - padR} y2={baseY} stroke="#d1d5db" strokeWidth={1} />

        {/* "Aujourd'hui" label */}
        {currentYearIdx >= 0 && (
          // @ts-ignore
          <text x={padL + currentYearIdx * groupW + groupW + 2} y={padT + 10} fontSize={9} fill={Colors.textTertiary}>
            Aujourd'hui
          {/* @ts-ignore */}
          </text>
        )}
      {/* @ts-ignore */}
      </svg>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: Colors.primary }} />
          <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Construction</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: Colors.secondary }} />
          <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Exploitation annuelle</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 20, height: 2, backgroundColor: '#f97316' }} />
          <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Cumulé actuel</Text>
        </View>
        {hasSim && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 20, height: 2, backgroundColor: Colors.carbonLow, borderStyle: 'dashed' }} />
            <Text style={{ fontSize: 11, color: Colors.carbonLow, fontWeight: '600' }}>Cumulé rénové</Text>
          </View>
        )}
      </View>
    </View>
  );
}
