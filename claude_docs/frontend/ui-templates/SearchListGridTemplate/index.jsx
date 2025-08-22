import React from 'react';
import * as cntrl from '../../../xos-components/index';

/**
 * Search/List with Grid Template
 * Used by: CVSM005, CVSM020, CVST020 (20% of components)
 * 
 * Features:
 * - Search bar with text input, dropdown filter, and action buttons
 * - XOSGrid with pagination, sorting, and row selection
 * - Standard button bar: New, Modify, Audit, Close
 * - Row styling for status indication
 * 
 * Usage:
 * 1. Copy this template to your component folder
 * 2. Update the ViewModel with your API endpoints
 * 3. Customize grid columns and search filters
 * 4. Configure row actions and button visibility
 */
const SearchListGridTemplate = ({ onClose }) => {
    const vm = React.useMemo(() => new SearchListGridTemplateVM(onClose), [onClose]);

    React.useEffect(() => {
        vm.loadData();
        return () => vm.dispose();
    }, [vm]);

    // Grid column configuration
    const gridColumns = [
        {
            dataIndex: 'Code',
            title: 'Code',
            width: '15%',
            sortable: true,
            filterable: true
        },
        {
            dataIndex: 'Name',
            title: 'Name',
            width: '35%',
            sortable: true,
            filterable: true
        },
        {
            dataIndex: 'Type',
            title: 'Type',
            width: '20%',
            sortable: true,
            filterable: true
        },
        {
            dataIndex: 'Status',
            title: 'Status',
            width: '15%',
            sortable: true,
            render: (value) => (
                <span className={`badge ${value === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                    {value}
                </span>
            )
        },
        {
            dataIndex: 'CreatedDate',
            title: 'Created Date',
            width: '15%',
            sortable: true,
            render: (value) => Utils.formatDate(value)
        }
    ];

    // Grid attributes
    const gridAttributes = {
        columns: gridColumns,
        dataSource: vm.Data.GridData,
        pagination: true,
        pageSize: 20,
        selectionMode: 'single',
        selectedRows: vm.Data.SelectedRows,
        onSelectionChange: vm.onGridSelectionChange,
        onDoubleClick: vm.modifyRecord,
        rowClassName: (record) => {
            // Apply styling based on record status
            if (record.Status === 'Inactive') {
                return 'text-muted inactive-row';
            }
            return '';
        },
        loading: vm.Data.GridLoading,
        height: 'calc(100vh - 300px)',
        striped: true,
        bordered: true,
        hoverable: true
    };

    return (
        <cntrl.XOSControl 
            className="modal-xl" 
            loading={vm.Data.ShowLoading} 
            title={vm.Data.Title}
            fullHeight={true}
        >
            <cntrl.XOSBody>
                <div className="window-content-area p-3">
                    {/* Search Section */}
                    <div className="search-section mb-3">
                        <div className="row m-0">
                            <div className="col-md-5">
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <i className="fa fa-search"></i>
                                        </span>
                                    </div>
                                    <cntrl.XOSTextbox
                                        placeholder="Search by code or name..."
                                        value={vm.Data.SearchInput.Text}
                                        onChange={(e) => vm.Data.SearchInput.Text = e.target.value}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') vm.search();
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <cntrl.XOSSelect
                                    selectedItem={vm.Data.SearchInput.Status}
                                    dataSource={vm.Data.StatusList}
                                    displayField="Name"
                                    valueField="Value"
                                    placeholder="Select Status"
                                    onChange={(item) => vm.Data.SearchInput.Status = item}
                                />
                            </div>
                            <div className="col-md-3">
                                <button 
                                    className="btn btn-sm btn-primary me-2"
                                    onClick={vm.search}
                                    title="Search"
                                >
                                    <i className="fa fa-search"></i> Search
                                </button>
                                <button 
                                    className="btn btn-sm btn-primary"
                                    onClick={vm.clearSearch}
                                    title="Clear"
                                >
                                    <i className="fa fa-refresh"></i> Clear
                                </button>
                            </div>
                        </div>

                        {/* Additional Filter Row (Optional) */}
                        {vm.Data.ShowAdvancedFilters && (
                            <div className="row m-0 mt-2">
                                <div className="col-md-3">
                                    <cntrl.XOSDatepicker
                                        placeholder="From Date"
                                        value={vm.Data.SearchInput.FromDate}
                                        onChange={(date) => vm.Data.SearchInput.FromDate = date}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <cntrl.XOSDatepicker
                                        placeholder="To Date"
                                        value={vm.Data.SearchInput.ToDate}
                                        onChange={(date) => vm.Data.SearchInput.ToDate = date}
                                        minDate={vm.Data.SearchInput.FromDate}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <cntrl.XOSSelect
                                        selectedItem={vm.Data.SearchInput.Department}
                                        dataSource={vm.Data.DepartmentList}
                                        displayField="Name"
                                        valueField="Id"
                                        placeholder="Select Department"
                                        onChange={(item) => vm.Data.SearchInput.Department = item}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <button 
                                        className="btn btn-sm btn-link"
                                        onClick={() => vm.Data.ShowAdvancedFilters = false}
                                    >
                                        <i className="fa fa-chevron-up"></i> Hide Advanced
                                    </button>
                                </div>
                            </div>
                        )}

                        {!vm.Data.ShowAdvancedFilters && (
                            <div className="row m-0 mt-2">
                                <div className="col-md-12">
                                    <button 
                                        className="btn btn-sm btn-link"
                                        onClick={() => vm.Data.ShowAdvancedFilters = true}
                                    >
                                        <i className="fa fa-chevron-down"></i> Show Advanced Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Grid Section */}
                    <div className="grid-section">
                        <div className="row">
                            <div className="col-md-12">
                                <cntrl.XOSGrid {...gridAttributes} />
                            </div>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="status-bar mt-2">
                        <div className="row">
                            <div className="col-md-6">
                                <small className="text-muted">
                                    Showing {vm.Data.GridData.length} of {vm.Data.TotalRecords} records
                                </small>
                            </div>
                            <div className="col-md-6 text-right">
                                <small className="text-muted">
                                    Last updated: {Utils.formatDateTime(vm.Data.LastUpdated)}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </cntrl.XOSBody>

            {/* Standard Button Area */}
            <div className="window-button-area">
                <button 
                    type="button" 
                    hot-key="N" 
                    className="btn btn-sm btn-primary"
                    onClick={vm.addNew}
                >
                    <i className="fa fa-plus"></i> New
                </button>
                <button 
                    type="button" 
                    hot-key="M" 
                    className="btn btn-sm btn-primary"
                    onClick={vm.modifyRecord}
                    disabled={!vm.Data.SelectedRows.length}
                >
                    <i className="fa fa-edit"></i> Modify
                </button>
                <button 
                    type="button" 
                    hot-key="A" 
                    className="btn btn-sm btn-info"
                    onClick={vm.showAudit}
                    disabled={!vm.Data.SelectedRows.length}
                >
                    <i className="fa fa-history"></i> Audit
                </button>
                <button 
                    type="button" 
                    hot-key="E" 
                    className="btn btn-sm btn-success"
                    onClick={vm.exportData}
                >
                    <i className="fa fa-download"></i> Export
                </button>
                <button 
                    type="button" 
                    hot-key="C" 
                    className="btn btn-sm btn-primary"
                    onClick={vm.close}
                >
                    <i className="fa fa-times"></i> Close
                </button>
            </div>
        </cntrl.XOSControl>
    );
};

export default SearchListGridTemplate;