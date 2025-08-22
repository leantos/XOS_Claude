#Requires -Version 5.1
<#
.SYNOPSIS
    Updates HTML documentation from Markdown files in claude_docs directory
    
.DESCRIPTION
    Scans all .md files in claude_docs, converts them to HTML, updates cross-references,
    and ensures all internal links point to .html files instead of .md files.
    
.PARAMETER BackupFirst
    Create backup of existing HTML files before updating
    
.PARAMETER Verbose
    Show detailed progress information
    
.EXAMPLE
    .\update-html-docs.ps1
    
.EXAMPLE
    .\update-html-docs.ps1 -BackupFirst -Verbose
#>

param(
    [switch]$BackupFirst,
    [switch]$Verbose
)

# Configuration
$claudeDocsPath = "claude_docs"
$htmlOutputPath = "claude_docs/html-docs"
$templatePath = "claude_docs/html-template.html"
$backupPath = "claude_docs/.backup-html"

# Ensure output directory exists
if (!(Test-Path $htmlOutputPath)) {
    New-Item -ItemType Directory -Path $htmlOutputPath -Force | Out-Null
}

# Backup existing HTML files if requested
if ($BackupFirst -and (Test-Path $htmlOutputPath)) {
    Write-Host "📦 Creating backup of existing HTML files..." -ForegroundColor Cyan
    if (Test-Path $backupPath) {
        Remove-Item $backupPath -Recurse -Force
    }
    Copy-Item $htmlOutputPath $backupPath -Recurse -Force
    Write-Host "✅ Backup created at: $backupPath" -ForegroundColor Green
}

# Function to convert markdown to HTML
function ConvertTo-HTML {
    param(
        [string]$MarkdownContent,
        [string]$Title,
        [string]$FilePath
    )
    
    # Simple markdown to HTML conversion
    $html = $MarkdownContent
    
    # Convert headers
    $html = $html -replace '^# (.+)$', '<h1>$1</h1>' -replace '(?m)^## (.+)$', '<h2>$1</h2>' -replace '(?m)^### (.+)$', '<h3>$1</h3>'
    
    # Convert bold/italic
    $html = $html -replace '\*\*([^*]+)\*\*', '<strong>$1</strong>'
    $html = $html -replace '\*([^*]+)\*', '<em>$1</em>'
    
    # Convert code blocks
    $html = $html -replace '```([^`]*?)```', '<div class="code-block"><pre><code>$1</code></pre></div>'
    $html = $html -replace '`([^`]+)`', '<code>$1</code>'
    
    # Convert links
    $html = $html -replace '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2">$1</a>'
    
    # Convert lists
    $html = $html -replace '(?m)^- (.+)$', '<li>$1</li>'
    $html = $html -replace '(?m)^(\d+)\. (.+)$', '<li>$2</li>'
    
    # Wrap lists
    $html = $html -replace '(<li>.*?</li>)', '<ul>$1</ul>' -replace '</ul>\s*<ul>', ''
    
    # Convert line breaks
    $html = $html -replace "`n`n", '</p><p>' -replace '^(.)', '<p>$1' -replace '(.)$', '$1</p>'
    
    # Load template if exists
    if (Test-Path $templatePath) {
        $template = Get-Content $templatePath -Raw
        $template = $template -replace '{{TITLE}}', $Title
        $template = $template -replace '{{CONTENT}}', $html
        return $template
    } else {
        # Basic HTML structure
        return @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$Title</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <main class="main-content">
            $html
        </main>
    </div>
</body>
</html>
"@
    }
}

# Function to update cross-references
function Update-CrossReferences {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw
    if (!$content) { return }
    
    # Update @claude_docs/*.md references to *.html
    $content = $content -replace '@claude_docs/([^"]*?)\.md', '$1.html'
    
    # Update local .md references to .html
    $content = $content -replace '([^@])([^/]*?)\.md"', '$1$2.html"'
    $content = $content -replace '([^@])([^/]*?)\.md#', '$1$2.html#'
    
    # Update href links
    $content = $content -replace 'href="([^"]*?)\.md"', 'href="$1.html"'
    $content = $content -replace 'href="([^"]*?)\.md#([^"]*?)"', 'href="$1.html#$2"'
    
    Set-Content $FilePath $content -NoNewline
}

# Main processing
Write-Host "🚀 Starting HTML documentation update..." -ForegroundColor Green
Write-Host "📁 Source: $claudeDocsPath" -ForegroundColor Gray
Write-Host "📁 Output: $htmlOutputPath" -ForegroundColor Gray
Write-Host ""

# Find all markdown files
$markdownFiles = Get-ChildItem -Path $claudeDocsPath -Filter "*.md" -Recurse
$processedCount = 0
$createdCount = 0
$updatedCount = 0

foreach ($mdFile in $markdownFiles) {
    $relativePath = $mdFile.FullName.Substring((Resolve-Path $claudeDocsPath).Path.Length + 1)
    $htmlFileName = [System.IO.Path]::GetFileNameWithoutExtension($mdFile.Name) + ".html"
    $htmlFilePath = Join-Path $htmlOutputPath $htmlFileName
    
    # Skip if in html-docs directory itself
    if ($relativePath.StartsWith("html-docs\")) {
        continue
    }
    
    if ($Verbose) {
        Write-Host "📄 Processing: $relativePath" -ForegroundColor Yellow
    }
    
    try {
        # Read markdown content
        $markdownContent = Get-Content $mdFile.FullName -Raw -Encoding UTF8
        
        # Generate title from filename or first header
        $title = [System.IO.Path]::GetFileNameWithoutExtension($mdFile.Name)
        if ($markdownContent -match '^# (.+)$') {
            $title = $matches[1]
        }
        
        # Convert to HTML
        $htmlContent = ConvertTo-HTML -MarkdownContent $markdownContent -Title $title -FilePath $mdFile.FullName
        
        # Check if HTML file exists
        $existed = Test-Path $htmlFilePath
        
        # Write HTML file
        Set-Content $htmlFilePath $htmlContent -Encoding UTF8
        
        if ($existed) {
            $updatedCount++
            if ($Verbose) {
                Write-Host "  ✅ Updated: $htmlFileName" -ForegroundColor Green
            }
        } else {
            $createdCount++
            if ($Verbose) {
                Write-Host "  🆕 Created: $htmlFileName" -ForegroundColor Cyan
            }
        }
        
        $processedCount++
    }
    catch {
        Write-Host "  ❌ Error processing $($mdFile.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Update cross-references in all HTML files
Write-Host ""
Write-Host "🔗 Updating cross-references..." -ForegroundColor Cyan

$htmlFiles = Get-ChildItem -Path $htmlOutputPath -Filter "*.html"
foreach ($htmlFile in $htmlFiles) {
    Update-CrossReferences -FilePath $htmlFile.FullName
    if ($Verbose) {
        Write-Host "  🔗 Updated links in: $($htmlFile.Name)" -ForegroundColor Gray
    }
}

# Generate summary
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Green
Write-Host "  • Processed: $processedCount markdown files" -ForegroundColor White
Write-Host "  • Created: $createdCount new HTML files" -ForegroundColor Cyan
Write-Host "  • Updated: $updatedCount existing HTML files" -ForegroundColor Yellow
Write-Host "  • Fixed cross-references in: $($htmlFiles.Count) HTML files" -ForegroundColor Gray

# Check for orphaned HTML files (HTML without corresponding MD)
Write-Host ""
Write-Host "🧹 Checking for orphaned HTML files..." -ForegroundColor Magenta

$orphanedFiles = @()
foreach ($htmlFile in $htmlFiles) {
    $mdFileName = [System.IO.Path]::GetFileNameWithoutExtension($htmlFile.Name) + ".md"
    $mdExists = $false
    
    foreach ($mdFile in $markdownFiles) {
        if ($mdFile.Name -eq $mdFileName) {
            $mdExists = $true
            break
        }
    }
    
    if (!$mdExists) {
        $orphanedFiles += $htmlFile.Name
    }
}

if ($orphanedFiles.Count -gt 0) {
    Write-Host "⚠️  Found $($orphanedFiles.Count) HTML files without corresponding MD files:" -ForegroundColor Yellow
    foreach ($orphan in $orphanedFiles) {
        Write-Host "    • $orphan" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ No orphaned HTML files found" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 HTML documentation update complete!" -ForegroundColor Green
Write-Host "📁 All HTML files are in: $htmlOutputPath" -ForegroundColor Gray

# Option to open the documentation
$response = Read-Host "Would you like to open the documentation hub? (y/N)"
if ($response -eq 'y' -or $response -eq 'Y') {
    $indexPath = Join-Path $htmlOutputPath "README.html"
    if (Test-Path $indexPath) {
        Start-Process $indexPath
    } else {
        Start-Process $htmlOutputPath
    }
}