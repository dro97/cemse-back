-- Database initialization script for full-express-api
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create additional databases if needed
-- CREATE DATABASE full_express_api_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE full_express_api TO postgres;

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed for full_express_api';
END $$; 