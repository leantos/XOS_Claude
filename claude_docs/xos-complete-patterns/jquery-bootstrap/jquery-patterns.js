// XOS jQuery Patterns Complete Reference
// Comprehensive jQuery patterns for XOS applications with best practices

(function($) {
    'use strict';

    // ============================================================================
    // BASIC JQUERY PATTERNS
    // ============================================================================

    // ✅ CORRECT: Document ready with XOS namespace
    const XOS = window.XOS || {};
    XOS.jQuery = XOS.jQuery || {};

    $(document).ready(function() {
        XOS.jQuery.init();
    });

    // ✅ CORRECT: Event delegation for dynamic content
    XOS.jQuery.EventDelegation = {
        init: function() {
            // Delegate click events for buttons added dynamically
            $(document).on('click', '[data-action]', this.handleAction);
            $(document).on('click', '.btn-delete', this.handleDelete);
            $(document).on('submit', 'form[data-ajax]', this.handleAjaxForm);
            $(document).on('change', 'input[data-validate]', this.handleValidation);
        },

        handleAction: function(e) {
            e.preventDefault();
            const $this = $(this);
            const action = $this.data('action');
            const target = $this.data('target');
            const params = $this.data('params') || {};

            switch (action) {
                case 'load-content':
                    XOS.jQuery.loadContent(target, $this.attr('href'), params);
                    break;
                case 'toggle-visibility':
                    XOS.jQuery.toggleVisibility(target);
                    break;
                case 'confirm-action':
                    XOS.jQuery.confirmAction($this);
                    break;
                default:
                    console.warn('Unknown action:', action);
            }
        },

        handleDelete: function(e) {
            e.preventDefault();
            const $this = $(this);
            const itemName = $this.data('item-name') || 'this item';
            
            XOS.jQuery.confirmDialog({
                title: 'Confirm Delete',
                message: `Are you sure you want to delete ${itemName}?`,
                confirmText: 'Delete',
                confirmClass: 'btn-danger',
                onConfirm: function() {
                    XOS.jQuery.performDelete($this);
                }
            });
        },

        handleAjaxForm: function(e) {
            e.preventDefault();
            const $form = $(this);
            XOS.jQuery.submitAjaxForm($form);
        },

        handleValidation: function(e) {
            const $input = $(this);
            XOS.jQuery.validateField($input);
        }
    };

    // ❌ WRONG: Direct event binding without delegation
    $('.delete-button').click(function() {
        // This won't work for dynamically added buttons
        alert('Delete clicked');
    });

    // ✅ CORRECT: Dynamic content loading
    XOS.jQuery.loadContent = function(target, url, params) {
        const $target = $(target);
        if ($target.length === 0) {
            console.error('Target element not found:', target);
            return;
        }

        // Show loading state
        $target.html('<div class="text-center"><div class="spinner-border" role="status"></div></div>');

        // Build URL with parameters
        const urlWithParams = params && Object.keys(params).length > 0 
            ? url + '?' + $.param(params)
            : url;

        $.ajax({
            url: urlWithParams,
            type: 'GET',
            dataType: 'html',
            success: function(data) {
                $target.html(data);
                // Trigger event for other components to react
                $target.trigger('content-loaded', [data]);
                // Initialize any new components in the loaded content
                XOS.jQuery.initializeComponents($target);
            },
            error: function(xhr, status, error) {
                const errorMessage = xhr.responseJSON?.message || 'Failed to load content';
                $target.html(`<div class="alert alert-danger">${errorMessage}</div>`);
            }
        });
    };

    // ✅ CORRECT: Form handling with validation
    XOS.jQuery.submitAjaxForm = function($form) {
        // Validate form first
        if (!XOS.jQuery.validateForm($form)) {
            return;
        }

        const url = $form.attr('action');
        const method = $form.attr('method') || 'POST';
        const $submitBtn = $form.find('button[type="submit"]');
        const originalText = $submitBtn.text();

        // Disable form and show loading
        $form.find('input, select, textarea, button').prop('disabled', true);
        $submitBtn.text('Please wait...');

        $.ajax({
            url: url,
            type: method,
            data: $form.serialize(),
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    XOS.jQuery.showNotification('Success', response.message || 'Operation completed successfully', 'success');
                    
                    // Trigger custom event
                    $form.trigger('form-success', [response]);
                    
                    // Reset form if specified
                    if ($form.data('reset-on-success')) {
                        $form[0].reset();
                    }
                } else {
                    XOS.jQuery.showNotification('Error', response.message || 'Operation failed', 'error');
                    XOS.jQuery.showValidationErrors($form, response.errors);
                }
            },
            error: function(xhr, status, error) {
                const errorMessage = xhr.responseJSON?.message || 'An error occurred while processing your request';
                XOS.jQuery.showNotification('Error', errorMessage, 'error');
            },
            complete: function() {
                // Re-enable form
                $form.find('input, select, textarea, button').prop('disabled', false);
                $submitBtn.text(originalText);
            }
        });
    };

    // ============================================================================
    // ADVANCED JQUERY PATTERNS
    // ============================================================================

    // ✅ CORRECT: Custom jQuery plugin pattern
    $.fn.xosDataTable = function(options) {
        const defaults = {
            pageSize: 10,
            sortable: true,
            searchable: true,
            pagination: true,
            ajax: {
                url: null,
                method: 'GET'
            },
            columns: [],
            onRowClick: null,
            onDataLoad: null
        };

        return this.each(function() {
            const $table = $(this);
            const settings = $.extend(true, {}, defaults, options);
            
            // Store settings for later use
            $table.data('xos-datatable-settings', settings);
            
            // Initialize table
            initializeTable($table, settings);
        });

        function initializeTable($table, settings) {
            // Create table structure
            const tableHtml = `
                <div class="xos-datatable-wrapper">
                    ${settings.searchable ? '<div class="datatable-search mb-3"><input type="text" class="form-control" placeholder="Search..."></div>' : ''}
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                    ${settings.pagination ? '<div class="datatable-pagination"></div>' : ''}
                </div>
            `;

            $table.html(tableHtml);

            // Build header
            buildTableHeader($table, settings);

            // Setup event handlers
            setupEventHandlers($table, settings);

            // Load initial data
            loadTableData($table, settings);
        }

        function buildTableHeader($table, settings) {
            const $thead = $table.find('thead');
            let headerHtml = '<tr>';

            settings.columns.forEach(column => {
                const sortClass = settings.sortable && column.sortable !== false ? 'sortable' : '';
                headerHtml += `<th class="${sortClass}" data-column="${column.field}">${column.title}</th>`;
            });

            headerHtml += '</tr>';
            $thead.html(headerHtml);
        }

        function setupEventHandlers($table, settings) {
            // Search handler
            if (settings.searchable) {
                $table.find('.datatable-search input').on('input', debounce(function() {
                    loadTableData($table, settings, { search: $(this).val() });
                }, 300));
            }

            // Sort handler
            if (settings.sortable) {
                $table.on('click', 'th.sortable', function() {
                    const column = $(this).data('column');
                    const currentSort = $table.data('current-sort') || {};
                    const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
                    
                    // Update sort indicators
                    $table.find('th').removeClass('sort-asc sort-desc');
                    $(this).addClass(`sort-${direction}`);
                    
                    // Store current sort
                    $table.data('current-sort', { column, direction });
                    
                    // Reload data
                    loadTableData($table, settings, { sortBy: column, sortDirection: direction });
                });
            }

            // Row click handler
            if (settings.onRowClick) {
                $table.on('click', 'tbody tr', function() {
                    const rowData = $(this).data('row-data');
                    settings.onRowClick(rowData, $(this));
                });
            }
        }

        function loadTableData($table, settings, additionalParams = {}) {
            if (!settings.ajax.url) {
                console.error('No AJAX URL provided for data table');
                return;
            }

            const currentSearch = $table.find('.datatable-search input').val();
            const currentSort = $table.data('current-sort') || {};
            const currentPage = $table.data('current-page') || 1;

            const params = {
                page: currentPage,
                pageSize: settings.pageSize,
                search: currentSearch,
                sortBy: currentSort.column,
                sortDirection: currentSort.direction,
                ...additionalParams
            };

            // Show loading state
            $table.find('tbody').html('<tr><td colspan="100%" class="text-center">Loading...</td></tr>');

            $.ajax({
                url: settings.ajax.url,
                type: settings.ajax.method,
                data: params,
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        renderTableData($table, settings, response.data);
                        if (settings.pagination) {
                            renderPagination($table, settings, response.data.pagination);
                        }
                        if (settings.onDataLoad) {
                            settings.onDataLoad(response.data);
                        }
                    } else {
                        $table.find('tbody').html(`<tr><td colspan="100%" class="text-center text-danger">${response.message || 'Failed to load data'}</td></tr>`);
                    }
                },
                error: function(xhr, status, error) {
                    $table.find('tbody').html('<tr><td colspan="100%" class="text-center text-danger">Error loading data</td></tr>');
                }
            });
        }

        function renderTableData($table, settings, data) {
            const $tbody = $table.find('tbody');
            let bodyHtml = '';

            if (data.items && data.items.length > 0) {
                data.items.forEach(row => {
                    bodyHtml += '<tr>';
                    settings.columns.forEach(column => {
                        let cellValue = row[column.field];
                        
                        // Apply column renderer if provided
                        if (column.render && typeof column.render === 'function') {
                            cellValue = column.render(cellValue, row);
                        }
                        
                        bodyHtml += `<td>${cellValue || ''}</td>`;
                    });
                    bodyHtml += '</tr>';
                });
            } else {
                bodyHtml = '<tr><td colspan="100%" class="text-center text-muted">No data available</td></tr>';
            }

            $tbody.html(bodyHtml);

            // Store row data for click handlers
            $tbody.find('tr').each(function(index) {
                if (data.items && data.items[index]) {
                    $(this).data('row-data', data.items[index]);
                }
            });
        }

        function renderPagination($table, settings, pagination) {
            const $pagination = $table.find('.datatable-pagination');
            if (!pagination) return;

            let paginationHtml = '<nav><ul class="pagination justify-content-center">';
            
            // Previous button
            paginationHtml += `
                <li class="page-item ${!pagination.hasPrevious ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${pagination.currentPage - 1}">Previous</a>
                </li>
            `;

            // Page numbers
            const startPage = Math.max(1, pagination.currentPage - 2);
            const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);

            for (let i = startPage; i <= endPage; i++) {
                paginationHtml += `
                    <li class="page-item ${i === pagination.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            }

            // Next button
            paginationHtml += `
                <li class="page-item ${!pagination.hasNext ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${pagination.currentPage + 1}">Next</a>
                </li>
            `;

            paginationHtml += '</ul></nav>';
            $pagination.html(paginationHtml);

            // Pagination click handler
            $pagination.on('click', 'a.page-link', function(e) {
                e.preventDefault();
                const page = parseInt($(this).data('page'));
                if (page && page !== pagination.currentPage) {
                    $table.data('current-page', page);
                    loadTableData($table, settings);
                }
            });
        }

        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // ✅ CORRECT: Form validation plugin
    $.fn.xosValidate = function(options) {
        const defaults = {
            rules: {},
            messages: {},
            onSubmit: null,
            onValid: null,
            onInvalid: null
        };

        return this.each(function() {
            const $form = $(this);
            const settings = $.extend(true, {}, defaults, options);

            // Prevent default form submission
            $form.on('submit', function(e) {
                e.preventDefault();
                
                if (validateForm($form, settings)) {
                    if (settings.onSubmit) {
                        settings.onSubmit($form);
                    }
                }
            });

            // Real-time validation
            $form.on('blur', 'input, select, textarea', function() {
                validateField($(this), settings);
            });
        });

        function validateForm($form, settings) {
            let isValid = true;
            
            $form.find('input, select, textarea').each(function() {
                if (!validateField($(this), settings)) {
                    isValid = false;
                }
            });

            if (isValid && settings.onValid) {
                settings.onValid($form);
            } else if (!isValid && settings.onInvalid) {
                settings.onInvalid($form);
            }

            return isValid;
        }

        function validateField($field, settings) {
            const fieldName = $field.attr('name');
            const fieldValue = $field.val();
            const rules = settings.rules[fieldName] || {};

            // Clear previous errors
            clearFieldError($field);

            // Required validation
            if (rules.required && (!fieldValue || fieldValue.trim() === '')) {
                showFieldError($field, settings.messages[fieldName]?.required || 'This field is required');
                return false;
            }

            // Skip other validations if field is empty and not required
            if (!fieldValue) {
                return true;
            }

            // Email validation
            if (rules.email && !isValidEmail(fieldValue)) {
                showFieldError($field, settings.messages[fieldName]?.email || 'Please enter a valid email address');
                return false;
            }

            // Min length validation
            if (rules.minLength && fieldValue.length < rules.minLength) {
                showFieldError($field, settings.messages[fieldName]?.minLength || `Minimum ${rules.minLength} characters required`);
                return false;
            }

            // Max length validation
            if (rules.maxLength && fieldValue.length > rules.maxLength) {
                showFieldError($field, settings.messages[fieldName]?.maxLength || `Maximum ${rules.maxLength} characters allowed`);
                return false;
            }

            // Pattern validation
            if (rules.pattern && !new RegExp(rules.pattern).test(fieldValue)) {
                showFieldError($field, settings.messages[fieldName]?.pattern || 'Invalid format');
                return false;
            }

            // Custom validation
            if (rules.custom && typeof rules.custom === 'function') {
                const customResult = rules.custom(fieldValue, $field);
                if (customResult !== true) {
                    showFieldError($field, customResult || 'Invalid value');
                    return false;
                }
            }

            return true;
        }

        function showFieldError($field, message) {
            $field.addClass('is-invalid');
            
            // Remove existing error message
            $field.siblings('.invalid-feedback').remove();
            
            // Add error message
            $field.after(`<div class="invalid-feedback">${message}</div>`);
        }

        function clearFieldError($field) {
            $field.removeClass('is-invalid');
            $field.siblings('.invalid-feedback').remove();
        }

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
    };

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    // ✅ CORRECT: Notification system
    XOS.jQuery.showNotification = function(title, message, type = 'info', duration = 5000) {
        const typeClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';

        const notificationHtml = `
            <div class="alert ${typeClass} alert-dismissible fade show notification-toast" role="alert">
                <strong>${title}</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Create or get notification container
        let $container = $('#notification-container');
        if ($container.length === 0) {
            $container = $('<div id="notification-container" class="position-fixed top-0 end-0 p-3" style="z-index: 1080;"></div>');
            $('body').append($container);
        }

        const $notification = $(notificationHtml);
        $container.append($notification);

        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                $notification.alert('close');
            }, duration);
        }

        return $notification;
    };

    // ✅ CORRECT: Confirmation dialog
    XOS.jQuery.confirmDialog = function(options) {
        const defaults = {
            title: 'Confirm',
            message: 'Are you sure?',
            confirmText: 'Yes',
            cancelText: 'Cancel',
            confirmClass: 'btn-primary',
            cancelClass: 'btn-secondary',
            onConfirm: null,
            onCancel: null
        };

        const settings = $.extend({}, defaults, options);

        const modalHtml = `
            <div class="modal fade" tabindex="-1" id="confirmModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${settings.title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${settings.message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn ${settings.cancelClass}" data-bs-dismiss="modal">${settings.cancelText}</button>
                            <button type="button" class="btn ${settings.confirmClass}" id="confirmButton">${settings.confirmText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        $('#confirmModal').remove();

        // Add modal to body
        $('body').append(modalHtml);

        const $modal = $('#confirmModal');
        
        // Handle confirm button
        $modal.find('#confirmButton').on('click', function() {
            if (settings.onConfirm) {
                settings.onConfirm();
            }
            $modal.modal('hide');
        });

        // Handle cancel
        $modal.on('hidden.bs.modal', function() {
            if (settings.onCancel) {
                settings.onCancel();
            }
            $(this).remove();
        });

        // Show modal
        $modal.modal('show');

        return $modal;
    };

    // ✅ CORRECT: Loading overlay
    XOS.jQuery.showLoading = function(target = 'body', message = 'Loading...') {
        const $target = $(target);
        const loadingHtml = `
            <div class="loading-overlay position-absolute w-100 h-100 d-flex align-items-center justify-content-center" 
                 style="background: rgba(255,255,255,0.8); z-index: 1000; top: 0; left: 0;">
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status"></div>
                    <div class="mt-2">${message}</div>
                </div>
            </div>
        `;

        // Ensure target has relative positioning
        if ($target.css('position') === 'static') {
            $target.css('position', 'relative');
        }

        // Remove existing loading overlay
        $target.find('.loading-overlay').remove();

        // Add loading overlay
        $target.append(loadingHtml);
    };

    XOS.jQuery.hideLoading = function(target = 'body') {
        $(target).find('.loading-overlay').remove();
    };

    // ✅ CORRECT: Form validation helper
    XOS.jQuery.validateForm = function($form) {
        let isValid = true;

        // Clear previous errors
        $form.find('.is-invalid').removeClass('is-invalid');
        $form.find('.invalid-feedback').remove();

        // Validate required fields
        $form.find('[required]').each(function() {
            const $field = $(this);
            if (!$field.val() || $field.val().trim() === '') {
                XOS.jQuery.showFieldError($field, 'This field is required');
                isValid = false;
            }
        });

        // Validate email fields
        $form.find('input[type="email"]').each(function() {
            const $field = $(this);
            const email = $field.val();
            if (email && !XOS.jQuery.isValidEmail(email)) {
                XOS.jQuery.showFieldError($field, 'Please enter a valid email address');
                isValid = false;
            }
        });

        return isValid;
    };

    XOS.jQuery.showFieldError = function($field, message) {
        $field.addClass('is-invalid');
        $field.after(`<div class="invalid-feedback">${message}</div>`);
    };

    XOS.jQuery.showValidationErrors = function($form, errors) {
        if (!errors) return;

        Object.keys(errors).forEach(fieldName => {
            const $field = $form.find(`[name="${fieldName}"]`);
            if ($field.length && errors[fieldName].length > 0) {
                XOS.jQuery.showFieldError($field, errors[fieldName][0]);
            }
        });
    };

    XOS.jQuery.isValidEmail = function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // ✅ CORRECT: AJAX helpers
    XOS.jQuery.ajaxGet = function(url, params = {}) {
        return $.ajax({
            url: url,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
    };

    XOS.jQuery.ajaxPost = function(url, data = {}) {
        return $.ajax({
            url: url,
            type: 'POST',
            data: data,
            dataType: 'json'
        });
    };

    XOS.jQuery.ajaxDelete = function(url) {
        return $.ajax({
            url: url,
            type: 'DELETE',
            dataType: 'json'
        });
    };

    // ============================================================================
    // COMPONENT INITIALIZATION
    // ============================================================================

    // ✅ CORRECT: Component initialization system
    XOS.jQuery.initializeComponents = function($container) {
        $container = $container || $(document);

        // Initialize tooltips
        $container.find('[data-bs-toggle="tooltip"]').tooltip();

        // Initialize popovers
        $container.find('[data-bs-toggle="popover"]').popover();

        // Initialize custom components
        $container.find('[data-component="datatable"]').each(function() {
            const $table = $(this);
            const options = $table.data('options') || {};
            $table.xosDataTable(options);
        });

        $container.find('form[data-validate]').each(function() {
            const $form = $(this);
            const options = $form.data('validate-options') || {};
            $form.xosValidate(options);
        });

        // Initialize file upload components
        $container.find('[data-component="file-upload"]').each(function() {
            XOS.jQuery.initFileUpload($(this));
        });

        // Initialize date pickers
        $container.find('[data-component="datepicker"]').each(function() {
            XOS.jQuery.initDatePicker($(this));
        });
    };

    // ✅ CORRECT: File upload initialization
    XOS.jQuery.initFileUpload = function($element) {
        const options = $element.data('options') || {};
        
        $element.on('change', function() {
            const files = this.files;
            if (files.length > 0) {
                XOS.jQuery.handleFileUpload($element, files[0], options);
            }
        });
    };

    XOS.jQuery.handleFileUpload = function($element, file, options) {
        const maxSize = options.maxSize || 10485760; // 10MB default
        const allowedTypes = options.allowedTypes || [];

        // Validate file size
        if (file.size > maxSize) {
            XOS.jQuery.showNotification('Error', 'File size too large', 'error');
            return;
        }

        // Validate file type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            XOS.jQuery.showNotification('Error', 'Invalid file type', 'error');
            return;
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        // Show loading
        XOS.jQuery.showLoading($element.closest('.form-group'));

        // Upload file
        $.ajax({
            url: options.uploadUrl || '/api/files/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = new XMLHttpRequest();
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        console.log('Upload progress:', percentComplete);
                    }
                });
                return xhr;
            },
            success: function(response) {
                if (response.success) {
                    XOS.jQuery.showNotification('Success', 'File uploaded successfully', 'success');
                    $element.trigger('file-uploaded', [response.data]);
                } else {
                    XOS.jQuery.showNotification('Error', response.message || 'Upload failed', 'error');
                }
            },
            error: function() {
                XOS.jQuery.showNotification('Error', 'Upload failed', 'error');
            },
            complete: function() {
                XOS.jQuery.hideLoading($element.closest('.form-group'));
            }
        });
    };

    // ✅ CORRECT: Date picker initialization
    XOS.jQuery.initDatePicker = function($element) {
        // Example using a popular date picker library
        if (typeof flatpickr !== 'undefined') {
            const options = $element.data('options') || {};
            $element.flatpickr(options);
        }
    };

    // ============================================================================
    // MAIN INITIALIZATION
    // ============================================================================

    XOS.jQuery.init = function() {
        // Initialize event delegation
        XOS.jQuery.EventDelegation.init();

        // Initialize all components on page load
        XOS.jQuery.initializeComponents();

        // Setup global AJAX settings
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                // Add CSRF token if available
                const token = $('meta[name="csrf-token"]').attr('content');
                if (token) {
                    xhr.setRequestHeader('X-CSRF-TOKEN', token);
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                if (xhr.status === 401) {
                    XOS.jQuery.showNotification('Error', 'Session expired. Please log in again.', 'error');
                    // Redirect to login or refresh page
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            }
        });

        console.log('XOS jQuery patterns initialized');
    };

    // ✅ CORRECT: Utility functions
    XOS.jQuery.toggleVisibility = function(target) {
        $(target).toggleClass('d-none');
    };

    XOS.jQuery.confirmAction = function($element) {
        const message = $element.data('confirm-message') || 'Are you sure?';
        const url = $element.attr('href') || $element.data('url');
        
        XOS.jQuery.confirmDialog({
            message: message,
            onConfirm: function() {
                if (url) {
                    window.location.href = url;
                }
            }
        });
    };

    XOS.jQuery.performDelete = function($element) {
        const url = $element.attr('href') || $element.data('url');
        if (!url) return;

        XOS.jQuery.ajaxDelete(url)
            .done(function(response) {
                if (response.success) {
                    XOS.jQuery.showNotification('Success', 'Item deleted successfully', 'success');
                    
                    // Remove row or reload table
                    const $row = $element.closest('tr');
                    if ($row.length) {
                        $row.fadeOut(300, function() {
                            $(this).remove();
                        });
                    } else {
                        // Trigger refresh event
                        $(document).trigger('item-deleted');
                    }
                } else {
                    XOS.jQuery.showNotification('Error', response.message || 'Delete failed', 'error');
                }
            })
            .fail(function() {
                XOS.jQuery.showNotification('Error', 'Delete failed', 'error');
            });
    };

    // Export to global scope
    window.XOS = XOS;

})(jQuery);