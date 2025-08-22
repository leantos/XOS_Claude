# XOS Framework Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [MVVM Pattern](#mvvm-pattern)
4. [Component Development](#component-development)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Component Reference](#component-reference)
8. [Best Practices](#best-practices)
9. [Migration Guide](#migration-guide)

## Overview

The XOS Framework is a React-based enterprise UI framework implementing Model-View-ViewModel (MVVM) architecture with sophisticated state management, navigation systems, and a comprehensive component library.

### When to Use XOS Framework

**Use XOS Framework when:**
- Project has `xos-components` directory
- Enterprise-level application requirements
- Need for consistent MVVM architecture
- Complex state management requirements
- Multi-window/tab navigation needs

**Use Standard React when:**
- No XOS components available
- Simple applications
- Prototype/POC development
- Modern React patterns preferred

## Architecture

### Technology Stack
- **Framework**: React 18+ with class-based components
- **Pattern**: MVVM (Model-View-ViewModel)
- **Styling**: SCSS/SASS with Bootstrap 5 integration
- **State**: Hierarchical state management with persistence
- **API**: Custom ApiManager with JWT authentication

### Component Hierarchy

```
React.Component
└── XOSComponent (Base class with lifecycle management)
    └── Your Component (Business component)
        └── ViewModel (Business logic layer)
```

### Key Architectural Principles

1. **Component-Based Architecture**: Modular, reusable components
2. **MVVM Pattern**: Clear separation of View and ViewModel
3. **Hierarchical State**: Tree-structured state with parent-child relationships
4. **Context-Driven**: React Context for cross-component communication
5. **Session-Aware**: Built-in authentication and session management

## MVVM Pattern

### ⚠️ MANDATORY: Every Component Must Follow MVVM

The MVVM pattern is **NOT OPTIONAL**. Every component in an XOS project must follow this architecture.

### ViewModel Structure

```javascript
// {ComponentName}VM.js
import { VMBase, Utils } from '../../xos-components';

export default class {ComponentName}VM extends VMBase {
    constructor(props) {
        super(props);
        
        // ALL state goes in Data object
        this.Data = {
            // Initialize all state properties here
            loading: false,
            items: [],
            selectedItem: null,
            errorMessage: ''
        };
    }
    
    // Lifecycle - called once when component loads
    onLoad() {
        // Initial data loading
        // API calls
        // Setup operations
    }
    
    // Business logic methods
    async loadData() {
        this.Data.loading = true;
        this.updateUI(); // Trigger re-render
        
        try {
            const response = await Utils.fetchData('/api/endpoint');
            this.Data.items = response.data;
        } catch (error) {
            this.Data.errorMessage = error.message;
        } finally {
            this.Data.loading = false;
            this.updateUI();
        }
    }
    
    // Validation logic
    validateInput() {
        // Return true/false
        // Update this.Data.errorMessage if invalid
    }
    
    // Lifecycle - called when component unmounts
    onClosing() {
        // Cleanup
        // Cancel subscriptions
        // Clear timers
    }
}
```

### Component Structure

```javascript
// {ComponentName}.jsx
import React from 'react';
import * as cntrl from '../../xos-components';
import {ComponentName}VM from './{ComponentName}VM';

export default class {ComponentName} extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new {ComponentName}VM(props)); // ALWAYS bind ViewModel
    }
    
    render() {
        // ALWAYS access state from VM.Data
        const vm = this.VM;
        const { loading, items, errorMessage } = vm.Data;
        
        return (
            <cntrl.XOSControl 
                loading={loading}
                title="Component Title">
                <cntrl.XOSBody>
                    {/* Component content using XOS components */}
                </cntrl.XOSBody>
            </cntrl.XOSControl>
        );
    }
}
```

### Key Differences from Standard React

| React Pattern | XOS Pattern | Reason |
|--------------|-------------|---------|
| `extends Component` | `extends XOSComponent` | Enhanced lifecycle |
| `this.state` | `this.Data` in VM | Centralized state |
| `setState()` | `updateUI()` | Direct mutation allowed |
| `componentDidMount` | `onLoad()` | Simplified lifecycle |
| `useState` hook | Not used | Class-based only |
| Props drilling | Context navigation | Built-in communication |

## Component Development

### File Structure

```
components/
└── {ModuleType}/
    └── {ModuleCode}/
        ├── index.jsx           # Component file
        ├── {ModuleCode}VM.js   # ViewModel
        └── index.css           # Styles (optional)
```

### Module Naming Convention

Replace `{PROJECT}` with your project prefix:

- **{PROJECT}M{XXX}**: Master/Configuration modules
- **{PROJECT}T{XXX}**: Transaction modules
- **{PROJECT}R{XXX}**: Report modules

Example for project "ERP":
- `ERPM001`: User Management
- `ERPT001`: Sales Transaction
- `ERPR001`: Sales Report

### Development Checklist

#### Before Creating Component:
- [ ] Business requirement defined
- [ ] Module code assigned
- [ ] XOS components available

#### ViewModel Creation:
- [ ] File named `{ModuleCode}VM.js`
- [ ] Extends `VMBase`
- [ ] Constructor calls `super(props)`
- [ ] State initialized in `this.Data = {}`
- [ ] Business methods defined
- [ ] `updateUI()` called after state changes
- [ ] `onLoad()` implemented if needed
- [ ] `onClosing()` for cleanup

#### Component Creation:
- [ ] File named `index.jsx`
- [ ] Imports ViewModel
- [ ] Extends `cntrl.XOSComponent`
- [ ] Constructor binds ViewModel
- [ ] Render accesses `this.VM.Data`
- [ ] Uses XOS components

## State Management

### XOSStateManager Architecture

The state manager maintains a hierarchical tree structure:

```javascript
{
    id: 'component-id',
    state: {},           // Public state (VM.Data)
    internalState: {     // Private state
        vm: VMInstance,
        data: {}
    },
    children: []         // Child component states
}
```

### State Persistence

States are automatically preserved during:
- Tab switches
- Window navigation
- Component re-mounting

### Update Pattern

```javascript
// In ViewModel
handleChange(field, value) {
    this.Data[field] = value;  // Direct mutation
    this.updateUI();            // Trigger re-render
}
```

## API Integration

### Using ApiManager

```javascript
// In ViewModel
async saveData() {
    this.Data.loading = true;
    this.updateUI();
    
    Utils.ajax({
        url: '/api/save',
        method: 'POST',
        data: this.Data.formData
    }, (response) => {
        if (response.success) {
            this.Data.successMessage = 'Saved successfully';
        } else {
            this.Data.errorMessage = response.error;
        }
        this.Data.loading = false;
        this.updateUI();
    });
}
```

### Authentication

The framework handles JWT tokens automatically:
- Token storage in session
- Automatic refresh
- 401 handling with retry

## Component Reference

### Available XOS Components

The following components are exported from the xos-components library:

### Input Components

#### XOSTextbox
```javascript
<cntrl.XOSTextbox
    value={vm.Data.fieldValue}
    onChange={(e) => vm.handleChange('fieldValue', e.value)}
    inputType={cntrl.XOSTextboxTypes.textbox}
    mandatory={true}
    maxLength={100}
    placeholder="Enter value"
    ref={el => vm.inputRef = el}
/>
```

#### XOSSelect (Advanced Dropdown)
```javascript
<cntrl.XOSSelect
    dataSource={vm.Data.options}
    selectedItem={vm.Data.selectedOption}
    displayField="name"
    compareKey="id"
    onChange={(e, item) => vm.handleSelection(item)}
    placeholder="Select option"
    multiSelect={false}
    allowClear={true}
/>
```

#### XOSCombobox
```javascript
<cntrl.XOSCombobox
    dataSource={vm.Data.items}
    selectedValue={vm.Data.selectedValue}
    displayField="text"
    valueField="value"
    onChange={(e) => vm.handleComboChange(e)}
/>
```

#### XOSDropDown
```javascript
<cntrl.XOSDropDown
    items={vm.Data.dropdownItems}
    selectedItem={vm.Data.selectedItem}
    onSelect={(item) => vm.handleDropdownSelect(item)}
/>
```

#### XOSDatepicker
```javascript
<cntrl.XOSDatepicker
    value={vm.Data.dateValue}
    onChange={(e) => vm.handleDateChange(e.value)}
    format="DD/MM/YYYY"
    startDate={minDate}
    endDate={maxDate}
/>
```

#### XOSColorPicker
```javascript
<cntrl.XOSColorPicker
    value={vm.Data.color}
    onChange={(color) => vm.handleColorChange(color)}
/>
```

#### XOSFile
```javascript
<cntrl.XOSFile
    accept=".pdf,.doc,.docx"
    multiple={true}
    onChange={(files) => vm.handleFileUpload(files)}
/>
```

#### XOSCardInput (Credit Card Input)
```javascript
<cntrl.XOSCardInput
    cardNumber={vm.Data.cardNumber}
    onChange={(e) => vm.handleCardChange(e)}
/>
```

### Data Display Components

#### XOSGrid
```javascript
<cntrl.XOSGrid
    dataSource={vm.Data.gridData}
    columns={[
        { field: 'id', title: 'ID', width: 80 },
        { field: 'name', title: 'Name', width: 200 },
        { field: 'status', title: 'Status', width: 100 }
    ]}
    paging={true}
    pageInfo={{
        currentPage: vm.Data.currentPage,
        totalPages: vm.Data.totalPages,
        onPageChange: (e) => vm.loadPage(e.pageNo)
    }}
    onGridCellClick={(e) => vm.handleCellClick(e)}
/>
```

#### XOSTreeview
```javascript
<cntrl.XOSTreeview
    dataSource={vm.Data.treeData}
    onNodeClick={(node) => vm.handleNodeClick(node)}
    expandAll={false}
/>
```

#### XOSCalendar
```javascript
<cntrl.XOSCalendar
    selectedDate={vm.Data.selectedDate}
    onDateSelect={(date) => vm.handleDateSelect(date)}
    events={vm.Data.events}
/>
```

### Container Components

#### XOSControl (Main Window Container)
```javascript
<cntrl.XOSControl
    title="Module Title"
    loading={vm.Data.loading}
    showToaster={vm.Data.showToast}
    toasterConfig={{
        title: 'Success',
        message: vm.Data.toastMessage,
        type: 'success',
        duration: 3000
    }}
    panelButtons={[
        { text: 'Save', type: 'btn-primary', hotKey: 'S' },
        { text: 'Cancel', type: 'btn-secondary', hotKey: 'C' }
    ]}
    panelButtonHandler={(btn) => vm.handlePanelButton(btn)}
>
    <cntrl.XOSBody>
        {/* Content */}
    </cntrl.XOSBody>
</cntrl.XOSControl>
```

#### XOSContainer

**Purpose**: Application-level dynamic component loading and orchestration.

**❌ NOT for**: Individual component layout or wrapping existing components.

**✅ Use for**: 
- Dynamic component loading via URLs
- Application-level state management  
- Window/dialog management systems

```javascript
// ✅ CORRECT: App-level dynamic loading
<cntrl.XOSContainer
    url="Common/Login"
    context={{ parentID: 'APP', id: 'LOGIN_ID' }}
    data={{ User: userInfo }}
    className="col container-fluid h-100"
/>

// ❌ WRONG: Don't wrap individual components
<cntrl.XOSContainer>
    <MyComponent />  {/* Use simple div instead */}
</cntrl.XOSContainer>
```

**See**: `@claude_docs/frontend/xos-container-usage-guide.md` for detailed usage patterns.

#### XOSTab
```javascript
<cntrl.XOSTab
    ref={el => vm.tabRef = el}
    orientation="top"
    onTabChange={(tab) => vm.handleTabChange(tab)}
/>

// Add tab programmatically
vm.tabRef.addTab({
    title: 'Tab Title',
    key: 'unique-key',
    url: 'Module/Path',
    destroyOnHide: true,
    isClosable: true,
    data: { /* props */ }
});
```

### Rich Content Components

#### XOSEditor (Rich Text Editor)
```javascript
<cntrl.XOSEditor
    value={vm.Data.htmlContent}
    onChange={(content) => vm.handleContentChange(content)}
    height="400px"
/>
```

#### XOSIFrame
```javascript
<cntrl.XOSIFrame
    src={vm.Data.iframeUrl}
    width="100%"
    height="600px"
    onLoad={() => vm.handleIframeLoad()}
/>
```

### Utility Components

#### XOSOverlay
```javascript
<cntrl.XOSOverlay
    show={vm.Data.showOverlay}
    loading={true}
    text="Processing..."
/>
```

#### XOSToaster (Notifications)
```javascript
<cntrl.XOSToaster
    show={vm.Data.showToast}
    title="Notification"
    message="Operation completed"
    type="success" // success, error, warning, info
    duration={3000}
    onClose={() => vm.handleToastClose()}
/>
```

#### XOSTooltip
```javascript
<cntrl.XOSTooltip
    content="Helpful information"
    position="top"
>
    <button>Hover me</button>
</cntrl.XOSTooltip>
```

#### XOSButtonWrapper
```javascript
// Wraps existing button elements with XOS functionality
<cntrl.XOSButtonWrapper
    id="btn_save"
    formID={vm.formID}
    onClick={(e) => vm.handleClick(e)}
>
    <button className="btn-save">Save</button>
</cntrl.XOSButtonWrapper>
```

#### XOSLabel
```javascript
<cntrl.XOSLabel
    text="Field Label"
    mandatory={true}
    className="custom-label"
/>
```

#### XOSHorizontalScroller
```javascript
<cntrl.XOSHorizontalScroller>
    {/* Wide content that needs horizontal scrolling */}
</cntrl.XOSHorizontalScroller>
```

### Advanced Components

#### XOSPlaceSearch (Location Search)
```javascript
<cntrl.XOSPlaceSearch
    onPlaceSelect={(place) => vm.handlePlaceSelect(place)}
    placeholder="Search location..."
/>
```

#### XOSDateFlipper (Date Navigation)
```javascript
<cntrl.XOSDateFlipper
    currentDate={vm.Data.currentDate}
    onDateChange={(date) => vm.handleDateFlip(date)}
/>
```

#### XOSTabZoom (Tab Zoom Controls)
```javascript
<cntrl.XOSTabZoom
    onZoomIn={() => vm.handleZoomIn()}
    onZoomOut={() => vm.handleZoomOut()}
/>
```

#### XOSFullScreen
```javascript
<cntrl.XOSFullScreen
    onToggle={(isFullScreen) => vm.handleFullScreenToggle(isFullScreen)}
/>
```

### Async Loading

#### AsyncLoader
```javascript
<cntrl.AsyncLoader
    load={() => import('./LazyComponent')}
    fallback={<div>Loading...</div>}
/>
```

## Theming & Styling

### ⚠️ CRITICAL: Button Styling Issues

**ALWAYS use XOS button classes, NOT Bootstrap button classes!**

```javascript
// ❌ WRONG - Bootstrap classes
<button className="btn btn-primary">Save</button>

// ✅ CORRECT - XOS button classes
<button className="btn-save">Save</button>

// Or with XOSButtonWrapper for additional functionality
<cntrl.XOSButtonWrapper id="btn_save" formID={formID} onClick={handleSave}>
    <button className="btn-save">Save</button>
</cntrl.XOSButtonWrapper>
```

### XOS Button Classes

| XOS Class | Purpose | Color | Usage |
|-----------|---------|-------|-------|
| `btn-save` | Save operations | Green | Primary save actions |
| `btn-edit` | Edit operations | Blue | Modify/edit triggers |
| `btn-delete` | Delete operations | Red | Destructive actions |
| `btn-add` | Add/Create operations | Blue | New item creation |
| `btn-search` | Search operations | Default | Search triggers |
| `btn-clear` | Clear/Reset operations | Gray | Form resets |
| `btn-close-custom` | Close operations | Default | Modal/window close |
| `btn-primary` | Primary actions | Blue | Main actions |
| `btn-secondary` | Secondary actions | Gray | Alternative actions |

### Common Theming Issues & Solutions

#### Issue 1: Bootstrap Override Conflicts
```scss
// Problem: Bootstrap styles override XOS styles
// Solution: In your main SCSS, import XOS styles AFTER Bootstrap
@import 'bootstrap/scss/bootstrap';
@import '../xos-components/index.css'; // Must come after Bootstrap
```

#### Issue 2: Button Styling Not Applied
```javascript
// Problem: Using Bootstrap button classes
<button className="btn btn-primary">Click</button>

// Solution: Use XOS button classes
<button className="btn-save">Click</button>
```

#### Issue 3: Grid Styling Conflicts
```scss
// Add to your component CSS to fix grid issues
.xos-grid-container {
  // Override Bootstrap table styles
  .table {
    margin-bottom: 0;
  }
  
  // Fix Bootstrap border conflicts
  td, th {
    border-top: none !important;
  }
}
```

#### Issue 4: Modal Z-Index Issues
```scss
// XOS modals should appear above Bootstrap modals
.xos-control-modal {
  z-index: 1060 !important; // Higher than Bootstrap modal (1050)
}

.xos-overlay {
  z-index: 1055 !important; // Between Bootstrap modal and XOS modal
}
```

### SCSS Integration

#### Global Theme Variables
```scss
// _xos-theme-variables.scss
:root {
  // XOS Primary Colors
  --xos-primary: #007bff;
  --xos-secondary: #6c757d;
  --xos-success: #28a745;
  --xos-danger: #dc3545;
  --xos-warning: #ffc107;
  --xos-info: #17a2b8;
  
  // XOS Component Specific
  --xos-control-header-bg: #f8f9fa;
  --xos-control-border: #dee2e6;
  --xos-grid-header-bg: #e9ecef;
  --xos-tab-active-bg: #ffffff;
  --xos-tab-inactive-bg: #f8f9fa;
}
```

#### Component-Specific Styling
```scss
// Override XOS component styles
.xos-control {
  .xos-control-header {
    background: var(--xos-control-header-bg);
    border-bottom: 1px solid var(--xos-control-border);
  }
}

.xos-grid {
  // Custom grid styling
  .xos-grid-header {
    background: var(--xos-grid-header-bg);
  }
}
```

### Import Order (Critical!)

```javascript
// index.js or App.js
// 1. Bootstrap CSS (if using)
import 'bootstrap/dist/css/bootstrap.min.css';

// 2. XOS Components CSS (must come after Bootstrap)
import './xos-components/index.css';

// 3. Your custom theme overrides
import './styles/theme.scss';

// 4. Component-specific styles
import './components/styles.scss';
```

### Responsive Design with XOS

```scss
// XOS components responsive breakpoints
$xos-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);

// Responsive XOS grid
.xos-grid {
  @media (max-width: 768px) {
    // Mobile view adjustments
    .xos-grid-header {
      display: none; // Hide headers on mobile
    }
    
    .xos-grid-row {
      display: block; // Stack rows vertically
    }
  }
}
```

### Dark Mode Support

```scss
// Dark mode theme for XOS components
[data-theme="dark"] {
  --xos-control-bg: #1a1a1a;
  --xos-control-text: #ffffff;
  --xos-control-border: #333333;
  
  .xos-control {
    background: var(--xos-control-bg);
    color: var(--xos-control-text);
  }
  
  .xos-grid {
    background: #2a2a2a;
    
    tr:hover {
      background: #333333;
    }
  }
  
  .xos-textbox input {
    background: #2a2a2a;
    color: #ffffff;
    border-color: #444444;
  }
}
```

### Performance Optimization for Styles

```javascript
// Lazy load component styles
const loadComponentStyles = async (componentName) => {
  await import(`./xos-components/${componentName}/index.css`);
};

// Use with AsyncLoader
<cntrl.AsyncLoader
  load={async () => {
    await loadComponentStyles('XOSGrid');
    return import('./GridComponent');
  }}
/>
```

### Common CSS Conflicts Resolution

```scss
// Reset Bootstrap defaults that conflict with XOS
.xos-component-root {
  // Reset Bootstrap form styles
  .form-control {
    border-radius: 4px; // XOS standard
    box-shadow: none;
    
    &:focus {
      border-color: var(--xos-primary);
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
  }
  
  // Reset Bootstrap button styles
  .btn {
    border-radius: 4px;
    font-weight: normal;
    
    &:focus {
      box-shadow: none;
    }
  }
  
  // Fix Bootstrap table conflicts
  .table {
    margin: 0;
    
    td, th {
      padding: 8px;
      vertical-align: middle;
    }
  }
}
```

## Best Practices

### DO's ✅

1. **Always use MVVM pattern** - No exceptions
2. **Initialize all state in constructor** - Define structure upfront
3. **Call updateUI() after state changes** - Ensure re-renders
4. **Use lifecycle methods properly**:
   - `onLoad()` for initialization
   - `onClosing()` for cleanup
5. **Handle errors gracefully** - Always try/catch async operations
6. **Use XOS components** - Maintain consistency

### DON'Ts ❌

1. **Never use React hooks** - Class components only
2. **Never use setState** - Use updateUI() instead
3. **Never put business logic in components** - Keep in ViewModel
4. **Never manipulate DOM directly** - Use XOS methods
5. **Never skip ViewModel** - Even for simple components

### Common Patterns

#### Form Handling
```javascript
// ViewModel
handleFieldChange(fieldName, value) {
    this.Data.formData[fieldName] = value;
    this.validateField(fieldName);
    this.updateUI();
}

validateField(fieldName) {
    // Field-specific validation
    switch(fieldName) {
        case 'email':
            this.Data.errors[fieldName] = 
                !this.isValidEmail(this.Data.formData[fieldName]) 
                ? 'Invalid email' : '';
            break;
    }
}
```

#### Loading States
```javascript
// ViewModel
async performOperation() {
    this.Data.loading = true;
    this.Data.errorMessage = '';
    this.updateUI();
    
    try {
        const result = await this.apiCall();
        this.Data.result = result;
    } catch (error) {
        this.Data.errorMessage = error.message;
    } finally {
        this.Data.loading = false;
        this.updateUI();
    }
}
```

#### List Operations
```javascript
// ViewModel
addItem(item) {
    this.Data.items.push(item);
    this.updateUI();
}

removeItem(index) {
    this.Data.items.splice(index, 1);
    this.updateUI();
}

updateItem(index, updates) {
    Object.assign(this.Data.items[index], updates);
    this.updateUI();
}
```

## Migration Guide

### From Standard React to XOS

#### Step 1: Convert Functional to Class Component
```javascript
// Before (React)
function MyComponent({ data }) {
    const [state, setState] = useState({ loading: false });
    // ...
}

// After (XOS)
class MyComponent extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new MyComponentVM(props));
    }
    // ...
}
```

#### Step 2: Move State to ViewModel
```javascript
// Before (React)
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);

// After (XOS ViewModel)
this.Data = {
    loading: false,
    data: []
};
```

#### Step 3: Convert Hooks to Methods
```javascript
// Before (React)
useEffect(() => {
    loadData();
}, []);

// After (XOS ViewModel)
onLoad() {
    this.loadData();
}
```

#### Step 4: Update State Management
```javascript
// Before (React)
setState(prev => ({ ...prev, loading: true }));

// After (XOS ViewModel)
this.Data.loading = true;
this.updateUI();
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Component not updating | Missing `updateUI()` | Call `updateUI()` after state changes |
| State lost on navigation | Not using XOSStateManager | Ensure proper VM registration |
| Focus issues | Active/Inactive handling | Implement proper focus management |
| Memory leaks | Missing cleanup | Implement `onClosing()` method |
| API calls failing | Token expiry | Check ApiManager configuration |

### Debug Helpers

```javascript
// In ViewModel
debugState() {
    console.log('Current State:', JSON.stringify(this.Data, null, 2));
}

// Check component lifecycle
onLoad() {
    console.log('Component loaded:', this.constructor.name);
}

onClosing() {
    console.log('Component closing:', this.constructor.name);
}
```

## Project Customization

Replace these placeholders with your project specifics:
- `{PROJECT}` - Your project prefix (e.g., ERP, CRM, CVS)
- `{MODULE_CODE}` - Your module naming pattern
- `/api/endpoint` - Your API endpoints
- Port numbers - Your development ports

## Version Compatibility

- **React**: 18.2.0+
- **Bootstrap**: 5.1.3+
- **Node.js**: 16+
- **Browsers**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

---

*Last Updated: January 2025*
*Framework Version: XOS 2.0*