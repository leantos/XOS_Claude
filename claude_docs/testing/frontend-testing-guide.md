# Frontend Testing Guide - React with TypeScript

A comprehensive guide for testing React applications with TypeScript using Jest and React Testing Library.

## Table of Contents
- [Setup and Configuration](#setup-and-configuration)
- [Testing Fundamentals](#testing-fundamentals)
- [Component Testing](#component-testing)
- [Hook Testing](#hook-testing)
- [Async Testing](#async-testing)
- [Mocking Strategies](#mocking-strategies)
- [Integration Testing](#integration-testing)
- [Best Practices](#best-practices)

## Setup and Configuration

### 1. Install Testing Dependencies

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @testing-library/react-hooks \
  jest \
  ts-jest \
  @types/jest \
  jest-environment-jsdom \
  msw
```

### 2. Jest Configuration

**jest.config.js**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
};
```

### 3. Setup File

**src/setupTests.ts**:
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that we may add during the tests
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Testing Fundamentals

### Basic Component Test

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

### Query Priorities

React Testing Library recommends queries in this order:

```typescript
// 1. Queries accessible to everyone (preferred)
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByPlaceholderText(/search/i);
screen.getByText(/loading/i);

// 2. Semantic queries
screen.getByAltText(/profile picture/i);
screen.getByTitle(/close/i);

// 3. Test IDs (last resort)
screen.getByTestId('custom-element');
```

## Component Testing

### Testing Props and State

```typescript
interface UserCardProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div data-testid="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {user.role === 'admin' && <span>Admin</span>}
      
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      
      {isExpanded && (
        <div data-testid="user-details">
          <p>ID: {user.id}</p>
          <p>Role: {user.role}</p>
        </div>
      )}
      
      {onEdit && (
        <button onClick={() => onEdit(user.id)}>Edit</button>
      )}
      {onDelete && (
        <button onClick={() => onDelete(user.id)}>Delete</button>
      )}
    </div>
  );
};

// Tests
describe('UserCard', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user' as const,
  };

  it('renders user information', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('shows admin badge for admin users', () => {
    const adminUser = { ...mockUser, role: 'admin' as const };
    render(<UserCard user={adminUser} />);
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('toggles expanded state', async () => {
    const user = userEvent.setup();
    render(<UserCard user={mockUser} />);
    
    // Initially collapsed
    expect(screen.queryByTestId('user-details')).not.toBeInTheDocument();
    
    // Click to expand
    await user.click(screen.getByText('Expand'));
    expect(screen.getByTestId('user-details')).toBeInTheDocument();
    
    // Click to collapse
    await user.click(screen.getByText('Collapse'));
    expect(screen.queryByTestId('user-details')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const handleEdit = jest.fn();
    const user = userEvent.setup();
    
    render(<UserCard user={mockUser} onEdit={handleEdit} />);
    
    await user.click(screen.getByText('Edit'));
    expect(handleEdit).toHaveBeenCalledWith(1);
  });

  it('does not render action buttons when handlers are not provided', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
});
```

### Testing Forms

```typescript
interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <span id="password-error" role="alert">
            {errors.password}
          </span>
        )}
      </div>

      <button type="submit">Login</button>
    </form>
  );
};

// Tests
describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('shows validation errors for empty fields', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('shows error for short password', async () => {
    const handleSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'short');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
```

## Hook Testing

### Custom Hook Testing

```typescript
// useCounter.ts
import { useState, useCallback } from 'react';

interface UseCounterOptions {
  initialValue?: number;
  min?: number;
  max?: number;
}

export const useCounter = (options: UseCounterOptions = {}) => {
  const { initialValue = 0, min = -Infinity, max = Infinity } = options;
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(c => Math.min(c + 1, max));
  }, [max]);

  const decrement = useCallback(() => {
    setCount(c => Math.max(c - 1, min));
  }, [min]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const set = useCallback((value: number) => {
    setCount(Math.min(Math.max(value, min), max));
  }, [min, max]);

  return { count, increment, decrement, reset, set };
};

// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 10 }));
    expect(result.current.count).toBe(10);
  });

  it('increments counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('respects max value', () => {
    const { result } = renderHook(() => 
      useCounter({ initialValue: 5, max: 5 })
    );
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(5);
  });

  it('respects min value', () => {
    const { result } = renderHook(() => 
      useCounter({ initialValue: 0, min: 0 })
    );
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(0);
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() => 
      useCounter({ initialValue: 5 })
    );
    
    act(() => {
      result.current.increment();
      result.current.increment();
    });
    
    expect(result.current.count).toBe(7);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.count).toBe(5);
  });
});
```

### Testing Hooks with Context

```typescript
// AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// useAuth.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  it('throws error when used outside AuthProvider', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.error).toEqual(
      Error('useAuth must be used within AuthProvider')
    );
  });

  it('provides auth context', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('handles login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login('test@example.com', 'password');
    });
    
    await waitFor(() => {
      expect(result.current.user).toEqual({
        email: 'test@example.com',
        name: 'Test User',
      });
    });
  });
});
```

## Async Testing

### Testing API Calls

```typescript
// UserList.tsx
const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div role="alert">Error: {error}</div>;
  if (users.length === 0) return <div>No users found</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

// UserList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { UserList } from './UserList';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserList', () => {
  it('displays loading state initially', () => {
    render(<UserList />);
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('displays users after successful fetch', async () => {
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Loading users...')).not.toBeInTheDocument();
  });

  it('displays error message on fetch failure', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error: Failed to fetch');
    });
  });

  it('displays message when no users are returned', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );

    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });
});
```

### Testing Timers and Delays

```typescript
// Notification.tsx
const Notification: React.FC<{ message: string; duration?: number }> = ({ 
  message, 
  duration = 3000 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div role="alert" className="notification">
      {message}
    </div>
  );
};

// Notification.test.tsx
describe('Notification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('displays message', () => {
    render(<Notification message="Test notification" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Test notification');
  });

  it('disappears after default duration', () => {
    render(<Notification message="Test" />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('respects custom duration', () => {
    render(<Notification message="Test" duration={5000} />);
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
```

## Mocking Strategies

### MSW (Mock Service Worker) Setup

```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ])
    );
  }),

  rest.post('/api/login', async (req, res, ctx) => {
    const { email, password } = await req.json();
    
    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.json({
          token: 'fake-jwt-token',
          user: { email, name: 'Test User' },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ message: 'Invalid credentials' })
    );
  }),

  rest.delete('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ success: true, deletedId: id }));
  }),
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Module Mocking

```typescript
// Mocking a module
jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mocking with implementation
jest.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn((flag: string) => {
    const flags: Record<string, boolean> = {
      'new-feature': true,
      'experimental': false,
    };
    return flags[flag] ?? false;
  }),
}));

// Partial mocking
jest.mock('@/utils', () => ({
  ...jest.requireActual('@/utils'),
  formatDate: jest.fn(() => '2024-01-01'),
}));
```

### Mocking Context and Providers

```typescript
// Test utilities
const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({ reducer: rootReducer, preloadedState }),
    ...renderOptions
  } = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          {children}
        </Router>
      </ThemeProvider>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Usage in tests
describe('Component with providers', () => {
  it('renders with custom store state', () => {
    const preloadedState = {
      user: { isAuthenticated: true, name: 'Test User' },
    };
    
    const { store } = renderWithProviders(<Dashboard />, { preloadedState });
    
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
  });
});
```

## Integration Testing

### Testing Component Interactions

```typescript
// TodoApp integration test
describe('TodoApp Integration', () => {
  it('completes full todo workflow', async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    
    // Add a todo
    const input = screen.getByPlaceholderText(/add a todo/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await user.type(input, 'Write tests');
    await user.click(addButton);
    
    // Verify todo appears
    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(input).toHaveValue('');
    
    // Mark as complete
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(checkbox).toBeChecked();
    expect(screen.getByText('Write tests')).toHaveStyle({
      textDecoration: 'line-through',
    });
    
    // Filter completed todos
    const filterButton = screen.getByRole('button', { name: /active/i });
    await user.click(filterButton);
    
    expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
    
    // Delete todo
    await user.click(screen.getByRole('button', { name: /all/i }));
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
  });
});
```

### Testing with React Router

```typescript
// Testing navigation
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe('Navigation', () => {
  it('navigates to user profile', async () => {
    const user = userEvent.setup();
    
    renderWithRouter(
      <Routes>
        <Route path="/" element={<UserList />} />
        <Route path="/users/:id" element={<UserProfile />} />
      </Routes>
    );
    
    // Click on a user link
    await user.click(screen.getByRole('link', { name: /john doe/i }));
    
    // Verify navigation occurred
    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

## Best Practices

### 1. Test Organization

```typescript
// Organize tests by feature/component
describe('UserDashboard', () => {
  describe('when user is authenticated', () => {
    beforeEach(() => {
      // Setup authenticated state
    });

    it('displays user information', () => {});
    it('shows personalized content', () => {});
    
    describe('when user has admin role', () => {
      it('displays admin controls', () => {});
    });
  });

  describe('when user is not authenticated', () => {
    it('redirects to login', () => {});
  });
});
```

### 2. Custom Render Functions

```typescript
// test-utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const testQueryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### 3. Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<LoginForm onSubmit={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper ARIA attributes', () => {
    render(<Modal isOpen title="Confirm" />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
```

### 4. Snapshot Testing

```typescript
describe('Button', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <Button variant="primary" size="large">
        Click me
      </Button>
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });

  // More focused snapshot
  it('matches inline snapshot', () => {
    const { container } = render(<Button>Test</Button>);
    
    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="btn btn-default"
        type="button"
      >
        Test
      </button>
    `);
  });
});
```

### 5. Testing Error Boundaries

```typescript
// ErrorBoundary.test.tsx
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for this test
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('catches errors and displays fallback', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.queryByText('No error')).not.toBeInTheDocument();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
  });
});
```

## Common Patterns and Anti-Patterns

### ✅ Good Practices

```typescript
// Good: Testing user behavior
it('submits form when user fills all fields', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  render(<ContactForm onSubmit={onSubmit} />);
  
  await user.type(screen.getByLabelText(/name/i), 'John');
  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(onSubmit).toHaveBeenCalledWith({
    name: 'John',
    email: 'john@example.com',
  });
});

// Good: Using semantic queries
const button = screen.getByRole('button', { name: /save/i });
const input = screen.getByLabelText(/username/i);

// Good: Waiting for async operations
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

### ❌ Anti-Patterns to Avoid

```typescript
// Bad: Testing implementation details
it('sets state correctly', () => {
  // Don't test state directly
  expect(component.state.isOpen).toBe(true);
});

// Bad: Using container queries
const button = container.querySelector('.btn-primary');

// Bad: Testing internals
it('calls internal method', () => {
  const instance = wrapper.instance();
  instance.handleClick(); // Don't test private methods
});

// Bad: Overusing test IDs
const element = screen.getByTestId('my-element');
// Prefer semantic queries instead
```

## Performance Optimization

### 1. Optimize Test Setup

```typescript
// Share expensive setup between tests
describe('ExpensiveComponent', () => {
  let expensiveData: any;

  beforeAll(async () => {
    // Expensive one-time setup
    expensiveData = await generateLargeDataset();
  });

  beforeEach(() => {
    // Cheap per-test setup
    jest.clearAllMocks();
  });

  // Tests use shared expensiveData
});
```

### 2. Use `screen` for Queries

```typescript
// Good: Using screen (no need to destructure)
import { render, screen } from '@testing-library/react';

render(<Component />);
const element = screen.getByText(/hello/i);

// Less optimal: Destructuring from render
const { getByText } = render(<Component />);
const element = getByText(/hello/i);
```

## Summary

Key takeaways for effective React testing:

1. **Test user behavior** - Focus on how users interact with components
2. **Use Testing Library queries properly** - Follow the priority guidelines
3. **Keep tests maintainable** - Avoid testing implementation details
4. **Mock strategically** - Use MSW for API mocking
5. **Test accessibility** - Ensure components are accessible
6. **Write clear test names** - They serve as documentation
7. **Use proper async patterns** - waitFor, findBy queries
8. **Organize tests well** - Group related tests with describe blocks

Remember: The more your tests resemble the way your software is used, the more confidence they can give you!