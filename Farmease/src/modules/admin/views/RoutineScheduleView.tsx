import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import Typography from '@/shared/ui/admin/Typography';
import Button from '@/shared/ui/admin/Button';
import Select from '@/shared/ui/admin/Select';
import CustomInput from '@/shared/ui/admin/Input';
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

const categories = ['Pakan', 'Kesehatan', 'Kotoran', 'Perkawinan', 'Kelahiran', 'Umum'];
const categoryValues: PencatatanCategory[] = ['pakan', 'kesehatan', 'kotoran', 'perkawinan', 'kelahiran', 'umum'];

const operators = [
  { code: 'OPT001', name: 'Budi Ternak' },
  { code: 'OPT002', name: 'Siti Aminah' },
];

const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default defineComponent({
  name: 'RoutineScheduleView',
  setup() {
    const isModalOpen = ref(false);
    const isEditing = ref(false);
    const isDetailOpen = ref(false);
    const selectedTask = ref<OperatorTask | null>(null);

    const sessionFilter = ref('Semua Sesi');
    const statusFilter = ref('Semua Status');

    const form = reactive({
      id: '',
      title: '',
      description: '',
      category: 'pakan' as PencatatanCategory,
      cageCode: 'A',
      assigneeCode: 'OPT001',
      frequency: 'harian' as ScheduleFrequency,
      time: '08:00',
      daysOfWeek: [1, 2, 3, 4, 5] as number[],
      dayOfMonth: 1,
      active: true,
    });

    onMounted(async () => {
      await fetchTasks();
    });

    const frequencyLabel = (f: ScheduleFrequency) => {
      if (f === 'harian') return 'Harian';
      if (f === 'mingguan') return 'Mingguan';
      return 'Bulanan';
    };

    const openAdd = () => {
      isEditing.value = false;
      form.id = '';
      form.title = '';
      form.description = '';
      form.category = 'pakan';
      form.cageCode = 'A';
      form.assigneeCode = 'OPT001';
      form.frequency = 'harian';
      form.time = '08:00';
      form.daysOfWeek = [1, 2, 3, 4, 5];
      form.dayOfMonth = 1;
      form.active = true;
      isModalOpen.value = true;
    };

    const openEdit = (schedule: RoutineSchedule) => {
      isEditing.value = true;
      Object.assign(form, schedule);
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
      if (!form.title.trim()) return alert('Judul jadwal wajib diisi');
      const assignee = operators.find((o) => o.code === form.assigneeCode);
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        cageCode: form.cageCode,
        assigneeCode: form.assigneeCode,
        assigneeName: assignee?.name || form.assigneeCode,
        frequency: form.frequency,
        time: form.time,
        daysOfWeek: [...form.daysOfWeek],
        dayOfMonth: form.dayOfMonth,
        active: form.active,
      };

      if (isEditing.value) {
        updateRoutineSchedule(form.id, payload);
      } else {
        await addRoutineSchedule(payload);
      }
      isModalOpen.value = false;
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

    // Task Statistics Computed (Requirement b)
    const totalTodayTasks = computed(() => operatorTasks.value.length);
    const completedTasksCount = computed(() => operatorTasks.value.filter(t => t.status === 'selesai').length);
    const pendingTasksCount = computed(() => operatorTasks.value.filter(t => t.status === 'belum' || t.status === 'proses').length);
    const lateTasksCount = computed(() => operatorTasks.value.filter(t => t.status === 'terlambat').length);

    // Filtering computed
    const filteredTasks = computed(() => {
      return operatorTasks.value.filter(t => {
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

    const activeCount = computed(() => routineSchedules.value.filter((s) => s.active).length);

    return () => (
      <div class="routine-schedule animate-fade-in-up">
        {/* Header Section */}
        <div class="view-header align-items-center mb-4">
          <div>
            <Typography variant="h2" class="view-title">
              Jadwal Rutin Perkebunan
            </Typography>
            <Typography variant="span" color="secondary">
              {activeCount.value} jadwal aktif · Kelola jadwal rutin dan tinjau pembagian tugas harian operator
            </Typography>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => generateTasksFromSchedules()}>
              Generate Tugas Hari Ini
            </Button>
            <Button 
              variant="solid" 
              onClick={openAdd}
              style={{ backgroundColor: '#30360E', color: '#ffffff', borderColor: '#30360E' }}
            >
              + Tambah Jadwal Rutin
            </Button>
          </div>
        </div>

        {/* Ringkasan Informasi Cards (Requirement b) */}
        <div class="row g-3 mb-4">
          <div class="col-12 col-sm-6 col-md-3">
            <div class="dark-summary-card">
              <span class="card-label">Total tugas hari ini</span>
              <span class="card-value text-white">{totalTodayTasks.value}</span>
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

        {/* Filter Dropdowns Section (Requirement d & e) */}
        <div class="admin-filter-bar mb-4 row g-3">
          <div class="col-6 col-md-3">
            <label class="pencatatan-label d-block mb-1">Semua Sesi</label>
            <Select
              options={['Semua Sesi', 'Pagi', 'Siang', 'Sore']}
              modelValue={sessionFilter.value}
              onUpdate:modelValue={(val: string) => {
                sessionFilter.value = val;
              }}
            />
          </div>
          <div class="col-6 col-md-3">
            <label class="pencatatan-label d-block mb-1">Semua Status</label>
            <Select
              options={['Semua Status', 'Belum Dikerjakan', 'Selesai', 'Terlambat']}
              modelValue={statusFilter.value}
              onUpdate:modelValue={(val: string) => {
                statusFilter.value = val;
              }}
            />
          </div>
        </div>

        {/* Dynamic grouped task cards (Requirement f & g) */}
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
                  {tasksInSession.map(task => (
                    <div class="col-12 col-md-6 col-lg-4" key={task.id}>
                      <div class="task-session-card bg-white border rounded-5 p-4 shadow-sm h-100 d-flex flex-column justify-content-between">
                        <div>
                          {/* Header: Sesi & Waktu & Status */}
                          <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                            <span class="badge bg-light text-dark border fw-bold">
                              ⏱️ {task.dueTime || '08:00'} WIB
                            </span>
                            <span class={['status-badge text-capitalize', statusClass(task.status)]}>
                              {statusLabel(task.status)}
                            </span>
                          </div>

                          {/* Task details */}
                          <Typography variant="h4" size="text-md" weight="extrabold" className="mb-2 text-dark">
                            {task.title}
                          </Typography>
                          <Typography variant="p" size="text-xs" color="secondary" className="mb-3 d-block text-truncate-2">
                            {task.description}
                          </Typography>

                          {/* Operator metadata */}
                          <div class="pt-3 border-top task-details-list small">
                            <div class="d-flex justify-content-between mb-1">
                              <span class="text-muted">Jenis Tugas:</span>
                              <span class="fw-bold text-dark text-capitalize">{task.category}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-1">
                              <span class="text-muted">Kode Operator:</span>
                              <span class="fw-bold text-dark">{task.assigneeCode}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-1">
                              <span class="text-muted">Nama Operator:</span>
                              <span class="fw-bold text-dark">{task.assigneeName}</span>
                            </div>
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
                  ))}
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

        {/* Existing Schedules Management List at Bottom */}
        <div class="mt-5 border-top pt-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <Typography variant="h3" size="text-lg" weight="extrabold" className="m-0 text-dark">
              Daftar Aturan Jadwal Rutin
            </Typography>
            <span class="badge bg-light text-dark border">{routineSchedules.value.length} Aturan</span>
          </div>
          <div class="admin-user-grid">
            {routineSchedules.value.map((schedule) => (
              <div key={schedule.id} class="admin-user-card">
                <div class="card-header">
                  <div class="user-avatar-box">
                    <img src="/icon/catat_jenis.png" alt="" style={{ width: '24px', height: '24px' }} />
                  </div>
                  <span class={['user-role-tag', schedule.active ? 'operator-peternakan' : 'admin']}>
                    {schedule.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div class="user-info">
                  <span class="user-name">{schedule.title}</span>
                  <span class="user-code-badge">
                    {frequencyLabel(schedule.frequency as ScheduleFrequency)} · {schedule.time} · Kandang {schedule.cageCode}
                  </span>
                </div>
                <Typography variant="p" color="secondary" class="small mb-3">
                  {schedule.description}
                </Typography>
                <div class="mb-3">
                  <span class="role-badge operator-peternakan me-1">{schedule.category}</span>
                  <span class="small text-muted">
                    {schedule.assigneeName} ({schedule.assigneeCode})
                  </span>
                </div>
                {schedule.frequency === 'mingguan' && (
                  <div class="d-flex gap-1 flex-wrap mb-3">
                    {dayLabels.map((label, idx) => (
                      <span
                        key={idx}
                        class={[
                          'badge rounded-pill',
                          schedule.daysOfWeek.includes(idx) ? 'bg-primary text-white' : 'bg-light text-muted',
                        ]}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                <div class="card-actions-row">
                  <button type="button" class="card-action-btn edit" onClick={() => openEdit(schedule)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    class="card-action-btn delete"
                    onClick={() => {
                      if (confirm('Hapus jadwal rutin ini?')) deleteRoutineSchedule(schedule.id);
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                    <img src="/icon/notification-active.png" alt="" style={{ width: '32px', height: '32px', filter: 'sepia(1)' }} />
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
                      <span class="text-muted d-block small">Sesi:</span>
                      <span class="fw-semibold text-dark">{getSessionFromTime(selectedTask.value.dueTime)} ({selectedTask.value.dueTime})</span>
                    </div>
                    <div class="col-6">
                      <span class="text-muted d-block small">Kandang:</span>
                      <span class="fw-semibold text-dark">Kandang {selectedTask.value.cageCode}</span>
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
                    <div class="avatar-circle" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                      {selectedTask.value.assigneeName.charAt(0).toUpperCase()}
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
                    onClick={() => (isDetailOpen.value = false)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Existing Create/Edit Schedule Modal */}
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
                  {isEditing.value ? 'Edit Jadwal Rutin' : 'Jadwal Rutin Baru'}
                </div>
              </div>
              <div class="peternakan-modal-body mt-4">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="pencatatan-label">Judul Jadwal</label>
                    <CustomInput
                      modelValue={form.title}
                      onUpdate:modelValue={(v: string) => {
                        form.title = v;
                      }}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Deskripsi</label>
                    <CustomInput
                      modelValue={form.description}
                      onUpdate:modelValue={(v: string) => {
                        form.description = v;
                      }}
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="pencatatan-label">Frekuensi</label>
                    <Select
                      options={['Harian', 'Mingguan', 'Bulanan']}
                      modelValue={frequencyLabel(form.frequency)}
                      onUpdate:modelValue={(val: string) => {
                        if (val === 'Harian') form.frequency = 'harian';
                        else if (val === 'Mingguan') form.frequency = 'mingguan';
                        else form.frequency = 'bulanan';
                      }}
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="pencatatan-label">Jam Pelaksanaan</label>
                    <CustomInput
                      modelValue={form.time}
                      placeholder="08:00"
                      onUpdate:modelValue={(v: string) => {
                        form.time = v;
                      }}
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="pencatatan-label">Jenis</label>
                    <Select
                      options={categories}
                      modelValue={categories[categoryValues.indexOf(form.category)] || 'Pakan'}
                      onUpdate:modelValue={(val: string) => {
                        const idx = categories.indexOf(val);
                        if (idx >= 0 && categoryValues[idx]) form.category = categoryValues[idx];
                      }}
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="pencatatan-label">Kandang</label>
                    <Select
                      options={['A', 'B', 'C']}
                      modelValue={form.cageCode}
                      onUpdate:modelValue={(v: string) => {
                        form.cageCode = v;
                      }}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Operator</label>
                    <Select
                      options={operators.map((o) => `${o.name} (${o.code})`)}
                      modelValue={`${operators.find((o) => o.code === form.assigneeCode)?.name || ''} (${form.assigneeCode})`}
                      onUpdate:modelValue={(val: string) => {
                        const op = operators.find((o) => val.includes(o.code));
                        if (op) form.assigneeCode = op.code;
                      }}
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
                      <CustomInput
                        modelValue={String(form.dayOfMonth)}
                        onUpdate:modelValue={(v: string) => {
                          form.dayOfMonth = Math.min(28, Math.max(1, Number(v) || 1));
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
                  <Button variant="outline" class="grow" onClick={() => (isModalOpen.value = false)}>
                    Batal
                  </Button>
                  <Button variant="solid" class="grow" onClick={saveSchedule}>
                    Simpan Jadwal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
});
