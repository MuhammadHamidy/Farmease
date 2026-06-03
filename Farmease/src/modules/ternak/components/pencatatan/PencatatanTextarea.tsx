import { defineComponent } from 'vue';
import type { PropType } from 'vue';

export default defineComponent({
  name: 'PencatatanTextarea',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    rows: { type: Number, default: 3 },
    onUpdateModelValue: { type: Function as PropType<(v: string) => void>, default: null },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onInput = (e: Event) => {
      const v = (e.target as HTMLTextAreaElement).value;
      emit('update:modelValue', v);
      props.onUpdateModelValue?.(v);
    };

    return () => (
      <textarea
        class="pencatatan-textarea"
        rows={props.rows}
        placeholder={props.placeholder}
        value={props.modelValue}
        onInput={onInput}
      />
    );
  },
});
