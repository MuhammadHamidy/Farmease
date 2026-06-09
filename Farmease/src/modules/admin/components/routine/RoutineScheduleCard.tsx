import { defineComponent, type PropType } from 'vue';
import type { OperatorTask } from '@/modules/ternak/store/operatorAdmin';

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

    return () => {
      const { task, type, landName, jenisPencatatan, frequency, statusLabel } = props;

      if (type === 'perkebunan') {
        return (
          <div class="col-12 col-md-4">
            <div class="bg-white rounded-4 p-3 shadow-sm" style={{ border: '1px solid #E6D9CE', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div style={{ border: '1px solid #E6D9CE', borderRadius: '12px', padding: '0.15rem 0.5rem', fontSize: '0.65rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>🕒</span> {task.dueTime || '08:00'} WIB
                </div>
                <div style={{ 
                  backgroundColor: task.status === 'selesai' ? '#D4EDDA' : task.status === 'terlambat' ? '#FDECEC' : '#6C757D', 
                  color: task.status === 'selesai' ? '#155724' : task.status === 'terlambat' ? '#dc3545' : '#FFF', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '12px', 
                  fontSize: '0.65rem', 
                  fontWeight: 'bold' 
                }}>
                  {statusLabel(task.status)}
                </div>
              </div>
              <hr style={{ margin: '0', borderColor: '#E6D9CE', opacity: 0.5 }} />
              <div class="d-flex align-items-center justify-content-between gap-2 mt-1">
                <div class="d-flex align-items-center gap-2 min-w-0">
                  <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#F4F5F0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #E6D9CE' }}>
                    <img 
                      src={getIcon()} 
                      alt="Icon" 
                      style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }} 
                    />
                  </div>
                  <div class="d-flex flex-column min-w-0">
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#000' }} class="text-truncate text-capitalize">{jenisPencatatan}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6C757D' }} class="text-truncate">{task.dueDate || '-'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6C757D' }} class="text-truncate">{task.cageCode}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => emit('open-detail', task)}
                  class="btn btn-sm rounded-3 fw-bold flex-shrink-0"
                  style={{ backgroundColor: '#30360E', color: '#FFF', fontSize: '0.7rem', padding: '0.35rem 0.75rem', border: 'none' }}
                >
                  Lihat Tugas
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div class="col-12 col-md-6 col-lg-4">
          <div class="bg-white rounded-4 p-3 shadow-sm h-100 d-flex flex-column" style={{ border: '1px solid #E6D9CE' }}>
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div style={{ border: '1px solid #E6D9CE', borderRadius: '12px', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>🕒</span> {task.dueTime || '08:00'} WIB
              </div>
              <div style={{ 
                backgroundColor: task.status === 'selesai' ? '#D4EDDA' : task.status === 'terlambat' ? '#FDECEC' : '#6C757D', 
                color: task.status === 'selesai' ? '#155724' : task.status === 'terlambat' ? '#dc3545' : '#FFF', 
                padding: '0.2rem 0.6rem', 
                borderRadius: '12px', 
                fontSize: '0.7rem', 
                fontWeight: 'bold' 
              }}>
                {statusLabel(task.status)}
              </div>
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#000', marginBottom: '0.25rem' }} class="text-capitalize">
              {task.category}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6C757D', marginBottom: '1rem' }}>
              {task.rincian ? `${task.rincian} (Kandang ${task.cageCode})` : `Tugas rutin (Kandang ${task.cageCode})`}
            </div>

            <hr style={{ margin: '0 0 1rem 0', borderColor: '#E6D9CE', opacity: 0.8 }} />

            <div class="d-flex flex-column gap-2 mb-3" style={{ fontSize: '0.75rem' }}>
              <div class="d-flex justify-content-between">
                <span style={{ color: '#2C3E50' }}>Jenis Tugas:</span>
                <span style={{ color: '#000', fontWeight: '500' }} class="text-capitalize">{task.category}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span style={{ color: '#2C3E50' }}>Tanggal:</span>
                <span style={{ color: '#000', fontWeight: '500' }}>{task.dueDate || '-'}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span style={{ color: '#2C3E50' }}>Frekuensi:</span>
                <span style={{ color: '#000', fontWeight: '500' }}>{frequency}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span style={{ color: '#2C3E50' }}>Kandang:</span>
                <span style={{ color: '#000', fontWeight: '500' }}>{task.cageCode}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span style={{ color: '#2C3E50' }}>Nama Pengguna:</span>
                <span style={{ color: '#000', fontWeight: '500' }}>{task.assigneeName}</span>
              </div>
            </div>

            <div class="mt-auto pt-3">
              <hr style={{ margin: '0 0 1rem 0', borderColor: '#E6D9CE', opacity: 0.8 }} />
              <button 
                type="button" 
                class="btn w-100 rounded-3 fw-bold"
                style={{ backgroundColor: '#30360E', color: '#FFF', fontSize: '0.85rem', padding: '0.5rem 0', border: 'none' }}
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
