import { defineComponent, computed, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import PencatatanField from './PencatatanField';
import PencatatanInput from './PencatatanInput';
import PencatatanSelect from './PencatatanSelect';
import PencatatanTextarea from './PencatatanTextarea';
import { landsList, fetchLandsList, cageSession, cagesList, activePencatatanForm } from '@/store/navigation';
import PencatatanModeToggle from './PencatatanModeToggle';
import type { PencatatanMode } from './PencatatanModeToggle';
import { stocks } from '@/modules/ternak/store/peternakan';
import { sheep, weightRecords } from '@/store/livestock';
import { breedingApi, feedsApi, pemangkasanApi, type EnumChoice } from '@/shared/api';
import { ref } from 'vue';
import { metadataEnums, pencatatanSubmissions } from '@/store/operatorAdmin';

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
  asalSemen?: string;
  namaInseminator?: string;
  waktuIB?: string;
  sumberPejantan?: 'internal' | 'eksternal';
  donorName?: string;
  donorOrigin?: string;
  idMating?: string;
  metodePemeriksaan?: string;
  hasilPemeriksaan?: string;
  hijauan?: string;
  energi?: string;
  protein?: string;
  mineral?: string;
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

    const pruningOptions = ref<any[]>([]);
    const selectedCageCode = ref<string>('');
    const backendRecommendations = ref<any[]>([]);
    const backendTotalFreshWeight = ref<number>(0);

    onMounted(async () => {
      try {
        const res = await pemangkasanApi.getList();
        // Hanya ambil yang punya jumlah > 0
        pruningOptions.value = (res || [])
          .filter((p: any) => Number(p.jumlah) > 0)
          .map((p: any) => ({
            value: `Pemangkasan ${p.nama_rincian_aktivitas || 'Daun'}`,
            label: `[Kebun] Pemangkasan ${p.nama_rincian_aktivitas || 'Daun'} (${p.jumlah} ${p.satuan})`
          }));
      } catch (e) {
        console.error('Failed to load pruning for dropdown', e);
      }
    });

    const feedStockOptions = computed(() => {
      const dbStocks = stocks.value
        .filter((s: any) => {
          const cat = (s.category || '').toLowerCase();
          return ['hijauan', 'konsentrat', 'pellet'].includes(cat) || cat.includes('pakan');
        })
        .map((s: any) => ({
          value: s.name,
          label: s.name
        }));
      
      const combined = [...dbStocks, ...pruningOptions.value];
      return combined.slice().sort((a, b) => a.label.localeCompare(b.label));
    });

    // Pakan Dadakan categories and helper options
    const energyFeeds = ['Bekatul', 'Jagung', 'Onggok'];
    const proteinFeeds = ['Ampas Tahu', 'Bungkil Kacang Tanah', 'Bungkil Kelapa Sawit'];
    const mineralFeeds = ['Garam Dirijen', 'Mineral Blok'];
    const hijauanFeeds = ['Ilalang', 'Ketela Pohon', 'Napier Grass / Rumput Gajah', 'Odot', 'Rumput'];

    const getOptionsForFeeds = (names: string[]) => {
      return names.map(name => {
        const stockItem = stocks.value.find((s: any) => s.name.toLowerCase() === name.toLowerCase());
        const qty = stockItem ? stockItem.qty : 0;
        return {
          value: name,
          label: `${name} (Stok: ${qty} kg)`
        };
      });
    };

    const energyOptions = computed(() => getOptionsForFeeds(energyFeeds));
    const proteinOptions = computed(() => getOptionsForFeeds(proteinFeeds));
    const mineralOptions = computed(() => getOptionsForFeeds(mineralFeeds));
    const hijauanOptions = computed(() => getOptionsForFeeds(hijauanFeeds));

    // Computed properties mapping Pakan Dadakan fields to PencatatanFormItem properties
    const energyFeed = computed({
      get: () => f().energi || '',
      set: (v) => { f().energi = v; }
    });
    const proteinFeed = computed({
      get: () => f().protein || '',
      set: (v) => { f().protein = v; }
    });
    const mineralFeed = computed({
      get: () => f().mineral || '',
      set: (v) => { f().mineral = v; }
    });
    const hijauanFeed = computed({
      get: () => f().hijauan || '',
      set: (v) => { f().hijauan = v; }
    });

    const filteredRecommendations = computed(() => {
      const list: any[] = [];
      const weight = activeWeightForRec.value;
      if (weight <= 0) return list;

      // 1. Hijauan (70% of 10.4% body weight = 7.28% of body weight)
      if (hijauanFeed.value) {
        list.push({
          kategori: 'hijauan',
          jumlah_kg: weight * 0.0728,
          keterangan: `${hijauanFeed.value} (Hijauan, 70% Racikan)`
        });
      }
      
      // 2. Energi (17.3% of 10.4% body weight = 1.8% of body weight)
      if (energyFeed.value) {
        list.push({
          kategori: 'konsentrat',
          jumlah_kg: weight * 0.018,
          keterangan: `${energyFeed.value} (Sumber Energi, 17.3% Racikan)`
        });
      }
      
      // 3. Protein (10.4% of 10.4% body weight = 1.08% of body weight)
      if (proteinFeed.value) {
        list.push({
          kategori: 'konsentrat',
          jumlah_kg: weight * 0.0108,
          keterangan: `${proteinFeed.value} (Sumber Protein, 10.4% Racikan)`
        });
      }
      
      // 4. Mineral (2.3% of 10.4% body weight = 0.24% of body weight)
      if (mineralFeed.value) {
        list.push({
          kategori: 'mineral',
          jumlah_kg: weight * 0.0024,
          keterangan: `${mineralFeed.value} (Mineral, 2.3% Racikan)`
        });
      }
      
      return list;
    });

    const filteredTotalWeight = computed(() => {
      return filteredRecommendations.value.reduce((sum, item) => sum + (item.jumlah_kg || item.JumlahKg || 0), 0);
    });

    const selectedNonMatingSheep = computed(() => {
      if (f().mode !== 'individu') return null;
      return sheep.value.find(s => s.code === f().targetId || String(s.id) === String(f().targetId)) || null;
    });

    const selectedSheepWeightNumeric = computed(() => {
      const s = selectedNonMatingSheep.value;
      if (!s) return 0;
      const wStr = getSheepWeight(s.id);
      const match = wStr.match(/([0-9.]+)/);
      return match ? parseFloat(match[1]) : 0;
    });

    const selectedCageSheepWeightNumeric = computed(() => {
      if (f().mode !== 'kelompok' || !f().targetId) return 0;
      const cageSheep = sheep.value.filter(s => s.cage_code === f().targetId && !['Mati', 'Terjual', 'Disembelih'].includes(s.status));
      return cageSheep.reduce((sum, s) => {
        const wStr = getSheepWeight(s.id);
        const match = wStr.match(/([0-9.]+)/);
        return sum + (match ? parseFloat(match[1]) : 0);
      }, 0);
    });

    const activeWeightForRec = computed(() => {
      return f().mode === 'individu' ? selectedSheepWeightNumeric.value : selectedCageSheepWeightNumeric.value;
    });

    const recommendedHijauan = computed(() => (activeWeightForRec.value * 0.0728).toFixed(2));
    const recommendedEnergy = computed(() => (activeWeightForRec.value * 0.018).toFixed(2));
    const recommendedProtein = computed(() => (activeWeightForRec.value * 0.0108).toFixed(2));
    const recommendedMineral = computed(() => (activeWeightForRec.value * 0.0024).toFixed(2));
    const recommendedTotal = computed(() => (activeWeightForRec.value * 0.104).toFixed(2));

    // Auto-prefill target qty under Pakan Dadakan and Pakan Silase / Stok
    watch(
      [filteredTotalWeight, backendTotalFreshWeight, () => f().metoda],
      ([newFiltered, newBackend, method]) => {
        if (props.jenisId === 'pakan') {
          if (method === 'dadakan') {
            f().qty = newFiltered > 0 ? newFiltered.toFixed(1) : '';
          } else if (method === 'silase') {
            f().qty = newBackend > 0 ? newBackend.toFixed(1) : '';
          }
        }
      },
      { immediate: true }
    );

    // Auto silage mapping for Konversi Pakan
    const targetSilageFeedName = computed(() => {
      const raw = f().hijauan;
      if (raw === 'Daun Alpukat (Mentah)') return 'Silase Daun Alpukat';
      if (raw === 'Daun Kelengkeng (Mentah)') return 'Silase Daun Kelengkeng';
      return 'Pakan Rumput Cacah';
    });

    watch(targetSilageFeedName, (newVal) => {
      if (props.jenisId === 'stok_pakan' && f().name === 'Konversi Pakan') {
        f().obat = newVal;
      }
    }, { immediate: true });

    // Auto silage selection under Pakan Silase / Stok method
    watch(
      () => f().metoda,
      (newMetoda) => {
        if (props.jenisId === 'pakan' && newMetoda === 'silase') {
          f().obat = 'Pakan Silase';
        }
      },
      { immediate: true }
    );

    // Watch targetId and if it matches a sheep, set the selectedCageCode to that sheep's cage_code!
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
      const foundSheep = sheep.value.find(s => s.code === f().targetId || String(s.id) === String(f().targetId));
      if (!foundSheep || foundSheep.cage_code !== cageCode) {
        f().targetId = '';
        selectedBaseSheepId.value = '';
      }
    };

    const getStockForFeed = (name: string) => {
      if (!name) return { qty: 0, text: 'Belum dipilih', isZero: true };
      const item = stocks.value.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (!item) return { qty: 0, text: 'Stok: 0 kg', isZero: true };
      return { qty: item.qty, text: `Stok: ${item.qty.toFixed(1)} kg`, isZero: item.qty <= 0 };
    };

    // Kalkulasi Otomatis Pakan berdasarkan ID
    watch(
      () => f().targetId,
      async (newTarget) => {
        if (props.jenisId === 'pakan') {
          // Jangan auto isi jika kosong, kecuali mode kelompok
          if ((!newTarget || newTarget.length < 2) && f().mode === 'individu') {
            f().qty = '';
            backendRecommendations.value = [];
            backendTotalFreshWeight.value = 0;
            return;
          }

          if (f().mode === 'kelompok' || !f().mode || f().mode !== 'individu') {
             if (newTarget) {
               try {
                 const res = await feedsApi.getRecommendationByCage(newTarget);
                 const total = (res.total_hijauan_kg || 0) + (res.total_konsentrat_kg || 0);
                 f().qty = total.toFixed(1);
                 backendRecommendations.value = [
                   { Kategori: 'hijauan', JumlahKg: res.total_hijauan_kg || 0, Keterangan: 'Total Hijauan untuk kandang ini' },
                   { Kategori: 'konsentrat', JumlahKg: res.total_konsentrat_kg || 0, Keterangan: 'Total Konsentrat untuk kandang ini' }
                 ];
                 backendTotalFreshWeight.value = total;
               } catch(e) {
                 f().qty = '';
                 backendRecommendations.value = [];
                 backendTotalFreshWeight.value = 0;
               }
             }
          } else {
             try {
               const res = await feedsApi.getRecommendation(newTarget);
               f().qty = (res.total_pakan_harian_kg || 0).toFixed(1);
               backendRecommendations.value = res.rekomendasi_harian || [];
               backendTotalFreshWeight.value = res.total_pakan_harian_kg || 0;
             } catch(e) {
               f().qty = '';
               backendRecommendations.value = [];
               backendTotalFreshWeight.value = 0;
             }
          }
          
          if (!f().obat && feedStockOptions.value.length > 0) {
             f().obat = feedStockOptions.value[0]?.value || '';
          }
        }
      },
      { immediate: true }
    );

    const activeMatings = ref<any[]>([]);
    const isLoadingMatings = ref(false);

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

    const getMatingLabel = (mating: any) => {
      const female = sheep.value.find(s => String(s.id) === String(mating.id_sheep_female));
      const femaleLabel = female ? `[${female.code}] ${female.name}` : `Domba Betina #${mating.id_sheep_female}`;
      
      const matingDate = new Date(mating.mating_date);
      const diffDays = mating.days_since_mating || 0;
      
      const dateStr = matingDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${femaleLabel} — Kawin: ${dateStr} (${diffDays} hari lalu)`;
    };

    // Watch for form mating ID and prefill targetId
    watch(
      () => props.form.idMating,
      async (newVal) => {
        if (newVal) {
          let mating = activeMatings.value.find(m => String(m.id_mating) === String(newVal));
          if (!mating) {
            try {
              mating = await breedingApi.getMatingDetail(newVal);
            } catch (err) {
              console.error('Failed to fetch mating detail:', err);
            }
          }
          if (mating) {
            const female = sheep.value.find(s => String(s.id) === String(mating.id_sheep_female));
            props.form.targetId = female ? female.code : String(mating.id_sheep_female);
            if (female) {
              selectedBaseSheepId.value = String(female.id);
            }
          }
        }
      },
      { immediate: true }
    );

    onMounted(() => {
      if (landsList.value.length === 0) {
        fetchLandsList();
      }
      if (props.jenisId === 'perkawinan') {
        if (props.form.name === 'Kontrol Kebuntingan') {
          fetchActiveMatings();
        } else if (props.form.name === 'IB' || props.form.name === 'Inseminasi Buatan') {
          props.form.metoda = 'ib';
        } else if (props.form.name === 'Kawin Alam' || props.form.name === 'Kawin Alami') {
          props.form.metoda = 'alami';
        }
      }
      if (props.jenisId === 'pakan' && !f().metoda) {
        f().metoda = 'dadakan';
      }
      if (cageSession.value?.code) {
        selectedCageCode.value = cageSession.value.code;
      } else {
        selectedCageCode.value = '';
      }
    });

    const isKonversi = computed(() => props.form.name === 'Konversi Pakan');

    const birahiOptions = computed(() => {
      const betina = sheep.value.filter(s => s.gender === 'betina' && s.status !== 'Hamil');
      return betina.map(s => ({
        value: s.id,
        label: `${s.code} ${s.name}`
      }));
    });

    const pejantanOptions = computed(() => {
      const jantan = sheep.value.filter(s => s.gender === 'jantan' && s.status === 'Sehat');
      return jantan.map(s => ({
        value: s.id,
        label: `${s.code} ${s.name}`
      }));
    });

    const inbreedingResult = ref<{ safe: boolean; text: string; error?: boolean } | null>(null);
    let inbreedingTimeout: any = null;

    const selectedBaseSheepId = ref('');

    const checkIsSheepBirahi = (s: any) => {
      if (s.gender !== 'betina') return false;

      // Check if she is currently in an active mating (status: proses)
      const hasActiveMating = activeMatings.value.some(
        m => String(m.id_sheep_female) === String(s.id)
      );
      if (hasActiveMating) return false;

      // Check if there is an approved or pending "Kawin Alam" or "IB" submission for this sheep
      const hasPendingMatingSubmission = pencatatanSubmissions.value.some(sub => {
        if (sub.approvalStatus === 'rejected') return false;
        const dataObj: any = (sub.payload as any)?.data || sub.payload;
        const items = dataObj?.items || [];
        return items.some((item: any) => 
          (item.name === 'Kawin Alam' || item.name === 'Kawin Alami' || item.name === 'IB' || item.name === 'Inseminasi Buatan') &&
          (String(item.targetId) === String(s.code) || String(item.targetId) === String(s.id))
        );
      });
      if (hasPendingMatingSubmission) return false;

      // Find the latest Cek Birahi checkup for this sheep
      let latestEstrusCheck: { hasil: string; time: number } | null = null;

      for (const sub of pencatatanSubmissions.value) {
        if (sub.approvalStatus === 'rejected') continue;
        const dataObj: any = (sub.payload as any)?.data || sub.payload;
        const items = dataObj?.items || [];
        for (const item of items) {
          if (item.name === 'Cek Birahi' && (String(item.targetId) === String(s.code) || String(item.targetId) === String(s.id))) {
            const time = sub.submittedAt || Date.now();
            if (!latestEstrusCheck || time > latestEstrusCheck.time) {
              latestEstrusCheck = { hasil: item.hasilPemeriksaan || '', time };
            }
          }
        }
      }

      // If a check was recorded, use its result
      if (latestEstrusCheck) {
        return latestEstrusCheck.hasil === 'birahi';
      }

      // Otherwise, fallback to backend mating status
      return String(s.mating_status || '').startsWith('Ya');
    };

    const baseSheepOptions = computed(() => {
      const activeCode = selectedCageCode.value;
      const list = sheep.value
        .filter(s => s.cage_code === activeCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status));
      
      const formName = props.form.name || '';
      if (props.jenisId === 'perkawinan') {
        if (formName === 'Kontrol Kebuntingan') {
          const matedFemaleIds = new Set(activeMatings.value.map(m => String(m.id_sheep_female)));
          
          // Also include sheeps that have pending mating submissions
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

        if (formName === 'Kawin Alam' || formName === 'Kawin Alami' || formName === 'IB' || formName === 'Inseminasi Buatan') {
          return list
            .filter(s => checkIsSheepBirahi(s))
            .map(s => ({
              value: s.id,
              label: `${s.code} ${s.name}`
            }));
        }

        if (formName === 'Cek Birahi') {
          return list
            .filter(s => s.gender === 'betina' && s.status !== 'Hamil')
            .map(s => ({
              value: s.id,
              label: `${s.code} ${s.name}`
            }));
        }
      }

      return list.map(s => ({
        value: s.id,
        label: `${s.code} ${s.name}`
      }));
    });

    const activeCageSheepOptions = computed(() => {
      const activeCode = selectedCageCode.value;
      return sheep.value
        .filter(s => s.cage_code === activeCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status))
        .filter(s => {
           if (props.jenisId === 'kelahiran') return s.gender === 'betina' && s.status === 'Hamil';
           return true;
        })
        .map(s => ({
          value: s.code,
          label: `${s.code} ${s.name}`
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
      if (s.gender === 'betina') {
        props.form.targetId = s.id;
        props.form.idPejantan = '';
      } else {
        props.form.idPejantan = s.id;
        props.form.targetId = '';
      }

      if (props.jenisId === 'perkawinan' && props.form.name === 'Kontrol Kebuntingan' && props.form.idMating) {
        const mating = activeMatings.value.find(m => String(m.id_mating) === String(props.form.idMating));
        if (mating && String(mating.id_sheep_female) !== String(s.id)) {
          props.form.idMating = '';
        }
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
            label: `${s.code} ${s.name}`
          }));
      } else {
        return sheep.value
          .filter(s => s.gender === 'betina' && s.cage_code !== activeCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status))
          .map(s => ({
            value: s.id,
            label: `${s.code} ${s.name}`
          }));
      }
    });

    const getSheepAgeString = (s: any) => {
      if (!s) return '—';
      return s.age || s.age_string || '—';
    };

    const getSheepWeight = (sheepInput: any) => {
      if (!sheepInput) return '—';
      const sheepId = typeof sheepInput === 'object' ? sheepInput.id : sheepInput;
      const sObj = typeof sheepInput === 'object' ? sheepInput : sheep.value.find(x => String(x.id) === String(sheepId));
      
      const records = weightRecords.value.filter(w => String(w.sheep_id) === String(sheepId));
      if (records.length === 0) return sObj?.weight || '—';
      const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sorted[0];
      return latest ? `${latest.weight} kg` : (sObj?.weight || '—');
    };

    const getBirahiStatus = (s: any) => {
      if (!s) return '—';
      if (checkIsSheepBirahi(s)) {
        return 'Ya (Siap Kawin / Birahi)';
      }
      if (s.status === 'Hamil' || s.status === 'hamil') {
        return 'Tidak (Sedang Hamil)';
      }
      const birthDate = s.birth_date ? new Date(s.birth_date) : null;
      if (birthDate) {
        const now = new Date();
        const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
        if (ageInMonths < 8) {
          return 'Tidak (Belum Cukup Umur)';
        }
      }
      return s.mating_status || 'Tidak (Belum Siap / Sedang Pemulihan)';
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
          const res = await breedingApi.checkInbreeding(male.id, female.id);
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
      if (newBase && newBase.gender === 'jantan' && f().metoda === 'ib' && props.form.name !== 'IB' && props.form.name !== 'Inseminasi Buatan') {
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

    const isModeToggleDisabled = computed(() => {
      return ['kotoran', 'berat_badan', 'perkawinan', 'kelahiran'].includes(props.jenisId);
    });

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
          {props.jenisId !== 'stok_pakan' && props.jenisId !== 'perkawinan' && (
            <>
              {f().mode === 'individu' ? (
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
              )}
            </>
          )}

          {props.jenisId === 'perkawinan' && (
            <>
              {f().mode === 'individu' ? (
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
                    label={f().metoda === 'ib' || props.form.name === 'Kontrol Kebuntingan' || props.form.name === 'IB' || props.form.name === 'Inseminasi Buatan' ? 'ID Domba Betina' : 'ID Domba'}
                    colClass="col-12"
                    required
                  >
                    <PencatatanSelect
                      modelValue={selectedBaseSheepId.value}
                      options={baseSheepOptions.value}
                      placeholder={selectedCageCode.value ? (f().metoda === 'ib' || props.form.name === 'Kontrol Kebuntingan' || props.form.name === 'IB' || props.form.name === 'Inseminasi Buatan' ? 'Pilih Domba Betina' : 'Pilih ID Domba') : 'Pilih Kandang Terlebih Dahulu'}
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
              )}
            </>
          )}

          {props.jenisId !== 'stok_pakan' && props.jenisId !== 'perkawinan' && f().mode === 'individu' && selectedNonMatingSheep.value && (
            <div class="col-12 animate-fade-in mb-2">
              <div class="p-3 rounded-4 bg-light border border-light-cream" style={{ fontSize: '0.85rem', color: '#2C3E50' }}>
                <div class="fw-bold mb-2 text-dark" style={{ fontSize: '0.9rem' }}>
                  ℹ️ Informasi Domba
                </div>
                <div class="row g-2">
                  <div class="col-6">
                    <span class="text-muted small d-block">Jenis Kelamin</span>
                    <span class="fw-bold">{selectedNonMatingSheep.value.gender === 'jantan' ? 'Jantan' : 'Betina'}</span>
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
                    <>
                      <div class="col-6 mt-1">
                        <span class="text-muted small d-block">Status Kehamilan</span>
                        <span class={['fw-bold', selectedNonMatingSheep.value.status === 'Hamil' ? 'text-warning' : '']}>
                          {selectedNonMatingSheep.value.status === 'Hamil' ? 'Hamil' : 'Tidak Hamil'}
                        </span>
                      </div>
                      <div class="col-6 mt-1">
                        <span class="text-muted small d-block">Masa Birahi / Siap Kawin</span>
                        <span class={['fw-bold', checkIsSheepBirahi(selectedNonMatingSheep.value) ? 'text-success' : 'text-danger']}>
                          {checkIsSheepBirahi(selectedNonMatingSheep.value) ? 'Ya (Siap Kawin)' : 'Tidak'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
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
                    <span class={['fw-bold', getBirahiStatus(selectedBaseSheep.value).startsWith('Ya') ? 'text-success' : 'text-danger']}>
                      {getBirahiStatus(selectedBaseSheep.value)}
                    </span>
                  </div>
                  {selectedBaseSheep.value.gender === 'betina' && (
                    <div class="col-12 mt-1">
                      <span class="text-muted small d-block">Status Kehamilan</span>
                      <span class={['fw-bold', selectedBaseSheep.value.status === 'Hamil' ? 'text-warning' : '']}>
                        {selectedBaseSheep.value.status === 'Hamil' ? 'Hamil' : 'Tidak Hamil'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {props.jenisId === 'perkawinan' && props.form.name !== 'Cek Birahi' && f().mode === 'individu' && selectedBaseSheep.value && (() => {
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
                          onChange={() => { f().sumberPejantan = 'internal'; }}
                        />
                        <span>Pejantan Internal</span>
                      </label>
                      <label class="d-flex align-items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="eksternal"
                          name={`sumberPejantan-${f().id}`}
                          checked={f().sumberPejantan === 'eksternal'}
                          onChange={() => { f().sumberPejantan = 'eksternal'; }}
                        />
                        <span>Donor Eksternal (Straw)</span>
                      </label>
                    </div>
                  </PencatatanField>
                )}

                {!(isIB && f().sumberPejantan === 'eksternal') ? (
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

          {props.jenisId === 'perkawinan' && props.form.name !== 'Cek Birahi' && f().mode === 'individu' && selectedPartnerSheep.value && (
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
                    <span class={['fw-bold', getBirahiStatus(selectedPartnerSheep.value).startsWith('Ya') ? 'text-success' : 'text-danger']}>
                      {getBirahiStatus(selectedPartnerSheep.value)}
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

          {props.jenisId === 'pakan' && (
            <>
              <PencatatanField label="Metode Pemberian Pakan" colClass="col-12" required>
                <div class="d-flex gap-4 mt-2">
                  <label class="d-flex align-items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="dadakan"
                      name={`feedMethod-${f().id}`}
                      checked={f().metoda !== 'silase'}
                      onChange={() => { f().metoda = 'dadakan'; }}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-800)' }}>Pakan Dadakan (Racikan Sendiri)</span>
                  </label>
                  <label class="d-flex align-items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="silase"
                      name={`feedMethod-${f().id}`}
                      checked={f().metoda === 'silase'}
                      onChange={() => { f().metoda = 'silase'; }}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-800)' }}>Pakan Silase / Stok</span>
                  </label>
                </div>
              </PencatatanField>

              {f().metoda !== 'silase' ? (
                <>
                  <PencatatanField label="Hijauan" colClass="col-12" required>
                    <PencatatanSelect
                      modelValue={hijauanFeed.value}
                      options={hijauanOptions.value}
                      placeholder="Pilih Hijauan"
                      onUpdateModelValue={(v: string) => { hijauanFeed.value = v; }}
                    />
                  </PencatatanField>
                  <PencatatanField label="Sumber Energi" colClass="col-12" required>
                    <PencatatanSelect
                      modelValue={energyFeed.value}
                      options={energyOptions.value}
                      placeholder="Pilih Sumber Energi"
                      onUpdateModelValue={(v: string) => { energyFeed.value = v; }}
                    />
                  </PencatatanField>
                  <PencatatanField label="Sumber Protein" colClass="col-12" required>
                    <PencatatanSelect
                      modelValue={proteinFeed.value}
                      options={proteinOptions.value}
                      placeholder="Pilih Sumber Protein"
                      onUpdateModelValue={(v: string) => { proteinFeed.value = v; }}
                    />
                  </PencatatanField>
                  <PencatatanField label="Pemberian Mineral" colClass="col-12" required>
                    <PencatatanSelect
                      modelValue={mineralFeed.value}
                      options={mineralOptions.value}
                      placeholder="Pilih Pemberian Mineral"
                      onUpdateModelValue={(v: string) => { mineralFeed.value = v; }}
                    />
                  </PencatatanField>

                  {activeWeightForRec.value > 0 && (
                    <div class="col-12 animate-fade-in mb-3">
                      <div class="card bg-light border-0 rounded-4 p-3 text-start">
                        <div class="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>
                          📋 Rekomendasi Pakan (Berdasarkan Bobot: {activeWeightForRec.value.toFixed(1)} kg)
                        </div>
                        {filteredRecommendations.value.length > 0 ? (
                          <div class="row g-2" style={{ fontSize: '0.85rem' }}>
                            {filteredRecommendations.value.map((item: any) => (
                              <div class="col-12 border-bottom pb-2 mb-2" key={item.keterangan || item.Keterangan}>
                                <span class="text-muted d-block text-capitalize fw-bold">{item.kategori || item.Kategori}:</span>
                                <span class="fw-bold text-primary">{(item.jumlah_kg || item.JumlahKg || 0).toFixed(2)} kg</span>
                                <span class="text-secondary small ms-2">({item.keterangan || item.Keterangan})</span>
                              </div>
                            ))}
                            <div class="col-12 pt-1">
                              <span class="text-muted d-block fw-bold">Total Rekomendasi Pakan:</span>
                              <span class="fw-bold text-success fs-6">{filteredTotalWeight.value.toFixed(2)} kg</span>
                            </div>
                          </div>
                        ) : (
                          <div class="text-muted small">Pilih jenis pakan di dropdown di atas untuk melihat rekomendasi.</div>
                        )}
                      </div>
                    </div>
                  )}

                  <PencatatanField label="Total Jumlah Pakan (Target Racikan)" colClass="col-12" required>
                    <PencatatanInput
                      type="number"
                      modelValue={f().qty}
                      placeholder="Masukkan total berat pakan (kg)"
                      onUpdateModelValue={(v: string) => { f().qty = v; }}
                    />
                  </PencatatanField>
                </>
              ) : (
                <>
                  {/* Jenis Pakan dropdown hidden as Pakan Silase is selected automatically */}

                  {activeWeightForRec.value > 0 && (
                    <div class="col-12 animate-fade-in mb-3">
                      <div class="card bg-light border-0 rounded-4 p-3 text-start">
                        <div class="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                          📋 Rekomendasi Pakan (Berdasarkan Bobot: {activeWeightForRec.value.toFixed(1)} kg)
                        </div>
                        <div style={{ fontSize: '0.85rem' }}>
                          <span class="text-muted">Total Kebutuhan Pakan (10.4% Bobot): </span>
                          <span class="fw-bold text-success fs-6">{recommendedTotal.value} kg</span>
                          {(() => {
                            const st = getStockForFeed(f().obat);
                            return <span class={['d-block mt-1 small', st.isZero ? 'text-danger fw-bold' : 'text-secondary']}>({st.text})</span>;
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  <PencatatanField label="Jumlah Pakan" colClass="col-12" required>
                    <PencatatanInput
                      type="number"
                      modelValue={f().qty}
                      placeholder="Masukkan berat pakan (kg)"
                      onUpdateModelValue={(v: string) => { f().qty = v; }}
                    />
                  </PencatatanField>
                </>
              )}

              <PencatatanField label="Satuan" colClass="col-12">
                <PencatatanSelect
                  modelValue={f().unit}
                  options={['kg', 'ikat']}
                  placeholder="Pilih Satuan"
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
                      placeholder="Pilih Nama Pakan / Sumber"
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
                      placeholder="Pilih Satuan"
                      onUpdateModelValue={(v: string) => { f().unit = v; }}
                    />
                  </PencatatanField>
                </>
              ) : (
                <>
                  <PencatatanField label="Pakan Mentah Asal (Dari Kebun)" colClass="col-12" required>
                    <PencatatanSelect
                      modelValue={hijauanFeed.value}
                      options={[
                        { value: 'Daun Alpukat (Mentah)', label: 'Daun Alpukat (Mentah)' },
                        { value: 'Daun Kelengkeng (Mentah)', label: 'Daun Kelengkeng (Mentah)' },
                        { value: 'Gulma / Rumput Liar (Mentah)', label: 'Gulma / Rumput Liar (Mentah)' }
                      ]}
                      placeholder="Pilih Pakan Mentah Asal (Dari Kebun)"
                      onUpdateModelValue={(v: string) => { hijauanFeed.value = v; }}
                    />
                  </PencatatanField>

                  <PencatatanField label="Pakan Tambahan (Sumber Energi)" colClass="col-12" required>
                    <PencatatanSelect
                      modelValue={energyFeed.value}
                      options={energyOptions.value}
                      placeholder="Pilih Pakan Tambahan (Sumber Energi)"
                      onUpdateModelValue={(v: string) => { energyFeed.value = v; }}
                    />
                  </PencatatanField>

                  <PencatatanField label="Pakan Tambahan (Sumber Protein)" colClass="col-12" required>
                    <PencatatanSelect
                      modelValue={proteinFeed.value}
                      options={proteinOptions.value}
                      placeholder="Pilih Pakan Tambahan (Sumber Protein)"
                      onUpdateModelValue={(v: string) => { proteinFeed.value = v; }}
                    />
                  </PencatatanField>

                  <PencatatanField label="Pakan Tambahan (Pemberian Mineral)" colClass="col-12" required>
                    <PencatatanSelect
                      modelValue={mineralFeed.value}
                      options={mineralOptions.value}
                      placeholder="Pilih Pakan Tambahan (Pemberian Mineral)"
                      onUpdateModelValue={(v: string) => { mineralFeed.value = v; }}
                    />
                  </PencatatanField>

                  <PencatatanField label="Target Stok Pakan Hasil Konversi (KG)" colClass="col-12" required>
                    <PencatatanInput
                      type="number"
                      modelValue={f().qty}
                      placeholder="Masukkan target hasil konversi (kg)"
                      onUpdateModelValue={(v: string) => { f().qty = v; }}
                    />
                  </PencatatanField>

                  {parseFloat(f().qty || '0') > 0 && (
                    <div class="col-12 animate-fade-in mb-3">
                      <div class="card bg-light border-0 rounded-4 p-3 text-start">
                        <div class="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>
                          📋 Rekomendasi Komposisi Konversi (Target: {parseFloat(f().qty || '0')} kg)
                        </div>
                        <div class="row g-2" style={{ fontSize: '0.85rem' }}>
                          <div class="col-12">
                            <span class="text-muted d-block fw-bold">Pakan Mentah (70%):</span>
                            <span class="fw-bold text-success">{(parseFloat(f().qty || '0') * 0.7).toFixed(2)} kg</span>
                          </div>
                          <div class="col-12 border-top pt-2 mt-2">
                            <span class="text-muted d-block fw-bold">Pakan Tambahan (30% Racikan):</span>
                          </div>
                          <div class="col-6">
                            <span class="text-muted d-block">Sumber Energi (17.3%):</span>
                            <span class="fw-bold text-primary">{(parseFloat(f().qty || '0') * 0.3 * (0.0180 / 0.0312)).toFixed(2)} kg</span>
                          </div>
                          <div class="col-6">
                            <span class="text-muted d-block">Sumber Protein (10.4%):</span>
                            <span class="fw-bold text-primary">{(parseFloat(f().qty || '0') * 0.3 * (0.0108 / 0.0312)).toFixed(2)} kg</span>
                          </div>
                          <div class="col-6">
                            <span class="text-muted d-block">Pemberian Mineral (2.3%):</span>
                            <span class="fw-bold text-primary">{(parseFloat(f().qty || '0') * 0.3 * (0.0024 / 0.0312)).toFixed(2)} kg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <PencatatanField label="Hasil Konversi Jadi (Otomatis)" colClass="col-12">
                    <PencatatanInput
                      modelValue={targetSilageFeedName.value}
                      disabled={true}
                      placeholder="Otomatis terisi..."
                      onUpdateModelValue={() => {}}
                    />
                  </PencatatanField>
                </>
              )}
            </>
          )}

          {props.jenisId === 'kesehatan' && (
            <>
              <PencatatanField label="Tindakan / Diagnosa" colClass="col-12" required>
                <PencatatanSelect
                  modelValue={f().tindakan}
                  options={[
                    { value: 'Vaksin Enterotoxemia', label: 'Vaksin Enterotoxemia' },
                    { value: 'Vitamin', label: 'Vitamin' },
                    { value: 'Obat Cacing', label: 'Obat Cacing' },
                    { value: 'Antibiotik', label: 'Antibiotik' }
                  ]}
                  placeholder="Pilih Tindakan / Diagnosa"
                  onUpdateModelValue={(v: string) => { f().tindakan = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Obat / Vitamin yang digunakan" colClass="col-12" required>
                <PencatatanSelect
                  modelValue={f().obat}
                  options={[
                    { value: 'Clostridium Vaccine', label: 'Clostridium Vaccine (Vaksin)' },
                    { value: 'Vit B-Complex', label: 'Vit B-Complex (Vitamin)' },
                    { value: 'Albendazole', label: 'Albendazole (Obat Cacing)' },
                    { value: 'Vitamin ADE', label: 'Vitamin ADE' },
                    { value: 'Vitamin B12/PLEK', label: 'Vitamin B12/PLEK' },
                    { value: 'Antibiotik K', label: 'Antibiotik K' }
                  ]}
                  placeholder="Pilih Obat / Vitamin"
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
                  placeholder="Pilih Satuan"
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
                  placeholder="Pilih Kondisi Kotoran"
                  onUpdateModelValue={(v: string) => { f().kotoranState = v; }}
                />
              </PencatatanField>
            </>
          )}

          {props.jenisId === 'perkawinan' && (
            <>
              {props.form.name === 'Kontrol Kebuntingan' ? (
                <>
                  <PencatatanField label="Pilih Data Perkawinan" colClass="col-12" required>
                    {props.form.idMating && activePencatatanForm.value?.idMating ? (
                      <div class="p-3 rounded-4 bg-light border border-light-cream fw-semibold">
                        {(() => {
                          const mating = activeMatings.value.find(m => String(m.id_mating) === String(props.form.idMating));
                          return mating ? getMatingLabel(mating) : `ID Perkawinan: ${props.form.idMating}`;
                        })()}
                      </div>
                    ) : (
                      <PencatatanSelect
                        modelValue={props.form.idMating || ''}
                        options={(() => {
                          let list = activeMatings.value;
                          if (selectedBaseSheepId.value) {
                            list = list.filter(m => String(m.id_sheep_female) === String(selectedBaseSheepId.value));
                          }
                          return list.map(m => ({
                            value: m.id_mating,
                            label: getMatingLabel(m)
                          }));
                        })()}
                        placeholder="Pilih perkawinan yang akan diperiksa"
                        onUpdateModelValue={(v: string) => {
                          props.form.idMating = v;
                          const mating = activeMatings.value.find(m => String(m.id_mating) === String(v));
                          if (mating) {
                            const female = sheep.value.find(s => String(s.id) === String(mating.id_sheep_female));
                            props.form.targetId = female ? female.code : String(mating.id_sheep_female);
                            if (female) {
                              selectedBaseSheepId.value = String(female.id);
                            }
                          }
                        }}
                      />
                    )}
                  </PencatatanField>

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
                      options={[
                        { value: 'non_return_estrus', label: 'Non-Return Estrus' },
                        { value: 'usg_palpasi', label: 'USG / Palpasi' },
                        { value: 'manual', label: 'Manual / Palpasi Tangan' }
                      ]}
                      placeholder="Pilih Metode Pemeriksaan"
                      onUpdateModelValue={(v: string) => { props.form.metodePemeriksaan = v; }}
                    />
                  </PencatatanField>

                  <PencatatanField label="Hasil Pemeriksaan" colClass="col-12" required>
                    <div class="d-flex flex-column gap-2 mt-2">
                      <label class="d-flex align-items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="masih_menunggu"
                          name={`hasilPemeriksaan-${props.form.id}`}
                          checked={props.form.hasilPemeriksaan === 'masih_menunggu'}
                          onChange={() => { props.form.hasilPemeriksaan = 'masih_menunggu'; }}
                        />
                        <span>Masih Menunggu (Perlu Pemeriksaan Ulang Nanti)</span>
                      </label>
                      <label class="d-flex align-items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="bunting_terkonfirmasi"
                          name={`hasilPemeriksaan-${props.form.id}`}
                          checked={props.form.hasilPemeriksaan === 'bunting_terkonfirmasi'}
                          onChange={() => { props.form.hasilPemeriksaan = 'bunting_terkonfirmasi'; }}
                        />
                        <span class="text-success fw-bold">Bunting Terkonfirmasi</span>
                      </label>
                      <label class="d-flex align-items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="gagal"
                          name={`hasilPemeriksaan-${props.form.id}`}
                          checked={props.form.hasilPemeriksaan === 'gagal'}
                          onChange={() => { props.form.hasilPemeriksaan = 'gagal'; }}
                        />
                        <span class="text-danger">Gagal / Tidak Bunting</span>
                      </label>
                      <label class="d-flex align-items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="keguguran"
                          name={`hasilPemeriksaan-${props.form.id}`}
                          checked={props.form.hasilPemeriksaan === 'keguguran'}
                          onChange={() => { props.form.hasilPemeriksaan = 'keguguran'; }}
                        />
                        <span class="text-warning">Keguguran</span>
                      </label>
                    </div>
                  </PencatatanField>
                </>
              ) : props.form.name === 'Cek Birahi' ? (
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
                      <label class="d-flex align-items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="birahi"
                          name={`hasilPemeriksaan-${props.form.id}`}
                          checked={props.form.hasilPemeriksaan === 'birahi'}
                          onChange={() => { props.form.hasilPemeriksaan = 'birahi'; }}
                        />
                        <span class="text-success fw-bold">Birahi (Siap Kawin)</span>
                      </label>
                      <label class="d-flex align-items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="tidak_birahi"
                          name={`hasilPemeriksaan-${props.form.id}`}
                          checked={props.form.hasilPemeriksaan === 'tidak_birahi'}
                          onChange={() => { props.form.hasilPemeriksaan = 'tidak_birahi'; }}
                        />
                        <span class="text-muted">Tidak Birahi</span>
                      </label>
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
                      {props.form.name !== 'IB' && props.form.name !== 'Inseminasi Buatan' && props.form.name !== 'Kawin Alam' && props.form.name !== 'Kawin Alami' && (
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
                </>
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
                  options={metadataEnums.value.offspring_condition}
                  placeholder="Pilih Kondisi Anak"
                  onUpdateModelValue={(v: string) => { f().kondisiAnak = v; }}
                />
              </PencatatanField>
              <PencatatanField label="Kondisi Induk" colClass="col-12">
                <PencatatanSelect
                  modelValue={f().kondisiInduk}
                  options={['Sehat', 'Lemas', 'Perlu Penanganan']}
                  placeholder="Pilih Kondisi Induk"
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
                  placeholder="Pilih Satuan"
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
