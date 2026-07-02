# Script to regenerate Swagger docs and update Postman Collection
$ErrorActionPreference = "Stop"

$FarmeaseDir = "c:\Kuliah\Semester 7\TA\Keperluan\Farmease\Ternak\Farmease-BE\farmease"
$DocsDir = "c:\Kuliah\Semester 7\TA\Keperluan\Farmease\Ternak\Farmease-BE\farmease\docs"

Write-Host "1. Generating Swagger Docs..." -ForegroundColor Cyan
Set-Location -Path $FarmeaseDir
swag init -g cmd/serve.go --output docs --parseDependency --parseInternal

Write-Host "2. Converting Swagger to Postman Collection..." -ForegroundColor Cyan
# Using npx to run openapi-to-postmanv2 without global install
npx openapi-to-postmanv2 -s docs/swagger.json -o "$DocsDir\postman_collection.json" -p Omit

Write-Host "3. Injecting Bearer Token & Auto-Login script..." -ForegroundColor Cyan
node fix_postman.js

Write-Host "✅ Selesai! Swagger dan Postman Collection berhasil diperbarui dan disesuaikan." -ForegroundColor Green
Write-Host "File Postman tersimpan di: $DocsDir\postman_collection.json" -ForegroundColor Yellow
