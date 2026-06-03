import apiClient from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginOperatorRequest {
  farm_id: number
  role_id: number
}

export interface User {
  id: number
  email: string
  username: string
  role_id: number
  status: string
  created_at: string
  updated_at: string
  farm_id?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export const authApi = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<any>('/api/auth/login', payload)
    return {
      token: res.token,
      user: {
        id: res.account?.id_account,
        email: res.account?.username + '@farmease.com',
        username: res.account?.username,
        role_id: res.account?.id_role,
        status: 'active',
        created_at: res.account?.created_at,
        updated_at: res.account?.updated_at,
        farm_id: res.account?.farm_id,
      }
    }
  },

  loginOperator: async (payload: LoginOperatorRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<any>('/api/auth/login-operator', payload)
    return {
      token: res.token,
      user: {
        id: res.account?.id_account,
        email: res.account?.username + '@farmease.com',
        username: res.account?.username,
        role_id: res.account?.id_role,
        status: 'active',
        created_at: res.account?.created_at,
        updated_at: res.account?.updated_at,
        farm_id: res.account?.farm_id,
      }
    }
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  setAuth: (token: string, user: User) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  getToken: (): string | null => {
    return localStorage.getItem('authToken')
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken')
  },
}

export default authApi
