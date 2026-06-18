import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PencatatanSelectionField',
  props: {
    icon: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
    clickable: { type: Boolean, default: false },
    showChevron: { type: Boolean, default: false },
  },
  emits: ['click'],
  setup(props, { emit }) {
    return () => (
      <div
        class={['pencatatan-selection-field', props.clickable ? 'is-clickable' : ''].filter(Boolean).join(' ')}
        onClick={() => { if (props.clickable) emit('click') }}
      >
        <div class="pencatatan-selection-field__icon-wrap">
          <img src={props.icon} alt="" class="pencatatan-selection-field__icon" onError={(e: Event) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>
        <div style="flex:1; min-width:0;">
          <div class="pencatatan-selection-field__label">{props.label}</div>
          <div class="pencatatan-selection-field__value">{props.value}</div>
        </div>
        {props.showChevron && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    )
  },
})
