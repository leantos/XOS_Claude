import VMBase from '../../../xos-components/VMBase';
import * as Utils from '../../../xos-components/Utils';
import { ApiManager } from '../../../xos-components/Core';

/**
 * ViewModel Template for Report Parameter Forms
 * 
 * Features:
 * - Date range selection with quick presets
 * - Multi-select filtering with "Select All"
 * - Report generation in multiple formats
 * - Parameter saving/loading
 * - Email scheduling
 */
export default class ReportParameterTemplateVM extends VMBase {
    constructor(onClose, reportType) {
        super();
        this.onClose = onClose;
        this.reportType = reportType;
        
        // Initialize data structure
        this.Data = {
            Title: 'Report Parameters',
            ShowLoading: false,
            
            // Report parameters
            Parameters: {
                FromDate: null,
                ToDate: null,
                SelectedDepartments: [],
                SelectedSites: [],
                Status: null,
                ReportFormat: null,
                GroupBy: 'none',
                IncludeInactive: false,
                ShowSummary: true,
                ShowGraphs: false,
                ScheduleEmail: false,
                EmailTo: '',
                EmailFrequency: 'once'
            },
            
            // Dropdown data
            DepartmentList: [],
            SiteList: [],
            StatusList: [
                { Name: 'All', Value: '' },
                { Name: 'Active', Value: 'active' },
                { Name: 'Inactive', Value: 'inactive' },
                { Name: 'Pending', Value: 'pending' }
            ],
            ReportFormatList: [
                { Name: 'Detailed', Value: 'detailed' },
                { Name: 'Summary', Value: 'summary' },
                { Name: 'Consolidated', Value: 'consolidated' }
            ],
            
            // Multi-select states
            AllDepartmentsSelected: false,
            AllSitesSelected: false
        };

        // Saved parameter sets
        this.savedParameters = null;
    }

    /**
     * Load initial data
     */
    loadData() {
        this.Data.ShowLoading = true;

        // Load dropdown data
        this.loadDepartments();
        this.loadSites();
        
        // Load saved parameters if available
        this.loadSavedParameters();
        
        // Set default dates
        this.setDefaultDates();
        
        // Set title based on report type
        this.setReportTitle();

        this.Data.ShowLoading = false;
    }

    /**
     * Load departments
     */
    loadDepartments() {
        // Using Utils.ajax pattern from existing codebase
        Utils.ajax({
            url: '/api/departments/list',
            success: (response) => {
                if (response.success) {
                    this.Data.DepartmentList = response.data || [];
                }
            },
            error: (error) => {
                this.handleError(error);
            }
        });
    }

    /**
     * Load sites
     */
    loadSites() {
        Utils.ajax({
            url: '/api/sites/list',
            success: (response) => {
                if (response.success) {
                    this.Data.SiteList = response.data || [];
                }
            },
            error: (error) => {
                this.handleError(error);
            }
        });
    }

    /**
     * Load saved parameters
     */
    loadSavedParameters() {
        const savedParams = localStorage.getItem(`report_params_${this.reportType}`);
        if (savedParams) {
            try {
                this.savedParameters = JSON.parse(savedParams);
                // Option to load saved parameters
            } catch (e) {
                console.error('Failed to parse saved parameters');
            }
        }
    }

    /**
     * Set default dates
     */
    setDefaultDates() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        this.Data.Parameters.FromDate = firstDayOfMonth;
        this.Data.Parameters.ToDate = today;
    }

    /**
     * Set report title based on type
     */
    setReportTitle() {
        const titles = {
            'standard': 'Standard Report Parameters',
            'financial': 'Financial Report Parameters',
            'operational': 'Operational Report Parameters',
            'audit': 'Audit Report Parameters'
        };
        
        this.Data.Title = titles[this.reportType] || 'Report Parameters';
    }

    /**
     * Handle from date change
     */
    onFromDateChange = (date) => {
        this.Data.Parameters.FromDate = date;
        
        // Adjust to date if needed
        if (this.Data.Parameters.ToDate && date > this.Data.Parameters.ToDate) {
            this.Data.Parameters.ToDate = date;
        }
    }

    /**
     * Handle to date change
     */
    onToDateChange = (date) => {
        this.Data.Parameters.ToDate = date;
        
        // Adjust from date if needed
        if (this.Data.Parameters.FromDate && date < this.Data.Parameters.FromDate) {
            this.Data.Parameters.FromDate = date;
        }
    }

    /**
     * Set quick date range
     */
    setDateRange = (range) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (range) {
            case 'today':
                this.Data.Parameters.FromDate = new Date(today);
                this.Data.Parameters.ToDate = new Date(today);
                break;
                
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                this.Data.Parameters.FromDate = yesterday;
                this.Data.Parameters.ToDate = yesterday;
                break;
                
            case 'thisWeek':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                this.Data.Parameters.FromDate = startOfWeek;
                this.Data.Parameters.ToDate = new Date(today);
                break;
                
            case 'lastWeek':
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(lastWeekStart);
                lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
                this.Data.Parameters.FromDate = lastWeekStart;
                this.Data.Parameters.ToDate = lastWeekEnd;
                break;
                
            case 'thisMonth':
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                this.Data.Parameters.FromDate = startOfMonth;
                this.Data.Parameters.ToDate = new Date(today);
                break;
                
            case 'lastMonth':
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                this.Data.Parameters.FromDate = lastMonthStart;
                this.Data.Parameters.ToDate = lastMonthEnd;
                break;
        }
    }

    /**
     * Toggle all departments
     */
    toggleAllDepartments = (checked) => {
        this.Data.AllDepartmentsSelected = checked;
        
        if (checked) {
            this.Data.Parameters.SelectedDepartments = this.Data.DepartmentList.map(d => d.Id);
        } else {
            this.Data.Parameters.SelectedDepartments = [];
        }
    }

    /**
     * Toggle individual department
     */
    toggleDepartment = (deptId, checked) => {
        if (checked) {
            if (!this.Data.Parameters.SelectedDepartments.includes(deptId)) {
                this.Data.Parameters.SelectedDepartments.push(deptId);
            }
        } else {
            const index = this.Data.Parameters.SelectedDepartments.indexOf(deptId);
            if (index > -1) {
                this.Data.Parameters.SelectedDepartments.splice(index, 1);
            }
        }
        
        // Update "Select All" checkbox state
        this.Data.AllDepartmentsSelected = 
            this.Data.Parameters.SelectedDepartments.length === this.Data.DepartmentList.length;
    }

    /**
     * Toggle all sites
     */
    toggleAllSites = (checked) => {
        this.Data.AllSitesSelected = checked;
        
        if (checked) {
            this.Data.Parameters.SelectedSites = this.Data.SiteList.map(s => s.Id);
        } else {
            this.Data.Parameters.SelectedSites = [];
        }
    }

    /**
     * Toggle individual site
     */
    toggleSite = (siteId, checked) => {
        if (checked) {
            if (!this.Data.Parameters.SelectedSites.includes(siteId)) {
                this.Data.Parameters.SelectedSites.push(siteId);
            }
        } else {
            const index = this.Data.Parameters.SelectedSites.indexOf(siteId);
            if (index > -1) {
                this.Data.Parameters.SelectedSites.splice(index, 1);
            }
        }
        
        // Update "Select All" checkbox state
        this.Data.AllSitesSelected = 
            this.Data.Parameters.SelectedSites.length === this.Data.SiteList.length;
    }

    /**
     * Toggle email schedule
     */
    toggleEmailSchedule = (checked) => {
        this.Data.Parameters.ScheduleEmail = checked;
        
        if (checked && !this.Data.Parameters.EmailTo) {
            // Set default email from current user
            this.Data.Parameters.EmailTo = Utils.getCurrentUserEmail() || '';
        }
    }

    /**
     * Validate report parameters
     */
    validateParameters() {
        // Check required dates
        if (!this.Data.Parameters.FromDate || !this.Data.Parameters.ToDate) {
            this.showMessageBox({
                text: 'Please select both From and To dates',
                title: 'Validation Error',
                icon: 'warning'
            });
            return false;
        }
        
        // Check date range
        if (this.Data.Parameters.FromDate > this.Data.Parameters.ToDate) {
            this.showMessageBox({
                text: 'From Date cannot be greater than To Date',
                title: 'Validation Error',
                icon: 'warning'
            });
            return false;
        }
        
        // Check at least one selection for multi-selects
        if (this.Data.Parameters.SelectedDepartments.length === 0) {
            this.showMessageBox({
                text: 'Please select at least one department',
                title: 'Validation Error',
                icon: 'warning'
            });
            return false;
        }
        
        // Validate email if scheduling
        if (this.Data.Parameters.ScheduleEmail) {
            if (!Utils.isValidEmail(this.Data.Parameters.EmailTo)) {
                this.showMessageBox({
                    text: 'Please enter a valid email address',
                    title: 'Validation Error',
                    icon: 'warning'
                });
                return false;
            }
        }
        
        return true;
    }

    /**
     * Preview report
     */
    previewReport = () => {
        if (!this.validateParameters()) return;
        
        this.Data.ShowLoading = true;
        
        const params = this.prepareReportParameters();
        
        Utils.ajax({
            url: '/api/reports/preview',
            method: 'POST',
            data: params,
            success: (response) => {
                if (response.success) {
                    // Open preview window
                    this.openReportPreview(response.data);
                } else {
                    this.showMessageBox({
                        text: response.message || 'Failed to generate preview',
                        title: 'Error',
                        icon: 'error'
                    });
                }
            },
            error: (error) => {
                this.handleError(error);
            },
            complete: () => {
                this.Data.ShowLoading = false;
            }
        });
    }

    /**
     * Download report
     */
    downloadReport = (format) => {
        if (!this.validateParameters()) return;
        
        this.Data.ShowLoading = true;
        
        const params = {
            ...this.prepareReportParameters(),
            format: format
        };
        
        Utils.ajax({
            url: '/api/reports/download',
            method: 'POST',
            data: params,
            responseType: 'blob',
            success: (response) => {
                // Download file
                const fileName = `report_${Date.now()}.${format}`;
                Utils.downloadFile(response, fileName);
                
                this.showToast({
                    text: 'Report downloaded successfully',
                    type: 'success'
                });
            },
            error: (error) => {
                this.handleError(error);
            },
            complete: () => {
                this.Data.ShowLoading = false;
            }
        });
    }

    /**
     * Email report
     */
    emailReport = () => {
        if (!this.validateParameters()) return;
        
        this.showInputDialog({
            text: 'Enter email address:',
            title: 'Email Report',
            inputType: 'email',
            defaultValue: this.Data.Parameters.EmailTo || Utils.getCurrentUserEmail(),
            onConfirm: (email) => {
                if (!Utils.isValidEmail(email)) {
                    this.showToast({
                        text: 'Invalid email address',
                        type: 'warning'
                    });
                    return;
                }
                
                this.sendReportEmail(email);
            }
        });
    }

    /**
     * Send report via email
     */
    sendReportEmail(email) {
        this.Data.ShowLoading = true;
        
        const params = {
            ...this.prepareReportParameters(),
            emailTo: email
        };
        
        Utils.ajax({
            url: '/api/reports/email',
            method: 'POST',
            data: params,
            success: (response) => {
                if (response.success) {
                    this.showToast({
                        text: 'Report sent successfully',
                        type: 'success'
                    });
                } else {
                    this.showMessageBox({
                        text: response.message || 'Failed to send report',
                        title: 'Error',
                        icon: 'error'
                    });
                }
            },
            error: (error) => {
                this.handleError(error);
            },
            complete: () => {
                this.Data.ShowLoading = false;
            }
        });
    }

    /**
     * Save parameters
     */
    saveParameters = () => {
        const params = this.prepareReportParameters();
        
        // Save to local storage
        localStorage.setItem(`report_params_${this.reportType}`, JSON.stringify(params));
        
        this.showToast({
            text: 'Parameters saved successfully',
            type: 'success'
        });
    }

    /**
     * Reset parameters
     */
    resetParameters = () => {
        this.showConfirmDialog({
            text: 'Are you sure you want to reset all parameters?',
            title: 'Reset Parameters',
            onConfirm: () => {
                // Reset to defaults
                this.Data.Parameters = {
                    FromDate: null,
                    ToDate: null,
                    SelectedDepartments: [],
                    SelectedSites: [],
                    Status: null,
                    ReportFormat: null,
                    GroupBy: 'none',
                    IncludeInactive: false,
                    ShowSummary: true,
                    ShowGraphs: false,
                    ScheduleEmail: false,
                    EmailTo: '',
                    EmailFrequency: 'once'
                };
                
                this.Data.AllDepartmentsSelected = false;
                this.Data.AllSitesSelected = false;
                
                this.setDefaultDates();
                
                this.showToast({
                    text: 'Parameters reset to defaults',
                    type: 'info'
                });
            }
        });
    }

    /**
     * Prepare report parameters for API
     */
    prepareReportParameters() {
        return {
            reportType: this.reportType,
            fromDate: Utils.formatDate(this.Data.Parameters.FromDate, 'yyyy-MM-dd'),
            toDate: Utils.formatDate(this.Data.Parameters.ToDate, 'yyyy-MM-dd'),
            departmentIds: this.Data.Parameters.SelectedDepartments,
            siteIds: this.Data.Parameters.SelectedSites,
            status: this.Data.Parameters.Status?.Value || '',
            reportFormat: this.Data.Parameters.ReportFormat?.Value || 'detailed',
            groupBy: this.Data.Parameters.GroupBy,
            includeInactive: this.Data.Parameters.IncludeInactive,
            showSummary: this.Data.Parameters.ShowSummary,
            showGraphs: this.Data.Parameters.ShowGraphs
        };
    }

    /**
     * Open report preview
     */
    openReportPreview(data) {
        // Implementation would open preview window
        console.log('Opening report preview:', data);
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
        super.dispose();
    }
}