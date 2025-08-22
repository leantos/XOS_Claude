# XOS Framework Common Issues & Solutions

## Quick Fixes Reference

### 🔴 CRITICAL: XOSTextbox inputs don't accept keyboard input
**Root Cause**: VMBase.Data is a getter-only property, cannot be set directly
**Solution**: Use the correct XOS pattern:
```javascript
// ❌ WRONG - Throws error: "Cannot set property Data which has only a getter"
this.Data = { userName: '' };

// ✅ CORRECT - In ViewModel constructor/init method
constructor(props) {
    super(props);
    this.init();
}

init() {
    const model = this.Data;  // Get reference to _____state
    model.userName = '';      // Set properties on that reference
    model.password = '';
}

// ✅ CORRECT - In Component event handler (THE THREE-STEP PATTERN)
handleInputChange = (e) => {
    if (this.VM) {
        const model = this.VM.Data;  // Step 1: Get reference
        model[e.name] = e.value;     // Step 2: Modify property (use e.value!)
        this.VM.updateUI();           // Step 3: Trigger re-render
    }
};

// ✅ CORRECT - XOSTextbox must have name prop
<cntrl.XOSTextbox
    name="userName"                    // REQUIRED for e.name
    value={this.VM.Data.userName || ''}
    onChange={this.handleInputChange}
/>
```
**Full Guide**: See [XOS Input Handling Fix Guide](./xos-input-handling-fix.md)

### 🔴 CRITICAL: App compiles but components are invisible
**Solution**: Copy theme.css to src/assets/css/
```bash
cp assets/css/theme.css [ProjectName].WebApi/UIPages/src/assets/css/theme.css
```

### 🔴 CRITICAL: Wrong button styling (using Bootstrap classes)
**Problem**: Buttons using `btn-primary`, `btn-success`, etc.
**Solution**: Use XOS button classes:
- `btn-primary` → `btn-search` or `btn-save`
- `btn-success` → `btn-add`
- `btn-warning` → `btn-edit`
- `btn-danger` → `btn-delete`
- `btn-info` → `btn-clear`
- `btn-secondary` → `btn-close-custom`

See [XOS Button Styling Guide](./xos-button-styling-guide.md) for complete reference.

### 🔴 Module not found: 'react-color'
```bash
npm install react-color
```

### 🔴 Module not found: 'fast-sort'
```bash
npm install fast-sort
```

### 🔴 Invalid regex in Utils.js line 447
```javascript
// Change this:
const phoneRegex = '^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})';
// To this:
const phoneRegex = '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})';
```

### 🔴 'XOSModal' is not exported
**XOSModal doesn't exist.** Many XOS components people expect don't actually exist:
- ❌ XOSModal - Use Bootstrap modal
- ❌ XOSCheckbox - Use Bootstrap form-check  
- ❌ XOSButton - Use XOSButtonWrapper with HTML button inside

Use Bootstrap modal instead:
```jsx
<div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title">{title}</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
                {/* Content */}
            </div>
        </div>
    </div>
</div>
```

## Complete Setup Checklist

### 1. Essential Files to Copy
```bash
# Copy theme.css (MANDATORY)
cp assets/css/theme.css [ProjectName].WebApi/UIPages/src/assets/css/theme.css

# Copy XOS components
cp -r xos-components/ [ProjectName].WebApi/UIPages/src/xos-components/
```

### 2. Install ALL Dependencies
```bash
npm install @microsoft/signalr axios bootstrap bootstrap-icons crypto-js fast-sort jquery moment react react-color react-dom react-router-dom react-scripts
```

### 3. Correct Import Order in App.js
```javascript
import React, { Component } from 'react';
import './App.css';

// CRITICAL: This exact order is required
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/css/theme.css';  // MUST come after Bootstrap
```

### 4. Fix Utils.js Regex (line 447)
```javascript
// Find and replace the phone regex string
'^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})'
```

## Component Issues

### XOSModal Doesn't Exist
- **Don't use**: `cntrl.XOSModal`
- **Use instead**: Bootstrap modals or `cntrl.XOSControl`

### Non-Existent XOS Components
These components **DON'T EXIST** - use Bootstrap replacements:

#### XOSCheckbox → Bootstrap form-check:
```jsx
<div className="form-check">
    <input className="form-check-input" type="checkbox" id="check1" />
    <label className="form-check-label" htmlFor="check1">Label</label>
</div>
```

## File Structure Requirements

### React src/ Restrictions
React cannot import from outside src/, so all files must be inside:
```
[ProjectName].WebApi/UIPages/src/
├── assets/
│   └── css/
│       └── theme.css  # MUST be here
├── components/
│   └── General/
│       └── [ComponentName]/
└── xos-components/     # All XOS framework files
```

## Port Issues

### Port 3000 Already in Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Or use different port
PORT=3001 npm start
```

## Missing Styles

### Components Look Wrong
1. Verify theme.css is copied to `src/assets/css/`
2. Check import order (Bootstrap → theme.css)
3. Clear browser cache
4. Restart development server

## Compilation Warnings

### ESLint Warnings (Non-blocking)
These can be ignored initially:
- `no-useless-escape` in regex patterns
- `no-extend-native` in xos.linq.js
- `eqeqeq` comparisons

## Quick Commands

### Fresh Setup
```bash
# One command to set up everything
cd [ProjectName].WebApi/UIPages && \
mkdir -p src/assets/css && \
cp ../../assets/css/theme.css src/assets/css/ && \
npm install && \
npm start
```

### Kill and Restart
```bash
# Windows
taskkill /F /IM node.exe
npm start
```

## When to Ask for Help

If you encounter:
1. Missing XOS components not listed here
2. Backend API connection issues
3. Authentication/authorization problems
4. Database connection errors

## 🚨 Critical Refactoring Mistakes

### Infinite API Loop
**Cause**: Using wrong lifecycle methods or incorrect data loading pattern
```javascript
// ❌ WRONG - Causes infinite loop (React lifecycle in XOS component)
componentDidMount() { 
    this.VM.loadData(); // React lifecycle doesn't exist in XOS
}

// ❌ WRONG - Calling updateUI() in input handlers can cause loops
handleInputChange = (e) => {
    const model = this.VM.Data;
    model[e.name] = e.value;
    this.VM.updateUI();  // This can cause render loops if not careful
    this.VM.loadData();  // DON'T call API on every input change!
}

// ✅ CORRECT - Use XOS lifecycle methods
onLoad = () => {
    this.VM.onLoad();  // Load data when component loads
}

// ✅ CORRECT - Input handlers should only update state
handleInputChange = (e) => {
    if (this.VM) {
        const model = this.VM.Data;
        model[e.name] = e.value;
        this.VM.updateUI();  // Just update UI, don't reload data
    }
}
```

### Constructor Parameter Mismatch
**Cause**: ViewModel expects different parameters than component provides
```javascript
// ❌ WRONG - Mismatch causes errors
// Component: new MyVM(props)
// ViewModel: constructor(onClose)

// ✅ CORRECT - Match parameters
// Component: new MyVM(props)
// ViewModel: constructor(props)
```

### Non-existent API Endpoints
**Cause**: Changing endpoints without verifying they exist
```javascript
// ❌ WRONG
Utils.ajax({ url: '/api/documents/search' }); // 404 error

// ✅ CORRECT
Utils.ajax({ url: 'documents' }); // Use existing endpoints
```

## 📋 Safe Refactoring Checklist

Before refactoring ANY component:

1. **Understand Current Implementation**
   - [ ] Read existing code completely
   - [ ] Note all API endpoints
   - [ ] Understand data flow
   - [ ] Check which XOS components are used

2. **Verify Framework Compatibility**
   - [ ] Check lifecycle methods (onLoad, onClosing)
   - [ ] Verify XOS components exist
   - [ ] Confirm Utils functions available
   - [ ] Match constructor parameters

3. **Test Incrementally**
   - [ ] Change one section at a time
   - [ ] Test after each change
   - [ ] Watch for infinite loops
   - [ ] Check console for errors

4. **Common Pitfalls to Avoid**
   - [ ] Don't use React lifecycle methods
   - [ ] Don't change API endpoints without testing
   - [ ] Don't assume template code works as-is
   - [ ] Don't skip testing "small" changes

## 🔍 Debugging Infinite Loops

1. **Check Network Tab**: Look for repeated API calls
2. **Review Lifecycle**: Ensure using XOS methods
3. **Check State Updates**: Avoid updateUI() in input handlers
4. **Verify API Response**: Ensure response structure matches expectations

## 📚 Key Lessons from Failed Refactoring

1. **Templates are guides, not drop-in replacements**
2. **Always preserve working API endpoints**
3. **Test every change before moving to next**
4. **XOS lifecycle ≠ React lifecycle**
5. **When in doubt, keep original working code**

---

Last Updated: 2025-08-13
*Added section on refactoring mistakes and infinite loop prevention*