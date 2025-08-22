# Testing Issues & Solutions

This document tracks testing-related issues encountered during TDD development cycles, focusing on unit testing, integration testing, mocking, and test automation patterns.

## xUnit & Test Framework Issues

### Issue: Tests Failing Due to Async/Await Problems
**Symptoms:** Tests hanging, deadlocks, or incorrect async behavior
**Root Cause:** Mixing synchronous and asynchronous calls incorrectly
**Solution:** Use proper async/await patterns throughout test chain
**Code Example:**
```csharp
// Wrong - can cause deadlocks
[Fact]
public void TestAsyncMethod()
{
    var result = _service.GetDataAsync().Result; // Blocking call
    Assert.NotNull(result);
}

// Correct - proper async test
[Fact]
public async Task TestAsyncMethod()
{
    var result = await _service.GetDataAsync();
    Assert.NotNull(result);
}
```
**Pattern:** Always use async/await consistently in test methods

## UserLogin Module Testing Issues

### Issue: Mock Services Not Working with XOS Framework
**Symptoms:** Tests fail because XOS framework services can't be properly mocked
**Root Cause:** XOS services have complex inheritance and dependency chains
**Solution:** Create wrapper interfaces for XOS services to enable mocking
**Code Example:**
```csharp
// Create wrapper interface
public interface IUserLoginServiceWrapper
{
    Task<UserLoginResponse> AuthenticateAsync(UserLoginRequest request);
    // ... other methods
}

// Implement wrapper
public class UserLoginServiceWrapper : IUserLoginServiceWrapper
{
    private readonly UserLoginService _service;
    
    public UserLoginServiceWrapper(UserLoginService service)
    {
        _service = service;
    }
    
    public Task<UserLoginResponse> AuthenticateAsync(UserLoginRequest request)
        => _service.AuthenticateAsync(request);
}

// Mock the wrapper in tests
var mockWrapper = new Mock<IUserLoginServiceWrapper>();
mockWrapper.Setup(x => x.AuthenticateAsync(It.IsAny<UserLoginRequest>()))
          .ReturnsAsync(new UserLoginResponse { Success = true });
```
**Applied In:** UserLogin service testing

### Issue: Database Context Not Isolated Between Tests
**Symptoms:** Tests pass individually but fail when run together
**Root Cause:** Tests sharing database state through XOS framework
**Solution:** Use test database with transaction rollback pattern
**Pattern:** Isolate test data using database transactions
```csharp
[SetUp]
public void Setup()
{
    _testDb = new TestDatabase();
    _transaction = _testDb.BeginTransaction();
}

[TearDown]
public void TearDown()
{
    _transaction?.Rollback();
    _transaction?.Dispose();
}
```
**Applied In:** All UserLogin integration tests

### Issue: XOS Framework row.GetValue<T>() Not Mockable
**Symptoms:** Can't unit test data mapping logic that uses row.GetValue<T>()
**Root Cause:** Dynamic row object from XOS framework not mockable
**Solution:** Extract mapping logic to testable methods with interface
**Pattern:** Create mockable data row interface
```csharp
public interface IDataRow
{
    T GetValue<T>(string columnName);
    T GetValue<T>(string columnName, T defaultValue);
}

// Test with mock data row
var mockRow = new Mock<IDataRow>();
mockRow.Setup(x => x.GetValue<int>("login_id")).Returns(123);
mockRow.Setup(x => x.GetValue<string>("user_name", "")).Returns("testuser");

var userLogin = MapRowToUserLogin(mockRow.Object);
```
**Applied In:** UserLogin data mapping tests

### Issue: Authentication Tests Failing Due to BCrypt Timing
**Symptoms:** Password validation tests intermittently fail
**Root Cause:** BCrypt hashing takes variable time, causing test timeouts
**Solution:** Use deterministic password hashes in tests
**Pattern:** Mock password service for consistent test behavior
```csharp
var mockPasswordService = new Mock<IPasswordService>();
mockPasswordService.Setup(x => x.VerifyPassword("correct", It.IsAny<string>()))
                   .Returns(true);
mockPasswordService.Setup(x => x.VerifyPassword("wrong", It.IsAny<string>()))
                   .Returns(false);
```
**Applied In:** UserLogin authentication tests

### Issue: Tests Passing in Isolation but Failing in Suite
**Symptoms:** Individual tests pass but fail when run with others
**Root Cause:** Tests not properly isolated, shared state between tests
**Solution:** Ensure proper test isolation and cleanup
**Code Example:**
```csharp
public class UserServiceTests : IDisposable
{
    private readonly Mock<IUserRepository> _mockRepo;
    private readonly UserService _sut;
    private readonly List<User> _testUsers;

    public UserServiceTests()
    {
        _mockRepo = new Mock<IUserRepository>();
        _sut = new UserService(_mockRepo.Object);
        _testUsers = new List<User>();
    }

    [Fact]
    public async Task CreateUser_ValidData_ReturnsUser()
    {
        // Each test gets fresh mocks and service instance
        var user = new User { Name = "Test" };
        _testUsers.Add(user); // Track for cleanup
        
        _mockRepo.Setup(x => x.CreateAsync(It.IsAny<User>()))
                 .ReturnsAsync(user);

        var result = await _sut.CreateUserAsync(user);
        
        result.Should().NotBeNull();
    }

    public void Dispose()
    {
        // Clean up test data
        _testUsers.Clear();
        _mockRepo.Reset();
    }
}
```

### Issue: Theory Tests Not Running All Data Cases
**Symptoms:** Some theory test cases not executing or being skipped
**Root Cause:** Invalid test data or data source configuration
**Solution:** Verify test data sources and handle edge cases
**Code Example:**
```csharp
public class CalculatorTests
{
    [Theory]
    [InlineData(2, 3, 5)]
    [InlineData(0, 0, 0)]
    [InlineData(-1, 1, 0)]
    [InlineData(int.MaxValue, 1, int.MinValue)] // Edge case
    public void Add_VariousInputs_ReturnsExpected(int a, int b, int expected)
    {
        var calculator = new Calculator();
        var result = calculator.Add(a, b);
        result.Should().Be(expected);
    }

    // For complex test data
    public static IEnumerable<object[]> GetComplexTestCases()
    {
        yield return new object[] { new User { Name = "John" }, true };
        yield return new object[] { new User { Name = "" }, false };
        yield return new object[] { null, false };
    }

    [Theory]
    [MemberData(nameof(GetComplexTestCases))]
    public void ValidateUser_VariousUsers_ReturnsExpected(User user, bool expected)
    {
        var validator = new UserValidator();
        var result = validator.IsValid(user);
        result.Should().Be(expected);
    }
}
```

## Mocking Framework Issues (Moq)

### Issue: Mock Setup Not Working as Expected
**Symptoms:** Mock returns default values instead of configured values
**Root Cause:** Mock setup doesn't match actual method call parameters
**Solution:** Use precise parameter matching or It.IsAny<T>()
**Code Example:**
```csharp
[Fact]
public async Task GetUser_ExistingId_ReturnsUser()
{
    // Wrong - setup doesn't match call
    _mockRepo.Setup(x => x.GetByIdAsync(1))
             .ReturnsAsync(new User { Id = 1 });
    
    var result = await _sut.GetUserAsync(2); // Called with 2, not 1
    
    // Correct - flexible parameter matching
    _mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<int>()))
             .ReturnsAsync((int id) => new User { Id = id });
    
    // Or specific setup for each case
    _mockRepo.Setup(x => x.GetByIdAsync(2))
             .ReturnsAsync(new User { Id = 2 });
}
```

### Issue: Verifying Mock Calls Not Working
**Symptoms:** Verify() calls failing even though method was called
**Root Cause:** Parameter matching in Verify doesn't match actual call
**Solution:** Use consistent parameter matching in Setup and Verify
**Code Example:**
```csharp
[Fact]
public async Task CreateUser_ValidUser_CallsRepository()
{
    var user = new User { Name = "Test User" };
    
    await _sut.CreateUserAsync(user);
    
    // Wrong - exact object comparison might fail
    _mockRepo.Verify(x => x.CreateAsync(user), Times.Once);
    
    // Better - verify by property matching
    _mockRepo.Verify(x => x.CreateAsync(
        It.Is<User>(u => u.Name == "Test User")), Times.Once);
    
    // Or use It.IsAny if exact parameters don't matter
    _mockRepo.Verify(x => x.CreateAsync(It.IsAny<User>()), Times.Once);
}
```

### Issue: Complex Object Mocking Failures
**Symptoms:** Mocks not working with complex nested objects
**Root Cause:** Deep object comparison issues in mock setup
**Solution:** Use property-based matching instead of object equality
**Code Example:**
```csharp
[Fact]
public async Task ProcessOrder_ValidOrder_UpdatesInventory()
{
    var order = new Order 
    { 
        Items = new List<OrderItem> 
        { 
            new OrderItem { ItemId = 1, Quantity = 2 }
        }
    };
    
    // Wrong - complex object comparison
    _mockInventory.Setup(x => x.UpdateStock(order.Items))
                  .Returns(true);
    
    // Better - match by properties
    _mockInventory.Setup(x => x.UpdateStock(
        It.Is<List<OrderItem>>(items => 
            items.Any(i => i.ItemId == 1 && i.Quantity == 2))))
        .Returns(true);
}
```

## Test Data Management Issues

### Issue: Hard-to-Maintain Test Data
**Symptoms:** Tests break when small data changes are made
**Root Cause:** Hardcoded test data scattered throughout tests
**Solution:** Use Test Data Builders or Object Mother pattern
**Code Example:**
```csharp
// Test Data Builder Pattern
public class UserBuilder
{
    private User _user = new User();

    public UserBuilder WithDefaults()
    {
        _user.Id = 1;
        _user.Name = "Test User";
        _user.Email = "test@example.com";
        _user.CreatedAt = DateTime.UtcNow;
        return this;
    }

    public UserBuilder WithName(string name)
    {
        _user.Name = name;
        return this;
    }

    public UserBuilder WithEmail(string email)
    {
        _user.Email = email;
        return this;
    }

    public User Build() => _user;
    
    public static implicit operator User(UserBuilder builder) => builder.Build();
}

// Usage in tests
[Fact]
public void ValidateUser_ValidUser_ReturnsTrue()
{
    var user = new UserBuilder()
        .WithDefaults()
        .WithEmail("valid@test.com")
        .Build();
    
    var result = _validator.IsValid(user);
    result.Should().BeTrue();
}
```

### Issue: Flaky Tests Due to Date/Time Dependencies
**Symptoms:** Tests fail sporadically based on when they're run
**Root Cause:** Tests depend on current date/time
**Solution:** Use dependency injection for time providers or fixed dates
**Code Example:**
```csharp
// Create time abstraction
public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}

public class SystemDateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}

// In service
public class UserService
{
    private readonly IDateTimeProvider _dateTimeProvider;
    
    public UserService(IDateTimeProvider dateTimeProvider)
    {
        _dateTimeProvider = dateTimeProvider;
    }
    
    public User CreateUser(string name)
    {
        return new User 
        { 
            Name = name, 
            CreatedAt = _dateTimeProvider.UtcNow 
        };
    }
}

// In test
[Fact]
public void CreateUser_WithName_SetsCreatedDate()
{
    var fixedDate = new DateTime(2023, 1, 1);
    var mockDateProvider = new Mock<IDateTimeProvider>();
    mockDateProvider.Setup(x => x.UtcNow).Returns(fixedDate);
    
    var service = new UserService(mockDateProvider.Object);
    
    var user = service.CreateUser("Test");
    
    user.CreatedAt.Should().Be(fixedDate);
}
```

## Integration Testing Issues

### Issue: Database Tests Affecting Each Other
**Symptoms:** Integration tests fail when run together due to shared data
**Root Cause:** Tests sharing same database without proper cleanup
**Solution:** Use test database with transaction rollback or unique test data
**Code Example:**
```csharp
public class RepositoryIntegrationTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly IDbContextTransaction _transaction;

    public RepositoryIntegrationTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _transaction = _context.Database.BeginTransaction();
    }

    [Fact]
    public async Task CreateUser_ValidUser_SavesSuccessfully()
    {
        var repository = new UserRepository(_context);
        var user = new User { Name = "Test User" };

        var result = await repository.CreateAsync(user);

        result.Should().NotBeNull();
        result.Id.Should().BeGreaterThan(0);
    }

    public void Dispose()
    {
        _transaction?.Rollback(); // Rollback all changes
        _transaction?.Dispose();
        _context?.Dispose();
    }
}
```

### Issue: External API Dependencies in Tests
**Symptoms:** Tests fail when external services are unavailable
**Root Cause:** Tests calling real external APIs
**Solution:** Mock external dependencies or use test doubles
**Code Example:**
```csharp
public class PaymentServiceTests
{
    private readonly Mock<IHttpClient> _mockHttp;
    private readonly PaymentService _sut;

    public PaymentServiceTests()
    {
        _mockHttp = new Mock<IHttpClient>();
        _sut = new PaymentService(_mockHttp.Object);
    }

    [Fact]
    public async Task ProcessPayment_ValidCard_ReturnsSuccess()
    {
        // Mock external API response
        var apiResponse = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(JsonSerializer.Serialize(new 
            { 
                success = true, 
                transactionId = "12345" 
            }))
        };
        
        _mockHttp.Setup(x => x.PostAsync(
                It.IsAny<string>(), 
                It.IsAny<HttpContent>()))
            .ReturnsAsync(apiResponse);

        var result = await _sut.ProcessPaymentAsync(new PaymentRequest());

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
    }
}
```

## Test Coverage Issues

### Issue: Low Test Coverage on Important Code
**Symptoms:** Critical bugs in production that weren't caught by tests
**Root Cause:** Tests not covering all execution paths
**Solution:** Use coverage tools and focus on critical business logic
**Code Example:**
```bash
# Generate coverage report
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover

# Generate HTML report
reportgenerator -reports:coverage.opencover.xml -targetdir:coveragereport
```
**Pattern:** Aim for high coverage on business logic, less critical on simple properties

### Issue: Tests Covering Implementation Details Instead of Behavior
**Symptoms:** Tests break when refactoring even though behavior unchanged
**Root Cause:** Tests coupled to implementation rather than public API
**Solution:** Test public behavior and outcomes, not internal implementation
**Code Example:**
```csharp
// Wrong - testing implementation details
[Fact]
public void SaveUser_CallsValidateAndRepository()
{
    _mockValidator.Setup(x => x.Validate(It.IsAny<User>())).Returns(true);
    
    _sut.SaveUser(new User());
    
    // These test HOW it works, not WHAT it does
    _mockValidator.Verify(x => x.Validate(It.IsAny<User>()), Times.Once);
    _mockRepo.Verify(x => x.Save(It.IsAny<User>()), Times.Once);
}

// Better - testing behavior and outcome
[Fact]
public void SaveUser_ValidUser_ReturnsSuccessResult()
{
    var user = new User { Name = "Test User" };
    
    var result = _sut.SaveUser(user);
    
    result.Success.Should().BeTrue();
    result.User.Should().NotBeNull();
    result.User.Id.Should().BeGreaterThan(0);
}
```

## Performance Testing Issues

### Issue: Tests Running Too Slowly
**Symptoms:** Test suite takes too long to execute
**Root Cause:** Heavy setup, database operations, or file I/O in unit tests
**Solution:** Optimize test setup and use appropriate test types
**Code Example:**
```csharp
// Slow - database setup for each test
[Fact]
public async Task TestUserCreation()
{
    using var context = new AppDbContext(GetDbOptions());
    await context.Database.EnsureCreatedAsync(); // Slow
    var repository = new UserRepository(context);
    
    // Test implementation
}

// Faster - use mocks for unit tests
[Fact]
public async Task TestUserCreation()
{
    var mockRepo = new Mock<IUserRepository>();
    mockRepo.Setup(x => x.CreateAsync(It.IsAny<User>()))
            .ReturnsAsync(new User { Id = 1 });
            
    var service = new UserService(mockRepo.Object);
    
    // Test implementation - much faster
}
```

## Test Organization Issues

### Issue: Unclear Test Names and Structure
**Symptoms:** Difficult to understand test failures or find relevant tests
**Root Cause:** Poor test naming and organization
**Solution:** Use descriptive test names following conventions
**Code Example:**
```csharp
public class UserServiceTests
{
    #region Constructor Tests
    
    [Fact]
    public void Constructor_NullRepository_ThrowsArgumentNullException()
    {
        Action act = () => new UserService(null);
        act.Should().Throw<ArgumentNullException>();
    }
    
    #endregion
    
    #region CreateUser Tests
    
    [Fact]
    public void CreateUser_ValidData_ReturnsUserWithId()
    {
        // Test implementation
    }
    
    [Fact]
    public void CreateUser_NullUser_ThrowsArgumentNullException()
    {
        // Test implementation
    }
    
    [Fact]
    public void CreateUser_DuplicateEmail_ThrowsBusinessException()
    {
        // Test implementation
    }
    
    #endregion
}
```

### Issue: Tests Not Following AAA Pattern
**Symptoms:** Tests difficult to read and understand
**Root Cause:** Mixed arrangement, action, and assertion code
**Solution:** Clearly separate Arrange, Act, Assert sections
**Code Example:**
```csharp
[Fact]
public void CalculateDiscount_PremiumCustomer_Returns15Percent()
{
    // Arrange
    var customer = new Customer { Type = CustomerType.Premium };
    var order = new Order { Total = 100m };
    var calculator = new DiscountCalculator();

    // Act
    var discount = calculator.CalculateDiscount(customer, order);

    // Assert
    discount.Should().Be(15m);
}
```

---

## Testing Best Practices

### Unit Testing
- Test one thing at a time
- Use descriptive test names: `Method_Scenario_ExpectedOutcome`
- Follow AAA pattern (Arrange, Act, Assert)
- Mock all external dependencies
- Keep tests fast and isolated

### Integration Testing
- Test real interactions between components
- Use test database or in-memory alternatives
- Clean up test data between tests
- Test critical integration points

### Test Data Management
- Use builders for complex test objects
- Avoid hardcoded magic values
- Make test data creation explicit and readable
- Use meaningful test data that reflects real scenarios

### Mock Management
- Reset mocks between tests
- Use precise parameter matching
- Verify important interactions
- Don't over-mock (mock only what you need)

## Common TDD Anti-Patterns to Avoid

1. **Testing Implementation Details** - Focus on behavior, not internal structure
2. **Fragile Tests** - Tests that break with minor refactoring
3. **Slow Tests** - Unit tests should run in milliseconds
4. **Test Interdependence** - Each test should run independently
5. **Poor Test Names** - Tests should clearly describe what they verify

## How to Use This Guide

1. **Identify Test Smells:** Look for patterns that indicate test quality issues
2. **Apply Appropriate Patterns:** Choose unit vs integration vs end-to-end testing
3. **Optimize for Speed:** Keep unit tests fast, integration tests focused
4. **Maintain Test Quality:** Refactor tests like production code
5. **Monitor Coverage:** Focus on critical business logic coverage

## Contributing to This Guide

When adding new testing issues:
1. Include specific error messages and failure patterns
2. Show both problematic and corrected test code
3. Explain the testing principle behind the solution
4. Consider both xUnit and framework-agnostic patterns
5. Focus on patterns that improve test maintainability