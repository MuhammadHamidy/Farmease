import { defineComponent, computed, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import PencatatanField from './PencatatanField';
import PencatatanInput from './PencatatanInput';
import PencatatanSelect from './PencatatanSelect';
import PencatatanTextarea from './PencatatanTextarea';
import { landsList, fetchLandsList, cageSession, cagesList } from '@/store/navigation';
import PencatatanModeToggle from './PencatatanModeToggle';
import type { PencatatanMode } from './PencatatanModeToggle';
import { stocks } from '@/modules/ternak/store/peternakan';
import { sheep, weightRecords } from '@/store/livestock';
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
        .filter((s: any) => {
          const cat = (s.category || '').toLowerCase();
          return ['hijauan', 'konsentrat', 'pellet', 'greenery'].includes(cat) || cat.includes('pakan');
        })
        .map((s: any) => ({
          value: s.name,
          label: s.name
        }));
    });

    // Kalkulasi Otomatis Pakan berdasarkan ID
    watch(
      () => f().targetId,
      (newTarget) => {
        if (props.jenisId === 'pakan') {
          // Jangan auto isi jika kosong, kecuali mode kelompok
          if ((!newTarget || newTarget.length < 2) && f().mode === 'individu') {
            f().qty = '';
            return;
          }

          let calculatedQty = '';
          
          if (f().mode === 'kelompok' || !f().mode || f().mode !== 'individu') {
             // Hitung jumlah domba di kandang
             let multiplier = 10;
             if (newTarget) {
                const count = sheep.value.filter(s => s.cage_code === newTarget).length;
                if (count > 0) multiplier = count;
             }
             calculatedQty = (2.5 * multiplier).toFixed(1); 
          } else {
             // Mode individu: kalkulasi pseudo-random berdasarkan string ID
             const hash = newTarget.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
             calculatedQty = ((hash % 25) / 10 + 2.5).toFixed(1); 
          }
          
          f().qty = calculatedQty;
          
          if (!f().obat && feedStockOptions.value.length > 0) {
             f().obat = feedStockOptions.value[0]?.value || '';
          }
        }
      },
      { immediate: true }
    );

    onMounted(() => {
      if (landsList.value.length === 0) {
        fetchLandsList();
      }
    });

    const isKonversi = computed(() => props.form.name === 'Konversi Pakan');

    const birahiOptions = computed(() => {
      const betina = sheep.value.filter(s => s.gender === 'betina' && s.status !== 'Hamil');
      return betina.map(s => ({
        value: s.id,
        label: `[${s.code}] ${s.name}`
      }));
    });

    const pejantanOptions = computed(() => {
      const jantan = sheep.value.filter(s => s.gender === 'jantan' && s.status === 'Sehat');
      return jantan.map(s => ({
        value: s.id,
        label: `[${s.code}] ${s.name}`
      }));
    });

    const inbreedingResult = ref<{ safe: boolean; text: string; error?: boolean } | null>(null);
    let inbreedingTimeout: any = null;

    const selectedBaseSheepId = ref('');

    const baseSheepOptions = computed(() => {
      const activeCode = cageSession.value?.code || '';
      return sheep.value
        .filter(s => s.cage_code === activeCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status))
        .map(s => ({
          value: s.id,
          label: `[${s.code}] ${s.name} (${s.gender === 'jantan' ? 'Jantan' : 'Betina'})`
        }));
    });

    const activeCageSheepOptions = computed(() => {
      const activeCode = cageSession.value?.code || '';
      return sheep.value
        .filter(s => s.cage_code === activeCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status))
        .filter(s => {
           if (props.jenisId === 'kelahiran') return s.gender === 'betina';
           return true;
        })
        .map(s => ({
          value: s.code,
          label: `[${s.code}] ${s.name}`
        }));
    });

    const selectedBaseSheep = computed(() => {
      return sheep.value.find(s => String(s.id) === String(selectedBaseSheepId.value)) || null;
    });

    const selectedPartnerSheep = computed(() => {
      const base = selectedBaseSheep.value;
      if (!base) return null;
      const partnerId = base.gender === 'betina' ? props.form.idPejantan : props.form.targetId;
      return sheep.value.find(s => String(s.id) === String(partnerId)) || null;
    });

    const getCageName = (code: string) => {
      const cage = cagesList.value.find(c => c.code === code);
      return cage ? cage.name : `Kandang ${code}`;
    };

    watch([() => props.form.targetId, () => props.form.idPejantan], ([tId, pId]) => {
      if (selectedBaseSheepId.value) return;
      const activeCode = cageSession.value?.code || '';
      if (tId) {
        const s = sheep.value.find(x => String(x.id) === String(tId));
        if (s && s.cage_code === activeCode) {
          selectedBaseSheepId.value = String(s.id);
          return;
        }
      }
      if (pId) {
        const s = sheep.value.find(x => String(x.id) === String(pId));
        if (s && s.cage_code === activeCode) {
          selectedBaseSheepId.value = String(s.id);
          return;
        }
      }
    }, { immediate: true });

    const handleBaseSheepChange = (val: string) => {
      selectedBaseSheepId.value = val;
      const s = sheep.value.find(x => String(x.id) === String(val));
      if (!s) {
        props.form.targetId = '';
        props.form.idPejantan = '';
        return;
      }
      if (s.gender === 'betina') {
        props.form.targetId = s.id;
        props.form.idPejantan = '';
      } else {
        props.form.idPejantan = s.id;
        props.form.targetId = '';
      }
    };

    const partnerOptions = computed(() => {
      const base = selectedBaseSheep.value;
      if (!base) return [];
      const activeCode = cageSession.value?.code || '';
      if (base.gender === 'betina') {
        return sheep.value
          .filter(s => s.gender === 'jantan' && s.cage_code !== activeCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status))
          .map(s => ({
            value: s.id,
            label: `[${s.code}] ${s.name} (Kandang ${s.cage_code})`
          }));
      } else {
        return sheep.value
          .filter(s => s.gender === 'betina' && s.cage_code !== activeCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status))
          .map(s => ({
            value: s.id,
            label: `[${s.code}] ${s.name} (Kandang ${s.cage_code})`
          }));
      }
    });

    const getSheepAgeString = (birthDateStr: string) => {
      if (!birthDateStr) return '—';
      const birth = new Date(birthDateStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - birth.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return `${diffDays} hari`;
      }
      const months = Math.floor(diffDays / 30.43);
      if (months < 12) {
        return `${months} bulan`;
      }
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) return `${years} tahun`;
      return `${years} tahun ${remainingMonths} bulan`;
    };

    const getSheepWeight = (sheepId: string) => {
      const records = weightRecords.value.filter(w => String(w.sheep_id) === String(sheepId));
      if (records.length === 0) return '—';
      const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sorted[0];
      return latest ? `${latest.weight} kg` : '—';
    };

    const getBirahiStatus = (s: any) => {
      if (!s) return '—';
      const now = new Date();
      let ageInMonths = 0;
      if (s.birth_date) {
        const bd = new Date(s.birth_date);
        ageInMonths = (now.getFullYear() - bd.getFullYear()) * 12 + (now.getMonth() - bd.getMonth());
      }
      if (s.gender === 'betina') {
        if (s.status === 'Sehat' && ageInMonths >= 8) {
          return 'Ya (Siap Kawin / Birahi)';
        }
        if (s.status === 'Hamil') {
          return 'Tidak (Sedang Hamil)';
        }
        if (ageInMonths < 8) {
          return 'Tidak (Belum Cukup Umur < 8 bln)';
        }
        return `Tidak (${s.status})`;
      } else {
        if (s.status === 'Sehat' && ageInMonths >= 12) {
          return 'Ya (Siap Kawin / Pejantan Siap)';
        }
        if (ageInMonths < 12) {
          return 'Tidak (Belum Cukup Umur < 12 bln)';
        }
        return `Tidak (${s.status})`;
      }
    };

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
        
        const male = sheep.value.find(s => String(s.id) === id2Str);
        const female = sheep.value.find(s => String(s.id) === id1Str);
        
        if (!male || !female) {
          inbreedingResult.value = { safe: true, text: 'ID Domba tidak ditemukan di database.', error: true };
          return;
        }

        if (id1 === id2) {
          inbreedingResult.value = { 
            safe: false, 
            text: 'PERINGATAN INBREEDING: Risiko 100% (Sangat Berisiko). ID Ternak betina dan pejantan tidak boleh sama!' 
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
              text: `PERINGATAN INBREEDING: Risiko ${pct} ${category}. ${res?.recommendation || 'Perkawinan ini memiliki risiko genetik tinggi.'}`
            };
          } else {
            inbreedingResult.value = {
              safe: true,
              text: `Aman: ${res?.recommendation || 'Tidak terdeteksi hubungan kekerabatan dekat.'} Risiko ${pct} ${category}.`
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
          {props.jenisId !== 'stok_pakan' && props.jenisId !== 'perkawinan' && (
            <PencatatanField
              label={f().mode === 'individu' ? ((props.jenisId === 'kelahiran') ? 'ID Ternak (Indukan Betina)' : 'ID Ternak') : 'ID Kandang'}
              colClass="col-12"
              required
            >
              {f().mode === 'individu' ? (
                <PencatatanSelect
                  modelValue={f().targetId}
                  options={activeCageSheepOptions.value}
                  placeholder="Pilih Domba dari Kandang Ini"
                  onUpdateModelValue={(v: string) => { f().targetId = v; }}
                />
              ) : (
                <PencatatanInput
                  modelValue={f().targetId}
                  placeholder="Misal: K-001"
                  iconSrc="/icon/kandang.png"
                  onUpdateModelValue={(v: string) => { f().targetId = v; }}
                />
              )}
            </PencatatanField>
          )}

          {props.jenisId === 'perkawinan' && (
            <PencatatanField
              label={f().mode === 'individu' ? 'ID Domba' : 'ID Kandang'}
              colClass="col-12"
              required
            >
              {f().mode === 'individu' ? (
                <PencatatanSelect
                  modelValue={selectedBaseSheepId.value}
                  options={baseSheepOptions.value}
                  placeholder="Pilih Domba Kandang Aktif"
                  onUpdateModelValue={handleBaseSheepChange}
                />
              ) : (
                <PencatatanInput
                  modelValue={f().targetId}
                  placeholder="Misal: K-001"
                  iconSrc="/icon/kandang.png"
                  onUpdateModelValue={(v: string) => { f().targetId = v; }}
                />
              )}
            </PencatatanField>
          )}

          {props.jenisId === 'perkawinan' && f().mode === 'individu' && selectedBaseSheep.value && (
            <div class="col-12 animate-fade-in">
              <div class="p-3 rounded-4 bg-light border border-light-cream" style={{ fontSize: '0.85rem', color: '#2C3E50' }}>
                <div class="fw-bold mb-2 text-dark" style={{ fontSize: '0.9rem' }}>
                  ℹ️ Informasi Domba Kandang Aktif
                </div>
                <div class="row g-2">
                  <div class="col-6">
                    <span class="text-muted small d-block">Jenis Kelamin</span>
                    <span class="fw-bold">{selectedBaseSheep.value.gender === 'jantan' ? 'Jantan (Pejantan)' : 'Betina (Indukan)'}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted small d-block">Umur</span>
                    <span class="fw-bold">{getSheepAgeString(selectedBaseSheep.value.birth_date)}</span>
                  </div>
                  <div class="col-6 mt-1">
                    <span class="text-muted small d-block">Berat Badan</span>
                    <span class="fw-bold">{getSheepWeight(selectedBaseSheep.value.id)}</span>
                  </div>
                  <div class="col-6 mt-1">
                    <span class="text-muted small d-block">Kandang</span>
                    <span class="fw-bold">{getCageName(selectedBaseSheep.value.cage_code)}</span>
                  </div>
                  <div class="col-12 mt-1">
                    <span class="text-muted small d-block">Masa Birahi / Siap Kawin</span>
                    <span class={['fw-bold', getBirahiStatus(selectedBaseSheep.value).startsWith('Ya') ? 'text-success' : 'text-danger']}>
                      {getBirahiStatus(selectedBaseSheep.value)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {props.jenisId === 'perkawinan' && f().mode === 'individu' && selectedBaseSheep.value && (
            <PencatatanField
              label={selectedBaseSheep.value.gender === 'betina' ? 'Pilih Pasangan (Pejantan Luar Kandang)' : 'Pilih Pasangan (Betina Luar Kandang)'}
              colClass="col-12"
              required
            >
              <PencatatanSelect
                modelValue={selectedBaseSheep.value.gender === 'betina' ? f().idPejantan : f().targetId}
                options={partnerOptions.value}
                placeholder={selectedBaseSheep.value.gender === 'betina' ? 'Pilih Pejantan Pasangan' : 'Pilih Betina Pasangan'}
                onUpdateModelValue={(v: string) => {
                  if (selectedBaseSheep.value?.gender === 'betina') {
                    f().idPejantan = v;
                  } else {
                    f().targetId = v;
                  }
                }}
              />
            </PencatatanField>
          )}

          {props.jenisId === 'perkawinan' && f().mode === 'individu' && selectedPartnerSheep.value && (
            <div class="col-12 animate-fade-in">
              <div class="p-3 rounded-4 bg-light border border-light-cream" style={{ fontSize: '0.85rem', color: '#2C3E50' }}>
                <div class="fw-bold mb-2 text-dark" style={{ fontSize: '0.9rem' }}>
                  ℹ️ Informasi Domba Pasangan (Luar Kandang)
                </div>
                <div class="row g-2">
                  <div class="col-6">
                    <span class="text-muted small d-block">Jenis Kelamin</span>
                    <span class="fw-bold">{selectedPartnerSheep.value.gender === 'jantan' ? 'Jantan (Pejantan)' : 'Betina (Indukan)'}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted small d-block">Umur</span>
                    <span class="fw-bold">{getSheepAgeString(selectedPartnerSheep.value.birth_date)}</span>
                  </div>
                  <div class="col-6 mt-1">
                    <span class="text-muted small d-block">Berat Badan</span>
                    <span class="fw-bold">{getSheepWeight(selectedPartnerSheep.value.id)}</span>
                  </div>
                  <div class="col-6 mt-1">
                    <span class="text-muted small d-block">Kandang</span>
                    <span class="fw-bold">{getCageName(selectedPartnerSheep.value.cage_code)}</span>
                  </div>
                  <div class="col-12 mt-1">
                    <span class="text-muted small d-block">Masa Birahi / Siap Kawin</span>
                    <span class={['fw-bold', getBirahiStatus(selectedPartnerSheep.value).startsWith('Ya') ? 'text-success' : 'text-danger']}>
                      {getBirahiStatus(selectedPartnerSheep.value)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {props.jenisId === 'pakan' && (
            <>
              <PencatatanField label="Jenis Pakan" colClass="col-12" required>
                <PencatatanSelect
                  modelValue={f().obat}
                  options={feedStockOptions.value}
                  placeholder={feedStockOptions.value.length > 0 ? "Pilih Pakan" : "Stok pakan kosong"}
                  onUpdateModelValue={(v: string) => { f().obat = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Jumlah Pakan (Otomatis berdasar ID)" colClass="col-12" required>
                <PencatatanInput
                  type="number"
                  modelValue={f().qty}
                  placeholder="Otomatis dihitung..."
                  onUpdateModelValue={(v: string) => { f().qty = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Satuan" colClass="col-12">
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
                  <PencatatanField label="Nama Pakan / Sumber" colClass="col-12" required>
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
                  <PencatatanField label="Jumlah Masuk" colClass="col-12" required>
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
                      options={['kg', 'ikat', 'liter', 'ton']}
                      onUpdateModelValue={(v: string) => { f().unit = v; }}
                    />
                  </PencatatanField>
                </>
              ) : (
                <>
                  <PencatatanField label="Pakan Mentah Asal (Dari Kebun)" colClass="col-12" required>
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
                  <PencatatanField label="Jumlah Diolah" colClass="col-12" required>
                    <PencatatanInput
                      type="number"
                      modelValue={f().qty}
                      placeholder="Jumlah berat mentah (kg)"
                      onUpdateModelValue={(v: string) => { f().qty = v; }}
                    />
                  </PencatatanField>
                  
                  <PencatatanField label="Hasil Cacah Jadi (Stok Pakan)" colClass="col-12" required>
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
                  <PencatatanField label="Jumlah Hasil Jadi" colClass="col-12" required>
                    <PencatatanInput
                      type="number"
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
              <PencatatanField label="Obat / Vitamin yang digunakan" colClass="col-12" required>
                <PencatatanInput
                  modelValue={f().obat}
                  placeholder="Misal: B-Complex"
                  onUpdateModelValue={(v: string) => { f().obat = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Jumlah Vitamin (opsional)" colClass="col-12">
                <PencatatanInput
                  type="number"
                  modelValue={f().vitaminAmount}
                  placeholder="0.0"
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
              <PencatatanField label="Jumlah Produksi" colClass="col-12" required>
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
                  onUpdateModelValue={(v: string) => { f().unit = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Kondisi Kotoran" colClass="col-12">
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
              {f().mode === 'kelompok' && (
                <PencatatanField label="Pejantan" colClass="col-12" required>
                  <PencatatanSelect
                    modelValue={f().idPejantan}
                    options={pejantanOptions.value}
                    placeholder="Pilih Pejantan"
                    onUpdateModelValue={(v: string) => { f().idPejantan = v; }}
                  />
                </PencatatanField>
              )}
              <PencatatanField label="Metoda Perkawinan" colClass="col-12">
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
              <PencatatanField label="ID Pejantan" colClass="col-12" required>
                <PencatatanInput
                  modelValue={f().idPejantan}
                  placeholder="Misal: D-010"
                  iconSrc="/icon/domba.png"
                  onUpdateModelValue={(v: string) => { f().idPejantan = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Nama Anak (Baru)" colClass="col-12" required>
                <PencatatanInput
                  modelValue={f().namaAnak}
                  placeholder="Masukkan nama domba"
                  onUpdateModelValue={(v: string) => { f().namaAnak = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Kode Kandang (Untuk Anak)" colClass="col-12" required>
                <PencatatanInput
                  modelValue={f().kandangAnak}
                  placeholder="Misal: K-001"
                  iconSrc="/icon/kandang.png"
                  onUpdateModelValue={(v: string) => { f().kandangAnak = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Tanggal Lahir" colClass="col-12" required>
                <PencatatanInput
                  type="date"
                  modelValue={f().tanggal}
                  placeholder="YYYY-MM-DD"
                  onUpdateModelValue={(v: string) => { f().tanggal = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Berat Badan Anak (kg)" colClass="col-12" required>
                <PencatatanInput
                  type="number"
                  modelValue={f().beratLahir}
                  placeholder="0.0"
                  onUpdateModelValue={(v: string) => { f().beratLahir = v; }}
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
