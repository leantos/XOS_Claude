# XOS Components Framework Documentation

## Overview
XOS Components is a comprehensive React-based UI framework with MVVM architecture, state management, and rich UI controls. This documentation covers everything needed to implement this framework in other projects.

## Core Architecture

### 1. Component Structure (MVVM Pattern)

#### Base Classes
- **XOSComponent** - Base React component class with lifecycle management
- **VMBase** - Base ViewModel class for business logic

#### Component Lifecycle
```javascript
// Component Creation
constructor(props, vm) -> VM registration -> State initialization

// Component Methods
onLoad() - Called when component loads
onClosing() - Called before component closes (return false to prevent)
onActive() - When component becomes active
onInactive() - When component becomes inactive
updateUI() - Force UI refresh
destroy() - Clean up resources
```

### 2. State Management

#### XOSStateManager
- Hierarchical state storage system
- Parent-child state relationships
- Automatic cleanup on component destruction
- Shared state between VM and Component via `_____data`

```javascript
// State Access Pattern
this.VM.Data // Access state in component
this.Data // Access state in VM
this.updateUI() // Trigger re-render
```

### 3. Navigation System

#### Window Management
```javascript
this.showWindow({
    url: 'General/CVSM001', // Component path
    data: { /* props */ },
    style: XOSWindowStyles.slideRight,
    onClose: (result) => { /* handle result */ }
});
```

#### Tab Management
```javascript
this.addTab({
    title: 'New Tab',
    key: 'unique-key',
    url: 'Transaction/Module',
    destroyOnHide: true,
    isClosable: true,
    data: { /* props */ }
});
```

### 4. Message Box System (showMessageBox)

**CRITICAL**: This is the **ONLY** standard way to show user notifications, confirmations, and error messages in applications using the XOS framework. **DO NOT use XOSAlert component directly**.

#### Implementation Location
- **Core Implementation**: `src\xos-components\XOSComponent.js:67-75`
- **Usage**: Always call `this.showMessageBox()` from VM or Component methods

#### Basic Usage
```javascript
this.showMessageBox(options)
```

#### Parameters
```javascript
{
    text: string,                    // Message to display (required)
    messageboxType: string,          // Type of message box (default: 'error')
    buttons: Array<{text, value}>,   // Button configuration (default: [{text: "Ok"}])
    onClose: function(event)         // Callback when dialog is closed
}
```

#### Message Box Types
```javascript
import { XOSMessageboxTypes } from '../xos-components';

XOSMessageboxTypes.error    // Red error icon
XOSMessageboxTypes.info     // Blue info icon  
XOSMessageboxTypes.warning  // Yellow warning icon
XOSMessageboxTypes.question // Question icon
XOSMessageboxTypes.none     // No icon
```

#### Common Usage Patterns

**1. Simple Error Message:**
```javascript
this.showMessageBox({
    text: Utils.getMessage(107), // "An error occurred"
    messageboxType: XOSMessageboxTypes.error
});
```

**2. Success Message with Callback:**
```javascript
this.showMessageBox({
    text: Utils.getMessage(4), // "Saved successfully"
    messageboxType: XOSMessageboxTypes.info,
    onClose: () => {
        this.close(); // Close current window
    }
});
```

**3. Confirmation Dialog:**
```javascript
this.showMessageBox({
    text: "Are you sure you want to delete this record?",
    messageboxType: XOSMessageboxTypes.question,
    buttons: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
    ],
    onClose: (e) => {
        if (e.buttonValue === "yes") {
            this.deleteRecord();
        }
    }
});
```

**4. Warning with Multiple Options:**
```javascript
this.showMessageBox({
    text: "Unsaved changes will be lost",
    messageboxType: XOSMessageboxTypes.warning,
    buttons: [
        { text: "Save", value: "save" },
        { text: "Don't Save", value: "discard" },
        { text: "Cancel", value: "cancel" }
    ],
    onClose: (e) => {
        switch(e.buttonValue) {
            case "save":
                this.saveAndClose();
                break;
            case "discard":
                this.close();
                break;
            // Cancel does nothing
        }
    }
});
```

#### Integration with Utils.ajax
```javascript
// Common pattern: Save with feedback
saveData() {
    Utils.ajax({
        url: 'Customer/Save',
        data: this.Data.Input
    }, (response) => {
        if (response && response.IsValid) {
            this.showMessageBox({
                text: Utils.getMessage(4), // "Saved successfully"
                messageboxType: XOSMessageboxTypes.info,
                onClose: () => {
                    this.close(response.Data);
                }
            });
        } else {
            this.showMessageBox({
                text: response.Message || Utils.getMessage(1),
                messageboxType: XOSMessageboxTypes.error
            });
        }
    });
}
```

#### Predefined Message Codes
```javascript
// Success Messages
Utils.getMessage(4)   // "Saved successfully"
Utils.getMessage(135) // "Record created successfully"

// Error Messages  
Utils.getMessage(1)   // "An error occurred"
Utils.getMessage(107) // "Operation failed"
Utils.getMessage(68)  // "Invalid file type"

// Validation Messages
Utils.getMessage(88)  // "Please fill all required fields"
Utils.getMessage(89)  // "Invalid email format"

// Confirmation Messages
Utils.getMessage(134) // "Are you sure?"
Utils.getMessage(136) // "Changes will be lost"
```

## React Integration & Rendering Mechanism

### How XOS Components Work with React

#### 1. **Component Hierarchy & Inheritance**
```javascript
React.Component 
    └── XOSComponent (extends React.Component)
        └── Your Module Component (extends XOSComponent)
```

The XOS framework extends React's component model, adding:
- Automatic state management via `XOSStateManager`
- Built-in lifecycle hooks (`onLoad`, `onClosing`, `onActive`)
- Context-based navigation and messaging

#### 2. **State Management & React Rendering**

**Traditional React:**
```javascript
this.setState({ data: newData }); // Triggers re-render
```

**XOS Pattern:**
```javascript
// In ViewModel
this.Data.Input = newValue; // Direct mutation
this.updateUI(); // Explicitly triggers React re-render

// How updateUI works internally:
updateUI() {
    if (this.ComponentRef != null)
        this.ComponentRef.updateUI(); // Calls component's updateUI
}

// In XOSComponent
updateUI() {
    if (this._isUnmounted === false)
        this.setState({}); // Forces React re-render with empty state
}
```

#### 3. **The Two-Way Binding Pattern**

XOS creates a pseudo two-way binding between View and ViewModel:

```javascript
// ViewModel maintains the actual state
VMBase {
    _____state = {}; // Actual data storage
    get Data() { return this._____state; }
}

// Component references VM's state directly
render() {
    const { Input, DataSource } = this.VM.Data; // Direct access to VM state
    return <input value={Input.Name} />
}
```

#### 4. **React Context Integration**

XOS uses React Context for component communication:

```javascript
// XOSContext provides navigation methods
const XOSContext = createContext({});

// Components access context for:
- showWindow()
- addTab()
- showMessageBox()
- close()

// Example usage in component
this.context.showMessageBox({ text: 'Hello' });
```

#### 5. **Render Optimization Strategies**

**Component Refs & Focus Management:**
```javascript
// XOS tracks focusable elements
this.______activeElements = []; // Stores refs to inputs
this._____data.lastFocusedIndex = -1; // Tracks focus state

// During inactive state, disables inputs
___onInactive() {
    for (const child of children) {
        child.disabled = true; // Prevents unwanted interactions
    }
}
```

**State Persistence Across Navigation:**
```javascript
// State survives tab switches via XOSStateManager
// When tab is hidden: state preserved in _____state
// When tab is shown: state restored from _____state
// No re-initialization needed
```

#### 6. **React Lifecycle Integration**

```javascript
class XOSComponent extends React.Component {
    componentDidMount() {
        // XOS calls onLoad() here
        if (!this._____data.isLoaded) {
            this.onLoad();
            this._____data.isLoaded = true;
        }
    }
    
    componentWillUnmount() {
        this._isUnmounted = true;
        // Prevents updateUI after unmount
    }
    
    shouldComponentUpdate() {
        // Always returns true for updateUI() calls
        return true;
    }
}
```

#### 7. **Virtual DOM Efficiency**

**Why XOS uses `setState({})`:**
- Forces React reconciliation
- React compares Virtual DOM trees
- Only changed elements update in real DOM
- VM.Data changes tracked by React's diffing algorithm

**Example Flow:**
```javascript
1. User types in textbox
2. onChange → VM.onChange("field", value)
3. VM.Data.Input.field = value (mutation)
4. VM.updateUI() → Component.setState({})
5. React re-renders, sees new value in VM.Data
6. Virtual DOM diff finds change
7. Updates only that input in real DOM
```

#### 8. **Event Handling Pattern**

```javascript
// XOS wraps React events
<XOSTextbox 
    onChange={(e) => vm.onChange("Name", e.value)}
    // e.value is XOS-wrapped, not React's e.target.value
/>

// Inside XOSTextbox
handleChange = (reactEvent) => {
    const value = this.processValue(reactEvent.target.value);
    this.props.onChange({ value: value }); // XOS event format
}
```

#### 9. **Component Communication Flow**

```
User Action → React Event → XOS Component → ViewModel → 
State Change → updateUI() → setState({}) → React Re-render →
Virtual DOM Diff → DOM Update → UI Updated
```

#### 10. **Performance Considerations**

**Advantages:**
- Single source of truth (VM.Data)
- Predictable update patterns
- Batch updates possible via single updateUI()
- State persists across navigation

**Trade-offs:**
- Direct mutation (not immutable)
- Manual updateUI() calls required
- Bypasses React's optimization hints

### Key Differences from Pure React

| Aspect | Pure React | XOS Components |
|--------|------------|----------------|
| State Management | `setState()` with immutable updates | Direct mutation + `updateUI()` |
| Component Base | `React.Component` | `XOSComponent` with extras |
| Business Logic | In component or hooks | Separated in ViewModel |
| Re-rendering | Automatic on state change | Manual via `updateUI()` |
| State Persistence | Lost on unmount | Preserved via StateManager |
| Navigation | React Router typically | Built-in window/tab system |
| Context Usage | Optional | Core for navigation/messaging |

## UI Components Reference

### XOSTextbox
```javascript
<XOSTextbox 
    inputType={XOSTextboxTypes.numeric} // textbox, alphaNumeric, alphabets, numeric, time24hr, password
    maxLength={100}
    value={value}
    onChange={(e) => handler(e.value)}
    mandatory={true}
    readOnly={false}
    prefix={3} // For numeric - integer digits
    suffix={2} // For numeric - decimal digits
/>
```

### XOSSelect (Dropdown)
```javascript
<XOSSelect
    dataSource={arrayOfItems}
    displayField="Text" // Property to display
    compareKey="ID" // Property for comparison
    selectedItem={currentSelection}
    onChange={(e) => handler(e.value)}
    allowClear={true}
    multiSelect={false}
    asyncSearch={asyncFunction} // For server-side search
    placeholder="Select item"
/>
```

### XOSGrid (Data Table)
```javascript
<XOSGrid
    dataSource={data}
    columns={[
        { field: 'Name', title: 'Name', width: 150, dataType: 'string' },
        { field: 'Amount', title: 'Amount', width: 100, dataType: 'numeric', align: 'right' },
        { field: 'Date', title: 'Date', width: 120, dataType: 'date', format: 'DD/MM/YYYY' }
    ]}
    rowSelection={true}
    multiSelect={true}
    selectedItems={selected}
    paging={true}
    pageInfo={{
        currentPage: 1,
        totalPages: 10,
        totalCount: 100,
        onPageChange: (e) => loadPage(e.pageNo)
    }}
    onGridCellClick={cellClickHandler}
    onGridCellDoubleClick={doubleClickHandler}
    showFilter={true}
    externalFilter={true}
    onFilterChange={filterHandler}
    externalSort={true}
    onSortChange={sortHandler}
    rowStyle={[
        { className: 'inactive-row', condition: (row) => row.Status === 'I' }
    ]}
/>
```

### XOSDatepicker
```javascript
<XOSDatepicker
    value={dateValue}
    onChange={(e) => handler(e.value)}
    placeHolder="Select date"
    startDate={minDate}
    endDate={maxDate}
    openOnFocus={true}
    allowClear={true}
    readOnly={false}
/>
```

### XOSControl (Container/Window)
```javascript
<XOSControl
    title="Window Title"
    loading={isLoading}
    className="modal-md"
    showToaster={showToast}
    toasterConfig={{
        title: 'Success',
        message: 'Operation completed',
        toasterType: 'info',
        onClose: () => {}
    }}
    hideTitleBar={false}
    hideClose={false}
    onClose={closeHandler}
    context={this.props.context}
>
    <XOSBody>
        {/* Content */}
    </XOSBody>
</XOSControl>
```

### XOSTab
```javascript
<XOSTab
    orientation="top" // top, bottom, left, right
    context={contextObject}
    zoomEnabled={true}
    ref={(el) => this.tabRef = el}
/>

// Tab Methods
this.tabRef.addTab(tabConfig)
this.tabRef.getTabs() // Get all tabs
this.tabRef.removeTab(key)
```

## API Integration

### Utils.ajax (API Calls)
```javascript
Utils.ajax({
    url: 'Controller/Action', // Relative URL
    data: requestData,
    method: 'POST', // Optional, default POST
}, (response) => {
    // Handle response
}, (error) => {
    // Handle error
});
```

### File Operations
```javascript
// Download File
Utils.downloadFile({
    url: 'General/DownloadFileAsync',
    data: { fileId: 123 }
}, (result) => {
    // Handle download
});

// Upload File
Utils.uploadFile({
    url: 'General/UploadFile',
    files: fileList,
    data: additionalData
}, (response) => {
    // Handle upload result
});
```

## Utility Functions

### Common Utils Methods
```javascript
// Validation
Utils.isNullOrEmpty(value) // Check null/empty
Utils.isDigit(charCode) // Check if digit
Utils.isAlphabet(charCode) // Check if alphabet
Utils.validateEmail(email) // Email validation

// Data Manipulation
Utils.cloneObject(obj) // Deep clone
Utils.getJSONCopy(obj) // JSON-based clone
Utils.cleanObject(obj) // Clean circular references
Utils.getUniqueID() // Generate unique ID

// Date/Time
Utils.formatDate(date, format) // Format date
Utils.parseDate(dateString) // Parse date string
Utils.addDays(date, days) // Add days to date

// Messages
Utils.getMessage(code) // Get predefined message
Utils.showMessage(message, type) // Show notification

// Array Extensions (via LINQ)
array.first(predicate) // Find first match
array.where(predicate) // Filter array
array.select(selector) // Map array
array.any(predicate) // Check if any match
array.remove(item) // Remove item
```

## Enums

### XOSTextboxTypes
- textbox, alphaNumeric, alphabets, numeric, time, time24hr, titleCase, sentenceCase, password

### XOSWindowStyles
- top, left, right, slideLeft, slideRight, slideTop, slideBottom, maximize

### XOSMessageboxTypes
- error, info, question, warning, none

### PopupLocations
- left, leftTop, right, rightTop, bottom, top

## Implementation Guide

### 1. Project Setup
```bash
# Required Dependencies
npm install react react-dom jquery moment fast-sort bootstrap @fortawesome/react-fontawesome
```

### 2. Folder Structure
```
src/
├── xos-components/        # Copy entire framework
├── components/
│   ├── Common/            # Shared components
│   ├── General/           # Master/maintenance screens
│   ├── Transaction/       # Transaction screens
│   └── Reports/           # Report screens
└── App.js
```

### 3. Creating a New Module

#### View Component (index.jsx)
```javascript
import React from 'react';
import * as cntrl from '../../../xos-components';
import ModuleVM from './ModuleVM';

export default class Module extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new ModuleVM(props));
    }
    
    onLoad = () => {
        this.VM.onLoad();
    }
    
    onClosing = () => {
        // Return false to prevent closing
        return true;
    }
    
    render() {
        const { Input, DataSource } = this.VM.Data;
        return (
            <cntrl.XOSControl 
                title={this.VM.Data.Title}
                loading={this.VM.Data.ShowLoading}
                context={this.props.context}
            >
                <cntrl.XOSBody>
                    {/* Your UI here */}
                </cntrl.XOSBody>
            </cntrl.XOSControl>
        );
    }
}
```

#### ViewModel (ModuleVM.js)
```javascript
import { VMBase, Utils, XOSMessageboxTypes } from '../../../xos-components';

export default class ModuleVM extends VMBase {
    constructor(props) {
        super(props);
        
        // Initialize state
        this.Data.Title = "Module Title";
        this.Data.Input = {};
        this.Data.DataSource = {};
        this.Data.ShowLoading = false;
    }
    
    onLoad() {
        this.loadData();
    }
    
    loadData() {
        this.Data.ShowLoading = true;
        this.updateUI();
        
        Utils.ajax({
            url: 'Module/GetData',
            data: {}
        }, (response) => {
            this.Data.ShowLoading = false;
            this.Data.DataSource = response;
            this.updateUI();
        });
    }
    
    onChange(field, value) {
        this.Data.Input[field] = value;
        this.updateUI();
    }
    
    save() {
        if (!this.validate()) return;
        
        Utils.ajax({
            url: 'Module/Save',
            data: this.Data.Input
        }, (response) => {
            this.showMessageBox({
                text: 'Saved successfully',
                messageboxType: XOSMessageboxTypes.info,
                onClose: () => this.close()
            });
        });
    }
    
    validate() {
        if (Utils.isNullOrEmpty(this.Data.Input.RequiredField)) {
            this.showMessageBox({
                text: 'Required field is empty',
                messageboxType: XOSMessageboxTypes.error
            });
            return false;
        }
        return true;
    }
}
```

### 4. Main Application Integration
```javascript
// In Main component
addModuleTab(moduleId) {
    this.tabRef.addTab({
        title: 'Module Name',
        key: moduleId,
        url: 'General/ModuleName', // Path to component
        destroyOnHide: true,
        isClosable: true,
        data: { /* initial props */ }
    });
}
```

## Migration Checklist

1. **Copy xos-components folder** - Contains entire framework
2. **Install dependencies** from package.json
3. **Setup folder structure** matching the pattern
4. **Update API endpoints** in ViewModels
5. **Rename module prefixes** (CVS* to YourPrefix*)
6. **Configure routing** in Main component
7. **Setup backend API** to match expected formats
8. **Test navigation** between modules
9. **Verify state management** works correctly
10. **Check all UI controls** render properly

## Common Patterns

### Loading States
```javascript
this.Data.ShowLoading = true;
this.updateUI();
// Async operation
this.Data.ShowLoading = false;
this.updateUI();
```

### Form Validation
```javascript
if (Utils.isNullOrEmpty(field)) {
    this.showMessageBox({ text: 'Field required' });
    this.inputRef.focus();
    return false;
}
```

### Grid with Server Pagination
```javascript
loadGridData(pageNo) {
    Utils.ajax({
        url: 'Module/GetGridData',
        data: { page: pageNo, pageSize: 20 }
    }, (response) => {
        this.Data.GridInfo = response;
        this.updateUI();
    });
}
```

### Workflow Integration
```javascript
// Check workflow status
if (this.Data.Input.RoutingStat === 'A') {
    // Approved state
} else if (this.Data.Input.RoutingStat === 'R') {
    // Rejected state
}
```

## Troubleshooting

### Common Issues

1. **State not updating**: Always call `this.updateUI()` after state changes
2. **Component not loading**: Check `onLoad()` is properly bound
3. **API calls failing**: Verify backend endpoints match
4. **Navigation not working**: Ensure proper context is passed
5. **Memory leaks**: Implement `destroy()` method properly

### Debug Tips
- Use `console.log(this.VM.Data)` to inspect state
- Check browser network tab for API calls
- Verify component paths are correct
- Ensure all refs are properly initialized

## Notes for Implementation

- Framework uses jQuery for DOM manipulation
- Moment.js for date handling
- Bootstrap for base styling
- Custom LINQ-like array extensions
- SignalR support for real-time updates
- Built-in session management
- Cryptography utilities included
- PDF viewer support
- Excel export capabilities

This framework is production-ready and handles complex enterprise scenarios including workflows, approvals, document management, and reporting. The React integration provides efficient rendering while maintaining enterprise-grade state management and navigation patterns.