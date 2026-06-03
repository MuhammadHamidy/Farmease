import { defineComponent } from 'vue';
import { keunggulanItems } from '../../data/ssoContent';

export default defineComponent({
  name: 'SsoKeunggulanSection',
  setup() {
    return () => (
      <>
        <h2 class="sso-band">Keunggulan</h2>
        <section class="sso-block">
          <div class="sso-container">
            <div class="sso-keunggulan__grid">
              {keunggulanItems.map((item) => (
                <article key={item.title} class="sso-feature-card">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
});
