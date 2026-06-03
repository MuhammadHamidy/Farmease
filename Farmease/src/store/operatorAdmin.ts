import { ref, computed } from 'vue';
import { tasksApi, feedsApi, healthApi, manureApi, breedingApi, birthApi, weightApi } from '@/shared/api';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type TaskStatus = 'belum' | 'proses' | 'selesai' | 'terlambat';
export type TaskPriority = 'rendah' | 'sedang' | 'tinggi';
export type ScheduleFrequency = 'harian' | 'mingguan' | 'bulanan';
export type PencatatanCategory = 'pakan' | 'kesehatan' | 'kotoran' | 'perkawinan' | 'kelahiran' | 'umum';

export interface OperatorTask {
  id: string;
  title: string;
  description: string;
  assigneeCode: string;
  assigneeName: string;
  cageCode: string;
  category: PencatatanCategory;
  dueDate: string;
  dueTime: string;
  priority: TaskPriority;
  status: TaskStatus;
  scheduleId?: string;
  createdAt: number;
}

// BE Task shape (from /api/tasks)
export interface ApiTask {
  id: number;
  user_id: number;
  title: string;
  description: string;
  due_date: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

// Tasks state — loaded from BE
export const operatorTasks = ref<OperatorTask[]>([]);
export const tasksLoading = ref(false);
export const tasksError = ref<string | null>(null);

export const openOperatorTasks = computed(() =>
  operatorTasks.value.filter((t) => t.status === 'belum' || t.status === 'proses' || t.status === 'terlambat'),
);

function mapApiTaskToLocal(t: ApiTask): OperatorTask {
  return {
    id: String(t.id),
    title: t.title,
    description: t.description,
    assigneeCode: String(t.user_id),
    assigneeName: '',
    cageCode: '',
    category: 'umum',
    dueDate: t.due_date ? t.due_date.split('T')[0] ?? '' : '',
    dueTime: '',
    priority: (t.priority as TaskPriority) || 'sedang',
    status: (t.status as TaskStatus) || 'belum',
    createdAt: new Date(t.created_at).getTime(),
  };
}

export async function fetchTasks(date?: string) {
  try {
    tasksLoading.value = true;
    tasksError.value = null;
    const list = await tasksApi.getList(date);
    operatorTasks.value = list.map(mapApiTaskToLocal);
  } catch (err: unknown) {
    tasksError.value = err instanceof Error ? err.message : 'Gagal memuat tugas';
    console.error('Error fetching tasks:', err);
  } finally {
    tasksLoading.value = false;
  }
}

export async function completeTask(id: string) {
  try {
    await tasksApi.markComplete(Number(id));
    const task = operatorTasks.value.find((t) => t.id === id);
    if (task) task.status = 'selesai';
  } catch (err) {
    console.error('Error completing task:', err);
    throw err;
  }
}

// ── Pencatatan Submission → Kirim langsung ke endpoint BE yang sesuai ──

export interface SubmitPencatatanInput {
  type: string;
  scope: 'domba' | 'kandang';
  summary: string;
  payload: Record<string, unknown>;
  operatorCode?: string;
  operatorName?: string;
  cageCode?: string;
  taskId?: string;
}

export interface SubmitResult {
  success: boolean;
  message: string;
}

export async function submitPencatatanSubmission(input: SubmitPencatatanInput): Promise<SubmitResult> {
  const items = (input.payload as any)?.data?.items ?? [];

  try {
    const promises: Promise<unknown>[] = [];

    for (const item of items) {
      const sheepId = item.targetId ? Number(item.targetId) : null;

      if (input.type === 'pakan') {
        // Catat pemberian pakan per domba
        if (sheepId) {
          promises.push(
            feedsApi.recordPemberianPakan(sheepId, {
              feed_name: item.name || 'Pakan',
              quantity: Number(item.qty) || 0,
              unit: item.unit || 'kg',
              notes: item.note || '',
              date_given: item.tanggal || new Date().toISOString().split('T')[0],
            }),
          );
        }
      } else if (input.type === 'kesehatan') {
        // Catat kesehatan per domba
        if (sheepId) {
          promises.push(
            healthApi.create(sheepId, {
              health_status: item.tindakan || 'Pemeriksaan Rutin',
              description: item.note || item.obat || '',
              date_recorded: item.tanggal || new Date().toISOString().split('T')[0],
            }),
          );
        }
      } else if (input.type === 'kotoran') {
        // Catat kotoran per domba/kandang
        const targetId = sheepId || 1; // fallback
        promises.push(
          manureApi.record(targetId, {
            quantity: Number(item.qty) || 0,
            date_recorded: item.tanggal || new Date().toISOString().split('T')[0],
            notes: item.note || item.kotoranState || '',
          }),
        );
      } else if (input.type === 'perkawinan') {
        // Catat perkawinan
        promises.push(
          breedingApi.recordMating({
            id_male_sheep: Number(item.idPejantan) || 0,
            id_female_sheep: sheepId || 0,
            mating_date: item.tanggal || new Date().toISOString().split('T')[0],
            status: 'proses',
            notes: item.note || '',
          }),
        );
      } else if (input.type === 'kelahiran') {
        // Catat kelahiran
        promises.push(
          birthApi.recordBirth({
            id_sheep: sheepId || 0,
            birth_date: item.tanggal || new Date().toISOString().split('T')[0],
            num_offspring: Number(item.jumlahAnak) || 1,
            notes: `Kondisi Induk: ${item.kondisiInduk || 'Sehat'}, Kondisi Anak: ${item.kondisiAnak || 'Sehat'}. ${item.note || ''}`,
          }),
        );
      }
    }

    await Promise.all(promises);

    // Jika ada taskId, selesaikan task di BE juga
    if (input.taskId) {
      try {
        await tasksApi.markComplete(Number(input.taskId));
        const task = operatorTasks.value.find((t) => t.id === input.taskId);
        if (task) task.status = 'selesai';
      } catch {
        // Non-critical: task completion failure shouldn't block pencatatan
      }
    }

    return { success: true, message: 'Pencatatan berhasil disimpan' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menyimpan pencatatan';
    console.error('Error submitting pencatatan:', err);
    return { success: false, message: msg };
  }
}
