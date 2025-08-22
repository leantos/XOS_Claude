# TDD XOS Frontend Module Workflow

## 🚨 CRITICAL: XOS Framework Specific TDD Workflow

This workflow is specifically designed for XOS framework frontend components with MVVM pattern, VMBase inheritance, and XOS component utilities.

## Pre-Flight Checklist

Before starting ANY XOS frontend module:

1. ✅ Read `@claude_docs/frontend/xos-input-handling-fix.md` 
2. ✅ Read `@claude_docs/CRITICAL_PATTERNS.md` sections on:
   - XOS Component Implementation Checklist
   - Frontend State Updates
   - Event Handler Pattern
3. ✅ Understand VMBase Data property is GETTER-ONLY
4. ✅ Know the three-step event handler pattern

## 9-Step XOS Frontend TDD Cycle

### Step 1: ANALYZE - Requirements & XOS Patterns
**Objective:** Understand requirements and XOS-specific patterns
**Actions:**
- Review wireframe/requirements document
- Identify all input fields and their types
- Map UI elements to XOS components (XOSTextbox, XOSCombobox, etc.)
- Review similar XOS components in the codebase
- Check `@claude_docs/frontend/xos-common-issues.md`

**Deliverable:** Clear understanding of XOS component requirements

### Step 2: SCAFFOLD - Create XOS Component Structure
**Objective:** Create proper XOS MVVM structure
**Actions:**

Create folder structure:
```
src/components/[ModuleName]/
├── index.jsx           # Component view
├── [ModuleName]VM.jsx  # ViewModel
├── __tests__/
│   ├── [ModuleName].test.jsx
│   ├── [ModuleName]VM.test.jsx
│   └── [ModuleName].integration.test.jsx
```

Create ViewModel with CORRECT pattern:
```javascript
// [ModuleName]VM.jsx
import { VMBase } from '../../xos-components/VMBase';

export default class [ModuleName]VM extends VMBase {
    constructor(props) {
        super(props);
        this.init();
    }
    
    init() {
        // ✅ CORRECT: Get reference, then set properties
        const model = this.Data;
        model.userName = '';
        model.password = '';
        model.isLoading = false;
        // ❌ NEVER: this.Data = { ... }
    }
}
```

Create Component with CORRECT pattern:
```javascript
// index.jsx
import React from 'react';
import * as cntrl from '../../xos-components';
import [ModuleName]VM from './[ModuleName]VM';

export default class [ModuleName] extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new [ModuleName]VM(props));
    }
    
    // ✅ CORRECT: Three-step event handler
    handleInputChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;  // Step 1: Get reference
            model[e.name] = e.value;     // Step 2: Update (e.value NOT e.target.value!)
            this.VM.updateUI();           // Step 3: Trigger re-render
        }
    };
}
```

**🚨 IMPORTANT: XOSContainer Usage**
- **DON'T** wrap your component in XOSContainer
- **DO** extend XOSComponent directly
- **XOSContainer** is for app-level dynamic loading, not individual components
- **Your component** should render with simple Bootstrap/div layout

**Deliverable:** Properly structured XOS component files

### Step 3: TEST PLAN - XOS-Specific Test Scenarios
**Objective:** Design tests for XOS patterns
**Required Test Categories:**

1. **ViewModel Initialization Tests**
   - Data property initialization
   - Default values set correctly
   - No "Cannot set property Data" errors

2. **Input Handling Tests**
   - XOSTextbox accepts keyboard input
   - Value updates trigger updateUI()
   - Controlled component behavior

3. **Event Handler Tests**
   - handleInputChange receives {name, value}
   - State updates correctly
   - UI re-renders after changes

4. **Integration Tests**
   - Form submission works
   - Validation displays errors
   - API calls through Utils.ajax

**Deliverable:** Comprehensive XOS component test plan

### Step 4: WRITE TESTS - XOS Testing Patterns
**Objective:** Write tests following XOS patterns
**Test Templates:**

```javascript
// ViewModel Tests
describe('[ModuleName]VM', () => {
    it('initializes Data properties without error', () => {
        const vm = new [ModuleName]VM();
        
        // Should not throw "Cannot set property Data"
        expect(vm.Data.userName).toBe('');
        expect(vm.Data.password).toBe('');
    });
    
    it('updates Data properties correctly', () => {
        const vm = new [ModuleName]VM();
        const model = vm.Data;
        
        model.userName = 'test';
        expect(vm.Data.userName).toBe('test');
    });
});

// Component Tests
describe('[ModuleName]', () => {
    it('renders XOSTextbox with correct props', () => {
        const { container } = render(<[ModuleName] />);
        
        const textbox = container.querySelector('[name="userName"]');
        expect(textbox).toBeInTheDocument();
    });
    
    it('handles XOSTextbox onChange correctly', () => {
        const component = new [ModuleName]();
        const mockEvent = { name: 'userName', value: 'test' };
        
        component.handleInputChange(mockEvent);
        
        expect(component.VM.Data.userName).toBe('test');
    });
    
    it('accepts keyboard input in text fields', async () => {
        const { container } = render(<[ModuleName] />);
        const input = container.querySelector('[name="userName"]');
        
        // Simulate XOSTextbox onChange
        fireEvent.change(input, { 
            target: { name: 'userName', value: 'typing test' }
        });
        
        await waitFor(() => {
            expect(input.value).toBe('typing test');
        });
    });
});
```

**Deliverable:** Complete XOS component test suite

### Step 5: IMPLEMENT - Follow XOS Patterns
**Objective:** Implement component following XOS patterns exactly
**Critical Implementation Points:**

1. **ViewModel State Management**
```javascript
// Always use init() method
init() {
    const model = this.Data;
    model.propertyName = defaultValue;
}

// In methods, always get reference first
validateForm() {
    const model = this.Data;
    if (!model.userName) {
        return 'Username required';
    }
}
```

2. **Component Event Handlers**
```javascript
// EVERY input handler must follow this pattern
handleInputChange = (e) => {
    if (this.VM) {
        const model = this.VM.Data;
        model[e.name] = e.value;
        this.VM.updateUI();  // NEVER FORGET THIS!
    }
};
```

3. **XOS Component Usage**
```javascript
<cntrl.XOSTextbox
    name="fieldName"                     // REQUIRED for e.name
    value={this.VM.Data.fieldName || ''} // Controlled
    onChange={this.handleInputChange}    // Unified handler
    inputType={cntrl.XOSTextboxTypes.textbox}
    mandatory={true}
/>
```

**Target:** 80% test pass rate minimum

### Step 6: VERIFY - Test XOS Functionality
**Objective:** Ensure XOS patterns work correctly
**Verification Steps:**

1. Run tests: `npm test`
2. Check for "Cannot set property Data" errors
3. Manually test in browser:
   - Can you type in all text fields?
   - Do checkboxes toggle?
   - Do dropdowns open and select?
4. Check console for errors
5. Verify updateUI() is being called

**Success Criteria:** 
- No Data property errors
- All inputs accept keyboard input
- 80%+ test pass rate

### Step 7: REFINE - Fix XOS-Specific Issues
**Objective:** Resolve any XOS framework issues
**Common Issues & Fixes:**

| Issue | Fix |
|-------|-----|
| "Cannot set property Data" | Use `const model = this.Data; model.prop = value` |
| Input won't accept typing | Add `this.VM.updateUI()` to handler |
| Value is undefined | Use `e.value` not `e.target.value` |
| Component not re-rendering | Ensure `updateUI()` is called |
| XOSTextbox not working | Check `name` prop is present |

**Target:** 100% test pass rate or documented blockers

### Step 8: DOCUMENT - XOS Component Documentation
**Objective:** Create XOS-specific documentation
**Required Documentation:**

1. **Component README.md**
```markdown
# [ModuleName] Component

## XOS Framework Component
This component follows XOS MVVM pattern with VMBase.

### Key Patterns Used
- VMBase Data property (getter-only)
- Three-step event handler pattern
- XOSTextbox with name/value props
- Manual updateUI() calls

### Common Issues
- If inputs don't accept typing, check updateUI() calls
- If "Cannot set property Data" error, check init() method
```

2. **Update Troubleshooting Guides**
- Add any new XOS patterns discovered
- Document any workarounds needed

**Deliverable:** Complete XOS component documentation

### Step 9: VERSION CONTROL - Git Integration & PR Management
**Objective:** Integrate XOS component into version control with proper Git workflow
**Actions:**

1. **Initialize Git Workflow**
```bash
# Create feature branch with XOS naming convention
git checkout -b feature/xos-[module]-frontend

# Set up commit template for XOS patterns
git config commit.template .gitmessage-xos
```

2. **Development Commits During TDD Cycle**
```bash
# After Step 2 (SCAFFOLD)
git add .
git commit -m "feat(xos-[module]): create MVVM structure with VMBase

- Add ViewModel extending VMBase
- Create component extending XOSComponent  
- Set up test structure
- Initialize Data properties correctly"

# After Step 5 (IMPLEMENT)
git add .
git commit -m "feat(xos-[module]): implement three-step event handlers

- Add handleInputChange with updateUI() calls
- Implement XOSTextbox with name props
- Enable keyboard input acceptance
- Add form validation logic"

# After Step 6 (VERIFY)
git add .
git commit -m "test(xos-[module]): add comprehensive test suite

Coverage: [X]% - Target: 80%
- ViewModel initialization tests pass
- Input handling tests verify keyboard input
- No 'Cannot set property Data' errors
- Event handler tests confirm updateUI() calls"

# After Step 7 (REFINE)
git add .
git commit -m "fix(xos-[module]): resolve XOS-specific issues

- Fix Data property reference pattern
- Ensure all inputs accept typing
- Resolve updateUI() call issues
- Component renders and re-renders correctly"
```

3. **Create Pull Request**
```bash
# Push feature branch
git push -u origin feature/xos-[module]-frontend

# Create PR with XOS-specific template
gh pr create --title "feat(xos-[module]): implement [ComponentName] with MVVM pattern" \
  --body "$(cat <<'EOF'
## XOS Frontend Component Implementation

### Component Details
- **Name**: [ComponentName]
- **Pattern**: XOS MVVM with VMBase
- **Test Coverage**: [X]% (Target: 80%+)

### XOS Compliance Checklist
- [x] ViewModel extends VMBase correctly
- [x] Uses init() method with Data reference pattern
- [x] Implements three-step event handlers
- [x] All XOSTextbox inputs have 'name' props
- [x] updateUI() called after state changes
- [x] No 'Cannot set property Data' errors
- [x] Component extends XOSComponent (not XOSContainer)
- [x] All inputs accept keyboard typing

### Testing Results
- Unit Tests: [X/Y] passing
- Integration Tests: [X/Y] passing
- Manual Testing: ✅ Keyboard input verified
- Console: ✅ No Data property errors

### Code Review Focus Areas
1. **Data Property Usage**: Verify no direct assignment to this.Data
2. **Event Handlers**: Confirm three-step pattern implementation  
3. **Input Acceptance**: Test all text fields accept keyboard input
4. **State Management**: Check updateUI() calls trigger re-renders
5. **XOS Components**: Verify proper name/value prop usage

Closes #[issue-number]
EOF
)"
```

4. **Code Review Process**
```bash
# Address review feedback
git add .
git commit -m "fix(xos-[module]): address PR review feedback

- [Specific changes made]
- Verify XOS patterns still followed
- Maintain test coverage"

# Update PR 
git push origin feature/xos-[module]-frontend
```

5. **Merge and Cleanup**
```bash
# After PR approval and merge
git checkout main
git pull origin main
git branch -d feature/xos-[module]-frontend
git push origin --delete feature/xos-[module]-frontend

# Tag if component is complete
git tag -a v[module]-frontend-1.0.0 -m "XOS [ComponentName] component v1.0.0"
git push origin v[module]-frontend-1.0.0
```

**Git Commit Message Templates for XOS:**
```bash
# Feature implementation
feat(xos-[module]): implement [component] with VMBase pattern

# Bug fixes  
fix(xos-[module]): resolve keyboard input handling in XOSTextbox

# Testing
test(xos-[module]): add [test-type] tests with 80% coverage

# Refactoring
refactor(xos-[module]): improve Data property usage pattern

# Documentation
docs(xos-[module]): add component usage and troubleshooting guide
```

**XOS-Specific PR Review Checklist:**
- [ ] No console errors related to Data property
- [ ] All inputs respond to keyboard typing
- [ ] ViewModel initialization doesn't throw errors
- [ ] Three-step event handler pattern implemented
- [ ] updateUI() called appropriately
- [ ] Test coverage meets 80% minimum
- [ ] Component follows XOS naming conventions
- [ ] Documentation includes XOS-specific patterns

**Success Criteria:**
- PR passes all XOS compliance checks
- CI/CD pipeline runs successfully
- Manual testing confirms keyboard input works
- No Data property errors in browser console
- Code review approved by XOS framework expert

**Deliverable:** XOS component successfully integrated into main codebase via PR

## Quick Reference Card

### ✅ ALWAYS DO
```javascript
// Initialize ViewModel
const model = this.Data;
model.prop = value;

// Handle events
const model = this.VM.Data;
model[e.name] = e.value;
this.VM.updateUI();

// Use XOS components
<cntrl.XOSTextbox name="field" value={value} onChange={handler} />
```

### ❌ NEVER DO
```javascript
// Set Data directly
this.Data = { prop: value };

// Forget updateUI()
model.prop = value;  // No re-render!

// Use DOM event
onChange={(e) => model.value = e.target.value}

// Forget name prop
<cntrl.XOSTextbox value={value} onChange={handler} />
```

## Testing Command

```bash
# Run XOS component tests
npm test -- --watchAll=false --coverage

# Run specific component tests
npm test [ModuleName]

# Debug test failures
npm test -- --verbose
```

## Success Metrics

- [ ] No "Cannot set property Data" errors
- [ ] All inputs accept keyboard input
- [ ] 80%+ test coverage
- [ ] Tests pass on first run
- [ ] Follows XOS MVVM pattern
- [ ] updateUI() called appropriately
- [ ] Documentation complete
- [ ] Git workflow completed with PR merged
- [ ] XOS compliance checklist verified in PR

## When to Use This Workflow

Use this workflow for:
- Any XOS framework frontend component
- Components extending XOSComponent
- ViewModels extending VMBase
- Components using XOSTextbox, XOSCombobox, etc.

## Related Documentation

- `@claude_docs/frontend/xos-input-handling-fix.md` - Critical input handling patterns
- `@claude_docs/CRITICAL_PATTERNS.md` - XOS implementation checklist
- `@claude_docs/frontend/xos-common-issues.md` - Troubleshooting guide
- `@claude_docs/testing/xos-framework-testing.md` - Testing patterns

---
*This workflow ensures XOS components work correctly with keyboard input and proper state management.*