# CVS API Routes Reference

## API Design Principles

### Core Principles
- **Statelessness**: JWTs for sessions with refresh tokens; idempotent write operations
- **Loose coupling**: API Gateway pattern, spec-first design (OpenAPI), abstracted DB schema
- **Scalability**: Cursor pagination, bulk endpoints, async processing for heavy operations
- **Resilience**: Request timeouts, retries with idempotency keys, circuit breakers
- **Observability**: Trace IDs (X-Request-Id), structured logging (Serilog), per-endpoint metrics
- **Security**: TLS enforced, JWT Bearer auth with refresh tokens, RBAC, input sanitization
- **Automation**: CI/CD with schema validation & contract tests
- **Cost-awareness**: Response caching for GETs, payload size limits
- **Evolvability**: API versioning (/api/v1/), deprecation policy with notices
- **Consistency**: Strong consistency for financial data; eventual for reports; ETags for caching

## Base Configuration
- **Base URL**: `https://localhost:5139/api`
- **Authentication**: JWT Bearer Token
- **Content-Type**: application/json
- **CORS**: Configured in appsettings.json

## Controller Registry

| Code | Controller | Base Route | Auth Required | Service Dependency |
|------|------------|------------|---------------|-------------------|
| API-01 | AuthController | /api/auth | No (login only) | UserService |
| API-02 | OperaIncomeAuditController | /api/operaincomeaudit | Yes | OperaIncomeAuditService |
| API-03 | BankReconciliationController | /api/bankreconciliation | Yes | BankReconciliationService |
| API-04 | RefundController | /api/refund | Yes | RefundService |
| API-05 | BacsRefundController | /api/bacsrefund | Yes | BacsRefundService |
| API-06 | DashboardController | /api/dashboard | Yes | DashboardService |
| API-07 | ReportController | /api/report | Yes | ReportService |
| API-08 | UserMasterController | /api/usermaster | Yes | UserMasterService |
| API-09 | SiteController | /api/site | Yes | SiteService |
| API-10 | WorkFlowMasterController | /api/workflowmaster | Yes | WorkFlowMasterService |

## Authentication Endpoints (API-01)

| Method | Route | Purpose | Request Body |
|--------|-------|---------|--------------|
| POST | /auth/login | User login | `{username, password, siteId}` |
| POST | /auth/refresh | Refresh token | `{refreshToken}` |
| POST | /auth/logout | User logout | `{userId}` |
| GET | /auth/validate | Validate token | Headers only |

## Opera Income Audit (API-02)

| Method | Route | Purpose | Parameters |
|--------|-------|---------|------------|
| GET | /operaincomeaudit/list | Get audit list | `?pageNo&pageSize&status` |
| GET | /operaincomeaudit/{id} | Get audit details | `id: int` |
| POST | /operaincomeaudit/create | Create audit | Body: OperaIncomeAudit |
| PUT | /operaincomeaudit/update | Update audit | Body: OperaIncomeAudit |
| POST | /operaincomeaudit/autofill | Auto-fill data | `{clientId, siteId}` |
| POST | /operaincomeaudit/submit | Submit for approval | `{workflowId, comments}` |
| GET | /operaincomeaudit/report/{id} | Generate report | `id: int` |

## Bank Reconciliation (API-03)

| Method | Route | Purpose | Parameters |
|--------|-------|---------|------------|
| GET | /bankreconciliation/list | List reconciliations | `?startDate&endDate` |
| POST | /bankreconciliation/import | Import statement | FormData: file |
| POST | /bankreconciliation/match | Match transactions | Body: MatchRequest |
| GET | /bankreconciliation/unmatched | Get unmatched | `?reconciliationId` |
| POST | /bankreconciliation/complete | Complete reconciliation | `{reconciliationId}` |

## Refund Management (API-04)

| Method | Route | Purpose | Parameters |
|--------|-------|---------|------------|
| GET | /refund/list | List refunds | `?status&dateFrom&dateTo` |
| GET | /refund/{id} | Get refund details | `id: int` |
| POST | /refund/create | Create refund | Body: RefundRequest |
| PUT | /refund/update | Update refund | Body: RefundRequest |
| POST | /refund/approve | Approve refund | `{refundId, comments}` |
| POST | /refund/reject | Reject refund | `{refundId, reason}` |

## Dashboard (API-06)

| Method | Route | Purpose | Parameters |
|--------|-------|---------|------------|
| GET | /dashboard/metrics | Get metrics | `?period&siteId` |
| GET | /dashboard/pending | Pending items | `?userId` |
| GET | /dashboard/charts | Chart data | `?chartType&period` |
| GET | /dashboard/alerts | Active alerts | `?severity` |

## Reports (API-07)

| Method | Route | Purpose | Parameters |
|--------|-------|---------|------------|
| GET | /report/list | Available reports | `?category` |
| POST | /report/generate | Generate report | Body: ReportRequest |
| GET | /report/download/{id} | Download report | `id: guid` |
| POST | /report/schedule | Schedule report | Body: ScheduleRequest |
| GET | /report/history | Report history | `?userId&dateFrom` |

## Workflow Management (API-10)

| Method | Route | Purpose | Parameters |
|--------|-------|---------|------------|
| GET | /workflowmaster/pending | Pending approvals | `?userId` |
| POST | /workflowmaster/route | Route workflow | Body: RoutingRequest |
| GET | /workflowmaster/history/{id} | Workflow history | `id: int` |
| POST | /workflowmaster/reassign | Reassign workflow | `{workflowId, newUserId}` |

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {...}
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pageNumber": 1,
    "pageSize": 20,
    "totalRecords": 100,
    "totalPages": 5
  }
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Business rule violation |
| 500 | Server Error | Unhandled exception |

## Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes* | Bearer {token} |
| Content-Type | Yes | application/json |
| X-Client-Id | Yes | Client identifier |
| X-Site-Id | Yes | Site identifier |
| X-Request-Id | No | Request tracking |

*Not required for /auth/login

## Query Parameters Convention

| Parameter | Type | Description |
|-----------|------|-------------|
| pageNo | int | Page number (1-based) |
| pageSize | int | Items per page (max 100) |
| sortBy | string | Field to sort by |
| sortOrder | string | asc/desc |
| search | string | Search term |
| status | string | Filter by status |
| dateFrom | date | Start date (yyyy-MM-dd) |
| dateTo | date | End date (yyyy-MM-dd) |

## File Upload Endpoints

| Controller | Route | File Type | Max Size |
|------------|-------|-----------|----------|
| BankReconciliation | /import | CSV, PDF | 10MB |
| OperaIncomeAudit | /upload | XLS, XLSX | 5MB |
| Report | /template/upload | HTML | 2MB |

## WebSocket/SignalR Hubs

| Hub | Route | Purpose |
|-----|-------|---------|
| NotificationsHub | /hubs/notifications | Real-time notifications |
| DashboardHub | /hubs/dashboard | Dashboard updates |

## Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| File Upload | 10 requests | 5 minutes |
| Report Generation | 20 requests | 1 hour |
| General API | 100 requests | 1 minute |

## API Design Best Practices

### Request/Response Patterns
- **Idempotency**: All PUT/DELETE operations are idempotent
- **Bulk Operations**: Support batch processing for efficiency
- **Async Processing**: Long-running operations return 202 Accepted with status URL
- **Partial Updates**: PATCH support for resource modifications

### Error Handling Model
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {"field": "amount", "message": "Must be greater than 0"}
    ],
    "requestId": "trace-xyz-123",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### API Versioning Strategy
- **URL Versioning**: `/api/v1/`, `/api/v2/`
- **Deprecation Notice**: 6-month warning period
- **Backward Compatibility**: Maintain for minimum 12 months
- **Version Headers**: `X-API-Version` for version info

### Performance Optimization
- **ETag Support**: Conditional requests for caching
- **Compression**: gzip/deflate for responses > 1KB
- **Field Filtering**: `?fields=id,name,status` for partial responses
- **Pagination**: Cursor-based for large datasets

### Security Measures
- **API Key Management**: Service-to-service auth via X-API-Key
- **Request Signing**: HMAC-SHA256 for sensitive operations
- **Input Validation**: Strict schema validation on all inputs
- **Output Sanitization**: XSS prevention in all responses