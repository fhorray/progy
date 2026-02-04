<#
.SYNOPSIS
    Rust Learning - Test and Advance Script
.DESCRIPTION
    Tests the current exercise. If tests pass, shows success message.
.USAGE
    .\test.ps1              # Tests current active exercise
    .\test.ps1 variables1   # Tests specific exercise
#>

param(
    [string]$Exercise
)

$ProgressFile = "PROGRESS.md"

# Get current exercise from PROGRESS.md if not specified
if (-not $Exercise) {
    if (Test-Path $ProgressFile) {
        $content = Get-Content $ProgressFile -Raw
        if ($content -match '"exercise":\s*"([^"]+)"') {
            $Exercise = $Matches[1]
        }
    }
    
    if (-not $Exercise -or $Exercise -eq "null") {
        Write-Host "❌ No active exercise found. Specify one: .\test.ps1 <exercise_name>" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🧪 Testing $Exercise..." -ForegroundColor Cyan

# Run the test
cargo run -- test $Exercise

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Remove '// I AM NOT DONE' from the file"
    Write-Host "   2. Run /next in Antigravity to get the next exercise"
    Write-Host "   (or just ask the AI to create the next one)"
} else {
    Write-Host ""
    Write-Host "❌ Tests failed. Fix the errors above." -ForegroundColor Red
    Write-Host "💡 Need help? Run /hint in Antigravity" -ForegroundColor Yellow
}
