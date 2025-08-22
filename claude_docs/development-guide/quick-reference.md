# Quick Reference Guide

## Essential Commands

### Backend (.NET)
```bash
# Build and run
dotnet build
dotnet run
dotnet watch run  # Hot reload

# Testing
dotnet test
dotnet test --filter "FullyQualifiedName~UnitTests"

# Database
dotnet ef migrations add MigrationName
dotnet ef database update

# Package management
dotnet add package PackageName
dotnet restore
```

### Frontend (React/TypeScript)
```bash
# Development
npm start
npm run dev

# Building
npm run build
npm run build:prod

# Testing
npm test
npm run test:coverage
npm run test:watch

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check
```

## Critical Framework Utilities (MUST USE)

### API Calls - Utils.ajax
```javascript
// ALWAYS use Utils.ajax for API calls - it handles tokens and sessions
Utils.ajax({
    url: 'Customer/Save',
    data: this.Data.Input
}, (response) => {
    if (response && response.IsValid) {
        // Handle success
    }
});
```

### User Notifications - showMessageBox
```javascript
// ALWAYS use showMessageBox for ALL user notifications (NOT XOSAlert component)
// Success message
this.showMessageBox({
    text: Utils.getMessage(4), // "Saved successfully"
    messageboxType: XOSMessageboxTypes.info,
    onClose: () => this.close()
});

// Error message
this.showMessageBox({
    text: "Login failed - invalid credentials",
    messageboxType: XOSMessageboxTypes.error
});

// Warning message
this.showMessageBox({
    text: "Username is required",
    messageboxType: XOSMessageboxTypes.warning,
    onClose: () => this.usernameInput.focus()
});

// Confirmation dialog
this.showMessageBox({
    text: "Are you sure you want to delete this record?",
    messageboxType: XOSMessageboxTypes.question,
    buttons: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
    ],
    onClose: (result) => {
        if (result.value === "yes") {
            this.deleteRecord();
        }
    }
});
```

## Common Patterns

### API Response Pattern
```csharp
// Backend
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T Data { get; set; }
    public string Message { get; set; }
    public List<string> Errors { get; set; }
}
```

### Error Handling Pattern
```javascript
// Frontend Pattern with XOS Framework
Utils.ajax({
    url: 'api/endpoint',
    data: payload
}, (response) => {
    if (response && response.IsValid) {
        this.showMessageBox({
            text: Utils.getMessage(4),
            messageboxType: XOSMessageboxTypes.info
        });
    } else {
        this.showMessageBox({
            text: response?.Message || Utils.getMessage(1),
            messageboxType: XOSMessageboxTypes.error
        });
    }
});
```

### Validation Pattern
```csharp
// Backend
public class UserValidator : AbstractValidator<UserDto>
{
    public UserValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
```

## File Templates

### React Component Template
```typescript
import React, { FC } from 'react';

interface ComponentNameProps {
    // Props here
}

export const ComponentName: FC<ComponentNameProps> = ({ }) => {
    return (
        <div>
            {/* Component content */}
        </div>
    );
};
```

### Service Class Template
```csharp
public interface IServiceName
{
    Task<Result> MethodAsync(Parameters params);
}

public class ServiceName : IServiceName
{
    private readonly IDependency _dependency;

    public ServiceName(IDependency dependency)
    {
        _dependency = dependency;
    }

    public async Task<Result> MethodAsync(Parameters params)
    {
        // Implementation
    }
}
```

## Debugging Tips

### Backend Debugging
- Use `ILogger` extensively
- Enable detailed errors in development
- Use breakpoints in Visual Studio/VS Code
- Check application insights/logs

### Frontend Debugging
- Use React Developer Tools
- Redux DevTools for state debugging
- Network tab for API calls
- Console.log with descriptive labels

## Performance Optimization

### Backend
- Use async/await properly
- Implement caching strategies
- Optimize database queries
- Use pagination for large datasets

### Frontend
- Implement React.memo for expensive components
- Use useMemo and useCallback appropriately
- Lazy load components and routes
- Optimize bundle size with code splitting

## Security Checklist

- [ ] Input validation on all endpoints
- [ ] Authentication and authorization implemented
- [ ] HTTPS enforced
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize user input)
- [ ] CSRF tokens implemented
- [ ] Rate limiting configured
- [ ] Sensitive data encrypted
- [ ] Security headers configured
- [ ] Dependencies regularly updated