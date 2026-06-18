export { default as apiClient } from './client'
export * from './client'

export { default as authApi, type User, type AuthResponse, type EnumChoice, type MetadataEnums } from './auth'

export { default as peternakan } from './peternakan'
export * from './peternakan'

export { default as perkebunan } from './perkebunan'
export * from './perkebunan'

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

export {
  lahanApi,
  pohonApi,
  aktivitasApi,
  perawatanApi,
  pemangkasanApi,
  panenApi,
  akunLahanApi,
  tasksApi,
  notificationsApi,
  routineSchedulesApi,
  submissionsApi,
  statusAktivitasApi,
} from './perkebunan'
