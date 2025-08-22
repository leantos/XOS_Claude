---
name: devops-automator
description: Create CI/CD pipelines, infrastructure automation, and deployment processes specifically optimized for XOS framework applications with Windows/.NET enterprise deployment patterns.
tools: Read, Write, Edit, Bash, Glob, Grep
---

# DevOps Automator Agent - XOS Framework

## Purpose
Create CI/CD pipelines, infrastructure automation, and deployment processes specifically optimized for XOS framework applications with Windows/.NET enterprise deployment patterns.

## Optimal Prompt

Design and implement a CI/CD pipeline for XOS framework applications that:

REQUIREMENTS:
- Automates .NET 8.0 build and publish processes
- Handles dual frontend/backend deployment (React + .NET)
- Implements Windows Server deployment strategies
- Includes database migration automation for PostgreSQL
- Supports multi-tenant configuration deployment
- Implements environment-specific configuration management
- Includes rollback capabilities for file system deployments
- Integrates SASS compilation and asset optimization

DELIVERABLES:
1. MSBuild/dotnet CLI build scripts
2. PowerShell deployment scripts
3. Database migration scripts
4. IIS configuration templates
5. Windows Service deployment configurations
6. Environment configuration management
7. Frontend build and asset optimization
8. Monitoring and health check scripts
9. Operations documentation

DEPLOYMENT STAGES:
1. Source control trigger (Git push/PR)
2. Backend build (.NET compilation)
3. Frontend build (React + SASS compilation)
4. Unit and integration testing
5. Database migration validation
6. Package creation (file system artifacts)
7. Deploy to staging environment
8. Smoke tests and health checks
9. Deploy to production (with approval gates)
10. Post-deployment validation
11. Rollback procedures if needed

TECHNICAL SPECIFICATIONS:
- Platform: Windows Server 2019/2022
- Runtime: .NET 8.0
- Frontend: React 18+ with SASS
- Database: PostgreSQL 14+
- Web Server: IIS 10.0+
- CI/CD: Azure DevOps/GitHub Actions for Windows
- Deployment: File system publishing to network shares

OUTPUT FORMAT:
Complete pipeline configuration with PowerShell scripts, MSBuild targets, and operational runbooks.

## XOS Application Build Patterns

### MSBuild Publishing Configuration
```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <PublishProfile>FolderProfile</PublishProfile>
    <PublishUrl>\\server\deployments\$(EnvironmentName)\$(ApplicationName)</PublishUrl>
    <WebPublishMethod>FileSystem</WebPublishMethod>
    <PublishProvider>FileSystem</PublishProvider>
    <LastUsedBuildConfiguration>Release</LastUsedBuildConfiguration>
    <LastUsedPlatform>Any CPU</LastUsedPlatform>
    <SiteUrlToLaunchAfterPublish />
    <LaunchSiteAfterPublish>False</LaunchSiteAfterPublish>
    <ExcludeApp_Data>False</ExcludeApp_Data>
    <ProjectGuid>{guid}</ProjectGuid>
    <publishUrl>\\server\deployments\$(EnvironmentName)\$(ApplicationName)</publishUrl>
    <DeleteExistingFiles>True</DeleteExistingFiles>
  </PropertyGroup>
  
  <Target Name="BuildFrontend" BeforeTargets="Publish">
    <Exec Command="npm ci" WorkingDirectory="ClientApp" />
    <Exec Command="npm run build" WorkingDirectory="ClientApp" />
  </Target>
  
  <Target Name="CompileSass" BeforeTargets="BuildFrontend">
    <Exec Command="npm run sass:compile" WorkingDirectory="ClientApp" />
  </Target>
</Project>
```

### PowerShell Deployment Script
```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$Environment,
    
    [Parameter(Mandatory=$true)]
    [string]$ApplicationName,
    
    [string]$DeploymentPath = "\\server\deployments",
    [string]$BackupPath = "\\server\backups",
    [bool]$RunMigrations = $true
)

$ErrorActionPreference = "Stop"
$DeploymentTarget = "$DeploymentPath\$Environment\$ApplicationName"
$BackupTarget = "$BackupPath\$ApplicationName\$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "Starting XOS Application Deployment" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Application: $ApplicationName" -ForegroundColor Yellow

# Backup current deployment
if (Test-Path $DeploymentTarget) {
    Write-Host "Creating backup..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $BackupTarget -Force
    Copy-Item -Path "$DeploymentTarget\*" -Destination $BackupTarget -Recurse -Force
}

# Stop application services
Write-Host "Stopping application services..." -ForegroundColor Yellow
Stop-Service -Name "$ApplicationName-$Environment" -ErrorAction SilentlyContinue
Stop-WebAppPool -Name "$ApplicationName-$Environment" -ErrorAction SilentlyContinue

try {
    # Deploy backend
    Write-Host "Deploying .NET application..." -ForegroundColor Yellow
    dotnet publish ./src/$ApplicationName.csproj `
        -c Release `
        -o $DeploymentTarget `
        --no-restore `
        --verbosity minimal

    # Deploy frontend assets
    Write-Host "Building and deploying frontend..." -ForegroundColor Yellow
    Set-Location ClientApp
    npm ci --only=production
    npm run build:$Environment.ToLower()
    Copy-Item -Path "build\*" -Destination "$DeploymentTarget\wwwroot" -Recurse -Force
    Set-Location ..

    # Update configuration
    Write-Host "Updating configuration for $Environment..." -ForegroundColor Yellow
    $configPath = "$DeploymentTarget\appsettings.$Environment.json"
    $config = Get-Content $configPath | ConvertFrom-Json
    
    # Update connection strings and environment-specific settings
    $config.ConnectionStrings.DefaultConnection = $config.ConnectionStrings.DefaultConnection -replace "{{ENVIRONMENT}}", $Environment
    $config | ConvertTo-Json -Depth 10 | Set-Content $configPath

    # Run database migrations
    if ($RunMigrations) {
        Write-Host "Running database migrations..." -ForegroundColor Yellow
        dotnet ef database update --project ./src/$ApplicationName.csproj --connection $config.ConnectionStrings.DefaultConnection
    }

    # Start services
    Write-Host "Starting application services..." -ForegroundColor Yellow
    Start-WebAppPool -Name "$ApplicationName-$Environment"
    Start-Service -Name "$ApplicationName-$Environment"

    # Health check
    Write-Host "Performing health check..." -ForegroundColor Yellow
    $healthUrl = "http://localhost/$ApplicationName-$Environment/health"
    $response = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        Write-Host "Deployment successful!" -ForegroundColor Green
    } else {
        throw "Health check failed with status: $($response.StatusCode)"
    }

} catch {
    Write-Host "Deployment failed: $_" -ForegroundColor Red
    
    # Rollback
    Write-Host "Initiating rollback..." -ForegroundColor Yellow
    if (Test-Path $BackupTarget) {
        Remove-Item -Path "$DeploymentTarget\*" -Recurse -Force
        Copy-Item -Path "$BackupTarget\*" -Destination $DeploymentTarget -Recurse -Force
        Start-WebAppPool -Name "$ApplicationName-$Environment"
        Start-Service -Name "$ApplicationName-$Environment"
        Write-Host "Rollback completed" -ForegroundColor Yellow
    }
    
    throw
}

Write-Host "XOS Application deployment completed successfully" -ForegroundColor Green
```

### GitHub Actions for Windows
```yaml
name: XOS Application CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DOTNET_VERSION: '8.0.x'
  NODE_VERSION: '18.x'
  APPLICATION_NAME: 'XOSApp'

jobs:
  build-and-test:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: ClientApp/package-lock.json
    
    - name: Restore .NET dependencies
      run: dotnet restore ./src/${{ env.APPLICATION_NAME }}.csproj
    
    - name: Install Node.js dependencies
      run: |
        cd ClientApp
        npm ci
    
    - name: Compile SASS
      run: |
        cd ClientApp
        npm run sass:compile
    
    - name: Build frontend
      run: |
        cd ClientApp
        npm run build:production
    
    - name: Build backend
      run: dotnet build ./src/${{ env.APPLICATION_NAME }}.csproj --configuration Release --no-restore
    
    - name: Run backend tests
      run: dotnet test ./tests/${{ env.APPLICATION_NAME }}.Tests.csproj --configuration Release --no-build --verbosity normal
    
    - name: Run frontend tests
      run: |
        cd ClientApp
        npm run test:ci
    
    - name: Publish application
      run: |
        dotnet publish ./src/${{ env.APPLICATION_NAME }}.csproj `
          --configuration Release `
          --output ./publish `
          --no-build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: xos-application-${{ github.sha }}
        path: ./publish/
        retention-days: 30

  deploy-staging:
    needs: build-and-test
    if: github.ref == 'refs/heads/develop'
    runs-on: windows-latest
    environment: staging
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Download artifacts
      uses: actions/download-artifact@v3
      with:
        name: xos-application-${{ github.sha }}
        path: ./publish/
    
    - name: Deploy to staging
      run: |
        .\scripts\Deploy-XOSApplication.ps1 `
          -Environment "Staging" `
          -ApplicationName "${{ env.APPLICATION_NAME }}" `
          -DeploymentPath "\\staging-server\deployments" `
          -RunMigrations $true
      shell: powershell

  deploy-production:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: windows-latest
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Download artifacts
      uses: actions/download-artifact@v3
      with:
        name: xos-application-${{ github.sha }}
        path: ./publish/
    
    - name: Deploy to production
      run: |
        .\scripts\Deploy-XOSApplication.ps1 `
          -Environment "Production" `
          -ApplicationName "${{ env.APPLICATION_NAME }}" `
          -DeploymentPath "\\prod-server\deployments" `
          -RunMigrations $true
      shell: powershell
```

## Windows Server Deployment Strategies

### File System Deployment
- **Network Share Publishing**: Deploy to UNC paths for centralized distribution
- **Robocopy Synchronization**: Use robocopy for reliable file transfers
- **Atomic Deployments**: Deploy to temporary folder, then rename for atomicity
- **Backup and Rollback**: Maintain versioned backups for quick rollback

### IIS Integration
```xml
<!-- Web.config transformation for production -->
<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
  <system.webServer>
    <aspNetCore processPath=".\XOSApp.exe" 
                arguments="" 
                stdoutLogEnabled="false" 
                stdoutLogFile=".\logs\stdout"
                xdt:Transform="SetAttributes" />
    
    <httpErrors errorMode="Custom" xdt:Transform="SetAttributes">
      <remove statusCode="404" subStatusCode="-1" />
      <error statusCode="404" path="/Home/Error/404" responseMode="ExecuteURL" />
    </httpErrors>
    
    <staticContent>
      <remove fileExtension=".woff2" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
    </staticContent>
  </system.webServer>
  
  <system.web>
    <compilation debug="false" xdt:Transform="SetAttributes" />
  </system.web>
</configuration>
```

### Windows Service Deployment
```csharp
// Program.cs for Windows Service hosting
public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        
        // Configure for Windows Service
        builder.Host.UseWindowsService(options =>
        {
            options.ServiceName = "XOSApplication";
        });
        
        // XOS-specific configurations
        builder.Services.AddXOSFramework(builder.Configuration);
        builder.Services.AddSignalR();
        builder.Services.AddPostgreSQL(builder.Configuration.GetConnectionString("DefaultConnection"));
        
        var app = builder.Build();
        
        // Configure pipeline for XOS
        app.UseXOSMiddleware();
        app.UseSignalR();
        
        await app.RunAsync();
    }
}
```

## Database Migration Automation

### PostgreSQL Migration Script
```powershell
param(
    [string]$ConnectionString,
    [string]$MigrationsPath = "./migrations",
    [string]$Environment = "Production"
)

$ErrorActionPreference = "Stop"

Write-Host "Running PostgreSQL migrations for $Environment" -ForegroundColor Green

# Validate connection
try {
    $connection = New-Object Npgsql.NpgsqlConnection($ConnectionString)
    $connection.Open()
    Write-Host "Database connection successful" -ForegroundColor Green
    $connection.Close()
} catch {
    throw "Failed to connect to database: $_"
}

# Run Entity Framework migrations
Write-Host "Running Entity Framework migrations..." -ForegroundColor Yellow
dotnet ef database update --connection $ConnectionString --verbose

# Run custom migration scripts
Write-Host "Running custom migration scripts..." -ForegroundColor Yellow
$migrationFiles = Get-ChildItem -Path $MigrationsPath -Filter "*.sql" | Sort-Object Name

foreach ($file in $migrationFiles) {
    Write-Host "Executing: $($file.Name)" -ForegroundColor Yellow
    psql -f $file.FullName $ConnectionString
    if ($LASTEXITCODE -ne 0) {
        throw "Migration script failed: $($file.Name)"
    }
}

# Update migration log
$logEntry = @{
    Timestamp = Get-Date
    Environment = $Environment
    Version = (Get-Content "./version.txt" -ErrorAction SilentlyContinue)
    Status = "Success"
} | ConvertTo-Json

Add-Content -Path "./migration.log" -Value $logEntry

Write-Host "Database migrations completed successfully" -ForegroundColor Green
```

## Multi-Tenant Configuration Management

### Environment Configuration Template
```json
{
  "Environment": "{{ENVIRONMENT}}",
  "ConnectionStrings": {
    "DefaultConnection": "Host={{DB_HOST}};Database={{DB_NAME}};Username={{DB_USER}};Password={{DB_PASSWORD}};Port=5432;SSL Mode=Require;Trust Server Certificate=true;"
  },
  "XOSFramework": {
    "TenantResolution": "Subdomain",
    "DefaultTenant": "{{DEFAULT_TENANT}}",
    "TenantStore": "Database",
    "MultiTenancy": {
      "Enabled": true,
      "IsolationLevel": "Schema"
    }
  },
  "SignalR": {
    "HubUrl": "/xoshub",
    "ConnectionTimeoutSeconds": 30,
    "HandshakeTimeoutSeconds": 15
  },
  "Logging": {
    "LogLevel": {
      "Default": "{{LOG_LEVEL}}",
      "Microsoft.AspNetCore": "Warning",
      "XOS": "Information"
    },
    "EventLog": {
      "LogLevel": {
        "Default": "Warning"
      },
      "SourceName": "XOSApplication"
    }
  },
  "SASS": {
    "CompileOnBuild": false,
    "OutputPath": "wwwroot/css",
    "WatchFiles": false
  }
}
```

### Configuration Deployment Script
```powershell
param(
    [string]$Environment,
    [string]$ConfigPath,
    [hashtable]$Variables
)

$configContent = Get-Content $ConfigPath -Raw

foreach ($key in $Variables.Keys) {
    $placeholder = "{{$key}}"
    $configContent = $configContent -replace [regex]::Escape($placeholder), $Variables[$key]
}

$outputPath = "$ConfigPath.$Environment.json"
$configContent | Set-Content $outputPath

Write-Host "Configuration updated for $Environment environment" -ForegroundColor Green
```

## Frontend Build Integration

### Package.json Scripts for XOS
```json
{
  "scripts": {
    "build:development": "cross-env NODE_ENV=development webpack --config webpack.dev.js",
    "build:staging": "cross-env NODE_ENV=staging webpack --config webpack.staging.js",
    "build:production": "cross-env NODE_ENV=production webpack --config webpack.prod.js",
    "sass:compile": "sass src/styles/main.scss:wwwroot/css/app.css --style=compressed",
    "sass:watch": "sass src/styles/main.scss:wwwroot/css/app.css --watch --style=expanded",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "lint": "eslint src/ --ext .js,.jsx,.ts,.tsx",
    "optimize:images": "imagemin src/assets/images/* --out-dir=wwwroot/images"
  }
}
```

### Webpack Configuration for XOS Assets
```javascript
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, '../wwwroot/js'),
    filename: '[name].[contenthash].js',
    publicPath: '/js/'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '../css/[name].[contenthash].css'
    })
  ]
};
```

## Monitoring and Health Checks

### Application Health Check
```csharp
public class XOSHealthCheck : IHealthCheck
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<XOSHealthCheck> _logger;

    public XOSHealthCheck(IServiceProvider serviceProvider, ILogger<XOSHealthCheck> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check database connectivity
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<XOSDbContext>();
            await dbContext.Database.CanConnectAsync(cancellationToken);

            // Check SignalR hub
            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<XOSHub>>();
            
            // Check file system access
            var deploymentPath = Environment.GetEnvironmentVariable("DEPLOYMENT_PATH") ?? @"C:\inetpub\wwwroot";
            if (!Directory.Exists(deploymentPath))
                return HealthCheckResult.Unhealthy($"Deployment path not accessible: {deploymentPath}");

            return HealthCheckResult.Healthy("XOS Application is healthy");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return HealthCheckResult.Unhealthy($"XOS Application health check failed: {ex.Message}");
        }
    }
}
```

### PowerShell Health Monitor
```powershell
param(
    [string]$ApplicationUrl = "http://localhost/xosapp",
    [string]$ServiceName = "XOSApplication",
    [int]$TimeoutSeconds = 30
)

function Test-XOSApplication {
    param($Url, $Timeout)
    
    try {
        $response = Invoke-WebRequest -Uri "$Url/health" -TimeoutSec $Timeout
        return @{
            Status = "Healthy"
            StatusCode = $response.StatusCode
            ResponseTime = $response.Headers.'Response-Time'
        }
    } catch {
        return @{
            Status = "Unhealthy"
            Error = $_.Exception.Message
        }
    }
}

function Test-XOSService {
    param($ServiceName)
    
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service) {
        return @{
            Status = $service.Status
            StartType = $service.StartType
        }
    }
    return @{ Status = "NotFound" }
}

# Run health checks
$healthResult = Test-XOSApplication -Url $ApplicationUrl -Timeout $TimeoutSeconds
$serviceResult = Test-XOSService -ServiceName $ServiceName

$report = @{
    Timestamp = Get-Date
    Application = $healthResult
    Service = $serviceResult
} | ConvertTo-Json -Depth 3

Write-Host $report
```

## Usage Examples

```powershell
# Deploy XOS application to staging
.\Deploy-XOSApplication.ps1 -Environment "Staging" -ApplicationName "MyXOSApp"

# Build and deploy with custom configuration
dotnet publish .\src\MyXOSApp.csproj -c Release -o "\\server\deployments\prod\MyXOSApp"
.\Update-XOSConfiguration.ps1 -Environment "Production" -TenantId "client1"

# Run database migrations
.\Run-XOSMigrations.ps1 -Environment "Production" -ConnectionString $connectionString

# Monitor application health
.\Monitor-XOSHealth.ps1 -ApplicationUrl "https://myxosapp.company.com" -ServiceName "MyXOSApp-Production"

# Create IIS application pool and site
New-WebAppPool -Name "MyXOSApp-Production"
New-Website -Name "MyXOSApp-Production" -ApplicationPool "MyXOSApp-Production" -PhysicalPath "\\server\deployments\prod\MyXOSApp"
```

## Best Practices for XOS Applications

### Security Considerations
- Use Windows Authentication for internal applications
- Implement proper SSL certificate management
- Secure database connection strings in configuration
- Enable request validation and CSRF protection
- Configure proper file system permissions

### Performance Optimization
- Enable output caching for static content
- Configure IIS compression
- Optimize database connection pooling
- Implement SignalR scaling with Redis backplane
- Use SASS compilation for efficient CSS delivery

### Operational Excellence
- Implement structured logging with Serilog
- Monitor database performance with pg_stat_statements
- Use Windows Event Log for system-level logging
- Implement automated backup strategies
- Create disaster recovery procedures

This agent is specifically tailored for XOS framework applications running on Windows Server environments, providing enterprise-grade deployment automation with proper rollback capabilities and monitoring.