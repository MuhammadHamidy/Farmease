import type { UserSession } from '@/store/navigation';

export type SsoAccount = {
  username: string;
  password: string;
  session: UserSession;
  /** Nama route vue-router setelah login */
  routeName: string;
};

/** Akun demo — ganti dengan API auth saat backend SSO siap */
export const SSO_DEMO_ACCOUNTS: SsoAccount[] = [
  {
    username: 'pemilik',
    password: 'pemilik123',
    session: { code: 'PEM001', name: 'Pemilik Farm', role: 'Owner' },
    routeName: 'admin',
  },
  {
    username: 'admin',
    password: 'admin123',
    session: { code: 'ADM001', name: 'Admin Utama', role: 'Admin' },
    routeName: 'admin',
  },
  {
    username: 'operator_kebun',
    password: 'kebun123',
    session: { code: 'OP002', name: 'Operator Perkebunan', role: 'Operator Perkebunan' },
    routeName: 'kebun',
  },
  {
    username: 'operator_kandang',
    password: 'kandang123',
    session: { code: 'OP001', name: 'Operator Kandang', role: 'Operator Peternakan' },
    routeName: 'masuk-kandang',
  },
  {
    username: 'kebun',
    password: 'kebun',
    session: { code: 'OP002', name: 'Operator Perkebunan', role: 'Operator Perkebunan' },
    routeName: 'kebun',
  },
  {
    username: 'peternak',
    password: 'peternak',
    session: { code: 'OP001', name: 'Operator Kandang', role: 'Operator Peternakan' },
    routeName: 'masuk-kandang',
  },
];

export function authenticateSso(username: string, password: string): SsoAccount | null {
  const user = username.trim().toLowerCase();
  return (
    SSO_DEMO_ACCOUNTS.find(
      (a) => a.username.toLowerCase() === user && a.password === password,
    ) ?? null
  );
}
