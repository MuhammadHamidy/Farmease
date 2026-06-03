import { defineComponent } from 'vue';
import type { PropType } from 'vue';

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
    const onInput = (e: Event) => {
      const v = (e.target as HTMLInputElement).value;
      emit('update:modelValue', v);
      props.onUpdateModelValue?.(v);
    };

    return () => (
      <div class={['pencatatan-input-wrap', props.iconSrc ? 'has-icon' : '']}>
        {props.iconSrc && (
          <img src={props.iconSrc} alt="" class="pencatatan-input-icon" />
        )}
        <input
          type={props.type}
          class={['pencatatan-input', props.inputClass]}
          placeholder={props.placeholder}
          value={props.modelValue}
          disabled={props.disabled}
          onInput={onInput}
        />
      </div>
    );
  },
});
