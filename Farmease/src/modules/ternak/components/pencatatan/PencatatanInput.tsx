import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import CustomInput from '@/shared/ui/Input';

export default defineComponent({
  name: 'PencatatanInput',
  props: {
    modelValue: { type: String, default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    iconSrc: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    inputClass: { type: String, default: '' },
    onUpdateModelValue: { type: Function as PropType<(v: string) => void>, default: null },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onUpdate = (v: string) => {
      emit('update:modelValue', v);
      props.onUpdateModelValue?.(v);
    };

    return () => (
      <CustomInput
        type={props.type}
        placeholder={props.placeholder}
        modelValue={props.modelValue}
        onUpdate:modelValue={onUpdate}
        icon={props.iconSrc ? () => <img src={props.iconSrc} style={{width: '16px', opacity: 0.6}} alt="" /> : undefined}
      />
    );
  },
});
