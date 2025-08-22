# Asset Structure Documentation

## 📁 Project Asset Organization

This document details where all frontend assets (XOS components, themes, fonts, styles) are stored in the project structure. For the complete project structure, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## 🎨 XOS Components Location

### Primary Location
```
{ProjectName}.WebApi/UIPages/src/xos-components/
```

### XOS Component Library Structure
```
xos-components/
├── Core/                      # Core Framework Files
│   ├── ApiManager.js         # API communication layer
│   ├── SessionManager.js     # Session handling
│   ├── SignalRManager.js     # Real-time communication
│   └── WebStorageStateStore.js # State persistence
├── Utils/                     # Utility Functions
│   ├── Utils.js              # General utilities
│   ├── DOMUtil.js           # DOM manipulation
│   ├── xos.linq.js          # LINQ-like array operations
│   └── xos.domext.js        # DOM extensions
├── XOSComponent.js           # Base component class
├── VMBase.js                 # ViewModel base class
├── XOSStateManager.js        # State management
└── [Individual Components]/  # Component folders
    ├── XOSGrid/
    ├── XOSTextbox/
    ├── XOSSelect/
    ├── XOSDatepicker/
    ├── XOSCalendar/
    ├── XOSControl/
    ├── XOSTab/
    ├── XOSTreeview/
    ├── XOSEditor/
    ├── XOSOverlay/
    ├── XOSToaster/
    ├── XOSAlert/
    └── ... (25+ components)
```

### Component File Pattern
Each XOS component typically contains:
```
XOS{ComponentName}/
├── index.js          # Main component logic
├── index.css         # Component-specific styles
└── images/           # Component assets (if needed)
```

## 🎨 Themes & Styles Location

### SCSS Source Files
```
{ProjectName}.WebApi/UIPages/src/scss/
├── theme.scss                 # Main theme file
├── mixins/
│   └── _theme.scss           # Theme mixins
├── _animate.scss             # Animation definitions
├── _base-layout.scss         # Base layout styles
├── _shadow_alt.scss          # Shadow utilities
├── _xoscontrols.scss         # XOS control styles
├── _xoselect.scss            # Select component styles
├── _wc_calendar.scss         # Calendar styles
├── _witgrid.scss             # Grid styles
└── _wittree.scss             # Tree component styles
```

### Compiled CSS
```
{ProjectName}.WebApi/UIPages/src/assets/css/
├── theme.css                  # Compiled theme CSS
└── theme.css.map             # Source map
```

### Build Output CSS
```
{ProjectName}.WebApi/UIPages/build/static/css/
└── [bundled CSS files]       # Production-ready CSS
```

## 🔤 Fonts Location

### Development Fonts
```
{ProjectName}.WebApi/UIPages/src/fonts/
├── materialdesignicons-webfont.eot
├── materialdesignicons-webfont.ttf
├── materialdesignicons-webfont.woff
└── materialdesignicons-webfont.woff2
```

### Production/Build Fonts
```
{ProjectName}.WebApi/UIPages/build/fonts/
├── font-awesome/
│   ├── css/
│   │   ├── fontawesome.css
│   │   ├── v4-font-face.css
│   │   └── v5-font-face.css
│   ├── scss/
│   │   ├── fontawesome.scss
│   │   ├── brands.scss
│   │   ├── regular.scss
│   │   └── solid.scss
│   └── webfonts/
│       └── [font files]
└── [other font files]
```

## 📦 Third-Party Dependencies

### Bootstrap Integration
```
{ProjectName}.WebApi/UIPages/node_modules/bootstrap/
├── dist/
│   ├── css/              # Bootstrap CSS
│   └── js/               # Bootstrap JS
└── scss/                 # Bootstrap SCSS sources
```

### Font Awesome
```
{ProjectName}.WebApi/UIPages/node_modules/@fortawesome/
├── fontawesome-svg-core/
├── free-solid-svg-icons/
├── free-regular-svg-icons/
└── react-fontawesome/
```

## 🏗️ Module Components Location

### Business Module Components
```
{ProjectName}.WebApi/UIPages/src/components/
├── General/              # CVSM modules (Master/Config)
│   ├── CVSM001/         # User Management
│   ├── CVSM005/         # Site Configuration
│   └── ...
├── Transaction/          # CVST modules (Transactions)
│   ├── CVST005/         # Bank Reconciliation
│   ├── CVST020/         # Opera Income Audit
│   └── ...
└── Reports/              # CVSR modules (Reports)
    ├── CVSR005/         # Revenue Reports
    └── ...
```

### Module Structure Pattern
```
{ModuleCode}/
├── index.jsx            # Component implementation
├── {ModuleCode}VM.js    # ViewModel logic
└── index.css           # Module-specific styles (optional)
```

## 🎭 Icon Assets

### XOS Component Icons
```
xos-components/XOSTreeview/images/
└── tree_icons.png       # Tree view icons

xos-components/XOSCardInput/images/
├── visa.svg            # Payment card icons
├── mastercard.svg
└── [other card types]
```

## 📝 Style Import Order

When importing styles in the application:

```javascript
// In App.js or index.js
import 'bootstrap/dist/css/bootstrap.min.css';  // 1. Bootstrap base
import './assets/css/theme.css';                // 2. Custom theme
import './xos-components/index.css';            // 3. XOS components
import './App.css';                             // 4. App-specific
```

## 🔧 SCSS Compilation

### Build Script
```json
// package.json
"scripts": {
  "build-css": "sass src/scss/theme.scss src/assets/css/theme.css",
  "watch-css": "sass --watch src/scss/theme.scss:src/assets/css/theme.css"
}
```

## 📦 Asset Bundling

During build process:
- SCSS files compile to CSS
- CSS files are bundled and minified
- Fonts are copied to build/fonts
- Images are optimized and included in bundle
- XOS components are bundled with the application

## 🚀 Deployment Structure

```
wwwroot/                  # Production deployment
├── static/
│   ├── css/             # Bundled styles
│   ├── js/              # Bundled JavaScript
│   └── media/           # Images and fonts
├── fonts/               # Font files
└── index.html           # Entry point
```

## 💡 Best Practices

1. **XOS Components**: Always use from `src/xos-components/`
2. **Custom Styles**: Add to `src/scss/` and import in theme.scss
3. **Module Styles**: Keep in module folder as `index.css`
4. **Fonts**: Place in `src/fonts/` for custom fonts
5. **Icons**: Use Font Awesome or Material Design Icons
6. **Images**: Store component images in component folder
7. **Build Assets**: Never edit files in `build/` directory

## 🔄 Asset Pipeline

1. **Development**: Assets served from `src/`
2. **Build Process**: SCSS → CSS, Bundle, Minify
3. **Production**: Optimized assets in `build/` and `wwwroot/`

This structure ensures consistent asset management across development and production environments.