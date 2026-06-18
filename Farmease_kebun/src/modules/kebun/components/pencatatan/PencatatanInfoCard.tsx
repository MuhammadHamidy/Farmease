import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PencatatanInfoCard',
  props: {
    icon: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    alt: { type: String, default: '' },
  },
  setup(props) {
    return () => (
      <div class="pencatatan-info-card">
        <img src={props.icon} alt={props.alt || props.title} class="pencatatan-info-card__icon" />
        <div>
          <strong class="pencatatan-info-card__title">{props.title}</strong>
          <span class="pencatatan-info-card__subtitle">{props.subtitle}</span>
        </div>
      </div>
    )
  },
})
