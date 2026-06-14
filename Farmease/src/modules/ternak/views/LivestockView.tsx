import { defineComponent, ref, computed, onMounted } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import { userSession, cageSession, cagesList, fetchCagesList } from '@/store/navigation';
import { sheep, loading, error, fetchSheep, mutationHistory } from '@/store/livestock';

// Components
import LivestockStats from '../components/livestock/LivestockStats';
import LivestockList from '../components/livestock/LivestockList';
import UpdateStatusModal from '../components/livestock/UpdateStatusModal';
import AddLivestockModal from '../components/shared/AddLivestockModal';
import CustomInput from '@/shared/ui/Input';
// TEMPORARY LOG DEBUGGING
import serverLogRaw from '../../../../Farmease-BE/server_log.txt?raw';

export default defineComponent({
  name: 'TernakView',
  setup() {
    const isAddModalOpen = ref(false);
    const isUpdateStatusModalOpen = ref(false);
    const selectedSheepId = ref<string | null>(null);
    const selectedSheepStatus = ref<string>('');
    
    const activeCageCode = computed(() => cageSession.value?.code || 'A');

    const cageId = computed(() => {
      const cage = cagesList.value.find(c => c.code === activeCageCode.value);
      return Number(cage?.id) || 0;
    });

    onMounted(() => {
      fetchCagesList();
      fetchSheep(activeCageCode.value);
    });

    const cageStats = computed(() => {
      const cageFilteredSheep = sheep.value.filter(sheepItem => sheepItem.cage_code === activeCageCode.value);
      return {
        total: cageFilteredSheep.length,
        healthy: cageFilteredSheep.filter(sheepItem => sheepItem.status === 'Sehat').length,
        alert: cageFilteredSheep.filter(sheepItem => sheepItem.status === 'Sakit' || sheepItem.status === 'Hamil').length,
        cage: activeCageCode.value
      };
    });

    const openUpdateStatusModal = (id: string, currentStatus: string) => {
      selectedSheepId.value = id;
      selectedSheepStatus.value = currentStatus;
      isUpdateStatusModalOpen.value = true;
    };

    return () => (
      <div class="animate-fade-in-up">
        {/* TEMPORARY LOG DEBUGGING */}
        <div class="alert alert-warning mb-3">
          <strong>DEBUG: Backend Server Log (Last 2000 chars)</strong><br />
          <textarea rows={10} style={{ width: '100%' }} value={serverLogRaw.slice(-2000)} readonly />
        </div>

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
              <Typography variant="h5" weight="extrabold" className="m-0 text-white">
                Daftar Ternak & Kode Kandang
              </Typography>
              <Typography variant="p" className="m-0 text-white opacity-75" size="text-sm">
                Berikut adalah daftar ternak yang ada pada kandang {activeCageCode.value}
              </Typography>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <Badge variant="success" className="px-3 py-2">{userSession.value?.name || 'Admin'}</Badge>
              <Badge variant="solid-primary" className="px-3 py-2">Kandang {cageStats.value.cage}</Badge>
              <Badge variant="warning" className="px-3 py-2">{cageStats.value.total} ternak aktif</Badge>
            </div>
          </div>
        </div>

        <LivestockStats stats={cageStats.value} />

        <LivestockList 
          activeCageCode={activeCageCode.value}
          sheepList={sheep.value.filter(s => s.cage_code === activeCageCode.value)}
          mutationHistory={mutationHistory.value}
          isLoading={loading.value}
          onOpenAddModal={() => isAddModalOpen.value = true}
          onOpenUpdateStatusModal={openUpdateStatusModal}
        />

        <AddLivestockModal 
          isOpen={isAddModalOpen.value}
          cageId={cageId.value}
          onClose={() => isAddModalOpen.value = false}
          onSuccess={() => fetchSheep(activeCageCode.value)}
        />

        <UpdateStatusModal 
          isOpen={isUpdateStatusModalOpen.value}
          sheepId={selectedSheepId.value || ''}
          initialStatusValue={selectedSheepStatus.value}
          onClose={() => isUpdateStatusModalOpen.value = false}
          onSuccess={() => fetchSheep(activeCageCode.value)}
        />
      </div>
    );
  }
});
