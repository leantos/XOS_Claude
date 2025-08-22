// ===== LOADING STATES COMPLETE PATTERNS =====
// This file contains EVERY loading state pattern for XOS Framework
// Follow loading indicator and user feedback patterns EXACTLY

// ⚠️ CRITICAL: Loading states provide essential user feedback during async operations
// Always implement appropriate loading indicators for better user experience

// ===== SECTION 1: BASIC LOADING PATTERNS =====

/**
 * ✅ CORRECT: Global loading overlay
 */
const GlobalLoader = {
    element: null,
    activeCount: 0,
    
    init: function() {
        if (!this.element) {
            this.createElement();
        }
    },
    
    show: function() {
        this.activeCount++;
        if (this.activeCount === 1) {
            this.element.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                this.element.classList.add('show');
            }, 10);
        }
    },
    
    hide: function() {
        this.activeCount = Math.max(0, this.activeCount - 1);
        if (this.activeCount === 0) {
            this.element.classList.remove('show');
            setTimeout(() => {
                this.element.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    },
    
    createElement: function() {
        this.element = document.createElement('div');
        this.element.className = 'global-loader';
        this.element.innerHTML = `
            <div class="global-loader-backdrop"></div>
            <div class="global-loader-content">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="global-loader-text">Loading...</div>
            </div>
        `;
        document.body.appendChild(this.element);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .global-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .global-loader.show { opacity: 1; }
            .global-loader-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(2px);
            }
            .global-loader-content {
                position: relative;
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 0.5rem;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            .global-loader-text {
                margin-top: 1rem;
                font-weight: 500;
                color: #6c757d;
            }
        `;
        document.head.appendChild(style);
    },
    
    setText: function(text) {
        if (this.element) {
            const textElement = this.element.querySelector('.global-loader-text');
            if (textElement) {
                textElement.textContent = text;
            }
        }
    }
};

/**
 * ✅ CORRECT: Button loading states
 */
const ButtonLoader = {
    originalTexts: new Map(),
    
    setLoading: function(buttonSelector, loadingText = 'Loading...') {
        const button = typeof buttonSelector === 'string' 
            ? document.querySelector(buttonSelector) 
            : buttonSelector;
            
        if (!button) return;
        
        // Store original text and state
        if (!this.originalTexts.has(button)) {
            this.originalTexts.set(button, {
                text: button.innerHTML,
                disabled: button.disabled
            });
        }
        
        // Set loading state
        button.disabled = true;
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ${loadingText}
        `;
        button.classList.add('loading');
    },
    
    removeLoading: function(buttonSelector) {
        const button = typeof buttonSelector === 'string' 
            ? document.querySelector(buttonSelector) 
            : buttonSelector;
            
        if (!button) return;
        
        const original = this.originalTexts.get(button);
        if (original) {
            button.innerHTML = original.text;
            button.disabled = original.disabled;
            this.originalTexts.delete(button);
        }
        
        button.classList.remove('loading');
    },
    
    // Convenience method for form submissions
    setFormLoading: function(form, submitText = 'Processing...') {
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            this.setLoading(submitButton, submitText);
        }
        
        // Disable all form inputs
        const inputs = form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
            if (input !== submitButton) {
                input.disabled = true;
                input.classList.add('form-disabled');
            }
        });
    },
    
    removeFormLoading: function(form) {
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            this.removeLoading(submitButton);
        }
        
        // Re-enable form inputs
        const inputs = form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
            if (input.classList.contains('form-disabled')) {
                input.disabled = false;
                input.classList.remove('form-disabled');
            }
        });
    }
};

/**
 * ✅ CORRECT: Progress bar manager
 */
const ProgressManager = {
    bars: new Map(),
    
    create: function(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        
        const progressId = options.id || `progress_${Date.now()}`;
        
        const progressHTML = `
            <div class="progress-container ${options.containerClass || ''}">
                ${options.label ? `<div class="progress-label">${options.label}</div>` : ''}
                <div class="progress ${options.progressClass || ''}" style="height: ${options.height || '6px'};">
                    <div class="progress-bar ${options.barClass || 'bg-primary'}" 
                         role="progressbar" 
                         style="width: 0%" 
                         aria-valuenow="0" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
                ${options.showPercentage ? '<div class="progress-percentage">0%</div>' : ''}
                ${options.showStatus ? '<div class="progress-status"></div>' : ''}
            </div>
        `;
        
        container.innerHTML = progressHTML;
        
        const progressBar = container.querySelector('.progress-bar');
        const progressPercentage = container.querySelector('.progress-percentage');
        const progressStatus = container.querySelector('.progress-status');
        
        this.bars.set(progressId, {
            container: container,
            bar: progressBar,
            percentage: progressPercentage,
            status: progressStatus,
            options: options
        });
        
        return progressId;
    },
    
    update: function(progressId, value, status = null) {
        const progress = this.bars.get(progressId);
        if (!progress) return;
        
        const percentage = Math.min(100, Math.max(0, value));
        
        progress.bar.style.width = `${percentage}%`;
        progress.bar.setAttribute('aria-valuenow', percentage);
        
        if (progress.percentage) {
            progress.percentage.textContent = `${Math.round(percentage)}%`;
        }
        
        if (progress.status && status) {
            progress.status.textContent = status;
        }
        
        // Add animation class for smooth transitions
        progress.bar.classList.add('progress-bar-animated');
    },
    
    complete: function(progressId, message = 'Complete!') {
        this.update(progressId, 100, message);
        
        const progress = this.bars.get(progressId);
        if (progress) {
            progress.bar.classList.remove('bg-primary');
            progress.bar.classList.add('bg-success');
            
            setTimeout(() => {
                this.hide(progressId);
            }, 2000);
        }
    },
    
    error: function(progressId, message = 'Error occurred') {
        const progress = this.bars.get(progressId);
        if (progress) {
            progress.bar.classList.remove('bg-primary');
            progress.bar.classList.add('bg-danger');
            
            if (progress.status) {
                progress.status.textContent = message;
                progress.status.classList.add('text-danger');
            }
        }
    },
    
    hide: function(progressId) {
        const progress = this.bars.get(progressId);
        if (progress) {
            progress.container.style.opacity = '0';
            setTimeout(() => {
                progress.container.style.display = 'none';
                this.bars.delete(progressId);
            }, 300);
        }
    }
};

// ===== SECTION 2: SKELETON LOADERS =====

/**
 * ✅ CORRECT: Skeleton loader generator
 */
const SkeletonLoader = {
    create: function(container, template) {
        const element = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!element) return;
        
        element.innerHTML = this.generateSkeleton(template);
        element.classList.add('skeleton-container');
    },
    
    generateSkeleton: function(template) {
        const templates = {
            card: `
                <div class="card skeleton-card">
                    <div class="skeleton skeleton-image" style="height: 200px;"></div>
                    <div class="card-body">
                        <div class="skeleton skeleton-text skeleton-title"></div>
                        <div class="skeleton skeleton-text skeleton-subtitle"></div>
                        <div class="skeleton skeleton-text" style="width: 80%;"></div>
                        <div class="skeleton skeleton-text" style="width: 60%;"></div>
                    </div>
                </div>
            `,
            list: `
                <div class="skeleton-list">
                    ${Array(5).fill().map(() => `
                        <div class="skeleton-list-item">
                            <div class="skeleton skeleton-avatar"></div>
                            <div class="skeleton-list-content">
                                <div class="skeleton skeleton-text skeleton-name"></div>
                                <div class="skeleton skeleton-text skeleton-description"></div>
                            </div>
                            <div class="skeleton skeleton-button"></div>
                        </div>
                    `).join('')}
                </div>
            `,
            table: `
                <div class="table-responsive">
                    <table class="table skeleton-table">
                        <thead>
                            <tr>
                                ${Array(4).fill().map(() => '<th><div class="skeleton skeleton-text"></div></th>').join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${Array(8).fill().map(() => `
                                <tr>
                                    ${Array(4).fill().map(() => '<td><div class="skeleton skeleton-text"></div></td>').join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `,
            form: `
                <form class="skeleton-form">
                    ${Array(6).fill().map(() => `
                        <div class="mb-3">
                            <div class="skeleton skeleton-text skeleton-label"></div>
                            <div class="skeleton skeleton-input"></div>
                        </div>
                    `).join('')}
                    <div class="skeleton skeleton-button skeleton-submit"></div>
                </form>
            `
        };
        
        return templates[template] || template;
    },
    
    remove: function(container) {
        const element = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (element) {
            element.classList.remove('skeleton-container');
        }
    },
    
    // Initialize skeleton styles
    initStyles: function() {
        if (document.getElementById('skeleton-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'skeleton-styles';
        style.textContent = `
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
            }
            
            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .skeleton-text {
                height: 1rem;
                margin-bottom: 0.5rem;
            }
            
            .skeleton-title { height: 1.5rem; width: 70%; }
            .skeleton-subtitle { height: 1rem; width: 50%; }
            .skeleton-name { height: 1.25rem; width: 60%; }
            .skeleton-description { height: 1rem; width: 80%; }
            .skeleton-label { height: 1rem; width: 30%; margin-bottom: 0.25rem; }
            
            .skeleton-input {
                height: 2.5rem;
                width: 100%;
                border-radius: 0.375rem;
            }
            
            .skeleton-button {
                height: 2.5rem;
                width: 120px;
                border-radius: 0.375rem;
            }
            
            .skeleton-submit {
                width: 150px;
            }
            
            .skeleton-avatar {
                width: 3rem;
                height: 3rem;
                border-radius: 50%;
                flex-shrink: 0;
            }
            
            .skeleton-image {
                width: 100%;
                border-radius: 0.375rem;
            }
            
            .skeleton-list-item {
                display: flex;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid #f0f0f0;
                gap: 1rem;
            }
            
            .skeleton-list-content {
                flex: 1;
            }
            
            .skeleton-card {
                border: 1px solid #f0f0f0;
            }
            
            @media (prefers-reduced-motion: reduce) {
                .skeleton {
                    animation: none;
                    background: #f0f0f0;
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// ===== SECTION 3: SPECIALIZED LOADING STATES =====

/**
 * ✅ CORRECT: Data table loading
 */
const TableLoader = {
    showLoading: function(tableSelector, rowCount = 5) {
        const table = document.querySelector(tableSelector);
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        const headerCells = table.querySelectorAll('thead th').length;
        
        // Store original content
        tbody.setAttribute('data-original-content', tbody.innerHTML);
        
        // Generate loading rows
        const loadingRows = Array(rowCount).fill().map(() => {
            const cells = Array(headerCells).fill().map(() => 
                '<td><div class="skeleton skeleton-text"></div></td>'
            ).join('');
            return `<tr class="loading-row">${cells}</tr>`;
        }).join('');
        
        tbody.innerHTML = loadingRows;
        table.classList.add('table-loading');
    },
    
    hideLoading: function(tableSelector) {
        const table = document.querySelector(tableSelector);
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        const originalContent = tbody.getAttribute('data-original-content');
        if (originalContent) {
            tbody.innerHTML = originalContent;
            tbody.removeAttribute('data-original-content');
        }
        
        table.classList.remove('table-loading');
    },
    
    showEmptyState: function(tableSelector, message = 'No data available') {
        const table = document.querySelector(tableSelector);
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        const headerCells = table.querySelectorAll('thead th').length;
        
        tbody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="${headerCells}" class="text-center py-4">
                    <div class="empty-state">
                        <i class="bi bi-inbox display-4 text-muted"></i>
                        <p class="mt-2 mb-0 text-muted">${message}</p>
                    </div>
                </td>
            </tr>
        `;
    }
};

/**
 * ✅ CORRECT: File upload loading
 */
const FileUploadLoader = {
    uploads: new Map(),
    
    startUpload: function(fileInputId, file) {
        const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const progressHTML = `
            <div class="file-upload-progress" data-upload-id="${uploadId}">
                <div class="file-info">
                    <i class="bi bi-file-earmark"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${this.formatFileSize(file.size)})</span>
                </div>
                <div class="upload-progress">
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                    </div>
                    <div class="upload-status">
                        <span class="status-text">Preparing...</span>
                        <span class="upload-percentage">0%</span>
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger cancel-upload">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
        
        const container = document.getElementById(fileInputId + '_progress') || 
                         this.createProgressContainer(fileInputId);
        
        container.insertAdjacentHTML('beforeend', progressHTML);
        
        const uploadElement = container.querySelector(`[data-upload-id="${uploadId}"]`);
        
        this.uploads.set(uploadId, {
            element: uploadElement,
            file: file,
            cancelled: false
        });
        
        // Add cancel handler
        const cancelBtn = uploadElement.querySelector('.cancel-upload');
        cancelBtn.addEventListener('click', () => this.cancelUpload(uploadId));
        
        return uploadId;
    },
    
    updateProgress: function(uploadId, loaded, total, speed = null) {
        const upload = this.uploads.get(uploadId);
        if (!upload || upload.cancelled) return;
        
        const percentage = (loaded / total) * 100;
        const progressBar = upload.element.querySelector('.progress-bar');
        const statusText = upload.element.querySelector('.status-text');
        const percentageText = upload.element.querySelector('.upload-percentage');
        
        progressBar.style.width = `${percentage}%`;
        percentageText.textContent = `${Math.round(percentage)}%`;
        
        if (speed) {
            const remainingBytes = total - loaded;
            const remainingTime = remainingBytes / speed;
            statusText.textContent = `${this.formatFileSize(speed)}/s - ${this.formatTime(remainingTime)} remaining`;
        } else {
            statusText.textContent = 'Uploading...';
        }
    },
    
    completeUpload: function(uploadId, result = null) {
        const upload = this.uploads.get(uploadId);
        if (!upload) return;
        
        const progressBar = upload.element.querySelector('.progress-bar');
        const statusText = upload.element.querySelector('.status-text');
        const cancelBtn = upload.element.querySelector('.cancel-upload');
        
        progressBar.classList.add('bg-success');
        progressBar.style.width = '100%';
        statusText.textContent = 'Upload complete';
        cancelBtn.style.display = 'none';
        
        // Add success icon
        const successIcon = document.createElement('i');
        successIcon.className = 'bi bi-check-circle text-success';
        upload.element.querySelector('.file-info').appendChild(successIcon);
        
        // Auto-remove after delay
        setTimeout(() => {
            this.removeUpload(uploadId);
        }, 3000);
    },
    
    errorUpload: function(uploadId, errorMessage = 'Upload failed') {
        const upload = this.uploads.get(uploadId);
        if (!upload) return;
        
        const progressBar = upload.element.querySelector('.progress-bar');
        const statusText = upload.element.querySelector('.status-text');
        const cancelBtn = upload.element.querySelector('.cancel-upload');
        
        progressBar.classList.add('bg-danger');
        statusText.textContent = errorMessage;
        statusText.classList.add('text-danger');
        cancelBtn.innerHTML = '<i class="bi bi-x"></i> Remove';
        
        // Add error icon
        const errorIcon = document.createElement('i');
        errorIcon.className = 'bi bi-exclamation-circle text-danger';
        upload.element.querySelector('.file-info').appendChild(errorIcon);
    },
    
    cancelUpload: function(uploadId) {
        const upload = this.uploads.get(uploadId);
        if (!upload) return;
        
        upload.cancelled = true;
        this.removeUpload(uploadId);
        
        // Emit cancel event
        document.dispatchEvent(new CustomEvent('upload:cancelled', {
            detail: { uploadId, file: upload.file }
        }));
    },
    
    removeUpload: function(uploadId) {
        const upload = this.uploads.get(uploadId);
        if (upload && upload.element) {
            upload.element.remove();
        }
        this.uploads.delete(uploadId);
    },
    
    createProgressContainer: function(fileInputId) {
        const container = document.createElement('div');
        container.id = fileInputId + '_progress';
        container.className = 'file-upload-progress-container mt-2';
        
        const fileInput = document.getElementById(fileInputId);
        if (fileInput) {
            fileInput.parentNode.insertBefore(container, fileInput.nextSibling);
        }
        
        return container;
    },
    
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    formatTime: function(seconds) {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    }
};

// ===== SECTION 4: SMART LOADING MANAGER =====

/**
 * ✅ CORRECT: Centralized loading state manager
 */
const LoadingManager = {
    states: new Map(),
    defaultOptions: {
        type: 'overlay', // overlay, inline, skeleton, button
        text: 'Loading...',
        showProgress: false,
        preventInteraction: true,
        timeout: 30000
    },
    
    show: function(key, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        
        // Clear existing loading state
        this.hide(key);
        
        const state = {
            key: key,
            config: config,
            startTime: Date.now(),
            timeout: null,
            element: null
        };
        
        // Set timeout if specified
        if (config.timeout > 0) {
            state.timeout = setTimeout(() => {
                this.onTimeout(key);
            }, config.timeout);
        }
        
        // Create loading UI based on type
        switch (config.type) {
            case 'global':
                GlobalLoader.show();
                GlobalLoader.setText(config.text);
                break;
            case 'button':
                if (config.element) {
                    ButtonLoader.setLoading(config.element, config.text);
                }
                break;
            case 'skeleton':
                if (config.element && config.template) {
                    SkeletonLoader.create(config.element, config.template);
                }
                break;
            case 'progress':
                if (config.element) {
                    const progressId = ProgressManager.create(config.element, config);
                    state.progressId = progressId;
                }
                break;
            case 'inline':
            default:
                state.element = this.createInlineLoader(config);
                break;
        }
        
        this.states.set(key, state);
        
        // Emit loading start event
        document.dispatchEvent(new CustomEvent('loading:start', {
            detail: { key, config }
        }));
        
        return key;
    },
    
    hide: function(key) {
        const state = this.states.get(key);
        if (!state) return;
        
        // Clear timeout
        if (state.timeout) {
            clearTimeout(state.timeout);
        }
        
        // Remove loading UI based on type
        switch (state.config.type) {
            case 'global':
                GlobalLoader.hide();
                break;
            case 'button':
                if (state.config.element) {
                    ButtonLoader.removeLoading(state.config.element);
                }
                break;
            case 'skeleton':
                if (state.config.element) {
                    SkeletonLoader.remove(state.config.element);
                }
                break;
            case 'progress':
                if (state.progressId) {
                    ProgressManager.complete(state.progressId);
                }
                break;
            case 'inline':
            default:
                if (state.element && state.element.parentNode) {
                    state.element.parentNode.removeChild(state.element);
                }
                break;
        }
        
        this.states.delete(key);
        
        // Calculate duration
        const duration = Date.now() - state.startTime;
        
        // Emit loading end event
        document.dispatchEvent(new CustomEvent('loading:end', {
            detail: { key, duration, config: state.config }
        }));
    },
    
    updateProgress: function(key, progress, status = null) {
        const state = this.states.get(key);
        if (!state) return;
        
        if (state.config.type === 'progress' && state.progressId) {
            ProgressManager.update(state.progressId, progress, status);
        }
        
        // Emit progress event
        document.dispatchEvent(new CustomEvent('loading:progress', {
            detail: { key, progress, status }
        }));
    },
    
    error: function(key, errorMessage = 'An error occurred') {
        const state = this.states.get(key);
        if (!state) return;
        
        if (state.config.type === 'progress' && state.progressId) {
            ProgressManager.error(state.progressId, errorMessage);
        }
        
        // Emit error event
        document.dispatchEvent(new CustomEvent('loading:error', {
            detail: { key, errorMessage }
        }));
        
        // Auto-hide after delay
        setTimeout(() => {
            this.hide(key);
        }, 3000);
    },
    
    isLoading: function(key) {
        return this.states.has(key);
    },
    
    hideAll: function() {
        const keys = Array.from(this.states.keys());
        keys.forEach(key => this.hide(key));
    },
    
    onTimeout: function(key) {
        const state = this.states.get(key);
        if (!state) return;
        
        // Emit timeout event
        document.dispatchEvent(new CustomEvent('loading:timeout', {
            detail: { key, config: state.config }
        }));
        
        this.error(key, 'Operation timed out');
    },
    
    createInlineLoader: function(config) {
        const loader = document.createElement('div');
        loader.className = 'inline-loader';
        loader.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span>${config.text}</span>
            </div>
        `;
        
        if (config.element) {
            const target = typeof config.element === 'string' 
                ? document.querySelector(config.element)
                : config.element;
            
            if (target) {
                target.appendChild(loader);
            }
        }
        
        return loader;
    }
};

// ===== SECTION 5: INTEGRATION EXAMPLES =====

/**
 * ✅ COMPLETE EXAMPLE: Ajax with integrated loading states
 */
function ajaxWithLoadingExample() {
    // Show loading for user list
    LoadingManager.show('user-list', {
        type: 'skeleton',
        element: '#user-list-container',
        template: 'list'
    });
    
    Utils.ajax({
        url: '/api/users',
        method: 'GET',
        success: function(response) {
            LoadingManager.hide('user-list');
            
            if (response && response.Success) {
                displayUsers(response.Data);
            } else {
                LoadingManager.error('user-list', 'Failed to load users');
            }
        },
        error: function(xhr, status, error) {
            LoadingManager.error('user-list', 'Failed to load users');
        }
    });
}

/**
 * ✅ COMPLETE EXAMPLE: Form submission with loading
 */
function submitFormWithLoading(formElement) {
    const loadingKey = 'form-submit';
    
    LoadingManager.show(loadingKey, {
        type: 'button',
        element: formElement.querySelector('button[type="submit"]'),
        text: 'Saving...'
    });
    
    // Disable form
    ButtonLoader.setFormLoading(formElement, 'Saving...');
    
    const formData = new FormData(formElement);
    
    Utils.ajax({
        url: formElement.action,
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            LoadingManager.hide(loadingKey);
            ButtonLoader.removeFormLoading(formElement);
            
            if (response && response.Success) {
                NotificationManager.showSuccess('Form submitted successfully!');
                formElement.reset();
            } else {
                NotificationManager.showError(response.Message || 'Submission failed');
            }
        },
        error: function(xhr, status, error) {
            LoadingManager.error(loadingKey, 'Submission failed');
            ButtonLoader.removeFormLoading(formElement);
            NotificationManager.showError('Form submission failed');
        }
    });
}

// Initialize loading systems
document.addEventListener('DOMContentLoaded', function() {
    GlobalLoader.init();
    SkeletonLoader.initStyles();
    
    // Auto-handle form submissions
    document.addEventListener('submit', function(e) {
        if (e.target.classList.contains('ajax-form')) {
            e.preventDefault();
            submitFormWithLoading(e.target);
        }
    });
});

// Export for global use
window.LoadingManager = LoadingManager;
window.GlobalLoader = GlobalLoader;
window.ButtonLoader = ButtonLoader;
window.ProgressManager = ProgressManager;
window.SkeletonLoader = SkeletonLoader;

// ❌ COMMON MISTAKES TO AVOID:
// 1. Not showing loading states for async operations
// 2. Using generic "Loading..." text for all operations
// 3. Not implementing timeout handling for long operations
// 4. Forgetting to hide loading states on error
// 5. Not disabling interactive elements during loading
// 6. Missing progress indicators for file uploads
// 7. Not using appropriate loading patterns for different UI contexts
// 8. Forgetting to handle loading states for form submissions
// 9. Not providing cancel options for long-running operations
// 10. Missing skeleton loaders for better perceived performance