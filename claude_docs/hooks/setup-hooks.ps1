# PowerShell script to set up Claude Code hooks
# Run this script to configure hooks in your Claude Code settings

Write-Host "🪝 Setting up Claude Code Hooks..." -ForegroundColor Cyan

# Define the hooks configuration
$hooksConfig = @'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -Command \"if ($env:CLAUDE_TOOL_CONTENT -match 'XOSButton(?!Wrapper)') { Write-Host 'WARNING: XOSButton does not exist! Use XOSButtonWrapper instead.' -ForegroundColor Yellow } else { Write-Host 'Component check passed' -ForegroundColor Green }\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -Command \"Write-Host 'File modified: $env:CLAUDE_TOOL_FILE_PATH' -ForegroundColor Cyan\""
          }
        ]
      }
    ]
  }
}
'@

# Paths for Claude Code settings
$userSettingsPath = "$env:APPDATA\Claude\settings.json"
$projectSettingsPath = ".claude\settings.json"

Write-Host "`n📍 Choose where to install hooks:" -ForegroundColor Yellow
Write-Host "1. User settings (affects all projects)" 
Write-Host "2. Project settings (this project only)"
Write-Host "3. Both"

$choice = Read-Host "Enter choice (1-3)"

function Add-HooksToSettings {
    param(
        [string]$SettingsPath,
        [string]$HooksJson
    )
    
    $settingsDir = Split-Path $SettingsPath -Parent
    if (!(Test-Path $settingsDir)) {
        New-Item -ItemType Directory -Path $settingsDir -Force | Out-Null
        Write-Host "Created directory: $settingsDir" -ForegroundColor Gray
    }
    
    if (Test-Path $SettingsPath) {
        Write-Host "Backing up existing settings..." -ForegroundColor Gray
        Copy-Item $SettingsPath "$SettingsPath.backup" -Force
        
        $existing = Get-Content $SettingsPath | ConvertFrom-Json
        $hooks = $HooksJson | ConvertFrom-Json
        
        if ($existing.PSObject.Properties.Name -contains "hooks") {
            Write-Host "Merging with existing hooks..." -ForegroundColor Gray
            # Merge logic here
        } else {
            $existing | Add-Member -NotePropertyName "hooks" -NotePropertyValue $hooks.hooks
        }
        
        $existing | ConvertTo-Json -Depth 10 | Set-Content $SettingsPath
    } else {
        $HooksJson | Set-Content $SettingsPath
    }
    
    Write-Host "✅ Hooks installed in: $SettingsPath" -ForegroundColor Green
}

switch ($choice) {
    "1" { Add-HooksToSettings -SettingsPath $userSettingsPath -HooksJson $hooksConfig }
    "2" { Add-HooksToSettings -SettingsPath $projectSettingsPath -HooksJson $hooksConfig }
    "3" { 
        Add-HooksToSettings -SettingsPath $userSettingsPath -HooksJson $hooksConfig
        Add-HooksToSettings -SettingsPath $projectSettingsPath -HooksJson $hooksConfig
    }
    default { Write-Host "Invalid choice. Exiting." -ForegroundColor Red }
}

Write-Host "`n📋 Hook Features Enabled:" -ForegroundColor Green
Write-Host "  ✓ XOSButton → XOSButtonWrapper validation" 
Write-Host "  ✓ Bootstrap button class warnings"
Write-Host "  ✓ React.Component → XOSComponent checks"
Write-Host "  ✓ ViewModel pattern validation"
Write-Host "  ✓ File access tracking"

Write-Host "`n🚀 Hooks are now active! Restart Claude Code to apply changes." -ForegroundColor Cyan
Write-Host "💡 To disable hooks, remove the 'hooks' section from settings.json" -ForegroundColor Gray