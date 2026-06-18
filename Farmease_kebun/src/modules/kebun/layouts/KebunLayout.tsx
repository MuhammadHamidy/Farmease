import { defineComponent, onMounted, onUnmounted } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import '../assets/theme.css';
import '../assets/css/PerkebunanPage.css';
import { useInactivityTimer } from '@/shared/composables/useInactivityTimer';
import { userSession, landSession } from '@/store/navigation';

export default defineComponent({
  name: 'KebunLayout',
  setup() {
    const router = useRouter();

    const handleTimeout = () => {
      userSession.value = null;
      landSession.value = null;
      router.push('/');
    };

    const { showWarning, secondsLeft } = useInactivityTimer(
      15 * 60 * 1000,
      60 * 1000,
      handleTimeout,
    );

    onMounted(() => {
      document.body.classList.add('module-kebun');
      document.body.classList.remove('module-ternak');
    });
    onUnmounted(() => {
      document.body.classList.remove('module-kebun');
    });

    return () => (
      <div class="module-kebun min-h-screen">
        <RouterView />
        {showWarning.value && (
          <div
            style={{
              position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
              background: '#38431f', color: '#fff', borderRadius: '12px',
              padding: '1rem 1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              maxWidth: '320px', fontSize: '0.85rem', lineHeight: '1.5',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>⚠️ Sesi Akan Berakhir</div>
            <div>Anda tidak aktif. Akan otomatis logout dalam <strong>{secondsLeft.value}</strong> detik.</div>
          </div>
        )}
      </div>
    );
  },
});

