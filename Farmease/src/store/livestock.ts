import { ref, computed } from 'vue'
import {
  sheepApi,
  cagesApi,
  healthApi,
  weightApi,
  feedsApi,
  breedingApi,
  pregnancyApi,
  type Sheep as ApiSheep,
} from '@/shared/api'

export interface SheepDetail extends ApiSheep {
  cage_code?: string
  photo_url?: string
}

export interface Sibling {
  id_sheep: string | number
  sheep_code: string
  sheep_name: string
  gender: string
  type: string // "kandung", "tiri_bapak", "tiri_ibu"
}

export interface Silsilah {
  id_sheep: string | number
  sheep_code: string
  sheep_name: string
  gender: string
  father?: Partial<Silsilah>
  mother?: Partial<Silsilah>
  siblings?: Sibling[]
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
  origin?: string
  adg?: number
  adg_label?: string
  photo_url?: string
  mating_status?: string
  owner?: string
  is_ready_to_mate?: boolean
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
  action?: string
  medicine_given?: string
  inspector_name?: string
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

import { cagesList, fetchCagesList } from './navigation'

function mapSheep(row: ApiSheep): Sheep {
  const cage = cagesList.value.find((c) => c.id === row.id_cage)
  
  let mappedStatus = row.status || '';
  const statusLower = mappedStatus.toLowerCase();
  if (statusLower === 'aktif') mappedStatus = 'Sehat';
  else if (statusLower === 'hamil') mappedStatus = 'Hamil';
  else if (statusLower === 'dijual' || statusLower === 'terjual') mappedStatus = 'Terjual';
  else if (statusLower === 'mati') mappedStatus = 'Mati';
  else if (statusLower === 'disembelih') mappedStatus = 'Disembelih';
  else {
    mappedStatus = mappedStatus.charAt(0).toUpperCase() + mappedStatus.slice(1);
  }

  return {
    id: String(row.id_sheep),
    code: row.sheep_code,
    name: row.sheep_name,
    type: row.type_name || String(row.id_type),
    gender: row.gender,
    birth_date: row.date_of_birth,
    age: (row as any).age_string || '',
    weight: (row as any).last_weight ? `${(row as any).last_weight} kg` : '',
    status: mappedStatus,
    notifications: 0,
    cage_code: cage ? cage.code : String(row.id_cage),
    origin: row.origin || '',
    adg: (row as any).adg,
    adg_label: (row as any).adg_label,
    photo_url: row.photo_url || '',
    mating_status: (row as any).mating_status || '',
    owner: row.owner || '',
    is_ready_to_mate: !!(row as any).is_ready_to_mate,
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
  siapJual: sheep.value.filter((s) => s.status === 'Siap Jual').length,
  mati: sheep.value.filter((s) => s.status === 'Mati').length,
  keluar: sheep.value.filter((s) => ['Terjual', 'Disembelih', 'Mati'].includes(s.status)).length,
}))

// Daftar domba yang sudah keluar (mutasi keluar)
export const mutationHistory = computed(() =>
  sheep.value.filter((s) => ['Mati', 'Terjual', 'Disembelih'].includes(s.status))
)

// Status domba yang didukung
export const SHEEP_STATUS_OPTIONS = [
  'Sehat', 'Produktif', 'Hamil', 'Sakit', 'Siap Jual', 'Mati', 'Terjual', 'Disembelih',
] as const

export async function fetchSheep(cageCode?: string) {
  if (loading.value) return

  try {
    loading.value = true
    error.value = null

    if (cagesList.value.length === 0) {
      await fetchCagesList().catch(() => {});
    }

    const list = await sheepApi.getList()
    const mapped = (list || []).map(mapSheep)
    sheep.value = cageCode
      ? mapped.filter((s) => s.cage_code === cageCode)
      : mapped
    lastFetch.value = Date.now()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch sheep'
    console.error('Error fetching sheep:', err)
  } finally {
    loading.value = false;
  }
}

export async function fetchCages() {
  if (loading.value) return

  try {
    loading.value = true
    error.value = null

    const list = await cagesApi.getList()
    cages.value = (list || []).map((cage) => ({
      id: String(cage.id_cage),
      code: cage.cage_code,
      name: cage.cage_name || `Kandang ${cage.cage_code}`,
      type: cage.cage_type || cage.location || 'campuran',
      capacity: cage.capacity,
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
      const list = await healthApi.getList(String(sheepId))
      healthRecords.value = (list || []).map((health) => ({
        id: String((health as any).id_health || health.id),
        sheep_id: String(health.id_sheep),
        date: health.date_recorded || (health as any).checkup_date || '',
        status: (health as any).diagnosis || health.health_status || (health as any).action || '',
        notes: (health as any).notes || health.description || '',
        action: (health as any).action || '',
        medicine_given: (health as any).medicine_given || '',
        inspector_name: (health as any).inspector_name || '',
      }))
    } else {
      const list = await healthApi.getGlobalList()
      healthRecords.value = (list || []).map((health) => ({
        id: String((health as any).id_health || health.id),
        sheep_id: String(health.id_sheep),
        date: health.date_recorded || (health as any).checkup_date || '',
        status: (health as any).diagnosis || health.health_status || (health as any).action || '',
        notes: (health as any).notes || health.description || '',
        action: (health as any).action || '',
        medicine_given: (health as any).medicine_given || '',
        inspector_name: (health as any).inspector_name || '',
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
      ? await weightApi.getSheepHistory(String(sheepId))
      : await weightApi.getList()

    weightRecords.value = (list || []).map((weight) => ({
      id: String((weight as any).id_weight || weight.id),
      sheep_id: String(weight.id_sheep),
      date: weight.date_recorded || (weight as any).weighing_date || '',
      weight: weight.weight || (weight as any).weight_kg || 0,
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
      const list = await feedsApi.getFeedingHistory(String(sheepId))
      feedRecords.value = (list as FeedRecord[]) ?? []
    } else {
      const list = await feedsApi.getList()
      feedRecords.value = (list || []).map((feed) => ({
        id: String((feed as any).id_feed || feed.id),
        sheep_id: '',
        type: feed.feed_type || (feed as any).category || '',
        quantity: feed.stock !== undefined && feed.stock !== null ? feed.stock : ((feed as any).available_stock || 0),
        date: feed.created_at,
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

    const updated = await sheepApi.update(String(id), data as Partial<ApiSheep>)
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

export async function updateSheepStatus(id: string, status: string) {
  try {
    loading.value = true
    error.value = null

    // Normalize UI status to database-compatible lowercase enum
    const apiStatus = status.toLowerCase() === 'sehat' ? 'aktif' : status.toLowerCase();
    await sheepApi.updateStatus(String(id), apiStatus)
    const index = sheep.value.findIndex((s) => s.id === id)
    if (index !== -1) {
      // Map back to UI status representation for frontend state consistency
      let mappedStatus = status;
      if (apiStatus === 'aktif') mappedStatus = 'Sehat';
      else if (apiStatus === 'hamil') mappedStatus = 'Hamil';
      else if (apiStatus === 'dijual') mappedStatus = 'Terjual';
      else if (apiStatus === 'mati') mappedStatus = 'Mati';
      else if (apiStatus === 'disembelih') mappedStatus = 'Disembelih';

      sheep.value[index] = { ...sheep.value[index]!, status: mappedStatus }
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to update sheep status'
    throw err
  } finally {
    loading.value = false
  }
}

export async function addHealthRecord(sheepId: string, data: Record<string, unknown>) {
  try {
    loading.value = true
    error.value = null

    const created = await healthApi.create(String(sheepId), data)
    const record: HealthRecord = {
      id: String((created as any).id_health || created.id),
      sheep_id: String(created.id_sheep),
      date: created.date_recorded || (created as any).checkup_date || '',
      status: (created as any).diagnosis || created.health_status || (created as any).action || '',
      notes: (created as any).notes || created.description || '',
      action: (created as any).action || '',
      medicine_given: (created as any).medicine_given || '',
      inspector_name: (created as any).inspector_name || '',
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

    const created = await weightApi.record(String(sheepId), data)
    const record: WeightRecord = {
      id: String((created as any).id_weight || created.id),
      sheep_id: String(created.id_sheep),
      date: created.date_recorded || (created as any).weighing_date || '',
      weight: created.weight || (created as any).weight_kg || 0,
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
export const currentMatingRecords = ref<any[]>([])
export const detailLoading = ref(false)
export const detailError = ref<string | null>(null)

export async function fetchSheepById(id: string | number) {
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

export async function fetchSilsilah(id: string | number) {
  try {
    detailLoading.value = true
    detailError.value = null
    try {
      currentSilsilah.value = await sheepApi.getSilsilah(id)
    } catch (err1) {
      console.warn('getSilsilah failed, trying getGenealogy...', err1)
      currentSilsilah.value = await sheepApi.getGenealogy(id)
    }
  } catch (err: unknown) {
    detailError.value = err instanceof Error ? err.message : 'Gagal memuat silsilah'
    console.error('Error fetching silsilah/genealogy:', err)
    currentSilsilah.value = { id_sheep: id, sheep_code: '', sheep_name: '', gender: '' }
  } finally {
    detailLoading.value = false
  }
}

export async function fetchHealthForSheep(id: string | number) {
  try {
    detailError.value = null
    const list = await healthApi.getList(id)
    currentHealthRecords.value = (list || []).map((health) => ({
      id: String((health as any).id_health || health.id),
      sheep_id: String(health.id_sheep),
      date: health.date_recorded || (health as any).checkup_date || '',
      status: (health as any).diagnosis || health.health_status || (health as any).action || '',
      notes: (health as any).notes || health.description || '',
      action: (health as any).action || '',
      medicine_given: (health as any).medicine_given || '',
      inspector_name: (health as any).inspector_name || '',
    }))
  } catch (err: unknown) {
    detailError.value = err instanceof Error ? err.message : 'Gagal memuat riwayat kesehatan'
    console.error('Error fetching health records:', err)
  }
}

export async function fetchWeightForSheep(id: string | number) {
  try {
    detailError.value = null
    const list = await weightApi.getSheepHistory(id)
    currentWeightRecords.value = (list || []).map((weight) => ({
      id: String((weight as any).id_weight || weight.id),
      sheep_id: String(weight.id_sheep),
      date: weight.date_recorded || (weight as any).weighing_date || '',
      weight: weight.weight || (weight as any).weight_kg || 0,
    }))
  } catch (err: unknown) {
    detailError.value = err instanceof Error ? err.message : 'Gagal memuat riwayat berat'
    console.error('Error fetching weight records:', err)
  }
}

export async function fetchMatingForSheep(id: string | number) {
  try {
    detailError.value = null
    const list = await breedingApi.getMatingList()
    currentMatingRecords.value = (list || []).filter((mating: any) => 
      mating.id_female_sheep === id || mating.id_male_sheep === id || 
      mating.id_sheep_female === id || mating.id_sheep_male === id
    ).map((mating: any) => {
      const isFemale = mating.id_female_sheep === id || mating.id_sheep_female === id;
      return {
        id: mating.id || mating.id_mating,
        date: mating.mating_date,
        partner_id: isFemale ? (mating.id_male_sheep || mating.id_sheep_male) : (mating.id_female_sheep || mating.id_sheep_female),
        partner_name: isFemale ? mating.male_sheep?.sheep_name : mating.female_sheep?.sheep_name,
        method: mating.mating_method || 'alami',
        status: mating.status,
        notes: mating.notes || '',
      };
    })
  } catch (err: unknown) {
    console.error('Error fetching mating records:', err)
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
