import { defineComponent } from 'vue'
import type { PropType } from 'vue'

type ScheduleItem = {
  name: string
  tag: string
  date: string
  detail: string
  progress: string
  description?: string
}

export default defineComponent({
  name: 'PerkebunanScheduleList',
  props: {
    items: {
      type: Array as PropType<ScheduleItem[]>,
      required: true,
    },
  },
  emits: ['open-detail'],
  setup(props, { emit }) {
    const getCropIcon = (name: string) => {
      const lower = name.toLowerCase()
      if (lower.includes('alpukat')) return '/icon/alpukat.png'
      if (lower.includes('kelengkeng')) return '/icon/kelengkeng.png'
      return '/icon/lahan.png'
    }

    const getStatusStyle = (status: string) => {
      const normalized = status.toLowerCase()
      if (normalized === 'selesai' || normalized === 'done') {
        return 'border-radius: 0.5rem; background: #8a9a5b; color: #fff; font-weight: bold; cursor: default; padding: 0.55rem 1.35rem; font-size: 0.85rem; border: none; white-space: nowrap; display: inline-block;'
      }
      // Default: Kerjakan or Belum di setujui
      return 'border-radius: 0.5rem; background: #2d3a1a; color: #fff; font-weight: bold; cursor: default; padding: 0.55rem 1.35rem; font-size: 0.85rem; border: none; white-space: nowrap; display: inline-block;'
    }

    const getStatusLabel = (status: string) => {
      const normalized = status.toLowerCase()
      if (normalized === 'selesai' || normalized === 'done') return 'Selesai'
      if (normalized.includes('belum') || normalized.includes('pending')) return 'Belum di setujui'
      return 'Kerjakan'
    }

    return () => (
      <section class="pengingat-jadwal-section" style="margin-top: 1.5rem;">
        <h4 style="font-weight: 700; color: #111827; font-size: 1.15rem; margin-bottom: 0.85rem;">Pengingat Jadwal Terkini</h4>
        <div class="reminder-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 0.75rem;">
          {props.items.map((item, index) => {
            const key = `${item.name}-${index}`

            let displayDetail = item.detail
            if (item.tag.toLowerCase().includes('perawatan') || item.tag.toLowerCase().includes('pemangkasan')) {
              displayDetail = 'Gulma • 3 x sehari'
            } else if (item.detail.includes('•')) {
              // Just use last two segments for cleaner display
              const segs = item.detail.split('•').map(s => s.trim())
              displayDetail = segs.slice(-2).join(' • ')
            }

            return (
              <div
                key={key}
                class="reminder-card"
                style="border: 1.5px solid #dce1d0; border-radius: 0.75rem; background: #ffffff; padding: 1rem 1rem 1.25rem 1rem; display: flex; flex-direction: column; gap: 0.75rem; transition: all 0.2s ease;"
              >
                <div class="reminder-top" style="display: flex; justify-content: flex-start;">
                  <span
                    class="reminder-tag"
                    style="background: #2d3a1a; color: #ffffff; padding: 0.22rem 0.65rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;"
                  >
                    {item.tag}
                  </span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-top: 0.25rem;">
                  <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 0.15rem;">
                      <img src={getCropIcon(item.name)} alt={item.name} style="width: 1.3rem; height: 1.3rem;" />
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                      <strong style="font-size: 1.15rem; color: #111827; font-weight: 800; line-height: 1.2;">{item.name}</strong>
                      <span style="font-size: 0.8rem; color: #6b7280; font-weight: 600;">{item.date}</span>
                      <span style="font-size: 0.8rem; color: #6b7280; font-weight: 600;">{displayDetail}</span>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 0.55rem; flex-shrink: 0;">
                    <span
                      style={getStatusStyle(item.progress)}
                    >
                      {getStatusLabel(item.progress)}
                    </span>
                    <img
                      src="/icon/right-row.png"
                      alt="Detail"
                      onClick={() => emit('open-detail', item)}
                      class="reminder-chevron"
                      style="width: 20px; height: 20px; flex-shrink: 0; cursor: pointer; transition: transform 0.2s;"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    )
  },
})

