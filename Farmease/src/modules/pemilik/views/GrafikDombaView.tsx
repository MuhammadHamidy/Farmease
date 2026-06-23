import { defineComponent, ref, computed, onMounted } from 'vue';
import { cagesList, fetchCagesList } from '@/store/navigation';
import { sheep, fetchSheep, weightRecords, fetchWeightRecords } from '@/store/livestock';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';

// ── Date Helpers ────────────────────────────────────────────────────────────

function getLast6Months() {
  const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: monthNames[d.getMonth()] ?? '', year: d.getFullYear(), month: d.getMonth() };
  });
}

// ── SVG Sparkline for Individual Sheep ──────────────────────────────────────

function SheepSparkline({ sheepId }: { sheepId: string }) {
  const W = 110, H = 30;
  const PX = 6, PY = 4;

  const recs = weightRecords.value
    .filter(wr => wr.sheep_id === sheepId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (recs.length === 0) {
    return <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>—</span>;
  }

  const firstRec = recs[0];
  if (recs.length === 1 && firstRec) {
    const w = firstRec.weight;
    return (
      <div class="d-inline-flex align-items-center gap-2">
        <svg width={W} height={H} style={{ overflow: 'visible' }}>
          <circle cx={W / 2} cy={H / 2} r="4" fill="var(--color-primary-fixed)" />
        </svg>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>{w} kg</span>
      </div>
    );
  }

  const weights = recs.map(r => r.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const diffW = maxW - minW || 1;

  const getX = (index: number) => PX + (index / (weights.length - 1)) * (W - 2 * PX);
  const getY = (w: number) => H - PY - ((w - minW) / diffW) * (H - 2 * PY);

  const points = recs.map((r, i) => `${getX(i)},${getY(r.weight)}`).join(' ');
  const areaPoints = [
    `${getX(0)},${H}`,
    ...recs.map((r, i) => `${getX(i)},${getY(r.weight)}`),
    `${getX(weights.length - 1)},${H}`
  ].join(' ');

  const currentW = weights[weights.length - 1] ?? 0;
  const startW = weights[0] ?? 0;
  const isUp = currentW >= startW;

  return (
    <div class="d-inline-flex align-items-center gap-2">
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${sheepId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color={isUp ? 'var(--color-primary-fixed)' : 'var(--color-error)'} stop-opacity="0.3" />
            <stop offset="100%" stop-color={isUp ? 'var(--color-primary-fixed)' : 'var(--color-error)'} stop-opacity="0" />
          </linearGradient>
        </defs>
        {/* Fill Area */}
        <polygon points={areaPoints} fill={`url(#grad-${sheepId})`} />
        {/* Trend Line */}
        <polyline
          points={points}
          fill="none"
          stroke={isUp ? 'var(--color-primary-fixed)' : 'var(--color-error)'}
          stroke-width="1.8"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        {/* End Dot */}
        <circle
          cx={getX(weights.length - 1)}
          cy={getY(currentW)}
          r="3"
          fill={isUp ? 'var(--color-secondary)' : 'var(--color-error)'}
        />
      </svg>
      <div class="d-flex flex-column align-items-start" style={{ minWidth: '48px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>{currentW} kg</span>
        <span style={{ fontSize: '0.65rem', color: isUp ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
          {isUp ? '▲' : '▼'} {Math.abs(currentW - startW).toFixed(1)} kg
        </span>
      </div>
    </div>
  );
}

// ── SVG Line Chart for Cages Aggregate ─────────────────────────────────────

function AggregateWeightChart({ values, months }: { values: number[], months: { label: string }[] }) {
  const W = 500, H = 180, PX = 40, PY = 16, PB = 24;
  const maxVal = Math.max(...values, 10);
  const activeVals = values.filter(v => v > 0);
  const minVal = activeVals.length > 0 ? Math.max(0, Math.min(...activeVals) - 5) : 0;
  const diff = maxVal - minVal || 1;

  const toX = (i: number) => PX + (i / Math.max(months.length - 1, 1)) * (W - PX - 15);
  const toY = (v: number) => {
    if (v === 0) return H - PB;
    return PY + (1 - (v - minVal) / diff) * (H - PY - PB - 10);
  };

  const activePoints = values
    .map((v, i) => v > 0 ? { x: toX(i), y: toY(v), val: v, idx: i } : null)
    .filter(Boolean) as { x: number; y: number; val: number; idx: number }[];

  const pts = activePoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id="agg-wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--color-primary-fixed)" stop-opacity="0.3" />
          <stop offset="100%" stop-color="var(--color-primary-fixed)" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      
      {/* Fill area */}
      {(() => {
        const firstPt = activePoints[0];
        const lastPt = activePoints[activePoints.length - 1];
        if (activePoints.length > 1 && firstPt && lastPt) {
          return (
            <polygon
              points={[
                `${firstPt.x},${H - PB}`,
                ...activePoints.map(p => `${p.x},${p.y}`),
                `${lastPt.x},${H - PB}`
              ].join(' ')}
              fill="url(#agg-wg)"
            />
          );
        }
        return null;
      })()}

      {/* Grid lines */}
      {[0, 0.5, 1].map(p => {
        const val = minVal + p * diff;
        const y = toY(val);
        return (
          <g key={p}>
            <line x1={PX} y1={y} x2={W - 15} y2={y} stroke="#e5e7eb" stroke-width="1" stroke-dasharray="3 3" />
            <text x={PX - 6} y={y + 3} text-anchor="end" font-size="9" fill="#9ca3af" font-weight="600">{Math.round(val)}</text>
          </g>
        );
      })}

      {/* Month X Labels */}
      {months.map((m, i) => (
        <text key={i} x={toX(i)} y={H - 6} text-anchor="middle" font-size="9" fill="#6b7280" font-weight="600">{m.label}</text>
      ))}

      {/* Spark/Trend Line */}
      {activePoints.length > 1 && (
        <polyline points={pts} fill="none" stroke="var(--color-primary-fixed)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
      )}

      {/* Value Nodes */}
      {activePoints.map(p => (
        <g key={p.idx}>
          <circle cx={p.x} cy={p.y} r="5" fill="var(--color-primary-fixed)" stroke="white" stroke-width="2" />
          <text x={p.x} y={p.y - 8} text-anchor="middle" font-size="9" fill="#1a2e05" font-weight="700">{p.val} kg</text>
        </g>
      ))}

      {/* Y Axis Label */}
      <text x="12" y={(H - PB) / 2} text-anchor="middle" font-size="8" fill="#9ca3af" font-weight="700" transform={`rotate(-90, 12, ${(H - PB) / 2})`}>RATA-RATA BERAT (KG)</text>
    </svg>
  );
}

// ── Component Definition ────────────────────────────────────────────────────

export default defineComponent({
  name: 'GrafikDombaView',
  setup() {
    const selectedCage = ref<string>('all');
    const searchQuery = ref<string>('');
    const statusFilter = ref<string>('all');
    const months6 = getLast6Months();

    onMounted(async () => {
      await Promise.all([
        fetchCagesList(),
        fetchSheep(),
        fetchWeightRecords()
      ]);
    });

    // Cages option list
    const cageOptions = computed(() => {
      return [{ code: 'all', name: 'Semua Kandang' }, ...cagesList.value];
    });

    // Filtered active sheep list
    const filteredSheep = computed(() => {
      return sheep.value.filter(s => {
        // Only active sheep (not dead/sold)
        const isActive = !['Mati', 'Terjual', 'Disembelih'].includes(s.status);
        if (!isActive) return false;

        // Cage Filter
        if (selectedCage.value !== 'all' && s.cage_code !== selectedCage.value) return false;

        // Status Filter
        if (statusFilter.value !== 'all' && s.status !== statusFilter.value) return false;

        // Search Query
        if (searchQuery.value) {
          const q = searchQuery.value.toLowerCase();
          const matchCode = s.code.toLowerCase().includes(q);
          const matchName = s.name.toLowerCase().includes(q);
          const matchType = s.type.toLowerCase().includes(q);
          if (!matchCode && !matchName && !matchType) return false;
        }

        return true;
      });
    });

    // Aggregate monthly weight values for chart
    const aggregateMonthlyWeights = computed(() => {
      const targetSheepIds = new Set(
        sheep.value
          .filter(s => {
            const isActive = !['Mati', 'Terjual', 'Disembelih'].includes(s.status);
            if (!isActive) return false;
            if (selectedCage.value !== 'all' && s.cage_code !== selectedCage.value) return false;
            return true;
          })
          .map(s => s.id)
      );

      return months6.map(m => {
        const recordsInMonth = weightRecords.value.filter(wr => {
          if (!targetSheepIds.has(wr.sheep_id)) return false;
          const d = new Date(wr.date);
          return d.getMonth() === m.month && d.getFullYear() === m.year;
        });

        if (recordsInMonth.length === 0) return 0;
        const total = recordsInMonth.reduce((sum, r) => sum + r.weight, 0);
        return Math.round((total / recordsInMonth.length) * 10) / 10;
      });
    });

    return () => (
      <div class="animate-fade-in-up">
        {/* Page Header */}
        <div class="view-header mb-4">
          <div>
            <Typography variant="h2" size="text-2xl" weight="extrabold" className="m-0 text-dark">
              Grafik Perkembangan Domba
            </Typography>
            <Typography variant="p" size="text-sm" color="secondary" className="m-0">
              Pantau timbangan berat badan domba secara individual dan rata-rata perkembangan agregat.
            </Typography>
          </div>
        </div>

        {/* Filters Panel */}
        <div class="view-card mb-4">
          <div class="row g-3">
            {/* Filter Kandang */}
            <div class="col-12 col-md-4">
              <label class="small fw-bold text-muted mb-1 d-block">Pilih Kandang</label>
              <select
                value={selectedCage.value}
                onChange={(e: any) => selectedCage.value = e.target.value}
                class="form-select form-select-sm fw-bold text-dark rounded-3"
                style={{ fontSize: '0.82rem' }}
              >
                {cageOptions.value.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name} {c.code !== 'all' ? `(${c.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div class="col-12 col-md-3">
              <label class="small fw-bold text-muted mb-1 d-block">Status Domba</label>
              <select
                value={statusFilter.value}
                onChange={(e: any) => statusFilter.value = e.target.value}
                class="form-select form-select-sm fw-bold text-dark rounded-3"
                style={{ fontSize: '0.82rem' }}
              >
                <option value="all">Semua Status</option>
                <option value="Sehat">🟢 Sehat</option>
                <option value="Sakit">🔴 Sakit</option>
                <option value="Hamil">🟡 Hamil</option>
                <option value="Siap Jual">🔵 Siap Jual</option>
              </select>
            </div>

            {/* Pencarian */}
            <div class="col-12 col-md-5">
              <label class="small fw-bold text-muted mb-1 d-block">Cari Domba</label>
              <input
                type="text"
                placeholder="Cari berdasarkan tag, nama, atau jenis..."
                value={searchQuery.value}
                onInput={(e: any) => searchQuery.value = e.target.value}
                class="form-control form-control-sm rounded-3"
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          </div>
        </div>

        {/* Aggregate Chart Card */}
        <div class="view-card mb-4">
          <div class="mb-3 border-bottom pb-2">
            <Typography variant="h3" size="text-md" weight="extrabold" className="m-0 text-dark">
              Pertumbuhan Berat Agregat
            </Typography>
            <span class="text-muted small">
              Tren berat rata-rata per bulan pada <strong>{cageOptions.value.find(c => c.code === selectedCage.value)?.name}</strong> (6 bulan terakhir)
            </span>
          </div>

          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '10px' }}>
            <AggregateWeightChart values={aggregateMonthlyWeights.value} months={months6} />
          </div>
        </div>

        {/* Sheep List Table Section */}
        <div class="view-card">
          <div class="mb-3">
            <Typography variant="h3" size="text-md" weight="extrabold" className="m-0 text-dark">
              Daftar Perkembangan Domba Individual ({filteredSheep.value.length} Ekor)
            </Typography>
            <span class="text-muted small">
              Timbangan berat badan individu dan sparkline visual tren pertumbuhan domba.
            </span>
          </div>

          {filteredSheep.value.length === 0 ? (
            <div class="text-center py-4 text-muted">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" class="mb-2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <p class="m-0 small">Tidak menemukan data domba yang cocok dengan filter.</p>
            </div>
          ) : (
            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Kode Domba</th>
                    <th>Nama / Jenis</th>
                    <th>Kandang</th>
                    <th>Kelamin · Umur</th>
                    <th>ADG (Rata-rata)</th>
                    <th>Status</th>
                    <th style={{ width: '220px' }}>Perkembangan Berat (Tren)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSheep.value.map(s => (
                    <tr key={s.id}>
                      <td class="fw-bold text-dark">{s.code}</td>
                      <td>
                        <div class="fw-bold">{s.name || 'Domba Tanpa Nama'}</div>
                        <div class="text-muted small text-capitalize">Jenis: {s.type}</div>
                      </td>
                      <td>
                        <Badge variant="primary">Kandang {s.cage_code}</Badge>
                      </td>
                      <td class="text-muted">
                        <span class="text-capitalize">{s.gender}</span> · {s.age || '—'}
                      </td>
                      <td class="fw-bold text-success">
                        {s.adg && s.adg > 0 ? `+${s.adg} g/hari` : '—'}
                      </td>
                      <td>
                        <Badge variant={
                          s.status === 'Sehat' ? 'solid-success' :
                          s.status === 'Sakit' ? 'solid-danger' :
                          s.status === 'Hamil' ? 'solid-warning' : 'solid-secondary'
                        }>
                          {s.status}
                        </Badge>
                      </td>
                      <td>
                        <SheepSparkline sheepId={s.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  },
});
