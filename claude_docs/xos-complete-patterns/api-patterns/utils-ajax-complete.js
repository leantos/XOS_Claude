// ===== UTILS AJAX COMPLETE PATTERNS =====
// This file contains EVERY Utils.ajax usage pattern for XOS Framework
// Follow Utils.ajax conventions and error handling patterns EXACTLY

// ⚠️ CRITICAL: Utils.ajax is the standard XOS AJAX utility
// Always use Utils.ajax instead of fetch() or jQuery.ajax() in XOS applications

// ===== SECTION 1: BASIC AJAX PATTERNS =====

/**
 * ✅ CORRECT: Basic GET request pattern
 * Use this for retrieving data from the server
 */
function basicGetExample() {
    Utils.ajax({
        url: '/api/users',
        method: 'GET',
        success: function(response) {
            console.log('Success:', response);
            // Handle success response
            if (response && response.Success) {
                displayUsers(response.Data);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
            showErrorMessage('Failed to load users');
        }
    });
}

/**
 * ✅ CORRECT: Basic POST request pattern
 * Use this for creating new resources
 */
function basicPostExample() {
    const userData = {
        FirstName: 'John',
        LastName: 'Doe',
        Email: 'john.doe@example.com',
        IsActive: true
    };

    Utils.ajax({
        url: '/api/users',
        method: 'POST',
        data: userData,
        success: function(response) {
            if (response && response.Success) {
                showSuccessMessage('User created successfully');
                refreshUserList();
            } else {
                showErrorMessage(response.Message || 'Failed to create user');
            }
        },
        error: function(xhr, status, error) {
            console.error('Create user error:', error);
            showErrorMessage('Failed to create user');
        }
    });
}

/**
 * ✅ CORRECT: Basic PUT request pattern
 * Use this for updating existing resources
 */
function basicPutExample(userId) {
    const userData = {
        ID: userId,
        FirstName: 'Jane',
        LastName: 'Smith',
        Email: 'jane.smith@example.com',
        IsActive: true
    };

    Utils.ajax({
        url: `/api/users/${userId}`,
        method: 'PUT',
        data: userData,
        success: function(response) {
            if (response && response.Success) {
                showSuccessMessage('User updated successfully');
                refreshUserDetails(userId);
            } else {
                showErrorMessage(response.Message || 'Failed to update user');
            }
        },
        error: function(xhr, status, error) {
            console.error('Update user error:', error);
            showErrorMessage('Failed to update user');
        }
    });
}

/**
 * ✅ CORRECT: Basic DELETE request pattern
 * Use this for removing resources
 */
function basicDeleteExample(userId) {
    // Always confirm before delete
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    Utils.ajax({
        url: `/api/users/${userId}`,
        method: 'DELETE',
        success: function(response) {
            if (response && response.Success) {
                showSuccessMessage('User deleted successfully');
                removeUserFromList(userId);
            } else {
                showErrorMessage(response.Message || 'Failed to delete user');
            }
        },
        error: function(xhr, status, error) {
            console.error('Delete user error:', error);
            showErrorMessage('Failed to delete user');
        }
    });
}

// ===== SECTION 2: ADVANCED AJAX PATTERNS =====

/**
 * ✅ CORRECT: Ajax with authentication headers
 * Use this pattern when you need to include authentication tokens
 */
function authenticatedRequestExample() {
    const token = localStorage.getItem('authToken');
    
    Utils.ajax({
        url: '/api/secure-data',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function(response) {
            console.log('Authenticated response:', response);
        },
        error: function(xhr, status, error) {
            if (xhr.status === 401) {
                // Token expired or invalid
                handleTokenExpiration();
            } else {
                showErrorMessage('Failed to load secure data');
            }
        }
    });
}

/**
 * ✅ CORRECT: Ajax with query parameters
 * Use this for GET requests with multiple parameters
 */
function getWithQueryParamsExample() {
    const searchParams = {
        page: 1,
        pageSize: 10,
        search: 'john',
        department: 'IT',
        isActive: true
    };

    // Build query string
    const queryString = Object.keys(searchParams)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(searchParams[key])}`)
        .join('&');

    Utils.ajax({
        url: `/api/users?${queryString}`,
        method: 'GET',
        success: function(response) {
            if (response && response.Success) {
                displaySearchResults(response.Data);
                updatePagination(response.Data.TotalCount, searchParams.page, searchParams.pageSize);
            }
        },
        error: function(xhr, status, error) {
            console.error('Search error:', error);
            showErrorMessage('Search failed');
        }
    });
}

/**
 * ✅ CORRECT: Ajax with loading indicators
 * Use this pattern to show/hide loading states
 */
function ajaxWithLoadingExample() {
    // Show loading indicator
    showLoadingSpinner();
    setButtonLoading('#saveButton', true);

    Utils.ajax({
        url: '/api/users',
        method: 'GET',
        timeout: 30000, // 30 second timeout
        success: function(response) {
            hideLoadingSpinner();
            setButtonLoading('#saveButton', false);
            
            if (response && response.Success) {
                displayUsers(response.Data);
            } else {
                showErrorMessage(response.Message || 'Request failed');
            }
        },
        error: function(xhr, status, error) {
            hideLoadingSpinner();
            setButtonLoading('#saveButton', false);
            
            if (status === 'timeout') {
                showErrorMessage('Request timed out. Please try again.');
            } else {
                showErrorMessage('Request failed. Please try again.');
            }
        }
    });
}

/**
 * ✅ CORRECT: Ajax with form data
 * Use this for forms with complex data including files
 */
function ajaxWithFormDataExample() {
    const formData = new FormData();
    formData.append('FirstName', 'John');
    formData.append('LastName', 'Doe');
    formData.append('Email', 'john@example.com');
    
    // File upload
    const fileInput = document.getElementById('profilePicture');
    if (fileInput.files.length > 0) {
        formData.append('ProfilePicture', fileInput.files[0]);
    }

    Utils.ajax({
        url: '/api/users/upload',
        method: 'POST',
        data: formData,
        processData: false, // Don't process the data
        contentType: false, // Don't set content type
        success: function(response) {
            if (response && response.Success) {
                showSuccessMessage('User and file uploaded successfully');
            } else {
                showErrorMessage(response.Message || 'Upload failed');
            }
        },
        error: function(xhr, status, error) {
            console.error('Upload error:', error);
            showErrorMessage('Upload failed');
        },
        // Progress callback for file uploads
        xhr: function() {
            const xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener('progress', function(evt) {
                if (evt.lengthComputable) {
                    const percentComplete = (evt.loaded / evt.total) * 100;
                    updateProgressBar(percentComplete);
                }
            }, false);
            return xhr;
        }
    });
}

/**
 * ✅ CORRECT: Ajax with retry logic
 * Use this for critical operations that should retry on failure
 */
function ajaxWithRetryExample(url, data, maxRetries = 3) {
    let retryCount = 0;

    function attemptRequest() {
        Utils.ajax({
            url: url,
            method: 'POST',
            data: data,
            success: function(response) {
                if (response && response.Success) {
                    showSuccessMessage('Operation completed successfully');
                } else {
                    showErrorMessage(response.Message || 'Operation failed');
                }
            },
            error: function(xhr, status, error) {
                retryCount++;
                
                if (retryCount <= maxRetries && xhr.status >= 500) {
                    // Server error - retry after delay
                    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                    showInfoMessage(`Request failed. Retrying in ${delay/1000} seconds... (${retryCount}/${maxRetries})`);
                    
                    setTimeout(attemptRequest, delay);
                } else {
                    // Max retries reached or client error
                    if (retryCount > maxRetries) {
                        showErrorMessage('Operation failed after multiple attempts');
                    } else {
                        showErrorMessage('Operation failed');
                    }
                }
            }
        });
    }

    attemptRequest();
}

// ===== SECTION 3: SPECIALIZED AJAX PATTERNS =====

/**
 * ✅ CORRECT: Ajax for autocomplete/typeahead
 * Use this for search-as-you-type functionality
 */
function autocompleteAjaxExample() {
    let searchTimeout;
    const searchInput = document.getElementById('userSearch');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        
        // Clear previous timeout
        clearTimeout(searchTimeout);
        
        if (searchTerm.length < 2) {
            hideAutocompleteResults();
            return;
        }
        
        // Debounce search requests
        searchTimeout = setTimeout(function() {
            Utils.ajax({
                url: '/api/users/search',
                method: 'GET',
                data: { term: searchTerm, limit: 10 },
                success: function(response) {
                    if (response && response.Success) {
                        showAutocompleteResults(response.Data);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Autocomplete error:', error);
                    hideAutocompleteResults();
                }
            });
        }, 300); // 300ms debounce
    });
}

/**
 * ✅ CORRECT: Ajax for infinite scroll/pagination
 * Use this for loading more data as user scrolls
 */
function infiniteScrollAjaxExample() {
    let currentPage = 1;
    let isLoading = false;
    let hasMoreData = true;

    function loadMoreData() {
        if (isLoading || !hasMoreData) return;
        
        isLoading = true;
        showLoadingIndicator();

        Utils.ajax({
            url: '/api/users',
            method: 'GET',
            data: {
                page: currentPage,
                pageSize: 20
            },
            success: function(response) {
                isLoading = false;
                hideLoadingIndicator();
                
                if (response && response.Success) {
                    appendUsers(response.Data.Items);
                    
                    // Check if there's more data
                    hasMoreData = response.Data.HasNextPage;
                    currentPage++;
                } else {
                    showErrorMessage('Failed to load more data');
                }
            },
            error: function(xhr, status, error) {
                isLoading = false;
                hideLoadingIndicator();
                showErrorMessage('Failed to load more data');
            }
        });
    }

    // Scroll event listener
    window.addEventListener('scroll', function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            loadMoreData();
        }
    });

    // Initial load
    loadMoreData();
}

/**
 * ✅ CORRECT: Ajax for batch operations
 * Use this for processing multiple items at once
 */
function batchOperationAjaxExample(userIds, operation) {
    const batchData = {
        UserIds: userIds,
        Operation: operation,
        Timestamp: new Date().toISOString()
    };

    showBatchProgress(0, userIds.length);

    Utils.ajax({
        url: '/api/users/batch',
        method: 'POST',
        data: batchData,
        timeout: 60000, // Longer timeout for batch operations
        success: function(response) {
            if (response && response.Success) {
                showBatchProgress(userIds.length, userIds.length);
                showSuccessMessage(`Batch operation completed: ${response.Data.ProcessedCount}/${userIds.length} items`);
                refreshUserList();
            } else {
                showErrorMessage(response.Message || 'Batch operation failed');
            }
        },
        error: function(xhr, status, error) {
            console.error('Batch operation error:', error);
            
            if (status === 'timeout') {
                showErrorMessage('Batch operation timed out');
            } else {
                showErrorMessage('Batch operation failed');
            }
        }
    });
}

/**
 * ✅ CORRECT: Ajax for real-time validation
 * Use this for checking data availability (email, username, etc.)
 */
function realTimeValidationAjaxExample() {
    let validationTimeout;
    const emailInput = document.getElementById('emailInput');
    const validationMessage = document.getElementById('emailValidation');

    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        
        if (!email || !isValidEmail(email)) {
            return;
        }

        clearTimeout(validationTimeout);
        
        validationTimeout = setTimeout(function() {
            showValidationSpinner();
            
            Utils.ajax({
                url: '/api/users/validate-email',
                method: 'GET',
                data: { email: email },
                success: function(response) {
                    hideValidationSpinner();
                    
                    if (response && response.Success) {
                        if (response.Data.IsAvailable) {
                            showValidationSuccess('Email is available');
                        } else {
                            showValidationError('Email is already taken');
                        }
                    } else {
                        showValidationError('Unable to validate email');
                    }
                },
                error: function(xhr, status, error) {
                    hideValidationSpinner();
                    showValidationError('Validation failed');
                }
            });
        }, 500); // 500ms delay
    });
}

// ===== SECTION 4: ERROR HANDLING PATTERNS =====

/**
 * ✅ CORRECT: Comprehensive error handling
 * Use this pattern for robust error handling
 */
function comprehensiveErrorHandlingExample() {
    Utils.ajax({
        url: '/api/users',
        method: 'GET',
        success: function(response) {
            if (response && response.Success) {
                displayUsers(response.Data);
            } else {
                // Server returned error in response
                handleServerError(response);
            }
        },
        error: function(xhr, status, error) {
            console.error('Ajax error:', {
                status: status,
                error: error,
                statusCode: xhr.status,
                responseText: xhr.responseText
            });

            // Handle different types of errors
            switch (xhr.status) {
                case 0:
                    showErrorMessage('Network connection failed. Please check your internet connection.');
                    break;
                case 400:
                    handleBadRequest(xhr);
                    break;
                case 401:
                    handleUnauthorized();
                    break;
                case 403:
                    showErrorMessage('Access denied. You do not have permission to perform this action.');
                    break;
                case 404:
                    showErrorMessage('The requested resource was not found.');
                    break;
                case 422:
                    handleValidationErrors(xhr);
                    break;
                case 429:
                    showErrorMessage('Too many requests. Please wait a moment and try again.');
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    showErrorMessage('Server error occurred. Please try again later.');
                    break;
                default:
                    if (status === 'timeout') {
                        showErrorMessage('Request timed out. Please try again.');
                    } else if (status === 'abort') {
                        // Request was aborted - usually not an error to display
                        console.log('Request was aborted');
                    } else {
                        showErrorMessage('An unexpected error occurred. Please try again.');
                    }
            }
        }
    });
}

/**
 * ✅ CORRECT: Handle validation errors from server
 */
function handleValidationErrors(xhr) {
    try {
        const response = JSON.parse(xhr.responseText);
        
        if (response.Errors && Array.isArray(response.Errors)) {
            // Display field-specific errors
            response.Errors.forEach(function(error) {
                if (error.Field) {
                    showFieldError(error.Field, error.Message);
                } else {
                    showErrorMessage(error.Message);
                }
            });
        } else if (response.Message) {
            showErrorMessage(response.Message);
        } else {
            showErrorMessage('Validation failed. Please check your input.');
        }
    } catch (e) {
        showErrorMessage('Validation failed. Please check your input.');
    }
}

/**
 * ✅ CORRECT: Handle unauthorized access
 */
function handleUnauthorized() {
    // Clear stored authentication
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userSession');
    
    // Show login modal or redirect to login page
    showLoginModal();
    
    // Or redirect to login page
    // window.location.href = '/login';
}

// ===== SECTION 5: UTILITY FUNCTIONS =====

/**
 * ✅ CORRECT: Global Ajax setup for XOS
 * Set up default configurations for all Ajax requests
 */
function setupGlobalAjaxDefaults() {
    // Set default headers
    $.ajaxSetup({
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        timeout: 30000, // 30 second default timeout
        cache: false // Disable caching for data requests
    });

    // Global Ajax event handlers
    $(document).ajaxStart(function() {
        $('#globalLoadingIndicator').show();
    });

    $(document).ajaxStop(function() {
        $('#globalLoadingIndicator').hide();
    });

    $(document).ajaxError(function(event, xhr, settings, error) {
        // Global error logging
        console.error('Global Ajax Error:', {
            url: settings.url,
            method: settings.type,
            status: xhr.status,
            error: error
        });

        // Track errors for analytics
        if (typeof trackError === 'function') {
            trackError('ajax_error', {
                url: settings.url,
                status: xhr.status,
                error: error
            });
        }
    });
}

/**
 * ✅ CORRECT: Ajax request queue for managing concurrent requests
 */
class AjaxQueue {
    constructor(maxConcurrent = 3) {
        this.queue = [];
        this.active = [];
        this.maxConcurrent = maxConcurrent;
    }

    add(requestConfig) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                config: requestConfig,
                resolve: resolve,
                reject: reject
            });
            this.processQueue();
        });
    }

    processQueue() {
        if (this.active.length >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        const request = this.queue.shift();
        this.active.push(request);

        // Add completion handler
        const originalSuccess = request.config.success;
        const originalError = request.config.error;

        request.config.success = (response) => {
            this.removeFromActive(request);
            if (originalSuccess) originalSuccess(response);
            request.resolve(response);
            this.processQueue();
        };

        request.config.error = (xhr, status, error) => {
            this.removeFromActive(request);
            if (originalError) originalError(xhr, status, error);
            request.reject({ xhr, status, error });
            this.processQueue();
        };

        // Execute request
        Utils.ajax(request.config);
    }

    removeFromActive(request) {
        const index = this.active.indexOf(request);
        if (index > -1) {
            this.active.splice(index, 1);
        }
    }

    clear() {
        this.queue = [];
        // Note: Active requests will complete naturally
    }
}

// Create global Ajax queue instance
const globalAjaxQueue = new AjaxQueue(3);

/**
 * ✅ CORRECT: Utility functions for common operations
 */
const AjaxUtils = {
    // Build query string from object
    buildQueryString: function(params) {
        return Object.keys(params)
            .filter(key => params[key] !== null && params[key] !== undefined)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    },

    // Get current authentication token
    getAuthToken: function() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    },

    // Check if response indicates success
    isSuccessResponse: function(response) {
        return response && (response.Success === true || response.success === true);
    },

    // Extract error message from response
    getErrorMessage: function(xhr, defaultMessage = 'An error occurred') {
        try {
            const response = JSON.parse(xhr.responseText);
            return response.Message || response.message || defaultMessage;
        } catch (e) {
            return defaultMessage;
        }
    },

    // Create abort controller for request cancellation
    createAbortController: function() {
        if (typeof AbortController !== 'undefined') {
            return new AbortController();
        }
        return null;
    }
};

// ===== SECTION 6: COMPLETE WORKING EXAMPLES =====

/**
 * ✅ COMPLETE EXAMPLE: User management with full CRUD operations
 */
class UserManager {
    constructor() {
        this.baseUrl = '/api/users';
        this.currentRequests = new Map(); // Track active requests for cancellation
    }

    // Get all users with pagination and filtering
    async getUsers(options = {}) {
        const {
            page = 1,
            pageSize = 10,
            search = '',
            sortBy = 'name',
            sortDirection = 'asc',
            filters = {}
        } = options;

        const params = {
            page,
            pageSize,
            search,
            sortBy,
            sortDirection,
            ...filters
        };

        const queryString = AjaxUtils.buildQueryString(params);
        const requestKey = `getUsers_${JSON.stringify(params)}`;

        // Cancel previous request if exists
        if (this.currentRequests.has(requestKey)) {
            this.currentRequests.get(requestKey).abort();
        }

        return new Promise((resolve, reject) => {
            const xhr = Utils.ajax({
                url: `${this.baseUrl}?${queryString}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${AjaxUtils.getAuthToken()}`
                },
                success: function(response) {
                    if (AjaxUtils.isSuccessResponse(response)) {
                        resolve(response.Data);
                    } else {
                        reject(new Error(response.Message || 'Failed to load users'));
                    }
                },
                error: function(xhr, status, error) {
                    if (status !== 'abort') {
                        reject(new Error(AjaxUtils.getErrorMessage(xhr, 'Failed to load users')));
                    }
                }
            });

            this.currentRequests.set(requestKey, xhr);
        });
    }

    // Create new user
    async createUser(userData) {
        return new Promise((resolve, reject) => {
            Utils.ajax({
                url: this.baseUrl,
                method: 'POST',
                data: userData,
                headers: {
                    'Authorization': `Bearer ${AjaxUtils.getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                success: function(response) {
                    if (AjaxUtils.isSuccessResponse(response)) {
                        resolve(response.Data);
                    } else {
                        reject(new Error(response.Message || 'Failed to create user'));
                    }
                },
                error: function(xhr, status, error) {
                    reject(new Error(AjaxUtils.getErrorMessage(xhr, 'Failed to create user')));
                }
            });
        });
    }

    // Update existing user
    async updateUser(userId, userData) {
        return new Promise((resolve, reject) => {
            Utils.ajax({
                url: `${this.baseUrl}/${userId}`,
                method: 'PUT',
                data: { ...userData, ID: userId },
                headers: {
                    'Authorization': `Bearer ${AjaxUtils.getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                success: function(response) {
                    if (AjaxUtils.isSuccessResponse(response)) {
                        resolve(response.Data);
                    } else {
                        reject(new Error(response.Message || 'Failed to update user'));
                    }
                },
                error: function(xhr, status, error) {
                    reject(new Error(AjaxUtils.getErrorMessage(xhr, 'Failed to update user')));
                }
            });
        });
    }

    // Delete user
    async deleteUser(userId) {
        return new Promise((resolve, reject) => {
            Utils.ajax({
                url: `${this.baseUrl}/${userId}`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${AjaxUtils.getAuthToken()}`
                },
                success: function(response) {
                    if (AjaxUtils.isSuccessResponse(response)) {
                        resolve(true);
                    } else {
                        reject(new Error(response.Message || 'Failed to delete user'));
                    }
                },
                error: function(xhr, status, error) {
                    reject(new Error(AjaxUtils.getErrorMessage(xhr, 'Failed to delete user')));
                }
            });
        });
    }

    // Cancel all pending requests
    cancelAllRequests() {
        this.currentRequests.forEach(xhr => xhr.abort());
        this.currentRequests.clear();
    }
}

// Initialize global instances
const userManager = new UserManager();

// Setup on document ready
$(document).ready(function() {
    setupGlobalAjaxDefaults();
});

// Example usage:
/*
// Get users with filtering
userManager.getUsers({
    page: 1,
    pageSize: 20,
    search: 'john',
    filters: { department: 'IT', isActive: true }
}).then(users => {
    console.log('Users loaded:', users);
}).catch(error => {
    console.error('Error loading users:', error);
});

// Create new user
userManager.createUser({
    FirstName: 'John',
    LastName: 'Doe',
    Email: 'john@example.com'
}).then(user => {
    console.log('User created:', user);
}).catch(error => {
    console.error('Error creating user:', error);
});
*/

// ❌ COMMON MISTAKES TO AVOID:
// 1. Not handling network errors properly
// 2. Missing authentication headers
// 3. Not validating responses before using data
// 4. Forgetting to show loading indicators
// 5. Not implementing request timeouts
// 6. Missing CSRF token protection
// 7. Not debouncing search requests
// 8. Memory leaks from not cancelling requests
// 9. Not handling different HTTP status codes appropriately
// 10. Using synchronous Ajax requests (blocking UI)