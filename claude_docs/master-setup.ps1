#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Master Setup Script for Claude Code Projects
    
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
$script:Version = "3.1.0"
$script:ClaudeDocsPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:Framework = "unknown"
$script:ProjectName = Split-Path -Leaf $ProjectPath

# Colors and formatting
function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ $($Text.PadRight(61)) ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Info { Write-Host "📍 $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "❌ $args" -ForegroundColor Red }
function Write-Step { Write-Host "🔧 $args" -ForegroundColor Magenta }

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

# Documentation setup detection
function Detect-DocumentationSetup {
    $isMainRepo = Test-Path "$ProjectPath\claude_docs" -and (Test-Path "$ProjectPath\update-html-docs.ps1")
    $hasSubmodule = Test-Path "$ProjectPath\.gitmodules"
    $hasClaudeDocsSubmodule = $false
    
    if ($hasSubmodule) {
        $gitmodules = Get-Content "$ProjectPath\.gitmodules" -ErrorAction SilentlyContinue
        $hasClaudeDocsSubmodule = $gitmodules -match "path = claude_docs"
    }
    
    if ($isMainRepo) {
        Write-Info "This appears to be the main documentation repository"
        return "main-repo"
    } elseif ($hasClaudeDocsSubmodule) {
        Write-Info "Documentation submodule detected"
        return "has-submodule"
    } else {
        Write-Info "No documentation setup detected"
        return "needs-setup"
    }
}

# Module: Setup Documentation Submodule
function Setup-DocumentationSubmodule {
    Write-Header "Setting up Documentation Submodule"
    
    $docStatus = Detect-DocumentationSetup
    
    switch ($docStatus) {
        "main-repo" {
            Write-Info "claude_docs found locally - configuring protection system..."
            
            # Set up git hooks for protection
            $hooksDir = Join-Path $ProjectPath ".githooks"
            if (!(Test-Path $hooksDir)) {
                New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
            }
            
            # Copy protection hooks if they exist
            $sourceHooks = Join-Path $ProjectPath ".githooks"
            if (Test-Path $sourceHooks) {
                Write-Step "Activating git hooks..."
                try {
                    git config core.hooksPath .githooks
                    Write-Success "Git hooks configured for claude_docs protection"
                } catch {
                    Write-Warning "Could not configure git hooks: $($_.Exception.Message)"
                }
            }
            
            # Create CODEOWNERS if not exists
            $codeownersPath = Join-Path $ProjectPath "CODEOWNERS"
            if (!(Test-Path $codeownersPath)) {
                Write-Step "Creating CODEOWNERS file..."
                $gitUser = git config user.name 2>$null
                if (!$gitUser) { $gitUser = $env:USERNAME }
                
                @"
# CODEOWNERS file for XOS_Claude repository
# Claude Documentation - Only maintainers can approve changes
/claude_docs/ @$gitUser

# Global fallback - repository owner reviews everything else  
* @$gitUser
"@ | Set-Content $codeownersPath -Encoding UTF8
                Write-Success "CODEOWNERS created with user: $gitUser"
            }
            
            # Ensure CONTRIBUTING.md exists
            $contributingPath = Join-Path $ProjectPath "CONTRIBUTING.md"
            if (Test-Path $contributingPath) {
                Write-Success "CONTRIBUTING.md found - team guidelines available"
            } else {
                Write-Warning "CONTRIBUTING.md not found - team members won't see contribution guidelines"
            }
            
            Write-Success "Main repository documentation protection configured"
        }
        
        "has-submodule" {
            Write-Info "Checking submodule status..."
            
            # Check if submodule is initialized
            $claudeDocsExists = Test-Path "$ProjectPath\claude_docs"
            if (!$claudeDocsExists) {
                Write-Step "Initializing documentation submodule..."
                try {
                    git submodule init
                    git submodule update
                    Write-Success "Documentation submodule initialized"
                } catch {
                    Write-Error "Failed to initialize submodule: $($_.Exception.Message)"
                    return
                }
            }
            
            # Check if submodule is up to date
            Set-Location "$ProjectPath\claude_docs"
            $submoduleStatus = git status --porcelain 2>$null
            $behindCommits = git rev-list HEAD..origin/main --count 2>$null
            Set-Location $ProjectPath
            
            if ($behindCommits -gt 0) {
                Write-Warning "Documentation submodule is $behindCommits commits behind"
                Write-Info "To update: git submodule update --remote claude_docs"
            } else {
                Write-Success "Documentation submodule is up to date"
            }
        }
        
        "needs-setup" {
            Write-Info "No documentation submodule found. Setting up..."
            
            # Check if git repo
            if (!(Test-Path "$ProjectPath\.git")) {
                Write-Error "Not a git repository. Initialize git first: git init"
                return
            }
            
            # Interactive setup
            Write-Host ""
            Write-Host "🤔 How would you like to set up documentation?" -ForegroundColor Yellow
            Write-Host "  [1] Add as git submodule (recommended for teams)"
            Write-Host "  [2] Skip documentation setup"
            Write-Host ""
            
            $choice = Read-Host "Select option (1-2)"
            
            if ($choice -eq "1") {
                Write-Host ""
                Write-Host "Enter the git URL for your claude_docs repository:" -ForegroundColor Yellow
                Write-Host "Example: https://github.com/yourusername/XOS_Claude.git" -ForegroundColor Gray
                $repoUrl = Read-Host "Repository URL"
                
                if (![string]::IsNullOrWhiteSpace($repoUrl)) {
                    try {
                        Write-Step "Adding documentation submodule..."
                        git submodule add $repoUrl claude_docs
                        
                        Write-Step "Initializing submodule..."
                        git submodule init
                        git submodule update
                        
                        Write-Step "Committing submodule addition..."
                        git add .gitmodules claude_docs
                        git commit -m "📚 Add claude_docs as submodule for documentation

🤖 Generated with Claude Code Master Setup v$script:Version

Co-Authored-By: Claude <noreply@anthropic.com>"
                        
                        Write-Success "Documentation submodule added successfully!"
                        Write-Info "Team members should clone with: git clone --recurse-submodules <repo-url>"
                        Write-Info "Or after cloning run: git submodule update --init --recursive"
                        
                    } catch {
                        Write-Error "Failed to add submodule: $($_.Exception.Message)"
                        Write-Info "Make sure the repository URL is correct and accessible"
                    }
                } else {
                    Write-Warning "No URL provided, skipping submodule setup"
                }
            } else {
                Write-Info "Skipping documentation submodule setup"
            }
        }
    }
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

# Module: Install UI Templates
function Install-UITemplates {
    Write-Header "Installing UI Templates"
    
    if ($script:Framework -ne "xos" -and $script:Framework -ne "react") {
        Write-Warning "UI templates are only for React/XOS projects"
        return
    }
    
    $templatesPath = Join-Path $script:ClaudeDocsPath "frontend\ui-templates"
    $targetPath = Join-Path $ProjectPath "src\components\templates"
    
    if (!(Test-Path $targetPath)) {
        New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    }
    
    Write-Step "Copying MVVM templates..."
    $templates = @(
        "MasterDetailCRUDTemplate",
        "SearchListGridTemplate",
        "ReportParameterTemplate",
        "WorkflowFormTemplate"
    )
    
    foreach ($template in $templates) {
        $sourcePath = Join-Path $templatesPath $template
        if (Test-Path $sourcePath) {
            Copy-Item -Path $sourcePath -Destination $targetPath -Recurse -Force
            Write-Success "Installed $template"
        }
    }
}

# Module: Create Documentation Context
function Create-DocumentationContext {
    Write-Header "Creating Documentation Context"
    
    $claudeMdPath = Join-Path $ProjectPath "CLAUDE.md"
    
    if (Test-Path $claudeMdPath) {
        Write-Warning "CLAUDE.md already exists, updating..."
    }
    
    $content = @"
# Claude Code Context for $script:ProjectName

## Framework
Project Type: **$($script:Framework.ToUpper())**
Setup Date: $(Get-Date -Format "yyyy-MM-dd")
Setup Version: $script:Version

"@

    # Add framework-specific content
    switch ($script:Framework) {
        "xos" {
            $content += @"
## 🚨 CRITICAL XOS RULES

### Component Usage
- **ALWAYS** use \`XOSButtonWrapper\`, never \`XOSButton\` (doesn't exist)
- **NEVER** use \`XOSModal\` (doesn't exist) - use Bootstrap modal
- **NEVER** use \`XOSCheckbox\` (doesn't exist) - use Bootstrap form-check

### MVVM Pattern (MANDATORY)
- **ALWAYS** extend \`cntrl.XOSComponent\`, not \`React.Component\`
- **ALWAYS** create a ViewModel (\`ComponentNameVM.js\`) for every component
- **ALWAYS** use \`this.Data\` in ViewModels, not \`this.state\`
- **ALWAYS** use \`updateUI()\` in ViewModels, not \`setState()\`

### Button Classes
Use XOS-specific classes:
- \`btn-save\` (green) - for save actions
- \`btn-edit\` (blue) - for edit actions
- \`btn-delete\` (red) - for delete actions
- \`btn-add\` (blue) - for add actions
- \`btn-search\`, \`btn-clear\`, \`btn-close-custom\`

**NEVER** use Bootstrap classes: \`btn-primary\`, \`btn-secondary\`, etc.

### Critical Files
- \`Utils.js\` line 447 - Phone regex must be properly escaped
- \`App.js\` - Must import \`'./assets/css/theme.css'\` for XOS components to be visible

"@
        }
        "react" {
            $content += @"
## React Project Configuration

### Best Practices
- Use functional components with hooks where possible
- Follow React 18+ patterns
- Maintain proper component hierarchy

"@
        }
        "dotnet" {
            $content += @"
## .NET Project Configuration

### Database
- Connection strings in appsettings.json
- Use dependency injection for services
- Follow repository pattern

### Services Registration
\`\`\`csharp
services.AddScoped<IDBService, PostgreSQLDBService>();
services.AddScoped<IDBUtils, PostgreSQLDBUtils>();
\`\`\`

"@
        }
    }
    
    $content += @"
## 📚 Documentation Structure

All project documentation is in \`claude_docs/\` directory:
- \`README.md\` - Main navigation
- \`frontend/\` - Frontend guides and templates
- \`backend/\` - Backend implementation
- \`hooks/\` - Claude Code hooks configuration
- \`testing/\` - Testing guides and examples
- \`troubleshooting/\` - Common issues and fixes

## 🤖 Claude Code Agents

Specialized agents available in \`.claude/agents/\`:
- \`code-reviewer\` - Expert code review specialist
- \`backend-service-builder\` - Backend API development 
- \`frontend-architect\` - Frontend development and UI/UX
- \`database-architect\` - Database design and optimization
- \`test-automation-engineer\` - Testing frameworks and automation
- \`devops-automator\` - CI/CD and deployment automation
- \`security-auditor\` - Security analysis and hardening
- \`performance-optimizer\` - Application performance tuning
- \`documentation-engineer\` - Technical documentation
- \`git-workflow-manager\` - Git operations and version control

Run \`/agents\` in Claude Code to see all available agents.

## 🪝 Hooks Status
Claude Code hooks are configured to prevent common errors.
Configuration: \`.claude/settings.json\`

## 🔧 Common Commands

### Development
\`\`\`bash
# Start frontend
npm start

# Start backend
dotnet run

# Run tests
npm test
\`\`\`

### Troubleshooting
\`\`\`powershell
# Re-run setup
.\claude_docs\master-setup.ps1

# Fix common issues
.\claude_docs\master-setup.ps1 -FixOnly

# View hook logs
Get-Content .claude\logs\file-access.log
\`\`\`

## 📋 Checklist
- [ ] Hooks installed and tested
- [ ] MCP servers configured (if needed)
- [ ] UI templates available
- [ ] Documentation linked
- [ ] Common issues fixed

---
*Generated by Claude Code Master Setup v$script:Version*
"@
    
    $content | Set-Content $claudeMdPath -Encoding UTF8
    Write-Success "Created/Updated CLAUDE.md"
}

# Module: Fix Common Issues
function Fix-CommonIssues {
    Write-Header "Fixing Common Issues"
    
    $issuesFixed = 0
    
    # Fix 1: Utils.js phone regex
    if ($script:Framework -eq "xos") {
        $utilsFiles = Get-ChildItem -Path $ProjectPath -Filter "Utils.js" -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $utilsFiles) {
            $content = Get-Content $file.FullName -Raw
            if ($content -match "const phoneRegex = '\^") {
                Write-Step "Fixing phone regex in $($file.Name)..."
                $content = $content -replace "const phoneRegex = '\^\\(", "const phoneRegex = '^\\\\("
                $content | Set-Content $file.FullName -Encoding UTF8
                Write-Success "Fixed phone regex"
                $issuesFixed++
            }
        }
    }
    
    # Fix 2: Missing dependencies
    if (Test-Path "$ProjectPath\package.json") {
        $packageJson = Get-Content "$ProjectPath\package.json" | ConvertFrom-Json
        $missingDeps = @()
        
        if ($script:Framework -eq "xos") {
            if (!$packageJson.dependencies.'react-color') { $missingDeps += "react-color" }
            if (!$packageJson.dependencies.'fast-sort') { $missingDeps += "fast-sort" }
        }
        
        if ($missingDeps.Count -gt 0) {
            Write-Step "Installing missing dependencies: $($missingDeps -join ', ')"
            Set-Location $ProjectPath
            & npm install $missingDeps
            Write-Success "Dependencies installed"
            $issuesFixed++
        }
    }
    
    # Fix 3: Create missing directories
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
    
    # Fix 4: Port 3000 in use
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($port3000) {
        Write-Warning "Port 3000 is in use"
        Write-Info "To fix: taskkill /F /IM node.exe"
        Write-Info "Or use: $env:PORT=3001; npm start"
    }
    
    if ($issuesFixed -eq 0) {
        Write-Success "No issues found!"
    } else {
        Write-Success "Fixed $issuesFixed issue(s)"
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

# Module: Setup Development Environment
function Setup-DevEnvironment {
    Write-Header "Setting up Development Environment"
    
    # Create .gitignore if needed
    $gitignorePath = Join-Path $ProjectPath ".gitignore"
    if (!(Test-Path $gitignorePath)) {
        Write-Step "Creating .gitignore..."
        $gitignoreContent = @"
# Dependencies
node_modules/
packages/

# Build outputs
dist/
build/
bin/
obj/
*.dll
*.exe

# IDE
.vs/
.vscode/
*.user
*.suo

# Claude Code
.claude/logs/
.claude/*.backup

# Environment
.env
.env.local
*.log

# OS
Thumbs.db
.DS_Store
"@
        $gitignoreContent | Set-Content $gitignorePath -Encoding UTF8
        Write-Success "Created .gitignore"
    }
    
    # Create VSCode settings
    $vscodeDir = Join-Path $ProjectPath ".vscode"
    if (!(Test-Path $vscodeDir)) {
        New-Item -ItemType Directory -Path $vscodeDir -Force | Out-Null
    }
    
    $vscodeSettings = Join-Path $vscodeDir "settings.json"
    if (!(Test-Path $vscodeSettings)) {
        Write-Step "Creating VSCode settings..."
        $settings = @{
            "editor.formatOnSave" = $true
            "editor.tabSize" = 2
            "files.exclude" = @{
                "**/.claude/logs" = $true
                "**/node_modules" = $true
            }
        }
        
        if ($script:Framework -eq "xos") {
            $settings["files.associations"] = @{
                "*VM.js" = "javascript"
            }
        }
        
        $settings | ConvertTo-Json -Depth 5 | Set-Content $vscodeSettings -Encoding UTF8
        Write-Success "Created VSCode settings"
    }
}

# Interactive Menu
function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         Claude Code Master Setup v$script:Version                     ║" -ForegroundColor Cyan
    Write-Host "╠═══════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "║  Project: $($script:ProjectName.PadRight(50))  ║" -ForegroundColor White
    Write-Host "║  Framework: $($script:Framework.ToUpper().PadRight(48))  ║" -ForegroundColor White
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1] 🚀 Quick Setup (Recommended)" -ForegroundColor Green
    Write-Host "  [2] 🪝 Install Hooks & Validation" -ForegroundColor Yellow
    Write-Host "  [3] 🗄️  Setup MCP Servers (PostgreSQL)" -ForegroundColor Yellow
    Write-Host "  [4] 📋 Install UI Templates (MVVM)" -ForegroundColor Yellow
    Write-Host "  [5] 📚 Create Documentation Context" -ForegroundColor Yellow
    Write-Host "  [6] 🛠️  Setup Development Environment" -ForegroundColor Yellow
    Write-Host "  [7] 🤖 Setup Claude Code Agents" -ForegroundColor Blue
    Write-Host "  [8] 📚 Setup Documentation Submodule" -ForegroundColor Blue
    Write-Host "  [9] 🔧 Fix Common Issues" -ForegroundColor Magenta
    Write-Host "  [10] 🎯 Run ALL Setup Options" -ForegroundColor Cyan
    Write-Host "  [11] 📊 View Setup Status" -ForegroundColor White
    Write-Host "  [Q] ❌ Quit" -ForegroundColor Red
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host ""
}

function Show-Status {
    Write-Header "Setup Status Check"
    
    # Check hooks
    $hooksInstalled = Test-Path "$ProjectPath\.claude\settings.json"
    if ($hooksInstalled) {
        Write-Success "Hooks: Installed"
    } else {
        Write-Warning "Hooks: Not installed"
    }
    
    # Check MCP
    $mcpConfigured = Test-Path "$ProjectPath\.claude\mcp.json"
    if ($mcpConfigured) {
        Write-Success "MCP Servers: Configured"
    } else {
        Write-Info "MCP Servers: Not configured"
    }
    
    # Check CLAUDE.md
    $claudeMdExists = Test-Path "$ProjectPath\CLAUDE.md"
    if ($claudeMdExists) {
        Write-Success "Documentation: Created"
    } else {
        Write-Warning "Documentation: Not created"
    }
    
    # Check templates
    $templatesExist = Test-Path "$ProjectPath\src\components\templates"
    if ($templatesExist) {
        Write-Success "UI Templates: Installed"
    } else {
        Write-Info "UI Templates: Not installed"
    }
    
    # Check agents
    $agentsExist = Test-Path "$ProjectPath\.claude\agents"
    if ($agentsExist) {
        $agentCount = (Get-ChildItem "$ProjectPath\.claude\agents" -Filter "*.md" -ErrorAction SilentlyContinue).Count
        Write-Success "Claude Code Agents: $agentCount installed"
    } else {
        Write-Info "Claude Code Agents: Not installed"
    }
    
    # Check documentation submodule
    $docStatus = Detect-DocumentationSetup
    switch ($docStatus) {
        "main-repo" {
            $protectionFiles = @("CODEOWNERS", "CONTRIBUTING.md", ".githooks\pre-commit")
            $protectionCount = ($protectionFiles | Where-Object { Test-Path "$ProjectPath\$_" }).Count
            Write-Success "Documentation: Main repository ($protectionCount/$($protectionFiles.Count) protection files)"
        }
        "has-submodule" {
            if (Test-Path "$ProjectPath\claude_docs") {
                # Check if submodule is up to date
                try {
                    Set-Location "$ProjectPath\claude_docs"
                    $behindCommits = git rev-list HEAD..origin/main --count 2>$null
                    Set-Location $ProjectPath
                    
                    if ($behindCommits -gt 0) {
                        Write-Warning "Documentation Submodule: $behindCommits commits behind"
                    } else {
                        Write-Success "Documentation Submodule: Up to date"
                    }
                } catch {
                    Write-Success "Documentation Submodule: Configured"
                }
            } else {
                Write-Warning "Documentation Submodule: Not initialized"
            }
        }
        "needs-setup" {
            Write-Info "Documentation Submodule: Not configured"
        }
    }
    
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
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
        Setup-DocumentationSubmodule
        Create-DocumentationContext
        Fix-CommonIssues
        Setup-DevEnvironment
        
        if ($script:Framework -eq "xos" -or $script:Framework -eq "react") {
            Install-UITemplates
        }
        
        Setup-MCPServers
        
        Write-Header "✅ Quick Setup Complete!"
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
                Setup-DocumentationSubmodule
                Create-DocumentationContext
                Fix-CommonIssues
                Write-Success "Quick setup complete!"
            }
            "2" { Install-Hooks }
            "3" { Setup-MCPServers }
            "4" { Install-UITemplates }
            "5" { Create-DocumentationContext }
            "6" { Setup-DevEnvironment }
            "7" { Setup-Agents }
            "8" { Setup-DocumentationSubmodule }
            "9" { Fix-CommonIssues }
            "10" {
                # Run all
                Install-Hooks
                Setup-MCPServers
                Install-UITemplates
                Create-DocumentationContext
                Setup-DevEnvironment
                Setup-Agents
                Setup-DocumentationSubmodule
                Fix-CommonIssues
                Write-Success "All setup options complete!"
            }
            "11" { Show-Status }
            "Q" {
                Write-Info "Exiting setup..."
                return
            }
            default {
                Write-Warning "Invalid option. Please try again."
            }
        }
        
        if ($choice -ne "9") {
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