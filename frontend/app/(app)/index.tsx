import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useSitesStore, Site } from '@/stores/sitesStore';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { formatCo2 } from '@/components/carbon/KpiCard';
import { SitesComparisonChart } from '@/components/carbon/SitesComparisonChart';
import { PortfolioTimelineChart } from '@/components/carbon/PortfolioTimelineChart';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { SiteCardSkeleton, StatsBannerSkeleton } from '@/components/ui/Skeleton';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { sites, isLoading, fetchSites } = useSitesStore();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  useEffect(() => {
    fetchSites();
  }, []);

  // Performance indicator: compare co2PerM2 vs portfolio average
  const sitesWithCo2 = sites.filter((s) => s.co2PerM2 !== null);
  const avgCo2PerM2 =
    sitesWithCo2.length >= 2
      ? sitesWithCo2.reduce((sum, s) => sum + (s.co2PerM2 ?? 0), 0) / sitesWithCo2.length
      : null;

  const totalCo2 = sites.reduce((s, x) => s + (x.co2Total ?? 0), 0);

  const getPerfColor = (site: Site): string | null => {
    if (!avgCo2PerM2 || site.co2PerM2 === null) return null;
    const ratio = (site.co2PerM2 ?? 0) / avgCo2PerM2;
    if (ratio <= 0.85) return Colors.carbonLow;
    if (ratio <= 1.15) return Colors.carbonMedium;
    return Colors.carbonHigh;
  };

  const renderSiteCard = (item: Site) => {
    const perfColor = getPerfColor(item);
    return (
      <TouchableOpacity key={item.id} onPress={() => router.push(`/(app)/sites/${item.id}`)} activeOpacity={0.75}>
        <Card
          style={{
            marginBottom: 12,
            borderLeftWidth: perfColor ? 4 : 0,
            borderLeftColor: perfColor ?? 'transparent',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 }}>
                {item.name}
              </Text>
              {item.location && (
                <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                  📍 {item.location}
                </Text>
              )}
              <Text style={{ fontSize: 12, color: Colors.textTertiary, marginTop: 4 }}>
                {item.totalAreaM2.toLocaleString()} m² · {item.employeeCount} employés
              </Text>
            </View>
            {item.co2Total !== null && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.primary }}>
                  {formatCo2(item.co2Total)}
                </Text>
                <Text style={{ fontSize: 10, color: Colors.textTertiary }}>CO₂e total</Text>
              </View>
            )}
          </View>
          {item.co2Total !== null && (
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: Colors.border,
                gap: 20,
              }}
            >
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                🏗️ <Text style={{ fontWeight: '600', color: Colors.textPrimary }}>{formatCo2(item.co2Construction)}</Text>
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                ⚡ <Text style={{ fontWeight: '600', color: Colors.textPrimary }}>{formatCo2(item.co2Exploitation)}</Text>
              </Text>
              {item.co2PerM2 !== null && (
                <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                  📐 <Text style={{ fontWeight: '600', color: Colors.textPrimary }}>{(item.co2PerM2 ?? 0).toFixed(0)} kg/m²</Text>
                </Text>
              )}
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const wrap = isDesktop
    ? { maxWidth: 1100, width: '100%' as any, alignSelf: 'center' as any, paddingHorizontal: 24 }
    : {};

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Mobile-only header */}
      {!isDesktop && (
        <View style={{ backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16 }}>
          <Image
            source={require('@/assets/Capgemini_Logo_Nom.png')}
            style={{ width: 130, height: 34, resizeMode: 'contain', tintColor: Colors.white, marginBottom: 4 }}
          />
          <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.white }}>Carbon Calculator</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>
            {user?.organizationName ?? 'Super Admin'}
          </Text>
        </View>
      )}

      {/* Desktop page title */}
      {isDesktop && (
        <View style={{ borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white }}>
          <View style={[wrap, { paddingVertical: 20 }]}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.textPrimary }}>Dashboard</Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
              {user?.organizationName ?? 'Super Admin'}
            </Text>
          </View>
        </View>
      )}

      {/* Content */}
      {isLoading && sites.length === 0 ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
          <StatsBannerSkeleton />
          <SiteCardSkeleton />
          <SiteCardSkeleton />
          <SiteCardSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: isDesktop ? 48 : 80 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchSites} tintColor={Colors.primary} />
          }
        >
          <View style={wrap}>
            {/* Stats banner */}
            {sites.length > 0 && (
              <View
                style={isDesktop ? {
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 0,
                  marginTop: 24,
                  marginBottom: 20,
                  backgroundColor: Colors.white,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  overflow: 'hidden',
                } : {
                  backgroundColor: Colors.primaryDark,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  gap: 24,
                }}
              >
                {[
                  { label: 'Sites', value: String(sites.length), icon: '🏢' },
                  { label: 'CO₂ total', value: formatCo2(totalCo2), icon: '🌍' },
                  ...(avgCo2PerM2 !== null ? [{ label: 'Moy. CO₂/m²', value: `${avgCo2PerM2.toFixed(0)} kg`, icon: '📐' }] : []),
                  { label: 'Employés couverts', value: sites.reduce((s, x) => s + x.employeeCount, 0).toLocaleString(), icon: '👥' },
                ].map((stat, i, arr) => (
                  isDesktop ? (
                    <View
                      key={stat.label}
                      style={{
                        flex: 1,
                        minWidth: 120,
                        padding: 20,
                        borderRightWidth: i < arr.length - 1 ? 1 : 0,
                        borderRightColor: Colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.primary }}>{stat.value}</Text>
                      <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 3 }}>{stat.icon} {stat.label}</Text>
                    </View>
                  ) : (
                    <Text key={stat.label} style={{ color: Colors.white, fontSize: 13 }}>
                      <Text style={{ fontWeight: '700' }}>{stat.value}</Text> {stat.label}
                    </Text>
                  )
                ))}
              </View>
            )}

            {/* Performance legend */}
            {avgCo2PerM2 !== null && (
              <View style={{
                flexDirection: 'row',
                gap: 16,
                paddingHorizontal: isDesktop ? 0 : 16,
                paddingTop: isDesktop ? 0 : 12,
                paddingBottom: 8,
              }}>
                {[
                  { color: Colors.carbonLow, label: 'Efficace (−15%)' },
                  { color: Colors.carbonMedium, label: 'Moyen' },
                  { color: Colors.carbonHigh, label: 'Élevé (+15%)' },
                ].map((d) => (
                  <View key={d.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color }} />
                    <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{d.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Comparison chart */}
            {sites.length >= 2 && (
              <Card style={{ marginBottom: isDesktop ? 20 : 8, marginHorizontal: isDesktop ? 0 : 16 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4, letterSpacing: 1 }}>
                  COMPARAISON DES SITES
                </Text>
                <SitesComparisonChart sites={sites} />
              </Card>
            )}

            {/* Timeline chart */}
            {sites.some((s) => s.constructionYear != null) && (
              <Card style={{ marginBottom: isDesktop ? 20 : 8, marginHorizontal: isDesktop ? 0 : 16 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4, letterSpacing: 1 }}>
                  ÉMISSIONS ANNUELLES DU PORTEFEUILLE
                </Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 12 }}>
                  Chaque année, chaque bâtiment en service contribue à l'exploitation · pic au premier an = coût de construction · courbe orange = CO₂ cumulé total
                </Text>
                <PortfolioTimelineChart sites={sites} />
              </Card>
            )}

            {/* Site list */}
            {sites.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 32 }}>
                <Text style={{ fontSize: 44, marginBottom: 16 }}>🏢</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' }}>
                  Aucun site enregistré
                </Text>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                  Créez votre premier site pour calculer son empreinte carbone.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(app)/sites/new')}
                  style={{ marginTop: 24, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 8 }}
                >
                  <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 15 }}>+ Créer un site</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingHorizontal: isDesktop ? 0 : 16,
                paddingTop: 8,
              }}>
                {sites.map((item) => (
                  <View key={item.id} style={{ width: isDesktop ? '50%' : '100%', paddingRight: isDesktop && sites.indexOf(item) % 2 === 0 ? 8 : 0, paddingLeft: isDesktop && sites.indexOf(item) % 2 === 1 ? 8 : 0 }}>
                    {renderSiteCard(item)}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {isDesktop ? (
        <TouchableOpacity
          onPress={() => router.push('/(app)/sites/new')}
          style={{
            position: 'absolute', bottom: 28, right: 28,
            backgroundColor: Colors.primary, borderRadius: 28,
            width: 56, height: 56,
            justifyContent: 'center', alignItems: 'center',
            shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
          }}
        >
          <Text style={{ color: Colors.white, fontSize: 28, lineHeight: 32 }}>+</Text>
        </TouchableOpacity>
      ) : (
        <BottomTabBar />
      )}
    </View>
  );
}
