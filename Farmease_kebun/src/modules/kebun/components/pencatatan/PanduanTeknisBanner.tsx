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
          <img src="/icon/document.png" alt="Dokumen" style="width: 15px; height: 15px; margin-right: 6px;" />
          Panduan Teknis
        </div>
        <p class="pencatatan-panduan__text" v-html={props.text}></p>
      </div>
    )
  },
})
