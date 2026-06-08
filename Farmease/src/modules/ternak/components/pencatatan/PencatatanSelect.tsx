import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import type { PropType } from 'vue';

export type PencatatanSelectOption = { value: string; label: string };

export default defineComponent({
  name: 'PencatatanSelect',
  props: {
    modelValue: { type: String, default: '' },
    options: {
      type: Array as PropType<PencatatanSelectOption[] | string[]>,
      required: true,
    },
    placeholder: { type: String, default: '' },
    onUpdateModelValue: { type: Function as PropType<(v: string) => void>, default: null },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isOpen = ref(false);
    const dropdownRef = ref<HTMLElement | null>(null);

    const normalized = () =>
      (props.options as (PencatatanSelectOption | string)[]).map((opt) =>
        typeof opt === 'string' ? { value: opt, label: opt } : opt,
      );

    const selectedLabel = () => {
      const found = normalized().find(o => o.value === props.modelValue);
      return found ? found.label : (props.placeholder || 'Pilih salah satu');
    };

    const toggleOpen = () => isOpen.value = !isOpen.value;

    const selectOption = (val: string) => {
      emit('update:modelValue', val);
      props.onUpdateModelValue?.(val);
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
      <div class="custom-select-wrapper" ref={dropdownRef}>
        <div 
          class={['pencatatan-select', isOpen.value ? 'is-open' : '']} 
          onClick={toggleOpen}
        >
          <span style={{ color: props.modelValue ? 'var(--color-on-surface)' : 'color-mix(in srgb, var(--color-on-surface-variant) 60%, transparent)' }}>
            {selectedLabel()}
          </span>
          <svg class="custom-select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{ transform: isOpen.value ? 'rotate(180deg)' : 'none' }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        {isOpen.value && (
          <div class="custom-select-menu">
            {normalized().map(opt => (
              <div 
                key={opt.value}
                class={['custom-select-option', props.modelValue === opt.value ? 'selected' : '']}
                onClick={() => selectOption(opt.value)}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});
