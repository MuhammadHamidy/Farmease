import { defineComponent, ref, computed, type PropType } from 'vue';
import { useRouter } from 'vue-router';
import Typography from '@/shared/ui/Typography';

// ============ TS TYPE DEFINITIONS ============
export interface ManureRecord {
  id_manure?: string | number;
  amount?: number;
  quantity?: number;
  date_recorded?: string;
  created_at?: string;
}

export interface BirthRecord {
  id_birth?: string | number;
  id_pregnancy?: string | number;
  birth_date?: string;
  num_offspring?: number;
  number_of_offspring?: number;
  notes?: string;
  created_at?: string;
}

export interface FeedRecord {
  feed_name?: string;
  category?: string;
  notes?: string;
  stock?: number;
  available_stock?: number;
  unit?: string;
}

export interface SheepRecord {
  id: string | number;
  code: string;
  name: string;
  birth_date: string;
  status: string;
  id_type?: string;
}

// ============ Helper for Consistent Palette ============
const COLOR_CRITICAL = '#dc3545'; // Consistent warning red
const COLOR_WARNING = '#ff9800';  // Consistent warning yellow
const COLOR_SAFE = '#198754';     // Consistent safe green

// ============ 1. Manure Production Chart ============
/**
 * CHART TYPE SELECTION RATIONALE (TUGAS AKHIR):
 * Line Chart digunakan untuk visualisasi tren produksi pupuk karena mewakili data kontinu
 * berurutan waktu (time-series). Line chart secara visual efisien untuk mendeteksi fluktuasi
 * bulanan dan mengidentifikasi deviasi signifikan terhadap target/threshold rata-rata produksi.
 * Sesuai prinsip Edward Tufte (Data-Ink Ratio), gridline dibuat sangat tipis tanpa gradient berlebih.
 */
export const ManureProductionChart = defineComponent({
  name: 'ManureProductionChart',
  props: {
    manures: {
      type: Array as PropType<ManureRecord[]>,
      required: true
    },
    sheepList: {
      type: Array as PropType<SheepRecord[]>,
      default: () => []
    },
    threshold: {
      type: Number,
      default: 150
    },
    thresholdPerSheep: {
      type: Number,
      default: 1.5
    }
  },
  setup(props) {
    const mode = ref<'total' | 'per_ekor'>('total');
    
    // Tooltip States
    const activeTooltipIndex = ref<number | null>(null);
    const tooltipX = ref(0);
    const tooltipY = ref(0);

    interface ManureMonthData {
      year: number;
      monthNum: number;
      label: string;
      total: number;
      activeSheepCount: number;
    }

    const chartData = computed(() => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const months: ManureMonthData[] = [];
      
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const year = d.getFullYear();
        const monthNum = d.getMonth() + 1;
        
        const activeSheepCount = props.sheepList.filter(s => {
          if (!s.birth_date) return true;
          const birthDate = new Date(s.birth_date);
          if (isNaN(birthDate.getTime())) return true;
          return birthDate.getFullYear() < year || (birthDate.getFullYear() === year && birthDate.getMonth() + 1 <= monthNum);
        }).length;

        months.push({
          year,
          monthNum,
          label: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
          total: 0,
          activeSheepCount: Math.max(activeSheepCount, 1)
        });
      }

      props.manures.forEach(m => {
        const dateStr = m.date_recorded || m.created_at;
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return;
        const year = d.getFullYear();
        const monthNum = d.getMonth() + 1;
        const match = months.find(mth => mth.year === year && mth.monthNum === monthNum);
        if (match) {
          match.total += Number(m.amount || m.quantity || 0);
        }
      });

      return months;
    });

    const hasData = computed(() => chartData.value.some(m => m.total > 0));
    const currentThreshold = computed(() => mode.value === 'total' ? props.threshold : props.thresholdPerSheep);

    const svgPaths = computed(() => {
      if (!hasData.value) return { line: '', area: '', points: [], maxVal: 50 };

      const values = chartData.value.map(m => {
        return mode.value === 'total' ? m.total : (m.total / m.activeSheepCount);
      });

      const maxVal = Math.max(...values, currentThreshold.value * 1.5, 10);
      
      const points = chartData.value.map((m, idx) => {
        const val = values[idx] ?? 0;
        const x = 70 + idx * 85; // Shift right to make space for Y label
        const y = 150 - (val / maxVal) * 100; // Cap height to leave room for X label

        const deviance = currentThreshold.value > 0 ? (val - currentThreshold.value) / currentThreshold.value : 0;
        let isDeviant = false;
        let pointColor = '#8a9a5b'; // Standard theme color

        if (Math.abs(deviance) > 0.20) {
          isDeviant = true;
          pointColor = deviance > 0 ? COLOR_WARNING : COLOR_CRITICAL;
        }

        return {
          x,
          y,
          value: val,
          label: m.label,
          activeSheep: m.activeSheepCount,
          deviance: Math.round(deviance * 100),
          isDeviant,
          pointColor
        };
      });

      if (points.length === 0) return { line: '', points, maxVal };
      let linePath = `M ${points[0]?.x ?? 0} ${points[0]?.y ?? 0}`;
      for (let i = 1; i < points.length; i++) {
        const pt = points[i];
        if (pt) {
          linePath += ` L ${pt.x} ${pt.y}`;
        }
      }

      return { line: linePath, points, maxVal };
    });

    const handleMouseMove = (idx: number, event: MouseEvent) => {
      activeTooltipIndex.value = idx;
      const target = event.currentTarget as SVGElement;
      const svg = target.ownerSVGElement;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        tooltipX.value = event.clientX - rect.left;
        tooltipY.value = event.clientY - rect.top - 80;
      }
    };

    return () => {
      const activePoint = activeTooltipIndex.value !== null ? svgPaths.value.points[activeTooltipIndex.value] : null;

      return (
        <div class="bg-white rounded-5 border shadow-sm p-4 h-100 text-start position-relative d-flex flex-column justify-content-between">
        {/* Title & Mode Toggle */}
        <div>
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="d-flex align-items-center gap-2">
              <img src="/icon/barrel.png" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              <Typography variant="h4" weight="extrabold" className="m-0 text-dark">
                Tren Produksi Pupuk Kandang per Bulan ({mode.value === 'total' ? 'kg' : 'kg/ekor'})
              </Typography>
            </div>
            
            <div class="btn-group btn-group-sm rounded-pill p-0.5 bg-light border" role="group">
              <button
                type="button"
                class={['btn rounded-pill px-2.5 py-1', mode.value === 'total' ? 'btn-primary' : 'btn-light text-secondary']}
                style={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                onClick={() => mode.value = 'total'}
              >
                Total
              </button>
              <button
                type="button"
                class={['btn rounded-pill px-2.5 py-1', mode.value === 'per_ekor' ? 'btn-primary' : 'btn-light text-secondary']}
                style={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                onClick={() => mode.value = 'per_ekor'}
              >
                Per Ekor
              </button>
            </div>
          </div>

          <Typography variant="p" size="text-xs" color="secondary" className="mb-4 d-block">
            Menampilkan bobot terkumpul mingguan/bulanan. Titik oranye/merah memiliki penyimpangan deviasi &gt;20% dari target.
          </Typography>
        </div>

        {!hasData.value ? (
          <div class="d-flex flex-column align-items-center justify-content-center py-5 text-secondary" style={{ height: '200px', fontSize: '0.85rem' }}>
            <img src="/icon/warning.png" style={{ width: '36px', opacity: 0.3, marginBottom: '0.5rem' }} alt="" />
            <p class="m-0 text-center text-muted">Belum ada data produksi kotoran tercatat</p>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto', height: '220px', backgroundColor: '#fdfdfb', borderRadius: '12px', padding: '10px 5px 0' }} class="position-relative mt-2">
            <svg viewBox="0 0 500 210" width="100%" height="210" style={{ overflow: 'visible' }}>
              {/* Sumbu Y Label */}
              <text x="18" y="100" text-anchor="middle" transform="rotate(-90 18 100)" font-size="9.5" font-weight="800" fill="#666">
                Berat ({mode.value === 'total' ? 'kg' : 'kg/ekor'})
              </text>

              {/* Sumbu X Label */}
              <text x="250" y="200" text-anchor="middle" font-size="9.5" font-weight="800" fill="#666">
                Bulan
              </text>

              {/* Grid Lines (Thin & Clean for accessibility) */}
              {[50, 85, 120, 150].map(y => (
                <line key={y} x1="55" y1={String(y)} x2="470" y2={String(y)}
                  stroke="#e6e8e0" stroke-width="0.8" stroke-dasharray={y === 150 ? '0' : '3,3'} />
              ))}

              {/* Y Axis Numerical Labels */}
              <text x="50" y="154" text-anchor="end" font-size="9" fill="#777" font-weight="bold">0</text>
              <text x="50" y="124" text-anchor="end" font-size="9" fill="#777" font-weight="bold">{(svgPaths.value.maxVal * 0.3).toFixed(mode.value === 'total' ? 0 : 1)}</text>
              <text x="50" y="89" text-anchor="end" font-size="9" fill="#777" font-weight="bold">{(svgPaths.value.maxVal * 0.65).toFixed(mode.value === 'total' ? 0 : 1)}</text>
              <text x="50" y="54" text-anchor="end" font-size="9" fill="#777" font-weight="bold">{svgPaths.value.maxVal.toFixed(mode.value === 'total' ? 0 : 1)}</text>

              {/* Trend Line (Flat, no excessive gradient fill for Tufte print ratio) */}
              <path d={svgPaths.value.line} fill="none" stroke="#8a9a5b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

              {/* Threshold Dashed Line */}
              {(() => {
                const threshY = 150 - (currentThreshold.value / svgPaths.value.maxVal) * 100;
                return (
                  <g>
                    <line x1="55" y1={String(threshY)} x2="470" y2={String(threshY)}
                      stroke={COLOR_CRITICAL} stroke-width="1.5" stroke-dasharray="5,4" />
                  </g>
                );
              })()}

              {/* Data Points */}
              {svgPaths.value.points.map((p, idx) => (
                <g key={idx}>
                  {p.isDeviant && (
                    <circle cx={p.x} cy={p.y} r="9" fill={p.pointColor} opacity="0.3" class="animate-pulse" />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.isDeviant ? '5.5' : '4'}
                    fill="#ffffff"
                    stroke={p.pointColor}
                    stroke-width={p.isDeviant ? '3.5' : '2'}
                    style={{ cursor: 'pointer' }}
                    onMousemove={(e) => handleMouseMove(idx, e)}
                    onMouseleave={() => activeTooltipIndex.value = null}
                  />
                  <text x={p.x} y="172" text-anchor="middle" font-size="9.5" fill="#555" font-weight="bold">
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>

            {/* Custom Tooltip */}
            {activePoint && (
              <div
                class="position-absolute bg-dark text-white p-2.5 rounded-3 shadow text-start"
                style={{
                  left: `${tooltipX.value}px`,
                  top: `${tooltipY.value}px`,
                  transform: 'translateX(-50%)',
                  zIndex: 100,
                  fontSize: '0.75rem',
                  minWidth: '160px',
                  pointerEvents: 'none',
                  opacity: 0.95,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div class="fw-bold border-bottom pb-1 mb-1" style={{ color: '#ffc107' }}>
                  {activePoint.label}
                </div>
                <div>Berat: <strong>{activePoint.value.toFixed(1)} {mode.value === 'total' ? 'kg' : 'kg/ekor'}</strong></div>
                <div>Deviasi: <strong style={{ color: activePoint.deviance >= 0 ? '#4caf50' : '#f44336' }}>
                  {activePoint.deviance}%
                </strong></div>
                <div>Ternak Aktif: <strong>{activePoint.activeSheep} ekor</strong></div>
              </div>
            )}
          </div>
        )}

        {/* Legend block at bottom */}
        <div class="d-flex justify-content-center gap-3 mt-3 border-top pt-2" style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold' }}>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#8a9a5b', borderRadius: '50%' }}></span>
            <span>Normal</span>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: COLOR_WARNING, borderRadius: '50%' }}></span>
            <span>Deviasi &gt;20% (Tinggi)</span>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: COLOR_CRITICAL, borderRadius: '50%' }}></span>
            <span>Deviasi &gt;20% (Rendah)</span>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '16px', height: '2px', borderTop: `1.5px dashed ${COLOR_CRITICAL}` }}></span>
            <span>Target Rata-rata</span>
          </div>
        </div>
      </div>
      );
    };
  }
});

// ============ 2. Birth Count Chart ============
/**
 * CHART TYPE SELECTION RATIONALE (TUGAS AKHIR):
 * Stacked Bar Chart dipilih karena kelahiran domba adalah data diskrit per periode (bulan).
 * visualisasi bertumpuk (stacked) memungkinkan perbandingan total kelahiran sekaligus
 * mendistribusikan kontribusi jenis/ras ternak (Dorper F2, Dorper Cross, Garut Cross) secara konsisten.
 */
export const BirthCountChart = defineComponent({
  name: 'BirthCountChart',
  props: {
    births: {
      type: Array as PropType<BirthRecord[]>,
      required: true
    },
    sheepList: {
      type: Array as PropType<SheepRecord[]>,
      default: () => []
    }
  },
  setup(props) {
    const router = useRouter();
    interface BirthMonthData {
      year: number;
      monthNum: number;
      label: string;
      Garut: number;
      'Dorper F2': number;
      'Cross Dorper': number;
      'Cross Garut': number;
      Lainnya: number;
      total: number;
      [key: string]: any; // Index signature to allow dynamic indexing
    }

    const activeTooltipIndex = ref<number | null>(null);
    const tooltipX = ref(0);
    const tooltipY = ref(0);

    // Color Blind Safe Distinct Palette for Breeds matching the example
    const breedColors: Record<string, string> = {
      'Garut': '#10b981',         // Emerald green
      'Dorper F2': '#3b82f6',     // Royal blue
      'Cross Dorper': '#f59e0b',  // Amber orange
      'Cross Garut': '#8b5cf6',   // Purple
      'Lainnya': '#6b7280'        // Cool gray
    };

    // Classify offspring breed/ras based on DB seeds
    const getOffspringBreed = (nameOrCode: string, typeNameOrId?: string): 'Garut' | 'Dorper F2' | 'Cross Dorper' | 'Cross Garut' | 'Lainnya' => {
      const typeStr = (typeNameOrId || '').toLowerCase();
      if (typeStr.includes('22222222-2222-2222-2222-222222222201') || typeStr === 'garut') return 'Garut';
      if (typeStr.includes('22222222-2222-2222-2222-222222222205') || typeStr === 'dorper f2') return 'Dorper F2';
      if (typeStr.includes('22222222-2222-2222-2222-222222222207') || typeStr.includes('cross dorp') || typeStr.includes('cross dorper')) return 'Cross Dorper';
      if (typeStr.includes('22222222-2222-2222-2222-222222222208') || typeStr.includes('cross garu') || typeStr.includes('cross garut')) return 'Cross Garut';

      const lower = nameOrCode.toLowerCase();
      if (lower.includes('garut') && !lower.includes('cross') && !lower.includes('f2')) return 'Garut';
      if (lower.includes('f2') || lower.includes('dorper f2')) return 'Dorper F2';
      if (lower.includes('cross') && (lower.includes('dorp') || lower.includes('dorper'))) return 'Cross Dorper';
      if (lower.includes('cross') && (lower.includes('garu') || lower.includes('garut'))) return 'Cross Garut';

      return 'Lainnya';
    };

    const getOffspringBreedFromRecord = (b: any, index: number, sheepList: any[]): 'Garut' | 'Dorper F2' | 'Cross Dorper' | 'Cross Garut' | 'Lainnya' => {
      // 1. Try direct lookup in sheepList
      const matchedSheep = sheepList.find(s => 
        (s.name || '').includes(`Anak-${b.id_birth}`) ||
        (s.code || '').includes(`Anak-${b.id_birth}`)
      );
      if (matchedSheep) {
        return getOffspringBreed(matchedSheep.name, matchedSheep.type);
      }

      // 2. Extract parent details from notes
      const notes = (b.notes || '').toLowerCase();
      if (notes.includes('xd010') || notes.includes('goliath') || notes.includes('cross d') || notes.includes('cross dorper')) {
        return 'Cross Dorper';
      }
      if (notes.includes('d177') || notes.includes('toni')) {
        return 'Cross Dorper';
      }
      if (notes.includes('j-01') || notes.includes('pejantan j-01')) {
        return 'Garut';
      }

      const matchNotes = (b.notes || '').match(/(?:Indukan|Mother)\s+([A-Z0-9-]+)/i);
      if (matchNotes && matchNotes[1]) {
        const motherCode = matchNotes[1].trim();
        const motherSheep = sheepList.find(s => s.code === motherCode || (s.name && s.name.includes(motherCode)));
        if (motherSheep) {
          if (motherCode === 'XG882' || motherCode === 'XG855' || motherCode === 'XG842') {
            return 'Garut';
          }
          if (motherCode === 'XG827' || motherCode === 'XG858' || motherCode === 'XG859' || motherCode === 'XG875') {
            return 'Cross Dorper';
          }
          return getOffspringBreed(motherSheep.name, motherSheep.type);
        }
      }

      return 'Lainnya';
    };

    const chartData = computed(() => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const months: BirthMonthData[] = [];
      
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({
          year: d.getFullYear(),
          monthNum: d.getMonth() + 1,
          label: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
          'Garut': 0,
          'Dorper F2': 0,
          'Cross Dorper': 0,
          'Cross Garut': 0,
          'Lainnya': 0,
          total: 0
        });
      }

      props.births.forEach(b => {
        const dateStr = b.birth_date || b.created_at;
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return;
        const year = d.getFullYear();
        const monthNum = d.getMonth() + 1;
        const match = months.find(mth => mth.year === year && mth.monthNum === monthNum);
        
        if (match) {
          const count = Number(b.number_of_offspring || b.num_offspring || 1);
          for (let i = 0; i < count; i++) {
            const breed = getOffspringBreedFromRecord(b, i, props.sheepList);
            match[breed] = (match[breed] || 0) + 1;
            match.total = (match.total || 0) + 1;
          }
        }
      });

      return months;
    });

    const hasData = computed(() => chartData.value.some(m => m.total > 0));
    const maxVal = computed(() => {
      const vals = chartData.value.flatMap(m => [
        m['Garut'] || 0,
        m['Dorper F2'] || 0,
        m['Cross Dorper'] || 0,
        m['Cross Garut'] || 0,
        m['Lainnya'] || 0
      ]);
      return Math.max(...vals, 5);
    });

    const barStacks = computed(() => {
      if (!hasData.value) return [];
      
      return chartData.value.map((m, idx) => {
        const xCenter = 70 + idx * 85; // center of the group
        
        // Render 5 bars side-by-side (8px wide, 1.5px gap)
        // Group width = 8*5 + 1.5*4 = 46px. Offset to center: -23px.
        const garutX = xCenter - 23;
        const df2X = xCenter - 13.5;
        const cdX = xCenter - 4;
        const cgX = xCenter + 5.5;
        const lainX = xCenter + 15;
        
        // Calculate heights relative to maxVal
        const garutH = ((m['Garut'] || 0) / maxVal.value) * 100;
        const df2H = ((m['Dorper F2'] || 0) / maxVal.value) * 100;
        const cdH = ((m['Cross Dorper'] || 0) / maxVal.value) * 100;
        const cgH = ((m['Cross Garut'] || 0) / maxVal.value) * 100;
        const lainH = ((m['Lainnya'] || 0) / maxVal.value) * 100;
        
        // Y coordinates from baseline (150px)
        const garutY = 150 - garutH;
        const df2Y = 150 - df2H;
        const cdY = 150 - cdH;
        const cgY = 150 - cgH;
        const lainY = 150 - lainH;

        return {
          x: xCenter - 23, // compatibility fallback
          xCenter,
          garutX, garutY, garutH,
          df2X, df2Y, df2H,
          cdX, cdY, cdH,
          cgX, cgY, cgH,
          lainX, lainY, lainH,
          total: m.total || 0,
          garutCount: m['Garut'] || 0,
          df2Count: m['Dorper F2'] || 0,
          cdCount: m['Cross Dorper'] || 0,
          cgCount: m['Cross Garut'] || 0,
          lainCount: m['Lainnya'] || 0,
          label: m.label
        };
      });
    });

    const handleMouseMove = (idx: number, event: MouseEvent) => {
      activeTooltipIndex.value = idx;
      const target = event.currentTarget as SVGElement;
      const svg = target.ownerSVGElement;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        tooltipX.value = event.clientX - rect.left;
        tooltipY.value = event.clientY - rect.top - 100;
      }
    };

    return () => {
      const activeStack = activeTooltipIndex.value !== null ? barStacks.value[activeTooltipIndex.value] : null;

      return (
        <div class="bg-white rounded-5 border shadow-sm p-4 h-100 text-start position-relative d-flex flex-column justify-content-between">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <img src="/icon/catat_lahir.png" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            <Typography variant="h4" weight="extrabold" className="m-0 text-dark">
              Distribusi Kelahiran Anak Domba per Bulan Berdasarkan Jenis/Ras (ekor)
            </Typography>
          </div>
          <Typography variant="p" size="text-xs" color="secondary" className="mb-4 d-block">
            Visualisasi distribusi ras hasil peranakan diskrit bulanan berdasarkan database FARMEase.
          </Typography>
        </div>

        {!hasData.value ? (
          <div class="d-flex flex-column align-items-center justify-content-center py-5 text-secondary" style={{ height: '200px', fontSize: '0.85rem' }}>
            <img src="/icon/warning.png" style={{ width: '36px', opacity: 0.3, marginBottom: '0.5rem' }} alt="" />
            <p class="m-0 text-center text-muted">Belum ada data kelahiran domba tercatat</p>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', height: '280px', backgroundColor: '#fdfdfb', borderRadius: '12px', padding: '10px 5px 0' }} class="position-relative mt-2">
            <svg viewBox="0 0 500 210" width="100%" height="270" style={{ overflow: 'visible' }}>
              {/* Sumbu Y Label */}
              <text x="18" y="100" text-anchor="middle" transform="rotate(-90 18 100)" font-size="9.5" font-weight="800" fill="#666">
                Jumlah Anak Domba (ekor)
              </text>

              {/* Sumbu X Label */}
              <text x="250" y="200" text-anchor="middle" font-size="9.5" font-weight="800" fill="#666">
                Bulan
              </text>

              {/* Grid Lines */}
              {[50, 85, 120, 150].map(y => (
                <line key={y} x1="55" y1={String(y)} x2="470" y2={String(y)}
                  stroke="#e6e8e0" stroke-width="0.8" stroke-dasharray={y === 150 ? '0' : '3,3'} />
              ))}

              {/* Y Axis Numeric Labels */}
              <text x="50" y="154" text-anchor="end" font-size="9" fill="#777" font-weight="bold">0</text>
              <text x="50" y="124" text-anchor="end" font-size="9" fill="#777" font-weight="bold">{(maxVal.value * 0.3).toFixed(0)}</text>
              <text x="50" y="89" text-anchor="end" font-size="9" fill="#777" font-weight="bold">{(maxVal.value * 0.65).toFixed(0)}</text>
              <text x="50" y="54" text-anchor="end" font-size="9" fill="#777" font-weight="bold">{maxVal.value.toFixed(0)}</text>

              {/* Grouped Bars */}
              {barStacks.value.map((b, idx) => (
                <g key={idx} onMousemove={(e) => handleMouseMove(idx, e)} onMouseleave={() => activeTooltipIndex.value = null}>
                  {/* Garut Bar */}
                  {b.garutH > 0 && (
                    <rect x={b.garutX} y={b.garutY} width="8" height={b.garutH} fill={breedColors['Garut']} rx="1.5" />
                  )}

                  {/* Dorper F2 Bar */}
                  {b.df2H > 0 && (
                    <rect x={b.df2X} y={b.df2Y} width="8" height={b.df2H} fill={breedColors['Dorper F2']} rx="1.5" />
                  )}

                  {/* Cross Dorper Bar */}
                  {b.cdH > 0 && (
                    <rect x={b.cdX} y={b.cdY} width="8" height={b.cdH} fill={breedColors['Cross Dorper']} rx="1.5" />
                  )}

                  {/* Cross Garut Bar */}
                  {b.cgH > 0 && (
                    <rect x={b.cgX} y={b.cgY} width="8" height={b.cgH} fill={breedColors['Cross Garut']} rx="1.5" />
                  )}

                  {/* Lainnya Bar */}
                  {b.lainH > 0 && (
                    <rect x={b.lainX} y={b.lainY} width="8" height={b.lainH} fill={breedColors['Lainnya']} rx="1.5" />
                  )}

                  {/* Individual Bar Values */}
                  {b.garutCount > 0 && (
                    <text x={b.garutX + 4} y={b.garutY - 4} text-anchor="middle" font-size="8" font-weight="bold" fill="#555">
                      {b.garutCount}
                    </text>
                  )}
                  {b.df2Count > 0 && (
                    <text x={b.df2X + 4} y={b.df2Y - 4} text-anchor="middle" font-size="8" font-weight="bold" fill="#555">
                      {b.df2Count}
                    </text>
                  )}
                  {b.cdCount > 0 && (
                    <text x={b.cdX + 4} y={b.cdY - 4} text-anchor="middle" font-size="8" font-weight="bold" fill="#555">
                      {b.cdCount}
                    </text>
                  )}
                  {b.cgCount > 0 && (
                    <text x={b.cgX + 4} y={b.cgY - 4} text-anchor="middle" font-size="8" font-weight="bold" fill="#555">
                      {b.cgCount}
                    </text>
                  )}
                  {b.lainCount > 0 && (
                    <text x={b.lainX + 4} y={b.lainY - 4} text-anchor="middle" font-size="8" font-weight="bold" fill="#555">
                      {b.lainCount}
                    </text>
                  )}

                  {/* X Axis label */}
                  <text x={b.xCenter} y="172" text-anchor="middle" font-size="9.5" fill="#555" font-weight="bold">
                    {b.label}
                  </text>
                </g>
              ))}
            </svg>

            {/* Custom Tooltip */}
            {activeStack && (
              <div
                class="position-absolute bg-dark text-white p-2.5 rounded-3 shadow text-start border-0"
                style={{
                  left: `${tooltipX.value}px`,
                  top: `${tooltipY.value}px`,
                  transform: 'translateX(-50%)',
                  zIndex: 100,
                  fontSize: '0.75rem',
                  minWidth: '180px',
                  pointerEvents: 'none',
                  opacity: 0.95,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div class="fw-bold border-bottom pb-1 mb-1.5" style={{ color: '#ffc107' }}>
                  {activeStack.label}
                </div>
                <div class="d-flex flex-column gap-1">
                  <div>Total Lahir: <strong>{activeStack.total} ekor</strong></div>
                  <div class="d-flex align-items-center gap-1.5">
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: breedColors['Garut'] }}></span>
                    Garut: <strong>{activeStack.garutCount} ekor</strong>
                  </div>
                  <div class="d-flex align-items-center gap-1.5">
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: breedColors['Dorper F2'] }}></span>
                    Dorper F2: <strong>{activeStack.df2Count} ekor</strong>
                  </div>
                  <div class="d-flex align-items-center gap-1.5">
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: breedColors['Cross Dorper'] }}></span>
                    Cross Dorper: <strong>{activeStack.cdCount} ekor</strong>
                  </div>
                  <div class="d-flex align-items-center gap-1.5">
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: breedColors['Cross Garut'] }}></span>
                    Cross Garut: <strong>{activeStack.cgCount} ekor</strong>
                  </div>
                  <div class="d-flex align-items-center gap-1.5">
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: breedColors['Lainnya'] }}></span>
                    Lainnya: <strong>{activeStack.lainCount} ekor</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legend block at bottom */}
        <div class="d-flex justify-content-center flex-wrap gap-3 mt-3 border-top pt-2" style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold' }}>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#10b981' }}></span>
            <span>Garut</span>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#3b82f6' }}></span>
            <span>Dorper F2</span>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#f59e0b' }}></span>
            <span>Cross Dorper</span>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#8b5cf6' }}></span>
            <span>Cross Garut</span>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#6b7280' }}></span>
            <span>Lainnya</span>
          </div>
        </div>
      </div>
      );
    };
  }
});

// ============ 3. Feed Stock Chart ============
/**
 * CHART TYPE SELECTION RATIONALE (TUGAS AKHIR):
 * Horizontal Bar Chart dipilih untuk stok logistik karena memberikan visualisasi langsung tingkat volume.
 * Label nilai diletakkan di ujung bar untuk menghindari kerancuan, sort descending membantu memfokuskan
 * operator pada pakan yang paling darurat/kritis, dan 0 kg dipisahkan agar langsung memicu keputusan restock.
 */
export const FeedStockChart = defineComponent({
  name: 'FeedStockChart',
  props: {
    feeds: {
      type: Array as PropType<FeedRecord[]>,
      required: true
    },
    sheepList: {
      type: Array as PropType<SheepRecord[]>,
      default: () => []
    },
    thresholds: {
      type: Object as PropType<Record<string, number>>,
      default: () => ({
        'Mineral & Vitamin': 50,
        'Protein': 150,
        'Energi': 200,
        'Serat / Hijauan': 300,
        'Lainnya': 50
      })
    }
  },
  setup(props) {
    const activeSheepCount = computed(() => {
      return props.sheepList.filter(s => !['Mati', 'Terjual', 'Disembelih'].includes(s.status)).length;
    });

    const categorized = computed(() => {
      let mineral = 0;
      let protein = 0;
      let energi = 0;
      let serat = 0;
      let lainnya = 0;

      props.feeds.forEach(f => {
        const nameLower = (f.feed_name || '').toLowerCase();
        const catLower = (f.category || '').toLowerCase();
        const notesLower = (f.notes || '').toLowerCase();
        const stock = Number(f.stock || f.available_stock || 0);

        if (nameLower.includes('mineral') || nameLower.includes('garam') || catLower === 'vitamin' || nameLower.includes('premix') || nameLower.includes('complex')) {
          mineral += stock;
        } else if (nameLower.includes('ampas tahu') || nameLower.includes('bungkil') || notesLower.includes('protein') || nameLower.includes('pellet')) {
          protein += stock;
        } else if (nameLower.includes('bekatul') || nameLower.includes('onggok') || nameLower.includes('jagung') || notesLower.includes('energi') || catLower === 'konsentrat') {
          energi += stock;
        } else if (catLower === 'hijauan' || catLower === 'greenery' || nameLower.includes('rumput') || nameLower.includes('daun') || nameLower.includes('silase') || nameLower.includes('gajah') || nameLower.includes('odot')) {
          serat += stock;
        } else {
          lainnya += stock;
        }
      });

      const categoriesRaw = [
        { label: 'Mineral & Vitamin', value: mineral },
        { label: 'Protein', value: protein },
        { label: 'Energi', value: energi },
        { label: 'Serat / Hijauan', value: serat },
        { label: 'Lainnya', value: lainnya }
      ];

      return categoriesRaw.map(cat => {
        const minThresh = props.thresholds[cat.label] || 50;
        
        let color = COLOR_CRITICAL;
        let status = 'Kritis';
        if (cat.value > minThresh * 1.5) {
          color = COLOR_SAFE;
          status = 'Aman';
        } else if (cat.value >= minThresh) {
          color = COLOR_WARNING;
          status = 'Siaga';
        }

        let dailyConsumptionPerSheep = 0.2;
        if (cat.label === 'Serat / Hijauan') dailyConsumptionPerSheep = 3.0;
        else if (cat.label === 'Protein') dailyConsumptionPerSheep = 0.75;
        else if (cat.label === 'Energi') dailyConsumptionPerSheep = 0.75;
        else if (cat.label === 'Mineral & Vitamin') dailyConsumptionPerSheep = 0.05;

        const totalDailyConsumption = dailyConsumptionPerSheep * activeSheepCount.value;
        const daysLeft = totalDailyConsumption > 0 ? Math.floor(cat.value / totalDailyConsumption) : 999;
        
        const displayMax = minThresh * 2;
        const pct = Math.min(Math.round((cat.value / displayMax) * 100), 100);

        return {
          label: cat.label,
          value: cat.value,
          threshold: minThresh,
          color,
          status,
          pct,
          daysLeft
        };
      });
    });

    const outOfStockCategories = computed(() => {
      return categorized.value.filter(cat => cat.value === 0);
    });

    const sortedCategories = computed(() => {
      return [...categorized.value].sort((a, b) => {
        if (a.value === 0 && b.value > 0) return -1;
        if (b.value === 0 && a.value > 0) return 1;
        const ratioA = a.value / a.threshold;
        const ratioB = b.value / b.threshold;
        return ratioA - ratioB; // most urgent at top
      });
    });

    return () => (
      <div class="bg-white rounded-5 border shadow-sm p-4 h-100 text-start d-flex flex-column justify-content-between">
        <div>
          <div class="d-flex align-items-center gap-2 mb-3">
            <img src="/icon/hay.png" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            <Typography variant="h4" weight="extrabold" className="m-0 text-dark">
              Status Ketersediaan Stok Pakan Berdasarkan Kategori Nutrisi (kg)
            </Typography>
          </div>

          {/* Separate Alert Box for 0 kg stocks */}
          {outOfStockCategories.value.length > 0 && (
            <div class="alert alert-danger rounded-4 border-0 p-3 mb-3 d-flex flex-column gap-2" style={{ backgroundColor: 'rgba(220, 53, 69, 0.08)', border: `1.5px solid ${COLOR_CRITICAL}` }}>
              {outOfStockCategories.value.map(cat => (
                <div key={cat.label} class="d-flex align-items-center gap-2 text-danger" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <span>⚠️</span>
                  <span>Kategori <strong>{cat.label}</strong> Habis Total (0 kg)! Silakan restock logistik segera.</span>
                </div>
              ))}
            </div>
          )}

          <Typography variant="p" size="text-xs" color="secondary" className="mb-4 d-block">
            Menampilkan tingkat stok bahan pakan dibandingkan dengan batas minimum gudang. Diurutkan otomatis.
          </Typography>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
            {sortedCategories.value.map(cat => {
              const hasStock = cat.value > 0;
              return (
                <div key={cat.label}>
                  <div class="d-flex justify-content-between align-items-baseline mb-1.5" style={{ fontSize: '0.82rem', fontWeight: 'bold' }}>
                    <span class="text-dark d-flex align-items-center gap-2">
                      {cat.label}
                      <span class="badge" style={{ backgroundColor: cat.value === 0 ? COLOR_CRITICAL : cat.color, color: '#fff', fontSize: '0.62rem', padding: '2.5px 6px' }}>
                        {cat.value === 0 ? 'Kritis' : cat.status}
                      </span>
                    </span>
                    <span class="text-muted">
                      {cat.value.toLocaleString('id-ID')} kg / Min: {cat.threshold} kg
                    </span>
                  </div>

                  {/* Horizontal Bar Container */}
                  <div class="position-relative" style={{ height: '14px' }}>
                    <div class="progress" style={{ height: '14px', borderRadius: '7px', backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
                      <div
                        class="progress-bar"
                        style={{
                          width: `${cat.pct}%`,
                          backgroundColor: cat.color,
                          borderRadius: '7px',
                          transition: 'width 0.5s ease-in-out'
                        }}
                      ></div>
                    </div>

                    {/* Vertical threshold marker line at exactly 50% width */}
                    {hasStock && (
                      <div
                        class="position-absolute"
                        style={{
                          left: '50%',
                          top: '-3px',
                          height: '20px',
                          width: '2px',
                          backgroundColor: '#444',
                          zIndex: 10,
                          transform: 'translateX(-50%)'
                        }}
                        title={`Threshold: ${cat.threshold} kg`}
                      >
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#222', position: 'absolute', top: '-1px', left: '-1px' }}></div>
                      </div>
                    )}
                  </div>

                  {/* Projection Days Remaining */}
                  <div class="d-flex justify-content-between mt-1" style={{ fontSize: '0.72rem', fontWeight: 'bold' }}>
                    <span class="text-secondary">Estimasi Hari Tersisa:</span>
                    <span style={{ color: cat.daysLeft <= 7 ? COLOR_CRITICAL : (cat.daysLeft <= 14 ? COLOR_WARNING : COLOR_SAFE) }}>
                      {cat.daysLeft === 999 
                        ? 'Aman (Belum ada domba)' 
                        : (cat.value === 0 ? 'Habis (0 Hari)' : `${cat.daysLeft} Hari`)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend block at bottom */}
        <div class="d-flex justify-content-center gap-3 mt-4 border-top pt-2" style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold' }}>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: COLOR_SAFE, borderRadius: '3px' }}></span>
            <span>Aman (&gt;150% Target)</span>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: COLOR_WARNING, borderRadius: '3px' }}></span>
            <span>Perlu Restock (100%-150%)</span>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: COLOR_CRITICAL, borderRadius: '3px' }}></span>
            <span>Kritis (&lt;100% Target)</span>
          </div>
          <div class="d-flex align-items-center gap-1.5">
            <span style={{ display: 'inline-block', width: '2px', height: '12px', backgroundColor: '#444' }}></span>
            <span>Marker Target Minimum</span>
          </div>
        </div>
      </div>
    );
  }
});
