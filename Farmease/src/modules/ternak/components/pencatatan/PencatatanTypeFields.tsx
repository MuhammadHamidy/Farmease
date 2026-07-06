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
import { breedingApi, feedsApi, pemangkasanApi, sheepApi, pregnancyApi, type EnumChoice } from '@/shared/api';
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

    const pruningOptions = ref<any[]>([]);
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

    const backendRecommendations = ref<any[]>([]);
    const backendTotalFreshWeight = ref<number>(0);

    onMounted(async () => {
      fetchPregnancies();
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
          return ['hijauan', 'konsentrat', 'pellet', 'greenery', 'silase'].includes(cat) || cat.includes('pakan') || cat.includes('silase');
        })
        .map((s: any) => ({
          value: s.name,
          label: s.name
        }));
      
      const combined = [...dbStocks, ...pruningOptions.value];
      return combined.slice().sort((a, b) => a.label.localeCompare(b.label));
    });

    // Pakan Dadakan categories and helper options fetched dynamically from database stock seeds
    const energyFeeds = computed(() => {
      const dbList = stocks.value
        .filter((s: any) => s.category === 'konsentrat' && (s.notes || '').toLowerCase().includes('energi'))
        .map((s: any) => s.name);
      return dbList.length > 0 ? dbList : ['Bekatul', 'Jagung', 'Onggok'];
    });

    const proteinFeeds = computed(() => {
      const dbList = stocks.value
        .filter((s: any) => s.category === 'konsentrat' && (s.notes || '').toLowerCase().includes('protein'))
        .map((s: any) => s.name);
      return dbList.length > 0 ? dbList : ['Ampas Tahu', 'Bungkil Kacang Tanah', 'Bungkil Kelapa Sawit'];
    });

    const mineralFeeds = computed(() => {
      const dbList = stocks.value
        .filter((s: any) => s.category === 'vitamin' && (s.notes || '').toLowerCase().includes('mineral'))
        .map((s: any) => s.name);
      return dbList.length > 0 ? dbList : ['Garam Dirijen', 'Mineral Blok'];
    });

    const hijauanFeeds = computed(() => {
      const dbList = stocks.value
        .filter((s: any) => s.category === 'hijauan')
        .map((s: any) => s.name);
      return dbList.length > 0 ? dbList : ['Ilalang', 'Ketela Pohon', 'Napier Grass / Rumput Gajah', 'Odot', 'Rumput'];
    });

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

    const energyOptions = computed(() => getOptionsForFeeds(energyFeeds.value));
    const proteinOptions = computed(() => getOptionsForFeeds(proteinFeeds.value));
    const mineralOptions = computed(() => getOptionsForFeeds(mineralFeeds.value));
    const hijauanOptions = computed(() => getOptionsForFeeds(hijauanFeeds.value));

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

      const hasHijauan = !!hijauanFeed.value;

      if (hasHijauan) {
        // Silase Mix (10.4% BB total)
        if (hijauanFeed.value) {
          list.push({
            kategori: 'hijauan',
            jumlah_kg: weight * 0.0728,
            keterangan: `${hijauanFeed.value} (Hijauan, 70% Racikan)`
          });
        }
        if (energyFeed.value) {
          list.push({
            kategori: 'konsentrat',
            jumlah_kg: weight * 0.018,
            keterangan: `${energyFeed.value} (Sumber Energi, 17.3% Racikan)`
          });
        }
        if (proteinFeed.value) {
          list.push({
            kategori: 'konsentrat',
            jumlah_kg: weight * 0.0108,
            keterangan: `${proteinFeed.value} (Sumber Protein, 10.4% Racikan)`
          });
        }
        if (mineralFeed.value) {
          list.push({
            kategori: 'mineral',
            jumlah_kg: weight * 0.0024,
            keterangan: `${mineralFeed.value} (Mineral, 2.3% Racikan)`
          });
        }
      } else {
        // Full Concentrate (2.84% BB total: 2.5% BK / 0.88)
        if (energyFeed.value) {
          list.push({
            kategori: 'konsentrat',
            jumlah_kg: weight * (0.025 / 0.88) * (0.018 / 0.0312),
            keterangan: `${energyFeed.value} (Sumber Energi, 57.7% Konsentrat)`
          });
        }
        if (proteinFeed.value) {
          list.push({
            kategori: 'konsentrat',
            jumlah_kg: weight * (0.025 / 0.88) * (0.0108 / 0.0312),
            keterangan: `${proteinFeed.value} (Sumber Protein, 34.6% Konsentrat)`
          });
        }
        if (mineralFeed.value) {
          list.push({
            kategori: 'mineral',
            jumlah_kg: weight * (0.025 / 0.88) * (0.0024 / 0.0312),
            keterangan: `${mineralFeed.value} (Mineral, 7.7% Konsentrat)`
          });
        }
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

      // Fallback if sheep is marked Hamil but no active pregnancy log is loaded
      return {
        pregnancy_start_date: new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // mock 90 days ago
        status: 'Hamil'
      };
    });

    const activePregnancyDetails = computed(() => {
      const preg = activePregnancyInfo.value;
      if (!preg) return null;

      let start = new Date(preg.pregnancy_start_date || preg.created_at);
      if (isNaN(start.getTime()) || start.getFullYear() <= 1970) {
        start = new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago fallback
      }

      const hpl = new Date(start.getTime() + 150 * 24 * 60 * 60 * 1000);
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
      };
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

    const isUsingDefaultWeight = computed(() => {
      const w = f().mode === 'individu' ? selectedSheepWeightNumeric.value : selectedCageSheepWeightNumeric.value;
      return w <= 0;
    });

    const activeWeightForRec = computed(() => {
      const w = f().mode === 'individu' ? selectedSheepWeightNumeric.value : selectedCageSheepWeightNumeric.value;
      return w > 0 ? w : 25.0;
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
            f().qty = newFiltered > 0 ? newFiltered.toFixed(2) : '';
          } else if (method === 'silase') {
            f().qty = newBackend > 0 ? newBackend.toFixed(2) : '';
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
      if (raw === 'Gulma / Rumput Liar (Mentah)') return 'Silase Rumput Liar';
      return 'Pakan Rumput Cacah';
    });

    watch(targetSilageFeedName, (newVal) => {
      if (props.jenisId === 'stok_pakan' && f().name === 'Konversi Pakan') {
        const autoNames = ['Silase Daun Alpukat', 'Silase Daun Kelengkeng', 'Silase Rumput Liar', 'Pakan Rumput Cacah'];
        if (!f().obat || autoNames.includes(f().obat)) {
          f().obat = newVal;
        }
      }
    }, { immediate: true });

    // Auto silage selection under Pakan Silase / Stok method
    watch(
      () => f().metoda,
      (newMetoda) => {
        if (props.jenisId === 'pakan') {
          f().obat = '';
        }
      }
    );

    const selectedSilageDetails = computed(() => {
      if (props.jenisId !== 'pakan' || f().metoda !== 'silase' || !f().obat) {
        return null;
      }
      const targetName = f().obat.toLowerCase();
      const foundSub = (pencatatanSubmissions.value || []).find((sub: any) => {
        if (sub.type !== 'stok_pakan') return false;
        const items = sub.payload?.data?.items || [];
        return items.some((item: any) => 
          item.name === 'Konversi Pakan' && 
          item.obat && 
          item.obat.toLowerCase() === targetName
        );
      });

      if (!foundSub) return null;

      const conversionItem = (foundSub.payload as any).data?.items?.find((item: any) => 
        item.name === 'Konversi Pakan' && 
        item.obat && 
        item.obat.toLowerCase() === targetName
      );

      if (!conversionItem) return null;

      return {
        targetName: conversionItem.obat,
        hijauan: conversionItem.hijauan,
        energi: conversionItem.energi,
        protein: conversionItem.protein,
        mineral: conversionItem.mineral,
        totalQty: parseFloat(conversionItem.qty) || 0,
        submittedAt: foundSub.submittedAt
      };
    });

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
      if (cageCode === 'all') return;
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
      if (props.form.selectedCageCode) {
        selectedCageCode.value = props.form.selectedCageCode;
      } else if (cageSession.value?.code) {
        selectedCageCode.value = cageSession.value.code;
      } else {
        selectedCageCode.value = 'all';
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
    const maleSilsilah = ref<any>(null);
    const femaleSilsilah = ref<any>(null);
    const showCOIInfoModal = ref(false);
    let inbreedingTimeout: any = null;

    const selectedBaseSheepId = ref('');

    const baseSheepOptions = computed(() => {
      const activeCode = selectedCageCode.value;
      const formName = props.form.name || '';
      
      const list = sheep.value
        .filter(s => s.cage_code === activeCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status));
      
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
            .filter(s => {
              if (s.gender === 'betina') {
                return checkIsSheepBirahi(s) && !isMated(s);
              }
              return checkIsSheepBirahi(s);
            })
            .map(s => ({
              value: s.id,
              label: `${s.code} ${s.name}`
            }));
        }

        if (formName === 'Cek Birahi' || formName === 'Pencatatan Birahi' || formName === 'Pengecekan Birahi') {
          return list
            .filter(s => {
              if (s.status === 'Hamil') return false;
              // Domba tanpa berat badan belum bisa diperiksa birahi
              const weightVal = s.weight ? parseFloat(String(s.weight).replace(/[^0-9.]/g, '')) : 0;
              if (isNaN(weightVal) || weightVal <= 0) return false;
              return !checkIsSheepBirahi(s);
            })
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
          
          const startDate = foundPreg 
            ? new Date(foundPreg.pregnancy_start_date || foundPreg.created_at)
            : new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago fallback
            
          const hpl = new Date(startDate.getTime() + 150 * 24 * 60 * 60 * 1000);
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
            const item = pregnantCageSheepList.value.find(p => String(p.id) === String(s.id));
            const suffix = item ? ` (HPL: ${item.hpl} - ${item.countdownText})` : '';
            return {
              value: s.code,
              label: `[${s.code}] ${s.name}${suffix}`
            };
          }
          const cageLabel = activeCode === 'all' ? ` (Kandang: ${s.cage_code})` : '';
          return {
            value: s.code,
            label: `${s.code} ${s.name}${cageLabel}`
          };
        });
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
      if (props.form.name === 'Cek Birahi' || props.form.name === 'Pencatatan Birahi' || props.form.name === 'Pengecekan Birahi') {
        props.form.targetId = s.id;
        props.form.idPejantan = s.gender === 'jantan' ? s.id : '';
      } else {
        if (s.gender === 'betina') {
          props.form.targetId = s.id;
          props.form.idPejantan = '';
        } else {
          props.form.idPejantan = s.id;
          props.form.targetId = '';
        }
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
          .filter(s => s.gender === 'jantan' && s.cage_code !== activeCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status) && checkIsSheepBirahi(s))
          .map(s => ({
            value: s.id,
            label: `${s.code} ${s.name}`
          }));
      } else {
        return sheep.value
          .filter(s => s.gender === 'betina' && s.cage_code !== activeCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status) && checkIsSheepBirahi(s))
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

    function getSheepWeight(sheepInput: any) {
      if (!sheepInput) return '—';
      const sheepId = typeof sheepInput === 'object' ? sheepInput.id : sheepInput;
      const sObj = typeof sheepInput === 'object' ? sheepInput : sheep.value.find(x => String(x.id) === String(sheepId));
      
      const records = weightRecords.value.filter(w => String(w.sheep_id) === String(sheepId));
      if (records.length === 0) return sObj?.weight || '—';
      const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sorted[0];
      return latest ? `${latest.weight} kg` : (sObj?.weight || '—');
    }

    const getBirahiStatus = (s: any) => {
      if (!s) return '—';

      // Find the latest Cek/Pencatatan Birahi checkup for this sheep (either gender)
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

      // Male sheep (Pejantan) defaults
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
        // Check weight if available
        const weightStr = getSheepWeight(s);
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

      // Female sheep (Indukan) defaults
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

    const checkIsSheepBirahi = (s: any) => {
      const localStatus = getBirahiStatus(s);
      if (localStatus === 'Ya (Siap Kawin / Birahi)') return true;
      if (localStatus === 'Tidak Birahi' || localStatus === 'Belum Pencatatan Birahi') return false;
      return !!s.is_ready_to_mate;
    };

    watch(activePregnancyInfo, (newPreg) => {
      if (props.jenisId === 'kelahiran' && newPreg) {
        const fatherSheep = sheep.value.find(s => String(s.id) === String(newPreg.id_father) || String(s.code) === String(newPreg.id_father));
        const fatherCode = fatherSheep ? fatherSheep.code : (newPreg.id_father || '');
        if (fatherCode) {
          f().idPejantan = fatherCode;
        }
      }
    }, { immediate: true });

    const isSelectedCageFull = computed(() => {
      const selectedCode = f().kandangAnak;
      if (!selectedCode) return false;
      const cage = cagesList.value.find(c => c.code === selectedCode);
      const capacity = cage?.capacity || 50;
      
      const currentSheepCount = sheep.value.filter(s => s.cage_code === selectedCode && !['Mati', 'Terjual', 'Disembelih'].includes(s.status)).length;
      return currentSheepCount >= capacity;
    });

    const isSameParentError = computed(() => {
      if (props.jenisId !== 'kelahiran') return false;
      const motherClean = String(f().targetId || '').trim().toUpperCase();
      const fatherClean = String(f().idPejantan || '').trim().toUpperCase();
      if (!motherClean || !fatherClean) return false;
      if (motherClean === fatherClean) return true;

      const motherSheep = sheep.value.find(s => s.code.toUpperCase() === motherClean || String(s.id) === motherClean);
      const fatherSheep = sheep.value.find(s => s.code.toUpperCase() === fatherClean || String(s.id) === fatherClean);
      return !!(motherSheep && fatherSheep && motherSheep.id === fatherSheep.id);
    });

    watch([() => props.form.targetId, () => props.form.idPejantan], ([id1Str, id2Str]) => {
      if (props.jenisId !== 'perkawinan') return;
      if (!id1Str || !id2Str) {
        inbreedingResult.value = null;
        maleSilsilah.value = null;
        femaleSilsilah.value = null;
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
                text: 'Peringatan Kritis: Kedua domba tidak memiliki silsilah terdaftar di database! Harap teliti silsilah secara manual sebelum mengawinkan untuk mencegah risiko inbreeding.',
                warningType: 'critical_empty'
              };
            } else if (maleHasNoParents || femaleHasNoParents) {
              inbreedingResult.value = {
                safe: true,
                text: 'Peringatan: Salah satu domba tidak memiliki silsilah lengkap di database (kemungkinan dibeli dari luar). Penelusuran inbreeding tidak dapat dilakukan secara maksimal.',
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

    const renderCompactTree = (node: any, level = 0, maxDepth = 3): any => {
      if (!node || (!node.id_sheep && !node.sheep_code) || level >= maxDepth) return null;

      const isRoot = level === 0;
      const genderSymbol = node.gender === 'jantan' ? '♂️' : (node.gender === 'betina' ? '♀️' : '🐑');
      const relationLabel = isRoot 
        ? '' 
        : (node.gender === 'jantan' ? 'Bapak' : 'Ibu');

      return (
        <div class="position-relative mt-2 text-start" style={{ fontSize: '0.85rem' }}>
          <div class="d-inline-flex align-items-center gap-2 py-1.5 px-3 rounded-3 bg-white border shadow-sm" style={{ borderColor: '#e2e8f0' }}>
            <span style={{ fontSize: '0.95rem' }}>{genderSymbol}</span>
            {relationLabel && <span class="text-secondary fw-semibold small me-1">{relationLabel}:</span>}
            <span class="fw-bold text-dark">{node.sheep_code || '—'}</span>
            {node.sheep_name && (
              <span class="text-muted text-truncate ms-1" style={{ maxWidth: '120px' }} title={node.sheep_name}>
                ({node.sheep_name})
              </span>
            )}
          </div>

          {((node.father && (node.father.id_sheep || node.father.sheep_code)) || (node.mother && (node.mother.id_sheep || node.mother.sheep_code))) && (
            <div 
              class="ms-3 border-start ps-3 mt-1 position-relative" 
              style={{ 
                borderColor: '#cbd5e1',
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

    const isModeToggleDisabled = computed(() => {
      return ['kotoran', 'berat_badan', 'perkawinan', 'kelahiran'].includes(props.jenisId);
    });

    const isMatingNoCage = computed(() => {
      const formName = props.form.name || '';
      return formName === 'IB' || formName === 'Inseminasi Buatan' || formName === 'Kawin Alam' || formName === 'Kawin Alami';
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
                            <span class="fw-extrabold">
                              {activePregnancyDetails.value.startDateFormatted}
                            </span>
                          </div>
                          <div class="col-6">
                            <span class="small d-block opacity-75">Perkiraan Kelahiran (HPL)</span>
                            <span class="fw-extrabold">
                              {activePregnancyDetails.value.hplDateFormatted}
                            </span>
                          </div>
                          <div class="col-12 mt-2 border-top pt-2" style={{ borderColor: 'rgba(61, 47, 36, 0.15)' }}>
                            <span class="small d-block opacity-75">Pejantan Terkait (Bapak)</span>
                            <span class="fw-extrabold">
                              {activePregnancyDetails.value.fatherText}
                            </span>
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
                    label={f().metoda === 'ib' || props.form.name === 'Kontrol Kebuntingan' || props.form.name === 'IB' || props.form.name === 'Inseminasi Buatan' || props.form.name === 'Kawin Alam' || props.form.name === 'Kawin Alami' ? 'ID Domba Betina' : 'ID Domba'}
                    colClass="col-12"
                    required
                  >
                    <PencatatanSelect
                      modelValue={selectedBaseSheepId.value}
                      options={baseSheepOptions.value}
                      placeholder={selectedCageCode.value ? (f().metoda === 'ib' || props.form.name === 'Kontrol Kebuntingan' || props.form.name === 'IB' || props.form.name === 'Inseminasi Buatan' || props.form.name === 'Kawin Alam' || props.form.name === 'Kawin Alami' ? 'Pilih Domba Betina' : 'Pilih ID Domba') : 'Pilih Kandang Terlebih Dahulu'}
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
                    <span class={['fw-bold', (getBirahiStatus(selectedBaseSheep.value).startsWith('Ya') || getBirahiStatus(selectedBaseSheep.value).includes('Siap') || getBirahiStatus(selectedBaseSheep.value).includes('Birahi')) ? 'text-success' : 'text-danger']}>
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
                  {props.form.name === 'Kontrol Kebuntingan' && (
                    <>
                      <div class="col-12 border-top pt-2 mt-2">
                        <span class="text-muted small d-block">Pasangan Perkawinan (Pejantan)</span>
                        <span class="fw-bold text-primary">
                          {(() => {
                            const mating = activeMatings.value.find(m => String(m.id_mating) === String(props.form.idMating));
                            if (!mating) return 'Silakan pilih perkawinan di bawah';
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

          {props.jenisId === 'perkawinan' && props.form.name !== 'Cek Birahi' && props.form.name !== 'Pencatatan Birahi' && props.form.name !== 'Pengecekan Birahi' && props.form.name !== 'Kontrol Kebuntingan' && f().mode === 'individu' && selectedBaseSheep.value && (() => {
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

          {props.jenisId === 'perkawinan' && props.form.name !== 'Cek Birahi' && props.form.name !== 'Pencatatan Birahi' && props.form.name !== 'Pengecekan Birahi' && f().mode === 'individu' && selectedPartnerSheep.value && (
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
                    <span class={['fw-bold', (getBirahiStatus(selectedPartnerSheep.value).startsWith('Ya') || getBirahiStatus(selectedPartnerSheep.value).includes('Siap') || getBirahiStatus(selectedPartnerSheep.value).includes('Birahi')) ? 'text-success' : 'text-danger']}>
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
                <div class="d-flex flex-wrap gap-4 mt-2">
                  <label class="d-flex align-items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="dadakan"
                      name={`feedMethod-${f().id}`}
                      checked={f().metoda === 'dadakan'}
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
                  <label class="d-flex align-items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="hijauan_kebun"
                      name={`feedMethod-${f().id}`}
                      checked={f().metoda === 'hijauan_kebun'}
                      onChange={() => { f().metoda = 'hijauan_kebun'; }}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-800)' }}>Pakan Hijauan (Mentah Kebun)</span>
                  </label>
                </div>
              </PencatatanField>

              {f().metoda === 'dadakan' && (
                <>
                  <PencatatanField label="Hijauan (Opsional)" colClass="col-12">
                    <PencatatanSelect
                      modelValue={hijauanFeed.value}
                      options={hijauanOptions.value}
                      placeholder="Pilih Hijauan"
                      onUpdateModelValue={(v: string) => { hijauanFeed.value = v; }}
                    />
                  </PencatatanField>
                  <PencatatanField label="Sumber Energi" colClass="col-12">
                    <PencatatanSelect
                      modelValue={energyFeed.value}
                      options={energyOptions.value}
                      placeholder="Pilih Sumber Energi"
                      onUpdateModelValue={(v: string) => { energyFeed.value = v; }}
                    />
                  </PencatatanField>
                  <PencatatanField label="Sumber Protein" colClass="col-12">
                    <PencatatanSelect
                      modelValue={proteinFeed.value}
                      options={proteinOptions.value}
                      placeholder="Pilih Sumber Protein"
                      onUpdateModelValue={(v: string) => { proteinFeed.value = v; }}
                    />
                  </PencatatanField>
                  <PencatatanField label="Pemberian Mineral" colClass="col-12">
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
              )}

              {f().metoda === 'silase' && (
                <>
                  <PencatatanField label="Pilih Pakan Silase / Stok" colClass="col-12" required>
                    <PencatatanSelect
                      modelValue={f().obat}
                      options={feedStockOptions.value.filter((o: any) => {
                        const nameLower = o.value.toLowerCase();
                        const isSilaseOrCacah = nameLower.includes('silase') || nameLower.includes('cacah') || nameLower === 'pakan silase';
                        const stockItem = stocks.value.find(s => s.name === o.value);
                        const isSilaseCategory = stockItem && stockItem.category === 'silase';
                        return isSilaseOrCacah || isSilaseCategory;
                      })}
                      placeholder="Pilih Pakan Silase / Stok"
                      onUpdateModelValue={(v: string) => { f().obat = v; }}
                    />
                  </PencatatanField>

                  {selectedSilageDetails.value && (
                    <div class="col-12 animate-fade-in mb-3 text-start">
                      <div class="card bg-info bg-opacity-10 border-0 rounded-4 p-3" style={{ borderLeft: '4px solid #0dcaf0' }}>
                        <div class="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>
                          ℹ️ Komposisi Penyusun Silase ({selectedSilageDetails.value.targetName})
                        </div>
                        <div class="row g-2" style={{ fontSize: '0.85rem' }}>
                          <div class="col-12">
                            <span class="text-muted d-block small">Pakan Mentah Asal:</span>
                            <span class="fw-bold text-dark">🌿 {selectedSilageDetails.value.hijauan} (70.0%)</span>
                          </div>
                          <div class="col-6">
                            <span class="text-muted d-block small">Sumber Energi:</span>
                            <span class="fw-bold text-dark">🌾 {selectedSilageDetails.value.energi} (17.3%)</span>
                          </div>
                          <div class="col-6">
                            <span class="text-muted d-block small">Sumber Protein:</span>
                            <span class="fw-bold text-dark">🫘 {selectedSilageDetails.value.protein} (10.4%)</span>
                          </div>
                          <div class="col-12 border-top pt-2 mt-2">
                            <span class="text-muted d-block small">Pemberian Mineral:</span>
                            <span class="fw-bold text-dark">🧂 {selectedSilageDetails.value.mineral} (2.3%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeWeightForRec.value > 0 && (
                    <div class="col-12 animate-fade-in mb-3">
                      <div class="card bg-light border-0 rounded-4 p-3 text-start">
                        <div class="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                          📋 Rekomendasi Pakan (Berdasarkan Bobot: {activeWeightForRec.value.toFixed(1)} kg {isUsingDefaultWeight.value ? '(Standar Default)' : ''})
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

              {f().metoda === 'hijauan_kebun' && (
                <>
                  <PencatatanField label="Pilih Pakan Hijauan (Mentah Kebun)" colClass="col-12" required>
                    <PencatatanSelect
                      modelValue={f().obat}
                      options={feedStockOptions.value.filter((o: any) => {
                        const nameLower = o.value.toLowerCase();
                        const isMentah = nameLower.includes('mentah') || nameLower.includes('pemangkasan') || nameLower.includes('kebun');
                        const stockItem = stocks.value.find(s => s.name === o.value);
                        const isGreenery = stockItem && stockItem.category === 'greenery';
                        return isMentah || isGreenery;
                      })}
                      placeholder="Pilih Pakan Hijauan"
                      onUpdateModelValue={(v: string) => { f().obat = v; }}
                    />
                  </PencatatanField>

                  {activeWeightForRec.value > 0 && (
                    <div class="col-12 animate-fade-in mb-3">
                      <div class="card bg-light border-0 rounded-4 p-3 text-start">
                        <div class="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                          📋 Rekomendasi Pakan (Berdasarkan Bobot: {activeWeightForRec.value.toFixed(1)} kg {isUsingDefaultWeight.value ? '(Standar Default)' : ''})
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

                  <PencatatanField label="Hasil Konversi Jadi" colClass="col-12" required>
                    <PencatatanInput
                      modelValue={f().obat}
                      placeholder="Masukkan nama hasil konversi pakan..."
                      onUpdateModelValue={(v: string) => { f().obat = v; }}
                    />
                  </PencatatanField>
                </>
              )}
            </>
          )}

          {props.jenisId === 'kesehatan' && (
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
          )}

          {props.jenisId === 'kotoran' && (
            <>
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
                  options={metadataEnums.value.manure_conditions}
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
                                
                                {/* Lineage Trees Side-by-Side */}
                                {(!inbreedingResult.value.error && (maleSilsilah.value || femaleSilsilah.value)) && (
                                  <div class="row mt-3 g-3">
                                    <div class="col-md-6">
                                      <div class="p-3 rounded-4 h-100 bg-white bg-opacity-70 border border-white-30" style={{ backdropFilter: 'blur(4px)' }}>
                                        <div class="fw-bold mb-2 text-dark d-flex align-items-center gap-1" style={{ fontSize: '0.85rem' }}>
                                          <span>♂️ Silsilah Pejantan</span>
                                        </div>
                                        {maleSilsilah.value?.silsilah ? renderCompactTree(maleSilsilah.value.silsilah) : (maleSilsilah.value ? renderCompactTree(maleSilsilah.value) : <span class="text-muted">Tidak ada data silsilah.</span>)}
                                      </div>
                                    </div>
                                    <div class="col-md-6">
                                      <div class="p-3 rounded-4 h-100 bg-white bg-opacity-70 border border-white-30" style={{ backdropFilter: 'blur(4px)' }}>
                                        <div class="fw-bold mb-2 text-dark d-flex align-items-center gap-1" style={{ fontSize: '0.85rem' }}>
                                          <span>♀️ Silsilah Indukan</span>
                                        </div>
                                        {femaleSilsilah.value?.silsilah ? renderCompactTree(femaleSilsilah.value.silsilah) : (femaleSilsilah.value ? renderCompactTree(femaleSilsilah.value) : <span class="text-muted">Tidak ada data silsilah.</span>)}
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
            </>
          )}

          {props.jenisId === 'kelahiran' && props.form.name === 'Keguguran' && (
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
          )}

          {props.jenisId === 'kelahiran' && props.form.name !== 'Keguguran' && (
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
                  options={metadataEnums.value.dam_conditions}
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

        {/* COI Details Pop-up Modal */}
        {showCOIInfoModal.value && (
          <div class="peternakan-modal-overlay animate-fade-in" style={{ zIndex: 1100 }} onClick={() => { showCOIInfoModal.value = false; }}>
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
                        <td class="text-center fw-semibold text-info-emphasis">6,25%</td>
                        <td class="text-center">
                          <span class="badge bg-warning text-warning-emphasis bg-opacity-10 border border-warning-subtle px-2 py-1" style={{ fontSize: '0.7rem' }}>Ambang Batas</span>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-center text-muted">5</td>
                        <td>Sepupu pertama sekali lepas (<em>first cousin once removed</em>)</td>
                        <td class="text-center fw-semibold text-success-emphasis">3,13%</td>
                        <td class="text-center">
                          <span class="badge bg-info text-info bg-opacity-10 border border-info-subtle px-2 py-1" style={{ fontSize: '0.7rem' }}>Rendah</span>
                        </td>
                      </tr>
                      <tr>
                        <td class="text-center text-muted">6</td>
                        <td>Sepupu kedua (<em>second cousin</em>)</td>
                        <td class="text-center fw-semibold text-muted">1,56%</td>
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
        )}
      </>
    );
  },
});
