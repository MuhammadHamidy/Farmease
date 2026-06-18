import { defineComponent, ref, computed, type PropType } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LivestockListWidget',
  props: {
    cageInventory: { type: Array as PropType<any[]>, required: true },
    activeCageCode: { type: String, required: true },
    isLoading: { type: Boolean, required: true },
    onOpenAddModal: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const router = useRouter();
    const search = ref('');
    const filterStatus = ref('');

    const filteredInventory = computed(() => {
      const q = search.value.toLowerCase().trim();
      return props.cageInventory.filter(t => {
        const matchSearch = !q ||
          t.name.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q);
        const matchStatus = !filterStatus.value || t.status === filterStatus.value;
        return matchSearch && matchStatus;
      });
    });

    const statusColor: Record<string, string> = {
      Sehat: 'success',
      Hamil: 'warning',
      Sakit: 'danger',
    };

    const SHEEP_TYPES: Record<string, string> = {
      '22222222-2222-2222-2222-222222222201': 'Garut',
      '22222222-2222-2222-2222-222222222202': 'Texel',
      '22222222-2222-2222-2222-222222222203': 'Dorper',
      '22222222-2222-2222-2222-222222222204': 'Merino',
      '22222222-2222-2222-2222-222222222205': 'F2 Dorper',
      '22222222-2222-2222-2222-222222222206': 'F2 Garut',
    };

    const getSheepTypeName = (typeId: string) => {
      return SHEEP_TYPES[typeId] || typeId || '—';
    };

    return () => (
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
            <button class="peternakan-primary-btn mb-0 justify-content-center" style={{ whiteSpace: 'nowrap', flexShrink: 0 }} onClick={props.onOpenAddModal} disabled={props.isLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              {props.isLoading ? 'Menyimpan...' : 'Tambah Domba'}
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
              {props.cageInventory.length === 0
                ? `Belum ada data ternak di kandang ${props.activeCageCode || 'aktif'}`
                : 'Tidak ada ternak yang sesuai filter'}
            </div>
          ) : (
            filteredInventory.value.map(t => (
              <div class="col-12 col-md-6 col-xl-3" key={t.id}>
                <div class="peternakan-item-card h-100 flex-column align-items-stretch" style={{ cursor: 'pointer' }} onClick={() => router.push({ name: 'ternak-detail', params: { id: t.id } })}>
                  <div class="d-flex align-items-center gap-3">
                    <div class="peternakan-item-icon-box position-relative" style={{ width: '48px', height: '48px', flexShrink: 0, overflow: 'hidden', borderRadius: '50%', background: 'var(--bs-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {t.photo_url ? (
                        <img src={`http://localhost:8081${t.photo_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Domba" />
                      ) : (
                        <img src="/icon/domba.png" style={{ width: '30px', height: '30px', objectFit: 'contain' }} alt="Domba" />
                      )}
                    </div>
                    <div class="peternakan-item-main">
                      <span class="peternakan-item-headline d-block mb-1">{t.name}</span>
                      <div class="d-flex flex-wrap gap-1 mt-1">
                        <span class="badge bg-light text-secondary border border-light-subtle rounded-pill" style={{ fontSize: '0.65rem', fontWeight: 600 }}>ID: {t.code}</span>
                        <span class="badge bg-light text-secondary border border-light-subtle rounded-pill" style={{ fontSize: '0.65rem', fontWeight: 600 }}>Kandang {t.cage_code}</span>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex flex-wrap gap-2 mt-3 mb-3">
                    <Badge variant={(statusColor[t.status] || 'success') as any} className="px-2">{t.status}</Badge>
                    <Badge variant="secondary" className="px-2">{getSheepTypeName(t.type)}</Badge>
                    <Badge variant="secondary" className="px-2">{t.gender}</Badge>
                  </div>

                  <div class="mt-auto pt-2 border-top border-light">
                    <button class="peternakan-action-btn w-100 justify-content-center" onClick={(e) => { e.stopPropagation(); router.push({ name: 'ternak-detail', params: { id: t.id } }); }}>Detail</button>
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
