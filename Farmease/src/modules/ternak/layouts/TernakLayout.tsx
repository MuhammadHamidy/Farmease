import { defineComponent, onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';
import '../assets/theme.css';

export default defineComponent({
  name: 'TernakLayout',
  setup() {
    onMounted(() => {
      document.body.classList.add('module-ternak');
      document.body.classList.remove('module-kebun');
    });
    onUnmounted(() => {
      document.body.classList.remove('module-ternak');
    });

    return () => (
      <div class="module-ternak min-h-screen">
        <RouterView />
      </div>
    );
  },
});
