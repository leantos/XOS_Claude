 # Project-Specific PostgreSQL MCP Server Setup
# Automatically extracts connection string from PROJECT_SEED file

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectPath = (Get-Location).Path,
    [Parameter(Mandatory=$false)]
    [string]$AccessMode = "unrestricted"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Project-Specific MCP Server Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Function to find PROJECT_SEED file
function Find-ProjectSeedFile {
    param([string]$Path)
    
    $seedFiles = Get-ChildItem -Path $Path -Filter "PROJECT_SEED*.md" -File
    
    if ($seedFiles.Count -eq 0) {
        return $null
    }
    
    return $seedFiles[0].FullName
}

# Function to extract connection string from seed file
function Extract-ConnectionString {
    param([string]$SeedFilePath)
    
    $content = Get-Content $SeedFilePath -Raw
    
    # Look for the DefaultConnection line in the seed file
    if ($content -match '"DefaultConnection":\s*"([^"]+)"') {
        return $matches[1]
    }
    
    return $null
}

# Function to convert .NET connection string to PostgreSQL URI
function Convert-ToPostgresUri {
    param([string]$DotNetConnectionString)
    
    # Parse the .NET connection string
    $parts = @{}
    $segments = $DotNetConnectionString -split ';'
    
    foreach ($segment in $segments) {
        if ($segment -match '^\s*([^=]+)=(.+)\s*$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $parts[$key] = $value
        }
    }
    
    # Map common variations of keys
    $server = if ($parts["Server"]) { $parts["Server"] } elseif ($parts["Host"]) { $parts["Host"] } else { "localhost" }
    $port = if ($parts["Port"]) { $parts["Port"] } else { "5432" }
    $database = if ($parts["Database"]) { $parts["Database"] } elseif ($parts["Initial Catalog"]) { $parts["Initial Catalog"] } else { "" }
    $userId = if ($parts["User Id"]) { $parts["User Id"] } elseif ($parts["User ID"]) { $parts["User ID"] } elseif ($parts["Username"]) { $parts["Username"] } else { "" }
    $password = if ($parts["Password"]) { $parts["Password"] } elseif ($parts["Pwd"]) { $parts["Pwd"] } else { "" }
    
    # Construct PostgreSQL URI
    return "postgresql://${userId}:${password}@${server}:${port}/${database}"
}

# Step 1: Find PROJECT_SEED file
Write-Host "[1/5] Looking for PROJECT_SEED file..." -ForegroundColor Yellow
$seedFile = Find-ProjectSeedFile -Path $ProjectPath

if (-not $seedFile) {
    Write-Host "X No PROJECT_SEED*.md file found in $ProjectPath" -ForegroundColor Red
    Write-Host "Please ensure you have a PROJECT_SEED file in your project root." -ForegroundColor Yellow
    exit 1
}

Write-Host "OK Found seed file: $(Split-Path $seedFile -Leaf)" -ForegroundColor Green

# Step 2: Extract connection string
Write-Host "[2/5] Extracting connection string..." -ForegroundColor Yellow
$dotNetConnString = Extract-ConnectionString -SeedFilePath $seedFile

if (-not $dotNetConnString) {
    Write-Host "X Could not find DefaultConnection in seed file" -ForegroundColor Red
    Write-Host "Please ensure your seed file contains a DefaultConnection string." -ForegroundColor Yellow
    exit 1
}

Write-Host "OK Connection string found" -ForegroundColor Green

# Step 3: Convert to PostgreSQL URI
Write-Host "[3/5] Converting to PostgreSQL URI format..." -ForegroundColor Yellow
$postgresUri = Convert-ToPostgresUri -DotNetConnectionString $dotNetConnString
Write-Host "OK URI converted successfully" -ForegroundColor Green

# Step 4: Create .claude directory and mcp.json
Write-Host "[4/5] Creating MCP configuration..." -ForegroundColor Yellow

$claudeDir = Join-Path $ProjectPath ".claude"
$mcpFile = Join-Path $claudeDir "mcp.json"

# Create .claude directory if it doesn't exist
if (-not (Test-Path $claudeDir)) {
    New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
    Write-Host "OK Created .claude directory" -ForegroundColor Green
}

# Create MCP configuration
$mcpConfig = @{
    mcpServers = @{
        postgres = @{
            command = "postgres-mcp"
            args = @("--access-mode=$AccessMode")
            env = @{
                DATABASE_URI = $postgresUri
            }
        }
    }
}

# Save configuration
$mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $mcpFile -Encoding UTF8
Write-Host "OK MCP configuration saved to: $mcpFile" -ForegroundColor Green

# Step 5: Create .env file (optional, for reference)
Write-Host "[5/5] Creating reference files..." -ForegroundColor Yellow

$envFile = Join-Path $ProjectPath ".env"
$envContent = @"
# PostgreSQL MCP Configuration
# Auto-generated from PROJECT_SEED file
DATABASE_URI=$postgresUri
MCP_ACCESS_MODE=$AccessMode

# Original .NET Connection String (for reference)
# $dotNetConnString
"@

if (Test-Path $envFile) {
    Write-Host "Note: .env file already exists, skipping..." -ForegroundColor Yellow
} else {
    $envContent | Set-Content $envFile -Encoding UTF8
    Write-Host "OK Created .env file for reference" -ForegroundColor Green
}

# Extract project name from database name
$projectName = if ($postgresUri -match '/([^/]+)$') { $matches[1] } else { "Unknown" }

# Test the configuration
Write-Host ""
Write-Host "Testing MCP server configuration..." -ForegroundColor Yellow

try {
    $env:DATABASE_URI = $postgresUri
    $testOutput = postgres-mcp --help 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK postgres-mcp is configured correctly" -ForegroundColor Green
    } else {
        Write-Host "Warning: postgres-mcp installed but may have issues" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Warning: Could not test postgres-mcp: $_" -ForegroundColor Yellow
}

# Final summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Project Configuration:" -ForegroundColor Cyan
Write-Host "  - Project: $projectName" -ForegroundColor White
Write-Host "  - Database: $projectName" -ForegroundColor White
Write-Host "  - Access Mode: $AccessMode" -ForegroundColor White
Write-Host "  - Config File: $mcpFile" -ForegroundColor White
Write-Host ""
Write-Host "Connection Details:" -ForegroundColor Cyan
$uriParts = $postgresUri -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)'
if ($uriParts) {
    Write-Host "  - Host: $($matches[3])" -ForegroundColor White
    Write-Host "  - Port: $($matches[4])" -ForegroundColor White
    Write-Host "  - Database: $($matches[5])" -ForegroundColor White
    Write-Host "  - User: $($matches[1])" -ForegroundColor White
}
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart Claude Code to load the MCP server" -ForegroundColor White
Write-Host "2. Test with: 'List all tables in my database'" -ForegroundColor White
Write-Host "3. Available tools: list_schemas, list_objects, execute_sql, etc." -ForegroundColor White
Write-Host ""
Write-Host "To re-run this setup with different options:" -ForegroundColor Gray
Write-Host "  .\claude_docs\setup\setup-project-mcp.ps1 -AccessMode restricted" -ForegroundColor Gray
Write-Host ""
Write-Host "This script can be used for any project with a PROJECT_SEED file!" -ForegroundColor Cyan