# Claude Docs Import System

## Overview
System for importing and syncing claude_docs across multiple projects.

## Import Methods

### Method 1: Git Submodule (Recommended)
```bash
# In your project root
git submodule add https://github.com/yourorg/claude-docs-enterprise.git claude_docs
git submodule update --init --recursive
```

### Method 2: NPM Package
```json
// package.json
{
  "devDependencies": {
    "@yourorg/claude-docs": "^1.0.0"
  }
}
```

### Method 3: Direct Copy with Sync Script
```powershell
# sync-claude-docs.ps1
$SOURCE = "\\shared\claude-docs-enterprise"
$DEST = ".\claude_docs"

robocopy $SOURCE $DEST /E /XD .git /XF .gitignore
```

## Directory Structure After Import

```
your-project/
├── CLAUDE.md (project-specific, extends imported docs)
├── claude_docs/ (imported from enterprise)
│   ├── hooks/
│   ├── context/
│   ├── frontend/
│   ├── backend/
│   └── ...
└── claude_local/ (project-specific additions)
    ├── custom-patterns.md
    └── project-issues.md
```

## Configuration File

Create `claude.config.json` in project root:

```json
{
  "extends": "claude_docs",
  "projectType": "fullstack",
  "techStack": {
    "frontend": ["react", "xos-components"],
    "backend": ["dotnet", "postgresql"]
  },
  "hooks": {
    "enabled": true,
    "customHooks": "./claude_local/hooks"
  },
  "overrides": {
    "component-registry": "./claude_local/components.json"
  }
}
```

## Sync Strategy

### Automatic Sync on Project Open
```javascript
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Sync Claude Docs",
      "type": "shell",
      "command": "npm run sync-claude-docs",
      "runOptions": {
        "runOn": "folderOpen"
      }
    }
  ]
}
```

### Manual Sync Command
```bash
# Add to package.json scripts
"scripts": {
  "sync-claude": "node scripts/sync-claude-docs.js",
  "claude-update": "npm update @yourorg/claude-docs"
}
```

## Version Control

### Versioning Strategy
```
claude-docs-enterprise/
├── version.json
│   {
│     "version": "1.2.0",
│     "lastUpdated": "2024-01-15",
│     "breaking": false
│   }
├── CHANGELOG.md
└── migrations/
    └── 1.1-to-1.2.md
```

### Update Notifications
When Claude detects outdated docs:
```
⚠️ Claude Docs Update Available (v1.2.0)
- New XOS components added to registry
- Updated MVVM patterns
- Bug fixes in validation rules

Run: npm run claude-update
```

## Project-Specific Extensions

### Extending Component Registry
```json
// claude_local/components-extend.json
{
  "extends": "../claude_docs/context/component-registry.json",
  "project_components": {
    "custom": ["MyCustomComponent", "ProjectSpecificWidget"]
  }
}
```

### Adding Project Hooks
```json
// claude_local/hooks/project-validation.json
{
  "extends": "../claude_docs/hooks/validation-rules.json",
  "additional_rules": {
    "project_specific": {
      "rules": [...]
    }
  }
}
```

## Integration with CI/CD

### GitHub Action
```yaml
name: Validate Claude Docs
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check Claude Docs
        run: |
          if [ ! -f "CLAUDE.md" ]; then
            echo "ERROR: CLAUDE.md is missing"
            exit 1
          fi
          if [ ! -d "claude_docs" ]; then
            echo "ERROR: claude_docs directory is missing"
            exit 1
          fi
      - name: Validate Structure
        run: npm run validate-claude-structure
```

## Benefits of This System

1. **Consistency**: Same patterns across all projects
2. **Updates**: Central updates propagate to all projects
3. **Customization**: Projects can extend base docs
4. **Version Control**: Track doc versions separately
5. **Team Sync**: Everyone uses same documentation
6. **Reduced Errors**: Validated patterns prevent mistakes

## Quick Start for New Projects

```bash
# 1. Create new project
mkdir my-new-project && cd my-new-project

# 2. Import claude docs
npx @yourorg/claude-docs init

# 3. Answer prompts
? Project type? (fullstack/frontend/backend)
? Use XOS components? (Y/n)
? Database type? (postgresql/mysql/none)

# 4. Done! CLAUDE.md and claude_docs/ are ready
```

## Maintenance

### Updating Enterprise Docs
```bash
# In claude-docs-enterprise repo
npm version patch
git push --tags
npm publish
```

### Project Updates
```bash
# In project using claude_docs
npm update @yourorg/claude-docs
git add claude_docs
git commit -m "Update Claude docs to latest version"
```