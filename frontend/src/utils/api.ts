/**
 * HTTP Client with automatic JWT token attachment
 * Handles all API requests and includes authentication headers
 */

interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  /**
   * Get JWT token from localStorage
   */
  private getToken(): string | null {
    try {
      const authData = localStorage.getItem("auth");
      if (!authData) return null;

      const { token } = JSON.parse(authData);
      return token || null;
    } catch (error) {
      console.error("Error retrieving token from localStorage:", error);
      return null;
    }
  }

  /**
   * Build headers with JWT token if available
   */
  private getHeaders(headers: Record<string, string> = {}): HeadersInit {
    const token = this.getToken();

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    return defaultHeaders;
  }

  /**
   * Parse response and handle errors
   */
  private async parseResponse<T>(
    response: Response
  ): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");
    let data;

    try {
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (error) {
      console.error("Error parsing response:", error);
      data = null;
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" ? data?.error || data?.message : data;

      return {
        ok: false,
        status: response.status,
        error:
          errorMessage ||
          `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      ok: true,
      status: response.status,
      data,
    };
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: "GET",
        headers: this.getHeaders(headers),
        credentials: "include",
      });

      return this.parseResponse<T>(response);
    } catch (error) {
      console.error("GET request error:", error);
      return {
        ok: false,
        status: 0,
        error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: "POST",
        headers: this.getHeaders(headers),
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });

      return this.parseResponse<T>(response);
    } catch (error) {
      console.error("POST request error:", error);
      return {
        ok: false,
        status: 0,
        error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: "PUT",
        headers: this.getHeaders(headers),
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });

      return this.parseResponse<T>(response);
    } catch (error) {
      console.error("PUT request error:", error);
      return {
        ok: false,
        status: 0,
        error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: "DELETE",
        headers: this.getHeaders(headers),
        credentials: "include",
      });

      return this.parseResponse<T>(response);
    } catch (error) {
      console.error("DELETE request error:", error);
      return {
        ok: false,
        status: 0,
        error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: "PATCH",
        headers: this.getHeaders(headers),
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });

      return this.parseResponse<T>(response);
    } catch (error) {
      console.error("PATCH request error:", error);
      return {
        ok: false,
        status: 0,
        error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

// Export singleton instance
export const apiClient = new HttpClient("/api");

// Export class for testing or custom instances
export default HttpClient;
