import { createRouter, createWebHistory } from 'vue-router';
import { adminRoutes } from '@/modules/admin/router';
import { ternakRoutes } from '@/modules/ternak/router';
import { pemilikTernakRoutes } from '@/modules/pemilik/router';
import { userSession } from '@/store/navigation';
import { authApi } from '@/shared/api';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...adminRoutes,
    ...ternakRoutes,
    ...pemilikTernakRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/ternak',
    },
  ],
});

router.beforeEach((to, from) => {
  const token = to.query.token as string;
  const role = to.query.role as string;
  const username = to.query.username as string;
  const code = to.query.code as string;

  if (token && role && username) {
    const roleId = role === 'Admin' ? '00000000-0000-0000-0000-000000000001' : 
                   (role === 'Owner' || role === 'Pemilik') ? '00000000-0000-0000-0000-000000000004' : '00000000-0000-0000-0000-000000000002';
    
    const userObj = {
      id: role === 'Admin' ? '11111111-1111-1111-1111-111111111101' : '11111111-1111-1111-1111-111111111106',
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

    // Redirect Owner/Pemilik ke halaman pemilik tersendiri
    const isOwner = role === 'Owner' || role === 'Pemilik';
    if (isOwner && to.path !== '/pemilik') {
      return { path: '/pemilik', query };
    }
    
    return { path: to.path, query };
  }

  // Restore session if not loaded but token exists in localStorage
  const rawToken = authApi.getToken();
  const hasToken = rawToken && rawToken !== 'null' && rawToken !== 'undefined' && rawToken.trim() !== '';

  if (!hasToken) {
    userSession.value = null;
  }

  if (hasToken && !userSession.value) {
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
  if (!hasToken && !publicPaths.includes(to.path)) {
    console.warn('[Auth Guard] No valid token found, redirecting to SSO...');
    const host = window.location.hostname;
    window.location.href = `http://${host}:3000/`;
    return false;
  }

  // Enforce Owner/Pemilik always lands on /pemilik and non-owners cannot enter /pemilik
  const isOwner = userSession.value?.role === 'Owner' || userSession.value?.role === 'Pemilik';
  if (isOwner && to.path !== '/pemilik' && !publicPaths.includes(to.path)) {
    return '/pemilik';
  }
  if (!isOwner && to.path === '/pemilik') {
    return userSession.value?.role === 'Admin' ? '/admin' : '/ternak';
  }

  return true;
});

export default router;
