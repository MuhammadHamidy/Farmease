import type { RouteRecordRaw } from 'vue-router';

export const ssoRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/SsoLandingPage'),
  },
  {
    path: '/login',
    redirect: { name: 'home' },
  },
  {
    path: '/admin/login',
    redirect: { name: 'home' },
  },
  {
    path: '/informasi',
    redirect: { name: 'home' },
  },
  {
    path: '/kontak',
    redirect: { name: 'home' },
  },
];
