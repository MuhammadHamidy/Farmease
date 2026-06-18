import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TreeCard',
  props: {
    code: { type: String, required: true },
    varietas: { type: String, required: true },
    selected: { type: Boolean, default: false },
    icon: { type: String, default: '/icon/alpukat.png' },
  },
  emits: ['click'],
  setup(props, { emit }) {
    return () => (
      <div
        class={['pencatatan-tree-card', props.selected ? 'is-active' : ''].filter(Boolean).join(' ')}
        onClick={() => emit('click')}
      >
        <img src={props.icon} alt="pohon" class="pencatatan-tree-card__icon" />
        <span class="pencatatan-tree-card__code">{props.code}</span>
        <span class="pencatatan-tree-card__varietas">{props.varietas}</span>
      </div>
    )
  },
})
