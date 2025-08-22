# PostgreSQL MCP Server Installation Script for Claude Code
# This script automates the installation and configuration of postgres-mcp

param(
    [Parameter(Mandatory=$false)]
    [string]$ConnectionString
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "PostgreSQL MCP Server Installation for Claude Code" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Function to test command availability
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Step 1: Check Python
Write-Host "[1/5] Checking Python installation..." -ForegroundColor Yellow
if (Test-Command "python") {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Python not found. Please install Python 3.12+ from https://python.org" -ForegroundColor Red
    exit 1
}

# Step 2: Install pipx
Write-Host "[2/5] Installing pipx..." -ForegroundColor Yellow
if (Test-Command "pipx") {
    Write-Host "✓ pipx already installed" -ForegroundColor Green
} else {
    Write-Host "Installing pipx..." -ForegroundColor White
    python -m pip install --user pipx
    python -m pipx ensurepath
    Write-Host "✓ pipx installed successfully" -ForegroundColor Green
    Write-Host "Note: You may need to restart your terminal for PATH changes to take effect" -ForegroundColor Yellow
}

# Step 3: Install postgres-mcp
Write-Host "[3/5] Installing postgres-mcp..." -ForegroundColor Yellow
if (Test-Command "postgres-mcp") {
    Write-Host "✓ postgres-mcp already installed" -ForegroundColor Green
    $upgrade = Read-Host "Do you want to upgrade to the latest version? (y/n)"
    if ($upgrade -eq 'y') {
        python -m pipx upgrade postgres-mcp
        Write-Host "✓ postgres-mcp upgraded" -ForegroundColor Green
    }
} else {
    Write-Host "Installing postgres-mcp..." -ForegroundColor White
    python -m pipx install postgres-mcp
    Write-Host "✓ postgres-mcp installed successfully" -ForegroundColor Green
}

# Step 4: Configure connection string
Write-Host "[4/5] Configuring database connection..." -ForegroundColor Yellow

if (-not $ConnectionString) {
    Write-Host ""
    Write-Host "Please provide your PostgreSQL connection string" -ForegroundColor Cyan
    Write-Host "Format: postgresql://username:password@host:port/database" -ForegroundColor Gray
    Write-Host "Example: postgresql://postgres:admin@localhost:5432/CVS" -ForegroundColor Gray
    Write-Host ""
    $ConnectionString = Read-Host "Connection string"
}

# Validate connection string format
if ($ConnectionString -notmatch "^postgresql://.*") {
    Write-Host "✗ Invalid connection string format. Must start with 'postgresql://'" -ForegroundColor Red
    exit 1
}

# Step 5: Create Claude Code configuration
Write-Host "[5/5] Configuring Claude Code..." -ForegroundColor Yellow

$projectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$claudeConfigDir = Join-Path $projectRoot ".claude"
$settingsFile = Join-Path $claudeConfigDir "settings.json"

# Ensure .claude directory exists
if (-not (Test-Path $claudeConfigDir)) {
    New-Item -ItemType Directory -Path $claudeConfigDir -Force | Out-Null
}

# Read existing settings or create new
if (Test-Path $settingsFile) {
    $settings = Get-Content $settingsFile -Raw | ConvertFrom-Json
} else {
    $settings = @{}
}

# Add MCP server configuration
if (-not $settings.mcpServers) {
    $settings | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value @{} -Force
}

$mcpConfig = @{
    command = "postgres-mcp"
    args = @("--access-mode=unrestricted")
    env = @{
        DATABASE_URI = $ConnectionString
    }
}

$settings.mcpServers | Add-Member -MemberType NoteProperty -Name "postgres" -Value $mcpConfig -Force

# Save settings
$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsFile
Write-Host "✓ Claude Code configuration updated" -ForegroundColor Green

# Create .env file for local development
$envFile = Join-Path $projectRoot ".env"
$envContent = @"
# PostgreSQL MCP Configuration
DATABASE_URI=$ConnectionString
ACCESS_MODE=unrestricted
"@

if (Test-Path $envFile) {
    Write-Host "Note: .env file already exists. Add the following manually if needed:" -ForegroundColor Yellow
    Write-Host $envContent -ForegroundColor Gray
} else {
    $envContent | Set-Content $envFile
    Write-Host "✓ .env file created" -ForegroundColor Green
}

# Test the installation
Write-Host ""
Write-Host "Testing postgres-mcp installation..." -ForegroundColor Yellow
try {
    $env:DATABASE_URI = $ConnectionString
    $testOutput = postgres-mcp --help 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ postgres-mcp is working correctly" -ForegroundColor Green
    } else {
        Write-Host "⚠ postgres-mcp installed but may have issues" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not test postgres-mcp: $_" -ForegroundColor Yellow
}

# Final instructions
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart Claude Code to load the new MCP server" -ForegroundColor White
Write-Host "2. Test by asking Claude: 'Check my database health'" -ForegroundColor White
Write-Host "3. For production, change access-mode to 'restricted'" -ForegroundColor White
Write-Host ""
Write-Host "Available commands in Claude Code:" -ForegroundColor Cyan
Write-Host "- List tables in database" -ForegroundColor White
Write-Host "- Analyze slow queries" -ForegroundColor White
Write-Host "- Suggest database indexes" -ForegroundColor White
Write-Host "- Check database health" -ForegroundColor White
Write-Host ""
Write-Host "Documentation: .\claude_docs\setup\postgres-mcp-setup.md" -ForegroundColor Gray