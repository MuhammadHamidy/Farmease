import { defineComponent, onMounted, onUnmounted } from 'vue';
import '../assets/css/SsoLanding.css';
import SsoHeroLogin from '../components/landing/SsoHeroLogin';
import SsoKeunggulanSection from '../components/landing/SsoKeunggulanSection';
import SsoPeternakanSection from '../components/landing/SsoPeternakanSection';
import SsoPerkebunanSection from '../components/landing/SsoPerkebunanSection';
import SsoContactFooter from '../components/landing/SsoContactFooter';

export default defineComponent({
  name: 'SsoLandingPage',
  setup() {
    onMounted(() => {
      document.body.classList.add('module-sso');
      document.body.classList.remove('module-kebun', 'module-ternak');
    });
    onUnmounted(() => {
      document.body.classList.remove('module-sso');
    });

    return () => (
      <div class="sso-landing">
        <SsoHeroLogin />
        <SsoKeunggulanSection />
        <SsoPeternakanSection />
        <SsoPerkebunanSection />
        <SsoContactFooter />
      </div>
    );
  },
});
