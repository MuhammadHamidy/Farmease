import { defineComponent } from 'vue'
import type { PropType } from 'vue'

type QuickLink = {
  title: string
  subtitle: string
  onClick: () => void
}

export default defineComponent({
  name: 'PerkebunanQuickLinks',
  props: {
    links: {
      type: Array as PropType<QuickLink[]>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <section class="informasi-lain-section" style="margin-top: 1.5rem;">
        <h4 style="font-weight: 700; color: #111827; font-size: 1.15rem; margin-bottom: 0.85rem;">Informasi Lain</h4>
        <div class="quick-links-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.75rem;">
          {props.links.map((link) => {
            // Extract the label/value for mockup 5 structure
            let label = 'Informasi'
            let value = link.title
            if (link.title.toLowerCase().includes('dasbor')) {
              label = 'Informasi'
              value = 'Dasbor'
            } else if (link.title.toLowerCase().includes('daftar')) {
              label = 'Daftar'
              value = 'Perkebunan'
            } else if (link.title.toLowerCase().includes('riwayat')) {
              label = 'Informasi'
              value = 'Riwayat'
            }

            return (
              <button
                class="quick-link-card"
                onClick={link.onClick}
                style="display: flex; align-items: center; gap: 0.85rem; padding: 0.85rem 1rem; border: 1.5px solid #dce1d0; border-radius: 0.75rem; background: #ffffff; text-align: left; cursor: pointer; transition: all 0.2s ease;"
              >
                <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img src="/icon/document.png" alt="Document" style="width: 1.25rem; height: 1.25rem;" />
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-size: 0.72rem; color: #6b7280; display: block; margin-bottom: 0.15rem;">{label}</span>
                  <strong style="font-size: 1rem; color: #111827; font-weight: 700;">{value}</strong>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    )
  },
})
