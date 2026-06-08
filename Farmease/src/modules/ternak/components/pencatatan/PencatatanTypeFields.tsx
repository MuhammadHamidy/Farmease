import { defineComponent, computed, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import PencatatanField from './PencatatanField';
import PencatatanInput from './PencatatanInput';
import PencatatanSelect from './PencatatanSelect';
import PencatatanTextarea from './PencatatanTextarea';
import { landsList, fetchLandsList } from '@/store/navigation';
import PencatatanModeToggle from './PencatatanModeToggle';
import type { PencatatanMode } from './PencatatanModeToggle';
import { stocks } from '@/modules/ternak/store/peternakan';
import { sheep } from '@/store/livestock';
import { breedingApi } from '@/shared/api';
import { ref } from 'vue';

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
  pemanfaatan: string;
  kandangAnak: string;
  namaAnak: string;
  beratLahir: string;
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

    const feedStockOptions = computed(() => {
      return stocks.value
        .filter((s: any) => s.category.includes('Pakan'))
        .map((s: any) => ({
          value: s.name,
          label: s.name
        }));
    });

    // Kalkulasi Otomatis Pakan berdasarkan ID
    watch(
      () => f().targetId,
      (newTarget) => {
        if (props.jenisId === 'pakan' && newTarget && newTarget.length > 2) {
          const hash = newTarget.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const calculatedQty = ((hash % 25) / 10 + 2.5).toFixed(1); 
          f().qty = calculatedQty;
          
          if (!f().obat && feedStockOptions.value.length > 0) {
             f().obat = feedStockOptions.value[0]?.value || '';
          }
        }
      }
    );

    onMounted(() => {
      if (landsList.value.length === 0) {
        fetchLandsList();
      }
    });

    const isKonversi = computed(() => props.form.name === 'Konversi Pakan');

    const inbreedingResult = ref<{ safe: boolean; text: string; error?: boolean } | null>(null);
    let inbreedingTimeout: any = null;

    watch([() => props.form.targetId, () => props.form.idPejantan], ([id1Str, id2Str]) => {
      if (props.jenisId !== 'perkawinan') return;
      if (!id1Str || !id2Str) {
        inbreedingResult.value = null;
        return;
      }
      
      clearTimeout(inbreedingTimeout);
      inbreedingTimeout = setTimeout(async () => {
        const id1 = id1Str.trim().toUpperCase();
        const id2 = id2Str.trim().toUpperCase();
        
        const male = sheep.value.find(s => s.code.toUpperCase() === id2);
        const female = sheep.value.find(s => s.code.toUpperCase() === id1);
        
        if (!male || !female) {
          inbreedingResult.value = { safe: true, text: 'ID Domba tidak ditemukan di database.', error: true };
          return;
        }

        if (id1 === id2) {
          inbreedingResult.value = { 
            safe: false, 
            text: '⚠️ PERINGATAN INBREEDING: Risiko 100% (Sangat Berisiko). ID Ternak betina dan pejantan tidak boleh sama!' 
          };
          return;
        }

        try {
          const res = await breedingApi.checkInbreeding(Number(male.id), Number(female.id));
          const flag = res?.inbreeding_flag ?? false;
          const pct = res?.inbreeding_percentage ? res.inbreeding_percentage.toFixed(2) + '%' : '';
          const category = res?.risk_category ? `(${res.risk_category})` : '';
          
          if (flag) {
            inbreedingResult.value = {
              safe: false,
              text: `⚠️ PERINGATAN INBREEDING: Risiko ${pct} ${category}. ${res?.recommendation || 'Perkawinan ini memiliki risiko genetik tinggi.'}`
            };
          } else {
            inbreedingResult.value = {
              safe: true,
              text: `✅ Aman: ${res?.recommendation || 'Tidak terdeteksi hubungan kekerabatan dekat.'} Risiko ${pct} ${category}.`
            };
          }
        } catch (e) {
          inbreedingResult.value = { safe: true, text: 'Gagal mengecek inbreeding dari server.', error: true };
        }
      }, 800);
    }, { immediate: true });

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
          {props.jenisId !== 'stok_pakan' && (
            <PencatatanField
              label={f().mode === 'individu' ? ((props.jenisId === 'perkawinan' || props.jenisId === 'kelahiran') ? 'ID Ternak (Indukan Betina)' : 'ID Ternak') : 'ID Kandang'}
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
          )}

          {props.jenisId === 'pakan' && (
            <>
              <PencatatanField label="Jenis Pakan" colClass="col-md-12" required>
                <PencatatanSelect
                  modelValue={f().obat}
                  options={feedStockOptions.value}
                  placeholder={feedStockOptions.value.length > 0 ? "Pilih Pakan" : "Stok pakan kosong"}
                  onUpdateModelValue={(v: string) => { f().obat = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Jumlah Pakan (Otomatis berdasar ID)" colClass="col-md-8" required>
                <PencatatanInput
                  modelValue={f().qty}
                  placeholder="Otomatis dihitung..."
                  onUpdateModelValue={(v: string) => { f().qty = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Satuan" colClass="col-md-4">
                <PencatatanSelect
                  modelValue={f().unit}
                  options={['kg', 'ikat']}
                  onUpdateModelValue={(v: string) => { f().unit = v; }}
                />
              </PencatatanField>
            </>
          )}

          {props.jenisId === 'stok_pakan' && (
            <>
              {!isKonversi.value ? (
                <>
                  <PencatatanField label="Nama Pakan / Sumber" colClass="col-md-6" required>
                    <PencatatanSelect
                      modelValue={f().obat}
                      options={[
                        { value: 'Rumput Gajah', label: 'Rumput Gajah' },
                        { value: 'Konsentrat Premium', label: 'Konsentrat Premium' },
                        { value: 'Silase Daun Alpukat', label: 'Silase Daun Alpukat' },
                        { value: 'Pakan Rumput Cacah', label: 'Pakan Rumput Cacah' },
                        { value: 'Daun Alpukat (Mentah)', label: 'Daun Alpukat (Mentah)' },
                        { value: 'Daun Kelengkeng (Mentah)', label: 'Daun Kelengkeng (Mentah)' },
                        { value: 'Gulma / Rumput Liar (Mentah)', label: 'Gulma / Rumput Liar (Mentah)' }
                      ]}
                      onUpdateModelValue={(v: string) => { f().obat = v; }}
                    />
                  </PencatatanField>
                  <PencatatanField label="Jumlah Masuk" colClass="col-md-3" required>
                    <PencatatanInput
                      modelValue={f().qty}
                      placeholder="0.0"
                      onUpdateModelValue={(v: string) => { f().qty = v; }}
                    />
                  </PencatatanField>
                  <PencatatanField label="Satuan" colClass="col-md-3">
                    <PencatatanSelect
                      modelValue={f().unit}
                      options={['kg', 'ikat', 'liter', 'ton']}
                      onUpdateModelValue={(v: string) => { f().unit = v; }}
                    />
                  </PencatatanField>
                </>
              ) : (
                <>
                  <PencatatanField label="Pakan Mentah Asal (Dari Kebun)" colClass="col-md-6" required>
                    <PencatatanSelect
                      modelValue={f().obat}
                      options={[
                        { value: 'Daun Alpukat (Mentah)', label: 'Daun Alpukat (Mentah)' },
                        { value: 'Daun Kelengkeng (Mentah)', label: 'Daun Kelengkeng (Mentah)' },
                        { value: 'Gulma / Rumput Liar (Mentah)', label: 'Gulma / Rumput Liar (Mentah)' }
                      ]}
                      onUpdateModelValue={(v: string) => { f().obat = v; }}
                    />
                  </PencatatanField>
                  <PencatatanField label="Jumlah Diolah" colClass="col-md-6" required>
                    <PencatatanInput
                      modelValue={f().qty}
                      placeholder="Jumlah berat mentah (kg)"
                      onUpdateModelValue={(v: string) => { f().qty = v; }}
                    />
                  </PencatatanField>
                  
                  <PencatatanField label="Hasil Cacah Jadi (Stok Pakan)" colClass="col-md-6" required>
                    <PencatatanSelect
                      modelValue={f().idPejantan}
                      options={[
                        { value: 'Pakan Rumput Cacah', label: 'Pakan Rumput Cacah' },
                        { value: 'Silase Daun Alpukat', label: 'Silase Daun Alpukat' },
                        { value: 'Silase Daun Kelengkeng', label: 'Silase Daun Kelengkeng' }
                      ]}
                      onUpdateModelValue={(v: string) => { f().idPejantan = v; }}
                    />
                  </PencatatanField>
                  <PencatatanField label="Jumlah Hasil Jadi" colClass="col-md-6" required>
                    <PencatatanInput
                      modelValue={f().vitaminAmount}
                      placeholder="Jumlah berat hasil cacah (kg)"
                      onUpdateModelValue={(v: string) => { f().vitaminAmount = v; }}
                    />
                  </PencatatanField>
                </>
              )}
            </>
          )}

          {props.jenisId === 'kesehatan' && (
            <>
              <PencatatanField label="Tindakan / Diagnosa" colClass="col-12" required>
                <PencatatanInput
                  modelValue={f().tindakan}
                  placeholder="Misal: Pemberian De-worming / Vitamin"
                  onUpdateModelValue={(v: string) => { f().tindakan = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Obat / Vitamin yang digunakan" colClass="col-md-7" required>
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
              {f().name === 'Fermentasi' && (
                <PencatatanField label="Jenis Pemanfaatan" colClass="col-12" required>
                  <PencatatanSelect
                    modelValue={f().pemanfaatan}
                    options={[
                      { value: 'Pupuk Organik Kebun', label: 'Dijadikan Pupuk Organik di Kebun' },
                      { value: 'Dijual', label: 'Dijual' },
                      { value: 'Lainnya', label: 'Lainnya' },
                    ]}
                    onUpdateModelValue={(v: string) => { f().pemanfaatan = v; }}
                  />
                </PencatatanField>
              )}
              <PencatatanField label="Jumlah Produksi" colClass="col-md-4" required>
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
              <PencatatanField label="ID Pejantan" colClass="col-md-6" required>
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

              {/* Automatic Pedigree Check Result */}
              {inbreedingResult.value && (
                <div class="col-12 mt-2 animate-fade-in">
                  <div
                    class={['alert py-3 rounded-4 border-0 small m-0', !inbreedingResult.value.safe && !inbreedingResult.value.error ? 'alert-danger' : 'alert-success']} 
                    style={{
                      backgroundColor: !inbreedingResult.value.safe && !inbreedingResult.value.error ? 'var(--color-danger-bg)' : (inbreedingResult.value.error ? 'var(--color-gray-50)' : 'var(--color-success-bg-alt)'),
                      color: !inbreedingResult.value.safe && !inbreedingResult.value.error ? 'var(--color-danger-text)' : (inbreedingResult.value.error ? 'var(--color-gray-600)' : '#1E4620')
                    }}
                  >
                    <div class="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '1.2rem' }}>
                        {!inbreedingResult.value.safe && !inbreedingResult.value.error ? '⚠️' : (inbreedingResult.value.error ? 'ℹ️' : '✅')}
                      </span>
                      <span class="fw-bold">{inbreedingResult.value.text}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {props.jenisId === 'kelahiran' && (
            <>
              <PencatatanField label="ID Pejantan" colClass="col-md-6" required>
                <PencatatanInput
                  modelValue={f().idPejantan}
                  placeholder="Misal: D-010"
                  iconSrc="/icon/domba.png"
                  onUpdateModelValue={(v: string) => { f().idPejantan = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Nama Anak (Baru)" colClass="col-md-6" required>
                <PencatatanInput
                  modelValue={f().namaAnak}
                  placeholder="Masukkan nama domba"
                  onUpdateModelValue={(v: string) => { f().namaAnak = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Kode Kandang (Untuk Anak)" colClass="col-md-6" required>
                <PencatatanInput
                  modelValue={f().kandangAnak}
                  placeholder="Misal: K-001"
                  iconSrc="/icon/kandang.png"
                  onUpdateModelValue={(v: string) => { f().kandangAnak = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Tanggal Lahir" colClass="col-md-6" required>
                <PencatatanInput
                  type="date"
                  modelValue={f().tanggal}
                  placeholder="YYYY-MM-DD"
                  onUpdateModelValue={(v: string) => { f().tanggal = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Berat Badan Anak (kg)" colClass="col-md-4" required>
                <PencatatanInput
                  type="number"
                  modelValue={f().beratLahir}
                  placeholder="0.0"
                  onUpdateModelValue={(v: string) => { f().beratLahir = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Jumlah Anak" colClass="col-md-4" required>
                <PencatatanInput
                  type="number"
                  modelValue={f().jumlahAnak}
                  placeholder="0"
                  onUpdateModelValue={(v: string) => { f().jumlahAnak = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Kondisi Anak" colClass="col-md-4">
                <PencatatanSelect
                  modelValue={f().kondisiAnak}
                  options={['Sehat', 'Lemas', 'Cacat', 'Mati']}
                  onUpdateModelValue={(v: string) => { f().kondisiAnak = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Kondisi Induk" colClass="col-12">
                <PencatatanSelect
                  modelValue={f().kondisiInduk}
                  options={['Sehat', 'Lemas', 'Perlu Penanganan']}
                  onUpdateModelValue={(v: string) => { f().kondisiInduk = v; }}
                />
              </PencatatanField>
            </>
          )}

          {props.jenisId === 'berat_badan' && (
            <>
              <PencatatanField label="Berat Badan" colClass="col-md-4" required>
                <PencatatanInput
                  type="number"
                  modelValue={f().qty}
                  placeholder="0.0"
                  onUpdateModelValue={(v: string) => { f().qty = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Satuan" colClass="col-md-2">
                <PencatatanSelect
                  modelValue={f().unit}
                  options={['kg']}
                  onUpdateModelValue={(v: string) => { f().unit = v; }}
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
