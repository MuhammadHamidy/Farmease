import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

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

    // Request interceptor - add auth token
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('authToken')
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
          // Token expired - clear storage and redirect to login
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
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
