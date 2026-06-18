import apiClient from './client'

// ============ Farms ============
export interface Farm {
  id: string | number
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
  getById: async (id: string | number): Promise<Farm> => {
    return await apiClient.get(`/api/farms/${id}`)
  },
  create: async (payload: Partial<Farm>): Promise<Farm> => {
    return await apiClient.post('/api/farms', payload)
  },
  update: async (id: string | number, payload: Partial<Farm>): Promise<Farm> => {
    return await apiClient.put(`/api/farms/${id}`, payload)
  },
  delete: async (id: string | number): Promise<void> => {
    return await apiClient.delete(`/api/farms/${id}`)
  },
}

// ============ Sheep ============
export interface Sheep {
  id_sheep: string | number
  sheep_code: string
  sheep_name: string
  gender: 'jantan' | 'betina'
  date_of_birth: string
  status: string
  origin: string
  id_cage: string | number
  id_type: string | number
  type_name?: string
  photo_url?: string
  id_father?: string | number
  id_mother?: string | number
  created_by: string | number
  created_at: string
  updated_at: string
}

export const sheepApi = {
  getList: async (): Promise<Sheep[]> => {
    return await apiClient.get('/api/sheep')
  },
  getById: async (id: string | number): Promise<Sheep> => {
    return await apiClient.get(`/api/sheep/${id}`)
  },
  create: async (payload: Partial<Sheep>): Promise<Sheep> => {
    return await apiClient.post('/api/sheep', payload)
  },
  update: async (id: string | number, payload: Partial<Sheep>): Promise<Sheep> => {
    return await apiClient.put(`/api/sheep/${id}`, payload)
  },
  updateStatus: async (id: string | number, status: string): Promise<Sheep> => {
    return await apiClient.patch(`/api/sheep/${id}/status`, { status })
  },
  getGenealogy: async (id: string | number): Promise<any> => {
    return await apiClient.get(`/api/sheep/${id}/genealogy`)
  },
  getSilsilah: async (id: string | number): Promise<any> => {
    return await apiClient.get(`/api/sheep/${id}/silsilah`)
  },
  registerExternalDonor: async (name: string, origin: string): Promise<Sheep> => {
    return await apiClient.post('/api/sheep/external-donor', { name, origin })
  },
}

export const uploadApi = {
  uploadPhoto: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('photo', file)
    const response = await apiClient.post('/api/upload/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.photo_url || response.data?.photo_url || ''
  },
}

// ============ Cages ============
export interface Cage {
  id_cage: string | number
  cage_code: string
  cage_name?: string
  capacity: number
  cage_type?: string
  location?: string
  status?: string
  id_farm?: string | number
  created_at?: string
  updated_at?: string
}

export const cagesApi = {
  getList: async (): Promise<Cage[]> => {
    return await apiClient.get('/api/cages')
  },
  getById: async (id: string | number): Promise<Cage> => {
    return await apiClient.get(`/api/cages/${id}`)
  },
  create: async (payload: Partial<Cage>): Promise<Cage> => {
    return await apiClient.post('/api/cages', payload)
  },
  update: async (id: string | number, payload: Partial<Cage>): Promise<Cage> => {
    return await apiClient.put(`/api/cages/${id}`, payload)
  },
  delete: async (id: string | number): Promise<void> => {
    return await apiClient.delete(`/api/cages/${id}`)
  },
  getStats: async (id: string | number): Promise<any> => {
    return await apiClient.get(`/api/cages/${id}/stats`)
  },
  getWeightStats: async (id: string | number): Promise<any> => {
    return await apiClient.get(`/api/cages/${id}/weight-stats`)
  },
  verifyByCode: async (code: string): Promise<Cage> => {
    return await apiClient.get(`/api/cages/verify/${code}`)
  },
}

// ============ Health ============
export interface Health {
  id: string | number
  id_sheep: string | number
  health_status: string
  description: string
  date_recorded: string
  created_at: string
  updated_at: string
}

export const healthApi = {
  getList: async (sheepId: string | number): Promise<Health[]> => {
    return await apiClient.get(`/api/sheep/${sheepId}/health`)
  },
  getGlobalList: async (): Promise<Health[]> => {
    return await apiClient.get('/api/healths')
  },
  getKesehatan: async (sheepId: string | number): Promise<Health[]> => {
    return await apiClient.get(`/api/domba/${sheepId}/kesehatan`)
  },
  create: async (sheepId: string | number, payload: Partial<Health>): Promise<Health> => {
    return await apiClient.post(`/api/sheep/${sheepId}/health`, payload)
  },
  update: async (id: string | number, payload: Partial<Health>): Promise<Health> => {
    return await apiClient.put(`/api/healths/${id}`, payload)
  },
}

// ============ Weight ============
export interface Weight {
  id: string | number
  id_sheep: string | number
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
  getSheepHistory: async (sheepId: string | number): Promise<Weight[]> => {
    return await apiClient.get(`/api/sheep/${sheepId}/weight`)
  },
  record: async (sheepId: string | number, payload: Partial<Weight>): Promise<Weight> => {
    return await apiClient.post(`/api/sheep/${sheepId}/weight`, payload)
  },
}

// ============ Feeds ============
export interface Feed {
  id: string | number
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
  updateStock: async (id: string | number, amount: number, type: 'tambah' | 'kurang'): Promise<Feed> => {
    return await apiClient.patch(`/api/feeds/${id}/stock`, { amount, type })
  },
  updateStok: async (id: string | number, amount: number, type: 'tambah' | 'kurang'): Promise<Feed> => {
    return await apiClient.patch(`/api/feeds/${id}/stok`, { amount, type })
  },
  getRecommendation: async (sheepId: string | number): Promise<any> => {
    return await apiClient.get(`/api/sheep/${sheepId}/feed-recommendation`)
  },
  getRecommendationByCage: async (cageId: string | number): Promise<any> => {
    return await apiClient.get(`/api/pakan/rekomendasi/kandang/${cageId}`)
  },
  getFeedingHistory: async (sheepId: string | number): Promise<any[]> => {
    return await apiClient.get(`/api/sheep/${sheepId}/feedings`)
  },
  getPemberianPakan: async (sheepId: string | number): Promise<any[]> => {
    return await apiClient.get(`/api/sheep/${sheepId}/pemberian-pakan`)
  },
  recordFeeding: async (sheepId: string | number, payload: any): Promise<any> => {
    return await apiClient.post(`/api/sheep/${sheepId}/feedings`, payload)
  },
  recordPemberianPakan: async (sheepId: string | number, payload: any): Promise<any> => {
    return await apiClient.post(`/api/sheep/${sheepId}/pemberian-pakan`, payload)
  },
}

// ============ Manure ============
export interface Manure {
  id: string | number
  id_sheep: string | number
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
  getSheepHistory: async (sheepId: string | number): Promise<Manure[]> => {
    return await apiClient.get(`/api/sheep/${sheepId}/manure`)
  },
  record: async (sheepId: string | number, payload: Partial<Manure>): Promise<Manure> => {
    return await apiClient.post(`/api/sheep/${sheepId}/manure`, payload)
  },
}

// ============ Breeding ============
export interface Breeding {
  id: string | number
  id_male_sheep: string | number
  id_female_sheep: string | number
  mating_date: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
}

export const breedingApi = {
  checkInbreeding: async (maleId: string | number, femaleId: string | number): Promise<any> => {
    return await apiClient.post('/api/matings/check-inbreeding', {
      id_sheep_male: maleId,
      id_sheep_female: femaleId,
    })
  },
  cekInbreeding: async (maleId: string | number, femaleId: string | number): Promise<any> => {
    return await apiClient.post('/api/perkawinan/cek-inbreeding', {
      id_sheep_male: maleId,
      id_sheep_female: femaleId,
    })
  },
  getMatingList: async (filters?: any): Promise<Breeding[]> => {
    return await apiClient.get('/api/matings', { params: filters })
  },
  recordMating: async (payload: Partial<Breeding>): Promise<Breeding> => {
    return await apiClient.post('/api/matings', payload)
  },
  getMatingDetail: async (matingId: string | number): Promise<Breeding> => {
    return await apiClient.get(`/api/matings/${matingId}`)
  },
  updateMatingStatus: async (matingId: string | number, status: string): Promise<Breeding> => {
    return await apiClient.patch(`/api/matings/${matingId}/status`, { status })
  },
}

// ============ Pregnancy ============
export interface Pregnancy {
  id: string | number
  id_sheep: string | number
  mating_id: string | number
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
  updateStatus: async (pregnancyId: string | number, status: string): Promise<Pregnancy> => {
    return await apiClient.patch(`/api/pregnancies/${pregnancyId}/status`, { status })
  },
  checkPregnancy: async (payload: any): Promise<any> => {
    return await apiClient.post('/api/pregnancies/check', payload)
  },
}

// ============ Birth ============
export interface Birth {
  id: string | number
  id_sheep: string | number
  pregnancy_id: string | number
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
  id: string | number
  user_id: string | number
  title: string
  description: string
  due_date: string
  task_date?: string
  end_time?: string
  status: string
  priority: string
  category?: string
  id_cage?: string
  schedule_id?: string
  start_time?: string
  rincian?: string
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
  update: async (id: string | number, payload: Partial<Task>): Promise<Task> => {
    return await apiClient.put(`/api/tasks/${id}`, payload)
  },
  delete: async (id: string | number): Promise<void> => {
    return await apiClient.delete(`/api/tasks/${id}`)
  },
  markComplete: async (id: string | number): Promise<Task> => {
    return await apiClient.patch(`/api/tasks/${id}/complete`, {})
  },
}

// ============ Notifications ============
export interface Notification {
  id: string | number
  user_id: string | number
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
  markAsRead: async (id: string | number): Promise<Notification> => {
    return await apiClient.patch(`/api/notifications/${id}/read`, {})
  },
}

// ============ Routine Schedules ============
export interface ApiRoutineSchedule {
  id: string
  title: string
  description: string
  category: string
  frequency: string
  days_of_week: number[]
  day_of_month?: number
  start_date: string
  end_date?: string
  start_time?: string
  end_time?: string
  priority: string
  id_cage?: string
  id_account?: string
  rincian?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export const routineSchedulesApi = {
  getList: async (): Promise<ApiRoutineSchedule[]> => {
    return await apiClient.get('/api/routine-schedules')
  },
  getById: async (id: string): Promise<ApiRoutineSchedule> => {
    return await apiClient.get(`/api/routine-schedules/${id}`)
  },
  create: async (payload: Partial<ApiRoutineSchedule>): Promise<ApiRoutineSchedule> => {
    return await apiClient.post('/api/routine-schedules', payload)
  },
  update: async (id: string, payload: Partial<ApiRoutineSchedule>): Promise<ApiRoutineSchedule> => {
    return await apiClient.put(`/api/routine-schedules/${id}`, payload)
  },
  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/api/routine-schedules/${id}`)
  },
  generate: async (windowDays?: number): Promise<void> => {
    return await apiClient.post('/api/routine-schedules/generate', { window_days: windowDays })
  },
}

// ============ Submissions ============
export interface ApiSubmission {
  id: string
  type: string
  typeLabel: string
  operatorCode: string
  operatorName: string
  cageCode: string
  scope: string
  summary: string
  payload: any
  submittedAt: number | string
  approvalStatus: string
  reviewedAt?: number | string
  reviewedBy?: string
  reviewNote?: string
  taskId?: string
}

export const submissionsApi = {
  getList: async (filters?: { status?: string; type?: string }): Promise<ApiSubmission[]> => {
    return await apiClient.get('/api/submissions', { params: filters })
  },
  getById: async (id: string): Promise<ApiSubmission> => {
    return await apiClient.get(`/api/submissions/${id}`)
  },
  create: async (payload: Partial<ApiSubmission>): Promise<ApiSubmission> => {
    return await apiClient.post('/api/submissions', payload)
  },
  update: async (id: string, payload: Partial<ApiSubmission>): Promise<any> => {
    return await apiClient.put(`/api/submissions/${id}`, payload)
  },
  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/api/submissions/${id}`)
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
  routineSchedules: routineSchedulesApi,
  submissions: submissionsApi,
}
