import { defineComponent, ref, computed, onMounted } from 'vue';
import { landsList, fetchLandsList, cropsList, fetchCropsList, type LandInfo } from '@/store/navigation';
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
    const isEditing = ref(false);
    const editingLandId = ref<number | null>(null);
    
    const newLand = ref<LandInfo>({
      code: '',
      name: '',
      area: '',
      status: 'Subur',
      capacity: 50
    });
    
    const error = ref('');
    const alertError = ref('');
    const successMessage = ref('');
    const isLoading = ref(false);

    const totalLands = computed(() => landsList.value.length);

    const loadLands = async () => {
      isLoading.value = true;
      try {
        await Promise.all([
          fetchLandsList(),
          fetchCropsList()
        ]);
      } catch (err: any) {
        alertError.value = 'Gagal mengambil data lahan dari server.';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(loadLands);

    const openAdd = () => {
      isEditing.value = false;
      editingLandId.value = null;
      newLand.value = {
        code: '',
        name: '',
        area: '',
        status: 'Subur',
        capacity: 50
      };
      error.value = '';
      isModalOpen.value = true;
    };

    const openEdit = (land: LandInfo) => {
      isEditing.value = true;
      editingLandId.value = land.id || null;
      newLand.value = {
        code: land.code,
        name: land.name,
        area: land.area.replace(/\s*Hektar/gi, '').trim(),
        status: land.status,
        capacity: land.capacity || 50
      };
      error.value = '';
      isModalOpen.value = true;
    };

    const handleSaveLand = async () => {
      const code = newLand.value.code.trim().toUpperCase();
      const name = newLand.value.name.trim();
      const area = newLand.value.area.trim();
      const status = newLand.value.status;
      const capacity = Number(newLand.value.capacity) || 50;

      if (!code || !name || !area || !status || isNaN(capacity) || capacity <= 0) {
        error.value = 'Semua field harus diisi dengan benar.';
        return;
      }

      // Check uniqueness locally if creating
      if (!isEditing.value) {
        const exists = landsList.value.some(l => l.code.toUpperCase() === code);
        if (exists) {
          error.value = `Kode lahan "${code}" sudah terdaftar.`;
          return;
        }
      }

      error.value = '';
      alertError.value = '';
      successMessage.value = '';
      isLoading.value = true;

      try {
        const payload = {
          kode_lahan: code,
          nama_lahan: `${name} [Kapasitas: ${capacity}]`,
          luas: parseFloat(area) || 1.0,
          status: status
        };

        if (isEditing.value && editingLandId.value !== null) {
          await lahanApi.update(editingLandId.value, payload);
          successMessage.value = `Lahan ${code} berhasil diperbarui!`;
        } else {
          await lahanApi.create(payload);
          successMessage.value = `Lahan ${code} berhasil ditambahkan!`;
        }

        // Refresh list
        await Promise.all([
          fetchLandsList(),
          fetchCropsList()
        ]);
        
        isModalOpen.value = false;
        
        // Reset form
        newLand.value = {
          code: '',
          name: '',
          area: '',
          status: 'Subur',
          capacity: 50
        };
      } catch (err: any) {
        console.error('Failed to save land:', err);
        error.value = err.response?.data?.message || 'Gagal menyimpan lahan ke server.';
      } finally {
        isLoading.value = false;
      }
    };

    const getCustomLandName = (code: string, name: string) => {
      const codeLower = code.toLowerCase();
      const nameLower = name.toLowerCase();
      if (nameLower.includes('alpukat')) return name;
      if (nameLower.includes('kelengkeng')) return name;
      if (codeLower === 'lh-001' || nameLower.includes('lh-001')) return 'Lahan Alpukat';
      if (codeLower === 'lh-002' || nameLower.includes('lh-002')) return 'Lahan Kelengkeng';
      return name;
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
          await Promise.all([
            fetchLandsList(),
            fetchCropsList()
          ]);
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
            <Typography variant="p" size="text-sm" color="secondary" className="m-0">Tambahkan, ubah, atau hapus lahan perkebunan untuk operasional lapangan.</Typography>
          </div>
          <button 
            type="button" 
            class="peternakan-primary-btn m-0" 
            onClick={openAdd}
            disabled={isLoading.value}
            style={{ 
              backgroundColor: '#30360E', 
              color: '#ffffff', 
              borderColor: '#30360E', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '0.85rem 2rem',
              fontSize: '1rem',
              fontWeight: '800',
              borderRadius: '12px',
              height: '46px',
              boxShadow: '0 8px 18px rgba(48, 54, 14, 0.2)'
            }}
          >
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', lineHeight: '1' }}>+</span>
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

        {/* Global Alerts Error */}
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

        {/* Dynamic Land Capacity Cards (Requirement a) */}
        <div class="row g-3 mb-4 land-management-cards">
          {landsList.value.map(l => {
            const count = cropsList.value.filter(c => c.land === l.code).length;
            const cap = l.capacity || 50;
            const availability = cap - count;
            const pct = cap > 0 ? Math.round((count / cap) * 100) : 0;
            return (
              <div class="col-12 col-md-6 col-lg-4" key={l.code}>
                <StatCard 
                  label={getCustomLandName(l.code, l.name).toUpperCase()} 
                  value={`${count} / ${cap} Pohon`} 
                  sub={`Ketersediaan: ${availability} Pohon`}
                  color={pct >= 90 ? 'accent' : 'primary'}
                  icon={() => (
                    <img 
                      src={getCustomLandName(l.code, l.name).toLowerCase().includes('kelengkeng') ? '/icon/kelengkeng.png' : '/icon/alpukat.png'} 
                      alt="Crop" 
                      style="width: 48px; height: 48px; object-fit: contain;" 
                    />
                  )}
                />
              </div>
            );
          })}
          {landsList.value.length === 0 && (
            <div class="col-12">
              <div class="text-center py-4 text-muted bg-white border rounded-5 shadow-sm">
                Belum ada data lahan untuk ditampilkan.
              </div>
            </div>
          )}
        </div>

        {/* Table View (Desktop - Requirement b & c) */}
        <div class="view-card d-none d-md-block">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Kode Lahan</th>
                <th>Nama Lahan Perkebunan</th>
                <th>Luas Area</th>
                <th>Status Lahan</th>
                <th>Ketersediaan</th>
                <th>Kapasitas</th>
                <th style={{ width: '120px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {landsList.value.map(l => {
                const count = cropsList.value.filter(c => c.land === l.code).length;
                const cap = l.capacity || 50;
                const availability = cap - count;
                return (
                  <tr key={l.code}>
                    <td><code>{l.code}</code></td>
                    <td class="fw-bold">{getCustomLandName(l.code, l.name)}</td>
                    <td>{l.area}</td>
                    <td>
                      <Badge variant={l.status === 'Subur' ? 'success' : 'warning'}>{l.status}</Badge>
                    </td>
                    <td>
                      <Badge variant={availability <= 5 ? 'danger' : 'success'}>
                        {availability} Pohon
                      </Badge>
                    </td>
                    <td>
                      <Badge variant="secondary">{cap} Pohon</Badge>
                    </td>
                    <td>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-outline-primary rounded-3" 
                        onClick={() => openEdit(l)}
                        disabled={isLoading.value}
                      >
                        Ubah
                      </button>
                    </td>
                  </tr>
                );
              })}
              {landsList.value.length === 0 && (
                <tr>
                  <td colspan="7" class="text-center py-4 text-muted">
                    Tidak ada data lahan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* List View (Mobile - Requirement b & c) */}
        <div class="mobile-only d-md-none">
          <div class="mobile-card-list">
            {landsList.value.map(l => {
              const count = cropsList.value.filter(c => c.land === l.code).length;
              const cap = l.capacity || 50;
              const availability = cap - count;
              return (
                <div key={l.code} class="admin-mobile-card">
                  <div class="card-top">
                    <div class="card-info">
                      <span class="card-name">{getCustomLandName(l.code, l.name)}</span>
                      <span class="card-sub">{l.area}</span>
                    </div>
                    <span class="card-code">{l.code}</span>
                  </div>
                  <div class="card-footer align-items-start">
                    <div class="d-flex flex-column text-start gap-1">
                      <span class="small text-muted">Ketersediaan: <strong class={availability <= 5 ? 'text-danger' : 'text-success'}>{availability} Pohon</strong></span>
                      <span class="small text-muted">Kapasitas: <strong>{cap} Pohon</strong></span>
                    </div>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-primary px-3 py-1 rounded-3 text-white border-0 fw-bold" 
                      onClick={() => openEdit(l)}
                      disabled={isLoading.value}
                    >
                      Ubah
                    </button>
                  </div>
                </div>
              );
            })}
            {landsList.value.length === 0 && (
              <div class="text-center py-4 text-muted">
                Tidak ada data lahan ditemukan.
              </div>
            )}
          </div>
        </div>

        {/* Create / Edit Land Modal */}
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
                <div class="peternakan-modal-title">
                  {isEditing.value ? 'Ubah Lahan' : 'Tambah Lahan Baru'}
                </div>
              </div>

              <div class="peternakan-modal-body mt-4">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="pencatatan-label">Kode Lahan (Contoh: L0003)</label>
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
                  <div class="col-md-6">
                    <label class="pencatatan-label">Luas Area Lahan (Luas Hektar, misal: 2.5)</label>
                    <CustomInput 
                      modelValue={newLand.value.area}
                      placeholder="Contoh: 2.5"
                      onUpdate:modelValue={(val: string) => newLand.value.area = val}
                    />
                  </div>
                  <div class="col-md-6">
                    <label class="pencatatan-label">Kapasitas Maksimal (Pohon)</label>
                    <CustomInput 
                      type="number"
                      modelValue={String(newLand.value.capacity)}
                      placeholder="Contoh: 100"
                      onUpdate:modelValue={(val: string) => newLand.value.capacity = Number(val)}
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
                  {isEditing.value && (
                    <button 
                      type="button" 
                      class="btn btn-outline-danger py-2.5 rounded-pill px-4 fw-bold"
                      onClick={async () => {
                        await handleDeleteLand(editingLandId.value ?? undefined, newLand.value.code);
                        isModalOpen.value = false;
                      }}
                      disabled={isLoading.value}
                    >
                      Hapus
                    </button>
                  )}
                  <button class="btn btn-light grow fw-bold py-2.5 rounded-pill" onClick={() => isModalOpen.value = false} disabled={isLoading.value}>Batal</button>
                  <button class="peternakan-primary-btn grow m-0 justify-content-center" onClick={handleSaveLand} disabled={isLoading.value} style={{ backgroundColor: '#30360E' }}>
                    {isLoading.value ? 'Menyimpan...' : isEditing.value ? 'Simpan Perubahan' : 'Simpan Lahan'}
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
