import type { RouteRecordRaw } from 'vue-router';
import { userSession } from '@/store/navigation';

export const ternakRoutes: RouteRecordRaw[] = [
  {
    path: '/ternak',
    component: () => import('./layouts/TernakLayout'),
    children: [
      {
        path: '',
        name: 'ternak',
        component: () => import('./views/PeternakanPage'),
      },
    ],
  },
  {
    path: '/peternakan',
    redirect: { name: 'ternak' },
  },
  {
    path: '/masuk-kandang',
    redirect: { name: 'ternak' },
  },
];
