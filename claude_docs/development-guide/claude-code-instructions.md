# Claude Code Instructions Template

This file provides a template for creating project-specific instructions that help Claude Code understand and work with your codebase effectively.

## Project Overview Template

```markdown
# Project: [Your Project Name]

## Overview
[Brief description of what the project does]

## Tech Stack
- Backend: [e.g., .NET 8, Node.js]
- Frontend: [e.g., React, Vue, Angular]
- Database: [e.g., PostgreSQL, MongoDB]
- Other: [e.g., Redis, RabbitMQ]

## Key Business Rules
1. [Important business logic or constraints]
2. [Domain-specific requirements]
3. [Compliance or regulatory requirements]

## Code Conventions
- Naming: [Describe naming patterns used]
- Structure: [Describe file organization]
- Patterns: [List design patterns used]

## Common Tasks
- To run the project: [Commands]
- To run tests: [Commands]
- To build: [Commands]
- To deploy: [Commands]

## Important Files
- Configuration: [List key config files]
- Entry points: [Main files]
- Critical logic: [Important business logic files]

## Known Issues
- [List any known issues or limitations]
- [Workarounds if applicable]

## Special Instructions
- [Any project-specific guidelines]
- [Performance considerations]
- [Security requirements]
```

## Example Claude Code Instructions

```markdown
# CVS Project Instructions

## Overview
This is a PCI-compliant Card Verification System for payment processing.

## Critical Requirements
- ALL card data must be encrypted
- Follow PCI DSS standards
- Audit all data access
- Never log sensitive data

## Architecture
- Microservices architecture
- Repository pattern for data access
- Service layer for business logic
- DTOs for data transfer

## When Making Changes
1. Always validate input data
2. Use async/await for all I/O operations
3. Log errors but never log card numbers
4. Update tests for any logic changes
5. Follow existing patterns in the codebase

## Testing Requirements
- Unit test all business logic
- Integration test API endpoints
- Never use real card numbers in tests
- Use the provided test data factories

## Security Checklist
Before committing code, ensure:
- [ ] No sensitive data in logs
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS prevention measures
- [ ] Proper authentication checks

## Database Changes
- Always create migrations
- Never modify existing migrations
- Test rollback scenarios
- Update seed data if needed

## API Development
- Follow RESTful conventions
- Return appropriate status codes
- Include error details in development only
- Validate all input parameters
- Use DTOs, never expose entities directly

## Frontend Guidelines
- Use TypeScript strictly
- Implement proper error boundaries
- Sanitize all user input
- Follow the existing component patterns
- Use the custom hooks for API calls

## Performance Considerations
- Implement pagination for lists
- Use caching where appropriate
- Optimize database queries
- Lazy load frontend components
- Monitor API response times
```

## Integration with Claude Code

### 1. Project-Specific Instructions File
Create a `.claude/instructions.md` file in your project root:

```markdown
# Instructions for Claude Code

## Project Context
[Provide context about the project]

## Preferred Approaches
- Error handling: [Your preference]
- Testing: [Your testing approach]
- Documentation: [Documentation style]

## Do's and Don'ts

### Do's
- ✅ Follow existing patterns
- ✅ Write tests for new features
- ✅ Update documentation
- ✅ Use meaningful variable names
- ✅ Handle errors gracefully

### Don'ts
- ❌ Don't skip input validation
- ❌ Don't ignore error handling
- ❌ Don't hardcode values
- ❌ Don't bypass security checks
- ❌ Don't commit sensitive data

## Code Review Checklist
When reviewing or writing code, check:
1. Does it follow project conventions?
2. Are errors handled properly?
3. Is it testable?
4. Is it secure?
5. Is it performant?
```

### 2. Component-Specific Instructions
For complex components or modules, add local instructions:

```typescript
/**
 * PaymentProcessor Component
 * 
 * IMPORTANT: This component handles sensitive payment data.
 * 
 * Rules:
 * 1. Never store card numbers in state
 * 2. Always use the encrypted transport layer
 * 3. Implement rate limiting for payment attempts
 * 4. Log attempts but never log card details
 * 5. Clear sensitive data on component unmount
 * 
 * Testing:
 * - Use mock payment gateway in tests
 * - Test error scenarios thoroughly
 * - Verify cleanup on unmount
 */
```

### 3. API Endpoint Instructions
```csharp
/// <summary>
/// Payment API Controller
/// </summary>
/// <remarks>
/// SECURITY: All endpoints require authentication
/// COMPLIANCE: PCI DSS Level 1 required
/// RATE LIMITING: 10 requests per minute per user
/// LOGGING: Log all attempts, never log card data
/// </remarks>
[ApiController]
[Authorize]
[RateLimit(10, PerMinute)]
public class PaymentController : ControllerBase
{
    // Implementation
}
```

## Best Practices for AI Collaboration

### 1. Clear Context
```markdown
## Current Sprint Goals
- Implement user authentication
- Add password reset functionality
- Improve error messages
- Fix bug #123: Login timeout issue
```

### 2. Explicit Constraints
```markdown
## Constraints
- Must support IE 11 (legacy requirement)
- Database queries must complete in <100ms
- API responses must be under 1MB
- Must work offline for critical features
```

### 3. Testing Requirements
```markdown
## Test Coverage Requirements
- Minimum 80% code coverage
- All API endpoints must have integration tests
- Critical paths must have E2E tests
- Security features must have specific security tests
```

### 4. Documentation Standards
```markdown
## Documentation Requirements
- All public APIs must have XML comments
- Complex algorithms need explanation comments
- README must include setup instructions
- Architecture decisions must be documented
```

## Tips for Effective Claude Code Usage

1. **Be Specific**: Instead of "fix the bug", say "fix the null reference exception in UserService.GetUser method when user is not found"

2. **Provide Context**: Include relevant error messages, logs, or screenshots

3. **State Constraints**: Mention any limitations or requirements upfront

4. **Reference Examples**: Point to existing code that follows the desired pattern

5. **Clarify Expectations**: Be clear about what you want as output

### Example Prompts

#### Good Prompt
```
"Add input validation to the CreateUser endpoint in UserController. 
Follow the existing validation pattern used in UpdateUser. 
Validate email format, password strength (min 8 chars, 1 uppercase, 1 number), 
and ensure username is unique. 
Return appropriate error messages for each validation failure."
```

#### Less Effective Prompt
```
"Add validation to user creation"
```

## Maintenance Guidelines

### Keeping Instructions Updated
1. Review instructions quarterly
2. Update when major architecture changes occur
3. Add new patterns as they're established
4. Remove outdated information
5. Get team consensus on changes

### Version Control for Instructions
```markdown
# Instructions Version History

## v2.0.0 - 2024-01-15
- Added microservices guidelines
- Updated security requirements
- Removed deprecated jQuery patterns

## v1.5.0 - 2023-10-01
- Added TypeScript requirements
- Updated testing standards
- Added performance benchmarks

## v1.0.0 - 2023-01-01
- Initial instructions
```

## Module Development Workflow

### TDD Module Development Standard
**For all new module development, Claude Code must follow the standardized TDD workflow.**

**Command:** Always reference the TDD workflow for module development:
```
"Follow @claude_docs/development-guide/TDD-MODULE-WORKFLOW.md to implement [ModuleName] module"
```

**Key Requirements:**
- 8-step TDD cycle (Think → Test Plan → Skeleton → Unit Tests → Implement → Verify → Refine → Document)
- 2-round maximum approach
- 80% minimum test pass rate in first round
- 100% target or documented blockers in second round
- Complete documentation package generated

**Troubleshooting Integration:**
When issues are encountered, update the appropriate troubleshooting guide:
- Backend issues: `@claude_docs/troubleshooting/backend-issues.md`
- Frontend issues: `@claude_docs/troubleshooting/frontend-issues.md` 
- API issues: `@claude_docs/troubleshooting/api-issues.md`
- Database issues: `@claude_docs/troubleshooting/database-issues.md`
- Testing issues: `@claude_docs/troubleshooting/testing-issues.md`

## Summary

Well-crafted instructions help Claude Code:
- Understand your project's unique requirements
- Follow your team's conventions
- Avoid common pitfalls
- Produce consistent, high-quality code
- Work more efficiently with your codebase
- **Follow standardized TDD workflow for all modules**

Remember to keep instructions:
- **Concise**: Focus on what's important
- **Current**: Update as project evolves
- **Clear**: Avoid ambiguity
- **Actionable**: Provide specific guidance
- **Accessible**: Easy to find and reference