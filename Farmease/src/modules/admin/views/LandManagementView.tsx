import { defineComponent, ref, computed, onMounted } from 'vue';
import { landsList, fetchLandsList, type LandInfo } from '@/store/navigation';
import { lahanApi } from '@/shared/api';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import CustomInput from '@/shared/ui/Input';
import CustomSelect from '@/shared/ui/Select';
import StatCard from '@/shared/ui/StatCard';

export default defineComponent({
  name: 'LandManagementView',
  setup() {
    const isModalOpen = ref(false);
    const newLand = ref<LandInfo>({
      code: '',
      name: '',
      area: '',
      status: 'Subur'
    });
    const error = ref('');
    const alertError = ref('');
    const successMessage = ref('');
    const isLoading = ref(false);

    const totalLands = computed(() => landsList.value.length);

    const loadLands = async () => {
      isLoading.value = true;
      try {
        await fetchLandsList();
      } catch (err: any) {
        alertError.value = 'Gagal mengambil data lahan dari server.';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(loadLands);

    const handleCreateLand = async () => {
      const code = newLand.value.code.trim().toUpperCase();
      const name = newLand.value.name.trim();
      const area = newLand.value.area.trim();
      const status = newLand.value.status;

      if (!code || !name || !area || !status) {
        error.value = 'Semua field harus diisi dengan benar.';
        return;
      }

      // Check uniqueness locally
      const exists = landsList.value.some(l => l.code.toUpperCase() === code);
      if (exists) {
        error.value = `Kode lahan "${code}" sudah terdaftar.`;
        return;
      }

      error.value = '';
      alertError.value = '';
      successMessage.value = '';
      isLoading.value = true;

      try {
        await lahanApi.create({
          kode_lahan: code,
          nama_lahan: name,
          luas: parseFloat(area) || 1.0,
          status: status
        });

        successMessage.value = `Lahan ${code} berhasil ditambahkan!`;
        await fetchLandsList();
        isModalOpen.value = false;
        
        // Reset form
        newLand.value = {
          code: '',
          name: '',
          area: '',
          status: 'Subur'
        };
      } catch (err: any) {
        console.error('Failed to create land:', err);
        error.value = err.response?.data?.message || 'Gagal menyimpan lahan ke server.';
      } finally {
        isLoading.value = false;
      }
    };

    const handleDeleteLand = async (id: number | undefined, code: string) => {
      if (!id) {
        alertError.value = 'ID lahan tidak ditemukan, tidak dapat menghapus.';
        return;
      }

      if (confirm(`Apakah Anda yakin ingin menghapus lahan ${code}?`)) {
        isLoading.value = true;
        alertError.value = '';
        successMessage.value = '';
        try {
          await lahanApi.delete(id);
          successMessage.value = `Lahan ${code} berhasil dihapus!`;
          await fetchLandsList();
        } catch (err: any) {
          console.error('Failed to delete land:', err);
          alertError.value = err.response?.data?.message || `Gagal menghapus lahan ${code}.`;
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
            <Typography variant="h2" size="text-2xl" weight="extrabold" className="m-0 text-dark">Manajemen Lahan (Perkebunan)</Typography>
            <Typography variant="p" size="text-sm" color="secondary" className="m-0">Tambahkan atau hapus lahan perkebunan untuk operasional lapangan.</Typography>
          </div>
          <button 
            type="button" 
            class="peternakan-primary-btn m-0" 
            onClick={() => isModalOpen.value = true}
            disabled={isLoading.value}
            style={{ background: 'linear-gradient(135deg, #4f5d2e 0%, #303b1d 100%)', boxShadow: '0 8px 20px -4px rgba(48, 59, 29, 0.25)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="me-1">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Tambah Lahan
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
              label="Total Lahan Aktif" 
              value={String(totalLands.value)} 
              color="primary"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
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
                <th>Kode Lahan</th>
                <th>Nama Lahan Perkebunan</th>
                <th>Luas Area</th>
                <th>Status Lahan</th>
                <th style={{ width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {landsList.value.map(l => (
                <tr key={l.code}>
                  <td><code>{l.code}</code></td>
                  <td class="fw-bold">{l.name}</td>
                  <td>{l.area}</td>
                  <td>
                    <Badge variant={l.status === 'Subur' ? 'success' : 'warning'}>{l.status}</Badge>
                  </td>
                  <td>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-danger rounded-3" 
                      onClick={() => handleDeleteLand(l.id, l.code)}
                      disabled={isLoading.value}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {landsList.value.length === 0 && (
                <tr>
                  <td colspan="5" class="text-center py-4 text-muted">
                    Tidak ada data lahan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* List View (Mobile) */}
        <div class="mobile-only d-md-none">
          <div class="mobile-card-list">
            {landsList.value.map(l => (
              <div key={l.code} class="admin-mobile-card">
                <div class="card-top">
                  <div class="card-info">
                    <span class="card-name">{l.name}</span>
                    <span class="card-sub">{l.area}</span>
                  </div>
                  <span class="card-code">{l.code}</span>
                </div>
                <div class="card-footer">
                  <Badge variant={l.status === 'Subur' ? 'success' : 'warning'}>{l.status}</Badge>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-danger px-3 py-1 rounded-3 text-white border-0 fw-bold" 
                    onClick={() => handleDeleteLand(l.id, l.code)}
                    disabled={isLoading.value}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            {landsList.value.length === 0 && (
              <div class="text-center py-4 text-muted">
                Tidak ada data lahan ditemukan.
              </div>
            )}
          </div>
        </div>

        {/* Create Land Modal */}
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
                <div class="peternakan-modal-title">Tambah Lahan Baru</div>
              </div>

              <div class="peternakan-modal-body mt-4">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="pencatatan-label">Kode Lahan (Contoh: LH-003)</label>
                    <CustomInput 
                      modelValue={newLand.value.code}
                      placeholder="Masukkan kode lahan"
                      onUpdate:modelValue={(val: string) => newLand.value.code = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Nama Lahan Perkebunan</label>
                    <CustomInput 
                      modelValue={newLand.value.name}
                      placeholder="Contoh: Lahan Jeruk Timur"
                      onUpdate:modelValue={(val: string) => newLand.value.name = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Luas Area Lahan (Angka saja, misal: 2.5)</label>
                    <CustomInput 
                      modelValue={newLand.value.area}
                      placeholder="Contoh: 2.5"
                      onUpdate:modelValue={(val: string) => newLand.value.area = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Status Awal Lahan</label>
                    <CustomSelect 
                      options={['Subur', 'Pemulihan', 'Perlu Pengairan']}
                      modelValue={newLand.value.status}
                      onUpdate:modelValue={(val: string) => newLand.value.status = val}
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
                  <button class="peternakan-primary-btn grow m-0 justify-content-center" onClick={handleCreateLand} disabled={isLoading.value} style={{ backgroundColor: '#4f5d2e' }}>
                    {isLoading.value ? 'Menyimpan...' : 'Simpan Lahan'}
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
