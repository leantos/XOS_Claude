import React from 'react';
import * as cntrl from '../../../xos-components/index';

/**
 * Enhanced Master-Detail CRUD Form Template
 * Configuration-driven template for form-based CRUD operations
 * 
 * Features:
 * - Dynamic field generation from config
 * - Multiple layout options (1-column, 2-column, 3-column)
 * - Automatic validation handling
 * - Configurable buttons
 * - Section grouping support
 * 
 * Usage:
 * Pass a config object to generate the entire form structure
 */

const MasterDetailCRUDTemplate = ({ config, onClose }) => {
    // Default configuration
    const defaultConfig = {
        title: 'Master Form',
        modalSize: 'modal-md',
        layout: '2-column', // '1-column', '2-column', '3-column'
        
        // Form sections with fields
        sections: [
            {
                title: 'Primary Information',
                fields: [
                    {
                        type: 'text',
                        name: 'Code',
                        field: 'code',
                        required: true,
                        maxLength: 10,
                        inputType: 'alphanumeric',
                        width: '50%' // Width in multi-column layout
                    },
                    {
                        type: 'text',
                        name: 'Name',
                        field: 'name',
                        required: true,
                        maxLength: 50,
                        width: '50%'
                    }
                ]
            }
        ],
        
        // Button configuration
        buttons: {
            save: { show: true, text: 'Save', icon: 'fa-save', hotkey: 'S' },
            saveAndNew: { show: false, text: 'Save & New', icon: 'fa-plus', hotkey: 'N' },
            reset: { show: false, text: 'Reset', icon: 'fa-refresh', hotkey: 'R' },
            close: { show: true, text: 'Close', icon: 'fa-times', hotkey: 'C' }
        },
        
        // Validation rules
        validation: {
            showRequiredIndicator: true,
            validateOnSubmit: true,
            validateOnBlur: false
        }
    };
    
    // Merge provided config with defaults
    const finalConfig = React.useMemo(() => ({
        ...defaultConfig,
        ...config,
        sections: config?.sections || defaultConfig.sections,
        buttons: { ...defaultConfig.buttons, ...config?.buttons },
        validation: { ...defaultConfig.validation, ...config?.validation }
    }), [config]);
    
    const vm = React.useMemo(() => new MasterDetailCRUDTemplateVM(finalConfig, onClose), [finalConfig, onClose]);

    React.useEffect(() => {
        vm.loadData();
        return () => vm.dispose();
    }, [vm]);

    // Get column class based on layout and field width
    const getFieldClass = (field, layout) => {
        if (layout === '1-column') {
            return 'col-12';
        } else if (layout === '2-column') {
            return field.width === '100%' ? 'col-12' : 'col-md-6 col-sm-12';
        } else if (layout === '3-column') {
            if (field.width === '100%') return 'col-12';
            if (field.width === '66%') return 'col-md-8 col-sm-12';
            if (field.width === '50%') return 'col-md-6 col-sm-12';
            return 'col-md-4 col-sm-12';
        }
        return 'col-md-6 col-sm-12';
    };

    // Render field based on type
    const renderField = (field, sectionIndex, fieldIndex) => {
        const fieldKey = `${sectionIndex}-${fieldIndex}-${field.field}`;
        const showRequired = finalConfig.validation.showRequiredIndicator && field.required;
        
        return (
            <div key={fieldKey} className={`${getFieldClass(field, finalConfig.layout)} mt-2`}>
                <label htmlFor={field.field}>
                    {field.name}
                    {showRequired && <span className="text-danger"> *</span>}
                </label>
                
                {field.type === 'text' && (
                    <cntrl.XOSTextbox
                        ref={(input) => vm.registerField(field.field, input)}
                        value={vm.Data.Input[field.field] || ''}
                        name={field.field}
                        maxLength={field.maxLength}
                        inputType={field.inputType}
                        placeholder={field.placeholder}
                        onChange={(e) => vm.updateField(field.field, e.target.value)}
                        onBlur={() => finalConfig.validation.validateOnBlur && vm.validateField(field.field)}
                        disabled={field.disabled}
                        readOnly={field.readOnly}
                    />
                )}
                
                {field.type === 'number' && (
                    <cntrl.XOSTextbox
                        ref={(input) => vm.registerField(field.field, input)}
                        value={vm.Data.Input[field.field] || ''}
                        name={field.field}
                        inputType="numeric"
                        min={field.min}
                        max={field.max}
                        placeholder={field.placeholder}
                        onChange={(e) => vm.updateField(field.field, e.target.value)}
                        onBlur={() => finalConfig.validation.validateOnBlur && vm.validateField(field.field)}
                        disabled={field.disabled}
                    />
                )}
                
                {field.type === 'select' && (
                    <cntrl.XOSSelect
                        selectedItem={vm.Data.Input[field.field]}
                        dataSource={field.options || vm.Data[field.optionsSource]}
                        displayField={field.displayField || "Text"}
                        valueField={field.valueField || "ID"}
                        placeholder={field.placeholder || "Select..."}
                        onChange={(item) => vm.updateField(field.field, item)}
                        disabled={field.disabled}
                        allowClear={field.allowClear}
                    />
                )}
                
                {field.type === 'date' && (
                    <cntrl.XOSDatepicker
                        name={field.field}
                        value={vm.Data.Input[field.field]}
                        onChange={(date) => vm.updateField(field.field, date)}
                        minDate={field.minDate}
                        maxDate={field.maxDate}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                    />
                )}
                
                {field.type === 'datetime' && (
                    <cntrl.XOSDateTimePicker
                        name={field.field}
                        value={vm.Data.Input[field.field]}
                        onChange={(datetime) => vm.updateField(field.field, datetime)}
                        minDate={field.minDate}
                        maxDate={field.maxDate}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                    />
                )}
                
                {field.type === 'textarea' && (
                    <textarea
                        className="form-control"
                        name={field.field}
                        rows={field.rows || 3}
                        maxLength={field.maxLength}
                        value={vm.Data.Input[field.field] || ''}
                        placeholder={field.placeholder}
                        onChange={(e) => vm.updateField(field.field, e.target.value)}
                        disabled={field.disabled}
                        readOnly={field.readOnly}
                    />
                )}
                
                {field.type === 'checkbox' && (
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id={field.field}
                            checked={vm.Data.Input[field.field] || false}
                            onChange={(e) => vm.updateField(field.field, e.target.checked)}
                            disabled={field.disabled}
                        />
                        <label className="form-check-label" htmlFor={field.field}>
                            {field.checkboxLabel || field.name}
                        </label>
                    </div>
                )}
                
                {field.type === 'radio' && (
                    <div>
                        {field.options.map((option, idx) => (
                            <div key={idx} className="form-check form-check-inline">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    id={`${field.field}-${idx}`}
                                    name={field.field}
                                    value={option.value}
                                    checked={vm.Data.Input[field.field] === option.value}
                                    onChange={(e) => vm.updateField(field.field, option.value)}
                                    disabled={field.disabled}
                                />
                                <label className="form-check-label" htmlFor={`${field.field}-${idx}`}>
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
                
                {field.type === 'custom' && field.render && (
                    field.render(vm.Data.Input[field.field], (value) => vm.updateField(field.field, value))
                )}
                
                {/* Validation error message */}
                {vm.Data.Errors[field.field] && (
                    <small className="text-danger">{vm.Data.Errors[field.field]}</small>
                )}
            </div>
        );
    };

    // Render button
    const renderButton = (key, button) => {
        if (!button.show) return null;
        
        return (
            <button
                key={key}
                type="button"
                hot-key={button.hotkey}
                className={`btn btn-sm ${button.className || `btn-${key}1`}`}
                onClick={() => vm[key] ? vm[key]() : console.warn(`Handler for ${key} not found`)}
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
            fullHeight={false}
        >
            <cntrl.XOSBody>
                <div className="window-content-area p-3">
                    <form autoComplete='off' onSubmit={(e) => { e.preventDefault(); vm.save(); }}>
                        {finalConfig.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="mb-3">
                                {section.title && (
                                    <h6 className="border-bottom pb-2">{section.title}</h6>
                                )}
                                <div className="row">
                                    {section.fields.map((field, fieldIndex) => 
                                        renderField(field, sectionIndex, fieldIndex)
                                    )}
                                </div>
                            </div>
                        ))}
                    </form>
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

// Example configuration for a User Master form
export const UserMasterConfig = {
    title: 'User Master',
    modalSize: 'modal-lg',
    layout: '2-column',
    sections: [
        {
            title: 'User Information',
            fields: [
                {
                    type: 'text',
                    name: 'User Code',
                    field: 'userCode',
                    required: true,
                    maxLength: 10,
                    inputType: 'alphanumeric',
                    width: '50%'
                },
                {
                    type: 'text',
                    name: 'Full Name',
                    field: 'fullName',
                    required: true,
                    maxLength: 100,
                    width: '50%'
                },
                {
                    type: 'text',
                    name: 'Email',
                    field: 'email',
                    required: true,
                    inputType: 'email',
                    width: '50%'
                },
                {
                    type: 'select',
                    name: 'Department',
                    field: 'department',
                    required: true,
                    optionsSource: 'DepartmentList',
                    width: '50%'
                }
            ]
        },
        {
            title: 'Access Settings',
            fields: [
                {
                    type: 'select',
                    name: 'User Group',
                    field: 'userGroup',
                    required: true,
                    optionsSource: 'UserGroupList',
                    width: '50%'
                },
                {
                    type: 'date',
                    name: 'Valid From',
                    field: 'validFrom',
                    required: true,
                    width: '50%'
                },
                {
                    type: 'date',
                    name: 'Valid To',
                    field: 'validTo',
                    minDate: 'validFrom', // Reference to another field
                    width: '50%'
                },
                {
                    type: 'checkbox',
                    name: 'Active',
                    field: 'isActive',
                    checkboxLabel: 'User is Active',
                    width: '50%'
                }
            ]
        },
        {
            title: 'Additional Information',
            fields: [
                {
                    type: 'textarea',
                    name: 'Remarks',
                    field: 'remarks',
                    rows: 4,
                    maxLength: 500,
                    width: '100%'
                }
            ]
        }
    ],
    buttons: {
        save: { show: true, text: 'Save', icon: 'fa-save' },
        saveAndNew: { show: true, text: 'Save & New', icon: 'fa-plus' },
        close: { show: true, text: 'Close', icon: 'fa-times' }
    },
    validation: {
        showRequiredIndicator: true,
        validateOnSubmit: true,
        validateOnBlur: true
    }
};

export default MasterDetailCRUDTemplate;