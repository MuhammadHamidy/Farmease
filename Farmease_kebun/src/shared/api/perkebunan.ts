import apiClient from './client'

// ============ Lahan (Land/Plot) ============
export interface Lahan {
  id: string | number
  kode_lahan: string
  nama_lahan: string
  jenis_tanaman: string
  luas_lahan: number
  kapasitas_maksimal: number
  status_lahan: number
  varietas: string
  tanggal_tanam: string
  fase_tanam: string
  // Kept for backward compatibility if needed in UI:
  lokasi?: string
  luas?: number
  status?: string
}

function mapBackendLahanToFrontend(backend: any): Lahan {
  if (!backend) return {} as Lahan
  return {
    id: backend.id_lahan,
    kode_lahan: backend.kode_lahan,
    nama_lahan: backend.nama_lahan || backend.varietas || `Lahan ${backend.kode_lahan}`,
    jenis_tanaman: backend.jenis_tanaman || backend.fase_tanam || '',
    luas_lahan: backend.luas_lahan || 1.0,
    kapasitas_maksimal: backend.kapasitas_maksimal || 50,
    status_lahan: backend.status_lahan,
    varietas: backend.varietas || '',
    tanggal_tanam: backend.tanggal_tanam || '',
    fase_tanam: backend.fase_tanam || '',
    
    // UI mapping
    lokasi: backend.jenis_tanaman || backend.fase_tanam || '',
    luas: backend.luas_lahan || 1.0,
    status: backend.status_lahan === 1 ? 'Subur' : backend.status_lahan === 2 ? 'Pemulihan' : 'Perlu Pengairan',
  }
}

function mapFrontendLahanToBackend(frontend: Partial<Lahan>): any {
  let statusLahan = 1
  if (frontend.status === 'Pemulihan') statusLahan = 2
  else if (frontend.status === 'Perlu Pengairan') statusLahan = 3

  return {
    id_lahan: frontend.id,
    kode_lahan: frontend.kode_lahan,
    nama_lahan: frontend.nama_lahan || '',
    jenis_tanaman: frontend.jenis_tanaman || frontend.lokasi || '',
    luas_lahan: frontend.luas_lahan || frontend.luas || 1.0,
    kapasitas_maksimal: frontend.kapasitas_maksimal || 50,
    status_lahan: statusLahan,
    varietas: frontend.varietas || '',
    tanggal_tanam: frontend.tanggal_tanam || new Date().toISOString().split('T')[0],
    fase_tanam: frontend.fase_tanam || '',
  }
}

export const lahanApi = {
  getList: async (): Promise<Lahan[]> => {
    const list = await apiClient.get<any>('/api/v1/lahan')
    return (list || []).map(mapBackendLahanToFrontend)
  },
  getById: async (id: string | number): Promise<Lahan> => {
    const res = await apiClient.get<any>(`/api/v1/lahan/${id}`)
    return mapBackendLahanToFrontend(res)
  },
  getByCode: async (kode: string): Promise<Lahan> => {
    const res = await apiClient.get<any>(`/api/v1/lahan/kode/${kode}`)
    return mapBackendLahanToFrontend(res)
  },
  create: async (payload: Partial<Lahan>): Promise<Lahan> => {
    const mapped = mapFrontendLahanToBackend(payload)
    const res = await apiClient.post<any>('/api/v1/lahan', mapped)
    return mapBackendLahanToFrontend(res)
  },
  update: async (id: string | number, payload: Partial<Lahan>): Promise<Lahan> => {
    const mapped = mapFrontendLahanToBackend(payload)
    const res = await apiClient.put<any>(`/api/v1/lahan/${id}`, mapped)
    return mapBackendLahanToFrontend(res)
  },
  delete: async (id: string | number): Promise<void> => {
    return await apiClient.delete(`/api/v1/lahan/${id}`)
  },
}

// ============ Pohon (Trees) ============
export interface Pohon {
  id: string | number
  kode_pohon: string
  nama_pohon: string
  jenis: string
  umur: number
  id_lahan: string | number
  status: string
  created_at: string
  updated_at: string
}

function mapBackendPohonToFrontend(backend: any): Pohon {
  if (!backend) return {} as Pohon
  let age = 1
  if (backend.tanggal_tanam) {
    const plantedYear = new Date(backend.tanggal_tanam).getFullYear()
    const currentYear = new Date().getFullYear()
    age = Math.max(1, currentYear - plantedYear)
  }
  return {
    id: backend.id_pohon,
    kode_pohon: backend.kode_pohon,
    nama_pohon: backend.varietas || `Pohon ${backend.kode_pohon}`,
    jenis: backend.varietas || '',
    umur: age,
    id_lahan: backend.Lahan_id_lahan,
    status: backend.fase_pohon || 'Produktif',
    created_at: backend.tanggal_tanam || '',
    updated_at: backend.tanggal_tanam || '',
  }
}

function mapFrontendPohonToBackend(frontend: Partial<Pohon>): any {
  let tanggalTanam = new Date().toISOString().split('T')[0]
  if (frontend.umur) {
    const plantedYear = new Date().getFullYear() - Number(frontend.umur)
    tanggalTanam = `${plantedYear}-01-01`
  }
  return {
    id_pohon: frontend.id,
    kode_pohon: frontend.kode_pohon,
    tanggal_tanam: frontend.created_at || tanggalTanam,
    varietas: frontend.jenis || frontend.nama_pohon || '',
    fase_pohon: frontend.status || '',
    Lahan_id_lahan: frontend.id_lahan,
  }
}

export const pohonApi = {
  getList: async (): Promise<Pohon[]> => {
    const list = await apiClient.get<any>('/api/v1/pohon')
    return (list || []).map(mapBackendPohonToFrontend)
  },
  getById: async (id: string | number): Promise<Pohon> => {
    const res = await apiClient.get<any>(`/api/v1/pohon/${id}`)
    return mapBackendPohonToFrontend(res)
  },
  create: async (payload: Partial<Pohon>): Promise<Pohon> => {
    const mapped = mapFrontendPohonToBackend(payload)
    const res = await apiClient.post<any>('/api/v1/pohon', mapped)
    return mapBackendPohonToFrontend(res)
  },
  update: async (id: string | number, payload: Partial<Pohon>): Promise<Pohon> => {
    const mapped = mapFrontendPohonToBackend(payload)
    const res = await apiClient.put<any>(`/api/v1/pohon/${id}`, mapped)
    return mapBackendPohonToFrontend(res)
  },
  delete: async (id: string | number): Promise<void> => {
    return await apiClient.delete(`/api/v1/pohon/${id}`)
  },
}

// ============ Aktivitas (Activities/Operations) ============
export interface Aktivitas {
  id: string | number
  nama_aktivitas: string
  deskripsi: string
  tanggal_mulai: string
  tanggal_selesai?: string
  id_lahan: string | number
  status: string
  created_at: string
  updated_at: string
}

function mapBackendAktivitasToFrontend(backend: any): Aktivitas {
  if (!backend) return {} as Aktivitas
  return {
    id: backend.id_aktivitas,
    nama_aktivitas: backend.nama_jenis_aktivitas || '',
    deskripsi: backend.nama_rincian_aktivitas || '',
    tanggal_mulai: backend.tanggal_aktivitas || '',
    id_lahan: backend.Lahan_id_lahan || '',
    status: 'Selesai',
    created_at: backend.tanggal_aktivitas || '',
    updated_at: backend.tanggal_aktivitas || '',
  }
}

function mapFrontendAktivitasToBackend(frontend: Partial<Aktivitas>): any {
  return {
    id_aktivitas: frontend.id,
    nama_jenis_aktivitas: frontend.nama_aktivitas || '',
    nama_rincian_aktivitas: frontend.deskripsi || '',
    tanggal_aktivitas: frontend.tanggal_mulai || new Date().toISOString(),
    Lahan_id_lahan: frontend.id_lahan || '',
  }
}

export const aktivitasApi = {
  getList: async (): Promise<Aktivitas[]> => {
    const list = await apiClient.get<any>('/api/v1/aktivitas')
    return (list || []).map(mapBackendAktivitasToFrontend)
  },
  getById: async (id: string | number): Promise<Aktivitas> => {
    const res = await apiClient.get<any>(`/api/v1/aktivitas/${id}`)
    return mapBackendAktivitasToFrontend(res)
  },
  create: async (payload: Partial<Aktivitas>): Promise<Aktivitas> => {
    const mapped = mapFrontendAktivitasToBackend(payload)
    const res = await apiClient.post<any>('/api/v1/aktivitas', mapped)
    return mapBackendAktivitasToFrontend(res)
  },
  update: async (id: string | number, payload: Partial<Aktivitas>): Promise<Aktivitas> => {
    const mapped = mapFrontendAktivitasToBackend(payload)
    const res = await apiClient.put<any>(`/api/v1/aktivitas/${id}`, mapped)
    return mapBackendAktivitasToFrontend(res)
  },
  delete: async (id: string | number): Promise<void> => {
    return await apiClient.delete(`/api/v1/aktivitas/${id}`)
  },
}

// ============ Perawatan (Tree Care) ============
export interface Perawatan {
  id: string | number
  jenis_perawatan: string
  deskripsi: string
  tanggal_perawatan: string
  id_pohon: string | number
  status: string
  created_at: string
  updated_at: string
}

function mapBackendPerawatanToFrontend(backend: any): Perawatan {
  if (!backend) return {} as Perawatan
  return {
    id: backend.id_perawatan,
    jenis_perawatan: backend.jenis_bahan || backend.nama_rincian_aktivitas || '',
    deskripsi: backend.deskripsi || backend.nama_rincian_aktivitas || '',
    tanggal_perawatan: backend.tanggal_aktivitas || '',
    id_pohon: backend.Lahan_id_lahan || '',
    status: 'Selesai',
    created_at: backend.tanggal_aktivitas || '',
    updated_at: backend.tanggal_aktivitas || '',
  }
}

function mapFrontendPerawatanToBackend(frontend: Partial<Perawatan>): any {
  return {
    id_perawatan: frontend.id,
    Aktivitas_id_aktivitas: '',
    jenis_bahan: frontend.jenis_perawatan || '',
    fase_pohon: frontend.status || '',
    dosis: 0,
    satuan: '',
    bagian_pohon: '',
    teknik_perawatan: '',
    nama_obat: '',
    deskripsi: frontend.deskripsi || '',
    detail_pohon: String(frontend.id_pohon || ''),
    Lahan_id_lahan: frontend.id_pohon || '',
  }
}

export const perawatanApi = {
  getList: async (): Promise<Perawatan[]> => {
    const list = await apiClient.get<any>('/api/v1/perawatan')
    return (list || []).map(mapBackendPerawatanToFrontend)
  },
  getById: async (id: string | number): Promise<Perawatan> => {
    const res = await apiClient.get<any>(`/api/v1/perawatan/${id}`)
    return mapBackendPerawatanToFrontend(res)
  },
  create: async (payload: Partial<Perawatan>): Promise<Perawatan> => {
    const mapped = mapFrontendPerawatanToBackend(payload)
    const res = await apiClient.post<any>('/api/v1/perawatan', mapped)
    return mapBackendPerawatanToFrontend(res)
  },
  update: async (id: string | number, payload: Partial<Perawatan>): Promise<Perawatan> => {
    const mapped = mapFrontendPerawatanToBackend(payload)
    const res = await apiClient.put<any>(`/api/v1/perawatan/${id}`, mapped)
    return mapBackendPerawatanToFrontend(res)
  },
  delete: async (id: string | number): Promise<void> => {
    return await apiClient.delete(`/api/v1/perawatan/${id}`)
  },
}

// ============ Pemangkasan (Pruning) ============
export interface Pemangkasan {
  id: string | number
  tanggal_pemangkasan: string
  deskripsi: string
  id_pohon: string | number
  status: string
  created_at: string
  updated_at: string
}

function mapBackendPemangkasanToFrontend(backend: any): Pemangkasan {
  if (!backend) return {} as Pemangkasan
  return {
    id: backend.id_pemangkasan,
    tanggal_pemangkasan: backend.tanggal_aktivitas || '',
    deskripsi: backend.keterangan || backend.nama_rincian_aktivitas || '',
    id_pohon: backend.Lahan_id_lahan || '',
    status: 'Selesai',
    created_at: backend.tanggal_aktivitas || '',
    updated_at: backend.tanggal_aktivitas || '',
  }
}

function mapFrontendPemangkasanToBackend(frontend: Partial<Pemangkasan>): any {
  return {
    id_pemangkasan: frontend.id,
    Aktivitas_id_aktivitas: '',
    jumlah: '0',
    satuan: 'kg',
    keterangan: frontend.deskripsi || '',
    Lahan_id_lahan: frontend.id_pohon || '',
  }
}

export const pemangkasanApi = {
  getList: async (): Promise<Pemangkasan[]> => {
    const list = await apiClient.get<any>('/api/v1/pemangkasan')
    return (list || []).map(mapBackendPemangkasanToFrontend)
  },
  getById: async (id: string | number): Promise<Pemangkasan> => {
    const res = await apiClient.get<any>(`/api/v1/pemangkasan/${id}`)
    return mapBackendPemangkasanToFrontend(res)
  },
  create: async (payload: Partial<Pemangkasan>): Promise<Pemangkasan> => {
    const mapped = mapFrontendPemangkasanToBackend(payload)
    const res = await apiClient.post<any>('/api/v1/pemangkasan', mapped)
    return mapBackendPemangkasanToFrontend(res)
  },
  update: async (id: string | number, payload: Partial<Pemangkasan>): Promise<Pemangkasan> => {
    const mapped = mapFrontendPemangkasanToBackend(payload)
    const res = await apiClient.put<any>(`/api/v1/pemangkasan/${id}`, mapped)
    return mapBackendPemangkasanToFrontend(res)
  },
  delete: async (id: string | number): Promise<void> => {
    return await apiClient.delete(`/api/v1/pemangkasan/${id}`)
  },
}

// ============ Panen (Harvest) ============
export interface Panen {
  id: string | number
  tanggal_panen: string
  jumlah_panen: number
  unit: string
  id_pohon: string | number
  status: string
  created_at: string
  updated_at: string
}

function mapBackendPanenToFrontend(backend: any): Panen {
  if (!backend) return {} as Panen
  return {
    id: backend.id_panen,
    tanggal_panen: backend.tanggal_aktivitas || '',
    jumlah_panen: backend.jumlah || 0,
    unit: backend.satuan || 'kg',
    id_pohon: backend.Lahan_id_lahan || '',
    status: 'Selesai',
    created_at: backend.tanggal_aktivitas || '',
    updated_at: backend.tanggal_aktivitas || '',
  }
}

function mapFrontendPanenToBackend(frontend: Partial<Panen>): any {
  return {
    id_panen: frontend.id,
    Aktivitas_id_aktivitas: '',
    jumlah: frontend.jumlah_panen || 0,
    satuan: frontend.unit || 'kg',
    Lahan_id_lahan: frontend.id_pohon || '',
  }
}

export const panenApi = {
  getList: async (): Promise<Panen[]> => {
    const list = await apiClient.get<any>('/api/v1/panen')
    return (list || []).map(mapBackendPanenToFrontend)
  },
  getRecap: async (): Promise<any> => {
    return await apiClient.get('/api/v1/panen/rekap')
  },
  getById: async (id: string | number): Promise<Panen> => {
    const res = await apiClient.get<any>(`/api/v1/panen/${id}`)
    return mapBackendPanenToFrontend(res)
  },
  create: async (payload: Partial<Panen>): Promise<Panen> => {
    const mapped = mapFrontendPanenToBackend(payload)
    const res = await apiClient.post<any>('/api/v1/panen', mapped)
    return mapBackendPanenToFrontend(res)
  },
  update: async (id: string | number, payload: Partial<Panen>): Promise<Panen> => {
    const mapped = mapFrontendPanenToBackend(payload)
    const res = await apiClient.put<any>(`/api/v1/panen/${id}`, mapped)
    return mapBackendPanenToFrontend(res)
  },
  delete: async (id: string | number): Promise<void> => {
    return await apiClient.delete(`/api/v1/panen/${id}`)
  },
}

// ============ Akun Lahan (Account-Land Assignment) ============
export interface AkunLahan {
  id: string | number
  id_akun: string | number
  id_lahan: string | number
  role: string
  created_at: string
  updated_at: string
}

export const akunLahanApi = {
  getList: async (): Promise<AkunLahan[]> => {
    return await apiClient.get('/api/v1/akun-lahan')
  },
  getById: async (id: string | number): Promise<AkunLahan> => {
    return await apiClient.get(`/api/v1/akun-lahan/${id}`)
  },
  create: async (payload: Partial<AkunLahan>): Promise<AkunLahan> => {
    return await apiClient.post('/api/v1/akun-lahan', payload)
  },
  update: async (id: string | number, payload: Partial<AkunLahan>): Promise<AkunLahan> => {
    return await apiClient.put(`/api/v1/akun-lahan/${id}`, payload)
  },
  delete: async (id: string | number): Promise<void> => {
    return await apiClient.delete(`/api/v1/akun-lahan/${id}`)
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
export interface PencatatanSubmission {
  id: string;
  type: string;
  typeLabel: string;
  operatorCode: string;
  operatorName: string;
  cageCode: string;
  scope: 'domba' | 'kandang' | 'pohon' | 'lahan';
  summary: string;
  payload: Record<string, unknown>;
  submittedAt: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  reviewedAt?: number;
  reviewedBy?: string;
  reviewNote?: string;
  taskId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const submissionsApi = {
  getList: async (filters?: { status?: string; type?: string }): Promise<PencatatanSubmission[]> => {
    return await apiClient.get('/api/submissions', { params: filters })
  },
  getById: async (id: string): Promise<PencatatanSubmission> => {
    return await apiClient.get(`/api/submissions/${id}`)
  },
  create: async (payload: Partial<PencatatanSubmission>): Promise<PencatatanSubmission> => {
    return await apiClient.post('/api/submissions', payload)
  },
  update: async (id: string, payload: Partial<PencatatanSubmission>): Promise<any> => {
    return await apiClient.put(`/api/submissions/${id}`, payload)
  },
  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/api/submissions/${id}`)
  },
}


// ============ Pencatatan Types (Jenis & Rincian) ============
export interface JenisPencatatanItem {
  id_jenis: string
  nama: string
  sort_order: number
  is_active: boolean
}

export interface RincianPencatatanItem {
  id_rincian: string
  jenis_id: string
  jenis_nama?: string
  nama: string
  sort_order: number
  is_active: boolean
}

export interface PencatatanTypesCatalog {
  jenis: JenisPencatatanItem[]
  rincian_by_jenis: Record<string, RincianPencatatanItem[]>
}

export const pencatatanTypesApi = {
  getCatalog: async (): Promise<PencatatanTypesCatalog> => {
    return await apiClient.get<PencatatanTypesCatalog>('/api/v1/pencatatan-types/catalog')
  },
  getRincianByJenis: async (jenisNama: string): Promise<RincianPencatatanItem[]> => {
    return await apiClient.get<RincianPencatatanItem[]>(`/api/v1/pencatatan-types/jenis/${encodeURIComponent(jenisNama)}/rincian`)
  },
  createJenis: async (payload: { nama: string; sort_order?: number }): Promise<JenisPencatatanItem> => {
    return await apiClient.post<JenisPencatatanItem>('/api/v1/pencatatan-types/jenis', payload)
  },
  createRincian: async (payload: { jenis_nama: string; nama: string; sort_order?: number }): Promise<RincianPencatatanItem> => {
    return await apiClient.post<RincianPencatatanItem>('/api/v1/pencatatan-types/rincian', payload)
  },
}

export default {
  lahan: lahanApi,
  pohon: pohonApi,
  aktivitas: aktivitasApi,
  perawatan: perawatanApi,
  pemangkasan: pemangkasanApi,
  panen: panenApi,
  akunLahan: akunLahanApi,
  tasks: tasksApi,
  notifications: notificationsApi,
  routineSchedules: routineSchedulesApi,
  submissions: submissionsApi,
  pencatatanTypes: pencatatanTypesApi,
}
