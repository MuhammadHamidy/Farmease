import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'PerkebunanFormInput',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    type: { type: String as PropType<'text' | 'number' | 'textarea' | 'date'>, default: 'text' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onInput = (e: Event) => {
      emit('update:modelValue', (e.target as HTMLInputElement | HTMLTextAreaElement).value)
    }

    return () => {
      if (props.type === 'textarea') {
        return (
          <textarea
            class="kebun-form-input kebun-form-input--textarea"
            placeholder={props.placeholder}
            value={props.modelValue}
            onInput={onInput}
          />
        )
      }
      return (
        <input
          type={props.type}
          class="kebun-form-input"
          placeholder={props.placeholder}
          value={props.modelValue}
          onInput={onInput}
        />
      )
    }
  },
})
