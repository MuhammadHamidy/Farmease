import { ref, computed } from 'vue';
import { tasksApi, feedsApi, healthApi, manureApi, breedingApi, birthApi, weightApi, pregnancyApi, authApi, routineSchedulesApi, type ApiRoutineSchedule, type User, type MetadataEnums, type EnumChoice, submissionsApi, type ApiSubmission } from '@/shared/api';
import { pemangkasanApi } from '@/shared/api/perkebunan';
import { sheep, fetchSheep } from '@/store/livestock';
import { cagesList, landsList, fetchCagesList, fetchLandsList, activePencatatanForm, triggerGlobalAlert } from '@/store/navigation';

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
    { value: 'Kawin Alami', label: 'Kawin Alami' },
    { value: 'Inseminasi Buatan', label: 'Inseminasi Buatan' },
    { value: 'Pencatatan Kelahiran', label: 'Pencatatan Kelahiran' },
    { value: 'Pemeriksaan Anak & Induk', label: 'Pemeriksaan Anak & Induk' },
    { value: 'Kontrol Kebuntingan', label: 'Kontrol Kebuntingan' }
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
  ],
  health_actions: [
    { value: 'Vaksin Enterotoxemia', label: 'Vaksin Enterotoxemia' },
    { value: 'Vitamin', label: 'Vitamin' },
    { value: 'Obat Cacing', label: 'Obat Cacing' },
    { value: 'Antibiotik', label: 'Antibiotik' }
  ],
  medicines: [
    { value: 'Clostridium Vaccine', label: 'Clostridium Vaccine (Vaksin)' },
    { value: 'Vit B-Complex', label: 'Vit B-Complex (Vitamin)' },
    { value: 'Albendazole', label: 'Albendazole (Obat Cacing)' },
    { value: 'Vitamin ADE', label: 'Vitamin ADE' },
    { value: 'Vitamin B12/PLEK', label: 'Vitamin B12/PLEK' },
    { value: 'Antibiotik K', label: 'Antibiotik K' }
  ],
  manure_conditions: [
    { value: 'basah', label: 'Basah' },
    { value: 'kering', label: 'Kering' },
    { value: 'campur', label: 'Campuran' }
  ],
  pregnancy_check_methods: [
    { value: 'usg', label: 'Cek USG' },
    { value: 'palpasi', label: 'Palpasi' },
    { value: 'testpack', label: 'Testpack' }
  ],
  pregnancy_check_results: [
    { value: 'masih_menunggu', label: 'Masih Menunggu (Perlu Pemeriksaan Ulang Nanti)' },
    { value: 'bunting_terkonfirmasi', label: 'Bunting Terkonfirmasi' },
    { value: 'gagal', label: 'Gagal / Tidak Bunting' },
    { value: 'keguguran', label: 'Keguguran' }
  ],
  estrus_check_results: [
    { value: 'birahi', label: 'Birahi (Siap Kawin)' },
    { value: 'tidak_birahi', label: 'Tidak Birahi' }
  ],
  dam_conditions: [
    { value: 'Sehat', label: 'Sehat' },
    { value: 'Lemas', label: 'Lemas' },
    { value: 'Perlu Penanganan', label: 'Perlu Penanganan' }
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
export type PencatatanCategory = 'pakan' | 'stok_pakan' | 'kesehatan' | 'kotoran' | 'perkawinan' | 'kelahiran' | 'berat_badan' | 'umum';


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

  const titleLower = (t.title || '').toLowerCase();

  // Parse title to guess category based on Role
  let category: PencatatanCategory = 'umum';
  if (t.category) {
    const rawCategory = t.category as string;
    if (rawCategory === 'weighing') {
      category = 'berat_badan';
    } else if (rawCategory === 'pakan' && (t.rincian === 'Tambah Stok' || t.rincian === 'Konversi Pakan')) {
      category = 'stok_pakan';
    } else {
      category = rawCategory as PencatatanCategory;
    }
  } else {
    const rincianLower = (t.rincian || '').toLowerCase();
    if (assigneeCode === 'OP001') {
      // Ternak Tasks
      if (titleLower.includes('stok_pakan') || titleLower.includes('stok pakan') || rincianLower.includes('tambah stok') || rincianLower.includes('konversi pakan')) category = 'stok_pakan';
      else if (titleLower.includes('pakan') || titleLower.includes('makan')) category = 'pakan';
      else if (titleLower.includes('sehat') || titleLower.includes('sakit') || titleLower.includes('obat') || titleLower.includes('vitamin') || titleLower.includes('kesehatan')) category = 'kesehatan';
      else if (titleLower.includes('kotoran') || titleLower.includes('kohe')) category = 'kotoran';
      else if (titleLower.includes('kawin') || titleLower.includes('breeding')) category = 'perkawinan';
      else if (titleLower.includes('lahir') || titleLower.includes('anak')) category = 'kelahiran';
      else if (titleLower.includes('berat badan') || titleLower.includes('timbang') || titleLower.includes('weighing') || titleLower.includes('berat_badan')) category = 'berat_badan';
      else if (titleLower.includes('panen')) category = 'panen' as any;
    } else if (assigneeCode === 'OP002') {
      // Kebun Tasks
      if (titleLower.includes('siram') || titleLower.includes('air') || titleLower.includes('penyiraman')) category = 'penyiraman' as any;
      else if (titleLower.includes('olah pupuk') || titleLower.includes('pengolahan pupuk') || titleLower.includes('kompos') || titleLower.includes('pupuk kandang')) category = 'pengolahan_pupuk' as any;
      else if (titleLower.includes('pupuk') || titleLower.includes('pemupukan')) category = 'pemupukan' as any;
      else if (titleLower.includes('bersih') || titleLower.includes('gulma')) category = 'pembersihan' as any;
      else if (titleLower.includes('panen') || titleLower.includes('buah')) category = 'panen' as any;
      else if (titleLower.includes('pangkas') || titleLower.includes('ranting')) category = 'pemangkasan' as any;
    }
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
    idMating: (t as any).id_mating || undefined,
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
    if (task) {
      task.status = 'proses';
      task.rawStatus = 'menunggu';
    }
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
    if (cagesList.value.length === 0) {
      await fetchCagesList();
    }
    if (sheep.value.length === 0) {
      await fetchSheep();
    }
    const feedsList = ['pakan', 'stok_pakan'].includes(input.type) ? await feedsApi.getList() : [];
    const pregnancyList = input.type === 'kelahiran' ? await pregnancyApi.getList() : [];

    const resolveFeedId = async (name: string, category: string) => {
      const itemName = (name || '').trim().toLowerCase();
      if (!itemName) return null;
      let matched = feedsList.find((f: any) => f.feed_name.toLowerCase() === itemName);
      
      // Jika tidak ketemu exact match, lakukan pencarian substring HANYA BILA BUKAN target silase
      // (Karena silase seringkali merupakan produk baru dengan nama spesifik seperti "Silase Rumput Liar")
      if (!matched && category !== 'silase') {
        matched = feedsList.find(
          (f: any) => f.feed_name.toLowerCase().includes(itemName) || itemName.includes(f.feed_name.toLowerCase())
        );
      }
      if (!matched) {
        let mappedCategory = (category || 'hijauan').trim().toLowerCase();
        if (mappedCategory === 'silase') {
          mappedCategory = 'hijauan';
        } else if (!['hijauan', 'konsentrat', 'pellet', 'greenery', 'vitamin'].includes(mappedCategory)) {
          mappedCategory = 'hijauan';
        }
        try {
          matched = await feedsApi.create({
            feed_name: name,
            feed_type: mappedCategory,
            unit: 'kg',
            stock: 1000
          } as any);
          feedsList.push(matched);
        } catch (err) {
          console.error('Failed to create missing feed:', err);
        }
      }
      return matched ? String(matched.id || (matched as any).id_feed || '') : null;
    };

    for (const item of items) {
      let sheepId: string | null = null;
      if (item.targetId) {
        if (!isNaN(Number(item.targetId))) {
          sheepId = String(item.targetId);
        } else {
          let found = sheep.value.find((s) => s.code.toUpperCase() === String(item.targetId).toUpperCase());
          if (!found) {
            found = sheep.value.find((s) => String(s.id) === String(item.targetId));
          }
          if (found) sheepId = String(found.id);
        }
      }

      // Resolve sheepIds (could be multiple if in cage scope)
      let targetSheepIds: string[] = [];
      const isCageScope = item.mode === 'kelompok' || input.scope === 'kandang';

      if (isCageScope) {
        const cageCodeToFind = String(item.targetId || input.cageCode || '').toUpperCase();
        const sheepsInCage = sheep.value.filter(
          (s) => String(s.cage_code).toUpperCase() === cageCodeToFind &&
                 s.status !== 'Mati' && s.status !== 'Terjual' && s.status !== 'Disembelih'
        );
        if (sheepsInCage.length > 0) {
          targetSheepIds = sheepsInCage.map(s => String(s.id));
        } else {
          // fallback to proxy sheep
          let fallbackId = '';
          const activeSheep = sheep.value.find(s => s.status !== 'Mati' && s.status !== 'Terjual' && s.status !== 'Disembelih');
          if (activeSheep) {
            fallbackId = String(activeSheep.id);
          } else if (sheep.value.length > 0) {
            fallbackId = String(sheep.value[0]?.id || '1');
          } else {
            fallbackId = '1';
          }
          targetSheepIds = [fallbackId];
        }
      } else {
        if (sheepId) {
          targetSheepIds = [sheepId];
        }
      }

      if (item.name === 'Konversi Pakan') {
        const rawNames = (item.hijauan || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        const energyNames = (item.energi || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        const proteinNames = (item.protein || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        const mineralNames = (item.mineral || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        const targetName = item.obat;
        const targetQty = parseFloat(item.qty) || 0;

        const rawQtyTotal = targetQty * 0.7;
        const energyQtyTotal = targetQty * 0.3 * (0.0180 / 0.0312);
        const proteinQtyTotal = targetQty * 0.3 * (0.0108 / 0.0312);
        const mineralQtyTotal = targetQty * 0.3 * (0.0024 / 0.0312);

        const targetId = await resolveFeedId(targetName, 'silase');

        const conversionDetails = [];

        if (rawNames.length > 0) {
          const qtyPerRaw = rawQtyTotal / rawNames.length;

          // Ambil semua data pemangkasan sekali saja untuk efisiensi
          let pruningList: any[] = [];
          const hasPruningItems = rawNames.some(n => /^Pemangkasan\s+/i.test(n.trim()));
          if (hasPruningItems) {
            try { pruningList = await pemangkasanApi.getList(); } catch (e) {
              console.warn('Gagal ambil data pemangkasan kebun:', e);
            }
          }

          for (const name of rawNames) {
            // -------------------------------------------------------
            // SINKRONISASI STOK: Jika bahan berasal dari kebun
            // -------------------------------------------------------
            if (/^Pemangkasan\s+/i.test(name.trim())) {
              try {
                const cleanName = name.trim().replace(/^Pemangkasan\s+/i, '').toLowerCase();

                // Hitung total stok yang tersedia di kebun untuk bahan ini
                const matchedEntries = pruningList.filter((p: any) => {
                  const pName = ((p.nama_rincian_aktivitas || '').replace(/^Pemangkasan\s+/i, '')).toLowerCase().trim();
                  return pName === cleanName && Number(p.jumlah) > 0;
                });
                const totalKebunStock = matchedEntries.reduce((sum: number, p: any) => sum + Number(p.jumlah), 0);

                // Cek apakah entri sudah ada di feedsList (logistics.feeds)
                const existingFeed = feedsList.find(
                  (f: any) => f.feed_name.toLowerCase() === name.trim().toLowerCase()
                );

                if (existingFeed) {
                  // Entri sudah ada: set stok menjadi total kebun yang sebenarnya
                  const feedId = String(existingFeed.id || (existingFeed as any).id_feed);
                  const currentStock = Number(existingFeed.stock || (existingFeed as any).available_stock || 0);
                  const diff = totalKebunStock - currentStock;
                  if (diff > 0) {
                    await feedsApi.updateStok(feedId, diff, 'tambah');
                    existingFeed.stock = totalKebunStock;
                    (existingFeed as any).available_stock = totalKebunStock;
                  } else if (diff < 0) {
                    await feedsApi.updateStok(feedId, Math.abs(diff), 'kurang');
                    existingFeed.stock = totalKebunStock;
                    (existingFeed as any).available_stock = totalKebunStock;
                  }
                } else {
                  // Entri belum ada: buat baru dengan stok yang tepat dari kebun
                  try {
                    const newFeed = await feedsApi.create({
                      feed_name: name.trim(),
                      feed_type: 'hijauan',
                      unit: matchedEntries[0]?.satuan || 'kg',
                      stock: totalKebunStock > 0 ? totalKebunStock : 0
                    } as any);
                    feedsList.push(newFeed);
                  } catch (createErr) {
                    console.error('Gagal buat entri feed dari kebun:', createErr);
                  }
                }

                // Kurangi jumlah di kebun secara berurutan dari entri terbesar
                let remaining = qtyPerRaw;
                const sorted = [...matchedEntries].sort((a: any, b: any) => Number(b.jumlah) - Number(a.jumlah));
                for (const entry of sorted) {
                  if (remaining <= 0) break;
                  const available = Number(entry.jumlah);
                  const deduct = Math.min(available, remaining);
                  const newQty = Math.max(0, available - deduct);
                  await pemangkasanApi.update(entry.id_pemangkasan, { jumlah: newQty });
                  remaining -= deduct;
                }
              } catch (kebunErr) {
                console.warn('Gagal sinkronisasi stok kebun untuk:', name, kebunErr);
              }
            }

            // Setelah stok tersinkron, resolve ID feed seperti biasa
            // (sekarang feedsList sudah berisi entri dengan stok yang benar)
            const rawId = await resolveFeedId(name, 'hijauan');
            if (rawId && qtyPerRaw > 0) {
              conversionDetails.push({ id_feed: rawId, amount: Number(qtyPerRaw.toFixed(2)) });
            }
          }
        }

        if (energyNames.length > 0) {
          const qtyPerEnergy = energyQtyTotal / energyNames.length;
          for (const name of energyNames) {
            const energyId = await resolveFeedId(name, 'konsentrat');
            if (energyId && qtyPerEnergy > 0) {
              conversionDetails.push({ id_feed: energyId, amount: Number(qtyPerEnergy.toFixed(2)) });
            }
          }
        }

        if (proteinNames.length > 0) {
          const qtyPerProtein = proteinQtyTotal / proteinNames.length;
          for (const name of proteinNames) {
            const proteinId = await resolveFeedId(name, 'konsentrat');
            if (proteinId && qtyPerProtein > 0) {
              conversionDetails.push({ id_feed: proteinId, amount: Number(qtyPerProtein.toFixed(2)) });
            }
          }
        }

        if (mineralNames.length > 0) {
          const qtyPerMineral = mineralQtyTotal / mineralNames.length;
          for (const name of mineralNames) {
            const mineralId = await resolveFeedId(name, 'mineral');
            if (mineralId && qtyPerMineral > 0) {
              conversionDetails.push({ id_feed: mineralId, amount: Number(qtyPerMineral.toFixed(2)) });
            }
          }
        }

        if (targetId) {
          promises.push(
            feedsApi.recordSilageConversion({
              id_target_feed: targetId,
              conversion_date: item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString(),
              target_amount: targetQty,
              unit: item.unit || 'kg',
              notes: item.note || '',
              details: conversionDetails
            })
          );
        }
      } else if (input.type === 'pakan') {
        if (targetSheepIds.length > 0) {
          const totalQty = Number(item.qty) || 0;
          const qtyPerSheep = isCageScope ? (totalQty / targetSheepIds.length) : totalQty;
          for (const sId of targetSheepIds) {
            if (item.name === 'Pemberian Mineral') {
              const mineralName = item.mineral || item.obat || 'Mineral';
              const mineralId = await resolveFeedId(mineralName, 'vitamin');
              if (mineralId) {
                promises.push(
                  feedsApi.recordPemberianPakan(sId, {
                    id_feed: String(mineralId),
                    amount: Number(qtyPerSheep.toFixed(2)),
                    unit: item.unit || 'kg',
                    notes: `Pemberian Mineral: ${mineralName}. ${item.note || ''}`,
                    feeding_date: item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString(),
                  })
                );
              }
            } else if (item.metoda === 'dadakan') {
              // Pakan Dadakan - mixtures API
              // Di pakan dadakan hanya ada Energi (62.5%) dan Protein (37.5%)
              const energyAmt = qtyPerSheep * 0.625;
              const proteinAmt = qtyPerSheep * 0.375;

              const details = [];

              if (item.energi) {
                const energySources = item.energi.split(',').map((s: string) => s.trim()).filter(Boolean);
                if (energySources.length > 0) {
                  const energyAmtPerSource = energyAmt / energySources.length;
                  for (const src of energySources) {
                    const energyId = await resolveFeedId(src, 'konsentrat');
                    if (energyId && energyAmtPerSource > 0) {
                      details.push({ id_feed: energyId, amount: Number(energyAmtPerSource.toFixed(2)) });
                    }
                  }
                }
              }
              if (item.protein) {
                const proteinSources = item.protein.split(',').map((s: string) => s.trim()).filter(Boolean);
                if (proteinSources.length > 0) {
                  const proteinAmtPerSource = proteinAmt / proteinSources.length;
                  for (const src of proteinSources) {
                    const proteinId = await resolveFeedId(src, 'konsentrat');
                    if (proteinId && proteinAmtPerSource > 0) {
                      details.push({ id_feed: proteinId, amount: Number(proteinAmtPerSource.toFixed(2)) });
                    }
                  }
                }
              }

              promises.push(
                feedsApi.recordFeedingMixture({
                  id_sheep: sId,
                  feeding_date: item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString(),
                  total_amount: Number(qtyPerSheep.toFixed(2)),
                  unit: item.unit || 'kg',
                  notes: item.note || '',
                  details: details
                })
              );
            } else {
              // Pakan Silase / Stok atau Pakan Hijauan Kebun
              const itemName = (item.obat || item.name || '').toLowerCase();
              const matchedFeed = feedsList.find(
                (f) => f.feed_name.toLowerCase() === itemName || f.feed_name.toLowerCase().includes(itemName) || itemName.includes(f.feed_name.toLowerCase())
              );
              
              let feedId = matchedFeed ? (matchedFeed.id || (matchedFeed as any).id_feed) : null;

              if (!feedId && itemName) {
                try {
                  const newFeed = await feedsApi.create({
                    feed_name: item.obat || item.name || 'Pakan Baru',
                    feed_type: item.metoda === 'silase' ? 'hijauan' : 'greenery',
                    unit: item.unit || 'kg',
                    stock: 1000
                  } as any);
                  feedId = newFeed.id || (newFeed as any).id_feed;
                  feedsList.push(newFeed);
                } catch (err) {
                  console.error('Failed to create missing feed:', err);
                }
              }

              if (feedId) {
                promises.push(
                  feedsApi.recordPemberianPakan(sId, {
                    id_feed: String(feedId),
                    amount: Number(qtyPerSheep.toFixed(2)),
                    unit: item.unit || 'kg',
                    notes: `${item.metoda === 'silase' ? 'Pakan Silase' : 'Pakan Hijauan Kebun'}. ${item.note || ''}`,
                    feeding_date: item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString(),
                  }),
                );
              }
            }
          }
        }
      } else if (input.type === 'kesehatan') {
        // Catat kesehatan per domba
        for (const sId of targetSheepIds) {
          const isCheckup = item.name === 'Pemeriksaan Rutin' || item.name === 'Pemeriksaan Kesehatan';
          promises.push(
            healthApi.create(sId, {
              checkup_date: item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString(),
              diagnosis: item.tindakan || item.note || 'Pemeriksaan Rutin',
              action: isCheckup ? (item.obat || 'Observasi') : (item.tindakan || 'Pemeriksaan Rutin'),
              medicine_given: isCheckup ? '' : (item.vitaminAmount && item.obat
                ? `${item.obat} (${item.vitaminAmount} ml)`
                : (item.obat || '')),
              inspector_name: item.petugas || input.operatorName || 'Operator',
              notes: item.note || '',
            } as any),
          );
        }
      } else if (input.type === 'kotoran') {
        // Catat kotoran per domba/kandang
        if (input.scope === 'kandang') {
          const cageId = item.targetId || input.cageCode || '';
          promises.push(
            manureApi.recordForCage(cageId, {
              activity_type: 'collection',
              amount: Number(item.qty) || 0,
              unit: item.unit || 'kg',
              notes: `Kondisi: ${item.kotoranState || 'campur'}. ${item.note || ''}`,
            } as any),
          );
        } else {
          let targetId = sheepId;
          if (!targetId) {
            // Because manure collection is cage-scoped, item.targetId is the cage code (e.g., 'K-INDUKAN-01').
            // But the backend endpoint '/api/sheep/:id/manure' requires a valid sheep UUID.
            // We look for any sheep currently in this cage.
            const cageCodeToFind = String(item.targetId || input.cageCode || '').toUpperCase();
            const sheepInCage = sheep.value.find(
              (s) => String(s.cage_code).toUpperCase() === cageCodeToFind ||
                     String(s.id).toUpperCase() === cageCodeToFind
            );
            if (sheepInCage) {
              targetId = String(sheepInCage.id);
            } else {
              // Fallback to the first active/healthy sheep in the list
              const activeSheep = sheep.value.find(s => s.status !== 'Mati' && s.status !== 'Terjual');
              if (activeSheep) {
                targetId = String(activeSheep.id);
              } else if (sheep.value.length > 0) {
                targetId = String(sheep.value[0]?.id || '1');
              } else {
                targetId = '1';
              }
            }
          }
          promises.push(
            manureApi.record(targetId, {
              activity_type: 'collection',
              amount: Number(item.qty) || 0,
              unit: item.unit || 'kg',
              notes: `Kondisi: ${item.kotoranState || 'campur'}. ${item.note || ''}`,
            } as any),
          );
        }
      } else if (input.type === 'perkawinan') {
        if (item.name === 'Kontrol Kebuntingan') {
          promises.push(
            pregnancyApi.checkPregnancy({
              id_mating: item.idMating || '',
              tanggal_pemeriksaan: item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString(),
              metode_pemeriksaan: item.metodePemeriksaan || 'manual',
              hasil: item.hasilPemeriksaan || 'masih_menunggu',
              catatan: item.note || '',
            })
          );
        } else if (item.name === 'Cek Birahi' || item.name === 'Pencatatan Birahi' || item.name === 'Pengecekan Birahi') {
          // Cek Birahi / Pencatatan Birahi doesn't record a mating. The approved submission itself acts as the historical record.
          promises.push(Promise.resolve());
        } else {
          // Catat perkawinan
          const isIB = item.metoda === 'ib' || item.metoda === 'inseminasi buatan';
          const notesStr = item.note || '';
        
          const matingPayload: any = {
            id_sheep_female: sheepId || '',
            mating_date: isIB && item.waktuIB
              ? `${item.waktuIB}:00Z` 
              : (item.tanggal ? `${item.tanggal}T00:00:00Z` : new Date().toISOString()),
            mating_method: item.metoda || 'alami',
            status: 'proses',
            notes: notesStr,
          };

          let maleId = item.idPejantan || '';
          if (maleId) {
            const foundMale = sheep.value.find((s) => s.code.toUpperCase() === String(maleId).toUpperCase() || String(s.id) === String(maleId));
            if (foundMale) {
              maleId = String(foundMale.id);
            }
          }

          if (isIB) {
            matingPayload.straw_code = item.asalSemen || '';
            matingPayload.inseminator = item.namaInseminator || '';
            if (item.sumberPejantan === 'eksternal') {
              matingPayload.external_donor = {
                name: item.donorName || '',
                origin: item.donorOrigin || '',
              };
            } else {
              matingPayload.id_sheep_male = maleId;
            }
          } else {
            matingPayload.id_sheep_male = maleId;
          }

          promises.push(breedingApi.recordMating(matingPayload));
        }
      } else if (input.type === 'kelahiran') {
        // Catat kelahiran (requires pregnancy ID lookup)
        const matchedPregnancy = pregnancyList.find(
          (p) => (p as any).dam_sheep?.id_sheep === sheepId && (p as any).pregnancy_status === 'dikandung'
        );
        const pregnancyId = matchedPregnancy ? (matchedPregnancy as any).id_pregnancy : '1';

        if (item.name === 'Keguguran') {
          promises.push(
            pregnancyApi.updateStatus(String(pregnancyId), 'keguguran')
          );
        } else {
          const count = Number(item.jumlahAnak) || 1;
          const offspringList = [];
          for (let i = 1; i <= count; i++) {
            offspringList.push({
              sheep_code: count > 1 ? `${item.sheepCode || 'A-001'}-${i}` : (item.sheepCode || 'A-001'),
              sheep_name: count > 1 ? `${item.namaAnak || 'Anak'} ${i}` : (item.namaAnak || 'Anak'),
              gender: item.genderAnak || 'jantan',
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
        }
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
        // Tambah Stok
        const name = item.obat;
        const qty = parseFloat(item.qty) || 0;
        if (qty > 0) {
          const existing = feedsList.find(f => f.feed_name.toLowerCase() === name.toLowerCase());
          if (existing) {
            const fId = existing.id || (existing as any).id_feed;
            promises.push(
              feedsApi.updateStock(fId, qty, 'tambah').catch(() => feedsApi.updateStok(fId, qty, 'tambah'))
            );
          } else {
            promises.push(
              feedsApi.create({
                feed_name: name,
                feed_type: 'hijauan',
                unit: item.unit || 'kg',
                stock: qty
              } as any)
            );
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
          task.status = 'proses';
          task.rawStatus = 'menunggu';
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
  const { 
    pemangkasanApi, 
    panenApi, 
    perawatanApi, 
    aktivitasApi,
    feedsApi,
    pohonApi,
    submissionsApi
  } = await import('@/shared/api');
  const items = (input.payload as any)?.data?.items ?? [];

  try {
    if (landsList.value.length === 0) {
      await fetchLandsList();
    }

    const promises: Promise<unknown>[] = [];

    for (const item of items) {
      const foundLand = landsList.value.find(
        (l) => String(l.code).toUpperCase() === String(input.cageCode || '').toUpperCase()
      );
      const landId = foundLand && foundLand.id ? String(foundLand.id) : '11111111-1111-1111-1111-111111111111';
      const typeLower = (input.type || '').toLowerCase();

      if (typeLower === 'pemangkasan') {
        const weight = parseFloat(item.jumlahPemangkasan || item.qty || item.amount || 0);
        if (!isNaN(weight) && weight > 0) {
          const rawUnit = item.satuanBerat || '';
          const unitLower = rawUnit.toLowerCase();
          const mappedUnit = (unitLower.includes('gram') && !unitLower.includes('kilo')) || unitLower === 'g' ? 'g' : 'kg';
          promises.push(
            pemangkasanApi.create({
              Aktivitas_id_aktivitas: '',
              tanggal_aktivitas: new Date().toISOString().split('T')[0],
              nama_jenis_aktivitas: 'Pemangkasan',
              nama_rincian_aktivitas: item.selectedRincian || 'Pemangkasan',
              jumlah: String(weight),
              satuan: mappedUnit,
              keterangan: item.deskripsiPemangkasan || 'Pemangkasan rutin',
              Lahan_id_lahan: landId,
            } as any)
          );

          let feedName = 'Hijauan Daun Alpukat';
          const rincian = (item.selectedRincian || '').toLowerCase();
          if (rincian.includes('gulma') || rincian.includes('rumput')) {
            feedName = 'Hijauan Rumput / Gulma';
          } else if (rincian.includes('ranting') || rincian.includes('daun')) {
            if (rincian.includes('kelengkeng')) {
              feedName = 'Hijauan Daun Kelengkeng';
            }
          }

          promises.push(
            (async () => {
              try {
                const feedsList = await feedsApi.getList();
                const existingFeed = feedsList.find((f: any) => f.feed_name.toLowerCase() === feedName.toLowerCase());
                if (existingFeed) {
                  const fId = existingFeed.id || (existingFeed as any).id_feed;
                  try {
                    await feedsApi.updateStock(fId, weight, 'tambah');
                  } catch {
                    await feedsApi.updateStok(fId, weight, 'tambah');
                  }
                } else {
                  await feedsApi.create({
                    feed_name: feedName,
                    feed_type: 'Hijauan',
                    unit: 'kg',
                    stock: weight
                  } as any);
                }
              } catch (err) {
                console.error('Failed to update feed stock for circular ecosystem:', err);
              }
            })()
          );
        }
      } else if (typeLower === 'panen') {
        const qty = parseInt(item.jumlahPanen || item.qty || item.amount || 0, 10);
        promises.push(
          panenApi.create({
            Aktivitas_id_aktivitas: '',
            tanggal_aktivitas: new Date().toISOString().split('T')[0],
            nama_jenis_aktivitas: 'Panen',
            nama_rincian_aktivitas: item.selectedRincian || 'Panen Buah',
            jumlah: isNaN(qty) ? 0 : qty,
            satuan: item.unit || item.satuan || 'kg',
            Lahan_id_lahan: landId,
          } as any)
        );
      } else if (typeLower === 'pemberian obat' || typeLower === 'perawatan') {
        const dosisVal = parseFloat(item.dosisPestisida || item.dosisObat || item.qty || item.amount || 0);
        promises.push(
          perawatanApi.create({
            Aktivitas_id_aktivitas: '',
            tanggal_aktivitas: new Date().toISOString().split('T')[0],
            nama_jenis_aktivitas: 'Perawatan',
            nama_rincian_aktivitas: item.selectedRincian || 'Pestisida',
            jenis_bahan: 'obat',
            fase_pohon: item.fasePohon || 'Vegetatif',
            dosis: isNaN(dosisVal) ? 0 : dosisVal,
            satuan: item.unit || 'ml',
            bagian_pohon: item.bagianPohon || 'Daun',
            teknik_perawatan: item.teknikPengendalian || 'Semprot',
            nama_obat: item.namaPestisida || item.namaObat || 'Obat',
            deskripsi: item.deskripsiPerawatan || 'Pemberian obat rutin',
            detail_pohon: item.kodePohon || 'LA001',
            Lahan_id_lahan: landId,
          } as any)
        );
      } else if (typeLower === 'pemupukan') {
        const dosisVal = parseFloat(item.jumlahBeratPupuk || item.qty || item.amount || 0);
        const rincian = (item.selectedRincian || '').toLowerCase();
        let calculatedUnit = item.unit || 'kg';
        if (rincian.includes('cair')) {
          calculatedUnit = 'Liter';
        } else if (rincian.includes('padat')) {
          calculatedUnit = 'kg';
        } else if (rincian.includes('kimia') || rincian.includes('anorganik')) {
          calculatedUnit = 'g';
        }
        promises.push(
          perawatanApi.create({
            Aktivitas_id_aktivitas: '',
            tanggal_aktivitas: new Date().toISOString().split('T')[0],
            nama_jenis_aktivitas: 'Perawatan',
            nama_rincian_aktivitas: item.selectedRincian || 'Pupuk',
            jenis_bahan: 'pupuk',
            fase_pohon: item.fasePohon || 'Generatif',
            dosis: isNaN(dosisVal) ? 0 : dosisVal,
            satuan: calculatedUnit,
            bagian_pohon: item.bagianPohon || 'Akar',
            teknik_perawatan: item.teknikPemupukan || 'Tebar',
            nama_obat: item.jenisPupukDetail || item.jenisPupuk || 'Pupuk',
            deskripsi: item.deskripsiPemupukan || 'Pemupukan rutin',
            detail_pohon: item.kodePohon || 'LA001',
            Lahan_id_lahan: landId,
          } as any)
        );
      } else if (typeLower === 'pembersihan') {
        const weightVal = parseFloat(item.beratGulma || item.beratBahanPembumbun || item.beratLimbah || item.qty || item.amount || 0);
        promises.push(
          perawatanApi.create({
            Aktivitas_id_aktivitas: '',
            tanggal_aktivitas: new Date().toISOString().split('T')[0],
            nama_jenis_aktivitas: 'Pembersihan',
            nama_rincian_aktivitas: item.selectedRincian || 'Pembersihan',
            jenis_bahan: 'pembersihan',
            fase_pohon: item.fasePohon || 'Vegetatif',
            dosis: isNaN(weightVal) ? 0 : weightVal,
            satuan: item.satuanBerat || 'kg',
            bagian_pohon: item.bagianPembersihan || 'Lahan',
            teknik_perawatan: item.alatPembersihan || 'Manual',
            nama_obat: item.jenisGulma || item.bahanPembumbun || '',
            deskripsi: item.deskripsiPembersihan || 'Pembersihan rutin',
            detail_pohon: item.kodePohon || 'LA001',
            Lahan_id_lahan: landId,
          } as any)
        );

        let circularWeight = weightVal;
        if (!isNaN(circularWeight) && circularWeight > 0 && item.tujuanPemanfaatan === 'Pakan Ternak') {
          // Normalize to kg if unit is gram
          const unitLower = (item.satuanBerat || '').toLowerCase();
          if (unitLower.includes('gram') || unitLower === 'g') {
            circularWeight = circularWeight / 1000;
          }

          let feedName = 'Gulma / Rumput Liar (Mentah)';
          if (item.selectedRincian === 'Sanitasi Serasah & Ranting') {
            const landName = (foundLand?.name || '').toLowerCase();
            if (landName.includes('kelengkeng')) {
              feedName = 'Daun Kelengkeng (Mentah)';
            } else {
              feedName = 'Daun Alpukat (Mentah)';
            }
          }

          promises.push(
            (async () => {
              try {
                const feedsList = await feedsApi.getList();
                const existingFeed = feedsList.find((f: any) => f.feed_name.toLowerCase() === feedName.toLowerCase());
                if (existingFeed) {
                  const fId = existingFeed.id || (existingFeed as any).id_feed;
                  try {
                    await feedsApi.updateStock(fId, circularWeight, 'tambah');
                  } catch {
                    await feedsApi.updateStok(fId, circularWeight, 'tambah');
                  }
                } else {
                  await feedsApi.create({
                    feed_name: feedName,
                    feed_type: 'Hijauan',
                    unit: 'kg',
                    stock: circularWeight
                  } as any);
                }
              } catch (err) {
                console.error('Failed to update feed stock for circular ecosystem from pembersihan:', err);
              }
            })()
          );
        }
      } else if (typeLower === 'penyiraman') {
        const volumeVal = parseFloat(item.volumeAir || item.qty || item.amount || 0);
        promises.push(
          perawatanApi.create({
            Aktivitas_id_aktivitas: '',
            tanggal_aktivitas: new Date().toISOString().split('T')[0],
            nama_jenis_aktivitas: 'Penyiraman',
            nama_rincian_aktivitas: item.selectedRincian || 'Penyiraman',
            jenis_bahan: 'air',
            fase_pohon: item.fasePohon || 'Vegetatif',
            dosis: isNaN(volumeVal) ? 0 : volumeVal,
            satuan: item.satuanVolumeAir || 'Liter',
            bagian_pohon: 'Akar',
            teknik_perawatan: item.teknikPenyiraman || 'Siram Manual',
            nama_obat: item.sesiPenyiraman || '',
            deskripsi: item.deskripsiPenyiraman || 'Penyiraman rutin',
            detail_pohon: item.kodePohon || 'LA001',
            Lahan_id_lahan: landId,
          } as any)
        );
      } else if (typeLower === 'penanaman') {
        promises.push(
          perawatanApi.create({
            Aktivitas_id_aktivitas: '',
            tanggal_aktivitas: new Date().toISOString().split('T')[0],
            nama_jenis_aktivitas: 'Penanaman',
            nama_rincian_aktivitas: item.selectedRincian || 'Penanaman',
            jenis_bahan: 'bibit',
            fase_pohon: item.fasePohon || 'Vegetatif',
            dosis: 1,
            satuan: 'pohon',
            bagian_pohon: 'Tanah',
            teknik_perawatan: item.alasanPenanaman || 'Bibit Baru',
            nama_obat: item.jenisBibit || 'Bibit',
            deskripsi: item.deskripsiPenanaman || 'Penanaman bibit baru',
            detail_pohon: item.kodePohon || 'LA001',
            Lahan_id_lahan: landId,
          } as any)
        );
      } else if (typeLower === 'pembuahan') {
        const dosisVal = parseFloat(item.dosisPerangsang || item.jumlahBuahDibuang || item.jumlahBuahDibungkus || item.qty || item.amount || 0);
        promises.push(
          perawatanApi.create({
            Aktivitas_id_aktivitas: '',
            tanggal_aktivitas: new Date().toISOString().split('T')[0],
            nama_jenis_aktivitas: 'Pembuahan',
            nama_rincian_aktivitas: item.selectedRincian || 'Pembuahan',
            jenis_bahan: 'hormon',
            fase_pohon: item.fasePohon || 'Generatif',
            dosis: isNaN(dosisVal) ? 0 : dosisVal,
            satuan: item.satuanDiameter || 'Unit',
            bagian_pohon: 'Buah',
            teknik_perawatan: item.jenisPerangsang || 'Perangsang',
            nama_obat: item.bahanPembungkus || '',
            deskripsi: item.deskripsiPembuahan || '',
            detail_pohon: item.kodePohon || 'LA001',
            Lahan_id_lahan: landId,
          } as any)
        );
      } else if (typeLower === 'pengolahan pupuk' || typeLower === 'pengolahan_pupuk') {
        const dosisVal = parseFloat(item.qty || 0);
        // 1. Create a Perawatan activity record for the composting activity itself
        promises.push(
          perawatanApi.create({
            Aktivitas_id_aktivitas: '',
            tanggal_aktivitas: new Date().toISOString().split('T')[0],
            nama_jenis_aktivitas: 'Pengolahan Pupuk',
            nama_rincian_aktivitas: item.selectedRincian || 'Pupuk Kandang',
            jenis_bahan: 'pupuk',
            fase_pohon: 'Generatif',
            dosis: isNaN(dosisVal) ? 0 : dosisVal,
            satuan: item.unit || 'kg',
            bagian_pohon: 'Umum',
            teknik_perawatan: 'Fermentasi',
            nama_obat: item.dekomposer || '',
            deskripsi: `Molase: ${item.molase || '-'}. Air: ${item.jumlahAir || 0} L. Bahan tambahan: ${item.bahanTambahan || '-'}. Bahan mentah: ${item.bahanMentahId || '-'}`,
            detail_pohon: '',
            Lahan_id_lahan: landId,
          } as any)
        );
        // 2. Create a Stok Pupuk record to increase Perkebunan's fertilizer stock
        if (item.selectedRincian === 'Pupuk Kandang' || item.selectedRincian === 'Pupuk Kompos') {
          let obatName = '';
          if (item.selectedRincian === 'Pupuk Kandang') {
            obatName = 'Pupuk Kandang (Fermentasi)';
          } else if (item.selectedRincian === 'Pupuk Kompos') {
            obatName = 'Pupuk Kompos (Fermentasi)';
          }

          promises.push(
            perawatanApi.create({
              Aktivitas_id_aktivitas: '',
              tanggal_aktivitas: new Date().toISOString().split('T')[0],
              nama_jenis_aktivitas: 'Stok Pupuk',
              nama_rincian_aktivitas: 'Tambah Pupuk',
              jenis_bahan: 'pupuk',
              fase_pohon: 'Generatif',
              dosis: isNaN(dosisVal) ? 0 : dosisVal,
              satuan: item.unit || 'kg',
              bagian_pohon: 'Akar',
              teknik_perawatan: 'Tebar',
              nama_obat: obatName,
              deskripsi: `Hasil pengolahan/fermentasi pupuk dari kotoran mentah/hasil pemangkasan.`,
              detail_pohon: '',
              Lahan_id_lahan: landId,
            } as any)
          );
        } else if (item.selectedRincian === 'Cek Fermentasi' && (item.siapGuna === true || item.siapGuna === 'siap')) {
          // If marked as ready to use, look up original Fermentasi Pupuk submission and add to stock
          promises.push(
            (async () => {
              try {
                const origSub = await submissionsApi.getById(item.batchFermentasiId);
                const origItem = origSub?.payload?.data?.items?.[0] || {};
                const origQty = parseFloat(origItem.qty || origItem.jumlahBeratPupuk || 0);
                const origUnit = origItem.unit || 'kg';
                const origHasil = origItem.hasilJadi || 'Pupuk Organik Padat Kandang';
                
                let baseName = origHasil;
                if (origHasil === 'Pupuk Organik Padat Kandang') {
                  baseName = 'Pupuk Kandang (Fermentasi)';
                } else if (origHasil === 'Pupuk Organik Kompos') {
                  baseName = 'Pupuk Kompos (Fermentasi)';
                } else if (origHasil === 'Pupuk Organik Cair') {
                  baseName = 'Pupuk Organik Cair (Fermentasi)';
                }

                let finalName = baseName;
                if (origItem.bahanTambahan && origItem.bahanTambahan.toLowerCase() !== 'tidak ada' && origItem.bahanTambahan.trim() !== '') {
                  finalName = `${baseName} (+ ${origItem.bahanTambahan})`;
                }

                await perawatanApi.create({
                  Aktivitas_id_aktivitas: '',
                  tanggal_aktivitas: new Date().toISOString().split('T')[0],
                  nama_jenis_aktivitas: 'Stok Pupuk',
                  nama_rincian_aktivitas: 'Tambah Pupuk',
                  jenis_bahan: 'pupuk',
                  fase_pohon: 'Generatif',
                  dosis: isNaN(origQty) ? 0 : origQty,
                  satuan: origUnit,
                  bagian_pohon: 'Akar',
                  teknik_perawatan: 'Tebar',
                  nama_obat: finalName,
                  deskripsi: `Hasil fermentasi batch ${item.batchFermentasiId} dinyatakan siap digunakan.`,
                  detail_pohon: '',
                  Lahan_id_lahan: landId,
                } as any);
              } catch (err) {
                console.error('Failed to update fertilizer stock from Cek Fermentasi:', err);
              }
            })()
          );
        } else if (item.selectedRincian === 'Cek Fermentasi' && item.siapGuna === 'gagal') {
          // If marked as failed, delete the original Fermentasi Pupuk submission so it no longer appears in dropdowns
          promises.push(
            (async () => {
              try {
                if (item.batchFermentasiId) {
                  await submissionsApi.delete(item.batchFermentasiId);
                }
              } catch (err) {
                console.error('Failed to delete failed fermentation batch:', err);
              }
            })()
          );
        }
      } else if (typeLower === 'stok obat' || typeLower === 'stok_obat') {
        const dosisVal = parseFloat(item.volumeObat || item.qty || item.amount || 0);
        let calculatedUnit = item.satuanVolumeObat || item.unit || 'ml';
        promises.push(
          perawatanApi.create({
            Aktivitas_id_aktivitas: '',
            tanggal_aktivitas: new Date().toISOString().split('T')[0],
            nama_jenis_aktivitas: 'Stok Obat',
            nama_rincian_aktivitas: item.selectedRincian || 'Tambah Obat',
            jenis_bahan: 'obat',
            fase_pohon: 'Vegetatif',
            dosis: isNaN(dosisVal) ? 0 : dosisVal,
            satuan: calculatedUnit,
            bagian_pohon: 'Daun',
            teknik_perawatan: item.teknikPemberianObat || 'Semprot',
            nama_obat: item.namaObat || 'Obat',
            deskripsi: item.catatanStok || '',
            detail_pohon: item.volumeLarutan || '',
            Lahan_id_lahan: landId,
          } as any)
        );
      } else if (typeLower === 'stok pupuk' || typeLower === 'stok_pupuk') {
        const dosisVal = parseFloat(item.volumeObat || item.qty || item.amount || 0);
        let calculatedUnit = item.satuanVolumeObat || item.unit || 'kg';
        promises.push(
          perawatanApi.create({
            Aktivitas_id_aktivitas: '',
            tanggal_aktivitas: new Date().toISOString().split('T')[0],
            nama_jenis_aktivitas: 'Stok Pupuk',
            nama_rincian_aktivitas: item.selectedRincian || 'Tambah Pupuk',
            jenis_bahan: 'pupuk',
            fase_pohon: 'Generatif',
            dosis: isNaN(dosisVal) ? 0 : dosisVal,
            satuan: calculatedUnit,
            bagian_pohon: 'Akar',
            teknik_perawatan: item.teknikPemberianObat || 'Tebar',
            nama_obat: item.namaObat || 'Pupuk',
            deskripsi: item.catatanStok || '',
            detail_pohon: item.volumeLarutan || '',
            Lahan_id_lahan: landId,
          } as any)
        );
      } else {
        promises.push(
          perawatanApi.create({
            Aktivitas_id_aktivitas: '',
            tanggal_aktivitas: new Date().toISOString().split('T')[0],
            nama_jenis_aktivitas: input.type.charAt(0).toUpperCase() + input.type.slice(1),
            nama_rincian_aktivitas: item.selectedRincian || 'Aktivitas rutin',
            jenis_bahan: 'umum',
            fase_pohon: item.fasePohon || 'Vegetatif',
            dosis: 0,
            satuan: 'unit',
            bagian_pohon: 'Umum',
            teknik_perawatan: 'Umum',
            nama_obat: '',
            deskripsi: item.deskripsi || item.note || 'Aktivitas rutin',
            detail_pohon: item.kodePohon || 'LA001',
            Lahan_id_lahan: landId,
          } as any)
        );
      }
    }

    await Promise.all(promises);
    return { success: true, message: 'Pencatatan kebun dieksekusi' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengeksekusi pencatatan kebun';
    console.error('Error executing kebun submission:', err);
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
          userId = "11111111-1111-1111-1111-111111111106"; // Fallback Operator Ternak
          const defaultAcc = accountsList.value.find(acc => acc.username === 'operator' || acc.username.includes('kandang'));
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

  const generatedId = crypto.randomUUID();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  const submissionCode = `SUB-${randomSuffix}`;

  const submissionData: any = {
    id_submission: generatedId,
    submission_code: submissionCode,
    type: input.type,
    typeLabel: activePencatatanForm.value?.jenis?.name || 'Pencatatan',
    operatorCode: input.operatorCode || 'OP001',
    operatorName: input.operatorName || 'Operator Ternak',
    cageCode: input.cageCode || 'A',
    scope: input.scope,
    summary: input.summary,
    payload: input.payload,
    submittedAt: new Date().toISOString(),
    approvalStatus: 'pending',
    taskId: input.taskId
  };

  try {
    const created = await submissionsApi.create(submissionData);
    const mapped = {
      ...submissionData,
      id: generatedId, // keep alias
      submittedAt: new Date(created.submittedAt || submissionData.submittedAt).getTime(),
      approvalStatus: created.approvalStatus || 'pending'
    };
    pencatatanSubmissions.value.unshift(mapped);
    return { success: true, message: 'Pencatatan berhasil dimasukkan ke antrean' };
  } catch (err) {
    console.warn('Backend unavailable, saving submission offline:', err);
    const offlineList = loadLocalOfflineSubmissions();
    offlineList.push(submissionData);
    saveLocalOfflineSubmissions(offlineList);

    const mapped = {
      ...submissionData,
      submittedAt: Date.now(),
      isOfflineDraft: true,
    };
    pencatatanSubmissions.value.unshift(mapped);
    return { success: true, message: 'Koneksi terputus. Pencatatan berhasil disimpan secara lokal di perangkat Anda.' };
  }
}

export interface PencatatanSubmission {
  id_submission: string;
  submission_code: string;
  id: string; // fallback alias
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
  isOfflineDraft?: boolean;
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

// Pencatatan submissions — offline local storage queue
const OFFLINE_STORAGE_KEY = 'farmease_offline_submissions';

export const loadLocalOfflineSubmissions = (): PencatatanSubmission[] => {
  const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveLocalOfflineSubmissions = (subs: PencatatanSubmission[]) => {
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(subs));
};

export const pencatatanSubmissions = ref<PencatatanSubmission[]>(
  loadLocalOfflineSubmissions().map(item => ({ ...item, isOfflineDraft: true }))
);

export const submissionsLoading = ref(false);
export const submissionsError = ref<string | null>(null);

export async function fetchSubmissions() {
  try {
    submissionsLoading.value = true;
    submissionsError.value = null;
    const list = await submissionsApi.getList();
    
    // Parse backend submissions
    const serverList = (list || []).map((s: any) => ({
      id_submission: s.id_submission || s.id,
      submission_code: s.submission_code,
      id: s.id_submission || s.id, // fallback alias
      type: s.type,
      typeLabel: s.typeLabel || s.type_label,
      operatorCode: s.operatorCode || s.operator_code,
      operatorName: s.operatorName || s.operator_name,
      cageCode: s.cageCode || s.cage_code,
      scope: s.scope,
      summary: s.summary,
      payload: s.payload,
      submittedAt: s.submittedAt ? new Date(s.submittedAt).getTime() : Date.now(),
      approvalStatus: s.approvalStatus || s.approval_status,
      reviewedAt: s.reviewedAt ? new Date(s.reviewedAt).getTime() : undefined,
      reviewedBy: s.reviewedBy || s.reviewed_by,
      reviewNote: s.reviewNote || s.review_note,
      taskId: s.taskId || s.task_id,
      isOfflineDraft: false,
    } as any));

    // Merge with any offline drafts
    const offlineList = loadLocalOfflineSubmissions().map(item => ({ ...item, isOfflineDraft: true }));
    
    // De-duplicate: filter out any offline drafts that have already been synced (same ID)
    const filteredOffline = offlineList.filter(off => !serverList.some(srv => (srv.id_submission || srv.id) === (off.id_submission || off.id)));

    pencatatanSubmissions.value = [...filteredOffline, ...serverList];
  } catch (err: any) {
    submissionsError.value = err?.message || 'Gagal memuat antrean pencatatan';
    console.error('Error fetching submissions:', err);
    pencatatanSubmissions.value = loadLocalOfflineSubmissions().map(item => ({ ...item, isOfflineDraft: true }));
  } finally {
    submissionsLoading.value = false;
  }
}

export async function syncOfflineSubmissions() {
  if (!navigator.onLine) return;
  const offlineList = loadLocalOfflineSubmissions();
  if (offlineList.length === 0) return;

  console.log(`Menyinkronkan ${offlineList.length} pencatatan offline ke backend...`);
  const remainingOffline: any[] = [];

  for (const sub of offlineList) {
    try {
      const payloadToSend = {
        ...sub,
        submittedAt: new Date(sub.submittedAt).toISOString(),
      };
      await submissionsApi.create(payloadToSend);
    } catch (err) {
      console.error(`Gagal menyinkronkan draf ${sub.id}:`, err);
      remainingOffline.push(sub);
    }
  }

  saveLocalOfflineSubmissions(remainingOffline);
  await fetchSubmissions();
}

// Sync listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineSubmissions);
  setTimeout(syncOfflineSubmissions, 3000);
}

const LOCAL_SCHEDULES_KEY = 'farmease_local_schedules';
const localSchedules = ref<RoutineSchedule[]>([]);

export const apiRoutineSchedules = ref<RoutineSchedule[]>([]);
export const schedulesLoading = ref(false);

export const routineSchedules = computed(() => {
  return [...apiRoutineSchedules.value, ...localSchedules.value];
});

export async function fetchRoutineSchedules() {
  try {
    schedulesLoading.value = true;

    // Pastikan master data kandang dan lahan ter-load agar mapping cageCode berhasil
    if (cagesList.value.length === 0) {
      await fetchCagesList();
    }
    if (landsList.value.length === 0) {
      await fetchLandsList();
    }

    const list = await routineSchedulesApi.getList();
    apiRoutineSchedules.value = (list || []).map(mapApiScheduleToLocal);
  } catch (err) {
    console.error('Error fetching routine schedules:', err);
  } finally {
    schedulesLoading.value = false;
  }
}

const LOCAL_TO_DB_RINCIAN: Record<string, string> = {
  'Pakan Pagi': 'Pakan Pagi',
  'Pakan Siang': 'Pakan Pagi',
  'Pakan Sore': 'Pakan Sore',
  'Pemberian Mineral': 'Pakan Pagi',
  'Tambah Stok': 'Konversi Pakan',
  'Konversi Pakan': 'Konversi Pakan',
  'Pemeriksaan Rutin': 'Pemeriksaan Medis',
  'Vitamin': 'Pemberian Vitamin',
  'Vaksin': 'Vaksinasi',
  'Obat Cacing': 'Pemberian Obat',
  'Kawin Alam': 'Kawin Alami',
  'Inseminasi Buatan': 'Inseminasi Buatan',
  'Pencatatan Birahi': 'Kawin Alami',
  'Kontrol Kebuntingan': 'Kontrol Kebuntingan',
  'Lahir Normal': 'Pencatatan Kelahiran',
  'Kembar': 'Pencatatan Kelahiran',
  'Lahir Cesar': 'Pencatatan Kelahiran',
  'Panen Kotoran': 'Pembersihan Kandang',
  'Pembersihan Lantai': 'Pembersihan Kandang',
  'Timbang Rutin': '',
};

const DB_TO_LOCAL_RINCIAN: Record<string, string> = {
  'Pakan Pagi': 'Pakan Pagi',
  'Pakan Sore': 'Pakan Sore',
  'Konversi Pakan': 'Konversi Pakan',
  'Pemberian Obat': 'Obat Cacing',
  'Pemberian Vitamin': 'Vitamin',
  'Vaksinasi': 'Vaksin',
  'Pemeriksaan Medis': 'Pemeriksaan Rutin',
  'Pembersihan Kandang': 'Panen Kotoran',
  'Fermentasi Kotoran': 'Panen Kotoran',
  'Kawin Alami': 'Kawin Alam',
  'Inseminasi Buatan': 'Inseminasi Buatan',
  'Pencatatan Kelahiran': 'Lahir Normal',
  'Pemeriksaan Anak & Induk': 'Lahir Normal',
  'Kontrol Kebuntingan': 'Kontrol Kebuntingan',
};

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

  let category = api.category;
  if (category === 'weighing') {
    category = 'berat_badan' as any;
  } else if (category === 'pakan' && (api.rincian === 'Tambah Stok' || api.rincian === 'Konversi Pakan')) {
    category = 'stok_pakan' as any;
  }

  return {
    id: api.id,
    title: api.title,
    description: api.description,
    category,
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
    rincian: api.rincian ? (DB_TO_LOCAL_RINCIAN[api.rincian] || api.rincian) : (api.category === 'weighing' ? 'Timbang Rutin' : ''),
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
        return cat.includes('ternak') || username.includes('ternak') || username.includes('kandang') || username === 'operator';
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
        idAccount = '11111111-1111-1111-1111-111111111106'; // Operator Ternak
      } else if (local.assigneeCode === 'PEM001') {
        idAccount = '11111111-1111-1111-1111-111111111104'; // Pemilik
      } else {
        idAccount = '11111111-1111-1111-1111-111111111106'; // Fallback to Operator Ternak
      }
    }
  }

  let category = local.category;
  if (category === 'stok_pakan') {
    category = 'pakan' as any;
  } else if (category === 'berat_badan') {
    category = 'weighing' as any;
  }

  const payload: Partial<ApiRoutineSchedule> = {
    title: local.title,
    description: local.description,
    category: category,
    frequency: local.frequency,
    days_of_week: local.daysOfWeek,
    day_of_month: local.dayOfMonth,
    priority: local.priority,
    id_cage: idCage,
    id_account: idAccount,
    rincian: local.rincian ? (LOCAL_TO_DB_RINCIAN[local.rincian] !== undefined ? LOCAL_TO_DB_RINCIAN[local.rincian] : local.rincian) : undefined,
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
  () => pencatatanSubmissions.value.filter((s) => {
    if (s.approvalStatus !== 'pending') return false;
    const isPerkebunan = ['perawatan', 'pemangkasan', 'panen', 'aktivitas', 'lahan', 'pohon', 'tanaman'].includes((s.type || '').toLowerCase());
    return !isPerkebunan;
  }).length,
);

export async function addRoutineSchedule(schedule: Omit<RoutineSchedule, 'id' | 'createdAt'>) {
  try {
    const apiPayload = mapLocalScheduleToApi(schedule);
    const createdApi = await routineSchedulesApi.create(apiPayload);
    const mapped = mapApiScheduleToLocal(createdApi);
    apiRoutineSchedules.value.unshift(mapped);
    await fetchTasks();
  } catch (err: any) {
    console.error('Error adding routine schedule:', err);
    const status = err?.response?.status;
    const message = err?.response?.data?.error_message || err?.response?.data?.message;
    if (status === 409) {
      triggerGlobalAlert('Gagal Menyimpan Jadwal', `Jadwal dengan nama dan kandang/lahan yang sama sudah ada. Silakan ubah jadwal yang ada atau buat dengan nama berbeda.`, 'error');
    } else {
      triggerGlobalAlert('Gagal Menyimpan Jadwal', message ? `Gagal membuat jadwal: ${message}` : 'Gagal membuat jadwal rutin', 'error');
    }
  }
}

export async function updateRoutineSchedule(id: string, patch: Partial<Omit<RoutineSchedule, 'id' | 'createdAt'>>) {
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
    triggerGlobalAlert('Gagal Memperbarui', 'Gagal memperbarui jadwal rutin.', 'error');
  }
}

export async function deleteRoutineSchedule(id: string) {
  try {
    await routineSchedulesApi.delete(id);
    apiRoutineSchedules.value = apiRoutineSchedules.value.filter((s) => s.id !== id);
    await fetchTasks();
  } catch (err) {
    console.error('Error deleting routine schedule:', err);
    triggerGlobalAlert('Gagal Menghapus', 'Gagal menghapus jadwal rutin.', 'error');
  }
}

export async function approveSubmission(id: string, reviewerName: string, note = '') {
  const sub = pencatatanSubmissions.value.find((s) => s.id === id || s.id_submission === id);
  if (!sub) return { success: false, message: 'Data pencatatan tidak ditemukan' };
  
  // Call API depending on type - exclude peternakan types to handle all gardening types correctly
  const isPerkebunan = !['pakan', 'kesehatan', 'kotoran', 'perkawinan', 'kelahiran', 'berat_badan', 'stok_pakan'].includes((sub.type || '').toLowerCase());
  
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
    try {
      await submissionsApi.update(id, {
        approvalStatus: 'approved',
        reviewedBy: reviewerName,
        reviewNote: note,
        reviewedAt: Date.now(),
      });
      
      sub.approvalStatus = 'approved';
      sub.reviewedAt = Date.now();
      sub.reviewedBy = reviewerName;
      sub.reviewNote = note;

      if (sub.taskId) {
        const task = operatorTasks.value.find((t) => t.id === sub.taskId);
        if (task) {
          task.status = 'selesai';
          task.rawStatus = 'selesai';
        }
      }

      return { success: true, message: result.message };
    } catch (err: any) {
      console.error('Failed to update submission status on server:', err);
      return { success: false, message: 'Gagal memperbarui status persetujuan di server: ' + err.message };
    }
  } else {
    return { success: false, message: result.message };
  }
}

export async function rejectSubmission(id: string, reviewerName: string, note: string) {
  const sub = pencatatanSubmissions.value.find((s) => s.id === id || s.id_submission === id);
  if (!sub) return { success: false, message: 'Data pencatatan tidak ditemukan' };
  
  try {
    await submissionsApi.update(id, {
      approvalStatus: 'rejected',
      reviewedBy: reviewerName,
      reviewNote: note,
      reviewedAt: Date.now(),
    });
    
    sub.approvalStatus = 'rejected';
    sub.reviewedAt = Date.now();
    sub.reviewedBy = reviewerName;
    sub.reviewNote = note;

    if (sub.taskId) {
      const task = operatorTasks.value.find((t) => t.id === sub.taskId);
      if (task) {
        task.status = 'belum';
        task.rawStatus = 'belum';
      }
    }

    return { success: true, message: 'Pencatatan berhasil ditolak.' };
  } catch (err: any) {
    console.error('Failed to reject submission on server:', err);
    return { success: false, message: 'Gagal menolak pencatatan di server: ' + err.message };
  }
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
  if (assigneeCode) {
    const matchedAccount = accountsList.value.find((acc) => {
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
    let isoDate: string;
    if (task.dueDate) {
      const localDt = new Date(`${task.dueDate}T${timeStr}:00`);
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
      category: task.category === 'stok_pakan' ? 'pakan' : (task.category === 'berat_badan' ? 'weighing' : (task.category || 'umum'))
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
      category: patch.category === 'stok_pakan' ? 'pakan' : (patch.category === 'berat_badan' ? 'weighing' : (patch.category || 'umum'))
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

