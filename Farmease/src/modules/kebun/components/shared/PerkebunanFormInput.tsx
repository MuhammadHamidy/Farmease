import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'PerkebunanFormInput',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    type: {
      type: String as PropType<'text' | 'textarea'>,
      default: 'text',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => (
      <div class="perkebunan-input-wrapper">
        {props.type === 'textarea' ? (
          <textarea
            class="perkebunan-form-input perkebunan-form-textarea"
            placeholder={props.placeholder}
            value={props.modelValue}
            onInput={(event) => emit('update:modelValue', (event.target as HTMLTextAreaElement).value)}
          />
        ) : (
          <input
            class="perkebunan-form-input"
            type="text"
            placeholder={props.placeholder}
            value={props.modelValue}
            onInput={(event) => emit('update:modelValue', (event.target as HTMLInputElement).value)}
          />
        )}
      </div>
    )
  },
})
