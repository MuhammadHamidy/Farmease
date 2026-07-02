import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import '@/modules/admin/assets/css/modules/AdminPage.css';
import { userSession, cageSession, globalAlertState } from '@/store/navigation';
import { pendingApprovalCount } from '@/store/operatorAdmin';
import Typography from '@/shared/ui/Typography';
import DasborPerkebunanView from './DasborPerkebunanView.tsx';
import RoutineScheduleView from './RoutineScheduleView.tsx';
import PencatatanApprovalView from './PencatatanApprovalView.tsx';
import LandManagementView from './LandManagementView.tsx';
import CropManagementView from './CropManagementView.tsx';
import PerkebunanConfirmModal from '../../kebun/components/shared/PerkebunanConfirmModal';
import CustomAlertModal from '../../../Farmease/src/modules/ternak/components/shared/CustomAlertModal';

export default defineComponent({
  name: 'AdminPage',
  setup() {
    const router = useRouter();
    const activeTab = ref<string>('dasbor_kebun');
    const isSidebarOpen = ref(false);

    const isLogoutConfirmOpen = ref(false);

    const handleLogout = () => {
      isLogoutConfirmOpen.value = true;
    };

    const confirmLogout = () => {
      isLogoutConfirmOpen.value = false;
      userSession.value = null;
      cageSession.value = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = 'http://localhost:3000/?logout=true';
    };

    return () => {
      const adminName = (() => {
        const rawName = userSession.value?.name || 'Admin Utama';
        if (rawName.toLowerCase() === 'admin') {
          return 'Admin Utama';
        }
        return rawName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      })();
      const avatarLetter = adminName.charAt(0).toUpperCase();

      return (
        <div class="admin-page">
          <div class="admin-layout-container">
            
            {/* ── Sidebar Navigation ── */}
            <aside class={['admin-sidebar', isSidebarOpen.value ? 'open' : '']}>
              {/* Logo Brand */}
              <div class="sidebar-brand">
                <img src="/icon/logo_farmease.png" alt="FARMease" class="sidebar-logo" />
                <h2 class="sidebar-title">Panel Admin</h2>
              </div>
              
              {/* Admin Profile */}
              <div class="sidebar-profile">
                <div class="avatar-circle">
                  {avatarLetter}
                </div>
                <div class="profile-info">
                  <span class="profile-name">{adminName}</span>
                  <span class="profile-role">{userSession.value?.role || 'Admin'}</span>
                </div>
              </div>

              <hr class="sidebar-divider" />

              {/* Navigation Menu */}
              <div class="sidebar-menu-wrapper">
                
                {/* Utama Category */}
                <div class="menu-category">
                  <span class="category-label">Utama</span>
                  <button 
                    type="button" 
                    class={['menu-item', activeTab.value === 'dasbor_kebun' ? 'active' : '']}
                    onClick={() => { activeTab.value = 'dasbor_kebun'; isSidebarOpen.value = false; }}
                  >
                    <img src="/icon/rumput.png" alt="Dasbor Perkebunan" class="menu-icon" />
                    <span>Dasbor Perkebunan</span>
                  </button>
                </div>

              

                {/* Perkebunan Category */}
                <div class="menu-category">
                  <span class="category-label">Perkebunan</span>
                  <button 
                    type="button" 
                    class={['menu-item', activeTab.value === 'lahan' ? 'active' : '']}
                    onClick={() => { activeTab.value = 'lahan'; isSidebarOpen.value = false; }}
                  >
                    <img src="/icon/lahan.png" alt="Lahan" class="menu-icon" />
                    <span>Manajemen Lahan</span>
                  </button>
                  <button 
                    type="button" 
                    class={['menu-item', activeTab.value === 'jadwal_kebun' ? 'active' : '']}
                    onClick={() => { activeTab.value = 'jadwal_kebun'; isSidebarOpen.value = false; }}
                  >
                    <img src="/icon/bibit.png" alt="Jadwal" class="menu-icon" />
                    <span>Jadwal Rutin Perkebunan</span>
                  </button>
                </div>

                {/* Sistem Category */}
                <div class="menu-category">
                  <span class="category-label">Sistem & Operator</span>
                  <button 
                    type="button" 
                    class={['menu-item', activeTab.value === 'persetujuan' ? 'active' : '']}
                    onClick={() => { activeTab.value = 'persetujuan'; isSidebarOpen.value = false; }}
                  >
                    <img src="/icon/file/outline-white-24.svg" alt="Approval" class="menu-icon" />
                    <span>Persetujuan Pencatatan</span>
                    {pendingApprovalCount.value > 0 && (
                      <span class="admin-tab-badge ms-auto" style={{ marginLeft: 'auto' }}>{pendingApprovalCount.value}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Sidebar Footer Logout */}
              <div class="sidebar-footer">
                <button type="button" class="sidebar-logout-btn" onClick={handleLogout}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Keluar Panel</span>
                </button>
              </div>
            </aside>

            {/* ── Mobile Hamburger Header ── */}
            <div class="mobile-header d-flex d-md-none justify-content-between align-items-center px-3">
              <button 
                type="button" 
                class="btn p-0 border-0 text-dark" 
                onClick={() => isSidebarOpen.value = !isSidebarOpen.value}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <Typography variant="span" weight="extrabold" size="text-sm" color="coffee-brown">FARMease Admin</Typography>
              <div style={{ width: '24px' }}></div>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen.value && (
              <div class="sidebar-overlay d-md-none" onClick={() => isSidebarOpen.value = false} />
            )}

            {/* ── Main Panel Content ── */}
            <div class="admin-main-content">
              <div class="admin-content-inner">
                {activeTab.value === 'dasbor_kebun' && <DasborPerkebunanView />}
                {activeTab.value === 'lahan' && <LandManagementView />}
                {activeTab.value === 'tanaman' && <CropManagementView />}
                {activeTab.value === 'jadwal_kebun' && <RoutineScheduleView type="perkebunan" />}
                {activeTab.value === 'persetujuan' && <PencatatanApprovalView />}
              </div>
            </div>

            <PerkebunanConfirmModal
              isOpen={isLogoutConfirmOpen.value}
              title="Konfirmasi Keluar"
              message="Apakah Anda yakin ingin keluar dari panel admin?"
              confirmLabel="Keluar"
              cancelLabel="Batal"
              onConfirm={confirmLogout}
              onCancel={() => isLogoutConfirmOpen.value = false}
            />

            <CustomAlertModal
              alert={globalAlertState.value}
              onClose={() => { globalAlertState.value.isOpen = false; }}
            />
          </div>
        </div>
      );
    };
  },
});
