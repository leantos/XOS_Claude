# Claude Code — API Design Quick Reference

> Minimal reference for designing APIs with cloud architecture principles inside Claude Code.

## Core Principles → API Actions

- **Statelessness**: JWTs or shared store for sessions; idempotent writes.
- **Loose coupling**: API Gateway, spec-first (OpenAPI/Protobuf), hide DB schema.
- **Scalability**: Cursor pagination, bulk endpoints, async processing.
- **Resilience**: Timeouts, retries (idempotency keys), circuit breakers.
- **Observability**: Trace IDs, structured logs, per-endpoint metrics.
- **Security**: TLS, OAuth2/OIDC/mTLS, RBAC, input sanitization.
- **Automation**: CI/CD with schema validation & contract tests.
- **Cost-awareness**: Cache GETs, limit payloads.
- **Evolvability**: Versioning, deprecation policy.
- **Consistency**: Document strong vs eventual; use ETags.

## Quick Design Recipe

1. Define requirements & domain model.
2. Pick protocol (REST/gRPC/GraphQL).
3. Write contract (OpenAPI/protobuf).
4. Set NFRs: caching, rate limits, retries, pagination.
5. Design infra: API Gateway → services → DB/cache → queues/CDN.
6. Add observability & security.
7. Automate tests & deploy.

## Checklist

-

## Example: User Service

- Endpoints: list, get, create (idempotent), update (ETag), delete, auth login, webhook.
- Non-functional: JWTs, cursor pagination, ETag caching, rate limits, retries on 5xx, OpenTelemetry traces.

**Error model:**

```json
{"error": {"code": "USER_NOT_FOUND", "message": "User with id 123 not found", "requestId": "trace-xyz"}}
```

---

*Last updated: Aug 8, 2025*

