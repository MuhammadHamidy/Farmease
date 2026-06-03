import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'PerkebunanListItemCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    iconSrc: {
      type: String,
      default: '/icon/document.png',
    },
    selected: {
      type: Boolean,
      default: false,
    },
    showRadio: {
      type: Boolean,
      default: false,
    },
    onClick: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <button
        class={['perkebunan-list-item-card', props.selected ? 'is-selected' : '']}
        onClick={props.onClick}
      >
        <div class="list-item-left">
          <div class="list-item-icon-wrap">
            <img src={props.iconSrc} alt="" class="list-item-icon" />
          </div>
          <div class="list-item-copy">
            <strong class="list-item-title">{props.title}</strong>
            <span class="list-item-subtitle">{props.subtitle}</span>
          </div>
        </div>
        {props.showRadio && (
          <div class={['list-item-radio', props.selected ? 'is-active' : '']}>
            <span class="radio-inner" />
          </div>
        )}
      </button>
    )
  },
})
