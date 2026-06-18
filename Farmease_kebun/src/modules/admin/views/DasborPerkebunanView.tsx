import { defineComponent, computed, onMounted } from 'vue';
import { landsList, fetchLandsList, cropsList, fetchCropsList } from '@/store/navigation';
import Typography from '@/shared/ui/Typography';
import StatCard from '@/shared/ui/StatCard';
import Badge from '@/shared/ui/Badge';

export default defineComponent({
  name: 'DasborPerkebunanView',
  setup() {
    onMounted(async () => {
      await Promise.all([
        fetchLandsList(),
        fetchCropsList()
      ]);
    });

    const totalLands = computed(() => landsList.value.length);
    const totalTrees = computed(() => cropsList.value.length);
    const suburCount = computed(() => landsList.value.filter(l => l.status === 'Subur').length);
    
    const landSummaries = computed(() => {
      return landsList.value.map(l => {
        const count = cropsList.value.filter(c => c.land === l.code).length;
        const cap = l.capacity || 50;
        const pct = cap > 0 ? Math.round((count / cap) * 100) : 0;
        return {
          ...l,
          count,
          cap,
          pct
        };
      });
    });

    const averageDensity = computed(() => {
      if (totalLands.value === 0) return 0;
      return Math.round(totalTrees.value / totalLands.value);
    });

    return () => (
      <div class="animate-fade-in-up">
        {/* Title Header */}
        <div class="view-header mb-4">
          <div>
            <Typography variant="h2" size="text-2xl" weight="extrabold" className="m-0 text-dark">
              Dasbor Perkebunan
            </Typography>
            <Typography variant="p" size="text-sm" color="secondary" className="m-0">
              Ringkasan data lahan, populasi pohon/tanaman, dan tingkat kepadatan lahan.
            </Typography>
          </div>
        </div>

        {/* Stat Cards Row */}
        <div class="row g-3 mb-4">
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Total Lahan"
              value={`${totalLands.value} Plot Lahan`}
              sub="Lahan perkebunan aktif"
              color="primary"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                </svg>
              )}
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Populasi Tanaman"
              value={`${totalTrees.value} Pohon`}
              sub="Tercatat di lapangan"
              color="light"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              )}
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Rata-Rata Kepadatan"
              value={`${averageDensity.value} Pohon/Lahan`}
              sub="Penyebaran komoditas"
              color="primary"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              )}
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <StatCard
              label="Lahan Subur"
              value={`${suburCount.value} Plot`}
              sub="Kondisi tanah prima"
              color="light"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
                Utilitas Kapasitas Lahan
              </Typography>
              <div class="table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Kode Lahan</th>
                      <th>Nama Lahan</th>
                      <th>Luas Area</th>
                      <th>Status Lahan</th>
                      <th>Jumlah Pohon</th>
                      <th>Kapasitas Maksimal</th>
                      <th>Ketersediaan Space</th>
                      <th>Status Kepadatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {landSummaries.value.map(l => {
                      const avail = l.cap - l.count;
                      return (
                        <tr key={l.code}>
                          <td><code>{l.code}</code></td>
                          <td class="fw-bold">{l.name}</td>
                          <td>{l.area}</td>
                          <td>
                            <Badge variant={l.status === 'Subur' ? 'success' : 'warning'}>
                              {l.status}
                            </Badge>
                          </td>
                          <td><strong>{l.count} Pohon</strong></td>
                          <td>{l.cap} Pohon</td>
                          <td>
                            <Badge variant={avail <= 5 ? 'danger' : 'success'}>
                              {avail} Pohon
                            </Badge>
                          </td>
                          <td>
                            <div class="d-flex align-items-center gap-2">
                              <div class="progress grow" style={{ height: '8px', minWidth: '100px' }}>
                                <div 
                                  class={['progress-bar', l.pct >= 90 ? 'bg-danger' : l.pct >= 75 ? 'bg-warning' : 'bg-success']} 
                                  style={{ width: `${l.pct}%` }}
                                ></div>
                              </div>
                              <span class="small fw-bold">{l.pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {landSummaries.value.length === 0 && (
                      <tr>
                        <td colspan="8" class="text-center py-4 text-muted">
                          Tidak ada data lahan ditemukan.
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
  }
});
