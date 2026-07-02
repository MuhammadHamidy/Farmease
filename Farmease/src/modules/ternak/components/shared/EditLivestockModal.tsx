import { defineComponent, ref, watch, computed, type PropType } from 'vue';
import CustomInput from '@/shared/ui/Input';
import CustomSelect from '@/shared/ui/admin/Select';
import { updateSheep, updateSheepStatus, sheep } from '@/store/livestock';
import { metadataEnums } from '@/store/operatorAdmin';
import { cagesList } from '@/store/navigation';
import CustomAlertModal, { type AlertModalState } from './CustomAlertModal';

export default defineComponent({
  name: 'EditLivestockModal',
  props: {
    isOpen: { type: Boolean, required: true },
    sheepData: { type: Object as PropType<any>, required: true },
    onClose: { type: Function as PropType<() => void>, required: true },
    onSuccess: { type: Function as PropType<() => void>, default: () => {} },
  },
  setup(props) {
    const isLoading = ref(false);
    const umurMethod = ref<'tanggal' | 'poel'>('tanggal');
    const poelOptions = [
      'Cempe (Belum Poel)',
      '1 Poel (~1 - 1.5 tahun)',
      '2 Poel (~1.5 - 2 tahun)',
      '3 Poel (~2.5 - 3 tahun)',
      '4 Poel (Lebih 3 tahun)'
    ];
    const selectedPoel = ref('');

    const computedPoelDateIso = computed(() => {
      if (umurMethod.value !== 'poel' || !selectedPoel.value) return null;
      const d = new Date();
      if (selectedPoel.value.startsWith('Cempe')) d.setMonth(d.getMonth() - 6);
      else if (selectedPoel.value.startsWith('1')) d.setMonth(d.getMonth() - 15);
      else if (selectedPoel.value.startsWith('2')) d.setMonth(d.getMonth() - 21);
      else if (selectedPoel.value.startsWith('3')) d.setMonth(d.getMonth() - 30);
      else if (selectedPoel.value.startsWith('4')) d.setMonth(d.getMonth() - 48);
      return d.toISOString();
    });

    const editDomba = ref({
      code: '',
      name: '',
      type: '',
      birth_date: '',
      gender: '',
      origin: '',
      status: '',
      id_father: '',
      id_mother: '',
      photo_url: '',
      id_cage: '',
      owner: '',
    });
    const selectedFile = ref<File | null>(null);
    const previewUrl = ref<string | null>(null);
    const alertModal = ref<AlertModalState>({
      isOpen: false,
      title: '',
      message: '',
      type: 'error',
    });

    const onFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (file) {
          selectedFile.value = file;
          previewUrl.value = URL.createObjectURL(file);
        }
      }
    };

    const statusOptions = ['Sehat', 'Sakit', 'Hamil', 'Melahirkan', 'Dijual', 'Mati'];

    watch([() => props.isOpen, () => props.sheepData], ([open, sheepData]) => {
      if (open && sheepData) {
        const typeMapReverse: Record<string, string> = {
          '22222222-2222-2222-2222-222222222201': 'Garut',
          '22222222-2222-2222-2222-222222222202': 'Texel',
          '22222222-2222-2222-2222-222222222203': 'Dorper',
          '22222222-2222-2222-2222-222222222204': 'Merino',
          '22222222-2222-2222-2222-222222222205': 'Dorper F2',
          '22222222-2222-2222-2222-222222222206': 'F2 Garut',
          '22222222-2222-2222-2222-222222222207': 'Cross Dorper'
        };
        const resolvedType = sheepData.jenis || sheepData.sheep_type || sheepData.type || typeMapReverse[String(sheepData.id_type)] || '';
        
        let resolvedStatus = sheepData.status || 'Sehat';
        if (String(resolvedStatus).toLowerCase() === 'aktif') resolvedStatus = 'Sehat';
        else if (String(resolvedStatus).toLowerCase() === 'sakit') resolvedStatus = 'Sakit';
        else if (String(resolvedStatus).toLowerCase() === 'hamil') resolvedStatus = 'Hamil';
        else if (String(resolvedStatus).toLowerCase() === 'melahirkan') resolvedStatus = 'Melahirkan';
        else if (String(resolvedStatus).toLowerCase() === 'dijual') resolvedStatus = 'Dijual';
        else if (String(resolvedStatus).toLowerCase() === 'mati') resolvedStatus = 'Mati';

        let safeDate = '';
        const rawDate = sheepData.tgl_lahir || sheepData.date_of_birth || sheepData.birth_date;
        if (rawDate) {
          try {
            safeDate = new Date(rawDate).toISOString().split('T')[0] || '';
          } catch (e) {
            safeDate = '';
          }
        }

        editDomba.value = {
          code: sheepData.code || sheepData.sheep_code || '',
          name: sheepData.nama || sheepData.sheep_name || sheepData.name || '',
          type: resolvedType,
          birth_date: safeDate,
          gender: sheepData.jk || sheepData.gender ? (String(sheepData.jk || sheepData.gender).toLowerCase() === 'jantan' ? 'Jantan' : 'Betina') : '',
          origin: sheepData.asal || sheepData.origin || '',
          status: resolvedStatus,
          id_father: sheepData.id_father || '',
          id_mother: sheepData.id_mother || '',
          photo_url: sheepData.photo_url || '',
          id_cage: sheepData.id_cage || '',
          owner: sheepData.owner || '',
        };
        selectedFile.value = null;
        previewUrl.value = sheepData.photo_url ? `http://localhost:8081${sheepData.photo_url}` : null;
        // Reset umurMethod to tanggal since we load the actual date
        umurMethod.value = 'tanggal';
        selectedPoel.value = '';
      }
    }, { immediate: true });

    const handleEditDomba = async () => {
      const sheepData = editDomba.value;
      if (!sheepData.code || !sheepData.name || !sheepData.type || !sheepData.gender || (!sheepData.birth_date && umurMethod.value === 'tanggal') || (!selectedPoel.value && umurMethod.value === 'poel') || !sheepData.origin) {
        alertModal.value = {
          isOpen: true,
          title: 'Validasi Gagal',
          message: 'Mohon lengkapi semua kolom yang bertanda bintang (*) sebelum menyimpan.',
          type: 'error',
        };
        return;
      }

      // Check cage capacity
      const targetCage = cagesList.value.find(c => String(c.id) === String(editDomba.value.id_cage));
      if (targetCage) {
        const isChangingCage = String(props.sheepData.id_cage) !== String(editDomba.value.id_cage);
        if (isChangingCage) {
          const occupancy = sheep.value.filter(s => 
            s.cage_code === targetCage.code && 
            !['Mati', 'Terjual', 'Disembelih'].includes(s.status)
          ).length;
          
          if (occupancy >= targetCage.capacity) {
            alertModal.value = {
              isOpen: true,
              title: 'Kandang Penuh',
              message: `Gagal memindahkan domba. Kandang ${targetCage.name} sudah penuh (Kapasitas: ${targetCage.capacity} ekor).`,
              type: 'error',
            };
            return;
          }
        }
      }

      try {
        isLoading.value = true;
        
        const typeMap: Record<string, string> = {
          'Garut': '22222222-2222-2222-2222-222222222201',
          'Texel': '22222222-2222-2222-2222-222222222202',
          'Dorper': '22222222-2222-2222-2222-222222222203',
          'Merino': '22222222-2222-2222-2222-222222222204',
          'F2 Dorper': '22222222-2222-2222-2222-222222222205',
          'Dorper F2': '22222222-2222-2222-2222-222222222205',
          'F2 Garut': '22222222-2222-2222-2222-222222222206',
          'Cross Dorper': '22222222-2222-2222-2222-222222222207'
        };
        const resolvedIdType = typeMap[editDomba.value.type] || '22222222-2222-2222-2222-222222222201';

        const payload = {
          sheep_code: editDomba.value.code,
          sheep_name: editDomba.value.name,
          gender: editDomba.value.gender.toLowerCase(),
          date_of_birth: umurMethod.value === 'tanggal' 
            ? (editDomba.value.birth_date ? new Date(editDomba.value.birth_date).toISOString() : null)
            : computedPoelDateIso.value,
          status: editDomba.value.status.toLowerCase() === 'sehat' ? 'aktif' : editDomba.value.status.toLowerCase(),
          origin: editDomba.value.origin,
          id_type: String(resolvedIdType),
          id_father: editDomba.value.id_father ? String(editDomba.value.id_father) : null,
          id_mother: editDomba.value.id_mother ? String(editDomba.value.id_mother) : null,
          photo_url: editDomba.value.photo_url,
          id_cage: editDomba.value.id_cage || '',
          owner: editDomba.value.owner,
        };

        if (selectedFile.value) {
          const { uploadApi } = await import('@/shared/api/peternakan');
          const uploadedUrl = await uploadApi.uploadPhoto(selectedFile.value);
          if (uploadedUrl) {
            payload.photo_url = uploadedUrl;
          }
        }

        const id = props.sheepData.id || props.sheepData.id_sheep;
        await Promise.all([
          updateSheep(String(id), payload),
          updateSheepStatus(String(id), editDomba.value.status)
        ]);
        
        props.onSuccess();
        props.onClose();
      } catch (error: any) {
        console.error('Failed to edit sheep:', error);
        const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Terjadi kesalahan tidak diketahui.';
        
        let friendlyMessage = `Gagal menyimpan perubahan profil domba.\nDetail: ${errorMsg}`;
        const lowerMsg = errorMsg.toLowerCase();
        if (lowerMsg.includes('duplicate key') || lowerMsg.includes('unique constraint') || lowerMsg.includes('23505') || lowerMsg.includes('already exists') || lowerMsg.includes('sheep_code_key')) {
          friendlyMessage = 'Gagal menyimpan. Kode Domba (Ear Tag) sudah terdaftar di sistem. Silakan gunakan Kode Domba yang lain.';
        }

        alertModal.value = {
          isOpen: true,
          title: 'Gagal Menyimpan',
          message: friendlyMessage,
          type: 'error',
        };
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
              <div class="peternakan-modal-title">Ubah Profil Domba</div>
            </div>

            <div class="peternakan-modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Kode Domba (Ear Tag) <span class="text-danger">*</span></label>
                  <CustomInput
                    placeholder="Contoh: D-007"
                    modelValue={editDomba.value.code}
                    onUpdate:modelValue={(v: string) => editDomba.value.code = v}
                    disabled={true}
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Nama Domba <span class="text-danger">*</span></label>
                  <CustomInput
                    placeholder="Masukkan nama domba"
                    modelValue={editDomba.value.name}
                    onUpdate:modelValue={(v: string) => editDomba.value.name = v}
                    disabled={true}
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Ras/Jenis <span class="text-danger">*</span></label>
                  <CustomSelect
                    placeholder="Pilih Ras/Jenis"
                    options={['Garut', 'Texel', 'Dorper', 'Merino', 'Dorper F2', 'F2 Garut', 'Cross Dorper']}
                    modelValue={editDomba.value.type}
                    onUpdate:modelValue={(v: string) => editDomba.value.type = v}
                    disabled={true}
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Jenis Kelamin <span class="text-danger">*</span></label>
                  <CustomSelect
                    placeholder="Pilih Jenis Kelamin"
                    options={['Jantan', 'Betina']}
                    modelValue={editDomba.value.gender}
                    onUpdate:modelValue={(v: string) => editDomba.value.gender = v}
                    disabled={true}
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2 d-block" style={{ marginBottom: '0.5rem' }}>Metode Penentuan Umur <span class="text-danger">*</span></label>
                  <div class="d-flex gap-4 mb-3">
                    <label class="d-flex align-items-center gap-2" style={{ cursor: 'not-allowed', opacity: 0.7 }}>
                      <input 
                        type="radio" 
                        name="umur_method_edit" 
                        value="tanggal" 
                        checked={umurMethod.value === 'tanggal'}
                        onChange={() => umurMethod.value = 'tanggal'}
                        style={{ accentColor: 'var(--color-primary)' }}
                        disabled={true}
                      />
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-800)' }}>Tanggal Lahir Pasti</span>
                    </label>
                    <label class="d-flex align-items-center gap-2" style={{ cursor: 'not-allowed', opacity: 0.7 }}>
                      <input 
                        type="radio" 
                        name="umur_method_edit" 
                        value="poel" 
                        checked={umurMethod.value === 'poel'}
                        onChange={() => umurMethod.value = 'poel'}
                        style={{ accentColor: 'var(--color-primary)' }}
                        disabled={true}
                      />
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-800)' }}>Perkiraan dari Poel</span>
                    </label>
                  </div>

                  {umurMethod.value === 'tanggal' ? (
                    <div>
                      <label class="form-label text-secondary small fw-bold mb-2">Tanggal Lahir <span class="text-danger">*</span></label>
                      <CustomInput
                        type="date"
                        placeholder="YYYY-MM-DD"
                        modelValue={editDomba.value.birth_date}
                        onUpdate:modelValue={(v: string) => editDomba.value.birth_date = v}
                        disabled={true}
                      />
                    </div>
                  ) : (
                    <div>
                      <label class="form-label text-secondary small fw-bold mb-2">Perkiraan Umur (Poel) <span class="text-danger">*</span></label>
                      <CustomSelect
                        placeholder="Pilih Kondisi Poel"
                        options={poelOptions}
                        modelValue={selectedPoel.value}
                        onUpdate:modelValue={(v: string) => selectedPoel.value = v}
                        disabled={true}
                      />
                      {computedPoelDateIso.value ? (
                        <small class="d-block mt-1 fw-bold" style={{ color: 'var(--color-primary)' }}>
                          Taksiran Tanggal Lahir: {new Date(computedPoelDateIso.value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </small>
                      ) : (
                        <small class="text-muted d-block mt-1">Tanggal lahir akan otomatis di-set mundur dari hari ini sesuai perkiraan.</small>
                      )}
                    </div>
                  )}
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Status Domba <span class="text-danger">*</span></label>
                  <CustomSelect
                    placeholder="Pilih Status"
                    options={statusOptions}
                    modelValue={editDomba.value.status}
                    onUpdate:modelValue={(v) => editDomba.value.status = v}
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Asal Ternak <span class="text-danger">*</span></label>
                  <CustomSelect
                    placeholder="Pilih Asal Ternak"
                    options={['Ternak Sendiri', 'Pembelian', 'Hibah', 'Kelahiran di Kandang']}
                    modelValue={editDomba.value.origin}
                    onUpdate:modelValue={(v: string) => editDomba.value.origin = v}
                    disabled={true}
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Pemilik</label>
                  <CustomSelect
                    placeholder="Pilih Pemilik"
                    options={['SHAF', 'Ilona', 'Sylvia/Ropi', 'Maria/Chris', 'SHAF/MC', 'SHAF/SR', 'Sundari']}
                    modelValue={editDomba.value.owner}
                    onUpdate:modelValue={(v: string) => editDomba.value.owner = v}
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Foto Domba</label>
                  <div class="d-flex align-items-center gap-3">
                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-gray-200)', backgroundColor: '#f8f9fa' }}>
                      {previewUrl.value ? (
                        <img src={previewUrl.value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div class="d-flex align-items-center justify-content-center h-100">
                          <img src="/img/placeholder/sheep-avatar.svg" alt="Placeholder" style={{ width: '40px', opacity: 0.5 }} />
                        </div>
                      )}
                    </div>
                    <div class="flex-grow-1">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={onFileChange} 
                        class="form-control" 
                        style={{ fontSize: '0.9rem' }} 
                      />
                      <small class="text-muted d-block mt-1">Format: JPG, PNG. Maks 2MB.</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-4 pt-3 border-top border-light">
                <button 
                  class="peternakan-primary-btn w-100 m-0 justify-content-center" 
                  onClick={handleEditDomba}
                  disabled={isLoading.value}
                >
                  {isLoading.value ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
          {/* Custom Alert Modal */}
          {alertModal.value.isOpen && (
            <CustomAlertModal
              alert={alertModal.value}
              onClose={() => { alertModal.value.isOpen = false; }}
            />
          )}
        </div>
      );
    };
  }
});
