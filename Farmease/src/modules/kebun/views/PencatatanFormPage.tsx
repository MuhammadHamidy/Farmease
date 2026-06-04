import { defineComponent, computed, ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userSession } from '@/store/navigation'
import PerkebunanCardWrapper from '../components/shared/PerkebunanCardWrapper'
import KebunPanenForm from '../components/pencatatan/KebunPanenForm'
import KebunGenericFormFields from '../components/pencatatan/KebunGenericFormFields'

const getLahanIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('alpukat')) return '/icon/alpukat.png'
  if (n.includes('kelengkeng')) return '/icon/kelengkeng.png'
  return '/icon/lahan.png'
}

export default defineComponent({
  name: 'PencatatanFormPage',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const selectedJenis = computed(() => (route.query.jenis as string) || 'Jenis Pencatatan')
    const selectedRincian = computed(() => (route.query.rincian as string) || 'Rincian Pencatatan')

    const activeMode = ref<'lahan' | 'pohon'>('pohon') // Default to 'pohon' (Per Pohon)

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

    const kindTitle = computed(() => {
      if (selectedJenis.value === 'Jenis Pencatatan') return ''
      const lower = selectedJenis.value.toLowerCase()
      if (lower.includes('perawatan') || lower.includes('hama') || lower.includes('penyakit')) {
        return 'Pemberian Obat'
      }
      return selectedJenis.value.replace(/^Pencatatan\s+/u, '')
    })

    const formState = ref({
      kodePohon: 'LA001',
      deskripsiPenanaman: '',
      jumlahPemangkasan: '',
      deskripsiPemangkasan: '',
      jenisObat: 'Jenis Obat',
      kodePohonPerawatan: 'Kode Pohon',
      bagianPohon: 'Bagian Pohon',
      teknikPemberian: 'Teknik Pemberian Obat',
      namaObat: '',
      dosisObat: '',
      deskripsiPerawatan: '',
      jenisPupuk: 'Jenis Pupuk',
      fasePohon: 'Fase Pohon',
      kodePohonPemupukan: 'Kode Pohon',
      jumlahBeratPupuk: '',
      deskripsiPemupukan: '',
      jumlahPanen: '',
      beratPanen: '',
      deskripsiPanen: '',
      deskripsiPembersihan: '',
    })

    const saveRecording = () => {
      alert(`Catatan Perkebunan (${selectedJenis.value} - ${activeMode.value === 'pohon' ? 'Per Pohon' : 'Per Lahan'}) Berhasil Disimpan!`)
      router.push({ name: 'kebun' })
    }

    const goBack = () => {
      router.push({ name: 'kebun' })
    }

    return () => (
      <div class="perkebunan-page">

        <div class="perkebunan-shell">
          {/* Top bar */}
          <div class="masuk-lahan-topbar" style="padding: 1rem 1.5rem 0.5rem; display: flex; align-items: center; justify-content: space-between;">
            <button
              onClick={goBack}
              class="pencatatan-back-btn"
            >
              <img src="/icon/left-row.png" alt="Kembali" style="width: 14px; height: 14px; object-fit: contain; filter: brightness(0) invert(1);" />
              Kembali
            </button>
            <img src="/icon/logo_farmease.png" alt="FARMease" class="masuk-lahan-logo" style="height: 2.2rem;" />
          </div>

          <div style="margin-top: 1rem; padding: 0 1.5rem 3rem;">
            {kindTitle.value === 'Panen' ? (
              <KebunPanenForm
                form={formState.value}
                activeMode={activeMode.value}
                onUpdate:activeMode={(val: 'lahan' | 'pohon') => { activeMode.value = val }}
                onSave={saveRecording}
              />
            ) : (
              <PerkebunanCardWrapper
                title={kindTitle.value}
                subtitle={selectedJenis.value}
                metaLeft={formattedDate.value}
                metaRight={selectedRincian.value}
              >
                {/* Lahan & Operator Info */}
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
                  <div style="border: 1.5px solid #dce1d0; border-radius: 0.65rem; background: #fff; padding: 0.75rem 0.85rem; display: flex; align-items: center; gap: 0.65rem;">
                    <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <img src="/icon/lahan.png" alt="Lahan" style="width: 1.35rem; height: 1.35rem; object-fit: contain;" />
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.1rem; min-width: 0;">
                      <strong style="font-size: 0.92rem; font-weight: 800; color: #111827; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        Lahan Alpukat
                      </strong>
                      <span style="font-size: 0.72rem; color: #6b7280;">
                        ID Lahan: L0001
                      </span>
                    </div>
                  </div>
                  <div style="border: 1.5px solid #dce1d0; border-radius: 0.65rem; background: #fff; padding: 0.75rem 0.85rem; display: flex; align-items: center; gap: 0.65rem;">
                    <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <img src="/icon/Group.png" alt="Operator" style="width: 1.35rem; height: 1.35rem; object-fit: contain;" />
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.1rem; min-width: 0;">
                      <strong style="font-size: 0.92rem; font-weight: 800; color: #111827; line-height: 1.2;">Operator Kebun</strong>
                      <span style="font-size: 0.72rem; color: #6b7280;">
                        ID Pengguna: {userSession.value?.code ?? 'PK0001'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Segmented Toggle Control for Per Lahan vs Per Pohon */}
                <div style="margin-bottom: 1.5rem;">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.55rem;">Metode Pencatatan</span>
                  <div style="display: flex; background: #f4f5f0; padding: 0.3rem; border-radius: 9999px;">
                    <button
                      type="button"
                      onClick={() => { activeMode.value = 'lahan' }}
                      style={`
                        flex: 1;
                        padding: 0.65rem;
                        border: none;
                        border-radius: 9999px;
                        font-size: 0.88rem;
                        font-weight: 800;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        background: ${activeMode.value === 'lahan' ? '#38431f' : 'transparent'};
                        color: ${activeMode.value === 'lahan' ? '#ffffff' : '#4b5563'};
                      `}
                    >
                      Per Lahan
                    </button>
                    <button
                      type="button"
                      onClick={() => { activeMode.value = 'pohon' }}
                      style={`
                        flex: 1;
                        padding: 0.65rem;
                        border: none;
                        border-radius: 9999px;
                        font-size: 0.88rem;
                        font-weight: 800;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        background: ${activeMode.value === 'pohon' ? '#38431f' : 'transparent'};
                        color: ${activeMode.value === 'pohon' ? '#ffffff' : '#4b5563'};
                      `}
                    >
                      Per Pohon
                    </button>
                  </div>
                </div>

                {/* Dynamic Form Fields */}
                <KebunGenericFormFields
                  kindTitle={kindTitle.value}
                  form={formState.value}
                  activeMode={activeMode.value}
                />

                {/* General Simpan Button */}
                <button
                  class="btn-primary"
                  style="width: 100%; border-radius: 9999px; background: #38431f; font-weight: bold; cursor: pointer; margin-top: 1rem;"
                  onClick={saveRecording}
                >
                  Simpan Catatan
                </button>
              </PerkebunanCardWrapper>
            )}
          </div>
        </div>
      </div>
    )
  }
})
