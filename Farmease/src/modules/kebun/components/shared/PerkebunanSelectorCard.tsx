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
  },
  setup(props) {
    return () => (
      <button class="perkebunan-selector-card" onClick={props.onClick}>
        <div class="selector-icon-wrap">
          <img src={props.iconSrc} alt={props.label} class="selector-icon" />
        </div>
        <div class="selector-content">
          <span class="selector-label">{props.label}</span>
          <strong class="selector-value">{props.value}</strong>
        </div>
      </button>
    )
  },
})
