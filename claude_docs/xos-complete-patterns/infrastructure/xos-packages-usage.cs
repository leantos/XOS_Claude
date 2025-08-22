// ===== XOS PACKAGES USAGE COMPLETE PATTERNS =====
// This file contains EVERY XOS package usage pattern for the framework
// Follow XOS.Core, XOS.Data, XOS.Security patterns EXACTLY

using CVS.Transaction.Core;
using Microsoft.Extensions.Logging;
using System.Text;
using XOS.Core;
using XOS.Data;
using XOS.Security;
using XOS.Reporting;
using XOS.Notification;
using XOS.FileManager;
using XOS.Caching;
using XOS.Audit;
using XOS.Configuration;

namespace CVS.Transaction.Infrastructure
{
    // ===== SECTION 1: XOS.CORE USAGE PATTERNS =====
    
    /// <summary>
    /// ⚠️ CRITICAL: XOS.Core utilities usage
    /// Always use XOS utilities instead of custom implementations
    /// </summary>
    public class XOSCoreExamples
    {
        #region String Utilities
        
        /// <summary>
        /// ✅ CORRECT: XOS string utilities
        /// </summary>
        public void StringUtilityExamples()
        {
            // String validation
            var isValidEmail = XOSStringUtils.IsValidEmail("user@example.com");
            var isValidPhone = XOSStringUtils.IsValidPhone("+1-555-123-4567");
            var isValidUrl = XOSStringUtils.IsValidUrl("https://example.com");
            
            // String formatting
            var formattedPhone = XOSStringUtils.FormatPhone("5551234567");
            var formattedCurrency = XOSStringUtils.FormatCurrency(1234.56m, "USD");
            var truncatedText = XOSStringUtils.Truncate("Long text here", 50);
            
            // String cleaning
            var sanitizedInput = XOSStringUtils.SanitizeInput("User <script>alert('xss')</script> input");
            var cleanedHtml = XOSStringUtils.StripHtml("<p>Hello <strong>world</strong></p>");
            
            // Encoding/Decoding
            var base64Encoded = XOSStringUtils.ToBase64("Hello World");
            var base64Decoded = XOSStringUtils.FromBase64(base64Encoded);
            var urlEncoded = XOSStringUtils.UrlEncode("Hello World & More");
        }
        
        #endregion
        
        #region Date/Time Utilities
        
        /// <summary>
        /// ✅ CORRECT: XOS date/time utilities
        /// </summary>
        public void DateTimeUtilityExamples()
        {
            // Time zone conversions
            var utcNow = XOSDateUtils.GetUtcNow();
            var userLocalTime = XOSDateUtils.ConvertToUserTimeZone(utcNow, "America/New_York");
            var systemTime = XOSDateUtils.ConvertToSystemTimeZone(userLocalTime);
            
            // Business date calculations
            var nextBusinessDay = XOSDateUtils.GetNextBusinessDay(DateTime.Today);
            var businessDaysBetween = XOSDateUtils.GetBusinessDaysBetween(DateTime.Today, DateTime.Today.AddDays(10));
            var isBusinessDay = XOSDateUtils.IsBusinessDay(DateTime.Today);
            
            // Date formatting
            var shortDate = XOSDateUtils.FormatShortDate(DateTime.Today);
            var longDate = XOSDateUtils.FormatLongDate(DateTime.Today);
            var isoDate = XOSDateUtils.FormatIsoDate(DateTime.UtcNow);
            
            // Age calculations
            var age = XOSDateUtils.CalculateAge(new DateTime(1990, 5, 15));
            var daysSince = XOSDateUtils.DaysBetween(DateTime.Today.AddDays(-30), DateTime.Today);
        }
        
        #endregion
        
        #region Validation Utilities
        
        /// <summary>
        /// ✅ CORRECT: XOS validation utilities
        /// </summary>
        public ValidationResult ValidateInputExamples(object input)
        {
            var validator = new XOSValidator();
            
            // Basic validations
            validator.Required(input, "Input is required");
            validator.MinLength(input?.ToString(), 5, "Minimum 5 characters required");
            validator.MaxLength(input?.ToString(), 100, "Maximum 100 characters allowed");
            validator.Range(Convert.ToInt32(input), 1, 1000, "Value must be between 1 and 1000");
            
            // Pattern validations
            validator.Email(input?.ToString(), "Invalid email format");
            validator.Phone(input?.ToString(), "Invalid phone format");
            validator.Url(input?.ToString(), "Invalid URL format");
            validator.Regex(input?.ToString(), @"^\d{3}-\d{2}-\d{4}$", "Invalid SSN format");
            
            // Custom validations
            validator.Custom(() => IsValidCustomRule(input), "Custom validation failed");
            
            return validator.GetResult();
        }
        
        private bool IsValidCustomRule(object input)
        {
            // Custom business logic validation
            return input != null && input.ToString().Length > 0;
        }
        
        #endregion
        
        #region Encryption Utilities
        
        /// <summary>
        /// ✅ CORRECT: XOS encryption utilities
        /// </summary>
        public void EncryptionExamples()
        {
            var plainText = "Sensitive data to encrypt";
            var key = "MySecretKey123!";
            
            // AES encryption
            var encrypted = XOSEncryption.EncryptAES(plainText, key);
            var decrypted = XOSEncryption.DecryptAES(encrypted, key);
            
            // Hash functions
            var md5Hash = XOSEncryption.ComputeMD5(plainText);
            var sha256Hash = XOSEncryption.ComputeSHA256(plainText);
            var sha512Hash = XOSEncryption.ComputeSHA512(plainText);
            
            // Password hashing
            var hashedPassword = XOSEncryption.HashPassword("MyPassword123!");
            var isValidPassword = XOSEncryption.VerifyPassword("MyPassword123!", hashedPassword);
            
            // JWT tokens
            var token = XOSEncryption.GenerateJWT(new { UserId = 123, Role = "Admin" }, key, TimeSpan.FromHours(24));
            var isValidToken = XOSEncryption.ValidateJWT(token, key, out var payload);
        }
        
        #endregion
    }
    
    // ===== SECTION 2: XOS.DATA USAGE PATTERNS =====
    
    /// <summary>
    /// ⚠️ CRITICAL: XOS.Data patterns
    /// Always use XOS data utilities for database operations
    /// </summary>
    public class XOSDataExamples
    {
        #region Connection Management
        
        /// <summary>
        /// ✅ CORRECT: XOS connection factory
        /// </summary>
        public void ConnectionExamples()
        {
            // Get connection factory
            var connectionFactory = XOSConnectionFactory.Instance;
            
            // Create connections for different clients
            using (var connection1 = connectionFactory.CreateConnection("client1"))
            using (var connection2 = connectionFactory.CreateConnection("client2"))
            {
                // Use connections for operations
                var isAlive1 = connectionFactory.TestConnection("client1");
                var isAlive2 = connectionFactory.TestConnection("client2");
            }
            
            // Connection pooling info
            var poolStats = connectionFactory.GetPoolStatistics("client1");
            var activeConnections = poolStats.ActiveConnections;
            var totalConnections = poolStats.TotalConnections;
        }
        
        #endregion
        
        #region Query Builder Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS query builder
        /// </summary>
        public void QueryBuilderExamples()
        {
            var queryBuilder = new XOSQueryBuilder();
            
            // SELECT queries
            var selectQuery = queryBuilder
                .Select("id", "name", "email", "created_at")
                .From("users")
                .Where("client_id", "=", "@client_id")
                .And("is_active", "=", true)
                .And("created_at", ">=", "@start_date")
                .OrderBy("name")
                .ThenBy("created_at", false)
                .Limit(10)
                .Offset(20)
                .Build();
            
            // INSERT queries
            var insertQuery = queryBuilder.Clear()
                .InsertInto("users")
                .Values(new Dictionary<string, object>
                {
                    ["client_id"] = "@client_id",
                    ["name"] = "@name",
                    ["email"] = "@email",
                    ["created_at"] = "@created_at"
                })
                .Returning("id")
                .Build();
            
            // UPDATE queries
            var updateQuery = queryBuilder.Clear()
                .Update("users")
                .Set("name", "@name")
                .Set("email", "@email")
                .Set("updated_at", "@updated_at")
                .Where("id", "=", "@id")
                .And("client_id", "=", "@client_id")
                .Build();
            
            // Complex JOIN queries
            var joinQuery = queryBuilder.Clear()
                .Select("u.id", "u.name", "r.name as role_name", "d.name as dept_name")
                .From("users u")
                .LeftJoin("roles r", "u.role_id", "r.id")
                .InnerJoin("departments d", "u.dept_id", "d.id")
                .Where("u.client_id", "=", "@client_id")
                .GroupBy("u.id", "u.name", "r.name", "d.name")
                .Having("COUNT(u.id)", ">", 0)
                .Build();
        }
        
        #endregion
        
        #region Repository Pattern with XOS
        
        /// <summary>
        /// ✅ CORRECT: XOS repository base class usage
        /// </summary>
        public class UserRepository : XOSRepositoryBase<User>
        {
            public UserRepository(IServiceProvider serviceProvider, ILogger<UserRepository> logger)
                : base(serviceProvider, logger, "users")
            {
            }
            
            // Override mapping
            protected override User MapEntity(IDataReader reader)
            {
                return new User
                {
                    ID = reader.GetValue<int>("id"),
                    Name = reader.GetValue<string>("name"),
                    Email = reader.GetValue<string>("email"),
                    IsActive = reader.GetValue<bool>("is_active"),
                    CreatedAt = reader.GetValue<DateTime>("created_at"),
                    UpdatedAt = reader.GetValue<DateTime?>("updated_at")
                };
            }
            
            // Custom methods using XOS patterns
            public async Task<List<User>> GetActiveUsersAsync(int clientId)
            {
                var query = QueryBuilder
                    .Select("*")
                    .From(TableName)
                    .Where("client_id", "=", "@client_id")
                    .And("is_active", "=", true)
                    .OrderBy("name")
                    .Build();
                
                var parameters = new DBParameters();
                parameters.Add("@client_id", clientId);
                
                return await ExecuteQueryAsync(query, parameters, clientId.ToString());
            }
            
            public async Task<PagedResult<User>> GetPagedUsersAsync(int clientId, int page, int pageSize, string search = null)
            {
                var queryBuilder = QueryBuilder.Clear().From(TableName).Where("client_id", "=", "@client_id");
                
                if (!string.IsNullOrWhiteSpace(search))
                {
                    queryBuilder.And("name", "ILIKE", "@search");
                }
                
                var parameters = new DBParameters();
                parameters.Add("@client_id", clientId);
                parameters.Add("@search", $"%{search}%");
                
                return await ExecutePagedQueryAsync(queryBuilder.Build(), parameters, page, pageSize, clientId.ToString());
            }
        }
        
        #endregion
    }
    
    // ===== SECTION 3: XOS.SECURITY USAGE PATTERNS =====
    
    /// <summary>
    /// ⚠️ CRITICAL: XOS Security patterns
    /// Always use XOS security utilities for authentication and authorization
    /// </summary>
    public class XOSSecurityExamples
    {
        #region Authentication Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS authentication service
        /// </summary>
        public async Task<AuthenticationResult> AuthenticateUserAsync(LoginRequest request)
        {
            var authService = XOSAuthenticationService.Instance;
            
            // Basic authentication
            var result = await authService.AuthenticateAsync(request.Username, request.Password, request.ClientId);
            
            if (result.IsSuccess)
            {
                // Generate tokens
                var accessToken = await authService.GenerateAccessTokenAsync(result.User);
                var refreshToken = await authService.GenerateRefreshTokenAsync(result.User);
                
                // Store session
                await authService.CreateSessionAsync(result.User, accessToken, refreshToken);
                
                return new AuthenticationResult
                {
                    IsSuccess = true,
                    User = result.User,
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddHours(24)
                };
            }
            
            return new AuthenticationResult { IsSuccess = false, ErrorMessage = result.ErrorMessage };
        }
        
        /// <summary>
        /// ✅ CORRECT: Token validation
        /// </summary>
        public async Task<ValidationResult> ValidateTokenAsync(string token)
        {
            var authService = XOSAuthenticationService.Instance;
            
            var validation = await authService.ValidateTokenAsync(token);
            
            if (validation.IsValid)
            {
                // Refresh token if needed
                if (validation.ExpiresWithin(TimeSpan.FromMinutes(15)))
                {
                    var newToken = await authService.RefreshTokenAsync(validation.User);
                    return new ValidationResult
                    {
                        IsValid = true,
                        User = validation.User,
                        RefreshedToken = newToken
                    };
                }
            }
            
            return validation;
        }
        
        #endregion
        
        #region Authorization Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS authorization service
        /// </summary>
        public async Task<bool> CheckUserPermissionsAsync(int userId, string resource, string action)
        {
            var authzService = XOSAuthorizationService.Instance;
            
            // Check specific permission
            var hasPermission = await authzService.HasPermissionAsync(userId, resource, action);
            
            // Check role-based access
            var hasRoleAccess = await authzService.HasRoleAccessAsync(userId, resource);
            
            // Check attribute-based access
            var context = new AuthorizationContext
            {
                UserId = userId,
                Resource = resource,
                Action = action,
                Attributes = new Dictionary<string, object>
                {
                    ["Department"] = "IT",
                    ["Level"] = "Senior",
                    ["Region"] = "North America"
                }
            };
            
            var hasAttributeAccess = await authzService.EvaluatePolicyAsync(context);
            
            return hasPermission && hasRoleAccess && hasAttributeAccess;
        }
        
        /// <summary>
        /// ✅ CORRECT: XOS security attributes usage
        /// </summary>
        [XOSSecureEndpoint(RequiredPermission = "USER_VIEW")]
        [XOSRoleRequired("Admin", "Manager")]
        public async Task<List<User>> GetSecureDataAsync(int clientId)
        {
            // This method is automatically secured by XOS attributes
            var authContext = XOSSecurityContext.Current;
            var currentUser = authContext.User;
            var permissions = authContext.Permissions;
            
            // Business logic here
            return new List<User>();
        }
        
        #endregion
        
        #region Data Protection Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS data protection
        /// </summary>
        public void DataProtectionExamples()
        {
            var dataProtection = XOSDataProtection.Instance;
            
            // Encrypt sensitive data
            var encryptedSSN = dataProtection.Protect("123-45-6789", DataProtectionScope.PersonalData);
            var decryptedSSN = dataProtection.Unprotect(encryptedSSN, DataProtectionScope.PersonalData);
            
            // Hash passwords
            var passwordHash = dataProtection.HashPassword("MySecurePassword123!");
            var isValidPassword = dataProtection.VerifyPassword("MySecurePassword123!", passwordHash);
            
            // Mask sensitive data for logging
            var maskedEmail = dataProtection.MaskEmail("user@example.com"); // Returns: u***@e***.com
            var maskedPhone = dataProtection.MaskPhone("555-123-4567"); // Returns: ***-***-4567
            var maskedSSN = dataProtection.MaskSSN("123-45-6789"); // Returns: ***-**-6789
        }
        
        #endregion
    }
    
    // ===== SECTION 4: XOS.REPORTING USAGE PATTERNS =====
    
    /// <summary>
    /// ⚠️ CRITICAL: XOS Reporting patterns
    /// Always use XOS reporting services for report generation
    /// </summary>
    public class XOSReportingExamples
    {
        #region Report Generation Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS report service usage
        /// </summary>
        public async Task<ReportResult> GenerateReportAsync(ReportRequest request)
        {
            var reportService = XOSReportingService.Instance;
            
            // Create report definition
            var reportDef = new ReportDefinition
            {
                Name = "User Activity Report",
                DataSource = "UserActivityView",
                Parameters = request.Parameters,
                Columns = new List<ReportColumn>
                {
                    new ReportColumn { Name = "Name", DisplayName = "User Name", Type = ColumnType.String },
                    new ReportColumn { Name = "LastLogin", DisplayName = "Last Login", Type = ColumnType.DateTime },
                    new ReportColumn { Name = "LoginCount", DisplayName = "Login Count", Type = ColumnType.Integer }
                },
                Filters = new List<ReportFilter>
                {
                    new ReportFilter { Column = "CreatedAt", Operator = ">=", Value = request.StartDate },
                    new ReportFilter { Column = "CreatedAt", Operator = "<=", Value = request.EndDate }
                },
                Sorting = new List<ReportSort>
                {
                    new ReportSort { Column = "LastLogin", Direction = SortDirection.Descending }
                }
            };
            
            // Generate report in different formats
            switch (request.Format.ToUpper())
            {
                case "PDF":
                    return await reportService.GeneratePdfAsync(reportDef);
                case "EXCEL":
                    return await reportService.GenerateExcelAsync(reportDef);
                case "CSV":
                    return await reportService.GenerateCsvAsync(reportDef);
                case "JSON":
                    return await reportService.GenerateJsonAsync(reportDef);
                default:
                    throw new ArgumentException("Unsupported report format");
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Chart generation with XOS
        /// </summary>
        public async Task<ChartResult> GenerateChartAsync(ChartRequest request)
        {
            var chartService = XOSChartService.Instance;
            
            var chartDef = new ChartDefinition
            {
                Type = request.ChartType, // Bar, Line, Pie, etc.
                Title = request.Title,
                DataSource = request.DataSource,
                XAxis = new ChartAxis { Column = request.XColumn, Label = request.XLabel },
                YAxis = new ChartAxis { Column = request.YColumn, Label = request.YLabel },
                Series = request.Series,
                Colors = request.Colors ?? XOSChartDefaults.DefaultColors,
                Width = request.Width ?? 800,
                Height = request.Height ?? 600
            };
            
            return await chartService.GenerateAsync(chartDef);
        }
        
        #endregion
        
        #region Dashboard Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS dashboard service
        /// </summary>
        public async Task<DashboardResult> GenerateDashboardAsync(int userId, string dashboardId)
        {
            var dashboardService = XOSDashboardService.Instance;
            
            // Get dashboard definition
            var dashboard = await dashboardService.GetDashboardAsync(dashboardId);
            
            // Apply user-specific filters
            dashboard.ApplyUserContext(userId);
            
            // Generate widgets
            var widgets = new List<DashboardWidget>();
            
            foreach (var widgetDef in dashboard.Widgets)
            {
                var widget = await dashboardService.GenerateWidgetAsync(widgetDef);
                widgets.Add(widget);
            }
            
            return new DashboardResult
            {
                Dashboard = dashboard,
                Widgets = widgets,
                GeneratedAt = DateTime.UtcNow
            };
        }
        
        #endregion
    }
    
    // ===== SECTION 5: XOS.NOTIFICATION USAGE PATTERNS =====
    
    /// <summary>
    /// ⚠️ CRITICAL: XOS Notification patterns
    /// Always use XOS notification services for all communications
    /// </summary>
    public class XOSNotificationExamples
    {
        #region Email Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS email service usage
        /// </summary>
        public async Task<NotificationResult> SendEmailAsync(EmailRequest request)
        {
            var emailService = XOSEmailService.Instance;
            
            // Simple email
            var simpleResult = await emailService.SendAsync(
                to: request.To,
                subject: request.Subject,
                body: request.Body,
                isHtml: request.IsHtml
            );
            
            // Email with template
            var templateResult = await emailService.SendTemplateAsync(
                templateId: "welcome-email",
                to: request.To,
                data: new Dictionary<string, object>
                {
                    ["UserName"] = request.UserName,
                    ["ActivationLink"] = request.ActivationLink,
                    ["CompanyName"] = "Your Company"
                }
            );
            
            // Bulk email
            var bulkResult = await emailService.SendBulkAsync(
                recipients: request.Recipients,
                subject: request.Subject,
                body: request.Body,
                isHtml: request.IsHtml
            );
            
            return templateResult;
        }
        
        /// <summary>
        /// ✅ CORRECT: Email with attachments
        /// </summary>
        public async Task<NotificationResult> SendEmailWithAttachmentsAsync(EmailRequest request)
        {
            var emailService = XOSEmailService.Instance;
            
            var attachments = new List<EmailAttachment>();
            
            foreach (var file in request.Files)
            {
                attachments.Add(new EmailAttachment
                {
                    FileName = file.FileName,
                    Content = file.Content,
                    ContentType = file.ContentType
                });
            }
            
            return await emailService.SendWithAttachmentsAsync(
                to: request.To,
                subject: request.Subject,
                body: request.Body,
                attachments: attachments,
                isHtml: request.IsHtml
            );
        }
        
        #endregion
        
        #region SMS Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS SMS service usage
        /// </summary>
        public async Task<NotificationResult> SendSmsAsync(SmsRequest request)
        {
            var smsService = XOSSmsService.Instance;
            
            // Simple SMS
            var result = await smsService.SendAsync(
                to: request.PhoneNumber,
                message: request.Message
            );
            
            // SMS with template
            var templateResult = await smsService.SendTemplateAsync(
                templateId: "verification-code",
                to: request.PhoneNumber,
                data: new Dictionary<string, object>
                {
                    ["Code"] = request.VerificationCode,
                    ["CompanyName"] = "Your Company"
                }
            );
            
            return templateResult;
        }
        
        #endregion
        
        #region Push Notification Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS push notification service
        /// </summary>
        public async Task<NotificationResult> SendPushNotificationAsync(PushNotificationRequest request)
        {
            var pushService = XOSPushNotificationService.Instance;
            
            var notification = new PushNotification
            {
                Title = request.Title,
                Body = request.Body,
                Data = request.Data,
                Icon = request.Icon,
                Sound = request.Sound,
                Badge = request.Badge,
                ClickAction = request.ClickAction
            };
            
            // Send to specific users
            if (request.UserIds?.Any() == true)
            {
                return await pushService.SendToUsersAsync(request.UserIds, notification);
            }
            
            // Send to topic subscribers
            if (!string.IsNullOrWhiteSpace(request.Topic))
            {
                return await pushService.SendToTopicAsync(request.Topic, notification);
            }
            
            // Send to device tokens
            if (request.DeviceTokens?.Any() == true)
            {
                return await pushService.SendToDevicesAsync(request.DeviceTokens, notification);
            }
            
            return new NotificationResult { IsSuccess = false, ErrorMessage = "No valid recipients specified" };
        }
        
        #endregion
    }
    
    // ===== SECTION 6: OTHER XOS PACKAGES =====
    
    /// <summary>
    /// ⚠️ CRITICAL: Other XOS package patterns
    /// File management, caching, audit, configuration patterns
    /// </summary>
    public class OtherXOSPackageExamples
    {
        #region XOS.FileManager Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS file management
        /// </summary>
        public async Task<FileOperationResult> FileManagerExamples(IFormFile uploadedFile)
        {
            var fileManager = XOSFileManager.Instance;
            
            // File upload with validation
            var uploadResult = await fileManager.UploadAsync(uploadedFile, new FileUploadOptions
            {
                AllowedExtensions = new[] { ".pdf", ".doc", ".docx", ".jpg", ".png" },
                MaxSizeBytes = 10 * 1024 * 1024, // 10MB
                Path = "uploads/documents",
                GenerateUniqueFileName = true,
                ScanForViruses = true
            });
            
            if (uploadResult.IsSuccess)
            {
                // Generate thumbnail for images
                if (fileManager.IsImageFile(uploadResult.FilePath))
                {
                    await fileManager.GenerateThumbnailAsync(uploadResult.FilePath, 150, 150);
                }
                
                // Get file info
                var fileInfo = await fileManager.GetFileInfoAsync(uploadResult.FilePath);
                
                // Create secure download URL
                var downloadUrl = await fileManager.GenerateSecureUrlAsync(uploadResult.FilePath, TimeSpan.FromHours(1));
            }
            
            return uploadResult;
        }
        
        #endregion
        
        #region XOS.Caching Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS caching service
        /// </summary>
        public async Task<T> CachingExamples<T>(string cacheKey, Func<Task<T>> dataFactory)
        {
            var cacheService = XOSCacheService.Instance;
            
            // Try get from cache first
            var cached = await cacheService.GetAsync<T>(cacheKey);
            if (cached != null)
            {
                return cached;
            }
            
            // Not in cache, get data and cache it
            var data = await dataFactory();
            await cacheService.SetAsync(cacheKey, data, TimeSpan.FromMinutes(30));
            
            return data;
        }
        
        /// <summary>
        /// ✅ CORRECT: Distributed caching patterns
        /// </summary>
        public async Task DistributedCachingExamples()
        {
            var distributedCache = XOSDistributedCache.Instance;
            
            // Cache with tags for easy invalidation
            await distributedCache.SetWithTagsAsync("user:123", userData, 
                new[] { "users", "client:456" }, TimeSpan.FromHours(1));
            
            // Invalidate by tag
            await distributedCache.InvalidateByTagAsync("users");
            
            // Cache dependency
            await distributedCache.SetWithDependencyAsync("user:123:permissions", permissions,
                dependsOn: "user:123", TimeSpan.FromMinutes(15));
        }
        
        #endregion
        
        #region XOS.Audit Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS audit service
        /// </summary>
        public async Task AuditExamples(int userId, string action, object oldData, object newData)
        {
            var auditService = XOSAuditService.Instance;
            
            // Simple audit log
            await auditService.LogAsync(new AuditEntry
            {
                UserId = userId,
                Action = action,
                EntityType = "User",
                EntityId = "123",
                Timestamp = DateTime.UtcNow,
                Details = "User profile updated"
            });
            
            // Detailed audit with data changes
            await auditService.LogDataChangeAsync(new DataChangeAuditEntry
            {
                UserId = userId,
                Action = "UPDATE",
                EntityType = "User",
                EntityId = "123",
                OldData = oldData,
                NewData = newData,
                ChangedFields = auditService.GetChangedFields(oldData, newData),
                Timestamp = DateTime.UtcNow
            });
        }
        
        #endregion
        
        #region XOS.Configuration Patterns
        
        /// <summary>
        /// ✅ CORRECT: XOS configuration service
        /// </summary>
        public void ConfigurationExamples()
        {
            var configService = XOSConfigurationService.Instance;
            
            // Get configuration values
            var connectionString = configService.GetConnectionString("DefaultConnection");
            var apiKey = configService.GetSetting("ExternalApi:ApiKey");
            var maxRetries = configService.GetSetting<int>("ExternalApi:MaxRetries", 3);
            var isFeatureEnabled = configService.GetSetting<bool>("Features:NewDashboard", false);
            
            // Environment-specific settings
            var environment = configService.GetEnvironment();
            var isDevelopment = configService.IsDevelopment();
            var isProduction = configService.IsProduction();
            
            // Encrypted settings
            var encryptedValue = configService.GetEncryptedSetting("Database:Password");
            
            // Configuration with refresh
            configService.RegisterChangeCallback("Features:NewDashboard", (key, value) =>
            {
                // Handle configuration change
                Logger.LogInformation("Feature flag {Key} changed to {Value}", key, value);
            });
        }
        
        #endregion
    }
    
    // ===== SUPPORTING CLASSES =====
    
    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
    
    public class AuthenticationResult
    {
        public bool IsSuccess { get; set; }
        public User User { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string ErrorMessage { get; set; }
    }
    
    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string ClientId { get; set; }
    }
    
    public class ReportRequest
    {
        public Dictionary<string, object> Parameters { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Format { get; set; }
    }
    
    public class EmailRequest
    {
        public string To { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public bool IsHtml { get; set; }
        public string UserName { get; set; }
        public string ActivationLink { get; set; }
        public List<string> Recipients { get; set; }
        public List<FileData> Files { get; set; }
    }
    
    public class FileData
    {
        public string FileName { get; set; }
        public byte[] Content { get; set; }
        public string ContentType { get; set; }
    }
    
    public class User
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

// ❌ COMMON MISTAKES TO AVOID:
// 1. Not using XOS utilities and creating custom implementations
// 2. Not following XOS naming conventions for packages
// 3. Not using XOS validation utilities
// 4. Not leveraging XOS security features
// 5. Creating custom file management instead of using XOS.FileManager
// 6. Not using XOS caching services
// 7. Not implementing proper audit trails with XOS.Audit
// 8. Not using XOS configuration management
// 9. Creating custom notification systems
// 10. Not following XOS dependency injection patterns