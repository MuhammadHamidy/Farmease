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

export const isLoginOpen = ref(false)

export const userSession = ref<UserSession | null>(null)
export const cageSession = ref<CageSession | null>(null)

export const selectedTernakId = ref<string | null>(null)
export const selectedPencatatanPayload = ref<any | null>(null)
export const activePencatatanForm = ref<any | null>(null)

// ── Shared Data Stores (fetched from BE) ──
export interface CageInfo {
  id?: number;
  code: string;
  name: string;
  type: string;
  capacity: number;
}

export interface LandInfo {
  id?: number;
  code: string;
  name: string;
  area: string;
  status: string;
}

export interface CropInfo {
  id?: number;
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
    cagesList.value = list.map((c) => ({
      id: c.id_cage,
      code: c.cage_code,
      name: c.cage_name || `Kandang ${c.cage_code}`,
      type: c.cage_type || c.location || 'campuran',
      capacity: c.capacity,
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
    landsList.value = list.map((l) => ({
      id: l.id,
      code: l.kode_lahan,
      name: l.nama_lahan,
      area: String(l.luas) + ' Hektar',
      status: l.status,
    }))
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
    cropsList.value = list.map((p) => {
      const landObj = landsList.value.find((l) => l.id === p.id_lahan)
      return {
        id: p.id,
        code: p.kode_pohon,
        name: p.nama_pohon,
        type: p.status,
        land: landObj ? landObj.code : `Lahan #${p.id_lahan}`,
        age: String(p.umur) + ' Tahun',
      }
    })
  } catch (err) {
    console.error('Failed to fetch crops list:', err)
  } finally {
    cropsLoading.value = false
  }
}

