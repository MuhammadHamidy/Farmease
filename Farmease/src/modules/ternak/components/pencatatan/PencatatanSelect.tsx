import { defineComponent } from 'vue';
import type { PropType } from 'vue';

export type PencatatanSelectOption = { value: string; label: string };

export default defineComponent({
  name: 'PencatatanSelect',
  props: {
    modelValue: { type: String, default: '' },
    options: {
      type: Array as PropType<PencatatanSelectOption[] | string[]>,
      required: true,
    },
    placeholder: { type: String, default: '' },
    onUpdateModelValue: { type: Function as PropType<(v: string) => void>, default: null },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const normalized = () =>
      (props.options as (PencatatanSelectOption | string)[]).map((opt) =>
        typeof opt === 'string' ? { value: opt, label: opt } : opt,
      );

    const onChange = (e: Event) => {
      const v = (e.target as HTMLSelectElement).value;
      emit('update:modelValue', v);
      props.onUpdateModelValue?.(v);
    };

    return () => (
      <select class="pencatatan-select" value={props.modelValue} onChange={onChange}>
        {props.placeholder && (
          <option value="" disabled>
            {props.placeholder}
          </option>
        )}
        {normalized().map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  },
});
