// Prefer internal URL on server-side (SSR) to bypass CORS and use Docker network,
// and use a local proxy path in the browser during development to avoid CORS.
const publicBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const baseUrl = typeof window === 'undefined'
  ? (process.env.API_URL_INTERNAL || publicBase)
  : '/api'

export class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token')
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: { ...this.getHeaders(), ...(data ? { 'Content-Type': 'application/json' } : {}) },
      ...(data && { body: JSON.stringify(data) }),
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    if (response.status === 204) {
      // No Content
      return undefined as unknown as T
    }
    // Some delete endpoints may return JSON confirmation
    const text = await response.text()
    try {
      return JSON.parse(text)
    } catch {
      return undefined as unknown as T
    }
  }
}

export const apiClient = new ApiClient()
