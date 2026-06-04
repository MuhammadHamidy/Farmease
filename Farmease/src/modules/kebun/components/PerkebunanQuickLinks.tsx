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
                style="display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; height: 7.5rem; padding: 1.25rem 1rem; border: 1.5px solid #dce1d0; border-radius: 0.75rem; background: #ffffff; text-align: left; cursor: pointer; transition: all 0.2s ease;"
              >
                <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; border: 1.5px dashed #cbd5e1; background: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <rect x="8" y="7" width="3" height="3" rx="0.5" />
                    <rect x="8" y="13" width="3" height="3" rx="0.5" />
                    <line x1="13" y1="8" x2="16" y2="8" />
                    <line x1="13" y1="14" x2="16" y2="14" />
                  </svg>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.1rem; width: 100%;">
                  <span style="font-size: 0.82rem; color: #6b7280; display: block;">{label}</span>
                  <strong style="font-size: 1.1rem; color: #111827; font-weight: 800;">{value}</strong>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    )
  },
})
