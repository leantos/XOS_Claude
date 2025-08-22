import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentTemplate from './index';
import ComponentTemplateVM from './ComponentTemplateVM';

// Mock XOS components
jest.mock('../../../xos-components', () => ({
    XOSComponent: class {
        constructor(props, vm) {
            this.VM = vm;
        }
    },
    XOSTextbox: ({ name, value, onChange, placeholder, disabled }) => (
        <input
            name={name}
            value={value}
            onChange={(e) => onChange({ name, value: e.target.value })}
            placeholder={placeholder}
            disabled={disabled}
            data-testid={`textbox-${name}`}
        />
    ),
    XOSCombobox: ({ name, value, onChange, children, disabled }) => (
        <select
            name={name}
            value={value}
            onChange={(e) => onChange({ name, value: e.target.value })}
            disabled={disabled}
            data-testid={`combobox-${name}`}
        >
            {children}
        </select>
    ),
    XOSTextboxTypes: {
        textbox: 'textbox',
        password: 'password',
        email: 'email'
    }
}));

// Mock Utils
jest.mock('../../../xos-components/Utils', () => ({
    Utils: {
        ajax: jest.fn()
    }
}));

describe('ComponentTemplate', () => {
    let component;
    let vm;
    
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        
        // Create fresh instances
        vm = new ComponentTemplateVM();
        component = new ComponentTemplate();
        component.VM = vm;
        
        // Mock updateUI
        vm.updateUI = jest.fn();
    });
    
    describe('ViewModel Initialization', () => {
        it('should initialize Data properties without error', () => {
            // Should not throw "Cannot set property Data" error
            expect(() => new ComponentTemplateVM()).not.toThrow();
        });
        
        it('should set default values correctly', () => {
            const viewModel = new ComponentTemplateVM();
            
            expect(viewModel.Data.userName).toBe('');
            expect(viewModel.Data.email).toBe('');
            expect(viewModel.Data.password).toBe('');
            expect(viewModel.Data.isActive).toBe(false);
            expect(viewModel.Data.isLoading).toBe(false);
            expect(viewModel.Data.roles).toEqual([]);
        });
        
        it('should allow updating Data properties', () => {
            const model = vm.Data;
            
            model.userName = 'testuser';
            model.email = 'test@example.com';
            
            expect(vm.Data.userName).toBe('testuser');
            expect(vm.Data.email).toBe('test@example.com');
        });
    });
    
    describe('Component Rendering', () => {
        it('should render all form fields', () => {
            const { container } = render(<ComponentTemplate />);
            
            expect(container.querySelector('[name="userName"]')).toBeInTheDocument();
            expect(container.querySelector('[name="email"]')).toBeInTheDocument();
            expect(container.querySelector('[name="password"]')).toBeInTheDocument();
            expect(container.querySelector('[name="confirmPassword"]')).toBeInTheDocument();
            expect(container.querySelector('[name="firstName"]')).toBeInTheDocument();
            expect(container.querySelector('[name="lastName"]')).toBeInTheDocument();
        });
        
        it('should display error message when present', () => {
            vm.Data.errorMessage = 'Test error message';
            
            render(<ComponentTemplate />);
            
            expect(screen.getByText('Test error message')).toBeInTheDocument();
        });
        
        it('should display success message when present', () => {
            vm.Data.successMessage = 'Test success message';
            
            render(<ComponentTemplate />);
            
            expect(screen.getByText('Test success message')).toBeInTheDocument();
        });
    });
    
    describe('Event Handlers', () => {
        it('should handle input changes correctly', () => {
            const mockEvent = {
                name: 'userName',
                value: 'newuser'
            };
            
            component.handleInputChange(mockEvent);
            
            expect(vm.Data.userName).toBe('newuser');
            expect(vm.updateUI).toHaveBeenCalledTimes(1);
        });
        
        it('should handle checkbox changes correctly', () => {
            const mockEvent = {
                name: 'isActive',
                checked: true
            };
            
            component.handleCheckboxChange(mockEvent);
            
            expect(vm.Data.isActive).toBe(true);
            expect(vm.updateUI).toHaveBeenCalledTimes(1);
        });
        
        it('should handle select changes correctly', () => {
            const mockEvent = {
                name: 'selectedRole',
                value: 'admin'
            };
            
            component.handleSelectChange(mockEvent);
            
            expect(vm.Data.selectedRole).toBe('admin');
            expect(vm.updateUI).toHaveBeenCalledTimes(1);
        });
        
        it('should call updateUI after every state change', () => {
            component.handleInputChange({ name: 'userName', value: 'test1' });
            component.handleInputChange({ name: 'email', value: 'test@test.com' });
            component.handleCheckboxChange({ name: 'isActive', checked: true });
            
            expect(vm.updateUI).toHaveBeenCalledTimes(3);
        });
    });
    
    describe('Input Acceptance', () => {
        it('should accept keyboard input in text fields', () => {
            const { container } = render(<ComponentTemplate />);
            
            const userNameInput = container.querySelector('[name="userName"]');
            const emailInput = container.querySelector('[name="email"]');
            
            // Simulate typing
            fireEvent.change(userNameInput, { target: { value: 'testuser' } });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            
            // Verify the component's handler was called with correct values
            expect(userNameInput.value).toBe('testuser');
            expect(emailInput.value).toBe('test@example.com');
        });
        
        it('should accept input in password fields', () => {
            const { container } = render(<ComponentTemplate />);
            
            const passwordInput = container.querySelector('[name="password"]');
            const confirmInput = container.querySelector('[name="confirmPassword"]');
            
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.change(confirmInput, { target: { value: 'password123' } });
            
            expect(passwordInput.value).toBe('password123');
            expect(confirmInput.value).toBe('password123');
        });
    });
    
    describe('Form Validation', () => {
        it('should validate required fields', () => {
            const error = vm.validateForm();
            
            expect(error).toBe('Username is required');
        });
        
        it('should validate email format', () => {
            vm.Data.userName = 'testuser';
            vm.Data.email = 'invalid-email';
            
            const error = vm.validateForm();
            
            expect(error).toBe('Invalid email format');
        });
        
        it('should validate password length', () => {
            vm.Data.userName = 'testuser';
            vm.Data.email = 'test@example.com';
            vm.Data.password = 'short';
            
            const error = vm.validateForm();
            
            expect(error).toBe('Password must be at least 8 characters');
        });
        
        it('should validate password confirmation', () => {
            vm.Data.userName = 'testuser';
            vm.Data.email = 'test@example.com';
            vm.Data.password = 'password123';
            vm.Data.confirmPassword = 'different';
            
            const error = vm.validateForm();
            
            expect(error).toBe('Passwords do not match');
        });
        
        it('should return null for valid form', () => {
            vm.Data.userName = 'testuser';
            vm.Data.email = 'test@example.com';
            vm.Data.password = 'password123';
            vm.Data.confirmPassword = 'password123';
            
            const error = vm.validateForm();
            
            expect(error).toBeNull();
        });
    });
    
    describe('Form Submission', () => {
        it('should prevent submission with validation errors', async () => {
            const { Utils } = require('../../../xos-components/Utils');
            
            await vm.submit();
            
            expect(vm.Data.errorMessage).toBe('Username is required');
            expect(Utils.ajax).not.toHaveBeenCalled();
        });
        
        it('should submit valid form data', async () => {
            const { Utils } = require('../../../xos-components/Utils');
            Utils.ajax.mockResolvedValueOnce({ success: true });
            
            vm.Data.userName = 'testuser';
            vm.Data.email = 'test@example.com';
            vm.Data.password = 'password123';
            vm.Data.confirmPassword = 'password123';
            
            const result = await vm.submit();
            
            expect(Utils.ajax).toHaveBeenCalledWith({
                url: '/api/users/create',
                data: expect.objectContaining({
                    userName: 'testuser',
                    email: 'test@example.com'
                })
            });
            expect(result).toBe(true);
            expect(vm.Data.successMessage).toBe('User created successfully!');
        });
        
        it('should handle submission errors', async () => {
            const { Utils } = require('../../../xos-components/Utils');
            Utils.ajax.mockRejectedValueOnce(new Error('Network error'));
            
            vm.Data.userName = 'testuser';
            vm.Data.email = 'test@example.com';
            vm.Data.password = 'password123';
            vm.Data.confirmPassword = 'password123';
            
            const result = await vm.submit();
            
            expect(result).toBe(false);
            expect(vm.Data.errorMessage).toBe('Network error');
        });
    });
    
    describe('XOS Pattern Compliance', () => {
        it('should not throw "Cannot set property Data" error', () => {
            expect(() => {
                const testVM = new ComponentTemplateVM();
                const model = testVM.Data;
                model.userName = 'test';
            }).not.toThrow();
        });
        
        it('should use e.value not e.target.value in handlers', () => {
            const mockEvent = { name: 'userName', value: 'correct' };
            
            component.handleInputChange(mockEvent);
            
            expect(vm.Data.userName).toBe('correct');
        });
        
        it('should call updateUI after state changes', () => {
            component.handleInputChange({ name: 'userName', value: 'test' });
            
            expect(vm.updateUI).toHaveBeenCalled();
        });
        
        it('should have name prop on all XOS inputs', () => {
            const { container } = render(<ComponentTemplate />);
            
            const inputs = container.querySelectorAll('input[name], select[name]');
            
            expect(inputs.length).toBeGreaterThan(0);
            inputs.forEach(input => {
                expect(input.getAttribute('name')).toBeTruthy();
            });
        });
    });
});

describe('ComponentTemplate Integration Tests', () => {
    it('should complete full user creation flow', async () => {
        const { Utils } = require('../../../xos-components/Utils');
        Utils.ajax.mockResolvedValueOnce({ data: [
            { id: '1', name: 'Admin' },
            { id: '2', name: 'User' }
        ]});
        Utils.ajax.mockResolvedValueOnce({ success: true });
        
        const { container } = render(<ComponentTemplate />);
        
        // Fill out form
        fireEvent.change(container.querySelector('[name="userName"]'), {
            target: { value: 'newuser' }
        });
        fireEvent.change(container.querySelector('[name="email"]'), {
            target: { value: 'new@example.com' }
        });
        fireEvent.change(container.querySelector('[name="password"]'), {
            target: { value: 'password123' }
        });
        fireEvent.change(container.querySelector('[name="confirmPassword"]'), {
            target: { value: 'password123' }
        });
        
        // Submit form
        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText(/success/i)).toBeInTheDocument();
        });
    });
});