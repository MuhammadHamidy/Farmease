import { defineComponent, computed, ref, onMounted, watch, Teleport } from 'vue';
import type { PropType } from 'vue';
import PencatatanField from '../PencatatanField';
import PencatatanInput from '../PencatatanInput';
import PencatatanSelect from '../PencatatanSelect';
import { breedingApi, sheepApi, pregnancyApi, type EnumChoice } from '@/shared/api';
import { sheep, weightRecords } from '@/store/livestock';
import { cagesList, cageSession, activePencatatanForm } from '@/store/navigation';
import { metadataEnums, pencatatanSubmissions } from '@/store/operatorAdmin';
import type { PencatatanFormItem } from '../PencatatanTypeFields';
import { formatGender, formatSheepStatus, formatMatingReadiness } from '@/shared/utils/i18nFormatters';

export default defineComponent({
  name: 'MatingFields',
  props: {
    form: { type: Object as PropType<PencatatanFormItem>, required: true },
  },
  setup(props) {
    const f = () => props.form;

    const inbreedingResult = ref<{ safe: boolean; text: string; error?: boolean; warningType?: string } | null>(null);
    const maleSilsilah = ref<any>(null);
    const femaleSilsilah = ref<any>(null);
    const showCOIInfoModal = ref(false);
    let inbreedingTimeout: any = null;

    const selectedCageCode = ref<string>(props.form.selectedCageCode || cageSession.value?.code || 'all');
    const selectedBaseSheepId = ref('');

    const activeMatings = ref<any[]>([]);
    const isLoadingMatings = ref(false);
    const commonAncestorsList = ref<any[]>([]);
    const commonAncestorSet = ref<Set<string>>(new Set());

    const fetchActiveMatings = async () => {
      try {
        isLoadingMatings.value = true;
        const list = await breedingApi.getMatingList({ status: 'proses' });
        activeMatings.value = list || [];
      } catch (err) {
        console.error('Failed to fetch active matings:', err);
      } finally {
        isLoadingMatings.value = false;
      }
    };

    onMounted(() => {
      fetchActiveMatings();
    });

    const getSheepWeight = (sheepInput: any): string => {
      if (!sheepInput) return '—';
      const sheepId = typeof sheepInput === 'object' ? sheepInput.id : sheepInput;
      const sObj = typeof sheepInput === 'object' ? sheepInput : sheep.value.find(x => String(x.id) === String(sheepId));
      
      const records = weightRecords.value.filter(w => String(w.sheep_id) === String(sheepId));
      if (records.length === 0) return sObj?.weight || '—';
      const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sorted[0];
      return latest ? `${latest.weight} kg` : (sObj?.weight || '—');
    };

    const getBirahiStatus = (s: any): string => {
      if (!s) return '—';

      // 1. Cek Umur Minimal (Betina: 8 bulan, Jantan: 12 bulan)
      const birthDate = s.birth_date ? new Date(s.birth_date) : null;
      if (birthDate) {
        const now = new Date();
        const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
        const minAge = 8;
        if (ageInMonths < minAge) {
          return 'Tidak (Belum Cukup Umur)';
        }
      }

      // 2. Cek Kondisi Kesehatan / Kehamilan
      if (s.gender?.toLowerCase() === 'jantan') {
        if (s.status === 'Sakit' || s.status === 'sakit') {
          return 'Tidak (Sedang Sakit)';
        }
        const weightStr = getSheepWeight(s);
        const weightNum = parseFloat(weightStr);
        if (weightNum > 0 && weightNum < 30.0) {
          return `Tidak (Berat ${weightNum} kg < 30 kg)`;
        }
      } else {
        if (s.status === 'Hamil' || s.status === 'hamil') {
          return 'Tidak (Sedang Hamil)';
        }
      }

      // 3. Cek Log Pengecekan Birahi Terakhir
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

      const backendMatingStatus = s.mating_status || '';
      if (backendMatingStatus === 'Tidak (Belum Cukup Umur)' && birthDate) {
        const now = new Date();
        const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
        if (ageInMonths >= 8) {
          return s.gender?.toLowerCase() === 'jantan' ? 'Siap Kawin' : 'Belum Pencatatan Birahi';
        }
      }

      return s.gender?.toLowerCase() === 'jantan' ? formatMatingReadiness(backendMatingStatus || 'Siap Kawin') : 'Belum Pencatatan Birahi';
    };

    const checkIsSheepBirahi = (s: any) => {
      const localStatus = getBirahiStatus(s);
      if (localStatus === 'Ya (Siap Kawin / Birahi)' || localStatus === 'Siap Kawin') return true;
      if (localStatus === 'Tidak Birahi' || localStatus === 'Belum Pencatatan Birahi') return false;
      return !!s.is_ready_to_mate;
    };

    const selectedBaseSheep = computed(() => {
      return sheep.value.find(s => String(s.id) === String(selectedBaseSheepId.value)) || null;
    });

    const selectedPartnerSheep = computed(() => {
      const isIB = f().metoda === 'ib' || props.form.name === 'IB' || props.form.name === 'Inseminasi Buatan';
      if (isIB && f().sumberPejantan === 'eksternal') return null;
      const base = selectedBaseSheep.value;
      if (!base) return null;
      const partnerId = base.gender === 'betina' ? props.form.idPejantan : props.form.targetId;
      return sheep.value.find(s => String(s.id) === String(partnerId)) || null;
    });

    const getMatingLabel = (mating: any) => {
      const female = sheep.value.find(s => String(s.id) === String(mating.id_sheep_female));
      const femaleLabel = female ? `[${female.code}] ${female.name}` : `Domba Betina #${mating.id_sheep_female}`;
      
      const matingDate = new Date(mating.mating_date);
      const diffDays = mating.days_since_mating || 0;
      
      const dateStr = matingDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${femaleLabel} — Kawin: ${dateStr} (${diffDays} hari lalu)`;
    };

    const getCageName = (code: string) => {
      const cage = cagesList.value.find(c => c.code === code);
      return cage ? cage.name : `Kandang ${code}`;
    };

    const getSheepAgeString = (s: any) => {
      if (!s) return '—';
      return s.age || s.age_string || '—';
    };

    watch([() => props.form.targetId, () => props.form.idPejantan], ([tId, pId]) => {
      if (selectedBaseSheepId.value) return;
      if (tId) {
        const s = sheep.value.find(x => String(x.id) === String(tId) || x.code === tId);
        if (s) {
          selectedBaseSheepId.value = String(s.id);
          selectedCageCode.value = s.cage_code;
          return;
        }
      }
      if (pId) {
        const s = sheep.value.find(x => String(x.id) === String(pId) || x.code === pId);
        if (s) {
          selectedBaseSheepId.value = String(s.id);
          selectedCageCode.value = s.cage_code;
          return;
        }
      }
    }, { immediate: true });

    watch(selectedBaseSheepId, (newId) => {
      if (newId) {
        const found = sheep.value.find(s => String(s.id) === String(newId));
        if (found && found.cage_code) {
          selectedCageCode.value = found.cage_code;
        }
      }
    });

    const handleCageChange = (cageCode: string) => {
      selectedCageCode.value = cageCode;
      props.form.selectedCageCode = cageCode;
      if (cageCode === 'all') return;
      const foundSheep = sheep.value.find(s => s.code === props.form.targetId || String(s.id) === String(props.form.targetId));
      if (!foundSheep || foundSheep.cage_code !== cageCode) {
        props.form.targetId = '';
        selectedBaseSheepId.value = '';
      }
    };

    const handleBaseSheepChange = (val: string) => {
      selectedBaseSheepId.value = val;
      const s = sheep.value.find(x => String(x.id) === String(val));
      if (!s) {
        props.form.targetId = '';
        props.form.idPejantan = '';
        if (props.form.name === 'Kontrol Kebuntingan') {
          props.form.idMating = '';
        }
        return;
      }
      if (props.form.name === 'Cek Birahi' || props.form.name === 'Pencatatan Birahi' || props.form.name === 'Pengecekan Birahi') {
        props.form.targetId = s.id;
        props.form.idPejantan = s.gender === 'jantan' ? s.id : '';
        props.form.hasilPemeriksaan = checkIsSheepBirahi(s) ? 'birahi' : 'tidak_birahi';
      } else {
        if (s.gender === 'betina') {
          props.form.targetId = s.id;
          props.form.idPejantan = '';
        } else {
          props.form.idPejantan = s.id;
          props.form.targetId = '';
        }
      }

      if (props.form.name === 'Kontrol Kebuntingan' && props.form.idMating) {
        const mating = activeMatings.value.find(m => String(m.id_mating) === String(props.form.idMating));
        if (mating && String(mating.id_sheep_female) !== String(s.id)) {
          props.form.idMating = '';
        }
      }
    };

    const baseSheepOptions = computed(() => {
      const activeCode = selectedCageCode.value;
      const formName = props.form.name || '';
      
      const list = sheep.value
        .filter(s => s.cage_code === activeCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status));
      
      if (formName === 'Kontrol Kebuntingan') {
        const matedFemaleIds = new Set(activeMatings.value.map(m => String(m.id_sheep_female)));
        
        pencatatanSubmissions.value.forEach(sub => {
          if (sub.approvalStatus === 'rejected') return;
          const dataObj: any = (sub.payload as any)?.data || sub.payload;
          const items = dataObj?.items || [];
          items.forEach((item: any) => {
            if (item.name === 'Kawin Alam' || item.name === 'Kawin Alami' || item.name === 'IB' || item.name === 'Inseminasi Buatan') {
              const targetVal = item.targetId || item.idSheepFemale || item.id_sheep_female;
              if (targetVal) {
                const found = sheep.value.find(sh => String(sh.id) === String(targetVal) || String(sh.code) === String(targetVal));
                if (found) {
                  matedFemaleIds.add(String(found.id));
                }
              }
            }
          });
        });

        return list
          .filter(s => s.gender === 'betina' && matedFemaleIds.has(String(s.id)))
          .map(s => ({
            value: s.id,
            label: `${s.code} ${s.name}`
          }));
      }

      const isMated = (s: any) => {
        const isActiveMated = activeMatings.value.some(m => String(m.id_sheep_female) === String(s.id));
        const isPendingMated = pencatatanSubmissions.value.some(sub => {
          if (sub.approvalStatus === 'rejected') return false;
          const dataObj: any = (sub.payload as any)?.data || sub.payload;
          const items = dataObj?.items || [];
          return items.some((item: any) => {
            if (item.name === 'Kawin Alam' || item.name === 'Kawin Alami' || item.name === 'IB' || item.name === 'Inseminasi Buatan') {
              const targetVal = item.targetId || item.idSheepFemale || item.id_sheep_female;
              return String(targetVal) === String(s.id) || String(targetVal) === String(s.code);
            }
            return false;
          });
        });
        return isActiveMated || isPendingMated;
      };

      if (formName === 'IB' || formName === 'Inseminasi Buatan') {
        return list
          .filter(s => s.gender === 'betina' && checkIsSheepBirahi(s) && !isMated(s))
          .map(s => ({
            value: s.id,
            label: `${s.code} ${s.name}`
          }));
      }

      if (formName === 'Kawin Alam' || formName === 'Kawin Alami') {
        return list
          .filter(s => s.gender === 'betina' && checkIsSheepBirahi(s) && !isMated(s))
          .map(s => ({
            value: s.id,
            label: `${s.code} ${s.name}`
          }));
      }

      if (formName === 'Cek Birahi' || formName === 'Pencatatan Birahi' || formName === 'Pengecekan Birahi') {
        return list
          .map(s => ({
            value: s.id,
            label: `${s.code} ${s.name}`
          }));
      }

      return list.map(s => ({
        value: s.id,
        label: `${s.code} ${s.name}`
      }));
    });

    const partnerOptions = computed(() => {
      const base = selectedBaseSheep.value;
      if (!base) return [];
      if (base.gender === 'betina') {
        return sheep.value
          .filter(s => s.gender === 'jantan' && !['Mati', 'Terjual', 'Disembelih'].includes(s.status) && checkIsSheepBirahi(s))
          .map(s => ({
            value: s.id,
            label: `${s.code} ${s.name}`
          }));
      } else {
        return sheep.value
          .filter(s => s.gender === 'betina' && !['Mati', 'Terjual', 'Disembelih'].includes(s.status) && checkIsSheepBirahi(s))
          .map(s => ({
            value: s.id,
            label: `${s.code} ${s.name}`
          }));
      }
    });

    const pejantanOptions = computed(() => {
      const jantan = sheep.value.filter(s => s.gender === 'jantan' && s.status === 'Sehat');
      return jantan.map(s => ({
        value: s.id,
        label: `${s.code} ${s.name}`
      }));
    });

    const matingMethodOptions = computed(() => {
      const base = selectedBaseSheep.value;
      if (base && base.gender === 'jantan') {
        return metadataEnums.value.mating_method.filter((matingMethod: EnumChoice) => matingMethod.value === 'alami');
      }
      return metadataEnums.value.mating_method;
    });

    const labelPejantan = computed(() => {
      if (f().metoda === 'ib') {
        return 'Pilih Pejantan (Sumber Semen)';
      }
      return selectedBaseSheep.value?.gender === 'betina'
        ? 'Pilih Pasangan (Pejantan Luar Kandang)'
        : 'Pilih Pasangan (Betina Luar Kandang)';
    });

    watch(selectedBaseSheep, (newBase) => {
      if (newBase && newBase.gender === 'jantan' && (f().metoda === 'ib' || f().metoda === 'inseminasi buatan') && props.form.name !== 'IB' && props.form.name !== 'Inseminasi Buatan') {
        f().metoda = 'alami';
      }
    });

    const estimasiTanggalLahir = computed(() => {
      const tglStr = f().tanggal || new Date().toISOString().split('T')[0];
      try {
        const d = new Date(tglStr as string);
        d.setDate(d.getDate() + 148);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      } catch (e) {
        return '—';
      }
    });

    const renderCompactTree = (node: any, level = 0, maxDepth = 5): any => {
      if (!node || (!node.id_sheep && !node.sheep_code) || level >= maxDepth) return null;

      const isRoot = level === 0;
      const genderSymbol = node.gender === 'jantan' ? '♂️' : (node.gender === 'betina' ? '♀️' : '🐑');
      const relationLabel = isRoot 
        ? '' 
        : (node.gender === 'jantan' ? 'Bapak' : 'Ibu');

      const isCommonAncestor = commonAncestorSet.value.has(String(node.sheep_code || '').toUpperCase()) ||
        commonAncestorSet.value.has(String(node.id_sheep || '').toUpperCase()) ||
        commonAncestorSet.value.has(String(node.sheep_name || '').toUpperCase());

      return (
        <div class="position-relative mt-1 text-start" style={{ fontSize: '0.78rem' }}>
          <div 
            class="d-inline-flex flex-wrap align-items-center gap-1 py-1 px-2.5 rounded-3 border shadow-sm" 
            style={{ 
              borderColor: isCommonAncestor ? '#F59E0B' : '#e2e8f0',
              backgroundColor: isCommonAncestor ? '#FEF3C7' : '#FFFFFF',
              boxShadow: isCommonAncestor ? '0 2px 6px rgba(245, 158, 11, 0.25)' : undefined,
              maxWidth: '100%',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>{genderSymbol}</span>
            {relationLabel && <span class="text-secondary fw-semibold small me-0.5" style={{ fontSize: '0.72rem' }}>{relationLabel}:</span>}
            <span class={['fw-bold', isCommonAncestor ? 'text-warning-dark' : 'text-dark']} style={isCommonAncestor ? { color: '#92400E' } : {}}>
              {node.sheep_code || '—'}
            </span>
            {node.sheep_name && (
              <span class="text-muted text-truncate ms-0.5" style={{ maxWidth: '85px' }} title={node.sheep_name}>
                ({node.sheep_name})
              </span>
            )}
            {isCommonAncestor && (
              <span class="badge rounded-pill bg-warning text-dark ms-0.5 fw-extrabold" style={{ fontSize: '0.62rem', padding: '0.25em 0.5em', letterSpacing: '0.2px' }}>
                ⭐ Leluhur Bersama
              </span>
            )}
          </div>

          {((node.father && (node.father.id_sheep || node.father.sheep_code)) || (node.mother && (node.mother.id_sheep || node.mother.sheep_code))) && (
            <div 
              class="ms-2 border-start ps-2 mt-1 position-relative" 
              style={{ 
                borderColor: isCommonAncestor ? '#F59E0B' : '#cbd5e1',
                borderLeftWidth: '1.5px',
                borderLeftStyle: 'dashed'
              }}
            >
              {node.father && (node.father.id_sheep || node.father.sheep_code) && renderCompactTree(node.father, level + 1, maxDepth)}
              {node.mother && (node.mother.id_sheep || node.mother.sheep_code) && renderCompactTree(node.mother, level + 1, maxDepth)}
            </div>
          )}
        </div>
      );
    };

    watch([() => props.form.targetId, () => props.form.idPejantan, () => f().sumberPejantan], ([id1Str, id2Str, sumber]) => {
      const isIB = f().metoda === 'ib' || props.form.name === 'IB' || props.form.name === 'Inseminasi Buatan';
      if (!id1Str || !id2Str || (isIB && sumber === 'eksternal')) {
        inbreedingResult.value = null;
        maleSilsilah.value = null;
        femaleSilsilah.value = null;
        commonAncestorsList.value = [];
        commonAncestorSet.value = new Set();
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
          maleSilsilah.value = null;
          femaleSilsilah.value = null;
          return;
        }

        if (id1 === id2) {
          inbreedingResult.value = { 
            safe: false, 
            text: 'PERINGATAN INBREEDING: Risiko koefisien kekerabatan (COI) sebesar 100.00% (Sangat Berisiko). ID Ternak betina dan pejantan tidak boleh sama!' 
          };
          maleSilsilah.value = null;
          femaleSilsilah.value = null;
          commonAncestorsList.value = [];
          commonAncestorSet.value = new Set();
          return;
        }

        try {
          const [res, maleSil, femaleSil] = await Promise.all([
            breedingApi.checkInbreeding(male.id, female.id),
            sheepApi.getSilsilah(male.id).catch(() => null),
            sheepApi.getSilsilah(female.id).catch(() => null)
          ]);
          maleSilsilah.value = maleSil;
          femaleSilsilah.value = femaleSil;

          const commonList = res?.common_ancestors || res?.commonAncestors || [];
          commonAncestorsList.value = commonList;
          const cSet = new Set<string>();
          commonList.forEach((c: any) => {
            if (c.id_sheep) cSet.add(String(c.id_sheep).toUpperCase());
            if (c.sheep_code) cSet.add(String(c.sheep_code).toUpperCase());
            if (c.sheep_name) cSet.add(String(c.sheep_name).toUpperCase());
          });
          commonAncestorSet.value = cSet;

          const flag = res?.inbreeding_flag ?? false;
          const percentage = res?.inbreeding_percentage ?? 0.0;
          const pct = percentage.toFixed(2) + '%';
          
          if (flag) {
            let message = '';
            if (percentage >= 25.0) {
              message = `Bahaya! Hubungan keluarga sangat dekat (${pct}, setara induk-anak / saudara kandung). Risiko anakan cacat sangat tinggi. Silakan pilih pejantan lain!`;
            } else if (percentage >= 12.5) {
              message = `Bahaya! Hubungan keluarga dekat (${pct}, setara saudara tiri). Berisiko menimbulkan penyakit genetik pada anakan. Silakan pilih pejantan lain!`;
            } else {
              message = `Peringatan: Hubungan keluarga cukup dekat (${pct}, setara sepupu). Sebaiknya cari pasangan lain untuk menjaga kualitas keturunan.`;
            }
            inbreedingResult.value = {
              safe: false,
              text: message
            };
          } else {
            const mTree = maleSil?.silsilah || maleSil;
            const fTree = femaleSil?.silsilah || femaleSil;
            const maleHasNoParents = !mTree?.father && !mTree?.mother;
            const femaleHasNoParents = !fTree?.father && !fTree?.mother;

            if (maleHasNoParents && femaleHasNoParents) {
              inbreedingResult.value = {
                safe: true,
                text: 'Peringatan Kritis: Kedua domba tidak memiliki silsilah terdaftar di database! Harap silsilah diteliti secara manual sebelum mengawinkan untuk mencegah risiko inbreeding.',
                warningType: 'critical_empty'
              };
            } else if (maleHasNoParents || femaleHasNoParents) {
              inbreedingResult.value = {
                safe: true,
                text: 'Peringatan: Salah satu domba tidak silsilah lengkap di database (kemungkinan dibeli dari luar). Penelusuran inbreeding tidak dapat dilakukan secara maksimal.',
                warningType: 'partial_empty'
              };
            } else {
              let message = '';
              if (percentage > 0) {
                message = `Perkawinan aman dilakukan. Hubungan keluarga jauh (tingkat kekerabatan rendah: ${pct}).`;
              } else {
                message = `Perkawinan aman dilakukan. Tidak terdeteksi hubungan keluarga (tingkat kekerabatan 0%).`;
              }
              inbreedingResult.value = {
                safe: true,
                text: message
              };
            }
          }
        } catch (e) {
          inbreedingResult.value = { safe: true, text: 'Gagal mengecek inbreeding dari server.', error: true };
          maleSilsilah.value = null;
          femaleSilsilah.value = null;
        }
      }, 800);
    }, { immediate: true });

    return () => (
      <>
        {props.form.name === 'Kontrol Kebuntingan' ? (
          <>
            <PencatatanField label="Pilih Data Perkawinan" colClass="col-12" required>
              {props.form.idMating && activePencatatanForm.value?.idMating ? (
                <div class="p-3 rounded-4 bg-light border border-light-cream fw-semibold mt-2">
                  {(() => {
                    const mating = activeMatings.value.find(m => String(m.id_mating) === String(props.form.idMating));
                    return mating ? getMatingLabel(mating) : `ID Perkawinan: ${props.form.idMating}`;
                  })()}
                </div>
              ) : (
                <PencatatanSelect
                  modelValue={props.form.idMating || ''}
                  options={activeMatings.value.map(m => ({
                    value: m.id_mating,
                    label: getMatingLabel(m)
                  }))}
                  placeholder="Pilih perkawinan yang akan diperiksa"
                  onUpdateModelValue={(v: string) => {
                    props.form.idMating = v;
                    const mating = activeMatings.value.find(m => String(m.id_mating) === String(v));
                    if (mating) {
                      const female = sheep.value.find(s => String(s.id) === String(mating.id_sheep_female));
                      props.form.targetId = female ? female.code : String(mating.id_sheep_female);
                      if (female) {
                        selectedBaseSheepId.value = String(female.id);
                        selectedCageCode.value = female.cage_code;
                      }
                    }
                  }}
                />
              )}
            </PencatatanField>
          </>
        ) : (
          f().mode === 'individu' ? (
            <>
              <PencatatanField label="Pilih Kandang" colClass="col-12" required>
                <PencatatanSelect
                  modelValue={selectedCageCode.value}
                  options={cagesList.value.map(c => ({ value: c.code, label: `${c.name} (${c.code})` }))}
                  placeholder="Pilih Kandang"
                  onUpdateModelValue={handleCageChange}
                />
              </PencatatanField>
              <PencatatanField
                label={f().metoda === 'ib' || props.form.name === 'IB' || props.form.name === 'Inseminasi Buatan' || props.form.name === 'Kawin Alam' || props.form.name === 'Kawin Alami' ? 'ID Domba Betina' : 'ID Domba'}
                colClass="col-12"
                required
              >
                <PencatatanSelect
                  modelValue={selectedBaseSheepId.value}
                  options={baseSheepOptions.value}
                  placeholder={selectedCageCode.value ? (f().metoda === 'ib' || props.form.name === 'IB' || props.form.name === 'Inseminasi Buatan' || props.form.name === 'Kawin Alam' || props.form.name === 'Kawin Alami' ? 'Pilih Domba Betina' : 'Pilih ID Domba') : 'Pilih Kandang Terlebih Dahulu'}
                  disabled={!selectedCageCode.value}
                  onUpdateModelValue={handleBaseSheepChange}
                />
              </PencatatanField>
            </>
          ) : (
            <PencatatanField label="ID Kandang" colClass="col-12" required>
              <PencatatanSelect
                modelValue={f().targetId}
                options={cagesList.value.map(c => ({ value: c.code, label: `${c.name} (${c.code})` }))}
                placeholder="Pilih Kandang"
                onUpdateModelValue={(v: string) => { f().targetId = v; }}
              />
            </PencatatanField>
          )
        )}

        {selectedBaseSheep.value && (
          <div class="col-12 animate-fade-in mt-3 mb-3">
            <div class="p-3 rounded-4 bg-light border border-light-cream" style={{ fontSize: '0.85rem', color: '#2C3E50' }}>
              <div class="fw-bold mb-2 text-dark" style={{ fontSize: '0.9rem' }}>
                ℹ️ Informasi Domba & Perkawinan Aktif
              </div>
              <div class="row g-2">
                <div class="col-6">
                  <span class="text-muted small d-block">Jenis Kelamin</span>
                  <span class="fw-bold">{formatGender(selectedBaseSheep.value.gender)}</span>
                </div>
                <div class="col-6">
                  <span class="text-muted small d-block">Umur</span>
                  <span class="fw-bold">{getSheepAgeString(selectedBaseSheep.value)}</span>
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
                  <span class={['fw-bold', (formatMatingReadiness(getBirahiStatus(selectedBaseSheep.value)).startsWith('Ya') || formatMatingReadiness(getBirahiStatus(selectedBaseSheep.value)).includes('Siap') || formatMatingReadiness(getBirahiStatus(selectedBaseSheep.value)).includes('Birahi')) ? 'text-success' : 'text-danger']}>
                    {formatMatingReadiness(getBirahiStatus(selectedBaseSheep.value))}
                  </span>
                </div>
                {(selectedBaseSheep.value.gender === 'betina' || selectedBaseSheep.value.gender === 'female') && (
                  <div class="col-12 mt-1">
                    <span class="text-muted small d-block">Status Kehamilan</span>
                    <span class={['fw-bold', (selectedBaseSheep.value.status === 'Hamil' || selectedBaseSheep.value.status === 'pregnant') ? 'text-warning' : '']}>
                      {(selectedBaseSheep.value.status === 'Hamil' || selectedBaseSheep.value.status === 'pregnant') ? 'Hamil' : 'Tidak Hamil'}
                    </span>
                  </div>
                )}
                {props.form.name === 'Kontrol Kebuntingan' && (
                  <>
                    <div class="col-12 border-top pt-2 mt-2">
                      <span class="text-muted small d-block">Pasangan Perkawinan (Pejantan)</span>
                      <span class="fw-bold text-primary">
                        {(() => {
                          const mating = activeMatings.value.find(m => String(m.id_mating) === String(props.form.idMating));
                          if (!mating) return 'Silakan pilih perkawinan';
                          if ((mating.mating_method === 'ib' || mating.mating_method === 'inseminasi buatan') && mating.external_donor) {
                            return `Donor: ${mating.external_donor.name} (${mating.external_donor.origin || ''})`;
                          }
                          if ((mating.mating_method === 'ib' || mating.mating_method === 'inseminasi buatan') && mating.straw_code) {
                            return `IB Straw: ${mating.straw_code}`;
                          }
                          const maleId = mating.id_sheep_male || mating.id_male_sheep;
                          const male = sheep.value.find(s => String(s.id) === String(maleId));
                          return male ? `[${male.code}] ${male.name}` : `Pejantan #${maleId}`;
                        })()}
                      </span>
                    </div>
                    <div class="col-6 mt-1">
                      <span class="text-muted small d-block">Metode Kawin</span>
                      <span class="fw-bold text-capitalize">
                        {(() => {
                          const mating = activeMatings.value.find(m => String(m.id_mating) === String(props.form.idMating));
                          if (!mating) return '—';
                          return (mating.mating_method === 'ib' || mating.mating_method === 'inseminasi buatan') ? 'Inseminasi Buatan' : 'Kawin Alami';
                        })()}
                      </span>
                    </div>
                    <div class="col-6 mt-1">
                      <span class="text-muted small d-block">Tanggal Kawin</span>
                      <span class="fw-bold text-success">
                        {(() => {
                          const mating = activeMatings.value.find(m => String(m.id_mating) === String(props.form.idMating));
                          if (!mating) return '—';
                          const matingDate = new Date(mating.mating_date);
                          const diffDays = mating.days_since_mating || 0;
                          const dateStr = matingDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                          return `${dateStr} (${diffDays} hari lalu)`;
                        })()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

            <PencatatanField label="Tanggal Pemeriksaan" colClass="col-12" required>
              <PencatatanInput
                type="date"
                modelValue={props.form.tanggal}
                onUpdateModelValue={(v: string) => { props.form.tanggal = v; }}
              />
            </PencatatanField>

            <PencatatanField label="Metode Pemeriksaan" colClass="col-12" required>
              <PencatatanSelect
                modelValue={props.form.metodePemeriksaan || 'manual'}
                options={metadataEnums.value.pregnancy_check_methods || [
                  { value: 'usg', label: 'Cek USG' },
                  { value: 'palpasi', label: 'Palpasi' },
                  { value: 'testpack', label: 'Testpack' }
                ]}
                placeholder="Pilih Metode Pemeriksaan"
                onUpdateModelValue={(v: string) => { props.form.metodePemeriksaan = v; }}
              />
            </PencatatanField>

            <PencatatanField label="Hasil Pemeriksaan" colClass="col-12" required>
              <div class="d-flex flex-column gap-2 mt-2">
                 {(metadataEnums.value.pregnancy_check_results || [
                  { value: 'masih_menunggu', label: 'Masih Menunggu (Perlu Pemeriksaan Ulang Nanti)' },
                  { value: 'bunting_terkonfirmasi', label: 'Bunting Terkonfirmasi' },
                  { value: 'gagal', label: 'Gagal / Tidak Bunting' },
                  { value: 'keguguran', label: 'Keguguran' }
                ]).map(opt => (
                  <label class="d-flex align-items-center gap-2 cursor-pointer" key={opt.value}>
                    <input
                      type="radio"
                      value={opt.value}
                      name={`hasilPemeriksaan-${props.form.id}`}
                      checked={props.form.hasilPemeriksaan === opt.value}
                      onChange={() => { props.form.hasilPemeriksaan = opt.value; }}
                    />
                    <span class={opt.value === 'bunting_terkonfirmasi' ? 'text-success fw-bold' : (opt.value === 'gagal' ? 'text-danger' : (opt.value === 'keguguran' ? 'text-warning' : ''))}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </PencatatanField>
          </>
        ) : (props.form.name === 'Cek Birahi' || props.form.name === 'Pencatatan Birahi' || props.form.name === 'Pengecekan Birahi') ? (
          <>
            <PencatatanField label="Tanggal Pemeriksaan" colClass="col-12" required>
              <PencatatanInput
                type="date"
                modelValue={props.form.tanggal}
                onUpdateModelValue={(v: string) => { props.form.tanggal = v; }}
              />
            </PencatatanField>

            <PencatatanField label="Hasil Cek Birahi" colClass="col-12" required>
              <div class="d-flex flex-column gap-2 mt-2">
                 {(metadataEnums.value.estrus_check_results || [
                  { value: 'birahi', label: 'Birahi (Siap Kawin)' },
                  { value: 'tidak_birahi', label: 'Tidak Birahi' }
                ]).map(opt => (
                  <label class="d-flex align-items-center gap-2 cursor-pointer" key={opt.value}>
                    <input
                      type="radio"
                      value={opt.value}
                      name={`hasilPemeriksaan-${props.form.id}`}
                      checked={props.form.hasilPemeriksaan === opt.value}
                      onChange={() => { props.form.hasilPemeriksaan = opt.value; }}
                    />
                    <span class={opt.value === 'birahi' ? 'text-success fw-bold' : 'text-muted'}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </PencatatanField>
          </>
        ) : (
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

            {f().mode === 'individu' && (
              <>
                {props.form.name !== 'IB' && props.form.name !== 'Inseminasi Buatan' && props.form.name !== 'Kawin Alam' && props.form.name !== 'Kawin Alami' && (f().metoda !== 'ib' && f().metoda !== 'inseminasi buatan') && (
                  <PencatatanField label="Metoda Perkawinan" colClass="col-12">
                    <PencatatanSelect
                      modelValue={f().metoda}
                      options={matingMethodOptions.value}
                      placeholder="Pilih Metoda Perkawinan"
                      onUpdateModelValue={(v: string) => { f().metoda = v; }}
                    />
                  </PencatatanField>
                )}

                {f().metoda === 'ib' && (
                  <>
                    <PencatatanField label="Kode Batch / Nomor Straw Semen" colClass="col-12" required>
                      <PencatatanInput
                        modelValue={f().asalSemen || ''}
                        placeholder="Masukkan nomor batch atau kode straw sperma beku"
                        onUpdateModelValue={(v: string) => { f().asalSemen = v; }}
                      />
                    </PencatatanField>
                    <PencatatanField label="Nama Inseminator" colClass="col-12" required>
                      <PencatatanInput
                        modelValue={f().namaInseminator || ''}
                        placeholder="Catat nama petugas/inseminator yang melakukan tindakan IB"
                        onUpdateModelValue={(v: string) => { f().namaInseminator = v; }}
                      />
                    </PencatatanField>
                    <PencatatanField label="Tanggal dan Jam IB" colClass="col-12" required>
                      <PencatatanInput
                        type="datetime-local"
                        modelValue={f().waktuIB || ''}
                        onUpdateModelValue={(v: string) => { f().waktuIB = v; }}
                      />
                    </PencatatanField>

                    <div class="col-12 mt-3">
                      <div class="p-3 rounded-4" style={{ color: '#1B4F72', background: '#EBF5FB', border: '1px solid #AED6F1' }}>
                        <div class="fw-bold mb-1" style={{ fontSize: '0.85rem' }}>
                          ℹ️ Estimasi Hari Kelahiran (Gestasi 148 Hari)
                        </div>
                        <div style={{ fontSize: '0.85rem' }}>
                          Perkiraan tanggal melahirkan induk betina: <strong class="text-dark">{estimasiTanggalLahir.value}</strong>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {(() => {
                  const isIB = f().metoda === 'ib' || props.form.name === 'IB' || props.form.name === 'Inseminasi Buatan';
                  return (
                    <>
                      {isIB && (
                        <PencatatanField label="Sumber Pejantan" colClass="col-12" required>
                          <div class="d-flex gap-4 mt-2">
                            <label class="d-flex align-items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="internal"
                                name={`sumberPejantan-${f().id}`}
                                checked={f().sumberPejantan !== 'eksternal'}
                                onChange={() => {
                                  f().sumberPejantan = 'internal';
                                  f().donorName = '';
                                  f().donorOrigin = '';
                                  f().idPejantan = '';
                                  inbreedingResult.value = null;
                                  maleSilsilah.value = null;
                                  femaleSilsilah.value = null;
                                }}
                              />
                              <span>Pejantan Internal</span>
                            </label>
                            <label class="d-flex align-items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="eksternal"
                                name={`sumberPejantan-${f().id}`}
                                checked={f().sumberPejantan === 'eksternal'}
                                onChange={() => {
                                  f().sumberPejantan = 'eksternal';
                                  f().idPejantan = '';
                                  inbreedingResult.value = null;
                                  maleSilsilah.value = null;
                                  femaleSilsilah.value = null;
                                }}
                              />
                              <span>Donor Eksternal (Straw)</span>
                            </label>
                          </div>
                        </PencatatanField>
                      )}

                      {!(isIB && f().sumberPejantan === 'eksternal') ? (
                        selectedBaseSheep.value && (
                          <PencatatanField
                            label={labelPejantan.value}
                            colClass="col-12"
                            required
                          >
                            <PencatatanSelect
                              modelValue={selectedBaseSheep.value.gender === 'betina' ? f().idPejantan : f().targetId}
                              options={partnerOptions.value}
                              placeholder={selectedBaseSheep.value.gender === 'betina' ? 'Pilih Pejantan Pasangan / Donor Semen' : 'Pilih Betina Pasangan'}
                              onUpdateModelValue={(v: string) => {
                                if (selectedBaseSheep.value?.gender === 'betina') {
                                  f().idPejantan = v;
                                } else {
                                  f().targetId = v;
                                }
                              }}
                            />
                          </PencatatanField>
                        )
                      ) : (
                        <>
                          <PencatatanField label="Nama / ID Pejantan Donor" colClass="col-12" required>
                            <PencatatanInput
                              modelValue={f().donorName || ''}
                              placeholder="Misal: Donor Sire X"
                              onUpdateModelValue={(v: string) => { f().donorName = v; }}
                            />
                          </PencatatanField>
                          <PencatatanField label="Instansi / Balai Asal Pejantan Donor" colClass="col-12" required>
                            <PencatatanInput
                              modelValue={f().donorOrigin || ''}
                              placeholder="Misal: BIB Lembang"
                              onUpdateModelValue={(v: string) => { f().donorOrigin = v; }}
                            />
                          </PencatatanField>
                        </>
                      )}
                    </>
                  );
                })()}

                {selectedPartnerSheep.value && (
                  <div class="col-12 animate-fade-in mt-3">
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
                          <span class="fw-bold">{getSheepAgeString(selectedPartnerSheep.value)}</span>
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
                          <span class={['fw-bold', (formatMatingReadiness(getBirahiStatus(selectedPartnerSheep.value)).startsWith('Ya') || formatMatingReadiness(getBirahiStatus(selectedPartnerSheep.value)).includes('Siap') || formatMatingReadiness(getBirahiStatus(selectedPartnerSheep.value)).includes('Birahi')) ? 'text-success' : 'text-danger']}>
                            {formatMatingReadiness(getBirahiStatus(selectedPartnerSheep.value))}
                          </span>
                        </div>
                        {selectedPartnerSheep.value.gender === 'betina' && (
                          <div class="col-12 mt-1">
                            <span class="text-muted small d-block">Status Kehamilan</span>
                            <span class={['fw-bold', selectedPartnerSheep.value.status === 'Hamil' ? 'text-warning' : '']}>
                              {selectedPartnerSheep.value.status === 'Hamil' ? 'Hamil' : 'Tidak Hamil'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Automatic Pedigree Check Result */}
                {inbreedingResult.value && (
                  <div class="col-12 mt-2 animate-fade-in">
                    <div
                      class={[
                        'alert py-3 rounded-4 border small m-0',
                        !inbreedingResult.value.safe ? 'alert-danger border-danger' : 
                        (inbreedingResult.value.warningType ? 'alert-warning border-warning' : 'alert-success border-success')
                      ]}
                      style={{
                        backgroundColor: !inbreedingResult.value.safe ? 'var(--color-danger-bg)' : 
                                         (inbreedingResult.value.warningType ? '#FEF9E7' : 'var(--color-success-bg-alt)'),
                        color: !inbreedingResult.value.safe ? 'var(--color-danger-text)' : 
                               (inbreedingResult.value.warningType ? '#7D6608' : '#1E4620'),
                        borderColor: !inbreedingResult.value.safe ? 'var(--color-danger)' : 
                                     (inbreedingResult.value.warningType ? '#F4D03F' : 'rgba(30, 70, 32, 0.15)')
                      }}
                    >
                      <div class="d-flex align-items-start gap-2">
                        <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>
                          {!inbreedingResult.value.safe ? '⚠️' : 
                           (inbreedingResult.value.warningType ? '⚠️' : (inbreedingResult.value.error ? 'ℹ️' : '✅'))}
                        </span>
                        <div class="flex-grow-1 text-start">
                          <span class="fw-bold d-block mb-1">{inbreedingResult.value.text}</span>

                          {/* Highlight Leluhur Bersama Summary Bar */}
                          {commonAncestorsList.value.length > 0 && (
                            <div class="mt-2 p-2.5 rounded-3 border d-flex align-items-center gap-2 flex-wrap" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E', fontSize: '0.78rem' }}>
                              <span class="fw-bold">⭐ Leluhur Bersama (Terhubung di Jalur Pejantan & Indukan):</span>
                              <div class="d-flex gap-1 flex-wrap">
                                {commonAncestorsList.value.map((c: any) => (
                                  <span class="badge rounded-pill bg-warning text-dark px-2.5 py-1 fw-extrabold" key={c.id_sheep || c.sheep_code} style={{ fontSize: '0.72rem' }}>
                                    🔗 {c.sheep_name || c.sheep_code}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Lineage Trees Side-by-Side */}
                          {(!inbreedingResult.value.error && (maleSilsilah.value || femaleSilsilah.value)) && (
                            <div class="row mt-3 g-3">
                              <div class="col-md-6">
                                <div class="p-3 rounded-4 h-100 bg-white bg-opacity-80 border border-white-30" style={{ backdropFilter: 'blur(4px)', overflowX: 'auto' }}>
                                  <div class="fw-bold mb-2 text-dark d-flex align-items-center gap-1" style={{ fontSize: '0.85rem' }}>
                                    <span>♂️ Silsilah Pejantan</span>
                                  </div>
                                  <div style={{ minWidth: '220px' }}>
                                    {maleSilsilah.value?.silsilah ? renderCompactTree(maleSilsilah.value.silsilah) : (maleSilsilah.value ? renderCompactTree(maleSilsilah.value) : <span class="text-muted">Tidak ada silsilah.</span>)}
                                  </div>
                                </div>
                              </div>
                              <div class="col-md-6">
                                <div class="p-3 rounded-4 h-100 bg-white bg-opacity-80 border border-white-30" style={{ backdropFilter: 'blur(4px)', overflowX: 'auto' }}>
                                  <div class="fw-bold mb-2 text-dark d-flex align-items-center gap-1" style={{ fontSize: '0.85rem' }}>
                                    <span>♀️ Silsilah Indukan</span>
                                  </div>
                                  <div style={{ minWidth: '220px' }}>
                                    {femaleSilsilah.value?.silsilah ? renderCompactTree(femaleSilsilah.value.silsilah) : (femaleSilsilah.value ? renderCompactTree(femaleSilsilah.value) : <span class="text-muted">Tidak ada silsilah.</span>)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Bottom-left Info "i" Trigger Button */}
                          {!inbreedingResult.value.error && (
                            <div class="mt-3 d-flex justify-content-start">
                              <button
                                type="button"
                                class="btn p-0 d-flex align-items-center gap-2 text-secondary border-0 text-decoration-none"
                                style={{
                                  fontSize: '0.78rem',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: 'inherit',
                                  opacity: 0.75,
                                  fontWeight: 600,
                                  transition: 'opacity 0.2s'
                                }}
                                onClick={() => { showCOIInfoModal.value = true; }}
                              >
                                <span
                                  class="rounded-circle d-flex align-items-center justify-content-center border border-secondary"
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace',
                                    display: 'inline-flex',
                                    borderColor: 'currentColor'
                                  }}
                                >
                                  i
                                </span>
                                <span>Info Rumus & Kategori COI</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* COI Details Pop-up Modal */}
        {showCOIInfoModal.value && (
          <Teleport to="body">
            <div class="peternakan-modal-overlay animate-fade-in" style={{ zIndex: 1200 }} onClick={() => { showCOIInfoModal.value = false; }}>
              <div class="peternakan-modal-card animate-fade-in-up" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
                <div class="peternakan-modal-header">
                  <button type="button" class="peternakan-modal-close" onClick={() => { showCOIInfoModal.value = false; }}>
                    <img src="/icon/close-cancel/grey-24.svg" alt="Tutup" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                  </button>
                  <div class="peternakan-modal-title">Perhitungan Inbreeding (COI)</div>
                </div>
                <div class="peternakan-modal-body">
                  <div class="p-3 rounded-4 bg-light border mb-3">
                    <div class="fw-extrabold text-dark mb-2" style={{ fontSize: '0.9rem' }}>📐 Rumus Wright's Coefficient of Inbreeding (COI)</div>
                    <div class="font-monospace text-secondary small bg-white p-2 rounded mb-2 border text-center" style={{ fontSize: '0.85rem' }}>
                      F_X = Σ [ (1/2)^(n + m + 1) * (1 + F_A) ]
                    </div>
                    <div class="text-muted" style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                      Di mana <strong>n</strong> dan <strong>m</strong> adalah jumlah generasi dari induk jantan dan betina ke leluhur bersama (common ancestor) <strong>A</strong>, dan <strong>F_A</strong> adalah inbreeding coefficient dari leluhur tersebut.
                    </div>
                  </div>

                  <div class="fw-extrabold text-dark mb-2" style={{ fontSize: '0.9rem' }}>🚦 Kategori Risiko Inbreeding:</div>
                  <div class="d-flex flex-column gap-2 text-dark mb-3" style={{ fontSize: '0.8rem' }}>
                    <div class="d-flex align-items-center justify-content-between p-2 rounded bg-success bg-opacity-10 text-success border border-success-subtle">
                      <span class="fw-bold">Safe (Aman)</span>
                      <span>&lt; 3.125%</span>
                    </div>
                    <div class="d-flex align-items-center justify-content-between p-2 rounded bg-info bg-opacity-10 text-info border border-info-subtle">
                      <span class="fw-bold">Low (Rendah)</span>
                      <span>3.125% - 6.25%</span>
                    </div>
                    <div class="d-flex align-items-center justify-content-between p-2 rounded bg-warning bg-opacity-10 text-warning border border-warning-subtle">
                      <span class="fw-bold">Ambang Batas</span>
                      <span>6.25% - 12.5%</span>
                    </div>
                    <div class="d-flex align-items-center justify-content-between p-2 rounded bg-danger bg-opacity-10 text-danger border border-danger-subtle">
                      <span class="fw-bold">High (Tinggi)</span>
                      <span>12.5% - 25%</span>
                    </div>
                    <div class="d-flex align-items-center justify-content-between p-2 rounded bg-danger text-white border border-danger">
                      <span class="fw-bold text-white">Very High</span>
                      <span class="fw-bold text-white">&gt;= 25%</span>
                    </div>
                  </div>

                  <div class="fw-extrabold text-dark mb-2" style={{ fontSize: '0.9rem' }}>📋 Acuan Hubungan Kekerabatan & Koefisien F:</div>
                  <div class="table-responsive border rounded-4 bg-white">
                    <table class="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.78rem' }}>
                      <thead class="table-light">
                        <tr class="text-center font-weight-bold">
                          <th style={{ width: '40px', fontWeight: 'bold' }}>No</th>
                          <th style={{ textAlign: 'left', fontWeight: 'bold' }}>Hubungan Kekerabatan</th>
                          <th style={{ width: '90px', fontWeight: 'bold' }}>Koefisien F</th>
                          <th style={{ width: '120px', fontWeight: 'bold' }}>Kategori</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="text-center text-muted">1</td>
                          <td>Induk–anak (<em>parent–offspring</em>)</td>
                          <td class="text-center fw-semibold text-danger">25,00%</td>
                          <td class="text-center">
                            <span class="badge bg-danger text-white px-2 py-1" style={{ fontSize: '0.7rem' }}>Sangat Tinggi</span>
                          </td>
                        </tr>
                        <tr>
                          <td class="text-center text-muted">2</td>
                          <td>Saudara kandung penuh (<em>full sibling</em>)</td>
                          <td class="text-center fw-semibold text-danger">25,00%</td>
                          <td class="text-center">
                            <span class="badge bg-danger text-white px-2 py-1" style={{ fontSize: '0.7rem' }}>Sangat Tinggi</span>
                          </td>
                        </tr>
                        <tr>
                          <td class="text-center text-muted">3</td>
                          <td>Saudara tiri (<em>half sibling</em>)</td>
                          <td class="text-center fw-semibold text-warning-emphasis">12,50%</td>
                          <td class="text-center">
                            <span class="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-2 py-1" style={{ fontSize: '0.7rem' }}>Tinggi</span>
                          </td>
                        </tr>
                        <tr>
                          <td class="text-center text-muted">4</td>
                          <td>Sepupu pertama (<em>first cousin</em>)</td>
                          <td class="text-center fw-semibold text-warning-emphasis">6,25%</td>
                          <td class="text-center">
                            <span class="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle px-2 py-1" style={{ fontSize: '0.7rem' }}>Ambang Batas</span>
                          </td>
                        </tr>
                        <tr>
                          <td class="text-center text-muted">5</td>
                          <td>Tidak ada kekerabatan terdekat</td>
                          <td class="text-center fw-semibold text-success">0,00%</td>
                          <td class="text-center">
                            <span class="badge bg-success text-success bg-opacity-10 border border-success-subtle px-2 py-1" style={{ fontSize: '0.7rem' }}>Sangat Rendah</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="mt-4 pt-3 border-top border-light text-end">
                  <button type="button" class="peternakan-primary-btn px-4" onClick={() => { showCOIInfoModal.value = false; }}>Tutup</button>
                </div>
              </div>
            </div>
          </Teleport>
        )}
      </>
    );
  }
});
