#Requires -Version 5.1
<#
.SYNOPSIS
    Check for claude_docs updates and manage documentation synchronization - Fixed Version
    
.DESCRIPTION
    Monitors claude_docs for updates, shows changelog, and provides options to update.
    Works with both main repositories and submodule setups. Can run in interactive
    mode or scheduled for automatic checking.
    
.PARAMETER CheckOnly
    Only check for updates without prompting to apply them
    
.PARAMETER AutoUpdate
    Automatically apply updates if available (use with caution)
    
.PARAMETER ShowLog
    Show detailed changelog of what's new
    
.PARAMETER Scheduled
    Run in scheduled mode with minimal output
    
.EXAMPLE
    .\check-docs-updates.ps1
    
.EXAMPLE
    .\check-docs-updates.ps1 -CheckOnly -ShowLog
    
.EXAMPLE
    .\check-docs-updates.ps1 -AutoUpdate
#>

param(
    [switch]$CheckOnly,
    [switch]$AutoUpdate,
    [switch]$ShowLog,
    [switch]$Scheduled
)

# Script configuration
$script:Version = "1.0.1"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:ClaudeDocsPath = Split-Path -Parent $scriptDir
$script:ProjectPath = Split-Path -Parent $script:ClaudeDocsPath
$script:UpdatesAvailable = $false
$script:CommitsBehind = 0

# Colors and formatting
function Write-Header {
    param([string]$Text)
    if (!$Scheduled) {
        Write-Host ""
        Write-Host "================================================================" -ForegroundColor Cyan
        Write-Host " $Text" -ForegroundColor Cyan
        Write-Host "================================================================" -ForegroundColor Cyan
        Write-Host ""
    }
}

function Write-Success { if (!$Scheduled) { Write-Host "* $args" -ForegroundColor Green } }
function Write-Info { if (!$Scheduled) { Write-Host "* $args" -ForegroundColor Cyan } }
function Write-Warning { Write-Host "! $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "X $args" -ForegroundColor Red }
function Write-Step { if (!$Scheduled) { Write-Host "> $args" -ForegroundColor Magenta } }
function Write-Update { Write-Host "+ $args" -ForegroundColor Green }

# Detect setup type
function Detect-SetupType {
    if (!(Test-Path $script:ClaudeDocsPath)) {
        return "no-docs"
    }
    
    if (Test-Path "$script:ProjectPath\.gitmodules") {
        $gitmodules = Get-Content "$script:ProjectPath\.gitmodules" -ErrorAction SilentlyContinue
        if ($gitmodules -match "path = claude_docs") {
            return "submodule"
        }
    }
    
    if (Test-Path (Join-Path $script:ClaudeDocsPath "automation\update-html-docs.ps1")) {
        return "main-repo"
    }
    
    return "local-copy"
}

# Get current version info
function Get-CurrentVersionInfo {
    if (!(Test-Path $script:ClaudeDocsPath)) {
        return @{
            HasDocs = $false
            CurrentCommit = $null
            CurrentDate = $null
            Branch = $null
        }
    }
    
    $currentDir = Get-Location
    try {
        Set-Location $script:ClaudeDocsPath
        
        $currentCommit = git rev-parse HEAD 2>$null
        $currentDate = git log -1 --format="%ci" 2>$null
        $branch = git rev-parse --abbrev-ref HEAD 2>$null
        $isDirty = git status --porcelain 2>$null
        
        return @{
            HasDocs = $true
            CurrentCommit = $currentCommit
            CurrentDate = $currentDate
            Branch = $branch
            IsDirty = $isDirty.Length -gt 0
        }
    }
    finally {
        Set-Location $currentDir
    }
}

# Check for remote updates
function Check-RemoteUpdates {
    param([string]$SetupType)
    
    if (!(Test-Path $script:ClaudeDocsPath)) {
        Write-Warning "claude_docs directory not found"
        return $false
    }
    
    $currentDir = Get-Location
    try {
        Set-Location $script:ClaudeDocsPath
        
        Write-Step "Fetching latest changes..."
        git fetch origin 2>$null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Could not fetch updates - check network connection"
            return $false
        }
        
        $currentCommit = git rev-parse HEAD
        $remoteCommit = git rev-parse origin/main 2>$null
        
        if (!$remoteCommit) {
            $remoteCommit = git rev-parse origin/master 2>$null
        }
        
        if ($currentCommit -eq $remoteCommit) {
            Write-Success "claude_docs is up to date"
            return $false
        }
        
        $script:CommitsBehind = git rev-list --count HEAD..origin/main 2>$null
        if (!$script:CommitsBehind) {
            $script:CommitsBehind = git rev-list --count HEAD..origin/master 2>$null
        }
        
        Write-Update "Updates available: $script:CommitsBehind new commits"
        $script:UpdatesAvailable = $true
        return $true
    }
    finally {
        Set-Location $currentDir
    }
}

# Show changelog
function Show-UpdateChangelog {
    if (!(Test-Path $script:ClaudeDocsPath)) {
        return
    }
    
    $currentDir = Get-Location
    try {
        Set-Location $script:ClaudeDocsPath
        
        Write-Header "What's New in claude_docs"
        
        # Get commits since current HEAD
        $remoteBranch = "origin/main"
        if (!(git rev-parse $remoteBranch 2>$null)) {
            $remoteBranch = "origin/master"
        }
        
        Write-Host "Recent updates:" -ForegroundColor Yellow
        Write-Host ""
        
        $commits = git log HEAD..$remoteBranch --oneline --max-count=10 2>$null
        if ($commits) {
            foreach ($commit in $commits) {
                Write-Host "  * $commit" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        
        # Check for new files
        $newFiles = git diff HEAD..$remoteBranch --name-only --diff-filter=A 2>$null
        if ($newFiles) {
            Write-Host "New files:" -ForegroundColor Green
            foreach ($file in $newFiles) {
                Write-Host "  + $file" -ForegroundColor Green
            }
            Write-Host ""
        }
        
        # Check for modified files
        $modifiedFiles = git diff HEAD..$remoteBranch --name-only --diff-filter=M 2>$null
        if ($modifiedFiles) {
            Write-Host "Updated files:" -ForegroundColor Yellow
            foreach ($file in $modifiedFiles) {
                Write-Host "  ~ $file" -ForegroundColor Yellow
            }
            Write-Host ""
        }
        
        # Check for deleted files
        $deletedFiles = git diff HEAD..$remoteBranch --name-only --diff-filter=D 2>$null
        if ($deletedFiles) {
            Write-Host "Removed files:" -ForegroundColor Red
            foreach ($file in $deletedFiles) {
                Write-Host "  - $file" -ForegroundColor Red
            }
            Write-Host ""
        }
        
    }
    finally {
        Set-Location $currentDir
    }
}

# Apply updates
function Apply-Updates {
    param([string]$SetupType)
    
    $currentDir = Get-Location
    try {
        switch ($SetupType) {
            "main-repo" {
                Write-Step "Updating main repository..."
                Set-Location $script:ClaudeDocsPath
                git pull origin main 2>$null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Main repository updated successfully"
                    
                    # Run HTML update script if available
                    Set-Location $script:ProjectPath
                    $htmlUpdateScript = Join-Path $script:ClaudeDocsPath "automation\update-html-docs.ps1"
                    if (Test-Path $htmlUpdateScript) {
                        Write-Step "Updating HTML documentation..."
                        & $htmlUpdateScript
                        Write-Success "HTML documentation updated"
                    }
                } else {
                    Write-Error "Failed to update main repository"
                    return $false
                }
            }
            
            "submodule" {
                Write-Step "Updating submodule..."
                git submodule update --remote claude_docs
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Submodule updated successfully"
                    
                    # Commit the submodule update
                    $hasChanges = git diff --quiet HEAD -- claude_docs
                    if ($LASTEXITCODE -ne 0) {
                        Write-Step "Committing submodule update..."
                        git add claude_docs
                        $commitMsg = "Update claude_docs submodule to latest`n`nAuto-updated by check-docs-updates.ps1 v$script:Version"
                        git commit -m $commitMsg
                        Write-Success "Submodule update committed"
                    }
                } else {
                    Write-Error "Failed to update submodule"
                    return $false
                }
            }
            
            "local-copy" {
                Write-Step "Updating local copy..."
                Set-Location $script:ClaudeDocsPath
                git pull origin main 2>$null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Local copy updated successfully"
                } else {
                    Write-Error "Failed to update local copy"
                    return $false
                }
            }
        }
        
        return $true
    }
    finally {
        Set-Location $currentDir
    }
}

# Interactive update menu
function Show-UpdateMenu {
    param([string]$SetupType)
    
    Write-Host ""
    Write-Host "Update Options:" -ForegroundColor Yellow
    Write-Host "  [1] Show detailed changelog"
    Write-Host "  [2] Apply updates now"
    Write-Host "  [3] Remind me later"
    Write-Host "  [4] Skip this version"
    Write-Host ""
    
    $choice = Read-Host "Select option (1-4)"
    
    switch ($choice) {
        "1" {
            Show-UpdateChangelog
            Write-Host ""
            Write-Host "Press any key to return to menu..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            Show-UpdateMenu -SetupType $SetupType
        }
        "2" {
            if (Apply-Updates -SetupType $SetupType) {
                Write-Success "Documentation updated successfully!"
                
                # Create update log
                $updateLog = @{
                    UpdatedAt = Get-Date
                    FromCommits = $script:CommitsBehind
                    SetupType = $SetupType
                    Version = $script:Version
                }
                
                $logPath = Join-Path $script:ProjectPath ".claude_docs_last_update.json"
                $updateLog | ConvertTo-Json | Set-Content $logPath
            }
        }
        "3" {
            Write-Info "Will check again next time you run the script"
            
            # Set reminder for next check
            $reminderPath = Join-Path $script:ProjectPath ".claude_docs_reminder.txt"
            (Get-Date).AddDays(1) | Set-Content $reminderPath
        }
        "4" {
            Write-Info "Skipping this version"
            
            # Skip this version
            $skipPath = Join-Path $script:ProjectPath ".claude_docs_skip_version.txt"
            $currentDir = Get-Location
            try {
                Set-Location $script:ClaudeDocsPath
                $remoteCommit = git rev-parse origin/main 2>$null
                if (!$remoteCommit) {
                    $remoteCommit = git rev-parse origin/master 2>$null
                }
                $remoteCommit | Set-Content $skipPath
            }
            finally {
                Set-Location $currentDir
            }
        }
        default {
            Write-Warning "Invalid option, try again"
            Show-UpdateMenu -SetupType $SetupType
        }
    }
}

# Check if version should be skipped
function Should-SkipVersion {
    $skipPath = Join-Path $script:ProjectPath ".claude_docs_skip_version.txt"
    if (!(Test-Path $skipPath)) {
        return $false
    }
    
    $skippedCommit = Get-Content $skipPath -ErrorAction SilentlyContinue
    if (!$skippedCommit) {
        return $false
    }
    
    $currentDir = Get-Location
    try {
        Set-Location $script:ClaudeDocsPath
        $remoteCommit = git rev-parse origin/main 2>$null
        if (!$remoteCommit) {
            $remoteCommit = git rev-parse origin/master 2>$null
        }
        
        return $skippedCommit.Trim() -eq $remoteCommit
    }
    finally {
        Set-Location $currentDir
    }
}

# Generate status report
function Generate-StatusReport {
    param([string]$SetupType)
    
    if ($Scheduled) {
        if ($script:UpdatesAvailable) {
            Write-Host "UPDATES_AVAILABLE:$script:CommitsBehind" -ForegroundColor Yellow
        } else {
            Write-Host "UP_TO_DATE" -ForegroundColor Green
        }
        return
    }
    
    $versionInfo = Get-CurrentVersionInfo
    
    Write-Header "claude_docs Status Report"
    
    Write-Host "Setup Type: " -NoNewline
    switch ($SetupType) {
        "main-repo" { Write-Host "Main Repository" -ForegroundColor Green }
        "submodule" { Write-Host "Git Submodule" -ForegroundColor Cyan }
        "local-copy" { Write-Host "Local Copy" -ForegroundColor Yellow }
        "no-docs" { Write-Host "Not Found" -ForegroundColor Red }
    }
    
    if ($versionInfo.HasDocs) {
        Write-Host "Current Branch: $($versionInfo.Branch)" -ForegroundColor Gray
        Write-Host "Last Updated: $($versionInfo.CurrentDate)" -ForegroundColor Gray
        
        if ($versionInfo.IsDirty) {
            Write-Warning "Local changes detected - commit before updating"
        }
        
        if ($script:UpdatesAvailable) {
            Write-Update "Updates Available: $script:CommitsBehind commits behind"
        } else {
            Write-Success "Documentation is up to date"
        }
    }
}

# Main execution
function Main {
    if (!$Scheduled) {
        Clear-Host
        Write-Header "claude_docs Update Checker v$script:Version"
    }
    
    # Detect setup type
    $setupType = Detect-SetupType
    
    if ($setupType -eq "no-docs") {
        Write-Warning "claude_docs not found in this project"
        Write-Info "Run the master-setup.ps1 script to set up documentation"
        return
    }
    
    # Get current version info
    $versionInfo = Get-CurrentVersionInfo
    
    # Check for remote updates
    $hasUpdates = Check-RemoteUpdates -SetupType $setupType
    
    # Show status report
    Generate-StatusReport -SetupType $setupType
    
    # Handle different modes
    if ($CheckOnly) {
        if ($ShowLog -and $hasUpdates) {
            Show-UpdateChangelog
        }
        return
    }
    
    if ($AutoUpdate -and $hasUpdates) {
        Write-Step "Auto-updating documentation..."
        Apply-Updates -SetupType $setupType
        return
    }
    
    # Interactive mode
    if ($hasUpdates -and !$Scheduled) {
        if (Should-SkipVersion) {
            Write-Info "Skipping this version as requested"
            return
        }
        
        Show-UpdateMenu -SetupType $setupType
    }
}

# Execute main function
Main

# Cleanup
if (!$Scheduled) {
    Write-Host ""
    Write-Info "Documentation check complete!"
    if ($script:UpdatesAvailable -and !$CheckOnly -and !$AutoUpdate) {
        Write-Info "Run again to check for updates anytime"
    }
}

# Exit with appropriate code for scheduled runs
if ($Scheduled) {
    if ($script:UpdatesAvailable) {
        exit 1
    } else {
        exit 0
    }
}