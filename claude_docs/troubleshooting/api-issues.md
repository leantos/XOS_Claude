# API Issues & Solutions

This document tracks REST API-related issues encountered during development and their solutions. Focus on endpoint design, validation, responses, and API architecture patterns.

## Endpoint Design Issues

### Issue: Inconsistent API Response Formats
**Symptoms:** Frontend receives different response structures from similar endpoints
**Root Cause:** No standardized response format across controllers
**Solution:** Implement consistent response wrapper pattern
**Code Example:**
```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T Data { get; set; }
    public string Message { get; set; }
    public List<string> Errors { get; set; } = new();
}

[HttpGet]
public async Task<IActionResult> Get()
{
    var data = await _service.GetAllAsync();
    return Ok(new ApiResponse<List<Item>> 
    { 
        Success = true, 
        Data = data,
        Message = "Items retrieved successfully"
    });
}
```
**Pattern:** Use consistent response wrapper for all API endpoints

### Issue: RESTful URL Design Violations
**Symptoms:** URLs like `/api/getUserById` instead of `/api/users/{id}`
**Root Cause:** Not following REST conventions
**Solution:** Use proper REST resource naming
**Code Example:**
```csharp
// Wrong
[HttpGet("getUserById/{id}")]

// Correct
[HttpGet("{id}")]
```
**Pattern:** Use resource-based URLs with HTTP verbs

## UserLogin Module API Issues

### Issue: JWT Token Validation Always Returns 401
**Symptoms:** All protected endpoints return 401 despite valid JWT tokens
**Root Cause:** JWT configuration mismatch between generation and validation
**Solution:** Ensure consistent JWT settings across all services
**Code Example:**
```csharp
// In Program.cs - ensure consistent configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(5) // Add tolerance for clock skew
        };
    });
```
**Applied In:** UserLogin authentication endpoints

### Issue: Multi-Tenant Context Lost in API Calls
**Symptoms:** Users seeing data from wrong client/site, authorization failures
**Root Cause:** BaseController not extracting tenant context from JWT claims
**Solution:** Implement proper claim extraction in BaseController
**Pattern:** Always extract ClientId/SiteId from JWT claims in base controller
```csharp
protected short GetClientId()
{
    var clientIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "ClientID");
    return short.TryParse(clientIdClaim?.Value, out short clientId) ? clientId : (short)1;
}
```
**Applied In:** All UserLogin API endpoints

### Issue: Session Management Endpoint Inconsistencies
**Symptoms:** Some session endpoints work, others return unexpected results
**Root Cause:** Inconsistent parameter validation and response formatting
**Solution:** Standardize all session management endpoints
**Pattern:** Use consistent validation and response patterns across related endpoints
```csharp
[HttpGet("sessions/{userId}")]
[Authorize]
public async Task<IActionResult> GetActiveSessions(int userId)
{
    if (userId <= 0)
    {
        Logger.LogWarning("Invalid user ID requested for active sessions: {UserId}", userId);
        return BadRequest("Invalid user ID");
    }

    var result = await _userLoginService.GetActiveSessionsAsync(userId);
    return Ok(result); // Consistent response format
}
```
**Applied In:** UserLogin session management endpoints

## Authentication & Authorization Issues

### Issue: JWT Token Expiration Not Handled Gracefully
**Symptoms:** API returns 401 but frontend doesn't refresh token automatically
**Root Cause:** No automatic token refresh mechanism
**Solution:** Implement token refresh interceptor
**Code Example:**
```javascript
// API interceptor for token refresh
axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response.status === 401) {
            const newToken = await refreshToken();
            if (newToken) {
                error.config.headers.Authorization = `Bearer ${newToken}`;
                return axios.request(error.config);
            }
        }
        return Promise.reject(error);
    }
);
```
**Pattern:** Implement automatic token refresh for better UX

### Issue: CORS Errors Blocking Frontend Requests
**Symptoms:** Browser blocks API requests with CORS policy errors
**Root Cause:** CORS not configured properly for development/production environments
**Solution:** Configure CORS policy correctly
**Code Example:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://localhost:3000", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### Issue: API Accessible Without Authentication
**Symptoms:** Sensitive endpoints can be accessed without proper authentication
**Root Cause:** Missing [Authorize] attributes or incorrect authorization setup
**Solution:** Apply proper authorization attributes
**Code Example:**
```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SecureController : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminOnly()
    {
        // Implementation
    }
}
```

## Request Validation Issues

### Issue: Invalid Data Reaching Business Logic
**Symptoms:** Services receive malformed or invalid data
**Root Cause:** Missing or insufficient input validation
**Solution:** Implement comprehensive model validation
**Code Example:**
```csharp
public class CreateUserRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [MinLength(8)]
    public string Password { get; set; }
}

[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }
    // Process valid request
}
```

### Issue: Mass Assignment Vulnerabilities
**Symptoms:** Unintended properties being modified through API requests
**Root Cause:** Accepting entire model objects without filtering
**Solution:** Use specific DTOs for API operations
**Code Example:**
```csharp
// Don't accept domain models directly
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateUserDto request) // Use DTO
{
    var user = _mapper.Map<User>(request); // Map to domain model
    // Process
}
```
**Pattern:** Always use DTOs for API boundaries, never expose domain models directly

## Response Handling Issues

### Issue: Sensitive Data Leaked in API Responses
**Symptoms:** Passwords, internal IDs, or sensitive fields returned to client
**Root Cause:** Returning domain models directly without filtering
**Solution:** Use response DTOs with only necessary fields
**Code Example:**
```csharp
public class UserResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    // Note: No Password field
}

[HttpGet("{id}")]
public async Task<IActionResult> Get(int id)
{
    var user = await _service.GetByIdAsync(id);
    var response = _mapper.Map<UserResponseDto>(user);
    return Ok(response);
}
```

### Issue: Large Response Payloads Causing Timeouts
**Symptoms:** API requests timing out or consuming excessive bandwidth
**Root Cause:** Returning too much data in single response
**Solution:** Implement pagination and field selection
**Code Example:**
```csharp
[HttpGet]
public async Task<IActionResult> Get([FromQuery] PaginationRequest request)
{
    var result = await _service.GetPaginatedAsync(request.Offset, request.Limit);
    return Ok(new PaginatedResponse<UserDto>
    {
        Data = result.Items,
        Offset = request.Offset,
        Limit = request.Limit,
        TotalCount = result.TotalCount
    });
}
```

## Error Handling Issues

### Issue: Unhandled Exceptions Returning Stack Traces
**Symptoms:** Internal server errors expose sensitive system information
**Root Cause:** No global exception handling middleware
**Solution:** Implement global exception handler
**Code Example:**
```csharp
public class GlobalExceptionMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";
        
        var response = new ApiResponse<object>
        {
            Success = false,
            Message = "An error occurred processing your request"
        };

        switch (ex)
        {
            case NotFoundException:
                context.Response.StatusCode = 404;
                response.Message = "Resource not found";
                break;
            case ValidationException:
                context.Response.StatusCode = 400;
                response.Message = ex.Message;
                break;
            default:
                context.Response.StatusCode = 500;
                // Don't expose internal errors in production
                break;
        }

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
```

### Issue: Inconsistent HTTP Status Codes
**Symptoms:** API returns 200 OK even for error conditions
**Root Cause:** Not following HTTP status code conventions
**Solution:** Use appropriate HTTP status codes
**Code Example:**
```csharp
[HttpGet("{id}")]
public async Task<IActionResult> Get(int id)
{
    var user = await _service.GetByIdAsync(id);
    if (user == null)
        return NotFound(); // 404

    return Ok(user); // 200
}

[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState); // 400

    var user = await _service.CreateAsync(request);
    return CreatedAtAction(nameof(Get), new { id = user.Id }, user); // 201
}
```

## Performance Issues

### Issue: N+1 Query Problems from API Endpoints
**Symptoms:** Database queries multiplying with each API request
**Root Cause:** Lazy loading causing additional queries in loops
**Solution:** Use explicit loading or projection
**Code Example:**
```csharp
// Problem: N+1 queries
var users = await context.Users.ToListAsync();
foreach(var user in users)
{
    Console.WriteLine(user.Orders.Count); // Each access hits database
}

// Solution: Include related data
var users = await context.Users
    .Include(u => u.Orders)
    .ToListAsync();
```

### Issue: API Endpoints Without Rate Limiting
**Symptoms:** API can be overwhelmed by too many requests
**Root Cause:** No rate limiting implemented
**Solution:** Implement rate limiting middleware
**Code Example:**
```csharp
// Configure rate limiting
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "*",
            Period = "1m",
            Limit = 60
        }
    };
});
```

## API Documentation Issues

### Issue: API Documentation Out of Date
**Symptoms:** Frontend developers using incorrect endpoint information
**Root Cause:** Manual documentation not updated with code changes
**Solution:** Use Swagger/OpenAPI with code annotations
**Code Example:**
```csharp
/// <summary>
/// Creates a new user account
/// </summary>
/// <param name="request">User creation details</param>
/// <returns>Created user information</returns>
/// <response code="201">User created successfully</response>
/// <response code="400">Invalid request data</response>
[HttpPost]
[ProducesResponseType(typeof(UserResponseDto), 201)]
[ProducesResponseType(400)]
public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
{
    // Implementation
}
```

### Issue: Missing API Examples in Documentation
**Symptoms:** Developers struggling to understand API usage
**Root Cause:** Documentation lacks practical examples
**Solution:** Include comprehensive examples in Swagger
**Code Example:**
```csharp
[SwaggerOperation(
    Summary = "Create user",
    Description = "Creates a new user account with the provided information"
)]
[SwaggerRequestExample(typeof(CreateUserRequest), typeof(CreateUserRequestExample))]
public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
{
    // Implementation
}
```

## Versioning Issues

### Issue: Breaking Changes Affecting Existing Clients
**Symptoms:** Mobile app or frontend stops working after API updates
**Root Cause:** No API versioning strategy
**Solution:** Implement API versioning
**Code Example:**
```csharp
[ApiVersion("1.0")]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/users")]
public class UsersController : ControllerBase
{
    [HttpGet]
    [MapToApiVersion("1.0")]
    public async Task<IActionResult> GetV1()
    {
        // V1 implementation
    }

    [HttpGet]
    [MapToApiVersion("2.0")]
    public async Task<IActionResult> GetV2()
    {
        // V2 implementation with new features
    }
}
```

## Content Type Issues

### Issue: API Not Accepting JSON Requests
**Symptoms:** 415 Unsupported Media Type errors
**Root Cause:** Content-Type header not properly configured
**Solution:** Ensure proper content type configuration
**Code Example:**
```csharp
[HttpPost]
[Consumes("application/json")]
[Produces("application/json")]
public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
{
    // Implementation
}
```

### Issue: File Upload Endpoints Not Working
**Symptoms:** File uploads fail or receive empty files
**Root Cause:** Incorrect form encoding or file handling
**Solution:** Use proper multipart form handling
**Code Example:**
```csharp
[HttpPost("upload")]
public async Task<IActionResult> UploadFile(IFormFile file)
{
    if (file == null || file.Length == 0)
        return BadRequest("No file uploaded");

    // Process file
    using var stream = file.OpenReadStream();
    // Handle file processing
    
    return Ok(new { FileName = file.FileName, Size = file.Length });
}
```

## Testing API Issues

### Issue: API Tests Not Covering Edge Cases
**Symptoms:** Production issues that weren't caught in testing
**Root Cause:** Insufficient test coverage of error scenarios
**Solution:** Test all scenarios including edge cases
**Code Example:**
```csharp
[Test]
public async Task Create_WithInvalidEmail_Returns400()
{
    var request = new CreateUserRequest
    {
        Name = "Test User",
        Email = "invalid-email", // Invalid format
        Password = "password123"
    };

    var response = await _client.PostAsJsonAsync("/api/users", request);

    Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
}
```

---

## API Design Patterns

### RESTful Resource Design
- Use nouns for resources: `/api/users` not `/api/getUsers`
- Use HTTP verbs for actions: GET, POST, PUT, DELETE
- Use hierarchical URLs: `/api/users/123/orders`

### Consistent Response Format
Always return responses in the same structure:
```json
{
    "success": true,
    "data": {...},
    "message": "Operation completed",
    "errors": []
}
```

### Error Response Format
Standardize error responses:
```json
{
    "success": false,
    "data": null,
    "message": "Validation failed",
    "errors": ["Email is required", "Password too short"]
}
```

## How to Use This Guide

1. **Check Status Codes:** Verify you're using appropriate HTTP status codes
2. **Review Response Format:** Ensure consistent response structure
3. **Validate Security:** Check authentication, authorization, and data exposure
4. **Test Edge Cases:** Verify error handling and validation
5. **Document Changes:** Update API documentation with any modifications

## Contributing to This Guide

When adding new API issues:
1. Include HTTP status codes and response examples
2. Show both problem and solution code
3. Focus on REST principles and security concerns
4. Include testing patterns for the solution