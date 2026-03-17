/**
 * Geocoding via Nominatim (OpenStreetMap) — no API key required.
 * Rate limit: 1 request/second.  Requests are serialised to respect this.
 * Common French locations are resolved instantly via a local lookup table.
 */

export type GeoCoords = { lat: number; lng: number };

// ── Local lookup — no network call required ────────────────────────────────
// Keys are lower-cased for case-insensitive matching.
const LOCAL_COORDS: Record<string, GeoCoords> = {
  // Demo site locations
  'puteaux, île-de-france':               { lat: 48.884, lng: 2.237 },
  'valbonne, alpes-maritimes':            { lat: 43.644, lng: 7.007 },
  'lyon, auvergne-rhône-alpes':           { lat: 45.748, lng: 4.847 },
  'mérignac, gironde':                    { lat: 44.838, lng: -0.644 },
  'marseille 13e, bouches-du-rhône':      { lat: 43.284, lng: 5.395 },
  'grenoble, isère':                      { lat: 45.188, lng: 5.724 },
  'nantes, loire-atlantique':             { lat: 47.218, lng: -1.554 },
  'blagnac, haute-garonne':               { lat: 43.636, lng: 1.389 },
  "villeneuve-d'ascq, nord":              { lat: 50.620, lng: 3.144 },
  'strasbourg, bas-rhin':                 { lat: 48.574, lng: 7.752 },
  // Common French cities
  'paris':                                { lat: 48.857, lng: 2.352 },
  'lyon':                                 { lat: 45.748, lng: 4.847 },
  'marseille':                            { lat: 43.296, lng: 5.381 },
  'toulouse':                             { lat: 43.605, lng: 1.444 },
  'bordeaux':                             { lat: 44.837, lng: -0.580 },
  'lille':                                { lat: 50.629, lng: 3.057 },
  'nice':                                 { lat: 43.710, lng: 7.262 },
  'nantes':                               { lat: 47.218, lng: -1.554 },
  'strasbourg':                           { lat: 48.574, lng: 7.752 },
  'montpellier':                          { lat: 43.611, lng: 3.877 },
  'rennes':                               { lat: 48.113, lng: -1.680 },
  'reims':                                { lat: 49.258, lng: 4.032 },
  'grenoble':                             { lat: 45.188, lng: 5.724 },
  'dijon':                                { lat: 47.322, lng: 5.041 },
  'metz':                                 { lat: 49.120, lng: 6.176 },
  'nancy':                                { lat: 48.692, lng: 6.185 },
  'tours':                                { lat: 47.394, lng: 0.688 },
  'clermont-ferrand':                     { lat: 45.778, lng: 3.087 },
  'saint-étienne':                        { lat: 45.440, lng: 4.387 },
};

const memoryCache: Record<string, GeoCoords | null> = {};
let lastRequestAt = 0;

async function throttledFetch(address: string): Promise<GeoCoords | null> {
  // Respect 1 req/sec rate limit
  const now = Date.now();
  const elapsed = now - lastRequestAt;
  if (elapsed < 1200) {
    await new Promise((r) => setTimeout(r, 1200 - elapsed));
  }
  lastRequestAt = Date.now();

  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=fr&accept-language=fr`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // network error — silently return null
  }
  return null;
}

export async function geocodeAddress(address: string): Promise<GeoCoords | null> {
  // 1. Local lookup (case-insensitive, instant)
  const key = address.toLowerCase().trim();
  const local = LOCAL_COORDS[key];
  if (local) return local;

  // Also try prefix match (e.g. "Lyon, ..." → "lyon")
  for (const [k, v] of Object.entries(LOCAL_COORDS)) {
    if (key.startsWith(k) || k.startsWith(key)) return v;
  }

  // 2. Memory cache
  if (address in memoryCache) return memoryCache[address];

  // 3. Nominatim (rate-limited)
  const coords = await throttledFetch(address);
  memoryCache[address] = coords;
  return coords;
}
