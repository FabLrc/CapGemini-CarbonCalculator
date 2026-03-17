-- ===================================================
-- V5 : Historisation des snapshots de sites
--      Permet de tracer l'évolution du CO₂ dans le temps
-- ===================================================

CREATE TABLE site_snapshots (
    id                  BIGSERIAL PRIMARY KEY,
    site_id             BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    snapshot_date       TIMESTAMP NOT NULL DEFAULT NOW(),
    co2_construction    DOUBLE PRECISION,
    co2_exploitation    DOUBLE PRECISION,
    co2_total           DOUBLE PRECISION,
    co2_per_m2          DOUBLE PRECISION,
    co2_per_employee    DOUBLE PRECISION,
    annual_energy_kwh   DOUBLE PRECISION,
    energy_factor_code  VARCHAR(50),
    note                VARCHAR(255)    -- raison du snapshot (ex: "Création", "Mise à jour", "Isolation façade")
);

CREATE INDEX idx_snapshots_site_id ON site_snapshots(site_id);
CREATE INDEX idx_snapshots_date    ON site_snapshots(snapshot_date);
