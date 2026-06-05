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
  name: 'PerkebunanScheduleDetailModal',
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    item: {
      type: Object as PropType<ScheduleItem | null>,
      default: null,
    },
  },
  emits: ['close', 'next'],
  setup(props, { emit }) {
    const getStatusStyle = (status: string) => {
      const normalized = status.toLowerCase()
      if (normalized === 'selesai' || normalized === 'done') {
        return 'background: #6e7a55; color: #fff; font-weight: bold; padding: 0.55rem 1.35rem; font-size: 0.85rem; border-radius: 0.5rem; display: inline-block;'
      }
      return 'background: #2d3a1a; color: #fff; font-weight: bold; padding: 0.55rem 1.35rem; font-size: 0.85rem; border-radius: 0.5rem; display: inline-block;'
    }

    const getStatusLabel = (status: string) => {
      const normalized = status.toLowerCase()
      if (normalized === 'selesai' || normalized === 'done') return 'Selesai'
      if (normalized.includes('belum') || normalized.includes('pending')) return 'Belum Disetujui'
      return 'Kerjakan'
    }

    const getModalButtonLabel = (status: string) => {
      const normalized = status.toLowerCase()
      if (normalized === 'selesai' || normalized === 'done') return 'Selesai'
      if (normalized.includes('belum') || normalized.includes('pending')) return 'Selesai'
      return 'Selanjutnya'
    }

    const getModalButtonStyle = (status: string) => {
      const normalized = status.toLowerCase()
      if (normalized === 'selesai' || normalized === 'done' || normalized.includes('belum') || normalized.includes('pending')) {
        return 'width: 100%; background: #6e7a55; color: #ffffff; border: none; border-radius: 0.5rem; padding: 0.75rem; font-weight: 700; font-size: 1.1rem; cursor: not-allowed; margin-top: 0.35rem; text-align: center;'
      }
      return 'width: 100%; background: #2d3a1a; color: #ffffff; border: none; border-radius: 0.5rem; padding: 0.75rem; font-weight: 700; font-size: 1.1rem; cursor: pointer; margin-top: 0.35rem; text-align: center;'
    }

    const handleButtonClick = () => {
      if (!props.item) return
      const label = getModalButtonLabel(props.item.progress)
      if (label === 'Selesai') {
        emit('close')
      } else {
        emit('next', props.item)
      }
    }

    return () => {
      if (!props.open || !props.item) return null

      const currentItem = props.item
      const isKelengkeng = currentItem.name.toLowerCase().includes('kelengkeng')
      const imageSrc = isKelengkeng ? '/icon/kelengkeng.png' : '/icon/alpukat.png'

      // Extract ID from detail (e.g., "A001 • 3 x sehari" -> "L0001" or parse ID)
      let landId = 'L0001'
      if (currentItem.detail) {
        const firstSegment = (currentItem.detail.split('•')[0] || '').trim()
        if (firstSegment) {
          if (/^[A-Za-z]\d+$/u.test(firstSegment)) {
            landId = 'L' + firstSegment.slice(1)
          } else {
            landId = firstSegment
          }
        }
      }

      return (
        <div
          class="perkebunan-modal-backdrop"
          onClick={() => emit('close')}
          style="align-items: center; justify-content: center; padding: 1rem; overflow-y: auto;"
        >
          <div
            class="perkebunan-record-modal"
            onClick={(e) => e.stopPropagation()}
            style="
              position: relative;
              width: min(100%, 380px);
              border-radius: 1.25rem;
              padding: 1.25rem 1rem;
              overflow-y: auto;
              background: #ffffff;
              max-height: 90vh;
              display: flex;
              flex-direction: column;
              gap: 0.85rem;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
              box-sizing: border-box;
              min-height: auto;
            "
          >
            {/* ── Header Area ── */}
            <div style="display: flex; flex-direction: column; gap: 0.65rem; width: 100%;">
              {/* Close Button X */}
              <button
                onClick={() => emit('close')}
                class="detail-modal-close-btn"
                style="margin-bottom: 0.15rem;"
              >
                <img src="/icon/close-cancel/black-24.svg" alt="Tutup" style="width: 24px; height: 24px; object-fit: contain;" />
              </button>

              {/* Title Header Bar */}
              <div
                style="
                  background: #2d3a1a;
                  color: #ffffff;
                  text-align: center;
                  padding: 0.65rem 1rem;
                  border-radius: 0.5rem;
                  font-weight: 700;
                  font-size: 1.15rem;
                  letter-spacing: 0.01em;
                "
              >
                Detail Jadwal Pengingat
              </div>
            </div>

            {/* ── Card 1: Lahan ── */}
            <div class="detail-modal-card" style="padding: 0.75rem 0.9rem; gap: 0.85rem;">
              <div
                style="
                  width: 2.6rem;
                  height: 2.6rem;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                "
              >
                <img
                  src={imageSrc}
                  alt="Lahan"
                  style="width: 2.4rem; height: 2.4rem; object-fit: contain;"
                />
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                <strong style="font-size: 1.15rem; color: #111827; font-weight: 800;">
                  Lahan {currentItem.name}
                </strong>
                <span style="font-size: 0.8rem; color: #374151; font-weight: 600;">
                  ID Lahan: {landId}
                </span>
              </div>
            </div>

            {/* ── Card 2: Operator ── */}
            <div class="detail-modal-card" style="padding: 0.75rem 0.9rem; gap: 0.85rem;">
              <div
                style="
                  width: 2.6rem;
                  height: 2.6rem;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                "
              >
                <img
                  src="/icon/operator.png"
                  alt="Operator"
                  style="width: 2.4rem; height: 2.4rem; object-fit: contain;"
                />
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                <strong style="font-size: 1.15rem; color: #111827; font-weight: 800;">
                  Operator Kebun
                </strong>
                <span style="font-size: 0.8rem; color: #374151; font-weight: 600;">
                  ID Lahan: {landId}
                </span>
              </div>
            </div>

            {/* ── Container Box with thick green border ── */}
            <div class="detail-modal-green-box" style="border-width: 4px; padding: 0.95rem 0.85rem; gap: 0.85rem;">
              {/* Status Pengingat section */}
              <div style="display: flex; flex-direction: column; gap: 0.35rem; align-items: flex-start;">
                <span style="font-size: 1.1rem; font-weight: 800; color: #111827;">
                  Status Pengingat
                </span>
                <span style={getStatusStyle(currentItem.progress)}>
                  {getStatusLabel(currentItem.progress)}
                </span>
              </div>

              {/* Pencatatan Jadwal Pengingat section */}
              <div style="display: flex; flex-direction: column; gap: 0.55rem;">
                <span style="font-size: 1.1rem; font-weight: 800; color: #111827;">
                  Pencatatan Jadwal Pengingat
                </span>

                {/* Jenis Pencatatan Box */}
                <div class="detail-modal-inner-card" style="padding: 0.55rem 0.75rem; gap: 0.65rem;">
                  <div
                    style="
                      width: 2rem;
                      height: 2rem;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-shrink: 0;
                    "
                  >
                    <img src="/icon/calender.png" alt="Jenis" style="width: 1.35rem; height: 1.35rem; object-fit: contain;" />
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                    <span style="font-size: 0.7rem; color: #6b7280; font-weight: 600;">
                      Pilih jenis pencatatan
                    </span>
                    <strong style="font-size: 1.05rem; color: #111827; font-weight: 800;">
                      {currentItem.tag || 'Jenis Pencatatan'}
                    </strong>
                  </div>
                </div>

                {/* Deskripsi Tugas Box */}
                <div
                  style="
                    border: 1.5px solid #dce1d0;
                    border-radius: 0.6rem;
                    padding: 0.55rem 0.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                  "
                >
                  <span style="font-size: 0.7rem; color: #6b7280; font-weight: 600;">
                    Deskripsi Tugas
                  </span>
                  <strong style="font-size: 1.05rem; color: #111827; font-weight: 800;">
                    {currentItem.description || 'Berikan pupuk kandang'}
                  </strong>
                </div>
              </div>

              {/* Selanjutnya / Selesai Button */}
              <button
                onClick={handleButtonClick}
                style={getModalButtonStyle(currentItem.progress)}
                disabled={currentItem.progress.toLowerCase().includes('belum') || currentItem.progress.toLowerCase() === 'selesai' || currentItem.progress.toLowerCase() === 'done'}
              >
                {getModalButtonLabel(currentItem.progress)}
              </button>
            </div>
          </div>
        </div>
      )
    }
  }
})
