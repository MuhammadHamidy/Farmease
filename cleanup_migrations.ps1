# Script to clean up database migration files for SSO and Perkebunan (kebun-be) modules

# 1. Clean up SSO migrations (sso-be/sso/migrations)
# Only keep: farms, roles, accounts/users
$ssoKeep = @(
    "20260516000005_create_farms_table.up.sql",
    "20260516000005_create_farms_table.down.sql",
    "20260516000010_create_roles_table.up.sql",
    "20260516000010_create_roles_table.down.sql",
    "20260516000020_create_accounts_table.up.sql",
    "20260516000020_create_accounts_table.down.sql"
)

$ssoMigrationDir = Join-Path $PSScriptRoot "sso-be/sso/migrations"
if (Test-Path $ssoMigrationDir) {
    Write-Host "Cleaning up SSO migrations..." -ForegroundColor Cyan
    Get-ChildItem -Path $ssoMigrationDir -File | ForEach-Object {
        if ($ssoKeep -notcontains $_.Name) {
            Write-Host "Deleting non-SSO migration: $($_.Name)" -ForegroundColor Yellow
            Remove-Item $_.FullName -Force
        }
    }
} else {
    Write-Host "SSO migration directory not found: $ssoMigrationDir" -ForegroundColor Red
}

# 2. Clean up Perkebunan migrations (kebun-be/kebun/migrations)
# Only keep: lahan, aktivitas, perawatan, pemangkasan, panen, akun_lahan, jadwal_rutin, notifikasi, status_aktivitas, pohon
$kebunKeep = @(
    "20260517000003_create_lahan_table.up.sql",
    "20260517000003_create_lahan_table.down.sql",
    "20260517000005_create_aktivitas_table.up.sql",
    "20260517000005_create_aktivitas_table.down.sql",
    "20260517000006_create_perawatan_table.up.sql",
    "20260517000006_create_perawatan_table.down.sql",
    "20260517000007_create_pemangkasan_table.up.sql",
    "20260517000007_create_pemangkasan_table.down.sql",
    "20260517000008_create_panen_table.up.sql",
    "20260517000008_create_panen_table.down.sql",
    "20260517000009_create_akun_lahan_table.up.sql",
    "20260517000009_create_akun_lahan_table.down.sql",
    "20260517000010_create_jadwal_rutin_table.up.sql",
    "20260517000010_create_jadwal_rutin_table.down.sql",
    "20260517000011_create_notifikasi_table.up.sql",
    "20260517000011_create_notifikasi_table.down.sql",
    "20260517000013_create_status_aktivitas_table.up.sql",
    "20260517000013_create_status_aktivitas_table.down.sql",
    "20260517000014_create_pohon_table.up.sql",
    "20260517000014_create_pohon_table.down.sql"
)

$kebunMigrationDir = Join-Path $PSScriptRoot "kebun-be/kebun/migrations"
if (Test-Path $kebunMigrationDir) {
    Write-Host "Cleaning up Perkebunan migrations..." -ForegroundColor Cyan
    Get-ChildItem -Path $kebunMigrationDir -File | ForEach-Object {
        if ($kebunKeep -notcontains $_.Name) {
            Write-Host "Deleting non-Perkebunan migration: $($_.Name)" -ForegroundColor Yellow
            Remove-Item $_.FullName -Force
        }
    }
} else {
    Write-Host "Perkebunan migration directory not found: $kebunMigrationDir" -ForegroundColor Red
}

# 3. Clean up Peternakan migrations (Farmease-BE/farmease/migrations)
# Only keep: sheep_types, cages, sheep, weights_healths, breedings, feeds, manures, routine_schedules, tasks, notifications, cleanup_duplicate_schedules
$ternakKeep = @(
    "20260516000030_create_sheep_types_table.up.sql",
    "20260516000030_create_sheep_types_table.down.sql",
    "20260516000040_create_cages_table.up.sql",
    "20260516000040_create_cages_table.down.sql",
    "20260516000050_create_sheep_table.up.sql",
    "20260516000050_create_sheep_table.down.sql",
    "20260516000060_create_weights_healths_tables.up.sql",
    "20260516000060_create_weights_healths_tables.down.sql",
    "20260516000070_create_breedings_table.up.sql",
    "20260516000070_create_breedings_table.down.sql",
    "20260516000080_create_feeds_table.up.sql",
    "20260516000080_create_feeds_table.down.sql",
    "20260516000090_create_manures_table.up.sql",
    "20260516000090_create_manures_table.down.sql",
    "20260516000095_create_routine_schedules_table.up.sql",
    "20260516000095_create_routine_schedules_table.down.sql",
    "20260516000100_create_tasks_table.up.sql",
    "20260516000100_create_tasks_table.down.sql",
    "20260516000110_create_notifications_table.up.sql",
    "20260516000110_create_notifications_table.down.sql",
    "20260614000001_cleanup_duplicate_schedules.up.sql",
    "20260614000001_cleanup_duplicate_schedules.down.sql"
)

$ternakMigrationDir = Join-Path $PSScriptRoot "Farmease-BE/farmease/migrations"
if (Test-Path $ternakMigrationDir) {
    Write-Host "Cleaning up Peternakan migrations..." -ForegroundColor Cyan
    Get-ChildItem -Path $ternakMigrationDir -File | ForEach-Object {
        if ($ternakKeep -notcontains $_.Name) {
            Write-Host "Deleting non-Peternakan migration: $($_.Name)" -ForegroundColor Yellow
            Remove-Item $_.FullName -Force
        }
    }
} else {
    Write-Host "Peternakan migration directory not found: $ternakMigrationDir" -ForegroundColor Red
}

# 4. Clean up Unused Frontend Modules (SSO module in sub-portals, Admin module in SSO portal)
Write-Host "Cleaning up unused frontend module directories..." -ForegroundColor Cyan

$deadFolders = @(
    "Farmease/src/modules/sso",
    "Farmease_kebun/src/modules/sso",
    "Farmease_sso/src/modules/admin"
)

foreach ($folder in $deadFolders) {
    $targetDir = Join-Path $PSScriptRoot $folder
    if (Test-Path $targetDir) {
        Write-Host "Deleting unused folder: $folder" -ForegroundColor Yellow
        Remove-Item $targetDir -Recurse -Force
    } else {
        Write-Host "Folder already deleted or not found: $folder" -ForegroundColor Gray
    }
}

Write-Host "Cleanup completed successfully!" -ForegroundColor Green
