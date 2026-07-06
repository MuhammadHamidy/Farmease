# PowerShell script to clean up unused migrations and resync database with the frontend
$migrationsDir = Join-Path $PSScriptRoot "Farmease-BE/farmease/migrations"

# 1. Unused/No-op migration files to delete (their definitions are already in initial creation tables)
$unusedFiles = @(
    "20260618000020_add_ib_and_pregnancy_control.up.sql",
    "20260618000020_add_ib_and_pregnancy_control.down.sql",
    "20260618000021_add_pregnancy_control_to_tasks.up.sql",
    "20260618000021_add_pregnancy_control_to_tasks.down.sql",
    "20260630000000_add_cage_to_manures.up.sql",
    "20260630000000_add_cage_to_manures.down.sql"
)

Write-Host "Cleaning up unused migration files in Peternakan (Farmease-BE)..." -ForegroundColor Cyan
foreach ($file in $unusedFiles) {
    $filePath = Join-Path $migrationsDir $file
    if (Test-Path $filePath) {
        Write-Host "Deleting: $file" -ForegroundColor Yellow
        Remove-Item $filePath -Force
    } else {
        Write-Host "Already deleted or not found: $file" -ForegroundColor Gray
    }
}

Write-Host "`nTo ensure your database is clean and synchronized with the migrations schema:" -ForegroundColor Cyan
Write-Host "1. Reset your local Docker containers (e.g. running: docker compose down -v)" -ForegroundColor Yellow
Write-Host "2. Spin up containers and run fresh migrations: docker compose up -d" -ForegroundColor Yellow
Write-Host "3. Seed the databases: docker compose run --rm seeder" -ForegroundColor Yellow
Write-Host "`nSyncing complete!" -ForegroundColor Green
