# Database & Authentication Troubleshooting Guide

## Common Issues and Solutions

### 1. Database Connection Issues

#### Problem: "database does not exist" error
**Symptom:**
```
Npgsql.PostgresException (0x80004005): 3D000: database "[YourDatabase]_Dev" does not exist
```

**Root Cause:**
- The application uses different database names in different environments
- `appsettings.json` specifies one database (e.g., "YourDatabase")
- `appsettings.Development.json` overrides it with another (e.g., "YourDatabase_Dev")
- Tables were created in one database but app tries to connect to another

**Solution:**
1. Check which database contains your tables:
   ```sql
   SELECT current_database();
   ```

2. Update the appropriate appsettings file to match:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Port=5432;Database=YourDatabase;User Id=postgres;Password=yourpassword;"
   }
   ```

3. Restart the application after changing connection strings

**Prevention:**
- Always verify which database you're connected to before creating tables
- Use consistent database names across environments
- Document the database name in project setup

### 2. Password Hashing Mismatch

#### Problem: "Invalid username or password" despite correct credentials
**Symptom:**
```
Login attempt failed: Invalid password for admin
```

**Root Cause:**
- Password hashes in database don't match application's hashing algorithm
- Different salt or hashing method used when inserting test data
- Hash encoding mismatch (hex vs base64)

**Solution:**
1. Generate correct password hash using the application's exact method:
   ```powershell
   # PowerShell command to generate SHA256 hash with salt
   [System.Convert]::ToBase64String([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes('admin123XOS_SALT')))
   ```

2. Update the database with correct hashes:
   ```sql
   UPDATE users 
   SET password_hash = 'TBe4o+S2Vx2OfJgdqNF3D5qLoLjrl0CYB5MKAWPlW1I=' 
   WHERE username = 'admin';
   ```

**Prevention:**
- Document the exact hashing algorithm and salt
- Create a utility function to generate hashes for test data
- Use the application's service methods to create test users

### 3. Service Circular Dependencies

#### Problem: Circular dependency in project references
**Symptom:**
```
error MSB4006: There is a circular dependency in the target dependency graph
```

**Root Cause:**
- Domain/Core project references WebApi/Presentation project
- WebApi/Presentation project references Domain/Core project
- Services placed in wrong project layer

**Solution:**
1. Move services that depend on WebApi components to WebApi project:
   ```bash
   mv "YourDomain.Services\ServiceWithWebDependency.cs" "YourWebApi.Services\"
   ```

2. Update namespace in moved files:
   ```csharp
   namespace YourWebApi.Services // Changed from YourDomain.Services
   ```

3. Update DI registration to reflect new location:
   ```csharp
   builder.Services.AddScoped<IYourService, YourWebApi.Services.YourService>();
   ```

**Prevention:**
- Keep domain models and interfaces in Domain/Core project
- Keep service implementations that need WebApi dependencies in WebApi/Presentation project
- Follow clear separation of concerns and clean architecture principles

### 4. Missing Database Service Implementations

#### Problem: IDBService and IDBUtils not implemented
**Symptom:**
```
error CS0246: The type or namespace name 'IDBService' could not be found
```

**Solution:**
1. Check if PostgreSQL implementations exist:
   - PostgreSQLDBService.cs
   - PostgreSQLDBUtils.cs

2. Register them in Program.cs:
   ```csharp
   builder.Services.AddScoped<IDBService, PostgreSQLDBService>();
   builder.Services.AddScoped<IDBUtils, PostgreSQLDBUtils>();
   ```

3. If missing, create mock implementations temporarily

**Prevention:**
- Document all required service interfaces
- Create implementations before using them
- Use dependency injection consistently

## Quick Checklist for New Module Setup

When creating a new module with database authentication:

1. **Database Setup:**
   - [ ] Verify database name in connection string
   - [ ] Create tables in correct database
   - [ ] Use database tools to verify table creation

2. **Password Hashing:**
   - [ ] Use consistent hashing algorithm (SHA256 + salt)
   - [ ] Generate test data hashes using same method
   - [ ] Store hashes in Base64 format

3. **Project Structure:**
   - [ ] Domain models in Domain/Core project
   - [ ] Service interfaces in Domain/Core project
   - [ ] Service implementations in appropriate layer
   - [ ] Avoid circular dependencies

4. **Service Registration:**
   - [ ] Register all services in Program.cs
   - [ ] Register database services (IDBService, IDBUtils)
   - [ ] Verify all dependencies are available

5. **Testing:**
   - [ ] Test with correct database
   - [ ] Verify password hashing works
   - [ ] Check logs for detailed error messages

## Useful Commands

### Generate Password Hash (PowerShell)
```powershell
$password = "yourpassword"
$salt = "XOS_SALT"
[System.Convert]::ToBase64String([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($password + $salt)))
```

### Check Current Database
```sql
-- PostgreSQL
SELECT current_database();

-- SQL Server
SELECT DB_NAME();

-- MySQL
SELECT DATABASE();
```

### List All Tables
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### View Application Logs
```bash
# Run app with detailed logging
dotnet run --project YourProject.WebApi

# Check log files
cat Logs/log-*.txt
```

## Notes for Future Improvements

1. **Hashing Algorithm**: Consider migrating to BCrypt or Argon2 for better security
2. **Configuration**: Use environment variables for sensitive connection strings
3. **Database Migrations**: Implement Entity Framework or FluentMigrator for version control
4. **Error Messages**: Improve error messages to be more descriptive without exposing sensitive info