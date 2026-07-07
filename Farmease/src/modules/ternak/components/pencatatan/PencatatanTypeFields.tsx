import { defineComponent, computed, onMounted, watch, ref } from 'vue';
import type { PropType } from 'vue';
import PencatatanField from './PencatatanField';
import PencatatanSelect from './PencatatanSelect';
import PencatatanTextarea from './PencatatanTextarea';
import PencatatanModeToggle from './PencatatanModeToggle';
import type { PencatatanMode } from './PencatatanModeToggle';
import { cageSession, cagesList } from '@/store/navigation';
import { sheep, weightRecords } from '@/store/livestock';
import { pregnancyApi } from '@/shared/api';
import { pencatatanSubmissions } from '@/store/operatorAdmin';

// Subcomponents for specific recording fields
import HealthFields from './fields/HealthFields';
import FecesFields from './fields/FecesFields';
import WeightFields from './fields/WeightFields';
import FeedStockFields from './fields/FeedStockFields';
import FeedFields from './fields/FeedFields';
import BirthFields from './fields/BirthFields';
import MatingFields from './fields/MatingFields';

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
  sheepCode?: string;
  genderAnak?: string;
  asalSemen?: string;
  namaInseminator?: string;
  waktuIB?: string;
  sumberPejantan?: 'internal' | 'eksternal';
  donorName?: string;
  donorOrigin?: string;
  idMating?: string;
  metodePemeriksaan?: string;
  petugas?: string;
  hasilPemeriksaan?: string;
  hijauan?: string;
  energi?: string;
  protein?: string;
  mineral?: string;
  selectedCageCode?: string;
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
    const selectedCageCode = ref<string>(props.form.selectedCageCode || cageSession.value?.code || '');
    const pregnancies = ref<any[]>([]);

    const fetchPregnancies = async () => {
      try {
        const res = await pregnancyApi.getList();
        pregnancies.value = res || [];
      } catch (e) {
        console.error('Failed to fetch pregnancies in form:', e);
      }
    };

    watch(selectedCageCode, (newVal) => {
      props.form.selectedCageCode = newVal;
    }, { immediate: true });

    onMounted(async () => {
      fetchPregnancies();
    });

    const isModeToggleDisabled = computed(() => {
      return ['kotoran', 'berat_badan', 'perkawinan', 'kelahiran'].includes(props.jenisId);
    });

    const selectedNonMatingSheep = computed(() => {
      if (f().mode !== 'individu') return null;
      return sheep.value.find(s => s.code === f().targetId || String(s.id) === String(f().targetId)) || null;
    });

    const activePregnancyInfo = computed(() => {
      if (props.jenisId !== 'kelahiran' || !selectedNonMatingSheep.value) return null;
      if (selectedNonMatingSheep.value.status !== 'Hamil') return null;
      
      const targetIdStr = String(selectedNonMatingSheep.value.id);
      const found = pregnancies.value.find((p: any) => {
        const idMother = String(p.id_sheep || p.mother_sheep?.id_sheep || p.dam_sheep?.id_sheep || p.id_sheep_female || '');
        const statusStr = (p.status || p.pregnancy_status || '').toLowerCase();
        const isActive = statusStr === 'dikandung' || statusStr === 'hamil' || statusStr === 'aktif';
        return idMother === targetIdStr && isActive;
      });

      if (found) return found;

      return {
        pregnancy_start_date: new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Hamil'
      };
    });

    const activePregnancyDetails = computed(() => {
      const preg = activePregnancyInfo.value;
      if (!preg) return null;

      let start = new Date(preg.pregnancy_date || preg.created_at);
      if (isNaN(start.getTime()) || start.getFullYear() <= 1970) {
        if (preg.expected_birth_date) {
          start = new Date(new Date(preg.expected_birth_date).getTime() - 150 * 24 * 60 * 60 * 1000);
        } else {
          start = new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000);
        }
      }

      // Gunakan expected_birth_date langsung dari DB jika tersedia
      let hpl: Date;
      if (preg.expected_birth_date) {
        hpl = new Date(preg.expected_birth_date);
      } else if (preg.pregnancy_date) {
        hpl = new Date(new Date(preg.pregnancy_date).getTime() + 150 * 24 * 60 * 60 * 1000);
      } else {
        hpl = new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000);
      }
      if (isNaN(hpl.getTime())) {
        hpl = new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000);
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      hpl.setHours(0, 0, 0, 0);
      const diffTime = hpl.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let countdownText = '';
      if (diffDays > 0) {
        countdownText = `H-${diffDays} Hari`;
      } else if (diffDays === 0) {
        countdownText = `HPL HARI INI`;
      } else {
        countdownText = `Lewat HPL ${Math.abs(diffDays)} Hari`;
      }

      const fatherSheep = sheep.value.find(s => String(s.id) === String(preg.id_father) || String(s.code) === String(preg.id_father));
      const fatherCode = fatherSheep ? fatherSheep.code : (preg.id_father || '—');
      const fatherName = fatherSheep ? fatherSheep.name : 'Tidak Terdata';

      return {
        startDateFormatted: start.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        hplDateFormatted: hpl.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        countdownText,
        fatherText: `[${fatherCode}] ${fatherName}`,
        fatherCode
      };
    });

    watch(activePregnancyDetails, (details) => {
      if (details && details.fatherCode && details.fatherCode !== '—') {
        f().idPejantan = details.fatherCode;
      }
    }, { immediate: true });

    const pregnantCageSheepList = computed(() => {
      if (props.jenisId !== 'kelahiran') return [];
      
      const activeCode = selectedCageCode.value;
      return sheep.value
        .filter(s => (activeCode === 'all' || !activeCode || s.cage_code === activeCode) && s.gender === 'betina' && s.status === 'Hamil')
        .map(s => {
          const targetIdStr = String(s.id);
          const foundPreg = pregnancies.value.find((p: any) => {
            const idMother = String(p.id_sheep || p.mother_sheep?.id_sheep || p.dam_sheep?.id_sheep || p.id_sheep_female || '');
            const statusStr = (p.status || p.pregnancy_status || '').toLowerCase();
            const isActive = statusStr === 'dikandung' || statusStr === 'hamil' || statusStr === 'aktif';
            return idMother === targetIdStr && isActive;
          });
          
          // Gunakan expected_birth_date langsung dari DB jika tersedia
          let hpl: Date;
          if (foundPreg?.expected_birth_date) {
            hpl = new Date(foundPreg.expected_birth_date);
          } else if (foundPreg?.pregnancy_date) {
            hpl = new Date(new Date(foundPreg.pregnancy_date).getTime() + 150 * 24 * 60 * 60 * 1000);
          } else {
            hpl = new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000);
          }
          if (isNaN(hpl.getTime())) {
            hpl = new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000);
          }
          const today = new Date();
          today.setHours(0,0,0,0);
          hpl.setHours(0,0,0,0);
          const diffTime = hpl.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let countdownText = '';
          if (diffDays > 0) countdownText = `H-${diffDays} Hari`;
          else if (diffDays === 0) countdownText = 'HPL Hari Ini';
          else countdownText = `Lewat HPL ${Math.abs(diffDays)} Hari`;

          return {
            id: s.id,
            code: s.code,
            name: s.name,
            countdownText,
            hpl: hpl.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
          };
        });
    });

    const activeCageSheepOptions = computed(() => {
      const activeCode = selectedCageCode.value;
      return sheep.value
        .filter(s => (activeCode === 'all' || !activeCode || s.cage_code === activeCode) && !['Mati', 'Terjual', 'Disembelih'].includes(s.status))
        .filter(s => {
           if (props.jenisId === 'kelahiran') return s.gender === 'betina' && s.status === 'Hamil';
           return true;
        })
        .map(s => {
          if (props.jenisId === 'kelahiran') {
            const cageLabel = activeCode === 'all' ? ` (Kandang: ${s.cage_code})` : '';
            return {
              value: s.code,
              label: `${s.code} ${s.name}${cageLabel}`
            };
          }
          const cageLabel = activeCode === 'all' ? ` (Kandang: ${s.cage_code})` : '';
          return {
            value: s.code,
            label: `${s.code} ${s.name}${cageLabel}`
          };
        });
    });

    const getSheepAgeString = (s: any) => {
      if (!s) return '—';
      return s.age || s.age_string || '—';
    };

    function getSheepWeight(sheepId: any) {
      if (!sheepId) return '—';
      const idStr = String(sheepId);
      const sObj = sheep.value.find(x => String(x.id) === idStr);
      
      const records = weightRecords.value.filter(w => String(w.sheep_id) === idStr);
      if (records.length === 0) return sObj?.weight || '—';
      const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sorted[0];
      return latest ? `${latest.weight} kg` : (sObj?.weight || '—');
    }

    const getCageName = (code: string) => {
      const cage = cagesList.value.find(c => c.code === code);
      return cage ? cage.name : `Kandang ${code}`;
    };

    const getBirahiStatus = (s: any) => {
      if (!s) return '—';

      let hasCheckedEstrus = false;
      let latestEstrusCheck: { hasil: string; time: number } | null = null;

      for (const sub of pencatatanSubmissions.value) {
        if (sub.approvalStatus === 'rejected') continue;
        const dataObj: any = (sub.payload as any)?.data || sub.payload;
        const items = dataObj?.items || [];
        for (const item of items) {
          if ((item.name === 'Cek Birahi' || item.name === 'Pencatatan Birahi' || item.name === 'Pengecekan Birahi') && (String(item.targetId) === String(s.code) || String(item.targetId) === String(s.id))) {
            hasCheckedEstrus = true;
            const time = sub.submittedAt ? new Date(sub.submittedAt).getTime() : Date.now();
            if (!latestEstrusCheck || time > latestEstrusCheck.time) {
              latestEstrusCheck = { hasil: item.hasilPemeriksaan || '', time };
            }
          }
        }
      }

      if (hasCheckedEstrus && latestEstrusCheck) {
        if (latestEstrusCheck.hasil === 'birahi') {
          return 'Ya (Siap Kawin / Birahi)';
        }
        return 'Tidak Birahi';
      }

      if (s.gender?.toLowerCase() === 'jantan') {
        if (s.status === 'Sakit' || s.status === 'sakit') {
          return 'Tidak (Sedang Sakit)';
        }
        const birthDate = s.birth_date ? new Date(s.birth_date) : null;
        if (birthDate) {
          const now = new Date();
          const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
          if (ageInMonths < 12) {
            return 'Tidak (Belum Cukup Umur)';
          }
        }
        const weightStr = getSheepWeight(s.id);
        const weightNum = parseFloat(weightStr);
        if (weightNum > 0 && weightNum < 30.0) {
          return `Tidak (Berat ${weightNum} kg < 30 kg)`;
        }
        const matingStatus = s.mating_status || '';
        if (matingStatus.includes('Hamil') || matingStatus.includes('hamil')) {
          return 'Belum Pencatatan Birahi';
        }
        return matingStatus || 'Belum Pencatatan Birahi';
      }

      if (s.status === 'Hamil' || s.status === 'hamil') {
        return 'Tidak (Sedang Hamil)';
      }
      const birthDate = s.birth_date ? new Date(s.birth_date) : null;
      if (birthDate) {
        const now = new Date();
        const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
        const minAge = 8;
        if (ageInMonths < minAge) {
          return 'Tidak (Belum Cukup Umur)';
        }
      }
      return 'Belum Pencatatan Birahi';
    };

    watch(() => f().targetId, (newTargetId) => {
      if (newTargetId && f().mode === 'individu') {
        const foundSheep = sheep.value.find(s => s.code === newTargetId || String(s.id) === String(newTargetId));
        if (foundSheep && foundSheep.cage_code) {
          selectedCageCode.value = foundSheep.cage_code;
        }
      }
    }, { immediate: true });

    const handleCageChange = (cageCode: string) => {
      selectedCageCode.value = cageCode;
      if (cageCode === 'all') return;
      const foundSheep = sheep.value.find(s => s.code === f().targetId || String(s.id) === String(f().targetId));
      if (!foundSheep || foundSheep.cage_code !== cageCode) {
        f().targetId = '';
      }
    };

    return () => (
      <>
        {props.showModeToggle && (
          <div class="d-flex justify-content-end mb-3">
            <PencatatanModeToggle
              modelValue={f().mode}
              onUpdateModelValue={(mode: PencatatanMode) => props.onModeChange?.(mode)}
              disabled={isModeToggleDisabled.value}
            />
          </div>
        )}

        <div class="row g-4">
          {/* Base selection for non-mating, non-stock-feed forms */}
          {props.jenisId !== 'stok_pakan' && props.jenisId !== 'perkawinan' && (
            <>
              {f().mode === 'individu' ? (
                <>
                  <PencatatanField label="Pilih Kandang" colClass="col-12" required>
                    <PencatatanSelect
                      modelValue={selectedCageCode.value}
                      options={[
                        { value: 'all', label: 'Semua Kandang' },
                        ...cagesList.value.map(c => ({ value: c.code, label: `${c.name} (${c.code})` }))
                      ]}
                      placeholder="Pilih Kandang"
                      onUpdateModelValue={handleCageChange}
                    />
                  </PencatatanField>

                  <PencatatanField
                    label={props.jenisId === 'kelahiran' ? 'ID Ternak (Indukan Betina)' : 'ID Domba'}
                    colClass="col-12"
                    required
                  >
                    <PencatatanSelect
                      modelValue={f().targetId}
                      options={activeCageSheepOptions.value}
                      placeholder={selectedCageCode.value ? (props.jenisId === 'kelahiran' ? 'Pilih Indukan Betina' : 'Pilih ID Domba') : 'Pilih Kandang Terlebih Dahulu'}
                      disabled={!selectedCageCode.value}
                      onUpdateModelValue={(v: string) => { f().targetId = v; }}
                    />
                  </PencatatanField>

                  {props.jenisId === 'kelahiran' && activePregnancyDetails.value && (
                    <div class="col-12 mt-2 animate-fade-in text-start">
                      <div class="p-3 rounded-4" style={{ backgroundColor: 'rgba(212, 196, 176, 0.25)', borderLeft: '4px solid var(--color-primary, #3d2f24)', color: 'var(--color-primary, #3d2f24)' }}>
                        <div class="fw-bold d-flex align-items-center gap-2 mb-2" style={{ fontSize: '0.9rem', color: 'var(--color-primary, #3d2f24)' }}>
                          🤰 Kehamilan Aktif Terdeteksi
                        </div>
                        <div class="row g-2" style={{ fontSize: '0.85rem', color: 'var(--color-primary, #3d2f24)' }}>
                          <div class="col-6">
                            <span class="small d-block opacity-75">Mulai Kehamilan</span>
                            <span class="fw-extrabold">{activePregnancyDetails.value.startDateFormatted}</span>
                          </div>
                          <div class="col-6">
                            <span class="small d-block opacity-75">Perkiraan Kelahiran (HPL)</span>
                            <span class="fw-extrabold">{activePregnancyDetails.value.hplDateFormatted}</span>
                          </div>
                          <div class="col-12 mt-2 border-top pt-2" style={{ borderColor: 'rgba(61, 47, 36, 0.15)' }}>
                            <span class="small d-block opacity-75">Pejantan Terkait (Bapak)</span>
                            <span class="fw-extrabold">{activePregnancyDetails.value.fatherText}</span>
                          </div>
                          <div class="col-12 mt-2 border-top pt-2 d-flex justify-content-between align-items-center" style={{ borderColor: 'rgba(61, 47, 36, 0.15)' }}>
                            <span class="small opacity-75">Waktu Hitung Mundur HPL:</span>
                            <span class="badge text-white fw-extrabold px-3 py-1.5 rounded-pill" style={{ backgroundColor: 'var(--color-primary, #3d2f24)', fontSize: '0.8rem' }}>
                              {activePregnancyDetails.value.countdownText}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <PencatatanField label="Pilih Kandang" colClass="col-12" required>
                  <PencatatanSelect
                    modelValue={f().targetId}
                    options={cagesList.value.map(c => ({ value: c.code, label: `${c.name} (${c.code})` }))}
                    placeholder="Pilih Kandang"
                    onUpdateModelValue={(v: string) => { f().targetId = v; }}
                  />
                </PencatatanField>
              )}
            </>
          )}

          {/* Active Sheep Info Card for non-mating, non-stock-feed forms */}
          {props.jenisId !== 'stok_pakan' && props.jenisId !== 'perkawinan' && f().mode === 'individu' && selectedNonMatingSheep.value && (
            <div class="col-12 animate-fade-in">
              <div class="p-3 rounded-4 bg-light border border-light-cream" style={{ fontSize: '0.85rem', color: '#2C3E50' }}>
                <div class="fw-bold mb-2 text-dark" style={{ fontSize: '0.9rem' }}>
                  ℹ️ Informasi Domba Kandang Aktif
                </div>
                <div class="row g-2">
                  <div class="col-6">
                    <span class="text-muted small d-block">Jenis Kelamin</span>
                    <span class="fw-bold">{selectedNonMatingSheep.value.gender === 'jantan' ? 'Jantan (Pejantan)' : 'Betina (Indukan)'}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted small d-block">Umur</span>
                    <span class="fw-bold">{getSheepAgeString(selectedNonMatingSheep.value)}</span>
                  </div>
                  <div class="col-6 mt-1">
                    <span class="text-muted small d-block">Berat Badan</span>
                    <span class="fw-bold">{getSheepWeight(selectedNonMatingSheep.value.id)}</span>
                  </div>
                  <div class="col-6 mt-1">
                    <span class="text-muted small d-block">Kandang</span>
                    <span class="fw-bold">{getCageName(selectedNonMatingSheep.value.cage_code)}</span>
                  </div>
                  {selectedNonMatingSheep.value.gender === 'betina' && (
                    <div class="col-6 mt-1">
                      <span class="text-muted small d-block">Status Kehamilan</span>
                      <span class={['fw-bold', selectedNonMatingSheep.value.status === 'Hamil' ? 'text-warning' : '']}>
                        {selectedNonMatingSheep.value.status === 'Hamil' ? 'Hamil' : 'Tidak Hamil'}
                      </span>
                    </div>
                  )}
                  <div class="col-6 mt-1">
                    <span class="text-muted small d-block">Masa Birahi / Siap Kawin</span>
                    <span class={['fw-bold', (getBirahiStatus(selectedNonMatingSheep.value).startsWith('Ya') || getBirahiStatus(selectedNonMatingSheep.value).includes('Siap') || getBirahiStatus(selectedNonMatingSheep.value).includes('Birahi')) ? 'text-success' : 'text-danger']}>
                      {getBirahiStatus(selectedNonMatingSheep.value)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delegate specialized input fields to sub-components */}
          {props.jenisId === 'kesehatan' && <HealthFields form={props.form} />}
          {props.jenisId === 'kotoran' && <FecesFields form={props.form} />}
          {props.jenisId === 'berat_badan' && <WeightFields form={props.form} />}
          {props.jenisId === 'stok_pakan' && <FeedStockFields form={props.form} />}
          {props.jenisId === 'pakan' && <FeedFields form={props.form} />}
          {props.jenisId === 'kelahiran' && <BirthFields form={props.form} />}
          {props.jenisId === 'perkawinan' && <MatingFields form={props.form} />}

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
  }
});
