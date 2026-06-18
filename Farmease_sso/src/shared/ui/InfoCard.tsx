import { defineComponent, type PropType } from 'vue'
import Typography from './Typography'

export default defineComponent({
  name: 'InfoCard',
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    icon: { type: String, required: true },
    label: { type: String, required: true },
    theme: { type: String as PropType<'green' | 'brown' | 'orange'>, default: 'green' }
  },
  setup(props) {
    const themeColors: Record<string, { bg: string; iconBg: string; text: string }> = {
      green: { bg: 'rgba(167, 141, 120, 0.06)', iconBg: 'var(--color-secondary)', text: 'var(--color-secondary)' },
      brown: { bg: 'rgba(139, 94, 60, 0.06)', iconBg: '#8b5e3c', text: '#8b5e3c' },
      orange: { bg: 'rgba(193, 154, 107, 0.08)', iconBg: '#c19a6b', text: '#c19a6b' }
    }

    const currentTheme = themeColors[props.theme]!

    return () => (
      <div 
        class="d-flex align-items-center gap-3 p-3 rounded-4 border shadow-sm transition-all bg-white"
        style={{ borderLeft: `4px solid ${currentTheme.iconBg}` }}
      >
        <div 
          class="rounded-circle d-flex align-items-center justify-content-center shrink-0"
          style={{ width: '48px', height: '48px', backgroundColor: currentTheme.bg }}
        >
          <img src={props.icon} style={{ width: '24px', height: '24px', objectFit: 'contain' }} alt={props.title} />
        </div>
        <div class="grow overflow-hidden">
          <Typography variant="span" size="text-xs" weight="bold" className="text-secondary d-block text-uppercase letter-spacing-wide mb-1">
            {props.label}
          </Typography>
          <Typography variant="h4" size="text-md" weight="extrabold" className="m-0 text-truncate" style={{ color: 'var(--color-on-surface)' }}>
            {props.title}
          </Typography>
          <Typography variant="p" size="text-xs" weight="bold" className="m-0 text-secondary text-truncate">
            {props.subtitle}
          </Typography>
        </div>
      </div>
    )
  }
})
