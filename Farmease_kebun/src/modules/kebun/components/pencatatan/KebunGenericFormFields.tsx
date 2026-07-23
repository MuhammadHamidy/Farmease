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
    selectedPupukStock: { type: Number, default: 0 },
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
        { value: 'Pupuk Organik Cair', label: 'Pupuk Organik Cair (POC)' },
        { value: 'Urea', label: 'Pupuk Kimia - Urea (N)' },
        { value: 'SP-36', label: 'Pupuk Kimia - SP-36 (P₂O₅)' },
        { value: 'KCl', label: 'Pupuk Kimia - KCl (K₂O)' }
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
          { value: 'Air cucian beras (Metode Ragi Tape & Air Kelapa)', label: 'Air cucian beras (Metode Ragi Tape & Air Kelapa)' },
          { value: 'EM4 & Molase (Metode Kotoran Domba / Limbah Organik)', label: 'EM4 & Molase (Metode Kotoran Domba / Limbah Organik)' }
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
      const namesSet = new Set<string>()

      ;(props.bahanStocks || []).forEach((b: any) => {
        if (b.name) {
          const cat = (b.category || b.kategoriBahan || '').toLowerCase()
          const nameLower = b.name.toLowerCase()
          if (cat.includes('dekomposer') || nameLower.includes('em4') || nameLower.includes('mol') || nameLower.includes('dekomposer')) {
            namesSet.add(b.name)
          }
        }
      })

      ;(props.allSubmissions || []).forEach((s: any) => {
        if ((s.type || '').toLowerCase() === 'stok pupuk') {
          const item = s.payload?.data?.items?.[0] || {}
          if (item.tujuanPemanfaatan === 'bahan' && item.namaObat) {
            const cat = (item.kategoriBahan || '').toLowerCase()
            const nameLower = item.namaObat.toLowerCase()
            if (cat.includes('dekomposer') || nameLower.includes('em4') || nameLower.includes('mol') || nameLower.includes('dekomposer')) {
              namesSet.add(item.namaObat)
            }
          }
        }
      })

      if (namesSet.size === 0) {
        namesSet.add('EM4')
        namesSet.add('MOL (Mikroorganisme Lokal)')
      }

      namesSet.add('Lainnya')

      return Array.from(namesSet).map(name => {
        return { value: name, label: name }
      })
    })

    const molaseOptions = computed(() => {
      const namesSet = new Set<string>()

      ;(props.bahanStocks || []).forEach((b: any) => {
        if (b.name) {
          const cat = (b.category || b.kategoriBahan || '').toLowerCase()
          const nameLower = b.name.toLowerCase()
          if (cat.includes('molase') || nameLower.includes('molase') || nameLower.includes('tebu') || nameLower.includes('gula')) {
            namesSet.add(b.name)
          }
        }
      })

      ;(props.allSubmissions || []).forEach((s: any) => {
        if ((s.type || '').toLowerCase() === 'stok pupuk') {
          const item = s.payload?.data?.items?.[0] || {}
          if (item.tujuanPemanfaatan === 'bahan' && item.namaObat) {
            const cat = (item.kategoriBahan || '').toLowerCase()
            const nameLower = item.namaObat.toLowerCase()
            if (cat.includes('molase') || nameLower.includes('molase') || nameLower.includes('tebu') || nameLower.includes('gula')) {
              namesSet.add(item.namaObat)
            }
          }
        }
      })

      if (namesSet.size === 0) {
        namesSet.add('Tetes Tebu (Molase)')
        namesSet.add('Gula Merah')
      }

      namesSet.add('Lainnya')

      return Array.from(namesSet).map(name => {
        return { value: name, label: name }
      })
    })

    const bahanOptions = computed(() => {
      const names = (props.bahanStocks || []).map((b: any) => b.name)
      return names.length > 0 ? names : ['Kotoran Domba', 'EM4', 'Tetes Tebu (Molase)', 'Lainnya']
    })

    const checkingHistory = computed(() => {
      const batchId = f().batchFermentasiId
      if (!batchId) return []
      return (props.allSubmissions || [])
        .filter((s: any) => {
          const item = s.payload?.data?.items?.[0] || {}
          const typeLower = (s.type || '').toLowerCase()
          const isCheck = (typeLower === 'pengolahan pupuk' || typeLower === 'pengolahan_pupuk') && (item.selectedRincian === 'Cek Fermentasi' || item.rincian === 'Cek Fermentasi')
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

      // 1. From bahanStocks registered under 'Bahan Tambahan'
      ;(props.bahanStocks || []).forEach((b: any) => {
        if (b.name) {
          const cat = (b.category || b.kategoriBahan || '')
          if (cat === 'Bahan Tambahan') {
            namesSet.add(b.name)
          }
        }
      })

      // 2. From submissions registered under 'Bahan Tambahan'
      ;(props.allSubmissions || []).forEach((s: any) => {
        if ((s.type || '').toLowerCase() === 'stok pupuk') {
          const item = s.payload?.data?.items?.[0] || {}
          if (item.tujuanPemanfaatan === 'bahan' && item.kategoriBahan === 'Bahan Tambahan' && item.namaObat) {
            namesSet.add(item.namaObat)
          }
        }
      })

      // 3. Fallback to active stock materials with tujuanPemanfaatan === 'bahan' if no specific category match
      if (namesSet.size === 0) {
        ;(props.bahanStocks || []).forEach((b: any) => {
          if (b.name) namesSet.add(b.name)
        })
        ;(props.allSubmissions || []).forEach((s: any) => {
          if ((s.type || '').toLowerCase() === 'stok pupuk') {
            const item = s.payload?.data?.items?.[0] || {}
            if (item.tujuanPemanfaatan === 'bahan' && item.namaObat) {
              namesSet.add(item.namaObat)
            }
          }
        })
      }

      namesSet.add('Lainnya')

      return Array.from(namesSet).map(name => {
        const stockVal = getStockOf(name)
        const label = stockVal > 0 ? `${name} (Stok: ${stockVal.toFixed(1)})` : name
        return {
          value: name,
          label
        }
      })
    })

    const filteredObatOptions = computed(() => {
      const r = (props.selectedRincian || '').toLowerCase()

      const listPestisida = [
        'Minyak sereh wangi',
        'Nimba'
      ]

      const listFungisida = [
        'Trichoderma'
      ]

      if (r.includes('fungisida')) {
        return listFungisida
      } else if (r.includes('pestisida') || r.includes('insektisida') || r.includes('hama')) {
        return listPestisida
      }

      return [...listPestisida, ...listFungisida]
    })

    const filteredFermentationPeriods = computed(() => {
      const selectedJenis = f().jenisFermentasi
      if (!selectedJenis) return []

      return (props.allSubmissions || [])
        .filter((s: any) => {
          const item = s.payload?.data?.items?.[0] || {}
          const typeLower = (s.type || '').toLowerCase()
          const isFermentation = (typeLower === 'pengolahan pupuk' || typeLower === 'pengolahan_pupuk') && 
            (item.selectedRincian?.includes('Fermentasi') || item.rincian?.includes('Fermentasi')) &&
            !(item.selectedRincian?.includes('Cek') || item.rincian?.includes('Cek'))
          
          let resolvedHasilJadi = item.hasilJadi || ''
          if (resolvedHasilJadi === 'Pupuk Organik Cair') {
            resolvedHasilJadi = 'Pupuk Organik Cair' // match choice
          }
          return isFermentation && resolvedHasilJadi === selectedJenis && s.approvalStatus === 'approved'
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

      const item = match.rawItem || {}
      const qty = item.qty || item.jumlahPupukDibuat || 5
      const unit = item.unit || 'Liter'

      const itemsList: Array<{ label: string; value: string }> = []

      // 1. Bahan Utama / Mentah
      const mainName = item.bahanUtama || item.bahanMentahId || 'Air cucian beras'
      const mainQty = item.bahanUtamaQty || item.materialUsed || qty
      const mainUnit = item.bahanUtamaUnit || unit
      itemsList.push({
        label: 'Bahan Utama / Mentah',
        value: `${mainName} (${mainQty} ${mainUnit})`
      })

      // 2. Dekomposer
      if (item.dekomposer) {
        const dekQty = item.dekomposerQty ? `${item.dekomposerQty} ${item.dekomposerUnit || 'mL'}` : ''
        itemsList.push({
          label: 'Dekomposer',
          value: dekQty ? `${item.dekomposer} (${dekQty})` : item.dekomposer
        })
      }

      // 3. Molase
      if (item.molase) {
        const molQty = item.molaseQty ? `${item.molaseQty} ${item.molaseUnit || 'kg'}` : ''
        itemsList.push({
          label: 'Molase / Pemanis',
          value: molQty ? `${item.molase} (${molQty})` : item.molase
        })
      }

      // 4. Bahan Tambahan Items
      if (Array.isArray(item.bahanTambahanItems) && item.bahanTambahanItems.length > 0) {
        const btStr = item.bahanTambahanItems
          .filter((bt: any) => bt.nama)
          .map((bt: any) => `${bt.nama} (${bt.qty || 1} ${bt.unit || 'Liter'})`)
          .join(', ')
        if (btStr) {
          itemsList.push({
            label: 'Bahan Tambahan',
            value: btStr
          })
        }
      } else if (item.bahanTambahan && item.bahanTambahan !== 'tidak') {
        itemsList.push({
          label: 'Bahan Tambahan',
          value: item.bahanTambahan
        })
      } else {
        itemsList.push({
          label: 'Bahan Tambahan',
          value: 'Tidak ada'
        })
      }

      // 5. Air Bersih Pelarut
      if (item.jumlahAir) {
        itemsList.push({
          label: 'Air Bersih Pelarut',
          value: `${item.jumlahAir} ${item.satuanVolumeAir || 'Liter (L)'}`
        })
      }

      return {
        qty,
        unit,
        items: itemsList
      }
    })

    const medicineRecommendation = computed(() => {
      const k = (props.kindTitle || '').toLowerCase()
      const r = (props.selectedRincian || '').toLowerCase()
      const isObat = k === 'pemberian obat' || k.includes('obat') || k.includes('pestisida') || k.includes('fungisida') || k.includes('perawatan') || r.includes('pestisida') || r.includes('fungisida') || r.includes('obat')
      if (!isObat) return null

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
      if (!resolvedVarietas) {
        const landName = (landSession.value?.name || '').toLowerCase()
        if (landName.includes('lengkeng') || landName.includes('kelengkeng')) resolvedVarietas = 'Lengkeng'
        else resolvedVarietas = 'Alpukat'
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
      if (!resolvedFase) resolvedFase = 'Vegetatif'

      const selectedOPT = (f().namaOPT || '').trim()
      const selectedObat = (f().namaObat || '').trim()
      const selectedTeknik = (f().teknikPemberianObat || '').trim()
      const treeCount = (props.activeMode === 'pohon' && props.selectedTrees) ? props.selectedTrees.length : 1

      const optLower = selectedOPT.toLowerCase()
      const obatLower = selectedObat.toLowerCase()

      let category: 'larutan_semprot' | 'tabur_akar' = 'larutan_semprot'
      let dosisEksplisit = '2 ml per 1 liter air'
      let konversiTetes: string | null = '40 tetes per Liter air'
      let totalEstStr = `± ${treeCount * 2} L air & ${treeCount * 2 * 2} mL (80 tetes) obat`
      let catatanAplikasi = 'Larutkan bahan ke dalam air dan aduk rata sebelum disemprotkan.'
      let recommendedObatName = selectedObat || 'Minyak sereh wangi'
      let recommendedTeknik = selectedTeknik || 'Semprot'
      let jenisObat = 'Pestisida'

      if (optLower.includes('kanker') || optLower.includes('busuk') || obatLower.includes('trichoderma')) {
        category = 'tabur_akar'
        dosisEksplisit = '250 gram per batang'
        konversiTetes = null
        recommendedObatName = 'Trichoderma'
        jenisObat = 'Fungisida'
        recommendedTeknik = 'Tabur / Benam Akar'
        const totalGram = 250 * treeCount
        totalEstStr = totalGram >= 1000 ? `${(totalGram / 1000).toFixed(2)} kg Trichoderma (${treeCount} Pohon)` : `${totalGram} gram Trichoderma (${treeCount} Pohon)`
        catatanAplikasi = 'Taburkan/benamkan serbuk Trichoderma di sekitar perakaran/pangkal batang, lalu siram air.'
      } else if (optLower.includes('kutu putih') || obatLower.includes('nimba')) {
        category = 'larutan_semprot'
        dosisEksplisit = '2 ml per liter air'
        konversiTetes = '40 tetes per Liter air'
        recommendedObatName = 'Nimba'
        jenisObat = 'Pestisida'
        recommendedTeknik = 'Semprot'
        totalEstStr = `± ${treeCount * 2} L air & ${treeCount * 2 * 2} mL (80 tetes) Nimba`
        catatanAplikasi = 'Larutkan Nimba ke dalam air semprot dan aduk rata sebelum disemprotkan ke kutu putih.'
      } else {
        // Default: Tungau Merah / Minyak sereh wangi
        category = 'larutan_semprot'
        dosisEksplisit = '2 ml per 1 liter air'
        konversiTetes = '40 tetes per Liter air'
        recommendedObatName = 'Minyak sereh wangi'
        jenisObat = 'Pestisida'
        recommendedTeknik = 'Semprot'
        totalEstStr = `± ${treeCount * 2} L air & ${treeCount * 2 * 2} mL (80 tetes) Minyak sereh wangi`
        catatanAplikasi = 'Campurkan minyak sereh wangi dengan pelarut/air, kocok hingga merata.'
      }

      return {
        category,
        jenisObat,
        varietas: resolvedVarietas,
        fase: resolvedFase,
        opt: selectedOPT || 'Tungau Merah',
        obat: recommendedObatName,
        teknik: recommendedTeknik,
        dosisEksplisit,
        konversiTetes,
        totalEstStr,
        treeCount,
        catatanAplikasi
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
      
      const pupukLower = selectedPupuk.toLowerCase()
      const rincianLower = rincianStr.toLowerCase()

      const isCair = pupukLower.includes('cair') || pupukLower.includes('poc') || rincianLower.includes('cair')
      const isKimia = pupukLower.includes('kimia') || pupukLower.includes('urea') || pupukLower.includes('sp-36') || pupukLower.includes('sp36') || pupukLower.includes('kcl') || pupukLower.includes('npk') || rincianLower.includes('kimia')

      const treeCount = (props.activeMode === 'pohon' && props.selectedTrees) ? props.selectedTrees.length : 1

      if (isCair) {
        const isVeg = faseLower.includes('vegetatif') || faseLower.includes('belum produktif') || faseLower.includes('0-3') || faseLower.includes('pembibitan')
        const isGeneratif = faseLower.includes('generatif') || faseLower.includes('buah') || faseLower.includes('bunga')

        let volPerPohon = 2.0 // Belum produktif (0-3 th)
        let faseNote = 'Belum Produktif (0-3 th) — Volume Larutan: 2.0L / pohon'
        if (!isVeg || isGeneratif) {
          if (isGeneratif) {
            volPerPohon = 8.0
            faseNote = 'Produktif (> 4 th), Fase Generatif — Volume Larutan: 8.0L / pohon'
          } else {
            volPerPohon = 5.0
            faseNote = 'Produktif (> 4 th), Fase Vegetatif — Volume Larutan: 5.0L / pohon'
          }
        }

        const totalLarutanL = volPerPohon * treeCount
        const pocMurniL = totalLarutanL * (1.0 / 100.0)

        const inputPocQty = parseFloat(f().jumlahBeratPupuk || '0') || 0
        const calcWaterQty = inputPocQty > 0 ? (inputPocQty * 100).toFixed(1) : (totalLarutanL * 100 / 101).toFixed(1)

        return {
          category: 'organik_cair',
          varietas: resolvedVarietas,
          fase: resolvedFase,
          pupuk: selectedPupuk || 'Pupuk Organik Cair',
          teknik: selectedTeknik || 'Kocor / Semprot',
          volPerPohon: `${volPerPohon.toFixed(1)} L / pohon`,
          faseNote,
          totalLarutanL: `${totalLarutanL.toFixed(1)} Liter`,
          pocMurniL: `${pocMurniL.toFixed(2)} Liter`,
          pocQty: inputPocQty > 0 ? `${inputPocQty} Liter` : `${pocMurniL.toFixed(2)} Liter`,
          waterQty: inputPocQty > 0 ? `${(inputPocQty * 100).toFixed(1)} Liter` : `${totalLarutanL.toFixed(1)} Liter`,
          disclaimer: 'Rasio pengenceran resmi 1 Liter POC : 100 Liter Air.',
          treeCount
        }
      }

      if (isKimia) {
        const isVeg = faseLower.includes('vegetatif') || faseLower.includes('belum produktif') || faseLower.includes('tidak produktif') || faseLower.includes('0-3') || faseLower.includes('pembibitan')
        
        const ureaG = isVeg ? 650 : 2880
        const sp36G = isVeg ? 625 : 3330
        const kclG = isVeg ? 500 : 4080

        const totalUreaKg = ((ureaG * treeCount) / 1000).toFixed(2)
        const totalSP36Kg = ((sp36G * treeCount) / 1000).toFixed(2)
        const totalKClKg = ((kclG * treeCount) / 1000).toFixed(2)

        return {
          category: 'kimia',
          varietas: resolvedVarietas,
          fase: resolvedFase,
          pupuk: selectedPupuk || 'Pupuk Kimia (Pupuk Tunggal)',
          teknik: selectedTeknik || 'Tebar / Tugal',
          singleFertilizers: [
            { name: 'Urea (N)', dosePerTree: `${ureaG} g / pohon / tahun`, total: `${totalUreaKg} kg` },
            { name: 'SP-36 (P₂O₅)', dosePerTree: `${sp36G} g / pohon / tahun`, total: `${totalSP36Kg} kg` },
            { name: 'KCl (K₂O)', dosePerTree: `${kclG} g / pohon / tahun`, total: `${totalKClKg} kg` }
          ],
          treeCount
        }
      }

      // Organik Padat
      let recommendedDose = ''
      let totalDoseCalc = ''
      if (faseLower.includes('vegetatif') || faseLower.includes('belum produktif') || faseLower.includes('tidak produktif') || faseLower.includes('0-3') || faseLower.includes('pembibitan')) {
        recommendedDose = '5 - 10 kg per pohon'
        totalDoseCalc = `${treeCount * 5} - ${treeCount * 10} kg`
      } else {
        recommendedDose = '15 - 20 kg per pohon'
        totalDoseCalc = `${treeCount * 15} - ${treeCount * 20} kg`
      }

      return {
        category: 'organik_padat',
        varietas: resolvedVarietas,
        fase: resolvedFase,
        pupuk: selectedPupuk || 'Pupuk Organik Padat',
        teknik: selectedTeknik || 'Tebar / Tugal',
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

      if (isCair) {
        const isCucianBeras = materialLabel.toLowerCase().includes('cucian beras') || materialLabel.toLowerCase().includes('ragi')

        if (isCucianBeras) {
          return {
            recipeType: 'cucian_beras',
            materialLabel,
            materialUsed: qVal.toFixed(1),
            airKelapa: (0.1 * qVal).toFixed(1),
            ragiTape: `${Math.ceil(0.1 * qVal)} butir`,
            gulaMerah: (0.025 * qVal).toFixed(2),
            decomposer: Math.round(10 * qVal),
            decomposerLabel,
            durationText: '7 - 14 Hari',
            checkingText: 'Setiap 3 hari sekali (buka tutup wadah sebentar untuk membuang gas, serta periksa aroma berbau asam segar).'
          }
        } else {
          return {
            recipeType: 'em4_poc',
            materialLabel,
            em4Volume: (0.2 * qVal).toFixed(1),
            molaseVolume: (0.1 * qVal).toFixed(1),
            kotoranDombaKg: (0.3 * qVal).toFixed(1),
            dedakKg: (0.1 * qVal).toFixed(1),
            water: (0.8 * qVal).toFixed(1),
            durationText: '14 - 21 Hari',
            checkingText: 'Setiap 3 hari sekali (periksa suhu, kelembapan, dan aroma fermentasi).'
          }
        }
      }

      let materialUsed = (1.0 * qVal).toFixed(1)
      let waterUsed = (0.3 * qVal).toFixed(1)
      let durationText = '21 - 30 Hari'
      let checkingText = 'Setiap 7 hari sekali (bolak-balik adukan kompos untuk aerasi dan periksa kelembapan serta suhu timbunan).'

      return {
        recipeType: 'kompos',
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

    const addBahanTambahanItem = () => {
      if (!Array.isArray(f().bahanTambahanItems)) {
        f().bahanTambahanItems = []
      }
      f().bahanTambahanItems.push({ nama: '', qty: '', unit: 'kg' })
    }

    const removeBahanTambahanItem = (index: number) => {
      if (Array.isArray(f().bahanTambahanItems)) {
        f().bahanTambahanItems.splice(index, 1)
      }
    }

    watch(
      () => [f().qty, f().hasilJadi, f().bahanMentahId],
      () => {
        if (f().hasilJadi !== 'ADD_NEW') {
          f().unit = (f().hasilJadi || '').toLowerCase().includes('cair') ? 'Liter' : 'kg'
        }
      },
      { deep: true }
    )

    watch(
      () => [f().bahanMentahId, f().hasilJadi],
      () => {
        const rec = fermentationRecommendation.value
        if (!rec) return
        if (rec.recipeType === 'cucian_beras') {
          f().bahanUtama = f().bahanMentahId || 'Air cucian beras (Metode Ragi Tape & Air Kelapa)'
          f().bahanUtamaQty = rec.materialUsed
          f().bahanUtamaUnit = 'Liter'
          f().dekomposer = 'EM4'
          f().dekomposerQty = rec.decomposer
          f().dekomposerUnit = 'mL'
          f().molase = 'Gula Merah'
          f().molaseQty = rec.gulaMerah
          f().molaseUnit = 'kg'
          f().adaBahanTambahan = 'ya'
          f().bahanTambahanItems = [
            { nama: 'Air Kelapa', qty: rec.airKelapa, unit: 'Liter' },
            { nama: 'Ragi Tape', qty: '1', unit: 'butir' }
          ]
          f().jumlahAir = rec.materialUsed
          f().satuanVolumeAir = 'Liter (L)'
        } else if (rec.recipeType === 'em4_poc') {
          f().bahanUtama = f().bahanMentahId || 'EM4 & Molase (Metode Kotoran Domba / Limbah Organik)'
          f().bahanUtamaQty = rec.materialUsed || f().qty || '10'
          f().bahanUtamaUnit = 'Liter'
          f().dekomposer = 'EM4'
          f().dekomposerQty = rec.em4Volume
          f().dekomposerUnit = 'Liter'
          f().molase = 'Tetes Tebu (Molase)'
          f().molaseQty = rec.molaseVolume
          f().molaseUnit = 'Liter'
          f().adaBahanTambahan = 'ya'
          f().bahanTambahanItems = [
            { nama: 'Kotoran Domba', qty: rec.kotoranDombaKg, unit: 'kg' },
            { nama: 'Dedak', qty: rec.dedakKg, unit: 'kg' }
          ]
          f().jumlahAir = rec.water
          f().satuanVolumeAir = 'Liter (L)'
        } else if (rec.recipeType === 'kompos') {
          f().bahanUtama = f().bahanMentahId || 'Hasil pemangkasan (kanopi, ranting, daun)'
          f().bahanUtamaQty = rec.materialUsed
          f().bahanUtamaUnit = 'kg'
          f().dekomposer = 'EM4'
          f().dekomposerQty = rec.decomposer
          f().dekomposerUnit = 'mL'
          f().molase = 'Tetes Tebu (Molase)'
          f().molaseQty = rec.molase
          f().molaseUnit = 'mL'
          f().adaBahanTambahan = 'tidak'
          f().bahanTambahanItems = []
          f().jumlahAir = rec.water
          f().satuanVolumeAir = 'Liter (L)'
        }
      }
    )

    watch(
      () => [fertilizerRecommendation.value, props.selectedRincian, f().jenisPupukDetail],
      () => {
        const rec = fertilizerRecommendation.value
        if (rec && rec.category === 'organik_cair') {
          if (!f().satuanVolumePOC) f().satuanVolumePOC = 'Liter'
          if (!f().satuanVolumeAir) f().satuanVolumeAir = 'Liter (L)'
          if (!f().jumlahBeratPupuk || f().jumlahBeratPupuk === '0') {
            f().jumlahBeratPupuk = (rec.pocMurniL || '').replace(/[^0-9.]/g, '') || '0.02'
          }
          if (!f().jumlahAir || f().jumlahAir === '0') {
            f().jumlahAir = (rec.totalLarutanL || '').replace(/[^0-9.]/g, '') || '2.0'
          }
        }
      },
      { immediate: true }
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
      const inputVal = Number(f().jumlahBeratPupuk) || 0
      if (inputVal <= 0) return null

      const selectedPupuk = f().jenisPupukDetail || ''
      if (!selectedPupuk) return null

      const selectedLower = selectedPupuk.toLowerCase()
      const isCair = selectedLower.includes('poc') || selectedLower.includes('cair')
      const isOrganik = selectedLower.includes('kandang') || selectedLower.includes('kotoran') || selectedLower.includes('kompos') || selectedLower.includes('organik')

      if (!isOrganik && !isCair) return null

      // Convert dose to Liter or kg if unit is mL or gram
      const unitPoc = f().satuanVolumePOC || 'Liter'
      const doseInLiter = (isCair && unitPoc === 'mL') ? inputVal / 1000.0 : inputVal

      // Helper to parse numeric values safely
      const parseQty = (val: any, fallback: number): number => {
        const num = parseFloat(val)
        return (!isNaN(num) && num > 0) ? num : fallback
      }

      // Helper to format values with auto unit scaling (Liter -> mL, kg -> gram)
      const formatScaledValue = (val: number, unit: string): string => {
        const uLower = (unit || '').toLowerCase()
        if (uLower.includes('ml') || uLower.includes('mililiter')) {
          return val < 0.1 ? (val * 1000).toFixed(1) + ' mL' : val.toFixed(1) + ' mL'
        }
        if (uLower.includes('liter') || uLower.includes('l')) {
          if (val < 0.1) {
            return (val * 1000).toFixed(0) + ' mL'
          }
          return val.toFixed(2) + ' Liter'
        }
        if (uLower.includes('kg') || uLower.includes('kilogram')) {
          if (val < 0.1) {
            return (val * 1000).toFixed(1) + ' gram'
          }
          return val.toFixed(2) + ' kg'
        }
        if (uLower.includes('gram') || uLower.includes('g')) {
          return val.toFixed(1) + ' gram'
        }
        return val.toFixed(2) + ' ' + unit
      }

      // Search for recorded Fermentasi submission in allSubmissions
      const ferSub = (props.allSubmissions || []).find((s: any) => {
        const typeLower = (s.type || '').toLowerCase()
        const isFer = typeLower === 'pengolahan pupuk' || typeLower === 'pengolahan_pupuk'
        if (!isFer) return false
        const item = s.payload?.data?.items?.[0] || {}
        const recordedName = (item.hasilJadi || item.namaJenisPupuk || '').toLowerCase()
        return recordedName.includes(selectedLower) || selectedLower.includes(recordedName)
      })

      if (ferSub) {
        const item = ferSub.payload?.data?.items?.[0] || {}
        const batchQty = parseQty(item.qty || item.jumlahPupukDibuat, 10)
        const scale = doseInLiter / batchQty

        const itemsList: Array<{ label: string; value: string }> = []

        // 1. Bahan Utama
        const mainName = item.bahanUtama || item.bahanMentahId || 'Air cucian beras'
        const mainUnit = item.bahanUtamaUnit || 'Liter'
        const mainQtyVal = parseQty(item.bahanUtamaQty || item.materialUsed, batchQty) * scale
        itemsList.push({
          label: `Bahan Utama (${mainName})`,
          value: formatScaledValue(mainQtyVal, mainUnit)
        })

        // 2. Dekomposer
        if (item.dekomposer || item.decomposer) {
          const dekName = item.dekomposer || 'EM4'
          const dekUnit = item.dekomposerUnit || 'mL'
          const defaultDekQty = dekUnit.toLowerCase().includes('liter') ? 0.1 : 100
          const dekQtyVal = parseQty(item.dekomposerQty || item.decomposer, defaultDekQty) * scale
          itemsList.push({
            label: `Dekomposer (${dekName})`,
            value: formatScaledValue(dekQtyVal, dekUnit)
          })
        }

        // 3. Molase
        if (item.molase) {
          const molName = item.molase || 'Gula Merah'
          const molUnit = item.molaseUnit || 'kg'
          const defaultMolQty = molUnit.toLowerCase().includes('liter') ? 0.1 : 0.25
          const molQtyVal = parseQty(item.molaseQty || item.molaseVal, defaultMolQty) * scale
          itemsList.push({
            label: `Molase / Pemanis (${molName})`,
            value: formatScaledValue(molQtyVal, molUnit)
          })
        }

        // 4. Bahan Tambahan Items
        if (Array.isArray(item.bahanTambahanItems) && item.bahanTambahanItems.length > 0) {
          item.bahanTambahanItems.forEach((bt: any) => {
            if (bt.nama) {
              const btUnit = bt.unit || 'Liter'
              const btQtyVal = parseQty(bt.qty, 1.0) * scale
              itemsList.push({
                label: `Bahan Tambahan (${bt.nama})`,
                value: formatScaledValue(btQtyVal, btUnit)
              })
            }
          })
        }

        // 5. Air Bersih
        const airUnit = item.satuanVolumeAir || 'Liter (L)'
        const airQtyVal = parseQty(item.jumlahAir || item.water, batchQty) * scale
        itemsList.push({
          label: 'Air Bersih Pelarut',
          value: formatScaledValue(airQtyVal, airUnit)
        })

        return {
          recorded: true,
          recipeName: item.hasilJadi || selectedPupuk,
          items: itemsList
        }
      }

      // Default calculation if no specific recorded fermentation submission found
      if (isCair) {
        const matVal = 1.0 * doseInLiter
        const waterVal = 1.0 * doseInLiter
        const decomposerVal = (100 / 10) * doseInLiter // 100 mL per 10 L
        const molaseVal = (0.25 / 10) * doseInLiter   // 0.25 kg per 10 L
        return {
          recorded: false,
          recipeName: selectedPupuk,
          items: [
            { label: 'Bahan Utama (Air Cucian Beras)', value: formatScaledValue(matVal, 'Liter') },
            { label: 'Air Bersih Pelarut', value: formatScaledValue(waterVal, 'Liter') },
            { label: 'Dekomposer (EM4)', value: formatScaledValue(decomposerVal, 'mL') },
            { label: 'Molase (Gula Merah)', value: formatScaledValue(molaseVal, 'kg') },
            { label: 'Bahan Tambahan (Air Kelapa)', value: formatScaledValue(0.1 * doseInLiter, 'Liter') },
            { label: 'Bahan Tambahan (Ragi Tape)', value: `${Math.ceil(0.1 * doseInLiter)} butir` }
          ]
        }
      } else {
        const matVal = 1.0 * doseInLiter
        const waterVal = 0.3 * doseInLiter
        const decomposerVal = (10 / 1) * doseInLiter
        return {
          recorded: false,
          recipeName: selectedPupuk,
          items: [
            { label: 'Bahan Organik Utama (Kotoran Domba)', value: formatScaledValue(matVal, 'kg') },
            { label: 'Air Bersih', value: formatScaledValue(waterVal, 'Liter') },
            { label: 'Dekomposer (EM4)', value: formatScaledValue(decomposerVal, 'mL') },
            { label: 'Molase (Tetes Tebu)', value: formatScaledValue(decomposerVal, 'mL') }
          ]
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

          {(props.kindTitle === 'Pemberian Obat' || (props.kindTitle || '').toLowerCase().includes('obat') || (props.kindTitle || '').toLowerCase().includes('pestisida') || (props.kindTitle || '').toLowerCase().includes('fungisida') || (props.kindTitle || '').toLowerCase().includes('perawatan') || (props.selectedRincian || '').toLowerCase().includes('pestisida') || (props.selectedRincian || '').toLowerCase().includes('fungisida')) && (() => {
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
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Status Usia Pohon</span>
                      <PerkebunanFormSelect
                        modelValue={f().statusProduktivitas}
                        options={['usia belum produktif (0 - 3 tahun)', 'usia produktif (> 4 tahun)']}
                        placeholder="Pilih Status"
                        onUpdate:modelValue={(val) => {
                          f().statusProduktivitas = val
                          if (val === 'usia belum produktif (0 - 3 tahun)') {
                            f().fasePohon = 'Vegetatif'
                          } else {
                            f().fasePohon = 'Generatif'
                          }
                        }}
                      />
                    </div>
                    {f().statusProduktivitas === 'usia produktif (> 4 tahun)' && (
                      <div class="form-group">
                        <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Fase Pohon</span>
                        <PerkebunanFormSelect
                          modelValue={f().fasePohon}
                          options={['Vegetatif', 'Generatif']}
                          placeholder="Pilih Fase"
                          onUpdate:modelValue={(val) => { f().fasePohon = val }}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* 1. Target OPT (Input Bar) */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Target Organisme Pengganggu Tumbuhan (OPT)</span>
                  <PerkebunanFormInput
                    modelValue={f().namaOPT}
                    placeholder="Contoh: Tungau Merah, Kutu Putih, Kanker Batang & Busuk Akar"
                    onUpdate:modelValue={(val) => { f().namaOPT = val }}
                  />
                </div>

                {/* 2. Pilih Nama Obat (Dropdown Select) */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Nama Obat</span>
                  <PerkebunanFormSelect
                    modelValue={f().namaObat}
                    options={filteredObatOptions.value}
                    placeholder="Pilih Nama Obat"
                    onUpdate:modelValue={(val: string) => {
                      f().namaObat = val
                      if (val === 'Minyak sereh wangi') {
                        f().jenisObat = 'Pestisida'
                        f().satuanVolumeObat = 'Mililiter (ml)'
                        if (!f().namaOPT) f().namaOPT = 'Tungau Merah'
                      } else if (val === 'Trichoderma') {
                        f().jenisObat = 'Fungisida'
                        f().satuanVolumeObat = 'Gram (g)'
                        if (!f().namaOPT) f().namaOPT = 'Kanker Batang & Busuk Akar'
                      } else if (val === 'Nimba') {
                        f().jenisObat = 'Pestisida'
                        f().satuanVolumeObat = 'Mililiter (ml)'
                        if (!f().namaOPT) f().namaOPT = 'Kutu Putih'
                      }
                      const found = props.obatStocks?.find((o: any) => o.name === val)
                      if (found) {
                        const qtyMatch = (found.qty || '').match(/^([\d.]+)/)
                        if (qtyMatch) f().volumeObat = qtyMatch[1]
                      }
                    }}
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

                {medicineRecommendation.value && (
                  <div style="background-color: #f6f8ee; border: 1.5px solid #dce1d0; border-radius: 0.75rem; padding: 1.25rem; margin-top: 0.5rem; margin-bottom: 1.25rem; text-align: left;">
                    <div style="margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">
                      <div>
                        <h4 style="margin: 0 0 0.2rem 0; font-size: 0.95rem; font-weight: 800; color: #2e3b1f;">
                          📋 Rekomendasi Takaran & Dosis Buku Panduan
                        </h4>
                        <p style="margin: 0; font-size: 0.8rem; color: #5c6650; font-weight: 600; line-height: 1.4;">
                          Panduan resmi untuk komoditas <b>{medicineRecommendation.value.varietas}</b> ({medicineRecommendation.value.fase}) — OPT: <b>{medicineRecommendation.value.opt}</b>
                        </p>
                      </div>
                      {medicineRecommendation.value.syaratWaktu && (
                        <span style="background: #fef3c7; color: #92400e; border: 1px solid #fde68a; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 0.375rem;">
                          ⏱️ Waktu: {medicineRecommendation.value.syaratWaktu}
                        </span>
                      )}
                    </div>

                    {/* Grid of details */}
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.65rem; margin-top: 0.75rem;">
                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700;">
                          🧪 Bahan / Obat Rekomendasi
                        </span>
                        <strong style="font-size: 0.88rem; color: #2e3b1f; margin-top: 0.15rem;">
                          {medicineRecommendation.value.obat}
                        </strong>
                      </div>

                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700;">
                          📌 Dosis Eksplisit
                        </span>
                        <strong style="font-size: 0.88rem; color: #059669; margin-top: 0.15rem;">
                          {medicineRecommendation.value.dosisEksplisit}
                        </strong>
                      </div>

                      {medicineRecommendation.value.konversiTetes && (
                        <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                          <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700;">
                            💧 Konversi Tetes (Dropper)
                          </span>
                          <strong style="font-size: 0.88rem; color: #0284c7; margin-top: 0.15rem;">
                            {medicineRecommendation.value.konversiTetes}
                          </strong>
                        </div>
                      )}

                      <div style={`background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; display: flex; flex-direction: column; justify-content: center; ${!medicineRecommendation.value.konversiTetes ? 'grid-column: span 2;' : ''}`}>
                        <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700;">
                          🧮 Estimasi ({medicineRecommendation.value.treeCount} Pohon)
                        </span>
                        <strong style="font-size: 0.88rem; color: #2e3b1f; margin-top: 0.15rem;">
                          {medicineRecommendation.value.totalEstStr}
                        </strong>
                      </div>
                    </div>

                    <div style="margin-top: 0.75rem; padding: 0.5rem 0.65rem; background: #ffffff; border-left: 3px solid #059669; border-radius: 0.25rem; font-size: 0.78rem; color: #4b5563;">
                      <b>Petunjuk Aplikasi:</b> {medicineRecommendation.value.catatanAplikasi}
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

                {/* ── Inline obat stock warning ── */}
                {(() => {
                  const selectedObat = f().namaObat
                  const vol = parseFloat(f().volumeObat)
                  if (!selectedObat || selectedObat === 'Jenis Obat' || selectedObat === 'Pilih Obat' || !f().volumeObat || isNaN(vol) || vol <= 0) return null
                  const stockItem = props.obatStocks?.find((o: any) => o.name === selectedObat)
                  if (!stockItem) return null
                  const available = stockItem.val ?? 0
                  const unit = stockItem.unit || 'ml'
                  const satuan = f().satuanVolumeObat || unit
                  // Normalize to ml for comparison
                  const isLiterInput = (satuan || '').toLowerCase().includes('liter') || (satuan || '').toLowerCase() === 'l'
                  const usedMl = isLiterInput ? vol * 1000 : vol
                  const isInsufficient = usedMl > available
                  return (
                    <div style={`background-color: ${isInsufficient ? '#fff5f5' : '#f6f8ee'}; border: 1px solid ${isInsufficient ? '#ffe3e3' : '#dce1d0'}; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;`}>
                      <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                        <span style="font-size: 1.25rem;">{isInsufficient ? '⚠️' : '💊'}</span>
                        <div>
                          <h4 style={`margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 800; color: ${isInsufficient ? '#e03131' : '#2f3b1d'};`}>
                            {isInsufficient ? 'Peringatan Stok Kurang' : 'Informasi Stok Obat'}
                          </h4>
                          <p style={`margin: 0; font-size: 0.85rem; font-weight: 600; color: ${isInsufficient ? '#c92a2a' : '#4f5d2e'}; line-height: 1.4;`}>
                            {isInsufficient
                              ? `Jumlah yang Anda masukkan (${vol} ${satuan}) melebihi stok ${selectedObat} yang tersedia saat ini (${available} ${unit}).`
                              : `Stok tersedia: ${available} ${unit}. Anda menggunakan ${vol} ${satuan} dari stok ${selectedObat}.`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })()}

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
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Status Usia Pohon</span>
                      <PerkebunanFormSelect
                        modelValue={f().statusProduktivitas}
                        options={['usia belum produktif (0 - 3 tahun)', 'usia produktif (> 4 tahun)']}
                        placeholder="Pilih Status"
                        onUpdate:modelValue={(val) => {
                          f().statusProduktivitas = val
                          if (val === 'usia belum produktif (0 - 3 tahun)') {
                            f().fasePohon = 'Vegetatif'
                          } else {
                            f().fasePohon = 'Generatif'
                          }
                        }}
                      />
                    </div>
                    {f().statusProduktivitas === 'usia produktif (> 4 tahun)' && (
                      <div class="form-group">
                        <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Fase Pohon</span>
                        <PerkebunanFormSelect
                          modelValue={f().fasePohon}
                          options={['Vegetatif', 'Generatif']}
                          placeholder="Pilih Fase"
                          onUpdate:modelValue={(val) => { f().fasePohon = val }}
                        />
                      </div>
                    )}
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

                    {fertilizerRecommendation.value.category === 'organik_cair' ? (
                      <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.85rem 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <strong style="font-size: 0.88rem; color: #2e3b1f;">Rasio Pengenceran POC Standar</strong>
                          <span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 0.2rem 0.6rem; border-radius: 0.375rem; font-size: 0.78rem; font-weight: 800;">
                            1 : 100
                          </span>
                        </div>
                        <div style="font-size: 0.78rem; color: #475569; font-weight: 600;">
                          📌 <strong>Status Target:</strong> {fertilizerRecommendation.value.faseNote}
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 0.25rem;">
                          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.375rem; padding: 0.5rem 0.65rem;">
                            <span style="font-size: 0.72rem; color: #64748b; font-weight: 700; display: block;">Estimasi Larutan ({fertilizerRecommendation.value.treeCount} Pohon)</span>
                            <strong style="font-size: 0.88rem; color: #0f172a; margin-top: 0.1rem; display: block;">{fertilizerRecommendation.value.totalLarutanL}</strong>
                          </div>
                          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.375rem; padding: 0.5rem 0.65rem;">
                            <span style="font-size: 0.72rem; color: #64748b; font-weight: 700; display: block;">Kebutuhan POC Murni Pekat</span>
                            <strong style="font-size: 0.88rem; color: #059669; margin-top: 0.1rem; display: block;">{fertilizerRecommendation.value.pocMurniL}</strong>
                          </div>
                        </div>
                        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.375rem; padding: 0.5rem 0.65rem; margin-top: 0.25rem;">
                          <span style="font-size: 0.78rem; color: #166534; font-weight: 600; line-height: 1.4; display: block;">
                            💧 <strong>Instruksi Racikan Siap Siram:</strong> Campurkan <strong>{fertilizerRecommendation.value.pocQty}</strong> POC Murni ke dalam <strong>{fertilizerRecommendation.value.waterQty}</strong> air bersih.
                          </span>
                        </div>
                        <span style="font-size: 0.75rem; color: #64748b; font-weight: 500; line-height: 1.4; margin-top: 0.15rem; display: block;">
                          💡 {fertilizerRecommendation.value.disclaimer}
                        </span>
                      </div>
                    ) : fertilizerRecommendation.value.category === 'kimia' ? (
                      <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.75rem;">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.65rem; margin-bottom: 0.25rem;">
                          <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                            <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700;">Pupuk Terpilih</span>
                            <strong style="font-size: 0.88rem; color: #2e3b1f; display: block; margin-top: 0.15rem;">
                              {fertilizerRecommendation.value.pupuk}
                            </strong>
                          </div>
                          <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                            <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700;">Teknik Pemupukan</span>
                            <strong style="font-size: 0.88rem; color: #2e3b1f; display: block; margin-top: 0.15rem;">
                              {fertilizerRecommendation.value.teknik}
                            </strong>
                          </div>
                        </div>

                        <span style="font-size: 0.8rem; font-weight: 700; color: #2e3b1f;">Rincian Dosis Pupuk Tunggal ({fertilizerRecommendation.value.treeCount} Pohon):</span>
                        {fertilizerRecommendation.value.singleFertilizers?.map((item: any, idx: number) => (
                          <div key={idx} style="background: #ffffff; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.65rem 0.85rem; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                              <strong style="font-size: 0.88rem; color: #1e293b; display: block;">{item.name}</strong>
                              <span style="font-size: 0.78rem; color: #059669; font-weight: 600;">{item.dosePerTree}</span>
                            </div>
                            <div style="text-align: right;">
                              <span style="font-size: 0.72rem; color: #64748b; font-weight: 700; display: block;">Total Estimasi</span>
                              <strong style="font-size: 0.9rem; color: #0369a1;">{item.total}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
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
                    )}
                  </div>
                )}

                {isCair ? (
                  <>
                    {/* 1. Volume Pupuk Organik Cair (POC Murni) */}
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">
                        Volume Pupuk Organik Cair (POC Murni)
                      </span>
                      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; width: 100%;">
                        <div style="flex: 2 1 180px; min-width: 140px;">
                          <PerkebunanFormInput
                            type="number"
                            modelValue={f().jumlahBeratPupuk}
                            placeholder="Contoh: 0.02 atau 20"
                            onUpdate:modelValue={(val) => { 
                              f().jumlahBeratPupuk = val 
                              const numVal = parseFloat(val || '0') || 0
                              const unitPoc = f().satuanVolumePOC || 'Liter'
                              const unitAir = f().satuanVolumeAir || 'Liter (L)'
                              if (numVal > 0) {
                                if (unitPoc === 'Liter' && unitAir.includes('Liter')) {
                                  f().jumlahAir = (numVal * 100).toFixed(2)
                                } else if (unitPoc === 'mL' && unitAir.includes('Liter')) {
                                  f().jumlahAir = (numVal * 100 / 1000).toFixed(2)
                                } else if (unitPoc === 'mL' && unitAir.includes('ml')) {
                                  f().jumlahAir = (numVal * 100).toFixed(0)
                                }
                              }
                            }}
                          />
                        </div>
                        <div style="flex: 1 1 120px; min-width: 100px;">
                          <PerkebunanFormSelect
                            modelValue={f().satuanVolumePOC || 'Liter'}
                            options={[
                              { value: 'Liter', label: 'Liter' },
                              { value: 'mL', label: 'Mililiter (mL)' }
                            ]}
                            placeholder="Satuan POC"
                            onUpdate:modelValue={(val) => { f().satuanVolumePOC = val }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Volume Larutan Air Bersih (Air Pelarut) */}
                    <div class="form-group">
                      <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">
                        Volume Larutan (Air Bersih Pelarut)
                      </span>
                      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; width: 100%;">
                        <div style="flex: 2 1 180px; min-width: 140px;">
                          <PerkebunanFormInput
                            type="number"
                            modelValue={f().jumlahAir}
                            placeholder="Contoh: 2.0 atau 2000"
                            onUpdate:modelValue={(val) => { f().jumlahAir = val }}
                          />
                        </div>
                        <div style="flex: 1 1 120px; min-width: 100px;">
                          <PerkebunanFormSelect
                            modelValue={f().satuanVolumeAir || 'Liter (L)'}
                            options={[
                              { value: 'Liter (L)', label: 'Liter (L)' },
                              { value: 'Mililiter (ml)', label: 'Mililiter (ml)' }
                            ]}
                            placeholder="Satuan Air"
                            onUpdate:modelValue={(val) => { f().satuanVolumeAir = val }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">{volumeLabel}</span>
                    <PerkebunanFormInput
                      modelValue={f().jumlahBeratPupuk}
                      placeholder={volumePlaceholder}
                      onUpdate:modelValue={(val) => { f().jumlahBeratPupuk = val }}
                    />
                  </div>
                )}

                {pupukComposition.value && (
                  <div style="background-color: #f6f8ee; border: 1.5px solid #dce1d0; border-radius: 0.75rem; padding: 1.25rem; margin-top: 0.5rem; margin-bottom: 1rem; text-align: left;">
                    <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.75rem;">
                      <span style="font-size: 1.25rem;">🧪</span>
                      <div>
                        <h4 style="margin: 0 0 0.2rem 0; font-size: 0.95rem; font-weight: 800; color: #2e3b1f;">
                          Kandungan Racikan Fermentasi ({pupukComposition.value.recipeName})
                        </h4>
                        <p style="margin: 0; font-size: 0.8rem; color: #5c6650; font-weight: 600; line-height: 1.4;">
                          Berdasarkan racikan fermentasi yang sudah dicatat untuk {f().jumlahBeratPupuk} {f().satuanVolumePOC || 'Liter'} {f().jenisPupukDetail || 'Pupuk'}, pupuk ini terbuat dari:
                        </p>
                      </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 0.5rem;">
                      {pupukComposition.value.items.map((item: any, idx: number) => (
                        <div key={idx} style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.55rem 0.75rem; display: flex; flex-direction: column; justify-content: center;">
                          <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 600;">{item.label}</span>
                          <strong style="font-size: 0.88rem; color: #2e3b1f; margin-top: 0.15rem;">{item.value}</strong>
                        </div>
                      ))}
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

                {isOrganik && Number(f().jumlahBeratPupuk) > 0 && (() => {
                  const selectedName = (f().jenisPupukDetail || '').toLowerCase();
                  const isKotoranDomba = selectedName.includes('kotoran') || selectedName.includes('manure');
                  const availableStock = isKotoranDomba ? props.manureStock : props.selectedPupukStock;
                  const isInsufficient = Number(f().jumlahBeratPupuk) > availableStock;
                  if (!isInsufficient) return null;
                  return (
                    <div style="background-color: #fff5f5; border: 1px solid #ffe3e3; border-radius: 0.5rem; padding: 1rem; margin-top: 0.5rem;">
                      <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                        <span style="font-size: 1.25rem;">⚠️</span>
                        <div>
                          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 800; color: #e03131;">
                            Peringatan Stok Kurang
                          </h4>
                          <p style="margin: 0; font-size: 0.85rem; font-weight: 600; color: #c92a2a; line-height: 1.4;">
                            Jumlah yang Anda masukkan ({f().jumlahBeratPupuk} Kg) melebihi stok {f().jenisPupukDetail || 'pupuk'} yang tersedia saat ini ({availableStock.toFixed(1)} Kg).
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
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
                {/* 1. Target OPT (Input Bar) */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Target Organisme Pengganggu Tumbuhan (OPT)</span>
                  <PerkebunanFormInput
                    modelValue={f().namaOPT}
                    placeholder="Contoh: Tungau Merah, Kutu Putih, Kanker Batang & Busuk Akar"
                    onUpdate:modelValue={(val) => { f().namaOPT = val }}
                  />
                </div>

                {/* 2. Jenis Obat */}
                <div class="form-group">
                  <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jenis Obat</span>
                  <PerkebunanFormSelect
                    modelValue={f().jenisObat}
                    options={['Pestisida', 'Fungisida', 'Insektisida']}
                    placeholder="Jenis Obat"
                    onUpdate:modelValue={(val) => { f().jenisObat = val }}
                  />
                </div>

                {/* 3. Nama Obat */}
                {isNewRegistration ? (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Masukkan Nama Obat Baru</span>
                    <PerkebunanFormInput
                      modelValue={f().namaObat}
                      placeholder="Contoh: Minyak sereh wangi"
                      onUpdate:modelValue={(val) => { f().namaObat = val }}
                    />
                  </div>
                ) : (
                  <div class="form-group">
                    <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Pilih Nama Obat</span>
                    <PerkebunanFormSelect
                      modelValue={f().namaObat}
                      options={filteredObatOptions.value}
                      placeholder="Pilih Nama Obat"
                      onUpdate:modelValue={(val) => { 
                        f().namaObat = val 
                        if (val === 'Minyak sereh wangi') {
                          f().jenisObat = 'Pestisida'
                          f().satuanVolumeObat = 'Mililiter (ml)'
                          if (!f().namaOPT) f().namaOPT = 'Tungau Merah'
                        } else if (val === 'Trichoderma') {
                          f().jenisObat = 'Fungisida'
                          f().satuanVolumeObat = 'Gram (g)'
                          if (!f().namaOPT) f().namaOPT = 'Kanker Batang & Busuk Akar'
                        } else if (val === 'Nimba') {
                          f().jenisObat = 'Pestisida'
                          f().satuanVolumeObat = 'Mililiter (ml)'
                          if (!f().namaOPT) f().namaOPT = 'Kutu Putih'
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
                const typeLower = (s.type || '').toLowerCase()
                return (typeLower === 'pengolahan pupuk' || typeLower === 'pengolahan_pupuk') && (payloadItem?.selectedRincian?.includes('Fermentasi') || payloadItem?.rincian?.includes('Fermentasi')) && !(payloadItem?.selectedRincian?.includes('Cek') || payloadItem?.rincian?.includes('Cek'))
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
                          {fermentationRecommendation.value.recipeType === 'cucian_beras' ? (
                            <>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">Air Cucian Beras</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.materialUsed} Liter</strong>
                              </div>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">Air Kelapa</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.airKelapa} Liter</strong>
                              </div>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">Ragi Tape</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.ragiTape}</strong>
                              </div>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">Gula Merah</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.gulaMerah} kg</strong>
                              </div>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; grid-column: span 2;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">EM4 / Dekomposer</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.decomposer} mL</strong>
                              </div>
                            </>
                          ) : fermentationRecommendation.value.recipeType === 'em4_poc' ? (
                            <>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">EM4</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.em4Volume} Liter</strong>
                              </div>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">Molase (Tetes Tebu)</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.molaseVolume} Liter</strong>
                              </div>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">Kotoran Domba / Organik</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.kotoranDombaKg} kg</strong>
                              </div>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">Dedak / Katul</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.dedakKg} kg</strong>
                              </div>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem; grid-column: span 2;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">Air Bersih</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.water} Liter</strong>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">Bahan Mentah</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.materialUsed} kg ({fermentationRecommendation.value.materialLabel})</strong>
                              </div>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">Dekomposer</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.decomposer} ml</strong>
                              </div>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">Molase</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.molase} ml</strong>
                              </div>
                              <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.65rem 0.75rem;">
                                <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700; display: block;">Air Bersih</span>
                                <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem; display: block;">{fermentationRecommendation.value.water} Liter</strong>
                              </div>
                            </>
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

                    {/* Manual Component Form Fields specifically for POC (Pupuk Organik Cair) */}
                    {((f().hasilJadi || '').toLowerCase().includes('cair') || (f().hasilJadi || '').toLowerCase().includes('poc')) ? (
                      <>
                        {/* 0. Bahan Utama */}
                        <div class="form-group" style="margin-top: 1rem;">
                          <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Bahan Utama</span>
                          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; width: 100%;">
                            <div style="flex: 2 1 180px; min-width: 140px;">
                              <PerkebunanFormSelect
                                modelValue={f().bahanUtama || f().bahanMentahId}
                                options={bahanMentahOptions.value}
                                placeholder="Pilih Bahan Utama"
                                onUpdate:modelValue={(val) => { f().bahanUtama = val; f().bahanMentahId = val; }}
                              />
                            </div>
                            <div style="flex: 1 1 90px; min-width: 80px;">
                              <PerkebunanFormInput
                                type="number"
                                modelValue={f().bahanUtamaQty || f().qty}
                                placeholder="Jumlah"
                                onUpdate:modelValue={(val) => { f().bahanUtamaQty = val }}
                              />
                            </div>
                            <div style="flex: 1 1 90px; min-width: 80px;">
                              <PerkebunanFormSelect
                                modelValue={f().bahanUtamaUnit || f().unit || 'Liter'}
                                options={['Liter', 'kg', 'mL', 'gram', 'karung', 'botol'].map(u => ({ value: u, label: u }))}
                                placeholder="Satuan"
                                onUpdate:modelValue={(val) => { f().bahanUtamaUnit = val }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 1. Dekomposer */}
                        <div class="form-group">
                          <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Dekomposer</span>
                          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; width: 100%;">
                            <div style="flex: 2 1 180px; min-width: 140px;">
                              <PerkebunanFormSelect
                                modelValue={f().dekomposer}
                                options={decomposerOptions.value}
                                placeholder="Nama Dekomposer"
                                onUpdate:modelValue={(val) => { f().dekomposer = val }}
                              />
                            </div>
                            <div style="flex: 1 1 90px; min-width: 80px;">
                              <PerkebunanFormInput
                                type="number"
                                modelValue={f().dekomposerQty}
                                placeholder="Jumlah"
                                onUpdate:modelValue={(val) => { f().dekomposerQty = val }}
                              />
                            </div>
                            <div style="flex: 1 1 90px; min-width: 80px;">
                              <PerkebunanFormSelect
                                modelValue={f().dekomposerUnit}
                                options={['mL', 'Liter', 'kg', 'gram'].map(u => ({ value: u, label: u }))}
                                placeholder="Satuan"
                                onUpdate:modelValue={(val) => { f().dekomposerUnit = val }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2. Molase / Pemanis */}
                        <div class="form-group">
                          <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Molase / Pemanis</span>
                          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; width: 100%;">
                            <div style="flex: 2 1 180px; min-width: 140px;">
                              <PerkebunanFormSelect
                                modelValue={f().molase}
                                options={molaseOptions.value}
                                placeholder="Nama Molase"
                                onUpdate:modelValue={(val) => { f().molase = val }}
                              />
                            </div>
                            <div style="flex: 1 1 90px; min-width: 80px;">
                              <PerkebunanFormInput
                                type="number"
                                modelValue={f().molaseQty}
                                placeholder="Jumlah"
                                onUpdate:modelValue={(val) => { f().molaseQty = val }}
                              />
                            </div>
                            <div style="flex: 1 1 90px; min-width: 80px;">
                              <PerkebunanFormSelect
                                modelValue={f().molaseUnit}
                                options={['Liter', 'mL', 'kg', 'gram'].map(u => ({ value: u, label: u }))}
                                placeholder="Satuan"
                                onUpdate:modelValue={(val) => { f().molaseUnit = val }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3. Radio Button Bahan Tambahan */}
                        <div class="form-group" style="background: #f9fafb; padding: 0.85rem; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
                          <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.5rem;">Apakah ada Bahan Tambahan?</span>
                          <div style="display: flex; gap: 1.5rem; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap;">
                            <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer; font-weight: 600; color: #374151; font-size: 0.9rem;">
                              <input
                                type="radio"
                                name="adaBahanTambahan"
                                value="ya"
                                checked={f().adaBahanTambahan === 'ya'}
                                onChange={() => { f().adaBahanTambahan = 'ya' }}
                              />
                              Ya (Ada)
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer; font-weight: 600; color: #374151; font-size: 0.9rem;">
                              <input
                                type="radio"
                                name="adaBahanTambahan"
                                value="tidak"
                                checked={f().adaBahanTambahan !== 'ya'}
                                onChange={() => { f().adaBahanTambahan = 'tidak' }}
                              />
                              Tidak (Tanpa Bahan Tambahan)
                            </label>
                          </div>

                          {f().adaBahanTambahan === 'ya' && (
                            <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.65rem;">
                              {(Array.isArray(f().bahanTambahanItems) ? f().bahanTambahanItems : []).map((item: any, idx: number) => (
                                <div key={idx} style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; width: 100%;">
                                  <div style="flex: 2 1 150px; min-width: 120px;">
                                    <PerkebunanFormSelect
                                      modelValue={item.nama}
                                      options={bahanTambahanOptions.value}
                                      placeholder="Pilih Bahan Tambahan"
                                      onUpdate:modelValue={(val) => { item.nama = val }}
                                    />
                                  </div>
                                  <div style="flex: 1 1 80px; min-width: 70px;">
                                    <PerkebunanFormInput
                                      type="number"
                                      modelValue={item.qty}
                                      placeholder="Jumlah"
                                      onUpdate:modelValue={(val) => { item.qty = val }}
                                    />
                                  </div>
                                  <div style="flex: 1 1 80px; min-width: 70px;">
                                    <PerkebunanFormSelect
                                      modelValue={item.unit}
                                      options={['Liter', 'mL', 'kg', 'gram', 'butir', 'karung'].map(u => ({ value: u, label: u }))}
                                      placeholder="Satuan"
                                      onUpdate:modelValue={(val) => { item.unit = val }}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeBahanTambahanItem(idx)}
                                    style="padding: 0.45rem 0.65rem; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; border-radius: 0.375rem; font-weight: 700; cursor: pointer; font-size: 0.85rem;"
                                    title="Hapus Bahan Ini"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={addBahanTambahanItem}
                                style="align-self: flex-start; margin-top: 0.25rem; padding: 0.45rem 0.85rem; background: #2e3b1f; color: #ffffff; border: none; border-radius: 0.375rem; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: background 0.2s;"
                                onMouseover={(e) => { if (e.currentTarget) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1f2915'; }}
                                onMouseout={(e) => { if (e.currentTarget) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2e3b1f'; }}
                              >
                                + Tambah Bahan Tambahan
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 4. Air Bersih */}
                        <div class="form-group">
                          <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Air Bersih</span>
                          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; width: 100%;">
                            <div style="flex: 1 1 140px; min-width: 100px;">
                              <PerkebunanFormInput
                                type="number"
                                modelValue={f().jumlahAir}
                                placeholder="Jumlah Air"
                                onUpdate:modelValue={(val) => { f().jumlahAir = val }}
                              />
                            </div>
                            <div style="flex: 1 1 120px; min-width: 100px;">
                              <PerkebunanFormSelect
                                modelValue={f().satuanVolumeAir}
                                options={[
                                  { value: 'Liter (L)', label: 'Liter (L)' },
                                  { value: 'Mililiter (ml)', label: 'Mililiter (ml)' }
                                ]}
                                placeholder="Satuan Air"
                                onUpdate:modelValue={(val) => { f().satuanVolumeAir = val }}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Standard Composition for Non-POC (e.g. Kompos / Padat) */}
                        <div class="form-group" style="margin-top: 1rem;">
                          <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Dekomposer</span>
                          <PerkebunanFormSelect
                            modelValue={f().dekomposer}
                            options={decomposerOptions.value}
                            placeholder="Dekomposer"
                            onUpdate:modelValue={(val) => { f().dekomposer = val }}
                          />
                        </div>
                        <div class="form-group">
                          <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Molase / Pemanis</span>
                          <PerkebunanFormSelect
                            modelValue={f().molase}
                            options={molaseOptions.value}
                            placeholder="Molase"
                            onUpdate:modelValue={(val) => { f().molase = val }}
                          />
                        </div>
                        <div class="form-group">
                          <span class="field-label" style="font-weight: 700; color: #1f2937; display: block; margin-bottom: 0.45rem;">Jumlah Air (Liter)</span>
                          <PerkebunanFormInput
                            type="number"
                            modelValue={f().jumlahAir}
                            placeholder="Jumlah Air"
                            onUpdate:modelValue={(val) => { f().jumlahAir = val }}
                          />
                        </div>
                      </>
                    )}
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
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 0.5rem;">
                          <div style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.5rem 0.75rem; display: flex; flex-direction: column; grid-column: span 2;">
                            <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 700;">Jumlah Hasil Fermentasi</span>
                            <strong style="font-size: 0.9rem; color: #2e3b1f; margin-top: 0.15rem;">
                              {selectedFermentationDetails.value.qty} {selectedFermentationDetails.value.unit}
                            </strong>
                          </div>
                          {selectedFermentationDetails.value.items.map((it: any, idx: number) => (
                            <div key={idx} style="background: #ffffff; border: 1px solid #ebdcb9; border-radius: 0.5rem; padding: 0.5rem 0.75rem; display: flex; flex-direction: column;">
                              <span style="font-size: 0.75rem; color: #7f8c70; font-weight: 600;">{it.label}</span>
                              <strong style="font-size: 0.85rem; color: #2e3b1f; margin-top: 0.15rem; word-break: break-word;" title={it.value}>
                                {it.value}
                              </strong>
                            </div>
                          ))}
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
