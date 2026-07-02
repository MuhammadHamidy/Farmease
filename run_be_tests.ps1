# Farmease & SSO Backend Unit Test Runner Automation Script
# Menjalankan pengujian unit Go untuk setiap service module secara terstruktur

Clear-Host
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "       FARMEASE & SSO BACKEND MODULE TEST RUNNER         " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

# Definisi modul usecase backend peternakan dan SSO
$modules = @(
    [PSCustomObject]@{ Project = "SSO-BE"; Dir = "sso-be/sso"; Name = "AuthService (Users)"; Path = "./module/users/usecase" },
    [PSCustomObject]@{ Project = "SSO-BE"; Dir = "sso-be/sso"; Name = "AuthService (Roles)"; Path = "./module/roles/usecase" },
    [PSCustomObject]@{ Project = "Ternak-BE"; Dir = "Farmease-BE/farmease"; Name = "TernakService (Sheep)"; Path = "./module/sheep/usecase" },
    [PSCustomObject]@{ Project = "Ternak-BE"; Dir = "Farmease-BE/farmease"; Name = "BreedingService (Breedings)"; Path = "./module/breedings/usecase" },
    [PSCustomObject]@{ Project = "Ternak-BE"; Dir = "Farmease-BE/farmease"; Name = "PakanService (Feeds)"; Path = "./module/feeds/usecase" },
    [PSCustomObject]@{ Project = "Ternak-BE"; Dir = "Farmease-BE/farmease"; Name = "KesehatanService (Healths)"; Path = "./module/healths/usecase" },
    [PSCustomObject]@{ Project = "Ternak-BE"; Dir = "Farmease-BE/farmease"; Name = "KotoranService (Manures)"; Path = "./module/manures/usecase" },
    [PSCustomObject]@{ Project = "Ternak-BE"; Dir = "Farmease-BE/farmease"; Name = "ValidasiService (Submissions)"; Path = "./module/submissions/usecase" },
    [PSCustomObject]@{ Project = "Ternak-BE"; Dir = "Farmease-BE/farmease"; Name = "DashboardService (Farms)"; Path = "./module/farms/usecase" },
    [PSCustomObject]@{ Project = "Ternak-BE"; Dir = "Farmease-BE/farmease"; Name = "DashboardService (Cages)"; Path = "./module/cages/usecase" },
    [PSCustomObject]@{ Project = "Ternak-BE"; Dir = "Farmease-BE/farmease"; Name = "Pencatatan Bobot (Weights)"; Path = "./module/weights/usecase" },
    [PSCustomObject]@{ Project = "Ternak-BE"; Dir = "Farmease-BE/farmease"; Name = "Fermentasi Silase (Fermentations)"; Path = "./module/fermentations/usecase" },
    [PSCustomObject]@{ Project = "Ternak-BE"; Dir = "Farmease-BE/farmease"; Name = "Jadwal Rutin (RoutineSchedules)"; Path = "./module/routine_schedules/usecase" }
)

$rootDir = "C:\Kuliah\Semester 7\TA\Keperluan\Farmease\Ternak"
$passed = 0
$failed = 0
$failedList = @()

foreach ($mod in $modules) {
    $targetDir = Join-Path $rootDir $mod.Dir
    if (Test-Path $targetDir) {
        cd $targetDir
        Write-Host "`n[RUNNING] [$($mod.Project)] Uji Unit: $($mod.Name) pada path $($mod.Path)..." -ForegroundColor Cyan
        
        # Menjalankan go test
        go test -v $mod.Path
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] PASSED: $($mod.Name)" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "[FAILED] FAILED: $($mod.Name)" -ForegroundColor Red
            $failed++
            $failedList += "$($mod.Project) - $($mod.Name)"
        }
    } else {
        Write-Host "Error: Direktori $($targetDir) tidak ditemukan!" -ForegroundColor Red
        $failed++
        $failedList += "Missing: $($mod.Name) ($($mod.Dir))"
    }
}

# Kembali ke root dir
cd $rootDir

Write-Host "`n=========================================================" -ForegroundColor Green
Write-Host "                RINGKASAN HASIL PENGUJIAN                " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "  Total Modul Lulus (PASSED) : $passed" -ForegroundColor Green

if ($failed -gt 0) {
    Write-Host "  Total Modul Gagal (FAILED) : $failed" -ForegroundColor Red
    Write-Host "  Modul yang Gagal:" -ForegroundColor Red
    foreach ($f in $failedList) {
        Write-Host "   - $f" -ForegroundColor Red
    }
} else {
    Write-Host "  Semua modul backend berhasil diuji dengan kelulusan 100%!" -ForegroundColor Green
}
Write-Host "=========================================================" -ForegroundColor Green
