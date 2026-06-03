import { defineComponent, ref, computed, onMounted } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import { userSession, cageSession } from '@/store/navigation';
import {
  healthApi,
  weightApi,
  feedsApi,
  breedingApi,
  birthApi,
} from '@/shared/api';

type RiwayatCategory = 'SEMUA' | 'PAKAN' | 'KAWIN' | 'LAHIR' | 'SEHAT' | 'KOTORAN' | 'BERAT';

interface RiwayatRecord {
  id: string;
  date: string;
  time: string;
  category: Exclude<RiwayatCategory, 'SEMUA'>;
  operator: string;
  summary: string;
  rawDate: Date;
}

export default defineComponent({
  name: 'RiwayatView',
  setup() {
    const filterCategory = ref<RiwayatCategory>('SEMUA');
    const searchVal = ref<string>('');
    const listRecords = ref<RiwayatRecord[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const exporting = ref(false);
    const exportProgress = ref(0);
    const exportSuccess = ref(false);

    const categories: RiwayatCategory[] = ['SEMUA', 'PAKAN', 'BERAT', 'SEHAT', 'KAWIN', 'LAHIR', 'KOTORAN'];

    function formatDate(dateStr: string): string {
      try {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch {
        return dateStr;
      }
    }

    function formatTime(dateStr: string): string {
      try {
        return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      } catch {
        return '';
      }
    }

    async function loadRecords() {
      loading.value = true;
      error.value = null;
      const records: RiwayatRecord[] = [];

      const settleAll = async <T,>(fn: () => Promise<T[]>, mapper: (item: T) => RiwayatRecord | null) => {
        try {
          const list = await fn();
          for (const item of list) {
            const rec = mapper(item);
            if (rec) records.push(rec);
          }
        } catch (err) {
          console.warn('Partial fetch failed:', err);
        }
      };

      await Promise.all([
        // Kesehatan
        settleAll(
          () => healthApi.getGlobalList(),
          (h: any) => ({
            id: `SEHAT-${h.id}`,
            date: formatDate(h.date_recorded || h.created_at),
            time: formatTime(h.date_recorded || h.created_at),
            rawDate: new Date(h.date_recorded || h.created_at),
            category: 'SEHAT' as const,
            operator: '—',
            summary: `Status: ${h.health_status || '—'} • Domba #${h.id_sheep || '—'} • ${h.description || ''}`,
          }),
        ),

        // Berat badan
        settleAll(
          () => weightApi.getList(),
          (w: any) => ({
            id: `BERAT-${w.id}`,
            date: formatDate(w.date_recorded || w.created_at),
            time: formatTime(w.date_recorded || w.created_at),
            rawDate: new Date(w.date_recorded || w.created_at),
            category: 'BERAT' as const,
            operator: '—',
            summary: `Berat: ${w.weight} kg • Domba #${w.id_sheep || '—'}${w.notes ? ` • ${w.notes}` : ''}`,
          }),
        ),

        // Pakan (feeds list sebagai proxy)
        settleAll(
          () => feedsApi.getList(),
          (f: any) => ({
            id: `PAKAN-${f.id}`,
            date: formatDate(f.updated_at || f.created_at),
            time: formatTime(f.updated_at || f.created_at),
            rawDate: new Date(f.updated_at || f.created_at),
            category: 'PAKAN' as const,
            operator: '—',
            summary: `Pakan: ${f.feed_name} (${f.feed_type}) • Stok: ${f.stock} ${f.unit}`,
          }),
        ),

        // Perkawinan
        settleAll(
          () => breedingApi.getMatingList(),
          (m: any) => ({
            id: `KAWIN-${m.id}`,
            date: formatDate(m.mating_date || m.created_at),
            time: formatTime(m.mating_date || m.created_at),
            rawDate: new Date(m.mating_date || m.created_at),
            category: 'KAWIN' as const,
            operator: '—',
            summary: `Betina #${m.id_female_sheep || '—'} × Pejantan #${m.id_male_sheep || '—'} • Status: ${m.status || '—'}${m.notes ? ` • ${m.notes}` : ''}`,
          }),
        ),

        // Kelahiran
        settleAll(
          () => birthApi.getHistory(),
          (b: any) => ({
            id: `LAHIR-${b.id}`,
            date: formatDate(b.birth_date || b.created_at),
            time: formatTime(b.birth_date || b.created_at),
            rawDate: new Date(b.birth_date || b.created_at),
            category: 'LAHIR' as const,
            operator: '—',
            summary: `Induk #${b.id_sheep || '—'} • Jumlah Anak: ${b.num_offspring || 1} Ekor${b.notes ? ` • ${b.notes}` : ''}`,
          }),
        ),
      ]);

      // Sort by date descending
      records.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      listRecords.value = records;
      loading.value = false;
    }

    onMounted(loadRecords);

    const filteredRecords = computed(() => listRecords.value.filter(rec => {
      const matchesCategory = filterCategory.value === 'SEMUA' || rec.category === filterCategory.value;
      const q = searchVal.value.toLowerCase().trim();
      const matchesSearch = !q ||
        rec.id.toLowerCase().includes(q) ||
        rec.operator.toLowerCase().includes(q) ||
        rec.summary.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    }));

    const summaryCards = computed(() => [
      { label: 'Total Log', value: listRecords.value.length, tone: 'primary' },
      { label: 'Kandang Aktif', value: cageSession.value?.code || '—', tone: 'success' },
      { label: 'Operator Aktif', value: userSession.value?.name || '—', tone: 'warning' },
      { label: 'Filter Aktif', value: filterCategory.value, tone: 'light' },
    ]);

    const triggerExport = () => {
      exporting.value = true;
      exportProgress.value = 0;
      exportSuccess.value = false;

      const interval = setInterval(() => {
        exportProgress.value += 20;
        if (exportProgress.value >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            exporting.value = false;
            exportSuccess.value = true;
            setTimeout(() => { exportSuccess.value = false; }, 3000);
          }, 400);
        }
      }, 300);
    };

    const CATEGORY_BADGE: Record<string, any> = {
      PAKAN: 'success',
      BERAT: 'primary',
      KAWIN: 'primary',
      LAHIR: 'warning',
      SEHAT: 'danger',
      KOTORAN: 'secondary',
    };

    return () => (
      <div class="animate-fade-in">
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4 py-2 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2">
              <img src="/icon/statistic.png" alt="Riwayat" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              <Typography variant="h3" weight="extrabold" className="m-0 text-almond-beige">Riwayat Aktivitas Kandang</Typography>
            </div>
            <Typography variant="p" size="text-xs" color="secondary" className="m-0">
              Log lengkap seluruh aktivitas peternakan yang tersimpan di sistem
            </Typography>
          </div>

          <div class="d-flex gap-2 flex-wrap">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold text-xs" onClick={loadRecords} disabled={loading.value}>
              🔄 {loading.value ? 'Memuat...' : 'Refresh Log'}
            </button>
            <button type="button" class="btn py-2 px-4 rounded-pill text-white border-0 fw-bold text-xs shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }} onClick={triggerExport} disabled={exporting.value}>
              📥 Ekspor Laporan
            </button>
          </div>
        </div>

        <div class="row g-3 mb-4">
          {summaryCards.value.map(card => (
            <div class="col-6 col-xl-3" key={card.label}>
              <div class="bg-white rounded-4 border shadow-sm p-3 h-100">
                <Typography variant="span" size="text-xs" className="text-secondary text-uppercase fw-bold d-block">{card.label}</Typography>
                <Typography variant="p" weight="extrabold" className="m-0 text-truncate">{card.value}</Typography>
              </div>
            </div>
          ))}
        </div>

        {exporting.value && (
          <div class="alert alert-info p-4 rounded-4 border-0 mb-4 animate-fade-in d-flex flex-column gap-2">
            <h6 class="fw-bold mb-1">⏳ Sedang Mengekspor Laporan...</h6>
            <div class="progress rounded-pill bg-light" style={{ height: '10px' }}>
              <div class="progress-bar rounded-pill" style={{ width: `${exportProgress.value}%`, backgroundColor: 'var(--color-primary)', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
        )}

        {exportSuccess.value && (
          <div class="alert alert-success p-3 rounded-4 border-0 mb-4 animate-fade-in small font-semibold" style={{ backgroundColor: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}>
            🎉 Laporan berhasil diekspor!
          </div>
        )}

        {/* Filter Panel */}
        <div class="bg-white rounded-5 border shadow-sm p-4 mb-4">
          <div class="row g-3 align-items-center">
            <div class="col-lg-4">
              <label class="form-label-custom mb-1">Cari Kunci Log</label>
              <div class="position-relative">
                <img src="/icon/search.png" alt="Cari" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', objectFit: 'contain', opacity: 0.65 }} />
                <input
                  type="text"
                  class="form-control rounded-4 py-2 ps-5 bg-light border-0"
                  style={{ fontSize: '0.8rem' }}
                  placeholder="ID Log, kata kunci..."
                  value={searchVal.value}
                  onInput={(e) => searchVal.value = (e.target as HTMLInputElement).value}
                />
              </div>
            </div>

            <div class="col-lg-8">
              <label class="form-label-custom mb-1 d-block">Saring Kategori</label>
              <div class="d-flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    type="button"
                    key={cat}
                    class={['btn btn-sm rounded-pill px-3 py-1 fw-bold text-xs', filterCategory.value === cat ? 'btn-primary-custom shadow-sm' : 'btn-light border text-secondary']}
                    onClick={() => filterCategory.value = cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Records */}
        {loading.value ? (
          <div class="text-center py-5 text-secondary">
            <p>Memuat riwayat aktivitas...</p>
          </div>
        ) : (
          <div class="row g-3">
            {filteredRecords.value.length === 0 ? (
              <div class="col-12">
                <div class="bg-white rounded-5 border shadow-sm p-5 text-center text-muted">
                  Belum ada riwayat aktivitas yang tercatat
                </div>
              </div>
            ) : (
              filteredRecords.value.map(rec => (
                <div class="col-12 col-lg-6" key={rec.id}>
                  <div class="bg-white rounded-5 border shadow-sm p-4 h-100">
                    <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div>
                        <Typography variant="span" size="text-xs" weight="bold" className="text-secondary text-uppercase d-block">{rec.id}</Typography>
                        <Typography variant="h5" weight="extrabold" className="m-0">{rec.date}</Typography>
                        <Typography variant="span" className="text-muted" style={{ fontSize: '0.75rem' }}>{rec.time}</Typography>
                      </div>
                      <Badge
                        variant={CATEGORY_BADGE[rec.category] || 'secondary'}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {rec.category}
                      </Badge>
                    </div>

                    <div class="d-flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="px-3 py-1">🏷️ Kandang {cageSession.value?.code || '—'}</Badge>
                    </div>

                    <div class="rounded-4 border p-3 bg-light">
                      <Typography variant="p" className="m-0" size="text-sm">{rec.summary}</Typography>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
});
