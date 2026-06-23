import { defineComponent, ref, computed, onMounted, watch, type PropType } from 'vue';
import { useRouter } from 'vue-router';
import Typography from '@/shared/ui/Typography';
import { userSession, cageSession, cagesList, fetchCagesList, prefilledPencatatanType, prefilledPencatatanRincian, prefilledPencatatanTaskId } from '@/store/navigation';
import { sheep, weightRecords, fetchSheep, fetchWeightRecords } from '@/store/livestock';
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

    const selectedCageCode = ref<string>('all');

    const filteredSheep = computed(() => {
      const activeOnly = sheep.value.filter(s => !['Mati', 'Terjual', 'Disembelih'].includes(s.status));
      if (selectedCageCode.value === 'all') {
        return activeOnly;
      }
      return activeOnly.filter(s => s.cage_code === selectedCageCode.value);
    });

    const activeCageCode = computed(() => {
      return selectedCageCode.value === 'all' ? '' : selectedCageCode.value;
    });

    const cageInfo = computed(() => {
      if (selectedCageCode.value === 'all') return null;
      return cagesList.value.find(cageItem => cageItem.code === selectedCageCode.value) || null;
    });

    const activeCageName = computed(() => {
      if (selectedCageCode.value === 'all') return 'Semua Kandang';
      const cage = cagesList.value.find(c => c.code === selectedCageCode.value);
      return cage ? cage.name : `Kandang ${selectedCageCode.value}`;
    });

    const totalAnimals = computed(() => filteredSheep.value.length);
    const healthyAnimals = computed(() => filteredSheep.value.filter(s => s.status === 'Sehat').length);
    const attentionAnimals = computed(() => filteredSheep.value.filter(s => s.status === 'Hamil' || s.status === 'Sakit').length);

    const cageStats = computed(() => ({
      total_animals: totalAnimals.value,
      healthy: healthyAnimals.value,
      attention_needed: attentionAnimals.value
    }));

    const cageWeightStats = computed(() => {
      const sheepIds = new Set(filteredSheep.value.map(s => String(s.id)));
      if (sheepIds.size === 0) {
        return {
          current_average: 0,
          growth_kg: 0,
          growth_percentage: 0,
          monthly_trend: []
        };
      }

      const records = weightRecords.value.filter(r => sheepIds.has(String(r.sheep_id)));

      const groupedByMonth: Record<string, { totalWeight: number; count: number }> = {};
      records.forEach(r => {
        if (!r.date || !r.weight) return;
        const dateObj = new Date(r.date);
        if (isNaN(dateObj.getTime())) return;
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const monthKey = `${year}-${month}-01`;

        if (!groupedByMonth[monthKey]) {
          groupedByMonth[monthKey] = { totalWeight: 0, count: 0 };
        }
        groupedByMonth[monthKey].totalWeight += Number(r.weight);
        groupedByMonth[monthKey].count += 1;
      });

      const monthlyTrend = Object.entries(groupedByMonth)
        .map(([month_date, data]) => ({
          month: month_date,
          weight: data.totalWeight / data.count,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const recentTrend = monthlyTrend.slice(-5);

      let currentAverage = 0;
      if (recentTrend.length > 0) {
        currentAverage = recentTrend[recentTrend.length - 1].weight;
      } else {
        const weights = filteredSheep.value
          .map(s => parseFloat(s.weight))
          .filter(w => !isNaN(w) && w > 0);
        if (weights.length > 0) {
          currentAverage = weights.reduce((sum, w) => sum + w, 0) / weights.length;
        }
      }

      let growthKg = 0;
      let growthPercentage = 0;
      if (recentTrend.length >= 2) {
        const firstWeight = recentTrend[0].weight;
        const lastWeight = recentTrend[recentTrend.length - 1].weight;
        growthKg = lastWeight - firstWeight;
        growthPercentage = firstWeight > 0 ? (growthKg / firstWeight) * 100 : 0;
      }

      return {
        current_average: currentAverage,
        growth_kg: growthKg,
        growth_percentage: growthPercentage,
        monthly_trend: recentTrend
      };
    });

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
          .filter((p: any) => p.pregnancy_status === 'dikandung')
          .map((p: any) => {
            const daysLeft = p.days_remaining || 0;
            const estBirth = new Date(p.expected_birth_date);
            const sheepId = p.mother_sheep ? p.mother_sheep.id_sheep : null;
            const sheepData = sheep.value.find(s => String(s.id) === String(sheepId));
            return {
              code: sheepData?.code || `#${sheepId}`,
              daysLeft,
              estimatedDate: estBirth.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
              id: p.id_pregnancy,
            };
          })
          .filter((a: any) => a.daysLeft >= 0 && a.daysLeft <= 14)
          .sort((a: any, b: any) => a.daysLeft - b.daysLeft);
      } catch (e) {
        // skip
      }
    };

    const handleKeguguran = async (id: string) => {
      if (!confirm('Apakah Anda yakin ingin melaporkan keguguran untuk domba ini? Status kehamilan akan dibatalkan.')) return;
      
      try {
        await pregnancyApi.updateStatus(id, 'keguguran');
        await fetchDashboardData(); // Refresh data
      } catch (e) {
        alert('Gagal melaporkan keguguran');
      }
    };

    onMounted(fetchDashboardData);

    const cageInventory = computed(() => filteredSheep.value);

    const selectedTask = computed(() =>
      operatorTasks.value.find(task => task.id === selectedTaskId.value) || null,
    );

    const activeCageCapacity = computed(() => {
      if (selectedCageCode.value === 'all') {
        return cagesList.value.reduce((sum, c) => sum + (c.capacity || 0), 0);
      }
      const cage = cagesList.value.find(c => c.code === selectedCageCode.value);
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
      await fetchWeightRecords();
    };

    return () => {
      return (
        <div class="peternakan-dashboard animate-fade-in">
          <BirthAlerts alerts={birthAlerts.value} onKeguguran={handleKeguguran} />

          <div class="peternakan-title-card mb-4 overflow-hidden text-start">
            <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 position-relative" style={{ zIndex: 1 }}>
              <div>
                <div class="d-flex align-items-center gap-3 mb-1">
                  <Typography variant="h3" weight="extrabold" className="m-0 text-white">
                    Dashboard {activeCageName.value}
                  </Typography>
                </div>
                <Typography variant="p" className="m-0 text-white opacity-80" size="text-sm">
                  Memantau populasi ternak, kesehatan, serta penyelesaian tugas harian di {selectedCageCode.value === 'all' ? 'seluruh kandang' : `kandang ${selectedCageCode.value}`}.
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
            selectedCageCode={selectedCageCode.value}
            onCageChange={(val: string) => selectedCageCode.value = val}
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
