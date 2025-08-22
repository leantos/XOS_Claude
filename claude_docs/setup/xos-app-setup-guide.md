# XOS Application Setup Guide

## Overview
This guide provides instructions for setting up and running applications that follow the XOS framework structure with .NET backend and React frontend.

## ⚠️ CRITICAL SETUP REQUIREMENTS

### 1. Copy theme.css (MANDATORY)
```bash
# The theme.css file MUST be copied from the assets folder to src/assets/css/
cp assets/css/theme.css [ProjectName].WebApi/UIPages/src/assets/css/theme.css
```
**Without this file, XOS components will NOT display properly!**

### 2. Install ALL Dependencies
```bash
npm install @microsoft/signalr axios bootstrap bootstrap-icons crypto-js fast-sort jquery moment react react-color react-dom react-router-dom react-scripts
```

### 3. Copy XOS Components
```bash
# Copy the entire xos-components folder to src/
cp -r xos-components/ [ProjectName].WebApi/UIPages/src/xos-components/
```

### 4. Fix Common Issues
- **Invalid regex in Utils.js line 447**: Change `'^\(?([0-9]{3})\)?'` to `'^\\(?([0-9]{3})\\)?'`
- **XOSModal doesn't exist**: Use Bootstrap modals or XOSControl instead

## Project Structure Pattern
```
[ProjectName]/
├── [ProjectName].WebApi/
│   ├── Controllers/           # API endpoints
│   └── UIPages/               # Frontend React app
│       └── src/
│           ├── components/    # React components
│           └── xos-components/ # XOS framework
└── [ProjectName].Transaction/  # Shared library/Domain
```

## Quick Setup Files

### 1. Create package.json
Location: `[ProjectName].WebApi/UIPages/package.json`

```json
{
  "name": "xos-application",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@microsoft/signalr": "^9.0.6",
    "axios": "^1.4.0",
    "bootstrap": "^5.3.0",
    "bootstrap-icons": "^1.10.0",
    "crypto-js": "^4.2.0",
    "fast-sort": "^3.4.1",
    "jquery": "^3.7.1",
    "moment": "^2.30.1",
    "react": "^18.2.0",
    "react-color": "^2.19.3",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "proxy": "http://localhost:5000",
  "eslintConfig": {
    "extends": ["react-app"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
```

### 2. Create public/index.html
Location: `[ProjectName].WebApi/UIPages/public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="XOS Application" />
    <title>Application</title>
</head>
<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
</body>
</html>
```

### 3. Create src/index.js
Location: `[ProjectName].WebApi/UIPages/src/index.js`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 4. Create src/App.js
Location: `[ProjectName].WebApi/UIPages/src/App.js`

```javascript
import React, { Component } from 'react';
import './App.css';

// Import Bootstrap (REQUIRED - must be in this order)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import theme CSS (REQUIRED - must come after Bootstrap)
import './assets/css/theme.css';

// NOTE: theme.css must be copied from assets/css/theme.css to src/assets/css/theme.css
// This is MANDATORY for XOS components to display properly

// Dynamic component loader
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentComponent: null,
      componentName: ''
    };
  }

  componentDidMount() {
    // Load default component or from URL
    this.loadComponent(this.getDefaultComponent());
  }

  getDefaultComponent() {
    // Try to detect from existing components
    // You can customize this to load your specific component
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('component') || this.findFirstComponent();
  }

  findFirstComponent() {
    // Attempt to find and load the first available component
    // Modify this list based on your project's components
    const possibleComponents = [
      'CVSM062',  // CVS Document Master
      'Dashboard',
      'Home',
      'Main'
    ];

    for (const comp of possibleComponents) {
      try {
        const module = require(`./components/General/${comp}/index.jsx`);
        return comp;
      } catch (e) {
        // Component doesn't exist, try next
      }
    }
    return null;
  }

  loadComponent = (componentName) => {
    if (!componentName) {
      this.setState({ 
        currentComponent: <div className="container mt-5">
          <h2>No components found</h2>
          <p>Please create components in src/components/General/</p>
        </div> 
      });
      return;
    }

    try {
      const ComponentModule = require(`./components/General/${componentName}/index.jsx`);
      const Component = ComponentModule.default;
      
      this.setState({
        currentComponent: <Component context={this} />,
        componentName: componentName
      });
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      this.setState({ 
        currentComponent: <div className="container mt-5">
          <h2>Component Load Error</h2>
          <p>Failed to load component: {componentName}</p>
          <pre>{error.message}</pre>
        </div> 
      });
    }
  };

  render() {
    return (
      <div className="App">
        {this.state.currentComponent || (
          <div className="container mt-5">
            <h1>XOS Application</h1>
            <p>Loading components...</p>
          </div>
        )}
      </div>
    );
  }
}

export default App;
```

### 5. Create src/index.css
Location: `[ProjectName].WebApi/UIPages/src/index.css`

```css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.App {
  min-height: 100vh;
  background-color: #f8f9fa;
}
```

### 6. Create src/App.css
Location: `[ProjectName].WebApi/UIPages/src/App.css`

```css
.App {
  text-align: left;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}
```

### 7. Create XOS Components Base (if missing)
Location: `[ProjectName].WebApi/UIPages/src/xos-components/index.js`

```javascript
// XOS Component Framework Base
import React, { Component } from 'react';

export class XOSComponent extends Component {
    constructor(props, vm) {
        super(props);
        this.VM = vm;
        this.state = {};
    }

    componentDidMount() {
        if (this.onLoad) {
            this.onLoad();
        }
    }

    componentWillUnmount() {
        if (this.onClosing) {
            this.onClosing();
        }
    }

    updateUI = () => {
        this.forceUpdate();
    }
}

export class VMBase {
    constructor(props) {
        this.props = props;
        this.Data = {};
    }

    updateUI() {
        if (this.props && this.props.updateUI) {
            this.props.updateUI();
        }
    }
}

// Export other XOS components
export const XOSControl = ({ children, loading, title, className }) => (
    <div className={`xos-control ${className || ''}`}>
        {loading && <div className="loading-overlay">Loading...</div>}
        {title && <div className="xos-title">{title}</div>}
        {children}
    </div>
);

export const XOSBody = ({ children }) => (
    <div className="xos-body">{children}</div>
);

export const XOSTextbox = React.forwardRef(({ value, onChange, placeholder, maxLength, mandatory }, ref) => (
    <input
        ref={ref}
        type="text"
        className={`form-control ${mandatory ? 'mandatory' : ''}`}
        value={value || ''}
        onChange={(e) => onChange({ value: e.target.value })}
        placeholder={placeholder}
        maxLength={maxLength}
    />
));

export const XOSSelect = React.forwardRef(({ dataSource, selectedItem, onChange, displayField, compareKey, placeholder, allowClear }, ref) => (
    <select
        ref={ref}
        className="form-select"
        value={selectedItem?.[compareKey] || ''}
        onChange={(e) => {
            const item = dataSource?.find(d => d[compareKey]?.toString() === e.target.value);
            onChange({ selectedItem: item });
        }}
    >
        <option value="">{placeholder || 'Select...'}</option>
        {dataSource?.map((item, idx) => (
            <option key={idx} value={item[compareKey]}>
                {item[displayField]}
            </option>
        ))}
    </select>
));

export const XOSGrid = ({ dataSource, columns, onGridCellClick, onGridCellDoubleClick }) => (
    <table className="table table-hover">
        <thead>
            <tr>
                {columns?.map((col, idx) => (
                    <th key={idx} style={{ width: col.width }}>
                        {col.title}
                    </th>
                ))}
            </tr>
        </thead>
        <tbody>
            {dataSource?.map((row, rowIdx) => (
                <tr 
                    key={rowIdx}
                    onClick={() => onGridCellClick?.({ rowData: row })}
                    onDoubleClick={() => onGridCellDoubleClick?.({ rowData: row })}
                >
                    {columns?.map((col, colIdx) => (
                        <td key={colIdx}>
                            {col.render ? col.render(row[col.field], row) : row[col.field]}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
);

export const XOSModal = ({ show, title, children, onClose, size }) => {
    if (!show) return null;
    
    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className={`modal-dialog ${size ? `modal-${size}` : ''}`}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    {children}
                </div>
            </div>
            <div className="modal-backdrop show"></div>
        </div>
    );
};

export const XOSButtonWrapper = ({ children, loading, onClick }) => (
    <span onClick={!loading ? onClick : undefined} style={{ opacity: loading ? 0.6 : 1 }}>
        {children}
    </span>
);
```

## Running the Application

### Step 1: Install Dependencies
```bash
cd [ProjectName].WebApi/UIPages
npm install
```

### Step 2: Start the Frontend
```bash
npm start
```
The application will run on `http://localhost:3000`

### Step 3: Start Backend (if needed)
If you have a .NET backend:
```bash
cd [ProjectName].WebApi
dotnet restore
dotnet build
dotnet run
```
The API will run on `http://localhost:5000`

## Troubleshooting

### Component Not Loading
1. Check that your component is in the correct path: `src/components/General/[ComponentName]/`
2. Ensure the component exports a default class
3. Check browser console for specific error messages

### Missing Theme Styles
If XOS components don't look right:
1. **CRITICAL**: Copy theme.css from `assets/css/theme.css` to `src/assets/css/theme.css`
2. Ensure Bootstrap CSS is loaded BEFORE theme.css
3. Check that imports are in correct order in App.js:
   ```javascript
   import 'bootstrap/dist/css/bootstrap.min.css';
   import 'bootstrap-icons/font/bootstrap-icons.css';
   import './assets/css/theme.css';  // MUST come after Bootstrap
   ```

### Common Compilation Errors
1. **Module not found: 'react-color'** → `npm install react-color`
2. **Module not found: 'fast-sort'** → `npm install fast-sort`
3. **Invalid regex in Utils.js** → Fix escape characters in phone regex
4. **'XOSModal' is not exported** → XOSModal doesn't exist, use Bootstrap modals

### Port Conflicts
If port 3000 is in use:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Or change port in package.json:
"scripts": {
  "start": "PORT=3001 react-scripts start"
}
```

## Customization

### Loading Specific Component
Modify the `findFirstComponent()` function in App.js to list your project's components:

```javascript
const possibleComponents = [
  'YourComponent1',
  'YourComponent2',
  // Add your component names here
];
```

### API Configuration
Update the proxy in package.json to point to your backend:
```json
"proxy": "http://localhost:YOUR_API_PORT"
```

## Quick Start Commands
```bash
# One-line setup and run
cd [ProjectName].WebApi/UIPages && npm install && npm start
```

---

Last Updated: 2025-08-13