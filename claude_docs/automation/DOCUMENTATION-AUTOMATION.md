# Documentation Automation System

This system automatically converts Markdown files to HTML and maintains cross-references between documentation files.

## Quick Start

### Option 1: Double-click the batch file
```
update-docs.bat
```

### Option 2: Run PowerShell script directly  
```powershell
.\update-html-docs.ps1
```

### Option 3: With options
```powershell
.\update-html-docs.ps1 -BackupFirst -Verbose
```

## What It Does

1. **Scans** all `.md` files in the `claude_docs` directory
2. **Converts** them to HTML using the template in `claude_docs/html-template.html`
3. **Updates** all cross-references from `.md` to `.html` links
4. **Creates** missing HTML files automatically
5. **Maintains** existing HTML file structure and styling
6. **Reports** summary of changes made

## Files Created

- `update-html-docs.ps1` - Main PowerShell script
- `update-docs.bat` - Simple double-click wrapper
- `claude_docs/html-template.html` - Template for new HTML files
- `claude_docs/.backup-html/` - Backup location (when using -BackupFirst)

## Features

### ✅ **Automatic Conversion**
- Converts headers, lists, links, code blocks
- Preserves file structure and relationships
- Uses consistent HTML template

### ✅ **Cross-Reference Updates**  
- Changes `@claude_docs/file.md` to `file.html`
- Updates `href="*.md"` to `href="*.html"`
- Maintains anchor links (`#sections`)

### ✅ **Safety Features**
- Optional backup before changes (`-BackupFirst`)
- Detects orphaned HTML files
- Detailed progress reporting (`-Verbose`)

### ✅ **Integration Ready**
- Works with existing HTML files
- Preserves custom styling and scripts
- Compatible with git hooks and CI/CD

## Usage Examples

### Regular Update
```powershell
.\update-html-docs.ps1
```

### Safe Update with Backup
```powershell
.\update-html-docs.ps1 -BackupFirst -Verbose
```

### Schedule with Task Scheduler
```powershell
# Create scheduled task to run daily
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\path\to\update-html-docs.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "2:00AM"
Register-ScheduledTask -TaskName "Update XOS Docs" -Action $action -Trigger $trigger
```

## Customization

### Template Modification
Edit `claude_docs/html-template.html` to customize:
- Page layout and styling
- Navigation structure  
- Header/footer content
- JavaScript functionality

### Script Configuration
Modify variables in `update-html-docs.ps1`:
```powershell
$claudeDocsPath = "claude_docs"      # Source markdown location
$htmlOutputPath = "claude_docs/html-docs"  # HTML output location
$templatePath = "claude_docs/html-template.html"  # Template file
```

## Integration Options

### Git Hook Integration
Add to `.githooks/post-commit`:
```bash
#!/bin/bash
if git diff-tree --no-commit-id --name-only -r HEAD | grep -q "claude_docs.*\.md"; then
    powershell -File update-html-docs.ps1
    git add claude_docs/html-docs/*.html
    git commit -m "🤖 Auto-update HTML documentation"
fi
```

### VS Code Task
Add to `.vscode/tasks.json`:
```json
{
    "label": "Update HTML Docs",
    "type": "shell",
    "command": "powershell",
    "args": ["-File", "update-html-docs.ps1", "-Verbose"],
    "group": "build",
    "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
    }
}
```

## Troubleshooting

### PowerShell Execution Policy
If you get execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Template Not Found
The script will work without a template, but for best results:
1. Ensure `claude_docs/html-template.html` exists
2. Template must contain `{{TITLE}}` and `{{CONTENT}}` placeholders

### Orphaned HTML Files
The script reports HTML files without corresponding MD files. These are usually:
- Manually created HTML files (keep them)
- Old files that should be deleted
- Files that were renamed in Markdown

### Cross-Reference Issues
If links don't work after conversion:
1. Check that referenced files exist in `claude_docs/html-docs/`
2. Verify anchor links match header IDs in target files
3. Run script again to update all cross-references

## Advanced Features

### Batch Processing
Process multiple directories:
```powershell
$directories = @("claude_docs", "other_docs", "api_docs")
foreach ($dir in $directories) {
    .\update-html-docs.ps1 -SourcePath $dir
}
```

### Custom Markdown Processing
Add custom markdown extensions by modifying the `ConvertTo-HTML` function.

### Automatic Deployment
Combine with rsync or robocopy for automatic deployment:
```powershell
.\update-html-docs.ps1
robocopy "claude_docs\html-docs" "\\server\docs\" /MIR
```

---

🎉 **Your documentation is now fully automated!** Just run the script whenever you want to sync your HTML files with your Markdown changes.