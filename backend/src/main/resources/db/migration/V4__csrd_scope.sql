-- ===================================================
-- V4 : CSRD Scope tagging (Scope 1 / 2 / 3)
--
-- Scope 1 : Émissions directes (combustion sur site — gaz, propane, fioul)
-- Scope 2 : Émissions indirectes liées à l'énergie achetée (électricité, chaleur)
-- Scope 3 : Autres émissions indirectes (matériaux de construction, chaîne d'approvisionnement)
-- ===================================================

ALTER TABLE emission_factors
    ADD COLUMN IF NOT EXISTS scope VARCHAR(10);

-- -------------------------------------------------------
-- Énergies fossiles directes → Scope 1
-- -------------------------------------------------------
UPDATE emission_factors SET scope = 'SCOPE_1'
WHERE code IN (
    'GAS_NATURAL',
    'GAS_PROPANE',
    'BIOMETHANE'
);

-- -------------------------------------------------------
-- Électricité et chaleur achetée → Scope 2
-- -------------------------------------------------------
UPDATE emission_factors SET scope = 'SCOPE_2'
WHERE code IN (
    'ELECTRICITY_FR',
    'ELECTRICITY_DE',
    'ELECTRICITY_UK',
    'ELECTRICITY_ES',
    'ELECTRICITY_IT',
    'ELECTRICITY_EU',
    'BIOMASS_PELLETS',
    'BIOMASS_CHIPS',
    'SOLAR_PV',
    'WIND_ONSHORE',
    'HEAT_PUMP_AIR',
    'GEOTHERMAL'
);

-- -------------------------------------------------------
-- Matériaux de construction → Scope 3
-- -------------------------------------------------------
UPDATE emission_factors SET scope = 'SCOPE_3'
WHERE category = 'MATERIAL';
