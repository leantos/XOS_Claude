# Project Naming Conventions

## File Naming

### Backend Files (.cs)
| Type | Pattern | Example |
|------|---------|---------|
| Service | {Name}Service.cs | OperaIncomeAuditService.cs |
| Controller | {Name}Controller.cs | RefundController.cs |
| Interface | I{Name}Service.cs | IRefundService.cs |
| Domain Model | {Name}.cs | Refund.cs |
| Utils | {Name}Utils.cs | ZipUtils.cs |

### Frontend Files (.jsx/.js)
| Type | Pattern | Example |
|------|---------|---------|
| Component | index.jsx | {PROJECT}T020/index.jsx |
| ViewModel | {ModuleCode}VM.js | {PROJECT}T020VM.js |
| Style | index.css | {PROJECT}T020/index.css |

## Database Naming

### Tables
| Type | Pattern | Example |
|------|---------|---------|
| Entity | plural_lowercase | users, refunds |
| Junction | table1_table2 | user_groups |
| Lookup | lk_{name} | lk_status_types |
| Archive | {table}_archive | workflow_archive |

### Columns
| Type | Pattern | Example |
|------|---------|---------|
| Primary Key | {table_singular}_id | user_id |
| Foreign Key | {ref_table}_id | site_id |
| Boolean | is_{state} | is_active |
| Date | {action}_date | created_date |
| JSON | {name}_data | revenue_data |

## API Endpoints

### RESTful Routes
| Action | Pattern | Example |
|--------|---------|---------|
| List | GET /api/{resource} | GET /api/refunds |
| Get | GET /api/{resource}/{id} | GET /api/refunds/123 |
| Create | POST /api/{resource} | POST /api/refunds |
| Update | PUT /api/{resource}/{id} | PUT /api/refunds/123 |
| Delete | DELETE /api/{resource}/{id} | DELETE /api/refunds/123 |

### Custom Actions
| Pattern | Example |
|---------|---------|
| POST /api/{resource}/{action} | POST /api/refunds/approve |
| GET /api/{resource}/{id}/{sub} | GET /api/users/123/permissions |

## C# Conventions

### Classes & Interfaces
```csharp
public interface IRefundService { }  // PascalCase with I prefix
public class RefundService { }       // PascalCase
public abstract class ServiceBase { } // PascalCase with suffix
```

### Methods & Properties
```csharp
public async Task<Result> ProcessRefundAsync() // PascalCase + Async suffix
public string RefundStatus { get; set; }       // PascalCase
private void validateAmount()                  // camelCase for private
```

### Variables
```csharp
const int MAX_RETRIES = 3;        // UPPER_SNAKE for constants
private readonly ILogger _logger;  // _camelCase for fields
var refundAmount = 100.00m;       // camelCase for locals
```

## JavaScript/React Conventions

### Components
```javascript
export default class {PROJECT}T020 extends Component  // PascalCase
const DashboardWidget = () => { }              // PascalCase
```

### Functions & Variables
```javascript
const handleSubmit = () => { }     // camelCase
let isLoading = false;             // camelCase
const MAX_FILE_SIZE = 1024;        // UPPER_SNAKE for constants
```

### Props & State
```javascript
<Component isActive={true} />      // camelCase props
const [userData, setUserData] = useState(); // camelCase
```

## Module Codes

### Pattern: {PROJECT}{Type}{Number}
| Type | Description | Range |
|------|-------------|-------|
| M | Master/General | 001-099 |
| T | Transaction | 001-099 |
| R | Report | 001-099 |

Examples: {PROJECT}M001, {PROJECT}T020, {PROJECT}R005
Replace {PROJECT} with your project abbreviation (e.g., ERP, CRM, CVS)

## Service Method Naming

| Operation | Pattern | Example |
|-----------|---------|---------|
| Get single | Get{Entity}() | GetRefund() |
| Get list | Get{Entities}() | GetRefunds() |
| Create | Create{Entity}() | CreateRefund() |
| Update | Update{Entity}() | UpdateRefund() |
| Delete | Delete{Entity}() | DeleteRefund() |
| Process | Process{Action}() | ProcessApproval() |
| Validate | Validate{Entity}() | ValidateRefund() |

## Domain Model Properties

| Type | Pattern | Example |
|------|---------|---------|
| ID | {Entity}Id | RefundId |
| Status | {Entity}Status | RefundStatus |
| Date | {Action}Date | CreatedDate |
| User reference | {Action}By | CreatedBy |
| Amount | {Type}Amount | RefundAmount |

## Error Codes

### Pattern: {MODULE}_{ERROR_TYPE}_{NUMBER}
```
REFUND_VALIDATION_001: Invalid amount
{PROJECT}_IMPORT_001: File not found
AUTH_ACCESS_001: Unauthorized
```

## Configuration Keys

### appsettings.json
```json
{
  "XOSConfig": {
    "JwtOptions": { },      // PascalCase sections
    "EmailSettings": { }    // PascalCase keys
  }
}
```

## Git Conventions

### Branch Names
| Type | Pattern | Example |
|------|---------|---------|
| Feature | feature/{ticket}-{description} | feature/{PROJECT}-123-add-refund |
| Bug | bug/{ticket}-{description} | bug/{PROJECT}-456-fix-login |
| Hotfix | hotfix/{description} | hotfix/critical-security |

### Commit Messages
```
{type}: {description}

feat: Add refund approval workflow
fix: Resolve date formatting issue
docs: Update API documentation
```

## Test Naming

```csharp
[Test]
public void ProcessRefund_ValidAmount_ReturnsSuccess() { }
// Pattern: {Method}_{Condition}_{ExpectedResult}
```

## Environment Variables

```
{PROJECT}_DB_CONNECTION      // APP_COMPONENT_PURPOSE
{PROJECT}_JWT_SECRET
{PROJECT}_SMTP_HOST
```