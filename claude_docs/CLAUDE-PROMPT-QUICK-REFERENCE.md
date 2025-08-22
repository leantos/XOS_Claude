# 🎯 Claude Prompt Quick Reference - XOS Framework

## 🚨 ALWAYS START WITH THIS
```
"I'm working with the XOS framework which has custom patterns different from standard React/.NET. 
Check @claude_docs for patterns before implementing."
```

---

## 🎨 FRONTEND PROMPTS

### Create New Component
```
"Create [ComponentName] using XOS MVVM pattern.
Follow @claude_docs/development-guide/TDD-XOS-FRONTEND-WORKFLOW.md
Use @claude_docs/frontend/ui-templates/XOSComponentTemplate as base.
CRITICAL: Use VMBase Data reference pattern from @claude_docs/frontend/xos-input-handling-fix.md"
```

### Fix Input Not Working
```
"XOSTextbox inputs not accepting keyboard input in [ComponentName].
Fix using @claude_docs/frontend/xos-input-handling-fix.md
Ensure three-step event handler pattern and updateUI() calls."
```

### Fix Data Property Error
```
"Getting 'Cannot set property Data' error in [ComponentName].
Fix using correct ViewModel init() pattern from @claude_docs/CRITICAL_PATTERNS.md"
```

### Add Grid/Table
```
"Add XOSGrid to [ComponentName] for displaying [EntityName] list.
Use @claude_docs/frontend/ui-templates/SearchListGridTemplate as reference."
```

### Add Form Validation
```
"Add validation to [ComponentName] form:
- [Field1]: [Rule]
- [Field2]: [Rule]
Show errors using showMessageBox pattern."
```

---

## 💾 BACKEND PROMPTS

### Create CRUD Service
```
"Create [EntityName]Service with CRUD operations.
Use PostgreSQL with raw SQL.
Follow @claude_docs/backend/backend-blueprint.md
Use GetEntityDataListAsync pattern, NOT Entity Framework."
```

### Create API Controller
```
"Create [EntityName]Controller with POST endpoints only.
Return domain types directly.
Follow @claude_docs/backend/api-routes.md"
```

### Add Database Table
```
"Create PostgreSQL table for [EntityName]:
Columns: [list columns]
Generate migration script."
```

### Fix Database Query
```
"Fix database query in [ServiceName].
Use GetEntityDataListAsync with row.GetValue<T>('column_name').
Follow @claude_docs/backend/backend-blueprint.md"
```

---

## 🔗 FULL-STACK PROMPTS

### Create Complete Module
```
"Create full-stack [ModuleName] module:
BACKEND: [Entity] with CRUD operations, PostgreSQL
FRONTEND: List view, Add/Edit forms, Delete
Follow XOS patterns from @claude_docs/
Target: 80% test coverage"
```

### Connect Frontend to Backend
```
"Connect [ComponentName] to [ControllerName] API.
Use Utils.ajax for calls.
Handle loading states and errors.
Follow @claude_docs/frontend/utils-api.md"
```

---

## 🧪 TESTING PROMPTS

### Write Frontend Tests
```
"Write tests for [ComponentName]:
- ViewModel initialization
- Input handling
- Validation
- API calls
Verify inputs accept keyboard input.
Target 80% coverage."
```

### Write Backend Tests
```
"Write unit tests for [ServiceName]:
- Mock dependencies with Moq
- Test all CRUD operations
- Test validation
- Test error cases
Use xUnit and FluentAssertions."
```

### Fix Failing Tests
```
"Tests failing in [ComponentName/ServiceName].
Error: [paste error]
Fix following XOS patterns from @claude_docs/"
```

---

## 🔧 DEBUGGING PROMPTS

### Debug Frontend Issue
```
"Debug issue in [ComponentName]:
Symptom: [describe issue]
Console error: [paste error]
Check against @claude_docs/frontend/xos-common-issues.md"
```

### Debug Backend Issue
```
"Debug issue in [ServiceName]:
Error: [paste error]
Stack trace: [paste trace]
Check against @claude_docs/troubleshooting/backend-issues.md"
```

### Debug Integration Issue
```
"Frontend-backend integration failing:
API call: [endpoint]
Error: [error message]
Fix using patterns from @claude_docs/CRITICAL_PATTERNS.md"
```

---

## 📋 COMMON PATTERNS TO REQUEST

### Frontend Patterns
- "Use three-step event handler pattern"
- "Use VMBase Data reference pattern"
- "Add updateUI() after state changes"
- "Use e.value not e.target.value"
- "Add name prop to all XOS inputs"

### Backend Patterns
- "Use POST endpoints only"
- "Return domain types directly"
- "Use GetEntityDataListAsync pattern"
- "Use row.GetValue<T>('column')"
- "Commit transaction before SignalR"

---

## ⚡ QUICK FIXES

| Problem | Quick Prompt |
|---------|-------------|
| Input won't type | "Add updateUI() to handler" |
| Data property error | "Use init() with Data reference" |
| API 404 | "Make endpoint POST, check route" |
| DB query null | "Check column name case" |
| Test fails | "Mock dependencies properly" |
| No re-render | "Call updateUI() after change" |

---

## 📚 DOCUMENTATION REFERENCES

Tell Claude to check these for specific issues:

- **Input Issues**: `@claude_docs/frontend/xos-input-handling-fix.md`
- **Component Patterns**: `@claude_docs/CRITICAL_PATTERNS.md`
- **Backend Patterns**: `@claude_docs/backend/backend-blueprint.md`
- **API Patterns**: `@claude_docs/backend/api-routes.md`
- **Testing**: `@claude_docs/testing/xos-framework-testing.md`
- **Common Issues**: `@claude_docs/frontend/xos-common-issues.md`

---

## 🎯 GOLDEN RULES

Always tell Claude:

1. ✅ "Check @claude_docs before implementing"
2. ✅ "Use XOS patterns, not standard React/.NET"
3. ✅ "Inputs must accept keyboard input"
4. ✅ "Use POST endpoints only"
5. ✅ "No Entity Framework, use raw SQL"
6. ✅ "Target 80% test coverage"
7. ✅ "Use VMBase Data reference pattern"

---

## 🚀 COMPLETE MODULE TEMPLATE

```
"Create [ModuleName] module for [purpose].

Requirements:
- [List all requirements]

Technical specs:
- XOS framework with MVVM
- PostgreSQL database
- Follow TDD with 80% coverage

CRITICAL:
- Check @claude_docs/CRITICAL_PATTERNS.md first
- Frontend: Follow @claude_docs/development-guide/TDD-XOS-FRONTEND-WORKFLOW.md
- Backend: Follow @claude_docs/backend/backend-blueprint.md
- All inputs must accept keyboard input
- Use POST endpoints only

Start with backend, then frontend, then integration."
```

---

## 🧭 Quick Navigation
- [← Back to claude_docs](./README.md) - Main documentation hub
- [CRITICAL_PATTERNS.md](./CRITICAL_PATTERNS.md) - **Essential patterns**
- [Module Development Guide](./MODULE-DEVELOPMENT-GUIDE.md) - Complete workflows  
- [Common Module Examples](./COMMON-MODULE-EXAMPLES.md) - Ready-made templates
- [XOS Input Fix](./frontend/xos-input-handling-fix.md) - Fix typing issues
- [Backend Blueprint](./backend/backend-blueprint.md) - API patterns
- [Setup Guide](./SETUP.md) - Environment setup

*Keep this reference handy when working with Claude on XOS framework projects!*