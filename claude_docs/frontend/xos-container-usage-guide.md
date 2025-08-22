# XOSContainer Usage Guide

## 🏗️ XOS Architecture Hierarchy

Understanding when and how to use XOSContainer vs XOSComponent is crucial for proper XOS development.

```
Application Level:    XOSContainer (dynamic loading & app orchestration)
                           ↓
Component Level:      XOSComponent (individual business components)
                           ↓  
ViewModel Level:      VMBase (state management)
```

## ✅ CORRECT: XOSContainer Usage

### Purpose
XOSContainer is designed for **application-level dynamic component loading**, not individual component layout.

### When to Use XOSContainer
```javascript
// ✅ App-level dynamic loading
<cntrl.XOSContainer
    url="Common/Login"           // Loads component by URL path
    context={{ parentID: 'CVS', id: 'LOGIN_ID' }}
    data={{ User: userInfo, QueryToken: queryToken }}
    className="col container-fluid h-100 m-0 p-0"
/>
```

### XOSContainer Properties
- **`url`**: Path to dynamically load component (e.g., "Common/Login")
- **`context`**: Required context with `parentID` and `id`
- **`data`**: Data to pass to the loaded component
- **`className`**: Styling classes for the container

### Real Example from App.js
```javascript
// Application-level usage
const attr = {
    context: { parentID: 'CVS', id: 'LOGIN_ID' },
    id: "LOGIN_ID",
    url: "Common/Login",
    data: { User: userInfo, QueryToken: this.state.queryToken }
};

return (
    <cntrl.XOSContainer
        key="LOGIN_ID"
        className="col container-fluid h-100 m-0 p-0"
        {...attr}>
    </cntrl.XOSContainer>
);
```

## ✅ CORRECT: XOSComponent Usage

### Purpose
XOSComponent is the base class for **individual business components** like forms, lists, and dialogs.

### When to Use XOSComponent
```javascript
// ✅ Individual component implementation
export default class UserLogin extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new UserLoginVM(props));
    }
    
    render() {
        return (
            <div className="container-fluid d-flex justify-content-center">
                <div className="card">
                    {/* Component content */}
                </div>
            </div>
        );
    }
}
```

## ❌ WRONG: Common Mistakes

### Don't Wrap Components in XOSContainer
```javascript
// ❌ WRONG - Don't do this in individual components
export default class UserLogin extends cntrl.XOSComponent {
    render() {
        return (
            <cntrl.XOSContainer>  {/* ❌ NEVER DO THIS! */}
                <div className="form">
                    {/* component content */}
                </div>
            </cntrl.XOSContainer>
        );
    }
}

// ❌ WRONG - Don't wrap XOSComponents in parent components
function App() {
    return (
        <cntrl.XOSContainer>  {/* ❌ Wrong - not for layout! */}
            <UserLogin />
        </cntrl.XOSContainer>
    );
}
```

### Don't Use XOSContainer for Layout
```javascript
// ❌ WRONG - XOSContainer is not for styling/layout
<cntrl.XOSContainer className="d-flex justify-content-center">
    <UserLogin />
</cntrl.XOSContainer>
```

## 📋 Decision Matrix

| Use Case | Component Type | Pattern |
|----------|----------------|---------|
| **Dynamic component loading by URL** | XOSContainer | App-level orchestration |
| **Individual forms/lists/components** | XOSComponent | Business logic components |
| **Layout and styling** | Standard div/Bootstrap | Simple HTML structure |
| **State management** | VMBase | ViewModel pattern |

## 🎯 Best Practices

### 1. Application Architecture
```javascript
// App.js - Application level
function App() {
    return (
        <div className="app">
            {/* Option A: Static rendering */}
            <UserLogin />
            
            {/* Option B: Dynamic loading via XOSContainer */}
            <cntrl.XOSContainer 
                url="User/Login" 
                context={{ parentID: 'APP', id: 'LOGIN' }}
            />
        </div>
    );
}
```

### 2. Component Implementation
```javascript
// UserLogin/index.jsx - Component level
export default class UserLogin extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new UserLoginVM(props));
    }
    
    render() {
        // Use simple layout - no XOSContainer needed
        return (
            <div className="container-fluid">
                <div className="card">
                    {/* Form content */}
                </div>
            </div>
        );
    }
}
```

### 3. ViewModel Pattern
```javascript
// UserLoginVM.jsx - ViewModel level
export default class UserLoginVM extends VMBase {
    constructor(props) {
        super(props);
        this.init();
    }
    
    init() {
        const model = this.Data;
        model.userName = '';
        model.password = '';
    }
}
```

## 🔍 XOSContainer Features

### Dynamic Loading
- Loads components via URL strings
- Manages component lifecycle
- Provides context to loaded components

### Window Management
- Manages dialogs and overlays
- Handles window state and events
- Provides escape key handling

### State Orchestration
- Manages parent-child relationships
- Handles data flow between components
- Provides context for state management

## 🚨 Key Takeaways

1. **XOSContainer = Application-level dynamic loading ONLY**
2. **XOSComponent = Individual business components**
3. **NEVER wrap XOSComponents in XOSContainer**
4. **Use simple div/Bootstrap for component layout**
5. **XOSContainer requires proper context setup**
6. **XOSContainer loads components by URL string (e.g., "Common/Login")**
7. **If you're not loading via URL, you probably don't need XOSContainer**

## 🔍 Quick Decision Guide

**Use XOSContainer when:**
- Loading components dynamically via URL strings
- Managing application-level routing
- Need parent-child context management
- Working at App.js level

**Use XOSComponent when:**
- Creating individual forms, lists, dialogs
- Building business logic components
- Need ViewModel integration
- Working at component level

**Use regular div/Bootstrap when:**
- Just need layout and styling
- Creating simple wrapper components
- No dynamic loading required

This separation of concerns keeps the architecture clean and maintainable while leveraging the full power of the XOS framework.