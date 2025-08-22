# Wrapper script for backward compatibility
# Calls the main script in claude_docs/automation/

$scriptPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "claude_docs\automation\check-docs-updates.ps1"

if (Test-Path $scriptPath) {
    & $scriptPath @args
} else {
    Write-Host "Error: Main script not found at $scriptPath" -ForegroundColor Red
    Write-Host "Make sure claude_docs/automation/check-docs-updates.ps1 exists" -ForegroundColor Yellow
}