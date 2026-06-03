import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css'
import PerkebunanBackButton from '../components/shared/PerkebunanBackButton'

export default defineComponent({
  name: 'DasborLahanPage',
  setup() {
    const router = useRouter()
    const currentDateText = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    }).format(new Date())

    return () => (
      <div class="detail-page">
        <div class="detail-shell">
          {/* Topbar back button */}
          <header class="detail-topbar" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding: 0.5rem 0;">
            <PerkebunanBackButton onClick={() => router.push({ name: 'kebun' })} />
          </header>

          {/* Main Dashboard Card */}
          <div class="perkebunan-card-wrapper">
            <div class="perkebunan-card-header" style="background: linear-gradient(180deg, #38431f 0%, #2f3b1d 100%);">
              <div>
                <span class="card-subtitle">Dasbor Lahan</span>
                <h3 class="card-title">Dasbor Lahan</h3>
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

              {/* Centered Stat Grid */}
              <div class="detail-stat-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
                <article class="detail-stat-card" style="border: 1.5px solid #e0e4d6; border-radius: 0.75rem; padding: 1.25rem; text-align: center; display: flex; flex-direction: column; gap: 0.35rem; justify-content: center; background: #ffffff;">
                  <span style="font-size: 1.1rem; font-weight: 700; color: #111827; display: block;">Total Luas Lahan</span>
                  <strong style="font-size: 0.95rem; color: #6b7280; font-weight: 600;">1.220 Hektar</strong>
                </article>
                <article class="detail-stat-card" style="border: 1.5px solid #e0e4d6; border-radius: 0.75rem; padding: 1.25rem; text-align: center; display: flex; flex-direction: column; gap: 0.35rem; justify-content: center; background: #ffffff;">
                  <span style="font-size: 1.1rem; font-weight: 700; color: #111827; display: block;">Total Pohon</span>
                  <strong style="font-size: 0.95rem; color: #6b7280; font-weight: 600;">100 Pohon</strong>
                </article>
                <article class="detail-stat-card" style="border: 1.5px solid #e0e4d6; border-radius: 0.75rem; padding: 1.25rem; text-align: center; display: flex; flex-direction: column; gap: 0.35rem; justify-content: center; background: #ffffff;">
                  <span style="font-size: 1.1rem; font-weight: 700; color: #111827; display: block;">Jumlah Panen</span>
                  <strong style="font-size: 0.95rem; color: #6b7280; font-weight: 600;">1220 Kg</strong>
                </article>
              </div>

              {/* Charts Grid */}
              <div class="detail-chart-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                <div class="detail-chart-card" style="border: 1.5px solid #e0e4d6; border-radius: 0.75rem; padding: 1rem;">
                  <h3 style="font-weight: 700; color: #111827; font-size: 1rem; margin-top: 0; margin-bottom: 1rem; text-align: center;">Luas Lahan</h3>
                  <div class="bar-chart">
                    <span style="height: 72%"></span>
                    <span style="height: 48%"></span>
                    <span style="height: 60%"></span>
                  </div>
                  <div style="display: flex; justify-content: center; gap: 1rem; font-size: 0.75rem; margin-top: 0.75rem; color: #6b7280;">
                    <span>• L001</span>
                    <span>• L002</span>
                    <span>• L003</span>
                  </div>
                </div>
                <div class="detail-chart-card" style="border: 1.5px solid #e0e4d6; border-radius: 0.75rem; padding: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <h3 style="font-weight: 700; color: #111827; font-size: 1rem; margin-top: 0; margin-bottom: 1rem; text-align: center; width: 100%;">Jumlah Produksi Buah</h3>
                  <div class="pie-mockup">
                    <div class="pie-center">
                      <strong>Alpukat</strong>
                      <span>50%</span>
                    </div>
                  </div>
                  <div style="display: flex; justify-content: center; gap: 1rem; font-size: 0.75rem; margin-top: 0.75rem; color: #6b7280;">
                    <span>• Alpukat</span>
                    <span>• Kelengkeng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
