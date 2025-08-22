# XOS Framework Testing Guide

A comprehensive guide for testing applications built with the XOS Component Framework, covering MVVM patterns, state management, and framework-specific utilities.

## Table of Contents
- [Overview](#overview)
- [Setup and Configuration](#setup-and-configuration)
- [Testing XOS Components](#testing-xos-components)
- [Testing ViewModels](#testing-viewmodels)
- [Mocking Framework Utilities](#mocking-framework-utilities)
- [State Management Testing](#state-management-testing)
- [Navigation and Context Testing](#navigation-and-context-testing)
- [Integration Testing](#integration-testing)
- [Real-World Examples](#real-world-examples)
- [Best Practices](#best-practices)

## Overview

The XOS framework introduces unique testing challenges due to its MVVM architecture, custom state management, and tightly integrated utilities. This guide provides patterns and examples for effectively testing XOS-based applications.

### Key Testing Considerations

1. **MVVM Pattern**: Components and ViewModels are separate but tightly coupled
2. **State Management**: Direct mutation with `this.Data` and manual `updateUI()` calls
3. **Framework Utilities**: `Utils.ajax`, `showMessageBox`, navigation methods
4. **Lifecycle Methods**: `onLoad`, `onClosing`, `onActive`, `onInactive`
5. **Context Dependencies**: Components rely on XOS context for navigation and messaging

## Setup and Configuration

### Required Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

### Jest Configuration for XOS

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^@/xos-components(.*)$': '<rootDir>/src/xos-components$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
};
```

### Setup File

```javascript
// setupTests.js
import '@testing-library/jest-dom';

// Mock XOS globals
global.XOSMessageboxTypes = {
  error: 'error',
  info: 'info',
  warning: 'warning',
  question: 'question',
  none: 'none'
};

// Mock window methods used by XOS
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

## Testing XOS Components

### Basic Component Test Structure

```javascript
// __tests__/MyComponent.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../modules/MyComponent';
import { MyComponentVM } from '../modules/MyComponentVM';

// Mock the ViewModel
jest.mock('../modules/MyComponentVM');

// Mock XOS context
const mockContext = {
  showMessageBox: jest.fn(),
  showWindow: jest.fn(),
  addTab: jest.fn(),
  close: jest.fn(),
  updateUI: jest.fn(),
};

// Helper to render with XOS context
const renderWithXOS = (component, vmData = {}) => {
  // Setup VM mock
  MyComponentVM.mockImplementation(() => ({
    Data: {
      Input: {},
      DataSource: [],
      ...vmData
    },
    onLoad: jest.fn(),
    save: jest.fn(),
    validate: jest.fn(() => true),
  }));

  // Render with context
  return render(
    <XOSContext.Provider value={mockContext}>
      {component}
    </XOSContext.Provider>
  );
};

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial UI correctly', () => {
    renderWithXOS(<MyComponent />);
    
    expect(screen.getByText('Component Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('calls onLoad when component mounts', () => {
    const mockVM = {
      onLoad: jest.fn(),
    };
    
    renderWithXOS(<MyComponent />, {}, mockVM);
    
    expect(mockVM.onLoad).toHaveBeenCalledTimes(1);
  });

  it('updates input fields and triggers updateUI', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithXOS(<MyComponent />);
    
    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'Test Value');
    
    // Verify updateUI was called
    await waitFor(() => {
      expect(mockContext.updateUI).toHaveBeenCalled();
    });
  });

  it('shows validation error when required fields are empty', async () => {
    const user = userEvent.setup();
    renderWithXOS(<MyComponent />, {
      Input: {
        Name: '',
        Description: ''
      }
    });
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    expect(mockContext.showMessageBox).toHaveBeenCalledWith({
      text: expect.stringContaining('required'),
      messageboxType: 'warning'
    });
  });
});
```

### Testing Component Lifecycle

```javascript
describe('XOS Component Lifecycle', () => {
  it('calls onActive when component becomes active', () => {
    const mockOnActive = jest.fn();
    
    class TestComponent extends XOSComponent {
      onActive() {
        mockOnActive();
      }
    }
    
    const { rerender } = render(<TestComponent isActive={false} />);
    rerender(<TestComponent isActive={true} />);
    
    expect(mockOnActive).toHaveBeenCalledTimes(1);
  });

  it('calls onClosing and prevents close when returning false', async () => {
    const mockOnClosing = jest.fn(() => false);
    
    class TestComponent extends XOSComponent {
      onClosing() {
        return mockOnClosing();
      }
    }
    
    const component = render(<TestComponent />);
    
    // Attempt to close
    const closeResult = component.unmount();
    
    expect(mockOnClosing).toHaveBeenCalled();
    // Component should still be mounted
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  it('calls destroy on unmount', () => {
    const mockDestroy = jest.fn();
    
    class TestComponent extends XOSComponent {
      destroy() {
        mockDestroy();
      }
    }
    
    const { unmount } = render(<TestComponent />);
    unmount();
    
    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });
});
```

## Testing ViewModels

### Basic ViewModel Test

```javascript
// __tests__/MyComponentVM.test.js
import { MyComponentVM } from '../modules/MyComponentVM';
import { Utils } from '../xos-components/Utils';

// Mock Utils
jest.mock('../xos-components/Utils', () => ({
  Utils: {
    ajax: jest.fn(),
    getMessage: jest.fn((code) => `Message ${code}`),
    isNullOrEmpty: jest.fn((val) => !val || val.trim() === ''),
    generateGUID: jest.fn(() => 'test-guid-123'),
  }
}));

describe('MyComponentVM ViewModel', () => {
  let vm;
  let mockComponent;

  beforeEach(() => {
    mockComponent = {
      updateUI: jest.fn(),
      showMessageBox: jest.fn(),
      close: jest.fn(),
      context: {
        showWindow: jest.fn(),
      }
    };
    
    vm = new MyComponentVM();
    vm.ComponentRef = mockComponent;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Initialization', () => {
    it('initializes with correct default data structure', () => {
      expect(vm.Data).toHaveProperty('Input');
      expect(vm.Data).toHaveProperty('DataSource');
      expect(vm.Data.Input).toEqual({
        Name: '',
        Description: '',
        Email: '',
        Phone: '',
        Address: '',
        IsActive: true
      });
    });
  });

  describe('onLoad', () => {
    it('loads initial data on component load', async () => {
      const mockItems = [
        { Id: 1, Name: 'Item 1' },
        { Id: 2, Name: 'Item 2' }
      ];
      
      Utils.ajax.mockImplementation((options, callback) => {
        callback({ IsValid: true, Data: mockItems });
      });

      await vm.onLoad();

      expect(Utils.ajax).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'api/items'
        }),
        expect.any(Function)
      );
      
      expect(vm.Data.DataSource).toEqual(mockItems);
      expect(mockComponent.updateUI).toHaveBeenCalled();
    });

    it('handles load error gracefully', async () => {
      Utils.ajax.mockImplementation((options, callback) => {
        callback({ IsValid: false, Message: 'Load failed' });
      });

      await vm.onLoad();

      expect(mockComponent.showMessageBox).toHaveBeenCalledWith({
        text: 'Load failed',
        messageboxType: 'error'
      });
    });
  });

  describe('save', () => {
    it('validates before saving', async () => {
      vm.Data.Input = {
        Name: '',
        Description: '',
      };

      await vm.save();

      expect(mockComponent.showMessageBox).toHaveBeenCalledWith({
        text: expect.stringContaining('required'),
        messageboxType: 'warning'
      });
      
      expect(Utils.ajax).not.toHaveBeenCalled();
    });

    it('saves valid data successfully', async () => {
      vm.Data.Input = {
        Name: 'Test Item',
        Description: 'Test Description',
        Email: 'test@example.com'
      };

      Utils.ajax.mockImplementation((options, callback) => {
        callback({ IsValid: true, Data: { Id: 1, ...vm.Data.Input } });
      });

      await vm.save();

      expect(Utils.ajax).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'api/save',
          data: vm.Data.Input
        }),
        expect.any(Function)
      );

      expect(mockComponent.showMessageBox).toHaveBeenCalledWith({
        text: 'Message 4', // Saved successfully
        messageboxType: 'info',
        onClose: expect.any(Function)
      });
    });

    it('handles save error', async () => {
      vm.Data.Input = {
        Name: 'Test Item',
        Description: 'Test Description'
      };

      Utils.ajax.mockImplementation((options, callback) => {
        callback({ IsValid: false, Message: 'Duplicate entry' });
      });

      await vm.save();

      expect(mockComponent.showMessageBox).toHaveBeenCalledWith({
        text: 'Duplicate entry',
        messageboxType: 'error'
      });
    });
  });

  describe('State Management', () => {
    it('updates state and triggers UI refresh', () => {
      vm.Data.Input.Name = 'New Name';
      vm.updateUI();

      expect(mockComponent.updateUI).toHaveBeenCalledTimes(1);
    });

    it('maintains state consistency during operations', async () => {
      const initialState = { ...vm.Data };
      
      vm.Data.Input.Name = 'Modified';
      expect(vm.Data.Input.Name).toBe('Modified');
      
      vm.resetForm();
      expect(vm.Data.Input.Name).toBe('');
    });
  });
});
```

## Mocking Framework Utilities

### Mocking Utils.ajax

```javascript
// __mocks__/xos-ajax.js
export const mockAjax = {
  success: (data) => {
    return jest.fn((options, callback) => {
      setTimeout(() => {
        callback({ IsValid: true, Data: data });
      }, 0);
    });
  },
  
  failure: (message) => {
    return jest.fn((options, callback) => {
      setTimeout(() => {
        callback({ IsValid: false, Message: message });
      }, 0);
    });
  },
  
  loading: () => {
    return jest.fn((options, callback) => {
      // Never calls callback - simulates loading state
    });
  },
  
  sequence: (...responses) => {
    let callCount = 0;
    return jest.fn((options, callback) => {
      const response = responses[callCount % responses.length];
      callCount++;
      setTimeout(() => {
        callback(response);
      }, 0);
    });
  }
};

// Usage in tests
import { mockAjax } from '../__mocks__/xos-ajax';

describe('Component with API calls', () => {
  it('handles successful API response', async () => {
    Utils.ajax = mockAjax.success({ id: 1, name: 'Test' });
    
    // Component will receive successful response
    renderWithXOS(<MyComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  it('handles API error', async () => {
    Utils.ajax = mockAjax.failure('Network error');
    
    renderWithXOS(<MyComponent />);
    
    await waitFor(() => {
      expect(mockContext.showMessageBox).toHaveBeenCalledWith({
        text: 'Network error',
        messageboxType: 'error'
      });
    });
  });

  it('handles sequence of API calls', async () => {
    Utils.ajax = mockAjax.sequence(
      { IsValid: true, Data: [] },  // First call - empty
      { IsValid: true, Data: [{ id: 1 }] }  // Second call - with data
    );
    
    const { rerender } = renderWithXOS(<MyComponent />);
    
    // First load
    await waitFor(() => {
      expect(screen.getByText('No data')).toBeInTheDocument();
    });
    
    // Trigger refresh
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await userEvent.click(refreshButton);
    
    // Second load
    await waitFor(() => {
      expect(screen.queryByText('No data')).not.toBeInTheDocument();
    });
  });
});
```

### Mocking showMessageBox

```javascript
// __mocks__/xos-messagebox.js
export const createMessageBoxMock = () => {
  const mock = jest.fn();
  
  mock.expectError = (text) => {
    expect(mock).toHaveBeenCalledWith({
      text,
      messageboxType: 'error',
      ...expect.any(Object)
    });
  };
  
  mock.expectSuccess = (text) => {
    expect(mock).toHaveBeenCalledWith({
      text,
      messageboxType: 'info',
      ...expect.any(Object)
    });
  };
  
  mock.expectConfirmation = (text) => {
    expect(mock).toHaveBeenCalledWith({
      text,
      messageboxType: 'question',
      buttons: expect.arrayContaining([
        expect.objectContaining({ text: expect.stringMatching(/yes/i) }),
        expect.objectContaining({ text: expect.stringMatching(/no/i) })
      ]),
      ...expect.any(Object)
    });
  };
  
  mock.simulateClose = (buttonValue) => {
    const lastCall = mock.mock.calls[mock.mock.calls.length - 1];
    if (lastCall && lastCall[0].onClose) {
      lastCall[0].onClose({ buttonValue });
    }
  };
  
  return mock;
};

// Usage
import { createMessageBoxMock } from '../__mocks__/xos-messagebox';

describe('Delete confirmation', () => {
  it('shows confirmation and deletes on Yes', async () => {
    const showMessageBox = createMessageBoxMock();
    mockContext.showMessageBox = showMessageBox;
    
    renderWithXOS(<MyComponent />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    // Verify confirmation dialog
    showMessageBox.expectConfirmation('Are you sure you want to delete?');
    
    // Simulate clicking Yes
    showMessageBox.simulateClose('yes');
    
    await waitFor(() => {
      expect(Utils.ajax).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'api/delete' }),
        expect.any(Function)
      );
    });
  });
});
```

## State Management Testing

### Testing Data Mutations and updateUI

```javascript
describe('XOS State Management', () => {
  let vm;
  let component;
  
  beforeEach(() => {
    vm = new TestVM();
    component = {
      updateUI: jest.fn(),
      setState: jest.fn(),
      _isUnmounted: false
    };
    vm.ComponentRef = component;
  });

  it('mutates data directly without setState', () => {
    const initialData = { ...vm.Data };
    
    vm.Data.Input.value = 'new value';
    
    // Data is mutated directly
    expect(vm.Data.Input.value).toBe('new value');
    // setState is not called
    expect(component.setState).not.toHaveBeenCalled();
  });

  it('triggers UI update through updateUI method', () => {
    vm.Data.Input.value = 'new value';
    vm.updateUI();
    
    expect(component.updateUI).toHaveBeenCalledTimes(1);
    // Component's updateUI will call setState({})
    expect(component.setState).toHaveBeenCalledWith({});
  });

  it('batches multiple data changes before single updateUI', () => {
    vm.Data.Input.field1 = 'value1';
    vm.Data.Input.field2 = 'value2';
    vm.Data.Input.field3 = 'value3';
    
    // Single updateUI call after all mutations
    vm.updateUI();
    
    expect(component.updateUI).toHaveBeenCalledTimes(1);
  });

  it('prevents updateUI when component is unmounted', () => {
    component._isUnmounted = true;
    
    vm.updateUI();
    
    expect(component.setState).not.toHaveBeenCalled();
  });

  it('maintains reference equality for nested objects', () => {
    const originalRef = vm.Data.DataSource;
    
    vm.Data.DataSource.push({ id: 1 });
    
    // Same reference, mutated in place
    expect(vm.Data.DataSource).toBe(originalRef);
  });
});
```

### Testing Complex State Operations

```javascript
describe('Complex State Operations', () => {
  it('handles grid data manipulation', async () => {
    const vm = new GridVM();
    vm.Data.GridData = [
      { id: 1, name: 'Item 1', selected: false },
      { id: 2, name: 'Item 2', selected: false },
      { id: 3, name: 'Item 3', selected: false }
    ];

    // Select all items
    vm.selectAll();
    
    expect(vm.Data.GridData.every(item => item.selected)).toBe(true);
    expect(component.updateUI).toHaveBeenCalledTimes(1);

    // Delete selected items
    vm.deleteSelected();
    
    expect(vm.Data.GridData).toHaveLength(0);
    expect(component.updateUI).toHaveBeenCalledTimes(2);
  });

  it('handles form state with validation', () => {
    const vm = new FormVM();
    
    // Set invalid data
    vm.Data.Input = {
      email: 'invalid-email',
      phone: '123'
    };
    
    const errors = vm.validate();
    
    expect(errors).toEqual({
      email: 'Invalid email format',
      phone: 'Phone must be 10 digits'
    });
    
    expect(vm.Data.Errors).toEqual(errors);
    expect(component.updateUI).toHaveBeenCalled();
  });

  it('handles async state updates', async () => {
    const vm = new AsyncVM();
    
    vm.loadData();
    
    // Loading state
    expect(vm.Data.loading).toBe(true);
    expect(component.updateUI).toHaveBeenCalledTimes(1);
    
    // Wait for async operation
    await waitFor(() => {
      expect(vm.Data.loading).toBe(false);
    });
    
    expect(vm.Data.items).toHaveLength(5);
    expect(component.updateUI).toHaveBeenCalledTimes(2);
  });
});
```

## Navigation and Context Testing

### Testing Navigation Methods

```javascript
describe('XOS Navigation', () => {
  let mockContext;
  
  beforeEach(() => {
    mockContext = {
      showWindow: jest.fn(),
      addTab: jest.fn(),
      close: jest.fn(),
      showMessageBox: jest.fn()
    };
  });

  it('opens window with correct parameters', async () => {
    const vm = new NavigationVM();
    vm.ComponentRef = { context: mockContext };
    
    vm.openDetails(123);
    
    expect(mockContext.showWindow).toHaveBeenCalledWith({
      url: 'modules/DetailView',
      data: { itemId: 123, mode: 'view' },
      style: 'slideRight',
      onClose: expect.any(Function)
    });
  });

  it('adds tab with data', () => {
    const vm = new TabVM();
    vm.ComponentRef = { context: mockContext };
    
    vm.openInNewTab('Report', { reportId: 1 });
    
    expect(mockContext.addTab).toHaveBeenCalledWith({
      title: 'Report',
      key: expect.stringMatching(/report-\d+/),
      url: 'Reports/Viewer',
      destroyOnHide: false,
      isClosable: true,
      data: { reportId: 1 }
    });
  });

  it('handles window close with result', async () => {
    const onCloseCallback = jest.fn();
    
    mockContext.showWindow.mockImplementation(({ onClose }) => {
      // Simulate window closing with result
      setTimeout(() => {
        onClose({ saved: true, id: 123 });
      }, 0);
    });
    
    const vm = new WindowVM();
    vm.ComponentRef = { context: mockContext };
    
    await vm.openEditWindow(onCloseCallback);
    
    await waitFor(() => {
      expect(onCloseCallback).toHaveBeenCalledWith({ saved: true, id: 123 });
    });
  });

  it('prevents navigation when form has unsaved changes', () => {
    const vm = new FormVM();
    vm.ComponentRef = { 
      context: mockContext,
      showMessageBox: mockContext.showMessageBox
    };
    
    vm.Data.isDirty = true;
    
    const canClose = vm.onClosing();
    
    expect(canClose).toBe(false);
    expect(mockContext.showMessageBox).toHaveBeenCalledWith({
      text: 'You have unsaved changes. Do you want to save?',
      messageboxType: 'question',
      buttons: expect.any(Array)
    });
  });
});
```

### Testing Context Provider

```javascript
// XOSContextProvider.test.js
import { render, screen } from '@testing-library/react';
import { XOSContextProvider, useXOSContext } from '../xos-components/XOSContext';

const TestComponent = () => {
  const context = useXOSContext();
  
  return (
    <div>
      <button onClick={() => context.showWindow({ url: 'test' })}>
        Open Window
      </button>
      <button onClick={() => context.addTab({ title: 'Test' })}>
        Add Tab
      </button>
    </div>
  );
};

describe('XOSContextProvider', () => {
  it('provides context methods to children', () => {
    const mockShowWindow = jest.fn();
    const mockAddTab = jest.fn();
    
    render(
      <XOSContextProvider 
        showWindow={mockShowWindow}
        addTab={mockAddTab}
      >
        <TestComponent />
      </XOSContextProvider>
    );
    
    const openButton = screen.getByText('Open Window');
    userEvent.click(openButton);
    
    expect(mockShowWindow).toHaveBeenCalledWith({ url: 'test' });
  });

  it('throws error when context is used outside provider', () => {
    // Suppress error output
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useXOSContext must be used within XOSContextProvider');
    
    spy.mockRestore();
  });
});
```

## Integration Testing

### Testing Complete Workflows

```javascript
describe('Data Management Workflow', () => {
  let mockContext;
  let mockUtils;
  
  beforeEach(() => {
    mockContext = {
      showWindow: jest.fn(),
      showMessageBox: createMessageBoxMock(),
      close: jest.fn()
    };
    
    mockUtils = {
      ajax: jest.fn(),
      getMessage: jest.fn(code => `Message ${code}`),
      isNullOrEmpty: jest.fn(val => !val)
    };
    
    Utils.ajax = mockUtils.ajax;
  });

  it('completes full CRUD workflow', async () => {
    const user = userEvent.setup();
    
    // 1. Render list component
    renderWithXOS(<DataList />, {
      DataSource: []
    });
    
    // 2. Click Add button to open form
    const addButton = screen.getByRole('button', { name: /add new/i });
    await user.click(addButton);
    
    expect(mockContext.showWindow).toHaveBeenCalledWith({
      url: 'modules/DataForm',
      data: { mode: 'add' },
      style: 'slideRight',
      onClose: expect.any(Function)
    });
    
    // 3. Simulate form window opening
    const { rerender } = renderWithXOS(<DataForm mode="add" />);
    
    // 4. Fill form
    await user.type(screen.getByLabelText('Code'), 'CODE001');
    await user.type(screen.getByLabelText('Name'), 'Test Item');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    
    // 5. Save
    mockUtils.ajax.mockImplementation((options, callback) => {
      callback({ 
        IsValid: true, 
        Data: { 
          Id: 1, 
          Code: 'CODE001',
          Name: 'Test Item' 
        } 
      });
    });
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // 6. Verify save API call
    expect(mockUtils.ajax).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'api/save',
        data: expect.objectContaining({
          Code: 'CODE001',
          Name: 'Test Item'
        })
      }),
      expect.any(Function)
    );
    
    // 7. Verify success message
    expect(mockContext.showMessageBox).toHaveBeenCalledWith({
      text: 'Message 4', // Saved successfully
      messageboxType: 'info',
      onClose: expect.any(Function)
    });
    
    // 8. Simulate closing form
    mockContext.showMessageBox.simulateClose();
    
    expect(mockContext.close).toHaveBeenCalledWith({
      Id: 1,
      Code: 'CODE001',
      Name: 'Test Item'
    });
  });

  it('handles validation workflow', async () => {
    const user = userEvent.setup();
    
    renderWithXOS(<DataForm mode="add" />);
    
    // Try to save without required fields
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // Should show validation message
    expect(mockContext.showMessageBox).toHaveBeenCalledWith({
      text: expect.stringContaining('required'),
      messageboxType: 'warning'
    });
    
    // Should not make API call
    expect(mockUtils.ajax).not.toHaveBeenCalled();
    
    // Fill required fields
    await user.type(screen.getByLabelText('Code'), 'CODE001');
    await user.type(screen.getByLabelText('Name'), 'Test');
    
    // Try save again
    await user.click(saveButton);
    
    // Now should make API call
    expect(mockUtils.ajax).toHaveBeenCalled();
  });
});
```

## Real-World Examples

### Testing a Transaction Module (CVST017)

```javascript
// CVST017.test.js - Purchase Order Module
describe('CVST017 - Purchase Order Module', () => {
  let vm;
  let component;
  
  beforeEach(() => {
    component = {
      updateUI: jest.fn(),
      showMessageBox: createMessageBoxMock(),
      context: {
        showWindow: jest.fn()
      }
    };
    
    vm = new CVST017VM();
    vm.ComponentRef = component;
  });

  describe('Purchase Order Creation', () => {
    it('calculates totals correctly when items are added', () => {
      vm.Data.Input.Items = [];
      
      // Add first item
      vm.addItem({
        ProductCode: 'PROD001',
        Description: 'Product 1',
        Quantity: 10,
        UnitPrice: 100,
        TaxRate: 10
      });
      
      expect(vm.Data.Input.Items).toHaveLength(1);
      expect(vm.Data.Input.Items[0].LineTotal).toBe(1000);
      expect(vm.Data.Input.Items[0].TaxAmount).toBe(100);
      expect(vm.Data.Input.Items[0].TotalWithTax).toBe(1100);
      
      // Add second item
      vm.addItem({
        ProductCode: 'PROD002',
        Description: 'Product 2',
        Quantity: 5,
        UnitPrice: 200,
        TaxRate: 10
      });
      
      // Check grand totals
      expect(vm.Data.Input.SubTotal).toBe(2000);
      expect(vm.Data.Input.TotalTax).toBe(200);
      expect(vm.Data.Input.GrandTotal).toBe(2200);
      
      expect(component.updateUI).toHaveBeenCalled();
    });

    it('validates purchase order before submission', () => {
      vm.Data.Input = {
        PONumber: '',
        VendorCode: '',
        Items: []
      };
      
      const isValid = vm.validatePurchaseOrder();
      
      expect(isValid).toBe(false);
      expect(component.showMessageBox).toHaveBeenCalledWith({
        text: expect.stringContaining('PO Number is required'),
        messageboxType: 'warning'
      });
    });

    it('generates PO number automatically', async () => {
      Utils.ajax = mockAjax.success({ PONumber: 'PO-2024-001' });
      
      await vm.generatePONumber();
      
      expect(Utils.ajax).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'PurchaseOrder/GenerateNumber'
        }),
        expect.any(Function)
      );
      
      expect(vm.Data.Input.PONumber).toBe('PO-2024-001');
      expect(component.updateUI).toHaveBeenCalled();
    });

    it('handles vendor selection', async () => {
      const vendor = {
        VendorCode: 'VEND001',
        VendorName: 'Test Vendor',
        PaymentTerms: 30
      };
      
      await vm.selectVendor(vendor);
      
      expect(vm.Data.Input.VendorCode).toBe('VEND001');
      expect(vm.Data.Input.VendorName).toBe('Test Vendor');
      expect(vm.Data.Input.PaymentTerms).toBe(30);
      
      // Should load vendor products
      expect(Utils.ajax).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'Vendor/GetProducts',
          data: { vendorCode: 'VEND001' }
        }),
        expect.any(Function)
      );
    });
  });

  describe('Purchase Order Workflow', () => {
    it('completes full PO creation workflow', async () => {
      // Setup initial data
      vm.Data.Input = {
        PONumber: 'PO-2024-001',
        VendorCode: 'VEND001',
        VendorName: 'Test Vendor',
        Items: [
          {
            ProductCode: 'PROD001',
            Quantity: 10,
            UnitPrice: 100,
            LineTotal: 1000
          }
        ],
        SubTotal: 1000,
        TotalTax: 100,
        GrandTotal: 1100
      };
      
      // Mock successful save
      Utils.ajax = mockAjax.success({ 
        Id: 123, 
        PONumber: 'PO-2024-001',
        Status: 'Draft'
      });
      
      // Save PO
      await vm.savePurchaseOrder();
      
      expect(Utils.ajax).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'PurchaseOrder/Save',
          data: expect.objectContaining({
            PONumber: 'PO-2024-001',
            GrandTotal: 1100
          })
        }),
        expect.any(Function)
      );
      
      // Should show success message
      expect(component.showMessageBox).toHaveBeenCalledWith({
        text: expect.stringContaining('saved'),
        messageboxType: 'info',
        onClose: expect.any(Function)
      });
      
      // Simulate approval workflow
      vm.Data.Input.Id = 123;
      vm.Data.Input.Status = 'Draft';
      
      await vm.submitForApproval();
      
      expect(Utils.ajax).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'PurchaseOrder/SubmitForApproval',
          data: { id: 123 }
        }),
        expect.any(Function)
      );
    });
  });
});
```

### Testing Grid Operations (CVSM005)

```javascript
// CVSM005.test.js - User Management Grid
describe('CVSM005 - User Management Grid', () => {
  it('handles grid selection and bulk operations', async () => {
    const vm = new CVSM005VM();
    const component = {
      updateUI: jest.fn(),
      showMessageBox: createMessageBoxMock()
    };
    vm.ComponentRef = component;
    
    // Load grid data
    vm.Data.GridData = [
      { Id: 1, UserName: 'user1', Selected: false, IsActive: true },
      { Id: 2, UserName: 'user2', Selected: false, IsActive: true },
      { Id: 3, UserName: 'user3', Selected: false, IsActive: false }
    ];
    
    // Select specific users
    vm.toggleSelection(0);
    vm.toggleSelection(2);
    
    expect(vm.Data.GridData[0].Selected).toBe(true);
    expect(vm.Data.GridData[2].Selected).toBe(true);
    
    // Perform bulk deactivate
    Utils.ajax = mockAjax.success({ UpdatedCount: 2 });
    
    await vm.bulkDeactivate();
    
    expect(Utils.ajax).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'api/bulkDeactivate',
        data: { ids: [1, 3] }
      }),
      expect.any(Function)
    );
    
    // Should refresh grid after operation
    expect(vm.Data.GridData[0].IsActive).toBe(false);
    expect(vm.Data.GridData[2].IsActive).toBe(false);
  });

  it('handles grid filtering and sorting', () => {
    const vm = new CVSM005VM();
    
    vm.Data.GridData = [
      { Id: 1, UserName: 'alice', Role: 'admin' },
      { Id: 2, UserName: 'bob', Role: 'user' },
      { Id: 3, UserName: 'charlie', Role: 'admin' }
    ];
    
    // Apply filter
    vm.applyFilter('role', 'admin');
    
    expect(vm.Data.FilteredData).toHaveLength(2);
    expect(vm.Data.FilteredData[0].UserName).toBe('alice');
    
    // Apply sort
    vm.sortBy('userName', 'desc');
    
    expect(vm.Data.FilteredData[0].UserName).toBe('charlie');
    expect(vm.Data.FilteredData[1].UserName).toBe('alice');
  });
});
```

## Best Practices

### 1. Test File Organization

```
__tests__/
├── components/
│   ├── CVSM001.test.js
│   └── CVST017.test.js
├── viewmodels/
│   ├── CVSM001VM.test.js
│   └── CVST017VM.test.js
├── integration/
│   └── workflows.test.js
├── utils/
│   └── test-helpers.js
└── __mocks__/
    ├── xos-ajax.js
    └── xos-messagebox.js
```

### 2. Common Test Utilities

```javascript
// test-helpers.js
export const createXOSTestEnvironment = () => {
  const context = {
    showMessageBox: createMessageBoxMock(),
    showWindow: jest.fn(),
    addTab: jest.fn(),
    close: jest.fn()
  };
  
  const utils = {
    ajax: jest.fn(),
    getMessage: jest.fn(code => `Message ${code}`),
    isNullOrEmpty: jest.fn(val => !val),
    formatDate: jest.fn(date => date?.toISOString()),
    generateGUID: jest.fn(() => 'test-guid')
  };
  
  const component = {
    updateUI: jest.fn(),
    setState: jest.fn(),
    context,
    showMessageBox: context.showMessageBox,
    _isUnmounted: false
  };
  
  return { context, utils, component };
};

// Usage
describe('Component Test', () => {
  let env;
  
  beforeEach(() => {
    env = createXOSTestEnvironment();
    Utils.ajax = env.utils.ajax;
  });
  
  it('test case', () => {
    const vm = new TestVM();
    vm.ComponentRef = env.component;
    // ... test implementation
  });
});
```

### 3. Testing Checklist

- [ ] Test component lifecycle methods (onLoad, onClosing, onActive)
- [ ] Test ViewModel data initialization
- [ ] Test state mutations and updateUI calls
- [ ] Test validation logic
- [ ] Test API integration with Utils.ajax
- [ ] Test user notifications with showMessageBox
- [ ] Test navigation flows
- [ ] Test error handling
- [ ] Test loading states
- [ ] Test cleanup/destroy methods

### 4. Common Pitfalls to Avoid

1. **Don't test XOS framework internals** - Focus on your business logic
2. **Mock framework utilities properly** - Utils.ajax, showMessageBox, etc.
3. **Handle async operations** - Use waitFor for API calls and state updates
4. **Test the ViewModel separately** - Don't always need full component render
5. **Clean up after tests** - Clear mocks, reset state, unmount components

### 5. Performance Optimization

```javascript
// Reuse expensive setup
describe('Heavy Component', () => {
  let vm;
  let mockData;
  
  // One-time setup
  beforeAll(() => {
    mockData = generateLargeDataset();
  });
  
  // Fresh VM for each test
  beforeEach(() => {
    vm = new HeavyVM();
    vm.Data.LargeDataset = [...mockData]; // Clone for isolation
  });
  
  // Cleanup
  afterEach(() => {
    vm.destroy();
    jest.clearAllMocks();
  });
});
```

## Debugging Tests

### Enable Verbose Logging

```javascript
// Add to test for debugging
describe('Debugging Test', () => {
  it('shows component state', () => {
    const vm = new TestVM();
    
    // Log state changes
    const originalUpdateUI = vm.updateUI;
    vm.updateUI = function() {
      console.log('State before update:', JSON.stringify(this.Data, null, 2));
      originalUpdateUI.call(this);
    };
    
    // Log API calls
    Utils.ajax = jest.fn((options, callback) => {
      console.log('API Call:', options.url, options.data);
      callback({ IsValid: true });
    });
    
    // Test implementation
  });
});
```

### Debug in VS Code

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug XOS Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": [
    "test",
    "--",
    "--runInBand",
    "--no-cache",
    "${relativeFile}"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Summary

Testing XOS framework applications requires understanding of:

1. **MVVM Architecture** - Test ViewModels and Components separately
2. **State Management** - Direct mutations with manual updateUI calls
3. **Framework Utilities** - Proper mocking of Utils.ajax and showMessageBox
4. **Lifecycle Methods** - Testing XOS-specific lifecycle hooks
5. **Context Integration** - Mocking navigation and messaging context

The key is to focus on testing business logic while properly mocking the framework's infrastructure. Use the patterns and utilities provided in this guide to write maintainable, reliable tests for your XOS applications.

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](./testing-best-practices.md)
- [Frontend Testing Guide](./frontend-testing-guide.md)
- [Backend Testing Guide](./backend-testing-guide.md)