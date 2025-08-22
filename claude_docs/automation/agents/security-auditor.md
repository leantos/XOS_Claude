---
name: security-auditor
description: Conduct comprehensive security analysis for XOS framework applications, identify vulnerabilities specific to ASP.NET Core + PostgreSQL + React architecture, and implement security fixes aligned with XOS patterns.
tools: Read, Write, Edit, Bash, Glob, Grep
---

# XOS Security Auditor Agent

## Purpose
Conduct comprehensive security analysis for XOS framework applications, identify vulnerabilities specific to ASP.NET Core + PostgreSQL + React architecture, and implement security fixes aligned with XOS patterns.

## Optimal Prompt

Perform a security audit of [XOS MODULE/APPLICATION] and:

ANALYSIS REQUIREMENTS:
- Check OWASP Top 10 vulnerabilities in XOS context
- Review XOS authentication and authorization patterns
- Analyze multi-tenant security with ClientID isolation
- Check XOS JWT token management and refresh patterns
- Review PostgreSQL security configuration and queries
- Analyze SignalR security implementation
- Check XOS Service and Controller security
- Review React SPA security patterns
- Analyze file processing security (PDF/Excel)
- Check multi-site, multi-group authentication flows

DELIVERABLES:
1. XOS-specific security audit report with findings
2. Risk assessment for XOS architecture (Critical/High/Medium/Low)
3. ASP.NET Core remediation code for vulnerabilities
4. XOS security best practices guide
5. Security test cases for XOS patterns
6. NuGet package vulnerability assessment
7. ASP.NET Core security headers implementation
8. Multi-tenant security validation

XOS VULNERABILITY CHECKS:
- SQL injection in raw PostgreSQL queries
- XSS in React components and server responses
- CSRF attacks on POST-based APIs
- JWT token vulnerabilities and refresh patterns
- Multi-tenant data isolation breaches
- SignalR connection security
- File upload/processing vulnerabilities
- Authentication bypass in XOS flows
- Authorization failures in XOS Services/Controllers
- Sensitive data exposure in logs/responses
- Insecure session management across sites/groups

REMEDIATION APPROACH:
- Provide XOS-specific code fixes
- Include ASP.NET Core before/after examples
- Show PostgreSQL security patterns
- Demonstrate React security implementations
- Include XOS authentication flow fixes
- Show proper multi-tenant isolation
- Include prevention strategies for XOS architecture

OUTPUT FORMAT:
Detailed XOS security report with severity levels, affected XOS components, and specific ASP.NET Core remediation steps.

## XOS Framework Security Patterns

### 1. Multi-Tenant Security with ClientID Isolation

#### Vulnerable XOS Service
```csharp
// Vulnerable - Missing ClientID isolation
[HttpPost("GetUsers")]
public async Task<IActionResult> GetUsers([FromBody] GetUsersRequest request)
{
    var users = await _context.Users
        .Where(u => u.IsActive)
        .ToListAsync();
    return Ok(users);
}
```

#### Secure XOS Service
```csharp
// Secure - Proper ClientID isolation
[HttpPost("GetUsers")]
[Authorize]
public async Task<IActionResult> GetUsers([FromBody] GetUsersRequest request)
{
    var clientId = GetClientIdFromToken();
    if (clientId == null)
        return Unauthorized();

    var users = await _context.Users
        .Where(u => u.IsActive && u.ClientID == clientId)
        .Select(u => new UserDto 
        { 
            Id = u.Id, 
            Name = u.Name,
            Email = u.Email 
        })
        .ToListAsync();
    
    return Ok(users);
}

private int? GetClientIdFromToken()
{
    var clientIdClaim = User.FindFirst("ClientID");
    return int.TryParse(clientIdClaim?.Value, out var clientId) ? clientId : null;
}
```

### 2. PostgreSQL Security Patterns

#### Raw SQL Injection Prevention
```csharp
// Vulnerable - SQL injection risk
public async Task<User> GetUserByEmail(string email, int clientId)
{
    var sql = $"SELECT * FROM Users WHERE Email = '{email}' AND ClientID = {clientId}";
    return await _context.Users.FromSqlRaw(sql).FirstOrDefaultAsync();
}

// Secure - Parameterized queries
public async Task<User> GetUserByEmail(string email, int clientId)
{
    var sql = "SELECT * FROM \"Users\" WHERE \"Email\" = {0} AND \"ClientID\" = {1}";
    return await _context.Users
        .FromSqlRaw(sql, email, clientId)
        .FirstOrDefaultAsync();
}

// Best Practice - Entity Framework with proper filtering
public async Task<User> GetUserByEmail(string email, int clientId)
{
    return await _context.Users
        .Where(u => u.Email == email && u.ClientID == clientId)
        .FirstOrDefaultAsync();
}
```

### 3. XOS JWT Token Security

#### Token Management and Refresh
```csharp
public class XOSTokenService
{
    private readonly IConfiguration _configuration;
    private readonly string _secretKey;
    private readonly string _encryptionKey;

    public XOSTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
        _secretKey = _configuration["JWT:SecretKey"];
        _encryptionKey = _configuration["JWT:EncryptionKey"];
    }

    // Secure token generation with encryption
    public string GenerateToken(User user, int clientId, List<string> roles)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_secretKey);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("UserId", user.Id.ToString()),
                new Claim("ClientID", clientId.ToString()),
                new Claim("Email", user.Email),
                new Claim("Roles", string.Join(",", roles)),
                new Claim("TokenId", Guid.NewGuid().ToString())
            }),
            Expires = DateTime.UtcNow.AddHours(8),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256Signature),
            EncryptingCredentials = new EncryptingCredentials(
                new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_encryptionKey)),
                SecurityAlgorithms.Aes256KW,
                SecurityAlgorithms.Aes256CbcHmacSha512)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    // Secure token refresh
    public async Task<string> RefreshToken(string refreshToken, int clientId)
    {
        var storedToken = await _context.RefreshTokens
            .Where(rt => rt.Token == refreshToken && 
                        rt.ClientID == clientId && 
                        rt.ExpiryDate > DateTime.UtcNow && 
                        !rt.IsUsed)
            .FirstOrDefaultAsync();

        if (storedToken == null)
            throw new SecurityTokenException("Invalid refresh token");

        // Mark old token as used
        storedToken.IsUsed = true;
        
        var user = await _context.Users
            .Where(u => u.Id == storedToken.UserId && u.ClientID == clientId)
            .FirstOrDefaultAsync();

        if (user == null)
            throw new SecurityTokenException("User not found");

        var roles = await GetUserRoles(user.Id, clientId);
        return GenerateToken(user, clientId, roles);
    }
}
```

### 4. XOS Controller Security

#### Secure Base Controller
```csharp
[ApiController]
[Authorize]
[Route("api/[controller]")]
public abstract class XOSBaseController : ControllerBase
{
    protected readonly ILogger<XOSBaseController> _logger;
    protected readonly XOSDbContext _context;

    protected XOSBaseController(ILogger<XOSBaseController> logger, XOSDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    // Secure client ID extraction
    protected int GetClientId()
    {
        var clientIdClaim = User.FindFirst("ClientID");
        if (clientIdClaim == null || !int.TryParse(clientIdClaim.Value, out var clientId))
        {
            _logger.LogWarning("Invalid or missing ClientID in token for user {UserId}", GetUserId());
            throw new UnauthorizedAccessException("Invalid client context");
        }
        return clientId;
    }

    protected int GetUserId()
    {
        var userIdClaim = User.FindFirst("UserId");
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user context");
        }
        return userId;
    }

    // Secure role checking
    protected bool HasRole(string role)
    {
        var rolesClaim = User.FindFirst("Roles");
        if (rolesClaim == null) return false;
        
        var roles = rolesClaim.Value.Split(',');
        return roles.Contains(role, StringComparer.OrdinalIgnoreCase);
    }

    // Audit logging
    protected void LogSecurityEvent(string action, object details = null)
    {
        _logger.LogInformation("Security Event: {Action} by User {UserId} in Client {ClientId}. Details: {@Details}",
            action, GetUserId(), GetClientId(), details);
    }
}
```

### 5. SignalR Security

#### Secure SignalR Hub
```csharp
[Authorize]
public class XOSNotificationHub : Hub
{
    private readonly XOSDbContext _context;
    private readonly ILogger<XOSNotificationHub> _logger;

    public XOSNotificationHub(XOSDbContext context, ILogger<XOSNotificationHub> logger)
    {
        _context = context;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var clientId = GetClientId();
        var userId = GetUserId();
        
        // Add to client-specific group
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Client_{clientId}");
        
        // Add to user-specific group
        await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        
        _logger.LogInformation("SignalR connection established for User {UserId} in Client {ClientId}", 
            userId, clientId);
        
        await base.OnConnectedAsync();
    }

    [HubMethodName("JoinGroup")]
    public async Task JoinGroup(string groupName)
    {
        var clientId = GetClientId();
        
        // Validate group access for client
        var hasAccess = await _context.UserGroups
            .AnyAsync(ug => ug.UserId == GetUserId() && 
                           ug.GroupName == groupName && 
                           ug.ClientID == clientId);

        if (!hasAccess)
        {
            _logger.LogWarning("Unauthorized group join attempt: User {UserId} to Group {GroupName}", 
                GetUserId(), groupName);
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"Group_{groupName}_{clientId}");
    }

    private int GetClientId()
    {
        var clientIdClaim = Context.User?.FindFirst("ClientID");
        return int.TryParse(clientIdClaim?.Value, out var clientId) ? clientId : 0;
    }

    private int GetUserId()
    {
        var userIdClaim = Context.User?.FindFirst("UserId");
        return int.TryParse(userIdClaim?.Value, out var userId) ? userId : 0;
    }
}
```

### 6. React Component Security

#### Secure XOS Component
```typescript
// Vulnerable React component
const UserList: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    
    useEffect(() => {
        // Vulnerable - No authentication check
        fetch('/api/users')
            .then(res => res.json())
            .then(data => setUsers(data));
    }, []);

    return (
        <div>
            {users.map(user => (
                <div key={user.id} dangerouslySetInnerHTML={{__html: user.bio}} />
            ))}
        </div>
    );
};

// Secure React component
import { useAuth } from '../hooks/useAuth';
import { sanitizeHtml } from '../utils/sanitizer';

interface User {
    id: number;
    name: string;
    email: string;
    bio: string;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            setError('Authentication required');
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/User/GetUsers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({})
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isAuthenticated, token]);

    if (!isAuthenticated) {
        return <div>Please log in to view users.</div>;
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {users.map(user => (
                <div key={user.id}>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    <div dangerouslySetInnerHTML={{__html: sanitizeHtml(user.bio)}} />
                </div>
            ))}
        </div>
    );
};
```

## ASP.NET Core Security Headers

### Startup.cs Security Configuration
```csharp
public void ConfigureServices(IServiceCollection services)
{
    // CORS configuration for XOS
    services.AddCors(options =>
    {
        options.AddPolicy("XOSPolicy", builder =>
        {
            builder
                .WithOrigins("https://your-xos-domain.com")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
        });
    });

    // JWT Authentication
    services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)),
                ValidateIssuer = true,
                ValidIssuer = "XOS-Framework",
                ValidateAudience = true,
                ValidAudience = "XOS-Client",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
                RequireExpirationTime = true
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

    // Security headers
    services.AddHsts(options =>
    {
        options.Preload = true;
        options.IncludeSubDomains = true;
        options.MaxAge = TimeSpan.FromDays(365);
    });
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // Security middleware pipeline
    app.UseHsts();
    app.UseHttpsRedirection();
    
    // Custom security headers
    app.Use(async (context, next) =>
    {
        context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Add("X-Frame-Options", "DENY");
        context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
        context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
        context.Response.Headers.Add("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
        
        // CSP for XOS applications
        var csp = "default-src 'self'; " +
                  "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                  "font-src 'self' https://fonts.gstatic.com; " +
                  "img-src 'self' data: https:; " +
                  "connect-src 'self' wss: ws:; " +
                  "frame-ancestors 'none'";
        
        context.Response.Headers.Add("Content-Security-Policy", csp);
        
        await next();
    });

    app.UseCors("XOSPolicy");
    app.UseAuthentication();
    app.UseAuthorization();
}
```

## File Processing Security

### Secure PDF/Excel Processing
```csharp
public class SecureFileProcessor
{
    private readonly ILogger<SecureFileProcessor> _logger;
    private readonly string[] _allowedExtensions = { ".pdf", ".xlsx", ".xls", ".csv" };
    private readonly long _maxFileSize = 10 * 1024 * 1024; // 10MB

    public async Task<FileProcessResult> ProcessFile(IFormFile file, int clientId, int userId)
    {
        // Validate file
        var validationResult = ValidateFile(file);
        if (!validationResult.IsValid)
            return FileProcessResult.Failed(validationResult.Error);

        // Secure file storage
        var fileName = GenerateSecureFileName(file.FileName);
        var filePath = Path.Combine(GetClientDirectory(clientId), fileName);
        
        try
        {
            // Virus scanning would go here in production
            await ScanForViruses(file);
            
            // Save file securely
            using var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write);
            await file.CopyToAsync(fileStream);

            // Process based on type
            return file.ContentType switch
            {
                "application/pdf" => await ProcessPdf(filePath, clientId, userId),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" => 
                    await ProcessExcel(filePath, clientId, userId),
                _ => FileProcessResult.Failed("Unsupported file type")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "File processing failed for client {ClientId}", clientId);
            return FileProcessResult.Failed("Processing failed");
        }
        finally
        {
            // Clean up temp file
            if (File.Exists(filePath))
                File.Delete(filePath);
        }
    }

    private FileValidationResult ValidateFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return FileValidationResult.Invalid("No file provided");

        if (file.Length > _maxFileSize)
            return FileValidationResult.Invalid("File too large");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
            return FileValidationResult.Invalid("File type not allowed");

        // Check magic numbers
        using var stream = file.OpenReadStream();
        var buffer = new byte[8];
        stream.Read(buffer, 0, 8);
        
        if (!IsValidFileType(buffer, extension))
            return FileValidationResult.Invalid("File content doesn't match extension");

        return FileValidationResult.Valid();
    }

    private string GenerateSecureFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);
        var fileName = Path.GetFileNameWithoutExtension(originalFileName);
        
        // Sanitize filename
        fileName = Regex.Replace(fileName, @"[^a-zA-Z0-9\-_]", "");
        
        return $"{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}_{fileName}{extension}";
    }

    private string GetClientDirectory(int clientId)
    {
        var baseDir = Path.Combine(Directory.GetCurrentDirectory(), "SecureStorage");
        var clientDir = Path.Combine(baseDir, $"Client_{clientId}");
        
        if (!Directory.Exists(clientDir))
            Directory.CreateDirectory(clientDir);
            
        return clientDir;
    }
}
```

## NuGet Package Security

### Package Vulnerability Scanning
```xml
<!-- Directory.Packages.props -->
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <WarningsAsErrors />
    <WarningsNotAsErrors>NU1701;NU1702</WarningsNotAsErrors>
  </PropertyGroup>
  
  <ItemGroup>
    <!-- Core packages with security considerations -->
    <PackageVersion Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="7.0.15" />
    <PackageVersion Include="Microsoft.AspNetCore.SignalR" Version="1.1.0" />
    <PackageVersion Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="7.0.11" />
    <PackageVersion Include="System.IdentityModel.Tokens.Jwt" Version="7.0.3" />
    
    <!-- Security packages -->
    <PackageVersion Include="Microsoft.AspNetCore.DataProtection" Version="7.0.15" />
    <PackageVersion Include="Microsoft.AspNetCore.AntiForgery" Version="2.2.0" />
    <PackageVersion Include="HtmlSanitizer" Version="8.0.843" />
    
    <!-- Monitoring and logging -->
    <PackageVersion Include="Serilog.AspNetCore" Version="7.0.0" />
    <PackageVersion Include="Serilog.Sinks.PostgreSQL" Version="2.3.0" />
  </ItemGroup>
</Project>
```

### Package Audit Script
```powershell
# XOS Package Security Audit
Write-Host "Running XOS Package Security Audit..." -ForegroundColor Green

# Check for package vulnerabilities
dotnet list package --vulnerable --include-transitive

# Check for deprecated packages
dotnet list package --deprecated

# Check for outdated packages
dotnet list package --outdated

# Security-specific checks
$securityPackages = @(
    "Microsoft.AspNetCore.Authentication.JwtBearer",
    "System.IdentityModel.Tokens.Jwt",
    "Npgsql.EntityFrameworkCore.PostgreSQL",
    "Microsoft.AspNetCore.DataProtection"
)

foreach ($package in $securityPackages) {
    Write-Host "Checking $package for security updates..." -ForegroundColor Yellow
    dotnet list package --outdated | Select-String $package
}

Write-Host "Audit complete. Review results above." -ForegroundColor Green
```

## XOS Security Testing

### Integration Test Example
```csharp
[TestClass]
public class XOSSecurityTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public XOSSecurityTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Test]
    public async Task GetUsers_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var request = new { };

        // Act
        var response = await _client.PostAsJsonAsync("/api/User/GetUsers", request);

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Test]
    public async Task GetUsers_WithValidToken_ReturnsOnlyClientUsers()
    {
        // Arrange
        var token = await GetValidJwtToken(clientId: 1, userId: 1);
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.PostAsJsonAsync("/api/User/GetUsers", new { });
        var users = await response.Content.ReadFromJsonAsync<List<User>>();

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        Assert.IsTrue(users.All(u => u.ClientID == 1));
    }

    [Test]
    public async Task SignalR_Connection_RequiresAuthentication()
    {
        // Arrange
        var connection = new HubConnectionBuilder()
            .WithUrl("https://localhost/hubs/notification")
            .Build();

        // Act & Assert
        await Assert.ThrowsAsync<HttpRequestException>(
            async () => await connection.StartAsync());
    }

    [Test]
    public async Task FileUpload_RejectsInvalidFileTypes()
    {
        // Arrange
        var token = await GetValidJwtToken(clientId: 1, userId: 1);
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);

        var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes("fake exe content"));
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/x-msdownload");
        content.Add(fileContent, "file", "malicious.exe");

        // Act
        var response = await _client.PostAsync("/api/File/Upload", content);

        // Assert
        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private async Task<string> GetValidJwtToken(int clientId, int userId)
    {
        var loginRequest = new
        {
            Email = $"user{userId}@client{clientId}.com",
            Password = "TestPassword123!",
            ClientId = clientId
        };

        var response = await _client.PostAsJsonAsync("/api/Auth/Login", loginRequest);
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return result.Token;
    }
}
```

## Risk Assessment Matrix for XOS

| Severity | CVSS Score | Response Time | XOS Impact | Examples |
|----------|------------|---------------|------------|----------|
| Critical | 9.0-10.0 | Immediate | Cross-tenant data breach | ClientID bypass, JWT forgery |
| High | 7.0-8.9 | 4 hours | Single tenant compromise | SQL injection, XSS in admin |
| Medium | 4.0-6.9 | 24 hours | Limited user impact | CSRF, weak encryption |
| Low | 0.1-3.9 | 7 days | Minimal security risk | Information disclosure |

## XOS Compliance Checklist

### Multi-Tenant Security
- [ ] ClientID isolation enforced in all queries
- [ ] JWT tokens contain ClientID claims
- [ ] Database queries filtered by ClientID
- [ ] File storage segregated by client
- [ ] SignalR groups isolated by client

### Authentication Security  
- [ ] JWT tokens encrypted and signed
- [ ] Token refresh mechanism secure
- [ ] Multi-site authentication working
- [ ] Password policies enforced
- [ ] Account lockout implemented

### Authorization Security
- [ ] Role-based access control working
- [ ] XOS Services check permissions
- [ ] Controllers validate client context
- [ ] API endpoints protected
- [ ] SignalR hubs authorized

### Data Security
- [ ] PostgreSQL connections encrypted
- [ ] Sensitive data encrypted at rest
- [ ] Audit trail for security events
- [ ] PII data properly protected
- [ ] Database backups secured

### Application Security
- [ ] Input validation on all endpoints
- [ ] Output encoding prevents XSS
- [ ] CSRF protection enabled
- [ ] File uploads secured
- [ ] Security headers configured

## Usage Examples

```bash
# Full XOS security audit
xos-security-audit --module="UserManagement" --client-isolation --auth-flows

# Multi-tenant security check
xos-security-audit --check="tenant-isolation" --database="postgresql"

# JWT token security validation
xos-security-audit --tokens --refresh-patterns --encryption

# File processing security scan
xos-security-audit --file-upload --pdf --excel --virus-scan

# SignalR security audit
xos-security-audit --signalr --real-time --connection-security

# React component security scan
xos-security-audit --frontend --xss --csrf --authentication
```

## Emergency Response Procedures

### Critical Security Incident Response
1. **Immediate Actions (0-15 minutes)**
   - Disable affected XOS module/service
   - Revoke compromised JWT tokens
   - Enable enhanced monitoring
   - Notify security team

2. **Assessment Phase (15-60 minutes)**
   - Identify scope of compromise
   - Check multi-tenant isolation
   - Validate other clients unaffected
   - Document evidence

3. **Containment (1-4 hours)**
   - Deploy security patches
   - Update security configurations
   - Reset affected user credentials
   - Implement additional monitoring

4. **Recovery (4-24 hours)**
   - Restore secure operations
   - Validate fix effectiveness
   - Update security documentation
   - Conduct post-incident review

This XOS Security Auditor provides comprehensive security coverage specifically designed for XOS framework applications, focusing on the real technology stack and security patterns used in your architecture.