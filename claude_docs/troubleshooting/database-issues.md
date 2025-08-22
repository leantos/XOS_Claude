# Database Issues & Solutions

This document tracks database-related issues encountered during development, focusing on PostgreSQL, Entity Framework, migrations, and data access patterns.

## Connection & Configuration Issues

### Issue: PostgreSQL Connection Failures
**Symptoms:** "Connection refused" or "server closed the connection unexpectedly"
**Root Cause:** Incorrect connection string, PostgreSQL not running, or firewall blocking
**Solution:** Verify connection string format and PostgreSQL service status
**Code Example:**
```csharp
// Correct PostgreSQL connection string format
"Server=localhost;Port=5432;Database=CVS_Claude;User Id=postgres;Password=admin;CommandTimeout=30;Timeout=30;"
```
**Applied In:** appsettings.json configuration

### Issue: Connection Pool Exhaustion
**Symptoms:** "Sorry, too many clients already" errors under load
**Root Cause:** Database contexts not properly disposed
**Solution:** Use `using` statements for all database operations
**Code Example:**
```csharp
// Wrong - connection leak
public async Task<User> GetUserAsync(int id)
{
    var context = new AppDbContext(_options);
    return await context.Users.FindAsync(id);
    // Context never disposed - connection leak!
}

// Correct - proper disposal
public async Task<User> GetUserAsync(int id)
{
    using var context = new AppDbContext(_options);
    return await context.Users.FindAsync(id);
} // Context automatically disposed
```
**Pattern:** Always dispose database contexts properly

## XOS Framework & PostgreSQL Issues

### Issue: XOS ExecuteReaderAsync Returns Empty Results
**Symptoms:** Database queries execute without error but return no data
**Root Cause:** Incorrect parameter binding or context not set
**Solution:** Ensure proper parameter naming and context setting
**Code Example:**
```csharp
// Correct XOS pattern
SetUserContext(clientId, siteId, userId); // Set context first

var parameters = new Dictionary<string, object>
{
    { "@UserId", userId },           // Note @ prefix
    { "@ClientId", ClientID },       // Use base class properties
    { "@SiteId", SiteID },
    { "@IsDeleted", false }
};

var query = @"
    SELECT login_id, user_name, user_id 
    FROM cvs_user_logins 
    WHERE user_id = @UserId 
    AND client_id = @ClientId 
    AND site_id = @SiteId 
    AND is_deleted = @IsDeleted";

var results = await ExecuteReaderAsync(query, parameters, MapRowToUserLogin);
```
**Applied In:** All UserLogin database operations

### Issue: PostgreSQL Query Performance Degradation
**Symptoms:** UserLogin search operations taking >2 seconds with large datasets
**Root Cause:** Missing indexes on commonly queried columns
**Solution:** Add composite indexes for multi-tenant queries
**Code Example:**
```sql
-- Add performance indexes for UserLogin
CREATE INDEX CONCURRENTLY idx_cvs_user_logins_tenant_status 
ON cvs_user_logins(client_id, site_id, status, is_deleted) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_cvs_user_logins_user_time 
ON cvs_user_logins(user_id, login_time DESC) 
WHERE is_deleted = false;

CREATE INDEX CONCURRENTLY idx_cvs_user_logins_session_lookup 
ON cvs_user_logins(session_id, status) 
WHERE is_active = true;

-- Analyze query performance
EXPLAIN ANALYZE 
SELECT * FROM cvs_user_logins 
WHERE client_id = 1 AND site_id = 1 AND status = 1 
ORDER BY login_time DESC LIMIT 50;
```
**Applied In:** UserLogin search and session management queries

### Issue: Multi-Tenant Data Leakage
**Symptoms:** Users seeing login records from other clients/sites
**Root Cause:** Missing tenant isolation in WHERE clauses
**Solution:** Always include client_id and site_id filters in all queries
**Pattern:** Every query must include tenant isolation
```sql
-- Template for all multi-tenant queries
WHERE client_id = @ClientId 
AND site_id = @SiteId 
AND is_deleted = false
-- ... other conditions
```
**Applied In:** All UserLogin data operations

### Issue: Database Timeout Errors
**Symptoms:** "Timeout expired" errors on long-running queries
**Root Cause:** Default command timeout too short for complex operations
**Solution:** Configure appropriate command timeout
**Code Example:**
```csharp
services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.CommandTimeout(60); // 60 seconds
    });
});
```

## Entity Framework Issues

### Issue: Entity Not Found After Insert
**Symptoms:** Entity inserted successfully but can't retrieve it immediately
**Root Cause:** Entity not saved to database due to missing SaveChanges()
**Solution:** Always call SaveChanges() or SaveChangesAsync()
**Code Example:**
```csharp
public async Task<User> CreateUserAsync(User user)
{
    _context.Users.Add(user);
    await _context.SaveChangesAsync(); // Essential!
    return user;
}
```

### Issue: Tracking Conflicts in Entity Framework
**Symptoms:** "The instance of entity type cannot be tracked" errors
**Root Cause:** Multiple instances of same entity being tracked
**Solution:** Use AsNoTracking() for read operations or properly manage tracked entities
**Code Example:**
```csharp
// For read-only operations
public async Task<List<User>> GetAllUsersAsync()
{
    return await _context.Users
        .AsNoTracking()
        .ToListAsync();
}

// For updates, check if entity is already tracked
public async Task UpdateUserAsync(User user)
{
    var existingEntity = _context.Entry(user);
    if (existingEntity.State == EntityState.Detached)
    {
        _context.Users.Update(user);
    }
    await _context.SaveChangesAsync();
}
```

### Issue: Circular Reference Issues in Entity Relationships
**Symptoms:** Stack overflow exceptions or infinite loops during serialization
**Root Cause:** Bidirectional navigation properties causing circular references
**Solution:** Use DTO projections or configure JSON serializer options
**Code Example:**
```csharp
// Domain models (can have circular references)
public class User
{
    public int Id { get; set; }
    public List<Order> Orders { get; set; }
}

public class Order
{
    public int Id { get; set; }
    public User User { get; set; } // Circular reference
}

// Use DTOs for API responses
public class UserDto
{
    public int Id { get; set; }
    public List<OrderSummaryDto> Orders { get; set; }
}
```

## Migration Issues

### Issue: Migration Conflicts Between Developers
**Symptoms:** "Column already exists" or conflicting migration errors
**Root Cause:** Multiple developers creating migrations simultaneously
**Solution:** Coordinate migrations and always pull latest before creating
**Pattern:** One developer creates migrations at a time, others pull and apply

### Issue: Data Loss During Migrations
**Symptoms:** Existing data disappears after running migrations
**Root Cause:** Migration dropping and recreating tables instead of altering
**Solution:** Carefully review generated migrations before applying
**Code Example:**
```csharp
// Review migration before applying
protected override void Up(MigrationBuilder migrationBuilder)
{
    // Ensure this adds column, doesn't drop table
    migrationBuilder.AddColumn<string>(
        name: "NewColumn",
        table: "Users",
        nullable: true);
        
    // NOT: migrationBuilder.DropTable("Users");
}
```

### Issue: Migration Rollback Failures
**Symptoms:** Cannot rollback migrations due to data constraints
**Root Cause:** Rollback operations not properly defined in Down() methods
**Solution:** Always implement proper Down() methods in migrations
**Code Example:**
```csharp
protected override void Down(MigrationBuilder migrationBuilder)
{
    // Proper rollback of the Up() operation
    migrationBuilder.DropColumn(
        name: "NewColumn",
        table: "Users");
}
```

## Query Performance Issues

### Issue: N+1 Query Problems
**Symptoms:** Large number of database queries for simple operations
**Root Cause:** Lazy loading causing additional queries in loops
**Solution:** Use Include() for explicit loading or projection
**Code Example:**
```csharp
// Problem: N+1 queries
var users = await _context.Users.ToListAsync();
foreach(var user in users)
{
    Console.WriteLine(user.Orders.Count); // Each access hits database again
}

// Solution: Explicit loading
var users = await _context.Users
    .Include(u => u.Orders)
    .ToListAsync();

// Or use projection for better performance
var userSummaries = await _context.Users
    .Select(u => new UserSummaryDto
    {
        Id = u.Id,
        Name = u.Name,
        OrderCount = u.Orders.Count()
    })
    .ToListAsync();
```

### Issue: Inefficient Query Generation
**Symptoms:** Slow database operations with complex LINQ queries
**Root Cause:** LINQ generating suboptimal SQL
**Solution:** Use raw SQL for complex queries or optimize LINQ
**Code Example:**
```csharp
// Complex LINQ might generate inefficient SQL
var result = await _context.Orders
    .Where(o => o.Items.Any(i => i.Category.Name == "Electronics"))
    .Include(o => o.Customer)
    .ToListAsync();

// Consider raw SQL for better performance
var result = await _context.Orders
    .FromSqlRaw(@"
        SELECT o.* FROM Orders o 
        INNER JOIN OrderItems oi ON o.Id = oi.OrderId
        INNER JOIN Items i ON oi.ItemId = i.Id
        INNER JOIN Categories c ON i.CategoryId = c.Id
        WHERE c.Name = 'Electronics'")
    .Include(o => o.Customer)
    .ToListAsync();
```

### Issue: Missing Database Indexes
**Symptoms:** Slow queries on frequently searched columns
**Root Cause:** No indexes on columns used in WHERE clauses
**Solution:** Add appropriate indexes via migrations
**Code Example:**
```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    // Add index on frequently queried column
    migrationBuilder.CreateIndex(
        name: "IX_Users_Email",
        table: "Users",
        column: "Email",
        unique: true);
        
    // Composite index for multiple column queries
    migrationBuilder.CreateIndex(
        name: "IX_Orders_CustomerId_Status",
        table: "Orders",
        columns: new[] { "CustomerId", "Status" });
}
```

## Data Consistency Issues

### Issue: Race Conditions in Concurrent Updates
**Symptoms:** Data corruption or lost updates under concurrent access
**Root Cause:** No concurrency control mechanism
**Solution:** Implement optimistic or pessimistic concurrency control
**Code Example:**
```csharp
// Optimistic concurrency with version field
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    [Timestamp]
    public byte[] Version { get; set; } // Concurrency token
}

// Handle concurrency conflicts
try
{
    await _context.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException)
{
    // Handle conflict - refresh and retry, or show user the conflict
    throw new ConcurrencyException("Another user modified this record");
}
```

### Issue: Orphaned Records After Deletions
**Symptoms:** Related records remain after parent record deletion
**Root Cause:** Cascade delete not configured properly
**Solution:** Configure appropriate cascade behaviors
**Code Example:**
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Order>()
        .HasMany(o => o.Items)
        .WithOne(i => i.Order)
        .OnDelete(DeleteBehavior.Cascade); // Delete items when order is deleted
        
    modelBuilder.Entity<User>()
        .HasMany(u => u.Orders)
        .WithOne(o => o.User)
        .OnDelete(DeleteBehavior.Restrict); // Prevent user deletion if they have orders
}
```

## Transaction Management Issues

### Issue: Partial Data Saves in Multi-Step Operations
**Symptoms:** Some operations succeed while others fail, leaving inconsistent state
**Root Cause:** No transaction wrapping multi-step operations
**Solution:** Use database transactions for multi-step operations
**Code Example:**
```csharp
public async Task<Order> CreateOrderWithItemsAsync(CreateOrderRequest request)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        // Step 1: Create order
        var order = new Order { CustomerId = request.CustomerId };
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        
        // Step 2: Add order items
        foreach(var item in request.Items)
        {
            _context.OrderItems.Add(new OrderItem 
            { 
                OrderId = order.Id, 
                ItemId = item.ItemId,
                Quantity = item.Quantity 
            });
        }
        await _context.SaveChangesAsync();
        
        // Step 3: Update inventory
        await _inventoryService.ReserveItemsAsync(request.Items);
        
        await transaction.CommitAsync();
        return order;
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

## Security Issues

### Issue: SQL Injection Vulnerabilities
**Symptoms:** Potential for malicious SQL execution through user input
**Root Cause:** String concatenation for dynamic queries
**Solution:** Use parameterized queries or LINQ
**Code Example:**
```csharp
// Vulnerable to SQL injection
public async Task<User> GetUserByEmailAsync(string email)
{
    var sql = $"SELECT * FROM Users WHERE Email = '{email}'";
    return await _context.Users.FromSqlRaw(sql).FirstOrDefaultAsync();
}

// Safe parameterized query
public async Task<User> GetUserByEmailAsync(string email)
{
    return await _context.Users
        .FromSqlRaw("SELECT * FROM Users WHERE Email = {0}", email)
        .FirstOrDefaultAsync();
}

// Better: Use LINQ (automatically parameterized)
public async Task<User> GetUserByEmailAsync(string email)
{
    return await _context.Users
        .Where(u => u.Email == email)
        .FirstOrDefaultAsync();
}
```

### Issue: Sensitive Data Exposure in Logs
**Symptoms:** Database queries with sensitive data appearing in logs
**Root Cause:** EF Core logging query parameters
**Solution:** Configure logging to exclude sensitive data
**Code Example:**
```csharp
services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
    options.EnableSensitiveDataLogging(false); // Don't log parameter values
    options.EnableDetailedErrors(false); // Don't include sensitive details in errors
});
```

## Backup & Recovery Issues

### Issue: No Database Backup Strategy
**Symptoms:** Risk of data loss without recovery options
**Root Cause:** No automated backup procedures
**Solution:** Implement automated backup strategy
**Code Example:**
```bash
# PostgreSQL backup script
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres -h localhost CVS_Claude > "$BACKUP_DIR/CVS_Claude_$DATE.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### Issue: Long Recovery Times
**Symptoms:** Extended downtime during database restoration
**Root Cause:** Large backup files and inefficient restore procedures
**Solution:** Implement incremental backups and optimize restore procedures
**Pattern:** Regular full backups with daily incremental backups

## Monitoring Issues

### Issue: No Database Performance Monitoring
**Symptoms:** Unaware of database performance degradation
**Root Cause:** No monitoring of query performance and resource usage
**Solution:** Implement database monitoring and alerting
**Code Example:**
```csharp
// Add EF Core command interceptor for query monitoring
public class QueryPerformanceInterceptor : DbCommandInterceptor
{
    public override async ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command, 
        CommandExecutedEventData eventData, 
        DbDataReader result, 
        CancellationToken cancellationToken = default)
    {
        if (eventData.Duration.TotalMilliseconds > 1000) // Log slow queries
        {
            _logger.LogWarning("Slow query detected: {Query} took {Duration}ms", 
                command.CommandText, eventData.Duration.TotalMilliseconds);
        }
        return await base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
    }
}
```

---

## Database Best Practices

### Entity Configuration
- Use Fluent API for complex configurations
- Define relationships explicitly
- Set appropriate data types and constraints
- Configure indexes for frequently queried columns

### Query Optimization
- Use AsNoTracking() for read-only operations
- Include related data explicitly to avoid N+1 queries
- Use projection for performance-critical queries
- Monitor and optimize slow queries

### Transaction Management
- Use transactions for multi-step operations
- Keep transactions as short as possible
- Handle transaction failures gracefully
- Avoid nested transactions

### Migration Safety
- Always review generated migrations
- Test migrations on copy of production data
- Implement proper rollback procedures
- Coordinate migration creation in team environments

## How to Use This Guide

1. **Check Connection Issues:** Verify connection strings and service status
2. **Review Query Performance:** Look for N+1 queries and missing indexes
3. **Validate Entity Configurations:** Ensure proper relationships and constraints
4. **Test Migration Safety:** Review migrations before applying to production
5. **Monitor Performance:** Implement query monitoring and alerting

## Contributing to This Guide

When adding new database issues:
1. Include specific error messages and symptoms
2. Show problematic code and corrected version
3. Explain the underlying database principle
4. Include performance implications where relevant
5. Reference PostgreSQL-specific features when applicable