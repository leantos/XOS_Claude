# 🔧 XOS Backend Complete Implementation Guide

## Overview
This guide provides comprehensive patterns for implementing backend services using the XOS framework, including transaction management, database operations, service patterns, and error handling.

## 📋 Table of Contents
1. [Service Architecture](#service-architecture)
2. [Database Operations](#database-operations)
3. [Transaction Patterns](#transaction-patterns)
4. [Service Implementation](#service-implementation)
5. [Error Handling](#error-handling)
6. [Multi-Tenant Patterns](#multi-tenant-patterns)
7. [File Operations](#file-operations)
8. [Background Jobs](#background-jobs)
9. [Caching Strategies](#caching-strategies)
10. [Performance Optimization](#performance-optimization)

## Service Architecture

### XOS Service Base Class
```csharp
public abstract class XOSServiceBase : IDisposable
{
    protected ILogger Logger { get; }
    protected IConfiguration Configuration { get; }
    
    // Critical: Returns database service with transaction owner
    protected IDBService GetDBService(string dbKey, object transOwner = null)
    {
        // XOS framework handles connection pooling
        return DBServiceFactory.GetService(dbKey, transOwner);
    }
    
    // Utility for database operations
    protected DBUtils DBUtils(string clientId, bool readOnly = false)
    {
        var connectionKey = GetConnectionKey(clientId);
        return new DBUtils(connectionKey, readOnly);
    }
    
    // Multi-tenant connection resolution
    private string GetConnectionKey(string clientId)
    {
        // Resolves to Database1, Database2, etc. based on client
        return Configuration.GetConnectionKey(clientId);
    }
    
    public abstract void Dispose();
}
```

### Service Implementation Pattern
```csharp
public class EntityService : XOSServiceBase, IEntityService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IWorkFlowMasterService _workflowService;
    
    public EntityService(
        ILogger<EntityService> logger,
        IConfiguration configuration,
        IHubContext<NotificationHub> hubContext,
        IWorkFlowMasterService workflowService) 
        : base(logger, configuration)
    {
        _hubContext = hubContext;
        _workflowService = workflowService;
    }
    
    public async Task<Entity.DBResponse> SaveAsync(
        Entity.SaveInput input, 
        RequestInfo requestInfo,
        List<IFormFile> files)
    {
        // Implementation follows transaction pattern
    }
    
    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _workflowService?.Dispose();
        }
    }
}
```

## Database Operations

### 🔴 CRITICAL: XOS Database Access Pattern

#### ✅ CORRECT - Using row.GetValue<T>
```csharp
public async Task<List<Customer>> GetCustomersAsync(RequestInfo info)
{
    var query = @"
        SELECT id, name, email, phone, created_date
        FROM customers
        WHERE client_id = @client_id AND site_id = @site_id";
    
    var parameters = new Dictionary<string, object>
    {
        ["@client_id"] = info.ClientId,
        ["@site_id"] = info.SiteId
    };
    
    var customers = new List<Customer>();
    
    await DBUtils(info.ClientId, true).GetEntityDataListAsync<Customer>(
        query, 
        parameters, 
        (row) => new Customer
        {
            Id = row.GetValue<int>("id"),
            Name = row.GetValue<string>("name"),
            Email = row.GetValue<string>("email", ""),  // Default value
            Phone = row.GetValue<string>("phone"),
            CreatedDate = row.GetValue<DateTime>("created_date")
        });
    
    return customers;
}
```

#### ❌ WRONG - Standard ADO.NET Pattern
```csharp
// DO NOT USE - Will cause runtime errors
row["id"]  // Wrong
row.GetInt32(0)  // Wrong
Convert.ToInt32(row["id"])  // Wrong
```

### Dataset Operations
```csharp
public async Task<OnloadData> LoadInitDataAsync(SearchInput input, RequestInfo info)
{
    var output = new OnloadData();
    var query = @"
        -- Query 1: Get config
        SELECT * FROM site_config WHERE site_id = @site_id;
        
        -- Query 2: Get departments
        SELECT dept_id, dept_name FROM departments WHERE active = true;
        
        -- Query 3: Get user permissions
        SELECT module, can_edit, can_approve FROM user_permissions WHERE user_id = @user_id;";
    
    var parameters = new Dictionary<string, object>
    {
        ["@site_id"] = info.SiteId,
        ["@user_id"] = info.UserId
    };
    
    using (var ds = await DBUtils(info.ClientId, true).GetDataSetAsync(query, parameters))
    {
        if (ds?.Tables.Count > 0)
        {
            // Table 0: Config
            if (ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];
                output.Config = new SiteConfig
                {
                    ConfigLimit = row.GetValue<decimal>("config_limit"),
                    RequireApproval = row.GetValue<bool>("require_approval")
                };
            }
            
            // Table 1: Departments
            if (ds.Tables[1].Rows.Count > 0)
            {
                output.Departments = new List<Department>();
                foreach (DataRow row in ds.Tables[1].Rows)
                {
                    output.Departments.Add(new Department
                    {
                        Id = row.GetValue<int>("dept_id"),
                        Name = row.GetValue<string>("dept_name")
                    });
                }
            }
            
            // Table 2: Permissions
            if (ds.Tables[2].Rows.Count > 0)
            {
                output.Permissions = ds.Tables[2].AsEnumerable()
                    .Select(row => new Permission
                    {
                        Module = row.GetValue<string>("module"),
                        CanEdit = row.GetValue<bool>("can_edit"),
                        CanApprove = row.GetValue<bool>("can_approve")
                    }).ToList();
            }
        }
    }
    
    return output;
}
```

## Transaction Patterns

### 🔴 CRITICAL: Complex Nested Transaction Pattern

#### Standard Transaction with SignalR
```csharp
public async Task<DBResponse> SaveWithWorkflowAsync(SaveInput input, RequestInfo info)
{
    var response = new DBResponse();
    IDBService dbService = null;
    IDbTransaction transaction = null;
    
    try
    {
        // Get database service with transaction owner
        dbService = GetDBService(info.ClientId, this);
        transaction = dbService.BeginTransaction();
        
        // Step 1: Save main entity
        var entityId = await SaveEntityAsync(dbService, input, info);
        
        // Step 2: Create workflow
        var workflowId = await CreateWorkflowAsync(dbService, entityId, info);
        
        // Step 3: Save history
        await SaveHistoryAsync(dbService, entityId, "Created", info);
        
        // Step 4: Update related tables
        await UpdateRelatedDataAsync(dbService, entityId, info);
        
        // CRITICAL: Commit BEFORE SignalR notifications
        transaction.Commit();
        
        // Step 5: Send notifications AFTER commit
        await SendNotificationsAsync(entityId, workflowId, info);
        
        response.Success = true;
        response.EntityId = entityId;
        response.WorkflowId = workflowId;
        response.Message = "Saved successfully";
    }
    catch (Exception ex)
    {
        transaction?.Rollback();
        Logger.LogError(ex, "Error saving entity");
        response.Success = false;
        response.Error = ex.Message;
        throw;
    }
    finally
    {
        transaction?.Dispose();
        dbService?.Dispose();
    }
    
    return response;
}

private async Task SendNotificationsAsync(int entityId, int workflowId, RequestInfo info)
{
    // SignalR notifications - ALWAYS after commit
    await _hubContext.Clients.Group($"site-{info.SiteId}")
        .SendAsync("EntityCreated", new { entityId, workflowId });
    
    // Email notifications
    await _emailService.SendNotificationAsync(
        "New entity created", 
        $"Entity {entityId} has been created"
    );
}
```

#### Nested Service Transactions
```csharp
public async Task<bool> ProcessComplexOperationAsync(Input input, RequestInfo info)
{
    IDBService dbService = null;
    IDbTransaction transaction = null;
    
    try
    {
        // Parent transaction
        dbService = GetDBService(info.ClientId, this);
        transaction = dbService.BeginTransaction();
        
        // Call other services with same transaction context
        var entityResult = await _entityService.CreateEntityInTransactionAsync(
            input.EntityData, 
            info, 
            dbService  // Pass db service to maintain transaction
        );
        
        var workflowResult = await _workflowService.InitiateWorkflowInTransactionAsync(
            entityResult.EntityId,
            "ENTITY",
            info,
            dbService  // Same transaction
        );
        
        // All operations succeed or all fail
        transaction.Commit();
        
        // Post-commit operations
        await SendNotificationsAsync(entityResult.EntityId, info);
        
        return true;
    }
    catch (Exception ex)
    {
        transaction?.Rollback();
        Logger.LogError(ex, "Complex operation failed");
        throw;
    }
    finally
    {
        transaction?.Dispose();
        dbService?.Dispose();
    }
}
```

### Bulk Operations with Transaction
```csharp
public async Task<BulkResponse> BulkInsertAsync(List<Item> items, RequestInfo info)
{
    var response = new BulkResponse();
    IDBService dbService = null;
    IDbTransaction transaction = null;
    
    try
    {
        dbService = GetDBService(info.ClientId, this);
        transaction = dbService.BeginTransaction();
        
        var successCount = 0;
        var failedItems = new List<FailedItem>();
        
        foreach (var item in items)
        {
            try
            {
                var query = @"
                    INSERT INTO items (name, value, client_id, site_id)
                    VALUES (@name, @value, @client_id, @site_id)
                    RETURNING id";
                
                var parameters = new Dictionary<string, object>
                {
                    ["@name"] = item.Name,
                    ["@value"] = item.Value,
                    ["@client_id"] = info.ClientId,
                    ["@site_id"] = info.SiteId
                };
                
                var id = await dbService.ExecuteScalarAsync<int>(query, parameters);
                item.Id = id;
                successCount++;
            }
            catch (Exception ex)
            {
                failedItems.Add(new FailedItem 
                { 
                    Item = item, 
                    Error = ex.Message 
                });
            }
        }
        
        if (failedItems.Count == 0)
        {
            transaction.Commit();
            response.Success = true;
        }
        else if (successCount > 0)
        {
            // Partial success - decide based on business logic
            transaction.Rollback();
            response.Success = false;
        }
        
        response.ProcessedCount = successCount;
        response.FailedItems = failedItems;
    }
    catch (Exception ex)
    {
        transaction?.Rollback();
        throw;
    }
    finally
    {
        transaction?.Dispose();
        dbService?.Dispose();
    }
    
    return response;
}
```

## Service Implementation

### Complete Service Example
```csharp
public class CustomerService : XOSServiceBase, ICustomerService
{
    private readonly IWorkFlowMasterService _workflowService;
    private readonly IEmailService _emailService;
    private readonly IHubContext<NotificationHub> _hubContext;
    
    public CustomerService(
        ILogger<CustomerService> logger,
        IConfiguration configuration,
        IWorkFlowMasterService workflowService,
        IEmailService emailService,
        IHubContext<NotificationHub> hubContext)
        : base(logger, configuration)
    {
        _workflowService = workflowService;
        _emailService = emailService;
        _hubContext = hubContext;
    }
    
    public async Task<Customer.OnloadData> LoadInitDataAsync(
        Customer.SearchInput input, 
        RequestInfo info)
    {
        var output = new Customer.OnloadData();
        
        try
        {
            // Load dropdowns
            output.CustomerTypes = await GetCustomerTypesAsync(info);
            output.Departments = await GetDepartmentsAsync(info);
            
            // Load draft if exists
            if (input.DraftId > 0)
            {
                output.DraftData = await GetDraftAsync(input.DraftId, info);
            }
            
            // Load permissions
            output.Permissions = await GetUserPermissionsAsync(info);
            
            return output;
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error loading init data");
            throw;
        }
    }
    
    public async Task<Customer.DBResponse> SaveAsync(
        Customer.SaveInput input,
        RequestInfo info,
        List<IFormFile> files)
    {
        var response = new Customer.DBResponse();
        IDBService dbService = null;
        IDbTransaction transaction = null;
        
        try
        {
            // Validate input
            var validationResult = ValidateInput(input);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.Errors = validationResult.Errors;
                return response;
            }
            
            dbService = GetDBService(info.ClientId, this);
            transaction = dbService.BeginTransaction();
            
            // Save or update customer
            int customerId;
            if (input.CustomerId > 0)
            {
                customerId = await UpdateCustomerAsync(dbService, input, info);
                await SaveHistoryAsync(dbService, customerId, "Updated", info);
            }
            else
            {
                customerId = await InsertCustomerAsync(dbService, input, info);
                await SaveHistoryAsync(dbService, customerId, "Created", info);
            }
            
            // Save attachments
            if (files?.Count > 0)
            {
                await SaveAttachmentsAsync(dbService, customerId, files, info);
            }
            
            // Create or update workflow
            int workflowId = 0;
            if (input.SubmitForApproval)
            {
                workflowId = await _workflowService.InitiateWorkflowInTransactionAsync(
                    customerId,
                    "CUSTOMER",
                    info,
                    dbService
                );
            }
            
            // Commit transaction
            transaction.Commit();
            
            // Post-commit operations
            if (workflowId > 0)
            {
                await NotifyApproversAsync(customerId, workflowId, info);
            }
            
            response.Success = true;
            response.CustomerId = customerId;
            response.WorkflowId = workflowId;
            response.Message = "Customer saved successfully";
        }
        catch (Exception ex)
        {
            transaction?.Rollback();
            Logger.LogError(ex, "Error saving customer");
            response.Success = false;
            response.Error = ex.Message;
        }
        finally
        {
            transaction?.Dispose();
            dbService?.Dispose();
        }
        
        return response;
    }
    
    private async Task<int> InsertCustomerAsync(
        IDBService dbService,
        Customer.SaveInput input,
        RequestInfo info)
    {
        var query = @"
            INSERT INTO customers (
                name, email, phone, customer_type_id,
                department_id, client_id, site_id,
                created_by, created_date
            ) VALUES (
                @name, @email, @phone, @customer_type_id,
                @department_id, @client_id, @site_id,
                @created_by, @created_date
            ) RETURNING id";
        
        var parameters = new Dictionary<string, object>
        {
            ["@name"] = input.Name,
            ["@email"] = input.Email,
            ["@phone"] = input.Phone,
            ["@customer_type_id"] = input.CustomerTypeId,
            ["@department_id"] = input.DepartmentId,
            ["@client_id"] = info.ClientId,
            ["@site_id"] = info.SiteId,
            ["@created_by"] = info.UserId,
            ["@created_date"] = DateTime.UtcNow
        };
        
        return await dbService.ExecuteScalarAsync<int>(query, parameters);
    }
    
    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _workflowService?.Dispose();
            _emailService?.Dispose();
        }
    }
}
```

## Error Handling

### Service-Level Error Handling
```csharp
public async Task<Response> ProcessAsync(Input input, RequestInfo info)
{
    var response = new Response();
    
    try
    {
        // Business logic validation
        if (input.Amount <= 0)
        {
            throw new BusinessException("Amount must be greater than 0");
        }
        
        // Process
        var result = await ProcessInternalAsync(input, info);
        response.Success = true;
        response.Data = result;
    }
    catch (BusinessException bex)
    {
        // Business rule violations - don't log as errors
        response.Success = false;
        response.BusinessError = bex.Message;
        response.ErrorCode = bex.ErrorCode;
    }
    catch (DataException dex)
    {
        // Database errors
        Logger.LogError(dex, "Database error in ProcessAsync");
        response.Success = false;
        response.Error = "Database operation failed";
        response.TechnicalError = dex.Message;  // Only in dev
    }
    catch (Exception ex)
    {
        // Unexpected errors
        Logger.LogError(ex, "Unexpected error in ProcessAsync");
        response.Success = false;
        response.Error = "An unexpected error occurred";
        
        // Re-throw critical errors
        if (ex is OutOfMemoryException || ex is StackOverflowException)
        {
            throw;
        }
    }
    
    return response;
}
```

### Custom Business Exception
```csharp
public class BusinessException : Exception
{
    public string ErrorCode { get; }
    public Dictionary<string, string> ValidationErrors { get; }
    
    public BusinessException(string message, string errorCode = null) 
        : base(message)
    {
        ErrorCode = errorCode;
    }
    
    public BusinessException(Dictionary<string, string> validationErrors)
        : base("Validation failed")
    {
        ValidationErrors = validationErrors;
        ErrorCode = "VALIDATION_ERROR";
    }
}
```

## Multi-Tenant Patterns

### Connection Resolution
```csharp
public class MultiTenantService : XOSServiceBase
{
    protected override string GetConnectionKey(string clientId)
    {
        // Configuration structure:
        // "Database1": { "Keys": ["1", "ABC"] }
        // "Database2": { "Keys": ["2", "XYZ"] }
        
        var connections = Configuration.GetSection("DatabaseConnections");
        foreach (var conn in connections.GetChildren())
        {
            var keys = conn.GetSection("Keys").Get<string[]>();
            if (keys?.Contains(clientId) == true)
            {
                return conn.Key;  // Returns "Database1" or "Database2"
            }
        }
        
        throw new InvalidOperationException($"No database configured for client {clientId}");
    }
    
    public async Task<List<Data>> GetTenantDataAsync(RequestInfo info)
    {
        // Automatically routes to correct database
        var query = @"
            SELECT * FROM tenant_data 
            WHERE client_id = @client_id AND site_id = @site_id";
        
        var parameters = new Dictionary<string, object>
        {
            ["@client_id"] = info.ClientId,
            ["@site_id"] = info.SiteId
        };
        
        // DBUtils automatically uses correct connection
        return await DBUtils(info.ClientId, true)
            .GetEntityListAsync<Data>(query, parameters);
    }
}
```

## File Operations

### File Upload with Transaction
```csharp
public async Task<FileResponse> SaveWithFilesAsync(
    SaveInput input,
    List<IFormFile> files,
    RequestInfo info)
{
    var response = new FileResponse();
    IDBService dbService = null;
    IDbTransaction transaction = null;
    var savedFiles = new List<string>();
    
    try
    {
        dbService = GetDBService(info.ClientId, this);
        transaction = dbService.BeginTransaction();
        
        // Save entity
        var entityId = await SaveEntityAsync(dbService, input, info);
        
        // Process files
        if (files?.Count > 0)
        {
            foreach (var file in files)
            {
                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(
                    _configuration["FileStorage:Path"],
                    info.ClientId,
                    info.SiteId,
                    fileName
                );
                
                // Save file to disk
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                savedFiles.Add(filePath);
                
                // Save file reference to database
                var fileQuery = @"
                    INSERT INTO attachments (
                        entity_id, file_name, file_path, file_size,
                        content_type, uploaded_by, uploaded_date
                    ) VALUES (
                        @entity_id, @file_name, @file_path, @file_size,
                        @content_type, @uploaded_by, @uploaded_date
                    )";
                
                await dbService.ExecuteNonQueryAsync(fileQuery, new Dictionary<string, object>
                {
                    ["@entity_id"] = entityId,
                    ["@file_name"] = file.FileName,
                    ["@file_path"] = filePath,
                    ["@file_size"] = file.Length,
                    ["@content_type"] = file.ContentType,
                    ["@uploaded_by"] = info.UserId,
                    ["@uploaded_date"] = DateTime.UtcNow
                });
            }
        }
        
        transaction.Commit();
        
        response.Success = true;
        response.EntityId = entityId;
        response.FileCount = savedFiles.Count;
    }
    catch (Exception ex)
    {
        transaction?.Rollback();
        
        // Cleanup saved files on error
        foreach (var file in savedFiles)
        {
            try { File.Delete(file); } catch { }
        }
        
        throw;
    }
    finally
    {
        transaction?.Dispose();
        dbService?.Dispose();
    }
    
    return response;
}
```

## Background Jobs

### Scheduled Job Pattern
```csharp
public class ScheduledJobService : XOSServiceBase
{
    private readonly IServiceScopeFactory _scopeFactory;
    
    public async Task ExecuteDailyJobsAsync()
    {
        using (var scope = _scopeFactory.CreateScope())
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ScheduledJobService>>();
            
            try
            {
                // Get all sites for processing
                var sites = await GetActiveSitesAsync();
                
                foreach (var site in sites)
                {
                    try
                    {
                        await ProcessSiteJobAsync(site);
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, $"Error processing job for site {site.SiteId}");
                        // Continue with next site
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error in daily job execution");
            }
        }
    }
    
    private async Task ProcessSiteJobAsync(Site site)
    {
        var requestInfo = new RequestInfo
        {
            ClientId = site.ClientId,
            SiteId = site.SiteId,
            UserId = 0,  // System user
            UserName = "System"
        };
        
        // Process with proper transaction
        IDBService dbService = null;
        IDbTransaction transaction = null;
        
        try
        {
            dbService = GetDBService(site.ClientId, this);
            transaction = dbService.BeginTransaction();
            
            // Perform scheduled operations
            await ProcessPendingItemsAsync(dbService, requestInfo);
            await GenerateReportsAsync(dbService, requestInfo);
            await CleanupOldDataAsync(dbService, requestInfo);
            
            transaction.Commit();
            
            // Log success
            await LogJobExecutionAsync(site.SiteId, "SUCCESS", null);
        }
        catch (Exception ex)
        {
            transaction?.Rollback();
            await LogJobExecutionAsync(site.SiteId, "FAILED", ex.Message);
            throw;
        }
        finally
        {
            transaction?.Dispose();
            dbService?.Dispose();
        }
    }
}
```

## Caching Strategies

### Memory Cache Implementation
```csharp
public class CachedDataService : XOSServiceBase
{
    private readonly IMemoryCache _cache;
    private readonly SemaphoreSlim _cacheLock = new SemaphoreSlim(1, 1);
    
    public async Task<List<Department>> GetDepartmentsAsync(RequestInfo info)
    {
        var cacheKey = $"departments_{info.ClientId}_{info.SiteId}";
        
        // Try get from cache
        if (_cache.TryGetValue<List<Department>>(cacheKey, out var cached))
        {
            return cached;
        }
        
        // Prevent cache stampede
        await _cacheLock.WaitAsync();
        try
        {
            // Double-check after acquiring lock
            if (_cache.TryGetValue<List<Department>>(cacheKey, out cached))
            {
                return cached;
            }
            
            // Load from database
            var departments = await LoadDepartmentsFromDbAsync(info);
            
            // Cache with sliding expiration
            var cacheOptions = new MemoryCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromMinutes(5),
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1),
                Priority = CacheItemPriority.Normal
            };
            
            _cache.Set(cacheKey, departments, cacheOptions);
            
            return departments;
        }
        finally
        {
            _cacheLock.Release();
        }
    }
    
    public async Task InvalidateCacheAsync(RequestInfo info)
    {
        var patterns = new[]
        {
            $"departments_{info.ClientId}_{info.SiteId}",
            $"users_{info.ClientId}_{info.SiteId}",
            $"config_{info.ClientId}_{info.SiteId}"
        };
        
        foreach (var pattern in patterns)
        {
            _cache.Remove(pattern);
        }
    }
}
```

## Performance Optimization

### Batch Processing
```csharp
public async Task<BatchResult> ProcessBatchAsync(List<int> ids, RequestInfo info)
{
    var result = new BatchResult();
    const int batchSize = 100;
    
    // Process in batches to avoid parameter limits
    for (int i = 0; i < ids.Count; i += batchSize)
    {
        var batch = ids.Skip(i).Take(batchSize).ToList();
        var batchResult = await ProcessBatchInternalAsync(batch, info);
        result.Merge(batchResult);
    }
    
    return result;
}

private async Task<BatchResult> ProcessBatchInternalAsync(
    List<int> ids, 
    RequestInfo info)
{
    var query = @"
        UPDATE items 
        SET processed = true, processed_date = @date
        WHERE id = ANY(@ids) 
        AND client_id = @client_id 
        AND site_id = @site_id
        RETURNING id";
    
    var parameters = new Dictionary<string, object>
    {
        ["@ids"] = ids.ToArray(),
        ["@date"] = DateTime.UtcNow,
        ["@client_id"] = info.ClientId,
        ["@site_id"] = info.SiteId
    };
    
    var processedIds = await DBUtils(info.ClientId, false)
        .GetScalarListAsync<int>(query, parameters);
    
    return new BatchResult 
    { 
        ProcessedCount = processedIds.Count,
        ProcessedIds = processedIds 
    };
}
```

### Query Optimization
```csharp
public async Task<PagedResult<Customer>> GetCustomersPagedAsync(
    SearchParams searchParams,
    RequestInfo info)
{
    // Use CTE for efficient pagination
    var query = @"
        WITH filtered_customers AS (
            SELECT 
                c.*,
                COUNT(*) OVER() as total_count
            FROM customers c
            WHERE c.client_id = @client_id 
            AND c.site_id = @site_id
            AND (@search IS NULL OR c.name ILIKE @search_pattern)
            AND (@status IS NULL OR c.status = @status)
        )
        SELECT * FROM filtered_customers
        ORDER BY 
            CASE WHEN @sort_by = 'name' AND @sort_dir = 'asc' THEN name END ASC,
            CASE WHEN @sort_by = 'name' AND @sort_dir = 'desc' THEN name END DESC,
            CASE WHEN @sort_by = 'created' AND @sort_dir = 'asc' THEN created_date END ASC,
            CASE WHEN @sort_by = 'created' AND @sort_dir = 'desc' THEN created_date END DESC
        LIMIT @page_size OFFSET @offset";
    
    var parameters = new Dictionary<string, object>
    {
        ["@client_id"] = info.ClientId,
        ["@site_id"] = info.SiteId,
        ["@search"] = searchParams.Search,
        ["@search_pattern"] = $"%{searchParams.Search}%",
        ["@status"] = searchParams.Status,
        ["@sort_by"] = searchParams.SortBy ?? "created",
        ["@sort_dir"] = searchParams.SortDirection ?? "desc",
        ["@page_size"] = searchParams.PageSize,
        ["@offset"] = (searchParams.PageNumber - 1) * searchParams.PageSize
    };
    
    var result = new PagedResult<Customer>();
    var customers = new List<Customer>();
    
    await DBUtils(info.ClientId, true).GetEntityDataListAsync<Customer>(
        query,
        parameters,
        (row) =>
        {
            if (result.TotalCount == 0)
            {
                result.TotalCount = row.GetValue<int>("total_count");
            }
            
            return new Customer
            {
                Id = row.GetValue<int>("id"),
                Name = row.GetValue<string>("name"),
                Email = row.GetValue<string>("email"),
                Status = row.GetValue<string>("status"),
                CreatedDate = row.GetValue<DateTime>("created_date")
            };
        });
    
    result.Items = customers;
    result.PageNumber = searchParams.PageNumber;
    result.PageSize = searchParams.PageSize;
    result.TotalPages = (int)Math.Ceiling(result.TotalCount / (double)searchParams.PageSize);
    
    return result;
}
```

## Service Testing

### Unit Test Example
```csharp
[TestClass]
public class EntityServiceTests
{
    private Mock<IDBService> _mockDbService;
    private Mock<IWorkFlowMasterService> _mockWorkflowService;
    private EntityService _service;
    
    [TestInitialize]
    public void Setup()
    {
        _mockDbService = new Mock<IDBService>();
        _mockWorkflowService = new Mock<IWorkFlowMasterService>();
        
        var mockLogger = new Mock<ILogger<EntityService>>();
        var mockConfig = new Mock<IConfiguration>();
        
        _service = new EntityService(
            mockLogger.Object,
            mockConfig.Object,
            Mock.Of<IHubContext<NotificationHub>>(),
            _mockWorkflowService.Object
        );
    }
    
    [TestMethod]
    public async Task SaveAsync_Should_CommitBeforeNotifications()
    {
        // Arrange
        var input = new Entity.SaveInput { Amount = 100 };
        var info = new RequestInfo { ClientId = "1", SiteId = "S1" };
        
        var callOrder = new List<string>();
        
        _mockDbService.Setup(x => x.BeginTransaction())
            .Returns(Mock.Of<IDbTransaction>());
        
        _mockDbService.Setup(x => x.Commit())
            .Callback(() => callOrder.Add("commit"));
        
        _mockWorkflowService.Setup(x => x.InitiateWorkflowAsync(It.IsAny<int>(), It.IsAny<string>()))
            .Callback(() => callOrder.Add("workflow"))
            .ReturnsAsync(1);
        
        // Act
        var result = await _service.SaveAsync(input, info, null);
        
        // Assert
        Assert.IsTrue(result.Success);
        Assert.AreEqual("commit", callOrder[0]);
        Assert.AreEqual("workflow", callOrder[1]);
    }
}
```

## Common Pitfalls & Solutions

| Problem | Solution |
|---------|----------|
| SignalR before commit | Always commit transaction before sending notifications |
| Memory leaks in services | Properly implement IDisposable pattern |
| Connection pool exhaustion | Always dispose IDBService in finally block |
| Deadlocks in transactions | Keep transactions short, avoid nested locks |
| Cache stampede | Use SemaphoreSlim to prevent multiple cache loads |
| Large result sets | Implement pagination, use streaming for exports |
| File cleanup on errors | Delete uploaded files if transaction fails |

## Best Practices Checklist

- [ ] Always use `row.GetValue<T>()` for database reads
- [ ] Commit transactions before SignalR notifications
- [ ] Implement proper disposal in services
- [ ] Use parameter dictionaries for SQL queries
- [ ] Handle multi-tenant routing correctly
- [ ] Log errors with appropriate context
- [ ] Validate business rules before database operations
- [ ] Use transactions for multi-table operations
- [ ] Cache frequently accessed reference data
- [ ] Implement retry logic for transient failures
- [ ] Clean up files on transaction rollback
- [ ] Use batch processing for large datasets

---
*This guide provides comprehensive patterns for XOS backend implementation. Always follow these patterns for consistency and reliability.*