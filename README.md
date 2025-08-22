# Project Documentation Hub

## 🚨 CRITICAL - READ FIRST
**[CRITICAL_PATTERNS.md](./CRITICAL_PATTERNS.md)** - This document contains MANDATORY patterns that differ from standard development. XOS-based applications use a custom framework that significantly modifies standard React and ASP.NET Core patterns.

## 🚀 Quick Start

This documentation hub contains all technical documentation for your project.

### For New Developers - REQUIRED READING ORDER
1. **[CRITICAL PATTERNS](./CRITICAL_PATTERNS.md)** - MUST READ FIRST
2. **[XOS Framework Guide](./frontend/xos-framework.md)** - Custom framework overview  
3. **[Backend Blueprint](./backend/backend-blueprint.md)** - XOS backend patterns
4. **[Development Guide](./development-guide/quick-reference.md)** - Common commands
5. Review [Project Structure](./project/project-structure.md)
6. Check [Naming Conventions](./project/naming-conventions.md)

## 🤖 How Developers Should Use @claude_docs with Claude Code

### The Problem: XOS Framework ≠ Standard Development
This project uses **XOS Framework** - a custom enterprise system that completely changes React and .NET patterns. Standard tutorials will break your code.

### The Solution: Reference @claude_docs in Every Prompt
The `@claude_docs/` system contains everything Claude needs to work correctly with XOS.

---

## 📋 Copy-Paste Prompts for Developers

### 🚨 Always Start Here (Copy This Exactly)
```
I'm working with XOS framework. Check @claude_docs/CRITICAL_PATTERNS.md before implementing anything.
```
**Why**: Claude needs this context or it will use standard React/.NET patterns that don't work.

---

### 🎨 Frontend Development Prompts

**Creating a New Component:**
```
Create [YourComponentName] component using XOS MVVM pattern.
Follow @claude_docs/development-guide/TDD-XOS-FRONTEND-WORKFLOW.md
Use @claude_docs/frontend/ui-templates/XOSComponentTemplate as base.
CRITICAL: All inputs must accept keyboard typing - use patterns from @claude_docs/frontend/xos-input-handling-fix.md
```

**Fixing Input Issues:**
```
[YourComponentName] inputs won't accept keyboard typing.
Fix using three-step event handler pattern from @claude_docs/frontend/xos-input-handling-fix.md
Ensure updateUI() is called after state changes.
```

**Data/State Errors:**
```
Getting "Cannot set property Data" error in [ComponentName].
Fix using ViewModel initialization patterns from @claude_docs/CRITICAL_PATTERNS.md
Use init() method with Data reference pattern.
```

---

### 💾 Backend Development Prompts

**Creating API Service:**
```
Create [EntityName]Service with CRUD operations for PostgreSQL.
Follow @claude_docs/backend/backend-blueprint.md patterns.
Use GetEntityDataListAsync pattern from @claude_docs/backend/xos-backend-complete-guide.md
POST endpoints only, return domain types directly.
Target 80% test coverage.
```

**Creating API Controller:**
```
Create [EntityName]Controller with POST endpoints.
Follow @claude_docs/backend/api-routes.md patterns.
Return domain types directly, not IActionResult.
Use dependency injection for services.
```

---

### 🔧 Complete Feature Prompts

**Full-Stack Module:**
```
Create complete [ModuleName] module with frontend + backend.
Use module examples from @claude_docs/COMMON-MODULE-EXAMPLES.md
Follow full workflow from @claude_docs/MODULE-DEVELOPMENT-GUIDE.md
Backend: PostgreSQL with raw SQL, POST-only endpoints
Frontend: XOS MVVM with working keyboard inputs
Target: 80% test coverage, working end-to-end
```

---

### 🆘 Troubleshooting Prompts

**General Issues:**
```
[Describe your specific problem here]
Fix using patterns from @claude_docs/CLAUDE-PROMPT-QUICK-REFERENCE.md
Check @claude_docs/troubleshooting/[frontend|backend|api|database|testing]-issues.md for solutions.
```

**When Claude Gets Confused:**
```
Use XOS patterns from @claude_docs/CRITICAL_PATTERNS.md
This is NOT standard React/.NET - use XOS-specific implementations.
```

---

## 🎯 Essential Files Every Developer Should Know

| File | Copy-Paste This Reference | When to Use |
|------|--------------------------|-------------|
| **CRITICAL_PATTERNS.md** | `@claude_docs/CRITICAL_PATTERNS.md` | **Every single prompt** |
| **MODULE-DEVELOPMENT-GUIDE.md** | `@claude_docs/MODULE-DEVELOPMENT-GUIDE.md` | Creating any new feature |
| **CLAUDE-PROMPT-QUICK-REFERENCE.md** | `@claude_docs/CLAUDE-PROMPT-QUICK-REFERENCE.md` | Need more copy-paste prompts |
| **xos-input-handling-fix.md** | `@claude_docs/frontend/xos-input-handling-fix.md` | Inputs won't type |
| **backend-blueprint.md** | `@claude_docs/backend/backend-blueprint.md` | Any backend work |
| **SETUP.md** | `@claude_docs/SETUP.md` | Initial project setup |

---

## 💡 Pro Tips for Developers

### ✅ Do This
1. **Always copy-paste the prompts above** - they're tested and work
2. **Be specific about problems** - "Username input won't type" vs "it's broken"
3. **Reference exact file paths** - `@claude_docs/path/file.md`
4. **Let Claude handle the complexity** - just point it to the right docs

### ❌ Don't Do This
1. Don't assume Claude knows XOS patterns without references
2. Don't try to explain XOS yourself - let the docs do it
3. Don't skip the `@claude_docs/CRITICAL_PATTERNS.md` reference

---

## 🔄 Development Workflow

1. **Need new feature?** → Use "Full-Stack Module" prompt
2. **Component broken?** → Use "Fixing Input Issues" or "Data/State Errors" prompts
3. **API not working?** → Use "Creating API Service" prompt
4. **Claude confused?** → Reference `@claude_docs/CRITICAL_PATTERNS.md`
5. **Still stuck?** → Check `@claude_docs/troubleshooting/`

---

## 🚀 Quick Setup (Do This First)
```bash
powershell D:\Projects\CVS_Claude\claude_docs\master-setup.ps1 -QuickSetup
```
This prevents 90% of XOS framework errors automatically.

---

## 🧭 Quick Navigation

### 📝 Most Used Files
- [CRITICAL_PATTERNS.md](./CRITICAL_PATTERNS.md) - **Start here always**
- [CLAUDE-PROMPT-QUICK-REFERENCE.md](./CLAUDE-PROMPT-QUICK-REFERENCE.md) - More copy-paste prompts
- [MODULE-DEVELOPMENT-GUIDE.md](./MODULE-DEVELOPMENT-GUIDE.md) - Complete workflows
- [SETUP.md](./SETUP.md) - Environment setup

### 🎨 Frontend Development
- [XOS Input Fix](./frontend/xos-input-handling-fix.md) - Fix typing issues
- [Component Templates](./frontend/ui-templates/) - Ready-made components
- [XOS Framework Guide](./frontend/xos-framework-complete-guide.md) - Complete reference
- [Frontend Troubleshooting](./troubleshooting/frontend-issues.md) - Common problems

### 💾 Backend Development  
- [Backend Blueprint](./backend/backend-blueprint.md) - Architecture patterns
- [API Routes](./backend/api-routes.md) - Endpoint patterns
- [XOS Backend Guide](./backend/xos-backend-complete-guide.md) - Complete reference
- [Backend Troubleshooting](./troubleshooting/backend-issues.md) - Common problems

### 🔧 Troubleshooting
- [API Issues](./troubleshooting/api-issues.md) - Endpoint problems
- [Database Issues](./troubleshooting/database-issues.md) - PostgreSQL problems  
- [Testing Issues](./troubleshooting/testing-issues.md) - Test failures

## 📚 Documentation Structure

### 🏗️ Architecture & Design
- **[Backend](./backend/)** - API design, services, domain models
  - [API Routes](./backend/api-routes.md) - Endpoint reference
  - [Backend Implementation](./backend/backend-implementation.md) - Service patterns
  - [Domains](./backend/domains-essential.md) - Domain-driven design

- **[Frontend](./frontend/)** - UI frameworks and components
  - [XOS Framework Guide](./frontend/xos-framework-complete-guide.md) - Complete MVVM framework reference
  - [Component Fallbacks](./frontend/xos-fallbacks.md) - Bootstrap alternatives
  - [Migration Setup](./frontend/migration-setup.md) - Legacy to modern migration

- **[Database](./database/)** - Schema and data management
  - [Database Schema](./database/database-schema.md) - Table definitions
  - [Schema Design](./database/schema-design.md) - Design patterns

### 💻 Development
- **[Development Guide](./development-guide/)** - Getting started and best practices
  - [Quick Reference](./development-guide/quick-reference.md) - Common commands
  - [Running the App](./development-guide/running-the-app.md) - Local setup
  - [Troubleshooting](./development-guide/troubleshooting.md) - Common issues
  - **[TDD Module Workflow](./development-guide/TDD-MODULE-WORKFLOW.md)** - Standardized test-driven development process

- **[Testing](./testing/)** - Test strategies and examples
  - [Testing Best Practices](./testing/testing-best-practices.md) - Comprehensive testing reference
  - [Backend Testing](./testing/backend-testing-guide.md) - .NET/xUnit patterns
  - [Frontend Testing](./testing/frontend-testing-guide.md) - React/Jest patterns
  - [Test Examples](./testing/test-examples/) - Code samples
  - **[Troubleshooting Guides](./troubleshooting/)** - Domain-specific issue resolution
    - [Backend Issues](./troubleshooting/backend-issues.md) - Service, auth, data access
    - [Frontend Issues](./troubleshooting/frontend-issues.md) - XOS components, state management
    - [API Issues](./troubleshooting/api-issues.md) - REST endpoints, validation
    - [Database Issues](./troubleshooting/database-issues.md) - PostgreSQL, migrations
    - [Testing Issues](./troubleshooting/testing-issues.md) - Test failures, mocking

### 🤖 Automation & CI/CD
- **[Automation](./automation/)** - AI agents and automation
  - [Subagent Patterns](./automation/subagent-patterns.md) - Agent composition
  - [Individual Agents](./automation/agents/) - Specialized AI agents

- **[Git/GitHub](./git-github/)** - Version control and workflows
  - [Git Automation](./git-github/git-automation-guide.md)
  - [GitHub Actions](./git-github/github-actions-templates.md)

### 🔧 Configuration
- **[Setup Guide](./SETUP.md)** - Master setup for Claude Code configuration
  - [PostgreSQL MCP](./setup/postgres-mcp-complete-setup.md)
  - [XOS App Setup](./setup/xos-app-setup-guide.md)

- **[Hooks](./hooks/)** - Claude Enterprise hooks
  - [Hook System](./hooks/hook-system.md)
  - [Master Hook Manager](./hooks/master-hook-manager.md)

### 📋 Project Management
- **[Project](./project/)** - Project-specific documentation
  - [Module Map](./project/module-map.md) - Component organization
  - [Critical Paths](./project/critical-paths.md) - Important workflows
  - [Issues & Fixes](./project/issues-and-fixes.md) - Known issues

- **[Security](./security/)** - Security guidelines
  - [Security Rules](./security/security-rules.md) - Security policies

## 🎯 Framework Detection

This documentation supports multiple frameworks. The system will auto-detect your framework based on:

### XOS Framework (Enterprise React MVVM)
- Presence of `xos-components` directory
- Uses class-based components with ViewModels
- Bootstrap 5 integration
- See [XOS Framework Guide](./frontend/xos-framework-complete-guide.md)

### Standard React
- Modern React with hooks
- Functional components
- Various state management options

### .NET Backend
- ASP.NET Core Web API
- Entity Framework Core
- Clean Architecture patterns

## 🔍 Common Tasks

### Adding a New Module
1. **MUST use TDD workflow**: Follow [TDD Module Workflow](./development-guide/TDD-MODULE-WORKFLOW.md)
2. Review [Module Map](./project/module-map.md) for naming
3. Follow [MVVM Pattern](./frontend/mvvm-mandatory.md) (if XOS)
4. Reference [Troubleshooting Guides](./troubleshooting/) for common issues
5. Update documentation

### Debugging Issues
1. Check [Known Issues](./project/issues-and-fixes.md)
2. Review [Domain-Specific Troubleshooting](./troubleshooting/) - backend, frontend, API, database, or testing
3. Review [General Troubleshooting](./development-guide/troubleshooting.md)
4. Search error in codebase
5. Document new issues in appropriate troubleshooting guide

### Working with APIs
1. Reference [API Routes](./backend/api-routes.md)
2. Follow [API Design](./backend/backend-implementation.md)
3. Test with provided examples
4. Update OpenAPI specs

## 🏷️ Naming Conventions

### Module Prefixes (Customize for your project)
Replace `{PROJECT}` with your project abbreviation:
- `{PROJECT}M###` - Master/Configuration modules
- `{PROJECT}T###` - Transaction modules  
- `{PROJECT}R###` - Report modules

Example for "ERP" project:
- `ERPM001` - User Management
- `ERPT001` - Sales Transaction
- `ERPR001` - Sales Report

### File Naming
- **Documentation**: lowercase with hyphens (`api-routes.md`)
- **Components**: PascalCase (`UserComponent.jsx`)
- **ViewModels**: PascalCase with VM suffix (`UserComponentVM.js`)

## 🚦 Status Indicators

### Documentation Quality
- ✅ **Complete** - Fully documented with examples
- 🔧 **In Progress** - Being updated or expanded
- ⚠️ **Needs Review** - May be outdated
- 🔴 **Deprecated** - No longer maintained

### Framework Support
- 🟢 **XOS Framework** - Full support with examples
- 🟢 **React** - Modern React patterns
- 🟢 **.NET Core** - Backend services
- 🟡 **Vue/Angular** - Basic patterns applicable

## 📝 Contributing

### Documentation Updates
1. Keep documentation close to code
2. Update docs with code changes
3. Include working examples
4. Test all code snippets
5. Add to appropriate section

### Style Guide
- Use clear, concise language
- Include code examples
- Add diagrams for complex concepts
- Keep files under 500 lines
- Use proper markdown formatting

## 🔗 Quick Links

### Most Used Documents
- **[TDD Module Workflow](./development-guide/TDD-MODULE-WORKFLOW.md)** - Required for all module development
- [XOS Framework Complete Guide](./frontend/xos-framework-complete-guide.md)
- [API Routes Reference](./backend/api-routes.md)
- [Testing Guide](./testing/testing-guide.md)
- [Module Map](./project/module-map.md)
- **[Troubleshooting Guides](./troubleshooting/)** - Domain-specific issue resolution

### For Specific Roles
- **Frontend Dev**: [Frontend Docs](./frontend/)
- **Backend Dev**: [Backend Docs](./backend/)
- **DevOps**: [Automation](./automation/) & [Git/GitHub](./git-github/)
- **QA**: [Testing](./testing/)
- **New Team Members**: [Development Guide](./development-guide/)

## 🛠️ Tools & Extensions

### Recommended VS Code Extensions
- ESLint
- Prettier
- GitLens
- REST Client
- Thunder Client
- Markdown All in One

### Development Tools
- Node.js 16+
- .NET 6+
- PostgreSQL 13+
- Docker Desktop
- Git 2.30+

## 📌 Important Notes

1. **Framework Detection**: Documentation adapts based on detected framework
2. **Project Agnostic**: Replace project-specific prefixes with your own
3. **Living Documentation**: Keep docs updated with code changes
4. **AI-Friendly**: Optimized for Claude and other AI assistants
5. **Searchable**: Use Ctrl+F to find topics quickly

---

*Documentation Version: 2.1.0*  
*Last Updated: August 21, 2025*  
*Maintainer: Development Team*

> **Need Help?** Start with [Quick Reference](./development-guide/quick-reference.md) or search for your topic using Ctrl+F