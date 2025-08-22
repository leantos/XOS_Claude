# Frontend Architecture Blueprint

## Executive Summary

The frontend is built on a sophisticated **XOS Component Architecture** that implements a **Model-View-ViewModel (MVVM)** pattern with custom React components. This blueprint is designed for **Claude Code** and provides guidance on when to use the existing XOS components versus standard React patterns.

> **Claude Code Usage**: When working in this project:
> - **If `xos-components` directory exists**: Use the XOS component library and patterns described in this blueprint
> - **If no XOS components found**: Follow standard React patterns with `useState`, `useReducer`, and Context API as documented in React's official documentation

## 🏗️ Core Architecture Overview

### Technology Stack
- **Framework**: React 18.2.0 with functional and class-based components
- **Styling**: SCSS/SASS with Bootstrap 5.1.3 integration
- **State Management**: Custom XOSStateManager with hierarchical state trees
- **API Communication**: Custom ApiManager with authentication, session management, and error handling
- **UI Components**: Custom XOS component library with 25+ reusable components
- **Build Tools**: React Scripts 5.0.1, SASS compiler, npm-run-all

### Key Architectural Principles

1. **Component-Based Architecture**: Modular, reusable XOS components
2. **MVVM Pattern**: Clear separation of View, ViewModel, and Model layers
3. **Hierarchical State Management**: Tree-structured state with parent-child relationships
4. **Context-Driven Communication**: React Context for cross-component messaging
5. **Session-Aware Design**: Built-in authentication and session management

## 🎯 XOS Component System Deep Dive

### UI Templates (Standardized Patterns)

> **IMPORTANT**: Before creating any new UI component, use the standardized templates that cover 95% of UI patterns:
> - **[UI Templates Guide](./ui-templates-guide.md)** - Complete template selection and usage instructions
> - **[Template Source Files](./ui-templates/)** - Ready-to-use component templates

#### Template Coverage:
- **65%** - Master-Detail CRUD Forms
- **20%** - Search/List with Grid
- **10%** - Complex Workflow Forms  
- **5%** - Report Parameter Forms

### Component Hierarchy

```
XOSComponent (Base Class)
├── XOSControl (Layout & Window Management)
│   ├── Modal Windows
│   ├── Form Containers  
│   └── Dialog Boxes
├── UI Components
│   ├── XOSTextbox (Input Controls)
│   ├── XOSSelect (Dropdown/ComboBox)
│   ├── XOSGrid (Data Tables)
│   ├── XOSDatepicker (Date Selection)
│   ├── XOSCalendar (Calendar Views)
│   ├── XOSTab (Tabbed Interfaces)
│   ├── XOSTreeview (Hierarchical Data)
│   ├── XOSEditor (Rich Text Editor)
│   └── 15+ More Components
└── Utility Components
    ├── XOSOverlay (Loading States)
    ├── XOSToaster (Notifications)
    ├── XOSAlert (Message Boxes)
    └── AsyncLoader (Dynamic Loading)
```

### XOSComponent Base Class Features

**Core Capabilities:**
- **Lifecycle Management**: `onLoad()`, `onClosing()`, `onActive()`, `onInactive()`
- **Context Integration**: Automatic context binding with `XOSContext`
- **State Persistence**: Integrated with `XOSStateManager` for state preservation
- **Event Handling**: Built-in event registration and cleanup
- **Memory Management**: Automatic cleanup and disposal mechanisms
- **Focus Management**: Sophisticated focus handling with keyboard navigation

**Key Methods:**
```javascript
// Component Registration & Lifecycle
constructor(props, vm) // Binds component to ViewModel
register(componentRef) // Registers component with VM
destroy(destroyVM) // Cleanup and memory management

// UI Interaction
showWindow(options) // Modal window management  
showMessageBox(options) // Alert/confirm dialogs
addTab(options) // Dynamic tab creation
updateUI() // Force UI refresh

// Context Operations
close(result) // Close component with result
updateTabInfo(result) // Update tab metadata
```

## 📊 ViewModel Pattern Implementation

### VMBase Architecture

**Core Structure:**
```javascript
export class VMBase {
    get Data() { return this._____state; } // Public state accessor
    constructor(props) // Initialize state and context
    register(componentRef) // Bind to component
    updateUI() // Trigger component refresh  
    destroy() // Cleanup resources
}
```

**Key Features:**
- **State Encapsulation**: `_____state` object holds all component data
- **Component Binding**: Two-way binding between VM and Component
- **Context Awareness**: Integrates with XOSStateManager for persistence
- **Lifecycle Management**: Automatic cleanup and disposal
- **Cross-Component Communication**: Window, tab, and message box operations

### Example ViewModel Implementation

```javascript
// CVSM001VM.jsx - Site Master ViewModel
export default class CVSM001VM extends VMBase {
    constructor(props) {
        super(props)
        if (Object.keys(this.Data).length !== 0) return;
        
        // Initialize state
        this.Data.Title = "Site Master";
        this.Data.Input = { TwoStepRefund: false };
        this.Data.DataSource = { Vendors: [], Currencies: [] };
        this.Data.ShowLoading = false;
    }
    
    // Business Logic Methods
    save(e) {
        if (this.isValidSave()) {
            this.Data.Input.UserID = e.userID;
            this.Data.ShowLoading = true;
            this.updateUI();
            
            Utils.ajax({ url: 'Site/Save', data: this.Data.Input }, (resp) => {
                this.Data.ShowLoading = false;
                this.updateUI();
                // Handle response...
            });
        }
    }
    
    // Validation Logic
    isValidSave() {
        let { Input } = this.Data;
        if (Utils.isNullOrEmpty(Input.Text)) {
            this.showMessageBox({
                text: Utils.getMessage(20),
                onClose: () => this.nameInput.focus()
            });
            return false;
        }
        return true;
    }
}
```

### Component-ViewModel Binding

```javascript
// Component Implementation
export default class CVSM001 extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new CVSM001VM(props)); // Bind ViewModel
    }
    
    render() {
        let vm = this.VM; // Access ViewModel
        let { Input, DataSource } = vm.Data; // Access state
        
        return (
            <cntrl.XOSControl loading={vm.Data.ShowLoading} 
                             title={vm.Data.Title}>
                <cntrl.XOSTextbox 
                    ref={e1 => vm.nameInput = e1}
                    value={Input.Text}
                    onChange={(e) => vm.onChange("Text", e.value)} />
            </cntrl.XOSControl>
        );
    }
}
```

## 🔄 State Management System

### XOSStateManager Architecture

**Hierarchical State Structure:**
```javascript
_store = {
    id: "parent-id",
    state: {}, // Public state data
    internalState: { vm: null, data: {} }, // Private component data
    children: [
        {
            id: "child-id",
            state: {},
            internalState: { vm: VMInstance, data: {} },
            children: []
        }
    ]
}
```

**Key Operations:**
- **State Retrieval**: `getStateByID(parentID, id)` - Get or create state entry
- **State Updates**: `updateState(parentID, id, state)` - Update specific state
- **State Removal**: `removeStateByID(stateID)` - Remove state and cleanup
- **Hierarchical Search**: Recursive state tree traversal

### State Lifecycle Management

1. **Creation**: State created on first component mount
2. **Persistence**: State survives component unmount/remount cycles  
3. **Cleanup**: Automatic disposal when component permanently destroyed
4. **Memory Management**: Built-in garbage collection and cleanup timers

## 🌐 API Communication Architecture

### ApiManager Core Features

**Authentication & Session Management:**
- **Token Management**: JWT access/refresh token handling
- **Automatic Renewal**: Silent token refresh on expiration
- **Session Persistence**: Browser storage integration
- **Security Headers**: Bearer token authentication

**Request Handling:**
```javascript
// Standard API Call
Utils.ajax({ url: 'Site/Save', data: this.Data.Input }, (response) => {
    // Handle response
});

// File Operations
ApiManager.downloadFile(options, callback);
ApiManager.openFileInWindow(options, callback);
ApiManager.getFileUrl(options, callback);
```

**Error Handling:**
- **401 Handling**: Automatic token refresh and retry
- **Session Expiry**: Graceful session timeout management  
- **Network Errors**: Comprehensive error reporting
- **Loading States**: Integrated loading indicators

### WebStorage Integration

- **Session Store**: `WebStorageStateStore` for session persistence
- **Configuration**: `ApplicationInfo` for environment settings
- **User Data**: Secure storage of user information and permissions

## 🎨 UI Component Library & Styling System

### 🚨 CRITICAL: Button Reality
**There is NO XOSButton visual component!** The app uses:
- Regular HTML `<button>` elements
- Bootstrap 5 classes with custom theme colors
- `XOSButtonWrapper` ONLY for authentication (not styling)

**Correct button implementation:**
```jsx
<button 
    type="button"
    className="btn btn-sm btn-primary"
    onClick={handleClick}
>
    <i className="fa fa-save"></i> Save
</button>
```

### Bootstrap 5 Foundation
The entire styling system is built on Bootstrap 5:

**Theme Integration:**
```scss
// In src/scss/theme.scss
$theme-color-primary: #222831;  // Dark blue-gray
$theme-colors: (
  "primary": $theme-color-primary,
  "save": $theme-color-primary,    // Custom extensions
  "edit": $theme-color-primary,
  "delete": $theme-color-primary,
  // ...more
);

@import "../../node_modules/bootstrap/scss/bootstrap.scss";
```

**Icon System:**
- FontAwesome 5.15.4 (NOT Bootstrap Icons)
- Icons: `<i className="fa fa-save"></i>`
- Loaded from `/public/fontawesome-free-5.15.4-web/`

### Form Controls

**XOSTextbox**: Advanced text input with validation
- **Input Types**: Text, numeric, email, password, time
- **Validation**: Built-in validation rules and messages
- **Formatting**: Auto-formatting and masking
- **Focus Management**: Automatic focus handling

**XOSSelect**: Dropdown/ComboBox with search
- **Data Binding**: Array-based data sources
- **Search**: Real-time filtering and search
- **Templating**: Custom display formatting
- **Validation**: Required field validation

**XOSGrid**: Advanced data table
- **Features**: Sorting, filtering, paging, selection
- **Async Support**: Server-side operations
- **Customization**: Cell templates, row styling
- **Export**: Built-in export functionality

### Layout Components

**XOSControl**: Window/Modal container
- **Features**: Resizable, draggable, modal dialogs
- **Hotkeys**: Keyboard shortcut integration
- **Loading States**: Built-in overlay loading
- **Focus Trap**: Automatic focus management

**XOSTab**: Tabbed interface
- **Dynamic Tabs**: Runtime tab creation/removal
- **State Persistence**: Tab state preservation
- **Navigation**: Programmatic tab switching
- **Lifecycle**: Tab lifecycle management

## 🚀 Development Patterns & Best Practices

### XOS Component Development Guidelines (When Available)

1. **Extend XOSComponent**: Always inherit from base component class
2. **Use ViewModels**: Implement business logic in separate VM classes  
3. **State Management**: Use `this.Data` for all component state
4. **Lifecycle Hooks**: Implement `onLoad()`, `onClosing()` as needed
5. **Memory Cleanup**: Ensure proper disposal in `destroy()` method

### Standard React Development (Fallback Pattern)

When XOS components are not available, use these React patterns:

```javascript
// Standard React Component with useState
import { useState, useEffect } from 'react';

export default function StandardComponent({ title }) {
    const [data, setData] = useState({ loading: false, input: {} });
    
    const handleSave = async (formData) => {
        setData(prev => ({ ...prev, loading: true }));
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            // Handle success
        } catch (error) {
            // Handle error
        } finally {
            setData(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="container">
            <h1>{title}</h1>
            {data.loading ? <div>Loading...</div> : <form>...</form>}
        </div>
    );
}
```

### Universal Best Practices (Both Approaches)

1. **State Initialization**: Initialize all state in constructor/useState
2. **Validation Logic**: Centralize validation logic
3. **API Communication**: Use consistent API patterns
4. **UI Updates**: Trigger re-renders after state changes
5. **Reference Management**: Store component references for focus management

### Code Organization

```
src/
├── components/           # Feature components
│   ├── Common/          # Shared UI components
│   ├── General/         # Master data components  
│   ├── Reports/         # Report components
│   └── Transaction/     # Business transaction components
├── xos-components/      # Core component library
│   ├── Core/           # API, Session, State management
│   ├── Utils/          # Utility functions
│   └── [Components]/   # Individual XOS components
└── assets/             # Styles, images, fonts
```

## 🔧 Build & Development Process

### Build Configuration
- **CSS Processing**: SCSS to CSS compilation with watch mode
- **Source Maps**: Disabled for production builds
- **Asset Optimization**: Automatic minification and compression
- **Version Management**: Automated version checking

### Development Workflow
1. **Hot Reload**: Live development server with hot module replacement
2. **CSS Watch**: Real-time SCSS compilation during development  
3. **Build Process**: Optimized production builds with source map control
4. **Testing**: Jest and React Testing Library integration

## 📋 Migration & Extension Guidelines

### Adding New Components (XOS Pattern)

When XOS components are available:
1. **Create Component Class**: Extend `XOSComponent`
2. **Create ViewModel**: Extend `VMBase`
3. **Implement Lifecycle**: `onLoad()`, `onClosing()`, etc.
4. **Add to Index**: Export from component library
5. **Documentation**: Update component documentation

### Adding New Components (Standard React)

When using standard React patterns:
```javascript
// Custom Hook for reusable logic
function useFormState(initialData) {
    const [state, setState] = useState({ 
        data: initialData, 
        loading: false, 
        error: null 
    });
    
    const updateData = useCallback((updates) => {
        setState(prev => ({ ...prev, data: { ...prev.data, ...updates } }));
    }, []);
    
    return { state, updateData, setState };
}

// Component using the custom hook
export default function NewComponent({ initialData }) {
    const { state, updateData, setState } = useFormState(initialData);
    
    useEffect(() => {
        // Component lifecycle logic
    }, []);
    
    return (
        <div>
            {/* Component JSX */}
        </div>
    );
}
```

### Component Decision Matrix

| Use Case | XOS Components Available | No XOS Components |
|----------|-------------------------|-------------------|
| **Forms** | `XOSControl` + `XOSTextbox` | `useState` + controlled inputs |
| **Data Tables** | `XOSGrid` | Custom table with `useReducer` |
| **Modals** | `XOSControl` with modal props | Portal-based modal component |
| **State Management** | `VMBase` + `XOSStateManager` | `useState`/`useReducer` + Context |
| **API Calls** | `Utils.ajax` | `fetch` + custom hooks |
| **Loading States** | `XOSOverlay` | Conditional rendering |

### Performance Optimization

1. **Lazy Loading**: Implement dynamic imports for large components
2. **Memoization**: Use React.memo for expensive renders
3. **State Optimization**: Minimize state updates and UI refreshes
4. **Memory Management**: Proper cleanup in component lifecycle

## 🎯 Key Architectural Strengths

1. **Separation of Concerns**: Clear MVVM architecture
2. **Reusability**: Comprehensive component library
3. **State Management**: Sophisticated hierarchical state system
4. **Session Management**: Enterprise-grade authentication
5. **Error Handling**: Robust error management and recovery
6. **Memory Management**: Automatic cleanup and disposal
7. **Developer Experience**: Consistent patterns and APIs
8. **Extensibility**: Well-designed extension points

## 🤖 Claude Code Integration Guidelines

### Detection Strategy

Claude Code should automatically detect the architectural approach:

```javascript
// Check for XOS components in project
const hasXOSComponents = fs.existsSync('./src/xos-components') || 
                        fs.existsSync('./xos-components');

if (hasXOSComponents) {
    // Use XOS patterns described in this blueprint
    useXOSArchitecture();
} else {
    // Fall back to standard React patterns
    useReactDocumentation();
}
```

### Context-Aware Development

**When XOS Components Are Available:**
- Reference this blueprint for component patterns
- Use XOS component library APIs
- Follow MVVM architectural patterns
- Leverage existing XOSStateManager

**When XOS Components Are Not Available:**
- Use React's official documentation patterns
- Implement standard React hooks (`useState`, `useReducer`, `useContext`)
- Follow React best practices for component composition
- Use Context API for cross-component state sharing

### Quick Reference Commands

```bash
# Check if project uses XOS components
find . -name "xos-components" -type d

# If XOS components found, use patterns like:
import * as cntrl from '../xos-components';
class NewComponent extends cntrl.XOSComponent { ... }

# If no XOS components, use standard React:
import { useState, useEffect } from 'react';
function NewComponent() { ... }
```

---

This blueprint provides the foundation for understanding, maintaining, and extending the CVS frontend architecture. The XOS component system represents a mature, enterprise-ready React architecture that balances flexibility with consistency, while providing fallback guidance for standard React development when XOS components are not available.