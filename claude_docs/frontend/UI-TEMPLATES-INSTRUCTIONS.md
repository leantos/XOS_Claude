# 📋 UI Templates Implementation Instructions

## ⚡ Quick Reference
**Templates Location**: `@claude_docs/frontend/ui-templates/`
**Coverage**: 95% of all UI patterns in CVS system
**Based on**: Analysis of 55+ production components

---

## 🎯 FOR CLAUDE CODE AND DEVELOPERS

### When Creating ANY New UI Component:

1. **ALWAYS START WITH A TEMPLATE** - Do not create UI components from scratch
2. **SELECT THE RIGHT TEMPLATE** using the decision tree below
3. **COPY AND CUSTOMIZE** - Never modify the template files directly
4. **FOLLOW THE PATTERNS** - Maintain consistency with existing components

---

## 🔍 Template Selection Decision Tree

```
New UI Component Required
│
├─> Is it a single record form?
│   └─> YES → Use MasterDetailCRUDTemplate (65% of cases)
│
├─> Is it a list/table with search?
│   └─> YES → Use SearchListGridTemplate (20% of cases)
│
├─> Does it have workflow/approval steps?
│   └─> YES → Use WorkflowFormTemplate (10% of cases)
│
└─> Is it for report generation?
    └─> YES → Use ReportParameterTemplate (5% of cases)
```

---

## 📚 Template Files Structure

```
@claude_docs/frontend/ui-templates/
├── MasterDetailCRUDTemplate/
│   ├── index.jsx                    # React component
│   └── MasterDetailCRUDTemplateVM.jsx   # ViewModel
├── SearchListGridTemplate/
│   ├── index.jsx
│   └── SearchListGridTemplateVM.jsx
├── WorkflowFormTemplate/
│   ├── index.jsx
│   └── WorkflowFormTemplateVM.jsx
├── ReportParameterTemplate/
│   ├── index.jsx
│   └── ReportParameterTemplateVM.jsx
└── README.md                        # Detailed documentation
```

---

## 🚀 Step-by-Step Implementation

### Step 1: Identify Component Type
```bash
# Component naming convention:
CVSM### - Master components (usually CRUD or Grid)
CVST### - Transaction components (usually Workflow or Grid)
CVSR### - Report components (usually Report Parameters)
```

### Step 2: Create Component Directory
```bash
# Example: Creating CVSM999 (Master component)
mkdir -p CVS.WebApi/UIPages/src/components/General/CVSM999
```

### Step 3: Copy Template Files
```bash
# Copy the appropriate template
# Example: Using MasterDetailCRUDTemplate

cp @claude_docs/frontend/ui-templates/MasterDetailCRUDTemplate/index.jsx \
   CVS.WebApi/UIPages/src/components/General/CVSM999/

cp @claude_docs/frontend/ui-templates/MasterDetailCRUDTemplate/MasterDetailCRUDTemplateVM.jsx \
   CVS.WebApi/UIPages/src/components/General/CVSM999/CVSM999VM.jsx
```

### Step 4: Rename and Update Imports

#### In index.jsx:
```javascript
// Change from:
import MasterDetailCRUDTemplateVM from './MasterDetailCRUDTemplateVM';
const MasterDetailCRUDTemplate = ({ onClose }) => {

// To:
import CVSM999VM from './CVSM999VM';
const CVSM999 = ({ onClose }) => {

// Update export:
export default CVSM999;
```

#### In CVSM999VM.jsx:
```javascript
// Change from:
export default class MasterDetailCRUDTemplateVM extends VMBase {

// To:
export default class CVSM999VM extends VMBase {
```

### Step 5: Configure API Endpoints
```javascript
// CVSM999VM.jsx
loadData() {
    Utils.ajax({
        url: '/api/your-specific-endpoint',  // Update this
        success: (response) => {
            if (response.success) {
                this.Data.SomeData = response.data;
            }
        }
    });
}
```

### Step 6: Customize Fields
```jsx
// Keep the standard layout structure, just modify fields:
<div className="row">
    <div className="col-md-6">
        <label>Your Custom Field <span className="text-danger">*</span></label>
        <cntrl.XOSTextbox
            value={vm.Data.Input.YourField}
            onChange={(e) => vm.Data.Input.YourField = e.target.value}
        />
    </div>
</div>
```

---

## ⚠️ CRITICAL RULES

### DO's ✅
- **DO** use Utils.ajax for API calls (NOT async/await)
- **DO** follow the two-column layout pattern for forms
- **DO** use standard button classes (btn-save1, btn-close1, etc.)
- **DO** implement proper validation with focus management
- **DO** use XOS components (XOSTextbox, XOSSelect, etc.)
- **DO** maintain the MVVM pattern (View/ViewModel separation)

### DON'Ts ❌
- **DON'T** modify template files directly
- **DON'T** use async/await or fetch API
- **DON'T** create new UI patterns without approval
- **DON'T** skip validation patterns
- **DON'T** use inline styles
- **DON'T** bypass the XOS component system

---

## 📊 Template Usage by Component Type

| Component Prefix | Primary Template | Secondary Template |
|-----------------|------------------|-------------------|
| CVSM (Masters) | MasterDetailCRUD (70%) | SearchListGrid (30%) |
| CVST (Transactions) | WorkflowForm (60%) | SearchListGrid (40%) |
| CVSR (Reports) | ReportParameter (90%) | SearchListGrid (10%) |

---

## 🔧 Common Customizations

### Adding a Grid to CRUD Form
```jsx
// Add after form fields in index.jsx
<div className="row mt-3">
    <div className="col-md-12">
        <cntrl.XOSGrid
            columns={vm.gridColumns}
            dataSource={vm.Data.GridData}
            pagination={true}
        />
    </div>
</div>
```

### Adding File Upload to Any Form
```jsx
// Copy from WorkflowFormTemplate
<input
    type="file"
    ref={(input) => vm.fileInput = input}
    onChange={vm.handleFileSelect}
    accept=".pdf,.doc,.docx"
/>
```

### Adding Date Range Quick Selects
```jsx
// Copy from ReportParameterTemplate
<button onClick={() => vm.setDateRange('thisMonth')}>
    This Month
</button>
```

---

## 🎨 Standard Patterns Reference

### Button Classes
```css
.btn-save1    → Save operations
.btn-close1   → Close/Cancel
.btn-add1     → New/Add
.btn-edit1    → Modify/Edit
.btn-search1  → Search
.btn-clear1   → Clear/Reset
```

### Layout Classes
```css
.window-content-area p-3  → Main content area
.window-button-area       → Footer buttons
.modal-sm/md/xl          → Window sizes
.col-md-6                → Two-column layout
.col-md-4                → Three-column layout
```

---

## 📝 Validation Template
```javascript
// Standard validation pattern (copy and modify)
isValidSave() {
    // Required field check
    if (Utils.isNullOrEmpty(this.Data.Input.RequiredField)) {
        this.showMessageBox({
            text: 'Field is required',
            title: 'Validation Error',
            icon: 'warning',
            onClose: () => {
                if (this.fieldRef) this.fieldRef.focus();
            }
        });
        return false;
    }
    
    // Email validation
    if (!Utils.isValidEmail(this.Data.Input.Email)) {
        // ...
    }
    
    // Custom validation
    if (this.Data.Input.Value < 0) {
        // ...
    }
    
    return true;
}
```

---

## 🔄 API Call Template
```javascript
// Standard API pattern (NEVER use async/await)
performAction() {
    this.Data.ShowLoading = true;
    
    Utils.ajax({
        url: '/api/endpoint',
        method: 'POST',
        data: {
            param1: this.Data.Input.Field1,
            param2: this.Data.Input.Field2
        },
        success: (response) => {
            if (response.success) {
                this.showToast({
                    text: 'Action completed successfully',
                    type: 'success'
                });
                // Handle success
            } else {
                this.showMessageBox({
                    text: response.message,
                    title: 'Error',
                    icon: 'error'
                });
            }
        },
        error: (error) => {
            this.handleError(error);
        },
        complete: () => {
            this.Data.ShowLoading = false;
        }
    });
}
```

---

## 🆘 Troubleshooting

### Issue: Component not rendering
- Check ViewModel class name matches import
- Verify XOS component imports
- Check for console errors

### Issue: API calls failing
- Ensure using Utils.ajax (not fetch/async)
- Check API endpoint URL
- Verify authentication token

### Issue: Validation not working
- Ensure refs are properly set
- Check Utils.isNullOrEmpty import
- Verify focus() method on input refs

---

## 📞 Support & Resources

1. **Templates Documentation**: `@claude_docs/frontend/ui-templates/README.md`
2. **XOS Components Guide**: `@claude_docs/frontend/xos-components-documentation.md`
3. **Frontend Blueprint**: `@claude_docs/frontend/frontend-blueprint.md`
4. **Implementation Guide**: `@claude_docs/frontend/implementation-guide.md`

---

## ✅ Pre-Deployment Checklist

Before deploying any new component:

- [ ] Used appropriate template as starting point
- [ ] Followed component naming convention (CVSM/CVST/CVSR)
- [ ] Updated all class names and imports
- [ ] Configured correct API endpoints
- [ ] Implemented proper validation
- [ ] Used Utils.ajax for all API calls
- [ ] Tested loading states
- [ ] Verified error handling
- [ ] Checked responsive layout
- [ ] Implemented dispose() method
- [ ] No async/await used
- [ ] No custom patterns introduced

---

*Remember: Consistency is key. These templates represent proven patterns used across 55+ production components. Following them ensures maintainability and reduces bugs.*