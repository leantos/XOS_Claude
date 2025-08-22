// ===== MINIMAL APIS COMPLETE PATTERNS =====
// This file contains EVERY minimal API pattern for XOS Framework
// Follow XOS minimal API conventions and patterns EXACTLY

using CVS.Transaction.Core;
using CVS.Transaction.Domain;
using CVS.Transaction.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using XOS.Core;
using XOS.Data;
using XOS.Security;

namespace CVS.Transaction.API
{
    // ===== SECTION 1: BASIC MINIMAL API PATTERNS =====
    
    /// <summary>
    /// ⚠️ CRITICAL: XOS Minimal API extension methods
    /// Use these patterns for all minimal API implementations
    /// </summary>
    public static class MinimalApiExtensions
    {
        /// <summary>
        /// ✅ CORRECT: Main minimal API mapping method
        /// </summary>
        public static IEndpointRouteBuilder MapMinimalAPIs(this IEndpointRouteBuilder endpoints)
        {
            // Map all API groups
            endpoints.MapUserAPIs();
            endpoints.MapRoleAPIs();
            endpoints.MapReportAPIs();
            endpoints.MapFileAPIs();
            endpoints.MapNotificationAPIs();
            endpoints.MapSystemAPIs();
            
            return endpoints;
        }
        
        #region User APIs
        
        /// <summary>
        /// ✅ CORRECT: User minimal APIs with full CRUD
        /// </summary>
        public static IEndpointRouteBuilder MapUserAPIs(this IEndpointRouteBuilder endpoints)
        {
            var userGroup = endpoints.MapGroup("/users")
                .WithTags("Users")
                .RequireAuthorization()
                .AddEndpointFilter<XOSValidationFilter>()
                .AddEndpointFilter<XOSAuditFilter>();
            
            // GET /users - List all users with pagination
            userGroup.MapGet("/", async (
                [FromServices] IUserService userService,
                [FromServices] IHttpContextAccessor httpContextAccessor,
                [FromQuery] int page = 1,
                [FromQuery] int pageSize = 10,
                [FromQuery] string? search = null) =>
            {
                try
                {
                    var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                    var searchParams = new SearchParameters
                    {
                        Page = page,
                        PageSize = pageSize,
                        SearchText = search
                    };
                    
                    var result = await userService.GetAllAsync(searchParams, loginInfo);
                    
                    return Results.Ok(new ApiResponse<PagedResult<User>>
                    {
                        Success = true,
                        Data = result,
                        Message = "Users retrieved successfully"
                    });
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        title: "Error retrieving users",
                        detail: ex.Message,
                        statusCode: 500
                    );
                }
            })
            .WithName("GetUsers")
            .WithSummary("Get all users with pagination")
            .WithDescription("Retrieves a paginated list of users with optional search")
            .Produces<ApiResponse<PagedResult<User>>>(200)
            .Produces<ProblemDetails>(500);
            
            // GET /users/{id} - Get user by ID
            userGroup.MapGet("/{id:int}", async (
                [FromRoute] int id,
                [FromServices] IUserService userService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                try
                {
                    if (id <= 0)
                    {
                        return Results.BadRequest(new ApiResponse<object>
                        {
                            Success = false,
                            Message = "Invalid user ID"
                        });
                    }
                    
                    var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                    var user = await userService.GetByIdAsync(id, loginInfo.ClientID);
                    
                    if (user == null)
                    {
                        return Results.NotFound(new ApiResponse<object>
                        {
                            Success = false,
                            Message = "User not found"
                        });
                    }
                    
                    return Results.Ok(new ApiResponse<User>
                    {
                        Success = true,
                        Data = user,
                        Message = "User retrieved successfully"
                    });
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        title: "Error retrieving user",
                        detail: ex.Message,
                        statusCode: 500
                    );
                }
            })
            .WithName("GetUserById")
            .WithSummary("Get user by ID")
            .Produces<ApiResponse<User>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ApiResponse<object>>(404)
            .Produces<ProblemDetails>(500);
            
            // POST /users - Create new user
            userGroup.MapPost("/", async (
                [FromBody] CreateUserRequest request,
                [FromServices] IUserService userService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                try
                {
                    var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                    var user = new User
                    {
                        FirstName = request.FirstName,
                        LastName = request.LastName,
                        Email = request.Email,
                        Phone = request.Phone,
                        RoleId = request.RoleId,
                        DepartmentId = request.DepartmentId,
                        IsActive = request.IsActive,
                        IsEdit = false,
                        UserId = loginInfo.UserID
                    };
                    
                    var result = await userService.SaveAsync(user, loginInfo);
                    
                    if (result == "S")
                    {
                        return Results.Created($"/users/{user.ID}", new ApiResponse<User>
                        {
                            Success = true,
                            Data = user,
                            Message = "User created successfully"
                        });
                    }
                    else
                    {
                        return Results.BadRequest(new ApiResponse<string>
                        {
                            Success = false,
                            Data = result,
                            Message = "Failed to create user"
                        });
                    }
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        title: "Error creating user",
                        detail: ex.Message,
                        statusCode: 500
                    );
                }
            })
            .WithName("CreateUser")
            .WithSummary("Create new user")
            .Accepts<CreateUserRequest>("application/json")
            .Produces<ApiResponse<User>>(201)
            .Produces<ApiResponse<string>>(400)
            .Produces<ProblemDetails>(500);
            
            // PUT /users/{id} - Update user
            userGroup.MapPut("/{id:int}", async (
                [FromRoute] int id,
                [FromBody] UpdateUserRequest request,
                [FromServices] IUserService userService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                try
                {
                    if (id <= 0 || id != request.ID)
                    {
                        return Results.BadRequest(new ApiResponse<object>
                        {
                            Success = false,
                            Message = "Invalid user ID or ID mismatch"
                        });
                    }
                    
                    var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                    var user = new User
                    {
                        ID = request.ID,
                        FirstName = request.FirstName,
                        LastName = request.LastName,
                        Email = request.Email,
                        Phone = request.Phone,
                        RoleId = request.RoleId,
                        DepartmentId = request.DepartmentId,
                        IsActive = request.IsActive,
                        IsEdit = true,
                        UserId = loginInfo.UserID
                    };
                    
                    var result = await userService.SaveAsync(user, loginInfo);
                    
                    if (result == "S")
                    {
                        return Results.Ok(new ApiResponse<User>
                        {
                            Success = true,
                            Data = user,
                            Message = "User updated successfully"
                        });
                    }
                    else
                    {
                        return Results.BadRequest(new ApiResponse<string>
                        {
                            Success = false,
                            Data = result,
                            Message = "Failed to update user"
                        });
                    }
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        title: "Error updating user",
                        detail: ex.Message,
                        statusCode: 500
                    );
                }
            })
            .WithName("UpdateUser")
            .WithSummary("Update user")
            .Accepts<UpdateUserRequest>("application/json")
            .Produces<ApiResponse<User>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ProblemDetails>(500);
            
            // DELETE /users/{id} - Soft delete user
            userGroup.MapDelete("/{id:int}", async (
                [FromRoute] int id,
                [FromServices] IUserService userService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                try
                {
                    if (id <= 0)
                    {
                        return Results.BadRequest(new ApiResponse<object>
                        {
                            Success = false,
                            Message = "Invalid user ID"
                        });
                    }
                    
                    var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                    var result = await userService.SoftDeleteAsync(id, loginInfo);
                    
                    if (result == "S")
                    {
                        return Results.Ok(new ApiResponse<string>
                        {
                            Success = true,
                            Data = result,
                            Message = "User deleted successfully"
                        });
                    }
                    else
                    {
                        return Results.BadRequest(new ApiResponse<string>
                        {
                            Success = false,
                            Data = result,
                            Message = "Failed to delete user"
                        });
                    }
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        title: "Error deleting user",
                        detail: ex.Message,
                        statusCode: 500
                    );
                }
            })
            .WithName("DeleteUser")
            .WithSummary("Delete user")
            .Produces<ApiResponse<string>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ProblemDetails>(500);
            
            return endpoints;
        }
        
        #endregion
        
        #region Role APIs
        
        /// <summary>
        /// ✅ CORRECT: Role minimal APIs
        /// </summary>
        public static IEndpointRouteBuilder MapRoleAPIs(this IEndpointRouteBuilder endpoints)
        {
            var roleGroup = endpoints.MapGroup("/roles")
                .WithTags("Roles")
                .RequireAuthorization("ManagerOrAdmin");
            
            // GET /roles - Get all roles
            roleGroup.MapGet("/", async (
                [FromServices] IRoleService roleService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                var roles = await roleService.GetAllAsync(loginInfo.ClientID);
                
                return Results.Ok(new ApiResponse<List<Role>>
                {
                    Success = true,
                    Data = roles,
                    Message = "Roles retrieved successfully"
                });
            })
            .WithName("GetRoles")
            .WithSummary("Get all roles")
            .Produces<ApiResponse<List<Role>>>(200);
            
            // GET /roles/lookup - Get role lookup data
            roleGroup.MapGet("/lookup", async (
                [FromServices] IRoleService roleService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                var lookupData = await roleService.GetLookupDataAsync(loginInfo.ClientID);
                
                return Results.Ok(new ApiResponse<List<LookupItem>>
                {
                    Success = true,
                    Data = lookupData,
                    Message = "Role lookup data retrieved successfully"
                });
            })
            .WithName("GetRoleLookup")
            .WithSummary("Get role lookup data")
            .Produces<ApiResponse<List<LookupItem>>>(200);
            
            return endpoints;
        }
        
        #endregion
        
        #region Report APIs
        
        /// <summary>
        /// ✅ CORRECT: Report minimal APIs
        /// </summary>
        public static IEndpointRouteBuilder MapReportAPIs(this IEndpointRouteBuilder endpoints)
        {
            var reportGroup = endpoints.MapGroup("/reports")
                .WithTags("Reports")
                .RequireAuthorization();
            
            // POST /reports - Generate report
            reportGroup.MapPost("/", async (
                [FromBody] ReportRequest request,
                [FromServices] IReportService reportService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                var result = await reportService.GenerateReportAsync(request, loginInfo);
                
                return Results.Ok(new ApiResponse<ReportResult>
                {
                    Success = true,
                    Data = result,
                    Message = "Report generated successfully"
                });
            })
            .WithName("GenerateReport")
            .WithSummary("Generate report")
            .Accepts<ReportRequest>("application/json")
            .Produces<ApiResponse<ReportResult>>(200);
            
            // GET /reports/export/{format} - Export report
            reportGroup.MapGet("/export/{format}", async (
                [FromRoute] string format,
                [FromQuery] string reportId,
                [FromServices] IReportService reportService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                var exportData = await reportService.ExportReportAsync(reportId, format, loginInfo);
                
                var contentType = format.ToLower() switch
                {
                    "pdf" => "application/pdf",
                    "excel" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "csv" => "text/csv",
                    _ => "application/octet-stream"
                };
                
                var fileName = $"report_{DateTime.Now:yyyyMMdd_HHmmss}.{format}";
                
                return Results.File(exportData, contentType, fileName);
            })
            .WithName("ExportReport")
            .WithSummary("Export report in specified format")
            .Produces(200, typeof(FileResult));
            
            return endpoints;
        }
        
        #endregion
        
        #region File APIs
        
        /// <summary>
        /// ✅ CORRECT: File minimal APIs
        /// </summary>
        public static IEndpointRouteBuilder MapFileAPIs(this IEndpointRouteBuilder endpoints)
        {
            var fileGroup = endpoints.MapGroup("/files")
                .WithTags("Files")
                .RequireAuthorization()
                .DisableAntiforgery(); // For file uploads
            
            // POST /files/upload - Upload file
            fileGroup.MapPost("/upload", async (
                HttpRequest request,
                [FromServices] IFileService fileService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                try
                {
                    var form = await request.ReadFormAsync();
                    var file = form.Files.FirstOrDefault();
                    
                    if (file == null || file.Length == 0)
                    {
                        return Results.BadRequest(new ApiResponse<object>
                        {
                            Success = false,
                            Message = "No file provided"
                        });
                    }
                    
                    var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                    var result = await fileService.UploadFileAsync(file, loginInfo);
                    
                    if (result.IsSuccess)
                    {
                        return Results.Ok(new ApiResponse<FileUploadResult>
                        {
                            Success = true,
                            Data = result,
                            Message = "File uploaded successfully"
                        });
                    }
                    else
                    {
                        return Results.BadRequest(new ApiResponse<object>
                        {
                            Success = false,
                            Message = result.ErrorMessage
                        });
                    }
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        title: "Error uploading file",
                        detail: ex.Message,
                        statusCode: 500
                    );
                }
            })
            .WithName("UploadFile")
            .WithSummary("Upload file")
            .Accepts<IFormFile>("multipart/form-data")
            .Produces<ApiResponse<FileUploadResult>>(200)
            .Produces<ApiResponse<object>>(400)
            .Produces<ProblemDetails>(500);
            
            // GET /files/{id}/download - Download file
            fileGroup.MapGet("/{id:int}/download", async (
                [FromRoute] int id,
                [FromServices] IFileService fileService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                try
                {
                    var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                    var fileInfo = await fileService.GetFileInfoAsync(id, loginInfo);
                    
                    if (fileInfo == null)
                    {
                        return Results.NotFound();
                    }
                    
                    var fileBytes = await fileService.GetFileContentAsync(id, loginInfo);
                    
                    return Results.File(fileBytes, fileInfo.ContentType, fileInfo.FileName);
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        title: "Error downloading file",
                        detail: ex.Message,
                        statusCode: 500
                    );
                }
            })
            .WithName("DownloadFile")
            .WithSummary("Download file")
            .Produces(200, typeof(FileResult))
            .Produces(404)
            .Produces<ProblemDetails>(500);
            
            return endpoints;
        }
        
        #endregion
        
        // ===== SECTION 2: ADVANCED MINIMAL API PATTERNS =====
        
        #region Authentication & Authorization APIs
        
        /// <summary>
        /// ✅ CORRECT: Authentication minimal APIs
        /// </summary>
        public static IEndpointRouteBuilder MapAuthAPIs(this IEndpointRouteBuilder endpoints)
        {
            var authGroup = endpoints.MapGroup("/auth")
                .WithTags("Authentication")
                .AllowAnonymous();
            
            // POST /auth/login - User login
            authGroup.MapPost("/login", async (
                [FromBody] LoginRequest request,
                [FromServices] IAuthenticationService authService) =>
            {
                try
                {
                    var result = await authService.AuthenticateAsync(request.Username, request.Password, request.ClientId);
                    
                    if (result.IsSuccess)
                    {
                        return Results.Ok(new ApiResponse<AuthenticationResult>
                        {
                            Success = true,
                            Data = result,
                            Message = "Login successful"
                        });
                    }
                    else
                    {
                        return Results.Unauthorized(new ApiResponse<object>
                        {
                            Success = false,
                            Message = result.ErrorMessage
                        });
                    }
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        title: "Login error",
                        detail: ex.Message,
                        statusCode: 500
                    );
                }
            })
            .WithName("Login")
            .WithSummary("User login")
            .Accepts<LoginRequest>("application/json")
            .Produces<ApiResponse<AuthenticationResult>>(200)
            .Produces<ApiResponse<object>>(401)
            .Produces<ProblemDetails>(500);
            
            // POST /auth/refresh - Refresh token
            authGroup.MapPost("/refresh", async (
                [FromBody] RefreshTokenRequest request,
                [FromServices] IAuthenticationService authService) =>
            {
                var result = await authService.RefreshTokenAsync(request.RefreshToken);
                
                if (result.IsSuccess)
                {
                    return Results.Ok(new ApiResponse<TokenResult>
                    {
                        Success = true,
                        Data = result,
                        Message = "Token refreshed successfully"
                    });
                }
                else
                {
                    return Results.Unauthorized(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Invalid refresh token"
                    });
                }
            })
            .WithName("RefreshToken")
            .WithSummary("Refresh access token")
            .Accepts<RefreshTokenRequest>("application/json")
            .Produces<ApiResponse<TokenResult>>(200)
            .Produces<ApiResponse<object>>(401);
            
            // POST /auth/logout - User logout
            authGroup.MapPost("/logout", async (
                [FromServices] IAuthenticationService authService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                await authService.LogoutAsync(loginInfo.UserID);
                
                return Results.Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Logout successful"
                });
            })
            .WithName("Logout")
            .WithSummary("User logout")
            .RequireAuthorization()
            .Produces<ApiResponse<object>>(200);
            
            return endpoints;
        }
        
        #endregion
        
        #region Notification APIs
        
        /// <summary>
        /// ✅ CORRECT: Notification minimal APIs
        /// </summary>
        public static IEndpointRouteBuilder MapNotificationAPIs(this IEndpointRouteBuilder endpoints)
        {
            var notificationGroup = endpoints.MapGroup("/notifications")
                .WithTags("Notifications")
                .RequireAuthorization();
            
            // GET /notifications - Get user notifications
            notificationGroup.MapGet("/", async (
                [FromServices] INotificationService notificationService,
                [FromServices] IHttpContextAccessor httpContextAccessor,
                [FromQuery] bool unreadOnly = false) =>
            {
                var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                var notifications = await notificationService.GetUserNotificationsAsync(loginInfo.UserID, unreadOnly);
                
                return Results.Ok(new ApiResponse<List<Notification>>
                {
                    Success = true,
                    Data = notifications,
                    Message = "Notifications retrieved successfully"
                });
            })
            .WithName("GetNotifications")
            .WithSummary("Get user notifications")
            .Produces<ApiResponse<List<Notification>>>(200);
            
            // POST /notifications/send - Send notification
            notificationGroup.MapPost("/send", async (
                [FromBody] SendNotificationRequest request,
                [FromServices] INotificationService notificationService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                var result = await notificationService.SendNotificationAsync(request, loginInfo);
                
                return Results.Ok(new ApiResponse<NotificationResult>
                {
                    Success = true,
                    Data = result,
                    Message = "Notification sent successfully"
                });
            })
            .WithName("SendNotification")
            .WithSummary("Send notification")
            .Accepts<SendNotificationRequest>("application/json")
            .Produces<ApiResponse<NotificationResult>>(200);
            
            // PUT /notifications/{id}/read - Mark notification as read
            notificationGroup.MapPut("/{id:int}/read", async (
                [FromRoute] int id,
                [FromServices] INotificationService notificationService,
                [FromServices] IHttpContextAccessor httpContextAccessor) =>
            {
                var loginInfo = GetLoginInfo(httpContextAccessor.HttpContext);
                var result = await notificationService.MarkAsReadAsync(id, loginInfo.UserID);
                
                return Results.Ok(new ApiResponse<string>
                {
                    Success = true,
                    Data = result,
                    Message = "Notification marked as read"
                });
            })
            .WithName("MarkNotificationRead")
            .WithSummary("Mark notification as read")
            .Produces<ApiResponse<string>>(200);
            
            return endpoints;
        }
        
        #endregion
        
        #region System APIs
        
        /// <summary>
        /// ✅ CORRECT: System/utility minimal APIs
        /// </summary>
        public static IEndpointRouteBuilder MapSystemAPIs(this IEndpointRouteBuilder endpoints)
        {
            var systemGroup = endpoints.MapGroup("/system")
                .WithTags("System")
                .RequireAuthorization("AdminOnly");
            
            // GET /system/health - System health check
            systemGroup.MapGet("/health", async (
                [FromServices] ISystemService systemService) =>
            {
                var health = await systemService.GetSystemHealthAsync();
                
                return Results.Ok(new ApiResponse<SystemHealth>
                {
                    Success = true,
                    Data = health,
                    Message = "System health retrieved successfully"
                });
            })
            .WithName("GetSystemHealth")
            .WithSummary("Get system health status")
            .Produces<ApiResponse<SystemHealth>>(200);
            
            // GET /system/info - System information
            systemGroup.MapGet("/info", async (
                [FromServices] ISystemService systemService) =>
            {
                var info = await systemService.GetSystemInfoAsync();
                
                return Results.Ok(new ApiResponse<SystemInfo>
                {
                    Success = true,
                    Data = info,
                    Message = "System information retrieved successfully"
                });
            })
            .WithName("GetSystemInfo")
            .WithSummary("Get system information")
            .Produces<ApiResponse<SystemInfo>>(200);
            
            // POST /system/cache/clear - Clear system cache
            systemGroup.MapPost("/cache/clear", async (
                [FromServices] ISystemService systemService,
                [FromQuery] string? cacheKey = null) =>
            {
                var result = await systemService.ClearCacheAsync(cacheKey);
                
                return Results.Ok(new ApiResponse<string>
                {
                    Success = true,
                    Data = result,
                    Message = "Cache cleared successfully"
                });
            })
            .WithName("ClearCache")
            .WithSummary("Clear system cache")
            .Produces<ApiResponse<string>>(200);
            
            return endpoints;
        }
        
        #endregion
        
        // ===== SECTION 3: UTILITY METHODS =====
        
        #region Utility Methods
        
        /// <summary>
        /// ✅ CORRECT: Extract login info from HTTP context
        /// </summary>
        private static InputInfo GetLoginInfo(HttpContext httpContext)
        {
            return new InputInfo
            {
                UserID = int.Parse(httpContext.User.FindFirst("user_id")?.Value ?? "0"),
                ClientID = int.Parse(httpContext.User.FindFirst("client_id")?.Value ?? "0"),
                Username = httpContext.User.FindFirst("username")?.Value ?? "",
                RoleName = httpContext.User.FindFirst("role")?.Value ?? ""
            };
        }
        
        /// <summary>
        /// ✅ CORRECT: Add XOS endpoint filters
        /// </summary>
        public static TBuilder AddXOSFilters<TBuilder>(this TBuilder builder)
            where TBuilder : IEndpointConventionBuilder
        {
            return builder
                .AddEndpointFilter<XOSValidationFilter>()
                .AddEndpointFilter<XOSAuditFilter>()
                .AddEndpointFilter<XOSPerformanceFilter>();
        }
        
        #endregion
    }
    
    // ===== SECTION 4: ENDPOINT FILTERS =====
    
    /// <summary>
    /// ✅ CORRECT: XOS validation filter for minimal APIs
    /// </summary>
    public class XOSValidationFilter : IEndpointFilter
    {
        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            // Validate request model if it exists
            foreach (var argument in context.Arguments)
            {
                if (argument != null && argument.GetType().IsClass && argument.GetType() != typeof(string))
                {
                    var validationResults = new List<ValidationResult>();
                    var validationContext = new ValidationContext(argument);
                    
                    if (!Validator.TryValidateObject(argument, validationContext, validationResults, true))
                    {
                        var errors = validationResults.Select(r => r.ErrorMessage).ToList();
                        
                        return Results.BadRequest(new ApiResponse<object>
                        {
                            Success = false,
                            Message = "Validation failed",
                            Errors = errors
                        });
                    }
                }
            }
            
            return await next(context);
        }
    }
    
    /// <summary>
    /// ✅ CORRECT: XOS audit filter for minimal APIs
    /// </summary>
    public class XOSAuditFilter : IEndpointFilter
    {
        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            var httpContext = context.HttpContext;
            var endpoint = httpContext.GetEndpoint();
            var endpointName = endpoint?.DisplayName ?? "Unknown";
            
            // Log request
            var logger = httpContext.RequestServices.GetRequiredService<ILogger<XOSAuditFilter>>();
            logger.LogInformation("API Request: {Method} {Path} - Endpoint: {Endpoint}", 
                httpContext.Request.Method, httpContext.Request.Path, endpointName);
            
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            try
            {
                var result = await next(context);
                
                stopwatch.Stop();
                logger.LogInformation("API Response: {Endpoint} completed in {ElapsedMs}ms", 
                    endpointName, stopwatch.ElapsedMilliseconds);
                
                return result;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                logger.LogError(ex, "API Error: {Endpoint} failed after {ElapsedMs}ms", 
                    endpointName, stopwatch.ElapsedMilliseconds);
                throw;
            }
        }
    }
    
    /// <summary>
    /// ✅ CORRECT: XOS performance filter for minimal APIs
    /// </summary>
    public class XOSPerformanceFilter : IEndpointFilter
    {
        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            var httpContext = context.HttpContext;
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            var result = await next(context);
            
            stopwatch.Stop();
            
            // Add performance headers
            httpContext.Response.Headers.Add("X-Response-Time", $"{stopwatch.ElapsedMilliseconds}ms");
            
            // Log slow requests
            if (stopwatch.ElapsedMilliseconds > 1000) // Slow request threshold
            {
                var logger = httpContext.RequestServices.GetRequiredService<ILogger<XOSPerformanceFilter>>();
                logger.LogWarning("Slow API request: {Method} {Path} took {ElapsedMs}ms", 
                    httpContext.Request.Method, httpContext.Request.Path, stopwatch.ElapsedMilliseconds);
            }
            
            return result;
        }
    }
    
    // ===== SUPPORTING CLASSES =====
    
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
    
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
    
    public class SearchParameters
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SearchText { get; set; }
    }
    
    public class CreateUserRequest
    {
        [Required]
        public string FirstName { get; set; }
        
        [Required]
        public string LastName { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        
        public string Phone { get; set; }
        public int? RoleId { get; set; }
        public int? DepartmentId { get; set; }
        public bool IsActive { get; set; } = true;
    }
    
    public class UpdateUserRequest
    {
        public int ID { get; set; }
        
        [Required]
        public string FirstName { get; set; }
        
        [Required]
        public string LastName { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        
        public string Phone { get; set; }
        public int? RoleId { get; set; }
        public int? DepartmentId { get; set; }
        public bool IsActive { get; set; }
    }
    
    public class LoginRequest
    {
        [Required]
        public string Username { get; set; }
        
        [Required]
        public string Password { get; set; }
        
        [Required]
        public string ClientId { get; set; }
    }
    
    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; }
    }
    
    public class ReportRequest
    {
        public string ReportType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Dictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();
    }
    
    public class SendNotificationRequest
    {
        public List<int> UserIds { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
        public Dictionary<string, object> Data { get; set; }
    }
    
    // Domain classes
    public class User
    {
        public int ID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int? RoleId { get; set; }
        public int? DepartmentId { get; set; }
        public bool IsActive { get; set; }
        public bool IsEdit { get; set; }
        public int UserId { get; set; }
    }
    
    public class Role
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
    
    public class LookupItem
    {
        public int ID { get; set; }
        public string Text { get; set; }
        public string Value { get; set; }
    }
    
    public class ReportResult
    {
        public string ReportId { get; set; }
        public byte[] Data { get; set; }
        public string ContentType { get; set; }
        public string FileName { get; set; }
    }
    
    public class FileUploadResult
    {
        public bool IsSuccess { get; set; }
        public int FileId { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public long FileSize { get; set; }
        public string ErrorMessage { get; set; }
    }
    
    public class AuthenticationResult
    {
        public bool IsSuccess { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime ExpiresAt { get; set; }
        public User User { get; set; }
        public string ErrorMessage { get; set; }
    }
    
    public class TokenResult
    {
        public bool IsSuccess { get; set; }
        public string AccessToken { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
    
    public class Notification
    {
        public int ID { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    public class NotificationResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public int NotificationId { get; set; }
    }
    
    public class SystemHealth
    {
        public bool IsHealthy { get; set; }
        public Dictionary<string, string> Services { get; set; }
        public DateTime CheckedAt { get; set; }
    }
    
    public class SystemInfo
    {
        public string Version { get; set; }
        public string Environment { get; set; }
        public DateTime StartTime { get; set; }
        public long MemoryUsage { get; set; }
    }
    
    public class InputInfo
    {
        public int UserID { get; set; }
        public int ClientID { get; set; }
        public string Username { get; set; }
        public string RoleName { get; set; }
    }
}

// ❌ COMMON MISTAKES TO AVOID:
// 1. Not using proper route groups and tags
// 2. Missing authentication/authorization on endpoints
// 3. Not handling exceptions properly
// 4. Not using proper HTTP status codes
// 5. Not adding endpoint filters for validation/audit
// 6. Missing OpenAPI documentation attributes
// 7. Not following XOS naming conventions
// 8. Not extracting login info properly from context
// 9. Not using proper request/response models
// 10. Missing content type specifications for file operations