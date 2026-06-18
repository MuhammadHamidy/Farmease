import { createRouter, createWebHistory } from 'vue-router';
import { ssoRoutes } from '@/modules/sso/router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...ssoRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

export default router;
