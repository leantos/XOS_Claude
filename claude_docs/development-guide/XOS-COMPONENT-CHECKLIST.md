# XOS Component Implementation Checklist

## 🎯 Use this checklist for EVERY XOS component to avoid common pitfalls

### 📁 File Structure
- [ ] Component folder created in `src/components/[ModuleName]/`
- [ ] `index.jsx` - Component view file
- [ ] `[ModuleName]VM.jsx` - ViewModel file
- [ ] `__tests__/` folder with test files
- [ ] Component exports as default

### 🏗️ ViewModel Setup (CRITICAL!)
- [ ] Extends `VMBase` correctly
- [ ] Constructor calls `super(props)`
- [ ] Has `init()` method for initialization
- [ ] ✅ Uses Data reference pattern:
  ```javascript
  init() {
      const model = this.Data;  // Get reference
      model.prop = value;       // Set on reference
  }
  ```
- [ ] ❌ NEVER sets `this.Data = {}`
- [ ] All methods use `const model = this.Data` pattern
- [ ] Exports as default class

### 🎨 Component Implementation
- [ ] Imports XOS components correctly:
  ```javascript
  import * as cntrl from '../../xos-components';
  ```
- [ ] Extends `cntrl.XOSComponent`
- [ ] Constructor passes VM to super:
  ```javascript
  super(props, new [ModuleName]VM(props));
  ```
- [ ] Implements proper event handlers

### 🎮 Event Handler Pattern (MEMORIZE!)
- [ ] Every input handler follows three-step pattern:
  ```javascript
  handleInputChange = (e) => {
      if (this.VM) {
          const model = this.VM.Data;  // Step 1: Get reference
          model[e.name] = e.value;     // Step 2: Update value
          this.VM.updateUI();           // Step 3: Trigger re-render
      }
  };
  ```
- [ ] Uses `e.value` NOT `e.target.value`
- [ ] Uses `e.name` for property name
- [ ] ALWAYS calls `this.VM.updateUI()`

### 📝 XOSTextbox Implementation
- [ ] Has `name` prop (REQUIRED):
  ```javascript
  <cntrl.XOSTextbox
      name="fieldName"  // CRITICAL!
      value={this.VM.Data.fieldName || ''}
      onChange={this.handleInputChange}
  />
  ```
- [ ] Value uses `|| ''` to prevent undefined
- [ ] onChange points to correct handler
- [ ] inputType set if needed (textbox/password)
- [ ] mandatory prop set if required field

### 🧪 Testing Verification
- [ ] ViewModel initializes without "Cannot set property Data" error
- [ ] All text inputs accept keyboard input
- [ ] Checkboxes can be toggled
- [ ] Dropdowns can be opened and selected
- [ ] Form validation shows errors correctly
- [ ] Submit button triggers appropriate action
- [ ] updateUI() is called after state changes
- [ ] Tests achieve 80%+ pass rate

### 🐛 Common Issues Check
- [ ] ✅ No "Cannot set property Data of #<VMBase>" errors
- [ ] ✅ Inputs accept keyboard typing
- [ ] ✅ UI updates when state changes
- [ ] ✅ No undefined values in inputs
- [ ] ✅ Console is error-free

### 📚 Documentation
- [ ] Component has README.md
- [ ] XOS patterns documented
- [ ] Known issues listed
- [ ] Test coverage reported

### 🚀 Pre-Launch Verification
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm start` - component renders
- [ ] Manual testing - all inputs work
- [ ] Code review - patterns followed

## 🔴 Red Flags - Stop if you see these!

1. **Error:** "Cannot set property Data of #<VMBase> which has only a getter"
   - **Fix:** Check ViewModel init() method, use Data reference pattern

2. **Issue:** Text inputs won't accept typing
   - **Fix:** Add `this.VM.updateUI()` to handler

3. **Issue:** Getting undefined from inputs
   - **Fix:** Use `e.value` not `e.target.value`

4. **Issue:** Component not re-rendering
   - **Fix:** Ensure `updateUI()` is called after state changes

5. **Issue:** XOSTextbox not working
   - **Fix:** Add `name` prop to XOSTextbox

## 🎯 Quick Validation Test

Run this test in browser console:
```javascript
// Type in any XOSTextbox
// If nothing appears, check:
// 1. name prop exists
// 2. onChange handler uses e.value
// 3. updateUI() is called
```

## 📋 Copy-Paste Templates

### ViewModel Template
```javascript
import { VMBase } from '../../xos-components/VMBase';

export default class ComponentVM extends VMBase {
    constructor(props) {
        super(props);
        this.init();
    }
    
    init() {
        const model = this.Data;
        model.fieldName = '';
        model.isLoading = false;
    }
}
```

### Component Template
```javascript
import React from 'react';
import * as cntrl from '../../xos-components';
import ComponentVM from './ComponentVM';

export default class Component extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new ComponentVM(props));
    }
    
    handleInputChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            model[e.name] = e.value;
            this.VM.updateUI();
        }
    };
    
    render() {
        const { fieldName } = this.VM.Data;
        
        return (
            <cntrl.XOSTextbox
                name="fieldName"
                value={fieldName || ''}
                onChange={this.handleInputChange}
            />
        );
    }
}
```

## ✅ Sign-Off

Before considering the component complete:
- [ ] All checklist items verified
- [ ] No red flags present
- [ ] Manual testing successful
- [ ] Tests pass at 80%+
- [ ] Documentation complete

---
*Use this checklist to ensure XOS components work correctly every time.*