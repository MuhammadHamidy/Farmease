import { defineComponent, type PropType, computed } from 'vue';
import Typography from '@/shared/ui/Typography';

export default defineComponent({
  name: 'SheepWeightChart',
  props: {
    records: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  setup(props) {
    const chartData = computed(() => {
      const records = [...props.records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (records.length === 0) return { points: [], areaPath: '', linePath: '', minWeight: 0, maxWeight: 0, range: 0, height: 150, paddingY: 20 };

      // Calculate min/max weight for dynamic Y-axis
      const weights = records.map(r => Number(r.weight) || 0);
      const minWeight = Math.max(0, Math.floor(Math.min(...weights) / 10) * 10 - 10);
      const maxWeight = Math.ceil(Math.max(...weights) / 10) * 10 + 10;
      const range = maxWeight - minWeight;

      // Map to SVG coordinates
      const width = 500;
      const height = 150; // Active charting area height
      const paddingX = 45;
      const paddingY = 20;
      
      const availableWidth = width - paddingX * 2;
      const stepX = records.length > 1 ? availableWidth / (records.length - 1) : availableWidth / 2;

      const points = records.map((r, idx) => {
        const w = Number(r.weight) || 0;
        const normalizedY = range > 0 ? (w - minWeight) / range : 0.5;
        
        return {
          x: paddingX + (records.length === 1 ? stepX : idx * stepX),
          y: height + paddingY - (normalizedY * height),
          value: w,
          label: new Date(r.date).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
          fullDate: new Date(r.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        };
      });

      let linePath = '';
      let areaPath = '';

      if (points.length > 0) {
        const firstPoint = points[0]!;
        const lastPoint = points[points.length - 1]!;
        linePath = `M ${firstPoint.x} ${firstPoint.y}`;
        points.forEach((p, i) => {
          if (i > 0) {
            // Add some smoothing if desired, but straight lines are fine
            linePath += ` L ${p.x} ${p.y}`;
          }
        });

        // Close path for area
        areaPath = `${linePath} L ${lastPoint.x} ${height + paddingY} L ${firstPoint.x} ${height + paddingY} Z`;
      }

      return { points, areaPath, linePath, minWeight, maxWeight, range, height, paddingY };
    });

    const yAxisLabels = computed(() => {
      const { minWeight, maxWeight, range } = chartData.value;
      if (range === 0) return [minWeight];
      const steps = 4;
      const labels = [];
      for (let i = 0; i <= steps; i++) {
        labels.push(minWeight + (range / steps) * i);
      }
      return labels;
    });

    return () => (
      <div class="bg-white rounded-4 border p-4 h-100">
        <Typography variant="h3" weight="bold" color="coffee-brown" className="mb-4 fs-6">
          Grafik Perkembangan Berat Badan
        </Typography>

        {props.records.length === 0 ? (
          <div class="d-flex flex-column align-items-center justify-content-center py-5 text-secondary" style={{ fontSize: '0.85rem' }}>
            <img src="/icon/statistic.png" style={{ width: '40px', opacity: 0.3, marginBottom: '0.75rem' }} alt="" />
            <p class="m-0 text-center">Belum ada riwayat pencatatan</p>
          </div>
        ) : (
          <div class="position-relative w-100" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
            <div style={{ minWidth: '500px', height: '220px' }}>
              <svg viewBox="0 0 500 220" width="100%" height="100%" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="sheep-chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--color-primary-fixed)" stop-opacity="0.5" />
                    <stop offset="100%" stop-color="var(--color-primary-fixed)" stop-opacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Lines & Labels */}
                {yAxisLabels.value.map((val, idx) => {
                  const y = chartData.value.height + chartData.value.paddingY - (idx / (yAxisLabels.value.length - 1)) * chartData.value.height;
                  return (
                    <g key={`y-${idx}`}>
                      <line x1="45" y1={y} x2="480" y2={y}
                        stroke="var(--color-outline-variant)" stroke-width="1" stroke-dasharray={idx === 0 ? '0' : '4,4'} />
                      <text x="35" y={y + 4} text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">{val.toFixed(0)} kg</text>
                    </g>
                  );
                })}

                {/* Paths */}
                {chartData.value.areaPath && <path d={chartData.value.areaPath} fill="url(#sheep-chart-grad)" />}
                {chartData.value.linePath && <path d={chartData.value.linePath} fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />}

                {/* Data Points */}
                {chartData.value.points.map((p, idx) => (
                  <g key={`p-${idx}`}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="var(--color-primary)" stroke-width="3" />
                    <text x={p.x} y={p.y - 12} text-anchor="middle" font-size="10" font-weight="800" fill="var(--color-primary)">
                      {p.value.toFixed(1)} kg
                    </text>
                    <text x={p.x} y={chartData.value.height + chartData.value.paddingY + 20} text-anchor="middle" font-size="10" fill="var(--color-primary)" font-weight="bold">
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  }
});
