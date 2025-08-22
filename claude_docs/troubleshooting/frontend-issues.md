# Frontend Issues & Solutions

This document tracks frontend-related issues encountered during XOS framework development and their solutions. Use this as a reference for XOS components, React patterns, and UI development.

## 🔴 CRITICAL: React Compilation Errors with XOS Components

### Issue: Module not found - react-color and fast-sort
**Error Messages:**
```
Module not found: Error: Can't resolve 'react-color' in 'XOSColorPicker'
Module not found: Error: Can't resolve 'fast-sort' in 'XOSGrid'
```
**Root Cause:** XOS components have dependencies that aren't installed by default
**Solution:** Install required dependencies BEFORE using XOS components
```bash
cd CVS_Claude.WebApi/UIPages
npm install react-color fast-sort --save
```
**Prevention:** Always install these packages when setting up a new XOS project

### Issue: Cannot import theme.css from outside src directory
**Error Message:**
```
Module not found: Error: You attempted to import ../../../assets/css/theme.css which falls outside of the project src/ directory
```
**Root Cause:** Create React App restricts imports to files within src/ directory
**Solution:** Copy theme.css into src/ directory
```bash
cp D:\Projects\CVS_Claude\assets\css\theme.css D:\Projects\CVS_Claude\CVS_Claude.WebApi\UIPages\src\theme.css
```
Then import in App.js:
```javascript
import './theme.css';
```
**Alternative:** Create a symlink in node_modules (not recommended)

### Issue: XOSTextbox onChange not working
**Symptoms:** Input value doesn't update when typing
**Root Cause:** XOSTextbox passes `{value}` object, not standard event
**Wrong Code:**
```javascript
handleChange(event) {
    this.setState({ value: event.target.value }); // Won't work!
}
```
**Correct Code:**
```javascript
handleChange(e) {
    this.setState({ value: e.value }); // e.value, not e.target.value
}
```
**Pattern:** Always use `e.value` with XOS components, not `e.target.value`

### Issue: XOSComponent not found after import
**Error:** `XOSComponent is not defined`
**Root Cause:** Incorrect import statement
**Wrong Import:**
```javascript
import { XOSComponent } from '../../xos-components/XOSComponent.js';
```
**Correct Import:**
```javascript
import * as cntrl from '../../xos-components';
// Then use: cntrl.XOSComponent
```
**Best Practice:** Always import XOS components as namespace (cntrl)

## XOS Component Issues

### Issue: XOS Component State Not Updating UI
**Symptoms:** UI doesn't reflect state changes after data modification
**Root Cause:** Forgot to call VM.updateUI() after state changes
**Solution:** Always call this.VM.updateUI() after modifying VM.Data
**Code Example:**
```javascript
// Correct pattern
this.VM.Data.Input.Name = "New Name";
this.VM.updateUI(); // Essential for XOS framework
```
**Applied In:** All XOS components

### Issue: XOS Components Not Loading Correctly
**Symptoms:** Components render as empty or show [object Object]
**Root Cause:** Component not properly extending XOSComponent base class
**Solution:** Ensure proper XOSComponent inheritance and constructor setup
**Code Example:**
```javascript
class CustomerMaster extends React.Component {
    constructor(props) {
        super(props);
        this.VM = new CustomerMasterVM(this);
        XOSComponent.call(this, props, this.VM);
    }
}
```
**Pattern:** Always follow XOS component inheritance pattern

### Issue: XOS ViewModels Not Initializing Data
**Symptoms:** VM.Data properties are undefined or null
**Root Cause:** Data not initialized in ViewModel constructor
**Solution:** Initialize all Data properties in VM constructor
**Code Example:**
```javascript
constructor(componentRef) {
    super(componentRef);
    this.Data = {
        Input: {
            ID: 0,
            Name: '',
            Email: ''
        },
        Output: {
            Items: [],
            TotalCount: 0
        }
    };
}
```
**Pattern:** Initialize complete data structure in VM constructor

## React & JSX Issues

### Issue: React Hooks Not Working in XOS Components
**Symptoms:** useState, useEffect not functioning as expected
**Root Cause:** XOS components use class-based approach, not functional components
**Solution:** Use XOS ViewModel pattern instead of React hooks
**Pattern:** Use VM.Data for state management instead of React hooks

### Issue: Event Handlers Not Working
**Symptoms:** Button clicks, form submissions not triggering
**Root Cause:** Event handlers not bound correctly or missing this context
**Solution:** Use arrow functions or bind event handlers properly
**Code Example:**
```javascript
// Correct binding
<button onClick={() => this.VM.handleSave()}>Save</button>
// or
<button onClick={this.VM.handleSave.bind(this.VM)}>Save</button>
```

### Issue: Component Re-rendering Issues
**Symptoms:** Components not updating when props change
**Root Cause:** Not implementing componentDidUpdate properly in XOS pattern
**Solution:** Implement proper lifecycle methods and use VM.updateUI()
**Pattern:** Use XOS lifecycle methods instead of React lifecycle

## XOS Framework-Specific Issues

### Issue: XOSGrid Not Displaying Data
**Symptoms:** Grid shows loading or empty state with valid data
**Root Cause:** Data not in expected format or columns not configured
**Solution:** Ensure data matches XOSGrid expected structure
**Code Example:**
```javascript
this.VM.Data.GridData = {
    Items: [
        { ID: 1, Name: "Item 1", Status: "Active" },
        { ID: 2, Name: "Item 2", Status: "Inactive" }
    ],
    TotalCount: 2
};
```

### Issue: XOSTextbox Validation Not Working
**Symptoms:** Invalid data accepted despite validation rules
**Root Cause:** Validation rules not properly configured
**Solution:** Set validation rules in textbox properties
**Code Example:**
```jsx
<XOSTextbox
    value={this.VM.Data.Input.Email}
    validation={{
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Valid email required"
    }}
/>
```

### Issue: XOSCombobox Options Not Loading
**Symptoms:** Dropdown shows empty or loading state
**Root Cause:** Options not provided in correct format
**Solution:** Format options as array of {value, text} objects
**Code Example:**
```javascript
this.VM.Data.ComboOptions = [
    { value: 1, text: "Option 1" },
    { value: 2, text: "Option 2" }
];
```

## API Integration Issues

### Issue: API Calls Not Working from Frontend
**Symptoms:** Network errors, CORS issues, or no response
**Root Cause:** Incorrect API endpoint URLs or CORS configuration
**Solution:** Verify API endpoints and CORS settings
**Code Example:**
```javascript
const response = await Utils.ajax({
    url: '/api/userlogin/getall',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

### Issue: Authentication Tokens Not Sent
**Symptoms:** 401 Unauthorized errors on authenticated endpoints
**Root Cause:** Authorization header not included in requests
**Solution:** Ensure token included in all authenticated requests
**Pattern:** Use Utils.ajax for consistent authentication header handling

### Issue: Large Payloads Causing UI Freeze
**Symptoms:** UI becomes unresponsive during large data operations
**Root Cause:** Synchronous processing of large datasets
**Solution:** Implement pagination and async processing
**Pattern:** Always paginate large datasets and show loading indicators

## Styling & CSS Issues

### Issue: XOS Components Not Styled Correctly
**Symptoms:** Components appear unstyled or have incorrect appearance
**Root Cause:** XOS stylesheet not loaded or incorrect CSS classes
**Solution:** Ensure XOS CSS files are imported and use correct class names
**Code Example:**
```javascript
import '../xos-components/index.css';
```

### Issue: Bootstrap Conflicts with XOS Styles
**Symptoms:** XOS components have incorrect styling when Bootstrap is present
**Root Cause:** CSS specificity conflicts
**Solution:** Load XOS styles after Bootstrap, or use CSS modules
**Pattern:** Manage CSS loading order to prevent conflicts

### Issue: Responsive Design Not Working
**Symptoms:** UI doesn't adapt to different screen sizes
**Root Cause:** Missing responsive CSS classes or viewport meta tag
**Solution:** Use Bootstrap responsive classes and ensure viewport meta tag
**Code Example:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Performance Issues

### Issue: Slow Component Rendering
**Symptoms:** Components take long time to load or update
**Root Cause:** Heavy operations in render methods or unnecessary re-renders
**Solution:** Move heavy operations to componentDidMount or useEffect equivalents
**Pattern:** Keep render methods lightweight, use memoization when needed

### Issue: Memory Leaks in XOS Components
**Symptoms:** Memory usage growing over time
**Root Cause:** Event listeners not cleaned up or intervals not cleared
**Solution:** Clean up resources in componentWillUnmount equivalent
**Code Example:**
```javascript
componentWillUnmount() {
    if (this.interval) {
        clearInterval(this.interval);
    }
    // Clean up other resources
}
```

## State Management Issues

### Issue: State Changes Not Persisting
**Symptoms:** UI state resets after navigation or page refresh
**Root Cause:** State only stored in component memory
**Solution:** Use XOSStateManager or localStorage for persistent state
**Code Example:**
```javascript
// Persist important state
XOSStateManager.setState('userPreferences', this.VM.Data.Preferences);
```

### Issue: State Synchronization Between Components
**Symptoms:** Components show inconsistent data
**Root Cause:** No shared state management
**Solution:** Use XOSStateManager for shared state or implement proper data flow
**Pattern:** Use centralized state management for shared data

## Form & Input Issues

### Issue: Form Validation Not Working
**Symptoms:** Invalid forms can be submitted
**Root Cause:** Validation not implemented or configured incorrectly
**Solution:** Implement comprehensive form validation in ViewModel
**Code Example:**
```javascript
validateForm() {
    const errors = [];
    if (!this.Data.Input.Name) {
        errors.push("Name is required");
    }
    if (!this.Data.Input.Email || !this.isValidEmail(this.Data.Input.Email)) {
        errors.push("Valid email is required");
    }
    return errors;
}
```

### Issue: File Upload Not Working
**Symptoms:** File selection or upload fails
**Root Cause:** Incorrect form encoding or file handling
**Solution:** Use proper form encoding and file handling
**Code Example:**
```jsx
<form encType="multipart/form-data">
    <input type="file" onChange={this.VM.handleFileSelect.bind(this.VM)} />
</form>
```

## Navigation & Routing Issues

### Issue: Navigation Not Working Properly
**Symptoms:** Page navigation fails or shows incorrect content
**Root Cause:** Incorrect route configuration or navigation methods
**Solution:** Use proper React Router patterns
**Code Example:**
```javascript
// Correct navigation
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/customer/edit/123');
```

### Issue: Browser Back Button Not Working
**Symptoms:** Back button doesn't work as expected in SPA
**Root Cause:** Not using proper browser history management
**Solution:** Use React Router's history management
**Pattern:** Let React Router handle browser history

## Testing Issues

### Issue: XOS Components Hard to Test
**Symptoms:** Unit tests failing or difficult to write
**Root Cause:** XOS components have complex dependencies
**Solution:** Mock XOS dependencies and use proper test setup
**Code Example:**
```javascript
// Mock XOS globals
global.XOSComponent = class {
    constructor(props, vm) {
        this.props = props;
        this.VM = vm;
    }
    updateUI() {
        this.forceUpdate();
    }
};
```

### Issue: Async Operations Not Testable
**Symptoms:** Tests fail due to timing issues
**Root Cause:** Async operations not properly awaited in tests
**Solution:** Use proper async/await patterns in tests
**Pattern:** Always await async operations in tests

---

## XOS-Specific Patterns

### Component Creation Pattern
1. Create Component class extending React.Component
2. Create ViewModel class extending VMBase
3. Initialize ViewModel in component constructor
4. Call XOSComponent constructor
5. Implement render method using VM.Data

### Data Flow Pattern
1. User interaction triggers VM method
2. VM method updates VM.Data
3. VM method calls this.updateUI()
4. Component re-renders with new data

### API Integration Pattern
1. Use Utils.ajax for all API calls
2. Handle loading states in VM
3. Update VM.Data with response
4. Call updateUI() after data changes

## How to Use This Guide

1. **Search for Symptoms:** Look for similar symptoms to your current issue
2. **Apply the Pattern:** Focus on the underlying pattern rather than exact code
3. **Test the Solution:** Verify the solution works in your specific context
4. **Update This Guide:** Add new issues you encounter and solve

## Contributing to This Guide

When adding new issues:
1. Focus on XOS framework-specific problems
2. Include code examples for complex solutions
3. Explain the underlying pattern for reuse
4. Reference XOS documentation when relevant