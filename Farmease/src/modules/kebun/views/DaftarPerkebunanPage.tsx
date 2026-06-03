import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css'
import PerkebunanBackButton from '../components/shared/PerkebunanBackButton'
import { cropsList, fetchCropsList } from '@/store/navigation'

export default defineComponent({
  name: 'DaftarPerkebunanPage',
  setup() {
    const router = useRouter()
    const query = ref('')
    const currentDateText = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    }).format(new Date())

    onMounted(async () => {
      await fetchCropsList()
    })

    const filtered = computed(() => {
      const value = query.value.trim().toLowerCase()
      return cropsList.value.filter((item) => (
        item.name.toLowerCase().includes(value) ||
        item.code.toLowerCase().includes(value) ||
        item.type.toLowerCase().includes(value) ||
        item.land.toLowerCase().includes(value)
      ))
    })

    return () => (
      <div class="detail-page">
        <div class="detail-shell">
          {/* Topbar back button */}
          <header class="detail-topbar" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding: 0.5rem 0;">
            <PerkebunanBackButton onClick={() => router.push({ name: 'kebun' })} />
          </header>

          {/* Main Card */}
          <div class="perkebunan-card-wrapper">
            <div class="perkebunan-card-header" style="background: linear-gradient(180deg, #38431f 0%, #2f3b1d 100%);">
              <div>
                <span class="card-subtitle">Daftar Perkebunan</span>
                <h3 class="card-title">Daftar Perkebunan</h3>
              </div>
            </div>

            <div class="perkebunan-card-body" style="padding: 1.25rem;">
              {/* Lahan Card with sprout icon */}
              <div class="form-group" style="margin-bottom: 1.25rem;">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Kode Lahan</span>
                <div class="perkebunan-record-form-card" style="display: flex; align-items: center; gap: 0.85rem; border: 1.5px solid #cfd7bb; border-radius: 0.55rem; padding: 0.75rem; background: #ffffff;">
                  <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <img src="/icon/rumput.png" alt="Lahan" style="width: 1.3rem; height: 1.3rem;" />
                  </div>
                  <div>
                    <span style="font-size: 0.72rem; color: #6b7280; display: block;">Kode Lahan</span>
                    <strong style="font-size: 1rem; color: #111827;">L001</strong>
                  </div>
                </div>
              </div>

              {/* Pilih Pohon Label & Search Input */}
              <div class="form-group" style="margin-bottom: 1.25rem;">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Pohon</span>
                <div class="selection-search-pill-wrap" style="width: 100%;">
                  <img src="/icon/search.png" alt="Search" class="selection-search-icon" style="position: absolute; left: 0.95rem; top: 50%; transform: translateY(-50%); width: 1rem; height: 1rem; opacity: 0.6;" />
                  <input
                    class="selection-search-pill"
                    type="text"
                    placeholder="Cari Pohon"
                    value={query.value}
                    onInput={(e) => { query.value = (e.target as HTMLInputElement).value }}
                    style="width: 100%; border: 1.5px solid #cfd7bb; border-radius: 9999px; padding: 0.55rem 1rem 0.55rem 2.5rem; outline: none; background: #ffffff;"
                  />
                </div>
              </div>

              {/* Grid List Cards */}
              <div class="list-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.75rem;">
                {filtered.value.map((item) => (
                  <article class="list-card" style="border: 1.5px solid #dfe4d4; border-radius: 0.75rem; padding: 0.85rem; display: flex; align-items: center; justify-content: space-between; background: #ffffff; cursor: pointer; transition: all 0.2s ease;">
                    <div style="display: flex; align-items: center; gap: 0.85rem;">
                      <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <img src="/icon/rumput.png" alt="Tree" style="width: 1.3rem; height: 1.3rem;" />
                      </div>
                      <div style="display: flex; flex-direction: column;">
                        <strong style="font-size: 1rem; color: #2f3b1d; font-weight: 700;">{item.name}</strong>
                        <span style="font-size: 0.76rem; color: #6b7280;">Kode {item.code} • {item.type} • {item.land}</span>
                      </div>
                    </div>
                    <div class="list-card-arrow" style="color: #4f5d2e; font-size: 1.25rem; font-weight: bold;">›</div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
