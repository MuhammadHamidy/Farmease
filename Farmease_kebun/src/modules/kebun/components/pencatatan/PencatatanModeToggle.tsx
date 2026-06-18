import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'PencatatanModeToggle',
  props: {
    modelValue: { type: String as PropType<'pohon' | 'lahan'>, required: true },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => (
      <div class="pencatatan-mode-section" style="margin-bottom:0.85rem;">
        <h3>Pilih Kategori Pencatatan</h3>
        <div class="pencatatan-mode-toggle">
          <button
            type="button"
            class={['pencatatan-mode-btn', props.modelValue === 'pohon' ? 'is-active' : ''].filter(Boolean).join(' ')}
            onClick={() => emit('update:modelValue', 'pohon')}
          >
            <span>🌳</span> Per Pohon
          </button>
          <button
            type="button"
            class={['pencatatan-mode-btn', props.modelValue === 'lahan' ? 'is-active' : ''].filter(Boolean).join(' ')}
            onClick={() => emit('update:modelValue', 'lahan')}
          >
            <span>🍃</span> Per Lahan
          </button>
        </div>
      </div>
    )
  },
})
