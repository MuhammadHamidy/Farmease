import { defineComponent, ref, computed, watch, type PropType } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge, { type BadgeVariant } from '@/shared/ui/Badge';
import { useRouter, useRoute } from 'vue-router';
import CustomSelect from '@/shared/ui/admin/Select';
import CustomInput from '@/shared/ui/Input';

const statusColor: Record<string, BadgeVariant> = {
  Sehat: 'success',
  Produktif: 'info',
  Hamil: 'warning',
  Sakit: 'danger',
  Birahi: 'primary',
  'Siap Jual': 'primary',
  Mati: 'secondary',
  Terjual: 'secondary',
  Disembelih: 'secondary',
};

export default defineComponent({
  name: 'LivestockList',
  props: {
    activeCageCode: { type: String, required: true },
    sheepList: { type: Array as PropType<any[]>, required: true },
    mutationHistory: { type: Array as PropType<any[]>, required: true },
    isLoading: { type: Boolean, required: true },
    onOpenAddModal: { type: Function as PropType<() => void>, required: true },
    onOpenUpdateStatusModal: { type: Function as PropType<(id: string, currentStatus: string) => void>, required: true },
    cagesList: { type: Array as PropType<any[]>, required: true },
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const search = ref('');
    const filterStatus = ref((route.query.status as string) || '');
    const selectedCage = ref('all');
    const activeTab = ref<'aktif' | 'mutasi'>('aktif');

    watch(() => route.query.status, (newStatus) => {
      filterStatus.value = (newStatus as string) || '';
    });

    const filtered = computed(() => {
      return props.sheepList.filter(sheepItem => {
        const query = search.value.toLowerCase();
        const matchSearch = !query || 
          sheepItem.name.toLowerCase().includes(query) || 
          sheepItem.code.toLowerCase().includes(query) || 
          sheepItem.type.toLowerCase().includes(query);
        
        const matchCage = selectedCage.value === 'all' || sheepItem.cage_code === selectedCage.value;

        const matchStatus = (() => {
          if (!filterStatus.value) return true;
          if (filterStatus.value === 'Birahi') {
            return !!sheepItem.is_ready_to_mate || (sheepItem.mating_status && (sheepItem.mating_status.includes('Birahi') || sheepItem.mating_status.includes('Siap')));
          }
          return sheepItem.status === filterStatus.value;
        })();

        return matchSearch && matchCage && matchStatus;
      });
    });

    const activeSheepCount = computed(() => {
      return props.sheepList.filter(s => !['Mati','Terjual','Disembelih'].includes(s.status)).length;
    });

    const currentPage = ref(1);
    const itemsPerPage = 9;

    watch([search, filterStatus, selectedCage, activeTab], () => {
      currentPage.value = 1;
    });

    const paginatedActive = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      return filtered.value.slice(start, start + itemsPerPage);
    });

    const paginatedMutasi = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      return props.mutationHistory.slice(start, start + itemsPerPage);
    });

    const totalPages = computed(() => {
      const totalItems = activeTab.value === 'aktif' ? filtered.value.length : props.mutationHistory.length;
      return Math.ceil(totalItems / itemsPerPage) || 1;
    });

    return () => (
      <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5 mb-4">
        <div class="mb-4">
          <div class="d-flex align-items-center justify-content-between mb-3 gap-3">
            <div class="flex-grow-1 text-start">
              <Typography variant="h4" weight="extrabold" className="m-0">
                {selectedCage.value === 'all' 
                  ? `Daftar Semua Ternak` 
                  : `Daftar Ternak Kandang ${selectedCage.value}`
                }
              </Typography>
              <Typography variant="p" size="text-xs" color="secondary" className="m-0">
                {selectedCage.value === 'all'
                  ? 'Cari dan pantau seluruh ternak aktif pada semua kandang'
                  : `Cari ternak pada Kandang ${selectedCage.value}, lalu buka detail atau tambah data baru`
                }
              </Typography>
            </div>
            <button class="peternakan-primary-btn mb-0" style={{ whiteSpace: 'nowrap', flexShrink: 0 }} onClick={props.onOpenAddModal} disabled={props.isLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              {props.isLoading ? 'Menyimpan...' : 'Tambah Domba'}
            </button>
          </div>
        </div>

        <div class="mb-4">
          <div class="row g-2 mb-3">
            <div class="col-12 col-md-6">
              <CustomInput
                modelValue={search.value}
                onUpdate:modelValue={(val: string) => search.value = val}
                placeholder="Cari ID, jenis, status..."
                icon={() => (
                  <img src="/icon/search.png" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                )}
              />
            </div>
            <div class="col-12 col-md-3 text-start">
              <CustomSelect
                options={[
                  { value: 'all', label: 'Semua Kandang' },
                  ...props.cagesList.map(c => ({ value: c.code, label: `${c.name} (${c.code})` }))
                ]}
                modelValue={selectedCage.value}
                onUpdate:modelValue={(val: string) => selectedCage.value = val}
                theme="peternakan"
              />
            </div>
            <div class="col-12 col-md-3 text-start">
              <CustomSelect
                options={[
                  { value: '', label: 'Semua Kondisi / Status' },
                  ...['Sehat', 'Produktif', 'Hamil', 'Birahi', 'Sakit', 'Siap Jual'].map(status => ({ value: status, label: status }))
                ]}
                modelValue={filterStatus.value}
                onUpdate:modelValue={(val: string) => filterStatus.value = val}
                theme="peternakan"
              />
            </div>
          </div>

          <div class="d-flex gap-2 mb-1">
            {(['aktif', 'mutasi'] as const).map(tab => (
              <button
                type="button"
                key={tab}
                class={['btn btn-sm rounded-pill px-3 py-2 fw-bold', activeTab.value === tab ? 'btn-primary-custom shadow-sm' : 'btn-light border text-secondary']}
                onClick={() => activeTab.value = tab}
              >
                {tab === 'aktif' ? `Aktif (${activeSheepCount.value})` : `Riwayat Keluar (${props.mutationHistory.length})`}
              </button>
            ))}
          </div>
        </div>

        <div class="row g-3">
          {props.isLoading ? (
            <div class="col-12 text-center py-5">
              <Typography variant="p" size="text-sm" color="secondary" className="m-0">Memuat data ternak...</Typography>
            </div>
          ) : activeTab.value === 'mutasi' ? (
            props.mutationHistory.length === 0 ? (
              <div class="col-12 text-center py-5 text-secondary">
                <p>Belum ada riwayat mutasi keluar.</p>
              </div>
            ) : (
              paginatedMutasi.value.map((sheepItem) => (
                <div class="col-12 col-md-6 col-xl-4" key={sheepItem.id}>
                  <div class="peternakan-item-card h-100 flex-column align-items-stretch" style={{ opacity: 0.75 }}>
                    <div class="d-flex align-items-center gap-3">
                      <div class="peternakan-item-avatar d-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: '48px', height: '48px', flexShrink: 0, overflow: 'hidden' }}>
                        {sheepItem.photo_url ? (
                          <img src={`http://localhost:8081${sheepItem.photo_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Domba" />
                        ) : (
                          <img src="/icon/domba.png" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                        )}
                      </div>
                      <div class="d-flex flex-column min-w-0 flex-grow-1">
                        <span class="peternakan-item-headline d-block mb-1">{sheepItem.name}</span>
                        <div class="d-flex flex-wrap gap-1 mt-1">
                          <span class="badge bg-light text-secondary border border-light-subtle rounded-pill" style={{ fontSize: '0.65rem', fontWeight: 600 }}>ID: {sheepItem.code}</span>
                          <span class="badge bg-light text-secondary border border-light-subtle rounded-pill" style={{ fontSize: '0.65rem', fontWeight: 600 }}>Kandang {sheepItem.cage_code}</span>
                        </div>
                      </div>
                    </div>
                    <div class="d-flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary">{sheepItem.status}</Badge>
                      <Badge variant="secondary">{sheepItem.type}</Badge>
                      <Badge variant="secondary">{sheepItem.age}</Badge>
                    </div>
                    <div class="d-flex justify-content-end mt-3">
                      <button class="peternakan-action-btn" onClick={() => router.push({ name: 'ternak-detail', params: { id: sheepItem.id } })}>Detail</button>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : filtered.value.length === 0 ? (
            <div class="col-12 text-center py-5 text-secondary">
              <p>Tidak ada data ditemukan pada Kandang {props.activeCageCode}.</p>
            </div>
          ) : (
            paginatedActive.value.map((sheepItem) => (
              <div class="col-12 col-md-6 col-xl-4" key={sheepItem.id}>
                <div class="peternakan-item-card h-100 flex-column align-items-stretch">
                  <div class="d-flex align-items-center gap-3">
                    <div class="peternakan-item-avatar d-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: '48px', height: '48px', flexShrink: 0, overflow: 'hidden' }}>
                      {sheepItem.photo_url ? (
                        <img src={`http://localhost:8081${sheepItem.photo_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Domba" />
                      ) : (
                        <img src="/icon/domba.png" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                      )}
                    </div>
                    <div class="d-flex flex-column min-w-0 flex-grow-1">
                      <span class="peternakan-item-headline d-block mb-1">{sheepItem.name}</span>
                      <div class="d-flex flex-wrap gap-1 mt-1">
                        <span class="badge bg-light text-secondary border border-light-subtle rounded-pill" style={{ fontSize: '0.65rem', fontWeight: 600 }}>ID: {sheepItem.code}</span>
                        <span class="badge bg-light text-secondary border border-light-subtle rounded-pill" style={{ fontSize: '0.65rem', fontWeight: 600 }}>Kandang {sheepItem.cage_code}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="d-flex flex-wrap gap-2 mt-3">
                    <Badge variant={statusColor[sheepItem.status] || 'secondary'}>{sheepItem.status}</Badge>
                    <Badge variant="secondary">{sheepItem.type}</Badge>
                    <Badge variant="secondary">{sheepItem.age}</Badge>
                    {sheepItem.weight && <Badge variant="secondary">{sheepItem.weight}</Badge>}
                  </div>

                  <div class="d-flex align-items-center justify-content-end gap-2 mt-3 pt-3 border-top">

                    <button class="peternakan-action-btn" onClick={() => router.push({ name: 'ternak-detail', params: { id: sheepItem.id } })}>Detail</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages.value > 1 && (
          <div class="d-flex justify-content-center align-items-center gap-2 mt-5 pt-4 border-top">
            <button
              type="button"
              class="btn btn-sm btn-light border rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1 text-secondary"
              disabled={currentPage.value === 1}
              onClick={() => currentPage.value--}
              style={{ transition: 'all 0.2s', fontSize: '0.8rem' }}
            >
              &larr; Sebelumnya
            </button>
            
            <div class="d-flex align-items-center gap-1">
              {Array.from({ length: totalPages.value }, (_, i) => i + 1).map(page => (
                <button
                  type="button"
                  key={page}
                  class={['btn btn-sm rounded-circle fw-bold d-flex align-items-center justify-content-center', currentPage.value === page ? 'btn-primary-custom shadow-sm text-white' : 'btn-light border text-secondary']}
                  style={{ width: '34px', height: '34px', fontSize: '0.8rem', padding: 0 }}
                  onClick={() => currentPage.value = page}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              class="btn btn-sm btn-light border rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1 text-secondary"
              disabled={currentPage.value === totalPages.value}
              onClick={() => currentPage.value++}
              style={{ transition: 'all 0.2s', fontSize: '0.8rem' }}
            >
              Selanjutnya &rarr;
            </button>
          </div>
        )}
      </div>
    );
  }
});
