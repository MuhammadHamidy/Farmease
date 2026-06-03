#!/bin/bash

set -e

echo "Farmease Database Initialization Script"
echo "========================================"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h localhost -U ${POSTGRES_USER} -d ${POSTGRES_DB}; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is ready!"

# Database is already created by PostgreSQL service
# Just initialize schema and seed data if needed

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Check if tables already exist to avoid duplicate errors
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' 
        AND table_name = 'roles'
    ) AS tables_exist;
EOSQL

echo "Database initialization complete!"
echo "Note: Migrations and seeders should be run after the backend starts."
echo "See DOCKER_SETUP.md for detailed instructions."
