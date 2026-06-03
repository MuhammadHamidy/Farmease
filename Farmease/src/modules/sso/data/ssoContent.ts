export const keunggulanItems = [
  {
    title: 'Integrasi Data',
    description:
      'Seluruh pencatatan aktivitas peternakan dan perkebunan terhubung dalam satu sistem terpadu.',
  },
  {
    title: 'Pencatatan',
    description:
      'Catat aktivitas harian secara terstruktur dan akurat untuk kebutuhan operasional maupun laporan.',
  },
  {
    title: 'Pemantauan',
    description:
      'Pantau perkembangan ternak, lahan, dan jadwal pekerjaan secara berkala dari satu platform.',
  },
];

export const peternakanItems = [
  {
    title: 'Domba Dorper – Penghasil Daging Unggul',
    description:
      'Domba pedaging dari Afrika Selatan dengan pertumbuhan cepat, tahan cuaca, dan tidak perlu dicukur.',
    image: '/icon/domba.png',
  },
  {
    title: 'Domba Garut – Domba Lokal Bernilai Budaya',
    description:
      'Domba asli Indonesia dengan tubuh besar dan tanduk khas, sering digunakan dalam tradisi adu domba.',
    image: '/icon/domba.png',
  },
  {
    title: 'Domba Cross Garut – Hasil Persilangan Unggul',
    description:
      'Perpaduan Garut dengan jenis lain untuk menghasilkan domba yang lebih produktif dan berkualitas.',
    image: '/icon/domba.png',
  },
  {
    title: 'Domba Merino – Penghasil Wol Berkualitas Tinggi',
    description:
      'Domba penghasil wol halus bernilai tinggi yang banyak digunakan di industri tekstil.',
    image: '/icon/domba.png',
  },
];

export type CropPlaceholder = 'longan' | 'avocado' | 'avocado-rough';

export const perkebunanItems: Array<{
  title: string;
  description: string;
  image?: string;
  placeholder: CropPlaceholder;
}> = [
  {
    title: 'Kelengkeng',
    description:
      'Buah tropis manis dengan permukaan kulit kasar, banyak dibudidayakan di lahan kebun Sah Hi Agro Farm.',
    placeholder: 'longan',
  },
  {
    title: 'Alpukat Aligator',
    description:
      'Varietas alpukat dengan kulit hijau kasar dan daging krem, cocok untuk pasar lokal maupun olahan.',
    placeholder: 'avocado-rough',
  },
  {
    title: 'Alpukat',
    description:
      'Tanaman perkebunan unggul dengan produksi buah berkualitas dan pemeliharaan rutin di kebun terintegrasi.',
    placeholder: 'avocado',
  },
  {
    title: 'Kelengkeng',
    description:
      'Varietas unggul dengan jadwal panen terencana dan pencatatan perawatan melalui sistem FARMease.',
    placeholder: 'longan',
  },
  {
    title: 'Alpukat',
    description:
      'Mendukung monitoring pertumbuhan pohon dan dokumentasi aktivitas pemupukan hingga panen.',
    placeholder: 'avocado',
  },
  {
    title: 'Kelengkeng',
    description:
      'Bagian dari diversifikasi kebun yang dikelola bersama modul perkebunan terintegrasi.',
    placeholder: 'longan',
  },
];

const cropEmoji: Record<CropPlaceholder, string> = {
  longan: '🍈',
  avocado: '🥑',
  'avocado-rough': '🥑',
};

export function getCropPlaceholderEmoji(key: CropPlaceholder): string {
  return cropEmoji[key];
}
