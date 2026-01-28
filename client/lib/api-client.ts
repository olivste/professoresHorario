// Prefer internal URL on server-side (SSR) to bypass CORS and use Docker network,
// and use a local proxy path in the browser during development to avoid CORS.
const publicBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const baseUrl = typeof window === 'undefined'
  ? (process.env.API_URL_INTERNAL || publicBase)
  : '/api'

export class ApiClient {
  private getHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  private async handleError(response: Response): Promise<never> {
    let message = `API Error: ${response.status} ${response.statusText}`
    try {
      const text = await response.text()
      if (text) {
        const data = JSON.parse(text)
        if (data?.detail) message = Array.isArray(data.detail) ? data.detail.map((d: any) => d.msg || d).join('; ') : data.detail
        else if (data?.error) message = data.error
      }
    } catch {}
    throw new Error(message)
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    })
    
    if (!response.ok) return this.handleError(response)
    
    return response.json()
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) return this.handleError(response)
    
    return response.json()
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: { ...this.getHeaders(), ...(data ? { 'Content-Type': 'application/json' } : {}) },
      ...(data && { body: JSON.stringify(data) }),
    })
    
    if (!response.ok) return this.handleError(response)
    
    return response.json()
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    
    if (!response.ok) return this.handleError(response)
    
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
