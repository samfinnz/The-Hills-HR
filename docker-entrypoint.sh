#!/bin/sh
set -e

echo "[entrypoint] Applying Prisma schema to the database (db push)..."
npx prisma db push --skip-generate

# Seed only when the employee table is empty
EMP_COUNT=$(node -e "const p=new (require('@prisma/client').PrismaClient)();p.employee.count().then(n=>{console.log(n);process.exit(0)}).catch(e=>{console.error(e);process.exit(1)})" 2>/dev/null || echo "0")
if [ "$EMP_COUNT" = "0" ]; then
  echo "[entrypoint] Empty employee table — running seed..."
  npx ts-node prisma/seed.ts || echo "[entrypoint] seed failed (non-fatal); continuing"
else
  echo "[entrypoint] $EMP_COUNT employees already present; skipping seed"
fi

echo "[entrypoint] Starting HR Project API..."
exec node dist/main.js
