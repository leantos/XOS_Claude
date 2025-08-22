# Backend Testing Guide - .NET Core with xUnit

A comprehensive guide for unit testing .NET Core applications using xUnit, following modern best practices and patterns.

## Table of Contents
- [Setup and Configuration](#setup-and-configuration)
- [xUnit Fundamentals](#xunit-fundamentals)
- [Writing Effective Tests](#writing-effective-tests)
- [Mocking and Dependencies](#mocking-and-dependencies)
- [Data-Driven Testing](#data-driven-testing)
- [Async Testing](#async-testing)
- [Integration Testing](#integration-testing)
- [Best Practices](#best-practices)

## Setup and Configuration

### 1. Project Setup

Create a test project:
```bash
dotnet new xunit -n CVS.Tests
dotnet add reference ../CVS.WebApi/CVS.WebApi.csproj
```

### 2. Required NuGet Packages

```xml
<PackageReference Include="xunit" Version="2.6.0" />
<PackageReference Include="xunit.runner.visualstudio" Version="2.5.0" />
<PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
<PackageReference Include="Moq" Version="4.20.0" />
<PackageReference Include="FluentAssertions" Version="6.12.0" />
<PackageReference Include="Bogus" Version="35.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
<PackageReference Include="coverlet.collector" Version="6.0.0" />
```

### 3. Test Project Structure

```
CVS.Tests/
├── Unit/
│   ├── Controllers/
│   ├── Services/
│   ├── Repositories/
│   └── Utilities/
├── Integration/
│   ├── Api/
│   └── Database/
├── Fixtures/
├── Builders/
└── Extensions/
```

## xUnit Fundamentals

### Basic Test Structure

```csharp
public class UserServiceTests
{
    private readonly Mock<IUserRepository> _mockRepository;
    private readonly Mock<ILogger<UserService>> _mockLogger;
    private readonly UserService _sut; // System Under Test

    public UserServiceTests()
    {
        _mockRepository = new Mock<IUserRepository>();
        _mockLogger = new Mock<ILogger<UserService>>();
        _sut = new UserService(_mockRepository.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetUserAsync_WhenUserExists_ReturnsUser()
    {
        // Arrange
        var userId = 1;
        var expectedUser = new User { Id = userId, Name = "Test User" };
        _mockRepository.Setup(x => x.GetByIdAsync(userId))
                      .ReturnsAsync(expectedUser);

        // Act
        var result = await _sut.GetUserAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(userId);
        result.Name.Should().Be("Test User");
    }

    [Fact]
    public async Task GetUserAsync_WhenUserNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var userId = 999;
        _mockRepository.Setup(x => x.GetByIdAsync(userId))
                      .ReturnsAsync((User)null);

        // Act
        Func<Task> act = async () => await _sut.GetUserAsync(userId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
                 .WithMessage($"User with ID {userId} not found");
    }
}
```

### Test Lifecycle

```csharp
public class TestLifecycleExample : IDisposable, IAsyncLifetime
{
    public TestLifecycleExample()
    {
        // Constructor runs before each test
    }

    public async Task InitializeAsync()
    {
        // Async initialization before each test
        await Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        // Async cleanup after each test
        await Task.CompletedTask;
    }

    public void Dispose()
    {
        // Cleanup after each test
    }
}
```

## Writing Effective Tests

### AAA Pattern (Arrange-Act-Assert)

```csharp
[Fact]
public void CalculateDiscount_StandardCustomer_Returns10Percent()
{
    // Arrange - Set up test data and dependencies
    var customer = new Customer { Type = CustomerType.Standard };
    var originalPrice = 100m;
    var calculator = new DiscountCalculator();

    // Act - Execute the method being tested
    var discount = calculator.CalculateDiscount(customer, originalPrice);

    // Assert - Verify the result
    discount.Should().Be(10m);
}
```

### Testing Exceptions

```csharp
[Fact]
public void Withdraw_InsufficientFunds_ThrowsException()
{
    // Using Assert.Throws
    var account = new BankAccount(100);
    
    var exception = Assert.Throws<InsufficientFundsException>(
        () => account.Withdraw(150)
    );
    
    exception.Message.Should().Contain("Insufficient funds");
}

[Fact]
public async Task ProcessPayment_InvalidCard_ThrowsExceptionAsync()
{
    // Using FluentAssertions for async
    var processor = new PaymentProcessor();
    var invalidCard = new CreditCard { Number = "invalid" };

    await processor.Invoking(p => p.ProcessAsync(invalidCard))
                  .Should().ThrowAsync<InvalidCardException>();
}
```

## Mocking and Dependencies

### Using Moq

```csharp
public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _mockRepo;
    private readonly Mock<IEmailService> _mockEmail;
    private readonly OrderService _sut;

    public OrderServiceTests()
    {
        _mockRepo = new Mock<IOrderRepository>();
        _mockEmail = new Mock<IEmailService>();
        _sut = new OrderService(_mockRepo.Object, _mockEmail.Object);
    }

    [Fact]
    public async Task CreateOrder_ValidOrder_SendsConfirmationEmail()
    {
        // Arrange
        var order = new Order { Id = 1, CustomerEmail = "test@example.com" };
        _mockRepo.Setup(x => x.CreateAsync(It.IsAny<Order>()))
                .ReturnsAsync(order);

        // Act
        await _sut.CreateOrderAsync(order);

        // Assert - Verify email was sent
        _mockEmail.Verify(
            x => x.SendAsync(
                order.CustomerEmail,
                It.Is<string>(s => s.Contains("Order Confirmation")),
                It.IsAny<string>()
            ),
            Times.Once
        );
    }

    [Fact]
    public async Task GetOrders_WithFilters_CallsRepositoryWithCorrectParameters()
    {
        // Arrange
        var filter = new OrderFilter { Status = OrderStatus.Pending };
        var expectedOrders = new List<Order> { new Order(), new Order() };
        
        _mockRepo.Setup(x => x.GetFilteredAsync(
                      It.Is<OrderFilter>(f => f.Status == OrderStatus.Pending)))
                .ReturnsAsync(expectedOrders);

        // Act
        var result = await _sut.GetOrdersAsync(filter);

        // Assert
        result.Should().HaveCount(2);
        _mockRepo.Verify(x => x.GetFilteredAsync(
            It.Is<OrderFilter>(f => f.Status == OrderStatus.Pending)), 
            Times.Once);
    }
}
```

### Advanced Mocking Scenarios

```csharp
[Fact]
public async Task ProcessBatch_MultipleItems_ProcessesInOrder()
{
    // Setup sequence of returns
    var mockProcessor = new Mock<IProcessor>();
    mockProcessor.SetupSequence(x => x.ProcessAsync(It.IsAny<Item>()))
                 .ReturnsAsync(true)
                 .ReturnsAsync(false)
                 .ReturnsAsync(true);

    // Setup callback to capture arguments
    var processedItems = new List<Item>();
    mockProcessor.Setup(x => x.ProcessAsync(It.IsAny<Item>()))
                 .Callback<Item>(item => processedItems.Add(item));

    // Test implementation
}
```

## Data-Driven Testing

### Theory and InlineData

```csharp
public class CalculatorTests
{
    [Theory]
    [InlineData(2, 3, 5)]
    [InlineData(0, 0, 0)]
    [InlineData(-1, 1, 0)]
    [InlineData(int.MaxValue, 1, int.MinValue)] // Overflow case
    public void Add_VariousInputs_ReturnsExpectedResult(int a, int b, int expected)
    {
        var calculator = new Calculator();
        var result = calculator.Add(a, b);
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("", false)]
    [InlineData("test@example.com", true)]
    [InlineData("invalid.email", false)]
    [InlineData("user@domain.co.uk", true)]
    public void IsValidEmail_VariousInputs_ReturnsExpectedResult(
        string email, bool expected)
    {
        var validator = new EmailValidator();
        var result = validator.IsValid(email);
        result.Should().Be(expected);
    }
}
```

### MemberData and ClassData

```csharp
public class ValidationTests
{
    [Theory]
    [MemberData(nameof(GetTestCases))]
    public void Validate_VariousInputs_ReturnsExpectedResult(
        ValidationInput input, bool expectedValid, string expectedError)
    {
        var validator = new Validator();
        var result = validator.Validate(input);
        
        result.IsValid.Should().Be(expectedValid);
        if (!expectedValid)
            result.Error.Should().Be(expectedError);
    }

    public static IEnumerable<object[]> GetTestCases()
    {
        yield return new object[] 
        { 
            new ValidationInput { Value = "valid" }, 
            true, 
            null 
        };
        yield return new object[] 
        { 
            new ValidationInput { Value = "" }, 
            false, 
            "Value is required" 
        };
        yield return new object[] 
        { 
            new ValidationInput { Value = "x".PadRight(101, 'x') }, 
            false, 
            "Value exceeds maximum length" 
        };
    }
}

public class PriceTestData : TheoryData<decimal, decimal, decimal>
{
    public PriceTestData()
    {
        Add(100m, 0.1m, 90m);    // 10% discount
        Add(100m, 0.25m, 75m);   // 25% discount
        Add(100m, 0m, 100m);     // No discount
    }
}

public class PriceCalculatorTests
{
    [Theory]
    [ClassData(typeof(PriceTestData))]
    public void CalculateFinalPrice_WithDiscount_ReturnsCorrectAmount(
        decimal original, decimal discountRate, decimal expected)
    {
        var calculator = new PriceCalculator();
        var result = calculator.CalculateFinalPrice(original, discountRate);
        result.Should().Be(expected);
    }
}
```

## Async Testing

### Testing Async Methods

```csharp
public class AsyncServiceTests
{
    [Fact]
    public async Task GetDataAsync_SuccessfulCall_ReturnsData()
    {
        // Arrange
        var mockHttp = new Mock<IHttpService>();
        mockHttp.Setup(x => x.GetAsync<UserData>("api/users/1"))
                .ReturnsAsync(new UserData { Id = 1, Name = "Test" });
        
        var service = new UserApiService(mockHttp.Object);

        // Act
        var result = await service.GetUserAsync(1);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Test");
    }

    [Fact]
    public async Task ProcessAsync_LongRunning_CompletesWithinTimeout()
    {
        var service = new DataProcessor();
        
        // Act & Assert with timeout
        var task = service.ProcessLargeDataSetAsync();
        var completedTask = await Task.WhenAny(
            task, 
            Task.Delay(TimeSpan.FromSeconds(5))
        );

        completedTask.Should().Be(task, "operation should complete within 5 seconds");
    }

    [Fact]
    public async Task GetMultipleAsync_ParallelCalls_HandledCorrectly()
    {
        var service = new DataService();
        
        // Act - Parallel execution
        var tasks = Enumerable.Range(1, 10)
            .Select(i => service.GetItemAsync(i))
            .ToList();
        
        var results = await Task.WhenAll(tasks);

        // Assert
        results.Should().HaveCount(10);
        results.Should().OnlyHaveUniqueItems();
    }
}
```

### Testing Cancellation

```csharp
[Fact]
public async Task LongOperation_Cancelled_ThrowsOperationCancelledException()
{
    // Arrange
    var service = new LongRunningService();
    using var cts = new CancellationTokenSource();
    cts.CancelAfter(TimeSpan.FromMilliseconds(100));

    // Act & Assert
    await service.Invoking(s => s.ProcessAsync(cts.Token))
                 .Should().ThrowAsync<OperationCanceledException>();
}
```

## Integration Testing

### WebApplicationFactory Setup

```csharp
public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                // Remove real database
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (descriptor != null)
                    services.Remove(descriptor);

                // Add in-memory database
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                });

                // Replace external services with mocks
                services.AddSingleton<IEmailService, MockEmailService>();
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetUsers_ReturnsSuccessStatusCode()
    {
        // Act
        var response = await _client.GetAsync("/api/users");

        // Assert
        response.EnsureSuccessStatusCode();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CreateUser_ValidData_ReturnsCreatedUser()
    {
        // Arrange
        var newUser = new CreateUserDto 
        { 
            Name = "Test User", 
            Email = "test@example.com" 
        };
        var content = new StringContent(
            JsonSerializer.Serialize(newUser),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var response = await _client.PostAsync("/api/users", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var responseBody = await response.Content.ReadAsStringAsync();
        var createdUser = JsonSerializer.Deserialize<UserDto>(responseBody);
        createdUser.Name.Should().Be(newUser.Name);
    }
}
```

### Database Integration Tests

```csharp
public class RepositoryIntegrationTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly UserRepository _repository;

    public RepositoryIntegrationTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _repository = new UserRepository(_context);

        // Seed test data
        SeedTestData();
    }

    private void SeedTestData()
    {
        _context.Users.AddRange(
            new User { Id = 1, Name = "User1", Email = "user1@test.com" },
            new User { Id = 2, Name = "User2", Email = "user2@test.com" }
        );
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetByEmail_ExistingUser_ReturnsUser()
    {
        // Act
        var user = await _repository.GetByEmailAsync("user1@test.com");

        // Assert
        user.Should().NotBeNull();
        user.Name.Should().Be("User1");
    }

    [Fact]
    public async Task Create_NewUser_SavesSuccessfully()
    {
        // Arrange
        var newUser = new User 
        { 
            Name = "New User", 
            Email = "new@test.com" 
        };

        // Act
        var created = await _repository.CreateAsync(newUser);
        var retrieved = await _repository.GetByIdAsync(created.Id);

        // Assert
        retrieved.Should().NotBeNull();
        retrieved.Email.Should().Be("new@test.com");
    }

    public void Dispose()
    {
        _context?.Dispose();
    }
}
```

## Best Practices

### 1. Test Organization

```csharp
public class WellOrganizedTests
{
    #region Setup
    private readonly Mock<IDependency> _mockDependency;
    private readonly SystemUnderTest _sut;

    public WellOrganizedTests()
    {
        _mockDependency = new Mock<IDependency>();
        _sut = new SystemUnderTest(_mockDependency.Object);
    }
    #endregion

    #region Happy Path Tests
    [Fact]
    public void Method_ValidInput_ReturnsExpectedResult() { }
    #endregion

    #region Edge Cases
    [Fact]
    public void Method_NullInput_ThrowsArgumentNullException() { }
    
    [Fact]
    public void Method_EmptyCollection_ReturnsEmptyResult() { }
    #endregion

    #region Error Scenarios
    [Fact]
    public void Method_NetworkError_RetriesAndFails() { }
    #endregion
}
```

### 2. Test Data Builders

```csharp
public class UserBuilder
{
    private User _user = new User();

    public UserBuilder WithId(int id)
    {
        _user.Id = id;
        return this;
    }

    public UserBuilder WithEmail(string email)
    {
        _user.Email = email;
        return this;
    }

    public UserBuilder WithDefaults()
    {
        _user.Id = 1;
        _user.Name = "Test User";
        _user.Email = "test@example.com";
        _user.CreatedAt = DateTime.UtcNow;
        return this;
    }

    public UserBuilder AsAdmin()
    {
        _user.Role = UserRole.Admin;
        _user.Permissions = new[] { "read", "write", "delete" };
        return this;
    }

    public User Build() => _user;

    public static implicit operator User(UserBuilder builder) => builder.Build();
}

// Usage
[Fact]
public void TestWithBuilder()
{
    var adminUser = new UserBuilder()
        .WithDefaults()
        .AsAdmin()
        .Build();

    // Use adminUser in test
}
```

### 3. Using Bogus for Fake Data

```csharp
public class FakeDataTests
{
    private readonly Faker<User> _userFaker;

    public FakeDataTests()
    {
        _userFaker = new Faker<User>()
            .RuleFor(u => u.Id, f => f.IndexFaker)
            .RuleFor(u => u.Name, f => f.Name.FullName())
            .RuleFor(u => u.Email, f => f.Internet.Email())
            .RuleFor(u => u.Phone, f => f.Phone.PhoneNumber())
            .RuleFor(u => u.DateOfBirth, f => f.Date.Past(50, DateTime.Now.AddYears(-18)))
            .RuleFor(u => u.Address, f => f.Address.FullAddress());
    }

    [Fact]
    public void BulkCreate_100Users_SavesSuccessfully()
    {
        // Arrange
        var users = _userFaker.Generate(100);
        var service = new UserService();

        // Act
        var results = service.BulkCreate(users);

        // Assert
        results.Should().HaveCount(100);
        results.Should().OnlyContain(r => r.Success);
    }
}
```

### 4. Custom Assertions

```csharp
public static class CustomAssertions
{
    public static void ShouldBeSuccessResponse(this HttpResponseMessage response)
    {
        response.Should().NotBeNull();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Should().NotBeNull();
    }

    public static void ShouldContainValidationError(
        this ValidationResult result, 
        string field, 
        string expectedMessage)
    {
        result.Errors.Should().Contain(e => 
            e.PropertyName == field && 
            e.ErrorMessage.Contains(expectedMessage));
    }
}

// Usage
[Fact]
public void ApiCall_ReturnsSuccess()
{
    var response = await _client.GetAsync("/api/resource");
    response.ShouldBeSuccessResponse();
}
```

### 5. Test Categories and Traits

```csharp
[Trait("Category", "Unit")]
[Trait("Priority", "High")]
public class CriticalBusinessLogicTests
{
    [Fact]
    [Trait("Feature", "Payment")]
    public void ProcessPayment_ValidCard_Succeeds() { }
}

// Run specific category
// dotnet test --filter "Category=Unit"
// dotnet test --filter "Priority=High"
```

## Common Patterns and Anti-Patterns

### ✅ Good Practices

```csharp
// Good: Clear test name and structure
[Fact]
public void CalculateShipping_OrderOver100_ReturnsFreeShipping()
{
    var order = new Order { Total = 150 };
    var calculator = new ShippingCalculator();
    
    var shipping = calculator.Calculate(order);
    
    shipping.Should().Be(0);
}

// Good: Testing behavior, not implementation
[Fact]
public void Login_ValidCredentials_ReturnsAuthToken()
{
    var service = new AuthService();
    
    var token = service.Login("user", "pass");
    
    token.Should().NotBeNullOrEmpty();
    // Don't test HOW the token is generated
}
```

### ❌ Anti-Patterns to Avoid

```csharp
// Bad: Multiple assertions testing different things
[Fact]
public void TestUserOperations() // Vague name
{
    var service = new UserService();
    var user = service.Create("test");
    Assert.NotNull(user);
    
    service.Update(user);
    Assert.Equal("updated", user.Status);
    
    service.Delete(user.Id);
    Assert.Null(service.Get(user.Id));
    // Too many operations in one test
}

// Bad: Testing private methods directly
[Fact]
public void TestPrivateMethod()
{
    var service = new Service();
    var privateMethod = service.GetType()
        .GetMethod("PrivateHelper", BindingFlags.NonPublic);
    // Don't do this - test through public API
}
```

## Summary

Key takeaways for effective backend testing:

1. **Use xUnit's modern features** - Theories, async support, and fixtures
2. **Follow AAA pattern** - Keep tests readable and maintainable
3. **Mock external dependencies** - But don't over-mock
4. **Test behavior, not implementation** - Focus on outcomes
5. **Use meaningful test names** - They serve as documentation
6. **Keep tests fast and isolated** - Each test should run independently
7. **Aim for high coverage** - But prioritize critical paths
8. **Refactor tests** - Maintain them like production code

Remember: Good tests enable confident refactoring and catch bugs early!