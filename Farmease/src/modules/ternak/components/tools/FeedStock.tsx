import { defineComponent, ref, computed, onMounted } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import { feedsApi, pemangkasanApi } from '@/shared/api';
import { weightRecords, sheep } from '@/store/livestock';
import { cageSession } from '@/store/navigation';

const STOCK_WARNING_THRESHOLD = 30; // kg — alert jika stok di bawah ini
const FEED_PCT_OF_BW = 0.10; // 10% berat badan per hari (FR4-01)

export default defineComponent({
  name: 'FeedStock',
  props: { onClose: { type: Function, default: null } },
  setup(props) {
    const apiStocks = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const form = ref({ source: '', amount: '', unit: 'kg' });
    const addLoading = ref(false);

    const activeCageCode = computed(() => cageSession.value?.code || '');

    const dailyFeedNeeded = ref({ hijauan: 0, konsentrat: 0, activeSheepCount: 0 });

    const totalActiveBW = computed(() => {
      // Hanya fallback UI display jika perlu (tidak dipakai kalkulasi pakan)
      const activeSheep = sheep.value.filter(
        s => s.cage_code === activeCageCode.value && !['Mati', 'Terjual', 'Disembelih'].includes(s.status)
      );
      let total = 0;
      for (const s of activeSheep) {
        const records = weightRecords.value
          .filter(w => w.sheep_id === s.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (records.length > 0) total += records[0]!.weight;
        else total += 30; 
      }
      return total;
    });

    const stocksWithAlert = computed(() =>
      apiStocks.value.map(s => ({
        ...s,
        isLow: s.stock < STOCK_WARNING_THRESHOLD,
        daysLeft: dailyFeedNeeded.value.hijauan > 0
          ? Math.floor(s.stock / (dailyFeedNeeded.value.hijauan / Math.max(apiStocks.value.length, 1)))
          : null,
      }))
    );

    const lowStocks = computed(() => stocksWithAlert.value.filter(s => s.isLow));

    async function loadStocks() {
      loading.value = true;
      error.value = null;
      try {
        apiStocks.value = await feedsApi.getList();
        if (activeCageCode.value) {
          const res = await feedsApi.getRecommendationByCage(activeCageCode.value);
          dailyFeedNeeded.value = {
            hijauan: res.total_hijauan_kg || 0,
            konsentrat: res.total_konsentrat_kg || 0,
            activeSheepCount: res.jumlah_domba || 0
          };
        }
      } catch (e: any) {
        error.value = e.message || 'Gagal memuat data stok pakan';
      } finally {
        loading.value = false;
      }
    }

    const addConversion = async () => {
      if (!form.value.source || !form.value.amount) return;
      addLoading.value = true;
      try {
        await feedsApi.create({
          feed_name: form.value.source,
          feed_type: 'hijauan',
          stock: Number(form.value.amount) || 0,
          unit: form.value.unit,
        });
        form.value.source = '';
        form.value.amount = '';
        await loadStocks();
      } catch (e: any) {
        error.value = e.message || 'Gagal menambah stok';
      } finally {
        addLoading.value = false;
      }
    };

    const pruningData = ref<any[]>([]);
    const pruningLoading = ref(false);

    async function loadPruning() {
      pruningLoading.value = true;
      try {
        const res = await pemangkasanApi.getList();
        pruningData.value = res.filter(p => Number(p.jumlah) > 0);
      } catch (e: any) {
        console.error('Gagal memuat pemangkasan:', e);
      } finally {
        pruningLoading.value = false;
      }
    }

    const convertPruningToFeed = async (p: any) => {
      addLoading.value = true;
      error.value = null;
      try {
        await feedsApi.create({
          feed_name: `Pemangkasan ${p.nama_rincian_aktivitas || 'Daun'}`,
          feed_type: 'hijauan',
          stock: Number(p.jumlah) || 0,
          unit: p.satuan || 'kg',
        });
        await loadStocks();
        alert(`Berhasil mengonversi ${p.jumlah} ${p.satuan} ${p.nama_rincian_aktivitas || 'Daun'} menjadi pakan!`);
      } catch (e: any) {
        error.value = e.message || 'Gagal mengonversi pemangkasan';
      } finally {
        addLoading.value = false;
      }
    };

    onMounted(() => {
      loadStocks();
      loadPruning();
    });

    return () => (
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <Typography variant="h3" weight="bold">Stok & Konversi Pakan</Typography>
          <button class="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => props.onClose?.()}>Tutup</button>
        </div>

        {/* FR4-04: Alert stok minimum */}
        {lowStocks.value.length > 0 && (
          <div class="alert mb-4 py-3 px-4 rounded-4" style={{ background: 'var(--color-warning-bg)', border: '1.5px solid #f59e0b' }}>
            <div class="fw-bold mb-1" style={{ fontSize: '0.85rem' }}>⚠️ Stok Hampir Habis!</div>
            <ul class="mb-0 ps-3" style={{ fontSize: '0.82rem' }}>
              {lowStocks.value.map(s => (
                <li key={s.id}>
                  <strong>{s.feed_name}</strong> — {s.stock} {s.unit} tersisa (di bawah {STOCK_WARNING_THRESHOLD} {s.unit}). Segera lakukan pengisian.
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* FR4-01: Kalkulasi kebutuhan harian */}
        <div class="row g-3 mb-4">
          <div class="col-12">
            <div class="p-3 rounded-4" style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-outline-variant)' }}>
              <Typography variant="h4" weight="bold" className="mb-3 fs-6">Kebutuhan Pakan Harian (10% BB)</Typography>
              <div class="row g-2">
                <div class="col-6 col-md-3">
                  <div class="text-center p-2 bg-white rounded-3 border">
                    <div class="fw-bold text-secondary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Total BB Aktif</div>
                    <div class="fw-bold" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>{totalActiveBW.value} kg</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-center p-2 bg-white rounded-3 border">
                    <div class="fw-bold text-secondary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Kebutuhan Hijauan</div>
                    <div class="fw-bold" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>{dailyFeedNeeded.value.hijauan} kg/hari</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-center p-2 bg-white rounded-3 border">
                    <div class="fw-bold text-secondary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Kebutuhan Konsentrat</div>
                    <div class="fw-bold" style={{ color: 'var(--color-secondary)', fontSize: '1.1rem' }}>{dailyFeedNeeded.value.konsentrat} kg/hari</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-center p-2 bg-white rounded-3 border">
                    <div class="fw-bold text-secondary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Domba Aktif</div>
                    <div class="fw-bold" style={{ color: 'var(--color-on-surface)', fontSize: '1.1rem' }}>
                      {dailyFeedNeeded.value.activeSheepCount || sheep.value.filter(s => s.cage_code === activeCageCode.value && !['Mati', 'Terjual', 'Disembelih'].includes(s.status)).length} ekor
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tambah Stok / Konversi Hasil Kebun */}
        <div class="mb-4 p-3 rounded-4" style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-outline-variant)' }}>
          <Typography variant="h4" weight="semibold" className="mb-3 fs-6">Konversi & Tambah Stok Pakan</Typography>
          <div class="row g-2">
            <div class="col-12 col-md-5">
              <input
                class="form-control rounded-3"
                placeholder="Nama pakan / sumber"
                value={form.value.source}
                onInput={(e) => form.value.source = (e.target as HTMLInputElement).value}
              />
            </div>
            <div class="col-6 col-md-3">
              <input
                class="form-control rounded-3"
                placeholder="Jumlah"
                type="number"
                value={form.value.amount}
                onInput={(e) => form.value.amount = (e.target as HTMLInputElement).value}
              />
            </div>
            <div class="col-3 col-md-2">
              <select class="form-select rounded-3" value={form.value.unit} onChange={(e) => form.value.unit = (e.target as HTMLSelectElement).value}>
                <option>kg</option>
                <option>ikat</option>
                <option>liter</option>
                <option>ton</option>
              </select>
            </div>
            <div class="col-3 col-md-2">
              <button
                class="btn w-100 rounded-3 text-white fw-bold"
                style={{ backgroundColor: 'var(--color-primary)' }}
                onClick={addConversion}
                disabled={addLoading.value}
              >
                {addLoading.value ? '...' : '+ Tambah'}
              </button>
            </div>
          </div>
          {error.value && <div class="text-danger small mt-2">{error.value}</div>}
        </div>

        {/* Hasil Pemangkasan dari Kebun */}
        <div class="mb-4 p-3 rounded-4" style={{ background: '#f8fae6', border: '1.5px solid #d4d8b6' }}>
          <div class="d-flex align-items-center gap-2 mb-3">
            <img src="/icon/rutin_task.png" style={{ width: '20px', height: '20px', objectFit: 'contain' }} alt="" />
            <Typography variant="h4" weight="semibold" className="m-0 fs-6" style={{ color: '#4a5d23' }}>Hasil Pemangkasan Kebun</Typography>
          </div>
          {pruningLoading.value ? (
            <div class="text-center py-2 text-secondary" style={{ fontSize: '0.85rem' }}>Mengecek data kebun...</div>
          ) : pruningData.value.length === 0 ? (
            <div class="text-center py-2 text-secondary" style={{ fontSize: '0.85rem' }}>Belum ada hasil pemangkasan terbaru</div>
          ) : (
            <div class="d-flex flex-column gap-2">
              {pruningData.value.map((p, idx) => (
                <div key={idx} class="d-flex align-items-center justify-content-between p-2 rounded-3" style={{ background: '#fff', border: '1px solid #e0e4cc' }}>
                  <div>
                    <div class="fw-bold" style={{ fontSize: '0.82rem', color: '#333' }}>Pemangkasan {p.nama_rincian_aktivitas || 'Daun'}</div>
                    <div class="text-secondary mt-1" style={{ fontSize: '0.7rem' }}>{p.tanggal_aktivitas?.split('T')[0] || '-'} • Jumlah: <span class="fw-bold" style={{ color: 'var(--color-primary)' }}>{p.jumlah} {p.satuan}</span></div>
                  </div>
                  <button class="btn btn-sm text-white fw-bold px-3 py-1 rounded-pill" style={{ backgroundColor: 'var(--color-primary)', fontSize: '0.72rem' }} onClick={() => convertPruningToFeed(p)} disabled={addLoading.value}>
                    + Jadikan Pakan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daftar Stok dari API */}
        <Typography variant="h4" weight="semibold" className="mb-3 fs-6">Daftar Stok Pakan</Typography>
        {loading.value ? (
          <div class="text-center py-4 text-secondary">Memuat data stok...</div>
        ) : (
          <div class="d-flex flex-column gap-2">
            {stocksWithAlert.value.map(s => (
              <div
                key={s.id}
                class="d-flex align-items-center justify-content-between p-3 rounded-4"
                style={{
                  background: s.isLow ? 'var(--color-warning-light)' : 'white',
                  border: `1.5px solid ${s.isLow ? 'var(--color-warning)' : 'var(--color-outline-variant)'}`,
                }}
              >
                <div>
                  <div class="fw-bold" style={{ fontSize: '0.85rem' }}>{s.feed_name}</div>
                  <div class="text-secondary" style={{ fontSize: '0.72rem' }}>{s.feed_type} • ID: {s.id}</div>
                  {/* FR4-03: Estimasi kecukupan */}
                  {s.daysLeft !== null && dailyFeedNeeded.value.hijauan > 0 && (
                    <div class={['mt-1', s.daysLeft < 3 ? 'text-danger' : 'text-success']} style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                      ≈ {s.daysLeft} hari kecukupan berdasarkan kebutuhan harian
                    </div>
                  )}
                </div>
                <div class="text-end">
                  <Badge variant={s.isLow ? 'warning' : 'success'} className="px-3 py-1">
                    {s.stock} {s.unit}
                  </Badge>
                  {s.isLow && <div class="text-warning fw-bold mt-1" style={{ fontSize: '0.65rem' }}>⚠️ Stok Rendah</div>}
                </div>
              </div>
            ))}
            {stocksWithAlert.value.length === 0 && (
              <div class="text-center py-4 text-secondary" style={{ fontSize: '0.85rem' }}>Belum ada data stok pakan</div>
            )}
          </div>
        )}
      </div>
    );
  }
});
