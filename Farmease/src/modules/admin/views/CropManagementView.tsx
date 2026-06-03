import { defineComponent, ref, computed, onMounted } from 'vue';
import { cropsList, landsList, fetchLandsList, fetchCropsList, type CropInfo } from '@/store/navigation';
import { pohonApi } from '@/shared/api';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import CustomInput from '@/shared/ui/Input';
import CustomSelect from '@/shared/ui/Select';
import StatCard from '@/shared/ui/StatCard';

export default defineComponent({
  name: 'CropManagementView',
  setup() {
    const isModalOpen = ref(false);
    const newCrop = ref<CropInfo>({
      code: '',
      name: '',
      type: 'Vegetatif',
      land: '',
      age: ''
    });
    const error = ref('');
    const alertError = ref('');
    const successMessage = ref('');
    const isLoading = ref(false);

    const totalCrops = computed(() => cropsList.value.length);
    const availableLands = computed(() => landsList.value.map(l => l.code));

    const loadData = async () => {
      isLoading.value = true;
      try {
        await fetchLandsList();
        await fetchCropsList();
      } catch (err: any) {
        alertError.value = 'Gagal mengambil data dari server.';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(loadData);

    const handleCreateCrop = async () => {
      const code = newCrop.value.code.trim().toUpperCase();
      const name = newCrop.value.name.trim();
      const type = newCrop.value.type;
      const land = newCrop.value.land || (availableLands.value[0] || '');
      const age = newCrop.value.age.trim();

      if (!code || !name || !type || !land || !age) {
        error.value = 'Semua field harus diisi dengan benar.';
        return;
      }

      // Check uniqueness locally
      const exists = cropsList.value.some(c => c.code.toUpperCase() === code);
      if (exists) {
        error.value = `Kode tanaman "${code}" sudah terdaftar.`;
        return;
      }

      // Resolve land code to land ID
      const selectedLand = landsList.value.find(l => l.code === land);
      if (!selectedLand || !selectedLand.id) {
        error.value = 'Lahan terpilih tidak valid. Pastikan lahan tersebut ada.';
        return;
      }

      error.value = '';
      alertError.value = '';
      successMessage.value = '';
      isLoading.value = true;

      try {
        await pohonApi.create({
          kode_pohon: code,
          jenis: name,
          status: type,
          id_lahan: selectedLand.id,
          umur: parseInt(age) || 1,
        });

        successMessage.value = `Tanaman ${code} berhasil ditambahkan!`;
        await fetchCropsList();
        isModalOpen.value = false;
        
        // Reset form
        newCrop.value = {
          code: '',
          name: '',
          type: 'Vegetatif',
          land: availableLands.value[0] || '',
          age: ''
        };
      } catch (err: any) {
        console.error('Failed to create tree:', err);
        error.value = err.response?.data?.message || 'Gagal menyimpan tanaman ke server.';
      } finally {
        isLoading.value = false;
      }
    };

    const handleDeleteCrop = async (id: number | undefined, code: string) => {
      if (!id) {
        alertError.value = 'ID tanaman tidak ditemukan, tidak dapat menghapus.';
        return;
      }

      if (confirm(`Apakah Anda yakin ingin menghapus tanaman ${code}?`)) {
        isLoading.value = true;
        alertError.value = '';
        successMessage.value = '';
        try {
          await pohonApi.delete(id);
          successMessage.value = `Tanaman ${code} berhasil dihapus!`;
          await fetchCropsList();
        } catch (err: any) {
          console.error('Failed to delete tree:', err);
          alertError.value = err.response?.data?.message || `Gagal menghapus tanaman ${code}.`;
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
            <Typography variant="h2" size="text-2xl" weight="extrabold" className="m-0 text-dark">Manajemen Tanaman (Perkebunan)</Typography>
            <Typography variant="p" size="text-sm" color="secondary" className="m-0">Kelola bibit/pohon perkebunan serta penempatan lahannya.</Typography>
          </div>
          <button 
            type="button" 
            class="peternakan-primary-btn m-0" 
            onClick={() => {
              newCrop.value.land = availableLands.value[0] || '';
              isModalOpen.value = true;
            }}
            disabled={isLoading.value}
            style={{ background: 'linear-gradient(135deg, #4f5d2e 0%, #303b1d 100%)', boxShadow: '0 8px 20px -4px rgba(48, 59, 29, 0.25)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="me-1">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Tambah Tanaman
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
              label="Total Populasi Tanaman" 
              value={String(totalCrops.value)} 
              color="primary"
              icon={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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
                <th>Kode</th>
                <th>Nama Tanaman</th>
                <th>Fase/Tipe</th>
                <th>Penempatan Lahan</th>
                <th>Umur Tanaman</th>
                <th style={{ width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cropsList.value.map(c => (
                <tr key={c.code}>
                  <td><code>{c.code}</code></td>
                  <td class="fw-bold">{c.name}</td>
                  <td>
                    <Badge variant={c.type === 'Vegetatif' ? 'info' : c.type === 'Pembibitan' ? 'warning' : 'success'}>{c.type}</Badge>
                  </td>
                  <td>{c.land}</td>
                  <td>{c.age}</td>
                  <td>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-danger rounded-3" 
                      onClick={() => handleDeleteCrop(c.id, c.code)}
                      disabled={isLoading.value}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {cropsList.value.length === 0 && (
                <tr>
                  <td colspan="6" class="text-center py-4 text-muted">
                    Tidak ada data tanaman ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* List View (Mobile) */}
        <div class="mobile-only d-md-none">
          <div class="mobile-card-list">
            {cropsList.value.map(c => (
              <div key={c.code} class="admin-mobile-card">
                <div class="card-top">
                  <div class="card-info">
                    <span class="card-name">{c.name}</span>
                    <span class="card-sub">{c.land} • {c.age}</span>
                  </div>
                  <span class="card-code">{c.code}</span>
                </div>
                <div class="card-footer">
                  <Badge variant={c.type === 'Vegetatif' ? 'info' : c.type === 'Pembibitan' ? 'warning' : 'success'}>{c.type}</Badge>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-danger px-3 py-1 rounded-3 text-white border-0 fw-bold" 
                    onClick={() => handleDeleteCrop(c.id, c.code)}
                    disabled={isLoading.value}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            {cropsList.value.length === 0 && (
              <div class="text-center py-4 text-muted">
                Tidak ada data tanaman ditemukan.
              </div>
            )}
          </div>
        </div>

        {/* Create Crop Modal */}
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
                <div class="peternakan-modal-title">Tambah Tanaman Baru</div>
              </div>

              <div class="peternakan-modal-body mt-4">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="pencatatan-label">Kode Pohon (Contoh: A03)</label>
                    <CustomInput 
                      modelValue={newCrop.value.code}
                      placeholder="Masukkan kode pohon"
                      onUpdate:modelValue={(val: string) => newCrop.value.code = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Nama Tanaman / Pohon</label>
                    <CustomInput 
                      modelValue={newCrop.value.name}
                      placeholder="Contoh: Alpukat Mentega"
                      onUpdate:modelValue={(val: string) => newCrop.value.name = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Fase Pertumbuhan</label>
                    <CustomSelect 
                      options={['Vegetatif', 'Generatif', 'Pembibitan']}
                      modelValue={newCrop.value.type}
                      onUpdate:modelValue={(val: string) => newCrop.value.type = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Penempatan Lahan</label>
                    {availableLands.value.length === 0 ? (
                      <div class="text-danger small mt-1">Belum ada lahan aktif. Harap tambahkan lahan terlebih dahulu.</div>
                    ) : (
                      <CustomSelect 
                        options={availableLands.value}
                        modelValue={newCrop.value.land}
                        onUpdate:modelValue={(val: string) => newCrop.value.land = val}
                      />
                    )}
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Estimasi Umur Tanaman (Angka saja dalam tahun, misal: 2)</label>
                    <CustomInput 
                      modelValue={newCrop.value.age}
                      placeholder="Contoh: 2"
                      onUpdate:modelValue={(val: string) => newCrop.value.age = val}
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
                  <button 
                    class="peternakan-primary-btn grow m-0 justify-content-center" 
                    onClick={handleCreateCrop}
                    style={{ backgroundColor: '#4f5d2e' }}
                    disabled={availableLands.value.length === 0 || isLoading.value}
                  >
                    {isLoading.value ? 'Menyimpan...' : 'Simpan Tanaman'}
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
