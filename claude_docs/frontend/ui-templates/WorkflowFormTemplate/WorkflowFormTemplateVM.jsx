import VMBase from '../../../xos-components/VMBase';
import * as Utils from '../../../xos-components/Utils';
import { ApiManager } from '../../../xos-components/Core';
import { XOSMessageboxTypes } from '../../../xos-components';

/**
 * ViewModel Template for Complex Workflow Forms
 * 
 * Features:
 * - Workflow state management
 * - File attachment handling
 * - Approval/rejection logic
 * - History tracking
 * - Email notifications
 * - Dynamic button visibility
 */
export default class WorkflowFormTemplateVM extends VMBase {
    constructor(onClose, workflowId) {
        super();
        this.onClose = onClose;
        this.workflowId = workflowId;
        this.init();
    }
    
    init() {
        // ✅ CORRECT: Get reference to Data, then set properties
        const model = this.Data;
        
        // Initialize data structure
        model.Title = 'Workflow Request';
        model.ShowLoading = false;
        model.IsEditable = true;
        model.ShowComments = true;
        model.ShowAdditionalInfo = true;
        
        // Workflow data
        model.Workflow = {
            Id: 0,
            RequestId: '',
            Status: 'Draft',
            RequestType: null,
            Priority: null,
            Description: '',
            Department: null,
            DueDate: null,
            CreatedBy: '',
            CreatedDate: new Date(),
            CurrentApprover: ''
        };
        
        // Dropdown data
        model.RequestTypes = [];
        model.PriorityList = [
            { Name: 'Low', Value: 1 },
            { Name: 'Medium', Value: 2 },
            { Name: 'High', Value: 3 },
            { Name: 'Critical', Value: 4 }
        ];
        model.DepartmentList = [];
        
        // Attachments
        model.Attachments = [];
        model.MaxFileSize = 10485760; // 10MB in bytes
        
        // History
        model.History = [];
        
        // Comments
        model.Comments = [];
        model.NewComment = '';
        
        // Workflow buttons visibility
        model.ShowSubmitButton = false;
        model.ShowApproveButton = false;
        model.ShowRejectButton = false;
        model.ShowReturnButton = false;
        model.ShowSaveDraftButton = false;

        // File input ref
        this.fileInput = null;
        
        // Workflow states
        this.workflowStates = {
            DRAFT: 'Draft',
            SUBMITTED: 'Submitted',
            IN_PROGRESS: 'In Progress',
            APPROVED: 'Approved',
            REJECTED: 'Rejected',
            RETURNED: 'Returned',
            COMPLETED: 'Completed',
            CANCELLED: 'Cancelled'
        };
    }

    /**
     * Load workflow data
     */
    async loadData() {
        try {
            this.Data.ShowLoading = true;

            // Load dropdown data
            await Promise.all([
                this.loadRequestTypes(),
                this.loadDepartments()
            ]);

            // Load workflow if editing
            if (this.workflowId) {
                await this.loadWorkflow();
            } else {
                this.initializeNewWorkflow();
            }

            // Set button visibility based on workflow state
            this.updateButtonVisibility();

        } catch (error) {
            this.handleError(error);
        } finally {
            this.Data.ShowLoading = false;
        }
    }

    /**
     * Initialize new workflow
     */
    initializeNewWorkflow() {
        this.Data.Workflow.RequestId = `REQ-${Date.now()}`;
        this.Data.Workflow.Status = this.workflowStates.DRAFT;
        this.Data.Workflow.CreatedBy = Utils.getCurrentUser();
        this.Data.IsEditable = true;
    }

    /**
     * Load existing workflow
     */
    async loadWorkflow() {
        const response = await ApiManager.get(`/api/workflow/${this.workflowId}`);
        
        if (response.success) {
            this.Data.Workflow = response.data.workflow;
            this.Data.Attachments = response.data.attachments || [];
            this.Data.History = response.data.history || [];
            this.Data.Comments = response.data.comments || [];
            
            this.Data.Title = `Workflow Request - ${this.Data.Workflow.RequestId}`;
            
            // Check if editable based on status and user role
            this.Data.IsEditable = this.isWorkflowEditable();
        }
    }

    /**
     * Load request types
     */
    async loadRequestTypes() {
        const response = await ApiManager.get('/api/workflow/request-types');
        if (response.success) {
            this.Data.RequestTypes = response.data;
        }
    }

    /**
     * Load departments
     */
    async loadDepartments() {
        const response = await ApiManager.get('/api/departments/list');
        if (response.success) {
            this.Data.DepartmentList = response.data;
        }
    }

    /**
     * Check if workflow is editable
     */
    isWorkflowEditable() {
        const editableStates = [
            this.workflowStates.DRAFT,
            this.workflowStates.RETURNED
        ];
        
        return editableStates.includes(this.Data.Workflow.Status);
    }

    /**
     * Update button visibility based on workflow state
     */
    updateButtonVisibility() {
        const status = this.Data.Workflow.Status;
        const userRole = Utils.getCurrentUserRole();
        
        // Reset all buttons
        this.Data.ShowSubmitButton = false;
        this.Data.ShowApproveButton = false;
        this.Data.ShowRejectButton = false;
        this.Data.ShowReturnButton = false;
        this.Data.ShowSaveDraftButton = false;
        
        switch (status) {
            case this.workflowStates.DRAFT:
            case this.workflowStates.RETURNED:
                this.Data.ShowSubmitButton = true;
                this.Data.ShowSaveDraftButton = true;
                break;
                
            case this.workflowStates.SUBMITTED:
            case this.workflowStates.IN_PROGRESS:
                if (this.isCurrentApprover()) {
                    this.Data.ShowApproveButton = true;
                    this.Data.ShowRejectButton = true;
                    this.Data.ShowReturnButton = true;
                }
                break;
                
            case this.workflowStates.APPROVED:
            case this.workflowStates.REJECTED:
            case this.workflowStates.COMPLETED:
                // No action buttons for completed workflows
                break;
        }
    }

    /**
     * Check if current user is the approver
     */
    isCurrentApprover() {
        // Implementation would check if current user is the designated approver
        return true; // Placeholder
    }

    /**
     * Handle request type change
     */
    onRequestTypeChange = (item) => {
        this.Data.Workflow.RequestType = item;
        
        // Load type-specific configuration
        if (item) {
            this.loadRequestTypeConfig(item.Id);
        }
    }

    /**
     * Load request type configuration
     */
    async loadRequestTypeConfig(typeId) {
        // Implementation would load type-specific fields, routing, etc.
        console.log('Loading config for type:', typeId);
    }

    /**
     * Handle file drop
     */
    handleFileDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    /**
     * Handle file selection
     */
    handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    /**
     * Process selected files
     */
    processFiles(files) {
        const validFiles = files.filter(file => {
            // Check file size
            if (file.size > this.Data.MaxFileSize) {
                this.showToast({
                    text: `${file.name} exceeds maximum file size of 10MB`,
                    type: 'warning'
                });
                return false;
            }
            
            // Check file type
            const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            
            if (!allowedTypes.includes(fileExtension)) {
                this.showToast({
                    text: `${file.name} is not an allowed file type`,
                    type: 'warning'
                });
                return false;
            }
            
            return true;
        });

        // Add valid files to attachments
        validFiles.forEach(file => {
            this.Data.Attachments.push({
                name: file.name,
                size: file.size,
                type: file.type,
                file: file,
                isNew: true
            });
        });
    }

    /**
     * Remove file from attachments
     */
    removeFile = (index) => {
        this.Data.Attachments.splice(index, 1);
    }

    /**
     * Download file
     */
    downloadFile = async (file) => {
        if (file.isNew) {
            // Download local file
            Utils.downloadFile(file.file, file.name);
        } else {
            // Download from server
            try {
                const response = await ApiManager.get(`/api/workflow/attachment/${file.id}`, {
                    responseType: 'blob'
                });
                
                if (response.success) {
                    Utils.downloadFile(response.data, file.name);
                }
            } catch (error) {
                this.handleError(error);
            }
        }
    }

    /**
     * Get file icon based on type
     */
    getFileIcon(type) {
        if (type.includes('pdf')) return 'fa-file-pdf-o';
        if (type.includes('word') || type.includes('doc')) return 'fa-file-word-o';
        if (type.includes('excel') || type.includes('sheet')) return 'fa-file-excel-o';
        if (type.includes('image')) return 'fa-file-image-o';
        return 'fa-file-o';
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Get status class for badge
     */
    getStatusClass() {
        const statusClasses = {
            [this.workflowStates.DRAFT]: 'secondary',
            [this.workflowStates.SUBMITTED]: 'info',
            [this.workflowStates.IN_PROGRESS]: 'warning',
            [this.workflowStates.APPROVED]: 'success',
            [this.workflowStates.REJECTED]: 'danger',
            [this.workflowStates.RETURNED]: 'warning',
            [this.workflowStates.COMPLETED]: 'success',
            [this.workflowStates.CANCELLED]: 'dark'
        };
        
        return statusClasses[this.Data.Workflow.Status] || 'secondary';
    }

    /**
     * Get action icon for history
     */
    getActionIcon(action) {
        const actionIcons = {
            'Created': 'fa-plus-circle',
            'Submitted': 'fa-send',
            'Approved': 'fa-check-circle',
            'Rejected': 'fa-times-circle',
            'Returned': 'fa-undo',
            'Commented': 'fa-comment',
            'Updated': 'fa-edit'
        };
        
        return actionIcons[action] || 'fa-circle';
    }

    /**
     * Validate workflow before submission
     */
    validateWorkflow() {
        if (!this.Data.Workflow.RequestType) {
            this.showMessageBox({
                text: 'Please select a request type',
                messageboxType: XOSMessageboxTypes.warning
            });
            return false;
        }
        
        if (Utils.isNullOrEmpty(this.Data.Workflow.Description)) {
            this.showMessageBox({
                text: 'Please enter a description',
                messageboxType: XOSMessageboxTypes.warning
            });
            return false;
        }
        
        return true;
    }

    /**
     * Submit workflow
     */
    submitWorkflow = async () => {
        if (!this.validateWorkflow()) return;
        
        this.showConfirmDialog({
            text: 'Are you sure you want to submit this request?',
            title: 'Confirm Submission',
            onConfirm: async () => {
                await this.performWorkflowAction('submit');
            }
        });
    }

    /**
     * Approve workflow
     */
    approveWorkflow = async () => {
        this.showConfirmDialog({
            text: 'Are you sure you want to approve this request?',
            title: 'Confirm Approval',
            onConfirm: async () => {
                await this.performWorkflowAction('approve');
            }
        });
    }

    /**
     * Reject workflow
     */
    rejectWorkflow = async () => {
        this.showInputDialog({
            text: 'Please provide a reason for rejection:',
            title: 'Reject Request',
            inputType: 'textarea',
            onConfirm: async (reason) => {
                if (Utils.isNullOrEmpty(reason)) {
                    this.showToast({
                        text: 'Rejection reason is required',
                        type: 'warning'
                    });
                    return;
                }
                
                this.Data.NewComment = reason;
                await this.performWorkflowAction('reject');
            }
        });
    }

    /**
     * Return workflow
     */
    returnWorkflow = async () => {
        this.showInputDialog({
            text: 'Please provide a reason for returning:',
            title: 'Return Request',
            inputType: 'textarea',
            onConfirm: async (reason) => {
                this.Data.NewComment = reason;
                await this.performWorkflowAction('return');
            }
        });
    }

    /**
     * Save draft
     */
    saveDraft = async () => {
        await this.performWorkflowAction('save');
    }

    /**
     * Perform workflow action
     */
    async performWorkflowAction(action) {
        try {
            this.Data.ShowLoading = true;
            
            // Prepare form data for file upload
            const formData = new FormData();
            formData.append('workflow', JSON.stringify(this.Data.Workflow));
            formData.append('action', action);
            formData.append('comment', this.Data.NewComment);
            
            // Add new files
            this.Data.Attachments.filter(f => f.isNew).forEach((file, index) => {
                formData.append(`files`, file.file);
            });
            
            const response = await ApiManager.post(`/api/workflow/action`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.success) {
                this.showToast({
                    text: response.message || `Workflow ${action} successful`,
                    type: 'success'
                });
                
                // Close and refresh parent
                if (this.onClose) {
                    this.onClose({ refresh: true, data: response.data });
                }
            } else {
                this.showMessageBox({
                    text: response.message || `Failed to ${action} workflow`,
                    messageboxType: XOSMessageboxTypes.error
                });
            }
        } catch (error) {
            this.handleError(error);
        } finally {
            this.Data.ShowLoading = false;
        }
    }

    /**
     * Print workflow
     */
    printWorkflow = () => {
        window.print();
    }

    /**
     * Close form
     */
    close = () => {
        if (this.Data.IsEditable && this.hasUnsavedChanges()) {
            this.showConfirmDialog({
                text: 'You have unsaved changes. Are you sure you want to close?',
                title: 'Unsaved Changes',
                onConfirm: () => {
                    if (this.onClose) {
                        this.onClose({ refresh: false });
                    }
                }
            });
        } else {
            if (this.onClose) {
                this.onClose({ refresh: false });
            }
        }
    }

    /**
     * Check for unsaved changes
     */
    hasUnsavedChanges() {
        // Implementation would check if form has been modified
        return false; // Placeholder
    }

    /**
     * Handle errors
     */
    handleError(error) {
        console.error('Error:', error);
        this.showMessageBox({
            text: error.message || 'An error occurred',
            messageboxType: XOSMessageboxTypes.error
        });
    }

    /**
     * Cleanup
     */
    dispose() {
        super.dispose();
    }
}