// ===== API MANAGER COMPLETE PATTERNS =====
// This file contains EVERY ApiManager usage pattern for XOS Framework
// Follow ApiManager conventions and centralized API management patterns EXACTLY

// ⚠️ CRITICAL: ApiManager is the central API management utility for XOS
// Always use ApiManager for consistent API handling across the application

// ===== SECTION 1: BASIC API MANAGER SETUP =====

/**
 * ✅ CORRECT: Basic ApiManager configuration
 * Set up ApiManager with default settings
 */
const ApiManager = {
    // Base configuration
    config: {
        baseUrl: '/api',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        defaultHeaders: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    },

    // Request interceptors
    interceptors: {
        request: [],
        response: []
    },

    // Active requests tracking
    activeRequests: new Map(),

    // Authentication token storage
    authToken: null,

    /**
     * ✅ CORRECT: Initialize ApiManager
     */
    init: function(options = {}) {
        // Merge custom options with defaults
        this.config = { ...this.config, ...options };
        
        // Set up authentication token
        this.authToken = this.getStoredToken();
        
        // Set up default request interceptor for authentication
        this.addRequestInterceptor(this.authInterceptor.bind(this));
        
        // Set up default response interceptor for error handling
        this.addResponseInterceptor(this.errorInterceptor.bind(this));
        
        // Set up CSRF token if available
        this.setupCSRFToken();
        
        console.log('ApiManager initialized with config:', this.config);
    },

    /**
     * ✅ CORRECT: Add request interceptor
     */
    addRequestInterceptor: function(interceptor) {
        this.interceptors.request.push(interceptor);
    },

    /**
     * ✅ CORRECT: Add response interceptor
     */
    addResponseInterceptor: function(interceptor) {
        this.interceptors.response.push(interceptor);
    },

    /**
     * ✅ CORRECT: Authentication interceptor
     */
    authInterceptor: function(config) {
        if (this.authToken) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        return config;
    },

    /**
     * ✅ CORRECT: Error response interceptor
     */
    errorInterceptor: function(response, xhr) {
        // Handle token expiration
        if (xhr.status === 401) {
            this.handleTokenExpiration();
        }
        
        // Handle server errors
        if (xhr.status >= 500) {
            this.handleServerError(xhr);
        }
        
        return response;
    },

    /**
     * ✅ CORRECT: Set authentication token
     */
    setAuthToken: function(token) {
        this.authToken = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    },

    /**
     * ✅ CORRECT: Get stored authentication token
     */
    getStoredToken: function() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }
};

// ===== SECTION 2: CORE API METHODS =====

/**
 * ✅ CORRECT: Generic request method
 * Base method for all API requests
 */
ApiManager.request = function(config) {
    const requestId = this.generateRequestId();
    const fullConfig = this.buildRequestConfig(config);
    
    // Apply request interceptors
    let processedConfig = fullConfig;
    this.interceptors.request.forEach(interceptor => {
        processedConfig = interceptor(processedConfig) || processedConfig;
    });

    return new Promise((resolve, reject) => {
        const xhr = Utils.ajax({
            ...processedConfig,
            success: (response) => {
                this.activeRequests.delete(requestId);
                
                // Apply response interceptors
                let processedResponse = response;
                this.interceptors.response.forEach(interceptor => {
                    processedResponse = interceptor(processedResponse, xhr) || processedResponse;
                });
                
                resolve(processedResponse);
            },
            error: (xhr, status, error) => {
                this.activeRequests.delete(requestId);
                
                // Apply response interceptors for errors
                this.interceptors.response.forEach(interceptor => {
                    interceptor(null, xhr);
                });
                
                reject(this.createErrorObject(xhr, status, error));
            }
        });
        
        // Track active request
        this.activeRequests.set(requestId, xhr);
    });
};

/**
 * ✅ CORRECT: GET request method
 */
ApiManager.get = function(url, params = {}, options = {}) {
    const queryString = this.buildQueryString(params);
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request({
        url: fullUrl,
        method: 'GET',
        ...options
    });
};

/**
 * ✅ CORRECT: POST request method
 */
ApiManager.post = function(url, data = {}, options = {}) {
    return this.request({
        url: url,
        method: 'POST',
        data: data,
        ...options
    });
};

/**
 * ✅ CORRECT: PUT request method
 */
ApiManager.put = function(url, data = {}, options = {}) {
    return this.request({
        url: url,
        method: 'PUT',
        data: data,
        ...options
    });
};

/**
 * ✅ CORRECT: PATCH request method
 */
ApiManager.patch = function(url, data = {}, options = {}) {
    return this.request({
        url: url,
        method: 'PATCH',
        data: data,
        ...options
    });
};

/**
 * ✅ CORRECT: DELETE request method
 */
ApiManager.delete = function(url, options = {}) {
    return this.request({
        url: url,
        method: 'DELETE',
        ...options
    });
};

// ===== SECTION 3: SPECIALIZED API METHODS =====

/**
 * ✅ CORRECT: File upload method
 */
ApiManager.upload = function(url, formData, options = {}) {
    const config = {
        url: url,
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        timeout: 120000, // 2 minute timeout for uploads
        ...options
    };
    
    // Add progress tracking if callback provided
    if (options.onProgress) {
        config.xhr = function() {
            const xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener('progress', function(evt) {
                if (evt.lengthComputable) {
                    const percentComplete = (evt.loaded / evt.total) * 100;
                    options.onProgress(percentComplete, evt.loaded, evt.total);
                }
            }, false);
            return xhr;
        };
    }
    
    return this.request(config);
};

/**
 * ✅ CORRECT: File download method
 */
ApiManager.download = function(url, filename, options = {}) {
    return this.request({
        url: url,
        method: 'GET',
        dataType: 'blob',
        ...options
    }).then(response => {
        // Create download link
        const blob = new Blob([response], { type: options.contentType || 'application/octet-stream' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        return response;
    });
};

/**
 * ✅ CORRECT: Batch request method
 */
ApiManager.batch = function(requests) {
    return Promise.all(requests.map(request => {
        if (typeof request === 'function') {
            return request();
        } else {
            return this.request(request);
        }
    }));
};

/**
 * ✅ CORRECT: Parallel requests with concurrency limit
 */
ApiManager.parallel = function(requests, concurrencyLimit = 3) {
    return new Promise((resolve, reject) => {
        const results = [];
        const errors = [];
        let completed = 0;
        let index = 0;
        
        function processNext() {
            if (index >= requests.length) {
                if (completed === requests.length) {
                    if (errors.length > 0) {
                        reject(errors);
                    } else {
                        resolve(results);
                    }
                }
                return;
            }
            
            const currentIndex = index++;
            const request = requests[currentIndex];
            
            const executeRequest = typeof request === 'function' ? request() : ApiManager.request(request);
            
            executeRequest
                .then(result => {
                    results[currentIndex] = result;
                })
                .catch(error => {
                    errors[currentIndex] = error;
                })
                .finally(() => {
                    completed++;
                    processNext();
                });
            
            // Start next request if under concurrency limit
            if (index < requests.length && index % concurrencyLimit !== 0) {
                processNext();
            }
        }
        
        // Start initial requests
        for (let i = 0; i < Math.min(concurrencyLimit, requests.length); i++) {
            processNext();
        }
    });
};

// ===== SECTION 4: UTILITY METHODS =====

/**
 * ✅ CORRECT: Build request configuration
 */
ApiManager.buildRequestConfig = function(config) {
    const baseUrl = config.baseUrl || this.config.baseUrl;
    const fullUrl = config.url.startsWith('http') ? config.url : `${baseUrl}${config.url}`;
    
    return {
        ...this.config,
        ...config,
        url: fullUrl,
        headers: {
            ...this.config.defaultHeaders,
            ...(config.headers || {})
        }
    };
};

/**
 * ✅ CORRECT: Build query string from parameters
 */
ApiManager.buildQueryString = function(params) {
    if (!params || typeof params !== 'object') return '';
    
    return Object.keys(params)
        .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
        .map(key => {
            const value = params[key];
            if (Array.isArray(value)) {
                return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
            }
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .join('&');
};

/**
 * ✅ CORRECT: Generate unique request ID
 */
ApiManager.generateRequestId = function() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * ✅ CORRECT: Create standardized error object
 */
ApiManager.createErrorObject = function(xhr, status, error) {
    let message = 'Request failed';
    let code = 'UNKNOWN_ERROR';
    let data = null;
    
    try {
        if (xhr.responseText) {
            const response = JSON.parse(xhr.responseText);
            message = response.Message || response.message || message;
            code = response.Code || response.code || code;
            data = response.Data || response.data || null;
        }
    } catch (e) {
        // Use default error message
    }
    
    return {
        message: message,
        code: code,
        status: xhr.status,
        statusText: xhr.statusText,
        data: data,
        originalError: error
    };
};

/**
 * ✅ CORRECT: Cancel all active requests
 */
ApiManager.cancelAllRequests = function() {
    this.activeRequests.forEach(xhr => {
        if (xhr.readyState !== 4) {
            xhr.abort();
        }
    });
    this.activeRequests.clear();
};

/**
 * ✅ CORRECT: Cancel specific request
 */
ApiManager.cancelRequest = function(requestId) {
    const xhr = this.activeRequests.get(requestId);
    if (xhr && xhr.readyState !== 4) {
        xhr.abort();
        this.activeRequests.delete(requestId);
    }
};

/**
 * ✅ CORRECT: Setup CSRF token
 */
ApiManager.setupCSRFToken = function() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
        this.config.defaultHeaders['X-CSRF-TOKEN'] = csrfToken.getAttribute('content');
    }
};

/**
 * ✅ CORRECT: Handle token expiration
 */
ApiManager.handleTokenExpiration = function() {
    this.setAuthToken(null);
    
    // Emit event for application to handle
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:tokenExpired', {
            detail: { timestamp: new Date() }
        }));
    }
    
    // Optional: Show login modal or redirect
    if (this.config.onTokenExpired) {
        this.config.onTokenExpired();
    }
};

/**
 * ✅ CORRECT: Handle server errors
 */
ApiManager.handleServerError = function(xhr) {
    // Log server error for debugging
    console.error('Server Error:', {
        status: xhr.status,
        statusText: xhr.statusText,
        responseText: xhr.responseText
    });
    
    // Emit event for application error handling
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api:serverError', {
            detail: { 
                status: xhr.status,
                statusText: xhr.statusText,
                timestamp: new Date()
            }
        }));
    }
};

// ===== SECTION 5: RESOURCE-SPECIFIC API MANAGERS =====

/**
 * ✅ CORRECT: User API Manager
 */
const UserApi = {
    baseUrl: '/api/users',
    
    // Get all users
    getAll: function(params = {}) {
        return ApiManager.get(this.baseUrl, params);
    },
    
    // Get user by ID
    getById: function(id) {
        return ApiManager.get(`${this.baseUrl}/${id}`);
    },
    
    // Create new user
    create: function(userData) {
        return ApiManager.post(this.baseUrl, userData);
    },
    
    // Update user
    update: function(id, userData) {
        return ApiManager.put(`${this.baseUrl}/${id}`, userData);
    },
    
    // Delete user
    delete: function(id) {
        return ApiManager.delete(`${this.baseUrl}/${id}`);
    },
    
    // Search users
    search: function(searchTerm, filters = {}) {
        return ApiManager.get(`${this.baseUrl}/search`, { 
            term: searchTerm, 
            ...filters 
        });
    },
    
    // Get user permissions
    getPermissions: function(id) {
        return ApiManager.get(`${this.baseUrl}/${id}/permissions`);
    },
    
    // Update user permissions
    updatePermissions: function(id, permissions) {
        return ApiManager.put(`${this.baseUrl}/${id}/permissions`, { permissions });
    },
    
    // Change user password
    changePassword: function(id, passwordData) {
        return ApiManager.post(`${this.baseUrl}/${id}/change-password`, passwordData);
    },
    
    // Upload user avatar
    uploadAvatar: function(id, file, onProgress) {
        const formData = new FormData();
        formData.append('avatar', file);
        
        return ApiManager.upload(`${this.baseUrl}/${id}/avatar`, formData, {
            onProgress: onProgress
        });
    },
    
    // Batch operations
    batchUpdate: function(operations) {
        return ApiManager.post(`${this.baseUrl}/batch`, { operations });
    },
    
    // Export users
    exportCsv: function(params = {}) {
        return ApiManager.download(`${this.baseUrl}/export/csv`, 'users.csv', {
            params: params,
            contentType: 'text/csv'
        });
    },
    
    // Import users
    importCsv: function(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        
        return ApiManager.upload(`${this.baseUrl}/import/csv`, formData, {
            onProgress: onProgress,
            timeout: 300000 // 5 minute timeout for imports
        });
    }
};

/**
 * ✅ CORRECT: Authentication API Manager
 */
const AuthApi = {
    baseUrl: '/api/auth',
    
    // Login
    login: function(credentials) {
        return ApiManager.post(`${this.baseUrl}/login`, credentials)
            .then(response => {
                if (response.Success && response.Data.token) {
                    ApiManager.setAuthToken(response.Data.token);
                }
                return response;
            });
    },
    
    // Logout
    logout: function() {
        return ApiManager.post(`${this.baseUrl}/logout`)
            .finally(() => {
                ApiManager.setAuthToken(null);
            });
    },
    
    // Refresh token
    refreshToken: function() {
        const refreshToken = localStorage.getItem('refreshToken');
        return ApiManager.post(`${this.baseUrl}/refresh`, { refreshToken })
            .then(response => {
                if (response.Success && response.Data.token) {
                    ApiManager.setAuthToken(response.Data.token);
                }
                return response;
            });
    },
    
    // Get current user
    getCurrentUser: function() {
        return ApiManager.get(`${this.baseUrl}/me`);
    },
    
    // Register
    register: function(userData) {
        return ApiManager.post(`${this.baseUrl}/register`, userData);
    },
    
    // Forgot password
    forgotPassword: function(email) {
        return ApiManager.post(`${this.baseUrl}/forgot-password`, { email });
    },
    
    // Reset password
    resetPassword: function(token, password) {
        return ApiManager.post(`${this.baseUrl}/reset-password`, { token, password });
    },
    
    // Verify email
    verifyEmail: function(token) {
        return ApiManager.post(`${this.baseUrl}/verify-email`, { token });
    }
};

/**
 * ✅ CORRECT: File API Manager
 */
const FileApi = {
    baseUrl: '/api/files',
    
    // Upload single file
    upload: function(file, options = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        if (options.folder) {
            formData.append('folder', options.folder);
        }
        
        return ApiManager.upload(this.baseUrl, formData, {
            onProgress: options.onProgress,
            timeout: options.timeout || 120000
        });
    },
    
    // Upload multiple files
    uploadMultiple: function(files, options = {}) {
        const formData = new FormData();
        
        Array.from(files).forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });
        
        if (options.folder) {
            formData.append('folder', options.folder);
        }
        
        return ApiManager.upload(`${this.baseUrl}/multiple`, formData, {
            onProgress: options.onProgress,
            timeout: options.timeout || 300000
        });
    },
    
    // Download file
    download: function(fileId, filename) {
        return ApiManager.download(`${this.baseUrl}/${fileId}/download`, filename);
    },
    
    // Get file info
    getInfo: function(fileId) {
        return ApiManager.get(`${this.baseUrl}/${fileId}`);
    },
    
    // Delete file
    delete: function(fileId) {
        return ApiManager.delete(`${this.baseUrl}/${fileId}`);
    },
    
    // Get file thumbnail
    getThumbnail: function(fileId, size = 'medium') {
        return ApiManager.get(`${this.baseUrl}/${fileId}/thumbnail`, { size });
    }
};

// ===== SECTION 6: COMPLETE WORKING EXAMPLES =====

/**
 * ✅ COMPLETE EXAMPLE: Application API setup and usage
 */
class ApplicationApi {
    constructor() {
        this.initializeApiManager();
        this.setupEventListeners();
    }
    
    initializeApiManager() {
        ApiManager.init({
            baseUrl: window.location.origin + '/api',
            timeout: 30000,
            retryAttempts: 3,
            onTokenExpired: () => {
                this.handleTokenExpiration();
            }
        });
        
        // Add custom request interceptor
        ApiManager.addRequestInterceptor((config) => {
            // Add client info to all requests
            config.headers = config.headers || {};
            config.headers['X-Client-Version'] = '1.0.0';
            config.headers['X-Client-Platform'] = this.getClientPlatform();
            
            // Log outgoing requests in development
            if (process.env.NODE_ENV === 'development') {
                console.log('API Request:', config.method, config.url, config.data);
            }
            
            return config;
        });
        
        // Add custom response interceptor
        ApiManager.addResponseInterceptor((response, xhr) => {
            // Log responses in development
            if (process.env.NODE_ENV === 'development') {
                console.log('API Response:', xhr.status, response);
            }
            
            // Handle specific business logic
            if (response && response.Code === 'MAINTENANCE_MODE') {
                this.handleMaintenanceMode(response);
            }
            
            return response;
        });
    }
    
    setupEventListeners() {
        // Listen for token expiration
        window.addEventListener('auth:tokenExpired', (event) => {
            this.handleTokenExpiration();
        });
        
        // Listen for server errors
        window.addEventListener('api:serverError', (event) => {
            this.handleServerError(event.detail);
        });
        
        // Listen for network status changes
        window.addEventListener('online', () => {
            this.handleNetworkOnline();
        });
        
        window.addEventListener('offline', () => {
            this.handleNetworkOffline();
        });
    }
    
    handleTokenExpiration() {
        // Try to refresh token first
        AuthApi.refreshToken().catch(() => {
            // Refresh failed, redirect to login
            window.location.href = '/login';
        });
    }
    
    handleMaintenanceMode(response) {
        // Show maintenance mode modal
        this.showMaintenanceModal(response.Data);
    }
    
    handleServerError(detail) {
        // Show generic error message for server errors
        this.showErrorToast('Server is temporarily unavailable. Please try again later.');
    }
    
    handleNetworkOnline() {
        this.showSuccessToast('Connection restored');
        // Retry failed requests
        this.retryFailedRequests();
    }
    
    handleNetworkOffline() {
        this.showWarningToast('Connection lost. Some features may not work.');
    }
    
    getClientPlatform() {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('Windows') !== -1) return 'Windows';
        if (userAgent.indexOf('Mac') !== -1) return 'Mac';
        if (userAgent.indexOf('Linux') !== -1) return 'Linux';
        if (userAgent.indexOf('Android') !== -1) return 'Android';
        if (userAgent.indexOf('iOS') !== -1) return 'iOS';
        return 'Unknown';
    }
    
    // Usage examples
    async loadUserData(userId) {
        try {
            const user = await UserApi.getById(userId);
            const permissions = await UserApi.getPermissions(userId);
            
            return {
                user: user.Data,
                permissions: permissions.Data
            };
        } catch (error) {
            console.error('Failed to load user data:', error);
            throw error;
        }
    }
    
    async saveUserWithFile(userData, avatarFile) {
        try {
            // First create/update the user
            const userResponse = userData.ID 
                ? await UserApi.update(userData.ID, userData)
                : await UserApi.create(userData);
            
            // Then upload avatar if provided
            if (avatarFile && userResponse.Success) {
                await UserApi.uploadAvatar(userResponse.Data.ID, avatarFile, (progress) => {
                    this.updateUploadProgress(progress);
                });
            }
            
            return userResponse;
        } catch (error) {
            console.error('Failed to save user:', error);
            throw error;
        }
    }
}

// Initialize application API
const appApi = new ApplicationApi();

// Export for global use
window.ApiManager = ApiManager;
window.UserApi = UserApi;
window.AuthApi = AuthApi;
window.FileApi = FileApi;

// ❌ COMMON MISTAKES TO AVOID:
// 1. Not centralizing API configuration and management
// 2. Inconsistent error handling across different API calls
// 3. Not implementing request/response interceptors for common functionality
// 4. Missing authentication token management
// 5. Not handling network failures and offline scenarios
// 6. Forgetting to cancel requests when components unmount
// 7. Not implementing retry logic for failed requests
// 8. Missing request timeout configurations
// 9. Not logging API calls for debugging
// 10. Hardcoding API endpoints instead of using centralized configuration