import React from 'react';
import * as cntrl from '../../../xos-components/index';

/**
 * Complex Workflow Form Template
 * Used by: CVST005, CVSM026, CVST020 (10% of components)
 * 
 * Features:
 * - Multi-section forms with accordions
 * - File attachment handling with drag-drop
 * - Approval/rejection workflow buttons
 * - History and comments sections
 * - Conditional button rendering based on workflow state
 * - Email notifications integration
 * 
 * Usage:
 * 1. Copy this template to your component folder
 * 2. Configure workflow states and transitions in ViewModel
 * 3. Customize sections based on your workflow needs
 * 4. Update approval/rejection logic
 */
const WorkflowFormTemplate = ({ onClose, workflowId = null }) => {
    const vm = React.useMemo(() => new WorkflowFormTemplateVM(onClose, workflowId), [onClose, workflowId]);

    React.useEffect(() => {
        vm.loadData();
        return () => vm.dispose();
    }, [vm]);

    return (
        <cntrl.XOSControl 
            className="modal-xl" 
            loading={vm.Data.ShowLoading} 
            title={vm.Data.Title}
            fullHeight={true}
        >
            <cntrl.XOSBody>
                <div className="window-content-area p-3">
                    {/* Workflow Status Bar */}
                    <div className="workflow-status-bar mb-3">
                        <div className="row">
                            <div className="col-md-4">
                                <label>Request ID:</label>
                                <strong className="ml-2">{vm.Data.Workflow.RequestId}</strong>
                            </div>
                            <div className="col-md-4">
                                <label>Status:</label>
                                <span className={`badge ml-2 badge-${vm.getStatusClass()}`}>
                                    {vm.Data.Workflow.Status}
                                </span>
                            </div>
                            <div className="col-md-4">
                                <label>Created:</label>
                                <span className="ml-2">{Utils.formatDateTime(vm.Data.Workflow.CreatedDate)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Form Section */}
                    <div className="accordion" id="workflowAccordion">
                        {/* Section 1: Request Details */}
                        <div className="card">
                            <div className="card-header" id="headingDetails">
                                <h5 className="mb-0">
                                    <button 
                                        className="btn btn-link" 
                                        type="button" 
                                        data-toggle="collapse" 
                                        data-target="#collapseDetails"
                                        aria-expanded="true"
                                    >
                                        <i className="fa fa-file-text-o"></i> Request Details
                                    </button>
                                </h5>
                            </div>
                            <div 
                                id="collapseDetails" 
                                className="collapse show" 
                                data-parent="#workflowAccordion"
                            >
                                <div className="card-body">
                                    <form autoComplete='off'>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label>Request Type <span className="text-danger">*</span></label>
                                                <cntrl.XOSSelect
                                                    selectedItem={vm.Data.Workflow.RequestType}
                                                    dataSource={vm.Data.RequestTypes}
                                                    displayField="Name"
                                                    valueField="Id"
                                                    onChange={(item) => vm.onRequestTypeChange(item)}
                                                    disabled={!vm.Data.IsEditable}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label>Priority</label>
                                                <cntrl.XOSSelect
                                                    selectedItem={vm.Data.Workflow.Priority}
                                                    dataSource={vm.Data.PriorityList}
                                                    displayField="Name"
                                                    valueField="Value"
                                                    onChange={(item) => vm.Data.Workflow.Priority = item}
                                                    disabled={!vm.Data.IsEditable}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="row mt-2">
                                            <div className="col-md-12">
                                                <label>Description <span className="text-danger">*</span></label>
                                                <textarea
                                                    className="form-control"
                                                    rows="4"
                                                    value={vm.Data.Workflow.Description || ''}
                                                    onChange={(e) => vm.Data.Workflow.Description = e.target.value}
                                                    disabled={!vm.Data.IsEditable}
                                                />
                                            </div>
                                        </div>

                                        <div className="row mt-2">
                                            <div className="col-md-6">
                                                <label>Department</label>
                                                <cntrl.XOSSelect
                                                    selectedItem={vm.Data.Workflow.Department}
                                                    dataSource={vm.Data.DepartmentList}
                                                    displayField="Name"
                                                    valueField="Id"
                                                    onChange={(item) => vm.Data.Workflow.Department = item}
                                                    disabled={!vm.Data.IsEditable}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label>Due Date</label>
                                                <cntrl.XOSDatepicker
                                                    value={vm.Data.Workflow.DueDate}
                                                    onChange={(date) => vm.Data.Workflow.DueDate = date}
                                                    minDate={new Date()}
                                                    disabled={!vm.Data.IsEditable}
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: File Attachments */}
                        <div className="card">
                            <div className="card-header" id="headingAttachments">
                                <h5 className="mb-0">
                                    <button 
                                        className="btn btn-link collapsed" 
                                        type="button" 
                                        data-toggle="collapse" 
                                        data-target="#collapseAttachments"
                                    >
                                        <i className="fa fa-paperclip"></i> Attachments ({vm.Data.Attachments.length})
                                    </button>
                                </h5>
                            </div>
                            <div 
                                id="collapseAttachments" 
                                className="collapse" 
                                data-parent="#workflowAccordion"
                            >
                                <div className="card-body">
                                    {/* File Upload Area */}
                                    {vm.Data.IsEditable && (
                                        <div 
                                            className="file-drop-zone"
                                            onDrop={vm.handleFileDrop}
                                            onDragOver={(e) => e.preventDefault()}
                                            style={{
                                                border: '2px dashed #ccc',
                                                borderRadius: '5px',
                                                padding: '20px',
                                                textAlign: 'center',
                                                marginBottom: '15px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => vm.fileInput?.click()}
                                        >
                                            <i className="fa fa-cloud-upload fa-3x text-muted"></i>
                                            <p className="mt-2">Drag & drop files here or click to browse</p>
                                            <small className="text-muted">Maximum file size: 10MB</small>
                                            <input
                                                ref={(input) => vm.fileInput = input}
                                                type="file"
                                                multiple
                                                style={{ display: 'none' }}
                                                onChange={vm.handleFileSelect}
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                            />
                                        </div>
                                    )}

                                    {/* Attached Files List */}
                                    <div className="attached-files-list">
                                        {vm.Data.Attachments.map((file, index) => (
                                            <div key={index} className="file-item d-flex justify-content-between align-items-center p-2 border-bottom">
                                                <div className="file-info">
                                                    <i className={`fa ${vm.getFileIcon(file.type)} mr-2`}></i>
                                                    <a href="#" onClick={() => vm.downloadFile(file)}>
                                                        {file.name}
                                                    </a>
                                                    <small className="text-muted ml-2">({vm.formatFileSize(file.size)})</small>
                                                </div>
                                                <div className="file-actions">
                                                    {vm.Data.IsEditable && (
                                                        <button 
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => vm.removeFile(index)}
                                                            title="Remove"
                                                        >
                                                            <i className="fa fa-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {vm.Data.Attachments.length === 0 && (
                                            <p className="text-muted text-center">No attachments</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Approval History */}
                        <div className="card">
                            <div className="card-header" id="headingHistory">
                                <h5 className="mb-0">
                                    <button 
                                        className="btn btn-link collapsed" 
                                        type="button" 
                                        data-toggle="collapse" 
                                        data-target="#collapseHistory"
                                    >
                                        <i className="fa fa-history"></i> Approval History
                                    </button>
                                </h5>
                            </div>
                            <div 
                                id="collapseHistory" 
                                className="collapse" 
                                data-parent="#workflowAccordion"
                            >
                                <div className="card-body">
                                    <div className="timeline">
                                        {vm.Data.History.map((item, index) => (
                                            <div key={index} className="timeline-item">
                                                <div className="timeline-badge">
                                                    <i className={`fa ${vm.getActionIcon(item.action)}`}></i>
                                                </div>
                                                <div className="timeline-panel">
                                                    <div className="timeline-heading">
                                                        <h6 className="timeline-title">{item.action}</h6>
                                                        <p className="text-muted">
                                                            <small>
                                                                <i className="fa fa-clock-o"></i> {Utils.formatDateTime(item.date)}
                                                            </small>
                                                        </p>
                                                    </div>
                                                    <div className="timeline-body">
                                                        <p className="mb-0">
                                                            <strong>{item.userName}</strong> - {item.userRole}
                                                        </p>
                                                        {item.comments && (
                                                            <p className="mt-2 text-muted">
                                                                <em>"{item.comments}"</em>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Comments/Notes */}
                        {vm.Data.ShowComments && (
                            <div className="card">
                                <div className="card-header" id="headingComments">
                                    <h5 className="mb-0">
                                        <button 
                                            className="btn btn-link collapsed" 
                                            type="button" 
                                            data-toggle="collapse" 
                                            data-target="#collapseComments"
                                        >
                                            <i className="fa fa-comments"></i> Comments
                                        </button>
                                    </h5>
                                </div>
                                <div 
                                    id="collapseComments" 
                                    className="collapse" 
                                    data-parent="#workflowAccordion"
                                >
                                    <div className="card-body">
                                        <div className="form-group">
                                            <label>Add Comment:</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={vm.Data.NewComment}
                                                onChange={(e) => vm.Data.NewComment = e.target.value}
                                                placeholder="Enter your comments here..."
                                            />
                                        </div>
                                        
                                        {/* Previous Comments */}
                                        <div className="comments-list mt-3">
                                            {vm.Data.Comments.map((comment, index) => (
                                                <div key={index} className="comment-item mb-2 p-2 bg-light rounded">
                                                    <div className="comment-header">
                                                        <strong>{comment.userName}</strong>
                                                        <small className="text-muted ml-2">
                                                            {Utils.formatDateTime(comment.date)}
                                                        </small>
                                                    </div>
                                                    <div className="comment-body mt-1">
                                                        {comment.text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Information Panel */}
                    {vm.Data.ShowAdditionalInfo && (
                        <div className="additional-info mt-3">
                            <div className="card">
                                <div className="card-body">
                                    <h6>Additional Information</h6>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <small className="text-muted">Created By:</small>
                                            <p>{vm.Data.Workflow.CreatedBy}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Current Approver:</small>
                                            <p>{vm.Data.Workflow.CurrentApprover || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </cntrl.XOSBody>

            {/* Dynamic Workflow Buttons */}
            <div className="window-button-area">
                {/* Submit Button (for new/draft) */}
                {vm.Data.ShowSubmitButton && (
                    <button 
                        type="button" 
                        className="btn btn-sm btn-primary"
                        onClick={vm.submitWorkflow}
                    >
                        <i className="fa fa-send"></i> Submit
                    </button>
                )}

                {/* Approve Button */}
                {vm.Data.ShowApproveButton && (
                    <button 
                        type="button" 
                        className="btn btn-sm btn-success"
                        onClick={vm.approveWorkflow}
                    >
                        <i className="fa fa-check"></i> Approve
                    </button>
                )}

                {/* Reject Button */}
                {vm.Data.ShowRejectButton && (
                    <button 
                        type="button" 
                        className="btn btn-sm btn-danger"
                        onClick={vm.rejectWorkflow}
                    >
                        <i className="fa fa-times"></i> Reject
                    </button>
                )}

                {/* Return Button */}
                {vm.Data.ShowReturnButton && (
                    <button 
                        type="button" 
                        className="btn btn-sm btn-warning"
                        onClick={vm.returnWorkflow}
                    >
                        <i className="fa fa-undo"></i> Return
                    </button>
                )}

                {/* Save Draft Button */}
                {vm.Data.ShowSaveDraftButton && (
                    <button 
                        type="button" 
                        className="btn btn-sm btn-info"
                        onClick={vm.saveDraft}
                    >
                        <i className="fa fa-save"></i> Save Draft
                    </button>
                )}

                {/* Print Button */}
                <button 
                    type="button" 
                    className="btn btn-sm btn-secondary"
                    onClick={vm.printWorkflow}
                >
                    <i className="fa fa-print"></i> Print
                </button>

                {/* Close Button */}
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

export default WorkflowFormTemplate;