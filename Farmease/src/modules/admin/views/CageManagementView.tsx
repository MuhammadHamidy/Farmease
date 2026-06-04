import { defineComponent, ref, computed, onMounted } from 'vue';
import { cagesList, fetchCagesList, type CageInfo } from '@/store/navigation';
import { sheep, fetchSheep } from '@/store/livestock';
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
    const isEditing = ref(false);
    const editingCageId = ref<number | null>(null);
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
        await Promise.all([
          fetchCagesList(),
          fetchSheep()
        ]);
      } catch (err: any) {
        alertError.value = 'Gagal mengambil data kandang dari server.';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(loadCages);

    const openAdd = () => {
      isEditing.value = false;
      editingCageId.value = null;
      newCage.value = {
        code: '',
        name: '',
        type: 'Domba Garut & Merino',
        capacity: 50
      };
      error.value = '';
      isModalOpen.value = true;
    };

    const openEdit = (cage: CageInfo) => {
      isEditing.value = true;
      editingCageId.value = cage.id || null;
      newCage.value = {
        code: cage.code,
        name: cage.name,
        type: cage.type,
        capacity: cage.capacity
      };
      error.value = '';
      isModalOpen.value = true;
    };

    const handleSaveCage = async () => {
      const code = newCage.value.code.trim().toUpperCase();
      const name = newCage.value.name.trim();
      const type = newCage.value.type.trim();
      const capacity = Number(newCage.value.capacity);

      if (!code || !name || !type || isNaN(capacity) || capacity <= 0) {
        error.value = 'Semua field harus diisi dengan benar.';
        return;
      }

      // Check uniqueness locally first if creating
      if (!isEditing.value) {
        const exists = cagesList.value.some(c => c.code.toUpperCase() === code);
        if (exists) {
          error.value = `Kode kandang "${code}" sudah terdaftar.`;
          return;
        }
      }

      error.value = '';
      alertError.value = '';
      successMessage.value = '';
      isLoading.value = true;

      try {
        const currentUser = authApi.getCurrentUser();
        const farmId = currentUser?.farm_id || '550e8400-e29b-41d4-a716-446655440001';

        const payload = {
          cage_code: code,
          cage_name: name,
          capacity: capacity,
          cage_type: type,
          id_farm: farmId as any
        };

        if (isEditing.value && editingCageId.value !== null) {
          await cagesApi.update(editingCageId.value, payload);
          successMessage.value = `Kandang ${code} berhasil diperbarui!`;
        } else {
          await cagesApi.create(payload);
          successMessage.value = `Kandang ${code} berhasil ditambahkan!`;
        }

        // Refresh list
        await Promise.all([
          fetchCagesList(),
          fetchSheep()
        ]);
        
        isModalOpen.value = false;
        
        // Reset form
        newCage.value = {
          code: '',
          name: '',
          type: 'Domba Garut & Merino',
          capacity: 50
        };
      } catch (err: any) {
        console.error('Failed to save cage:', err);
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
          await Promise.all([
            fetchCagesList(),
            fetchSheep()
          ]);
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
            onClick={openAdd}
            disabled={isLoading.value}
            style={{ 
              backgroundColor: '#30360E', 
              color: '#ffffff', 
              borderColor: '#30360E', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', lineHeight: '1' }}>+</span>
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

        {/* Dynamic Cage Cards (Requirement a) */}
        <div class="row g-3 mb-4">
          {cagesList.value.map(c => {
            const count = sheep.value.filter(s => s.cage_code === c.code).length;
            const availability = c.capacity - count;
            const pct = c.capacity > 0 ? Math.round((count / c.capacity) * 100) : 0;
            return (
              <div class="col-12 col-md-6 col-lg-4" key={c.code}>
                <StatCard 
                  label={`KANDANG ${c.code} - ${c.name}`} 
                  value={`${count} / ${c.capacity} Ekor`} 
                  sub={`Ketersediaan: ${availability} Ekor (${pct}% Terisi)`}
                  color={pct >= 90 ? 'accent' : 'primary'}
                  icon={() => (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  )}
                />
              </div>
            );
          })}
          {cagesList.value.length === 0 && (
            <div class="col-12">
              <div class="text-center py-4 text-muted bg-white border rounded-5 shadow-sm">
                Belum ada data kandang untuk ditampilkan.
              </div>
            </div>
          )}
        </div>

        {/* Table View (Desktop - Requirement b & c) */}
        <div class="view-card d-none d-md-block">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Kode Kandang</th>
                <th>Nama Area / Kandang</th>
                <th>Fokus Jenis Ternak</th>
                <th>Ketersediaan</th>
                <th>Kapasitas</th>
                <th style={{ width: '120px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cagesList.value.map(c => {
                const count = sheep.value.filter(s => s.cage_code === c.code).length;
                const availability = c.capacity - count;
                return (
                  <tr key={c.code}>
                    <td><code>{c.code}</code></td>
                    <td class="fw-bold">{c.name}</td>
                    <td>{c.type}</td>
                    <td>
                      <Badge variant={availability <= 5 ? 'danger' : 'success'}>
                        {availability} Ekor
                      </Badge>
                    </td>
                    <td>
                      <Badge variant="secondary">{c.capacity} Ekor</Badge>
                    </td>
                    <td>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-outline-primary rounded-3" 
                        onClick={() => openEdit(c)}
                        disabled={isLoading.value}
                      >
                        Ubah
                      </button>
                    </td>
                  </tr>
                );
              })}
              {cagesList.value.length === 0 && (
                <tr>
                  <td colspan="6" class="text-center py-4 text-muted">
                    Tidak ada data kandang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* List View (Mobile - Requirement b & c) */}
        <div class="mobile-only d-md-none">
          <div class="mobile-card-list">
            {cagesList.value.map(c => {
              const count = sheep.value.filter(s => s.cage_code === c.code).length;
              const availability = c.capacity - count;
              return (
                <div key={c.code} class="admin-mobile-card">
                  <div class="card-top">
                    <div class="card-info">
                      <span class="card-name">{c.name}</span>
                      <span class="card-sub">{c.type}</span>
                    </div>
                    <span class="card-code">{c.code}</span>
                  </div>
                  <div class="card-footer align-items-start">
                    <div class="d-flex flex-column text-start gap-1">
                      <span class="small text-muted">Ketersediaan: <strong class={availability <= 5 ? 'text-danger' : 'text-success'}>{availability} Ekor</strong></span>
                      <span class="small text-muted">Kapasitas: <strong>{c.capacity} Ekor</strong></span>
                    </div>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-primary px-3 py-1 rounded-3 text-white border-0 fw-bold" 
                      onClick={() => openEdit(c)}
                      disabled={isLoading.value}
                    >
                      Ubah
                    </button>
                  </div>
                </div>
              );
            })}
            {cagesList.value.length === 0 && (
              <div class="text-center py-4 text-muted">
                Tidak ada data kandang ditemukan.
              </div>
            )}
          </div>
        </div>

        {/* Create / Edit Cage Modal */}
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
                  {isEditing.value ? 'Ubah Kandang' : 'Tambah Kandang Baru'}
                </div>
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
                  {isEditing.value && (
                    <button 
                      type="button" 
                      class="btn btn-outline-danger py-2.5 rounded-pill px-4 fw-bold"
                      onClick={async () => {
                        await handleDeleteCage(editingCageId.value ?? undefined, newCage.value.code);
                        isModalOpen.value = false;
                      }}
                      disabled={isLoading.value}
                    >
                      Hapus
                    </button>
                  )}
                  <button class="btn btn-light grow fw-bold py-2.5 rounded-pill" onClick={() => isModalOpen.value = false} disabled={isLoading.value}>Batal</button>
                  <button class="peternakan-primary-btn grow m-0 justify-content-center" onClick={handleSaveCage} disabled={isLoading.value}>
                    {isLoading.value ? 'Menyimpan...' : isEditing.value ? 'Simpan Perubahan' : 'Simpan Kandang'}
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
