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
import { Colors } from '@/constants/colors';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { formatCo2 } from '@/components/carbon/KpiCard';
import { geocodeAddress, GeoCoords } from '@/services/geocodingService';

type SiteWithCoords = Site & { coords: GeoCoords | null };

export default function MapScreen() {
  const router = useRouter();
  const { sites, isLoading, fetchSites } = useSitesStore();
  const [sitesWithCoords, setSitesWithCoords] = useState<SiteWithCoords[]>([]);
  const [geocoding, setGeocoding] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (sites.length === 0) return;
    setGeocoding(true);
    setSitesWithCoords([]);

    let cancelled = false;
    (async () => {
      const result: SiteWithCoords[] = [];
      for (const s of sites) {
        if (cancelled) break;
        const coords = s.location ? await geocodeAddress(s.location) : null;
        result.push({ ...s, coords });
        // Update state progressively so the map renders as addresses resolve
        if (!cancelled) setSitesWithCoords([...result]);
      }
      if (!cancelled) setGeocoding(false);
    })();

    return () => { cancelled = true; };
  }, [sites]);

  // Performance colour matching dashboard logic
  const sitesWithCo2 = sites.filter((s) => s.co2PerM2 !== null);
  const avgCo2PerM2 =
    sitesWithCo2.length >= 2
      ? sitesWithCo2.reduce((sum, s) => sum + (s.co2PerM2 ?? 0), 0) / sitesWithCo2.length
      : null;

  const getPerfColor = (site: Site): string => {
    if (!avgCo2PerM2 || site.co2PerM2 === null) return '#0070AD';
    const ratio = (site.co2PerM2 ?? 0) / avgCo2PerM2;
    if (ratio <= 0.85) return Colors.carbonLow;
    if (ratio <= 1.15) return Colors.carbonMedium;
    return Colors.carbonHigh;
  };

  const buildLeafletHtml = () => {
    const mapped = sitesWithCoords.filter((s) => s.coords !== null);
    const markers = mapped
      .map((s) => {
        const color = getPerfColor(s);
        const popup = `<b>${s.name}</b><br/>${s.location ?? ''}<br/>CO₂: ${formatCo2(s.co2Total)}<br/><a href="/(app)/sites/${s.id}">Voir le détail</a>`;
        return `
          L.circleMarker([${s.coords!.lat}, ${s.coords!.lng}], {
            radius: 12,
            color: '${color}',
            fillColor: '${color}',
            fillOpacity: 0.85,
            weight: 2,
          }).bindPopup(\`${popup.replace(/`/g, "'")}\`).addTo(map);
        `;
      })
      .join('\n');

    // Center on first geocoded site or France
    const center =
      mapped.length > 0
        ? `[${mapped[0].coords!.lat}, ${mapped[0].coords!.lng}]`
        : '[46.8, 2.3]';
    const zoom = mapped.length > 0 ? 6 : 5;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
    .leaflet-popup-content a { color: #0070AD; font-weight: 600; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map').setView(${center}, ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    ${markers}
  </script>
</body>
</html>`;
  };

  const sitesWithLocation = sitesWithCoords.filter((s) => s.coords !== null);
  const sitesWithoutLocation = sites.filter((s) => !s.location);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={{ paddingBottom: isDesktop ? 40 : 80 }}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: Colors.primary,
            paddingTop: isDesktop ? 24 : 52,
            paddingBottom: 20,
            paddingHorizontal: 16,
          }}
        >
          {!isDesktop && (
            <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>← Retour</Text>
            </TouchableOpacity>
          )}
          <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.white }}>
            Carte des sites
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>
            {sitesWithLocation.length} site{sitesWithLocation.length !== 1 ? 's' : ''} géolocalisé{sitesWithLocation.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {(isLoading || geocoding) && sites.length === 0 ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        ) : Platform.OS !== 'web' ? (
          /* Mobile fallback — list view */
          <View style={{ padding: 16 }}>
            <View style={{ backgroundColor: '#FFF3CD', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Text style={{ fontSize: 13, color: '#856404' }}>
                🗺️ La carte interactive est disponible uniquement sur la version web.
              </Text>
            </View>
            {sites.map((s) => (
              <TouchableOpacity key={s.id} onPress={() => router.push(`/(app)/sites/${s.id}`)}>
                <View
                  style={{
                    backgroundColor: Colors.white,
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: getPerfColor(s),
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontWeight: '700', fontSize: 15, color: Colors.textPrimary }}>{s.name}</Text>
                  {s.location && (
                    <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>📍 {s.location}</Text>
                  )}
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primary, marginTop: 4 }}>
                    {formatCo2(s.co2Total)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={{ padding: 16 }}>
            {/* Legend */}
            {avgCo2PerM2 !== null && (
              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
                {[
                  { color: Colors.carbonLow, label: 'Efficace (−15%)' },
                  { color: Colors.carbonMedium, label: 'Moyen' },
                  { color: Colors.carbonHigh, label: 'Élevé (+15%)' },
                ].map((d) => (
                  <View key={d.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: d.color }} />
                    <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{d.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {geocoding && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Géolocalisation en cours...</Text>
              </View>
            )}

            {/* Leaflet map iframe — only render once geocoding is done to avoid Leaflet reloads */}
            {!geocoding && sitesWithCoords.length > 0 && (
              <View
                style={{
                  height: 420,
                  borderRadius: 12,
                  overflow: 'hidden',
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <iframe
                  srcDoc={buildLeafletHtml()}
                  style={{ width: '100%', height: '100%', border: 'none' } as any}
                  title="Carte des sites"
                />
              </View>
            )}

            {/* Sites without location */}
            {sitesWithoutLocation.length > 0 && (
              <View style={{ backgroundColor: '#FFF3CD', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <Text style={{ fontSize: 13, color: '#856404', fontWeight: '600', marginBottom: 4 }}>
                  Sites sans localisation ({sitesWithoutLocation.length})
                </Text>
                {sitesWithoutLocation.map((s) => (
                  <Text key={s.id} style={{ fontSize: 12, color: '#856404' }}>
                    • {s.name}
                  </Text>
                ))}
              </View>
            )}

            {/* Site list below map */}
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, letterSpacing: 1 }}>
              SITES
            </Text>
            {sites.map((s) => (
              <TouchableOpacity key={s.id} onPress={() => router.push(`/(app)/sites/${s.id}`)}>
                <View
                  style={{
                    backgroundColor: Colors.white,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    borderLeftWidth: 4,
                    borderLeftColor: getPerfColor(s),
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14, color: Colors.textPrimary }}>{s.name}</Text>
                    {s.location && (
                      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>📍 {s.location}</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primary }}>
                    {formatCo2(s.co2Total)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      {!isDesktop && <BottomTabBar />}
    </View>
  );
}
