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

export const aktivitasApi = {
  getList: async (): Promise<Aktivitas[]> => {
    return await apiClient.get('/api/v1/aktivitas')
  },
  getById: async (id: string | number): Promise<Aktivitas> => {
    return await apiClient.get(`/api/v1/aktivitas/${id}`)
  },
  create: async (payload: Partial<Aktivitas>): Promise<Aktivitas> => {
    return await apiClient.post('/api/v1/aktivitas', payload)
  },
  update: async (id: string | number, payload: Partial<Aktivitas>): Promise<Aktivitas> => {
    return await apiClient.put(`/api/v1/aktivitas/${id}`, payload)
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

export const perawatanApi = {
  getList: async (): Promise<Perawatan[]> => {
    return await apiClient.get('/api/v1/perawatan')
  },
  getById: async (id: string | number): Promise<Perawatan> => {
    return await apiClient.get(`/api/v1/perawatan/${id}`)
  },
  create: async (payload: Partial<Perawatan>): Promise<Perawatan> => {
    return await apiClient.post('/api/v1/perawatan', payload)
  },
  update: async (id: string | number, payload: Partial<Perawatan>): Promise<Perawatan> => {
    return await apiClient.put(`/api/v1/perawatan/${id}`, payload)
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

export const pemangkasanApi = {
  getList: async (): Promise<Pemangkasan[]> => {
    return await apiClient.get('/api/v1/pemangkasan')
  },
  getById: async (id: string | number): Promise<Pemangkasan> => {
    return await apiClient.get(`/api/v1/pemangkasan/${id}`)
  },
  create: async (payload: Partial<Pemangkasan>): Promise<Pemangkasan> => {
    return await apiClient.post('/api/v1/pemangkasan', payload)
  },
  update: async (id: string | number, payload: Partial<Pemangkasan>): Promise<Pemangkasan> => {
    return await apiClient.put(`/api/v1/pemangkasan/${id}`, payload)
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

export const panenApi = {
  getList: async (): Promise<Panen[]> => {
    return await apiClient.get('/api/v1/panen')
  },
  getRecap: async (): Promise<any> => {
    return await apiClient.get('/api/v1/panen/rekap')
  },
  getById: async (id: string | number): Promise<Panen> => {
    return await apiClient.get(`/api/v1/panen/${id}`)
  },
  create: async (payload: Partial<Panen>): Promise<Panen> => {
    return await apiClient.post('/api/v1/panen', payload)
  },
  update: async (id: string | number, payload: Partial<Panen>): Promise<Panen> => {
    return await apiClient.put(`/api/v1/panen/${id}`, payload)
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

// ============ Jadwal Rutin (Routine Schedules) ============
export interface JadwalRutin {
  id: string | number
  judul: string
  deskripsi: string
  tanggal_jadwal: string
  is_recurring: boolean
  frequency?: string
  status: string
  created_at: string
  updated_at: string
}

export const jadwalRutinApi = {
  getList: async (): Promise<JadwalRutin[]> => {
    return await apiClient.get('/api/v1/jadwal-rutin')
  },
  getById: async (id: string | number): Promise<JadwalRutin> => {
    return await apiClient.get(`/api/v1/jadwal-rutin/${id}`)
  },
  create: async (payload: Partial<JadwalRutin>): Promise<JadwalRutin> => {
    return await apiClient.post('/api/v1/jadwal-rutin', payload)
  },
  update: async (id: string | number, payload: Partial<JadwalRutin>): Promise<JadwalRutin> => {
    return await apiClient.put(`/api/v1/jadwal-rutin/${id}`, payload)
  },
  delete: async (id: string | number): Promise<void> => {
    return await apiClient.delete(`/api/v1/jadwal-rutin/${id}`)
  },
}

// ============ Notifikasi (Notifications - Gardening) ============
export interface Notifikasi {
  id: string | number
  user_id: string | number
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
  getById: async (id: string | number): Promise<Notifikasi> => {
    return await apiClient.get(`/api/v1/notifikasi/${id}`)
  },
  create: async (payload: Partial<Notifikasi>): Promise<Notifikasi> => {
    return await apiClient.post('/api/v1/notifikasi', payload)
  },
  update: async (id: string | number, payload: Partial<Notifikasi>): Promise<Notifikasi> => {
    return await apiClient.put(`/api/v1/notifikasi/${id}`, payload)
  },
  delete: async (id: string | number): Promise<void> => {
    return await apiClient.delete(`/api/v1/notifikasi/${id}`)
  },
}

// ============ Status Aktivitas (Activity Status) ============
export interface StatusAktivitas {
  id: string | number
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
  getById: async (id: string | number): Promise<StatusAktivitas> => {
    return await apiClient.get(`/api/v1/status-aktivitas/${id}`)
  },
  create: async (payload: Partial<StatusAktivitas>): Promise<StatusAktivitas> => {
    return await apiClient.post('/api/v1/status-aktivitas', payload)
  },
  update: async (id: string | number, payload: Partial<StatusAktivitas>): Promise<StatusAktivitas> => {
    return await apiClient.put(`/api/v1/status-aktivitas/${id}`, payload)
  },
  delete: async (id: string | number): Promise<void> => {
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
  jadwalRutin: jadwalRutinApi,
  notifikasi: notifikasiApi,
  statusAktivitas: statusAktivitasApi,
}
