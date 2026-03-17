-- ===================================================
-- V3 : Enrichissement ADEME Base Carbone 2024
--      + choix du mix énergétique par site
-- ===================================================

-- Ajout du mix énergétique choisi par site (défaut : électricité France)
ALTER TABLE sites
    ADD COLUMN energy_factor_code VARCHAR(50) NOT NULL DEFAULT 'ELECTRICITY_FR';

-- -------------------------------------------------------
-- Matériaux de construction supplémentaires (kgCO₂e / kg)
-- -------------------------------------------------------
INSERT INTO emission_factors (code, label, category, kg_co2e_per_unit, unit, source) VALUES
('CONCRETE_REINFORCED', 'Béton armé',                'MATERIAL', 0.210,  'kg', 'ADEME Base Carbone 2024'),
('CONCRETE_CELLULAR',   'Béton cellulaire (AAC)',    'MATERIAL', 0.410,  'kg', 'ADEME Base Carbone 2024'),
('STEEL_RECYCLED',      'Acier recyclé',             'MATERIAL', 0.510,  'kg', 'ADEME Base Carbone 2024'),
('STEEL_GALVANIZED',    'Acier galvanisé',           'MATERIAL', 2.840,  'kg', 'ADEME Base Carbone 2024'),
('WOOD_CLT',            'Bois lamellé-croisé (CLT)', 'MATERIAL', 0.055,  'kg', 'ADEME Base Carbone 2024'),
('WOOD_GLULAM',         'Bois lamellé-collé',        'MATERIAL', 0.160,  'kg', 'ADEME Base Carbone 2024'),
('ALUMINUM_RECYCLED',   'Aluminium recyclé',         'MATERIAL', 0.680,  'kg', 'ADEME Base Carbone 2024'),
('PVC',                 'PVC',                       'MATERIAL', 2.410,  'kg', 'ADEME Base Carbone 2024'),
('PLASTER',             'Plâtre',                    'MATERIAL', 0.120,  'kg', 'ADEME Base Carbone 2024'),
('GRANITE',             'Granit',                    'MATERIAL', 0.280,  'kg', 'ADEME Base Carbone 2024'),
('LIMESTONE',           'Pierre calcaire',           'MATERIAL', 0.058,  'kg', 'ADEME Base Carbone 2024'),
('GRAVEL',              'Gravier / gravats',         'MATERIAL', 0.023,  'kg', 'ADEME Base Carbone 2024'),
('SAND',                'Sable',                     'MATERIAL', 0.004,  'kg', 'ADEME Base Carbone 2024'),
('BITUMEN',             'Bitume / asphalte',         'MATERIAL', 0.460,  'kg', 'ADEME Base Carbone 2024'),
('POLYSTYRENE_EPS',     'Polystyrène expansé (EPS)', 'MATERIAL', 3.290,  'kg', 'ADEME Base Carbone 2024'),
('POLYSTYRENE_XPS',     'Polystyrène extrudé (XPS)', 'MATERIAL', 3.680,  'kg', 'ADEME Base Carbone 2024'),
('INSULATION_PU',       'Isolant polyuréthane',      'MATERIAL', 3.780,  'kg', 'ADEME Base Carbone 2024'),
('INSULATION_CELLULOSE','Ouate de cellulose',        'MATERIAL', 0.670,  'kg', 'ADEME Base Carbone 2024'),
('TILES_CERAMIC',       'Carrelage céramique',       'MATERIAL', 0.640,  'kg', 'ADEME Base Carbone 2024'),
('TILES_SLATE',         'Ardoise naturelle',         'MATERIAL', 0.028,  'kg', 'ADEME Base Carbone 2024'),
('TILES_CLAY',          'Tuile en terre cuite',      'MATERIAL', 0.390,  'kg', 'ADEME Base Carbone 2024'),
('CARPET',              'Moquette (synthétique)',     'MATERIAL', 4.100,  'kg', 'ADEME Base Carbone 2024'),
('LINOLEUM',            'Linoléum',                  'MATERIAL', 1.080,  'kg', 'ADEME Base Carbone 2024'),
('ZINC',                'Zinc',                      'MATERIAL', 3.860,  'kg', 'ADEME Base Carbone 2024'),
('LEAD',                'Plomb',                     'MATERIAL', 1.570,  'kg', 'ADEME Base Carbone 2024')
ON CONFLICT (code) DO NOTHING;

-- -------------------------------------------------------
-- Énergie — mix électrique par pays / source (kgCO₂e / kWh)
-- -------------------------------------------------------
INSERT INTO emission_factors (code, label, category, kg_co2e_per_unit, unit, source) VALUES
-- Pays européens
('ELECTRICITY_DE',   'Électricité (Allemagne)',      'ENERGY', 0.350,  'kWh', 'ADEME Base Carbone 2024'),
('ELECTRICITY_UK',   'Électricité (Royaume-Uni)',    'ENERGY', 0.233,  'kWh', 'ADEME Base Carbone 2024'),
('ELECTRICITY_ES',   'Électricité (Espagne)',        'ENERGY', 0.181,  'kWh', 'ADEME Base Carbone 2024'),
('ELECTRICITY_IT',   'Électricité (Italie)',         'ENERGY', 0.336,  'kWh', 'ADEME Base Carbone 2024'),
('ELECTRICITY_EU',   'Électricité (Moyenne UE)',     'ENERGY', 0.295,  'kWh', 'ADEME Base Carbone 2024'),
-- Énergies fossiles
('GAS_PROPANE',      'Propane / GPL',                'ENERGY', 0.274,  'kWh', 'ADEME Base Carbone 2024'),
('GAS_BIOMETHANE',   'Biométhane',                   'ENERGY', 0.044,  'kWh', 'ADEME Base Carbone 2024'),
-- Énergies renouvelables & bas carbone
('BIOMASS_PELLETS',  'Biomasse — granulés bois',     'ENERGY', 0.030,  'kWh', 'ADEME Base Carbone 2024'),
('BIOMASS_CHIPS',    'Biomasse — plaquettes',        'ENERGY', 0.018,  'kWh', 'ADEME Base Carbone 2024'),
('SOLAR_PV',         'Solaire photovoltaïque',       'ENERGY', 0.043,  'kWh', 'ADEME Base Carbone 2024'),
('WIND_ONSHORE',     'Éolien terrestre',             'ENERGY', 0.011,  'kWh', 'ADEME Base Carbone 2024'),
('HEAT_PUMP_AIR',    'Pompe à chaleur (air/eau)',    'ENERGY', 0.032,  'kWh', 'ADEME Base Carbone 2024'),
('GEOTHERMAL',       'Géothermie',                   'ENERGY', 0.035,  'kWh', 'ADEME Base Carbone 2024')
ON CONFLICT (code) DO NOTHING;
