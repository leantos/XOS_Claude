# 📚 Development Guide Index

Comprehensive development guidelines for XOS Framework applications with Claude Code AI assistance.

## 🎯 Start Here - Module Development

### Main Guides for XOS Framework
- **[MODULE-DEVELOPMENT-GUIDE.md](../MODULE-DEVELOPMENT-GUIDE.md)** ⭐ - Complete guide for creating XOS modules
- **[CLAUDE-PROMPT-QUICK-REFERENCE.md](../CLAUDE-PROMPT-QUICK-REFERENCE.md)** 🚀 - Quick copy-paste prompts for Claude
- **[COMMON-MODULE-EXAMPLES.md](../COMMON-MODULE-EXAMPLES.md)** 📦 - Ready-to-use module templates

### XOS-Specific Workflows
- **[TDD-XOS-FRONTEND-WORKFLOW.md](TDD-XOS-FRONTEND-WORKFLOW.md)** 🎨 - Frontend TDD for XOS components
- **[XOS-COMPONENT-CHECKLIST.md](XOS-COMPONENT-CHECKLIST.md)** ✅ - Validation checklist for components
- **[TDD-MODULE-WORKFLOW.md](TDD-MODULE-WORKFLOW.md)** 🧪 - General TDD workflow

## 📚 Guide Contents

### Core Documents

1. **[Claude Code Best Practices](./claude-code-best-practices.md)**
   - General coding principles
   - Backend development patterns (.NET/C#)
   - Frontend development patterns (React/TypeScript)
   - Project structure guidelines
   - Documentation standards
   - AI optimization techniques

2. **[Quick Reference](./quick-reference.md)**
   - Essential commands
   - Common patterns
   - File templates
   - Debugging tips
   - Performance optimization
   - Security checklist

3. **[Troubleshooting Guide](./troubleshooting.md)**
   - Common issues and solutions
   - Backend troubleshooting
   - Frontend troubleshooting
   - Build and deployment issues
   - Performance problems
   - Testing issues

4. **[Claude Code Instructions](./claude-code-instructions.md)**
   - How to write project-specific instructions
   - Template for AI instructions
   - Best practices for AI collaboration
   - Example prompts and patterns

### Automation & Subagents

5. **[Subagent Catalog](../automation/subagent-catalog.md)**
   - Comprehensive catalog of specialized subagents
   - Optimized prompts for each subagent type
   - Frontend, backend, database, and DevOps specialists
   - Security, performance, and testing experts

6. **[Subagent Patterns](../automation/subagent-patterns.md)**
   - Common patterns for using subagents effectively
   - Feature development workflows
   - Performance optimization strategies
   - Security hardening approaches

7. **[Subagent Composition](../automation/subagent-composition.md)**
   - Strategies for chaining multiple subagents
   - Sequential, parallel, and hierarchical patterns
   - Real-world composition examples
   - Orchestration best practices

## 🎯 Purpose

This guide serves to:
- Establish consistent coding standards across teams
- Optimize code for AI-assisted development
- Reduce onboarding time for new developers
- Improve code maintainability and readability
- Provide quick solutions to common problems

## 🚀 Quick Start for XOS Framework

### For New XOS Developers
1. **MUST READ**: [CRITICAL_PATTERNS.md](../CRITICAL_PATTERNS.md) - XOS is NOT standard React/.NET
2. **Fix Issues**: [xos-input-handling-fix.md](../frontend/xos-input-handling-fix.md) - Avoid common input problems
3. **Follow Guide**: [MODULE-DEVELOPMENT-GUIDE.md](../MODULE-DEVELOPMENT-GUIDE.md) - Step-by-step module creation
4. **Use Examples**: [COMMON-MODULE-EXAMPLES.md](../COMMON-MODULE-EXAMPLES.md) - Copy ready prompts

### For Creating XOS Modules
1. **Frontend**: Use [TDD-XOS-FRONTEND-WORKFLOW.md](TDD-XOS-FRONTEND-WORKFLOW.md)
2. **Backend**: Follow patterns in [backend-blueprint.md](../backend/backend-blueprint.md)
3. **Validate**: Check with [XOS-COMPONENT-CHECKLIST.md](XOS-COMPONENT-CHECKLIST.md)
4. **Template**: Start from `../frontend/ui-templates/XOSComponentTemplate/`

### For Working with Claude
1. **Quick Prompts**: [CLAUDE-PROMPT-QUICK-REFERENCE.md](../CLAUDE-PROMPT-QUICK-REFERENCE.md)
2. **Module Examples**: [COMMON-MODULE-EXAMPLES.md](../COMMON-MODULE-EXAMPLES.md)
3. **Always Say**: "I'm working with XOS framework, check @claude_docs"

## 💡 Key Principles

### 1. Clarity Over Cleverness
Write code that is immediately understandable, even if it means being more verbose.

### 2. Consistency Is Key
Follow established patterns throughout the codebase. Consistency reduces cognitive load.

### 3. Documentation As Code
Treat documentation with the same importance as code. Keep it updated and version controlled.

### 4. AI-Friendly Development
Structure code and comments to be easily understood by both humans and AI assistants.

## 📝 Contributing to This Guide

### Adding New Content
- Ensure new content doesn't duplicate existing information
- Follow the markdown formatting used in existing documents
- Include practical examples wherever possible
- Test all code examples before adding them

### Updating Existing Content
- Mark deprecated practices clearly
- Provide migration paths for breaking changes
- Update the version history when making significant changes

## 🔧 Recommended Tools

### Development Environment
- **IDE**: Visual Studio Code with recommended extensions
- **Backend**: Visual Studio 2022 or JetBrains Rider
- **Database**: DBeaver or pgAdmin for PostgreSQL
- **API Testing**: Postman or Insomnia
- **Git**: GitKraken or SourceTree for visual git management

### VS Code Extensions
```json
{
  "recommendations": [
    "ms-dotnettools.csharp",
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "streetsidesoftware.code-spell-checker",
    "wayou.vscode-todo-highlight",
    "yzhang.markdown-all-in-one"
  ]
}
```

### Chrome Extensions for Frontend Development
- React Developer Tools
- Redux DevTools
- Lighthouse
- JSON Viewer

## 📊 Code Quality Metrics

### Target Metrics
- **Code Coverage**: Minimum 80% for business logic
- **Cyclomatic Complexity**: Keep below 10 per method
- **Technical Debt Ratio**: Maintain below 5%
- **Documentation Coverage**: 100% for public APIs

### Quality Gates
- All tests must pass
- No critical security vulnerabilities
- Code review approval required
- Documentation updated for API changes

## 🔍 Where to Find Help

1. **This Guide**: Start here for development questions
2. **Project README**: For project-specific setup and configuration
3. **API Documentation**: For endpoint specifications
4. **Team Wiki**: For business logic and domain knowledge
5. **Stack Overflow**: For general programming questions
6. **Official Docs**: For framework and library specifics

## 📈 Continuous Improvement

This guide is a living document. We encourage:
- Regular reviews and updates
- Feedback from all team members
- Incorporation of lessons learned
- Adoption of industry best practices

## 🎓 Learning Resources

### Backend (.NET/C#)
- [Microsoft Learn](https://learn.microsoft.com/dotnet/)
- [.NET Documentation](https://docs.microsoft.com/dotnet/)
- [C# Programming Guide](https://docs.microsoft.com/dotnet/csharp/)

### Frontend (React/TypeScript)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

### General Development
- [Clean Code principles](https://www.cleancode.com/)
- [Design Patterns](https://refactoring.guru/design-patterns)
- [OWASP Security Guidelines](https://owasp.org/)

## 📅 Version History

- **v1.0.0** (2024-01-15): Initial development guide creation
  - Added best practices document
  - Created quick reference guide
  - Included troubleshooting guide
  - Added Claude Code instructions template

---

*"Code is read many more times than it is written. Optimize for readability."*

For questions or suggestions, please create an issue or contact the development team.