import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Site } from '@/stores/sitesStore';
import { EmissionFactor, emissionFactorsApi } from '@/services/api';
import { formatCo2 } from '@/components/carbon/KpiCard';
import { SiteTimelineChart } from '@/components/carbon/SiteTimelineChart';

interface SimulationPanelProps {
  site: Site;
  onClose: () => void;
}

export function SimulationPanel({ site, onClose }: SimulationPanelProps) {
  const [energyFactors, setEnergyFactors] = useState<EmissionFactor[]>([]);
  const [simEnergyCode, setSimEnergyCode] = useState(site.energyFactorCode);
  const [simEnergyKwh, setSimEnergyKwh] = useState(String(site.annualEnergyKwh));

  useEffect(() => {
    emissionFactorsApi.list().then(({ data }) => {
      setEnergyFactors(data.filter((f: EmissionFactor) => f.category === 'ENERGY'));
    });
  }, []);

  // Recalcul client-side de CO₂ exploitation
  const selectedFactor = energyFactors.find((f) => f.code === simEnergyCode);
  const simCo2Exploitation = selectedFactor
    ? parseFloat(simEnergyKwh || '0') * selectedFactor.kgCo2ePerUnit
    : null;

  const realCo2Exploitation = site.co2Exploitation ?? 0;
  const simCo2Total = simCo2Exploitation !== null
    ? (site.co2Construction ?? 0) + simCo2Exploitation
    : null;

  const deltaExploitation = simCo2Exploitation !== null
    ? simCo2Exploitation - realCo2Exploitation
    : null;
  const deltaCo2Total = simCo2Total !== null
    ? simCo2Total - (site.co2Total ?? 0)
    : null;

  const pctDelta = (delta: number | null, base: number) => {
    if (delta === null || base === 0) return null;
    return (delta / base) * 100;
  };

  const renderDelta = (delta: number | null, base: number) => {
    const pct = pctDelta(delta, base);
    if (pct === null) return null;
    const isPositive = pct > 0;
    const color = isPositive ? Colors.carbonHigh : Colors.carbonLow;
    return (
      <Text style={{ fontSize: 12, fontWeight: '600', color }}>
        {isPositive ? '+' : ''}{pct.toFixed(1)}%
      </Text>
    );
  };

  return (
    <Card style={{ marginBottom: 16, borderWidth: 2, borderColor: Colors.secondary }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary }} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.secondary, letterSpacing: 1 }}>
            MODE SIMULATION
          </Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ fontSize: 18, color: Colors.textSecondary }}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 16 }}>
        Modifiez les paramètres ci-dessous pour voir l'impact sans sauvegarder.
      </Text>

      {/* Mix énergétique */}
      <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 }}>
        Mix énergétique simulé
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {energyFactors.map((f) => (
            <TouchableOpacity
              key={f.code}
              onPress={() => setSimEnergyCode(f.code)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: simEnergyCode === f.code ? Colors.secondary : Colors.border,
                backgroundColor: simEnergyCode === f.code ? '#E8F7FB' : Colors.white,
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: simEnergyCode === f.code ? '700' : '400',
                color: simEnergyCode === f.code ? Colors.secondary : Colors.textSecondary,
              }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Consommation simulée */}
      <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 }}>
        Consommation annuelle simulée (kWh)
      </Text>
      <TextInput
        value={simEnergyKwh}
        onChangeText={setSimEnergyKwh}
        keyboardType="numeric"
        style={{
          borderWidth: 1.5,
          borderColor: Colors.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 15,
          color: Colors.textPrimary,
          backgroundColor: Colors.white,
          marginBottom: 16,
        }}
        placeholder={String(site.annualEnergyKwh)}
      />

      {/* Résultats simulation */}
      <View style={{ backgroundColor: Colors.background, borderRadius: 10, padding: 14 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 12 }}>
          RÉSULTAT SIMULÉ
        </Text>

        {[
          {
            label: '⚡ CO₂ Exploitation',
            real: realCo2Exploitation,
            sim: simCo2Exploitation,
            delta: deltaExploitation,
          },
          {
            label: '🌍 CO₂ Total',
            real: site.co2Total ?? 0,
            sim: simCo2Total,
            delta: deltaCo2Total,
          },
        ].map((row) => (
          <View
            key={row.label}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <Text style={{ fontSize: 13, color: Colors.textSecondary, flex: 1 }}>{row.label}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.secondary }}>
                {row.sim !== null ? formatCo2(row.sim) : '—'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                  Réel : {formatCo2(row.real)}
                </Text>
                {renderDelta(row.delta, row.real)}
              </View>
            </View>
          </View>
        ))}

        {selectedFactor && (
          <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 10 }}>
            Facteur utilisé : {selectedFactor.kgCo2ePerUnit} kgCO₂e/kWh · {selectedFactor.label}
          </Text>
        )}
      </View>

      {/* Timeline projection */}
      {simCo2Exploitation !== null && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 4 }}>
            PROJECTION SUR LA DURÉE DE VIE
          </Text>
          <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 12 }}>
            {site.constructionYear
              ? `CO₂ cumulé depuis ${site.constructionYear} · trait plein = actuel · trait pointillé vert = rénové`
              : "Renseignez l\u2019ann\u00e9e de construction pour voir la projection compl\u00e8te"}
          </Text>
          <SiteTimelineChart
            site={site}
            simCo2Exploitation={simCo2Exploitation}
            showSimulation
          />
          {simCo2Exploitation < realCo2Exploitation && (
            <View style={{ backgroundColor: '#DCFCE7', borderRadius: 8, padding: 10, marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: Colors.carbonLow, fontWeight: '600' }}>
                💚 Économie cumulée sur 20 ans :{' '}
                {formatCo2((realCo2Exploitation - simCo2Exploitation) * 20)} kgCO₂e
              </Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}
