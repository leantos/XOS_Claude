# CVS Business Workflows Quick Reference

## Workflow Types

| Code | Workflow | Module | Trigger | Final State |
|------|----------|--------|---------|-------------|
| WF-01 | Opera Income Audit | CVST020 | Daily/Manual | Approved/Rejected |
| WF-02 | Refund Processing | CVST010 | Guest Request | Completed/Failed |
| WF-03 | BACS Refund | CVST015 | Batch Process | Transmitted |
| WF-04 | Bank Reconciliation | CVST005 | Statement Import | Reconciled |
| WF-05 | F&B Void | CVST016 | Void Request | Approved/Rejected |
| WF-06 | Night Checklist | CVST025 | Night Audit | Completed |

## WF-01: Opera Income Audit Workflow

### Steps
1. **Data Import** → OperaIncomeAuditService.AutoFillData()
2. **Validation** → Check statistics, revenue, balances
3. **Review** → User reviews discrepancies
4. **Routing** → WorkFlowMasterService.RouteToNext()
5. **Approval** → Manager approves/rejects
6. **Finalization** → Update status, send notifications

### Decision Points
- Auto-fill success? → Continue/Manual entry
- Discrepancies found? → Route for review/Auto-approve
- Manager decision? → Approve/Reject/Return

### Services Involved
- OperaIncomeAuditService (primary)
- WorkFlowMasterService (routing)
- EmailService (notifications)
- ReportService (audit report)

## WF-02: Refund Processing Workflow

### Steps
1. **Initiation** → RefundService.CreateRefund()
2. **Validation** → Check amount, guest details
3. **Approval Level 1** → Supervisor review
4. **Approval Level 2** → Manager review (if > threshold)
5. **Processing** → Generate refund transaction
6. **Completion** → Update records, notify

### Business Rules
- Amount < 500: Single approval
- Amount >= 500: Dual approval
- Credit card: Auto-process after approval
- Bank transfer: Queue for BACS

### Services Involved
- RefundService (primary)
- BacsRefundService (BACS processing)
- WorkFlowMasterService (approvals)
- EmailService (notifications)

## WF-03: BACS Refund Workflow

### Steps
1. **Collection** → Gather approved refunds
2. **Batch Creation** → BacsRefundService.CreateBatch()
3. **Validation** → Verify bank details
4. **File Generation** → Create BACS file
5. **Transmission** → Send to bank
6. **Confirmation** → Update status

### Batch Rules
- Daily batch at 14:00
- Min batch size: 1
- Max batch size: 500
- Cut-off time: 13:30

## WF-04: Bank Reconciliation Workflow

### Steps
1. **Import** → BankDataService.ImportStatement()
2. **Auto-Match** → BankReconciliationService.AutoMatch()
3. **Manual Match** → User matches remaining
4. **Exception Handling** → Flag unmatched items
5. **Review** → Supervisor review
6. **Completion** → Close reconciliation

### Matching Rules
- Exact amount + date: Auto-match
- Amount within 1%: Suggest match
- Date within 3 days: Possible match
- No match: Manual intervention

### Services Involved
- BankReconciliationService (primary)
- BankDataService (import)
- ReportService (reconciliation report)

## WF-05: F&B Void Workflow

### Steps
1. **Request** → FBVoidService.CreateVoid()
2. **Validation** → Check transaction exists
3. **Manager Review** → Verify reason
4. **Approval/Rejection** → Decision recorded
5. **Processing** → Update POS system
6. **Audit Trail** → Log all actions

### Void Rules
- Same day: Auto-approve if < $50
- Previous day: Requires manager
- > 2 days: Requires GM approval
- Multiple voids: Flag for review

## WF-06: Night Audit Checklist

### Steps
1. **Initialization** → NightChecklistService.StartChecklist()
2. **Task Execution** → Complete each item
3. **Validation** → Verify completeness
4. **Sign-off** → Night auditor confirmation
5. **Report Generation** → Create audit report
6. **Distribution** → Email to management

### Checklist Items
- Close POS day
- Run credit card batch
- Generate reports
- Balance cash
- Review exceptions
- Update forecasts

## Routing Configuration

| Workflow | Stage | Role | Action | Next Stage |
|----------|-------|------|--------|------------|
| Opera Audit | 1 | User | Submit | 2 |
| Opera Audit | 2 | Supervisor | Review | 3 |
| Opera Audit | 3 | Manager | Approve | Complete |
| Refund | 1 | User | Create | 2 |
| Refund | 2 | Supervisor | Approve | 3/Complete |
| Refund | 3 | Manager | Approve | Complete |

## Notification Points

| Workflow | Event | Recipients | Channel |
|----------|-------|------------|---------|
| Opera Audit | Submitted | Supervisor | Email, SignalR |
| Opera Audit | Approved | User, Finance | Email |
| Refund | Created | Supervisor | SignalR |
| Refund | Approved | Guest, Accounting | Email |
| Bank Rec | Unmatched | Finance Manager | Email |
| F&B Void | Multiple | GM | Email, SMS |

## Error Handling

| Workflow | Error Type | Action | Recovery |
|----------|------------|--------|----------|
| Opera Import | File missing | Alert user | Manual upload |
| Opera Import | Invalid format | Log error | Retry with mapping |
| Refund | Invalid amount | Reject | User correction |
| Bank Import | Duplicate | Skip row | Continue import |
| BACS | Bank rejection | Queue retry | Manual process |

## Performance SLAs

| Workflow | Step | Target Time |
|----------|------|-------------|
| Opera Import | File processing | < 30 sec |
| Refund Approval | Each level | < 4 hours |
| Bank Reconciliation | Auto-match | < 2 min |
| BACS Batch | Generation | < 5 min |
| Report Generation | Standard | < 10 sec |

## Audit Requirements

| Workflow | Audit Data | Retention |
|----------|------------|-----------|
| All workflows | User, timestamp, action | 7 years |
| Financial workflows | Before/after values | 7 years |
| Approval workflows | Comments, decisions | 5 years |
| System workflows | Performance metrics | 1 year |