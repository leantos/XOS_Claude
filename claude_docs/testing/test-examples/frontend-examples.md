# Frontend Testing Examples - Real-World React Tests

Practical examples of testing React components with TypeScript using Jest and React Testing Library, following patterns suitable for modern React applications.

## Table of Contents
- [Component Testing](#component-testing)
- [Custom Hook Testing](#custom-hook-testing)
- [Service Testing](#service-testing)
- [Integration Testing](#integration-testing)
- [Form Testing](#form-testing)
- [State Management Testing](#state-management-testing)

## Component Testing

### UserCard Component Tests

```typescript
// UserCard.tsx
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: Date;
}

interface UserCardProps {
  user: User;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onToggleActive?: (id: number, isActive: boolean) => void;
  showActions?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onToggleActive,
  showActions = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'bg-red-500' : 'bg-blue-500';
  };

  return (
    <div 
      className="user-card border rounded-lg p-4 shadow-sm"
      data-testid={`user-card-${user.id}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          <span 
            className={`inline-block px-2 py-1 rounded text-xs text-white ${getRoleBadgeColor(user.role)}`}
          >
            {user.role.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span 
            className={`px-2 py-1 rounded text-xs ${
              user.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} user details`}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t" data-testid="expanded-details">
          <p>
            <span className="font-medium">User ID:</span> {user.id}
          </p>
          <p>
            <span className="font-medium">Last Login:</span> {formatLastLogin(user.lastLogin)}
          </p>
        </div>
      )}

      {showActions && (
        <div className="mt-4 flex gap-2" data-testid="action-buttons">
          {onEdit && (
            <button
              onClick={() => onEdit(user.id)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Edit
            </button>
          )}
          
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(user.id, !user.isActive)}
              className={`px-3 py-1 text-white rounded text-sm ${
                user.isActive 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(user.id)}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from './UserCard';

const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  isActive: true,
  lastLogin: new Date('2024-01-15T10:30:00Z')
};

const mockAdminUser: User = {
  ...mockUser,
  id: 2,
  name: 'Jane Admin',
  email: 'jane@example.com',
  role: 'admin'
};

describe('UserCard', () => {
  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('USER')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays admin badge with correct styling for admin users', () => {
    render(<UserCard user={mockAdminUser} />);

    const adminBadge = screen.getByText('ADMIN');
    expect(adminBadge).toBeInTheDocument();
    expect(adminBadge).toHaveClass('bg-red-500');
  });

  it('displays user badge with correct styling for regular users', () => {
    render(<UserCard user={mockUser} />);

    const userBadge = screen.getByText('USER');
    expect(userBadge).toBeInTheDocument();
    expect(userBadge).toHaveClass('bg-blue-500');
  });

  it('shows inactive status for inactive users', () => {
    const inactiveUser = { ...mockUser, isActive: false };
    render(<UserCard user={inactiveUser} />);

    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toHaveClass('bg-gray-100');
  });

  it('toggles expanded state when expand button is clicked', async () => {
    const user = userEvent.setup();
    render(<UserCard user={mockUser} />);

    // Initially collapsed
    expect(screen.queryByTestId('expanded-details')).not.toBeInTheDocument();

    // Click to expand
    const expandButton = screen.getByLabelText('Expand user details');
    await user.click(expandButton);

    expect(screen.getByTestId('expanded-details')).toBeInTheDocument();
    expect(screen.getByText('User ID:')).toBeInTheDocument();
    expect(screen.getByText('Last Login:')).toBeInTheDocument();

    // Click to collapse
    const collapseButton = screen.getByLabelText('Collapse user details');
    await user.click(collapseButton);

    expect(screen.queryByTestId('expanded-details')).not.toBeInTheDocument();
  });

  it('formats last login date correctly', async () => {
    const user = userEvent.setup();
    render(<UserCard user={mockUser} />);

    await user.click(screen.getByLabelText('Expand user details'));

    // Check that date is formatted (exact format may vary by locale)
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
  });

  it('shows "Never" when user has not logged in', async () => {
    const userWithoutLogin = { ...mockUser, lastLogin: undefined };
    const user = userEvent.setup();
    
    render(<UserCard user={userWithoutLogin} />);

    await user.click(screen.getByLabelText('Expand user details'));

    expect(screen.getByText(/Never/)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const handleEdit = jest.fn();
    const user = userEvent.setup();

    render(<UserCard user={mockUser} onEdit={handleEdit} />);

    await user.click(screen.getByText('Edit'));

    expect(handleEdit).toHaveBeenCalledWith(1);
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const handleDelete = jest.fn();
    const user = userEvent.setup();

    render(<UserCard user={mockUser} onDelete={handleDelete} />);

    await user.click(screen.getByText('Delete'));

    expect(handleDelete).toHaveBeenCalledWith(1);
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleActive with correct parameters for active user', async () => {
    const handleToggleActive = jest.fn();
    const user = userEvent.setup();

    render(<UserCard user={mockUser} onToggleActive={handleToggleActive} />);

    await user.click(screen.getByText('Deactivate'));

    expect(handleToggleActive).toHaveBeenCalledWith(1, false);
  });

  it('calls onToggleActive with correct parameters for inactive user', async () => {
    const inactiveUser = { ...mockUser, isActive: false };
    const handleToggleActive = jest.fn();
    const user = userEvent.setup();

    render(<UserCard user={inactiveUser} onToggleActive={handleToggleActive} />);

    await user.click(screen.getByText('Activate'));

    expect(handleToggleActive).toHaveBeenCalledWith(1, true);
  });

  it('does not render action buttons when showActions is false', () => {
    render(
      <UserCard 
        user={mockUser} 
        onEdit={jest.fn()} 
        onDelete={jest.fn()} 
        showActions={false} 
      />
    );

    expect(screen.queryByTestId('action-buttons')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('does not render action buttons when no handlers are provided', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(screen.queryByText('Activate')).not.toBeInTheDocument();
  });

  it('has accessible expand/collapse button', () => {
    render(<UserCard user={mockUser} />);

    const button = screen.getByLabelText('Expand user details');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
```

### DataTable Component Tests

```typescript
// DataTable.tsx
interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  sortConfig?: { key: keyof T; direction: 'asc' | 'desc' };
}

const DataTable = <T extends { id: number | string }>({
  data,
  columns,
  loading = false,
  error,
  emptyMessage = 'No data available',
  onSort,
  sortConfig
}: DataTableProps<T>) => {
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;

    const direction = 
      sortConfig?.key === column.key && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    onSort(column.key, direction);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" 
        role="alert"
        data-testid="error"
      >
        Error: {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid="empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center">
                  {column.label}
                  {column.sortable && (
                    <span className="ml-2">
                      {sortConfig?.key === column.key ? (
                        sortConfig.direction === 'asc' ? '↑' : '↓'
                      ) : (
                        '↕'
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={item.id} data-testid={`table-row-${index}`}>
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key] ?? '')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// DataTable.test.tsx
interface TestUser {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const testUsers: TestUser[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'inactive',
    createdAt: new Date('2024-01-02')
  }
];

const columns: Column<TestUser>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  {
    key: 'status',
    label: 'Status',
    render: (status) => (
      <span className={status === 'active' ? 'text-green-600' : 'text-red-600'}>
        {status}
      </span>
    )
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    render: (date) => (date as Date).toLocaleDateString()
  }
];

describe('DataTable', () => {
  it('renders table with data correctly', () => {
    render(<DataTable data={testUsers} columns={columns} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    
    // Check that custom render function works
    expect(screen.getByText('active')).toHaveClass('text-green-600');
    expect(screen.getByText('inactive')).toHaveClass('text-red-600');
  });

  it('displays loading state', () => {
    render(<DataTable data={[]} columns={columns} loading={true} />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error message', () => {
    const errorMessage = 'Failed to load data';
    render(<DataTable data={[]} columns={columns} error={errorMessage} />);

    const errorElement = screen.getByTestId('error');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(`Error: ${errorMessage}`);
    expect(errorElement).toHaveAttribute('role', 'alert');
  });

  it('displays empty message when no data', () => {
    render(<DataTable data={[]} columns={columns} />);

    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('displays custom empty message', () => {
    const customMessage = 'No users found';
    render(<DataTable data={[]} columns={columns} emptyMessage={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders sortable columns with sort indicators', () => {
    render(<DataTable data={testUsers} columns={columns} />);

    // Name column is sortable
    expect(screen.getByText('Name').closest('th')).toHaveClass('cursor-pointer');
    expect(screen.getByText('Name').parentElement).toHaveTextContent('↕');
    
    // Email column is not sortable
    expect(screen.getByText('Email').closest('th')).not.toHaveClass('cursor-pointer');
  });

  it('calls onSort when sortable column header is clicked', async () => {
    const handleSort = jest.fn();
    const user = userEvent.setup();

    render(<DataTable data={testUsers} columns={columns} onSort={handleSort} />);

    await user.click(screen.getByText('Name'));

    expect(handleSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('toggles sort direction on subsequent clicks', async () => {
    const handleSort = jest.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <DataTable 
        data={testUsers} 
        columns={columns} 
        onSort={handleSort}
        sortConfig={{ key: 'name', direction: 'asc' }}
      />
    );

    // Should show ascending indicator
    expect(screen.getByText('Name').parentElement).toHaveTextContent('↑');

    await user.click(screen.getByText('Name'));

    expect(handleSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('does not call onSort for non-sortable columns', async () => {
    const handleSort = jest.fn();
    const user = userEvent.setup();

    render(<DataTable data={testUsers} columns={columns} onSort={handleSort} />);

    await user.click(screen.getByText('Email'));

    expect(handleSort).not.toHaveBeenCalled();
  });

  it('renders correct number of rows', () => {
    render(<DataTable data={testUsers} columns={columns} />);

    // Should have 2 data rows
    expect(screen.getAllByTestId(/table-row-/)).toHaveLength(2);
  });

  it('handles missing/null values gracefully', () => {
    const usersWithMissingData = [
      { ...testUsers[0], email: null as any },
      { ...testUsers[1], name: undefined as any }
    ];

    render(<DataTable data={usersWithMissingData} columns={columns} />);

    // Should not crash and display empty strings for missing values
    expect(screen.getByTestId('table-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('table-row-1')).toBeInTheDocument();
  });
});
```

## Custom Hook Testing

### useApi Hook Tests

```typescript
// useApi.ts
import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(errorMessage);
      throw error;
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    execute,
    retry,
  };
}

// useApi.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from './useApi';

describe('useApi', () => {
  it('executes API call immediately by default', async () => {
    const mockApiCall = jest.fn().mockResolvedValue({ id: 1, name: 'Test' });
    
    const { result } = renderHook(() => useApi(mockApiCall));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for API call to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, name: 'Test' });
    expect(result.current.error).toBeNull();
    expect(mockApiCall).toHaveBeenCalledTimes(1);
  });

  it('does not execute immediately when immediate is false', () => {
    const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });
    
    const { result } = renderHook(() => 
      useApi(mockApiCall, [], { immediate: false })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(mockApiCall).not.toHaveBeenCalled();
  });

  it('handles API errors correctly', async () => {
    const errorMessage = 'API Error';
    const mockApiCall = jest.fn().mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useApi(mockApiCall));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it('calls onSuccess callback when API call succeeds', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockApiCall = jest.fn().mockResolvedValue(mockData);
    const onSuccess = jest.fn();
    
    renderHook(() => useApi(mockApiCall, [], { onSuccess }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('calls onError callback when API call fails', async () => {
    const errorMessage = 'API Error';
    const mockApiCall = jest.fn().mockRejectedValue(new Error(errorMessage));
    const onError = jest.fn();
    
    renderHook(() => useApi(mockApiCall, [], { onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('executes manual API call using execute function', async () => {
    const mockApiCall = jest.fn().mockResolvedValue({ data: 'manual' });
    
    const { result } = renderHook(() => 
      useApi(mockApiCall, [], { immediate: false })
    );

    // Manually execute
    const promise = result.current.execute();

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ data: 'manual' });
    
    // Should return the result
    await expect(promise).resolves.toEqual({ data: 'manual' });
  });

  it('retries API call using retry function', async () => {
    const mockApiCall = jest.fn()
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValue({ data: 'retry success' });
    
    const { result } = renderHook(() => useApi(mockApiCall));

    // Wait for initial failure
    await waitFor(() => {
      expect(result.current.error).toBe('First error');
    });

    // Retry
    result.current.retry();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ data: 'retry success' });
    expect(result.current.error).toBeNull();
    expect(mockApiCall).toHaveBeenCalledTimes(2);
  });

  it('re-executes when dependencies change', async () => {
    const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });
    let userId = 1;
    
    const { rerender } = renderHook(({ userId }) => 
      useApi(() => mockApiCall(userId), [userId]), 
      { initialProps: { userId } }
    );

    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledWith(1);
    });

    // Change dependency
    userId = 2;
    rerender({ userId });

    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledWith(2);
    });

    expect(mockApiCall).toHaveBeenCalledTimes(2);
  });

  it('handles non-Error thrown values', async () => {
    const mockApiCall = jest.fn().mockRejectedValue('String error');
    
    const { result } = renderHook(() => useApi(mockApiCall));

    await waitFor(() => {
      expect(result.current.error).toBe('An error occurred');
    });
  });
});
```

### useLocalStorage Hook Tests

```typescript
// useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((prev: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback((value: SetValue<T>) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes in localStorage from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('initializes with initial value when localStorage is empty', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial-value')
    );

    expect(result.current[0]).toBe('initial-value');
  });

  it('initializes with value from localStorage if it exists', () => {
    localStorageMock.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial-value')
    );

    expect(result.current[0]).toBe('stored-value');
  });

  it('sets value in both state and localStorage', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify('new-value')
    );
  });

  it('handles function updates', () => {
    const { result } = renderHook(() => 
      useLocalStorage('counter', 0)
    );

    act(() => {
      result.current[1](prev => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'counter',
      JSON.stringify(1)
    );
  });

  it('removes value from localStorage and resets to initial', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    // Set a value first
    act(() => {
      result.current[1]('some-value');
    });

    // Then remove it
    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe('initial');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('handles complex objects', () => {
    const initialUser = { name: '', email: '' };
    const { result } = renderHook(() => 
      useLocalStorage('user', initialUser)
    );

    const newUser = { name: 'John', email: 'john@example.com' };

    act(() => {
      result.current[1](newUser);
    });

    expect(result.current[0]).toEqual(newUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify(newUser)
    );
  });

  it('handles localStorage errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'fallback')
    );

    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error reading localStorage key "test-key":',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('handles JSON parse errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    localStorageMock.getItem.mockReturnValue('invalid-json{');

    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'fallback')
    );

    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('updates when localStorage changes in another tab', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    // Simulate storage event from another tab
    act(() => {
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: JSON.stringify('updated-from-another-tab'),
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('updated-from-another-tab');
  });

  it('resets to initial value when storage event indicates removal', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    );

    // Set a value first
    act(() => {
      result.current[1]('some-value');
    });

    // Simulate removal from another tab
    act(() => {
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: null,
      });
      window.dispatchEvent(event);
    });

    expect(result.current[0]).toBe('initial');
  });
});
```

## Service Testing

### UserService Tests

```typescript
// userService.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

export class UserService {
  constructor(private apiClient: ApiClient) {}

  async getUsers(): Promise<User[]> {
    try {
      const response = await this.apiClient.get<User[]>('/users');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async getUser(id: number): Promise<User> {
    try {
      const response = await this.apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      if (error.status === 404) {
        throw new Error(`User with ID ${id} not found`);
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    this.validateUserData(userData);
    
    try {
      const response = await this.apiClient.post<User>('/users', userData);
      return response.data;
    } catch (error) {
      if (error.status === 409) {
        throw new Error('A user with this email already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    if (Object.keys(userData).length === 0) {
      throw new Error('No update data provided');
    }

    try {
      const response = await this.apiClient.put<User>(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      if (error.status === 404) {
        throw new Error(`User with ID ${id} not found`);
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await this.apiClient.delete(`/users/${id}`);
    } catch (error) {
      if (error.status === 404) {
        throw new Error(`User with ID ${id} not found`);
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const response = await this.apiClient.get<User[]>(`/users/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }

  private validateUserData(userData: CreateUserRequest): void {
    if (!userData.name?.trim()) {
      throw new Error('Name is required');
    }
    
    if (!userData.email?.trim()) {
      throw new Error('Email is required');
    }

    if (!this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    if (!['admin', 'user'].includes(userData.role)) {
      throw new Error('Invalid role. Must be either "admin" or "user"');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// userService.test.ts
import { UserService } from './userService';

const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

const mockUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', isActive: true },
  { id: 2, name: 'Jane Admin', email: 'jane@example.com', role: 'admin', isActive: true },
];

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(mockApiClient as any);
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('returns users successfully', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockUsers });

      const result = await userService.getUsers();

      expect(result).toEqual(mockUsers);
      expect(mockApiClient.get).toHaveBeenCalledWith('/users');
    });

    it('throws error when API call fails', async () => {
      const error = new Error('Network error');
      mockApiClient.get.mockRejectedValue(error);

      await expect(userService.getUsers()).rejects.toThrow(
        'Failed to fetch users: Network error'
      );
    });
  });

  describe('getUser', () => {
    it('returns user by ID successfully', async () => {
      const user = mockUsers[0];
      mockApiClient.get.mockResolvedValue({ data: user });

      const result = await userService.getUser(1);

      expect(result).toEqual(user);
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/1');
    });

    it('throws specific error for 404 responses', async () => {
      const error = { status: 404, message: 'Not found' };
      mockApiClient.get.mockRejectedValue(error);

      await expect(userService.getUser(999)).rejects.toThrow(
        'User with ID 999 not found'
      );
    });

    it('throws generic error for other failures', async () => {
      const error = { status: 500, message: 'Server error' };
      mockApiClient.get.mockRejectedValue(error);

      await expect(userService.getUser(1)).rejects.toThrow(
        'Failed to fetch user: Server error'
      );
    });
  });

  describe('createUser', () => {
    const validUserData: CreateUserRequest = {
      name: 'New User',
      email: 'new@example.com',
      role: 'user'
    };

    it('creates user successfully with valid data', async () => {
      const createdUser = { ...validUserData, id: 3, isActive: true };
      mockApiClient.post.mockResolvedValue({ data: createdUser });

      const result = await userService.createUser(validUserData);

      expect(result).toEqual(createdUser);
      expect(mockApiClient.post).toHaveBeenCalledWith('/users', validUserData);
    });

    it('throws error for duplicate email (409 response)', async () => {
      const error = { status: 409, message: 'Conflict' };
      mockApiClient.post.mockRejectedValue(error);

      await expect(userService.createUser(validUserData)).rejects.toThrow(
        'A user with this email already exists'
      );
    });

    it('validates required name field', async () => {
      const invalidData = { ...validUserData, name: '' };

      await expect(userService.createUser(invalidData)).rejects.toThrow(
        'Name is required'
      );
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it('validates required email field', async () => {
      const invalidData = { ...validUserData, email: '' };

      await expect(userService.createUser(invalidData)).rejects.toThrow(
        'Email is required'
      );
    });

    it('validates email format', async () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };

      await expect(userService.createUser(invalidData)).rejects.toThrow(
        'Invalid email format'
      );
    });

    it('validates role field', async () => {
      const invalidData = { ...validUserData, role: 'invalid' as any };

      await expect(userService.createUser(invalidData)).rejects.toThrow(
        'Invalid role. Must be either "admin" or "user"'
      );
    });
  });

  describe('updateUser', () => {
    it('updates user successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUsers[0], ...updateData };
      mockApiClient.put.mockResolvedValue({ data: updatedUser });

      const result = await userService.updateUser(1, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockApiClient.put).toHaveBeenCalledWith('/users/1', updateData);
    });

    it('throws error when no update data provided', async () => {
      await expect(userService.updateUser(1, {})).rejects.toThrow(
        'No update data provided'
      );
      expect(mockApiClient.put).not.toHaveBeenCalled();
    });

    it('throws specific error for 404 responses', async () => {
      const error = { status: 404, message: 'Not found' };
      mockApiClient.put.mockRejectedValue(error);

      await expect(
        userService.updateUser(999, { name: 'Test' })
      ).rejects.toThrow('User with ID 999 not found');
    });
  });

  describe('deleteUser', () => {
    it('deletes user successfully', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await userService.deleteUser(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/users/1');
    });

    it('throws specific error for 404 responses', async () => {
      const error = { status: 404, message: 'Not found' };
      mockApiClient.delete.mockRejectedValue(error);

      await expect(userService.deleteUser(999)).rejects.toThrow(
        'User with ID 999 not found'
      );
    });
  });

  describe('searchUsers', () => {
    it('searches users successfully', async () => {
      const searchResults = [mockUsers[0]];
      mockApiClient.get.mockResolvedValue({ data: searchResults });

      const result = await userService.searchUsers('john');

      expect(result).toEqual(searchResults);
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/search', {
        params: { q: 'john' }
      });
    });

    it('returns empty array for empty query', async () => {
      const result = await userService.searchUsers('');

      expect(result).toEqual([]);
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('returns empty array for whitespace-only query', async () => {
      const result = await userService.searchUsers('   ');

      expect(result).toEqual([]);
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('throws error when search fails', async () => {
      const error = new Error('Search failed');
      mockApiClient.get.mockRejectedValue(error);

      await expect(userService.searchUsers('john')).rejects.toThrow(
        'Failed to search users: Search failed'
      );
    });
  });
});
```

These examples demonstrate comprehensive testing patterns for React applications, covering component behavior, custom hooks, services, forms, and integration scenarios with realistic test cases suitable for modern React development.