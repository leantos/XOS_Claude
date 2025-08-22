# Module Map (Project-Specific Example)

> **Note**: This is a CVS-specific module map example. For generic project structure, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md). 
> Replace the prefix (CVS) with your project's prefix when creating new projects.

## Module Naming Convention
- **CVSM**: General/Master modules (Configuration, Setup)
- **CVST**: Transaction modules (Business operations)
- **CVSR**: Report modules (Analytics, Export)

## General Modules (CVSM Series)

| Module | Description | Component Path | Controller | Service |
|--------|-------------|----------------|------------|---------|
| CVSM001 | User Management | UIPages/src/components/General/CVSM001 | UserMasterController | UserMasterService |
| CVSM005 | Site Configuration | UIPages/src/components/General/CVSM005 | SiteController | SiteService |
| CVSM006 | Site Settings | UIPages/src/components/General/CVSM006 | SiteConfigController | SiteConfigService |
| CVSM007 | Department Setup | UIPages/src/components/General/CVSM007 | DepartmentController | DepartmentService |
| CVSM008 | User Groups | UIPages/src/components/General/CVSM008 | UserGroupController | UserGroupService |
| CVSM020 | Routing Master | UIPages/src/components/General/CVSM020 | RoutingMasterController | RoutingMasterService |
| CVSM021 | Workflow Categories | UIPages/src/components/General/CVSM021 | WorkflowCategoryController | WorkflowCategoryServices |
| CVSM025 | Bank Statement Format | UIPages/src/components/General/CVSM025 | BankStatementFormatController | BankStatementFormatService |
| CVSM026 | Email Templates | UIPages/src/components/General/CVSM026 | GeneralController | EmailService |
| CVSM027 | Scheduler Config | UIPages/src/components/General/CVSM027 | SchedulerController | SchedulerService |
| CVSM030 | User Access Rights | UIPages/src/components/General/CVSM030 | UserAccessController | UserAccessService |
| CVSM035 | Group Access Rights | UIPages/src/components/General/CVSM035 | UserGroupAccessController | UserGroupAccessService |
| CVSM036 | Vendor Report Access | UIPages/src/components/General/CVSM036 | VendorReportAccessController | VendorReportAccessService |
| CVSM037 | Dynamic Forms | UIPages/src/components/General/CVSM037 | DynamicFormController | DynamicFormService |
| CVSM038 | Night Checklist Setup | UIPages/src/components/General/CVSM038 | NightChecklistController | NightChecklistService |
| CVSM039 | Dynamic Night Checklist | UIPages/src/components/General/CVSM039 | DynamicNightChecklistController | DynamicNightChecklistService |
| CVSM040 | Dashboard Config | UIPages/src/components/General/CVSM040 | DashboardController | DashboardService |
| CVSM041 | Export Templates | UIPages/src/components/General/CVSM041 | ExportController | ExportService |
| CVSM045 | Workflow Master | UIPages/src/components/General/CVSM045 | WorkFlowMasterController | WorkFlowMasterService |
| CVSM046 | Workflow Search | UIPages/src/components/General/CVSM046 | WorkflowSearchController | WorkflowSearchService |
| CVSM050 | Complementary Setup | UIPages/src/components/General/CVSM050 | ComplementaryController | ComplementaryService |
| CVSM051 | Revenue Adjustments | UIPages/src/components/General/CVSM051 | RevenueAdjustmentsController | RevenueAdjustmentsService |
| CVSM060 | Bank Data Import | UIPages/src/components/General/CVSM060 | BankDataController | BankDataService |
| CVSM061 | PDF Converter | UIPages/src/components/General/CVSM061 | GeneralController | HtmlToPDFService |

## Transaction Modules (CVST Series)

| Module | Description | Component Path | Controller | Service |
|--------|-------------|----------------|------------|---------|
| CVST005 | Bank Reconciliation | UIPages/src/components/Transaction/CVST005 | BankReconciliationController | BankReconciliationService |
| CVST010 | Refund Processing | UIPages/src/components/Transaction/CVST010 | RefundController | RefundService |
| CVST011 | Quick Refund | UIPages/src/components/Transaction/CVST011.jsx | RefundController | RefundService |
| CVST015 | BACS Refund | UIPages/src/components/Transaction/CVST015 | BacsRefundController | BacsRefundService |
| CVST016 | F&B Voids | UIPages/src/components/Transaction/CVST016 | FBVoidController | FBVoidService |
| CVST017 | F&B Void Approval | UIPages/src/components/Transaction/CVST017 | FBVoidController | FBVoidService |
| CVST018 | Void Search | UIPages/src/components/Transaction/CVST018 | FBVoidController | FBVoidService |
| CVST020 | Opera Income Audit | UIPages/src/components/Transaction/CVST020 | OperaIncomeAuditController | OperaIncomeAuditService |
| CVST025 | Night Audit Checklist | UIPages/src/components/Transaction/CVST025 | NightChecklistController | NightChecklistService |

## Report Modules (CVSR Series)

| Module | Description | Component Path | Controller | Service |
|--------|-------------|----------------|------------|---------|
| CVSR005 | Revenue Reports | UIPages/src/components/Reports/CVSR005 | ReportController | ReportService |
| CVSR010 | Audit Reports | UIPages/src/components/Reports/CVSR010 | ReportController | ReportService |
| CVSR015 | Management Flash | UIPages/src/components/Reports/CVSR015 | ReportController | ReportService |
| CVSR020 | Reconciliation Reports | UIPages/src/components/Reports/CVSR020 | ReportController | ReportService |

## Component Dependencies

```
CVST020 (Opera Income Audit)
├── CVSM045 (Workflow Master)
├── CVSM020 (Routing Master)
├── CVSM026 (Email Templates)
└── CVSR010 (Audit Reports)

CVST005 (Bank Reconciliation)
├── CVSM025 (Bank Statement Format)
├── CVSM060 (Bank Data Import)
└── CVSR020 (Reconciliation Reports)

CVST010 (Refund Processing)
├── CVST015 (BACS Refund)
├── CVSM045 (Workflow Master)
└── CVSM020 (Routing Master)
```

## Module State Management

| Module Type | State Pattern | Location |
|-------------|--------------|----------|
| CVSM | ViewModel + Local State | {module}VM.jsx |
| CVST | ViewModel + Redux-like | {module}VM.js |
| CVSR | ViewModel + Cache | {module}VM.js |

## Module Permissions

| Module | Permission Key | User Roles |
|--------|---------------|------------|
| CVSM001 | USER_MGMT | Admin |
| CVSM005 | SITE_CONFIG | Admin, Manager |
| CVST020 | OPERA_AUDIT | Manager, Supervisor, User |
| CVST010 | REFUND_PROCESS | Manager, Supervisor |
| CVSR005 | REVENUE_REPORT | All Roles |

## Module Loading

### Lazy Loading Pattern
```javascript
const CVST020 = React.lazy(() => import('./components/Transaction/CVST020'))
```

### Module Registration
```javascript
modules: {
  'CVST020': { component: CVST020, title: 'Opera Income Audit' }
}
```

## Module Communication

| From Module | To Module | Method | Data |
|-------------|-----------|--------|------|
| CVST020 | CVSM045 | API Call | WorkflowId |
| CVST005 | CVSM060 | Direct Import | BankFile |
| CVST010 | CVST015 | Navigation | RefundId |
| CVSR005 | CVST020 | Data Query | DateRange |

## Module File Structure
```
{ModuleCode}/
├── index.jsx         # Main component
├── {ModuleCode}VM.js # ViewModel
└── index.css        # Styles (optional)
```