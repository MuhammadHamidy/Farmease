import { ssoClient as apiClient } from './client'

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

export interface EnumChoice {
  value: string
  label: string
}

export interface MetadataEnums {
  gender: EnumChoice[]
  sheep_status: EnumChoice[]
  feed_category: EnumChoice[]
  task_category: EnumChoice[]
  task_rincian: EnumChoice[]
  day_of_week: EnumChoice[]
  frequency: EnumChoice[]
  mating_method: EnumChoice[]
  mating_status: EnumChoice[]
  pregnancy_status: EnumChoice[]
  offspring_gender: EnumChoice[]
  offspring_condition: EnumChoice[]
  manure_activity: EnumChoice[]
  manure_dest: EnumChoice[]
  priority: EnumChoice[]
  task_status: EnumChoice[]
  health_actions: EnumChoice[]
  medicines: EnumChoice[]
  manure_conditions: EnumChoice[]
  pregnancy_check_methods: EnumChoice[]
  pregnancy_check_results: EnumChoice[]
  estrus_check_results: EnumChoice[]
  dam_conditions: EnumChoice[]
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
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('user')
    sessionStorage.clear()

    const host = window.location.hostname
    const protocol = window.location.protocol

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
  },

  getCurrentUser: (): User | null => {
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  setAuth: (token: string, user: User) => {
    sessionStorage.setItem('authToken', token)
    sessionStorage.setItem('user', JSON.stringify(user))
    // Clear localStorage so closing tab requires re-login
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  },

  getToken: (): string | null => {
    return sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
  },

  isAuthenticated: (): boolean => {
    return !!(sessionStorage.getItem('authToken') || localStorage.getItem('authToken'))
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

  getMetadataEnums: async (): Promise<MetadataEnums> => {
    return apiClient.get<MetadataEnums>('/api/metadata/enums')
  },
}

export default authApi
