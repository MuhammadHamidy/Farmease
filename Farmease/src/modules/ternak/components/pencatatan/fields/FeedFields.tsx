import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import PencatatanField from '../PencatatanField';
import PencatatanInput from '../PencatatanInput';
import PencatatanSelect from '../PencatatanSelect';
import { stocks } from '@/modules/ternak/store/peternakan';
import { sheep, weightRecords } from '@/store/livestock';
import { feedsApi, pemangkasanApi } from '@/shared/api';
import { pencatatanSubmissions } from '@/store/operatorAdmin';
import type { PencatatanFormItem } from '../PencatatanTypeFields';

export default defineComponent({
  name: 'FeedFields',
  props: {
    form: { type: Object as PropType<PencatatanFormItem>, required: true },
  },
  setup(props) {
    const f = () => props.form;

    const pruningOptions = ref<any[]>([]);
    const backendRecommendations = ref<any[]>([]);
    const backendTotalFreshWeight = ref<number>(0);

    onMounted(async () => {
      try {
        const res = await pemangkasanApi.getList();
        pruningOptions.value = (() => {
          // Deduplikasi berdasarkan nama — jumlahkan kuantitas jika nama sama
          const grouped: Record<string, { jumlah: number; satuan: string }> = {};
          (res || []).filter((p: any) => Number(p.jumlah) > 0).forEach((p: any) => {
            const rawName = (p.nama_rincian_aktivitas || 'Daun').trim();
            // Hapus kata 'Pemangkasan' di awal jika sudah ada agar tidak double
            const cleanName = rawName.replace(/^Pemangkasan\s+/i, '');
            const key = cleanName.toLowerCase();
            if (!grouped[key]) {
              grouped[key] = { jumlah: 0, satuan: p.satuan || 'kg' };
            }
            grouped[key].jumlah += Number(p.jumlah);
          });
          return Object.entries(grouped).map(([, item], idx) => {
            const allEntries = (res || []).filter((p: any) => {
              const rawName = (p.nama_rincian_aktivitas || 'Daun').trim();
              const cleanName = rawName.replace(/^Pemangkasan\s+/i, '');
              return cleanName.toLowerCase() === Object.keys(grouped)[idx];
            });
            const displayName = allEntries.length > 0
              ? (allEntries[0]?.nama_rincian_aktivitas || 'Daun').trim().replace(/^Pemangkasan\s+/i, '')
              : Object.keys(grouped)[idx];
            return {
              value: `Pemangkasan ${displayName}`,
              label: `Pemangkasan ${displayName}`,
              qty: item.jumlah,
              unit: item.satuan
            };
          });
        })();
      } catch (e) {
        console.error('Failed to load pruning in FeedFields', e);
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
      return dbList.length > 0 ? dbList : ['Ampas Tahu', 'Bungkil Kacang Tanah', 'Bungkil kelapa Sawit'];
    });

    const mineralFeeds = computed(() => {
      const dbList = stocks.value
        .filter((s: any) => s.category === 'vitamin' && (s.notes || '').toLowerCase().includes('mineral'))
        .map((s: any) => s.name);
      return dbList.length > 0 ? dbList : ['Garam Mineral Dirijen', 'Mineral Blok'];
    });

    const hijauanFeeds = computed(() => {
      const dbList = stocks.value
        .filter((s: any) => s.category === 'hijauan')
        .map((s: any) => s.name);
      return dbList.length > 0 ? dbList : [
        'Ilalang',
        'Ketela Pohon / Singkong',
        'Odot',
        'Rumput Gajah / Napier',
        'Rumput Lapangan'
      ];
    });

    const getOptionsForFeeds = (names: string[]) => {
      return names.map(name => ({
        value: name,
        label: name
      }));
    };

    const energyOptions = computed(() => getOptionsForFeeds(energyFeeds.value));
    const proteinOptions = computed(() => getOptionsForFeeds(proteinFeeds.value));
    const mineralOptions = computed(() => getOptionsForFeeds(mineralFeeds.value));
    const hijauanOptions = computed(() => getOptionsForFeeds(hijauanFeeds.value));

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

    const selectedNonMatingSheep = computed(() => {
      if (f().mode !== 'individu') return null;
      return sheep.value.find(s => s.code === f().targetId || String(s.id) === String(f().targetId)) || null;
    });

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

    const selectedSheepWeightNumeric = computed(() => {
      const s = selectedNonMatingSheep.value;
      if (!s) return 0;
      const wStr = getSheepWeight(s.id);
      const match = wStr.match(/([0-9.]+)/);
      return match ? parseFloat(match[1] || '0') : 0;
    });

    const selectedCageSheepWeightNumeric = computed(() => {
      if (f().mode !== 'kelompok' || !f().targetId) return 0;
      const cageSheep = sheep.value.filter(s => s.cage_code === f().targetId && !['Mati', 'Terjual', 'Disembelih'].includes(s.status));
      return cageSheep.reduce((sum, s) => {
        const wStr = getSheepWeight(s.id);
        const match = wStr.match(/([0-9.]+)/);
        return sum + (match ? parseFloat(match[1] || '0') : 0);
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

    const recommendedTotal = computed(() => {
      const factor = f().name === 'Pemberian Mineral' ? 0.0024 : 0.104;
      return (activeWeightForRec.value * factor).toFixed(2);
    });

    const toggleEnergySource = (feedName: string) => {
      const current = (f().energi || '').split(',').map(s => s.trim()).filter(Boolean);
      const idx = current.indexOf(feedName);
      if (idx > -1) {
        current.splice(idx, 1);
      } else {
        current.push(feedName);
      }
      f().energi = current.join(', ');
    };

    const isEnergySourceSelected = (feedName: string) => {
      const current = (f().energi || '').split(',').map(s => s.trim()).filter(Boolean);
      return current.includes(feedName);
    };

    const toggleProteinSource = (feedName: string) => {
      const current = (f().protein || '').split(',').map(s => s.trim()).filter(Boolean);
      const idx = current.indexOf(feedName);
      if (idx > -1) {
        current.splice(idx, 1);
      } else {
        current.push(feedName);
      }
      f().protein = current.join(', ');
    };

    const isProteinSourceSelected = (feedName: string) => {
      const current = (f().protein || '').split(',').map(s => s.trim()).filter(Boolean);
      return current.includes(feedName);
    };

    const filteredRecommendations = computed(() => {
      const list: any[] = [];
      const weight = activeWeightForRec.value;
      if (weight <= 0) return list;

      if (f().name === 'Pemberian Mineral') {
        if (mineralFeed.value) {
          list.push({
            kategori: 'mineral',
            jumlah_kg: weight * 0.0024,
            keterangan: `${mineralFeed.value} (Mineral, Dosis Harian)`
          });
        }
      } else {
        if (f().metoda === 'dadakan') {
          const selectedEnergy = (f().energi || '').split(',').map(s => s.trim()).filter(Boolean);
          const selectedProtein = (f().protein || '').split(',').map(s => s.trim()).filter(Boolean);

          if (selectedEnergy.length > 0) {
            const energyAmtPerSource = (weight * 0.018) / selectedEnergy.length;
            selectedEnergy.forEach((feedName: string) => {
              let info = '';
              if (feedName === 'Bekatul') info = 'BK 87.0% | PK 12.0%';
              else if (feedName === 'Onggok') info = 'BK 87.0% | PK 5.0%';
              else if (feedName === 'Jagung') info = 'BK 86.0% | PK 13.6%';

              list.push({
                kategori: 'konsentrat (energi)',
                jumlah_kg: energyAmtPerSource,
                keterangan: `${feedName} (${info || 'Energi'})`
              });
            });
          }

          if (selectedProtein.length > 0) {
            const proteinAmtPerSource = (weight * 0.0108) / selectedProtein.length;
            selectedProtein.forEach((feedName: string) => {
              let info = '';
              if (feedName === 'Ampas Tahu') info = 'BK 10.8% | PK 25.7%';
              else if (feedName === 'Bungkil kelapa Sawit') info = 'BK 92.5% | PK 24.0%';
              else if (feedName === 'Bungkil Kacang Tanah') info = 'BK 91.4% | PK 56.3%';

              list.push({
                kategori: 'konsentrat (protein)',
                jumlah_kg: proteinAmtPerSource,
                keterangan: `${feedName} (${info || 'Protein'})`
              });
            });
          }
        } else if (f().metoda === 'silase') {
          if (f().obat) {
            list.push({
              kategori: 'silase',
              jumlah_kg: weight * 0.104,
              keterangan: `${f().obat} (Rekomendasi Pakan Silase Harian)`
            });
          }
        } else if (f().metoda === 'hijauan_kebun') {
          if (f().obat) {
            list.push({
              kategori: 'hijauan',
              jumlah_kg: weight * 0.104,
              keterangan: `${f().obat} (Rekomendasi Hijauan Harian)`
            });
          }
        }
      }
      return list;
    });

    const filteredTotalWeight = computed(() => {
      return filteredRecommendations.value.reduce((sum, item) => sum + (item.jumlah_kg || item.JumlahKg || 0), 0);
    });

    const selectedSilageDetails = computed(() => {
      if (f().metoda !== 'silase' || !f().obat) {
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

    const getStockForFeed = (name: string) => {
      if (!name) return { qty: 0, text: 'Belum dipilih', isZero: true };
      // Cek stok di database logistics.feeds dulu
      const item = stocks.value.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (item) return { qty: item.qty, text: `Stok: ${item.qty.toFixed(1)} ${item.unit || 'kg'}`, isZero: item.qty <= 0 };
      // Fallback: cek apakah bahan berasal dari hasil kebun (pruningOptions)
      const pruningItem = pruningOptions.value.find(
        (p: any) => (p.value || '').toLowerCase() === name.toLowerCase()
      );
      if (pruningItem) {
        const qtyNum = Number(pruningItem.qty || 0);
        return { qty: qtyNum, text: `Stok Kebun: ${qtyNum.toFixed(1)} ${pruningItem.unit || 'kg'}`, isZero: qtyNum <= 0 };
      }
      return { qty: 0, text: 'Stok: 0 kg', isZero: true };
    };

    watch(
      [filteredTotalWeight, backendTotalFreshWeight, () => f().metoda, () => f().name],
      ([newFiltered, newBackend, method, name]) => {
        if (name === 'Pemberian Mineral') {
          f().qty = newFiltered > 0 ? newFiltered.toFixed(2) : '';
        } else if (method === 'dadakan') {
          f().qty = newFiltered > 0 ? newFiltered.toFixed(2) : '';
        } else if (method === 'silase') {
          f().qty = newBackend > 0 ? newBackend.toFixed(2) : '';
        }
      },
      { immediate: true }
    );

    watch(
      () => f().targetId,
      async (newTarget) => {
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
      },
      { immediate: true }
    );

    return () => (
      <>
        {f().name === 'Pemberian Mineral' ? (
          <>
            <PencatatanField label="Pilih Mineral" colClass="col-12" required>
              <PencatatanSelect
                modelValue={mineralFeed.value}
                options={mineralOptions.value}
                placeholder="Pilih Mineral"
                onUpdateModelValue={(v: string) => { mineralFeed.value = v; }}
              />
            </PencatatanField>

            {activeWeightForRec.value > 0 && (
              <div class="col-12 animate-fade-in mb-3">
                <div class="card bg-light border-0 rounded-4 p-3 text-start">
                  <div class="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>
                    📋 Rekomendasi Mineral (Berdasarkan Bobot: {activeWeightForRec.value.toFixed(1)} kg)
                  </div>
                  {filteredRecommendations.value.length > 0 ? (
                    <div class="row g-2" style={{ fontSize: '0.85rem' }}>
                      {filteredRecommendations.value.map((item: any) => (
                        <div class="col-12 border-bottom pb-2 mb-2" key={item.keterangan || item.Keterangan}>
                          <span class="text-muted d-block text-capitalize fw-bold">{item.kategori || item.Kategori}:</span>
                          <span class="fw-bold text-primary">{(item.jumlah_kg || item.JumlahKg || 0).toFixed(3)} kg</span>
                          <span class="text-secondary small ms-2">({item.keterangan || item.Keterangan})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div class="text-muted small">Pilih mineral di dropdown di atas untuk melihat rekomendasi.</div>
                  )}
                </div>
              </div>
            )}

            <PencatatanField label="Jumlah Mineral" colClass="col-12" required>
              <PencatatanInput
                type="number"
                modelValue={f().qty}
                placeholder="Masukkan berat mineral (kg)"
                onUpdateModelValue={(v: string) => { f().qty = v; }}
              />
            </PencatatanField>
          </>
        ) : (
          <>
            <PencatatanField label="Metode Pemberian Pakan" colClass="col-12" required>
              <div class="d-flex flex-wrap gap-4 mt-2">
                <label class="d-flex align-items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="dadakan"
                    name={`feedMethod-${f().id}`}
                    checked={f().metoda === 'dadakan'}
                    style={{ accentColor: 'var(--color-primary)', width: '1.2rem', height: '1.2rem' }}
                    onChange={() => { f().metoda = 'dadakan'; }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-900)', fontWeight: f().metoda === 'dadakan' ? '600' : '400' }}>Pakan Dadakan (Racikan Sendiri)</span>
                </label>
                <label class="d-flex align-items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="silase"
                    name={`feedMethod-${f().id}`}
                    checked={f().metoda === 'silase'}
                    style={{ accentColor: 'var(--color-primary)', width: '1.2rem', height: '1.2rem' }}
                    onChange={() => { f().metoda = 'silase'; }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-900)', fontWeight: f().metoda === 'silase' ? '600' : '400' }}>Pakan Silase / Stok</span>
                </label>
                <label class="d-flex align-items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="hijauan_kebun"
                    name={`feedMethod-${f().id}`}
                    checked={f().metoda === 'hijauan_kebun'}
                    style={{ accentColor: 'var(--color-primary)', width: '1.2rem', height: '1.2rem' }}
                    onChange={() => { f().metoda = 'hijauan_kebun'; }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-900)', fontWeight: f().metoda === 'hijauan_kebun' ? '600' : '400' }}>Pakan Hijauan (Mentah Kebun)</span>
                </label>
              </div>
            </PencatatanField>

            {f().metoda === 'dadakan' && (
              <>
                <PencatatanField label="Sumber Energi (Bisa centang lebih dari 1)" colClass="col-12" required>
                  <div class="d-flex flex-column gap-2 mt-2">
                    {energyOptions.value.map((opt: any) => {
                      const isActive = isEnergySourceSelected(opt.value);
                      let nutStr = '';
                      if (opt.value === 'Bekatul') nutStr = 'BK 87.0%, PK 12.0%';
                      else if (opt.value === 'Onggok') nutStr = 'BK 87.0%, PK 5.0%';
                      else if (opt.value === 'Jagung') nutStr = 'BK 86.0%, PK 13.6%';
                      
                      return (
                        <label 
                          class={[
                            'd-flex align-items-center gap-3 cursor-pointer border p-3 rounded-4 shadow-sm transition-all',
                            isActive ? 'bg-light fw-bold' : 'bg-white'
                          ]}
                          style={isActive ? { borderColor: 'var(--color-primary)', borderWidth: '2px' } : { borderColor: 'var(--ui-border)' }}
                          key={opt.value}
                        >
                          <input
                            type="checkbox"
                            value={opt.value}
                            checked={isActive}
                            style={{ accentColor: 'var(--color-primary)', width: '1.2rem', height: '1.2rem' }}
                            onChange={() => toggleEnergySource(opt.value)}
                          />
                          <div class="d-flex justify-content-between align-items-center w-100">
                            <span style={{ fontSize: '0.95rem', color: 'var(--color-gray-900)' }}>
                              {opt.label}
                            </span>
                            <span class="text-secondary small fw-normal">
                              ({nutStr})
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </PencatatanField>

                <PencatatanField label="Sumber Protein (Bisa centang lebih dari 1)" colClass="col-12" required>
                  <div class="d-flex flex-column gap-2 mt-2">
                    {proteinOptions.value.map((opt: any) => {
                      const isActive = isProteinSourceSelected(opt.value);
                      let nutStr = '';
                      if (opt.value === 'Ampas Tahu') nutStr = 'BK 10.8%, PK 25.7%';
                      else if (opt.value === 'Bungkil kelapa Sawit') nutStr = 'BK 92.5%, PK 24.0%';
                      else if (opt.value === 'Bungkil Kacang Tanah') nutStr = 'BK 91.4%, PK 56.3%';
                      
                      return (
                        <label 
                          class={[
                            'd-flex align-items-center gap-3 cursor-pointer border p-3 rounded-4 shadow-sm transition-all',
                            isActive ? 'bg-light fw-bold' : 'bg-white'
                          ]}
                          style={isActive ? { borderColor: 'var(--color-primary)', borderWidth: '2px' } : { borderColor: 'var(--ui-border)' }}
                          key={opt.value}
                        >
                          <input
                            type="checkbox"
                            value={opt.value}
                            checked={isActive}
                            style={{ accentColor: 'var(--color-primary)', width: '1.2rem', height: '1.2rem' }}
                            onChange={() => toggleProteinSource(opt.value)}
                          />
                          <div class="d-flex justify-content-between align-items-center w-100">
                            <span style={{ fontSize: '0.95rem', color: 'var(--color-gray-900)' }}>
                              {opt.label}
                            </span>
                            <span class="text-secondary small fw-normal">
                              ({nutStr})
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
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
                  const isHijauan = stockItem && stockItem.category === 'hijauan';
                  return isMentah || isGreenery || isHijauan;
                })}
                placeholder="Pilih Pakan Hijauan (Mentah Kebun)"
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
    );
  }
});
