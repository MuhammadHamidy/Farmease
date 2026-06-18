import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PencatatanFormContainer',
  props: {
    title: { type: String, default: 'Formulir Pencatatan Perkebunan' },
  },
  setup(props, { slots }) {
    return () => (
      <div class="pencatatan-form-shell">
        <div class="pencatatan-form-shell__header">
          <h3>{props.title}</h3>
        </div>
        <div class="pencatatan-form-shell__body">
          {slots.default?.()}
          {slots.footer?.()}
        </div>
      </div>
    )
  },
})
