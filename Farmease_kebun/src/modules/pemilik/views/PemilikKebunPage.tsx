import { defineComponent, ref } from 'vue';
import '@/modules/admin/assets/css/modules/AdminPage.css';
import { userSession } from '@/store/navigation';
import { authApi } from '@/shared/api';
import DasborPemilikPerkebunanView from '@/modules/admin/views/DasborPemilikPerkebunanView.tsx';

export default defineComponent({
  name: 'PemilikKebunPage',
  setup() {
    const isSidebarOpen = ref(false);

    const handleLogout = () => {
      userSession.value = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = 'http://localhost:3000/';
    };

    return () => {
      const pemilikName = userSession.value?.name || 'Pemilik';
      const pemilikCode = userSession.value?.code || '';
      const avatarLetter = pemilikName.charAt(0).toUpperCase();

      return (
        <div class="admin-page">
          <div class="admin-layout-container">

            {/* ── Sidebar ── */}
            <aside class={['admin-sidebar', isSidebarOpen.value ? 'open' : '']}>
              {/* Logo Brand */}
              <div class="sidebar-brand">
                <img src="/icon/logo_farmease.png" alt="FARMease" class="sidebar-logo" />
                <h2 class="sidebar-title">Panel Pemilik</h2>
              </div>

              {/* Profile */}
              <div class="sidebar-profile">
                <div class="avatar-circle">{avatarLetter}</div>
                <div class="profile-info">
                  <span class="profile-name">{pemilikName}</span>
                  <span class="profile-role">Pemilik Kebun</span>
                </div>
              </div>

              <hr class="sidebar-divider" />

              {/* Menu — Pemilik hanya satu menu */}
              <div class="sidebar-menu-wrapper">
                <div class="menu-category">
                  <span class="category-label">Utama</span>
                  <button
                    type="button"
                    class="menu-item active"
                    onClick={() => { isSidebarOpen.value = false; }}
                  >
                    <img src="/icon/statistic.png" alt="Dasbor" class="menu-icon" />
                    <span>Dasbor Perkebunan</span>
                  </button>
                </div>
              </div>

              {/* Footer Logout */}
              <div class="sidebar-footer">
                <button type="button" class="sidebar-logout-btn" onClick={handleLogout}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Keluar</span>
                </button>
              </div>
            </aside>

            {/* ── Mobile Header ── */}
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
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#30360E' }}>FARMease — Panel Pemilik</span>
              <div style={{ width: '24px' }}></div>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen.value && (
              <div class="sidebar-overlay d-md-none" onClick={() => isSidebarOpen.value = false} />
            )}

            {/* ── Main Content ── */}
            <div class="admin-main-content">
              <div class="admin-content-inner">
                <DasborPemilikPerkebunanView />
              </div>
            </div>

          </div>
        </div>
      );
    };
  },
});
