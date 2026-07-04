import { defineComponent, computed, onMounted, ref } from 'vue';
import { landsList, fetchLandsList, cropsList, fetchCropsList, panenList, fetchPanenList, userSession } from '@/store/navigation';
import Typography from '@/shared/ui/Typography';
import apiClient from '@/shared/api/client';
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css';

export default defineComponent({
  name: 'DasborPerkebunanView',
  setup() {
    const selectedLand = ref('all');
    const currentDateText = ref('');
    const currentTimeText = ref('');

    // Dynamic states for integrated monitoring
    const pemupukanList = ref<any[]>([]);
    const pengobatanList = ref<any[]>([]);
    const monitoringLoading = ref(false);

    const updateDateTime = () => {
      const now = new Date();
      currentDateText.value = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(now);
      
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      currentTimeText.value = `${hours}.${minutes} WIB`;
    };

    onMounted(async () => {
      updateDateTime();
      const interval = setInterval(updateDateTime, 60000);

      monitoringLoading.value = true;
      await Promise.all([
        fetchLandsList(),
        fetchCropsList(),
        fetchPanenList()
      ]);

      try {
        const [rawPemupukan, rawPengobatan] = await Promise.all([
          apiClient.get<any>('/api/v1/pemupukan').catch(() => []),
          apiClient.get<any>('/api/v1/pengobatan').catch(() => [])
        ]);
        pemupukanList.value = Array.isArray(rawPemupukan) ? rawPemupukan : (rawPemupukan?.data || []);
        pengobatanList.value = Array.isArray(rawPengobatan) ? rawPengobatan : (rawPengobatan?.data || []);
      } catch (err) {
        console.error('Failed to load dashboard monitoring data:', err);
      } finally {
        monitoringLoading.value = false;
      }
      
      console.log('=== DEBUG DASHBOARD ===');
      console.log('landsList:', JSON.stringify(landsList.value, null, 2));
      console.log('cropsList:', JSON.stringify(cropsList.value, null, 2));
      console.log('panenList:', JSON.stringify(panenList.value, null, 2));
      console.log('monthlyPanenAlpukat:', monthlyPanenAlpukat.value);
      console.log('panenAlpukat:', panenAlpukat.value);
    });

    const landOptions = computed(() => {
      const list = landsList.value.map(l => ({ value: l.code, label: `Lahan ${l.code}` }));
      return [{ value: 'all', label: 'Semua Lahan' }, ...list];
    });

    const activeLandId = computed(() => {
      if (selectedLand.value === 'all') return null;
      const land = landsList.value.find(l => l.code === selectedLand.value);
      return land ? land.id : null;
    });

    const totalHarvestMetric = computed(() => {
      const list = activeLandId.value 
        ? panenList.value.filter(p => String(p.id_pohon) === String(activeLandId.value))
        : panenList.value;
      return list.reduce((acc, curr) => acc + (Number(curr.jumlah_panen) || 0), 0);
    });

    const totalPemupukanCount = computed(() => {
      const list = activeLandId.value 
        ? pemupukanList.value.filter(p => String(p.Lahan_id_lahan || p.id_lahan) === String(activeLandId.value))
        : pemupukanList.value;
      return list.length;
    });

    const totalPemupukanDose = computed(() => {
      const list = activeLandId.value 
        ? pemupukanList.value.filter(p => String(p.Lahan_id_lahan || p.id_lahan) === String(activeLandId.value))
        : pemupukanList.value;
      return list.reduce((acc, curr) => acc + (Number(curr.dosis) || 0), 0);
    });

    const totalPengobatanCount = computed(() => {
      const list = activeLandId.value 
        ? pengobatanList.value.filter(p => String(p.Lahan_id_lahan || p.id_lahan) === String(activeLandId.value))
        : pengobatanList.value;
      return list.length;
    });

    const totalPengobatanDose = computed(() => {
      const list = activeLandId.value 
        ? pengobatanList.value.filter(p => String(p.Lahan_id_lahan || p.id_lahan) === String(activeLandId.value))
        : pengobatanList.value;
      return list.reduce((acc, curr) => acc + (Number(curr.dosis) || 0), 0);
    });

    // Dynamic metrics based on lands/crops database
    const luasAlpukat = computed(() => {
      const list = landsList.value.filter(l => (l.location || '').toLowerCase().includes('alpukat'));
      const sum = list.reduce((acc, curr) => acc + (parseFloat(curr.area) || 0), 0);
      return `${sum.toLocaleString('id-ID')} Hektar`;
    });

    const pohonAlpukat = computed(() => {
      const alpukatLands = landsList.value.filter(l => (l.location || '').toLowerCase().includes('alpukat')).map(l => l.code);
      const count = cropsList.value.filter(c => alpukatLands.includes(c.land) || (c.name || '').toLowerCase().includes('alpukat')).length;
      return `${count} Pohon`;
    });

    const luasKelengkeng = computed(() => {
      const list = landsList.value.filter(l => (l.location || '').toLowerCase().includes('kelengkeng'));
      const sum = list.reduce((acc, curr) => acc + (parseFloat(curr.area) || 0), 0);
      return `${sum.toLocaleString('id-ID')} Hektar`;
    });

    const pohonKelengkeng = computed(() => {
      const kelengkengLands = landsList.value.filter(l => (l.location || '').toLowerCase().includes('kelengkeng')).map(l => l.code);
      const count = cropsList.value.filter(c => kelengkengLands.includes(c.land) || (c.name || '').toLowerCase().includes('kelengkeng')).length;
      return `${count} Pohon`;
    });

    const panenAlpukat = computed(() => {
      const alpukatLandIds = landsList.value
        .filter(l => (l.location || '').toLowerCase().includes('alpukat'))
        .map(l => l.id);
      
      const sum = panenList.value
        .filter(p => alpukatLandIds.includes(p.id_pohon))
        .reduce((acc, curr) => acc + (Number(curr.jumlah_panen) || 0), 0);
      
      return `${sum.toLocaleString('id-ID')} Kg`;
    });

    const panenKelengkeng = computed(() => {
      const kelengkengLandIds = landsList.value
        .filter(l => (l.location || '').toLowerCase().includes('kelengkeng'))
        .map(l => l.id);
      
      const sum = panenList.value
        .filter(p => kelengkengLandIds.includes(p.id_pohon))
        .reduce((acc, curr) => acc + (Number(curr.jumlah_panen) || 0), 0);
      
      return `${sum.toLocaleString('id-ID')} Kg`;
    });

    const monthlyPanenAlpukat = computed(() => {
      const data = [0, 0, 0, 0, 0, 0];
      const alpukatLandIds = landsList.value
        .filter(l => (l.location || '').toLowerCase().includes('alpukat'))
        .map(l => l.id);
        
      panenList.value.forEach(p => {
        if (alpukatLandIds.includes(p.id_pohon)) {
          const date = new Date(p.tanggal_panen);
          const month = date.getMonth();
          if (month >= 0 && month <= 5) {
            data[month] = (data[month] ?? 0) + (Number(p.jumlah_panen) || 0);
          }
        }
      });
      
      return data;
    });

    const monthlyPanenKelengkeng = computed(() => {
      const data = [0, 0, 0, 0, 0, 0];
      const kelengkengLandIds = landsList.value
        .filter(l => (l.location || '').toLowerCase().includes('kelengkeng'))
        .map(l => l.id);
        
      panenList.value.forEach(p => {
        if (kelengkengLandIds.includes(p.id_pohon)) {
          const date = new Date(p.tanggal_panen);
          const month = date.getMonth();
          if (month >= 0 && month <= 5) {
            data[month] = (data[month] ?? 0) + (Number(p.jumlah_panen) || 0);
          }
        }
      });
      
      return data;
    });

    const treePhasesAlpukat = computed(() => {
      const phases: Record<string, number> = { generatif: 0, vegetatif: 0, pembibitan: 0, panen: 0, tidakProduktif: 0 };
      const alpukatLands = landsList.value
        .filter(l => (l.location || '').toLowerCase().includes('alpukat'))
        .map(l => l.code);
      
      cropsList.value.forEach(c => {
        if (alpukatLands.includes(c.land) || (c.name || '').toLowerCase().includes('alpukat')) {
          const status = (c.type || '').toLowerCase();
          if (status.includes('generatif')) phases.generatif = (phases.generatif || 0) + 1;
          else if (status.includes('vegetatif')) phases.vegetatif = (phases.vegetatif || 0) + 1;
          else if (status.includes('pembibitan') || status.includes('bibit')) phases.pembibitan = (phases.pembibitan || 0) + 1;
          else if (status.includes('panen')) phases.panen = (phases.panen || 0) + 1;
          else if (status.includes('tidak produktif') || status.includes('belum') || status.includes('juvenile')) phases.tidakProduktif = (phases.tidakProduktif || 0) + 1;
          else phases.panen = (phases.panen || 0) + 1;
        }
      });
      
      return phases;
    });

    const treePhasesKelengkeng = computed(() => {
      const phases: Record<string, number> = { generatif: 0, vegetatif: 0, pembibitan: 0, panen: 0, tidakProduktif: 0 };
      const kelengkengLands = landsList.value
        .filter(l => (l.location || '').toLowerCase().includes('kelengkeng'))
        .map(l => l.code);
      
      cropsList.value.forEach(c => {
        if (kelengkengLands.includes(c.land) || (c.name || '').toLowerCase().includes('kelengkeng')) {
          const status = (c.type || '').toLowerCase();
          if (status.includes('generatif')) phases.generatif = (phases.generatif || 0) + 1;
          else if (status.includes('vegetatif')) phases.vegetatif = (phases.vegetatif || 0) + 1;
          else if (status.includes('pembibitan') || status.includes('bibit')) phases.pembibitan = (phases.pembibitan || 0) + 1;
          else if (status.includes('panen')) phases.panen = (phases.panen || 0) + 1;
          else if (status.includes('tidak produktif') || status.includes('belum') || status.includes('juvenile')) phases.tidakProduktif = (phases.tidakProduktif || 0) + 1;
          else phases.panen = (phases.panen || 0) + 1;
        }
      });
      
      return phases;
    });

    // Display toggles
    const hasAlpukatLand = computed(() => {
      return landsList.value.some(l => (l.location || '').toLowerCase().includes('alpukat') || (l.name || '').toLowerCase().includes('alpukat'));
    });

    const hasKelengkengLand = computed(() => {
      return landsList.value.some(l => (l.location || '').toLowerCase().includes('kelengkeng') || (l.name || '').toLowerCase().includes('kelengkeng'));
    });

    const showAlpukat = computed(() => {
      if (!hasAlpukatLand.value) return false;
      if (selectedLand.value === 'all') return true;
      const matchedLand = landsList.value.find(l => l.code === selectedLand.value);
      if (!matchedLand) return selectedLand.value === 'L001';
      return (matchedLand.location || '').toLowerCase().includes('alpukat');
    });

    const showKelengkeng = computed(() => {
      if (!hasKelengkengLand.value) return false;
      if (selectedLand.value === 'all') return true;
      const matchedLand = landsList.value.find(l => l.code === selectedLand.value);
      if (!matchedLand) return selectedLand.value === 'L002';
      return (matchedLand.location || '').toLowerCase().includes('kelengkeng');
    });

    // Inline SVG Line Chart for "Hasil Panen"
    const renderLineChart = (monthlyData: number[], labelType: string) => {
      const sum = monthlyData.reduce((a, b) => a + b, 0);
      if (sum === 0) {
        return (
          <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontWeight: '700', fontSize: '0.85rem', width: '100%' }}>
            Tidak ada data panen dalam 6 bulan terakhir
          </div>
        );
      }
      const maxVal = Math.max(60, ...monthlyData);
      const scale = 150 / maxVal;
      
      const yCoords = monthlyData.map(val => 170 - val * scale);
      
      const points: [
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number }
      ] = [
        { x: 40, y: yCoords[0] ?? 170 },
        { x: 118, y: yCoords[1] ?? 170 },
        { x: 196, y: yCoords[2] ?? 170 },
        { x: 274, y: yCoords[3] ?? 170 },
        { x: 352, y: yCoords[4] ?? 170 },
        { x: 430, y: yCoords[5] ?? 170 }
      ];
      
      const pathD = `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y} L${points[2].x},${points[2].y} L${points[3].x},${points[3].y} L${points[4].x},${points[4].y} L${points[5].x},${points[5].y}`;
      
      const landList = landsList.value.filter(l => (l.location || '').toLowerCase().includes(labelType.toLowerCase()));
      const landCodes = landList.map(l => l.code);
      const treeCount = cropsList.value.filter(c => landCodes.includes(c.land) || (c.name || '').toLowerCase().includes(labelType.toLowerCase())).length || 1;
      
      const avgData = monthlyData.map(val => val / treeCount);
      const yAvgCoords = avgData.map(val => 170 - val * scale);
      const avgPathD = `M40,${yAvgCoords[0] ?? 170} L118,${yAvgCoords[1] ?? 170} L196,${yAvgCoords[2] ?? 170} L274,${yAvgCoords[3] ?? 170} L352,${yAvgCoords[4] ?? 170} L430,${yAvgCoords[5] ?? 170}`;

      return (
        <svg viewBox="0 0 450 220" style={{ width: '100%', height: '180px', display: 'block', margin: 'auto' }}>
          {/* Horizontal grid lines */}
          <line x1="40" y1="20" x2="430" y2="20" stroke="#F3F4F6" stroke-width="1" />
          <line x1="40" y1="45" x2="430" y2="45" stroke="#F3F4F6" stroke-width="1" />
          <line x1="40" y1="70" x2="430" y2="70" stroke="#F3F4F6" stroke-width="1" />
          <line x1="40" y1="95" x2="430" y2="95" stroke="#F3F4F6" stroke-width="1" />
          <line x1="40" y1="120" x2="430" y2="120" stroke="#F3F4F6" stroke-width="1" />
          <line x1="40" y1="145" x2="430" y2="145" stroke="#F3F4F6" stroke-width="1" />
          <line x1="40" y1="170" x2="430" y2="170" stroke="#E5E7EB" stroke-width="1.5" stroke-dasharray="2,2" />
          
          {/* Y Axis line */}
          <line x1="40" y1="20" x2="40" y2="170" stroke="#E5E7EB" stroke-width="1.5" />
          
          {/* Y axis labels */}
          <text x="30" y="24" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">{Math.round(maxVal)}</text>
          <text x="30" y="49" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">{Math.round(maxVal * 5/6)}</text>
          <text x="30" y="74" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">{Math.round(maxVal * 4/6)}</text>
          <text x="30" y="99" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">{Math.round(maxVal * 3/6)}</text>
          <text x="30" y="124" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">{Math.round(maxVal * 2/6)}</text>
          <text x="30" y="149" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">{Math.round(maxVal * 1/6)}</text>
          <text x="30" y="174" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">0</text>
  
          {/* X axis labels (Jan, Feb, Mar, Apr, Mei, Jun) */}
          <text x="40" y="195" font-size="9" fill="#9CA3AF" text-anchor="middle" font-weight="700">Jan</text>
          <text x="118" y="195" font-size="9" fill="#9CA3AF" text-anchor="middle" font-weight="700">Feb</text>
          <text x="196" y="195" font-size="9" fill="#9CA3AF" text-anchor="middle" font-weight="700">Mar</text>
          <text x="274" y="195" font-size="9" fill="#9CA3AF" text-anchor="middle" font-weight="700">Apr</text>
          <text x="352" y="195" font-size="9" fill="#9CA3AF" text-anchor="middle" font-weight="700">Mei</text>
          <text x="430" y="195" font-size="9" fill="#9CA3AF" text-anchor="middle" font-weight="700">Jun</text>
  
          {/* X Axis Label */}
          <text x="235" y="215" font-size="8" fill="#9CA3AF" text-anchor="middle" font-weight="700">BULAN</text>
  
          {/* Line 1: Per Lahan */}
          <path d={pathD} fill="none" stroke="#38431F" stroke-width="2.5" stroke-linecap="round" />
          {points.map(pt => (
            <circle cx={pt.x} cy={pt.y} r="4" fill="#38431F" stroke="#FFF" stroke-width="1.5" key={`l1-${pt.x}`} />
          ))}
  
          {/* Line 2: Per Pohon (Rata-rata) */}
          <path d={avgPathD} fill="none" stroke="#A5B892" stroke-width="2" stroke-linecap="round" stroke-dasharray="3,3" />
          {points.map((pt, idx) => (
            <circle cx={pt.x} cy={yAvgCoords[idx] ?? 170} r="3" fill="#A5B892" stroke="#FFF" stroke-width="1" key={`l2-${pt.x}`} />
          ))}
  
          {/* Y Axis Label rotated */}
          <text x="12" y="95" font-size="8" fill="#9CA3AF" font-weight="700" transform="rotate(-90 12 95)" text-anchor="middle">HASIL PANEN (KG)</text>
        </svg>
      );
    };

    // Inline SVG Bar Chart for "Jumlah pohon"
    const renderBarChart = (phases: { generatif: number; vegetatif: number; pembibitan: number; panen: number; tidakProduktif: number }) => {
      const sum = phases.generatif + phases.vegetatif + phases.pembibitan + phases.panen + phases.tidakProduktif;
      if (sum === 0) {
        return (
          <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontWeight: '700', fontSize: '0.85rem', width: '100%' }}>
            Tidak ada data pohon
          </div>
        );
      }
      const maxVal = Math.max(5, phases.generatif, phases.vegetatif, phases.pembibitan, phases.panen, phases.tidakProduktif);
      const scale = 150 / maxVal;
      
      const hGen = phases.generatif * scale;
      const hVeg = phases.vegetatif * scale;
      const hPem = phases.pembibitan * scale;
      const hPan = phases.panen * scale;
      const hTid = phases.tidakProduktif * scale;

      return (
        <svg viewBox="0 0 450 220" style={{ width: '100%', height: '180px', display: 'block', margin: 'auto' }}>
          {/* Horizontal grid lines */}
          <line x1="40" y1="20" x2="430" y2="20" stroke="#F3F4F6" stroke-width="1" />
          <line x1="40" y1="50" x2="430" y2="50" stroke="#F3F4F6" stroke-width="1" />
          <line x1="40" y1="80" x2="430" y2="80" stroke="#F3F4F6" stroke-width="1" />
          <line x1="40" y1="110" x2="430" y2="110" stroke="#F3F4F6" stroke-width="1" />
          <line x1="40" y1="140" x2="430" y2="140" stroke="#F3F4F6" stroke-width="1" />
          <line x1="40" y1="170" x2="430" y2="170" stroke="#E5E7EB" stroke-width="1.5" />
          
          {/* Y Axis line */}
          <line x1="40" y1="20" x2="40" y2="170" stroke="#E5E7EB" stroke-width="1.5" />
  
          {/* Y axis labels */}
          <text x="30" y="24" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">{maxVal}</text>
          <text x="30" y="54" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">{Math.round(maxVal * 4/5)}</text>
          <text x="30" y="84" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">{Math.round(maxVal * 3/5)}</text>
          <text x="30" y="114" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">{Math.round(maxVal * 2/5)}</text>
          <text x="30" y="144" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">{Math.round(maxVal * 1/5)}</text>
          <text x="30" y="174" font-size="9" fill="#9CA3AF" text-anchor="end" font-weight="600">0</text>
   
          {/* Bars */}
          <rect x="60" y={170 - hGen} width="40" height={hGen} rx="4" fill="#7C8B64" />
          <rect x="140" y={170 - hVeg} width="40" height={hVeg} rx="4" fill="#2D3B1D" />
          <rect x="220" y={170 - hPem} width="40" height={hPem} rx="4" fill="#D8CEBF" />
          <rect x="300" y={170 - hPan} width="40" height={hPan} rx="4" fill="#A5B892" />
          <rect x="380" y={170 - hTid} width="40" height={hTid} rx="4" fill="#3C3026" />
  
          {/* X axis labels */}
          <text x="80" y="190" font-size="9" fill="#9CA3AF" text-anchor="middle" font-weight="700">Generatif</text>
          <text x="160" y="190" font-size="9" fill="#9CA3AF" text-anchor="middle" font-weight="700">Vegetatif</text>
          <text x="240" y="190" font-size="9" fill="#9CA3AF" text-anchor="middle" font-weight="700">Pembibitan</text>
          <text x="320" y="190" font-size="9" fill="#9CA3AF" text-anchor="middle" font-weight="700">Panen</text>
          <text x="400" y="190" font-size="9" fill="#9CA3AF" text-anchor="middle" font-weight="700">Tidak Prod.</text>
  
          {/* X Axis Label */}
          <text x="235" y="212" font-size="8" fill="#9CA3AF" text-anchor="middle" font-weight="700">FASE POHON</text>
  
          {/* Y Axis Label rotated */}
          <text x="12" y="95" font-size="8" fill="#9CA3AF" font-weight="700" transform="rotate(-90 12 95)" text-anchor="middle">JUMLAH POHON</text>
        </svg>
      );
    };

    const handleExport = async () => {
      try {
        const [rawLands, rawTrees, rawPerawatan, rawPanen, rawPemangkasan] = await Promise.all([
          apiClient.get<any[]>('/api/v1/lahan').catch(() => []),
          apiClient.get<any[]>('/api/v1/pohon').catch(() => []),
          apiClient.get<any[]>('/api/v1/perawatan').catch(() => []),
          apiClient.get<any[]>('/api/v1/panen').catch(() => []),
          apiClient.get<any[]>('/api/v1/pemangkasan').catch(() => [])
        ])

        const lands = Array.isArray(rawLands) ? rawLands : []
        const trees = Array.isArray(rawTrees) ? rawTrees : []
        const perawatanList = Array.isArray(rawPerawatan) ? rawPerawatan : []
        const panenList = Array.isArray(rawPanen) ? rawPanen : []
        const pemangkasanList = Array.isArray(rawPemangkasan) ? rawPemangkasan : []

        const isFiltering = selectedLand.value !== 'all'
        const targetLand = isFiltering ? lands.find((l: any) => l.kode_lahan === selectedLand.value) : null
        const targetLandId = targetLand?.id_lahan || targetLand?.id

        const exportLands = isFiltering && targetLand ? [targetLand] : lands

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

        exportLands.forEach((landObj: any) => {
          const landId = landObj.id_lahan || landObj.id

          // Add Land Info
          csvRows.push([
            'Lahan',
            landObj.tanggal_tanam || '-',
            landObj.kode_lahan || '-',
            landObj.nama_lahan || '-',
            '-',
            landObj.varietas || 'Tanaman',
            String(landObj.luas_lahan || landObj.luas || 0),
            'Hektar',
            `Fase Tanam: ${landObj.fase_tanam || '-'}`
          ])

          const landTrees = trees.filter((t: any) => 
            String(t.Lahan_id_lahan || t.id_lahan) === String(landId) ||
            String(t.lahan_code) === String(landObj.kode_lahan)
          )
          const landPerawatan = perawatanList.filter((p: any) => String(p.Lahan_id_lahan || p.id_lahan) === String(landId))
          const landPanen = panenList.filter((p: any) => String(p.Lahan_id_lahan || p.id_lahan) === String(landId))
          const landPemangkasan = pemangkasanList.filter((p: any) => String(p.Lahan_id_lahan || p.id_lahan) === String(landId))

          // Add Trees
          landTrees.forEach((t: any) => {
            let age = t.umur
            if (!age && t.tanggal_tanam) {
              const plantedYear = new Date(t.tanggal_tanam).getFullYear()
              const currentYear = new Date().getFullYear()
              age = Math.max(1, currentYear - plantedYear)
            }

            csvRows.push([
              'Pohon',
              t.tanggal_tanam ? t.tanggal_tanam.split('T')[0] : (t.created_at ? t.created_at.split('T')[0] : '-'),
              landObj.kode_lahan || '-',
              landObj.nama_lahan || '-',
              t.kode_pohon || '-',
              t.varietas || t.nama_pohon || t.jenis || '-',
              String(age || 0),
              'Tahun',
              `Status: ${t.fase_pohon || t.status || '-'}`
            ])
          })

          // Add Pemupukan & Pemberian Obat
          landPerawatan.forEach((p: any) => {
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
              landObj.kode_lahan || '-',
              landObj.nama_lahan || '-',
              p.detail_pohon || '-',
              p.nama_obat || p.jenis_perawatan || '-',
              String(p.dosis || 0),
              p.satuan || '-',
              `Teknik: ${p.teknik_perawatan || '-'}, Bagian: ${p.bagian_pohon || '-'}, Catatan: ${p.deskripsi || '-'}`
            ])
          })

          // Add Panen
          landPanen.forEach((pa: any) => {
            csvRows.push([
              'Panen',
              pa.tanggal_aktivitas || '-',
              landObj.kode_lahan || '-',
              landObj.nama_lahan || '-',
              '-',
              pa.nama_rincian_aktivitas || 'Panen Buah',
              String(pa.jumlah || 0),
              pa.satuan || 'kg',
              'Selesai'
            ])
          })

          // Add Pemangkasan
          landPemangkasan.forEach((pe: any) => {
            csvRows.push([
              'Pemangkasan',
              pe.tanggal_aktivitas || '-',
              landObj.kode_lahan || '-',
              landObj.nama_lahan || '-',
              '-',
              'Pemangkasan Pemeliharaan',
              String(pe.jumlah || 0),
              pe.satuan || 'kg',
              pe.keterangan || '-'
            ])
          })
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
        const landLabel = isFiltering && targetLand ? targetLand.nama_lahan.replace(/\s+/g, '_') : 'Semua_Lahan'
        const filename = `Ekspor_Data_${landLabel}_${dateStr}.csv`
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
  
    return () => {
      const adminName = userSession.value?.name || 'Admin';
      const opCode = userSession.value?.code || 'ADM-01';
      const userRole = userSession.value?.role || 'Admin';
  
      return (
        <div class="animate-fade-in-up" style={{ padding: '0 0.5rem', fontFamily: "'Nunito', sans-serif" }}>
          {/* Dropdown Filter at the top right */}
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <Typography variant="h2" size="text-2xl" weight="extrabold" className="m-0 text-dark" style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.75rem', fontWeight: '800' }}>
                Dasbor Perkebunan
              </Typography>
              <Typography variant="p" size="text-sm" color="secondary" className="m-0" style={{ fontSize: '0.875rem', color: '#6C757D', marginTop: '4px', display: 'block' }}>
                Farmease dapat memantau perkebunan
              </Typography>
            </div>
            <div>
              <select 
                class="form-select bg-white" 
                value={selectedLand.value}
                onChange={(e: any) => selectedLand.value = e.target.value}
                style={{ width: '180px', height: '40px', border: '1.5px solid #E6D9CE', borderRadius: '8px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}
              >
                {landOptions.value.map(opt => (
                  <option value={opt.value} key={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ekspor Data Kebun (Full-width Section) */}
          <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
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

          {/* ============ LAPORAN MONITORING TERPADU ============ */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ display: 'inline-block', width: '4px', height: '1.3rem', background: '#38431F', borderRadius: '2px' }}></span>
              Laporan Monitoring Terpadu
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* Card 1: Panen */}
              <div class="monitoring-card" style={{ background: 'linear-gradient(135deg, #F4F7F1 0%, #FFFFFF 100%)', border: '1.5px solid #D1E0C5', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(56,67,31,0.02)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ background: '#E6EFE0', padding: '0.5rem', borderRadius: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38431F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.73rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7C8B64', background: '#FFF', border: '1px solid #E6D9CE', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>PANEN</span>
                </div>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.25rem', fontFamily: "'Outfit', sans-serif" }}>
                  {totalHarvestMetric.value.toLocaleString('id-ID')} <span style={{ fontSize: '1rem', color: '#4B5563' }}>Kg</span>
                </span>
                <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Hasil Panen Buah Terakumulasi</strong>
              </div>

              {/* Card 2: Pemupukan */}
              <div class="monitoring-card" style={{ background: 'linear-gradient(135deg, #FDF9F5 0%, #FFFFFF 100%)', border: '1.5px solid #ECDCCF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(60,48,38,0.02)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ background: '#F7EDE2', padding: '0.5rem', borderRadius: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8E5E38" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.73rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8E5E38', background: '#FFF', border: '1px solid #E6D9CE', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>PEMUPUKAN</span>
                </div>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.25rem', fontFamily: "'Outfit', sans-serif" }}>
                  {totalPemupukanCount.value} <span style={{ fontSize: '1rem', color: '#4B5563' }}>Kali</span>
                </span>
                <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>
                  Total Dosis: {totalPemupukanDose.value.toLocaleString('id-ID')} Kg
                </strong>
              </div>

              {/* Card 3: Pemberian Obat */}
              <div class="monitoring-card" style={{ background: 'linear-gradient(135deg, #F1F7F7 0%, #FFFFFF 100%)', border: '1.5px solid #C5DFDF', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(18,100,100,0.02)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ background: '#E0F0F0', padding: '0.5rem', borderRadius: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2B7A7A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4.82 4.82a9 9 0 0 1 12.73 0M2.41 9.66a14 14 0 0 1 19.18 0M19.18 19.18a9 9 0 0 1-12.73 0M21.59 14.34a14 14 0 0 1-19.18 0"/>
                      <circle cx="12" cy="12" r="1"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.73rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2B7A7A', background: '#FFF', border: '1px solid #E6D9CE', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>PENGOBATAN</span>
                </div>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.25rem', fontFamily: "'Outfit', sans-serif" }}>
                  {totalPengobatanCount.value} <span style={{ fontSize: '1rem', color: '#4B5563' }}>Kali</span>
                </span>
                <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>
                  Total Dosis: {totalPengobatanDose.value.toLocaleString('id-ID')} L
                </strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {/* ============ ALPUKAT SECTION ============ */}
            {showAlpukat.value && (
              <div>
                {/* Section Label */}
                {(() => {
                  const alpukatLand = landsList.value.find(l => (l.location || '').toLowerCase().includes('alpukat'))
                  const landCode = alpukatLand ? alpukatLand.code : 'L001'
                  return (
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#38431F', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ display: 'inline-block', width: '4px', height: '1.3rem', background: '#38431F', borderRadius: '2px' }}></span>
                      Lahan {landCode} — Alpukat
                    </h2>
                  )
                })()} 
                {/* Stats Cards Grid - 2 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '2rem 1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem', fontFamily: "'Nunito', sans-serif" }}>{luasAlpukat.value}</span>
                    <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Total Luas Lahan Alpukat</strong>
                  </div>
                  <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '2rem 1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem', fontFamily: "'Nunito', sans-serif" }}>{pohonAlpukat.value}</span>
                    <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Total Pohon</strong>
                  </div>
                </div>
  
                {/* Stats Card - Full width */}
                <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '2rem 1rem', textAlign: 'center', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem', fontFamily: "'Nunito', sans-serif" }}>{panenAlpukat.value}</span>
                  <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Jumlah Panen Alpukat</strong>
                </div>
  
                {/* Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {/* Hasil Panen Alpukat Chart */}
                  <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#111827' }}>Hasil Panen Alpukat</h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: '#6B7280', fontWeight: '600' }}>Data 6 bulan terakhir (kg)</p>
                    
                    {/* Custom Legend */}
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
  
                    {renderLineChart(monthlyPanenAlpukat.value, 'Alpukat')}
                  </div>
  
                  {/* Jumlah Pohon Chart */}
                  <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#111827' }}>Jumlah pohon (per fase pohon)</h3>
                    
                    {/* Legend Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem 1rem', marginBottom: '1.25rem', fontSize: '0.73rem', fontWeight: '700', color: '#374151', width: '100%', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#7C8B64', borderRadius: '2px', display: 'inline-block' }}></span>
                        <span>Generatif: {Math.round(treePhasesAlpukat.value.generatif || 0)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#2D3B1D', borderRadius: '2px', display: 'inline-block' }}></span>
                        <span>Vegetatif: {Math.round(treePhasesAlpukat.value.vegetatif || 0)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#D8CEBF', borderRadius: '2px', display: 'inline-block' }}></span>
                        <span>Pembibitan: {Math.round(treePhasesAlpukat.value.pembibitan || 0)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#A5B892', borderRadius: '2px', display: 'inline-block' }}></span>
                        <span>Panen: {Math.round(treePhasesAlpukat.value.panen || 0)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#3C3026', borderRadius: '2px', display: 'inline-block' }}></span>
                        <span>Tidak Prod: {Math.round(treePhasesAlpukat.value.tidakProduktif || 0)}</span>
                      </div>
                    </div>
  
                    {renderBarChart(treePhasesAlpukat.value)}
                  </div>
                </div>
              </div>
            )}
  
            {/* ============ KELENGKENG SECTION ============ */}
            {showKelengkeng.value && (
              <div>
                {selectedLand.value === 'all' && showAlpukat.value && (
                  <hr style={{ border: 'none', borderTop: '2px solid #E6D9CE', margin: '1rem 0 2rem 0' }} />
                )}
  
                {/* Section Label */}
                {(() => {
                  const kelengkengLand = landsList.value.find(l => (l.location || '').toLowerCase().includes('kelengkeng'))
                  const landCode = kelengkengLand ? kelengkengLand.code : 'L002'
                  return (
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#38431F', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ display: 'inline-block', width: '4px', height: '1.3rem', background: '#38431F', borderRadius: '2px' }}></span>
                      Lahan {landCode} — Kelengkeng
                    </h2>
                  )
                })()} 

                {/* Stats Cards Grid - 2 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '2rem 1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem', fontFamily: "'Nunito', sans-serif" }}>{luasKelengkeng.value}</span>
                    <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Total Luas Lahan Kelengkeng</strong>
                  </div>
                  <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '2rem 1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem', fontFamily: "'Nunito', sans-serif" }}>{pohonKelengkeng.value}</span>
                    <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Total Pohon</strong>
                  </div>
                </div>
  
                {/* Stats Card - Full width */}
                <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '2rem 1rem', textAlign: 'center', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem', fontFamily: "'Nunito', sans-serif" }}>{panenKelengkeng.value}</span>
                  <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Jumlah Panen Kelengkeng</strong>
                </div>
  
                {/* Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {/* Hasil Panen Kelengkeng Chart */}
                  <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#111827' }}>Hasil Panen Kelengkeng</h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: '#6B7280', fontWeight: '600' }}>Data 6 bulan terakhir (kg)</p>
                    
                    {/* Custom Legend */}
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
  
                    {renderLineChart(monthlyPanenKelengkeng.value, 'Kelengkeng')}
                  </div>
  
                  {/* Jumlah Pohon Chart */}
                  <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#111827' }}>Jumlah pohon (per fase pohon)</h3>
                    
                    {/* Legend Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem 1rem', marginBottom: '1.25rem', fontSize: '0.73rem', fontWeight: '700', color: '#374151', width: '100%', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#7C8B64', borderRadius: '2px', display: 'inline-block' }}></span>
                        <span>Generatif: {Math.round(treePhasesKelengkeng.value.generatif || 0)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#2D3B1D', borderRadius: '2px', display: 'inline-block' }}></span>
                        <span>Vegetatif: {Math.round(treePhasesKelengkeng.value.vegetatif || 0)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#D8CEBF', borderRadius: '2px', display: 'inline-block' }}></span>
                        <span>Pembibitan: {Math.round(treePhasesKelengkeng.value.pembibitan || 0)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#A5B892', borderRadius: '2px', display: 'inline-block' }}></span>
                        <span>Panen: {Math.round(treePhasesKelengkeng.value.panen || 0)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#3C3026', borderRadius: '2px', display: 'inline-block' }}></span>
                        <span>Tidak Prod: {Math.round(treePhasesKelengkeng.value.tidakProduktif || 0)}</span>
                      </div>
                    </div>
  
                    {renderBarChart(treePhasesKelengkeng.value)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };
  }
});
