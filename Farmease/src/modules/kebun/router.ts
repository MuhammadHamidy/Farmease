import type { RouteRecordRaw } from 'vue-router';

export const kebunRoutes: RouteRecordRaw[] = [
  {
    path: '/kebun',
    component: () => import('./layouts/KebunLayout'),
    children: [
      {
        path: '',
        name: 'kebun',
        component: () => import('./views/PerkebunanPage'),
      },
      {
        path: 'dasbor-lahan',
        name: 'kebun-dasbor-lahan',
        component: () => import('./views/DasborLahanPage'),
      },
      {
        path: 'daftar',
        name: 'kebun-daftar',
        component: () => import('./views/DaftarPerkebunanPage'),
      },
      {
        path: 'riwayat',
        name: 'kebun-riwayat',
        component: () => import('./views/RiwayatPencatatanPage'),
      },
    ],
  },
  {
    path: '/perkebunan',
    redirect: { name: 'kebun' },
  },
];
