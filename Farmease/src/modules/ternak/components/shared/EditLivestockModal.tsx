import { defineComponent, ref, watch, computed, type PropType } from 'vue';
import CustomInput from '@/shared/ui/Input';
import CustomSelect from '@/shared/ui/admin/Select';
import { updateSheep, updateSheepStatus, sheep } from '@/store/livestock';
import { metadataEnums } from '@/store/operatorAdmin';

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
    });

    const statusOptions = ['Sehat', 'Sakit', 'Hamil', 'Melahirkan', 'Dijual', 'Mati'];

    watch([() => props.isOpen, () => props.sheepData], ([open, sheepData]) => {
      if (open && sheepData) {
        const typeMapReverse: Record<string, string> = {
          '22222222-2222-2222-2222-222222222201': 'Garut',
          '22222222-2222-2222-2222-222222222202': 'Texel',
          '22222222-2222-2222-2222-222222222203': 'Dorper',
          '22222222-2222-2222-2222-222222222204': 'Merino',
          '22222222-2222-2222-2222-222222222205': 'F2 Dorper',
          '22222222-2222-2222-2222-222222222206': 'F2 Garut'
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
        };
        // Reset umurMethod to tanggal since we load the actual date
        umurMethod.value = 'tanggal';
        selectedPoel.value = '';
      }
    }, { immediate: true });

    const handleEditDomba = async () => {
      const sheepData = editDomba.value;
      if (!sheepData.code || !sheepData.name || !sheepData.type || !sheepData.gender || (!sheepData.birth_date && umurMethod.value === 'tanggal') || (!selectedPoel.value && umurMethod.value === 'poel') || !sheepData.origin) {
        alert('Gagal: Mohon lengkapi semua kolom yang bertanda bintang (*) sebelum menyimpan.');
        return;
      }

      try {
        isLoading.value = true;
        
        const typeMap: Record<string, string> = {
          'Garut': '22222222-2222-2222-2222-222222222201',
          'Texel': '22222222-2222-2222-2222-222222222202',
          'Dorper': '22222222-2222-2222-2222-222222222203',
          'Merino': '22222222-2222-2222-2222-222222222204',
          'F2 Dorper': '22222222-2222-2222-2222-222222222205',
          'F2 Garut': '22222222-2222-2222-2222-222222222206'
        };
        const resolvedIdType = typeMap[editDomba.value.type] || '22222222-2222-2222-2222-222222222201';

        const payload = {
          sheep_code: editDomba.value.code,
          sheep_name: editDomba.value.name,
          gender: editDomba.value.gender.toLowerCase(),
          date_of_birth: umurMethod.value === 'tanggal' 
            ? (editDomba.value.birth_date ? new Date(editDomba.value.birth_date).toISOString() : null)
            : computedPoelDateIso.value,
          origin: editDomba.value.origin,
          id_type: String(resolvedIdType),
          id_father: editDomba.value.id_father ? String(editDomba.value.id_father) : null,
          id_mother: editDomba.value.id_mother ? String(editDomba.value.id_mother) : null,
        };

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
        alert(`Gagal menyimpan perubahan profil domba.\nDetail: ${errorMsg}`);
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
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Nama Domba <span class="text-danger">*</span></label>
                  <CustomInput
                    placeholder="Masukkan nama domba"
                    modelValue={editDomba.value.name}
                    onUpdate:modelValue={(v: string) => editDomba.value.name = v}
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Ras/Jenis <span class="text-danger">*</span></label>
                  <CustomSelect
                    placeholder="Pilih Ras/Jenis"
                    options={['Garut', 'Texel', 'Dorper', 'Merino', 'F2 Dorper', 'F2 Garut']}
                    modelValue={editDomba.value.type}
                    onUpdate:modelValue={(v: string) => editDomba.value.type = v}
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Jenis Kelamin <span class="text-danger">*</span></label>
                  <CustomSelect
                    placeholder="Pilih Jenis Kelamin"
                    options={['Jantan', 'Betina']}
                    modelValue={editDomba.value.gender}
                    onUpdate:modelValue={(v: string) => editDomba.value.gender = v}
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2 d-block" style={{ marginBottom: '0.5rem' }}>Metode Penentuan Umur <span class="text-danger">*</span></label>
                  <div class="d-flex gap-4 mb-3">
                    <label class="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="umur_method_edit" 
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
                        name="umur_method_edit" 
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
                        type="date"
                        placeholder="YYYY-MM-DD"
                        modelValue={editDomba.value.birth_date}
                        onUpdate:modelValue={(v: string) => editDomba.value.birth_date = v}
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
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Bapak — Opsional</label>
                  <CustomSelect
                    options={['— Tidak Diketahui —', ...sheep.value.filter(sheepItem => sheepItem.gender === 'jantan' && String(sheepItem.id) !== String(props.sheepData?.id_sheep || props.sheepData?.id)).map(sheepItem => `${sheepItem.code} — ${sheepItem.name}`)]}
                    modelValue={editDomba.value.id_father ? (sheep.value.find(sheepItem => String(sheepItem.id) === String(editDomba.value.id_father))?.code + ' — ' + sheep.value.find(sheepItem => String(sheepItem.id) === String(editDomba.value.id_father))?.name) : '— Tidak Diketahui —'}
                    onUpdate:modelValue={(val: string) => {
                      if (val === '— Tidak Diketahui —') editDomba.value.id_father = '';
                      else editDomba.value.id_father = sheep.value.find(sheepItem => `${sheepItem.code} — ${sheepItem.name}` === val)?.id || '';
                    }}
                    placeholder="Pilih Bapak"
                  />
                </div>

                <div class="col-12">
                  <label class="form-label text-secondary small fw-bold mb-2">Ibu — Opsional</label>
                  <CustomSelect
                    options={['— Tidak Diketahui —', ...sheep.value.filter(sheepItem => sheepItem.gender === 'betina' && String(sheepItem.id) !== String(props.sheepData?.id_sheep || props.sheepData?.id)).map(sheepItem => `${sheepItem.code} — ${sheepItem.name}`)]}
                    modelValue={editDomba.value.id_mother ? (sheep.value.find(sheepItem => String(sheepItem.id) === String(editDomba.value.id_mother))?.code + ' — ' + sheep.value.find(sheepItem => String(sheepItem.id) === String(editDomba.value.id_mother))?.name) : '— Tidak Diketahui —'}
                    onUpdate:modelValue={(val: string) => {
                      if (val === '— Tidak Diketahui —') editDomba.value.id_mother = '';
                      else editDomba.value.id_mother = sheep.value.find(sheepItem => `${sheepItem.code} — ${sheepItem.name}` === val)?.id || '';
                    }}
                    placeholder="Pilih Ibu"
                  />
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
        </div>
      );
    };
  }
});
