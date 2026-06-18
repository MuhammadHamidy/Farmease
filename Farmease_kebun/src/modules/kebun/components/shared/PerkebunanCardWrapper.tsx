import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PerkebunanCardWrapper',
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    metaLeft: {
      type: String,
      default: '',
    },
    metaRight: {
      type: String,
      default: '',
    },
    isDark: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    return () => (
      <div class={['perkebunan-card-wrapper', props.isDark ? 'is-dark' : '']}>
        <div class="perkebunan-card-header">
          <div class="header-left">
            {props.subtitle && <span class="card-subtitle">{props.subtitle}</span>}
            <h3 class="card-title">{props.title}</h3>
            {props.metaLeft && <span class="card-meta-left">{props.metaLeft}</span>}
          </div>
          {props.metaRight && (
            <div class="header-right">
              <span class="card-meta-right">{props.metaRight}</span>
            </div>
          )}
        </div>
        <div class="perkebunan-card-body">
          {slots.default?.()}
        </div>
      </div>
    )
  },
})
