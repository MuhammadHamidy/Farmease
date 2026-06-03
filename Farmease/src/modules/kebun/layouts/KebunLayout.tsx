import { defineComponent, onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';
import '../assets/theme.css';
import '../assets/css/PerkebunanPage.css';

export default defineComponent({
  name: 'KebunLayout',
  setup() {
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
      </div>
    );
  },
});
