import { defineComponent, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css'
import PerkebunanBackButton from '../components/shared/PerkebunanBackButton'
import { landSession, userSession, fetchCropsList, cropsList } from '@/store/navigation'
import { perawatan, panen, aktivitas, fetchPerawatan, fetchPanen, fetchAktivitas } from '@/store/gardening'
import { pencatatanSubmissions, fetchSubmissions } from '@/store/operatorAdmin'

export default defineComponent({
  name: 'RiwayatPencatatanPage',
  setup() {
    const router = useRouter()
    const query = ref('')
    const selectedCategory = ref('Semua Kegiatan')
    const activeHistoryDetail = ref<any | null>(null)
    const isModalOpen = ref(false)

    onMounted(async () => {
      await Promise.all([
        fetchCropsList(),
        fetchPerawatan(),
        fetchPanen(),
        fetchAktivitas(),
        fetchSubmissions()
      ])
    })

    const activeLandCode = computed(() => landSession.value?.code || 'L001')
    const activeLandName = computed(() => landSession.value?.name || 'Lahan Alpukat')
    const isAlpukat = computed(() => activeLandName.value.toLowerCase().includes('alpukat'))

    const operatorName = computed(() => userSession.value?.name || 'Operator Kebun')
    const operatorCode = computed(() => userSession.value?.code || 'PK001')

    // Unified history items mapped from gardening store + fallbacks
    const historyItems = computed(() => {
      const list: any[] = []
      const activeTrees = cropsList.value.filter(c => c.land === activeLandCode.value).map(c => c.code)

      // 1. Map Perawatan
      perawatan.value
        .filter(p => activeTrees.includes(p.pohon_id) || !p.pohon_id)
        .forEach(p => {
          const lowerType = (p.type || '').toLowerCase()
          if (lowerType === 'stok pupuk' || lowerType === 'stok obat') return

          list.push({
            id: p.id,
            jenis: p.type || 'Perawatan',
            judul: isAlpukat.value ? 'Alpukat' : 'Kelengkeng',
            tanggal: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(p.date || Date.now())),
            detail: `${p.type} • Catatan: ${p.notes || '-'}`,
            rawDate: p.date,
            status: 'Disetujui',
            pohonId: p.pohon_id
          })
        })

      // 2. Map Panen
      panen.value
        .filter(pa => activeTrees.includes(pa.pohon_id) || !pa.pohon_id)
        .forEach(pa => {
          list.push({
            id: pa.id,
            jenis: 'Panen',
            judul: isAlpukat.value ? 'Alpukat' : 'Kelengkeng',
            tanggal: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(pa.date || Date.now())),
            detail: `Panen Buah • Jumlah: ${pa.quantity} kg • Status: ${pa.quality || 'Bagus'}`,
            rawDate: pa.date,
            status: 'Disetujui',
            pohonId: pa.pohon_id
          })
        })

      // 3. Map Aktivitas
      aktivitas.value.forEach(a => {
        const lowerName = (a.name || '').toLowerCase()
        if (lowerName === 'stok pupuk' || lowerName === 'stok obat') return

        list.push({
          id: a.id,
          jenis: a.name || 'Aktivitas',
          judul: isAlpukat.value ? 'Alpukat' : 'Kelengkeng',
          tanggal: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(a.date || Date.now())),
          detail: `${a.name} • Deskripsi: ${a.type || '-'}`,
          rawDate: a.date,
          status: a.status === 'selesai' ? 'Disetujui' : 'Pending',
          pohonId: a.pohon_id
        })
      })

      // 4. Map Pencatatan Submissions (pending, rejected, and approved stock records)
      pencatatanSubmissions.value
        .filter(s => s.cageCode === activeLandCode.value)
        .forEach(s => {
          const type = (s.type || '').toLowerCase()
          const isStock = type === 'stok pupuk' || type === 'stok obat'
          
          if (s.approvalStatus === 'pending' || s.approvalStatus === 'rejected' || isStock) {
            let displayStatus = 'Disetujui'
            if (s.approvalStatus === 'pending') {
              displayStatus = 'Menunggu Persetujuan'
            } else if (s.approvalStatus === 'rejected') {
              displayStatus = 'Ditolak'
            }

            let displayJenis = s.typeLabel || s.type
            if (type === 'stok pupuk') {
              displayJenis = 'Stok Pupuk'
            } else if (type === 'stok obat') {
              displayJenis = 'Stok Obat'
            } else if (type === 'pemupukan') {
              displayJenis = 'Pemupukan'
            } else if (type === 'panen') {
              displayJenis = 'Panen'
            } else if (type === 'pemangkasan') {
              displayJenis = 'Pemangkasan'
            } else if (type === 'pembersihan') {
              displayJenis = 'Pembersihan'
            }

            const item = s.payload?.data?.items?.[0] || {}
            let detail = s.summary || ''
            
            if (type === 'stok pupuk' || type === 'stok obat') {
              detail = `Stok Baru: ${item.namaObat || item.namaPupuk || '-'} • Vol: ${item.volumeObat || item.volumePupuk || '-'} ${item.satuanVolumeObat || item.satuanVolumePupuk || ''}`
            } else if (type === 'pemupukan') {
              detail = `Pemupukan • Jenis: ${item.jenisPupuk || '-'} • Berat: ${item.jumlahBeratPupuk || '-'} kg`
            } else if (type === 'panen') {
              detail = `Panen Buah • Jumlah: ${item.jumlahPanen || '-'} kg`
            }

            list.push({
              id: s.id,
              jenis: displayJenis,
              judul: isAlpukat.value ? 'Alpukat' : 'Kelengkeng',
              tanggal: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(s.submittedAt || Date.now())),
              detail: detail,
              rawDate: s.submittedAt,
              status: displayStatus,
              pohonId: item.kodePohon || ''
            })
          }
        })

      // Sort by date descending
      list.sort((a, b) => {
        const da = a.rawDate ? new Date(a.rawDate).getTime() : 0
        const db = b.rawDate ? new Date(b.rawDate).getTime() : 0
        return db - da
      })

      return list
    })

    const filteredHistory = computed(() => {
      const q = query.value.trim().toLowerCase()
      const category = selectedCategory.value

      return historyItems.value.filter(item => {
        const matchesQuery = !q || [item.jenis, item.judul, item.detail].some(field => field.toLowerCase().includes(q))
        const matchesCategory = category === 'Semua Kegiatan' || item.jenis.toLowerCase() === category.toLowerCase()
        return matchesQuery && matchesCategory
      })
    })

    const categoryOptions = computed(() => {
      const categories = new Set(historyItems.value.map(item => item.jenis))
      return ['Semua Kegiatan', ...Array.from(categories)]
    })

    const openHistoryDetail = (item: any) => {
      activeHistoryDetail.value = item
      isModalOpen.value = true
    }

    const closeHistoryDetail = () => {
      activeHistoryDetail.value = null
      isModalOpen.value = false
    }

    const activeCrop = computed(() => {
      if (!activeHistoryDetail.value || !activeHistoryDetail.value.pohonId) return null
      const target = String(activeHistoryDetail.value.pohonId)
      return cropsList.value.find(c => String(c.id) === target || String(c.code).toLowerCase() === target.toLowerCase())
    })

    const getDetailRincian = (detail: string) => {
      if (!detail) return '-'
      const parts = detail.split('•')
      if (parts.length > 1) {
        const rincianPart = parts.find(p => p.includes('Jenis:') || p.includes('Jumlah:') || p.includes('Deskripsi:') || p.includes('Volume:'))
        if (rincianPart) {
          return rincianPart.split(':')[1]?.trim() || rincianPart.trim()
        }
        return parts[1].trim()
      }
      return detail
    }

    return () => (
      <div class="detail-page" style="background: #ffffff; min-height: 100vh; font-family: 'Outfit', sans-serif; padding: 1.5rem; box-sizing: border-box; width: 100%;">
        <div class="detail-shell" style="max-width: 1200px; margin: 0 auto; width: 100%;">
          
          {/* Topbar Back button */}
          <header class="detail-topbar" style="display: flex; align-items: center; margin-bottom: 1.5rem;">
            <button
              onClick={() => router.push({ name: 'kebun' })}
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
          </header>

          {/* Green Title Header Banner */}
          <div
            style="
              background: #38431f;
              color: #ffffff;
              border-radius: 0.75rem;
              padding: 1.5rem;
              display: flex;
              flex-direction: column;
              gap: 1.25rem;
              margin-bottom: 1.5rem;
            "
          >
            <h2 style="margin: 0; font-size: 1.55rem; font-weight: 800; letter-spacing: -0.01em; text-align: center;">
              Riwayat Pencatatan
            </h2>

            {/* Sub-cards Row */}
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
              {/* Card 1: Active Land */}
              <div
                style="
                  background: #ffffff;
                  border-radius: 0.65rem;
                  padding: 1rem;
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;
                  color: #111827;
                "
              >
                <div style="width: 2.5rem; height: 2.5rem; background: #f4f5f0; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img
                    src={isAlpukat.value ? '/icon/alpukat.png' : '/icon/kelengkeng.png'}
                    alt="Land Icon"
                    style="width: 1.75rem; height: 1.75rem; object-fit: contain;"
                  />
                </div>
                <div>
                  <strong style="font-size: 0.95rem; color: #111827; display: block; font-weight: 800;">
                    {activeLandName.value}
                  </strong>
                  <span style="font-size: 0.75rem; color: #6b7280; font-weight: 600;">
                    ID Lahan: {activeLandCode.value}
                  </span>
                </div>
              </div>

              {/* Card 2: Operator Info */}
              <div
                style="
                  background: #ffffff;
                  border-radius: 0.65rem;
                  padding: 1rem;
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;
                  color: #111827;
                "
              >
                <div style="width: 2.5rem; height: 2.5rem; background: #f4f5f0; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img
                    src="/icon/operator.png"
                    alt="Operator"
                    style="width: 1.75rem; height: 1.75rem; object-fit: contain;"
                  />
                </div>
                <div>
                  <strong style="font-size: 0.95rem; color: #111827; display: block; font-weight: 800;">
                    {operatorName.value}
                  </strong>
                  <span style="font-size: 0.75rem; color: #6b7280; font-weight: 600;">
                    ID Pengguna: {operatorCode.value}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Box & Dropdown Filter */}
          <div style="display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center; flex-wrap: wrap;">
            <div style="position: relative; flex: 1; display: flex; align-items: center; min-width: 240px;">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                style="position: absolute; left: 1rem; color: #9ca3af; pointer-events: none;"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Cari pohon"
                value={query.value}
                onInput={(e) => { query.value = (e.target as HTMLInputElement).value }}
                style="
                  width: 100%;
                  height: 42px;
                  border: 1px solid #e5e7eb;
                  border-radius: 999px;
                  padding: 0 1rem 0 2.75rem;
                  outline: none;
                  font-size: 0.9rem;
                  font-weight: 600;
                  color: #374151;
                  box-sizing: border-box;
                "
              />
            </div>
            
            <select
              value={selectedCategory.value}
              onChange={(e: any) => selectedCategory.value = e.target.value}
              style="
                height: 42px;
                width: 100%;
                max-width: 220px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 0 0.75rem;
                font-weight: 600;
                color: #374151;
                background-color: #ffffff;
                outline: none;
                cursor: pointer;
                box-sizing: border-box;
              "
            >
              {categoryOptions.value.map(opt => (
                <option value={opt} key={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Heading */}
          <h3 style="font-size: 1.2rem; font-weight: 800; color: #111827; margin: 0 0 1rem 0;">
            Riwayat Pencatatan
          </h3>

          {/* Grid List Cards */}
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
            {filteredHistory.value.map((item) => {
              const isApproved = item.status === 'Disetujui'
              return (
                <div
                  key={item.id}
                  style="
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.75rem;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.85rem;
                    box-sizing: border-box;
                  "
                >
                  {/* Card Top: Status & Date Badges */}
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    {/* Status */}
                    <span
                      style={`
                        font-size: 0.7rem;
                        font-weight: 800;
                        padding: 0.22rem 0.65rem;
                        border-radius: 6px;
                        ${isApproved ? 'background: #7a8857; color: #ffffff;' : item.status === 'Ditolak' ? 'background: #dc3545; color: #ffffff;' : 'background: #e29c33; color: #ffffff;'}
                      `}
                    >
                      {item.status}
                    </span>
                    {/* Date */}
                    <div style="display: flex; align-items: center; gap: 0.25rem; border: 1px solid #e5e7eb; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; color: #6b7280;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {item.tanggal}
                    </div>
                  </div>

                  {/* Divider line */}
                  <div style="height: 1px; background: #e5e7eb;"></div>

                  {/* Card Middle: Icon, Title & Detail, Button */}
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <div style="width: 2.5rem; height: 2.5rem; background: #f4f5f0; border-radius: 0.4rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <img
                          src={isAlpukat.value ? '/icon/alpukat.png' : '/icon/kelengkeng.png'}
                          alt="Activity Icon"
                          style="width: 1.75rem; height: 1.75rem; object-fit: contain;"
                        />
                      </div>
                      <div>
                        <strong style="font-size: 0.9rem; color: #111827; font-weight: 800; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">
                          {item.jenis}
                        </strong>
                        <span style="font-size: 0.75rem; color: #6b7280; font-weight: 700; display: block; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">
                          {item.detail.split('•')[0].trim()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openHistoryDetail(item)}
                      style="
                        background: #2e3b1f;
                        color: #ffffff;
                        border: none;
                        border-radius: 0.45rem;
                        padding: 0.45rem 0.75rem;
                        font-weight: 700;
                        font-size: 0.75rem;
                        cursor: pointer;
                        white-space: nowrap;
                      "
                    >
                      Lihat Riwayat
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Modal Popup Overlay */}
          {isModalOpen.value && activeHistoryDetail.value && (
            <div
              style="
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(2px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1.5rem;
              "
            >
              {/* Modal Container */}
              <div
                style="
                  background: #ffffff;
                  border-radius: 1rem;
                  width: 100%;
                  max-width: 460px;
                  padding: 1.5rem;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                  position: relative;
                  box-sizing: border-box;
                "
              >
                {/* Close Button X at top left */}
                <div style="display: flex; justify-content: flex-start; margin-bottom: 0.5rem; width: 100%;">
                  <button
                    onClick={closeHistoryDetail}
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

                {/* Modal Title inside green pill banner */}
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
                  Rincian Riwayat Pencatatan
                </div>

                {/* Detail Times */}
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; margin-bottom: 1.25rem; padding: 0 1.5rem;">
                  <span style="color: #374151;">Waktu Mulai: <span style="font-weight: 800;">22 : 00 WIB</span></span>
                  <span style="color: #ef4444;">Waktu Tenggat: <span style="font-weight: 800;">22 : 00 WIB</span></span>
                </div>

                {/* Vertical Land & Operator cards */}
                <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
                  {/* Land Info */}
                  <div
                    style="
                      border: 1px solid #e5e7eb;
                      border-radius: 0.65rem;
                      padding: 0.75rem;
                      display: flex;
                      align-items: center;
                      gap: 0.75rem;
                      background: #ffffff;
                    "
                  >
                    <div style="width: 2.2rem; height: 2.2rem; background: #f4f5f0; border-radius: 0.4rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <img
                        src={isAlpukat.value ? '/icon/alpukat.png' : '/icon/kelengkeng.png'}
                        alt="Land"
                        style="width: 1.5rem; height: 1.5rem; object-fit: contain;"
                      />
                    </div>
                    <div>
                      <strong style="font-size: 0.85rem; color: #111827; display: block; font-weight: 800;">
                        {activeLandName.value}
                      </strong>
                      <span style="font-size: 0.7rem; color: #6b7280; font-weight: 600;">
                        ID Lahan: {activeLandCode.value}
                      </span>
                    </div>
                  </div>

                  {/* Operator Info */}
                  <div
                    style="
                      border: 1px solid #e5e7eb;
                      border-radius: 0.65rem;
                      padding: 0.75rem;
                      display: flex;
                      align-items: center;
                      gap: 0.75rem;
                      background: #ffffff;
                    "
                  >
                    <div style="width: 2.2rem; height: 2.2rem; background: #f4f5f0; border-radius: 0.4rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <img
                        src="/icon/operator.png"
                        alt="Operator"
                        style="width: 1.5rem; height: 1.5rem; object-fit: contain;"
                      />
                    </div>
                    <div>
                      <strong style="font-size: 0.85rem; color: #111827; display: block; font-weight: 800;">
                        {operatorName.value}
                      </strong>
                      <span style="font-size: 0.7rem; color: #6b7280; font-weight: 600;">
                        ID Pengguna: {operatorCode.value}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informasi Lengkap Heading */}
                <h4 style="font-size: 0.9rem; font-weight: 800; color: #111827; margin: 0 0 0.75rem 0;">
                  Informasi Lengkap
                </h4>

                {/* Table Data */}
                <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden; margin-bottom: 1.25rem; font-size: 0.8rem; font-weight: 700; color: #374151;">
                  {/* Tanggal */}
                  <div style="display: flex; justify-content: space-between; padding: 0.6rem 0.85rem; border-bottom: 1px solid #e5e7eb; background: #fafafa;">
                    <span style="color: #6b7280;">Tanggal</span>
                    <span>{activeHistoryDetail.value.tanggal}</span>
                  </div>

                  {/* Fase Pohon */}
                  <div style="display: flex; justify-content: space-between; padding: 0.6rem 0.85rem; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">Fase Pohon</span>
                    <span>{activeCrop.value ? activeCrop.value.type : 'Vegetatif'}</span>
                  </div>

                  {/* Varietas */}
                  <div style="display: flex; justify-content: space-between; padding: 0.6rem 0.85rem; border-bottom: 1px solid #e5e7eb; background: #fafafa;">
                    <span style="color: #6b7280;">Varietas</span>
                    <span>{activeCrop.value ? activeCrop.value.name : (isAlpukat.value ? 'Alpukat Aligator' : 'Kelengkeng Bangkok')}</span>
                  </div>

                  {/* Jenis Pencatatan */}
                  <div style="display: flex; justify-content: space-between; padding: 0.6rem 0.85rem; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">Jenis Pencatatan</span>
                    <span>{activeHistoryDetail.value.jenis}</span>
                  </div>

                  {/* Rincian */}
                  <div style="display: flex; justify-content: space-between; padding: 0.6rem 0.85rem; border-bottom: 1px solid #e5e7eb; background: #fafafa;">
                    <span style="color: #6b7280;">Rincian</span>
                    <span>{getDetailRincian(activeHistoryDetail.value.detail)}</span>
                  </div>

                  {/* Rutinitas */}
                  <div style="display: flex; justify-content: space-between; padding: 0.6rem 0.85rem;">
                    <span style="color: #6b7280;">Rutinitas</span>
                    <span>{activeHistoryDetail.value.rutinitas || 'Bulanan'}</span>
                  </div>
                </div>

                {/* Deskripsi Heading */}
                <h4 style="font-size: 0.9rem; font-weight: 800; color: #111827; margin: 0 0 0.5rem 0;">
                  Deskripsi
                </h4>

                {/* Deskripsi Area */}
                <div
                  style="
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    padding: 0.75rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #374151;
                    min-height: 48px;
                    margin-bottom: 1.5rem;
                    background: #ffffff;
                  "
                >
                  {(() => {
                    const detail = activeHistoryDetail.value.detail
                    if (detail.includes('Catatan:')) {
                      return detail.split('Catatan:')[1].trim()
                    }
                    if (detail.includes('Deskripsi:')) {
                      return detail.split('Deskripsi:')[1].trim()
                    }
                    return detail || 'Pekerjaan selesai dengan baik.'
                  })()}
                </div>

                {/* Selanjutnya/Close Button */}
                <button
                  onClick={closeHistoryDetail}
                  style="
                    width: 100%;
                    height: 42px;
                    background: #233512;
                    color: #ffffff;
                    border: none;
                    border-radius: 2rem;
                    font-weight: 700;
                    font-size: 0.88rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                  "
                >
                  Selanjutnya
                </button>

              </div>
            </div>
          )}

        </div>
      </div>
    )
  }
})
