import { ref, computed } from 'vue';
import { tasksApi, feedsApi, healthApi, manureApi, breedingApi, birthApi, weightApi, pregnancyApi } from '@/shared/api';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type TaskStatus = 'belum' | 'proses' | 'selesai' | 'terlambat';
export type TaskPriority = 'rendah' | 'sedang' | 'tinggi';
export type ScheduleFrequency = 'sekali' | 'harian' | 'mingguan' | 'bulanan';
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
  endTime: string;
  priority: TaskPriority;
  status: TaskStatus;
  scheduleId?: string;
  rincian?: string;
  createdAt: number;
}

// BE Task shape (from /api/tasks)
export interface ApiTask {
  id: number;
  user_id: number;
  title: string;
  description: string;
  due_date: string;
  end_time?: string;
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

export function mapApiTaskToLocal(t: ApiTask): OperatorTask {
  const userIdStr = String(t.user_id || (t as any).id_account || '1');
  let assigneeCode = userIdStr;
  let assigneeName = 'Operator Ternak';
  
  if (userIdStr === '3' || userIdStr === '6' || userIdStr === '8' || userIdStr === 'OP001') {
    assigneeCode = 'OP001';
    assigneeName = 'Operator Ternak';
  } else if (userIdStr === '5' || userIdStr === '7' || userIdStr === 'OP002') {
    assigneeCode = 'OP002';
    assigneeName = 'Operator Kebun';
  } else if (userIdStr === '1' || userIdStr === '2' || userIdStr === 'ADM001') {
    // If it's ADM001 due to backend mock, guess from content
    const descLower = ((t.description || '') + ' ' + (t.title || '')).toLowerCase();
    if (descLower.includes('lh-') || descLower.includes('l000') || descLower.includes('alpukat') || descLower.includes('kelengkeng') || descLower.includes('perkebunan')) {
      assigneeCode = 'OP002';
      assigneeName = 'Operator Kebun';
    } else {
      assigneeCode = 'OP001';
      assigneeName = 'Operator Ternak';
    }
  } else if (userIdStr === '4' || userIdStr === 'PEM001') {
    assigneeCode = 'PEM001';
    assigneeName = 'Pemilik';
  }

  // Parse title to guess category based on Role
  let category: PencatatanCategory = 'umum';
  const titleLower = (t.title || '').toLowerCase();
  
  if (assigneeCode === 'OP001') {
    // Ternak Tasks
    if (titleLower.includes('pakan') || titleLower.includes('makan')) category = 'pakan';
    else if (titleLower.includes('sehat') || titleLower.includes('sakit') || titleLower.includes('obat') || titleLower.includes('vitamin') || titleLower.includes('kesehatan')) category = 'kesehatan';
    else if (titleLower.includes('kotoran') || titleLower.includes('kohe')) category = 'kotoran';
    else if (titleLower.includes('kawin') || titleLower.includes('breeding')) category = 'perkawinan';
    else if (titleLower.includes('lahir') || titleLower.includes('anak')) category = 'kelahiran';
    else if (titleLower.includes('panen')) category = 'panen' as any;
  } else if (assigneeCode === 'OP002') {
    // Kebun Tasks
    if (titleLower.includes('siram') || titleLower.includes('air') || titleLower.includes('penyiraman')) category = 'penyiraman' as any;
    else if (titleLower.includes('pupuk') || titleLower.includes('pemupukan')) category = 'pemupukan' as any;
    else if (titleLower.includes('bersih') || titleLower.includes('gulma')) category = 'pembersihan' as any;
    else if (titleLower.includes('panen') || titleLower.includes('buah')) category = 'panen' as any;
    else if (titleLower.includes('pangkas') || titleLower.includes('ranting')) category = 'pemangkasan' as any;
  }

  // Guess cage from description or title (e.g. 'Kandang A' -> A)
  let cageCode = assigneeCode === 'OP002' ? 'L001' : 'A';
  const descLower = ((t.description || '') + ' ' + titleLower).toLowerCase();
  
  // Extract Kandang XXX format via Regex
  const kandangMatch = descLower.match(/kandang\s+([a-z0-9-]+)/i);
  if (kandangMatch && kandangMatch[1]) {
    cageCode = kandangMatch[1].toUpperCase();
  } else if (assigneeCode === 'OP001') {
    if (descLower.includes('kandang a') || descLower.includes('kandang op001')) cageCode = 'A';
    else if (descLower.includes('kandang b')) cageCode = 'B';
    else if (descLower.includes('kandang c')) cageCode = 'C';
  } else if (assigneeCode === 'OP002') {
    if (descLower.includes('l001') || descLower.includes('alpukat')) cageCode = 'L001';
    else if (descLower.includes('l0002') || descLower.includes('kelengkeng')) cageCode = 'L0002';
    else if (descLower.includes('l0003')) cageCode = 'L0003';
  }

  // Extract due_date and due_time based on API response
  // Because backend returns task_date
  const dateStr = (t as any).task_date || t.due_date || '';
  const dueDate = dateStr ? dateStr.split('T')[0] : '';
  const dueTime = dateStr.includes('T') ? dateStr.split('T')[1].substring(0, 5) : '08:00';

    let computedStatus = (t.status as TaskStatus) || 'belum';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${mins}`;

    if ((computedStatus === 'belum' || computedStatus === 'proses') && dueDate) {
      if (dueDate < todayStr) {
        computedStatus = 'terlambat';
      } else if (dueDate === todayStr && dueTime < currentTimeStr) {
        computedStatus = 'terlambat';
      }
    }

    let rincian = '';
    let parsedDescription = t.description || '';
    const rincianMatch = parsedDescription.match(/\[Rincian:\s*(.*?)\]/i);
    if (rincianMatch) {
      rincian = rincianMatch[1];
      parsedDescription = parsedDescription.replace(/\[Rincian:\s*(.*?)\]/i, '').trim();
    }

    return {
      id: String(t.id || (t as any).id_task),
      title: t.title,
      description: parsedDescription,
      assigneeCode,
      assigneeName,
      cageCode,
      category,
      dueDate,
      dueTime,
      endTime: t.end_time || '',
      priority: (t.priority as TaskPriority) || 'sedang',
      status: computedStatus,
      rincian: rincian || undefined,
      createdAt: new Date(t.created_at || Date.now()).getTime(),
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

export async function executeTernakApiSubmission(input: SubmitPencatatanInput): Promise<SubmitResult> {
  const items = (input.payload as any)?.data?.items ?? [];

  try {
    const promises: Promise<unknown>[] = [];

    // Fetch lists from backend to resolve IDs dynamically if needed
    const feedsList = ['pakan', 'stok_pakan'].includes(input.type) ? await feedsApi.getList() : [];
    const pregnancyList = input.type === 'kelahiran' ? await pregnancyApi.getList() : [];

    for (const item of items) {
      const sheepId = item.targetId ? Number(item.targetId) : null;

      if (input.type === 'pakan') {
        // Catat pemberian pakan per domba (requires resolving id_feed from feed name)
        if (sheepId) {
          const matchedFeed = feedsList.find(
            (f) => f.feed_name.toLowerCase() === (item.obat || item.name || '').toLowerCase()
          );
          const feedId = matchedFeed ? matchedFeed.id : 1;

          promises.push(
            feedsApi.recordPemberianPakan(sheepId, {
              id_feed: feedId,
              amount: Number(item.qty) || 0,
              unit: item.unit || 'kg',
              notes: item.note || '',
              feeding_date: item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString(),
            }),
          );
        }
      } else if (input.type === 'kesehatan') {
        // Catat kesehatan per domba
        if (sheepId) {
          promises.push(
            healthApi.create(sheepId, {
              checkup_date: item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString(),
              diagnosis: item.note || 'Pemeriksaan Rutin',
              action: item.tindakan || 'Pemeriksaan Rutin',
              medicine_given: item.obat || '',
              inspector_name: input.operatorName || 'Operator',
              notes: item.note || '',
            } as any),
          );
        }
      } else if (input.type === 'kotoran') {
        // Catat kotoran per domba/kandang
        const targetId = sheepId || 1; // fallback
        promises.push(
          manureApi.record(targetId, {
            activity_type: 'collection',
            amount: Number(item.qty) || 0,
            unit: item.unit || 'kg',
            notes: `Kondisi: ${item.kotoranState || 'campur'}. ${item.note || ''}`,
          } as any),
        );
      } else if (input.type === 'perkawinan') {
        // Catat perkawinan
        promises.push(
          breedingApi.recordMating({
            id_sheep_male: Number(item.idPejantan) || 0,
            id_sheep_female: sheepId || 0,
            mating_date: item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString(),
            mating_method: item.metoda || 'alami',
            status: 'proses',
            notes: item.note || '',
          } as any),
        );
      } else if (input.type === 'kelahiran') {
        // Catat kelahiran (requires pregnancy ID lookup)
        const matchedPregnancy = pregnancyList.find(
          (p) => (p as any).dam_sheep?.id_sheep === sheepId && (p as any).pregnancy_status === 'dikandung'
        );
        const pregnancyId = matchedPregnancy ? (matchedPregnancy as any).id_pregnancy : 1;

        const count = Number(item.jumlahAnak) || 1;
        const offspringList = [];
        for (let i = 1; i <= count; i++) {
          offspringList.push({
            sheep_code: `D-NEW-${Date.now()}-${i}`,
            sheep_name: count > 1 ? `${item.namaAnak || 'Anak'} ${i}` : (item.namaAnak || 'Anak'),
            gender: 'jantan',
            id_cage: Number(item.kandangAnak) || Number(input.cageCode) || 1,
            birth_weight: Number(item.beratLahir) || 0,
          });
        }

        promises.push(
          birthApi.recordBirth({
            id_pregnancy: pregnancyId,
            birth_date: item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString(),
            number_of_offspring: count,
            offspring_gender: 'campuran',
            offspring_condition: item.kondisiAnak || 'sehat',
            notes: `Kondisi Induk: ${item.kondisiInduk || 'Sehat'}. ${item.note || ''}`,
            offspring_list: offspringList,
          } as any),
        );
      } else if (input.type === 'berat_badan') {
        // Catat berat badan
        if (sheepId) {
          promises.push(
            weightApi.record(sheepId, {
              weight_kg: Number(item.qty) || 0,
              weighing_date: item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString(),
              notes: item.note || '',
            } as any),
          );
        }
      } else if (input.type === 'stok_pakan') {
        if (item.name === 'Konversi Pakan') {
          const rawName = item.obat;
          const rawQty = parseFloat(item.qty) || 0;
          const targetName = item.idPejantan;
          const targetQty = parseFloat(item.vitaminAmount) || 0;

          if (rawQty > 0) {
            const existingRaw = feedsList.find(f => f.feed_name.toLowerCase() === rawName.toLowerCase());
            if (existingRaw) {
              promises.push(
                feedsApi.updateStock(existingRaw.id, rawQty, 'kurang').catch(() => feedsApi.updateStok(existingRaw.id, rawQty, 'kurang'))
              );
            }
          }

          if (targetQty > 0) {
            const existingTarget = feedsList.find(f => f.feed_name.toLowerCase() === targetName.toLowerCase());
            if (existingTarget) {
              promises.push(
                feedsApi.updateStock(existingTarget.id, targetQty, 'tambah').catch(() => feedsApi.updateStok(existingTarget.id, targetQty, 'tambah'))
              );
            } else {
              promises.push(
                feedsApi.create({
                  feed_name: targetName,
                  feed_type: 'Hijauan',
                  unit: 'kg',
                  stock: targetQty
                } as any)
              );
            }
          }
        } else {
          // Tambah Stok
          const name = item.obat;
          const qty = parseFloat(item.qty) || 0;
          if (qty > 0) {
            const existing = feedsList.find(f => f.feed_name.toLowerCase() === name.toLowerCase());
            if (existing) {
              promises.push(
                feedsApi.updateStock(existing.id, qty, 'tambah').catch(() => feedsApi.updateStok(existing.id, qty, 'tambah'))
              );
            } else {
              promises.push(
                feedsApi.create({
                  feed_name: name,
                  feed_type: 'Hijauan',
                  unit: item.unit || 'kg',
                  stock: qty
                } as any)
              );
            }
          }
        }
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

    return { success: true, message: 'Pencatatan berhasil dieksekusi' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengeksekusi pencatatan';
    console.error('Error executing pencatatan:', err);
    return { success: false, message: msg };
  }
}

export async function executeKebunApiSubmission(input: SubmitPencatatanInput): Promise<SubmitResult> {
  // Extract API calls from PencatatanFormPage
  const { pemangkasanApi } = await import('@/shared/api');
  const items = (input.payload as any)?.data?.items ?? [];
  try {
    for (const item of items) {
      if (input.type === 'pemangkasan') {
        const weight = parseFloat(item.jumlahPemangkasan);
        if (!isNaN(weight) && weight > 0) {
          await pemangkasanApi.create({
            Aktivitas_id_aktivitas: 1,
            tanggal_aktivitas: new Date().toISOString().split('T')[0],
            nama_jenis_aktivitas: 'Pemangkasan',
            nama_rincian_aktivitas: item.selectedRincian || 'Pemangkasan',
            jumlah: String(weight),
            satuan: 'kg',
            keterangan: item.deskripsiPemangkasan || 'Pemangkasan rutin',
            Lahan_id_lahan: 1,
          } as any);

          let feedName = 'Daun Alpukat (Mentah)';
          const rincian = (item.selectedRincian || '').toLowerCase();
          if (rincian.includes('gulma') || rincian.includes('rumput')) {
            feedName = 'Gulma / Rumput Liar (Mentah)';
          } else if (rincian.includes('ranting') || rincian.includes('daun')) {
            if (rincian.includes('kelengkeng')) {
              feedName = 'Daun Kelengkeng (Mentah)';
            }
          }

          const feedsList = await feedsApi.getList();
          const existingFeed = feedsList.find((f: any) => f.feed_name.toLowerCase() === feedName.toLowerCase());

          if (existingFeed) {
            try {
              await feedsApi.updateStock(existingFeed.id, weight, 'tambah');
            } catch {
              await feedsApi.updateStok(existingFeed.id, weight, 'tambah');
            }
          } else {
            await feedsApi.create({
              feed_name: feedName,
              feed_type: 'Hijauan',
              unit: 'kg',
              stock: weight
            } as any);
          }
        }
      }
    }
    return { success: true, message: 'Pencatatan kebun dieksekusi' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengeksekusi pencatatan kebun';
    return { success: false, message: msg };
  }
}

export async function submitPencatatanSubmission(input: SubmitPencatatanInput): Promise<SubmitResult> {
  // Hanya me-return success, API execution ditahan hingga disetujui admin
  return { success: true, message: 'Pencatatan berhasil dimasukkan ke antrean' };
}
