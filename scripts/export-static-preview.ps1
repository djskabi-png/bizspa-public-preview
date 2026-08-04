param(
    [string]$SourceProject = '',
    [string]$BaseUrl = 'http://127.0.0.1:8789',
    [string]$PhpExe = 'C:\Users\Adir\AppData\Local\Temp\bizspa-php74-test\php.exe'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$publicRoot = Join-Path $projectRoot 'public'
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

$banner = @'
<div class="bizspa-preview-notice" role="status">&#1514;&#1510;&#1493;&#1490;&#1492; &#1502;&#1493;&#1511;&#1491;&#1502;&#1514; &#1513;&#1500; &#1492;&#1488;&#1514;&#1512; &#1492;&#1495;&#1491;&#1513;. &#1492;&#1496;&#1508;&#1505;&#1497;&#1501; &#1488;&#1497;&#1504;&#1501; &#1508;&#1506;&#1497;&#1500;&#1497;&#1501; &#1489;&#1513;&#1500;&#1489; &#1494;&#1492;.</div>
<style>.bizspa-preview-notice{position:relative;z-index:9999;padding:9px 16px;background:#143f43;color:#fff;text-align:center;font:600 14px/1.5 Heebo,Assistant,Arial,sans-serif}.bizspa-preview-notice+*{scroll-margin-top:42px}</style>
'@

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
    $html = $html -replace '(?i)(<body[^>]*>)', ('$1' + $banner)
    $html = $html -replace '(?i)<button([^>]*type=["'']submit["''][^>]*)>', '<button$1 disabled aria-disabled="true">'

    $relative = $path.Trim('/')
    $destinationDirectory = Join-Path $publicRoot ($relative -replace '/', '\')
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    [IO.File]::WriteAllText((Join-Path $destinationDirectory 'index.html'), $html, [Text.UTF8Encoding]::new($false))
}

Copy-Item -LiteralPath (Join-Path $sourceSite 'assets') -Destination (Join-Path $publicRoot 'assets') -Recurse
[IO.File]::WriteAllText((Join-Path $publicRoot 'robots.txt'), "User-agent: *`nDisallow: /`n", [Text.UTF8Encoding]::new($false))

[pscustomobject]@{
    pages = $routes.Count
    assets = @(Get-ChildItem -LiteralPath (Join-Path $publicRoot 'assets') -Recurse -File).Count
    output = $publicRoot
} | ConvertTo-Json -Compress
