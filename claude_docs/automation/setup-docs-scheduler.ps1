#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Sets up scheduled task to check for claude_docs updates
    
.DESCRIPTION
    Creates a Windows scheduled task that runs the documentation update checker
    on a regular schedule. Can be configured for daily, weekly, or custom intervals.
    
.PARAMETER Frequency
    How often to check for updates: Daily, Weekly, Monthly
    
.PARAMETER Time
    Time of day to run the check (24-hour format, e.g., "09:00")
    
.PARAMETER Remove
    Remove the existing scheduled task
    
.EXAMPLE
    .\setup-docs-scheduler.ps1 -Frequency Daily -Time "09:00"
    
.EXAMPLE
    .\setup-docs-scheduler.ps1 -Remove
#>

param(
    [ValidateSet("Daily", "Weekly", "Monthly")]
    [string]$Frequency = "Weekly",
    
    [string]$Time = "09:00",
    
    [switch]$Remove
)

$TaskName = "claude_docs Update Checker"
$ScriptPath = Join-Path (Get-Location).Path "check-docs-updates.ps1"

if ($Remove) {
    try {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
        Write-Host "✅ Scheduled task '$TaskName' removed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Task not found or could not be removed: $($_.Exception.Message)" -ForegroundColor Red
    }
    return
}

# Validate script exists
if (!(Test-Path $ScriptPath)) {
    Write-Host "❌ check-docs-updates.ps1 not found in current directory" -ForegroundColor Red
    exit 1
}

try {
    # Create the action
    $Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`" -Scheduled"
    
    # Create the trigger based on frequency
    switch ($Frequency) {
        "Daily" {
            $Trigger = New-ScheduledTaskTrigger -Daily -At $Time
        }
        "Weekly" {
            $Trigger = New-ScheduledTaskTrigger -Weekly -At $Time -DaysOfWeek Monday
        }
        "Monthly" {
            $Trigger = New-ScheduledTaskTrigger -Weekly -At $Time -WeeksInterval 4
        }
    }
    
    # Create task settings
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -Hidden
    
    # Create the principal (run as current user)
    $Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive
    
    # Register the task
    $Task = New-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal
    Register-ScheduledTask -TaskName $TaskName -InputObject $Task -Force
    
    Write-Host "✅ Scheduled task created successfully!" -ForegroundColor Green
    Write-Host "📅 Schedule: $Frequency at $Time" -ForegroundColor Cyan
    Write-Host "📁 Script: $ScriptPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 The task will:" -ForegroundColor Yellow
    Write-Host "   • Check for claude_docs updates silently"
    Write-Host "   • Log results to Windows Event Log"
    Write-Host "   • Run in background without interrupting work"
    Write-Host ""
    Write-Host "🔧 To manage the task:" -ForegroundColor Cyan
    Write-Host "   • View: taskschd.msc"
    Write-Host "   • Remove: .\setup-docs-scheduler.ps1 -Remove"
    Write-Host "   • Test: .\check-docs-updates.ps1 -Scheduled"
    
}
catch {
    Write-Host "❌ Failed to create scheduled task: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure you're running as Administrator" -ForegroundColor Yellow
}