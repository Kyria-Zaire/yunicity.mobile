$DATABASE_URL = "postgresql://yunicity:changeme_local@localhost:5433/yunicity"
$REDIS_URL = "redis://localhost:6379"
$AUTH_SECRET = "dev_secret_yunicity_2026_minimum_32_chars_ok"

$services = @(
  @{ name = "api-gateway";          port = 3000 },
  @{ name = "auth-service";         port = 3001 },
  @{ name = "user-service";         port = 3002 },
  @{ name = "community-service";    port = 3003 },
  @{ name = "map-service";          port = 3004 },
  @{ name = "payment-service";      port = 3005 },
  @{ name = "notification-service"; port = 3006 },
  @{ name = "moderation-service";   port = 3007 },
  @{ name = "crm-service";          port = 3008 },
  @{ name = "ai-service";           port = 3009 },
  @{ name = "worker";               port = 3010 }
)

foreach ($svc in $services) {
  $path = "services/$($svc.name)/.env.local"
  if (-not (Test-Path $path)) {
    $content = @"
NODE_ENV=development
PORT=$($svc.port)
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL
AUTH_SECRET=$AUTH_SECRET
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
COMMUNITY_SERVICE_URL=http://localhost:3003
MAP_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3006
MODERATION_SERVICE_URL=http://localhost:3007
CRM_SERVICE_URL=http://localhost:3008
AI_SERVICE_URL=http://localhost:3009
CORS_ORIGINS=http://localhost:3010,http://localhost:3020
ADMIN_API_KEY=dev_admin_key_yunicity_2026
WEB_URL=http://localhost:3010
"@
    Set-Content -Path $path -Value $content
    Write-Host "Created: $path" -ForegroundColor Green
  } else {
    Write-Host "Exists:  $path" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "Add manually to auth-service/.env.local and notification-service/.env.local:" -ForegroundColor Cyan
Write-Host "  RESEND_API_KEY=re_xxx"
Write-Host "Add manually to payment-service/.env.local:" -ForegroundColor Cyan
Write-Host "  STRIPE_SECRET_KEY=sk_test_xxx"
Write-Host "  STRIPE_WEBHOOK_SECRET=whsec_xxx"
