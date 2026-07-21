import { ref } from 'vue'
import { cagesApi, lahanApi, pohonApi } from '@/shared/api'

export interface UserSession {
  code: string;
  name: string;
  role: string;
}

export interface CageSession {
  code: string;
  name: string;
  type: string;
}

export interface LandSession {
  code: string;
  name: string;
  area?: string;
  status?: string;
}

export const isLoginOpen = ref(false)

export const userSession = ref<UserSession | null>(null)
export const cageSession = ref<CageSession | null>(null)
export const landSession = ref<LandSession | null>(null)

export interface GlobalAlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'error' | 'success';
}

export const globalAlertState = ref<GlobalAlertState>({
  isOpen: false,
  title: '',
  message: '',
  type: 'success',
})

export function triggerGlobalAlert(title: string, message: string, type: 'error' | 'success' = 'success') {
  globalAlertState.value = {
    isOpen: true,
    title,
    message,
    type,
  }
}

export const selectedTernakId = ref<string | null>(null)
export const selectedPencatatanPayload = ref<any | null>(null)
export const activePencatatanForm = ref<any | null>(null)
export const prefilledPencatatanType = ref<string | null>(null)
export const prefilledPencatatanRincian = ref<string | null>(null)
export const prefilledPencatatanTaskId = ref<string | null>(null)
export const prefilledPencatatanSheepId = ref<string | null>(null)
export const prefilledPencatatanCageCode = ref<string | null>(null)

// ── Shared Data Stores (fetched from BE) ──
export interface CageInfo {
  id?: string | number;
  code: string;
  name: string;
  type: string;
  capacity: number;
}

export interface LandInfo {
  id?: string | number;
  code: string;
  name: string;
  area: string;
  status: string;
  capacity?: number;
  location?: string;
}

export interface CropInfo {
  id?: string | number;
  code: string;
  name: string;
  type: string;
  land: string;
  age: string;
}

export const cagesList = ref<CageInfo[]>([])
export const landsList = ref<LandInfo[]>([])
export const cropsList = ref<CropInfo[]>([])

export const cagesLoading = ref(false)
export const landsLoading = ref(false)
export const cropsLoading = ref(false)

export async function fetchCagesList() {
  try {
    cagesLoading.value = true
    const list = await cagesApi.getList()
    cagesList.value = list.map((cage) => ({
      id: cage.id_cage,
      code: cage.cage_code,
      name: cage.cage_name || `Kandang ${cage.cage_code}`,
      type: cage.cage_type || cage.location || 'campuran',
      capacity: cage.capacity,
    }))
  } catch (err) {
    console.error('Failed to fetch cages list:', err)
  } finally {
    cagesLoading.value = false
  }
}

export async function fetchLandsList() {
  try {
    landsLoading.value = true
    const list = await lahanApi.getList()
    landsList.value = list.map((land) => {
      return {
        id: land.id,
        code: land.kode_lahan,
        name: land.nama_lahan || land.varietas || '',
        area: String(land.luas_lahan || land.luas) + ' m²',
        status: land.status || '',
        capacity: land.kapasitas_maksimal || 50,
        location: land.jenis_tanaman || land.lokasi || ''
      }
    })
  } catch (err) {
    console.error('Failed to fetch lands list:', err)
  } finally {
    landsLoading.value = false
  }
}

export async function fetchCropsList() {
  try {
    cropsLoading.value = true
    if (landsList.value.length === 0) {
      await fetchLandsList()
    }
    const list = await pohonApi.getList()
    cropsList.value = list.map((crop) => {
      const landObj = landsList.value.find((land) => land.id === crop.id_lahan)
      return {
        id: crop.id,
        code: crop.kode_pohon,
        name: crop.nama_pohon,
        type: crop.status,
        land: landObj ? landObj.code : `Lahan #${crop.id_lahan}`,
        age: String(crop.umur) + ' Tahun',
      }
    })
  } catch (err) {
    console.error('Failed to fetch crops list:', err)
  } finally {
    cropsLoading.value = false
  }
}

