import { defineComponent, type PropType } from 'vue';
import type { OperatorTask } from '@/store/operatorAdmin';

export default defineComponent({
  name: 'RoutineScheduleCard',
  props: {
    task: {
      type: Object as PropType<OperatorTask>,
      required: true
    },
    type: {
      type: String as PropType<'peternakan' | 'perkebunan'>,
      required: true
    },
    landName: {
      type: String,
      required: true
    },
    jenisPencatatan: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    statusLabel: {
      type: Function as PropType<(s: string) => string>,
      required: true
    }
  },
  emits: ['open-detail'],
  setup(props, { emit }) {
    const getIcon = () => {
      if (props.type === 'perkebunan') {
        return props.landName.toLowerCase().includes('kelengkeng')
          ? '/icon/kelengkeng.png'
          : '/icon/alpukat.png';
      }
      return '/icon/pohon.png';
    };

    const getStatusStyle = (status: string) => {
      if (status === 'selesai') return { bg: '#D4EDDA', color: '#155724', border: '#A3D9B1', dot: '#198754' };
      if (status === 'terlambat') return { bg: '#FDECEC', color: '#dc3545', border: '#f5c6cb', dot: '#dc3545' };
      return { bg: '#F0F0F0', color: '#555', border: '#d0d0d0', dot: '#6C757D' };
    };

    return () => {
      const { task, type, landName, jenisPencatatan, frequency, statusLabel } = props;
      const endTime = (task as any).endTime;
      const statusStyle = getStatusStyle(task.status);

      // ─── Time Range Row ───────────────────────────────────
      const TimeRow = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* Start time */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            background: '#F4F5F0', border: '1px solid #D8DCC8',
            borderRadius: '8px', padding: '0.2rem 0.55rem',
            fontSize: '0.72rem', fontWeight: '700', color: '#30360E'
          }}>
            <span style={{ fontSize: '0.8rem' }}>🕐</span>
            <span>Mulai</span>
            <span style={{ color: '#606C38', fontFamily: 'monospace' }}>{task.dueTime || '08:00'}</span>
          </div>
          {/* Arrow */}
          {endTime && (
            <span style={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 'bold' }}>→</span>
          )}
          {/* End time / deadline */}
          {endTime && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: task.status === 'terlambat' ? '#FDECEC' : '#FFF5F0',
              border: `1px solid ${task.status === 'terlambat' ? '#f5c6cb' : '#F0C0A0'}`,
              borderRadius: '8px', padding: '0.2rem 0.55rem',
              fontSize: '0.72rem', fontWeight: '700',
              color: task.status === 'terlambat' ? '#dc3545' : '#C06020'
            }}>
              <span style={{ fontSize: '0.8rem' }}>⏰</span>
              <span>Tenggat</span>
              <span style={{ fontFamily: 'monospace' }}>{endTime}</span>
            </div>
          )}
        </div>
      );

      // ─── Status Badge ─────────────────────────────────────
      const StatusBadge = () => (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          background: statusStyle.bg,
          border: `1px solid ${statusStyle.border}`,
          borderRadius: '20px',
          padding: '0.18rem 0.65rem',
          fontSize: '0.68rem', fontWeight: '700',
          color: statusStyle.color,
          whiteSpace: 'nowrap' as const
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: statusStyle.dot, display: 'inline-block', flexShrink: 0
          }} />
          {statusLabel(task.status)}
        </div>
      );

      // ─── PERKEBUNAN card ──────────────────────────────────
      if (type === 'perkebunan') {
        return (
          <div class="col-12 col-md-4">
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '1rem',
              border: '1px solid #E6D9CE', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%'
            }}>
              {/* Status row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <StatusBadge />
              </div>

              {/* Time range */}
              <TimeRow />

              <hr style={{ margin: '0', borderColor: '#E6D9CE', opacity: 0.5 }} />

              {/* Info row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <div style={{
                    width: '2.25rem', height: '2.25rem', background: '#F4F5F0',
                    borderRadius: '8px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0, border: '1px solid #E6D9CE'
                  }}>
                    <img src={getIcon()} alt="Icon" style={{ width: '1.4rem', height: '1.4rem', objectFit: 'contain' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#000' }} class="text-truncate text-capitalize">{jenisPencatatan}</div>
                    <div style={{ fontSize: '0.68rem', color: '#6C757D' }}>{task.dueDate || '-'} · {task.cageCode}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => emit('open-detail', task)}
                  class="btn btn-sm rounded-3 fw-bold flex-shrink-0"
                  style={{ background: '#30360E', color: '#FFF', fontSize: '0.68rem', padding: '0.3rem 0.65rem', border: 'none' }}
                >
                  Lihat
                </button>
              </div>
            </div>
          </div>
        );
      }

      // ─── PETERNAKAN card ──────────────────────────────────
      return (
        <div class="col-12 col-md-6 col-lg-4">
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '1rem 1rem 0.85rem',
            border: '1px solid #E6D9CE', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex', flexDirection: 'column', height: '100%'
          }}>
            {/* Row 1: Status badge aligned right */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <StatusBadge />
            </div>

            {/* Row 2: Time range */}
            <div style={{ marginBottom: '0.75rem' }}>
              <TimeRow />
            </div>

            {/* Row 3: Category title + subtitle */}
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#1a1a1a', marginBottom: '0.1rem' }} class="text-capitalize">
              {task.category}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6C757D', marginBottom: '0.75rem' }}>
              {task.rincian ? `${task.rincian} (Kandang ${task.cageCode})` : `Tugas rutin (Kandang ${task.cageCode})`}
            </div>

            <hr style={{ margin: '0 0 0.75rem 0', borderColor: '#E6D9CE', opacity: 0.7 }} />

            {/* Row 4: Detail table */}
            <div style={{ fontSize: '0.74rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem', flexGrow: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6C757D' }}>Jenis Tugas</span>
                <span style={{ color: '#1a1a1a', fontWeight: '600' }} class="text-capitalize">{task.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6C757D' }}>Tanggal</span>
                <span style={{ color: '#1a1a1a', fontWeight: '600' }}>{task.dueDate || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6C757D' }}>Frekuensi</span>
                <span style={{ color: '#1a1a1a', fontWeight: '600' }}>{frequency}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6C757D' }}>Kandang</span>
                <span style={{ color: '#1a1a1a', fontWeight: '600' }}>{task.cageCode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6C757D' }}>Nama Pengguna</span>
                <span style={{ color: '#1a1a1a', fontWeight: '600' }}>{task.assigneeName}</span>
              </div>
            </div>

            {/* Row 5: CTA button */}
            <div>
              <hr style={{ margin: '0 0 0.75rem 0', borderColor: '#E6D9CE', opacity: 0.7 }} />
              <button
                type="button"
                class="btn w-100 rounded-3 fw-bold"
                style={{ background: '#30360E', color: '#FFF', fontSize: '0.85rem', padding: '0.45rem 0', border: 'none', borderRadius: '10px' }}
                onClick={() => emit('open-detail', task)}
              >
                Detail Tugas
              </button>
            </div>
          </div>
        </div>
      );
    };
  }
});
