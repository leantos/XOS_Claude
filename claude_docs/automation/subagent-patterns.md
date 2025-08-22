# Subagent Usage Patterns

## Overview
This guide provides proven patterns for effectively using subagents to handle complex development tasks. Each pattern demonstrates how to structure prompts, chain operations, and ensure quality outcomes.

## Core Patterns

### 1. Feature Development Pattern
**When to use**: Building complete features from requirements to deployment

```
Pattern: Requirements → Design → Implementation → Testing → Documentation

Step 1: Use backend-analyzer to understand existing architecture
Step 2: Use database-architect for schema design
Step 3: Use backend-service-builder for API implementation
Step 4: Use frontend-architect for UI components
Step 5: Use test-automation-engineer for test suite
Step 6: Use documentation-engineer for docs
```

**Example Prompt Sequence**:
```markdown
1. "Analyze the existing user management system and identify integration points for adding role-based permissions"

2. "Design database schema for role-based access control with users, roles, and permissions"

3. "Implement REST API endpoints for role management including CRUD operations and permission checks"

4. "Create React components for role management UI with forms, lists, and permission matrix"

5. "Develop comprehensive test suite for RBAC including unit, integration, and e2e tests"

6. "Document the RBAC implementation including architecture, API reference, and usage examples"
```

### 2. Performance Optimization Pattern
**When to use**: Identifying and fixing performance issues

```
Pattern: Measure → Analyze → Optimize → Validate → Monitor

Step 1: Use performance-optimizer to profile current state
Step 2: Use backend-analyzer to understand bottlenecks
Step 3: Use database-architect for query optimization
Step 4: Use general-purpose for code optimization
Step 5: Use devops-automator for monitoring setup
```

**Key Metrics to Include**:
- Response time targets (p50, p95, p99)
- Throughput requirements (requests/second)
- Resource constraints (CPU, memory, I/O)
- User experience metrics (FCP, TTI, CLS)

### 3. Security Hardening Pattern
**When to use**: Implementing security best practices

```
Pattern: Audit → Prioritize → Remediate → Test → Document

Step 1: Use security-auditor for vulnerability assessment
Step 2: Use backend-service-builder for auth implementation
Step 3: Use api-gateway-designer for security middleware
Step 4: Use test-automation-engineer for security tests
Step 5: Use documentation-engineer for security guidelines
```

**Security Checklist**:
```markdown
□ Authentication and authorization
□ Input validation and sanitization
□ SQL injection prevention
□ XSS protection
□ CSRF tokens
□ Security headers
□ Dependency vulnerabilities
□ Secrets management
□ Encryption at rest and in transit
□ Audit logging
```

### 4. Microservices Decomposition Pattern
**When to use**: Breaking monolith into microservices

```
Pattern: Analyze → Identify Boundaries → Extract → Integrate → Deploy

Step 1: Use backend-analyzer to map dependencies
Step 2: Use microservice-architect to design services
Step 3: Use database-architect for data separation
Step 4: Use api-gateway-designer for routing
Step 5: Use devops-automator for deployment
```

**Boundary Identification Criteria**:
- Business capabilities
- Data ownership
- Team structure
- Scalability requirements
- Technology diversity needs

### 5. API-First Development Pattern
**When to use**: Building APIs before implementation

```
Pattern: Design → Mock → Implement → Test → Document

Step 1: Use documentation-engineer for OpenAPI spec
Step 2: Use general-purpose for mock server
Step 3: Use backend-service-builder for implementation
Step 4: Use test-automation-engineer for contract tests
Step 5: Use api-gateway-designer for gateway setup
```

**API Design Principles**:
```yaml
Consistency:
  - Naming conventions
  - Error formats
  - Pagination patterns
  - Filtering syntax
  
Versioning:
  - URL path versioning (/v1/)
  - Header versioning
  - Content negotiation
  
Documentation:
  - OpenAPI/Swagger spec
  - Example requests/responses
  - Error codes reference
  - Rate limiting info
```

### 6. Database Migration Pattern
**When to use**: Migrating or upgrading database

```
Pattern: Analyze → Plan → Migrate → Validate → Cutover

Step 1: Use database-architect to analyze current schema
Step 2: Use data-migration-specialist for migration plan
Step 3: Use backend-service-builder for dual-write logic
Step 4: Use test-automation-engineer for validation
Step 5: Use devops-automator for cutover automation
```

**Migration Safety Checklist**:
```markdown
□ Backup strategy defined
□ Rollback plan prepared
□ Data validation queries ready
□ Performance impact assessed
□ Downtime window scheduled
□ Monitoring alerts configured
□ Stakeholders notified
```

### 7. Frontend Modernization Pattern
**When to use**: Upgrading legacy frontend

```
Pattern: Audit → Strategize → Migrate → Optimize → Deploy

Step 1: Use frontend-architect to assess current state
Step 2: Use general-purpose for migration strategy
Step 3: Use frontend-architect for component migration
Step 4: Use performance-optimizer for bundle optimization
Step 5: Use test-automation-engineer for regression tests
```

**Modernization Strategies**:
- Strangler Fig Pattern (gradual replacement)
- Big Bang (complete rewrite)
- Hybrid approach (new features in modern stack)
- Micro-frontends

### 8. CI/CD Implementation Pattern
**When to use**: Setting up automated pipelines

```
Pattern: Define → Build → Test → Deploy → Monitor

Step 1: Use devops-automator for pipeline design
Step 2: Use test-automation-engineer for test integration
Step 3: Use security-auditor for security scanning
Step 4: Use devops-automator for deployment automation
Step 5: Use documentation-engineer for runbooks
```

**Pipeline Stages Template**:
```yaml
stages:
  - build:
      - Compile/transpile code
      - Bundle assets
      - Generate artifacts
  
  - test:
      - Unit tests
      - Integration tests
      - Code coverage check
  
  - security:
      - SAST scanning
      - Dependency check
      - Container scanning
  
  - deploy:
      - Deploy to staging
      - Smoke tests
      - Deploy to production
      - Health checks
```

### 9. Code Review Workflow Pattern
**When to use**: Systematic code quality improvement

```
Pattern: Review → Identify → Fix → Verify → Merge

Step 1: Use code-reviewer for initial assessment
Step 2: Use security-auditor for security check
Step 3: Use performance-optimizer for perf review
Step 4: Use test-automation-engineer for test coverage
Step 5: Use documentation-engineer for docs update
```

**Review Checklist Template**:
```markdown
## Code Quality
- [ ] Follows coding standards
- [ ] No code duplication
- [ ] Proper error handling
- [ ] Adequate logging

## Architecture
- [ ] SOLID principles
- [ ] Design patterns used appropriately
- [ ] Proper separation of concerns
- [ ] No circular dependencies

## Performance
- [ ] No N+1 queries
- [ ] Efficient algorithms
- [ ] Proper caching
- [ ] Resource cleanup

## Security
- [ ] Input validation
- [ ] No hardcoded secrets
- [ ] Proper authentication
- [ ] SQL injection prevention

## Testing
- [ ] Unit tests present
- [ ] Edge cases covered
- [ ] Integration tests
- [ ] Test documentation
```

### 10. Incident Response Pattern
**When to use**: Handling production issues

```
Pattern: Detect → Diagnose → Fix → Test → Deploy → Document

Step 1: Use backend-analyzer to investigate issue
Step 2: Use performance-optimizer if performance-related
Step 3: Use general-purpose for hotfix
Step 4: Use test-automation-engineer for regression test
Step 5: Use devops-automator for emergency deployment
Step 6: Use documentation-engineer for post-mortem
```

**Incident Response Template**:
```markdown
## Incident Summary
- Severity: [P1/P2/P3]
- Impact: [Users affected, functionality impaired]
- Duration: [Start time - End time]
- Root cause: [Brief description]

## Timeline
- Detection: [How was it discovered?]
- Response: [Initial actions taken]
- Resolution: [Fix implemented]
- Validation: [How was fix verified?]

## Lessons Learned
- What went well
- What could be improved
- Action items for prevention
```

## Prompt Engineering Best Practices

### 1. Context Setting
Always provide:
- Current technology stack
- Existing patterns in codebase
- Performance requirements
- Security constraints
- Team conventions

### 2. Clear Deliverables
Specify exactly what you need:
- Code files with specific names
- Documentation format
- Test coverage requirements
- Performance benchmarks
- Deployment artifacts

### 3. Success Criteria
Define measurable outcomes:
```markdown
✓ All tests pass
✓ Code coverage >80%
✓ No security vulnerabilities
✓ Response time <200ms
✓ Documentation complete
```

### 4. Iterative Refinement
Start simple, then enhance:
1. Get basic functionality working
2. Add error handling
3. Optimize performance
4. Add comprehensive tests
5. Complete documentation

### 5. Error Handling Instructions
Always specify:
```markdown
Error Handling Requirements:
- Log all errors with context
- Return user-friendly messages
- Include error codes for debugging
- Implement retry logic for transient failures
- Graceful degradation for partial failures
```

## Multi-Agent Collaboration Patterns

### Parallel Execution
When tasks are independent:
```
Parallel:
├── frontend-architect: Build UI components
├── backend-service-builder: Create APIs
└── database-architect: Design schema
```

### Sequential Pipeline
When tasks depend on each other:
```
Sequential:
1. database-architect → Schema design
2. backend-service-builder → API implementation
3. frontend-architect → UI development
4. test-automation-engineer → Test suite
```

### Hub-and-Spoke
When one agent coordinates others:
```
Hub: general-purpose (coordinator)
├── Spoke: database-architect
├── Spoke: backend-service-builder
├── Spoke: frontend-architect
└── Spoke: test-automation-engineer
```

## Quality Assurance Patterns

### Pre-Implementation Review
```
1. Requirements review with general-purpose
2. Architecture review with backend-analyzer
3. Security review with security-auditor
4. Performance impact with performance-optimizer
```

### Post-Implementation Validation
```
1. Code review with code-reviewer
2. Security scan with security-auditor
3. Performance test with performance-optimizer
4. Documentation check with documentation-engineer
```

## Common Anti-Patterns to Avoid

### 1. ❌ Vague Requirements
**Wrong**: "Make the API better"
**Right**: "Optimize API response time to <200ms, add caching, implement pagination"

### 2. ❌ Missing Context
**Wrong**: "Create a user service"
**Right**: "Create a user service using Node.js, Express, PostgreSQL, following existing repository pattern"

### 3. ❌ No Success Criteria
**Wrong**: "Add tests"
**Right**: "Add unit tests with >80% coverage, integration tests for all endpoints, and e2e tests for critical paths"

### 4. ❌ Over-broad Scope
**Wrong**: "Refactor the entire application"
**Right**: "Refactor the authentication module to use JWT, maintain backward compatibility"

### 5. ❌ Ignoring Dependencies
**Wrong**: "Update the database schema"
**Right**: "Update database schema with migration scripts, update ORM models, and modify affected APIs"

## Measuring Success

### Key Performance Indicators
- Task completion rate
- Code quality metrics
- Time to delivery
- Defect rate
- Documentation completeness

### Quality Metrics
```yaml
Code Quality:
  - Cyclomatic complexity <10
  - Duplication <3%
  - Technical debt ratio <5%
  
Performance:
  - Response time p95 <500ms
  - Error rate <1%
  - Uptime >99.9%
  
Security:
  - Zero critical vulnerabilities
  - All inputs validated
  - Authentication on all endpoints
  
Testing:
  - Code coverage >80%
  - All critical paths tested
  - No flaky tests
```

## Continuous Improvement

### Retrospective Questions
1. Did the subagent deliver expected results?
2. Was the prompt clear and complete?
3. Were there unexpected issues?
4. How can the prompt be improved?
5. Should a different subagent be used?

### Prompt Refinement Process
1. Start with template prompt
2. Customize for specific needs
3. Execute and review results
4. Identify gaps or issues
5. Refine prompt
6. Document improvements
7. Share learnings with team