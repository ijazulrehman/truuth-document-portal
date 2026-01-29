-- =========================================================
-- Truuth Portal - PostgreSQL Bootstrap
-- Runs ONLY on first-time volume initialization
-- =========================================================

-- Create database if it does not exist
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'truuth_portal'
   ) THEN
      CREATE DATABASE truuth_portal;
   END IF;
END $$;

-- Connect to the database
\connect truuth_portal;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Privileges
GRANT ALL PRIVILEGES ON DATABASE truuth_portal TO postgres;

-- Log success
DO $$
BEGIN
    RAISE NOTICE '✅ Truuth database initialization complete';
END $$;
