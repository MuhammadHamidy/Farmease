import { kebunClient as apiClient } from './client'

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
  code?: string
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
    code: backend.kode_lahan,
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
    const [penyiraman, pembersihan, penanaman, pengobatan, pembuahan] = await Promise.all([
      apiClient.get<any[]>('/api/v1/penyiraman').catch(() => []),
      apiClient.get<any[]>('/api/v1/pembersihan').catch(() => []),
      apiClient.get<any[]>('/api/v1/penanaman').catch(() => []),
      apiClient.get<any[]>('/api/v1/pengobatan').catch(() => []),
      apiClient.get<any[]>('/api/v1/pembuahan').catch(() => [])
    ])

    const list: Perawatan[] = []

    if (Array.isArray(penyiraman)) {
      penyiraman.forEach((item: any) => {
        list.push({
          id: item.id_penyiraman || '',
          jenis_perawatan: item.nama_jenis_aktivitas || 'Penyiraman',
          deskripsi: item.deskripsi || '',
          tanggal_perawatan: item.tanggal_aktivitas || '',
          id_pohon: item.Lahan_id_lahan || '',
          status: 'selesai',
          created_at: item.created_at || '',
          updated_at: item.updated_at || ''
        })
      })
    }

    if (Array.isArray(pembersihan)) {
      pembersihan.forEach((item: any) => {
        list.push({
          id: item.id_pembersihan || '',
          jenis_perawatan: item.nama_jenis_aktivitas || 'Pembersihan',
          deskripsi: item.deskripsi || '',
          tanggal_perawatan: item.tanggal_aktivitas || '',
          id_pohon: item.Lahan_id_lahan || '',
          status: 'selesai',
          created_at: item.created_at || '',
          updated_at: item.updated_at || ''
        })
      })
    }

    if (Array.isArray(penanaman)) {
      penanaman.forEach((item: any) => {
        list.push({
          id: item.id_penanaman || '',
          jenis_perawatan: item.nama_jenis_aktivitas || 'Penanaman',
          deskripsi: `${item.varietas || ''}: ${item.deskripsi || ''}`,
          tanggal_perawatan: item.tanggal_aktivitas || '',
          id_pohon: item.Lahan_id_lahan || '',
          status: 'selesai',
          created_at: item.created_at || '',
          updated_at: item.updated_at || ''
        })
      })
    }

    if (Array.isArray(pengobatan)) {
      pengobatan.forEach((item: any) => {
        const type = item.nama_jenis_aktivitas || 'Pemberian Obat'
        list.push({
          id: item.id_pengobatan || '',
          jenis_perawatan: type,
          deskripsi: `${item.nama_obat || ''} (${item.dosis || 0} ${item.satuan || ''}) - ${item.deskripsi || ''}`,
          tanggal_perawatan: item.tanggal_aktivitas || '',
          id_pohon: item.Lahan_id_lahan || '',
          status: 'selesai',
          created_at: item.created_at || '',
          updated_at: item.updated_at || ''
        })
      })
    }

    if (Array.isArray(pembuahan)) {
      pembuahan.forEach((item: any) => {
        list.push({
          id: item.id_pembuahan || '',
          jenis_perawatan: item.nama_jenis_aktivitas || 'Pembuahan',
          deskripsi: item.deskripsi || '',
          tanggal_perawatan: item.tanggal_aktivitas || '',
          id_pohon: item.Lahan_id_lahan || '',
          status: 'selesai',
          created_at: item.created_at || '',
          updated_at: item.updated_at || ''
        })
      })
    }

    // Sort by date descending
    return list.sort((a, b) => new Date(b.tanggal_perawatan).getTime() - new Date(a.tanggal_perawatan).getTime())
  },

  getById: async (id: string | number): Promise<Perawatan> => {
    const endpoints = [
      { url: '/api/v1/penyiraman', type: 'Penyiraman', key: 'id_penyiraman' },
      { url: '/api/v1/pembersihan', type: 'Pembersihan', key: 'id_pembersihan' },
      { url: '/api/v1/penanaman', type: 'Penanaman', key: 'id_penanaman' },
      { url: '/api/v1/pengobatan', type: 'Pemberian Obat', key: 'id_pengobatan' },
      { url: '/api/v1/pembuahan', type: 'Pembuahan', key: 'id_pembuahan' }
    ]

    for (const ep of endpoints) {
      try {
        const item = await apiClient.get<any>(`${ep.url}/${id}`)
        if (item && (item.id || item[ep.key])) {
          return {
            id: item[ep.key] || item.id,
            jenis_perawatan: item.nama_jenis_aktivitas || ep.type,
            deskripsi: ep.type === 'Pemberian Obat' 
              ? `${item.nama_obat || ''} (${item.dosis || 0} ${item.satuan || ''}) - ${item.deskripsi || ''}` 
              : (ep.type === 'Penanaman' ? `${item.varietas || ''}: ${item.deskripsi || ''}` : (item.deskripsi || '')),
            tanggal_perawatan: item.tanggal_aktivitas || '',
            id_pohon: item.Lahan_id_lahan || '',
            status: 'selesai',
            created_at: item.created_at || '',
            updated_at: item.updated_at || ''
          }
        }
      } catch {
        // Continue searching
      }
    }
    throw new Error('Record not found in any split modules')
  },

  create: async (payload: any): Promise<Perawatan> => {
    const name = (payload.nama_jenis_aktivitas || '').toLowerCase()
    const rawJenis = (payload.jenis_bahan || '').toLowerCase()
    const rincian = (payload.nama_rincian_aktivitas || '').toLowerCase()

    if (name === 'penyiraman' || rawJenis === 'air' || rincian.includes('siram')) {
      const res = await apiClient.post<any>('/api/v1/penyiraman', {
        tanggal_aktivitas: payload.tanggal_aktivitas,
        nama_rincian_aktivitas: payload.nama_rincian_aktivitas,
        teknik_penyiraman: payload.teknik_perawatan || 'Siram Manual',
        deskripsi: payload.deskripsi || '',
        Lahan_id_lahan: payload.Lahan_id_lahan || payload.id_pohon
      })
      return {
        id: res.id_penyiraman,
        jenis_perawatan: 'Penyiraman',
        deskripsi: res.deskripsi,
        tanggal_perawatan: res.tanggal_aktivitas,
        id_pohon: res.Lahan_id_lahan,
        status: 'selesai',
        created_at: res.created_at,
        updated_at: res.updated_at
      }
    }

    if (name === 'pembersihan' || rawJenis === 'pembersihan' || rincian.includes('siang') || rincian.includes('sanitasi')) {
      const res = await apiClient.post<any>('/api/v1/pembersihan', {
        tanggal_aktivitas: payload.tanggal_aktivitas,
        nama_rincian_aktivitas: payload.nama_rincian_aktivitas,
        teknik_pembersihan: payload.teknik_perawatan || 'Manual',
        deskripsi: payload.deskripsi || '',
        Lahan_id_lahan: payload.Lahan_id_lahan || payload.id_pohon
      })
      return {
        id: res.id_pembersihan,
        jenis_perawatan: 'Pembersihan',
        deskripsi: res.deskripsi,
        tanggal_perawatan: res.tanggal_aktivitas,
        id_pohon: res.Lahan_id_lahan,
        status: 'selesai',
        created_at: res.created_at,
        updated_at: res.updated_at
      }
    }

    if (name === 'penanaman' || rawJenis === 'bibit' || rincian.includes('bibit') || rincian.includes('tanam')) {
      const res = await apiClient.post<any>('/api/v1/penanaman', {
        tanggal_aktivitas: payload.tanggal_aktivitas,
        nama_rincian_aktivitas: payload.nama_rincian_aktivitas,
        fase_pohon: payload.fase_pohon || 'Vegetatif',
        varietas: payload.nama_obat || payload.varietas || 'Bibit Baru',
        deskripsi: payload.deskripsi || '',
        Lahan_id_lahan: payload.Lahan_id_lahan || payload.id_pohon
      })
      return {
        id: res.id_penanaman,
        jenis_perawatan: 'Penanaman',
        deskripsi: res.deskripsi,
        tanggal_perawatan: res.tanggal_aktivitas,
        id_pohon: res.Lahan_id_lahan,
        status: 'selesai',
        created_at: res.created_at,
        updated_at: res.updated_at
      }
    }

    if (name === 'pemberian obat' || rawJenis === 'obat' || rawJenis === 'pupuk' || rincian.includes('pupuk') || rincian.includes('obat') || name.includes('obat') || name.includes('pupuk')) {
      const isPupuk = rawJenis === 'pupuk' || rincian.includes('pupuk') || name.includes('pupuk')
      const res = await apiClient.post<any>('/api/v1/pengobatan', {
        tanggal_aktivitas: payload.tanggal_aktivitas,
        nama_rincian_aktivitas: payload.nama_rincian_aktivitas,
        nama_obat: payload.nama_obat || (isPupuk ? 'Pupuk' : 'Obat'),
        dosis: payload.dosis || 0,
        satuan: payload.satuan || (isPupuk ? 'kg' : 'ml'),
        bagian_pohon: ['Daun', 'Akar', 'Batang', 'Buah', 'Bunga', 'Lahan', 'Tanah', 'Umum'].includes(payload.bagian_pohon) ? payload.bagian_pohon : 'Umum',
        deskripsi: payload.deskripsi || '',
        Lahan_id_lahan: payload.Lahan_id_lahan || payload.id_pohon
      })
      return {
        id: res.id_pengobatan,
        jenis_perawatan: isPupuk ? 'Pemupukan' : 'Pemberian Obat',
        deskripsi: `${res.nama_obat} (${res.dosis} ${res.satuan}) - ${res.deskripsi}`,
        tanggal_perawatan: res.tanggal_aktivitas,
        id_pohon: res.Lahan_id_lahan,
        status: 'selesai',
        created_at: res.created_at,
        updated_at: res.updated_at
      }
    }

    const res = await apiClient.post<any>('/api/v1/pembuahan', {
      tanggal_aktivitas: payload.tanggal_aktivitas,
      nama_rincian_aktivitas: payload.nama_rincian_aktivitas,
      fase_pohon: payload.fase_pohon || 'Generatif',
      teknik_pembuahan: payload.teknik_perawatan || 'Perangsang',
      deskripsi: payload.deskripsi || '',
      Lahan_id_lahan: payload.Lahan_id_lahan || payload.id_pohon
    })
    return {
      id: res.id_pembuahan,
      jenis_perawatan: 'Pembuahan',
      deskripsi: res.deskripsi,
      tanggal_perawatan: res.tanggal_aktivitas,
      id_pohon: res.Lahan_id_lahan,
      status: 'selesai',
      created_at: res.created_at,
      updated_at: res.updated_at
    }
  },

  update: async (id: string | number, payload: any): Promise<Perawatan> => {
    const name = (payload.nama_jenis_aktivitas || '').toLowerCase()
    const rawJenis = (payload.jenis_bahan || '').toLowerCase()

    if (name === 'penyiraman' || rawJenis === 'air') {
      const res = await apiClient.put<any>(`/api/v1/penyiraman/${id}`, {
        tanggal_aktivitas: payload.tanggal_aktivitas,
        nama_rincian_aktivitas: payload.nama_rincian_aktivitas,
        teknik_penyiraman: payload.teknik_perawatan,
        deskripsi: payload.deskripsi,
        Lahan_id_lahan: payload.Lahan_id_lahan || payload.id_pohon
      })
      return {
        id: res.id_penyiraman,
        jenis_perawatan: 'Penyiraman',
        deskripsi: res.deskripsi,
        tanggal_perawatan: res.tanggal_aktivitas,
        id_pohon: res.Lahan_id_lahan,
        status: 'selesai',
        created_at: res.created_at,
        updated_at: res.updated_at
      }
    }
    if (name === 'pembersihan' || rawJenis === 'pembersihan') {
      const res = await apiClient.put<any>(`/api/v1/pembersihan/${id}`, {
        tanggal_aktivitas: payload.tanggal_aktivitas,
        nama_rincian_aktivitas: payload.nama_rincian_aktivitas,
        teknik_pembersihan: payload.teknik_perawatan,
        deskripsi: payload.deskripsi,
        Lahan_id_lahan: payload.Lahan_id_lahan || payload.id_pohon
      })
      return {
        id: res.id_pembersihan,
        jenis_perawatan: 'Pembersihan',
        deskripsi: res.deskripsi,
        tanggal_perawatan: res.tanggal_aktivitas,
        id_pohon: res.Lahan_id_lahan,
        status: 'selesai',
        created_at: res.created_at,
        updated_at: res.updated_at
      }
    }
    if (name === 'penanaman' || rawJenis === 'bibit') {
      const res = await apiClient.put<any>(`/api/v1/penanaman/${id}`, {
        tanggal_aktivitas: payload.tanggal_aktivitas,
        nama_rincian_aktivitas: payload.nama_rincian_aktivitas,
        fase_pohon: payload.fase_pohon,
        varietas: payload.nama_obat || payload.varietas,
        deskripsi: payload.deskripsi,
        Lahan_id_lahan: payload.Lahan_id_lahan || payload.id_pohon
      })
      return {
        id: res.id_penanaman,
        jenis_perawatan: 'Penanaman',
        deskripsi: res.deskripsi,
        tanggal_perawatan: res.tanggal_aktivitas,
        id_pohon: res.Lahan_id_lahan,
        status: 'selesai',
        created_at: res.created_at,
        updated_at: res.updated_at
      }
    }
    if (name === 'pemberian obat' || rawJenis === 'obat' || rawJenis === 'pupuk') {
      const isPupuk = rawJenis === 'pupuk'
      const res = await apiClient.put<any>(`/api/v1/pengobatan/${id}`, {
        tanggal_aktivitas: payload.tanggal_aktivitas,
        nama_rincian_aktivitas: payload.nama_rincian_aktivitas,
        nama_obat: payload.nama_obat,
        dosis: payload.dosis,
        satuan: payload.satuan,
        bagian_pohon: ['Daun', 'Akar', 'Batang', 'Buah', 'Bunga', 'Lahan', 'Tanah', 'Umum'].includes(payload.bagian_pohon) ? payload.bagian_pohon : 'Umum',
        deskripsi: payload.deskripsi,
        Lahan_id_lahan: payload.Lahan_id_lahan || payload.id_pohon
      })
      return {
        id: res.id_pengobatan,
        jenis_perawatan: isPupuk ? 'Pemupukan' : 'Pemberian Obat',
        deskripsi: `${res.nama_obat} (${res.dosis} ${res.satuan}) - ${res.deskripsi}`,
        tanggal_perawatan: res.tanggal_aktivitas,
        id_pohon: res.Lahan_id_lahan,
        status: 'selesai',
        created_at: res.created_at,
        updated_at: res.updated_at
      }
    }
    const res = await apiClient.put<any>(`/api/v1/pembuahan/${id}`, {
      tanggal_aktivitas: payload.tanggal_aktivitas,
      nama_rincian_aktivitas: payload.nama_rincian_aktivitas,
      fase_pohon: payload.fase_pohon,
      teknik_pembuahan: payload.teknik_perawatan,
      deskripsi: payload.deskripsi,
      Lahan_id_lahan: payload.Lahan_id_lahan || payload.id_pohon
    })
    return {
      id: res.id_pembuahan,
      jenis_perawatan: 'Pembuahan',
      deskripsi: res.deskripsi,
      tanggal_perawatan: res.tanggal_aktivitas,
      id_pohon: res.Lahan_id_lahan,
      status: 'selesai',
      created_at: res.created_at,
      updated_at: res.updated_at
    }
  },

  delete: async (id: string | number): Promise<void> => {
    const urls = [
      `/api/v1/penyiraman/${id}`,
      `/api/v1/pembersihan/${id}`,
      `/api/v1/penanaman/${id}`,
      `/api/v1/pengobatan/${id}`,
      `/api/v1/pembuahan/${id}`
    ]
    for (const url of urls) {
      try {
        await apiClient.delete(url)
        return
      } catch {
        // Continue
      }
    }
  },
}

// ============ Pemangkasan (Pruning) ============
export interface Pemangkasan {
  id_pemangkasan: string
  Aktivitas_id_aktivitas: string
  tanggal_aktivitas?: string
  nama_jenis_aktivitas?: string
  nama_rincian_aktivitas?: string
  jumlah: string | number
  satuan: string
  keterangan: string
  Lahan_id_lahan: string

  // Backward compatibility fields
  id?: string | number
  tanggal_pemangkasan?: string
  deskripsi?: string
  id_pohon?: string | number
  status?: string
  created_at?: string
  updated_at?: string
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
