import { defineComponent, ref, reactive, computed } from 'vue';
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
  type RoutineSchedule,
  type PencatatanCategory,
  type ScheduleFrequency,
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

    const toggleDay = (day: number) => {
      if (form.daysOfWeek.includes(day)) {
        form.daysOfWeek = form.daysOfWeek.filter((d) => d !== day);
      } else {
        form.daysOfWeek = [...form.daysOfWeek, day].sort();
      }
    };

    const saveSchedule = () => {
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
        addRoutineSchedule(payload);
      }
      isModalOpen.value = false;
    };

    const activeCount = computed(() => routineSchedules.value.filter((s) => s.active).length);

    return () => (
      <div class="routine-schedule animate-fade-in-up">
        <div class="view-header">
          <div>
            <Typography variant="h2" class="view-title">
              Jadwal Rutin Operator
            </Typography>
            <Typography variant="span" color="secondary">
              {activeCount.value} jadwal aktif · Generate tugas otomatis sesuai frekuensi
            </Typography>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => generateTasksFromSchedules()}>
              Generate Tugas Hari Ini
            </Button>
            <Button variant="solid" onClick={openAdd}>
              + Jadwal Baru
            </Button>
          </div>
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

        {isModalOpen.value && (
          <div class="peternakan-modal-overlay" onClick={() => (isModalOpen.value = false)}>
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div class="peternakan-modal-header">
                <div class="peternakan-modal-title">
                  {isEditing.value ? 'Edit Jadwal Rutin' : 'Jadwal Rutin Baru'}
                </div>
              </div>
              <div class="peternakan-modal-body">
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
                      modelValue={`${operators.find((o) => o.code === form.assigneeCode)?.name} (${form.assigneeCode})`}
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
                              'btn btn-sm rounded-pill',
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
                  <div class="col-12">
                    <label class="d-flex align-items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => {
                          form.active = (e.target as HTMLInputElement).checked;
                        }}
                      />
                      <span class="fw-bold">Jadwal aktif</span>
                    </label>
                  </div>
                </div>
                <div class="d-flex gap-3 mt-4 pt-2 border-top">
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
  },
});
