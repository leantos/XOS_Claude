# XOS Framework Core Architecture

> **⚠️ CRITICAL: This is NOT a standard React app - XOS heavily modifies React behavior**
> 
> **📚 For comprehensive implementation details, see: [XOS Framework Complete Guide](./xos-framework-complete-guide.md)**
> 
> This document provides the core architectural overview. For full component reference, examples, and best practices, refer to the complete guide.

## Overview
XOS Components is a **proprietary enterprise UI framework** that wraps React with custom patterns. It implements MVVM (Model-View-ViewModel) architecture with manual state management and requires specific patterns that differ significantly from standard React.

### 🚨 Critical Dependencies
- **jQuery**: Required throughout the application (not optional)
- **Bootstrap**: Heavy integration for modals, buttons, grid
- **XOS Framework**: Custom state, lifecycle, and component system

## Core Architecture Components

### 1. Component Hierarchy & Inheritance

```javascript
React.Component 
    └── XOSComponent (extends React.Component)
        └── Your Module Component (extends XOSComponent)
```

**XOSComponent adds:**
- Automatic state management via `XOSStateManager`
- Built-in lifecycle hooks (`onLoad`, `onClosing`, `onActive`, `onInactive`)
- Context-based navigation and messaging
- Focus management system
- Hot-key support

### 2. MVVM Pattern Implementation

#### ViewModel Base (VMBase)
```javascript
export class VMBase {
    get Data() {
        return this._____state; // Actual state storage
    }
    
    constructor(props) {
        this._____state = {};
        this.props = props;
        // Connects to XOSStateManager for persistence
    }
    
    updateUI() {
        if (this.ComponentRef != null)
            this.ComponentRef.updateUI(); // Triggers React re-render
    }
}
```

#### Component-ViewModel Binding
```javascript
// In Component Constructor
constructor(props) {
    super(props, new MyViewModel(props));
    // VM is automatically registered and bound
}

// Access Pattern
this.VM.Data // In component
this.Data    // In ViewModel
```

## State Management System

### XOSStateManager
Hierarchical state storage that persists across navigation:

```javascript
// State Structure
{
    id: 'component-id',
    state: {},           // VM.Data stored here
    internalState: {     // Shared between VM and Component
        vm: VMBaseInstance,
        data: {}
    },
    children: []         // Child component states
}
```

**Key Features:**
- State survives tab switches
- Automatic cleanup on component destruction
- Parent-child state relationships
- Prevents duplicate VM instances

### State Persistence Flow
1. Tab Hidden → State preserved in `_____state`
2. Tab Shown → State restored from `_____state`
3. No re-initialization or data loss
4. Focus position maintained

### ⚠️ Manual Update Requirement
**CRITICAL**: UI does NOT update automatically. You MUST call `updateUI()` after every state change:
```javascript
// WRONG - UI won't update
this.Data.property = value;

// CORRECT - UI will update
this.Data.property = value;
this.updateUI(); // MANDATORY
```

## React Integration Mechanism

### How updateUI() Works

```javascript
// The Update Chain
1. VM.Data.field = value;        // Direct mutation
2. VM.updateUI();                // Called in ViewModel
3. ComponentRef.updateUI();      // Calls component method
4. this.setState({});           // Forces React reconciliation
5. React re-renders with new VM.Data values
```

**Why setState({}):**
- Forces React to re-render
- React's diffing algorithm detects VM.Data changes
- Virtual DOM ensures only changed elements update
- Maintains React's optimization benefits

### Event Flow
```
User Action 
    → React Event 
    → XOS Component Handler
    → ViewModel Method
    → State Mutation (VM.Data)
    → updateUI()
    → setState({})
    → React Re-render
    → Virtual DOM Diff
    → DOM Update
```

## Component Lifecycle

### Standard Lifecycle Methods

```javascript
class MyComponent extends XOSComponent {
    onLoad() {
        // Called once when component first loads
        // Initialize data, make API calls
    }
    
    onClosing() {
        // Called before component closes
        // Return false to prevent closing
        // Cleanup, save confirmations
    }
    
    onActive() {
        // Component becomes active (tab selected)
        // Restore focus, refresh data
    }
    
    onInactive() {
        // Component becomes inactive (tab deselected)
        // Pause timers, save draft state
    }
    
    destroy() {
        // Final cleanup
        // Remove event listeners, clear timers
    }
}
```

### React Lifecycle Integration

```javascript
componentDidMount() {
    if (!this._____data.isLoaded) {
        this.onLoad();
        this._____data.isLoaded = true;
    }
}

componentWillUnmount() {
    this._isUnmounted = true;
    // Prevents updateUI after unmount
}
```

## Navigation System

### Context-Based Navigation
All navigation methods available through React Context:

```javascript
// Available in any XOSComponent
this.showWindow(options)     // Open modal/slide window
this.addTab(options)         // Add new tab
this.showMessageBox(options) // Show message dialog
this.close(result)           // Close current window
this.closeTab(result)        // Close current tab
```

### Window Management
```javascript
this.showWindow({
    url: 'General/CustomerMaster',  // Component path
    data: { customerId: 123 },      // Initial props
    style: XOSWindowStyles.slideRight,
    onClose: (result) => {
        // Handle returned data
    }
});
```

### Tab Management
```javascript
this.addTab({
    title: 'Customer Details',
    key: 'customer-123',  // Unique identifier
    url: 'General/CustomerMaster',
    destroyOnHide: true,  // Clean up on tab close
    isClosable: true,
    data: { customerId: 123 }
});
```

## Focus Management

### Active/Inactive State Handling
```javascript
___onInactive() {
    // Store focusable elements
    this.______activeElements = Utils.getKeyboardFocusableElements();
    // Disable all inputs when inactive
    for (const child of this.______activeElements) {
        child.disabled = true;
    }
}

___onActive() {
    // Re-enable inputs
    for (const child of this.______activeElements) {
        child.disabled = false;
    }
    // Restore last focus
    this.focus(false, skipLastFocus);
}
```

## Hot-Key Support

Components automatically register hot-keys:

```html
<button hot-key="S">Save</button>
<button hot-key="C">Cancel</button>
```

Hot-keys are:
- Scoped to active component
- Automatically disabled when component inactive
- Support Alt+key combinations

## Message Box System

```javascript
this.showMessageBox({
    text: 'Save changes?',
    messageboxType: XOSMessageboxTypes.question,
    buttons: [
        { text: "Yes", result: true },
        { text: "No", result: false }
    ],
    onClose: (result) => {
        if (result) this.save();
    }
});
```

## Performance Optimizations

### Virtual DOM Efficiency
- Only changed properties trigger updates
- React's diffing minimizes DOM mutations
- Batch updates via single `updateUI()` call

### Memory Management
- Automatic cleanup via `destroy()`
- Circular reference prevention
- Timed cleanup after component unmount
- State manager prevents memory leaks

### State Persistence Benefits
- No re-fetching data on tab switch
- Instant tab switching
- Form state preserved
- Scroll position maintained

## Key Differences from Pure React

| Aspect | Pure React | XOS Framework |
|--------|------------|---------------|
| State Updates | `setState()` immutable | Direct mutation + `updateUI()` |
| Business Logic | Hooks or component | Separated ViewModel |
| Component Communication | Props/Context/Redux | Built-in context navigation |
| Lifecycle | React lifecycle only | Extended with XOS hooks |
| State Persistence | Lost on unmount | Preserved via StateManager |
| Focus Management | Manual | Automatic with active/inactive |
| Navigation | React Router | Built-in window/tab system |

## jQuery Integration

### Required jQuery Patterns
XOS relies heavily on jQuery for DOM manipulation:

```javascript
// Common jQuery usage in XOS
$('body').addClass('overflow-hidden');
$('.body-sidebar-menu-toggle').removeClass('hide');
$('#myElement').show();
$(this.getRef('input')).val(value);
```

### Bootstrap Integration
XOS uses Bootstrap classes and components directly:
- Modals: `modal-md`, `modal-xl`, `modal-dialog`
- Buttons: `btn-primary`, `btn-secondary`
- Grid: `col-md-6`, `row`, `container`
- Forms: `form-control`, `form-group`

## Best Practices

1. **ALWAYS call updateUI() after state changes**
   ```javascript
   // THIS IS MANDATORY - NOT OPTIONAL
   this.Data.value = newValue;
   this.updateUI(); // UI WILL NOT UPDATE WITHOUT THIS
   ```

2. **Use proper lifecycle methods**
   - Data loading → `onLoad()`
   - Cleanup → `onClosing()`
   - Tab visibility → `onActive()`/`onInactive()`

3. **Leverage state persistence**
   - Don't reload data unnecessarily
   - Trust that state survives navigation

4. **Follow MVVM separation**
   - UI logic in Component
   - Business logic in ViewModel
   - State in VM.Data

5. **Use context navigation**
   - Don't create custom navigation
   - Use provided methods for consistency

6. **Include jQuery in all components**
   - jQuery is NOT optional
   - Many XOS features depend on jQuery
   - Bootstrap components require jQuery

7. **Use XOS patterns, not React patterns**
   - No hooks (useState, useEffect)
   - No functional components for XOS modules
   - Manual state updates via updateUI()
   - Direct state mutation is expected