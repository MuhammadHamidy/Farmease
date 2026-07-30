import { defineComponent, ref, onMounted, computed } from 'vue';
import { 
  userSession, 
  cageSession, 
  landsList, 
  fetchLandsList, 
  cropsList, 
  fetchCropsList, 
  panenList, 
  fetchPanenList 
} from '@/store/navigation';

export default defineComponent({
  name: 'DasborPemilikKebunView',
  setup() {
    const handleLogout = () => {
      if (!confirm('Apakah Anda yakin ingin keluar dari halaman pemilik?')) return;
      userSession.value = null;
      cageSession.value = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = 'http://localhost:3000/?logout=true';
    };

    const currentDateText = ref('');
    const currentTimeText = ref('');

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

      await Promise.all([
        fetchLandsList(),
        fetchCropsList(),
        fetchPanenList()
      ]);
    });

    // Dynamic metrics based on lands/crops/panen database
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
      const phases = { generatif: 0, vegetatif: 0, belum: 0, produktif: 0 };
      const alpukatLands = landsList.value
        .filter(l => (l.location || '').toLowerCase().includes('alpukat'))
        .map(l => l.code);
      
      cropsList.value.forEach(c => {
        if (alpukatLands.includes(c.land) || (c.name || '').toLowerCase().includes('alpukat')) {
          const status = (c.type || '').toLowerCase();
          if (status.includes('generatif')) phases.generatif++;
          else if (status.includes('vegetatif')) phases.vegetatif++;
          else if (status.includes('belum') || status.includes('juvenile')) phases.belum++;
          else phases.produktif++;
        }
      });
      
      return phases;
    });

    const treePhasesKelengkeng = computed(() => {
      const phases = { generatif: 0, vegetatif: 0, belum: 0, produktif: 0 };
      const kelengkengLands = landsList.value
        .filter(l => (l.location || '').toLowerCase().includes('kelengkeng'))
        .map(l => l.code);
      
      cropsList.value.forEach(c => {
        if (kelengkengLands.includes(c.land) || (c.name || '').toLowerCase().includes('kelengkeng')) {
          const status = (c.type || '').toLowerCase();
          if (status.includes('generatif')) phases.generatif++;
          else if (status.includes('vegetatif')) phases.vegetatif++;
          else if (status.includes('belum') || status.includes('juvenile')) phases.belum++;
          else phases.produktif++;
        }
      });
      
      return phases;
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
      
      const points = [
        { x: 40, y: yCoords[0] ?? 170 },
        { x: 118, y: yCoords[1] ?? 170 },
        { x: 196, y: yCoords[2] ?? 170 },
        { x: 274, y: yCoords[3] ?? 170 },
        { x: 352, y: yCoords[4] ?? 170 },
        { x: 430, y: yCoords[5] ?? 170 }
      ];
      const p0 = points[0] ?? { x: 40, y: 170 };
      const p1 = points[1] ?? { x: 118, y: 170 };
      const p2 = points[2] ?? { x: 196, y: 170 };
      const p3 = points[3] ?? { x: 274, y: 170 };
      const p4 = points[4] ?? { x: 352, y: 170 };
      const p5 = points[5] ?? { x: 430, y: 170 };
      
      const pathD = `M${p0.x},${p0.y} L${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y} L${p4.x},${p4.y} L${p5.x},${p5.y}`;
      
      const landList = landsList.value.filter(l => (l.location || '').toLowerCase().includes(labelType.toLowerCase()));
      const landCodes = landList.map(l => l.code);
      const treeCount = cropsList.value.filter(c => landCodes.includes(c.land) || (c.name || '').toLowerCase().includes(labelType.toLowerCase())).length || 1;
      
      const avgData = monthlyData.map(val => val / treeCount);
      const yAvgCoords = avgData.map(val => 170 - val * scale);

      const a0 = yAvgCoords[0] ?? 170;
      const a1 = yAvgCoords[1] ?? 170;
      const a2 = yAvgCoords[2] ?? 170;
      const a3 = yAvgCoords[3] ?? 170;
      const a4 = yAvgCoords[4] ?? 170;
      const a5 = yAvgCoords[5] ?? 170;
      const avgPathD = `M40,${a0} L118,${a1} L196,${a2} L274,${a3} L352,${a4} L430,${a5}`;
  
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
  
          {/* X axis labels */}
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
    const renderBarChart = (phases: { generatif: number; vegetatif: number; belum: number; produktif: number }) => {
      const sum = phases.generatif + phases.vegetatif + phases.belum + phases.produktif;
      if (sum === 0) {
        return (
          <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontWeight: '700', fontSize: '0.85rem', width: '100%' }}>
            Tidak ada data pohon
          </div>
        );
      }
      const maxVal = Math.max(5, phases.generatif, phases.vegetatif, phases.belum, phases.produktif);
      const scale = 150 / maxVal;
      
      const hGen = phases.generatif * scale;
      const hVeg = phases.vegetatif * scale;
      const hBelum = phases.belum * scale;
      const hProd = phases.produktif * scale;

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
          <rect x="75" y={170 - hGen} width="40" height={hGen} rx="4" fill="#7C8B64" />
          <rect x="165" y={170 - hVeg} width="40" height={hVeg} rx="4" fill="#2D3B1D" />
          <rect x="255" y={170 - hBelum} width="40" height={hBelum} rx="4" fill="#D8CEBF" />
          <rect x="345" y={170 - hProd} width="40" height={hProd} rx="4" fill="#3C3026" />
  
          {/* X axis labels */}
          <text x="95" y="190" font-size="8" fill="#9CA3AF" text-anchor="middle" font-weight="700">Generatif</text>
          <text x="185" y="190" font-size="8" fill="#9CA3AF" text-anchor="middle" font-weight="700">Vegetatif</text>
          <text x="275" y="190" font-size="8" fill="#9CA3AF" text-anchor="middle" font-weight="700">Belum Produktif</text>
          <text x="365" y="190" font-size="8" fill="#9CA3AF" text-anchor="middle" font-weight="700">Produktif</text>
  
          {/* X Axis Label */}
          <text x="235" y="212" font-size="8" fill="#9CA3AF" text-anchor="middle" font-weight="700">FASE POHON</text>
  
          {/* Y Axis Label rotated */}
          <text x="12" y="95" font-size="8" fill="#9CA3AF" font-weight="700" transform="rotate(-90 12 95)" text-anchor="middle">JUMLAH POHON</text>
        </svg>
      );
    };

    return () => {
      const ownerName = userSession.value?.name || 'Pemilik';
      const opCode = userSession.value?.code || 'P0001';

      return (
        <div style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', padding: '1.5rem', fontFamily: "'Nunito', sans-serif", color: '#374151' }}>
          {/* Back Button */}
          <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '1rem' }}>
            <button 
              type="button" 
              onClick={handleLogout} 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                backgroundColor: '#38431F', 
                color: '#FFF', 
                border: 'none', 
                borderRadius: '8px', 
                padding: '0.5rem 1.2rem', 
                fontSize: '0.9rem', 
                fontWeight: '700', 
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <img src="/icon/arrow-left/white-16.svg" alt="Back" style={{ width: '12px', height: '12px' }} />
              <span>Kembali</span>
            </button>
          </div>

          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* ==================== SECTION 1: LAHAN ALPUKAT ==================== */}
            <div>
              {/* Banner Header with Cards */}
              <div style={{ background: '#38431F', borderRadius: '12px', padding: '1.25rem 2rem', color: '#FFF', marginBottom: '1.25rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
                <h2 style={{ textAlign: 'center', margin: '0 0 0.75rem 0', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '0.5px' }}>Dasbor Perkebunan</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1.25rem' }}>
                  <span>Tanggal : {currentDateText.value}</span>
                  <span>{currentTimeText.value}</span>
                </div>

                {/* Lahan & Pemilik Cards */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Lahan Card */}
                  <div style={{ flex: 1, minWidth: '280px', background: '#FFF', borderRadius: '8px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#F4F5F0', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.9 8.2 9.1 9.2 9.9C7.3 10.8 6 12.8 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 12.8 16.7 10.8 14.8 9.9C15.8 9.1 16.5 7.9 16.5 6.5C16.5 4 14.5 2 12 2Z" fill="#4CAF50"/>
                        <path d="M12 21V23" stroke="#8D6E63" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                    <div>
                      {(() => {
                        const alpukatLand = landsList.value.find(l => (l.location || '').toLowerCase().includes('alpukat'))
                        return (
                          <>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#111827' }}>{alpukatLand ? alpukatLand.name : 'Lahan Alpukat'}</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#111827', fontWeight: '700' }}>ID Lahan: {alpukatLand ? alpukatLand.code : 'L001'}</p>
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Pemilik Card */}
                  <div style={{ flex: 1, minWidth: '280px', background: '#FFF', borderRadius: '8px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#F4F5F0"/>
                        <circle cx="16" cy="15" r="5" fill="#FDD835"/>
                        <path d="M7 13C10 10 22 10 25 13L27 15H5L7 13Z" fill="#D7CCC8"/>
                        <path d="M11 13C11 11 21 11 21 13H11Z" fill="#A1887F"/>
                        <circle cx="14" cy="15" r="0.7" fill="#3E2723"/>
                        <circle cx="18" cy="15" r="0.7" fill="#3E2723"/>
                        <path d="M14 17C14 18 18 18 18 17" stroke="#3E2723" stroke-width="0.8" stroke-linecap="round"/>
                        <path d="M9 25C9 21 12 20 16 20C20 20 23 21 23 25" fill="#4CAF50"/>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#111827' }}>Pemilik</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#111827', fontWeight: '700' }}>ID Pengguna: {opCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem' }}>{luasAlpukat.value}</span>
                  <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Total Luas Lahan Alpukat</strong>
                </div>
                <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem' }}>{pohonAlpukat.value}</span>
                  <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Total Pohon</strong>
                </div>
                <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem' }}>{panenAlpukat.value}</span>
                  <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Jumlah Panen Alpukat</strong>
                </div>
              </div>

              {/* Charts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {/* Line Chart */}
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

                {/* Bar Chart */}
                <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#111827' }}>Jumlah pohon (per fase pohon)</h3>
                  
                  {/* Legend Grid */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.73rem', fontWeight: '700', color: '#374151', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                      <span>Belum Produktif: {Math.round(treePhasesAlpukat.value.belum || 0)} (0 - 3 Tahun)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                      <span style={{ width: '10px', height: '10px', backgroundColor: '#3C3026', borderRadius: '2px', display: 'inline-block' }}></span>
                      <span>Produktif: {Math.round(treePhasesAlpukat.value.produktif || 0)} (&gt;= 4 Tahun)</span>
                    </div>
                  </div>

                  {renderBarChart(treePhasesAlpukat.value)}
                </div>
              </div>
            </div>

            {/* ==================== SECTION 2: LAHAN KELENGKENG ==================== */}
            <div>
              {/* Banner Header with Cards */}
              <div style={{ background: '#38431F', borderRadius: '12px', padding: '1.25rem 2rem', color: '#FFF', marginBottom: '1.25rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
                <h2 style={{ textAlign: 'center', margin: '0 0 0.75rem 0', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '0.5px' }}>Dasbor Perkebunan</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1.25rem' }}>
                  <span>Tanggal : {currentDateText.value}</span>
                  <span>{currentTimeText.value}</span>
                </div>

                {/* Lahan & Pemilik Cards */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Lahan Card */}
                  <div style={{ flex: 1, minWidth: '280px', background: '#FFF', borderRadius: '8px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#F4F5F0', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="9" cy="14" r="5" fill="#E53935"/>
                        <circle cx="15" cy="11" r="5" fill="#C62828"/>
                        <path d="M9 9C9 6 12 4 14 4" stroke="#4E342E" stroke-width="2" stroke-linecap="round"/>
                        <path d="M15 6C15 6 14 4 13 4" stroke="#4E342E" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    </div>
                    <div>
                      {(() => {
                        const kelengkengLand = landsList.value.find(l => (l.location || '').toLowerCase().includes('kelengkeng'))
                        return (
                          <>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#111827' }}>{kelengkengLand ? kelengkengLand.name : 'Lahan Kelengkeng'}</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#111827', fontWeight: '700' }}>ID Lahan: {kelengkengLand ? kelengkengLand.code : 'L002'}</p>
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Pemilik Card */}
                  <div style={{ flex: 1, minWidth: '280px', background: '#FFF', borderRadius: '8px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#F4F5F0"/>
                        <circle cx="16" cy="15" r="5" fill="#FDD835"/>
                        <path d="M7 13C10 10 22 10 25 13L27 15H5L7 13Z" fill="#D7CCC8"/>
                        <path d="M11 13C11 11 21 11 21 13H11Z" fill="#A1887F"/>
                        <circle cx="14" cy="15" r="0.7" fill="#3E2723"/>
                        <circle cx="18" cy="15" r="0.7" fill="#3E2723"/>
                        <path d="M14 17C14 18 18 18 18 17" stroke="#3E2723" stroke-width="0.8" stroke-linecap="round"/>
                        <path d="M9 25C9 21 12 20 16 20C20 20 23 21 23 25" fill="#4CAF50"/>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#111827' }}>Pemilik</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#111827', fontWeight: '700' }}>ID Pengguna: {opCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem' }}>{luasKelengkeng.value}</span>
                  <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Total Luas Lahan Kelengkeng</strong>
                </div>
                <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem' }}>{pohonKelengkeng.value}</span>
                  <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Total Pohon</strong>
                </div>
                <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', display: 'block', marginBottom: '0.5rem' }}>{panenKelengkeng.value}</span>
                  <strong style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: '700' }}>Jumlah Panen Kelengkeng</strong>
                </div>
              </div>

              {/* Charts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {/* Line Chart */}
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

                {/* Bar Chart */}
                <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#111827' }}>Jumlah pohon (per fase pohon)</h3>
                  
                  {/* Legend Grid */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.73rem', fontWeight: '700', color: '#374151', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                      <span>Belum Produktif: {Math.round(treePhasesKelengkeng.value.belum || 0)} (0 - 3 Tahun)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                      <span style={{ width: '10px', height: '10px', backgroundColor: '#3C3026', borderRadius: '2px', display: 'inline-block' }}></span>
                      <span>Produktif: {Math.round(treePhasesKelengkeng.value.produktif || 0)} (&gt;= 4 Tahun)</span>
                    </div>
                  </div>

                  {renderBarChart(treePhasesKelengkeng.value)}
                </div>
              </div>
            </div>

          </div>
        </div>
      );
    };
  },
});
