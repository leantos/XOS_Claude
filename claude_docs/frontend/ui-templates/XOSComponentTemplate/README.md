# XOS Component Template

## Purpose
This is a working template for XOS framework components that follows all correct patterns to avoid common issues like:
- "Cannot set property Data" errors
- Inputs not accepting keyboard input  
- Components not re-rendering

## Files
- `index.jsx` - Component view with proper XOS patterns
- `ComponentVM.jsx` - ViewModel with correct Data initialization
- `Component.test.jsx` - Test suite for XOS components

## Usage

1. Copy this template folder to your component location
2. Rename files and classes to match your component name
3. Update the Data properties in ViewModel init()
4. Add your UI elements following the patterns shown
5. Run tests to verify functionality

## Key Patterns Demonstrated

### ViewModel Initialization
```javascript
init() {
    const model = this.Data;  // Get reference
    model.prop = value;       // Set on reference
}
```

### Event Handler Pattern
```javascript
handleInputChange = (e) => {
    if (this.VM) {
        const model = this.VM.Data;
        model[e.name] = e.value;
        this.VM.updateUI();
    }
};
```

### XOSTextbox Usage
```javascript
<cntrl.XOSTextbox
    name="fieldName"
    value={this.VM.Data.fieldName || ''}
    onChange={this.handleInputChange}
/>
```

## Testing
Run tests with:
```bash
npm test ComponentTemplate
```

## Customization Checklist
- [ ] Rename all "ComponentTemplate" to your component name
- [ ] Update Data properties in ViewModel init()
- [ ] Add your specific UI elements
- [ ] Update test cases for your functionality
- [ ] Add validation logic if needed
- [ ] Implement API calls in ViewModel
- [ ] Add loading states and error handling

## Common Modifications

### Adding a new field
1. Add to ViewModel init():
```javascript
model.newField = '';
```

2. Add XOSTextbox in render():
```javascript
<cntrl.XOSTextbox
    name="newField"
    value={this.VM.Data.newField || ''}
    onChange={this.handleInputChange}
/>
```

### Adding validation
```javascript
validateForm() {
    const model = this.Data;
    if (!model.requiredField) {
        return 'Field is required';
    }
    return null;
}
```

### Adding API call
```javascript
async loadData() {
    const model = this.Data;
    model.isLoading = true;
    this.updateUI();
    
    try {
        const response = await Utils.ajax({
            url: '/api/endpoint',
            data: {}
        });
        model.data = response;
    } finally {
        model.isLoading = false;
        this.updateUI();
    }
}
```

## Troubleshooting
- If inputs don't work: Check name prop and updateUI() call
- If Data errors: Check ViewModel init() pattern
- If not re-rendering: Ensure updateUI() is called