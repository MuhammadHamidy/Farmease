import type { RouteRecordRaw } from 'vue-router';
import { userSession } from '@/store/navigation';

export const pemilikKebunRoutes: RouteRecordRaw[] = [
  {
    path: '/pemilik',
    name: 'pemilik-kebun',
    component: () => import('./views/PemilikKebunPage'),
    beforeEnter: () => {
      const role = userSession.value?.role;
      if (role === 'Owner' || role === 'Pemilik') return true;
      // Non-owner: redirect to admin or kebun
      return '/admin';
    },
  },
];
