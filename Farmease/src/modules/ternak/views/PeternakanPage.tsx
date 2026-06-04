import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import '@/modules/ternak/assets/css/modules/PeternakanPage.css';
import { userSession, cageSession, cagesList, fetchCagesList, cagesLoading, selectedTernakId } from '@/store/navigation';
import Typography from '@/shared/ui/Typography';
import DasborView from './DasborView';
import PencatatanView from './PencatatanView';
import PencatatanDetailView from './PencatatanDetailView';
import RiwayatView from './RiwayatView';
import TernakDetailView from './TernakDetailView';
import PencatatanFormView from './PencatatanFormView';

const tabs = [
  { id: 'dasbor',      label: 'Dasbor & Ternak' },
  { id: 'pencatatan',  label: 'Pencatatan' },
  { id: 'riwayat',     label: 'Riwayat' },
];

export default defineComponent({
  name: 'PeternakanPage',
  setup() {
    const router = useRouter();
    const activeTab = ref('dasbor');
    const error = ref('');

    const loadCages = async () => {
      error.value = '';
      try {
        await fetchCagesList();
      } catch (err: any) {
        error.value = 'Gagal memuat daftar kandang dari backend.';
      }
    };

    onMounted(() => {
      loadCages();
    });

    const selectCage = (c: any) => {
      cageSession.value = {
        code: c.code,
        name: c.name,
        type: c.type
      };
    };

    const goBackToLogin = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      userSession.value = null;
      cageSession.value = null;
      router.push({ name: 'home' });
    };

    const getCageBadgeClass = (type: string) => {
      const t = type.toLowerCase();
      if (t === 'jantan') return 'bg-primary-subtle text-primary border border-primary-subtle';
      if (t === 'betina') return 'bg-danger-subtle text-danger border border-danger-subtle';
      return 'bg-warning-subtle text-warning border border-warning-subtle';
    };

    return () => {
      // If cageSession is not set, render the Cage Selection screen inline
      if (!cageSession.value) {
        return (
          <div class="masuk-kandang-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3 py-5" style={{
            background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-container-high) 100%)',
            fontFamily: 'var(--font-sans)'
          }}>
            <div class="login-centered-card shadow-2xl rounded-5 bg-white border border-outline-variant p-4 p-md-5 position-relative" style={{
              maxWidth: '780px',
              width: '100%',
              boxShadow: '0 25px 50px -12px #3d2f2414'
            }}>
              {/* Card Accent Top Line */}
              <div class="position-absolute top-0 start-0 w-100" style={{ height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '4px 4px 0 0' }}></div>

              {/* Title */}
              <div class="text-center mb-4">
                <div class="d-inline-flex align-items-center justify-content-center mb-3">
                  <img src="/icon/security.png" alt="Masuk Kandang" style={{ height: '48px', width: '48px', objectFit: 'contain' }} />
                </div>
                <h2 class="fw-extrabold text-on-surface mb-1" style={{ letterSpacing: '-0.02em', fontSize: 'var(--font-size-3xl)', fontFamily: 'var(--font-outfit), sans-serif' }}>Pilih Kandang Kerja</h2>
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
                        
                        <h3 class="fw-extrabold text-on-surface m-0 mb-1" style={{ fontSize: 'var(--font-size-xl)' }}>{c.code}</h3>
                        <p class="text-secondary small fw-bold m-0 mb-2">{c.name}</p>
                        
                        <span class={['badge rounded-pill px-2.5 py-1 text-uppercase mb-2', getCageBadgeClass(c.type)]} style={{ fontSize: 'var(--font-size-xxs)' }}>
                          {c.type}
                        </span>
                        
                        <div class="text-muted small mt-auto" style={{ fontSize: 'var(--font-size-xs)' }}>
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
                  style={{ fontFamily: 'var(--font-outfit), sans-serif', fontSize: 'var(--font-size-sm)' }}
                  onClick={goBackToLogin}
                >
                  ← Kembali ke Login (Keluar)
                </button>
              </div>
            </div>
          </div>
        );
      }

      // If cageSession is active, render the normal view
      return (
        <div class="peternakan-page">
          {/* ── Dashboard Header (Clean Version) ────────────────── */}
          <header class="peternakan-header-v2">
            <div class="header-left-group">
              <div 
                class="peternakan-logo-container" 
                onClick={() => router.push({ name: 'home' })} 
                style={{ cursor: 'pointer' }}
              >
                <img src="/icon/logo_farmease.png" alt="FARMease" style={{ height: '44px', objectFit: 'contain' }} />
              </div>
              <div class="header-divider d-none d-sm-block"></div>
              <h1 class="peternakan-header-title d-none d-sm-block">Sah Hi Agro Farm</h1>
            </div>

            <div class="header-right-group">
              <button 
                class="header-logout-btn" 
                onClick={() => { userSession.value = null; cageSession.value = null; router.push({ name: 'home' }) }}
                title="Keluar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </header>

          {/* ── Pill Tab Navigation ──────────────────────── */}
          <nav class="peternakan-nav-container">
            <div class="peternakan-tab-pills">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  class={['peternakan-tab-pill', activeTab.value === tab.id ? 'active' : '']}
                  onClick={() => activeTab.value = tab.id}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          <div class="peternakan-content">
            {selectedTernakId.value ? (
              <TernakDetailView onGoToPencatatan={() => activeTab.value = 'pencatatan'} />
            ) : (
              <>
                {activeTab.value === 'dasbor'     && <DasborView onGoToPencatatan={() => activeTab.value = 'pencatatan'} />}
                {activeTab.value === 'pencatatan' && <PencatatanView />}
                {activeTab.value === 'riwayat'    && <RiwayatView />}
              </>
            )}
            <PencatatanFormView />
            <PencatatanDetailView />
          </div>
        </div>
      );
    };
  }
});
