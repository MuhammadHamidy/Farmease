/**
 * modules/ternak/store/operatorAdmin.ts
 *
 * Re-exports utama dari global store @/store/operatorAdmin.
 * Types dan fungsi admin-specific (approval, routine schedules) tetap di sini,
 * namun tanpa data dummy — state diinisialisasi kosong dan diisi dari BE.
 */
import { ref, computed, watch } from 'vue';

import {
  type OperatorTask,
  type ApiTask,
  type TaskStatus,
  type TaskPriority,
  type ScheduleFrequency,
  type PencatatanCategory,
  type SubmitPencatatanInput,
  type SubmitResult,
  operatorTasks,
  tasksLoading,
  tasksError,
  openOperatorTasks,
  fetchTasks,
  completeTask,
  submitPencatatanSubmission,
  mapApiTaskToLocal,
  executeTernakApiSubmission,
  executeKebunApiSubmission,
  accountsList,
  fetchAccountsList,
} from '@/store/operatorAdmin';
import { tasksApi } from '@/shared/api';
import { cagesList, landsList } from '@/store/navigation';

export {
  type OperatorTask,
  type ApiTask,
  type TaskStatus,
  type TaskPriority,
  type ScheduleFrequency,
  type PencatatanCategory,
  type SubmitPencatatanInput,
  type SubmitResult,
  operatorTasks,
  tasksLoading,
  tasksError,
  openOperatorTasks,
  fetchTasks,
  completeTask,
  submitPencatatanSubmission,
  executeTernakApiSubmission,
  executeKebunApiSubmission,
  accountsList,
  fetchAccountsList,
};

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface PencatatanSubmission {
  id: string;
  type: string;
  typeLabel: string;
  operatorCode: string;
  operatorName: string;
  cageCode: string;
  scope: 'domba' | 'kandang';
  summary: string;
  payload: Record<string, unknown>;
  submittedAt: number;
  approvalStatus: ApprovalStatus;
  reviewedAt?: number;
  reviewedBy?: string;
  reviewNote?: string;
  taskId?: string;
}

export interface RoutineSchedule {
  id: string;
  title: string;
  description: string;
  category: string;
  cageCode: string;
  assigneeCode: string;
  assigneeName: string;
  frequency: string;
  startDate?: string;
  time: string;
  endTime: string;
  priority: 'rendah' | 'sedang' | 'tinggi';
  daysOfWeek: number[];
  dayOfMonth: number;
  active: boolean;
  rincian?: string;
  createdAt: number;
}

// Pencatatan submissions — state lokal untuk approval flow (bisa diganti API ke depannya)
const STORAGE_KEY = 'farmease_submissions';
const stored = localStorage.getItem(STORAGE_KEY);
const defaultSubmissions: PencatatanSubmission[] = [
  {
    id: 'SUB-001',
    type: 'pakan',
    typeLabel: 'Pemberian Pakan',
    operatorCode: 'OP001',
    operatorName: 'Budi Ternak',
    cageCode: 'A',
    scope: 'kandang',
    summary: 'Pakan hijauan rumput gajah 25kg',
    payload: { data: { items: [{ name: 'Rumput Gajah', qty: 25, unit: 'kg' }] } },
    submittedAt: Date.now() - 3600000 * 2,
    approvalStatus: 'pending'
  },
  {
    id: 'SUB-002',
    type: 'pemangkasan',
    typeLabel: 'Pemangkasan Ranting',
    operatorCode: 'OP002',
    operatorName: 'Siti Aminah',
    cageCode: 'L0002',
    scope: 'kandang',
    summary: 'Pangkas ranting kering pohon Alpukat',
    payload: { data: { items: [{ name: 'Alpukat', action: 'Pangkas Ranting' }] } },
    submittedAt: Date.now() - 3600000 * 5,
    approvalStatus: 'pending'
  },
  {
    id: 'SUB-003',
    type: 'kesehatan',
    typeLabel: 'Pemeriksaan Kesehatan',
    operatorCode: 'OP001',
    operatorName: 'Budi Ternak',
    cageCode: 'B',
    scope: 'domba',
    summary: 'Pemberian obat cacing domba Garut',
    payload: { data: { items: [{ targetId: 'D012', tindakan: 'Obat Cacing' }] } },
    submittedAt: Date.now() - 3600000 * 24,
    approvalStatus: 'approved',
    reviewedAt: Date.now() - 3600000 * 23,
    reviewedBy: 'Admin Utama',
    reviewNote: 'Sesuai dengan prosedur pemeriksaan berkala.'
  },
  {
    id: 'SUB-004',
    type: 'panen',
    typeLabel: 'Panen Hasil Kebun',
    operatorCode: 'OP002',
    operatorName: 'Siti Aminah',
    cageCode: 'L001',
    scope: 'kandang',
    summary: 'Panen buah jeruk matang 50kg',
    payload: { data: { items: [{ name: 'Jeruk', qty: 50, unit: 'kg' }] } },
    submittedAt: Date.now() - 3600000 * 30,
    approvalStatus: 'pending'
  }
];

export const pencatatanSubmissions = ref<PencatatanSubmission[]>(
  stored ? JSON.parse(stored) : defaultSubmissions
);

watch(pencatatanSubmissions, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });
import { routineSchedulesApi, type ApiRoutineSchedule } from '@/shared/api';

const LOCAL_SCHEDULES_KEY = 'farmease_local_schedules';
const localSchedules = ref<RoutineSchedule[]>(
  localStorage.getItem(LOCAL_SCHEDULES_KEY) ? JSON.parse(localStorage.getItem(LOCAL_SCHEDULES_KEY)!) : []
);

export const apiRoutineSchedules = ref<RoutineSchedule[]>([]);
export const schedulesLoading = ref(false);

export const routineSchedules = computed(() => {
  return [...apiRoutineSchedules.value, ...localSchedules.value];
});

export async function fetchRoutineSchedules() {
  try {
    schedulesLoading.value = true;
    const list = await routineSchedulesApi.getList();
    apiRoutineSchedules.value = (list || []).map(mapApiScheduleToLocal);
  } catch (err) {
    console.error('Error fetching routine schedules:', err);
  } finally {
    schedulesLoading.value = false;
  }
}

export function mapApiScheduleToLocal(api: ApiRoutineSchedule): RoutineSchedule {
  const startDate = (api.start_date || '').split('T')[0];
  const time = api.start_time ? api.start_time.substring(0, 5) : '08:00';
  const endTime = api.end_time ? api.end_time.substring(0, 5) : '';

  // Resolve cage code from id_cage UUID using cagesList and landsList
  let cageCode = '';
  if (api.id_cage) {
    const foundCage = cagesList.value.find((c) => String(c.id) === String(api.id_cage));
    if (foundCage) {
      cageCode = foundCage.code;
    } else {
      const foundLand = landsList.value.find((l) => String(l.id) === String(api.id_cage));
      if (foundLand) {
        cageCode = foundLand.code;
      }
    }
  }
  if (!cageCode) {
    cageCode = 'A'; // default fallback for livestock schedules
  }

  // Resolve assigneeCode and assigneeName from id_account UUID dynamically
  let assigneeCode = 'OP001';
  let assigneeName = 'Operator Ternak';
  if (api.id_account) {
    const userIdStr = String(api.id_account);
    const foundAcc = accountsList.value.find((acc) => String(acc.id) === userIdStr);
    if (foundAcc) {
      const cat = String(foundAcc.operator_category || '').toLowerCase();
      if (cat.includes('kebun')) {
        assigneeCode = 'OP002';
        assigneeName = 'Operator Kebun';
      } else if (cat.includes('ternak') || cat.includes('operator')) {
        assigneeCode = 'OP001';
        assigneeName = 'Operator Ternak';
      } else if (cat.includes('pemilik') || foundAcc.username === 'pemilik') {
        assigneeCode = 'PEM001';
        assigneeName = 'Pemilik';
      } else {
        assigneeCode = 'OP001';
        assigneeName = 'Operator Ternak';
      }
    } else {
      if (userIdStr === '11111111-1111-1111-1111-111111111105' || userIdStr === '11111111-1111-1111-1111-111111111107' || userIdStr === 'OP002') {
        assigneeCode = 'OP002';
        assigneeName = 'Operator Kebun';
      } else if (userIdStr === '11111111-1111-1111-1111-111111111104') {
        assigneeCode = 'PEM001';
        assigneeName = 'Pemilik';
      } else {
        assigneeCode = 'OP001';
        assigneeName = 'Operator Ternak';
      }
    }
  }

  return {
    id: api.id,
    title: api.title,
    description: api.description,
    category: api.category,
    cageCode,
    assigneeCode,
    assigneeName,
    frequency: api.frequency,
    startDate: startDate,
    time: time,
    endTime: endTime,
    priority: (api.priority as any) || 'sedang',
    daysOfWeek: api.days_of_week || [],
    dayOfMonth: api.day_of_month || 1,
    active: api.is_active,
    rincian: api.rincian,
    createdAt: api.created_at ? new Date(api.created_at).getTime() : Date.now(),
  };
}

function mapLocalScheduleToApi(local: Partial<RoutineSchedule>): Partial<ApiRoutineSchedule> {
  // Resolve id_cage UUID from cageCode using cagesList and landsList
  let idCage: string | undefined = undefined;
  if (local.cageCode) {
    const foundCage = cagesList.value.find((c) => String(c.code).toUpperCase() === String(local.cageCode).toUpperCase());
    if (foundCage && foundCage.id !== undefined) {
      idCage = String(foundCage.id);
    } else {
      const foundLand = landsList.value.find((l) => String(l.code).toUpperCase() === String(local.cageCode).toUpperCase());
      if (foundLand && foundLand.id !== undefined) {
        idCage = String(foundLand.id);
      }
    }
  }

  // Resolve id_account UUID from assigneeCode dynamically
  let idAccount: string | undefined = undefined;
  if (local.assigneeCode) {
    const matchedAccount = accountsList.value.find((acc) => {
      const cat = String(acc.operator_category || '').toLowerCase();
      const username = String(acc.username || '').toLowerCase();
      if (local.assigneeCode === 'OP002') {
        return cat.includes('kebun') || username.includes('kebun');
      } else if (local.assigneeCode === 'OP001') {
        return cat.includes('ternak') || username === 'operator';
      } else if (local.assigneeCode === 'PEM001') {
        return cat.includes('pemilik') || username.includes('pemilik');
      }
      return false;
    });

    if (matchedAccount) {
      idAccount = String(matchedAccount.id);
    } else {
      if (local.assigneeCode === 'OP002') {
        idAccount = '11111111-1111-1111-1111-111111111105'; // Operator Kebun
      } else if (local.assigneeCode === 'OP001') {
        idAccount = '11111111-1111-1111-1111-111111111103'; // Operator Ternak
      } else if (local.assigneeCode === 'PEM001') {
        idAccount = '11111111-1111-1111-1111-111111111104'; // Pemilik
      } else {
        idAccount = '11111111-1111-1111-1111-111111111103'; // Fallback to Operator Ternak
      }
    }
  }

  const payload: Partial<ApiRoutineSchedule> = {
    title: local.title,
    description: local.description,
    category: local.category,
    frequency: local.frequency,
    days_of_week: local.daysOfWeek,
    day_of_month: local.dayOfMonth,
    priority: local.priority,
    id_cage: idCage,
    id_account: idAccount,
    rincian: local.rincian,
    is_active: local.active,
  };

  if (local.startDate) {
    payload.start_date = `${local.startDate}T00:00:00Z`;
  }
  if (local.time) {
    payload.start_time = local.time.includes(':') ? (local.time.split(':').length === 2 ? `${local.time}:00` : local.time) : '08:00:00';
  }
  if (local.endTime) {
    payload.end_time = local.endTime.includes(':') ? (local.endTime.split(':').length === 2 ? `${local.endTime}:00` : local.endTime) : '';
  }

  return payload;
}

export const pendingApprovalCount = computed(
  () => pencatatanSubmissions.value.filter((s) => s.approvalStatus === 'pending').length,
);

export async function addRoutineSchedule(schedule: Omit<RoutineSchedule, 'id' | 'createdAt'>) {
  if (schedule.assigneeCode === 'OP002') {
    const newSched = {
      ...schedule,
      id: `S-${Date.now().toString().slice(-6)}`,
      createdAt: Date.now(),
    };
    localSchedules.value.unshift(newSched);
    localStorage.setItem(LOCAL_SCHEDULES_KEY, JSON.stringify(localSchedules.value));
    return;
  }

  try {
    const apiPayload = mapLocalScheduleToApi(schedule);
    const createdApi = await routineSchedulesApi.create(apiPayload);
    const mapped = mapApiScheduleToLocal(createdApi);
    apiRoutineSchedules.value.unshift(mapped);
    await fetchTasks();
  } catch (err) {
    console.error('Error adding routine schedule:', err);
    alert('Gagal membuat jadwal rutin');
  }
}

export async function updateRoutineSchedule(id: string, patch: Partial<Omit<RoutineSchedule, 'id' | 'createdAt'>>) {
  const isLocal = id.startsWith('S-');
  if (isLocal) {
    const i = localSchedules.value.findIndex((s) => s.id === id);
    if (i !== -1) {
      localSchedules.value[i] = { ...localSchedules.value[i], ...patch } as RoutineSchedule;
      localStorage.setItem(LOCAL_SCHEDULES_KEY, JSON.stringify(localSchedules.value));
    }
    return;
  }

  try {
    const apiPayload = mapLocalScheduleToApi(patch);
    const updatedApi = await routineSchedulesApi.update(id, apiPayload);
    const mapped = mapApiScheduleToLocal(updatedApi);
    
    const i = apiRoutineSchedules.value.findIndex((s) => s.id === id);
    if (i !== -1) {
      apiRoutineSchedules.value[i] = mapped;
    }
    await fetchTasks();
  } catch (err) {
    console.error('Error updating routine schedule:', err);
    alert('Gagal memperbarui jadwal rutin');
  }
}

export async function deleteRoutineSchedule(id: string) {
  const isLocal = id.startsWith('S-');
  if (isLocal) {
    localSchedules.value = localSchedules.value.filter((s) => s.id !== id);
    localStorage.setItem(LOCAL_SCHEDULES_KEY, JSON.stringify(localSchedules.value));
    return;
  }

  try {
    await routineSchedulesApi.delete(id);
    apiRoutineSchedules.value = apiRoutineSchedules.value.filter((s) => s.id !== id);
    await fetchTasks();
  } catch (err) {
    console.error('Error deleting routine schedule:', err);
    alert('Gagal menghapus jadwal rutin');
  }
}

export async function approveSubmission(id: string, reviewerName: string, note = '') {
  const sub = pencatatanSubmissions.value.find((s) => s.id === id);
  if (!sub) return { success: false, message: 'Data pencatatan tidak ditemukan' };
  
  // Call API depending on type
  const isPerkebunan = ['perawatan', 'pemangkasan', 'panen', 'aktivitas', 'lahan', 'pohon', 'tanaman'].includes((sub.type || '').toLowerCase());
  
  const payloadToExecute: SubmitPencatatanInput = {
    type: sub.type,
    scope: sub.scope,
    summary: sub.summary,
    payload: sub.payload as any,
    operatorCode: sub.operatorCode,
    operatorName: sub.operatorName,
    cageCode: sub.cageCode,
    taskId: sub.taskId
  };

  let result;
  if (isPerkebunan) {
    result = await executeKebunApiSubmission(payloadToExecute);
  } else {
    result = await executeTernakApiSubmission(payloadToExecute);
  }

  if (result.success) {
    sub.approvalStatus = 'approved';
    sub.reviewedAt = Date.now();
    sub.reviewedBy = reviewerName;
    sub.reviewNote = note;

    if (sub.taskId) {
      try {
        await completeTask(sub.taskId);
      } catch (err) {
        console.error('Failed to complete task (might be mock task):', err);
      }
    }

    return { success: true, message: result.message };
  } else {
    return { success: false, message: result.message };
  }
}

export function rejectSubmission(id: string, reviewerName: string, note: string) {
  const sub = pencatatanSubmissions.value.find((s) => s.id === id);
  if (!sub) return { success: false, message: 'Data pencatatan tidak ditemukan' };
  sub.approvalStatus = 'rejected';
  sub.reviewedAt = Date.now();
  sub.reviewedBy = reviewerName;
  sub.reviewNote = note;
  return { success: true, message: 'Pencatatan berhasil ditolak.' };
}

function formatTitleForApi(title: string, category: string): string {
  const titleLower = title.toLowerCase();
  if (category === 'pakan' && !titleLower.includes('pakan') && !titleLower.includes('makan')) {
    return `${title} (Pakan)`;
  }
  if (category === 'kesehatan' && !titleLower.includes('sehat') && !titleLower.includes('sakit') && !titleLower.includes('obat') && !titleLower.includes('vitamin') && !titleLower.includes('kesehatan')) {
    return `${title} (Kesehatan)`;
  }
  if (category === 'kotoran' && !titleLower.includes('kotoran') && !titleLower.includes('kohe') && !titleLower.includes('pupuk')) {
    return `${title} (Kotoran)`;
  }
  if (category === 'perkawinan' && !titleLower.includes('kawin') && !titleLower.includes('breeding')) {
    return `${title} (Perkawinan)`;
  }
  if (category === 'kelahiran' && !titleLower.includes('lahir') && !titleLower.includes('anak')) {
    return `${title} (Kelahiran)`;
  }
  return title;
}

function formatDescriptionForApi(description: string, cageCode: string, rincian?: string): string {
  const cleanDesc = (description || '').replace(/\s*\(Kandang\s+[A-C]\)/gi, '').trim();
  let finalDesc = `${cleanDesc} (Kandang ${cageCode.toUpperCase()})`;
  if (rincian) {
    finalDesc += ` [Rincian: ${rincian}]`;
  }
  return finalDesc;
}
function mapAssigneeToUserId(assigneeCode: string): string {
  // Selalu gunakan ID Admin karena endpoint backend /api/tasks di-mock untuk hanya mengambil tugas milik Admin (11111111-1111-1111-1111-111111111101)
  return '11111111-1111-1111-1111-111111111101';
}

export async function addOperatorTask(task: any) {
  try {
    const userId = mapAssigneeToUserId(task.assigneeCode);

    const apiTitle = formatTitleForApi(task.title, task.category);
    const apiDesc = formatDescriptionForApi(task.description, task.cageCode, task.rincian);

    const rawTime = task.dueTime || '08:00';
    let timeStr = rawTime.replace('.', ':');
    if (!timeStr.includes(':')) {
      const cleaned = timeStr.replace(/[^0-9]/g, '');
      if (cleaned.length === 4) timeStr = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
      else if (cleaned.length === 3) timeStr = `0${cleaned.slice(0, 1)}:${cleaned.slice(1, 3)}`;
      else if (cleaned.length <= 2) timeStr = `${cleaned.padStart(2, '0')}:00`;
    }

    // Convert local WIB time to UTC ISO string correctly
    // User inputs time in WIB (UTC+7), so we must subtract 7 hours before sending as UTC
    let isoDate: string;
    if (task.dueDate) {
      const localDt = new Date(`${task.dueDate}T${timeStr}:00`);
      // new Date() with no 'Z' suffix parses as LOCAL time → .toISOString() converts to UTC correctly
      isoDate = localDt.toISOString();
    } else {
      isoDate = new Date().toISOString();
    }

    const payload = {
      user_id: userId,
      title: apiTitle,
      description: apiDesc,
      due_date: isoDate,
      task_date: isoDate,
      end_time: task.endTime || '',
      status: task.status,
      priority: task.priority,
      category: task.category || 'umum'
    };

    const createdApiTask = await tasksApi.create(payload);
    const localTask = mapApiTaskToLocal(createdApiTask);
    operatorTasks.value.unshift(localTask);
  } catch (err) {
    console.error('Error adding operator task:', err);
    let errMsg = err instanceof Error ? err.message : 'Gagal menambah tugas';
    if (err && (err as any).response && (err as any).response.data) {
      if ((err as any).response.data.error && (err as any).response.data.error.message) {
        errMsg += '\nServer Error: ' + (err as any).response.data.error.message;
      } else if ((err as any).response.data.message) {
        errMsg += '\nServer Error: ' + (err as any).response.data.message;
      }
    }
    alert(errMsg);
  }
}

export async function updateOperatorTask(id: string, patch: any) {
  try {
    const userId = mapAssigneeToUserId(patch.assigneeCode);

    const apiTitle = formatTitleForApi(patch.title, patch.category);
    const apiDesc = formatDescriptionForApi(patch.description, patch.cageCode, patch.rincian);

    const timeStr = patch.dueTime || '08:00';
    // Convert local WIB time to UTC correctly
    let isoDate: string;
    if (patch.dueDate) {
      const localDt = new Date(`${patch.dueDate}T${timeStr}:00`);
      isoDate = localDt.toISOString();
    } else {
      isoDate = new Date().toISOString();
    }

    const existingStatus = operatorTasks.value.find(t => t.id === id)?.status || 'belum';
    const payload = {
      user_id: userId,
      title: apiTitle,
      description: apiDesc,
      due_date: isoDate,
      task_date: isoDate,
      end_time: patch.endTime || '',
      status: patch.status || existingStatus,
      priority: patch.priority,
      category: patch.category || 'umum'
    };

    console.log('Updating task payload:', payload);
    const updatedApiTask = await tasksApi.update(id, payload);
    const localTask = mapApiTaskToLocal(updatedApiTask);
    const index = operatorTasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      operatorTasks.value[index] = localTask;
    }
  } catch (err) {
    console.error('Error updating operator task:', err);
    let errMsg = err instanceof Error ? err.message : 'Gagal memperbarui tugas';
    if (err && (err as any).response && (err as any).response.data) {
      if ((err as any).response.data.error && (err as any).response.data.error.message) {
        errMsg += '\nServer Error: ' + (err as any).response.data.error.message;
      } else if ((err as any).response.data.message) {
        errMsg += '\nServer Error: ' + (err as any).response.data.message;
      }
    }
    alert(errMsg);
  }
}

export async function deleteOperatorTask(id: string) {
  try {
    await tasksApi.delete(id);
    operatorTasks.value = operatorTasks.value.filter(t => t.id !== id);
  } catch (err) {
    console.error('Error deleting operator task:', err);
    alert(err instanceof Error ? err.message : 'Gagal menghapus tugas');
  }
}

export async function generateTasksFromSchedules() {
  try {
    await routineSchedulesApi.generate(7);
    await fetchTasks();
    alert('Berhasil menyinkronkan tugas rutin untuk 7 hari ke depan.');
  } catch (err) {
    console.error('Error generating tasks from schedules:', err);
    alert('Gagal menyinkronkan tugas rutin');
  }
}
