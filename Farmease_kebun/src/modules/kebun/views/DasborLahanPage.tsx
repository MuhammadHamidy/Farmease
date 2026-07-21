import { defineComponent, computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css'
import PerkebunanBackButton from '../components/shared/PerkebunanBackButton'
import { landSession, userSession, cropsList, fetchCropsList, panenList, fetchPanenList, landsList, fetchLandsList } from '@/store/navigation'
import apiClient from '@/shared/api/client'

export default defineComponent({
  name: 'DasborLahanPage',
  setup() {
    const router = useRouter()
    const currentDateText = ref('')
    const currentTimeText = ref('')

    const updateDateTime = () => {
      const now = new Date()
      currentDateText.value = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(now)
      
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      currentTimeText.value = `${hours}.${minutes} WIB`
    }

    onMounted(async () => {
      updateDateTime()
      const interval = setInterval(updateDateTime, 60000)
      
      await Promise.all([
        fetchLandsList(),
        fetchCropsList(),
        fetchPanenList()
      ])
    })

    // Active Land Details
    const activeLandCode = computed(() => landSession.value?.code || 'L001')
    const activeLandName = computed(() => landSession.value?.name || 'Lahan Alpukat')
    const isAlpukat = computed(() => activeLandName.value.toLowerCase().includes('alpukat'))

    const operatorName = computed(() => userSession.value?.name || 'Operator Kebun')
    const operatorCode = computed(() => userSession.value?.code || 'PK0001')

    // Calculated metrics
    const landArea = computed(() => {
      const land = landsList.value.find(l => l.code === activeLandCode.value)
      if (land) {
        const val = parseFloat(land.area) || 0
        return `${val} Hektar`
      }
      return '0 Hektar'
    })

    const cropsCount = computed(() => {
      const count = cropsList.value.filter(c => c.land === activeLandCode.value).length
      return `${count} Pohon`
    })

    const totalHarvest = computed(() => {
      const land = landsList.value.find(l => l.code === activeLandCode.value)
      const landId = landSession.value?.id || (land ? land.id : null)
      
      let sum = 0
      if (landId) {
        sum = panenList.value
          .filter(p => String(p.id_pohon) === String(landId))
          .reduce((acc, curr) => acc + (Number(curr.jumlah_panen) || 0), 0)
      }

      return `${sum.toLocaleString('id-ID')} Kg`
    })

    // Tree Phases count for the bar chart matching user specs
    const phaseData = computed(() => {
      const landCrops = cropsList.value.filter(c => c.land === activeLandCode.value)
      
      let belumProduktif = 0
      let produktif = 0
      let vegetatif = 0
      let generatif = 0

      landCrops.forEach(c => {
        const typeLower = (c.type || '').toLowerCase()
        const ageVal = parseInt(c.age) || 0

        if (typeLower.includes('belum produktif') || typeLower.includes('tidak produktif') || typeLower.includes('bibit') || typeLower.includes('pembibitan')) {
          belumProduktif++
        } else if (typeLower.includes('vegetatif')) {
          vegetatif++
        } else if (typeLower.includes('generatif')) {
          generatif++
        } else if (typeLower.includes('produktif')) {
          produktif++
        } else {
          // Fallback based on age: 0-3 years -> Belum Produktif, >=4 years -> Produktif
          if (ageVal > 0 && ageVal <= 3) {
            belumProduktif++
          } else if (ageVal >= 4) {
            produktif++
          } else {
            // Default fallback
            vegetatif++
          }
        }
      })

      return { belumProduktif, produktif, vegetatif, generatif }
    })

    // Monthly harvest data for line chart
    const monthlyHarvest = computed(() => {
      const data = [0, 0, 0, 0, 0, 0]
      const land = landsList.value.find(l => l.code === activeLandCode.value)
      const landId = landSession.value?.id || (land ? land.id : null)
      
      panenList.value.forEach(p => {
        if (landId && String(p.id_pohon) === String(landId)) {
          const date = new Date(p.tanggal_panen)
          const month = date.expandMonth ? date.expandMonth() : date.getMonth()
          if (month >= 0 && month <= 5) {
            data[month] = (data[month] ?? 0) + (Number(p.jumlah_panen) || 0)
          }
        }
      })
      return data
    })

    const handleExport = async () => {
      try {
        const [rawLands, rawTrees, rawPengobatan, rawPemupukan, rawPenyiraman, rawPanen, rawPemangkasan] = await Promise.all([
          apiClient.get<any[]>('/api/v1/lahan').catch(() => []),
          apiClient.get<any[]>('/api/v1/pohon').catch(() => []),
          apiClient.get<any[]>('/api/v1/pengobatan').catch(() => []),
          apiClient.get<any[]>('/api/v1/pemupukan').catch(() => []),
          apiClient.get<any[]>('/api/v1/penyiraman').catch(() => []),
          apiClient.get<any[]>('/api/v1/panen').catch(() => []),
          apiClient.get<any[]>('/api/v1/pemangkasan').catch(() => [])
        ])

        const lands = Array.isArray(rawLands) ? rawLands : []
        const trees = Array.isArray(rawTrees) ? rawTrees : []
        const pengobatanList = Array.isArray(rawPengobatan) ? rawPengobatan : []
        const pemupukanList = Array.isArray(rawPemupukan) ? rawPemupukan : []
        const penyiramanList = Array.isArray(rawPenyiraman) ? rawPenyiraman : []
        const panenList = Array.isArray(rawPanen) ? rawPanen : []
        const pemangkasanList = Array.isArray(rawPemangkasan) ? rawPemangkasan : []

        const perawatanList = [
          ...pengobatanList.map(o => ({
            ...o,
            id_perawatan: o.id_pengobatan,
            jenis_bahan: 'obat',
            id_lahan: o.Lahan_id_lahan
          })),
          ...pemupukanList.map(f => ({
            ...f,
            id_perawatan: f.id_pemupukan,
            jenis_bahan: 'pupuk',
            id_lahan: f.Lahan_id_lahan,
            nama_obat: f.nama_pupuk,
            deskripsi: f.deskripsi
          })),
          ...penyiramanList.map(w => ({
            ...w,
            id_perawatan: w.id_penyiraman,
            jenis_bahan: 'air',
            id_lahan: w.Lahan_id_lahan,
            teknik_perawatan: w.teknik_penyiraman,
            deskripsi: w.deskripsi
          }))
        ]

        let currentLand = lands.find((l: any) => l.kode_lahan === activeLandCode.value)
        if (!currentLand) {
          currentLand = {
            id_lahan: landSession.value?.id || 1,
            id: landSession.value?.id || 1,
            kode_lahan: activeLandCode.value,
            nama_lahan: activeLandName.value,
            tanggal_tanam: '-',
            fase_tanam: '-',
            varietas: '-'
          }
        }

        const currentLandId = currentLand.id_lahan || currentLand.id
        const currentTrees = trees.filter((t: any) => 
          String(t.Lahan_id_lahan || t.id_lahan) === String(currentLandId) ||
          String(t.lahan_code) === String(activeLandCode.value)
        )
        const currentPerawatan = perawatanList.filter((p: any) => String(p.Lahan_id_lahan || p.id_lahan) === String(currentLandId))
        const currentPanen = panenList.filter((p: any) => String(p.Lahan_id_lahan || p.id_lahan) === String(currentLandId))
        const currentPemangkasan = pemangkasanList.filter((p: any) => String(p.Lahan_id_lahan || p.id_lahan) === String(currentLandId))

        const csvRows: string[][] = []

        // CSV Header
        csvRows.push([
          'Kategori Data',
          'Tanggal',
          'Kode Lahan',
          'Nama Lahan',
          'Kode/Detail Pohon',
          'Nama Item / Aktivitas',
          'Jumlah / Dosis',
          'Satuan',
          'Deskripsi / Catatan'
        ])

        // Add Land Info
        csvRows.push([
          'Lahan',
          currentLand.tanggal_tanam || '-',
          currentLand.kode_lahan || '-',
          currentLand.nama_lahan || '-',
          '-',
          currentLand.varietas || 'Tanaman',
          String(currentLand.luas_lahan || currentLand.luas || 0),
          'Hektar',
          `Fase Tanam: ${currentLand.fase_tanam || '-'}`
        ])

        // Add Trees
        currentTrees.forEach((t: any) => {
          let age = t.umur
          if (!age && t.tanggal_tanam) {
            const plantedYear = new Date(t.tanggal_tanam).getFullYear()
            const currentYear = new Date().getFullYear()
            age = Math.max(1, currentYear - plantedYear)
          }

          csvRows.push([
            'Pohon',
            t.tanggal_tanam ? t.tanggal_tanam.split('T')[0] : (t.created_at ? t.created_at.split('T')[0] : '-'),
            currentLand.kode_lahan || '-',
            currentLand.nama_lahan || '-',
            t.kode_pohon || '-',
            t.varietas || t.nama_pohon || t.jenis || '-',
            String(age || 0),
            'Tahun',
            `Status: ${t.fase_pohon || t.status || '-'}`
          ])
        })

        // Add Pemupukan & Pemberian Obat
        currentPerawatan.forEach((p: any) => {
          const jenisBahan = (p.jenis_bahan || '').toLowerCase()
          let kategori = 'Perawatan'
          if (jenisBahan === 'pupuk') {
            kategori = 'Pemupukan'
          } else if (jenisBahan === 'obat') {
            kategori = 'Pemberian Obat'
          }

          csvRows.push([
            kategori,
            p.tanggal_aktivitas || '-',
            currentLand.kode_lahan || '-',
            currentLand.nama_lahan || '-',
            p.detail_pohon || '-',
            p.nama_obat || p.jenis_perawatan || '-',
            String(p.dosis || 0),
            p.satuan || '-',
            `Teknik: ${p.teknik_perawatan || '-'}, Bagian: ${p.bagian_pohon || '-'}, Catatan: ${p.deskripsi || '-'}`
          ])
        })

        // Add Panen
        currentPanen.forEach((pa: any) => {
          csvRows.push([
            'Panen',
            pa.tanggal_aktivitas || '-',
            currentLand.kode_lahan || '-',
            currentLand.nama_lahan || '-',
            '-',
            pa.nama_rincian_aktivitas || 'Panen Buah',
            String(pa.jumlah || 0),
            pa.satuan || 'kg',
            'Selesai'
          ])
        })

        // Add Pemangkasan
        currentPemangkasan.forEach((pe: any) => {
          csvRows.push([
            'Pemangkasan',
            pe.tanggal_aktivitas || '-',
            currentLand.kode_lahan || '-',
            currentLand.nama_lahan || '-',
            '-',
            'Pemangkasan Pemeliharaan',
            String(pe.jumlah || 0),
            pe.satuan || 'kg',
            pe.keterangan || '-'
          ])
        })

        const csvContent = csvRows
          .map((row) =>
            row
              .map((val) => {
                const escaped = String(val).replace(/"/g, '""')
                return `"${escaped}"`
              })
              .join(',')
          )
          .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        
        const dateStr = new Date().toISOString().split('T')[0]
        const filename = `Ekspor_Data_${currentLand.nama_lahan.replace(/\s+/g, '_')}_${dateStr}.csv`
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err: any) {
        console.error('Gagal mengekspor data:', err)
        alert('Gagal mengekspor data: ' + (err?.message || err || 'Terjadi kesalahan.'))
      }
    }

    return () => (
      <div class="detail-page" style="background: #ffffff; min-height: 100vh; font-family: 'Outfit', sans-serif; padding: 1.5rem; box-sizing: border-box; width: 100%;">
        <div class="detail-shell" style="max-width: 1240px; margin: 0 auto; width: 100%;">
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

          {/* Main Dashboard Green Header Banner */}
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
            {/* Title & DateTime */}
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(255, 255, 255, 0.2); padding-bottom: 1rem;">
              <h2 style="margin: 0; font-size: 1.55rem; font-weight: 800; letter-spacing: -0.01em; flex: 1; text-align: center;">
                Dasbor Perkebunan
              </h2>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #dce1d0; font-weight: 700; margin-top: -0.5rem; padding: 0 0.5rem;">
              <span>Tanggal : {currentDateText.value}</span>
              <span>{currentTimeText.value}</span>
            </div>

             {/* Sub-cards Row */}
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
              {/* Card 1: Active Land Info */}
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

          {/* Ekspor Data Kebun (Full-width Section) */}
          <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
            <strong style={{ fontSize: '0.9rem', color: '#111827', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>Ekspor Data Kebun</strong>
            <button
              type="button"
              class="pencatatan-mode-btn is-active"
              onClick={handleExport}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download CSV
            </button>
          </div>

          {/* Stats Cards Grid - 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '2rem 1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem', fontFamily: "'Nunito', sans-serif" }}>{landArea.value}</span>
              <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Total Luas Lahan {isAlpukat.value ? 'Alpukat' : 'Kelengkeng'}</strong>
            </div>
            <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '2rem 1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem', fontFamily: "'Nunito', sans-serif" }}>{cropsCount.value}</span>
              <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Total Pohon</strong>
            </div>
          </div>

          {/* Stats Card - Full width */}
          <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '2rem 1rem', textAlign: 'center', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem', fontFamily: "'Nunito', sans-serif" }}>{totalHarvest.value}</span>
            <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Jumlah Panen {isAlpukat.value ? 'Alpukat' : 'Kelengkeng'}</strong>
          </div>

          {/* Two Premium SVG Visualizations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Visual 1: Hasil Panen Line Chart */}
            <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#111827' }}>
                Hasil Panen {isAlpukat.value ? 'Alpukat' : 'Kelengkeng'}
              </h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: '#6B7280', fontWeight: '600' }}>
                Data 6 bulan terakhir (kg)
              </p>
              
              {/* Legend */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: '700', color: '#374151' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#38431F', borderRadius: '2px', display: 'inline-block' }}></span>
                  <span>Per lahan</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#A5B892', borderRadius: '2px', display: 'inline-block' }}></span>
                  <span>Per pohon (rata-rata)</span>
                </div>
              </div>

              {/* Line Chart Grid SVG - Dynamic */}
              {(() => {
                const data = monthlyHarvest.value
                const sum = data.reduce((acc, curr) => acc + curr, 0)
                if (sum === 0) {
                  return (
                    <div style="height: 180px; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-weight: 700; font-size: 0.85rem; width: 100%;">
                      Tidak ada data panen dalam 6 bulan terakhir
                    </div>
                  )
                }
                const maxVal = Math.max(60, ...data)
                const scale = 140 / maxVal
                const xPoints = [45, 110, 175, 240, 305, 370]
                const yPoints = data.map(v => 170 - v * scale)
                const treeCount = cropsList.value.filter(c => c.land === activeLandCode.value).length || 1
                const avgData = data.map(v => v / treeCount)
                const yAvgPoints = avgData.map(v => 170 - v * scale)
                const pathD = `M ${xPoints.map((x, i) => `${x} ${yPoints[i]}`).join(' L ')}`
                const avgPathD = `M ${xPoints.map((x, i) => `${x} ${yAvgPoints[i]}`).join(' L ')}`
                return (
                  <div style="position: relative; width: 100%; height: 180px;">
                    <svg viewBox="0 0 400 200" width="100%" height="100%" style="overflow: visible;">
                      <line x1="30" y1="30" x2="380" y2="30" stroke="#f3f4f6" stroke-width="1" />
                      <line x1="30" y1="70" x2="380" y2="70" stroke="#f3f4f6" stroke-width="1" />
                      <line x1="30" y1="110" x2="380" y2="110" stroke="#f3f4f6" stroke-width="1" />
                      <line x1="30" y1="150" x2="380" y2="150" stroke="#f3f4f6" stroke-width="1" />
                      <line x1="30" y1="170" x2="380" y2="170" stroke="#9ca3af" stroke-width="1" />
                      <text x="20" y="34" font-size="8" fill="#9ca3af" text-anchor="end">{Math.round(maxVal)}</text>
                      <text x="20" y="74" font-size="8" fill="#9ca3af" text-anchor="end">{Math.round(maxVal * 2/3)}</text>
                      <text x="20" y="114" font-size="8" fill="#9ca3af" text-anchor="end">{Math.round(maxVal / 3)}</text>
                      <text x="20" y="154" font-size="8" fill="#9ca3af" text-anchor="end">0</text>
                      <text x="15" y="100" font-size="8" fill="#9ca3af" text-anchor="middle" transform="rotate(-90 15 100)">HASIL PANEN (KG)</text>
                      <text x="45" y="185" font-size="8" fill="#9ca3af" text-anchor="middle">Jan</text>
                      <text x="110" y="185" font-size="8" fill="#9ca3af" text-anchor="middle">Feb</text>
                      <text x="175" y="185" font-size="8" fill="#9ca3af" text-anchor="middle">Mar</text>
                      <text x="240" y="185" font-size="8" fill="#9ca3af" text-anchor="middle">Apr</text>
                      <text x="305" y="185" font-size="8" fill="#9ca3af" text-anchor="middle">Mei</text>
                      <text x="370" y="185" font-size="8" fill="#9ca3af" text-anchor="middle">Jun</text>
                      <text x="205" y="198" font-size="8" fill="#9ca3af" text-anchor="middle" font-weight="700">BULAN</text>
                      <path d={pathD} fill="none" stroke="#2f3b1d" stroke-width="2.5" stroke-linecap="round" />
                      {xPoints.map((x, i) => <circle key={`p1-${i}`} cx={x} cy={yPoints[i] ?? 170} r="3.5" fill="#2f3b1d" />)}
                      <path d={avgPathD} fill="none" stroke="#a5b892" stroke-width="2" stroke-linecap="round" stroke-dasharray="3,3" />
                      {xPoints.map((x, i) => <circle key={`p2-${i}`} cx={x} cy={yAvgPoints[i] ?? 170} r="3" fill="#a5b892" />)}
                    </svg>
                  </div>
                )
              })()}
            </div>

            {/* Visual 2: Jumlah Pohon (per fase pohon) Bar Chart */}
            <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#111827' }}>
                Jumlah pohon (per fase pohon)
              </h3>
              
              {/* Legend Grid */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.73rem', fontWeight: '700', color: '#374151', width: '100%', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#d2c5b3', borderRadius: '2px', display: 'inline-block', flexShrink: 0 }}></span>
                  <span>Belum Produktif (0-3 tahun): {phaseData.value.belumProduktif}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#372d24', borderRadius: '2px', display: 'inline-block', flexShrink: 0 }}></span>
                  <span>Produktif (>4 tahun): {phaseData.value.produktif}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#2d3b1d', borderRadius: '2px', display: 'inline-block', flexShrink: 0 }}></span>
                  <span>Vegetatif: {phaseData.value.vegetatif}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#7c8e65', borderRadius: '2px', display: 'inline-block', flexShrink: 0 }}></span>
                  <span>Generatif: {phaseData.value.generatif}</span>
                </div>
              </div>

              {/* Bar Chart SVG */}
              <div style="position: relative; width: 100%; height: 160px;">
                <svg viewBox="0 0 400 160" width="100%" height="100%" style="overflow: visible;">
                  {/* Axis */}
                  <line x1="30" y1="130" x2="380" y2="130" stroke="#9ca3af" stroke-width="1" />
                  
                  {/* Grid Lines */}
                  <line x1="30" y1="30" x2="380" y2="30" stroke="#f3f4f6" stroke-width="1" />
                  <line x1="30" y1="80" x2="380" y2="80" stroke="#f3f4f6" stroke-width="1" />

                  {/* Y Axis Labels */}
                  {(() => {
                    const maxVal = Math.max(5, phaseData.value.belumProduktif, phaseData.value.produktif, phaseData.value.vegetatif, phaseData.value.generatif)
                    return (
                      <>
                        <text x="20" y="34" font-size="8" fill="#9ca3af" text-anchor="end">{maxVal}</text>
                        <text x="20" y="84" font-size="8" fill="#9ca3af" text-anchor="end">{Math.round(maxVal / 2)}</text>
                        <text x="20" y="134" font-size="8" fill="#9ca3af" text-anchor="end">0</text>
                        <text x="12" y="80" font-size="8" fill="#9ca3af" text-anchor="middle" transform="rotate(-90 12 80)">JUMLAH POHON</text>

                        {/* Bars & Labels */}
                        {/* Belum Produktif Bar */}
                        <rect x="50" y={130 - (phaseData.value.belumProduktif / maxVal) * 100} width="24" height={(phaseData.value.belumProduktif / maxVal) * 100} fill="#d2c5b3" rx="3" />
                        <text x="62" y="143" font-size="6.5" fill="#6B7280" text-anchor="middle">Belum Prod</text>

                        {/* Produktif Bar */}
                        <rect x="130" y={130 - (phaseData.value.produktif / maxVal) * 100} width="24" height={(phaseData.value.produktif / maxVal) * 100} fill="#372d24" rx="3" />
                        <text x="142" y="143" font-size="6.5" fill="#6B7280" text-anchor="middle">Produktif</text>

                        {/* Vegetatif Bar */}
                        <rect x="210" y={130 - (phaseData.value.vegetatif / maxVal) * 100} width="24" height={(phaseData.value.vegetatif / maxVal) * 100} fill="#2d3b1d" rx="3" />
                        <text x="222" y="143" font-size="6.5" fill="#6B7280" text-anchor="middle">Vegetatif</text>

                        {/* Generatif Bar */}
                        <rect x="290" y={130 - (phaseData.value.generatif / maxVal) * 100} width="24" height={(phaseData.value.generatif / maxVal) * 100} fill="#7c8e65" rx="3" />
                        <text x="302" y="143" font-size="6.5" fill="#6B7280" text-anchor="middle">Generatif</text>
                      </>
                    )
                  })()}

                  <text x="205" y="158" font-size="8" fill="#9ca3af" text-anchor="middle" font-weight="700">FASE POHON</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
