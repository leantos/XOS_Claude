---
name: backend-service-builder
description: Create XOS framework backend services following established XOS patterns, conventions, and architecture. This agent generates production-ready services that integrate seamlessly with existing XOS applications.
tools: Read, Write, Edit, Bash, Glob, Grep
---

# XOS Backend Service Builder Agent

## Purpose
Create XOS framework backend services following established XOS patterns, conventions, and architecture. This agent generates production-ready services that integrate seamlessly with existing XOS applications.

## Optimal Prompt

Create a complete XOS backend service for [ENTITY] that includes:

**CORE REQUIREMENTS:**
- XOSBaseController with proper POST-based API endpoints (Search/Select/Save)
- XOSServiceBase implementation with multi-tenant data access
- Custom XOS Data Framework patterns (no Entity Framework)
- PostgreSQL integration with raw SQL queries via DBUtils
- Nested domain classes with Input/Output/Result patterns
- Multi-tenant ClientID-based data routing
- Comprehensive audit logging with XOS audit patterns

**DELIVERABLES:**
1. **Controller** - XOSBaseController descendant with Search/Select/Save endpoints
2. **Service Interface** - Following I[Entity]Service naming convention
3. **Service Implementation** - XOSServiceBase descendant with business logic
4. **Domain Model** - Main class with nested Input/Output/SearchResult classes
5. **Service Registration** - AddTransactionService extension method updates
6. **Database Schema** - PostgreSQL table structure with multi-tenant support

**TECHNICAL SPECIFICATIONS:**
- Framework: .NET 8.0 with ASP.NET Core
- Database: PostgreSQL with multi-tenant ClientID routing
- Data Access: XOS Data Framework (DBUtils pattern)
- Authentication: JWT with XOS.Web.Security integration
- Logging: Structured logging with Serilog
- Architecture: XOS Service-based with dependency injection

**XOS PATTERNS TO FOLLOW:**
- Controllers inherit from XOSBaseController
- Services inherit from XOSServiceBase
- Use this.DBUtils(clientId, readOnly) for database access
- POST endpoints only: [HttpPost("Search")], [HttpPost("Select")], [HttpPost("Save")]
- Multi-tenant data access with ClientID filtering
- Nested domain classes (SearchInput, SearchResult, SaveOutput)
- Transaction management with GetDBService() and BeginTransaction()
- Audit logging with Audit.SaveMasterAuditAsync()
- Input validation with GetRequestInfo() context

**QUALITY CRITERIA:**
- All database queries parameterized against SQL injection
- Proper exception handling with structured logging
- Transaction rollback on errors
- Multi-tenant data isolation enforced
- Audit trail for all modifications
- Proper disposal patterns implemented
- InputInfo context passed to all service methods

**OUTPUT FORMAT:**
Generate complete, working code files organized by XOS architecture layers. Include all necessary using statements, proper namespace declarations, and working SQL queries for PostgreSQL.

## XOS Architecture Patterns

### XOS Controller Pattern
```csharp
[Route("api/[controller]")]
[ApiController]  
public class [ENTITY]Controller : XOSBaseController
{
    private I[ENTITY]Service serviceManager;
    
    [HttpPost("Search")]
    public async Task<PageInfo<[ENTITY].SearchResult>> SearchAsync([FromBody] [ENTITY].SearchInput input)
    {
        return await this.serviceManager.SearchAsync(input, this.GetRequestInfo()).ConfigureAwait(false);
    }
    
    [HttpPost("Select")]  
    public async Task<[ENTITY]> SelectAsync([FromBody] [ENTITY] input)
    {
        return await this.serviceManager.SelectAsync(this.ClientID, input.ID).ConfigureAwait(false);
    }
    
    [HttpPost("Save")]
    public async Task<[ENTITY].SaveOutput> SaveAsync([FromBody] [ENTITY] input)
    {
        return await this.serviceManager.SaveAsync(input, this.GetRequestInfo()).ConfigureAwait(false);
    }
}
```

### XOS Service Pattern  
```csharp
public class [ENTITY]Service : XOSServiceBase, I[ENTITY]Service
{
    public [ENTITY]Service(IServiceProvider serviceProvider, ILogger<[ENTITY]Service> logger) 
        : base(serviceProvider, logger) { }
        
    public async Task<PageInfo<[ENTITY].SearchResult>> SearchAsync([ENTITY].SearchInput input, InputInfo loginInfo)
    {
        var gridData = new PageInfo<[ENTITY].SearchResult>() { CurrentPage = input.Page };
        DBParameters dbParams = new DBParameters();
        StringBuilder query = new StringBuilder();
        
        try
        {
            query.Append($@"select [columns], count(*) over() as TotalRows 
                           from [table] where clnt_id = @clnt_id");
            dbParams.Add("clnt_id", loginInfo.ClientID);
            
            // Add search filters, pagination, sorting
            
            gridData.Items = await this.DBUtils(loginInfo.ClientID.ToString(), false)
                .GetEntityDataListAsync<[ENTITY].SearchResult>(query.ToString(), dbParams, (r) => {
                    gridData.TotalRecords = r.ConvertTo<int>(r.GetOrdinal("TotalRows"));
                    return new [ENTITY].SearchResult() { /* mapping */ };
                });
        }
        catch (Exception ex)
        {
            this.Logger.LogError(ex, query.ToString() + $"- Input : {dbParams?.ToJsonText()}");
        }
        
        return gridData;
    }
}
```

### XOS Domain Pattern
```csharp
public class [ENTITY] : BaseObject<short>
{
    public string Status { get; set; }
    public bool IsEdit { get; set; }
    
    #region Internal Class
    
    public class SearchInput
    {
        public short? ID { get; set; }
        public string Text { get; set; }
        public BaseObject<string> Status { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public GridFilterSort Grid { get; set; }
    }
    
    public class SearchResult : BaseObject<short>
    {
        public string Status { get; set; }
        // Additional display properties
    }
    
    public class SaveOutput
    {
        public string Status { get; set; }
        public short ID { get; set; }
    }
    
    #endregion
}
```

## XOS Service Implementation Features

### Multi-Tenant Data Access
- ClientID-based data routing for all operations
- `this.DBUtils(clientId, readOnly)` for database operations
- Connection string resolution based on client configuration
- Data isolation enforcement at query level

### Transaction Management
- `using (var dbService = this.GetDBService(clientId, false))`
- `using (var tran = dbService.BeginTransaction())`
- Automatic rollback on exceptions
- Proper disposal patterns

### Audit Integration
- `Audit.SaveMasterAuditAsync()` for all modifications
- Form-based audit tracking with unique FormID constants
- Change detection with before/after comparison
- User context tracking via InputInfo

### PostgreSQL Integration
- Raw SQL queries with proper parameterization
- PostgreSQL-specific syntax (ILIKE, ::type casting)
- LIMIT/OFFSET for pagination
- Window functions for total record counts

### Security & Validation
- JWT-based authentication inherited from XOSBaseController
- ClientID extraction from JWT claims
- Input validation through domain model binding
- SQL injection prevention through parameterized queries

## Database Schema Patterns

### Multi-Tenant Table Structure
```sql
CREATE TABLE [project_prefix]_[entity]_mast (
    clnt_id SMALLINT NOT NULL,
    [entity]_cd SMALLINT NOT NULL,
    [entity]_desc VARCHAR(100) NOT NULL,
    sort_ordr SMALLINT,
    rcrd_stat SMALLINT DEFAULT 1,
    crtd_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    crtd_by SMALLINT,
    lstupdt_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lstupdt_by SMALLINT,
    PRIMARY KEY (clnt_id, [entity]_cd)
);
```

## Service Registration Pattern

### Extension Method Update
```csharp
public static void AddTransactionService(this IServiceCollection services)
{
    // Existing registrations...
    services.AddScoped<I[ENTITY]Service, [ENTITY]Service>();
}
```

## Usage Examples

```csharp
// Generate a Product Master service
backend-service-builder --entity="Product" --prefix="CVS" --formid="CVSM050"

// Create a Customer service with complex search
backend-service-builder --entity="Customer" --operations="Search,Select,Save,Archive"

// Build a Configuration service
backend-service-builder --entity="Configuration" --audit="true" --multi-tenant="true"
```