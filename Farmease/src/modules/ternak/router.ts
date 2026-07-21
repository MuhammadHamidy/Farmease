import type { RouteRecordRaw } from 'vue-router';
import { cageSession } from '@/store/navigation';

export const ternakRoutes: RouteRecordRaw[] = [
  {
    path: '/ternak',
    component: () => import('./layouts/TernakLayout'),
    children: [
      {
        path: '',
        component: () => import('./views/LivestockPage'),
        redirect: () => {
          return { name: 'ternak-dasbor' };
        },
        children: [
          {
            path: 'dasbor',
            name: 'ternak-dasbor',
            component: () => import('./views/DashboardView'),
          },
          {
            path: 'daftar',
            name: 'ternak-daftar',
            component: () => import('./views/LivestockView'),
          },
          {
            path: 'pencatatan',
            name: 'ternak-pencatatan',
            component: () => import('./views/RecordView'),
          },
          {
            path: 'riwayat',
            name: 'ternak-riwayat',
            component: () => import('./views/HistoryView'),
          },
          {
            path: 'gudang',
            name: 'ternak-gudang',
            component: () => import('./views/WarehouseView'),
          },
          {
            path: 'domba/:id',
            name: 'ternak-detail',
            component: () => import('./views/LivestockDetailView'),
          },
          {
            path: 'pencatatan/form',
            name: 'ternak-pencatatan-form',
            component: () => import('./views/RecordFormView'),
          },
        ],
      },
      {
        path: 'pilih-kandang',
        name: 'ternak-pilih-kandang',
        component: () => import('./views/CageSelectionView'),
      },
    ],
  },
  {
    path: '/peternakan',
    redirect: { name: 'ternak-dasbor' },
  },
  {
    path: '/masuk-kandang',
    redirect: { name: 'ternak-dasbor' },
  },
];
