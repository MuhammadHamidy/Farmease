import { defineComponent, ref, reactive, computed } from 'vue';
import Typography from '@/shared/ui/admin/Typography';
import Button from '@/shared/ui/admin/Button';
import Select from '@/shared/ui/admin/Select';
import CustomInput from '@/shared/ui/admin/Input';
import {
  operatorTasks,
  addOperatorTask,
  updateOperatorTask,
  deleteOperatorTask,
  generateTasksFromSchedules,
  type OperatorTask,
  type PencatatanCategory,
  type TaskPriority,
  type TaskStatus,
} from '@/modules/ternak/store/operatorAdmin';

const categories: { value: PencatatanCategory; label: string }[] = [
  { value: 'pakan', label: 'Pakan' },
  { value: 'kesehatan', label: 'Kesehatan' },
  { value: 'kotoran', label: 'Kotoran' },
  { value: 'perkawinan', label: 'Perkawinan' },
  { value: 'kelahiran', label: 'Kelahiran' },
  { value: 'umum', label: 'Umum' },
];

const operators = [
  { code: 'OPT001', name: 'Budi Ternak' },
  { code: 'OPT002', name: 'Siti Aminah' },
];

export default defineComponent({
  name: 'OperatorTaskManagementView',
  setup() {
    const searchQuery = ref('');
    const statusFilter = ref('Semua Status');
    const isModalOpen = ref(false);
    const isEditing = ref(false);

    const form = reactive({
      id: '',
      title: '',
      description: '',
      assigneeCode: 'OPT001',
      cageCode: 'A',
      category: 'pakan' as PencatatanCategory,
      dueDate: new Date().toISOString().split('T')[0] as string,
      dueTime: '08:00',
      priority: 'sedang' as TaskPriority,
      status: 'belum' as TaskStatus,
    });

    const statusOptions = ['Semua Status', 'belum', 'proses', 'selesai', 'terlambat'];

    const filteredTasks = computed(() =>
      operatorTasks.value.filter((t) => {
        const q = searchQuery.value.toLowerCase();
        const matchSearch =
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.assigneeName.toLowerCase().includes(q) ||
          t.cageCode.toLowerCase().includes(q);
        const matchStatus = statusFilter.value === 'Semua Status' || t.status === statusFilter.value;
        return matchSearch && matchStatus;
      }),
    );

    const resetForm = () => {
      form.id = '';
      form.title = '';
      form.description = '';
      form.assigneeCode = 'OPT001';
      form.cageCode = 'A';
      form.category = 'pakan';
      form.dueDate = new Date().toISOString().split('T')[0] ?? '';
      form.dueTime = '08:00';
      form.priority = 'sedang';
      form.status = 'belum';
    };

    const openAdd = () => {
      isEditing.value = false;
      resetForm();
      isModalOpen.value = true;
    };

    const openEdit = (task: OperatorTask) => {
      isEditing.value = true;
      Object.assign(form, task);
      isModalOpen.value = true;
    };

    const saveTask = () => {
      if (!form.title.trim()) return alert('Judul tugas wajib diisi');
      const assignee = operators.find((o) => o.code === form.assigneeCode);
      const payload = {
        title: form.title,
        description: form.description,
        assigneeCode: form.assigneeCode,
        assigneeName: assignee?.name || form.assigneeCode,
        cageCode: form.cageCode,
        category: form.category,
        dueDate: form.dueDate,
        dueTime: form.dueTime,
        priority: form.priority,
        status: form.status,
      };

      if (isEditing.value) {
        updateOperatorTask(form.id, payload);
      } else {
        addOperatorTask(payload);
      }
      isModalOpen.value = false;
    };

    const statusClass = (status: string) => {
      if (status === 'selesai') return 'selesai';
      if (status === 'terlambat') return 'terlambat';
      if (status === 'proses') return 'proses';
      return 'belum';
    };

    return () => (
      <div class="operator-tasks animate-fade-in-up">
        <div class="view-header">
          <div>
            <Typography variant="h2" class="view-title">
              Manajemen Tugas Operator
            </Typography>
            <Typography variant="span" color="secondary">
              Tetapkan dan pantau tugas harian operator peternakan
            </Typography>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => generateTasksFromSchedules()}>
              Generate dari Jadwal
            </Button>
            <Button variant="solid" onClick={openAdd}>
              + Tugas Baru
            </Button>
          </div>
        </div>

        <div class="admin-filter-bar">
          <div class="admin-search-wrapper">
            <input
              type="text"
              class="admin-search-input"
              placeholder="Cari judul, operator, atau kandang..."
              value={searchQuery.value}
              onInput={(e) => {
                searchQuery.value = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
          <div class="admin-role-filter">
            <Select
              options={statusOptions}
              modelValue={statusFilter.value}
              onUpdate:modelValue={(val: string) => {
                statusFilter.value = val;
              }}
            />
          </div>
        </div>

        <div class="view-card">
          <table class="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tugas</th>
                <th>Operator</th>
                <th>Kandang</th>
                <th>Jenis</th>
                <th>Deadline</th>
                <th>Prioritas</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.value.length === 0 ? (
                <tr>
                  <td colspan={9} class="text-center py-4 text-muted">
                    Tidak ada tugas ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTasks.value.map((task, index) => (
                  <tr key={task.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div class="fw-bold">{task.title}</div>
                      <div class="small text-muted">{task.description}</div>
                      {task.scheduleId && (
                        <span class="badge bg-light text-dark border mt-1">Dari jadwal rutin</span>
                      )}
                    </td>
                    <td>
                      <div class="fw-bold">{task.assigneeName}</div>
                      <div class="small text-muted">{task.assigneeCode}</div>
                    </td>
                    <td>Kandang {task.cageCode}</td>
                    <td>
                      <span class="role-badge operator-peternakan">{task.category}</span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {task.dueDate}
                      <br />
                      <span class="small text-muted">{task.dueTime}</span>
                    </td>
                    <td class="text-capitalize">{task.priority}</td>
                    <td>
                      <span class={['status-badge', statusClass(task.status)]}>{task.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div class="table-action-group">
                        <button type="button" class="card-action-btn edit" onClick={() => openEdit(task)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          class="card-action-btn delete"
                          onClick={() => {
                            if (confirm('Hapus tugas ini?')) deleteOperatorTask(task.id);
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen.value && (
          <div class="peternakan-modal-overlay" onClick={() => (isModalOpen.value = false)}>
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div class="peternakan-modal-header">
                <div class="peternakan-modal-title">
                  {isEditing.value ? 'Edit Tugas Operator' : 'Tugas Operator Baru'}
                </div>
              </div>
              <div class="peternakan-modal-body">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="pencatatan-label">Judul Tugas</label>
                    <CustomInput
                      modelValue={form.title}
                      placeholder="Contoh: Pakan pagi Kandang A"
                      onUpdate:modelValue={(v: string) => {
                        form.title = v;
                      }}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Deskripsi</label>
                    <CustomInput
                      modelValue={form.description}
                      placeholder="Instruksi detail untuk operator"
                      onUpdate:modelValue={(v: string) => {
                        form.description = v;
                      }}
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="pencatatan-label">Operator</label>
                    <Select
                      options={operators.map((o) => `${o.name} (${o.code})`)}
                      modelValue={operators.find((o) => o.code === form.assigneeCode)?.name + ` (${form.assigneeCode})` || ''}
                      onUpdate:modelValue={(val: string) => {
                        const op = operators.find((o) => val.includes(o.code));
                        if (op) form.assigneeCode = op.code;
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
                  <div class="col-md-6">
                    <label class="pencatatan-label">Jenis Pencatatan</label>
                    <Select
                      options={categories.map((c) => c.label)}
                      modelValue={categories.find((c) => c.value === form.category)?.label || ''}
                      onUpdate:modelValue={(val: string) => {
                        const cat = categories.find((c) => c.label === val);
                        if (cat) form.category = cat.value;
                      }}
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="pencatatan-label">Prioritas</label>
                    <Select
                      options={['rendah', 'sedang', 'tinggi']}
                      modelValue={form.priority}
                      onUpdate:modelValue={(v: string) => {
                        form.priority = v as TaskPriority;
                      }}
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="pencatatan-label">Tanggal</label>
                    <CustomInput
                      type="date"
                      modelValue={form.dueDate}
                      onUpdate:modelValue={(v: string) => {
                        form.dueDate = v;
                      }}
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="pencatatan-label">Jam</label>
                    <CustomInput
                      modelValue={form.dueTime}
                      placeholder="08:00"
                      onUpdate:modelValue={(v: string) => {
                        form.dueTime = v;
                      }}
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="pencatatan-label">Status</label>
                    <Select
                      options={['belum', 'proses', 'selesai', 'terlambat']}
                      modelValue={form.status}
                      onUpdate:modelValue={(v: string) => {
                        form.status = v as TaskStatus;
                      }}
                    />
                  </div>
                </div>
                <div class="d-flex gap-3 mt-4 pt-2 border-top">
                  <Button variant="outline" class="grow" onClick={() => (isModalOpen.value = false)}>
                    Batal
                  </Button>
                  <Button variant="solid" class="grow" onClick={saveTask}>
                    Simpan
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
