import { defineComponent } from 'vue';
import '@/shared/assets/css/ui/Toggle.css';

export default defineComponent({
  name: 'CustomToggle',
  props: {
    modelValue: { type: Boolean, default: false }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => (
      <label class="custom-toggle">
        <input 
          type="checkbox" 
          checked={props.modelValue} 
          onChange={(e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).checked)}
        />
        <span class="toggle-slider"></span>
      </label>
    );
  }
});
