import { Platform } from 'react-native';
import { Site } from '@/stores/sitesStore';

/**
 * Génère le contenu CSV pour un ou plusieurs sites.
 * Format : une ligne d'en-tête + une ligne par site.
 */
function buildCsv(sites: Site[]): string {
  const headers = [
    'Nom du site',
    'Localisation',
    'Surface (m²)',
    'Employés',
    'Places de parking',
    'Consommation énergie (kWh/an)',
    'Mix énergétique',
    'CO₂ Construction (kgCO₂e)',
    'CO₂ Exploitation (kgCO₂e)',
    'CO₂ Total (kgCO₂e)',
    'CO₂/m² (kgCO₂e/m²)',
    'CO₂/Employé (kgCO₂e/pers.)',
    'Organisation',
    'Créé par',
    'Date de création',
  ];

  const rows = sites.map((s) => [
    s.name ?? '',
    s.location ?? '',
    s.totalAreaM2 ?? '',
    s.employeeCount ?? '',
    s.parkingSpaces ?? '',
    s.annualEnergyKwh ?? '',
    s.energyLabel ?? s.energyFactorCode ?? '',
    s.co2Construction?.toFixed(2) ?? '',
    s.co2Exploitation?.toFixed(2) ?? '',
    s.co2Total?.toFixed(2) ?? '',
    s.co2PerM2?.toFixed(2) ?? '',
    s.co2PerEmployee?.toFixed(2) ?? '',
    s.organizationName ?? '',
    s.createdByName ?? '',
    s.createdAt ? new Date(s.createdAt).toLocaleDateString('fr-FR') : '',
  ]);

  const escape = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [headers, ...rows].map((row) => row.map(escape).join(';'));
  return '\uFEFF' + lines.join('\n'); // BOM UTF-8 pour Excel
}

/**
 * Exporte un ou plusieurs sites en CSV.
 * - Web : téléchargement direct via <a>
 * - Mobile : partage via expo-sharing
 */
export async function exportSitesCsv(sites: Site[], filename = 'carbon_calculator_export.csv') {
  const csv = buildCsv(sites);

  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  // Mobile — expo-file-system + expo-sharing
  try {
    const FileSystem = await import('expo-file-system');
    const Sharing = await import('expo-sharing');
    const path = FileSystem.documentDirectory + filename;
    await FileSystem.default.writeAsStringAsync(path, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.default.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Exporter CSV' });
  } catch {
    console.warn('Export CSV mobile non disponible');
  }
}
