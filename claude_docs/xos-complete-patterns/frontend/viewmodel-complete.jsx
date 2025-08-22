// ===== XOS VIEWMODEL COMPLETE PATTERNS =====
// This file contains EVERY ViewModel pattern for XOS Framework
// Follow the Data reference pattern EXACTLY - violating this causes "Cannot set property Data" errors

import { VMBase } from '../../xos-components/VMBase';
import { Utils } from '../../xos-components/Utils';

// ===== SECTION 1: VIEWMODEL STRUCTURE (MANDATORY PATTERN) =====
// Lines 10-100: Basic structure and initialization

/**
 * ⚠️ CRITICAL: ViewModel structure that MUST be followed exactly
 * - Always extend VMBase
 * - Always call init() in constructor
 * - NEVER set this.Data = {} (causes errors)
 * - Always use Data reference pattern
 */
export default class [EntityName]VM extends VMBase {
    constructor(props) {
        super(props);
        this.init();  // ⚠️ REQUIRED: Must call init()
    }
    
    /**
     * ⚠️ CRITICAL: Data initialization pattern
     * NEVER use: this.Data = { property: value }
     * ALWAYS use reference pattern: const model = this.Data; model.property = value
     */
    init() {
        // ✅ CORRECT: Get reference to Data, then set properties
        const model = this.Data;
        
        // ===== FORM FIELDS =====
        // String properties
        model.id = null;
        model.name = '';
        model.email = '';
        model.password = '';
        model.confirmPassword = '';
        model.firstName = '';
        model.lastName = '';
        model.userName = '';
        model.phone = '';
        model.address = '';
        model.description = '';
        model.notes = '';
        
        // ===== SELECTION PROPERTIES =====
        // Dropdown selections
        model.selectedCategory = '';
        model.selectedStatus = '';
        model.selectedRole = '';
        model.selectedUser = '';
        model.selectedDepartment = '';
        
        // ===== BOOLEAN PROPERTIES =====
        // Checkbox states
        model.isActive = false;
        model.isEnabled = true;
        model.isVisible = true;
        model.isRequired = false;
        model.isPublic = false;
        model.allowEdit = true;
        model.allowDelete = true;
        
        // ===== UI STATE PROPERTIES =====
        // Loading states
        model.isLoading = false;
        model.isSaving = false;
        model.isDeleting = false;
        model.loadingFields = [];  // Array of field names being loaded
        
        // Modal states
        model.showModal = false;
        model.modalType = '';
        model.modalData = null;
        
        // Advanced UI
        model.showAdvanced = false;
        model.showDetails = false;
        model.expandedSections = [];
        
        // ===== DATA COLLECTIONS =====
        // Lists for dropdowns
        model.categories = [];
        model.statuses = [];
        model.roles = [];
        model.users = [];
        model.departments = [];
        
        // Grid data
        model.items = [];
        model.gridData = [];
        model.searchResults = [];
        model.filteredItems = [];
        
        // Selected items
        model.selectedItem = null;
        model.selectedItems = [];
        model.selectedIndex = -1;
        
        // ===== PAGINATION PROPERTIES =====
        model.currentPage = 1;
        model.pageSize = 10;
        model.totalRecords = 0;
        model.totalPages = 0;
        
        // ===== SEARCH AND FILTER PROPERTIES =====
        model.searchTerm = '';
        model.sortField = '';
        model.sortDirection = 'asc';
        model.filters = {};
        
        // ===== FILE HANDLING PROPERTIES =====
        model.uploadedFiles = [];
        model.attachments = [];
        model.imagePreview = '';
        model.allowedFileTypes = ['.pdf', '.doc', '.docx', '.jpg', '.png', '.gif'];
        model.maxFileSize = 10485760; // 10MB
        
        // ===== MESSAGE PROPERTIES =====
        model.errorMessage = '';
        model.successMessage = '';
        model.warningMessage = '';
        model.infoMessage = '';
        
        // ===== VALIDATION PROPERTIES =====
        model.validationErrors = {};
        model.isValid = true;
        model.isDirty = false;
        
        // ===== FORM STATE PROPERTIES =====
        model.formMode = 'create'; // 'create', 'edit', 'view'
        model.originalData = {};   // For comparison/reset
        
        // ❌ NEVER DO THIS - Will throw "Cannot set property Data" error
        // this.Data = { name: '', email: '' };
        // this.Data.name = '';  // Direct access without reference
    }
    
    // ===== SECTION 2: LIFECYCLE METHODS =====
    // Lines 100-200: Component lifecycle integration
    
    /**
     * ⚠️ CRITICAL: Called when component mounts
     * Use this to load initial data
     */
    async onLoad() {
        try {
            await this.loadInitialData();
        } catch (error) {
            this.handleError('Failed to load initial data', error);
        }
    }
    
    /**
     * Load all required data for the component
     */
    async loadInitialData() {
        const model = this.Data;
        model.isLoading = true;
        this.updateUI();
        
        try {
            // ✅ CORRECT: Load multiple data sources in parallel
            const [categories, statuses, roles, users] = await Promise.all([
                this.loadCategories(),
                this.loadStatuses(),
                this.loadRoles(),
                this.loadUsers()
            ]);
            
            model.categories = categories || [];
            model.statuses = statuses || [];
            model.roles = roles || [];
            model.users = users || [];
            
            // Load main data if editing
            if (this.props.id) {
                await this.loadEntity(this.props.id);
            }
            
        } catch (error) {
            this.handleError('Failed to load data', error);
        } finally {
            model.isLoading = false;
            this.updateUI();
        }
    }
    
    // ===== SECTION 3: DATA LOADING METHODS =====
    // Lines 200-400: API call patterns
    
    /**
     * ⚠️ CRITICAL: Utils.ajax pattern for loading data
     * Always use relative URLs, never absolute
     */
    async loadCategories() {
        try {
            const response = await Utils.ajax({
                url: '/api/Category/GetList',  // ✅ CORRECT: Relative URL
                data: { active: true }
            });
            
            return response.data || [];
        } catch (error) {
            console.error('Failed to load categories:', error);
            return [];
        }
    }
    
    async loadStatuses() {
        try {
            const response = await Utils.ajax({
                url: '/api/Status/GetList',
                data: {}
            });
            
            return response.data || [];
        } catch (error) {
            console.error('Failed to load statuses:', error);
            return [];
        }
    }
    
    async loadRoles() {
        try {
            const response = await Utils.ajax({
                url: '/api/Role/GetList',
                data: {}
            });
            
            return response.data || [];
        } catch (error) {
            console.error('Failed to load roles:', error);
            return [];
        }
    }
    
    async loadUsers() {
        try {
            const response = await Utils.ajax({
                url: '/api/User/GetList',
                data: { active: true }
            });
            
            return response.data || [];
        } catch (error) {
            console.error('Failed to load users:', error);
            return [];
        }
    }
    
    /**
     * Load specific entity for editing
     */
    async loadEntity(id) {
        const model = this.Data;
        model.isLoading = true;
        this.updateUI();
        
        try {
            const response = await Utils.ajax({
                url: '/api/[Entity]/Get',
                data: { id: id }
            });
            
            if (response.data) {
                // ✅ CORRECT: Map response data to model properties
                const entity = response.data;
                model.id = entity.id;
                model.name = entity.name || '';
                model.email = entity.email || '';
                model.phone = entity.phone || '';
                model.address = entity.address || '';
                model.description = entity.description || '';
                model.selectedCategory = entity.categoryId || '';
                model.selectedStatus = entity.statusId || '';
                model.selectedRole = entity.roleId || '';
                model.isActive = entity.isActive || false;
                model.isEnabled = entity.isEnabled || false;
                
                // Store original data for comparison
                model.originalData = { ...entity };
                model.formMode = 'edit';
                model.isDirty = false;
            }
            
        } catch (error) {
            this.handleError('Failed to load entity', error);
        } finally {
            model.isLoading = false;
            this.updateUI();
        }
    }
    
    // ===== SECTION 4: VALIDATION METHODS =====
    // Lines 400-500: Form validation patterns
    
    /**
     * ⚠️ CRITICAL: Comprehensive validation method
     * Update validation state and return overall validity
     */
    validate() {
        const model = this.Data;
        const errors = {};
        let isValid = true;
        
        // Required field validation
        if (!model.name || model.name.trim() === '') {
            errors.name = 'Name is required';
            isValid = false;
        }
        
        if (!model.email || model.email.trim() === '') {
            errors.email = 'Email is required';
            isValid = false;
        } else {
            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(model.email)) {
                errors.email = 'Invalid email format';
                isValid = false;
            }
        }
        
        // Password validation for new records
        if (!model.id) {
            if (!model.password || model.password.length < 8) {
                errors.password = 'Password must be at least 8 characters';
                isValid = false;
            }
            
            if (model.password !== model.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
                isValid = false;
            }
        }
        
        // Phone validation (optional but format check)
        if (model.phone && model.phone.trim() !== '') {
            const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
            if (!phoneRegex.test(model.phone)) {
                errors.phone = 'Invalid phone number format';
                isValid = false;
            }
        }
        
        // Selection validation
        if (!model.selectedRole) {
            errors.selectedRole = 'Role is required';
            isValid = false;
        }
        
        // Custom business rules
        if (model.name && model.name.length > 100) {
            errors.name = 'Name cannot exceed 100 characters';
            isValid = false;
        }
        
        // File validation
        if (model.uploadedFiles && model.uploadedFiles.length > 0) {
            model.uploadedFiles.forEach((file, index) => {
                if (file.size > model.maxFileSize) {
                    errors[`file_${index}`] = `File ${file.name} is too large (max 10MB)`;
                    isValid = false;
                }
                
                const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
                if (!model.allowedFileTypes.includes(fileExtension)) {
                    errors[`file_${index}`] = `File type ${fileExtension} is not allowed`;
                    isValid = false;
                }
            });
        }
        
        // Update validation state
        model.validationErrors = errors;
        model.isValid = isValid;
        this.updateUI();
        
        return isValid;
    }
    
    /**
     * Validate single field (for real-time validation)
     */
    validateField(fieldName, value) {
        const model = this.Data;
        const errors = { ...model.validationErrors };
        
        switch (fieldName) {
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors.email = 'Invalid email format';
                } else {
                    delete errors.email;
                }
                break;
                
            case 'phone':
                if (value && !/^[\+]?[\d\s\-\(\)]+$/.test(value)) {
                    errors.phone = 'Invalid phone number format';
                } else {
                    delete errors.phone;
                }
                break;
                
            case 'password':
                if (value && value.length < 8) {
                    errors.password = 'Password must be at least 8 characters';
                } else {
                    delete errors.password;
                }
                break;
        }
        
        model.validationErrors = errors;
        model.isValid = Object.keys(errors).length === 0;
        this.updateUI();
    }
    
    // ===== SECTION 5: CRUD OPERATIONS =====
    // Lines 500-700: Create, Read, Update, Delete operations
    
    /**
     * ⚠️ CRITICAL: Save operation with complete error handling
     * Handles both create and update operations
     */
    async save() {
        const model = this.Data;
        
        // Clear previous messages
        model.errorMessage = '';
        model.successMessage = '';
        this.updateUI();
        
        // Validate before saving
        if (!this.validate()) {
            model.errorMessage = 'Please fix the validation errors before saving';
            this.updateUI();
            return false;
        }
        
        // Set loading state
        model.isSaving = true;
        this.updateUI();
        
        try {
            // Prepare data for API
            const saveData = {
                id: model.id,
                name: model.name,
                email: model.email,
                password: model.password,
                phone: model.phone,
                address: model.address,
                description: model.description,
                categoryId: model.selectedCategory,
                statusId: model.selectedStatus,
                roleId: model.selectedRole,
                isActive: model.isActive,
                isEnabled: model.isEnabled
            };
            
            // Remove empty values
            Object.keys(saveData).forEach(key => {
                if (saveData[key] === '' || saveData[key] === null) {
                    delete saveData[key];
                }
            });
            
            // Call API
            const response = await Utils.ajax({
                url: '/api/[Entity]/Save',
                data: saveData
            });
            
            // Handle successful response
            if (response.success || response === 'S') {
                model.successMessage = `${model.id ? 'Updated' : 'Created'} successfully!`;
                
                // Update model with returned data
                if (response.data) {
                    model.id = response.data.id;
                    model.formMode = 'edit';
                }
                
                // Clear dirty flag
                model.isDirty = false;
                
                // Handle file uploads if any
                if (model.uploadedFiles && model.uploadedFiles.length > 0) {
                    await this.uploadFiles();
                }
                
                // Refresh data if needed
                if (this.props.onSave) {
                    this.props.onSave(response.data);
                }
                
                return true;
            } else {
                model.errorMessage = response.message || 'Save failed';
                return false;
            }
            
        } catch (error) {
            this.handleError('Save failed', error);
            return false;
        } finally {
            model.isSaving = false;
            this.updateUI();
        }
    }
    
    /**
     * Delete operation with confirmation
     */
    async delete(id = null) {
        const model = this.Data;
        const deleteId = id || model.id;
        
        if (!deleteId) {
            model.errorMessage = 'No item selected for deletion';
            this.updateUI();
            return false;
        }
        
        model.isDeleting = true;
        this.updateUI();
        
        try {
            const response = await Utils.ajax({
                url: '/api/[Entity]/Delete',
                data: { id: deleteId }
            });
            
            if (response.success || response === true) {
                model.successMessage = 'Deleted successfully!';
                
                // Clear form if deleting current item
                if (deleteId === model.id) {
                    this.clearForm();
                }
                
                // Notify parent component
                if (this.props.onDelete) {
                    this.props.onDelete(deleteId);
                }
                
                return true;
            } else {
                model.errorMessage = response.message || 'Delete failed';
                return false;
            }
            
        } catch (error) {
            this.handleError('Delete failed', error);
            return false;
        } finally {
            model.isDeleting = false;
            this.updateUI();
        }
    }
    
    // ===== SECTION 6: SEARCH AND FILTERING =====
    // Lines 700-800: Search and filter operations
    
    /**
     * Search functionality
     */
    async search(searchTerm) {
        const model = this.Data;
        model.searchTerm = searchTerm;
        model.isLoading = true;
        this.updateUI();
        
        try {
            const response = await Utils.ajax({
                url: '/api/[Entity]/Search',
                data: {
                    searchTerm: searchTerm,
                    page: 1,
                    pageSize: model.pageSize,
                    filters: model.filters
                }
            });
            
            model.searchResults = response.data || [];
            model.gridData = model.searchResults;
            model.totalRecords = response.totalRecords || 0;
            model.totalPages = Math.ceil(model.totalRecords / model.pageSize);
            model.currentPage = 1;
            
        } catch (error) {
            this.handleError('Search failed', error);
        } finally {
            model.isLoading = false;
            this.updateUI();
        }
    }
    
    /**
     * Clear search and reset to full list
     */
    async clearSearch() {
        const model = this.Data;
        model.searchTerm = '';
        model.filters = {};
        await this.loadList();
    }
    
    /**
     * Load paginated list
     */
    async loadList(page = 1, pageSize = null) {
        const model = this.Data;
        model.currentPage = page;
        if (pageSize) model.pageSize = pageSize;
        model.isLoading = true;
        this.updateUI();
        
        try {
            const response = await Utils.ajax({
                url: '/api/[Entity]/GetList',
                data: {
                    page: model.currentPage,
                    pageSize: model.pageSize,
                    searchTerm: model.searchTerm,
                    sortField: model.sortField,
                    sortDirection: model.sortDirection,
                    filters: model.filters
                }
            });
            
            model.items = response.data || [];
            model.gridData = model.items;
            model.totalRecords = response.totalRecords || 0;
            model.totalPages = Math.ceil(model.totalRecords / model.pageSize);
            
        } catch (error) {
            this.handleError('Failed to load list', error);
        } finally {
            model.isLoading = false;
            this.updateUI();
        }
    }
    
    // ===== SECTION 7: FILE HANDLING =====
    // Lines 800-900: File upload and management
    
    /**
     * Upload files to server
     */
    async uploadFiles() {
        const model = this.Data;
        
        if (!model.uploadedFiles || model.uploadedFiles.length === 0) {
            return true;
        }
        
        try {
            const formData = new FormData();
            formData.append('entityId', model.id);
            
            model.uploadedFiles.forEach((file, index) => {
                formData.append(`file_${index}`, file);
            });
            
            const response = await Utils.ajax({
                url: '/api/[Entity]/UploadFiles',
                data: formData,
                contentType: false,
                processData: false
            });
            
            if (response.success) {
                model.attachments = [...(model.attachments || []), ...(response.data || [])];
                model.uploadedFiles = [];
                model.imagePreview = '';
                model.successMessage += ' Files uploaded successfully.';
                return true;
            } else {
                model.errorMessage = 'File upload failed: ' + (response.message || 'Unknown error');
                return false;
            }
            
        } catch (error) {
            this.handleError('File upload failed', error);
            return false;
        }
    }
    
    // ===== SECTION 8: UTILITY METHODS =====
    // Lines 900-1000: Helper and utility methods
    
    /**
     * ⚠️ CRITICAL: Clear form data
     * Reset to initial state
     */
    clearForm() {
        const model = this.Data;
        
        // Reset form fields
        model.id = null;
        model.name = '';
        model.email = '';
        model.password = '';
        model.confirmPassword = '';
        model.phone = '';
        model.address = '';
        model.description = '';
        model.selectedCategory = '';
        model.selectedStatus = '';
        model.selectedRole = '';
        model.isActive = false;
        model.isEnabled = true;
        
        // Reset UI state
        model.formMode = 'create';
        model.isDirty = false;
        model.validationErrors = {};
        model.isValid = true;
        
        // Clear messages
        model.errorMessage = '';
        model.successMessage = '';
        model.warningMessage = '';
        model.infoMessage = '';
        
        // Clear files
        model.uploadedFiles = [];
        model.imagePreview = '';
        
        this.updateUI();
    }
    
    /**
     * Reset form to original values (for edit mode)
     */
    reset() {
        const model = this.Data;
        
        if (model.originalData && Object.keys(model.originalData).length > 0) {
            // Restore from original data
            const original = model.originalData;
            model.name = original.name || '';
            model.email = original.email || '';
            model.phone = original.phone || '';
            model.address = original.address || '';
            model.description = original.description || '';
            model.selectedCategory = original.categoryId || '';
            model.selectedStatus = original.statusId || '';
            model.selectedRole = original.roleId || '';
            model.isActive = original.isActive || false;
            model.isEnabled = original.isEnabled || false;
            
            model.isDirty = false;
        } else {
            // Clear form for new records
            this.clearForm();
        }
        
        // Clear validation errors
        model.validationErrors = {};
        model.isValid = true;
        
        this.updateUI();
    }
    
    /**
     * Cancel operation
     */
    cancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        } else {
            this.clearForm();
        }
    }
    
    /**
     * Handle errors consistently
     */
    handleError(message, error) {
        const model = this.Data;
        console.error(message, error);
        
        model.errorMessage = message;
        if (error && error.message) {
            model.errorMessage += ': ' + error.message;
        }
        
        this.updateUI();
    }
    
    /**
     * Mark form as dirty (data changed)
     */
    markDirty() {
        const model = this.Data;
        if (!model.isDirty) {
            model.isDirty = true;
            this.updateUI();
        }
    }
    
    /**
     * Check if form has unsaved changes
     */
    hasUnsavedChanges() {
        return this.Data.isDirty;
    }
    
    // ===== PAGINATION HELPERS =====
    async loadPage(page) {
        await this.loadList(page, this.Data.pageSize);
    }
    
    async changePageSize(pageSize) {
        await this.loadList(1, pageSize);
    }
    
    // ===== GRID HELPERS =====
    editItem(item) {
        if (item && item.id) {
            this.loadEntity(item.id);
        }
    }
    
    async deleteItem(item) {
        if (item && item.id) {
            const success = await this.delete(item.id);
            if (success) {
                // Refresh the list
                await this.loadList(this.Data.currentPage);
            }
        }
    }
}

// ✅ CRITICAL: Also export as named export for compatibility
export { [EntityName]VM };

// ===== USAGE NOTES =====
/*
⚠️ CRITICAL PATTERNS TO NEVER CHANGE:
1. Always extend VMBase
2. Always call init() in constructor
3. NEVER use this.Data = {} (causes "Cannot set property Data" error)
4. Always use reference pattern: const model = this.Data; model.prop = value
5. Always call this.updateUI() after changing Data properties
6. Always use Utils.ajax for API calls with relative URLs

✅ CUSTOMIZATION POINTS:
1. Replace [EntityName] with your entity name
2. Modify init() to add/remove properties for your data model
3. Update validation rules in validate() method
4. Customize API endpoints in load/save methods
5. Add business-specific methods
6. Modify file upload logic if needed

💡 PERFORMANCE TIPS:
1. Use parallel loading with Promise.all for multiple API calls
2. Implement debouncing for search (done in component)
3. Use pagination for large datasets
4. Cache lookup data (categories, roles, etc.)

🛡️ SECURITY CONSIDERATIONS:
1. Always validate on both client and server
2. Sanitize data before saving
3. Use proper authentication for API calls
4. Validate file uploads properly

🔥 OPTIMIZATION NOTES:
1. Only call updateUI() when Data actually changes
2. Use loading states to show progress
3. Handle errors gracefully with user-friendly messages
4. Implement proper cleanup in component unmount
*/