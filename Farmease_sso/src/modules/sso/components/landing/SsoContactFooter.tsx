import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SsoContactFooter',
  setup() {
    return () => (
      <footer class="sso-footer">
        <h2 class="sso-footer__title">Hubungi Kami</h2>
        <section class="sso-footer__content">
          <div class="sso-footer__container">
            <div class="sso-footer__intro">
              <h3 class="sso-footer__brand">Sah Hi Agro Farm</h3>
              <p class="sso-footer__subtitle">Informasi lebih lanjut</p>
            </div>

            <div class="sso-footer__grid">
              {/* Jadwal Operasional */}
              <div class="sso-footer__card">
                <h4 class="sso-footer__card-title">Jadwal Operasional</h4>
                <div class="sso-footer__info-group">
                  <div class="sso-footer__info-item">
                    <svg class="sso-footer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span class="sso-footer__text">
                      Senin – Sabtu
                      <br />
                      08.00 – 16.00
                    </span>
                  </div>
                  <div class="sso-footer__info-item">
                    <svg class="sso-footer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span class="sso-footer__text">Muara Jambi</span>
                  </div>
                </div>
              </div>

              {/* Kontak */}
              <div class="sso-footer__card">
                <h4 class="sso-footer__card-title">Kontak</h4>
                <div class="sso-footer__info-group">
                  <div class="sso-footer__info-item">
                    <svg class="sso-footer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span class="sso-footer__text">+6208xxxxxxxxxx</span>
                  </div>
                  <div class="sso-footer__info-item">
                    <svg class="sso-footer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span class="sso-footer__text">xxx@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* Media Sosial */}
              <div class="sso-footer__card">
                <h4 class="sso-footer__card-title">Media Sosial</h4>
                <div class="sso-footer__social-links">
                  <a
                    href="#"
                    class="sso-footer__social-link"
                    title="Instagram"
                    aria-label="Instagram"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    class="sso-footer__social-link"
                    title="Facebook"
                    aria-label="Facebook"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </footer>
    );
  },
});
