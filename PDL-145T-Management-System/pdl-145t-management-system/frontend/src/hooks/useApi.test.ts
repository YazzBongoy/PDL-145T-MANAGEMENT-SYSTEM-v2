import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useApi, useMutation } from './useApi';
import { mockApiResponse, mockApiError } from '../test/utils';

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { message: 'success' };
    mockApiResponse(mockData);

    const { result } = renderHook(() => useApi('/api/test'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledWith('/api/test', { headers: {} });
  });

  it('should include authorization header when token is provided', async () => {
    const mockData = { message: 'success' };
    mockApiResponse(mockData);

    const { result } = renderHook(() => useApi('/api/test', 'test-token'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetch).toHaveBeenCalledWith('/api/test', {
      headers: { Authorization: 'Bearer test-token' },
    });
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Network error';
    mockApiError(errorMessage);

    const { result } = renderHook(() => useApi('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle HTTP errors', async () => {
    const response = {
      ok: false,
      status: 404,
      json: (): Promise<{ error: string }> => Promise.resolve({ error: 'Not found' }),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(response);

    const { result } = renderHook(() => useApi('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('HTTP error! status: 404');
  });

  it('should refetch data when refetch is called', async () => {
    const mockData = { message: 'success' };
    mockApiResponse(mockData);
    mockApiResponse({ message: 'refetched' });

    const { result } = renderHook(() => useApi('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);

    await result.current.refetch();

    expect(result.current.data).toEqual({ message: 'refetched' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should update when URL changes', async () => {
    const mockData1 = { message: 'url1' };
    const mockData2 = { message: 'url2' };
    mockApiResponse(mockData1);
    mockApiResponse(mockData2);

    const { result, rerender } = renderHook(
      ({ url }) => useApi(url),
      { initialProps: { url: '/api/test1' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData1);

    rerender({ url: '/api/test2' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('useMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should perform POST mutation successfully', async () => {
    const mockData = { id: 1, name: 'Created' };
    mockApiResponse(mockData);

    const { result } = renderHook(() => 
      useMutation('/api/test', 'POST', 'test-token')
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    const mutationData = { name: 'Test' };
    const response = await result.current.mutate(mutationData);

    expect(response).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify(mutationData),
    });
  });

  it('should perform PUT mutation successfully', async () => {
    const mockData = { id: 1, name: 'Updated' };
    mockApiResponse(mockData);

    const { result } = renderHook(() => 
      useMutation('/api/test/1', 'PUT', 'test-token')
    );

    const mutationData = { name: 'Updated' };
    const response = await result.current.mutate(mutationData);

    expect(response).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/api/test/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify(mutationData),
    });
  });

  it('should perform DELETE mutation successfully', async () => {
    const mockData = { success: true };
    mockApiResponse(mockData);

    const { result } = renderHook(() => 
      useMutation('/api/test/1', 'DELETE', 'test-token')
    );

    const response = await result.current.mutate();

    expect(response).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/api/test/1', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: undefined,
    });
  });

  it('should handle mutation errors', async () => {
    const errorMessage = 'Mutation failed';
    mockApiError(errorMessage);

    const { result } = renderHook(() => 
      useMutation('/api/test', 'POST')
    );

    await expect(result.current.mutate({ name: 'Test' })).rejects.toThrow(errorMessage);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle HTTP errors in mutations', async () => {
    const response = {
      ok: false,
      status: 400,
      json: (): Promise<{ error: string }> => Promise.resolve({ error: 'Bad request' }),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(response);

    const { result } = renderHook(() => 
      useMutation('/api/test', 'POST')
    );

    await expect(result.current.mutate({ name: 'Test' })).rejects.toThrow('HTTP error! status: 400');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('HTTP error! status: 400');
  });

  it('should work without token', async () => {
    const mockData = { id: 1 };
    mockApiResponse(mockData);

    const { result } = renderHook(() => 
      useMutation('/api/test', 'POST')
    );

    await result.current.mutate({ name: 'Test' });

    expect(fetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Test' }),
    });
  });
});
