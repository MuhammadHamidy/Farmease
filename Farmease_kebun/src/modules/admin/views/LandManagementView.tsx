import { defineComponent, ref, computed, onMounted } from 'vue';
import { landsList, fetchLandsList, cropsList, fetchCropsList, type LandInfo } from '@/store/navigation';
import { lahanApi } from '@/shared/api';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import CustomInput from '@/shared/ui/Input';
import CustomSelect from '@/shared/ui/Select';
import StatCard from '@/shared/ui/StatCard';
import apiClient from '@/shared/api/client';
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css';

export default defineComponent({
  name: 'LandManagementView',
  setup() {
    const isModalOpen = ref(false);
    const isEditing = ref(false);
    const editingLandId = ref<string | number | null>(null);
    
    const newLand = ref<LandInfo>({
      code: '',
      name: '',
      area: '',
      status: 'Subur',
      capacity: 50,
      location: ''
    });
    const catatanText = ref('');
    
    const error = ref('');
    const alertError = ref('');
    const successMessage = ref('');
    const isLoading = ref(false);

    const selectedStatusFilter = ref('Semua Status');
    const selectedLandFilter = ref('Semua Lahan');

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
        capacity: 50,
        location: ''
      };
      catatanText.value = '';
      error.value = '';
      isModalOpen.value = true;
    };

    const openEdit = (land: any) => {
      isEditing.value = true;
      editingLandId.value = land.id || null;
      newLand.value = {
        code: land.land || land.code || '',
        name: land.name || '',
        area: String(land.area || '').replace(/\s*(Hektar|m²)/gi, '').trim(),
        status: land.status || 'Subur',
        capacity: land.capacity || 50,
        location: land.location || land.name || ''
      };
      catatanText.value = '';
      error.value = '';
      isModalOpen.value = true;
    };

    const handleSaveLand = async () => {
      let code = newLand.value.code.trim().toUpperCase();
      if (!isEditing.value) {
        let nextNum = landsList.value.length + 1;
        code = `L${String(nextNum).padStart(3, '0')}`;
        while (landsList.value.some(l => l.code.toUpperCase() === code)) {
          nextNum++;
          code = `L${String(nextNum).padStart(3, '0')}`;
        }
      }

      const name = newLand.value.name.trim();
      const area = newLand.value.area.trim();
      const status = newLand.value.status || 'Subur';
      const capacity = Number(newLand.value.capacity) || 50;
      const location = newLand.value.location?.trim() || '';

      if (!code || !name || !area || !location || isNaN(capacity) || capacity <= 0) {
        error.value = 'Semua field harus diisi dengan benar.';
        return;
      }

      // Check uniqueness locally
      const exists = landsList.value.some(l => l.code.toUpperCase() === code && (!isEditing.value || String(l.id) !== String(editingLandId.value)));
      if (exists) {
        error.value = `Kode lahan "${code}" sudah terdaftar.`;
        return;
      }

      error.value = '';
      alertError.value = '';
      successMessage.value = '';
      isLoading.value = true;

      try {
        const payload = {
          kode_lahan: code,
          nama_lahan: name,
          jenis_tanaman: location,
          luas_lahan: parseFloat(area) || 1.0,
          kapasitas_maksimal: capacity,
          status: status
        };

        if (isEditing.value && editingLandId.value !== null) {
          await lahanApi.update(editingLandId.value, payload);
          successMessage.value = `Lahan ${code} berhasil diperbarui!`;
        } else {
          await lahanApi.create(payload);
          successMessage.value = `Lahan ${code} berhasil ditambahkan!`;
        }

        await Promise.all([
          fetchLandsList(),
          fetchCropsList()
        ]);
        
        isModalOpen.value = false;
      } catch (err: any) {
        console.error('Failed to save land:', err);
        error.value = err.response?.data?.message || 'Gagal menyimpan lahan ke server.';
      } finally {
        isLoading.value = false;
      }
    };

    const handleDeleteLand = async (id: string | number | undefined, code: string) => {
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

    // Group crops by land and variety for the table rows
    const tableData = computed(() => {
      const groups: Record<string, { id?: string | number, land: string; code: string; name: string; count: number; capacity: number }> = {};
      
      for (const crop of cropsList.value) {
        const landObj = landsList.value.find(l => l.code === crop.land);
        const cap = landObj?.capacity || 50;
        const key = `${crop.land}_#_${crop.name}`;
        if (!groups[key]) {
          groups[key] = {
            id: crop.id,
            land: crop.land,
            code: crop.code,
            name: crop.name,
            count: 0,
            capacity: cap
          };
        }
        groups[key].count++;
      }

      let arr = Object.values(groups);

      // Filter by land select
      if (selectedLandFilter.value !== 'Semua Lahan') {
        arr = arr.filter(item => item.land === selectedLandFilter.value);
      }

      return arr;
    });

    const handleExport = async () => {
      try {
        const [rawLands, rawTrees, rawPengobatan, rawPemupukan, rawPenyiraman, rawPanen, rawPemangkasan] = await Promise.all([
          apiClient.get<any[]>('/api/v1/lahan').catch(() => []),
          apiClient.get<any[]>('/api/v1/pohon').catch(() => []),
          apiClient.get<any[]>('/api/v1/pengobatan').catch(() => []),
          apiClient.get<any[]>('/api/v1/pemupukan').catch(() => []),
          apiClient.get<any[]>('/api/v1/penyiraman').catch(() => []),
          apiClient.get<any[]>('/api/v1/panen').catch(() => []),
          apiClient.get<any[]>('/api/v1/pemangkasan').catch(() => [])
        ])

        const lands = Array.isArray(rawLands) ? rawLands : []
        const trees = Array.isArray(rawTrees) ? rawTrees : []
        const pengobatanList = Array.isArray(rawPengobatan) ? rawPengobatan : []
        const pemupukanList = Array.isArray(rawPemupukan) ? rawPemupukan : []
        const penyiramanList = Array.isArray(rawPenyiraman) ? rawPenyiraman : []
        const panenList = Array.isArray(rawPanen) ? rawPanen : []
        const pemangkasanList = Array.isArray(rawPemangkasan) ? rawPemangkasan : []

        const perawatanList = [
          ...pengobatanList.map(o => ({
            ...o,
            id_perawatan: o.id_pengobatan,
            jenis_bahan: 'obat',
            id_lahan: o.Lahan_id_lahan
          })),
          ...pemupukanList.map(f => ({
            ...f,
            id_perawatan: f.id_pemupukan,
            jenis_bahan: 'pupuk',
            id_lahan: f.Lahan_id_lahan,
            nama_obat: f.nama_pupuk,
            deskripsi: f.deskripsi
          })),
          ...penyiramanList.map(w => ({
            ...w,
            id_perawatan: w.id_penyiraman,
            jenis_bahan: 'air',
            id_lahan: w.Lahan_id_lahan,
            teknik_perawatan: w.teknik_penyiraman,
            deskripsi: w.deskripsi
          }))
        ]

        const csvRows: string[][] = []

        // CSV Header
        csvRows.push([
          'Kategori Data',
          'Tanggal',
          'Kode Lahan',
          'Nama Lahan',
          'Kode/Detail Pohon',
          'Nama Item / Aktivitas',
          'Jumlah / Dosis',
          'Satuan',
          'Deskripsi / Catatan'
        ])

        lands.forEach((landObj: any) => {
          const landId = landObj.id_lahan || landObj.id

          // Add Land Info
          csvRows.push([
            'Lahan',
            landObj.tanggal_tanam || '-',
            landObj.kode_lahan || '-',
            landObj.nama_lahan || '-',
            '-',
            landObj.varietas || 'Tanaman',
            String(landObj.luas_lahan || landObj.luas || 0),
            'Hektar',
            `Fase Tanam: ${landObj.fase_tanam || '-'}`
          ])

          const landTrees = trees.filter((t: any) => 
            String(t.Lahan_id_lahan || t.id_lahan) === String(landId) ||
            String(t.lahan_code) === String(landObj.kode_lahan)
          )
          const landPerawatan = perawatanList.filter((p: any) => String(p.Lahan_id_lahan || p.id_lahan) === String(landId))
          const landPanen = panenList.filter((p: any) => String(p.Lahan_id_lahan || p.id_lahan) === String(landId))
          const landPemangkasan = pemangkasanList.filter((p: any) => String(p.Lahan_id_lahan || p.id_lahan) === String(landId))

          // Add Trees
          landTrees.forEach((t: any) => {
            let age = t.umur
            if (!age && t.tanggal_tanam) {
              const plantedYear = new Date(t.tanggal_tanam).getFullYear()
              const currentYear = new Date().getFullYear()
              age = Math.max(1, currentYear - plantedYear)
            }

            csvRows.push([
              'Pohon',
              t.tanggal_tanam ? t.tanggal_tanam.split('T')[0] : (t.created_at ? t.created_at.split('T')[0] : '-'),
              landObj.kode_lahan || '-',
              landObj.nama_lahan || '-',
              t.kode_pohon || '-',
              t.varietas || t.nama_pohon || t.jenis || '-',
              String(age || 0),
              'Tahun',
              `Status: ${t.fase_pohon || t.status || '-'}`
            ])
          })

          // Add Pemupukan & Pemberian Obat
          landPerawatan.forEach((p: any) => {
            const jenisBahan = (p.jenis_bahan || '').toLowerCase()
            let kategori = 'Perawatan'
            if (jenisBahan === 'pupuk') {
              kategori = 'Pemupukan'
            } else if (jenisBahan === 'obat') {
              kategori = 'Pemberian Obat'
            }

            csvRows.push([
              kategori,
              p.tanggal_aktivitas || '-',
              landObj.kode_lahan || '-',
              landObj.nama_lahan || '-',
              p.detail_pohon || '-',
              p.nama_obat || p.jenis_perawatan || '-',
              String(p.dosis || 0),
              p.satuan || '-',
              `Teknik: ${p.teknik_perawatan || '-'}, Bagian: ${p.bagian_pohon || '-'}, Catatan: ${p.deskripsi || '-'}`
            ])
          })

          // Add Panen
          landPanen.forEach((pa: any) => {
            csvRows.push([
              'Panen',
              pa.tanggal_aktivitas || '-',
              landObj.kode_lahan || '-',
              landObj.nama_lahan || '-',
              '-',
              pa.nama_rincian_aktivitas || 'Panen Buah',
              String(pa.jumlah || 0),
              pa.satuan || 'kg',
              'Selesai'
            ])
          })

          // Add Pemangkasan
          landPemangkasan.forEach((pe: any) => {
            csvRows.push([
              'Pemangkasan',
              pe.tanggal_aktivitas || '-',
              landObj.kode_lahan || '-',
              landObj.nama_lahan || '-',
              '-',
              'Pemangkasan Pemeliharaan',
              String(pe.jumlah || 0),
              pe.satuan || 'kg',
              pe.keterangan || '-'
            ])
          })
        })

        const csvContent = csvRows
          .map((row) =>
            row
              .map((val) => {
                const escaped = String(val).replace(/"/g, '""')
                return `"${escaped}"`
              })
              .join(',')
          )
          .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        
        const dateStr = new Date().toISOString().split('T')[0]
        const filename = `Ekspor_Data_Lahan_${dateStr}.csv`
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err: any) {
        console.error('Gagal mengekspor data:', err)
        alert('Gagal mengekspor data: ' + (err?.message || err || 'Terjadi kesalahan.'))
      }
    }

    return () => (
      <div class="animate-fade-in-up" style={{ padding: '0 0.5rem' }}>
        {/* Header Section */}
        <div class="view-header mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <Typography variant="h2" size="text-2xl" weight="extrabold" className="m-0 text-dark" style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.75rem', fontWeight: '800' }}>
              Manajemen Lahan
            </Typography>
            <Typography variant="p" size="text-sm" color="secondary" className="m-0" style={{ fontSize: '0.875rem', color: '#6C757D', marginTop: '4px', display: 'block' }}>
              Farmease dapat tambah, ubah, atau hapus lahan perkebunan
            </Typography>
          </div>
          <button 
            type="button" 
            class="btn" 
            onClick={openAdd}
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
              boxShadow: '0 4px 10px rgba(48, 54, 14, 0.15)',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '1.3rem', fontWeight: 'bold', lineHeight: '1' }}>+</span>
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
            <button type="button" class="btn-close" onClick={() => successMessage.value = ''} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#1E4620', cursor: 'pointer' }}>×</button>
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
            <button type="button" class="btn-close" onClick={() => alertError.value = ''} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#8B1E1E', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Ekspor Data Kebun (Full-width Section) */}
        <div style={{ background: '#FFF', border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
          <strong style={{ fontSize: '0.9rem', color: '#111827', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>Ekspor Data Kebun</strong>
          <button
            type="button"
            class="pencatatan-mode-btn is-active"
            onClick={handleExport}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download CSV
          </button>
        </div>

        {/* Dynamic Land Capacity Cards */}
        <div class="row g-3 mb-4">
          {landsList.value.map(l => {
            const count = cropsList.value.filter(c => c.land === l.code).length;
            const cap = l.capacity || 50;
            const availability = cap - count;
            const isKelengkeng = (l.location || '').toLowerCase().includes('kelengkeng');
            return (
              <div class="col-12 col-md-6" key={l.code}>
                <div class="bg-white rounded-4 p-4 d-flex justify-content-between align-items-center" style={{ border: '1.5px solid #E6D9CE' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: '#374151', marginBottom: '0.45rem' }}>
                      LAHAN {l.code}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#000000', marginBottom: '0.45rem', fontFamily: "'Inter', sans-serif" }}>
                      {count > 0 ? count : (isKelengkeng ? 20 : 10)} / {cap} Pohon {isKelengkeng ? 'Kelengkeng' : 'Alpukat'}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#6B7280' }}>
                      Ketersediaan: {availability > 0 && count > 0 ? availability : (isKelengkeng ? 30 : 40)} Pohon
                    </div>
                  </div>
                  <div>
                    <img 
                      src={isKelengkeng ? '/icon/kelengkeng.png' : '/icon/alpukat.png'} 
                      alt="Crop Icon" 
                      style="width: 48px; height: 48px; object-fit: contain;" 
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {landsList.value.length === 0 && (
            <div class="col-12 text-center py-4">
              <Typography variant="p" size="text-sm" color="secondary" style={{ fontSize: '0.9rem', color: '#6C757D', fontWeight: '600' }}>
                Tidak ada data lahan
              </Typography>
            </div>
          )}
        </div>

        {/* Filters Card */}
        <div class="mb-4 rounded-4 p-4" style={{ backgroundColor: '#F4F1EA', border: '1px solid #E6D9CE' }}>
          <div class="row g-3 w-100 m-0">
            <div class="col-12 col-md-6">
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2C3E50', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase' }}>Semua Status</label>
              <select 
                class="form-select bg-white" 
                value={selectedStatusFilter.value}
                onChange={(e: any) => selectedStatusFilter.value = e.target.value}
                style={{ height: '42px', border: '1px solid #E6D9CE', borderRadius: '8px', fontWeight: '600', color: '#374151' }}
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Subur">Semua Status</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2C3E50', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase' }}>Semua Lahan</label>
              <select 
                class="form-select bg-white" 
                value={selectedLandFilter.value}
                onChange={(e: any) => selectedLandFilter.value = e.target.value}
                style={{ height: '42px', border: '1px solid #E6D9CE', borderRadius: '8px', fontWeight: '600', color: '#374151' }}
              >
                <option value="Semua Lahan">Semua Lahan</option>
                {landsList.value.map(l => (
                  <option value={l.code} key={l.code}>{l.code}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table View (Desktop) */}
        <div class="view-card d-none d-md-block" style={{ padding: '0px', border: '1.5px solid #E6D9CE', borderRadius: '12px', overflow: 'hidden' }}>
          <table class="admin-table m-0">
            <thead style={{ backgroundColor: '#F9F8F6' }}>
              <tr>
                <th style={{ color: '#7F8C8D', fontSize: '0.78rem', fontWeight: '800', padding: '1rem' }}>KODE LAHAN</th>
                <th style={{ color: '#7F8C8D', fontSize: '0.78rem', fontWeight: '800', padding: '1rem' }}>KODE POHON</th>
                <th style={{ color: '#7F8C8D', fontSize: '0.78rem', fontWeight: '800', padding: '1rem' }}>JENIS VARIETAS</th>
                <th style={{ color: '#7F8C8D', fontSize: '0.78rem', fontWeight: '800', padding: '1rem' }}>KETERSEDIAAN</th>
                <th style={{ color: '#7F8C8D', fontSize: '0.78rem', fontWeight: '800', padding: '1rem' }}>KAPASITAS</th>
                <th style={{ color: '#7F8C8D', fontSize: '0.78rem', fontWeight: '800', padding: '1rem', width: '120px', textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {tableData.value.map((row, index) => (
                <tr key={index} style={{ borderBottom: index < tableData.value.length - 1 ? '1px solid #f1eff0' : 'none' }}>
                  <td style={{ padding: '1rem' }}><code>{row.land}</code></td>
                  <td style={{ padding: '1rem' }}><code>{row.code}</code></td>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#000000' }}>{row.name}</td>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#000000' }}>{row.count} Pohon</td>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#000000' }}>{row.capacity} Pohon</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-secondary" 
                      onClick={() => openEdit(row)}
                      style={{ 
                        border: '1.5px solid #d1d5db', 
                        borderRadius: '8px', 
                        fontWeight: '700', 
                        color: '#374151',
                        padding: '0.35rem 1rem',
                        fontSize: '0.85rem',
                        textTransform: 'uppercase'
                      }}
                    >
                      AKSI
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* List View (Mobile) */}
        <div class="mobile-only d-md-none">
          <div class="mobile-card-list">
            {tableData.value.map((row, index) => (
              <div key={index} class="admin-mobile-card" style={{ border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', backgroundColor: '#fff' }}>
                <div class="card-top d-flex justify-content-between mb-2">
                  <div>
                    <span class="fw-bold text-dark" style={{ fontSize: '1.05rem' }}>{row.name}</span>
                    <span class="text-muted small d-block">Lahan: {row.land}</span>
                  </div>
                  <span class="card-code text-uppercase font-monospace" style={{ fontSize: '0.9rem', color: '#606C38', fontWeight: '700' }}>{row.code}</span>
                </div>
                <hr style={{ margin: '0.75rem 0', borderColor: '#f3f4f6' }} />
                <div class="card-footer d-flex justify-content-between align-items-center">
                  <span class="fw-bold" style={{ fontSize: '0.88rem' }}>{row.count} / {row.capacity} Pohon</span>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-secondary" 
                    onClick={() => openEdit(row)}
                    style={{ border: '1.5px solid #d1d5db', borderRadius: '8px', fontWeight: '700', color: '#374151', padding: '0.35rem 1rem' }}
                  >
                    AKSI
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create / Edit Land Modal */}
        {isModalOpen.value && (
          <div class="peternakan-modal-overlay" onClick={() => isModalOpen.value = false}>
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', borderRadius: '16px' }}>
              <div class="peternakan-modal-header d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid #f1eff0', padding: '1.25rem 1.5rem', position: 'relative' }}>
                <div style={{ flex: 1 }} />
                <div class="peternakan-modal-title" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#000000', fontFamily: "'Inter', sans-serif", textAlign: 'center', flex: 8 }}>
                  {isEditing.value ? 'Ubah Lahan' : 'Tambah Lahan Baru'}
                </div>
                <button 
                  class="peternakan-modal-close border-0" 
                  onClick={() => isModalOpen.value = false} 
                  disabled={isLoading.value}
                  style={{ background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af', flex: 1, textAlign: 'right' }}
                >
                  &times;
                </button>
              </div>

              <div class="peternakan-modal-body" style={{ padding: '1.5rem' }}>
                <div class="row g-3">
                  {/* 1. NAMA LAHAN */}
                  <div class="col-12">
                    <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>NAMA LAHAN</label>
                    <input 
                      type="text"
                      class="form-control pencatatan-input"
                      value={newLand.value.name}
                      onInput={(e: any) => newLand.value.name = e.target.value}
                      placeholder="Contoh: Lahan Alpukat"
                      style={{ border: '1px solid #E6D9CE', borderRadius: '8px', height: '42px' }}
                    />
                  </div>

                  {/* 2. PILIH KODE LAHAN */}
                  <div class="col-12">
                    <label class="pencatatan-label" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Pilih Kode lahan</label>
                    <select
                      class="form-select pencatatan-input bg-white"
                      value={newLand.value.code}
                      onChange={(e: any) => newLand.value.code = e.target.value}
                      style={{ height: '42px', cursor: 'pointer', border: '1px solid #E6D9CE', borderRadius: '8px', fontWeight: '600', color: '#374151' }}
                    >
                      <option value="" disabled>Kode Lahan</option>
                      <option value="L001">L001</option>
                      <option value="L002">L002</option>
                      <option value="L003">L003</option>
                      <option value="L004">L004</option>
                      <option value="L005">L005</option>
                      <option value="L006">L006</option>
                      <option value="L007">L007</option>
                      <option value="L008">L008</option>
                      <option value="L009">L009</option>
                      <option value="L010">L010</option>
                    </select>
                  </div>

                  {/* 3. LUAS LAHAN m2 Helper */}
                  <div class="col-12">
                    <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>LUAS LAHAN</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        class="form-control pencatatan-input" 
                        value={newLand.value.area}
                        onInput={(e: any) => newLand.value.area = e.target.value}
                        placeholder="0"
                        style={{ paddingRight: '2.5rem', border: '1px solid #E6D9CE', borderRadius: '8px', height: '42px' }}
                      />
                      <span style={{ position: 'absolute', right: '1rem', fontWeight: '600', color: '#6B7280', fontSize: '0.9rem' }}>m²</span>
                    </div>
                  </div>

                  {/* 4. PILIH JENIS VARIETAS Select */}
                  <div class="col-12">
                    <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>PILIH JENIS VARIETAS</label>
                    <select
                      class="form-select pencatatan-input bg-white"
                      value={newLand.value.location}
                      onChange={(e: any) => newLand.value.location = e.target.value}
                      style={{ height: '42px', cursor: 'pointer', border: '1px solid #E6D9CE', borderRadius: '8px', fontWeight: '600', color: '#374151' }}
                    >
                      <option value="" disabled>Pilih Varietas</option>
                      <option value="Alpukat">Alpukat</option>
                      <option value="Kelengkeng">Kelengkeng</option>
                      <option value="Alpukat Miki">Alpukat Miki</option>
                      <option value="Alpukat Hass">Alpukat Hass</option>
                    </select>
                  </div>

                  {/* 5. KAPASITAS MAKSIMAL */}
                  <div class="col-12">
                    <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>KAPASITAS MAKSIMAL</label>
                    <input 
                      type="number" 
                      class="form-control pencatatan-input" 
                      value={String(newLand.value.capacity)}
                      onInput={(e: any) => newLand.value.capacity = Number(e.target.value)}
                      placeholder="0"
                      style={{ border: '1px solid #E6D9CE', borderRadius: '8px', height: '42px' }}
                    />
                  </div>

                  {/* 6. DESKRIPSI / CATATAN */}
                  <div class="col-12">
                    <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>DESKRIPSI / CATATAN</label>
                    <textarea 
                      class="form-control pencatatan-textarea" 
                      value={catatanText.value}
                      onInput={(e: any) => catatanText.value = e.target.value}
                      placeholder="Masukkan detail tambahan tentang lahan ini..."
                      rows={3}
                      style={{ border: '1px solid #E6D9CE', borderRadius: '8px', padding: '0.75rem', resize: 'none' }}
                    />
                  </div>
                </div>

                {error.value && (
                  <div class="alert alert-danger rounded-4 py-3 small mt-3 border-0" style={{ backgroundColor: '#FDECEC', color: '#8B1E1E' }}>
                    {error.value}
                  </div>
                )}

                {/* Footer Buttons Batal on Left and Simpan Lahan on Right */}
                <div class="mt-4 pt-3 d-flex gap-3">
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    onClick={() => isModalOpen.value = false}
                    style={{ 
                      borderRadius: '8px', 
                      fontWeight: '700', 
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
                    onClick={handleSaveLand}
                    disabled={isLoading.value}
                    style={{ 
                      borderRadius: '8px', 
                      fontWeight: '700', 
                      padding: '0.65rem 0', 
                      width: '55%', 
                      backgroundColor: '#303B1E', 
                      border: 'none' 
                    }}
                  >
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
