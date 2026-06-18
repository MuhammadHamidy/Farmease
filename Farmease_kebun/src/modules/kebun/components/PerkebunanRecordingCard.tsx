import { defineComponent, computed, ref, onUnmounted } from 'vue'
import { userSession, landSession } from '@/store/navigation'
import PerkebunanCardWrapper from './shared/PerkebunanCardWrapper'
import PerkebunanSelectorCard from './shared/PerkebunanSelectorCard'
import { getJenisIcon } from './shared/pencatatanIcons'

const getLahanIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('alpukat')) return '/icon/alpukat.png'
  if (n.includes('kelengkeng')) return '/icon/kelengkeng.png'
  return '/icon/lahan.png'
}

export default defineComponent({
  name: 'PerkebunanRecordingCard',
  props: {
    selectedJenis: {
      type: String,
      required: true,
    },
    selectedRincian: {
      type: String,
      required: true,
    },
  },
  emits: ['openJenis', 'openRincian', 'next'],
  setup(props, { emit }) {
    const hasSelectedJenis = () => props.selectedJenis !== 'Jenis Pencatatan'
    const hasSelectedRincian = () => props.selectedRincian !== 'Rincian Pencatatan'

    const currentDate = ref(new Date())
    const timerId = setInterval(() => {
      currentDate.value = new Date()
    }, 1000)

    onUnmounted(() => {
      clearInterval(timerId)
    })

    const formattedDate = computed(() => {
      const day = currentDate.value.getDate()
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ]
      const month = months[currentDate.value.getMonth()]
      const year = currentDate.value.getFullYear()
      return `Tanggal : ${day} ${month} ${year}`
    })

    const formattedTime = computed(() => {
      const hour = String(currentDate.value.getHours()).padStart(2, '0')
      const minute = String(currentDate.value.getMinutes()).padStart(2, '0')
      return `${hour}.${minute} WIB`
    })

    return () => (
      <div class="perkebunan-recording-container">
        {/* Main Recording Selection Card */}
        <PerkebunanCardWrapper
          title="Pencatatan Perkebunan"
          subtitle=""
          metaLeft={formattedDate.value}
          metaRight={formattedTime.value}
          isDark={true}
        >
          {/* Lahan & Operator Info Boxes */}
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
            {/* Lahan info */}
            <div style="border: 1.5px solid #dce1d0; border-radius: 0.65rem; background: #fff; padding: 0.75rem 0.85rem; display: flex; align-items: center; gap: 0.65rem;">
              <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <img src={getLahanIcon(landSession.value?.name ?? 'Alpukat')} alt="Lahan" style="width: 1.35rem; height: 1.35rem; object-fit: contain;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.1rem; min-width: 0;">
                <strong style="font-size: 0.92rem; font-weight: 800; color: #111827; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  {landSession.value?.name ?? 'Lahan Alpukat'}
                </strong>
                <span style="font-size: 0.72rem; color: #6b7280;">
                  ID Lahan: {landSession.value?.code ?? 'L001'}
                </span>
              </div>
            </div>
            {/* Operator info */}
            <div style="border: 1.5px solid #dce1d0; border-radius: 0.65rem; background: #fff; padding: 0.75rem 0.85rem; display: flex; align-items: center; gap: 0.65rem;">
              <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <img src="/icon/operator.png" alt="Operator" style="width: 1.35rem; height: 1.35rem; object-fit: contain;" />
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.1rem; min-width: 0;">
                <strong style="font-size: 0.92rem; font-weight: 800; color: #111827; line-height: 1.2;">Operator Kebun</strong>
                <span style="font-size: 0.72rem; color: #6b7280;">
                  ID Pengguna: {userSession.value?.code ?? 'PK001'}
                </span>
              </div>
            </div>
          </div>

          {/* Nested White Box for Pencatatan Selector */}
          <div style="background: #ffffff; border-radius: 0.85rem; padding: 1.25rem 1rem; border: 1.5px solid #dce1d0; margin-top: 1rem;">
            <span style="font-weight: 800; color: #111827; display: block; margin-bottom: 0.75rem; font-size: 1rem;">Pencatatan</span>
            
            <PerkebunanSelectorCard
              label="Pilih jenis pencatatan"
              value={props.selectedJenis}
              iconSrc="/icon/jenis_kebun.png"
              onClick={() => emit('openJenis')}
            />

            <PerkebunanSelectorCard
              label="Pilih rincian pencatatan"
              value={props.selectedRincian}
              iconSrc="/icon/rincian_kebun.png"
              onClick={() => emit('openRincian')}
              disabled={props.selectedJenis === 'Jenis Pencatatan'}
            />

            {/* Selanjutnya Button */}
            {hasSelectedJenis() && hasSelectedRincian() && (
              <button
                class="perkebunan-next-btn"
                onClick={() => emit('next')}
                style="margin-top: 0.75rem; margin-bottom: 0;"
              >
                Selanjutnya
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            )}
          </div>
        </PerkebunanCardWrapper>
      </div>
    )
  },
})
