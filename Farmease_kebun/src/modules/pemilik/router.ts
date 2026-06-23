import type { RouteRecordRaw } from 'vue-router';
import { userSession } from '@/store/navigation';

export const pemilikKebunRoutes: RouteRecordRaw[] = [
  {
    path: '/pemilik',
    name: 'pemilik-kebun',
    component: () => import('./views/KandangTugasView'),
    beforeEnter: (to, from, next) => {
      const role = userSession.value?.role;
      if (role === 'Owner' || role === 'Pemilik') return next(true);
      return next('/');
    },
  },
];
