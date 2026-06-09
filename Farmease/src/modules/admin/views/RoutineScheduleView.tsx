import { defineComponent, ref, reactive, computed, onMounted, watch, Teleport } from 'vue';
import type { PropType } from 'vue';
import Typography from '@/shared/ui/admin/Typography';
import Button from '@/shared/ui/admin/Button';
import Select from '@/shared/ui/admin/Select';
import CustomInput from '@/shared/ui/admin/Input';
import RoutineScheduleCard from '../components/routine/RoutineScheduleCard';
import RoutineScheduleDetailModal from '../components/routine/RoutineScheduleDetailModal';
import RoutineScheduleFormModal from '../components/routine/RoutineScheduleFormModal';
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
  { code: 'OP001', name: 'Operator Ternak' },
  { code: 'OP002', name: 'Operator Kebun' },
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
        if (landsList.value.length === 0) return [{ value: 'L001', label: 'L001' }, { value: 'L002', label: 'L002' }, { value: 'L003', label: 'L003' }];
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
      cageCode: props.type === 'peternakan' ? 'A' : 'L001',
      assigneeCode: props.type === 'peternakan' ? 'OP001' : 'OP002',
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
      if (cageCode === 'L001' || cageCode === 'A') return 'Alpukat';
      if (cageCode === 'L0002' || cageCode === 'B') return 'Kelengkeng';
      if (cageCode === 'L0003' || cageCode === 'C') return 'Alpukat';
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
        if (task.cageCode === 'A' || task.cageCode === 'L001') return 'Panen';
        if (task.cageCode === 'B' || task.cageCode === 'L0002') return 'Pemangkasan';
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
      const initialCategory = (props.type === 'peternakan' ? 'pakan' : 'penyiraman') as any;
      const initialRincian = currentRincianOptions.value[0] || '';
      
      form.id = '';
      form.category = initialCategory;
      form.rincian = initialRincian;
      form.title = `${initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1)} - ${initialRincian}`;
      form.description = '';
      form.cageCode = props.type === 'peternakan' ? 'A' : 'L001';
      form.assigneeCode = props.type === 'peternakan' ? 'OP001' : 'OP002';
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
      if (!form.title.trim()) {
        form.title = `${form.category.charAt(0).toUpperCase() + form.category.slice(1)} - ${form.rincian || 'Rutin'}`;
      }
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
      const targetAssignee = props.type === 'peternakan' ? 'OP001' : 'OP002';
      return routineSchedules.value.filter((s) => s.assigneeCode === targetAssignee);
    });

    const filteredTasks = computed(() => {
      const targetAssignee = props.type === 'peternakan' ? 'OP001' : 'OP002';
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
            <div class="bg-white rounded-4 p-3" style={{ border: '1px solid #E6D9CE' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#2C3E50', marginBottom: '0.5rem' }}>Total tugas hari ini</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#000', marginBottom: '0.5rem' }}>{totalTodayTasks.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#6C757D' }}>rutin + insidental</div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="bg-white rounded-4 p-3" style={{ border: '1px solid var(--color-outline-variant)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#2C3E50', marginBottom: '0.5rem' }}>Selesai</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-success-dark, #198754)', marginBottom: '0.5rem' }}>{completedTasksCount.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#6C757D' }}>dari {totalTodayTasks.value} tugas</div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="bg-white rounded-4 p-3" style={{ border: '1px solid var(--color-outline-variant)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#2C3E50', marginBottom: '0.5rem' }}>Belum dikerjakan</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-warning, #f59e0b)', marginBottom: '0.5rem' }}>{pendingTasksCount.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#6C757D' }}>perlu perhatian</div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="bg-white rounded-4 p-3" style={{ border: '1px solid var(--color-outline-variant)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#2C3E50', marginBottom: '0.5rem' }}>Terlambat</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-danger, #dc3545)', marginBottom: '0.5rem' }}>{lateTasksCount.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#6C757D' }}>deadline terlewat</div>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns Section */}
        <div class="admin-filter-bar mb-4 rounded-4 p-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-outline-variant)' }}>
          <div class="row g-3 w-100 m-0">
            <div class="col-12 col-md-4">
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2C3E50', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Tanggal</label>
              <input
                type="date"
                class="form-control bg-white"
                style={{ height: '42px', border: '1px solid #E6D9CE', borderRadius: '8px' }}
                value={dateFilter.value}
                onInput={(e: any) => { dateFilter.value = e.target.value; }}
              />
            </div>
            <div class="col-12 col-md-4">
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2C3E50', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Semua Sesi</label>
              <Select
                options={['Semua Sesi', 'Pagi', 'Siang', 'Sore']}
                modelValue={sessionFilter.value}
                onUpdate:modelValue={(val: string) => {
                  sessionFilter.value = val;
                }}
                theme={props.type}
              />
            </div>
            <div class="col-12 col-md-4">
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2C3E50', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Semua Status</label>
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
        </div>

        {/* Dynamic grouped task cards */}
        <div class="sessions-container">
          {(['Pagi', 'Siang', 'Sore'] as const).map(sessionName => {
            const tasksInSession = groupedTasks.value[sessionName];
            if (sessionFilter.value !== 'Semua Sesi' && sessionFilter.value !== sessionName) return null;
            if (tasksInSession.length === 0) return null;

            return (
              <div class="session-section mb-4" key={sessionName}>
                <div class="d-flex align-items-center gap-2 mb-3 mt-4">
                  <span style={{ fontSize: '1.2rem' }}>
                    {sessionName === 'Pagi' ? '☀️' : sessionName === 'Siang' ? '🌤️' : '🌙'}
                  </span>
                  <Typography variant="h3" size="text-md" weight="extrabold" className="m-0 text-dark text-uppercase">
                    Sesi {sessionName}
                  </Typography>
                  <span class="badge rounded-pill ms-1" style={{ backgroundColor: '#6C757D', fontSize: '0.7rem', padding: '0.35rem 0.65rem' }}>
                    {tasksInSession.length} Tugas
                  </span>
                </div>
                <hr style={{ borderColor: '#2C3E50', opacity: 0.6, margin: '0 0 1.25rem 0' }} />
                <div class="row g-3">
                  {tasksInSession.map(task => (
                    <RoutineScheduleCard
                      key={task.id}
                      task={task}
                      type={props.type}
                      landName={getLandName(task.cageCode)}
                      jenisPencatatan={getJenisPencatatan(task)}
                      frequency={getTaskFrequency(task)}
                      statusLabel={statusLabel}
                      onOpen-detail={openDetail}
                    />
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

        {/* Task Detail Modal */}
        <RoutineScheduleDetailModal
          isOpen={isDetailOpen.value}
          task={selectedTask.value}
          type={props.type}
          statusLabel={statusLabel}
          statusClass={statusClass}
          getSessionFromTime={getSessionFromTime}
          onClose={() => isDetailOpen.value = false}
          onEdit={(task) => {
            isDetailOpen.value = false;
            const schedule = routineSchedules.value.find((s: any) => s.title === task.title && s.cageCode === task.cageCode);
            if (schedule) {
              openEdit(schedule);
            } else {
              isEditing.value = true;
              Object.assign(form, {
                id: task.id,
                title: task.title,
                description: task.description || '',
                category: task.category as any,
                cageCode: task.cageCode,
                assigneeCode: task.assigneeCode,
                frequency: 'sekali',
                startDate: new Date().toISOString().split('T')[0],
                time: task.dueTime || '08:00',
                daysOfWeek: [],
                dayOfMonth: 1,
                priority: task.priority,
                active: true,
              });
              isModalOpen.value = true;
            }
          }}
          onDelete={async (task) => {
            if (confirm(`Apakah Anda yakin ingin menghapus tugas "${task.title}"?`)) {
              await deleteOperatorTask(task.id);
              isDetailOpen.value = false;
            }
          }}
        />

        {/* Create/Edit Schedule Modal */}
        <RoutineScheduleFormModal
          isOpen={isModalOpen.value}
          isEditing={isEditing.value}
          form={form}
          type={props.type}
          categories={categories.value}
          categoryValues={categoryValues.value}
          currentRincianOptions={currentRincianOptions.value}
          locationOptions={locationOptions.value}
          frequencyLabel={frequencyLabel}
          onClose={() => isModalOpen.value = false}
          onSave={saveSchedule}
          onUpdateCategory={() => {
            form.rincian = currentRincianOptions.value[0] || '';
          }}
        />
      </div>
    );
  }
});
