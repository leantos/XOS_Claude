# XOS Implementation Guide

## 🔴 CRITICAL: Exact Implementation Steps for XOS Components

**This section documents the EXACT steps to implement XOS components with 100% accuracy.**

### Prerequisites - MUST INSTALL
```bash
cd CVS_Claude.WebApi/UIPages
npm install react-color fast-sort --save
```
**Why**: XOSColorPicker requires `react-color` and XOSGrid requires `fast-sort`. Without these, compilation will fail.

### Step 1: Import XOS Components Correctly
```javascript
// ✅ CORRECT - Import all XOS components as 'cntrl'
import * as cntrl from '../../xos-components';

// ❌ WRONG - Don't import individual components
import { XOSComponent } from '../../xos-components/XOSComponent.js';
```

### Step 2: Extend XOSComponent Base Class
```javascript
// ✅ CORRECT
export class UserLogin extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new UserLoginVM(props));
    }
}

// ❌ WRONG
export class UserLogin extends XOSComponent {
```

### Step 3: Handle XOSTextbox Events Correctly
```javascript
// ✅ CORRECT - XOSTextbox passes {value} not event
handleUsernameChange(e) {
    this.VM.setUserName(e.value);  // e.value NOT e.target.value
}

// ❌ WRONG
handleUsernameChange(event) {
    this.VM.setUserName(event.target.value);  // Won't work with XOSTextbox
}
```

### Step 4: Use XOSTextbox with Proper Props
```javascript
// ✅ CORRECT Implementation
<cntrl.XOSTextbox
    ref={el => this.usernameInput = el}
    value={this.VM.userName}
    onChange={this.handleUsernameChange}
    placeholder="Enter your username"
    disabled={this.VM.isLoading}
    inputType={cntrl.XOSTextboxTypes.textbox}  // For regular text
    mandatory={true}
/>

// For password field
<cntrl.XOSTextbox
    ref={el => this.passwordInput = el}
    value={this.VM.password}
    onChange={this.handlePasswordChange}
    placeholder="Enter your password"
    disabled={this.VM.isLoading}
    inputType={cntrl.XOSTextboxTypes.password}  // For password
    mandatory={true}
/>
```

### Step 5: Use HTML Buttons with Bootstrap Classes
```javascript
// ✅ CORRECT - Use regular HTML button with Bootstrap classes
<button
    type="submit"
    className="btn btn-primary btn-lg"
    disabled={this.VM.isLoading}
>
    <i className="fa fa-sign-in-alt me-2"></i>
    Sign In
</button>

// ❌ WRONG - Don't look for XOSButton (it doesn't exist for UI)
```

### Step 6: Theme CSS Import - CRITICAL
```bash
# First, copy theme.css into src directory (React restriction)
cp D:\Projects\CVS_Claude\assets\css\theme.css D:\Projects\CVS_Claude\CVS_Claude.WebApi\UIPages\src\theme.css
```

Then in App.js:
```javascript
// App.js
import React from 'react';
import { UserLogin } from './components/UserLogin';
import './App.css';
import './theme.css';  // ✅ CORRECT - Import theme from src/

// ❌ WRONG - Can't import from outside src/
// import '../../../assets/css/theme.css';
```

### Step 7: Use FontAwesome Icons Correctly
```javascript
// ✅ CORRECT - Use 'fa' prefix
<i className="fa fa-user"></i>
<i className="fa fa-lock"></i>
<i className="fa fa-sign-in-alt"></i>

// ❌ WRONG - Don't use 'fas' prefix
<i className="fas fa-user"></i>
```

### Complete Working Example
```javascript
// index.jsx
import React from 'react';
import * as cntrl from '../../xos-components';
import { UserLoginVM } from './UserLoginVM.jsx';

export class UserLogin extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new UserLoginVM(props));
        this.state = {};
        
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.onLoad();
    }

    handleUsernameChange(e) {
        this.VM.setUserName(e.value);  // e.value, NOT e.target.value
    }

    handlePasswordChange(e) {
        this.VM.setPassword(e.value);  // e.value, NOT e.target.value
    }

    handleSubmit(event) {
        event.preventDefault();
        this.VM.login();
    }

    render() {
        return (
            <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="card shadow-lg border-0">
                    <div className="card-body p-5">
                        <h2 className="text-primary">Welcome Back</h2>
                        <form onSubmit={this.handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    <i className="fa fa-user me-2 text-primary"></i>
                                    Username
                                </label>
                                <cntrl.XOSTextbox
                                    ref={el => this.usernameInput = el}
                                    value={this.VM.userName}
                                    onChange={this.handleUsernameChange}
                                    placeholder="Enter your username"
                                    disabled={this.VM.isLoading}
                                    inputType={cntrl.XOSTextboxTypes.textbox}
                                    mandatory={true}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-semibold">
                                    <i className="fa fa-lock me-2 text-primary"></i>
                                    Password
                                </label>
                                <cntrl.XOSTextbox
                                    ref={el => this.passwordInput = el}
                                    value={this.VM.password}
                                    onChange={this.handlePasswordChange}
                                    placeholder="Enter your password"
                                    disabled={this.VM.isLoading}
                                    inputType={cntrl.XOSTextboxTypes.password}
                                    mandatory={true}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={this.VM.isLoading}
                            >
                                <i className="fa fa-sign-in-alt me-2"></i>
                                Sign In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}
```

## 🎨 UI Templates (Start Here!)

**⚠️ IMPORTANT: Use standardized templates for all new components**

Before creating any new UI component, consult the **[UI Templates Guide](./ui-templates-guide.md)** which provides:
- 4 standardized templates covering 95% of UI patterns
- Template selection criteria
- Step-by-step implementation instructions
- Complete working examples with ViewModels

### Quick Template Selection:
- **Master-Detail CRUD** (65% of forms) - Single record editing
- **Search/List Grid** (20% of forms) - Tabular data with search
- **Complex Workflow** (10% of forms) - Multi-step approvals
- **Report Parameters** (5% of forms) - Report generation

📁 **Template Files**: [`./ui-templates/`](./ui-templates/)

## Important: Async Pattern Convention

**⚠️ DO NOT USE async/await in frontend code**

This codebase uses a **callback-based pattern** for all asynchronous operations. Always use the `Utils.ajax()` method with success and error callbacks instead of async/await or promises.

```javascript
// ✅ CORRECT - Use callback pattern
Utils.ajax({
    url: 'endpoint',
    data: {}
}, (response) => {
    // Success handler
}, (error) => {
    // Error handler  
});

// ❌ INCORRECT - Do not use async/await
async function loadData() {
    const response = await fetch('endpoint');
    // ...
}
```

## Creating a New Module

### Basic Module Structure

Every module consists of two files:
1. **index.jsx** - View Component (UI)
2. **ModuleVM.js** - ViewModel (Business Logic)

### Step 1: Create the ViewModel

```javascript
// CustomerMasterVM.js
import { VMBase, Utils, XOSMessageboxTypes } from '../../../xos-components';

export default class CustomerMasterVM extends VMBase {
    constructor(props) {
        super(props);
        
        // Initialize state structure
        this.Data.Title = "Customer Master";
        this.Data.ShowLoading = false;
        this.Data.ShowToast = false;
        this.Data.ToastConfig = {};
        
        // Form data
        this.Data.Input = {
            CustomerID: '',
            Name: '',
            Email: '',
            Phone: '',
            Address: '',
            IsActive: true
        };
        
        // Dropdown/grid data sources
        this.Data.DataSource = {
            Countries: [],
            CustomerTypes: []
        };
        
        // Grid data
        this.Data.GridInfo = {
            Items: [],
            Page: 1,
            PageSize: 20,
            TotalPage: 0,
            TotalCount: 0,
            SelectedItem: null
        };
    }
    
    onLoad() {
        this.loadInitialData();
    }
    
    loadInitialData() {
        this.Data.ShowLoading = true;
        this.updateUI();
        
        Utils.ajax({
            url: 'Customer/GetInitialData',
            data: {}
        }, (response) => {
            this.Data.ShowLoading = false;
            this.Data.DataSource = response.DataSource;
            this.updateUI();
        });
    }
    
    onChange(field, value) {
        this.Data.Input[field] = value;
        this.updateUI();
    }
    
    onSaveClick() {
        if (!this.validate()) return;
        
        this.Data.ShowLoading = true;
        this.updateUI();
        
        Utils.ajax({
            url: 'Customer/Save',
            data: this.Data.Input
        }, (response) => {
            this.Data.ShowLoading = false;
            if (response.Success) {
                this.showSuccessToast('Customer saved successfully');
                this.close(response.Data);
            } else {
                this.showErrorMessage(response.Message);
            }
            this.updateUI();
        });
    }
    
    validate() {
        const { Input } = this.Data;
        
        if (Utils.isNullOrEmpty(Input.Name)) {
            this.showErrorMessage('Customer name is required');
            this.nameInput?.focus();
            return false;
        }
        
        if (!Utils.validateEmail(Input.Email)) {
            this.showErrorMessage('Invalid email address');
            this.emailInput?.focus();
            return false;
        }
        
        return true;
    }
    
    showSuccessToast(message) {
        this.Data.ShowToast = true;
        this.Data.ToastConfig = {
            title: 'Success',
            message: message,
            toasterType: 'success',
            onClose: () => {
                this.Data.ShowToast = false;
                this.updateUI();
            }
        };
        this.updateUI();
    }
    
    showErrorMessage(message) {
        this.showMessageBox({
            text: message,
            messageboxType: XOSMessageboxTypes.error
        });
    }
}
```

### Step 2: Create the View Component

```javascript
// index.jsx
import React from 'react';
import * as cntrl from '../../../xos-components';
import CustomerMasterVM from './CustomerMasterVM';

export default class CustomerMaster extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new CustomerMasterVM(props));
    }
    
    onLoad = () => {
        this.VM.onLoad();
    }
    
    onClosing = () => {
        // Return false to prevent closing
        if (this.VM.Data.IsDirty) {
            this.VM.showMessageBox({
                text: 'Unsaved changes. Close anyway?',
                messageboxType: cntrl.XOSMessageboxTypes.question,
                buttons: [
                    { text: "Yes", result: true },
                    { text: "No", result: false }
                ],
                onClose: (result) => {
                    if (result) this.close();
                }
            });
            return false;
        }
        return true;
    }
    
    render() {
        const vm = this.VM;
        const { Input, DataSource } = vm.Data;
        
        return (
            <cntrl.XOSControl
                className="modal-lg"
                loading={vm.Data.ShowLoading}
                title={vm.Data.Title}
                showToaster={vm.Data.ShowToast}
                toasterConfig={vm.Data.ToastConfig}
                onClose={this.onClosing}
                context={this.props.context}
            >
                <cntrl.XOSBody>
                    <div className="window-content-area p-3">
                        <div className="container-fluid">
                            <form autoComplete="off">
                                <div className="row">
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Customer Name
                                            <span className="text-danger">*</span>
                                        </label>
                                        <cntrl.XOSTextbox
                                            ref={el => vm.nameInput = el}
                                            value={Input.Name}
                                            onChange={(e) => vm.onChange("Name", e.value)}
                                            maxLength={100}
                                            mandatory
                                        />
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label">Email</label>
                                        <cntrl.XOSTextbox
                                            ref={el => vm.emailInput = el}
                                            value={Input.Email}
                                            onChange={(e) => vm.onChange("Email", e.value)}
                                            maxLength={150}
                                        />
                                    </div>
                                    
                                    <div className="col-md-6 mt-2">
                                        <label className="form-label">Customer Type</label>
                                        <cntrl.XOSSelect
                                            dataSource={DataSource.CustomerTypes}
                                            selectedItem={Input.CustomerType}
                                            onChange={(e) => vm.onChange("CustomerType", e.value)}
                                            displayField="Text"
                                            compareKey="ID"
                                            placeholder="Select type"
                                            allowClear={true}
                                        />
                                    </div>
                                    
                                    <div className="col-md-6 mt-2">
                                        <label className="form-label">Phone</label>
                                        <cntrl.XOSTextbox
                                            value={Input.Phone}
                                            onChange={(e) => vm.onChange("Phone", e.value)}
                                            inputType={cntrl.XOSTextboxTypes.numeric}
                                            maxLength={20}
                                        />
                                    </div>
                                    
                                    <div className="col-md-12 mt-2">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="chkActive"
                                                checked={Input.IsActive}
                                                onChange={(e) => vm.onChange("IsActive", e.target.checked)}
                                            />
                                            <label className="form-check-label" htmlFor="chkActive">
                                                Active
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </cntrl.XOSBody>
                
                <div className="window-button-area">
                    <div className="float-end me-2">
                        <button 
                            type="button" 
                            hot-key="S"
                            className="btn btn-sm btn-primary me-1"
                            onClick={() => vm.onSaveClick()}
                        >
                            <i className="fa fa-save me-1"></i>Save
                        </button>
                        <button 
                            type="button"
                            hot-key="C"
                            className="btn btn-sm btn-secondary"
                            onClick={() => vm.close()}
                        >
                            <i className="fa fa-close me-1"></i>Close
                        </button>
                    </div>
                </div>
            </cntrl.XOSControl>
        );
    }
}
```

## Common Implementation Patterns

### Form Handling Pattern

```javascript
// ViewModel
class FormVM extends VMBase {
    onChange(field, value) {
        this.Data.Input[field] = value;
        this.Data.IsDirty = true; // Track changes
        
        // Field-specific logic
        if (field === 'Country') {
            this.loadStates(value);
        }
        
        this.updateUI();
    }
    
    onSearchChange(field, value) {
        this.Data.SearchInput[field] = value;
        // Don't update UI for search fields to avoid re-render
    }
    
    clearForm() {
        this.Data.Input = this.getEmptyInput();
        this.Data.IsDirty = false;
        this.updateUI();
    }
    
    getEmptyInput() {
        return {
            ID: '',
            Name: '',
            Email: '',
            // ... other fields with default values
        };
    }
}
```

### Grid with Server-Side Pagination

```javascript
// ViewModel
loadGridData(pageNo = 1) {
    const { SearchInput } = this.Data;
    
    this.Data.ShowLoading = true;
    this.updateUI();
    
    Utils.ajax({
        url: 'Customer/GetGridData',
        data: {
            page: pageNo,
            pageSize: 20,
            searchName: SearchInput.Name,
            searchEmail: SearchInput.Email
        }
    }, (response) => {
        this.Data.ShowLoading = false;
        this.Data.GridInfo = {
            Items: response.Items,
            Page: response.Page,
            PageSize: response.PageSize,
            TotalPage: response.TotalPage,
            TotalCount: response.TotalCount,
            SelectedItem: null
        };
        this.updateUI();
    });
}

onGridCellDoubleClick = (e) => {
    this.loadRecord(e.rowData.ID);
}

onFilterSortChange = (columnOptions) => {
    // Handle server-side filtering/sorting
    this.Data.FilterSort = columnOptions;
    this.loadGridData(1);
}

// Component
renderGrid() {
    const { GridInfo } = this.VM.Data;
    
    return (
        <cntrl.XOSGrid
            dataSource={GridInfo.Items}
            columns={this.getColumns()}
            rowSelection={true}
            selectedItems={[GridInfo.SelectedItem]}
            paging={true}
            pageInfo={{
                currentPage: GridInfo.Page,
                totalPages: GridInfo.TotalPage,
                totalCount: GridInfo.TotalCount,
                onPageChange: (e) => this.VM.loadGridData(e.pageNo)
            }}
            onGridCellDoubleClick={this.VM.onGridCellDoubleClick}
            showFilter={true}
            externalFilter={true}
            externalSort={true}
            onFilterChange={(e) => this.VM.onFilterSortChange(e.columnOptions)}
            onSortChange={(e) => this.VM.onFilterSortChange(e.columnOptions)}
        />
    );
}

getColumns() {
    return [
        { field: 'Code', title: 'Code', width: 100 },
        { field: 'Name', title: 'Name', width: 200 },
        { field: 'Email', title: 'Email', width: 200 },
        { field: 'Status', title: 'Status', width: 100 }
    ];
}
```

### Master-Detail Pattern

```javascript
// Search and Grid on left, form on right
render() {
    return (
        <cntrl.XOSControl {...controlProps}>
            <cntrl.XOSBody>
                <div className="row">
                    {/* Left Panel - Search & Grid */}
                    <div className="col-md-5">
                        <div className="row">
                            <div className="col-md-6">
                                <label>Search Name</label>
                                <cntrl.XOSTextbox
                                    value={SearchInput.Name}
                                    onChange={(e) => vm.onSearchChange("Name", e.value)}
                                />
                            </div>
                            <div className="col-md-6">
                                <button onClick={() => vm.onSearchClick()}>
                                    Search
                                </button>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-12">
                                {this.renderGrid()}
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Panel - Form */}
                    <div className="col-md-7">
                        {this.renderForm()}
                    </div>
                </div>
            </cntrl.XOSBody>
        </cntrl.XOSControl>
    );
}
```

### Validation Patterns

```javascript
// Comprehensive validation
validate() {
    const { Input } = this.Data;
    const errors = [];
    
    // Required fields
    if (Utils.isNullOrEmpty(Input.Name)) {
        errors.push('Name is required');
        this.nameInput?.focus();
    }
    
    // Email validation
    if (Input.Email && !Utils.validateEmail(Input.Email)) {
        errors.push('Invalid email format');
    }
    
    // Phone validation
    if (Input.Phone && !this.validatePhone(Input.Phone)) {
        errors.push('Invalid phone number');
    }
    
    // Date validation
    if (Input.StartDate && Input.EndDate) {
        if (new Date(Input.StartDate) > new Date(Input.EndDate)) {
            errors.push('Start date cannot be after end date');
        }
    }
    
    // Show errors
    if (errors.length > 0) {
        this.showMessageBox({
            text: errors.join('\n'),
            messageboxType: XOSMessageboxTypes.error
        });
        return false;
    }
    
    return true;
}

validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}
```

### Loading States

```javascript
// Proper loading state management - USE CALLBACK PATTERN ONLY
loadData() {
    this.Data.ShowLoading = true;
    this.updateUI();
    
    Utils.ajax({
        url: 'YourEndpoint/GetData',
        data: {}
    }, 
    (response) => {
        // Success handler
        this.Data.ShowLoading = false;
        this.processResponse(response);
        this.updateUI();
    },
    (error) => {
        // Error handler
        this.Data.ShowLoading = false;
        this.handleError(error);
        this.updateUI();
    });
}

// Multiple concurrent loads
loadAllData() {
    this.Data.ShowLoading = true;
    this.updateUI();
    
    let completed = 0;
    const total = 3;
    
    const checkComplete = () => {
        completed++;
        if (completed === total) {
            this.Data.ShowLoading = false;
            this.updateUI();
        }
    };
    
    // Load in parallel
    this.loadCustomers(checkComplete);
    this.loadProducts(checkComplete);
    this.loadOrders(checkComplete);
}
```

### File Upload Pattern

```javascript
// ViewModel
onFileSelect(files) {
    this.Data.Files = files;
    this.Data.HasFiles = files.length > 0;
    this.updateUI();
}

uploadFiles() {
    if (this.Data.Files.length === 0) return;
    
    const formData = new FormData();
    for (let file of this.Data.Files) {
        formData.append('files', file);
    }
    formData.append('customerId', this.Data.Input.CustomerID);
    
    Utils.uploadFile({
        url: 'Customer/UploadFiles',
        data: formData
    }, (response) => {
        this.showSuccessToast('Files uploaded successfully');
        this.Data.Files = [];
        this.updateUI();
    });
}

// Component
<cntrl.XOSFile
    multiple={true}
    accept=".pdf,.doc,.docx,.jpg,.png"
    onChange={(files) => vm.onFileSelect(files)}
/>
```

### Workflow Integration

```javascript
// Handle workflow states
class WorkflowVM extends VMBase {
    constructor(props) {
        super(props);
        
        // Check workflow state from props
        this.Data.WorkflowState = props.data?.WorkflowState || 'Draft';
        this.Data.IsReadOnly = this.isReadOnlyState();
    }
    
    isReadOnlyState() {
        const readOnlyStates = ['Approved', 'Rejected', 'Submitted'];
        return readOnlyStates.includes(this.Data.WorkflowState);
    }
    
    onSubmitClick() {
        if (!this.validate()) return;
        
        this.Data.Input.WorkflowState = 'Submitted';
        this.save();
    }
    
    onApproveClick() {
        this.Data.Input.WorkflowState = 'Approved';
        this.Data.Input.ApprovedBy = this.getCurrentUser();
        this.Data.Input.ApprovedDate = new Date();
        this.save();
    }
    
    onRejectClick() {
        this.showMessageBox({
            text: 'Enter rejection reason:',
            inputType: 'textarea',
            onClose: (reason) => {
                if (reason) {
                    this.Data.Input.WorkflowState = 'Rejected';
                    this.Data.Input.RejectionReason = reason;
                    this.save();
                }
            }
        });
    }
}

// Component - conditional rendering
renderWorkflowButtons() {
    const { WorkflowState } = this.VM.Data;
    
    switch(WorkflowState) {
        case 'Draft':
            return (
                <>
                    <button onClick={() => vm.onSaveClick()}>Save Draft</button>
                    <button onClick={() => vm.onSubmitClick()}>Submit</button>
                </>
            );
        
        case 'Submitted':
            return (
                <>
                    <button onClick={() => vm.onApproveClick()}>Approve</button>
                    <button onClick={() => vm.onRejectClick()}>Reject</button>
                </>
            );
        
        case 'Approved':
        case 'Rejected':
            return <span>Status: {WorkflowState}</span>;
    }
}
```

### Tab Navigation

```javascript
// Opening child tabs from parent
openDetailTab(recordId) {
    this.addTab({
        title: `Customer #${recordId}`,
        key: `customer-${recordId}`,
        url: 'General/CustomerDetail',
        destroyOnHide: true,
        isClosable: true,
        data: {
            customerId: recordId,
            mode: 'edit'
        }
    });
}

// Receiving data from closed tab
openSearchTab() {
    this.showWindow({
        url: 'General/CustomerSearch',
        style: XOSWindowStyles.slideRight,
        data: { multiSelect: false },
        onClose: (result) => {
            if (result && result.selectedCustomer) {
                this.loadCustomer(result.selectedCustomer.ID);
            }
        }
    });
}
```

### Error Handling

```javascript
// Centralized error handling
handleApiError(error, context = '') {
    let message = 'An error occurred';
    
    if (error.response) {
        // Server responded with error
        message = error.response.Message || error.response.data?.message;
    } else if (error.request) {
        // No response received
        message = 'No response from server';
    } else {
        // Request setup error
        message = error.message;
    }
    
    this.showMessageBox({
        text: `${context}: ${message}`,
        messageboxType: XOSMessageboxTypes.error
    });
    
    // Log for debugging
    console.error(`API Error in ${context}:`, error);
}

// Usage
saveData() {
    Utils.ajax({
        url: 'Customer/Save',
        data: this.Data.Input
    }, 
    (response) => {
        // Success
    },
    (error) => {
        this.handleApiError(error, 'Save Customer');
    });
}
```

## Best Practices

1. **Always separate View and ViewModel logic**
2. **Initialize all state properties in constructor**
3. **Use refs for input focus management**
4. **Implement proper validation before save**
5. **Show loading states for async operations**
6. **Handle errors gracefully with user feedback**
7. **Track dirty state for unsaved changes warning**
8. **Use hot-keys for common actions**
9. **Implement proper cleanup in onClosing**
10. **Follow naming conventions (ModuleName + VM)**