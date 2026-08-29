#!/bin/bash
set -e

echo "🚀 Starting Engine Repair Pro..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Optionally seed database (only on first run)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  node seed.js
fi

# Start the application
echo "✅ Starting Next.js server..."
exec node_modules/.bin/next start
