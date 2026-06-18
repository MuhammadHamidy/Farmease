import { defineComponent, ref, computed, type PropType } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge, { type BadgeVariant } from '@/shared/ui/Badge';
import { useRouter } from 'vue-router';

const statusColor: Record<string, BadgeVariant> = {
  Sehat: 'success',
  Hamil: 'warning',
  Sakit: 'danger',
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
  },
  setup(props) {
    const router = useRouter();
    const search = ref('');
    const filterStatus = ref('');
    const activeTab = ref<'aktif' | 'mutasi'>('aktif');

    const filtered = computed(() => {
      return props.sheepList.filter(sheepItem => {
        const query = search.value.toLowerCase();
        const matchSearch = !query || 
          sheepItem.name.toLowerCase().includes(query) || 
          sheepItem.code.toLowerCase().includes(query) || 
          sheepItem.type.toLowerCase().includes(query);
        const matchStatus = !filterStatus.value || sheepItem.status === filterStatus.value;
        return matchSearch && matchStatus;
      });
    });

    const activeSheepCount = computed(() => {
      return props.sheepList.filter(s => !['Mati','Terjual','Disembelih'].includes(s.status)).length;
    });

    return () => (
      <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5 mb-4">
        <div class="mb-4">
          <div class="d-flex align-items-center justify-content-between mb-3 gap-3">
            <div class="flex-grow-1">
              <Typography variant="h4" weight="extrabold" className="m-0">
                Daftar Ternak Kandang {props.activeCageCode} ({filtered.value.length})
              </Typography>
              <Typography variant="p" size="text-xs" color="secondary" className="m-0">
                Cari ternak pada kandang aktif, lalu buka detail atau tambah data baru
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

          <div class="d-flex gap-2 mb-3">
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

          {activeTab.value === 'aktif' && (
            <div class="d-flex flex-wrap gap-2">
              {['', 'Sehat', 'Hamil', 'Sakit', 'Siap Jual'].map(status => (
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
          )}
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
              props.mutationHistory.map((sheepItem) => (
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
            filtered.value.map((sheepItem) => (
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
                    {activeTab.value === 'aktif' && (
                      <button class="peternakan-action-btn-outline d-flex align-items-center gap-2"
                      onClick={() => props.onOpenUpdateStatusModal(sheepItem.id, sheepItem.status)}
                      >
                        Ubah Status
                      </button>
                    )}
                    <button class="peternakan-action-btn" onClick={() => router.push({ name: 'ternak-detail', params: { id: sheepItem.id } })}>Detail</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
});
