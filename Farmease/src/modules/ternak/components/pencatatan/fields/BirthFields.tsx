import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import PencatatanField from '../PencatatanField';
import PencatatanInput from '../PencatatanInput';
import PencatatanSelect from '../PencatatanSelect';
import { cagesList } from '@/store/navigation';
import { sheep } from '@/store/livestock';
import { metadataEnums } from '@/store/operatorAdmin';
import type { PencatatanFormItem } from '../PencatatanTypeFields';

export default defineComponent({
  name: 'BirthFields',
  props: {
    form: { type: Object as PropType<PencatatanFormItem>, required: true },
  },
  setup(props) {
    const f = () => props.form;

    const isSameParentError = computed(() => {
      const motherClean = String(f().targetId || '').trim().toUpperCase();
      const fatherClean = String(f().idPejantan || '').trim().toUpperCase();
      if (!motherClean || !fatherClean) return false;
      if (motherClean === fatherClean) return true;

      const motherSheep = sheep.value.find(s => s.code.toUpperCase() === motherClean || String(s.id) === motherClean);
      const fatherSheep = sheep.value.find(s => s.code.toUpperCase() === fatherClean || String(s.id) === fatherClean);
      return !!(motherSheep && fatherSheep && motherSheep.id === fatherSheep.id);
    });

    const isSelectedCageFull = computed(() => {
      const selectedCode = f().kandangAnak;
      if (!selectedCode) return false;
      const cage = cagesList.value.find(c => c.code === selectedCode);
      const capacity = cage?.capacity || 50;
      
      const currentSheepCount = sheep.value.filter(s => s.cage_code === selectedCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status)).length;
      return currentSheepCount >= capacity;
    });

    return () => (
      <>
        {props.form.name === 'Keguguran' ? (
          <>
            <PencatatanField label="Tanggal Keguguran" colClass="col-12" required>
              <PencatatanInput
                type="date"
                modelValue={f().tanggal}
                placeholder="YYYY-MM-DD"
                onUpdateModelValue={(v: string) => { f().tanggal = v; }}
              />
            </PencatatanField>
          </>
        ) : (
          <>
            <PencatatanField label="ID Pejantan" colClass="col-12" required>
              <PencatatanInput
                modelValue={f().idPejantan}
                placeholder="Misal: D-010"
                iconSrc="/icon/domba.png"
                onUpdateModelValue={(v: string) => { f().idPejantan = v; }}
              />
            </PencatatanField>
            {isSameParentError.value && (
              <div class="col-12 mt-1 mb-2 animate-fade-in text-start">
                <div class="p-2.5 rounded-3 border-0 small text-danger fw-bold" style={{ backgroundColor: 'rgba(235, 64, 52, 0.12)', color: '#d32f2f' }}>
                  ⚠️ Error: Induk jantan dan induk betina tidak boleh domba yang sama!
                </div>
              </div>
            )}
            <PencatatanField label="Kode Ear Tag Anak" colClass="col-12" required>
              <PencatatanInput
                modelValue={f().sheepCode}
                placeholder="Masukkan nomor eartag (Misal: A-001)"
                onUpdateModelValue={(v: string) => { f().sheepCode = v; }}
              />
            </PencatatanField>
            <PencatatanField label="Nama Anak (Baru)" colClass="col-12" required>
              <PencatatanInput
                modelValue={f().namaAnak}
                placeholder="Masukkan nama domba"
                onUpdateModelValue={(v: string) => { f().namaAnak = v; }}
              />
            </PencatatanField>
            <PencatatanField label="Jenis Kelamin Anak" colClass="col-12" required>
              <PencatatanSelect
                modelValue={f().genderAnak}
                options={[
                  { value: 'jantan', label: 'Jantan (Pejantan)' },
                  { value: 'betina', label: 'Betina (Indukan)' }
                ]}
                placeholder="Pilih Jenis Kelamin Anak"
                onUpdateModelValue={(v: string) => { f().genderAnak = v; }}
              />
            </PencatatanField>
            <PencatatanField label="Kode Kandang (Untuk Anak)" colClass="col-12" required>
              <PencatatanSelect
                modelValue={f().kandangAnak}
                options={cagesList.value.map(c => {
                  const currentCount = sheep.value.filter(s => s.cage_code === c.code && !['Mati', 'Terjual', 'Disembelih'].includes(s.status)).length;
                  const capacity = c.capacity || 50;
                  return {
                    value: c.code,
                    label: `${c.name} (${c.code}) — Terisi: ${currentCount}/${capacity}`
                  };
                })}
                placeholder="Pilih Kandang untuk Anak"
                onUpdateModelValue={(v: string) => { f().kandangAnak = v; }}
              />
            </PencatatanField>
            {isSelectedCageFull.value && (
              <div class="col-12 mt-1 mb-2 animate-fade-in text-start">
                <div class="p-2.5 rounded-3 border-0 small text-danger fw-bold" style={{ backgroundColor: 'rgba(235, 64, 52, 0.12)', color: '#d32f2f' }}>
                  ⚠️ Peringatan: Kandang ini sudah penuh! Silakan pilih kandang lain.
                </div>
              </div>
            )}
            <PencatatanField label="Tanggal Lahir" colClass="col-12" required>
              <PencatatanInput
                type="date"
                modelValue={f().tanggal}
                placeholder="YYYY-MM-DD"
                onUpdateModelValue={(v: string) => { f().tanggal = v; }}
              />
            </PencatatanField>
            <PencatatanField label="Berat Badan Anak" colClass="col-12" required>
              <PencatatanInput
                type="number"
                modelValue={f().beratLahir}
                placeholder="0.0"
                onUpdateModelValue={(v: string) => { f().beratLahir = v; }}
              />
            </PencatatanField>
            <PencatatanField label="Satuan" colClass="col-12">
              <PencatatanSelect
                modelValue={f().unit}
                options={['kg']}
                placeholder="Pilih Satuan"
                onUpdateModelValue={(v: string) => { f().unit = v; }}
              />
            </PencatatanField>
            <PencatatanField label="Jumlah Anak" colClass="col-12" required>
              <PencatatanInput
                type="number"
                modelValue={f().jumlahAnak}
                placeholder="0"
                onUpdateModelValue={(v: string) => { f().jumlahAnak = v; }}
              />
            </PencatatanField>
            <PencatatanField label="Kondisi Anak" colClass="col-12">
              <PencatatanSelect
                modelValue={f().kondisiAnak}
                options={metadataEnums.value.offspring_condition}
                placeholder="Pilih Kondisi Anak"
                onUpdateModelValue={(v: string) => { f().kondisiAnak = v; }}
              />
            </PencatatanField>
            <PencatatanField label="Kondisi Induk" colClass="col-12">
              <PencatatanSelect
                modelValue={f().kondisiInduk}
                options={metadataEnums.value.dam_conditions}
                placeholder="Pilih Kondisi Induk"
                onUpdateModelValue={(v: string) => { f().kondisiInduk = v; }}
              />
            </PencatatanField>
          </>
        )}
      </>
    );
  }
});
