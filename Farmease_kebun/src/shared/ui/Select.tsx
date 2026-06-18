import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import '@/shared/assets/css/ui/Select.css';

export default defineComponent({
  name: 'CustomSelect',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array as PropType<string[]>, required: true },
    placeholder: { type: String, default: 'Pilih' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => (
      <div class="position-relative custom-select-wrapper w-100">
        <select 
          class="custom-select form-select pe-5"
          value={props.modelValue}
          onChange={(e: Event) => emit('update:modelValue', (e.target as HTMLSelectElement).value)}
        >
          {props.placeholder && <option value="" disabled>{props.placeholder}</option>}
          {props.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    );
  }
});
