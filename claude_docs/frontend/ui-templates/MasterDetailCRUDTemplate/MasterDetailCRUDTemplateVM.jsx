import VMBase from '../../../xos-components/VMBase';
import * as Utils from '../../../xos-components/Utils';
import { ApiManager } from '../../../xos-components/Core';

/**
 * ViewModel Template for Master-Detail CRUD Forms
 * 
 * Standard Features:
 * - Data loading/saving
 * - Validation with focus management
 * - Message box integration
 * - Loading state management
 */
export default class MasterDetailCRUDTemplateVM extends VMBase {
    constructor(onClose) {
        super();
        this.onClose = onClose;
        
        // Initialize data structure
        this.Data = {
            Title: 'Master Form',
            ShowLoading: false,
            Input: {
                Id: 0,
                Code: '',
                Name: '',
                Type: null,
                EffectiveDate: null,
                Description: '',
                IsActive: true,
                IsDefault: false
            },
            TypeList: [],
            IsEditMode: false
        };

        // Input refs for focus management
        this.codeInput = null;
        this.nameInput = null;
    }

    /**
     * Load initial data or existing record
     */
    async loadData() {
        try {
            this.Data.ShowLoading = true;

            // Load dropdown data
            await this.loadTypeList();

            // If editing existing record, load it
            if (this.Data.Input.Id > 0) {
                await this.loadRecord();
                this.Data.IsEditMode = true;
                this.Data.Title = 'Edit Master';
            } else {
                this.Data.Title = 'New Master';
                this.setDefaults();
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.Data.ShowLoading = false;
        }
    }

    /**
     * Load dropdown/select data
     */
    async loadTypeList() {
        // Example API call - customize endpoint
        const response = await ApiManager.get('/api/types/list');
        if (response.success) {
            this.Data.TypeList = response.data;
        }
    }

    /**
     * Load existing record for editing
     */
    async loadRecord() {
        const response = await ApiManager.get(`/api/master/${this.Data.Input.Id}`);
        if (response.success) {
            this.Data.Input = { ...this.Data.Input, ...response.data };
        }
    }

    /**
     * Set default values for new record
     */
    setDefaults() {
        this.Data.Input.EffectiveDate = new Date();
        this.Data.Input.IsActive = true;
        
        // Focus first input
        setTimeout(() => {
            if (this.codeInput) {
                this.codeInput.focus();
            }
        }, 100);
    }

    /**
     * Validate form before saving
     */
    isValidSave() {
        // Validate Code
        if (Utils.isNullOrEmpty(this.Data.Input.Code)) {
            this.showMessageBox({
                text: 'Code is required',
                title: 'Validation Error',
                icon: 'warning',
                onClose: () => {
                    if (this.codeInput) this.codeInput.focus();
                }
            });
            return false;
        }

        // Validate Name
        if (Utils.isNullOrEmpty(this.Data.Input.Name)) {
            this.showMessageBox({
                text: 'Name is required',
                title: 'Validation Error',
                icon: 'warning',
                onClose: () => {
                    if (this.nameInput) this.nameInput.focus();
                }
            });
            return false;
        }

        // Add more validations as needed
        
        return true;
    }

    /**
     * Save record
     */
    save = async () => {
        if (!this.isValidSave()) {
            return;
        }

        try {
            this.Data.ShowLoading = true;

            const endpoint = this.Data.IsEditMode 
                ? `/api/master/update/${this.Data.Input.Id}`
                : '/api/master/create';
            
            const method = this.Data.IsEditMode ? 'put' : 'post';
            
            const response = await ApiManager[method](endpoint, this.Data.Input);

            if (response.success) {
                this.showToast({
                    text: `Record ${this.Data.IsEditMode ? 'updated' : 'created'} successfully`,
                    type: 'success'
                });
                
                // Close form and refresh parent if needed
                if (this.onClose) {
                    this.onClose({ refresh: true, data: response.data });
                }
            } else {
                this.showMessageBox({
                    text: response.message || 'Failed to save record',
                    title: 'Error',
                    icon: 'error'
                });
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.Data.ShowLoading = false;
        }
    }

    /**
     * Close form
     */
    close = () => {
        if (this.onClose) {
            this.onClose({ refresh: false });
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
        // Clean up any subscriptions, timers, etc.
        super.dispose();
    }
}