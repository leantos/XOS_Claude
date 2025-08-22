# CVS Integration Points Reference

## External Systems

| System | Type | Protocol | Service | Files/Endpoints |
|--------|------|----------|---------|----------------|
| Opera PMS | Hotel System | File Import | OperaIncomeAuditService | Excel/CSV files |
| Bank Systems | Financial | File Import | BankDataService | CSV/PDF statements |
| BACS Network | Payment | File Export | BacsRefundService | BACS format files |
| SMTP Server | Communication | SMTP | EmailService | Email endpoints |
| SignalR | Real-time | WebSocket | SignalRNotifierService | /hubs/* |
| PDF Generator | Document | Library | HtmlToPDFService | HTML to PDF |

## Opera PMS Integration

### Import Files
| File Type | Format | Schedule | Location |
|-----------|--------|----------|----------|
| Manager Flash | Excel | Daily 06:00 | /imports/opera/flash/ |
| Trial Balance | Excel | Daily 06:00 | /imports/opera/tb/ |
| Room Statistics | CSV | Daily 06:00 | /imports/opera/stats/ |
| Cashier Report | Excel | Daily 06:00 | /imports/opera/cashier/ |

### Data Mapping
```
Opera Field → CVS Field
RoomsSold → Statistics.RoomsSold
RoomRevenue → Revenue.RoomRevenue
F&BRevenue → Revenue.FBRevenue
OtherRevenue → Revenue.OtherRevenue
```

### Service Methods
- OperaIncomeAuditService.ProcessOperaFile()
- OperaIncomeAuditService.ValidateOperaData()
- OperaIncomeAuditService.MapOperaFields()

## Bank Integration

### Supported Formats
| Bank | Format | Parser | Service Method |
|------|--------|--------|----------------|
| HSBC | CSV | HSBCParser | ParseHSBCStatement() |
| Barclays | CSV | BarclaysParser | ParseBarclaysStatement() |
| Lloyds | PDF/CSV | LloydsParser | ParseLloydsStatement() |
| NatWest | CSV | NatWestParser | ParseNatWestStatement() |
| Custom | XML | XMLParser | ParseCustomXML() |

### Import Process
1. File upload → BankDataController
2. Format detection → BankStatementFormatService
3. Parse data → BankDataService
4. Store transactions → Database
5. Trigger reconciliation → BankReconciliationService

## BACS Integration

### File Generation
```
Service: BacsRefundService
Method: GenerateBACSFile()
Format: Standard 18 format
Output: /exports/bacs/[date]_[batch].txt
```

### BACS Record Structure
| Field | Position | Length | Format |
|-------|----------|--------|--------|
| Record Type | 1-2 | 2 | Numeric |
| Sort Code | 3-8 | 6 | Numeric |
| Account Number | 9-16 | 8 | Numeric |
| Transaction Code | 17-18 | 2 | Numeric |
| Amount | 19-29 | 11 | Numeric |
| Reference | 30-47 | 18 | Alphanumeric |

## Email Integration

### SMTP Configuration
```json
{
  "EmailSettings": {
    "Host": "smtp.server.com",
    "Port": 587,
    "EnableSSL": true,
    "From": "system@cvs.com",
    "Username": "smtp_user",
    "Password": "encrypted_password"
  }
}
```

### Email Templates
| Template | Trigger | Recipients |
|----------|---------|------------|
| AuditComplete | Opera audit approved | Finance team |
| RefundApproved | Refund approved | Guest, Finance |
| ReconciliationAlert | Unmatched items | Bank team |
| WorkflowNotification | Pending approval | Approvers |

## SignalR Real-time

### Hubs
| Hub | Path | Purpose | Methods |
|-----|------|---------|---------|
| NotificationsHub | /hubs/notifications | User notifications | SendNotification, BroadcastAlert |
| DashboardHub | /hubs/dashboard | Dashboard updates | UpdateMetrics, RefreshData |

### Client Connection
```javascript
connection = new signalR.HubConnectionBuilder()
  .withUrl("/hubs/notifications", { accessTokenFactory: () => token })
  .build();
```

## File System Integration

### Storage Paths
| Type | Path | Service |
|------|------|---------|
| Imports | /data/imports/ | FileManagerService |
| Exports | /data/exports/ | ExportService |
| Reports | /data/reports/ | ReportService |
| Temp | /data/temp/ | Various |
| Archives | /data/archives/ | FileManagerService |

### File Operations
- StorageManager.SaveFile()
- StorageManager.ReadFile()
- StorageManager.DeleteFile()
- StorageManager.ArchiveFile()

## PDF Processing

### HTML to PDF
```
Service: HtmlToPDFService
Library: iTextSharp / PuppeteerSharp
Input: HTML string + CSS
Output: PDF byte array
```

### PDF Data Extraction
```
Service: PdfDataReader
Library: Tabula (Java)
Tool: tabula-1.0.5-jar-with-dependencies.jar
Method: ExtractTableData()
```

## Database Connections

### PostgreSQL
```
Provider: Npgsql
Connection: Server={host};Port=5432;Database={db};User Id={user};Password={pwd}
Pooling: Min=5, Max=100
```

### SQLite (Local)
```
Provider: Microsoft.Data.Sqlite
Connection: Data Source=Files/DB File/SqliteDB.db
Usage: Local cache, offline mode
```

## Authentication Integration

### JWT Configuration
```json
{
  "JwtOptions": {
    "SecretKey": "{key}",
    "Issuer": "http://localhost:5139",
    "Audience": "CVS",
    "AccessTokenExpiration": 5,
    "RefreshTokenExpiration": 1440
  }
}
```

### Token Flow
1. Login → AuthController
2. Generate JWT → TokenStoreService
3. Validate → TokenValidatorService
4. Refresh → AuthController

## External API Calls

| API | Purpose | Method | Endpoint |
|-----|---------|--------|----------|
| Opera Cloud | Room rates | GET | /opera/api/rates |
| Bank API | Balance check | GET | /bank/api/balance |
| SMS Gateway | Alerts | POST | /sms/send |

## Error Recovery

| Integration | Failure | Recovery Strategy |
|-------------|---------|-------------------|
| Opera Import | File corrupt | Request resend, use backup |
| Bank Import | Parse error | Manual review queue |
| BACS Export | Network fail | Retry queue (3 attempts) |
| Email | SMTP down | Queue for later delivery |
| SignalR | Disconnect | Auto-reconnect with backoff |

## Monitoring Points

| Integration | Metric | Alert Threshold |
|-------------|--------|-----------------|
| Opera Import | Success rate | < 95% |
| Bank Reconciliation | Match rate | < 80% |
| Email Delivery | Failure rate | > 5% |
| SignalR | Active connections | < 10 |
| File Processing | Processing time | > 5 min |