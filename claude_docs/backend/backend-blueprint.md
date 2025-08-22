# Backend Development Blueprint

## System Overview

### Architecture Type
**Custom XOS Framework Architecture** - This is NOT standard ASP.NET Core. The system uses a proprietary XOS framework that wraps ASP.NET Core with custom patterns for transactions, database access, and API design.

### 🚨 Critical Differences from Standard ASP.NET Core
- **API Pattern**: 95% POST endpoints (NOT RESTful)
- **Database Access**: MUST use `row.GetValue<T>("ColumnName")` pattern
- **Transactions**: Complex nested patterns with SignalR notifications
- **Response Type**: Return domain types directly (no IActionResult)
- **Multi-tenant**: Key-based routing in connection strings

### Technology Stack (Customizable)
- **Runtime:** .NET 8.0+ (C#)
- **Framework:** XOS-wrapped ASP.NET Core Web API
- **Database:** PostgreSQL (Primary), SQLite (Secondary/Local) *- Replace with your database*
- **ORM:** Custom XOS Data Framework (NOT Entity Framework)
- **Authentication:** Custom XOS JWT Factory (configurable expiration)
- **Real-time Communication:** SignalR
- **Logging:** Serilog with enrichers
- **Frontend:** XOS Framework + React + jQuery (hybrid)
- **Document Processing:** PdfPig, custom document processors *- Customize as needed*
- **Security:** Custom XOS Security Framework with CSP

### Project Structure
```
{ProjectName} Solution/
├── {ProjectName}.WebApi/          # Main Web API Project
│   ├── Controllers/               # API Controllers
│   ├── Domain/                    # Web API Domain Models
│   ├── Extensions/                # Service Extensions & Configuration
│   ├── Services/                  # Web API Services (Auth, Token Management)
│   ├── SignalR/                   # Real-time Communication Hubs
│   ├── PDFConverter/              # PDF Processing Tools
│   ├── Files/                     # File Storage
│   ├── UIPages/                   # React Frontend Application
│   └── wwwroot/                   # Static Web Content
├── {ProjectName}.Transaction/     # Business Logic Layer
│   ├── Core/                      # Core Base Classes
│   ├── Domain/                    # Business Domain Models
│   ├── Interfaces/                # Service Contracts
│   ├── Services/                  # Business Logic Services
│   ├── Extensions/                # Transaction Extensions
│   └── Utils/                     # Utility Classes
└── Documents/                     # Database Scripts & Documentation
    └── DB/                        # Database Files
```

## Data Flow Architecture

### Request Flow Diagram
```
Client (React SPA)
    ↓ HTTP/WebSocket
[Authentication Middleware]
    ↓
[CORS Policy & Security Headers]
    ↓
[Controller] → [Business Service] → [Database Layer]
    ↓                ↓                    ↓
[Response] ← [Domain Models] ← [PostgreSQL/SQLite]
    ↑
[SignalR Hub] (Real-time notifications)
```

### Component Responsibilities
1. **Controllers** - HTTP request/response handling, authentication validation, input sanitization
2. **Business Services** - Domain logic, data validation, business rules enforcement
3. **Domain Models** - Data structures, entity definitions, business objects
4. **Database Layer** - Data access, query execution, connection management
5. **SignalR Hubs** - Real-time communication, push notifications
6. **Authentication Layer** - JWT token management, user validation, session handling

## API Development Roadmap

### Phase 1: Environment Setup (Day 1)
```bash
# 1. Create Solution Structure
dotnet new sln -n {ProjectName}
dotnet new webapi -n {ProjectName}.WebApi
dotnet new classlib -n {ProjectName}.Transaction
dotnet sln add {ProjectName}.WebApi {ProjectName}.Transaction

# 2. Install Core Dependencies
dotnet add {ProjectName}.WebApi package Microsoft.AspNetCore.Mvc.NewtonsoftJson
dotnet add {ProjectName}.WebApi package Npgsql
dotnet add {ProjectName}.WebApi package Serilog.AspNetCore
dotnet add {ProjectName}.WebApi package Swashbuckle.AspNetCore
dotnet add {ProjectName}.Transaction package Microsoft.Extensions.DependencyInjection.Abstractions
```

**Key Configuration Files:**
- `appsettings.json` - Database connections, JWT settings, logging configuration
- `Program.cs` - Service registration, middleware pipeline
- `ServiceExtensions.cs` - Custom service registration methods

### Phase 2: Authentication & Security Layer (Day 2-3)
**Create Authentication Components:**
1. `Domain/AppConstants.cs` - Application constants
2. `Domain/AppClaims.cs` - JWT claim definitions
3. `Services/TokenStoreService.cs` - Token storage management
4. `Services/TokenValidatorService.cs` - Token validation logic
5. `Controllers/AuthController.cs` - Authentication endpoints

**JWT Configuration Template:**
```csharp
"JwtOptions": {
  "SecretKey": "your-secure-secret-key",
  "EncryptKey": "your-encrypt-key",
  "Issuer": "http://localhost:5139",
  "Audience": "{PROJECT_NAME}",
  "AccessTokenExpirationMinutes": 5,
  "RefreshTokenExpirationMinutes": 1440
}
```

### Phase 3: Database Layer Setup (Day 3-4)
**Database Configuration:**
1. Configure multi-database support in `appsettings.json`
2. Implement custom `XOSServiceBase` for database operations
3. Create domain models in `CVS.Transaction/Domain/`
4. Set up connection string management with client-based routing

**Database Model Template:**
```csharp
public class BaseObject<T>
{
    public T ID { get; set; }
    public string Text { get; set; }
}

// Business Entity Example - Replace with your entities
public class BusinessEntity : BaseObject<int>
{
    public short ClientID { get; set; }
    public short SiteID { get; set; }
    public DateTime TransactionDate { get; set; }
    // Additional properties specific to your domain...
}
```

### Phase 4: Business Services Layer (Day 4-5)
**Create Service Interfaces:**
1. `Interfaces/IUserService.cs` - User management operations
2. `Interfaces/IBusinessEntityService.cs` - Core business operations *- Replace with your domain*
3. `Interfaces/IDashboardService.cs` - Dashboard data services

**Service Implementation Pattern:**
```csharp
public class UserService : XOSServiceBase, IUserService
{
    public UserService(IServiceProvider serviceProvider, ILogger<UserService> logger)
        : base(serviceProvider, logger) { }
    
    public async Task<LoginOutput> SigninAsync(LoginInput login)
    {
        // Business logic implementation
        // Database operations using this.DBUtils()
        // Error handling and logging
    }
}
```

### Phase 5: API Controllers (Day 5-6)
**Create Controllers:**
1. `Controllers/AuthController.cs` - Authentication & authorization
2. `Controllers/BusinessEntityController.cs` - Core business operations *- Replace with your domain*
3. `Controllers/DashboardController.cs` - Dashboard APIs
4. `Controllers/ProcessController.cs` - Business process operations *- Customize for your workflows*

**Controller Template:**
```csharp
[Authorize]
[EnableCors(AppConstants.CROS_POLICY_NAME)]
[Produces("application/json")]
[Route("api/[controller]")]
[ApiController]
public class BankDataController : ControllerBase
{
    private readonly IBankDataService _bankDataService;
    private readonly ILogger<BankDataController> _logger;

    public BankDataController(IBankDataService bankDataService, ILogger<BankDataController> logger)
    {
        _bankDataService = bankDataService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult> GetBankData([FromQuery] BankDataFilter filter)
    {
        try
        {
            var result = await _bankDataService.GetBankDataAsync(filter);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving bank data");
            return StatusCode(500, "Internal server error");
        }
    }
}
```

### Phase 6: Real-time Communication (Day 6-7)
**SignalR Implementation:**
1. `SignalR/NotificationsHub.cs` - Real-time hub
2. `Services/SignalRNotifierService.cs` - Notification service
3. Configure SignalR in `Program.cs`

**SignalR Hub Template:**
```csharp
public class NotificationsHub : Hub
{
    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    public async Task SendNotification(string group, string message)
    {
        await Clients.Group(group).SendAsync("ReceiveNotification", message);
    }
}
```

### Phase 7: Frontend Integration (Day 7-8)
**React Integration:**
- Configure static file serving in `Program.cs`
- Set up fallback routing for SPA
- Implement JWT token handling in React
- Configure SignalR client connections

## API Endpoints Overview

### Authentication Endpoints
- `POST /api/auth/sign-in` - User authentication
- `POST /api/auth/refresh-token` - Token refresh
- `POST /api/auth/sign-out` - User logout
- `POST /api/auth/GetSecretQuestion` - Password recovery
- `POST /api/auth/ChangePassword` - Password change

### Business Operation Endpoints
- `GET/POST /api/bankdata` - Bank data management
- `GET/POST /api/bankreconciliation` - Bank reconciliation
- `GET /api/dashboard` - Dashboard analytics
- `GET/POST /api/department` - Department management
- `GET/POST /api/bacsrefund` - BACS refund processing

### File Management
- File upload/download operations
- PDF processing endpoints
- CSV import/export functionality

## Database Schema Design

### Core Tables Structure
```sql
-- Client Management
cvs_clnt_mast (clnt_id, clnt_ref, clnt_nam, rcrd_stat)

-- User Management  
cvs_usr_mast (clnt_id, usr_cd, dsply_nam, login_id, passwd, rcrd_stat)
cvs_usr_site_dtls (clnt_id, usr_cd, site_id, usr_grp_dtl, lgn_vld_frm, lgn_vld_till)

-- Site & Access Control
cvs_site_mast (clnt_id, site_id, site_nam, tm_zon_txt, rcrd_stat)
cvs_usr_grp_mast (clnt_id, site_id, usr_grp_cd, usr_grp_desc)
cvs_usr_grp_accs_dtls (clnt_id, site_id, usr_grp_cd, fnctn_cd)

-- Business Entities
cvs_bank_data (clnt_id, site_id, transaction data...)
cvs_bank_reconciliation (reconciliation data...)
```

### Database Connection Management
- Multi-tenant architecture with client-based connection routing
- Separate read/write connection strings
- Connection pooling and timeout management
- Support for both PostgreSQL and SQLite databases

## Authentication & Authorization Flow

### JWT Token Structure
```json
{
  "sub": "user_id",
  "name": "User Name",
  "ClientID": "1",
  "SiteID": "1", 
  "UserGroupID": "1",
  "TimezoneID": "UTC",
  "exp": 1234567890,
  "iss": "CVS_API"
}
```

### Authentication Process
1. **Login Request** - Validate credentials against database
2. **Multi-site Handling** - Present site/role selection if multiple options
3. **Token Generation** - Create JWT with user claims
4. **Token Storage** - Store refresh token in database
5. **Authorization** - Validate token on subsequent requests
6. **Token Refresh** - Automatic token renewal process

### Security Features
- Password hashing with secure algorithms
- Refresh token rotation
- Token revocation on logout
- IP address tracking
- Session timeout management
- Secret question-based password recovery

## Business Logic & Service Layers

### Service Layer Architecture
- **Base Service Class** - `XOSServiceBase` provides common functionality
- **Dependency Injection** - Constructor-based DI for all services
- **Error Handling** - Consistent exception handling and logging
- **Database Access** - Abstracted through `DBUtils` helper methods
- **Multi-tenancy** - Client-specific database connections

### Key Business Services
1. **UserService** - User authentication, authorization, profile management
2. **BankDataService** - Bank transaction processing and management
3. **BankReconciliationService** - Automated bank statement reconciliation
4. **DashboardService** - Analytics and reporting data aggregation
5. **AuditService** - System audit logging and compliance tracking

### Data Access Patterns
- **Repository Pattern** - Encapsulated in service base classes
- **Unit of Work** - Transaction management across operations
- **Connection Management** - Client-based connection routing
- **Query Building** - Dynamic SQL generation with parameterization

## Testing Strategy

### Unit Testing Structure
```
CVS.Tests/
├── Controllers/
│   ├── AuthControllerTests.cs
│   ├── BankDataControllerTests.cs
│   └── DashboardControllerTests.cs
├── Services/
│   ├── UserServiceTests.cs
│   ├── BankDataServiceTests.cs
│   └── TokenStoreServiceTests.cs
└── Integration/
    ├── AuthenticationFlowTests.cs
    └── DatabaseConnectionTests.cs
```

### Test Dependencies Setup
```csharp
// Test service configuration
services.AddScoped<IUserService, UserService>();
services.AddLogging();
services.Configure<AppSetting>(configuration);

// Mock database connections for testing
services.AddSingleton<IDBFactory, MockDBFactory>();
```

### API Testing Examples
```bash
# Authentication Test
curl -X POST http://localhost:5139/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "ClientReference": "TEST",
    "LoginID": "admin",
    "Password": "password123"
  }'

# Get Bank Data
curl -X GET http://localhost:5139/api/bankdata \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Real-time Notification Test
# Connect to SignalR hub at /hub/notificationhub
```

## Development Workflow

### Local Development Setup
1. **Prerequisites:** .NET 8 SDK, PostgreSQL, Node.js (for React frontend)
2. **Database Setup:** Create PostgreSQL database and run schema scripts
3. **Configuration:** Update `appsettings.Development.json` with local settings
4. **Build & Run:** `dotnet run --project CVS.WebApi`
5. **Frontend Development:** `npm start` in UIPages directory

### Environment Configuration
```json
{
  "XOSConfig": {
    "DBSettings": [{
      "Keys": ["1", "LOCAL"],
      "WriteConnectionString": "Server=localhost;Database=CVS_DEV;...",
      "ReadConnectionString": "Server=localhost;Database=CVS_DEV;...",
      "ProviderName": "Npgsql"
    }],
    "SqliteConnection": "Files\\DB File\\SqliteDB.db",
    "CorsIPs": ["http://localhost:3000"]
  }
}
```

### Development Commands
```bash
# Build solution
dotnet build

# Run with hot reload
dotnet watch --project CVS.WebApi

# Run tests
dotnet test

# Create migration (if using EF Core)
dotnet ef migrations add InitialCreate

# Frontend development
cd CVS.WebApi/UIPages
npm install
npm start
```

## Error Handling & Logging

### Logging Configuration
- **Serilog** with structured logging
- **File-based logging** with daily rotation
- **Console logging** for development
- **Request/Response logging** with user context
- **Error tracking** with correlation IDs

### Error Handling Strategy
```csharp
public async Task<ActionResult> ExampleAction()
{
    try
    {
        // Business logic
        var result = await _service.ProcessDataAsync();
        return Ok(result);
    }
    catch (BusinessException ex)
    {
        _logger.LogWarning(ex, "Business logic error: {Message}", ex.Message);
        return BadRequest(ex.Message);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unexpected error in {Action}", nameof(ExampleAction));
        return StatusCode(500, "Internal server error");
    }
}
```

### Response Standardization
```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T Data { get; set; }
    public string ErrorMessage { get; set; }
    public List<string> ValidationErrors { get; set; }
}
```

## Deployment & Scaling

### Deployment Approach
The CVS application is deployed as a standalone .NET application without containerization. The deployment process involves:
- Publishing the .NET application using `dotnet publish`
- Deploying to IIS or hosting as a Windows/Linux service
- Configuring the production environment settings in `appsettings.Production.json`
- Setting up the PostgreSQL database connections for production

### Performance Considerations
- **Connection Pooling** - Database connection management
- **Caching Strategy** - Redis for session and data caching
- **Load Balancing** - Multiple API instances behind load balancer
- **Database Optimization** - Query performance tuning and indexing
- **File Storage** - Cloud storage for file management
- **Monitoring** - Application performance monitoring (APM)

## Replication Guide for Similar Systems

### For Building Similar Financial/ERP Systems

1. **Architecture Foundation**
   - Use the layered architecture pattern with clear separation of concerns
   - Implement multi-tenant database architecture
   - Set up comprehensive authentication/authorization system
   - Use SignalR for real-time features

2. **Core Components to Replicate**
   ```csharp
   // Base service class
   public abstract class ServiceBase
   {
       protected IServiceProvider ServiceProvider { get; }
       protected ILogger Logger { get; }
       // Database access methods
       // Common utility functions
   }

   // Multi-tenant configuration
   public class TenantSettings
   {
       public List<string> Keys { get; set; }
       public string ConnectionString { get; set; }
       public string ProviderName { get; set; }
   }
   ```

3. **Security Implementation**
   - JWT-based authentication with custom claims
   - Refresh token rotation mechanism  
   - Role-based access control with site/group hierarchy
   - Secure password handling and recovery

4. **Database Design Patterns**
   - Client-based partitioning for multi-tenancy
   - Audit logging for all transactions
   - Flexible user-site-group relationship model
   - Standardized naming conventions

5. **API Design Standards**
   - RESTful endpoint structure
   - Consistent error handling and response formats
   - Comprehensive input validation
   - Swagger/OpenAPI documentation

### Customization Checklist
- [ ] Update domain models for specific business requirements
- [ ] Modify authentication claims based on user roles
- [ ] Adapt database schema for business entities
- [ ] Configure CORS policies for client applications
- [ ] Set up logging and monitoring for production environment
- [ ] Implement business-specific validation rules
- [ ] Create custom SignalR hubs for real-time features
- [ ] Configure file storage and processing pipelines

## Next Steps for Implementation
1. **Foundation Phase** - Set up project structure and basic authentication
2. **Core Services** - Implement primary business logic services
3. **API Layer** - Create controllers and endpoint mapping
4. **Frontend Integration** - Connect React SPA with backend APIs
5. **Testing Implementation** - Comprehensive test coverage
6. **Deployment Setup** - Production environment configuration
7. **Performance Optimization** - Fine-tune for production loads
8. **Documentation** - API documentation and developer guides

This blueprint provides a complete roadmap for building enterprise-grade .NET Core applications with multi-tenant architecture, comprehensive security, and real-time capabilities. The modular design allows for easy customization while maintaining architectural consistency and best practices.