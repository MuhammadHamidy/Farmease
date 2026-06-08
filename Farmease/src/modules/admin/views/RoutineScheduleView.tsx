import { defineComponent, ref, reactive, computed, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import Typography from '@/shared/ui/admin/Typography';
import Button from '@/shared/ui/admin/Button';
import Select from '@/shared/ui/admin/Select';
import CustomInput from '@/shared/ui/admin/Input';
import { landsList, fetchLandsList, cagesList, fetchCagesList } from '@/store/navigation';
import {
  routineSchedules,
  addRoutineSchedule,
  updateRoutineSchedule,
  deleteRoutineSchedule,
  generateTasksFromSchedules,
  operatorTasks,
  fetchTasks,
  deleteOperatorTask,
  type RoutineSchedule,
  type PencatatanCategory,
  type ScheduleFrequency,
  type OperatorTask
} from '@/modules/ternak/store/operatorAdmin';

const operators = [
  { code: 'OPT001', name: 'Operator Ternak' },
  { code: 'OPT002', name: 'Operator Kebun' },
  { code: 'PEM001', name: 'Pemilik' },
  { code: 'ADM001', name: 'Admin' },
];

const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default defineComponent({
  name: 'RoutineScheduleView',
  props: {
    type: {
      type: String as PropType<'peternakan' | 'perkebunan'>,
      default: 'peternakan'
    }
  },
  setup(props) {
    const isModalOpen = ref(false);
    const isEditing = ref(false);
    const isDetailOpen = ref(false);
    const selectedTask = ref<OperatorTask | null>(null);

    const toastMessage = ref('');
    const toastType = ref<'success'|'error'>('success');
    const showToast = ref(false);

    const displayToast = (msg: string, type: 'success'|'error' = 'success') => {
      toastMessage.value = msg;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => { showToast.value = false; }, 3000);
    };

    const sessionFilter = ref('Semua Sesi');
    const statusFilter = ref('Semua Status');
    const dateFilter = ref(new Date().toISOString().split('T')[0]);

    watch(dateFilter, async (newVal) => {
      await fetchTasks(newVal);
    });

    const categories = computed(() => props.type === 'peternakan'
      ? ['Pakan', 'Kesehatan', 'Kotoran', 'Perkawinan', 'Kelahiran', 'Umum']
      : ['Penyiraman', 'Pemupukan', 'Pemangkasan', 'Panen', 'Pembersihan', 'Umum']);
      
    const categoryValues = computed(() => props.type === 'peternakan'
      ? ['pakan', 'kesehatan', 'kotoran', 'perkawinan', 'kelahiran', 'umum']
      : ['penyiraman', 'pemupukan', 'pemangkasan', 'panen', 'pembersihan', 'umum']);

    const ternakRincianOptions: Record<string, string[]> = {
      pakan: ['Pakan Pagi', 'Pakan Siang', 'Pakan Sore', 'Suplementasi'],
      stok_pakan: ['Tambah Stok', 'Konversi Pakan'],
      kesehatan: ['Pemeriksaan Rutin', 'Vitamin', 'Vaksin', 'Obat Cacing'],
      perkawinan: ['Kawin Alam', 'IB', 'Cek Birahi', 'Kontrol Kebuntingan'],
      kelahiran: ['Lahir Normal', 'Kembar', 'Lahir Cesar'],
      kotoran: ['Sanitasi Harian', 'Panen Kotoran', 'Pembersihan Lantai', 'Fermentasi'],
      berat_badan: ['Timbang Rutin', 'Timbang Harian', 'Timbang Bulanan', 'Timbang Mandiri'],
      umum: ['Lainnya']
    };

    const kebunRincianOptions: Record<string, string[]> = {
      panen: ['Panen Buah', 'Hasil Panen'],
      pemangkasan: ['Ranting dan Daun', 'Rumput Liar (Gulma)'],
      pembersihan: ['Limbah'],
      pembuahan: ['Perangsang'],
      penanaman: ['Bibit Baru'],
      'pengendalian hama': ['Pestisida', 'Fungisida'],
      pemupukan: ['Pupuk Cair', 'Pupuk Organik', 'Pupuk Padat'],
      penyiraman: ['Penyiraman Rutin'],
      umum: ['Lainnya']
    };

    const locationOptions = computed(() => {
      if (props.type === 'peternakan') {
        if (cagesList.value.length === 0) return [{ value: 'A', label: 'Kandang A' }, { value: 'B', label: 'Kandang B' }, { value: 'C', label: 'Kandang C' }];
        return cagesList.value.map(c => ({ value: c.code, label: c.name || `Kandang ${c.code}` }));
      } else {
        if (landsList.value.length === 0) return [{ value: 'LH-001', label: 'LH-001' }, { value: 'LH-002', label: 'LH-002' }, { value: 'LH-003', label: 'LH-003' }];
        return landsList.value.map(l => ({ value: l.code, label: l.code }));
      }
    });

    const viewTitle = computed(() =>
      props.type === 'peternakan'
        ? 'Jadwal Rutin Peternakan'
        : 'Jadwal Rutin Perkebunan'
    );

    const viewSubtitle = computed(() =>
      props.type === 'peternakan'
        ? 'Kelola jadwal rutin dan tinjau pembagian tugas harian operator peternakan'
        : 'Kelola jadwal rutin dan tinjau pembagian tugas harian operator perkebunan'
    );

    const form = reactive({
      id: '',
      title: '',
      description: '',
      rincian: '',
      category: (props.type === 'peternakan' ? 'pakan' : 'penyiraman') as any,
      cageCode: props.type === 'peternakan' ? 'A' : 'LH-001',
      assigneeCode: props.type === 'peternakan' ? 'OPT001' : 'OPT002',
      frequency: 'harian' as ScheduleFrequency,
      startDate: new Date().toISOString().split('T')[0],
      time: '08:00',
      endTime: '12:00',
      daysOfWeek: [1, 2, 3, 4, 5] as number[],
      dayOfMonth: 1,
      priority: 'sedang' as 'rendah' | 'sedang' | 'tinggi',
      active: true,
    });

    const currentRincianOptions = computed(() => {
      const opts = props.type === 'peternakan' ? ternakRincianOptions : kebunRincianOptions;
      return opts[form.category] || ['Lainnya'];
    });

    const getLandName = (cageCode: string) => {
      const land = landsList.value.find((l) => l.code === cageCode);
      if (land) {
        return land.name.replace(/lahan/gi, '').trim();
      }
      if (cageCode === 'LH-001' || cageCode === 'A') return 'Alpukat';
      if (cageCode === 'LH-002' || cageCode === 'B') return 'Kelengkeng';
      if (cageCode === 'LH-003' || cageCode === 'C') return 'Alpukat';
      return cageCode;
    };

    const getJenisPencatatan = (task: any) => {
      const titleLower = (task.title || '').toLowerCase();
      const descLower = (task.description || '').toLowerCase();
      const text = titleLower + ' ' + descLower;

      if (text.includes('siram') || text.includes('penyiraman') || text.includes('air')) return 'Penyiraman';
      if (text.includes('pupuk') || text.includes('pemupukan')) return 'Pemupukan';
      if (text.includes('pangkas') || text.includes('pemangkasan') || text.includes('ranting')) return 'Pemangkasan';
      if (text.includes('panen') || text.includes('buah') || text.includes('petik')) return 'Panen';
      if (text.includes('bersih') || text.includes('pembersihan') || text.includes('gulma') || text.includes('rumput')) return 'Pembersihan';

      if (titleLower.includes('admin report') || task.category === 'umum') {
        if (task.cageCode === 'A' || task.cageCode === 'LH-001') return 'Panen';
        if (task.cageCode === 'B' || task.cageCode === 'LH-002') return 'Pemangkasan';
        return 'Pemupukan';
      }

      if (task.category && task.category !== 'umum') {
        return task.category;
      }
      return 'Umum';
    };

    onMounted(async () => {
      await fetchTasks(dateFilter.value);
      if (props.type === 'perkebunan') {
        await fetchLandsList();
      } else {
        await fetchCagesList();
      }
    });

    const frequencyLabel = (f: string) => {
      if (f === 'sekali') return 'Sekali';
      if (f === 'harian') return 'Harian';
      if (f === 'mingguan') return 'Mingguan';
      return 'Bulanan';
    };

    const getTaskFrequency = (task: OperatorTask) => {
      const schedule = routineSchedules.value.find((s) => s.title === task.title && s.cageCode === task.cageCode);
      return schedule ? frequencyLabel(schedule.frequency) : 'Sekali';
    };

    const openAdd = () => {
      isEditing.value = false;
      form.id = '';
      form.title = '';
      form.description = '';
      form.category = (props.type === 'peternakan' ? 'pakan' : 'penyiraman') as any;
      form.rincian = currentRincianOptions.value[0] || '';
      form.cageCode = props.type === 'peternakan' ? 'A' : 'LH-001';
      form.assigneeCode = props.type === 'peternakan' ? 'OPT001' : 'OPT002';
      form.frequency = 'harian';
      form.startDate = new Date().toISOString().split('T')[0];
      form.time = '08:00';
      form.endTime = '12:00';
      form.daysOfWeek = [1, 2, 3, 4, 5];
      form.dayOfMonth = 1;
      form.priority = 'sedang';
      form.active = true;
      isModalOpen.value = true;
    };

    const openEdit = (schedule: RoutineSchedule) => {
      isEditing.value = true;
      Object.assign(form, schedule);
      if (!form.rincian) form.rincian = currentRincianOptions.value[0] || '';
      isModalOpen.value = true;
    };

    const openDetail = (task: OperatorTask) => {
      selectedTask.value = task;
      isDetailOpen.value = true;
    };

    const toggleDay = (day: number) => {
      if (form.daysOfWeek.includes(day)) {
        form.daysOfWeek = form.daysOfWeek.filter((d) => d !== day);
      } else {
        form.daysOfWeek = [...form.daysOfWeek, day].sort();
      }
    };

    const saveSchedule = async () => {
      if (!form.title.trim()) return displayToast('Judul tugas wajib diisi', 'error');
      const assignee = operators.find((o) => o.code === form.assigneeCode);
      const payload = {
        title: form.title,
        description: form.description,
        rincian: form.rincian,
        category: form.category,
        cageCode: form.cageCode,
        assigneeCode: form.assigneeCode,
        assigneeName: assignee?.name || form.assigneeCode,
        frequency: form.frequency,
        startDate: form.startDate,
        time: form.time,
        endTime: form.endTime,
        daysOfWeek: [...form.daysOfWeek],
        dayOfMonth: form.dayOfMonth,
        priority: form.priority,
        active: form.active,
      };

      try {
        if (isEditing.value) {
          updateRoutineSchedule(form.id, payload);
          displayToast('Tugas berhasil diperbarui!');
        } else {
          await addRoutineSchedule(payload);
          displayToast('Tugas baru berhasil ditambahkan!');
        }
        isModalOpen.value = false;
        await fetchTasks(dateFilter.value);
      } catch (err) {
        displayToast('Terjadi kesalahan saat menyimpan tugas. Silakan coba lagi.', 'error');
      }
    };

    const getSessionFromTime = (timeStr: string): 'Pagi' | 'Siang' | 'Sore' => {
      if (!timeStr) return 'Pagi';
      const hour = parseInt(timeStr.split(':')[0] || '0');
      if (hour >= 4 && hour < 12) return 'Pagi';
      if (hour >= 12 && hour < 17) return 'Siang';
      return 'Sore';
    };

    const statusLabel = (s: string) => {
      if (s === 'selesai') return 'Selesai';
      if (s === 'terlambat') return 'Terlambat';
      return 'Belum Dikerjakan';
    };

    const statusClass = (s: string) => {
      if (s === 'selesai') return 'selesai';
      if (s === 'terlambat') return 'terlambat';
      return 'belum';
    };

    // Filtered lists based on props.type
    const filteredSchedules = computed(() => {
      const targetAssignee = props.type === 'peternakan' ? 'OPT001' : 'OPT002';
      return routineSchedules.value.filter((s) => s.assigneeCode === targetAssignee);
    });

    const filteredTasks = computed(() => {
      const targetAssignee = props.type === 'peternakan' ? 'OPT001' : 'OPT002';
      return operatorTasks.value
        .filter((t) => t.assigneeCode === targetAssignee)
        .filter((t) => t.dueDate === dateFilter.value)
        .filter(t => {
          // Session Filter
          if (sessionFilter.value !== 'Semua Sesi') {
            const session = getSessionFromTime(t.dueTime);
            if (session !== sessionFilter.value) return false;
          }

          // Status Filter
          if (statusFilter.value !== 'Semua Status') {
            if (statusFilter.value === 'Belum Dikerjakan' && t.status !== 'belum' && t.status !== 'proses') return false;
            if (statusFilter.value === 'Selesai' && t.status !== 'selesai') return false;
            if (statusFilter.value === 'Terlambat' && t.status !== 'terlambat') return false;
          }

          return true;
        });
    });

    // Task Statistics Computed
    const totalTodayTasks = computed(() => filteredTasks.value.length);
    const completedTasksCount = computed(() => filteredTasks.value.filter(t => t.status === 'selesai').length);
    const pendingTasksCount = computed(() => filteredTasks.value.filter(t => t.status === 'belum' || t.status === 'proses').length);
    const lateTasksCount = computed(() => filteredTasks.value.filter(t => t.status === 'terlambat').length);

    // Grouping computed
    const groupedTasks = computed(() => {
      const groups = {
        Pagi: [] as OperatorTask[],
        Siang: [] as OperatorTask[],
        Sore: [] as OperatorTask[],
      };
      for (const t of filteredTasks.value) {
        const session = getSessionFromTime(t.dueTime);
        groups[session].push(t);
      }
      return groups;
    });

    const activeCount = computed(() => filteredSchedules.value.filter((s) => s.active).length);

    return () => (
      <div class="admin-peternakan-page">
        {showToast.value && (
          <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: toastType.value === 'success' ? '#4caf50' : '#f44336', color: 'white', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeInDown 0.3s ease' }}>
            {toastType.value === 'success' ? '✅' : '⚠️'} {toastMessage.value}
          </div>
        )}

        {/* Header Section */}
        <div class="view-header align-items-center mb-4">
          <div>
            <Typography variant="h2" class="view-title">
              {viewTitle.value}
            </Typography>
            <Typography variant="span" color="secondary">
              {viewSubtitle.value}
            </Typography>
          </div>
          <div class="d-flex gap-2 flex-wrap">

              <Button 
                variant="solid" 
                onClick={openAdd}
                style={{ backgroundColor: '#30360E', color: '#ffffff', borderColor: '#30360E' }}
              >
                {props.type === 'peternakan' ? '+ Tambah Jadwal Rutin' : '+ Tambah Tugas Baru'}
              </Button>
          </div>
        </div>

        {/* Ringkasan Informasi Cards */}
        <div class="row g-3 mb-4">
          <div class="col-12 col-sm-6 col-md-3">
            <div class="dark-summary-card">
              <span class="card-label">Total tugas hari ini</span>
              <span class="card-value">{totalTodayTasks.value}</span>
              <span class="card-sub">rutin + insidental</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="dark-summary-card">
              <span class="card-label">Selesai</span>
              <span class="card-value text-success" style={{ color: '#55a630' }}>{completedTasksCount.value}</span>
              <span class="card-sub">dari {totalTodayTasks.value} tugas</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="dark-summary-card">
              <span class="card-label">Belum dikerjakan</span>
              <span class="card-value text-warning" style={{ color: '#e89005' }}>{pendingTasksCount.value}</span>
              <span class="card-sub">perlu perhatian</span>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="dark-summary-card">
              <span class="card-label">Terlambat</span>
              <span class="card-value text-danger" style={{ color: '#ff4d4d' }}>{lateTasksCount.value}</span>
              <span class="card-sub">deadline terlewat</span>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns Section */}
        <div class="admin-filter-bar mb-4">
          <div class="flex-grow-1">
            <label class="pencatatan-label d-block mb-1">Tanggal</label>
            <input
              type="date"
              class="form-control pencatatan-input w-100"
              style={{ height: '38px' }}
              value={dateFilter.value}
              onInput={(e: any) => { dateFilter.value = e.target.value; }}
            />
          </div>
          <div class="flex-grow-1">
            <label class="pencatatan-label d-block mb-1">Semua Sesi</label>
            <Select
              options={['Semua Sesi', 'Pagi', 'Siang', 'Sore']}
              modelValue={sessionFilter.value}
              onUpdate:modelValue={(val: string) => {
                sessionFilter.value = val;
              }}
              theme={props.type}
            />
          </div>
          <div class="flex-grow-1">
            <label class="pencatatan-label d-block mb-1">Semua Status</label>
            <Select
              options={['Semua Status', 'Belum Dikerjakan', 'Selesai', 'Terlambat']}
              modelValue={statusFilter.value}
              onUpdate:modelValue={(val: string) => {
                statusFilter.value = val;
              }}
              theme={props.type}
            />
          </div>
        </div>

        {/* Dynamic grouped task cards */}
        <div class="sessions-container">
          {(['Pagi', 'Siang', 'Sore'] as const).map(sessionName => {
            const tasksInSession = groupedTasks.value[sessionName];
            if (sessionFilter.value !== 'Semua Sesi' && sessionFilter.value !== sessionName) return null;
            if (tasksInSession.length === 0) return null;

            return (
              <div class="session-section mb-4" key={sessionName}>
                <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                  <span style={{ fontSize: '1.2rem' }}>
                    {sessionName === 'Pagi' ? '☀️' : sessionName === 'Siang' ? '🌤️' : '🌙'}
                  </span>
                  <Typography variant="h3" size="text-lg" weight="extrabold" className="m-0 text-dark">
                    Sesi {sessionName}
                  </Typography>
                  <span class="badge bg-secondary rounded-pill ms-2" style={{ fontSize: '0.75rem' }}>
                    {tasksInSession.length} Tugas
                  </span>
                </div>
                <div class="row g-3">
                  {tasksInSession.map(task => {
                    if (props.type === 'perkebunan') {
                      return (
                        <div class="col-12 col-md-4" key={task.id}>
                          <div 
                            class="task-session-card bg-white"
                            style="border: 1.5px solid var(--admin-primary); border-radius: 0.75rem; padding: 1rem 1rem 1.25rem 1rem; display: flex; flex-direction: column; gap: 0.75rem; transition: all 0.3s ease; position: relative;"
                          >
                            {/* Top Badge: Status Tugas */}
                            <div style="display: flex; justify-content: flex-start;">
                              <span
                                class={['status-badge text-capitalize', statusClass(task.status)]}
                                style="padding: 0.22rem 0.65rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em;"
                              >
                                {statusLabel(task.status)}
                              </span>
                            </div>

                            {/* Middle & Action Layout */}
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-top: 0.25rem;">
                              {/* Left Info: Icon & Text */}
                              <div style="display: flex; align-items: flex-start; gap: 0.75rem; min-w-0; flex-grow: 1;">
                                <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 0.15rem; border: 1.5px solid var(--admin-border);">
                                  <img 
                                    src={getLandName(task.cageCode).toLowerCase().includes('kelengkeng') ? '/icon/kelengkeng.png' : '/icon/alpukat.png'} 
                                    alt="Icon" 
                                    style="width: 1.3rem; height: 1.3rem; object-fit: contain;" 
                                  />
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 0.15rem; min-w-0;">
                                  {/* Title: Jenis Tugas */}
                                  <strong style="font-size: 1.15rem; color: #111827; font-weight: 800; line-height: 1.2; text-transform: capitalize;" class="text-truncate">
                                    {getJenisPencatatan(task)}
                                  </strong>
                                  {/* Subtitle: Nama Operator (Kandang replaced by Kebun) */}
                                  <span style="font-size: 0.8rem; color: #6b7280; font-weight: 600;" class="text-truncate">
                                    {task.assigneeName.replace(/operator kandang/gi, 'Operator Ternak')}
                                  </span>
                                  {/* Land Name */}
                                  <span style="font-size: 0.8rem; color: #6b7280; font-weight: 600;" class="text-truncate">
                                    {getLandName(task.cageCode)}
                                  </span>
                                </div>
                              </div>

                              {/* Right: Button */}
                              <div style="display: flex; align-items: center; gap: 0.55rem; flex-shrink: 0;">
                                <button
                                  type="button"
                                  onClick={() => openDetail(task)}
                                  class={['task-card-btn', task.status === 'selesai' ? 'selesai' : '']}
                                >
                                  {task.status === 'selesai' ? 'Selesai' : 'Lihat Tugas'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div class="col-12 col-md-6 col-lg-4" key={task.id}>
                        <div class="task-session-card bg-white border rounded-5 p-4 shadow-sm h-100 d-flex flex-column justify-content-between">
                          <div>
                            {/* Header: Waktu & Status */}
                            <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                              <span class="badge bg-light text-dark border fw-bold">
                                ⏱️ {task.dueTime || '08:00'} WIB
                              </span>
                              <span class={['status-badge text-capitalize', statusClass(task.status)]}>
                                {statusLabel(task.status)}
                              </span>
                            </div>

                            {/* Task details */}
                            <Typography variant="h4" size="text-sm" weight="bold" className="text-dark m-0 mb-3 text-capitalize">
                              {task.category}
                            </Typography>

                            {/* Operator metadata */}
                            <div class="pt-3 border-top task-details-list small mb-3">
                              <div class="d-flex justify-content-between mb-1">
                                <span class="text-muted">Tanggal:</span>
                                <span class="fw-bold text-dark">{task.dueDate || '-'}</span>
                              </div>
                              <div class="d-flex justify-content-between mb-1">
                                <span class="text-muted">Frekuensi:</span>
                                <span class="fw-bold text-dark">{getTaskFrequency(task)}</span>
                              </div>
                              <div class="d-flex justify-content-between mb-1">
                                <span class="text-muted">{props.type === 'peternakan' ? 'Kandang' : 'Lahan'}:</span>
                                <span class="fw-bold text-dark">{task.cageCode}</span>
                              </div>
                              <div class="d-flex justify-content-between mb-1">
                                <span class="text-muted">Nama Operator:</span>
                                <span class="fw-bold text-dark">{task.assigneeName}</span>
                              </div>
                            </div>

                            {/* Deskripsi di paling bawah */}
                            <div class="mt-auto pt-2 border-top">
                              <span class="text-muted small d-block mb-1">Deskripsi:</span>
                              <Typography variant="p" size="text-xs" color="secondary" className="d-block m-0 text-truncate-2">
                                {task.description || '-'}
                              </Typography>
                            </div>
                          </div>

                          {/* Detail Button */}
                          <div class="pt-3 mt-3 border-top">
                            <button 
                              type="button" 
                              class="btn btn-sm btn-outline-primary w-100 rounded-pill fw-bold py-2"
                              onClick={() => openDetail(task)}
                            >
                              Detail Tugas
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredTasks.value.length === 0 && (
            <div class="text-center py-5 bg-white border rounded-5 shadow-sm text-secondary">
              Tidak ada tugas rutin ditemukan untuk sesi/status terpilih.
            </div>
          )}
        </div>

        {/* Task Detail Modal */}
        {isDetailOpen.value && selectedTask.value && (
          <div class="peternakan-modal-overlay" onClick={() => (isDetailOpen.value = false)}>
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div class="peternakan-modal-header">
                <button class="peternakan-modal-close" onClick={() => (isDetailOpen.value = false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <div class="peternakan-modal-title">Detail Tugas Operator</div>
              </div>
              <div class="peternakan-modal-body mt-4">
                <div class="text-center mb-4">
                  <div class="d-inline-block p-3 rounded-circle bg-light mb-2">
                    <img 
                      src={props.type === 'peternakan' ? 
                        (selectedTask.value.category === 'pakan' ? '/icon/catat_pakan.png' :
                         selectedTask.value.category === 'kesehatan' ? '/icon/catat_sehat.png' :
                         selectedTask.value.category === 'kotoran' ? '/icon/catat_kotoran.png' :
                         selectedTask.value.category === 'perkawinan' ? '/icon/catat_kawin.png' :
                         selectedTask.value.category === 'kelahiran' ? '/icon/catat_lahir.png' : '/icon/catat_jenis.png') 
                        : '/icon/pohon.png'} 
                      alt="" 
                      style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
                    />
                  </div>
                  <Typography variant="h3" size="text-lg" weight="extrabold" className="text-dark m-0">
                    {selectedTask.value.title}
                  </Typography>
                  <span class={['status-badge mt-2 d-inline-block', statusClass(selectedTask.value.status)]}>
                    {statusLabel(selectedTask.value.status)}
                  </span>
                </div>

                <div class="border rounded-5 p-3 bg-light mb-4">
                  <div class="mb-3">
                    <span class="text-muted d-block small">Deskripsi Tugas:</span>
                    <span class="fw-semibold text-dark">{selectedTask.value.description || 'Tidak ada deskripsi.'}</span>
                  </div>
                  <div class="row g-2 pt-2 border-top">
                    <div class="col-6">
                      <span class="text-muted d-block small">Sesi (Mulai):</span>
                      <span class="fw-semibold text-dark">{getSessionFromTime(selectedTask.value.dueTime)} ({selectedTask.value.dueTime} WIB)</span>
                    </div>
                    <div class="col-6">
                      <span class="text-muted d-block small">Jam Tenggat:</span>
                      <span class="fw-semibold text-dark">{selectedTask.value.endTime ? `${selectedTask.value.endTime} WIB` : '-'}</span>
                    </div>
                    <div class="col-6">
                      <span class="text-muted d-block small">{props.type === 'peternakan' ? 'Kandang' : 'Lahan'}:</span>
                      <span class="fw-semibold text-dark">{props.type === 'peternakan' ? 'Kandang' : 'Lahan'} {selectedTask.value.cageCode}</span>
                    </div>
                    <div class="col-6">
                      <span class="text-muted d-block small">Jenis Tugas:</span>
                      <span class="fw-semibold text-dark text-capitalize">{selectedTask.value.category}</span>
                    </div>
                    <div class="col-6">
                      <span class="text-muted d-block small">Prioritas:</span>
                      <span class="fw-semibold text-dark text-capitalize">{selectedTask.value.priority}</span>
                    </div>
                  </div>
                </div>

                <div class="border rounded-5 p-3 mb-4">
                  <span class="text-muted d-block small mb-2">Ditugaskan Kepada:</span>
                  <div class="d-flex align-items-center gap-3">
                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-light" style={{ width: '40px', height: '40px', border: '1px solid var(--admin-border)' }}>
                      <img src="/icon/ternak_op.png" alt="Operator" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <span class="d-block fw-bold text-dark">{selectedTask.value.assigneeName}</span>
                      <span class="text-muted small">{selectedTask.value.assigneeCode}</span>
                    </div>
                  </div>
                </div>

                <div class="d-flex gap-3 mt-4 pt-3 border-top">
                  <button 
                    type="button"
                    class="btn btn-outline-danger grow py-2.5 rounded-pill fw-bold"
                    onClick={async () => {
                      if (confirm(`Apakah Anda yakin ingin menghapus tugas "${selectedTask.value?.title}"?`)) {
                        await deleteOperatorTask(selectedTask.value!.id);
                        isDetailOpen.value = false;
                      }
                    }}
                  >
                    Hapus Tugas
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-light grow py-2.5 rounded-pill fw-bold" 
                    onClick={() => {
                      isDetailOpen.value = false;
                      const schedule = routineSchedules.value.find((s: any) => s.title === selectedTask.value!.title && s.cageCode === selectedTask.value!.cageCode);
                      if (schedule) {
                        openEdit(schedule);
                      } else {
                        isEditing.value = true;
                        Object.assign(form, {
                          id: selectedTask.value!.id,
                          title: selectedTask.value!.title,
                          description: selectedTask.value!.description || '',
                          category: selectedTask.value!.category as any,
                          cageCode: selectedTask.value!.cageCode,
                          assigneeCode: selectedTask.value!.assigneeCode,
                          frequency: 'sekali',
                          startDate: new Date().toISOString().split('T')[0],
                          time: selectedTask.value!.dueTime || '08:00',
                          daysOfWeek: [],
                          dayOfMonth: 1,
                          priority: selectedTask.value!.priority,
                          active: true,
                        });
                        isModalOpen.value = true;
                      }
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Schedule Modal */}
        {isModalOpen.value && (
          <div class="peternakan-modal-overlay" onClick={() => (isModalOpen.value = false)}>
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div class="peternakan-modal-header">
                <button class="peternakan-modal-close" onClick={() => (isModalOpen.value = false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <div class="peternakan-modal-title">
                  {isEditing.value ? 'Edit Jadwal Rutin' : 'Tambah Jadwal Rutin'}
                </div>
              </div>
              <div class="peternakan-modal-body mt-4">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="pencatatan-label">Jenis Pencatatan / Kegiatan <span class="text-danger">*</span></label>
                    <Select
                      options={categories.value}
                      modelValue={categories.value[categoryValues.value.indexOf(form.category)] || categories.value[0]}
                      onUpdate:modelValue={(val: string) => {
                        const idx = categories.value.indexOf(val);
                        form.category = categoryValues.value[idx];
                        form.title = val;
                        form.rincian = currentRincianOptions.value[0] || '';
                      }}
                      theme={props.type}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Rincian Pencatatan <span class="text-danger">*</span></label>
                    <Select
                      options={currentRincianOptions.value}
                      modelValue={form.rincian}
                      onUpdate:modelValue={(val: string) => {
                        form.rincian = val;
                      }}
                      theme={props.type}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Deskripsi <span class="text-muted fw-normal">(Opsional)</span></label>
                    <textarea
                      class="form-control pencatatan-textarea"
                      value={form.description}
                      onInput={(e: any) => { form.description = e.target.value; }}
                      placeholder="Masukkan deskripsi tugas"
                      rows={2}
                    />
                  </div>

                  <div class="col-12">
                    <label class="pencatatan-label">Kode {props.type === 'peternakan' ? 'Kandang' : 'Lahan'} <span class="text-danger">*</span></label>
                    <Select
                      options={locationOptions.value.map((opt: any) => ({ value: opt.value, label: opt.label }))}
                      modelValue={form.cageCode}
                      onUpdate:modelValue={(val: string) => {
                        form.cageCode = val;
                      }}
                      theme={props.type}
                    />
                  </div>

                  <div class="col-12">
                    <label class="pencatatan-label">Tanggal <span class="text-danger">*</span></label>
                    <input
                      type="date"
                      class="form-control pencatatan-input"
                      value={form.startDate}
                      onInput={(e: any) => { form.startDate = e.target.value; }}
                    />
                  </div>

                  <div class="col-12">
                    <label class="pencatatan-label">Jam Pelaksanaan (WIB) <span class="text-danger">*</span></label>
                    <input
                      type="time"
                      class="form-control pencatatan-input"
                      value={form.time}
                      onInput={(e: any) => { form.time = e.target.value; }}
                      style={{ height: '38px', cursor: 'pointer' }}
                    />
                  </div>

                  <div class="col-12">
                    <label class="pencatatan-label">Jam Tenggat (WIB) <span class="text-danger">*</span></label>
                    <input
                      type="time"
                      class="form-control pencatatan-input"
                      value={(form as any).endTime || '12:00'}
                      onInput={(e: any) => { (form as any).endTime = e.target.value; }}
                      style={{ height: '38px', cursor: 'pointer' }}
                    />
                  </div>

                  <div class="col-12">
                    <label class="pencatatan-label">Frekuensi <span class="text-danger">*</span></label>
                    <Select
                      options={['Sekali', 'Harian', 'Mingguan', 'Bulanan']}
                      modelValue={frequencyLabel(form.frequency)}
                      onUpdate:modelValue={(val: string) => {
                        if (val === 'Sekali') form.frequency = 'sekali';
                        else if (val === 'Harian') form.frequency = 'harian';
                        else if (val === 'Mingguan') form.frequency = 'mingguan';
                        else form.frequency = 'bulanan';
                      }}
                      theme={props.type}
                    />
                  </div>

                  
                  <div class="col-12">
                    <label class="pencatatan-label">Prioritas <span class="text-danger">*</span></label>
                    <Select
                      options={['Rendah', 'Sedang', 'Tinggi']}
                      modelValue={form.priority === 'rendah' ? 'Rendah' : form.priority === 'tinggi' ? 'Tinggi' : 'Sedang'}
                      onUpdate:modelValue={(val: string) => {
                        if (val === 'Rendah') form.priority = 'rendah';
                        else if (val === 'Tinggi') form.priority = 'tinggi';
                        else form.priority = 'sedang';
                      }}
                      theme={props.type}
                    />
                  </div>

                  {form.frequency === 'mingguan' && (
                    <div class="col-12">
                      <label class="pencatatan-label">Hari dalam Seminggu</label>
                      <div class="d-flex gap-2 flex-wrap">
                        {dayLabels.map((label, idx) => (
                          <button
                            type="button"
                            key={idx}
                            class={[
                              'btn btn-sm rounded-pill px-3 py-1 fw-bold',
                              form.daysOfWeek.includes(idx) ? 'btn-primary' : 'btn-outline-secondary',
                            ]}
                            onClick={() => toggleDay(idx)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {form.frequency === 'bulanan' && (
                    <div class="col-md-6">
                      <label class="pencatatan-label">Tanggal (1-28)</label>
                      <input
                        type="number"
                        min="1"
                        max="28"
                        class="form-control pencatatan-input"
                        value={form.dayOfMonth}
                        onInput={(e: any) => {
                          form.dayOfMonth = Math.min(28, Math.max(1, Number(e.target.value) || 1));
                        }}
                      />
                    </div>
                  )}
                  <div class="col-12 mt-2">
                    <label class="d-flex align-items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => {
                          form.active = (e.target as HTMLInputElement).checked;
                        }}
                      />
                      <span class="fw-bold text-dark">Jadwal aktif</span>
                    </label>
                  </div>

                </div>
                <div class="d-flex gap-3 mt-4 pt-3 border-top">
                  <button 
                    type="button" 
                    class="btn flex-grow-1"
                    style={{ borderRadius: '1rem', fontWeight: 700, color: '#606C38', borderColor: '#606C38', backgroundColor: 'transparent' }}
                    onClick={() => (isModalOpen.value = false)}
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    class="btn flex-grow-1"
                    style={{ borderRadius: '1rem', fontWeight: 700, backgroundColor: '#606C38', color: 'white', border: 'none' }}
                    onClick={saveSchedule}
                  >
                    Simpan Tugas
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
});
