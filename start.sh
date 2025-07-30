#!/bin/bash
set -e

# Wait for postgres
echo "Waiting for PostgreSQL to start..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL started"

# Run the migrations
echo "Running database migrations..."
python migrate_db.py
python migrate_periodos.py

# Start the FastAPI application
echo "Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port $PORT
