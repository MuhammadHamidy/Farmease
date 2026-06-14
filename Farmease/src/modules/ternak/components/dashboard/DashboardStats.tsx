import { defineComponent } from 'vue';
import StatCard from '@/shared/ui/StatCard';

export default defineComponent({
  name: 'DashboardStats',
  props: {
    totalAnimals: { type: Number, required: true },
    healthyAnimals: { type: Number, required: true },
    attentionAnimals: { type: Number, required: true },
    taskDone: { type: Number, required: true },
    totalTasks: { type: Number, required: true },
    tasksLoading: { type: Boolean, required: true },
  },
  setup(props) {
    return () => (
      <div class="row g-3 mb-4">
        <div class="col-6 col-xl-3">
          <StatCard
            label="Total Ternak"
            value={String(props.totalAnimals)}
            color="primary"
            icon={() => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )}
          />
        </div>
        <div class="col-6 col-xl-3">
          <StatCard
            label="Sehat"
            value={String(props.healthyAnimals)}
            color="light"
            icon={() => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 11 2 2 4-4" />
              </svg>
            )}
          />
        </div>
        <div class="col-6 col-xl-3">
          <StatCard
            label="Perlu Perhatian"
            value={String(props.attentionAnimals)}
            color="accent"
            icon={() => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          />
        </div>
        <div class="col-6 col-xl-3">
          <StatCard
            label="Tugas Selesai"
            value={props.tasksLoading ? '...' : `${props.taskDone}/${props.totalTasks}`}
            color="light"
            icon={() => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 11 3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            )}
          />
        </div>
      </div>
    );
  }
});
