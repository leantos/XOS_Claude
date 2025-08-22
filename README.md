# XOS Framework Documentation

🌐 **Live Documentation:** https://xos-docs.netlify.app  
📚 **GitHub Repository:** https://github.com/your-org/xos-docs  
🤖 **For Claude Code Integration**

## Overview

This repository provides comprehensive documentation for the XOS Framework, designed to work seamlessly with both human developers (via web interface) and Claude Code (via Git submodules).

## 🎯 Dual-Purpose Documentation System

### 📖 **Web Documentation**
- **Browse:** [xos-docs.netlify.app](https://xos-docs.netlify.app)
- **Features:** Search, dark/light themes, mobile responsive
- **Content:** API routes, troubleshooting, patterns, examples
- **Updates:** Automatically when repository is updated

### 🤖 **Claude Code Integration**
- **Local Access:** Via Git submodules in your projects
- **References:** `@claude_docs/path/file.md` in Claude prompts
- **Templates:** Ready-to-use UI components and patterns
- **Updates:** Manual pull when convenient for your team

---

## 🚀 Quick Start for Development Teams

### 1️⃣ **Add Documentation to Your Project**

```bash
# In your XOS project root directory
git submodule add https://github.com/your-org/xos-docs.git claude_docs
git commit -m "Add XOS documentation"
git push
```

### 2️⃣ **Team Members Setup**

**When cloning the project:**
```bash
# Option A: Clone with submodules
git clone --recurse-submodules https://github.com/your-team/your-project.git

# Option B: If already cloned
git clone https://github.com/your-team/your-project.git
cd your-project
git submodule update --init --recursive
```

### 3️⃣ **Using with Claude Code**

In your Claude prompts, reference documentation files:
```
Create a user login component using patterns from @claude_docs/CRITICAL_PATTERNS.md

Follow the input handling guide from @claude_docs/frontend/xos-input-handling-fix.md

Implement CRUD operations using @claude_docs/backend/backend-blueprint.md
```

---

## 🚨 CRITICAL - READ FIRST
**[CRITICAL_PATTERNS.md](./claude_docs/CRITICAL_PATTERNS.md)** - This document contains MANDATORY patterns that differ from standard development. XOS-based applications use a custom framework that significantly modifies standard React and ASP.NET Core patterns.

### For New Developers - REQUIRED READING ORDER
1. **[CRITICAL PATTERNS](./claude_docs/CRITICAL_PATTERNS.md)** - MUST READ FIRST
2. **[XOS Framework Guide](./claude_docs/frontend/xos-framework.md)** - Custom framework overview  
3. **[Backend Blueprint](./claude_docs/backend/backend-blueprint.md)** - XOS backend patterns
4. **[Development Guide](./claude_docs/development-guide/quick-reference.md)** - Common commands
5. Review [Project Structure](./claude_docs/project/project-structure.md)
6. Check [Naming Conventions](./claude_docs/project/naming-conventions.md)

---

## 📋 **Documentation Structure**

```
claude_docs/
├── CRITICAL_PATTERNS.md           ← Essential XOS patterns (READ FIRST)
├── CLAUDE-PROMPT-QUICK-REFERENCE.md
├── MODULE-DEVELOPMENT-GUIDE.md
├── SETUP.md
├── frontend/
│   ├── xos-input-handling-fix.md   ← Fix input issues
│   ├── xos-components-reference.md
│   ├── ui-templates/               ← Ready-to-use components
│   │   ├── XOSComponentTemplate/
│   │   ├── SearchListGridTemplate/
│   │   └── MasterDetailCRUDTemplate/
│   └── [more frontend guides]
├── backend/
│   ├── backend-blueprint.md        ← Architecture guide
│   ├── api-routes.md
│   ├── services-core.md
│   └── [more backend guides]
├── development-guide/
│   ├── TDD-MODULE-WORKFLOW.md
│   ├── TDD-XOS-FRONTEND-WORKFLOW.md
│   └── [workflow guides]
└── [testing, troubleshooting, automation]
```

---

## 🔄 **Keeping Documentation Updated**

### **Check for Updates**
```bash
cd claude_docs
git fetch
git log HEAD..origin/main --oneline  # See what's new
cd ..
```

### **Pull Latest Version**
```bash
git submodule update --remote claude_docs
git add claude_docs
git commit -m "Update XOS documentation to latest"
git push
```

### **See Current Version**
```bash
cd claude_docs
git log -1 --oneline
git describe --tags 2>/dev/null || git rev-parse --short HEAD
```

---

## 📚 **Common Use Cases**

### **Starting a New Component**
```
# Claude prompt:
Create a UserProfile component using @claude_docs/frontend/ui-templates/XOSComponentTemplate
Follow the MVVM pattern from @claude_docs/CRITICAL_PATTERNS.md
```

### **Fixing Input Issues**
```
# Claude prompt:
My XOSTextbox inputs aren't accepting keyboard input. 
Fix using @claude_docs/frontend/xos-input-handling-fix.md
```

### **Building Backend APIs**
```
# Claude prompt:
Create a UserService with CRUD operations following @claude_docs/backend/backend-blueprint.md
Use PostgreSQL patterns from @claude_docs/backend/services-core.md
```

### **Troubleshooting**
```
# Claude prompt:
I'm getting "Cannot set property Data" error. 
Fix using patterns from @claude_docs/troubleshooting/frontend-issues.md
```

---

## 🛠️ **Contributing to Documentation**

### **📚 claude_docs Protection**
The `claude_docs/` directory is **protected** and requires maintainer approval for all changes.

### **Found an Issue?**
1. Create an issue in this repository with label `[DOCS]`
2. Describe the problem or improvement needed
3. Include relevant context (which file, what's wrong)
4. A maintainer will review and implement if appropriate

### **Want to Contribute?**
**For claude_docs changes:**
1. **Create an Issue** - Describe your suggested documentation improvements
2. **Fork & PR** - For non-claude_docs code contributions only
3. **Wait for Review** - Maintainers will handle claude_docs modifications

**For other contributions:**
1. **Fork** this repository
2. **Create branch** for your improvements  
3. **Make changes** to files outside claude_docs/
4. **Submit Pull Request** with description of changes

### **🔒 Access Control Summary**
- **claude_docs/**: Maintainer-only editing rights
- **CODEOWNERS**: Enforces maintainer review for claude_docs
- **Pre-commit hooks**: Prevents unauthorized local edits
- **GitHub Actions**: Blocks non-maintainer PRs affecting claude_docs
- **Team members**: Can suggest changes via issues or fork+PR

### **For Maintainers**
```bash
# Setup git hooks (run once per repository)
./.githooks/setup-hooks.sh

# Update maintainer email in pre-commit hook
# Edit .githooks/pre-commit and update MAINTAINERS array

# Regular maintenance
git add .
git commit -m "Improve: Add new pattern for async operations"  
git push
```

📋 **See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines**

---

## ❓ **Frequently Asked Questions**

### **Q: Do I need to update docs immediately when available?**
A: No, update when convenient for your project. You control the timing.

### **Q: Can I edit claude_docs files in my project?**
A: No, the submodule is read-only. Submit changes to the main xos-docs repository.

### **Q: What if my team clones without submodules?**
A: Run `git submodule update --init --recursive` in the project.

### **Q: How do I know what documentation version I'm using?**
A: `cd claude_docs && git log -1 --oneline`

### **Q: Can I stay on an older documentation version?**
A: Yes, just don't run the update commands. Your project will keep the current version.

### **Q: What's the difference between the web docs and claude_docs folder?**
A: Same content, different formats. Web docs for browsing, claude_docs for Claude Code integration.

### **Q: How often should we update documentation?**
A: Check monthly, update when you have capacity. Critical fixes should be pulled quickly.

---

## 🏷️ **Version Management**

Documentation follows semantic versioning:
- **Major (2.0)** - Breaking changes, new framework versions
- **Minor (1.1)** - New features, additional patterns
- **Patch (1.0.1)** - Bug fixes, clarifications

Each release includes:
- **CHANGELOG.md** with what's new
- **Migration notes** if needed
- **Netlify deployment** with latest content

---

## 📞 **Support**

- **Documentation Issues:** Create issue in this repo
- **Framework Questions:** Use project-specific channels
- **Claude Code Help:** Reference the troubleshooting guides
- **Web Site:** Always available at https://xos-docs.netlify.app

---

## 🔧 **Automation Scripts**

### **Automated Setup with Master Script**

The documentation includes a comprehensive setup script that can automatically configure the submodule for you:

**Windows PowerShell:**
```powershell
# If you have the documentation locally
.\claude_docs\master-setup.ps1

# Select option [8] Setup Documentation Submodule
# Or use quick setup with option [1] for everything
```

**From Downloaded Repository:**
```powershell
# Download the documentation repository first
git clone https://github.com/your-org/xos-docs.git temp-docs
.\temp-docs\claude_docs\master-setup.ps1 -ProjectPath "C:\path\to\your\project"
```

The master setup script provides:
- ✅ Automatic Git submodule configuration
- ✅ Update checking and management  
- ✅ Error handling and validation
- ✅ Interactive menu for all setup options
- ✅ Status checking for existing setups

---

*Last Updated: August 21, 2025*  
*Repository: https://github.com/your-org/xos-docs*  
*Documentation Version: 1.0.0*