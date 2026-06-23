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
              <img src="/icon/domba.png" alt="Total Ternak" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            )}
          />
        </div>
        <div class="col-6 col-xl-3">
          <StatCard
            label="Sehat"
            value={String(props.healthyAnimals)}
            color="light"
            icon={() => (
              <img src="/icon/medical-shield.png" alt="Sehat" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            )}
          />
        </div>
        <div class="col-6 col-xl-3">
          <StatCard
            label="Perlu Perhatian"
            value={String(props.attentionAnimals)}
            color="accent"
            icon={() => (
              <img src="/icon/warning.png" alt="Perlu Perhatian" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            )}
          />
        </div>
        <div class="col-6 col-xl-3">
          <StatCard
            label="Tugas Selesai"
            value={props.tasksLoading ? '...' : `${props.taskDone}/${props.totalTasks}`}
            color="light"
            icon={() => (
              <img src="/icon/rutin_task.png" alt="Tugas Selesai" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            )}
          />
        </div>
      </div>
    );
  }
});
