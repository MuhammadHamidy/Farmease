import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import type { PropType } from 'vue';
import '@/shared/assets/css/ui/admin/Select.css';

export default defineComponent({
  name: 'CustomSelect',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array as PropType<string[] | { value: string; label: string }[]>, required: true },
    placeholder: { type: String, default: 'Pilih' },
    theme: { type: String, default: 'peternakan' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isOpen = ref(false);
    const dropdownRef = ref<HTMLElement | null>(null);

    const normalizedOptions = () => {
      return props.options.map(opt => {
        if (typeof opt === 'object' && opt !== null) {
          return { value: (opt as any).value, label: (opt as any).label };
        }
        return { value: String(opt), label: String(opt) };
      });
    };

    const selectedLabel = () => {
      const found = normalizedOptions().find(o => String(o.value) === String(props.modelValue));
      return found ? found.label : props.placeholder;
    };

    const toggleOpen = () => isOpen.value = !isOpen.value;

    const selectOption = (val: string) => {
      emit('update:modelValue', val);
      isOpen.value = false;
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
        isOpen.value = false;
      }
    };

    onMounted(() => document.addEventListener('click', handleClickOutside, true));
    onUnmounted(() => document.removeEventListener('click', handleClickOutside, true));

    return () => (
      <div class={['position-relative custom-select-wrapper w-100', `theme-${props.theme}`]} ref={dropdownRef}>
        <div 
          class={['custom-select pe-5', isOpen.value ? 'is-open' : '']}
          onClick={toggleOpen}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', minHeight: '38px', justifyContent: 'space-between' }}
        >
          <span style={{ color: props.modelValue ? 'inherit' : 'var(--ui-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedLabel()}
          </span>
          <svg class="select-icon-wrapper" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{ transform: isOpen.value ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)', transition: 'transform 0.2s', width: '18px', height: '18px', position: 'absolute', right: '1rem', top: '50%', color: 'inherit', opacity: 0.5 }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        {isOpen.value && (
          <div class="custom-select-menu">
            {normalizedOptions().map(opt => (
              <div 
                key={opt.value}
                class={['custom-select-option', String(props.modelValue) === String(opt.value) ? 'selected' : '']}
                onClick={() => selectOption(opt.value)}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
});
