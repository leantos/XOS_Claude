# XOS Button Implementation Guide

## 🚨 CRITICAL UNDERSTANDING: There is NO XOSButton Component!

**XOSButtonWrapper is NOT a visual component** - it's only an authentication wrapper. The app uses regular HTML `<button>` elements with Bootstrap classes + custom theme colors.

## ✅ CORRECT Button Implementation

**STANDARD PATTERN**: Use HTML buttons with Bootstrap classes:
```jsx
// Most common pattern in actual codebase
<button 
    type="button" 
    className="btn btn-sm btn-primary"
    onClick={() => vm.handleClick()}
>
    <i className="fa fa-search me-1"></i>Search
</button>

// Alternative with custom suffixed classes (also used)
<button 
    type="button" 
    className="btn btn-sm btn-search1 btn-primary"
    onClick={() => vm.handleClick()}
>
    <i className="fa fa-search"></i> Search
</button>
```

**USE XOSButtonWrapper ONLY for authentication**:
```jsx
// Only when you need user authentication validation
<cntrl.XOSButtonWrapper 
    id="btn_save" 
    formID="CVSM001" 
    onClick={vm.handleSave}
>
    <button className="btn btn-sm btn-primary">
        <i className="fa fa-save"></i> Save
    </button>
</cntrl.XOSButtonWrapper>
```

## Real Button Patterns from Actual Code

### Standard Bootstrap Classes (Primary Pattern)
```jsx
// Save operations
<button type="button" className="btn btn-sm btn-primary me-1" onClick={vm.save}>
    <i className="fa fa-floppy-disk" aria-hidden="true"></i> Save
</button>

// Search operations  
<button type="button" className="btn btn-sm btn_icon btn-primary" onClick={vm.search}>
    <i className="fa fa-search"></i>
</button>

// Clear operations
<button type="button" className="btn btn-sm btn_icon btn-primary ms-1" onClick={vm.clear}>
    <i className="fa fa-refresh"></i>
</button>

// Delete operations
<button type="button" className="btn btn-sm btn-primary me-1" onClick={vm.delete}>
    <i className="fa fa-trash"></i> Delete  
</button>

// Close operations
<button type="button" className="btn btn-sm btn-primary me-1" onClick={vm.close}>
    <i className="fa fa-close"></i> Close
</button>
```

### Suffixed Classes (Alternative Pattern)
```jsx
// These classes exist in the codebase alongside btn-primary
<button className="btn btn-sm btn-save1 btn-primary me-1">Save</button>
<button className="btn btn-sm btn-search1 btn-primary">Search</button>
<button className="btn btn-sm btn-delete1 btn-primary me-1">Delete</button>
<button className="btn btn-sm btn-clear1 btn-primary">Clear</button>
<button className="btn btn-sm btn-close1 btn-primary me-1">Close</button>
```

### Icon Usage (FontAwesome)
All buttons use FontAwesome icons, NOT Bootstrap Icons:
```jsx
// Correct icon usage
<i className="fa fa-save"></i>         // Save
<i className="fa fa-search"></i>       // Search  
<i className="fa fa-refresh"></i>      // Refresh
<i className="fa fa-close"></i>        // Close
<i className="fa fa-floppy-disk"></i>  // Save (alternative)
<i className="fa fa-trash"></i>        // Delete
```

## Bootstrap Theme Integration

The styling comes from Bootstrap 5 + custom theme variables in `theme.scss`:

### Theme Colors (theme.scss)
```scss
$theme-color-primary: #222831 !default;  // Dark blue-gray

$theme-colors: (
  "primary": $theme-color-primary,
  "save": $theme-color-primary,
  "edit": $theme-color-primary, 
  "delete": $theme-color-primary,
  "search": $theme-color-primary,
  "clear": $theme-color-primary,
  // etc...
);
```

### Button Sizes (Standard Bootstrap)
All sizes use standard Bootstrap:
```jsx
<button className="btn btn-sm btn-primary">Small (most common)</button>
<button className="btn btn-primary">Default</button>  
<button className="btn btn-lg btn-primary">Large</button>
```

### Hot Keys Support
Buttons support keyboard shortcuts via `hot-key` attribute:
```jsx
<button 
    type="button"
    hot-key="S" 
    className="btn btn-sm btn-primary"
    onClick={vm.save}
>
    <i className="fa fa-save"></i> Save (Alt+S)
</button>
```

## Reality vs Documentation

| What Documentation Says | What Actually Exists | What To Use |
|-------------------------|---------------------|-------------|
| `btn-save` | `btn-save1 btn-primary` | `btn btn-sm btn-primary` |
| `btn-edit` | `btn-edit1 btn-primary` | `btn btn-sm btn-primary` |
| `btn-delete` | `btn-delete1 btn-primary` | `btn btn-sm btn-primary` |
| `btn-search` | `btn-search1 btn-primary` | `btn btn-sm btn-primary` |
| `btn-clear` | `btn-clear1 btn-primary` | `btn btn-sm btn-primary` |
| `XOSButton component` | **DOES NOT EXIST** | Regular `<button>` elements |

## Real Footer Button Pattern

From actual component code (CVST072, GENMADT, etc.):
```jsx
renderFooterButtons() {
    const vm = this.VM;
    
    return (
        <div className="modal-footer">
            <button 
                type="button" 
                id="btn_save" 
                hot-key="S" 
                className="btn btn-sm btn-primary me-1" 
                onClick={() => vm.Save()}
            >
                <i className="fa fa-floppy-disk" aria-hidden="true"></i> Save
            </button>
            
            <button 
                type="button" 
                id="btn_close" 
                hot-key="C" 
                className="btn btn-sm btn-primary" 
                onClick={() => vm.Close()}
            >
                <i className="fa fa-close"></i> Close
            </button>
        </div>
    );
}
```

## Search Bar Pattern

From actual component code (CVST005, CVST035):
```jsx
<div className="col d-flex align-items-end">
    <button 
        type="button" 
        id="btn_search" 
        hot-key="H" 
        className="btn btn-sm btn_icon btn-primary" 
        onClick={() => vm.onSearchClick()}
    >
        <i className="fa fa-search"></i>
    </button>
    
    <button 
        type="button" 
        id="btn_clear" 
        hot-key="L" 
        className="btn btn-sm btn_icon btn-primary ms-1" 
        onClick={() => vm.onSearchClearClick()}
    >
        <i className="fa fa-refresh"></i>
    </button>
</div>
```

## Grid Action Buttons

From actual transaction components:
```jsx
<button 
    type="button"
    className="btn btn-sm btn-delete1 btn-primary me-1"
    onClick={() => vm.deleteItem(item)}
>
    <i className="fa fa-trash"></i> Delete
</button>
```

## How Styling Actually Works

The styling comes from Bootstrap 5 + SCSS theme customization:

### 1. Bootstrap Foundation
```scss
// In src/scss/theme.scss
@import "../../node_modules/bootstrap/scss/bootstrap.scss";
```

### 2. Theme Color Overrides
```scss  
$theme-color-primary: #222831 !default;  // Dark blue-gray

$theme-colors: (
  "primary": $theme-color-primary,
  "save": $theme-color-primary,     // Custom extensions
  "edit": $theme-color-primary,
  "delete": $theme-color-primary,
  "search": $theme-color-primary,
  "clear": $theme-color-primary,
  // ...more
);
```

### 3. Compiled CSS Classes
Bootstrap generates these classes from the theme:
- `btn-primary` (main class used everywhere)
- `btn-save`, `btn-edit`, etc. (available but not commonly used)
- `btn-save1`, `btn-edit1`, etc. (suffixed variants found in code)

## DO's and DON'Ts

### ✅ DO:
- Use `btn btn-sm btn-primary` for all buttons
- Include FontAwesome icons: `<i className="fa fa-save"></i>`
- Use `XOSButtonWrapper` ONLY for authentication
- Add `hot-key` attributes for keyboard shortcuts  
- Use `type="button"` to prevent form submission

### ❌ DON'T:
- Look for an `XOSButton` component (doesn't exist!)
- Use Bootstrap Icons - use FontAwesome (`fa fa-*`)
- Use `XOSButtonWrapper` for styling (it's for auth only)
- Mix button class combinations without `btn-primary`

## Summary

**The app uses regular HTML buttons styled with Bootstrap 5 + custom theme colors. There is no special XOS button component for UI - only an authentication wrapper.**

---

Last Updated: 2025-08-20