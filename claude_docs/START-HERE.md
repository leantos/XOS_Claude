# 🚀 START HERE - Claude Code XOS Framework Guide

## Quick Navigation - Read This First

**New to XOS Framework?** Start with `essential/CRITICAL_PATTERNS.md` (5 minutes)

**Building a Module?** Go straight to `xos-complete-patterns/` (Everything you need)

**Need Tools/Setup?** Check the preserved sections below

---

## 🎯 What Are You Building?

### Frontend Component
```
👉 READ: xos-complete-patterns/frontend/
   - component-complete.jsx (1000 lines - EVERY UI pattern)
   - viewmodel-complete.jsx (800 lines - ALL VM patterns)
   - service-complete.js (500 lines - ALL API calls)
```

### Backend API
```
👉 READ: xos-complete-patterns/backend/
   - controller-complete.cs (600 lines - ALL endpoints)
   - service-complete.cs (1200 lines - ALL DB operations)
```

### Full-Stack Module
```
👉 READ: Both frontend/ and backend/ patterns above
👉 THEN: xos-complete-patterns/integration/frontend-to-backend.md
```

### Styling/Theme Work
```
👉 READ: xos-complete-patterns/styling/
   - bootstrap-complete.html (1000 lines - ALL Bootstrap usage)
   - theme-complete.css (600 lines - ALL theming)
```

---

## 📚 Pattern Files Explanation

### ✅ EXHAUSTIVE PATTERNS (95%+ Accuracy)
All patterns in `xos-complete-patterns/` are **complete working code**:
- Not fragments or examples
- Include error handling, validation, loading states
- Cover every edge case
- Production-ready patterns

### 🔧 ESSENTIAL DOCS (Quick Reference)
- `essential/CRITICAL_PATTERNS.md` - Quick XOS overview
- `essential/MODULE-DEVELOPMENT-GUIDE.md` - Development workflow
- `essential/SETUP.md` - Environment setup

### 🤖 AUTOMATION & TOOLS (Preserved)
- `automation/agents/` - Specialized AI agents
- `hooks/` - Claude Code configuration
- `setup/` - Environment setup scripts
- `git-github/` - Version control workflows

---

## 🎯 Common Tasks Quick Links

| What You're Doing | Read This File |
|-------------------|----------------|
| Creating a form component | `xos-complete-patterns/frontend/component-complete.jsx` |
| Building an API endpoint | `xos-complete-patterns/backend/controller-complete.cs` |
| Database queries | `xos-complete-patterns/backend/service-complete.cs` |
| Styling with Bootstrap | `xos-complete-patterns/styling/bootstrap-complete.html` |
| API calls from frontend | `xos-complete-patterns/frontend/service-complete.js` |
| Setting up authentication | `xos-complete-patterns/infrastructure/program-complete.cs` |
| Modal/popup handling | `xos-complete-patterns/jquery-bootstrap/modal-patterns.js` |
| File uploads | `xos-complete-patterns/integration/file-upload-complete.jsx` |
| Real-time updates | `xos-complete-patterns/integration/signalr-complete.cs` |

---

## ⚠️ CRITICAL XOS RULES (Never Break These)

1. **Frontend**: Always extend `XOSComponent`, pass VM to super()
2. **ViewModel**: Always use Data reference pattern: `const model = this.Data`
3. **Event Handlers**: Always use 3-step pattern + `updateUI()`
4. **Backend**: All endpoints are POST, return domain types directly
5. **Database**: Always use `row.GetValue<T>("column")` pattern
6. **API Calls**: Always use `Utils.ajax` with relative URLs

Full rules: `xos-complete-patterns/ABSOLUTE-RULES.md`

---

## 📁 Folder Structure

```
claude_docs/
├── 📍 START-HERE.md (this file)
├── 🎯 xos-complete-patterns/         # THE source of truth
│   ├── frontend/                     # UI components, ViewModels
│   ├── backend/                      # Controllers, Services
│   ├── infrastructure/               # XOS packages, startup
│   ├── styling/                      # Bootstrap, CSS, theming
│   ├── api-patterns/                 # API calls, error handling
│   ├── database/                     # Queries, transactions
│   ├── integration/                  # Frontend-backend flow
│   ├── jquery-bootstrap/             # jQuery patterns
│   ├── ABSOLUTE-RULES.md            # Unbreakable laws
│   └── COMMON-PITFALLS.md           # What breaks everything
├── 📖 essential/                     # Core reference docs
├── 🤖 automation/                    # AI agents & tools
├── ⚙️ hooks/                         # Claude Code config
├── 🔧 setup/                         # Environment setup
├── 📝 git-github/                    # Git workflows
├── 📊 project/                       # Project structure
└── 🔒 security/                      # Security rules
```

---

## 🚨 Getting Errors?

1. **"Cannot set property Data"** → Read `xos-complete-patterns/frontend/viewmodel-complete.jsx` (line 50-100)
2. **Inputs not accepting typing** → Read `xos-complete-patterns/frontend/component-complete.jsx` (line 200-300)
3. **API calls failing** → Read `xos-complete-patterns/frontend/service-complete.js` (line 100-200)
4. **Database errors** → Read `xos-complete-patterns/backend/service-complete.cs` (line 500-700)

Full troubleshooting: `xos-complete-patterns/COMMON-PITFALLS.md`

---

## 💡 Pro Tips

- **One-shot accuracy**: Read the complete pattern file for your layer
- **Context efficient**: Each pattern file is self-contained
- **Copy-paste ready**: All code is production-ready
- **Framework agnostic**: Patterns work for any XOS project

---

## 🆘 Need Help?

1. **General XOS questions**: `essential/CRITICAL_PATTERNS.md`
2. **Specific patterns**: `xos-complete-patterns/[your-area]/`
3. **Setup issues**: `setup/` folder
4. **Automation**: `automation/agents/` for specialized help

**Remember**: Everything XOS-related is in `xos-complete-patterns/`. Everything else is tooling and project-specific content.

Happy coding! 🎉