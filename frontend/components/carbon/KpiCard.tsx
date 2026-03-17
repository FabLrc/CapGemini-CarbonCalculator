import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';

type Props = {
  label: string;
  value: string;
  unit: string;
  color?: string;
  icon?: string;
};

export function KpiCard({ label, value, unit, color = Colors.primary, icon }: Props) {
  return (
    <Card style={{ flex: 1, minWidth: 140, margin: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        {icon && <Text style={{ fontSize: 20, marginRight: 6 }}>{icon}</Text>}
        <Text style={{ fontSize: 12, color: Colors.textSecondary, fontWeight: '600', flex: 1 }}>
          {label.toUpperCase()}
        </Text>
      </View>
      <Text style={{ fontSize: 26, fontWeight: '700', color }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>{unit}</Text>
    </Card>
  );
}

export function formatCo2(value: number | null): string {
  if (value === null || value === undefined) return '—';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + ' t';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + ' kg';
  return value.toFixed(0) + ' kg';
}
