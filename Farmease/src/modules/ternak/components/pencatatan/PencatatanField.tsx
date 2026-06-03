import { defineComponent } from 'vue';
import PencatatanLabel from './PencatatanLabel';

export default defineComponent({
  name: 'PencatatanField',
  props: {
    label: { type: String, required: true },
    colClass: { type: String, default: 'col-12' },
    required: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () => (
      <div class={props.colClass}>
        <PencatatanLabel required={props.required}>{props.label}</PencatatanLabel>
        {slots.default?.()}
      </div>
    );
  },
});
