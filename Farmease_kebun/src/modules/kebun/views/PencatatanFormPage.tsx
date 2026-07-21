import { defineComponent, computed, ref, onMounted, onUnmounted, Teleport, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { submitPencatatanSubmission } from '@/store/operatorAdmin'
import { userSession, landSession, landsList, fetchLandsList, prefilledPencatatanTaskId } from '@/store/navigation'
import KebunGenericFormFieldsRaw from '../components/pencatatan/KebunGenericFormFields'
import PencatatanInfoCard from '../components/pencatatan/PencatatanInfoCard'
import PencatatanSelectionField from '../components/pencatatan/PencatatanSelectionField'
import PanduanTeknisBanner from '../components/pencatatan/PanduanTeknisBanner'
import PencatatanModeToggle from '../components/pencatatan/PencatatanModeToggle'
import PencatatanFormContainer from '../components/pencatatan/PencatatanFormContainer'
import TreeSelectionGrid, { type TreeItem } from '../components/pencatatan/TreeSelectionGrid'
import RincianBottomSheet from '../components/pencatatan/RincianBottomSheet'
import JenisBottomSheet from '../components/pencatatan/JenisBottomSheet'
import PencatatanPrimaryButton from '../components/pencatatan/PencatatanPrimaryButton'
import { manureApi, pohonApi, pemangkasanApi, submissionsApi } from '@/shared/api'
import {
  fetchPencatatanTypesCatalog,
  jenisPencatatanList,
  getRincianForJenis,
  addRincianPencatatan,
} from '@/store/pencatatanTypes'
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css'

const KebunGenericFormFields = KebunGenericFormFieldsRaw as any

const getLahanIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('alpukat')) return '/icon/alpukat.png'
  if (n.includes('kelengkeng')) return '/icon/kelengkeng.png'
  return '/icon/lahan.png'
}


const panduanTeknisByRincian: Record<string, string> = {
  'Penjarangan Buah': 'Lakukan saat buah diameter ±2 cm. Sisakan 2-3 buah per tandan. Buang buah kecil, cacat, atau terserang OPT.',
  'Pembungkusan Buah': 'Bungkus setelah penjarangan. Tujuan: cegah lalat buah, penggerek, trips, dan kutu putih.',
  'Merangsang Pembungaan': 'Aplikasikan perangsang bunga pada fase vegetatif akhir. Pastikan kelembapan tanah cukup sebelum aplikasi.',
  'Pemangkasan Pemeliharaan': 'Pangkas ranting yang mati, sakit, atau terlalu rimbun, bentuk tajuk agar cahaya merata, dan potong cabang tua bertahap.',
  'Panen Buah': 'Panen saat buah mencapai ukuran dan warna matang. Gunakan gunting panen steril.',
  'Pupuk Organik Cair': 'Aplikasikan pupuk organik cair sesuai dosis anjuran. Semprotkan secara merata pada daun atau siram ke tanah.',
  'Pupuk Organik Padat': 'Gunakan pupuk organik padat matang (kompos/pupuk kandang). Benamkan di sekitar proyeksi tajuk.',
  'Pupuk Kimia': 'Gunakan pupuk kimia (makro/mikro) sesuai rekomendasi uji tanah. Aplikasikan dengan teknik pemupukan melingkar/tebar.',
  'Penyiraman Rutin': 'Siram pagi atau sore hari. Pastikan drainase baik agar tidak terjadi genangan.',
  'Pembersihan Gulma': 'Bersihkan gulma secara rutin. Gunakan mulsa untuk menekan pertumbuhan kembali.',
  'Aplikasi Pestisida': 'Gunakan pestisida terdaftar sesuai dosis. Pakai APD lengkap. Catat waktu dan jenis aplikasi.',
  'Cek Fermentasi': 'Lakukan pengecekan berkala secara visual dan manual tanpa alat canggih:<br/><span style="display:block; margin-top:0.35rem; padding-left:0.5rem;">• <b>Aktivitas Pengecekan:</b> Buka penutup sebentar untuk membuang gas menumpuk, balik tumpukan agar aerasi merata, atau siram air jika terasa kering.</span><span style="display:block; margin-top:0.35rem; padding-left:0.5rem;">• <b>Kondisi Fisik:</b> Suhu harus terasa hangat ketika tumpukan diraba, lembap seperti spons (tidak kering / tidak terlalu basah), dan timbul miselium/jamur putih halus (tanda baik).</span><span style="display:block; margin-top:0.35rem; padding-left:0.5rem;">• <b>Aroma:</b> Aroma harus berbau harum asam manis segar khas tape, bukan bau busuk got menyengat.</span>',
}

export default defineComponent({
  name: 'PencatatanFormPage',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const selectedJenis = ref<string>((route.query.jenis as string) || 'Jenis Pencatatan')
    const selectedRincian = ref<string>((route.query.rincian as string) || 'Rincian Pencatatan')
    const activeMode = ref<'lahan' | 'pohon'>('pohon')

    const currentDate = ref(new Date())
    const timerId = setInterval(() => { currentDate.value = new Date() }, 1000)

    onUnmounted(() => clearInterval(timerId))

    const formattedDate = computed(() => {
      const d = currentDate.value
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      return `Tanggal : ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    })

    const formattedTime = computed(() => {
      const d = currentDate.value
      return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')} WIB`
    })

    const kindTitle = computed(() => {
      if (selectedJenis.value === 'Jenis Pencatatan') return ''
      const lower = selectedJenis.value.toLowerCase()
      if (lower.includes('perawatan') || lower.includes('hama') || lower.includes('penyakit')) return 'Pemberian Obat'
      return selectedJenis.value.replace(/^Pencatatan\s+/u, '')
    })

    const panduanTeknis = computed(() => panduanTeknisByRincian[selectedRincian.value] || '')

    // ── Jenis modal ─────────────────────────────────────────
    const showJenisModal = ref(false)
    const jenisSearch = ref('')
    const draftJenis = ref('')

    const openJenisModal = () => {
      draftJenis.value = selectedJenis.value
      jenisSearch.value = ''
      showJenisModal.value = true
    }

    const saveJenis = () => {
      if (draftJenis.value && draftJenis.value !== 'Jenis Pencatatan') {
        selectedJenis.value = draftJenis.value
        // Reset rincian when jenis changes
        selectedRincian.value = 'Rincian Pencatatan'
        draftRincian.value = ''
      }
      showJenisModal.value = false
    }

    // ── Rincian modal ───────────────────────────────────────
    const showRincianModal = ref(false)
    const rincianSearch = ref('')
    const draftRincian = ref('')

    const availableRincianList = computed(() => getRincianForJenis(selectedJenis.value))

    const openRincianModal = () => {
      draftRincian.value = selectedRincian.value
      rincianSearch.value = ''
      showRincianModal.value = true
    }

    const saveRincian = () => {
      if (draftRincian.value && draftRincian.value !== 'Rincian Pencatatan') {
        selectedRincian.value = draftRincian.value
      }
      showRincianModal.value = false
    }

    const manureStock = ref(0)
    const manureCollections = ref<any[]>([])
    const fetchManureStock = async () => {
      try {
        const list: any[] = await manureApi.getList()
        manureStock.value = list.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
        manureCollections.value = list.filter((m: any) => m.activity_type === 'collection')
      } catch { /* silent */ }
    }

    const formState = ref({
      kodePohon: 'LA001', deskripsiPenanaman: '', jumlahPemangkasan: '',
      deskripsiPemangkasan: '', jenisObat: 'Jenis Obat', kodePohonPerawatan: 'Kode Pohon',
      bagianPohon: 'Bagian Pohon', teknikPemberian: 'Teknik Pemberian Obat', namaObat: '',
      dosisObat: '', deskripsiPerawatan: '', jenisPupuk: 'Jenis Pupuk', fasePohon: 'Vegetatif', statusProduktivitas: 'usia produktif (> 4 tahun)',
      kodePohonPemupukan: 'Kode Pohon', jumlahBeratPupuk: '', deskripsiPemupukan: '',
      jumlahPanen: '', beratPanen: '', deskripsiPanen: '', deskripsiPembersihan: '',
      metodePemangkasan: 'Metode Pemangkasan', tujuanPemanfaatan: 'Pemanfaatan',
      pemanfaatan: 'Pupuk Organik Kebun', qty: '', unit: 'kg', kotoranState: 'basah',
      jumlahStokMasuk: '', jumlahStokKeluar: '', catatanStok: '',
      jenisPupukDetail: 'Jenis Pupuk Detail', teknikPemupukan: 'Teknik Pemupukan',
      jenisLimbah: 'Jenis Limbah', beratLimbah: '', jenisPerangsang: 'Jenis Perangsang',
      dosisPerangsang: '', deskripsiPembuahan: '', alasanPenanaman: 'Alasan Penanaman',
      kodePohonManual: '', teknikPengendalian: 'Teknik Pengendalian', namaPestisida: '',
      dosisPestisida: '', volumeAir: '', namaGejala: '', targetHama: '',
      teknikPenyiraman: 'Teknik Penyiraman', sesiPenyiraman: 'Semua Sesi', deskripsiPenyiraman: '',
      metodePerlakuan: 'Metode Perlakuan', jenisHormon: '',
      diameterBuah: '', satuanDiameter: 'Satuan Diameter',
      jumlahBuahDibuang: '', sisaBuahPerTandan: '',
      bahanPembungkus: 'Bahan Pembungkus', jumlahBuahDibungkus: '',
      kondisiPanen: 'Kondisi Panen', caraPanen: 'Cara Panen', satuanBerat: 'Satuan Berat',
      jenisBibit: '',
      namaOPT: '',
      volumeObat: '',
      satuanVolumeObat: 'Satuan Volume',
      teknikPemberianObat: 'Teknik Pemberian Obat',
      volumeLarutan: '',
      satuanVolumeLarutan: 'Satuan Volume',
      satuanVolumeAir: 'Liter (L)',
      tanggalKadaluarsa: '',
      alatPembersihan: 'Alat Pembersihan',
      jenisGulma: 'Jenis Gulma',
      beratGulma: '',
      bahanPembumbun: 'Bahan Pembumbunan',
      beratBahanPembumbun: '',
      bagianPembersihan: 'Bagian Pembersihan',
      bahanMentahId: '',
      dekomposer: '',
      molase: '',
      jumlahAir: '',
      bahanTambahan: '',
      pruningId: '',
      hasilJadi: 'Pupuk Organik Cair',
      batchFermentasiId: '',
      jenisFermentasi: '',
      siapGuna: 'belum',
      kategoriBahan: '',
      suhu: '',
      kelembapan: '',
      ph: '',
      aroma: 'Asam Segar / Bau Tape',
      kondisiFisik: '',
      aktivitasPengecekan: '',
      tipeStok: 'baru',
    })

    const selectedVarietas = ref('Semua Varietas')
    const selectedTrees = ref<string[]>([])
    const allTrees = ref<TreeItem[]>([])

    const varietasOptions = computed(() => {
      const set = new Set(allTrees.value.map(t => t.varietas).filter(Boolean))
      return ['Semua Varietas', ...Array.from(set)]
    })


    const filteredTrees = computed(() => {
      let result = allTrees.value
      if (selectedVarietas.value !== 'Semua Varietas') {
        result = result.filter(t => t.varietas === selectedVarietas.value)
      }
      
      const isBelumProduktif = formState.value.statusProduktivitas?.includes('0 - 3') || formState.value.statusProduktivitas?.includes('belum')
      const isProduktif = formState.value.statusProduktivitas?.includes('> 4') || (formState.value.statusProduktivitas?.includes('produktif') && !formState.value.statusProduktivitas?.includes('belum'))
      
      if (formState.value.fasePohon && formState.value.fasePohon !== 'Fase Pohon') {
        result = result.filter(t => t.fase === formState.value.fasePohon)
      } else if (isBelumProduktif) {
        result = result.filter(t => t.fase === 'Vegetatif')
      }

      if (isBelumProduktif) {
        result = result.filter(t => (t.umur ?? 0) <= 3)
      } else if (isProduktif) {
        const temp = result.filter(t => (t.umur ?? 0) >= 4)
        // If they ask for productive phase of this category, but no trees of that phase are >= 4 years old,
        // we fall back to displaying the vegetative trees anyway instead of rendering a blank list.
        if (temp.length > 0) {
          result = temp
        }
      }
      
      return result
    })

    const currentObatStocks = computed(() => {
      const stockMap: Record<string, { qty: number; unit: string; type: string; expiry: string }> = {
        'Mankozeb': { qty: 500, unit: 'g', type: 'fungisida', expiry: '02 - 12 - 2026' },
        'Fungisida Tembaga': { qty: 300, unit: 'ml', type: 'fungisida', expiry: '02 - 12 - 2026' },
        'Sipermetrin 50EC': { qty: 500, unit: 'ml', type: 'insektisida', expiry: '02 - 12 - 2026' },
        'Imidakloprid': { qty: 300, unit: 'ml', type: 'insektisida', expiry: '02 - 12 - 2026' },
        'Ekstrak Nimba': { qty: 500, unit: 'ml', type: 'pestisida', expiry: '02 - 12 - 2026' },
        'Ekstrak Bawang Putih': { qty: 300, unit: 'ml', type: 'pestisida', expiry: '02 - 12 - 2026' },
      }

      // Add from approved stok obat submissions
      allSubmissions.value
        .filter((s: any) => (s.type || '').toLowerCase() === 'stok obat' && s.approvalStatus === 'approved')
        .forEach((s: any) => {
          const item = s.payload?.data?.items?.[0] || {}
          const name = item.namaObat
          if (name) {
            const val = parseFloat(item.volumeObat) || 0
            const unit = item.satuanVolumeObat || 'ml'
            const expiry = item.tanggalKadaluarsa || '-'
            const type = (item.jenisObat || item.selectedRincian || '').toLowerCase()
            if (stockMap[name]) {
              stockMap[name].qty += val
            } else {
              stockMap[name] = { qty: val, unit, type, expiry }
            }
          }
        })

      // Deduct from approved pemberian obat usages
      allSubmissions.value
        .filter((s: any) => (s.type || '').toLowerCase() === 'pemberian obat' && s.approvalStatus === 'approved')
        .forEach((s: any) => {
          const item = s.payload?.data?.items?.[0] || {}
          const name = item.namaObat
          if (name && stockMap[name]) {
            const val = parseFloat(item.volumeObat) || 0
            stockMap[name].qty = Math.max(0, stockMap[name].qty - val)
          }
        })

      return stockMap
    })

    const obatStocks = computed(() => {
      const r = (selectedRincian.value || '').toLowerCase()
      const pool = Object.entries(currentObatStocks.value).map(([name, data]) => {
        return {
          name,
          qty: `${data.qty.toFixed(0)} ${data.unit}`,
          expiry: data.expiry,
          type: data.type,
          val: data.qty,
          unit: data.unit
        }
      }).filter(o => o.val > 0)

      if (r.includes('fungisida')) {
        return pool.filter(o => o.type.includes('fungisida'))
      } else if (r.includes('insektisida')) {
        return pool.filter(o => o.type.includes('insektisida'))
      } else if (r.includes('pestisida')) {
        return pool.filter(o => o.type.includes('pestisida'))
      }
      return pool
    })

    const parseQty = (qtyStr: any, unitStr: string) => {
      const val = parseFloat(qtyStr) || 0
      const u = (unitStr || '').toLowerCase()
      if (u.includes('gram') || u === 'g') {
        return val / 1000
      }
      if (u.includes('liter') || u === 'l') {
        return val * 1000
      }
      return val
    }

    const formatQty = (val: number, name: string) => {
      const n = name.toLowerCase()
      const isLiquid = n.includes('poc') || n.includes('cair') || n.includes('em4') || n.includes('molase') || n.includes('gula') || n.includes('dekomposer') || n.includes('tetes tebu') || n.includes('tembaga') || n.includes('obat')
      if (isLiquid) {
        if (val >= 1000) {
          return `${(val / 1000).toFixed(1)} Liter (L)`
        }
        return `${val.toFixed(0)} Mililiter (ml)`
      } else {
        return `${val.toFixed(1)} Kilogram (kg)`
      }
    }

    const rawLedger = computed(() => {
      const pupukStockMap: Record<string, number> = {}

      const bahanStockMap: Record<string, number> = {
        'Kotoran domba': manureStock.value,
        'Hasil pemangkasan (kanopi, ranting, daun)': 0,
        'Hasil pembersihan (gulma, serasah)': 0,
        'Limbah organik (contohnya sisa bahan makanan, sisa sayuran, dll)': 0,
        'Air kelapa': 0,
        'Lainnya': 0,
        'EM4': 0,
        'MOL (Mikroorganisme Lokal)': 0,
        'Dekomposer Lokal': 0,
        'Tetes Tebu (Molase)': 0,
        'Air Gula Merah': 0,
        'Air Gula Pasir': 0,
      }

      const pruningMap: Record<string, number> = {}
      ;(pruningCollections.value || []).forEach((p: any) => {
        pruningMap[String(p.id)] = Number(p.jumlah || 0)
      })

      allSubmissions.value
        .filter((s: any) => s.approvalStatus === 'approved')
        .forEach((s: any) => {
          const type = (s.type || '').toLowerCase()
          const item = s.payload?.data?.items?.[0] || {}

          if (type === 'pemangkasan' || type === 'pembersihan') {
            const pemanfaatan = (item.tujuanPemanfaatan || item.pemanfaatan || '').toLowerCase()
            const isCompost = pemanfaatan === 'kompos' || (pemanfaatan !== 'pakan ternak' && pemanfaatan !== 'dibuang')
            if (!isCompost) return

            if (type === 'pemangkasan') {
              const qty = Number(item.jumlah || item.jumlahPemangkasan || 0)
              bahanStockMap['Hasil pemangkasan (kanopi, ranting, daun)'] = (bahanStockMap['Hasil pemangkasan (kanopi, ranting, daun)'] || 0) + qty
            } else if (type === 'pembersihan') {
              const berat = Number(item.beratGulma || item.beratLimbah || item.beratBahanPembumbun || 0)
              bahanStockMap['Hasil pembersihan (gulma, serasah)'] = (bahanStockMap['Hasil pembersihan (gulma, serasah)'] || 0) + berat
            }
          }

          else if (type === 'stok pupuk') {
            const val = parseQty(item.volumeObat, item.satuanVolumeObat)
            const name = item.namaObat || ''
            if (!name) return

            if (item.tujuanPemanfaatan === 'bahan') {
              bahanStockMap[name] = (bahanStockMap[name] || 0) + val
            } else {
              const expiry = item.tanggalKadaluarsa || '-'
              const key = `${name}_#_${expiry}`
              pupukStockMap[key] = (pupukStockMap[key] || 0) + val
            }
          }

          else if ((type === 'pengolahan pupuk' || type === 'pengolahan_pupuk') && (item.selectedRincian?.includes('Fermentasi') || item.rincian?.includes('Fermentasi')) && !(item.selectedRincian?.includes('Cek') || item.rincian?.includes('Cek'))) {
            // Initial Fermentasi: Deduct raw ingredient stocks ONLY, DO NOT add to usable pupuk stock yet!
            const outQty = parseFloat(item.qty) || 0
            const name = item.hasilJadi || ''

            const isCair = name.toLowerCase().includes('cair') || name.toLowerCase().includes('poc');
            const decName = item.dekomposer
            if (decName) {
              const decAmt = (isCair ? 20 : 10) * outQty
              bahanStockMap[decName] = Math.max(0, (bahanStockMap[decName] || 0) - decAmt)
            }

            const molName = item.molase
            if (molName) {
              const molAmt = (isCair ? 20 : 10) * outQty
              bahanStockMap[molName] = Math.max(0, (bahanStockMap[molName] || 0) - molAmt)
            }

            const factor = isCair ? 0.3 : 1.0;
            const consumedKg = factor * outQty;
            const rawName = item.bahanMentahId || 'Kotoran domba';
            bahanStockMap[rawName] = Math.max(0, (bahanStockMap[rawName] || 0) - consumedKg);
          }

          else if ((type === 'pengolahan pupuk' || type === 'pengolahan_pupuk') && (item.selectedRincian?.includes('Cek') || item.rincian?.includes('Cek'))) {
            // Cek Fermentasi: ONLY add to available pupuk stock if declared ready / panen!
            const isReady = item.siapGuna === 'siap' || item.siapGuna === true || item.kondisiFisik === 'Siap Digunakan' || item.aktivitasPengecekan === 'Panen / Ready' || item.statusFermentasi === 'siap'
            if (isReady) {
              const origSub = (allSubmissions.value || []).find((sub: any) => String(sub.id) === String(item.batchFermentasiId))
              const origItem = (origSub?.payload as any)?.data?.items?.[0] || item
              const outVal = parseQty(origItem.qty || item.qty || 5, origItem.unit || item.unit || 'Liter')
              
              let baseName = origItem.hasilJadi || 'POC'
              const isPOC = baseName.toLowerCase().includes('poc') || baseName.toLowerCase().includes('cair')
              if (isPOC) {
                const rawMat = (origItem.bahanMentahId || origItem.bahanUtama || '').toLowerCase()
                if (rawMat.includes('cucian beras') || rawMat.includes('beras')) {
                  baseName = 'POC Air Cucian Beras'
                } else if (rawMat.includes('kelapa')) {
                  baseName = 'POC Air Kelapa'
                } else if (rawMat.includes('domba')) {
                  baseName = 'POC Kotoran Domba'
                } else if (rawMat.includes('em4')) {
                  baseName = 'POC EM4 & Molase'
                } else if (baseName && baseName !== 'Pupuk Organik Cair' && baseName !== 'POC') {
                  baseName = baseName
                } else {
                  baseName = 'POC Air Cucian Beras'
                }
              }

              const key = `${baseName}_#_-`
              pupukStockMap[key] = (pupukStockMap[key] || 0) + outVal
            }
          }

          else if (type === 'pemupukan') {
            const name = item.jenisPupukDetail || ''
            if (!name) return

            const nameLower = name.toLowerCase()
            const isCair = nameLower.includes('poc') || nameLower.includes('cair')
            const isOrganik = nameLower.includes('kandang') || nameLower.includes('kotoran') || nameLower.includes('kompos') || nameLower.includes('organik')
            let unit = 'gram'
            if (isCair) unit = 'liter'
            else if (isOrganik) unit = 'kilogram'
            const usedVal = parseQty(item.jumlahBeratPupuk, unit)

            // Deduct using FIFO based on expiration date
            let remainingToDeduct = usedVal
            const matchingKeys = Object.keys(pupukStockMap)
              .filter(k => k.startsWith(`${name}_#_`))
              .sort((a, b) => {
                const expA = a.split('_#_')[1] || '-'
                const expB = b.split('_#_')[1] || '-'
                if (expA === '-') return 1  // '-' goes last
                if (expB === '-') return -1 // '-' goes last
                return expA.localeCompare(expB)
              })

            for (const key of matchingKeys) {
              if (remainingToDeduct <= 0) break
              const currentQty = pupukStockMap[key] || 0
              if (currentQty >= remainingToDeduct) {
                pupukStockMap[key] = currentQty - remainingToDeduct
                remainingToDeduct = 0
              } else {
                pupukStockMap[key] = 0
                remainingToDeduct -= currentQty
              }
            }
          }
        })

      return { pupukStockMap, bahanStockMap, pruningMap }
    })

    const pupukStocks = computed(() => {
      const r = selectedRincian.value.toLowerCase()
      const landName = (landSession.value?.name || '').toLowerCase()
      const map = rawLedger.value.pupukStockMap

      const pool = Object.entries(map)
        .filter(([_, val]) => val > 0)
        .map(([key, val]) => {
          const [name, expiry] = key.split('_#_')
          let type = 'organik'
          let form = 'padat'
          const nameLower = (name || '').toLowerCase()
          if (name === 'NPK' || name === 'Urea' || name === 'SP - 36' || name === 'Fungisida Tembaga' || name === 'NPK Kelengkeng') {
            type = 'anorganik'
          }
          if (nameLower.includes('cair') || nameLower.includes('poc') || nameLower.includes('larutan') || nameLower.includes('fungisida')) {
            form = 'cair'
          }

          let displayExpiry = expiry || '-'
          if (displayExpiry !== '-' && displayExpiry.includes('-')) {
            const parts = displayExpiry.split('-')
            if (parts.length === 3 && parts[0]!.length === 4) {
              displayExpiry = `${parts[2]} - ${parts[1]} - ${parts[0]}`
            }
          }

          return {
            name: name || '',
            qty: formatQty(val, name || ''),
            expiry: displayExpiry,
            type,
            form,
            val
          }
        })

      const filteredPool = landName.includes('alpukat') 
        ? pool.filter(p => p.name !== 'NPK Kelengkeng') 
        : pool.filter(p => p.name !== 'NPK' && p.name !== 'Urea' && p.name !== 'SP - 36')

      if (r.includes('cair')) {
        return filteredPool.filter(p => p.form === 'cair')
      } else if (r.includes('padat')) {
        return filteredPool.filter(p => p.form === 'padat')
      } else if (r.includes('organik')) {
        return filteredPool.filter(p => p.type === 'organik')
      } else if (r.includes('kimia') || r.includes('anorganik')) {
        return filteredPool.filter(p => p.type === 'anorganik')
      }
      return filteredPool
    })

    const bahanStocks = computed(() => {
      const map = rawLedger.value.bahanStockMap
      return Object.entries(map).map(([name, val]) => {
        let asal = 'Pembelian / Lainnya'
        if (name.includes('Kotoran domba')) asal = 'Integrasi Peternakan'
        else if (name.includes('pemangkasan')) asal = 'Pemangkasan & Pembersihan'
        else if (name.includes('pembersihan')) asal = 'Kegiatan Pembersihan'
        else if (name.includes('Limbah')) asal = 'Limbah Eksternal'
        return {
          name,
          qty: formatQty(val, name),
          asal,
          val
        }
      })
    })

    const getAvailableFertilizerStock = (name: string) => {
      if (!name) return 0
      const nameLower = name.toLowerCase()
      if (nameLower.includes('kotoran domba') || nameLower === 'kotoran') {
        return manureStock.value * 1000
      }
      const matches = pupukStocks.value.filter(p => {
        const pLower = p.name.toLowerCase()
        return p.name === name || pLower === nameLower || pLower.includes(nameLower) || nameLower.includes(pLower) || (nameLower.includes('poc') && pLower.includes('poc')) || (nameLower.includes('cair') && pLower.includes('cair'))
      })
      return matches.reduce((acc, curr) => acc + (curr.val || 0), 0)
    }

    const selectedPupukStock = computed(() => {
      const selected = formState.value.jenisPupukDetail
      if (!selected) return 0
      return getAvailableFertilizerStock(selected)
    })

    const getStockOf = (name: string) => {
      const match = bahanStocks.value.find((b: any) => b.name === name)
      return match ? match.val : 0
    }

    const pruningStockMap = computed(() => rawLedger.value.pruningMap)

    const getPupukCategory = (name: string, type?: string) => {
      const lower = name.toLowerCase()
      if (type === 'anorganik' || lower.includes('npk') || lower.includes('urea') || lower.includes('sp - 36') || lower.includes('sp-36') || lower.includes('fungisida') || lower.includes('kimia')) {
        return 'Pupuk Kimia'
      }
      if (lower.includes('kandang') || lower.includes('manure')) {
        return 'Pupuk Organik Kandang'
      }
      if (lower.includes('cair') || lower.includes('poc')) {
        return 'Organik Cair'
      }
      if (lower.includes('kompos') || lower.includes('padat')) {
        return 'Organik Kompos'
      }
      return 'Organik Kompos' // fallback for organic
    }

    const groupedPupukStocks = computed(() => {
      const groups: Record<string, typeof pupukStocks.value> = {
        'Pupuk Organik Kandang': [],
        'Organik Kompos': [],
        'Organik Cair': [],
        'Pupuk Kimia': [],
      }
      pupukStocks.value.forEach(stock => {
        const cat = getPupukCategory(stock.name, stock.type)
        if (!groups[cat]) {
          groups[cat] = []
        }
        groups[cat].push(stock)
      })
      return groups
    })

    const groupedBahanStocks = computed(() => {
      const groups: Record<string, typeof bahanStocks.value> = {
        'Bahan Mentah': [],
        'Bahan Dekomposer': [],
        'Bahan Molase': [],
        'Bahan Tambahan': [],
      }
      
      const submissions = allSubmissions.value
      
      const bahanCategories: Record<string, string> = {
        'Kotoran domba': 'Bahan Mentah',
        'Hasil pemangkasan (kanopi, ranting, daun)': 'Bahan Mentah',
        'Hasil pembersihan (gulma, serasah)': 'Bahan Mentah',
        'Limbah organik (contohnya sisa bahan makanan, sisa sayuran, dll)': 'Bahan Mentah',
        'Air kelapa': 'Bahan Mentah',
        'Lainnya': 'Bahan Mentah',
        'EM4': 'Bahan Dekomposer',
        'MOL (Mikroorganisme Lokal)': 'Bahan Dekomposer',
        'Dekomposer Lokal': 'Bahan Dekomposer',
        'Tetes Tebu (Molase)': 'Bahan Molase',
        'Air Gula Merah': 'Bahan Molase',
        'Air Gula Pasir': 'Bahan Molase',
      }

      submissions
        .filter((s: any) => s.approvalStatus === 'approved')
        .forEach((s: any) => {
          const type = (s.type || '').toLowerCase()
          if (type === 'stok pupuk') {
            const item = s.payload?.data?.items?.[0] || {}
            const name = item.namaObat || ''
            if (name && item.tujuanPemanfaatan === 'bahan') {
              const cat = item.kategoriBahan
              if (cat) {
                let normalizedCat = cat
                if (cat === 'Dekomposer') normalizedCat = 'Bahan Dekomposer'
                if (cat === 'Molase') normalizedCat = 'Bahan Molase'
                bahanCategories[name] = normalizedCat
              }
            }
          }
        })

      bahanStocks.value.forEach(b => {
        let cat = bahanCategories[b.name]
        if (!cat) {
          const lower = b.name.toLowerCase()
          if (lower.includes('dekomposer') || lower.includes('em4') || lower.includes('mol')) {
            cat = 'Bahan Dekomposer'
          } else if (lower.includes('molase') || lower.includes('gula') || lower.includes('tebu')) {
            cat = 'Bahan Molase'
          } else if (lower.includes('tambahan') || lower.includes('obat') || lower.includes('zat')) {
            cat = 'Bahan Tambahan'
          } else {
            cat = 'Bahan Mentah'
          }
        }
        let group = groups[cat]
        if (!group) {
          group = []
          groups[cat] = group
        }
        group.push(b)
      })

      return groups
    })

    const pupukOptions = computed(() => {
      const names = pupukStocks.value.map(p => p.name)
      return Array.from(new Set(names))
    })

    const stockBoxTitle = computed(() => {
      const j = selectedJenis.value
      if (j === 'Pemberian Obat' || j === 'Stok Obat') {
        return 'Informasi Stok Obat'
      }
      if (j === 'Pemupukan' || j === 'Stok Pupuk') {
        return 'Informasi Stok Pupuk'
      }
      return ''
    })

    const showPupukInfo = computed(() => {
      const j = selectedJenis.value
      const r = selectedRincian.value
      if (j === 'Stok Pupuk') {
        return r === 'Pendaftaran Pupuk/Bahan Baru' || r === 'Tambah Stok Pupuk (Exp Lama)'
      }
      return j === 'Pemupukan'
    })

    const showBahanInfo = computed(() => {
      const j = selectedJenis.value
      const r = selectedRincian.value
      if (j === 'Stok Pupuk') {
        return r === 'Pendaftaran Pupuk/Bahan Baru' || r === 'Tambah Stok Bahan'
      }
      return j === 'Pengolahan Pupuk' && r.includes('Fermentasi') && !r.includes('Cek')
    })

    watch(selectedTrees, (codes) => {
      formState.value.kodePohon = codes.join(', ')
    }, { deep: true })

    watch(selectedRincian, (newRincian) => {
      if (newRincian === 'Pendaftaran Pupuk/Bahan Baru' || newRincian === 'Pendaftaran Obat Baru') {
        formState.value.tipeStok = 'baru'
      } else {
        formState.value.tipeStok = 'lama'
      }
    }, { immediate: true })

    watch(
      [selectedJenis, selectedRincian],
      ([jenis, rincian]) => {
        if (jenis === 'Penanaman') {
          if (rincian === 'Bibit Baru') {
            activeMode.value = 'lahan'
          } else if (rincian.toLowerCase().includes('penggantian') || rincian.toLowerCase().includes('pergantian')) {
            activeMode.value = 'pohon'
          }
        } else if (jenis === 'Pengolahan Pupuk' || jenis === 'Stok Pupuk' || jenis === 'Stok Obat') {
          activeMode.value = 'lahan'
        }
      },
      { immediate: true }
    )

    watch(kindTitle, (newKind) => {
      const k = (newKind || '').toLowerCase()
      if (k.includes('panen') || k.includes('pembuahan')) {
        formState.value.statusProduktivitas = 'usia produktif (> 4 tahun)'
        formState.value.fasePohon = 'Generatif'
      } else if (k.includes('penanaman')) {
        formState.value.statusProduktivitas = 'usia belum produktif (0 - 3 tahun)'
        formState.value.fasePohon = 'Vegetatif'
      } else {
        formState.value.statusProduktivitas = 'usia produktif (> 4 tahun)'
        formState.value.fasePohon = 'Generatif'
      }
    }, { immediate: true })

    const fetchTrees = async () => {
      try {
        const list = await pohonApi.getList()
        const activeLandCode = landSession.value?.code
        const activeLandName = (landSession.value?.name || '').toLowerCase()
        
        let filtered = list
        if (activeLandCode) {
          const isAlpukat = activeLandCode === 'L001' || activeLandName.includes('alpukat')
          const isKelengkeng = activeLandCode === 'L002' || activeLandName.includes('kelengkeng')
          if (isAlpukat) {
            filtered = list.filter(p => p.kode_pohon.startsWith('LA'))
          } else if (isKelengkeng) {
            filtered = list.filter(p => p.kode_pohon.startsWith('LK'))
          }
        }

        if (filtered && filtered.length > 0) {
          allTrees.value = filtered.map(p => ({
            code: p.kode_pohon,
            varietas: p.jenis || p.nama_pohon || 'Varietas',
            fase: p.status || 'Generatif',
            umur: p.umur || 1,
          }))
          selectedTrees.value = [allTrees.value[0]!.code]
        } else {
          allTrees.value = []
          selectedTrees.value = []
        }
      } catch {
        allTrees.value = []
        selectedTrees.value = []
      }
    }

    const pruningCollections = ref<any[]>([])
    const fetchPruningCollections = async () => {
      try {
        const list = await pemangkasanApi.getList()
        pruningCollections.value = list || []
      } catch { /* silent */ }
    }

    const allSubmissions = ref<any[]>([])
    const fetchAllSubmissions = async () => {
      try {
        const list = await submissionsApi.getList()
        allSubmissions.value = list || []
      } catch { /* silent */ }
    }

    onMounted(() => {
      fetchPencatatanTypesCatalog()
      formState.value.kodePohon = selectedTrees.value.join(', ')
      fetchManureStock()
      fetchTrees()
      fetchPruningCollections()
      fetchAllSubmissions()
    })

    const alertModal = ref({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error' })
    const closeAlertModal = () => { alertModal.value.isOpen = false }

    const isSaving = ref(false)
    const saveRecording = async () => {
      if (isSaving.value) return

      // Automatically set phase and productivity status for Panen, Penanaman, Pembuahan
      const jenisLower = (selectedJenis.value || '').toLowerCase()
      if (jenisLower.includes('panen')) {
        formState.value.statusProduktivitas = 'usia produktif (> 4 tahun)'
        formState.value.fasePohon = 'Generatif'
      } else if (jenisLower.includes('penanaman')) {
        formState.value.statusProduktivitas = 'usia belum produktif (0 - 3 tahun)'
        formState.value.fasePohon = 'Vegetatif'
      } else if (jenisLower.includes('pembuahan')) {
        formState.value.statusProduktivitas = 'usia produktif (> 4 tahun)'
        formState.value.fasePohon = 'Generatif'
      }

      // ── General field validation ──────────────────────────────────────────────
      const showErr = (msg: string) => { alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: msg, type: 'error' } }
      const jenis = selectedJenis.value
      const rincian = selectedRincian.value
      const f = formState.value

      if (!jenis || jenis === 'Jenis Pencatatan') { showErr('Harap pilih jenis pencatatan terlebih dahulu!'); return }
      if (!rincian || rincian === 'Rincian Pencatatan') { showErr('Harap pilih rincian pencatatan terlebih dahulu!'); return }
      const needsTree = !['Stok Obat', 'Stok Pupuk', 'Penanaman', 'Pengolahan Pupuk'].includes(jenis)
      if (activeMode.value === 'pohon' && needsTree && selectedTrees.value.length === 0) { showErr('Harap pilih minimal satu pohon terlebih dahulu!'); return }

      if (jenis === 'Pemupukan') {
        if (!f.jenisPupukDetail || f.jenisPupukDetail === 'Jenis Pupuk Detail' || f.jenisPupukDetail === 'Pilih Pupuk') { showErr('Harap pilih pupuk yang digunakan!'); return }
        if (!f.teknikPemupukan || f.teknikPemupukan === 'Teknik Pemupukan') { showErr('Harap pilih teknik pemupukan!'); return }
        if (!f.jumlahBeratPupuk || parseFloat(f.jumlahBeratPupuk) <= 0) { showErr('Harap masukkan jumlah/dosis pupuk yang valid!'); return }
      }
      if (jenisLower.includes('obat') || jenisLower.includes('perawatan') || jenisLower.includes('hama') || jenisLower.includes('penyakit')) {
        if (activeMode.value === 'pohon' && (!f.bagianPohon || f.bagianPohon === 'Bagian Pohon')) { showErr('Harap pilih bagian pohon yang diobati!'); return }
        if (!f.namaObat || f.namaObat === 'Jenis Obat' || f.namaObat === 'Pilih Obat' || !f.namaObat.trim()) { showErr('Harap pilih atau isi nama obat yang digunakan!'); return }
        if (!f.teknikPemberianObat || f.teknikPemberianObat === 'Teknik Pemberian Obat') { showErr('Harap pilih teknik pemberian obat!'); return }
        if (!f.volumeObat || parseFloat(f.volumeObat) <= 0) { showErr('Harap masukkan volume obat yang valid!'); return }
      }
      if (jenisLower.includes('panen')) {
        if (!f.jumlahPanen || parseFloat(f.jumlahPanen) <= 0) { showErr('Harap masukkan jumlah/berat hasil panen!'); return }
        if (!f.kondisiPanen || f.kondisiPanen === 'Kondisi Panen') { showErr('Harap pilih kondisi panen!'); return }
        if (!f.caraPanen || f.caraPanen === 'Cara Panen') { showErr('Harap pilih cara panen!'); return }
      }
      if (jenisLower.includes('pemangkasan')) {
        if (!f.jumlahPemangkasan || parseFloat(f.jumlahPemangkasan) <= 0) { showErr('Harap masukkan jumlah pemangkasan yang valid!'); return }
        if (!f.metodePemangkasan || f.metodePemangkasan === 'Metode Pemangkasan') { showErr('Harap pilih metode pemangkasan!'); return }
      }
      if (jenisLower.includes('penyiraman')) {
        if (!f.teknikPenyiraman || f.teknikPenyiraman === 'Teknik Penyiraman') { showErr('Harap pilih teknik penyiraman!'); return }
      }
      if (jenisLower.includes('pembersihan')) {
        if (!f.alatPembersihan || f.alatPembersihan === 'Alat Pembersihan') { showErr('Harap pilih alat pembersihan!'); return }
      }
      if (jenisLower.includes('pembuahan')) {
        if (rincian === 'Penjarangan Buah') {
          if (!f.jumlahBuahDibuang || parseFloat(f.jumlahBuahDibuang) <= 0) { showErr('Harap masukkan jumlah buah yang dibuang!'); return }
          if (!f.sisaBuahPerTandan || parseFloat(f.sisaBuahPerTandan) <= 0) { showErr('Harap masukkan sisa buah per tandan!'); return }
        }
        if (rincian === 'Pembungkusan Buah') {
          if (!f.bahanPembungkus || f.bahanPembungkus === 'Bahan Pembungkus') { showErr('Harap pilih bahan pembungkus!'); return }
          if (!f.jumlahBuahDibungkus || parseFloat(f.jumlahBuahDibungkus) <= 0) { showErr('Harap masukkan jumlah buah yang dibungkus!'); return }
        }
        if (rincian === 'Merangsang Pembungaan') {
          if (!f.jenisPerangsang || f.jenisPerangsang === 'Jenis Perangsang') { showErr('Harap pilih jenis perangsang bunga!'); return }
          if (!f.dosisPerangsang || parseFloat(f.dosisPerangsang) <= 0) { showErr('Harap masukkan dosis perangsang!'); return }
        }
      }
      if (jenis === 'Stok Obat') {
        if (!f.namaObat || !f.namaObat.trim()) { showErr('Harap isi nama obat!'); return }
        if (!f.volumeObat || parseFloat(f.volumeObat) <= 0) { showErr('Harap masukkan volume/jumlah obat yang valid!'); return }
      }
      if (jenis === 'Stok Pupuk' && (rincian === 'Pendaftaran Pupuk/Bahan Baru' || rincian === 'Tambah Stok Pupuk (Exp Lama)' || rincian === 'Tambah Stok Bahan')) {
        if (!f.namaObat || !f.namaObat.trim()) { showErr('Harap isi nama pupuk/bahan!'); return }
        if (!f.volumeObat || parseFloat(f.volumeObat) <= 0) { showErr('Harap masukkan jumlah yang valid!'); return }
      }
      // ── End general validation ──────────────────────────────────────────────

      // Stock validation for Pemupukan
      if (selectedJenis.value === 'Pemupukan') {
        const selectedPupuk = formState.value.jenisPupukDetail
        if (!selectedPupuk || selectedPupuk === 'Pilih Pupuk' || selectedPupuk === 'Jenis Pupuk Detail') {
          alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Harap pilih pupuk yang digunakan!', type: 'error' }
          return
        }
        const dose = parseFloat(formState.value.jumlahBeratPupuk) || 0
        if (dose <= 0) {
          alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Harap masukkan jumlah/dosis pupuk yang valid!', type: 'error' }
          return
        }

        const nameLower = selectedPupuk.toLowerCase()
        const isCair = nameLower.includes('poc') || nameLower.includes('cair')
        const isOrganik = nameLower.includes('kandang') || nameLower.includes('kotoran') || nameLower.includes('kompos') || nameLower.includes('organik')
        let unit = 'gram'
        if (isCair) {
          unit = (formState.value.satuanVolumePOC || 'Liter').toLowerCase()
        } else if (isOrganik) {
          unit = 'kilogram'
        }
        const usedVal = parseQty(formState.value.jumlahBeratPupuk, unit)
        const available = getAvailableFertilizerStock(selectedPupuk)

        if (usedVal > available) {
          alertModal.value = {
            isOpen: true,
            title: 'Stok Tidak Cukup',
            message: `Stok pupuk "${selectedPupuk}" tidak mencukupi. Tersedia: ${formatQty(available, selectedPupuk)}, ingin digunakan: ${formatQty(usedVal, selectedPupuk)}.`,
            type: 'error'
          }
          return
        }
      }

      // Stock validation for Pemberian Obat
      if (jenisLower.includes('obat') || jenisLower.includes('perawatan') || jenisLower.includes('hama') || jenisLower.includes('penyakit')) {
        const selectedObat = formState.value.namaObat
        if (selectedObat && selectedObat !== 'Pilih Obat' && selectedObat !== 'Jenis Obat') {
          const usedVal = parseFloat(formState.value.volumeObat) || 0
          if (usedVal <= 0) {
            alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Harap masukkan volume obat yang valid!', type: 'error' }
            return
          }
          const stockItem = currentObatStocks.value[selectedObat]
          const available = stockItem ? stockItem.qty : 0
          if (usedVal > available) {
            alertModal.value = {
              isOpen: true,
              title: 'Stok Tidak Cukup',
              message: `Stok obat "${selectedObat}" tidak mencukupi. Tersedia: ${available} ${stockItem?.unit || ''}, ingin digunakan: ${usedVal} ${formState.value.satuanVolumeObat || ''}.`,
              type: 'error'
            }
            return
          }
        }
      }

      // Validation for Pengolahan Pupuk -> Fermentasi Pupuk
      if (selectedJenis.value === 'Pengolahan Pupuk' && selectedRincian.value === 'Fermentasi Pupuk') {
        const f = formState.value
        if (!f.bahanMentahId && !f.pruningId) {
          alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Harap pilih bahan mentah!', type: 'error' }
          return
        }
        if (!f.dekomposer) {
          alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Harap pilih dekomposer!', type: 'error' }
          return
        }
        if (!f.molase) {
          alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Harap pilih molase!', type: 'error' }
          return
        }
        if (!f.jumlahAir) {
          alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Harap masukkan jumlah air!', type: 'error' }
          return
        }
        if (!f.qty) {
          alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Harap masukkan estimasi jumlah produksi!', type: 'error' }
          return
        }

        // Validate ingredient stocks for fermentation
        const qty = parseFloat(f.qty) || 0
        const hasil = f.hasilJadi || ''
        const isCair = hasil.toLowerCase().includes('cair') || hasil.toLowerCase().includes('poc')
        
        const decNeed = (isCair ? 20 : 10) * qty
        const molNeed = (isCair ? 20 : 10) * qty
        const rawNeed = (isCair ? 0.3 : 1.0) * qty

        // Validate Dekomposer
        const decName = f.dekomposer
        if (decName) {
          const decAvail = getStockOf(decName)
          if (decNeed > decAvail) {
            alertModal.value = {
              isOpen: true,
              title: 'Stok Tidak Cukup',
              message: `Stok dekomposer "${decName}" tidak mencukupi. Butuh: ${formatQty(decNeed, decName)}, Tersedia: ${formatQty(decAvail, decName)}.`,
              type: 'error'
            }
            return
          }
        }

        // Validate Molase
        const molName = f.molase
        if (molName) {
          const molAvail = getStockOf(molName)
          if (molNeed > molAvail) {
            alertModal.value = {
              isOpen: true,
              title: 'Stok Tidak Cukup',
              message: `Stok molase/gula "${molName}" tidak mencukupi. Butuh: ${formatQty(molNeed, molName)}, Tersedia: ${formatQty(molAvail, molName)}.`,
              type: 'error'
            }
            return
          }
        }

        // Validate Raw Material
        const rawName = f.bahanMentahId
        if (rawName) {
          const rawAvail = getStockOf(rawName)
          if (rawNeed > rawAvail) {
            alertModal.value = {
              isOpen: true,
              title: 'Stok Tidak Cukup',
              message: `Stok bahan mentah "${rawName}" tidak mencukupi. Butuh: ${formatQty(rawNeed, rawName)}, Tersedia: ${formatQty(rawAvail, rawName)}.`,
              type: 'error'
            }
            return
          }
        }
      }

      // Validation for Pengolahan Pupuk -> Cek Fermentasi
      if (selectedJenis.value === 'Pengolahan Pupuk' && selectedRincian.value === 'Cek Fermentasi') {
        const f = formState.value
        if (!f.jenisFermentasi) {
          alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Harap pilih jenis fermentasi yang dicek!', type: 'error' }
          return
        }
        if (!f.batchFermentasiId) {
          alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Harap pilih periode pencatatan fermentasi!', type: 'error' }
          return
        }
        if (!f.aktivitasPengecekan) {
          alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Harap pilih aktivitas pengecekan/perlakuan!', type: 'error' }
          return
        }
        if (!f.kondisiFisik) {
          alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Harap pilih kondisi fisik terakhir!', type: 'error' }
          return
        }
      }

      isSaving.value = true
      const result = await submitPencatatanSubmission({
        type: kindTitle.value.toLowerCase(),
        scope: activeMode.value,
        summary: `Mencatat ${kindTitle.value} (${selectedRincian.value})`,
        payload: {
          data: {
            items: [{
              ...formState.value,
              selectedRincian: selectedRincian.value,
              kategoriPencatatan: activeMode.value,
              selectedVarietas: selectedVarietas.value,
            }],
          },
        },
        operatorCode: userSession.value?.code || 'OP002',
        operatorName: userSession.value?.name || 'Operator Kebun',
        cageCode: landSession.value?.code || 'L001',
        taskId: prefilledPencatatanTaskId.value || undefined,
      })
      isSaving.value = false
      alertModal.value = {
        isOpen: true,
        title: result.success ? 'Berhasil Dikirim' : 'Gagal Mengirim',
        message: result.success
          ? `Catatan ${kindTitle.value} (${selectedRincian.value}) berhasil dimasukkan ke antrean persetujuan!`
          : result.message,
        type: result.success ? 'success' : 'error',
      }
      if (result.success) {
        setTimeout(() => {
          alertModal.value.isOpen = false
          prefilledPencatatanTaskId.value = null
          router.back()
        }, 2000)
      }
    }

    const goBack = () => router.push({ name: 'kebun' })

    return () => (
      <div class="pencatatan-page">
        <div class="pencatatan-topbar">
          <div style="max-width: 1280px; margin: 0 auto; width: 100%; display: flex; align-items: center; padding: 0 0.75rem;">
            <button type="button" class="pencatatan-back-btn" onClick={goBack}>
              <img src="/icon/arrow-left/white-16.svg" alt="Kembali" style="width: 14px; height: 14px; margin-right: 4px;" />
              Kembali
            </button>
          </div>
        </div>

        <div class="pencatatan-content">
          <div class="pencatatan-header-panel">
            <div class="pencatatan-header-title">
              <h2>Pencatatan Perkebunan</h2>
            </div>
            <div class="pencatatan-header-meta">
              <span>{formattedDate.value}</span>
              <span>{formattedTime.value}</span>
            </div>

            <div class="pencatatan-info-cards">
              <PencatatanInfoCard
                icon={getLahanIcon(landSession.value?.name ?? 'alpukat')}
                title={landSession.value?.name ?? 'Lahan Alpukat'}
                subtitle={`ID Lahan: ${landSession.value?.code ?? 'L001'}`}
                alt="Lahan"
              />
              <PencatatanInfoCard
                icon="/icon/operator.png"
                title={userSession.value?.name ?? 'Operator Kebun'}
                subtitle={`ID Pengguna: ${userSession.value?.code ?? 'PK001'}`}
                alt="Operator"
              />
            </div>

            <div class="pencatatan-selector-box">
              <div class="pencatatan-selector-box__heading">Pencatatan</div>
              <PencatatanSelectionField
                icon="/icon/jenis_kebun.png"
                label="Pilih jenis pencatatan"
                value={selectedJenis.value}
                clickable={!route.query.jenis}
                showChevron={!route.query.jenis}
                onClick={!route.query.jenis ? openJenisModal : undefined}
              />
              <PencatatanSelectionField
                icon="/icon/rincian_kebun.png"
                label="Pilih rincian pencatatan"
                value={selectedRincian.value}
                clickable={!route.query.rincian}
                showChevron={!route.query.rincian}
                onClick={!route.query.rincian ? openRincianModal : undefined}
              />
            </div>
          </div>

          {panduanTeknis.value && <PanduanTeknisBanner text={panduanTeknis.value} />}

          {/* Obat Stock Info */}
          {(selectedJenis.value === 'Pemberian Obat' || selectedJenis.value === 'Stok Obat') && (
            <div style="margin-bottom:0.85rem;">
              <h3 style="font-size:1rem; font-weight:800; color:#111827; margin:0 0 0.5rem;">Informasi Stok Obat</h3>
              {obatStocks.value.length === 0 ? (
                <p style="font-size:0.85rem; color:#9ca3af; margin:0; font-weight:600;">Tidak ada stok obat tersedia.</p>
              ) : (
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:0.75rem;">
                  {obatStocks.value.map(stock => (
                    <div key={stock.name} style="border:1.5px solid #dce1d0; border-radius:0.65rem; background:#fff; padding:1rem 0.85rem; text-align:left;">
                      <strong style="display:block; font-size:1rem; font-weight:800; color:#111827;">{stock.name}</strong>
                      <span style="display:block; font-size:0.85rem; color:#111827; font-weight:700; margin:0.25rem 0;">{stock.qty}</span>
                      <span style="font-size:0.72rem; color:#6b7280; font-weight:600;">Kadaluarsa: {stock.expiry}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fertilizer Stock Info */}
          {showPupukInfo.value && (
            <div style="margin-bottom:0.85rem;">
              <h3 style="font-size:1rem; font-weight:800; color:#111827; margin:0 0 0.5rem;">Informasi Stok Pupuk</h3>
              {pupukStocks.value.length === 0 ? (
                <p style="font-size:0.85rem; color:#9ca3af; margin:0; font-weight:600;">Tidak ada stok pupuk tersedia.</p>
              ) : (
                <div style="display:flex; flex-direction:column; gap:1.25rem;">
                  {Object.entries(groupedPupukStocks.value).map(([category, items]) => {
                    if (items.length === 0) return null
                    return (
                      <div key={category} style="display:flex; flex-direction:column; gap:0.5rem;">
                        <h4 style="font-size:0.82rem; font-weight:800; color:#4b5563; margin:0; text-transform:uppercase; letter-spacing:0.05em; display:flex; align-items:center; gap:0.35rem;">
                          <span style="display:inline-block; width:6px; height:6px; background:#10b981; border-radius:50%;"></span>
                          {category}
                        </h4>
                        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:0.75rem;">
                          {items.map(stock => (
                            <div key={stock.name} style="border:1.5px solid #dce1d0; border-radius:0.65rem; background:#fff; padding:1rem 0.85rem; text-align:left;">
                              <strong style="display:block; font-size:1rem; font-weight:800; color:#111827;">{stock.name}</strong>
                              <span style="display:block; font-size:0.85rem; color:#111827; font-weight:700; margin:0.25rem 0;">{stock.qty}</span>
                              <span style="font-size:0.72rem; color:#6b7280; font-weight:600;">{stock.expiry === '-' ? 'Asal Pupuk: Internal' : `Kadaluarsa: ${stock.expiry}`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Raw Material Stock Info */}
          {showBahanInfo.value && (
            <div style="margin-bottom:0.85rem;">
              <h3 style="font-size:1rem; font-weight:800; color:#111827; margin:0 0 0.5rem;">Informasi Stok Bahan</h3>
              {bahanStocks.value.length === 0 ? (
                <p style="font-size:0.85rem; color:#9ca3af; margin:0; font-weight:600;">Tidak ada stok bahan tersedia.</p>
              ) : (
                <div style="display:flex; flex-direction:column; gap:1.25rem;">
                  {Object.entries(groupedBahanStocks.value).map(([category, items]) => {
                    if (items.length === 0) return null
                    return (
                      <div key={category} style="display:flex; flex-direction:column; gap:0.5rem;">
                        <h4 style="font-size:0.82rem; font-weight:800; color:#4b5563; margin:0; text-transform:uppercase; letter-spacing:0.05em; display:flex; align-items:center; gap:0.35rem;">
                          <span style="display:inline-block; width:6px; height:6px; background:#3b82f6; border-radius:50%;"></span>
                          {category}
                        </h4>
                        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:0.75rem;">
                          {items.map(b => (
                            <div key={b.name} style="border:1.5px solid #dce1d0; border-radius:0.65rem; background:#fff; padding:1rem 0.85rem; text-align:left;">
                              <strong style="display:block; font-size:1rem; font-weight:800; color:#111827;">{b.name}</strong>
                              <span style="display:block; font-size:0.85rem; color:#111827; font-weight:700; margin:0.25rem 0;">{b.qty}</span>
                              <span style="font-size:0.72rem; color:#6b7280; font-weight:600;">Asal: {b.asal}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {selectedJenis.value !== 'Stok Obat' && selectedJenis.value !== 'Stok Pupuk' && selectedJenis.value !== 'Penanaman' && selectedJenis.value !== 'Pengolahan Pupuk' && (
            <PencatatanModeToggle
              modelValue={activeMode.value}
              onUpdate:modelValue={(val: 'pohon' | 'lahan') => { activeMode.value = val }}
            />
          )}

          <PencatatanFormContainer>
            {activeMode.value === 'pohon' && selectedJenis.value !== 'Stok Obat' && selectedJenis.value !== 'Stok Pupuk' && (
              <TreeSelectionGrid
                trees={filteredTrees.value}
                selectedCodes={selectedTrees.value}
                varietasOptions={varietasOptions.value}
                selectedVarietas={selectedVarietas.value}
                fasePohon={formState.value.fasePohon}
                statusProduktivitas={formState.value.statusProduktivitas}
                treeIcon={getLahanIcon(landSession.value?.name ?? 'alpukat')}
                maxSelection={selectedRincian.value.toLowerCase().includes('penggantian') ? 1 : 0}
                kindTitle={kindTitle.value}
                onUpdate:selectedCodes={(codes: string[]) => { selectedTrees.value = codes }}
                onUpdate:selectedVarietas={(val: string) => { selectedVarietas.value = val }}
                onUpdate:fasePohon={(val: string) => { formState.value.fasePohon = val }}
                onUpdate:statusProduktivitas={(val: string) => { formState.value.statusProduktivitas = val }}
              />
            )}

            <KebunGenericFormFields
              kindTitle={kindTitle.value}
              form={formState.value}
              activeMode={activeMode.value}
              selectedRincian={selectedRincian.value}
              manureStock={manureStock.value}
              selectedPupukStock={selectedPupukStock.value}
              manureCollections={manureCollections.value}
              pruningCollections={pruningCollections.value}
              allSubmissions={allSubmissions.value}
              selectedTreesCount={selectedTrees.value.length}
              varietasOptions={varietasOptions.value}
              selectedVarietas={selectedVarietas.value}
              selectedTrees={selectedTrees.value}
              allTrees={allTrees.value}
              pupukOptions={pupukOptions.value}
              bahanStocks={bahanStocks.value}
              obatStocks={obatStocks.value}
              pruningStockMap={pruningStockMap.value}
              onUpdate:selectedVarietas={(val: string) => { selectedVarietas.value = val }}
            />

            <PencatatanPrimaryButton loading={isSaving.value} onClick={saveRecording} />
          </PencatatanFormContainer>
        </div>

        <JenisBottomSheet
          show={showJenisModal.value}
          options={jenisPencatatanList.value}
          selected={draftJenis.value}
          search={jenisSearch.value}
          onClose={() => { showJenisModal.value = false }}
          onSave={saveJenis}
          onUpdate:selected={(val: string) => { 
            draftJenis.value = val 
            saveJenis()
          }}
          onUpdate:search={(val: string) => { jenisSearch.value = val }}
        />

        <RincianBottomSheet
          show={showRincianModal.value}
          jenisLabel={selectedJenis.value}
          options={availableRincianList.value}
          selected={draftRincian.value}
          search={rincianSearch.value}
          onClose={() => { showRincianModal.value = false }}
          onSave={saveRincian}
          onUpdate:selected={(val: string) => { 
            draftRincian.value = val 
            saveRincian()
          }}
          onUpdate:search={(val: string) => { rincianSearch.value = val }}
          onAdd={async () => {
            const nama = window.prompt('Masukkan nama rincian pencatatan baru:')
            if (!nama?.trim() || selectedJenis.value === 'Jenis Pencatatan') return
            try {
              await addRincianPencatatan(selectedJenis.value, nama.trim())
            } catch {
              alert('Gagal menambah rincian. Pastikan backend berjalan.')
            }
          }}
        />

        {isSaving.value && (
          <Teleport to="body">
            <div style="position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); z-index:1250; display:flex; align-items:center; justify-content:center;">
              <div style="background:#fff; border-radius:1.25rem; padding:2.5rem 2rem; max-width:320px; width:85%; text-align:center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); display:flex; flex-direction:column; align-items:center; gap:1.25rem;">
                <div style="width:48px; height:48px; border:4px solid #dce1d0; border-top-color:#38431f; border-radius:50%; animation:pencatatanSpin 1s linear infinite;" />
                <div>
                  <h4 style="font-weight:800; margin:0 0 0.25rem; font-size:1.1rem; color:#111827;">Menyimpan Catatan</h4>
                  <p style="color:#6b7280; margin:0; font-size:0.88rem;">Mohon tunggu sebentar...</p>
                </div>
              </div>
            </div>
          </Teleport>
        )}

        {alertModal.value.isOpen && (
          <Teleport to="body">
            <div
              style="position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:1200; display:flex; align-items:center; justify-content:center;"
              onClick={alertModal.value.type === 'error' ? closeAlertModal : undefined}
            >
              <div
                style="background:#fff; border-radius:1.25rem; padding:2rem 1.5rem; max-width:360px; width:90%; text-align:center; animation:pencatatanScaleUp 0.25s ease;"
                onClick={(e: MouseEvent) => e.stopPropagation()}
              >
                <div style="margin-bottom:1.25rem;">
                  {alertModal.value.type === 'error' ? (
                    <div style="display:inline-flex; align-items:center; justify-content:center; width:60px; height:60px; background:rgba(239,68,68,0.1); color:#ef4444; border-radius:50%; font-size:1.8rem;">✕</div>
                  ) : (
                    <div style="display:inline-flex; align-items:center; justify-content:center; width:60px; height:60px; background:rgba(34,197,94,0.1); color:#22c55e; border-radius:50%; font-size:1.8rem;">✓</div>
                  )}
                </div>
                <h4 style="font-weight:800; margin:0 0 0.5rem; font-size:1.1rem; color:#111827;">{alertModal.value.title}</h4>
                <p style="color:#6b7280; margin:0 0 1.25rem; font-size:0.88rem; line-height:1.55;">{alertModal.value.message}</p>
                {alertModal.value.type === 'error' && (
                  <button type="button" class="pencatatan-primary-btn" onClick={closeAlertModal}>Mengerti</button>
                )}
                {alertModal.value.type === 'success' && (
                  <div style="display:flex; align-items:center; justify-content:center; gap:0.4rem; color:#6b7280; font-size:0.82rem;">
                    <div style="width:1rem; height:1rem; border:2px solid #38431f; border-top-color:transparent; border-radius:50%; animation:pencatatanSpin 0.7s linear infinite;" />
                    Mengalihkan...
                  </div>
                )}
              </div>
            </div>
          </Teleport>
        )}
      </div>
    )
  },
})
