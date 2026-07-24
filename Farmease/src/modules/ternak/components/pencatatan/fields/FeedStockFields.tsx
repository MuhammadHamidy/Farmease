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
    const f = () => props.form;
    const isKonversi = computed(() => props.form.name === 'Konversi Pakan');

    const pruningOptions = ref<any[]>([]);

    onMounted(async () => {
      fetchStocks().catch(e => console.error('Failed to fetch stocks in FeedStockFields', e));
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
              label: `Pemangkasan ${displayName}`
            };
          });
        })();

      } catch (e) {
        console.error('Failed to load pruning in FeedStockFields', e);
      }
    });

    const feedStockOptions = computed(() => {
      return stocks.value
        .filter((s: any) => {
          const nameLower = (s.name || '').toLowerCase();
          const catLower = (s.category || '').toLowerCase();

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
        .map((s: any) => ({
          value: s.name,
          label: s.name
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    });

    const deduplicateOptions = (dbNames: string[], fallbackNames: string[]) => {
      const result: string[] = [...dbNames];
      const resultLower = new Set(result.map(n => n.toLowerCase()));
      fallbackNames.forEach(name => {
        if (!resultLower.has(name.toLowerCase())) {
          result.push(name);
          resultLower.add(name.toLowerCase());
        }
      });
      return result;
    };

    const energyFeeds = computed(() => {
      const dbList = stocks.value
        .filter((s: any) => {
          const cat = (s.category || '').toLowerCase();
          const notes = (s.notes || '').toLowerCase();
          const name = (s.name || '').toLowerCase();
          if (cat === 'konsentrat' || cat === 'pellet') {
            if (notes.includes('energi') || notes.includes('karbohidrat')) return true;
            if (name.includes('bekatul') || name.includes('dedak') || name.includes('jagung') || name.includes('onggok') || name.includes('singkong') || name.includes('polard') || name.includes('gandum')) return true;
            if (!notes.includes('protein') && !name.includes('tahu') && !name.includes('bungkil') && !name.includes('pellet') && !name.includes('ampas')) return true;
          }
          return false;
        })
        .map((s: any) => s.name);

      const fallback = ['Bekatul', 'Jagung', 'Onggok'];
      return deduplicateOptions(dbList, fallback);
    });

    const proteinFeeds = computed(() => {
      const dbList = stocks.value
        .filter((s: any) => {
          const cat = (s.category || '').toLowerCase();
          const notes = (s.notes || '').toLowerCase();
          const name = (s.name || '').toLowerCase();
          if (cat === 'konsentrat' || cat === 'pellet') {
            if (notes.includes('protein')) return true;
            if (name.includes('tahu') || name.includes('bungkil') || name.includes('pellet') || name.includes('ampas') || name.includes('soy') || name.includes('ikan') || name.includes('konsentrat')) return true;
          }
          return false;
        })
        .map((s: any) => s.name);

      const fallback = ['Ampas Tahu', 'Bungkil Kacang Tanah', 'Bungkil Kelapa Sawit'];
      return deduplicateOptions(dbList, fallback);
    });

    const mineralFeeds = computed(() => {
      const dbList = stocks.value
        .filter((s: any) => s.category === 'vitamin' && (s.notes || '').toLowerCase().includes('mineral'))
        .map((s: any) => s.name);
      const fallback = ['Garam Dirijen', 'Mineral Blok'];
      return deduplicateOptions(dbList, fallback);
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
        .filter((s: any) => {
          const cat = (s.category || '').toLowerCase();
          const name = (s.name || '').toLowerCase();
          if (name.includes('silase') || name.includes('fermentasi') || cat.includes('silase')) {
            return false;
          }
          return cat === 'hijauan' || cat === 'greenery';
        })
        .map((s: any) => ({
          value: s.name,
          label: s.name
        }));
      
      return [...dbHijauan, ...pruningOptions.value];
    });

    const activatorOptions = computed(() => {
      const AKTIVATOR_NAMES = ['em4', 'molase', 'ragi', 'tetes tebu'];
      const dbActivators = stocks.value
        .filter((s: any) => {
          const nameLower = (s.name || '').toLowerCase();
          const catLower = (s.category || '').toLowerCase();
          return catLower === 'vitamin' || catLower === 'mineral' || catLower === 'bahan' || catLower === 'aktivator' || AKTIVATOR_NAMES.some(a => nameLower.includes(a));
        })
        .map((s: any) => s.name);

      const fallback = ['EM4', 'Ragi', 'Molase'];
      const names = deduplicateOptions(dbActivators, fallback);
      return names.map(n => ({ value: n, label: n }));
    });

    const toggleFiberSource = (feedName: string) => {
      const current = (f().hijauan || '').split(',').map(s => s.trim()).filter(Boolean);
      const idx = current.indexOf(feedName);
      if (idx > -1) {
        current.splice(idx, 1);
      } else {
        current.push(feedName);
      }
      f().hijauan = current.join(', ');
    };

    const isFiberSourceSelected = (feedName: string) => {
      const current = (f().hijauan || '').split(',').map(s => s.trim()).filter(Boolean);
      return current.includes(feedName);
    };

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

    const toggleActivatorSource = (feedName: string) => {
      const current = (f().mineral || '').split(',').map(s => s.trim()).filter(Boolean);
      const idx = current.indexOf(feedName);
      if (idx > -1) {
        current.splice(idx, 1);
      } else {
        current.push(feedName);
      }
      f().mineral = current.join(', ');
    };

    const isActivatorSourceSelected = (feedName: string) => {
      const current = (f().mineral || '').split(',').map(s => s.trim()).filter(Boolean);
      return current.includes(feedName);
    };

    return () => (
      <>
        {!isKonversi.value ? (
          <>
            <PencatatanField label="Nama Pakan / Sumber" colClass="col-12" required>
              <PencatatanSelect
                modelValue={f().obat}
                options={feedStockOptions.value}
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
            <PencatatanField label="Sumber Serat Kasar (60-70%) (Bisa centang lebih dari 1)" colClass="col-12" required>
              <div class="d-flex flex-column gap-2 mt-2">
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

            <PencatatanField label="Sumber Karbohidrat dan Energi (10-20%) (Bisa centang lebih dari 1)" colClass="col-12" required>
              <div class="d-flex flex-column gap-2 mt-2">
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

            <PencatatanField label="Sumber Protein/Konsentrat (10%) (Bisa centang lebih dari 1)" colClass="col-12" required>
              <div class="d-flex flex-column gap-2 mt-2">
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

            <PencatatanField label="Aktivator Fermentasi & Mineral (2.3%) (Bisa centang lebih dari 1)" colClass="col-12" required>
              <div class="d-flex flex-column gap-2 mt-2">
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
                    {(() => {
                      const targetQty = parseFloat(f().qty || '0');
                      const selectedFiber = (f().hijauan || '').split(',').map(s => s.trim()).filter(Boolean);
                      const selectedEnergy = (f().energi || '').split(',').map(s => s.trim()).filter(Boolean);
                      const selectedProtein = (f().protein || '').split(',').map(s => s.trim()).filter(Boolean);
                      const selectedActivator = (f().mineral || '').split(',').map(s => s.trim()).filter(Boolean);

                      const rendering = [];

                      // Fiber details (65% or 70.0% of target)
                      if (selectedFiber.length > 0) {
                        const totalFiber = targetQty * 0.70;
                        const qtyPerItem = totalFiber / selectedFiber.length;
                        rendering.push(
                          <div class="col-12">
                            <span class="text-muted d-block fw-bold">Serat Kasar (70.0%):</span>
                            {selectedFiber.map(name => (
                              <div class="ps-2 py-1 border-bottom" key={name}>
                                🌿 <span class="fw-bold">{name}</span>: <span class="text-success fw-bold">{qtyPerItem.toFixed(2)} kg</span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // Energy details (17.3% of target)
                      if (selectedEnergy.length > 0) {
                        const totalEnergy = targetQty * 0.173;
                        const qtyPerItem = totalEnergy / selectedEnergy.length;
                        rendering.push(
                          <div class="col-12 border-top pt-2 mt-2">
                            <span class="text-muted d-block fw-bold">Energi / Karbohidrat (17.3%):</span>
                            {selectedEnergy.map(name => (
                              <div class="ps-2 py-1 border-bottom" key={name}>
                                🌾 <span class="fw-bold">{name}</span>: <span class="text-primary fw-bold">{qtyPerItem.toFixed(2)} kg</span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // Protein details (10.4% of target)
                      if (selectedProtein.length > 0) {
                        const totalProtein = targetQty * 0.104;
                        const qtyPerItem = totalProtein / selectedProtein.length;
                        rendering.push(
                          <div class="col-12 border-top pt-2 mt-2">
                            <span class="text-muted d-block fw-bold">Protein / Konsentrat (10.4%):</span>
                            {selectedProtein.map(name => (
                              <div class="ps-2 py-1 border-bottom" key={name}>
                                🫘 <span class="fw-bold">{name}</span>: <span class="text-primary fw-bold">{qtyPerItem.toFixed(2)} kg</span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // Activator details (2.3% of target)
                      if (selectedActivator.length > 0) {
                        const totalActivator = targetQty * 0.023;
                        const qtyPerItem = totalActivator / selectedActivator.length;
                        rendering.push(
                          <div class="col-12 border-top pt-2 mt-2">
                            <span class="text-muted d-block fw-bold">Aktivator & Mineral (2.3%):</span>
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
                modelValue={f().obat}
                placeholder="Masukkan nama hasil konversi pakan..."
                onUpdateModelValue={(v: string) => { f().obat = v; }}
              />
            </PencatatanField>
          </>
        )}
      </>
    );
  }
});
