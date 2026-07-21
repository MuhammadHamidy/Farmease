# Script untuk Menjalankan Backend Farmease secara Lokal (Native Go)
# Didesain khusus untuk mempermudah Testing Lokal & Demonstrasi Sidang TA
# 
# Petunjuk:
# 1. Pastikan Docker Desktop aktif.
# 2. Jalankan script ini dari terminal PowerShell administrator.
# 3. Script ini akan menyalakan kontainer Database & Redis di Docker, 
#    lalu meluncurkan 3 Backend (SSO, Peternakan, Perkebunan) di jendela terminal terpisah secara native (cepat & hemat RAM).

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         MELUNCURKAN BACKEND FARMEASE SECARA LOKAL        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Pastikan Database & Redis di Docker sudah berjalan
Write-Host "[1/4] Memastikan Postgres & Redis aktif di Docker..." -ForegroundColor Yellow
docker compose up -d sso_postgres peternakan_postgres kebun_postgres sso_redis peternakan_rabbitmq sso_migrate sso_seeder peternakan_migrate peternakan_seeder kebun_migrate kebun_seeder

Write-Host "Menunggu database siap..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# 2. Menjalankan SSO Backend (Port 8080) secara Lokal
Write-Host "[2/4] Meluncurkan SSO Backend..." -ForegroundColor Yellow
$SSO_CMD = @"
`$env:APP_PORT='8080'; `
`$env:APP_POSTGRES_URL='postgres://user:pass@localhost:5435/farmease_sso?sslmode=disable'; `
`$env:APP_REDIS_ADDRESS='localhost:6381'; `
`$env:APP_REDIS_PASSWORD=''; `
`$env:APP_REDIS_DB='0'; `
`$env:APP_JWTSECRET='farmease-secret-key-123'; `
`$env:APP_REDIRECTURL='http://localhost:3000/callback'; `
`$env:APP_CORS_ALLOWED_ORIGINS='*'; `
`$env:APP_LOG_LEVEL='debug'; `
`$env:APP_LOG_FORMAT='console'; `
`$env:APP_EXPORTER='none'; `
Write-Host '=== SSO BACKEND RUNNING NATIVE ===' -ForegroundColor Green; `
go run main.go serve
"@
Start-Process powershell -WorkingDirectory "$PSScriptRoot\sso-be\sso" -ArgumentList "-NoExit", "-Command", $SSO_CMD

# 3. Menjalankan Peternakan Backend (Port 8081) secara Lokal
Write-Host "[3/4] Meluncurkan Peternakan Backend..." -ForegroundColor Yellow
$TERNAC_CMD = @"
`$env:APP_PORT='8081'; `
`$env:APP_POSTGRES_URL='postgres://user:pass@localhost:5436/farmease_peternakan?sslmode=disable'; `
`$env:APP_REDIS_ADDRESS='localhost:6381'; `
`$env:APP_REDIS_PASSWORD=''; `
`$env:APP_REDIS_DB='0'; `
`$env:APP_SSOAPIURL='http://localhost:8080'; `
`$env:APP_REDIRECTURL='http://localhost:3000/callback'; `
`$env:APP_CORS_ALLOWED_ORIGINS='*'; `
`$env:APP_LOG_LEVEL='debug'; `
`$env:APP_LOG_FORMAT='console'; `
`$env:APP_RABBITMQ_URL='amqp://guest:guest@127.0.0.1:5672/'; `
`$env:APP_EXPORTER='none'; `
Write-Host '=== PETERNAKAN BACKEND RUNNING NATIVE ===' -ForegroundColor Green; `
go run main.go serve
"@
Start-Process powershell -WorkingDirectory "$PSScriptRoot\Farmease-BE\farmease" -ArgumentList "-NoExit", "-Command", $TERNAC_CMD

# 4. Menjalankan Perkebunan Backend (Port 8082) secara Lokal
Write-Host "[4/4] Meluncurkan Perkebunan Backend..." -ForegroundColor Yellow
$KEBUN_CMD = @"
`$env:APP_PORT='8082'; `
`$env:APP_POSTGRES_URL='postgres://user:pass@localhost:5437/farmease_kebun?sslmode=disable'; `
`$env:APP_REDIS_ADDRESS='localhost:6381'; `
`$env:APP_REDIS_PASSWORD=''; `
`$env:APP_REDIS_DB='0'; `
`$env:APP_SSOAPIURL='http://localhost:8080'; `
`$env:APP_REDIRECTURL='http://localhost:3000/callback'; `
`$env:APP_CORS_ALLOWED_ORIGINS='*'; `
`$env:APP_LOG_LEVEL='debug'; `
`$env:APP_LOG_FORMAT='console'; `
`$env:APP_RABBITMQ_URL='amqp://guest:guest@127.0.0.1:5672/'; `
`$env:APP_EXPORTER='none'; `
Write-Host '=== PERKEBUNAN BACKEND RUNNING NATIVE ===' -ForegroundColor Green; `
go run main.go serve
"@
Start-Process powershell -WorkingDirectory "$PSScriptRoot\kebun-be\kebun" -ArgumentList "-NoExit", "-Command", $KEBUN_CMD

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  Backend selesai diluncurkan di jendela PowerShell baru!  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
