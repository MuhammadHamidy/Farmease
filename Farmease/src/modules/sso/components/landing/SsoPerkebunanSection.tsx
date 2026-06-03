import { defineComponent } from 'vue';
import { getCropPlaceholderEmoji, perkebunanItems } from '../../data/ssoContent';

export default defineComponent({
  name: 'SsoPerkebunanSection',
  setup() {
    return () => (
      <>
        <h2 class="sso-band">Mengenal Perkebunan</h2>
        <section class="sso-block">
          <div class="sso-container">
            <div class="sso-perkebunan__grid">
              {perkebunanItems.map((item, idx) => (
                <article key={`${item.title}-${idx}`} class="sso-crop-card">
                  <div class="sso-crop-card__media">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span
                        class="sso-crop-card__placeholder"
                        role="img"
                        aria-label={item.title}
                      >
                        {getCropPlaceholderEmoji(item.placeholder)}
                      </span>
                    )}
                  </div>
                  <div class="sso-crop-card__body">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
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
