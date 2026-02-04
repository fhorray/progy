# Run Current Exercise
# Usage: .\scripts\run-current.ps1

$progressFile = Join-Path $PSScriptRoot "..\PROGRESS.md"

if (-not (Test-Path $progressFile)) {
    Write-Host "❌ PROGRESS.md not found!" -ForegroundColor Red
    exit 1
}

$content = Get-Content $progressFile -Raw

# Extract exercise from Active Session JSON block
if ($content -match '"exercise":\s*"([^"]+)"') {
    $exercise = $matches[1]
    
    if ($exercise -and $exercise -ne "null") {
        Write-Host "🦀 Running exercise: $exercise" -ForegroundColor Cyan
        Write-Host ""
        cargo run --bin $exercise
        exit $LASTEXITCODE
    }
}

# Fallback: check Current Exercise field
if ($content -match 'Current Exercise\*\*:\s*(\w+)') {
    $exercise = $matches[1]
    Write-Host "🦀 Running exercise: $exercise" -ForegroundColor Cyan
    Write-Host ""
    cargo run --bin $exercise
    exit $LASTEXITCODE
}

Write-Host "⚠️ No active exercise found." -ForegroundColor Yellow
Write-Host "Start an exercise first with /start <exercise> or /next" -ForegroundColor Gray
exit 1
