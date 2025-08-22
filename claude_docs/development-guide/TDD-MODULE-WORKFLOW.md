# TDD Module Development Workflow

## Overview
This document defines the standardized Test-Driven Development (TDD) workflow for all module development in the CVS_Claude project using Claude Code as the developer.

## Workflow Philosophy
- **Write tests first** - Define expected behavior before implementation
- **2-round maximum** - Either achieve 100% test pass rate or clearly document what needs human help
- **80% minimum** - First round must achieve at least 80% test pass rate
- **Complete documentation** - Every module ships with comprehensive docs

## 8-Step TDD Cycle with Git Integration

### 🌿 Git Workflow Setup

Before starting any development, initialize the Git workflow:

```bash
# Create feature branch
git checkout -b feature/[module-name]-implementation

# Set up conventional commit template
git config commit.template .gitmessage-module
```

### Round 1: Core Implementation

#### Step 1: THINK - Requirements Analysis
**Objective:** Understand what needs to be built
**Actions:**
- Analyze requirements from `MODULE_[Name]_BACKEND_*.md` or similar specification files
- Review XOS framework patterns in `@claude_docs/backend/` and `@claude_docs/frontend/`
- Check `@claude_docs/troubleshooting/` for similar modules' lessons learned
- Define core functionality and edge cases

**Deliverable:** Clear understanding of module requirements

#### Step 2: TEST PLAN - Comprehensive Test Scenarios
**Objective:** Design complete test coverage before writing any code
**Actions:**
- Create test scenarios for all requirements
- Define happy path tests
- Define edge case tests (null inputs, empty data, invalid formats)
- Define error condition tests (unauthorized access, network failures)
- Define integration tests (database, external APIs)
- Aim for 50+ test scenarios for a typical module

**Deliverable:** Complete test plan document

#### Step 3: SKELETON - Generate Basic Code Structure
**Objective:** Create minimal code structure to support tests
**Actions:**
- Create domain models with properties (no logic)
- Create service interfaces with method signatures
- Create controller classes with empty methods
- Set up dependency injection registrations
- Ensure code compiles but methods return default values

**Deliverable:** Compilable code skeleton

**Git Checkpoint:**
```bash
git add .
git commit -m "feat([module]): create code skeleton and basic structure

- Add domain models with properties
- Create service interfaces  
- Set up controller classes with empty methods
- Configure dependency injection
- Code compiles successfully"
```

#### Step 4: UNIT TESTS - Write Complete Test Suite
**Objective:** Write all tests from the test plan
**Actions:**
- Create test classes following naming conventions: `[ClassName]Tests`
- Use xUnit, Moq, FluentAssertions for .NET backend
- Use React Testing Library for frontend components
- Mock all external dependencies
- Follow AAA pattern (Arrange, Act, Assert)
- Use meaningful test method names: `Method_Scenario_ExpectedOutcome`

**Deliverable:** Complete test suite (all tests failing initially - Red phase)

**Git Checkpoint:**
```bash
git add .
git commit -m "test([module]): add comprehensive test suite

- Create unit tests for all components
- Add integration tests for database operations
- Mock external dependencies
- Follow AAA pattern (Arrange, Act, Assert)
- Target: 50+ test scenarios
- Status: All tests failing (Red phase - expected)"
```

#### Step 5: IMPLEMENT - Build Functionality
**Objective:** Make 80-100% of tests pass
**Actions:**
- Implement service methods with business logic
- Implement controller actions with proper error handling
- Follow XOS framework patterns from `@claude_docs`
- Use proper logging and validation
- Handle edge cases covered in tests
- **Target: 80% minimum test pass rate**

**Deliverable:** Working implementation with most tests passing

**Git Checkpoint:**
```bash
git add .
git commit -m "feat([module]): implement core functionality

Round 1 Implementation Complete:
- Service methods with business logic
- Controller actions with error handling  
- XOS framework patterns followed
- Proper logging and validation
- Edge cases handled
- Target: 80%+ test pass rate achieved"
```

#### Step 6: VERIFY - Test Execution and Analysis
**Objective:** Confirm test results and identify gaps
**Actions:**
- Run full test suite: `dotnet test --verbosity detailed`
- Generate coverage report if available
- Document which tests are passing/failing
- Analyze failure patterns
- **Success Criteria: 80% or higher pass rate**

**Deliverable:** Test execution report with pass/fail analysis

### Round 2: Completion

#### Step 7: REFINE - Fix Failures or Document Blockers
**Objective:** Reach 100% test pass rate or clearly document what needs human help
**Actions:**
- Fix failing tests by improving implementation
- If unable to fix certain tests, document specific blockers:
  - What is the technical challenge?
  - What specific knowledge/tool/access is needed?
  - Provide code context and error messages
- Update troubleshooting guides with any new patterns learned
- **Target: 100% test pass rate OR clear documentation of blockers**

**Deliverable:** Either 100% passing tests or documented blockers for human developer

**Git Checkpoint:**
```bash
git add .
git commit -m "fix([module]): complete round 2 refinements

Round 2 Results:
- Fixed failing tests from round 1
- Improved implementation based on test feedback
- Updated troubleshooting guides with patterns learned
- Final Status: [100% pass rate OR documented blockers]
- Test Coverage: [X]%"
```

### Final Phase: Documentation

#### Step 8: DOCUMENT - Generate Comprehensive Documentation
**Objective:** Create complete module documentation for future reference
**Actions:**
- Create `docs/modules/[ModuleName]/` folder
- Generate README.md with overview, setup, usage examples
- Generate API.md with all endpoints, request/response examples
- Generate TESTS.md with test coverage summary and important test scenarios
- Generate TROUBLESHOOTING.md with any issues encountered and solutions
- Update relevant troubleshooting guides in `@claude_docs/troubleshooting/`

**Deliverable:** Complete documentation package

**Final Git Workflow:**
```bash
# Commit documentation
git add .
git commit -m "docs([module]): add comprehensive module documentation

- Add README.md with overview and usage examples
- Add API.md with endpoints and request/response examples
- Add TESTS.md with coverage summary and scenarios
- Add TROUBLESHOOTING.md with issues and solutions
- Update troubleshooting guides in @claude_docs/

Module complete and ready for PR"

# Push feature branch and create PR
git push -u origin feature/[module-name]-implementation

# Create pull request with module checklist
gh pr create --title "feat([module]): implement [ModuleName] module with TDD" \
  --body "$(cat <<'EOF'
## Module Implementation Summary

### TDD Workflow Completed
- [x] Requirements analysis and test planning
- [x] Code skeleton with compilable structure
- [x] Comprehensive test suite (50+ scenarios)
- [x] Round 1: Core implementation (80%+ pass rate)
- [x] Round 2: Refinements (100% pass rate OR documented blockers)
- [x] Complete documentation package

### Test Results
- **Test Coverage**: [X]%
- **Pass Rate**: [Y]% ([Z]/[Total] tests passing)
- **Blockers**: [None/List specific blockers]

### Module Components
- Domain models with proper validation
- Service interfaces and implementations  
- Controller with error handling
- Comprehensive unit and integration tests
- Complete documentation

### Framework Compliance
- [x] Follows XOS framework patterns
- [x] Uses dependency injection
- [x] Implements proper logging and validation
- [x] Includes error handling
- [x] Follows SOLID principles

### Documentation Included
- [x] docs/modules/[ModuleName]/README.md
- [x] docs/modules/[ModuleName]/API.md
- [x] docs/modules/[ModuleName]/TESTS.md
- [x] docs/modules/[ModuleName]/TROUBLESHOOTING.md

### Review Focus Areas
1. **Test Coverage**: Verify adequate coverage of business logic
2. **Error Handling**: Check proper exception handling and logging
3. **Framework Patterns**: Confirm XOS patterns are followed
4. **Integration**: Verify database and external API integration
5. **Documentation**: Ensure examples and troubleshooting are clear

Closes #[issue-number]
EOF
)"
```

## Command Templates

### For Backend Modules
```
"Follow @claude_docs/development-guide/TDD-MODULE-WORKFLOW.md to implement [ModuleName] backend module. Use the MODULE_[ModuleName]_BACKEND_*.md specification. Target: 80% minimum test pass rate in round 1, 100% in round 2 or document blockers for human help."
```

### For Frontend Modules (Standard React)
```
"Follow @claude_docs/development-guide/TDD-MODULE-WORKFLOW.md to implement [ModuleName] frontend module. Use React patterns from @claude_docs/frontend/. Target: 80% minimum test pass rate in round 1, 100% in round 2 or document blockers for human help."
```

### For XOS Framework Frontend Modules
```
"Follow @claude_docs/development-guide/TDD-XOS-FRONTEND-WORKFLOW.md to implement [ModuleName] XOS frontend module. This uses MVVM pattern with VMBase and XOS components. CRITICAL: Read @claude_docs/frontend/xos-input-handling-fix.md first. Target: 80% minimum test pass rate and all inputs must accept keyboard input."
```

### For Full-Stack Modules
```
"Follow @claude_docs/development-guide/TDD-MODULE-WORKFLOW.md to implement [ModuleName] full-stack module. Follow XOS patterns and create both backend services and frontend components. Target: 80% minimum test pass rate in round 1, 100% in round 2 or document blockers for human help."
```

## Success Criteria Checklist

### Round 1 Complete
- [ ] Requirements analyzed and understood
- [ ] Test plan created with 30+ scenarios
- [ ] Code skeleton created and compiles
- [ ] Complete test suite written (all tests initially failing)
- [ ] Implementation created
- [ ] **80% or higher test pass rate achieved**

### Round 2 Complete
- [ ] **100% test pass rate achieved** OR
- [ ] Specific blockers documented with technical details
- [ ] Troubleshooting guides updated with new patterns

### Final Documentation Complete
- [ ] docs/modules/[ModuleName]/README.md created
- [ ] docs/modules/[ModuleName]/API.md created
- [ ] docs/modules/[ModuleName]/TESTS.md created
- [ ] docs/modules/[ModuleName]/TROUBLESHOOTING.md created
- [ ] Relevant @claude_docs/troubleshooting/ files updated

### Git Workflow Complete
- [ ] Feature branch created with proper naming
- [ ] Code skeleton committed after compilation
- [ ] Test suite committed after completion
- [ ] Core implementation committed after round 1
- [ ] Refinements committed after round 2
- [ ] Documentation committed with final changes
- [ ] Pull request created with comprehensive checklist
- [ ] PR ready for code review

## Output File Structure

```
# Code Files
[Project]/
├── Domain/[ModuleName].cs
├── Interfaces/I[ModuleName]Service.cs
├── Services/[ModuleName]Service.cs
├── Controllers/[ModuleName]Controller.cs
└── Tests/
    ├── Unit/Services/[ModuleName]ServiceTests.cs
    ├── Unit/Controllers/[ModuleName]ControllerTests.cs
    └── Integration/[ModuleName]IntegrationTests.cs

# Documentation Files
docs/modules/[ModuleName]/
├── README.md
├── API.md
├── TESTS.md
└── TROUBLESHOOTING.md

# Updated Knowledge Base
claude_docs/troubleshooting/
├── backend-issues.md      # If backend issues encountered
├── frontend-issues.md     # If frontend issues encountered
├── api-issues.md         # If API issues encountered
├── database-issues.md    # If database issues encountered
└── testing-issues.md     # If testing issues encountered
```

## Quality Standards

### Code Quality
- Follow SOLID principles
- Use dependency injection
- Implement proper error handling and logging
- Follow XOS framework patterns
- Include input validation
- Use meaningful variable and method names

### Test Quality
- Use descriptive test method names
- Test both happy path and edge cases
- Mock external dependencies properly
- Include integration tests for database operations
- Maintain high test coverage on critical business logic

### Documentation Quality
- Include code examples in documentation
- Explain configuration requirements
- Document known limitations or issues
- Provide troubleshooting steps for common problems
- Include performance considerations

## Troubleshooting Integration

When issues are encountered during development:

1. **Log the Issue:** Document the specific problem in the appropriate troubleshooting file
2. **Record the Solution:** Include the exact steps taken to resolve the issue
3. **Extract the Pattern:** Identify the general pattern that can be applied to future similar issues
4. **Update Workflow:** If needed, update this workflow document with lessons learned

## Notes for Human Developers

When Claude Code reaches its limits and documents blockers:

1. **Review the Context:** All test failures and attempted solutions will be documented
2. **Check Troubleshooting Guides:** Similar issues may have been solved before
3. **Complete the Implementation:** Fix the remaining test failures
4. **Update the Troubleshooting Guide:** Add the solution pattern for future reference
5. **Verify 100% Pass Rate:** Ensure all tests pass before considering the module complete

This workflow ensures consistent, tested, documented modules while building organizational knowledge for future development cycles.