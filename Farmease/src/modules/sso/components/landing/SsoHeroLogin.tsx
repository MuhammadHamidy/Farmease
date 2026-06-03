import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { userSession } from '@/store/navigation';
import { authenticateSso } from '../../data/ssoAccounts';
import { authApi } from '@/shared/api';

export default defineComponent({
  name: 'SsoHeroLogin',
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const error = ref('');
    const loading = ref(false);

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
          authApi.setAuth(response.token, response.user);
          userSession.value = {
            code: String(response.user.id),
            name: response.user.username,
            role: response.user.role_id === 1 ? 'Admin' : 'Operator Peternakan'
          };
          router.push({ name: response.user.role_id === 1 ? 'admin' : 'masuk-kandang' });
          loading.value = false;
          return;
        }
      } catch (err: any) {
        console.warn('Backend login failed, falling back to mock auth:', err);
      }

      const account = authenticateSso(user, pass);

      if (!account) {
        error.value = 'Nama pengguna atau kata sandi salah.';
        loading.value = false;
        return;
      }

      // Save a mock token in development so that BE API calls are authorized
      localStorage.setItem('authToken', 'mock-token-development');
      userSession.value = account.session;
      router.push({ name: account.routeName });
      loading.value = false;
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleLogin();
    };

    return () => (
      <section class="sso-hero">
        <div class="sso-hero__wrapper">
          <div class="sso-hero__split-card">
            
            {/* Left Side: Brand Pane */}
            <div class="sso-hero__brand-pane">
              <h1 class="sso-hero__farm-title">Sah Hi Agro Farm</h1>
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

              {error.value && <div class="sso-login-error">{error.value}</div>}

              <button
                type="button"
                class="sso-btn-masuk"
                disabled={loading.value}
                onClick={handleLogin}
              >
                Masuk
              </button>

              <p class="sso-login-hint">
                Demo: pemilik / pemilik123 · admin / admin123 · operator_kebun / kebun123 · operator_kandang / kandang123
              </p>
            </div>

          </div>
        </div>
        <div class="sso-hero__wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,60 C320,130 500,10 900,100 C1100,130 1300,70 1440,90 L1440,120 L0,120 Z"
              class="shape-fill"
            />
          </svg>
        </div>
      </section>
    );
  },
});
