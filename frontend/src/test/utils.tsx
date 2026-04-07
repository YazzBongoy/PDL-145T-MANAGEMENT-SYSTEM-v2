import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { type User, UserRole, type Project, type Task, type Resource, type Expense, TaskStatus } from '../types';

// Test data factories
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: UserRole.USER,
  ...overrides,
});

export const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  ProjectID: 1,
  Name: 'Test Project',
  StartDate: '2024-01-01',
  EndDate: '2024-12-31',
  TotalBudget: 10000,
  ...overrides,
});

export const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  TaskID: 1,
  ProjectID: 1,
  Description: 'Test Task',
  Duration: 5,
  AssignedTo: 'Test User',
  CompletionStatus: TaskStatus.NOT_STARTED,
  ...overrides,
});

export const createMockResource = (overrides: Partial<Resource> = {}): Resource => ({
  ResourceID: 1,
  Type: 'Test Resource',
  Quantity: 10,
  ...overrides,
});

export const createMockExpense = (overrides: Partial<Expense> = {}): Expense => ({
  ExpenseID: 1,
  TaskID: 1,
  Description: 'Test Expense',
  Cost: 100,
  Date: '2024-01-01',
  ...overrides,
});

// Mock API responses
export const mockApiResponse = (data: unknown, options?: { ok?: boolean; status?: number }): Response => {
  const response = {
    ok: options?.ok ?? true,
    status: options?.status ?? 200,
    json: (): Promise<unknown> => Promise.resolve(data),
  };
  
  (global.fetch as any).mockResolvedValueOnce(response);
  return response as any;
};

export const mockApiError = (message: string, status: number = 400): Response => {
  const response = {
    ok: false,
    status,
    json: (): Promise<{ error: string }> => Promise.resolve({ error: message }),
  };
  
  (global.fetch as any).mockRejectedValueOnce(new Error(message));
  return response as any;
};

// Custom render function with default props
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any custom wrapper props here if needed
  placeholder?: never; // Temporary property to avoid empty interface
}

export const customRender = (
  ui: React.ReactElement,
  options?: CustomRenderOptions
): ReturnType<typeof render> => {
  return render(ui, options);
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

// Common test tokens
export const mockToken = 'mock-jwt-token';
export const mockUser = createMockUser();
export const mockAdminUser = createMockUser({ role: UserRole.ADMIN });
export const mockSupervisorUser = createMockUser({ role: UserRole.SUPERVISOR });
