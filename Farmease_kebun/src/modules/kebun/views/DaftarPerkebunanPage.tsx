import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css'
import { pohonApi } from '@/shared/api'
import PerkebunanBackButton from '../components/shared/PerkebunanBackButton'
import { landSession, userSession, cropsList, fetchCropsList } from '@/store/navigation'
import PerkebunanFormSelect from '@/modules/kebun/components/shared/PerkebunanFormSelect'

export default defineComponent({
  name: 'DaftarPerkebunanPage',
  setup() {
    const router = useRouter()
    const query = ref('')
    const selectedPhase = ref('Semua Fase')
    const selectedStatus = ref('Semua Status')
    const activeTreeDetail = ref<any | null>(null)
    const isModalOpen = ref(false)

    onMounted(async () => {
      await fetchCropsList()
    })

    const activeLandCode = computed(() => landSession.value?.code || 'L001')
    const activeLandName = computed(() => landSession.value?.name || 'Lahan Alpukat')
    const isAlpukat = computed(() => activeLandName.value.toLowerCase().includes('alpukat'))

    const operatorName = computed(() => userSession.value?.name || 'Operator Kebun')
    const operatorCode = computed(() => userSession.value?.code || 'PK001')

    // Filter crops matching this land
    const landCrops = computed(() => {
      return cropsList.value.filter(c => c.land === activeLandCode.value)
    })

    // Filter by query search, phase dropdown and status dropdown
    const filteredCrops = computed(() => {
      const q = query.value.trim().toLowerCase()
      const phase = selectedPhase.value
      const status = selectedStatus.value

      return landCrops.value.filter(item => {
        const matchesQuery = !q || [item.name, item.code, item.type].some(field => field.toLowerCase().includes(q))
        const matchesPhase = phase === 'Semua Fase' || item.type.toLowerCase() === phase.toLowerCase()
        const matchesStatus = status === 'Semua Status' || (item.status_pohon || 'aktif').toLowerCase() === status.toLowerCase()
        return matchesQuery && matchesPhase && matchesStatus
      })
    })

    const openTreeDetail = (tree: any) => {
      router.push({ name: 'kebun-detail-pohon', params: { code: tree.code } })
    }

    return () => (
      <div class="detail-page" style="background: #ffffff; min-height: 100vh; font-family: 'Outfit', sans-serif; padding: 1.5rem; box-sizing: border-box; width: 100%;">
        <div class="detail-shell" style="max-width: 1200px; margin: 0 auto; width: 100%;">
          
          {/* Topbar Back button */}
          <header class="detail-topbar" style="display: flex; align-items: center; margin-bottom: 1.5rem;">
            <button
              onClick={() => router.push({ name: 'kebun' })}
              style="
                background: #38431f;
                color: #ffffff;
                border: none;
                border-radius: 0.45rem;
                padding: 0.45rem 1rem;
                font-weight: 700;
                font-size: 0.85rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.35rem;
              "
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Kembali
            </button>
          </header>

          {/* Green Title Header Banner */}
          <div
            style="
              background: #38431f;
              color: #ffffff;
              border-radius: 0.75rem;
              padding: 1.5rem;
              display: flex;
              flex-direction: column;
              gap: 1.25rem;
              margin-bottom: 1.5rem;
            "
          >
            <h2 style="margin: 0; font-size: 1.55rem; font-weight: 800; letter-spacing: -0.01em; text-align: center;">
              Informasi Perkebunan
            </h2>

            {/* Sub-cards Row */}
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
              {/* Card 1: Active Land */}
              <div
                style="
                  background: #ffffff;
                  border-radius: 0.65rem;
                  padding: 1rem;
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;
                  color: #111827;
                "
              >
                <div style="width: 2.5rem; height: 2.5rem; background: #f4f5f0; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img
                    src={isAlpukat.value ? '/icon/alpukat.png' : '/icon/kelengkeng.png'}
                    alt="Land Icon"
                    style="width: 1.75rem; height: 1.75rem; object-fit: contain;"
                  />
                </div>
                <div>
                  <strong style="font-size: 0.95rem; color: #111827; display: block; font-weight: 800;">
                    {activeLandName.value}
                  </strong>
                  <span style="font-size: 0.75rem; color: #6b7280; font-weight: 600;">
                    ID Lahan: {activeLandCode.value}
                  </span>
                </div>
              </div>

              {/* Card 2: Operator Info */}
              <div
                style="
                  background: #ffffff;
                  border-radius: 0.65rem;
                  padding: 1rem;
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;
                  color: #111827;
                "
              >
                <div style="width: 2.5rem; height: 2.5rem; background: #f4f5f0; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img
                    src="/icon/operator.png"
                    alt="Operator"
                    style="width: 1.75rem; height: 1.75rem; object-fit: contain;"
                  />
                </div>
                <div>
                  <strong style="font-size: 0.95rem; color: #111827; display: block; font-weight: 800;">
                    {operatorName.value}
                  </strong>
                  <span style="font-size: 0.75rem; color: #6b7280; font-weight: 600;">
                    ID Pengguna: {operatorCode.value}
                  </span>
                </div>
              </div>
            </div>
          </div>

           {/* Search Box & Dropdown */}
           <div style="display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center; flex-wrap: wrap;">
             <div style="position: relative; flex: 1; display: flex; align-items: center; min-width: 240px;">
               <svg
                 width="16"
                 height="16"
                 viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2.5"
                 style="position: absolute; left: 1rem; color: #9ca3af; pointer-events: none;"
               >
                 <circle cx="11" cy="11" r="8"></circle>
                 <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
               </svg>
               <input
                 type="text"
                 placeholder="Cari pohon"
                 value={query.value}
                 onInput={(e) => { query.value = (e.target as HTMLInputElement).value }}
                 style="
                   width: 100%;
                   height: 42px;
                   border: 1px solid #e5e7eb;
                   border-radius: 999px;
                   padding: 0 1rem 0 2.75rem;
                   outline: none;
                   font-size: 0.9rem;
                   font-weight: 600;
                   color: #374151;
                   box-sizing: border-box;
                 "
               />
             </div>
             
             <PerkebunanFormSelect
                modelValue={selectedPhase.value}
                onUpdate:modelValue={(val: string) => selectedPhase.value = val}
                options={[
                  { value: 'Semua Fase', label: 'Semua Fase' },
                  { value: 'Vegetatif', label: 'Vegetatif' },
                  { value: 'Generatif', label: 'Generatif' },
                ]}
                style="max-width: 180px;"
              />

              <PerkebunanFormSelect
                modelValue={selectedStatus.value}
                onUpdate:modelValue={(val: string) => selectedStatus.value = val}
                options={[
                  { value: 'Semua Status', label: 'Semua Status' },
                  { value: 'Aktif', label: 'Aktif' },
                  { value: 'Tidak Aktif', label: 'Tidak Aktif' },
                ]}
                style="max-width: 180px;"
              />
          </div>

          {/* Heading */}
          <h3 style="font-size: 1.2rem; font-weight: 800; color: #111827; margin: 0 0 1rem 0;">
            Daftar Pohon
          </h3>

          {/* Grid List Cards */}
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
            {filteredCrops.value.map((item) => {
              const isGen = (item.type || '').toLowerCase() === 'generatif'
              return (
                <div
                  key={item.code}
                  style="
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.75rem;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.85rem;
                    box-sizing: border-box;
                  "
                >
                  {/* Card Top: Date & Phase Badges */}
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    {/* Status Pohon */}
                    <span
                      style={`
                        font-size: 0.7rem;
                        font-weight: 800;
                        text-transform: capitalize;
                        color: ${(item.status_pohon || 'aktif').toLowerCase() === 'aktif' ? '#000000' : '#ef4444'};
                      `}
                    >
                      {(item.status_pohon || 'aktif')}
                    </span>
                    {/* Phase */}
                    <span
                      style={`
                        font-size: 0.7rem;
                        font-weight: 800;
                        padding: 0.25rem 0.65rem;
                        border-radius: 6px;
                        ${
                          (item.type || '').toLowerCase() === 'generatif'
                            ? 'background: #fde8e8; color: #e11d48;'
                            : (item.type || '').toLowerCase() === 'vegetatif'
                            ? 'background: #7a8857; color: #ffffff;'
                            : 'background: #f3f4f6; color: #4b5563;'
                        }
                      `}
                    >
                      {item.type}
                    </span>
                  </div>

                  {/* Divider line */}
                  <div style="height: 1px; background: #e5e7eb;"></div>

                  {/* Card Middle: Icon, Title & Code, Button */}
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <div style="width: 2.5rem; height: 2.5rem; background: #f4f5f0; border-radius: 0.4rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <img
                          src={isAlpukat.value ? '/icon/alpukat.png' : '/icon/kelengkeng.png'}
                          alt="Tree"
                          style="width: 1.75rem; height: 1.75rem; object-fit: contain;"
                        />
                      </div>
                      <div>
                        <strong style="font-size: 0.9rem; color: #111827; font-weight: 800; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">
                          {item.name}
                        </strong>
                        <span style="font-size: 0.75rem; color: #6b7280; font-weight: 700; display: block; margin-top: 2px;">
                          {item.code}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openTreeDetail(item)}
                      style="
                        background: #2e3b1f;
                        color: #ffffff;
                        border: none;
                        border-radius: 0.45rem;
                        padding: 0.45rem 0.75rem;
                        font-weight: 700;
                        font-size: 0.75rem;
                        cursor: pointer;
                        white-space: nowrap;
                      "
                    >
                      Lihat Pohon
                    </button>
                  </div>
                </div>
              )
            })}
          </div>



        </div>
      </div>
    )
  }
})
