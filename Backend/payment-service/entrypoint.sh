#!/bin/sh

# Wait for the PostgreSQL database to be ready
# In EKS, DB_HOST will be your RDS endpoint or the Kubernetes Service name for a DB
# (but almost always RDS endpoint for production).
echo "Waiting for PostgreSQL to start..."
while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "PostgreSQL not ready yet, waiting..."
  sleep 2
done
echo "PostgreSQL is up and running!"

# Apply database migrations
echo "Applying database migrations..."
python3 manage.py migrate --noinput
echo "Migrations applied."

# Execute the main container command (e.g., Gunicorn)
exec "$@"