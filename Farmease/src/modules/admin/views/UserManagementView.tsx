import { defineComponent, ref, reactive, computed } from 'vue';
import Typography from '@/shared/ui/admin/Typography';
import Button from '@/shared/ui/admin/Button';
import Select from '@/shared/ui/admin/Select';
import CustomInput from '@/shared/ui/admin/Input';

export default defineComponent({
  name: 'UserManagementView',
  setup() {
    const users = ref([
      { id: 1, code: 'ADM001', name: 'Admin Utama', role: 'Admin' },
      { id: 2, code: 'OPT001', name: 'Budi Ternak', role: 'Operator Peternakan' },
      { id: 3, code: 'OPK001', name: 'Siti Kebun', role: 'Operator Perkebunan' },
    ]);

    const isModalOpen = ref(false);
    const isEditing = ref(false);
    const currentUser = reactive({
      id: 0,
      code: '',
      name: '',
      role: 'Operator Peternakan'
    });

    const adminCode = ref('');
    const adminCodeError = ref('');

    // Filtering State
    const searchQuery = ref('');
    const roleFilter = ref('Semua Peran');

    const roles = [
      { value: 'Admin', label: 'Admin' },
      { value: 'Operator Peternakan', label: 'Operator Peternakan' },
      { value: 'Operator Perkebunan', label: 'Operator Perkebunan' }
    ];

    const filterOptions = ['Semua Peran', ...roles.map(r => r.label)];

    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                             user.code.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesRole = roleFilter.value === 'Semua Peran' || user.role === roleFilter.value;
        return matchesSearch && matchesRole;
      });
    });

    const openAddModal = () => {
      isEditing.value = false;
      currentUser.id = Date.now();
      currentUser.code = '';
      currentUser.name = '';
      currentUser.role = 'Operator Peternakan';
      adminCode.value = '';
      adminCodeError.value = '';
      isModalOpen.value = true;
    };

    const openEditModal = (user: any) => {
      isEditing.value = true;
      currentUser.id = user.id;
      currentUser.code = user.code;
      currentUser.name = user.name;
      currentUser.role = user.role;
      adminCode.value = '';
      adminCodeError.value = '';
      isModalOpen.value = true;
    };

    const saveUser = () => {
      if (adminCode.value !== 'ADM01' && adminCode.value !== 'ADMIN123') {
        adminCodeError.value = 'Kode Admin tidak valid!';
        return;
      }
      if (isEditing.value) {
        const index = users.value.findIndex(u => u.id === currentUser.id);
        if (index !== -1) users.value[index] = { ...currentUser };
      } else {
        users.value.push({ ...currentUser });
      }
      isModalOpen.value = false;
    };

    const deleteUser = (id: number) => {
      const confirmCode = prompt('Konfirmasi Penghapusan: Masukkan Kode Admin');
      if (confirmCode === 'ADM01' || confirmCode === 'ADMIN123') {
        users.value = users.value.filter(u => u.id !== id);
      } else if (confirmCode !== null) {
        alert('Kode Admin salah!');
      }
    };

    return () => (
      <>
        <div class="user-management animate-fade-in-up">
          <div class="view-header">
             <Typography variant="h2" class="view-title">Manajemen Pengguna</Typography>
             <Button variant="solid" onClick={openAddModal} class="ms-auto shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="me-2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tambah Pengguna
             </Button>
          </div>
          
          {/* ── Filter Bar ───────────────────────────────── */}
          <div class="admin-filter-bar">
            <div class="admin-search-wrapper">
              <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                class="admin-search-input" 
                placeholder="Cari Nama atau ID Pengguna..." 
                value={searchQuery.value}
                onInput={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
              />
            </div>
            <div class="admin-role-filter">
              <Select 
                options={filterOptions}
                modelValue={roleFilter.value}
                onUpdate:modelValue={(val: string) => roleFilter.value = val}
              />
            </div>
          </div>

          {/* ── Profile Card Grid Layout ───────────────────── */}
          {filteredUsers.value.length > 0 ? (
            <div class="admin-user-grid">
              {filteredUsers.value.map((user) => (
                <div key={user.id} class="admin-user-card">
                  <div class="card-header">
                    <div class="user-avatar-box">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span class={['user-role-tag', user.role.replace(/\s+/g, '-').toLowerCase()]}>
                      {user.role}
                    </span>
                  </div>

                  <div class="user-info">
                    <span class="user-name">{user.name}</span>
                    <span class="user-code-badge">{user.code}</span>
                  </div>

                  <div class="card-actions-row">
                    <button type="button" class="card-action-btn edit" onClick={() => openEditModal(user)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button type="button" class="card-action-btn delete" onClick={() => deleteUser(user.id)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div class="admin-empty-state">
              <Typography variant="span" color="secondary">Tidak ada pengguna yang sesuai dengan filter.</Typography>
            </div>
          )}
        </div>

        {/* ── Add/Edit User Modal (Strict Peternakan Style) ────── */}
        {isModalOpen.value && (
          <div class="peternakan-modal-overlay" onClick={() => isModalOpen.value = false}>
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div class="peternakan-modal-header">
                <button class="peternakan-modal-close" onClick={() => isModalOpen.value = false}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <div class="peternakan-modal-title">
                  {isEditing.value ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                </div>
              </div>

              <div class="peternakan-modal-body">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="pencatatan-label">Nama Lengkap</label>
                    <CustomInput 
                      modelValue={currentUser.name} 
                      placeholder="Masukkan nama lengkap" 
                      onUpdate:modelValue={(val: string) => currentUser.name = val} 
                    />
                  </div>
                  
                  <div class="col-12">
                    <label class="pencatatan-label">Kode / ID Pengguna</label>
                    <CustomInput 
                      modelValue={currentUser.code} 
                      placeholder="Contoh: OPT001" 
                      onUpdate:modelValue={(val: string) => currentUser.code = val} 
                    />
                  </div>

                  <div class="col-12">
                    <label class="pencatatan-label">Hak Akses (Role)</label>
                    <Select 
                      options={roles.map(r => r.label)}
                      modelValue={currentUser.role}
                      onUpdate:modelValue={(val: string) => currentUser.role = val}
                    />
                  </div>

                  <div class="col-12 pt-3">
                    <div class="admin-verification-box">
                      <label class="pencatatan-label text-primary">Konfirmasi Kode Admin</label>
                      <CustomInput 
                        modelValue={adminCode.value} 
                        placeholder="Masukkan kode ADM01" 
                        onUpdate:modelValue={(val: string) => { adminCode.value = val; adminCodeError.value = ''; }} 
                      />
                      {adminCodeError.value && <small class="text-danger fw-bold d-block mt-1">{adminCodeError.value}</small>}
                    </div>
                  </div>
                </div>

                {/* ── Action Buttons ────────────────────────── */}
                <div class="d-flex gap-3 mt-4 pt-2 border-top border-light">
                  <Button variant="outline" class="grow" onClick={() => isModalOpen.value = false}>Batal</Button>
                  <Button variant="solid" class="grow" onClick={saveUser}>{isEditing.value ? 'Simpan' : 'Tambah'}</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
});
