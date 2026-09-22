import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as Storage;

// Cleanup after each test
afterEach(() => {
  cleanup();
  // resetAllMocks (not clearAllMocks) so queued mockResolvedValueOnce
  // implementations do not leak into the next test.
  vi.resetAllMocks();
});

// Re-establish global mocks before each test
beforeEach(() => {
  global.confirm = vi.fn(() => true);
  global.alert = vi.fn();
  global.fetch = vi.fn();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
  localStorageMock.removeItem.mockReset();
  localStorageMock.clear.mockReset();
  localStorageMock.key.mockReset();
});
