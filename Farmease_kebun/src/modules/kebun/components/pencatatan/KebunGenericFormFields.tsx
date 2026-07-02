import { defineComponent, type PropType, ref, watch, computed } from 'vue'
import PerkebunanFormSelect from '../shared/PerkebunanFormSelect'
import PerkebunanFormInput from '../shared/PerkebunanFormInput'
import { perawatanApi } from '@/shared/api'
import { landSession } from '@/store/navigation'

export default defineComponent({
  name: 'KebunGenericFormFields',
  props: {
    kindTitle: { type: String, required: true },
    form: { type: Object as PropType<any>, required: true },
    activeMode: { type: String as PropType<'lahan' | 'pohon'>, required: true },
    selectedRincian: { type: String, required: true },
    manureStock: { type: Number, default: 0 },
    manureCollections: { type: Array as PropType<any[]>, default: () => [] },
    pruningCollections: { type: Array as PropType<any[]>, default: () => [] },
    allSubmissions: { type: Array as PropType<any[]>, default: () => [] },
    selectedTreesCount: { type: Number, default: 1 },
    varietasOptions: { type: Array as PropType<string[]>, default: () => ['Semua Varietas'] },
    selectedVarietas: { type: String, default: 'Semua Varietas' },
    selectedTrees: { type: Array as PropType<string[]>, default: () => [] },
    allTrees: { type: Array as PropType<any[]>, default: () => [] },
    pupukOptions: { type: Array as PropType<string[]>, default: () => [] },
    bahanStocks: { type: Array as PropType<any[]>, default: () => [] },
    obatStocks: { type: Array as PropType<any[]>, default: () => [] },
    pruningStockMap: { type: Object as PropType<any>, default: () => ({}) },
  },
  emits: ['update:selectedVarietas'],
  setup(props, { emit }) {
    const f = () => props.form

    // Custom Fertilizer Types implementation
    const customFertilizerTypes = ref<string[]>([]);
    try {
      customFertilizerTypes.value = JSON.parse(localStorage.getItem('custom_fertilizer_types') || '[]');
    } catch (e) {
      customFertilizerTypes.value = [];
    }

    const newFertilizerName = ref('');

    const fertilizerTypesOptions = computed(() => {
      const defaults = [
        { value: 'Pupuk Organik Padat Kandang', label: 'Pupuk Organik Padat Kandang' },
        { value: 'Pupuk Organik Kompos', label: 'Pupuk Organik Kompos' },
        { value: 'Pupuk Organik Cair', label: 'Pupuk Organik Cair (POC)' }
      ];
      const customs = customFertilizerTypes.value.map(val => ({
        value: val,
        label: val
      }));
      return [
        ...defaults,
        ...customs,
        { value: 'ADD_NEW', label: 'Tambah Jenis Pupuk Baru...' }
      ];
    });

    const handleSaveNewFertilizer = (isFermentationForm: boolean) => {
      const name = newFertilizerName.value.trim();
      if (!name) return;
      
      const defaultsLower = ['pupuk organik padat kandang', 'pupuk organik kompos', 'pupuk organik cair'];
      if (!customFertilizerTypes.value.includes(name) && !defaultsLower.includes(name.toLowerCase())) {
        customFertilizerTypes.value.push(name);
        localStorage.setItem('custom_fertilizer_types', JSON.stringify(customFertilizerTypes.value));
      }

      if (isFermentationForm) {
        if (f().hasilJadi === 'ADD_NEW') {
          f().bahanMentahId = ''
          newFertilizerName.value = ''
        };
        f().hasilJadi = name;
      } else {
        f().jenisFermentasi = name;
      }
      newFertilizerName.value = '';
    };

    const getStockOf = (name: string) => {
      const match = props.bahanStocks.find((b: any) => b.name === name)
      return match ? match.val : 0
    }

    const bahanMentahOptions = computed(() => {
      const h = (f().hasilJadi || '').toLowerCase();
      
      if (h.includes('cair') || h.includes('poc')) {
        return [
          { value: 'Limbah organik (contohnya sisa bahan makanan, sisa sayuran, dll)', label: 'Limbah organik (contohnya sisa bahan makanan, sisa sayuran, dll)' },
          { value: 'Air kelapa', label: 'Air kelapa' }
        ];
      } else if (h.includes('kompos')) {
        return [
          { value: 'Hasil pemangkasan (kanopi, ranting, daun)', label: 'Hasil pemangkasan (kanopi, ranting, daun)' },
          { value: 'Hasil pembersihan (gulma, serasah)', label: 'Hasil pembersihan (gulma, serasah)' }
        ];
      } else {
        // Fallback untuk Pupuk Organik Padat Kandang
        return [
          { value: 'Kotoran domba', label: 'Kotoran domba' }
        ];
      }
    });

    const decomposerOptions = computed(() => {
      const list = [
        { value: 'EM4', label: 'EM4' },
        { value: 'MOL (Mikroorganisme Lokal)', label: 'MOL (Mikroorganisme Lokal)' },
        { value: 'Dekomposer Lokal', label: 'Dekomposer Lokal' },
        { value: 'Lainnya', label: 'Lainnya' }
      ]
      return list.filter(opt => {
        if (opt.value === 'Lainnya') return true
        return getStockOf(opt.value) > 0
      })
    })

    const molaseOptions = computed(() => {
      const list = [
        { value: 'Tetes Tebu (Molase)', label: 'Tetes Tebu (Molase)' },
        { value: 'Air Gula Merah', label: 'Air Gula Merah' },
        { value: 'Air Gula Pasir', label: 'Air Gula Pasir' },
        { value: 'Lainnya', label: 'Lainnya' }
      ]
      return list.filter(opt => {
        if (opt.value === 'Lainnya') return true
        return getStockOf(opt.value) > 0
      })
    })

    const bahanOptions = computed(() => {
      const names = props.bahanStocks.map((b: any) => b.name)
      const defaults = [
        'Kotoran Domba', 'EM4', 'MOL (Mikroorganisme Lokal)',
        'Dekomposer Lokal', 'Tetes Tebu (Molase)', 'Air Gula Merah',
        'Air Gula Pasir', 'Daun', 'Ranting', 'Gulma', 'Lainnya'
      ]
      defaults.forEach(d => {
        if (!names.includes(d)) {
          names.push(d)
        }
      })
      return names
    })

    const checkingHistory = computed(() => {
      const batchId = f().batchFermentasiId
      if (!batchId) return []
      return (props.allSubmissions || [])
        .filter((s: any) => {
          const item = s.payload?.data?.items?.[0] || {}
          const isCheck = s.type === 'pengolahan pupuk' && (item.selectedRincian === 'Cek Fermentasi' || item.rincian === 'Cek Fermentasi')
          return isCheck && String(item.batchFermentasiId) === String(batchId)
        })
        .map((s: any) => {
          const item = s.payload?.data?.items?.[0] || {}
          return {
            id: s.id,
            date: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
            activity: item.aktivitasPengecekan || 'Pengecekan rutin',
            condition: item.kondisiFisik || '-',
            notes: item.catatanStok || item.catatan || '-',
            status: s.approvalStatus || 'pending'
          }
        })
    })

    const bahanTambahanOptions = computed(() => {
      const namesSet = new Set<string>()
      ;(props.allSubmissions || []).forEach((s: any) => {
        if ((s.type || '').toLowerCase() === 'stok pupuk') {
          const item = s.payload?.data?.items?.[0] || {}
          if (item.tujuanPemanfaatan === 'bahan' && item.kategoriBahan === 'Bahan Tambahan' && item.namaObat) {
            namesSet.add(item.namaObat)
          }
        }
      })

      const list = Array.from(namesSet).map(name => {
        const stockVal = getStockOf(name)
        return {
          value: name,
          label: `${name} (Stok: ${stockVal.toFixed(1)} kg)`,
          stock: stockVal
        }
      })

      const activeList = list.filter(o => o.stock > 0)
      return [
        { value: '', label: 'Tidak Ada / Tanpa Bahan Tambahan' },
        ...activeList
      ]
    })

    const filteredFermentationPeriods = computed(() => {
      const selectedJenis = f().jenisFermentasi
      if (!selectedJenis) return []

      return (props.allSubmissions || [])
        .filter((s: any) => {
          const item = s.payload?.data?.items?.[0] || {}
          const isFermentation = s.type === 'pengolahan pupuk' && (item.selectedRincian === 'Fermentasi Pupuk' || item.rincian === 'Fermentasi Pupuk')
          
          let resolvedHasilJadi = item.hasilJadi || ''
          if (resolvedHasilJadi === 'Pupuk Organik Cair') {
            resolvedHasilJadi = 'Pupuk Organik Cair' // match choice
          }
          return isFermentation && resolvedHasilJadi === selectedJenis
        })
        .map((s: any) => {
          const item = s.payload?.data?.items?.[0] || {}
          const tgl = s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'
          return {
            value: String(s.id || ''),
            label: `Fermentasi ${tgl}`,
            rawItem: item,
            rawSubmission: s
          }
        })
    })

    const selectedFermentationDetails = computed(() => {
      const batchId = f().batchFermentasiId
      if (!batchId) return null

      const match = filteredFermentationPeriods.value.find((p: any) => String(p.value) === String(batchId))
      if (!match) return null

      const item = match.rawItem

      let resolvedBahanMentah = item.bahanMentahId || '-'

      return {
        bahanMentah: resolvedBahanMentah || '-',
        dekomposer: item.dekomposer || '-',
        molase: item.molase || '-',
        bahanTambahan: item.bahanTambahan || 'Tidak ada',
        qty: item.qty || 0,
        unit: item.unit || 'kg'
      }
    })

    const medicineRecommendation = computed(() => {
      if (props.kindTitle !== 'Pemberian Obat') return null

      // Resolve Varietas
      let resolvedVarietas = ''
      if (props.selectedVarietas && props.selectedVarietas !== 'Semua Varietas') {
        resolvedVarietas = props.selectedVarietas
      } else if (props.activeMode === 'pohon' && props.selectedTrees && props.selectedTrees.length > 0) {
        const firstTreeCode = props.selectedTrees[0]
        const tree = props.allTrees.find((t: any) => t.code === firstTreeCode)
        if (tree && tree.varietas) {
          resolvedVarietas = tree.varietas
        }
      }

      // Resolve Fase
      let resolvedFase = ''
      const fFase = f().fasePohon
      if (fFase && fFase !== 'Fase Pohon') {
        resolvedFase = fFase
      } else if (props.activeMode === 'pohon' && props.selectedTrees && props.selectedTrees.length > 0) {
        const firstTreeCode = props.selectedTrees[0]
        const tree = props.allTrees.find((t: any) => t.code === firstTreeCode)
        if (tree && tree.fase) {
          resolvedFase = tree.fase
        }
      }

      if (!resolvedVarietas || !resolvedFase) {
        return null
      }

      const selectedObat = f().namaObat || ''
      const selectedTeknik = f().teknikPemberianObat || ''
      const treeCount = (props.activeMode === 'pohon' && props.selectedTrees) ? props.selectedTrees.length : 1

      let recommendedDose = '2 - 3 mL per L air'
      let totalDoseCalc = `± ${treeCount * 2} L air & ${treeCount * 2 * 2} - ${treeCount * 2 * 3} mL obat`

      const foundStock = props.obatStocks?.find((o: any) => o.name === selectedObat)
      if (foundStock) {
        const qtyMatch = (foundStock.qty || '').toLowerCase()
        if (qtyMatch.includes('g') || qtyMatch.includes('kg')) {
          recommendedDose = '2 - 3 g per L air'
          totalDoseCalc = `± ${treeCount * 2} L air & ${treeCount * 2 * 2} - ${treeCount * 2 * 3} g obat`
        }
      }

      return {
        varietas: resolvedVarietas,
        fase: resolvedFase,
        obat: selectedObat || '-',
        teknik: selectedTeknik || '-',
        dosis: recommendedDose,
        total: totalDoseCalc,
        treeCount
      }
    })

    const fertilizerRecommendation = computed(() => {
      if (props.kindTitle !== 'Pemupukan') return null

      // Resolve Varietas
      let resolvedVarietas = ''
      if (props.selectedVarietas && props.selectedVarietas !== 'Semua Varietas') {
        resolvedVarietas = props.selectedVarietas
      } else if (props.activeMode === 'pohon' && props.selectedTrees && props.selectedTrees.length > 0) {
        const firstTreeCode = props.selectedTrees[0]
        const tree = props.allTrees.find((t: any) => t.code === firstTreeCode)
        if (tree && tree.varietas) {
          resolvedVarietas = tree.varietas
        }
      }

      // Resolve Fase
      let resolvedFase = ''
      const fFase = f().fasePohon
      if (fFase && fFase !== 'Fase Pohon') {
        resolvedFase = fFase
      } else if (props.activeMode === 'pohon' && props.selectedTrees && props.selectedTrees.length > 0) {
        const firstTreeCode = props.selectedTrees[0]
        const tree = props.allTrees.find((t: any) => t.code === firstTreeCode)
        if (tree && tree.fase) {
          resolvedFase = tree.fase
        }
      }

      if (!resolvedVarietas || !resolvedFase) {
        return null
      }

      const faseLower = resolvedFase.toLowerCase()
      const selectedPupuk = f().jenisPupukDetail || ''
      const selectedTeknik = f().teknikPemupukan || ''
      const rincianStr = props.selectedRincian || ''
      
      let recommendedDose = ''
      let totalDoseCalc = ''

      const pupukLower = selectedPupuk.toLowerCase()
      const isCair = pupukLower.includes('cair') || pupukLower.includes('poc') || rincianStr.toLowerCase().includes('cair')
      const isOrganikPadat = pupukLower.includes('padat') || pupukLower.includes('kompos') || pupukLower.includes('kandang') || rincianStr.toLowerCase().includes('padat') || rincianStr.toLowerCase().includes('organik')

      const treeCount = (props.activeMode === 'pohon' && props.selectedTrees) ? props.selectedTrees.length : 1

      if (isCair) {
        if (selectedTeknik === 'Semprot') {
          recommendedDose = '2 - 5 mL per L air'
          totalDoseCalc = `± ${treeCount * 2} L air & ${treeCount * 2 * 3} - ${treeCount * 2 * 5} mL pupuk`
        } else if (selectedTeknik === 'Kocor') {
          recommendedDose = '10 - 20 mL per L (5 L per pohon)'
          totalDoseCalc = `${treeCount * 5} L air & ${treeCount * 5 * 15} mL pupuk`
        } else {
          recommendedDose = '15 - 20 mL per L air'
          totalDoseCalc = `${treeCount * 100} - ${treeCount * 150} mL pupuk`
        }
      } else if (isOrganikPadat) {
        if (faseLower.includes('vegetatif') || faseLower.includes('belum produktif') || faseLower.includes('0-3') || faseLower.includes('pembibitan')) {
          recommendedDose = '5 - 10 kg per pohon'
          totalDoseCalc = `${treeCount * 5} - ${treeCount * 10} kg`
        } else {
          recommendedDose = '15 - 20 kg per pohon'
          totalDoseCalc = `${treeCount * 15} - ${treeCount * 20} kg`
        }
      } else {
        // Kimia / NPK
        if (faseLower.includes('vegetatif') || faseLower.includes('belum produktif') || faseLower.includes('0-3') || faseLower.includes('pembibitan')) {
          recommendedDose = '150 - 200 g per pohon'
          totalDoseCalc = `${treeCount * 150} - ${treeCount * 200} g`
        } else {
          recommendedDose = '500 - 1000 g per pohon'
          totalDoseCalc = `${treeCount * 0.5} - ${treeCount * 1.0} kg`
        }
      }

      return {
        varietas: resolvedVarietas,
        fase: resolvedFase,
        pupuk: selectedPupuk || '-',
        teknik: selectedTeknik || '-',
        dosis: recommendedDose,
        total: totalDoseCalc,
        treeCount
      }
    })

    const fermentationRecommendation = computed(() => {
      const qVal = Number(f().qty) || 0

      // Check if raw material is selected
      if (!f().bahanMentahId) return null

      const materialLabel = f().bahanMentahId
      const decomposerLabel = f().dekomposer || 'Dekomposer'
      const molaseLabel = f().molase || 'Molase'

      const isCair = (f().hasilJadi || '').toLowerCase().includes('cair') || (f().hasilJadi || '').toLowerCase().includes('poc')

      let materialUsed = (0.3 * qVal).toFixed(1)
      let waterUsed = qVal.toFixed(1)
      let durationText = '7 - 14 Hari'
      let checkingText = 'Setiap 3 hari sekali (buka tutup wadah sebentar untuk membuang gas, serta periksa aroma berbau asam segar).'

      if (!isCair) {
        materialUsed = (1.0 * qVal).toFixed(1)
        waterUsed = (0.3 * qVal).toFixed(1)
        durationText = '21 - 30 Hari'
        checkingText = 'Setiap 7 hari sekali (bolak-balik adukan kompos untuk aerasi dan periksa kelembapan serta suhu timbunan).'
      }

      return {
        materialUsed,
        materialLabel,
        decomposerLabel,
        molaseLabel,
        decomposer: Math.round(10 * qVal),
        molase: Math.round(10 * qVal),
        water: waterUsed,
        additional: f().bahanTambahan || null,
        durationText,
        checkingText
      }
    })

    watch(
      () => [f().qty, f().hasilJadi, f().bahanMentahId, f().dekomposer, f().molase, f().bahanTambahan],
      () => {
        if (f().hasilJadi !== 'ADD_NEW') {
          f().unit = (f().hasilJadi || '').toLowerCase().includes('cair') ? 'Liter' : 'kg'
        }
      },
      { deep: true }
    )

    watch(
      () => f().hasilJadi,
      (newVal) => {
        if (!newVal || newVal === 'ADD_NEW') return
        const valLower = newVal.toLowerCase()
        if (valLower.includes('cair') || valLower.includes('poc') || valLower.includes('kompos')) {
          f().bahanMentahId = ''
        } else {
          f().pruningId = ''
        }
      }
    )

    const pupukComposition = computed(() => {
      const dose = Number(f().jumlahBeratPupuk) || 0
      if (dose <= 0) return null

      const name = (f().jenisPupukDetail || '').toLowerCase()
      const isCair = name.includes('poc') || name.includes('cair')
      const isOrganik = name.includes('kandang') || name.includes('kotoran') || name.includes('kompos') || name.includes('organik')

      if (!isOrganik && !isCair) return null

      if (isCair) {
        return {
          type: 'cair',
          materialLabel: 'Bahan Organik (Hasil Pemangkasan)',
          materialQty: (0.3 * dose).toFixed(1) + ' kg',
          waterQty: dose.toFixed(1) + ' Liter',
          decomposerQty: Math.round(20 * dose) + ' ml',
          molaseQty: Math.round(20 * dose) + ' ml'
        }
      } else {
        // Solid organic (Pupuk Kandang / Kotoran Domba)
        const isKompos = name.includes('kompos')
        return {
          type: 'padat',
          materialLabel: isKompos ? 'Bahan Organik (Hasil Pemangkasan)' : 'Kotoran Domba',
          materialQty: dose.toFixed(1) + ' kg',
          waterQty: (0.3 * dose).toFixed(1) + ' Liter',
          decomposerQty: Math.round(10 * dose) + ' ml',
          molaseQty: Math.round(10 * dose) + ' ml'
        }
      }
    })

    return () => {
      const rincian = props.selectedRincian || 'Pencatatan'

      return (
        <div class="form-body-wrap" style="display: flex; flex-direction: column; gap: 1rem;">
          {/* Form Fields according to kindTitle */}
          {props.kindTitle === 'Penanaman' && (() => {
            const isPenggantian = props.selectedRincian.toLowerCase().includes('penggantian')
            return (
              <>
                {isPenggantian ? (
                  <>
                    {props.activeMode === 'lahan' && (
                      <div class="form-group">
                        <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Varietas</span>
                        <PerkebunanFormSelect
                          modelValue={props.selectedVarietas}
                          options={props.varietasOptions}
                          placeholder="Semua Varietas"
                          onUpdate:modelValue={(val) => emit('update:selectedVarietas', val)}
                        />
                      </div>
                    )}



                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Penyebab Penggantian Pohon</span>
                      <PerkebunanFormInput
                        modelValue={f().deskripsiPenanaman}
                        placeholder="Contoh: Serangan hama"
                        onUpdate:modelValue={(val) => { f().deskripsiPenanaman = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                      <PerkebunanFormInput
                        modelValue={f().deskripsiPemangkasan}
                        type="textarea"
                        placeholder="Catatan"
                        onUpdate:modelValue={(val) => { f().deskripsiPemangkasan = val }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Varietas</span>
                      <PerkebunanFormSelect
                        modelValue={props.selectedVarietas}
                        options={props.varietasOptions}
                        placeholder="Semua Varietas"
                        onUpdate:modelValue={(val) => emit('update:selectedVarietas', val)}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Jenis Bibit</span>
                      <PerkebunanFormInput
                        modelValue={f().jenisBibit}
                        placeholder="Contoh: Okulasi"
                        onUpdate:modelValue={(val) => { f().jenisBibit = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Kode Pohon Baru</span>
                      <PerkebunanFormInput
                        modelValue={f().kodePohonManual}
                        placeholder="Contoh: 3"
                        onUpdate:modelValue={(val) => { f().kodePohonManual = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                      <PerkebunanFormInput
                        modelValue={f().deskripsiPenanaman}
                        type="textarea"
                        placeholder="Catatan"
                        onUpdate:modelValue={(val) => { f().deskripsiPenanaman = val }}
                      />
                    </div>
                  </>
                )}
              </>
            )
          })()}

          {props.kindTitle === 'Pemberian Obat' && (() => {
            return (
              <>
                {props.activeMode === 'lahan' && (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Varietas</span>
                      <PerkebunanFormSelect
                        modelValue={props.selectedVarietas}
                        options={props.varietasOptions}
                        placeholder="Semua Varietas"
                        onUpdate:modelValue={(val) => emit('update:selectedVarietas', val)}
                      />
                    </div>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Fase Pohon</span>
                      <PerkebunanFormSelect
                        modelValue={f().fasePohon}
                        options={['Fase Pohon', 'Belum Produktif (0-3 tahun)', 'Produktif (>4 tahun)', 'Vegetatif', 'Generatif']}
                        placeholder="Fase Pohon"
                        onUpdate:modelValue={(val) => { f().fasePohon = val }}
                      />
                    </div>
                  </>
                )}

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Nama Organisme Pengganggu Tumbuhan (OPT)</span>
                  <PerkebunanFormInput
                    modelValue={f().namaOPT}
                    placeholder="Contoh: Ulat Kipat, Lalat Buah, dll."
                    onUpdate:modelValue={(val) => { f().namaOPT = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Nama Obat</span>
                  {props.obatStocks && props.obatStocks.length > 0 ? (
                    <PerkebunanFormSelect
                      modelValue={f().namaObat}
                      options={props.obatStocks.map((o: any) => o.name)}
                      placeholder="Pilih Obat"
                      onUpdate:modelValue={(val: string) => {
                        f().namaObat = val
                        // Auto-fill from stock info
                        const found = props.obatStocks.find((o: any) => o.name === val)
                        if (found) {
                          const qtyMatch = (found.qty || '').match(/^([\d.]+)/)
                          if (qtyMatch) f().volumeObat = qtyMatch[1]
                          const unitMatch = (found.qty || '').match(/([A-Za-z()\/\s]+)$/)
                          if (unitMatch) f().satuanVolumeObat = unitMatch[1].trim()
                        }
                      }}
                    />
                  ) : (
                    <PerkebunanFormInput
                      modelValue={f().namaObat}
                      placeholder="Contoh: Ekstrak Nimba"
                      onUpdate:modelValue={(val) => { f().namaObat = val }}
                    />
                  )}
                </div>

                {medicineRecommendation.value && (
                  <div style="background-color: #f6f8ee; border: 1.5px solid #dce1d0; border-radius: 0.75rem; padding: 1.25rem; margin-top: 0.5rem; margin-bottom: 1.25rem; text-align: left;">
                    <div style="margin-bottom: 0.75rem;">
                      <h4 style="margin: 0 0 0.2rem 0; font-size: 0.95rem; font-weight: 800; color: #2e3b1f;">Rekomendasi Pemberian Obat</h4>
                      <p style="margin: 0; font-size: 0.8rem; color: #5c6650; font-weight: 600; line-height: 1.4;">
                        Rekomendasi takaran obat untuk varietas {medicineRecommendation.value.varietas} ({medicineRecommendation.value.fase}):
                      </p>
                    </div>

                    {/* Grid of details */}
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.65rem; margin-top: 0.75rem;">
                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                          Obat Terpilih
                        </span>
                        <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">
                          {medicineRecommendation.value.obat}
                        </strong>
                      </div>

                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                          Teknik Pemberian
                        </span>
                        <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">
                          {medicineRecommendation.value.teknik}
                        </strong>
                      </div>

                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                          Dosis Rekomendasi
                        </span>
                        <strong style="font-size: 0.9rem; color: #059669; margin-top: 0.15rem;">
                          {medicineRecommendation.value.dosis}
                        </strong>
                      </div>

                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                          Estimasi ({medicineRecommendation.value.treeCount} Pohon)
                        </span>
                        <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">
                          {medicineRecommendation.value.total}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Volume Obat</span>
                  <PerkebunanFormInput
                    modelValue={f().volumeObat}
                    placeholder="Contoh: 20"
                    onUpdate:modelValue={(val) => { f().volumeObat = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Satuan Volume</span>
                  <PerkebunanFormSelect
                    modelValue={f().satuanVolumeObat}
                    options={['Mililiter (ml)', 'Liter (L)']}
                    placeholder="Satuan Volume"
                    onUpdate:modelValue={(val) => { f().satuanVolumeObat = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Teknik Pemberian Obat</span>
                  <PerkebunanFormSelect
                    modelValue={f().teknikPemberianObat}
                    options={['Semprot', 'Kocor', 'Siram', 'Oles']}
                    placeholder="Teknik Pemberian Obat"
                    onUpdate:modelValue={(val) => { f().teknikPemberianObat = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Volume Larutan</span>
                  <PerkebunanFormInput
                    modelValue={f().volumeLarutan}
                    placeholder="Contoh: 20"
                    onUpdate:modelValue={(val) => { f().volumeLarutan = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Satuan Volume</span>
                  <PerkebunanFormSelect
                    modelValue={f().satuanVolumeLarutan}
                    options={['Mililiter (ml)', 'Liter (L)']}
                    placeholder="Satuan Volume"
                    onUpdate:modelValue={(val) => { f().satuanVolumeLarutan = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={f().deskripsiPerawatan}
                    type="textarea"
                    placeholder="Catatan"
                    onUpdate:modelValue={(val) => { f().deskripsiPerawatan = val }}
                  />
                </div>
              </>
            )
          })()}

          {props.kindTitle === 'Pemangkasan' && (
            <>
              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Metode Pemangkasan</span>
                <PerkebunanFormSelect
                  modelValue={f().metodePemangkasan}
                  options={['Pemangkasan Bentuk', 'Pemangkasan Produksi', 'Pemangkasan Peremajaan']}
                  placeholder="Metode Pemangkasan"
                  onUpdate:modelValue={(val) => { f().metodePemangkasan = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Total Pemangkasan</span>
                <PerkebunanFormInput
                  modelValue={f().jumlahPemangkasan}
                  placeholder="Contoh: 15"
                  onUpdate:modelValue={(val) => { f().jumlahPemangkasan = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Satuan</span>
                <PerkebunanFormSelect
                  modelValue={f().satuanBerat}
                  options={['Kilogram (Kg)', 'Gram (g)']}
                  placeholder="Satuan Berat"
                  onUpdate:modelValue={(val) => { f().satuanBerat = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Tujuan Pemanfaatan</span>
                <PerkebunanFormSelect
                  modelValue={f().tujuanPemanfaatan}
                  options={['Pakan Ternak', 'Kompos', 'Dibuang']}
                  placeholder="Pemanfaatan"
                  onUpdate:modelValue={(val) => { f().tujuanPemanfaatan = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                <PerkebunanFormInput
                  modelValue={f().deskripsiPemangkasan}
                  type="textarea"
                  placeholder="Contoh: kendala, kondisi dan lain lain"
                  onUpdate:modelValue={(val) => { f().deskripsiPemangkasan = val }}
                />
              </div>
            </>
          )}

          {props.kindTitle === 'Pemupukan' && (() => {
            const isCair = rincian.toLowerCase().includes('cair')
            const isOrganik = rincian.toLowerCase().includes('organik')
            let volumeLabel = 'Dosis Pupuk (Gram)'
            if (isCair) {
              volumeLabel = 'Volume Pupuk (Liter)'
            } else if (isOrganik) {
              volumeLabel = 'Jumlah Pupuk Dipakai (Kilogram)'
            }
            const volumePlaceholder = 'Contoh: 2'

            return (
              <>
                {props.activeMode === 'lahan' && (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Varietas</span>
                      <PerkebunanFormSelect
                        modelValue={props.selectedVarietas}
                        options={props.varietasOptions}
                        placeholder="Semua Varietas"
                        onUpdate:modelValue={(val) => emit('update:selectedVarietas', val)}
                      />
                    </div>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Fase Pohon</span>
                      <PerkebunanFormSelect
                        modelValue={f().fasePohon}
                        options={['Fase Pohon', 'Belum Produktif (0-3 tahun)', 'Produktif (>4 tahun)', 'Vegetatif', 'Generatif']}
                        placeholder="Fase Pohon"
                        onUpdate:modelValue={(val) => { f().fasePohon = val }}
                      />
                    </div>
                  </>
                )}

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pupuk yang Digunakan</span>
                  <PerkebunanFormSelect
                    modelValue={f().jenisPupukDetail}
                    options={props.pupukOptions}
                    placeholder="Pilih Pupuk"
                    onUpdate:modelValue={(val) => { f().jenisPupukDetail = val }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Teknik Pemupukan</span>
                  <PerkebunanFormSelect
                    modelValue={f().teknikPemupukan}
                    options={['Semprot', 'Kocor', 'Tebar', 'Tugal']}
                    placeholder="Teknik Pemupukan"
                    onUpdate:modelValue={(val) => { f().teknikPemupukan = val }}
                  />
                </div>

                {fertilizerRecommendation.value && (
                  <div style="background-color: #f6f8ee; border: 1.5px solid #dce1d0; border-radius: 0.75rem; padding: 1.25rem; margin-top: 0.5rem; margin-bottom: 1.25rem; text-align: left;">
                    <div style="margin-bottom: 0.75rem;">
                      <h4 style="margin: 0 0 0.2rem 0; font-size: 0.95rem; font-weight: 800; color: #2e3b1f;">Rekomendasi Pemupukan</h4>
                      <p style="margin: 0; font-size: 0.8rem; color: #5c6650; font-weight: 600; line-height: 1.4;">
                        Rekomendasi takaran pupuk untuk varietas {fertilizerRecommendation.value.varietas} ({fertilizerRecommendation.value.fase}):
                      </p>
                    </div>

                    {/* Grid of details */}
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.65rem; margin-top: 0.75rem;">
                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                          Pupuk Terpilih
                        </span>
                        <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">
                          {fertilizerRecommendation.value.pupuk}
                        </strong>
                      </div>

                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                          Teknik Pemupukan
                        </span>
                        <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">
                          {fertilizerRecommendation.value.teknik}
                        </strong>
                      </div>

                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                          Dosis Rekomendasi
                        </span>
                        <strong style="font-size: 0.9rem; color: #059669; margin-top: 0.15rem;">
                          {fertilizerRecommendation.value.dosis}
                        </strong>
                      </div>

                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                          Estimasi ({fertilizerRecommendation.value.treeCount} Pohon)
                        </span>
                        <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">
                          {fertilizerRecommendation.value.total}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">{volumeLabel}</span>
                  <PerkebunanFormInput
                    modelValue={f().jumlahBeratPupuk}
                    placeholder={volumePlaceholder}
                    onUpdate:modelValue={(val) => { f().jumlahBeratPupuk = val }}
                  />
                </div>

                {pupukComposition.value && (
                  <div style="background-color: #f6f8ee; border: 1.5px solid #dce1d0; border-radius: 0.75rem; padding: 1.25rem; margin-top: 0.5rem; margin-bottom: 1rem; text-align: left;">
                    <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.75rem;">
                      <span style="font-size: 1.25rem;">🧪</span>
                      <div>
                        <h4 style="margin: 0 0 0.2rem 0; font-size: 0.95rem; font-weight: 800; color: #2e3b1f;">Kandungan Racikan Fermentasi Pupuk</h4>
                        <p style="margin: 0; font-size: 0.8rem; color: #5c6650; font-weight: 600; line-height: 1.4;">
                          Berdasarkan racikan fermentasi standar untuk {f().jumlahBeratPupuk} {pupukComposition.value.type === 'cair' ? 'Liter' : 'Kg'} {f().jenisPupukDetail || 'Pupuk'}, pupuk ini terbuat dari:
                        </p>
                      </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.5rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 600;">{pupukComposition.value.materialLabel}</span>
                        <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">{pupukComposition.value.materialQty}</strong>
                      </div>
                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.5rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 600;">Air Bersih</span>
                        <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">{pupukComposition.value.waterQty}</strong>
                      </div>
                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.5rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 600;">Dekomposer (EM4)</span>
                        <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">{pupukComposition.value.decomposerQty}</strong>
                      </div>
                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.5rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 600;">Molase (Tetes Tebu)</span>
                        <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">{pupukComposition.value.molaseQty}</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={f().deskripsiPemupukan}
                    type="textarea"
                    placeholder="Contoh: kendala, kondisi dan lain lain"
                    onUpdate:modelValue={(val) => { f().deskripsiPemupukan = val }}
                  />
                </div>

                {isOrganik && Number(f().jumlahBeratPupuk) > 0 && (
                  <div style={`background-color: ${Number(f().jumlahBeratPupuk) > props.manureStock ? '#fff5f5' : '#f6f8ee'}; border: 1px solid ${Number(f().jumlahBeratPupuk) > props.manureStock ? '#ffe3e3' : '#dce1d0'}; border-radius: 0.5rem; padding: 1rem; margin-top: 0.5rem;`}>
                    <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                      <span style="font-size: 1.25rem;">{Number(f().jumlahBeratPupuk) > props.manureStock ? '⚠️' : '💡'}</span>
                      <div>
                        <h4 style={`margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 800; color: ${Number(f().jumlahBeratPupuk) > props.manureStock ? '#e03131' : '#2f3b1d'};`}>
                          {Number(f().jumlahBeratPupuk) > props.manureStock ? 'Peringatan Stok Kurang' : 'Prediksi Dosis Pemupukan'}
                        </h4>
                        <p style={`margin: 0; font-size: 0.85rem; font-weight: 600; color: ${Number(f().jumlahBeratPupuk) > props.manureStock ? '#c92a2a' : '#4f5d2e'}; line-height: 1.4;`}>
                          {Number(f().jumlahBeratPupuk) > props.manureStock 
                            ? `Jumlah yang Anda masukkan (${f().jumlahBeratPupuk} Kg) melebihi stok kotoran domba dari peternakan yang tersedia saat ini (${props.manureStock.toFixed(1)} Kg).`
                            : props.activeMode === 'pohon'
                              ? `Dengan total ${f().jumlahBeratPupuk} Kg untuk ${props.selectedTreesCount} pohon, maka setiap pohon akan mendapatkan dosis ${(Number(f().jumlahBeratPupuk) / props.selectedTreesCount).toFixed(2)} Kg/pohon.`
                              : `Anda menggunakan ${f().jumlahBeratPupuk} Kg dari stok pupuk organik (${props.manureStock.toFixed(1)} Kg) untuk seluruh lahan.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )
          })()}

          {props.kindTitle === 'Pembersihan' && (() => {
            const isPenyiangan = rincian === 'Penyiangan Gulma'
            const isPembumbunan = rincian === 'Pembumbunan Tanah'
            const isSanitasi = rincian === 'Sanitasi Serasah & Ranting'

            return (
              <>
                {props.activeMode === 'lahan' && (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Varietas</span>
                    <PerkebunanFormSelect
                      modelValue={props.selectedVarietas}
                      options={props.varietasOptions}
                      placeholder="Semua Varietas"
                      onUpdate:modelValue={(val) => emit('update:selectedVarietas', val)}
                    />
                  </div>
                )}

                {isPenyiangan && (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Alat Pembersihan</span>
                      <PerkebunanFormSelect
                        modelValue={f().alatPembersihan}
                        options={['Manual', 'Cangkul', 'Sarit', 'Mesin Potong Rumput']}
                        placeholder="Alat Pembersihan"
                        onUpdate:modelValue={(val) => { f().alatPembersihan = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Gulma</span>
                      <PerkebunanFormSelect
                        modelValue={f().jenisGulma}
                        options={['Tekian', 'Rerumputan', 'Gulma Daun Lebar', 'Lainnya']}
                        placeholder="Jenis Gulma"
                        onUpdate:modelValue={(val) => { f().jenisGulma = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Total Berat Gulma</span>
                      <PerkebunanFormInput
                        modelValue={f().beratGulma}
                        placeholder="Contoh: 20"
                        onUpdate:modelValue={(val) => { f().beratGulma = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Satuan Berat</span>
                      <PerkebunanFormSelect
                        modelValue={f().satuanBerat}
                        options={['Kilogram (Kg)', 'Gram (g)']}
                        placeholder="Satuan Berat"
                        onUpdate:modelValue={(val) => { f().satuanBerat = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pemanfaatan</span>
                      <PerkebunanFormSelect
                        modelValue={f().tujuanPemanfaatan}
                        options={['Pakan Ternak', 'Kompos', 'Dibuang']}
                        placeholder="Pemanfaatan"
                        onUpdate:modelValue={(val) => { f().tujuanPemanfaatan = val }}
                      />
                    </div>
                  </>
                )}

                {isPembumbunan && (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Bahan Pembumbun</span>
                      <PerkebunanFormSelect
                        modelValue={f().bahanPembumbun}
                        options={['Tanah Humus', 'Tanah Kompos', 'Tanah Galian Lahan']}
                        placeholder="Bahan Pembumbunan"
                        onUpdate:modelValue={(val) => { f().bahanPembumbun = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Total Berat Bahan Pembumbun</span>
                      <PerkebunanFormInput
                        modelValue={f().beratBahanPembumbun}
                        placeholder="Contoh: 20"
                        onUpdate:modelValue={(val) => { f().beratBahanPembumbun = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Satuan Berat</span>
                      <PerkebunanFormSelect
                        modelValue={f().satuanBerat}
                        options={['Kilogram (Kg)', 'Gram (g)']}
                        placeholder="Satuan Berat"
                        onUpdate:modelValue={(val) => { f().satuanBerat = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pemanfaatan</span>
                      <PerkebunanFormSelect
                        modelValue={f().tujuanPemanfaatan}
                        options={['Pakan Ternak', 'Kompos', 'Dibuang']}
                        placeholder="Pemanfaatan"
                        onUpdate:modelValue={(val) => { f().tujuanPemanfaatan = val }}
                      />
                    </div>
                  </>
                )}

                {isSanitasi && (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Bagian Pembersihan</span>
                      <PerkebunanFormSelect
                        modelValue={f().bagianPembersihan}
                        options={['Serasah Daun', 'Ranting/Cabang Mati', 'Batang Pohon', 'Lainnya']}
                        placeholder="Bagian Pembersihan"
                        onUpdate:modelValue={(val) => { f().bagianPembersihan = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Total Berat</span>
                      <PerkebunanFormInput
                        modelValue={f().beratLimbah}
                        placeholder="Contoh: 20"
                        onUpdate:modelValue={(val) => { f().beratLimbah = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Satuan Berat</span>
                      <PerkebunanFormSelect
                        modelValue={f().satuanBerat}
                        options={['Kilogram (Kg)', 'Gram (g)']}
                        placeholder="Satuan Berat"
                        onUpdate:modelValue={(val) => { f().satuanBerat = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pemanfaatan</span>
                      <PerkebunanFormSelect
                        modelValue={f().tujuanPemanfaatan}
                        options={['Pakan Ternak', 'Kompos', 'Dibuang']}
                        placeholder="Pemanfaatan"
                        onUpdate:modelValue={(val) => { f().tujuanPemanfaatan = val }}
                      />
                    </div>
                  </>
                )}

                {!isPenyiangan && !isPembumbunan && !isSanitasi && (
                  <>
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Limbah</span>
                      <PerkebunanFormSelect
                        modelValue={f().jenisLimbah}
                        options={['Guguran Daun', 'Ranting Kering', 'Rumput Liar (Gulma)', 'Limbah Buah Busuk']}
                        placeholder="Jenis Limbah"
                        onUpdate:modelValue={(val) => { f().jenisLimbah = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Total Berat Limbah (Kg)</span>
                      <PerkebunanFormInput
                        modelValue={f().beratLimbah}
                        placeholder="Contoh: 2"
                        onUpdate:modelValue={(val) => { f().beratLimbah = val }}
                      />
                    </div>
                  </>
                )}

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={f().deskripsiPembersihan}
                    type="textarea"
                    placeholder="Catatan"
                    onUpdate:modelValue={(val) => { f().deskripsiPembersihan = val }}
                  />
                </div>
              </>
            )
          })()}

          {props.kindTitle === 'Pembuahan' && (() => {
            const r = rincian.toLowerCase()
            const isMerangsang = r.includes('merangsang') || r.includes('perangsang')
            const isPenjarangan = r.includes('penjarangan')
            const isPembungkusan = r.includes('pembungkusan')

            if (isMerangsang) {
              return (
                <>
                  <div class="form-group">
                    <span class="field-label">Metode Perlakuan</span>
                    <PerkebunanFormSelect
                      modelValue={f().metodePerlakuan}
                      options={['Semprot Daun', 'Kocor Akar', 'Oles Batang', 'Foliar Spray']}
                      placeholder="Metode Perlakuan"
                      onUpdate:modelValue={(val) => { f().metodePerlakuan = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Masukkan Jenis Hormon (Opsional)</span>
                    <PerkebunanFormInput
                      modelValue={f().jenisHormon}
                      placeholder="Contoh: ZPT"
                      onUpdate:modelValue={(val) => { f().jenisHormon = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Catatan (Opsional)</span>
                    <PerkebunanFormInput
                      modelValue={f().deskripsiPembuahan}
                      type="textarea"
                      placeholder="Catatan"
                      onUpdate:modelValue={(val) => { f().deskripsiPembuahan = val }}
                    />
                  </div>
                </>
              )
            }

            if (isPenjarangan) {
              return (
                <>
                  <div class="form-group">
                    <span class="field-label">Diameter Buah Saat Dijarangkan</span>
                    <PerkebunanFormInput
                      modelValue={f().diameterBuah}
                      type="number"
                      placeholder="Contoh: 3"
                      onUpdate:modelValue={(val) => { f().diameterBuah = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Satuan Diameter</span>
                    <PerkebunanFormSelect
                      modelValue={f().satuanDiameter}
                      options={['Centimeter (cm)', 'Milimeter (mm)']}
                      placeholder="Satuan Diameter"
                      onUpdate:modelValue={(val) => { f().satuanDiameter = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Masukkan Jumlah Buah Dibuang</span>
                    <PerkebunanFormInput
                      modelValue={f().jumlahBuahDibuang}
                      type="number"
                      placeholder="Contoh: 3"
                      onUpdate:modelValue={(val) => { f().jumlahBuahDibuang = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Masukkan Sisa Buah per Tandan</span>
                    <PerkebunanFormInput
                      modelValue={f().sisaBuahPerTandan}
                      type="number"
                      placeholder="Contoh: 3"
                      onUpdate:modelValue={(val) => { f().sisaBuahPerTandan = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Catatan (Opsional)</span>
                    <PerkebunanFormInput
                      modelValue={f().deskripsiPembuahan}
                      type="textarea"
                      placeholder="Catatan"
                      onUpdate:modelValue={(val) => { f().deskripsiPembuahan = val }}
                    />
                  </div>
                </>
              )
            }

            if (isPembungkusan) {
              return (
                <>
                  <div class="form-group">
                    <span class="field-label">Bahan Pembungkus</span>
                    <PerkebunanFormSelect
                      modelValue={f().bahanPembungkus}
                      options={['Kantong Kertas', 'Kantong Plastik', 'Sarung Buah', 'Net Bag']}
                      placeholder="Bahan Pembungkus"
                      onUpdate:modelValue={(val) => { f().bahanPembungkus = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Masukkan Jumlah Buah / Malai yang Dibungkus</span>
                    <PerkebunanFormInput
                      modelValue={f().jumlahBuahDibungkus}
                      type="number"
                      placeholder="Contoh: 3"
                      onUpdate:modelValue={(val) => { f().jumlahBuahDibungkus = val }}
                    />
                  </div>
                  <div class="form-group">
                    <span class="field-label">Catatan (Opsional)</span>
                    <PerkebunanFormInput
                      modelValue={f().deskripsiPembuahan}
                      type="textarea"
                      placeholder="Catatan"
                      onUpdate:modelValue={(val) => { f().deskripsiPembuahan = val }}
                    />
                  </div>
                </>
              )
            }

            return null
          })()}

          {props.kindTitle === 'Panen' && (
            <>
              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Kondisi Panen</span>
                <PerkebunanFormSelect
                  modelValue={f().kondisiPanen}
                  options={['Matang Optimal', 'Terlalu Matang', 'Kurang Matang', 'Cacat / Rusak']}
                  placeholder="Kondisi Panen"
                  onUpdate:modelValue={(val) => { f().kondisiPanen = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Cara Panen</span>
                <PerkebunanFormSelect
                  modelValue={f().caraPanen}
                  options={['Petik Manual', 'Petik dengan Galah', 'Jaring Bawah', 'Gunting Panen']}
                  placeholder="Cara Panen"
                  onUpdate:modelValue={(val) => { f().caraPanen = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Jumlah Buah</span>
                <PerkebunanFormInput
                  modelValue={f().jumlahPanen}
                  placeholder="Contoh: 15"
                  onUpdate:modelValue={(val) => { f().jumlahPanen = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Total Berat Buah</span>
                <PerkebunanFormInput
                  modelValue={f().beratPanen}
                  placeholder="Contoh: 2"
                  onUpdate:modelValue={(val) => { f().beratPanen = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Satuan Berat</span>
                <PerkebunanFormSelect
                  modelValue={f().satuanBerat}
                  options={['Kilogram (Kg)', 'Gram (g)', 'Ton']}
                  placeholder="Satuan Berat"
                  onUpdate:modelValue={(val) => { f().satuanBerat = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                <PerkebunanFormInput
                  modelValue={f().deskripsiPanen}
                  type="textarea"
                  placeholder="Catatan"
                  onUpdate:modelValue={(val) => { f().deskripsiPanen = val }}
                />
              </div>
            </>
          )}
          {props.kindTitle === 'Penyiraman' && (
            <>
              {props.activeMode === 'lahan' && (
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Varietas</span>
                  <PerkebunanFormSelect
                    modelValue={props.selectedVarietas}
                    options={props.varietasOptions}
                    placeholder="Semua Varietas"
                    onUpdate:modelValue={(val) => emit('update:selectedVarietas', val)}
                  />
                </div>
              )}



              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Volume Air</span>
                <PerkebunanFormInput
                  modelValue={f().volumeAir}
                  placeholder="Contoh: 15"
                  onUpdate:modelValue={(val) => { f().volumeAir = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Satuan Volume</span>
                <PerkebunanFormSelect
                  modelValue={f().satuanVolumeAir}
                  options={['Liter (L)', 'Mililiter (ml)']}
                  placeholder="Satuan Volume"
                  onUpdate:modelValue={(val) => { f().satuanVolumeAir = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Sesi Penyiraman</span>
                <PerkebunanFormSelect
                  modelValue={f().sesiPenyiraman}
                  options={['Semua Sesi', 'Pagi', 'Siang', 'Sore']}
                  placeholder="Sesi Penyiraman"
                  onUpdate:modelValue={(val) => { f().sesiPenyiraman = val }}
                />
              </div>

              <div class="form-group">
                <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                <PerkebunanFormInput
                  modelValue={f().deskripsiPenyiraman}
                  type="textarea"
                  placeholder="Catatan"
                  onUpdate:modelValue={(val) => { f().deskripsiPenyiraman = val }}
                />
              </div>
            </>
          )}

          {props.kindTitle === 'Stok Obat' && (() => {
            const r = props.selectedRincian
            const isNewRegistration = r === 'Pendaftaran Obat Baru'

            return (
              <>
                {/* 1. Jenis Obat */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Obat</span>
                  <PerkebunanFormSelect
                    modelValue={f().jenisObat}
                    options={['Pestisida', 'Insektisida', 'Fungisida']}
                    placeholder="Jenis Obat"
                    onUpdate:modelValue={(val) => { f().jenisObat = val }}
                  />
                </div>

                {/* 2. Name Field */}
                {isNewRegistration ? (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Nama Obat Baru</span>
                    <PerkebunanFormInput
                      modelValue={f().namaObat}
                      placeholder="Contoh: Ekstrak Nimba"
                      onUpdate:modelValue={(val) => { f().namaObat = val }}
                    />
                  </div>
                ) : (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Nama Obat</span>
                    <PerkebunanFormSelect
                      modelValue={f().namaObat}
                      options={props.obatStocks ? props.obatStocks.map((o: any) => o.name) : []}
                      placeholder="Pilih Obat"
                      onUpdate:modelValue={(val) => { 
                        f().namaObat = val 
                        const found = props.obatStocks?.find((o: any) => o.name === val)
                        if (found) {
                          if (found.type) {
                            const capitalizedType = found.type.charAt(0).toUpperCase() + found.type.slice(1);
                            if (['Pestisida', 'Insektisida', 'Fungisida'].includes(capitalizedType)) {
                              f().jenisObat = capitalizedType
                            }
                          }
                          const qtyStr = found.qty || ''
                          const unitMatch = qtyStr.match(/[a-zA-Z]+/g)
                          if (unitMatch) {
                            const rawUnit = unitMatch[0].toLowerCase()
                            if (rawUnit === 'ml') f().satuanVolumeObat = 'Mililiter (ml)'
                            else if (rawUnit === 'g') f().satuanVolumeObat = 'Gram (g)'
                            else if (rawUnit === 'l') f().satuanVolumeObat = 'Liter (L)'
                            else if (rawUnit === 'kg') f().satuanVolumeObat = 'Kilogram (Kg)'
                          }
                        }
                      }}
                    />
                  </div>
                )}

                {/* 3. Amount Field */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">
                    {isNewRegistration ? 'Masukkan Jumlah Stok Awal' : 'Masukkan Jumlah Tambahan Stok'}
                  </span>
                  <PerkebunanFormInput
                    modelValue={f().volumeObat}
                    placeholder="Contoh: 2"
                    onUpdate:modelValue={(val) => { f().volumeObat = val }}
                  />
                </div>

                {/* 4. Unit Selection */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Satuan</span>
                  <PerkebunanFormSelect
                    modelValue={f().satuanVolumeObat}
                    options={['Mililiter (ml)', 'Gram (g)', 'Liter (L)', 'Kilogram (Kg)']}
                    placeholder="Satuan"
                    onUpdate:modelValue={(val) => { f().satuanVolumeObat = val }}
                  />
                </div>

                {/* 5. Expiry Date */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Tanggal Kadaluarsa</span>
                  <PerkebunanFormInput
                    modelValue={f().tanggalKadaluarsa}
                    type="date"
                    placeholder="mm/dd/yyyy"
                    onUpdate:modelValue={(val) => { f().tanggalKadaluarsa = val }}
                  />
                </div>

                {/* 6. Catatan */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={f().catatanStok}
                    type="textarea"
                    placeholder="Catatan"
                    onUpdate:modelValue={(val) => { f().catatanStok = val }}
                  />
                </div>
              </>
            )
          })()}

          {props.kindTitle === 'Stok Pupuk' && (() => {
            const r = props.selectedRincian
            const isBahanOnly = r === 'Tambah Stok Bahan'
            const isPupukOnly = r === 'Tambah Stok Pupuk (Exp Lama)'
            const isNewRegistration = r === 'Pendaftaran Pupuk/Bahan Baru'

            return (
              <>
                {/* 1. Destination Usage (Pilih Tujuan Pemanfaatan / Penggunaan Stok) */}
                {isNewRegistration ? (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Tujuan Penggunaan Stok</span>
                    <PerkebunanFormSelect
                      modelValue={f().tujuanPemanfaatan}
                      options={[
                        { value: 'pupuk', label: 'Stok Pupuk' },
                        { value: 'bahan', label: 'Stok Bahan' }
                      ]}
                      placeholder="Peruntukan"
                      onUpdate:modelValue={(val) => { 
                        f().tujuanPemanfaatan = val 
                        // reset related fields
                        f().namaObat = ''
                        f().kategoriBahan = ''
                      }}
                    />
                  </div>
                ) : (
                  // Auto-set for other options
                  (() => {
                    if (isBahanOnly) f().tujuanPemanfaatan = 'bahan'
                    if (isPupukOnly) f().tujuanPemanfaatan = 'pupuk'
                    return null
                  })()
                )}

                {/* 2. Kategori Bahan (Only if destination is 'bahan' / Stok Bahan) */}
                {f().tujuanPemanfaatan === 'bahan' && (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Kategori Bahan</span>
                    <PerkebunanFormSelect
                      modelValue={f().kategoriBahan}
                      options={[
                        { value: 'Bahan Mentah', label: 'Bahan Mentah' },
                        { value: 'Dekomposer', label: 'Bahan Dekomposer' },
                        { value: 'Molase', label: 'Bahan Molase' },
                        { value: 'Bahan Tambahan', label: 'Bahan Tambahan' }
                      ]}
                      placeholder="Pilih Kategori Bahan"
                      onUpdate:modelValue={(val) => { f().kategoriBahan = val }}
                    />
                  </div>
                )}

                {/* 3. Jenis Pupuk (Only if destination is 'pupuk' / Stok Pupuk) */}
                {f().tujuanPemanfaatan === 'pupuk' && (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Pupuk</span>
                    <PerkebunanFormSelect
                      modelValue={f().jenisPupuk}
                      options={['Pupuk Organik Cair', 'Pupuk Organik Padat', 'Pupuk Kimia']}
                      placeholder="Jenis Pupuk"
                      onUpdate:modelValue={(val) => { 
                        f().jenisPupuk = val 
                        // Prefill default units based on fertilizer type
                        if (val === 'Pupuk Organik Cair') {
                          f().satuanVolumeObat = 'Liter (L)'
                        } else {
                          f().satuanVolumeObat = 'Kilogram (Kg)'
                        }
                      }}
                    />
                  </div>
                )}

                {/* 4. Name Field (Text input for manual/new, Dropdown for existing) */}
                {isNewRegistration ? (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">
                      {f().tujuanPemanfaatan === 'bahan' ? 'Masukkan Nama Bahan Baru' : 'Masukkan Nama Pupuk Baru'}
                    </span>
                    <PerkebunanFormInput
                      modelValue={f().namaObat}
                      placeholder={f().tujuanPemanfaatan === 'bahan' ? 'Contoh: Kulit Kopi' : 'Contoh: Pupuk Kandang Kambing'}
                      onUpdate:modelValue={(val) => { f().namaObat = val }}
                    />
                  </div>
                ) : (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">
                      {f().tujuanPemanfaatan === 'bahan' ? 'Nama Bahan' : 'Nama Pupuk'}
                    </span>
                    {f().tujuanPemanfaatan === 'bahan' ? (
                      <PerkebunanFormSelect
                        modelValue={f().namaObat}
                        options={bahanOptions.value}
                        placeholder="Pilih Bahan"
                        onUpdate:modelValue={(val) => { f().namaObat = val }}
                      />
                    ) : (
                      <PerkebunanFormSelect
                        modelValue={f().namaObat}
                        options={props.pupukOptions}
                        placeholder="Pilih Pupuk"
                        onUpdate:modelValue={(val) => { f().namaObat = val }}
                      />
                    )}
                  </div>
                )}

                {/* 5. Amount Input */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">
                    {isNewRegistration ? 'Masukkan Jumlah Stok Awal' : 'Masukkan Jumlah Tambahan Stok'}
                  </span>
                  <PerkebunanFormInput
                    modelValue={f().volumeObat}
                    placeholder="Contoh: 10"
                    onUpdate:modelValue={(val) => { f().volumeObat = val }}
                  />
                </div>

                {/* 6. Unit Selection */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Satuan</span>
                  {f().tujuanPemanfaatan === 'bahan' ? (
                    <PerkebunanFormSelect
                      modelValue={f().satuanVolumeObat}
                      options={['Kilogram (kg)', 'Gram (g)', 'Liter (L)', 'Mililiter (ml)']}
                      placeholder="Satuan"
                      onUpdate:modelValue={(val) => { f().satuanVolumeObat = val }}
                    />
                  ) : (
                    f().jenisPupuk === 'Pupuk Organik Cair' ? (
                      <PerkebunanFormSelect
                        modelValue={f().satuanVolumeObat}
                        options={['Mililiter (ml)', 'Liter (L)']}
                        placeholder="Satuan"
                        onUpdate:modelValue={(val) => { f().satuanVolumeObat = val }}
                      />
                    ) : (
                      <PerkebunanFormSelect
                        modelValue={f().satuanVolumeObat}
                        options={['Gram (g)', 'Kilogram (Kg)']}
                        placeholder="Satuan"
                        onUpdate:modelValue={(val) => { f().satuanVolumeObat = val }}
                      />
                    )
                  )}
                </div>

                {/* 7. Expiry Date (Only for pupuk/fertilizer when exp is new) */}
                {f().tujuanPemanfaatan === 'pupuk' && (r === 'Pendaftaran Pupuk/Bahan Baru' || r === 'Tambah Stok Pupuk (Exp Lama)') && (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Tanggal Kadaluarsa</span>
                    <PerkebunanFormInput
                      modelValue={f().tanggalKadaluarsa}
                      type="date"
                      placeholder="mm/dd/yyyy"
                      onUpdate:modelValue={(val) => { f().tanggalKadaluarsa = val }}
                    />
                  </div>
                )}

                {/* 8. Catatan */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={f().catatanStok}
                    type="textarea"
                    placeholder="Catatan"
                    onUpdate:modelValue={(val) => { f().catatanStok = val }}
                  />
                </div>
              </>
            )
          })()}

          {props.kindTitle === 'Stok Pakan' && (() => {
            const isMasuk = rincian.includes('Masuk') || rincian.includes('Tambah')
            return (
              <>
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">
                    {isMasuk ? 'Jumlah Masuk (Kg)' : 'Jumlah Keluar (Kg)'}
                  </span>
                  <PerkebunanFormInput
                    modelValue={isMasuk ? f().jumlahStokMasuk : f().jumlahStokKeluar}
                    placeholder="Contoh: 50"
                    type="number"
                    onUpdate:modelValue={(val) => { 
                      if (isMasuk) f().jumlahStokMasuk = val;
                      else f().jumlahStokKeluar = val;
                    }}
                  />
                </div>

                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Catatan (Opsional)</span>
                  <PerkebunanFormInput
                    modelValue={f().catatanStok}
                    type="textarea"
                    placeholder="Contoh: Dari Supplier A"
                    onUpdate:modelValue={(val) => { f().catatanStok = val }}
                  />
                </div>
              </>
            )
          })()}

          {props.kindTitle === 'Pengolahan Pupuk' && (() => {
            const isCekFermentasi = (props.selectedRincian || '').toLowerCase() === 'cek fermentasi'

            const fermentationOptions = (props.allSubmissions || [])
              .filter((s: any) => {
                const payloadItem = s.payload?.data?.items?.[0]
                return s.type === 'pengolahan pupuk' && (payloadItem?.selectedRincian?.includes('Fermentasi') || payloadItem?.rincian?.includes('Fermentasi')) && !(payloadItem?.selectedRincian?.includes('Cek') || payloadItem?.rincian?.includes('Cek'))
              })
              .map((s: any) => {
                const payloadItem = s.payload?.data?.items?.[0]
                const tgl = s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
                return {
                  value: String(s.id || ''),
                  label: `Fermentasi ${tgl} | Hasil Jadi: ${payloadItem?.hasilJadi || '-'}`
                }
              })

            return (
              <>
                {/* A. PRODUCTION FORMS (Fermentasi Pupuk) */}
                {!isCekFermentasi && (
                  <>
                    {/* 1. Hasil Jadi Selection */}
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Pupuk</span>
                      <PerkebunanFormSelect
                        modelValue={f().hasilJadi}
                        options={fertilizerTypesOptions.value}
                        placeholder="Jenis Pupuk"
                        onUpdate:modelValue={(val) => { f().hasilJadi = val }}
                      />
                    </div>

                    {f().hasilJadi === 'ADD_NEW' && (
                      <div class="form-group" style="margin-top: -0.25rem; margin-bottom: 1rem; background: #f9fafb; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
                        <span class="field-label" style="font-weight: 600; color: #374151; display: block; margin-bottom: 0.25rem; font-size: 0.85rem;">Nama Jenis Pupuk Baru</span>
                        <div style="display: flex; gap: 0.5rem;">
                          <PerkebunanFormInput
                            modelValue={newFertilizerName.value}
                            placeholder="Contoh: Pupuk Organik Super"
                            onUpdate:modelValue={(val) => { newFertilizerName.value = val }}
                            style="flex: 1;"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNewFertilizer(true)}
                            disabled={!newFertilizerName.value.trim()}
                            style="padding: 0.5rem 1rem; background-color: #2e3b1f; color: white; border: none; border-radius: 0.375rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: background 0.2s;"
                            onMouseover={(e) => { if (e.currentTarget) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1f2915'; }}
                            onMouseout={(e) => { if (e.currentTarget) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2e3b1f'; }}
                          >
                            Simpan
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 3. Bahan Mentah Select (Based on Jenis Pupuk) */}
                    {f().hasilJadi && f().hasilJadi !== 'ADD_NEW' && (
                      <div class="form-group">
                        <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Bahan Mentah</span>
                        <PerkebunanFormSelect
                          modelValue={f().bahanMentahId}
                          options={bahanMentahOptions.value}
                          placeholder="Pilih Bahan Mentah"
                          onUpdate:modelValue={(val) => { f().bahanMentahId = val }}
                        />
                      </div>
                    )}

                    {/* 13. Jumlah Pupuk yang Digunakan */}
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">
                        Jumlah Pupuk yang Dibuat
                      </span>
                      <PerkebunanFormInput
                        modelValue={f().qty}
                        placeholder="0.0"
                        type="number"
                        onUpdate:modelValue={(val) => { f().qty = val }}
                      />
                    </div>

                    {/* 14. Pilih Satuan */}
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Satuan</span>
                      <PerkebunanFormSelect
                        modelValue={f().unit}
                        options={(f().hasilJadi || '').toLowerCase().includes('cair') ? ['Liter', 'botol'] : ['kg', 'karung']}
                        placeholder="Pilih Satuan"
                        onUpdate:modelValue={(val) => { f().unit = val }}
                      />
                    </div>

                    {/* 5. Recommendation Box (Moved directly after Bahan Mentah) */}
                    {fermentationRecommendation.value && (
                      <div style="background-color: #f6f8ee; border: 1.5px solid #dce1d0; border-radius: 0.75rem; padding: 1.25rem; margin-top: 0.5rem; margin-bottom: 1.25rem; text-align: left;">
                        <div style="margin-bottom: 0.75rem;">
                          <h4 style="margin: 0 0 0.2rem 0; font-size: 0.95rem; font-weight: 800; color: #2e3b1f;">Rekomendasi Takaran Bahan Fermentasi</h4>
                          <p style="margin: 0; font-size: 0.8rem; color: #5c6650; font-weight: 600; line-height: 1.4;">
                            Berdasarkan jenis pupuk dan bahan mentah yang Anda tentukan, berikut rekomendasi takaran per komponen:
                          </p>
                        </div>

                        {/* Ingredients Grid */}
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.65rem; margin-top: 0.75rem;">
                          {/* Bahan Mentah */}
                          <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                            <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                              Bahan Mentah
                            </span>
                            <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title={fermentationRecommendation.value.materialLabel}>
                              {fermentationRecommendation.value.materialUsed} kg ({fermentationRecommendation.value.materialLabel})
                            </strong>
                          </div>

                          {/* Dekomposer */}
                          <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                            <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                              Dekomposer
                            </span>
                            <strong style="font-size: 0.82rem; color: #2e3b1f; margin-top: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title={fermentationRecommendation.value.decomposerLabel}>
                              {fermentationRecommendation.value.decomposer} ml ({fermentationRecommendation.value.decomposerLabel})
                            </strong>
                          </div>

                          {/* Molase */}
                          <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                            <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                              Molase
                            </span>
                            <strong style="font-size: 0.82rem; color: #2e3b1f; margin-top: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title={fermentationRecommendation.value.molaseLabel}>
                              {fermentationRecommendation.value.molase} ml ({fermentationRecommendation.value.molaseLabel})
                            </strong>
                          </div>

                          {/* Air */}
                          <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                            <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                              Air Bersih
                            </span>
                            <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">
                              {fermentationRecommendation.value.water} Liter
                            </strong>
                          </div>

                          {/* Bahan Tambahan */}
                          {fermentationRecommendation.value.additional && (
                            <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                              <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
                                Bahan Tambahan
                              </span>
                              <strong style="font-size: 0.82rem; color: #2e3b1f; margin-top: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title={fermentationRecommendation.value.additional}>
                                {fermentationRecommendation.value.additional}
                              </strong>
                            </div>
                          )}
                        </div>

                        {/* Divider */}
                        <div style="border-top: 1px dashed #ebdcb9; margin: 1rem 0;"></div>

                        {/* Estimasi & Panduan Cek Fermentasi */}
                        <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.65rem; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem;">
                          <div style="font-size: 0.82rem; color: #2e3b1f; font-weight: 800; display: flex; align-items: center; gap: 0.35rem;">
                            Estimasi & Jadwal Cek Fermentasi
                          </div>
                          <div style="font-size: 0.78rem; color: #4e5a3e; font-weight: 600; line-height: 1.4;">
                            <strong>Estimasi Waktu:</strong> {fermentationRecommendation.value.durationText}
                          </div>
                          <div style="font-size: 0.78rem; color: #4e5a3e; font-weight: 600; line-height: 1.45;">
                            <strong>Jadwal Cek Fermentasi:</strong> {fermentationRecommendation.value.checkingText}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 8. Dekomposer */}
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Dekomposer (Opsional)</span>
                      <PerkebunanFormSelect
                        modelValue={f().dekomposer}
                        options={decomposerOptions.value}
                        placeholder="Pilih Dekomposer"
                        onUpdate:modelValue={(val) => { f().dekomposer = val }}
                      />
                    </div>

                    {/* 9. Molase */}
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Molase (Opsional)</span>
                      <PerkebunanFormSelect
                        modelValue={f().molase}
                        options={molaseOptions.value}
                        placeholder="Pilih Molase"
                        onUpdate:modelValue={(val) => { f().molase = val }}
                      />
                    </div>


                    {/* 11. Additional Materials */}
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Bahan Tambahan (Opsional)</span>
                      <PerkebunanFormSelect
                        modelValue={f().bahanTambahan}
                        options={bahanTambahanOptions.value}
                        placeholder="Pilih Bahan Tambahan"
                        onUpdate:modelValue={(val) => { f().bahanTambahan = val }}
                      />
                    </div>

                    {/* 10. Water (Jumlah Air & Satuan Air) */}
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jumlah Air (Opsional)</span>
                      <PerkebunanFormInput
                        type="number"
                        modelValue={f().jumlahAir}
                        placeholder="0.0"
                        onUpdate:modelValue={(val) => { f().jumlahAir = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Satuan Air (Opsional)</span>
                      <PerkebunanFormSelect
                        modelValue={f().satuanVolumeAir}
                        options={[
                          { value: 'Liter (L)', label: 'Liter (L)' },
                          { value: 'Mililiter (ml)', label: 'Mililiter (ml)' }
                        ]}
                        placeholder="Pilih Satuan Air"
                        onUpdate:modelValue={(val) => { f().satuanVolumeAir = val }}
                      />
                    </div>
                  </>
                )}
                {/* B. CEK FERMENTASI FORM */}
                {isCekFermentasi && (
                  <>


                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Pupuk yang Dicek</span>
                      <PerkebunanFormSelect
                        modelValue={f().jenisFermentasi}
                        options={fertilizerTypesOptions.value}
                        placeholder="Pilih Jenis Pupuk"
                        onUpdate:modelValue={(val) => { 
                          f().jenisFermentasi = val 
                          f().batchFermentasiId = '' 
                        }}
                      />
                    </div>

                    {f().jenisFermentasi === 'ADD_NEW' && (
                      <div class="form-group" style="margin-top: -0.25rem; margin-bottom: 1rem; background: #f9fafb; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
                        <span class="field-label" style="font-weight: 600; color: #374151; display: block; margin-bottom: 0.25rem; font-size: 0.85rem;">Nama Jenis Pupuk Baru</span>
                        <div style="display: flex; gap: 0.5rem;">
                          <PerkebunanFormInput
                            modelValue={newFertilizerName.value}
                            placeholder="Contoh: Pupuk Organik Super"
                            onUpdate:modelValue={(val) => { newFertilizerName.value = val }}
                            style="flex: 1;"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNewFertilizer(false)}
                            disabled={!newFertilizerName.value.trim()}
                            style="padding: 0.5rem 1rem; background-color: #2e3b1f; color: white; border: none; border-radius: 0.375rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: background 0.2s;"
                            onMouseover={(e) => { if (e.currentTarget) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1f2915'; }}
                            onMouseout={(e) => { if (e.currentTarget) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2e3b1f'; }}
                          >
                            Simpan
                          </button>
                        </div>
                      </div>
                    )}

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Periode Pencatatan Fermentasi</span>
                      <PerkebunanFormSelect
                        modelValue={f().batchFermentasiId}
                        options={filteredFermentationPeriods.value}
                        placeholder={
                          !f().jenisFermentasi
                            ? "Pilih jenis fermentasi terlebih dahulu"
                            : filteredFermentationPeriods.value.length === 0
                              ? "Tidak ada periode fermentasi tersedia"
                              : "Pilih Periode Fermentasi"
                        }
                        disabled={!f().jenisFermentasi || filteredFermentationPeriods.value.length === 0}
                        onUpdate:modelValue={(val) => { f().batchFermentasiId = val }}
                      />
                    </div>

                    {/* Fermentation Recipe Information Lookup Box */}
                    {selectedFermentationDetails.value && (
                      <div style="background-color: #f6f8ee; border: 1.5px solid #dce1d0; border-radius: 0.75rem; padding: 1.25rem; margin-top: 0.5rem; margin-bottom: 1.25rem; text-align: left;">
                        <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.75rem;">
                          <span style="font-size: 1.25rem;">📄</span>
                          <div>
                            <h4 style="margin: 0 0 0.2rem 0; font-size: 0.95rem; font-weight: 800; color: #2e3b1f;">Informasi Racikan Fermentasi Terpilih</h4>
                            <p style="margin: 0; font-size: 0.8rem; color: #5c6650; font-weight: 600; line-height: 1.4;">
                              Berikut adalah rincian bahan yang digunakan pada pembuatan batch ini:
                            </p>
                          </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
                          <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.5rem 0.75rem; display: flex; flex-direction: column; grid-column: span 2;">
                            <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700;">Jumlah Hasil Fermentasi</span>
                            <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">
                              {selectedFermentationDetails.value.qty} {selectedFermentationDetails.value.unit}
                            </strong>
                          </div>
                          <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.5rem 0.75rem; display: flex; flex-direction: column;">
                            <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 600;">Bahan Mentah</span>
                            <strong style="font-size: 0.85rem; color: #2e3b1f; margin-top: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title={selectedFermentationDetails.value.bahanMentah}>
                              {selectedFermentationDetails.value.bahanMentah}
                            </strong>
                          </div>
                          <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.5rem 0.75rem; display: flex; flex-direction: column;">
                            <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 600;">Dekomposer</span>
                            <strong style="font-size: 0.85rem; color: #2e3b1f; margin-top: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title={selectedFermentationDetails.value.dekomposer}>
                              {selectedFermentationDetails.value.dekomposer}
                            </strong>
                          </div>
                          <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.5rem 0.75rem; display: flex; flex-direction: column;">
                            <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 600;">Molase</span>
                            <strong style="font-size: 0.85rem; color: #2e3b1f; margin-top: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title={selectedFermentationDetails.value.molase}>
                              {selectedFermentationDetails.value.molase}
                            </strong>
                          </div>
                          <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.5rem 0.75rem; display: flex; flex-direction: column;">
                            <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 600;">Bahan Tambahan</span>
                            <strong style="font-size: 0.85rem; color: #2e3b1f; margin-top: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title={selectedFermentationDetails.value.bahanTambahan}>
                              {selectedFermentationDetails.value.bahanTambahan}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )}

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Aktivitas Pengecekan / Perlakuan</span>
                      <PerkebunanFormSelect
                        modelValue={f().aktivitasPengecekan}
                        options={[
                          { value: 'Buka tutup wadah & buang akumulasi gas', label: 'Buka tutup wadah & buang akumulasi gas' },
                          { value: 'Pembalikan tumpukan bahan', label: 'Pembalikan tumpukan bahan' },
                          { value: 'Penyiraman air untuk menjaga kelembapan', label: 'Penyiraman air untuk menjaga kelembapan' },
                          { value: 'Pengecekan fisik rutin', label: 'Pengecekan fisik rutin' }
                        ]}
                        placeholder="Pilih Aktivitas"
                        onUpdate:modelValue={(val) => { f().aktivitasPengecekan = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Kondisi Fisik Terakhir</span>
                      <PerkebunanFormSelect
                        modelValue={f().kondisiFisik}
                        options={[
                          { value: 'Suhu hangat & lembap (Normal)', label: 'Suhu hangat & lembap (Normal)' },
                          { value: 'Aroma asam segar tape (Normal)', label: 'Aroma asam segar tape (Normal)' },
                          { value: 'Timbul miselium jamur putih (Normal)', label: 'Timbul miselium jamur putih (Normal)' },
                          { value: 'Suhu dingin & kering (Kurang lembap)', label: 'Suhu dingin & kering (Kurang lembap)' },
                          { value: 'Aroma busuk/menyengat (Kontaminasi/Gagal)', label: 'Aroma busuk/menyengat (Kontaminasi/Gagal)' },
                          { value: 'Berjamur hitam/hijau (Kontaminasi/Gagal)', label: 'Berjamur hitam/hijau (Kontaminasi/Gagal)' }
                        ]}
                        placeholder="Kondisi Fisik"
                        onUpdate:modelValue={(val) => { f().kondisiFisik = val }}
                      />
                    </div>

                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Status Kesiapan Pupuk</span>
                      <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 1rem; margin-top: 0.25rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; color: #1f2937; font-size: 0.95rem;">
                          <input
                            type="radio"
                            name="siapGuna"
                            value="siap"
                            checked={f().siapGuna === 'siap'}
                            onChange={() => { f().siapGuna = 'siap' }}
                            style="width: 1.2rem; height: 1.2rem; accent-color: #38431f; cursor: pointer;"
                          />
                          Ya, Siap Digunakan & Masuk ke Stok
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; color: #1f2937; font-size: 0.95rem;">
                          <input
                            type="radio"
                            name="siapGuna"
                            value="belum"
                            checked={f().siapGuna === 'belum'}
                            onChange={() => { f().siapGuna = 'belum' }}
                            style="width: 1.2rem; height: 1.2rem; accent-color: #38431f; cursor: pointer;"
                          />
                          Belum, Masih Proses Fermentasi
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; color: #ef4444; font-size: 0.95rem;">
                          <input
                            type="radio"
                            name="siapGuna"
                            value="gagal"
                            checked={f().siapGuna === 'gagal'}
                            onChange={() => { f().siapGuna = 'gagal' }}
                            style="width: 1.2rem; height: 1.2rem; accent-color: #ef4444; cursor: pointer;"
                          />
                          Gagal, Hapus Log Fermentasi
                        </label>
                      </div>
                    </div>

                    {/* Riwayat Pengecekan Batch ini */}
                    <div style="margin-top: 1.5rem; margin-bottom: 1rem; text-align: left;">
                      <h4 style="font-size: 0.95rem; font-weight: 800; color: #2e3b1f; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                        📋 Riwayat Pengecekan Batch Ini
                      </h4>
                      {checkingHistory.value.length === 0 ? (
                        <div style="background: #fdfdfd; border: 1.5px dashed #dce1d0; border-radius: 0.75rem; padding: 1.25rem; text-align: center; color: #7f8c70; font-size: 0.85rem; font-weight: 600;">
                          Belum ada riwayat pengecekan untuk batch ini.
                        </div>
                      ) : (
                        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                          {checkingHistory.value.map((hist: any, index: number) => (
                            <div key={hist.id || index} style="background: #ffffff; border: 1.5px solid #dce1d0; border-radius: 0.75rem; padding: 1rem; position: relative;">
                              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
                                <span style="font-size: 0.72rem; color: #7f8c70; font-weight: 700;">{hist.date}</span>
                                <span style={`font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: 9999px; text-transform: uppercase; ${hist.status === 'approved' ? 'background: #d1fae5; color: #065f46;' : hist.status === 'rejected' ? 'background: #fee2e2; color: #991b1b;' : 'background: #fef3c7; color: #92400e;'}`}>
                                  {hist.status === 'approved' ? 'Disetujui' : hist.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                </span>
                              </div>
                              <div style="font-size: 0.88rem; font-weight: 800; color: #2e3b1f; margin-bottom: 0.25rem;">
                                {hist.activity}
                              </div>
                              <div style="font-size: 0.8rem; font-weight: 600; color: #4e5a3e; margin-bottom: 0.25rem;">
                                <strong>Kondisi:</strong> {hist.condition}
                              </div>
                              <div style="font-size: 0.78rem; color: #7f8c70; font-style: italic; border-top: 1px solid #f3f4f6; padding-top: 0.35rem; margin-top: 0.35rem;">
                                <strong>Catatan:</strong> {hist.notes}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* C. SHARED NOTES / COMMENTS (For all) */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">
                    {isCekFermentasi ? 'Catatan Pengecekan (Opsional)' : 'Catatan / Keterangan Tambahan'}
                  </span>
                  <PerkebunanFormInput
                    modelValue={f().catatanStok}
                    type="textarea"
                    placeholder={isCekFermentasi ? 'Contoh: Muncul jamur putih tipis di permukaan...' : 'Contoh: kendala, kondisi suhu lingkungan, dll'}
                    onUpdate:modelValue={(val) => { f().catatanStok = val }}
                  />
                </div>
              </>
            )
          })()}
        </div>
      )
    }
  }
})
