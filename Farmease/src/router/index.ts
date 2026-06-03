import { createRouter, createWebHistory } from 'vue-router';
import { ssoRoutes } from '@/modules/sso/router';
import { ternakRoutes } from '@/modules/ternak/router';
import { kebunRoutes } from '@/modules/kebun/router';
import { adminRoutes } from '@/modules/admin/router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...ssoRoutes,
    ...ternakRoutes,
    ...kebunRoutes,
    ...adminRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

export default router;
