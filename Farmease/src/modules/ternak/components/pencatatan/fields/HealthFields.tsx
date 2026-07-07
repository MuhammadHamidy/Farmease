import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import PencatatanField from '../PencatatanField';
import PencatatanInput from '../PencatatanInput';
import PencatatanSelect from '../PencatatanSelect';
import { metadataEnums } from '@/store/operatorAdmin';
import type { PencatatanFormItem } from '../PencatatanTypeFields';

export default defineComponent({
  name: 'HealthFields',
  props: {
    form: { type: Object as PropType<PencatatanFormItem>, required: true },
  },
  setup(props) {
    const f = () => props.form;
    return () => (
      <>
        {props.form.name === 'Pemeriksaan Rutin' || props.form.name === 'Pemeriksaan Kesehatan' ? (
          <>
            <PencatatanField label="Diagnosa" colClass="col-12" required>
              <PencatatanInput
                modelValue={f().tindakan}
                placeholder="Masukkan diagnosa hasil pemeriksaan (misal: Sehat, Kembung, Kudis...)"
                onUpdateModelValue={(v: string) => { f().tindakan = v; }}
              />
            </PencatatanField>
            <PencatatanField label="Tindakan" colClass="col-12" required>
              <PencatatanInput
                modelValue={f().obat}
                placeholder="Masukkan tindakan yang diberikan (misal: Pemberian vitamin, Observasi...)"
                onUpdateModelValue={(v: string) => { f().obat = v; }}
              />
            </PencatatanField>
          </>
        ) : (
          <>
            <PencatatanField label="Tindakan / Diagnosa" colClass="col-12" required>
              <PencatatanSelect
                modelValue={f().tindakan}
                options={metadataEnums.value.health_actions}
                placeholder="Pilih Tindakan / Diagnosa"
                onUpdateModelValue={(v: string) => { f().tindakan = v; }}
              />
            </PencatatanField>
            <PencatatanField label="Obat / Vitamin yang digunakan" colClass="col-12" required>
              <PencatatanSelect
                modelValue={f().obat}
                options={metadataEnums.value.medicines}
                placeholder="Pilih Obat / Vitamin"
                onUpdateModelValue={(v: string) => { f().obat = v; }}
              />
            </PencatatanField>
            <PencatatanField 
              label={
                f().tindakan?.toLowerCase() === 'vaksinasi' ? 'Jumlah Vaksin (ml) (opsional)' :
                f().tindakan?.toLowerCase() === 'pengobatan' ? 'Jumlah Obat (ml) (opsional)' :
                'Jumlah Vitamin (ml) (opsional)'
              } 
              colClass="col-12"
            >
              <PencatatanInput
                type="number"
                modelValue={f().vitaminAmount}
                placeholder="0.0"
                onUpdateModelValue={(v: string) => { f().vitaminAmount = v; }}
              />
            </PencatatanField>
          </>
        )}
        <PencatatanField label="Petugas Pemeriksa (opsional)" colClass="col-12">
          <PencatatanInput
            modelValue={f().petugas}
            placeholder="Masukkan nama petugas pemeriksa..."
            onUpdateModelValue={(v: string) => { f().petugas = v; }}
          />
        </PencatatanField>
      </>
    );
  }
});
