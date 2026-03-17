import { Site } from '@/stores/sitesStore';

function formatVal(val: number | null | undefined, decimals = 0): string {
  if (val === null || val === undefined) return '—';
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)} tCO₂e`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)} tCO₂e`;
  return `${val.toFixed(decimals)} kgCO₂e`;
}

export function generateSiteReport(site: Site): string {
  const co2Total = site.co2Total ?? 0;
  const constructionPct = co2Total > 0 ? ((site.co2Construction ?? 0) / co2Total * 100).toFixed(0) : '0';
  const exploitationPct = co2Total > 0 ? ((site.co2Exploitation ?? 0) / co2Total * 100).toFixed(0) : '0';

  const materialsRows = (site.materials ?? [])
    .sort((a, b) => b.co2Kg - a.co2Kg)
    .map(
      (m) => `
      <tr>
        <td>${m.factorLabel}</td>
        <td>${(m.quantityKg / 1000).toFixed(2)} t</td>
        <td>${formatVal(m.co2Kg)}</td>
        <td>${co2Total > 0 ? ((m.co2Kg / co2Total) * 100).toFixed(1) : '0'}%</td>
      </tr>`
    )
    .join('');

  const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Rapport CO₂ — ${site.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #1A1A2E; font-size: 13px; padding: 32px; }
    .header { background: #0070AD; color: white; padding: 24px 28px; border-radius: 8px; margin-bottom: 28px; }
    .header h1 { font-size: 20px; margin-bottom: 4px; }
    .header p { opacity: 0.8; font-size: 13px; margin-top: 4px; }
    .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #6B7280; margin-bottom: 12px; margin-top: 28px; padding-bottom: 6px; border-bottom: 1px solid #E5E7EB; }
    .kpi-grid { display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
    .kpi-card { flex: 1; min-width: 140px; background: #F5F7FA; border-radius: 8px; padding: 14px; border-left: 4px solid #0070AD; }
    .kpi-card.secondary { border-left-color: #00A8E0; }
    .kpi-value { font-size: 20px; font-weight: bold; color: #0070AD; }
    .kpi-card.secondary .kpi-value { color: #00A8E0; }
    .kpi-label { font-size: 11px; color: #6B7280; margin-top: 4px; }
    .bar-row { margin-bottom: 12px; }
    .bar-label { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
    .bar-track { background: #E5E7EB; border-radius: 4px; height: 10px; }
    .bar-fill { height: 10px; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #0070AD; color: white; padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; }
    td { padding: 8px 10px; border-bottom: 1px solid #E5E7EB; font-size: 12px; }
    tr:nth-child(even) td { background: #F5F7FA; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .info-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #E5E7EB; }
    .info-label { color: #6B7280; }
    .info-value { font-weight: 600; }
    .footer { margin-top: 36px; padding-top: 12px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; display: flex; justify-content: space-between; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size:11px;opacity:0.7;letter-spacing:1px;margin-bottom:6px">CAPGEMINI · CARBON CALCULATOR</div>
    <h1>Rapport d'empreinte carbone</h1>
    <h2 style="font-size:15px;font-weight:normal;margin-top:4px;opacity:0.9">${site.name}</h2>
    ${site.location ? `<p>📍 ${site.location}</p>` : ''}
    <p style="margin-top:8px">${site.organizationName}</p>
  </div>

  <div class="section-title">Indicateurs CO₂</div>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-value">${formatVal(site.co2Total)}</div>
      <div class="kpi-label">🌍 CO₂ Total</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${site.co2PerM2 !== null ? `${(site.co2PerM2 ?? 0).toFixed(1)} kg/m²` : '—'}</div>
      <div class="kpi-label">📐 CO₂ par m²</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${formatVal(site.co2PerEmployee)}</div>
      <div class="kpi-label">👤 CO₂ par employé</div>
    </div>
  </div>

  <div class="section-title">Répartition</div>
  <div class="bar-row">
    <div class="bar-label">
      <span>🏗️ Construction</span>
      <span><strong>${formatVal(site.co2Construction)}</strong> (${constructionPct}%)</span>
    </div>
    <div class="bar-track">
      <div class="bar-fill" style="width:${constructionPct}%;background:#0070AD"></div>
    </div>
  </div>
  <div class="bar-row">
    <div class="bar-label">
      <span>⚡ Exploitation annuelle</span>
      <span><strong>${formatVal(site.co2Exploitation)}</strong> (${exploitationPct}%)</span>
    </div>
    <div class="bar-track">
      <div class="bar-fill" style="width:${exploitationPct}%;background:#00A8E0"></div>
    </div>
  </div>

  <div class="section-title">Données du site</div>
  <div class="info-grid">
    <div>
      ${[
        { label: 'Surface totale', value: `${site.totalAreaM2.toLocaleString('fr-FR')} m²` },
        { label: 'Places de parking', value: String(site.parkingSpaces) },
      ].map(r => `<div class="info-row"><span class="info-label">${r.label}</span><span class="info-value">${r.value}</span></div>`).join('')}
    </div>
    <div>
      ${[
        { label: 'Employés', value: String(site.employeeCount) },
        { label: 'Énergie annuelle', value: `${site.annualEnergyKwh.toLocaleString('fr-FR')} kWh` },
      ].map(r => `<div class="info-row"><span class="info-label">${r.label}</span><span class="info-value">${r.value}</span></div>`).join('')}
    </div>
  </div>

  ${
    site.materials && site.materials.length > 0
      ? `
  <div class="section-title">Matériaux de construction</div>
  <table>
    <thead>
      <tr>
        <th>Matériau</th>
        <th>Quantité</th>
        <th>CO₂e</th>
        <th>Part du total</th>
      </tr>
    </thead>
    <tbody>${materialsRows}</tbody>
  </table>`
      : ''
  }

  <div class="footer">
    <span>Rapport généré le ${today}</span>
    <span>Facteurs d'émission ADEME Base Carbone 2024</span>
  </div>
</body>
</html>`;
}
