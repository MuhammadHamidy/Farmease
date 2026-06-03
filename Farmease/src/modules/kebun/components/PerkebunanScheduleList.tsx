import { defineComponent, ref } from 'vue'
import type { PropType } from 'vue'
import { getJenisIcon } from './shared/pencatatanIcons'

type ScheduleItem = {
  name: string
  tag: string
  date: string
  detail: string
  progress: string
}

export default defineComponent({
  name: 'PerkebunanScheduleList',
  props: {
    items: {
      type: Array as PropType<ScheduleItem[]>,
      required: true,
    },
  },
  emits: ['work'],
  setup(props, { emit }) {
    // Keep local completion states to toggle button between "Kerjakan" and "Selesai"
    const completedItems = ref<Record<string, boolean>>({})

    const toggleComplete = (item: ScheduleItem, index: number) => {
      const key = `${item.name}-${index}`
      completedItems.value[key] = !completedItems.value[key]
      emit('work', item)
    }

    return () => (
      <section class="pengingat-jadwal-section" style="margin-top: 1.5rem;">
        <h4 style="font-weight: 700; color: #111827; font-size: 1.15rem; margin-bottom: 0.85rem;">Pengingat Jadwal Terkini</h4>
        <div class="reminder-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 0.75rem;">
          {props.items.map((item, index) => {
            const key = `${item.name}-${index}`
            const isCompleted = completedItems.value[key]

            // Clean up detail text to look like mockup 5: "Gulma • 3 x sehari"
            let displayDetail = item.detail
            if (item.tag.toLowerCase().includes('perawatan')) {
              displayDetail = 'Gulma • 3 x sehari'
            } else if (item.tag.toLowerCase().includes('pemangkasan')) {
              // Extract the land code and make it look like: "L2002 • 3 x sehari"
              const parts = item.detail.split('•')
              const landCode = parts[parts.length - 1]?.trim() ?? 'L2002'
              displayDetail = `${landCode} • 3 x sehari`
            }

            return (
              <div
                key={key}
                class="reminder-card"
                style="border: 1.5px solid #dce1d0; border-radius: 0.75rem; background: #ffffff; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; transition: all 0.2s ease;"
              >
                <div class="reminder-top" style="display: flex; justify-content: space-between; align-items: center;">
                  <span
                    class="reminder-tag"
                    style="background: #38431f; color: #ffffff; padding: 0.22rem 0.65rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;"
                  >
                    {item.tag}
                  </span>
                  <span class="reminder-date" style="font-size: 0.75rem; color: #6b7280;">{item.date}</span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <img src={getJenisIcon(item.tag)} alt={item.tag} style="width: 1.3rem; height: 1.3rem;" />
                    </div>
                    <div style="display: flex; flex-direction: column;">
                      <strong style="font-size: 1rem; color: #111827; font-weight: 700;">{item.name}</strong>
                      <span style="font-size: 0.78rem; color: #6b7280;">{displayDetail}</span>
                    </div>
                  </div>

                  <button
                    class="btn-primary"
                    onClick={() => toggleComplete(item, index)}
                    style={`border-radius: 9999px; background: #38431f; font-weight: bold; cursor: pointer; padding: 0.45rem 1.15rem; font-size: 0.85rem; border: none; white-space: nowrap; ${
                      isCompleted ? 'opacity: 0.6;' : ''
                    }`}
                  >
                    {isCompleted ? 'Kerjakan' : 'Selesai'}
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
