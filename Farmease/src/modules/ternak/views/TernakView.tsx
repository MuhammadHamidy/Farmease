import { defineComponent, ref, computed, onMounted } from 'vue';
import Typography from '@/shared/ui/Typography';
import CustomInput from '@/shared/ui/Input';
import CustomSelect from '@/shared/ui/Select';
import Badge, { type BadgeVariant } from '@/shared/ui/Badge';
import StatCard from '@/shared/ui/StatCard';
import { selectedTernakId, userSession, cageSession } from '@/store/navigation';
import { sheep, loading, error, fetchSheep, addSheep, sheepStats } from '@/store/livestock';

const statusColor: Record<string, BadgeVariant> = {
  Sehat: 'success',
  Hamil: 'warning',
  Sakit: 'danger',
};

export default defineComponent({
  name: 'TernakView',
  setup() {
    const search = ref('');
    const filterStatus = ref('');
    const isAddModalOpen = ref(false);
    const isLoading = ref(false);
    const newDomba = ref({ code: '', name: '', type: 'Garut', birth_date: '', gender: 'Jantan', status: 'Sehat' });
    const activeCageCode = computed(() => cageSession.value?.code || 'A');

    onMounted(() => {
      fetchSheep(activeCageCode.value);
    });

    const handleAddDomba = async () => {
      try {
        isLoading.value = true;
        await addSheep({
          code: newDomba.value.code,
          name: newDomba.value.name,
          type: newDomba.value.type,
          gender: newDomba.value.gender,
          birth_date: newDomba.value.birth_date,
          cage_code: activeCageCode.value,
          status: newDomba.value.status,
        });
        isAddModalOpen.value = false;
        newDomba.value = { code: '', name: '', type: 'Garut', birth_date: '', gender: 'Jantan', status: 'Sehat' };
      } catch (err) {
        console.error('Failed to add sheep:', err);
      } finally {
        isLoading.value = false;
      }
    };

    const filtered = computed(() => {
      const cageFilteredSheep = sheep.value.filter(s => s.cage_code === activeCageCode.value);
      return cageFilteredSheep.filter(t => {
        const q = search.value.toLowerCase();
        const matchSearch = !q || t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.type.toLowerCase().includes(q);
        const matchStatus = !filterStatus.value || t.status === filterStatus.value;
        return matchSearch && matchStatus;
      });
    });

    const cageStats = computed(() => {
      const cageFilteredSheep = sheep.value.filter(s => s.cage_code === activeCageCode.value);
      return {
        total: cageFilteredSheep.length,
        healthy: cageFilteredSheep.filter(t => t.status === 'Sehat').length,
        alert: cageFilteredSheep.filter(t => t.status === 'Sakit' || t.status === 'Hamil').length,
        cage: activeCageCode.value
      };
    });

    return () => (
      <div class="animate-fade-in-up">
        {loading.value && (
          <div class="alert alert-info mb-3" role="alert">
            <Typography variant="p" size="text-sm" className="m-0">Memuat data ternak...</Typography>
          </div>
        )}
        
        {error.value && (
          <div class="alert alert-danger mb-3" role="alert">
            <Typography variant="p" size="text-sm" className="m-0">{error.value}</Typography>
          </div>
        )}

        <div class="peternakan-title-card mb-4 text-start overflow-hidden">
          <div class="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-4 position-relative" style={{ zIndex: 1 }}>
            <div>
              <Typography variant="h3" weight="extrabold" className="m-0 text-white">Daftar Ternak & Kode Kandang</Typography>
              <Typography variant="p" className="m-0 text-white opacity-75" size="text-sm">
                Fokus ke kandang {cageStats.value.cage} dengan detail ternak, status, dan notifikasi yang lebih mudah dipantau.
              </Typography>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <Badge variant="success" className="px-3 py-2">{userSession.value?.name || 'Admin'}</Badge>
              <Badge variant="primary" className="px-3 py-2">Kandang {cageStats.value.cage}</Badge>
              <Badge variant="warning" className="px-3 py-2">{cageStats.value.total} ternak aktif</Badge>
            </div>
          </div>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-6 col-xl-3">
            <StatCard 
              label="Total Domba" 
              value={String(cageStats.value.total)} 
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
              value={String(cageStats.value.healthy)} 
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
              value={String(cageStats.value.alert)} 
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
              label="Kandang Aktif" 
              value={String(cageStats.value.cage)} 
              color="light" 
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              )}
            />
          </div>
        </div>

        <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5 mb-4">
          {/* Title & Subtitle Row with Add Button */}
          <div class="mb-4">
            <div class="d-flex align-items-center justify-content-between mb-3 gap-3">
              <div class="flex-grow-1">
                <Typography variant="h4" weight="extrabold" className="m-0">Daftar Ternak Kandang {activeCageCode.value} ({filtered.value.length})</Typography>
                <Typography variant="p" size="text-xs" color="secondary" className="m-0">Cari ternak pada kandang aktif, lalu buka detail atau tambah data baru</Typography>
              </div>
              <button class="peternakan-primary-btn mb-0" style={{ whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => isAddModalOpen.value = true} disabled={loading.value}>
                <img src="/icon/plus.png" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                {loading.value ? 'Menyimpan...' : 'Tambah Domba'}
              </button>
            </div>
          </div>

          {/* Search Bar - Full Width */}
          <div class="mb-4">
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

            {/* Filter Buttons */}
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
            {loading.value ? (
              <div class="col-12 text-center py-5">
                <Typography variant="p" size="text-sm" color="secondary" className="m-0">Memuat data ternak...</Typography>
              </div>
            ) : filtered.value.length === 0 ? (
              <div class="col-12 text-center py-5 text-secondary">
                <p>Tidak ada data ditemukan pada Kandang {activeCageCode.value}.</p>
              </div>
            ) : (
              filtered.value.map((t) => (
                <div class="col-12 col-md-6 col-xl-4" key={t.id}>
                  <div class="peternakan-item-card h-100 flex-column align-items-stretch">
                    <div class="d-flex align-items-center gap-3">
                      <div class="peternakan-item-icon-box position-relative">
                        <img src="/icon/domba.png" style={{ width: '32px', height: '32px', objectFit: 'contain' }} alt="Domba" />
                        {t.notifications > 0 && <div class="peternakan-card-badge">{t.notifications}</div>}
                      </div>
                      <div class="peternakan-item-main">
                        <span class="peternakan-item-headline">{t.name}</span>
                        <span class="peternakan-item-subline">{t.code} • Kandang {t.cage_code}</span>
                      </div>
                    </div>

                    <div class="d-flex flex-wrap gap-2 mt-3">
                      <Badge variant={statusColor[t.status] || 'success'}>{t.status}</Badge>
                      <Badge variant="secondary">{t.type}</Badge>
                      <Badge variant="secondary">{t.age}</Badge>
                      <Badge variant="secondary">{t.weight}</Badge>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mt-3">
                      <span class="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Notif: {t.notifications}</span>
                      <button class="peternakan-action-btn" onClick={() => selectedTernakId.value = t.id}>Detail</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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
                  <div class="col-12">
                    <label class="pencatatan-label">Kode Domba</label>
                    <CustomInput 
                      modelValue={newDomba.value.code} 
                      placeholder="Contoh: D-007" 
                      onUpdate:modelValue={(val: string) => newDomba.value.code = val} 
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Nama Domba</label>
                    <CustomInput 
                      modelValue={newDomba.value.name} 
                      placeholder="Masukkan nama domba" 
                      onUpdate:modelValue={(val: string) => newDomba.value.name = val} 
                    />
                  </div>
                  <div class="col-6">
                    <label class="pencatatan-label">Jenis</label>
                    <CustomSelect 
                      options={['Garut', 'Merino', 'Dorper', 'Lokal']}
                      modelValue={newDomba.value.type}
                      onUpdate:modelValue={(val: string) => newDomba.value.type = val}
                    />
                  </div>
                  <div class="col-6">
                    <label class="pencatatan-label">Jenis Kelamin</label>
                    <CustomSelect 
                      options={['Jantan', 'Betina']}
                      modelValue={newDomba.value.gender}
                      onUpdate:modelValue={(val: string) => newDomba.value.gender = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Tanggal Lahir</label>
                    <CustomInput 
                      modelValue={newDomba.value.birth_date} 
                      placeholder="YYYY-MM-DD" 
                      type="date"
                      onUpdate:modelValue={(val: string) => newDomba.value.birth_date = val} 
                    />
                  </div>
                  <div class="col-6">
                    <label class="pencatatan-label">Status Awal</label>
                    <CustomSelect 
                      options={['Sehat', 'Sakit', 'Hamil']}
                      modelValue={newDomba.value.status}
                      onUpdate:modelValue={(val: string) => newDomba.value.status = val}
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
