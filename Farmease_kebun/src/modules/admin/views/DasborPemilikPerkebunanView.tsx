import { defineComponent, computed, onMounted, ref } from 'vue';
import { landsList, fetchLandsList, cropsList, fetchCropsList } from '@/store/navigation';
import { lahan, pohon, panen, fetchLahan, fetchPohon, fetchPanen } from '@/store/gardening';
import { userSession } from '@/store/navigation';

// ── Helpers ──────────────────────────────────────────────────────────────

function getNowWIB() {
  const now = new Date();
  const wib = new Date(now.getTime() + (7 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000));
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const day = days[now.getDay()];
  const date = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return {
    dateStr: `${day}, ${date} ${month} ${year}`,
    timeStr: `${h}.${m} WIB`,
  };
}

function getLast6Months() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const now = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ label: months[d.getMonth()], year: d.getFullYear(), month: d.getMonth() });
  }
  return result;
}

// ── SVG Line Chart ────────────────────────────────────────────────────────

function LineChart({ dataPerLahan, months }: { dataPerLahan: number[][], months: { label: string }[] }) {
  const W = 360, H = 160, PX = 40, PY = 20;
  const allVals = dataPerLahan.flat();
  const maxVal = Math.max(...allVals, 1);

  const toX = (i: number) => PX + (i / (months.length - 1)) * (W - PX - 10);
  const toY = (v: number) => PY + (1 - v / maxVal) * (H - PY - 24);

  const COLORS = ['#3a5a2c', '#8fae6e'];
  const LABELS = ['Per lahan', 'Per pohon (rata-rata)'];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((p) => {
        const y = PY + (1 - p) * (H - PY - 24);
        return (
          <g key={p}>
            <line x1={PX} y1={y} x2={W - 10} y2={y} stroke="#e5e7eb" stroke-width="1" />
            <text x={PX - 4} y={y + 4} text-anchor="end" font-size="9" fill="#9ca3af">
              {Math.round(p * maxVal)}
            </text>
          </g>
        );
      })}
      {/* X axis labels */}
      {months.map((m, i) => (
        <text key={i} x={toX(i)} y={H - 6} text-anchor="middle" font-size="9" fill="#6b7280">
          {m.label}
        </text>
      ))}
      {/* Lines */}
      {dataPerLahan.map((series, si) => {
        const pts = series.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
        return (
          <g key={si}>
            <polyline
              points={pts}
              fill="none"
              stroke={COLORS[si]}
              stroke-width={si === 0 ? 2.5 : 1.5}
              stroke-dasharray={si === 1 ? '4,3' : 'none'}
            />
            {series.map((v, i) => (
              <circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill={COLORS[si]} stroke="white" stroke-width="1.5" />
            ))}
          </g>
        );
      })}
      {/* Legend */}
      {LABELS.map((lb, si) => (
        <g key={si} transform={`translate(${PX + si * 130}, ${H - 4})`}>
          <rect x="0" y="-7" width="14" height="3" fill={COLORS[si]} rx="1.5" />
          <text x="18" y="0" font-size="8" fill="#374151">{lb}</text>
        </g>
      ))}
      {/* Y-axis label */}
      <text
        x={10}
        y={H / 2}
        text-anchor="middle"
        font-size="8"
        fill="#6b7280"
        transform={`rotate(-90, 10, ${H / 2})`}
      >
        HASIL PANEN (KG)
      </text>
    </svg>
  );
}

// ── SVG Bar Chart ─────────────────────────────────────────────────────────

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const W = 280, H = 160, PX = 28, PY = 16, PB = 24;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = (W - PX - 10) / data.length - 6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* Grid lines */}
      {[0, 0.5, 1].map((p) => {
        const y = PY + (1 - p) * (H - PY - PB);
        return (
          <g key={p}>
            <line x1={PX} y1={y} x2={W - 4} y2={y} stroke="#e5e7eb" stroke-width="1" />
            <text x={PX - 3} y={y + 4} text-anchor="end" font-size="9" fill="#9ca3af">
              {Math.round(p * maxVal)}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const bh = (d.value / maxVal) * (H - PY - PB);
        const bx = PX + i * ((W - PX - 10) / data.length) + 3;
        const by = PY + (H - PY - PB) - bh;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={bh} fill={d.color} rx="3" />
            <text x={bx + barW / 2} y={H - 8} text-anchor="middle" font-size="8" fill="#6b7280">
              {d.label}
            </text>
            <text x={bx + barW / 2} y={by - 3} text-anchor="middle" font-size="8" fill="#374151" font-weight="600">
              {d.value}
            </text>
          </g>
        );
      })}
      {/* Y-axis label */}
      <text
        x={9}
        y={H / 2}
        text-anchor="middle"
        font-size="8"
        fill="#6b7280"
        transform={`rotate(-90, 9, ${H / 2})`}
      >
        JUMLAH POHON
      </text>
    </svg>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────

const IconFarm = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#606C38" stroke-width="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconOwner = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#606C38" stroke-width="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ── Main Component ────────────────────────────────────────────────────────

export default defineComponent({
  name: 'DasborPemilikPerkebunanView',
  setup() {
    const { dateStr, timeStr } = getNowWIB();
    const months6 = getLast6Months();

    onMounted(async () => {
      await Promise.all([
        fetchLandsList(),
        fetchCropsList(),
        fetchLahan(),
        fetchPohon(),
        fetchPanen(),
      ]);
    });

    // Per-lahan data
    const lahanSections = computed(() => {
      return landsList.value.map((land) => {
        // Pohon di lahan ini
        const trees = cropsList.value.filter(c => c.land === land.code);
        const totalPohon = trees.length;
        const totalLuas = parseFloat(land.area) || 0;

        // Fase pohon (berdasarkan age string dari cropsList)
        const fase = {
          generatif: 0,
          vegetatif: 0,
          belumProduktif: 0,
          produktif: 0,
        };
        // Try from pohon store for richer data
        const pohonLahan = pohon.value.filter(p => {
          const lahanObj = landsList.value.find(l => l.code === land.code);
          return lahanObj && p.lahan_code === String(lahanObj.id);
        });

        const treesToUse = pohonLahan.length > 0 ? pohonLahan : trees;
        treesToUse.forEach(p => {
          const age = parseInt((p as any).age || '0');
          const statusStr = ((p as any).type || (p as any).status || '').toLowerCase();
          if (statusStr.includes('generatif')) fase.generatif++;
          else if (statusStr.includes('vegetatif')) fase.vegetatif++;
          else if (statusStr.includes('belum') || age < 3) fase.belumProduktif++;
          else fase.produktif++;
        });

        // Panen data — aggregate per month 6 bulan terakhir
        const pohonIds = new Set(pohonLahan.map(p => p.id));
        const panenLahan = panen.value.filter(pn => pohonIds.has(pn.pohon_id));

        const panenPerMonth = months6.map(m => {
          return panenLahan
            .filter(pn => {
              const d = new Date(pn.date);
              return d.getMonth() === m.month && d.getFullYear() === m.year;
            })
            .reduce((s, pn) => s + (pn.quantity || 0), 0);
        });

        const avgPerPohon = months6.map(m => {
          const total = panenLahan
            .filter(pn => {
              const d = new Date(pn.date);
              return d.getMonth() === m.month && d.getFullYear() === m.year;
            })
            .reduce((s, pn) => s + (pn.quantity || 0), 0);
          return totalPohon > 0 ? Math.round((total / totalPohon) * 10) / 10 : 0;
        });

        const totalPanen = panen.value
          .filter(pn => pohonIds.has(pn.pohon_id))
          .reduce((s, pn) => s + (pn.quantity || 0), 0);

        return {
          land,
          totalPohon,
          totalLuas,
          totalPanen: Math.round(totalPanen),
          panenPerMonth,
          avgPerPohon,
          fase,
        };
      });
    });

    const pemilikName = computed(() => userSession.value?.name || 'Pemilik');
    const pemilikCode = computed(() => userSession.value?.code || 'P0001');

    return () => (
      <div class="pemilik-kebun-page animate-fade-in-up">
        {/* Page Title */}
        <div style={{ padding: '0 0 20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a2e05', margin: 0 }}>
            Dasbor Perkebunan — Pemilik
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0' }}>
            Pantau semua lahan, pohon, dan hasil panen secara real-time.
          </p>
        </div>

        {/* Per-Lahan Sections */}
        {lahanSections.value.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 0', color: '#9ca3af',
            background: 'white', borderRadius: '16px', border: '1px solid #f3f4f6',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style={{ marginBottom: '12px' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <p>Belum ada data lahan terdaftar.</p>
          </div>
        )}

        {lahanSections.value.map((sec) => (
          <div key={sec.land.code} class="pemilik-kebun-section">
            {/* Section Header */}
            <div class="pks-header">
              <div class="pks-header-inner">
                <div class="pks-header-top">
                  <span class="pks-title">Dasbor Perkebunan</span>
                </div>
                <div class="pks-meta-row">
                  <span class="pks-date">Tanggal : {dateStr.split(',')[1]?.trim() || dateStr}</span>
                  <span class="pks-time">{timeStr}</span>
                </div>
                <div class="pks-info-row">
                  {/* Lahan Card */}
                  <div class="pks-info-card">
                    <div class="pks-info-icon">
                      <IconFarm />
                    </div>
                    <div class="pks-info-text">
                      <span class="pks-info-label">
                        Lahan {sec.land.name}
                      </span>
                      <span class="pks-info-sub">ID Lahan: {sec.land.code}</span>
                    </div>
                  </div>
                  {/* Owner Card */}
                  <div class="pks-info-card">
                    <div class="pks-info-icon">
                      <IconOwner />
                    </div>
                    <div class="pks-info-text">
                      <span class="pks-info-label">Pemilik</span>
                      <span class="pks-info-sub">ID Pengguna: {pemilikCode.value}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div class="pks-stats-row">
              <div class="pks-stat-card">
                <span class="pks-stat-value">
                  {sec.totalLuas > 0 ? `${sec.totalLuas.toLocaleString('id-ID')}` : '—'} <span class="pks-stat-unit">Hektar</span>
                </span>
                <span class="pks-stat-label">Total Luas Lahan {sec.land.name}</span>
              </div>
              <div class="pks-stat-card">
                <span class="pks-stat-value">
                  {sec.totalPohon} <span class="pks-stat-unit">Pohon</span>
                </span>
                <span class="pks-stat-label">Total Pohon</span>
              </div>
              <div class="pks-stat-card">
                <span class="pks-stat-value">
                  {sec.totalPanen.toLocaleString('id-ID')} <span class="pks-stat-unit">Kg</span>
                </span>
                <span class="pks-stat-label">Jumlah Panen {sec.land.name}</span>
              </div>
            </div>

            {/* Charts Row */}
            <div class="pks-charts-row">
              {/* Line Chart */}
              <div class="pks-chart-card">
                <div class="pks-chart-title">
                  Hasil Panen {sec.land.name}
                  <span class="pks-chart-sub">Data 6 bulan terakhir (kg)</span>
                </div>
                <LineChart
                  dataPerLahan={[sec.panenPerMonth, sec.avgPerPohon]}
                  months={months6}
                />
              </div>

              {/* Bar Chart */}
              <div class="pks-chart-card">
                <div class="pks-chart-title">
                  Jumlah pohon (per fase pohon)
                  <span class="pks-chart-sub" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {[
                      { color: '#8fae6e', label: `Generatif: ${sec.fase.generatif}` },
                      { color: '#606C38', label: `Vegetatif: ${sec.fase.vegetatif}` },
                      { color: '#c8b97e', label: `Belum Produktif: ${sec.fase.belumProduktif}` },
                      { color: '#30360E', label: `Produktif: ${sec.fase.produktif}` },
                    ].map(l => (
                      <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6b7280' }}>
                        <span style={{ width: '10px', height: '10px', background: l.color, borderRadius: '2px', display: 'inline-block' }} />
                        {l.label}
                      </span>
                    ))}
                  </span>
                </div>
                <BarChart
                  data={[
                    { label: 'Generatif', value: sec.fase.generatif, color: '#8fae6e' },
                    { label: 'Vegetatif', value: sec.fase.vegetatif, color: '#606C38' },
                    { label: 'Belum Produktif', value: sec.fase.belumProduktif, color: '#c8b97e' },
                    { label: 'Produktif', value: sec.fase.produktif, color: '#30360E' },
                  ]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  },
});
