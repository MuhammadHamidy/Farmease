import { defineComponent, ref, Fragment, watch, onUnmounted, Teleport, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userSession } from '@/store/navigation';
import { authenticateSso } from '../../data/ssoAccounts';
import { authApi } from '@/shared/api';

export default defineComponent({
  name: 'SsoHeroLogin',
  setup() {
    const router = useRouter();
    const rememberMe = ref(localStorage.getItem('sso_remember_me') === 'true');
    const username = ref(rememberMe.value ? localStorage.getItem('sso_username') || '' : '');
    const password = ref(rememberMe.value ? localStorage.getItem('sso_password') || '' : '');
    const showPassword = ref(false);
    const error = ref('');
    const loading = ref(false);

    // Role selection states
    const showRoleSelection = ref(false);
    const loggedInInfo = ref<{ token: string; user: any } | null>(null);
    const errorRole = ref('');

    // Toast states
    const toastMessage = ref('');
    const toastType = ref<'success' | 'error'>('success');
    const showToast = ref(false);

    const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
      toastMessage.value = msg;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 4000);
    };

    onMounted(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('logout') === 'true' || params.get('logout') === 'success') {
        triggerToast('Logout berhasil! Silakan masuk kembali.', 'success');
        // Clean URL parameter
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    });

    watch(showRoleSelection, (val) => {
      if (val) {
        document.body.classList.add('sso-role-selection-active');
      } else {
        document.body.classList.remove('sso-role-selection-active');
      }
    });

    onUnmounted(() => {
      document.body.classList.remove('sso-role-selection-active');
    });

    const selectRole = (targetService: 'ternak' | 'kebun', targetRole: string) => {
      errorRole.value = '';
      if (!loggedInInfo.value) return;

      const userObj = loggedInInfo.value.user;
      const token = loggedInInfo.value.token;
      
      const roleId = String(userObj.role_id);
      const category = String(userObj.operator_category || '').toLowerCase();
      const usernameLower = String(userObj.username || '').toLowerCase();

      // Check authorization
      let allowed = false;
      
      // Admin role UUID can access everything
      if (roleId === '00000000-0000-0000-0000-000000000001' || usernameLower === 'admin') {
        allowed = true;
      }
      // Owner/Pemilik
      else if (roleId === '00000000-0000-0000-0000-000000000002' || roleId === '00000000-0000-0000-0000-000000000004' || usernameLower === 'pemilik' || category.includes('owner') || category.includes('pemilik') || category.includes('pemilik kebun') || category.includes('pemilik ternak')) {
        if (targetRole === 'Admin' || targetRole === 'Owner' || targetRole === 'Pemilik' || targetRole === 'Operator') {
          // If a specific category is set, e.g. Pemilik Ternak, restrict to that service
          if (category.includes('ternak') && targetService !== 'ternak') {
            allowed = false;
          } else if (category.includes('kebun') && targetService !== 'kebun') {
            allowed = false;
          } else {
            allowed = true;
          }
        }
      }
      // Operator
      else if (roleId === '00000000-0000-0000-0000-000000000003' || roleId === '00000000-0000-0000-0000-000000000004' || category.includes('operator') || usernameLower.includes('operator') || usernameLower.includes('kebun') || usernameLower.includes('peternak')) {
        if (targetService === 'ternak' && targetRole === 'Operator' && (roleId === '00000000-0000-0000-0000-000000000004' || category.includes('ternak') || usernameLower.includes('kandang') || usernameLower.includes('peternak') || usernameLower === 'operator')) {
          allowed = true;
        }
        if (targetService === 'kebun' && targetRole === 'Operator' && (roleId === '00000000-0000-0000-0000-000000000003' || category.includes('kebun') || usernameLower.includes('kebun'))) {
          allowed = true;
        }
      }

      if (!allowed) {
        errorRole.value = `Akun Anda tidak memiliki akses untuk peran ${targetRole} di portal ${targetService === 'ternak' ? 'Peternakan' : 'Perkebunan'}.`;
        return;
      }

      // Determine proper code mapping
      let code = userObj.username;
      if (targetRole === 'Admin') code = 'ADM-01';
      else if (targetRole === 'Owner') code = 'PEM-01';
      else if (targetRole === 'Operator') {
        code = targetService === 'ternak' ? 'OPT-01' : 'PK-01';
      }

      // Construct redirect URL dynamically (supports domain & IP)
      const host = window.location.hostname;
      const path = (targetRole === 'Admin' || targetRole === 'Owner' || targetRole === 'Pemilik') ? 'admin' : (targetService === 'ternak' ? 'ternak' : 'kebun');
      
      let redirectUrl = '';
      if (host.includes('netrash.id')) {
        const subHost = targetService === 'ternak' ? 'farmease-ternak.netrash.id' : 'farmease-kebun.netrash.id';
        const protocol = window.location.protocol;
        redirectUrl = `${protocol}//${subHost}/${path}?token=${token}&role=${targetRole}&username=${userObj.username}&code=${code}`;
      } else {
        const port = targetService === 'ternak' ? 3001 : 3002;
        redirectUrl = `http://${host}:${port}/${path}?token=${token}&role=${targetRole}&username=${userObj.username}&code=${code}`;
      }
      
      // Save locally in SSO first (sessionStorage so closing tab requires re-login)
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('user', JSON.stringify(userObj));
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      userSession.value = {
        code,
        name: userObj.username,
        role: targetRole,
      };

      triggerToast('Login berhasil! Mengalihkan ke sistem...', 'success');
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
    };

    const saveRememberMe = (user: string, pass: string) => {
      if (rememberMe.value) {
        localStorage.setItem('sso_remember_me', 'true');
        localStorage.setItem('sso_username', user);
        localStorage.setItem('sso_password', pass);
      } else {
        localStorage.removeItem('sso_remember_me');
        localStorage.removeItem('sso_username');
        localStorage.removeItem('sso_password');
      }
    };

    const handleLogin = async () => {
      error.value = '';
      const user = username.value.trim();
      const pass = password.value;

      if (!user || !pass) {
        error.value = 'Masukkan nama pengguna dan kata sandi.';
        return;
      }

      loading.value = true;
      
      try {
        const response = await authApi.login({ username: user, password: pass } as any);
        if (response && response.token) {
          saveRememberMe(user, pass);
          authApi.setAuth(response.token, response.user);
          loggedInInfo.value = {
            token: response.token,
            user: response.user,
          };

          // Auto-redirect operator
          const userObj = response.user;
          const roleId = String(userObj.role_id);
          const category = String(userObj.operator_category || '').toLowerCase();
          const usernameLower = String(userObj.username || '').toLowerCase();
          
          if (roleId === '00000000-0000-0000-0000-000000000003' || roleId === '00000000-0000-0000-0000-000000000004' || category.includes('operator') || usernameLower.includes('operator') || usernameLower.includes('kebun') || usernameLower.includes('peternak')) {
            if (roleId === '00000000-0000-0000-0000-000000000004' || category.includes('ternak') || usernameLower.includes('kandang') || usernameLower.includes('peternak') || usernameLower === 'operator') {
              selectRole('ternak', 'Operator');
              return;
            } else if (roleId === '00000000-0000-0000-0000-000000000003' || category.includes('kebun') || usernameLower.includes('kebun')) {
              selectRole('kebun', 'Operator');
              return;
            }
          }

          showRoleSelection.value = true;
          loading.value = false;
          return;
        }
      } catch (err: any) {
        console.warn('Backend login failed:', err);
        // If the server is offline (no response received or network error)
        if (!err.response || err.code === 'ERR_NETWORK') {
          error.value = 'Koneksi ke server gagal. Pastikan backend aktif.';
          triggerToast('Koneksi ke server gagal. Pastikan backend aktif.', 'error');
          loading.value = false;
          return;
        }
      }

      const account = authenticateSso(user, pass);

      if (!account) {
        error.value = 'Nama pengguna atau kata sandi salah.';
        triggerToast('Login gagal! Nama pengguna atau kata sandi salah.', 'error');
        loading.value = false;
        return;
      }

      // Save a mock token and details for development
      const mockUser = {
        username: account.username,
        role_id: account.session.role === 'Admin' ? '00000000-0000-0000-0000-000000000001' : 
                 account.session.role === 'Owner' ? '00000000-0000-0000-0000-000000000002' : 
                 (account.username.toLowerCase().includes('kebun') ? '00000000-0000-0000-0000-000000000003' : '00000000-0000-0000-0000-000000000004'),
        operator_category: account.session.role,
        id: account.session.role === 'Admin' ? '11111111-1111-1111-1111-111111111101' : '11111111-1111-1111-1111-111111111103'
      };

      saveRememberMe(user, pass);
      loggedInInfo.value = {
        token: `mock-token-development:${mockUser.username}`,
        user: mockUser,
      };

      // Auto-redirect operator for mock accounts
      const roleId = String(mockUser.role_id);
      const category = String(mockUser.operator_category || '').toLowerCase();
      const usernameLower = String(mockUser.username || '').toLowerCase();
      
      if (roleId === '00000000-0000-0000-0000-000000000003' || roleId === '00000000-0000-0000-0000-000000000004' || category.includes('operator') || usernameLower.includes('operator') || usernameLower.includes('kebun') || usernameLower.includes('peternak')) {
        if (roleId === '00000000-0000-0000-0000-000000000004' || category.includes('ternak') || usernameLower.includes('kandang') || usernameLower.includes('peternak') || usernameLower === 'operator') {
          selectRole('ternak', 'Operator');
          return;
        } else if (roleId === '00000000-0000-0000-0000-000000000003' || category.includes('kebun') || usernameLower.includes('kebun')) {
          selectRole('kebun', 'Operator');
          return;
        }
      }

      showRoleSelection.value = true;
      loading.value = false;
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleLogin();
    };

    return () => {
      const userObj = loggedInInfo.value?.user;
      const roleId = userObj ? String(userObj.role_id) : '';
      const category = userObj ? String(userObj.operator_category || '').toLowerCase() : '';
      const usernameLower = userObj ? String(userObj.username || '').toLowerCase() : '';

      const isOwner = roleId === '00000000-0000-0000-0000-000000000002' || roleId === '00000000-0000-0000-0000-000000000004' || usernameLower === 'pemilik' || category.includes('owner') || category.includes('pemilik') || category.includes('pemilik kebun') || category.includes('pemilik ternak');
      const isAdmin = !isOwner && (roleId === '00000000-0000-0000-0000-000000000001' || usernameLower === 'admin' || usernameLower === 'admin2');
      const isOperator = roleId === '00000000-0000-0000-0000-000000000003' || roleId === '00000000-0000-0000-0000-000000000004' || category.includes('operator') || usernameLower.includes('operator') || usernameLower.includes('kebun') || usernameLower.includes('peternak');

      // Dynamic titles, descriptions, and roles for the two cards based on the authenticated user role
      let ternakTitle = 'Operator Peternakan';
      let ternakDesc = 'Mencatat pemberian pakan, kondisi kotoran, riwayat perkawinan, dan kelahiran domba baru.';
      let ternakRole = 'Operator';

      let kebunTitle = 'Operator Perkebunan';
      let kebunDesc = 'Mencatat aktivitas pemupukan, penyiraman, pembersihan gulma, pemangkasan, dan hasil panen.';
      let kebunRole = 'Operator';

      if (isAdmin) {
        ternakTitle = 'Admin Peternakan';
        ternakDesc = 'Kelola ekosistem kandang secara menyeluruh. Atur jadwal pakan, monitoring kesehatan, dan validasi laporan operasional harian.';
        ternakRole = 'Admin';

        kebunTitle = 'Admin Perkebunan';
        kebunDesc = 'Pantau aset lahan dan komoditas tanaman. Buat jadwal pemupukan, sistem irigasi, serta validasi pencatatan hasil panen periodik.';
        kebunRole = 'Admin';
      } else if (isOwner) {
        ternakTitle = 'Pemilik Peternakan';
        ternakDesc = 'Pantau laporan populasi, riwayat kesehatan domba, dan statistik data peternakan secara global.';
        ternakRole = 'Owner';

        kebunTitle = 'Pemilik Perkebunan';
        kebunDesc = 'Pantau total panen buah alpukat/kelengkeng, produktivitas lahan, dan laporan hasil perkebunan.';
        kebunRole = 'Owner';
      }

      const displayName = userObj
        ? (userObj.username.charAt(0).toUpperCase() + userObj.username.slice(1))
        : '';

      return (
        <Fragment>
          <section class="sso-hero">
            <div class="sso-hero__wrapper">
              <div class="sso-hero__split-card">
                
                {/* Left Side: Brand Pane */}
                <div class="sso-hero__brand-pane">
                  <h1 class="sso-hero__farm-title">Say Hi Agro Farm</h1>
                  <p class="sso-hero__strap-text">bersama</p>
                  <div class="sso-hero__brand-logo">
                    <img src="/icon/logo_farmease.png" alt="FARMease" />
                  </div>
                  <p class="sso-hero__brand-tagline">Kelola Peternakan &amp; Perkebunan</p>
                  <p class="sso-hero__brand-desc">
                    Sistem Informasi pencatatan harian, pemantauan, dan laporan terintegrasi.
                  </p>
                </div>

                {/* Right Side: Login Form Pane */}
                <div class="sso-hero__login-pane">
                  <h2>Silahkan Masuk</h2>
                  <p class="subtitle">Masukkan data yang sesuai</p>

                  <div class="sso-field">
                    <label for="sso-username">Masukkan Nama Pengguna</label>
                    <input
                      id="sso-username"
                      type="text"
                      autocomplete="username"
                      placeholder="Nama pengguna"
                      value={username.value}
                      onInput={(e) => {
                        username.value = (e.target as HTMLInputElement).value;
                        error.value = '';
                      }}
                      onKeydown={onKeydown}
                    />
                  </div>

                  <div class="sso-field">
                    <label for="sso-password">Masukkan Kata Sandi</label>
                    <div class="sso-password-input-wrapper">
                      <input
                        id="sso-password"
                        type={showPassword.value ? 'text' : 'password'}
                        autocomplete="current-password"
                        placeholder="Kata sandi"
                        value={password.value}
                        onInput={(e) => {
                          password.value = (e.target as HTMLInputElement).value;
                          error.value = '';
                        }}
                        onKeydown={onKeydown}
                      />
                      <button
                        type="button"
                        class="sso-toggle-password-btn"
                        onClick={() => {
                          showPassword.value = !showPassword.value;
                        }}
                      >
                        <img
                          src={showPassword.value ? '/icon/open/grey-20.svg' : '/icon/hide/grey-20.svg'}
                          alt={showPassword.value ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                        />
                      </button>
                    </div>
                  </div>

                  <div class="sso-remember-me">
                    <label class="sso-remember-me__label" for="sso-remember">
                      <input
                        id="sso-remember"
                        type="checkbox"
                        checked={rememberMe.value}
                        onChange={(e) => {
                          rememberMe.value = (e.target as HTMLInputElement).checked;
                        }}
                      />
                      <span>Ingatkan Sandi</span>
                    </label>
                  </div>

                  {error.value && <div class="sso-login-error">{error.value}</div>}

                  <button
                    type="button"
                    class="sso-btn-masuk"
                    disabled={loading.value}
                    onClick={handleLogin}
                  >
                    Masuk
                  </button>
                </div>

              </div>
            </div>
          </section>

          {showRoleSelection.value && (
            <div class="sso-role-selection-fullscreen">
              {/* Header */}
              <div class="sso-role-selection-header">
                <button
                  type="button"
                  class="sso-role-selection-back"
                  onClick={() => {
                    showRoleSelection.value = false;
                    errorRole.value = '';
                  }}
                >
                  &larr; Kembali
                </button>
                <img src="/icon/logo_farmease.png" alt="FARMease" />
              </div>

              {/* Band */}
              <div class="sso-role-selection-band">
                <h2>Selamat Datang</h2>
                <p>Silahkan pilih kategori yang ingin dikelola!</p>
              </div>

              {/* Error Message */}
              {errorRole.value && <div class="sso-login-error sso-role-error">{errorRole.value}</div>}

              {/* Cards Grid */}
              <div class="sso-role-selection-grid">
                
                {/* Peternakan Portal Card */}
                <button
                  type="button"
                  class="sso-role-card"
                  onClick={() => selectRole('ternak', ternakRole)}
                >
                  <div class="sso-role-card-icon">
                    <img src="/icon/domba.png" alt="Peternakan" />
                  </div>
                  <h3 class="sso-role-card-title">Kelola Peternakan</h3>
                  <p class="sso-role-card-desc">Masuk untuk memantau peternakan</p>
                </button>

                {/* Perkebunan Portal Card */}
                <button
                  type="button"
                  class="sso-role-card"
                  onClick={() => selectRole('kebun', kebunRole)}
                >
                  <div class="sso-role-card-icon">
                    <img src="/icon/lahan.png" alt="Perkebunan" />
                  </div>
                  <h3 class="sso-role-card-title">Kelola Perkebunan</h3>
                  <p class="sso-role-card-desc">Masuk untuk memantau perkebunan</p>
                </button>

              </div>
            </div>
          )}
          {showToast.value && (
            <Teleport to="body">
              <div 
                style={{ 
                  position: 'fixed', 
                  top: '24px', 
                  right: '24px', 
                  zIndex: 9999, 
                  backgroundColor: toastType.value === 'success' ? '#2e7d32' : '#d32f2f', 
                  color: 'white', 
                  padding: '16px 24px', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
                  fontWeight: 'bold', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' 
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{toastType.value === 'success' ? '✅' : '❌'}</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{toastType.value === 'success' ? 'Berhasil' : 'Gagal'}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.9 }}>{toastMessage.value}</div>
                </div>
              </div>
            </Teleport>
          )}
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </Fragment>
      );
    };
  },
});
