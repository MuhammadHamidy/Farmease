import { ref } from 'vue'
import { lahanApi, pohonApi, panenApi } from '@/shared/api'

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
  status_pohon?: string;
}

export const cagesList = ref<CageInfo[]>([])
export const landsList = ref<LandInfo[]>([])
export const cropsList = ref<CropInfo[]>([])

export const cagesLoading = ref(false)
export const landsLoading = ref(false)
export const cropsLoading = ref(false)

export async function fetchCagesList() {
  // Perkebunan system does not use cages - return empty to avoid 404 errors
  cagesLoading.value = false
}

export async function fetchLandsList() {
  try {
    landsLoading.value = true
    const list = await lahanApi.getList()
    landsList.value = list.map((l) => {
      return {
        id: l.id,
        code: l.kode_lahan,
        name: l.nama_lahan || l.varietas || '',
        area: String(l.luas_lahan || l.luas) + ' m²',
        status: l.status || '',
        capacity: l.kapasitas_maksimal || 50,
        location: l.jenis_tanaman || l.lokasi || ''
      }
    })
  } catch (err: any) {
    console.error('Failed to fetch lands list:', err, 'Response Data:', err.response?.data)
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
        status_pohon: p.status_pohon,
        land: landObj ? landObj.code : `Lahan #${p.id_lahan}`,
        age: String(p.umur) + ' Tahun',
        rawAge: p.umur,
        rawDate: p.created_at,
        id_lahan: p.id_lahan
      }
    })
  } catch (err) {
    console.error('Failed to fetch crops list:', err)
  } finally {
    cropsLoading.value = false
  }
}

export interface PanenInfo {
  id?: string | number;
  tanggal_panen: string;
  jumlah_panen: number;
  unit: string;
  id_pohon: string | number;
  status: string;
}

export const panenList = ref<PanenInfo[]>([])
export const panenLoading = ref(false)

export async function fetchPanenList() {
  try {
    panenLoading.value = true
    const list = await panenApi.getList()
    panenList.value = list.map((p) => {
      return {
        id: p.id,
        tanggal_panen: p.tanggal_panen,
        jumlah_panen: p.jumlah_panen,
        unit: p.unit,
        id_pohon: p.id_pohon,
        status: p.status,
      }
    })
  } catch (err) {
    console.error('Failed to fetch panen list:', err)
  } finally {
    panenLoading.value = false
  }
}

