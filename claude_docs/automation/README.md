# Claude Code Automation Scripts

This directory contains PowerShell automation scripts for managing the Claude Code documentation system.

## Scripts

### Core Automation Scripts

- **`setup-agents.ps1`** - Creates Claude Code agent files in `.claude/agents/` directory
- **`update-html-docs.ps1`** - Converts markdown documentation to HTML format
- **`check-docs-updates.ps1`** - Checks for documentation updates from remote repositories  
- **`setup-docs-scheduler.ps1`** - Sets up scheduled task for automatic documentation updates

### Agent Definitions

- **`agents/`** - Directory containing individual Claude Code agent definitions
- **`subagent-catalog.md`** - Catalog of all available specialized agents
- **`subagent-composition.md`** - Guide for composing agents for complex tasks
- **`subagent-patterns.md`** - Common patterns and best practices for agent usage

## Usage

### From Project Root (Recommended)

```powershell
# Update HTML documentation
.\update-html-docs.ps1

# Check for documentation updates  
.\check-docs-updates.ps1 -CheckOnly

# Set up agents
.\claude_docs\automation\setup-agents.ps1

# Set up scheduled updates
.\claude_docs\automation\setup-docs-scheduler.ps1
```

### Direct Usage

```powershell
# Run scripts directly from automation directory
.\claude_docs\automation\update-html-docs.ps1
.\claude_docs\automation\check-docs-updates.ps1 -CheckOnly
```

## Features

- **Automatic path resolution** - Scripts work from any location
- **Cross-reference updating** - Converts markdown links to HTML automatically
- **Error handling** - Comprehensive error reporting and recovery
- **Backward compatibility** - Wrapper scripts maintain compatibility with existing workflows

## Requirements

- PowerShell 5.1 or later
- Git (for update checking and synchronization)
- Write permissions to `claude_docs/html-docs/` directory

## Notes

All scripts have been tested and verified to work correctly from their new locations within the `@claude_docs\` structure.