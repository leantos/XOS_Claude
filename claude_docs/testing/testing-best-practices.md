# Testing Best Practices

Universal principles and practices for writing effective, maintainable tests across different frameworks and technologies.

## Table of Contents
- [TDD Module Development Requirements](#tdd-module-development-requirements)
- [Core Testing Principles](#core-testing-principles)
- [Test Design Patterns](#test-design-patterns)
- [Testing Pyramid](#testing-pyramid)
- [Test Organization](#test-organization)
- [Naming Conventions](#naming-conventions)
- [Test Data Management](#test-data-management)
- [Performance Considerations](#performance-considerations)
- [Continuous Integration](#continuous-integration)

## TDD Module Development Requirements

### Standardized TDD Cycle Requirements
**All module development in this project must follow the TDD workflow defined in `@claude_docs/development-guide/TDD-MODULE-WORKFLOW.md`.**

#### Test-First Development Rules
1. **Write ALL tests before implementation** - Define expected behavior completely before writing any production code
2. **Two-round maximum approach** - Either achieve 100% test pass rate or clearly document what needs human help
3. **80% minimum pass rate in first round** - First implementation must pass at least 80% of written tests
4. **100% target in second round** - Final goal is 100% passing tests or documented blockers for human developer

#### Test Coverage Requirements
- **Minimum 30+ test scenarios** for a typical backend module
- **Cover all happy paths** - Normal operation scenarios
- **Cover all edge cases** - Null inputs, empty data, boundary values
- **Cover all error conditions** - Invalid inputs, network failures, security violations
- **Include integration tests** - Database operations, API calls, external service interactions

#### Test Quality Standards
```csharp
// Example comprehensive test suite structure
public class UserLoginServiceTests
{
    #region Happy Path Tests (8-12 tests)
    [Fact] public void Login_ValidCredentials_ReturnsToken() { }
    [Fact] public void Login_ValidRefreshToken_ReturnsNewToken() { }
    [Fact] public void Logout_ValidSession_ClearsSession() { }
    
    #endregion

    #region Edge Cases (10-15 tests)
    [Fact] public void Login_EmptyUsername_ThrowsValidationException() { }
    [Fact] public void Login_NullPassword_ThrowsValidationException() { }
    [Fact] public void Login_WhitespaceOnlyUsername_ThrowsValidationException() { }
    
    #endregion

    #region Error Scenarios (8-10 tests)
    [Fact] public void Login_InvalidCredentials_ThrowsUnauthorizedException() { }
    [Fact] public void Login_LockedAccount_ThrowsAccountLockedException() { }
    [Fact] public void Login_DatabaseUnavailable_ThrowsServiceException() { }
    
    #endregion

    #region Security Tests (5-8 tests)
    [Fact] public void Login_ExceedsRateLimit_ThrowsRateLimitException() { }
    [Fact] public void Login_SqlInjectionAttempt_SafelyHandled() { }
    [Fact] public void TokenGeneration_ContainsNoSensitiveData() { }
    
    #endregion
}
```

#### Pass Rate Progression
| Round | Test Status | Expected Outcome | Action Required |
|-------|-------------|------------------|-----------------|
| 1 | 40/50 pass (80%) | ✅ Acceptable minimum | Continue to Round 2 |
| 1 | 35/50 pass (70%) | ❌ Below threshold | Fix critical issues, try again |
| 2 | 50/50 pass (100%) | ✅ Perfect completion | Generate documentation |
| 2 | 48/50 pass (96%) | ❌ Document blockers | List specific issues for human help |

#### Documentation Requirements
Every module must generate complete documentation package:
- **README.md** - Module overview, setup instructions, usage examples
- **API.md** - All endpoints, request/response formats, error codes  
- **TESTS.md** - Test coverage summary, important test scenarios
- **TROUBLESHOOTING.md** - Issues encountered during development, solutions applied

#### Integration with Troubleshooting Guides
When issues are encountered during TDD development, update appropriate guides:
- **Backend logic issues** → `@claude_docs/troubleshooting/backend-issues.md`
- **XOS component issues** → `@claude_docs/troubleshooting/frontend-issues.md`
- **API endpoint issues** → `@claude_docs/troubleshooting/api-issues.md`
- **Database problems** → `@claude_docs/troubleshooting/database-issues.md`
- **Testing framework issues** → `@claude_docs/troubleshooting/testing-issues.md`

### Command Template for TDD Development
```
"Follow @claude_docs/development-guide/TDD-MODULE-WORKFLOW.md to implement [ModuleName] module. Target: 80% minimum test pass rate in round 1, 100% in round 2 or document blockers for human help."
```

## Core Testing Principles

### 1. The Three A's Pattern

Every test should follow the **Arrange-Act-Assert** (AAA) pattern:

```typescript
// ✅ Good Example
test('calculateDiscount should return 10% for standard customers', () => {
  // Arrange - Setup test data and dependencies
  const customer = new Customer({ type: 'standard' });
  const order = new Order({ total: 100 });
  const calculator = new DiscountCalculator();

  // Act - Execute the operation being tested
  const discount = calculator.calculate(customer, order);

  // Assert - Verify the result
  expect(discount).toBe(10);
});
```

### 2. Test One Thing at a Time

Each test should verify a single behavior or outcome:

```typescript
// ❌ Bad - Testing multiple behaviors
test('user management operations', () => {
  const user = createUser();
  expect(user).toBeDefined();
  
  const updated = updateUser(user.id, { name: 'New Name' });
  expect(updated.name).toBe('New Name');
  
  deleteUser(user.id);
  expect(getUser(user.id)).toBeNull();
});

// ✅ Good - Separate tests for each behavior
test('should create user with valid data', () => {
  const user = createUser();
  expect(user).toBeDefined();
});

test('should update user name when provided', () => {
  const user = createUser();
  const updated = updateUser(user.id, { name: 'New Name' });
  expect(updated.name).toBe('New Name');
});

test('should delete user and make it unavailable', () => {
  const user = createUser();
  deleteUser(user.id);
  expect(getUser(user.id)).toBeNull();
});
```

### 3. Test Behavior, Not Implementation

Focus on what the code does, not how it does it:

```typescript
// ❌ Bad - Testing implementation details
test('should call internal validation method', () => {
  const service = new UserService();
  const spy = jest.spyOn(service, 'validateEmail' as any);
  
  service.createUser({ email: 'test@example.com' });
  
  expect(spy).toHaveBeenCalled(); // Testing internal method
});

// ✅ Good - Testing behavior
test('should create user with valid email', () => {
  const service = new UserService();
  const userData = { email: 'test@example.com', name: 'Test User' };
  
  const user = service.createUser(userData);
  
  expect(user.email).toBe('test@example.com'); // Testing outcome
});

test('should reject user creation with invalid email', () => {
  const service = new UserService();
  const userData = { email: 'invalid-email', name: 'Test User' };
  
  expect(() => service.createUser(userData)).toThrow('Invalid email format');
});
```

### 4. Make Tests Independent

Tests should not depend on the execution order or state from other tests:

```typescript
// ❌ Bad - Tests depend on each other
describe('UserService', () => {
  let createdUserId: number;

  test('should create user', () => {
    const user = userService.create({ name: 'Test' });
    createdUserId = user.id; // Setting shared state
    expect(user).toBeDefined();
  });

  test('should find created user', () => {
    const user = userService.findById(createdUserId); // Depending on previous test
    expect(user.name).toBe('Test');
  });
});

// ✅ Good - Independent tests
describe('UserService', () => {
  test('should create user', () => {
    const user = userService.create({ name: 'Test' });
    expect(user).toBeDefined();
  });

  test('should find existing user', () => {
    const createdUser = userService.create({ name: 'Test' });
    const foundUser = userService.findById(createdUser.id);
    expect(foundUser.name).toBe('Test');
  });
});
```

### 5. Write Deterministic Tests

Tests should produce the same result every time they run:

```typescript
// ❌ Bad - Non-deterministic due to current date
test('should calculate age correctly', () => {
  const user = new User({ birthDate: '1990-01-01' });
  expect(user.getAge()).toBe(34); // Will fail in future years
});

// ✅ Good - Deterministic with fixed date
test('should calculate age correctly', () => {
  const mockDate = new Date('2024-01-01');
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
  
  const user = new User({ birthDate: '1990-01-01' });
  expect(user.getAge()).toBe(34);
  
  jest.useRealTimers();
});

// ✅ Even better - Test with specific date
test('should calculate age correctly for given date', () => {
  const user = new User({ birthDate: '1990-01-01' });
  const currentDate = new Date('2024-01-01');
  expect(user.getAgeAt(currentDate)).toBe(34);
});
```

## Test Design Patterns

### 1. Builder Pattern for Test Data

Create reusable test data builders:

```typescript
class UserBuilder {
  private user: Partial<User> = {};

  withId(id: number): UserBuilder {
    this.user.id = id;
    return this;
  }

  withName(name: string): UserBuilder {
    this.user.name = name;
    return this;
  }

  withEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }

  asAdmin(): UserBuilder {
    this.user.role = 'admin';
    this.user.permissions = ['read', 'write', 'delete'];
    return this;
  }

  withDefaults(): UserBuilder {
    this.user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      isActive: true,
    };
    return this;
  }

  build(): User {
    return { ...this.user } as User;
  }
}

// Usage
const adminUser = new UserBuilder()
  .withDefaults()
  .asAdmin()
  .withEmail('admin@example.com')
  .build();
```

### 2. Object Mother Pattern

Pre-defined test objects for common scenarios:

```typescript
export class UserMother {
  static standardUser(): User {
    return {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      isActive: true,
    };
  }

  static adminUser(): User {
    return {
      id: 2,
      name: 'Jane Admin',
      email: 'jane@example.com',
      role: 'admin',
      isActive: true,
    };
  }

  static inactiveUser(): User {
    return {
      ...this.standardUser(),
      id: 3,
      isActive: false,
    };
  }

  static userWithoutEmail(): User {
    return {
      ...this.standardUser(),
      email: '',
    };
  }
}

// Usage
test('should handle inactive users', () => {
  const user = UserMother.inactiveUser();
  expect(userService.canLogin(user)).toBe(false);
});
```

### 3. Test Double Patterns

Use appropriate test doubles for different scenarios:

```typescript
// Stub - Provides predefined responses
const userRepositoryStub = {
  findById: (id: number) => Promise.resolve({ id, name: 'Test User' }),
  save: (user: User) => Promise.resolve(user),
};

// Mock - Verifies interactions
const mockEmailService = jest.fn();
mockEmailService.sendWelcomeEmail = jest.fn();

// Spy - Wraps real object to observe behavior
const emailService = new EmailService();
const sendSpy = jest.spyOn(emailService, 'sendWelcomeEmail');

// Fake - Working implementation with shortcuts
class FakeUserRepository implements IUserRepository {
  private users: User[] = [];

  async save(user: User): Promise<User> {
    const saved = { ...user, id: this.users.length + 1 };
    this.users.push(saved);
    return saved;
  }

  async findById(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }
}
```

## Testing Pyramid

### 1. Unit Tests (Foundation - 70%)

Test individual components in isolation:

```typescript
// Fast, focused, isolated
describe('PriceCalculator', () => {
  test('should calculate tax correctly', () => {
    const calculator = new PriceCalculator();
    const result = calculator.calculateTax(100, 0.08);
    expect(result).toBe(8);
  });
});
```

**Characteristics:**
- Fast execution (< 1ms per test)
- High coverage of business logic
- No external dependencies
- Cheap to maintain

### 2. Integration Tests (Middle - 20%)

Test component interactions:

```typescript
// Test multiple components working together
describe('UserRegistration Integration', () => {
  test('should send welcome email after user registration', async () => {
    const userService = new UserService(userRepository, emailService);
    
    await userService.registerUser({
      name: 'Test User',
      email: 'test@example.com'
    });

    expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith('test@example.com');
  });
});
```

**Characteristics:**
- Moderate execution time
- Test realistic scenarios
- Limited external dependencies
- Higher maintenance cost

### 3. End-to-End Tests (Top - 10%)

Test complete user workflows:

```typescript
// Test full user journey
describe('User Registration E2E', () => {
  test('user can register and receive welcome email', async () => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid=name-input]', 'Test User');
    await page.fill('[data-testid=email-input]', 'test@example.com');
    
    // Submit form
    await page.click('[data-testid=submit-button]');
    
    // Verify success message
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    
    // Verify welcome email was sent (check email service)
    const emails = await getTestEmails();
    expect(emails).toContainEqual(
      expect.objectContaining({
        to: 'test@example.com',
        subject: expect.stringContaining('Welcome')
      })
    );
  });
});
```

**Characteristics:**
- Slow execution (seconds/minutes)
- High confidence in critical paths
- Full system integration
- Expensive to maintain

## Test Organization

### 1. Directory Structure

Organize tests to mirror production code:

```
src/
├── components/
│   ├── UserCard/
│   │   ├── UserCard.tsx
│   │   ├── UserCard.test.tsx
│   │   └── UserCard.stories.tsx
│   └── DataTable/
│       ├── DataTable.tsx
│       └── DataTable.test.tsx
├── services/
│   ├── UserService.ts
│   └── UserService.test.ts
├── utils/
│   ├── validation.ts
│   └── validation.test.ts
└── __tests__/
    ├── integration/
    │   ├── userWorkflow.test.ts
    │   └── apiIntegration.test.ts
    └── e2e/
        ├── userRegistration.e2e.ts
        └── paymentFlow.e2e.ts
```

### 2. Test Grouping with Describe Blocks

```typescript
describe('UserService', () => {
  describe('when creating a user', () => {
    describe('with valid data', () => {
      test('should create user successfully', () => {});
      test('should send welcome email', () => {});
      test('should assign default role', () => {});
    });

    describe('with invalid data', () => {
      test('should reject empty name', () => {});
      test('should reject invalid email', () => {});
      test('should reject duplicate email', () => {});
    });
  });

  describe('when updating a user', () => {
    // Update-specific tests
  });
});
```

### 3. Setup and Teardown

```typescript
describe('DatabaseUserRepository', () => {
  let repository: DatabaseUserRepository;
  let connection: DatabaseConnection;

  beforeAll(async () => {
    // Expensive setup once per test suite
    connection = await createTestDatabase();
  });

  afterAll(async () => {
    // Cleanup after all tests
    await connection.close();
  });

  beforeEach(async () => {
    // Setup for each test
    repository = new DatabaseUserRepository(connection);
    await seedTestData();
  });

  afterEach(async () => {
    // Cleanup after each test
    await clearTestData();
  });
});
```

## Naming Conventions

### 1. Test File Naming

```
// Unit tests
UserService.test.ts
PriceCalculator.test.ts

// Component tests
UserCard.test.tsx
DataTable.test.tsx

// Integration tests
userRegistration.integration.test.ts
paymentFlow.integration.test.ts

// E2E tests
userJourney.e2e.test.ts
checkoutProcess.e2e.test.ts
```

### 2. Test Method Naming

Use descriptive names that explain the scenario:

```typescript
// ✅ Good - Descriptive and clear
test('should return 404 when user does not exist', () => {});
test('should calculate 10% discount for premium customers', () => {});
test('should send email notification when order is completed', () => {});

// ❌ Bad - Vague or implementation-focused
test('getUserTest', () => {});
test('testDiscountCalculation', () => {});
test('shouldCallEmailService', () => {});

// Pattern options:
// should_ExpectedBehavior_When_StateUnderTest
test('should_ReturnUser_When_ValidIdProvided', () => {});

// Given_When_Then
test('Given_ValidUserId_When_GetUser_Then_ReturnUser', () => {});

// Simple descriptive
test('returns user for valid ID', () => {});
```

## Test Data Management

### 1. Test Data Strategies

```typescript
// In-memory test data
const TEST_USERS = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
];

// Factory functions
function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: Math.random(),
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    isActive: true,
    ...overrides,
  };
}

// Using libraries like Faker or Bogus
const fakeUser = faker.helpers.createCard();
```

### 2. Database Test Data

```typescript
// Seed data for integration tests
async function seedTestData() {
  await database.execute(`
    INSERT INTO users (name, email, role) VALUES 
    ('Test User 1', 'test1@example.com', 'user'),
    ('Test User 2', 'test2@example.com', 'admin')
  `);
}

// Clean up after tests
async function cleanupTestData() {
  await database.execute('DELETE FROM users WHERE email LIKE "%@example.com"');
}
```

### 3. Fixtures and Snapshots

```typescript
// JSON fixtures
// tests/fixtures/users.json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
]

// Loading fixtures
const users = require('./fixtures/users.json');

// Snapshot testing
test('renders user card correctly', () => {
  const component = render(<UserCard user={testUser} />);
  expect(component).toMatchSnapshot();
});
```

## Performance Considerations

### 1. Fast Test Execution

```typescript
// ✅ Good - Fast setup
beforeEach(() => {
  userService = new UserService(mockRepository);
});

// ❌ Bad - Slow setup
beforeEach(async () => {
  await database.connect();
  userService = new UserService(new DatabaseRepository(database));
});
```

### 2. Parallel Test Execution

```javascript
// jest.config.js
module.exports = {
  maxWorkers: 4, // Run tests in parallel
  testTimeout: 10000, // Set reasonable timeout
};
```

### 3. Resource Management

```typescript
describe('FileProcessor', () => {
  afterEach(() => {
    // Clean up temporary files
    fs.rmSync('./temp', { recursive: true, force: true });
  });

  afterAll(() => {
    // Close database connections, etc.
    database.close();
  });
});
```

## Continuous Integration

### 1. CI Test Pipeline

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 2. Test Categories

```javascript
// package.json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

### 3. Quality Gates

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

## Common Anti-Patterns to Avoid

### 1. Testing the Framework

```typescript
// ❌ Bad - Testing React instead of your component
test('should update state when props change', () => {
  const { rerender } = render(<MyComponent prop="initial" />);
  rerender(<MyComponent prop="updated" />);
  // Testing React's behavior, not your component's
});

// ✅ Good - Testing your component's behavior
test('should display updated message when prop changes', () => {
  const { rerender } = render(<MyComponent message="initial" />);
  expect(screen.getByText('initial')).toBeInTheDocument();
  
  rerender(<MyComponent message="updated" />);
  expect(screen.getByText('updated')).toBeInTheDocument();
});
```

### 2. Over-Mocking

```typescript
// ❌ Bad - Mocking everything
test('should process user data', () => {
  const mockValidator = jest.fn(() => true);
  const mockFormatter = jest.fn(x => x.toUpperCase());
  const mockLogger = jest.fn();
  
  const processor = new UserProcessor(mockValidator, mockFormatter, mockLogger);
  // Test becomes meaningless
});

// ✅ Good - Mock only external dependencies
test('should process user data', () => {
  const mockApiClient = jest.fn();
  const processor = new UserProcessor(mockApiClient);
  // Test actual business logic
});
```

### 3. Slow Tests

```typescript
// ❌ Bad - Unnecessary async operations
test('should validate email format', async () => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Why?
  const result = validateEmail('test@example.com');
  expect(result).toBe(true);
});

// ✅ Good - Synchronous when possible
test('should validate email format', () => {
  const result = validateEmail('test@example.com');
  expect(result).toBe(true);
});
```

## Summary

Effective testing requires:

1. **Clear Intent** - Tests should clearly communicate what they're verifying
2. **Reliability** - Tests should be deterministic and independent
3. **Maintainability** - Tests should be easy to understand and modify
4. **Performance** - Tests should run quickly to provide fast feedback
5. **Coverage** - Tests should cover critical business logic and edge cases

Remember: Good tests are an investment in code quality, team productivity, and confidence in deployments.