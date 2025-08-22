# XOS Packages Usage Guide for CVS_Claude

## Quick Start

### Prerequisites
Ensure your project has the `nuget.config` file with Hostack feed:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
    <add key="Hostack" value="http://nuget.hostack.com/v3/index.json" protocolVersion="3" allowInsecureConnections="true" />
  </packageSources>
</configuration>
```

### Installing XOS Packages
```bash
# Install specific packages
dotnet add package XOS.Data --version 1.2.1
dotnet add package XOS.Utils --version 1.1.0
dotnet add package XOS.Service.Core --version 1.0.3
dotnet add package XOS.Web.Core --version 1.0.0
dotnet add package XOS.Web.Security --version 1.0.1
```

## Currently Used XOS Packages

### 1. XOS.Utils (v1.1.0)
Common utilities for validation, JSON operations, and string manipulation.

**Usage Examples:**
```csharp
using XOS.Utils;

// Email validation
bool isValid = Common.IsValidEmail("user@example.com");

// Clean input with regex
string cleanedInput = Common.CleanInput(userInput, @"[^a-zA-Z0-9]", 100);

// Truncate text
string truncated = Common.CorrectLength(longText, 50);

// JSON operations
string json = ObjectExtensions.ToJsonText(myObject);
var parsed = ObjectExtensions.ToJsonObject<MyClass>(json);
```

### 2. XOS.Service.Core (v1.0.3)
Core service layer components for building service classes.

**Usage in your XOSServiceBase.cs:**
```csharp
using XOS.Service.Core;

public abstract class XOSServiceBase : IXOSServiceBase
{
    protected readonly IConfiguration _configuration;
    protected readonly ILogger _logger;
    
    // Inherits core service functionality from XOS.Service.Core
}
```

### 3. XOS.Data (v1.2.1)
Database operations framework for data access.

**Setup in Program.cs:**
```csharp
// Add XOS Data services
builder.Services.AddDBFactory(options =>
{
    options.ConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.DatabaseType = DatabaseType.PostgreSQL;
});

// Or use DBContext approach
builder.Services.AddDBContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});
```

**Usage in Services:**
```csharp
public class CustomerService : XOSServiceBase
{
    private readonly IDBFactory _dbFactory;
    
    public async Task<Customer> GetCustomerAsync(int id)
    {
        using var db = _dbFactory.GetDatabase();
        return await db.QueryFirstOrDefaultAsync<Customer>(
            "SELECT * FROM customers WHERE id = @Id", 
            new { Id = id }
        );
    }
}
```

### 4. XOS.Web.Core (v1.0.0)
Core web application components and base controllers.

**Usage in Controllers:**
```csharp
using XOS.Web.Core;

[ApiController]
[Route("api/[controller]")]
public class BaseController : XOSControllerBase
{
    // Inherits common web functionality
    // - Standard response formatting
    // - Error handling
    // - Logging
}
```

### 5. XOS.Web.Security (v1.0.1)
Security implementations for web applications.

**Setup in Program.cs:**
```csharp
// Add XOS Security
builder.Services.AddXOSSecurity(options =>
{
    options.EnableJwtAuthentication = true;
    options.JwtKey = builder.Configuration["Jwt:Key"];
    options.JwtIssuer = builder.Configuration["Jwt:Issuer"];
});
```

**Usage in Controllers:**
```csharp
[Authorize]
[XOSSecure] // Custom security attribute from XOS.Web.Security
public class SecureController : BaseController
{
    // Protected endpoints
}
```

## Available But Unused XOS Packages

### XOS.MicrosoftGraph.Email (v1.0.3)
For email functionality via Microsoft Graph API.

**How to add:**
```bash
dotnet add package XOS.MicrosoftGraph.Email --version 1.0.3
```

**Usage example:**
```csharp
builder.Services.AddXOSEmail(options =>
{
    options.ClientId = "your-client-id";
    options.ClientSecret = "your-client-secret";
    options.TenantId = "your-tenant-id";
});

// In service
public class EmailService
{
    private readonly IXOSEmailService _emailService;
    
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        await _emailService.SendAsync(new EmailMessage
        {
            To = new[] { to },
            Subject = subject,
            Body = body,
            IsHtml = true
        });
    }
}
```

### XOS.EventBus (v1.0.0)
For event-driven architecture and microservices communication.

**How to add:**
```bash
dotnet add package XOS.EventBus --version 1.0.0
```

**Usage example:**
```csharp
// Setup
builder.Services.AddEventBus(options =>
{
    options.ConnectionString = "your-connection-string";
});

// Publish events
public class OrderService
{
    private readonly IEventBus _eventBus;
    
    public async Task CreateOrderAsync(Order order)
    {
        // Save order
        await _eventBus.PublishAsync(new OrderCreatedEvent { OrderId = order.Id });
    }
}

// Subscribe to events
public class OrderCreatedEventHandler : IEventHandler<OrderCreatedEvent>
{
    public Task Handle(OrderCreatedEvent @event)
    {
        // Handle the event
        return Task.CompletedTask;
    }
}
```

### XOS.SpreadsheetLight (v1.0.3)
For Excel file generation and manipulation.

**How to add:**
```bash
dotnet add package XOS.SpreadsheetLight --version 1.0.3
```

**Usage example:**
```csharp
using XOS.SpreadsheetLight;

public class ReportService
{
    public byte[] GenerateExcelReport(List<Customer> customers)
    {
        using var doc = new SLDocument();
        
        // Headers
        doc.SetCellValue(1, 1, "ID");
        doc.SetCellValue(1, 2, "Name");
        doc.SetCellValue(1, 3, "Email");
        
        // Data
        int row = 2;
        foreach (var customer in customers)
        {
            doc.SetCellValue(row, 1, customer.Id);
            doc.SetCellValue(row, 2, customer.Name);
            doc.SetCellValue(row, 3, customer.Email);
            row++;
        }
        
        return doc.GetAsByteArray();
    }
}
```

## Common Patterns in Your Codebase

### Service Pattern with XOS
```csharp
public class UserLoginService : XOSServiceBase, IUserLoginService
{
    private readonly IDBService _dbService;
    private readonly ITokenService _tokenService;
    
    public UserLoginService(
        IConfiguration configuration,
        ILogger<UserLoginService> logger,
        IDBService dbService,
        ITokenService tokenService) 
        : base(configuration, logger)
    {
        _dbService = dbService;
        _tokenService = tokenService;
    }
    
    public async Task<XOSResponse<UserLogin>> AuthenticateAsync(string username, string password)
    {
        try
        {
            // Use XOS.Utils for validation
            if (!Common.IsValidEmail(username))
            {
                return XOSResponse<UserLogin>.Failure("Invalid email format");
            }
            
            // Database operations via XOS.Data patterns
            var user = await _dbService.GetUserAsync(username);
            
            // Return XOS response format
            return XOSResponse<UserLogin>.Success(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Authentication failed");
            return XOSResponse<UserLogin>.Failure("Authentication failed");
        }
    }
}
```

### Controller Pattern with XOS
```csharp
[ApiController]
[Route("api/[controller]")]
public class UserLoginController : BaseController
{
    private readonly IUserLoginService _userLoginService;
    
    [HttpPost("authenticate")]
    public async Task<IActionResult> Authenticate([FromBody] LoginRequest request)
    {
        // Use XOS.Utils for input validation
        var cleanUsername = Common.CleanInput(request.Username, @"[^a-zA-Z0-9@.-]", 100);
        
        var result = await _userLoginService.AuthenticateAsync(cleanUsername, request.Password);
        
        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }
        
        return BadRequest(result.Message);
    }
}
```

## Best Practices

1. **Version Management**
   - Always specify exact versions in .csproj files
   - Keep versions consistent across projects
   - Test thoroughly when upgrading

2. **Dependency Injection**
   - Register XOS services in Program.cs
   - Use interface-based programming
   - Follow the existing service patterns

3. **Error Handling**
   - Use XOSResponse<T> for standardized responses
   - Log errors using ILogger
   - Handle exceptions gracefully

4. **Security**
   - Use XOS.Web.Security for authentication
   - Validate all inputs with XOS.Utils
   - Follow secure coding practices

## Troubleshooting

### Package not found
```bash
# Clear NuGet cache
dotnet nuget locals all --clear

# Force restore
dotnet restore --force
```

### Version conflicts
```bash
# Check dependency tree
dotnet list package --include-transitive
```

### Build errors
```bash
# Clean and rebuild
dotnet clean
dotnet build --verbosity detailed
```

## Quick Reference Commands

```bash
# Search for XOS packages
dotnet package search XOS --source http://nuget.hostack.com/v3/index.json

# Add package
dotnet add package [PackageName] --version [Version]

# Update package
dotnet add package [PackageName] --version [NewVersion]

# Remove package
dotnet remove package [PackageName]

# List installed packages
dotnet list package

# Check for updates
dotnet list package --outdated
```

## Migration Notes

When migrating existing code to use XOS packages:

1. **Replace custom utilities with XOS.Utils**
   - Email validation → `Common.IsValidEmail()`
   - Input sanitization → `Common.CleanInput()`
   - JSON operations → `ObjectExtensions.ToJsonText()`

2. **Standardize service patterns**
   - Inherit from XOSServiceBase
   - Use XOSResponse<T> for returns
   - Implement IXOSServiceBase interface

3. **Update database operations**
   - Use IDBFactory from XOS.Data
   - Follow async patterns
   - Use parameterized queries

## Support

For issues with XOS packages:
1. Check the package documentation at https://vc.webstorm-it.com/
2. Verify nuget.config is properly configured
3. Ensure .NET 8.0 or later is installed (your project uses .NET 9.0)
4. Contact XENIAONE SOFTWARE SOLUTIONS for package-specific support