# Troubleshooting Guide

## Common Issues and Solutions

### Backend Issues

#### 1. Database Connection Errors
**Problem**: Cannot connect to database
```
System.InvalidOperationException: Cannot open database "AppDb" requested by the login
Npgsql.PostgresException (0x80004005): 3D000: database "CVS_Claude_Dev" does not exist
```

**Solutions**:
- Check connection string in appsettings.json AND appsettings.Development.json
- Verify the correct database name is used (Development overrides base settings)
- Ensure database exists and tables are created in the correct database
- Check firewall settings
- Verify credentials

**⚠️ See detailed database troubleshooting**: [Database & Authentication Troubleshooting](./database-authentication-troubleshooting.md)

#### 2. Dependency Injection Errors
**Problem**: Unable to resolve service
```
System.InvalidOperationException: Unable to resolve service for type 'IMyService'
```

**Solutions**:
```csharp
// Register in Startup.cs or Program.cs
services.AddScoped<IMyService, MyService>();

// For database services
services.AddScoped<IDBService, PostgreSQLDBService>();
services.AddScoped<IDBUtils, PostgreSQLDBUtils>();
```

**Note**: Check for circular dependencies between projects when services fail to resolve

#### 3. CORS Issues
**Problem**: Cross-origin requests blocked

**Solutions**:
```csharp
// Configure CORS in Startup.cs
services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

app.UseCors("AllowSpecificOrigin");
```

#### 4. Entity Framework Migration Issues
**Problem**: Migrations fail or database schema mismatch

**Solutions**:
```bash
# Remove last migration
dotnet ef migrations remove

# Generate SQL script to review
dotnet ef migrations script

# Force update (use carefully)
dotnet ef database update --force

# Reset migrations (development only)
dotnet ef database drop
dotnet ef migrations remove
dotnet ef migrations add Initial
dotnet ef database update
```

### Frontend Issues

#### 1. Module Not Found
**Problem**: Cannot resolve module
```
Module not found: Can't resolve '@/components/MyComponent'
```

**Solutions**:
- Check tsconfig.json paths configuration
- Verify file exists and path is correct
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check case sensitivity in imports

#### 2. React Hook Errors
**Problem**: Invalid hook call
```
Error: Invalid hook call. Hooks can only be called inside function components
```

**Solutions**:
- Ensure hooks are called at top level of function components
- Check for duplicate React versions: `npm ls react`
- Don't call hooks conditionally or in loops

#### 3. TypeScript Errors
**Problem**: Type errors in development

**Solutions**:
```typescript
// Add type assertions when needed
const element = document.getElementById('myId') as HTMLInputElement;

// Use type guards
function isUserData(obj: any): obj is UserData {
    return obj && typeof obj.id === 'number' && typeof obj.name === 'string';
}

// Handle null/undefined
const value = possiblyNull ?? defaultValue;
const length = possiblyUndefined?.length ?? 0;
```

#### 4. State Update Issues
**Problem**: State not updating as expected

**Solutions**:
```typescript
// Use functional updates for state depending on previous value
setState(prev => ({ ...prev, newField: value }));

// Ensure immutable updates
// ❌ Wrong
state.items.push(newItem);

// ✅ Correct
setState(prev => ({
    ...prev,
    items: [...prev.items, newItem]
}));
```

### Build and Deployment Issues

#### 1. Build Failures
**Problem**: Build process fails

**Common Solutions**:
```bash
# Clear cache
npm cache clean --force

# Delete lock files and reinstall
rm package-lock.json
npm install

# For .NET
dotnet clean
dotnet restore
dotnet build
```

#### 2. Environment Variable Issues
**Problem**: Environment variables not loading

**Solutions**:
- Create .env file in root directory
- Prefix React env vars with REACT_APP_
- Use dotenv for Node.js applications
- Check .gitignore includes .env files

#### 3. Memory Issues
**Problem**: JavaScript heap out of memory

**Solutions**:
```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or in package.json
"scripts": {
    "build": "node --max-old-space-size=4096 scripts/build.js"
}
```

### Performance Issues

#### 1. Slow API Responses
**Diagnosis**:
- Check database query performance
- Review N+1 query problems
- Analyze network latency
- Check for missing indexes

**Solutions**:
```csharp
// Use Include for eager loading
var users = await context.Users
    .Include(u => u.Orders)
    .ToListAsync();

// Add indexes
modelBuilder.Entity<User>()
    .HasIndex(u => u.Email)
    .IsUnique();
```

#### 2. Frontend Performance
**Diagnosis**:
- Use React DevTools Profiler
- Check bundle size
- Review re-render frequency

**Solutions**:
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => 
    computeExpensiveValue(props), 
    [props.dependency]
);

// Prevent unnecessary re-renders
const MemoizedComponent = React.memo(Component, (prevProps, nextProps) => {
    return prevProps.id === nextProps.id;
});
```

### Debugging Techniques

#### Backend Debugging
```csharp
// Add detailed logging
_logger.LogDebug("Processing user {UserId} with data {@UserData}", userId, userData);

// Use conditional breakpoints in IDE
// Enable detailed exceptions in development
if (env.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
```

#### Frontend Debugging
```typescript
// Debug component renders
useEffect(() => {
    console.log('Component rendered/updated', { props, state });
});

// Debug API calls
const debugApi = async (url: string, options: RequestInit) => {
    console.group(`API Call: ${options.method} ${url}`);
    console.log('Request:', options);
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log('Response:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    } finally {
        console.groupEnd();
    }
};
```

### Testing Issues

#### 1. Test Failures
**Problem**: Tests pass locally but fail in CI

**Solutions**:
- Check for timezone dependencies
- Ensure consistent Node/npm versions
- Mock external dependencies
- Set consistent test environment
- Use fixed dates in tests

#### 2. Async Test Issues
**Problem**: Tests fail with timeout errors

**Solutions**:
```typescript
// Properly handle async tests
test('async operation', async () => {
    const result = await asyncOperation();
    expect(result).toBe(expected);
});

// Increase timeout for slow operations
test('slow operation', async () => {
    await slowOperation();
}, 10000); // 10 seconds

// Wait for elements in React tests
import { waitFor } from '@testing-library/react';

await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## Getting Help

### Resources
1. Check project documentation in `/docs`
2. Review error messages carefully
3. Search for error messages online
4. Check GitHub issues for similar problems
5. Consult team members or leads

### When Reporting Issues
Include:
- Error message and stack trace
- Steps to reproduce
- Environment details (OS, Node version, .NET version)
- Relevant code snippets
- What you've already tried

### Useful Commands for Diagnostics
```bash
# Check versions
node --version
npm --version
dotnet --version

# Check environment
echo $NODE_ENV
dotnet --info

# Check running processes
ps aux | grep node
ps aux | grep dotnet

# Check ports in use
netstat -tulpn | grep LISTEN
lsof -i :3000  # Check specific port
```