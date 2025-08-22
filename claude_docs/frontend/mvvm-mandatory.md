# MVVM Pattern - MANDATORY Implementation Guide

## 🚨 THIS IS NOT OPTIONAL - EVERY COMPONENT MUST FOLLOW MVVM

### Why This Document Exists
Previous implementations used standard React patterns instead of the required XOS MVVM architecture. This document ensures MVVM pattern is ALWAYS followed.

## ❌ INCORRECT Implementation (DO NOT USE)

```javascript
// WRONG - Standard React Component
import React, { Component } from 'react';

class MyComponent extends Component {
    constructor(props) {
        super(props);
        this.state = { /* WRONG */ };
    }
    
    handleClick = () => {
        this.setState({ /* WRONG */ });
    }
    
    render() { /* ... */ }
}
```

## ✅ CORRECT Implementation (ALWAYS USE THIS)

### Step 1: Create ViewModel (ComponentNameVM.js)

```javascript
// MyComponentVM.js
import { VMBase, Utils, XOSMessageboxTypes } from '../../xos-components';

export default class MyComponentVM extends VMBase {
    constructor(props) {
        super(props);
        
        // ✅ CORRECT: Initialize state using Data reference
        // Get reference to _____state via Data getter, then set properties
        const model = this.Data;
        model.inputValue = '';
        model.isLoading = false;
        model.items = [];
        
        // ❌ NEVER DO THIS - Will throw error:
        // this.Data = { inputValue: '' };  // ERROR: Cannot set property Data
        
        // ❌ ALSO WRONG - Don't access _____state directly:
        // this._____state.inputValue = '';  // Bad practice - use Data getter instead
    }
    
    // Lifecycle - called when component mounts
    onLoad() {
        console.log('Component loaded');
        // Load initial data here
    }
    
    // Business logic methods
    handleInputChange(value) {
        const model = this.Data;
        model.inputValue = value;  // ✅ Use Data getter pattern consistently
        this.updateUI(); // Trigger re-render
    }
    
    async loadData() {
        this.Data.isLoading = true;
        this.updateUI();
        
        try {
            // API calls here
            const response = await fetch('/api/data');
            this.Data.items = await response.json();
        } catch (error) {
            this.showMessageBox({
                text: error.message,
                messageboxType: XOSMessageboxTypes.error
            });
        }
        
        this.Data.isLoading = false;
        this.updateUI();
    }
    
    // Lifecycle - called when component unmounts
    onClosing() {
        console.log('Component closing');
        // Cleanup here
    }
}
```

### Step 2: Create Component (ComponentName.jsx)

```javascript
// MyComponent.jsx
import React from 'react';
import * as cntrl from '../../xos-components';
import MyComponentVM from './MyComponentVM';

export default class MyComponent extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new MyComponentVM(props)); // BIND ViewModel
    }
    
    // Event handlers using XOS pattern
    handleInputChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;  // Get reference to _____state
            model[e.name] = e.value;     // Modify property
            this.VM.updateUI();           // Trigger re-render
        }
    };
    
    handleButtonClick = () => {
        this.VM.loadData();
    };
    
    render() {
        // ALWAYS access state from VM.Data
        let vm = this.VM;
        let { inputValue, isLoading, items } = vm.Data;
        
        return (
            <div>
                {/* Error messages shown via this.showMessageBox() in ViewModel */}
                
                <cntrl.XOSTextbox
                    value={inputValue || ''}
                    onChange={this.handleInputChange}
                    disabled={isLoading}
                />
                
                <button 
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={this.handleButtonClick}
                    disabled={isLoading}
                >
                    <i className="fa fa-search me-1"></i>Load Data
                </button>
                
                <cntrl.XOSGrid
                    dataSource={items}
                    isLoading={isLoading}
                />
            </div>
        );
    }
}
```

## 📋 MVVM Checklist (USE FOR EVERY COMPONENT)

### Before Creating Any Component:
- [ ] Is there a business requirement for this component?
- [ ] Will it have state or business logic? (If yes, MUST use MVVM)

### Creating the ViewModel:
- [ ] File named `ComponentNameVM.js`
- [ ] Extends `VMBase` from xos-components
- [ ] Constructor calls `super(props)`
- [ ] All state initialized using `const model = this.Data; model.prop = value` pattern
- [ ] Business logic methods defined
- [ ] Uses `this.updateUI()` after state changes
- [ ] Implements `onLoad()` if needed
- [ ] Implements `onClosing()` if cleanup needed

### Creating the Component:
- [ ] File named `ComponentName.jsx`
- [ ] Imports ViewModel
- [ ] Extends `cntrl.XOSComponent` (NOT React.Component)
- [ ] Constructor calls `super(props, new ComponentNameVM(props))`
- [ ] Event handlers delegate to `this.VM.methodName()`
- [ ] Render accesses state via `this.VM.Data`
- [ ] Uses XOS components (cntrl.XOSTextbox, etc.)

### Common Patterns:

#### Form Input Handling
```javascript
// ViewModel
handleFieldChange(fieldName, value) {
    this.Data[fieldName] = value;
    this.updateUI();
}

// Component
handleUsernameChange = ({ value }) => {
    this.VM.handleFieldChange('username', value);
};
```

#### API Calls
```javascript
// ViewModel
async saveData() {
    this.Data.isLoading = true;
    this.updateUI();
    
    try {
        const response = await Utils.fetchData('/api/save', {
            method: 'POST',
            body: JSON.stringify(this.Data.formData)
        });
        this.showMessageBox({
            text: 'Saved successfully',
            messageboxType: XOSMessageboxTypes.info
        });
    } catch (error) {
        this.showMessageBox({
            text: error.message,
            messageboxType: XOSMessageboxTypes.error
        });
    }
    
    this.Data.isLoading = false;
    this.updateUI();
}
```

#### Validation
```javascript
// ViewModel
validateForm() {
    const { username, password } = this.Data;
    
    if (!username) {
        this.showMessageBox({
            text: 'Username required',
            messageboxType: XOSMessageboxTypes.warning,
            onClose: () => this.usernameInput?.focus()
        });
        return false;
    }
    
    if (!password) {
        this.showMessageBox({
            text: 'Password required',
            messageboxType: XOSMessageboxTypes.warning,
            onClose: () => this.passwordInput?.focus()
        });
        return false;
    }
    
    return true;
}

handleSubmit() {
    if (!this.validateForm()) return;
    // Proceed with submission
}
```

## 🚫 Common Mistakes to Avoid

1. **Using React.Component instead of XOSComponent**
2. **Using this.state instead of VM.Data**
3. **Using setState instead of updateUI**
4. **Putting business logic in the component**
5. **Not creating a ViewModel file**
6. **Using hooks (useState, useEffect)**
7. **Direct DOM manipulation**
8. **Not binding ViewModel in constructor**

## 🔍 Quick Reference

| React Way (WRONG) | XOS MVVM Way (CORRECT) |
|-------------------|------------------------|
| `extends Component` | `extends cntrl.XOSComponent` |
| `this.state = {}` | `const model = this.Data; model.prop = value` in ViewModel |
| `this.setState()` | `this.updateUI()` in ViewModel |
| Business logic in component | Business logic in ViewModel |
| `componentDidMount()` | `onLoad()` in ViewModel |
| `componentWillUnmount()` | `onClosing()` in ViewModel |
| `useState()` hook | `this.Data` in ViewModel |

## 📁 File Structure for Every Module

```
components/
└── ModuleName/
    ├── ModuleName.jsx       # Component (extends XOSComponent)
    ├── ModuleNameVM.js      # ViewModel (extends VMBase)
    └── ModuleName.css       # Styles (optional)
```

## 🎯 When to Use MVVM

**ALWAYS** - There are no exceptions. Every component in this project must follow MVVM pattern.

Even for simple components:
- Static display components → Still use MVVM for consistency
- Single input field → Still use MVVM
- No state needed → Still create minimal ViewModel

## 📝 Template to Copy for New Components

Save this as your starting point:

### ViewModel Template
```javascript
import { VMBase, Utils, XOSMessageboxTypes } from '../../xos-components';

export default class [NAME]VM extends VMBase {
    constructor(props) {
        super(props);
        // Initialize all state using Data getter pattern
        const model = this.Data;
        model.someProperty = '';
        model.isLoading = false;
        // etc...
    }
    
    onLoad() {
        // Component mounted
    }
    
    // Add methods here
    
    onClosing() {
        // Component unmounting
    }
}
```

### Component Template
```javascript
import React from 'react';
import * as cntrl from '../../xos-components';
import [NAME]VM from './[NAME]VM';

export default class [NAME] extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new [NAME]VM(props));
    }
    
    render() {
        let vm = this.VM;
        let { /* destructure state */ } = vm.Data;
        
        return (
            <div>
                {/* Component JSX */}
            </div>
        );
    }
}
```

---

**REMEMBER**: If you're not following MVVM pattern, you're doing it wrong. No exceptions.