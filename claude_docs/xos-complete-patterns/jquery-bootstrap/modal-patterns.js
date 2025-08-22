// XOS Modal Patterns Complete Reference
// Comprehensive modal management patterns for XOS applications

(function($) {
    'use strict';

    // Extend XOS namespace for Modal patterns
    const XOS = window.XOS || {};
    XOS.Modal = XOS.Modal || {};

    // ============================================================================
    // BASIC MODAL PATTERNS
    // ============================================================================

    // ✅ CORRECT: Base modal class with comprehensive functionality
    XOS.Modal.BaseModal = class {
        constructor(options = {}) {
            this.defaults = {
                id: this.generateId(),
                title: 'Modal',
                body: '',
                size: '', // '', 'modal-sm', 'modal-lg', 'modal-xl', 'modal-fullscreen'
                centered: false,
                scrollable: false,
                backdrop: true,
                keyboard: true,
                focus: true,
                show: true,
                closeButton: true,
                buttons: [],
                onShow: null,
                onShown: null,
                onHide: null,
                onHidden: null,
                destroyOnHide: true
            };

            this.settings = Object.assign({}, this.defaults, options);
            this.modal = null;
            this.$element = null;
            this.isVisible = false;

            this.create();
            this.setupEvents();
        }

        generateId() {
            return 'modal_' + Math.random().toString(36).substr(2, 9);
        }

        create() {
            // Remove existing modal with same ID
            $(`#${this.settings.id}`).remove();

            const modalHtml = this.buildModalHtml();
            $('body').append(modalHtml);

            this.$element = $(`#${this.settings.id}`);
            this.modal = new bootstrap.Modal(this.$element[0], {
                backdrop: this.settings.backdrop,
                keyboard: this.settings.keyboard,
                focus: this.settings.focus
            });
        }

        buildModalHtml() {
            const sizeClass = this.settings.size ? ` ${this.settings.size}` : '';
            const centeredClass = this.settings.centered ? ' modal-dialog-centered' : '';
            const scrollableClass = this.settings.scrollable ? ' modal-dialog-scrollable' : '';
            
            const closeButton = this.settings.closeButton 
                ? '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'
                : '';

            const buttonsHtml = this.buildButtonsHtml();

            return `
                <div class="modal fade" id="${this.settings.id}" tabindex="-1" aria-labelledby="${this.settings.id}Label" aria-hidden="true">
                    <div class="modal-dialog${sizeClass}${centeredClass}${scrollableClass}">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="${this.settings.id}Label">${this.settings.title}</h5>
                                ${closeButton}
                            </div>
                            <div class="modal-body">
                                ${this.settings.body}
                            </div>
                            ${buttonsHtml}
                        </div>
                    </div>
                </div>
            `;
        }

        buildButtonsHtml() {
            if (!this.settings.buttons || this.settings.buttons.length === 0) {
                return '';
            }

            let buttonsHtml = '<div class="modal-footer">';
            this.settings.buttons.forEach((button, index) => {
                const buttonId = `${this.settings.id}_btn_${index}`;
                const disabled = button.disabled ? 'disabled' : '';
                const dismiss = button.dismiss ? 'data-bs-dismiss="modal"' : '';
                
                buttonsHtml += `
                    <button type="button" 
                            id="${buttonId}"
                            class="btn ${button.class || 'btn-secondary'}" 
                            ${disabled} 
                            ${dismiss}>
                        ${button.text}
                    </button>
                `;
            });
            buttonsHtml += '</div>';

            return buttonsHtml;
        }

        setupEvents() {
            // Bootstrap modal events
            this.$element.on('show.bs.modal', (e) => {
                this.isVisible = true;
                if (this.settings.onShow) {
                    this.settings.onShow.call(this, e);
                }
            });

            this.$element.on('shown.bs.modal', (e) => {
                if (this.settings.onShown) {
                    this.settings.onShown.call(this, e);
                }
                this.onShown(e);
            });

            this.$element.on('hide.bs.modal', (e) => {
                this.isVisible = false;
                if (this.settings.onHide) {
                    this.settings.onHide.call(this, e);
                }
            });

            this.$element.on('hidden.bs.modal', (e) => {
                if (this.settings.onHidden) {
                    this.settings.onHidden.call(this, e);
                }
                this.onHidden(e);
            });

            // Button click events
            this.settings.buttons.forEach((button, index) => {
                if (button.onclick) {
                    $(`#${this.settings.id}_btn_${index}`).on('click', (e) => {
                        button.onclick.call(this, e, button);
                    });
                }
            });
        }

        onShown(e) {
            // Focus first input if available
            this.$element.find('input, select, textarea').first().focus();
        }

        onHidden(e) {
            if (this.settings.destroyOnHide) {
                this.destroy();
            }
        }

        show() {
            if (this.modal) {
                this.modal.show();
            }
            return this;
        }

        hide() {
            if (this.modal) {
                this.modal.hide();
            }
            return this;
        }

        toggle() {
            if (this.modal) {
                this.modal.toggle();
            }
            return this;
        }

        updateTitle(title) {
            this.settings.title = title;
            this.$element.find('.modal-title').text(title);
            return this;
        }

        updateBody(body) {
            this.settings.body = body;
            this.$element.find('.modal-body').html(body);
            
            // Initialize any new components in the updated content
            XOS.Bootstrap.initializeComponents(this.$element.find('.modal-body'));
            return this;
        }

        enableButton(index) {
            $(`#${this.settings.id}_btn_${index}`).prop('disabled', false);
            return this;
        }

        disableButton(index) {
            $(`#${this.settings.id}_btn_${index}`).prop('disabled', true);
            return this;
        }

        showLoading(message = 'Loading...') {
            const loadingHtml = `
                <div class="text-center p-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">${message}</span>
                    </div>
                    <p class="mt-3 mb-0">${message}</p>
                </div>
            `;
            this.updateBody(loadingHtml);
            return this;
        }

        destroy() {
            if (this.modal) {
                this.modal.dispose();
            }
            if (this.$element) {
                this.$element.remove();
            }
            this.modal = null;
            this.$element = null;
        }
    };

    // ============================================================================
    // SPECIALIZED MODAL TYPES
    // ============================================================================

    // ✅ CORRECT: Confirmation modal
    XOS.Modal.ConfirmModal = class extends XOS.Modal.BaseModal {
        constructor(options = {}) {
            const defaults = {
                title: 'Confirm Action',
                message: 'Are you sure you want to continue?',
                confirmText: 'Confirm',
                cancelText: 'Cancel',
                confirmClass: 'btn-primary',
                cancelClass: 'btn-secondary',
                dangerMode: false,
                onConfirm: null,
                onCancel: null
            };

            const settings = Object.assign({}, defaults, options);
            
            // Override body and buttons
            settings.body = `<p>${settings.message}</p>`;
            settings.buttons = [
                {
                    text: settings.cancelText,
                    class: settings.cancelClass,
                    dismiss: true,
                    onclick: function() {
                        if (settings.onCancel) {
                            settings.onCancel.call(this);
                        }
                    }
                },
                {
                    text: settings.confirmText,
                    class: settings.dangerMode ? 'btn-danger' : settings.confirmClass,
                    onclick: function() {
                        if (settings.onConfirm) {
                            settings.onConfirm.call(this);
                        }
                        this.hide();
                    }
                }
            ];

            super(settings);
        }

        static show(options) {
            return new XOS.Modal.ConfirmModal(options).show();
        }
    };

    // ✅ CORRECT: Alert modal
    XOS.Modal.AlertModal = class extends XOS.Modal.BaseModal {
        constructor(options = {}) {
            const defaults = {
                title: 'Alert',
                message: 'This is an alert message.',
                type: 'info', // success, error, warning, info
                okText: 'OK',
                onOk: null
            };

            const settings = Object.assign({}, defaults, options);
            
            // Set title and body based on type
            const typeConfig = {
                success: { icon: '✅', titleClass: 'text-success' },
                error: { icon: '❌', titleClass: 'text-danger' },
                warning: { icon: '⚠️', titleClass: 'text-warning' },
                info: { icon: 'ℹ️', titleClass: 'text-info' }
            };

            const config = typeConfig[settings.type] || typeConfig.info;
            
            settings.body = `
                <div class="text-center">
                    <div class="display-1 mb-3">${config.icon}</div>
                    <p class="fs-5">${settings.message}</p>
                </div>
            `;
            
            settings.buttons = [
                {
                    text: settings.okText,
                    class: 'btn-primary',
                    onclick: function() {
                        if (settings.onOk) {
                            settings.onOk.call(this);
                        }
                        this.hide();
                    }
                }
            ];

            super(settings);
            
            // Update title style
            this.$element.find('.modal-title').addClass(config.titleClass);
        }

        static success(message, title = 'Success', onOk = null) {
            return new XOS.Modal.AlertModal({
                type: 'success',
                title: title,
                message: message,
                onOk: onOk
            }).show();
        }

        static error(message, title = 'Error', onOk = null) {
            return new XOS.Modal.AlertModal({
                type: 'error',
                title: title,
                message: message,
                onOk: onOk
            }).show();
        }

        static warning(message, title = 'Warning', onOk = null) {
            return new XOS.Modal.AlertModal({
                type: 'warning',
                title: title,
                message: message,
                onOk: onOk
            }).show();
        }

        static info(message, title = 'Information', onOk = null) {
            return new XOS.Modal.AlertModal({
                type: 'info',
                title: title,
                message: message,
                onOk: onOk
            }).show();
        }
    };

    // ✅ CORRECT: AJAX modal for loading remote content
    XOS.Modal.AjaxModal = class extends XOS.Modal.BaseModal {
        constructor(options = {}) {
            const defaults = {
                url: null,
                method: 'GET',
                data: {},
                loadingMessage: 'Loading content...',
                errorMessage: 'Failed to load content',
                autoShow: true,
                onContentLoaded: null,
                onLoadError: null
            };

            const settings = Object.assign({}, defaults, options);
            
            super(settings);
            
            if (settings.autoShow) {
                this.loadContent();
            }
        }

        loadContent() {
            if (!this.settings.url) {
                console.error('No URL provided for AJAX modal');
                return this;
            }

            this.showLoading(this.settings.loadingMessage);

            $.ajax({
                url: this.settings.url,
                method: this.settings.method,
                data: this.settings.data,
                success: (data) => {
                    this.updateBody(data);
                    
                    if (this.settings.onContentLoaded) {
                        this.settings.onContentLoaded.call(this, data);
                    }
                },
                error: (xhr, status, error) => {
                    const errorMessage = xhr.responseJSON?.message || this.settings.errorMessage;
                    this.updateBody(`<div class="alert alert-danger">${errorMessage}</div>`);
                    
                    if (this.settings.onLoadError) {
                        this.settings.onLoadError.call(this, xhr, status, error);
                    }
                }
            });

            return this;
        }

        reload() {
            return this.loadContent();
        }

        static load(url, options = {}) {
            return new XOS.Modal.AjaxModal(Object.assign({ url: url }, options)).show();
        }
    };

    // ✅ CORRECT: Form modal for CRUD operations
    XOS.Modal.FormModal = class extends XOS.Modal.BaseModal {
        constructor(options = {}) {
            const defaults = {
                formHtml: '<form></form>',
                submitText: 'Submit',
                cancelText: 'Cancel',
                submitClass: 'btn-primary',
                validateOnSubmit: true,
                resetOnSuccess: false,
                closeOnSuccess: true,
                onSubmit: null,
                onSuccess: null,
                onError: null,
                onValidationError: null
            };

            const settings = Object.assign({}, defaults, options);
            
            settings.body = settings.formHtml;
            settings.buttons = [
                {
                    text: settings.cancelText,
                    class: 'btn-secondary',
                    dismiss: true
                },
                {
                    text: settings.submitText,
                    class: settings.submitClass,
                    onclick: function() {
                        this.submitForm();
                    }
                }
            ];

            super(settings);
            
            this.setupFormEvents();
        }

        setupFormEvents() {
            // Prevent default form submission
            this.$element.on('submit', 'form', (e) => {
                e.preventDefault();
                this.submitForm();
            });

            // Enter key submission
            this.$element.on('keypress', 'form input', (e) => {
                if (e.which === 13 && !$(e.target).is('textarea')) {
                    e.preventDefault();
                    this.submitForm();
                }
            });
        }

        submitForm() {
            const $form = this.$element.find('form');
            
            if (!$form.length) {
                console.error('No form found in modal');
                return;
            }

            // Validate form if enabled
            if (this.settings.validateOnSubmit && !this.validateForm($form)) {
                if (this.settings.onValidationError) {
                    this.settings.onValidationError.call(this, $form);
                }
                return;
            }

            // Disable submit button
            this.disableButton(1);
            const submitBtn = this.$element.find('.modal-footer .btn-primary');
            const originalText = submitBtn.text();
            submitBtn.text('Please wait...');

            // Get form data
            const formData = this.getFormData($form);

            // Call submit handler
            if (this.settings.onSubmit) {
                const result = this.settings.onSubmit.call(this, formData, $form);
                
                // If result is a promise, handle it
                if (result && typeof result.then === 'function') {
                    result
                        .then((response) => {
                            this.handleSuccess(response, $form);
                        })
                        .catch((error) => {
                            this.handleError(error, $form);
                        })
                        .finally(() => {
                            this.enableButton(1);
                            submitBtn.text(originalText);
                        });
                } else {
                    this.enableButton(1);
                    submitBtn.text(originalText);
                }
            } else {
                this.enableButton(1);
                submitBtn.text(originalText);
            }
        }

        validateForm($form) {
            let isValid = true;
            
            // Clear previous errors
            $form.find('.is-invalid').removeClass('is-invalid');
            $form.find('.invalid-feedback').remove();

            // Validate required fields
            $form.find('[required]').each(function() {
                const $field = $(this);
                if (!$field.val() || $field.val().trim() === '') {
                    $field.addClass('is-invalid');
                    $field.after('<div class="invalid-feedback">This field is required</div>');
                    isValid = false;
                }
            });

            // Validate email fields
            $form.find('input[type="email"]').each(function() {
                const $field = $(this);
                const email = $field.val();
                if (email && !XOS.Modal.isValidEmail(email)) {
                    $field.addClass('is-invalid');
                    $field.after('<div class="invalid-feedback">Please enter a valid email address</div>');
                    isValid = false;
                }
            });

            return isValid;
        }

        getFormData($form) {
            const formArray = $form.serializeArray();
            const formData = {};
            
            formArray.forEach(field => {
                if (formData[field.name]) {
                    // Handle multiple values (checkboxes, multiple selects)
                    if (!Array.isArray(formData[field.name])) {
                        formData[field.name] = [formData[field.name]];
                    }
                    formData[field.name].push(field.value);
                } else {
                    formData[field.name] = field.value;
                }
            });

            return formData;
        }

        handleSuccess(response, $form) {
            if (this.settings.onSuccess) {
                this.settings.onSuccess.call(this, response, $form);
            }

            if (this.settings.resetOnSuccess) {
                $form[0].reset();
            }

            if (this.settings.closeOnSuccess) {
                this.hide();
            }
        }

        handleError(error, $form) {
            if (this.settings.onError) {
                this.settings.onError.call(this, error, $form);
            }

            // Show validation errors if provided
            if (error.responseJSON && error.responseJSON.errors) {
                this.showValidationErrors($form, error.responseJSON.errors);
            }
        }

        showValidationErrors($form, errors) {
            Object.keys(errors).forEach(fieldName => {
                const $field = $form.find(`[name="${fieldName}"]`);
                if ($field.length && errors[fieldName].length > 0) {
                    $field.addClass('is-invalid');
                    $field.after(`<div class="invalid-feedback">${errors[fieldName][0]}</div>`);
                }
            });
        }

        static create(formHtml, options = {}) {
            return new XOS.Modal.FormModal(Object.assign({ formHtml: formHtml }, options));
        }
    };

    // ============================================================================
    // MODAL MANAGER
    // ============================================================================

    // ✅ CORRECT: Modal stack manager
    XOS.Modal.Manager = {
        stack: [],
        zIndexBase: 1050,

        add: function(modal) {
            this.stack.push(modal);
            this.updateZIndex();
        },

        remove: function(modal) {
            const index = this.stack.indexOf(modal);
            if (index > -1) {
                this.stack.splice(index, 1);
            }
            this.updateZIndex();
        },

        updateZIndex: function() {
            this.stack.forEach((modal, index) => {
                if (modal.$element) {
                    modal.$element.css('z-index', this.zIndexBase + (index * 10));
                }
            });
        },

        closeAll: function() {
            [...this.stack].forEach(modal => {
                if (modal.hide) {
                    modal.hide();
                }
            });
        },

        getTopModal: function() {
            return this.stack[this.stack.length - 1] || null;
        },

        count: function() {
            return this.stack.length;
        }
    };

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    XOS.Modal.isValidEmail = function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // ✅ CORRECT: Quick modal functions
    XOS.Modal.alert = function(message, title = 'Alert', type = 'info') {
        return XOS.Modal.AlertModal[type](message, title);
    };

    XOS.Modal.confirm = function(message, onConfirm, options = {}) {
        return XOS.Modal.ConfirmModal.show(Object.assign({
            message: message,
            onConfirm: onConfirm
        }, options));
    };

    XOS.Modal.prompt = function(message, defaultValue = '', onSubmit = null) {
        const formHtml = `
            <form>
                <div class="mb-3">
                    <label class="form-label">${message}</label>
                    <input type="text" class="form-control" name="value" value="${defaultValue}" required>
                </div>
            </form>
        `;

        return new XOS.Modal.FormModal({
            title: 'Input Required',
            formHtml: formHtml,
            onSubmit: function(formData) {
                if (onSubmit) {
                    onSubmit(formData.value);
                }
                this.hide();
            }
        }).show();
    };

    XOS.Modal.load = function(url, title = 'Loading...', options = {}) {
        return XOS.Modal.AjaxModal.load(url, Object.assign({ title: title }, options));
    };

    // ============================================================================
    // COMPLETE EXAMPLES
    // ============================================================================

    // ✅ COMPLETE EXAMPLE: User management modal
    XOS.Modal.UserModal = class extends XOS.Modal.FormModal {
        constructor(user = null, options = {}) {
            const isEdit = user !== null;
            const title = isEdit ? 'Edit User' : 'Create User';
            
            const formHtml = `
                <form id="userForm">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="userName" class="form-label">Name *</label>
                                <input type="text" class="form-control" id="userName" name="name" 
                                       value="${user?.name || ''}" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="userEmail" class="form-label">Email *</label>
                                <input type="email" class="form-control" id="userEmail" name="email" 
                                       value="${user?.email || ''}" required>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="userRole" class="form-label">Role</label>
                                <select class="form-select" id="userRole" name="role">
                                    <option value="user" ${user?.role === 'user' ? 'selected' : ''}>User</option>
                                    <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="userStatus" class="form-label">Status</label>
                                <select class="form-select" id="userStatus" name="status">
                                    <option value="active" ${user?.status === 'active' ? 'selected' : ''}>Active</option>
                                    <option value="inactive" ${user?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    ${!isEdit ? `
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="userPassword" class="form-label">Password *</label>
                                <input type="password" class="form-control" id="userPassword" name="password" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="userPasswordConfirm" class="form-label">Confirm Password *</label>
                                <input type="password" class="form-control" id="userPasswordConfirm" name="passwordConfirm" required>
                            </div>
                        </div>
                    </div>` : ''}
                </form>
            `;

            const defaults = {
                title: title,
                size: 'modal-lg',
                formHtml: formHtml,
                submitText: isEdit ? 'Update User' : 'Create User',
                onSubmit: function(formData, $form) {
                    return this.saveUser(formData, isEdit, user?.id);
                },
                onSuccess: function(response) {
                    XOS.Modal.AlertModal.success('User saved successfully!');
                    $(document).trigger('user-saved', [response.data]);
                }
            };

            super(Object.assign(defaults, options));
            
            this.setupCustomValidation();
        }

        setupCustomValidation() {
            // Password confirmation validation
            this.$element.on('input', '#userPasswordConfirm', () => {
                const password = this.$element.find('#userPassword').val();
                const confirmPassword = this.$element.find('#userPasswordConfirm').val();
                const $confirmField = this.$element.find('#userPasswordConfirm');
                
                $confirmField.removeClass('is-invalid');
                $confirmField.siblings('.invalid-feedback').remove();
                
                if (confirmPassword && password !== confirmPassword) {
                    $confirmField.addClass('is-invalid');
                    $confirmField.after('<div class="invalid-feedback">Passwords do not match</div>');
                }
            });
        }

        saveUser(formData, isEdit, userId) {
            const url = isEdit ? `/api/users/${userId}` : '/api/users';
            const method = isEdit ? 'PUT' : 'POST';

            return $.ajax({
                url: url,
                method: method,
                data: JSON.stringify(formData),
                contentType: 'application/json',
                dataType: 'json'
            });
        }

        static create(options = {}) {
            return new XOS.Modal.UserModal(null, options).show();
        }

        static edit(user, options = {}) {
            return new XOS.Modal.UserModal(user, options).show();
        }
    };

    // ✅ COMPLETE EXAMPLE: File upload modal
    XOS.Modal.FileUploadModal = class extends XOS.Modal.BaseModal {
        constructor(options = {}) {
            const defaults = {
                title: 'Upload Files',
                allowMultiple: true,
                maxFileSize: 10485760, // 10MB
                acceptedTypes: '*',
                uploadUrl: '/api/files/upload',
                onUploadComplete: null,
                onUploadError: null
            };

            const settings = Object.assign({}, defaults, options);
            
            const bodyHtml = `
                <div class="file-upload-area">
                    <div class="upload-zone border border-dashed rounded p-4 text-center mb-3" 
                         style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
                        <div>
                            <i class="bi bi-cloud-upload display-1 text-muted"></i>
                            <p class="mt-3 mb-2">Drag and drop files here or click to browse</p>
                            <p class="text-muted small">
                                Max size: ${this.formatFileSize(settings.maxFileSize)}
                                ${settings.acceptedTypes !== '*' ? `<br>Accepted types: ${settings.acceptedTypes}` : ''}
                            </p>
                        </div>
                    </div>
                    <input type="file" id="fileInput" class="d-none" 
                           ${settings.allowMultiple ? 'multiple' : ''} 
                           accept="${settings.acceptedTypes}">
                    <div id="fileList" class="file-list"></div>
                    <div id="uploadProgress" class="upload-progress d-none">
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                        </div>
                        <div class="text-center mt-2">
                            <small class="text-muted">Uploading files...</small>
                        </div>
                    </div>
                </div>
            `;

            settings.body = bodyHtml;
            settings.buttons = [
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    dismiss: true
                },
                {
                    text: 'Upload',
                    class: 'btn-primary',
                    onclick: function() {
                        this.uploadFiles();
                    }
                }
            ];

            super(settings);
            
            this.files = [];
            this.setupFileUploadEvents();
        }

        setupFileUploadEvents() {
            const $uploadZone = this.$element.find('.upload-zone');
            const $fileInput = this.$element.find('#fileInput');

            // Click to browse
            $uploadZone.on('click', () => {
                $fileInput.click();
            });

            // Drag and drop
            $uploadZone.on('dragover', (e) => {
                e.preventDefault();
                $uploadZone.addClass('border-primary bg-light');
            });

            $uploadZone.on('dragleave', (e) => {
                e.preventDefault();
                $uploadZone.removeClass('border-primary bg-light');
            });

            $uploadZone.on('drop', (e) => {
                e.preventDefault();
                $uploadZone.removeClass('border-primary bg-light');
                
                const files = Array.from(e.originalEvent.dataTransfer.files);
                this.addFiles(files);
            });

            // File input change
            $fileInput.on('change', (e) => {
                const files = Array.from(e.target.files);
                this.addFiles(files);
            });
        }

        addFiles(files) {
            files.forEach(file => {
                if (this.validateFile(file)) {
                    this.files.push(file);
                }
            });
            
            this.renderFileList();
            this.updateUploadButton();
        }

        validateFile(file) {
            // Size validation
            if (file.size > this.settings.maxFileSize) {
                XOS.Modal.AlertModal.error(`File "${file.name}" is too large. Maximum size is ${this.formatFileSize(this.settings.maxFileSize)}.`);
                return false;
            }

            // Type validation
            if (this.settings.acceptedTypes !== '*') {
                const acceptedTypes = this.settings.acceptedTypes.split(',').map(type => type.trim());
                const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
                const mimeType = file.type;
                
                const isValid = acceptedTypes.some(type => 
                    type === fileExtension || 
                    type === mimeType || 
                    (type.endsWith('/*') && mimeType.startsWith(type.slice(0, -1)))
                );

                if (!isValid) {
                    XOS.Modal.AlertModal.error(`File "${file.name}" has an invalid type.`);
                    return false;
                }
            }

            return true;
        }

        renderFileList() {
            const $fileList = this.$element.find('#fileList');
            
            if (this.files.length === 0) {
                $fileList.empty();
                return;
            }

            let listHtml = '<div class="list-group">';
            this.files.forEach((file, index) => {
                listHtml += `
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${file.name}</strong>
                            <br>
                            <small class="text-muted">${this.formatFileSize(file.size)}</small>
                        </div>
                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="XOS.Modal.currentUploadModal.removeFile(${index})">
                            Remove
                        </button>
                    </div>
                `;
            });
            listHtml += '</div>';

            $fileList.html(listHtml);
            
            // Store reference for remove functionality
            XOS.Modal.currentUploadModal = this;
        }

        removeFile(index) {
            this.files.splice(index, 1);
            this.renderFileList();
            this.updateUploadButton();
        }

        updateUploadButton() {
            const hasFiles = this.files.length > 0;
            if (hasFiles) {
                this.enableButton(1);
            } else {
                this.disableButton(1);
            }
        }

        uploadFiles() {
            if (this.files.length === 0) return;

            const $progress = this.$element.find('#uploadProgress');
            const $progressBar = $progress.find('.progress-bar');
            
            $progress.removeClass('d-none');
            this.disableButton(1);

            const formData = new FormData();
            this.files.forEach(file => {
                formData.append('files[]', file);
            });

            $.ajax({
                url: this.settings.uploadUrl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                xhr: () => {
                    const xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            const percentComplete = (e.loaded / e.total) * 100;
                            $progressBar.css('width', percentComplete + '%');
                        }
                    });
                    return xhr;
                },
                success: (response) => {
                    if (response.success) {
                        if (this.settings.onUploadComplete) {
                            this.settings.onUploadComplete.call(this, response.data);
                        }
                        XOS.Modal.AlertModal.success('Files uploaded successfully!');
                        this.hide();
                    } else {
                        this.handleUploadError(response.message || 'Upload failed');
                    }
                },
                error: (xhr, status, error) => {
                    this.handleUploadError(xhr.responseJSON?.message || 'Upload failed');
                },
                complete: () => {
                    $progress.addClass('d-none');
                    this.enableButton(1);
                }
            });
        }

        handleUploadError(message) {
            if (this.settings.onUploadError) {
                this.settings.onUploadError.call(this, message);
            }
            XOS.Modal.AlertModal.error(message);
        }

        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        static show(options = {}) {
            return new XOS.Modal.FileUploadModal(options).show();
        }
    };

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    // Auto-initialize modal triggers
    $(document).ready(function() {
        // Handle data-modal attributes
        $(document).on('click', '[data-modal]', function(e) {
            e.preventDefault();
            
            const $trigger = $(this);
            const modalType = $trigger.data('modal');
            const options = $trigger.data('modal-options') || {};
            
            switch (modalType) {
                case 'confirm':
                    const message = $trigger.data('message') || 'Are you sure?';
                    const onConfirm = $trigger.data('on-confirm');
                    XOS.Modal.confirm(message, function() {
                        if (onConfirm && window[onConfirm]) {
                            window[onConfirm].call($trigger[0]);
                        }
                    }, options);
                    break;
                    
                case 'ajax':
                    const url = $trigger.attr('href') || $trigger.data('url');
                    const title = $trigger.data('title') || 'Loading...';
                    XOS.Modal.load(url, title, options);
                    break;
                    
                case 'alert':
                    const alertMessage = $trigger.data('message') || 'Alert';
                    const alertType = $trigger.data('type') || 'info';
                    XOS.Modal.alert(alertMessage, 'Alert', alertType);
                    break;
            }
        });

        console.log('XOS Modal patterns initialized');
    });

    // Export to global scope
    window.XOS = XOS;

})(jQuery);