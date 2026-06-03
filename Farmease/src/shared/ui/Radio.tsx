import { defineComponent } from 'vue';
import '@/shared/assets/css/ui/Radio.css';

export default defineComponent({
  name: 'CustomRadio',
  props: {
    modelValue: { type: String, default: '' },
    value: { type: String, required: true },
    name: { type: String, required: true }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isChecked = () => props.modelValue === props.value;
    
    return () => (
      <label class="custom-radio">
        <input 
          type="radio" 
          name={props.name}
          value={props.value}
          checked={isChecked()} 
          onChange={(e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)}
        />
        <span class="radio-circle"></span>
      </label>
    );
  }
});
