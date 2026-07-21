import { defineComponent, ref, computed, onMounted } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import { userSession, cageSession, cagesList, fetchCagesList } from '@/store/navigation';
import { sheep, loading, error, fetchSheep, mutationHistory } from '@/store/livestock';

// Components
import LivestockList from '../components/livestock/LivestockList';
import UpdateStatusModal from '../components/livestock/UpdateStatusModal';
import AddLivestockModal from '@/shared/ui/AddLivestockModal';
import CustomInput from '@/shared/ui/Input';

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
      fetchSheep();
    });

    const openUpdateStatusModal = (id: string, currentStatus: string) => {
      selectedSheepId.value = id;
      selectedSheepStatus.value = currentStatus;
      isUpdateStatusModalOpen.value = true;
    };

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
              <Typography variant="h5" weight="extrabold" className="m-0 text-white">
                Daftar Ternak & Kode Kandang
              </Typography>
              <Typography variant="p" className="m-0 text-white opacity-75" size="text-sm">
                Berikut adalah daftar ternak yang terdaftar di sistem Farmease.
              </Typography>
            </div>
          </div>
        </div>

        <LivestockList 
          activeCageCode={activeCageCode.value}
          sheepList={sheep.value}
          mutationHistory={mutationHistory.value}
          isLoading={loading.value}
          onOpenAddModal={() => isAddModalOpen.value = true}
          onOpenUpdateStatusModal={openUpdateStatusModal}
          cagesList={cagesList.value}
        />

        <AddLivestockModal 
          isOpen={isAddModalOpen.value}
          cageId={cageId.value}
          onClose={() => isAddModalOpen.value = false}
          onSuccess={() => fetchSheep()}
        />

        <UpdateStatusModal 
          isOpen={isUpdateStatusModalOpen.value}
          sheepId={selectedSheepId.value || ''}
          initialStatusValue={selectedSheepStatus.value}
          onClose={() => isUpdateStatusModalOpen.value = false}
          onSuccess={() => fetchSheep()}
        />
      </div>
    );
  }
});
