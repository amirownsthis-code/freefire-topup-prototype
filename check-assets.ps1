$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$sourceFiles = Get-ChildItem -LiteralPath $projectRoot -File |
    Where-Object { $_.Extension -in @('.html', '.css', '.js') }

if (-not $sourceFiles) {
    Write-Error 'No HTML, CSS, or JavaScript files found beside this script.'
    exit 1
}

$required = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::Ordinal)
$pattern = 'images/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp|avif|gif|svg)'
foreach ($source in $sourceFiles) {
    $text = Get-Content -LiteralPath $source.FullName -Raw -Encoding UTF8
    foreach ($match in [regex]::Matches($text, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
        [void]$required.Add($match.Value)
    }
}

if ($required.Count -eq 0) {
    Write-Error 'No static images/ references were detected. Check the project files.'
    exit 1
}

$actual = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::Ordinal)
$imagesPath = Join-Path $projectRoot 'images'
if (Test-Path -LiteralPath $imagesPath -PathType Container) {
    foreach ($file in (Get-ChildItem -LiteralPath $imagesPath -Recurse -File)) {
        $relative = $file.FullName.Substring($projectRoot.Length).TrimStart([char[]]'\/').Replace('\', '/')
        [void]$actual.Add($relative)
    }
}

$missing = @($required | Where-Object { -not $actual.Contains($_) } | Sort-Object)
if ($missing.Count -gt 0) {
    Write-Host 'Missing image paths or capitalization mismatches:' -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  $_" }
    exit 1
}

Write-Host "All $($required.Count) statically referenced image paths match, including capitalization." -ForegroundColor Green
Write-Host 'Filename check only: verify visual rendering and page interactions in your browser.'
exit 0
