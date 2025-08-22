# claude_docs Update System

Automated system for checking and applying updates to your claude_docs documentation. Works with main repositories, submodules, and local copies.

## Quick Start

### 🚀 Check for Updates (Interactive)
```bash
# Double-click or run:
check-docs-updates.bat

# Or PowerShell directly:
.\check-docs-updates.ps1
```

### ⚡ Command Line Options
```powershell
# Just check, don't update
.\check-docs-updates.ps1 -CheckOnly

# Check and show changelog
.\check-docs-updates.ps1 -CheckOnly -ShowLog

# Auto-update without prompts (use carefully!)
.\check-docs-updates.ps1 -AutoUpdate

# Silent mode for scripts/scheduling
.\check-docs-updates.ps1 -Scheduled
```

## Features

### ✅ **Smart Detection**
- **Main Repository**: Updates via `git pull` + regenerates HTML
- **Submodule**: Updates via `git submodule update --remote`
- **Local Copy**: Updates via `git pull`
- **Auto-detects** setup type and uses appropriate update method

### ✅ **Interactive Updates**
- **Changelog Display**: See exactly what's new before updating
- **Selective Updates**: Choose when to update or skip versions  
- **Commit Integration**: Automatically commits submodule updates
- **HTML Regeneration**: Updates HTML docs after markdown changes

### ✅ **Scheduling Support**
- **Windows Task Scheduler**: Built-in scheduler setup
- **Silent Operation**: Runs in background without interruption
- **Status Reporting**: Returns exit codes for monitoring
- **Configurable Frequency**: Daily, weekly, or monthly checks

## Interactive Menu Options

When updates are available, you'll see:

```
🔄 Update Options:
  [1] 📋 Show detailed changelog
  [2] 🆙 Apply updates now  
  [3] ⏰ Remind me later
  [4] 🚫 Skip this version
```

### Option Details:

1. **📋 Show Changelog**: 
   - Lists all new commits since your current version
   - Shows new, modified, and deleted files
   - Helps you understand what's changing

2. **🆙 Apply Updates**:
   - Updates documentation using appropriate method
   - Commits submodule updates automatically
   - Regenerates HTML documentation
   - Creates update log for tracking

3. **⏰ Remind Later**:
   - Sets reminder for next day
   - Will prompt again on next run
   - Good for busy times

4. **🚫 Skip Version**:
   - Permanently skips this specific version
   - Won't prompt again until newer version available
   - Use for versions you don't want/need

## Scheduled Automation

### Setup Automatic Checking
```powershell
# Run as Administrator
.\setup-docs-scheduler.ps1 -Frequency Weekly -Time "09:00"
```

### Scheduler Options:
- **Daily**: Check every day at specified time
- **Weekly**: Check every Monday at specified time  
- **Monthly**: Check every 4 weeks at specified time

### Manage Scheduled Tasks:
```powershell
# Remove scheduled task
.\setup-docs-scheduler.ps1 -Remove

# Test scheduled run
.\check-docs-updates.ps1 -Scheduled
```

## Setup Types & Behavior

### 📂 **Main Repository** 
*Has both claude_docs/ and update-html-docs.ps1*

**Update Process:**
1. `git pull origin main` in claude_docs
2. Run `update-html-docs.ps1` to regenerate HTML
3. Report completion

**Best For**: Documentation maintainers and main repo developers

### 📦 **Submodule Setup**
*Has .gitmodules with claude_docs entry*

**Update Process:**
1. `git submodule update --remote claude_docs`
2. `git add claude_docs` and commit the update
3. Report completion with commit hash

**Best For**: Team members using documentation as submodule

### 📁 **Local Copy**
*Has claude_docs/ but not main repo setup*

**Update Process:**
1. `git pull origin main` in claude_docs directory
2. Report completion

**Best For**: Individual developers with local documentation copies

## Status Information

The checker provides detailed status including:

- **Setup Type**: Main repo, submodule, or local copy
- **Current Branch**: Which branch you're tracking
- **Last Updated**: When documentation was last updated
- **Updates Available**: How many commits you're behind
- **Local Changes**: Warns if you have uncommitted changes

## Advanced Usage

### Integration with CI/CD
```yaml
# GitHub Actions example
- name: Check docs updates
  run: |
    if (.\check-docs-updates.ps1 -Scheduled) {
      Write-Host "Documentation is up to date"
    } else {
      Write-Host "Documentation updates available"
    }
```

### Batch Processing Multiple Projects
```powershell
# Check all projects in a directory
Get-ChildItem -Directory | ForEach-Object {
    Set-Location $_.FullName
    if (Test-Path "check-docs-updates.ps1") {
        Write-Host "Checking $($_.Name)..."
        .\check-docs-updates.ps1 -CheckOnly
    }
}
```

### Custom Update Notifications
```powershell
# Email notification example
$result = .\check-docs-updates.ps1 -Scheduled
if ($result -eq 1) {
    Send-MailMessage -Subject "Documentation Updates Available" `
                     -Body "New claude_docs updates are ready" `
                     -To "team@company.com"
}
```

## File Tracking

The update system creates these tracking files:

- **`.claude_docs_last_update.json`**: Records last successful update
- **`.claude_docs_reminder.txt`**: Stores reminder dates  
- **`.claude_docs_skip_version.txt`**: Tracks skipped versions

These files are automatically managed and can be safely ignored in git.

## Troubleshooting

### ❌ "claude_docs not found"
**Solution**: Run `.\master-setup.ps1` to set up documentation first

### ❌ "Could not fetch updates"  
**Solutions**:
- Check internet connection
- Verify git remote is accessible
- Ensure you have read access to documentation repo

### ❌ "Failed to update submodule"
**Solutions**:
- Make sure parent repo has no uncommitted changes
- Check that you have write access to parent repo
- Verify submodule remote URL is correct

### ❌ "Permission denied" for scheduled tasks
**Solution**: Run `setup-docs-scheduler.ps1` as Administrator

### 💡 **General Tips**:
- Always commit local changes before updating
- Test updates in non-production environments first
- Keep your git remotes up to date
- Use `-CheckOnly` flag to preview updates safely

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `.\check-docs-updates.ps1` | Interactive update check |
| `.\check-docs-updates.ps1 -CheckOnly -ShowLog` | Preview updates |
| `.\check-docs-updates.ps1 -AutoUpdate` | Apply updates automatically |
| `.\setup-docs-scheduler.ps1` | Setup automatic checking |
| `.\master-setup.ps1` | Initial documentation setup |

🎉 **Keep your documentation current effortlessly!**