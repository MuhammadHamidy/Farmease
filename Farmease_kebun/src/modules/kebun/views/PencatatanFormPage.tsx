import { defineComponent, computed, ref, onMounted, onUnmounted, Teleport, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { submitPencatatanSubmission } from '@/store/operatorAdmin'
import { userSession, landSession, prefilledPencatatanTaskId } from '@/store/navigation'
import KebunGenericFormFieldsRaw from '../components/pencatatan/KebunGenericFormFields'
import PencatatanInfoCard from '../components/pencatatan/PencatatanInfoCard'
import PencatatanSelectionField from '../components/pencatatan/PencatatanSelectionField'
import PanduanTeknisBanner from '../components/pencatatan/PanduanTeknisBanner'
import PencatatanModeToggle from '../components/pencatatan/PencatatanModeToggle'
import PencatatanFormContainer from '../components/pencatatan/PencatatanFormContainer'
import TreeSelectionGrid, { type TreeItem } from '../components/pencatatan/TreeSelectionGrid'
import RincianBottomSheet from '../components/pencatatan/RincianBottomSheet'
import JenisBottomSheet from '../components/pencatatan/JenisBottomSheet'
import PencatatanPrimaryButton from '../components/pencatatan/PencatatanPrimaryButton'
import { manureApi, pohonApi } from '@/shared/api'
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css'

const KebunGenericFormFields = KebunGenericFormFieldsRaw as any

const getLahanIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('alpukat')) return '/icon/alpukat.png'
  if (n.includes('kelengkeng')) return '/icon/kelengkeng.png'
  return '/icon/lahan.png'
}

const FALLBACK_TREES: TreeItem[] = [
  { code: 'LA001', varietas: 'Alpukat Aligator', fase: 'Generatif' },
  { code: 'LA002', varietas: 'Alpukat Aligator', fase: 'Vegetatif' },
  { code: 'LA003', varietas: 'Alpukat Aligator', fase: 'Generatif' },
  { code: 'LA004', varietas: 'Alpukat Aligator', fase: 'Vegetatif' },
  { code: 'LA005', varietas: 'Alpukat Aligator', fase: 'Generatif' },
  { code: 'LA006', varietas: 'Alpukat Miki', fase: 'Vegetatif' },
  { code: 'LA007', varietas: 'Alpukat Miki', fase: 'Generatif' },
  { code: 'LA008', varietas: 'Alpukat Miki', fase: 'Vegetatif' },
  { code: 'LA009', varietas: 'Alpukat Miki', fase: 'Generatif' },
  { code: 'LA010', varietas: 'Alpukat Miki', fase: 'Vegetatif' },
  { code: 'LA011', varietas: 'Alpukat Markus', fase: 'Generatif' },
  { code: 'LA012', varietas: 'Alpukat Markus', fase: 'Vegetatif' },
  { code: 'LA013', varietas: 'Alpukat Markus', fase: 'Generatif' },
  { code: 'LA014', varietas: 'Alpukat Kelud', fase: 'Vegetatif' },
  { code: 'LA015', varietas: 'Alpukat Kelud', fase: 'Generatif' },
]

const panduanTeknisByRincian: Record<string, string> = {
  'Penjarangan Buah': 'Lakukan saat buah diameter ±2 cm. Sisakan 2-3 buah per tandan. Buang buah kecil, cacat, atau terserang OPT.',
  'Pembungkusan Buah': 'Bungkus setelah penjarangan. Tujuan: cegah lalat buah, penggerek, trips, dan kutu putih.',
  'Merangsang Pembungaan': 'Aplikasikan perangsang bunga pada fase vegetatif akhir. Pastikan kelembapan tanah cukup sebelum aplikasi.',
  'Pemangkasan Ranting': 'Pangkas ranting yang mati, sakit, atau terlalu rimbun. Gunakan alat steril. Olesi bekas pangkas dengan fungisida.',
  'Pemangkasan Bentuk': 'Bentuk tajuk agar cahaya merata. Lakukan saat tanaman tidak berbunga.',
  'Pemangkasan Peremajaan': 'Potong cabang tua hingga 30-50%. Lakukan bertahap agar tidak stres.',
  'Panen Buah': 'Panen saat buah mencapai ukuran dan warna matang. Gunakan gunting panen steril.',
  'Pemupukan Organik': 'Aplikasikan pupuk organik sesuai dosis anjuran. Letakkan di sekitar proyeksi tajuk.',
  'Pemupukan Anorganik': 'Gunakan pupuk sesuai rekomendasi uji tanah. Hindari aplikasi saat hujan deras.',
  'Penyiraman Rutin': 'Siram pagi atau sore hari. Pastikan drainase baik agar tidak terjadi genangan.',
  'Pembersihan Gulma': 'Bersihkan gulma secara rutin. Gunakan mulsa untuk menekan pertumbuhan kembali.',
  'Aplikasi Pestisida': 'Gunakan pestisida terdaftar sesuai dosis. Pakai APD lengkap. Catat waktu dan jenis aplikasi.',
}

const ALL_JENIS = [
  'Panen', 'Pemangkasan', 'Pembersihan', 'Pembuahan',
  'Pemberian Obat', 'Pemupukan', 'Penanaman', 'Penyiraman',
  'Stok Obat', 'Stok Pupuk',
]

const rincianByJenis: Record<string, string[]> = {
  'Penanaman': ['Bibit Baru', 'Penggantian Bibit'],
  'Pembuahan': ['Merangsang Pembungaan', 'Penjarangan Buah', 'Pembungkusan Buah'],
  'Pemangkasan': ['Pemangkasan Ranting', 'Pemangkasan Bentuk', 'Pemangkasan Peremajaan'],
  'Panen': ['Panen Buah'],
  'Pemupukan': ['Pemupukan Organik', 'Pemupukan Anorganik'],
  'Penyiraman': ['Siram Manual', 'Irigrasi Drip / Pipanisasi', 'Biopori'],
  'Pembersihan': ['Penyiangan Gulma', 'Pembumbunan Tanah', 'Sanitasi Serasah & Ranting'],
  'Pengendalian Hama': ['Insektisida', 'Fungisida', 'Pestisida'],
  'Pemberian Obat': ['Insektisida', 'Fungisida', 'Pestisida'],
  'Stok Obat': ['Tambah Obat'],
  'Stok Pupuk': ['Stok Masuk', 'Stok Keluar'],
}

export default defineComponent({
  name: 'PencatatanFormPage',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const selectedJenis = ref<string>((route.query.jenis as string) || 'Jenis Pencatatan')
    const selectedRincian = ref<string>((route.query.rincian as string) || 'Rincian Pencatatan')
    const activeMode = ref<'lahan' | 'pohon'>('pohon')

    const currentDate = ref(new Date())
    const timerId = setInterval(() => { currentDate.value = new Date() }, 1000)

    onUnmounted(() => clearInterval(timerId))

    const formattedDate = computed(() => {
      const d = currentDate.value
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      return `Tanggal : ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    })

    const formattedTime = computed(() => {
      const d = currentDate.value
      return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')} WIB`
    })

    const kindTitle = computed(() => {
      if (selectedJenis.value === 'Jenis Pencatatan') return ''
      const lower = selectedJenis.value.toLowerCase()
      if (lower.includes('perawatan') || lower.includes('hama') || lower.includes('penyakit')) return 'Pemberian Obat'
      return selectedJenis.value.replace(/^Pencatatan\s+/u, '')
    })

    const panduanTeknis = computed(() => panduanTeknisByRincian[selectedRincian.value] || '')

    // ── Jenis modal ─────────────────────────────────────────
    const showJenisModal = ref(false)
    const jenisSearch = ref('')
    const draftJenis = ref('')

    const openJenisModal = () => {
      draftJenis.value = selectedJenis.value
      jenisSearch.value = ''
      showJenisModal.value = true
    }

    const saveJenis = () => {
      if (draftJenis.value && draftJenis.value !== 'Jenis Pencatatan') {
        selectedJenis.value = draftJenis.value
        // Reset rincian when jenis changes
        selectedRincian.value = 'Rincian Pencatatan'
        draftRincian.value = ''
      }
      showJenisModal.value = false
    }

    // ── Rincian modal ───────────────────────────────────────
    const showRincianModal = ref(false)
    const rincianSearch = ref('')
    const draftRincian = ref('')

    const availableRincianList = computed(() => {
      const list = rincianByJenis[selectedJenis.value] || []
      if (!rincianSearch.value) return list
      return list.filter(r => r.toLowerCase().includes(rincianSearch.value.toLowerCase()))
    })

    const openRincianModal = () => {
      draftRincian.value = selectedRincian.value
      rincianSearch.value = ''
      showRincianModal.value = true
    }

    const saveRincian = () => {
      if (draftRincian.value && draftRincian.value !== 'Rincian Pencatatan') {
        selectedRincian.value = draftRincian.value
      }
      showRincianModal.value = false
    }

    const manureStock = ref(0)
    const fetchManureStock = async () => {
      try {
        const list: any[] = await manureApi.getList()
        manureStock.value = list.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
      } catch { /* silent */ }
    }

    const formState = ref({
      kodePohon: 'LA001', deskripsiPenanaman: '', jumlahPemangkasan: '',
      deskripsiPemangkasan: '', jenisObat: 'Jenis Obat', kodePohonPerawatan: 'Kode Pohon',
      bagianPohon: 'Bagian Pohon', teknikPemberian: 'Teknik Pemberian Obat', namaObat: '',
      dosisObat: '', deskripsiPerawatan: '', jenisPupuk: 'Jenis Pupuk', fasePohon: 'Fase Pohon',
      kodePohonPemupukan: 'Kode Pohon', jumlahBeratPupuk: '', deskripsiPemupukan: '',
      jumlahPanen: '', beratPanen: '', deskripsiPanen: '', deskripsiPembersihan: '',
      metodePemangkasan: 'Metode Pemangkasan', tujuanPemanfaatan: 'Pemanfaatan',
      jumlahStokMasuk: '', jumlahStokKeluar: '', catatanStok: '',
      jenisPupukDetail: 'Jenis Pupuk Detail', teknikPemupukan: 'Teknik Pemupukan',
      jenisLimbah: 'Jenis Limbah', beratLimbah: '', jenisPerangsang: 'Jenis Perangsang',
      dosisPerangsang: '', deskripsiPembuahan: '', alasanPenanaman: 'Alasan Penanaman',
      kodePohonManual: '', teknikPengendalian: 'Teknik Pengendalian', namaPestisida: '',
      dosisPestisida: '', volumeAir: '', namaGejala: '', targetHama: '',
      teknikPenyiraman: 'Teknik Penyiraman', sesiPenyiraman: 'Sesi Penyiraman', deskripsiPenyiraman: '',
      metodePerlakuan: 'Metode Perlakuan', jenisHormon: '',
      diameterBuah: '', satuanDiameter: 'Satuan Diameter',
      jumlahBuahDibuang: '', sisaBuahPerTandan: '',
      bahanPembungkus: 'Bahan Pembungkus', jumlahBuahDibungkus: '',
      kondisiPanen: 'Kondisi Panen', caraPanen: 'Cara Panen', satuanBerat: 'Satuan Berat',
      jenisBibit: '',
      namaOPT: '',
      volumeObat: '',
      satuanVolumeObat: 'Satuan Volume',
      teknikPemberianObat: 'Teknik Pemberian',
      volumeLarutan: '',
      satuanVolumeLarutan: 'Satuan Volume',
      satuanVolumeAir: 'Satuan Volume',
      tanggalKadaluarsa: '',
      jumlahLubangBiopori: '',
    })

    const selectedVarietas = ref('Semua Varietas')
    const selectedTrees = ref<string[]>(['LA001'])
    const allTrees = ref<TreeItem[]>([...FALLBACK_TREES])

    const varietasOptions = computed(() => {
      const set = new Set(allTrees.value.map(t => t.varietas))
      return ['Semua Varietas', ...Array.from(set)]
    })

    const filteredTrees = computed(() => {
      let result = allTrees.value
      if (selectedVarietas.value !== 'Semua Varietas') {
        result = result.filter(t => t.varietas === selectedVarietas.value)
      }
      if ((kindTitle.value === 'Pemupukan' || kindTitle.value === 'Pemangkasan') && formState.value.fasePohon && formState.value.fasePohon !== 'Fase Pohon') {
        result = result.filter(t => t.fase === formState.value.fasePohon)
      }
      return result
    })

    const obatStocks = computed(() => {
      const r = (selectedRincian.value || '').toLowerCase()
      if (r.includes('fungisida')) {
        return [
          { name: 'Mankozeb', qty: '500 Gram (g)', expiry: '02 - 12 - 2026' },
          { name: 'Fungisida Tembaga', qty: '300 Mililiter (ml)', expiry: '02 - 12 - 2026' }
        ]
      } else if (r.includes('insektisida')) {
        return [
          { name: 'Sipermetrin 50EC', qty: '500 Mililiter (ml)', expiry: '02 - 12 - 2026' },
          { name: 'Imidakloprid', qty: '300 Mililiter (ml)', expiry: '02 - 12 - 2026' }
        ]
      } else {
        return [
          { name: 'Ekstrak Nimba', qty: '500 Mililiter (ml)', expiry: '02 - 12 - 2026' },
          { name: 'Ekstrak Bawang Putih', qty: '300 Mililiter (ml)', expiry: '02 - 12 - 2026' }
        ]
      }
    })

    watch(selectedTrees, (codes) => {
      formState.value.kodePohon = codes.join(', ')
    }, { deep: true })

    const fetchTrees = async () => {
      try {
        const list = await pohonApi.getList()
        if (list && list.length > 0) {
          allTrees.value = list.map(p => ({
            code: p.kode_pohon,
            varietas: p.jenis || p.nama_pohon || 'Varietas',
            fase: p.status || 'Generatif',
          }))
          selectedTrees.value = [allTrees.value[0]!.code]
        } else {
          allTrees.value = [...FALLBACK_TREES]
          selectedTrees.value = ['LA001']
        }
      } catch {
        allTrees.value = [...FALLBACK_TREES]
        selectedTrees.value = ['LA001']
      }
    }

    onMounted(() => {
      formState.value.kodePohon = selectedTrees.value.join(', ')
      fetchManureStock()
      fetchTrees()
    })

    const alertModal = ref({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error' })
    const closeAlertModal = () => { alertModal.value.isOpen = false }

    const isSaving = ref(false)
    const saveRecording = async () => {
      if (isSaving.value) return
      isSaving.value = true
      const result = await submitPencatatanSubmission({
        type: kindTitle.value.toLowerCase(),
        scope: activeMode.value,
        summary: `Mencatat ${kindTitle.value} (${selectedRincian.value})`,
        payload: {
          data: {
            items: [{
              ...formState.value,
              selectedRincian: selectedRincian.value,
              kategoriPencatatan: activeMode.value,
              selectedVarietas: selectedVarietas.value,
            }],
          },
        },
        operatorCode: userSession.value?.code || 'OP002',
        operatorName: userSession.value?.name || 'Operator Kebun',
        cageCode: landSession.value?.code || 'L001',
        taskId: prefilledPencatatanTaskId.value || undefined,
      })
      isSaving.value = false
      alertModal.value = {
        isOpen: true,
        title: result.success ? 'Berhasil Dikirim' : 'Gagal Mengirim',
        message: result.success
          ? `Catatan ${kindTitle.value} (${selectedRincian.value}) berhasil dimasukkan ke antrean persetujuan!`
          : result.message,
        type: result.success ? 'success' : 'error',
      }
      if (result.success) {
        setTimeout(() => {
          alertModal.value.isOpen = false
          prefilledPencatatanTaskId.value = null
          router.back()
        }, 2000)
      }
    }

    const goBack = () => router.push({ name: 'kebun' })

    return () => (
      <div class="pencatatan-page">
        <div class="pencatatan-topbar">
          <button type="button" class="pencatatan-back-btn" onClick={goBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali
          </button>
        </div>

        <div class="pencatatan-content">
          <div class="pencatatan-header-panel">
            <div class="pencatatan-header-title">
              <h2>Pencatatan Perkebunan</h2>
            </div>
            <div class="pencatatan-header-meta">
              <span>{formattedDate.value}</span>
              <span>{formattedTime.value}</span>
            </div>

            <div class="pencatatan-info-cards">
              <PencatatanInfoCard
                icon={getLahanIcon(landSession.value?.name ?? 'alpukat')}
                title={landSession.value?.name ?? 'Lahan Alpukat'}
                subtitle={`ID Lahan: ${landSession.value?.code ?? 'L001'}`}
                alt="Lahan"
              />
              <PencatatanInfoCard
                icon="/icon/operator.png"
                title={userSession.value?.name ?? 'Operator Kebun'}
                subtitle={`ID Pengguna: ${userSession.value?.code ?? 'PK001'}`}
                alt="Operator"
              />
            </div>

            <div class="pencatatan-selector-box">
              <div class="pencatatan-selector-box__heading">Pencatatan</div>
              <PencatatanSelectionField
                icon="/icon/jenis_kebun.png"
                label="Pilih jenis pencatatan"
                value={selectedJenis.value}
                clickable
                showChevron
                onClick={openJenisModal}
              />
              <PencatatanSelectionField
                icon="/icon/rincian_kebun.png"
                label="Pilih rincian pencatatan"
                value={selectedRincian.value}
                clickable
                showChevron
                onClick={openRincianModal}
              />
            </div>
          </div>

          {panduanTeknis.value && <PanduanTeknisBanner text={panduanTeknis.value} />}

          {(selectedJenis.value === 'Pemberian Obat' || selectedJenis.value === 'Stok Obat') && (
            <div style="margin-bottom:0.85rem;">
              <h3 style="font-size:1rem; font-weight:800; color:#111827; margin:0 0 0.5rem;">Informasi Stok Obat</h3>
              <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:0.75rem;">
                {obatStocks.value.map(stock => (
                  <div key={stock.name} style="border:1.5px solid #dce1d0; border-radius:0.65rem; background:#fff; padding:1rem 0.85rem; text-align:left;">
                    <strong style="display:block; font-size:1rem; font-weight:800; color:#111827;">{stock.name}</strong>
                    <span style="display:block; font-size:0.85rem; color:#111827; font-weight:700; margin:0.25rem 0;">{stock.qty}</span>
                    <span style="font-size:0.72rem; color:#6b7280; font-weight:600;">Kadaluarsa: {stock.expiry}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedJenis.value === 'Pemupukan' && selectedRincian.value === 'Pupuk Organik' && (
            <div style="margin-bottom:0.85rem;">
              <h3 style="font-size:1rem; font-weight:800; color:#111827; margin:0 0 0.5rem;">Informasi Stok Pupuk Organik</h3>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                <div style="border:1.5px solid #dce1d0; border-radius:0.65rem; background:#fff; padding:1rem 0.85rem; text-align:center;">
                  <strong style="display:block; font-size:1rem; font-weight:800; color:#111827;">Kotoran Domba</strong>
                  <span style="font-size:0.72rem; color:#6b7280; font-weight:600;">Asal Pupuk</span>
                </div>
                <div style="border:1.5px solid #dce1d0; border-radius:0.65rem; background:#fff; padding:1rem 0.85rem; text-align:center;">
                  <strong style="display:block; font-size:1rem; font-weight:800; color:#111827;">{manureStock.value.toFixed(1)} Kg</strong>
                  <span style="font-size:0.72rem; color:#6b7280; font-weight:600;">Jumlah Stok</span>
                </div>
              </div>
            </div>
          )}

          {selectedJenis.value !== 'Stok Obat' && selectedJenis.value !== 'Stok Pupuk' && (
            <PencatatanModeToggle
              modelValue={activeMode.value}
              onUpdate:modelValue={(val: 'pohon' | 'lahan') => { activeMode.value = val }}
            />
          )}

          <PencatatanFormContainer>
            {activeMode.value === 'pohon' && selectedJenis.value !== 'Stok Obat' && (
              <TreeSelectionGrid
                trees={filteredTrees.value}
                selectedCodes={selectedTrees.value}
                varietasOptions={varietasOptions.value}
                selectedVarietas={selectedVarietas.value}
                treeIcon={getLahanIcon(landSession.value?.name ?? 'alpukat')}
                maxSelection={selectedRincian.value.toLowerCase().includes('penggantian') ? 1 : 0}
                onUpdate:selectedCodes={(codes: string[]) => { selectedTrees.value = codes }}
                onUpdate:selectedVarietas={(val: string) => { selectedVarietas.value = val }}
              />
            )}

            <KebunGenericFormFields
              kindTitle={kindTitle.value}
              form={formState.value}
              activeMode={activeMode.value}
              selectedRincian={selectedRincian.value}
              manureStock={manureStock.value}
              selectedTreesCount={selectedTrees.value.length}
              varietasOptions={varietasOptions.value}
              selectedVarietas={selectedVarietas.value}
              onUpdate:selectedVarietas={(val: string) => { selectedVarietas.value = val }}
            />

            <PencatatanPrimaryButton loading={isSaving.value} onClick={saveRecording} />
          </PencatatanFormContainer>
        </div>

        <JenisBottomSheet
          show={showJenisModal.value}
          options={ALL_JENIS}
          selected={draftJenis.value}
          search={jenisSearch.value}
          onClose={() => { showJenisModal.value = false }}
          onSave={saveJenis}
          onUpdate:selected={(val: string) => { draftJenis.value = val }}
          onUpdate:search={(val: string) => { jenisSearch.value = val }}
        />

        <RincianBottomSheet
          show={showRincianModal.value}
          jenisLabel={selectedJenis.value}
          options={availableRincianList.value}
          selected={draftRincian.value}
          search={rincianSearch.value}
          onClose={() => { showRincianModal.value = false }}
          onSave={saveRincian}
          onUpdate:selected={(val: string) => { draftRincian.value = val }}
          onUpdate:search={(val: string) => { rincianSearch.value = val }}
        />

        {alertModal.value.isOpen && (
          <Teleport to="body">
            <div
              style="position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:1200; display:flex; align-items:center; justify-content:center;"
              onClick={alertModal.value.type === 'error' ? closeAlertModal : undefined}
            >
              <div
                style="background:#fff; border-radius:1.25rem; padding:2rem 1.5rem; max-width:360px; width:90%; text-align:center; animation:pencatatanScaleUp 0.25s ease;"
                onClick={(e: MouseEvent) => e.stopPropagation()}
              >
                <div style="margin-bottom:1.25rem;">
                  {alertModal.value.type === 'error' ? (
                    <div style="display:inline-flex; align-items:center; justify-content:center; width:60px; height:60px; background:rgba(239,68,68,0.1); color:#ef4444; border-radius:50%; font-size:1.8rem;">✕</div>
                  ) : (
                    <div style="display:inline-flex; align-items:center; justify-content:center; width:60px; height:60px; background:rgba(34,197,94,0.1); color:#22c55e; border-radius:50%; font-size:1.8rem;">✓</div>
                  )}
                </div>
                <h4 style="font-weight:800; margin:0 0 0.5rem; font-size:1.1rem; color:#111827;">{alertModal.value.title}</h4>
                <p style="color:#6b7280; margin:0 0 1.25rem; font-size:0.88rem; line-height:1.55;">{alertModal.value.message}</p>
                {alertModal.value.type === 'error' && (
                  <button type="button" class="pencatatan-primary-btn" onClick={closeAlertModal}>Mengerti</button>
                )}
                {alertModal.value.type === 'success' && (
                  <div style="display:flex; align-items:center; justify-content:center; gap:0.4rem; color:#6b7280; font-size:0.82rem;">
                    <div style="width:1rem; height:1rem; border:2px solid #38431f; border-top-color:transparent; border-radius:50%; animation:pencatatanSpin 0.7s linear infinite;" />
                    Mengalihkan...
                  </div>
                )}
              </div>
            </div>
          </Teleport>
        )}
      </div>
    )
  },
})
