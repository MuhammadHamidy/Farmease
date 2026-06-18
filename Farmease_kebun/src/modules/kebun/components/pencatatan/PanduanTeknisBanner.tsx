import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PanduanTeknisBanner',
  props: {
    text: { type: String, required: true },
  },
  setup(props) {
    return () => (
      <div class="pencatatan-panduan">
        <div class="pencatatan-panduan__title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Panduan Teknis
        </div>
        <p class="pencatatan-panduan__text">{props.text}</p>
      </div>
    )
  },
})
