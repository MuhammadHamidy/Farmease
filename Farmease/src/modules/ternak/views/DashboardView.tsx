import { defineComponent, ref, computed, onMounted, watch, type PropType } from 'vue';
import { useRouter } from 'vue-router';
import Typography from '@/shared/ui/Typography';
import { userSession, cageSession, cagesList, fetchCagesList, prefilledPencatatanType, prefilledPencatatanRincian, prefilledPencatatanTaskId } from '@/store/navigation';
import { sheep, fetchSheep, fetchWeightRecords } from '@/store/livestock';
import { fetchTasks, operatorTasks, tasksLoading, completeTask, mapApiTaskToLocal, fetchAccountsList } from '@/store/operatorAdmin';
import { pregnancyApi, tasksApi, cagesApi } from '@/shared/api';

// Components
import BirthAlerts, { type BirthAlert } from '../components/dashboard/BirthAlerts';
import DashboardStats from '../components/dashboard/DashboardStats';
import RoutineTasks from '../components/dashboard/RoutineTasks';
import WeightChart from '../components/dashboard/WeightChart';
import LivestockListWidget from '../components/dashboard/LivestockListWidget';
import TaskDetailModal from '../components/dashboard/TaskDetailModal';
import AddLivestockModal from '../components/shared/AddLivestockModal';

export default defineComponent({
  name: 'DasborView',
  props: {
    onGoToPencatatan: { type: Function as PropType<() => void>, default: null },
  },
  setup(props) {
    const router = useRouter();
    const selectedTaskId = ref<string | null>(null);
    const isAddModalOpen = ref(false);
    const isLoading = ref(false);
    
    const birthAlerts = ref<BirthAlert[]>([]);


    const activeCageCode = computed(() => cageSession.value?.code || '');

    const cageStats = ref<{ total_animals: number; healthy: number; attention_needed: number } | null>(null);
    const cageWeightStats = ref<{ current_average: number; growth_kg: number; growth_percentage: number; monthly_trend: any[] } | null>(null);

    const cageInfo = computed(() => {
      return cagesList.value.find(cageItem => cageItem.code === activeCageCode.value) || null;
    });

    watch(cageInfo, async (newCage) => {
      if (newCage?.id) {
        try {
          cageStats.value = await cagesApi.getStats(newCage.id);
          cageWeightStats.value = await cagesApi.getWeightStats(newCage.id);
        } catch (e) {
          console.error('Failed to fetch cage stats', e);
        }
      }
    }, { immediate: true });

    const fetchDashboardData = async () => {
      await fetchAccountsList();
      await fetchCagesList();
      await Promise.all([
        fetchSheep(),
        fetchWeightRecords(),
        fetchTasks(new Date().toISOString().split('T')[0]),
      ]);

      try {
        const pregnancies = await pregnancyApi.getList();
        birthAlerts.value = pregnancies
          .filter((p: any) => p.status === 'active' || p.status === 'confirmed')
          .map((p: any) => {
            const daysLeft = p.days_remaining || 0;
            const estBirth = new Date(p.expected_birth_date);
            const sheepData = sheep.value.find(s => String(s.id) === String(p.id_sheep));
            return {
              code: sheepData?.code || `#${p.id_sheep}`,
              daysLeft,
              estimatedDate: estBirth.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            };
          })
          .filter((a: any) => a.daysLeft >= 0 && a.daysLeft <= 14)
          .sort((a: any, b: any) => a.daysLeft - b.daysLeft);
      } catch (e) {
        // skip
      }


    };

    onMounted(fetchDashboardData);

    const cageInventory = computed(() =>
      sheep.value.filter(sheepItem => sheepItem.cage_code === activeCageCode.value),
    );

    const selectedTask = computed(() =>
      operatorTasks.value.find(task => task.id === selectedTaskId.value) || null,
    );

    const activeCageCapacity = computed(() => {
      const cage = cagesList.value.find(c => c.code === activeCageCode.value);
      return cage?.capacity || 0;
    });

    const chartData = computed(() => {
      const trend = cageWeightStats.value?.monthly_trend || [];
      return trend.map((t: any) => ({
        month: new Date(t.month).toLocaleDateString('id-ID', { month: 'short' }),
        weight: t.weight,
      }));
    });

    const points = computed(() => {
      const data = chartData.value;
      if (data.length === 0) return [];
      return data.map((d, i) => {
        const x = 45 + (i / Math.max(data.length - 1, 1)) * 435;
        const y = 180 - (d.weight / 50) * 140;
        return { x, y, label: d.month, value: d.weight };
      });
    });

    const linePath = computed(() => {
      const pts = points.value;
      if (pts.length === 0) return '';
      return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    });

    const areaPath = computed(() => {
      const pts = points.value;
      if (pts.length === 0) return '';
      const first = pts[0];
      const last = pts[pts.length - 1];
      if (!first || !last) return '';
      return `${linePath.value} L ${last.x} 180 L ${first.x} 180 Z`;
    });

    const averageWeightCurrent = computed(() => {
      return `${(cageWeightStats.value?.current_average || 0).toFixed(1)} kg`;
    });

    const weightGrowthString = computed(() => {
      const stats = cageWeightStats.value;
      if (!stats || !stats.monthly_trend || stats.monthly_trend.length < 2) return '+0 kg (0%)';
      const diff = stats.growth_kg || 0;
      const pct = stats.growth_percentage || 0;
      return `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg (${pct.toFixed(0)}%)`;
    });

    const totalAnimals = computed(() => cageStats.value?.total_animals || 0);
    const healthyAnimals = computed(() => cageStats.value?.healthy || 0);
    const attentionAnimals = computed(() => cageStats.value?.attention_needed || 0);
    const peternakanTasks = computed(() => {
      const activeCode = (activeCageCode.value || '').trim().toUpperCase();
      return operatorTasks.value.filter(t => {
        const isAssignee = t.assigneeCode === 'OP001' || t.assigneeCode === '3' || t.assigneeCode === '6' || t.assigneeCode === '8' || t.assigneeCode === '1';
        if (!isAssignee) return false;
        
        const taskCage = (t.cageCode || '').trim().toUpperCase();
        return !activeCode || taskCage === activeCode;
      });
    });
    const taskDone = computed(() => peternakanTasks.value.filter(t => t.status === 'selesai').length);

    const closeTaskModal = () => {
      selectedTaskId.value = null;
    };

    const openTaskDetail = (taskId: string) => {
      selectedTaskId.value = taskId;
    };

    const goToPencatatan = () => {
      if (selectedTask.value) {
        prefilledPencatatanType.value = selectedTask.value.category;
        if (selectedTask.value.rincian) {
          prefilledPencatatanRincian.value = selectedTask.value.rincian;
        }
        prefilledPencatatanTaskId.value = selectedTask.value.id;
      }
      closeTaskModal();
      router.push({ name: 'ternak-pencatatan' });
    };

    const onAddLivestockSuccess = async () => {
      await fetchSheep();
      if (cageInfo.value?.id) {
        cageStats.value = await cagesApi.getStats(cageInfo.value.id);
        cageWeightStats.value = await cagesApi.getWeightStats(cageInfo.value.id);
      }
    };

    return () => {
      return (
        <div class="peternakan-dashboard animate-fade-in">
          <BirthAlerts alerts={birthAlerts.value} />

          <div class="peternakan-title-card mb-4 overflow-hidden text-start">
            <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 position-relative" style={{ zIndex: 1 }}>
              <div>
                <div class="d-flex align-items-center gap-3 mb-1">
                  <Typography variant="h3" weight="extrabold" className="m-0 text-white">
                    Dashboard {cageInfo.value?.name || `Kandang ${activeCageCode.value || '—'}`}
                  </Typography>
                </div>
                <Typography variant="p" className="m-0 text-white opacity-80" size="text-sm">
                  Memantau populasi ternak, kesehatan, serta penyelesaian tugas harian di kandang aktif.
                </Typography>
              </div>


            </div>
          </div>

          <DashboardStats 
            totalAnimals={totalAnimals.value}
            healthyAnimals={healthyAnimals.value}
            attentionAnimals={attentionAnimals.value}
            taskDone={taskDone.value}
            totalTasks={peternakanTasks.value.length}
            tasksLoading={tasksLoading.value}
          />

          <div class="row g-4 mb-4">
            <div class="col-12 col-xl-5">
              <RoutineTasks 
                tasksLoading={tasksLoading.value}
                peternakanTasks={peternakanTasks.value}
                onOpenTaskDetail={openTaskDetail}
              />
            </div>

            <div class="col-12 col-xl-7">
              <WeightChart 
                activeCageCode={activeCageCode.value}
                averageWeightCurrent={averageWeightCurrent.value}
                weightGrowthString={weightGrowthString.value}
                totalAnimals={totalAnimals.value}
                activeCageCapacity={activeCageCapacity.value}
                points={points.value}
                linePath={linePath.value}
                areaPath={areaPath.value}
              />
            </div>
          </div>



          <LivestockListWidget 
            cageInventory={cageInventory.value}
            activeCageCode={activeCageCode.value}
            isLoading={isLoading.value}
            onOpenAddModal={() => isAddModalOpen.value = true}
          />

          <TaskDetailModal 
            selectedTask={selectedTask.value}
            onClose={closeTaskModal}
            onGoToPencatatan={goToPencatatan}
          />

          <AddLivestockModal 
            isOpen={isAddModalOpen.value}
            cageId={cageInfo.value?.id || ''}
            onClose={() => isAddModalOpen.value = false}
            onSuccess={onAddLivestockSuccess}
          />
        </div>
      );
    };
  }
});
