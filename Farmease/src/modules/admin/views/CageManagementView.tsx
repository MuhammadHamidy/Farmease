import { defineComponent, ref, computed, onMounted } from 'vue';
import { cagesList, fetchCagesList, type CageInfo } from '@/store/navigation';
import { cagesApi, authApi } from '@/shared/api';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import CustomInput from '@/shared/ui/Input';
import CustomSelect from '@/shared/ui/Select';
import StatCard from '@/shared/ui/StatCard';

export default defineComponent({
  name: 'CageManagementView',
  setup() {
    const isModalOpen = ref(false);
    const newCage = ref<CageInfo>({
      code: '',
      name: '',
      type: 'Domba Garut & Merino',
      capacity: 50
    });
    const error = ref('');
    const alertError = ref('');
    const successMessage = ref('');
    const isLoading = ref(false);

    const totalCages = computed(() => cagesList.value.length);
    const totalCapacity = computed(() => cagesList.value.reduce((sum, c) => sum + c.capacity, 0));

    const loadCages = async () => {
      isLoading.value = true;
      try {
        await fetchCagesList();
      } catch (err: any) {
        alertError.value = 'Gagal mengambil data kandang dari server.';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(loadCages);

    const handleCreateCage = async () => {
      const code = newCage.value.code.trim().toUpperCase();
      const name = newCage.value.name.trim();
      const type = newCage.value.type.trim();
      const capacity = Number(newCage.value.capacity);

      if (!code || !name || !type || isNaN(capacity) || capacity <= 0) {
        error.value = 'Semua field harus diisi dengan benar.';
        return;
      }

      // Check uniqueness locally first
      const exists = cagesList.value.some(c => c.code.toUpperCase() === code);
      if (exists) {
        error.value = `Kode kandang "${code}" sudah terdaftar.`;
        return;
      }

      error.value = '';
      alertError.value = '';
      successMessage.value = '';
      isLoading.value = true;

      try {
        const currentUser = authApi.getCurrentUser();
        const farmId = currentUser?.farm_id || '550e8400-e29b-41d4-a716-446655440001';

        await cagesApi.create({
          cage_code: code,
          cage_name: name,
          capacity: capacity,
          cage_type: type,
          id_farm: farmId as any
        });

        successMessage.value = `Kandang ${code} berhasil ditambahkan!`;
        
        // Refresh list
        await fetchCagesList();
        
        isModalOpen.value = false;
        
        // Reset form
        newCage.value = {
          code: '',
          name: '',
          type: 'Domba Garut & Merino',
          capacity: 50
        };
      } catch (err: any) {
        console.error('Failed to create cage:', err);
        error.value = err.response?.data?.error?.message || 'Gagal menyimpan kandang ke server.';
      } finally {
        isLoading.value = false;
      }
    };

    const handleDeleteCage = async (id: number | undefined, code: string) => {
      if (!id) {
        alertError.value = 'ID kandang tidak ditemukan, tidak dapat menghapus.';
        return;
      }

      if (confirm(`Apakah Anda yakin ingin menghapus kandang ${code}?`)) {
        isLoading.value = true;
        alertError.value = '';
        successMessage.value = '';
        try {
          await cagesApi.delete(id);
          successMessage.value = `Kandang ${code} berhasil dihapus!`;
          await fetchCagesList();
        } catch (err: any) {
          console.error('Failed to delete cage:', err);
          alertError.value = err.response?.data?.error?.message || `Gagal menghapus kandang ${code}. Pastikan kandang kosong sebelum dihapus.`;
        } finally {
          isLoading.value = false;
        }
      }
    };

    return () => (
      <div class="animate-fade-in-up">
        {/* Header Section */}
        <div class="view-header mb-4">
          <div>
            <Typography variant="h2" size="text-2xl" weight="extrabold" className="m-0 text-dark">Manajemen Kandang</Typography>
            <Typography variant="p" size="text-sm" color="secondary" className="m-0">Tambahkan, ubah, atau hapus kandang peternakan Farmease.</Typography>
          </div>
          <button 
            type="button" 
            class="peternakan-primary-btn m-0" 
            onClick={() => isModalOpen.value = true}
            disabled={isLoading.value}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="me-1">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Tambah Kandang
          </button>
        </div>

        {/* Global Alerts */}
        {successMessage.value && (
          <div class="alert alert-success alert-dismissible fade show rounded-4 py-3 mb-4 border-0 d-flex align-items-center justify-content-between" style={{ backgroundColor: '#EDF7ED', color: '#1E4620' }}>
            <div class="d-flex align-items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="me-2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{successMessage.value}</span>
            </div>
            <button type="button" class="btn-close" onClick={() => successMessage.value = ''} style={{ position: 'relative', top: '0', right: '0', padding: '0', background: 'none', border: 'none', fontSize: '1.25rem', color: '#1E4620', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {alertError.value && (
          <div class="alert alert-danger alert-dismissible fade show rounded-4 py-3 mb-4 border-0 d-flex align-items-center justify-content-between" style={{ backgroundColor: '#FDECEC', color: '#8B1E1E' }}>
            <div class="d-flex align-items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="me-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{alertError.value}</span>
            </div>
            <button type="button" class="btn-close" onClick={() => alertError.value = ''} style={{ position: 'relative', top: '0', right: '0', padding: '0', background: 'none', border: 'none', fontSize: '1.25rem', color: '#8B1E1E', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Stats Summary Row */}
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-6 col-lg-4">
            <StatCard 
              label="Total Unit Kandang" 
              value={String(totalCages.value)} 
              color="primary"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              )}
            />
          </div>
          <div class="col-12 col-md-6 col-lg-4">
            <StatCard 
              label="Kapasitas Kumulatif" 
              value={`${totalCapacity.value} Ekor`} 
              color="light"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )}
            />
          </div>
        </div>

        {/* Table View (Desktop) */}
        <div class="view-card d-none d-md-block">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Kode Kandang</th>
                <th>Nama Area / Kandang</th>
                <th>Fokus Jenis Ternak</th>
                <th>Kapasitas</th>
                <th style={{ width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cagesList.value.map(c => (
                <tr key={c.code}>
                  <td><code>{c.code}</code></td>
                  <td class="fw-bold">{c.name}</td>
                  <td>{c.type}</td>
                  <td>
                    <Badge variant="success">{c.capacity} Ekor</Badge>
                  </td>
                  <td>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-danger rounded-3" 
                      onClick={() => handleDeleteCage(c.id, c.code)}
                      disabled={isLoading.value}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {cagesList.value.length === 0 && (
                <tr>
                  <td colspan="5" class="text-center py-4 text-muted">
                    Tidak ada data kandang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* List View (Mobile) */}
        <div class="mobile-only d-md-none">
          <div class="mobile-card-list">
            {cagesList.value.map(c => (
              <div key={c.code} class="admin-mobile-card">
                <div class="card-top">
                  <div class="card-info">
                    <span class="card-name">{c.name}</span>
                    <span class="card-sub">{c.type}</span>
                  </div>
                  <span class="card-code">{c.code}</span>
                </div>
                <div class="card-footer">
                  <span class="fw-bold text-secondary">{c.capacity} Ekor</span>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-danger px-3 py-1 rounded-3 text-white border-0 fw-bold" 
                    onClick={() => handleDeleteCage(c.id, c.code)}
                    disabled={isLoading.value}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            {cagesList.value.length === 0 && (
              <div class="text-center py-4 text-muted">
                Tidak ada data kandang ditemukan.
              </div>
            )}
          </div>
        </div>

        {/* Create Cage Modal */}
        {isModalOpen.value && (
          <div class="peternakan-modal-overlay" onClick={() => isModalOpen.value = false}>
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div class="peternakan-modal-header">
                <button class="peternakan-modal-close" onClick={() => isModalOpen.value = false} disabled={isLoading.value}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <div class="peternakan-modal-title">Tambah Kandang Baru</div>
              </div>

              <div class="peternakan-modal-body mt-4">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="pencatatan-label">Kode Kandang (Contoh: K003)</label>
                    <CustomInput 
                      modelValue={newCage.value.code}
                      placeholder="Contoh: K003"
                      onUpdate:modelValue={(val: string) => newCage.value.code = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Nama Kandang / Area</label>
                    <CustomInput 
                      modelValue={newCage.value.name}
                      placeholder="Contoh: Kandang K003 (Pembesaran)"
                      onUpdate:modelValue={(val: string) => newCage.value.name = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Fokus Jenis Domba</label>
                    <CustomSelect 
                      options={['Domba Garut & Merino', 'Domba Dorper', 'Domba Perawatan', 'Cempe Baru (Anakan)']}
                      modelValue={newCage.value.type}
                      onUpdate:modelValue={(val: string) => newCage.value.type = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Kapasitas Maksimal (Ekor)</label>
                    <CustomInput 
                      type="number"
                      modelValue={String(newCage.value.capacity)}
                      placeholder="Contoh: 50"
                      onUpdate:modelValue={(val: string) => newCage.value.capacity = Number(val)}
                    />
                  </div>
                </div>

                {error.value && (
                  <div class="alert alert-danger rounded-4 py-3 small mt-3 border-0" style={{ backgroundColor: '#FDECEC', color: '#8B1E1E' }}>
                    {error.value}
                  </div>
                )}

                <div class="mt-4 pt-3 border-top d-flex gap-3">
                  <button class="btn btn-light grow fw-bold py-2.5 rounded-pill" onClick={() => isModalOpen.value = false} disabled={isLoading.value}>Batal</button>
                  <button class="peternakan-primary-btn grow m-0 justify-content-center" onClick={handleCreateCage} disabled={isLoading.value}>
                    {isLoading.value ? 'Menyimpan...' : 'Simpan Kandang'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
});
