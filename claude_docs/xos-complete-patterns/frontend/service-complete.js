// ===== XOS FRONTEND SERVICE COMPLETE PATTERNS =====
// This file contains EVERY frontend API call pattern for XOS Framework
// Always use Utils.ajax with relative URLs for XOS compliance

import { Utils } from '../../xos-components/Utils';

// ===== SECTION 1: SERVICE CLASS STRUCTURE =====
// Lines 10-100: Service class definition and basic patterns

/**
 * ⚠️ CRITICAL: Frontend service class for [EntityName]
 * Handles all API communication using XOS patterns
 * - Always use Utils.ajax (NOT fetch, axios, etc.)
 * - Always use relative URLs (NOT absolute URLs)
 * - Always handle errors gracefully
 * - Always return consistent response format
 */
export class [EntityName]Service {
    constructor() {
        this.baseUrl = '/api/[EntityName]';  // ✅ CORRECT: Relative URL
        this.defaultTimeout = 30000;         // 30 seconds
    }
    
    // ===== SECTION 2: BASIC CRUD OPERATIONS =====
    // Lines 100-300: Create, Read, Update, Delete operations
    
    /**
     * ⚠️ CRITICAL: Get single entity by ID
     * Uses POST method (XOS convention)
     */
    async getById(id) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/Get`,      // ✅ CORRECT: Relative URL
                data: { id: id },                // ✅ CORRECT: POST data
                timeout: this.defaultTimeout
            });
            
            return {
                success: true,
                data: response.data || response,  // Handle different response formats
                message: 'Data loaded successfully'
            };
        } catch (error) {
            console.error('Failed to get entity by ID:', error);
            return {
                success: false,
                data: null,
                message: error.message || 'Failed to load data'
            };
        }
    }
    
    /**
     * ⚠️ CRITICAL: Get paginated list with filtering
     * Uses POST method with search parameters
     */
    async getList(searchParams = {}) {
        try {
            // ✅ CORRECT: Prepare search parameters with defaults
            const params = {
                searchTerm: searchParams.searchTerm || '',
                categoryId: searchParams.categoryId || null,
                statusId: searchParams.statusId || null,
                isActive: searchParams.isActive || null,
                sortField: searchParams.sortField || 'name',
                sortDirection: searchParams.sortDirection || 'asc',
                page: searchParams.page || 1,
                pageSize: searchParams.pageSize || 10
            };
            
            const response = await Utils.ajax({
                url: `${this.baseUrl}/GetList`,
                data: params
            });
            
            return {
                success: true,
                data: response.data || [],
                totalRecords: response.totalRecords || 0,
                totalPages: response.totalPages || 0,
                currentPage: response.page || 1,
                message: 'List loaded successfully'
            };
        } catch (error) {
            console.error('Failed to get entity list:', error);
            return {
                success: false,
                data: [],
                totalRecords: 0,
                totalPages: 0,
                currentPage: 1,
                message: error.message || 'Failed to load list'
            };
        }
    }
    
    /**
     * ⚠️ CRITICAL: Save entity (handles both create and update)
     * Returns XOS standard response format
     */
    async save(entity) {
        try {
            // ✅ CORRECT: Clean data before sending
            const cleanEntity = this.cleanEntityData(entity);
            
            const response = await Utils.ajax({
                url: `${this.baseUrl}/Save`,
                data: cleanEntity
            });
            
            // ✅ CORRECT: Handle XOS response format ("S" or "F")
            const isSuccess = response === 'S' || response.success === true || response.result === 'S';
            
            return {
                success: isSuccess,
                data: isSuccess ? cleanEntity : null,
                message: isSuccess ? 'Saved successfully' : (response.message || 'Save failed')
            };
        } catch (error) {
            console.error('Failed to save entity:', error);
            return {
                success: false,
                data: null,
                message: error.message || 'Save failed'
            };
        }
    }
    
    /**
     * ⚠️ CRITICAL: Delete entity
     * Uses POST method with confirmation
     */
    async delete(id, reason = '') {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/Delete`,
                data: { id: id, reason: reason }
            });
            
            const isSuccess = response === true || response.success === true;
            
            return {
                success: isSuccess,
                message: isSuccess ? 'Deleted successfully' : (response.message || 'Delete failed')
            };
        } catch (error) {
            console.error('Failed to delete entity:', error);
            return {
                success: false,
                message: error.message || 'Delete failed'
            };
        }
    }
    
    // ===== SECTION 3: LOOKUP DATA OPERATIONS =====
    // Lines 300-450: Loading dropdown data and reference lists
    
    /**
     * Load all dropdown data for forms
     */
    async loadData() {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/LoadData`,
                data: {}
            });
            
            return {
                success: true,
                data: {
                    categories: response.categories || [],
                    statuses: response.statuses || [],
                    roles: response.roles || [],
                    users: response.users || []
                },
                message: 'Dropdown data loaded successfully'
            };
        } catch (error) {
            console.error('Failed to load dropdown data:', error);
            return {
                success: false,
                data: {
                    categories: [],
                    statuses: [],
                    roles: [],
                    users: []
                },
                message: error.message || 'Failed to load dropdown data'
            };
        }
    }
    
    /**
     * Load categories for dropdown
     */
    async getCategories(activeOnly = true) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/GetCategories`,
                data: { activeOnly: activeOnly }
            });
            
            return {
                success: true,
                data: response.data || response || [],
                message: 'Categories loaded successfully'
            };
        } catch (error) {
            console.error('Failed to load categories:', error);
            return {
                success: false,
                data: [],
                message: error.message || 'Failed to load categories'
            };
        }
    }
    
    /**
     * Load statuses for dropdown
     */
    async getStatuses(activeOnly = true) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/GetStatuses`,
                data: { activeOnly: activeOnly }
            });
            
            return {
                success: true,
                data: response.data || response || [],
                message: 'Statuses loaded successfully'
            };
        } catch (error) {
            console.error('Failed to load statuses:', error);
            return {
                success: false,
                data: [],
                message: error.message || 'Failed to load statuses'
            };
        }
    }
    
    /**
     * Load roles for dropdown
     */
    async getRoles(activeOnly = true) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/GetRoles`,
                data: { activeOnly: activeOnly }
            });
            
            return {
                success: true,
                data: response.data || response || [],
                message: 'Roles loaded successfully'
            };
        } catch (error) {
            console.error('Failed to load roles:', error);
            return {
                success: false,
                data: [],
                message: error.message || 'Failed to load roles'
            };
        }
    }
    
    // ===== SECTION 4: SEARCH AND FILTER OPERATIONS =====
    // Lines 450-600: Advanced search and filtering
    
    /**
     * ⚠️ CRITICAL: Advanced search with multiple criteria
     */
    async search(searchParams) {
        try {
            const params = {
                searchTerm: searchParams.searchTerm || '',
                categoryIds: searchParams.categoryIds || [],
                statusIds: searchParams.statusIds || [],
                dateFrom: searchParams.dateFrom || null,
                dateTo: searchParams.dateTo || null,
                isActive: searchParams.isActive || null,
                customFilters: searchParams.customFilters || {},
                sortField: searchParams.sortField || 'name',
                sortDirection: searchParams.sortDirection || 'asc',
                page: searchParams.page || 1,
                pageSize: searchParams.pageSize || 10
            };
            
            const response = await Utils.ajax({
                url: `${this.baseUrl}/Search`,
                data: params
            });
            
            return {
                success: true,
                data: response.results || response.data || [],
                totalCount: response.totalCount || 0,
                searchTerm: searchParams.searchTerm,
                message: 'Search completed successfully'
            };
        } catch (error) {
            console.error('Search failed:', error);
            return {
                success: false,
                data: [],
                totalCount: 0,
                searchTerm: searchParams.searchTerm || '',
                message: error.message || 'Search failed'
            };
        }
    }
    
    /**
     * Quick search for autocomplete
     */
    async quickSearch(term, maxResults = 10) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/QuickSearch`,
                data: { term: term, maxResults: maxResults }
            });
            
            return {
                success: true,
                data: response.data || response || [],
                message: 'Quick search completed'
            };
        } catch (error) {
            console.error('Quick search failed:', error);
            return {
                success: false,
                data: [],
                message: error.message || 'Quick search failed'
            };
        }
    }
    
    // ===== SECTION 5: BULK OPERATIONS =====
    // Lines 600-750: Batch operations for multiple records
    
    /**
     * ⚠️ CRITICAL: Bulk update status for multiple entities
     */
    async bulkUpdateStatus(entityIds, newStatusId) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/BulkUpdateStatus`,
                data: {
                    entityIds: entityIds,
                    newStatusId: newStatusId
                }
            });
            
            return {
                success: response.success || false,
                processedCount: response.processedCount || 0,
                message: response.message || 'Bulk update completed'
            };
        } catch (error) {
            console.error('Bulk update status failed:', error);
            return {
                success: false,
                processedCount: 0,
                message: error.message || 'Bulk update failed'
            };
        }
    }
    
    /**
     * Bulk delete multiple entities
     */
    async bulkDelete(entityIds, reason = '') {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/BulkDelete`,
                data: {
                    entityIds: entityIds,
                    reason: reason
                }
            });
            
            return {
                success: response.success || false,
                processedCount: response.processedCount || 0,
                failedIds: response.failedIds || [],
                message: response.message || 'Bulk delete completed'
            };
        } catch (error) {
            console.error('Bulk delete failed:', error);
            return {
                success: false,
                processedCount: 0,
                failedIds: entityIds,
                message: error.message || 'Bulk delete failed'
            };
        }
    }
    
    // ===== SECTION 6: FILE OPERATIONS =====
    // Lines 750-900: File upload and download operations
    
    /**
     * ⚠️ CRITICAL: Upload files with proper FormData handling
     */
    async uploadFiles(entityId, files, category = '') {
        try {
            // ✅ CORRECT: Create FormData for file upload
            const formData = new FormData();
            formData.append('entityId', entityId);
            formData.append('category', category);
            
            // Add each file to FormData
            files.forEach((file, index) => {
                formData.append(`files`, file);
            });
            
            const response = await Utils.ajax({
                url: `${this.baseUrl}/UploadFiles`,
                data: formData,
                contentType: false,    // ⚠️ CRITICAL: Let browser set content-type
                processData: false     // ⚠️ CRITICAL: Don't process FormData
            });
            
            return {
                success: response.success || false,
                uploadedFiles: response.uploadedFiles || [],
                message: response.message || 'Files uploaded successfully'
            };
        } catch (error) {
            console.error('File upload failed:', error);
            return {
                success: false,
                uploadedFiles: [],
                message: error.message || 'File upload failed'
            };
        }
    }
    
    /**
     * Download file by ID
     */
    async downloadFile(fileId) {
        try {
            // ✅ CORRECT: Handle file download
            const response = await Utils.ajax({
                url: `${this.baseUrl}/DownloadFile`,
                data: { fileId: fileId },
                responseType: 'blob'  // Important for file downloads
            });
            
            return {
                success: true,
                data: response,
                message: 'File downloaded successfully'
            };
        } catch (error) {
            console.error('File download failed:', error);
            return {
                success: false,
                data: null,
                message: error.message || 'File download failed'
            };
        }
    }
    
    // ===== SECTION 7: VALIDATION OPERATIONS =====
    // Lines 900-1000: Data validation and business rules
    
    /**
     * Validate entity data before save
     */
    async validate(entity) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/Validate`,
                data: entity
            });
            
            return {
                success: true,
                isValid: response.isValid || false,
                errors: response.errors || {},
                message: response.isValid ? 'Validation passed' : 'Validation failed'
            };
        } catch (error) {
            console.error('Validation failed:', error);
            return {
                success: false,
                isValid: false,
                errors: { general: error.message },
                message: error.message || 'Validation failed'
            };
        }
    }
    
    /**
     * Check if name is unique
     */
    async checkNameUnique(name, excludeId = null) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/CheckNameUnique`,
                data: { name: name, excludeId: excludeId }
            });
            
            return {
                success: true,
                isUnique: response.isUnique || false,
                message: response.message || ''
            };
        } catch (error) {
            console.error('Name unique check failed:', error);
            return {
                success: false,
                isUnique: false,
                message: error.message || 'Unique check failed'
            };
        }
    }
    
    /**
     * Check if email is unique
     */
    async checkEmailUnique(email, excludeId = null) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/CheckEmailUnique`,
                data: { value: email, excludeId: excludeId }
            });
            
            return {
                success: true,
                isUnique: response.isUnique || false,
                message: response.message || ''
            };
        } catch (error) {
            console.error('Email unique check failed:', error);
            return {
                success: false,
                isUnique: false,
                message: error.message || 'Unique check failed'
            };
        }
    }
    
    // ===== SECTION 8: SPECIAL OPERATIONS =====
    // Lines 1000-1100: Custom business operations
    
    /**
     * Clone entity with new name
     */
    async clone(sourceId, newName) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/Clone`,
                data: { sourceId: sourceId, newName: newName }
            });
            
            return {
                success: response.success || false,
                data: response.data || null,
                message: response.message || 'Clone operation completed'
            };
        } catch (error) {
            console.error('Clone operation failed:', error);
            return {
                success: false,
                data: null,
                message: error.message || 'Clone operation failed'
            };
        }
    }
    
    /**
     * Toggle active status
     */
    async toggleActive(id) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/ToggleActive`,
                data: { id: id }
            });
            
            return {
                success: response.success || false,
                newStatus: response.newStatus || false,
                message: response.message || 'Status toggled'
            };
        } catch (error) {
            console.error('Toggle active failed:', error);
            return {
                success: false,
                newStatus: false,
                message: error.message || 'Toggle active failed'
            };
        }
    }
    
    // ===== SECTION 9: REPORTING OPERATIONS =====
    // Lines 1100-1200: Report generation and data export
    
    /**
     * Get report data
     */
    async getReportData(reportParams) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/GetReportData`,
                data: reportParams
            });
            
            return {
                success: true,
                data: response.data || response || [],
                message: 'Report data loaded successfully'
            };
        } catch (error) {
            console.error('Get report data failed:', error);
            return {
                success: false,
                data: [],
                message: error.message || 'Failed to load report data'
            };
        }
    }
    
    /**
     * Export to Excel
     */
    async exportToExcel(exportParams) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/ExportToExcel`,
                data: { exportParams: exportParams },
                responseType: 'blob'
            });
            
            // ✅ CORRECT: Handle file download response
            const blob = new Blob([response], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `[EntityName]_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return {
                success: true,
                message: 'Excel export completed successfully'
            };
        } catch (error) {
            console.error('Excel export failed:', error);
            return {
                success: false,
                message: error.message || 'Excel export failed'
            };
        }
    }
    
    /**
     * Export to PDF
     */
    async exportToPdf(exportParams) {
        try {
            const response = await Utils.ajax({
                url: `${this.baseUrl}/ExportToPdf`,
                data: { exportParams: exportParams },
                responseType: 'blob'
            });
            
            // ✅ CORRECT: Handle PDF download
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `[EntityName]_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return {
                success: true,
                message: 'PDF export completed successfully'
            };
        } catch (error) {
            console.error('PDF export failed:', error);
            return {
                success: false,
                message: error.message || 'PDF export failed'
            };
        }
    }
    
    // ===== SECTION 10: UTILITY METHODS =====
    // Lines 1200-1300: Helper and utility functions
    
    /**
     * ⚠️ CRITICAL: Clean entity data before sending to API
     * Removes empty values and formats data properly
     */
    cleanEntityData(entity) {
        const cleaned = { ...entity };
        
        // Remove undefined and null values
        Object.keys(cleaned).forEach(key => {
            if (cleaned[key] === undefined || cleaned[key] === null) {
                delete cleaned[key];
            }
        });
        
        // Convert empty strings to null for nullable fields
        const nullableFields = ['phone', 'address', 'description', 'notes'];
        nullableFields.forEach(field => {
            if (cleaned[field] === '') {
                cleaned[field] = null;
            }
        });
        
        // Ensure numeric fields are numbers
        if (cleaned.id) cleaned.id = parseInt(cleaned.id);
        if (cleaned.categoryId) cleaned.categoryId = parseInt(cleaned.categoryId);
        if (cleaned.statusId) cleaned.statusId = parseInt(cleaned.statusId);
        if (cleaned.roleId) cleaned.roleId = parseInt(cleaned.roleId);
        
        // Ensure boolean fields are booleans
        if (cleaned.isActive !== undefined) cleaned.isActive = Boolean(cleaned.isActive);
        if (cleaned.isEnabled !== undefined) cleaned.isEnabled = Boolean(cleaned.isEnabled);
        
        return cleaned;
    }
    
    /**
     * Handle API response consistently
     */
    handleResponse(response, successMessage = 'Operation completed successfully') {
        if (response && (response.success === true || response === 'S')) {
            return {
                success: true,
                data: response.data || response,
                message: response.message || successMessage
            };
        } else {
            return {
                success: false,
                data: null,
                message: response.message || response.error || 'Operation failed'
            };
        }
    }
    
    /**
     * Handle API errors consistently
     */
    handleError(error, defaultMessage = 'Operation failed') {
        console.error('API Error:', error);
        
        return {
            success: false,
            data: null,
            message: error.message || error.responseText || defaultMessage
        };
    }
    
    /**
     * Format date for API consumption
     */
    formatDate(date) {
        if (!date) return null;
        
        if (typeof date === 'string') {
            return date;
        }
        
        if (date instanceof Date) {
            return date.toISOString();
        }
        
        return null;
    }
    
    /**
     * Create search parameters with defaults
     */
    createSearchParams(params = {}) {
        return {
            searchTerm: params.searchTerm || '',
            categoryId: params.categoryId || null,
            statusId: params.statusId || null,
            isActive: params.isActive || null,
            sortField: params.sortField || 'name',
            sortDirection: params.sortDirection || 'asc',
            page: params.page || 1,
            pageSize: params.pageSize || 10,
            ...params
        };
    }
}

// ===== SECTION 11: SERVICE INSTANCE AND EXPORT =====
// Lines 1300-1350: Service instantiation and module exports

// ✅ CORRECT: Create singleton instance for use across components
const [entityName]Service = new [EntityName]Service();

// ✅ CORRECT: Export both class and instance
export default [entityName]Service;
export { [EntityName]Service };

// ===== SECTION 12: USAGE EXAMPLES =====
// Lines 1350-1400: How to use the service in components

/*
// ===== USAGE IN VIEWMODEL =====

import [entityName]Service from './[EntityName]Service';

// In ViewModel constructor or onLoad():
async loadData() {
    const result = await [entityName]Service.getList({
        searchTerm: this.Data.searchTerm,
        page: this.Data.currentPage,
        pageSize: this.Data.pageSize
    });
    
    if (result.success) {
        this.Data.items = result.data;
        this.Data.totalRecords = result.totalRecords;
    } else {
        this.Data.errorMessage = result.message;
    }
    
    this.updateUI();
}

// Save operation:
async save() {
    const result = await [entityName]Service.save(this.Data.formData);
    
    if (result.success) {
        this.Data.successMessage = result.message;
        // Optionally refresh list
        await this.loadData();
    } else {
        this.Data.errorMessage = result.message;
    }
    
    this.updateUI();
}

// Delete operation:
async delete(id) {
    const result = await [entityName]Service.delete(id);
    
    if (result.success) {
        this.Data.successMessage = result.message;
        await this.loadData(); // Refresh list
    } else {
        this.Data.errorMessage = result.message;
    }
    
    this.updateUI();
}
*/

// ===== USAGE NOTES =====
/*
⚠️ CRITICAL PATTERNS TO NEVER CHANGE:
1. Always use Utils.ajax (NOT fetch, axios, etc.)
2. Always use relative URLs (NOT absolute URLs)
3. Always use POST method for XOS endpoints
4. Always handle contentType: false, processData: false for file uploads
5. Always return consistent response format { success, data, message }
6. Always handle errors gracefully with try/catch

✅ CUSTOMIZATION POINTS:
1. Replace [EntityName] with your entity name
2. Replace [entityName] with camelCase version
3. Add custom business operation methods
4. Modify response handling for your API format
5. Add custom validation methods
6. Customize error handling

💡 PERFORMANCE TIPS:
1. Use debouncing for search operations
2. Cache lookup data when appropriate
3. Implement request cancellation for long operations
4. Use pagination for large datasets
5. Minimize API calls with bulk operations

🛡️ SECURITY CONSIDERATIONS:
1. Always validate file uploads before sending
2. Sanitize user input before API calls
3. Handle sensitive data appropriately
4. Use proper error messages (don't expose internals)
5. Implement proper timeout handling

🔥 OPTIMIZATION NOTES:
1. Create singleton instance for reuse
2. Use consistent error handling across all methods
3. Implement proper logging for debugging
4. Handle network failures gracefully
5. Use async/await throughout
*/