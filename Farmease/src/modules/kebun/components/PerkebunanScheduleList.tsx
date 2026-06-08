import { defineComponent } from 'vue'
import type { PropType } from 'vue'

type ScheduleItem = {
  name: string
  tag: string
  date: string
  detail: string
  progress: string
  description?: string
  time?: string
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
        return 'border-radius: 0.5rem; background: #8a9a5b; color: #fff; font-weight: 700; cursor: default; padding: 0.35rem 0.75rem; font-size: 0.75rem; border: none; white-space: nowrap; display: inline-block;'
      }
      return 'border-radius: 0.5rem; background: #717b85; color: #fff; font-weight: 700; cursor: default; padding: 0.35rem 0.75rem; font-size: 0.75rem; border: none; white-space: nowrap; display: inline-block;'
    }

    const getStatusLabel = (status: string) => {
      const normalized = status.toLowerCase()
      if (normalized === 'selesai' || normalized === 'done') return 'Selesai'
      if (normalized.includes('belum') || normalized.includes('pending')) return 'Belum Dikerjakan'
      return 'Belum Dikerjakan'
    }

    return () => (
      <section class="pengingat-jadwal-section" style="margin-top: 1.5rem;">
        <h4 style="font-weight: 700; color: #111827; font-size: 1.15rem; margin-bottom: 0.85rem;">Jadwal Rutin</h4>
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
                style="border: 1.5px solid #dce1d0; border-radius: 0.75rem; background: #ffffff; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; transition: all 0.2s ease;"
              >
                {/* Top Section */}
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; border: 1px solid #dce1d0; border-radius: 0.5rem; padding: 0.35rem 0.75rem;">
                    <i class="bi bi-clock"></i>
                    <span style="font-size: 0.75rem; font-weight: 700; color: #111827;">{item.time || '08 : 00 WIB'}</span>
                  </div>
                  <div style={getStatusStyle(item.progress)}>
                    {getStatusLabel(item.progress)}
                  </div>
                </div>

                <hr style="margin: 0; border-color: #dce1d0;" />

                {/* Bottom Section */}
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                  <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <img src={getCropIcon(item.name)} alt={item.name} style="width: 2.8rem; height: 2.8rem; object-fit: contain;" />
                    <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                      <strong style="font-size: 0.95rem; color: #111827; font-weight: 700; line-height: 1.2;">{item.tag}</strong>
                      <span style="font-size: 0.8rem; color: #6b7280; font-weight: 600;">{item.date}</span>
                      <span style="font-size: 0.8rem; color: #6b7280; font-weight: 600;">{displayDetail}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => emit('open-detail', item)}
                    style="background: #2d3a1a; color: #ffffff; padding: 0.55rem 1rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 700; border: none; cursor: pointer; white-space: nowrap;"
                  >
                    Lihat Tugas
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    )
  },
})

