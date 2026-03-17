-- ===================================================
-- V2 : Facteurs d'émission ADEME Base Carbone 2024
-- ===================================================

INSERT INTO emission_factors (code, label, category, kg_co2e_per_unit, unit, source) VALUES
-- Matériaux de construction (kgCO₂e par kg de matériau)
('CONCRETE',       'Béton',           'MATERIAL', 0.150, 'kg', 'ADEME Base Carbone 2024'),
('STEEL',          'Acier',           'MATERIAL', 1.460, 'kg', 'ADEME Base Carbone 2024'),
('GLASS',          'Verre',           'MATERIAL', 0.850, 'kg', 'ADEME Base Carbone 2024'),
('WOOD_STRUCTURE', 'Bois (structure)', 'MATERIAL', 0.060, 'kg', 'ADEME Base Carbone 2024'),
('ALUMINUM',       'Aluminium',       'MATERIAL', 8.240, 'kg', 'ADEME Base Carbone 2024'),
('BRICK',          'Brique',          'MATERIAL', 0.220, 'kg', 'ADEME Base Carbone 2024'),
('INSULATION',     'Isolant (laine minérale)', 'MATERIAL', 1.280, 'kg', 'ADEME Base Carbone 2024'),
('COPPER',         'Cuivre',          'MATERIAL', 2.710, 'kg', 'ADEME Base Carbone 2024'),

-- Énergie (kgCO₂e par kWh consommé)
('ELECTRICITY_FR', 'Électricité (France)',    'ENERGY', 0.0571, 'kWh', 'ADEME Base Carbone 2024'),
('GAS_NATURAL',    'Gaz naturel',             'ENERGY', 0.2270, 'kWh', 'ADEME Base Carbone 2024'),
('FUEL_OIL',       'Fioul domestique',        'ENERGY', 0.3240, 'kWh', 'ADEME Base Carbone 2024'),
('DISTRICT_HEAT',  'Chaleur réseau urbain',   'ENERGY', 0.1110, 'kWh', 'ADEME Base Carbone 2024');
