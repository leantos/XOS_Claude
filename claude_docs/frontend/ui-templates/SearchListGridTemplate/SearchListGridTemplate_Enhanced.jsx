import React from 'react';
import * as cntrl from '../../../xos-components/index';

/**
 * Enhanced Search/List Grid Template with Configurable Layouts
 * 
 * Configuration-driven template that can generate different UI layouts:
 * - Inline labels (compact form style)
 * - Stacked labels (traditional form style)
 * - Customizable grid columns
 * - Configurable button sets
 * 
 * Usage:
 * Pass a config object to customize the entire UI structure
 */

const SearchListGridTemplate = ({ config, onClose }) => {
    // Default configuration
    const defaultConfig = {
        title: 'Master Data',
        modalSize: 'modal-md', // modal-sm, modal-md, modal-lg, modal-xl
        searchLayout: 'inline', // 'inline' or 'stacked'
        
        // Search fields configuration
        searchFields: [
            {
                type: 'text',
                name: 'Description',
                field: 'description',
                width: '30%',
                placeholder: ''
            },
            {
                type: 'select',
                name: 'Category', 
                field: 'category',
                width: '25%',
                placeholder: 'Select...',
                options: []
            },
            {
                type: 'select',
                name: 'Status',
                field: 'status', 
                width: '25%',
                placeholder: 'Select...',
                options: [
                    { ID: 'A', Text: 'Active' },
                    { ID: 'I', Text: 'Inactive' }
                ]
            }
        ],
        
        // Grid columns configuration
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
        
        // Button configuration
        buttons: {
            new: { show: true, text: 'New', icon: 'fa-plus', hotkey: 'N' },
            modify: { show: true, text: 'Modify', icon: 'fa-edit', hotkey: 'M' },
            delete: { show: false, text: 'Delete', icon: 'fa-trash', hotkey: 'D' },
            audit: { show: false, text: '', icon: 'fa-history', hotkey: 'A' },
            export: { show: false, text: 'Export', icon: 'fa-download', hotkey: 'E' },
            close: { show: true, text: 'Close', icon: 'fa-times', hotkey: 'C' }
        },
        
        // Grid settings
        gridSettings: {
            pageSize: 20,
            showPagination: true,
            selectionMode: 'single',
            rowHeight: 'compact', // 'compact', 'normal', 'comfortable'
            striped: true,
            bordered: true,
            hoverable: true
        }
    };
    
    // Merge provided config with defaults
    const finalConfig = { ...defaultConfig, ...config };
    const vm = React.useMemo(() => new SearchListGridTemplateVM(finalConfig, onClose), [finalConfig, onClose]);

    React.useEffect(() => {
        vm.loadData();
        return () => vm.dispose();
    }, [vm]);

    // Render search field based on type and layout
    const renderSearchField = (field) => {
        const labelWidth = finalConfig.searchLayout === 'inline' ? '100px' : 'auto';
        
        if (finalConfig.searchLayout === 'inline') {
            // Inline layout - label and input on same line
            return (
                <div key={field.field} className="d-flex align-items-center mb-2" style={{ width: field.width }}>
                    <label className="mb-0 me-2" style={{ width: labelWidth, minWidth: labelWidth }}>
                        {field.name}
                    </label>
                    {field.type === 'text' ? (
                        <cntrl.XOSTextbox
                            placeholder={field.placeholder}
                            value={vm.Data.SearchInput[field.field]}
                            onChange={(e) => vm.Data.SearchInput[field.field] = e.target.value}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') vm.search();
                            }}
                            className="flex-grow-1"
                        />
                    ) : field.type === 'select' ? (
                        <cntrl.XOSSelect
                            selectedItem={vm.Data.SearchInput[field.field]}
                            dataSource={field.options || vm.Data[field.optionsSource]}
                            displayField="Text"
                            valueField="ID"
                            placeholder={field.placeholder}
                            onChange={(item) => vm.Data.SearchInput[field.field] = item}
                            className="flex-grow-1"
                        />
                    ) : field.type === 'date' ? (
                        <cntrl.XOSDatepicker
                            placeholder={field.placeholder}
                            value={vm.Data.SearchInput[field.field]}
                            onChange={(date) => vm.Data.SearchInput[field.field] = date}
                            className="flex-grow-1"
                        />
                    ) : null}
                </div>
            );
        } else {
            // Stacked layout - label above input
            return (
                <div key={field.field} className="mb-2" style={{ width: field.width }}>
                    <label className="form-label">{field.name}</label>
                    {field.type === 'text' ? (
                        <cntrl.XOSTextbox
                            placeholder={field.placeholder}
                            value={vm.Data.SearchInput[field.field]}
                            onChange={(e) => vm.Data.SearchInput[field.field] = e.target.value}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') vm.search();
                            }}
                        />
                    ) : field.type === 'select' ? (
                        <cntrl.XOSSelect
                            selectedItem={vm.Data.SearchInput[field.field]}
                            dataSource={field.options || vm.Data[field.optionsSource]}
                            displayField="Text"
                            valueField="ID"
                            placeholder={field.placeholder}
                            onChange={(item) => vm.Data.SearchInput[field.field] = item}
                        />
                    ) : field.type === 'date' ? (
                        <cntrl.XOSDatepicker
                            placeholder={field.placeholder}
                            value={vm.Data.SearchInput[field.field]}
                            onChange={(date) => vm.Data.SearchInput[field.field] = date}
                        />
                    ) : null}
                </div>
            );
        }
    };

    // Build grid columns with proper sorting indicators
    const gridColumns = finalConfig.gridColumns.map(col => ({
        ...col,
        text: col.title,
        field: col.dataIndex,
        sort: col.sortable ? { enabled: true } : undefined,
        render: col.render || undefined
    }));

    // Grid attributes
    const gridAttributes = {
        columns: gridColumns,
        dataSource: vm.Data.GridData,
        pagination: finalConfig.gridSettings.showPagination,
        pageSize: finalConfig.gridSettings.pageSize,
        selectionMode: finalConfig.gridSettings.selectionMode,
        selectedRows: vm.Data.SelectedRows,
        onSelectionChange: vm.onGridSelectionChange,
        onDoubleClick: vm.modifyRecord,
        rowClassName: (record) => {
            if (record.Status === 'Inactive' || record.Status === 'I') {
                return 'text-muted inactive-row';
            }
            return '';
        },
        loading: vm.Data.GridLoading,
        striped: finalConfig.gridSettings.striped,
        bordered: finalConfig.gridSettings.bordered,
        hoverable: finalConfig.gridSettings.hoverable,
        // Compact row height
        className: finalConfig.gridSettings.rowHeight === 'compact' ? 'compact-grid' : ''
    };

    // Render button if configured to show
    const renderButton = (key, button) => {
        if (!button.show) return null;
        
        const isDisabled = (key === 'modify' || key === 'delete' || key === 'audit') 
            && (!vm.Data.SelectedRows || vm.Data.SelectedRows.length === 0);
        
        return (
            <button
                key={key}
                type="button"
                hot-key={button.hotkey}
                className={`btn btn-sm ${key === 'close' ? 'btn-close1' : `btn-${key}1`}`}
                onClick={vm[key] || vm[`${key}Record`]}
                disabled={isDisabled}
            >
                <i className={`fa ${button.icon}`}></i>
                {button.text && ` ${button.text}`}
            </button>
        );
    };

    return (
        <cntrl.XOSControl 
            className={finalConfig.modalSize}
            loading={vm.Data.ShowLoading} 
            title={finalConfig.title}
            fullHeight={true}
        >
            <cntrl.XOSBody>
                <div className="window-content-area p-3">
                    {/* Search Section */}
                    <div className="search-section mb-3">
                        <div className="row m-0">
                            {/* Render search fields */}
                            <div className={finalConfig.searchLayout === 'inline' ? 'col-md-9' : 'col-md-10'}>
                                <div className="d-flex flex-wrap">
                                    {finalConfig.searchFields.map(field => renderSearchField(field))}
                                </div>
                            </div>
                            
                            {/* Search and Clear buttons */}
                            <div className={finalConfig.searchLayout === 'inline' ? 'col-md-3' : 'col-md-2'}>
                                <div className="d-flex justify-content-end align-items-end h-100">
                                    <button 
                                        className="btn btn-sm btn-primary me-1"
                                        onClick={vm.search}
                                        title="Search"
                                    >
                                        <i className="fa fa-search"></i>
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-primary"
                                        onClick={vm.clearSearch}
                                        title="Clear"
                                    >
                                        <i className="fa fa-refresh"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid Section */}
                    <div className="grid-section">
                        <div className="row">
                            <div className="col-md-12">
                                <cntrl.XOSGrid {...gridAttributes} />
                            </div>
                        </div>
                    </div>
                </div>
            </cntrl.XOSBody>

            {/* Button Area */}
            <div className="window-button-area">
                <div className="d-flex justify-content-center">
                    {Object.entries(finalConfig.buttons).map(([key, button]) => 
                        renderButton(key, button)
                    )}
                </div>
            </div>
        </cntrl.XOSControl>
    );
};

// Example usage with configuration
export const DocumentMasterConfig = {
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
            placeholder: 'Select...',
            optionsSource: 'CategoryList'
        },
        {
            type: 'select',
            name: 'Status',
            field: 'status',
            width: '25%',
            placeholder: 'Select...',
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
        audit: { show: false },
        close: { show: true, text: 'Close', icon: 'fa-times' }
    }
};

export default SearchListGridTemplate;