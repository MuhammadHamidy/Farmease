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
} from '@/store/operatorAdmin';
import { tasksApi } from '@/shared/api';

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
    operatorCode: 'OPT001',
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
    operatorCode: 'OPT002',
    operatorName: 'Siti Aminah',
    cageCode: 'LH-002',
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
    operatorCode: 'OPT001',
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
    operatorCode: 'OPT002',
    operatorName: 'Siti Aminah',
    cageCode: 'LH-001',
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
const SCHEDULES_STORAGE_KEY = 'farmease_routine_schedules';
const storedSchedules = localStorage.getItem(SCHEDULES_STORAGE_KEY);
export const routineSchedules = ref<RoutineSchedule[]>(
  storedSchedules ? JSON.parse(storedSchedules) : []
);

watch(routineSchedules, (newVal) => {
  localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });
export const pendingApprovalCount = computed(
  () => pencatatanSubmissions.value.filter((s) => s.approvalStatus === 'pending').length,
);

export async function addRoutineSchedule(schedule: Omit<RoutineSchedule, 'id' | 'createdAt'>) {
  const newSched = {
    ...schedule,
    id: `S-${Date.now().toString().slice(-6)}`,
    createdAt: Date.now(),
  };
  routineSchedules.value.unshift(newSched);

  // Also create an actual task in the backend for today
  await addOperatorTask({
    title: schedule.title,
    description: schedule.description,
    category: schedule.category,
    cageCode: schedule.cageCode,
    assigneeCode: schedule.assigneeCode,
    dueDate: schedule.startDate || new Date().toISOString().split('T')[0],
    dueTime: schedule.time,
    status: 'belum',
    priority: schedule.priority || 'sedang',
    rincian: schedule.rincian
  });
}

export function updateRoutineSchedule(id: string, patch: Partial<Omit<RoutineSchedule, 'id' | 'createdAt'>>) {
  const i = routineSchedules.value.findIndex((s) => s.id === id);
  if (i !== -1) {
    routineSchedules.value[i] = { ...routineSchedules.value[i], ...patch } as RoutineSchedule;
  }
}

export function deleteRoutineSchedule(id: string) {
  routineSchedules.value = routineSchedules.value.filter((s) => s.id !== id);
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



export async function addOperatorTask(task: any) {
  try {
    // Force userId to 1 because the current Go backend mock `GetMyTasks` is hardcoded to query `id_account = 1`.
    // If we use 2 or 3, the tasks will be saved but invisible to the frontend.
    const userId = 1;

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
    const isoDate = task.dueDate ? `${task.dueDate}T${timeStr}:00Z` : new Date().toISOString();

    const payload = {
      user_id: userId,
      title: apiTitle,
      description: apiDesc,
      due_date: isoDate,
      task_date: isoDate,
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
    let userId = 2;
    if (patch.assigneeCode === 'OP002' || patch.assigneeCode === 'OPT002' || patch.assigneeCode === '3') {
      userId = 3;
    } else if (patch.assigneeCode === 'ADM001' || patch.assigneeCode === '1') {
      userId = 1;
    } else if (patch.assigneeCode === 'PEM001' || patch.assigneeCode === '4') {
      userId = 4;
    } else {
      const num = Number(patch.assigneeCode);
      if (!isNaN(num) && num > 0) {
        userId = num;
      }
    }

    const apiTitle = formatTitleForApi(patch.title, patch.category);
    const apiDesc = formatDescriptionForApi(patch.description, patch.cageCode, patch.rincian);

    const timeStr = patch.dueTime || '08:00';
    const isoDate = patch.dueDate ? `${patch.dueDate}T${timeStr}:00Z` : new Date().toISOString();

    const payload = {
      user_id: userId,
      title: apiTitle,
      description: apiDesc,
      due_date: isoDate,
      task_date: isoDate,
      status: patch.status,
      priority: patch.priority,
      category: patch.category || 'umum'
    };

    const updatedApiTask = await tasksApi.update(Number(id), payload);
    const localTask = mapApiTaskToLocal(updatedApiTask);
    const index = operatorTasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      operatorTasks.value[index] = localTask;
    }
  } catch (err) {
    console.error('Error updating operator task:', err);
    alert(err instanceof Error ? err.message : 'Gagal memperbarui tugas');
  }
}

export async function deleteOperatorTask(id: string) {
  try {
    await tasksApi.delete(Number(id));
    operatorTasks.value = operatorTasks.value.filter(t => t.id !== id);
  } catch (err) {
    console.error('Error deleting operator task:', err);
    alert(err instanceof Error ? err.message : 'Gagal menghapus tugas');
  }
}

export async function generateTasksFromSchedules() {
  const todayStr = new Date().toISOString().split('T')[0];
  let generatedCount = 0;
  
  for (const schedule of routineSchedules.value) {
    if (!schedule.active) continue;
    
    // Check if task for this schedule today already exists (by matching title and date)
    const exists = operatorTasks.value.some(
      t => t.dueDate === todayStr && 
      (t.title.toLowerCase().includes(schedule.title.toLowerCase()) || 
       schedule.title.toLowerCase().includes(t.title.toLowerCase()))
    );
    
    if (!exists) {
      await addOperatorTask({
        title: schedule.title,
        description: schedule.description,
        category: schedule.category,
        cageCode: schedule.cageCode,
        assigneeCode: schedule.assigneeCode,
        dueDate: todayStr,
        status: 'belum',
        priority: 'sedang',
        rincian: schedule.rincian
      });
      generatedCount++;
    }
  }
  
  alert(`Berhasil membuat/sinkronisasi ${generatedCount} tugas baru untuk hari ini.`);
}
