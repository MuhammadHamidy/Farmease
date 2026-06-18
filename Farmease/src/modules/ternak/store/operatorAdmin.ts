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
  metadataEnums,
  fetchMetadataEnums,
  pencatatanSubmissions,
  fetchSubmissions,
  approveSubmission,
  rejectSubmission,
  pendingApprovalCount,
} from '@/store/operatorAdmin';
import { tasksApi } from '@/shared/api';
import { cagesList, landsList, fetchCagesList, fetchLandsList } from '@/store/navigation';

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
  metadataEnums,
  fetchMetadataEnums,
  pencatatanSubmissions,
  fetchSubmissions,
  approveSubmission,
  rejectSubmission,
  pendingApprovalCount,
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

// Submissions re-exported from global store
import { routineSchedulesApi, type ApiRoutineSchedule } from '@/shared/api';



// Approval functions re-exported from global store

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
  if (assigneeCode) {
    const matchedAccount = accountsList.value.find((acc: any) => {
      const cat = String(acc.operator_category || '').toLowerCase();
      const username = String(acc.username || '').toLowerCase();
      if (assigneeCode === 'OP002') {
        return cat.includes('kebun') || username.includes('kebun');
      } else if (assigneeCode === 'OP001') {
        return cat.includes('ternak') || username.includes('ternak') || username.includes('kandang') || username === 'operator';
      } else if (assigneeCode === 'PEM001') {
        return cat.includes('pemilik') || username.includes('pemilik');
      }
      return false;
    });

    if (matchedAccount) {
      return String(matchedAccount.id);
    }
  }

  // Fallback defaults matching seeder IDs
  if (assigneeCode === 'OP002') {
    return '11111111-1111-1111-1111-111111111105'; // Operator Kebun
  } else if (assigneeCode === 'OP001') {
    return '11111111-1111-1111-1111-111111111106'; // Operator Ternak
  } else if (assigneeCode === 'PEM001') {
    return '11111111-1111-1111-1111-111111111104'; // Pemilik
  }
  return '11111111-1111-1111-1111-111111111101'; // Admin fallback
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

    const existingStatus = operatorTasks.value.find((t: any) => t.id === id)?.status || 'belum';
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
    const index = operatorTasks.value.findIndex((t: any) => t.id === id);
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
    operatorTasks.value = operatorTasks.value.filter((t: any) => t.id !== id);
  } catch (err) {
    console.error('Error deleting operator task:', err);
    alert(err instanceof Error ? err.message : 'Gagal menghapus tugas');
  }
}

export async function generateTasksFromSchedules(date?: string) {
  try {
    await routineSchedulesApi.generate(7);
    await fetchTasks(date);
    alert('Berhasil menyinkronkan tugas rutin untuk 7 hari ke depan.');
  } catch (err) {
    console.error('Error generating tasks from schedules:', err);
    alert('Gagal menyinkronkan tugas rutin');
  }
}
