#!/usr/bin/env bash
set -Eeuo pipefail

# This script runs only during the official PostgreSQL image's first initialization
# of an empty data directory. It creates a non-superuser role for the API/migrations.
APP_DB_PASSWORD="$(cat /run/secrets/app_db_password)"
export APP_DB_PASSWORD

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set=ON_ERROR_STOP=1 <<'SQL'
\getenv app_password APP_DB_PASSWORD
\getenv db_name POSTGRES_DB
CREATE ROLE notesapp LOGIN PASSWORD :'app_password';
GRANT CONNECT ON DATABASE :"db_name" TO notesapp;
GRANT USAGE, CREATE ON SCHEMA public TO notesapp;
SQL

unset APP_DB_PASSWORD
