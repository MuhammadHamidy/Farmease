import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'PerkebunanSelectorCard',
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    iconSrc: {
      type: String,
      required: true,
    },
    onClick: {
      type: Function as PropType<() => void>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const renderIcon = () => {
      const strokeColor = props.disabled ? '#9ca3af' : '#111827'
      if (props.label.toLowerCase().includes('jenis')) {
        // Spiral binder outline icon
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="7" y="3" width="13" height="18" rx="2" />
            <path d="M4 7h6M4 12h6M4 17h6" />
            <line x1="12" y1="8" x2="17" y2="8" />
            <line x1="12" y1="12" x2="17" y2="12" />
            <line x1="12" y1="16" x2="15" y2="16" />
          </svg>
        )
      }
      // Checklist outline icon for rincian
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={strokeColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <rect x="8" y="7" width="3" height="3" rx="0.5" />
          <rect x="8" y="13" width="3" height="3" rx="0.5" />
          <line x1="13" y1="8" x2="16" y2="8" />
          <line x1="13" y1="14" x2="16" y2="14" />
        </svg>
      )
    }

    return () => (
      <button
        class={['perkebunan-selector-card', props.disabled ? 'disabled' : '']}
        onClick={props.disabled ? undefined : props.onClick}
        disabled={props.disabled}
      >
        <div class="selector-icon-wrap">
          {renderIcon()}
        </div>
        <div class="selector-content">
          <span class="selector-label">{props.label}</span>
          <strong class="selector-value">{props.value}</strong>
        </div>
      </button>
    )
  },
})
