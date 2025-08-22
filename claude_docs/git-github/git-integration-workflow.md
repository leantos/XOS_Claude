# XOS Framework Git Integration Workflow

## Overview

This document defines the complete Git workflow for XOS Framework development, integrating version control practices with XOS-specific development patterns, TDD workflows, and quality gates.

## Table of Contents
1. [Branch Strategy](#branch-strategy)
2. [Commit Conventions](#commit-conventions)
3. [Development Workflow Integration](#development-workflow-integration)
4. [Pull Request Process](#pull-request-process)
5. [Quality Gates & CI/CD](#quality-gates--cicd)
6. [XOS-Specific Patterns](#xos-specific-patterns)

---

## Branch Strategy

### Branch Naming Conventions

#### Frontend Modules (XOS Components)
```bash
feature/xos-[module]-frontend          # New XOS component
feature/xos-[module]-mvvm-refactor     # MVVM pattern improvements  
bugfix/xos-[module]-input-handling     # Fix keyboard input issues
bugfix/xos-[module]-data-property      # Fix "Cannot set property Data" errors
refactor/xos-[module]-vm-cleanup       # ViewModel cleanup
test/xos-[module]-coverage             # Improve test coverage
```

#### Backend Modules
```bash
feature/api-[module]-crud              # CRUD API implementation
feature/service-[module]-business      # Business logic services
feature/data-[module]-sql-migration    # Database schema changes
bugfix/api-[module]-validation         # Fix validation issues
refactor/service-[module]-patterns     # Service layer refactoring
perf/api-[module]-optimization         # Performance improvements
```

#### Full-Stack Features
```bash
feature/[module]-full-stack            # Complete feature implementation
feature/[module]-integration           # Frontend-backend integration
epic/[major-feature]-implementation    # Large multi-module features
```

#### Hotfixes & Maintenance
```bash
hotfix/critical-[issue-description]   # Production fixes
maintenance/dependencies-update        # Dependency updates
maintenance/security-patches          # Security vulnerability fixes
```

### Branch Protection Rules

#### Main Branch
```yaml
protection_rules:
  main:
    require_pr: true
    require_reviews: 2
    dismiss_stale_reviews: true
    require_status_checks: 
      - "ci/build"
      - "ci/test-backend" 
      - "ci/test-frontend"
      - "ci/xos-compliance-check"
    restrict_push: true
    enforce_admins: false
```

#### Develop Branch
```yaml
protection_rules:
  develop:
    require_pr: true
    require_reviews: 1
    require_status_checks:
      - "ci/test-backend"
      - "ci/test-frontend"
      - "ci/xos-patterns-check"
```

---

## Commit Conventions

### XOS-Specific Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
```bash
feat        # New feature or component
fix         # Bug fix
test        # Adding or modifying tests
docs        # Documentation changes
refactor    # Code refactoring without feature changes
perf        # Performance improvements
style       # Code style changes (formatting, etc.)
chore       # Maintenance tasks
```

#### Scopes for XOS Development
```bash
# Frontend Scopes
xos-[module]        # XOS component development
xos-vm              # ViewModel changes
xos-input           # Input handling fixes
xos-data            # Data property management
mvvm                # MVVM pattern implementation

# Backend Scopes  
api-[module]        # API controller changes
service-[module]    # Service layer changes
data-[module]       # Data access changes
sql                 # SQL queries and database
auth                # Authentication/authorization

# Infrastructure Scopes
ci                  # CI/CD pipeline changes
config              # Configuration changes
deps                # Dependency updates
```

### Commit Message Templates

#### XOS Frontend Component Commits
```bash
# Initial component creation
feat(xos-[module]): implement [ComponentName] with MVVM pattern

- Add ViewModel extending VMBase
- Create component extending XOSComponent
- Implement three-step event handlers
- Add XOSTextbox components with name props
- Initialize Data properties correctly

# Input handling fixes
fix(xos-[module]): resolve keyboard input acceptance issues

- Add updateUI() calls after state changes
- Fix event handler to use e.value instead of e.target.value
- Ensure all XOSTextbox components have name attribute
- Verify three-step event pattern implementation

# Test implementation
test(xos-[module]): add comprehensive test suite with 85% coverage

- Add ViewModel initialization tests
- Test keyboard input acceptance
- Verify no "Cannot set property Data" errors
- Add integration tests for API calls
- Mock external dependencies properly
```

#### Backend Module Commits
```bash
# Service implementation
feat(service-[module]): implement business logic with raw SQL patterns

- Add service interface and implementation
- Use GetEntityDataListAsync pattern
- Implement proper transaction handling
- Add validation and error handling
- Follow XOS data access patterns

# API controller
feat(api-[module]): add POST-only endpoints with domain type returns

- Implement CRUD operations as POST endpoints
- Return domain types directly (not IActionResult)
- Add proper authorization attributes
- Include comprehensive error handling
- Follow XOS API patterns
```

---

## Development Workflow Integration

### TDD Workflow Integration

#### Step-by-Step Git Integration with TDD

```bash
# 1. Initialize feature branch
git checkout main
git pull origin main
git checkout -b feature/[module]-implementation

# 2. After requirements analysis (TDD Step 1)
git add .
git commit -m "docs([module]): add requirements analysis and test plan

- Document module requirements
- Create test scenarios (50+ cases)
- Define acceptance criteria
- Plan XOS component structure"

# 3. After code skeleton (TDD Step 3)
git add .
git commit -m "feat([module]): create code skeleton and structure

- Add domain models with properties
- Create service interfaces
- Set up controller with empty methods
- Configure dependency injection
- Code compiles successfully"

# 4. After test suite creation (TDD Step 4)
git add .
git commit -m "test([module]): add comprehensive test suite

- Create unit tests for all components
- Add integration tests for database operations
- Mock external dependencies
- Follow AAA pattern
- Status: All tests failing (Red phase - expected)"

# 5. After implementation (TDD Step 5)
git add .
git commit -m "feat([module]): implement core functionality

Round 1 Implementation:
- Service methods with business logic
- Controller actions with error handling
- XOS framework patterns followed
- Target: 80%+ test pass rate achieved
- Test Results: [X/Y] passing"

# 6. After refinements (TDD Step 7)
git add .
git commit -m "fix([module]): complete implementation refinements

Round 2 Results:
- Fixed failing tests from round 1
- Improved implementation quality
- Final Status: [100% pass rate OR documented blockers]
- Test Coverage: [X]%"

# 7. After documentation (TDD Step 8)
git add .
git commit -m "docs([module]): add comprehensive module documentation

- Add README with usage examples
- Add API documentation with endpoints
- Add test coverage summary
- Add troubleshooting guide
- Update @claude_docs patterns"
```

### XOS Frontend Workflow Integration

```bash
# During 9-Step XOS Frontend TDD Cycle

# After Step 2 (SCAFFOLD)
git add .
git commit -m "feat(xos-[module]): create MVVM structure with VMBase

- Add ViewModel extending VMBase with init() method
- Create component extending XOSComponent
- Set up proper folder structure
- Initialize Data properties using reference pattern"

# After Step 5 (IMPLEMENT)
git add .
git commit -m "feat(xos-[module]): implement three-step event handlers

- Add handleInputChange with updateUI() calls
- Implement XOSTextbox with name/value props
- Enable keyboard input acceptance
- Add form validation and state management"

# After Step 6 (VERIFY)
git add .
git commit -m "test(xos-[module]): verify XOS patterns and functionality

Verification Results:
- ✅ All inputs accept keyboard typing
- ✅ No 'Cannot set property Data' errors
- ✅ updateUI() called appropriately
- ✅ Test coverage: [X]% (Target: 80%+)
- Manual testing confirms XOS compliance"

# After Step 9 (VERSION CONTROL)
# This step creates the PR - covered in Pull Request Process section
```

---

## Pull Request Process

### PR Templates

#### XOS Frontend Component PR Template

```markdown
## XOS Frontend Component Implementation

### Component Details
- **Name**: [ComponentName]
- **Pattern**: XOS MVVM with VMBase
- **Location**: `src/components/[ModuleName]/`
- **Test Coverage**: [X]% (Target: 80%+)

### XOS Compliance Checklist
- [ ] ViewModel extends VMBase correctly
- [ ] Uses init() method with Data reference pattern  
- [ ] Implements three-step event handlers
- [ ] All XOSTextbox inputs have 'name' props
- [ ] updateUI() called after state changes
- [ ] No 'Cannot set property Data' errors in console
- [ ] Component extends XOSComponent (not wrapped in XOSContainer)
- [ ] All inputs accept keyboard typing
- [ ] Form validation implemented
- [ ] Error handling with showMessageBox

### Testing Results
- **Unit Tests**: [X/Y] passing
- **Integration Tests**: [X/Y] passing
- **Manual Testing**: ✅ Keyboard input verified in browser
- **Console Check**: ✅ No Data property errors
- **XOS Patterns**: ✅ All patterns verified

### Files Changed
- `src/components/[ModuleName]/index.jsx` - Component implementation
- `src/components/[ModuleName]/[ModuleName]VM.jsx` - ViewModel
- `src/components/[ModuleName]/__tests__/` - Test suite
- `docs/components/[ModuleName].md` - Documentation

### Code Review Focus Areas
1. **Data Property Usage**: Verify no direct assignment to this.Data
2. **Event Handlers**: Confirm three-step pattern implementation
3. **Input Acceptance**: Test all text fields accept keyboard input
4. **State Management**: Check updateUI() calls trigger re-renders
5. **XOS Components**: Verify proper name/value prop usage
6. **Test Coverage**: Ensure comprehensive testing

### Breaking Changes
- [ ] None
- [ ] [Describe breaking changes if any]

Closes #[issue-number]
```

#### Backend Module PR Template

```markdown
## Backend Module Implementation

### Module Details
- **Name**: [ModuleName]
- **Services**: [List service classes]
- **Controllers**: [List controller classes]  
- **Test Coverage**: [X]% (Target: 80%+)

### TDD Workflow Completed
- [ ] Requirements analysis and test planning
- [ ] Code skeleton with compilable structure
- [ ] Comprehensive test suite (50+ scenarios)
- [ ] Round 1: Core implementation (80%+ pass rate)
- [ ] Round 2: Refinements (100% pass rate OR documented blockers)
- [ ] Complete documentation package

### XOS Framework Compliance
- [ ] Uses raw SQL with GetEntityDataListAsync pattern (not Entity Framework)
- [ ] All API endpoints are POST methods
- [ ] Returns domain types directly (not IActionResult)
- [ ] Proper transaction handling implemented
- [ ] SignalR notifications added where appropriate
- [ ] Follows dependency injection patterns
- [ ] Includes comprehensive error handling
- [ ] Uses proper logging throughout

### Test Results
- **Test Coverage**: [X]%
- **Pass Rate**: [Y]% ([Z]/[Total] tests passing)
- **Blockers**: [None/List specific blockers]

### Database Changes
- [ ] No database changes
- [ ] Schema migrations included: [List migration files]
- [ ] Test data scripts provided
- [ ] Rollback scripts available

### Files Changed
- `Domain/[ModuleName].cs` - Domain model
- `Interfaces/I[ModuleName]Service.cs` - Service interface
- `Services/[ModuleName]Service.cs` - Service implementation
- `Controllers/[ModuleName]Controller.cs` - API controller
- `Tests/` - Comprehensive test suite
- `docs/modules/[ModuleName]/` - Documentation

### Code Review Focus Areas
1. **SQL Queries**: Verify raw SQL usage and parameter binding
2. **Transaction Handling**: Check proper commit/rollback patterns
3. **Error Handling**: Validate exception handling and logging
4. **Security**: Review authorization and input validation
5. **Performance**: Check query efficiency and caching
6. **Testing**: Verify test coverage and quality

Closes #[issue-number]
```

### PR Review Process

#### XOS-Specific Review Checklist

**Frontend Reviews:**
```bash
# Required checks before approval
□ Clone branch and test manually
□ Verify all inputs accept keyboard typing
□ Check browser console for Data property errors
□ Confirm updateUI() called after state changes
□ Test form validation and error handling
□ Verify XOS component usage patterns
□ Check test coverage report
□ Review event handler implementations
```

**Backend Reviews:**
```bash
# Required checks before approval  
□ Run all tests and verify pass rate
□ Review SQL queries for security (injection prevention)
□ Check transaction handling patterns
□ Verify error handling and logging
□ Test API endpoints with Postman/similar
□ Review service layer dependency injection
□ Check domain model validation
□ Verify XOS data access patterns
```

---

## Quality Gates & CI/CD

### Pre-commit Hooks

```bash
# .pre-commit-hooks.yaml
repos:
  - repo: local
    hooks:
      # XOS Frontend Checks
      - id: xos-component-check
        name: XOS Component Pattern Check
        entry: scripts/check-xos-patterns.js
        language: node
        files: 'src/components/.*\.(jsx|js)$'
        
      - id: xos-viewmodel-check
        name: XOS ViewModel Pattern Check
        entry: scripts/check-vmbase-patterns.js
        language: node
        files: 'src/components/.*/.*VM\.jsx$'
        
      # Backend Checks
      - id: sql-injection-check
        name: SQL Injection Pattern Check
        entry: scripts/check-sql-patterns.js
        language: node
        files: 'Services/.*\.cs$|Controllers/.*\.cs$'
        
      # Test Coverage
      - id: test-coverage-check
        name: Minimum Test Coverage Check
        entry: scripts/check-test-coverage.js
        language: node
        pass_filenames: false
        
      # Documentation
      - id: docs-update-check
        name: Documentation Update Check
        entry: scripts/check-docs-updated.js
        language: node
        pass_filenames: false
```

### CI/CD Pipeline Configuration

```yaml
# .github/workflows/xos-development.yml
name: XOS Development Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  xos-compliance-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check XOS Frontend Patterns
        run: |
          npm run xos:check-patterns
          
      - name: Verify Input Handling
        run: |
          npm run xos:verify-inputs
          
      - name: Check Data Property Usage
        run: |
          npm run xos:check-data-property

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
          
      - name: Run Backend Tests
        run: |
          dotnet test --configuration Release --verbosity normal --collect:"XPlat Code Coverage"
          
      - name: Check Test Coverage
        run: |
          dotnet tool install -g dotnet-reportgenerator-globaltool
          reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:"coverage" -reporttypes:"TextSummary"
          
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Run Frontend Tests
        run: |
          npm run test:coverage
          
      - name: XOS Component Manual Tests
        run: |
          npm run test:xos-components

  integration-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    steps:
      - uses: actions/checkout@v3
      
      - name: Start Test Environment
        run: |
          docker-compose -f docker-compose.test.yml up -d
          
      - name: Run Integration Tests
        run: |
          npm run test:integration
          
      - name: Test XOS Full-Stack Scenarios
        run: |
          npm run test:xos-integration

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run SQL Injection Scan
        run: |
          semgrep --config=auto --json --output=security-report.json
          
      - name: Check for Secrets
        run: |
          git-secrets --scan --recursive .
```

---

## XOS-Specific Patterns

### Required Git Hooks for XOS Development

#### Pre-commit Hook: XOS Pattern Validation

```javascript
// scripts/check-xos-patterns.js
const fs = require('fs');
const path = require('path');

function checkXOSPatterns(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];
    
    // Check for VMBase inheritance
    if (filePath.includes('VM.jsx')) {
        if (!content.includes('extends VMBase')) {
            errors.push(`${filePath}: ViewModel must extend VMBase`);
        }
        
        if (!content.includes('init()')) {
            errors.push(`${filePath}: ViewModel must implement init() method`);
        }
        
        if (content.includes('this.Data = {')) {
            errors.push(`${filePath}: Never assign directly to this.Data, use reference pattern`);
        }
    }
    
    // Check XOS component patterns
    if (filePath.includes('/index.jsx') && !filePath.includes('__tests__')) {
        if (!content.includes('extends cntrl.XOSComponent')) {
            errors.push(`${filePath}: Component must extend XOSComponent`);
        }
        
        if (content.includes('XOSTextbox') && !content.includes('name=')) {
            errors.push(`${filePath}: XOSTextbox components must have 'name' prop`);
        }
        
        if (content.includes('onChange') && !content.includes('updateUI()')) {
            errors.push(`${filePath}: Event handlers must call updateUI()`);
        }
    }
    
    return errors;
}

// Check all staged files
const stagedFiles = process.argv.slice(2);
let allErrors = [];

stagedFiles.forEach(file => {
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
        const errors = checkXOSPatterns(file);
        allErrors = allErrors.concat(errors);
    }
});

if (allErrors.length > 0) {
    console.error('XOS Pattern Violations Found:');
    allErrors.forEach(error => console.error(`❌ ${error}`));
    process.exit(1);
} else {
    console.log('✅ All XOS patterns validated successfully');
}
```

#### Pre-push Hook: Test Coverage Validation

```bash
#!/bin/bash
# scripts/pre-push-coverage-check.sh

echo "Running test coverage check..."

# Frontend coverage
npm run test:coverage:silent
FRONTEND_COVERAGE=$(cat coverage/lcov-report/index.html | grep -o 'Functions[^%]*%' | grep -o '[0-9.]*' | head -1)

# Backend coverage  
dotnet test --collect:"XPlat Code Coverage" --verbosity quiet
BACKEND_COVERAGE=$(dotnet tool run reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:"coverage-backend" -reporttypes:"TextSummary" | grep -o 'Line coverage: [0-9.]*%' | grep -o '[0-9.]*')

echo "Frontend Coverage: ${FRONTEND_COVERAGE}%"
echo "Backend Coverage: ${BACKEND_COVERAGE}%"

# Check minimum coverage thresholds
if (( $(echo "$FRONTEND_COVERAGE < 80" | bc -l) )); then
    echo "❌ Frontend coverage (${FRONTEND_COVERAGE}%) below 80% threshold"
    exit 1
fi

if (( $(echo "$BACKEND_COVERAGE < 80" | bc -l) )); then
    echo "❌ Backend coverage (${BACKEND_COVERAGE}%) below 80% threshold"
    exit 1
fi

echo "✅ Test coverage validation passed"
```

### Git Aliases for XOS Development

```bash
# Add to ~/.gitconfig or project .git/config

[alias]
    # XOS-specific shortcuts
    xos-branch = "!f() { git checkout -b feature/xos-$1-${2:-frontend}; }; f"
    xos-commit = "!f() { git add . && git commit -m \"feat(xos-$1): $2\"; }; f"
    
    # Quick module workflow
    module-start = "!f() { git checkout main && git pull && git checkout -b feature/$1-implementation; }; f"
    module-checkpoint = "!f() { git add . && git commit -m \"$1\"; }; f"
    module-pr = "!f() { git push -u origin HEAD && gh pr create --template .github/pull_request_template.md; }; f"
    
    # Testing shortcuts
    test-backend = "!dotnet test --verbosity normal"
    test-frontend = "!npm run test"
    test-coverage = "!npm run test:coverage && dotnet test --collect:'XPlat Code Coverage'"
    
    # XOS pattern validation
    check-xos = "!node scripts/check-xos-patterns.js"
    fix-xos = "!node scripts/fix-xos-patterns.js"
```

---

## Quick Reference

### Workflow Summary

1. **Initialize**: `git checkout -b feature/[module]-[type]`
2. **Develop**: Follow TDD workflow with Git checkpoints
3. **Test**: Verify XOS patterns and coverage thresholds
4. **Document**: Commit comprehensive documentation
5. **PR**: Create PR with appropriate template and checklist
6. **Review**: Address feedback maintaining XOS compliance
7. **Merge**: Squash merge after approval
8. **Cleanup**: Delete feature branch and update local main

### Critical XOS Git Patterns

- **Never commit** code with "Cannot set property Data" errors
- **Always verify** keyboard input acceptance before PR
- **Include test coverage** metrics in commit messages
- **Document blockers** clearly if 100% pass rate not achieved
- **Follow conventional commits** with XOS-specific scopes
- **Use Git hooks** to enforce XOS pattern compliance

---

This Git integration workflow ensures that XOS Framework development maintains high quality standards while providing clear version control practices that align with the framework's unique patterns and requirements.