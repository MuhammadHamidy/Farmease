import { defineComponent, type PropType } from 'vue'
import CustomSelect from '@/shared/ui/admin/Select'

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
      <CustomSelect
        modelValue={props.modelValue}
        options={props.options}
        placeholder={props.placeholder}
        theme="perkebunan"
        onUpdate:modelValue={(val: string) => emit('update:modelValue', val)}
      />
    )
  },
})
