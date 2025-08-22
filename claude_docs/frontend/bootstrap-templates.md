# Bootstrap Component Templates

## 🎯 Purpose
Ready-to-use Bootstrap 5.3.7 component templates for React. Copy and paste these templates instead of creating custom CSS.

## 📋 Form Components

### Login Form
```jsx
<div className="min-vh-100 d-flex align-items-center bg-light">
  <div className="container">
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow">
          <div className="card-body p-4">
            <h3 className="card-title text-center mb-4">Login</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="form-check mb-3">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>
            </form>
            
            <div className="text-center mt-3">
              <a href="#" className="text-decoration-none">Forgot password?</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Data Entry Form
```jsx
<div className="container-fluid p-3">
  <div className="card">
    <div className="card-header">
      <h5 className="mb-0">Customer Information</h5>
    </div>
    <div className="card-body">
      <form>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">First Name</label>
            <input type="text" className="form-control" />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Last Name</label>
            <input type="text" className="form-control" />
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Phone</label>
            <input type="tel" className="form-control" />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Date of Birth</label>
            <input type="date" className="form-control" />
          </div>
        </div>
        
        <div className="mb-3">
          <label className="form-label">Address</label>
          <textarea className="form-control" rows="3"></textarea>
        </div>
        
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Country</label>
            <select className="form-select">
              <option value="">Select Country</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</div>
```

## 📊 Data Display Components

### Data Table
```jsx
<div className="card">
  <div className="card-header d-flex justify-content-between align-items-center">
    <h5 className="mb-0">Customer List</h5>
    <button className="btn btn-sm btn-primary">
      <i className="bi bi-plus"></i> Add New
    </button>
  </div>
  <div className="card-body">
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id}>
              <th scope="row">{index + 1}</th>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td>
                <span className={`badge ${item.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                  {item.status}
                </span>
              </td>
              <td>
                <div className="btn-group btn-group-sm" role="group">
                  <button className="btn btn-outline-primary">Edit</button>
                  <button className="btn btn-outline-danger">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {/* Pagination */}
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        <li className="page-item disabled">
          <a className="page-link">Previous</a>
        </li>
        <li className="page-item active">
          <a className="page-link" href="#">1</a>
        </li>
        <li className="page-item">
          <a className="page-link" href="#">2</a>
        </li>
        <li className="page-item">
          <a className="page-link" href="#">3</a>
        </li>
        <li className="page-item">
          <a className="page-link" href="#">Next</a>
        </li>
      </ul>
    </nav>
  </div>
</div>
```

### Cards Grid
```jsx
<div className="container-fluid p-3">
  <div className="row g-3">
    {items.map(item => (
      <div key={item.id} className="col-12 col-md-6 col-lg-4">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title">{item.title}</h5>
            <p className="card-text text-muted">{item.description}</p>
            <div className="d-flex justify-content-between align-items-center">
              <span className="badge bg-primary">{item.category}</span>
              <small className="text-muted">{item.date}</small>
            </div>
          </div>
          <div className="card-footer bg-transparent">
            <button className="btn btn-sm btn-outline-primary w-100">View Details</button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
```

## 🎨 Layout Components

### Dashboard Layout
```jsx
<div className="min-vh-100 d-flex flex-column">
  {/* Header */}
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <div className="container-fluid">
      <a className="navbar-brand" href="#">Dashboard</a>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <a className="nav-link active" href="#">Home</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Reports</a>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              User
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="#">Profile</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="#">Logout</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  
  {/* Main Content */}
  <div className="flex-grow-1 bg-light">
    <div className="container-fluid p-4">
      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-2">Total Sales</h6>
              <h3 className="mb-0">$24,500</h3>
              <small className="text-success">+12% from last month</small>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-2">Orders</h6>
              <h3 className="mb-0">145</h3>
              <small className="text-danger">-5% from last month</small>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-2">Customers</h6>
              <h3 className="mb-0">1,245</h3>
              <small className="text-success">+8% from last month</small>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-2">Revenue</h6>
              <h3 className="mb-0">$89,400</h3>
              <small className="text-success">+23% from last month</small>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      {children}
    </div>
  </div>
  
  {/* Footer */}
  <footer className="bg-dark text-white py-3">
    <div className="container-fluid text-center">
      <small>&copy; 2024 Your Company. All rights reserved.</small>
    </div>
  </footer>
</div>
```

### Sidebar Layout
```jsx
<div className="d-flex min-vh-100">
  {/* Sidebar */}
  <div className="bg-dark text-white" style={{ width: '250px' }}>
    <div className="p-3">
      <h5 className="mb-3">Menu</h5>
      <div className="list-group list-group-flush">
        <a href="#" className="list-group-item list-group-item-action bg-dark text-white">
          <i className="bi bi-house-door me-2"></i> Dashboard
        </a>
        <a href="#" className="list-group-item list-group-item-action bg-dark text-white">
          <i className="bi bi-people me-2"></i> Customers
        </a>
        <a href="#" className="list-group-item list-group-item-action bg-dark text-white">
          <i className="bi bi-box me-2"></i> Products
        </a>
        <a href="#" className="list-group-item list-group-item-action bg-dark text-white">
          <i className="bi bi-cart me-2"></i> Orders
        </a>
        <a href="#" className="list-group-item list-group-item-action bg-dark text-white">
          <i className="bi bi-graph-up me-2"></i> Reports
        </a>
      </div>
    </div>
  </div>
  
  {/* Main Content */}
  <div className="flex-grow-1">
    <div className="p-4">
      {children}
    </div>
  </div>
</div>
```

## 🔔 Feedback Components

### Alerts
```jsx
{/* Success Alert */}
<div className="alert alert-success alert-dismissible fade show" role="alert">
  <strong>Success!</strong> Your changes have been saved.
  <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
</div>

{/* Error Alert */}
<div className="alert alert-danger alert-dismissible fade show" role="alert">
  <strong>Error!</strong> Something went wrong. Please try again.
  <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
</div>

{/* Warning Alert */}
<div className="alert alert-warning" role="alert">
  <i className="bi bi-exclamation-triangle-fill me-2"></i>
  Please complete all required fields.
</div>

{/* Info Alert */}
<div className="alert alert-info" role="alert">
  <i className="bi bi-info-circle-fill me-2"></i>
  Your session will expire in 5 minutes.
</div>
```

### Modal Dialog
```jsx
<div className="modal fade" id="confirmModal" tabIndex="-1">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Confirm Action</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div className="modal-body">
        <p>Are you sure you want to delete this item?</p>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
          Cancel
        </button>
        <button type="button" className="btn btn-danger">
          Delete
        </button>
      </div>
    </div>
  </div>
</div>
```

### Toast Notifications
```jsx
<div className="toast-container position-fixed bottom-0 end-0 p-3">
  <div className="toast show" role="alert">
    <div className="toast-header">
      <strong className="me-auto">Notification</strong>
      <small>Just now</small>
      <button type="button" className="btn-close" data-bs-dismiss="toast"></button>
    </div>
    <div className="toast-body">
      Your data has been successfully saved.
    </div>
  </div>
</div>
```

### Loading States
```jsx
{/* Full Page Loading */}
<div className="min-vh-100 d-flex justify-content-center align-items-center">
  <div className="text-center">
    <div className="spinner-border text-primary mb-3" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="text-muted">Loading, please wait...</p>
  </div>
</div>

{/* Card Loading */}
<div className="card">
  <div className="card-body text-center py-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
</div>

{/* Button Loading */}
<button className="btn btn-primary" type="button" disabled>
  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
  Processing...
</button>
```

## 🎛️ Form Controls

### Input Groups
```jsx
{/* With Icon */}
<div className="input-group mb-3">
  <span className="input-group-text">
    <i className="bi bi-search"></i>
  </span>
  <input type="text" className="form-control" placeholder="Search..." />
</div>

{/* With Button */}
<div className="input-group mb-3">
  <input type="text" className="form-control" placeholder="Enter email" />
  <button className="btn btn-primary" type="button">Subscribe</button>
</div>

{/* With Addon */}
<div className="input-group mb-3">
  <span className="input-group-text">$</span>
  <input type="number" className="form-control" placeholder="0.00" />
  <span className="input-group-text">.00</span>
</div>
```

### Switches and Checkboxes
```jsx
{/* Switch */}
<div className="form-check form-switch mb-3">
  <input className="form-check-input" type="checkbox" id="enableFeature" />
  <label className="form-check-label" htmlFor="enableFeature">
    Enable this feature
  </label>
</div>

{/* Inline Checkboxes */}
<div className="mb-3">
  <div className="form-check form-check-inline">
    <input className="form-check-input" type="checkbox" id="option1" />
    <label className="form-check-label" htmlFor="option1">Option 1</label>
  </div>
  <div className="form-check form-check-inline">
    <input className="form-check-input" type="checkbox" id="option2" />
    <label className="form-check-label" htmlFor="option2">Option 2</label>
  </div>
</div>

{/* Radio Buttons */}
<div className="mb-3">
  <div className="form-check">
    <input className="form-check-input" type="radio" name="plan" id="basic" />
    <label className="form-check-label" htmlFor="basic">
      Basic Plan
    </label>
  </div>
  <div className="form-check">
    <input className="form-check-input" type="radio" name="plan" id="premium" />
    <label className="form-check-label" htmlFor="premium">
      Premium Plan
    </label>
  </div>
</div>
```

### File Upload
```jsx
<div className="mb-3">
  <label className="form-label">Upload Document</label>
  <input className="form-control" type="file" id="fileUpload" />
  <div className="form-text">Max file size: 5MB. Supported formats: PDF, DOC, DOCX</div>
</div>

{/* Custom File Upload */}
<div className="card border-2 border-dashed">
  <div className="card-body text-center py-5">
    <i className="bi bi-cloud-upload display-4 text-muted mb-3"></i>
    <p className="mb-2">Drag and drop files here or</p>
    <label htmlFor="customFile" className="btn btn-primary">
      Browse Files
      <input type="file" id="customFile" className="d-none" multiple />
    </label>
  </div>
</div>
```

## 🔢 Utility Classes Reference

### Spacing
- `m-{0-5}` - Margin (all sides)
- `mt-{0-5}` - Margin top
- `mb-{0-5}` - Margin bottom
- `ms-{0-5}` - Margin start (left)
- `me-{0-5}` - Margin end (right)
- `p-{0-5}` - Padding (all sides)
- `px-{0-5}` - Padding horizontal
- `py-{0-5}` - Padding vertical

### Display
- `d-none` - Hide element
- `d-block` - Block display
- `d-flex` - Flexbox container
- `d-inline` - Inline display
- `d-grid` - Grid container

### Flexbox
- `justify-content-center` - Center horizontally
- `justify-content-between` - Space between items
- `align-items-center` - Center vertically
- `flex-column` - Column direction
- `flex-grow-1` - Grow to fill space
- `gap-{1-5}` - Gap between items

### Text
- `text-center` - Center text
- `text-start` - Left align
- `text-end` - Right align
- `text-muted` - Gray text
- `text-primary` - Primary color
- `text-danger` - Red text
- `text-success` - Green text
- `fw-bold` - Bold text
- `text-decoration-none` - Remove underline

### Sizing
- `w-25, w-50, w-75, w-100` - Width percentages
- `h-25, h-50, h-75, h-100` - Height percentages
- `min-vh-100` - Minimum viewport height
- `min-vw-100` - Minimum viewport width

### Colors
- `bg-primary, bg-secondary, bg-success, bg-danger, bg-warning, bg-info`
- `bg-light, bg-dark, bg-white`
- `border-primary, border-secondary, etc.`
- `text-primary, text-secondary, etc.`

### Borders
- `border` - All borders
- `border-top, border-bottom, border-start, border-end`
- `border-0` - Remove borders
- `rounded` - Rounded corners
- `rounded-circle` - Circle
- `shadow, shadow-sm, shadow-lg` - Box shadows

## 📱 Responsive Classes

### Breakpoints
- `col-12 col-md-6 col-lg-4` - Responsive columns
- `d-none d-md-block` - Hide on mobile, show on medium+
- `d-lg-none` - Hide on large screens
- `text-center text-md-start` - Center on mobile, left on medium+

### Container Options
- `container` - Fixed width container
- `container-fluid` - Full width
- `container-{sm|md|lg|xl|xxl}` - Responsive containers

## ⚠️ Important Notes

1. **Never create custom CSS for layouts** - Bootstrap has everything you need
2. **Use utility classes** instead of inline styles
3. **Check Bootstrap docs** for additional components
4. **Test responsiveness** using Bootstrap's grid system
5. **Use Bootstrap Icons** (bi-*) for icons

## 🔗 Quick Links

- [Bootstrap 5.3 Documentation](https://getbootstrap.com/docs/5.3/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [Bootstrap Examples](https://getbootstrap.com/docs/5.3/examples/)