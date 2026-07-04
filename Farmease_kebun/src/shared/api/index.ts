export { default as apiClient } from './client'
export * from './client'

export { default as authApi, type User, type AuthResponse, type EnumChoice, type MetadataEnums } from './auth'

export { default as peternakan } from './peternakan'
export * from './peternakan'

export { default as perkebunan } from './perkebunan'
export {
  lahanApi,
  pohonApi,
  aktivitasApi,
  perawatanApi,
  pemangkasanApi,
  panenApi,
  akunLahanApi,
  submissionsApi,
  pencatatanTypesApi,
  notificationsApi as notifikasiApi,
  pemupukanApi,
  stokApi,
  fermentasiApi,
  type Lahan,
  type Pohon,
  type Aktivitas,
  type Perawatan,
  type Pemangkasan,
  type Panen,
  type AkunLahan,
  type PencatatanSubmission,
  type PencatatanTypesCatalog,
  type JenisPencatatanItem,
  type RincianPencatatanItem,
  type Notification as Notifikasi,
  type Pemupukan,
  type StokBahan,
  type StokPupuk,
  type StokObat,
  type Fermentasi,
  type LogFermentasi,
} from './perkebunan'

// Convenience exports for common imports
export {
  farmsApi,
  sheepApi,
  cagesApi,
  healthApi,
  weightApi,
  feedsApi,
  manureApi,
  breedingApi,
  pregnancyApi,
  birthApi,
} from './peternakan'

