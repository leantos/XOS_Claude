# CVS Critical Paths Reference

## Critical Features & File Locations

### 1. User Authentication Flow
**Files:**
- CVS.WebApi/Controllers/AuthController.cs
- CVS.WebApi/Services/TokenStoreService.cs
- CVS.WebApi/Services/TokenValidatorService.cs
- CVS.Transaction/Services/UserService.cs
- UIPages/src/components/Common/Login/index.jsx

**Critical Path:**
1. Login request → AuthController.Login()
2. Validate credentials → UserService.ValidateUser()
3. Generate JWT → TokenStoreService.CreateToken()
4. Store refresh token → Database
5. Return tokens → Client

### 2. Opera Income Audit Processing
**Files:**
- CVS.Transaction/Services/OperaIncomeAuditService.cs
- CVS.WebApi/Controllers/OperaIncomeAuditController.cs
- UIPages/src/components/Transaction/CVST020/index.jsx
- CVS.Transaction/Domain/OperaIncomeAudit.cs

**Critical Path:**
1. Import Opera file → OperaIncomeAuditService.AutoFillData()
2. Parse and validate → ProcessOperaFile()
3. Create workflow → WorkFlowMasterService.InitiateWorkflow()
4. Route for approval → RouteToNext()
5. Generate report → ReportService.GenerateAuditReport()

### 3. Bank Reconciliation
**Files:**
- CVS.Transaction/Services/BankReconciliationService.cs
- CVS.Transaction/Services/BankDataService.cs
- CVS.WebApi/Controllers/BankReconciliationController.cs
- UIPages/src/components/Transaction/CVST005/index.jsx

**Critical Path:**
1. Import statement → BankDataService.ImportStatement()
2. Parse format → BankStatementFormatService.DetectFormat()
3. Auto-match → BankReconciliationService.AutoMatch()
4. Manual match → User interface
5. Complete reconciliation → UpdateStatus()

### 4. Refund Processing
**Files:**
- CVS.Transaction/Services/RefundService.cs
- CVS.Transaction/Services/BacsRefundService.cs
- CVS.WebApi/Controllers/RefundController.cs
- UIPages/src/components/Transaction/CVST010/index.jsx

**Critical Path:**
1. Create refund → RefundService.CreateRefund()
2. Validate details → ValidateRefund()
3. Route approval → WorkFlowMasterService.RouteToNext()
4. Process payment → BacsRefundService.ProcessBatch()
5. Update status → CompleteRefund()

## Common Troubleshooting Paths

### Login Issues
```
Check: AuthController.cs:45-60 (Login method)
→ UserService.cs:120-150 (ValidateUser)
→ appsettings.json (JwtOptions)
→ TokenStoreService.cs:30-50 (CreateToken)
```

### Opera Import Failures
```
Check: OperaIncomeAuditService.cs:200-250 (ProcessOperaFile)
→ File format validation
→ Database connection (workflow_master table)
→ Error logs in Logs/transaction-log.txt
```

### Bank Reconciliation Mismatches
```
Check: BankReconciliationService.cs:300-400 (AutoMatch)
→ Matching rules configuration
→ Date format issues
→ Amount rounding differences
```

## Performance Bottlenecks

| Feature | Bottleneck Location | Impact | Solution |
|---------|-------------------|--------|----------|
| Opera Import | File parsing (>10MB) | 30+ sec | Implement streaming |
| Bank Reconciliation | Auto-matching algorithm | O(n²) | Add indexes, optimize query |
| Report Generation | PDF creation | Memory spike | Use async generation |
| Dashboard | Metrics calculation | Every request | Implement caching |

## Error-Prone Areas

### Database Transactions
**Files:** 
- CVS.Transaction/Core/XOSServiceBase.cs:150-200
**Issues:** Transaction not rolled back on error
**Fix:** Ensure using statement or try-finally

### File Upload
**Files:**
- CVS.Transaction/Services/FileManagerService.cs:50-100
**Issues:** No file size validation, path traversal
**Fix:** Add validation, sanitize paths

### JWT Validation
**Files:**
- CVS.WebApi/Services/TokenValidatorService.cs:30-60
**Issues:** Token expiry not checked properly
**Fix:** Verify exp claim correctly

## Configuration Dependencies

### Critical Config Files
```
CVS.WebApi/appsettings.json
├── XOSConfig.DBSettings (Database connections)
├── XOSConfig.JwtOptions (Authentication)
├── Serilog (Logging)
└── XOSConfig.CorsIPs (CORS)

UIPages/public/config.json
├── API_URL (Backend endpoint)
├── SIGNALR_URL (WebSocket)
└── FEATURES (Feature flags)
```

## Service Dependencies Map

```
OperaIncomeAuditService
├── WorkFlowMasterService (required)
├── EmailService (required)
├── ReportService (optional)
└── AuditService (required)

RefundService
├── BacsRefundService (conditional)
├── WorkFlowMasterService (required)
└── EmailService (required)

BankReconciliationService
├── BankDataService (required)
├── BankStatementFormatService (required)
└── ExportService (optional)
```

## Known Issues & Workarounds

| Issue | Location | Workaround |
|-------|----------|------------|
| Memory leak in report generation | ReportService.cs:200 | Dispose PDF objects explicitly |
| Race condition in workflow | WorkFlowMasterService.cs:150 | Add database row locking |
| SignalR disconnect | NotificationsHub.cs | Implement auto-reconnect |
| File lock on import | FileManagerService.cs:75 | Use FileShare.Read |

## Critical Database Queries

### Most Resource-Intensive
```sql
-- Opera audit summary (OperaIncomeAuditService.cs:350)
SELECT complex_aggregation FROM opera_income_audit
JOIN workflow_master ON ...
-- Add index on audit_date, site_id

-- Bank transaction matching (BankReconciliationService.cs:400)
SELECT * FROM bank_transactions bt
LEFT JOIN statement_transactions st ON ...
-- Add composite index on amount, transaction_date
```

## Deployment Critical Paths

### Pre-deployment Checklist
1. Database migrations applied
2. appsettings.json configured
3. File permissions set (/data folders)
4. SSL certificates valid
5. SignalR endpoint accessible

### Post-deployment Verification
1. Login functionality
2. Opera import test file
3. Report generation
4. Email notifications
5. SignalR connections

## Emergency Recovery Procedures

### Database Connection Lost
```
Location: XOSServiceBase.cs
Fallback: SQLite local cache
Recovery: Retry with exponential backoff
```

### File System Full
```
Location: FileManagerService.cs
Cleanup: /data/temp older than 24h
Archive: /data/exports older than 30d
```

### High Memory Usage
```
Monitor: ReportService, OperaIncomeAuditService
Action: Restart IIS application pool
Long-term: Implement pagination
```