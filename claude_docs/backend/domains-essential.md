# CVS Domain Models Essential Reference

## Database Architecture Overview

### Multi-Tenancy Structure
The system implements a multi-tenant architecture with:
- **Client Level** (`clnt_id`): Top-level tenant isolation
- **Site Level** (`site_id`): Sub-tenant isolation within each client
- Most tables use composite primary keys with `(clnt_id, site_id, ...)` pattern

### Database Technology
- **Primary Database**: PostgreSQL (metadata, configurations, transactions)
- **Secondary Database**: SQLite (local operations, offline support)
- **ORM**: Custom XOS Data Framework with ADO.NET
- **Connection Management**: Multi-tenant with client-based routing

## Core Domain Models

| Code | Model | Purpose | Location |
|------|-------|---------|----------|
| DOM-01 | OperaIncomeAudit | Opera PMS audit data | Domain/OperaIncomeAudit.cs |
| DOM-02 | BankReconciliation | Bank reconciliation records | Domain/BankReconciliation.cs |
| DOM-03 | Refund | Refund transaction data | Domain/Refund.cs |
| DOM-04 | WorkFlow | Workflow instance data | Domain/WorkFlow.cs |
| DOM-05 | User | User account information | Domain/User.cs |
| DOM-06 | Site | Site/property configuration | Domain/Site.cs |
| DOM-07 | Dashboard | Dashboard metrics | Domain/Dashboard.cs |
| DOM-08 | Report | Report definitions | Domain/Report.cs |
| DOM-09 | BacsRefund | BACS refund specifics | Domain/BacsRefund.cs |
| DOM-10 | FBVoids | F&B void transactions | Domain/FBVoids.cs |

## Key Properties by Model

### DOM-01: OperaIncomeAudit
```
WorkFlowSrl: int (PK)
ReportInfo: ReportInfo (complex)
RoutingStatus: string
History: List<RoutingHistory>
Attachments: List<WorkflowDocument>
EditableControls: List<ControlAccess>
```

### DOM-02: BankReconciliation
```
ReconciliationId: int (PK)
BankAccountId: int (FK)
StatementDate: DateTime
MatchedTransactions: List<Transaction>
UnmatchedItems: List<Transaction>
Status: ReconciliationStatus (enum)
```

### DOM-03: Refund
```
RefundId: int (PK)
WorkflowId: int (FK)
Amount: decimal
RefundType: RefundType (enum)
PaymentMethod: string
Status: RefundStatus (enum)
```

### DOM-04: WorkFlow
```
WorkflowId: int (PK)
WorkflowType: WorkflowType (enum)
CurrentStage: int
RoutingHistory: List<RoutingHistory>
Status: WorkflowStatus (enum)
CreatedBy: int (FK->User)
```

## Nested Classes Structure

### OperaIncomeAudit.ReportInfo
```
Statistics: StatisticInfo
Revenue: RevenueInfo
ZeroRate: ZeroRateInfo
Allowances: AllowancesInfo
CashBalance: CashBalanceInfo
CardRefund: CardRefundInfo
OpenFolios: List<OpenFolioDetail>
```

### OperaIncomeAudit.StatisticInfo
```
RoomsSold: int
RoomRevenue: decimal
OccupancyRate: decimal
ADR: decimal
RevPAR: decimal
```

## Enumerations

| Enum | Values | Usage |
|------|--------|-------|
| WorkflowType | IncomeAudit, Refund, BankRec, FBVoid | Workflow categorization |
| WorkflowStatus | Draft, InProgress, Approved, Rejected | Workflow state |
| RefundType | Guest, Company, CreditCard, Bank | Refund classification |
| RefundStatus | Pending, Processing, Completed, Failed | Refund state |
| ReconciliationStatus | Open, InProgress, Completed, Exception | Bank rec state |
| UserRole | Admin, Manager, Supervisor, User | Access control |
| SiteStatus | Active, Inactive, Suspended | Site availability |

## Domain Relationships

```
WorkFlow (1) ──── (*) RoutingHistory
WorkFlow (1) ──── (*) WorkflowDocument
WorkFlow (1) ──── (1) OperaIncomeAudit
WorkFlow (1) ──── (1) Refund

User (1) ──── (*) UserAccess
User (*) ──── (*) UserGroup
UserGroup (1) ──── (*) UserGroupAccess

Site (1) ──── (*) SiteConfig
Site (1) ──── (*) Department
Site (1) ──── (*) WorkFlow
```

## Base Classes

### BaseObject<T>
```
ID: T
Name: string
Description: string
IsActive: bool
```

### ServiceBase
```
ClientID: short
SiteID: short
UserID: int
SessionID: string
```

## Validation Rules

| Model | Field | Rule |
|-------|-------|------|
| OperaIncomeAudit | WorkFlowSrl | Required, > 0 |
| BankReconciliation | StatementDate | Required, <= Today |
| Refund | Amount | Required, > 0, <= MaxRefund |
| User | Email | Required, Valid Email Format |
| WorkFlow | WorkflowType | Required, Valid Enum |

## Data Transfer Objects

### PageInfo
```
PageNumber: int
PageSize: int
TotalRecords: int
SortBy: string
SortOrder: string
```

### GridFilterSort
```
Filters: List<FilterInfo>
Sorting: List<SortInfo>
PageInfo: PageInfo
```

### InputInfo
```
ClientID: short
SiteID: short
UserID: int
Data: object
```

## Complex Types

### EmailDataInfo
```
To: List<string>
CC: List<string>
Subject: string
Body: string
Attachments: List<FileInfo>
IsHTML: bool
```

### DataFileInfo
```
FileName: string
FilePath: string
FileType: string
FileSize: long
Content: byte[]
```

### HtmlToPDFInfo
```
HtmlContent: string
FileName: string
PageSize: string
Orientation: string
```

## Domain Constants

| Constant | Value | Usage |
|----------|-------|-------|
| MAX_REFUND_AMOUNT | 10000 | Refund limit |
| MIN_PASSWORD_LENGTH | 8 | User password |
| SESSION_TIMEOUT | 30 | Minutes |
| MAX_FILE_SIZE | 10485760 | 10MB |
| WORKFLOW_EXPIRY_DAYS | 30 | Auto-close |

## Audit Fields (Common)
```
CreatedDate: DateTime
CreatedBy: int
ModifiedDate: DateTime
ModifiedBy: int
IsDeleted: bool
DeletedDate: DateTime?
```

## JSON Serialization Attributes

| Model | Property | JSON Name |
|-------|----------|-----------|
| OperaIncomeAudit.Statistics | Statistics | STST |
| OperaIncomeAudit.Revenue | Revenue | REV |
| OperaIncomeAudit.ZeroRate | ZeroRate | ZR |
| OperaIncomeAudit.Allowances | Allowances | ALW |

## Performance Indexes

| Model | Indexed Fields |
|-------|---------------|
| WorkFlow | WorkflowId, Status, CreatedDate |
| User | Email, UserName |
| OperaIncomeAudit | WorkFlowSrl, RoutingStatus |
| BankReconciliation | StatementDate, Status |

## Database Schema Tables

### Core Tables Structure

#### Client & Site Management
```sql
-- Client Master
cvs_clnt_mast (
  clnt_id SMALLINT PRIMARY KEY,
  clnt_nam VARCHAR(100),
  clnt_ref VARCHAR(20),
  dflt_pwd VARCHAR(100),
  rcrd_stat SMALLINT
)

-- Site Master
cvs_site_mast (
  clnt_id SMALLINT,
  site_id SMALLINT,
  site_nam VARCHAR(100),
  vndr_id SMALLINT,
  crncy_cd VARCHAR(3),
  tm_zon_txt VARCHAR(50),
  PRIMARY KEY (clnt_id, site_id)
)
```

#### User Management
```sql
-- User Master
cvs_usr_mast (
  clnt_id SMALLINT,
  usr_cd INTEGER,
  login_id VARCHAR(50),
  passwd VARCHAR(100),
  email_id VARCHAR(100),
  has_mstr_accs BOOLEAN,
  PRIMARY KEY (clnt_id, usr_cd)
)

-- User Site Details
cvs_usr_site_dtls (
  clnt_id SMALLINT,
  site_id SMALLINT,
  usr_cd INTEGER,
  dflt_usr_grp_cd SMALLINT,
  dptmnt_cd SMALLINT,
  usr_grp_dtl JSON[],
  PRIMARY KEY (clnt_id, site_id, usr_cd)
)
```

#### Document & Workflow Management
```sql
-- Document Master
cvs_dcmnt_mast (
  clnt_id SMALLINT,
  site_id SMALLINT,
  dcmnt_cd SMALLINT,
  dcmnt_typ_cd SMALLINT,
  dcmnt_ctgry_cd SMALLINT,
  frq_typ VARCHAR(20),
  rtng_rqrd BOOLEAN,
  PRIMARY KEY (clnt_id, site_id, dcmnt_cd)
)

-- Document Data Header
cvs_dcmnt_data_hdr (
  clnt_id SMALLINT,
  site_id SMALLINT,
  dcmnt_srl INTEGER,
  dcmnt_data JSON,
  routng_stat VARCHAR(20),
  dcsn_dt TIMESTAMP,
  is_acknldg BOOLEAN,
  PRIMARY KEY (clnt_id, site_id, dcmnt_srl)
)
```

#### Banking & Financial
```sql
-- Banking Data
cvs_bnkng_data (
  clnt_id SMALLINT,
  site_id SMALLINT,
  bnkng_dt DATE,
  bnkng_data JSON,
  routng_stat VARCHAR(20),
  PRIMARY KEY (clnt_id, site_id, bnkng_dt)
)

-- Bank Statement Data
cvs_bnkng_stmnt_data (
  clnt_id SMALLINT,
  site_id SMALLINT,
  stmnt_srl INTEGER,
  rcvd_dt DATE,
  rcvd_amt DECIMAL(15,2),
  rmrks TEXT,
  PRIMARY KEY (clnt_id, site_id, stmnt_srl)
)
```

### Database Design Patterns

#### 1. Multi-Tenancy
- Consistent use of `clnt_id` and `site_id` across all tables
- Hierarchical data isolation at client and site levels
- Composite primary keys for tenant separation

#### 2. JSON Storage
- Flexible data storage using JSON/JSONB columns
- Configuration data stored as JSON for extensibility
- Document data and banking data as JSON for schema flexibility

#### 3. Soft Deletes
- `rcrd_stat` field for record status (1=active, 0=inactive)
- Preserves data integrity and audit trail
- Allows data recovery when needed

#### 4. Audit Trail
- Comprehensive audit tables (cvs_mast_adt, cvs_dcmnt_data_adt)
- MAC address and user tracking for all changes
- Transaction mode tracking (Insert/Update/Delete)

### Database Functions

#### cvs_fn_has_usrgrp
- **Purpose**: Check if a JSON array contains a specific user group
- **Parameters**: `data json[]`, `id smallint`
- **Returns**: Boolean
- **Usage**: User group membership validation

#### jsonany (overloaded)
- **Purpose**: Check if a JSONB array contains specific values
- **Variants**:
  1. Check by ID
  2. Check by named field and ID
- **Usage**: Flexible JSON querying