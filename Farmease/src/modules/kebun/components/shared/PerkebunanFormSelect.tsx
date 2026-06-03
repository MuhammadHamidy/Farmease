import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'PerkebunanFormSelect',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    options: {
      type: Array as PropType<string[]>,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => (
      <div class="perkebunan-select-wrapper">
        <select
          class="perkebunan-form-select"
          value={props.modelValue}
          onChange={(event) => emit('update:modelValue', (event.target as HTMLSelectElement).value)}
        >
          {props.placeholder && (
            <option value="" disabled selected={!props.modelValue}>
              {props.placeholder}
            </option>
          )}
          {props.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span class="select-chevron"></span>
      </div>
    )
  },
})
