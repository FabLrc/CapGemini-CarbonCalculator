import React from 'react';
import { View, Text, useWindowDimensions, Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { Site } from '@/stores/sitesStore';

// Victory is only used on native — lazy-loaded to avoid accessibilityHint DOM warnings on web
let VictoryBar: any = null, VictoryChart: any = null, VictoryAxis: any = null, VictoryGroup: any = null;
if (Platform.OS !== 'web') {
  const v = require('victory-native');
  VictoryBar = v.VictoryBar; VictoryChart = v.VictoryChart;
  VictoryAxis = v.VictoryAxis; VictoryGroup = v.VictoryGroup;
}

type Props = { sites: Site[] };

const fmtTick = (t: number) =>
  t >= 1_000_000 ? `${(t / 1_000_000).toFixed(1)}M` : t >= 1000 ? `${(t / 1000).toFixed(0)}k` : `${t}`;

const shortName = (name: string) => (name.length > 12 ? name.substring(0, 12) + '.' : name);

const legend = (
  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 4 }}>
    {[{ color: Colors.primary, label: 'Construction' }, { color: Colors.secondary, label: 'Exploitation' }].map((d) => (
      <View key={d.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: d.color }} />
        <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{d.label}</Text>
      </View>
    ))}
  </View>
);

/** Pure-SVG grouped bar chart — no Victory, no DOM prop warnings on web */
function WebSvgChart({ sites }: { sites: Site[] }) {
  const W = 560, H = 200;
  const padL = 52, padB = 48, padT = 10, padR = 16;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxVal = Math.max(...sites.flatMap((s) => [s.co2Construction ?? 0, s.co2Exploitation ?? 0]), 1);
  const scale = (v: number) => innerH - (v / maxVal) * innerH;

  const groupW = innerW / sites.length;
  const barW = Math.min(groupW * 0.3, 22);
  const gap = barW * 0.4;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((r) => maxVal * r);

  return (
    <View>
      {/* @ts-ignore — svg is valid on RN Web */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* Grid lines */}
        {ticks.map((t) => {
          const y = padT + scale(t);
          return (
            <g key={t}>
              {/* @ts-ignore */}
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={Colors.border} strokeDasharray="4,4" strokeWidth={1} />
              {/* @ts-ignore */}
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill={Colors.textSecondary}>{fmtTick(t)}</text>
            </g>
          );
        })}
        {/* X axis line */}
        {/* @ts-ignore */}
        <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke={Colors.border} strokeWidth={1} />

        {/* Bars + labels */}
        {sites.map((s, i) => {
          const cx = padL + i * groupW + groupW / 2;
          const cVal = s.co2Construction ?? 0;
          const eVal = s.co2Exploitation ?? 0;
          const cH = (cVal / maxVal) * innerH;
          const eH = (eVal / maxVal) * innerH;
          return (
            <g key={s.id}>
              {/* Construction bar */}
              {/* @ts-ignore */}
              <rect x={cx - gap / 2 - barW} y={padT + scale(cVal)} width={barW} height={cH} fill={Colors.primary} rx={2} />
              {/* Exploitation bar */}
              {/* @ts-ignore */}
              <rect x={cx + gap / 2} y={padT + scale(eVal)} width={barW} height={eH} fill={Colors.secondary} rx={2} />
              {/* Site label */}
              {/* @ts-ignore */}
              <text x={cx} y={padT + innerH + 14} textAnchor="middle" fontSize={9} fill={Colors.textSecondary}>{shortName(s.name)}</text>
            </g>
          );
        })}
      </svg>
      {legend}
    </View>
  );
}

export function SitesComparisonChart({ sites }: Props) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 32, 600);

  const filtered = sites.filter((s) => s.co2Total !== null).slice(0, 6);
  if (filtered.length < 2) return null;

  // On web use pure SVG to avoid Victory's accessibilityHint DOM warnings
  if (Platform.OS === 'web') {
    return <WebSvgChart sites={filtered} />;
  }

  // Native: use Victory (renders correctly without DOM issues)
  const constructionData = filtered.map((s) => ({ x: shortName(s.name), y: s.co2Construction ?? 0 }));
  const exploitationData = filtered.map((s) => ({ x: shortName(s.name), y: s.co2Exploitation ?? 0 }));
  const barHeight = filtered.length * 52 + 60;

  return (
    <View>
      <VictoryChart
        horizontal
        width={chartWidth}
        height={barHeight}
        domainPadding={{ y: 18 }}
        padding={{ top: 10, bottom: 36, left: 100, right: 32 }}
      >
        <VictoryAxis
          style={{
            tickLabels: { fontSize: 10, fill: Colors.textSecondary },
            axis: { stroke: Colors.border },
            grid: { stroke: 'transparent' },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={fmtTick}
          style={{
            tickLabels: { fontSize: 8, fill: Colors.textSecondary },
            axis: { stroke: Colors.border },
            grid: { stroke: Colors.border, strokeDasharray: '4,4' },
          }}
        />
        <VictoryGroup offset={10} colorScale={[Colors.primary, Colors.secondary]}>
          <VictoryBar data={constructionData} cornerRadius={{ topRight: 2, bottomRight: 2 }} />
          <VictoryBar data={exploitationData} cornerRadius={{ topRight: 2, bottomRight: 2 }} />
        </VictoryGroup>
      </VictoryChart>
      {legend}
    </View>
  );
}
