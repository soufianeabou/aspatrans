-- ASPATRANS PostgreSQL Schema
-- Minimal, MVP-focused, with required tables and constraints

-- Types
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('business','admin','driver','transport_company');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'generic_status') THEN
        CREATE TYPE generic_status AS ENUM ('active','inactive','pending','completed','cancelled');
    END IF;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS users (
    id                  BIGSERIAL PRIMARY KEY,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,
    role                user_role NOT NULL,
    full_name           VARCHAR(255) NOT NULL,
    phone               VARCHAR(50),
    company_name        VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_companies (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    owner_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_phone       VARCHAR(50),
    vehicles_count      INTEGER NOT NULL DEFAULT 0,
    status              generic_status NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id                  BIGSERIAL PRIMARY KEY,
    company_id          BIGINT NOT NULL REFERENCES transport_companies(id) ON DELETE CASCADE,
    plate_number        VARCHAR(50) NOT NULL UNIQUE,
    model               VARCHAR(255) NOT NULL,
    capacity            INTEGER NOT NULL,
    status              generic_status NOT NULL DEFAULT 'inactive',
    last_maintenance    DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
    id                  BIGSERIAL PRIMARY KEY,
    company_id          BIGINT NOT NULL REFERENCES transport_companies(id) ON DELETE CASCADE,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number      VARCHAR(100) NOT NULL UNIQUE,
    availability_status generic_status NOT NULL DEFAULT 'inactive',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT drivers_user_unique UNIQUE (company_id, user_id)
);

CREATE TABLE IF NOT EXISTS business_requests (
    id                  BIGSERIAL PRIMARY KEY,
    business_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pickup_location     TEXT NOT NULL,
    destination         TEXT NOT NULL,
    employees_count     INTEGER NOT NULL,
    frequency           VARCHAR(100) NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE,
    special_notes       TEXT,
    status              generic_status NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
    id                  BIGSERIAL PRIMARY KEY,
    request_id          BIGINT NOT NULL REFERENCES business_requests(id) ON DELETE CASCADE,
    company_id          BIGINT NOT NULL REFERENCES transport_companies(id) ON DELETE CASCADE,
    driver_id           BIGINT NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    vehicle_id          BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    price               NUMERIC(12,2) NOT NULL,
    admin_notes         TEXT,
    status              generic_status NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trips (
    id                  BIGSERIAL PRIMARY KEY,
    contract_id         BIGINT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    driver_id           BIGINT NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    scheduled_datetime  TIMESTAMPTZ NOT NULL,
    actual_start        TIMESTAMPTZ,
    actual_end          TIMESTAMPTZ,
    pickup_lat          DOUBLE PRECISION,
    pickup_lng          DOUBLE PRECISION,
    destination_lat     DOUBLE PRECISION,
    destination_lng     DOUBLE PRECISION,
    status              generic_status NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes to speed up common queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tc_status ON transport_companies(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_company ON drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_br_business ON business_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_contracts_request ON contracts(request_id);
CREATE INDEX IF NOT EXISTS idx_trips_contract ON trips(contract_id);


