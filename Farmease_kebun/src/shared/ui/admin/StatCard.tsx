import { defineComponent, type PropType } from 'vue';
import Typography from './Typography';
import '@/shared/assets/css/ui/admin/StatCard.css';

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
    const bgMap: Record<string, string> = {
      primary: '#A78D78',
      accent:  '#C19A6B',
      light:   '#E1D4C2',
    };

    return () => (
      <div
        class="stat-card"
        style={{ backgroundColor: bgMap[props.color] }}
      >
        {props.icon && (
          <div class="stat-card-icon">{props.icon()}</div>
        )}
        <Typography variant="h2" size="text-4xl" weight="bold" color="white" className="stat-card-value">
          {props.value}
        </Typography>
        <Typography variant="p" size="text-sm" color="white" className="stat-card-label">
          {props.label}
        </Typography>
        {props.sub && (
          <Typography variant="span" size="text-xs" className="stat-card-sub">
            {props.sub}
          </Typography>
        )}
      </div>
    );
  }
});
