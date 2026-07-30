import { defineComponent, type PropType } from 'vue';
import Badge from '@/shared/ui/Badge';

export interface BirthAlert {
  code: string;
  daysLeft: number;
  estimatedDate: string;
  id?: string;
}

export default defineComponent({
  name: 'BirthAlerts',
  props: {
    alerts: {
      type: Array as PropType<BirthAlert[]>,
      required: true,
    },
  },
  emits: ['laporKehamilan'],
  setup(props, { emit }) {
    return () => {
      if (props.alerts.length === 0) return null;

      return (
        <div class="mb-4">
          {props.alerts.map((alert, i) => (
            <div
              key={i}
              class="d-flex align-items-center gap-3 px-4 py-3 mb-2 rounded-4"
              style={{
                background: alert.daysLeft <= 3 ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
                border: `1.5px solid ${alert.daysLeft <= 3 ? 'var(--color-warning)' : 'var(--color-success)'}`,
              }}
            >
              <img src="/icon/domba.png" alt="Domba" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              <div class="flex-grow-1">
                <strong style={{ fontSize: '0.85rem' }}>
                  {alert.daysLeft === 0 ? 'Hari Ini' : `${alert.daysLeft} hari lagi`}
                </strong>
                <span style={{ fontSize: '0.82rem', marginLeft: '6px' }}>
                  — Domba <strong>{alert.code}</strong> diperkirakan melahirkan pada {alert.estimatedDate}
                </span>
              </div>
              <div class="d-flex flex-column align-items-end gap-2">
                <Badge variant={alert.daysLeft <= 3 ? 'warning' : 'success'} className="px-3 py-1">
                  {alert.daysLeft <= 3 ? '⚠️ Segera' : '📅 Mendekati'}
                </Badge>
                <button 
                  class="btn btn-sm btn-outline-success fw-bold" 
                  style={{ fontSize: '0.7rem' }}
                  onClick={() => emit('laporKehamilan', alert.id)}
                >
                  Lapor Kehamilan
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    };
  }
});
