# Backend Issues & Solutions

This document tracks backend-related issues encountered during module development and their solutions. Use this as a reference to avoid repeating similar problems.

## Authentication & Security Issues

### Issue: JWT Token Validation Failing
**Symptoms:** 401 Unauthorized errors despite valid tokens
**Root Cause:** Clock skew between token issuer and validator
**Solution:** Add clock skew tolerance in token validation parameters
**Code Example:**
```csharp
TokenValidationParameters = new TokenValidationParameters
{
    ClockSkew = TimeSpan.FromMinutes(5), // Add tolerance
    ValidateLifetime = true,
    // ... other parameters
};
```
**Applied In:** Multiple authentication services

### Issue: Password Hashing Performance Degradation
**Symptoms:** Login taking >2 seconds with large user base
**Root Cause:** BCrypt salt rounds set too high (12+)
**Solution:** Reduce to 10 rounds, implement result caching
**Pattern:** Balance security vs performance for password hashing
**Applied In:** PasswordService implementations

### Issue: XOS Framework Integration Problems
**Symptoms:** ExecuteReaderAsync returns empty results, context not set properly
**Root Cause:** Improper XOS framework pattern usage
**Solution:** Always extend XOSServiceBase and set context before DB operations
**Code Example:**
```csharp
public class UserLoginService : XOSServiceBase, IUserLoginService
{
    public UserLoginService(IServiceProvider serviceProvider, ILogger<UserLoginService> logger, IConfiguration configuration)
        : base(serviceProvider, logger, configuration) // Must call base constructor
    {
    }

    public async Task<UserLogin?> GetByIdAsync(int loginId)
    {
        SetUserContext(ClientID, SiteID, UserID); // Set context first
        
        var parameters = new Dictionary<string, object>
        {
            { "@LoginId", loginId },
            { "@ClientId", ClientID }, // Use base class properties
            { "@SiteId", SiteID }
        };

        var results = await ExecuteReaderAsync(query, parameters, MapRowToUserLogin);
        return results.FirstOrDefault();
    }

    private UserLogin MapRowToUserLogin(dynamic row)
    {
        return new UserLogin
        {
            LoginID = row.GetValue<int>("login_id"), // Exact column names
            UserName = row.GetValue<string>("user_name", ""), // With defaults
            Status = (LoginStatus)row.GetValue<int>("status", 1) // Cast enums
        };
    }
}
```
**Applied In:** UserLogin module, all XOS-based services

### Issue: Multi-Tenant Data Isolation Failures
**Symptoms:** Users seeing data from other clients/sites
**Root Cause:** Missing client/site context in queries
**Solution:** Always include ClientId/SiteId filters in WHERE clauses
**Pattern:** Every query must include tenant isolation
```csharp
// Always include in WHERE clause
WHERE client_id = @ClientId AND site_id = @SiteId AND is_deleted = false
```
**Applied In:** All multi-tenant database operations

## Database & Data Access Issues

### Issue: PostgreSQL Connection Pool Exhaustion
**Symptoms:** "Sorry, too many clients already" errors under load
**Root Cause:** Connections not properly disposed
**Solution:** Use `using` statements for all database contexts, configure pool size
**Pattern:** Always dispose database contexts properly
**Applied In:** All repository implementations

### Issue: Entity Framework Migration Conflicts
**Symptoms:** Migration fails with "column already exists" errors
**Root Cause:** Multiple developers creating migrations simultaneously
**Solution:** Always pull latest before creating migrations, use descriptive names
**Pattern:** Coordinate migration creation in team environments

## Service & Business Logic Issues

### Issue: Circular Dependency in Services
**Symptoms:** Stack overflow during service resolution
**Root Cause:** Service A depends on Service B which depends on Service A
**Solution:** Extract common functionality to shared service or use events
**Pattern:** Avoid circular dependencies through proper service design
**Applied In:** Order and Inventory services

### Issue: Async/Await Deadlocks
**Symptoms:** Application hangs when calling async methods
**Root Cause:** Mixing synchronous and asynchronous calls incorrectly
**Solution:** Use ConfigureAwait(false) or make entire call chain async
**Pattern:** Be consistent with async patterns throughout call chain

## API & Controller Issues

### Issue: Model Validation Not Working
**Symptoms:** Invalid data reaching service layer despite validation attributes
**Root Cause:** ModelState not checked in controller actions
**Solution:** Always check ModelState.IsValid before processing
**Code Example:**
```csharp
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateRequest request)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);
    // ... rest of implementation
}
```

### Issue: Large Response Payloads Causing Timeouts
**Symptoms:** API calls timing out with large datasets
**Root Cause:** Loading all data into memory before serialization
**Solution:** Implement pagination and streaming responses
**Pattern:** Always paginate large datasets

## Dependency Injection Issues

### Issue: Service Not Found During Runtime
**Symptoms:** "Unable to resolve service" exceptions
**Root Cause:** Service not registered in DI container
**Solution:** Ensure service is registered in Program.cs or ServiceExtensions
**Pattern:** Verify all dependencies are properly registered

### Issue: Incorrect Service Lifetime Causing Memory Leaks
**Symptoms:** Memory usage growing continuously
**Root Cause:** Singleton services holding references to transient objects
**Solution:** Review service lifetimes, use appropriate scope
**Pattern:** Match service lifetime to actual usage pattern

## Logging & Monitoring Issues

### Issue: Sensitive Data in Logs
**Symptoms:** Passwords, tokens appearing in log files
**Root Cause:** Logging entire request/response objects
**Solution:** Implement custom log sanitization, use structured logging
**Pattern:** Never log sensitive data, sanitize before logging

### Issue: Log File Growth Causing Disk Space Issues
**Symptoms:** Application server running out of disk space
**Root Cause:** Log rotation not configured properly
**Solution:** Configure log rotation with size/date limits
**Pattern:** Always configure log rotation in production

## Performance Issues

### Issue: N+1 Query Problem
**Symptoms:** Slow database operations with many small queries
**Root Cause:** Loading related entities in loops
**Solution:** Use Include() for Entity Framework or optimize queries
**Pattern:** Always review generated SQL for query efficiency

### Issue: Memory Leaks in Long-Running Processes
**Symptoms:** Memory usage growing over time
**Root Cause:** Event handlers not unsubscribed, disposable objects not disposed
**Solution:** Implement proper cleanup patterns, use weak references
**Pattern:** Always clean up resources properly

## Configuration Issues

### Issue: Configuration Values Not Loading
**Symptoms:** Default values used instead of configured ones
**Root Cause:** Incorrect appsettings.json structure or naming
**Solution:** Verify configuration section names match exactly
**Pattern:** Use strongly-typed configuration classes

### Issue: Environment-Specific Settings Not Working
**Symptoms:** Development settings used in production
**Root Cause:** appsettings.{Environment}.json not loaded
**Solution:** Verify environment variable setting and file naming
**Pattern:** Always test environment-specific configurations

## Error Handling Patterns

### Issue: Unhandled Exceptions Crashing Application
**Symptoms:** Application stops responding after errors
**Root Cause:** No global exception handling
**Solution:** Implement global exception middleware
**Pattern:** Always have global exception handling

### Issue: Generic Error Messages Not Helpful for Debugging
**Symptoms:** "An error occurred" messages without context
**Root Cause:** Catching exceptions too broadly
**Solution:** Catch specific exceptions, provide meaningful messages
**Pattern:** Catch specific exceptions and provide actionable error messages

## Testing-Related Backend Issues

### Issue: Tests Failing Due to Database State
**Symptoms:** Tests pass individually but fail when run together
**Root Cause:** Tests not cleaning up database state
**Solution:** Use transaction rollback or in-memory database for tests
**Pattern:** Isolate test data to avoid interference

### Issue: Mocking Framework Conflicts
**Symptoms:** Unexpected behavior in mocked dependencies
**Root Cause:** Mock setup conflicts or incorrect mock configuration
**Solution:** Reset mocks between tests, verify mock setups
**Pattern:** Keep mocks simple and verify their behavior

---

## How to Use This Guide

1. **Search for Similar Issues:** Use Ctrl+F to find similar symptoms or error messages
2. **Apply the Pattern:** Look for the general pattern rather than copying exact code
3. **Update This Guide:** When you encounter and solve new issues, add them here
4. **Reference in Code:** Link back to this guide in code comments when applying solutions

## Contributing to This Guide

When adding new issues:
1. Use the established format: Issue → Symptoms → Root Cause → Solution → Pattern → Applied In
2. Include code examples for complex solutions
3. Focus on the underlying pattern that can be reused
4. Keep entries concise but complete