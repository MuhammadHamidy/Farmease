/**
 * modules/ternak/store/operatorAdmin.ts
 *
 * Re-exports utama dari global store @/store/operatorAdmin.
 * Types dan fungsi admin-specific (approval, routine schedules) tetap di sini,
 * namun tanpa data dummy — state diinisialisasi kosong dan diisi dari BE.
 */
import { ref, computed } from 'vue';

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
  time: string;
  daysOfWeek: number[];
  dayOfMonth: number;
  active: boolean;
  createdAt: number;
}

// Pencatatan submissions — state lokal untuk approval flow (bisa diganti API ke depannya)
export const pencatatanSubmissions = ref<PencatatanSubmission[]>([
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
]);
export const routineSchedules = ref<RoutineSchedule[]>([]);

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
    dueDate: new Date().toISOString().split('T')[0],
    status: 'belum',
    priority: 'sedang'
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

export function approveSubmission(id: string, reviewerName: string, note = '') {
  const sub = pencatatanSubmissions.value.find((s) => s.id === id);
  if (!sub) return;
  sub.approvalStatus = 'approved';
  sub.reviewedAt = Date.now();
  sub.reviewedBy = reviewerName;
  sub.reviewNote = note;
}

export function rejectSubmission(id: string, reviewerName: string, note: string) {
  const sub = pencatatanSubmissions.value.find((s) => s.id === id);
  if (!sub) return;
  sub.approvalStatus = 'rejected';
  sub.reviewedAt = Date.now();
  sub.reviewedBy = reviewerName;
  sub.reviewNote = note;
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

function formatDescriptionForApi(description: string, cageCode: string): string {
  const cleanDesc = (description || '').replace(/\s*\(Kandang\s+[A-C]\)/gi, '').trim();
  return `${cleanDesc} (Kandang ${cageCode.toUpperCase()})`;
}

export async function addOperatorTask(task: any) {
  try {
    let userId = 2;
    if (task.assigneeCode === 'OPT002' || task.assigneeCode === '3') {
      userId = 3;
    } else if (task.assigneeCode === 'ADM001' || task.assigneeCode === '1') {
      userId = 1;
    } else {
      const num = Number(task.assigneeCode);
      if (!isNaN(num) && num > 0) {
        userId = num;
      }
    }

    const apiTitle = formatTitleForApi(task.title, task.category);
    const apiDesc = formatDescriptionForApi(task.description, task.cageCode);

    const payload = {
      user_id: userId,
      title: apiTitle,
      description: apiDesc,
      due_date: task.dueDate,
      status: task.status,
      priority: task.priority,
    };

    const createdApiTask = await tasksApi.create(payload);
    const localTask = mapApiTaskToLocal(createdApiTask);
    operatorTasks.value.unshift(localTask);
  } catch (err) {
    console.error('Error adding operator task:', err);
    alert(err instanceof Error ? err.message : 'Gagal menambah tugas');
  }
}

export async function updateOperatorTask(id: string, patch: any) {
  try {
    let userId = 2;
    if (patch.assigneeCode === 'OPT002' || patch.assigneeCode === '3') {
      userId = 3;
    } else if (patch.assigneeCode === 'ADM001' || patch.assigneeCode === '1') {
      userId = 1;
    } else {
      const num = Number(patch.assigneeCode);
      if (!isNaN(num) && num > 0) {
        userId = num;
      }
    }

    const apiTitle = formatTitleForApi(patch.title, patch.category);
    const apiDesc = formatDescriptionForApi(patch.description, patch.cageCode);

    const payload = {
      user_id: userId,
      title: apiTitle,
      description: apiDesc,
      due_date: patch.dueDate,
      status: patch.status,
      priority: patch.priority,
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
        priority: 'sedang'
      });
      generatedCount++;
    }
  }
  
  alert(`Berhasil membuat/sinkronisasi ${generatedCount} tugas baru untuk hari ini.`);
}
