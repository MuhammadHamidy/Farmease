import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PencatatanPrimaryButton',
  props: {
    label: { type: String, default: 'Simpan' },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['click'],
  setup(props, { emit }) {
    return () => (
      <div style="padding-top:0.25rem;">
        <button
          type="button"
          class="pencatatan-primary-btn"
          disabled={props.disabled || props.loading}
          onClick={() => emit('click')}
        >
          {props.loading ? 'Mengirim...' : props.label}
        </button>
      </div>
    )
  },
})
