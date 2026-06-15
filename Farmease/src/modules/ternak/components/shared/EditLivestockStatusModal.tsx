import { defineComponent, ref, watch, type PropType } from 'vue';
import CustomSelect from '@/shared/ui/admin/Select';
import { updateSheepStatus } from '@/store/livestock';

export default defineComponent({
  name: 'EditLivestockStatusModal',
  props: {
    isOpen: { type: Boolean, required: true },
    sheepData: { type: Object as PropType<any>, required: true },
    onClose: { type: Function as PropType<() => void>, required: true },
    onSuccess: { type: Function as PropType<() => void>, default: () => {} },
  },
  setup(props) {
    const isLoading = ref(false);
    const selectedStatus = ref('');

    const statusOptions = ['Sehat', 'Sakit', 'Hamil', 'Melahirkan', 'Dijual', 'Mati'];

    watch(() => props.isOpen, (open) => {
      if (open && props.sheepData) {
        selectedStatus.value = props.sheepData.status || 'Sehat';
      }
    });

    const handleUpdateStatus = async () => {
      if (!selectedStatus.value) {
        alert('Mohon pilih status terlebih dahulu.');
        return;
      }

      try {
        isLoading.value = true;
        const id = props.sheepData.id || props.sheepData.id_sheep;
        await updateSheepStatus(String(id), selectedStatus.value);
        
        props.onSuccess();
        props.onClose();
      } catch (error: any) {
        console.error('Failed to edit sheep status:', error);
        const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Terjadi kesalahan tidak diketahui.';
        alert(`Gagal menyimpan perubahan status.\nDetail: ${errorMsg}`);
      } finally {
        isLoading.value = false;
      }
    };

    return () => {
      if (!props.isOpen) return null;

      return (
        <div class="peternakan-modal-overlay" onClick={props.onClose}>
          <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div class="peternakan-modal-header">
              <button class="peternakan-modal-close" onClick={props.onClose}>
                <img src="/icon/close-cancel/grey-24.svg" alt="Tutup" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              </button>
              <div class="peternakan-modal-title">Perbarui Status</div>
            </div>

            <div class="peternakan-modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Status Domba <span class="text-danger">*</span></label>
                  <CustomSelect
                    placeholder="Pilih Status"
                    options={statusOptions}
                    modelValue={selectedStatus.value}
                    onUpdate:modelValue={(v) => selectedStatus.value = v}
                  />
                </div>
              </div>
              <div class="mt-4 pt-3 border-top border-light">
                <button 
                  class="peternakan-primary-btn w-100 m-0 justify-content-center" 
                  onClick={handleUpdateStatus}
                  disabled={isLoading.value}
                >
                  {isLoading.value ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };
  }
});
