# Set console output encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Clear-Host
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "             FARMEASE KEBUN BACKEND TEST RUNNER           " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

# Definisi modul usecase backend perkebunan lengkap (21 Modul + Libraries)
$modules = @(
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "AktivitasService (Aktivitas)"; Path = "./module/aktivitas/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "AkunLahanService (Akun Lahan)"; Path = "./module/akun_lahan/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "FermentasiService (Fermentasi)"; Path = "./module/fermentasi/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "FertilizerService (Fertilizers)"; Path = "./module/fertilizers/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "LahanService (Lahan)"; Path = "./module/lahan/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "NotificationService (Notifications)"; Path = "./module/notifications/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "PanenService (Panen)"; Path = "./module/panen/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "PemangkasanService (Pemangkasan)"; Path = "./module/pemangkasan/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "PembersihanService (Pembersihan)"; Path = "./module/pembersihan/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "PembuahanService (Pembuahan)"; Path = "./module/pembuahan/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "PemupukanService (Pemupukan)"; Path = "./module/pemupukan/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "PenanamanService (Penanaman)"; Path = "./module/penanaman/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "PencatatanTypesService (Pencatatan Types)"; Path = "./module/pencatatan_types/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "PengobatanService (Pengobatan)"; Path = "./module/pengobatan/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "PenyiramanService (Penyiraman)"; Path = "./module/penyiraman/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "PerawatanService (Perawatan)"; Path = "./module/perawatan/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "PohonService (Pohon)"; Path = "./module/pohon/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "RoutineScheduleService (RoutineSchedules)"; Path = "./module/routine_schedules/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "StokService (Stok)"; Path = "./module/stok/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "SubmissionsService (Submissions)"; Path = "./module/submissions/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be/kebun"; Name = "TaskService (Tasks)"; Path = "./module/tasks/usecase" },
    [PSCustomObject]@{ Project = "Kebun-BE"; Dir = "kebun-be"; Name = "ObjectLibrary (Parser)"; Path = "./libraries/object" }
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
    Write-Host "  Semua modul backend perkebunan berhasil diuji dengan kelulusan 100%!" -ForegroundColor Green
}
Write-Host "=========================================================" -ForegroundColor Green
