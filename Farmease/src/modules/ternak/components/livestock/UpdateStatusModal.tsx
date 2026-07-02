import { defineComponent, ref, watch, Teleport, type PropType } from 'vue';
import CustomSelect from '@/shared/ui/admin/Select';
import { SHEEP_STATUS_OPTIONS, updateSheepStatus } from '@/store/livestock';

export default defineComponent({
  name: 'UpdateStatusModal',
  props: {
    isOpen: { type: Boolean, required: true },
    sheepId: { type: String, default: null },
    initialStatusValue: { type: String, default: '' },
    onClose: { type: Function as PropType<() => void>, required: true },
    onSuccess: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const newStatusValue = ref('');
    const isLoading = ref(false);

    watch(() => props.isOpen, (isOpen) => {
      if (isOpen) {
        newStatusValue.value = props.initialStatusValue;
      }
    });

    const handleUpdateStatus = async () => {
      if (!props.sheepId || !newStatusValue.value) return;
      try {
        isLoading.value = true;
        await updateSheepStatus(props.sheepId, newStatusValue.value);
        props.onSuccess();
        props.onClose();
      } catch (err) {
        console.error('Failed to update status:', err);
      } finally {
        isLoading.value = false;
      }
    };

    return () => {
      if (!props.isOpen) return null;

      return (
        <Teleport to="body">
          <div class="peternakan-modal-overlay" onClick={props.onClose}>
            <div class="peternakan-modal-card animate-fade-in-up" style={{ maxWidth: '360px' }} onClick={(e) => e.stopPropagation()}>
              <div class="peternakan-modal-header">
                <button class="peternakan-modal-close" onClick={props.onClose}>
                  <img src="/icon/close-cancel/grey-24.svg" alt="Tutup" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                </button>
                <div class="peternakan-modal-title">Ubah Status Domba</div>
              </div>
              <div class="peternakan-modal-body">
                <label class="form-label text-secondary small fw-bold mb-2">Status Baru</label>
                <CustomSelect
                  options={[...SHEEP_STATUS_OPTIONS]}
                  modelValue={newStatusValue.value}
                  onUpdate:modelValue={(val: string) => newStatusValue.value = val}
                />
                <div class="mt-4 pt-3 border-top border-light">
                  <button class="peternakan-primary-btn w-100 m-0 justify-content-center" onClick={handleUpdateStatus} disabled={isLoading.value}>
                    {isLoading.value ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      );
    };
  }
});
