import apiClient from './client'

// ============ Lahan (Land/Plot) ============
export interface Lahan {
  id: number
  kode_lahan: string
  nama_lahan: string
  lokasi: string
  luas: number
  status: string
  created_at: string
  updated_at: string
}

function mapBackendLahanToFrontend(backend: any): Lahan {
  if (!backend) return {} as Lahan
  return {
    id: backend.id_lahan,
    kode_lahan: backend.kode_lahan,
    nama_lahan: backend.varietas || `Lahan ${backend.kode_lahan}`,
    lokasi: backend.fase_tanam || '',
    luas: 1.0,
    status: backend.status_lahan === 1 ? 'Subur' : backend.status_lahan === 2 ? 'Pemulihan' : 'Perlu Pengairan',
    created_at: backend.tanggal_tanam || '',
    updated_at: backend.tanggal_tanam || '',
  }
}

function mapFrontendLahanToBackend(frontend: Partial<Lahan>): any {
  let statusLahan = 1
  if (frontend.status === 'Pemulihan') statusLahan = 2
  else if (frontend.status === 'Perlu Pengairan') statusLahan = 3

  return {
    id_lahan: frontend.id,
    kode_lahan: frontend.kode_lahan,
    status_lahan: statusLahan,
    varietas: frontend.nama_lahan || '',
    tanggal_tanam: frontend.created_at || new Date().toISOString().split('T')[0],
    fase_tanam: frontend.lokasi || '',
  }
}

export const lahanApi = {
  getList: async (): Promise<Lahan[]> => {
    const list = await apiClient.get<any>('/api/v1/lahan')
    return (list || []).map(mapBackendLahanToFrontend)
  },
  getById: async (id: number): Promise<Lahan> => {
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
  update: async (id: number, payload: Partial<Lahan>): Promise<Lahan> => {
    const mapped = mapFrontendLahanToBackend(payload)
    const res = await apiClient.put<any>(`/api/v1/lahan/${id}`, mapped)
    return mapBackendLahanToFrontend(res)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/v1/lahan/${id}`)
  },
}

// ============ Pohon (Trees) ============
export interface Pohon {
  id: number
  kode_pohon: string
  nama_pohon: string
  jenis: string
  umur: number
  id_lahan: number
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
  getById: async (id: number): Promise<Pohon> => {
    const res = await apiClient.get<any>(`/api/v1/pohon/${id}`)
    return mapBackendPohonToFrontend(res)
  },
  create: async (payload: Partial<Pohon>): Promise<Pohon> => {
    const mapped = mapFrontendPohonToBackend(payload)
    const res = await apiClient.post<any>('/api/v1/pohon', mapped)
    return mapBackendPohonToFrontend(res)
  },
  update: async (id: number, payload: Partial<Pohon>): Promise<Pohon> => {
    const mapped = mapFrontendPohonToBackend(payload)
    const res = await apiClient.put<any>(`/api/v1/pohon/${id}`, mapped)
    return mapBackendPohonToFrontend(res)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/v1/pohon/${id}`)
  },
}

// ============ Aktivitas (Activities/Operations) ============
export interface Aktivitas {
  id: number
  nama_aktivitas: string
  deskripsi: string
  tanggal_mulai: string
  tanggal_selesai?: string
  id_lahan: number
  status: string
  created_at: string
  updated_at: string
}

export const aktivitasApi = {
  getList: async (): Promise<Aktivitas[]> => {
    return await apiClient.get('/api/v1/aktivitas')
  },
  getById: async (id: number): Promise<Aktivitas> => {
    return await apiClient.get(`/api/v1/aktivitas/${id}`)
  },
  create: async (payload: Partial<Aktivitas>): Promise<Aktivitas> => {
    return await apiClient.post('/api/v1/aktivitas', payload)
  },
  update: async (id: number, payload: Partial<Aktivitas>): Promise<Aktivitas> => {
    return await apiClient.put(`/api/v1/aktivitas/${id}`, payload)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/v1/aktivitas/${id}`)
  },
}

// ============ Perawatan (Tree Care) ============
export interface Perawatan {
  id: number
  jenis_perawatan: string
  deskripsi: string
  tanggal_perawatan: string
  id_pohon: number
  status: string
  created_at: string
  updated_at: string
}

export const perawatanApi = {
  getList: async (): Promise<Perawatan[]> => {
    return await apiClient.get('/api/v1/perawatan')
  },
  getById: async (id: number): Promise<Perawatan> => {
    return await apiClient.get(`/api/v1/perawatan/${id}`)
  },
  create: async (payload: Partial<Perawatan>): Promise<Perawatan> => {
    return await apiClient.post('/api/v1/perawatan', payload)
  },
  update: async (id: number, payload: Partial<Perawatan>): Promise<Perawatan> => {
    return await apiClient.put(`/api/v1/perawatan/${id}`, payload)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/v1/perawatan/${id}`)
  },
}

// ============ Pemangkasan (Pruning) ============
export interface Pemangkasan {
  id: number
  tanggal_pemangkasan: string
  deskripsi: string
  id_pohon: number
  status: string
  created_at: string
  updated_at: string
}

export const pemangkasanApi = {
  getList: async (): Promise<Pemangkasan[]> => {
    return await apiClient.get('/api/v1/pemangkasan')
  },
  getById: async (id: number): Promise<Pemangkasan> => {
    return await apiClient.get(`/api/v1/pemangkasan/${id}`)
  },
  create: async (payload: Partial<Pemangkasan>): Promise<Pemangkasan> => {
    return await apiClient.post('/api/v1/pemangkasan', payload)
  },
  update: async (id: number, payload: Partial<Pemangkasan>): Promise<Pemangkasan> => {
    return await apiClient.put(`/api/v1/pemangkasan/${id}`, payload)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/v1/pemangkasan/${id}`)
  },
}

// ============ Panen (Harvest) ============
export interface Panen {
  id: number
  tanggal_panen: string
  jumlah_panen: number
  unit: string
  id_pohon: number
  status: string
  created_at: string
  updated_at: string
}

export const panenApi = {
  getList: async (): Promise<Panen[]> => {
    return await apiClient.get('/api/v1/panen')
  },
  getRecap: async (): Promise<any> => {
    return await apiClient.get('/api/v1/panen/rekap')
  },
  getById: async (id: number): Promise<Panen> => {
    return await apiClient.get(`/api/v1/panen/${id}`)
  },
  create: async (payload: Partial<Panen>): Promise<Panen> => {
    return await apiClient.post('/api/v1/panen', payload)
  },
  update: async (id: number, payload: Partial<Panen>): Promise<Panen> => {
    return await apiClient.put(`/api/v1/panen/${id}`, payload)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/v1/panen/${id}`)
  },
}

// ============ Akun Lahan (Account-Land Assignment) ============
export interface AkunLahan {
  id: number
  id_akun: number
  id_lahan: number
  role: string
  created_at: string
  updated_at: string
}

export const akunLahanApi = {
  getList: async (): Promise<AkunLahan[]> => {
    return await apiClient.get('/api/v1/akun-lahan')
  },
  getById: async (id: number): Promise<AkunLahan> => {
    return await apiClient.get(`/api/v1/akun-lahan/${id}`)
  },
  create: async (payload: Partial<AkunLahan>): Promise<AkunLahan> => {
    return await apiClient.post('/api/v1/akun-lahan', payload)
  },
  update: async (id: number, payload: Partial<AkunLahan>): Promise<AkunLahan> => {
    return await apiClient.put(`/api/v1/akun-lahan/${id}`, payload)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/v1/akun-lahan/${id}`)
  },
}

// ============ Pengingat Jadwal (Schedule Reminders) ============
export interface PengingatJadwal {
  id: number
  judul: string
  deskripsi: string
  tanggal_jadwal: string
  is_recurring: boolean
  frequency?: string
  status: string
  created_at: string
  updated_at: string
}

export const pengingatJadwalApi = {
  getList: async (): Promise<PengingatJadwal[]> => {
    return await apiClient.get('/api/v1/pengingat-jadwal')
  },
  getById: async (id: number): Promise<PengingatJadwal> => {
    return await apiClient.get(`/api/v1/pengingat-jadwal/${id}`)
  },
  create: async (payload: Partial<PengingatJadwal>): Promise<PengingatJadwal> => {
    return await apiClient.post('/api/v1/pengingat-jadwal', payload)
  },
  update: async (id: number, payload: Partial<PengingatJadwal>): Promise<PengingatJadwal> => {
    return await apiClient.put(`/api/v1/pengingat-jadwal/${id}`, payload)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/v1/pengingat-jadwal/${id}`)
  },
}

// ============ Notifikasi (Notifications - Gardening) ============
export interface Notifikasi {
  id: number
  user_id: number
  judul: string
  pesan: string
  is_read: boolean
  created_at: string
  updated_at: string
}

export const notifikasiApi = {
  getList: async (): Promise<Notifikasi[]> => {
    return await apiClient.get('/api/v1/notifikasi')
  },
  getById: async (id: number): Promise<Notifikasi> => {
    return await apiClient.get(`/api/v1/notifikasi/${id}`)
  },
  create: async (payload: Partial<Notifikasi>): Promise<Notifikasi> => {
    return await apiClient.post('/api/v1/notifikasi', payload)
  },
  update: async (id: number, payload: Partial<Notifikasi>): Promise<Notifikasi> => {
    return await apiClient.put(`/api/v1/notifikasi/${id}`, payload)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/v1/notifikasi/${id}`)
  },
}

// ============ Status Aktivitas (Activity Status) ============
export interface StatusAktivitas {
  id: number
  nama_status: string
  deskripsi?: string
  urutan: number
  created_at: string
  updated_at: string
}

export const statusAktivitasApi = {
  getList: async (): Promise<StatusAktivitas[]> => {
    return await apiClient.get('/api/v1/status-aktivitas')
  },
  getById: async (id: number): Promise<StatusAktivitas> => {
    return await apiClient.get(`/api/v1/status-aktivitas/${id}`)
  },
  create: async (payload: Partial<StatusAktivitas>): Promise<StatusAktivitas> => {
    return await apiClient.post('/api/v1/status-aktivitas', payload)
  },
  update: async (id: number, payload: Partial<StatusAktivitas>): Promise<StatusAktivitas> => {
    return await apiClient.put(`/api/v1/status-aktivitas/${id}`, payload)
  },
  delete: async (id: number): Promise<void> => {
    return await apiClient.delete(`/api/v1/status-aktivitas/${id}`)
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
  pengingatJadwal: pengingatJadwalApi,
  notifikasi: notifikasiApi,
  statusAktivitas: statusAktivitasApi,
}
