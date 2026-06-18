import { createRouter, createWebHistory } from 'vue-router';
import { adminRoutes } from '@/modules/admin/router';
import { kebunRoutes } from '@/modules/kebun/router';
import { userSession } from '@/store/navigation';
import { authApi } from '@/shared/api';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...adminRoutes,
    ...kebunRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/kebun',
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = to.query.token as string;
  const role = to.query.role as string;
  const username = to.query.username as string;
  const code = to.query.code as string;

  if (token && role && username) {
    const roleId = role === 'Admin' ? '00000000-0000-0000-0000-000000000001' : 
                   (role === 'Owner' || role === 'Pemilik') ? '00000000-0000-0000-0000-000000000004' : '00000000-0000-0000-0000-000000000002';
    
    const userObj = {
      id: role === 'Admin' ? '11111111-1111-1111-1111-111111111101' : '11111111-1111-1111-1111-111111111103',
      email: username + '@farmease.com',
      username: username,
      role_id: roleId,
      operator_category: role,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Save to localStorage
    authApi.setAuth(token, userObj);
    
    // Update userSession reactive state
    userSession.value = {
      code: code || username,
      name: username,
      role: role,
    };

    // Clean URL query parameters
    const query = { ...to.query };
    delete query.token;
    delete query.role;
    delete query.username;
    delete query.code;
    
    return next({ path: to.path, query });
  }

  // Restore session if not loaded but token exists in localStorage
  if (!userSession.value && authApi.getToken()) {
    const user = authApi.getCurrentUser();
    if (user) {
      userSession.value = {
        code: user.username === 'admin' ? 'ADM-01' : user.username === 'pemilik' ? 'PEM-01' : user.username,
        name: user.username,
        role: user.role_id === '00000000-0000-0000-0000-000000000001' ? 'Admin' :
              user.role_id === '00000000-0000-0000-0000-000000000004' ? 'Owner' : 'Operator',
      };
    }
  }

  // Redirect to SSO if no token is present in localStorage/session
  const publicPaths = ['/login', '/sso'];
  if (!authApi.getToken() && !publicPaths.includes(to.path)) {
    window.location.href = 'http://localhost:3000/';
    return;
  }

  next();
});

export default router;
