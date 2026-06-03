import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PencatatanLabel',
  props: {
    htmlFor: { type: String, default: undefined },
    required: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () => (
      <label class="pencatatan-label" for={props.htmlFor}>
        {slots.default?.()}
        {props.required && <span class="text-error ms-1">*</span>}
      </label>
    );
  },
});
