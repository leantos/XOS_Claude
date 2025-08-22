# Testing Documentation

Comprehensive testing guide for modern application development with .NET Core and React.

## 📚 Documentation Structure

### Core Guides

1. **[Testing Best Practices](./testing-best-practices.md)**
   - Universal testing principles
   - Test organization and structure
   - Code coverage strategies
   - CI/CD integration

2. **[Backend Testing Guide](./backend-testing-guide.md)**
   - .NET Core with xUnit framework
   - C# unit testing patterns
   - Mocking and dependency injection
   - Integration testing

3. **[Frontend Testing Guide](./frontend-testing-guide.md)**
   - React with TypeScript
   - Jest and React Testing Library
   - Component and hook testing
   - End-to-end testing

### Code Examples

- **[Backend Examples](./test-examples/backend-examples.md)** - Real-world xUnit test examples
- **[Frontend Examples](./test-examples/frontend-examples.md)** - Practical React testing patterns

## 🎯 Quick Start

### Backend (.NET Core)

```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test project
dotnet test CVS.Tests
```

### Frontend (React)

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- UserService.test.ts
```

## 🧪 Testing Stack

### Backend
- **Framework**: xUnit 2.x
- **Mocking**: Moq
- **Assertions**: FluentAssertions
- **Test Data**: Bogus
- **Coverage**: Coverlet

### Frontend
- **Framework**: Jest 29+
- **Testing Library**: React Testing Library
- **Mocking**: MSW (Mock Service Worker)
- **TypeScript**: ts-jest
- **Coverage**: Built-in Jest coverage

## 📈 Coverage Guidelines

### Minimum Coverage Targets
- **Business Logic**: 80%
- **Services**: 75%
- **Controllers/Components**: 70%
- **Utilities**: 90%
- **Critical Paths**: 95%

### Excluded from Coverage
- Generated code
- Configuration files
- Third-party integrations
- UI styling code
- Database migrations

## 🔧 Test Categories

### Unit Tests
- Test individual functions/methods
- Mock all dependencies
- Fast execution (<100ms)
- Run on every commit

### Integration Tests
- Test component interactions
- Use real implementations where possible
- Medium execution time
- Run on PR creation

### End-to-End Tests
- Test complete user flows
- Use production-like environment
- Slower execution
- Run before deployment

## 📝 Test Naming Conventions

### Backend (C#)
```csharp
// Pattern: MethodName_StateUnderTest_ExpectedBehavior
[Fact]
public void CalculateDiscount_ValidCustomer_ReturnsCorrectAmount()

// Pattern: Should_ExpectedBehavior_When_StateUnderTest
[Fact]
public void Should_ReturnCorrectAmount_When_ValidCustomer()
```

### Frontend (TypeScript)
```typescript
// Pattern: describe what is being tested
describe('UserService', () => {
  // Pattern: it should do something when condition
  it('should return user data when API call succeeds', async () => {
    // test implementation
  });
});
```

## ⚡ Performance Tips

### Speed Up Test Execution
1. Run tests in parallel where possible
2. Use in-memory databases for integration tests
3. Mock heavy external dependencies
4. Avoid file I/O in unit tests
5. Reuse test fixtures when appropriate

### Optimize Test Maintenance
1. Keep tests simple and focused
2. Use test data builders
3. Extract common setup to helper methods
4. Avoid testing implementation details
5. Update tests with code changes

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      - run: dotnet test --logger "console;verbosity=detailed"

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
```

## 📊 Test Reports

### Generate Reports

**Backend HTML Report**:
```bash
dotnet test --logger html
```

**Frontend Coverage Report**:
```bash
npm test -- --coverage --coverageReporters=html
```

### View Reports
- Backend: `TestResults/index.html`
- Frontend: `coverage/lcov-report/index.html`

## 🔍 Debugging Tests

### Backend (Visual Studio/VS Code)
- Set breakpoints directly in test methods
- Use Test Explorer for individual test debugging
- Check test output for console writes

### Frontend (VS Code)
```json
// launch.json configuration
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal"
}
```

## 📚 Additional Resources

### Official Documentation
- [xUnit Documentation](https://xunit.net/)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Microsoft Testing Best Practices](https://learn.microsoft.com/en-us/dotnet/core/testing/)

### Learning Materials
- Unit Testing Principles by Vladimir Khorikov
- Test-Driven Development by Kent Beck
- Growing Object-Oriented Software Guided by Tests

## 🤝 Contributing

When adding new tests:
1. Follow existing patterns and conventions
2. Ensure tests are deterministic
3. Include both positive and negative test cases
4. Document complex test scenarios
5. Keep test data realistic

## ⚠️ Common Pitfalls to Avoid

1. **Testing implementation instead of behavior**
2. **Overuse of mocks leading to brittle tests**
3. **Ignoring test maintenance**
4. **Not testing edge cases**
5. **Coupling tests to internal structure**
6. **Using production data in tests**
7. **Not cleaning up test data**
8. **Writing tests after bugs appear**

---

*Remember: Good tests are an investment in code quality and team productivity.*