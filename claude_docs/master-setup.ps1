#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Master Setup Script for Claude Code Projects - Fixed Version
    
.DESCRIPTION
    Comprehensive setup utility for configuring Claude Code with hooks, MCP servers,
    templates, and project-specific configurations. Auto-detects framework and 
    provides both quick setup and advanced customization options.
    
.PARAMETER ProjectPath
    Path to the project directory. Defaults to current directory.
    
.PARAMETER QuickSetup
    Run quick setup with all recommended configurations
    
.PARAMETER FixOnly
    Only run common fixes without other setup
    
.EXAMPLE
    # Interactive menu
    .\master-setup.ps1
    
.EXAMPLE
    # Quick setup everything
    .\master-setup.ps1 -QuickSetup
    
.EXAMPLE
    # Fix common issues only
    .\master-setup.ps1 -FixOnly
#>

param(
    [string]$ProjectPath = (Get-Location).Path,
    [switch]$QuickSetup,
    [switch]$FixOnly
)

# Script configuration
$script:Version = "3.1.1"
$script:ClaudeDocsPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:Framework = "unknown"
$script:ProjectName = Split-Path -Leaf $ProjectPath

# Colors and formatting
function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host " $Text" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success { Write-Host "* $args" -ForegroundColor Green }
function Write-Info { Write-Host "* $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "! $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "X $args" -ForegroundColor Red }
function Write-Step { Write-Host "> $args" -ForegroundColor Magenta }

# Framework detection
function Detect-Framework {
    Write-Info "Detecting project framework..."
    
    # Check for XOS Framework
    if ((Test-Path "$ProjectPath\xos-components") -or 
        (Get-ChildItem -Path $ProjectPath -Filter "*.jsx" -Recurse -ErrorAction SilentlyContinue | 
         Select-Object -First 5 | 
         Where-Object { Select-String -Path $_.FullName -Pattern "XOSComponent|VMBase" -Quiet })) {
        $script:Framework = "xos"
        Write-Success "XOS Framework detected"
        return "xos"
    }
    
    # Check for React
    if (Test-Path "$ProjectPath\package.json") {
        $packageJson = Get-Content "$ProjectPath\package.json" -ErrorAction SilentlyContinue | ConvertFrom-Json
        if ($packageJson.dependencies.react -or $packageJson.devDependencies.react) {
            $script:Framework = "react"
            Write-Success "React project detected"
            return "react"
        }
    }
    
    # Check for .NET
    if (Get-ChildItem -Path $ProjectPath -Filter "*.csproj" -Recurse -ErrorAction SilentlyContinue) {
        $script:Framework = "dotnet"
        Write-Success ".NET project detected"
        return "dotnet"
    }
    
    # Check for Node.js
    if (Test-Path "$ProjectPath\package.json") {
        $script:Framework = "nodejs"
        Write-Success "Node.js project detected"
        return "nodejs"
    }
    
    $script:Framework = "generic"
    Write-Warning "No specific framework detected, using generic settings"
    return "generic"
}

# Module: Install Hooks
function Install-Hooks {
    Write-Header "Installing Claude Code Hooks"
    
    $hooksScript = Join-Path $script:ClaudeDocsPath "hooks\setup-optimized-hooks.ps1"
    
    if (Test-Path $hooksScript) {
        Write-Step "Running optimized hooks setup..."
        & $hooksScript -ProjectPath $ProjectPath -HookSet $script:Framework
        Write-Success "Hooks installed successfully"
    } else {
        Write-Error "Hooks setup script not found"
    }
}

# Module: Setup MCP Servers
function Setup-MCPServers {
    Write-Header "Setting up MCP Servers"
    
    # Check for PostgreSQL
    Write-Info "Checking for PostgreSQL MCP requirements..."
    
    # Look for PROJECT_SEED file
    $seedFile = Get-ChildItem -Path $ProjectPath -Filter "PROJECT_SEED*.md" -File -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if ($seedFile) {
        Write-Success "PROJECT_SEED file found"
        $mcpScript = Join-Path $script:ClaudeDocsPath "setup\setup-project-mcp.ps1"
        
        if (Test-Path $mcpScript) {
            Write-Step "Configuring PostgreSQL MCP..."
            & $mcpScript -ProjectPath $ProjectPath
        }
    } else {
        Write-Warning "No PROJECT_SEED file found, skipping MCP setup"
        Write-Info "To enable: Create a PROJECT_SEED.md with your connection string"
    }
}

# Module: Setup Claude Code Agents
function Setup-Agents {
    Write-Header "Setting up Claude Code Agents"
    
    $agentsPath = Join-Path $ProjectPath ".claude\agents"
    if (!(Test-Path $agentsPath)) {
        New-Item -ItemType Directory -Path $agentsPath -Force | Out-Null
        Write-Success "Created .claude\agents directory"
    }
    
    $agentSetupScript = Join-Path $script:ClaudeDocsPath "automation\setup-agents.ps1"
    
    if (Test-Path $agentSetupScript) {
        Write-Step "Running agent setup script..."
        & $agentSetupScript -TargetDir $agentsPath -Force
        Write-Success "Claude Code agents installed successfully"
        Write-Info "Run '/agents' in Claude Code to verify all agents are loaded"
    } else {
        Write-Error "Agent setup script not found at: $agentSetupScript"
    }
}

# Module: Create Documentation Context  
function Create-DocumentationContext {
    Write-Header "Creating Documentation Context"
    
    $claudeMdPath = Join-Path $ProjectPath "CLAUDE.md"
    
    if (Test-Path $claudeMdPath) {
        Write-Warning "CLAUDE.md already exists, updating..."
    }
    
    $content = "# Claude Code Context for $script:ProjectName`n`n"
    $content += "## Framework`n"
    $content += "Project Type: **$($script:Framework.ToUpper())**`n"
    $content += "Setup Date: $(Get-Date -Format 'yyyy-MM-dd')`n"
    $content += "Setup Version: $script:Version`n`n"
    
    # Add framework-specific content
    if ($script:Framework -eq "xos") {
        $content += "## CRITICAL XOS RULES`n`n"
        $content += "### Component Usage`n"
        $content += "- ALWAYS use XOSButtonWrapper, never XOSButton (doesn't exist)`n"
        $content += "- NEVER use XOSModal (doesn't exist) - use Bootstrap modal`n"
        $content += "- NEVER use XOSCheckbox (doesn't exist) - use Bootstrap form-check`n`n"
        $content += "### MVVM Pattern (MANDATORY)`n"
        $content += "- ALWAYS extend cntrl.XOSComponent, not React.Component`n"
        $content += "- ALWAYS create a ViewModel (ComponentNameVM.js) for every component`n"
        $content += "- ALWAYS use this.Data in ViewModels, not this.state`n"
        $content += "- ALWAYS use updateUI() in ViewModels, not setState()`n`n"
    } elseif ($script:Framework -eq "react") {
        $content += "## React Project Configuration`n`n"
        $content += "### Best Practices`n"
        $content += "- Use functional components with hooks where possible`n"
        $content += "- Follow React 18+ patterns`n"
        $content += "- Maintain proper component hierarchy`n`n"
    }
    
    $content += "## Documentation Structure`n`n"
    $content += "All project documentation is in claude_docs/ directory:`n"
    $content += "- README.md - Main navigation`n"
    $content += "- frontend/ - Frontend guides and templates`n"
    $content += "- backend/ - Backend implementation`n"
    $content += "- hooks/ - Claude Code hooks configuration`n`n"
    
    $content += "## Claude Code Agents`n`n"
    $content += "Specialized agents available in .claude/agents/:`n"
    $content += "- code-reviewer - Expert code review specialist`n"
    $content += "- backend-service-builder - Backend API development`n" 
    $content += "- frontend-architect - Frontend development and UI/UX`n"
    $content += "- database-architect - Database design and optimization`n`n"
    
    $content += "Run /agents in Claude Code to see all available agents.`n`n"
    
    $content += "## Hooks Status`n"
    $content += "Claude Code hooks are configured to prevent common errors.`n"
    $content += "Configuration: .claude/settings.json`n`n"
    
    $content += "---`n"
    $content += "*Generated by Claude Code Master Setup v$script:Version*`n"
    
    $content | Set-Content $claudeMdPath -Encoding UTF8
    Write-Success "Created/Updated CLAUDE.md"
}

# Module: Fix Common Issues
function Fix-CommonIssues {
    Write-Header "Fixing Common Issues"
    
    $issuesFixed = 0
    
    # Fix 1: Create missing directories
    $requiredDirs = @(
        ".claude",
        ".claude\logs"
    )
    
    if ($script:Framework -eq "xos") {
        $requiredDirs += @(
            "src\assets\css",
            "src\xos-components"
        )
    }
    
    foreach ($dir in $requiredDirs) {
        $fullPath = Join-Path $ProjectPath $dir
        if (!(Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Success "Created missing directory: $dir"
            $issuesFixed++
        }
    }
    
    if ($issuesFixed -eq 0) {
        Write-Success "No issues found!"
    } else {
        Write-Success "Fixed $issuesFixed issue(s)"
    }
}

# Interactive Menu
function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "         Claude Code Master Setup v$script:Version" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  Project: $script:ProjectName" -ForegroundColor White
    Write-Host "  Framework: $($script:Framework.ToUpper())" -ForegroundColor White
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1] Quick Setup (Recommended)" -ForegroundColor Green
    Write-Host "  [2] Install Hooks & Validation" -ForegroundColor Yellow
    Write-Host "  [3] Setup MCP Servers (PostgreSQL)" -ForegroundColor Yellow
    Write-Host "  [4] Create Documentation Context" -ForegroundColor Yellow
    Write-Host "  [5] Setup Claude Code Agents" -ForegroundColor Blue
    Write-Host "  [6] Fix Common Issues" -ForegroundColor Magenta
    Write-Host "  [7] Run ALL Setup Options" -ForegroundColor Cyan
    Write-Host "  [Q] Quit" -ForegroundColor Red
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor DarkGray
    Write-Host ""
}

# Main execution
function Main {
    # Initial setup
    Clear-Host
    Write-Header "Claude Code Master Setup v$script:Version"
    
    # Detect framework
    Detect-Framework
    
    # Handle command-line switches
    if ($QuickSetup) {
        Write-Info "Running quick setup..."
        Install-Hooks
        Setup-Agents
        Create-DocumentationContext
        Fix-CommonIssues
        Setup-MCPServers
        
        Write-Header "Quick Setup Complete!"
        Write-Info "Restart Claude Code to apply changes"
        return
    }
    
    if ($FixOnly) {
        Fix-CommonIssues
        return
    }
    
    # Interactive menu loop
    while ($true) {
        Show-Menu
        $choice = Read-Host "Select an option"
        
        switch ($choice.ToUpper()) {
            "1" {
                # Quick Setup
                Install-Hooks
                Create-DocumentationContext
                Fix-CommonIssues
                Write-Success "Quick setup complete!"
            }
            "2" { Install-Hooks }
            "3" { Setup-MCPServers }
            "4" { Create-DocumentationContext }
            "5" { Setup-Agents }
            "6" { Fix-CommonIssues }
            "7" {
                # Run all
                Install-Hooks
                Setup-MCPServers
                Create-DocumentationContext
                Setup-Agents
                Fix-CommonIssues
                Write-Success "All setup options complete!"
            }
            "Q" {
                Write-Info "Exiting setup..."
                return
            }
            default {
                Write-Warning "Invalid option. Please try again."
            }
        }
        
        if ($choice -ne "6") {
            Write-Host ""
            Write-Host "Press any key to continue..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
    }
}

# Run main function
Main

# Final message
Write-Host ""
Write-Success "Setup process completed!"
Write-Info "Remember to restart Claude Code for hooks to take effect"
Write-Host ""