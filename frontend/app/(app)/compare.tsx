import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSitesStore, Site } from '@/stores/sitesStore';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { formatCo2 } from '@/components/carbon/KpiCard';
import { SitesComparisonChart } from '@/components/carbon/SitesComparisonChart';
import { ComparativeTimelineChart } from '@/components/carbon/ComparativeTimelineChart';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { exportSitesCsv } from '@/services/exportService';

export default function CompareScreen() {
  const router = useRouter();
  const { sites, isLoading, fetchSites } = useSitesStore();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  useEffect(() => {
    fetchSites();
  }, []);

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const selected = sites.filter((s) => selectedIds.includes(s.id));

  const kpiDelta = (a: number | null, b: number | null) => {
    if (a === null || b === null || b === 0) return null;
    return ((a - b) / b) * 100;
  };

  const wrap = isDesktop
    ? { maxWidth: 1100, width: '100%' as any, alignSelf: 'center' as any, paddingHorizontal: 24 }
    : {};

  const siteSelector = (
    <>
      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12, letterSpacing: 1 }}>
        SITES DISPONIBLES
      </Text>
      <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 12 }}>
        Sélectionnez 2 à 4 sites
      </Text>
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : sites.length === 0 ? (
        <Card>
          <Text style={{ color: Colors.textSecondary, textAlign: 'center', paddingVertical: 20 }}>
            Aucun site à comparer. Créez d'abord des sites depuis le dashboard.
          </Text>
        </Card>
      ) : (
        sites.map((site) => {
          const isSelected = selectedIds.includes(site.id);
          return (
            <TouchableOpacity key={site.id} onPress={() => toggle(site.id)} activeOpacity={0.75}>
              <Card
                style={{
                  marginBottom: 8,
                  borderWidth: 2,
                  borderColor: isSelected ? Colors.primary : Colors.border,
                  backgroundColor: isSelected ? Colors.primaryUltraLight : Colors.white,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: isSelected ? Colors.primary : Colors.border,
                      backgroundColor: isSelected ? Colors.primary : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {isSelected && <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '700' }}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: Colors.textPrimary, fontSize: 14 }}>{site.name}</Text>
                    {site.location && (
                      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>📍 {site.location}</Text>
                    )}
                  </View>
                  {site.co2Total !== null && (
                    <Text style={{ fontWeight: '700', color: Colors.primary, fontSize: 13 }}>
                      {formatCo2(site.co2Total)}
                    </Text>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          );
        })
      )}
    </>
  );

  const comparisonContent = selected.length >= 2 ? (
    <>
      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12, letterSpacing: 1 }}>
        COMPARAISON — {selected.length} SITES
      </Text>

      {/* Bar chart */}
      <Card style={{ marginBottom: 16 }}>
        <SitesComparisonChart sites={selected} />
      </Card>

      {/* Comparative timeline */}
      {selected.some((s) => s.constructionYear != null) && (
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4, letterSpacing: 1 }}>
            CO₂ CUMULÉ SUR LA DURÉE DE VIE
          </Text>
          <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 12 }}>
            Quel bâtiment consomme le plus au fil du temps ?
          </Text>
          <ComparativeTimelineChart sites={selected} />
        </Card>
      )}

      {/* KPI table */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12, letterSpacing: 1 }}>
          INDICATEURS CLÉS
        </Text>

        <View style={{ flexDirection: 'row', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: Colors.border }}>
          <Text style={{ flex: 1.4, fontSize: 12, color: Colors.textSecondary }}>Indicateur</Text>
          {selected.map((s) => (
            <Text key={s.id} style={{ flex: 1, fontSize: 12, fontWeight: '700', color: Colors.primary, textAlign: 'right' }} numberOfLines={1}>
              {s.name.length > 10 ? s.name.substring(0, 10) + '.' : s.name}
            </Text>
          ))}
        </View>

        {[
          { label: 'CO₂ Total', getValue: (s: Site) => formatCo2(s.co2Total), getNum: (s: Site) => s.co2Total },
          { label: 'CO₂/m²', getValue: (s: Site) => s.co2PerM2 !== null ? `${(s.co2PerM2 ?? 0).toFixed(1)} kg` : '—', getNum: (s: Site) => s.co2PerM2 },
          { label: 'CO₂/pers.', getValue: (s: Site) => formatCo2(s.co2PerEmployee), getNum: (s: Site) => s.co2PerEmployee },
          { label: 'Construction', getValue: (s: Site) => formatCo2(s.co2Construction), getNum: (s: Site) => s.co2Construction },
          { label: 'Exploitation', getValue: (s: Site) => formatCo2(s.co2Exploitation), getNum: (s: Site) => s.co2Exploitation },
          { label: 'Surface', getValue: (s: Site) => `${s.totalAreaM2.toLocaleString()} m²`, getNum: (s: Site) => s.totalAreaM2 },
          { label: 'Employés', getValue: (s: Site) => String(s.employeeCount), getNum: (s: Site) => s.employeeCount },
        ].map((row, i) => {
          const baseline = row.getNum(selected[0]);
          return (
            <View
              key={row.label}
              style={{
                flexDirection: 'row',
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
                backgroundColor: i % 2 === 0 ? Colors.background : Colors.white,
                borderRadius: 4,
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ flex: 1.4, fontSize: 12, color: Colors.textSecondary }}>{row.label}</Text>
              {selected.map((s, idx) => {
                const delta = idx > 0 ? kpiDelta(row.getNum(s), baseline) : null;
                const isWorse = delta !== null && delta > 0;
                const isBetter = delta !== null && delta < 0;
                return (
                  <View key={s.id} style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.textPrimary }}>
                      {row.getValue(s)}
                    </Text>
                    {delta !== null && (
                      <Text style={{ fontSize: 10, color: isWorse ? Colors.danger : isBetter ? Colors.success : Colors.textSecondary }}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(0)}%
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        {(() => {
          const SCOPE1_CODES = ['GAS_NATURAL', 'GAS_PROPANE', 'BIOMETHANE'];
          return (
            <View style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 4, backgroundColor: Colors.background, borderRadius: 4 }}>
              <Text style={{ flex: 1.4, fontSize: 12, color: Colors.textSecondary }}>Mix énergie</Text>
              {selected.map((s) => {
                const isScope1 = SCOPE1_CODES.includes(s.energyFactorCode);
                const label = s.energyLabel ?? s.energyFactorCode;
                const shortLabel = label.replace('Électricité ', '').replace('Gaz ', '');
                return (
                  <View key={s.id} style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textPrimary, textAlign: 'right' }} numberOfLines={2}>
                      {shortLabel}
                    </Text>
                    {isScope1 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 }}>
                        <Text style={{ fontSize: 10 }}>⚠️</Text>
                        <Text style={{ fontSize: 10, color: Colors.carbonHigh, fontWeight: '600' }}>Scope 1</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })()}
      </Card>

      {/* Export CSV */}
      <TouchableOpacity
        onPress={() => exportSitesCsv(selected, 'comparaison_sites.csv')}
        style={{
          backgroundColor: Colors.primary,
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 14 }}>
          📊 Exporter la comparaison (CSV)
        </Text>
      </TouchableOpacity>

      {/* Links */}
      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, letterSpacing: 1 }}>
        DÉTAILS
      </Text>
      {selected.map((s) => (
        <TouchableOpacity key={s.id} onPress={() => router.push(`/(app)/sites/${s.id}`)}>
          <Card style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '600', color: Colors.primary, fontSize: 14 }}>{s.name}</Text>
            <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Voir le détail →</Text>
          </Card>
        </TouchableOpacity>
      ))}
    </>
  ) : null;

  const emptyHint = selected.length === 1 ? (
    <View style={{ alignItems: 'center', marginTop: 24 }}>
      <Text style={{ color: Colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
        Sélectionnez au moins un autre site pour comparer.
      </Text>
    </View>
  ) : selected.length === 0 ? (
    <View style={{ alignItems: 'center', marginTop: 48, paddingHorizontal: 24 }}>
      <Text style={{ fontSize: 36, marginBottom: 12 }}>📊</Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' }}>
        Sélectionnez des sites
      </Text>
      <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
        Choisissez 2 à 4 sites dans la liste pour les comparer.
      </Text>
    </View>
  ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Mobile header */}
      {!isDesktop && (
        <View style={{ backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.white }}>Comparer les sites</Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>
            Sélectionnez 2 à 4 sites à comparer
          </Text>
        </View>
      )}

      {/* Desktop page title bar */}
      {isDesktop && (
        <View style={{ borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white }}>
          <View style={[wrap, { paddingVertical: 20 }]}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}>Comparer les sites</Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
              Analysez et comparez jusqu'à 4 sites simultanément
            </Text>
          </View>
        </View>
      )}

      {/* Desktop: fixed 2-col row | Mobile: single scroll */}
      {isDesktop ? (
        <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden' as any }}>
          {/* Left panel: site selector */}
          <View style={{ width: 320, borderRightWidth: 1, borderRightColor: Colors.border, backgroundColor: Colors.white }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
              {siteSelector}
            </ScrollView>
          </View>
          {/* Right panel: comparison */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
            <View style={{ maxWidth: 800, width: '100%' as any }}>
              {comparisonContent ?? emptyHint}
            </View>
          </ScrollView>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
          {siteSelector}
          {selected.length >= 2 && (
            <View style={{ marginTop: 24 }}>
              {comparisonContent}
            </View>
          )}
          {emptyHint}
        </ScrollView>
      )}

      {!isDesktop && <BottomTabBar />}
    </View>
  );
}
