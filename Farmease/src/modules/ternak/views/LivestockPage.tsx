import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import '@/assets/css/modules/peternakan/PeternakanPage.css';
import { userSession, cageSession, cagesList, fetchCagesList, cagesLoading, selectedTernakId } from '@/store/navigation';
import Typography from '@/shared/ui/Typography';
import { useNotifications } from '@/shared/composables/useNotifications';
import DashboardView from './DashboardView';
import RecordView from './RecordView';
import HistoryView from './HistoryView';
import LivestockDetailView from './LivestockDetailView';
import CustomConfirmModal from '@/shared/ui/CustomConfirmModal';

const tabs = [
  { id: 'dasbor',      label: 'Dasbor' },
  { id: 'daftar',      label: 'Daftar Ternak' },
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

    const { notifications, unreadCount, fetchNotifications, markRead } = useNotifications();
    const isNotificationOpen = ref(false);
    const selectedNotification = ref<any>(null);

    const formatNotificationMessage = (msg: string) => {
      if (!msg) return '';
      return msg.replace(/\b([a-f0-9]{8})-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi, 'TSK-$1');
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-bell-container') && !target.closest('.notification-detail-modal')) {
        isNotificationOpen.value = false;
      }
    };

    onMounted(() => {
      loadCages();
      fetchNotifications();
      document.addEventListener('click', handleDocumentClick);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleDocumentClick);
    });

    const selectCage = (c: any) => {
      cageSession.value = {
        code: c.code,
        name: c.name,
        type: c.type
      };
    };

    const isLogoutConfirmOpen = ref(false);

    const goBackToLogin = () => {
      isLogoutConfirmOpen.value = true;
    };

    const confirmLogout = () => {
      isLogoutConfirmOpen.value = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      userSession.value = null;
      cageSession.value = null;
      const host = window.location.hostname;
      window.location.href = `http://${host}:3000/?logout=true`;
    };

    const getCageBadgeClass = (type: string) => {
      const t = type.toLowerCase();
      if (t === 'jantan') return 'bg-primary-subtle text-primary border border-primary-subtle';
      if (t === 'betina') return 'bg-danger-subtle text-danger border border-danger-subtle';
      return 'bg-warning-subtle text-warning border border-warning-subtle';
    };

    return () => {
      // If cageSession is active, render the normal view
      return (
        <div class="peternakan-page">
          {/* ── Dashboard Header (Clean Version) ────────────────── */}
          <header class="peternakan-header-v2">
            <div class="header-left-group">
              <div 
                class="peternakan-logo-container" 
                onClick={goBackToLogin} 
                style={{ cursor: 'pointer' }}
              >
                <img src="/icon/logo_farmease.png" alt="FARMease" style={{ height: '44px', objectFit: 'contain' }} />
              </div>
              <div class="header-divider d-none d-sm-block"></div>
              <h1 class="peternakan-header-title d-none d-sm-block">Say Hi Agro Farm</h1>
            </div>

            <div class="header-right-group position-relative">
              {/* Notification Bell */}
              <div class="notification-bell-container">
                <button
                  class="header-logout-btn position-relative"
                  onClick={() => { isNotificationOpen.value = !isNotificationOpen.value; }}
                  title="Notifikasi"
                  style={{ background: isNotificationOpen.value ? '#f3ede4' : 'white' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {unreadCount.value > 0 && <span class="notification-badge"></span>}
                </button>

                {isNotificationOpen.value && (
                  <div class="notification-panel text-start shadow-lg" style={{ right: 0, top: '48px', width: '320px' }} onClick={(e) => e.stopPropagation()}>
                    <div class="notification-header d-flex justify-content-between align-items-center p-3 border-bottom">
                      <span class="fw-bold" style={{ fontSize: '0.85rem' }}>Notifikasi</span>
                      {unreadCount.value > 0 && (
                        <span class="badge bg-danger rounded-pill" style={{ fontSize: '0.7rem' }}>{unreadCount.value} Baru</span>
                      )}
                    </div>
                    <div class="notification-list" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                      {notifications.value.length === 0 ? (
                        <div class="p-4 text-center text-secondary small">Tidak ada notifikasi baru</div>
                      ) : (
                        notifications.value.map((item) => (
                          <div
                            key={item.id}
                            class={['notification-item p-3 border-bottom d-flex gap-2 align-items-start', !item.is_read ? 'unread' : '']}
                            style={{ cursor: 'pointer', background: !item.is_read ? '#eff6ff' : 'transparent' }}
                            onClick={() => {
                              markRead(item.id);
                              selectedNotification.value = item;
                              isNotificationOpen.value = false;
                            }}
                          >
                            <div class="notification-item-icon rounded-circle d-flex align-items-center justify-content-center bg-light" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                              <span style={{ fontSize: '0.9rem' }}>🔔</span>
                            </div>
                            <div class="grow" style={{ minWidth: 0 }}>
                              <div class="fw-bold text-dark text-truncate" style={{ fontSize: '0.8rem' }}>{item.title}</div>
                              <div class="text-secondary small mt-0.5" style={{ fontSize: '0.72rem', lineHeight: '1.3' }}>{formatNotificationMessage(item.message)}</div>
                              <div class="text-muted" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                                {new Date(item.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button 
                class="header-logout-btn" 
                onClick={goBackToLogin}
                title="Keluar / Logout"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </header>

          <nav class="peternakan-nav-container">
            <div class="peternakan-tab-pills">
              <router-link to={{ name: 'ternak-dasbor' }} class="peternakan-tab-pill" activeClass="active">
                Dasbor
              </router-link>
              <router-link to={{ name: 'ternak-daftar' }} class="peternakan-tab-pill" activeClass="active">
                Daftar Ternak
              </router-link>
              <router-link to={{ name: 'ternak-pencatatan' }} class="peternakan-tab-pill" activeClass="active">
                Pencatatan
              </router-link>
              <router-link to={{ name: 'ternak-riwayat' }} class="peternakan-tab-pill" activeClass="active">
                Riwayat
              </router-link>
              <router-link to={{ name: 'ternak-gudang' }} class="peternakan-tab-pill" activeClass="active">
                Gudang
              </router-link>
            </div>
          </nav>

          <div class="peternakan-content">
            <router-view />
          </div>

          {/* Notification Detail Modal */}
          {selectedNotification.value && (
            <div class="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}></div>
          )}
          {selectedNotification.value && (
            <div class="modal fade show d-block" style={{ zIndex: 1055 }} onClick={() => selectedNotification.value = null}>
              <div class="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div class="modal-content rounded-5 border-0 shadow-lg" style={{ backgroundColor: '#FCFAF7' }}>
                  <div class="modal-header border-bottom-0 pb-0">
                    <h5 class="modal-title fw-extrabold text-on-surface" style={{ color: '#3d2f24' }}>Detail Notifikasi</h5>
                    <button type="button" class="btn-close" onClick={() => selectedNotification.value = null}></button>
                  </div>
                  <div class="modal-body py-4">
                    <div class="d-flex align-items-start gap-3 mb-3">
                      <div class="notification-item-icon rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '48px', height: '48px', flexShrink: 0, backgroundColor: 'rgba(212, 196, 176, 0.25)', borderColor: '#3d2f24', color: '#3d2f24' }}>
                        <span style={{ fontSize: '1.4rem' }}>🔔</span>
                      </div>
                      <div>
                        <h4 class="fw-bold m-0 mb-1" style={{ fontSize: '1.1rem', color: '#3d2f24' }}>{selectedNotification.value.title}</h4>
                        <div class="text-muted small">
                          {new Date(selectedNotification.value.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>
                    <div class="p-3 rounded-4 text-dark border" style={{ lineHeight: '1.6', backgroundColor: '#FAF6F0', borderColor: '#E6D9CE' }}>
                      {formatNotificationMessage(selectedNotification.value.message)}
                    </div>
                  </div>
                  <div class="modal-footer border-top-0 pt-0">
                    <button type="button" class="btn rounded-pill px-4 py-2 fw-bold text-white shadow-sm border-0" style={{ backgroundColor: '#3d2f24' }} onClick={() => selectedNotification.value = null}>Tutup</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <CustomConfirmModal
            isOpen={isLogoutConfirmOpen.value}
            title="Konfirmasi Keluar"
            message="Apakah Anda yakin ingin keluar dari halaman peternakan?"
            confirmLabel="Keluar"
            cancelLabel="Batal"
            onConfirm={confirmLogout}
            onCancel={() => isLogoutConfirmOpen.value = false}
          />
        </div>
      );
    };
  }
});
