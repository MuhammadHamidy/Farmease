import { defineComponent, type PropType } from 'vue';
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
  name: 'UpcomingSchedule',
  props: {
    upcomingTasks: { type: Array as PropType<any[]>, required: true },
  },
  setup(props) {
    return () => {
      if (props.upcomingTasks.length === 0) return null;

      return (
        <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5 mb-4">
          <div class="d-flex align-items-center gap-2 mb-4">
            <img src="/icon/daily-routine.png" alt="Jadwal" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            <Typography variant="h4" weight="extrabold" className="m-0">Jadwal 7 Hari Ke Depan</Typography>
          </div>
          <div class="row g-3">
            {props.upcomingTasks.map((task: any, i: number) => (
              <div class="col-12 col-md-6 col-xl-4" key={i}>
                <div 
                  class="d-flex flex-column h-100 p-3 rounded-4" 
                  style={{ backgroundColor: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default' }} 
                  onMouseover={(e: any) => { e.currentTarget.style.borderColor = 'var(--color-primary-fixed)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.1)'; }} 
                  onMouseout={(e: any) => { e.currentTarget.style.borderColor = 'var(--color-outline-variant)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center gap-2">
                      <div class="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '36px', height: '36px', backgroundColor: 'var(--color-surface-container-high)' }}>
                        <img src={CATEGORY_ICONS[(task.category || task.jenis || 'umum').toLowerCase()] || '/icon/catat_jenis.png'} style={{ width: '18px', height: '18px', objectFit: 'contain' }} alt="" />
                      </div>
                      <Typography variant="span" size="text-xs" weight="bold" className="text-secondary text-uppercase m-0">{task.category === 'weighing' || task.category === 'berat_badan' ? 'Berat Badan' : task.category === 'stok_pakan' ? 'Stok Pakan' : (task.category || task.jenis || 'Umum')}</Typography>
                    </div>
                    <Badge 
                      variant={task.priority === 'tinggi' ? 'danger' : task.priority === 'rendah' ? 'secondary' : 'warning'} 
                      className="px-2 py-1 text-uppercase" 
                      style={{ fontSize: '0.65rem' }}
                    >
                      {task.priority || 'Normal'}
                    </Badge>
                  </div>
                  
                  <Typography variant="h5" weight="extrabold" className="m-0 mb-3 text-dark text-truncate" title={task.title || task.judul}>
                    {task.title || task.judul}
                  </Typography>
                  
                  <div class="mt-auto pt-3 d-flex flex-wrap align-items-center justify-content-between gap-2 border-top">
                    <div class="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '0.75rem' }}>
                      <i class="bi bi-calendar-week text-muted"></i>
                      <span class="fw-bold">{new Date(task.scheduledDate).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short' })}</span>
                    </div>
                    {task.time && (
                      <Badge variant="secondary" className="px-2 py-1 fw-bold text-dark">
                        <i class="bi bi-clock me-1 text-muted"></i> {task.time} WIB
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  }
});
