import { defineComponent } from 'vue';
import { peternakanItems } from '../../data/ssoContent';

export default defineComponent({
  name: 'SsoPeternakanSection',
  setup() {
    return () => (
      <>
        <h2 class="sso-band">Mengenal Peternakan</h2>
        <section class="sso-block">
          <div class="sso-container">
            <div class="sso-peternakan__list">
              {peternakanItems.map((item) => (
                <article key={item.title} class="sso-livestock-card">
                  <div class="sso-livestock-card__body">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div class="sso-livestock-card__media">
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0.4';
                      }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
});
