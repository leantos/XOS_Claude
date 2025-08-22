import React from 'react';
import * as cntrl from '../../../xos-components';
import ComponentTemplateVM from './ComponentTemplateVM';

/**
 * XOS Component Template
 * Demonstrates correct patterns for XOS framework components
 * 
 * Key patterns:
 * 1. Extends cntrl.XOSComponent
 * 2. Passes ViewModel to super()
 * 3. Uses three-step event handler pattern
 * 4. All XOS inputs have name prop
 */
export default class ComponentTemplate extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new ComponentTemplateVM(props));
    }
    
    /**
     * CRITICAL: Three-step event handler pattern
     * This pattern ensures inputs work correctly with XOS framework
     */
    handleInputChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;  // Step 1: Get reference to Data
            model[e.name] = e.value;     // Step 2: Update using e.value (NOT e.target.value!)
            this.VM.updateUI();           // Step 3: Trigger re-render (NEVER FORGET!)
        }
    };
    
    /**
     * Handle checkbox changes
     */
    handleCheckboxChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            model[e.name] = e.checked;  // For checkboxes, use e.checked
            this.VM.updateUI();
        }
    };
    
    /**
     * Handle dropdown selection
     */
    handleSelectChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            model[e.name] = e.value;
            this.VM.updateUI();
        }
    };
    
    /**
     * Handle form submission
     */
    handleSubmit = async (e) => {
        e.preventDefault();
        await this.VM.submit();
    };
    
    /**
     * Handle cancel action
     */
    handleCancel = () => {
        this.VM.cancel();
    };
    
    render() {
        // Get all data from ViewModel
        const vm = this.VM;
        const {
            userName,
            email,
            password,
            confirmPassword,
            firstName,
            lastName,
            phoneNumber,
            isActive,
            selectedRole,
            roles,
            isLoading,
            errorMessage,
            successMessage
        } = vm.Data;
        
        return (
            <div className="container mt-4">
                <div className="card">
                    <div className="card-header">
                        <h3>XOS Component Template</h3>
                    </div>
                    
                    <div className="card-body">
                        {/* Error Message */}
                        {errorMessage && (
                            <div className="alert alert-danger" role="alert">
                                <i className="fa fa-exclamation-triangle me-2"></i>
                                {errorMessage}
                            </div>
                        )}
                        
                        {/* Success Message */}
                        {successMessage && (
                            <div className="alert alert-success" role="alert">
                                <i className="fa fa-check-circle me-2"></i>
                                {successMessage}
                            </div>
                        )}
                        
                        <form onSubmit={this.handleSubmit}>
                            <div className="row">
                                {/* Username Field */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Username <span className="text-danger">*</span>
                                    </label>
                                    <cntrl.XOSTextbox
                                        name="userName"  // CRITICAL: name prop required!
                                        value={userName || ''}  // Prevent undefined
                                        onChange={this.handleInputChange}
                                        placeholder="Enter username"
                                        mandatory={true}
                                        disabled={isLoading}
                                        inputType={cntrl.XOSTextboxTypes.textbox}
                                    />
                                </div>
                                
                                {/* Email Field */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    <cntrl.XOSTextbox
                                        name="email"
                                        value={email || ''}
                                        onChange={this.handleInputChange}
                                        placeholder="user@example.com"
                                        mandatory={true}
                                        disabled={isLoading}
                                        inputType={cntrl.XOSTextboxTypes.email}
                                    />
                                </div>
                            </div>
                            
                            <div className="row">
                                {/* First Name */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">First Name</label>
                                    <cntrl.XOSTextbox
                                        name="firstName"
                                        value={firstName || ''}
                                        onChange={this.handleInputChange}
                                        placeholder="Enter first name"
                                        disabled={isLoading}
                                    />
                                </div>
                                
                                {/* Last Name */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Last Name</label>
                                    <cntrl.XOSTextbox
                                        name="lastName"
                                        value={lastName || ''}
                                        onChange={this.handleInputChange}
                                        placeholder="Enter last name"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            
                            <div className="row">
                                {/* Password */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Password <span className="text-danger">*</span>
                                    </label>
                                    <cntrl.XOSTextbox
                                        name="password"
                                        value={password || ''}
                                        onChange={this.handleInputChange}
                                        placeholder="Enter password"
                                        mandatory={true}
                                        disabled={isLoading}
                                        inputType={cntrl.XOSTextboxTypes.password}
                                    />
                                </div>
                                
                                {/* Confirm Password */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Confirm Password <span className="text-danger">*</span>
                                    </label>
                                    <cntrl.XOSTextbox
                                        name="confirmPassword"
                                        value={confirmPassword || ''}
                                        onChange={this.handleInputChange}
                                        placeholder="Re-enter password"
                                        mandatory={true}
                                        disabled={isLoading}
                                        inputType={cntrl.XOSTextboxTypes.password}
                                    />
                                </div>
                            </div>
                            
                            <div className="row">
                                {/* Phone Number */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Phone Number</label>
                                    <cntrl.XOSTextbox
                                        name="phoneNumber"
                                        value={phoneNumber || ''}
                                        onChange={this.handleInputChange}
                                        placeholder="(555) 123-4567"
                                        disabled={isLoading}
                                    />
                                </div>
                                
                                {/* Role Dropdown */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Role</label>
                                    <cntrl.XOSCombobox
                                        name="selectedRole"
                                        value={selectedRole || ''}
                                        onChange={this.handleSelectChange}
                                        disabled={isLoading}
                                        placeholder="Select a role"
                                    >
                                        <option value="">-- Select Role --</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </cntrl.XOSCombobox>
                                </div>
                            </div>
                            
                            {/* Active Checkbox */}
                            <div className="row">
                                <div className="col-md-12 mb-3">
                                    <div className="form-check">
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
                                            Active User
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={this.handleCancel}
                                            disabled={isLoading}
                                        >
                                            <i className="fa fa-times me-2"></i>
                                            Cancel
                                        </button>
                                        
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa fa-save me-2"></i>
                                                    Save
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

// Also export as named export for compatibility
export { ComponentTemplate };