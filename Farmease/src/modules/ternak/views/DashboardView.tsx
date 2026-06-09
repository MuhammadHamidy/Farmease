import { defineComponent, ref, computed, onMounted, watch, type PropType } from 'vue';
import Typography from '@/shared/ui/Typography';
import StatCard from '@/shared/ui/StatCard';
import Badge from '@/shared/ui/Badge';
import { userSession, cageSession, selectedTernakId, cagesList, fetchCagesList, prefilledPencatatanType, prefilledPencatatanRincian } from '@/store/navigation';
import { sheep, fetchSheep, weightRecords, fetchWeightRecords, addSheep } from '@/store/livestock';
import { fetchTasks, operatorTasks, tasksLoading, completeTask } from '@/store/operatorAdmin';
import { pregnancyApi, tasksApi, cagesApi } from '@/shared/api';
import CustomInput from '@/shared/ui/Input';
import CustomSelect from '@/shared/ui/Select';

export default defineComponent({
  name: 'DasborView',
  props: {
    onGoToPencatatan: { type: Function as PropType<() => void>, default: null },
  },
  setup(props) {
    const search = ref('');
    const filterStatus = ref('');
    const selectedTaskId = ref<string | null>(null);
    const isAddModalOpen = ref(false);
    const isLoading = ref(false);
    const newDomba = ref({
      code: '', name: '', type: 'Garut', birth_date: '', gender: 'Jantan',
      status: 'Sehat', origin: '', id_sire: '', id_dam: '',
    });
    const birthAlerts = ref<{ code: string; daysLeft: number; estimatedDate: string }[]>([]);
    const upcomingTasks = ref<any[]>([]);

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

    onMounted(async () => {
      await fetchCagesList();
      await Promise.all([
        fetchSheep(),
        fetchWeightRecords(),
        fetchTasks(new Date().toISOString().split('T')[0]),
      ]);

      // FR3-04: Fetch pregnancy data for birth notifications
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
          .filter(a => a.daysLeft >= 0 && a.daysLeft <= 14) // show 14 days warning
          .sort((a, b) => a.daysLeft - b.daysLeft);
      } catch (e) {
        // pregnancy data unavailable — skip alert
      }

      // FR8-01: Fetch upcoming 7-day tasks
      try {
        const allTasks = [];
        for (let i = 1; i <= 7; i++) {
          const dateObj = new Date();
          dateObj.setDate(dateObj.getDate() + i);
          const dateStr = dateObj.toISOString().split('T')[0]!;
          try {
            const dayTasks = await tasksApi.getList(dateStr);
            allTasks.push(...dayTasks.map((taskItem: any) => ({ ...taskItem, scheduledDate: dateStr })));
          } catch { /* skip */ }
        }
        upcomingTasks.value = allTasks.slice(0, 8);
      } catch { /* upcoming tasks unavailable */ }
    });

    const handleAddDomba = async () => {
      const sheepData = newDomba.value;
      if (!sheepData.code || !sheepData.name || !sheepData.type || !sheepData.gender || !sheepData.birth_date || !sheepData.status || !sheepData.origin) {
        alert('Gagal: Mohon lengkapi semua kolom yang bertanda bintang (*) sebelum menyimpan.');
        return;
      }

      try {
        isLoading.value = true;
        
        const typeMap: Record<string, number> = {
          'Garut': 1,
          'Texel': 2,
          'Merino': 3,
          'Dorper': 4,
          'Lokal': 5,
          'Ekor Tipis': 6,
          'Priangan': 7
        };
        const resolvedIdType = typeMap[newDomba.value.type] || 1;

        await addSheep({
          sheep_code: sheepData.code,
          sheep_name: sheepData.name,
          id_type: resolvedIdType,
          gender: newDomba.value.gender === 'Jantan' ? 'jantan' : 'betina',
          date_of_birth: newDomba.value.birth_date ? new Date(newDomba.value.birth_date).toISOString() : null,
          status: newDomba.value.status,
          origin: newDomba.value.origin || 'Ternak Sendiri',
          id_cage: Number(cageInfo.value?.id) || 0,
          ...(newDomba.value.id_sire ? { id_sire: Number(newDomba.value.id_sire) } : {}),
          ...(newDomba.value.id_dam ? { id_dam: Number(newDomba.value.id_dam) } : {}),
        });
        isAddModalOpen.value = false;
        newDomba.value = { code: '', name: '', type: 'Garut', birth_date: '', gender: 'Jantan', status: 'Sehat', origin: '', id_sire: '', id_dam: '' };
        
        // Refresh data after adding sheep
        await fetchSheep();
        if (cageInfo.value?.id) {
          cageStats.value = await cagesApi.getStats(cageInfo.value.id);
          cageWeightStats.value = await cagesApi.getWeightStats(cageInfo.value.id);
        }
      } catch (error) {
        console.error('Failed to add sheep:', error);
      } finally {
        isLoading.value = false;
      }
    };



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

    // ── Berat badan: aggregasi per bulan dari data real ──
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

    const filteredInventory = computed(() => {
      const q = search.value.toLowerCase().trim();
      return cageInventory.value.filter(t => {
        const matchSearch = !q ||
          t.name.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q);
        const matchStatus = !filterStatus.value || t.status === filterStatus.value;
        return matchSearch && matchStatus;
      });
    });

    const totalAnimals = computed(() => cageStats.value?.total_animals || 0);
    const healthyAnimals = computed(() => cageStats.value?.healthy || 0);
    const attentionAnimals = computed(() => cageStats.value?.attention_needed || 0);
    const peternakanTasks = computed(() => operatorTasks.value.filter(t => t.assigneeCode === 'OP001' || t.assigneeCode === '3' || t.assigneeCode === '6' || t.assigneeCode === '8' || t.assigneeCode === '1'));
    const taskDone = computed(() => peternakanTasks.value.filter(t => t.status === 'selesai').length);

    const closeTaskModal = () => {
      selectedTaskId.value = null;
    };

    const openTaskDetail = (taskId: string) => {
      selectedTaskId.value = taskId;
    };

    const handleCompleteTask = async (taskId: string) => {
      try {
        await completeTask(taskId);
      } catch {
        // error handled in store
      }
    };

    const goToPencatatan = () => {
      if (selectedTask.value) {
        prefilledPencatatanType.value = selectedTask.value.category;
        if (selectedTask.value.rincian) {
          prefilledPencatatanRincian.value = selectedTask.value.rincian;
        }
      }
      closeTaskModal();
      props.onGoToPencatatan?.();
    };

    const statusColor: Record<string, string> = {
      Sehat: 'success',
      Hamil: 'warning',
      Sakit: 'danger',
    };

    const CATEGORY_ICONS: Record<string, string> = {
      pakan: '/icon/catat_pakan.png',
      kesehatan: '/icon/catat_sehat.png',
      kotoran: '/icon/catat_kotoran.png',
      perkawinan: '/icon/catat_kawin.png',
      kelahiran: '/icon/catat_lahir.png',
      umum: '/icon/catat_jenis.png',
    };

    return () => (
      <div class="animate-fade-in">
        {/* FR3-04: Birth Alert Banners */}
        {birthAlerts.value.length > 0 && (
          <div class="mb-4">
            {birthAlerts.value.map((alert, i) => (
              <div
                key={i}
                class="d-flex align-items-center gap-3 px-4 py-3 mb-2 rounded-4"
                style={{
                  background: alert.daysLeft <= 3 ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
                  border: `1.5px solid ${alert.daysLeft <= 3 ? 'var(--color-warning)' : 'var(--color-success)'}`,
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>🐑</span>
                <div class="flex-grow-1">
                  <strong style={{ fontSize: '0.85rem' }}>
                    {alert.daysLeft === 0 ? 'Hari Ini' : `${alert.daysLeft} hari lagi`}
                  </strong>
                  <span style={{ fontSize: '0.82rem', marginLeft: '6px' }}>
                    — Domba <strong>{alert.code}</strong> diperkirakan melahirkan pada {alert.estimatedDate}
                  </span>
                </div>
                <Badge variant={alert.daysLeft <= 3 ? 'warning' : 'success'} className="px-3 py-1">
                  {alert.daysLeft <= 3 ? '⚠️ Segera' : '📅 Mendekati'}
                </Badge>
              </div>
            ))}
          </div>
        )}
        <div class="peternakan-title-card mb-4 overflow-hidden text-start">
          <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 position-relative" style={{ zIndex: 1 }}>
            <div>
              <div class="d-flex align-items-center gap-3 mb-1">
                <Typography variant="h3" weight="extrabold" className="m-0 text-white">
                  Dashboard Kandang {activeCageCode.value || '—'}
                </Typography>
              </div>
              <Typography variant="p" className="m-0 text-white opacity-80" size="text-sm">
                Memantau populasi ternak, kesehatan, serta penyelesaian tugas harian di kandang aktif.
              </Typography>
            </div>

            <div class="text-md-end text-white" style={{ fontSize: '0.85rem' }}>
              <span class="d-block text-white" style={{ fontWeight: 800 }}>{userSession.value?.name || 'Operator Lapangan'}</span>
              <span class="opacity-75" style={{ color: '#ffffffbf' }}>
                {userSession.value?.role || 'Pencatat'} • Kandang {activeCageCode.value || '—'}
              </span>
            </div>
          </div>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-6 col-xl-3">
            <StatCard
              label="Total Ternak"
              value={String(totalAnimals.value)}
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
              value={String(healthyAnimals.value)}
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
              value={String(attentionAnimals.value)}
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
              value={tasksLoading.value ? '...' : `${taskDone.value}/${peternakanTasks.value.length}`}
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

        <div class="row g-4 mb-4">
          {/* Tugas Rutin dari BE */}
          <div class="col-12 col-xl-5">
            <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5 h-100">
              <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 gap-3">
                <div class="flex-grow-1" style={{ minWidth: 0 }}>
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <img src="/icon/rutin_task.png" alt="Task" style={{ width: '22px', height: '22px', objectFit: 'contain', flexShrink: 0 }} />
                    <Typography variant="h4" weight="extrabold" className="m-0 text-truncate" style={{ maxWidth: '100%' }}>Tugas Rutin Peternakan</Typography>
                  </div>
                  <Typography variant="p" size="text-xs" color="secondary" className="m-0">Klik kartu tugas untuk melihat detail dan panduan kerja.</Typography>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <Badge variant="solid-primary" className="px-3 py-1.5 text-nowrap" style={{ fontSize: '0.65rem' }}>Hari Ini</Badge>
                </div>
              </div>

              {tasksLoading.value ? (
                <div class="text-center py-4 text-secondary" style={{ fontSize: '0.85rem' }}>Memuat tugas...</div>
              ) : peternakanTasks.value.length === 0 ? (
                <div class="text-center py-4 text-secondary" style={{ fontSize: '0.85rem' }}>Belum ada tugas hari ini</div>
              ) : (
                <div class="d-flex flex-column gap-3">
                  {peternakanTasks.value.map(task => (
                    <div
                      key={task.id}
                      class="bg-white rounded-4 w-100 text-start shadow-sm"
                      style={{ 
                        border: '1px solid #E6D9CE', 
                        opacity: task.status === 'selesai' ? 0.7 : 1,
                      }}
                    >
                      <div class="p-3 pb-2 d-flex align-items-start justify-content-between gap-3">
                        <div class="d-flex align-items-start gap-3">
                          <div class="rounded-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', backgroundColor: '#F4EBE4', border: '1px solid #E6D9CE' }}>
                            <img src={CATEGORY_ICONS[task.category] || '/icon/catat_jenis.png'} alt="Task" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                          </div>
                          <div class="d-flex flex-column gap-1 mt-1">
                            <div style={{
                              backgroundColor: task.priority === 'tinggi' ? '#FADBD8' : task.priority === 'sedang' ? '#FCF3CF' : '#EAECEE',
                              color: task.priority === 'tinggi' ? '#C0392B' : task.priority === 'sedang' ? '#B7950B' : '#5D6D7E',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '0.65rem',
                              fontWeight: 'bold',
                              width: 'fit-content'
                            }}>
                              Prioritas: <span class="text-capitalize">{task.priority}</span>
                            </div>
                            <Typography variant="p" size="text-base" className="mb-0 text-dark" style={{ lineHeight: '1.3', fontWeight: '500' }}>
                              {task.rincian || task.description || task.title}
                            </Typography>
                            <span style={{ fontSize: '0.7rem', color: '#5D4037', fontWeight: '700', letterSpacing: '0.5px' }} class="text-uppercase mt-1">
                              {task.category}
                            </span>
                          </div>
                        </div>
                        
                        {/* Detail Button */}
                        <div class="d-flex flex-column align-items-end justify-content-start mt-1">
                          {task.status === 'selesai' ? (
                            <Badge variant="success" className="px-3 py-1.5" style={{ fontSize: '0.75rem' }}>
                              Selesai
                            </Badge>
                          ) : (
                            <button 
                              type="button"
                              class="btn btn-sm rounded-pill px-3 fw-bold" 
                              style={{ fontSize: '0.75rem', color: '#8B5A2B', border: '1px solid #8B5A2B', backgroundColor: 'transparent' }}
                              onClick={() => openTaskDetail(task.id)}
                            >
                              Detail
                            </button>
                          )}
                        </div>
                      </div>

                      <hr style={{ margin: '0.5rem 1rem', borderColor: '#E6D9CE', opacity: 0.8 }} />

                      <div class="p-3 pt-2 row g-0">
                        <div class="col-6">
                          <span style={{ fontSize: '0.65rem', color: '#9E9E9E', letterSpacing: '0.5px' }}>WAKTU MULAI</span>
                          <div style={{ fontSize: '1rem', color: '#2C3E50', fontWeight: '400' }}>{task.dueTime ? `${task.dueTime} WIB` : '-'}</div>
                        </div>
                        <div class="col-6">
                          <span style={{ fontSize: '0.65rem', color: '#9E9E9E', letterSpacing: '0.5px' }}>WAKTU TENGGAT</span>
                          <div style={{ fontSize: '1rem', color: '#C0392B', fontWeight: '400' }}>{task.endTime ? `${task.endTime} WIB` : '-'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grafik berat badan dari BE */}
          <div class="col-12 col-xl-7">
            <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5 h-100">
              <div class="d-flex align-items-center justify-content-between mb-4 gap-3">
                <div>
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <img src="/icon/statistic.png" alt="Statistik" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                    <Typography variant="h4" weight="extrabold" className="m-0">Perkembangan Rata-Rata Berat Badan</Typography>
                  </div>
                  <Typography variant="p" size="text-xs" color="secondary" className="m-0">
                    Tren kenaikan berat badan domba di Kandang {activeCageCode.value || '—'} (5 Bulan Terakhir)
                  </Typography>
                </div>
                <Badge variant="success" className="px-3 py-1.5" style={{ fontSize: '0.65rem' }}>
                  Kandang {activeCageCode.value || '—'}
                </Badge>
              </div>

              <div class="row g-3 mb-4">
                <div class="col-6 col-md-4">
                  <div class="important-cage-tile p-3">
                    <Typography variant="span" size="text-xs" className="text-secondary text-uppercase fw-bold d-block mb-1">Rata-Rata Berat</Typography>
                    <Typography variant="h4" weight="extrabold" className="m-0" style={{ color: 'var(--color-primary)' }}>
                      {averageWeightCurrent.value}
                    </Typography>
                  </div>
                </div>
                <div class="col-6 col-md-4">
                  <div class="important-cage-tile p-3">
                    <Typography variant="span" size="text-xs" className="text-secondary text-uppercase fw-bold d-block mb-1">Pertumbuhan</Typography>
                    <Typography variant="h4" weight="extrabold" className="m-0" style={{ color: 'var(--color-secondary)' }}>
                      {weightGrowthString.value}
                    </Typography>
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="important-cage-tile p-3">
                    <Typography variant="span" size="text-xs" className="text-secondary text-uppercase fw-bold d-block mb-1">Total Populasi</Typography>
                    <Typography variant="h4" weight="extrabold" className="m-0" style={{ color: 'var(--color-on-surface)' }}>
                      {totalAnimals.value} / {activeCageCapacity.value} Ekor
                    </Typography>
                  </div>
                </div>
              </div>

              {points.value.length === 0 ? (
                <div class="d-flex flex-column align-items-center justify-content-center py-5 text-secondary" style={{ fontSize: '0.85rem' }}>
                  <img src="/icon/statistic.png" style={{ width: '40px', opacity: 0.3, marginBottom: '0.75rem' }} alt="" />
                  <p class="m-0 text-center">Belum ada data berat badan tercatat</p>
                </div>
              ) : (
                <div class="position-relative" style={{ width: '100%', height: '220px', backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '10px 10px 0' }}>
                  <svg viewBox="0 0 500 220" width="100%" height="220" style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--color-secondary)" stop-opacity="0.25" />
                        <stop offset="100%" stop-color="var(--color-secondary)" stop-opacity="0.0" />
                      </linearGradient>
                    </defs>

                    {[30, 60, 90, 120, 150, 180].map((yVal) => (
                      <line key={yVal} x1="45" y1={String(yVal)} x2="480" y2={String(yVal)}
                        stroke="var(--color-outline-variant)" stroke-width="1" stroke-dasharray={yVal === 180 ? '0' : '4,4'} />
                    ))}

                    <text x="35" y="184" text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">0 kg</text>
                    <text x="35" y="154" text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">10 kg</text>
                    <text x="35" y="124" text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">20 kg</text>
                    <text x="35" y="94" text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">30 kg</text>
                    <text x="35" y="64" text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">40 kg</text>
                    <text x="35" y="34" text-anchor="end" font-size="10" fill="var(--color-primary)" font-weight="600">50 kg</text>

                    <path d={areaPath.value} fill="url(#chart-area-grad)" />
                    <path d={linePath.value} fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

                    {points.value.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="var(--color-primary)" stroke-width="3" />
                        <text x={p.x} y={p.y - 12} text-anchor="middle" font-size="10" font-weight="800" fill="var(--color-primary)">
                          {p.value.toFixed(1)} kg
                        </text>
                        <text x={p.x} y="202" text-anchor="middle" font-size="11" fill="var(--color-primary)" font-weight="bold">
                          {p.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FR8-01: Jadwal 7 Hari Ke Depan */}
        {upcomingTasks.value.length > 0 && (
          <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5 mb-4">
            <div class="d-flex align-items-center gap-2 mb-4">
              <img src="/icon/calendar.png" alt="Jadwal" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              <Typography variant="h4" weight="extrabold" className="m-0">Jadwal 7 Hari Ke Depan</Typography>
            </div>
            <div class="row g-3">
              {upcomingTasks.value.map((task: any, i: number) => (
                <div class="col-12 col-md-6 col-xl-4" key={i}>
                  <div 
                    class="d-flex flex-column h-100 p-3 rounded-4" 
                    style={{ backgroundColor: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default' }} 
                    onMouseover={(e: any) => { e.currentTarget.style.borderColor = 'var(--color-primary-fixed)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.1)'; }} 
                    onMouseout={(e: any) => { e.currentTarget.style.borderColor = 'var(--color-outline-variant)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <div class="d-flex align-items-center gap-2">
                        <div class="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '36px', height: '36px', backgroundColor: 'var(--color-surface-container-high)' }}>
                          <img src={CATEGORY_ICONS[(task.category || task.jenis || 'umum').toLowerCase()] || '/icon/catat_jenis.png'} style={{ width: '18px', height: '18px', objectFit: 'contain' }} alt="" />
                        </div>
                        <Typography variant="span" size="text-xs" weight="bold" className="text-secondary text-uppercase m-0">{task.category || task.jenis || 'Umum'}</Typography>
                      </div>
                      <Badge 
                        variant={task.priority === 'tinggi' ? 'danger' : task.priority === 'rendah' ? 'secondary' : 'warning'} 
                        className="px-2 py-1 text-uppercase" 
                        style={{ fontSize: '0.65rem' }}
                      >
                        {task.priority || 'Normal'}
                      </Badge>
                    </div>
                    
                    <Typography variant="h5" weight="extrabold" className="m-0 mb-3 text-dark text-truncate" title={task.title || task.judul}>
                      {task.title || task.judul}
                    </Typography>
                    
                    <div class="mt-auto pt-3 d-flex flex-wrap align-items-center justify-content-between gap-2 border-top">
                      <div class="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '0.75rem' }}>
                        <i class="bi bi-calendar-week text-muted"></i>
                        <span class="fw-bold">{new Date(task.scheduledDate).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short' })}</span>
                      </div>
                      {task.time && (
                        <Badge variant="secondary" className="px-2 py-1 fw-bold text-dark">
                          <i class="bi bi-clock me-1 text-muted"></i> {task.time} WIB
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daftar Ternak dari BE */}
        <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5">
          <div class="mb-4">
            <div class="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-3">
              <div class="flex-grow-1" style={{ minWidth: '240px' }}>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <img src="/icon/domba.png" alt="Domba" style={{ width: '22px', height: '22px', objectFit: 'contain', flexShrink: 0 }} />
                  <Typography variant="h4" weight="extrabold" className="m-0 text-truncate">Daftar Ternak</Typography>
                </div>
                <Typography variant="p" size="text-xs" color="secondary" className="d-block m-0">Klik ternak untuk masuk ke detail dan pencatatan terkait</Typography>
              </div>
              <button class="peternakan-primary-btn mb-0 justify-content-center" style={{ whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => isAddModalOpen.value = true} disabled={isLoading.value}>
                <img src="/icon/plus.png" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                {isLoading.value ? 'Menyimpan...' : 'Tambah Domba'}
              </button>
            </div>

            <div class="peternakan-search-bar mb-3">
              <span class="peternakan-search-icon">
                <img src="/icon/search.png" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
              </span>
              <input
                type="text"
                class="peternakan-search-input"
                placeholder="Cari ID, jenis, status..."
                value={search.value}
                onInput={(e) => search.value = (e.target as HTMLInputElement).value}
              />
            </div>

            <div class="d-flex flex-wrap gap-2">
              {['', 'Sehat', 'Hamil', 'Sakit'].map(status => (
                <button
                  type="button"
                  key={status || 'Semua'}
                  class={['btn btn-sm rounded-pill px-3 py-2 fw-bold', filterStatus.value === status ? 'btn-primary-custom shadow-sm' : 'btn-light border text-secondary']}
                  onClick={() => filterStatus.value = status}
                >
                  {status || 'Semua'}
                </button>
              ))}
            </div>
          </div>

          <div class="row g-3">
            {filteredInventory.value.length === 0 ? (
              <div class="col-12 text-center py-5 text-secondary">
                {cageInventory.value.length === 0
                  ? `Belum ada data ternak di kandang ${activeCageCode.value || 'aktif'}`
                  : 'Tidak ada ternak yang sesuai filter'}
              </div>
            ) : (
              filteredInventory.value.map(t => (
                <div class="col-12 col-md-6 col-xl-3" key={t.id}>
                  <div class="peternakan-item-card h-100 flex-column align-items-stretch" style={{ cursor: 'pointer' }} onClick={() => selectedTernakId.value = t.id}>
                    <div class="d-flex align-items-center gap-3">
                      <div class="peternakan-item-icon-box position-relative">
                        <img src="/icon/domba.png" style={{ width: '30px', height: '30px', objectFit: 'contain' }} alt="Domba" />
                      </div>
                      <div class="peternakan-item-main">
                        <span class="peternakan-item-headline">{t.name}</span>
                        <span class="peternakan-item-subline">{t.code} • Kandang {t.cage_code}</span>
                      </div>
                    </div>

                    <div class="d-flex flex-wrap gap-2 mt-3">
                      <Badge variant={(statusColor[t.status] || 'success') as any}>{t.status}</Badge>
                      <Badge variant="secondary">{t.type}</Badge>
                      <Badge variant="secondary">{t.gender}</Badge>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mt-3">
                      <Badge variant="secondary" className="px-3 py-1">{t.gender}</Badge>
                      <button class="peternakan-action-btn" onClick={(e) => { e.stopPropagation(); selectedTernakId.value = t.id; }}>Detail</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task Detail Modal */}
        {selectedTask.value && (
          <div class="peternakan-modal-overlay" onClick={closeTaskModal}>
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
              <div class="peternakan-modal-header">
                <button class="peternakan-modal-close" onClick={closeTaskModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <div class="peternakan-modal-title">Detail Tugas Rutin</div>
              </div>

              <div class="peternakan-modal-body">
                <div class="d-flex align-items-start gap-3 mb-4">
                  <div class="rounded-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', backgroundColor: 'var(--color-primary-fixed)' }}>
                    <img src={CATEGORY_ICONS[selectedTask.value.category] || '/icon/catat_jenis.png'} alt="Task" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                  </div>
                  <div class="flex-grow-1">
                    <Typography variant="h4" weight="extrabold" className="m-0 text-capitalize">{selectedTask.value.category}</Typography>
                    <Typography variant="p" size="text-xs" color="secondary" className="m-0">
                      Tugas Rutin Peternakan
                    </Typography>
                  </div>
                  <Badge variant={selectedTask.value.status === 'selesai' ? 'success' : 'warning'} className="px-3 py-2 text-nowrap">
                    {selectedTask.value.status === 'selesai' ? 'Sudah Selesai' : 'Belum Selesai'}
                  </Badge>
                </div>

                <div class="rounded-4 border p-3 mb-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div class="d-flex flex-column gap-3">
                    <div>
                      <span class="text-muted d-block small mb-1">Jenis Tugas:</span>
                      <span class="fw-semibold text-dark text-capitalize">{selectedTask.value.category}</span>
                    </div>
                    <div>
                      <span class="text-muted d-block small mb-1">Rincian Tugas <span class="fw-normal">(Opsional)</span>:</span>
                      <span class="fw-semibold text-dark">{selectedTask.value.rincian || '-'}</span>
                    </div>
                    <div>
                      <span class="text-muted d-block small mb-1">Kandang:</span>
                      <span class="fw-semibold text-dark">{selectedTask.value.cageCode}</span>
                    </div>
                    <div>
                      <span class="text-muted d-block small mb-1">Prioritas:</span>
                      <span class="fw-semibold text-dark text-capitalize">{selectedTask.value.priority}</span>
                    </div>
                    <div>
                      <span class="text-muted d-block small mb-1">Jam Pelaksanaan:</span>
                      <span class="fw-semibold text-dark">{selectedTask.value.dueTime ? `${selectedTask.value.dueTime} WIB` : '-'}</span>
                    </div>
                    <div>
                      <span class="text-muted d-block small mb-1">Jam Tenggat:</span>
                      <span class="fw-semibold text-dark">{selectedTask.value.endTime ? `${selectedTask.value.endTime} WIB` : '-'}</span>
                    </div>
                    <div>
                      <span class="text-muted d-block small mb-1">Deskripsi Tugas:</span>
                      <span class="fw-semibold text-dark">{selectedTask.value.description || 'Tidak ada deskripsi.'}</span>
                    </div>
                  </div>
                </div>

                <div class="d-flex flex-column flex-sm-row gap-3 justify-content-end">
                  <button
                    class="btn rounded-pill px-4 py-3 fw-bold text-white border-0 w-100"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    onClick={goToPencatatan}
                  >
                    Kerjakan Tugas
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Tambah Domba */}
        {isAddModalOpen.value && (
          <div class="peternakan-modal-overlay" onClick={() => isAddModalOpen.value = false}>
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div class="peternakan-modal-header">
                <button class="peternakan-modal-close" onClick={() => isAddModalOpen.value = false}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <div class="peternakan-modal-title">Tambah Populasi Domba</div>
              </div>

              <div class="peternakan-modal-body">
                <div class="row g-3">
                  <div class="col-6">
                    <label class="pencatatan-label">Kode Domba (Ear Tag) <span class="text-danger">*</span></label>
                    <CustomInput 
                      modelValue={newDomba.value.code} 
                      placeholder="Contoh: D-007" 
                      onUpdate:modelValue={(value: string) => newDomba.value.code = value} 
                    />
                  </div>
                  <div class="col-6">
                    <label class="pencatatan-label">Nama Domba <span class="text-danger">*</span></label>
                    <CustomInput 
                      modelValue={newDomba.value.name} 
                      placeholder="Masukkan nama domba" 
                      onUpdate:modelValue={(value: string) => newDomba.value.name = value} 
                    />
                  </div>
                  <div class="col-6">
                    <label class="pencatatan-label">Ras/Jenis <span class="text-danger">*</span></label>
                    <CustomSelect 
                      options={['Garut', 'Merino', 'Dorper', 'Lokal', 'Ekor Tipis', 'Priangan']}
                      modelValue={newDomba.value.type}
                      onUpdate:modelValue={(value: string) => newDomba.value.type = value}
                    />
                  </div>
                  <div class="col-6">
                    <label class="pencatatan-label">Jenis Kelamin <span class="text-danger">*</span></label>
                    <CustomSelect 
                      options={['Jantan', 'Betina']}
                      modelValue={newDomba.value.gender}
                      onUpdate:modelValue={(value: string) => newDomba.value.gender = value}
                    />
                  </div>
                  <div class="col-6">
                    <label class="pencatatan-label">Tanggal Lahir <span class="text-danger">*</span></label>
                    <CustomInput 
                      modelValue={newDomba.value.birth_date} 
                      placeholder="YYYY-MM-DD" 
                      type="date"
                      onUpdate:modelValue={(value: string) => newDomba.value.birth_date = value} 
                    />
                  </div>
                  <div class="col-6">
                    <label class="pencatatan-label">Status Awal <span class="text-danger">*</span></label>
                    <CustomSelect 
                      options={['Sehat', 'Sakit', 'Hamil']}
                      modelValue={newDomba.value.status}
                      onUpdate:modelValue={(value: string) => newDomba.value.status = value}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Asal Ternak <span class="text-danger">*</span></label>
                    <CustomSelect
                      options={['Ternak Sendiri', 'Pembelian', 'Hibah', 'Kelahiran di Kandang']}
                      modelValue={newDomba.value.origin || 'Ternak Sendiri'}
                      onUpdate:modelValue={(value: string) => newDomba.value.origin = value}
                    />
                  </div>
                  <div class="col-6">
                    <label class="pencatatan-label">Induk Jantan (Sire) — Opsional</label>
                    <CustomSelect
                      options={['— Tidak Diketahui —', ...sheep.value.filter(sheepItem => sheepItem.gender === 'jantan').map(sheepItem => `${sheepItem.code} — ${sheepItem.name}`)]}
                      modelValue={newDomba.value.id_sire ? (sheep.value.find(sheepItem => sheepItem.id === newDomba.value.id_sire)?.code + ' — ' + sheep.value.find(sheepItem => sheepItem.id === newDomba.value.id_sire)?.name) : '— Tidak Diketahui —'}
                      onUpdate:modelValue={(value: string) => {
                        const found = sheep.value.find(sheepItem => value.startsWith(sheepItem.code));
                        newDomba.value.id_sire = found ? found.id : '';
                      }}
                    />
                  </div>
                  <div class="col-6">
                    <label class="pencatatan-label">Induk Betina (Dam) — Opsional</label>
                    <CustomSelect
                      options={['— Tidak Diketahui —', ...sheep.value.filter(sheepItem => sheepItem.gender === 'betina').map(sheepItem => `${sheepItem.code} — ${sheepItem.name}`)]}
                      modelValue={newDomba.value.id_dam ? (sheep.value.find(sheepItem => sheepItem.id === newDomba.value.id_dam)?.code + ' — ' + sheep.value.find(sheepItem => sheepItem.id === newDomba.value.id_dam)?.name) : '— Tidak Diketahui —'}
                      onUpdate:modelValue={(value: string) => {
                        const found = sheep.value.find(sheepItem => value.startsWith(sheepItem.code));
                        newDomba.value.id_dam = found ? found.id : '';
                      }}
                    />
                  </div>
                </div>

                <div class="mt-4 pt-3 border-top border-light d-flex gap-3">
                  <button class="btn btn-light grow fw-bold py-2 rounded-pill" onClick={() => isAddModalOpen.value = false} disabled={isLoading.value}>Batal</button>
                  <button class="peternakan-primary-btn grow m-0 justify-content-center" onClick={handleAddDomba} disabled={isLoading.value}>{isLoading.value ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
});
