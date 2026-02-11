-- Initialization script for CineAPI PostgreSQL database
-- This script runs when the PostgreSQL container is first created

-- Create extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS cineapi_schema;

-- Set search path
-- SET search_path TO cineapi_schema, public;

-- You can add any additional initialization SQL here
-- For example, creating additional users or setting permissions

-- Example: Create a read-only user for reporting
-- CREATE USER readonly WITH PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE cineapi TO readonly;
-- GRANT USAGE ON SCHEMA public TO readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;