import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { landSession, userSession, cropsList, fetchCropsList } from '@/store/navigation'
import { perawatan, panen, aktivitas, fetchPerawatan, fetchPanen, fetchAktivitas } from '@/store/gardening'
import { pohonApi } from '@/shared/api'
import PerkebunanFormSelect from '@/modules/kebun/components/shared/PerkebunanFormSelect'
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css'

export default defineComponent({
  name: 'DetailPohonPage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const isEditPopupOpen = ref(false)

    // Form fields for edit popup (Removed draftUmur)
    const draftKode = ref('')
    const draftFase = ref('Vegetatif')
    const draftNama = ref('')
    const draftTanggal = ref('')
    const draftWaktu = ref('10:30')
    const draftDeskripsi = ref('Pupuk bagus')
    const draftStatusPohon = ref('aktif')

    onMounted(async () => {
      await Promise.all([
        fetchCropsList(),
        fetchPerawatan(),
        fetchPanen(),
        fetchAktivitas()
      ])
    })

    // Find active tree from cropsList using the parameter code
    const activeTree = computed(() => {
      return cropsList.value.find(c => c.code === route.params.code)
    })

    const isAlpukat = computed(() => {
      const name = landSession.value?.name || ''
      return name.toLowerCase().includes('alpukat')
    })

    const openEditPopup = () => {
      if (activeTree.value) {
        const tree = activeTree.value
        draftKode.value = tree.code || ''
        draftFase.value = tree.type || 'Vegetatif'
        draftNama.value = tree.name || ''
        draftStatusPohon.value = (tree as any).status_pohon || 'aktif'
        
        // Format date string from rawDate (YYYY-MM-DD)
        if (tree.rawDate) {
          draftTanggal.value = tree.rawDate.split('T')[0]
        } else {
          draftTanggal.value = new Date().toISOString().split('T')[0]
        }
      }
      isEditPopupOpen.value = true
    }

    const saveTreeDetails = async () => {
      if (!activeTree.value) return
      try {
        // Calculate age automatically from the planting date
        const plantedYear = new Date(draftTanggal.value).getFullYear()
        const currentYear = new Date().getFullYear()
        const calculatedAge = Math.max(1, currentYear - plantedYear)

        await pohonApi.update(activeTree.value.id!, {
          id: activeTree.value.id,
          kode_pohon: draftKode.value,
          status: draftFase.value,
          nama_pohon: draftNama.value,
          jenis: draftNama.value,
          umur: calculatedAge,
          created_at: draftTanggal.value,
          id_lahan: (activeTree.value as any).id_lahan,
          status_pohon: draftStatusPohon.value
        })

        // Update local object states
        activeTree.value.code = draftKode.value
        activeTree.value.type = draftFase.value
        activeTree.value.name = draftNama.value
        ;(activeTree.value as any).status_pohon = draftStatusPohon.value
        ;(activeTree.value as any).rawAge = calculatedAge
        ;(activeTree.value as any).rawDate = draftTanggal.value
        activeTree.value.age = String(calculatedAge) + ' Tahun'
        
        // Update globally in cropsList
        const match = cropsList.value.find(c => c.id === activeTree.value!.id)
        if (match) {
          match.code = draftKode.value
          match.type = draftFase.value
          match.name = draftNama.value
          match.age = String(calculatedAge) + ' Tahun'
          ;(match as any).status_pohon = draftStatusPohon.value
          ;(match as any).rawAge = calculatedAge
          ;(match as any).rawDate = draftTanggal.value
        }
        
        isEditPopupOpen.value = false
        
        // If the tree code changed, navigate to the updated URL parameter to prevent breaking links
        if (route.params.code !== draftKode.value) {
          router.replace({ name: 'kebun-detail-pohon', params: { code: draftKode.value } })
        }
      } catch (err) {
        console.error('Failed to update tree details:', err)
        alert('Gagal memperbarui rincian pohon. Pastikan backend terhubung.')
      }
    }

    const formatIndoDate = (dateStr: string) => {
      if (!dateStr) return '-'
      try {
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr))
      } catch {
        return dateStr
      }
    }

    // --- Unified History Filtering Logic ---
    const activeTreeCode = computed(() => activeTree.value?.code ?? '')

    const riwayatAktivitas = computed(() => {
      const code = activeTreeCode.value
      const list: any[] = []

      // 1. Perawatan
      perawatan.value.forEach(p => {
        if (p.pohon_id === code) {
          const typeLower = p.type.toLowerCase()
          if (typeLower.includes('stok') || typeLower.includes('pengolahan')) return

          list.push({
            id: 'perawatan-' + p.id,
            tanggal: p.date,
            kegiatan: p.type,
            catatan: p.notes,
            badgeText: p.type.includes('Obat') ? 'Pemberian Obat' : 'Perawatan'
          })
        }
      })

      // 2. Panen
      panen.value.forEach(pa => {
        if (pa.pohon_id === code) {
          list.push({
            id: 'panen-' + pa.id,
            tanggal: pa.date,
            kegiatan: 'Panen Buah',
            catatan: `Jumlah: ${pa.quantity} kg • Kualitas: ${pa.quality || 'Bagus'}`,
            badgeText: 'Panen'
          })
        }
      })

      // 3. Aktivitas
      aktivitas.value.forEach(a => {
        if (a.pohon_id === code) {
          const nameLower = a.name.toLowerCase()
          if (nameLower.includes('stok') || nameLower.includes('pengolahan')) return

          // Avoid duplicates if already added via perawatan/panen
          const isDup = list.some(item => item.tanggal === a.date && item.kegiatan === a.name)
          if (!isDup) {
            list.push({
              id: 'aktivitas-' + a.id,
              tanggal: a.date,
              kegiatan: a.name,
              catatan: a.type || 'Selesai',
              badgeText: a.name
            })
          }
        }
      })

      // Sort by date descending
      return list.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    })

    return () => {
      if (!activeTree.value) {
        return (
          <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Nunito', sans-serif; background: #f5f5f0;">
            <p style="font-weight: 700; color: #374151;">Memuat rincian pohon...</p>
          </div>
        )
      }

      const currentTree = activeTree.value

      return (
        <div class="pencatatan-page" style="font-family: 'Nunito', sans-serif; padding: 1rem; box-sizing: border-box; width: 100%;">
          <div style="max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 1rem;">
            
            {/* Top Navigation */}
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <button
                type="button"
                onClick={() => router.back()}
                class="pencatatan-back-btn"
                style="background: #38431f;"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                Kembali
              </button>
            </div>

            {/* Title Section */}
            <div>
              <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800; color: #1f2937; display: flex; align-items: center; gap: 0.65rem;">
                Detail Pohon: {currentTree.code}
                <span
                  style={`
                    font-size: 0.72rem;
                    font-weight: 800;
                    padding: 0.2rem 0.65rem;
                    border-radius: 6px;
                    ${currentTree.type === 'Generatif' ? 'background: #fde8e8; color: #e11d48;' : 'background: #38431f; color: #ffffff;'}
                  `}
                >
                  {currentTree.type}
                </span>
              </h2>
            </div>

            {/* Tree details Info Card (Stacked at top) */}
            <div
              style="
                background: #ffffff;
                border-radius: 0.85rem;
                padding: 1.25rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                display: flex;
                flex-direction: column;
                gap: 1rem;
              "
            >
              <div style="display: flex; align-items: center; gap: 0.85rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 0.85rem;">
                <div style="width: 3rem; height: 3rem; background: #f6f8ee; border-radius: 0.6rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img
                    src={isAlpukat.value ? '/icon/alpukat.png' : '/icon/kelengkeng.png'}
                    alt="Crop Icon"
                    style="width: 2rem; height: 2rem; object-fit: contain;"
                  />
                </div>
                <div>
                  <strong class="pencatatan-info-card__title">
                    {landSession.value?.name || 'Lahan Alpukat'}
                  </strong>
                  <span class="pencatatan-info-card__subtitle">
                    ID Lahan: {landSession.value?.code || 'L001'}
                  </span>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h4 style="margin: 0; font-size: 0.9rem; font-weight: 800; color: #1f2937;">
                  Informasi Lengkap Tanaman
                </h4>
                
                <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.82rem; font-weight: 700; color: #4b5563;">
                  <div style="display: flex; justify-content: space-between; padding: 0.45rem 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="color: #9ca3af;">Kode Pohon</span>
                    <span style="color: #1f2937; font-weight: 800;">{currentTree.code}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 0.45rem 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="color: #9ca3af;">Nama/Varietas</span>
                    <span style="color: #1f2937; font-weight: 800;">{currentTree.name || 'Alpukat Mentega'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 0.45rem 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="color: #9ca3af;">Fase Tanaman</span>
                    <span style="color: #1f2937; font-weight: 800;">{currentTree.type}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 0.45rem 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="color: #9ca3af;">Status Pohon</span>
                    <span style="color: #1f2937; font-weight: 800; text-transform: capitalize;">
                      {(currentTree as any).status_pohon || 'aktif'}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 0.45rem 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="color: #9ca3af;">Tanggal Penanaman</span>
                    <span style="color: #1f2937;">{formatIndoDate(currentTree.rawDate) || '10 April 2026'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 0.45rem 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="color: #9ca3af;">Waktu Penanaman</span>
                    <span style="color: #1f2937;">10:30 WIB</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 0.45rem 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="color: #9ca3af;">Estimasi Umur</span>
                    <span style="color: #1f2937;">{currentTree.age || '3 Tahun'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 0.45rem 0;">
                    <span style="color: #9ca3af;">ID Pengguna</span>
                    <span style="color: #1f2937;">{userSession.value?.code || 'PK001'}</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.4rem; border-top: 1px solid #f3f4f6; padding-top: 0.85rem; margin-bottom: 0.4rem;">
                <h4 style="margin: 0; font-size: 0.9rem; font-weight: 800; color: #1f2937;">
                  Catatan/Deskripsi
                </h4>
                <div
                  style="
                    background: #fafafa;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    padding: 0.65rem;
                    font-size: 0.82rem;
                    color: #4b5563;
                    line-height: 1.4;
                  "
                >
                  {draftDeskripsi.value}
                </div>
              </div>

              <button
                type="button"
                onClick={openEditPopup}
                class="pencatatan-primary-btn"
                style="background: #38431f; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/>
                </svg>
                Edit Informasi
              </button>
            </div>

            {/* Riwayat Aktivitas (Unified and Stacked directly below) */}
            <div
              style="
                background: #ffffff;
                border-radius: 0.85rem;
                padding: 1.25rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                display: flex;
                flex-direction: column;
                gap: 0.85rem;
                width: 100%;
                box-sizing: border-box;
              "
            >
              <h3 style="margin: 0; font-size: 1rem; font-weight: 800; color: #1f2937; border-bottom: 2px solid #38431f; padding-bottom: 0.4rem; width: fit-content;">
                Riwayat Aktivitas
              </h3>
              
              <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                {riwayatAktivitas.value.length === 0 ? (
                  <div style="color: #9ca3af; font-size: 0.82rem; padding: 0.25rem 0;">
                    Belum ada riwayat aktivitas untuk pohon ini.
                  </div>
                ) : (
                  riwayatAktivitas.value.map(item => (
                    <div
                      key={item.id}
                      style="
                        border: 1px solid #e5e7eb;
                        border-radius: 0.55rem;
                        padding: 0.75rem;
                        display: flex;
                        flex-direction: column;
                        gap: 0.35rem;
                        background: #fafafa;
                      "
                    >
                      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.25rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          <strong style="font-size: 0.85rem; color: #1f2937; font-weight: 800;">
                            {item.kegiatan}
                          </strong>
                          <span style="background: #e2e8f0; color: #475569; font-size: 0.65rem; font-weight: 800; padding: 0.1rem 0.4rem; border-radius: 4px;">
                            {item.badgeText}
                          </span>
                        </div>
                        <span style="font-size: 0.7rem; color: #6b7280; font-weight: 700;">
                          {formatIndoDate(item.tanggal)}
                        </span>
                      </div>
                      <p style="margin: 0; font-size: 0.78rem; color: #4b5563; line-height: 1.45;">
                        {item.catatan}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Edit Informasi Popup Modal */}
            {isEditPopupOpen.value && (
              <div
                class="rincian-sheet-overlay"
                onClick={() => { isEditPopupOpen.value = false }}
              >
                <div
                  class="rincian-sheet"
                  style="width: min(100%, 420px); padding: 1.25rem;"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style="margin: 0 0 1rem; font-size: 1.1rem; font-weight: 800; color: #1f2937; text-align: center;">
                    Edit Informasi Pohon
                  </h3>

                  <div style="display: flex; flex-direction: column; gap: 0.75rem; text-align: left; overflow-y: auto; max-height: 60vh; padding-right: 2px;">
                    
                    {/* Kode Pohon */}
                    <div class="form-group">
                      <label class="field-label">Kode Pohon</label>
                      <input
                        type="text"
                        value={draftKode.value}
                        onInput={(e: any) => { draftKode.value = e.target.value }}
                        class="kebun-form-input"
                      />
                    </div>

                    {/* Nama/Varietas */}
                    <div class="form-group">
                      <label class="field-label">Nama/Varietas</label>
                      <input
                        type="text"
                        value={draftNama.value}
                        onInput={(e: any) => { draftNama.value = e.target.value }}
                        class="kebun-form-input"
                      />
                    </div>

                    {/* Fase Tanaman */}
                    <div class="form-group">
                      <label class="field-label">Fase Tanaman</label>
                      <PerkebunanFormSelect
                        modelValue={draftFase.value}
                        onUpdate:modelValue={(val: string) => { draftFase.value = val }}
                        options={[
                          { value: 'Vegetatif', label: 'Vegetatif' },
                          { value: 'Generatif', label: 'Generatif' },
                        ]}
                      />
                    </div>

                    {/* Status Pohon */}
                    <div class="form-group">
                      <label class="field-label">Status Pohon</label>
                      <PerkebunanFormSelect
                        modelValue={draftStatusPohon.value}
                        onUpdate:modelValue={(val: string) => { draftStatusPohon.value = val }}
                        options={[
                          { value: 'aktif', label: 'Aktif' },
                          { value: 'tidak aktif', label: 'Tidak Aktif' },
                        ]}
                      />
                    </div>

                    {/* Tanggal Penanaman */}
                    <div class="form-group">
                      <label class="field-label">Tanggal Penanaman</label>
                      <input
                        type="date"
                        value={draftTanggal.value}
                        onChange={(e: any) => { draftTanggal.value = e.target.value }}
                        class="kebun-form-input"
                      />
                    </div>

                    {/* Deskripsi */}
                    <div class="form-group">
                      <label class="field-label">Deskripsi/Catatan</label>
                      <textarea
                        rows={2}
                        value={draftDeskripsi.value}
                        onInput={(e: any) => { draftDeskripsi.value = e.target.value }}
                        class="kebun-form-input kebun-form-input--textarea"
                      />
                    </div>
                  </div>

                  <div style="display: flex; gap: 0.5rem; margin-top: 1.25rem;">
                    <button
                      type="button"
                      onClick={() => { isEditPopupOpen.value = false }}
                      class="pencatatan-mode-btn"
                      style="flex: 1; justify-content: center; height: 38px; margin: 0; box-shadow: none;"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={saveTreeDetails}
                      class="pencatatan-primary-btn"
                      style="flex: 1; height: 38px; padding: 0; display: flex; align-items: center; justify-content: center; background: #38431f;"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )
    }
  }
})
