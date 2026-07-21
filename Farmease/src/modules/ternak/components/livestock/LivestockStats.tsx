import { defineComponent, type PropType } from 'vue';
import StatCard from '@/shared/ui/StatCard';

export interface CageStatsData {
  total: number;
  healthy: number;
  alert: number;
  cage: string;
}

export default defineComponent({
  name: 'LivestockStats',
  props: {
    stats: {
      type: Object as PropType<CageStatsData>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class="row g-3 mb-4">
        <div class="col-6 col-xl-3">
          <StatCard 
            label="Total Domba" 
            value={String(props.stats.total)} 
            color="primary" 
            icon={() => (
              <img src="/icon/domba.png" alt="Total Domba" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            )}
          />
        </div>
        <div class="col-6 col-xl-3">
          <StatCard 
            label="Sehat" 
            value={String(props.stats.healthy)} 
            color="light" 
            icon={() => (
              <img src="/icon/medical-shield.png" alt="Sehat" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            )}
          />
        </div>
        <div class="col-6 col-xl-3">
          <StatCard 
            label="Perlu Perhatian" 
            value={String(props.stats.alert)} 
            color="accent" 
            icon={() => (
              <img src="/icon/warning.png" alt="Perlu Perhatian" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            )}
          />
        </div>
        <div class="col-6 col-xl-3">
          <StatCard 
            label="Kandang Aktif" 
            value={String(props.stats.cage)} 
            color="light" 
            icon={() => (
              <img src="/icon/kandang.png" alt="Kandang Aktif" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            )}
          />
        </div>
      </div>
    );
  }
});
