import apiClient from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginOperatorRequest {
  farm_id: string | number
  role_id: string | number
}

export interface User {
  id: string | number
  email: string
  username: string
  role_id: string | number
  operator_category?: string
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
        operator_category: res.account?.operator_category,
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
        operator_category: res.account?.operator_category,
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

  getAccounts: async (): Promise<User[]> => {
    const res = await apiClient.get<any[]>('/api/accounts')
    return res.map(acc => ({
      id: acc.id_account,
      email: acc.username + '@farmease.com',
      username: acc.username,
      role_id: acc.id_role,
      operator_category: acc.operator_category,
      status: 'active',
      created_at: acc.created_at,
      updated_at: acc.updated_at,
      farm_id: acc.farm_id,
    }))
  },
}

export default authApi
