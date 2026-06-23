import { defineComponent, ref, Fragment } from 'vue';
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

      // Construct redirect URL
      const port = targetService === 'ternak' ? 3001 : 3002;
      const path = (targetRole === 'Admin' || targetRole === 'Owner' || targetRole === 'Pemilik') ? 'admin' : (targetService === 'ternak' ? 'ternak' : 'kebun');
      
      // Save locally in SSO first
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      
      userSession.value = {
        code,
        name: userObj.username,
        role: targetRole,
      };

      window.location.href = `http://localhost:${port}/${path}?token=${token}&role=${targetRole}&username=${userObj.username}&code=${code}`;
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
          loading.value = false;
          return;
        }
      }

      const account = authenticateSso(user, pass);

      if (!account) {
        error.value = 'Nama pengguna atau kata sandi salah.';
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
                          src={showPassword.value ? '/icon/open-eye.png' : '/icon/hide-eye.png'}
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
            <div class="role-selection-overlay-new">
              <div class="role-selection-container-new">
                
                {/* Header */}
                <div class="role-selection-header-new">
                  <h2>Pilih Peran &amp; Layanan</h2>
                  <p>
                    Selamat datang kembali, <strong>{displayName}</strong>.<br />
                    Silakan tentukan portal operasional yang ingin Anda kelola hari ini.
                  </p>
                  {errorRole.value && <div class="sso-login-error mt-3">{errorRole.value}</div>}
                </div>

                {/* Cards Grid */}
                <div class="role-selection-grid-new">
                  
                  {/* Peternakan Portal Card */}
                  <div class="portal-card">
                    <div class="portal-card__badge-row">
                      <span class="portal-badge portal-badge--ternak">
                        <img src="/icon/domba.png" alt="Paw Icon Placeholder" class="portal-badge__icon-img" />
                        <span class="portal-badge__text">MANAJEMEN TERNAK</span>
                      </span>
                    </div>

                    <h3 class="portal-card__title">{ternakTitle}</h3>
                    <p class="portal-card__desc">{ternakDesc}</p>

                    <button
                      type="button"
                      class="portal-card__btn portal-card__btn--ternak"
                      onClick={() => selectRole('ternak', ternakRole)}
                    >
                      Masuk Portal Peternakan &rarr;
                    </button>
                  </div>

                  {/* Perkebunan Portal Card */}
                  <div class="portal-card">
                    <div class="portal-card__badge-row">
                      <span class="portal-badge portal-badge--kebun">
                        <img src="/icon/lahan.png" alt="Plant Icon Placeholder" class="portal-badge__icon-img" />
                        <span class="portal-badge__text">MANAJEMEN LAHAN</span>
                      </span>
                    </div>

                    <h3 class="portal-card__title">{kebunTitle}</h3>
                    <p class="portal-card__desc">{kebunDesc}</p>

                    <button
                      type="button"
                      class="portal-card__btn portal-card__btn--kebun"
                      onClick={() => selectRole('kebun', kebunRole)}
                    >
                      Masuk Portal Perkebunan &rarr;
                    </button>
                  </div>

                </div>

                {/* Back Button */}
                <div class="role-selection-footer-new">
                  <button
                    type="button"
                    class="role-selection-back-btn-new"
                    onClick={() => {
                      showRoleSelection.value = false;
                      errorRole.value = '';
                    }}
                  >
                    <img src="/icon/logout.png" alt="Back Icon" class="role-selection-back-btn-new__icon" />
                    <span>Kembali ke Login</span>
                  </button>
                </div>

              </div>
            </div>
          )}
        </Fragment>
      );
    };
  },
});
