/**
 * modules/ternak/store/operatorAdmin.ts
 *
 * Re-exports utama dari global store @/store/operatorAdmin.
 * Types dan fungsi admin-specific (approval, routine schedules) tetap di sini,
 * namun tanpa data dummy — state diinisialisasi kosong dan diisi dari BE.
 */
import { ref, computed } from 'vue';

// Re-export dari global store
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
} from '@/store/operatorAdmin';

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
export const pencatatanSubmissions = ref<PencatatanSubmission[]>([]);
export const routineSchedules = ref<RoutineSchedule[]>([]);

export const pendingApprovalCount = computed(
  () => pencatatanSubmissions.value.filter((s) => s.approvalStatus === 'pending').length,
);

export function addRoutineSchedule(schedule: Omit<RoutineSchedule, 'id' | 'createdAt'>) {
  routineSchedules.value.unshift({
    ...schedule,
    id: `S-${Date.now().toString().slice(-6)}`,
    createdAt: Date.now(),
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

export function addOperatorTask(task: any) {
  // Stub — actual task creation goes through global store / BE
  console.warn('addOperatorTask: Use /api/tasks endpoint instead');
}

export function updateOperatorTask(id: string, patch: any) {
  // Stub — actual update goes through global store / BE
  console.warn('updateOperatorTask: Use /api/tasks endpoint instead');
}

export function deleteOperatorTask(id: string) {
  // Stub — actual deletion goes through global store / BE
  console.warn('deleteOperatorTask: Use /api/tasks endpoint instead');
}

export function generateTasksFromSchedules() {
  // Stub — tasks are managed by BE
  console.warn('generateTasksFromSchedules: Tasks are now managed by BE');
}
