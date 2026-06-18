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
          <img src="/icon/arrow-right/grey-16.svg" alt="Chevron" style="width: 14px; height: 14px;" />
        )}
      </div>
    )
  },
})
