import React from 'react';
import * as cntrl from '../../../xos-components/index';

/**
 * Enhanced Report Parameter Form Template
 * Configuration-driven template for report parameter selection
 * 
 * Features:
 * - Dynamic parameter sections from config
 * - Date range with quick selection buttons
 * - Multi-select with "Select All" functionality  
 * - Configurable download formats
 * - Email scheduling options
 * - Card or flat layout options
 * 
 * Usage:
 * Pass a config object to generate the entire report parameter form
 */

const ReportParameterTemplate = ({ config, onClose }) => {
    // Default configuration
    const defaultConfig = {
        title: 'Report Parameters',
        modalSize: 'modal-md',
        layout: 'cards', // 'cards' or 'flat'
        
        // Parameter sections
        sections: [
            {
                title: 'Date Range',
                icon: 'fa-calendar',
                type: 'dateRange',
                fields: [
                    {
                        type: 'date',
                        name: 'From Date',
                        field: 'fromDate',
                        required: true,
                        width: '50%'
                    },
                    {
                        type: 'date', 
                        name: 'To Date',
                        field: 'toDate',
                        required: true,
                        width: '50%'
                    }
                ],
                quickButtons: ['today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth']
            }
        ],
        
        // Download formats
        downloadFormats: [
            { value: 'pdf', label: 'PDF Format', icon: 'fa-file-pdf-o', iconColor: 'text-danger' },
            { value: 'excel', label: 'Excel Format', icon: 'fa-file-excel-o', iconColor: 'text-success' },
            { value: 'csv', label: 'CSV Format', icon: 'fa-file-text-o', iconColor: 'text-primary' }
        ],
        
        // Button configuration
        buttons: {
            preview: { show: true, text: 'Preview', icon: 'fa-eye', className: 'btn-primary' },
            download: { show: true, text: 'Download', icon: 'fa-download', className: 'btn-success' },
            email: { show: false, text: 'Email', icon: 'fa-envelope', className: 'btn-info' },
            save: { show: false, text: 'Save Parameters', icon: 'fa-save', className: 'btn-info' },
            reset: { show: true, text: 'Reset', icon: 'fa-refresh', className: 'btn-warning' },
            close: { show: true, text: 'Close', icon: 'fa-times', className: 'btn-close1' }
        },
        
        // Additional options
        additionalOptions: {
            show: true,
            options: [
                { field: 'includeInactive', label: 'Include Inactive Records', default: false },
                { field: 'showSummary', label: 'Show Summary Section', default: true },
                { field: 'showGraphs', label: 'Include Graphs/Charts', default: false }
            ]
        },
        
        // Email scheduling
        emailScheduling: {
            enabled: false,
            frequencies: ['once', 'daily', 'weekly', 'monthly']
        }
    };
    
    // Merge provided config with defaults
    const finalConfig = React.useMemo(() => ({
        ...defaultConfig,
        ...config,
        sections: config?.sections || defaultConfig.sections,
        buttons: { ...defaultConfig.buttons, ...config?.buttons },
        downloadFormats: config?.downloadFormats || defaultConfig.downloadFormats,
        additionalOptions: { ...defaultConfig.additionalOptions, ...config?.additionalOptions },
        emailScheduling: { ...defaultConfig.emailScheduling, ...config?.emailScheduling }
    }), [config]);
    
    const vm = React.useMemo(() => new ReportParameterTemplateVM(finalConfig, onClose), [finalConfig, onClose]);

    React.useEffect(() => {
        vm.loadData();
        return () => vm.dispose();
    }, [vm]);

    // Render field based on type
    const renderField = (field, sectionIndex, fieldIndex) => {
        const fieldKey = `${sectionIndex}-${fieldIndex}-${field.field}`;
        const colClass = field.width === '100%' ? 'col-12' : 'col-md-6 col-sm-12';
        
        return (
            <div key={fieldKey} className={`${colClass} mt-2`}>
                <label htmlFor={field.field}>
                    {field.name}
                    {field.required && <span className="text-danger"> *</span>}
                </label>
                
                {field.type === 'date' && (
                    <cntrl.XOSDatepicker
                        name={field.field}
                        value={vm.Data.Parameters[field.field]}
                        onChange={(date) => vm.updateParameter(field.field, date)}
                        minDate={field.minDate}
                        maxDate={field.maxDate || new Date()}
                        placeholder={field.placeholder}
                    />
                )}
                
                {field.type === 'select' && (
                    <cntrl.XOSSelect
                        selectedItem={vm.Data.Parameters[field.field]}
                        dataSource={field.options || vm.Data[field.optionsSource]}
                        displayField={field.displayField || "Name"}
                        valueField={field.valueField || "Id"}
                        placeholder={field.placeholder || "Select..."}
                        onChange={(item) => vm.updateParameter(field.field, item)}
                        allowClear={field.allowClear}
                    />
                )}
                
                {field.type === 'multiselect' && (
                    <div className="multi-select-container">
                        {field.showSelectAll && (
                            <div className="form-check mb-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`selectAll_${field.field}`}
                                    checked={vm.Data[`All${field.field}Selected`]}
                                    onChange={(e) => vm.toggleAll(field.field, e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor={`selectAll_${field.field}`}>
                                    <strong>Select All</strong>
                                </label>
                            </div>
                        )}
                        <div className="multi-select-list" style={{ 
                            maxHeight: field.height || '150px', 
                            overflowY: 'auto', 
                            border: '1px solid #ced4da', 
                            borderRadius: '4px', 
                            padding: '5px' 
                        }}>
                            {(field.options || vm.Data[field.optionsSource] || []).map((option) => (
                                <div key={option.Id || option.value} className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`${field.field}_${option.Id || option.value}`}
                                        checked={vm.Data.Parameters[field.field]?.includes(option.Id || option.value)}
                                        onChange={(e) => vm.toggleItem(field.field, option.Id || option.value, e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor={`${field.field}_${option.Id || option.value}`}>
                                        {option.Name || option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {field.type === 'radio' && (
                    <div>
                        {field.options.map((option, idx) => (
                            <div key={idx} className="form-check form-check-inline">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name={field.field}
                                    id={`${field.field}_${idx}`}
                                    checked={vm.Data.Parameters[field.field] === option.value}
                                    onChange={() => vm.updateParameter(field.field, option.value)}
                                />
                                <label className="form-check-label" htmlFor={`${field.field}_${idx}`}>
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
                
                {field.type === 'text' && (
                    <input
                        type="text"
                        className="form-control"
                        value={vm.Data.Parameters[field.field] || ''}
                        onChange={(e) => vm.updateParameter(field.field, e.target.value)}
                        placeholder={field.placeholder}
                    />
                )}
                
                {field.type === 'number' && (
                    <input
                        type="number"
                        className="form-control"
                        value={vm.Data.Parameters[field.field] || ''}
                        onChange={(e) => vm.updateParameter(field.field, e.target.value)}
                        min={field.min}
                        max={field.max}
                        placeholder={field.placeholder}
                    />
                )}
            </div>
        );
    };

    // Render section
    const renderSection = (section, sectionIndex) => {
        const content = (
            <>
                <div className="row">
                    {section.fields.map((field, fieldIndex) => 
                        renderField(field, sectionIndex, fieldIndex)
                    )}
                </div>
                
                {/* Quick date buttons for date range sections */}
                {section.type === 'dateRange' && section.quickButtons && (
                    <div className="row mt-2">
                        <div className="col-12">
                            <div className="btn-group btn-group-sm" role="group">
                                {section.quickButtons.map(button => (
                                    <button
                                        key={button}
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => vm.setDateRange(button)}
                                    >
                                        {button.charAt(0).toUpperCase() + button.slice(1).replace(/([A-Z])/g, ' $1')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Group by options if specified */}
                {section.groupByOptions && (
                    <div className="row mt-3">
                        <div className="col-12">
                            <label>Group By</label>
                            <div>
                                {section.groupByOptions.map(option => (
                                    <div key={option.value} className="form-check form-check-inline">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            name="groupBy"
                                            id={`group_${option.value}`}
                                            checked={vm.Data.Parameters.groupBy === option.value}
                                            onChange={() => vm.updateParameter('groupBy', option.value)}
                                        />
                                        <label className="form-check-label" htmlFor={`group_${option.value}`}>
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </>
        );

        if (finalConfig.layout === 'cards') {
            return (
                <div key={sectionIndex} className="card mb-3">
                    <div className="card-header">
                        <h6 className="mb-0">
                            {section.icon && <i className={`fa ${section.icon}`}></i>} {section.title}
                        </h6>
                    </div>
                    <div className="card-body">
                        {content}
                    </div>
                </div>
            );
        } else {
            return (
                <div key={sectionIndex} className="mb-3">
                    {section.title && (
                        <h6 className="border-bottom pb-2">
                            {section.icon && <i className={`fa ${section.icon}`}></i>} {section.title}
                        </h6>
                    )}
                    {content}
                </div>
            );
        }
    };

    return (
        <cntrl.XOSControl 
            className={`${finalConfig.modalSize} w-100`}
            loading={vm.Data.ShowLoading} 
            title={finalConfig.title}
            fullHeight={false}
        >
            <cntrl.XOSBody>
                <div className="window-content-area p-3">
                    <form autoComplete='off'>
                        {/* Render all sections */}
                        {finalConfig.sections.map((section, index) => 
                            renderSection(section, index)
                        )}
                        
                        {/* Additional Options */}
                        {finalConfig.additionalOptions.show && (
                            <div className={finalConfig.layout === 'cards' ? 'card' : 'mb-3'}>
                                {finalConfig.layout === 'cards' && (
                                    <div className="card-header">
                                        <h6 className="mb-0">
                                            <i className="fa fa-cog"></i> Additional Options
                                        </h6>
                                    </div>
                                )}
                                <div className={finalConfig.layout === 'cards' ? 'card-body' : ''}>
                                    {finalConfig.layout !== 'cards' && (
                                        <h6 className="border-bottom pb-2">
                                            <i className="fa fa-cog"></i> Additional Options
                                        </h6>
                                    )}
                                    <div className="row">
                                        <div className="col-12">
                                            {finalConfig.additionalOptions.options.map((option, idx) => (
                                                <div key={idx} className="form-check mt-2">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id={option.field}
                                                        checked={vm.Data.Parameters[option.field] || option.default}
                                                        onChange={(e) => vm.updateParameter(option.field, e.target.checked)}
                                                    />
                                                    <label className="form-check-label" htmlFor={option.field}>
                                                        {option.label}
                                                    </label>
                                                </div>
                                            ))}
                                            
                                            {/* Email scheduling if enabled */}
                                            {finalConfig.emailScheduling.enabled && (
                                                <>
                                                    <div className="form-check mt-3">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="scheduleEmail"
                                                            checked={vm.Data.Parameters.scheduleEmail}
                                                            onChange={(e) => vm.toggleEmailSchedule(e.target.checked)}
                                                        />
                                                        <label className="form-check-label" htmlFor="scheduleEmail">
                                                            Schedule Email Delivery
                                                        </label>
                                                    </div>
                                                    
                                                    {vm.Data.Parameters.scheduleEmail && (
                                                        <div className="email-schedule-options mt-2 p-2 border rounded">
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <label>Email To:</label>
                                                                    <input
                                                                        type="email"
                                                                        className="form-control form-control-sm"
                                                                        value={vm.Data.Parameters.emailTo}
                                                                        onChange={(e) => vm.updateParameter('emailTo', e.target.value)}
                                                                        placeholder="email@example.com"
                                                                    />
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <label>Frequency:</label>
                                                                    <select
                                                                        className="form-control form-control-sm"
                                                                        value={vm.Data.Parameters.emailFrequency}
                                                                        onChange={(e) => vm.updateParameter('emailFrequency', e.target.value)}
                                                                    >
                                                                        {finalConfig.emailScheduling.frequencies.map(freq => (
                                                                            <option key={freq} value={freq}>
                                                                                {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </cntrl.XOSBody>

            {/* Button Area */}
            <div className="window-button-area">
                {finalConfig.buttons.preview.show && (
                    <button
                        type="button"
                        className={`btn btn-sm ${finalConfig.buttons.preview.className}`}
                        onClick={vm.previewReport}
                    >
                        <i className={`fa ${finalConfig.buttons.preview.icon}`}></i> {finalConfig.buttons.preview.text}
                    </button>
                )}
                
                {finalConfig.buttons.download.show && (
                    <div className="btn-group dropup">
                        <button
                            type="button"
                            className={`btn btn-sm ${finalConfig.buttons.download.className} dropdown-toggle`}
                            data-toggle="dropdown"
                        >
                            <i className={`fa ${finalConfig.buttons.download.icon}`}></i> {finalConfig.buttons.download.text}
                        </button>
                        <div className="dropdown-menu">
                            {finalConfig.downloadFormats.map(format => (
                                <a
                                    key={format.value}
                                    className="dropdown-item"
                                    href="#"
                                    onClick={() => vm.downloadReport(format.value)}
                                >
                                    <i className={`fa ${format.icon} ${format.iconColor}`}></i> {format.label}
                                </a>
                            ))}
                            {finalConfig.buttons.email.show && (
                                <>
                                    <div className="dropdown-divider"></div>
                                    <a className="dropdown-item" href="#" onClick={vm.emailReport}>
                                        <i className="fa fa-envelope-o"></i> Email Report
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                )}
                
                {finalConfig.buttons.save.show && (
                    <button
                        type="button"
                        className={`btn btn-sm ${finalConfig.buttons.save.className}`}
                        onClick={vm.saveParameters}
                    >
                        <i className={`fa ${finalConfig.buttons.save.icon}`}></i> {finalConfig.buttons.save.text}
                    </button>
                )}
                
                {finalConfig.buttons.reset.show && (
                    <button
                        type="button"
                        className={`btn btn-sm ${finalConfig.buttons.reset.className}`}
                        onClick={vm.resetParameters}
                    >
                        <i className={`fa ${finalConfig.buttons.reset.icon}`}></i> {finalConfig.buttons.reset.text}
                    </button>
                )}
                
                {finalConfig.buttons.close.show && (
                    <button
                        type="button"
                        hot-key="C"
                        className={`btn btn-sm ${finalConfig.buttons.close.className}`}
                        onClick={vm.close}
                    >
                        <i className={`fa ${finalConfig.buttons.close.icon}`}></i> {finalConfig.buttons.close.text}
                    </button>
                )}
            </div>
        </cntrl.XOSControl>
    );
};

// Example configuration for Income Audit Report
export const IncomeAuditReportConfig = {
    title: 'Income Audit Report',
    modalSize: 'modal-lg',
    layout: 'cards',
    sections: [
        {
            title: 'Date Range',
            icon: 'fa-calendar',
            type: 'dateRange',
            fields: [
                { type: 'date', name: 'From Date', field: 'fromDate', required: true, width: '50%' },
                { type: 'date', name: 'To Date', field: 'toDate', required: true, width: '50%' }
            ],
            quickButtons: ['today', 'yesterday', 'thisWeek', 'thisMonth']
        },
        {
            title: 'Filter Parameters',
            icon: 'fa-filter',
            fields: [
                {
                    type: 'multiselect',
                    name: 'Department(s)',
                    field: 'departments',
                    optionsSource: 'DepartmentList',
                    showSelectAll: true,
                    width: '50%'
                },
                {
                    type: 'multiselect',
                    name: 'Site(s)',
                    field: 'sites',
                    optionsSource: 'SiteList',
                    showSelectAll: true,
                    width: '50%'
                },
                {
                    type: 'select',
                    name: 'Status',
                    field: 'status',
                    options: [
                        { Id: 'all', Name: 'All Statuses' },
                        { Id: 'active', Name: 'Active' },
                        { Id: 'inactive', Name: 'Inactive' }
                    ],
                    width: '50%'
                },
                {
                    type: 'select',
                    name: 'Report Format',
                    field: 'format',
                    options: [
                        { Id: 'detailed', Name: 'Detailed' },
                        { Id: 'summary', Name: 'Summary' }
                    ],
                    width: '50%'
                }
            ],
            groupByOptions: [
                { value: 'none', label: 'None' },
                { value: 'department', label: 'Department' },
                { value: 'site', label: 'Site' },
                { value: 'date', label: 'Date' }
            ]
        }
    ],
    additionalOptions: {
        show: true,
        options: [
            { field: 'includeInactive', label: 'Include Inactive Records', default: false },
            { field: 'showSummary', label: 'Show Summary Section', default: true },
            { field: 'showGraphs', label: 'Include Graphs/Charts', default: true }
        ]
    },
    downloadFormats: [
        { value: 'pdf', label: 'PDF Format', icon: 'fa-file-pdf-o', iconColor: 'text-danger' },
        { value: 'excel', label: 'Excel Format', icon: 'fa-file-excel-o', iconColor: 'text-success' }
    ],
    buttons: {
        preview: { show: true },
        download: { show: true },
        reset: { show: true },
        close: { show: true }
    }
};

export default ReportParameterTemplate;