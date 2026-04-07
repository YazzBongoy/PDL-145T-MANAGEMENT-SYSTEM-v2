import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Frontend Test Data Factories
 */

export const createMockUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
  token: 'mock-token-123',
  ...overrides,
});

export const createMockAdminUser = (overrides = {}) =>
  createMockUser({ role: 'ADMIN', ...overrides });

export const createMockSupervisorUser = (overrides = {}) =>
  createMockUser({ role: 'SUPERVISOR', ...overrides });

export const createMockConstructionUser = (overrides = {}) =>
  createMockUser({ role: 'CONSTRUCTION', email: 'construction@example.com', ...overrides });

export const createMockFinanceUser = (overrides = {}) =>
  createMockUser({ role: 'FINANCE', email: 'finance@example.com', ...overrides });

export const createMockProject = (overrides = {}) => ({
  id: 1,
  name: 'Test Project',
  description: 'A test project',
  territory: 'INONGO',
  status: 'ACTIVE',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  supervisorId: 1,
  totalBudget: 100000,
  ...overrides,
});

export const createMockTask = (projectId = 1, overrides = {}) => ({
  id: 1,
  projectId,
  name: 'Test Task',
  description: 'A test task',
  assignedTo: 2,
  status: 'PENDING',
  priority: 'MEDIUM',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

export const createMockExpense = (projectId = 1, overrides = {}) => ({
  id: 1,
  projectId,
  description: 'Test Expense',
  amount: 1000,
  category: 'MATERIALS',
  date: new Date().toISOString(),
  approvalStatus: 'PENDING',
  ...overrides,
});

export const createMockResource = (projectId = 1, overrides = {}) => ({
  id: 1,
  projectId,
  name: 'Test Resource',
  type: 'EQUIPMENT',
  quantity: 5,
  unit: 'PIECE',
  status: 'AVAILABLE',
  ...overrides,
});

export const createMockMeasurement = (taskId = 1, overrides = {}) => ({
  id: 1,
  taskId,
  type: 'LENGTH',
  value: 10.5,
  unit: 'METER',
  date: new Date().toISOString(),
  recordedBy: 2,
  ...overrides,
});

/**
 * Mock API responses
 */

export const mockSuccessResponse = async (data: any) => ({
  ok: true,
  status: 200,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

export const mockErrorResponse = async (message: string, status = 400) => ({
  ok: false,
  status,
  json: async () => ({ error: message }),
  text: async () => message,
});

/**
 * Mock auth utilities
 */

export const setupAuthMocks = (user = createMockUser()) => {
  localStorage.getItem.mockImplementation((key: string) => {
    if (key === 'token') return user.token;
    if (key === 'user') return JSON.stringify(user);
    return null;
  });

  localStorage.setItem.mockImplementation(() => {});
  localStorage.removeItem.mockImplementation(() => {});
  localStorage.clear.mockImplementation(() => {});
};

export const clearAuthMocks = () => {
  localStorage.getItem.mockClear();
  localStorage.setItem.mockClear();
  localStorage.removeItem.mockClear();
};

/**
 * Mock fetch utilities
 */

export const setupFetchMock = (responses: Map<string, any>) => {
  global.fetch.mockImplementation((url: string, options = {}) => {
    const method = (options as any).method || 'GET';
    const key = `${method} ${url}`;

    if (responses.has(key)) {
      return Promise.resolve(responses.get(key));
    }

    return Promise.reject(new Error(`No mock response for ${key}`));
  });
};

export const setupFetchSuccess = (data: any) => {
  global.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => data,
  });
};

export const setupFetchError = (message: string, status = 400) => {
  global.fetch.mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error: message }),
  });
};

/**
 * Custom render with providers
 * Use this instead of React Testing Library's render function
 */

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Add any providers here (Redux, Context, etc.)
  return render(ui, { ...options });
};

/**
 * Assertion helpers
 */

export const expectLoginForm = (element: HTMLElement) => {
  expect(element.querySelector('input[type="email"]')).toBeDefined();
  expect(element.querySelector('input[type="password"]')).toBeDefined();
  expect(element.querySelector('button[type="submit"]')).toBeDefined();
};

export const expectProjectTable = (element: HTMLElement) => {
  expect(element.querySelector('table')).toBeDefined();
  expect(element.textContent).toMatch(/Name|Status|Territory/i);
};

export const expectErrorMessage = (container: HTMLElement, text: RegExp | string) => {
  const errorElement = container.querySelector('[role="alert"]');
  if (typeof text === 'string') {
    expect(errorElement?.textContent).toBe(text);
  } else {
    expect(errorElement?.textContent).toMatch(text);
  }
};

export const expectLoadingState = (container: HTMLElement) => {
  expect(container.querySelector('[aria-busy="true"]') || container.textContent).toMatch(/loading/i);
};

/**
 * Event helpers
 */

export const fillForm = async (container: HTMLElement, data: Record<string, string>) => {
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();

  for (const [field, value] of Object.entries(data)) {
    const input = container.querySelector(`input[name="${field}"]`) as HTMLInputElement;
    if (input) {
      await user.clear(input);
      await user.type(input, value);
    }
  }

  return user;
};

export const submitForm = async (container: HTMLElement) => {
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();
  const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;

  if (submitButton) {
    await user.click(submitButton);
  }

  return user;
};
