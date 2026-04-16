Write-Host "Yunicity Dev - Starting infrastructure..." -ForegroundColor Blue

# 1. Start PostgreSQL + Redis
Write-Host "Starting PostgreSQL + Redis..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yml up -d

# 2. Wait for PostgreSQL
Write-Host "Waiting for PostgreSQL..." -ForegroundColor Yellow
$retries = 0
do {
  Start-Sleep -Seconds 2
  $retries++
  $result = docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U yunicity 2>&1
} while ($LASTEXITCODE -ne 0 -and $retries -lt 15)

if ($LASTEXITCODE -ne 0) {
  Write-Host "PostgreSQL failed to start!" -ForegroundColor Red
  exit 1
}

# 3. Prisma migrate
Write-Host "Running Prisma migrations..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://yunicity:changeme_local@localhost:5433/yunicity"
npx prisma migrate deploy --schema packages/database/prisma/schema.prisma

# 4. Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
pnpm --filter @yunicity/database generate

Write-Host ""
Write-Host "Infrastructure ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Start services in separate terminals:" -ForegroundColor Cyan
Write-Host "  pnpm --filter @yunicity/api-gateway dev"
Write-Host "  pnpm --filter @yunicity/auth-service dev"
Write-Host "  pnpm --filter @yunicity/user-service dev"
Write-Host "  pnpm --filter @yunicity/web dev"
Write-Host ""
Write-Host "Test: curl http://localhost:3000/health" -ForegroundColor Cyan
