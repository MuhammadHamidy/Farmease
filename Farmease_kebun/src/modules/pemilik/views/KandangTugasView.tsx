import { defineComponent, ref } from 'vue';
import { userSession, cageSession } from '@/store/navigation';

export default defineComponent({
  name: 'KandangTugasView',
  setup() {
    const handleLogout = () => {
      userSession.value = null;
      cageSession.value = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = 'http://localhost:3000/';
    };

    return () => {
      const ownerName = userSession.value?.name || 'Pemilik';
      const avatarLetter = ownerName.charAt(0).toUpperCase();

      return (
        <div class="pemilik-page" style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary, #4caf50)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                {avatarLetter}
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>Selamat Datang, {ownerName}</h1>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>Dashboard Pemilik (Perkebunan)</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={handleLogout} 
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Keluar
            </button>
          </header>

          {/* Main Info */}
          <main style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div style={{ padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <h2 style={{ color: '#111827', marginBottom: '0.5rem' }}>Halaman Pemilik (Perkebunan)</h2>
              <p style={{ color: '#4b5563', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
                Halaman dasbor pemilik (Owner/Pemilik) untuk perkebunan sedang dalam proses pemulihan (recovery).
              </p>
              <div style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: '#eef2f6', borderRadius: '8px', color: '#1e3a8a', fontWeight: 'bold' }}>
                Mode Pemulihan Aktif
              </div>
            </div>
          </main>
        </div>
      );
    };
  },
});
