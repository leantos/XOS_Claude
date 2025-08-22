# XOS Input Handling - Critical Fix Guide

## 🚨 CRITICAL: Why XOSTextbox Inputs Stop Accepting Keyboard Input

### The Problem
When XOSTextbox components don't accept keyboard input, it's NOT a problem with XOSTextbox itself. The issue is always in how the parent component implements the controlled component pattern with the XOS framework's ViewModel system.

### The Root Cause: VMBase Data Property

**VMBase.js Implementation:**
```javascript
export class VMBase {
    get Data() {
        return this._____state;  // Data is a GETTER, not a setter!
    }
    constructor(props) {
        this._____state = {};
        // ...
    }
}
```

## ❌ WRONG: Common Mistakes That Break Input

### 1. Trying to Set Data Directly (CAUSES ERROR)
```javascript
// ❌ WRONG - This throws: "Cannot set property Data of #<VMBase> which has only a getter"
export default class UserLoginVM extends VMBase {
    constructor(props) {
        super(props);
        this.Data = {  // ❌ ERROR! Data only has a getter!
            userName: '',
            password: ''
        };
    }
}

// ❌ ALSO WRONG - Direct _____state access (bad practice)
export default class UserLoginVM extends VMBase {
    constructor(props) {
        super(props);
        this._____state.userName = '';  // ❌ Don't access _____state directly
        this._____state.password = '';
    }
}
```

### 2. Wrong Event Handler Pattern
```javascript
// ❌ WRONG - Expects standard event, but XOSTextbox passes {name, value}
handleUsernameChange = (evt) => {
    this.VM.Data.userName = evt.target.value;  // undefined - no evt.target!
}

// ❌ WRONG - Updates state but doesn't trigger re-render
handleInputChange = (e) => {
    const model = this.VM.Data;
    model[e.name] = e.value;  // No updateUI() = no re-render!
}

// ❌ WRONG - Missing name prop on XOSTextbox
<cntrl.XOSTextbox 
    value={this.VM.Data.userName}
    onChange={this.handleInputChange}  // Won't work without name prop!
/>

// ❌ WRONG - Using React patterns in XOS
componentDidMount() {
    // React lifecycle methods don't work in XOS
    this.loadData();
}
```

## ✅ CORRECT: The Working Pattern

### 1. ViewModel Initialization
```javascript
export default class UserLoginVM extends VMBase {
    constructor(props) {
        super(props);
        this.init();
    }
    
    init() {
        // ✅ CORRECT - Get reference to Data, then set properties
        const model = this.Data;  // Get reference to _____state
        model.userName = '';      // Set properties on that reference
        model.password = '';
        model.isLoading = false;
        model.errorMessage = '';
    }
    
    // Continue using Data reference in methods
    validateForm() {
        const model = this.Data;
        if (!model.userName) {
            return 'Username required';
        }
    }
}
```

### 2. Component Event Handler Pattern
```javascript
export default class UserLogin extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new UserLoginVM(props));
    }
    
    // ✅ CORRECT - The pattern that makes inputs work
    handleInputChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;  // Get reference to _____state
            model[e.name] = e.value;     // Modify property on that reference
            this.VM.updateUI();           // CRITICAL: Trigger re-render!
        }
    };
    
    render() {
        // Access state via VM.Data
        let vm = this.VM;
        let { userName, password } = vm.Data;
        
        return (
            <cntrl.XOSTextbox
                name="userName"              // CRITICAL: name prop for e.name
                value={userName || ''}       // Controlled component
                onChange={this.handleInputChange}  // Unified handler
                placeholder="Enter username"
            />
        );
    }
}
```

## 📋 Implementation Checklist

### ViewModel Setup
- [ ] Extend VMBase correctly
- [ ] Use `init()` method to initialize state
- [ ] Get Data reference first: `const model = this.Data`
- [ ] Set properties on the reference: `model.prop = value`
- [ ] Never try to set `this.Data = {}`
- [ ] Access state via `this.Data` getter in methods

### Component Setup
- [ ] Extend `cntrl.XOSComponent`
- [ ] Pass ViewModel to `super(props, new VM(props))`
- [ ] Create proper event handlers with the 3-step pattern
- [ ] Add `name` prop to all XOSTextbox components

### Event Handler Pattern (MEMORIZE THIS!)
```javascript
handleInputChange = (e) => {
    if (this.VM) {
        const model = this.VM.Data;  // Step 1: Get reference
        model[e.name] = e.value;     // Step 2: Modify property
        this.VM.updateUI();           // Step 3: Trigger re-render
    }
};
```

## 🔍 Debugging Checklist

If inputs aren't working, check:

1. **Console Error**: "Cannot set property Data"
   - Fix: Use `const model = this.Data; model.prop = value` not `this.Data = {}`

2. **Input doesn't update when typing**
   - Fix: Add `this.VM.updateUI()` to handler
   - Fix: Ensure `name` prop matches property name

3. **Handler receives undefined**
   - Fix: Use `e.value` not `e.target.value`
   - Fix: Check XOSTextbox has `name` prop

4. **State not updating**
   - Fix: Get reference first: `const model = this.VM.Data`
   - Fix: Then modify: `model[e.name] = e.value`

## 💡 Quick Reference

### XOSTextbox Props
```javascript
<cntrl.XOSTextbox
    name="fieldName"                    // Required for e.name
    value={this.VM.Data.fieldName || ''}  // Controlled
    onChange={this.handleInputChange}   // Handler
    placeholder="Enter value"
    disabled={this.VM.Data.isLoading}
    inputType={cntrl.XOSTextboxTypes.textbox}  // or .password
    mandatory={true}
/>
```

### Complete Working Example
```javascript
// ViewModel
export default class FormVM extends VMBase {
    constructor(props) {
        super(props);
        this.init();
    }
    
    init() {
        const model = this.Data;
        model.email = '';
        model.password = '';
    }
}

// Component
export default class Form extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new FormVM(props));
    }
    
    handleInputChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            model[e.name] = e.value;
            this.VM.updateUI();
        }
    };
    
    render() {
        const { email, password } = this.VM.Data;
        
        return (
            <>
                <cntrl.XOSTextbox
                    name="email"
                    value={email || ''}
                    onChange={this.handleInputChange}
                />
                <cntrl.XOSTextbox
                    name="password"
                    value={password || ''}
                    onChange={this.handleInputChange}
                    inputType={cntrl.XOSTextboxTypes.password}
                />
            </>
        );
    }
}
```

## 🚨 NEVER DO THIS
```javascript
// ❌ Setting Data directly
this.Data = { userName: 'test' };

// ❌ Accessing _____state directly
this._____state.userName = 'test';

// ❌ Forgetting updateUI()
model.userName = e.value;  // No re-render!

// ❌ Using evt.target.value instead of e.value
onChange = (evt) => model.userName = evt.target.value;

// ❌ Not using name prop
<cntrl.XOSTextbox value={userName} onChange={handler} />

// ❌ Using React lifecycle in XOS components
componentDidMount() { this.loadData(); }

// ❌ Wrapping XOSComponent in XOSContainer
<XOSContainer><MyComponent /></XOSContainer>
```

## ✅ ALWAYS DO THIS
```javascript
// ✅ Initialize using Data reference in ViewModel
const model = this.Data;
model.userName = '';

// ✅ Three-step pattern in Component
const model = this.VM.Data;
model[e.name] = e.value;
this.VM.updateUI();

// ✅ Use e.value (XOS pattern)
onChange = (e) => model.userName = e.value;

// ✅ Include name prop (REQUIRED!)
<cntrl.XOSTextbox name="userName" value={userName} onChange={handler} />

// ✅ Use XOS lifecycle methods
onLoad = () => { this.VM.loadData(); }

// ✅ XOSComponent extends directly
export default class MyComponent extends cntrl.XOSComponent { ... }
```

This pattern is GUARANTEED to work because it follows the XOS framework's architecture correctly.

## 🏗️ XOSContainer vs XOSComponent - When to Use Which

### XOSComponent (for individual components)
```javascript
// ✅ CORRECT: Use for individual form components
export default class UserLogin extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new UserLoginVM(props));
    }
    // Component implementation...
}
```

### XOSContainer (for application-level dynamic loading)
```javascript
// ✅ CORRECT: Use at app level for dynamic component loading
<cntrl.XOSContainer
    url="Common/Login"           // Loads component by URL path
    context={{ parentID: 'CVS', id: 'LOGIN_ID' }}
    data={{ User: userInfo, QueryToken: queryToken }}
    className="col container-fluid h-100 m-0 p-0"
/>
```

### Key Differences:
- **XOSComponent**: Base class for individual components (forms, lists, etc.)
- **XOSContainer**: Application-level wrapper for dynamic loading via URLs
- **Don't wrap XOSComponents in XOSContainer** - they extend XOSComponent directly
- **XOSContainer is for loading components dynamically**, not for layout

### Architecture Pattern:
```
App Level:    XOSContainer (dynamic loading)
Component:    extends XOSComponent (individual components)  
ViewModel:    extends VMBase (state management)
```