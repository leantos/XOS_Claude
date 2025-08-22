# API Single Responsibility Principle

## 🎯 Core Principle

**Every API endpoint must do exactly ONE task and ONE task only.**

Before creating any new endpoint, you MUST verify that this functionality doesn't already exist elsewhere in the codebase.

## ⚠️ The Problem This Solves

### Real Example from This Project:
We had **duplicate authentication endpoints** because:
- `/api/auth/login` existed for authentication
- `/api/userlogin/authenticate` was created later doing the SAME thing
- Result: Confusion, maintenance overhead, inconsistent behavior

### Root Cause:
- Module generator created endpoints without checking existing functionality
- No validation process for duplicate responsibilities
- Ambiguous naming led to scope creep

## 🔍 Pre-Development Checklist

### BEFORE creating ANY new endpoint:

#### 1. **Search Existing Code**
```bash
# Search for similar functionality
grep -r "login\|authenticate" Controllers/
grep -r "password\|reset" Controllers/
grep -r "token\|refresh" Controllers/

# Check service interfaces
find . -name "*Service.cs" -exec grep -l "YourMethodName" {} \;
```

#### 2. **Review API Documentation**
- Visit `/swagger` to see all existing endpoints
- Check if similar functionality exists
- Look for overlapping responsibilities

#### 3. **Validate Single Responsibility**
Ask yourself:
- **What EXACTLY does this endpoint do?** (in one sentence)
- **Does this already exist somewhere else?**
- **Could this functionality be part of an existing endpoint?**
- **Is the URL self-explanatory?**

## 📋 Endpoint Creation Guidelines

### ✅ Good Examples

```csharp
// GOOD: Clear single responsibility
[HttpPost("login")]           // Authenticates user
[HttpPost("register")]        // Creates new user account
[HttpGet("menu/{id}")]        // Gets specific menu item
[HttpPatch("menu/{id}/availability")] // Toggles menu availability
```

### ❌ Bad Examples

```csharp
// BAD: Duplicate functionality
[HttpPost("authenticate")]    // Duplicates login
[HttpPost("user-login")]      // Ambiguous name
[HttpPost("manage")]          // Too vague
[HttpGet("data")]            // What data?
```

## 🏗️ Naming Conventions

### URL Structure
```
/api/{module}/{specific-action}
/api/{module}/{resource}/{id}
/api/{module}/{resource}/{id}/{sub-action}
```

### Examples:
```
✅ /api/auth/login                    - Clear action
✅ /api/menu/categories               - Specific resource
✅ /api/userlogin/audit/search        - Clear hierarchy
✅ /api/userlogin/sessions/list/{id}  - Specific sub-action

❌ /api/userlogin/authenticate        - Duplicates /api/auth/login
❌ /api/data/get                      - Too vague
❌ /api/manage/stuff                  - Meaningless
```

## 🚫 Anti-Patterns to Avoid

### 1. **Duplicate Responsibilities**
```csharp
// DON'T DO THIS:
/api/auth/login          // Primary login
/api/userlogin/authenticate  // Duplicate login
```

### 2. **Mixed Responsibilities**
```csharp
// DON'T DO THIS:
[HttpPost("user-management")]  // Too broad - what does it manage?
public async Task ManageUser([FromBody] dynamic data)
{
    // This could be create, update, delete, or anything!
}
```

### 3. **Ambiguous Naming**
```csharp
// DON'T DO THIS:
[HttpPost("process")]     // Process what?
[HttpGet("data")]         // What data?
[HttpPut("update")]       // Update what?
```

## 📖 Documentation Requirements

### Every endpoint MUST have:

```csharp
/// <summary>
/// SINGLE RESPONSIBILITY: [Exactly what this does in one sentence]
/// DOES NOT: [What it explicitly doesn't do]
/// </summary>
/// <param name="request">Description of input</param>
/// <returns>Description of output</returns>
[HttpPost("specific-action")]
public async Task<ActionResult> SpecificAction([FromBody] SpecificRequest request)
```

### Example:
```csharp
/// <summary>
/// SINGLE RESPONSIBILITY: Validates an access token and returns user information
/// DOES NOT: Authenticate user, refresh token, or create sessions
/// </summary>
/// <param name="request">Token validation request containing access token</param>
/// <returns>Token validation result with user info if valid</returns>
[HttpPost("token/validate")]
public async Task<IActionResult> ValidateToken([FromBody] TokenValidationRequest request)
```

## 🔧 Validation Process

### 1. **Code Review Checklist**
- [ ] Does this endpoint do exactly one thing?
- [ ] Is this functionality already available elsewhere?
- [ ] Is the URL self-explanatory?
- [ ] Does the documentation clearly state what it does AND doesn't do?
- [ ] Are parameters and return types specific?

### 2. **Module Generator Validation**
Before using any module generator:
- [ ] Check existing controllers for similar functionality
- [ ] Define SPECIFIC purpose (not generic like "UserLogin")
- [ ] Choose appropriate module name that reflects actual purpose

### 3. **Automated Checks**
Add to pre-commit hooks:
```bash
#!/bin/bash
# Check for potential duplicate routes
echo "🔍 Checking for duplicate API routes..."
if git diff --cached --name-only | grep -q "Controller\.cs$"; then
    # Add validation logic here
    echo "✅ Route validation passed"
fi
```

## 📚 Current Project Examples

### What Went Wrong: Authentication Duplication

#### Problem:
```csharp
// AuthenticationController.cs
[HttpPost("login")]    // Primary authentication
public async Task<AuthenticationResult> Login([FromBody] LoginRequest request)

// UserLoginController.cs  
[HttpPost("authenticate")]    // DUPLICATE!
public async Task<IActionResult> Authenticate([FromBody] UserLoginRequest request)
```

#### Solution:
- Keep `/api/auth/login` for authentication
- Remove `/api/userlogin/authenticate` 
- UserLogin should focus on audit/tracking only

### What Went Right: Menu Controller

```csharp
[HttpGet("{id}")]              // Gets ONE specific item
[HttpGet("available")]         // Gets items with ONE specific status
[HttpPatch("{id}/availability")] // Updates ONE specific property
[HttpDelete("{id}")]           // Deletes ONE specific item
```

**Why this works:**
- Each endpoint has exactly one responsibility
- URLs are self-explanatory
- No overlapping functionality
- Clear separation of concerns

## 🛠️ Refactoring Guidelines

### When You Find Duplicates:

1. **Identify the Primary Endpoint**
   - Usually the more generic/foundational one
   - Part of the core module (e.g., `/api/auth/`)

2. **Remove Secondary Endpoints**
   - Update client code to use primary endpoint
   - Add deprecation warnings if needed

3. **Clarify Remaining Endpoints**
   - Rename for clarity if needed
   - Update documentation
   - Ensure single responsibility

### Example Refactoring:

#### Before:
```
/api/auth/login                    - Primary auth
/api/userlogin/authenticate        - Duplicate auth
/api/userlogin/validate            - Token validation
/api/userlogin/search              - Login record search
```

#### After:
```
/api/auth/login                    - Authentication ONLY
/api/userlogin/token/validate      - Token validation ONLY  
/api/userlogin/audit/search        - Audit record search ONLY
```

## 🎖️ Best Practices Summary

1. **One Task Rule**: Each endpoint does exactly one thing
2. **Check First**: Always search for existing functionality
3. **Clear Naming**: URLs should be self-explanatory
4. **Document Purpose**: State what it does AND doesn't do
5. **Validate Often**: Use checklists and code reviews
6. **Refactor Fearlessly**: Fix duplicates immediately

## 🚀 Implementation Steps

### For New Endpoints:
1. Define the SINGLE responsibility
2. Search existing codebase
3. Choose clear, specific naming
4. Document thoroughly
5. Review with team
6. Implement with validation

### For Existing Code:
1. Audit current endpoints
2. Identify duplicates
3. Plan refactoring
4. Update client code
5. Remove duplicates
6. Update documentation

---

**Remember: It's easier to prevent duplicate endpoints than to fix them later!**

**Last Updated**: 2025-08-20
**Applies To**: All API development in this project