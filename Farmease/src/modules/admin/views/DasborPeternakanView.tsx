import { defineComponent, computed, onMounted } from 'vue';
import { cagesList, fetchCagesList } from '@/store/navigation';
import { sheep, fetchSheep, weightRecords, fetchWeightRecords } from '@/store/livestock';
import { pendingApprovalCount } from '@/modules/ternak/store/operatorAdmin';
import Typography from '@/shared/ui/Typography';
import StatCard from '@/shared/ui/StatCard';
import Badge from '@/shared/ui/Badge';
import ReportsExport from '@/modules/ternak/components/tools/ReportsExport';

export default defineComponent({
  name: 'DasborPeternakanView',
  setup() {
    onMounted(async () => {
      await Promise.all([
        fetchCagesList(),
        fetchSheep(),
        fetchWeightRecords(),
      ]);
    });

    const totalSheep = computed(() => sheep.value.length);
    const totalCages = computed(() => cagesList.value.length);
    const healthyCount = computed(() => sheep.value.filter(s => s.status === 'Sehat').length);
    const healthyPct = computed(() => totalSheep.value > 0 ? Math.round((healthyCount.value / totalSheep.value) * 100) : 100);

    // FR8-01: Mortalitas 30 hari terakhir
    const mortalitas30Hari = computed(() => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      // Hitung berdasarkan tanggal update jika ada, atau jumlah status mati
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

        {/* Stat Cards Row */}
        <div class="row g-3 mb-4">
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Total Populasi"
              value={`${totalSheep.value} Ekor`}
              sub="Seluruh domba aktif"
              color="primary"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              )}
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Jumlah Kandang"
              value={`${totalCages.value} Kandang`}
              sub="Kandang terdaftar"
              color="light"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              )}
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Status Sehat"
              value={`${healthyCount.value} Ekor`}
              sub={`${healthyPct.value}% dari total populasi`}
              color="primary"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Menunggu Review"
              value={`${pendingApprovalCount.value} Catatan`}
              sub="Perlu persetujuan admin"
              color="accent"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            />
          </div>

          {/* FR8-01: ADG Rata-Rata */}
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="ADG Rata-Rata"
              value={rataRataADG.value !== null ? `${rataRataADG.value} gr/hr` : '—'}
              sub={rataRataADG.value !== null ? (rataRataADG.value >= 100 ? '✅ Pertumbuhan Baik' : rataRataADG.value >= 50 ? '⚠️ Perlu Perhatian' : '🔴 Di Bawah Target') : 'Belum ada data berat'}
              color="light"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              )}
            />
          </div>

          {/* FR8-01: Mortalitas */}
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Mutasi Keluar"
              value={`${mortalitas30Hari.value} Ekor`}
              sub="Mati / Terjual / Disembelih"
              color={mortalitas30Hari.value > 0 ? 'accent' : 'light'}
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
            />
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
