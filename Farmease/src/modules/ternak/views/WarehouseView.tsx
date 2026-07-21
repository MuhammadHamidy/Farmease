import { defineComponent, ref, computed, onMounted, Teleport } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import CustomInput from '@/shared/ui/Input';
import CustomSelect from '@/shared/ui/admin/Select';
import Button from '@/shared/ui/Button';
import PencatatanField from '@/modules/ternak/components/pencatatan/PencatatanField';
import PencatatanInput from '@/modules/ternak/components/pencatatan/PencatatanInput';
import PencatatanTextarea from '@/modules/ternak/components/pencatatan/PencatatanTextarea';
import { feedsApi, fermentationsApi } from '@/shared/api';
import { stocks, stocksLoading, fetchStocks } from '@/modules/ternak/store/peternakan';
import { sheep, fetchSheep } from '@/store/livestock';
import CustomAlertModal from '@/shared/ui/CustomAlertModal';

export default defineComponent({
  name: 'WarehouseView',
  setup() {
    const activeTab = ref<'stok' | 'fermentasi'>('stok');
    const searchVal = ref('');
    const filterCategory = ref('Semua');
    const filterStatus = ref('Semua');

    const conversions = ref<any[]>([]);
    const conversionsLoading = ref(false);

    const loadConversions = async () => {
      try {
        conversionsLoading.value = true;
        conversions.value = (await feedsApi.getSilageConversions()) || [];
      } catch (err) {
        console.error('Gagal memuat riwayat konversi/fermentasi:', err);
      } finally {
        conversionsLoading.value = false;
      }
    };

    const showLogModal = ref(false);
    const selectedConv = ref<any>(null);
    const formLog = ref({
      status: '',
      ph_level: '4.0',
      temperature: '30.0',
      physical_condition: '',
      notes: '',
    });
    const convLogs = ref<any[]>([]);
    const logsLoading = ref(false);

    const openLogModal = async (conv: any) => {
      selectedConv.value = conv;
      formLog.value = {
        status: '',
        ph_level: '4.0',
        temperature: '30.0',
        physical_condition: '',
        notes: '',
      };
      showLogModal.value = true;
      
      try {
        logsLoading.value = true;
        convLogs.value = await fermentationsApi.getLogs(conv.id_conversion);
      } catch (err) {
        console.error('Gagal memuat log:', err);
      } finally {
        logsLoading.value = false;
      }
    };

    const alertModal = ref({
      isOpen: false,
      title: '',
      message: '',
      type: 'success' as 'success' | 'error',
    });

    const closeAlertModal = () => {
      alertModal.value.isOpen = false;
    };

    const triggerAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
      alertModal.value = {
        isOpen: true,
        title,
        message,
        type,
      };
    };

    const submitLog = async () => {
      if (!selectedConv.value) return;
      if (!formLog.value.status) {
        triggerAlert('Form Tidak Lengkap', 'Status kesiapan silase wajib dipilih', 'error');
        return;
      }
      try {
        const ph = parseFloat(formLog.value.ph_level);
        const temp = parseFloat(formLog.value.temperature);
        await fermentationsApi.createLog(selectedConv.value.id_conversion, {
          status: formLog.value.status,
          ph_level: isNaN(ph) ? null : ph,
          temperature: isNaN(temp) ? null : temp,
          physical_condition: formLog.value.physical_condition || null,
          notes: formLog.value.physical_condition || null,
        });

        // Jika statusnya siap, tambahkan ke stok pakan utama secara otomatis
        if (formLog.value.status === 'siap') {
          try {
            const targetName = selectedConv.value.target_feed_name;
            const targetAmount = Number(selectedConv.value.target_amount) || 0;
            const unit = selectedConv.value.unit || 'kg';
            
            // Cek apakah pakan dengan nama tersebut sudah ada di stok
            const existingFeed = stocks.value.find(s => s.name.toLowerCase() === targetName.toLowerCase());
            
            if (existingFeed) {
              await feedsApi.updateStock(existingFeed.id, targetAmount, 'tambah')
                .catch(() => feedsApi.updateStok(existingFeed.id, targetAmount, 'tambah'));
            } else {
              await feedsApi.create({
                feed_name: targetName,
                feed_type: 'Silase',
                stock: targetAmount,
                unit: unit
              });
            }
            triggerAlert('Berhasil', 'Status silase berhasil diubah menjadi Siap dan stok pakan telah ditambahkan.');
          } catch (feedErr) {
            console.error('Gagal menambahkan ke stok pakan otomatis:', feedErr);
            triggerAlert('Sebagian Berhasil', 'Status silase berhasil diubah, namun terjadi kesalahan saat menambah stok pakan secara otomatis.', 'error');
          }
        } else {
          triggerAlert('Berhasil', 'Log progres fermentasi berhasil disimpan.');
        }

        showLogModal.value = false;
        await loadConversions();
        await fetchStocks();
      } catch (err) {
        triggerAlert('Gagal Menyimpan', 'Gagal menyimpan log fermentasi.', 'error');
      }
    };

    onMounted(() => {
      fetchStocks();
      loadConversions();
      fetchSheep();
    });

    const hasCriticalStock = computed(() => {
      return stocks.value.some(s => (s.category || '').toLowerCase() === 'konsentrat' && Number(s.qty || 0) < 100.0);
    });

    const getStockAdequacyDays = (stockItem: any) => {
      const activeSheepCount = sheep.value.filter(s => !['Mati', 'Terjual', 'Disembelih'].includes(s.status)).length;
      if (activeSheepCount === 0) return { days: 0, consumptionPerDay: 0, text: '—' };
      
      const safeQty = Number(stockItem.qty || 0);
      if (safeQty <= 0) return { days: 0, consumptionPerDay: 0, text: 'Stok Habis' };

      const category = (stockItem.category || '').toLowerCase();
      let consumptionPerSheep = 0.5; // default fallback
      if (category === 'hijauan' || category === 'greenery' || category === 'silase') {
        consumptionPerSheep = 3.0; // 3 kg / day
      } else if (category === 'konsentrat') {
        consumptionPerSheep = 0.75; // 0.75 kg / day
      } else if (category === 'vitamin' || category === 'suplemen' || category === 'obat') {
        consumptionPerSheep = 0.02; // 0.02 kg / day
      }

      const totalDaily = consumptionPerSheep * activeSheepCount;
      const days = safeQty / totalDaily;
      return {
        days: Math.floor(days),
        consumptionPerDay: totalDaily,
        text: days >= 1 ? `${Math.floor(days)} Hari` : '< 1 Hari'
      };
    };

    const categories = computed<string[]>(() => {
      // Normalise: 'greenery' is the same as 'hijauan' — merge them
      const cats = new Set(
        stocks.value
          .map(s => (s.category || '').toLowerCase() === 'greenery' ? 'hijauan' : s.category)
          .filter((c): c is string => !!c)
      );
      return ['Semua', ...Array.from(cats)];
    });

    // Filtering stocks
    const filteredStocks = computed(() => {
      let list = stocks.value;
      if (searchVal.value) {
        const query = searchVal.value.toLowerCase();
        list = list.filter(s => s.name.toLowerCase().includes(query) || (s.notes && s.notes.toLowerCase().includes(query)));
      }
      if (filterCategory.value !== 'Semua') {
        list = list.filter(s => {
          // Treat 'greenery' as 'hijauan' for filtering purposes
          const cat = (s.category || '').toLowerCase() === 'greenery' ? 'hijauan' : s.category;
          return cat === filterCategory.value;
        });
      }
      return list;
    });

    // Helper for calculating fermentation progress
    const getFermentationInfo = (convDateStr: string) => {
      const startDate = new Date(convDateStr);
      const diffTime = Date.now() - startDate.getTime();
      const elapsedDays = Math.max(Math.floor(diffTime / (1000 * 60 * 60 * 24)), 0);
      const progress = Math.min(Math.max(Math.round((elapsedDays / 21) * 100), 0), 100);
      const isReady = progress >= 100;
      return { elapsedDays, progress, isReady };
    };

    // Filtering conversions
    const filteredConversions = computed(() => {
      let list = conversions.value || [];
      if (searchVal.value) {
        const query = searchVal.value.toLowerCase();
        list = list.filter(c => (c.target_feed_name || '').toLowerCase().includes(query) || (c.notes && c.notes.toLowerCase().includes(query)));
      }
      if (filterStatus.value !== 'Semua') {
        list = list.filter(c => {
          if (filterStatus.value === 'Selesai') {
            return c.status === 'siap' || c.status === 'gagal';
          } else {
            return c.status === 'fermentasi';
          }
        });
      }
      return list;
    });

    const getCategoryColor = (cat?: string) => {
      const c = (cat || '').toLowerCase();
      if (c === 'hijauan' || c === 'greenery' || c === 'silase') return '#606c38';
      if (c === 'konsentrat') return '#c19a6b';
      if (c === 'vitamin' || c === 'suplemen') return '#8B5E3C';
      if (c === 'pellet') return '#8a7563';
      return '#7a6f65';
    };

    const getCategoryBg = (cat?: string) => {
      const c = (cat || '').toLowerCase();
      if (c === 'hijauan' || c === 'greenery' || c === 'silase') return 'rgba(96, 108, 56, 0.1)';
      if (c === 'konsentrat') return 'rgba(193, 154, 107, 0.12)';
      if (c === 'vitamin' || c === 'suplemen') return 'rgba(139, 94, 60, 0.1)';
      if (c === 'pellet') return 'rgba(138, 117, 99, 0.1)';
      return '#ede8e0';
    };

    return () => (
      <div class="animate-fade-in text-start">
        {/* Critical Stock Alert Banner */}
        {hasCriticalStock.value && (
          <div class="alert alert-danger rounded-4 border-0 p-3 mb-4 d-flex align-items-center gap-3 animate-fade-in" style={{ backgroundColor: 'rgba(186, 26, 26, 0.08)', border: '1.5px solid var(--color-danger, #ba1a1a)' }}>
            <span style={{ fontSize: '1.5rem' }}>🚨</span>
            <div class="flex-grow-1 text-start">
              <strong class="text-danger d-block" style={{ fontSize: '0.9rem' }}>ALARM: Stok Pakan Kritis Terdeteksi!</strong>
              <span class="text-secondary small">Stok pakan kategori Konsentrat berada di bawah ambang batas minimum aman (100 kg). Harap segera lakukan pengisian stok di gudang.</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4 py-2 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2">
              <img src="/icon/inventory.png" alt="Gudang" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
              <Typography variant="h3" weight="extrabold" className="m-0 text-almond-beige">Gudang Logistik & Stok Pakan</Typography>
            </div>
            <Typography variant="p" size="text-xs" color="secondary" className="m-0">
              Kelola inventaris pakan ternak, sumber nutrisi tambahan, dan pantau progres fermentasi pakan silase
            </Typography>
          </div>
        </div>

        {/* Tab Selection - Pill Style */}
        <div class="d-flex p-1 bg-light rounded-pill mb-4 d-inline-flex" style={{ border: '1px solid #ede8e0' }}>
          <button
            class={`btn rounded-pill px-4 fw-bold ${activeTab.value === 'stok' ? 'shadow-sm' : ''}`}
            style={{
              backgroundColor: activeTab.value === 'stok' ? '#8B5E3C' : 'transparent',
              color: activeTab.value === 'stok' ? '#FFFFFF' : '#7a6f65',
              transition: 'all 0.2s ease',
              border: 'none',
            }}
            onClick={() => { activeTab.value = 'stok'; searchVal.value = ''; }}
          >
            Stok Pakan & Bahan
          </button>
          <button
            class={`btn rounded-pill px-4 fw-bold ${activeTab.value === 'fermentasi' ? 'shadow-sm' : ''}`}
            style={{
              backgroundColor: activeTab.value === 'fermentasi' ? '#8B5E3C' : 'transparent',
              color: activeTab.value === 'fermentasi' ? '#FFFFFF' : '#7a6f65',
              transition: 'all 0.2s ease',
              border: 'none',
            }}
            onClick={() => { activeTab.value = 'fermentasi'; searchVal.value = ''; }}
          >
            Progres Fermentasi
          </button>
        </div>

        {/* Filter Panel */}
        <div class="bg-white rounded-4 shadow-sm border p-3 mb-4" style={{ borderColor: '#ede8e0' }}>
          <div class="row g-3 align-items-end">
            <div class="col-12 col-md-7">
              <label class="form-label text-secondary small fw-bold mb-1">Pencarian</label>
              <CustomInput
                modelValue={searchVal.value}
                onUpdate:modelValue={(val: string) => searchVal.value = val}
                placeholder={activeTab.value === 'stok' ? "Cari nama pakan..." : "Cari nama target silase..."}
                icon={() => (
                  <img src="/icon/search.png" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                )}
              />
            </div>
            {activeTab.value === 'stok' ? (
              <div class="col-12 col-md-5">
                <label class="form-label text-secondary small fw-bold mb-1">Kategori</label>
                <CustomSelect 
                  options={categories.value}
                  modelValue={filterCategory.value} 
                  onUpdate:modelValue={(val: string) => { filterCategory.value = val; }}
                />
              </div>
            ) : (
              <div class="col-12 col-md-5">
                <label class="form-label text-secondary small fw-bold mb-1">Status</label>
                <CustomSelect 
                  options={['Semua', 'Dalam Progres', 'Selesai']}
                  modelValue={filterStatus.value} 
                  onUpdate:modelValue={(val: string) => { filterStatus.value = val; }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Content Render */}
        {activeTab.value === 'stok' ? (
          <div>
            {stocksLoading.value ? (
              <div class="text-center py-5 text-secondary">
                <div class="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
                <span>Memuat stok pakan...</span>
              </div>
            ) : filteredStocks.value.length === 0 ? (
              <div class="bg-white rounded-5 border p-5 text-center text-muted">
                <img src="/icon/inventory.png" alt="Empty" style={{ width: '48px', opacity: 0.4, filter: 'grayscale(1)', marginBottom: '1rem' }} />
                <div class="fw-bold">Tidak ada pakan di gudang yang sesuai filter.</div>
              </div>
            ) : (
              <div class="row g-3">
                {filteredStocks.value.map(s => {
                  const safeQty = Number(s.qty || 0);
                  const isLow = safeQty <= 50;
                  const maxCap = 500;
                  const percent = Math.min((safeQty / maxCap) * 100, 100);
                  return (
                  <div class="col-12 col-md-6 col-lg-4" key={s.id}>
                    <div class="card shadow-sm border-0 h-100" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                      <div class="card-body p-4 d-flex flex-column justify-content-between h-100">
                        {/* Top: Category & Name */}
                        <div class="mb-3">
                          <span class="badge rounded-pill fw-normal mb-2 align-self-start" style={{ backgroundColor: getCategoryBg(s.category), color: getCategoryColor(s.category) }}>
                            {s.category || 'Umum'}
                          </span>
                          <h5 class="fw-bold text-dark m-0 text-truncate" style={{ fontSize: '1.15rem' }} title={s.name}>{s.name}</h5>
                        </div>
                        
                        {/* Middle: Progress Bar */}
                        <div class="mb-4">
                          <div class="d-flex justify-content-between mb-1">
                            <span class="text-muted small">Kapasitas Gudang</span>
                            <span class="fw-bold text-dark small">{safeQty.toFixed(1)} / {maxCap} {s.unit}</span>
                          </div>
                          <div class="progress" style={{ height: '8px', borderRadius: '4px', backgroundColor: '#e9ecef' }}>
                            <div 
                              class="progress-bar" 
                              role="progressbar" 
                              style={{ 
                                width: `${percent}%`, 
                                backgroundColor: isLow ? '#ba1a1a' : '#4c5c36',
                                transition: 'width 0.5s ease'
                              }} 
                              aria-valuenow={percent} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </div>

                        {/* Adequacy Projection Box */}
                        <div class="mb-4 p-3 rounded-4 border text-start" style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D9CE', fontSize: '0.82rem' }}>
                          <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="text-secondary fw-semibold">Proyeksi Kecukupan:</span>
                            <span class={['fw-bold', safeQty <= 0 ? 'text-danger' : (isLow ? 'text-warning' : 'text-success')]}>
                              {getStockAdequacyDays(s).text}
                            </span>
                          </div>
                          <div class="text-muted small">
                            Estimasi konsumsi: {getStockAdequacyDays(s).consumptionPerDay.toFixed(1)} kg / hari ({sheep.value.filter(x => !['Mati', 'Terjual', 'Disembelih'].includes(x.status)).length} ekor)
                          </div>
                        </div>

                        {/* Bottom: Stock Info & Status */}
                        <div class="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                          <div>
                            <span class="text-muted d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>STOK TERSEDIA</span>
                            <div class="d-flex align-items-baseline gap-1">
                              <span class="fw-extrabold text-dark" style={{ fontSize: '1.4rem', lineHeight: '1' }}>{safeQty.toFixed(1)}</span>
                              <span class="text-secondary fw-bold small">{s.unit}</span>
                            </div>
                          </div>
                          <span class={`badge ${safeQty <= 0 ? 'bg-danger text-white' : (isLow ? 'bg-danger bg-opacity-10 text-danger border border-danger-subtle' : 'bg-success bg-opacity-10 text-success border border-success-subtle')} rounded-pill px-3 py-2 fw-bold`}>
                            {safeQty <= 0 ? 'Stok Habis' : (isLow ? 'Hampir Habis' : 'Stok Aman')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        ) : (
          <div>
            {conversionsLoading.value ? (
              <div class="text-center py-5 text-secondary">
                <div class="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
                <span>Memuat progres fermentasi...</span>
              </div>
            ) : filteredConversions.value.length === 0 ? (
              <div class="bg-white rounded-5 border p-5 text-center text-muted">
                <img src="/icon/wait.png" alt="Empty" style={{ width: '48px', opacity: 0.4, filter: 'grayscale(1)', marginBottom: '1rem' }} />
                <div class="fw-bold">Tidak ada progres fermentasi silase saat ini.</div>
              </div>
            ) : (
              <div class="row g-3">
                {filteredConversions.value.map(c => {
                  const info = getFermentationInfo(c.conversion_date);
                  const isSiap = c.status === 'siap';
                  const isGagal = c.status === 'gagal';
                  const isProses = c.status === 'fermentasi' || !c.status;
                  
                  const borderCol = isSiap ? '#606c38' : (isGagal ? '#ba1a1a' : '#8B5E3C');
                  const badgeBg = isSiap ? 'rgba(96, 108, 56, 0.1)' : (isGagal ? 'rgba(186, 26, 26, 0.1)' : 'rgba(139, 94, 60, 0.1)');
                  const badgeTextCol = isSiap ? '#606c38' : (isGagal ? '#ba1a1a' : '#8B5E3C');
                  const badgeBorder = isSiap ? 'rgba(96, 108, 56, 0.2)' : (isGagal ? 'rgba(186, 26, 26, 0.2)' : 'rgba(139, 94, 60, 0.2)');
                  
                  const badgeText = isSiap 
                    ? 'Selesai & Siap' 
                    : (isGagal ? 'Fermentasi Gagal' : `Proses Berjalan`);

                  return (
                    <div class="col-12 col-lg-6" key={c.id_conversion}>
                      <div class="card shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: `6px solid ${borderCol}` }}>
                        <div class="card-body p-3 p-md-4 d-flex flex-column h-100">
                          <div class="row align-items-center mb-3">
                            <div class="col-12 col-md-6 mb-3 mb-md-0">
                              <h5 class="fw-bold text-dark mb-1">{c.target_feed_name || 'Silase (Nama Pakan Tidak Diketahui)'}</h5>
                              <span class="text-secondary small d-block">
                                Mulai: {new Date(c.conversion_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                            <div class="col-12 col-md-6 text-md-end">
                              <span 
                                class="badge px-3 py-2 rounded-pill fw-bold"
                                style={{ backgroundColor: badgeBg, color: badgeTextCol, border: `1px solid ${badgeBorder}` }}
                              >
                                {badgeText}
                              </span>
                            </div>
                          </div>

                          {!isGagal && !isSiap && (
                            <div class="mb-3 bg-light p-3 rounded-4 border" style={{ borderColor: '#ede8e0' }}>
                              <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-bold text-dark">Hari ke-{info.elapsedDays}</span>
                                <span class="text-secondary small">dari target 21 Hari</span>
                              </div>
                              <div class="progress" style={{ height: '8px', borderRadius: '4px', backgroundColor: '#ede8e0' }}>
                                <div 
                                  class="progress-bar" 
                                  role="progressbar" 
                                  style={{ width: `${info.progress}%`, backgroundColor: '#8B5E3C' }} 
                                  aria-valuenow={info.progress} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                ></div>
                              </div>
                            </div>
                          )}

                          <div class="p-3 rounded-4 bg-light border mb-3" style={{ borderColor: '#ede8e0' }}>
                            <div class="fw-bold text-dark mb-2 small d-flex justify-content-between align-items-center">
                              <span>Komposisi Bahan</span>
                              <span class="text-secondary">Target: <strong style={{ color: '#8B5E3C' }}>{c.target_amount.toFixed(2)} {c.unit}</strong></span>
                            </div>
                            <ul class="list-unstyled m-0 p-0 d-flex flex-column gap-2">
                              {(c.details || []).map((det: any, index: number, arr: any[]) => (
                                <li 
                                  key={det.id_detail} 
                                  class="d-flex align-items-center justify-content-between py-1"
                                  style={{ 
                                    fontSize: '0.85rem', 
                                    borderBottom: index < arr.length - 1 ? '1px dashed #e5dfd5' : 'none' 
                                  }}
                                >
                                  <span class="text-secondary d-flex align-items-center gap-2">
                                    <span style={{ color: '#8B5E3C', fontSize: '1.1rem', lineHeight: '1' }}>•</span>
                                    {det.feed_name}
                                  </span>
                                  <span class="fw-bold text-dark">{det.amount.toFixed(2)} {c.unit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div class="d-flex justify-content-end mt-auto pt-3 border-top">
                            <button
                              class="btn fw-bold px-4 rounded-pill"
                              style={{ backgroundColor: isProses ? '#8B5E3C' : '#ede8e0', color: isProses ? '#fff' : '#8B5E3C' }}
                              onClick={() => openLogModal(c)}
                            >
                              {isProses ? 'Update Progres' : 'Lihat Riwayat'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Fermentation Logs Modal */}
        {showLogModal.value && selectedConv.value && (
          <Teleport to="body">
            <div class="peternakan-modal-overlay" style={{ zIndex: 1050 }} onClick={() => { showLogModal.value = false; }}>
              <div class="peternakan-modal-card animate-fade-in-up" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
              <div class="peternakan-modal-header">
                <button type="button" class="peternakan-modal-close" onClick={() => { showLogModal.value = false; }}>
                  <img src="/icon/close-cancel/grey-24.svg" alt="Tutup" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                </button>
                <div class="peternakan-modal-title">Kelola Fermentasi: {selectedConv.value.target_feed_name || 'Silase'}</div>
              </div>
              <div class="peternakan-modal-body py-2">
                <div class="row g-4">
                  {/* Input Form Column */}
                  {selectedConv.value.status === 'fermentasi' ? (
                    <div class="col-12 text-start">
                      <h6 class="fw-bold mb-4 text-dark border-bottom pb-2">Catat Pengecekan Baru</h6>
                      <div class="d-flex flex-column gap-3">
                        <PencatatanField label="Tingkat Keasaman (pH)">
                          <PencatatanInput
                            type="number"
                            placeholder="Contoh: 4.0"
                            modelValue={formLog.value.ph_level}
                            onUpdateModelValue={(v: string) => { formLog.value.ph_level = v; }}
                          />
                          <span class="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>pH ideal silase berkualitas: 3.8 - 4.2</span>
                        </PencatatanField>
                        <PencatatanField label="Suhu Wadah (°C)">
                          <PencatatanInput
                            type="number"
                            placeholder="Contoh: 30.0"
                            modelValue={formLog.value.temperature}
                            onUpdateModelValue={(v: string) => { formLog.value.temperature = v; }}
                          />
                          <span class="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>Suhu ideal wadah silase: 25 - 30 °C</span>
                        </PencatatanField>
                        <PencatatanField label="Catatan">
                          <PencatatanTextarea
                            rows={3}
                            placeholder="Contoh: aroma, warna, dan tekstur."
                            modelValue={formLog.value.physical_condition}
                            onUpdateModelValue={(v: string) => { formLog.value.physical_condition = v; }}
                          />
                        </PencatatanField>
                        
                        <PencatatanField label="Status Kesiapan Pakan">
                          <div class="row g-2">
                            {(() => {
                              const renderStatusOption = (val: string, label: string) => {
                                const isSelected = formLog.value.status === val;
                                return (
                                  <div class="col-12 col-md-4" key={val}>
                                    <label
                                      class={`d-flex flex-column align-items-center justify-content-center gap-2 p-3 rounded-3 cursor-pointer h-100 border m-0 ${isSelected ? '' : 'border-light-subtle bg-light'}`}
                                      style={{ transition: 'all 0.2s ease', borderColor: isSelected ? '#8B5E3C' : '', backgroundColor: isSelected ? 'rgba(139, 94, 60, 0.1)' : '' }}
                                      onClick={(e) => { e.preventDefault(); formLog.value = { ...formLog.value, status: val }; }}
                                    >
                                      <input 
                                        type="radio" 
                                        class="d-none" 
                                        name="status_fermentasi" 
                                        value={val} 
                                        checked={isSelected} 
                                        onChange={() => { formLog.value = { ...formLog.value, status: val }; }}
                                      />
                                      <div
                                        class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: '20px', height: '20px', border: `2px solid ${isSelected ? '#8B5E3C' : '#adb5bd'}` }}
                                      >
                                        {isSelected && <div class="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#8B5E3C' }} />}
                                      </div>
                                      <span class={`fw-medium text-center ${isSelected ? 'fw-bold' : 'text-dark'}`} style={{ fontSize: '0.9rem', color: isSelected ? '#8B5E3C' : '' }}>
                                        {label}
                                      </span>
                                    </label>
                                  </div>
                                );
                              };
                              return (
                                <>
                                  {renderStatusOption('fermentasi', 'Masih Proses Fermentasi')}
                                  {renderStatusOption('siap', 'Selesai (Siap Disajikan)')}
                                  {renderStatusOption('gagal', 'Gagal (Buang)')}
                                </>
                              );
                            })()}
                          </div>
                        </PencatatanField>
                      </div>
                    </div>
                  ) : (
                    <div class="col-12 d-flex flex-column align-items-center justify-content-center py-5 text-center bg-light rounded-4">
                      <div class="text-secondary mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-lock" viewBox="0 0 16 16">
                          <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
                        </svg>
                      </div>
                      <div class="fw-bold fs-5 text-dark">Fermentasi Selesai</div>
                      <div class="mt-2">
                        Status akhir: <span class={`badge ${selectedConv.value.status === 'siap' ? 'bg-success' : 'bg-danger'}`}>{selectedConv.value.status === 'siap' ? 'Berhasil' : 'Gagal'}</span>
                      </div>
                    </div>
                  )}

                  {/* History Logs Row */}
                  <div class="col-12 mt-4 pt-4 border-top">
                    <h6 class="fw-bold mb-4 text-dark border-bottom pb-2">Riwayat Pengecekan</h6>
                    {logsLoading.value ? (
                      <div class="text-center py-4 text-muted small">Memuat riwayat...</div>
                    ) : convLogs.value.length === 0 ? (
                      <div class="text-center py-4 text-muted small bg-light rounded-3">Belum ada riwayat pengecekan.</div>
                    ) : (
                      <div class="row g-3">
                        {convLogs.value.map(log => (
                          <div class="col-12 col-md-6" key={log.id_log}>
                            <div class="p-3 rounded-3 border bg-white shadow-sm h-100">
                              <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                <span class="fw-bold text-dark small">{new Date(log.check_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                <span class={`badge ${log.status === 'siap' ? 'bg-success text-white' : (log.status === 'gagal' ? 'bg-danger text-white' : 'text-white')} fw-normal px-2 py-1`} style={{ backgroundColor: log.status === 'fermentasi' ? '#8B5E3C' : '' }}>
                                  {log.status === 'fermentasi' ? 'Proses' : (log.status === 'siap' ? 'Selesai' : 'Gagal')}
                                </span>
                              </div>
                              <div class="row g-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                {log.ph_level !== null && (
                                  <div class="col-6">
                                    <span>pH: </span><strong class="text-dark">{log.ph_level.toFixed(1)}</strong>
                                  </div>
                                )}
                                {log.temperature !== null && (
                                  <div class="col-6">
                                    <span>Suhu: </span><strong class="text-dark">{log.temperature.toFixed(1)} °C</strong>
                                  </div>
                                )}
                                {log.physical_condition && (
                                  <div class="col-12">
                                    <span>Kondisi Fisik: </span><span class="text-dark d-block">{log.physical_condition}</span>
                                  </div>
                                )}
                                {log.notes && (
                                  <div class="col-12 pt-1 mt-1">
                                    <span>Catatan: </span><span class="text-dark d-block">{log.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div class="modal-footer border-top mt-4 pt-3 gap-2 d-flex justify-content-end" style={{ borderTop: '1px solid #E6D9CE' }}>
                <button 
                  class="peternakan-secondary-btn px-4 py-2"
                  style={{
                    borderRadius: '9999px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    minWidth: '100px'
                  }}
                  onClick={() => { showLogModal.value = false; }}
                >
                  Tutup
                </button>
                {selectedConv.value.status === 'fermentasi' && (
                  <button 
                    class="peternakan-primary-btn px-4 py-2"
                    style={{
                      borderRadius: '9999px',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      minWidth: '110px'
                    }}
                    onClick={submitLog}
                  >
                    Simpan Log
                  </button>
                )}
              </div>
            </div>
          </div>
        </Teleport>
        )}
        <CustomAlertModal alert={alertModal.value} onClose={closeAlertModal} />
      </div>
    );
  },
});
