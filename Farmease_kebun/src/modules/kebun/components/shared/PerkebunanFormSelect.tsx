import { defineComponent, ref, onMounted, onUnmounted, type PropType } from 'vue'

export default defineComponent({
  name: 'PerkebunanFormSelect',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array as PropType<any[]>, default: () => [] },
    placeholder: { type: String, default: 'Pilih' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isOpen = ref(false)
    const containerRef = ref<HTMLElement | null>(null)

    const displayValue = () => {
      const val = props.modelValue
      if (!val || val === props.placeholder) return props.placeholder
      const found = props.options.find(opt => {
        if (typeof opt === 'object' && opt !== null) {
          return String((opt as any).value) === String(val)
        }
        return String(opt) === String(val)
      })
      if (found && typeof found === 'object' && found !== null) {
        return (found as any).label
      }
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
          class={`kebun-form-select__trigger ${props.disabled ? 'is-disabled' : ''}`}
          disabled={props.disabled}
          onClick={() => {
            if (!props.disabled) {
              isOpen.value = !isOpen.value
            }
          }}
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
            {props.options.map(opt => {
              const itemVal = typeof opt === 'object' && opt !== null ? String((opt as any).value) : String(opt)
              const itemLabel = typeof opt === 'object' && opt !== null ? String((opt as any).label) : String(opt)
              return (
                <li
                  key={itemVal}
                  class={`kebun-form-select__item ${props.modelValue === itemVal ? 'is-selected' : ''}`}
                  onClick={() => {
                    emit('update:modelValue', itemVal)
                    isOpen.value = false
                  }}
                >
                  {itemLabel}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  },
})

