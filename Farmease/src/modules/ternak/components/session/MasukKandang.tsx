import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { cageSession, cagesList, fetchCagesList, cagesLoading } from '@/store/navigation'

export default defineComponent({
  name: 'MasukKandang',
  setup() {
    const router = useRouter()
    const error = ref('')

    const loadCages = async () => {
      error.value = ''
      try {
        await fetchCagesList()
      } catch (err: any) {
        error.value = 'Gagal memuat daftar kandang dari backend.'
      }
    }

    onMounted(loadCages)

    const selectCage = (c: any) => {
      cageSession.value = {
        code: c.code,
        name: c.name,
        type: c.type
      }
      router.push({ name: 'ternak' })
    }

    const goBack = () => {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      router.push({ name: 'home' })
    }

    const getCageBadgeClass = (type: string) => {
      const t = type.toLowerCase()
      if (t === 'jantan') return 'bg-primary-subtle text-primary border border-primary-subtle'
      if (t === 'betina') return 'bg-danger-subtle text-danger border border-danger-subtle'
      return 'bg-warning-subtle text-warning border border-warning-subtle'
    }

    return () => (
      <div class="masuk-kandang-wrapper min-vh-100 bg-light-cream d-flex align-items-center justify-content-center p-3 py-5" style={{
        background: 'linear-gradient(135deg, var(--color-surface-container-low) 0%, var(--color-surface-container-high) 100%)',
        fontFamily: 'var(--font-family)'
      }}>
        <style>{`
          .cage-select-card {
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid var(--color-outline-variant);
            background-color: #ffffff;
          }
          .cage-select-card:hover {
            transform: translateY(-4px);
            border-color: var(--color-primary);
            box-shadow: 0 12px 20px -8px rgba(96, 108, 56, 0.15);
            background-color: var(--color-primary-fixed-dim);
          }
          .cage-select-card:active {
            transform: translateY(-1px);
          }
          .pulse-loading {
            animation: pulse 1.5s infinite ease-in-out;
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}</style>

        <div class="login-centered-card shadow-2xl rounded-5 bg-white border border-outline-variant p-4 p-md-5 position-relative" style={{
          maxWidth: '780px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(21, 66, 18, 0.08)'
        }}>
          {/* Card Accent Top Line */}
          <div class="position-absolute top-0 start-0 w-100" style={{ height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '4px 4px 0 0' }}></div>

          {/* Title */}
          <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center mb-3">
              <img src="/icon/security.png" alt="Masuk Kandang" style={{ height: '48px', width: '48px', objectFit: 'contain' }} />
            </div>
            <h2 class="fw-extrabold text-on-surface mb-1" style={{ letterSpacing: '-0.02em', fontSize: '1.75rem', fontFamily: 'var(--font-outfit), sans-serif' }}>Pilih Kandang Kerja</h2>
            <p class="text-on-surface-variant small m-0">Silakan pilih salah satu kandang di bawah untuk mulai pencatatan harian</p>
          </div>

          <hr class="my-4 border-outline-variant" />

          {cagesLoading.value ? (
            /* Loading skeletons */
            <div class="row g-3 mb-4">
              {[1, 2, 3].map(n => (
                <div class="col-12 col-md-4" key={n}>
                  <div class="p-4 rounded-4 border pulse-loading bg-light text-center" style={{ height: '140px' }}>
                    <div class="bg-secondary opacity-25 rounded-circle mx-auto mb-3" style={{ width: '40px', height: '40px' }}></div>
                    <div class="bg-secondary opacity-25 rounded mx-auto mb-2" style={{ width: '60px', height: '15px' }}></div>
                    <div class="bg-secondary opacity-25 rounded mx-auto" style={{ width: '100px', height: '10px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error.value ? (
            /* Error display */
            <div class="text-center py-4 mb-4">
              <div class="alert alert-danger rounded-4 py-3 mb-3 border-0" style={{ backgroundColor: '#FDECEC', color: '#8B1E1E' }}>
                {error.value}
              </div>
              <button type="button" class="btn btn-primary rounded-pill px-4" onClick={loadCages}>Coba Lagi</button>
            </div>
          ) : cagesList.value.length === 0 ? (
            /* Empty state */
            <div class="text-center py-5 mb-4 rounded-4 border bg-light-cream">
              <img src="/icon/kandang.png" alt="" style={{ display: 'block', margin: '0 auto 1rem', width: '48px', opacity: 0.4 }} />
              <p class="fw-bold text-secondary mb-3">Tidak ada data kandang yang ditemukan di backend</p>
              <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-4" onClick={loadCages}>Segarkan Data</button>
            </div>
          ) : (
            /* Interactive Cage Cards Grid */
            <div class="row g-3 mb-5">
              {cagesList.value.map(c => (
                <div class="col-12 col-md-4" key={c.code}>
                  <div 
                    class="cage-select-card p-4 rounded-4 text-center d-flex flex-column align-items-center h-100 position-relative"
                    onClick={() => selectCage(c)}
                  >
                    <div class="mb-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-primary-fixed)' }}>
                      <img src="/icon/kandang.png" alt="Kandang" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                    </div>
                    
                    <h3 class="fw-extrabold text-on-surface m-0 mb-1" style={{ fontSize: '1.25rem' }}>{c.code}</h3>
                    <p class="text-secondary small fw-bold m-0 mb-2">{c.name}</p>
                    
                    <span class={['badge rounded-pill px-2.5 py-1 text-uppercase mb-2', getCageBadgeClass(c.type)]} style={{ fontSize: '0.65rem' }}>
                      {c.type}
                    </span>
                    
                    <div class="text-muted small mt-auto" style={{ fontSize: '0.75rem' }}>
                      Kapasitas: <strong class="text-on-surface">{c.capacity} Ekor</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cancel/Logout Link */}
          <div class="text-center">
            <button 
              type="button" 
              class="btn py-2 px-4 rounded-pill fw-bold text-secondary bg-light border hover-bg-light-cream transition-all"
              style={{ fontFamily: 'var(--font-outfit), sans-serif', fontSize: '0.85rem' }}
              onClick={goBack}
            >
              ← Kembali ke Login (Keluar)
            </button>
          </div>
        </div>
      </div>
    )
  }
})
