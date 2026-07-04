$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# 1. Restore .go files (ackage -> package)
Get-ChildItem -Path . -Recurse -Include *.go | ForEach-Object {
    $file = $_.FullName
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    if ($content.StartsWith("ackage ")) {
        $content = "p" + $content
        [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
        Write-Host "Restored package: $file"
    }
}

# 2. Restore .go files with single-line comment headers (/ -> //)
Get-ChildItem -Path . -Recurse -Include *.go | ForEach-Object {
    $file = $_.FullName
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    if ($content.StartsWith("/") -and -not $content.StartsWith("//")) {
        $content = "/" + $content
        [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
        Write-Host "Restored single comment: $file"
    }
}

# 3. Restore .go files with multi-line comment headers (* -> /*)
Get-ChildItem -Path . -Recurse -Include *.go | ForEach-Object {
    $file = $_.FullName
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    if ($content.StartsWith("*")) {
        $content = "/" + $content
        [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
        Write-Host "Restored multi comment: $file"
    }
}

# 4. Restore .mod files (odule -> module)
Get-ChildItem -Path . -Recurse -Include *.mod | ForEach-Object {
    $file = $_.FullName
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    if ($content.StartsWith("odule ")) {
        $content = "m" + $content
        [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
        Write-Host "Restored Mod: $file"
    }
}
