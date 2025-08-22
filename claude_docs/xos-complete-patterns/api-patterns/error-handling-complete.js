// ===== ERROR HANDLING COMPLETE PATTERNS =====
// This file contains EVERY error handling pattern for XOS Framework APIs
// Follow comprehensive error handling and user feedback patterns EXACTLY

// ⚠️ CRITICAL: Comprehensive error handling is essential for production applications
// Always implement proper error handling, logging, and user feedback

// ===== SECTION 1: ERROR TYPES AND CLASSIFICATION =====

/**
 * ✅ CORRECT: Error type definitions
 * Categorize different types of errors for appropriate handling
 */
const ErrorTypes = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    CLIENT_ERROR: 'CLIENT_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    ABORT_ERROR: 'ABORT_ERROR',
    BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR'
};

/**
 * ✅ CORRECT: HTTP status code mappings
 */
const HttpStatusCodes = {
    // Success
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    
    // Client Errors
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    
    // Server Errors
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};

// ===== SECTION 2: ERROR CLASSIFICATION AND HANDLING =====

/**
 * ✅ CORRECT: Error classification utility
 */
const ErrorClassifier = {
    /**
     * Classify error based on xhr response and status
     */
    classifyError: function(xhr, status, error) {
        // Network or connection errors
        if (status === 'error' && xhr.status === 0) {
            return ErrorTypes.NETWORK_ERROR;
        }
        
        // Request timeout
        if (status === 'timeout') {
            return ErrorTypes.TIMEOUT_ERROR;
        }
        
        // Request aborted
        if (status === 'abort') {
            return ErrorTypes.ABORT_ERROR;
        }
        
        // HTTP status code based classification
        switch (xhr.status) {
            case HttpStatusCodes.UNAUTHORIZED:
                return ErrorTypes.AUTHENTICATION_ERROR;
            case HttpStatusCodes.FORBIDDEN:
                return ErrorTypes.AUTHORIZATION_ERROR;
            case HttpStatusCodes.BAD_REQUEST:
            case HttpStatusCodes.UNPROCESSABLE_ENTITY:
                return ErrorTypes.VALIDATION_ERROR;
            case HttpStatusCodes.TOO_MANY_REQUESTS:
                return ErrorTypes.RATE_LIMIT_ERROR;
            case HttpStatusCodes.INTERNAL_SERVER_ERROR:
            case HttpStatusCodes.BAD_GATEWAY:
            case HttpStatusCodes.SERVICE_UNAVAILABLE:
            case HttpStatusCodes.GATEWAY_TIMEOUT:
                return ErrorTypes.SERVER_ERROR;
            default:
                if (xhr.status >= 400 && xhr.status < 500) {
                    return ErrorTypes.CLIENT_ERROR;
                } else if (xhr.status >= 500) {
                    return ErrorTypes.SERVER_ERROR;
                }
                return ErrorTypes.CLIENT_ERROR;
        }
    },
    
    /**
     * Check if error is retryable
     */
    isRetryableError: function(errorType, status) {
        const retryableTypes = [
            ErrorTypes.NETWORK_ERROR,
            ErrorTypes.TIMEOUT_ERROR,
            ErrorTypes.SERVER_ERROR,
            ErrorTypes.RATE_LIMIT_ERROR
        ];
        
        const retryableStatusCodes = [
            HttpStatusCodes.INTERNAL_SERVER_ERROR,
            HttpStatusCodes.BAD_GATEWAY,
            HttpStatusCodes.SERVICE_UNAVAILABLE,
            HttpStatusCodes.GATEWAY_TIMEOUT,
            HttpStatusCodes.TOO_MANY_REQUESTS
        ];
        
        return retryableTypes.includes(errorType) || retryableStatusCodes.includes(status);
    },
    
    /**
     * Get user-friendly error message
     */
    getUserFriendlyMessage: function(errorType, xhr) {
        const messages = {
            [ErrorTypes.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
            [ErrorTypes.AUTHENTICATION_ERROR]: 'Your session has expired. Please log in again.',
            [ErrorTypes.AUTHORIZATION_ERROR]: 'You do not have permission to perform this action.',
            [ErrorTypes.VALIDATION_ERROR]: 'Please check your input and try again.',
            [ErrorTypes.SERVER_ERROR]: 'Server is temporarily unavailable. Please try again later.',
            [ErrorTypes.TIMEOUT_ERROR]: 'The request timed out. Please try again.',
            [ErrorTypes.RATE_LIMIT_ERROR]: 'Too many requests. Please wait a moment and try again.',
            [ErrorTypes.BUSINESS_LOGIC_ERROR]: 'Operation could not be completed due to business rules.',
            [ErrorTypes.CLIENT_ERROR]: 'Request could not be processed.',
            [ErrorTypes.ABORT_ERROR]: 'Request was cancelled.'
        };
        
        // Try to get specific message from server response
        try {
            if (xhr && xhr.responseText) {
                const response = JSON.parse(xhr.responseText);
                if (response.Message || response.message) {
                    return response.Message || response.message;
                }
            }
        } catch (e) {
            // Use default message
        }
        
        return messages[errorType] || 'An unexpected error occurred. Please try again.';
    }
};

// ===== SECTION 3: ERROR HANDLING STRATEGIES =====

/**
 * ✅ CORRECT: Global error handler
 */
const GlobalErrorHandler = {
    // Configuration
    config: {
        enableConsoleLogging: true,
        enableUserNotifications: true,
        enableErrorTracking: true,
        retryAttempts: 3,
        retryDelay: 1000
    },
    
    // Error statistics
    stats: {
        totalErrors: 0,
        errorsByType: {},
        errorsByEndpoint: {}
    },
    
    /**
     * Handle API errors with comprehensive strategy
     */
    handleError: function(xhr, status, error, context = {}) {
        const errorType = ErrorClassifier.classifyError(xhr, status, error);
        const userMessage = ErrorClassifier.getUserFriendlyMessage(errorType, xhr);
        
        // Create error object
        const errorObj = {
            id: this.generateErrorId(),
            type: errorType,
            status: xhr.status,
            statusText: xhr.statusText,
            message: error,
            userMessage: userMessage,
            url: context.url || 'unknown',
            method: context.method || 'unknown',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            userId: this.getCurrentUserId(),
            sessionId: this.getSessionId(),
            context: context
        };
        
        // Update statistics
        this.updateStats(errorObj);
        
        // Log error
        this.logError(errorObj);
        
        // Track error for analytics
        this.trackError(errorObj);
        
        // Handle specific error types
        this.handleSpecificError(errorObj);
        
        // Show user notification if enabled
        if (this.config.enableUserNotifications && !context.suppressUserNotification) {
            this.showUserNotification(errorObj);
        }
        
        return errorObj;
    },
    
    /**
     * Handle specific error types
     */
    handleSpecificError: function(errorObj) {
        switch (errorObj.type) {
            case ErrorTypes.AUTHENTICATION_ERROR:
                this.handleAuthenticationError(errorObj);
                break;
            case ErrorTypes.AUTHORIZATION_ERROR:
                this.handleAuthorizationError(errorObj);
                break;
            case ErrorTypes.VALIDATION_ERROR:
                this.handleValidationError(errorObj);
                break;
            case ErrorTypes.RATE_LIMIT_ERROR:
                this.handleRateLimitError(errorObj);
                break;
            case ErrorTypes.NETWORK_ERROR:
                this.handleNetworkError(errorObj);
                break;
            default:
                this.handleGenericError(errorObj);
        }
    },
    
    /**
     * Handle authentication errors
     */
    handleAuthenticationError: function(errorObj) {
        // Clear stored authentication
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('userSession');
        
        // Emit authentication error event
        window.dispatchEvent(new CustomEvent('auth:error', {
            detail: errorObj
        }));
        
        // Redirect to login after delay
        setTimeout(() => {
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?expired=true';
            }
        }, 2000);
    },
    
    /**
     * Handle authorization errors
     */
    handleAuthorizationError: function(errorObj) {
        // Emit authorization error event
        window.dispatchEvent(new CustomEvent('auth:forbidden', {
            detail: errorObj
        }));
        
        // Log security event
        this.logSecurityEvent('authorization_failed', errorObj);
    },
    
    /**
     * Handle validation errors
     */
    handleValidationError: function(errorObj) {
        // Try to extract field-specific errors
        let fieldErrors = {};
        
        try {
            const response = JSON.parse(errorObj.xhr?.responseText);
            if (response.Errors && Array.isArray(response.Errors)) {
                response.Errors.forEach(err => {
                    if (err.Field) {
                        fieldErrors[err.Field] = err.Message;
                    }
                });
            }
        } catch (e) {
            // No field-specific errors
        }
        
        // Emit validation error event with field details
        window.dispatchEvent(new CustomEvent('validation:error', {
            detail: { ...errorObj, fieldErrors }
        }));
    },
    
    /**
     * Handle rate limit errors
     */
    handleRateLimitError: function(errorObj) {
        // Extract retry-after header if available
        const retryAfter = errorObj.xhr?.getResponseHeader('Retry-After');
        const retryDelay = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default 1 minute
        
        // Emit rate limit event
        window.dispatchEvent(new CustomEvent('api:rateLimit', {
            detail: { ...errorObj, retryAfter: retryDelay }
        }));
        
        // Show countdown notification
        this.showRateLimitNotification(retryDelay);
    },
    
    /**
     * Handle network errors
     */
    handleNetworkError: function(errorObj) {
        // Check if offline
        if (!navigator.onLine) {
            this.handleOfflineError(errorObj);
        } else {
            // Network connectivity issues
            window.dispatchEvent(new CustomEvent('network:error', {
                detail: errorObj
            }));
        }
    },
    
    /**
     * Handle offline errors
     */
    handleOfflineError: function(errorObj) {
        // Store failed request for retry when online
        this.storeFailedRequest(errorObj);
        
        // Emit offline event
        window.dispatchEvent(new CustomEvent('network:offline', {
            detail: errorObj
        }));
        
        // Show offline notification
        this.showOfflineNotification();
    },
    
    /**
     * Handle generic errors
     */
    handleGenericError: function(errorObj) {
        // Emit generic error event
        window.dispatchEvent(new CustomEvent('api:error', {
            detail: errorObj
        }));
    }
};

// ===== SECTION 4: USER NOTIFICATION SYSTEM =====

/**
 * ✅ CORRECT: User notification manager
 */
const NotificationManager = {
    // Notification queue
    queue: [],
    
    // Active notifications
    active: new Map(),
    
    /**
     * Show error notification to user
     */
    showError: function(message, options = {}) {
        return this.show({
            type: 'error',
            message: message,
            icon: 'bi-exclamation-triangle',
            duration: options.duration || 5000,
            closeable: options.closeable !== false,
            actions: options.actions || []
        });
    },
    
    /**
     * Show warning notification
     */
    showWarning: function(message, options = {}) {
        return this.show({
            type: 'warning',
            message: message,
            icon: 'bi-exclamation-triangle-fill',
            duration: options.duration || 4000,
            closeable: options.closeable !== false,
            actions: options.actions || []
        });
    },
    
    /**
     * Show info notification
     */
    showInfo: function(message, options = {}) {
        return this.show({
            type: 'info',
            message: message,
            icon: 'bi-info-circle',
            duration: options.duration || 3000,
            closeable: options.closeable !== false,
            actions: options.actions || []
        });
    },
    
    /**
     * Show success notification
     */
    showSuccess: function(message, options = {}) {
        return this.show({
            type: 'success',
            message: message,
            icon: 'bi-check-circle',
            duration: options.duration || 3000,
            closeable: options.closeable !== false,
            actions: options.actions || []
        });
    },
    
    /**
     * Show generic notification
     */
    show: function(config) {
        const notification = {
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...config,
            timestamp: new Date()
        };
        
        // Add to queue
        this.queue.push(notification);
        
        // Process queue
        this.processQueue();
        
        return notification.id;
    },
    
    /**
     * Process notification queue
     */
    processQueue: function() {
        if (this.queue.length === 0) return;
        
        const notification = this.queue.shift();
        this.display(notification);
    },
    
    /**
     * Display notification
     */
    display: function(notification) {
        // Create notification element
        const element = this.createElement(notification);
        
        // Add to container
        const container = this.getContainer();
        container.appendChild(element);
        
        // Track active notification
        this.active.set(notification.id, {
            notification: notification,
            element: element
        });
        
        // Auto-hide if duration specified
        if (notification.duration > 0) {
            setTimeout(() => {
                this.hide(notification.id);
            }, notification.duration);
        }
        
        // Animate in
        setTimeout(() => {
            element.classList.add('show');
        }, 10);
    },
    
    /**
     * Create notification DOM element
     */
    createElement: function(notification) {
        const div = document.createElement('div');
        div.className = `toast notification notification-${notification.type}`;
        div.setAttribute('data-notification-id', notification.id);
        
        const header = document.createElement('div');
        header.className = 'toast-header';
        
        const icon = document.createElement('i');
        icon.className = `bi ${notification.icon} me-2`;
        header.appendChild(icon);
        
        const title = document.createElement('strong');
        title.className = 'me-auto';
        title.textContent = this.getTitle(notification.type);
        header.appendChild(title);
        
        const time = document.createElement('small');
        time.textContent = 'now';
        header.appendChild(time);
        
        if (notification.closeable) {
            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'btn-close';
            closeBtn.onclick = () => this.hide(notification.id);
            header.appendChild(closeBtn);
        }
        
        div.appendChild(header);
        
        const body = document.createElement('div');
        body.className = 'toast-body';
        body.innerHTML = notification.message;
        
        // Add actions if any
        if (notification.actions && notification.actions.length > 0) {
            const actions = document.createElement('div');
            actions.className = 'notification-actions mt-2';
            
            notification.actions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = `btn btn-sm ${action.class || 'btn-outline-primary'} me-1`;
                btn.textContent = action.text;
                btn.onclick = () => {
                    if (action.handler) action.handler();
                    if (action.dismissOnClick !== false) this.hide(notification.id);
                };
                actions.appendChild(btn);
            });
            
            body.appendChild(actions);
        }
        
        div.appendChild(body);
        
        return div;
    },
    
    /**
     * Get notification container
     */
    getContainer: function() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(container);
        }
        return container;
    },
    
    /**
     * Hide notification
     */
    hide: function(notificationId) {
        const activeNotif = this.active.get(notificationId);
        if (!activeNotif) return;
        
        const element = activeNotif.element;
        element.classList.remove('show');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.active.delete(notificationId);
        }, 300);
    },
    
    /**
     * Hide all notifications
     */
    hideAll: function() {
        this.active.forEach((_, id) => this.hide(id));
    },
    
    /**
     * Get title for notification type
     */
    getTitle: function(type) {
        const titles = {
            error: 'Error',
            warning: 'Warning',
            info: 'Information',
            success: 'Success'
        };
        return titles[type] || 'Notification';
    }
};

// ===== SECTION 5: RETRY MECHANISM =====

/**
 * ✅ CORRECT: Request retry handler
 */
const RetryHandler = {
    // Active retry operations
    activeRetries: new Map(),
    
    /**
     * Execute request with retry logic
     */
    executeWithRetry: function(requestFn, options = {}) {
        const config = {
            maxAttempts: options.maxAttempts || 3,
            delay: options.delay || 1000,
            backoffMultiplier: options.backoffMultiplier || 2,
            maxDelay: options.maxDelay || 30000,
            shouldRetry: options.shouldRetry || this.defaultShouldRetry.bind(this),
            onRetry: options.onRetry || null,
            ...options
        };
        
        const retryId = this.generateRetryId();
        
        return new Promise((resolve, reject) => {
            let attemptCount = 0;
            
            const attempt = () => {
                attemptCount++;
                
                requestFn()
                    .then(resolve)
                    .catch(error => {
                        if (attemptCount >= config.maxAttempts) {
                            this.activeRetries.delete(retryId);
                            reject(error);
                            return;
                        }
                        
                        if (!config.shouldRetry(error, attemptCount)) {
                            this.activeRetries.delete(retryId);
                            reject(error);
                            return;
                        }
                        
                        const delay = Math.min(
                            config.delay * Math.pow(config.backoffMultiplier, attemptCount - 1),
                            config.maxDelay
                        );
                        
                        // Call retry callback
                        if (config.onRetry) {
                            config.onRetry(error, attemptCount, delay);
                        }
                        
                        // Store retry info
                        this.activeRetries.set(retryId, {
                            attemptCount,
                            nextAttemptAt: new Date(Date.now() + delay),
                            error
                        });
                        
                        setTimeout(attempt, delay);
                    });
            };
            
            attempt();
        });
    },
    
    /**
     * Default retry condition
     */
    defaultShouldRetry: function(error, attemptCount) {
        if (!error.status) return false; // Network error, retry
        
        // Retry on server errors and rate limits
        return [500, 502, 503, 504, 429].includes(error.status);
    },
    
    /**
     * Generate retry ID
     */
    generateRetryId: function() {
        return 'retry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Cancel all retries
     */
    cancelAllRetries: function() {
        this.activeRetries.clear();
    }
};

// ===== SECTION 6: ERROR RECOVERY STRATEGIES =====

/**
 * ✅ CORRECT: Error recovery manager
 */
const ErrorRecoveryManager = {
    // Failed requests storage
    failedRequests: new Map(),
    
    // Recovery strategies
    strategies: new Map(),
    
    /**
     * Register recovery strategy
     */
    registerStrategy: function(errorType, strategy) {
        this.strategies.set(errorType, strategy);
    },
    
    /**
     * Execute recovery for error
     */
    recover: function(errorObj) {
        const strategy = this.strategies.get(errorObj.type);
        if (strategy) {
            return strategy(errorObj);
        }
        
        // Default recovery
        return this.defaultRecovery(errorObj);
    },
    
    /**
     * Default recovery strategy
     */
    defaultRecovery: function(errorObj) {
        if (ErrorClassifier.isRetryableError(errorObj.type, errorObj.status)) {
            return this.scheduleRetry(errorObj);
        }
        
        return Promise.reject(errorObj);
    },
    
    /**
     * Schedule request retry
     */
    scheduleRetry: function(errorObj, delay = 5000) {
        const requestId = this.generateRequestId();
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Re-execute original request
                this.retryRequest(errorObj)
                    .then(resolve)
                    .catch(reject);
            }, delay);
        });
    },
    
    /**
     * Retry failed request
     */
    retryRequest: function(errorObj) {
        // This would need to be implemented based on your specific request mechanism
        // For example, using ApiManager to retry the original request
        return Promise.reject(new Error('Retry not implemented'));
    },
    
    /**
     * Store failed request for later retry
     */
    storeFailedRequest: function(errorObj) {
        const requestId = this.generateRequestId();
        this.failedRequests.set(requestId, {
            ...errorObj,
            storedAt: new Date(),
            retryCount: 0
        });
        return requestId;
    },
    
    /**
     * Retry all failed requests
     */
    retryAllFailedRequests: function() {
        const promises = [];
        
        this.failedRequests.forEach((request, requestId) => {
            const promise = this.retryRequest(request)
                .then(() => {
                    this.failedRequests.delete(requestId);
                })
                .catch(error => {
                    request.retryCount++;
                    if (request.retryCount >= 3) {
                        this.failedRequests.delete(requestId);
                    }
                });
            
            promises.push(promise);
        });
        
        return Promise.allSettled(promises);
    },
    
    /**
     * Generate request ID
     */
    generateRequestId: function() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};

// ===== SECTION 7: COMPLETE INTEGRATION EXAMPLE =====

/**
 * ✅ COMPLETE EXAMPLE: Integrated error handling system
 */
class ErrorHandlingSystem {
    constructor() {
        this.initialize();
    }
    
    initialize() {
        // Set up global error handlers
        this.setupGlobalHandlers();
        
        // Register recovery strategies
        this.setupRecoveryStrategies();
        
        // Set up network monitoring
        this.setupNetworkMonitoring();
        
        // Initialize notification system
        this.initializeNotifications();
    }
    
    setupGlobalHandlers() {
        // Global Ajax error handler
        $(document).ajaxError((event, xhr, settings, error) => {
            this.handleAjaxError(xhr, 'error', error, {
                url: settings.url,
                method: settings.type,
                data: settings.data
            });
        });
        
        // Window error handler
        window.addEventListener('error', (event) => {
            this.handleJavaScriptError(event);
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleUnhandledRejection(event);
        });
    }
    
    setupRecoveryStrategies() {
        // Authentication error recovery
        ErrorRecoveryManager.registerStrategy(ErrorTypes.AUTHENTICATION_ERROR, (errorObj) => {
            return AuthApi.refreshToken().catch(() => {
                window.location.href = '/login';
            });
        });
        
        // Network error recovery
        ErrorRecoveryManager.registerStrategy(ErrorTypes.NETWORK_ERROR, (errorObj) => {
            return ErrorRecoveryManager.scheduleRetry(errorObj, 5000);
        });
        
        // Rate limit recovery
        ErrorRecoveryManager.registerStrategy(ErrorTypes.RATE_LIMIT_ERROR, (errorObj) => {
            const retryAfter = errorObj.xhr?.getResponseHeader('Retry-After');
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
            return ErrorRecoveryManager.scheduleRetry(errorObj, delay);
        });
    }
    
    setupNetworkMonitoring() {
        // Online/offline detection
        window.addEventListener('online', () => {
            NotificationManager.showSuccess('Connection restored');
            ErrorRecoveryManager.retryAllFailedRequests();
        });
        
        window.addEventListener('offline', () => {
            NotificationManager.showWarning('Connection lost. Some features may not work.', {
                duration: 0 // Don't auto-hide
            });
        });
    }
    
    initializeNotifications() {
        // Customize notification styles
        const style = document.createElement('style');
        style.textContent = `
            .notification-error { border-left: 4px solid #dc3545; }
            .notification-warning { border-left: 4px solid #ffc107; }
            .notification-success { border-left: 4px solid #28a745; }
            .notification-info { border-left: 4px solid #17a2b8; }
        `;
        document.head.appendChild(style);
    }
    
    handleAjaxError(xhr, status, error, context) {
        const errorObj = GlobalErrorHandler.handleError(xhr, status, error, context);
        
        // Attempt recovery
        ErrorRecoveryManager.recover(errorObj).catch(() => {
            // Recovery failed, show final error to user
            console.error('Recovery failed for error:', errorObj);
        });
    }
    
    handleJavaScriptError(event) {
        console.error('JavaScript Error:', event.error);
        
        // Track JavaScript errors
        if (typeof gtag === 'function') {
            gtag('event', 'exception', {
                description: event.error.message,
                fatal: false
            });
        }
    }
    
    handleUnhandledRejection(event) {
        console.error('Unhandled Promise Rejection:', event.reason);
        
        // Prevent default browser behavior
        event.preventDefault();
        
        // Show user notification for critical failures
        NotificationManager.showError('An unexpected error occurred. Please refresh the page if problems persist.');
    }
}

// Initialize error handling system
const errorHandlingSystem = new ErrorHandlingSystem();

// Export for global use
window.ErrorHandlingSystem = errorHandlingSystem;
window.NotificationManager = NotificationManager;
window.GlobalErrorHandler = GlobalErrorHandler;

// ❌ COMMON MISTAKES TO AVOID:
// 1. Not categorizing errors properly for appropriate handling
// 2. Showing technical error messages to end users
// 3. Not implementing retry logic for transient failures
// 4. Missing offline/online detection and handling
// 5. Not logging errors for debugging and monitoring
// 6. Ignoring authentication and authorization errors
// 7. Not providing recovery mechanisms for failed requests
// 8. Missing user feedback for error states
// 9. Not handling different types of network errors appropriately
// 10. Forgetting to clean up error handlers and notifications