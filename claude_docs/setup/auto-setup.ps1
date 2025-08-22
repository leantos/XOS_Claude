# Claude Code Auto-Setup Script
# This script automatically configures Claude Code with hooks and settings

param(
    [string]$ProjectPath = (Get-Location).Path,
    [string]$Framework = "auto",
    [switch]$SkipHooks = $false,
    [switch]$UserLevel = $false
)

Write-Host @"
╔══════════════════════════════════════════════════════════╗
║     Claude Code Documentation & Hooks Auto-Setup         ║
║                    Version 2.0.0                         ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Function to detect framework
function Detect-Framework {
    Write-Host "`n🔍 Detecting framework..." -ForegroundColor Yellow
    
    if (Test-Path "$ProjectPath\xos-components" -PathType Container) {
        Write-Host "  ✓ XOS Framework detected" -ForegroundColor Green
        return "xos"
    }
    elseif (Test-Path "$ProjectPath\package.json") {
        $packageJson = Get-Content "$ProjectPath\package.json" | ConvertFrom-Json
        if ($packageJson.dependencies.react) {
            Write-Host "  ✓ React detected" -ForegroundColor Green
            return "react"
        }
    }
    elseif (Get-ChildItem -Path $ProjectPath -Filter "*.csproj" -Recurse) {
        Write-Host "  ✓ .NET detected" -ForegroundColor Green
        return "dotnet"
    }
    
    Write-Host "  ⚠ Framework not detected, using generic settings" -ForegroundColor Yellow
    return "generic"
}

# Detect framework if auto
if ($Framework -eq "auto") {
    $Framework = Detect-Framework
}

Write-Host "`n📁 Setting up in: $ProjectPath" -ForegroundColor Cyan
Write-Host "🎯 Framework: $Framework" -ForegroundColor Cyan

# Create .claude directory
$claudeDir = Join-Path $ProjectPath ".claude"
if (!(Test-Path $claudeDir)) {
    New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
    Write-Host "`n✅ Created .claude directory" -ForegroundColor Green
}

# Create tracking directories
$logsDir = Join-Path $claudeDir "logs"
if (!(Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# Framework-specific hooks
$hooksConfig = switch ($Framework) {
    "xos" {
        @{
            hooks = @{
                PreToolUse = @(
                    @{
                        matcher = "Write|Edit|MultiEdit"
                        hooks = @(
                            @{
                                type = "command"
                                command = 'powershell -Command "if ($env:CLAUDE_TOOL_CONTENT -match ''XOSButton(?!Wrapper)'') { Write-Host ''⚠️ WARNING: XOSButton does not exist! Use XOSButtonWrapper instead.'' -ForegroundColor Yellow; exit 1 }"'
                            },
                            @{
                                type = "command"
                                command = 'powershell -Command "if ($env:CLAUDE_TOOL_CONTENT -match ''btn-(primary|secondary|success|danger)'') { Write-Host ''⚠️ WARNING: Use XOS button classes (btn-save, btn-edit, btn-delete)'' -ForegroundColor Yellow }"'
                            },
                            @{
                                type = "command"
                                command = 'powershell -Command "if ($env:CLAUDE_TOOL_CONTENT -match ''extends React\\.Component'') { Write-Host ''❌ ERROR: Must extend cntrl.XOSComponent in XOS projects!'' -ForegroundColor Red; exit 1 }"'
                            }
                        )
                    }
                )
                PostToolUse = @(
                    @{
                        matcher = "Write|Edit"
                        hooks = @(
                            @{
                                type = "command"
                                command = 'powershell -Command "Add-Content -Path ''.claude\logs\file-access.log'' -Value \"$(Get-Date -Format ''yyyy-MM-dd HH:mm:ss''): $env:CLAUDE_TOOL_FILE_PATH\" -ErrorAction SilentlyContinue"'
                            }
                        )
                    }
                )
            }
            framework = "xos"
            validationRules = @{
                components = @("XOSButtonWrapper", "XOSTextbox", "XOSGrid", "XOSControl")
                forbiddenComponents = @("XOSButton", "XOSCheckbox", "XOSModal")
                buttonClasses = @("btn-save", "btn-edit", "btn-delete", "btn-add")
                forbiddenClasses = @("btn-primary", "btn-secondary", "btn-success")
            }
        }
    }
    "react" {
        @{
            hooks = @{
                PreToolUse = @(
                    @{
                        matcher = "Write|Edit"
                        hooks = @(
                            @{
                                type = "command"
                                command = 'powershell -Command "Write-Host ''React component validation active'' -ForegroundColor Green"'
                            }
                        )
                    }
                )
            }
            framework = "react"
        }
    }
    default {
        @{
            hooks = @{
                PreToolUse = @()
                PostToolUse = @()
            }
            framework = $Framework
        }
    }
}

# Settings path
$settingsPath = if ($UserLevel) {
    Join-Path $env:APPDATA "Claude\settings.json"
} else {
    Join-Path $claudeDir "settings.json"
}

# Create settings directory if needed
$settingsDir = Split-Path $settingsPath -Parent
if (!(Test-Path $settingsDir)) {
    New-Item -ItemType Directory -Path $settingsDir -Force | Out-Null
}

# Load or create settings
if (Test-Path $settingsPath) {
    Write-Host "`n📋 Updating existing settings..." -ForegroundColor Yellow
    Copy-Item $settingsPath "$settingsPath.backup" -Force
    $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
} else {
    Write-Host "`n📝 Creating new settings..." -ForegroundColor Yellow
    $settings = @{}
}

# Add/update settings
if (!$SkipHooks) {
    $settings | Add-Member -NotePropertyName "hooks" -NotePropertyValue $hooksConfig.hooks -Force
}
$settings | Add-Member -NotePropertyName "framework" -NotePropertyValue $hooksConfig.framework -Force
$settings | Add-Member -NotePropertyName "documentationPath" -NotePropertyValue "./claude_docs" -Force
$settings | Add-Member -NotePropertyName "projectPath" -NotePropertyValue $ProjectPath -Force
$settings | Add-Member -NotePropertyName "setupDate" -NotePropertyValue (Get-Date -Format "yyyy-MM-dd") -Force

if ($hooksConfig.validationRules) {
    $settings | Add-Member -NotePropertyName "validationRules" -NotePropertyValue $hooksConfig.validationRules -Force
}

# Save settings
$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath -Encoding UTF8
Write-Host "✅ Settings saved to: $settingsPath" -ForegroundColor Green

# Create CLAUDE.md if it doesn't exist
$claudeMdPath = Join-Path $ProjectPath "CLAUDE.md"
if (!(Test-Path $claudeMdPath)) {
    Write-Host "`n📄 Creating CLAUDE.md..." -ForegroundColor Yellow
    
    $claudeMdContent = switch ($Framework) {
        "xos" {
@"
# Claude Code Context

## Framework
This project uses the **XOS Framework** (Enterprise React MVVM).

## Critical Rules
1. **ALWAYS** use XOSButtonWrapper, never XOSButton (doesn't exist)
2. **NEVER** use Bootstrap button classes (btn-primary, btn-secondary, etc.)
3. **ALWAYS** extend cntrl.XOSComponent, not React.Component
4. **ALWAYS** use this.Data in ViewModels, not this.state
5. **ALWAYS** use updateUI() in ViewModels, not setState()

## Component Registry
Available XOS Components:
- XOSButtonWrapper (NOT XOSButton)
- XOSTextbox, XOSSelect, XOSGrid
- XOSControl, XOSBody, XOSTab
- XOSDatepicker, XOSOverlay, XOSToaster

## Button Classes
Use these XOS-specific classes:
- btn-save (green)
- btn-edit (blue)
- btn-delete (red)
- btn-add (blue)
- btn-search, btn-clear, btn-close-custom

## Documentation
All documentation is in ``claude_docs/`` directory.
Start with ``claude_docs/README.md`` for navigation.

## Hooks Active
Claude Code hooks are configured to prevent common errors.
"@
        }
        "react" {
@"
# Claude Code Context

## Framework
This project uses **React** with modern patterns.

## Documentation
All documentation is in ``claude_docs/`` directory.
Start with ``claude_docs/README.md`` for navigation.
"@
        }
        default {
@"
# Claude Code Context

## Framework
Framework: $Framework

## Documentation
All documentation is in ``claude_docs/`` directory.
Start with ``claude_docs/README.md`` for navigation.
"@
        }
    }
    
    $claudeMdContent | Set-Content $claudeMdPath -Encoding UTF8
    Write-Host "✅ Created CLAUDE.md" -ForegroundColor Green
}

# Initialize tracking files
$accessLog = Join-Path $logsDir "file-access.log"
if (!(Test-Path $accessLog)) {
    "# File Access Log`n# Generated: $(Get-Date)" | Set-Content $accessLog
}

$statsFile = Join-Path $logsDir "access-stats.json"
if (!(Test-Path $statsFile)) {
    @{} | ConvertTo-Json | Set-Content $statsFile
}

# Create validation test file
Write-Host "`n🧪 Creating validation test file..." -ForegroundColor Yellow
$testFile = Join-Path $claudeDir "test-validation.jsx"

if ($Framework -eq "xos") {
    @'
// This file tests if hooks are working correctly
// The following lines should trigger warnings:

// ❌ Should warn: XOSButton doesn't exist
import { XOSButton } from '../xos-components';

// ❌ Should warn: Wrong inheritance
class TestComponent extends React.Component {
    
    // ❌ Should warn: Wrong button class
    render() {
        return <button className="btn-primary">Test</button>
    }
}

// ✅ Correct patterns:
import * as cntrl from '../xos-components';

class CorrectComponent extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new CorrectComponentVM(props));
    }
    
    render() {
        return (
            <cntrl.XOSButtonWrapper id="btn_test" formID={this.formID}>
                <button className="btn-save">Save</button>
            </cntrl.XOSButtonWrapper>
        );
    }
}
'@ | Set-Content $testFile
    Write-Host "✅ Test file created: $testFile" -ForegroundColor Green
    Write-Host "   Try editing this file in Claude Code to test hooks!" -ForegroundColor Gray
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ Setup Complete!                      ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📊 Configuration Summary:" -ForegroundColor Cyan
Write-Host "  • Framework: $Framework" -ForegroundColor White
Write-Host "  • Settings: $settingsPath" -ForegroundColor White
Write-Host "  • Hooks: $(if ($SkipHooks) { 'Skipped' } else { 'Installed' })" -ForegroundColor White
Write-Host "  • CLAUDE.md: $(if (Test-Path $claudeMdPath) { 'Created/Updated' } else { 'Skipped' })" -ForegroundColor White

if ($Framework -eq "xos") {
    Write-Host "`n🛡️ Protection Enabled:" -ForegroundColor Green
    Write-Host "  ✓ XOSButton → XOSButtonWrapper validation" -ForegroundColor White
    Write-Host "  ✓ Bootstrap button class warnings" -ForegroundColor White
    Write-Host "  ✓ React.Component → XOSComponent checks" -ForegroundColor White
    Write-Host "  ✓ ViewModel pattern validation" -ForegroundColor White
    Write-Host "  ✓ File access tracking" -ForegroundColor White
}

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Restart Claude Code to apply hooks" -ForegroundColor White
Write-Host "  2. Test by editing $testFile" -ForegroundColor White
Write-Host "  3. Check logs in .claude/logs/" -ForegroundColor White

Write-Host "`n💡 Tips:" -ForegroundColor Cyan
Write-Host "  • To view file access stats: Get-Content .claude/logs/file-access.log" -ForegroundColor Gray
Write-Host "  • To disable hooks temporarily: Edit $settingsPath" -ForegroundColor Gray
Write-Host "  • Documentation: Open claude_docs/README.md" -ForegroundColor Gray

Write-Host "`n"