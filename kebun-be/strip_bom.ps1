$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
Get-ChildItem -Path . -Recurse -Include *.go,*.mod | ForEach-Object {
    $file = $_.FullName
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    if ($content.StartsWith([char]0xfeff)) {
        $content = $content.Substring(1)
    }
    [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
    Write-Host "BOM stripped: $file"
}
