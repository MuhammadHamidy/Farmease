import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/modules/kebun/assets/css/PerkebunanPage.css'
import PerkebunanHeader from '../components/PerkebunanHeader'
import PerkebunanQuickLinks from '../components/PerkebunanQuickLinks'
import PerkebunanRecordingCard from '../components/PerkebunanRecordingCard'
import PerkebunanScheduleList from '../components/PerkebunanScheduleList'
import PerkebunanSelectionModal from '../components/PerkebunanSelectionModal'
import PerkebunanScheduleDetailModal from '../components/PerkebunanScheduleDetailModal'

const jenisPencatatan = [
  'Panen',
  'Pemangkasan',
  'Pembersihan',
  'Pembuahan',
  'Penanaman',
  'Pengendalian Hama & Penyakit',
  'Pemupukan',
]

const rincianPencatatanByJenis: Record<string, string[]> = {
  'Panen':                        ['Panen Buah', 'Hasil Panen'],
  'Pemangkasan':                  ['Ranting dan Daun', 'Rumput Liar (Gulma)'],
  'Pembersihan':                  ['Limbah'],
  'Pembuahan':                    ['Perangsang'],
  'Penanaman':                    ['Bibit Baru'],
  'Pengendalian Hama & Penyakit': ['Pestisida', 'Fungisida'],
  'Pemupukan':                    ['Pupuk Cair', 'Pupuk Organik', 'Pupuk Padat'],
}

export default defineComponent({
  name: 'PerkebunanPage',
  setup() {
    const router = useRouter()
    const activeField = ref<null | 'jenis' | 'rincian'>(null)
    const selectedJenis = ref('Jenis Pencatatan')
    const selectedRincian = ref('Rincian Pencatatan')
    const draftJenis = ref('Jenis Pencatatan')
    const draftRincian = ref('Rincian Pencatatan')
    
    const showDetailModal = ref(false)
    const selectedScheduleItem = ref<any>(null)
    
    const currentDateText = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date())

    const scheduleItems = [
      { name: 'Alpukat', tag: 'Panen', date: '09 April 2026', detail: 'A001 • 3 x sehari', progress: 'Kerjakan', description: 'Lakukan pemanenan buah yang sudah matang', rincian: 'Panen Buah' },
      { name: 'Alpukat', tag: 'Pemangkasan', date: '09 April 2026', detail: 'A002 • 3 x sehari', progress: 'Belum di setujui', description: 'Pangkas ranting yang kering dan rapuh', rincian: 'Ranting dan Daun' },
      { name: 'Alpukat', tag: 'Pemangkasan', date: '09 April 2026', detail: 'A003 • 3 x sehari', progress: 'Selesai', description: 'Bersihkan rumput liar disekitar pohon', rincian: 'Rumput Liar (Gulma)' },
    ]

    const handleOpenDetail = (item: any) => {
      selectedScheduleItem.value = item
      showDetailModal.value = true
    }

    const handleModalNext = (item: any) => {
      showDetailModal.value = false
      selectedJenis.value = item.tag
      selectedRincian.value = 'Rincian Pencatatan'
    }

    const closeModal = () => {
      activeField.value = null
    }

    const openRecordingFlow = (stage: 'jenis' | 'rincian') => {
      draftJenis.value = selectedJenis.value
      draftRincian.value = selectedRincian.value
      activeField.value = stage
    }

    const routeByTarget = {
      'dasbor-lahan': 'kebun-dasbor-lahan',
      'daftar-perkebunan': 'kebun-daftar',
      'riwayat-pencatatan': 'kebun-riwayat',
    } as const

    const openDetailPage = (target: keyof typeof routeByTarget) => {
      router.push({ name: routeByTarget[target] })
    }

    const openJenis = () => {
      openRecordingFlow('jenis')
    }

    const openRincian = () => {
      if (selectedJenis.value === 'Jenis Pencatatan') return
      openRecordingFlow('rincian')
    }

    const handleNext = () => {
      router.push({
        name: 'kebun-form-pencatatan',
        query: {
          jenis: selectedJenis.value,
          rincian: selectedRincian.value,
        },
      })
    }

    const quickLinks = [
      {
        title: 'Informasi Dasbor',
        subtitle: 'Buka ringkasan lahan dan produksi',
        onClick: () => openDetailPage('dasbor-lahan'),
      },
      {
        title: 'Daftar Perkebunan',
        subtitle: 'Lihat daftar pohon yang tersedia',
        onClick: () => openDetailPage('daftar-perkebunan'),
      },
      {
        title: 'Riwayat Pencatatan',
        subtitle: 'Masuk ke catatan pekerjaan sebelumnya',
        onClick: () => openDetailPage('riwayat-pencatatan'),
      },
    ]

    return () => (
      <div class="perkebunan-page">
        <div class="perkebunan-shell">
          {/* Header containing unified Back button and global top header area */}
          <PerkebunanHeader currentDateText={currentDateText} onBack={() => router.push({ name: 'home' })} />

          <div style="margin-top: 0.5rem;">
            {/* 1. Main Pencatatan Card & Dynamic Form Flow */}
            <PerkebunanRecordingCard
              selectedJenis={selectedJenis.value}
              selectedRincian={selectedRincian.value}
              onOpenJenis={openJenis}
              onOpenRincian={openRincian}
              onNext={handleNext}
            />

            {/* 2. Pengingat Jadwal Terkini Grid Section */}
            <PerkebunanScheduleList
              items={scheduleItems}
              onOpen-detail={handleOpenDetail}
            />

            {/* 3. Informasi Lain Row Section */}
            <PerkebunanQuickLinks links={quickLinks} />
          </div>
        </div>

        {/* Premium Selection Modal / Sheet */}
        <PerkebunanSelectionModal
          open={activeField.value !== null}
          initialStage={activeField.value ?? 'jenis'}
          selectedJenis={draftJenis.value}
          selectedRincian={draftRincian.value}
          jenisItems={jenisPencatatan.map((item) => ({ label: item }))}
          rincianItemsByJenis={Object.fromEntries(
            Object.entries(rincianPencatatanByJenis).map(([jenis, items]) => [
              jenis,
              items.map((item) => ({ label: item, sublabel: jenis })),
            ]),
          )}
          onClose={closeModal}
          onSelect={({ jenis, rincian }: { jenis: string; rincian: string }) => {
            selectedJenis.value = jenis
            selectedRincian.value = rincian || 'Rincian Pencatatan'
            closeModal()
          }}
          onAdd={() => {}}
        />

        {/* Detail Jadwal Pengingat Modal */}
        <PerkebunanScheduleDetailModal
          open={showDetailModal.value}
          item={selectedScheduleItem.value}
          onClose={() => { showDetailModal.value = false }}
          onNext={handleModalNext}
        />
      </div>
    )
  }
})
