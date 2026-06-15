import { defineComponent, type PropType } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';

export const CATEGORY_ICONS: Record<string, string> = {
  pakan: '/icon/catat_pakan.png',
  kesehatan: '/icon/catat_sehat.png',
  kotoran: '/icon/catat_kotoran.png',
  perkawinan: '/icon/catat_kawin.png',
  kelahiran: '/icon/catat_lahir.png',
  umum: '/icon/catat_jenis.png',
};

export default defineComponent({
  name: 'TaskDetailModal',
  props: {
    selectedTask: { type: Object as PropType<any> | null, required: false, default: null },
    onClose: { type: Function as PropType<() => void>, required: true },
    onGoToPencatatan: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    return () => {
      if (!props.selectedTask) return null;

      return (
        <div class="peternakan-modal-overlay" onClick={props.onClose}>
          <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div class="peternakan-modal-header">
              <button class="peternakan-modal-close" onClick={props.onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div class="peternakan-modal-title">Detail Tugas Rutin</div>
            </div>

            <div class="peternakan-modal-body">
              <div class="d-flex align-items-start gap-3 mb-4">
                <div class="rounded-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', backgroundColor: 'var(--color-primary-fixed)' }}>
                  <img src={CATEGORY_ICONS[props.selectedTask.category] || '/icon/catat_jenis.png'} alt="Task" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                </div>
                <div class="flex-grow-1">
                  <Typography variant="h4" weight="extrabold" className="m-0 text-capitalize">{props.selectedTask.category}</Typography>
                  <Typography variant="p" size="text-xs" color="secondary" className="m-0">
                    Tugas Rutin Peternakan
                  </Typography>
                </div>
                <Badge variant={
                  props.selectedTask.status === 'selesai' || props.selectedTask.rawStatus === 'approved' || props.selectedTask.rawStatus === 'done' ? 'success' :
                  props.selectedTask.status === 'proses' || props.selectedTask.rawStatus === 'menunggu' ? 'primary' :
                  props.selectedTask.status === 'terlambat' ? 'danger' : 'warning'
                } className="px-3 py-2 text-nowrap" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  {props.selectedTask.status === 'selesai' || props.selectedTask.rawStatus === 'approved' ? (
                    <>✅ Sudah Selesai</>
                  ) : props.selectedTask.status === 'proses' || props.selectedTask.rawStatus === 'menunggu' ? (
                    <><img src="/icon/wait.png" style={{ width: '14px', height: '14px', objectFit: 'contain' }} alt="" /> Menunggu Validasi</>
                  ) : props.selectedTask.status === 'terlambat' ? (
                    <>⚠️ Terlambat</>
                  ) : (
                    <>📋 Belum Dikerjakan</>
                  )}
                </Badge>
              </div>

              <div class="rounded-4 border p-3 mb-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div class="d-flex flex-column gap-3">
                  <div>
                    <span class="text-muted d-block small mb-1">Jenis Tugas:</span>
                    <span class="fw-semibold text-dark text-capitalize">{props.selectedTask.category}</span>
                  </div>
                  <div>
                    <span class="text-muted d-block small mb-1">Rincian Tugas <span class="fw-normal">(Opsional)</span>:</span>
                    <span class="fw-semibold text-dark">{props.selectedTask.rincian || '-'}</span>
                  </div>
                  <div>
                    <span class="text-muted d-block small mb-1">Kandang:</span>
                    <span class="fw-semibold text-dark">{props.selectedTask.cageCode}</span>
                  </div>
                  <div>
                    <span class="text-muted d-block small mb-1">Prioritas:</span>
                    <span class="fw-semibold text-dark text-capitalize">{props.selectedTask.priority}</span>
                  </div>
                  <div>
                    <span class="text-muted d-block small mb-1">Jam Pelaksanaan:</span>
                    <span class="fw-semibold text-dark">{props.selectedTask.dueTime ? `${props.selectedTask.dueTime} WIB` : '-'}</span>
                  </div>
                  <div>
                    <span class="text-muted d-block small mb-1">Jam Tenggat:</span>
                    <span class="fw-semibold text-dark">{props.selectedTask.endTime ? `${props.selectedTask.endTime} WIB` : '-'}</span>
                  </div>
                  <div>
                    <span class="text-muted d-block small mb-1">Deskripsi Tugas:</span>
                    <span class="fw-semibold text-dark">{props.selectedTask.description || 'Tidak ada deskripsi.'}</span>
                  </div>
                </div>
              </div>

              <div class="d-flex flex-column flex-sm-row gap-3 justify-content-end">
                {props.selectedTask.status === 'selesai' || props.selectedTask.rawStatus === 'approved' || props.selectedTask.rawStatus === 'done' ? (
                  <div class="alert rounded-4 border-0 py-3 px-4 w-100 text-center mb-0" style={{ backgroundColor: '#D4EDDA', color: '#155724', fontWeight: '700', fontSize: '0.9rem' }}>
                    ✅ Tugas ini sudah selesai dikerjakan dan disetujui admin.
                  </div>
                ) : props.selectedTask.status === 'proses' || props.selectedTask.rawStatus === 'menunggu' ? (
                  <div class="alert rounded-4 border-0 py-3 px-4 w-100 mb-0" style={{ backgroundColor: '#D6EAF8', color: '#1A5276', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <img src="/icon/wait.png" style={{ width: '20px', height: '20px', objectFit: 'contain' }} alt="" />
                    Pencatatan sudah dikirim dan sedang menunggu persetujuan admin.
                  </div>
                ) : (
                  <button
                    class="btn rounded-pill px-4 py-3 fw-bold text-white border-0 w-100"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    onClick={props.onGoToPencatatan}
                  >
                    Kerjakan Tugas
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };
  }
});
