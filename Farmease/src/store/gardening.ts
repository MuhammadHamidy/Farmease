import { ref, computed } from 'vue'
import {
  lahanApi,
  pohonApi,
  aktivitasApi,
  perawatanApi,
  panenApi,
  notifikasiApi,
  type Lahan as ApiLahan,
  type Pohon as ApiPohon,
  type Aktivitas as ApiAktivitas,
  type Perawatan as ApiPerawatan,
  type Panen as ApiPanen,
  type Notifikasi as ApiNotifikasi,
} from '@/shared/api'

export interface Lahan {
  id: string
  code: string
  name: string
  area: string
  status: string
  crops_count?: number
}

export interface Pohon {
  id: string
  code: string
  name: string
  type: string
  age: string
  lahan_code: string
  planting_date: string
  status: string
}

export interface Aktivitas {
  id: string
  name: string
  type: string
  pohon_id: string
  date: string
  priority: string
  status: string
}

export interface Perawatan {
  id: string
  pohon_id: string
  type: string
  date: string
  notes: string
}

export interface Panen {
  id: string
  pohon_id: string
  date: string
  quantity: number
  quality: string
}

export interface Notifikasi {
  id: string
  type: string
  message: string
  date: string
  read: boolean
}

function mapLahan(row: ApiLahan): Lahan {
  return {
    id: String(row.id),
    code: row.kode_lahan,
    name: row.nama_lahan,
    area: String(row.luas),
    status: row.status,
  }
}

function mapPohon(row: ApiPohon): Pohon {
  return {
    id: String(row.id),
    code: row.kode_pohon,
    name: row.nama_pohon,
    type: row.jenis,
    age: String(row.umur),
    lahan_code: String(row.id_lahan),
    planting_date: row.created_at,
    status: row.status,
  }
}

function mapAktivitas(row: ApiAktivitas): Aktivitas {
  return {
    id: String(row.id),
    name: row.nama_aktivitas,
    type: row.deskripsi,
    pohon_id: String(row.id_lahan),
    date: row.tanggal_mulai,
    priority: 'normal',
    status: row.status,
  }
}

function mapPerawatan(row: ApiPerawatan): Perawatan {
  return {
    id: String(row.id),
    pohon_id: String(row.id_pohon),
    type: row.jenis_perawatan,
    date: row.tanggal_perawatan,
    notes: row.deskripsi,
  }
}

function mapPanen(row: ApiPanen): Panen {
  return {
    id: String(row.id),
    pohon_id: String(row.id_pohon),
    date: row.tanggal_panen,
    quantity: row.jumlah_panen,
    quality: row.status,
  }
}

function mapNotifikasi(row: ApiNotifikasi): Notifikasi {
  return {
    id: String(row.id),
    type: row.judul,
    message: row.pesan,
    date: row.created_at,
    read: row.is_read,
  }
}

export const lahan = ref<Lahan[]>([])
export const pohon = ref<Pohon[]>([])
export const aktivitas = ref<Aktivitas[]>([])
export const perawatan = ref<Perawatan[]>([])
export const panen = ref<Panen[]>([])
export const notifikasi = ref<Notifikasi[]>([])

export const loading = ref(false)
export const error = ref<string | null>(null)
export const lastFetch = ref<number>(0)

export const gardeningStats = computed(() => ({
  totalLahan: lahan.value.length,
  totalPohon: pohon.value.length,
  activeAktivitas: aktivitas.value.filter((a) => a.status === 'sedang_berjalan').length,
  unreadNotifikasi: notifikasi.value.filter((n) => !n.read).length,
}))

export async function fetchLahan() {
  if (loading.value) return

  try {
    loading.value = true
    error.value = null
    lahan.value = (await lahanApi.getList()).map(mapLahan)
    lastFetch.value = Date.now()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch lahan'
    console.error('Error fetching lahan:', err)
  } finally {
    loading.value = false
  }
}

export async function fetchPohon(lahanCode?: string) {
  if (loading.value) return

  try {
    loading.value = true
    error.value = null
    const list = (await pohonApi.getList()).map(mapPohon)
    pohon.value = lahanCode ? list.filter((p) => p.lahan_code === lahanCode) : list
    lastFetch.value = Date.now()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch pohon'
    console.error('Error fetching pohon:', err)
  } finally {
    loading.value = false
  }
}

export async function fetchAktivitas() {
  try {
    loading.value = true
    error.value = null
    aktivitas.value = (await aktivitasApi.getList()).map(mapAktivitas)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch aktivitas'
    console.error('Error fetching aktivitas:', err)
  } finally {
    loading.value = false
  }
}

export async function fetchPerawatan() {
  try {
    loading.value = true
    error.value = null
    perawatan.value = (await perawatanApi.getList()).map(mapPerawatan)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch perawatan'
    console.error('Error fetching perawatan:', err)
  } finally {
    loading.value = false
  }
}

export async function fetchPanen() {
  try {
    loading.value = true
    error.value = null
    panen.value = (await panenApi.getList()).map(mapPanen)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch panen'
    console.error('Error fetching panen:', err)
  } finally {
    loading.value = false
  }
}

export async function fetchNotifikasi() {
  try {
    loading.value = true
    error.value = null
    notifikasi.value = (await notifikasiApi.getList()).map(mapNotifikasi)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch notifikasi'
    console.error('Error fetching notifikasi:', err)
  } finally {
    loading.value = false
  }
}

export async function addAktivitas(data: Partial<ApiAktivitas>) {
  try {
    loading.value = true
    error.value = null
    const created = await aktivitasApi.create(data)
    const mapped = mapAktivitas(created)
    aktivitas.value.push(mapped)
    return mapped
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to add aktivitas'
    throw err
  } finally {
    loading.value = false
  }
}

export async function updateAktivitas(id: string, data: Partial<ApiAktivitas>) {
  try {
    loading.value = true
    error.value = null
    const updated = await aktivitasApi.update(Number(id), data)
    const mapped = mapAktivitas(updated)
    const index = aktivitas.value.findIndex((a) => a.id === id)
    if (index !== -1) {
      aktivitas.value[index] = mapped
    }
    return mapped
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to update aktivitas'
    throw err
  } finally {
    loading.value = false
  }
}

export async function addPerawatan(data: Partial<ApiPerawatan>) {
  try {
    loading.value = true
    error.value = null
    const created = await perawatanApi.create(data)
    const mapped = mapPerawatan(created)
    perawatan.value.push(mapped)
    return mapped
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to add perawatan'
    throw err
  } finally {
    loading.value = false
  }
}

export async function refreshGardeningData() {
  try {
    loading.value = true
    error.value = null
    await Promise.all([
      fetchLahan(),
      fetchPohon(),
      fetchAktivitas(),
      fetchPerawatan(),
      fetchPanen(),
      fetchNotifikasi(),
    ])
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to refresh gardening data'
  } finally {
    loading.value = false
  }
}
