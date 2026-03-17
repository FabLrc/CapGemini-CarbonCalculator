-- ===================================================
-- V6 : Données de démonstration — 10 sites français fictifs
--
-- Comptes créés :
--   superadmin@carboncalculator.fr  (SUPER_ADMIN)  — mot de passe : password
--   admin@capgemini.fr              (ADMIN)         — mot de passe : password
-- ===================================================

DO $$
DECLARE
  v_org_id   BIGINT;
  v_user_id  BIGINT;
  v_site_id  BIGINT;
BEGIN

  -- -------------------------------------------------------
  -- Organisation
  -- -------------------------------------------------------
  INSERT INTO organizations (name, description)
    VALUES ('Capgemini France', 'Parc immobilier France — données de démonstration')
    ON CONFLICT (name) DO NOTHING;
  SELECT id INTO v_org_id FROM organizations WHERE name = 'Capgemini France';

  -- -------------------------------------------------------
  -- Compte Super Admin global
  -- -------------------------------------------------------
  INSERT INTO users (first_name, last_name, email, password, role, organization_id)
    VALUES ('Super', 'Admin', 'superadmin@carboncalculator.fr',
            '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
            'SUPER_ADMIN', NULL)
    ON CONFLICT (email) DO NOTHING;

  -- Compte Admin Capgemini France
  INSERT INTO users (first_name, last_name, email, password, role, organization_id)
    VALUES ('Sophie', 'Martin', 'admin@capgemini.fr',
            '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
            'ADMIN', v_org_id)
    ON CONFLICT (email) DO NOTHING;
  SELECT id INTO v_user_id FROM users WHERE email = 'admin@capgemini.fr';

  -- -------------------------------------------------------
  -- Site 1 — Tour La Défense, Puteaux
  --   Structure : béton armé, acier, verre, aluminium, moquette
  --   Énergie   : Électricité France
  -- -------------------------------------------------------
  INSERT INTO sites (name, description, location, total_area_m2, parking_spaces,
                     annual_energy_kwh, employee_count, energy_factor_code,
                     co2_construction, co2_exploitation,
                     organization_id, created_by_id)
  VALUES ('Tour La Défense',
          'Tour de bureaux 22 étages — siège opérationnel',
          'Puteaux, Île-de-France',
          8500, 120, 2800000, 650, 'ELECTRICITY_FR',
          507070, 159880, v_org_id, v_user_id)
  RETURNING id INTO v_site_id;

  INSERT INTO site_materials (site_id, emission_factor_id, quantity_kg, co2_kg) VALUES
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'CONCRETE_REINFORCED'), 850000, 178500),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'STEEL'),               120000, 175200),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'GLASS'),                45000,  38250),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'ALUMINUM'),              8000,  65920),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'CARPET'),               12000,  49200);

  -- -------------------------------------------------------
  -- Site 2 — Campus Sophia Antipolis, Valbonne
  --   Structure : béton armé, acier recyclé, verre, bois CLT, ouate cellulose
  --   Énergie   : Électricité France
  -- -------------------------------------------------------
  INSERT INTO sites (name, description, location, total_area_m2, parking_spaces,
                     annual_energy_kwh, employee_count, energy_factor_code,
                     co2_construction, co2_exploitation,
                     organization_id, created_by_id)
  VALUES ('Campus Sophia Antipolis',
          'Campus technologique 4 bâtiments R&D et support',
          'Valbonne, Alpes-Maritimes',
          12000, 280, 3200000, 820, 'ELECTRICITY_FR',
          350535, 182720, v_org_id, v_user_id)
  RETURNING id INTO v_site_id;

  INSERT INTO site_materials (site_id, emission_factor_id, quantity_kg, co2_kg) VALUES
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'CONCRETE_REINFORCED'),  1200000, 252000),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'STEEL_RECYCLED'),         80000,  40800),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'GLASS'),                  60000,  51000),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'WOOD_CLT'),               25000,   1375),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'INSULATION_CELLULOSE'),    8000,   5360);

  -- -------------------------------------------------------
  -- Site 3 — Data Center Lyon Part-Dieu
  --   Structure : béton armé, acier, aluminium recyclé, cuivre
  --   Énergie   : Électricité France (forte consommation IT)
  -- -------------------------------------------------------
  INSERT INTO sites (name, description, location, total_area_m2, parking_spaces,
                     annual_energy_kwh, employee_count, energy_factor_code,
                     co2_construction, co2_exploitation,
                     organization_id, created_by_id)
  VALUES ('Data Center Lyon Part-Dieu',
          'Centre de données Tier III — 2 salles machines redondées',
          'Lyon, Auvergne-Rhône-Alpes',
          3800, 40, 8500000, 85, 'ELECTRICITY_FR',
          200380, 485350, v_org_id, v_user_id)
  RETURNING id INTO v_site_id;

  INSERT INTO site_materials (site_id, emission_factor_id, quantity_kg, co2_kg) VALUES
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'CONCRETE_REINFORCED'), 420000,  88200),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'STEEL'),                55000,  80300),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'ALUMINUM_RECYCLED'),    15000,  10200),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'COPPER'),                8000,  21680);

  -- -------------------------------------------------------
  -- Site 4 — Entrepôt Logistique Bordeaux
  --   Structure : béton simple, acier recyclé, bitume, gravier
  --   Énergie   : Gaz naturel (chauffage entrepôt)
  -- -------------------------------------------------------
  INSERT INTO sites (name, description, location, total_area_m2, parking_spaces,
                     annual_energy_kwh, employee_count, energy_factor_code,
                     co2_construction, co2_exploitation,
                     organization_id, created_by_id)
  VALUES ('Entrepôt Logistique Bordeaux',
          'Plateforme logistique 5 nefs — cross-docking et stockage',
          'Mérignac, Gironde',
          22000, 180, 1800000, 210, 'GAS_NATURAL',
          473800, 408600, v_org_id, v_user_id)
  RETURNING id INTO v_site_id;

  INSERT INTO site_materials (site_id, emission_factor_id, quantity_kg, co2_kg) VALUES
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'CONCRETE'),         1800000, 270000),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'STEEL_RECYCLED'),    350000, 178500),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'BITUMEN'),            45000,  20700),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'GRAVEL'),            200000,   4600);

  -- -------------------------------------------------------
  -- Site 5 — Siège Social Marseille
  --   Structure : béton armé, brique, verre, calcaire, tuiles
  --   Énergie   : Pompe à chaleur (air/eau) — très bas carbone
  -- -------------------------------------------------------
  INSERT INTO sites (name, description, location, total_area_m2, parking_spaces,
                     annual_energy_kwh, employee_count, energy_factor_code,
                     co2_construction, co2_exploitation,
                     organization_id, created_by_id)
  VALUES ('Siège Social Marseille',
          'Immeuble haussmannien rénové — certifié HQE Bâtiment Durable',
          'Marseille 13e, Bouches-du-Rhône',
          6200, 95, 1500000, 380, 'HEAT_PUMP_AIR',
          205660, 48000, v_org_id, v_user_id)
  RETURNING id INTO v_site_id;

  INSERT INTO site_materials (site_id, emission_factor_id, quantity_kg, co2_kg) VALUES
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'CONCRETE_REINFORCED'), 620000, 130200),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'BRICK'),               180000,  39600),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'GLASS'),                28000,  23800),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'LIMESTONE'),            60000,   3480),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'TILES_CLAY'),           22000,   8580);

  -- -------------------------------------------------------
  -- Site 6 — Campus R&D Grenoble Presqu'île
  --   Structure : béton armé, bois CLT, bois lamellé-collé, acier recyclé, verre
  --   Énergie   : Géothermie — très bas carbone
  -- -------------------------------------------------------
  INSERT INTO sites (name, description, location, total_area_m2, parking_spaces,
                     annual_energy_kwh, employee_count, energy_factor_code,
                     co2_construction, co2_exploitation,
                     organization_id, created_by_id)
  VALUES ('Campus R&D Grenoble Presqu''île',
          'Campus de recherche et développement — bâtiment bas carbone E+C-',
          'Grenoble, Isère',
          9800, 160, 2100000, 540, 'GEOTHERMAL',
          295025, 73500, v_org_id, v_user_id)
  RETURNING id INTO v_site_id;

  INSERT INTO site_materials (site_id, emission_factor_id, quantity_kg, co2_kg) VALUES
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'CONCRETE_REINFORCED'), 980000, 205800),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'WOOD_CLT'),             85000,   4675),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'WOOD_GLULAM'),          45000,   7200),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'STEEL_RECYCLED'),       65000,  33150),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'GLASS'),                52000,  44200);

  -- -------------------------------------------------------
  -- Site 7 — Bâtiment Commercial Nantes Île de Nantes
  --   Structure : béton armé, brique, acier galvanisé, plâtre, carrelage
  --   Énergie   : Chaleur réseau urbain
  -- -------------------------------------------------------
  INSERT INTO sites (name, description, location, total_area_m2, parking_spaces,
                     annual_energy_kwh, employee_count, energy_factor_code,
                     co2_construction, co2_exploitation,
                     organization_id, created_by_id)
  VALUES ('Bâtiment Commercial Nantes',
          'Immeuble mixte bureaux/commerces — Île de Nantes ZAC',
          'Nantes, Loire-Atlantique',
          5400, 75, 1200000, 290, 'DISTRICT_HEAT',
          194380, 133200, v_org_id, v_user_id)
  RETURNING id INTO v_site_id;

  INSERT INTO site_materials (site_id, emission_factor_id, quantity_kg, co2_kg) VALUES
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'CONCRETE_REINFORCED'), 540000, 113400),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'BRICK'),                95000,  20900),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'STEEL_GALVANIZED'),     18000,  51120),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'PLASTER'),              32000,   3840),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'TILES_CERAMIC'),         8000,   5120);

  -- -------------------------------------------------------
  -- Site 8 — Centre Opérationnel Toulouse Blagnac
  --   Structure : béton armé, acier, aluminium, verre, XPS
  --   Énergie   : Électricité France
  -- -------------------------------------------------------
  INSERT INTO sites (name, description, location, total_area_m2, parking_spaces,
                     annual_energy_kwh, employee_count, energy_factor_code,
                     co2_construction, co2_exploitation,
                     organization_id, created_by_id)
  VALUES ('Centre Opérationnel Toulouse',
          'Centre de services partagés — 3 plateaux open space',
          'Blagnac, Haute-Garonne',
          7100, 110, 2400000, 420, 'ELECTRICITY_FR',
          426460, 137040, v_org_id, v_user_id)
  RETURNING id INTO v_site_id;

  INSERT INTO site_materials (site_id, emission_factor_id, quantity_kg, co2_kg) VALUES
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'CONCRETE_REINFORCED'), 710000, 149100),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'STEEL'),                85000, 124100),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'ALUMINUM'),             12000,  98880),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'GLASS'),                38000,  32300),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'POLYSTYRENE_XPS'),       6000,  22080);

  -- -------------------------------------------------------
  -- Site 9 — Site Industriel Lille Villeneuve-d'Ascq
  --   Structure : béton simple, acier recyclé, béton cellulaire, zinc, PVC
  --   Énergie   : Gaz naturel — empreinte élevée
  -- -------------------------------------------------------
  INSERT INTO sites (name, description, location, total_area_m2, parking_spaces,
                     annual_energy_kwh, employee_count, energy_factor_code,
                     co2_construction, co2_exploitation,
                     organization_id, created_by_id)
  VALUES ('Site Industriel Lille',
          'Site de production et maintenance — activité 3x8',
          'Villeneuve-d''Ascq, Nord',
          15000, 220, 4200000, 480, 'GAS_NATURAL',
          455580, 953400, v_org_id, v_user_id)
  RETURNING id INTO v_site_id;

  INSERT INTO site_materials (site_id, emission_factor_id, quantity_kg, co2_kg) VALUES
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'CONCRETE'),           1500000, 225000),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'STEEL_RECYCLED'),      280000, 142800),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'CONCRETE_CELLULAR'),   120000,  49200),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'ZINC'),                  5000,  19300),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'PVC'),                   8000,  19280);

  -- -------------------------------------------------------
  -- Site 10 — Hub Digital Strasbourg
  --   Structure : béton armé, bois CLT, acier recyclé, verre, ouate cellulose
  --   Énergie   : Électricité France
  -- -------------------------------------------------------
  INSERT INTO sites (name, description, location, total_area_m2, parking_spaces,
                     annual_energy_kwh, employee_count, energy_factor_code,
                     co2_construction, co2_exploitation,
                     organization_id, created_by_id)
  VALUES ('Hub Digital Strasbourg',
          'Espace de coworking et innovation — bâtiment à énergie positive',
          'Strasbourg, Bas-Rhin',
          4600, 65, 1100000, 310, 'ELECTRICITY_FR',
          146955, 62810, v_org_id, v_user_id)
  RETURNING id INTO v_site_id;

  INSERT INTO site_materials (site_id, emission_factor_id, quantity_kg, co2_kg) VALUES
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'CONCRETE_REINFORCED'), 460000,  96600),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'WOOD_CLT'),             55000,   3025),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'STEEL_RECYCLED'),       38000,  19380),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'GLASS'),                25000,  21250),
    (v_site_id, (SELECT id FROM emission_factors WHERE code = 'INSULATION_CELLULOSE'), 10000,   6700);

END $$;
