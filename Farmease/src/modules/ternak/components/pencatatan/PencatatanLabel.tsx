import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PencatatanLabel',
  props: {
    htmlFor: { type: String, default: undefined },
    required: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () => (
      <label class="form-label text-secondary small fw-bold mb-2" for={props.htmlFor}>
        {slots.default?.()}
        {props.required && <span class="text-danger ms-1">*</span>}
      </label>
    );
  },
});
