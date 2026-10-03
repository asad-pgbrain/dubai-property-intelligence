#!/bin/bash
# Start the DPI development environment

set -e

cd "$(dirname "$0")/.."

echo "🐳 Starting Docker containers..."
docker compose up -d

echo "⏳ Waiting for PostgreSQL to be healthy..."
for i in {1..30}; do
    if docker exec dpi_postgres pg_isready -U dpi_user -d dpi_dev > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    echo "   ... waiting ($i/30)"
    sleep 2
done

echo ""
echo "📊 Container status:"
docker compose ps

echo ""
echo "🎯 Next steps:"
echo "   1. Activate venv:  source .venv/bin/activate"
echo "   2. pgAdmin:        http://localhost:5050"
echo "   3. Connect to DB:  docker exec -it dpi_postgres psql -U dpi_user -d dpi_dev"
