import { defineComponent, type PropType } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';

export default defineComponent({
  name: 'WeightChart',
  props: {
    activeCageCode: { type: String, required: true },
    averageWeightCurrent: { type: String, required: true },
    weightGrowthString: { type: String, required: true },
    totalAnimals: { type: Number, required: true },
    activeCageCapacity: { type: Number, required: true },
    points: { type: Array as PropType<any[]>, required: true },
    linePath: { type: String, required: true },
    areaPath: { type: String, required: true },
  },
  setup(props) {
    return () => (
      <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5 h-100">
        <div class="d-flex align-items-center justify-content-between mb-4 gap-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <img src="/icon/statistic.png" alt="Statistik" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              <Typography variant="h4" weight="extrabold" className="m-0">Perkembangan Rata-Rata Berat Badan</Typography>
            </div>
            <Typography variant="p" size="text-xs" color="secondary" className="m-0">
              Tren kenaikan berat badan domba di Kandang {props.activeCageCode || '—'} (5 Bulan Terakhir)
            </Typography>
          </div>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-6 col-md-4">
            <div class="important-cage-tile p-3">
              <Typography variant="span" size="text-xs" className="text-secondary fw-bold d-block mb-1">Rata-Rata Berat</Typography>
              <Typography variant="h4" weight="extrabold" className="m-0" style={{ color: 'var(--color-primary)' }}>
                {props.averageWeightCurrent}
              </Typography>
            </div>
          </div>
          <div class="col-6 col-md-4">
            <div class="important-cage-tile p-3">
              <Typography variant="span" size="text-xs" className="text-secondary fw-bold d-block mb-1">Pertumbuhan</Typography>
              <Typography variant="h4" weight="extrabold" className="m-0" style={{ color: 'var(--color-primary)' }}>
                {props.weightGrowthString}
              </Typography>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="important-cage-tile p-3">
              <Typography variant="span" size="text-xs" className="text-secondary fw-bold d-block mb-1">Total Populasi</Typography>
              <Typography variant="h4" weight="extrabold" className="m-0" style={{ color: 'var(--color-primary)' }}>
                {props.totalAnimals} / {props.activeCageCapacity} Ekor
              </Typography>
            </div>
          </div>
        </div>

        {props.points.length === 0 ? (
          <div class="d-flex flex-column align-items-center justify-content-center py-5 text-secondary" style={{ fontSize: '0.85rem' }}>
            <img src="/icon/statistic.png" style={{ width: '40px', opacity: 0.3, marginBottom: '0.75rem' }} alt="" />
            <p class="m-0 text-center">Belum ada data berat badan tercatat</p>
          </div>
        ) : (
          <div class="position-relative" style={{ width: '100%', height: '220px', backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '10px 10px 0' }}>
            <svg viewBox="0 0 500 220" width="100%" height="220" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--color-secondary)" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="var(--color-secondary)" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              {[30, 60, 90, 120, 150, 180].map((yVal) => (
                <line key={yVal} x1="45" y1={String(yVal)} x2="480" y2={String(yVal)}
                  stroke="var(--color-outline-variant)" stroke-width="1" stroke-dasharray={yVal === 180 ? '0' : '4,4'} />
              ))}

              <text x="35" y="184" text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">0 kg</text>
              <text x="35" y="154" text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">10 kg</text>
              <text x="35" y="124" text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">20 kg</text>
              <text x="35" y="94" text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">30 kg</text>
              <text x="35" y="64" text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">40 kg</text>
              <text x="35" y="34" text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">50 kg</text>

              <path d={props.areaPath} fill="url(#chart-area-grad)" />
              <path d={props.linePath} fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

              {props.points.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="var(--color-primary)" stroke-width="3" />
                  <text x={p.x} y={p.y - 12} text-anchor="middle" font-size="10" font-weight="800" fill="var(--color-primary)">
                    {p.value.toFixed(1)} kg
                  </text>
                  <text x={p.x} y="202" text-anchor="middle" font-size="11" fill="var(--color-primary)" font-weight="bold">
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>
    );
  }
});
