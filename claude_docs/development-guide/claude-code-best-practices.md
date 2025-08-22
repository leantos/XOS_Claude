# Claude Code Best Practices Guide

A comprehensive guide for writing clean, maintainable code that maximizes compatibility with Claude Code AI assistance. This guide covers both backend (.NET/C#) and frontend (React/TypeScript) development patterns.

## Table of Contents
- [General Principles](#general-principles)
- [Backend Development (.NET/C#)](#backend-development-netc)
- [Frontend Development (React/TypeScript)](#frontend-development-reacttypescript)
- [Project Structure](#project-structure)
- [Documentation Standards](#documentation-standards)
- [Claude Code Optimization](#claude-code-optimization)

## General Principles

### 1. Code Organization
```
✅ DO:
- Keep files focused on a single responsibility
- Use consistent naming conventions throughout
- Group related functionality together
- Maintain clear separation of concerns

❌ DON'T:
- Mix business logic with infrastructure code
- Create files with more than 300 lines
- Use ambiguous or abbreviated names
```

### 2. Naming Conventions

#### File Naming
- **Backend**: `PascalCase.cs` (e.g., `UserService.cs`, `IUserRepository.cs`)
- **Frontend**: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- **Interfaces**: Prefix with `I` in C#, suffix with `Interface` or `Type` in TypeScript
- **Tests**: `[FileName].test.ts` or `[FileName]Tests.cs`

#### Variable and Method Naming
```csharp
// C# Backend
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;  // Private fields with underscore
    
    public async Task<UserDto> GetUserByIdAsync(int userId)  // Async suffix
    {
        // Method names describe action clearly
    }
}
```

```typescript
// TypeScript Frontend
interface UserData {
    userId: number;      // camelCase for properties
    userName: string;
    isActive: boolean;   // Boolean prefixed with is/has/can
}

const fetchUserData = async (userId: number): Promise<UserData> => {
    // Arrow functions for utilities
};
```

### 3. Error Handling

```csharp
// Backend Pattern
public async Task<IActionResult> CreateUser(CreateUserDto dto)
{
    try
    {
        var result = await _userService.CreateAsync(dto);
        return Ok(result);
    }
    catch (ValidationException ex)
    {
        _logger.LogWarning(ex, "Validation failed for user creation");
        return BadRequest(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unexpected error creating user");
        return StatusCode(500, new { error = "An error occurred" });
    }
}
```

```typescript
// Frontend Pattern
const handleApiCall = async <T>(
    apiCall: () => Promise<T>,
    errorMessage: string
): Promise<Result<T>> => {
    try {
        const data = await apiCall();
        return { success: true, data };
    } catch (error) {
        console.error(errorMessage, error);
        return { success: false, error: errorMessage };
    }
};
```

## Backend Development (.NET/C#)

### 1. Project Structure
```
Solution/
├── src/
│   ├── ProjectName.Api/           # API controllers and startup
│   ├── ProjectName.Core/          # Domain models and interfaces
│   ├── ProjectName.Application/   # Business logic and services
│   ├── ProjectName.Infrastructure/# Data access and external services
│   └── ProjectName.Common/        # Shared utilities
└── tests/
    ├── ProjectName.UnitTests/
    └── ProjectName.IntegrationTests/
```

### 2. Dependency Injection Pattern
```csharp
// Startup.cs or Program.cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // Register services with appropriate lifetimes
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddSingleton<ICacheService, RedisCacheService>();
        
        // Use extension methods for organization
        services.AddCustomAuthentication(Configuration);
        services.AddDatabaseContext(Configuration);
    }
}

// Extension method for clarity
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDatabaseContext(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
        
        return services;
    }
}
```

### 3. Repository Pattern
```csharp
// Interface
public interface IRepository<T> where T : class
{
    Task<T> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
}

// Implementation
public class Repository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    // Implement other methods...
}
```

### 4. Service Layer Pattern
```csharp
public interface IUserService
{
    Task<UserDto> GetUserAsync(int userId);
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task<PagedResult<UserDto>> GetUsersAsync(PaginationParams parameters);
}

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        IMapper mapper,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<UserDto> GetUserAsync(int userId)
    {
        _logger.LogInformation("Fetching user with ID: {UserId}", userId);
        
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with ID {userId} not found");
        }

        return _mapper.Map<UserDto>(user);
    }
}
```

### 5. API Controller Best Practices
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Gets a user by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _userService.GetUserAsync(id);
        return Ok(user);
    }

    /// <summary>
    /// Creates a new user
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _userService.CreateUserAsync(dto);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }
}
```

### 6. Async/Await Best Practices
```csharp
// ✅ Good - Async all the way
public async Task<IEnumerable<UserDto>> GetActiveUsersAsync()
{
    var users = await _userRepository.GetActiveUsersAsync();
    return users.Select(u => _mapper.Map<UserDto>(u));
}

// ❌ Bad - Blocking async code
public IEnumerable<UserDto> GetActiveUsers()
{
    var users = _userRepository.GetActiveUsersAsync().Result; // Don't do this!
    return users.Select(u => _mapper.Map<UserDto>(u));
}

// ✅ Good - ConfigureAwait for library code
public async Task<string> GetDataAsync()
{
    var result = await httpClient.GetStringAsync(url).ConfigureAwait(false);
    return result;
}
```

## Frontend Development (React/TypeScript)

### 1. Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components
│   └── features/        # Feature-specific components
├── hooks/               # Custom React hooks
├── services/            # API and external services
├── store/               # State management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── pages/               # Page components
└── styles/              # Global styles
```

### 2. Component Structure
```typescript
// UserCard.tsx - Functional component with TypeScript
import React, { FC, memo } from 'react';
import { UserData } from '@/types/user';

interface UserCardProps {
    user: UserData;
    onEdit?: (userId: number) => void;
    className?: string;
}

export const UserCard: FC<UserCardProps> = memo(({ 
    user, 
    onEdit, 
    className = '' 
}) => {
    const handleEdit = () => {
        onEdit?.(user.id);
    };

    return (
        <div className={`user-card ${className}`}>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            {onEdit && (
                <button onClick={handleEdit}>Edit</button>
            )}
        </div>
    );
});

UserCard.displayName = 'UserCard';
```

### 3. Custom Hooks Pattern
```typescript
// hooks/useApi.ts
import { useState, useEffect } from 'react';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export function useApi<T>(
    apiCall: () => Promise<T>,
    dependencies: any[] = []
): UseApiState<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                setState(prev => ({ ...prev, loading: true }));
                const data = await apiCall();
                
                if (!cancelled) {
                    setState({ data, loading: false, error: null });
                }
            } catch (error) {
                if (!cancelled) {
                    setState({ 
                        data: null, 
                        loading: false, 
                        error: error as Error 
                    });
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, dependencies);

    return state;
}
```

### 4. Service Layer Pattern
```typescript
// services/api/userService.ts
import { apiClient } from '@/services/apiClient';
import { UserData, CreateUserDto } from '@/types/user';

class UserService {
    private readonly baseUrl = '/api/users';

    async getUsers(): Promise<UserData[]> {
        const response = await apiClient.get<UserData[]>(this.baseUrl);
        return response.data;
    }

    async getUser(id: number): Promise<UserData> {
        const response = await apiClient.get<UserData>(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async createUser(dto: CreateUserDto): Promise<UserData> {
        const response = await apiClient.post<UserData>(this.baseUrl, dto);
        return response.data;
    }

    async updateUser(id: number, dto: Partial<UserData>): Promise<UserData> {
        const response = await apiClient.put<UserData>(`${this.baseUrl}/${id}`, dto);
        return response.data;
    }
}

export const userService = new UserService();
```

### 5. State Management Pattern
```typescript
// store/userSlice.ts (Redux Toolkit example)
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService } from '@/services/api/userService';
import { UserData } from '@/types/user';

interface UserState {
    users: UserData[];
    selectedUser: UserData | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    users: [],
    selectedUser: null,
    loading: false,
    error: null,
};

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async () => {
        return await userService.getUsers();
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        selectUser: (state, action: PayloadAction<UserData>) => {
            state.selectedUser = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch users';
            });
    },
});

export const { selectUser, clearError } = userSlice.actions;
export default userSlice.reducer;
```

### 6. TypeScript Best Practices
```typescript
// types/user.ts - Type definitions
export interface UserData {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserRole {
    Admin = 'ADMIN',
    User = 'USER',
    Guest = 'GUEST',
}

export interface CreateUserDto {
    email: string;
    name: string;
    password: string;
    role?: UserRole;
}

// Use type for unions and intersections
export type UserStatus = 'active' | 'inactive' | 'pending';

// Use interface for object shapes
export interface UserFilters {
    status?: UserStatus;
    role?: UserRole;
    searchTerm?: string;
}

// Generic types for reusability
export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

// Utility types
export type PartialUser = Partial<UserData>;
export type UserFormData = Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>;
```

## Project Structure

### Optimal Directory Layout
```
project-root/
├── .claude/              # Claude Code specific configurations
│   └── instructions.md   # Project-specific AI instructions
├── docs/                 # Documentation
│   ├── api/             # API documentation
│   ├── architecture/    # Architecture decisions
│   └── development/     # Development guides
├── src/                  # Source code
├── tests/                # Test files
├── scripts/              # Build and utility scripts
├── config/               # Configuration files
└── README.md            # Project overview
```

### Configuration Files
```json
// tsconfig.json - TypeScript configuration
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

```xml
<!-- .csproj - C# project configuration -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
    <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.0" />
  </ItemGroup>
</Project>
```

## Documentation Standards

### 1. Code Comments
```csharp
/// <summary>
/// Processes a payment transaction for the specified user.
/// </summary>
/// <param name="userId">The ID of the user making the payment</param>
/// <param name="amount">The payment amount in cents</param>
/// <returns>A task representing the payment result</returns>
/// <exception cref="ArgumentException">Thrown when amount is negative</exception>
public async Task<PaymentResult> ProcessPaymentAsync(int userId, decimal amount)
{
    // Validate amount before processing
    if (amount <= 0)
    {
        throw new ArgumentException("Amount must be positive", nameof(amount));
    }

    // Complex logic explanation here
    // ...
}
```

```typescript
/**
 * Formats a date string according to user's locale
 * @param date - The date to format
 * @param format - Optional format string (default: 'short')
 * @returns Formatted date string
 * @example
 * formatDate(new Date(), 'long') // "January 1, 2024"
 */
export function formatDate(
    date: Date | string, 
    format: 'short' | 'long' = 'short'
): string {
    // Implementation
}
```

### 2. README Structure
```markdown
# Project Name

Brief description of the project.

## Features
- Feature 1
- Feature 2

## Prerequisites
- Node.js 18+
- .NET 8.0
- PostgreSQL 14+

## Installation
\`\`\`bash
npm install
dotnet restore
\`\`\`

## Configuration
Describe configuration steps...

## Usage
\`\`\`bash
npm run dev
dotnet run
\`\`\`

## Testing
\`\`\`bash
npm test
dotnet test
\`\`\`

## Project Structure
Describe the main directories...

## Contributing
Guidelines for contributors...

## License
License information...
```

## Claude Code Optimization

### 1. File Organization for AI Understanding
```
✅ Best Practices:
- Keep related files in the same directory
- Use descriptive file names
- Maintain consistent naming patterns
- Include type definitions near usage
- Group imports logically

❌ Avoid:
- Deeply nested folder structures (>4 levels)
- Circular dependencies
- Mixed naming conventions
- Scattered configuration files
```

### 2. Code Clarity Guidelines
```typescript
// ✅ Clear and explicit
interface UserAuthenticationResult {
    isAuthenticated: boolean;
    user?: UserData;
    error?: string;
    token?: string;
}

// ❌ Ambiguous
interface AuthRes {
    ok: boolean;
    u?: any;
    e?: string;
    t?: string;
}
```

### 3. Self-Documenting Code
```csharp
// ✅ Self-explanatory method names
public async Task<bool> IsUserEligibleForPromotionAsync(int userId)
{
    var user = await GetUserAsync(userId);
    return user.AccountAge > TimeSpan.FromDays(90) 
           && user.PurchaseCount >= 5;
}

// ❌ Unclear intent
public async Task<bool> CheckUser(int id)
{
    var u = await GetU(id);
    return u.Age > 90 && u.Count >= 5;
}
```

### 4. Consistent Patterns
```typescript
// Define a consistent pattern for API calls
const createApiMethod = <TRequest, TResponse>(
    method: string,
    endpoint: string
) => {
    return async (data?: TRequest): Promise<TResponse> => {
        const response = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: data ? JSON.stringify(data) : undefined,
        });
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }
        
        return response.json();
    };
};

// Use consistently throughout the application
export const api = {
    users: {
        getAll: createApiMethod<void, UserData[]>('GET', '/api/users'),
        create: createApiMethod<CreateUserDto, UserData>('POST', '/api/users'),
        update: createApiMethod<UpdateUserDto, UserData>('PUT', '/api/users'),
    },
};
```

### 5. Environment Configuration
```typescript
// config/environment.ts
interface EnvironmentConfig {
    apiUrl: string;
    appName: string;
    version: string;
    features: {
        enableAnalytics: boolean;
        enableDebugMode: boolean;
    };
}

const config: EnvironmentConfig = {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    appName: process.env.REACT_APP_NAME || 'MyApp',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    features: {
        enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
        enableDebugMode: process.env.NODE_ENV === 'development',
    },
};

export default config;
```

### 6. Testing Patterns
```typescript
// UserService.test.ts
describe('UserService', () => {
    let service: UserService;
    let mockRepository: jest.Mocked<IUserRepository>;

    beforeEach(() => {
        mockRepository = createMockRepository();
        service = new UserService(mockRepository);
    });

    describe('getUser', () => {
        it('should return user when found', async () => {
            // Arrange
            const expectedUser = { id: 1, name: 'Test User' };
            mockRepository.findById.mockResolvedValue(expectedUser);

            // Act
            const result = await service.getUser(1);

            // Assert
            expect(result).toEqual(expectedUser);
            expect(mockRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw error when user not found', async () => {
            // Arrange
            mockRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(service.getUser(1)).rejects.toThrow('User not found');
        });
    });
});
```

## Summary

Following these best practices ensures:
1. **Maintainability**: Code is easy to understand and modify
2. **Scalability**: Architecture supports growth
3. **AI Compatibility**: Claude Code can effectively understand and work with the codebase
4. **Team Collaboration**: Consistent patterns reduce onboarding time
5. **Quality**: Fewer bugs through clear patterns and testing

Remember: The goal is to write code that is not just functional, but also clear, consistent, and easy for both humans and AI assistants to understand and work with.