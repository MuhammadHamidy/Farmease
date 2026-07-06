import { defineComponent, computed } from 'vue'
import type { PropType } from 'vue'
import { userSession, landSession } from '@/store/navigation'

type ScheduleItem = {
  name: string
  tag: string
  date: string
  detail: string
  progress: string
  description?: string
  rincian?: string
  dueDate?: string
  dueTime?: string
  endTime?: string
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
    const currentProgress = computed(() => {
      if (!props.item) return 'Kerjakan'
      const progress = props.item.progress.toLowerCase()
      if (progress === 'selesai' || progress === 'done') return 'Selesai'
      if (progress.includes('belum') || progress.includes('pending')) return 'Belum Disetujui'

      // Check if it's late (terlambat) dynamically based on deadline
      const now = new Date()
      const localYear = now.getFullYear()
      const localMonth = String(now.getMonth() + 1).padStart(2, '0')
      const localDay = String(now.getDate()).padStart(2, '0')
      const todayStr = `${localYear}-${localMonth}-${localDay}`
      const hours = String(now.getHours()).padStart(2, '0')
      const mins = String(now.getMinutes()).padStart(2, '0')
      const currentTimeStr = `${hours}:${mins}`

      const itemVal = props.item as any
      const dueDate = itemVal.dueDate
      const dueTime = itemVal.dueTime
      const endTime = itemVal.endTime

      if (dueDate && dueDate < todayStr) {
        return 'Terlambat'
      } else if (dueDate === todayStr) {
        const deadline = (endTime && endTime.trim()) ? endTime.trim() : dueTime
        if (deadline && currentTimeStr > deadline) {
          return 'Terlambat'
        }
      }
      return 'Kerjakan'
    })

    const getStatusStyle = (status: string) => {
      const normalized = status.toLowerCase()
      if (normalized === 'selesai' || normalized === 'done') {
        return 'background: #6e7a55; color: #fff; font-weight: bold; padding: 0.55rem 1.35rem; font-size: 0.85rem; border-radius: 0.5rem; display: inline-block;'
      }
      if (normalized === 'terlambat') {
        return 'background: #ef4444; color: #fff; font-weight: bold; padding: 0.55rem 1.35rem; font-size: 0.85rem; border-radius: 0.5rem; display: inline-block;'
      }
      return 'background: #2d3a1a; color: #fff; font-weight: bold; padding: 0.55rem 1.35rem; font-size: 0.85rem; border-radius: 0.5rem; display: inline-block;'
    }

    const getStatusLabel = (status: string) => {
      const normalized = status.toLowerCase()
      if (normalized === 'selesai' || normalized === 'done') return 'Selesai'
      if (normalized.includes('belum') || normalized.includes('pending')) return 'Belum Disetujui'
      if (normalized === 'terlambat') return 'Terlambat'
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
        return 'width: 100%; background: #6e7a55; color: #ffffff; border: none; border-radius: 2rem; padding: 0.75rem; font-weight: 700; font-size: 1.1rem; cursor: not-allowed; margin-top: 0.35rem; text-align: center; height: 42px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.15);'
      }
      return 'width: 100%; background: #233512; color: #ffffff; border: none; border-radius: 2rem; padding: 0.75rem; font-weight: 700; font-size: 1.1rem; cursor: pointer; margin-top: 0.35rem; text-align: center; height: 42px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.15);'
    }

    const handleButtonClick = () => {
      if (!props.item) return
      const label = getModalButtonLabel(currentProgress.value)
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

      let landId = 'L001'
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
            <div style="display: flex; flex-direction: column; width: 100%;">
              {/* Close Button X */}
              <div style="display: flex; justify-content: flex-start; margin-bottom: 0.5rem; width: 100%;">
                <button
                  onClick={() => emit('close')}
                  style="
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.6rem;
                    font-weight: bold;
                    color: #000000;
                    padding: 0.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    line-height: 1;
                  "
                >
                  ✕
                </button>
              </div>

              {/* Title Header Bar */}
              <div
                style="
                  background: #233512;
                  color: #ffffff;
                  text-align: center;
                  padding: 0.65rem 1rem;
                  border-radius: 0.5rem;
                  font-weight: 800;
                  font-size: 1.15rem;
                  letter-spacing: 0.01em;
                  margin-bottom: 1rem;
                  width: 100%;
                  box-sizing: border-box;
                "
              >
                Jadwal Rutin
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
                  {landSession.value?.name || `Lahan ${currentItem.name}`}
                </strong>
                <span style="font-size: 0.8rem; color: #374151; font-weight: 600;">
                  ID Lahan: {landSession.value?.code || landId}
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
                  {userSession.value?.name || 'Operator Kebun'}
                </strong>
                <span style="font-size: 0.8rem; color: #374151; font-weight: 600;">
                  ID Pengguna: {userSession.value?.code || 'OP002'}
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
                <span style={getStatusStyle(currentProgress.value)}>
                  {getStatusLabel(currentProgress.value)}
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
                    <img src="/icon/jenis_kebun.png" alt="Jenis" style="width: 1.35rem; height: 1.35rem; object-fit: contain;" />
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

                {/* Rincian Pencatatan Box */}
                {currentItem.rincian && (
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
                      <img src="/icon/rincian_kebun.png" alt="Rincian" style="width: 1.35rem; height: 1.35rem; object-fit: contain;" />
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                      <span style="font-size: 0.7rem; color: #6b7280; font-weight: 600;">
                        Rincian Pencatatan
                      </span>
                      <strong style="font-size: 1.05rem; color: #111827; font-weight: 800;">
                        {currentItem.rincian}
                      </strong>
                    </div>
                  </div>
                )}

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
                    {currentItem.description || ''}
                  </strong>
                </div>
              </div>

              {/* Selanjutnya / Selesai Button */}
              <button
                onClick={handleButtonClick}
                style={getModalButtonStyle(currentProgress.value)}
                disabled={currentProgress.value.toLowerCase().includes('belum') || currentProgress.value.toLowerCase() === 'selesai' || currentProgress.value.toLowerCase() === 'done'}
              >
                {getModalButtonLabel(currentProgress.value)}
              </button>
            </div>
          </div>
        </div>
      )
    }
  }
})
