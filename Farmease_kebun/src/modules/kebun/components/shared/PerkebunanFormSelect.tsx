import { defineComponent, ref, onMounted, onUnmounted, type PropType } from 'vue'

export default defineComponent({
  name: 'PerkebunanFormSelect',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array as PropType<string[]>, default: () => [] },
    placeholder: { type: String, default: 'Pilih' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isOpen = ref(false)
    const containerRef = ref<HTMLElement | null>(null)

    const displayValue = () => {
      const val = props.modelValue
      if (!val || val === props.placeholder) return props.placeholder
      return val
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        isOpen.value = false
      }
    }

    onMounted(() => document.addEventListener('click', handleClickOutside))
    onUnmounted(() => document.removeEventListener('click', handleClickOutside))

    return () => (
      <div ref={containerRef} class="kebun-form-select">
        <button
          type="button"
          class="kebun-form-select__trigger"
          onClick={() => { isOpen.value = !isOpen.value }}
        >
          <span class={displayValue() === props.placeholder ? 'kebun-form-select__placeholder' : ''}>
            {displayValue()}
          </span>
          <img
            src="/icon/caret-down/black-12.svg"
            alt=""
            class={`kebun-form-select__caret ${isOpen.value ? 'is-open' : ''}`}
          />
        </button>
        {isOpen.value && (
          <ul class="kebun-form-select__menu">
            {props.options.map(opt => (
              <li
                key={opt}
                class={`kebun-form-select__item ${props.modelValue === opt ? 'is-selected' : ''}`}
                onClick={() => {
                  emit('update:modelValue', opt)
                  isOpen.value = false
                }}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  },
})
