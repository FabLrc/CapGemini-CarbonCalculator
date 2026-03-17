import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { SiteSnapshot } from '@/services/api';
import { formatCo2 } from '@/components/carbon/KpiCard';

interface EvolutionChartProps {
  snapshots: SiteSnapshot[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function EvolutionChart({ snapshots }: EvolutionChartProps) {
  if (snapshots.length < 2) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
          Au moins 2 snapshots sont nécessaires pour afficher l'évolution.
        </Text>
      </View>
    );
  }

  const values = snapshots.map((s) => s.co2Total ?? 0);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const WIDTH = 280;
  const HEIGHT = 100;
  const PADDING_X = 4;
  const PADDING_Y = 10;

  const points = snapshots.map((s, i) => {
    const x = PADDING_X + (i / (snapshots.length - 1)) * (WIDTH - PADDING_X * 2);
    const y = PADDING_Y + (1 - (( s.co2Total ?? 0) - minVal) / range) * (HEIGHT - PADDING_Y * 2);
    return { x, y, snap: s };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const first = snapshots[0].co2Total ?? 0;
  const last = snapshots[snapshots.length - 1].co2Total ?? 0;
  const delta = first > 0 ? ((last - first) / first) * 100 : 0;
  const isImproved = delta < 0;

  if (Platform.OS !== 'web') {
    // Simplified table view for mobile (no SVG)
    return (
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Évolution CO₂ Total</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: isImproved ? Colors.success : Colors.danger }}>
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
          </Text>
        </View>
        {snapshots.slice(-5).map((s) => (
          <View
            key={s.id}
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.border }}
          >
            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
              {formatDate(s.snapshotDate)}{s.note ? ` · ${s.note}` : ''}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>
              {formatCo2(s.co2Total)}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  // Web: SVG chart
  return (
    <View>
      {/* Delta badge */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 12, color: Colors.textSecondary }}>CO₂ Total dans le temps</Text>
        <View style={{
          paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
          backgroundColor: isImproved ? '#D4EDDA' : '#F8D7DA',
        }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: isImproved ? Colors.success : Colors.danger }}>
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}% depuis création
          </Text>
        </View>
      </View>

      {/* SVG line chart */}
      <View style={{ alignItems: 'center' }}>
        <svg
          width={WIDTH}
          height={HEIGHT}
          style={{ overflow: 'visible' } as any}
        >
          {/* Grid lines */}
          {[0, 0.5, 1].map((t) => {
            const y = PADDING_Y + t * (HEIGHT - PADDING_Y * 2);
            const val = maxVal - t * range;
            return (
              <g key={t}>
                <line x1={PADDING_X} y1={y} x2={WIDTH - PADDING_X} y2={y} stroke={Colors.border} strokeWidth="1" strokeDasharray="4,4" />
                <text x={0} y={y + 4} fontSize="9" fill={Colors.textSecondary}>{Math.round(val / 1000)}k</text>
              </g>
            );
          })}

          {/* Line */}
          <path d={pathD} fill="none" stroke={Colors.primary} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* Area fill */}
          <path
            d={`${pathD} L ${points[points.length - 1].x.toFixed(1)} ${HEIGHT} L ${points[0].x.toFixed(1)} ${HEIGHT} Z`}
            fill={Colors.primary}
            fillOpacity="0.08"
          />

          {/* Dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill={Colors.primary} stroke="white" strokeWidth="1.5" />
          ))}
        </svg>
      </View>

      {/* X labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 10, color: Colors.textSecondary }}>{formatDate(snapshots[0].snapshotDate)}</Text>
        {snapshots.length > 2 && (
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>
            {formatDate(snapshots[Math.floor(snapshots.length / 2)].snapshotDate)}
          </Text>
        )}
        <Text style={{ fontSize: 10, color: Colors.textSecondary }}>{formatDate(snapshots[snapshots.length - 1].snapshotDate)}</Text>
      </View>

      {/* Note du dernier snapshot */}
      {snapshots[snapshots.length - 1].note && (
        <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 8, fontStyle: 'italic' }}>
          Dernier snapshot : {snapshots[snapshots.length - 1].note}
        </Text>
      )}
    </View>
  );
}
