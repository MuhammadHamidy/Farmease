import { defineComponent } from 'vue';
import '@/shared/assets/css/ui/admin/Input.css';

export default defineComponent({
  name: 'CustomInput',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    type: { type: String, default: 'text' },
    icon: { type: Function, default: null }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleInput = (e: Event) => {
      emit('update:modelValue', (e.target as HTMLInputElement).value);
    };

    return () => (
      <div class="position-relative custom-input-wrapper w-100">
        {props.icon && (
          <div class="input-icon-wrapper">
            {props.icon()}
          </div>
        )}
        <input 
          type={props.type} 
          class={["custom-input form-control", props.icon ? "with-icon" : ""]}
          placeholder={props.placeholder}
          value={props.modelValue}
          onInput={handleInput}
        />
      </div>
    );
  }
});
