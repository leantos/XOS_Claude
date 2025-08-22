import { VMBase } from '../../../xos-components/VMBase';
import { Utils } from '../../../xos-components/Utils';

/**
 * ViewModel for ComponentTemplate
 * Follows XOS MVVM pattern with VMBase
 * 
 * CRITICAL: Uses Data reference pattern to avoid "Cannot set property Data" error
 */
export default class ComponentTemplateVM extends VMBase {
    constructor(props) {
        super(props);
        this.init();
    }
    
    /**
     * Initialize Data properties
     * MUST use reference pattern: const model = this.Data
     */
    init() {
        // ✅ CORRECT: Get reference to Data, then set properties
        const model = this.Data;
        
        // Form fields
        model.userName = '';
        model.email = '';
        model.password = '';
        model.confirmPassword = '';
        model.firstName = '';
        model.lastName = '';
        model.phoneNumber = '';
        model.isActive = false;
        model.selectedRole = '';
        
        // UI state
        model.isLoading = false;
        model.errorMessage = '';
        model.successMessage = '';
        
        // Data lists
        model.roles = [];
        
        // ❌ NEVER DO: this.Data = { userName: '' }
        // This will throw "Cannot set property Data" error
    }
    
    /**
     * Component lifecycle - called when component mounts
     */
    async onLoad() {
        await this.loadRoles();
    }
    
    /**
     * Load roles for dropdown
     */
    async loadRoles() {
        const model = this.Data;
        model.isLoading = true;
        this.updateUI();
        
        try {
            // Example API call using XOS Utils
            const response = await Utils.ajax({
                url: '/api/roles/list',
                data: {}
            });
            
            model.roles = response.data || [];
        } catch (error) {
            model.errorMessage = 'Failed to load roles';
        } finally {
            model.isLoading = false;
            this.updateUI();
        }
    }
    
    /**
     * Validate form before submission
     * @returns {string|null} Error message or null if valid
     */
    validateForm() {
        const model = this.Data;
        
        // Required field validation
        if (!model.userName) {
            return 'Username is required';
        }
        
        if (!model.email) {
            return 'Email is required';
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(model.email)) {
            return 'Invalid email format';
        }
        
        // Password validation
        if (!model.password) {
            return 'Password is required';
        }
        
        if (model.password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        
        if (model.password !== model.confirmPassword) {
            return 'Passwords do not match';
        }
        
        return null; // Valid
    }
    
    /**
     * Submit form data
     */
    async submit() {
        const model = this.Data;
        
        // Clear previous messages
        model.errorMessage = '';
        model.successMessage = '';
        this.updateUI();
        
        // Validate
        const validationError = this.validateForm();
        if (validationError) {
            model.errorMessage = validationError;
            this.updateUI();
            return false;
        }
        
        // Submit
        model.isLoading = true;
        this.updateUI();
        
        try {
            const response = await Utils.ajax({
                url: '/api/users/create',
                data: {
                    userName: model.userName,
                    email: model.email,
                    password: model.password,
                    firstName: model.firstName,
                    lastName: model.lastName,
                    phoneNumber: model.phoneNumber,
                    isActive: model.isActive,
                    roleId: model.selectedRole
                }
            });
            
            model.successMessage = 'User created successfully!';
            this.clearForm();
            return true;
            
        } catch (error) {
            model.errorMessage = error.message || 'Failed to create user';
            return false;
        } finally {
            model.isLoading = false;
            this.updateUI();
        }
    }
    
    /**
     * Clear form fields
     */
    clearForm() {
        const model = this.Data;
        
        model.userName = '';
        model.email = '';
        model.password = '';
        model.confirmPassword = '';
        model.firstName = '';
        model.lastName = '';
        model.phoneNumber = '';
        model.isActive = false;
        model.selectedRole = '';
        
        this.updateUI();
    }
    
    /**
     * Cancel and reset form
     */
    cancel() {
        const model = this.Data;
        
        this.clearForm();
        model.errorMessage = '';
        model.successMessage = '';
        
        this.updateUI();
    }
}

// Also export as named export for compatibility
export { ComponentTemplateVM };