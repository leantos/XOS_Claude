# Enhanced UI Templates - Configuration-Driven Automation

## Overview

These enhanced templates enable **one-shot UI generation** through configuration objects. Instead of modifying code, you simply pass a configuration to generate complete, functional UI components.

## Key Features

- **100% Configuration-Driven**: No code changes needed
- **Layout Flexibility**: Multiple layout options per template
- **Field Type Support**: 15+ field types out of the box
- **Automatic Validation**: Built-in required field handling
- **Responsive Design**: Mobile-first, adaptive layouts
- **State Management**: Integrated with ViewModel pattern

## Templates

### 1. SearchListGridTemplate
**Use Cases**: Master data lists, search screens, data grids

**Key Configuration Options**:
- `searchLayout`: 'inline' | 'stacked' - Control search field layout
- `gridColumns`: Define columns with sorting/filtering
- `searchFields`: Configure search inputs dynamically
- `buttons`: Show/hide action buttons

**Example**:
```javascript
const config = {
    title: 'Document Master',
    modalSize: 'modal-md',
    searchLayout: 'inline', // Compact form with inline labels
    searchFields: [
        { type: 'text', name: 'Description', field: 'description', width: '30%' },
        { type: 'select', name: 'Category', field: 'category', width: '25%' },
        { type: 'select', name: 'Status', field: 'status', width: '25%' }
    ],
    gridColumns: [
        { dataIndex: 'Description', title: 'Description', width: '60%', sortable: true },
        { dataIndex: 'Category', title: 'Category', width: '40%', sortable: true }
    ],
    buttons: {
        new: { show: true },
        modify: { show: true },
        close: { show: true }
    }
};

// One-shot generation
<SearchListGridTemplate config={config} />
```

### 2. MasterDetailCRUDTemplate
**Use Cases**: Data entry forms, master maintenance, settings screens

**Key Configuration Options**:
- `layout`: '1-column' | '2-column' | '3-column'
- `sections`: Group related fields
- `validation`: Configure validation behavior
- Field types: text, number, select, date, datetime, textarea, checkbox, radio, custom

**Example**:
```javascript
const config = {
    title: 'User Master',
    layout: '2-column',
    sections: [
        {
            title: 'User Information',
            fields: [
                { type: 'text', name: 'User Code', field: 'userCode', required: true },
                { type: 'text', name: 'Full Name', field: 'fullName', required: true },
                { type: 'select', name: 'Department', field: 'department', optionsSource: 'DepartmentList' },
                { type: 'checkbox', name: 'Active', field: 'isActive', checkboxLabel: 'User is Active' }
            ]
        }
    ]
};
```

### 3. ReportParameterTemplate
**Use Cases**: Report generation, data export, analytics screens

**Key Configuration Options**:
- `layout`: 'cards' | 'flat'
- Date range with quick selection buttons
- Multi-select with "Select All"
- Download format configuration
- Email scheduling options

**Example**:
```javascript
const config = {
    title: 'Sales Report',
    layout: 'cards',
    sections: [
        {
            title: 'Date Range',
            type: 'dateRange',
            quickButtons: ['today', 'thisWeek', 'thisMonth']
        },
        {
            title: 'Filters',
            fields: [
                { type: 'multiselect', name: 'Regions', field: 'regions', showSelectAll: true },
                { type: 'select', name: 'Format', field: 'format' }
            ]
        }
    ],
    downloadFormats: ['pdf', 'excel', 'csv']
};
```

### 4. WorkflowFormTemplate
**Use Cases**: Approval workflows, multi-step processes, request forms

**Key Configuration Options**:
- `layout`: 'accordion' | 'tabs' | 'flat'
- Status tracking bar
- File attachments with drag-drop
- Workflow state management
- History tracking

**Example**:
```javascript
const config = {
    title: 'Leave Request',
    layout: 'accordion',
    statusBar: {
        fields: [
            { label: 'Request ID', field: 'id' },
            { label: 'Status', field: 'status', badge: true }
        ]
    },
    sections: [
        {
            title: 'Request Details',
            fields: [
                { type: 'date', name: 'From Date', field: 'fromDate', required: true },
                { type: 'date', name: 'To Date', field: 'toDate', required: true },
                { type: 'select', name: 'Leave Type', field: 'leaveType' }
            ]
        }
    ],
    states: {
        draft: ['save', 'submit'],
        submitted: ['approve', 'reject'],
        approved: ['close']
    }
};
```

## Field Types Reference

| Type | Description | Configuration Options |
|------|-------------|----------------------|
| text | Text input | maxLength, inputType, placeholder |
| number | Numeric input | min, max, step |
| select | Dropdown | options, optionsSource, displayField, valueField |
| multiselect | Multiple selection | showSelectAll, height |
| date | Date picker | minDate, maxDate |
| datetime | Date & time | minDate, maxDate |
| textarea | Multi-line text | rows, maxLength |
| checkbox | Boolean toggle | checkboxLabel |
| radio | Single choice | options |
| custom | Custom renderer | render function |

## Layout Options

### Search Layouts
- **inline**: Labels beside inputs (compact)
- **stacked**: Labels above inputs (traditional)

### Form Layouts
- **1-column**: Full width fields
- **2-column**: Side-by-side fields
- **3-column**: Three fields per row

### Container Layouts
- **cards**: Sections in card containers
- **flat**: Minimal borders
- **accordion**: Collapsible sections
- **tabs**: Tabbed interface

## Automation Benefits

1. **Consistency**: All UIs follow the same patterns
2. **Speed**: Generate complete UIs in seconds
3. **Maintainability**: Update config, not code
4. **Reusability**: Share configs across projects
5. **Type Safety**: TypeScript support available

## Migration Guide

### From Old Template to Enhanced

**Before** (Code-based):
```javascript
// Had to modify JSX directly
<div className="col-md-6">
    <label>Description</label>
    <input value={vm.Data.description} />
</div>
```

**After** (Config-based):
```javascript
// Just configure
fields: [
    { type: 'text', name: 'Description', field: 'description', width: '50%' }
]
```

## Best Practices

1. **Store configs separately**: Keep configurations in dedicated files
2. **Use TypeScript**: Define interfaces for your configs
3. **Compose configs**: Build complex configs from smaller pieces
4. **Version configs**: Track config changes in version control
5. **Test configs**: Validate configs before deployment

## Example: Complete Document Master

```javascript
import SearchListGridTemplate from './templates/SearchListGridTemplate_Enhanced';

const DocumentMasterScreen = () => {
    const config = {
        title: 'Document Master',
        modalSize: 'modal-md',
        searchLayout: 'inline',
        searchFields: [
            {
                type: 'text',
                name: 'Description',
                field: 'description',
                width: '30%'
            },
            {
                type: 'select',
                name: 'Category',
                field: 'category',
                width: '25%',
                options: [
                    { ID: 'NS', Text: 'Night Shift' },
                    { ID: 'REF', Text: 'Refund' },
                    { ID: 'IA', Text: 'Income Audit' }
                ]
            },
            {
                type: 'select',
                name: 'Status',
                field: 'status',
                width: '25%',
                options: [
                    { ID: 'A', Text: 'Active' },
                    { ID: 'I', Text: 'Inactive' }
                ]
            }
        ],
        gridColumns: [
            {
                dataIndex: 'Description',
                title: 'Description',
                width: '60%',
                sortable: true
            },
            {
                dataIndex: 'Category',
                title: 'Category',
                width: '40%',
                sortable: true
            }
        ],
        buttons: {
            new: { show: true, text: 'New', icon: 'fa-plus' },
            modify: { show: true, text: 'Modify', icon: 'fa-edit' },
            close: { show: true, text: 'Close', icon: 'fa-times' }
        },
        gridSettings: {
            pageSize: 20,
            rowHeight: 'compact'
        }
    };
    
    return <SearchListGridTemplate config={config} />;
};
```

## Automation Script Example

```javascript
// Generate multiple screens from JSON
const screens = [
    { name: 'UserMaster', config: userConfig },
    { name: 'DepartmentMaster', config: deptConfig },
    { name: 'RoleMaster', config: roleConfig }
];

screens.forEach(screen => {
    generateComponent(screen.name, screen.config);
});
```

## Support

For questions or issues with the enhanced templates:
1. Check the field type reference
2. Verify your config structure
3. Review the examples
4. Test with minimal config first

## License

These templates are part of the CVS project and follow the project's licensing terms.