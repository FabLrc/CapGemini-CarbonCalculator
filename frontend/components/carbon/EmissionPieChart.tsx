import React from 'react';
import { View, Text, useWindowDimensions, Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { formatCo2 } from './KpiCard';

type Props = {
  co2Construction: number;
  co2Exploitation: number;
};

// ── Pure-SVG donut (web only) ──────────────────────────────────────────────
function WebPieChart({ co2Construction, co2Exploitation }: Props) {
  const total = co2Construction + co2Exploitation;
  const constructionPct = Math.round((co2Construction / total) * 100);
  const exploitationPct = 100 - constructionPct;

  const cx = 110, cy = 110, R = 80, r = 48;
  const TAU = 2 * Math.PI;

  // arc helper
  const arc = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${outerR},${outerR},0,${large},1,${x2},${y2} L${x3},${y3} A${innerR},${innerR},0,${large},0,${x4},${y4} Z`;
  };

  const start1 = -Math.PI / 2;
  const end1 = start1 + TAU * (co2Construction / total);
  const start2 = end1;
  const end2 = start1 + TAU;

  // label positions (midpoint of each arc)
  const mid1 = (start1 + end1) / 2;
  const mid2 = (start2 + end2) / 2;
  const labelR = 98;

  return (
    // @ts-ignore – SVG elements on web
    <svg width="220" height="220" viewBox="0 0 220 220">
      {/* @ts-ignore */}
      <path d={arc(start1, end1, R, r)} fill={Colors.primary} />
      {/* @ts-ignore */}
      <path d={arc(start2, end2, R, r)} fill={Colors.secondary} />
      {/* labels */}
      {/* @ts-ignore */}
      <text x={cx + labelR * Math.cos(mid1)} y={cy + labelR * Math.sin(mid1)} textAnchor="middle" fontSize="11" fontWeight="600" fill={Colors.textPrimary}>
        {/* @ts-ignore */}
        <tspan x={cx + labelR * Math.cos(mid1)} dy="0">Construction</tspan>
        {/* @ts-ignore */}
        <tspan x={cx + labelR * Math.cos(mid1)} dy="14">{constructionPct}%</tspan>
      </text>
      {/* @ts-ignore */}
      <text x={cx + labelR * Math.cos(mid2)} y={cy + labelR * Math.sin(mid2)} textAnchor="middle" fontSize="11" fontWeight="600" fill={Colors.textPrimary}>
        {/* @ts-ignore */}
        <tspan x={cx + labelR * Math.cos(mid2)} dy="0">Exploitation</tspan>
        {/* @ts-ignore */}
        <tspan x={cx + labelR * Math.cos(mid2)} dy="14">{exploitationPct}%</tspan>
      </text>
    </svg>
  );
}

// ── Native (Victory) ───────────────────────────────────────────────────────
let VictoryPie: any = null;
if (Platform.OS !== 'web') {
  VictoryPie = require('victory-native').VictoryPie;
}

export function EmissionPieChart({ co2Construction, co2Exploitation }: Props) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 32, 360);
  const total = co2Construction + co2Exploitation;

  if (total === 0) return null;

  const constructionPct = Math.round((co2Construction / total) * 100);
  const exploitationPct = 100 - constructionPct;

  const legend = (
    <View style={{ flexDirection: 'row', gap: 24, marginTop: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: Colors.primary }} />
        <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
          Construction{' '}
          <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>{formatCo2(co2Construction)}</Text>
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: Colors.secondary }} />
        <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
          Exploitation{' '}
          <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>{formatCo2(co2Exploitation)}</Text>
        </Text>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={{ alignItems: 'center' }}>
        <WebPieChart co2Construction={co2Construction} co2Exploitation={co2Exploitation} />
        {legend}
      </View>
    );
  }

  const data = [
    { x: `Construction\n${constructionPct}%`, y: co2Construction },
    { x: `Exploitation\n${exploitationPct}%`, y: co2Exploitation },
  ];

  return (
    <View style={{ alignItems: 'center' }}>
      <VictoryPie
        data={data}
        colorScale={[Colors.primary, Colors.secondary]}
        width={chartWidth}
        height={220}
        innerRadius={55}
        labelRadius={95}
        style={{
          labels: { fontSize: 11, fontWeight: '600', fill: Colors.textPrimary },
        }}
        animate={{ duration: 400 }}
      />
      {legend}
    </View>
  );
}
