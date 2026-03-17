-- ===================================================
-- V7 : Ajout de l'année de construction des sites
-- ===================================================

ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS construction_year INTEGER;

-- Mise à jour des données de démonstration
UPDATE sites SET construction_year = 2008 WHERE name = 'Tour La Défense';
UPDATE sites SET construction_year = 2012 WHERE name = 'Campus Sophia Antipolis';
UPDATE sites SET construction_year = 2015 WHERE name = 'Data Center Lyon Part-Dieu';
UPDATE sites SET construction_year = 2010 WHERE name = 'Entrepôt Logistique Bordeaux';
UPDATE sites SET construction_year = 2019 WHERE name = 'Siège Social Marseille';
UPDATE sites SET construction_year = 2022 WHERE name = 'Campus R&D Grenoble Presqu''île';
UPDATE sites SET construction_year = 2017 WHERE name = 'Bâtiment Commercial Nantes';
UPDATE sites SET construction_year = 2014 WHERE name = 'Centre Opérationnel Toulouse';
UPDATE sites SET construction_year = 2009 WHERE name = 'Site Industriel Lille';
UPDATE sites SET construction_year = 2023 WHERE name = 'Hub Digital Strasbourg';
