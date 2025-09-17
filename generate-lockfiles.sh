#!/bin/bash
set -e

# Lista dei microservizi Prisma
services=("user-service" "course-service" "booking-service" "payment-service")

for svc in "${services[@]}"; do
  echo "📦 Generazione package-lock.json per $svc ..."
  cd "$svc"
  npm install --package-lock-only
  cd ..
done

echo "✅ Tutti i package-lock.json generati con successo!"
