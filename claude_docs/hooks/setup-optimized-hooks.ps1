#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup optimized Claude Code hooks for Windows projects
    
.DESCRIPTION
    This script installs optimized Claude Code hooks into your project's .claude/settings.json
    It auto-detects XOS framework projects and applies appropriate hooks.
    
.PARAMETER ProjectPath
    Path to the project directory. Defaults to current directory.
    
.PARAMETER HookSet
    Which hook set to use: 'xos' (default for XOS projects), 'general' (for non-XOS), or 'auto' (auto-detect)
    
.PARAMETER Force
    Overwrite existing hooks without prompting
    
.EXAMPLE
    # Run from project directory
    .\setup-optimized-hooks.ps1
    
.EXAMPLE
    # Specify project path
    .\setup-optimized-hooks.ps1 -ProjectPath "D:\Projects\MyProject"
    
.EXAMPLE
    # Force general hooks (non-XOS)
    .\setup-optimized-hooks.ps1 -HookSet general
#>

param(
    [string]$ProjectPath = (Get-Location).Path,
    [ValidateSet('auto', 'xos', 'general')]
    [string]$HookSet = 'auto',
    [switch]$Force
)

# Script location
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Hook file paths
$XOSHooksFile = Join-Path $ScriptDir "optimized-hooks-windows.json"
$GeneralHooksFile = Join-Path $ScriptDir "general-windows-hooks.json"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Host ""
Write-Info "=== Claude Code Hook Setup Script ==="
Write-Host ""

# Validate project path
if (!(Test-Path $ProjectPath)) {
    Write-Error "❌ Project path not found: $ProjectPath"
    exit 1
}

Write-Info "📁 Project: $ProjectPath"

# Create .claude directory if needed
$ClaudeDir = Join-Path $ProjectPath ".claude"
if (!(Test-Path $ClaudeDir)) {
    Write-Info "📂 Creating .claude directory..."
    New-Item -ItemType Directory -Path $ClaudeDir | Out-Null
}

# Auto-detect XOS framework
function Test-XOSProject {
    param($Path)
    
    $indicators = @(
        "xos-components",
        "XOSComponent",
        "VMBase",
        "Utils.ajax"
    )
    
    foreach ($indicator in $indicators) {
        $found = Get-ChildItem -Path $Path -Recurse -Filter "*.js*" -ErrorAction SilentlyContinue | 
                 Select-Object -First 10 | 
                 Where-Object { Select-String -Path $_.FullName -Pattern $indicator -Quiet }
        if ($found) {
            return $true
        }
    }
    
    return $false
}

# Determine which hooks to use
if ($HookSet -eq 'auto') {
    Write-Info "🔍 Auto-detecting project type..."
    if (Test-XOSProject -Path $ProjectPath) {
        $HookSet = 'xos'
        Write-Success "✅ XOS framework detected"
    } else {
        $HookSet = 'general'
        Write-Info "📦 Standard Windows project detected"
    }
}

# Select hook file
$SelectedHookFile = if ($HookSet -eq 'xos') { $XOSHooksFile } else { $GeneralHooksFile }
$HookDescription = if ($HookSet -eq 'xos') { "XOS Framework (13 optimized hooks)" } else { "General Windows (5 hooks)" }

if (!(Test-Path $SelectedHookFile)) {
    Write-Error "❌ Hook file not found: $SelectedHookFile"
    exit 1
}

Write-Info "🎯 Using hooks: $HookDescription"

# Load hook configuration
$HookConfig = Get-Content $SelectedHookFile -Raw | ConvertFrom-Json

# Check for existing settings.json
$SettingsFile = Join-Path $ClaudeDir "settings.json"
$ExistingSettings = $null

if (Test-Path $SettingsFile) {
    Write-Warning "⚠️  Existing settings.json found"
    
    if (!$Force) {
        $response = Read-Host "Do you want to (M)erge hooks, (R)eplace all, or (C)ancel? [M/R/C]"
        if ($response -eq 'C') {
            Write-Info "Operation cancelled"
            exit 0
        }
        $ReplaceAll = ($response -eq 'R')
    } else {
        $ReplaceAll = $true
    }
    
    if (!$ReplaceAll) {
        # Load existing settings for merge
        $ExistingSettings = Get-Content $SettingsFile -Raw | ConvertFrom-Json
    }
}

# Prepare final settings
$FinalSettings = if ($ExistingSettings) {
    # Merge: Keep existing MCP servers and other settings
    $merged = $ExistingSettings | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $merged.hooks = $HookConfig.hooks
    $merged
} else {
    # New settings with just hooks
    @{
        hooks = $HookConfig.hooks
    }
}

# Backup existing file if present
if ((Test-Path $SettingsFile) -and !$Force) {
    $BackupFile = Join-Path $ClaudeDir "settings.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    Copy-Item $SettingsFile $BackupFile
    Write-Info "📋 Backup created: $(Split-Path -Leaf $BackupFile)"
}

# Write settings file
$FinalSettings | ConvertTo-Json -Depth 10 | Set-Content $SettingsFile -Encoding UTF8
Write-Success "✅ Hooks installed successfully!"

# Summary
Write-Host ""
Write-Success "=== Setup Complete ==="
Write-Info "📍 Settings file: $SettingsFile"
Write-Info "🪝 Hook set: $HookDescription"

if ($HookSet -eq 'xos') {
    Write-Host ""
    Write-Info "XOS hooks include:"
    Write-Host "  • Component validation (XOSButton, XOSModal, etc.)"
    Write-Host "  • MVVM pattern enforcement"
    Write-Host "  • Theme.css validation"
    Write-Host "  • React hooks prevention"
    Write-Host "  • Windows path validation"
}

Write-Host ""
Write-Warning "⚠️  Restart Claude Code for hooks to take effect"
Write-Host ""