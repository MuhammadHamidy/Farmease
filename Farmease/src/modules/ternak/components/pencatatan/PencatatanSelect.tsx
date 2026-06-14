import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import CustomSelect from '@/shared/ui/admin/Select';

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
    const onUpdate = (v: string) => {
      emit('update:modelValue', v);
      props.onUpdateModelValue?.(v);
    };

    return () => (
      <CustomSelect
        modelValue={props.modelValue}
        onUpdate:modelValue={onUpdate}
        options={props.options}
        placeholder={props.placeholder}
      />
    );
  },
});
