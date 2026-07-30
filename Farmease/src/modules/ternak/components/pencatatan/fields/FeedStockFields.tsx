import { defineComponent, computed, ref, onMounted } from 'vue';
import type { PropType } from 'vue';
import PencatatanField from '../PencatatanField';
import PencatatanInput from '../PencatatanInput';
import PencatatanSelect from '../PencatatanSelect';
import { stocks, fetchStocks } from '@/modules/ternak/store/peternakan';
import { pemangkasanApi } from '@/shared/api';
import type { PencatatanFormItem } from '../PencatatanTypeFields';

export default defineComponent({
  name: 'FeedStockFields',
  props: {
    form: { type: Object as PropType<PencatatanFormItem>, required: true },
  },
  setup(props) {
    const form = () => props.form;
    const isKonversi = computed(() => props.form.name === 'Konversi Pakan');

    const pruningOptions = ref<any[]>([]);
    
    // Toggle manual text input field for registering brand new feeds
    const isCustomFeed = ref(false);

    // Validate that the custom typed feed name is not already registered in the master list
    const isDuplicateFeedName = computed(() => {
      if (!isCustomFeed.value || !form().obat) return false;
      const typedName = (form().obat || '').trim().toLowerCase();
      return stocks.value.some(stock => (stock.name || '').trim().toLowerCase() === typedName);
    });

    onMounted(async () => {
      fetchStocks().catch(error => console.error('Failed to fetch stocks in FeedStockFields', error));
      try {
        const response = await pemangkasanApi.getList();
        pruningOptions.value = (() => {
          // Deduplikasi berdasarkan nama — jumlahkan kuantitas jika nama sama
          const grouped: Record<string, { jumlah: number; satuan: string }> = {};
          (response || []).filter((pruneItem: any) => Number(pruneItem.jumlah) > 0).forEach((pruneItem: any) => {
            const rawName = (pruneItem.nama_rincian_aktivitas || 'Daun').trim();
            // Hapus kata 'Pemangkasan' di awal jika sudah ada agar tidak double
            const cleanName = rawName.replace(/^Pemangkasan\s+/i, '');
            const key = cleanName.toLowerCase();
            if (!grouped[key]) {
              grouped[key] = { jumlah: 0, satuan: pruneItem.satuan || 'kg' };
            }
            grouped[key].jumlah += Number(pruneItem.jumlah);
          });
          return Object.entries(grouped).map(([, item], index) => {
            const allEntries = (response || []).filter((pruneItem: any) => {
              const rawName = (pruneItem.nama_rincian_aktivitas || 'Daun').trim();
              const cleanName = rawName.replace(/^Pemangkasan\s+/i, '');
              return cleanName.toLowerCase() === Object.keys(grouped)[index];
            });
            const displayName = allEntries.length > 0
              ? (allEntries[0]?.nama_rincian_aktivitas || 'Daun').trim().replace(/^Pemangkasan\s+/i, '')
              : Object.keys(grouped)[index];
            return {
              value: `Pemangkasan ${displayName}`,
              label: `Pemangkasan ${displayName}`
            };
          });
        })();

      } catch (error) {
        console.error('Failed to load pruning in FeedStockFields', error);
      }
    });

    const feedStockOptions = computed(() => {
      const dbOptions = stocks.value
        .filter((stock: any) => {
          const nameLower = (stock.name || '').toLowerCase();
          const catLower = (stock.category || '').toLowerCase();

          // Exclude fermented/silase feeds
          if (nameLower.includes('silase') || nameLower.includes('fermentasi') || catLower.includes('silase')) {
            return false;
          }

          // Exclude raw feeds
          if (nameLower.includes('mentah') || nameLower.includes('hijauan daun') || nameLower.includes('pemangkasan') || nameLower.includes('pruning')) {
            return false;
          }

          // Return true for standard feed categories
          return ['hijauan', 'konsentrat', 'pellet', 'greenery', 'vitamin', 'pakan'].includes(catLower) || catLower.includes('pakan');
        })
        .map((stock: any) => ({
          value: stock.name,
          label: stock.name
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      return [
        ...dbOptions,
        { 
          value: 'custom', 
          label: (
            <span class="d-flex align-items-center gap-2">
              <img src="/icon/plus.png" style={{ width: '14px', height: '14px', objectFit: 'contain' }} alt="" />
              Tambah Pakan Baru (Lainnya)
            </span>
          ) as any
        }
      ];
    });

    const isSilaseOrFermentation = (stock: any) => {
      const nameLower = (stock?.name || '').toLowerCase();
      const catLower = (stock?.category || '').toLowerCase();
      return nameLower.includes('silase') || nameLower.includes('fermentasi') || catLower.includes('silase');
    };

    const energyFeeds = computed(() => {
      const dbList = stocks.value
        .filter((stock: any) => !isSilaseOrFermentation(stock) && stock.category === 'konsentrat' && (stock.notes || '').toLowerCase().includes('energi'))
        .map((stock: any) => stock.name);
      return dbList.length > 0 ? dbList : ['Bekatul', 'Jagung', 'Onggok'];
    });

    const proteinFeeds = computed(() => {
      const dbList = stocks.value
        .filter((stock: any) => !isSilaseOrFermentation(stock) && stock.category === 'konsentrat' && (stock.notes || '').toLowerCase().includes('protein'))
        .map((stock: any) => stock.name);
      return dbList.length > 0 ? dbList : ['Ampas Tahu', 'Bungkil Kacang Tanah', 'Bungkil kelapa Sawit'];
    });

    const mineralFeeds = computed(() => {
      const dbList = stocks.value
        .filter((stock: any) => !isSilaseOrFermentation(stock) && stock.category === 'vitamin' && (stock.notes || '').toLowerCase().includes('mineral'))
        .map((stock: any) => stock.name);
      return dbList.length > 0 ? dbList : ['Garam Dirijen', 'Mineral Blok'];
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

    const fiberOptions = computed(() => {
      const dbHijauan = stocks.value
        .filter((stock: any) => {
          if (isSilaseOrFermentation(stock)) return false;
          const cat = (stock.category || '').toLowerCase();
          return cat === 'hijauan' || cat === 'greenery';
        })
        .map((stock: any) => ({
          value: stock.name,
          label: stock.name
        }));
      
      return [...dbHijauan, ...pruningOptions.value];
    });

    const activatorOptions = computed(() => {
      // Hanya tampilkan aktivator murni (EM4, Molase, Ragi) & bukan hasil silase/fermentasi
      const AKTIVATOR_NAMES = ['em4', 'molase', 'ragi'];
      const dbActivators = stocks.value
        .filter((stock: any) => {
          if (isSilaseOrFermentation(stock)) return false;
          const nameLower = (stock.name || '').toLowerCase();
          return AKTIVATOR_NAMES.some(actName => nameLower.includes(actName));
        })
        .map((stock: any) => ({
          value: stock.name,
          label: stock.name
        }));
      
      // Fallback jika belum ada di DB
      const fallback = [
        { value: 'EM4', label: 'EM4' },
        { value: 'Molase', label: 'Molase' },
        { value: 'Ragi', label: 'Ragi' }
      ];
      
      const result = dbActivators.length > 0 ? dbActivators : fallback;
      // Deduplikasi
      const seen = new Set<string>();
      return result.filter(item => {
        const key = item.value.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });

    const toggleFiberSource = (feedName: string) => {
      const current = (form().hijauan || '').split(',').map(item => item.trim()).filter(Boolean);
      const index = current.indexOf(feedName);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(feedName);
      }
      form().hijauan = current.join(', ');
    };

    const isFiberSourceSelected = (feedName: string) => {
      const current = (form().hijauan || '').split(',').map(item => item.trim()).filter(Boolean);
      return current.includes(feedName);
    };

    const toggleEnergySource = (feedName: string) => {
      const current = (form().energi || '').split(',').map(item => item.trim()).filter(Boolean);
      const index = current.indexOf(feedName);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(feedName);
      }
      form().energi = current.join(', ');
    };

    const isEnergySourceSelected = (feedName: string) => {
      const current = (form().energi || '').split(',').map(item => item.trim()).filter(Boolean);
      return current.includes(feedName);
    };

    const toggleProteinSource = (feedName: string) => {
      const current = (form().protein || '').split(',').map(item => item.trim()).filter(Boolean);
      const index = current.indexOf(feedName);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(feedName);
      }
      form().protein = current.join(', ');
    };

    const isProteinSourceSelected = (feedName: string) => {
      const current = (form().protein || '').split(',').map(item => item.trim()).filter(Boolean);
      return current.includes(feedName);
    };

    const toggleActivatorSource = (feedName: string) => {
      const current = (form().mineral || '').split(',').map(item => item.trim()).filter(Boolean);
      const index = current.indexOf(feedName);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(feedName);
      }
      form().mineral = current.join(', ');
    };

    const isActivatorSourceSelected = (feedName: string) => {
      const current = (form().mineral || '').split(',').map(item => item.trim()).filter(Boolean);
      return current.includes(feedName);
    };

    // Custom percentage inputs for silage conversion formulation (defaults: 70%, 17.3%, 10.4%, 2.3%)
    const pctFiber = ref<number>(70.0);
    const pctEnergy = ref<number>(17.3);
    const pctProtein = ref<number>(10.4);
    const pctActivator = ref<number>(2.3);

    const activePreset = ref<'standard' | 'kaliwedi' | 'custom'>('standard');

    const applyPreset = (preset: 'standard' | 'kaliwedi') => {
      activePreset.value = preset;
      if (preset === 'standard') {
        pctFiber.value = 70.0;
        pctEnergy.value = 17.3;
        pctProtein.value = 10.4;
        pctActivator.value = 2.3;
      } else if (preset === 'kaliwedi') {
        pctFiber.value = 75.0;
        pctEnergy.value = 14.0;
        pctProtein.value = 0.0;
        pctActivator.value = 6.0;
      }
    };

    const totalPctSum = computed(() => {
      return (Number(pctFiber.value) || 0) + (Number(pctEnergy.value) || 0) + (Number(pctProtein.value) || 0) + (Number(pctActivator.value) || 0);
    });

    return () => (
      <>
        {!isKonversi.value ? (
          <>
            <PencatatanField label="Nama Pakan / Sumber" colClass="col-12" required>
              {!isCustomFeed.value ? (
                <PencatatanSelect
                  modelValue={form().obat}
                  options={feedStockOptions.value}
                  placeholder="Pilih Nama Pakan / Sumber"
                  onUpdateModelValue={(value: string) => { 
                    if (value === 'custom') {
                      isCustomFeed.value = true;
                      form().obat = '';
                    } else {
                      form().obat = value; 
                    }
                  }}
                />
              ) : (
                <div class="w-100">
                  <div class="d-flex gap-2 w-100">
                    <div class="flex-grow-1">
                      <PencatatanInput
                        modelValue={form().obat}
                        placeholder="Masukkan nama pakan baru (contoh: Pakan Konsentrat Jagung Manis)..."
                        onUpdateModelValue={(value: string) => { form().obat = value; }}
                      />
                    </div>
                    <button
                      type="button"
                      class="btn btn-outline-secondary px-3"
                      style={{ borderRadius: '12px', border: '1px solid #ced4da' }}
                      onClick={() => {
                        isCustomFeed.value = false;
                        form().obat = '';
                      }}
                    >
                      Batal
                    </button>
                  </div>
                  {isDuplicateFeedName.value && (
                    <div class="text-danger small mt-1.5 fw-bold animate-fade-in" style={{ fontSize: '0.8rem' }}>
                      ⚠️ Nama pakan ini sudah terdaftar di pilihan. Silakan gunakan tombol Batal dan pilih dari daftar untuk mencegah duplikasi data.
                    </div>
                  )}
                </div>
              )}
            </PencatatanField>
            <PencatatanField label="Jumlah Masuk" colClass="col-12" required>
              <PencatatanInput
                type="number"
                modelValue={form().qty}
                placeholder="0.0"
                onUpdateModelValue={(value: string) => { form().qty = value; }}
              />
            </PencatatanField>
            <PencatatanField label="Satuan" colClass="col-12">
              <PencatatanSelect
                modelValue={form().unit}
                options={['kg', 'ikat', 'liter', 'ton']}
                placeholder="Pilih Satuan"
                onUpdateModelValue={(value: string) => { form().unit = value; }}
              />
            </PencatatanField>
          </>
        ) : (
          <>
            <div class="col-12 mb-3">
              <label class="form-label fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                ⚙️ Opsi Preset Formulasi Persentase
              </label>
              <div class="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  class="btn btn-sm rounded-pill px-3 py-1.5 transition-all"
                  style={activePreset.value === 'standard' ? {
                    backgroundColor: 'var(--color-primary, #3d2f24)',
                    color: '#ffffff',
                    border: '1.5px solid var(--color-primary, #3d2f24)',
                    fontWeight: '600'
                  } : {
                    backgroundColor: '#ffffff',
                    color: 'var(--color-primary, #3d2f24)',
                    border: '1.5px solid #d4c4b0',
                    fontWeight: '500'
                  }}
                  onClick={() => applyPreset('standard')}
                >
                   Standar Complete Feed (70:17:10:3)
                </button>
                <button
                  type="button"
                  class="btn btn-sm rounded-pill px-3 py-1.5 transition-all"
                  style={activePreset.value === 'kaliwedi' ? {
                    backgroundColor: 'var(--color-primary, #3d2f24)',
                    color: '#ffffff',
                    border: '1.5px solid var(--color-primary, #3d2f24)',
                    fontWeight: '600'
                  } : {
                    backgroundColor: '#ffffff',
                    color: 'var(--color-primary, #3d2f24)',
                    border: '1.5px solid #d4c4b0',
                    fontWeight: '500'
                  }}
                  onClick={() => applyPreset('kaliwedi')}
                >
                   Praktik Kaliwedi (75:14:0:6)
                </button>
                <button
                  type="button"
                  class="btn btn-sm rounded-pill px-3 py-1.5 transition-all"
                  style={activePreset.value === 'custom' ? {
                    backgroundColor: 'var(--color-primary, #3d2f24)',
                    color: '#ffffff',
                    border: '1.5px solid var(--color-primary, #3d2f24)',
                    fontWeight: '600'
                  } : {
                    backgroundColor: '#ffffff',
                    color: 'var(--color-primary, #3d2f24)',
                    border: '1.5px solid #d4c4b0',
                    fontWeight: '500'
                  }}
                  onClick={() => { activePreset.value = 'custom'; }}
                >
                  ✏️ Formulasi Kustom (%)
                </button>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-2 px-1">
                <span class="small text-muted">
                  {activePreset.value === 'standard' && 'Menggunakan acuan nutrisi pakan lengkap (TMR).'}
                  {activePreset.value === 'kaliwedi' && 'Menggunakan acuan hasil pelatihan & praktik lapangan Desa Kaliwedi.'}
                  {activePreset.value === 'custom' && 'Masukkan persentase (%) kustom di masing-masing kelompok bahan.'}
                </span>
                <span 
                  class="badge rounded-pill px-2.5 py-1.5 fw-bold"
                  style={{
                    backgroundColor: Math.abs(totalPctSum.value - 100) < 0.1 ? '#2d6a4f' : '#c97a2b',
                    color: '#ffffff',
                    fontSize: '0.8rem'
                  }}
                >
                  Total Persentase: {totalPctSum.value.toFixed(1)}%
                </span>
              </div>
            </div>

            <PencatatanField label="Sumber Serat Kasar / Hijauan" colClass="col-12" required>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="small fw-bold text-secondary">Persentase Target (%):</span>
                <input
                  type="number"
                  class="form-control form-control-sm text-end fw-bold"
                  style={{ width: '90px', borderRadius: '8px', border: '1.5px solid #d4c4b0', color: 'var(--color-primary, #3d2f24)' }}
                  value={pctFiber.value}
                  onInput={(e: any) => {
                    pctFiber.value = parseFloat(e.target.value) || 0;
                    activePreset.value = 'custom';
                  }}
                  step="0.1"
                  min="0"
                  max="100"
                />
                <span class="small text-muted">%</span>
              </div>
              <div class="d-flex flex-column gap-2 mt-1">
                {fiberOptions.value.map((opt: any) => {
                  const isActive = isFiberSourceSelected(opt.value);
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
                        onChange={() => toggleFiberSource(opt.value)}
                      />
                      <span style={{ fontSize: '0.95rem', color: 'var(--color-gray-900)' }}>
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </PencatatanField>

            <PencatatanField label="Sumber Karbohidrat dan Energi" colClass="col-12" required>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="small fw-bold text-secondary">Persentase Target (%):</span>
                <input
                  type="number"
                  class="form-control form-control-sm text-end fw-bold"
                  style={{ width: '90px', borderRadius: '8px', border: '1.5px solid #d4c4b0', color: 'var(--color-primary, #3d2f24)' }}
                  value={pctEnergy.value}
                  onInput={(e: any) => {
                    pctEnergy.value = parseFloat(e.target.value) || 0;
                    activePreset.value = 'custom';
                  }}
                  step="0.1"
                  min="0"
                  max="100"
                />
                <span class="small text-muted">%</span>
              </div>
              <div class="d-flex flex-column gap-2 mt-1">
                {energyOptions.value.map((opt: any) => {
                  const isActive = isEnergySourceSelected(opt.value);
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
                      <span style={{ fontSize: '0.95rem', color: 'var(--color-gray-900)' }}>
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </PencatatanField>

            <PencatatanField label="Sumber Protein / Konsentrat" colClass="col-12">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="small fw-bold text-secondary">Persentase Target (%):</span>
                <input
                  type="number"
                  class="form-control form-control-sm text-end fw-bold"
                  style={{ width: '90px', borderRadius: '8px', border: '1.5px solid #d4c4b0', color: 'var(--color-primary, #3d2f24)' }}
                  value={pctProtein.value}
                  onInput={(e: any) => {
                    pctProtein.value = parseFloat(e.target.value) || 0;
                    activePreset.value = 'custom';
                  }}
                  step="0.1"
                  min="0"
                  max="100"
                />
                <span class="small text-muted">%</span>
              </div>
              <div class="d-flex flex-column gap-2 mt-1">
                {proteinOptions.value.map((opt: any) => {
                  const isActive = isProteinSourceSelected(opt.value);
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
                      <span style={{ fontSize: '0.95rem', color: 'var(--color-gray-900)' }}>
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </PencatatanField>

            <PencatatanField label="Aktivator Fermentasi & Mineral" colClass="col-12" required>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="small fw-bold text-secondary">Persentase Target (%):</span>
                <input
                  type="number"
                  class="form-control form-control-sm text-end fw-bold"
                  style={{ width: '90px', borderRadius: '8px', border: '1.5px solid #d4c4b0', color: 'var(--color-primary, #3d2f24)' }}
                  value={pctActivator.value}
                  onInput={(e: any) => {
                    pctActivator.value = parseFloat(e.target.value) || 0;
                    activePreset.value = 'custom';
                  }}
                  step="0.1"
                  min="0"
                  max="100"
                />
                <span class="small text-muted">%</span>
              </div>
              <div class="d-flex flex-column gap-2 mt-1">
                {activatorOptions.value.map((opt: any) => {
                  const isActive = isActivatorSourceSelected(opt.value);
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
                        onChange={() => toggleActivatorSource(opt.value)}
                      />
                      <span style={{ fontSize: '0.95rem', color: 'var(--color-gray-900)' }}>
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </PencatatanField>

            <PencatatanField label="Target Stok Pakan Hasil Konversi (KG)" colClass="col-12" required>
              <PencatatanInput
                type="number"
                modelValue={form().qty}
                placeholder="Masukkan target hasil konversi (kg)"
                onUpdateModelValue={(value: string) => { form().qty = value; }}
              />
            </PencatatanField>

            {parseFloat(form().qty || '0') > 0 && (
              <div class="col-12 animate-fade-in mb-3">
                <div class="card bg-light border-0 rounded-4 p-3 text-start">
                  <div class="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>
                    📋 Rekomendasi Komposisi Konversi (Target: {parseFloat(form().qty || '0')} kg)
                  </div>
                  <div class="row g-2" style={{ fontSize: '0.85rem' }}>
                    {(() => {
                      const targetQty = parseFloat(form().qty || '0');
                      const selectedFiber = (form().hijauan || '').split(',').map(item => item.trim()).filter(Boolean);
                      const selectedEnergy = (form().energi || '').split(',').map(item => item.trim()).filter(Boolean);
                      const selectedProtein = (form().protein || '').split(',').map(item => item.trim()).filter(Boolean);
                      const selectedActivator = (form().mineral || '').split(',').map(item => item.trim()).filter(Boolean);

                      const rendering = [];

                      // Fiber details
                      if (selectedFiber.length > 0 && pctFiber.value > 0) {
                        const totalFiber = targetQty * (pctFiber.value / 100);
                        const qtyPerItem = totalFiber / selectedFiber.length;
                        rendering.push(
                          <div class="col-12" key="fiber_recap">
                            <span class="text-muted d-block fw-bold">Serat Kasar / Hijauan ({pctFiber.value.toFixed(1)}%):</span>
                            {selectedFiber.map(name => (
                              <div class="ps-2 py-1 border-bottom" key={name}>
                                🌿 <span class="fw-bold">{name}</span>: <span class="text-success fw-bold">{qtyPerItem.toFixed(2)} kg</span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // Energy details
                      if (selectedEnergy.length > 0 && pctEnergy.value > 0) {
                        const totalEnergy = targetQty * (pctEnergy.value / 100);
                        const qtyPerItem = totalEnergy / selectedEnergy.length;
                        rendering.push(
                          <div class="col-12 border-top pt-2 mt-2" key="energy_recap">
                            <span class="text-muted d-block fw-bold">Sumber Energi / Karbohidrat ({pctEnergy.value.toFixed(1)}%):</span>
                            {selectedEnergy.map(name => (
                              <div class="ps-2 py-1 border-bottom" key={name}>
                                🌾 <span class="fw-bold">{name}</span>: <span class="text-primary fw-bold">{qtyPerItem.toFixed(2)} kg</span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // Protein details
                      if (selectedProtein.length > 0 && pctProtein.value > 0) {
                        const totalProtein = targetQty * (pctProtein.value / 100);
                        const qtyPerItem = totalProtein / selectedProtein.length;
                        rendering.push(
                          <div class="col-12 border-top pt-2 mt-2" key="protein_recap">
                            <span class="text-muted d-block fw-bold">Sumber Protein / Konsentrat ({pctProtein.value.toFixed(1)}%):</span>
                            {selectedProtein.map(name => (
                              <div class="ps-2 py-1 border-bottom" key={name}>
                                🫘 <span class="fw-bold">{name}</span>: <span class="text-primary fw-bold">{qtyPerItem.toFixed(2)} kg</span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // Activator details
                      if (selectedActivator.length > 0 && pctActivator.value > 0) {
                        const totalActivator = targetQty * (pctActivator.value / 100);
                        const qtyPerItem = totalActivator / selectedActivator.length;
                        rendering.push(
                          <div class="col-12 border-top pt-2 mt-2" key="activator_recap">
                            <span class="text-muted d-block fw-bold">Aktivator & Mineral ({pctActivator.value.toFixed(1)}%):</span>
                            {selectedActivator.map(name => (
                              <div class="ps-2 py-1 border-bottom" key={name}>
                                🧂 <span class="fw-bold">{name}</span>: <span class="text-primary fw-bold">{qtyPerItem.toFixed(2)} kg</span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      return rendering;
                    })()}
                  </div>
                </div>
              </div>
            )}

            <PencatatanField label="Hasil Konversi Jadi" colClass="col-12" required>
              <PencatatanInput
                modelValue={form().obat}
                placeholder="Masukkan nama hasil konversi pakan..."
                onUpdateModelValue={(value: string) => { form().obat = value; }}
              />
            </PencatatanField>
          </>
        )}
      </>
    );
  }
});
