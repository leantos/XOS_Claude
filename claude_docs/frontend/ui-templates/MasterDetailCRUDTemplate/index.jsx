import React from 'react';
import * as cntrl from '../../../xos-components/index';

/**
 * Master-Detail CRUD Form Template
 * Used by: CVSM001, CVSM006, CVSM021, CVSM026, CVSM040-046 (65% of components)
 * 
 * Features:
 * - Two-column layout for form fields
 * - Standard Save/Close button pattern
 * - Mandatory field indicators
 * - Consistent validation handling
 * 
 * Usage:
 * 1. Copy this template to your component folder
 * 2. Rename the component and update the ViewModel import
 * 3. Customize the form fields in the designated sections
 * 4. Update validation logic in the ViewModel
 */
const MasterDetailCRUDTemplate = ({ onClose }) => {
    const vm = React.useMemo(() => new MasterDetailCRUDTemplateVM(onClose), [onClose]);

    React.useEffect(() => {
        vm.loadData();
        return () => vm.dispose();
    }, [vm]);

    return (
        <cntrl.XOSControl 
            className="modal-md" 
            loading={vm.Data.ShowLoading} 
            title={vm.Data.Title}
            fullHeight={false}
        >
            <cntrl.XOSBody>
                <div className="window-content-area p-3">
                    <form autoComplete='off'>
                        {/* Section 1: Primary Information */}
                        <div className="row">
                            <div className="col-sm-12 col-md-6 mt-2">
                                <label htmlFor="code">Code <span className="text-danger">*</span></label>
                                <cntrl.XOSTextbox
                                    ref={(input) => { vm.codeInput = input }}
                                    value={vm.Data.Input.Code}
                                    name="code"
                                    maxLength={10}
                                    inputType={cntrl.XOSEnums.InputType.AlphaNumeric}
                                    onChange={(e) => vm.Data.Input.Code = e.target.value}
                                />
                            </div>
                            <div className="col-sm-12 col-md-6 mt-2">
                                <label htmlFor="name">Name <span className="text-danger">*</span></label>
                                <cntrl.XOSTextbox
                                    ref={(input) => { vm.nameInput = input }}
                                    value={vm.Data.Input.Name}
                                    name="name"
                                    maxLength={50}
                                    onChange={(e) => vm.Data.Input.Name = e.target.value}
                                />
                            </div>
                        </div>

                        {/* Section 2: Additional Fields */}
                        <div className="row">
                            <div className="col-sm-12 col-md-6 mt-2">
                                <label htmlFor="type">Type</label>
                                <cntrl.XOSSelect
                                    selectedItem={vm.Data.Input.Type}
                                    dataSource={vm.Data.TypeList}
                                    displayField="Name"
                                    valueField="Id"
                                    onChange={(item) => vm.Data.Input.Type = item}
                                />
                            </div>
                            <div className="col-sm-12 col-md-6 mt-2">
                                <label htmlFor="date">Effective Date</label>
                                <cntrl.XOSDatepicker
                                    name="date"
                                    value={vm.Data.Input.EffectiveDate}
                                    onChange={(date) => vm.Data.Input.EffectiveDate = date}
                                    maxDate={new Date()}
                                />
                            </div>
                        </div>

                        {/* Section 3: Description/Notes */}
                        <div className="row">
                            <div className="col-sm-12 mt-2">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    rows="3"
                                    maxLength="500"
                                    value={vm.Data.Input.Description || ''}
                                    onChange={(e) => vm.Data.Input.Description = e.target.value}
                                />
                            </div>
                        </div>

                        {/* Section 4: Status/Checkboxes */}
                        <div className="row">
                            <div className="col-sm-12 col-md-6 mt-3">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="isActive"
                                        checked={vm.Data.Input.IsActive}
                                        onChange={(e) => vm.Data.Input.IsActive = e.target.checked}
                                    />
                                    <label className="form-check-label" htmlFor="isActive">
                                        Is Active
                                    </label>
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-6 mt-3">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="isDefault"
                                        checked={vm.Data.Input.IsDefault}
                                        onChange={(e) => vm.Data.Input.IsDefault = e.target.checked}
                                    />
                                    <label className="form-check-label" htmlFor="isDefault">
                                        Set as Default
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Add more sections as needed */}
                    </form>
                </div>
            </cntrl.XOSBody>

            {/* Standard Button Area */}
            <div className="window-button-area">
                <button 
                    type="button" 
                    hot-key="S" 
                    className="btn btn-sm btn-primary"
                    onClick={vm.save}
                >
                    <i className="fa fa-save"></i> Save
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

export default MasterDetailCRUDTemplate;