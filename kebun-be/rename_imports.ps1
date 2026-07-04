$replacements = @{
    "github.com/farmease/farmease-be/farmease" = "github.com/farmease/kebun-be/kebun"
    "github.com/farmease/farmease-be/framework" = "github.com/farmease/kebun-be/framework"
    "github.com/farmease/farmease-be/libraries" = "github.com/farmease/kebun-be/libraries"
}

Get-ChildItem -Path . -Recurse -Include *.go,*.mod | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content -Path $file -Raw
    $changed = $false
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        if ($content.Contains($old)) {
            $content = $content.Replace($old, $new)
            $changed = $true
        }
    }
    if ($changed) {
        Set-Content -Path $file -Value $content -Encoding utf8
        Write-Host "Updated: $file"
    }
}
