import { ref, computed } from 'vue';
import { tasksApi, feedsApi, healthApi, manureApi, breedingApi, birthApi, weightApi, pregnancyApi, authApi, type User, type MetadataEnums, type EnumChoice } from '@/shared/api';
import { sheep } from '@/store/livestock';
import { cagesList, landsList, fetchCagesList, fetchLandsList } from '@/store/navigation';

export const accountsList = ref<User[]>([]);

export const metadataEnums = ref<MetadataEnums>({
  gender: [
    { value: 'jantan', label: 'Jantan' },
    { value: 'betina', label: 'Betina' }
  ],
  sheep_status: [
    { value: 'aktif', label: 'Aktif' },
    { value: 'hamil', label: 'Hamil' },
    { value: 'dijual', label: 'Dijual' },
    { value: 'mati', label: 'Mati' },
    { value: 'disembelih', label: 'Disembelih' }
  ],
  feed_category: [
    { value: 'hijauan', label: 'Hijauan' },
    { value: 'konsentrat', label: 'Konsentrat' },
    { value: 'pellet', label: 'Pellet' },
    { value: 'greenery', label: 'Greenery' },
    { value: 'vitamin', label: 'Vitamin' }
  ],
  task_category: [
    { value: 'pakan', label: 'Pemberian Pakan' },
    { value: 'kesehatan', label: 'Kesehatan / Pengobatan' },
    { value: 'kotoran', label: 'Kotoran / Sanitasi' },
    { value: 'perkawinan', label: 'Perkawinan' },
    { value: 'kelahiran', label: 'Kelahiran' },
    { value: 'penyiraman', label: 'Penyiraman' },
    { value: 'pemupukan', label: 'Pemupukan' },
    { value: 'pembersihan', label: 'Pembersihan Lahan' },
    { value: 'pemangkasan', label: 'Pemangkasan' },
    { value: 'panen', label: 'Panen' },
    { value: 'weighing', label: 'Penimbangan Berat' },
    { value: 'maintenance', label: 'Pemeliharaan' },
    { value: 'admin', label: 'Administrasi' },
    { value: 'umum', label: 'Umum' }
  ],
  task_rincian: [
    { value: 'Pakan Pagi', label: 'Pakan Pagi' },
    { value: 'Pakan Sore', label: 'Pakan Sore' },
    { value: 'Konversi Pakan', label: 'Konversi Pakan' },
    { value: 'Pemberian Obat', label: 'Pemberian Obat' },
    { value: 'Pemberian Vitamin', label: 'Pemberian Vitamin' },
    { value: 'Vaksinasi', label: 'Vaksinasi' },
    { value: 'Pemeriksaan Medis', label: 'Pemeriksaan Medis' },
    { value: 'Pembersihan Kandang', label: 'Pembersihan Kandang' },
    { value: 'Fermentasi Kotoran', label: 'Fermentasi Kotoran' },
    { value: 'Kawin Alami', label: 'Kawin Alami' },
    { value: 'Inseminasi Buatan', label: 'Inseminasi Buatan' },
    { value: 'Pencatatan Kelahiran', label: 'Pencatatan Kelahiran' },
    { value: 'Pemeriksaan Anak & Induk', label: 'Pemeriksaan Anak & Induk' }
  ],
  day_of_week: [
    { value: 'Senin', label: 'Senin' },
    { value: 'Selasa', label: 'Selasa' },
    { value: 'Rabu', label: 'Rabu' },
    { value: 'Kamis', label: 'Kamis' },
    { value: 'Jumat', label: 'Jumat' },
    { value: 'Sabtu', label: 'Sabtu' },
    { value: 'Minggu', label: 'Minggu' }
  ],
  frequency: [
    { value: 'sekali', label: 'Sekali' },
    { value: 'harian', label: 'Harian' },
    { value: 'mingguan', label: 'Mingguan' },
    { value: 'bulanan', label: 'Bulanan' }
  ],
  mating_method: [
    { value: 'alami', label: 'Alami' },
    { value: 'ib', label: 'Inseminasi Buatan (IB)' }
  ],
  mating_status: [
    { value: 'proses', label: 'Dalam Proses' },
    { value: 'sukses', label: 'Sukses' },
    { value: 'gagal', label: 'Gagal' }
  ],
  pregnancy_status: [
    { value: 'dikandung', label: 'Dikandung' },
    { value: 'melahirkan', label: 'Melahirkan' },
    { value: 'keguguran', label: 'Keguguran' }
  ],
  offspring_gender: [
    { value: 'jantan', label: 'Jantan' },
    { value: 'betina', label: 'Betina' },
    { value: 'campuran', label: 'Campuran' }
  ],
  offspring_condition: [
    { value: 'sehat', label: 'Sehat' },
    { value: 'lemas', label: 'Lemas' },
    { value: 'cacat', label: 'Cacat' },
    { value: 'mati', label: 'Mati' }
  ],
  manure_activity: [
    { value: 'collection', label: 'Pengumpulan' },
    { value: 'fermentation', label: 'Fermentasi' },
    { value: 'distribution', label: 'Penyaluran' }
  ],
  manure_dest: [
    { value: 'internal', label: 'Internal' },
    { value: 'internal_kebun', label: 'Internal Kebun' },
    { value: 'external_sale', label: 'Penjualan Eksternal' }
  ],
  priority: [
    { value: 'rendah', label: 'Rendah' },
    { value: 'sedang', label: 'Sedang' },
    { value: 'tinggi', label: 'Tinggi' }
  ],
  task_status: [
    { value: 'belum', label: 'Belum Dikerjakan' },
    { value: 'proses', label: 'Sedang Diproses' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'terlambat', label: 'Terlambat' },
    { value: 'pending', label: 'Pending' },
    { value: 'done', label: 'Selesai (Done)' },
    { value: 'menunggu', label: 'Menunggu Validasi' }
  ]
});

export async function fetchMetadataEnums() {
  try {
    const enums = await authApi.getMetadataEnums();
    if (enums) {
      metadataEnums.value = enums;
    }
  } catch (err) {
    console.error('Failed to fetch metadata enums, using local fallbacks:', err);
  }
}

export async function fetchAccountsList() {
  try {
    // Proactively fetch enums whenever accounts list is requested (common layout mounts)
    await fetchMetadataEnums();
    const list = await authApi.getAccounts();
    accountsList.value = list;
  } catch (err) {
    console.error('Error fetching accounts in global operatorAdmin store:', err);
  }
}

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
  rawStatus?: string;
  scheduleId?: string;
  idCage?: string;
  rincian?: string;
  createdAt: number;
  idAccount?: string;
}

// BE Task shape (from /api/tasks)
export interface ApiTask {
  id: string | number;
  user_id: string | number;
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

// Auto-recompute task statuses every 60 seconds so the UI reflects real-time deadlines
// without requiring a page reload or manual fetch.
setInterval(() => {
  if (operatorTasks.value.length > 0) {
    operatorTasks.value = operatorTasks.value.map(t => {
      // Re-derive status from the raw API shape we still have access to via rawStatus
      // We reconstruct a minimal API-like object to pass through mapApiTaskToLocal
      const recomputed = recomputeTaskStatus(t);
      return recomputed;
    });
  }
}, 60_000); // every 60 seconds

/**
 * Recompute only the status of an already-mapped OperatorTask without re-fetching from API.
 * Uses the same time logic as mapApiTaskToLocal.
 */
function recomputeTaskStatus(task: OperatorTask): OperatorTask {
  const rawStatus = String(task.rawStatus || task.status || '').toLowerCase();
  let computedStatus: TaskStatus = task.status;

  if (['selesai', 'completed', 'done', 'approved'].includes(rawStatus)) {
    return task; // terminal — never override
  }

  const now = new Date();
  const localYear = now.getFullYear();
  const localMonth = String(now.getMonth() + 1).padStart(2, '0');
  const localDay = String(now.getDate()).padStart(2, '0');
  const todayStr = `${localYear}-${localMonth}-${localDay}`;
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${hours}:${mins}`;

  const { dueDate, dueTime, endTime } = task;

  if (dueDate && dueDate < todayStr) {
    computedStatus = 'terlambat';
  } else if (dueDate === todayStr) {
    const deadline = (endTime && endTime.trim()) ? endTime.trim() : dueTime;
    if (deadline && currentTimeStr > deadline) {
      computedStatus = 'terlambat';
    } else {
      // Still within window
      if (computedStatus === 'terlambat') computedStatus = 'belum';
    }
  } else if (dueDate > todayStr) {
    if (computedStatus === 'terlambat') computedStatus = 'belum';
  }

  if (computedStatus === task.status) return task; // no change, return same reference
  return { ...task, status: computedStatus };
}


export function mapApiTaskToLocal(t: any): OperatorTask {
  const userIdStr = String(t.user_id || (t as any).id_account || '1');
  let assigneeCode = 'OP001';
  let assigneeName = 'Operator Ternak';
  
  const foundAcc = accountsList.value.find((acc) => String(acc.id) === userIdStr);
  if (foundAcc) {
    const cat = String(foundAcc.operator_category || '').toLowerCase();
    const username = String(foundAcc.username || '').toLowerCase();
    if (cat.includes('kebun') || username.includes('kebun')) {
      assigneeCode = 'OP002';
      assigneeName = 'Operator Kebun';
    } else if (cat.includes('ternak') || username === 'operator') {
      assigneeCode = 'OP001';
      assigneeName = 'Operator Ternak';
    } else if (cat.includes('pemilik') || username.includes('pemilik')) {
      assigneeCode = 'PEM001';
      assigneeName = 'Pemilik';
    } else if (cat.includes('admin') || username.includes('admin')) {
      const descLower = ((t.description || '') + ' ' + (t.title || '')).toLowerCase();
      if (descLower.includes('lh-') || descLower.includes('l000') || descLower.includes('alpukat') || descLower.includes('kelengkeng') || descLower.includes('perkebunan') || descLower.includes('kebun') || descLower.includes('lahan')) {
        assigneeCode = 'OP002';
        assigneeName = 'Operator Kebun';
      } else {
        assigneeCode = 'OP001';
        assigneeName = 'Operator Ternak';
      }
    } else {
      assigneeCode = 'OP001';
      assigneeName = 'Operator Ternak';
    }
  } else {
    if (userIdStr === '3' || userIdStr === '6' || userIdStr === '8' || userIdStr === 'OP001' || userIdStr === '00000000-0000-0000-0000-000000000002' || userIdStr === '11111111-1111-1111-1111-111111111103' || userIdStr === '11111111-1111-1111-1111-111111111106' || userIdStr === '11111111-1111-1111-1111-111111111108') {
      assigneeCode = 'OP001';
      assigneeName = 'Operator Ternak';
    } else if (userIdStr === '5' || userIdStr === '7' || userIdStr === 'OP002' || userIdStr === '00000000-0000-0000-0000-000000000003' || userIdStr === '11111111-1111-1111-1111-111111111105' || userIdStr === '11111111-1111-1111-1111-111111111107') {
      assigneeCode = 'OP002';
      assigneeName = 'Operator Kebun';
    } else if (userIdStr === '1' || userIdStr === '2' || userIdStr === 'ADM001' || userIdStr === '11111111-1111-1111-1111-111111111101') {
      const descLower = ((t.description || '') + ' ' + (t.title || '')).toLowerCase();
      if (descLower.includes('lh-') || descLower.includes('l000') || descLower.includes('alpukat') || descLower.includes('kelengkeng') || descLower.includes('perkebunan') || descLower.includes('kebun')) {
        assigneeCode = 'OP002';
        assigneeName = 'Operator Kebun';
      } else {
        assigneeCode = 'OP001';
        assigneeName = 'Operator Ternak';
      }
    } else if (userIdStr === '4' || userIdStr === 'PEM001' || userIdStr === '00000000-0000-0000-0000-000000000004' || userIdStr === '11111111-1111-1111-1111-111111111104') {
      assigneeCode = 'PEM001';
      assigneeName = 'Pemilik';
    }
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

  // Resolve cage code from id_cage UUID using cagesList and landsList
  let cageCode = '';
  if (t.id_cage) {
    const foundCage = cagesList.value.find((c) => String(c.id) === String(t.id_cage));
    if (foundCage) {
      cageCode = foundCage.code;
    } else {
      const foundLand = landsList.value.find((l) => String(l.id) === String(t.id_cage));
      if (foundLand) {
        cageCode = foundLand.code;
      }
    }
  }
  if (!cageCode) {
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
  }
  if (!cageCode) {
    cageCode = assigneeCode === 'OP002' ? 'L001' : 'A';
  }

  // Extract due_date and due_time based on API response
  // Because backend returns task_date (stored as UTC ISO string)
  // We need to convert to local time (WIB = UTC+7) for correct display and comparison
  const dateStr = (t as any).task_date || t.due_date || '';
  let dueDate = '';
  let dueTime = t.start_time ? t.start_time.substring(0, 5) : '08:00';
  if (dateStr) {
    // Convert UTC ISO string to local date/time
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      const localYear = parsedDate.getFullYear();
      const localMonth = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const localDay = String(parsedDate.getDate()).padStart(2, '0');
      dueDate = `${localYear}-${localMonth}-${localDay}`;
      if (!t.start_time) {
        const localHours = String(parsedDate.getHours()).padStart(2, '0');
        const localMins = String(parsedDate.getMinutes()).padStart(2, '0');
        dueTime = `${localHours}:${localMins}`;
      }
    } else {
      // fallback for plain date strings like '2026-06-13'
      dueDate = dateStr.split('T')[0];
      if (!t.start_time) {
        dueTime = dateStr.includes('T') ? dateStr.split('T')[1].substring(0, 5) : '08:00';
      }
    }
  }

  let rawStatus = String(t.status || '').toLowerCase();
  let computedStatus: TaskStatus = 'belum';
  if (['selesai', 'completed', 'done', 'approved'].includes(rawStatus)) {
    // Terminal status — cannot be overridden
    computedStatus = 'selesai';
  } else if (['proses', 'in_progress', 'menunggu'].includes(rawStatus)) {
    computedStatus = 'proses';
  } else if (['terlambat', 'overdue'].includes(rawStatus)) {
    computedStatus = 'terlambat';
  }
  // Note: we always re-check time below even if rawStatus was 'terlambat',
  // because the stored status may be stale (e.g. task was late but now it's a new window).

  // end_time is stored as user-entered local time string (e.g. '23:00') — no conversion needed
  const endTime = (t.end_time && t.end_time.trim()) ? t.end_time.trim() : '';

  // Re-evaluate status based on current time (only for non-selesai tasks)
  if (computedStatus !== 'selesai') {
    const now = new Date();
    const localYear = now.getFullYear();
    const localMonth = String(now.getMonth() + 1).padStart(2, '0');
    const localDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${localYear}-${localMonth}-${localDay}`;
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${mins}`;

    if (dueDate && dueDate < todayStr) {
      // Past date — always late
      computedStatus = 'terlambat';
    } else if (dueDate === todayStr) {
      const deadline = endTime || dueTime;
      if (deadline && currentTimeStr > deadline) {
        // Deadline has passed
        computedStatus = 'terlambat';
      } else {
        // Still within window or not yet started — not late
        // Preserve 'proses' if it was proses, otherwise 'belum'
        if (computedStatus === 'terlambat') {
          computedStatus = 'belum';
        }
      }
    } else if (dueDate > todayStr) {
      // Future date — cannot be late yet
      if (computedStatus === 'terlambat') {
        computedStatus = 'belum';
      }
    }
  }

  let rincian = t.rincian || '';
  let parsedDescription = t.description || '';
  if (!rincian) {
    const rincianMatch = parsedDescription.match(/\[Rincian:\s*(.*?)\]/i);
    if (rincianMatch) {
      rincian = rincianMatch[1] || '';
      parsedDescription = parsedDescription.replace(/\[Rincian:\s*(.*?)\]/i, '').trim();
    }
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
    endTime,
    priority: (t.priority as TaskPriority) || 'sedang',
    status: computedStatus,
    rawStatus: rawStatus, // store raw status just in case
    scheduleId: t.schedule_id || undefined,
    idCage: t.id_cage || undefined,
    rincian: rincian || undefined,
    createdAt: new Date(t.created_at || Date.now()).getTime(),
    idAccount: userIdStr,
  } as any;
}

export async function fetchTasks(date?: string) {
  try {
    tasksLoading.value = true;
    tasksError.value = null;

    // Pastikan master data kandang dan lahan ter-load agar mapping cageCode berhasil
    if (cagesList.value.length === 0) {
      await fetchCagesList();
    }
    if (landsList.value.length === 0) {
      await fetchLandsList();
    }

    const list = await tasksApi.getList(date);
    operatorTasks.value = (list || []).map(mapApiTaskToLocal);
  } catch (err: unknown) {
    tasksError.value = err instanceof Error ? err.message : 'Gagal memuat tugas';
    console.error('Error fetching tasks:', err);
  } finally {
    tasksLoading.value = false;
  }
}

export async function completeTask(id: string) {
  try {
    await tasksApi.markComplete(id);
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
      let sheepId: string | null = null;
      if (item.targetId) {
        if (!isNaN(Number(item.targetId))) {
          sheepId = String(item.targetId);
        } else {
          const found = sheep.value.find((s) => s.code.toUpperCase() === String(item.targetId).toUpperCase());
          if (found) sheepId = String(found.id);
        }
      }

      if (input.type === 'pakan') {
        // Catat pemberian pakan per domba (requires resolving id_feed from feed name)
        if (sheepId) {
          const itemName = (item.obat || item.name || '').toLowerCase();
          const matchedFeed = feedsList.find(
            (f) => f.feed_name.toLowerCase() === itemName || f.feed_name.toLowerCase().includes(itemName) || itemName.includes(f.feed_name.toLowerCase())
          );
          
          let feedId = matchedFeed ? matchedFeed.id : null;

          if (!feedId && itemName) {
            try {
              const newFeed = await feedsApi.create({
                feed_name: item.obat || item.name || 'Pakan Baru',
                feed_type: 'Hijauan',
                unit: item.unit || 'kg',
                stock: 1000 // Beri stok default agar tidak insufficient stock
              } as any);
              feedId = newFeed.id;
              feedsList.push(newFeed);
            } catch (err) {
              console.error('Failed to create missing feed:', err);
              continue; // Skip if feed creation fails to avoid 422 invalid UUID
            }
          }

          if (feedId) {
            promises.push(
              feedsApi.recordPemberianPakan(sheepId, {
                id_feed: String(feedId),
                amount: Number(item.qty) || 0,
                unit: item.unit || 'kg',
                notes: item.note || '',
                feeding_date: item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString(),
              }),
            );
          }
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
        const targetId = sheepId || '1'; // fallback
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
            id_sheep_male: item.idPejantan || '',
            id_sheep_female: sheepId || '',
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
        const pregnancyId = matchedPregnancy ? (matchedPregnancy as any).id_pregnancy : '1';

        const count = Number(item.jumlahAnak) || 1;
        const offspringList = [];
        for (let i = 1; i <= count; i++) {
          offspringList.push({
            sheep_code: `D-NEW-${Date.now()}-${i}`,
            sheep_name: count > 1 ? `${item.namaAnak || 'Anak'} ${i}` : (item.namaAnak || 'Anak'),
            gender: 'jantan',
            id_cage: item.kandangAnak || input.cageCode || '',
            birth_weight: Number(item.beratLahir) || 0,
          });
        }

        promises.push(
          birthApi.recordBirth({
            id_pregnancy: String(pregnancyId),
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
        await tasksApi.markComplete(input.taskId);
        const task = operatorTasks.value.find((t) => t.id === input.taskId);
        if (task) {
          task.status = 'selesai';
          task.rawStatus = 'approved';
        }
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
  // Update task status to "menunggu"
  if (input.taskId) {
    try {
      const task = operatorTasks.value.find((t) => t.id === input.taskId);
      if (task) {
        let isoDate: string;
        const timeStr = task.dueTime || '08:00';
        if (task.dueDate) {
          const localDt = new Date(`${task.dueDate}T${timeStr}:00`);
          isoDate = localDt.toISOString();
        } else {
          isoDate = new Date().toISOString();
        }

        let userId = task.idAccount;
        if (!userId) {
          userId = "11111111-1111-1111-1111-111111111103"; // Fallback Operator Ternak
          const defaultAcc = accountsList.value.find(acc => acc.username === 'operator');
          if (defaultAcc) {
            userId = String(defaultAcc.id);
          }
        }
        await tasksApi.update(input.taskId, {
          title: task.title,
          description: task.description,
          due_date: isoDate,
          task_date: isoDate,
          end_time: task.endTime || '',
          status: 'menunggu',
          priority: task.priority,
          category: task.category || 'umum',
          user_id: userId
        } as any);
        task.status = 'proses';
        task.rawStatus = 'menunggu';
      }
    } catch (e) {
      console.error('Failed to update task status to menunggu', e);
    }
  }

  // Hanya me-return success, API execution ditahan hingga disetujui admin
  return { success: true, message: 'Pencatatan berhasil dimasukkan ke antrean' };
}
