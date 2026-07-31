import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

const isDev = import.meta.env.DEV;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isDev ? 'http://localhost:8082' : 'https://api-kebun.netrash.id')

export interface ApiResponse<T = any> {
  status: string
  message: string
  data: T
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor - choose baseURL dynamically and add auth token
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const url = config.url || ''
      if (url.startsWith('/api/auth') || url.startsWith('/api/accounts') || url.startsWith('/api/metadata')) {
        config.baseURL = import.meta.env.VITE_SSO_API_BASE_URL || import.meta.env.VITE_SSO_API_URL || import.meta.env.VITE_API_BASE_URL || (isDev ? 'http://localhost:8080' : 'https://api-sso.netrash.id')
      } else {
        config.baseURL = import.meta.env.VITE_API_BASE_URL || (isDev ? 'http://localhost:8082' : 'https://api-kebun.netrash.id')
      }

      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor - handle auth errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        const url = error.config?.url || ''
        const isAuthRoute = url.includes('/api/auth/login')
        
        if (error.response?.status === 401 && !isAuthRoute) {
          const currentToken = localStorage.getItem('authToken')
          if (currentToken && currentToken.startsWith('mock-token-development')) {
            console.warn('[Client] 401 received with mock token, suppressing auto-logout redirect.')
            return Promise.reject(error)
          }
          // Token expired - clear storage and redirect cleanly to SSO landing page
          const host = window.location.hostname
          const protocol = window.location.protocol
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          sessionStorage.clear()
          if (host.includes('netrash.id')) {
            if (host.includes('staging')) {
              window.location.href = `${protocol}//sso-staging.netrash.id/?logout=true`
            } else if (host.includes('farmease-')) {
              window.location.href = `${protocol}//farmease-sso.netrash.id/?logout=true`
            } else {
              window.location.href = `${protocol}//sso.netrash.id/?logout=true`
            }
          } else {
            window.location.href = `http://${host}:3000/?logout=true`
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<any>(url, config)
    if (response.data && typeof response.data === 'object' && 'data' in response.data && ('success' in response.data || 'status' in response.data)) {
      return response.data.data
    }
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<any>(url, data, config)
    if (response.data && typeof response.data === 'object' && 'data' in response.data && ('success' in response.data || 'status' in response.data)) {
      return response.data.data
    }
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<any>(url, data, config)
    if (response.data && typeof response.data === 'object' && 'data' in response.data && ('success' in response.data || 'status' in response.data)) {
      return response.data.data
    }
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<any>(url, data, config)
    if (response.data && typeof response.data === 'object' && 'data' in response.data && ('success' in response.data || 'status' in response.data)) {
      return response.data.data
    }
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<any>(url, config)
    if (response.data && typeof response.data === 'object' && 'data' in response.data && ('success' in response.data || 'status' in response.data)) {
      return response.data.data
    }
    return response.data
  }

  getClient(): AxiosInstance {
    return this.client
  }
}

export default new ApiClient()
