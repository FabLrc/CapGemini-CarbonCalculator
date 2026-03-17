import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useSitesStore } from '@/stores/sitesStore';
import { Card } from '@/components/ui/Card';
import { KpiCard, formatCo2 } from '@/components/carbon/KpiCard';
import { EmissionPieChart } from '@/components/carbon/EmissionPieChart';
import { MaterialsBarChart } from '@/components/carbon/MaterialsBarChart';
import { Colors } from '@/constants/colors';
import { generateSiteReport } from '@/utils/pdfReport';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { exportSitesCsv } from '@/services/exportService';
import { SiteDetailSkeleton } from '@/components/ui/Skeleton';
import { useTemplatesStore } from '@/stores/templatesStore';
import { SimulationPanel } from '@/components/carbon/SimulationPanel';
import { EvolutionChart } from '@/components/carbon/EvolutionChart';
import { SiteTimelineChart } from '@/components/carbon/SiteTimelineChart';
import { sitesApi, SiteSnapshot } from '@/services/api';

export default function SiteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentSite, fetchSite, deleteSite, isLoading } = useSitesStore();
  const [exportingPdf, setExportingPdf] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);
  const [snapshots, setSnapshots] = useState<SiteSnapshot[]>([]);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const { saveTemplate } = useTemplatesStore();

  const handleSaveTemplate = () => {
    if (!currentSite) return;
    const name = Platform.OS === 'web'
      ? window.prompt(`Nom du modèle basé sur "${currentSite.name}" :`, currentSite.name)
      : currentSite.name;
    if (!name) return;
    saveTemplate({
      name,
      energyFactorCode: currentSite.energyFactorCode,
      materials: currentSite.materials.map((m) => ({
        emissionFactorCode: m.factorCode,
        factorLabel: m.factorLabel,
        quantity: String((m.quantityKg / 1000).toFixed(3).replace(/\.?0+$/, '')),
        unit: 't',
      })),
    });
    if (Platform.OS === 'web') {
      window.alert(`Modèle "${name}" enregistré.`);
    } else {
      Alert.alert('Modèle enregistré', `"${name}" est disponible lors de la création d'un nouveau site.`);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSite(Number(id));
      sitesApi.snapshots(Number(id)).then(({ data }) => setSnapshots(data)).catch(() => {});
    }
  }, [id]);

  if (isLoading || !currentSite) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={{ backgroundColor: Colors.primary, paddingTop: isDesktop ? 24 : 52, paddingBottom: 16, paddingHorizontal: 16 }}>
          {!isDesktop && <View style={{ width: 60, height: 14, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: 12 }} />}
          <View style={{ width: '60%', height: 22, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: 8 }} />
          <View style={{ width: '35%', height: 14, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
        </View>
        <SiteDetailSkeleton />
      </View>
    );
  }

  const site = currentSite;
  const co2Total = site.co2Total ?? 0;
  const constructionPct = co2Total > 0 ? ((site.co2Construction ?? 0) / co2Total * 100).toFixed(0) : '—';
  const exploitationPct = co2Total > 0 ? ((site.co2Exploitation ?? 0) / co2Total * 100).toFixed(0) : '—';

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const html = generateSiteReport(site);
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDelete = async () => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Supprimer "${site.name}" ? Cette action est irréversible.`)) return;
      try {
        await deleteSite(Number(id));
        router.replace('/');
      } catch (e: any) {
        window.alert(`Erreur : ${e.message}`);
      }
      return;
    }
    Alert.alert(
      'Supprimer le site',
      `Êtes-vous sûr de vouloir supprimer "${site.name}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSite(Number(id));
              router.replace('/');
            } catch (e: any) {
              Alert.alert('Erreur', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ paddingBottom: isDesktop ? 40 : 80 }}>
      {/* Header */}
      <View style={{ backgroundColor: Colors.primary, paddingTop: isDesktop ? 24 : 52, paddingBottom: 16, paddingHorizontal: 16 }}>
        {!isDesktop && (
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>← Retour</Text>
          </TouchableOpacity>
        )}
        {/* Titre + localisation */}
        <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.white }}>{site.name}</Text>
        {site.location && (
          <Text style={{ color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>📍 {site.location}</Text>
        )}
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4, marginBottom: 12 }}>
          {site.organizationName}
        </Text>

        {/* Action buttons — ligne dédiée */}
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <TouchableOpacity
              onPress={() => router.push(`/(app)/sites/edit/${id}`)}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
            >
              <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '600' }}>✏️ Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleExportPdf}
              disabled={exportingPdf}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, opacity: exportingPdf ? 0.6 : 1 }}
            >
              <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '600' }}>
                {exportingPdf ? '...' : '📄 PDF'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => exportSitesCsv([site], `${site.name.replace(/\s+/g, '_')}.csv`)}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
            >
              <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '600' }}>📊 CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveTemplate}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
            >
              <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '600' }}>📋 Modèle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSimulationMode((v) => !v)}
              style={{
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
                backgroundColor: simulationMode ? Colors.white : 'rgba(255,255,255,0.2)',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: simulationMode ? Colors.secondary : Colors.white }}>
                🧪 Simuler
              </Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Simulation panel */}
      {simulationMode && (
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <SimulationPanel site={site} onClose={() => setSimulationMode(false)} />
        </View>
      )}

      {/* Desktop 2-col / Mobile 1-col */}
      {isDesktop ? (
        <View style={{ flexDirection: 'row', padding: 24, maxWidth: 1100, alignSelf: 'center' as any, width: '100%' as any }}>
          {/* Left: KPIs + Pie + Evolution */}
          <View style={{ flex: 3, paddingRight: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12, letterSpacing: 1 }}>
              INDICATEURS CO₂
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -6, marginBottom: 16 }}>
              <KpiCard label="CO₂ Total" value={formatCo2(site.co2Total)} unit="kgCO₂e" icon="🌍" color={Colors.primary} />
              <KpiCard label="CO₂ / m²" value={site.co2PerM2 !== null ? (site.co2PerM2 ?? 0).toFixed(1) : '—'} unit="kgCO₂e/m²" icon="📐" />
              <KpiCard label="CO₂ / employé" value={formatCo2(site.co2PerEmployee)} unit="kgCO₂e/pers." icon="👤" />
            </View>
            {site.co2Construction !== null && site.co2Exploitation !== null && (
              <Card style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12, letterSpacing: 1 }}>RÉPARTITION CO₂</Text>
                <EmissionPieChart co2Construction={site.co2Construction} co2Exploitation={site.co2Exploitation} />
              </Card>
            )}
            {snapshots.length > 0 && (
              <Card style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12, letterSpacing: 1 }}>ÉVOLUTION</Text>
                <EvolutionChart snapshots={snapshots} />
              </Card>
            )}
            {site.constructionYear != null && (
              <Card style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4, letterSpacing: 1 }}>CONSOMMATION SUR LA DURÉE DE VIE</Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 12 }}>
                  CO₂ annuel depuis {site.constructionYear} · courbe cumulée (orange)
                </Text>
                <SiteTimelineChart site={site} />
              </Card>
            )}
          </View>
          {/* Right: Bars + Data + Materials */}
          <View style={{ flex: 2 }}>
            <Card style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 16, letterSpacing: 1 }}>DÉTAIL</Text>
              {[
                { label: '🏗️ Construction', pct: constructionPct, color: Colors.primary, val: site.co2Construction },
                { label: '⚡ Exploitation (annuel)', pct: exploitationPct, color: Colors.secondary, val: site.co2Exploitation },
              ].map((row) => (
                <View key={row.label} style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>{row.label}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: row.color }}>
                      {formatCo2(row.val)} <Text style={{ fontSize: 12, color: Colors.textSecondary }}>({row.pct}%)</Text>
                    </Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: Colors.border, borderRadius: 4 }}>
                    <View style={{ height: 8, width: `${row.pct}%` as any, backgroundColor: row.color, borderRadius: 4 }} />
                  </View>
                </View>
              ))}
            </Card>
            <Card style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 16, letterSpacing: 1 }}>DONNÉES DU SITE</Text>
              {[
                { label: 'Surface totale', value: `${site.totalAreaM2.toLocaleString()} m²` },
                { label: 'Places de parking', value: String(site.parkingSpaces) },
                { label: 'Employés', value: String(site.employeeCount) },
                { label: 'Énergie annuelle', value: `${site.annualEnergyKwh.toLocaleString()} kWh` },
                { label: 'Mix énergétique', value: site.energyLabel ?? site.energyFactorCode },
                ...(site.constructionYear ? [{ label: 'Année de construction', value: String(site.constructionYear) }] : []),
              ].map((row) => (
                <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
                  <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>{row.label}</Text>
                  <Text style={{ color: Colors.textPrimary, fontWeight: '600', fontSize: 14 }}>{row.value}</Text>
                </View>
              ))}
            </Card>
            {site.materials && site.materials.length > 0 && (
              <Card style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 16, letterSpacing: 1 }}>MATÉRIAUX</Text>
                <MaterialsBarChart materials={site.materials} />
                {site.materials.map((m) => (
                  <View key={m.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
                    <View>
                      <Text style={{ fontWeight: '600', color: Colors.textPrimary, fontSize: 14 }}>{m.factorLabel}</Text>
                      <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>{(m.quantityKg / 1000).toFixed(1)} t</Text>
                    </View>
                    <Text style={{ fontWeight: '700', color: Colors.primary, fontSize: 14 }}>{formatCo2(m.co2Kg)}</Text>
                  </View>
                ))}
              </Card>
            )}
            {(site.createdByName || site.createdAt) && (
              <View style={{ marginTop: 8, alignItems: 'center' }}>
                {site.createdByName && <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Créé par {site.createdByName}</Text>}
                {site.createdAt && (
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
                    {new Date(site.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {site.updatedAt && site.updatedAt !== site.createdAt ? ` · mis à jour ${new Date(site.updatedAt).toLocaleDateString('fr-FR')}` : ''}
                  </Text>
                )}
              </View>
            )}
            <TouchableOpacity onPress={handleDelete} style={{ marginTop: 20, alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ color: Colors.danger, fontSize: 14 }}>🗑️ Supprimer ce site</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12, letterSpacing: 1 }}>
            INDICATEURS CO₂
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -6, marginBottom: 20 }}>
            <KpiCard label="CO₂ Total" value={formatCo2(site.co2Total)} unit="kgCO₂e" icon="🌍" color={Colors.primary} />
            <KpiCard label="CO₂ / m²" value={site.co2PerM2 !== null ? (site.co2PerM2 ?? 0).toFixed(1) : '—'} unit="kgCO₂e/m²" icon="📐" />
            <KpiCard label="CO₂ / employé" value={formatCo2(site.co2PerEmployee)} unit="kgCO₂e/pers." icon="👤" />
          </View>
          {site.co2Construction !== null && site.co2Exploitation !== null && (
            <Card style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12, letterSpacing: 1 }}>RÉPARTITION CO₂</Text>
              <EmissionPieChart co2Construction={site.co2Construction} co2Exploitation={site.co2Exploitation} />
            </Card>
          )}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 16, letterSpacing: 1 }}>DÉTAIL</Text>
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>🏗️ Construction</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.primary }}>{formatCo2(site.co2Construction)} <Text style={{ fontSize: 12, color: Colors.textSecondary }}>({constructionPct}%)</Text></Text>
              </View>
              <View style={{ height: 8, backgroundColor: Colors.border, borderRadius: 4 }}>
                <View style={{ height: 8, width: `${constructionPct}%` as any, backgroundColor: Colors.primary, borderRadius: 4 }} />
              </View>
            </View>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>⚡ Exploitation (annuel)</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.secondary }}>{formatCo2(site.co2Exploitation)} <Text style={{ fontSize: 12, color: Colors.textSecondary }}>({exploitationPct}%)</Text></Text>
              </View>
              <View style={{ height: 8, backgroundColor: Colors.border, borderRadius: 4 }}>
                <View style={{ height: 8, width: `${exploitationPct}%` as any, backgroundColor: Colors.secondary, borderRadius: 4 }} />
              </View>
            </View>
          </Card>
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 16, letterSpacing: 1 }}>DONNÉES DU SITE</Text>
            {[
              { label: 'Surface totale', value: `${site.totalAreaM2.toLocaleString()} m²` },
              { label: 'Places de parking', value: String(site.parkingSpaces) },
              { label: 'Employés', value: String(site.employeeCount) },
              { label: 'Énergie annuelle', value: `${site.annualEnergyKwh.toLocaleString()} kWh` },
              { label: 'Mix énergétique', value: site.energyLabel ?? site.energyFactorCode },
              ...(site.constructionYear ? [{ label: 'Année de construction', value: String(site.constructionYear) }] : []),
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>{row.label}</Text>
                <Text style={{ color: Colors.textPrimary, fontWeight: '600', fontSize: 14 }}>{row.value}</Text>
              </View>
            ))}
          </Card>
          {snapshots.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12, letterSpacing: 1 }}>ÉVOLUTION</Text>
              <EvolutionChart snapshots={snapshots} />
            </Card>
          )}
          {site.constructionYear != null && (
            <Card style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4, letterSpacing: 1 }}>CONSOMMATION SUR LA DURÉE DE VIE</Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 12 }}>
                CO₂ annuel depuis {site.constructionYear} · courbe cumulée (orange)
              </Text>
              <SiteTimelineChart site={site} />
            </Card>
          )}
          {site.materials && site.materials.length > 0 && (
            <Card>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 16, letterSpacing: 1 }}>MATÉRIAUX</Text>
              <MaterialsBarChart materials={site.materials} />
              {site.materials.map((m) => (
                <View key={m.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
                  <View>
                    <Text style={{ fontWeight: '600', color: Colors.textPrimary, fontSize: 14 }}>{m.factorLabel}</Text>
                    <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>{(m.quantityKg / 1000).toFixed(1)} t</Text>
                  </View>
                  <Text style={{ fontWeight: '700', color: Colors.primary, fontSize: 14 }}>{formatCo2(m.co2Kg)}</Text>
                </View>
              ))}
            </Card>
          )}
          {(site.createdByName || site.createdAt) && (
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              {site.createdByName && <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Créé par {site.createdByName}</Text>}
              {site.createdAt && (
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
                  {new Date(site.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {site.updatedAt && site.updatedAt !== site.createdAt ? ` · mis à jour ${new Date(site.updatedAt).toLocaleDateString('fr-FR')}` : ''}
                </Text>
              )}
            </View>
          )}
          <TouchableOpacity onPress={handleDelete} style={{ marginTop: 24, alignItems: 'center', paddingVertical: 12 }}>
            <Text style={{ color: Colors.danger, fontSize: 14 }}>🗑️ Supprimer ce site</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
    {!isDesktop && <BottomTabBar />}
    </View>
  );
}
