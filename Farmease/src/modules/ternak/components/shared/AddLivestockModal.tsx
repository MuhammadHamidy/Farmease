import { defineComponent, ref, watch, computed, Teleport, type PropType } from 'vue';
import CustomInput from '@/shared/ui/Input';
import CustomSelect from '@/shared/ui/admin/Select';
import { sheep, addSheep, fetchSheep } from '@/store/livestock';
import { cagesList } from '@/store/navigation';
import { metadataEnums } from '@/store/operatorAdmin';
import CustomAlertModal, { type AlertModalState } from './CustomAlertModal';

export default defineComponent({
  name: 'AddLivestockModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    cageId: {
      type: [String, Number],
      default: '',
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onSuccess: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
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

    const computedPoelDate = computed(() => {
      if (umurMethod.value !== 'poel' || !selectedPoel.value) return '';
      const d = new Date();
      if (selectedPoel.value.startsWith('Cempe')) {
        d.setMonth(d.getMonth() - 6);
      } else if (selectedPoel.value.startsWith('1')) {
        d.setMonth(d.getMonth() - 15);
      } else if (selectedPoel.value.startsWith('2')) {
        d.setMonth(d.getMonth() - 21);
      } else if (selectedPoel.value.startsWith('3')) {
        d.setMonth(d.getMonth() - 30);
      } else if (selectedPoel.value.startsWith('4')) {
        d.setMonth(d.getMonth() - 40);
      }
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    });

    const computedPoelDateIso = computed(() => {
      if (umurMethod.value !== 'poel' || !selectedPoel.value) return null;
      const d = new Date();
      if (selectedPoel.value.startsWith('Cempe')) {
        d.setMonth(d.getMonth() - 6);
      } else if (selectedPoel.value.startsWith('1')) {
        d.setMonth(d.getMonth() - 15);
      } else if (selectedPoel.value.startsWith('2')) {
        d.setMonth(d.getMonth() - 21);
      } else if (selectedPoel.value.startsWith('3')) {
        d.setMonth(d.getMonth() - 30);
      } else if (selectedPoel.value.startsWith('4')) {
        d.setMonth(d.getMonth() - 40);
      }
      return d.toISOString();
    });

    const newDomba = ref({
      code: '',
      name: '',
      type: '',
      birth_date: '',
      gender: '',
      status: '',
      origin: '',
      id_father: '',
      id_mother: '',
      photo_url: '',
      owner: '',
    });
    const selectedCageId = ref(props.cageId || (cagesList.value.length > 0 ? String(cagesList.value[0]?.id ?? '') : ''));
    const selectedFile = ref<File | null>(null);
    const previewUrl = ref<string | null>(null);
    const alertModal = ref<AlertModalState>({
      isOpen: false,
      title: '',
      message: '',
      type: 'error',
    });
    const isSuccessState = ref(false);

    watch([() => props.cageId, () => cagesList.value], ([newId, list]) => {
      if (newId) {
        selectedCageId.value = String(newId);
      } else if (!selectedCageId.value && list && list.length > 0) {
        selectedCageId.value = String(list[0]?.id ?? '');
      }
    }, { immediate: true });

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

    watch([umurMethod], ([newMethod]) => {
      if (newMethod === 'tanggal') {
        newDomba.value.birth_date = '';
      }
    });

    const handleAddDomba = async () => {
      const sheepData = newDomba.value;
      // Validasi dari DashboardView
      if (!sheepData.code || !sheepData.name || !sheepData.type || !sheepData.gender || (!sheepData.birth_date && umurMethod.value === 'tanggal') || (!selectedPoel.value && umurMethod.value === 'poel') || !sheepData.status || !sheepData.origin || !selectedCageId.value) {
        alertModal.value = {
          isOpen: true,
          title: 'Validasi Gagal',
          message: 'Mohon lengkapi semua kolom yang bertanda bintang (*) sebelum menyimpan.',
          type: 'error',
        };
        return;
      }

      // Check cage capacity
      const targetCage = cagesList.value.find(c => String(c.id) === String(selectedCageId.value));
      if (targetCage) {
        const occupancy = sheep.value.filter(s => 
          s.cage_code === targetCage.code && 
          !['Mati', 'Terjual', 'Disembelih'].includes(s.status)
        ).length;
        
        if (occupancy >= targetCage.capacity) {
          alertModal.value = {
            isOpen: true,
            title: 'Kandang Penuh',
            message: `Gagal menambahkan domba. Kandang ${targetCage.name} sudah penuh (Kapasitas: ${targetCage.capacity} ekor).`,
            type: 'error',
          };
          return;
        }
      }

      try {
        isLoading.value = true;
        
        // Pemetaan tipe dari DashboardView
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
        const resolvedIdType = typeMap[newDomba.value.type] || '22222222-2222-2222-2222-222222222201';

        const payload = {
          sheep_code: newDomba.value.code,
          sheep_name: newDomba.value.name,
          gender: newDomba.value.gender.toLowerCase(),
          date_of_birth: umurMethod.value === 'tanggal' 
            ? (newDomba.value.birth_date ? new Date(newDomba.value.birth_date).toISOString() : null)
            : computedPoelDateIso.value,
          umur_method: umurMethod.value,
          poel_level: umurMethod.value === 'poel' ? selectedPoel.value : undefined,
          status: newDomba.value.status.toLowerCase(),
          origin: newDomba.value.origin,
          id_cage: selectedCageId.value,
          id_type: String(resolvedIdType),
          id_father: newDomba.value.id_father ? String(newDomba.value.id_father) : null,
          id_mother: newDomba.value.id_mother ? String(newDomba.value.id_mother) : null,
          photo_url: '',
          owner: newDomba.value.owner,
        };

        if (selectedFile.value) {
          const { uploadApi } = await import('@/shared/api/peternakan');
          const uploadedUrl = await uploadApi.uploadPhoto(selectedFile.value);
          if (uploadedUrl) {
            payload.photo_url = uploadedUrl;
          }
        }

        await addSheep(payload);
        
        isSuccessState.value = true;
        alertModal.value = {
          isOpen: true,
          title: 'Berhasil',
          message: `Domba ${payload.sheep_name || payload.sheep_code} berhasil ditambahkan ke ${targetCage ? targetCage.name : 'kandang'}.`,
          type: 'success',
        };
      } catch (error: any) {
        console.error('Failed to add sheep:', error);
        const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Terjadi kesalahan tidak diketahui.';
        
        let friendlyMessage = `Gagal menyimpan data domba.\nDetail: ${errorMsg}`;
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

    const handleAlertClose = () => {
      alertModal.value.isOpen = false;
      if (isSuccessState.value) {
        isSuccessState.value = false;
        newDomba.value = { code: '', name: '', type: '', birth_date: '', gender: '', status: '', origin: '', id_father: '', id_mother: '', photo_url: '', owner: '' };
        selectedFile.value = null;
        previewUrl.value = null;
        selectedPoel.value = '';
        props.onSuccess();
        props.onClose();
      }
    };

    return () => {
      if (!props.isOpen) return null;

      return (
        <Teleport to="body">
          <div class="peternakan-modal-overlay" onClick={props.onClose}>
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div class="peternakan-modal-header">
                <button class="peternakan-modal-close" onClick={props.onClose}>
                  <img src="/icon/close-cancel/grey-24.svg" alt="Tutup" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                </button>
                <div class="peternakan-modal-title">Tambah Populasi Domba</div>
              </div>

              <div class="peternakan-modal-body">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label text-secondary small fw-bold mb-2">Kode Domba (Ear Tag) <span class="text-danger">*</span></label>
                    <CustomInput 
                      modelValue={newDomba.value.code} 
                      placeholder="Contoh: D-007" 
                      onUpdate:modelValue={(val: string) => newDomba.value.code = val} 
                    />
                  </div>
                  <div class="col-12">
                    <label class="form-label text-secondary small fw-bold mb-2">Nama Domba <span class="text-danger">*</span></label>
                    <CustomInput 
                      modelValue={newDomba.value.name} 
                      placeholder="Masukkan nama domba" 
                      onUpdate:modelValue={(val: string) => newDomba.value.name = val} 
                    />
                  </div>
                  <div class="col-12">
                    <label class="form-label text-secondary small fw-bold mb-2">Ras/Jenis <span class="text-danger">*</span></label>
                    <CustomSelect 
                      placeholder="Pilih Ras/Jenis"
                      options={['Garut', 'Texel', 'Dorper', 'Merino', 'Dorper F2', 'F2 Garut', 'Cross Dorper']}
                      modelValue={newDomba.value.type}
                      onUpdate:modelValue={(val: string) => newDomba.value.type = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="form-label text-secondary small fw-bold mb-2">Jenis Kelamin <span class="text-danger">*</span></label>
                    <CustomSelect 
                      placeholder="Pilih Jenis Kelamin"
                      options={['Jantan', 'Betina']}
                      modelValue={newDomba.value.gender}
                      onUpdate:modelValue={(val: string) => newDomba.value.gender = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="form-label text-secondary small fw-bold mb-2">Kandang <span class="text-danger">*</span></label>
                    <CustomSelect 
                      placeholder="Pilih Kandang"
                      options={cagesList.value.map(cage => `${cage.code} — ${cage.name}`)}
                      modelValue={selectedCageId.value ? (cagesList.value.find(cage => String(cage.id) === String(selectedCageId.value))?.code + ' — ' + cagesList.value.find(cage => String(cage.id) === String(selectedCageId.value))?.name) : ''}
                      onUpdate:modelValue={(val: string) => {
                        const found = cagesList.value.find(cage => `${cage.code} — ${cage.name}` === val);
                        selectedCageId.value = found ? String(found.id) : '';
                      }}
                    />
                  </div>
                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2 d-block" style={{ marginBottom: '0.5rem' }}>Metode Penentuan Umur <span class="text-danger">*</span></label>
                  <div class="d-flex gap-4 mb-3">
                    <label class="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="umur_method_add" 
                        value="tanggal" 
                        checked={umurMethod.value === 'tanggal'}
                        onChange={() => umurMethod.value = 'tanggal'}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-800)' }}>Tanggal Lahir Pasti</span>
                    </label>
                    <label class="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="umur_method_add" 
                        value="poel" 
                        checked={umurMethod.value === 'poel'}
                        onChange={() => umurMethod.value = 'poel'}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-800)' }}>Perkiraan dari Poel</span>
                    </label>
                  </div>

                  {umurMethod.value === 'tanggal' ? (
                    <div>
                      <label class="form-label text-secondary small fw-bold mb-2">Tanggal Lahir <span class="text-danger">*</span></label>
                      <CustomInput 
                        modelValue={newDomba.value.birth_date} 
                        placeholder="YYYY-MM-DD" 
                        type="date"
                        onUpdate:modelValue={(val: string) => newDomba.value.birth_date = val} 
                      />
                    </div>
                  ) : (
                    <div>
                      <label class="form-label text-secondary small fw-bold mb-2">Perkiraan Umur (Poel) <span class="text-danger">*</span></label>
                      <CustomSelect 
                        placeholder="Pilih Perkiraan Umur"
                        options={poelOptions}
                        modelValue={selectedPoel.value}
                        onUpdate:modelValue={(val: string) => selectedPoel.value = val}
                      />
                      {computedPoelDate.value ? (
                        <small class="d-block mt-1 fw-bold" style={{ color: 'var(--color-primary)' }}>
                          Taksiran Tanggal Lahir: {computedPoelDate.value}
                        </small>
                      ) : (
                        <small class="text-muted d-block mt-1">Tanggal lahir akan otomatis di-set mundur dari hari ini sesuai perkiraan.</small>
                      )}
                    </div>
                  )}
                </div>
                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Status Awal <span class="text-danger">*</span></label>
                  <CustomSelect 
                    placeholder="Pilih Status Awal"
                    options={['Aktif', 'Produktif', 'Hamil', 'Sakit']}
                    modelValue={newDomba.value.status}
                    onUpdate:modelValue={(val: string) => newDomba.value.status = val}
                  />
                </div>
                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Asal Ternak <span class="text-danger">*</span></label>
                  <CustomSelect 
                    placeholder="Pilih Asal Ternak"
                    options={['Pembelian', 'Hibah']}
                    modelValue={newDomba.value.origin}
                    onUpdate:modelValue={(val: string) => newDomba.value.origin = val}
                  />
                </div>
                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Pemilik</label>
                  <CustomInput 
                    placeholder="Masukkan nama pemilik"
                    modelValue={newDomba.value.owner}
                    onUpdate:modelValue={(val: string) => newDomba.value.owner = val}
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
                <button class="peternakan-primary-btn w-100 m-0 justify-content-center" onClick={handleAddDomba} disabled={isLoading.value}>{isLoading.value ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </div>
          </div>
          {/* Custom Alert Modal */}
          {alertModal.value.isOpen && (
            <CustomAlertModal
              alert={alertModal.value}
              onClose={handleAlertClose}
            />
          )}
        </div>
      </Teleport>
      );
    };
  }
});
