import { defineComponent, computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userSession, landSession } from '@/store/navigation'
import KebunGenericFormFieldsRaw from '../components/pencatatan/KebunGenericFormFields'
import PerkebunanBackButton from '../components/shared/PerkebunanBackButton'
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css'

const KebunGenericFormFields = KebunGenericFormFieldsRaw as any

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
      metodePemangkasan: 'Metode Pemangkasan',
      tujuanPemanfaatan: 'Pemanfaatan',
      jenisPupukDetail: 'Jenis Pupuk Detail',
      teknikPemupukan: 'Teknik Pemupukan',
      jenisLimbah: 'Jenis Limbah',
      beratLimbah: '',
      jenisPerangsang: 'Jenis Perangsang',
      dosisPerangsang: '',
      deskripsiPembuahan: '',
      alasanPenanaman: 'Alasan Penanaman',
      kodePohonManual: '',
      teknikPengendalian: 'Teknik Pengendalian',
      namaPestisida: '',
      dosisPestisida: '',
      volumeAir: '',
      namaGejala: '',
      targetHama: '',
    })

    // Trees selection state for "Per Pohon"
    const selectedVarietas = ref('Semua Varietas')
    const selectedTrees = ref<string[]>(['LA001'])
    const hoveredTree = ref<string | null>(null)
    const isVarietasDropdownOpen = ref(false)

    const trees = [
      { code: 'LA001', varietas: 'Alpukat Aligator' },
      { code: 'LA002', varietas: 'Alpukat Aligator' },
      { code: 'LA003', varietas: 'Alpukat Aligator' },
      { code: 'LA004', varietas: 'Alpukat Aligator' },
      { code: 'LA005', varietas: 'Alpukat Aligator' },
      { code: 'LA006', varietas: 'Alpukat Miki' },
      { code: 'LA007', varietas: 'Alpukat Miki' },
      { code: 'LA008', varietas: 'Alpukat Miki' },
      { code: 'LA009', varietas: 'Alpukat Miki' },
      { code: 'LA010', varietas: 'Alpukat Miki' },
      { code: 'LA011', varietas: 'Alpukat Markus' },
      { code: 'LA012', varietas: 'Alpukat Markus' },
      { code: 'LA013', varietas: 'Alpukat Markus' },
      { code: 'LA014', varietas: 'Alpukat Kelud' },
      { code: 'LA015', varietas: 'Alpukat Kelud' },
    ]

    const varietasOptions = [
      'Semua Varietas',
      'Alpukat Aligator',
      'Alpukat Miki',
      'Alpukat Markus',
      'Alpukat Kelud',
    ]

    const filteredTrees = computed(() => {
      if (selectedVarietas.value === 'Semua Varietas') return trees
      return trees.filter(tree => tree.varietas === selectedVarietas.value)
    })

    const toggleTreeSelection = (code: string) => {
      if (selectedTrees.value.includes(code)) {
        selectedTrees.value = selectedTrees.value.filter(c => c !== code)
      } else {
        selectedTrees.value.push(code)
      }
      formState.value.kodePohon = selectedTrees.value.join(', ')
    }

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.custom-dropdown-container')) {
        isVarietasDropdownOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleDocumentClick)
      formState.value.kodePohon = selectedTrees.value.join(', ')
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleDocumentClick)
    })

    const saveRecording = () => {
      alert(`Catatan Perkebunan (${selectedJenis.value} - ${activeMode.value === 'pohon' ? 'Per Pohon' : 'Per Lahan'}) Berhasil Disimpan!`)

      if (kindTitle.value === 'Pemangkasan') {
        const weight = parseFloat(formState.value.jumlahPemangkasan)
        if (!isNaN(weight) && weight > 0) {
          try {
            // 1. Save pruning record to backend
            await pemangkasanApi.create({
              Aktivitas_id_aktivitas: 1,
              tanggal_aktivitas: new Date().toISOString().split('T')[0],
              nama_jenis_aktivitas: 'Pemangkasan',
              nama_rincian_aktivitas: selectedRincian.value,
              jumlah: String(weight),
              satuan: 'kg',
              keterangan: formState.value.deskripsiPemangkasan || 'Pemangkasan rutin',
              Lahan_id_lahan: 1,
            } as any);
            console.log(`Saved pruning record to backend: ${selectedRincian.value} (${weight} kg)`);

            // 2. Sync feed stock to backend (decoupled, using separate feeds API endpoints)
            let feedName = 'Daun Alpukat (Mentah)'
            const rincian = selectedRincian.value.toLowerCase()
            if (rincian.includes('gulma') || rincian.includes('rumput')) {
              feedName = 'Gulma / Rumput Liar (Mentah)'
            } else if (rincian.includes('ranting') || rincian.includes('daun')) {
              if (selectedRincian.value.toLowerCase().includes('kelengkeng') || route.query.rincian?.toString().toLowerCase().includes('kelengkeng')) {
                feedName = 'Daun Kelengkeng (Mentah)'
              }
            }

            const feeds = await feedsApi.getList()
            const existingFeed = feeds.find(f => f.feed_name.toLowerCase() === feedName.toLowerCase())

            if (existingFeed) {
              try {
                await feedsApi.updateStock(existingFeed.id, weight, 'tambah')
              } catch {
                await feedsApi.updateStok(existingFeed.id, weight, 'tambah')
              }
            } else {
              await feedsApi.create({
                feed_name: feedName,
                feed_type: 'Hijauan',
                unit: 'kg',
                stock: weight
              } as any)
            }
            console.log(`Successfully synced pruning yield: ${feedName} (+${weight} kg) to livestock feed stock via separate endpoint`)
          } catch (err) {
            console.error('Failed to save pruning or sync stock:', err);
          }
        }
      }

      router.push({ name: 'kebun' })
    }

    const goBack = () => {
      router.push({ name: 'kebun' })
    }

    return () => (
      <div class="detail-page">
        <div class="detail-shell">

          {/* Topbar back button – sama seperti halaman lain */}
          <header class="detail-topbar" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding: 0.5rem 0;">
            <PerkebunanBackButton onClick={goBack} />
          </header>

          {/* Recording Form Header Panel */}
          <div class="pencatatan-header-panel">
            <div class="panel-topbar" style="justify-content: center;">
              <h2 class="panel-title">Pencatatan Perkebunan</h2>
            </div>

            <div class="panel-meta-row">
              <span>{formattedDate.value}</span>
              <span>{formattedTime.value}</span>
            </div>

            <div class="panel-cards-grid">
              <div class="info-card">
                <div class="info-card-icon">
                  <img src={getLahanIcon(landSession.value?.name ?? 'alpukat')} alt="Lahan" style="width: 1.35rem; height: 1.35rem; object-fit: contain;" />
                </div>
                <div class="info-card-text">
                  <strong>{landSession.value?.name ?? 'Lahan Alpukat'}</strong>
                  <span>ID Lahan: {landSession.value?.code ?? 'L0001'}</span>
                </div>
              </div>

              <div class="info-card">
                <div class="info-card-icon">
                  <img src="/icon/operator.png" alt="Operator" style="width: 1.35rem; height: 1.35rem; object-fit: contain;" />
                </div>
                <div class="info-card-text">
                  <strong>Operator Kebun</strong>
                  <span>ID Pengguna: {userSession.value?.code ?? 'PK0001'}</span>
                </div>
              </div>
            </div>

            <div class="pencatatan-info-box">
              <h4 class="pencatatan-info-title">Pencatatan</h4>
              
              <div class="pencatatan-row">
                <div class="pencatatan-row-icon">
                  <img class="pencatatan-row-icon-img" src="/icon/calender.png" alt="Jenis" />
                </div>
                <div class="pencatatan-row-content">
                  <span class="pencatatan-row-label">Pilih jenis pencatatan</span>
                  <strong class="pencatatan-row-value">{selectedJenis.value}</strong>
                </div>
              </div>

              <div class="pencatatan-row">
                <div class="pencatatan-row-icon">
                  <img class="pencatatan-row-icon-img" src="/icon/document.png" alt="Rincian" />
                </div>
                <div class="pencatatan-row-content">
                  <span class="pencatatan-row-label">Pilih rincian pencatatan</span>
                  <strong class="pencatatan-row-value">{selectedRincian.value}</strong>
                </div>
              </div>
            </div>
          </div>
          
          {/* Informasi Stok Pupuk Organik Section */}
          {selectedJenis.value === 'Pemupukan' && selectedRincian.value === 'Pupuk Organik' && (
            <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
              <h3 style="font-size: 1.05rem; font-weight: 800; color: #111827; margin: 0;">
                Informasi Stok Pupuk Organik
              </h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div style="border: 1.5px solid #dce1d0; border-radius: 0.65rem; background: #fff; padding: 1rem 0.85rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 0.15rem;">
                  <strong style="font-size: 1.15rem; font-weight: 800; color: #111827; line-height: 1.2;">
                    Kotoran Domba
                  </strong>
                  <span style="font-size: 0.72rem; color: #6b7280; font-weight: 600;">
                    Asal Pupuk
                  </span>
                </div>
                <div style="border: 1.5px solid #dce1d0; border-radius: 0.65rem; background: #fff; padding: 1rem 0.85rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 0.15rem;">
                  <strong style="font-size: 1.15rem; font-weight: 800; color: #111827; line-height: 1.2;">
                    10 Kg
                  </strong>
                  <span style="font-size: 0.72rem; color: #6b7280; font-weight: 600;">
                    Jumlah Stok
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Kategori Toggle Section */}
          <div class="kategori-section">
            <h3 class="kategori-title">Pilih Kategori Pencatatan</h3>
            <div class="kategori-toggle-container">
              <button
                type="button"
                onClick={() => { activeMode.value = 'pohon' }}
                class={['kategori-toggle-btn', activeMode.value === 'pohon' ? 'active' : '']}
              >
                <span class="kategori-toggle-btn-icon">🌳</span>
                Per Pohon
              </button>
              <button
                type="button"
                onClick={() => { activeMode.value = 'lahan' }}
                class={['kategori-toggle-btn', activeMode.value === 'lahan' ? 'active' : '']}
              >
                <span class="kategori-toggle-btn-icon">🍃</span>
                Per Lahan
              </button>
            </div>
          </div>

          {/* Formulir Pencatatan Perkebunan Card */}
          <div class="formulir-card">
            <div class="formulir-header">
              Formulir Pencatatan Perkebunan
            </div>

            <div class="formulir-body">
              {(activeMode.value === 'pohon' || kindTitle.value === 'Penanaman') && (
                <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                  <label style="font-weight: 800; color: #111827; font-size: 1.05rem;">Pilih Varietas</label>
                  <div class="custom-dropdown-container">
                    <div
                      class="custom-dropdown-trigger"
                      onClick={() => { isVarietasDropdownOpen.value = !isVarietasDropdownOpen.value }}
                    >
                      <span>{selectedVarietas.value}</span>
                      <img
                        src="/icon/caret-down/black-12.svg"
                        alt="Caret"
                        style={`width: 10px; height: 10px; transition: transform 0.2s ease; transform: ${isVarietasDropdownOpen.value ? 'rotate(180deg)' : 'rotate(0)'};`}
                      />
                    </div>
                    {isVarietasDropdownOpen.value && (
                      <ul class="custom-dropdown-menu">
                        {varietasOptions.map((option) => (
                          <li
                            key={option}
                            class={`custom-dropdown-item ${selectedVarietas.value === option ? 'selected' : ''}`}
                            onClick={() => {
                              selectedVarietas.value = option
                              isVarietasDropdownOpen.value = false
                            }}
                          >
                            {option}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {activeMode.value === 'pohon' && (
                <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                  <label style="font-weight: 800; color: #111827; font-size: 1.05rem;">Pilih Pohon</label>
                  <div
                    style="
                      display: grid;
                      grid-template-columns: repeat(5, 1fr);
                      gap: 0.65rem;
                      max-height: 380px;
                      overflow-y: auto;
                      padding: 0.25rem;
                    "
                  >
                    {filteredTrees.value.map((tree) => {
                      const isSelected = selectedTrees.value.includes(tree.code)
                      const isHovered = hoveredTree.value === tree.code
                      const isActiveOrHovered = isSelected || isHovered
                      return (
                        <div
                          key={tree.code}
                          onClick={() => toggleTreeSelection(tree.code)}
                          onMouseenter={() => { hoveredTree.value = tree.code }}
                          onMouseleave={() => { hoveredTree.value = null }}
                          style={`
                            border: 2px solid ${isActiveOrHovered ? '#787f56' : '#dce1d0'};
                            background: ${isActiveOrHovered ? '#787f56' : '#ffffff'};
                            border-radius: 0.6rem;
                            padding: 0.75rem 0.5rem;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            gap: 0.25rem;
                            cursor: pointer;
                            text-align: center;
                            transition: all 0.18s ease;
                            transform: ${isHovered ? 'translateY(-2px)' : 'translateY(0)'};
                            box-shadow: ${isActiveOrHovered ? '0 8px 20px rgba(120, 127, 86, 0.2)' : 'none'};
                          `}
                        >
                          <img src="/icon/alpukat.png" alt="pohon" style="width: 1.5rem; height: 1.5rem; object-fit: contain;" />
                          <span
                            style={`
                              font-size: 0.85rem;
                              font-weight: 800;
                              color: ${isActiveOrHovered ? '#ffffff' : '#111827'};
                              transition: color 0.18s ease;
                            `}
                          >
                            {tree.code}
                          </span>
                          <span
                            style={`
                              font-size: 0.62rem;
                              color: ${isActiveOrHovered ? 'rgba(255, 255, 255, 0.85)' : '#6b7280'};
                              font-weight: 700;
                              white-space: nowrap;
                              overflow: hidden;
                              text-overflow: ellipsis;
                              width: 100%;
                              transition: color 0.18s ease;
                            `}
                          >
                            {tree.varietas}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic form inputs inside the body */}
              <KebunGenericFormFields
                kindTitle={kindTitle.value}
                form={formState.value}
                activeMode={activeMode.value}
                selectedRincian={selectedRincian.value}
              />

              {/* Simpan Button Centered inside card */}
              <div class="simpan-btn-wrap">
                <button onClick={saveRecording} class="simpan-btn-action">
                  Simpan
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  }
})
