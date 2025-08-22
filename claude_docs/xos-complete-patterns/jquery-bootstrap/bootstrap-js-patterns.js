// XOS Bootstrap JavaScript Patterns Complete Reference
// Comprehensive Bootstrap JS component patterns for XOS applications

(function($) {
    'use strict';

    // Extend XOS namespace for Bootstrap patterns
    const XOS = window.XOS || {};
    XOS.Bootstrap = XOS.Bootstrap || {};

    // ============================================================================
    // MODAL PATTERNS
    // ============================================================================

    // ✅ CORRECT: Dynamic modal creation and management
    XOS.Bootstrap.Modal = {
        // Create and show a modal dynamically
        create: function(options) {
            const defaults = {
                id: 'dynamicModal',
                title: 'Modal Title',
                body: 'Modal content',
                size: '', // 'modal-sm', 'modal-lg', 'modal-xl'
                backdrop: true,
                keyboard: true,
                showCloseButton: true,
                buttons: [
                    {
                        text: 'Close',
                        class: 'btn-secondary',
                        dismiss: true
                    }
                ],
                onShow: null,
                onHide: null,
                onShown: null,
                onHidden: null
            };

            const settings = $.extend(true, {}, defaults, options);

            // Remove existing modal with same ID
            $(`#${settings.id}`).remove();

            // Build modal HTML
            const modalHtml = this.buildModalHtml(settings);
            
            // Add to DOM
            $('body').append(modalHtml);
            
            const $modal = $(`#${settings.id}`);
            
            // Setup event handlers
            this.setupModalEvents($modal, settings);
            
            // Show modal
            $modal.modal('show');
            
            return $modal;
        },

        buildModalHtml: function(settings) {
            const closeButton = settings.showCloseButton 
                ? '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'
                : '';

            let buttonsHtml = '';
            if (settings.buttons && settings.buttons.length > 0) {
                buttonsHtml = '<div class="modal-footer">';
                settings.buttons.forEach(button => {
                    const dismissAttr = button.dismiss ? 'data-bs-dismiss="modal"' : '';
                    const onclick = button.onclick ? `onclick="${button.onclick}"` : '';
                    buttonsHtml += `<button type="button" class="btn ${button.class}" ${dismissAttr} ${onclick}>${button.text}</button>`;
                });
                buttonsHtml += '</div>';
            }

            return `
                <div class="modal fade" id="${settings.id}" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog ${settings.size}">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">${settings.title}</h5>
                                ${closeButton}
                            </div>
                            <div class="modal-body">
                                ${settings.body}
                            </div>
                            ${buttonsHtml}
                        </div>
                    </div>
                </div>
            `;
        },

        setupModalEvents: function($modal, settings) {
            if (settings.onShow) {
                $modal.on('show.bs.modal', settings.onShow);
            }
            if (settings.onShown) {
                $modal.on('shown.bs.modal', settings.onShown);
            }
            if (settings.onHide) {
                $modal.on('hide.bs.modal', settings.onHide);
            }
            if (settings.onHidden) {
                $modal.on('hidden.bs.modal', settings.onHidden);
            }

            // Auto-remove modal from DOM when hidden
            $modal.on('hidden.bs.modal', function() {
                $(this).remove();
            });
        },

        // Show confirmation modal
        confirm: function(options) {
            const defaults = {
                title: 'Confirm Action',
                message: 'Are you sure you want to continue?',
                confirmText: 'Confirm',
                cancelText: 'Cancel',
                confirmClass: 'btn-primary',
                cancelClass: 'btn-secondary',
                onConfirm: null,
                onCancel: null
            };

            const settings = $.extend({}, defaults, options);

            return this.create({
                id: 'confirmModal',
                title: settings.title,
                body: `<p>${settings.message}</p>`,
                buttons: [
                    {
                        text: settings.cancelText,
                        class: settings.cancelClass,
                        dismiss: true,
                        onclick: settings.onCancel ? 'XOS.Bootstrap.Modal.handleCancel()' : null
                    },
                    {
                        text: settings.confirmText,
                        class: settings.confirmClass,
                        onclick: 'XOS.Bootstrap.Modal.handleConfirm()'
                    }
                ],
                onHidden: function() {
                    // Clean up stored callbacks
                    delete XOS.Bootstrap.Modal._currentConfirmCallback;
                    delete XOS.Bootstrap.Modal._currentCancelCallback;
                }
            });
        },

        handleConfirm: function() {
            if (this._currentConfirmCallback) {
                this._currentConfirmCallback();
            }
            $('#confirmModal').modal('hide');
        },

        handleCancel: function() {
            if (this._currentCancelCallback) {
                this._currentCancelCallback();
            }
        },

        // Load content into modal via AJAX
        loadContent: function(options) {
            const defaults = {
                url: null,
                method: 'GET',
                data: {},
                title: 'Loading...',
                size: 'modal-lg',
                onContentLoaded: null
            };

            const settings = $.extend({}, defaults, options);

            const $modal = this.create({
                id: 'ajaxModal',
                title: settings.title,
                body: '<div class="text-center"><div class="spinner-border" role="status"></div><p class="mt-2">Loading...</p></div>',
                size: settings.size,
                buttons: [
                    {
                        text: 'Close',
                        class: 'btn-secondary',
                        dismiss: true
                    }
                ]
            });

            // Load content
            $.ajax({
                url: settings.url,
                method: settings.method,
                data: settings.data,
                success: function(data) {
                    $modal.find('.modal-body').html(data);
                    
                    // Initialize any new components in the loaded content
                    XOS.Bootstrap.initializeComponents($modal.find('.modal-body'));
                    
                    if (settings.onContentLoaded) {
                        settings.onContentLoaded($modal, data);
                    }
                },
                error: function(xhr, status, error) {
                    const errorMessage = xhr.responseJSON?.message || 'Failed to load content';
                    $modal.find('.modal-body').html(`<div class="alert alert-danger">${errorMessage}</div>`);
                }
            });

            return $modal;
        }
    };

    // ❌ WRONG: Inline modal creation without proper cleanup
    function showBadModal() {
        // This creates multiple modals without cleanup
        $('body').append(`
            <div class="modal" id="badModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-body">Content</div>
                    </div>
                </div>
            </div>
        `);
        $('#badModal').modal('show');
    }

    // ============================================================================
    // TOOLTIP AND POPOVER PATTERNS
    // ============================================================================

    // ✅ CORRECT: Advanced tooltip management
    XOS.Bootstrap.Tooltip = {
        init: function() {
            // Initialize all tooltips with default options
            this.initializeTooltips();
            
            // Setup dynamic tooltip handling
            this.setupDynamicTooltips();
        },

        initializeTooltips: function($container) {
            $container = $container || $(document);
            
            // Dispose existing tooltips first
            $container.find('[data-bs-toggle="tooltip"]').tooltip('dispose');
            
            // Initialize tooltips with custom options
            $container.find('[data-bs-toggle="tooltip"]').tooltip({
                container: 'body',
                html: true,
                trigger: 'hover focus',
                delay: { show: 500, hide: 100 }
            });
        },

        setupDynamicTooltips: function() {
            // Handle tooltips for dynamically added content
            $(document).on('mouseenter', '[data-bs-toggle="tooltip"]:not(.tooltip-initialized)', function() {
                const $this = $(this);
                $this.addClass('tooltip-initialized').tooltip({
                    container: 'body',
                    html: true,
                    trigger: 'hover focus'
                }).tooltip('show');
            });
        },

        create: function(element, options) {
            const $element = $(element);
            const defaults = {
                title: '',
                placement: 'top',
                trigger: 'hover focus',
                container: 'body',
                html: false
            };

            const settings = $.extend({}, defaults, options);
            
            // Dispose existing tooltip
            $element.tooltip('dispose');
            
            // Create new tooltip
            $element.tooltip(settings);
            
            return $element;
        },

        updateContent: function(element, newTitle) {
            const $element = $(element);
            const tooltip = bootstrap.Tooltip.getInstance($element[0]);
            
            if (tooltip) {
                tooltip.setContent({ '.tooltip-inner': newTitle });
            }
        },

        destroy: function(element) {
            $(element).tooltip('dispose');
        }
    };

    // ✅ CORRECT: Advanced popover management
    XOS.Bootstrap.Popover = {
        init: function() {
            this.initializePopovers();
            this.setupDynamicPopovers();
        },

        initializePopovers: function($container) {
            $container = $container || $(document);
            
            // Dispose existing popovers
            $container.find('[data-bs-toggle="popover"]').popover('dispose');
            
            // Initialize popovers
            $container.find('[data-bs-toggle="popover"]').popover({
                container: 'body',
                html: true,
                trigger: 'click',
                sanitize: false
            });
        },

        setupDynamicPopovers: function() {
            // Close popovers when clicking outside
            $(document).on('click', function(e) {
                $('[data-bs-toggle="popover"]').each(function() {
                    const $this = $(this);
                    if (!$this.is(e.target) && $this.has(e.target).length === 0 && 
                        $('.popover').has(e.target).length === 0) {
                        $this.popover('hide');
                    }
                });
            });
        },

        create: function(element, options) {
            const $element = $(element);
            const defaults = {
                title: '',
                content: '',
                placement: 'right',
                trigger: 'click',
                html: true,
                container: 'body'
            };

            const settings = $.extend({}, defaults, options);
            
            $element.popover('dispose');
            $element.popover(settings);
            
            return $element;
        },

        loadContent: function(element, url, options) {
            const $element = $(element);
            const defaults = {
                title: 'Loading...',
                placement: 'right',
                trigger: 'click'
            };

            const settings = $.extend({}, defaults, options);

            // Create popover with loading content
            this.create(element, {
                ...settings,
                content: '<div class="text-center"><div class="spinner-border spinner-border-sm" role="status"></div></div>'
            });

            // Show popover
            $element.popover('show');

            // Load content via AJAX
            $.ajax({
                url: url,
                method: 'GET',
                success: function(data) {
                    // Update popover content
                    const popover = bootstrap.Popover.getInstance($element[0]);
                    if (popover) {
                        popover.setContent({
                            '.popover-header': settings.title,
                            '.popover-body': data
                        });
                    }
                },
                error: function() {
                    const popover = bootstrap.Popover.getInstance($element[0]);
                    if (popover) {
                        popover.setContent({
                            '.popover-body': '<div class="text-danger">Failed to load content</div>'
                        });
                    }
                }
            });
        }
    };

    // ============================================================================
    // DROPDOWN PATTERNS
    // ============================================================================

    // ✅ CORRECT: Enhanced dropdown functionality
    XOS.Bootstrap.Dropdown = {
        init: function() {
            this.setupDropdownEvents();
            this.initializeSearchableDropdowns();
        },

        setupDropdownEvents: function() {
            // Handle dropdown item clicks
            $(document).on('click', '.dropdown-item[data-action]', function(e) {
                e.preventDefault();
                const action = $(this).data('action');
                const params = $(this).data('params') || {};
                
                XOS.Bootstrap.Dropdown.handleAction(action, params, $(this));
            });

            // Keep dropdown open when clicking on certain elements
            $(document).on('click', '.dropdown-menu .dropdown-keep-open', function(e) {
                e.stopPropagation();
            });
        },

        initializeSearchableDropdowns: function() {
            $('.dropdown-searchable').each(function() {
                const $dropdown = $(this);
                const $menu = $dropdown.find('.dropdown-menu');
                
                // Add search input if not exists
                if ($menu.find('.dropdown-search').length === 0) {
                    const searchHtml = `
                        <div class="dropdown-search p-2 border-bottom">
                            <input type="text" class="form-control form-control-sm" placeholder="Search..." autocomplete="off">
                        </div>
                    `;
                    $menu.prepend(searchHtml);
                }

                // Setup search functionality
                $menu.find('.dropdown-search input').on('input', function() {
                    const searchTerm = $(this).val().toLowerCase();
                    $menu.find('.dropdown-item').each(function() {
                        const $item = $(this);
                        const text = $item.text().toLowerCase();
                        $item.toggle(text.includes(searchTerm));
                    });
                });
            });
        },

        handleAction: function(action, params, $element) {
            switch (action) {
                case 'select-item':
                    this.selectItem($element, params);
                    break;
                case 'toggle-status':
                    this.toggleStatus($element, params);
                    break;
                case 'delete-item':
                    this.deleteItem($element, params);
                    break;
                default:
                    console.warn('Unknown dropdown action:', action);
            }
        },

        selectItem: function($element, params) {
            const $dropdown = $element.closest('.dropdown');
            const $toggle = $dropdown.find('.dropdown-toggle');
            
            // Update dropdown text
            $toggle.text($element.text());
            
            // Store selected value
            $dropdown.data('selected-value', params.value);
            
            // Trigger custom event
            $dropdown.trigger('item-selected', [params.value, $element.text()]);
        },

        toggleStatus: function($element, params) {
            const url = params.url;
            const currentStatus = params.currentStatus;
            
            if (!url) return;

            $.ajax({
                url: url,
                method: 'POST',
                data: { status: !currentStatus },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        // Update UI
                        const newStatus = !currentStatus;
                        $element.data('params', { ...params, currentStatus: newStatus });
                        $element.find('.status-text').text(newStatus ? 'Active' : 'Inactive');
                        
                        XOS.jQuery.showNotification('Success', 'Status updated successfully', 'success');
                    } else {
                        XOS.jQuery.showNotification('Error', response.message || 'Failed to update status', 'error');
                    }
                },
                error: function() {
                    XOS.jQuery.showNotification('Error', 'Failed to update status', 'error');
                }
            });
        },

        deleteItem: function($element, params) {
            const itemName = params.name || 'this item';
            
            XOS.Bootstrap.Modal.confirm({
                title: 'Confirm Delete',
                message: `Are you sure you want to delete ${itemName}?`,
                confirmText: 'Delete',
                confirmClass: 'btn-danger',
                onConfirm: function() {
                    // Perform delete action
                    if (params.url) {
                        $.ajax({
                            url: params.url,
                            method: 'DELETE',
                            dataType: 'json',
                            success: function(response) {
                                if (response.success) {
                                    XOS.jQuery.showNotification('Success', 'Item deleted successfully', 'success');
                                    $element.trigger('item-deleted', [params]);
                                } else {
                                    XOS.jQuery.showNotification('Error', response.message || 'Delete failed', 'error');
                                }
                            },
                            error: function() {
                                XOS.jQuery.showNotification('Error', 'Delete failed', 'error');
                            }
                        });
                    }
                }
            });
        }
    };

    // ============================================================================
    // TOAST PATTERNS
    // ============================================================================

    // ✅ CORRECT: Toast notification system
    XOS.Bootstrap.Toast = {
        init: function() {
            // Create toast container if it doesn't exist
            if ($('.toast-container').length === 0) {
                $('body').append(`
                    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1080;">
                    </div>
                `);
            }
        },

        show: function(options) {
            const defaults = {
                title: '',
                message: '',
                type: 'info', // success, error, warning, info
                delay: 5000,
                autohide: true,
                showIcon: true,
                showCloseButton: true
            };

            const settings = $.extend({}, defaults, options);
            const toastId = 'toast_' + Date.now();
            
            // Map type to Bootstrap classes and icons
            const typeConfig = {
                success: { class: 'text-bg-success', icon: '✓' },
                error: { class: 'text-bg-danger', icon: '✗' },
                warning: { class: 'text-bg-warning', icon: '⚠' },
                info: { class: 'text-bg-info', icon: 'ℹ' }
            };

            const config = typeConfig[settings.type] || typeConfig.info;
            const icon = settings.showIcon ? `<span class="me-2">${config.icon}</span>` : '';
            const closeButton = settings.showCloseButton 
                ? '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>'
                : '';

            const toastHtml = `
                <div id="${toastId}" class="toast ${config.class}" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="d-flex">
                        <div class="toast-body">
                            ${icon}${settings.title ? `<strong>${settings.title}</strong><br>` : ''}${settings.message}
                        </div>
                        ${closeButton}
                    </div>
                </div>
            `;

            const $toast = $(toastHtml);
            $('.toast-container').append($toast);

            // Initialize and show toast
            const toast = new bootstrap.Toast($toast[0], {
                delay: settings.delay,
                autohide: settings.autohide
            });

            toast.show();

            // Remove from DOM when hidden
            $toast.on('hidden.bs.toast', function() {
                $(this).remove();
            });

            return $toast;
        },

        success: function(message, title = 'Success') {
            return this.show({
                type: 'success',
                title: title,
                message: message
            });
        },

        error: function(message, title = 'Error') {
            return this.show({
                type: 'error',
                title: title,
                message: message,
                delay: 8000 // Show errors longer
            });
        },

        warning: function(message, title = 'Warning') {
            return this.show({
                type: 'warning',
                title: title,
                message: message
            });
        },

        info: function(message, title = 'Info') {
            return this.show({
                type: 'info',
                title: title,
                message: message
            });
        },

        hideAll: function() {
            $('.toast-container .toast').each(function() {
                const toast = bootstrap.Toast.getInstance(this);
                if (toast) {
                    toast.hide();
                }
            });
        }
    };

    // ============================================================================
    // OFFCANVAS PATTERNS
    // ============================================================================

    // ✅ CORRECT: Offcanvas management
    XOS.Bootstrap.Offcanvas = {
        create: function(options) {
            const defaults = {
                id: 'dynamicOffcanvas',
                title: 'Offcanvas',
                body: 'Content',
                placement: 'end', // start, end, top, bottom
                backdrop: true,
                keyboard: true,
                scroll: false,
                showCloseButton: true,
                onShow: null,
                onHide: null
            };

            const settings = $.extend({}, defaults, options);

            // Remove existing offcanvas with same ID
            $(`#${settings.id}`).remove();

            const closeButton = settings.showCloseButton 
                ? '<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>'
                : '';

            const offcanvasHtml = `
                <div class="offcanvas offcanvas-${settings.placement}" tabindex="-1" id="${settings.id}">
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title">${settings.title}</h5>
                        ${closeButton}
                    </div>
                    <div class="offcanvas-body">
                        ${settings.body}
                    </div>
                </div>
            `;

            $('body').append(offcanvasHtml);
            
            const $offcanvas = $(`#${settings.id}`);
            
            // Setup events
            if (settings.onShow) {
                $offcanvas.on('show.bs.offcanvas', settings.onShow);
            }
            if (settings.onHide) {
                $offcanvas.on('hide.bs.offcanvas', settings.onHide);
            }

            // Auto-remove when hidden
            $offcanvas.on('hidden.bs.offcanvas', function() {
                $(this).remove();
            });

            // Show offcanvas
            const offcanvas = new bootstrap.Offcanvas($offcanvas[0], {
                backdrop: settings.backdrop,
                keyboard: settings.keyboard,
                scroll: settings.scroll
            });

            offcanvas.show();

            return $offcanvas;
        },

        loadContent: function(options) {
            const defaults = {
                url: null,
                method: 'GET',
                data: {},
                title: 'Loading...'
            };

            const settings = $.extend({}, defaults, options);

            const $offcanvas = this.create({
                ...settings,
                body: '<div class="text-center"><div class="spinner-border" role="status"></div><p class="mt-2">Loading...</p></div>'
            });

            // Load content
            $.ajax({
                url: settings.url,
                method: settings.method,
                data: settings.data,
                success: function(data) {
                    $offcanvas.find('.offcanvas-body').html(data);
                    XOS.Bootstrap.initializeComponents($offcanvas.find('.offcanvas-body'));
                },
                error: function(xhr, status, error) {
                    const errorMessage = xhr.responseJSON?.message || 'Failed to load content';
                    $offcanvas.find('.offcanvas-body').html(`<div class="alert alert-danger">${errorMessage}</div>`);
                }
            });

            return $offcanvas;
        }
    };

    // ============================================================================
    // ACCORDION PATTERNS
    // ============================================================================

    // ✅ CORRECT: Dynamic accordion management
    XOS.Bootstrap.Accordion = {
        create: function(containerId, items, options) {
            const defaults = {
                allowMultiple: false,
                showIcons: true,
                flush: false
            };

            const settings = $.extend({}, defaults, options);
            const accordionClass = settings.flush ? 'accordion-flush' : '';
            const dataParent = settings.allowMultiple ? '' : `data-bs-parent="#${containerId}"`;

            let accordionHtml = `<div id="${containerId}" class="accordion ${accordionClass}">`;

            items.forEach((item, index) => {
                const collapseId = `${containerId}_collapse_${index}`;
                const headingId = `${containerId}_heading_${index}`;
                const expanded = item.expanded ? 'true' : 'false';
                const show = item.expanded ? 'show' : '';
                const collapsed = item.expanded ? '' : 'collapsed';

                accordionHtml += `
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="${headingId}">
                            <button class="accordion-button ${collapsed}" type="button" 
                                    data-bs-toggle="collapse" data-bs-target="#${collapseId}" 
                                    aria-expanded="${expanded}" aria-controls="${collapseId}">
                                ${item.title}
                            </button>
                        </h2>
                        <div id="${collapseId}" class="accordion-collapse collapse ${show}" 
                             aria-labelledby="${headingId}" ${dataParent}>
                            <div class="accordion-body">
                                ${item.content}
                            </div>
                        </div>
                    </div>
                `;
            });

            accordionHtml += '</div>';

            return accordionHtml;
        },

        addItem: function(accordionId, item) {
            const $accordion = $(`#${accordionId}`);
            const itemCount = $accordion.find('.accordion-item').length;
            const collapseId = `${accordionId}_collapse_${itemCount}`;
            const headingId = `${accordionId}_heading_${itemCount}`;

            const itemHtml = `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="${headingId}">
                        <button class="accordion-button collapsed" type="button" 
                                data-bs-toggle="collapse" data-bs-target="#${collapseId}" 
                                aria-expanded="false" aria-controls="${collapseId}">
                            ${item.title}
                        </button>
                    </h2>
                    <div id="${collapseId}" class="accordion-collapse collapse" 
                         aria-labelledby="${headingId}" data-bs-parent="#${accordionId}">
                        <div class="accordion-body">
                            ${item.content}
                        </div>
                    </div>
                </div>
            `;

            $accordion.append(itemHtml);
            
            // Initialize any new components
            XOS.Bootstrap.initializeComponents($accordion.find('.accordion-item').last());
        },

        removeItem: function(accordionId, itemIndex) {
            $(`#${accordionId}`).find('.accordion-item').eq(itemIndex).remove();
        },

        expandAll: function(accordionId) {
            $(`#${accordionId} .accordion-collapse`).addClass('show');
            $(`#${accordionId} .accordion-button`).removeClass('collapsed').attr('aria-expanded', 'true');
        },

        collapseAll: function(accordionId) {
            $(`#${accordionId} .accordion-collapse`).removeClass('show');
            $(`#${accordionId} .accordion-button`).addClass('collapsed').attr('aria-expanded', 'false');
        }
    };

    // ============================================================================
    // CAROUSEL PATTERNS
    // ============================================================================

    // ✅ CORRECT: Advanced carousel functionality
    XOS.Bootstrap.Carousel = {
        create: function(containerId, slides, options) {
            const defaults = {
                showControls: true,
                showIndicators: true,
                autoPlay: true,
                interval: 5000,
                pause: 'hover',
                wrap: true,
                keyboard: true,
                touch: true
            };

            const settings = $.extend({}, defaults, options);

            // Build indicators
            let indicatorsHtml = '';
            if (settings.showIndicators) {
                indicatorsHtml = '<div class="carousel-indicators">';
                slides.forEach((slide, index) => {
                    const active = index === 0 ? 'active' : '';
                    const ariaCurrent = index === 0 ? 'aria-current="true"' : '';
                    indicatorsHtml += `
                        <button type="button" data-bs-target="#${containerId}" 
                                data-bs-slide-to="${index}" class="${active}" 
                                ${ariaCurrent} aria-label="Slide ${index + 1}"></button>
                    `;
                });
                indicatorsHtml += '</div>';
            }

            // Build slides
            let slidesHtml = '<div class="carousel-inner">';
            slides.forEach((slide, index) => {
                const active = index === 0 ? 'active' : '';
                slidesHtml += `
                    <div class="carousel-item ${active}">
                        ${slide.image ? `<img src="${slide.image}" class="d-block w-100" alt="${slide.alt || ''}">` : ''}
                        ${slide.caption ? `
                            <div class="carousel-caption d-none d-md-block">
                                ${slide.caption.title ? `<h5>${slide.caption.title}</h5>` : ''}
                                ${slide.caption.text ? `<p>${slide.caption.text}</p>` : ''}
                            </div>
                        ` : ''}
                        ${slide.content ? slide.content : ''}
                    </div>
                `;
            });
            slidesHtml += '</div>';

            // Build controls
            let controlsHtml = '';
            if (settings.showControls) {
                controlsHtml = `
                    <button class="carousel-control-prev" type="button" data-bs-target="#${containerId}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#${containerId}" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                `;
            }

            const carouselHtml = `
                <div id="${containerId}" class="carousel slide" data-bs-ride="${settings.autoPlay ? 'carousel' : 'false'}">
                    ${indicatorsHtml}
                    ${slidesHtml}
                    ${controlsHtml}
                </div>
            `;

            return carouselHtml;
        },

        addSlide: function(carouselId, slide) {
            const $carousel = $(`#${carouselId}`);
            const $inner = $carousel.find('.carousel-inner');
            const slideCount = $inner.find('.carousel-item').length;

            const slideHtml = `
                <div class="carousel-item">
                    ${slide.image ? `<img src="${slide.image}" class="d-block w-100" alt="${slide.alt || ''}">` : ''}
                    ${slide.caption ? `
                        <div class="carousel-caption d-none d-md-block">
                            ${slide.caption.title ? `<h5>${slide.caption.title}</h5>` : ''}
                            ${slide.caption.text ? `<p>${slide.caption.text}</p>` : ''}
                        </div>
                    ` : ''}
                    ${slide.content ? slide.content : ''}
                </div>
            `;

            $inner.append(slideHtml);

            // Update indicators if they exist
            const $indicators = $carousel.find('.carousel-indicators');
            if ($indicators.length > 0) {
                const indicatorHtml = `
                    <button type="button" data-bs-target="#${carouselId}" 
                            data-bs-slide-to="${slideCount}" 
                            aria-label="Slide ${slideCount + 1}"></button>
                `;
                $indicators.append(indicatorHtml);
            }
        },

        goToSlide: function(carouselId, slideIndex) {
            const carousel = bootstrap.Carousel.getOrCreateInstance(document.getElementById(carouselId));
            carousel.to(slideIndex);
        },

        pause: function(carouselId) {
            const carousel = bootstrap.Carousel.getOrCreateInstance(document.getElementById(carouselId));
            carousel.pause();
        },

        play: function(carouselId) {
            const carousel = bootstrap.Carousel.getOrCreateInstance(document.getElementById(carouselId));
            carousel.cycle();
        }
    };

    // ============================================================================
    // COMPONENT INITIALIZATION
    // ============================================================================

    // ✅ CORRECT: Initialize all Bootstrap components
    XOS.Bootstrap.initializeComponents = function($container) {
        $container = $container || $(document);

        // Initialize tooltips
        XOS.Bootstrap.Tooltip.initializeTooltips($container);

        // Initialize popovers
        XOS.Bootstrap.Popover.initializePopovers($container);

        // Initialize dropdowns
        XOS.Bootstrap.Dropdown.initializeSearchableDropdowns();

        // Initialize custom data attributes
        $container.find('[data-bs-auto-init]').each(function() {
            const $element = $(this);
            const component = $element.data('bs-auto-init');
            const options = $element.data('bs-options') || {};

            switch (component) {
                case 'modal':
                    // Auto-initialize modal triggers
                    break;
                case 'tooltip':
                    XOS.Bootstrap.Tooltip.create($element, options);
                    break;
                case 'popover':
                    XOS.Bootstrap.Popover.create($element, options);
                    break;
            }
        });
    };

    // ============================================================================
    // MAIN INITIALIZATION
    // ============================================================================

    XOS.Bootstrap.init = function() {
        // Initialize toast container
        XOS.Bootstrap.Toast.init();

        // Initialize tooltips
        XOS.Bootstrap.Tooltip.init();

        // Initialize popovers
        XOS.Bootstrap.Popover.init();

        // Initialize dropdowns
        XOS.Bootstrap.Dropdown.init();

        // Initialize all components
        XOS.Bootstrap.initializeComponents();

        console.log('XOS Bootstrap patterns initialized');
    };

    // Auto-initialize when DOM is ready
    $(document).ready(function() {
        XOS.Bootstrap.init();
    });

    // Export to global scope
    window.XOS = XOS;

})(jQuery);