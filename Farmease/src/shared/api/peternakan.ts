import apiClient from './client'

// ============ Farms ============
export interface Farm {
  id: number
  name: string
  location: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export const farmsApi = {
  getList: async (): Promise<Farm[]> => {
    return await apiClient.get('/api/farms')
  },
  getById: async (id: number): Promise<Farm> => {
    return await apiClient.get(`/api/farms/${id}`)
  },
  create: async (payload: Partial<Farm>): Promise<Farm> => {
    return await apiClient.post('/api/farms', payload)
  },
  update: async (id: number, payload: Partial<Farm>): Promise<Farm> => {
    return await apiClient.put(`/api/farms/${id}`, payload)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/farms/${id}`)
  },
}

// ============ Sheep ============
export interface Sheep {
  id_sheep: number
  sheep_code: string
  sheep_name: string
  gender: 'jantan' | 'betina'
  date_of_birth: string
  status: string
  origin: string
  id_cage: number
  id_type: number
  id_sire?: number
  id_dam?: number
  created_by: number
  created_at: string
  updated_at: string
}

export const sheepApi = {
  getList: async (): Promise<Sheep[]> => {
    return await apiClient.get('/api/sheep')
  },
  getById: async (id: number): Promise<Sheep> => {
    return await apiClient.get(`/api/sheep/${id}`)
  },
  create: async (payload: Partial<Sheep>): Promise<Sheep> => {
    return await apiClient.post('/api/sheep', payload)
  },
  update: async (id: number, payload: Partial<Sheep>): Promise<Sheep> => {
    return await apiClient.put(`/api/sheep/${id}`, payload)
  },
  updateStatus: async (id: number, status: string): Promise<Sheep> => {
    return await apiClient.patch(`/api/sheep/${id}/status`, { status })
  },
  getGenealogy: async (id: number): Promise<any> => {
    return await apiClient.get(`/api/sheep/${id}/genealogy`)
  },
  getSilsilah: async (id: number): Promise<any> => {
    return await apiClient.get(`/api/sheep/${id}/silsilah`)
  },
}

// ============ Cages ============
export interface Cage {
  id_cage: number
  cage_code: string
  cage_name?: string
  capacity: number
  cage_type?: string
  location?: string
  status?: string
  id_farm?: number
  created_at?: string
  updated_at?: string
}

export const cagesApi = {
  getList: async (): Promise<Cage[]> => {
    return await apiClient.get('/api/cages')
  },
  getById: async (id: number): Promise<Cage> => {
    return await apiClient.get(`/api/cages/${id}`)
  },
  create: async (payload: Partial<Cage>): Promise<Cage> => {
    return await apiClient.post('/api/cages', payload)
  },
  update: async (id: number, payload: Partial<Cage>): Promise<Cage> => {
    return await apiClient.put(`/api/cages/${id}`, payload)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/cages/${id}`)
  },
  verifyByCode: async (code: string): Promise<Cage> => {
    return await apiClient.get(`/api/cages/verify/${code}`)
  },
}

// ============ Health ============
export interface Health {
  id: number
  id_sheep: number
  health_status: string
  description: string
  date_recorded: string
  created_at: string
  updated_at: string
}

export const healthApi = {
  getList: async (sheepId: number): Promise<Health[]> => {
    return await apiClient.get(`/api/sheep/${sheepId}/health`)
  },
  getGlobalList: async (): Promise<Health[]> => {
    return await apiClient.get('/api/healths')
  },
  getKesehatan: async (sheepId: number): Promise<Health[]> => {
    return await apiClient.get(`/api/domba/${sheepId}/kesehatan`)
  },
  create: async (sheepId: number, payload: Partial<Health>): Promise<Health> => {
    return await apiClient.post(`/api/sheep/${sheepId}/health`, payload)
  },
  update: async (id: number, payload: Partial<Health>): Promise<Health> => {
    return await apiClient.put(`/api/healths/${id}`, payload)
  },
}

// ============ Weight ============
export interface Weight {
  id: number
  id_sheep: number
  weight: number
  date_recorded: string
  notes?: string
  created_at: string
  updated_at: string
}

export const weightApi = {
  getList: async (): Promise<Weight[]> => {
    return await apiClient.get('/api/weights')
  },
  getBeratBadan: async (): Promise<Weight[]> => {
    return await apiClient.get('/api/berat-badan')
  },
  getSheepHistory: async (sheepId: number): Promise<Weight[]> => {
    return await apiClient.get(`/api/sheep/${sheepId}/weight`)
  },
  record: async (sheepId: number, payload: Partial<Weight>): Promise<Weight> => {
    return await apiClient.post(`/api/sheep/${sheepId}/weight`, payload)
  },
}

// ============ Feeds ============
export interface Feed {
  id: number
  feed_name: string
  feed_type: string
  stock: number
  unit: string
  created_at: string
  updated_at: string
}

export const feedsApi = {
  getList: async (): Promise<Feed[]> => {
    return await apiClient.get('/api/feeds')
  },
  create: async (payload: Partial<Feed>): Promise<Feed> => {
    return await apiClient.post('/api/feeds', payload)
  },
  updateStock: async (id: number, stock: number): Promise<Feed> => {
    return await apiClient.patch(`/api/feeds/${id}/stock`, { stock })
  },
  updateStok: async (id: number, stok: number): Promise<Feed> => {
    return await apiClient.patch(`/api/feeds/${id}/stok`, { stok })
  },
  getRecommendation: async (sheepId: number): Promise<any> => {
    return await apiClient.get(`/api/sheep/${sheepId}/feed-recommendation`)
  },
  getFeedingHistory: async (sheepId: number): Promise<any[]> => {
    return await apiClient.get(`/api/sheep/${sheepId}/feedings`)
  },
  getPemberianPakan: async (sheepId: number): Promise<any[]> => {
    return await apiClient.get(`/api/sheep/${sheepId}/pemberian-pakan`)
  },
  recordFeeding: async (sheepId: number, payload: any): Promise<any> => {
    return await apiClient.post(`/api/sheep/${sheepId}/feedings`, payload)
  },
  recordPemberianPakan: async (sheepId: number, payload: any): Promise<any> => {
    return await apiClient.post(`/api/sheep/${sheepId}/pemberian-pakan`, payload)
  },
}

// ============ Manure ============
export interface Manure {
  id: number
  id_sheep: number
  quantity: number
  date_recorded: string
  notes?: string
  created_at: string
  updated_at: string
}

export const manureApi = {
  getList: async (): Promise<Manure[]> => {
    return await apiClient.get('/api/manures')
  },
  getKotoran: async (): Promise<Manure[]> => {
    return await apiClient.get('/api/kotoran')
  },
  getSheepHistory: async (sheepId: number): Promise<Manure[]> => {
    return await apiClient.get(`/api/sheep/${sheepId}/manure`)
  },
  record: async (sheepId: number, payload: Partial<Manure>): Promise<Manure> => {
    return await apiClient.post(`/api/sheep/${sheepId}/manure`, payload)
  },
}

// ============ Breeding ============
export interface Breeding {
  id: number
  id_male_sheep: number
  id_female_sheep: number
  mating_date: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
}

export const breedingApi = {
  checkInbreeding: async (maleId: number, femaleId: number): Promise<any> => {
    return await apiClient.post('/api/matings/check-inbreeding', {
      id_male_sheep: maleId,
      id_female_sheep: femaleId,
    })
  },
  cekInbreeding: async (maleId: number, femaleId: number): Promise<any> => {
    return await apiClient.post('/api/perkawinan/cek-inbreeding', {
      id_male_sheep: maleId,
      id_female_sheep: femaleId,
    })
  },
  getMatingList: async (filters?: any): Promise<Breeding[]> => {
    return await apiClient.get('/api/matings', { params: filters })
  },
  recordMating: async (payload: Partial<Breeding>): Promise<Breeding> => {
    return await apiClient.post('/api/matings', payload)
  },
  getMatingDetail: async (matingId: number): Promise<Breeding> => {
    return await apiClient.get(`/api/matings/${matingId}`)
  },
  updateMatingStatus: async (matingId: number, status: string): Promise<Breeding> => {
    return await apiClient.patch(`/api/matings/${matingId}/status`, { status })
  },
}

// ============ Pregnancy ============
export interface Pregnancy {
  id: number
  id_sheep: number
  mating_id: number
  pregnancy_start_date: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
}

export const pregnancyApi = {
  recordPregnancy: async (payload: Partial<Pregnancy>): Promise<Pregnancy> => {
    return await apiClient.post('/api/pregnancies', payload)
  },
  getList: async (): Promise<Pregnancy[]> => {
    return await apiClient.get('/api/pregnancies')
  },
  updateStatus: async (pregnancyId: number, status: string): Promise<Pregnancy> => {
    return await apiClient.patch(`/api/pregnancies/${pregnancyId}/status`, { status })
  },
}

// ============ Birth ============
export interface Birth {
  id: number
  id_sheep: number
  pregnancy_id: number
  birth_date: string
  num_offspring: number
  notes?: string
  created_at: string
  updated_at: string
}

export const birthApi = {
  recordBirth: async (payload: Partial<Birth>): Promise<Birth> => {
    return await apiClient.post('/api/births', payload)
  },
  getHistory: async (): Promise<Birth[]> => {
    return await apiClient.get('/api/births')
  },
}

// ============ Tasks ============
export interface Task {
  id: number
  user_id: number
  title: string
  description: string
  due_date: string
  status: string
  priority: string
  created_at: string
  updated_at: string
}

export const tasksApi = {
  getList: async (date?: string): Promise<Task[]> => {
    const params = date ? `?date=${date}` : ''
    return await apiClient.get(`/api/tasks${params}`)
  },
  create: async (payload: Partial<Task>): Promise<Task> => {
    return await apiClient.post('/api/tasks', payload)
  },
  update: async (id: number, payload: Partial<Task>): Promise<Task> => {
    return await apiClient.put(`/api/tasks/${id}`, payload)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/tasks/${id}`)
  },
  markComplete: async (id: number): Promise<Task> => {
    return await apiClient.patch(`/api/tasks/${id}/complete`, {})
  },
}

// ============ Notifications ============
export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
  updated_at: string
}

export const notificationsApi = {
  getList: async (): Promise<Notification[]> => {
    return await apiClient.get('/api/notifications')
  },
  markAsRead: async (id: number): Promise<Notification> => {
    return await apiClient.patch(`/api/notifications/${id}/read`, {})
  },
}

export default {
  farms: farmsApi,
  sheep: sheepApi,
  cages: cagesApi,
  health: healthApi,
  weight: weightApi,
  feeds: feedsApi,
  manure: manureApi,
  breeding: breedingApi,
  pregnancy: pregnancyApi,
  birth: birthApi,
  tasks: tasksApi,
  notifications: notificationsApi,
}
