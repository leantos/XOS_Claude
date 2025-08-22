import VMBase from '../../../xos-components/VMBase';
import * as Utils from '../../../xos-components/Utils';
import { ApiManager } from '../../../xos-components/Core';

/**
 * ViewModel Template for Search/List with Grid Forms
 * 
 * Standard Features:
 * - Search and filtering
 * - Grid data management
 * - CRUD operations
 * - Export functionality
 * - Audit trail viewing
 */
export default class SearchListGridTemplateVM extends VMBase {
    constructor(onClose) {
        super();
        this.onClose = onClose;
        this.init();
    }
    
    init() {
        // ✅ CORRECT: Get reference to Data, then set properties
        const model = this.Data;
        
        // Initialize data structure
        model.Title = 'List View';
        model.ShowLoading = false;
        model.GridLoading = false;
        model.GridData = [];
        model.TotalRecords = 0;
        model.SelectedRows = [];
        model.LastUpdated = new Date();
        model.ShowAdvancedFilters = false;
        
        // Search inputs
        model.SearchInput = {
            Text: '',
            Status: null,
            FromDate: null,
            ToDate: null,
            Department: null
        };
        
        // Dropdown data
        model.StatusList = [
            { Name: 'All', Value: '' },
            { Name: 'Active', Value: 'Active' },
            { Name: 'Inactive', Value: 'Inactive' }
        ];
        model.DepartmentList = [];

        // Store original data for client-side filtering
        this.originalData = [];
        
        // Debounce timer for search
        this.searchTimer = null;
    }

    /**
     * Load initial data
     */
    async loadData() {
        try {
            this.Data.ShowLoading = true;

            // Load dropdown data
            await this.loadDepartments();
            
            // Load grid data
            await this.search();
            
        } catch (error) {
            this.handleError(error);
        } finally {
            this.Data.ShowLoading = false;
        }
    }

    /**
     * Load department dropdown
     */
    async loadDepartments() {
        const response = await ApiManager.get('/api/departments/list');
        if (response.success) {
            this.Data.DepartmentList = [
                { Name: 'All Departments', Id: 0 },
                ...response.data
            ];
        }
    }

    /**
     * Search/filter grid data
     */
    search = async () => {
        try {
            this.Data.GridLoading = true;
            this.Data.SelectedRows = [];

            // Build search parameters
            const params = {
                searchText: this.Data.SearchInput.Text,
                status: this.Data.SearchInput.Status?.Value || '',
                fromDate: this.Data.SearchInput.FromDate ? Utils.formatDate(this.Data.SearchInput.FromDate, 'yyyy-MM-dd') : '',
                toDate: this.Data.SearchInput.ToDate ? Utils.formatDate(this.Data.SearchInput.ToDate, 'yyyy-MM-dd') : '',
                departmentId: this.Data.SearchInput.Department?.Id || 0
            };

            const response = await ApiManager.post('/api/search', params);
            
            if (response.success) {
                this.Data.GridData = response.data.records || [];
                this.Data.TotalRecords = response.data.totalCount || this.Data.GridData.length;
                this.originalData = [...this.Data.GridData];
                this.Data.LastUpdated = new Date();
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.Data.GridLoading = false;
        }
    }

    /**
     * Clear search filters
     */
    clearSearch = () => {
        this.Data.SearchInput = {
            Text: '',
            Status: null,
            FromDate: null,
            ToDate: null,
            Department: null
        };
        this.Data.ShowAdvancedFilters = false;
        this.search();
    }

    /**
     * Handle grid row selection
     */
    onGridSelectionChange = (selectedRows) => {
        this.Data.SelectedRows = selectedRows;
    }

    /**
     * Add new record
     */
    addNew = () => {
        // Open form in add mode
        this.openForm({
            mode: 'add',
            data: null,
            onSave: (result) => {
                if (result.success) {
                    this.showToast({
                        text: 'Record created successfully',
                        type: 'success'
                    });
                    this.search(); // Refresh grid
                }
            }
        });
    }

    /**
     * Modify selected record
     */
    modifyRecord = () => {
        if (!this.Data.SelectedRows.length) {
            this.showMessageBox({
                text: 'Please select a record to modify',
                title: 'Selection Required',
                icon: 'info'
            });
            return;
        }

        const selectedRecord = this.Data.SelectedRows[0];
        
        // Check if record can be modified
        if (selectedRecord.Status === 'Locked') {
            this.showMessageBox({
                text: 'This record is locked and cannot be modified',
                title: 'Record Locked',
                icon: 'warning'
            });
            return;
        }

        // Open form in edit mode
        this.openForm({
            mode: 'edit',
            data: selectedRecord,
            onSave: (result) => {
                if (result.success) {
                    this.showToast({
                        text: 'Record updated successfully',
                        type: 'success'
                    });
                    this.search(); // Refresh grid
                }
            }
        });
    }

    /**
     * Show audit trail for selected record
     */
    showAudit = async () => {
        if (!this.Data.SelectedRows.length) {
            this.showMessageBox({
                text: 'Please select a record to view audit trail',
                title: 'Selection Required',
                icon: 'info'
            });
            return;
        }

        const selectedRecord = this.Data.SelectedRows[0];
        
        try {
            this.Data.ShowLoading = true;
            
            const response = await ApiManager.get(`/api/audit/${selectedRecord.Id}`);
            
            if (response.success) {
                // Open audit viewer
                this.openAuditViewer({
                    title: `Audit Trail - ${selectedRecord.Name}`,
                    data: response.data
                });
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.Data.ShowLoading = false;
        }
    }

    /**
     * Export grid data
     */
    exportData = async () => {
        const exportOptions = [
            { text: 'Excel', value: 'excel', icon: 'fa-file-excel' },
            { text: 'CSV', value: 'csv', icon: 'fa-file-csv' },
            { text: 'PDF', value: 'pdf', icon: 'fa-file-pdf' }
        ];

        this.showOptionsDialog({
            title: 'Export Data',
            message: 'Select export format:',
            options: exportOptions,
            onSelect: async (format) => {
                await this.performExport(format);
            }
        });
    }

    /**
     * Perform data export
     */
    async performExport(format) {
        try {
            this.Data.ShowLoading = true;
            
            const params = {
                format: format,
                filters: this.Data.SearchInput,
                columns: ['Code', 'Name', 'Type', 'Status', 'CreatedDate']
            };

            const response = await ApiManager.post('/api/export', params, {
                responseType: 'blob'
            });

            if (response.success) {
                // Download file
                Utils.downloadFile(response.data, `export_${Date.now()}.${format}`);
                
                this.showToast({
                    text: 'Export completed successfully',
                    type: 'success'
                });
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.Data.ShowLoading = false;
        }
    }

    /**
     * Open form dialog
     */
    openForm(options) {
        // Implementation would open the master-detail form
        // This is a placeholder - actual implementation would use your modal system
        console.log('Opening form with options:', options);
    }

    /**
     * Open audit viewer
     */
    openAuditViewer(options) {
        // Implementation would open the audit viewer
        // This is a placeholder - actual implementation would use your modal system
        console.log('Opening audit viewer with options:', options);
    }

    /**
     * Show options dialog
     */
    showOptionsDialog(options) {
        // Implementation would show options dialog
        // This is a placeholder - actual implementation would use your dialog system
        console.log('Showing options dialog:', options);
    }

    /**
     * Close form
     */
    close = () => {
        if (this.onClose) {
            this.onClose();
        }
    }

    /**
     * Handle errors
     */
    handleError(error) {
        console.error('Error:', error);
        this.showMessageBox({
            text: error.message || 'An error occurred',
            title: 'Error',
            icon: 'error'
        });
    }

    /**
     * Cleanup
     */
    dispose() {
        // Clear any timers
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
        }
        
        super.dispose();
    }
}