import React from 'react';
import * as cntrl from '../../../xos-components/index';

/**
 * Enhanced Workflow Form Template
 * Configuration-driven template for complex workflow forms
 * 
 * Features:
 * - Dynamic workflow sections from config
 * - Status tracking and history
 * - File attachments with drag-drop
 * - Configurable approval/rejection buttons
 * - Comments and notes sections
 * - Conditional rendering based on workflow state
 * 
 * Usage:
 * Pass a config object to generate the entire workflow form
 */

const WorkflowFormTemplate = ({ config, onClose, workflowId = null }) => {
    // Default configuration
    const defaultConfig = {
        title: 'Workflow Form',
        modalSize: 'modal-xl',
        layout: 'accordion', // 'accordion', 'tabs', 'flat'
        
        // Workflow status bar
        statusBar: {
            show: true,
            fields: [
                { label: 'Request ID', field: 'requestId', width: '33%' },
                { label: 'Status', field: 'status', width: '33%', badge: true },
                { label: 'Created', field: 'createdDate', width: '34%', format: 'datetime' }
            ]
        },
        
        // Workflow sections
        sections: [
            {
                title: 'Request Details',
                icon: 'fa-file-text-o',
                expanded: true,
                fields: [
                    {
                        type: 'select',
                        name: 'Request Type',
                        field: 'requestType',
                        required: true,
                        optionsSource: 'RequestTypes',
                        width: '50%'
                    },
                    {
                        type: 'select',
                        name: 'Priority',
                        field: 'priority',
                        optionsSource: 'PriorityList',
                        width: '50%'
                    }
                ]
            }
        ],
        
        // Attachments configuration
        attachments: {
            enabled: true,
            maxFiles: 5,
            maxFileSize: 10485760, // 10MB
            allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
            dragDrop: true
        },
        
        // Comments/Notes section
        comments: {
            enabled: true,
            title: 'Comments',
            placeholder: 'Enter your comments here...',
            maxLength: 1000,
            required: false
        },
        
        // History tracking
        history: {
            enabled: true,
            title: 'Workflow History',
            showUser: true,
            showDate: true,
            showAction: true,
            showComments: true
        },
        
        // Workflow buttons
        buttons: {
            save: { show: true, text: 'Save Draft', icon: 'fa-save', className: 'btn-primary' },
            submit: { show: true, text: 'Submit', icon: 'fa-send', className: 'btn-primary' },
            approve: { show: false, text: 'Approve', icon: 'fa-check', className: 'btn-primary' },
            reject: { show: false, text: 'Reject', icon: 'fa-times', className: 'btn-primary' },
            sendBack: { show: false, text: 'Send Back', icon: 'fa-undo', className: 'btn-primary' },
            cancel: { show: false, text: 'Cancel Request', icon: 'fa-ban', className: 'btn-primary' },
            close: { show: true, text: 'Close', icon: 'fa-times', className: 'btn-primary' }
        },
        
        // Workflow states configuration
        states: {
            draft: ['save', 'submit', 'close'],
            submitted: ['approve', 'reject', 'sendBack', 'close'],
            approved: ['close'],
            rejected: ['close'],
            cancelled: ['close']
        }
    };
    
    // Merge provided config with defaults
    const finalConfig = React.useMemo(() => ({
        ...defaultConfig,
        ...config,
        statusBar: { ...defaultConfig.statusBar, ...config?.statusBar },
        sections: config?.sections || defaultConfig.sections,
        attachments: { ...defaultConfig.attachments, ...config?.attachments },
        comments: { ...defaultConfig.comments, ...config?.comments },
        history: { ...defaultConfig.history, ...config?.history },
        buttons: { ...defaultConfig.buttons, ...config?.buttons },
        states: { ...defaultConfig.states, ...config?.states }
    }), [config]);
    
    const vm = React.useMemo(() => new WorkflowFormTemplateVM(finalConfig, onClose, workflowId), [finalConfig, onClose, workflowId]);

    React.useEffect(() => {
        vm.loadData();
        return () => vm.dispose();
    }, [vm]);

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'draft': 'secondary',
            'submitted': 'info',
            'inprogress': 'warning',
            'approved': 'success',
            'rejected': 'danger',
            'cancelled': 'dark'
        };
        return statusMap[status?.toLowerCase()] || 'secondary';
    };

    // Render status bar field
    const renderStatusBarField = (field) => {
        const value = vm.Data.Workflow[field.field];
        let displayValue = value;
        
        if (field.format === 'datetime' && value) {
            displayValue = Utils.formatDateTime(value);
        } else if (field.format === 'date' && value) {
            displayValue = Utils.formatDate(value);
        }
        
        return (
            <div className={`col-md-${field.width?.replace('%', '') / 100 * 12 || 4}`} key={field.field}>
                <label>{field.label}:</label>
                {field.badge ? (
                    <span className={`badge ml-2 badge-${getStatusBadgeClass(value)}`}>
                        {displayValue}
                    </span>
                ) : (
                    <strong className="ml-2">{displayValue}</strong>
                )}
            </div>
        );
    };

    // Render field (reuse from MasterDetailCRUDTemplate logic)
    const renderField = (field, sectionIndex, fieldIndex) => {
        const fieldKey = `${sectionIndex}-${fieldIndex}-${field.field}`;
        const colClass = field.width === '100%' ? 'col-12' : 'col-md-6 col-sm-12';
        const isEditable = vm.Data.IsEditable && !field.readOnly;
        
        return (
            <div key={fieldKey} className={`${colClass} mt-2`}>
                <label htmlFor={field.field}>
                    {field.name}
                    {field.required && <span className="text-danger"> *</span>}
                </label>
                
                {/* Field rendering logic similar to MasterDetailCRUDTemplate */}
                {field.type === 'text' && (
                    <cntrl.XOSTextbox
                        value={vm.Data.Workflow[field.field] || ''}
                        onChange={(e) => vm.updateField(field.field, e.target.value)}
                        disabled={!isEditable}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                    />
                )}
                
                {field.type === 'select' && (
                    <cntrl.XOSSelect
                        selectedItem={vm.Data.Workflow[field.field]}
                        dataSource={field.options || vm.Data[field.optionsSource]}
                        displayField={field.displayField || "Name"}
                        valueField={field.valueField || "Id"}
                        onChange={(item) => vm.updateField(field.field, item)}
                        disabled={!isEditable}
                        placeholder={field.placeholder || "Select..."}
                    />
                )}
                
                {field.type === 'date' && (
                    <cntrl.XOSDatepicker
                        value={vm.Data.Workflow[field.field]}
                        onChange={(date) => vm.updateField(field.field, date)}
                        disabled={!isEditable}
                        minDate={field.minDate}
                        maxDate={field.maxDate}
                    />
                )}
                
                {field.type === 'textarea' && (
                    <textarea
                        className="form-control"
                        rows={field.rows || 3}
                        value={vm.Data.Workflow[field.field] || ''}
                        onChange={(e) => vm.updateField(field.field, e.target.value)}
                        disabled={!isEditable}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                    />
                )}
                
                {field.type === 'number' && (
                    <cntrl.XOSTextbox
                        inputType="numeric"
                        value={vm.Data.Workflow[field.field] || ''}
                        onChange={(e) => vm.updateField(field.field, e.target.value)}
                        disabled={!isEditable}
                        min={field.min}
                        max={field.max}
                    />
                )}
            </div>
        );
    };

    // Render section based on layout type
    const renderSection = (section, index) => {
        const content = (
            <div className="row">
                {section.fields.map((field, fieldIndex) => 
                    renderField(field, index, fieldIndex)
                )}
            </div>
        );

        if (finalConfig.layout === 'accordion') {
            return (
                <div key={index} className="card">
                    <div className="card-header" id={`heading${index}`}>
                        <h5 className="mb-0">
                            <button
                                className="btn btn-link"
                                type="button"
                                data-toggle="collapse"
                                data-target={`#collapse${index}`}
                                aria-expanded={section.expanded ? "true" : "false"}
                            >
                                {section.icon && <i className={`fa ${section.icon}`}></i>} {section.title}
                            </button>
                        </h5>
                    </div>
                    <div
                        id={`collapse${index}`}
                        className={`collapse ${section.expanded ? 'show' : ''}`}
                        data-parent="#workflowAccordion"
                    >
                        <div className="card-body">
                            {content}
                        </div>
                    </div>
                </div>
            );
        } else if (finalConfig.layout === 'tabs') {
            // Tab implementation would go here
            return null;
        } else {
            // Flat layout
            return (
                <div key={index} className="mb-4">
                    <h5 className="border-bottom pb-2">
                        {section.icon && <i className={`fa ${section.icon}`}></i>} {section.title}
                    </h5>
                    {content}
                </div>
            );
        }
    };

    // Render attachments section
    const renderAttachments = () => {
        if (!finalConfig.attachments.enabled) return null;
        
        return (
            <div className="card mt-3">
                <div className="card-header">
                    <h5 className="mb-0">
                        <i className="fa fa-paperclip"></i> Attachments
                    </h5>
                </div>
                <div className="card-body">
                    <div 
                        className={`attachment-dropzone ${vm.Data.IsDragging ? 'dragging' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); vm.Data.IsDragging = true; }}
                        onDragLeave={() => vm.Data.IsDragging = false}
                        onDrop={(e) => vm.handleFileDrop(e)}
                    >
                        <div className="text-center p-3">
                            <i className="fa fa-cloud-upload fa-3x text-muted"></i>
                            <p className="mt-2">Drag & drop files here or click to browse</p>
                            <input
                                type="file"
                                multiple
                                accept={finalConfig.attachments.allowedTypes.map(t => `.${t}`).join(',')}
                                onChange={(e) => vm.handleFileSelect(e)}
                                style={{ display: 'none' }}
                                id="fileInput"
                            />
                            <label htmlFor="fileInput" className="btn btn-sm btn-add">
                                Select Files
                            </label>
                        </div>
                    </div>
                    
                    {vm.Data.Attachments.length > 0 && (
                        <div className="attachment-list mt-3">
                            {vm.Data.Attachments.map((file, idx) => (
                                <div key={idx} className="attachment-item d-flex justify-content-between align-items-center p-2 border rounded mb-2">
                                    <span>
                                        <i className="fa fa-file-o mr-2"></i>
                                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                    </span>
                                    {vm.Data.IsEditable && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => vm.removeAttachment(idx)}
                                        >
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render comments section
    const renderComments = () => {
        if (!finalConfig.comments.enabled) return null;
        
        return (
            <div className="card mt-3">
                <div className="card-header">
                    <h5 className="mb-0">
                        <i className="fa fa-comment"></i> {finalConfig.comments.title}
                    </h5>
                </div>
                <div className="card-body">
                    <textarea
                        className="form-control"
                        rows="4"
                        placeholder={finalConfig.comments.placeholder}
                        value={vm.Data.Workflow.comments || ''}
                        onChange={(e) => vm.updateField('comments', e.target.value)}
                        disabled={!vm.Data.IsEditable}
                        maxLength={finalConfig.comments.maxLength}
                    />
                    {finalConfig.comments.maxLength && (
                        <small className="text-muted">
                            {vm.Data.Workflow.comments?.length || 0} / {finalConfig.comments.maxLength}
                        </small>
                    )}
                </div>
            </div>
        );
    };

    // Render history section
    const renderHistory = () => {
        if (!finalConfig.history.enabled || !vm.Data.History.length) return null;
        
        return (
            <div className="card mt-3">
                <div className="card-header">
                    <h5 className="mb-0">
                        <i className="fa fa-history"></i> {finalConfig.history.title}
                    </h5>
                </div>
                <div className="card-body">
                    <div className="timeline">
                        {vm.Data.History.map((entry, idx) => (
                            <div key={idx} className="timeline-item">
                                <div className="timeline-badge">
                                    <i className="fa fa-circle"></i>
                                </div>
                                <div className="timeline-panel">
                                    <div className="timeline-heading">
                                        {finalConfig.history.showUser && (
                                            <strong>{entry.user}</strong>
                                        )}
                                        {finalConfig.history.showAction && (
                                            <span className="ml-2 badge badge-secondary">{entry.action}</span>
                                        )}
                                        {finalConfig.history.showDate && (
                                            <small className="text-muted float-right">
                                                {Utils.formatDateTime(entry.date)}
                                            </small>
                                        )}
                                    </div>
                                    {finalConfig.history.showComments && entry.comments && (
                                        <div className="timeline-body">
                                            <p>{entry.comments}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Get visible buttons based on workflow state
    const getVisibleButtons = () => {
        const currentState = vm.Data.Workflow.status?.toLowerCase() || 'draft';
        const allowedButtons = finalConfig.states[currentState] || ['close'];
        
        return Object.entries(finalConfig.buttons)
            .filter(([key, button]) => button.show && allowedButtons.includes(key))
            .map(([key, button]) => ({ key, ...button }));
    };

    return (
        <cntrl.XOSControl 
            className={finalConfig.modalSize}
            loading={vm.Data.ShowLoading} 
            title={finalConfig.title}
            fullHeight={finalConfig.layout === 'accordion'}
        >
            <cntrl.XOSBody>
                <div className="window-content-area p-3">
                    {/* Status Bar */}
                    {finalConfig.statusBar.show && (
                        <div className="workflow-status-bar mb-3 p-3 bg-light rounded">
                            <div className="row">
                                {finalConfig.statusBar.fields.map(field => 
                                    renderStatusBarField(field)
                                )}
                            </div>
                        </div>
                    )}

                    {/* Main Form Sections */}
                    <div className={finalConfig.layout === 'accordion' ? 'accordion' : ''} id="workflowAccordion">
                        {finalConfig.sections.map((section, index) => 
                            renderSection(section, index)
                        )}
                    </div>

                    {/* Attachments */}
                    {renderAttachments()}

                    {/* Comments */}
                    {renderComments()}

                    {/* History */}
                    {renderHistory()}
                </div>
            </cntrl.XOSBody>

            {/* Button Area */}
            <div className="window-button-area">
                {getVisibleButtons().map(button => (
                    <button
                        key={button.key}
                        type="button"
                        className={`btn btn-sm ${button.className}`}
                        onClick={() => vm[button.key] ? vm[button.key]() : console.warn(`Handler for ${button.key} not found`)}
                    >
                        <i className={`fa ${button.icon}`}></i> {button.text}
                    </button>
                ))}
            </div>
        </cntrl.XOSControl>
    );
};

// Example configuration for Purchase Request Workflow
export const PurchaseRequestConfig = {
    title: 'Purchase Request',
    modalSize: 'modal-xl',
    layout: 'accordion',
    statusBar: {
        show: true,
        fields: [
            { label: 'Request No', field: 'requestNo', width: '25%' },
            { label: 'Status', field: 'status', width: '25%', badge: true },
            { label: 'Requestor', field: 'requestor', width: '25%' },
            { label: 'Date', field: 'requestDate', width: '25%', format: 'date' }
        ]
    },
    sections: [
        {
            title: 'Request Information',
            icon: 'fa-info-circle',
            expanded: true,
            fields: [
                {
                    type: 'select',
                    name: 'Department',
                    field: 'department',
                    required: true,
                    optionsSource: 'DepartmentList',
                    width: '50%'
                },
                {
                    type: 'select',
                    name: 'Priority',
                    field: 'priority',
                    optionsSource: 'PriorityList',
                    width: '50%'
                },
                {
                    type: 'date',
                    name: 'Required By',
                    field: 'requiredDate',
                    required: true,
                    minDate: new Date(),
                    width: '50%'
                },
                {
                    type: 'number',
                    name: 'Estimated Cost',
                    field: 'estimatedCost',
                    required: true,
                    min: 0,
                    width: '50%'
                }
            ]
        },
        {
            title: 'Item Details',
            icon: 'fa-shopping-cart',
            expanded: false,
            fields: [
                {
                    type: 'textarea',
                    name: 'Item Description',
                    field: 'itemDescription',
                    required: true,
                    rows: 4,
                    maxLength: 500,
                    width: '100%'
                },
                {
                    type: 'text',
                    name: 'Vendor',
                    field: 'vendor',
                    width: '50%'
                },
                {
                    type: 'text',
                    name: 'Justification',
                    field: 'justification',
                    required: true,
                    width: '50%'
                }
            ]
        }
    ],
    attachments: {
        enabled: true,
        maxFiles: 3,
        allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx']
    },
    comments: {
        enabled: true,
        title: 'Additional Notes',
        required: false
    },
    history: {
        enabled: true,
        showUser: true,
        showDate: true,
        showAction: true,
        showComments: true
    },
    states: {
        draft: ['save', 'submit', 'close'],
        submitted: ['approve', 'reject', 'sendBack', 'close'],
        approved: ['close'],
        rejected: ['save', 'submit', 'close']
    },
    buttons: {
        save: { show: true },
        submit: { show: true },
        approve: { show: true },
        reject: { show: true },
        sendBack: { show: true },
        close: { show: true }
    }
};

export default WorkflowFormTemplate;