# Bootstrap 5 Integration in CVS Frontend

## Overview

The CVS frontend uses **Bootstrap 5** as its foundation with custom SCSS theme overrides. This creates a consistent design system while maintaining Bootstrap's component ecosystem.

## Architecture

### 1. Bootstrap Foundation
```scss
// In src/scss/theme.scss - Bootstrap is imported first
@import "../../node_modules/bootstrap/scss/bootstrap.scss";
```

### 2. Custom Theme Variables
```scss
// Primary color override
$theme-color-primary: #222831 !default;  // Dark blue-gray

// Extended color palette
$theme-colors: (
  "primary": $theme-color-primary,
  "secondary": #6c757d,
  "success": #198754,
  "info": #0dcaf0,
  "warning": #ffc107,
  "danger": #dc3545,
  
  // Custom XOS extensions
  "save": $theme-color-primary,
  "edit": $theme-color-primary,
  "delete": $theme-color-primary,
  "search": $theme-color-primary,
  "clear": $theme-color-primary,
  "add": $theme-color-primary,
  "close": $theme-color-primary,
  "audit": $theme-color-primary,
  "copy": $theme-color-primary,
  // ...more custom colors
);
```

### 3. Typography & Spacing
```scss
// Font family
$font-family-sans: 'Nunito Sans', sans-serif;
$font-family-base: $font-family-sans !default;
$font-size-base: 0.9rem !default;

// Button & Input spacing
$input-btn-padding-y: .275rem !default;
$input-btn-padding-x: .75rem !default;
$input-btn-padding-y-sm: .25rem !default;
$input-btn-padding-x-sm: .5rem !default;

// Form spacing
$form-label-margin-bottom: .125rem !default;
```

## Component Integration

### HTML Structure
```html
<!-- In public/index.html -->
<!DOCTYPE html>
<html lang="en" data-bs-theme="auto" class="">
<head>
  <!-- FontAwesome for icons -->
  <link href="%PUBLIC_URL%/fontawesome-free-5.15.4-web/css/all.css" rel="stylesheet">
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/.../Nunito+Sans..." rel="stylesheet">
</head>
<body>
  <!-- Bootstrap theme class applied to root -->
  <div id="root" class="d-flex flex-column m-0 p-0 xenia-skyliteblue fixed-app h-100"></div>
</body>
</html>
```

### JavaScript Imports
```javascript
// In src/App.js - Bootstrap JS imported
import './../node_modules/bootstrap/dist/js/bootstrap';
```

## Generated CSS Classes

Bootstrap generates utility classes from the custom theme:

### Button Classes Available
- `btn-primary` ✅ (most commonly used)
- `btn-save` ✅ (from theme extension)
- `btn-edit` ✅ (from theme extension)
- `btn-delete` ✅ (from theme extension)
- `btn-search` ✅ (from theme extension)
- `btn-clear` ✅ (from theme extension)

### Actual Usage Patterns
```jsx
// Standard pattern (most common)
<button className="btn btn-sm btn-primary">Action</button>

// Extended theme pattern (less common)
<button className="btn btn-sm btn-save">Save</button>

// Suffixed pattern (found in legacy code)  
<button className="btn btn-sm btn-save1 btn-primary">Save</button>
```

## Theme Classes

### Root Theme Application
The app uses theme classes on the root element:
```html
<div id="root" class="xenia-skyliteblue">
  <!-- All content inherits theme colors -->
</div>
```

### Available Themes
From `$theme-classes` in theme.scss:
```scss
$theme-classes: (
  "skyliteblue": "primary"  // Maps to primary color scheme
);
```

### XOS-Specific Theme Styles
```scss
// Applied to .xenia-skyliteblue elements
.xenia-skyliteblue {
  .xos-header {
    background-color: #{$theme-color-primary}10; // 10% opacity
    color: $theme-color-primary;
    
    .xos-active {
      background-color: $theme-color-primary;
      color: #FFF;
    }
  }
  
  .xos-container .window-header {
    border-color: $theme-color-primary;
  }
  
  // Form controls theme
  .form-control .switch-control span.active {
    background-color: $theme-color-primary;
    color: #FFF;
  }
}
```

## Font Integration

### Primary Font Stack
```scss
$font-family-sans: 'Nunito Sans', sans-serif;
```

### Icon System
- **FontAwesome 5.15.4** for all icons
- **NOT Bootstrap Icons** - documentation was incorrect
- Loaded from local files: `/public/fontawesome-free-5.15.4-web/`

### Icon Usage
```jsx
// Correct FontAwesome usage
<i className="fa fa-save"></i>
<i className="fa fa-search"></i>
<i className="fa fa-trash"></i>
<i className="fa fa-close"></i>

// NOT Bootstrap Icons (incorrect)
<i className="bi bi-save"></i>  // ❌ Wrong
```

## Responsive Breakpoints

Uses standard Bootstrap 5 breakpoints with custom modal sizes:

```css
/* Custom modal breakpoints in App.css */
@media (min-width: 576px) {
  .modal-xs { max-width: 300px; }
}

@media (min-width: 768px) {
  .modal-sm { max-width: 500px; }
}

@media (min-width: 992px) {
  .modal-md { max-width: 800px; }
}

@media (min-width: 1200px) {
  .modal-lg { max-width: 1140px; }
  .modal-xl { max-width: 1940px; }
}
```

## Build Process

### SCSS Compilation
```javascript
// Bootstrap is compiled from SCSS with custom variables
// Process: theme.scss → Bootstrap SCSS → Compiled CSS
// Custom variables override Bootstrap defaults before compilation
```

### CSS Loading Order
1. Bootstrap base styles (from theme.scss)
2. Custom theme overrides (theme.scss)
3. XOS component styles (xos-components/index.css)
4. App-specific styles (App.css)

## Component-Level Integration

### XOS Components
XOS components leverage Bootstrap classes internally:
```jsx
// XOSTextbox renders with Bootstrap form-control
<XOSTextbox /> // → <input className="form-control" />

// XOSSelect uses Bootstrap dropdowns  
<XOSSelect /> // → Bootstrap dropdown structure

// XOSGrid uses Bootstrap table classes
<XOSGrid /> // → <table className="table table-custom">
```

### Layout Classes
Standard Bootstrap utilities are used throughout:
```jsx
<div className="container-fluid">
  <div className="row">
    <div className="col-md-6">
      <div className="d-flex align-items-center">
        <button className="btn btn-sm btn-primary me-2">
```

## Best Practices

### ✅ DO:
- Use Bootstrap 5 classes directly: `btn btn-sm btn-primary`
- Leverage Bootstrap utilities: `d-flex`, `me-2`, `col-md-6`
- Use FontAwesome icons: `fa fa-save`
- Follow Bootstrap responsive patterns
- Use theme colors via CSS custom properties

### ❌ DON'T:
- Mix Bootstrap versions (app uses Bootstrap 5 only)
- Use Bootstrap Icons (app uses FontAwesome)
- Override Bootstrap classes directly (use theme variables)
- Create custom CSS when Bootstrap utilities exist

## Debugging Theme Issues

### Common Problems:
1. **Button styles not appearing**: Check if `btn-primary` is included
2. **Theme colors wrong**: Verify theme class on root element
3. **Icons not showing**: Ensure FontAwesome CSS is loaded
4. **Spacing issues**: Use Bootstrap utility classes (`me-2`, `mb-3`, etc.)

### Inspector Tips:
```css
/* Look for these classes in DevTools */
.xenia-skyliteblue /* Theme wrapper */
.btn-primary       /* Button styling */
.fa               /* FontAwesome icons */
```

---

**Summary**: The app uses Bootstrap 5 as its foundation with custom SCSS theme variables. All styling should leverage Bootstrap classes with the custom theme colors, not custom CSS frameworks.