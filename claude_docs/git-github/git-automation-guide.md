# Git Automation Guide

## Overview
This guide provides comprehensive automation patterns for Git operations, including pre-commit hooks, automated workflows, and repository maintenance. It focuses on practical implementations that improve code quality, security, and development efficiency.

## Pre-Commit Hooks

### Installation & Setup
```bash
# Install pre-commit framework
pip install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict
      - id: check-case-conflict
      - id: detect-private-key

  - repo: local
    hooks:
      - id: lint-code
        name: Lint Code
        entry: npm run lint
        language: system
        files: \.(js|ts|jsx|tsx)$
        
      - id: format-code
        name: Format Code
        entry: npm run format
        language: system
        files: \.(js|ts|jsx|tsx)$
        
      - id: run-tests
        name: Run Tests
        entry: npm test
        language: system
        pass_filenames: false
EOF

# Install hooks
pre-commit install
```

### Custom Hook Examples

#### Code Quality Hooks
```bash
#!/bin/bash
# .git/hooks/pre-commit

set -e

echo "Running pre-commit checks..."

# Check for merge conflict markers
if grep -r "<<<<<<< HEAD" --exclude-dir=.git .; then
    echo "❌ Merge conflict markers detected"
    exit 1
fi

# Check for TODO/FIXME comments in production code
if git diff --cached --name-only | xargs grep -l "TODO\|FIXME" 2>/dev/null; then
    echo "⚠️  TODO/FIXME comments detected in staged files"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run linting
echo "Running ESLint..."
npm run lint:staged || {
    echo "❌ Linting failed"
    exit 1
}

# Run formatting
echo "Running Prettier..."
npm run format:staged || {
    echo "❌ Formatting failed"
    exit 1
}

# Run type checking
echo "Running TypeScript check..."
npm run type-check || {
    echo "❌ Type checking failed"
    exit 1
}

echo "✅ All pre-commit checks passed"
```

#### Security Hooks
```bash
#!/bin/bash
# Security-focused pre-commit hook

# Check for secrets
echo "Checking for secrets..."
git diff --cached --name-only | xargs grep -l "password\|secret\|key\|token" 2>/dev/null && {
    echo "❌ Potential secrets detected in staged files"
    echo "Files containing sensitive keywords:"
    git diff --cached --name-only | xargs grep -l "password\|secret\|key\|token" 2>/dev/null
    exit 1
}

# Check for hardcoded IPs
git diff --cached | grep -E "\b([0-9]{1,3}\.){3}[0-9]{1,3}\b" && {
    echo "⚠️  Hardcoded IP addresses detected"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Check for large files
for file in $(git diff --cached --name-only); do
    if [ -f "$file" ] && [ $(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0) -gt 1048576 ]; then
        echo "❌ Large file detected: $file (>1MB)"
        echo "Consider using Git LFS for large files"
        exit 1
    fi
done

echo "✅ Security checks passed"
```

### Language-Specific Hooks

#### .NET/C# Hooks
```yaml
# .pre-commit-config.yaml for .NET projects
repos:
  - repo: local
    hooks:
      - id: dotnet-format
        name: .NET Format
        entry: dotnet format --verify-no-changes
        language: system
        files: \.(cs|csproj|sln)$
        
      - id: dotnet-build
        name: .NET Build
        entry: dotnet build --no-restore
        language: system
        files: \.(cs|csproj)$
        pass_filenames: false
        
      - id: dotnet-test
        name: .NET Test
        entry: dotnet test --no-build --verbosity quiet
        language: system
        files: \.(cs|csproj)$
        pass_filenames: false
```

#### Node.js/TypeScript Hooks
```yaml
repos:
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.44.0
    hooks:
      - id: eslint
        files: \.(js|jsx|ts|tsx)$
        args: [--fix]
        
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.0
    hooks:
      - id: prettier
        files: \.(js|jsx|ts|tsx|json|css|md)$
        
  - repo: local
    hooks:
      - id: jest-tests
        name: Jest Tests
        entry: npm test
        language: system
        files: \.(js|jsx|ts|tsx)$
        pass_filenames: false
```

## Git Configuration Automation

### Global Git Configuration
```bash
#!/bin/bash
# setup-git.sh - Global Git configuration script

# Set global configuration
git config --global user.name "Developer Name"
git config --global user.email "developer@company.com"

# Set default branch name
git config --global init.defaultBranch main

# Set merge strategy
git config --global merge.ff false

# Enable rebase on pull
git config --global pull.rebase true

# Set up aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'

# Advanced aliases
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
git config --global alias.pushup '!git push --set-upstream origin $(git branch --show-current)'
git config --global alias.cleanup '!git branch --merged | grep -v "\*\|main\|master\|develop" | xargs -n 1 git branch -d'

# Security settings
git config --global commit.gpgsign true
git config --global tag.gpgsign true

echo "✅ Git configuration completed"
```

### Repository-Specific Configuration
```bash
#!/bin/bash
# setup-repo.sh - Repository-specific configuration

# Set up hooks directory
mkdir -p .githooks
git config core.hooksPath .githooks

# Set up commit template
cat > .gitmessage << 'EOF'
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
#
# Types:
# feat: A new feature
# fix: A bug fix
# docs: Documentation only changes
# style: Changes that do not affect the meaning of the code
# refactor: A code change that neither fixes a bug nor adds a feature
# perf: A code change that improves performance
# test: Adding missing tests or correcting existing tests
# chore: Changes to the build process or auxiliary tools
EOF

git config commit.template .gitmessage

# Set up Git LFS for large files
git lfs track "*.psd"
git lfs track "*.zip"
git lfs track "*.pdf"
git add .gitattributes

echo "✅ Repository configuration completed"
```

## Automated Workflows

### Branch Management Automation
```bash
#!/bin/bash
# branch-manager.sh

create_feature_branch() {
    local ticket_id="$1"
    local description="$2"
    
    if [ -z "$ticket_id" ] || [ -z "$description" ]; then
        echo "Usage: create_feature_branch <ticket_id> <description>"
        return 1
    fi
    
    # Sanitize description
    description=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
    
    local branch_name="feature/${ticket_id}-${description}"
    
    # Switch to main and pull latest
    git checkout main
    git pull origin main
    
    # Create and checkout new branch
    git checkout -b "$branch_name"
    
    echo "✅ Created and switched to branch: $branch_name"
}

cleanup_merged_branches() {
    echo "Cleaning up merged branches..."
    
    # Fetch latest changes
    git fetch --prune
    
    # Get current branch
    local current_branch=$(git branch --show-current)
    
    # Switch to main if on a branch that might be deleted
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ] && [ "$current_branch" != "develop" ]; then
        git checkout main
    fi
    
    # Delete merged branches (excluding protected branches)
    git branch --merged | grep -v '\*\|main\|master\|develop' | xargs -n 1 git branch -d
    
    # Delete remote tracking branches that no longer exist
    git remote prune origin
    
    echo "✅ Branch cleanup completed"
}

sync_with_upstream() {
    local upstream_branch="${1:-main}"
    local current_branch=$(git branch --show-current)
    
    echo "Syncing $current_branch with $upstream_branch..."
    
    # Fetch latest changes
    git fetch origin "$upstream_branch"
    
    # Rebase current branch onto upstream
    git rebase "origin/$upstream_branch" || {
        echo "❌ Rebase conflicts detected"
        echo "Resolve conflicts and run: git rebase --continue"
        return 1
    }
    
    echo "✅ Successfully synced with $upstream_branch"
}
```

### Commit Message Automation
```bash
#!/bin/bash
# commit-helper.sh

COMMIT_TYPES=("feat" "fix" "docs" "style" "refactor" "perf" "test" "chore")
SCOPES=("api" "ui" "auth" "db" "config" "deps")

select_commit_type() {
    echo "Select commit type:"
    select type in "${COMMIT_TYPES[@]}"; do
        if [ -n "$type" ]; then
            echo "$type"
            return 0
        fi
    done
}

select_scope() {
    echo "Select scope (optional):"
    echo "0) No scope"
    select scope in "${SCOPES[@]}"; do
        if [ "$REPLY" = "0" ]; then
            echo ""
            return 0
        elif [ -n "$scope" ]; then
            echo "$scope"
            return 0
        fi
    done
}

interactive_commit() {
    local type=$(select_commit_type)
    local scope=$(select_scope)
    
    echo -n "Enter commit subject: "
    read subject
    
    echo -n "Enter commit body (optional, press Enter when done): "
    read body
    
    echo -n "Enter breaking change note (optional): "
    read breaking
    
    # Construct commit message
    local commit_msg="$type"
    if [ -n "$scope" ]; then
        commit_msg="$commit_msg($scope)"
    fi
    commit_msg="$commit_msg: $subject"
    
    if [ -n "$body" ]; then
        commit_msg="$commit_msg\n\n$body"
    fi
    
    if [ -n "$breaking" ]; then
        commit_msg="$commit_msg\n\nBREAKING CHANGE: $breaking"
    fi
    
    # Show preview
    echo -e "\nCommit message preview:"
    echo -e "$commit_msg"
    
    echo -n "\nProceed with commit? (y/N): "
    read confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        echo -e "$commit_msg" | git commit -F -
        echo "✅ Commit created successfully"
    else
        echo "❌ Commit cancelled"
    fi
}
```

### Repository Health Checks
```bash
#!/bin/bash
# repo-health-check.sh

check_repository_health() {
    echo "🔍 Running repository health check..."
    
    local issues=0
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        echo "⚠️  Uncommitted changes detected"
        issues=$((issues + 1))
    fi
    
    # Check for untracked files
    local untracked=$(git ls-files --others --exclude-standard)
    if [ -n "$untracked" ]; then
        echo "⚠️  Untracked files detected:"
        echo "$untracked"
        issues=$((issues + 1))
    fi
    
    # Check branch protection
    local current_branch=$(git branch --show-current)
    if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
        echo "⚠️  Working directly on protected branch: $current_branch"
        issues=$((issues + 1))
    fi
    
    # Check for large files
    local large_files=$(find . -type f -size +10M -not -path "./.git/*" -not -path "./node_modules/*")
    if [ -n "$large_files" ]; then
        echo "⚠️  Large files detected (>10MB):"
        echo "$large_files"
        echo "Consider using Git LFS"
        issues=$((issues + 1))
    fi
    
    # Check Git LFS status
    if command -v git-lfs >/dev/null 2>&1; then
        local lfs_status=$(git lfs status)
        if echo "$lfs_status" | grep -q "Objects to be committed\|Objects to be pushed"; then
            echo "ℹ️  Git LFS objects pending"
        fi
    fi
    
    # Check for merge conflicts
    if git ls-files -u | grep -q .; then
        echo "❌ Merge conflicts detected"
        issues=$((issues + 1))
    fi
    
    # Report summary
    if [ $issues -eq 0 ]; then
        echo "✅ Repository health check passed"
    else
        echo "❌ Repository health check found $issues issue(s)"
        return 1
    fi
}

optimize_repository() {
    echo "🔧 Optimizing repository..."
    
    # Garbage collection
    git gc --aggressive --prune=now
    
    # Repack for better compression
    git repack -ad
    
    # Clean up reflog
    git reflog expire --expire-unreachable=now --all
    
    # Verify repository integrity
    git fsck --full
    
    echo "✅ Repository optimization completed"
}
```

## CI/CD Integration

### GitHub Actions Integration
```yaml
# .github/workflows/git-automation.yml
name: Git Automation

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  validate-commits:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          
      - name: Validate Commit Messages
        uses: wagoid/commitlint-github-action@v5
        with:
          configFile: .commitlintrc.json
          
  auto-merge:
    runs-on: ubuntu-latest
    needs: [validate-commits]
    if: github.event_name == 'pull_request' && contains(github.event.pull_request.labels.*.name, 'auto-merge')
    steps:
      - name: Auto-merge PR
        uses: pascalgn/merge-action@v0.15.6
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          merge_method: squash
          
  cleanup-branches:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Delete merged branches
        run: |
          git branch -r --merged | grep -v '\*\|main\|develop' | sed 's/origin\///' | xargs -n 1 git push --delete origin
```

### GitLab CI Integration
```yaml
# .gitlab-ci.yml
stages:
  - validate
  - cleanup

validate-commits:
  stage: validate
  script:
    - npm install -g @commitlint/cli @commitlint/config-conventional
    - commitlint --from=HEAD~1 --to=HEAD --verbose
  only:
    - merge_requests
    - main

cleanup-branches:
  stage: cleanup
  script:
    - git branch -r --merged | grep -v '\*\|main\|develop' | sed 's/origin\///' | xargs -n 1 git push --delete origin || true
  only:
    - main
  when: manual
```

## Best Practices

### Hook Management
1. **Version Control**: Keep hooks in version control for team consistency
2. **Fast Execution**: Keep pre-commit hooks fast (<10 seconds)
3. **Clear Messages**: Provide clear success/failure messages
4. **Bypass Option**: Allow bypassing hooks for emergency commits

### Automation Guidelines
1. **Idempotent Operations**: Ensure scripts can be run multiple times safely
2. **Error Handling**: Handle errors gracefully with helpful messages
3. **Logging**: Log operations for debugging and auditing
4. **Configuration**: Make scripts configurable for different environments

### Security Considerations
1. **Credential Management**: Never store credentials in hooks or scripts
2. **Validation**: Validate all inputs and file paths
3. **Permissions**: Set appropriate file permissions for hook scripts
4. **Audit Trail**: Log security-relevant operations

This automation guide provides practical tools and patterns for implementing robust Git workflows that improve code quality, security, and team productivity.