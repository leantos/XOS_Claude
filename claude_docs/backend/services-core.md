# XOS Services Core Reference

## Service Registry

| Code | Service Name | Primary Responsibility | Location |
|------|-------------|----------------------|----------|
| SVC-01 | OperaIncomeAuditService | Hotel PMS income audit processing | Services/OperaIncomeAuditService.cs |
| SVC-02 | BankReconciliationService | Bank statement reconciliation | Services/BankReconciliationService.cs |
| SVC-03 | BacsRefundService | BACS refund processing | Services/BacsRefundService.cs |
| SVC-04 | RefundService | General refund management | Services/RefundService.cs |
| SVC-05 | WorkFlowMasterService | Workflow routing and approval | Services/WorkFlowMasterService.cs |
| SVC-06 | DashboardService | Dashboard metrics and analytics | Services/DashboardService.cs |
| SVC-07 | ReportService | Report generation and export | Services/ReportService.cs |
| SVC-08 | EmailService | Email notifications and alerts | Services/EmailService.cs |
| SVC-09 | UserService | User authentication and profile | Services/UserService.cs |
| SVC-10 | SiteService | Multi-site configuration | Services/SiteService.cs |
| SVC-11 | BankDataService | Bank data import/export | Services/BankDataService.cs |
| SVC-12 | FBVoidService | F&B void transaction handling | Services/FBVoidService.cs |
| SVC-13 | DynamicFormService | Dynamic form generation | Services/DynamicFormService.cs |
| SVC-14 | SchedulerService | Task scheduling and automation | Services/SchedulerService.cs |
| SVC-15 | AuditService | Audit trail and logging | Services/AuditService.cs |
| SVC-16 | ExportService | Data export utilities | Services/ExportService.cs |
| SVC-17 | GeneralService | Common business operations | Services/GeneralService.cs |
| SVC-18 | ComplementaryService | Comp room management | Services/ComplementaryService.cs |
| SVC-19 | RevenueAdjustmentsService | Revenue adjustment processing | Services/RevenueAdjustmentsService.cs |
| SVC-20 | NightChecklistService | Night audit checklist | Services/NightChecklistService.cs |

## Critical Service Methods

### SVC-01: OperaIncomeAuditService
- `AutoFillData(clientID, siteID)` - Auto-populate audit data
- `ProcessIncomeAudit(workFlowSrl)` - Main audit processing
- `ValidateOperaData(reportInfo)` - Validate PMS data
- `GenerateAuditReport(params)` - Generate audit reports
- **Tables**: workflow_master, opera_income_audit, routing_history

### SVC-02: BankReconciliationService
- `ReconcileStatement(bankData)` - Match transactions
- `ImportBankStatement(file)` - Import bank files
- `ProcessUnmatched(transactions)` - Handle exceptions
- **Tables**: bank_reconciliation, bank_statements, bank_transactions

### SVC-03: BacsRefundService
- `CreateRefund(refundData)` - Create new refund
- `ProcessBacsFile(file)` - Process BACS file
- `ValidateRefund(refundId)` - Validate refund details
- **Tables**: bacs_refunds, refund_history, payment_methods

### SVC-05: WorkFlowMasterService
- `InitiateWorkflow(type, data)` - Start workflow
- `RouteToNext(workflowId, decision)` - Route to approver
- `GetPendingApprovals(userId)` - Get pending items
- **Tables**: workflow_master, routing_master, routing_history

## Service Dependencies

```
OperaIncomeAuditService
├── WorkFlowMasterService (workflow routing)
├── EmailService (notifications)
├── ReportService (report generation)
└── AuditService (audit logging)

BankReconciliationService
├── BankDataService (data import)
├── EmailService (alerts)
└── ExportService (export results)

RefundService
├── BacsRefundService (BACS processing)
├── WorkFlowMasterService (approvals)
└── EmailService (notifications)
```

## Service Interfaces

| Interface | Implementation | Purpose |
|-----------|---------------|---------|
| IOperaIncomeAuditService | OperaIncomeAuditService | Opera PMS integration |
| IBankReconciliation | BankReconciliationService | Bank reconciliation |
| IRefundService | RefundService | Refund management |
| IWorkFlowMasterService | WorkFlowMasterService | Workflow engine |
| IEmailService | EmailService | Email operations |
| IReportService | ReportService | Report generation |
| IUserService | UserService | User management |
| ISiteService | SiteService | Site configuration |

## Base Classes

### XOSServiceBase
- **Location**: Core/XOSServiceBase.cs
- **Inherited By**: All services
- **Provides**: 
  - Database connection management
  - Transaction handling
  - Error logging
  - Common utility methods

## Database Operations

### Data Reading Pattern (CRITICAL)
**Always use `row.GetValue<T>()` when reading from database results:**

```csharp
// Example from UserService.cs
await this.DBUtils(connectionKey, true).GetEntityDataListAsync<User.LoginOutput>(query, dbParams, (row) =>
{
    if (usr == null)
    {
        usr = new User.LoginOutput() { Sites = new List<LoginSiteInfo>() };
        usr.ClientID = row.GetValue<short>("ClientID");
        usr.ID = row.GetValue<short>("UserCd");
        usr.Name = row.GetValue<string>("UserName");
        usr.TimezoneID = row.GetValue<string>("TimezoneID");
        password = row.GetValue<string>("Pwd");
    }
    
    // Check string values
    if (row.GetValue<string>("HasSiteAccess") == "Y")
    {
        var grp = row.GetValue<short>("UserGroupID", 0); // with default value
        var siteID = row.GetValue<short>("SiteID");
        var siteName = row.GetValue<string>("SiteName");
    }
    return usr;
});
```

**Common GetValue<T> Types:**
- `row.GetValue<short>("ColumnName")` - for smallint
- `row.GetValue<int>("ColumnName")` - for integer
- `row.GetValue<string>("ColumnName")` - for varchar/text
- `row.GetValue<bool>("ColumnName")` - for boolean
- `row.GetValue<DateTime>("ColumnName")` - for timestamp
- `row.GetValue<decimal>("ColumnName")` - for decimal/money
- `row.GetValue<T>("ColumnName", defaultValue)` - with default if null

### Connection Management
- Primary: PostgreSQL (Npgsql)
- Secondary: SQLite (local operations)
- Connection strings in appsettings.json
- Multi-tenancy via site_id

### Transaction Patterns
```
BeginTransaction()
├── ValidateData()
├── ProcessBusinessLogic()
├── UpdateDatabase()
├── AuditLog()
└── CommitTransaction() / Rollback()
```

## Error Handling

| Error Type | Handler Service | Action |
|------------|----------------|--------|
| Database | XOSServiceBase | Log & Rollback |
| Business | Individual Service | Validate & Return |
| Integration | EmailService | Alert & Retry |
| Authorization | UserService | Deny & Log |

## Performance Considerations

### Cached Services
- SiteService (site configurations)
- UserService (user permissions)
- DashboardService (metrics cache)

### Async Operations
- All database operations use async/await
- Email sending is queued
- Report generation is background task

## Service Registration

### Startup.cs Registration
```
services.AddScoped<IOperaIncomeAuditService, OperaIncomeAuditService>()
services.AddScoped<IBankReconciliation, BankReconciliationService>()
services.AddScoped<IRefundService, RefundService>()
services.AddSingleton<IEmailService, EmailService>()
```

## Critical Integration Points

| Service | External System | Protocol |
|---------|----------------|----------|
| OperaIncomeAuditService | Opera PMS | File Import |
| BankDataService | Bank Systems | CSV/PDF Import |
| EmailService | SMTP Server | SMTP |
| SchedulerService | Windows Task | Timer |

## Service Health Checks

- Database connectivity via GeneralService
- Email service via test send
- File system access via FileManagerService
- External API availability checks

## Service Implementation Best Practices

### Service Design Patterns

#### 1. Dependency Injection
```csharp
public class RefundService : XOSServiceBase, IRefundService
{
    private readonly IWorkFlowMasterService _workflowService;
    private readonly IEmailService _emailService;
    
    public RefundService(
        IServiceProvider serviceProvider,
        ILogger<RefundService> logger,
        IWorkFlowMasterService workflowService,
        IEmailService emailService)
        : base(serviceProvider, logger)
    {
        _workflowService = workflowService;
        _emailService = emailService;
    }
}
```

#### 2. Transaction Management
```csharp
public async Task<Result> ProcessTransactionAsync(TransactionData data)
{
    using var transaction = await BeginTransactionAsync();
    try
    {
        // Validate business rules
        await ValidateDataAsync(data);
        
        // Process business logic
        var result = await ProcessBusinessLogicAsync(data);
        
        // Update database
        await UpdateDatabaseAsync(result);
        
        // Audit logging
        await AuditLogAsync("Transaction processed", result);
        
        await transaction.CommitAsync();
        return Result.Success(result);
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        _logger.LogError(ex, "Transaction failed");
        return Result.Failure(ex.Message);
    }
}
```

#### 3. Error Handling Pattern
```csharp
public async Task<ServiceResult<T>> ExecuteAsync<T>(Func<Task<T>> operation)
{
    try
    {
        var result = await operation();
        return ServiceResult<T>.Success(result);
    }
    catch (BusinessException ex)
    {
        _logger.LogWarning(ex, "Business rule violation");
        return ServiceResult<T>.BusinessError(ex.Message);
    }
    catch (DataException ex)
    {
        _logger.LogError(ex, "Database operation failed");
        return ServiceResult<T>.DataError("Database error occurred");
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unexpected error");
        return ServiceResult<T>.SystemError("System error occurred");
    }
}
```

### Service Layer Architecture Guidelines

#### Multi-Tenancy Support
- All services inherit from XOSServiceBase for tenant context
- Client ID and Site ID passed through service context
- Database connections routed based on tenant configuration

#### Caching Strategy
```csharp
// Memory cache for frequently accessed data
services.AddMemoryCache();

// Distributed cache for shared data
services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379";
    options.InstanceName = "CVS";
});
```

#### Async/Await Best Practices
- All database operations use async methods
- ConfigureAwait(false) for library code
- Avoid blocking calls (.Result, .Wait())
- Use cancellation tokens for long-running operations

#### Service Lifetime Management
| Service Type | Lifetime | Use Case |
|-------------|----------|----------|
| Business Services | Scoped | Per-request operations |
| Email Service | Singleton | Stateless operations |
| Cache Service | Singleton | Shared state |
| Database Context | Scoped | Transaction boundary |

### Performance Optimization

#### 1. Database Query Optimization
- Use parameterized queries to prevent SQL injection
- Implement query result caching for read-heavy operations
- Use bulk operations for batch processing
- Index frequently queried columns

#### 2. Connection Pooling
```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=CVS;Min Pool Size=5;Max Pool Size=100;Connection Lifetime=300;"
  }
}
```

#### 3. Background Processing
```csharp
// Use hosted services for background tasks
public class ReportGenerationService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await ProcessPendingReportsAsync();
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }
}
```

### Security Considerations

#### 1. Input Validation
- Validate all inputs at service layer
- Use data annotations for model validation
- Implement custom validators for complex rules

#### 2. Authorization
- Check permissions at service method level
- Use policy-based authorization
- Audit all authorization failures

#### 3. Data Protection
- Encrypt sensitive data at rest
- Use secure connections for external services
- Implement data masking for logs