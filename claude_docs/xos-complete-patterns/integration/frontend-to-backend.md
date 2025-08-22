# XOS Frontend-to-Backend Integration Complete Patterns

Comprehensive guide for seamless frontend-backend integration in XOS applications.

## Table of Contents
- [Basic Integration Patterns](#basic-integration-patterns)
- [Advanced Communication Patterns](#advanced-communication-patterns)
- [Authentication & Authorization](#authentication--authorization)
- [Error Handling & Recovery](#error-handling--recovery)
- [Real-time Communication](#real-time-communication)
- [File Upload & Download](#file-upload--download)
- [State Management](#state-management)
- [Performance Optimization](#performance-optimization)
- [Testing Patterns](#testing-patterns)
- [Complete Examples](#complete-examples)

## Basic Integration Patterns

### ✅ CORRECT: Standard AJAX Pattern with Utils.ajax

```javascript
// Frontend - Using Utils.ajax for API calls
class UserService {
    static async getUsers() {
        try {
            const response = await Utils.ajax({
                url: '/api/users',
                type: 'GET',
                dataType: 'json'
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw error;
        }
    }

    static async createUser(userData) {
        return await Utils.ajax({
            url: '/api/users',
            type: 'POST',
            data: JSON.stringify(userData),
            contentType: 'application/json',
            dataType: 'json'
        });
    }

    static async updateUser(id, userData) {
        return await Utils.ajax({
            url: `/api/users/${id}`,
            type: 'PUT',
            data: JSON.stringify(userData),
            contentType: 'application/json',
            dataType: 'json'
        });
    }

    static async deleteUser(id) {
        return await Utils.ajax({
            url: `/api/users/${id}`,
            type: 'DELETE',
            dataType: 'json'
        });
    }
}
```

```csharp
// Backend - XOS Controller Pattern
[ApiController]
[Route("api/[controller]")]
public class UsersController : XOSControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        try
        {
            var users = await DBService.GetListAsync<User>(
                "SELECT * FROM users WHERE client_id = @client_id ORDER BY name",
                new { client_id = ClientId }
            );

            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                CreatedAt = u.CreatedAt
            }).ToList();

            return Ok(userDtos);
        }
        catch (Exception ex)
        {
            LogError(ex, "Failed to retrieve users");
            return StatusCode(500, new { error = "Failed to retrieve users" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = await DBService.GetValueAsync<int>(
                "INSERT INTO users (name, email, client_id, created_at) VALUES (@name, @email, @client_id, CURRENT_TIMESTAMP) RETURNING id",
                new { name = request.Name, email = request.Email, client_id = ClientId }
            );

            var user = await DBService.GetAsync<User>(
                "SELECT * FROM users WHERE id = @id AND client_id = @client_id",
                new { id = userId, client_id = ClientId }
            );

            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            };

            return CreatedAtAction(nameof(GetUser), new { id = userId }, userDto);
        }
        catch (Exception ex)
        {
            LogError(ex, "Failed to create user", request);
            return StatusCode(500, new { error = "Failed to create user" });
        }
    }
}
```

### ❌ WRONG: Direct fetch() without error handling

```javascript
// DON'T DO THIS - No error handling, no tenant context
async function getUsers() {
    const response = await fetch('/api/users');
    return response.json(); // Will fail silently on errors
}
```

## Advanced Communication Patterns

### ✅ CORRECT: Request/Response with Validation

```javascript
// Frontend - Form with validation and error handling
class UserForm {
    constructor(formElement) {
        this.form = formElement;
        this.validator = new FormValidator();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Real-time validation
        this.form.querySelectorAll('input').forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(this.form);
        const userData = Object.fromEntries(formData);

        // Client-side validation
        const validation = this.validator.validate(userData);
        if (!validation.isValid) {
            this.displayValidationErrors(validation.errors);
            return;
        }

        try {
            // Show loading state
            this.setLoadingState(true);
            
            const result = await UserService.createUser(userData);
            
            // Handle success
            this.handleSuccess(result);
            this.form.reset();
            
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    validateField(event) {
        const field = event.target;
        const validation = this.validator.validateField(field.name, field.value);
        
        if (!validation.isValid) {
            this.showFieldError(field, validation.error);
        } else {
            this.clearFieldError(field);
        }
    }

    handleSuccess(result) {
        // Show success message
        NotificationService.showSuccess('User created successfully');
        
        // Update UI
        if (window.userTable) {
            window.userTable.addRow(result.data);
        }
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('userCreated', {
            detail: { user: result.data }
        }));
    }

    handleError(error) {
        if (error.status === 400 && error.response?.validationErrors) {
            // Server validation errors
            this.displayValidationErrors(error.response.validationErrors);
        } else if (error.status === 409) {
            // Conflict (e.g., email already exists)
            NotificationService.showError('Email address already in use');
        } else {
            // Generic error
            NotificationService.showError('Failed to create user. Please try again.');
        }
    }

    setLoadingState(loading) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        submitBtn.disabled = loading;
        submitBtn.textContent = loading ? 'Creating...' : 'Create User';
    }
}
```

```csharp
// Backend - Enhanced validation and error handling
[HttpPost]
public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser([FromBody] CreateUserRequest request)
{
    try
    {
        // Model validation
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                );
                
            return BadRequest(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Validation failed",
                ValidationErrors = errors
            });
        }

        // Business validation
        var existingUser = await DBService.GetAsync<User>(
            "SELECT id FROM users WHERE email = @email AND client_id = @client_id",
            new { email = request.Email, client_id = ClientId }
        );

        if (existingUser != null)
        {
            return Conflict(new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Email address already in use"
            });
        }

        // Create user
        var userId = await DBService.GetValueAsync<int>(
            "INSERT INTO users (name, email, client_id, created_at) VALUES (@name, @email, @client_id, CURRENT_TIMESTAMP) RETURNING id",
            new { name = request.Name, email = request.Email, client_id = ClientId }
        );

        var user = await DBService.GetAsync<User>(
            "SELECT * FROM users WHERE id = @id AND client_id = @client_id",
            new { id = userId, client_id = ClientId }
        );

        var userDto = new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            CreatedAt = user.CreatedAt
        };

        return Ok(new ApiResponse<UserDto>
        {
            Success = true,
            Data = userDto,
            Message = "User created successfully"
        });
    }
    catch (Exception ex)
    {
        LogError(ex, "Failed to create user", request);
        return StatusCode(500, new ApiResponse<UserDto>
        {
            Success = false,
            Message = "An error occurred while creating the user"
        });
    }
}
```

### ✅ CORRECT: Pagination and Filtering

```javascript
// Frontend - Advanced table with pagination and filtering
class UserTable {
    constructor(container) {
        this.container = container;
        this.currentPage = 1;
        this.pageSize = 10;
        this.filters = {};
        this.sortBy = 'name';
        this.sortDirection = 'asc';
        
        this.init();
    }

    async init() {
        this.createTableStructure();
        this.setupEventHandlers();
        await this.loadData();
    }

    async loadData(showLoading = true) {
        try {
            if (showLoading) {
                this.showLoadingState();
            }

            const params = {
                page: this.currentPage,
                pageSize: this.pageSize,
                sortBy: this.sortBy,
                sortDirection: this.sortDirection,
                ...this.filters
            };

            const response = await Utils.ajax({
                url: '/api/users/paged',
                type: 'GET',
                data: params,
                dataType: 'json'
            });

            this.renderTable(response.data.items);
            this.renderPagination(response.data.pagination);
            
        } catch (error) {
            this.showError('Failed to load users');
            console.error('Load data error:', error);
        } finally {
            this.hideLoadingState();
        }
    }

    setupEventHandlers() {
        // Search input
        const searchInput = this.container.querySelector('#userSearch');
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.loadData();
            }, 300);
        });

        // Sort headers
        this.container.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', () => {
                const sortBy = header.dataset.sort;
                
                if (this.sortBy === sortBy) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortBy = sortBy;
                    this.sortDirection = 'asc';
                }
                
                this.updateSortIndicators();
                this.loadData();
            });
        });

        // Pagination
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.loadData();
                }
            }
        });
    }

    renderTable(users) {
        const tbody = this.container.querySelector('tbody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.escapeHtml(user.name)}</td>
                <td>${this.escapeHtml(user.email)}</td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${user.id}">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}">
                        Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listeners for action buttons
        this.setupRowActions();
    }

    renderPagination(pagination) {
        const paginationContainer = this.container.querySelector('.pagination-container');
        const { currentPage, totalPages, hasNext, hasPrevious } = pagination;

        let paginationHtml = '<ul class="pagination">';
        
        // Previous button
        paginationHtml += `
            <li class="page-item ${!hasPrevious ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `;

        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        // Next button
        paginationHtml += `
            <li class="page-item ${!hasNext ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
        `;

        paginationHtml += '</ul>';
        paginationContainer.innerHTML = paginationHtml;
    }
}
```

```csharp
// Backend - Pagination and filtering support
[HttpGet("paged")]
public async Task<ActionResult<ApiResponse<PagedResult<UserDto>>>> GetPagedUsers(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10,
    [FromQuery] string search = "",
    [FromQuery] string sortBy = "name",
    [FromQuery] string sortDirection = "asc")
{
    try
    {
        // Validate parameters
        page = Math.Max(1, page);
        pageSize = Math.Min(100, Math.Max(1, pageSize));
        sortDirection = sortDirection.ToLower() == "desc" ? "DESC" : "ASC";
        
        var allowedSortFields = new[] { "name", "email", "created_at" };
        if (!allowedSortFields.Contains(sortBy.ToLower()))
        {
            sortBy = "name";
        }

        // Build query
        var whereClause = "WHERE client_id = @client_id";
        var parameters = new { client_id = ClientId, search = $"%{search}%" };

        if (!string.IsNullOrEmpty(search))
        {
            whereClause += " AND (name ILIKE @search OR email ILIKE @search)";
        }

        // Get total count
        var totalCount = await DBService.GetValueAsync<int>(
            $"SELECT COUNT(*) FROM users {whereClause}",
            parameters
        );

        // Get paged data
        var users = await DBService.GetListAsync<User>($@"
            SELECT * FROM users {whereClause}
            ORDER BY {sortBy} {sortDirection}
            LIMIT @page_size OFFSET @offset",
            new { 
                client_id = ClientId, 
                search = $"%{search}%",
                page_size = pageSize,
                offset = (page - 1) * pageSize
            }
        );

        var userDtos = users.Select(u => new UserDto
        {
            Id = u.Id,
            Name = u.Name,
            Email = u.Email,
            CreatedAt = u.CreatedAt
        }).ToList();

        var pagination = new PaginationInfo
        {
            CurrentPage = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            HasNext = page * pageSize < totalCount,
            HasPrevious = page > 1
        };

        var result = new PagedResult<UserDto>
        {
            Items = userDtos,
            Pagination = pagination
        };

        return Ok(new ApiResponse<PagedResult<UserDto>>
        {
            Success = true,
            Data = result
        });
    }
    catch (Exception ex)
    {
        LogError(ex, "Failed to retrieve paged users", new { page, pageSize, search, sortBy, sortDirection });
        return StatusCode(500, new ApiResponse<PagedResult<UserDto>>
        {
            Success = false,
            Message = "Failed to retrieve users"
        });
    }
}
```

## Authentication & Authorization

### ✅ CORRECT: Token-based authentication

```javascript
// Frontend - Auth service with token management
class AuthService {
    static getToken() {
        return localStorage.getItem('auth_token');
    }

    static setToken(token) {
        localStorage.setItem('auth_token', token);
    }

    static removeToken() {
        localStorage.removeItem('auth_token');
    }

    static async login(credentials) {
        try {
            const response = await Utils.ajax({
                url: '/api/auth/login',
                type: 'POST',
                data: JSON.stringify(credentials),
                contentType: 'application/json',
                dataType: 'json'
            });

            if (response.success && response.data.token) {
                this.setToken(response.data.token);
                this.setupTokenRefresh(response.data.expiresIn);
                return response.data;
            }

            throw new Error(response.message || 'Login failed');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async logout() {
        try {
            await Utils.ajax({
                url: '/api/auth/logout',
                type: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.removeToken();
            window.location.href = '/login';
        }
    }

    static setupTokenRefresh(expiresIn) {
        // Refresh token 5 minutes before expiry
        const refreshTime = (expiresIn - 300) * 1000;
        
        setTimeout(async () => {
            try {
                await this.refreshToken();
            } catch (error) {
                console.error('Token refresh failed:', error);
                this.logout();
            }
        }, refreshTime);
    }

    static async refreshToken() {
        const response = await Utils.ajax({
            url: '/api/auth/refresh',
            type: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            },
            dataType: 'json'
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            this.setupTokenRefresh(response.data.expiresIn);
            return response.data;
        }

        throw new Error('Token refresh failed');
    }
}

// Configure Utils.ajax to include auth token
Utils.ajax.defaults.beforeSend = function(xhr) {
    const token = AuthService.getToken();
    if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
};

// Handle 401 responses globally
Utils.ajax.defaults.error = function(xhr) {
    if (xhr.status === 401) {
        AuthService.logout();
    }
};
```

```csharp
// Backend - JWT authentication
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IConfiguration config, ILogger<AuthController> logger)
    {
        _config = config;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResult>>> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<LoginResult>
                {
                    Success = false,
                    Message = "Invalid request"
                });
            }

            // Validate credentials
            var user = await ValidateCredentials(request.Email, request.Password);
            if (user == null)
            {
                await LogFailedLogin(request.Email);
                return Unauthorized(new ApiResponse<LoginResult>
                {
                    Success = false,
                    Message = "Invalid credentials"
                });
            }

            // Check if user is active
            if (!user.IsActive)
            {
                return Unauthorized(new ApiResponse<LoginResult>
                {
                    Success = false,
                    Message = "Account is deactivated"
                });
            }

            // Generate JWT token
            var token = GenerateJwtToken(user);
            var expiresIn = int.Parse(_config["Jwt:ExpirationMinutes"]) * 60;

            // Log successful login
            await LogSuccessfulLogin(user);

            var result = new LoginResult
            {
                Token = token,
                ExpiresIn = expiresIn,
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    ClientId = user.ClientId
                }
            };

            return Ok(new ApiResponse<LoginResult>
            {
                Success = true,
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed for email: {Email}", request.Email);
            return StatusCode(500, new ApiResponse<LoginResult>
            {
                Success = false,
                Message = "An error occurred during login"
            });
        }
    }

    [HttpPost("refresh")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<RefreshResult>>> RefreshToken()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var clientId = int.Parse(User.FindFirst("client_id")?.Value ?? "0");

            var user = await GetUserById(userId, clientId);
            if (user == null || !user.IsActive)
            {
                return Unauthorized(new ApiResponse<RefreshResult>
                {
                    Success = false,
                    Message = "Invalid user"
                });
            }

            var token = GenerateJwtToken(user);
            var expiresIn = int.Parse(_config["Jwt:ExpirationMinutes"]) * 60;

            var result = new RefreshResult
            {
                Token = token,
                ExpiresIn = expiresIn
            };

            return Ok(new ApiResponse<RefreshResult>
            {
                Success = true,
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token refresh failed");
            return StatusCode(500, new ApiResponse<RefreshResult>
            {
                Success = false,
                Message = "Token refresh failed"
            });
        }
    }

    private string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:SecretKey"]));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("client_id", user.ClientId.ToString()),
            new Claim("is_admin", user.IsAdmin.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpirationMinutes"])),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

## Error Handling & Recovery

### ✅ CORRECT: Comprehensive error handling

```javascript
// Frontend - Error handling service
class ErrorHandler {
    static handle(error, context = {}) {
        console.error('Error occurred:', error, 'Context:', context);

        // Log error to backend
        this.logError(error, context);

        // Determine error type and show appropriate message
        if (error.status === 400) {
            this.handleValidationError(error);
        } else if (error.status === 401) {
            this.handleAuthError(error);
        } else if (error.status === 403) {
            this.handlePermissionError(error);
        } else if (error.status === 404) {
            this.handleNotFoundError(error);
        } else if (error.status >= 500) {
            this.handleServerError(error);
        } else if (error.name === 'NetworkError' || !navigator.onLine) {
            this.handleNetworkError(error);
        } else {
            this.handleGenericError(error);
        }
    }

    static handleValidationError(error) {
        if (error.response?.validationErrors) {
            // Show field-specific validation errors
            Object.keys(error.response.validationErrors).forEach(field => {
                const input = document.querySelector(`[name="${field}"]`);
                if (input) {
                    this.showFieldError(input, error.response.validationErrors[field][0]);
                }
            });
        } else {
            NotificationService.showError(error.response?.message || 'Please check your input and try again');
        }
    }

    static handleAuthError(error) {
        NotificationService.showError('Your session has expired. Please log in again.');
        AuthService.logout();
    }

    static handlePermissionError(error) {
        NotificationService.showError('You do not have permission to perform this action');
    }

    static handleNotFoundError(error) {
        NotificationService.showError('The requested resource was not found');
    }

    static handleServerError(error) {
        NotificationService.showError('A server error occurred. Please try again later.');
        
        // Show retry option for non-critical operations
        if (error.retryable) {
            this.showRetryOption(error.originalRequest);
        }
    }

    static handleNetworkError(error) {
        NotificationService.showError('Network connection lost. Please check your internet connection.');
        
        // Set up automatic retry when connection is restored
        this.setupConnectionMonitoring(error.originalRequest);
    }

    static handleGenericError(error) {
        NotificationService.showError('An unexpected error occurred. Please try again.');
    }

    static async logError(error, context) {
        try {
            await Utils.ajax({
                url: '/api/errors/log',
                type: 'POST',
                data: JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                    status: error.status,
                    url: error.config?.url,
                    context: context,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                }),
                contentType: 'application/json'
            });
        } catch (logError) {
            console.error('Failed to log error:', logError);
        }
    }

    static showRetryOption(originalRequest) {
        const retryModal = new bootstrap.Modal(document.getElementById('retryModal'));
        
        document.getElementById('retryButton').onclick = async () => {
            try {
                await Utils.ajax(originalRequest);
                retryModal.hide();
                NotificationService.showSuccess('Operation completed successfully');
            } catch (retryError) {
                this.handle(retryError);
            }
        };
        
        retryModal.show();
    }

    static setupConnectionMonitoring(originalRequest) {
        const checkConnection = async () => {
            if (navigator.onLine) {
                try {
                    // Try a simple ping request
                    await Utils.ajax({ url: '/api/ping', type: 'GET' });
                    
                    // Connection restored, retry original request
                    await Utils.ajax(originalRequest);
                    NotificationService.showSuccess('Connection restored and operation completed');
                } catch (error) {
                    // Still having issues, continue monitoring
                    setTimeout(checkConnection, 5000);
                }
            } else {
                setTimeout(checkConnection, 2000);
            }
        };
        
        setTimeout(checkConnection, 2000);
    }
}

// Configure global error handling for Utils.ajax
Utils.ajax.defaults.error = function(xhr, textStatus, errorThrown) {
    const error = {
        status: xhr.status,
        message: errorThrown || textStatus,
        response: xhr.responseJSON,
        config: this,
        originalRequest: this
    };
    
    ErrorHandler.handle(error);
};
```

## Real-time Communication

### ✅ CORRECT: SignalR integration

```javascript
// Frontend - SignalR connection management
class SignalRService {
    constructor() {
        this.connection = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 1000;
        this.handlers = new Map();
    }

    async connect() {
        try {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl('/hubs/notifications', {
                    accessTokenFactory: () => AuthService.getToken()
                })
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: retryContext => {
                        if (retryContext.previousRetryCount === 0) {
                            return 0;
                        }
                        return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                    }
                })
                .configureLogging(signalR.LogLevel.Information)
                .build();

            this.setupEventHandlers();
            
            await this.connection.start();
            console.log('SignalR connection established');
            
            // Join tenant group
            await this.joinTenantGroup();
            
            this.reconnectAttempts = 0;
            
        } catch (error) {
            console.error('SignalR connection failed:', error);
            this.scheduleReconnect();
        }
    }

    setupEventHandlers() {
        this.connection.onreconnecting(error => {
            console.log('SignalR reconnecting...', error);
            NotificationService.showInfo('Connection lost, reconnecting...');
        });

        this.connection.onreconnected(connectionId => {
            console.log('SignalR reconnected:', connectionId);
            NotificationService.showSuccess('Connection restored');
            this.joinTenantGroup();
        });

        this.connection.onclose(error => {
            console.error('SignalR connection closed:', error);
            this.scheduleReconnect();
        });

        // Set up message handlers
        this.connection.on('UserCreated', (user) => {
            this.handleUserCreated(user);
        });

        this.connection.on('UserUpdated', (user) => {
            this.handleUserUpdated(user);
        });

        this.connection.on('UserDeleted', (userId) => {
            this.handleUserDeleted(userId);
        });

        this.connection.on('SystemNotification', (notification) => {
            this.handleSystemNotification(notification);
        });
    }

    async joinTenantGroup() {
        if (this.connection.state === signalR.HubConnectionState.Connected) {
            await this.connection.invoke('JoinTenantGroup');
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            NotificationService.showError('Unable to establish real-time connection');
        }
    }

    handleUserCreated(user) {
        // Update UI
        if (window.userTable) {
            window.userTable.addRow(user);
        }
        
        NotificationService.showInfo(`New user ${user.name} was created`);
    }

    handleUserUpdated(user) {
        // Update UI
        if (window.userTable) {
            window.userTable.updateRow(user);
        }
        
        NotificationService.showInfo(`User ${user.name} was updated`);
    }

    handleUserDeleted(userId) {
        // Update UI
        if (window.userTable) {
            window.userTable.removeRow(userId);
        }
        
        NotificationService.showInfo('User was deleted');
    }

    handleSystemNotification(notification) {
        switch (notification.type) {
            case 'info':
                NotificationService.showInfo(notification.message);
                break;
            case 'warning':
                NotificationService.showWarning(notification.message);
                break;
            case 'error':
                NotificationService.showError(notification.message);
                break;
            default:
                NotificationService.showInfo(notification.message);
        }
    }

    async sendMessage(method, ...args) {
        if (this.connection.state === signalR.HubConnectionState.Connected) {
            return await this.connection.invoke(method, ...args);
        } else {
            throw new Error('SignalR connection not established');
        }
    }

    disconnect() {
        if (this.connection) {
            this.connection.stop();
        }
    }
}

// Initialize SignalR service
const signalRService = new SignalRService();

// Connect when authenticated
document.addEventListener('DOMContentLoaded', () => {
    if (AuthService.getToken()) {
        signalRService.connect();
    }
});

// Reconnect after login
document.addEventListener('userLoggedIn', () => {
    signalRService.connect();
});

// Disconnect on logout
document.addEventListener('userLoggedOut', () => {
    signalRService.disconnect();
});
```

## Complete Examples

### ✅ COMPLETE EXAMPLE: Full CRUD with real-time updates

```javascript
// Frontend - Complete user management system
class UserManagementSystem {
    constructor() {
        this.userTable = null;
        this.userForm = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        this.setupComponents();
        this.setupEventHandlers();
        await this.loadInitialData();
    }

    setupComponents() {
        // Initialize table
        this.userTable = new UserTable(document.getElementById('userTableContainer'));
        
        // Initialize form
        this.userForm = new UserForm(document.getElementById('userForm'));
        
        // Initialize modals
        this.editModal = new bootstrap.Modal(document.getElementById('editUserModal'));
        this.deleteModal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
    }

    setupEventHandlers() {
        // Create user button
        document.getElementById('createUserBtn').addEventListener('click', () => {
            this.openCreateForm();
        });

        // Table events
        document.addEventListener('userTableRowClick', (e) => {
            if (e.detail.action === 'edit') {
                this.openEditForm(e.detail.user);
            } else if (e.detail.action === 'delete') {
                this.openDeleteConfirmation(e.detail.user);
            }
        });

        // Form events
        document.addEventListener('userFormSubmit', async (e) => {
            await this.handleFormSubmit(e.detail);
        });

        // SignalR events
        document.addEventListener('signalRUserCreated', (e) => {
            this.handleRemoteUserCreated(e.detail.user);
        });

        document.addEventListener('signalRUserUpdated', (e) => {
            this.handleRemoteUserUpdated(e.detail.user);
        });

        document.addEventListener('signalRUserDeleted', (e) => {
            this.handleRemoteUserDeleted(e.detail.userId);
        });
    }

    async loadInitialData() {
        try {
            await this.userTable.loadData();
        } catch (error) {
            ErrorHandler.handle(error, { context: 'initial_load' });
        }
    }

    openCreateForm() {
        this.currentUser = null;
        this.userForm.reset();
        this.userForm.setMode('create');
        this.editModal.show();
    }

    openEditForm(user) {
        this.currentUser = user;
        this.userForm.populate(user);
        this.userForm.setMode('edit');
        this.editModal.show();
    }

    openDeleteConfirmation(user) {
        this.currentUser = user;
        document.getElementById('deleteUserName').textContent = user.name;
        this.deleteModal.show();
    }

    async handleFormSubmit(formData) {
        try {
            let result;
            
            if (this.currentUser) {
                // Update existing user
                result = await UserService.updateUser(this.currentUser.id, formData);
                NotificationService.showSuccess('User updated successfully');
            } else {
                // Create new user
                result = await UserService.createUser(formData);
                NotificationService.showSuccess('User created successfully');
            }

            this.editModal.hide();
            await this.userTable.loadData(false); // Refresh without loading indicator
            
        } catch (error) {
            ErrorHandler.handle(error, { context: 'form_submit', formData });
        }
    }

    async confirmDelete() {
        if (!this.currentUser) return;

        try {
            await UserService.deleteUser(this.currentUser.id);
            NotificationService.showSuccess('User deleted successfully');
            this.deleteModal.hide();
            await this.userTable.loadData(false);
            
        } catch (error) {
            ErrorHandler.handle(error, { context: 'delete_user', userId: this.currentUser.id });
        }
    }

    // Handle real-time updates from other users
    handleRemoteUserCreated(user) {
        this.userTable.addRow(user);
        NotificationService.showInfo(`${user.name} was created by another user`);
    }

    handleRemoteUserUpdated(user) {
        this.userTable.updateRow(user);
        NotificationService.showInfo(`${user.name} was updated by another user`);
    }

    handleRemoteUserDeleted(userId) {
        this.userTable.removeRow(userId);
        NotificationService.showInfo('A user was deleted by another user');
    }
}

// Initialize the system
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('userManagementPage')) {
        new UserManagementSystem();
    }
});
```

```csharp
// Backend - Complete user controller with SignalR
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : XOSControllerBase
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public UsersController(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetUsers()
    {
        try
        {
            var users = await DBService.GetListAsync<User>(
                "SELECT * FROM users WHERE client_id = @client_id AND is_active = true ORDER BY name",
                new { client_id = ClientId }
            );

            var userDtos = users.Select(MapToDto).ToList();

            return Ok(new ApiResponse<List<UserDto>>
            {
                Success = true,
                Data = userDtos
            });
        }
        catch (Exception ex)
        {
            LogError(ex, "Failed to retrieve users");
            return StatusCode(500, new ApiResponse<List<UserDto>>
            {
                Success = false,
                Message = "Failed to retrieve users"
            });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser([FromBody] CreateUserRequest request)
    {
        using var transaction = await DBService.BeginTransactionAsync();
        
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    );
                    
                return BadRequest(new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "Validation failed",
                    ValidationErrors = errors
                });
            }

            // Check for duplicate email
            var existingUser = await DBService.GetAsync<User>(
                "SELECT id FROM users WHERE email = @email AND client_id = @client_id",
                new { email = request.Email, client_id = ClientId },
                transaction: transaction
            );

            if (existingUser != null)
            {
                await transaction.RollbackAsync();
                return Conflict(new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "Email address already in use"
                });
            }

            // Create user
            var userId = await DBService.GetValueAsync<int>(@"
                INSERT INTO users (name, email, password_hash, client_id, created_at, created_by, is_active)
                VALUES (@name, @email, @password_hash, @client_id, CURRENT_TIMESTAMP, @created_by, true)
                RETURNING id",
                new { 
                    name = request.Name, 
                    email = request.Email, 
                    password_hash = HashPassword(request.Password),
                    client_id = ClientId,
                    created_by = UserId
                },
                transaction: transaction
            );

            // Get created user
            var user = await DBService.GetAsync<User>(
                "SELECT * FROM users WHERE id = @id AND client_id = @client_id",
                new { id = userId, client_id = ClientId },
                transaction: transaction
            );

            // Log the creation
            await LogUserActivity("user_created", userId, new { user.Name, user.Email }, transaction);

            await transaction.CommitAsync();

            var userDto = MapToDto(user);

            // Notify other clients via SignalR
            await _hubContext.Clients.Group($"tenant_{ClientId}").SendAsync("UserCreated", userDto);

            return CreatedAtAction(nameof(GetUser), new { id = userId }, new ApiResponse<UserDto>
            {
                Success = true,
                Data = userDto,
                Message = "User created successfully"
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            LogError(ex, "Failed to create user", request);
            return StatusCode(500, new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Failed to create user"
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        using var transaction = await DBService.BeginTransactionAsync();
        
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    );
                    
                return BadRequest(new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "Validation failed",
                    ValidationErrors = errors
                });
            }

            // Verify user exists and belongs to tenant
            var existingUser = await DBService.GetAsync<User>(
                "SELECT * FROM users WHERE id = @id AND client_id = @client_id",
                new { id = id, client_id = ClientId },
                transaction: transaction
            );

            if (existingUser == null)
            {
                await transaction.RollbackAsync();
                return NotFound(new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "User not found"
                });
            }

            // Check for email conflicts (excluding current user)
            var emailConflict = await DBService.GetAsync<User>(
                "SELECT id FROM users WHERE email = @email AND client_id = @client_id AND id != @id",
                new { email = request.Email, client_id = ClientId, id = id },
                transaction: transaction
            );

            if (emailConflict != null)
            {
                await transaction.RollbackAsync();
                return Conflict(new ApiResponse<UserDto>
                {
                    Success = false,
                    Message = "Email address already in use"
                });
            }

            // Update user
            await DBService.ExecuteAsync(@"
                UPDATE users 
                SET name = @name, email = @email, updated_at = CURRENT_TIMESTAMP, updated_by = @updated_by
                WHERE id = @id AND client_id = @client_id",
                new { 
                    name = request.Name, 
                    email = request.Email, 
                    updated_by = UserId,
                    id = id, 
                    client_id = ClientId 
                },
                transaction: transaction
            );

            // Get updated user
            var updatedUser = await DBService.GetAsync<User>(
                "SELECT * FROM users WHERE id = @id AND client_id = @client_id",
                new { id = id, client_id = ClientId },
                transaction: transaction
            );

            // Log the update
            await LogUserActivity("user_updated", id, new { 
                OldName = existingUser.Name, 
                NewName = updatedUser.Name,
                OldEmail = existingUser.Email,
                NewEmail = updatedUser.Email
            }, transaction);

            await transaction.CommitAsync();

            var userDto = MapToDto(updatedUser);

            // Notify other clients via SignalR
            await _hubContext.Clients.Group($"tenant_{ClientId}").SendAsync("UserUpdated", userDto);

            return Ok(new ApiResponse<UserDto>
            {
                Success = true,
                Data = userDto,
                Message = "User updated successfully"
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            LogError(ex, "Failed to update user", new { UserId = id, Request = request });
            return StatusCode(500, new ApiResponse<UserDto>
            {
                Success = false,
                Message = "Failed to update user"
            });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteUser(int id)
    {
        using var transaction = await DBService.BeginTransactionAsync();
        
        try
        {
            // Verify user exists and belongs to tenant
            var user = await DBService.GetAsync<User>(
                "SELECT * FROM users WHERE id = @id AND client_id = @client_id",
                new { id = id, client_id = ClientId },
                transaction: transaction
            );

            if (user == null)
            {
                await transaction.RollbackAsync();
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User not found"
                });
            }

            // Prevent deletion of the last admin user
            if (user.IsAdmin)
            {
                var adminCount = await DBService.GetValueAsync<int>(
                    "SELECT COUNT(*) FROM users WHERE client_id = @client_id AND is_admin = true AND is_active = true",
                    new { client_id = ClientId },
                    transaction: transaction
                );

                if (adminCount <= 1)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Cannot delete the last admin user"
                    });
                }
            }

            // Soft delete user
            await DBService.ExecuteAsync(@"
                UPDATE users 
                SET is_active = false, deleted_at = CURRENT_TIMESTAMP, deleted_by = @deleted_by
                WHERE id = @id AND client_id = @client_id",
                new { deleted_by = UserId, id = id, client_id = ClientId },
                transaction: transaction
            );

            // Log the deletion
            await LogUserActivity("user_deleted", id, new { user.Name, user.Email }, transaction);

            await transaction.CommitAsync();

            // Notify other clients via SignalR
            await _hubContext.Clients.Group($"tenant_{ClientId}").SendAsync("UserDeleted", id);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "User deleted successfully"
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            LogError(ex, "Failed to delete user", new { UserId = id });
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Failed to delete user"
            });
        }
    }

    private UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            IsAdmin = user.IsAdmin,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    private async Task LogUserActivity(string action, int userId, object data, IDbTransaction transaction)
    {
        await DBService.ExecuteAsync(@"
            INSERT INTO user_activity_log (user_id, action, data, performed_by, client_id, created_at)
            VALUES (@user_id, @action, @data, @performed_by, @client_id, CURRENT_TIMESTAMP)",
            new {
                user_id = userId,
                action = action,
                data = JsonSerializer.Serialize(data),
                performed_by = UserId,
                client_id = ClientId
            },
            transaction: transaction
        );
    }
}
```

This documentation provides comprehensive patterns for frontend-to-backend integration in XOS applications, covering all major scenarios from basic CRUD operations to advanced real-time communication and error handling patterns.