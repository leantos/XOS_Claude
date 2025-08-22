// ===== PROGRAM COMPLETE PATTERNS =====
// This file contains EVERY Program.cs startup configuration pattern for XOS Framework
// Follow XOS middleware and service registration patterns EXACTLY

using CVS.Transaction.Core;
using CVS.Transaction.Interfaces;
using CVS.Transaction.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
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

namespace CVS.Transaction
{
    // ===== SECTION 1: BASIC PROGRAM SETUP PATTERNS =====
    
    /// <summary>
    /// ⚠️ CRITICAL: Complete Program.cs setup for XOS Framework
    /// Follow this pattern exactly for all XOS applications
    /// </summary>
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            
            // ===== CONFIGURATION SETUP =====
            ConfigureConfiguration(builder);
            
            // ===== SERVICE REGISTRATION =====
            ConfigureServices(builder.Services, builder.Configuration);
            
            // ===== BUILD APPLICATION =====
            var app = builder.Build();
            
            // ===== MIDDLEWARE PIPELINE =====
            ConfigureMiddleware(app);
            
            // ===== ENDPOINTS =====
            ConfigureEndpoints(app);
            
            // ===== STARTUP TASKS =====
            ConfigureStartupTasks(app);
            
            app.Run();
        }
        
        #region Configuration Setup
        
        /// <summary>
        /// ✅ CORRECT: XOS configuration setup
        /// </summary>
        private static void ConfigureConfiguration(WebApplicationBuilder builder)
        {
            // Clear default providers and add XOS configuration
            builder.Configuration.Sources.Clear();
            
            // XOS configuration providers in order of priority
            builder.Configuration
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
                .AddXOSConfiguration(builder.Environment) // XOS-specific configuration
                .AddEnvironmentVariables("XOS_")
                .AddCommandLine(args)
                .AddUserSecrets<Program>(optional: true);
            
            // XOS configuration validation
            XOSConfigurationValidator.Validate(builder.Configuration);
        }
        
        #endregion
        
        #region Service Registration
        
        /// <summary>
        /// ✅ CORRECT: Complete XOS service registration
        /// </summary>
        private static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
        {
            // ===== CORE SERVICES =====
            RegisterCoreServices(services, configuration);
            
            // ===== XOS FRAMEWORK SERVICES =====
            RegisterXOSServices(services, configuration);
            
            // ===== AUTHENTICATION & AUTHORIZATION =====
            RegisterAuthenticationServices(services, configuration);
            
            // ===== API SERVICES =====
            RegisterApiServices(services, configuration);
            
            // ===== BUSINESS SERVICES =====
            RegisterBusinessServices(services);
            
            // ===== EXTERNAL SERVICES =====
            RegisterExternalServices(services, configuration);
            
            // ===== BACKGROUND SERVICES =====
            RegisterBackgroundServices(services);
        }
        
        /// <summary>
        /// ✅ CORRECT: Core service registration
        /// </summary>
        private static void RegisterCoreServices(IServiceCollection services, IConfiguration configuration)
        {
            // HTTP Client Factory
            services.AddHttpClient();
            
            // Memory Cache
            services.AddMemoryCache();
            
            // Distributed Cache (Redis)
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = configuration.GetConnectionString("Redis");
                options.InstanceName = "XOS_Cache";
            });
            
            // HTTP Context Accessor
            services.AddHttpContextAccessor();
            
            // Logging
            services.AddLogging(builder =>
            {
                builder.ClearProviders();
                builder.AddXOSLogger(configuration); // XOS logging provider
                builder.AddConsole();
                builder.AddDebug();
                
                if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Production")
                {
                    builder.AddXOSFileLogger(configuration);
                    builder.AddXOSEventLogger(configuration);
                }
            });
            
            // Health Checks
            services.AddHealthChecks()
                .AddCheck<XOSDatabaseHealthCheck>("database")
                .AddCheck<XOSRedisHealthCheck>("redis")
                .AddCheck<XOSFileSystemHealthCheck>("filesystem")
                .AddCheck<XOSExternalApiHealthCheck>("external-apis");
        }
        
        /// <summary>
        /// ✅ CORRECT: XOS framework service registration
        /// </summary>
        private static void RegisterXOSServices(IServiceCollection services, IConfiguration configuration)
        {
            // XOS Core Services
            services.AddXOSCore(options =>
            {
                options.ConnectionString = configuration.GetConnectionString("DefaultConnection");
                options.Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                options.EnableAuditing = true;
                options.EnableCaching = true;
                options.EnableFileManager = true;
            });
            
            // XOS Data Services
            services.AddXOSData(options =>
            {
                options.DatabaseProvider = DatabaseProvider.PostgreSQL;
                options.ConnectionPoolSize = 100;
                options.CommandTimeout = 30;
                options.EnableQueryLogging = configuration.GetValue<bool>("Database:EnableQueryLogging");
                options.EnableSensitiveDataLogging = false;
            });
            
            // XOS Security Services
            services.AddXOSSecurity(options =>
            {
                options.JwtSecret = configuration["Security:JwtSecret"];
                options.JwtIssuer = configuration["Security:JwtIssuer"];
                options.JwtAudience = configuration["Security:JwtAudience"];
                options.TokenExpiration = TimeSpan.FromHours(24);
                options.RefreshTokenExpiration = TimeSpan.FromDays(7);
                options.EnableTwoFactor = configuration.GetValue<bool>("Security:EnableTwoFactor");
            });
            
            // XOS Reporting Services
            services.AddXOSReporting(options =>
            {
                options.ReportPath = Path.Combine(Directory.GetCurrentDirectory(), "Reports");
                options.TempPath = Path.Combine(Path.GetTempPath(), "XOS_Reports");
                options.EnableCaching = true;
                options.CacheDuration = TimeSpan.FromMinutes(30);
            });
            
            // XOS Notification Services
            services.AddXOSNotification(options =>
            {
                options.EmailProvider = EmailProvider.SMTP;
                options.SMTPSettings = configuration.GetSection("Email:SMTP").Get<SMTPSettings>();
                options.SMSProvider = SMSProvider.Twilio;
                options.TwilioSettings = configuration.GetSection("SMS:Twilio").Get<TwilioSettings>();
                options.PushProvider = PushProvider.Firebase;
                options.FirebaseSettings = configuration.GetSection("Push:Firebase").Get<FirebaseSettings>();
            });
            
            // XOS File Manager Services
            services.AddXOSFileManager(options =>
            {
                options.StorageProvider = StorageProvider.Local;
                options.LocalStoragePath = Path.Combine(Directory.GetCurrentDirectory(), "Storage");
                options.MaxFileSize = 50 * 1024 * 1024; // 50MB
                options.AllowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".gif" };
                options.EnableVirusScanning = configuration.GetValue<bool>("FileManager:EnableVirusScanning");
                options.GenerateThumbnails = true;
            });
            
            // XOS Caching Services
            services.AddXOSCaching(options =>
            {
                options.DefaultExpiration = TimeSpan.FromMinutes(30);
                options.EnableDistributedCache = true;
                options.EnableCompression = true;
                options.KeyPrefix = "XOS_";
            });
            
            // XOS Audit Services
            services.AddXOSAudit(options =>
            {
                options.EnableDataChangeLogging = true;
                options.EnablePerformanceLogging = true;
                options.EnableSecurityLogging = true;
                options.RetentionDays = 90;
                options.BatchSize = 100;
            });
        }
        
        /// <summary>
        /// ✅ CORRECT: Authentication service registration
        /// </summary>
        private static void RegisterAuthenticationServices(IServiceCollection services, IConfiguration configuration)
        {
            // JWT Authentication
            var jwtSettings = configuration.GetSection("Security").Get<JwtSettings>();
            var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);
            
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = !Environment.IsDevelopment();
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
                
                // SignalR support
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });
            
            // Authorization Policies
            services.AddAuthorization(options =>
            {
                // Role-based policies
                options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
                options.AddPolicy("ManagerOrAdmin", policy => policy.RequireRole("Manager", "Admin"));
                
                // Permission-based policies
                options.AddPolicy("CanViewUsers", policy => policy.RequireClaim("permission", "users.view"));
                options.AddPolicy("CanEditUsers", policy => policy.RequireClaim("permission", "users.edit"));
                options.AddPolicy("CanDeleteUsers", policy => policy.RequireClaim("permission", "users.delete"));
                
                // Custom policies
                options.AddPolicy("SameClient", policy => policy.AddRequirements(new SameClientRequirement()));
                options.AddPolicy("ResourceOwner", policy => policy.AddRequirements(new ResourceOwnerRequirement()));
            });
            
            // Authorization Handlers
            services.AddScoped<IAuthorizationHandler, SameClientAuthorizationHandler>();
            services.AddScoped<IAuthorizationHandler, ResourceOwnerAuthorizationHandler>();
        }
        
        /// <summary>
        /// ✅ CORRECT: API service registration
        /// </summary>
        private static void RegisterApiServices(IServiceCollection services, IConfiguration configuration)
        {
            // Controllers
            services.AddControllers(options =>
            {
                // Global filters
                options.Filters.Add<XOSExceptionFilter>();
                options.Filters.Add<XOSValidationFilter>();
                options.Filters.Add<XOSAuditFilter>();
                
                // Model binding
                options.ModelBinderProviders.Insert(0, new XOSModelBinderProvider());
            })
            .ConfigureApiBehaviorOptions(options =>
            {
                // Custom validation response
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    
                    return new BadRequestObjectResult(new
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = errors
                    });
                };
            });
            
            // API Versioning
            services.AddApiVersioning(options =>
            {
                options.DefaultApiVersion = new ApiVersion(1, 0);
                options.AssumeDefaultVersionWhenUnspecified = true;
                options.ApiVersionReader = ApiVersionReader.Combine(
                    new UrlSegmentApiVersionReader(),
                    new QueryStringApiVersionReader("version"),
                    new HeaderApiVersionReader("X-API-Version")
                );
            });
            
            services.AddVersionedApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV";
                options.SubstituteApiVersionInUrl = true;
            });
            
            // Swagger/OpenAPI
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "XOS API",
                    Version = "v1",
                    Description = "XOS Framework API",
                    Contact = new OpenApiContact
                    {
                        Name = "XOS Support",
                        Email = "support@xos.com"
                    }
                });
                
                // JWT Authentication in Swagger
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });
                
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
                
                // Include XML comments
                var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    options.IncludeXmlComments(xmlPath);
                }
            });
            
            // CORS
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                {
                    var allowedOrigins = configuration.GetSection("CORS:AllowedOrigins").Get<string[]>() 
                                      ?? new[] { "http://localhost:3000", "https://localhost:3000" };
                    
                    builder.WithOrigins(allowedOrigins)
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials();
                });
            });
            
            // Rate Limiting
            services.AddRateLimiter(options =>
            {
                options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
                    httpContext => RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: httpContext.User.Identity?.Name ?? httpContext.Request.Headers.Host.ToString(),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 100,
                            Window = TimeSpan.FromMinutes(1)
                        }));
            });
            
            // SignalR
            services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = Environment.IsDevelopment();
                options.MaximumReceiveMessageSize = 32 * 1024; // 32KB
            })
            .AddRedis(configuration.GetConnectionString("Redis"));
        }
        
        /// <summary>
        /// ✅ CORRECT: Business service registration
        /// </summary>
        private static void RegisterBusinessServices(IServiceCollection services)
        {
            // Service registration pattern - always register interface with implementation
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IRoleService, RoleService>();
            services.AddScoped<IDepartmentService, DepartmentService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IAuditService, AuditService>();
            
            // Repository pattern
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IDepartmentRepository, DepartmentRepository>();
            
            // Domain services
            services.AddScoped<IAuthenticationDomainService, AuthenticationDomainService>();
            services.AddScoped<IAuthorizationDomainService, AuthorizationDomainService>();
            services.AddScoped<IReportingDomainService, ReportingDomainService>();
        }
        
        /// <summary>
        /// ✅ CORRECT: External service registration
        /// </summary>
        private static void RegisterExternalServices(IServiceCollection services, IConfiguration configuration)
        {
            // HTTP clients for external APIs
            services.AddHttpClient("ExternalAPI", client =>
            {
                client.BaseAddress = new Uri(configuration["ExternalAPI:BaseUrl"]);
                client.DefaultRequestHeaders.Add("API-Key", configuration["ExternalAPI:ApiKey"]);
                client.Timeout = TimeSpan.FromSeconds(30);
            });
            
            // Third-party integrations
            services.AddTransient<IPaymentService, PaymentService>();
            services.AddTransient<IEmailProvider, SMTPEmailProvider>();
            services.AddTransient<ISMSProvider, TwilioSMSProvider>();
        }
        
        /// <summary>
        /// ✅ CORRECT: Background service registration
        /// </summary>
        private static void RegisterBackgroundServices(IServiceCollection services)
        {
            // Background tasks
            services.AddHostedService<EmailQueueBackgroundService>();
            services.AddHostedService<NotificationBackgroundService>();
            services.AddHostedService<FileCleanupBackgroundService>();
            services.AddHostedService<CacheMaintenanceBackgroundService>();
            services.AddHostedService<AuditLogBackgroundService>();
            
            // Scheduled tasks
            services.AddHostedService<DailyReportBackgroundService>();
            services.AddHostedService<WeeklyMaintenanceBackgroundService>();
        }
        
        #endregion
        
        #region Middleware Configuration
        
        /// <summary>
        /// ✅ CORRECT: XOS middleware pipeline configuration
        /// Order is CRITICAL - follow this exact sequence
        /// </summary>
        private static void ConfigureMiddleware(WebApplication app)
        {
            // ===== ENVIRONMENT-SPECIFIC MIDDLEWARE =====
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "XOS API V1");
                    c.RoutePrefix = "swagger";
                });
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts(options =>
                {
                    options.MaxAge(TimeSpan.FromDays(365));
                    options.IncludeSubdomains();
                    options.Preload();
                });
            }
            
            // ===== SECURITY MIDDLEWARE =====
            app.UseHttpsRedirection();
            app.UseSecurityHeaders(); // XOS security headers middleware
            
            // Forwarded headers for reverse proxy
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });
            
            // ===== XOS FRAMEWORK MIDDLEWARE =====
            app.UseXOSRequestLogging(); // XOS request/response logging
            app.UseXOSErrorHandling(); // XOS global error handling
            app.UseXOSPerformanceMonitoring(); // XOS performance monitoring
            
            // ===== STANDARD MIDDLEWARE =====
            app.UseRouting();
            app.UseCors();
            app.UseRateLimiter();
            
            // ===== AUTHENTICATION & AUTHORIZATION =====
            app.UseAuthentication();
            app.UseAuthorization();
            
            // ===== XOS BUSINESS MIDDLEWARE =====
            app.UseXOSAuditLogging(); // XOS audit trail middleware
            app.UseXOSClientContext(); // XOS multi-tenant context
            app.UseXOSCaching(); // XOS response caching middleware
            
            // ===== STATIC FILES =====
            app.UseStaticFiles();
            
            // Serve uploaded files with security
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "Storage")),
                RequestPath = "/files",
                OnPrepareResponse = context =>
                {
                    // Add security headers for file downloads
                    context.Context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
                    context.Context.Response.Headers.Add("X-Frame-Options", "DENY");
                }
            });
            
            // ===== HEALTH CHECKS =====
            app.UseHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter = XOSHealthCheckResponseWriter.WriteResponse
            });
            
            app.UseHealthChecks("/health/ready", new HealthCheckOptions
            {
                Predicate = check => check.Tags.Contains("ready"),
                ResponseWriter = XOSHealthCheckResponseWriter.WriteResponse
            });
            
            app.UseHealthChecks("/health/live", new HealthCheckOptions
            {
                Predicate = _ => false,
                ResponseWriter = XOSHealthCheckResponseWriter.WriteResponse
            });
        }
        
        #endregion
        
        #region Endpoint Configuration
        
        /// <summary>
        /// ✅ CORRECT: Endpoint configuration
        /// </summary>
        private static void ConfigureEndpoints(WebApplication app)
        {
            // Map controllers
            app.MapControllers();
            
            // Map SignalR hubs
            app.MapHub<NotificationHub>("/hubs/notifications");
            app.MapHub<ChatHub>("/hubs/chat");
            
            // Minimal APIs (if using)
            app.MapGroup("/api/v1/minimal")
               .MapMinimalAPIs()
               .RequireAuthorization()
               .WithTags("Minimal APIs");
            
            // Default fallback for SPA
            app.MapFallbackToFile("index.html");
        }
        
        #endregion
        
        #region Startup Tasks
        
        /// <summary>
        /// ✅ CORRECT: Startup tasks configuration
        /// </summary>
        private static void ConfigureStartupTasks(WebApplication app)
        {
            // Database initialization
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var logger = services.GetRequiredService<ILogger<Program>>();
                
                try
                {
                    // Initialize XOS database
                    var dbInitializer = services.GetRequiredService<IXOSDatabaseInitializer>();
                    dbInitializer.InitializeAsync().Wait();
                    
                    // Run database migrations
                    var migrationService = services.GetRequiredService<IMigrationService>();
                    migrationService.MigrateAsync().Wait();
                    
                    // Seed initial data
                    if (app.Environment.IsDevelopment())
                    {
                        var seeder = services.GetRequiredService<IDataSeeder>();
                        seeder.SeedAsync().Wait();
                    }
                    
                    logger.LogInformation("Database initialization completed successfully");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred while initializing the database");
                    throw;
                }
                
                // Initialize file system
                try
                {
                    var fileManager = services.GetRequiredService<IXOSFileManager>();
                    fileManager.InitializeAsync().Wait();
                    
                    logger.LogInformation("File system initialization completed successfully");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred while initializing the file system");
                    throw;
                }
                
                // Initialize cache
                try
                {
                    var cacheService = services.GetRequiredService<IXOSCacheService>();
                    cacheService.InitializeAsync().Wait();
                    
                    logger.LogInformation("Cache initialization completed successfully");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred while initializing the cache");
                    // Cache initialization failure is not critical
                    logger.LogWarning("Continuing without cache...");
                }
            }
        }
        
        #endregion
    }
    
    // ===== SECTION 2: ADVANCED PROGRAM PATTERNS =====
    
    /// <summary>
    /// ✅ CORRECT: Configuration classes
    /// </summary>
    public static class ConfigurationExtensions
    {
        public static IConfigurationBuilder AddXOSConfiguration(this IConfigurationBuilder builder, IWebHostEnvironment environment)
        {
            // Add XOS-specific configuration providers
            builder.AddJsonFile("xos.json", optional: true, reloadOnChange: true);
            builder.AddJsonFile($"xos.{environment.EnvironmentName}.json", optional: true, reloadOnChange: true);
            
            // Add encrypted configuration
            if (File.Exists("xos.encrypted.json"))
            {
                builder.AddXOSEncryptedConfiguration("xos.encrypted.json");
            }
            
            return builder;
        }
    }
    
    /// <summary>
    /// ✅ CORRECT: Startup filters for advanced scenarios
    /// </summary>
    public class XOSStartupFilter : IStartupFilter
    {
        public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
        {
            return builder =>
            {
                // Add XOS-specific middleware before the main pipeline
                builder.UseXOSGlobalExceptionHandler();
                builder.UseXOSRequestResponseLogging();
                
                next(builder);
            };
        }
    }
    
    /// <summary>
    /// ✅ CORRECT: Environment-specific configurations
    /// </summary>
    public static class EnvironmentConfiguration
    {
        public static void ConfigureDevelopment(WebApplicationBuilder builder)
        {
            // Development-specific services
            builder.Services.AddDeveloperExceptionPage();
            
            // Enable sensitive data logging
            builder.Services.Configure<XOSDataOptions>(options =>
            {
                options.EnableSensitiveDataLogging = true;
                options.EnableDetailedErrors = true;
            });
            
            // Mock external services
            builder.Services.AddTransient<IPaymentService, MockPaymentService>();
            builder.Services.AddTransient<IEmailProvider, MockEmailProvider>();
        }
        
        public static void ConfigureStaging(WebApplicationBuilder builder)
        {
            // Staging-specific services
            builder.Services.Configure<XOSDataOptions>(options =>
            {
                options.EnableSensitiveDataLogging = false;
                options.EnableDetailedErrors = true;
                options.CommandTimeout = 60; // Longer timeout for staging
            });
        }
        
        public static void ConfigureProduction(WebApplicationBuilder builder)
        {
            // Production-specific services
            builder.Services.Configure<XOSDataOptions>(options =>
            {
                options.EnableSensitiveDataLogging = false;
                options.EnableDetailedErrors = false;
                options.CommandTimeout = 30;
                options.ConnectionPoolSize = 200; // Larger pool for production
            });
            
            // Production logging
            builder.Logging.AddXOSProductionLogger();
            
            // Performance monitoring
            builder.Services.AddXOSApplicationInsights();
        }
    }
    
    // ===== SECTION 3: BACKGROUND SERVICES =====
    
    /// <summary>
    /// ✅ CORRECT: XOS background service pattern
    /// </summary>
    public class EmailQueueBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EmailQueueBackgroundService> _logger;
        private readonly TimeSpan _delay = TimeSpan.FromSeconds(30);
        
        public EmailQueueBackgroundService(IServiceProvider serviceProvider, ILogger<EmailQueueBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }
        
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var emailService = scope.ServiceProvider.GetRequiredService<IEmailQueueService>();
                    
                    await emailService.ProcessQueueAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing email queue");
                }
                
                await Task.Delay(_delay, stoppingToken);
            }
        }
    }
    
    // ===== SECTION 4: HEALTH CHECKS =====
    
    /// <summary>
    /// ✅ CORRECT: XOS health check implementations
    /// </summary>
    public class XOSDatabaseHealthCheck : IHealthCheck
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<XOSDatabaseHealthCheck> _logger;
        
        public XOSDatabaseHealthCheck(IServiceProvider serviceProvider, ILogger<XOSDatabaseHealthCheck> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }
        
        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbService = scope.ServiceProvider.GetRequiredService<IDBService>();
                
                var isHealthy = await dbService.TestConnectionAsync();
                
                if (isHealthy)
                {
                    return HealthCheckResult.Healthy("Database connection is healthy");
                }
                else
                {
                    return HealthCheckResult.Unhealthy("Database connection failed");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database health check failed");
                return HealthCheckResult.Unhealthy("Database health check failed", ex);
            }
        }
    }
    
    // ===== SECTION 5: AUTHORIZATION HANDLERS =====
    
    /// <summary>
    /// ✅ CORRECT: XOS authorization handlers
    /// </summary>
    public class SameClientAuthorizationHandler : AuthorizationHandler<SameClientRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<SameClientAuthorizationHandler> _logger;
        
        public SameClientAuthorizationHandler(IHttpContextAccessor httpContextAccessor, ILogger<SameClientAuthorizationHandler> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }
        
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, SameClientRequirement requirement)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            
            if (httpContext == null)
            {
                context.Fail();
                return Task.CompletedTask;
            }
            
            var userClientId = context.User.FindFirst("client_id")?.Value;
            var requestedClientId = httpContext.Request.Headers["X-Client-ID"].FirstOrDefault() ??
                                   httpContext.Request.Query["clientId"].FirstOrDefault();
            
            if (userClientId == requestedClientId)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail();
                _logger.LogWarning("Client ID mismatch: User={UserClientId}, Requested={RequestedClientId}", userClientId, requestedClientId);
            }
            
            return Task.CompletedTask;
        }
    }
    
    public class SameClientRequirement : IAuthorizationRequirement { }
    
    public class ResourceOwnerRequirement : IAuthorizationRequirement { }
    
    public class ResourceOwnerAuthorizationHandler : AuthorizationHandler<ResourceOwnerRequirement>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ResourceOwnerRequirement requirement)
        {
            // Implementation for resource ownership check
            var userId = context.User.FindFirst("user_id")?.Value;
            
            // Resource ownership logic here
            // For example, check if the user owns the resource being accessed
            
            context.Succeed(requirement);
            return Task.CompletedTask;
        }
    }
    
    // ===== SUPPORTING CLASSES =====
    
    public class JwtSettings
    {
        public string Secret { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
        public int ExpirationMinutes { get; set; }
    }
    
    public class SMTPSettings
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public bool EnableSSL { get; set; }
    }
    
    public class TwilioSettings
    {
        public string AccountSid { get; set; }
        public string AuthToken { get; set; }
        public string FromNumber { get; set; }
    }
    
    public class FirebaseSettings
    {
        public string ProjectId { get; set; }
        public string ServiceAccountKeyPath { get; set; }
    }
}

// ❌ COMMON MISTAKES TO AVOID:
// 1. Wrong middleware order (authentication before routing, etc.)
// 2. Not using XOS service registration methods
// 3. Missing XOS framework initialization
// 4. Not configuring health checks properly
// 5. Forgetting to register business services
// 6. Not setting up proper logging
// 7. Missing CORS configuration for development
// 8. Not configuring JWT authentication properly
// 9. Forgetting to map SignalR hubs
// 10. Not handling startup errors properly