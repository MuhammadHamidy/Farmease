import { defineComponent, ref, computed, onMounted, watch, type PropType, Teleport } from 'vue';
import { useRouter } from 'vue-router';
import Typography from '@/shared/ui/Typography';
import { userSession, cageSession, cagesList, fetchCagesList, prefilledPencatatanType, prefilledPencatatanRincian, prefilledPencatatanTaskId, prefilledPencatatanSheepId, prefilledPencatatanCageCode, activePencatatanForm } from '@/store/navigation';
import CustomSelect from '@/shared/ui/admin/Select';
import { sheep, weightRecords, fetchSheep, fetchWeightRecords } from '@/store/livestock';
import { fetchTasks, operatorTasks, tasksLoading, completeTask, mapApiTaskToLocal, fetchAccountsList } from '@/store/operatorAdmin';
import { pregnancyApi, tasksApi, cagesApi, feedsApi, manureApi, birthApi } from '@/shared/api';
import { pencatatanSubmissions, fetchSubmissions } from '@/modules/ternak/store/operatorAdmin';
import { FeedStockChart, ManureProductionChart, BirthCountChart } from '@/shared/ui/DashboardCharts';

// Components
import BirthAlerts, { type BirthAlert } from '../components/dashboard/BirthAlerts';
import DashboardStats from '../components/dashboard/DashboardStats';
import RoutineTasks from '../components/dashboard/RoutineTasks';
import WeightChart from '../components/dashboard/WeightChart';
import CageConditionChart from '../components/dashboard/CageConditionChart';
import TaskDetailModal from '../components/dashboard/TaskDetailModal';
import AddLivestockModal from '@/shared/ui/AddLivestockModal';

export default defineComponent({
  name: 'DasborView',
  props: {
    onGoToPencatatan: { type: Function as PropType<() => void>, default: null },
  },
  setup(props) {
    const router = useRouter();
    const selectedTaskId = ref<string | null>(null);
    const isAddModalOpen = ref(false);
    const isWelcomeOpen = ref(false);
    const showLoginToast = ref(false);
    const isLoading = ref(false);
    
    const feedsData = ref<any[]>([]);
    const manuresData = ref<any[]>([]);
    const birthsData = ref<any[]>([]);
    
    const isMiscarriageConfirmOpen = ref(false);
    const pregnancyIdToReport = ref<string | null>(null);
    
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

    const checkIsSheepBirahi = (s: any) => {
      let hasCheckedEstrus = false;
      let latestEstrusCheck: string | null = null;
      let latestTime = 0;
      
      pencatatanSubmissions.value.forEach(sub => {
        if (sub.approvalStatus === 'rejected') return;
        const dataObj: any = (sub.payload as any)?.data || sub.payload;
        const items = dataObj?.items || [];
        items.forEach((item: any) => {
          if ((item.name === 'Cek Birahi' || item.name === 'Pencatatan Birahi' || item.name === 'Pengecekan Birahi') && (String(item.targetId) === String(s.code) || String(item.targetId) === String(s.id))) {
            hasCheckedEstrus = true;
            const time = sub.submittedAt ? new Date(sub.submittedAt).getTime() : Date.now();
            if (time > latestTime) {
              latestTime = time;
              latestEstrusCheck = item.hasilPemeriksaan || '';
            }
          }
        });
      });

      if (hasCheckedEstrus && latestEstrusCheck) {
        return latestEstrusCheck === 'birahi';
      }
      return !!s.is_ready_to_mate || s.mating_status === 'Birahi (Siap Kawin)';
    };

    const totalAnimals = computed(() => filteredSheep.value.length);
    const healthyAnimals = computed(() => filteredSheep.value.filter(s => s.status === 'Sehat' && !checkIsSheepBirahi(s)).length);
    const pregnantAnimals = computed(() => filteredSheep.value.filter(s => s.status === 'Hamil' || s.status === 'hamil').length);
    const birahiAnimals = computed(() => filteredSheep.value.filter(s => checkIsSheepBirahi(s)).length);
    const sickAnimals = computed(() => filteredSheep.value.filter(s => s.status === 'Sakit' || s.status === 'sakit').length);
    const attentionAnimals = computed(() => pregnantAnimals.value + sickAnimals.value);

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
        const lastItem = recentTrend[recentTrend.length - 1];
        if (lastItem) {
          currentAverage = lastItem.weight;
        }
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
        const firstItem = recentTrend[0];
        const lastItem = recentTrend[recentTrend.length - 1];
        if (firstItem && lastItem) {
          const firstWeight = firstItem.weight;
          const lastWeight = lastItem.weight;
          growthKg = lastWeight - firstWeight;
          growthPercentage = firstWeight > 0 ? (growthKg / firstWeight) * 100 : 0;
        }
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

      const now = new Date();
      const localYear = now.getFullYear();
      const localMonth = String(now.getMonth() + 1).padStart(2, '0');
      const localDay = String(now.getDate()).padStart(2, '0');
      const localDateStr = `${localYear}-${localMonth}-${localDay}`;

      await Promise.all([
        fetchSheep(),
        fetchWeightRecords(),
        fetchTasks(localDateStr),
        fetchSubmissions(),
      ]);

      try {
        const [f, m, b] = await Promise.all([
          feedsApi.getList(),
          manureApi.getList(),
          birthApi.getHistory()
        ]);
        feedsData.value = f || [];
        manuresData.value = m || [];
        birthsData.value = b || [];
      } catch (err) {
        console.error('Failed to load chart data in operator dashboard:', err);
      }

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

    const handleKeguguran = (id: string) => {
      pregnancyIdToReport.value = id;
      isMiscarriageConfirmOpen.value = true;
    };

    const confirmKeguguran = () => {
      if (!pregnancyIdToReport.value) return;

      const preg = birthAlerts.value.find(a => String(a.id) === String(pregnancyIdToReport.value));
      if (preg) {
        const foundSheep = sheep.value.find(s => s.code === preg.code);
        if (foundSheep) {
          prefilledPencatatanSheepId.value = foundSheep.code;
          prefilledPencatatanCageCode.value = foundSheep.cage_code;
        }
      }

      // Prefill form directly to bypass selection screen
      activePencatatanForm.value = {
        taskId: null,
        idMating: undefined,
        scope: 'domba',
        jenis: {
          id: 'kelahiran',
          name: 'Kelahiran',
        },
        rincian: [
          {
            id: 'kelahiran-domba',
            name: 'Keguguran',
            mode: 'individu',
          },
        ],
      };

      isMiscarriageConfirmOpen.value = false;
      pregnancyIdToReport.value = null;

      router.push({ name: 'ternak-pencatatan-form' });
    };

    onMounted(() => {
      fetchDashboardData();
      const welcomeShown = sessionStorage.getItem('farmease_welcome_shown');
      if (!welcomeShown && userSession.value) {
        isWelcomeOpen.value = true;
        sessionStorage.setItem('farmease_welcome_shown', 'true');
      }

      const toastShown = sessionStorage.getItem('farmease_login_toast_shown');
      if (!toastShown && userSession.value) {
        showLoginToast.value = true;
        sessionStorage.setItem('farmease_login_toast_shown', 'true');
        setTimeout(() => {
          showLoginToast.value = false;
        }, 4000);
      }
    });

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
      const now = new Date();
      const localYear = now.getFullYear();
      const localMonth = String(now.getMonth() + 1).padStart(2, '0');
      const localDay = String(now.getDate()).padStart(2, '0');
      const todayStr = `${localYear}-${localMonth}-${localDay}`;

      return operatorTasks.value.filter(t => {
        const isAssignee = t.assigneeCode === 'OP001' || t.assigneeCode === '3' || t.assigneeCode === '6' || t.assigneeCode === '8' || t.assigneeCode === '1';
        if (!isAssignee) return false;
        
        const taskCage = (t.cageCode || '').trim().toUpperCase();
        if (activeCode && taskCage !== activeCode) return false;

        // Harian: hanya tampilkan tugas yang batas waktunya hari ini atau sebelumnya (jika belum selesai/terlambat)
        if (t.dueDate > todayStr) return false;

        return true;
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
                  Memantau populasi ternak, kesehatan, serta penyelesaian tugas harian di peternakan Farmease.
                </Typography>
              </div>
            </div>
          </div>

          <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3 text-start bg-white p-3 rounded-4 border shadow-sm">
            <div>
              <Typography variant="h5" weight="extrabold" className="m-0" style={{ color: '#3d2f24' }}>
                Filter Tampilan Dasbor
              </Typography>
              <Typography variant="p" size="text-xs" color="secondary" className="m-0">
                Pilih kandang spesifik untuk menyaring ringkasan populasi, tugas rutin harian, dan grafik pendukung keputusan.
              </Typography>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="text-muted small fw-bold" style={{ whiteSpace: 'nowrap' }}>Kandang Aktif:</span>
              <CustomSelect
                options={[
                  { value: 'all', label: 'Semua Kandang' },
                  ...cagesList.value.map(c => ({ value: c.code, label: `${c.name} (${c.code})` }))
                ]}
                modelValue={selectedCageCode.value}
                onUpdate:modelValue={(val: string) => selectedCageCode.value = val}
                theme="peternakan"
                style={{ minWidth: '180px' }}
              />
            </div>
          </div>

          <div class="row g-4 mb-4">
            <div class="col-12 col-xl-5">
              <DashboardStats 
                totalAnimals={totalAnimals.value}
                healthyAnimals={healthyAnimals.value}
                pregnantAnimals={pregnantAnimals.value}
                birahiAnimals={birahiAnimals.value}
                sickAnimals={sickAnimals.value}
              />
            </div>

            <div class="col-12 col-xl-7">
              <RoutineTasks 
                tasksLoading={tasksLoading.value}
                peternakanTasks={peternakanTasks.value}
                onOpenTaskDetail={openTaskDetail}
                taskDone={taskDone.value}
                totalTasks={peternakanTasks.value.length}
              />
            </div>
          </div>

          <div class="row g-4 mb-4">
            <div class="col-12">
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

          <div class="row g-4 mb-4">
            <div class="col-12 col-xl-7">
              <div class="d-flex flex-column gap-4 h-100">
                <div class="flex-fill">
                  <ManureProductionChart manures={manuresData.value} sheepList={sheep.value} />
                </div>
                <div class="flex-fill">
                  <BirthCountChart births={birthsData.value} sheepList={sheep.value} />
                </div>
              </div>
            </div>

            <div class="col-12 col-xl-5">
              <CageConditionChart
                cagesList={cagesList.value}
                sheepList={sheep.value}
              />
            </div>
          </div>

          <div class="row g-4 mb-4">
            <div class="col-12">
              <FeedStockChart feeds={feedsData.value} sheepList={sheep.value} />
            </div>
          </div>

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

          {isMiscarriageConfirmOpen.value && (
            <Teleport to="body">
              <div class="peternakan-modal-overlay animate-fade-in" style={{ zIndex: 1100 }} onClick={() => { isMiscarriageConfirmOpen.value = false; pregnancyIdToReport.value = null; }}>
                <div class="peternakan-modal-card text-center p-4 animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', borderRadius: '24px', backgroundColor: '#FAFAF8', border: '1px solid #e2dfd8', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                  <div class="d-inline-flex align-items-center justify-content-center mb-4 rounded-circle" style={{ width: '64px', height: '64px', backgroundColor: '#FADBD8', border: '3px solid #F5B7B1' }}>
                    <img src="/icon/warning.png" alt="Warning" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                  </div>
                  <Typography variant="h3" weight="extrabold" class="mb-2" style={{ fontSize: '1.2rem', color: '#7B241C' }}>
                    Konfirmasi Keguguran
                  </Typography>
                  <Typography variant="p" class="text-secondary mb-4 lh-base" style={{ fontSize: '0.85rem' }}>
                    Apakah Anda yakin ingin melaporkan keguguran untuk domba ini? <strong>Status kehamilan akan dibatalkan</strong> dan di-reset kembali.
                  </Typography>
                  <div class="d-flex gap-2 w-100 mt-2">
                    <button 
                      class="btn btn-light w-50 fw-bold py-2.5 rounded-pill" 
                      style={{ border: '1px solid #e2dfd8' }}
                      onClick={() => {
                        isMiscarriageConfirmOpen.value = false;
                        pregnancyIdToReport.value = null;
                      }}
                    >
                      Batal
                    </button>
                    <button 
                      class="btn w-50 fw-bold py-2.5 rounded-pill text-white" 
                      style={{ backgroundColor: '#C0392B' }}
                      disabled={isLoading.value}
                      onClick={confirmKeguguran}
                    >
                      {isLoading.value ? 'Memproses...' : 'Ya, Laporkan'}
                    </button>
                  </div>
                </div>
              </div>
            </Teleport>
          )}

          {isWelcomeOpen.value && userSession.value && (
            <Teleport to="body">
              <div class="peternakan-modal-overlay animate-fade-in" onClick={() => isWelcomeOpen.value = false} style={{ zIndex: 1060 }}>
                <div class="peternakan-modal-card text-center p-5 animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', borderRadius: '24px', backgroundColor: '#FAFAF8', border: '1px solid #e2dfd8', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
                  
                  {/* Decorative Welcome Icon */}
                  <div class="d-inline-flex align-items-center justify-content-center mb-4 rounded-circle bg-white shadow-sm" style={{ width: '80px', height: '80px', border: '4px solid #bc6c25' }}>
                    <img src="/icon/ternak_op.png" alt="Welcome" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                  </div>

                  {/* Title */}
                  <Typography variant="h3" weight="extrabold" class="mb-2" style={{ color: '#3d2f24', fontSize: '1.4rem' }}>
                    Selamat Datang!
                  </Typography>
                  <Typography variant="h5" weight="bold" class="mb-3" style={{ color: '#bc6c25', fontSize: '1.1rem' }}>
                    {userSession.value.name}
                  </Typography>

                  {/* Badges / Account Details */}
                  <div class="d-flex justify-content-center gap-2 mb-4">
                    <span class="badge rounded-pill px-3 py-2 fw-bold" style={{ backgroundColor: '#f0ede6', color: '#6b5847', fontSize: '0.75rem' }}>
                      ID: {userSession.value.code}
                    </span>
                    <span class="badge rounded-pill px-3 py-2 fw-bold" style={{ backgroundColor: '#bc6c25', color: '#ffffff', fontSize: '0.75rem' }}>
                      {userSession.value.role}
                    </span>
                  </div>

                  {/* Welcome Message */}
                  <Typography variant="p" class="text-muted mb-4 small lh-base" style={{ fontSize: '0.85rem' }}>
                    Anda telah masuk ke dalam sistem **FARMease (Portal Peternakan)**. 
                    Seluruh fitur pencatatan pakan, pemantauan kesehatan, perkembangan reproduksi, dan tugas kandang harian siap digunakan untuk memudahkan aktivitas Anda hari ini.
                  </Typography>

                  {/* Action Button */}
                  <button
                    type="button"
                    class="btn w-100 rounded-pill fw-bold py-3 text-white border-0"
                    style={{
                      backgroundColor: '#bc6c25',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 6px -1px rgba(188, 108, 37, 0.2)'
                    }}
                    onClick={() => isWelcomeOpen.value = false}
                    onMouseover={(e: any) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseout={(e: any) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
                  >
                    Mulai Aktivitas
                  </button>

                </div>
              </div>
            </Teleport>
          )}
          {showLoginToast.value && (
            <Teleport to="body">
              <div 
                style={{ 
                  position: 'fixed', 
                  top: '24px', 
                  right: '24px', 
                  zIndex: 9999, 
                  backgroundColor: '#2e7d32', 
                  color: 'white', 
                  padding: '16px 24px', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
                  fontWeight: 'bold', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' 
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>✅</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Login Berhasil</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.9 }}>Berhasil masuk ke portal Peternakan Farmease</div>
                </div>
              </div>
            </Teleport>
          )}
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      );
    };
  }
});
