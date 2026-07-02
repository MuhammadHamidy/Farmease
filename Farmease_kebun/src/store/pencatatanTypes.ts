import { ref, computed } from 'vue'
import { pencatatanTypesApi, type PencatatanTypesCatalog, type RincianPencatatanItem } from '@/shared/api/perkebunan'

const FALLBACK_JENIS = [
  'Panen', 'Pemangkasan', 'Pembersihan', 'Pembuahan',
  'Pemberian Obat', 'Pemupukan', 'Penanaman', 'Penyiraman',
  'Stok Obat', 'Stok Pupuk', 'Pengolahan Pupuk',
]

const FALLBACK_RINCIAN_BY_JENIS: Record<string, string[]> = {
  Panen: ['Panen Buah'],
  Pemangkasan: ['Pemangkasan Pemeliharaan'],
  Pembersihan: ['Penyiangan Gulma', 'Pembumbunan Tanah', 'Sanitasi Serasah & Ranting'],
  Pembuahan: ['Merangsang Pembungaan', 'Penjarangan Buah', 'Pembungkusan Buah'],
  'Pemberian Obat': ['Insektisida', 'Fungisida', 'Pestisida'],
  Pemupukan: ['Pupuk Organik Cair', 'Pupuk Organik Padat', 'Pupuk Kimia'],
  Penanaman: ['Bibit Baru', 'Penggantian Bibit'],
  Penyiraman: ['Siram Manual', 'Irigrasi Drip / Pipanisasi'],
  'Stok Obat': ['Pendaftaran Obat Baru', 'Tambah Stok Obat (Exp Lama)'],
  'Stok Pupuk': [
    'Pendaftaran Pupuk/Bahan Baru',
    'Tambah Stok Pupuk (Exp Lama)',
    'Tambah Stok Bahan'
  ],
  'Pengolahan Pupuk': ['Fermentasi Pupuk', 'Cek Fermentasi'],
}

const catalog = ref<PencatatanTypesCatalog | null>(null)
const isLoading = ref(false)
const loadError = ref<string | null>(null)
let fetchPromise: Promise<void> | null = null

function applyFallbackCatalog() {
  catalog.value = {
    jenis: FALLBACK_JENIS.map((nama, index) => ({
      id_jenis: `fallback-jenis-${index}`,
      nama,
      sort_order: index + 1,
      is_active: true,
    })),
    rincian_by_jenis: Object.fromEntries(
      Object.entries(FALLBACK_RINCIAN_BY_JENIS).map(([jenis, items]) => [
        jenis,
        items.map((nama, index) => ({
          id_rincian: `fallback-rincian-${jenis}-${index}`,
          jenis_id: `fallback-jenis-${FALLBACK_JENIS.indexOf(jenis)}`,
          jenis_nama: jenis,
          nama,
          sort_order: index + 1,
          is_active: true,
        })),
      ]),
    ),
  }
}

export async function fetchPencatatanTypesCatalog(force = false): Promise<void> {
  if (catalog.value && !force) return
  if (fetchPromise && !force) return fetchPromise

  fetchPromise = (async () => {
    isLoading.value = true
    loadError.value = null
    try {
      const data = await pencatatanTypesApi.getCatalog()
      catalog.value = data
    } catch (err) {
      console.warn('Failed to fetch pencatatan types, using fallback:', err)
      loadError.value = err instanceof Error ? err.message : 'Gagal memuat jenis pencatatan'
      if (!catalog.value) applyFallbackCatalog()
    } finally {
      isLoading.value = false
      fetchPromise = null
    }
  })()

  return fetchPromise
}

export const jenisPencatatanList = computed(() => {
  const rawList = (catalog.value?.jenis ?? []).map((item) => item.nama);
  const set = new Set<string>();
  
  rawList.forEach(name => {
    let standardized = name;
    if (standardized.toLowerCase() === 'stok pupuk') standardized = 'Stok Pupuk';
    if (standardized.toLowerCase() === 'stok obat') standardized = 'Stok Obat';
    set.add(standardized);
  });

  if (!set.has('Stok Obat')) set.add('Stok Obat');
  if (!set.has('Stok Pupuk')) set.add('Stok Pupuk');
  if (!set.has('Pengolahan Pupuk')) set.add('Pengolahan Pupuk');

  return Array.from(set);
});

export const rincianPencatatanByJenis = computed(() => {
  const map: Record<string, string[]> = {};
  const source = catalog.value?.rincian_by_jenis ?? FALLBACK_RINCIAN_BY_JENIS;
  for (const [jenis, items] of Object.entries(source)) {
    map[jenis] = Array.isArray(items)
      ? items.map((item) => (typeof item === 'string' ? item : item.nama))
      : [];
  }
  // Always enforce custom options for Stok Pupuk and Stok Obat
  map['Stok Obat'] = ['Pendaftaran Obat Baru', 'Tambah Stok Obat (Exp Lama)'];
  map['Stok Pupuk'] = [
    'Pendaftaran Pupuk/Bahan Baru',
    'Tambah Stok Pupuk (Exp Lama)',
    'Tambah Stok Bahan'
  ];

  if (catalog.value) {
    if (!map['Pengolahan Pupuk'] || map['Pengolahan Pupuk'].length === 0) {
      map['Pengolahan Pupuk'] = ['Fermentasi Pupuk', 'Cek Fermentasi', 'Pupuk Kandang', 'Pupuk Kompos'];
    }
  }
  return map;
});

export function getRincianForJenis(jenis: string): string[] {
  return rincianPencatatanByJenis.value[jenis] ?? []
}

export async function addJenisPencatatan(nama: string): Promise<void> {
  const created = await pencatatanTypesApi.createJenis({ nama })
  await fetchPencatatanTypesCatalog(true)
  if (!catalog.value?.rincian_by_jenis[created.nama]) {
    catalog.value = {
      ...catalog.value!,
      rincian_by_jenis: { ...catalog.value!.rincian_by_jenis, [created.nama]: [] },
    }
  }
}

export async function addRincianPencatatan(jenisNama: string, nama: string): Promise<void> {
  await pencatatanTypesApi.createRincian({ jenis_nama: jenisNama, nama })
  await fetchPencatatanTypesCatalog(true)
}

export function usePencatatanTypes() {
  return {
    catalog,
    isLoading,
    loadError,
    jenisPencatatanList,
    rincianPencatatanByJenis,
    fetchPencatatanTypesCatalog,
    getRincianForJenis,
    addJenisPencatatan,
    addRincianPencatatan,
  }
}

export type { RincianPencatatanItem, PencatatanTypesCatalog }
