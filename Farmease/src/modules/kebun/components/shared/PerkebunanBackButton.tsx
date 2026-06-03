import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'PerkebunanBackButton',
  props: {
    onClick: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <button class="perkebunan-back-btn-pill" onClick={props.onClick}>
        <img src="/icon/arrow-left/white-16.svg" alt="Back" class="back-icon" />
        <span>Kembali</span>
      </button>
    )
  },
})
