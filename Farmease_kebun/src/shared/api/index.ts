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
  statusAktivitasApi,
  notificationsApi as notifikasiApi,
  type Lahan,
  type Pohon,
  type Aktivitas,
  type Perawatan,
  type Pemangkasan,
  type Panen,
  type AkunLahan,
  type PencatatanSubmission,
  type StatusAktivitas,
  type Notification as Notifikasi,
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

