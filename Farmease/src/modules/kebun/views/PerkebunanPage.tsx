import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/modules/kebun/assets/css/PerkebunanPage.css'
import PerkebunanHeader from '../components/PerkebunanHeader'
import PerkebunanQuickLinks from '../components/PerkebunanQuickLinks'
import PerkebunanRecordingCard from '../components/PerkebunanRecordingCard'
import PerkebunanScheduleList from '../components/PerkebunanScheduleList'
import PerkebunanSelectionModal from '../components/PerkebunanSelectionModal'

const jenisPencatatan = [
  'Pencatatan Panen',
  'Pencatatan Penanaman',
  'Pencatatan Pemangkasan',
  'Pencatatan Perawatan',
  'Pencatatan Pemupukan',
]

const rincianPencatatanByJenis: Record<string, string[]> = {
  'Pencatatan Panen': ['Panen Buah', 'Sortasi Hasil', 'Pengemasan Hasil'],
  'Pencatatan Penanaman': ['Penanaman Bibit Baru', 'Pindah Tanam', 'Penyiraman Awal'],
  'Pencatatan Pemangkasan': ['Gulma', 'Daun', 'Batang', 'Pemangkasan Bentuk'],
  'Pencatatan Perawatan': ['Hama', 'Penyiraman Rutin', 'Pemberian Nutrisi'],
  'Pencatatan Pemupukan': ['Pupuk Cair', 'Pupuk Organik', 'Pupuk Kompos'],
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
    
    const currentDateText = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date())

    const scheduleItems = [
      { name: 'Alpukat', tag: 'Perawatan', date: '09 April 2026', detail: 'A001 • Mingguan • L1001', progress: 'Belum' },
      { name: 'Kelengkeng', tag: 'Pemangkasan', date: '09 April 2026', detail: 'K003 • 3 x sebulan • L2002', progress: 'Belum' },
      { name: 'Alpukat', tag: 'Perawatan', date: '09 April 2026', detail: 'A002 • 2 x bulanan • L1001', progress: 'Belum' },
    ]

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
      openRecordingFlow(selectedJenis.value === 'Jenis Pencatatan' ? 'jenis' : 'rincian')
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
              onSave={() => {
                selectedJenis.value = 'Jenis Pencatatan'
                selectedRincian.value = 'Rincian Pencatatan'
              }}
              onNext={() => {}}
            />

            {/* 2. Pengingat Jadwal Terkini Grid Section */}
            <PerkebunanScheduleList
              items={scheduleItems}
              onWork={() => {}}
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
      </div>
    )
  }
})
