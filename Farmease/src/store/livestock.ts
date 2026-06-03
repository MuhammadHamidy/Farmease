import { ref, computed } from 'vue'
import {
  sheepApi,
  cagesApi,
  healthApi,
  weightApi,
  feedsApi,
  type Sheep as ApiSheep,
} from '@/shared/api'

export interface SheepDetail extends ApiSheep {
  cage_code?: string
}

export interface Silsilah {
  id_sheep: number
  sheep_code: string
  sheep_name: string
  gender: string
  sire?: Partial<Silsilah>
  dam?: Partial<Silsilah>
}

export interface Sheep {
  id: string
  code: string
  name: string
  type: string
  gender: string
  birth_date: string
  age: string
  weight: string
  status: string
  notifications: number
  cage_code: string
}

export interface Cage {
  id: string
  code: string
  name: string
  type: string
  capacity: number
  total_sheep?: number
}

export interface HealthRecord {
  id: string
  sheep_id: string
  date: string
  status: string
  notes: string
}

export interface WeightRecord {
  id: string
  sheep_id: string
  date: string
  weight: number
}

export interface FeedRecord {
  id: string
  sheep_id: string
  type: string
  quantity: number
  date: string
}

import { cagesList } from './navigation'

function mapSheep(row: ApiSheep): Sheep {
  const cage = cagesList.value.find((c) => c.id === row.id_cage)
  return {
    id: String(row.id_sheep),
    code: row.sheep_code,
    name: row.sheep_name,
    type: String(row.id_type),
    gender: row.gender,
    birth_date: row.date_of_birth,
    age: '',
    weight: '',
    status: row.status,
    notifications: 0,
    cage_code: cage ? cage.code : String(row.id_cage),
  }
}

export const sheep = ref<Sheep[]>([])
export const cages = ref<Cage[]>([])
export const healthRecords = ref<HealthRecord[]>([])
export const weightRecords = ref<WeightRecord[]>([])
export const feedRecords = ref<FeedRecord[]>([])

export const loading = ref(false)
export const error = ref<string | null>(null)
export const lastFetch = ref<number>(0)

export const sheepStats = computed(() => ({
  total: sheep.value.length,
  healthy: sheep.value.filter((s) => s.status === 'Sehat').length,
  alert: sheep.value.filter((s) => s.status === 'Sakit' || s.status === 'Hamil').length,
  pregnant: sheep.value.filter((s) => s.status === 'Hamil').length,
}))

export async function fetchSheep(cageCode?: string) {
  if (loading.value) return

  try {
    loading.value = true
    error.value = null

    const list = await sheepApi.getList()
    const mapped = list.map(mapSheep)
    sheep.value = cageCode
      ? mapped.filter((s) => s.cage_code === cageCode)
      : mapped
    lastFetch.value = Date.now()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch sheep'
    console.error('Error fetching sheep:', err)
  } finally {
    loading.value = false
  }
}

export async function fetchCages() {
  if (loading.value) return

  try {
    loading.value = true
    error.value = null

    const list = await cagesApi.getList()
    cages.value = list.map((c) => ({
      id: String(c.id_cage),
      code: c.cage_code,
      name: c.cage_name || `Kandang ${c.cage_code}`,
      type: c.cage_type || c.location || 'campuran',
      capacity: c.capacity,
    }))
    lastFetch.value = Date.now()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch cages'
    console.error('Error fetching cages:', err)
  } finally {
    loading.value = false
  }
}

export async function fetchHealthRecords(sheepId?: string) {
  try {
    loading.value = true
    error.value = null

    if (sheepId) {
      const list = await healthApi.getList(Number(sheepId))
      healthRecords.value = list.map((h) => ({
        id: String(h.id),
        sheep_id: String(h.id_sheep),
        date: h.date_recorded,
        status: h.health_status,
        notes: h.description,
      }))
    } else {
      const list = await healthApi.getGlobalList()
      healthRecords.value = list.map((h) => ({
        id: String(h.id),
        sheep_id: String(h.id_sheep),
        date: h.date_recorded,
        status: h.health_status,
        notes: h.description,
      }))
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch health records'
    console.error('Error fetching health records:', err)
  } finally {
    loading.value = false
  }
}

export async function fetchWeightRecords(sheepId?: string) {
  try {
    loading.value = true
    error.value = null

    const list = sheepId
      ? await weightApi.getSheepHistory(Number(sheepId))
      : await weightApi.getList()

    weightRecords.value = list.map((w) => ({
      id: String(w.id),
      sheep_id: String(w.id_sheep),
      date: w.date_recorded,
      weight: w.weight,
    }))
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch weight records'
    console.error('Error fetching weight records:', err)
  } finally {
    loading.value = false
  }
}

export async function fetchFeedRecords(sheepId?: string) {
  try {
    loading.value = true
    error.value = null

    if (sheepId) {
      const list = await feedsApi.getFeedingHistory(Number(sheepId))
      feedRecords.value = (list as FeedRecord[]) ?? []
    } else {
      const list = await feedsApi.getList()
      feedRecords.value = list.map((f) => ({
        id: String(f.id),
        sheep_id: '',
        type: f.feed_type,
        quantity: f.stock,
        date: f.created_at,
      }))
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch feed records'
    console.error('Error fetching feed records:', err)
  } finally {
    loading.value = false
  }
}

export async function addSheep(data: Record<string, unknown>) {
  try {
    loading.value = true
    error.value = null

    const created = await sheepApi.create(data as Partial<ApiSheep>)
    const mapped = mapSheep(created)
    sheep.value.push(mapped)
    return mapped
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to add sheep'
    throw err
  } finally {
    loading.value = false
  }
}

export async function updateSheep(id: string, data: Record<string, unknown>) {
  try {
    loading.value = true
    error.value = null

    const updated = await sheepApi.update(Number(id), data as Partial<ApiSheep>)
    const mapped = mapSheep(updated)
    const index = sheep.value.findIndex((s) => s.id === id)
    if (index !== -1) {
      sheep.value[index] = mapped
    }
    return mapped
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to update sheep'
    throw err
  } finally {
    loading.value = false
  }
}

export async function addHealthRecord(sheepId: string, data: Record<string, unknown>) {
  try {
    loading.value = true
    error.value = null

    const created = await healthApi.create(Number(sheepId), data)
    const record: HealthRecord = {
      id: String(created.id),
      sheep_id: String(created.id_sheep),
      date: created.date_recorded,
      status: created.health_status,
      notes: created.description,
    }
    healthRecords.value.push(record)
    return record
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to add health record'
    throw err
  } finally {
    loading.value = false
  }
}

export async function addWeightRecord(sheepId: string, data: Record<string, unknown>) {
  try {
    loading.value = true
    error.value = null

    const created = await weightApi.record(Number(sheepId), data)
    const record: WeightRecord = {
      id: String(created.id),
      sheep_id: String(created.id_sheep),
      date: created.date_recorded,
      weight: created.weight,
    }
    weightRecords.value.push(record)
    return record
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to add weight record'
    throw err
  } finally {
    loading.value = false
  }
}

export const currentSheepDetail = ref<ApiSheep | null>(null)
export const currentSilsilah = ref<Silsilah | null>(null)
export const currentHealthRecords = ref<HealthRecord[]>([])
export const currentWeightRecords = ref<WeightRecord[]>([])
export const detailLoading = ref(false)
export const detailError = ref<string | null>(null)

export async function fetchSheepById(id: number) {
  try {
    detailLoading.value = true
    detailError.value = null
    currentSheepDetail.value = await sheepApi.getById(id)
  } catch (err: unknown) {
    detailError.value = err instanceof Error ? err.message : 'Gagal memuat data domba'
    console.error('Error fetching sheep detail:', err)
  } finally {
    detailLoading.value = false
  }
}

export async function fetchSilsilah(id: number) {
  try {
    detailLoading.value = true
    detailError.value = null
    currentSilsilah.value = await sheepApi.getSilsilah(id)
  } catch (err: unknown) {
    detailError.value = err instanceof Error ? err.message : 'Gagal memuat silsilah'
    console.error('Error fetching silsilah:', err)
  } finally {
    detailLoading.value = false
  }
}

export async function fetchHealthForSheep(id: number) {
  try {
    detailError.value = null
    const list = await healthApi.getList(id)
    currentHealthRecords.value = list.map((h) => ({
      id: String(h.id),
      sheep_id: String(h.id_sheep),
      date: h.date_recorded,
      status: h.health_status,
      notes: h.description,
    }))
  } catch (err: unknown) {
    detailError.value = err instanceof Error ? err.message : 'Gagal memuat riwayat kesehatan'
    console.error('Error fetching health records:', err)
  }
}

export async function fetchWeightForSheep(id: number) {
  try {
    detailError.value = null
    const list = await weightApi.getSheepHistory(id)
    currentWeightRecords.value = list.map((w) => ({
      id: String(w.id),
      sheep_id: String(w.id_sheep),
      date: w.date_recorded,
      weight: w.weight,
    }))
  } catch (err: unknown) {
    detailError.value = err instanceof Error ? err.message : 'Gagal memuat riwayat berat'
    console.error('Error fetching weight records:', err)
  }
}

export async function refreshLivestockData() {
  try {
    loading.value = true
    error.value = null
    await Promise.all([
      fetchCages(),
      fetchSheep(),
      fetchHealthRecords(),
      fetchWeightRecords(),
      fetchFeedRecords(),
    ])
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to refresh livestock data'
  } finally {
    loading.value = false
  }
}
