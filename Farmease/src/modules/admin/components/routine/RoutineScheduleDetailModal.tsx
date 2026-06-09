import { defineComponent, Teleport, type PropType } from 'vue';
import type { OperatorTask } from '@/modules/ternak/store/operatorAdmin';
import Typography from '@/shared/ui/admin/Typography';

export default defineComponent({
  name: 'RoutineScheduleDetailModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    task: {
      type: Object as PropType<OperatorTask | null>,
      default: null
    },
    type: {
      type: String as PropType<'peternakan' | 'perkebunan'>,
      required: true
    },
    statusLabel: {
      type: Function as PropType<(s: string) => string>,
      required: true
    },
    statusClass: {
      type: Function as PropType<(s: string) => string>,
      required: true
    },
    getSessionFromTime: {
      type: Function as PropType<(timeStr: string) => string>,
      required: true
    }
  },
  emits: ['close', 'edit', 'delete'],
  setup(props, { emit }) {
    const getIcon = () => {
      if (props.type === 'peternakan' && props.task) {
        switch (props.task.category) {
          case 'pakan': return '/icon/catat_pakan.png';
          case 'kesehatan': return '/icon/catat_sehat.png';
          case 'kotoran': return '/icon/catat_kotoran.png';
          case 'perkawinan': return '/icon/catat_kawin.png';
          case 'kelahiran': return '/icon/catat_lahir.png';
          default: return '/icon/catat_jenis.png';
        }
      }
      return '/icon/pohon.png';
    };

    return () => {
      if (!props.isOpen || !props.task) return null;

      const task = props.task;

      return (
        <Teleport to="body">
          <div class="peternakan-modal-overlay" onClick={() => emit('close')}>
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div class="peternakan-modal-header">
                <button class="peternakan-modal-close" onClick={() => emit('close')}>
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
                      src={getIcon()} 
                      alt="" 
                      style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
                    />
                  </div>
                  <Typography variant="h3" size="text-lg" weight="extrabold" className="text-dark m-0">
                    {task.title}
                  </Typography>
                  <span class={['status-badge mt-2 d-inline-block', props.statusClass(task.status)]}>
                    {props.statusLabel(task.status)}
                  </span>
                </div>

                <div class="border rounded-5 p-3 bg-light mb-4">
                  <div class="mb-3">
                    <span class="text-muted d-block small">Deskripsi Tugas:</span>
                    <span class="fw-semibold text-dark">{task.description || 'Tidak ada deskripsi.'}</span>
                  </div>
                  <div class="row g-2 pt-2 border-top">
                    <div class="col-6">
                      <span class="text-muted d-block small">Sesi (Mulai):</span>
                      <span class="fw-semibold text-dark">{props.getSessionFromTime(task.dueTime)} ({task.dueTime} WIB)</span>
                    </div>
                    <div class="col-6">
                      <span class="text-muted d-block small">Jam Tenggat:</span>
                      <span class="fw-semibold text-dark">{task.endTime ? `${task.endTime} WIB` : '-'}</span>
                    </div>
                    <div class="col-6">
                      <span class="text-muted d-block small">{props.type === 'peternakan' ? 'Kandang' : 'Lahan'}:</span>
                      <span class="fw-semibold text-dark">{props.type === 'peternakan' ? 'Kandang' : 'Lahan'} {task.cageCode}</span>
                    </div>
                    <div class="col-6">
                      <span class="text-muted d-block small">Jenis Tugas:</span>
                      <span class="fw-semibold text-dark text-capitalize">{task.category}</span>
                    </div>
                    <div class="col-6">
                      <span class="text-muted d-block small">Prioritas:</span>
                      <span class="fw-semibold text-dark text-capitalize">{task.priority}</span>
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
                      <span class="d-block fw-bold text-dark">{task.assigneeName}</span>
                      <span class="text-muted small">{task.assigneeCode}</span>
                    </div>
                  </div>
                </div>

                <div class="d-flex gap-3 mt-4 pt-3 border-top">
                  <button 
                    type="button"
                    class="btn btn-outline-danger grow py-2.5 rounded-pill fw-bold"
                    onClick={() => emit('delete', task)}
                  >
                    Hapus Tugas
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-light grow py-2.5 rounded-pill fw-bold" 
                    onClick={() => emit('edit', task)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      );
    };
  }
});
