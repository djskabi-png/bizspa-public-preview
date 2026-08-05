param(
    [string]$SourceProject = '',
    [string]$BaseUrl = 'http://127.0.0.1:8789',
    [string]$PhpExe = 'C:\Users\Adir\AppData\Local\Temp\bizspa-php74-test\php.exe'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$publicRoot = Join-Path $projectRoot 'docs'
$customDomain = 'bizonline.spaplus.co'
if ($SourceProject -eq '') {
    $SourceProject = Join-Path (Split-Path -Parent $projectRoot) 'bizspa-site-rebuild'
}
$sourceSite = Join-Path $SourceProject 'site'

$resolvedProject = (Resolve-Path -LiteralPath $projectRoot).Path
$resolvedPublicParent = (Resolve-Path -LiteralPath (Split-Path -Parent $publicRoot)).Path
if (-not $resolvedProject.Equals($resolvedPublicParent, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Preview output path is outside the preview project.'
}

if (Test-Path -LiteralPath $publicRoot) {
    Remove-Item -LiteralPath $publicRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $publicRoot | Out-Null

$routeJson = & $PhpExe (Join-Path $sourceSite 'scripts\export_routes.php')
if ($LASTEXITCODE -ne 0) { throw 'Could not export the BizSpa route manifest.' }
$parsedRoutes = ConvertFrom-Json -InputObject ($routeJson -join [Environment]::NewLine)
$routes = @()
foreach ($parsedRoute in $parsedRoutes) {
    $routes += $parsedRoute
}

foreach ($route in $routes) {
    $path = [string] $route.path
    try {
        $response = Invoke-WebRequest -Uri ($BaseUrl.TrimEnd('/') + $path) -UseBasicParsing -TimeoutSec 30
    } catch {
        throw "Preview export request failed for ${path}: $($_.Exception.Message)"
    }
    if ($response.StatusCode -ne 200) { throw "Unexpected status for ${path}: $($response.StatusCode)" }
    $html = [string] $response.Content
    if ($html -notmatch '(?i)<meta\s+name=["'']robots["'']') {
        $html = $html -replace '(?i)</head>', '<meta name="robots" content="noindex, nofollow"></head>'
    } else {
        $html = $html -replace '(?i)<meta\s+name=["'']robots["''][^>]*>', '<meta name="robots" content="noindex, nofollow">'
    }
    $html = $html -replace '(?i)<button([^>]*type=["'']submit["''][^>]*)>', '<button$1 disabled aria-disabled="true">'

    $relative = $path.Trim('/')
    $destinationDirectory = Join-Path $publicRoot ($relative -replace '/', '\')
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    [IO.File]::WriteAllText((Join-Path $destinationDirectory 'index.html'), $html, [Text.UTF8Encoding]::new($false))
}

Copy-Item -LiteralPath (Join-Path $sourceSite 'assets') -Destination (Join-Path $publicRoot 'assets') -Recurse
[IO.File]::WriteAllText((Join-Path $publicRoot 'robots.txt'), "User-agent: *`nDisallow: /`n", [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $publicRoot '.nojekyll'), '', [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $publicRoot 'CNAME'), $customDomain + "`n", [Text.UTF8Encoding]::new($false))
$rootDocument = '<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><meta name="viewport" content="width=device-width, initial-scale=1"><title>BIZonline</title><meta http-equiv="refresh" content="0; url=/he/"><link rel="canonical" href="https://' + $customDomain + '/he/"></head><body><p><a href="/he/">BIZonline</a></p></body></html>'
[IO.File]::WriteAllText((Join-Path $publicRoot 'index.html'), $rootDocument, [Text.UTF8Encoding]::new($false))

[pscustomobject]@{
    pages = $routes.Count
    assets = @(Get-ChildItem -LiteralPath (Join-Path $publicRoot 'assets') -Recurse -File).Count
    output = $publicRoot
} | ConvertTo-Json -Compress
