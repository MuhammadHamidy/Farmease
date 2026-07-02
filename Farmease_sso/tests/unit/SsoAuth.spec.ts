import { describe, it, expect } from 'vitest';

interface User {
  role_id: string;
  operator_category: string;
  username: string;
}

// Meniru logika fungsi selectRole di SsoHeroLogin.tsx untuk pengujian unit otorisasi portal
function checkUserAuthorization(user: User, targetService: 'ternak' | 'kebun', targetRole: string): boolean {
  const roleId = String(user.role_id);
  const category = String(user.operator_category || '').toLowerCase();
  const usernameLower = String(user.username || '').toLowerCase();

  // Admin role UUID can access everything
  if (roleId === '00000000-0000-0000-0000-000000000001' || usernameLower === 'admin') {
    return true;
  }
  // Owner/Pemilik
  else if (roleId === '00000000-0000-0000-0000-000000000002' || roleId === '00000000-0000-0000-0000-000000000004' || usernameLower === 'pemilik' || category.includes('owner') || category.includes('pemilik')) {
    if (targetRole === 'Admin' || targetRole === 'Owner' || targetRole === 'Pemilik' || targetRole === 'Operator') {
      if (category.includes('ternak') && targetService !== 'ternak') {
        return false;
      } else if (category.includes('kebun') && targetService !== 'kebun') {
        return false;
      }
      return true;
    }
  }
  // Operator
  else if (roleId === '00000000-0000-0000-0000-000000000003' || roleId === '00000000-0000-0000-0000-000000000004' || category.includes('operator') || usernameLower.includes('operator')) {
    if (targetService === 'ternak' && targetRole === 'Operator' && (roleId === '00000000-0000-0000-0000-000000000004' || category.includes('ternak') || usernameLower.includes('peternak') || usernameLower === 'operator')) {
      return true;
    }
    if (targetService === 'kebun' && targetRole === 'Operator' && (roleId === '00000000-0000-0000-0000-000000000003' || category.includes('kebun') || usernameLower.includes('kebun'))) {
      return true;
    }
  }
  return false;
}

describe('SSO Portal Role Authorization Logic', () => {
  it('allows Admin user to access any service and role', () => {
    const adminUser = { role_id: '00000000-0000-0000-0000-000000000001', operator_category: '', username: 'admin' };
    expect(checkUserAuthorization(adminUser, 'ternak', 'Admin')).toBe(true);
    expect(checkUserAuthorization(adminUser, 'kebun', 'Operator')).toBe(true);
  });

  it('restricts Pemilik Ternak from entering Perkebunan portal', () => {
    const ownerTernak = { role_id: '00000000-0000-0000-0000-000000000002', operator_category: 'pemilik ternak', username: 'pak_budi' };
    expect(checkUserAuthorization(ownerTernak, 'ternak', 'Owner')).toBe(true);
    expect(checkUserAuthorization(ownerTernak, 'kebun', 'Owner')).toBe(false);
  });

  it('allows operator ternak to enter peternakan but blocks perkebunan', () => {
    const opTernak = { role_id: '00000000-0000-0000-0000-000000000004', operator_category: 'operator ternak', username: 'opt_ternak' };
    expect(checkUserAuthorization(opTernak, 'ternak', 'Operator')).toBe(true);
    expect(checkUserAuthorization(opTernak, 'kebun', 'Operator')).toBe(false);
  });

  it('allows operator kebun to enter perkebunan but blocks peternakan', () => {
    const opKebun = { role_id: '00000000-0000-0000-0000-000000000003', operator_category: 'operator kebun', username: 'opt_kebun' };
    expect(checkUserAuthorization(opKebun, 'kebun', 'Operator')).toBe(true);
    expect(checkUserAuthorization(opKebun, 'ternak', 'Operator')).toBe(false);
  });
});
