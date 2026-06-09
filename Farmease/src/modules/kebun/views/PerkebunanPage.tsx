import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import '@/modules/kebun/assets/css/PerkebunanPage.css'
import PerkebunanHeader from '../components/PerkebunanHeader'
import PerkebunanQuickLinks from '../components/PerkebunanQuickLinks'
import PerkebunanRecordingCard from '../components/PerkebunanRecordingCard'
import PerkebunanScheduleList from '../components/PerkebunanScheduleList'
import PerkebunanSelectionModal from '../components/PerkebunanSelectionModal'
import PerkebunanScheduleDetailModal from '../components/PerkebunanScheduleDetailModal'
import { landSession, userSession } from '@/store/navigation'
import { operatorTasks, fetchTasks } from '@/modules/ternak/store/operatorAdmin'

const jenisPencatatan = [
  'Panen',
  'Pemangkasan',
  'Pembersihan',
  'Pembuahan',
  'Penanaman',
  'Pengendalian Hama & Penyakit',
  'Pemupukan',
  'Penyiraman',
]

const rincianPencatatanByJenis: Record<string, string[]> = {
  'Panen':                        ['Panen Buah', 'Hasil Panen'],
  'Pemangkasan':                  ['Ranting dan Daun', 'Rumput Liar (Gulma)'],
  'Pembersihan':                  ['Limbah'],
  'Pembuahan':                    ['Perangsang'],
  'Penanaman':                    ['Bibit Baru'],
  'Pengendalian Hama & Penyakit': ['Pestisida', 'Fungisida'],
  'Pemupukan':                    ['Pupuk Cair', 'Pupuk Organik', 'Pupuk Padat'],
  'Penyiraman':                   ['Penyiraman Rutin'],
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

    onMounted(() => {
      if (operatorTasks.value.length === 0) {
        fetchTasks()
      }
    })

    const scheduleItems = computed(() => {
      return operatorTasks.value
        .filter(t => t.assigneeCode === 'OP002' || t.assigneeCode === '3' || t.assigneeName.toLowerCase().includes('kebun') || ['panen', 'pemangkasan', 'pembersihan', 'pembuahan', 'penanaman', 'pengendalian hama', 'pemupukan', 'penyiraman'].some(c => t.category.toLowerCase().includes(c)))
        .map(t => {
          let name = 'Lahan'
          const titleLower = t.title.toLowerCase()
          if (titleLower.includes('alpukat')) name = 'Alpukat'
          else if (titleLower.includes('kelengkeng')) name = 'Kelengkeng'
          else if (t.description.toLowerCase().includes('alpukat')) name = 'Alpukat'
          else if (t.description.toLowerCase().includes('kelengkeng')) name = 'Kelengkeng'

          const formattedDate = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(t.dueDate))

          let tag: string = t.category
          if (tag === 'umum' && t.title) {
             tag = t.title.split(' ')[0] || 'umum'
          }

          let progress = 'Kerjakan'
          if (t.status === 'selesai') progress = 'Selesai'
          else if (t.status === 'proses') progress = 'Proses'

          // Mappings for rincian based on tag for accurate form prefilling
          let rincian: string = (t as any).rincian;
          if (!rincian) {
            rincian = tag;
            if (tag.toLowerCase() === 'pemangkasan') rincian = 'Ranting dan Daun'
            if (tag.toLowerCase() === 'panen') rincian = 'Panen Buah'
            if (tag.toLowerCase() === 'pemupukan') rincian = 'Pupuk Organik'
          }
          
          return {
            id: t.id,
            name: name,
            tag: tag.charAt(0).toUpperCase() + tag.slice(1),
            date: formattedDate,
            time: t.dueTime ? t.dueTime.replace(':', ' : ') + ' WIB' : '08 : 00 WIB',
            detail: t.cageCode || 'L001',
            progress: progress,
            description: t.description,
            rincian: rincian
          }
        })
    })

    const handleOpenDetail = (item: any) => {
      selectedScheduleItem.value = item
      showDetailModal.value = true
    }

    const handleModalNext = (item: any) => {
      showDetailModal.value = false
      selectedJenis.value = item.tag
      selectedRincian.value = item.rincian || 'Rincian Pencatatan'
      // Instead of going directly to the form, open the rincian selection modal
      setTimeout(() => {
        openRincian()
      }, 50)
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

    return () => {
      if (!landSession.value) {
        return (
          <div class="perkebunan-gate-container" style="background: #ffffff; min-height: 100vh; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
            {/* Header Banner matching image 5 */}
            <header style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1.5px solid #f0f0eb; flex-shrink: 0; width: 100%; box-sizing: border-box;">
              <div style="font-size: 1.45rem; font-weight: 800; color: #111827; letter-spacing: -0.02em;">
                Sah Hi Agro Farm
              </div>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <button class="action-bell-btn" style="background: none; border: none; cursor: pointer; padding: 0;">
                  <img src="/icon/notification/black-24.svg" alt="Notification" style="height: 22px; width: 22px; object-fit: contain;" />
                </button>
                <div style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <img src="/icon/logo_farmease.png" alt="FARMease" style="height: 32px; width: 32px; object-fit: contain;" />
                </div>
              </div>
            </header>

            {/* Back Button */}
            <div style="padding: 1rem 1.5rem 0.5rem; display: flex; justify-content: flex-start; flex-shrink: 0; width: 100%; box-sizing: border-box;">
              <button
                onClick={() => {
                  userSession.value = null
                  router.push({ name: 'home' })
                }}
                style="
                  background: #38431f;
                  color: #ffffff;
                  border: none;
                  border-radius: 0.45rem;
                  padding: 0.45rem 1rem;
                  font-weight: 700;
                  font-size: 0.85rem;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 0.35rem;
                "
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                Kembali
              </button>
            </div>

            {/* Title Block with dark green background */}
            <div style="padding: 0 1.5rem; flex-shrink: 0; width: 100%; box-sizing: border-box; margin-bottom: 1.5rem;">
              <div
                style="
                  background: #38431f;
                  color: #ffffff;
                  text-align: center;
                  padding: 1.5rem;
                  border-radius: 0.75rem;
                  display: flex;
                  flex-direction: column;
                  gap: 0.35rem;
                "
              >
                <h2 style="margin: 0; font-size: 1.55rem; font-weight: 800; letter-spacing: -0.01em;">
                  Silahkan Masuk Perkebunan
                </h2>
                <span style="font-size: 0.9rem; color: #dce1d0; font-weight: 600;">
                  Pilih kategori lahan untuk masuk lahan
                </span>
              </div>
            </div>

            {/* Two Land Cards */}
            <div style="padding: 0 1.5rem 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%; box-sizing: border-box; flex: 1; align-content: flex-start;">
              {/* Card 1: Lahan Alpukat */}
              <div
                onClick={() => {
                  landSession.value = {
                    code: 'L001',
                    name: 'Lahan Alpukat',
                    area: '10 Hektar',
                    status: 'aktif'
                  }
                }}
                style="
                  background: #2d3a1a;
                  border-radius: 0.85rem;
                  padding: 2rem 1rem;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                  cursor: pointer;
                  transition: transform 0.2s ease, box-shadow 0.2s ease;
                  box-shadow: 0 4px 15px rgba(45, 58, 26, 0.15);
                  gap: 1.25rem;
                "
                class="land-select-card"
              >
                <div style="width: 5.5rem; height: 5.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img src="/icon/alpukat.png" alt="Lahan Alpukat" style="width: 5rem; height: 5rem; object-fit: contain;" />
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.15rem; color: #ffffff;">
                  <strong style="font-size: 1.35rem; font-weight: 800;">
                    Lahan Alpukat
                  </strong>
                  <span style="font-size: 0.85rem; color: #a9b594; font-weight: 700;">
                    L001
                  </span>
                </div>
              </div>

              {/* Card 2: Lahan Kelengkeng */}
              <div
                onClick={() => {
                  landSession.value = {
                    code: 'L0002',
                    name: 'Lahan Kelengkeng',
                    area: '8 Hektar',
                    status: 'aktif'
                  }
                }}
                style="
                  background: #2d3a1a;
                  border-radius: 0.85rem;
                  padding: 2rem 1rem;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                  cursor: pointer;
                  transition: transform 0.2s ease, box-shadow 0.2s ease;
                  box-shadow: 0 4px 15px rgba(45, 58, 26, 0.15);
                  gap: 1.25rem;
                "
                class="land-select-card"
              >
                <div style="width: 5.5rem; height: 5.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img src="/icon/kelengkeng.png" alt="Lahan Kelengkeng" style="width: 5rem; height: 5rem; object-fit: contain;" />
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.15rem; color: #ffffff;">
                  <strong style="font-size: 1.35rem; font-weight: 800;">
                    Lahan Kelengkeng
                  </strong>
                  <span style="font-size: 0.85rem; color: #a9b594; font-weight: 700;">
                    L002
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div class="perkebunan-page">
          <div class="perkebunan-shell">
            {/* Header containing unified Back button and global top header area */}
            <PerkebunanHeader currentDateText={currentDateText} onBack={() => { landSession.value = null }} />

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
              {scheduleItems.value.length > 0 && (
                <PerkebunanScheduleList
                  items={scheduleItems.value}
                  onOpen-detail={handleOpenDetail}
                />
              )}

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
  }
})
