-- ===================================================
-- V1 : Schéma initial CarbonCalculator
-- ===================================================

CREATE TABLE organizations (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MEMBER')),
    organization_id BIGINT REFERENCES organizations(id) ON DELETE SET NULL,
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE emission_factors (
    id               BIGSERIAL PRIMARY KEY,
    code             VARCHAR(50)  NOT NULL UNIQUE,
    label            VARCHAR(255) NOT NULL,
    category         VARCHAR(20)  NOT NULL CHECK (category IN ('MATERIAL', 'ENERGY')),
    kg_co2e_per_unit DOUBLE PRECISION NOT NULL,
    unit             VARCHAR(20),
    source           VARCHAR(255)
);

CREATE TABLE sites (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    location            VARCHAR(255),
    total_area_m2       DOUBLE PRECISION NOT NULL,
    parking_spaces      INTEGER NOT NULL DEFAULT 0,
    annual_energy_kwh   DOUBLE PRECISION NOT NULL DEFAULT 0,
    employee_count      INTEGER NOT NULL DEFAULT 1,
    co2_construction    DOUBLE PRECISION,
    co2_exploitation    DOUBLE PRECISION,
    organization_id     BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by_id       BIGINT NOT NULL REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE site_materials (
    id                 BIGSERIAL PRIMARY KEY,
    site_id            BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    emission_factor_id BIGINT NOT NULL REFERENCES emission_factors(id),
    quantity_kg        DOUBLE PRECISION NOT NULL,
    co2_kg             DOUBLE PRECISION
);

-- Index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_sites_organization ON sites(organization_id);
CREATE INDEX idx_site_materials_site ON site_materials(site_id);
