# XOS Components API Reference

## ⚠️ CRITICAL: Button Implementation Reality
**There is NO XOSButton visual component!** Use regular HTML buttons with Bootstrap classes.
- See [XOS Button Styling Guide](./xos-button-styling-guide.md) for complete reference  
- **XOSButtonWrapper** is for authentication only, NOT for styling
- Use standard pattern: `btn btn-sm btn-primary` with FontAwesome icons

## Component Import
```javascript
import * as cntrl from '../../../xos-components';
// Or specific imports
import { XOSTextbox, XOSSelect, XOSGrid } from '../../../xos-components';
```

## Input Components

### XOSTextbox
Text input with validation and formatting support.

```javascript
<XOSTextbox 
    // Core Props
    value={string}                    // Current value
    onChange={(e) => handler(e.value)} // Change handler
    
    // Input Types
    inputType={XOSTextboxTypes.numeric} // See types below
    
    // Validation
    mandatory={true}                  // Required field
    maxLength={100}                   // Maximum characters
    minLength={5}                     // Minimum characters
    
    // Numeric Props (when inputType='numeric')
    prefix={5}                        // Integer digits
    suffix={2}                        // Decimal digits
    numericType={XOSNumericTypes.both} // negative/positive/both
    
    // Display
    readOnly={false}                  // Read-only mode
    disabled={false}                  // Disabled state
    placeholder="Enter text"          // Placeholder text
    
    // Reference
    ref={el => this.inputRef = el}    // Component reference
/>
```

**Input Types (XOSTextboxTypes):**
- `textbox` - Standard text
- `alphaNumeric` - Letters and numbers only
- `alphabets` - Letters only
- `numeric` - Numbers with decimal support
- `time` - Time format (12-hour)
- `time24hr` - Time format (24-hour)
- `titleCase` - Auto title case
- `sentenceCase` - Auto sentence case
- `password` - Password masking

**Methods (via ref):**
```javascript
this.inputRef.focus()      // Set focus
this.inputRef.getValue()   // Get current value
this.inputRef.setValue(val) // Set value
this.inputRef.clear()      // Clear input
```

### XOSSelect (Dropdown)
Dropdown with search, multi-select, and async data support.

```javascript
<XOSSelect
    // Data
    dataSource={array}               // Array of items
    selectedItem={object}            // Current selection
    displayField="Text"              // Property to display
    compareKey="ID"                  // Property for comparison
    
    // Events
    onChange={(e, item) => handler(e.value)} // Selection change
    
    // Features
    multiSelect={false}              // Multiple selection
    allowClear={true}                // Show clear button
    asyncSearch={searchFunction}     // Server-side search
    
    // Display
    placeholder="Select item"        // Placeholder text
    disabled={false}                 // Disabled state
    listWidth="300px"                // Dropdown width
    
    // Search
    delay={250}                      // Search debounce (ms)
    minChar={2}                      // Min chars for search
    
    // Multi-column Display
    isMultiCol={true}               // Enable multi-column
    colDef={[                       // Column definitions
        { field: 'Code', width: 80 },
        { field: 'Name', width: 200 }
    ]}
    
    // Reference
    ref={el => this.selectRef = el}
/>
```

**Async Search Function:**
```javascript
asyncSearch = (searchText, callback) => {
    Utils.ajax({
        url: 'api/search',
        data: { query: searchText }
    }, (response) => {
        callback(response.items);
    });
}
```

### XOSDatepicker
Date selection with range support.

```javascript
<XOSDatepicker
    // Value
    value={dateValue}                // Current date
    onChange={(e) => handler(e.value)} // Date change
    
    // Range
    startDate={minDate}              // Minimum date
    endDate={maxDate}                // Maximum date
    
    // Display
    placeHolder="Select date"        // Placeholder
    format="DD/MM/YYYY"              // Display format
    openOnFocus={true}               // Open on focus
    allowClear={true}                // Clear button
    readOnly={false}                 // Read-only mode
    disabled={false}                 // Disabled state
    
    // Calendar
    isOpen={true}                    // Keep open
    showTodayButton={true}          // Today button
    
    // Reference
    ref={el => this.dateRef = el}
/>
```

### XOSColorPicker
Color selection control.

```javascript
<XOSColorPicker
    value={colorValue}               // Hex color value
    onChange={(e) => handler(e.value)} // Color change
    showAlpha={true}                 // Alpha channel
    presetColors={['#ff0000', '#00ff00']} // Preset colors
/>
```

### XOSFile
File upload component.

```javascript
<XOSFile
    // Configuration
    multiple={true}                  // Multiple files
    accept=".pdf,.doc,.docx"        // File types
    maxSize={5242880}                // Max size (bytes)
    
    // Events
    onChange={(files) => handler(files)} // File selection
    onError={(error) => handleError(error)} // Error handler
    
    // Display
    showFileList={true}              // Show selected files
    disabled={false}                 // Disabled state
/>
```

## Data Display Components

### XOSGrid
Advanced data table with sorting, filtering, and pagination.

```javascript
<XOSGrid
    // Data
    dataSource={arrayOfObjects}      // Data array
    columns={columnDefinitions}      // Column config
    
    // Selection
    rowSelection={true}              // Enable selection
    multiSelect={true}               // Multiple selection
    selectedItems={selectedArray}    // Selected rows
    
    // Pagination
    paging={true}                    // Enable paging
    pageInfo={{
        currentPage: 1,
        totalPages: 10,
        totalCount: 100,
        onPageChange: (e) => loadPage(e.pageNo)
    }}
    
    // Events
    onGridCellClick={(e) => handleCellClick(e)}
    onGridCellDoubleClick={(e) => handleDoubleClick(e)}
    onSelectionChange={(selected) => handleSelection(selected)}
    
    // Filtering
    showFilter={true}                // Show filter row
    externalFilter={true}            // Server-side filter
    onFilterChange={(e) => handleFilter(e.columnOptions)}
    
    // Sorting
    externalSort={true}              // Server-side sort
    onSortChange={(e) => handleSort(e.columnOptions)}
    
    // Styling
    rowHeight={30}                   // Row height (px)
    showFooter={true}                // Show footer
    rowStyle={[                      // Conditional styles
        { 
            className: 'inactive-row', 
            condition: (row) => row.Status === 'I' 
        }
    ]}
    
    // Features
    colResize={true}                 // Column resizing
    showRowNumbers={true}            // Row numbers
    virtualization={true}            // Virtual scrolling
/>
```

**Column Definition:**
```javascript
columns = [
    {
        field: 'Name',           // Data field
        title: 'Customer Name',  // Header text
        width: 200,             // Width (px)
        dataType: 'string',     // string/numeric/date/boolean
        align: 'left',          // left/center/right
        format: 'DD/MM/YYYY',   // Date format
        sortable: true,         // Allow sorting
        filterable: true,       // Allow filtering
        resizable: true,        // Allow resize
        frozen: true,           // Freeze column
        
        // Custom rendering
        render: (value, row) => {
            return <span className="custom">{value}</span>;
        },
        
        // Custom editor
        editor: {
            type: 'textbox',    // textbox/select/date
            options: {}         // Editor options
        }
    }
]
```

**Event Data Structure:**
```javascript
// Cell Click Event
{
    rowIndex: 0,
    columnIndex: 1,
    field: 'Name',
    value: 'John Doe',
    rowData: { /* full row object */ }
}
```

### XOSTreeview
Hierarchical tree display.

```javascript
<XOSTreeview
    // Data
    dataSource={treeData}            // Hierarchical data
    displayField="Text"              // Display property
    valueField="ID"                  // Value property
    childrenField="Children"         // Children property
    
    // Selection
    selectedNodes={selectedArray}    // Selected nodes
    multiSelect={true}               // Multiple selection
    checkboxes={true}                // Show checkboxes
    
    // Events
    onNodeClick={(node) => handleNodeClick(node)}
    onNodeExpand={(node) => handleExpand(node)}
    onSelectionChange={(nodes) => handleSelection(nodes)}
    
    // Features
    showLines={true}                 // Tree lines
    showIcons={true}                 // Node icons
    expandAll={false}                // Expand all nodes
    searchable={true}                // Search box
/>
```

## Container Components

### XOSControl
Main container for windows/modals.

```javascript
<XOSControl
    // Identification
    title="Window Title"             // Title bar text
    context={this.props.context}     // Required context
    
    // Loading
    loading={isLoading}              // Loading overlay
    loadingText="Processing..."      // Loading message
    
    // Styling
    className="modal-md"             // Size class
    containerClassName="custom"      // Container class
    wrapperClass="wrapper"           // Wrapper class
    fullHeight={true}                // Full height
    showBorder={true}                // Show border
    
    // Title Bar
    hideTitleBar={false}            // Hide title bar
    hideClose={false}               // Hide close button
    
    // Toast Notifications
    showToaster={showToast}         // Show toast
    toasterConfig={{
        title: 'Success',
        message: 'Operation completed',
        toasterType: 'info',        // info/error/warning/success
        duration: 3000,              // Auto-close (ms)
        onClose: () => {}
    }}
    
    // Panel Buttons
    panelButtons={[
        { 
            text: 'Save', 
            type: 'btn-primary',
            hotKey: 'S',
            id: 'btn_save'
        }
    ]}
    panelButtonHandler={(btn) => handlePanelButton(btn)}
    panelButtonWidth={120}
    
    // Events
    onClose={() => handleClose()}
>
    <XOSBody>
        {/* Content goes here */}
    </XOSBody>
</XOSControl>
```

### XOSBody
Content wrapper for XOSControl.

```javascript
<XOSBody>
    {/* Your content */}
</XOSBody>
```

### XOSTab
Tab container for multiple views.

```javascript
<XOSTab
    // Configuration
    orientation="top"                // top/bottom/left/right
    context={contextObject}          // Required context
    
    // Features
    zoomEnabled={true}              // Enable zoom buttons
    containerClass="custom-tabs"    // Container class
    className="tab-content"         // Content class
    
    // Reference
    ref={(el) => this.tabRef = el}
/>
```

**Tab Methods (via ref):**
```javascript
// Add tab
this.tabRef.addTab({
    title: 'Tab Title',
    key: 'unique-key',
    url: 'Component/Path',
    destroyOnHide: true,
    isClosable: true,
    data: { /* props */ }
});

// Get all tabs
const tabs = this.tabRef.getTabs();

// Remove tab
this.tabRef.removeTab('tab-key');

// Set active tab
this.tabRef.setActiveTab('tab-key');
```

### XOSOverlay
Loading/blocking overlay.

```javascript
<XOSOverlay
    show={isVisible}                // Show/hide
    loading={true}                  // Show spinner
    text="Please wait..."           // Message text
    transparent={false}             // Transparent background
    onClick={() => handleClick()}   // Click handler
/>
```

## Specialized Components

### XOSEditor
Rich text editor.

```javascript
<XOSEditor
    value={htmlContent}             // HTML content
    onChange={(content) => handler(content)}
    
    // Toolbar
    buttonList={[                   // Toolbar buttons
        ['bold', 'italic', 'underline'],
        ['formatBlock', 'list'],
        ['table', 'image', 'link']
    ]}
    
    // Configuration
    height="400px"                  // Editor height
    placeholder="Enter content..."  // Placeholder
    readOnly={false}                // Read-only mode
/>
```

### XOSIFrame
Iframe wrapper.

```javascript
<XOSIFrame
    src={url}                       // Source URL
    width="100%"                    // Width
    height="600px"                  // Height
    onLoad={() => handleLoad()}    // Load handler
/>
```

### XOSToaster
Toast notification (usually used via toasterConfig).

```javascript
<XOSToaster
    show={true}
    title="Notification"
    message="Operation completed"
    type="success"                  // success/error/info/warning
    duration={3000}                 // Auto-close (ms)
    position="top-right"            // Position
    onClose={() => handleClose()}
/>
```

## Utility Components

### XOSHorizontalScroller
Horizontal scrolling container.

```javascript
<XOSHorizontalScroller>
    {/* Wide content */}
</XOSHorizontalScroller>
```

### XOSLabel
Formatted label component.

```javascript
<XOSLabel
    text="Label Text"
    mandatory={true}                // Show asterisk
    className="custom-label"
/>
```

### XOSButtonWrapper (Authentication Only)
**NOT a visual button component** - only used for user authentication and authorization.

```javascript
// ONLY use for authentication/authorization, NOT styling
<XOSButtonWrapper
    id="btn_save" 
    formID="CVSM001"
    onClick={(e) => handleClick(e)}
>
    <button className="btn btn-sm btn-primary">
        <i className="fa fa-save"></i> Save
    </button>
</XOSButtonWrapper>

// For most cases, just use regular buttons:
<button 
    type="button"
    className="btn btn-sm btn-primary"
    onClick={handleClick}
>
    <i className="fa fa-save"></i> Save  
</button>
```

**Props:**
- `id` - Button identifier for auth system
- `formID` - Form identifier for auth validation  
- `onClick` - Click handler function
- Does NOT have loading, styling, or visual props

## Enums Reference

### XOSTextboxTypes
```javascript
{
    textbox: 'textbox',
    alphaNumeric: 'alphaNumeric',
    alphabets: 'alphabets',
    numeric: 'numeric',
    time: 'time',
    time24hr: 'time24hr',
    titleCase: 'titleCase',
    sentenceCase: 'sentenceCase',
    password: 'password'
}
```

### XOSNumericTypes
```javascript
{
    negative: 'negative',
    positive: 'positive',
    both: 'both'
}
```

### XOSWindowStyles
```javascript
{
    top: 'top',
    left: 'left',
    right: 'right',
    slideLeft: 'slideLeft',
    slideRight: 'slideRight',
    slideTop: 'slideTop',
    slideBottom: 'slideBottom',
    maximize: 'maximize'
}
```

### XOSMessageboxTypes
```javascript
{
    error: 'error',
    info: 'info',
    question: 'question',
    warning: 'warning',
    none: 'none'
}
```

### PopupLocations
```javascript
{
    left: 'left-bottom',
    leftTop: 'left-top',
    right: 'right-bottom',
    rightTop: 'right-top',
    bottom: 'bottom',
    top: 'top'
}
```

### XOSTabOrientations
```javascript
{
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right'
}
```