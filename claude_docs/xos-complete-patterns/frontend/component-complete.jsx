// ===== XOS COMPONENT COMPLETE PATTERNS =====
// This file contains EVERY UI component pattern for XOS Framework
// Copy the relevant sections and replace [EntityName] with your entity name
// ALL patterns are production-ready with error handling and validation

import React from 'react';
import * as cntrl from '../../xos-components';  // ⚠️ CRITICAL: Always this exact import
import [EntityName]VM from './[EntityName]VM';

// ===== SECTION 1: COMPONENT STRUCTURE (MANDATORY PATTERN) =====
// Lines 10-50: Component declaration and constructor

/**
 * ⚠️ CRITICAL: NEVER change this component structure
 * - Must extend cntrl.XOSComponent
 * - Must pass ViewModel to super()
 * - Must use exact import pattern above
 */
export default class [EntityName] extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new [EntityName]VM(props));  // ✅ REQUIRED: Pass VM to super
        
        // 💡 TIP: Additional constructor logic can go here
        this.fileInputRef = React.createRef();
    }
    
    // ⚠️ CRITICAL: Component lifecycle - called when component mounts
    componentDidMount() {
        // Automatically calls VM.onLoad() if it exists
        if (this.VM && this.VM.onLoad) {
            this.VM.onLoad();
        }
    }
    
    // ===== SECTION 2: EVENT HANDLERS (NEVER CHANGE THESE PATTERNS) =====
    // Lines 50-200: All input handling patterns
    
    /**
     * ⚠️ CRITICAL: Three-step event handler pattern for XOSTextbox
     * Use for: text inputs, email, password, number, textarea
     * NEVER modify this pattern - it ensures inputs work correctly
     */
    handleInputChange = (e) => {
        if (this.VM) {                    // Step 1: Check VM exists
            const model = this.VM.Data;   // Step 2: Get reference to Data
            model[e.name] = e.value;      // Step 3: Use e.value (NOT e.target.value!)
            this.VM.updateUI();           // Step 4: ALWAYS trigger re-render
        }
    };
    
    /**
     * ⚠️ CRITICAL: Checkbox/Toggle handler pattern
     * Use for: checkboxes, toggle switches, boolean values
     */
    handleCheckboxChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            model[e.name] = e.checked;    // NOTE: e.checked not e.value
            this.VM.updateUI();
        }
    };
    
    /**
     * ⚠️ CRITICAL: Dropdown/Select handler pattern
     * Use for: XOSCombobox, select elements, dropdowns
     */
    handleSelectChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            model[e.name] = e.value;      // Use e.value for selects
            this.VM.updateUI();
        }
    };
    
    /**
     * ⚠️ CRITICAL: Grid selection handler
     * Use for: XOSGrid row selection, list selections
     */
    handleGridSelect = (selectedRow, selectedIndex) => {
        if (this.VM) {
            const model = this.VM.Data;
            model.selectedItem = selectedRow;
            model.selectedIndex = selectedIndex;
            this.VM.updateUI();
        }
    };
    
    /**
     * ⚠️ CRITICAL: Grid action handlers
     * Use for: Grid buttons, row actions
     */
    handleGridEdit = (row) => {
        if (this.VM) {
            this.VM.editItem(row);  // Call VM method
        }
    };
    
    handleGridDelete = (row) => {
        if (this.VM) {
            if (window.confirm(`Delete ${row.name || 'this item'}?`)) {
                this.VM.deleteItem(row);
            }
        }
    };
    
    /**
     * ⚠️ CRITICAL: Form submission handler
     * Use for: save operations, form submissions
     */
    handleSubmit = async (e) => {
        e.preventDefault();               // Prevent default form submission
        if (this.VM && this.VM.save) {
            await this.VM.save();
        }
    };
    
    /**
     * Modal control handlers
     * Use for: popup forms, dialogs
     */
    openModal = (modalType = 'default') => {
        if (this.VM) {
            const model = this.VM.Data;
            model.showModal = true;
            model.modalType = modalType;
            this.VM.updateUI();
        }
    };
    
    closeModal = () => {
        if (this.VM) {
            const model = this.VM.Data;
            model.showModal = false;
            model.modalType = '';
            this.VM.updateUI();
        }
    };
    
    /**
     * ⚠️ CRITICAL: File upload handler
     * Use for: file inputs, drag & drop
     */
    handleFileUpload = (e) => {
        if (this.VM) {
            const files = e.target.files;
            const model = this.VM.Data;
            
            if (files && files.length > 0) {
                model.uploadedFiles = Array.from(files);
                
                // Preview for images
                if (files[0].type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        model.imagePreview = event.target.result;
                        this.VM.updateUI();
                    };
                    reader.readAsDataURL(files[0]);
                }
            }
            this.VM.updateUI();
        }
    };
    
    /**
     * Search and filter handlers
     * Use for: search boxes, filter controls
     */
    handleSearch = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            model.searchTerm = e.value;
            
            // Debounce search
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                if (this.VM.search) {
                    this.VM.search(model.searchTerm);
                }
            }, 300);
            
            this.VM.updateUI();
        }
    };
    
    /**
     * Pagination handlers
     * Use for: page navigation, grid pagination
     */
    handlePageChange = (page) => {
        if (this.VM && this.VM.loadPage) {
            this.VM.loadPage(page);
        }
    };
    
    handlePageSizeChange = (pageSize) => {
        if (this.VM && this.VM.changePageSize) {
            this.VM.changePageSize(pageSize);
        }
    };
    
    // ===== SECTION 3: UI HELPER METHODS =====
    // Lines 200-300: Utility methods for rendering
    
    /**
     * Validation helper - shows field errors
     */
    getFieldError = (fieldName) => {
        const { validationErrors } = this.VM.Data;
        return validationErrors && validationErrors[fieldName];
    };
    
    /**
     * Loading helper - shows loading state
     */
    isFieldLoading = (fieldName) => {
        const { loadingFields } = this.VM.Data;
        return loadingFields && loadingFields.includes(fieldName);
    };
    
    /**
     * Render field with error display
     */
    renderFormField = (fieldName, label, inputComponent, required = false) => {
        const error = this.getFieldError(fieldName);
        const loading = this.isFieldLoading(fieldName);
        
        return (
            <div className="mb-3">
                <label className="form-label">
                    {label} {required && <span className="text-danger">*</span>}
                </label>
                {inputComponent}
                {loading && <div className="spinner-border spinner-border-sm ms-2"></div>}
                {error && <div className="invalid-feedback d-block">{error}</div>}
            </div>
        );
    };
    
    // ===== SECTION 4: RENDER METHOD (COMPLETE UI PATTERNS) =====
    // Lines 300-1000: All UI components and layouts
    
    render() {
        // ⚠️ CRITICAL: Always destructure VM and Data like this
        const vm = this.VM;
        if (!vm || !vm.Data) {
            return <div>Loading...</div>;  // Safety check
        }
        
        const {
            // Form fields
            id, name, email, password, confirmPassword, phone, address,
            firstName, lastName, userName, description, notes,
            
            // Selections
            selectedCategory, selectedStatus, selectedRole, selectedUser,
            categories, statuses, roles, users,
            
            // Booleans
            isActive, isEnabled, isVisible, isRequired, isLoading,
            showModal, showAdvanced, showDetails,
            
            // Data collections
            items, gridData, searchResults, filteredItems,
            
            // UI state
            currentPage, pageSize, totalRecords, totalPages,
            searchTerm, sortField, sortDirection,
            selectedItem, selectedItems, selectedIndex,
            
            // File handling
            uploadedFiles, imagePreview, attachments,
            
            // Messages
            errorMessage, successMessage, warningMessage, infoMessage,
            
            // Validation
            validationErrors, isValid,
            
            // Loading states
            loadingFields, savingField,
            
            // Modal state
            modalType, modalData
            
        } = vm.Data;
        
        return (
            <div className="container mt-4">
                {/* ===== GLOBAL LOADING OVERLAY ===== */}
                {isLoading && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 9999 }}>
                        <div className="card p-4">
                            <div className="d-flex align-items-center">
                                <div className="spinner-border me-3" role="status"></div>
                                <span>Loading...</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* ===== MESSAGE ALERTS (ALL TYPES) ===== */}
                {errorMessage && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="fa fa-exclamation-triangle me-2"></i>
                        {errorMessage}
                        <button type="button" className="btn-close" onClick={() => {
                            vm.Data.errorMessage = '';
                            vm.updateUI();
                        }}></button>
                    </div>
                )}
                
                {successMessage && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        <i className="fa fa-check-circle me-2"></i>
                        {successMessage}
                        <button type="button" className="btn-close" onClick={() => {
                            vm.Data.successMessage = '';
                            vm.updateUI();
                        }}></button>
                    </div>
                )}
                
                {warningMessage && (
                    <div className="alert alert-warning alert-dismissible fade show" role="alert">
                        <i className="fa fa-exclamation-circle me-2"></i>
                        {warningMessage}
                        <button type="button" className="btn-close" onClick={() => {
                            vm.Data.warningMessage = '';
                            vm.updateUI();
                        }}></button>
                    </div>
                )}
                
                {infoMessage && (
                    <div className="alert alert-info alert-dismissible fade show" role="alert">
                        <i className="fa fa-info-circle me-2"></i>
                        {infoMessage}
                        <button type="button" className="btn-close" onClick={() => {
                            vm.Data.infoMessage = '';
                            vm.updateUI();
                        }}></button>
                    </div>
                )}
                
                {/* ===== MAIN CARD CONTAINER ===== */}
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">
                            <i className="fa fa-edit me-2"></i>
                            {id ? 'Edit' : 'Create'} [Entity Name]
                        </h3>
                        
                        {/* Header actions */}
                        <div className="btn-group">
                            <button type="button" className="btn btn-outline-secondary btn-sm" 
                                    onClick={() => this.setState({ showAdvanced: !showAdvanced })}>
                                <i className="fa fa-cog me-1"></i>
                                Advanced
                            </button>
                            
                            <button type="button" className="btn btn-outline-info btn-sm" 
                                    onClick={() => this.openModal('help')}>
                                <i className="fa fa-question me-1"></i>
                                Help
                            </button>
                        </div>
                    </div>
                    
                    <div className="card-body">
                        
                        {/* ===== SEARCH AND FILTERS ===== */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <label className="form-label">Search</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="fa fa-search"></i>
                                    </span>
                                    <cntrl.XOSTextbox
                                        name="searchTerm"
                                        value={searchTerm || ''}
                                        onChange={this.handleSearch}
                                        placeholder="Search [entities]..."
                                        disabled={isLoading}
                                    />
                                    {searchTerm && (
                                        <button className="btn btn-outline-secondary" 
                                                onClick={() => {
                                                    vm.Data.searchTerm = '';
                                                    vm.updateUI();
                                                    if (vm.clearSearch) vm.clearSearch();
                                                }}>
                                            <i className="fa fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="col-md-3">
                                <label className="form-label">Category</label>
                                <cntrl.XOSCombobox
                                    name="selectedCategory"
                                    value={selectedCategory || ''}
                                    onChange={this.handleSelectChange}
                                    disabled={isLoading}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </cntrl.XOSCombobox>
                            </div>
                            
                            <div className="col-md-3">
                                <label className="form-label">Status</label>
                                <cntrl.XOSCombobox
                                    name="selectedStatus"
                                    value={selectedStatus || ''}
                                    onChange={this.handleSelectChange}
                                    disabled={isLoading}
                                >
                                    <option value="">All Statuses</option>
                                    {statuses.map(status => (
                                        <option key={status.id} value={status.id}>
                                            {status.name}
                                        </option>
                                    ))}
                                </cntrl.XOSCombobox>
                            </div>
                        </div>
                        
                        {/* ===== MAIN FORM ===== */}
                        <form onSubmit={this.handleSubmit}>
                            
                            {/* ===== BASIC TEXT INPUTS ===== */}
                            <div className="row">
                                <div className="col-md-6">
                                    {this.renderFormField('name', 'Name', (
                                        <cntrl.XOSTextbox
                                            name="name"
                                            value={name || ''}
                                            onChange={this.handleInputChange}
                                            placeholder="Enter name"
                                            mandatory={true}
                                            disabled={isLoading}
                                            inputType={cntrl.XOSTextboxTypes.textbox}
                                        />
                                    ), true)}
                                </div>
                                
                                <div className="col-md-6">
                                    {this.renderFormField('email', 'Email', (
                                        <cntrl.XOSTextbox
                                            name="email"
                                            value={email || ''}
                                            onChange={this.handleInputChange}
                                            placeholder="user@example.com"
                                            mandatory={true}
                                            disabled={isLoading}
                                            inputType={cntrl.XOSTextboxTypes.email}
                                        />
                                    ), true)}
                                </div>
                            </div>
                            
                            {/* ===== PASSWORD INPUTS ===== */}
                            <div className="row">
                                <div className="col-md-6">
                                    {this.renderFormField('password', 'Password', (
                                        <cntrl.XOSTextbox
                                            name="password"
                                            value={password || ''}
                                            onChange={this.handleInputChange}
                                            placeholder="Enter password"
                                            mandatory={!id}  // Required for new records
                                            disabled={isLoading}
                                            inputType={cntrl.XOSTextboxTypes.password}
                                        />
                                    ), !id)}
                                </div>
                                
                                <div className="col-md-6">
                                    {this.renderFormField('confirmPassword', 'Confirm Password', (
                                        <cntrl.XOSTextbox
                                            name="confirmPassword"
                                            value={confirmPassword || ''}
                                            onChange={this.handleInputChange}
                                            placeholder="Re-enter password"
                                            mandatory={!id && password}
                                            disabled={isLoading}
                                            inputType={cntrl.XOSTextboxTypes.password}
                                        />
                                    ), !id && password)}
                                </div>
                            </div>
                            
                            {/* ===== NUMBER AND PHONE INPUTS ===== */}
                            <div className="row">
                                <div className="col-md-6">
                                    {this.renderFormField('phone', 'Phone Number', (
                                        <cntrl.XOSTextbox
                                            name="phone"
                                            value={phone || ''}
                                            onChange={this.handleInputChange}
                                            placeholder="(555) 123-4567"
                                            disabled={isLoading}
                                            inputType={cntrl.XOSTextboxTypes.tel}
                                        />
                                    ))}
                                </div>
                                
                                <div className="col-md-6">
                                    {this.renderFormField('userName', 'Username', (
                                        <cntrl.XOSTextbox
                                            name="userName"
                                            value={userName || ''}
                                            onChange={this.handleInputChange}
                                            placeholder="Enter username"
                                            disabled={isLoading}
                                            inputType={cntrl.XOSTextboxTypes.textbox}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            {/* ===== DROPDOWN SELECTIONS ===== */}
                            <div className="row">
                                <div className="col-md-6">
                                    {this.renderFormField('selectedRole', 'Role', (
                                        <cntrl.XOSCombobox
                                            name="selectedRole"
                                            value={selectedRole || ''}
                                            onChange={this.handleSelectChange}
                                            disabled={isLoading}
                                        >
                                            <option value="">-- Select Role --</option>
                                            {roles.map(role => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </cntrl.XOSCombobox>
                                    ), true)}
                                </div>
                                
                                <div className="col-md-6">
                                    {this.renderFormField('selectedUser', 'Assigned User', (
                                        <cntrl.XOSCombobox
                                            name="selectedUser"
                                            value={selectedUser || ''}
                                            onChange={this.handleSelectChange}
                                            disabled={isLoading}
                                        >
                                            <option value="">-- Select User --</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.firstName} {user.lastName}
                                                </option>
                                            ))}
                                        </cntrl.XOSCombobox>
                                    ))}
                                </div>
                            </div>
                            
                            {/* ===== TEXTAREA INPUTS ===== */}
                            <div className="row">
                                <div className="col-md-6">
                                    {this.renderFormField('description', 'Description', (
                                        <textarea
                                            className="form-control"
                                            name="description"
                                            value={description || ''}
                                            onChange={(e) => this.handleInputChange({
                                                name: 'description',
                                                value: e.target.value
                                            })}
                                            placeholder="Enter description..."
                                            rows="4"
                                            disabled={isLoading}
                                        />
                                    ))}
                                </div>
                                
                                <div className="col-md-6">
                                    {this.renderFormField('address', 'Address', (
                                        <textarea
                                            className="form-control"
                                            name="address"
                                            value={address || ''}
                                            onChange={(e) => this.handleInputChange({
                                                name: 'address',
                                                value: e.target.value
                                            })}
                                            placeholder="Enter full address..."
                                            rows="4"
                                            disabled={isLoading}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            {/* ===== CHECKBOX CONTROLS ===== */}
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-check-group">
                                        <h5>Settings</h5>
                                        
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="isActive"
                                                name="isActive"
                                                checked={isActive || false}
                                                onChange={(e) => this.handleCheckboxChange({
                                                    name: 'isActive',
                                                    checked: e.target.checked
                                                })}
                                                disabled={isLoading}
                                            />
                                            <label className="form-check-label" htmlFor="isActive">
                                                Active
                                            </label>
                                        </div>
                                        
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="isEnabled"
                                                name="isEnabled"
                                                checked={isEnabled || false}
                                                onChange={(e) => this.handleCheckboxChange({
                                                    name: 'isEnabled',
                                                    checked: e.target.checked
                                                })}
                                                disabled={isLoading}
                                            />
                                            <label className="form-check-label" htmlFor="isEnabled">
                                                Enabled
                                            </label>
                                        </div>
                                        
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="isVisible"
                                                name="isVisible"
                                                checked={isVisible || false}
                                                onChange={(e) => this.handleCheckboxChange({
                                                    name: 'isVisible',
                                                    checked: e.target.checked
                                                })}
                                                disabled={isLoading}
                                            />
                                            <label className="form-check-label" htmlFor="isVisible">
                                                Visible
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* ===== FILE UPLOAD SECTION ===== */}
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="mb-3">
                                        <label className="form-label">Attachments</label>
                                        <div className="border border-dashed p-3 text-center">
                                            <input
                                                type="file"
                                                ref={this.fileInputRef}
                                                className="d-none"
                                                multiple
                                                accept=".pdf,.doc,.docx,.jpg,.png,.gif"
                                                onChange={this.handleFileUpload}
                                                disabled={isLoading}
                                            />
                                            
                                            {imagePreview ? (
                                                <div className="mb-3">
                                                    <img src={imagePreview} alt="Preview" 
                                                         className="img-thumbnail" 
                                                         style={{ maxHeight: '200px' }} />
                                                </div>
                                            ) : (
                                                <div className="mb-3">
                                                    <i className="fa fa-cloud-upload fa-3x text-muted"></i>
                                                    <p className="text-muted">Drag files here or click to browse</p>
                                                </div>
                                            )}
                                            
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                onClick={() => this.fileInputRef.current?.click()}
                                                disabled={isLoading}
                                            >
                                                <i className="fa fa-plus me-2"></i>
                                                Choose Files
                                            </button>
                                        </div>
                                        
                                        {/* Show uploaded files */}
                                        {uploadedFiles && uploadedFiles.length > 0 && (
                                            <div className="mt-3">
                                                <h6>Selected Files:</h6>
                                                <ul className="list-group">
                                                    {uploadedFiles.map((file, index) => (
                                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                            <span>
                                                                <i className="fa fa-file me-2"></i>
                                                                {file.name} ({Math.round(file.size / 1024)} KB)
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => {
                                                                    const newFiles = [...uploadedFiles];
                                                                    newFiles.splice(index, 1);
                                                                    vm.Data.uploadedFiles = newFiles;
                                                                    vm.updateUI();
                                                                }}
                                                            >
                                                                <i className="fa fa-trash"></i>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* ===== ACTION BUTTONS ===== */}
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            {/* Secondary actions */}
                                            <button
                                                type="button"
                                                className="btn btn-outline-info me-2"
                                                onClick={() => this.openModal('preview')}
                                                disabled={isLoading}
                                            >
                                                <i className="fa fa-eye me-2"></i>
                                                Preview
                                            </button>
                                            
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary me-2"
                                                onClick={() => vm.reset && vm.reset()}
                                                disabled={isLoading}
                                            >
                                                <i className="fa fa-undo me-2"></i>
                                                Reset
                                            </button>
                                        </div>
                                        
                                        <div>
                                            {/* Primary actions */}
                                            <button
                                                type="button"
                                                className="btn btn-secondary me-2"
                                                onClick={() => vm.cancel && vm.cancel()}
                                                disabled={isLoading}
                                            >
                                                <i className="fa fa-times me-2"></i>
                                                Cancel
                                            </button>
                                            
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={isLoading || !isValid}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa fa-save me-2"></i>
                                                        {id ? 'Update' : 'Create'}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                        
                        {/* ===== DATA GRID SECTION ===== */}
                        {items && items.length > 0 && (
                            <div className="mt-5">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4>
                                        <i className="fa fa-list me-2"></i>
                                        [Entity] List
                                    </h4>
                                    
                                    <div className="d-flex align-items-center">
                                        <label className="me-2">Show:</label>
                                        <select 
                                            className="form-select form-select-sm"
                                            style={{ width: 'auto' }}
                                            value={pageSize}
                                            onChange={(e) => this.handlePageSizeChange(parseInt(e.target.value))}
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                        <span className="ms-2 text-muted">
                                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* ⚠️ CRITICAL: XOSGrid usage pattern */}
                                <cntrl.XOSGrid
                                    data={gridData}
                                    columns={[
                                        { 
                                            field: 'id', 
                                            title: 'ID', 
                                            width: '80px',
                                            sortable: true
                                        },
                                        { 
                                            field: 'name', 
                                            title: 'Name',
                                            sortable: true,
                                            render: (value, row) => (
                                                <span className={row.isActive ? '' : 'text-muted'}>
                                                    {value}
                                                </span>
                                            )
                                        },
                                        { 
                                            field: 'email', 
                                            title: 'Email',
                                            sortable: true
                                        },
                                        { 
                                            field: 'status', 
                                            title: 'Status',
                                            width: '120px',
                                            render: (value, row) => (
                                                <span className={`badge ${row.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                    {row.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            )
                                        },
                                        {
                                            field: 'actions',
                                            title: 'Actions',
                                            width: '150px',
                                            sortable: false,
                                            render: (value, row) => (
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => this.handleGridEdit(row)}
                                                        title="Edit"
                                                    >
                                                        <i className="fa fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => this.handleGridDelete(row)}
                                                        title="Delete"
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </div>
                                            )
                                        }
                                    ]}
                                    onRowSelect={this.handleGridSelect}
                                    selectedRow={selectedItem}
                                    loading={isLoading}
                                    emptyMessage="No records found"
                                />
                                
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <nav className="mt-3">
                                        <ul className="pagination justify-content-center">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => this.handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </button>
                                            </li>
                                            
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                const page = i + 1;
                                                return (
                                                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                        <button 
                                                            className="page-link" 
                                                            onClick={() => this.handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                            
                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => this.handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* ===== MODAL PATTERNS ===== */}
                {showModal && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className={`modal-dialog ${modalType === 'large' ? 'modal-xl' : modalType === 'small' ? 'modal-sm' : 'modal-lg'}`}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {modalType === 'preview' && 'Preview'}
                                        {modalType === 'help' && 'Help'}
                                        {modalType === 'confirm' && 'Confirm Action'}
                                        {!modalType && 'Modal'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={this.closeModal}
                                    ></button>
                                </div>
                                
                                <div className="modal-body">
                                    {modalType === 'preview' && (
                                        <div>
                                            <h6>Data Preview:</h6>
                                            <pre className="bg-light p-3 rounded">
                                                {JSON.stringify({
                                                    name, email, phone, description
                                                }, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                    
                                    {modalType === 'help' && (
                                        <div>
                                            <h6>Help Topics:</h6>
                                            <ul>
                                                <li>Fill in all required fields marked with *</li>
                                                <li>Email must be in valid format</li>
                                                <li>Password must be at least 8 characters</li>
                                                <li>Use the search box to filter results</li>
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {modalType === 'confirm' && modalData && (
                                        <div>
                                            <p>{modalData.message}</p>
                                            <p><strong>This action cannot be undone.</strong></p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="modal-footer">
                                    {modalType === 'confirm' ? (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={this.closeModal}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => {
                                                    if (modalData && modalData.callback) {
                                                        modalData.callback();
                                                    }
                                                    this.closeModal();
                                                }}
                                            >
                                                Confirm
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={this.closeModal}
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    // ===== SECTION 5: CLEANUP =====
    componentWillUnmount() {
        // Clear any timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
    }
}

// ✅ CRITICAL: Also export as named export for compatibility
export { [EntityName] };

// ===== USAGE NOTES =====
/*
⚠️ CRITICAL PATTERNS TO NEVER CHANGE:
1. Component extends cntrl.XOSComponent
2. ViewModel passed to super(props, new VM(props))
3. Import pattern: import * as cntrl from '../../xos-components'
4. Event handlers use three-step pattern
5. All XOS inputs have 'name' prop
6. Always call updateUI() after data changes

✅ CUSTOMIZATION POINTS:
1. Replace [EntityName] with your entity name
2. Modify form fields based on your data model
3. Customize grid columns for your data
4. Add/remove validation rules
5. Customize modal content
6. Add custom business logic to event handlers

💡 PERFORMANCE TIPS:
1. Use loading states for better UX
2. Debounce search input (already implemented)
3. Implement pagination for large datasets
4. Use React.memo for child components if needed

🛡️ SECURITY CONSIDERATIONS:
1. All input validation should be in ViewModel
2. Sanitize user input before display
3. Use proper authentication checks
4. Validate file uploads

🔥 OPTIMIZATION NOTES:
1. Grid rendering is optimized by XOSGrid component
2. Modal is conditionally rendered
3. Search is debounced to reduce API calls
4. File preview only for image files
*/