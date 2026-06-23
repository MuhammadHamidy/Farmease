import { defineComponent, computed, onMounted } from 'vue';
import { cagesList, fetchCagesList, userSession } from '@/store/navigation';
import { sheep, fetchSheep, weightRecords, fetchWeightRecords } from '@/store/livestock';
import { operatorTasks, fetchTasks } from '@/store/operatorAdmin';
import StatCard from '@/shared/ui/StatCard';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';

export default defineComponent({
  name: 'DasborPemilikPeternakanView',
  setup() {
    onMounted(async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      await Promise.all([
        fetchCagesList(),
        fetchSheep(),
        fetchWeightRecords(),
        fetchTasks(todayStr),
      ]);
    });

    const pemilikName = computed(() => userSession.value?.name || 'Pemilik');

    // Global Stats
    const totalCages = computed(() => cagesList.value.length);
    
    const activeSheep = computed(() => {
      return sheep.value.filter(s => !['Mati', 'Terjual', 'Disembelih'].includes(s.status));
    });

    const totalActiveSheep = computed(() => activeSheep.value.length);
    
    const healthyCount = computed(() => {
      return sheep.value.filter(s => s.status === 'Sehat').length;
    });

    const healthyPct = computed(() => {
      return totalActiveSheep.value > 0 
        ? Math.round((healthyCount.value / totalActiveSheep.value) * 100) 
        : 100;
    });

    const mutasiKeluarCount = computed(() => {
      return sheep.value.filter(s => ['Mati', 'Terjual', 'Disembelih'].includes(s.status)).length;
    });

    const rataRataADG = computed(() => {
      const sheepWithADG = activeSheep.value.filter(s => (s as any).adg > 0);
      if (!sheepWithADG.length) return null;
      const sum = sheepWithADG.reduce((acc, s) => acc + ((s as any).adg as number), 0);
      return Math.round(sum / sheepWithADG.length);
    });

    // Ringkasan Kandang Table Data
    const cageSummaries = computed(() => {
      return cagesList.value.map(c => {
        const sheepInCage = sheep.value.filter(s => s.cage_code === c.code);
        const activeInCage = sheepInCage.filter(s => !['Mati', 'Terjual', 'Disembelih'].includes(s.status));
        const count = activeInCage.length;
        const pct = c.capacity > 0 ? Math.round((count / c.capacity) * 100) : 0;
        
        let densityStatus = 'Ideal';
        if (pct >= 90) {
          densityStatus = 'Penuh';
        } else if (pct >= 70) {
          densityStatus = 'Padat';
        }

        return {
          ...c,
          count,
          pct,
          densityStatus
        };
      });
    });

    return () => (
      <div class="animate-fade-in-up">
        {/* Header Section (Peternakan Standard) */}
        <div class="view-header mb-4">
          <div>
            <Typography variant="h2" size="text-2xl" weight="extrabold" className="m-0 text-dark">
              Dasbor Pemilik Peternakan
            </Typography>
            <Typography variant="p" size="text-sm" color="secondary" className="m-0">
              Selamat datang, {pemilikName.value}. Memantau seluruh populasi ternak, kesehatan, dan utilitas kandang secara real-time.
            </Typography>
          </div>
        </div>

        {/* Stat Cards Row (Peternakan Standard) */}
        <div class="row g-3 mb-4">
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Total Populasi"
              value={`${totalActiveSheep.value} Ekor`}
              sub="Domba aktif di peternakan"
              color="primary"
              icon={() => (
                <img src="/icon/domba.png" alt="Total Populasi" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              )}
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Jumlah Kandang"
              value={`${totalCages.value} Kandang`}
              sub="Kandang yang terdaftar"
              color="light"
              icon={() => (
                <img src="/icon/kandang.png" alt="Jumlah Kandang" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              )}
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Domba Sehat"
              value={`${healthyCount.value} Ekor`}
              sub={`${healthyPct.value}% dari total populasi`}
              color="primary"
              icon={() => (
                <img src="/icon/medical-shield.png" alt="Domba Sehat" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              )}
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="ADG Rata-Rata"
              value={rataRataADG.value !== null ? `${rataRataADG.value} g/hari` : '—'}
              sub={rataRataADG.value !== null ? (rataRataADG.value >= 100 ? '✅ Pertumbuhan Baik' : '⚠️ Perlu Perhatian') : 'Belum ada data berat'}
              color="light"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              )}
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Mutasi Keluar"
              value={`${mutasiKeluarCount.value} Ekor`}
              sub="Total mati, dijual, disembelih"
              color="accent"
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

        {/* Ringkasan Kandang (Peternakan UI Style) */}
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
                          <td class="text-capitalize">{c.type}</td>
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
                              <Badge 
                                variant={c.densityStatus === 'Penuh' ? 'solid-danger' : c.densityStatus === 'Padat' ? 'solid-warning' : 'solid-success'}
                                className="ms-2"
                              >
                                {c.densityStatus}
                              </Badge>
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
        </div>
      </div>
    );
  },
});
