import type { RouteRecordRaw } from 'vue-router';
import { userSession } from '@/store/navigation';

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'admin',
    component: () => import('./views/AdminPage'),
    beforeEnter: () => {
      const role = userSession.value?.role;
      if (role === 'Admin' || role === 'Owner' || role === 'Pemilik') return true;
      return { name: 'home' };
    },
  },
];
