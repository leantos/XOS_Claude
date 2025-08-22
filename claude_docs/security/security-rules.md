# XOS Framework Security Guide

## 🛡️ XOS-Specific Security Patterns

### XOS Component Security
```javascript
// ✅ Secure XOS ViewModel pattern
export default class SecureComponentVM extends VMBase {
    constructor(props) {
        super(props);
        
        // Validate user permissions on component load
        if (!this.hasPermission('MODULE_ACCESS')) {
            throw new Error('Access denied');
        }
    }
    
    // Always validate data before API calls
    async saveData() {
        const model = this.Data;
        
        // Input sanitization
        model.userInput = Utils.sanitizeInput(model.userInput);
        
        // Permission check before save
        if (!this.hasPermission('DATA_MODIFY')) {
            this.showAlert('Insufficient permissions');
            return;
        }
        
        // Use parameterized queries via XOS Utils
        await Utils.ajax({
            url: 'secure/save',
            data: { sanitizedData: model.userInput },
            method: 'POST'
        });
    }
}
```

### XOS Authentication Integration
```javascript
// Check authentication in XOS lifecycle
onLoad() {
    if (!cntrl.ApiManager.isAuthenticated()) {
        this.navigateToLogin();
        return;
    }
    
    // Refresh token if needed
    cntrl.ApiManager.refreshTokenIfNeeded();
}
```

---

# Security Implementation Reference

## Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@email.com",
  "site_id": "1",
  "client_id": "1",
  "roles": ["Manager", "Supervisor"],
  "exp": 1234567890,
  "iss": "CVS",
  "aud": "CVS_API"
}
```

### Token Lifecycle
| Token Type | Duration | Storage | Refresh |
|------------|----------|---------|---------|
| Access Token | 5 min | Memory | Auto |
| Refresh Token | 24 hours | HttpOnly Cookie | Manual |
| Session Token | 30 min | SessionStorage | On activity |

## Permission Matrix

### Module Permissions
| Module | Admin | Manager | Supervisor | User |
|--------|-------|---------|------------|------|
| CVSM001 (Users) | CRUD | R | - | - |
| CVSM005 (Sites) | CRUD | RU | R | - |
| CVST020 (Opera Audit) | CRUD | CRUD | CRU | R |
| CVST010 (Refunds) | CRUD | CRUD | CR | - |
| CVSR005 (Reports) | CRUD | R | R | R |

### API Endpoint Permissions
| Endpoint | Method | Roles |
|----------|--------|-------|
| /api/auth/* | ALL | Anonymous |
| /api/usermaster/* | ALL | Admin |
| /api/operaincomeaudit/* | GET | All authenticated |
| /api/operaincomeaudit/* | POST/PUT | Manager, Supervisor |
| /api/refund/approve | POST | Manager |
| /api/report/generate | POST | All authenticated |

## Sensitive Data Fields

### PII (Personally Identifiable Information)
| Field | Table | Encryption | Masking |
|-------|-------|------------|---------|
| password_hash | users | BCrypt | N/A |
| email | users | No | Partial in logs |
| bank_account | refunds | AES-256 | Last 4 digits |
| credit_card | payments | Tokenized | Last 4 digits |

### Financial Data
| Field | Table | Access Control |
|-------|-------|----------------|
| revenue_amount | opera_income_audit | Role-based |
| refund_amount | refunds | Role-based |
| bank_balance | bank_reconciliation | Manager+ |

## Security Headers

```csharp
// Applied in Startup.cs
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
```

## CORS Configuration

```json
{
  "CorsIPs": [
    "https://localhost:3000",
    "https://production.domain.com"
  ]
}
```

## Input Validation Rules

| Input Type | Validation | Sanitization |
|------------|------------|--------------|
| Email | Regex pattern | Lowercase, trim |
| Amount | Decimal, > 0 | Round to 2 decimals |
| Date | Valid date, <= today | ISO format |
| File Upload | Extension whitelist | Virus scan |
| SQL Parameters | Parameterized queries | Escape special chars |

## Audit Logging

### Events to Log
| Event | Level | Data Captured |
|-------|-------|---------------|
| Login Success | Info | User, IP, Time |
| Login Failure | Warning | Username, IP, Time |
| Permission Denied | Warning | User, Resource, Action |
| Data Modification | Info | User, Table, Before/After |
| Error | Error | Stack trace, User, Context |

### Audit Table Structure
```sql
audit_log (
  log_id, user_id, action, resource,
  old_value, new_value, ip_address,
  timestamp, session_id
)
```

## Password Policy

| Rule | Value |
|------|-------|
| Minimum Length | 8 characters |
| Complexity | 1 uppercase, 1 lowercase, 1 number, 1 special |
| Expiration | 90 days |
| History | Cannot reuse last 5 |
| Lockout | 5 failed attempts = 15 min lockout |

## Session Management

### Session Rules
- Timeout: 30 minutes idle
- Concurrent sessions: 1 per user
- Session invalidation on password change
- Secure cookie flags: HttpOnly, Secure, SameSite

## API Security

### Rate Limiting
| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 5 | 1 minute |
| File Upload | 10 | 5 minutes |
| General API | 100 | 1 minute |

### API Key Management
```csharp
// Service-to-service authentication
X-API-Key: {encrypted_key}
X-Client-Id: {client_identifier}
```

## File Security

### Upload Restrictions
| Type | Max Size | Allowed Extensions |
|------|----------|-------------------|
| Documents | 10MB | .pdf, .doc, .docx |
| Images | 5MB | .jpg, .png, .gif |
| Data Files | 50MB | .csv, .xlsx, .xls |

### File Storage
- Separate from web root
- Encrypted at rest
- Scanned for malware
- Access via signed URLs

## Database Security

### Connection Security
- SSL/TLS required
- Connection pooling with limits
- Separate read/write connections
- Encrypted connection strings

### Query Security
- Parameterized queries only
- No dynamic SQL construction
- Stored procedures for complex operations
- Query timeout: 30 seconds

## Encryption Keys

### Key Storage
| Key Type | Storage | Rotation |
|----------|---------|----------|
| JWT Secret | Environment variable | Monthly |
| Database | Azure Key Vault | Quarterly |
| File Encryption | HSM | Annually |

## Security Monitoring

### Alerts
| Condition | Alert Level | Action |
|-----------|-------------|--------|
| Multiple failed logins | High | Email admin |
| Privilege escalation | Critical | Block & alert |
| Unusual data access | Medium | Log & review |
| File upload anomaly | High | Quarantine |

## XOS Frontend Security Patterns

### Input Validation in XOS Components
```javascript
// XOSTextbox with validation
<cntrl.XOSTextbox
    name="amount"
    value={this.VM.Data.amount || ''}
    onChange={this.handleSecureInput}
    inputType={cntrl.XOSTextboxTypes.numeric}
    maxLength={10}
    mandatory={true}
/>

// Secure input handler
handleSecureInput = (e) => {
    if (this.VM) {
        const model = this.VM.Data;
        
        // Server-side validation will happen, but client validation for UX
        let sanitizedValue = e.value;
        
        // Example: Amount validation
        if (e.name === 'amount') {
            sanitizedValue = this.validateAmount(e.value);
        }
        
        model[e.name] = sanitizedValue;
        this.VM.updateUI();
    }
};
```

### XOS State Security
```javascript
// Secure state management in ViewModels
export default class SecureVM extends VMBase {
    init() {
        const model = this.Data;
        
        // ⚠️ NEVER store sensitive data in client state
        model.maskedCardNumber = '****-****-****-1234';  // ✅ Masked
        // model.fullCardNumber = '1234-5678-9012-3456';  // ❌ NEVER!
        
        // Use tokens for sensitive operations
        model.paymentToken = null;  // Will be set by secure API call
    }
}
```

### XOS API Security Integration
```javascript
// Secure API calls using XOS Utils
async secureApiCall(sensitiveData) {
    try {
        // Utils.ajax automatically handles:
        // - JWT token attachment
        // - CSRF protection
        // - Request timeout
        // - Error standardization
        
        const result = await Utils.ajax({
            url: 'secure/process-payment',
            data: {
                // Only send necessary data
                paymentToken: sensitiveData.token,
                amount: sensitiveData.amount
                // DON'T send: card numbers, SSNs, etc.
            },
            method: 'POST',
            timeout: 30000  // 30 second timeout
        });
        
        return result;
    } catch (error) {
        // Don't expose internal errors to users
        this.showAlert('Operation failed. Please try again.');
        console.error('Secure API call failed:', error);
    }
}
```

## Compliance Requirements

### Data Retention
| Data Type | Retention Period | Deletion Method |
|-----------|-----------------|-----------------|
| User data | 7 years after inactive | Soft delete → Hard delete |
| Financial records | 7 years | Archive → Delete |
| Audit logs | 5 years | Archive → Delete |
| Session data | 24 hours | Auto-purge |

### GDPR Compliance
- Right to access: Export user data API
- Right to deletion: Soft delete with purge
- Data portability: JSON/CSV export
- Consent tracking: audit_consent table

## Security Checklist for XOS Developers

### ✅ Frontend Security Checklist
- [ ] No sensitive data stored in component state
- [ ] All inputs validated both client and server-side
- [ ] XOSTextbox components use appropriate inputType restrictions
- [ ] API calls use Utils.ajax (handles tokens automatically)
- [ ] Error messages don't expose internal system details
- [ ] File uploads restricted by type and size
- [ ] User permissions checked in component lifecycle methods

### ✅ Backend Security Checklist  
- [ ] All endpoints require authentication except /api/auth/*
- [ ] Role-based authorization implemented
- [ ] Input parameters validated and sanitized
- [ ] SQL queries use parameterized statements only
- [ ] Sensitive data encrypted at rest
- [ ] Audit logging for all data modifications
- [ ] Rate limiting configured
- [ ] CORS properly configured

### ✅ Database Security Checklist
- [ ] Connection strings encrypted
- [ ] SSL/TLS required for connections
- [ ] No stored procedures with dynamic SQL
- [ ] Sensitive columns encrypted (passwords, PII)
- [ ] Regular security patches applied
- [ ] Database users have minimum required permissions