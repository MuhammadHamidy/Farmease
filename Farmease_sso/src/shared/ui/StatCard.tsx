import { defineComponent, type PropType } from 'vue';
import Typography from './Typography';
import '@/shared/assets/css/ui/StatCard.css';

export default defineComponent({
  name: 'StatCard',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    sub: { type: String, default: '' },
    color: { type: String as PropType<'primary' | 'accent' | 'light'>, default: 'primary' },
    icon: { type: Function, default: null },
  },
  setup(props) {
    const getAccentColor = (color?: 'primary' | 'accent' | 'light'): string => {
      switch (color) {
        case 'primary':
          return '#8B5E3C'; // Warm primary brown (Total)
        case 'accent':
          return '#ba1a1a'; // Red error/attention (Attention needed)
        case 'light':
          return '#606c38'; // Green success/healthy (Healthy / completed tasks)
        default:
          return '#8B5E3C';
      }
    };

    return () => (
      <div class={['stat-card', `stat-card-${props.color || 'primary'}`]}>
        <div class="stat-card-header">
          <Typography variant="span" size="text-xs" className="stat-card-label" style={{ color: '#8c7a6b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {props.label}
          </Typography>
          {props.icon && (
            <div class="stat-card-icon-box" style={{ color: getAccentColor(props.color) }}>
              {props.icon()}
            </div>
          )}
        </div>
        <div class="stat-card-body">
          <Typography variant="h2" size="text-2xl" weight="extrabold" className="stat-card-value" style={{ color: '#1f1105' }}>
            {props.value}
          </Typography>
        </div>
        {props.sub && (
          <div class="stat-card-footer">
            <Typography variant="span" size="text-xs" className="stat-card-sub" style={{ color: '#9CA3AF' }}>
              {props.sub}
            </Typography>
          </div>
        )}
      </div>
    );
  }
});
