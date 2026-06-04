import { defineComponent, ref, computed, onMounted, type PropType } from 'vue';
import Typography from '@/shared/ui/Typography';
import StatCard from '@/shared/ui/StatCard';
import Badge from '@/shared/ui/Badge';
import { userSession, cageSession, selectedTernakId, cagesList, fetchCagesList } from '@/store/navigation';
import { sheep, fetchSheep, weightRecords, fetchWeightRecords } from '@/store/livestock';
import { fetchTasks, operatorTasks, tasksLoading, completeTask } from '@/store/operatorAdmin';

export default defineComponent({
  name: 'DasborView',
  props: {
    onGoToPencatatan: { type: Function as PropType<() => void>, default: null },
  },
  setup(props) {
    const search = ref('');
    const filterStatus = ref('');
    const selectedTaskId = ref<string | null>(null);

    const activeCageCode = computed(() => cageSession.value?.code || '');

    onMounted(async () => {
      await fetchCagesList();
      await Promise.all([
        fetchSheep(),
        fetchWeightRecords(),
        fetchTasks(new Date().toISOString().split('T')[0]),
      ]);
    });

    const cageInfo = computed(() => {
      return cagesList.value.find(c => c.code === activeCageCode.value) || null;
    });

    const cageInventory = computed(() =>
      sheep.value.filter(t => t.cage_code === activeCageCode.value),
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
      const cageSheepIds = new Set(
        sheep.value.filter(s => s.cage_code === activeCageCode.value).map(s => s.id),
      );
      const monthly: Record<string, { total: number; count: number }> = {};
      for (const w of weightRecords.value) {
        if (!cageSheepIds.has(w.sheep_id)) continue;
        const d = new Date(w.date);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthly[monthKey]) monthly[monthKey] = { total: 0, count: 0 };
        monthly[monthKey]!.total += w.weight;
        monthly[monthKey]!.count += 1;
      }
      return Object.entries(monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-5)
        .map(([key, v]) => ({
          month: new Date(key + '-01').toLocaleDateString('id-ID', { month: 'short' }),
          weight: v.count > 0 ? Math.round((v.total / v.count) * 10) / 10 : 0,
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
      const pts = points.value;
      if (pts.length === 0) return '0 kg';
      const lastPoint = pts[pts.length - 1];
      return lastPoint ? `${lastPoint.value.toFixed(1)} kg` : '0 kg';
    });

    const weightGrowthString = computed(() => {
      const pts = points.value;
      if (pts.length < 2) return '+0 kg';
      const first = pts[0]!.value;
      const last = pts[pts.length - 1]!.value;
      const diff = last - first;
      const pct = first > 0 ? (diff / first) * 100 : 0;
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

    const totalAnimals = computed(() => cageInventory.value.length);
    const healthyAnimals = computed(() => cageInventory.value.filter(t => t.status === 'Sehat').length);
    const attentionAnimals = computed(() => cageInventory.value.filter(t => t.status === 'Sakit' || t.status === 'Hamil').length);
    const taskDone = computed(() => operatorTasks.value.filter(t => t.status === 'selesai').length);

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
              value={tasksLoading.value ? '...' : `${taskDone.value}/${operatorTasks.value.length}`}
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
              <div class="d-flex align-items-center justify-content-between mb-4 gap-3">
                <div>
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <img src="/icon/notification-active.png" alt="Task" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                    <Typography variant="h4" weight="extrabold" className="m-0">Tugas Rutin Peternakan</Typography>
                  </div>
                  <Typography variant="p" size="text-xs" color="secondary" className="m-0">Klik kartu tugas untuk melihat detail dan panduan kerja.</Typography>
                </div>
                <Badge variant="primary" className="px-3 py-1.5" style={{ fontSize: '0.65rem' }}>Hari Ini</Badge>
              </div>

              {tasksLoading.value ? (
                <div class="text-center py-4 text-secondary" style={{ fontSize: '0.85rem' }}>Memuat tugas...</div>
              ) : operatorTasks.value.length === 0 ? (
                <div class="text-center py-4 text-secondary" style={{ fontSize: '0.85rem' }}>Belum ada tugas hari ini</div>
              ) : (
                <div class="d-flex flex-column gap-3">
                  {operatorTasks.value.map(task => (
                    <button
                      key={task.id}
                      type="button"
                      class={['d-flex align-items-center gap-3 p-3 w-100 text-start routine-task-btn', task.status === 'selesai' ? 'completed' : '']}
                      style={{ borderLeftWidth: '4px', borderLeftStyle: 'solid', borderLeftColor: task.status === 'selesai' ? '#606c38' : 'var(--color-primary)' }}
                      onClick={() => openTaskDetail(task.id)}
                    >
                      <div class="rounded-4 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', backgroundColor: 'var(--color-primary-fixed)' }}>
                        <img src={CATEGORY_ICONS[task.category] || '/icon/catat_jenis.png'} alt="Task" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                      </div>
                      <div class="flex-grow-1 min-w-0">
                        <Typography variant="p" size="text-sm" weight="extrabold" className="mb-0 d-block text-truncate text-on-surface">
                          {task.title}
                        </Typography>
                        <div class="d-flex align-items-center gap-2 flex-wrap mt-1">
                          {task.dueTime && (
                            <Typography variant="span" style={{ fontSize: '0.65rem' }} weight="bold" className="text-secondary">
                              ⏱️ {task.dueTime} WIB
                            </Typography>
                          )}
                          <Typography variant="span" style={{ fontSize: '0.65rem' }} weight="bold" className="text-secondary">
                            • Prioritas: {task.priority}
                          </Typography>
                        </div>
                      </div>
                      <div class="d-flex align-items-center gap-2">
                        <Badge variant={task.status === 'selesai' ? 'success' : 'secondary'} className="px-3 py-2">
                          {task.status === 'selesai' ? 'Selesai' : 'Detail'}
                        </Badge>
                        <img src="/icon/right-row.png" alt="Detail" style={{ width: '18px', height: '18px', objectFit: 'contain', opacity: 0.75 }} />
                      </div>
                    </button>
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
                <div class="text-center py-5 text-secondary" style={{ fontSize: '0.85rem' }}>
                  <img src="/icon/statistic.png" style={{ width: '40px', opacity: 0.3, marginBottom: '0.75rem' }} alt="" />
                  <p class="m-0">Belum ada data berat badan tercatat</p>
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

        {/* Daftar Ternak dari BE */}
        <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5">
          <div class="mb-4">
            <div class="d-flex align-items-center gap-2 mb-1">
              <img src="/icon/domba.png" alt="Domba" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              <Typography variant="h4" weight="extrabold" className="m-0">Daftar Ternak Kandang {activeCageCode.value || '—'}</Typography>
            </div>
            <Typography variant="p" size="text-xs" color="secondary" className="d-block mb-3">Klik ternak untuk masuk ke detail dan pencatatan terkait</Typography>

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
                    <Typography variant="h4" weight="extrabold" className="m-0">{selectedTask.value.title}</Typography>
                    <Typography variant="p" size="text-xs" color="secondary" className="m-0">
                      Prioritas: {selectedTask.value.priority}
                      {selectedTask.value.dueTime ? ` • Jam ${selectedTask.value.dueTime} WIB` : ''}
                    </Typography>
                  </div>
                  <Badge variant={selectedTask.value.status === 'selesai' ? 'success' : 'warning'} className="px-3 py-2">
                    {selectedTask.value.status === 'selesai' ? 'Sudah Selesai' : 'Belum Selesai'}
                  </Badge>
                </div>

                {selectedTask.value.description && (
                  <div class="rounded-4 border p-4 mb-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <Typography variant="span" size="text-xs" className="text-secondary text-uppercase fw-bold d-block mb-2">Deskripsi Tugas</Typography>
                    <Typography variant="p" className="m-0" size="text-sm">{selectedTask.value.description}</Typography>
                  </div>
                )}

                <div class="d-flex flex-column flex-sm-row gap-3 justify-content-end">
                  <button class="btn btn-light rounded-pill px-4 py-3 fw-bold" onClick={closeTaskModal}>Tutup</button>
                  {selectedTask.value.status !== 'selesai' && (
                    <button
                      class="btn rounded-pill px-4 py-3 fw-bold text-white border-0"
                      style={{ backgroundColor: 'var(--color-secondary)' }}
                      onClick={() => { handleCompleteTask(selectedTask.value!.id); closeTaskModal(); }}
                    >
                      Tandai Selesai
                    </button>
                  )}
                  <button
                    class="btn rounded-pill px-4 py-3 fw-bold text-white border-0"
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
      </div>
    );
  }
});
