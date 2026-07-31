import { defineComponent, ref, computed, type PropType } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';

export const CATEGORY_ICONS: Record<string, string> = {
  pakan: '/icon/catat_pakan.png',
  stok_pakan: '/icon/inventory.png',
  kesehatan: '/icon/sheep_kesehatan.png',
  kotoran: '/icon/catat_kotoran.png',
  perkawinan: '/icon/catat_kawin.png',
  kelahiran: '/icon/catat_lahir.png',
  berat_badan: '/icon/statistic.png',
  weighing: '/icon/statistic.png',
  umum: '/icon/catat_jenis.png',
};

export default defineComponent({
  name: 'RoutineTasks',
  props: {
    tasksLoading: { type: Boolean, required: true },
    peternakanTasks: { type: Array as PropType<any[]>, required: true },
    onOpenTaskDetail: { type: Function as PropType<(taskId: string) => void>, required: true },
    taskDone: { type: Number, required: true },
    totalTasks: { type: Number, required: true },
  },
  setup(props) {
    const currentPage = ref(1);
    const itemsPerPage = 4;
    const totalPages = computed(() => Math.ceil(props.peternakanTasks.length / itemsPerPage) || 1);
    const paginatedTasks = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      return props.peternakanTasks.slice(start, start + itemsPerPage);
    });

    return () => (
      <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5 h-100 d-flex flex-column justify-content-between">
        <div>
          <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
            <div class="flex-grow-1" style={{ minWidth: 0 }}>
              <div class="d-flex align-items-center gap-2 mb-1">
                <img src="/icon/rutin_task.png" alt="Task" style={{ width: '22px', height: '22px', objectFit: 'contain', flexShrink: 0 }} />
                <Typography variant="h4" weight="extrabold" className="m-0 text-truncate" style={{ maxWidth: '100%' }}>Tugas Rutin Peternakan</Typography>
              </div>
              <Typography variant="p" size="text-xs" color="secondary" className="m-0">Klik kartu tugas untuk melihat detail dan panduan kerja.</Typography>
            </div>
            <div class="d-flex align-items-center gap-2" style={{ flexShrink: 0 }}>
              <Badge variant="solid-primary" className="px-3 py-1.5 text-nowrap" style={{ fontSize: '0.65rem' }}>Hari Ini</Badge>
              <div class="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-1.5 fw-bold" style={{ fontSize: '0.72rem' }}>
                Tugas Harian: {props.taskDone}/{props.totalTasks} Selesai
              </div>
            </div>
          </div>

          {props.tasksLoading ? (
            <div class="text-center py-4 text-secondary" style={{ fontSize: '0.85rem' }}>Memuat tugas...</div>
          ) : props.peternakanTasks.length === 0 ? (
            <div class="text-center py-4 text-secondary" style={{ fontSize: '0.85rem' }}>Belum ada tugas hari ini</div>
          ) : (
            <div class="d-flex flex-column gap-3">
              {paginatedTasks.value.map(task => (
                <div
                  key={task.id}
                  class="bg-white rounded-4 w-100 text-start shadow-sm"
                  style={{ 
                    border: '1px solid #E6D9CE', 
                    opacity: task.status === 'selesai' ? 0.7 : 1,
                  }}
                >
                  <div class="p-3 pb-2 d-flex align-items-start justify-content-between gap-3">
                    <div class="d-flex align-items-start gap-3">
                      <div class="rounded-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', backgroundColor: '#F4EBE4', border: '1px solid #E6D9CE' }}>
                        <img src={CATEGORY_ICONS[task.category] || '/icon/catat_jenis.png'} alt="Task" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                      </div>
                      <div class="d-flex flex-column gap-1 mt-1">
                        <div class="d-flex align-items-center flex-wrap gap-2">
                          <div style={{
                            backgroundColor: task.priority === 'tinggi' ? '#FADBD8' : task.priority === 'sedang' ? '#FCF3CF' : '#EAECEE',
                            color: task.priority === 'tinggi' ? '#C0392B' : task.priority === 'sedang' ? '#B7950B' : '#5D6D7E',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            width: 'fit-content'
                          }}>
                            Prioritas: <span class="text-capitalize">{task.priority}</span>
                          </div>
                        </div>
                        <Typography variant="p" size="text-md" className="mb-0 text-dark" style={{ lineHeight: '1.3', fontWeight: '500' }}>
                          {task.title || task.rincian || task.description}
                        </Typography>
                        <span style={{ fontSize: '0.7rem', color: '#5D4037', fontWeight: '700', letterSpacing: '0.5px' }} class="text-uppercase mt-1">
                          {task.category === 'weighing' || task.category === 'berat_badan' ? 'Berat Badan' : task.category === 'stok_pakan' ? 'Stok Pakan' : task.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Detail Button */}
                    <div class="d-flex flex-column align-items-end justify-content-start mt-1">
                      {task.status === 'selesai' ? (
                        <Badge variant="success" className="px-3 py-1.5" style={{ fontSize: '0.75rem' }}>
                          ✅ Selesai
                        </Badge>
                      ) : task.status === 'proses' || task.rawStatus === 'menunggu' ? (
                        <Badge variant="primary" className="px-3 py-1.5" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <img src="/icon/wait.png" style={{ width: '14px', height: '14px', objectFit: 'contain' }} alt="" /> Menunggu
                        </Badge>
                      ) : (
                        <button 
                          type="button"
                          class="btn btn-sm rounded-pill px-3 fw-bold" 
                          style={{ fontSize: '0.75rem', color: '#8B5A2B', border: '1px solid #8B5A2B', backgroundColor: 'transparent' }}
                          onClick={() => props.onOpenTaskDetail(task.id)}
                        >
                          Detail
                        </button>
                      )}
                    </div>
                  </div>

                  <hr style={{ margin: '0.5rem 1rem', borderColor: '#E6D9CE', opacity: 0.8 }} />

                  <div class="p-3 pt-2 row g-0">
                    <div class="col-6">
                      <span style={{ fontSize: '0.65rem', color: '#9E9E9E', letterSpacing: '0.5px' }}>WAKTU MULAI</span>
                      <div style={{ fontSize: '1rem', color: '#2C3E50', fontWeight: '400' }}>{task.dueTime ? `${task.dueTime} WIB` : '-'}</div>
                    </div>
                    <div class="col-6">
                      <span style={{ fontSize: '0.65rem', color: '#9E9E9E', letterSpacing: '0.5px' }}>WAKTU TENGGAT</span>
                      <div style={{ fontSize: '1rem', color: '#C0392B', fontWeight: '400' }}>{task.endTime ? `${task.endTime} WIB` : '-'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages.value > 1 && (
          <div class="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 mt-4 pt-3 border-top">
            <div class="text-secondary small">
              Menampilkan <span class="fw-bold text-dark">{props.peternakanTasks.length > 0 ? (currentPage.value - 1) * itemsPerPage + 1 : 0}</span> - <span class="fw-bold text-dark">{Math.min(currentPage.value * itemsPerPage, props.peternakanTasks.length)}</span> dari <span class="fw-bold text-dark">{props.peternakanTasks.length}</span> tugas
            </div>
            <div class="d-flex align-items-center gap-2">
              <button
                type="button"
                class="btn btn-sm px-3 rounded-pill fw-bold"
                disabled={currentPage.value === 1}
                onClick={() => currentPage.value--}
                style={{
                  cursor: currentPage.value === 1 ? 'not-allowed' : 'pointer',
                  backgroundColor: '#ffffff',
                  color: currentPage.value === 1 ? '#b0a898' : '#3d2f24',
                  borderColor: '#ccc0b4',
                  opacity: currentPage.value === 1 ? 0.6 : 1,
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.85rem'
                }}
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages.value }, (_, i) => i + 1).map((page) => (
                <button
                  type="button"
                  class="btn btn-sm rounded-pill fw-bold"
                  onClick={() => currentPage.value = page}
                  style={{
                    backgroundColor: currentPage.value === page ? '#3d2f24' : '#ffffff',
                    color: currentPage.value === page ? '#ffffff' : '#3d2f24',
                    borderColor: currentPage.value === page ? '#3d2f24' : '#ccc0b4',
                    minWidth: '32px',
                    fontSize: '0.8rem',
                    padding: '0.4rem'
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                class="btn btn-sm px-3 rounded-pill fw-bold"
                disabled={currentPage.value === totalPages.value}
                onClick={() => currentPage.value++}
                style={{
                  cursor: currentPage.value === totalPages.value ? 'not-allowed' : 'pointer',
                  backgroundColor: '#ffffff',
                  color: currentPage.value === totalPages.value ? '#b0a898' : '#3d2f24',
                  borderColor: '#ccc0b4',
                  opacity: currentPage.value === totalPages.value ? 0.6 : 1,
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.85rem'
                }}
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
});
