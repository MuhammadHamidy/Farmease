import { defineComponent, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css'
import PerkebunanBackButton from '../components/shared/PerkebunanBackButton'
import { getJenisIcon } from '../components/shared/pencatatanIcons'

const riwayatData = [
  { id: 'R-001', jenis: 'Perawatan', judul: 'Alpukat', tanggal: '10 April 2026', detail: 'A001 • Mingguan • L1001' },
  { id: 'R-002', jenis: 'Pemangkasan', judul: 'Kelengkeng', tanggal: '09 April 2026', detail: 'K001 • 3 x sehari • L2002' },
  { id: 'R-003', jenis: 'Pemangkasan', judul: 'Kelengkeng', tanggal: '09 April 2026', detail: 'K002 • 3 x sehari • L2002' },
  { id: 'R-004', jenis: 'Pemangkasan', judul: 'Kelengkeng', tanggal: '09 April 2026', detail: 'K003 • 3 x sehari • L2002' },
  { id: 'R-005', jenis: 'Pemangkasan', judul: 'Kelengkeng', tanggal: '09 April 2026', detail: 'K004 • 3 x sehari • L2002' },
  { id: 'R-006', jenis: 'Perawatan', judul: 'Alpukat', tanggal: '09 April 2026', detail: 'A002 • 2 x Bulanan • L1001' },
]

export default defineComponent({
  name: 'RiwayatPencatatanPage',
  setup() {
    const router = useRouter()
    const query = ref('')
    const activeJenis = ref('')
    const currentDateText = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date())

    const filtered = computed(() => {
      const q = query.value.trim().toLowerCase()
      return riwayatData.filter((item) => {
        const matchesQuery = !q || [item.jenis, item.judul, item.tanggal, item.detail].some((field) => field.toLowerCase().includes(q))
        const matchesJenis = !activeJenis.value || item.jenis === activeJenis.value
        return matchesQuery && matchesJenis
      })
    })

    const jenisOptions = ['Perawatan', 'Pemangkasan']

    return () => (
      <div class="detail-page">
        <div class="detail-shell">
          {/* Topbar back button */}
          <header class="detail-topbar" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding: 0.5rem 0;">
            <PerkebunanBackButton onClick={() => router.push({ name: 'kebun' })} />
          </header>

          {/* Main Card with inner search pill as in Mockup 1 */}
          <div class="perkebunan-card-wrapper" style="margin-bottom: 1.25rem;">
            <div class="selection-gradient-header" style="border-radius: 1rem 1rem 0 0; margin: 0; padding: 1.5rem 1.25rem;">
              <h2 style="margin: 0 0 1rem; font-size: 1.35rem; font-weight: 700; color: #ffffff;">Riwayat Pencatatan</h2>
              <div class="selection-search-pill-wrap" style="width: 100%;">
                <img src="/icon/search.png" alt="Search" class="selection-search-icon" style="position: absolute; left: 0.95rem; top: 50%; transform: translateY(-50%); width: 1rem; height: 1rem; opacity: 0.6;" />
                <input
                  class="selection-search-pill"
                  type="text"
                  placeholder="Cari riwayat pencatatan"
                  value={query.value}
                  onInput={(e) => { query.value = (e.target as HTMLInputElement).value }}
                  style="width: 100%; border: none; border-radius: 9999px; padding: 0.55rem 1rem 0.55rem 2.5rem; outline: none; background: #ffffff; color: #374151;"
                />
              </div>
            </div>

            <div class="perkebunan-card-body" style="padding: 1.25rem;">
              {/* Filter Label */}
              <div class="history-filter-label" style="font-weight: bold; color: #2f3b1d; margin-top: 0; margin-bottom: 0.55rem; font-size: 1.05rem;">Pilih Riwayat Pencatatan</div>
              
              {/* Filter Row */}
              <div class="history-filter-row" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
                <button
                  class={['history-filter-chip', !activeJenis.value ? 'active' : '']}
                  onClick={() => activeJenis.value = ''}
                  style={`border-radius: 9999px; padding: 0.4rem 1.15rem; font-size: 0.82rem; font-weight: bold; cursor: pointer; transition: all 0.2s; ${
                    !activeJenis.value ? 'background: #38431f; color: #fff; border-color: #38431f;' : 'background: #fff; border: 1.5px solid #dce1d0; color: #374151;'
                  }`}
                >
                  Semua
                </button>
                {jenisOptions.map((jenis) => (
                  <button
                    key={jenis}
                    class={['history-filter-chip', activeJenis.value === jenis ? 'active' : '']}
                    onClick={() => activeJenis.value = jenis}
                    style={`border-radius: 9999px; padding: 0.4rem 1.15rem; font-size: 0.82rem; font-weight: bold; cursor: pointer; transition: all 0.2s; ${
                      activeJenis.value === jenis ? 'background: #38431f; color: #fff; border-color: #38431f;' : 'background: #fff; border: 1.5px solid #dce1d0; color: #374151;'
                    }`}
                  >
                    {jenis}
                  </button>
                ))}
              </div>

              {/* Grid Riwayat Cards */}
              <div class="history-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.75rem;">
                {filtered.value.map((item) => (
                  <article class="history-card" style="border: 1.5px solid #dce1d0; border-radius: 0.75rem; padding: 1rem; background: #ffffff; display: flex; flex-direction: column; gap: 0.75rem; transition: all 0.2s ease;">
                    <div class="history-chip-row" style="display: flex; justify-content: flex-start;">
                      <span
                        class="reminder-tag"
                        style="background: #38431f; color: #ffffff; padding: 0.22rem 0.65rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;"
                      >
                        {item.jenis}
                      </span>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                          <img src={getJenisIcon(item.jenis)} alt={item.jenis} style="width: 1.3rem; height: 1.3rem;" />
                        </div>
                        <div style="display: flex; flex-direction: column;">
                          <strong style="font-size: 1rem; color: #111827; font-weight: 700; display: block;">{item.judul}</strong>
                          <span style="font-size: 0.78rem; color: #6b7280; display: block; margin-top: 0.1rem;">{item.tanggal}</span>
                          <small style="font-size: 0.75rem; color: #9ca3af; display: block; margin-top: 0.1rem;">{item.detail}</small>
                        </div>
                      </div>

                      <button class="history-arrow-btn" style="border: none; background: none; color: #4f5d2e; font-size: 1.5rem; font-weight: bold; cursor: pointer; padding: 0.25rem;">›</button>
                    </div>
                  </article>
                ))}
              </div>

              {filtered.value.length === 0 && (
                <div class="history-empty" style="text-align: center; color: #6b7280; padding: 2rem 0;">Tidak ada riwayat ditemukan.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
})
