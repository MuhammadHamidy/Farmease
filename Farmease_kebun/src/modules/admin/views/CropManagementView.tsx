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

    const handleDeleteCrop = async (id: string | number | undefined, code: string) => {
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
      <div class="animate-fade-in-up" style={{ padding: '0 0.5rem' }}>
        {/* Header Section */}
        <div class="view-header mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <Typography variant="h2" class="view-title" style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.75rem', fontWeight: '800' }}>
              Manajemen Tanaman
            </Typography>
            <Typography variant="span" color="secondary" style={{ fontSize: '0.875rem', color: '#6C757D', marginTop: '4px', display: 'block' }}>
              Kelola bibit/pohon perkebunan serta penempatan lahannya
            </Typography>
          </div>
          <button 
            type="button" 
            class="btn" 
            onClick={() => {
              newCrop.value.land = availableLands.value[0] || '';
              isModalOpen.value = true;
            }}
            disabled={isLoading.value}
            style={{ 
              backgroundColor: '#38431F', 
              color: '#ffffff', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: '800',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 10px rgba(56, 67, 31, 0.15)',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '1.3rem', fontWeight: 'bold', lineHeight: '1' }}>+</span>
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
            <div class="bg-white rounded-4 p-4 d-flex justify-content-between align-items-center" style={{ border: '1.5px solid #E6D9CE' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: '#374151', marginBottom: '0.45rem' }}>
                  Total Populasi Tanaman
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#000000', marginBottom: '0.45rem', fontFamily: "'Inter', sans-serif" }}>
                  {totalCrops.value} Pohon
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#6B7280' }}>
                  Tersebar di seluruh lahan
                </div>
              </div>
              <div>
                <img src="/icon/bibit.png" alt="Bibit" style="width: 48px; height: 48px; object-fit: contain;" />
              </div>
            </div>
          </div>
        </div>

        {/* Table View (Desktop) */}
        <div class="view-card d-none d-md-block" style={{ padding: '0px', border: '1.5px solid #E6D9CE', borderRadius: '12px', overflow: 'hidden' }}>
          <table class="admin-table m-0">
            <thead style={{ backgroundColor: '#F9F8F6' }}>
              <tr>
                <th style={{ color: '#7F8C8D', fontSize: '0.78rem', fontWeight: '800', padding: '1rem' }}>KODE POHON</th>
                <th style={{ color: '#7F8C8D', fontSize: '0.78rem', fontWeight: '800', padding: '1rem' }}>NAMA TANAMAN</th>
                <th style={{ color: '#7F8C8D', fontSize: '0.78rem', fontWeight: '800', padding: '1rem' }}>FASE / TIPE</th>
                <th style={{ color: '#7F8C8D', fontSize: '0.78rem', fontWeight: '800', padding: '1rem' }}>PENEMPATAN LAHAN</th>
                <th style={{ color: '#7F8C8D', fontSize: '0.78rem', fontWeight: '800', padding: '1rem' }}>UMUR TANAMAN</th>
                <th style={{ color: '#7F8C8D', fontSize: '0.78rem', fontWeight: '800', padding: '1rem', width: '120px', textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {cropsList.value.map((c, index) => (
                <tr key={c.code} style={{ borderBottom: index < cropsList.value.length - 1 ? '1px solid #f1eff0' : 'none' }}>
                  <td style={{ padding: '1rem' }}><code>{c.code}</code></td>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#000000' }}>{c.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <Badge variant={c.type === 'Vegetatif' ? 'info' : c.type === 'Pembibitan' ? 'warning' : 'success'}>{c.type}</Badge>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#000000' }}>{c.land}</td>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#000000' }}>{c.age} Tahun</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-danger" 
                      onClick={() => handleDeleteCrop(c.id, c.code)}
                      disabled={isLoading.value}
                      style={{ 
                        border: '1.5px solid #fca5a5', 
                        borderRadius: '8px', 
                        fontWeight: '700', 
                        color: '#ef4444',
                        padding: '0.35rem 1rem',
                        fontSize: '0.85rem',
                        textTransform: 'uppercase'
                      }}
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
            {cropsList.value.map((c) => (
              <div key={c.code} class="admin-mobile-card" style={{ border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', backgroundColor: '#fff' }}>
                <div class="card-top d-flex justify-content-between mb-2">
                  <div>
                    <span class="fw-bold text-dark" style={{ fontSize: '1.05rem' }}>{c.name}</span>
                    <span class="text-muted small d-block">Lahan: {c.land} • Umur: {c.age} Tahun</span>
                  </div>
                  <span class="card-code text-uppercase font-monospace" style={{ fontSize: '0.9rem', color: '#606C38', fontWeight: '700' }}>{c.code}</span>
                </div>
                <hr style={{ margin: '0.75rem 0', borderColor: '#f3f4f6' }} />
                <div class="card-footer d-flex justify-content-between align-items-center">
                  <Badge variant={c.type === 'Vegetatif' ? 'info' : c.type === 'Pembibitan' ? 'warning' : 'success'}>{c.type}</Badge>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-danger" 
                    onClick={() => handleDeleteCrop(c.id, c.code)}
                    disabled={isLoading.value}
                    style={{ border: '1.5px solid #fca5a5', borderRadius: '8px', fontWeight: '700', color: '#ef4444', padding: '0.35rem 1rem' }}
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
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', borderRadius: '16px' }}>
              <div class="peternakan-modal-header d-flex justify-content-between align-items-center" style={{ borderBottom: 'none', padding: '1.5rem 1.5rem 0 1.5rem' }}>
                <div class="peternakan-modal-title" style={{ fontSize: '1.35rem', fontWeight: '800', color: '#000000', fontFamily: "'Inter', sans-serif" }}>
                  Tambah Tanaman Baru
                </div>
                <button 
                  class="peternakan-modal-close border-0" 
                  onClick={() => isModalOpen.value = false} 
                  disabled={isLoading.value}
                  style={{ background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}
                >
                  &times;
                </button>
              </div>

              <div class="peternakan-modal-body" style={{ padding: '1.5rem' }}>
                <div class="row g-3">
                  <div class="col-12">
                    <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '800', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Kode Pohon (Contoh: A03)</label>
                    <CustomInput 
                      modelValue={newCrop.value.code}
                      placeholder="Masukkan kode pohon"
                      onUpdate:modelValue={(val: string) => newCrop.value.code = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '800', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Nama Tanaman / Pohon</label>
                    <CustomInput 
                      modelValue={newCrop.value.name}
                      placeholder="Contoh: Alpukat Mentega"
                      onUpdate:modelValue={(val: string) => newCrop.value.name = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '800', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Fase Pertumbuhan</label>
                    <CustomSelect 
                      options={['Vegetatif', 'Generatif', 'Pembibitan']}
                      modelValue={newCrop.value.type}
                      onUpdate:modelValue={(val: string) => newCrop.value.type = val}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '800', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Penempatan Lahan</label>
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
                    <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '800', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Estimasi Umur Tanaman (Angka saja dalam tahun, misal: 2)</label>
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

                {/* Footer Buttons Batal on Left and Simpan on Right */}
                <div class="mt-4 pt-3 border-top d-flex gap-3">
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    onClick={() => isModalOpen.value = false}
                    style={{ 
                      borderRadius: '8px', 
                      fontWeight: '600', 
                      padding: '0.65rem 0', 
                      width: '45%', 
                      border: '1.5px solid #d1d5db', 
                      color: '#374151', 
                      backgroundColor: '#ffffff' 
                    }}
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    class="btn text-white"
                    onClick={handleCreateCrop}
                    disabled={availableLands.value.length === 0 || isLoading.value}
                    style={{ 
                      borderRadius: '8px', 
                      fontWeight: '600', 
                      padding: '0.65rem 0', 
                      width: '55%', 
                      backgroundColor: '#38431F', 
                      border: 'none' 
                    }}
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
