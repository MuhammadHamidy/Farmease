import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import '@/modules/admin/assets/css/modules/AdminPage.css';
import { userSession, cageSession } from '@/store/navigation';
import { pendingApprovalCount } from '@/modules/ternak/store/operatorAdmin';
import Typography from '@/shared/ui/Typography';
import UserManagementView from './UserManagementView.tsx';
import ActivityLogView from './ActivityLogView.tsx';
import OperatorTaskManagementView from './OperatorTaskManagementView.tsx';
import RoutineScheduleView from './RoutineScheduleView.tsx';
import PencatatanApprovalView from './PencatatanApprovalView.tsx';
import CageManagementView from './CageManagementView.tsx';
import LandManagementView from './LandManagementView.tsx';
import CropManagementView from './CropManagementView.tsx';

export default defineComponent({
  name: 'AdminPage',
  setup() {
    const router = useRouter();
    const activeTab = ref<string>('kandang');
    const isSidebarOpen = ref(false);

    const handleLogout = () => {
      userSession.value = null;
      cageSession.value = null;
      router.push({ name: 'home' });
    };

    return () => {
      const adminName = userSession.value?.name || 'Administrator';
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
              
              {/* Peternakan Category */}
              <div class="menu-category">
                <span class="category-label">Peternakan</span>
                <button 
                  type="button" 
                  class={['menu-item', activeTab.value === 'kandang' ? 'active' : '']}
                  onClick={() => { activeTab.value = 'kandang'; isSidebarOpen.value = false; }}
                >
                  <img src="/icon/kandang.png" alt="Kandang" class="menu-icon" />
                  <span>Manajemen Kandang</span>
                </button>
                <button 
                  type="button" 
                  class={['menu-item', activeTab.value === 'tugas' ? 'active' : '']}
                  onClick={() => { activeTab.value = 'tugas'; isSidebarOpen.value = false; }}
                >
                  <img src="/icon/notification-active.png" alt="Tugas" class="menu-icon" style={{ filter: 'brightness(0) invert(1) sepia(1)' }} />
                  <span>Tugas Operator</span>
                </button>
                <button 
                  type="button" 
                  class={['menu-item', activeTab.value === 'jadwal' ? 'active' : '']}
                  onClick={() => { activeTab.value = 'jadwal'; isSidebarOpen.value = false; }}
                >
                  <img src="/icon/catat_pakan.png" alt="Jadwal" class="menu-icon" style={{ filter: 'brightness(0) invert(1)' }} />
                  <span>Jadwal Rutin</span>
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
                  <img src="/icon/rumput.png" alt="Lahan" class="menu-icon" />
                  <span>Manajemen Lahan</span>
                </button>
                <button 
                  type="button" 
                  class={['menu-item', activeTab.value === 'tanaman' ? 'active' : '']}
                  onClick={() => { activeTab.value = 'tanaman'; isSidebarOpen.value = false; }}
                >
                  <img src="/icon/domba.png" alt="Tanaman" class="menu-icon" style={{ filter: 'hue-rotate(90deg) brightness(1.5)' }} />
                  <span>Manajemen Tanaman</span>
                </button>
              </div>

              {/* Sistem Category */}
              <div class="menu-category">
                <span class="category-label">Sistem & Operator</span>
                <button 
                  type="button" 
                  class={['menu-item', activeTab.value === 'pengguna' ? 'active' : '']}
                  onClick={() => { activeTab.value = 'pengguna'; isSidebarOpen.value = false; }}
                >
                  <img src="/icon/dashboard.png" alt="User" class="menu-icon" style={{ filter: 'brightness(0) invert(1)' }} />
                  <span>Manajemen Pengguna</span>
                </button>
                <button 
                  type="button" 
                  class={['menu-item', activeTab.value === 'persetujuan' ? 'active' : '']}
                  onClick={() => { activeTab.value = 'persetujuan'; isSidebarOpen.value = false; }}
                >
                  <img src="/icon/security.png" alt="Approval" class="menu-icon" />
                  <span>Persetujuan Catatan</span>
                  {pendingApprovalCount.value > 0 && (
                    <span class="admin-tab-badge ms-auto" style={{ marginLeft: 'auto' }}>{pendingApprovalCount.value}</span>
                  )}
                </button>
                <button 
                  type="button" 
                  class={['menu-item', activeTab.value === 'laporan' ? 'active' : '']}
                  onClick={() => { activeTab.value = 'laporan'; isSidebarOpen.value = false; }}
                >
                  <img src="/icon/statistic.png" alt="Log" class="menu-icon" />
                  <span>Laporan Aktivitas</span>
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
              {activeTab.value === 'kandang' && <CageManagementView />}
              {activeTab.value === 'tugas' && <OperatorTaskManagementView />}
              {activeTab.value === 'jadwal' && <RoutineScheduleView />}
              {activeTab.value === 'lahan' && <LandManagementView />}
              {activeTab.value === 'tanaman' && <CropManagementView />}
              {activeTab.value === 'pengguna' && <UserManagementView />}
              {activeTab.value === 'persetujuan' && <PencatatanApprovalView />}
              {activeTab.value === 'laporan' && <ActivityLogView />}
            </div>
          </div>

        </div>
      </div>
    );
  };
},
});

