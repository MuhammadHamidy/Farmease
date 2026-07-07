import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import PencatatanField from '../PencatatanField';
import PencatatanInput from '../PencatatanInput';
import PencatatanSelect from '../PencatatanSelect';
import type { PencatatanFormItem } from '../PencatatanTypeFields';

export default defineComponent({
  name: 'WeightFields',
  props: {
    form: { type: Object as PropType<PencatatanFormItem>, required: true },
  },
  setup(props) {
    const f = () => props.form;
    return () => (
      <>
        <PencatatanField label="Berat Badan" colClass="col-12" required>
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
            options={['kg']}
            placeholder="Pilih Satuan"
            onUpdateModelValue={(v: string) => { f().unit = v; }}
          />
        </PencatatanField>
      </>
    );
  }
});
