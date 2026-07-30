import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import PencatatanField from '../PencatatanField';
import PencatatanInput from '../PencatatanInput';
import PencatatanSelect from '../PencatatanSelect';
import { metadataEnums } from '@/store/operatorAdmin';
import type { PencatatanFormItem } from '../PencatatanTypeFields';

export default defineComponent({
  name: 'FecesFields',
  props: {
    form: { type: Object as PropType<PencatatanFormItem>, required: true },
  },
  setup(props) {
    const f = () => props.form;
    return () => (
      <>
        <PencatatanField label="Jumlah Panen" colClass="col-12" required>
          <PencatatanInput
            type="number"
            modelValue={f().qty}
            placeholder="0.0"
            onUpdateModelValue={(v: string) => { f().qty = v; }}
          />
        </PencatatanField>
        <PencatatanField label="Satuan" colClass="col-12">
          <PencatatanSelect
            modelValue={f().unit}
            options={['kg', 'karung']}
            placeholder="Pilih Satuan"
            onUpdateModelValue={(v: string) => { f().unit = v; }}
          />
        </PencatatanField>
        <PencatatanField label="Kondisi Kotoran" colClass="col-12">
          <PencatatanSelect
            modelValue={f().kotoranState}
            options={metadataEnums.value.manure_conditions}
            placeholder="Pilih Kondisi Kotoran"
            onUpdateModelValue={(v: string) => { f().kotoranState = v; }}
          />
        </PencatatanField>
      </>
    );
  }
});
