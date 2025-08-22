# 📘 Complete Module Development Guide for XOS Framework

## Table of Contents
1. [Overview](#overview)
2. [What to Tell Claude - Prompt Templates](#what-to-tell-claude)
3. [Frontend Module Development](#frontend-module-development)
4. [Backend Module Development](#backend-module-development)
5. [Full-Stack Module Development](#full-stack-module-development)
6. [Testing Your Module](#testing-your-module)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Complete Example: User Management Module](#complete-example)

---

## Overview

This guide shows you how to create modules in the XOS framework, with specific instructions on what to tell Claude for best results.

### Module Types
- **Frontend Module**: UI components with XOS MVVM pattern
- **Backend Module**: API endpoints with XOS data patterns
- **Full-Stack Module**: Complete feature with both frontend and backend

### Prerequisites
- Project set up with XOS framework
- Claude Code extension installed
- Access to `@claude_docs` folder

---

## 🤖 What to Tell Claude - Prompt Templates

### CRITICAL: Always Start With This Context

```
"I'm working with the XOS framework which has custom patterns different from standard React/.NET. 
Check @claude_docs for patterns before implementing."
```

### 📝 Frontend Module Prompts

#### For Simple UI Component
```
"Create a [ModuleName] frontend component using XOS framework patterns.
Requirements:
- [List your UI requirements]
- [List fields needed]

Follow @claude_docs/development-guide/TDD-XOS-FRONTEND-WORKFLOW.md
Use @claude_docs/frontend/ui-templates/XOSComponentTemplate as base.
CRITICAL: Must use VMBase Data reference pattern from @claude_docs/frontend/xos-input-handling-fix.md"
```

#### For Complex UI with Wireframe
```
"Implement [ModuleName] frontend module from MODULE_[ModuleName]_FRONTEND_WIREFRAME_[timestamp].md
Follow @claude_docs/development-guide/TDD-XOS-FRONTEND-WORKFLOW.md
Use XOS MVVM pattern with VMBase.
CRITICAL: All inputs must accept keyboard input - follow three-step event handler pattern.
Target: 80% test coverage minimum."
```

#### For UI with Data Grid
```
"Create [ModuleName] component with XOSGrid for data display.
Requirements:
- Display [entity] list with columns: [list columns]
- Add/Edit/Delete functionality
- Search and pagination

Use @claude_docs/frontend/ui-templates/SearchListGridTemplate as reference.
Follow XOS patterns from @claude_docs/CRITICAL_PATTERNS.md"
```

### 💾 Backend Module Prompts

#### For CRUD API
```
"Create [ModuleName] backend module with CRUD operations.
Entity: [EntityName]
Fields: [list fields with types]
Database: PostgreSQL with raw SQL

Follow @claude_docs/development-guide/TDD-MODULE-WORKFLOW.md for backend.
Use XOS data patterns from @claude_docs/backend/backend-blueprint.md
IMPORTANT: Use GetEntityDataListAsync pattern, NOT Entity Framework.
All endpoints should be POST, return domain types directly."
```

#### For Complex Business Logic
```
"Implement [ModuleName]Service with following operations:
- [List operations with business rules]

Use patterns from @claude_docs/backend/:
- Domain-driven design with [Namespace].Domain
- Service layer pattern
- Raw SQL with PostgreSQL
- Transaction support with SignalR notifications

Include comprehensive unit tests with 80% coverage minimum."
```

### 🔗 Full-Stack Module Prompts

#### Complete Feature Implementation
```
"Create full-stack [ModuleName] module:

BACKEND:
- Entity: [EntityName] with fields [list fields]
- CRUD operations + [custom operations]
- PostgreSQL with raw SQL
- Follow @claude_docs/backend/backend-blueprint.md

FRONTEND:
- List view with XOSGrid
- Add/Edit form with validation
- Delete with confirmation
- Follow @claude_docs/development-guide/TDD-XOS-FRONTEND-WORKFLOW.md

INTEGRATION:
- Use Utils.ajax for API calls
- Follow patterns from @claude_docs/CRITICAL_PATTERNS.md

Target: Working end-to-end feature with 80% test coverage."
```

### 🔧 Fix/Debug Prompts

#### When Inputs Don't Work
```
"XOSTextbox inputs are not accepting keyboard input in [ComponentName].
Fix using patterns from @claude_docs/frontend/xos-input-handling-fix.md
Ensure three-step event handler pattern and updateUI() calls."
```

#### When Getting Data Errors
```
"Getting 'Cannot set property Data of #<VMBase>' error in [ComponentName].
Fix using correct ViewModel initialization from @claude_docs/CRITICAL_PATTERNS.md
Use init() method with Data reference pattern."
```

#### When API Calls Fail
```
"API calls failing in [ModuleName]. Current code: [paste code]
Fix using XOS patterns:
- Utils.ajax from @claude_docs/frontend/utils-api.md
- POST-only endpoints from @claude_docs/backend/api-routes.md"
```

---

## 🎨 Frontend Module Development

### Step 1: Define Requirements

Tell Claude:
```
"I need a [ModuleName] component that:
1. [Requirement 1]
2. [Requirement 2]
3. [etc.]

Use XOS framework with MVVM pattern."
```

### Step 2: Create Component Structure

Tell Claude:
```
"Create the folder structure for [ModuleName] component:
src/components/[ModuleName]/
- index.jsx (component)
- [ModuleName]VM.jsx (ViewModel)
- __tests__/ (test files)

Follow structure from @claude_docs/frontend/ui-templates/XOSComponentTemplate"
```

### Step 3: Implement ViewModel

Tell Claude:
```
"Implement [ModuleName]VM extending VMBase with:
- Properties: [list properties]
- Methods: [list methods]
- Validation: [validation rules]

CRITICAL: Use init() method with Data reference pattern.
Never set this.Data = {}"
```

### Step 4: Implement Component View

Tell Claude:
```
"Implement [ModuleName] component view with:
- XOSTextbox for text inputs
- XOSCombobox for dropdowns
- Bootstrap styling
- Three-step event handler pattern

All inputs must have 'name' prop and use updateUI()"
```

### Step 5: Add Tests

Tell Claude:
```
"Create comprehensive tests for [ModuleName]:
- ViewModel initialization tests
- Component rendering tests
- Input handling tests
- Validation tests
- Integration tests

Target 80% coverage. Verify inputs accept keyboard input."
```

---

## 💾 Backend Module Development

### Step 1: Define Domain Model

Tell Claude:
```
"Create domain model for [EntityName]:
Location: [Namespace].Domain/[EntityName].cs
Properties:
- [Property1]: [Type]
- [Property2]: [Type]

Include data annotations for validation."
```

### Step 2: Create Database Schema

Tell Claude:
```
"Create PostgreSQL table for [EntityName]:
Table: [table_name]
Columns: [list columns with types]
Constraints: [primary key, foreign keys, unique, etc.]

Generate CREATE TABLE script and migration."
```

### Step 3: Implement Service Layer

Tell Claude:
```
"Create [EntityName]Service with:
- Interface: I[EntityName]Service
- Implementation with dependency injection
- CRUD methods using GetEntityDataListAsync
- Transaction support
- Error handling

Follow patterns from @claude_docs/backend/services-core.md"
```

### Step 4: Create API Controller

Tell Claude:
```
"Create [EntityName]Controller with:
- POST endpoints only
- Return domain types directly (not IActionResult)
- Route: /api/[EntityName]/[Action]
- Authorization attributes

Follow @claude_docs/backend/api-routes.md patterns"
```

### Step 5: Write Backend Tests

Tell Claude:
```
"Create unit tests for [EntityName]:
- Service layer tests with mocked dependencies
- Controller tests
- Validation tests
- 80% minimum coverage

Use xUnit, Moq, and FluentAssertions."
```

---

## 🔗 Full-Stack Module Development

### Step 1: Start with Backend

Tell Claude:
```
"Start full-stack [ModuleName] module:
First, create backend with:
- Domain model
- Database schema
- Service layer
- API endpoints
- Tests

Follow backend patterns from @claude_docs/backend/"
```

### Step 2: Create Frontend

Tell Claude:
```
"Now create frontend for [ModuleName]:
- List view with XOSGrid
- Add/Edit form
- Delete functionality
- Connect to backend APIs using Utils.ajax

Follow @claude_docs/development-guide/TDD-XOS-FRONTEND-WORKFLOW.md"
```

### Step 3: Integration

Tell Claude:
```
"Integrate [ModuleName] frontend with backend:
- Configure API calls
- Handle loading states
- Error handling with showMessageBox
- Success notifications

Test end-to-end functionality."
```

---

## 🌿 Version Control & GitHub Integration

### Step 1: Initialize Git Workflow

Tell Claude:
```
"Initialize Git workflow for [ModuleName] module:
- Create feature branch: feature/[ModuleName]-implementation
- Set up commit message template for XOS patterns
- Follow conventional commits with XOS-specific scope

Use Git Workflow Manager patterns from @claude_docs/git-github/"
```

### Step 2: Development Commits

Tell Claude:
```
"Commit [ModuleName] development progress:
- Initial scaffold: 'feat(xos-[module]): create MVVM structure'
- ViewModel complete: 'feat(xos-[module]): implement ViewModel with Data pattern'
- Component view: 'feat(xos-[module]): add component with three-step handlers'
- Tests added: 'test(xos-[module]): add comprehensive test suite'
- Final fixes: 'fix(xos-[module]): resolve input handling and Data errors'

Include test coverage and XOS compliance in commit messages."
```

### Step 3: Create Pull Request

Tell Claude:
```
"Create PR for [ModuleName] module with XOS checklist:

TITLE: feat(xos-[module]): implement [ModuleName] with MVVM pattern

DESCRIPTION:
## XOS Module Implementation
- [x] Follows VMBase Data reference pattern
- [x] Implements three-step event handlers  
- [x] All inputs accept keyboard input
- [x] No 'Cannot set property Data' errors
- [x] 80%+ test coverage achieved
- [x] XOSTextbox components work correctly

## Backend (if applicable)
- [x] Uses raw SQL (not Entity Framework)
- [x] POST-only API endpoints
- [x] Proper error handling

## Testing Results
- Unit tests: [X/Y] passing
- Integration tests: [X/Y] passing
- Manual testing: ✅ keyboard input works

Closes #[issue-number]"
```

### GitHub Workflow Integration

#### Branch Naming Convention
```bash
# Frontend modules
feature/xos-[module]-frontend
bugfix/xos-[module]-input-fix
refactor/xos-[module]-vm-cleanup

# Backend modules  
feature/api-[module]-crud
feature/service-[module]-business-logic

# Full-stack modules
feature/[module]-full-stack
```

#### Commit Message Templates
```bash
# Frontend commits
feat(xos-[module]): implement [component] with VMBase pattern
fix(xos-[module]): resolve keyboard input handling
test(xos-[module]): add comprehensive test coverage
docs(xos-[module]): add component usage documentation

# Backend commits  
feat(api-[module]): implement CRUD endpoints with raw SQL
feat(service-[module]): add business logic with transactions
test(api-[module]): add controller and service tests
```

### Step 4: Code Review Checklist

Tell Claude:
```
"Review [ModuleName] PR for XOS compliance:

FRONTEND CHECKLIST:
- [ ] No 'Cannot set property Data' errors in console
- [ ] All XOSTextbox inputs accept keyboard typing
- [ ] updateUI() called after every state change
- [ ] ViewModel extends VMBase correctly  
- [ ] Three-step event handler pattern used
- [ ] Test coverage > 80%
- [ ] Component extends XOSComponent (not wrapped in XOSContainer)

BACKEND CHECKLIST (if applicable):
- [ ] Uses GetEntityDataListAsync pattern
- [ ] All endpoints are POST
- [ ] Returns domain types directly
- [ ] Raw SQL queries (no Entity Framework)
- [ ] Transaction handling implemented
- [ ] Proper error handling

INTEGRATION CHECKLIST:
- [ ] API calls use Utils.ajax
- [ ] Loading states implemented
- [ ] Error handling with showMessageBox
- [ ] Success notifications work"
```

### Step 5: Merge & Deploy

Tell Claude:
```
"Complete [ModuleName] module deployment:
- Squash merge to main/develop branch
- Delete feature branch after merge
- Tag release if module is complete: v[module]-1.0.0
- Update module documentation
- Notify team of new module availability

Ensure CI/CD pipeline runs successfully."
```

---

## 🧪 Testing Your Module

### Frontend Testing Command

Tell Claude:
```
"Run frontend tests for [ModuleName]:
npm test [ModuleName]

Fix any failures, especially:
- Keyboard input acceptance
- Data property errors
- Event handler issues"
```

### Backend Testing Command

Tell Claude:
```
"Run backend tests for [ModuleName]:
dotnet test --filter FullyQualifiedName~[ModuleName]

Ensure 80% coverage minimum."
```

### Integration Testing

Tell Claude:
```
"Test [ModuleName] end-to-end:
1. Start backend: dotnet run
2. Start frontend: npm start
3. Test all CRUD operations
4. Verify data persistence
5. Check error handling"
```

---

## ⚠️ Common Issues & Solutions

### Frontend Issues

| Issue | What to Tell Claude |
|-------|-------------------|
| "Cannot set property Data" error | "Fix using Data reference pattern from @claude_docs/frontend/xos-input-handling-fix.md" |
| Inputs not accepting typing | "Add updateUI() calls and ensure three-step event handler pattern" |
| Component not re-rendering | "Check that updateUI() is called after state changes" |
| XOSTextbox not working | "Verify 'name' prop exists and onChange uses e.value not e.target.value" |

### Backend Issues

| Issue | What to Tell Claude |
|-------|-------------------|
| Database connection fails | "Check connection string in appsettings.json, verify PostgreSQL is running" |
| API returns 404 | "Verify route is POST and follows /api/[Controller]/[Action] pattern" |
| Transaction fails | "Ensure commit before SignalR calls, follow pattern from @claude_docs/backend/" |
| GetValue returns null | "Check column name case sensitivity, use exact PostgreSQL column names" |

---

## 📚 Complete Example: User Management Module

### What to Tell Claude - Full Example

```
"Create a complete User Management module:

REQUIREMENTS:
- Users can be created, viewed, edited, deleted
- Fields: Username, Email, FirstName, LastName, Role, IsActive
- Email validation required
- Role dropdown from database
- Grid view with search
- Modal forms for add/edit

BACKEND:
1. Create User domain model in CVS.Domain
2. PostgreSQL table 'users' with appropriate columns
3. UserService with CRUD operations
4. UserController with POST endpoints
5. Unit tests with 80% coverage

FRONTEND:
1. UserList component with XOSGrid
2. UserForm component for add/edit
3. Delete confirmation dialog
4. Connect to backend APIs
5. Tests for all components

Follow all XOS patterns from @claude_docs
Ensure inputs work and no Data property errors
Target: Fully working module with tests"
```

### Expected Deliverables

Claude should create:

```
Backend:
├── CVS.Domain/User.cs
├── CVS.Infrastructure/Services/UserService.cs
├── CVS.WebApi/Controllers/UserController.cs
├── CVS.Tests/Services/UserServiceTests.cs
└── Database/Migrations/001_CreateUsersTable.sql

Frontend:
├── src/components/UserManagement/
│   ├── UserList/
│   │   ├── index.jsx
│   │   ├── UserListVM.jsx
│   │   └── __tests__/
│   ├── UserForm/
│   │   ├── index.jsx
│   │   ├── UserFormVM.jsx
│   │   └── __tests__/
│   └── index.jsx (main component)
```

---

## 🚀 Quick Start Checklist

When starting a new module, tell Claude:

- [ ] "I'm using XOS framework, check @claude_docs for patterns"
- [ ] "Module name is [Name]"
- [ ] "Requirements are: [list requirements]"
- [ ] "Follow TDD workflow with 80% test coverage"
- [ ] "Frontend must use VMBase Data reference pattern"
- [ ] "Backend must use raw SQL, not Entity Framework"
- [ ] "All API endpoints should be POST"
- [ ] "Ensure all inputs accept keyboard input"

---

## 📋 Module Completion Checklist

Before considering your module complete:

### Frontend
- [ ] All inputs accept keyboard input
- [ ] No "Cannot set property Data" errors
- [ ] Form validation works
- [ ] API integration tested
- [ ] 80% test coverage

### Backend
- [ ] All CRUD operations work
- [ ] Validation implemented
- [ ] Error handling complete
- [ ] Transaction support added
- [ ] 80% test coverage

### Integration
- [ ] End-to-end flow tested
- [ ] Error scenarios handled
- [ ] Loading states work
- [ ] Success messages show
- [ ] Data persists correctly

---

## 🆘 When Things Go Wrong

If Claude's implementation has issues:

1. **Be Specific**: "The userName input in UserForm component won't accept typing"
2. **Reference Docs**: "Fix using @claude_docs/frontend/xos-input-handling-fix.md"
3. **Show Error**: "Getting error: [paste exact error]"
4. **Request Pattern**: "Use the three-step event handler pattern"

---

## 📖 Essential Reading

Before starting any module, ensure Claude reads:

1. `@claude_docs/CRITICAL_PATTERNS.md` - Core XOS patterns
2. `@claude_docs/frontend/xos-input-handling-fix.md` - Frontend input handling
3. `@claude_docs/backend/backend-blueprint.md` - Backend architecture
4. `@claude_docs/development-guide/TDD-MODULE-WORKFLOW.md` - TDD process
5. `@claude_docs/development-guide/TDD-XOS-FRONTEND-WORKFLOW.md` - Frontend specifics

## 🚀 Quick Access Resources

### For Quick Reference
- `@claude_docs/CLAUDE-PROMPT-QUICK-REFERENCE.md` - Copy-paste prompts
- `@claude_docs/COMMON-MODULE-EXAMPLES.md` - Ready-to-use module templates
- `@claude_docs/development-guide/XOS-COMPONENT-CHECKLIST.md` - Component validation

### For Troubleshooting
- `@claude_docs/frontend/xos-common-issues.md` - Frontend issues
- `@claude_docs/troubleshooting/backend-issues.md` - Backend issues
- `@claude_docs/development-guide/USERLOGIN-WORKFLOW-VALIDATION.md` - Example walkthrough

---

## 🧭 Quick Navigation
- [← Back to claude_docs](./README.md) - Main documentation hub  
- [CRITICAL_PATTERNS.md](./CRITICAL_PATTERNS.md) - **Read this first**
- [Quick Reference Prompts](./CLAUDE-PROMPT-QUICK-REFERENCE.md) - Copy-paste prompts
- [Common Module Examples](./COMMON-MODULE-EXAMPLES.md) - Ready-made templates
- [XOS Input Fix](./frontend/xos-input-handling-fix.md) - Fix typing issues
- [Backend Blueprint](./backend/backend-blueprint.md) - API patterns
- [Setup Guide](./SETUP.md) - Environment setup

*Remember: The XOS framework has unique patterns. Always tell Claude to check @claude_docs before implementing!*