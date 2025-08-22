# XOS Component Fallback Guide

## Purpose
When XOS components are missing or not working, use these native HTML + Bootstrap replacements.

## Component Replacements

### XOSCheckbox → Bootstrap Form Check
```jsx
// ❌ XOS Component (doesn't exist)
<XOSCheckbox 
  checked={value} 
  onChange={handler} 
  label="Remember Me" 
/>

// ✅ Bootstrap Replacement
<div className="form-check">
  <input 
    type="checkbox" 
    className="form-check-input"
    id="rememberMe"
    checked={value}
    onChange={(e) => handler(e.target.checked)}
  />
  <label className="form-check-label" htmlFor="rememberMe">
    Remember Me
  </label>
</div>
```

### XOSTextbox → Bootstrap Form Control
```jsx
// ❌ XOS Component (when not available or problematic)
<XOSTextbox 
  value={username}
  onChange={(e) => setUsername(e.value)}
  placeholder="Enter username"
  required={true}
/>

// ✅ Bootstrap Replacement 
// NOTE: Use e.target.value for native inputs (not e.value like XOSTextbox)
<div className="mb-3">
  <input 
    type="text"
    className="form-control"
    value={username}
    onChange={(e) => setUsername(e.target.value)}  // e.target.value for native!
    placeholder="Enter username"
    required
  />
</div>

// 🎯 XOS Pattern (when XOSTextbox works correctly)
<cntrl.XOSTextbox
    name="username"                    // Required for XOS pattern
    value={this.VM.Data.username || ''}
    onChange={this.handleInputChange}  // Uses e.value, not e.target.value
    placeholder="Enter username"
/>
```

### XOSSelect → Bootstrap Form Select
```jsx
// ❌ XOS Component
<XOSSelect
  value={selectedOption}
  dataSource={options}
  textField="label"
  valueField="value"
  onChange={(e) => setSelectedOption(e.value)}
/>

// ✅ Bootstrap Replacement
<select 
  className="form-select"
  value={selectedOption}
  onChange={(e) => setSelectedOption(e.target.value)}
>
  <option value="">Select an option</option>
  {options.map(opt => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>
```

### XOSButtonWrapper → Button with wrapper
```jsx
// 🚨 IMPORTANT: XOSButton does NOT exist - use XOSButtonWrapper
// ✅ Correct XOS pattern:
<XOSButtonWrapper 
  id="btn_submit"
  formID={formID}
  onClick={handleSubmit}
>
  <button className="btn-save">Submit</button>  {/* Use XOS button classes! */}
</XOSButtonWrapper>

// ✅ Bootstrap Replacement (if XOSButtonWrapper not available)
<button 
  className="btn btn-primary"
  onClick={handleSubmit}
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <span className="spinner-border spinner-border-sm me-2"></span>
      Loading...
    </>
  ) : (
    'Submit'
  )}
</button>

// 🎯 XOS Button Classes (use these instead of Bootstrap btn-*)
// btn-save (primary action), btn-edit, btn-delete, btn-add, btn-clear, btn-close-custom
```

### XOSDatepicker → HTML5 Date Input
```jsx
// ❌ XOS Component
<XOSDatepicker
  value={date}
  onChange={(e) => setDate(e.value)}
  format="DD/MM/YYYY"
/>

// ✅ Bootstrap Replacement
<input 
  type="date"
  className="form-control"
  value={date}
  onChange={(e) => setDate(e.target.value)}
/>
```

### XOSGrid → Bootstrap Table
```jsx
// ❌ XOS Component
<XOSGrid
  dataSource={data}
  columns={columns}
  onRowClick={handleRowClick}
  pagination={true}
/>

// ✅ Bootstrap Replacement
<div className="table-responsive">
  <table className="table table-hover">
    <thead>
      <tr>
        {columns.map(col => (
          <th key={col.field}>{col.header}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((row, idx) => (
        <tr key={idx} onClick={() => handleRowClick(row)}>
          {columns.map(col => (
            <td key={col.field}>{row[col.field]}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### XOSModal → Bootstrap Modal
```jsx
// ❌ XOS Component
<XOSModal
  show={showModal}
  title="Confirm"
  onClose={() => setShowModal(false)}
>
  <p>Are you sure?</p>
</XOSModal>

// ✅ Bootstrap Replacement (with React)
{showModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Confirm</h5>
          <button 
            type="button" 
            className="btn-close"
            onClick={() => setShowModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          <p>Are you sure?</p>
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button type="button" className="btn btn-primary">
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
)}
{showModal && <div className="modal-backdrop show"></div>}
```

### XOSTab → Bootstrap Tabs
```jsx
// ❌ XOS Component
<XOSTab
  tabs={tabList}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// ✅ Bootstrap Replacement
<ul className="nav nav-tabs" role="tablist">
  {tabList.map(tab => (
    <li key={tab.id} className="nav-item">
      <button 
        className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.title}
      </button>
    </li>
  ))}
</ul>
<div className="tab-content mt-3">
  {tabList.map(tab => (
    <div 
      key={tab.id}
      className={`tab-pane ${activeTab === tab.id ? 'show active' : ''}`}
    >
      {tab.content}
    </div>
  ))}
</div>
```

### XOSAlert → Bootstrap Alert
```jsx
// ❌ XOS Component
<XOSAlert
  type="error"
  message="Something went wrong"
  dismissible={true}
/>

// ✅ Bootstrap Replacement
<div className="alert alert-danger alert-dismissible fade show" role="alert">
  Something went wrong
  <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
</div>
```

### XOSLoading → Bootstrap Spinner
```jsx
// ❌ XOS Component
<XOSLoading show={isLoading} />

// ✅ Bootstrap Replacement
{isLoading && (
  <div className="d-flex justify-content-center p-4">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
)}
```

### XOSRadio → Bootstrap Radio
```jsx
// ❌ XOS Component
<XOSRadio
  options={radioOptions}
  value={selectedValue}
  onChange={(e) => setSelectedValue(e.value)}
/>

// ✅ Bootstrap Replacement
<div>
  {radioOptions.map(option => (
    <div key={option.value} className="form-check">
      <input 
        className="form-check-input"
        type="radio"
        name="radioGroup"
        id={`radio-${option.value}`}
        value={option.value}
        checked={selectedValue === option.value}
        onChange={(e) => setSelectedValue(e.target.value)}
      />
      <label className="form-check-label" htmlFor={`radio-${option.value}`}>
        {option.label}
      </label>
    </div>
  ))}
</div>
```

### XOSSwitch → Bootstrap Switch
```jsx
// ❌ XOS Component
<XOSSwitch
  checked={isEnabled}
  onChange={(e) => setIsEnabled(e.value)}
  label="Enable feature"
/>

// ✅ Bootstrap Replacement
<div className="form-check form-switch">
  <input 
    className="form-check-input"
    type="checkbox"
    id="featureSwitch"
    checked={isEnabled}
    onChange={(e) => setIsEnabled(e.target.checked)}
  />
  <label className="form-check-label" htmlFor="featureSwitch">
    Enable feature
  </label>
</div>
```

### XOSTextarea → Bootstrap Textarea
```jsx
// ❌ XOS Component
<XOSTextarea
  value={description}
  onChange={(e) => setDescription(e.value)}
  rows={5}
  placeholder="Enter description"
/>

// ✅ Bootstrap Replacement
<textarea 
  className="form-control"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={5}
  placeholder="Enter description"
></textarea>
```

### XOSFileUpload → Bootstrap File Input
```jsx
// ❌ XOS Component
<XOSFileUpload
  onFileSelect={handleFileSelect}
  accept=".pdf,.doc"
  multiple={true}
/>

// ✅ Bootstrap Replacement
<div className="mb-3">
  <input 
    className="form-control"
    type="file"
    accept=".pdf,.doc"
    multiple
    onChange={(e) => handleFileSelect(e.target.files)}
  />
</div>
```

### XOSBadge → Bootstrap Badge
```jsx
// ❌ XOS Component
<XOSBadge type="success" text="Active" />

// ✅ Bootstrap Replacement
<span className="badge bg-success">Active</span>
```

### XOSProgress → Bootstrap Progress
```jsx
// ❌ XOS Component
<XOSProgress value={75} max={100} />

// ✅ Bootstrap Replacement
<div className="progress">
  <div 
    className="progress-bar"
    role="progressbar"
    style={{ width: '75%' }}
    aria-valuenow={75}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    75%
  </div>
</div>
```

### XOSTooltip → Bootstrap Tooltip (with title attribute)
```jsx
// ❌ XOS Component
<XOSTooltip text="Help text">
  <button>Hover me</button>
</XOSTooltip>

// ✅ Bootstrap Replacement (simple)
<button 
  type="button"
  className="btn btn-secondary"
  title="Help text"
  data-bs-toggle="tooltip"
>
  Hover me
</button>
```

### XOSAccordion → Bootstrap Accordion
```jsx
// ❌ XOS Component
<XOSAccordion items={accordionItems} />

// ✅ Bootstrap Replacement
<div className="accordion" id="accordionExample">
  {accordionItems.map((item, idx) => (
    <div key={idx} className="accordion-item">
      <h2 className="accordion-header">
        <button 
          className="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#collapse${idx}`}
        >
          {item.title}
        </button>
      </h2>
      <div 
        id={`collapse${idx}`}
        className="accordion-collapse collapse"
      >
        <div className="accordion-body">
          {item.content}
        </div>
      </div>
    </div>
  ))}
</div>
```

## Form Validation Pattern

### Without XOS Validation
```jsx
// Bootstrap form with validation
const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};
  
  if (!username) {
    newErrors.username = 'Username is required';
  }
  
  if (!email || !email.includes('@')) {
    newErrors.email = 'Valid email is required';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

return (
  <form onSubmit={handleSubmit}>
    <div className="mb-3">
      <label className="form-label">Username</label>
      <input 
        type="text"
        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {errors.username && (
        <div className="invalid-feedback">
          {errors.username}
        </div>
      )}
    </div>
    
    <div className="mb-3">
      <label className="form-label">Email</label>
      <input 
        type="email"
        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && (
        <div className="invalid-feedback">
          {errors.email}
        </div>
      )}
    </div>
    
    <button type="submit" className="btn btn-primary">
      Submit
    </button>
  </form>
);
```

## Loading States Pattern

### Without XOSOverlay
```jsx
// Bootstrap loading overlay
const LoadingOverlay = ({ show, children }) => (
  <div className="position-relative">
    {children}
    {show && (
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )}
  </div>
);

// Usage
<LoadingOverlay show={isLoading}>
  <div className="card">
    <div className="card-body">
      {/* Your content */}
    </div>
  </div>
</LoadingOverlay>
```

## API Call Pattern

### Without XOS Utils.ajax
```jsx
// Native fetch with error handling
const apiCall = async (url, data = null, method = 'GET') => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`/api/${url}`, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Usage
const saveData = async () => {
  setLoading(true);
  try {
    const result = await apiCall('customer/save', formData, 'POST');
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

## Important Notes

1. **Event Handler Differences**:
   - XOSTextbox: Use `e.value` 
   - Native inputs: Use `e.target.value`
   - Don't mix these up!

2. **XOS vs Bootstrap Classes**:
   - XOS buttons: `btn-save`, `btn-edit`, `btn-delete` 
   - Bootstrap buttons: `btn-primary`, `btn-secondary`

3. **Component Existence**:
   - ❌ XOSButton (doesn't exist) → Use XOSButtonWrapper
   - ❌ XOSModal (doesn't exist) → Use Bootstrap modal
   - ❌ XOSCheckbox (doesn't exist) → Use Bootstrap form-check

4. **State Management**:
   - XOS: Use VMBase with `this.Data` pattern
   - Bootstrap/React: Use React state hooks

5. **Always use Bootstrap classes** - Don't create custom CSS
6. **Use native HTML5 inputs** when XOS components aren't available
7. **Bootstrap includes icons** - Use Bootstrap Icons (bi-*)
8. **Test responsiveness** - Bootstrap's grid system handles this

## Quick Reference

| XOS Component | Bootstrap Replacement | Key Classes |
|--------------|----------------------|-------------|
| XOSTextbox | `<input class="form-control">` | form-control |
| XOSSelect | `<select class="form-select">` | form-select |
| XOSCheckbox | `<div class="form-check">` | form-check, form-check-input |
| XOSButtonWrapper | `<button class="btn-save">` (wrapped) | btn-save, btn-edit, etc |
| XOSGrid | `<table class="table">` | table, table-hover |
| XOSModal | `<div class="modal">` | modal, modal-dialog |
| XOSAlert | `<div class="alert">` | alert, alert-danger |
| XOSTab | `<ul class="nav nav-tabs">` | nav, nav-tabs |
| XOSLoading | `<div class="spinner-border">` | spinner-border |
| XOSBadge | `<span class="badge">` | badge, bg-success |