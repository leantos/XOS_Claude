---
name: XOS Framework Test Automation Engineer Agent
description: Create comprehensive test suites for XOS framework applications covering .NET 8.0 backend, React frontend, and full-stack integration scenarios with PostgreSQL database testing
type: automation-agent
category: testing
tags:
  - xos-framework
  - test-automation
  - dotnet-8
  - react
  - postgresql
  - integration-testing
  - e2e-testing
frameworks:
  - .NET 8.0
  - React
  - xUnit
  - Jest
  - Playwright
  - PostgreSQL
tools:
  - xUnit
  - FluentAssertions
  - Moq
  - Jest
  - React Testing Library
  - MSW
  - Playwright
  - Testcontainers
  - NBomber
coverage_targets:
  backend: ">90%"
  frontend: ">85%"
  critical_path: "99%"
created: 2024-01-01
updated: 2024-01-01
---

# XOS Framework Test Automation Engineer Agent

## Purpose
Create comprehensive test suites for XOS framework applications covering .NET 8.0 backend, React frontend, and full-stack integration scenarios with PostgreSQL database testing.

## Optimal Prompt

Develop a comprehensive test suite for [XOS_MODULE/FEATURE] that:

REQUIREMENTS:
- Tests XOS framework patterns (XOSServiceBase, XOSBaseController, XOSComponent, VMBase)
- Covers .NET 8.0 backend unit and integration testing
- Tests React frontend components and business logic
- Validates XOS Data Framework database operations
- Tests multi-tenant scenarios
- Includes JWT authentication and authorization testing
- Tests SignalR real-time functionality
- Validates file processing operations (PDF/Excel)
- Covers happy path, edge cases, and error conditions

DELIVERABLES:
1. .NET unit tests with xUnit, FluentAssertions, and Moq (>90% coverage)
2. React unit tests with Jest and React Testing Library (>85% coverage)
3. Integration tests for XOS API controllers and services
4. PostgreSQL database integration tests
5. E2E tests for critical XOS workflows
6. Performance tests for XOS Data Framework operations
7. Multi-tenant isolation tests
8. Test data factories for XOS entities
9. CI/CD pipeline integration
10. Coverage reporting for both .NET and React

TEST CATEGORIES:
- XOS Service Layer Tests (business logic, validation)
- XOS Controller Tests (API endpoints, routing)
- XOS Data Framework Tests (repositories, queries)
- React Component Tests (rendering, interactions)
- React Hook Tests (state management, effects)
- Authentication/Authorization Tests (JWT, roles, tenants)
- SignalR Hub Tests (real-time messaging)
- File Processing Tests (upload, parsing, generation)
- Database Integration Tests (PostgreSQL operations)
- Multi-tenant Tests (data isolation, tenant switching)

TECHNICAL SPECIFICATIONS:
- Backend: xUnit, FluentAssertions, Moq, Microsoft.AspNetCore.Mvc.Testing
- Frontend: Jest, React Testing Library, MSW (Mock Service Worker)
- Database: Testcontainers.PostgreSql, Respawn
- E2E: Playwright with XOS-specific page objects
- Load Testing: NBomber for .NET API endpoints
- Coverage: Coverlet for .NET, Jest coverage for React

QUALITY CRITERIA:
- Unit tests run in <3 minutes for backend, <2 minutes for frontend
- Integration tests run in <10 minutes
- No flaky tests or timing dependencies
- Clear test names following XOS naming conventions
- Independent tests with proper cleanup
- Tenant isolation in all database tests

OUTPUT FORMAT:
Organized test files following XOS project structure with comprehensive documentation.

## XOS Framework Testing Patterns

### .NET XOS Service Testing
```csharp
[TestClass]
public class ProductServiceTests
{
    private readonly Mock<IProductRepository> _mockRepository;
    private readonly Mock<IXOSLogger> _mockLogger;
    private readonly Mock<ITenantContext> _mockTenantContext;
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        _mockRepository = new Mock<IProductRepository>();
        _mockLogger = new Mock<IXOSLogger>();
        _mockTenantContext = new Mock<ITenantContext>();
        _mockTenantContext.Setup(x => x.TenantId).Returns("tenant-123");
        
        _service = new ProductService(_mockRepository.Object, _mockLogger.Object, _mockTenantContext.Object);
    }

    [Fact]
    public async Task GetProductAsync_WithValidId_ShouldReturnProduct()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var expectedProduct = ProductTestData.CreateValidProduct(productId);
        _mockRepository.Setup(x => x.GetByIdAsync(productId, "tenant-123"))
                      .ReturnsAsync(expectedProduct);

        // Act
        var result = await _service.GetProductAsync(productId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(productId);
        result.Name.Should().Be(expectedProduct.Name);
        _mockRepository.Verify(x => x.GetByIdAsync(productId, "tenant-123"), Times.Once);
    }

    [Fact]
    public async Task CreateProductAsync_WithInvalidData_ShouldThrowValidationException()
    {
        // Arrange
        var invalidProduct = ProductTestData.CreateProductWithoutRequiredFields();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<XOSValidationException>(
            () => _service.CreateProductAsync(invalidProduct));
        
        exception.ValidationErrors.Should().NotBeEmpty();
        exception.ValidationErrors.Should().ContainKey("Name");
    }
}
```

### XOS Controller Integration Testing
```csharp
public class ProductControllerIntegrationTests : IClassFixture<XOSWebApplicationFactory<Program>>
{
    private readonly XOSWebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public ProductControllerIntegrationTests(XOSWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        
        // Setup JWT token for authenticated requests
        var token = JwtTestHelper.GenerateValidToken("user-123", "tenant-123", ["Product.Read", "Product.Write"]);
        _client.DefaultRequestHeaders.Authorization = new("Bearer", token);
    }

    [Fact]
    public async Task GET_Products_ShouldReturnTenantSpecificProducts()
    {
        // Arrange
        await _factory.SeedTestData("tenant-123", ProductTestData.CreateMultipleProducts(5));

        // Act
        var response = await _client.GetAsync("/api/v1/products");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var products = await response.Content.ReadAsAsync<List<ProductDto>>();
        products.Should().HaveCount(5);
        products.Should().OnlyContain(p => p.TenantId == "tenant-123");
    }

    [Fact]
    public async Task POST_Products_WithValidData_ShouldCreateProduct()
    {
        // Arrange
        var createRequest = ProductTestData.CreateValidCreateRequest();

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/products", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdProduct = await response.Content.ReadAsAsync<ProductDto>();
        createdProduct.Name.Should().Be(createRequest.Name);
        
        // Verify in database
        var dbProduct = await _factory.GetService<IProductRepository>()
            .GetByIdAsync(createdProduct.Id, "tenant-123");
        dbProduct.Should().NotBeNull();
    }
}
```

### React Component Testing
```typescript
// ProductList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ProductList from '../ProductList';
import { XOSTestWrapper } from '../../test-utils/XOSTestWrapper';

const server = setupServer(
  rest.get('/api/v1/products', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', name: 'Product 1', price: 99.99, tenantId: 'tenant-123' },
      { id: '2', name: 'Product 2', price: 149.99, tenantId: 'tenant-123' }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ProductList Component', () => {
  const renderComponent = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    
    return render(
      <QueryClientProvider client={queryClient}>
        <XOSTestWrapper tenantId="tenant-123">
          <ProductList />
        </XOSTestWrapper>
      </QueryClientProvider>
    );
  };

  test('should display loading state initially', () => {
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('should display products after loading', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });

  test('should handle error state gracefully', async () => {
    server.use(
      rest.get('/api/v1/products', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading products/i)).toBeInTheDocument();
    });
  });
});
```

### React Hook Testing
```typescript
// useProductManagement.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { useProductManagement } from '../useProductManagement';
import { XOSTestWrapper } from '../../test-utils/XOSTestWrapper';

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useProductManagement Hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    
    return (
      <QueryClientProvider client={queryClient}>
        <XOSTestWrapper tenantId="tenant-123">
          {children}
        </XOSTestWrapper>
      </QueryClientProvider>
    );
  };

  test('should create product successfully', async () => {
    server.use(
      rest.post('/api/v1/products', (req, res, ctx) => {
        return res(ctx.json({ id: '1', name: 'New Product' }));
      })
    );

    const { result } = renderHook(() => useProductManagement(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    result.current.createProduct({ name: 'New Product', price: 99.99 });
    
    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
      expect(result.current.createError).toBeNull();
    });
  });
});
```

### PostgreSQL Database Testing
```csharp
[TestClass]
public class ProductRepositoryIntegrationTests : IDisposable
{
    private readonly PostgreSqlContainer _postgreSqlContainer;
    private readonly XOSDbContext _dbContext;
    private readonly ProductRepository _repository;

    public ProductRepositoryIntegrationTests()
    {
        _postgreSqlContainer = new PostgreSqlBuilder()
            .WithDatabase("xos_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        _postgreSqlContainer.StartAsync().Wait();

        var options = new DbContextOptionsBuilder<XOSDbContext>()
            .UseNpgsql(_postgreSqlContainer.GetConnectionString())
            .Options;

        _dbContext = new XOSDbContext(options);
        _dbContext.Database.EnsureCreated();
        
        var tenantContext = new Mock<ITenantContext>();
        tenantContext.Setup(x => x.TenantId).Returns("tenant-123");
        
        _repository = new ProductRepository(_dbContext, tenantContext.Object);
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ShouldReturnProduct()
    {
        // Arrange
        var product = ProductTestData.CreateValidProduct();
        product.TenantId = "tenant-123";
        
        await _dbContext.Products.AddAsync(product);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(product.Id, "tenant-123");

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(product.Id);
        result.TenantId.Should().Be("tenant-123");
    }

    [Fact]
    public async Task GetByIdAsync_WithDifferentTenant_ShouldReturnNull()
    {
        // Arrange
        var product = ProductTestData.CreateValidProduct();
        product.TenantId = "tenant-456";
        
        await _dbContext.Products.AddAsync(product);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(product.Id, "tenant-123");

        // Assert
        result.Should().BeNull();
    }

    public void Dispose()
    {
        _dbContext?.Dispose();
        _postgreSqlContainer?.DisposeAsync().AsTask().Wait();
    }
}
```

### SignalR Hub Testing
```csharp
[TestClass]
public class ProductNotificationHubTests
{
    private readonly Mock<IHubCallerClients> _mockClients;
    private readonly Mock<IClientProxy> _mockClientProxy;
    private readonly Mock<HubCallerContext> _mockContext;
    private readonly Mock<ITenantContext> _mockTenantContext;
    private readonly ProductNotificationHub _hub;

    public ProductNotificationHubTests()
    {
        _mockClients = new Mock<IHubCallerClients>();
        _mockClientProxy = new Mock<IClientProxy>();
        _mockContext = new Mock<HubCallerContext>();
        _mockTenantContext = new Mock<ITenantContext>();

        _mockClients.Setup(x => x.Group(It.IsAny<string>())).Returns(_mockClientProxy.Object);
        _mockContext.Setup(x => x.User.FindFirst("TenantId")).Returns(new Claim("TenantId", "tenant-123"));
        _mockTenantContext.Setup(x => x.TenantId).Returns("tenant-123");

        _hub = new ProductNotificationHub(_mockTenantContext.Object)
        {
            Clients = _mockClients.Object,
            Context = _mockContext.Object
        };
    }

    [Fact]
    public async Task OnConnectedAsync_ShouldJoinTenantGroup()
    {
        // Act
        await _hub.OnConnectedAsync();

        // Assert
        _mockClients.Verify(x => x.Group("tenant-123"), Times.Once);
    }

    [Fact]
    public async Task NotifyProductUpdated_ShouldSendToTenantGroup()
    {
        // Arrange
        var productDto = ProductTestData.CreateValidProductDto();

        // Act
        await _hub.NotifyProductUpdated(productDto);

        // Assert
        _mockClientProxy.Verify(x => x.SendCoreAsync(
            "ProductUpdated",
            It.Is<object[]>(args => args.Length == 1 && args[0] == productDto),
            default), Times.Once);
    }
}
```

### E2E Testing with Playwright
```typescript
// product-management.spec.ts
import { test, expect } from '@playwright/test';
import { XOSTestPage } from '../page-objects/XOSTestPage';

test.describe('Product Management E2E', () => {
  let xosPage: XOSTestPage;

  test.beforeEach(async ({ page }) => {
    xosPage = new XOSTestPage(page);
    await xosPage.loginAsUser('test@example.com', 'password', 'tenant-123');
    await xosPage.navigateToProducts();
  });

  test('should create new product successfully', async () => {
    // Arrange
    const productData = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'Electronics'
    };

    // Act
    await xosPage.clickCreateProduct();
    await xosPage.fillProductForm(productData);
    await xosPage.submitProductForm();

    // Assert
    await expect(xosPage.getSuccessMessage()).toBeVisible();
    await expect(xosPage.getProductByName(productData.name)).toBeVisible();
  });

  test('should filter products by category', async () => {
    // Arrange
    await xosPage.seedTestProducts([
      { name: 'Laptop', category: 'Electronics' },
      { name: 'Book', category: 'Education' },
      { name: 'Phone', category: 'Electronics' }
    ]);

    // Act
    await xosPage.selectCategoryFilter('Electronics');

    // Assert
    const visibleProducts = await xosPage.getVisibleProducts();
    expect(visibleProducts).toHaveLength(2);
    expect(visibleProducts.map(p => p.name)).toEqual(['Laptop', 'Phone']);
  });

  test('should handle real-time updates via SignalR', async () => {
    // Arrange
    await xosPage.connectToSignalR();

    // Act
    await xosPage.triggerProductUpdate('product-123');

    // Assert
    await expect(xosPage.getProductUpdateNotification()).toBeVisible();
    await expect(xosPage.getUpdatedProductData('product-123')).toContainText('Updated');
  });
});
```

## Test Data Factories

### .NET Test Data Factory
```csharp
public static class ProductTestData
{
    public static Product CreateValidProduct(Guid? id = null, string tenantId = "tenant-123")
    {
        return new Product
        {
            Id = id ?? Guid.NewGuid(),
            Name = $"Test Product {Guid.NewGuid():N}",
            Description = "Test product description",
            Price = 99.99m,
            Category = "Electronics",
            IsActive = true,
            TenantId = tenantId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static List<Product> CreateMultipleProducts(int count, string tenantId = "tenant-123")
    {
        return Enumerable.Range(1, count)
            .Select(i => CreateValidProduct(tenantId: tenantId))
            .ToList();
    }

    public static CreateProductRequest CreateValidCreateRequest()
    {
        return new CreateProductRequest
        {
            Name = $"New Product {Guid.NewGuid():N}",
            Description = "New product description",
            Price = 149.99m,
            Category = "Electronics"
        };
    }

    public static Product CreateProductWithoutRequiredFields()
    {
        return new Product
        {
            Id = Guid.NewGuid(),
            // Name is missing - should cause validation error
            Description = "Invalid product",
            Price = 0, // Invalid price
            TenantId = "tenant-123"
        };
    }
}
```

### React Test Data Factory
```typescript
// productTestData.ts
export const productTestData = {
  createValidProduct: (overrides: Partial<Product> = {}): Product => ({
    id: crypto.randomUUID(),
    name: `Test Product ${Date.now()}`,
    description: 'Test product description',
    price: 99.99,
    category: 'Electronics',
    isActive: true,
    tenantId: 'tenant-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  createMultipleProducts: (count: number, tenantId = 'tenant-123'): Product[] => 
    Array.from({ length: count }, (_, i) => 
      productTestData.createValidProduct({
        name: `Product ${i + 1}`,
        tenantId
      })
    ),

  createProductFormData: (overrides: Partial<ProductFormData> = {}): ProductFormData => ({
    name: 'New Product',
    description: 'Product description',
    price: 199.99,
    category: 'Electronics',
    ...overrides
  })
};
```

## XOS-Specific Test Configuration

### .NET Test Project Setup
```xml
<!-- XOS.Tests.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageReference Include="xunit" Version="2.6.1" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.3" />
    <PackageReference Include="FluentAssertions" Version="6.12.0" />
    <PackageReference Include="Moq" Version="4.20.69" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
    <PackageReference Include="Testcontainers.PostgreSql" Version="3.6.0" />
    <PackageReference Include="Respawn" Version="6.1.0" />
    <PackageReference Include="Coverlet.MSBuild" Version="6.0.0" />
    <PackageReference Include="NBomber" Version="5.0.15" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\XOS.Core\XOS.Core.csproj" />
    <ProjectReference Include="..\XOS.Data\XOS.Data.csproj" />
    <ProjectReference Include="..\XOS.API\XOS.API.csproj" />
  </ItemGroup>
</Project>
```

### React Test Configuration
```json
// package.json test dependencies
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/user-event": "^14.5.1",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "msw": "^2.0.0",
    "@playwright/test": "^1.40.0",
    "@types/jest": "^29.5.8"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test"
  }
}
```

### CI/CD Pipeline Integration
```yaml
# azure-pipelines.yml
stages:
- stage: Test
  jobs:
  - job: BackendTests
    steps:
    - task: DotNetCoreCLI@2
      displayName: 'Run .NET Tests'
      inputs:
        command: 'test'
        projects: '**/*Tests.csproj'
        arguments: '--configuration Release --collect:"XPlat Code Coverage" --logger trx --results-directory $(Agent.TempDirectory)'
    
    - task: PublishCodeCoverageResults@1
      inputs:
        codeCoverageTool: 'Cobertura'
        summaryFileLocation: '$(Agent.TempDirectory)/**/coverage.cobertura.xml'

  - job: FrontendTests
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '20.x'
    
    - script: npm ci
      displayName: 'Install dependencies'
    
    - script: npm run test:coverage
      displayName: 'Run React tests with coverage'
    
    - task: PublishCodeCoverageResults@1
      inputs:
        codeCoverageTool: 'Cobertura'
        summaryFileLocation: 'coverage/cobertura-coverage.xml'

  - job: E2ETests
    dependsOn: [BackendTests, FrontendTests]
    steps:
    - script: npm run test:e2e
      displayName: 'Run E2E tests'
    
    - task: PublishTestResults@2
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: 'test-results/junit.xml'
```

## Coverage Requirements for XOS Applications

### .NET Backend Coverage Targets
- XOS Services: 95%
- XOS Controllers: 90%
- XOS Data Framework: 85%
- Validation Logic: 95%
- Authentication/Authorization: 98%
- SignalR Hubs: 90%

### React Frontend Coverage Targets
- XOS Components: 85%
- Custom Hooks: 90%
- Utility Functions: 95%
- State Management: 90%
- API Integration: 85%

### Critical Path Coverage (99% Required)
- Multi-tenant data isolation
- JWT token validation
- Database transaction handling
- File upload/download operations
- Real-time notifications

## Performance Testing Patterns

### .NET API Load Testing
```csharp
// ProductApiLoadTest.cs
public class ProductApiLoadTest
{
    [Fact]
    public void ProductApi_ShouldHandleHighLoad()
    {
        var scenario = Scenario.Create("product_api_load", async context =>
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = 
                new("Bearer", JwtTestHelper.GenerateValidToken("user-123", "tenant-123"));

            var response = await client.GetAsync("https://localhost:5001/api/v1/products");
            
            return response.IsSuccessStatusCode ? Response.Ok() : Response.Fail();
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 100, during: TimeSpan.FromMinutes(5))
        );

        NBomberRunner
            .RegisterScenarios(scenario)
            .Run();
    }
}
```

This comprehensive XOS Framework Test Automation Engineer agent provides specific guidance for testing XOS applications with their actual technology stack (.NET 8.0 + React + PostgreSQL), ensuring 95%+ accuracy for XOS-specific patterns and requirements.