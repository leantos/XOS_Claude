import React from 'react';
import * as cntrl from '../../../xos-components/index';

/**
 * Report Parameter Form Template
 * Used by: CVSR005, CVSR010, CVSR015, CVSR020 (5% of components)
 * 
 * Features:
 * - Date range selection (From/To dates)
 * - Multi-select dropdowns with "Select All" checkbox
 * - Download dropdown with multiple format options (PDF/Excel/CSV)
 * - Report preview functionality
 * - Parameter validation
 * - Email scheduling options
 * 
 * Usage:
 * 1. Copy this template to your component folder
 * 2. Configure report parameters in ViewModel
 * 3. Update API endpoints for report generation
 * 4. Customize parameter fields based on report requirements
 */
const ReportParameterTemplate = ({ onClose, reportType = 'standard' }) => {
    const vm = React.useMemo(() => new ReportParameterTemplateVM(onClose, reportType), [onClose, reportType]);

    React.useEffect(() => {
        vm.loadData();
        return () => vm.dispose();
    }, [vm]);

    return (
        <cntrl.XOSControl 
            className="modal-md w-100" 
            loading={vm.Data.ShowLoading} 
            title={vm.Data.Title}
            fullHeight={false}
        >
            <cntrl.XOSBody>
                <div className="window-content-area p-3">
                    <form autoComplete='off'>
                        {/* Date Range Section */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h6 className="mb-0">
                                    <i className="fa fa-calendar"></i> Date Range
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-sm-12 col-md-6 mt-2">
                                        <label htmlFor="fromDate">From Date <span className="text-danger">*</span></label>
                                        <cntrl.XOSDatepicker
                                            name="fromDate"
                                            value={vm.Data.Parameters.FromDate}
                                            onChange={(date) => vm.onFromDateChange(date)}
                                            maxDate={vm.Data.Parameters.ToDate || new Date()}
                                        />
                                    </div>
                                    <div className="col-sm-12 col-md-6 mt-2">
                                        <label htmlFor="toDate">To Date <span className="text-danger">*</span></label>
                                        <cntrl.XOSDatepicker
                                            name="toDate"
                                            value={vm.Data.Parameters.ToDate}
                                            onChange={(date) => vm.onToDateChange(date)}
                                            minDate={vm.Data.Parameters.FromDate}
                                            maxDate={new Date()}
                                        />
                                    </div>
                                </div>
                                
                                {/* Quick Date Range Buttons */}
                                <div className="row mt-2">
                                    <div className="col-12">
                                        <div className="btn-group btn-group-sm" role="group">
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => vm.setDateRange('today')}
                                            >
                                                Today
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => vm.setDateRange('yesterday')}
                                            >
                                                Yesterday
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => vm.setDateRange('thisWeek')}
                                            >
                                                This Week
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => vm.setDateRange('lastWeek')}
                                            >
                                                Last Week
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => vm.setDateRange('thisMonth')}
                                            >
                                                This Month
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={() => vm.setDateRange('lastMonth')}
                                            >
                                                Last Month
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Parameters Section */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h6 className="mb-0">
                                    <i className="fa fa-filter"></i> Filter Parameters
                                </h6>
                            </div>
                            <div className="card-body">
                                {/* Department Multi-Select */}
                                <div className="row">
                                    <div className="col-sm-12 col-md-6 mt-2">
                                        <label>Department(s)</label>
                                        <div className="multi-select-container">
                                            <div className="form-check mb-2">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="selectAllDepts"
                                                    checked={vm.Data.AllDepartmentsSelected}
                                                    onChange={(e) => vm.toggleAllDepartments(e.target.checked)}
                                                />
                                                <label className="form-check-label" htmlFor="selectAllDepts">
                                                    <strong>Select All</strong>
                                                </label>
                                            </div>
                                            <div className="multi-select-list" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ced4da', borderRadius: '4px', padding: '5px' }}>
                                                {vm.Data.DepartmentList.map((dept) => (
                                                    <div key={dept.Id} className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id={`dept_${dept.Id}`}
                                                            checked={vm.Data.Parameters.SelectedDepartments.includes(dept.Id)}
                                                            onChange={(e) => vm.toggleDepartment(dept.Id, e.target.checked)}
                                                        />
                                                        <label className="form-check-label" htmlFor={`dept_${dept.Id}`}>
                                                            {dept.Name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Site Multi-Select */}
                                    <div className="col-sm-12 col-md-6 mt-2">
                                        <label>Site(s)</label>
                                        <div className="multi-select-container">
                                            <div className="form-check mb-2">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="selectAllSites"
                                                    checked={vm.Data.AllSitesSelected}
                                                    onChange={(e) => vm.toggleAllSites(e.target.checked)}
                                                />
                                                <label className="form-check-label" htmlFor="selectAllSites">
                                                    <strong>Select All</strong>
                                                </label>
                                            </div>
                                            <div className="multi-select-list" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ced4da', borderRadius: '4px', padding: '5px' }}>
                                                {vm.Data.SiteList.map((site) => (
                                                    <div key={site.Id} className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id={`site_${site.Id}`}
                                                            checked={vm.Data.Parameters.SelectedSites.includes(site.Id)}
                                                            onChange={(e) => vm.toggleSite(site.Id, e.target.checked)}
                                                        />
                                                        <label className="form-check-label" htmlFor={`site_${site.Id}`}>
                                                            {site.Name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Filters */}
                                <div className="row">
                                    <div className="col-sm-12 col-md-6 mt-2">
                                        <label>Status</label>
                                        <cntrl.XOSSelect
                                            selectedItem={vm.Data.Parameters.Status}
                                            dataSource={vm.Data.StatusList}
                                            displayField="Name"
                                            valueField="Value"
                                            onChange={(item) => vm.Data.Parameters.Status = item}
                                            placeholder="All Statuses"
                                        />
                                    </div>
                                    <div className="col-sm-12 col-md-6 mt-2">
                                        <label>Report Type</label>
                                        <cntrl.XOSSelect
                                            selectedItem={vm.Data.Parameters.ReportFormat}
                                            dataSource={vm.Data.ReportFormatList}
                                            displayField="Name"
                                            valueField="Value"
                                            onChange={(item) => vm.Data.Parameters.ReportFormat = item}
                                        />
                                    </div>
                                </div>

                                {/* Group By Options */}
                                <div className="row">
                                    <div className="col-12 mt-3">
                                        <label>Group By</label>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="groupBy"
                                                id="groupNone"
                                                checked={vm.Data.Parameters.GroupBy === 'none'}
                                                onChange={() => vm.Data.Parameters.GroupBy = 'none'}
                                            />
                                            <label className="form-check-label" htmlFor="groupNone">
                                                None
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="groupBy"
                                                id="groupDept"
                                                checked={vm.Data.Parameters.GroupBy === 'department'}
                                                onChange={() => vm.Data.Parameters.GroupBy = 'department'}
                                            />
                                            <label className="form-check-label" htmlFor="groupDept">
                                                Department
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="groupBy"
                                                id="groupSite"
                                                checked={vm.Data.Parameters.GroupBy === 'site'}
                                                onChange={() => vm.Data.Parameters.GroupBy = 'site'}
                                            />
                                            <label className="form-check-label" htmlFor="groupSite">
                                                Site
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="groupBy"
                                                id="groupDate"
                                                checked={vm.Data.Parameters.GroupBy === 'date'}
                                                onChange={() => vm.Data.Parameters.GroupBy = 'date'}
                                            />
                                            <label className="form-check-label" htmlFor="groupDate">
                                                Date
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Options */}
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">
                                    <i className="fa fa-cog"></i> Additional Options
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="includeInactive"
                                                checked={vm.Data.Parameters.IncludeInactive}
                                                onChange={(e) => vm.Data.Parameters.IncludeInactive = e.target.checked}
                                            />
                                            <label className="form-check-label" htmlFor="includeInactive">
                                                Include Inactive Records
                                            </label>
                                        </div>
                                        <div className="form-check mt-2">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="showSummary"
                                                checked={vm.Data.Parameters.ShowSummary}
                                                onChange={(e) => vm.Data.Parameters.ShowSummary = e.target.checked}
                                            />
                                            <label className="form-check-label" htmlFor="showSummary">
                                                Show Summary Section
                                            </label>
                                        </div>
                                        <div className="form-check mt-2">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="showGraphs"
                                                checked={vm.Data.Parameters.ShowGraphs}
                                                onChange={(e) => vm.Data.Parameters.ShowGraphs = e.target.checked}
                                            />
                                            <label className="form-check-label" htmlFor="showGraphs">
                                                Include Graphs/Charts
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Schedule Option */}
                                <div className="row mt-3">
                                    <div className="col-12">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="scheduleEmail"
                                                checked={vm.Data.Parameters.ScheduleEmail}
                                                onChange={(e) => vm.toggleEmailSchedule(e.target.checked)}
                                            />
                                            <label className="form-check-label" htmlFor="scheduleEmail">
                                                Schedule Email Delivery
                                            </label>
                                        </div>
                                        
                                        {vm.Data.Parameters.ScheduleEmail && (
                                            <div className="email-schedule-options mt-2 p-2 border rounded">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>Email To:</label>
                                                        <input
                                                            type="email"
                                                            className="form-control form-control-sm"
                                                            value={vm.Data.Parameters.EmailTo}
                                                            onChange={(e) => vm.Data.Parameters.EmailTo = e.target.value}
                                                            placeholder="email@example.com"
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label>Frequency:</label>
                                                        <select 
                                                            className="form-control form-control-sm"
                                                            value={vm.Data.Parameters.EmailFrequency}
                                                            onChange={(e) => vm.Data.Parameters.EmailFrequency = e.target.value}
                                                        >
                                                            <option value="once">Once</option>
                                                            <option value="daily">Daily</option>
                                                            <option value="weekly">Weekly</option>
                                                            <option value="monthly">Monthly</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </cntrl.XOSBody>

            {/* Button Area */}
            <div className="window-button-area">
                <button 
                    type="button" 
                    className="btn btn-sm btn-primary"
                    onClick={vm.previewReport}
                >
                    <i className="fa fa-eye"></i> Preview
                </button>
                
                {/* Download Dropdown */}
                <div className="btn-group dropup">
                    <button 
                        type="button" 
                        className="btn btn-sm btn-success dropdown-toggle"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <i className="fa fa-download"></i> Download
                    </button>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" href="#" onClick={() => vm.downloadReport('pdf')}>
                            <i className="fa fa-file-pdf-o text-danger"></i> PDF Format
                        </a>
                        <a className="dropdown-item" href="#" onClick={() => vm.downloadReport('excel')}>
                            <i className="fa fa-file-excel-o text-success"></i> Excel Format
                        </a>
                        <a className="dropdown-item" href="#" onClick={() => vm.downloadReport('csv')}>
                            <i className="fa fa-file-text-o text-primary"></i> CSV Format
                        </a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" href="#" onClick={() => vm.emailReport()}>
                            <i className="fa fa-envelope-o"></i> Email Report
                        </a>
                    </div>
                </div>

                <button 
                    type="button" 
                    className="btn btn-sm btn-info"
                    onClick={vm.saveParameters}
                >
                    <i className="fa fa-save"></i> Save Parameters
                </button>

                <button 
                    type="button" 
                    className="btn btn-sm btn-warning"
                    onClick={vm.resetParameters}
                >
                    <i className="fa fa-refresh"></i> Reset
                </button>

                <button 
                    type="button" 
                    hot-key="C" 
                    className="btn btn-sm btn-close1"
                    onClick={vm.close}
                >
                    <i className="fa fa-times"></i> Close
                </button>
            </div>
        </cntrl.XOSControl>
    );
};

export default ReportParameterTemplate;