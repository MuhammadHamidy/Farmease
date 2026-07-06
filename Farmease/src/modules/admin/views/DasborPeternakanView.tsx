import { defineComponent, computed, onMounted, ref } from 'vue';
import { cagesList, fetchCagesList } from '@/store/navigation';
import { sheep, fetchSheep, weightRecords, fetchWeightRecords } from '@/store/livestock';
import { pendingApprovalCount } from '@/store/operatorAdmin';
import Typography from '@/shared/ui/Typography';
import StatCard from '@/shared/ui/StatCard';
import Badge from '@/shared/ui/Badge';
import ReportsExport from '@/modules/admin/components/tools/ReportsExport';
import { feedsApi, manureApi, birthApi } from '@/shared/api';
import { FeedStockChart, ManureProductionChart, BirthCountChart } from '@/shared/ui/DashboardCharts';

export default defineComponent({
  name: 'DasborPeternakanView',
  setup() {
    const feedsData = ref<any[]>([]);
    const manuresData = ref<any[]>([]);
    const birthsData = ref<any[]>([]);

    onMounted(async () => {
      await Promise.all([
        fetchCagesList(),
        fetchSheep(),
        fetchWeightRecords(),
      ]);
      try {
        const [f, m, b] = await Promise.all([
          feedsApi.getList(),
          manureApi.getList(),
          birthApi.getHistory()
        ]);
        feedsData.value = f || [];
        manuresData.value = m || [];
        birthsData.value = b || [];
      } catch (err) {
        console.error('Failed to load chart data:', err);
      }
    });

    const activeSheep = computed(() => sheep.value.filter(s => !['Mati', 'Terjual', 'Disembelih'].includes(s.status)));
    const totalSheep = computed(() => activeSheep.value.length);
    const totalCages = computed(() => cagesList.value.length);
    const sickCount = computed(() => activeSheep.value.filter(s => s.status === 'Sakit').length);
    const healthyCount = computed(() => totalSheep.value - sickCount.value);
    const healthyPct = computed(() => totalSheep.value > 0 ? Math.round((healthyCount.value / totalSheep.value) * 100) : 100);

    // FR8-01: Mortalitas 30 hari terakhir
    const mortalitas30Hari = computed(() => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return sheep.value.filter(s => s.status === 'Mati' || s.status === 'Disembelih' || s.status === 'Terjual').length;
    });

    // FR8-01: Rata-rata ADG dari weight records
    const rataRataADG = computed(() => {
      const activeSheep = sheep.value.filter(s => !['Mati', 'Terjual', 'Disembelih'].includes(s.status) && (s as any).adg !== undefined && (s as any).adg !== null);
      let totalADG = 0;
      let countADG = 0;
      for (const s of activeSheep) {
        if ((s as any).adg > 0) {
          totalADG += (s as any).adg;
          countADG++;
        }
      }
      return countADG > 0 ? Math.round(totalADG / countADG) : null;
    });

    const cageSummaries = computed(() => {
      return cagesList.value.map(c => {
        const count = sheep.value.filter(s => s.cage_code === c.code).length;
        const pct = c.capacity > 0 ? Math.round((count / c.capacity) * 100) : 0;
        return {
          ...c,
          count,
          pct
        };
      });
    });

    return () => (
      <div class="animate-fade-in-up">
        {/* Title Header */}
        <div class="view-header mb-4">
          <div>
            <Typography variant="h2" size="text-2xl" weight="extrabold" className="m-0 text-dark">
              Dasbor Peternakan
            </Typography>
            <Typography variant="p" size="text-sm" color="secondary" className="m-0">
              Ringkasan data populasi ternak, kesehatan, dan kapasitas kandang.
            </Typography>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        {/* Row 1: Populasi dan Kandang (Dua Card Terpisah) */}
        <div class="row g-4 mb-4 text-start">
          <div class="col-12 col-md-6">
            <div class="card p-4 bg-white border rounded-5 shadow-sm">
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-circle p-2 bg-light d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', border: '1px solid #e2dfd8' }}>
                  <img src="/icon/domba.png" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                </div>
                <div>
                  <span class="text-secondary small fw-bold d-block text-uppercase" style={{ letterSpacing: '0.5px' }}>Total Populasi</span>
                  <strong class="text-dark" style={{ fontSize: '1.8rem', lineHeight: '1.2' }}>{totalSheep.value} Ekor</strong>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="card p-4 bg-white border rounded-5 shadow-sm">
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-circle p-2 bg-light d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', border: '1px solid #e2dfd8' }}>
                  <img src="/icon/kandang.png" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                </div>
                <div>
                  <span class="text-secondary small fw-bold d-block text-uppercase" style={{ letterSpacing: '0.5px' }}>Jumlah Kandang</span>
                  <strong class="text-dark" style={{ fontSize: '1.8rem', lineHeight: '1.2' }}>{totalCages.value} Kandang</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Asymmetric 2 Columns Layout for Main & Secondary Health Indicators */}
        {/* 
          DOKUMENTASI TUGAS AKHIR (BAB IV - ANALISIS SUB-LAYOUT STAT CARD):
          Status Kesehatan ditempatkan sebagai indikator utama di kolom kiri dengan ukuran penuh (tinggi penuh), 
          sedangkan pertumbuhan (ADG) dan penyusutan (Mutasi Keluar) diletakkan di kolom kanan sebagai indikator pendukung.
          Kolom kiri memiliki visualisasi donut chart yang diperbesar untuk monitoring cepat kesehatan populasi secara real-time.
        */}
        <div class="row g-4 mb-4 text-start align-items-stretch">
          {/* Kolom Kiri: Status Kesehatan (Tinggi Penuh, lebar 50% di lg) */}
          <div class="col-12 col-lg-6 d-flex">
            <div class="card p-4 bg-white border rounded-5 shadow-sm w-100 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex align-items-center gap-2 mb-2">
                  <img src="/icon/catat_sehat.png" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                  <span class="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '0.5px', margin: 0 }}>STATUS KESEHATAN (INDIKATOR UTAMA)</span>
                </div>
                <div class="d-flex align-items-center justify-content-center flex-grow-1 py-2" style={{ gap: '30px' }}>
                  <div class="position-relative" style={{ width: '160px', height: '160px', flexShrink: 0 }}>
                    <svg viewBox="0 0 80 80" width="160" height="160">
                      <circle cx="40" cy="40" r="30" fill="transparent" stroke="#dc3545" stroke-width="8" />
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        fill="transparent"
                        stroke="#198754"
                        stroke-width="8"
                        stroke-dasharray="188.4"
                        stroke-dashoffset={String(188.4 - (healthyPct.value / 100) * 188.4)}
                        stroke-linecap="round"
                        transform="rotate(-90 40 40)"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                      />
                    </svg>
                    <div class="position-absolute top-50 start-50 translate-middle text-center">
                      <strong style={{ fontSize: '1.7rem', color: '#111', lineHeight: '1' }}>{healthyPct.value}%</strong>
                      <span class="d-block text-muted" style={{ fontSize: '0.7rem', fontWeight: '800', marginTop: '4px', letterSpacing: '0.5px' }}>SEHAT</span>
                    </div>
                  </div>
                  
                  <div class="text-start" style={{ fontSize: '0.95rem' }}>
                    <div class="d-flex align-items-center gap-2 mb-3">
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#198754', borderRadius: '50%' }}></span>
                      <span class="text-muted">Sehat: <strong>{healthyCount.value} Ekor</strong></span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#dc3545', borderRadius: '50%' }}></span>
                      <span class="text-muted">Sakit: <strong>{sickCount.value} Ekor</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: ADG + Mutasi Keluar (Stacked, lebar 50% di lg) */}
          <div class="col-12 col-lg-6 d-flex flex-column gap-3 justify-content-between">
            {/* Card 1: Rata-Rata ADG */}
            <div class="card p-4 bg-white border rounded-5 shadow-sm flex-grow-1 d-flex flex-column justify-content-center">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex align-items-center gap-2">
                  <img src="/icon/bar-chart.png" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                  <span class="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '0.5px', margin: 0 }}>RATA-RATA ADG (INDIKATOR PERTUMBUHAN)</span>
                </div>
                <strong style={{ fontSize: '0.9rem', color: rataRataADG.value !== null && rataRataADG.value >= 100 ? '#198754' : '#ff9800' }}>
                  {rataRataADG.value !== null ? `${rataRataADG.value} gr/hr` : '—'}
                </strong>
              </div>
              <div class="progress mb-2" style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  class={['progress-bar', rataRataADG.value !== null && rataRataADG.value >= 100 ? 'bg-success' : 'bg-warning']}
                  style={{ width: `${Math.min(((rataRataADG.value || 0) / 150) * 100, 100)}%` }}
                ></div>
              </div>
              <span class="text-muted d-block" style={{ fontSize: '0.65rem', lineHeight: '1.2' }}>Target pertumbuhan domba: 150 gr/hari</span>
            </div>

            {/* Card 2: Mutasi Keluar & Pending Review */}
            <div class="card p-4 bg-white border rounded-5 shadow-sm flex-grow-1 d-flex flex-column justify-content-center">
              <div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <img src="/icon/warning.png" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                    <span class="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '0.5px', margin: 0 }}>MUTASI KELUAR (INDIKATOR PENYUSUTAN)</span>
                  </div>
                  <strong class={mortalitas30Hari.value > 0 ? 'text-danger' : 'text-success'} style={{ fontSize: '0.85rem' }}>
                    {mortalitas30Hari.value} Ekor
                  </strong>
                </div>
                <div class="progress mb-2" style={{ height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    class="progress-bar bg-danger"
                    style={{ width: `${Math.min((mortalitas30Hari.value / 10) * 100, 100)}%` }}
                  ></div>
                </div>
                <span class="text-muted d-block" style={{ fontSize: '0.65rem', lineHeight: '1.2' }}>Mati / terjual / potong (30 hari)</span>
              </div>
              
              {pendingApprovalCount.value > 0 && (
                <div class="d-flex align-items-center gap-2 mt-2 px-2 py-1 rounded bg-danger bg-opacity-10 border border-danger-subtle" style={{ fontSize: '0.7rem' }}>
                  <img src="/icon/warning.png" style={{ width: '12px', height: '12px', objectFit: 'contain' }} />
                  <span class="fw-bold text-danger">{pendingApprovalCount.value} Catatan Menunggu Review</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Chart Tren Produksi Pupuk Kandang per Bulan (Full Width) */}
        <div class="row g-4 mb-4">
          <div class="col-12">
            <ManureProductionChart manures={manuresData.value} sheepList={sheep.value} />
          </div>
        </div>

        {/* Row 4: Distribusi Kelahiran Anak Domba per Bulan Berdasarkan Jenis/Ras (Full Width) */}
        <div class="row g-4 mb-4">
          <div class="col-12">
            <BirthCountChart births={birthsData.value} sheepList={sheep.value} />
          </div>
        </div>

        {/* Row 5: Status Ketersediaan Stok Pakan Berdasarkan Kategori Nutrisi (Full Width) */}
        <div class="row g-4 mb-4">
          <div class="col-12">
            <FeedStockChart feeds={feedsData.value} sheepList={sheep.value} />
          </div>
        </div>

        {/* Detailed Grid */}
        <div class="row g-4">
          <div class="col-12">
            <div class="view-card">
              <Typography variant="h3" size="text-lg" weight="extrabold" className="mb-3 text-dark">
                Utilitas Kapasitas Kandang
              </Typography>
              <div class="table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Kode Kandang</th>
                      <th>Nama Kandang</th>
                      <th>Fokus Jenis Ternak</th>
                      <th>Jumlah Ternak</th>
                      <th>Kapasitas</th>
                      <th>Ketersediaan Space</th>
                      <th>Status Kepadatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cageSummaries.value.map(c => {
                      const avail = c.capacity - c.count;
                      return (
                        <tr key={c.code}>
                          <td><code>{c.code}</code></td>
                          <td class="fw-bold">{c.name}</td>
                          <td>{c.type}</td>
                          <td><strong>{c.count} Ekor</strong></td>
                          <td>{c.capacity} Ekor</td>
                          <td>
                            <Badge variant={avail <= 5 ? 'danger' : 'success'}>
                              {avail} Ekor
                            </Badge>
                          </td>
                          <td>
                            <div class="d-flex align-items-center gap-2">
                              <div class="progress grow" style={{ height: '8px', minWidth: '100px' }}>
                                <div 
                                  class={['progress-bar', c.pct >= 90 ? 'bg-danger' : c.pct >= 75 ? 'bg-warning' : 'bg-success']} 
                                  style={{ width: `${c.pct}%` }}
                                ></div>
                              </div>
                              <span class="small fw-bold">{c.pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {cageSummaries.value.length === 0 && (
                      <tr>
                        <td colspan="7" class="text-center py-4 text-muted">
                          Tidak ada data kandang ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="view-card">
              <ReportsExport />
            </div>
          </div>
        </div>
      </div>
    );
  }
});
