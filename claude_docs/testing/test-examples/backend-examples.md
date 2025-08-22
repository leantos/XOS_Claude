# Backend Testing Examples - Real-World xUnit Tests

Practical examples of unit and integration tests for a .NET Core application using xUnit, following patterns suitable for the CVS project architecture.

## Table of Contents
- [Controller Tests](#controller-tests)
- [Service Layer Tests](#service-layer-tests)
- [Repository Tests](#repository-tests)
- [API Integration Tests](#api-integration-tests)
- [Authentication Tests](#authentication-tests)
- [Validation Tests](#validation-tests)

## Controller Tests

### UserController Tests

```csharp
public class UsersControllerTests
{
    private readonly Mock<IUserService> _mockUserService;
    private readonly Mock<ILogger<UsersController>> _mockLogger;
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _mockUserService = new Mock<IUserService>();
        _mockLogger = new Mock<ILogger<UsersController>>();
        _controller = new UsersController(_mockUserService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetUser_ValidId_ReturnsOkWithUser()
    {
        // Arrange
        var userId = 1;
        var user = new UserDto 
        { 
            Id = userId, 
            Name = "John Doe", 
            Email = "john@example.com" 
        };
        
        _mockUserService
            .Setup(x => x.GetUserAsync(userId))
            .ReturnsAsync(user);

        // Act
        var result = await _controller.GetUser(userId);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedUser = okResult.Value.Should().BeOfType<UserDto>().Subject;
        returnedUser.Id.Should().Be(userId);
        returnedUser.Name.Should().Be("John Doe");
    }

    [Fact]
    public async Task GetUser_NonExistentId_ReturnsNotFound()
    {
        // Arrange
        var userId = 999;
        _mockUserService
            .Setup(x => x.GetUserAsync(userId))
            .ThrowsAsync(new NotFoundException($"User with ID {userId} not found"));

        // Act
        var result = await _controller.GetUser(userId);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task CreateUser_ValidData_ReturnsCreated()
    {
        // Arrange
        var createDto = new CreateUserDto 
        { 
            Name = "Jane Doe", 
            Email = "jane@example.com" 
        };
        
        var createdUser = new UserDto 
        { 
            Id = 2, 
            Name = createDto.Name, 
            Email = createDto.Email 
        };

        _mockUserService
            .Setup(x => x.CreateUserAsync(createDto))
            .ReturnsAsync(createdUser);

        // Act
        var result = await _controller.CreateUser(createDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(UsersController.GetUser));
        createdResult.RouteValues["id"].Should().Be(2);
        
        var returnedUser = createdResult.Value.Should().BeOfType<UserDto>().Subject;
        returnedUser.Email.Should().Be("jane@example.com");
    }

    [Fact]
    public async Task CreateUser_InvalidModelState_ReturnsBadRequest()
    {
        // Arrange
        var createDto = new CreateUserDto { Email = "invalid-email" };
        _controller.ModelState.AddModelError("Email", "Invalid email format");

        // Act
        var result = await _controller.CreateUser(createDto);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task GetUsers_WithPagination_ReturnsPagedResult()
    {
        // Arrange
        var pageNumber = 1;
        var pageSize = 10;
        var users = new List<UserDto>
        {
            new UserDto { Id = 1, Name = "User 1", Email = "user1@example.com" },
            new UserDto { Id = 2, Name = "User 2", Email = "user2@example.com" }
        };
        
        var pagedResult = new PagedResult<UserDto>
        {
            Items = users,
            TotalCount = 25,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        _mockUserService
            .Setup(x => x.GetUsersAsync(pageNumber, pageSize))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _controller.GetUsers(pageNumber, pageSize);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedResult = okResult.Value.Should().BeOfType<PagedResult<UserDto>>().Subject;
        
        returnedResult.Items.Should().HaveCount(2);
        returnedResult.TotalCount.Should().Be(25);
        returnedResult.PageNumber.Should().Be(1);
    }
}
```

### BankDataController Tests

```csharp
public class BankDataControllerTests
{
    private readonly Mock<IBankDataService> _mockBankDataService;
    private readonly Mock<ILogger<BankDataController>> _mockLogger;
    private readonly BankDataController _controller;

    public BankDataControllerTests()
    {
        _mockBankDataService = new Mock<IBankDataService>();
        _mockLogger = new Mock<ILogger<BankDataController>>();
        _controller = new BankDataController(_mockBankDataService.Object, _mockLogger.Object);
        
        // Setup claims for authenticated user
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim("SiteId", "100")
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task GetBankData_ValidDateRange_ReturnsData()
    {
        // Arrange
        var startDate = new DateTime(2024, 1, 1);
        var endDate = new DateTime(2024, 1, 31);
        var siteId = 100;
        
        var bankData = new List<BankDataDto>
        {
            new BankDataDto 
            { 
                Id = 1, 
                Date = startDate, 
                Amount = 1000.50m,
                Description = "Payment received"
            }
        };

        _mockBankDataService
            .Setup(x => x.GetBankDataAsync(siteId, startDate, endDate))
            .ReturnsAsync(bankData);

        // Act
        var result = await _controller.GetBankData(startDate, endDate);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedData = okResult.Value.Should().BeAssignableTo<IEnumerable<BankDataDto>>().Subject;
        returnedData.Should().HaveCount(1);
        returnedData.First().Amount.Should().Be(1000.50m);
    }

    [Theory]
    [InlineData("2024-12-31", "2024-01-01")] // End before start
    [InlineData("2022-01-01", "2022-01-02")] // More than 2 years ago
    public async Task GetBankData_InvalidDateRange_ReturnsBadRequest(
        string startDateStr, string endDateStr)
    {
        // Arrange
        var startDate = DateTime.Parse(startDateStr);
        var endDate = DateTime.Parse(endDateStr);

        // Act
        var result = await _controller.GetBankData(startDate, endDate);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }
}
```

## Service Layer Tests

### UserService Tests

```csharp
public class UserServiceTests
{
    private readonly Mock<IUserRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly Mock<ILogger<UserService>> _mockLogger;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly UserService _service;

    public UserServiceTests()
    {
        _mockRepository = new Mock<IUserRepository>();
        _mockMapper = new Mock<IMapper>();
        _mockLogger = new Mock<ILogger<UserService>>();
        _mockEmailService = new Mock<IEmailService>();
        
        _service = new UserService(
            _mockRepository.Object,
            _mockMapper.Object,
            _mockEmailService.Object,
            _mockLogger.Object
        );
    }

    [Fact]
    public async Task CreateUserAsync_ValidUser_ReturnsCreatedUser()
    {
        // Arrange
        var createDto = new CreateUserDto 
        { 
            Name = "John Doe", 
            Email = "john@example.com",
            SiteId = 1
        };
        
        var user = new User 
        { 
            Name = createDto.Name, 
            Email = createDto.Email,
            SiteId = createDto.SiteId
        };
        
        var createdUser = new User 
        { 
            Id = 1, 
            Name = user.Name, 
            Email = user.Email,
            SiteId = user.SiteId,
            CreatedDate = DateTime.UtcNow
        };
        
        var userDto = new UserDto 
        { 
            Id = createdUser.Id, 
            Name = createdUser.Name, 
            Email = createdUser.Email 
        };

        _mockMapper.Setup(x => x.Map<User>(createDto)).Returns(user);
        _mockRepository.Setup(x => x.EmailExistsAsync(createDto.Email)).ReturnsAsync(false);
        _mockRepository.Setup(x => x.CreateAsync(user)).ReturnsAsync(createdUser);
        _mockMapper.Setup(x => x.Map<UserDto>(createdUser)).Returns(userDto);

        // Act
        var result = await _service.CreateUserAsync(createDto);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be("john@example.com");
        
        // Verify welcome email was sent
        _mockEmailService.Verify(
            x => x.SendWelcomeEmailAsync(createDto.Email, createDto.Name),
            Times.Once
        );
    }

    [Fact]
    public async Task CreateUserAsync_DuplicateEmail_ThrowsValidationException()
    {
        // Arrange
        var createDto = new CreateUserDto 
        { 
            Email = "existing@example.com" 
        };

        _mockRepository
            .Setup(x => x.EmailExistsAsync(createDto.Email))
            .ReturnsAsync(true);

        // Act
        var act = () => _service.CreateUserAsync(createDto);

        // Assert
        await act.Should().ThrowAsync<ValidationException>()
                 .WithMessage("*email already exists*");
        
        _mockRepository.Verify(x => x.CreateAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task GetActiveUsersAsync_ReturnsOnlyActiveUsers()
    {
        // Arrange
        var siteId = 1;
        var activeUsers = new List<User>
        {
            new User { Id = 1, Name = "Active User 1", IsActive = true },
            new User { Id = 2, Name = "Active User 2", IsActive = true }
        };

        var userDtos = activeUsers.Select(u => new UserDto 
        { 
            Id = u.Id, 
            Name = u.Name 
        }).ToList();

        _mockRepository
            .Setup(x => x.GetActiveUsersBySiteAsync(siteId))
            .ReturnsAsync(activeUsers);
        
        _mockMapper
            .Setup(x => x.Map<IEnumerable<UserDto>>(activeUsers))
            .Returns(userDtos);

        // Act
        var result = await _service.GetActiveUsersAsync(siteId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(u => u.Name.Contains("Active"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task UpdateUserAsync_InvalidName_ThrowsValidationException(string invalidName)
    {
        // Arrange
        var updateDto = new UpdateUserDto { Id = 1, Name = invalidName };

        // Act
        var act = () => _service.UpdateUserAsync(updateDto);

        // Assert
        await act.Should().ThrowAsync<ValidationException>()
                 .WithMessage("*name*required*");
    }
}
```

### BankDataService Tests

```csharp
public class BankDataServiceTests
{
    private readonly Mock<IBankDataRepository> _mockRepository;
    private readonly Mock<IFileService> _mockFileService;
    private readonly Mock<ILogger<BankDataService>> _mockLogger;
    private readonly BankDataService _service;

    public BankDataServiceTests()
    {
        _mockRepository = new Mock<IBankDataRepository>();
        _mockFileService = new Mock<IFileService>();
        _mockLogger = new Mock<ILogger<BankDataService>>();
        
        _service = new BankDataService(
            _mockRepository.Object,
            _mockFileService.Object,
            _mockLogger.Object
        );
    }

    [Fact]
    public async Task ImportBankStatementAsync_ValidCsvFile_ImportsData()
    {
        // Arrange
        var siteId = 1;
        var csvContent = @"Date,Description,Amount
2024-01-01,Payment,1000.50
2024-01-02,Transfer,-500.25";
        
        var fileStream = new MemoryStream(Encoding.UTF8.GetBytes(csvContent));
        var formFile = new FormFile(fileStream, 0, fileStream.Length, "file", "statement.csv")
        {
            Headers = new HeaderDictionary(),
            ContentType = "text/csv"
        };

        var expectedRecords = new List<BankRecord>
        {
            new BankRecord { Date = new DateTime(2024, 1, 1), Description = "Payment", Amount = 1000.50m },
            new BankRecord { Date = new DateTime(2024, 1, 2), Description = "Transfer", Amount = -500.25m }
        };

        _mockFileService
            .Setup(x => x.ParseCsvAsync<BankRecord>(It.IsAny<Stream>()))
            .ReturnsAsync(expectedRecords);

        _mockRepository
            .Setup(x => x.BulkInsertAsync(siteId, It.IsAny<IEnumerable<BankRecord>>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.ImportBankStatementAsync(siteId, formFile);

        // Assert
        result.Should().NotBeNull();
        result.ImportedCount.Should().Be(2);
        result.Success.Should().BeTrue();
        
        _mockRepository.Verify(
            x => x.BulkInsertAsync(siteId, It.Is<IEnumerable<BankRecord>>(
                records => records.Count() == 2
            )),
            Times.Once
        );
    }

    [Fact]
    public async Task ReconcileBankDataAsync_MatchingTransactions_CreatesReconciliation()
    {
        // Arrange
        var siteId = 1;
        var date = new DateTime(2024, 1, 1);
        
        var bankTransactions = new List<BankTransaction>
        {
            new BankTransaction { Id = 1, Amount = 1000, Description = "Payment", Date = date },
            new BankTransaction { Id = 2, Amount = 500, Description = "Transfer", Date = date }
        };

        var systemTransactions = new List<SystemTransaction>
        {
            new SystemTransaction { Id = 1, Amount = 1000, Reference = "PAY001", Date = date },
            new SystemTransaction { Id = 2, Amount = 500, Reference = "TRF001", Date = date }
        };

        _mockRepository
            .Setup(x => x.GetBankTransactionsAsync(siteId, date, date))
            .ReturnsAsync(bankTransactions);
        
        _mockRepository
            .Setup(x => x.GetSystemTransactionsAsync(siteId, date, date))
            .ReturnsAsync(systemTransactions);

        // Act
        var result = await _service.ReconcileBankDataAsync(siteId, date);

        // Assert
        result.Should().NotBeNull();
        result.MatchedCount.Should().Be(2);
        result.UnmatchedBankCount.Should().Be(0);
        result.UnmatchedSystemCount.Should().Be(0);
        
        _mockRepository.Verify(
            x => x.SaveReconciliationAsync(It.IsAny<BankReconciliation>()),
            Times.Once
        );
    }

    [Fact]
    public async Task GetBankDataAsync_InvalidDateRange_ThrowsArgumentException()
    {
        // Arrange
        var siteId = 1;
        var startDate = new DateTime(2024, 12, 31);
        var endDate = new DateTime(2024, 1, 1); // End before start

        // Act
        var act = () => _service.GetBankDataAsync(siteId, startDate, endDate);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
                 .WithMessage("*start date*before*end date*");
    }
}
```

## Repository Tests

### UserRepository Integration Tests

```csharp
public class UserRepositoryTests : IDisposable
{
    private readonly CVSDbContext _context;
    private readonly UserRepository _repository;

    public UserRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<CVSDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new CVSDbContext(options);
        _repository = new UserRepository(_context);
        
        SeedTestData();
    }

    private void SeedTestData()
    {
        var users = new List<User>
        {
            new User 
            { 
                Id = 1, 
                Name = "John Doe", 
                Email = "john@example.com",
                SiteId = 1,
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-10)
            },
            new User 
            { 
                Id = 2, 
                Name = "Jane Smith", 
                Email = "jane@example.com",
                SiteId = 1,
                IsActive = false,
                CreatedDate = DateTime.UtcNow.AddDays(-5)
            },
            new User 
            { 
                Id = 3, 
                Name = "Bob Wilson", 
                Email = "bob@example.com",
                SiteId = 2,
                IsActive = true,
                CreatedDate = DateTime.UtcNow.AddDays(-3)
            }
        };

        _context.Users.AddRange(users);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetByEmailAsync_ExistingEmail_ReturnsUser()
    {
        // Act
        var user = await _repository.GetByEmailAsync("john@example.com");

        // Assert
        user.Should().NotBeNull();
        user.Name.Should().Be("John Doe");
        user.SiteId.Should().Be(1);
    }

    [Fact]
    public async Task GetByEmailAsync_NonExistentEmail_ReturnsNull()
    {
        // Act
        var user = await _repository.GetByEmailAsync("nonexistent@example.com");

        // Assert
        user.Should().BeNull();
    }

    [Fact]
    public async Task GetActiveUsersBySiteAsync_ReturnsOnlyActiveUsersForSite()
    {
        // Act
        var users = await _repository.GetActiveUsersBySiteAsync(1);

        // Assert
        users.Should().HaveCount(1);
        users.First().Name.Should().Be("John Doe");
        users.Should().OnlyContain(u => u.IsActive);
    }

    [Fact]
    public async Task CreateAsync_ValidUser_SavesAndReturnsUser()
    {
        // Arrange
        var newUser = new User
        {
            Name = "New User",
            Email = "new@example.com",
            SiteId = 1,
            IsActive = true
        };

        // Act
        var createdUser = await _repository.CreateAsync(newUser);

        // Assert
        createdUser.Should().NotBeNull();
        createdUser.Id.Should().BeGreaterThan(0);
        createdUser.CreatedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
        
        // Verify in database
        var userInDb = await _context.Users.FindAsync(createdUser.Id);
        userInDb.Should().NotBeNull();
        userInDb.Email.Should().Be("new@example.com");
    }

    [Fact]
    public async Task UpdateAsync_ExistingUser_UpdatesSuccessfully()
    {
        // Arrange
        var userId = 1;
        var user = await _repository.GetByIdAsync(userId);
        user.Name = "Updated Name";
        user.ModifiedDate = DateTime.UtcNow;

        // Act
        await _repository.UpdateAsync(user);

        // Assert
        var updatedUser = await _repository.GetByIdAsync(userId);
        updatedUser.Name.Should().Be("Updated Name");
        updatedUser.ModifiedDate.Should().NotBeNull();
    }

    [Fact]
    public async Task EmailExistsAsync_ExistingEmail_ReturnsTrue()
    {
        // Act
        var exists = await _repository.EmailExistsAsync("john@example.com");

        // Assert
        exists.Should().BeTrue();
    }

    [Fact]
    public async Task EmailExistsAsync_NonExistentEmail_ReturnsFalse()
    {
        // Act
        var exists = await _repository.EmailExistsAsync("nonexistent@example.com");

        // Assert
        exists.Should().BeFalse();
    }

    public void Dispose()
    {
        _context?.Dispose();
    }
}
```

## API Integration Tests

### UsersController Integration Tests

```csharp
public class UsersApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly string _baseUrl = "/api/users";

    public UsersApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                // Remove real database
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<CVSDbContext>));
                if (descriptor != null)
                    services.Remove(descriptor);

                // Add in-memory database
                services.AddDbContext<CVSDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                });

                // Mock external services
                services.AddTransient<IEmailService, MockEmailService>();
            });
        });

        _client = _factory.CreateClient();
        
        // Seed test data
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<CVSDbContext>();
        SeedDatabase(context);
    }

    private void SeedDatabase(CVSDbContext context)
    {
        if (context.Users.Any()) return;

        var users = new List<User>
        {
            new User 
            { 
                Id = 1, 
                Name = "Test User 1", 
                Email = "test1@example.com", 
                SiteId = 1,
                IsActive = true 
            },
            new User 
            { 
                Id = 2, 
                Name = "Test User 2", 
                Email = "test2@example.com", 
                SiteId = 1,
                IsActive = true 
            }
        };

        context.Users.AddRange(users);
        context.SaveChanges();
    }

    [Fact]
    public async Task GetUsers_ReturnsSuccessWithUsers()
    {
        // Act
        var response = await _client.GetAsync(_baseUrl);

        // Assert
        response.EnsureSuccessStatusCode();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var users = JsonSerializer.Deserialize<List<UserDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        users.Should().HaveCount(2);
        users.Should().Contain(u => u.Email == "test1@example.com");
    }

    [Fact]
    public async Task GetUser_ValidId_ReturnsUser()
    {
        // Act
        var response = await _client.GetAsync($"{_baseUrl}/1");

        // Assert
        response.EnsureSuccessStatusCode();
        
        var content = await response.Content.ReadAsStringAsync();
        var user = JsonSerializer.Deserialize<UserDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        user.Should().NotBeNull();
        user.Id.Should().Be(1);
        user.Name.Should().Be("Test User 1");
    }

    [Fact]
    public async Task GetUser_InvalidId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync($"{_baseUrl}/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateUser_ValidData_ReturnsCreated()
    {
        // Arrange
        var newUser = new CreateUserDto
        {
            Name = "New User",
            Email = "newuser@example.com",
            SiteId = 1
        };

        var json = JsonSerializer.Serialize(newUser);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync(_baseUrl, content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var createdUser = JsonSerializer.Deserialize<UserDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        createdUser.Should().NotBeNull();
        createdUser.Name.Should().Be("New User");
        createdUser.Email.Should().Be("newuser@example.com");
    }

    [Fact]
    public async Task CreateUser_InvalidData_ReturnsBadRequest()
    {
        // Arrange
        var invalidUser = new CreateUserDto
        {
            Name = "", // Invalid: empty name
            Email = "invalid-email" // Invalid: not a valid email
        };

        var json = JsonSerializer.Serialize(invalidUser);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync(_baseUrl, content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("validation");
    }

    [Fact]
    public async Task UpdateUser_ValidData_ReturnsOk()
    {
        // Arrange
        var updateUser = new UpdateUserDto
        {
            Id = 1,
            Name = "Updated User Name",
            Email = "updated@example.com"
        };

        var json = JsonSerializer.Serialize(updateUser);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync($"{_baseUrl}/1", content);

        // Assert
        response.EnsureSuccessStatusCode();
        
        // Verify the update
        var getResponse = await _client.GetAsync($"{_baseUrl}/1");
        var updatedContent = await getResponse.Content.ReadAsStringAsync();
        var user = JsonSerializer.Deserialize<UserDto>(updatedContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        user.Name.Should().Be("Updated User Name");
    }

    [Fact]
    public async Task DeleteUser_ValidId_ReturnsNoContent()
    {
        // Act
        var response = await _client.DeleteAsync($"{_baseUrl}/2");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        
        // Verify deletion
        var getResponse = await _client.GetAsync($"{_baseUrl}/2");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
```

## Authentication Tests

### JWT Token Service Tests

```csharp
public class TokenServiceTests
{
    private readonly Mock<IConfiguration> _mockConfig;
    private readonly TokenService _service;
    private const string TestSecretKey = "this-is-a-very-long-secret-key-for-testing-purposes-that-meets-minimum-requirements";

    public TokenServiceTests()
    {
        _mockConfig = new Mock<IConfiguration>();
        _mockConfig.Setup(x => x["Jwt:SecretKey"]).Returns(TestSecretKey);
        _mockConfig.Setup(x => x["Jwt:Issuer"]).Returns("TestIssuer");
        _mockConfig.Setup(x => x["Jwt:Audience"]).Returns("TestAudience");
        _mockConfig.Setup(x => x["Jwt:ExpiryInMinutes"]).Returns("60");
        
        _service = new TokenService(_mockConfig.Object);
    }

    [Fact]
    public void GenerateToken_ValidUser_ReturnsValidToken()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            Name = "Test User",
            Role = "User"
        };

        // Act
        var token = _service.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
        
        // Verify token structure
        var parts = token.Split('.');
        parts.Should().HaveCount(3); // Header.Payload.Signature
    }

    [Fact]
    public void ValidateToken_ValidToken_ReturnsClaimsPrincipal()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            Name = "Test User",
            Role = "Admin"
        };
        
        var token = _service.GenerateToken(user);

        // Act
        var principal = _service.ValidateToken(token);

        // Assert
        principal.Should().NotBeNull();
        principal.FindFirst(ClaimTypes.NameIdentifier)?.Value.Should().Be("1");
        principal.FindFirst(ClaimTypes.Email)?.Value.Should().Be("test@example.com");
        principal.FindFirst(ClaimTypes.Name)?.Value.Should().Be("Test User");
        principal.FindFirst(ClaimTypes.Role)?.Value.Should().Be("Admin");
    }

    [Fact]
    public void ValidateToken_ExpiredToken_ThrowsSecurityTokenExpiredException()
    {
        // Arrange
        _mockConfig.Setup(x => x["Jwt:ExpiryInMinutes"]).Returns("-1"); // Already expired
        var expiredTokenService = new TokenService(_mockConfig.Object);
        
        var user = new User { Id = 1, Email = "test@example.com" };
        var expiredToken = expiredTokenService.GenerateToken(user);

        // Act
        var act = () => _service.ValidateToken(expiredToken);

        // Assert
        act.Should().Throw<SecurityTokenExpiredException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("invalid.token")]
    [InlineData("invalid.token.format.extra")]
    public void ValidateToken_InvalidToken_ThrowsException(string invalidToken)
    {
        // Act
        var act = () => _service.ValidateToken(invalidToken);

        // Assert
        act.Should().Throw<Exception>();
    }
}
```

## Validation Tests

### User Validation Tests

```csharp
public class UserValidatorTests
{
    private readonly UserValidator _validator;

    public UserValidatorTests()
    {
        _validator = new UserValidator();
    }

    [Fact]
    public void Validate_ValidUser_PassesValidation()
    {
        // Arrange
        var user = new CreateUserDto
        {
            Name = "John Doe",
            Email = "john.doe@example.com",
            SiteId = 1
        };

        // Act
        var result = _validator.Validate(user);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_EmptyName_FailsValidation(string invalidName)
    {
        // Arrange
        var user = new CreateUserDto
        {
            Name = invalidName,
            Email = "john@example.com",
            SiteId = 1
        };

        // Act
        var result = _validator.Validate(user);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("@example.com")]
    [InlineData("user@")]
    [InlineData("user.example.com")]
    public void Validate_InvalidEmail_FailsValidation(string invalidEmail)
    {
        // Arrange
        var user = new CreateUserDto
        {
            Name = "Valid Name",
            Email = invalidEmail,
            SiteId = 1
        };

        // Act
        var result = _validator.Validate(user);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_InvalidSiteId_FailsValidation(int invalidSiteId)
    {
        // Arrange
        var user = new CreateUserDto
        {
            Name = "Valid Name",
            Email = "valid@example.com",
            SiteId = invalidSiteId
        };

        // Act
        var result = _validator.Validate(user);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "SiteId");
    }

    [Fact]
    public void Validate_NameTooLong_FailsValidation()
    {
        // Arrange
        var longName = new string('x', 101); // Assuming max length is 100
        var user = new CreateUserDto
        {
            Name = longName,
            Email = "valid@example.com",
            SiteId = 1
        };

        // Act
        var result = _validator.Validate(user);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => 
            e.PropertyName == "Name" && e.ErrorMessage.Contains("length"));
    }
}
```

## Test Data Builders

### User Builder Pattern

```csharp
public class UserBuilder
{
    private User _user = new User();

    public UserBuilder WithDefaults()
    {
        _user.Id = 1;
        _user.Name = "Test User";
        _user.Email = "test@example.com";
        _user.SiteId = 1;
        _user.IsActive = true;
        _user.CreatedDate = DateTime.UtcNow;
        _user.Role = "User";
        return this;
    }

    public UserBuilder WithId(int id)
    {
        _user.Id = id;
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

    public UserBuilder WithSiteId(int siteId)
    {
        _user.SiteId = siteId;
        return this;
    }

    public UserBuilder AsInactive()
    {
        _user.IsActive = false;
        return this;
    }

    public UserBuilder AsAdmin()
    {
        _user.Role = "Admin";
        return this;
    }

    public UserBuilder CreatedDaysAgo(int days)
    {
        _user.CreatedDate = DateTime.UtcNow.AddDays(-days);
        return this;
    }

    public User Build() => _user;

    public static implicit operator User(UserBuilder builder) => builder.Build();
}

// Usage in tests
[Fact]
public void TestWithBuilder()
{
    // Arrange
    var user = new UserBuilder()
        .WithDefaults()
        .AsAdmin()
        .CreatedDaysAgo(30)
        .Build();

    var inactiveUser = new UserBuilder()
        .WithDefaults()
        .AsInactive()
        .WithEmail("inactive@example.com");

    // Use in tests...
}
```

These examples demonstrate comprehensive testing patterns for a .NET Core application, covering controllers, services, repositories, integration tests, authentication, and validation with realistic scenarios suitable for the CVS project architecture.