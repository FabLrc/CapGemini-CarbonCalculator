import React from 'react';
import { View, Text, useWindowDimensions, Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { SiteMaterial } from '@/stores/sitesStore';

type Props = {
  materials: SiteMaterial[];
};

const fmtVal = (t: number) =>
  t >= 1000 ? `${(t / 1000).toFixed(0)}t` : `${t.toFixed(0)}`;

// ── Pure-SVG bar chart (web) ───────────────────────────────────────────────
function WebBarChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 500, H = 200;
  const padL = 52, padB = 50, padT = 10, padR = 16;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.min(innerW / data.length * 0.55, 36);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((r) => maxVal * r);

  return (
    <View>
      {/* @ts-ignore */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* Grid lines + Y labels */}
        {ticks.map((t) => {
          const y = padT + innerH - (t / maxVal) * innerH;
          return (
            <g key={t}>
              {/* @ts-ignore */}
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={Colors.border} strokeDasharray="4,4" strokeWidth={1} />
              {/* @ts-ignore */}
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={9} fill={Colors.textSecondary}>{fmtVal(t)}</text>
            </g>
          );
        })}
        {/* X axis */}
        {/* @ts-ignore */}
        <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke={Colors.border} strokeWidth={1} />

        {/* Bars */}
        {data.map((d, i) => {
          const slotW = innerW / data.length;
          const cx = padL + i * slotW + slotW / 2;
          const bH = (d.value / maxVal) * innerH;
          const shortLabel = d.label.length > 9 ? d.label.substring(0, 9) + '.' : d.label;
          return (
            <g key={d.label}>
              {/* @ts-ignore */}
              <rect x={cx - barW / 2} y={padT + innerH - bH} width={barW} height={bH} fill={Colors.primary} rx={3} />
              {/* @ts-ignore */}
              <text x={cx} y={padT + innerH + 14} textAnchor="middle" fontSize={9} fill={Colors.textSecondary}>{shortLabel}</text>
            </g>
          );
        })}
      </svg>
      <Text style={{ textAlign: 'center', fontSize: 11, color: Colors.textSecondary, marginTop: 4 }}>
        kgCO₂e par matériau
      </Text>
    </View>
  );
}

// ── Native (Victory) — loaded lazily so tree-shaking works on web ──────────
let VictoryBar: any = null, VictoryChart: any = null, VictoryAxis: any = null;
if (Platform.OS !== 'web') {
  const v = require('victory-native');
  VictoryBar = v.VictoryBar;
  VictoryChart = v.VictoryChart;
  VictoryAxis = v.VictoryAxis;
}

export function MaterialsBarChart({ materials }: Props) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 32, 500);

  const data = materials
    .filter((m) => m.co2Kg > 0)
    .sort((a, b) => b.co2Kg - a.co2Kg)
    .map((m) => ({
      label: m.factorLabel,
      value: m.co2Kg,
    }));

  if (data.length === 0) return null;

  if (Platform.OS === 'web') {
    return <WebBarChart data={data} />;
  }

  // Native — Victory
  const victoryData = data.map((d) => ({
    x: d.label.length > 8 ? d.label.substring(0, 8) + '.' : d.label,
    y: d.value,
    label: d.label,
  }));

  return (
    <View>
      <VictoryChart
        width={chartWidth}
        height={200}
        domainPadding={{ x: 20 }}
        padding={{ top: 10, bottom: 50, left: 60, right: 20 }}
      >
        <VictoryAxis
          style={{
            tickLabels: { fontSize: 10, fill: Colors.textSecondary, angle: -30, textAnchor: 'end' },
            axis: { stroke: Colors.border },
            grid: { stroke: 'transparent' },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t: number) =>
            t >= 1000 ? `${(t / 1000).toFixed(0)}t` : `${t.toFixed(0)}`
          }
          style={{
            tickLabels: { fontSize: 10, fill: Colors.textSecondary },
            axis: { stroke: Colors.border },
            grid: { stroke: Colors.border, strokeDasharray: '4,4' },
          }}
        />
        <VictoryBar
          data={victoryData}
          style={{ data: { fill: Colors.primary, borderRadius: 4 } }}
          animate={{ duration: 400 }}
          cornerRadius={{ top: 3 }}
        />
      </VictoryChart>
      <Text style={{ textAlign: 'center', fontSize: 11, color: Colors.textSecondary, marginTop: -8 }}>
        kgCO₂e par matériau
      </Text>
    </View>
  );
}
