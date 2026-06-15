import { defineComponent, ref, watch, computed, type PropType } from 'vue';
import CustomInput from '@/shared/ui/Input';
import CustomSelect from '@/shared/ui/admin/Select';
import { sheep, addSheep, fetchSheep } from '@/store/livestock';
import { cagesList } from '@/store/navigation';
import { metadataEnums } from '@/store/operatorAdmin';

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
    });

    watch([umurMethod], ([newMethod]) => {
      if (newMethod === 'tanggal') {
        newDomba.value.birth_date = '';
      }
    });

    const handleAddDomba = async () => {
      const sheepData = newDomba.value;
      // Validasi dari DashboardView
      if (!sheepData.code || !sheepData.name || !sheepData.type || !sheepData.gender || (!sheepData.birth_date && umurMethod.value === 'tanggal') || (!selectedPoel.value && umurMethod.value === 'poel') || !sheepData.status || !sheepData.origin) {
        alert('Gagal: Mohon lengkapi semua kolom yang bertanda bintang (*) sebelum menyimpan.');
        return;
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
          'F2 Garut': '22222222-2222-2222-2222-222222222206'
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
          status: newDomba.value.status,
          origin: newDomba.value.origin,
          id_cage: props.cageId || (cagesList.value.length > 0 ? String(cagesList.value[0]?.id ?? '') : ''),
          id_type: String(resolvedIdType),
          id_father: newDomba.value.id_father ? String(newDomba.value.id_father) : null,
          id_mother: newDomba.value.id_mother ? String(newDomba.value.id_mother) : null,
        };

        await addSheep(payload);
        
        newDomba.value = { code: '', name: '', type: '', birth_date: '', gender: '', status: '', origin: '', id_father: '', id_mother: '' };
        selectedPoel.value = '';
        
        props.onSuccess();
        props.onClose();
      } catch (error: any) {
        console.error('Failed to add sheep:', error);
        const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Terjadi kesalahan tidak diketahui.';
        alert(`Gagal menyimpan data domba.\n\nJika ini masalah duplikasi, pastikan Kode Domba (Ear Tag) belum pernah digunakan.\nDetail: ${errorMsg}`);
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
                    options={['Garut', 'Texel', 'Dorper', 'Merino', 'F2 Dorper', 'F2 Garut']}
                    modelValue={newDomba.value.type}
                    onUpdate:modelValue={(val: string) => newDomba.value.type = val}
                  />
                </div>
                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Jenis Kelamin <span class="text-danger">*</span></label>
                  <CustomSelect 
                    placeholder="Pilih Jenis Kelamin"
                    options={metadataEnums.value.gender}
                    modelValue={newDomba.value.gender}
                    onUpdate:modelValue={(val: string) => newDomba.value.gender = val}
                  />
                </div>
                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2 d-block" style={{ marginBottom: '0.5rem' }}>Metode Penentuan Umur <span class="text-danger">*</span></label>
                  <div class="d-flex gap-4 mb-3">
                    <label class="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input type="radio" value="tanggal" v-model={umurMethod.value} />
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-800)' }}>Tanggal Lahir Pasti</span>
                    </label>
                    <label class="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input type="radio" value="poel" v-model={umurMethod.value} />
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
                    options={metadataEnums.value.sheep_status}
                    modelValue={newDomba.value.status}
                    onUpdate:modelValue={(val: string) => newDomba.value.status = val}
                  />
                </div>
                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Asal Ternak <span class="text-danger">*</span></label>
                  <CustomSelect 
                    placeholder="Pilih Asal Ternak"
                    options={['Ternak Sendiri', 'Pembelian', 'Hibah', 'Kelahiran di Kandang']}
                    modelValue={newDomba.value.origin}
                    onUpdate:modelValue={(val: string) => newDomba.value.origin = val}
                  />
                </div>
                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Bapak — Opsional</label>
                  <CustomSelect
                    options={['— Tidak Diketahui —', ...sheep.value.filter(sheepItem => sheepItem.gender === 'jantan').map(sheepItem => `${sheepItem.code} — ${sheepItem.name}`)]}
                    modelValue={newDomba.value.id_father ? (sheep.value.find(sheepItem => sheepItem.id === newDomba.value.id_father)?.code + ' — ' + sheep.value.find(sheepItem => sheepItem.id === newDomba.value.id_father)?.name) : '— Tidak Diketahui —'}
                    onUpdate:modelValue={(val: string) => {
                      const found = sheep.value.find(sheepItem => val.startsWith(sheepItem.code));
                      newDomba.value.id_father = found ? found.id : '';
                    }}
                  />
                </div>
                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Ibu — Opsional</label>
                  <CustomSelect
                    options={['— Tidak Diketahui —', ...sheep.value.filter(sheepItem => sheepItem.gender === 'betina').map(sheepItem => `${sheepItem.code} — ${sheepItem.name}`)]}
                    modelValue={newDomba.value.id_mother ? (sheep.value.find(sheepItem => sheepItem.id === newDomba.value.id_mother)?.code + ' — ' + sheep.value.find(sheepItem => sheepItem.id === newDomba.value.id_mother)?.name) : '— Tidak Diketahui —'}
                    onUpdate:modelValue={(val: string) => {
                      const found = sheep.value.find(sheepItem => val.startsWith(sheepItem.code));
                      newDomba.value.id_mother = found ? found.id : '';
                    }}
                  />
                </div>
              </div>

              <div class="mt-4 pt-3 border-top border-light">
                <button class="peternakan-primary-btn w-100 m-0 justify-content-center" onClick={handleAddDomba} disabled={isLoading.value}>{isLoading.value ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </div>
          </div>
        </div>
      );
    };
  }
});
