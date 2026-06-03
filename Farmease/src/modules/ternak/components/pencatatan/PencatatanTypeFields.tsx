import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import PencatatanField from './PencatatanField';
import PencatatanInput from './PencatatanInput';
import PencatatanSelect from './PencatatanSelect';
import PencatatanTextarea from './PencatatanTextarea';
import PencatatanModeToggle from './PencatatanModeToggle';
import type { PencatatanMode } from './PencatatanModeToggle';

export type PencatatanFormItem = {
  id: string;
  name: string;
  mode: PencatatanMode;
  targetId: string;
  qty: string;
  unit: string;
  note: string;
  tindakan: string;
  obat: string;
  vitaminAmount: string;
  kotoranState: string;
  idPejantan: string;
  metoda: string;
  jumlahAnak: string;
  kondisiInduk: string;
  kondisiAnak: string;
  tanggal: string;
};

export default defineComponent({
  name: 'PencatatanTypeFields',
  props: {
    jenisId: { type: String, required: true },
    form: { type: Object as PropType<PencatatanFormItem>, required: true },
    showModeToggle: { type: Boolean, default: false },
    onModeChange: { type: Function as PropType<(mode: PencatatanMode) => void>, default: null },
  },
  setup(props) {
    const f = () => props.form;

    return () => (
      <>
        {props.showModeToggle && (
          <div class="d-flex justify-content-end mb-3">
            <PencatatanModeToggle
              modelValue={f().mode}
              onUpdateModelValue={(mode: PencatatanMode) => props.onModeChange?.(mode)}
            />
          </div>
        )}

        <div class="row g-4">
          <PencatatanField
            label={f().mode === 'individu' ? 'ID Ternak' : 'ID Kandang'}
            colClass="col-md-6"
            required
          >
            <PencatatanInput
              modelValue={f().targetId}
              placeholder={f().mode === 'individu' ? 'Misal: D-001' : 'Misal: K-001'}
              iconSrc={f().mode === 'individu' ? '/icon/domba.png' : '/icon/kandang.png'}
              onUpdateModelValue={(v: string) => { f().targetId = v; }}
            />
          </PencatatanField>

          {props.jenisId === 'pakan' && (
            <>
              <PencatatanField label="Jumlah Pakan" colClass="col-md-4">
                <PencatatanInput
                  modelValue={f().qty}
                  placeholder="0.0"
                  onUpdateModelValue={(v: string) => { f().qty = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Satuan" colClass="col-md-2">
                <PencatatanSelect
                  modelValue={f().unit}
                  options={['kg', 'ikat']}
                  onUpdateModelValue={(v: string) => { f().unit = v; }}
                />
              </PencatatanField>
            </>
          )}

          {props.jenisId === 'kesehatan' && (
            <>
              <PencatatanField label="Tanggal Pelaksanaan" colClass="col-md-6">
                <PencatatanInput
                  type="date"
                  modelValue={f().tanggal}
                  onUpdateModelValue={(v: string) => { f().tanggal = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Tindakan / Diagnosa" colClass="col-12">
                <PencatatanInput
                  modelValue={f().tindakan}
                  placeholder="Misal: Pemberian De-worming / Vitamin"
                  onUpdateModelValue={(v: string) => { f().tindakan = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Obat / Vitamin yang digunakan" colClass="col-md-7">
                <PencatatanInput
                  modelValue={f().obat}
                  placeholder="Misal: B-Complex"
                  onUpdateModelValue={(v: string) => { f().obat = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Jumlah Vitamin (opsional)" colClass="col-md-5">
                <PencatatanInput
                  modelValue={f().vitaminAmount}
                  placeholder="0"
                  onUpdateModelValue={(v: string) => { f().vitaminAmount = v; }}
                />
              </PencatatanField>
            </>
          )}

          {props.jenisId === 'kotoran' && (
            <>
              <PencatatanField label="Jumlah Produksi" colClass="col-md-4">
                <PencatatanInput
                  modelValue={f().qty}
                  placeholder="0.0"
                  onUpdateModelValue={(v: string) => { f().qty = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Satuan" colClass="col-md-2">
                <PencatatanSelect
                  modelValue={f().unit}
                  options={['kg', 'karung']}
                  onUpdateModelValue={(v: string) => { f().unit = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Kondisi Kotoran" colClass="col-md-6">
                <PencatatanSelect
                  modelValue={f().kotoranState}
                  options={[
                    { value: 'basah', label: 'Basah' },
                    { value: 'kering', label: 'Kering' },
                    { value: 'campur', label: 'Campuran' },
                  ]}
                  onUpdateModelValue={(v: string) => { f().kotoranState = v; }}
                />
              </PencatatanField>
            </>
          )}

          {props.jenisId === 'perkawinan' && (
            <>
              <PencatatanField label="ID Pejantan" colClass="col-md-6">
                <PencatatanInput
                  modelValue={f().idPejantan}
                  placeholder="Misal: D-010"
                  iconSrc="/icon/domba.png"
                  onUpdateModelValue={(v: string) => { f().idPejantan = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Metoda Perkawinan" colClass="col-md-6">
                <PencatatanSelect
                  modelValue={f().metoda}
                  options={[
                    { value: 'alami', label: 'Kawin Alam' },
                    { value: 'suntik', label: 'Inseminasi Buatan' },
                  ]}
                  onUpdateModelValue={(v: string) => { f().metoda = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Tanggal Perkawinan" colClass="col-md-12">
                <PencatatanInput
                  type="date"
                  modelValue={f().tanggal}
                  onUpdateModelValue={(v: string) => { f().tanggal = v; }}
                />
              </PencatatanField>
            </>
          )}

          {props.jenisId === 'kelahiran' && (
            <>
              <PencatatanField label="Jumlah Anak" colClass="col-md-4">
                <PencatatanInput
                  type="number"
                  modelValue={f().jumlahAnak}
                  placeholder="0"
                  onUpdateModelValue={(v: string) => { f().jumlahAnak = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Kondisi Induk" colClass="col-md-4">
                <PencatatanSelect
                  modelValue={f().kondisiInduk}
                  options={['Sehat', 'Lemas', 'Perlu Penanganan']}
                  onUpdateModelValue={(v: string) => { f().kondisiInduk = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Kondisi Anak" colClass="col-md-4">
                <PencatatanSelect
                  modelValue={f().kondisiAnak}
                  options={['Sehat', 'Lemas', 'Cacat', 'Mati']}
                  onUpdateModelValue={(v: string) => { f().kondisiAnak = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Tanggal Kelahiran" colClass="col-md-12">
                <PencatatanInput
                  type="date"
                  modelValue={f().tanggal}
                  onUpdateModelValue={(v: string) => { f().tanggal = v; }}
                />
              </PencatatanField>
            </>
          )}

          <PencatatanField label="Catatan / Note" colClass="col-12">
            <PencatatanTextarea
              modelValue={f().note}
              placeholder="Tuliskan catatan observasi tambahan..."
              onUpdateModelValue={(v: string) => { f().note = v; }}
            />
          </PencatatanField>
        </div>
      </>
    );
  },
});
