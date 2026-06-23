import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { cagesList, fetchCagesList } from '@/store/navigation';
import { sheep, fetchSheep } from '@/store/livestock';
import { operatorTasks, fetchTasks, tasksLoading } from '@/store/operatorAdmin';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';

function getTodayStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

export default defineComponent({
  name: 'KandangTugasView',
  setup() {
    const selectedDate = ref(getTodayStr());

    const loadData = async () => {
      await Promise.all([
        fetchCagesList(),
        fetchSheep(),
        fetchTasks(selectedDate.value)
      ]);
    };

    onMounted(loadData);

    watch(selectedDate, async (newVal) => {
      if (newVal) {
        await fetchTasks(newVal);
      }
    });

    const handleTodayShortcut = () => {
      selectedDate.value = getTodayStr();
    };

    // Process cages data and group tasks
    const cageListWithTasks = computed(() => {
      return cagesList.value.map(c => {
        const sheepInCage = sheep.value.filter(s => s.cage_code === c.code);
        const activeInCage = sheepInCage.filter(s => !['Mati', 'Terjual', 'Disembelih'].includes(s.status));
        const count = activeInCage.length;
        const pct = c.capacity > 0 ? Math.round((count / c.capacity) * 100) : 0;

        // Tasks for this cage on the selected date
        const tasks = operatorTasks.value.filter(t => t.cageCode === c.code && t.dueDate === selectedDate.value);
        const doneCount = tasks.filter(t => t.status === 'selesai').length;

        return {
          ...c,
          count,
          pct,
          tasks,
          doneCount
        };
      });
    });

    return () => (
      <div class="animate-fade-in-up">
        {/* Title & Filter */}
        <div class="view-header mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <Typography variant="h2" size="text-2xl" weight="extrabold" className="m-0 text-dark">
              Kandang & Tugas Operator
            </Typography>
            <Typography variant="p" size="text-sm" color="secondary" className="m-0">
              Memantau kapasitas kandang beserta penugasan operator harian secara real-time.
            </Typography>
          </div>

          {/* Date Selector */}
          <div class="d-flex align-items-center gap-2 bg-white border rounded-3 px-3 py-2 shadow-sm">
            <span class="small fw-bold text-muted">Tanggal Tugas:</span>
            <input
              type="date"
              value={selectedDate.value}
              onInput={(e: any) => selectedDate.value = e.target.value}
              class="border-0 bg-transparent fw-bold text-dark"
              style={{ outline: 'none', fontSize: '0.85rem', cursor: 'pointer' }}
            />
            <button
              type="button"
              onClick={handleTodayShortcut}
              class="btn btn-sm btn-light border fw-bold text-dark px-2 py-0.5 rounded-2"
              style={{ fontSize: '0.72rem' }}
            >
              Hari Ini
            </button>
          </div>
        </div>

        {tasksLoading.value && (
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status" style={{ width: '2rem', height: '2rem' }}>
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted small">Memperbarui data tugas...</p>
          </div>
        )}

        {/* Empty state cages */}
        {!tasksLoading.value && cageListWithTasks.value.length === 0 && (
          <div class="view-card text-center py-5 text-muted">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" class="mb-2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <p class="m-0 small">Belum ada data kandang terdaftar.</p>
          </div>
        )}

        {/* Cages List */}
        {!tasksLoading.value && (
          <div class="row g-4">
            {cageListWithTasks.value.map(item => (
              <div key={item.code} class="col-12">
                <div class="view-card mb-3">
                  {/* Cage Header info */}
                  <div class="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-3 gap-3">
                    <div class="d-flex align-items-center gap-3">
                      <div class="d-flex align-items-center justify-content-center bg-light border rounded-3" style={{ width: '40px', height: '40px' }}>
                        <img src="/icon/kandang.png" alt="Kandang" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                      </div>
                      <div>
                        <div class="d-flex align-items-center gap-2">
                          <Typography variant="h4" size="text-md" weight="extrabold" className="m-0 text-dark">
                            Kandang {item.name || item.code}
                          </Typography>
                          <Badge variant="primary">ID: {item.code}</Badge>
                        </div>
                        <span class="text-muted text-capitalize small">Fokus Ternak: {item.type}</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div style={{ minWidth: '220px' }}>
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="small text-muted fw-bold">Utilitas Space</span>
                        <span class="small fw-extrabold text-dark">{item.count} / {item.capacity} Ekor ({item.pct}%)</span>
                      </div>
                      <div class="progress grow" style={{ height: '8px' }}>
                        <div 
                          class={['progress-bar', item.pct >= 90 ? 'bg-danger' : item.pct >= 75 ? 'bg-warning' : 'bg-success']} 
                          style={{ width: `${item.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div>
                    <Typography variant="h5" size="text-sm" weight="extrabold" className="mb-3 text-dark">
                      Daftar Tugas Operator ({item.tasks.length} Tugas, {item.doneCount} Selesai)
                    </Typography>

                    {item.tasks.length === 0 ? (
                      <p class="text-muted text-center py-3 m-0 small">
                        Tidak ada tugas operator terjadwal untuk kandang ini pada tanggal {selectedDate.value}.
                      </p>
                    ) : (
                      <div class="table-responsive">
                        <table class="admin-table">
                          <thead>
                            <tr>
                              <th>Tugas</th>
                              <th>Kategori</th>
                              <th>Waktu Pengisian</th>
                              <th>Prioritas</th>
                              <th>Petugas</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.tasks.map(t => (
                              <tr key={t.id}>
                                <td class="fw-bold text-dark">
                                  {t.title}
                                  {t.description && <div class="text-muted small fw-normal mt-1">{t.description}</div>}
                                </td>
                                <td class="text-capitalize text-muted">
                                  {t.category === 'pakan' && '🌾 Pakan'}
                                  {t.category === 'kesehatan' && '🩺 Kesehatan'}
                                  {t.category === 'kotoran' && '🧹 Sanitasi'}
                                  {t.category === 'perkawinan' && '🧬 Perkawinan'}
                                  {t.category === 'kelahiran' && '🍼 Kelahiran'}
                                  {t.category === 'umum' && '📋 Umum'}
                                  {!['pakan','kesehatan','kotoran','perkawinan','kelahiran','umum'].includes(t.category) && t.category}
                                </td>
                                <td>{t.dueTime}{t.endTime ? ` – ${t.endTime}` : ''}</td>
                                <td>
                                  <Badge variant={t.priority === 'tinggi' ? 'danger' : t.priority === 'sedang' ? 'warning' : 'info'}>
                                    {t.priority}
                                  </Badge>
                                </td>
                                <td>
                                  <div class="fw-bold">{t.assigneeName}</div>
                                  <div class="text-muted small">ID: {t.assigneeCode}</div>
                                </td>
                                <td>
                                  <Badge variant={
                                    t.status === 'selesai' ? 'solid-success' :
                                    t.status === 'proses' ? 'info' :
                                    t.status === 'terlambat' ? 'solid-danger' : 'secondary'
                                  }>
                                    {t.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});
