# Backend Implementation Guide - Universal Patterns

## Current Implementation Status (2025-08-12)

### ✅ Completed Components

#### 1. Database Access Layer
- **Pattern**: Repository pattern with Dapper-style queries (NO Entity Framework)
- **Provider**: Npgsql 8.0.5
- **Location**: `Restaurant.Transaction\Core\Database\`

**Key Classes:**
- `IDBService` - Database service interface
- `DBService` - Implementation with connection management
- `DBParameters` - Parameter handling for queries
- `DBFactory` - Multi-tenant connection routing
- `XOSServiceBase` - Base class with DBUtils() method

**Usage Pattern:**
```csharp
using var db = DBUtils("DEFAULT", false); // false = read mode
var result = await db.GetEntityDataAsync<T>(query, parameters, mapper);
```

**Data Reader Pattern (CRITICAL):**
```csharp
// Reading data from query results using GetValue<T>
await db.GetEntityDataListAsync<User>(query, parameters, (row) =>
{
    var user = new User
    {
        ClientID = row.GetValue<short>("ClientID"),
        ID = row.GetValue<short>("UserCd"),
        Name = row.GetValue<string>("UserName"),
        TimezoneID = row.GetValue<string>("TimezoneID"),
        IsActive = row.GetValue<bool>("IsActive", false) // with default
    };
    return user;
});
```

**IMPORTANT**: Always use `row.GetValue<T>("ColumnName")` to read data from query results!

#### 2. Authentication System
- **Method**: JWT Bearer tokens
- **Password Hashing**: BCrypt.Net-Next
- **Token Expiry**: 60 minutes (configurable)
- **Claims**: ClientID, SiteID, RestaurantID, UserGroupID, Role, TimezoneID

**JWT Configuration (appsettings.json):**
```json
{
  "JwtOptions": {
    "SecretKey": "RestaurantSecretKey2025VeryLongSecretKeyForJWT",
    "Issuer": "http://localhost:5000",
    "Audience": "RestaurantAPI",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationMinutes": 1440
  }
}
```

#### 3. Service Architecture

**Business Services (Restaurant.Transaction):**
- `UserService : XOSServiceBase, IUserService`
  - `SigninAsync(User.LoginInput)` - Authenticates user with BCrypt
  - `GetUserByIdAsync(short userId)` - Gets user details
  
- `RestaurantService : XOSServiceBase, IRestaurantService`
  - `GetUserRestaurantsAsync(short userId)` - User's restaurants
  - `GetRestaurantByIdAsync(short restaurantId)` - Single restaurant
  - `GetAllRestaurantsAsync()` - All active restaurants

**Web API Services (Restaurant.WebApi):**
- `AuthService : IAuthService`
  - Coordinates login flow with UserService and JwtTokenService
  - Returns JWT token with user info
  
- `JwtTokenService : IJwtTokenService`
  - Generates and validates JWT tokens
  - Creates refresh tokens

#### 4. API Endpoints

**AuthController** (`/api/auth/`):
- `POST /sign-in` - Login with username/password
- `POST /sign-out` - Logout (new keyword to avoid conflict)
- `GET /validate` - Validate current JWT token
- `POST /refresh-token` - Refresh access token (stub)

**RestaurantController** (`/api/restaurant/`):
- `GET /list` - Get user's restaurants
- `GET /{id}` - Get specific restaurant
- `GET /all` - Get all restaurants
- `POST /select/{id}` - Select a restaurant

#### 5. Database Schema

**Tables Created:**
- `users` - User accounts with BCrypt passwords
- `restaurants` - Restaurant entities
- `user_restaurants` - Many-to-many relationship

**Sample Data:**
- Users: admin, manager, staff (all password: 'admin123')
- Restaurants: Downtown Bistro, Uptown Grill, Westside Cafe

**SQL Script Location:** `Documents\DB\create_tables.sql`

### 📁 Project Structure

```
Restaurant.WebApi/
├── Controllers/
│   ├── AuthController.cs
│   └── RestaurantController.cs
├── Services/
│   ├── AuthService.cs
│   ├── JwtTokenService.cs
│   └── IJwtTokenService.cs
├── Domain/
│   ├── JwtToken.cs
│   ├── AppClaims.cs
│   └── [other domain models]
└── Program.cs (configured with all services)

Restaurant.Transaction/
├── Core/
│   ├── XOSServiceBase.cs
│   └── Database/
│       ├── IDBService.cs
│       ├── DBService.cs
│       ├── DBParameters.cs
│       ├── IDBFactory.cs
│       └── DBFactory.cs
├── Domain/
│   ├── User.cs
│   ├── Restaurant.cs
│   └── BaseObject.cs
├── Services/
│   ├── UserService.cs
│   └── RestaurantService.cs
└── Interfaces/
    ├── IUserService.cs
    └── IRestaurantService.cs
```

### 🔧 Configuration

**Program.cs Key Registrations:**
```csharp
// Database
builder.Services.AddSingleton<IDBFactory, DBFactory>();

// Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRestaurantService, RestaurantService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// CORS for React on port 3001
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReactApp", policy => {
        policy.WithOrigins("http://localhost:3001", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* token validation */ });
```

### 🚀 Running the Backend

1. **Create Database Tables:**
   ```bash
   # Run the SQL script in Documents\DB\create_tables.sql
   # Using psql or pgAdmin
   ```

2. **Install Dependencies:**
   ```bash
   cd Restaurant.WebApi
   dotnet restore
   ```

3. **Run the API:**
   ```bash
   dotnet run
   # API runs on http://localhost:5000
   ```

### 🔑 Key Implementation Patterns

#### Database Access Pattern
```csharp
public async Task<User.LoginOutput> SigninAsync(User.LoginInput login)
{
    using var db = DBUtils("DEFAULT", false);
    var dbParams = new DBParameters();
    dbParams.Add("username", login.Username.ToLower());
    
    var result = await db.GetEntityDataAsync<T>(
        query, 
        dbParams, 
        (row) => new T { /* mapping */ }
    );
}
```

#### Password Verification
```csharp
if (!BCrypt.Net.BCrypt.Verify(login.Password, dbPassword))
{
    // Invalid password
}
```

#### JWT Token Generation
```csharp
var claims = new Dictionary<string, string>
{
    [AppClaims.ClientID] = userInfo.ClientID.ToString(),
    [AppClaims.Role] = userInfo.Role
};

var token = _jwtTokenService.GenerateToken(jwtUser, claims);
```

### ⚠️ Important Notes

1. **No Entity Framework** - Uses Dapper-style queries with Npgsql
2. **Read-Only MCP** - Database CREATE/UPDATE/DELETE must be run separately
3. **CORS Port** - Frontend expected on port 3001 (not 3000)
4. **Password Hashing** - All passwords use BCrypt with salt
5. **Multi-Restaurant** - Users can have access to multiple restaurants
6. **SignOut Method** - Uses `new` keyword to avoid base class conflict

### 🐛 Known Issues Resolved

1. **Duplicate IAuthService** - Removed from Services\Interfaces\
2. **BaseObject Abstract** - Changed from abstract to concrete class
3. **Missing Packages** - Added Microsoft.Extensions.Configuration.Binder
4. **Npgsql Version** - Updated to 8.0.5 to fix vulnerability

### 📋 Testing Checklist

- [ ] Database tables created
- [ ] Backend builds without errors
- [ ] API starts on port 5000
- [ ] Login endpoint returns JWT token
- [ ] Restaurant list endpoint requires authentication
- [ ] CORS allows requests from React app

### 🔗 Integration Points

**Frontend (React) Integration:**
- Base URL: `http://localhost:5000/api`
- Include JWT in Authorization header: `Bearer {token}`
- Handle 401 for expired tokens
- Store token in SessionManager

**Database Integration:**
- PostgreSQL on localhost:5432
- Database name: Restaurant
- User: postgres, Password: admin

---

*Last Updated: 2025-08-12*
*Status: Backend fully implemented and ready for integration*