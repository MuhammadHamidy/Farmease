import type { RouteRecordRaw } from 'vue-router';
import { userSession } from '@/store/navigation';

export const pemilikTernakRoutes: RouteRecordRaw[] = [
  {
    path: '/pemilik',
    name: 'pemilik-ternak',
    component: () => import('./views/PemilikTernakPage'),
    beforeEnter: () => {
      const role = userSession.value?.role;
      if (role === 'Owner' || role === 'Pemilik') return true;
      return '/admin';
    },
  },
];
