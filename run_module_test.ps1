# Automated Script to Run Unit Tests for a Single Module
# Usage: 
#   .\run_module_test.ps1 -Name sheep
#   .\run_module_test.ps1 -Name fertilizers -Project kebun

param (
    [Parameter(Mandatory=$true)]
    [string]$Name,

    [Parameter(Mandatory=$false)]
    [ValidateSet("ternak", "kebun", "sso")]
    [string]$Project = "ternak"
)

# Set console output encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Clear-Host
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "         FARMEASE SINGLE MODULE TEST RUNNER              " -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "  Target Module : $Name" -ForegroundColor Cyan
Write-Host "  Target Project: $Project" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Green

$rootDir = "C:\Kuliah\Semester 7\TA\Keperluan\Farmease\Ternak"
$targetDir = ""
$testPath = ""

# Memetakan direktori proyek berdasarkan parameter
if ($Project -eq "ternak") {
    $targetDir = Join-Path $rootDir "Farmease-BE/farmease"
    $testPath = "./module/$Name/usecase"
} elseif ($Project -eq "kebun") {
    $targetDir = Join-Path $rootDir "kebun-be/kebun"
    $testPath = "./module/$Name/usecase"
} elseif ($Project -eq "sso") {
    $targetDir = Join-Path $rootDir "sso-be/sso"
    $testPath = "./module/$Name/usecase"
}

# Mengecek keberadaan direktori
if (Test-Path $targetDir) {
    cd $targetDir
    $fullTestDir = Join-Path $targetDir $testPath
    
    if (Test-Path $fullTestDir) {
        Write-Host "`n[RUNNING] Menjalankan 'go test -v $testPath' pada $targetDir..." -ForegroundColor Cyan
        
        # Eksekusi go test
        go test -v $testPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n[SUCCESS] Modul '$Name' BERHASIL diuji (PASSED)!" -ForegroundColor Green
        } else {
            Write-Host "`n[FAILED] Modul '$Name' GAGAL diuji (FAILED)!" -ForegroundColor Red
        }
    } else {
        Write-Host "`nError: Modul '$Name' dengan path '$testPath' tidak ditemukan di proyek '$Project'!" -ForegroundColor Red
        Write-Host "Pastikan nama folder modul ditulis dengan benar." -ForegroundColor Yellow
    }
} else {
    Write-Host "`nError: Direktori proyek '$targetDir' tidak ditemukan!" -ForegroundColor Red
}

# Kembali ke root
cd $rootDir
Write-Host "=========================================================" -ForegroundColor Green
