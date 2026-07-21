import { defineComponent, ref, computed, onMounted, Teleport } from 'vue'
import { useRouter } from 'vue-router'
import '@/modules/kebun/assets/css/PerkebunanPage.css'
import PerkebunanHeader from '../components/PerkebunanHeader'
import PerkebunanQuickLinks from '../components/PerkebunanQuickLinks'
import PerkebunanRecordingCard from '../components/PerkebunanRecordingCard'
import PerkebunanScheduleList from '../components/PerkebunanScheduleList'
import PerkebunanSelectionModal from '../components/PerkebunanSelectionModal'
import PerkebunanScheduleDetailModal from '../components/PerkebunanScheduleDetailModal'
import PerkebunanConfirmModal from '../components/shared/PerkebunanConfirmModal'
import { landSession, userSession, fetchLandsList, landsList, prefilledPencatatanTaskId } from '@/store/navigation'
import { operatorTasks, fetchTasks, fetchAccountsList } from '@/store/operatorAdmin'
import { useNotifications } from '@/shared/composables/useNotifications'
import {
  fetchPencatatanTypesCatalog,
  jenisPencatatanList,
  rincianPencatatanByJenis,
  addJenisPencatatan,
  addRincianPencatatan,
} from '@/store/pencatatanTypes'

export default defineComponent({
  name: 'PerkebunanPage',
  setup() {
    const router = useRouter()
    const isLogoutConfirmOpen = ref(false)

    const goBackToLogin = () => {
      isLogoutConfirmOpen.value = true
    }

    const confirmLogout = () => {
      isLogoutConfirmOpen.value = false
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      userSession.value = null
      landSession.value = null
      window.location.href = 'http://localhost:3000/?logout=true'
    }

    const activeField = ref<null | 'jenis' | 'rincian'>(null)
    const selectedJenis = ref('Jenis Pencatatan')
    const selectedRincian = ref('Rincian Pencatatan')
    const draftJenis = ref('Jenis Pencatatan')
    const draftRincian = ref('Rincian Pencatatan')
    
    const showDetailModal = ref(false)
    const selectedScheduleItem = ref<any>(null)

    const { notifications, unreadCount, fetchNotifications, markRead } = useNotifications()
    const showNotifications = ref(false)
    
    const currentDateText = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date())

    onMounted(async () => {
      prefilledPencatatanTaskId.value = null
      await fetchNotifications()
      await fetchPencatatanTypesCatalog()
      await fetchAccountsList()
      await fetchLandsList()
      if (operatorTasks.value.length === 0) {
        await fetchTasks()
      }
    })

    const scheduleItems = computed(() => {
      const activeCode = landSession.value?.code || 'L001';
      const now = new Date();
      const localYear = now.getFullYear();
      const localMonth = String(now.getMonth() + 1).padStart(2, '0');
      const localDay = String(now.getDate()).padStart(2, '0');
      const todayStr = `${localYear}-${localMonth}-${localDay}`;

      return operatorTasks.value
        .filter(t => {
          const raw = String(t.rawStatus || '').toLowerCase();
          const stat = String(t.status || '').toLowerCase();
          if (raw === 'menunggu' || raw === 'selesai' || raw === 'approved' || stat === 'selesai' || stat === 'menunggu') {
            return false;
          }
          if (String(t.cageCode || '') !== String(activeCode)) {
            return false;
          }
          // Harian: hanya tampilkan tugas yang batas waktunya hari ini atau sebelumnya (jika belum selesai/terlambat)
          if (t.dueDate > todayStr) {
            return false;
          }
          return t.assigneeCode === 'OP002' || t.assigneeCode === '3' || t.assigneeName.toLowerCase().includes('kebun') || ['panen', 'pemangkasan', 'pembersihan', 'pembuahan', 'penanaman', 'pengendalian hama', 'pemupukan', 'penyiraman'].some(c => t.category.toLowerCase().includes(c));
        })
        .map(t => {
          let name = 'Lahan'
          const matchedLand = landsList.value.find(l => String(l.code) === String(t.cageCode))
          if (matchedLand) {
            const landNameLower = matchedLand.name.toLowerCase()
            const landLocLower = (matchedLand.location || '').toLowerCase()
            if (landNameLower.includes('alpukat') || landLocLower.includes('alpukat')) {
              name = 'Alpukat'
            } else if (landNameLower.includes('kelengkeng') || landLocLower.includes('kelengkeng')) {
              name = 'Kelengkeng'
            }
          }

          // Fallback to text matching in title and description
          if (name === 'Lahan') {
            const titleLower = t.title.toLowerCase()
            if (titleLower.includes('alpukat')) name = 'Alpukat'
            else if (titleLower.includes('kelengkeng')) name = 'Kelengkeng'
            else if (t.description.toLowerCase().includes('alpukat')) name = 'Alpukat'
            else if (t.description.toLowerCase().includes('kelengkeng')) name = 'Kelengkeng'
          }

          const formattedDate = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(t.dueDate))

          let tag: string = t.category
          if (tag === 'umum' && t.title) {
             tag = t.title.split(' ')[0] || 'umum'
          }

          let progress = 'Kerjakan'
          if (t.status === 'selesai') progress = 'Selesai'
          else if (t.status === 'proses') progress = 'Proses'
          else if (t.status === 'terlambat') progress = 'Terlambat'

          // Mappings for rincian based on tag for accurate form prefilling
          let rincian: string = (t as any).rincian;
          if (!rincian) {
            rincian = tag;
            if (tag.toLowerCase() === 'pemangkasan') rincian = 'Pemangkasan Pemeliharaan'
            if (tag.toLowerCase() === 'panen') rincian = 'Panen Buah'
            if (tag.toLowerCase() === 'pemupukan') rincian = 'Pupuk Organik Padat'
          }

          let recurrence = 'Harian'
          const titleDescLower = (t.title + ' ' + t.description).toLowerCase()
          if (titleDescLower.includes('mingguan')) {
            recurrence = 'Mingguan'
          } else if (titleDescLower.includes('bulanan')) {
            recurrence = 'Bulanan'
          } else if (titleDescLower.includes('harian')) {
            recurrence = 'Harian'
          } else {
            const tagLower = tag.toLowerCase()
            if (tagLower.includes('pupuk') || tagLower.includes('pemupukan')) {
              recurrence = 'Mingguan'
            } else if (tagLower.includes('obat') || tagLower.includes('pemberian obat') || tagLower.includes('hama') || tagLower.includes('pesticide')) {
              recurrence = 'Bulanan'
            }
          }

          let cleanTag = tag.charAt(0).toUpperCase() + tag.slice(1)
          if (cleanTag.toLowerCase() === 'pengendalian hama' || cleanTag.toLowerCase() === 'kesehatan') {
            cleanTag = 'Pemberian Obat'
          }
          
          let formattedEndTime = '09 : 00 WIB'
          if (t.endTime && t.endTime.trim()) {
            const clean = t.endTime.split(':').slice(0, 2).join(' : ')
            formattedEndTime = `${clean} WIB`
          } else if (t.dueTime) {
            const parts = t.dueTime.split(':')
            const h = parseInt(parts[0] || '0', 10)
            const m = parseInt(parts[1] || '0', 10)
            const nextH = (h + 1) % 24
            formattedEndTime = `${String(nextH).padStart(2, '0')} : ${String(m).padStart(2, '0')} WIB`
          }
          
          return {
            id: t.id,
            name: name,
            tag: cleanTag,
            date: formattedDate,
            time: t.dueTime ? t.dueTime.replace(':', ' : ') + ' WIB' : '08 : 00 WIB',
            detail: t.cageCode || 'L001',
            progress: progress,
            description: t.description,
            rincian: rincian,
            recurrence: recurrence,
            dueDate: t.dueDate,
            dueTime: t.dueTime,
            endTime: formattedEndTime
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
      prefilledPencatatanTaskId.value = item.id
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
      prefilledPencatatanTaskId.value = null
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
                Say Hi Agro Farm
              </div>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <button class="action-bell-btn" style="background: none; border: none; cursor: pointer; padding: 0; position: relative;" onClick={() => { showNotifications.value = true }}>
                  <img src="/icon/notification/black-24.svg" alt="Notification" style="height: 22px; width: 22px; object-fit: contain;" />
                  {unreadCount.value > 0 && (
                    <span style="position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; font-size: 0.6rem; font-weight: 800; border-radius: 50%; width: 13px; height: 13px; display: flex; align-items: center; justify-content: center; line-height: 1;">
                      {unreadCount.value}
                    </span>
                  )}
                </button>
                <div style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <img src="/icon/logo_farmease.png" alt="FARMease" style="height: 32px; width: 32px; object-fit: contain;" />
                </div>
              </div>
            </header>

            {/* Back Button */}
            <div style="padding: 1rem 1.5rem 0.5rem; display: flex; justify-content: flex-start; flex-shrink: 0; width: 100%; box-sizing: border-box;">
              <button
                onClick={goBackToLogin}
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
            <div style="padding: 0 1.5rem 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; width: 100%; box-sizing: border-box; flex: 1; align-content: flex-start;">
              {/* Card 1: Lahan Alpukat */}
              <div
                onClick={() => {
                  const alpukatLand = landsList.value.find(l => (l.location || '').toLowerCase().includes('alpukat') || (l.name || '').toLowerCase().includes('alpukat'))
                  landSession.value = {
                    id: alpukatLand ? alpukatLand.id : undefined,
                    code: alpukatLand ? alpukatLand.code : 'L001',
                    name: alpukatLand ? alpukatLand.name : 'Lahan Alpukat',
                    area: alpukatLand ? alpukatLand.area : '0 m²',
                    status: alpukatLand ? alpukatLand.status : 'aktif'
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
                  const kelengkengLand = landsList.value.find(l => (l.location || '').toLowerCase().includes('kelengkeng') || (l.name || '').toLowerCase().includes('kelengkeng'))
                  landSession.value = {
                    id: kelengkengLand ? kelengkengLand.id : undefined,
                    code: kelengkengLand ? kelengkengLand.code : 'L002',
                    name: kelengkengLand ? kelengkengLand.name : 'Lahan Kelengkeng',
                    area: kelengkengLand ? kelengkengLand.area : '0 m²',
                    status: kelengkengLand ? kelengkengLand.status : 'aktif'
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
            <PerkebunanConfirmModal
              isOpen={isLogoutConfirmOpen.value}
              title="Konfirmasi Keluar"
              message="Apakah Anda yakin ingin keluar dari halaman perkebunan?"
              confirmLabel="Keluar"
              cancelLabel="Batal"
              onConfirm={confirmLogout}
              onCancel={() => isLogoutConfirmOpen.value = false}
            />

            {/* Notifications Drawer */}
            {renderNotificationsDrawer()}
          </div>
        )
      }

      return (
        <div class="perkebunan-page">
          <div class="perkebunan-shell">
            {/* Header containing unified Back button and global top header area */}
            <PerkebunanHeader
              currentDateText={currentDateText}
              unreadCount={unreadCount.value}
              onBack={() => { landSession.value = null }}
              onBellClick={() => { showNotifications.value = true }}
            />

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
            jenisItems={jenisPencatatanList.value.map((item) => ({ label: item }))}
            rincianItemsByJenis={Object.fromEntries(
              Object.entries(rincianPencatatanByJenis.value).map(([jenis, items]) => [
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
            onAdd={async () => {
              if (activeField.value === 'jenis') {
                const nama = window.prompt('Masukkan nama jenis pencatatan baru:')
                if (!nama?.trim()) return
                try {
                  await addJenisPencatatan(nama.trim())
                } catch {
                  alert('Gagal menambah jenis. Pastikan backend berjalan.')
                }
                return
              }
              const nama = window.prompt('Masukkan nama rincian pencatatan baru:')
              if (!nama?.trim() || draftJenis.value === 'Jenis Pencatatan') return
              try {
                await addRincianPencatatan(draftJenis.value, nama.trim())
              } catch {
                alert('Gagal menambah rincian. Pastikan backend berjalan.')
              }
            }}
          />

          {/* Detail Jadwal Pengingat Modal */}
          <PerkebunanScheduleDetailModal
            open={showDetailModal.value}
            item={selectedScheduleItem.value}
            onClose={() => { showDetailModal.value = false }}
            onNext={handleModalNext}
          />

          <PerkebunanConfirmModal
            isOpen={isLogoutConfirmOpen.value}
            title="Konfirmasi Keluar"
            message="Apakah Anda yakin ingin keluar dari halaman perkebunan?"
            confirmLabel="Keluar"
            cancelLabel="Batal"
            onConfirm={confirmLogout}
            onCancel={() => isLogoutConfirmOpen.value = false}
          />

          {/* Notifications Drawer */}
          {renderNotificationsDrawer()}
        </div>
      )
    }

    function renderNotificationsDrawer() {
      if (!showNotifications.value) return null
      return (
        <Teleport to="body">
          <div
            style="position:fixed; inset:0; background:rgba(0,0,0,0.4); backdrop-filter:blur(3px); z-index:1200; display:flex; align-items:center; justify-content:flex-end;"
            onClick={() => { showNotifications.value = false }}
          >
            <div
              style="background:#ffffff; width:min(100%, 420px); height:100%; display:flex; flex-direction:column; box-shadow:-10px 0 30px rgba(0,0,0,0.15); animation:slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-sizing:border-box;"
              onClick={(e: MouseEvent) => e.stopPropagation()}
            >
              {/* Header */}
              <div style="display:flex; align-items:center; justify-content:space-between; padding:1.25rem 1.5rem; border-bottom:1.5px solid #f0f0eb; flex-shrink:0;">
                <div>
                  <h3 style="margin:0; font-size:1.25rem; font-weight:800; color:#111827; font-family:'Outfit', sans-serif;">Notifikasi</h3>
                  <span style="font-size:0.75rem; color:#6b7280; font-weight:600;">{unreadCount.value} belum dibaca</span>
                </div>
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <button
                    type="button"
                    onClick={() => {
                      notifications.value.forEach(n => { if (!n.is_read) markRead(n.id) })
                    }}
                    style="background:none; border:none; color:#38431f; font-size:0.75rem; font-weight:700; cursor:pointer; text-decoration:underline; padding:0.25rem; font-family:'Outfit', sans-serif;"
                  >
                    Tandai semua dibaca
                  </button>
                  <button
                    type="button"
                    onClick={() => { showNotifications.value = false }}
                    style="background:#f3f4f6; border:none; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:bold; font-size:0.95rem; color:#374151;"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div style="flex:1; overflow-y:auto; padding:1rem 1.5rem; display:flex; flex-direction:column; gap:0.85rem; background:#fbfbf9;">
                {notifications.value.length === 0 ? (
                  <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem; color:#9ca3af; text-align:center; font-family:'Outfit', sans-serif;">
                    <span style="font-size:2.5rem;">🔔</span>
                    <strong style="font-weight:700; color:#374151;">Tidak ada notifikasi baru</strong>
                    <span style="font-size:0.8rem; color:#6b7280;">Semua pemberitahuan telah dibaca atau kosong.</span>
                  </div>
                ) : (
                  notifications.value.map(n => (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.is_read) markRead(n.id) }}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        borderColor: n.is_read ? '#e5e7eb' : '#38431f',
                        boxShadow: n.is_read ? 'none' : '0 2px 8px rgba(56, 67, 31, 0.05)',
                        fontFamily: "'Outfit', sans-serif"
                      }}
                    >
                      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:0.5rem;">
                        <strong style={{
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          color: n.is_read ? '#4b5563' : '#111827'
                        }}>{n.title}</strong>
                        {!n.is_read && (
                          <span style="display:inline-block; width:8px; height:8px; background:#ef4444; border-radius:50%; flex-shrink:0; margin-top:4px;"></span>
                        )}
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: '#4b5563',
                        lineHeight: '1.45',
                        fontWeight: 500
                      }}>{n.message}</p>
                      <span style="font-size:0.72rem; color:#9ca3af; font-weight:600; text-align:right; margin-top:0.25rem;">
                        {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }).format(new Date(n.created_at))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <style>{`
            @keyframes slideInLeft {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </Teleport>
      )
    }
  }
})
