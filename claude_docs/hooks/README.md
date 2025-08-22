# Claude Code Hooks Configuration

## Overview
This directory contains hook configurations to prevent common issues in XOS framework projects. The hooks are now properly configured in `.claude/settings.json` according to Claude Code documentation.

## 🚀 Quick Start - Optimized Hooks

### Install Optimized Hooks (16 hooks with latest XOS patterns)
```powershell
# From any project directory
powershell D:\Projects\CVS_Claude\claude_docs\hooks\setup-optimized-hooks.ps1

# Or navigate here first
cd D:\Projects\CVS_Claude\claude_docs\hooks
.\setup-optimized-hooks.ps1 -ProjectPath "D:\Projects\YourProject"
```

The script will:
- Auto-detect if your project uses XOS framework
- Apply appropriate hooks (XOS-specific or general Windows)
- Merge with existing settings or replace as needed
- Create automatic backups

## Active Hooks Location
The working hooks are in: **`.claude/settings.json`**

## Hook Categories

### 1. Component Validation Hooks
Prevents use of non-existent XOS components:
- **XOSButton** → Suggests XOSButtonWrapper
- **XOSModal** → Suggests Bootstrap modal
- **XOSCheckbox** → Suggests Bootstrap form-check

### 2. Critical Issue Prevention
- **theme.css validation** - Prevents invisible components
- **VMBase Data pattern** - Catches `this.Data = {}` errors (getter-only property)
- **XOSContainer misuse** - Prevents wrapping components incorrectly
- **Event handler patterns** - Ensures `e.value` usage with XOSTextbox
- **Missing name props** - Catches XOSTextbox without required name attribute
- **Regex escaping** - Catches invalid phone regex patterns

### 3. Code Pattern Enforcement
- **Button classes** - Warns about Bootstrap classes, suggests XOS equivalents
- **Component inheritance** - Enforces cntrl.XOSComponent
- **ViewModel patterns** - Prevents setState usage, enforces updateUI()

## Recent Issues Addressed

1. **XOS Components Invisible** (theme.css not imported)
   - Hook blocks file edits if App.js uses XOS without theme.css import

2. **Non-existent Components** (XOSModal, XOSCheckbox, XOSButton)
   - Hooks prevent usage and suggest alternatives

3. **Invalid Regex in Utils.js**
   - Detects and warns about improperly escaped regex patterns

4. **Wrong Inheritance Pattern**
   - Blocks React.Component usage in XOS projects

5. **Missing Dependencies**
   - Post-hook warnings for npm start failures with common solutions

## How Hooks Work

### PreToolUse Hooks
Run BEFORE file modifications to prevent errors:
- Check for non-existent components
- Validate required imports
- Enforce coding patterns
- Can block operations with `exit 1`

### PostToolUse Hooks
Run AFTER operations complete:
- Verify changes were correct
- Log file modifications
- Check test results
- Provide helpful feedback

### UserPromptSubmit Hooks
Run when user submits a prompt:
- Proactive warnings about component names
- Context-aware suggestions

## Testing Hooks

To test if hooks are working:
1. Try to use XOSButton in a file (should be blocked)
2. Create App.js without theme.css import (should warn)
3. Use btn-primary class (should suggest btn-save)

## Hook Configuration Format

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "powershell command here",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

## Environment Variables Available in Hooks

- `$env:CLAUDE_TOOL_CONTENT` - Content being written/edited
- `$env:CLAUDE_TOOL_FILE_PATH` - Target file path
- `$env:CLAUDE_TOOL_COMMAND` - Command being run (Bash)
- `$env:CLAUDE_TOOL_EXIT_CODE` - Exit code from command
- `$env:CLAUDE_USER_PROMPT` - User's prompt text

## Troubleshooting

If hooks aren't running:
1. Restart Claude Code after modifying settings.json
2. Check that `.claude/settings.json` exists in project root
3. Verify PowerShell commands work in your terminal
4. Check hook timeout values (default 30s, set to 5s for quick checks)

## Common Issues Fixed by These Hooks

| Issue | Hook Prevention | Manual Fix |
|-------|----------------|------------|
| XOSButton not found | Blocks usage, suggests XOSButtonWrapper | Replace with XOSButtonWrapper |
| Components invisible | Requires theme.css import | Add `import './assets/css/theme.css'` |
| Invalid regex | Warns about escaping | Double escape: `\\\\(` |
| Wrong inheritance | Blocks React.Component | Use cntrl.XOSComponent |
| Missing dependencies | Suggests packages | npm install react-color fast-sort |

## Maintenance

Hooks should be updated when:
- New component issues are discovered
- Pattern violations become common
- Build/test processes change
- New XOS components are added/removed

## 📊 Optimization Results

### Performance Improvements (v2.1)
- **16 focused hooks** - Covers all critical XOS patterns
- **Enhanced VMBase validation** - Catches Data getter-only errors
- **XOSContainer misuse detection** - Prevents architectural mistakes
- **Event pattern validation** - Ensures correct e.value usage
- **Missing prop detection** - Catches required name attributes
- **Better organization** - Consolidated similar checks

### Available Hook Sets

#### 1. **optimized-hooks-windows.json** (XOS Projects) v2.1
- 16 carefully selected hooks
- Complete XOS framework validation including latest patterns
- VMBase Data getter-only pattern enforcement  
- XOSContainer architectural validation
- Event handler pattern checking
- Windows path and command validation
- Dependency and build error reporting

#### 2. **general-windows-hooks.json** (Non-XOS Projects)
- 5 essential Windows development hooks
- Path validation to prevent malformed directories
- Linux command detection and alternatives
- NPM and .NET build failure reporting

### Testing Hooks
After installation, test your hooks:
```powershell
# Test path validation (should error)
mkdir Dtestpath

# Test Linux commands (should error)
sudo apt-get update

# Test XOS components (in XOS projects, should error)
# Try creating a file with XOSButton, XOSModal, etc.
```