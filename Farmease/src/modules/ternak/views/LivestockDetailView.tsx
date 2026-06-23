import { defineComponent, computed, ref, watch, type PropType, Teleport } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { cagesList } from '@/store/navigation';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import BackButton from '@/shared/ui/BackButton';
import { pregnancyApi } from '@/shared/api';
import { 
  currentSheepDetail, currentSilsilah, currentHealthRecords, currentWeightRecords, currentMatingRecords,
  fetchSheepById, fetchSilsilah, fetchHealthForSheep, fetchWeightForSheep, fetchMatingForSheep, sheep, detailLoading,
  updateSheep
} from '@/store/livestock';
import EditLivestockModal from '../components/shared/EditLivestockModal';
import SheepWeightChart from '../components/shared/SheepWeightChart';
import CustomSelect from '@/shared/ui/admin/Select';

// ── Helpers ──────────────────────────────────────────────────────────────
// calcADG is now handled by the backend

const SilsilahNode = (props: { node: any; label: string; depth?: number }) => {
  const node = props.node;
  const label = props.label;
  const depth = props.depth ?? 0;
  if (!node) {
    return (
      <div
        style={{
          padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px dashed #ccc',
          fontSize: '0.72rem', color: 'var(--color-gray-400)', textAlign: 'center', minWidth: '120px',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '2px', color: 'var(--color-gray-300)' }}>{label}</div>
        Tidak Diketahui
      </div>
    );
  }
  return (
    <div
      style={{
        padding: '0.5rem 0.75rem', borderRadius: '8px',
        background: depth === 0 ? 'var(--color-primary-fixed)' : 'var(--color-surface)',
        border: '1px solid var(--color-outline-variant)', fontSize: '0.75rem', minWidth: '120px',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '2px', color: 'var(--color-primary)' }}>{label}</div>
      <div style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>
        {node.sheep_name || node.sheep_code || '—'}
      </div>
      <div style={{ fontSize: '0.65rem', color: 'var(--color-gray-800)' }}>{node.sheep_code} • {node.gender || '—'}</div>
    </div>
  );
};

export default defineComponent({
  name: 'TernakDetailView',
  props: {
    onGoToPencatatan: { type: Function as PropType<() => void>, default: null },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const showReminderSheet = ref(false);
    const showEditProfileModal = ref(false);
    const showPindahKandangModal = ref(false);
    const selectedNewCageId = ref('');
    const isPindahLoading = ref(false);

    const selectedTernakId = computed(() => route.params.id as string);

    const sheepFromList = computed(() =>
      sheep.value.find(s => String(s.id) === selectedTernakId.value) || null,
    );

    const handleBack = () => {
      currentSheepDetail.value = null;
      currentSilsilah.value = null;
      currentHealthRecords.value = [];
      currentWeightRecords.value = [];
      currentMatingRecords.value = [];
      router.back();
    };

    watch(
      () => selectedTernakId.value,
      async (id) => {
        if (!id) return;
        await Promise.all([
          fetchSheepById(id),
          fetchSilsilah(id),
          fetchHealthForSheep(id),
          fetchWeightForSheep(id),
          fetchMatingForSheep(id),
        ]);
      },
      { immediate: true },
    );
    
    const refreshData = async () => {
      const id = selectedTernakId.value;
      if (id) {
        await Promise.all([
          fetchSheepById(id),
          fetchSilsilah(id),
          fetchHealthForSheep(id),
          fetchWeightForSheep(id),
          fetchMatingForSheep(id),
        ]);
      }
    };

    // Watch when modal opens, initialize selectedNewCageId with current cage id
    watch(showPindahKandangModal, (open) => {
      if (open && currentSheepDetail.value) {
        selectedNewCageId.value = String(currentSheepDetail.value.id_cage || '');
      }
    });

    const handlePindahKandang = async () => {
      if (!selectedNewCageId.value) {
        alert('Silakan pilih kandang baru.');
        return;
      }
      try {
        isPindahLoading.value = true;
        
        const current = currentSheepDetail.value;
        if (!current) throw new Error("Data domba tidak tersedia");

        const payload = {
          sheep_code: current.sheep_code,
          sheep_name: current.sheep_name,
          gender: current.gender.toLowerCase(),
          date_of_birth: current.date_of_birth,
          origin: current.origin,
          id_type: String(current.id_type),
          id_father: current.id_father ? String(current.id_father) : null,
          id_mother: current.id_mother ? String(current.id_mother) : null,
          photo_url: current.photo_url || '',
          id_cage: selectedNewCageId.value,
          owner: current.owner || '',
        };

        await updateSheep(selectedTernakId.value, payload);

        alert('Berhasil memindahkan domba ke kandang baru.');
        showPindahKandangModal.value = false;
        await refreshData();
      } catch (err: any) {
        console.error('Failed to move cage:', err);
        alert('Gagal memindahkan kandang.');
      } finally {
        isPindahLoading.value = false;
      }
    };
    
    const t = computed(() => {
      if (currentSheepDetail.value) {
        const d = currentSheepDetail.value as any;
        const birthDate = d.date_of_birth
          ? new Date(d.date_of_birth).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—';

        let poelStr = '—';
        if (d.date_of_birth) {
          const bd = new Date(d.date_of_birth);
          const now = new Date();
          const months = (now.getFullYear() - bd.getFullYear()) * 12 + (now.getMonth() - bd.getMonth());
          if (months < 12) poelStr = 'Cempe';
          else if (months < 18) poelStr = '1 Poel';
          else if (months < 24) poelStr = '2 Poel';
          else if (months < 36) poelStr = '3 Poel';
          else poelStr = '4 Poel';
        }

        const typeMapReverse: Record<string, string> = {
          '22222222-2222-2222-2222-222222222201': 'Garut',
          '22222222-2222-2222-2222-222222222202': 'Texel',
          '22222222-2222-2222-2222-222222222203': 'Dorper',
          '22222222-2222-2222-2222-222222222204': 'Merino',
          '22222222-2222-2222-2222-222222222205': 'Dorper F2',
          '22222222-2222-2222-2222-222222222206': 'F2 Garut',
          '22222222-2222-2222-2222-222222222207': 'Cross Dorper'
        };

        const cage = cagesList.value.find((c) => String(c.id) === String(d.id_cage));
        const kandangStr = cage ? cage.code : ((d as any).cage_code || String(d.id_cage));

        let mappedStatus = d.status || '';
        const statusLower = mappedStatus.toLowerCase();
        if (statusLower === 'aktif') mappedStatus = 'Sehat';
        else if (statusLower === 'hamil') mappedStatus = 'Hamil';
        else if (statusLower === 'dijual' || statusLower === 'terjual') mappedStatus = 'Terjual';
        else if (statusLower === 'mati') mappedStatus = 'Mati';
        else if (statusLower === 'disembelih') mappedStatus = 'Disembelih';
        else {
          mappedStatus = mappedStatus.charAt(0).toUpperCase() + mappedStatus.slice(1);
        }

        return {
          id: String(d.id_sheep),
          code: d.sheep_code,
          nama: d.sheep_name,
          jenis: typeMapReverse[String(d.id_type)] || String(d.id_type),
          umur: d.age_string || '—',
          poel: poelStr,
          status: mappedStatus,
          jk: d.gender === 'jantan' ? 'Jantan' : (d.gender === 'betina' ? 'Betina' : d.gender),
          tgl_lahir: birthDate,
          kandang: kandangStr,
          asal: (d as any).origin || '—',
          photo_url: d.photo_url || null,
          owner: d.owner || '—',
        };
      }
      if (sheepFromList.value) {
        const s = sheepFromList.value;
        const typeMapReverse: Record<string, string> = {
          '22222222-2222-2222-2222-222222222201': 'Garut',
          '22222222-2222-2222-2222-222222222202': 'Texel',
          '22222222-2222-2222-2222-222222222203': 'Dorper',
          '22222222-2222-2222-2222-222222222204': 'Merino',
          '22222222-2222-2222-2222-222222222205': 'Dorper F2',
          '22222222-2222-2222-2222-222222222206': 'F2 Garut',
          '22222222-2222-2222-2222-222222222207': 'Cross Dorper'
        };
        
        let poelStr = '—';
        if (s.birth_date) {
          const bd = new Date(s.birth_date);
          const now = new Date();
          const months = (now.getFullYear() - bd.getFullYear()) * 12 + (now.getMonth() - bd.getMonth());
          if (months < 12) poelStr = 'Cempe';
          else if (months < 18) poelStr = '1 Poel';
          else if (months < 24) poelStr = '2 Poel';
          else if (months < 36) poelStr = '3 Poel';
          else poelStr = '4 Poel';
        }

        const kandangStr = s.cage_code || '—';

        return {
          id: s.id,
          code: s.code,
          nama: s.name,
          jenis: typeMapReverse[s.type] || s.type,
          umur: s.age || '—',
          poel: poelStr,
          status: s.status,
          jk: s.gender === 'jantan' ? 'Jantan' : (s.gender === 'betina' ? 'Betina' : s.gender),
          tgl_lahir: s.birth_date 
            ? new Date(s.birth_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
          kandang: kandangStr,
          asal: s.origin || '—',
          photo_url: s.photo_url || null,
          owner: s.owner || '—',
        };
      }
      return null;
    });

    const silsilah = computed(() => currentSilsilah.value);
    const healthRecords = computed(() => currentHealthRecords.value);
    const weightRecords = computed(() => currentWeightRecords.value);
    const matingRecords = computed(() => currentMatingRecords.value);

    const latestWeight = computed(() => {
      if (weightRecords.value.length > 0) {
        const sorted = [...weightRecords.value].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        if (sorted[0]) return `${sorted[0].weight} kg`;
      }
      
      // Fallback
      if (currentSheepDetail.value && (currentSheepDetail.value as any).last_weight) {
        return `${(currentSheepDetail.value as any).last_weight} kg`;
      }
      if (sheepFromList.value && sheepFromList.value.weight && sheepFromList.value.weight !== '—') {
        return sheepFromList.value.weight;
      }

      return '—';
    });

    const chartRecords = computed(() => {
      if (weightRecords.value.length > 0) return weightRecords.value;
      
      // Fallback: Jika tidak ada riwayat, tampilkan 1 titik dari berat awal
      const fallbackWeight = parseFloat((currentSheepDetail.value as any)?.last_weight || (sheepFromList.value as any)?.weight || '0');
      if (fallbackWeight > 0) {
        return [{
          id: 'initial',
          sheep_id: selectedTernakId.value,
          date: (currentSheepDetail.value as any)?.created_at || (currentSheepDetail.value as any)?.date_of_birth || new Date().toISOString(),
          weight: fallbackWeight
        }];
      }
      return [];
    });

    // ── ADG calculation (FR2-03) ──
    const adgData = computed(() => {
      const detail = currentSheepDetail.value as any;
      if (detail && detail.adg !== undefined && detail.adg !== null) {
        return { adg: detail.adg, label: detail.adg_label || 'Kurang' };
      }
      return null;
    });

    const handleReportMiscarriage = async () => {
      if (!confirm('Apakah Anda yakin ingin melaporkan keguguran untuk domba ini? Status kehamilan akan dibatalkan.')) return;
      
      try {
        const pregnancies = await pregnancyApi.getList();
        const activePregnancy = pregnancies.find((p: any) => 
          (String(p.mother_sheep?.id_sheep) === String(selectedTernakId.value) || 
           String(p.dam_sheep?.id_sheep) === String(selectedTernakId.value)) && 
          p.pregnancy_status === 'dikandung'
        );
        
        if (activePregnancy) {
          await pregnancyApi.updateStatus(activePregnancy.id_pregnancy, 'keguguran');
          alert('Berhasil melaporkan keguguran.');
          await refreshData();
        } else {
          alert('Data kehamilan aktif untuk domba ini tidak ditemukan.');
        }
      } catch (e) {
        console.error('Failed to report miscarriage:', e);
        alert('Gagal melaporkan keguguran.');
      }
    };

    return () => {
      if (detailLoading.value && !t.value) {
        return (
          <div class="text-center py-5">
            <Typography variant="p" color="secondary">Memuat data ternak...</Typography>
          </div>
        );
      }

      if (!t.value) {
        return (
          <div class="text-center py-5">
            <Typography>Data tidak ditemukan</Typography>
            <BackButton onClick={handleBack} className="mt-3" />
          </div>
        );
      }

      const ternak = t.value;

      return (
        <div class="animate-fade-in-up">
          {/* Back Button */}
          <div class="mb-4">
            <BackButton onClick={handleBack} title="Kembali ke Daftar" />
          </div>

          {/* Detail Header */}
          <div class="detail-header-card d-flex flex-column flex-md-row gap-4 align-items-start" style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(61, 47, 36, 0.15)' }}>
            <div class="detail-avatar-box d-flex align-items-center justify-content-center" style={{ background: 'var(--color-surface)', border: '2px solid var(--color-surface-container-high)', borderRadius: '16px', padding: ternak.photo_url ? '0' : '1.25rem', flexShrink: 0, overflow: 'hidden', width: '120px', height: '120px' }}>
              {ternak.photo_url ? (
                <img src={`http://localhost:8081${ternak.photo_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Domba" />
              ) : (
                <img src="/icon/domba.png" style={{ width: '80px', height: '80px', objectFit: 'contain' }} alt="Domba" />
              )}
            </div>
            <div class="grow w-100">
              <div class="d-flex align-items-center justify-content-between mb-1 flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2">
                  <Typography variant="h1" size="text-3xl" weight="extrabold" className="m-0" style={{ color: 'var(--color-surface)' }}>
                    {ternak.nama}
                  </Typography>
                  <div class="d-inline-flex align-items-center">
                    <Badge variant={ternak.status === 'Sehat' ? 'solid-success' : (ternak.status === 'Hamil' ? 'solid-warning' : 'solid-danger')} className="ms-2">
                      {ternak.status}
                    </Badge>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-2 ms-auto">
                  <button 
                    class="btn rounded-pill d-flex align-items-center gap-2 fw-bold btn-edit-profile"
                    onClick={() => showPindahKandangModal.value = true}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Pindah Kandang
                  </button>
                  <button 
                    class="btn rounded-pill d-flex align-items-center gap-2 fw-bold btn-edit-profile"
                    onClick={() => showEditProfileModal.value = true}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                    Ubah Profil
                  </button>
                </div>
              </div>

              <ul class="mb-4" style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--color-outline-variant)', fontSize: '0.9rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <li><strong>Kode Domba:</strong> {ternak.code}</li>
                <li><strong>Tipe/Jenis:</strong> {ternak.jenis}</li>
                <li><strong>Jenis Kelamin:</strong> {ternak.jk}</li>
              </ul>
              
              <div class="detail-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Umur', value: ternak.umur },
                  { label: 'Poel', value: ternak.poel },
                  { label: 'Berat Terakhir', value: latestWeight.value },
                  { label: 'Kandang', value: ternak.kandang },
                  { label: 'Tgl Lahir', value: ternak.tgl_lahir },
                  { label: 'Asal', value: ternak.asal },
                  { label: 'Pemilik', value: ternak.owner },
                ].map(item => (
                  <div key={item.label} class="stat-box shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-container-high)', borderRadius: '12px', padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                    <Typography variant="span" size="text-xs" weight="bold" className="d-block text-uppercase mb-1" style={{ color: 'var(--color-gray-500)', letterSpacing: '0.5px' }}>{item.label}</Typography>
                    <Typography variant="p" weight="extrabold" size="text-lg" className="m-0" style={{ color: 'var(--color-primary)' }}>{item.value}</Typography>
                  </div>
                ))}

                {/* ADG Card */}
                {adgData.value && (
                  <div class="stat-box shadow-sm" style={{
                    background: adgData.value.label === 'Baik'
                      ? 'var(--color-success-bg)'
                      : adgData.value.label === 'Cukup'
                        ? 'var(--color-warning-bg)'
                        : 'var(--color-danger-bg)',
                    border: '1px solid',
                    borderColor: adgData.value.label === 'Baik' ? '#a7f3d0' : adgData.value.label === 'Cukup' ? '#fde68a' : '#fecaca',
                    borderRadius: '12px', padding: '0.85rem 0.5rem', textAlign: 'center',
                  }}>
                    <Typography variant="span" size="text-xs" weight="bold" className="d-block text-uppercase mb-1" style={{ color: 'var(--color-gray-600)', letterSpacing: '0.5px' }}>ADG</Typography>
                    <Typography variant="p" weight="extrabold" size="text-lg" className="m-0" style={{ color: adgData.value.label === 'Baik' ? 'var(--color-success-text)' : adgData.value.label === 'Cukup' ? 'var(--color-warning-text)' : 'var(--color-danger-deep)' }}>
                      {adgData.value.adg} <span style={{ fontSize: '0.75rem' }}>gr/hr</span>
                    </Typography>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: adgData.value.label === 'Baik' ? 'var(--color-success-text)' : adgData.value.label === 'Cukup' ? 'var(--color-warning-text)' : 'var(--color-danger-deep)', textTransform: 'uppercase' }}>
                      {adgData.value.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {String(ternak.status).toLowerCase() === 'hamil' && (
            <div class="alert alert-warning d-flex align-items-center justify-content-between p-3 rounded-4 mb-4" style={{ border: '1.5px solid #ffc107', background: '#fffbeb' }}>
              <div class="d-flex align-items-center gap-3">
                <span style={{ fontSize: '1.5rem' }}>🤰</span>
                <div class="text-start">
                  <Typography variant="p" className="m-0 fw-bold text-dark" size="text-sm">Domba ini sedang dalam masa kehamilan.</Typography>
                  <Typography variant="p" className="m-0 text-muted d-block" size="text-xs">Laporkan keguguran jika domba mengalami keguguran sebelum masa kelahiran.</Typography>
                </div>
              </div>
              <button 
                type="button" 
                class="btn btn-danger btn-sm rounded-pill px-3 fw-bold shadow-sm"
                onClick={handleReportMiscarriage}
              >
                Lapor Keguguran
              </button>
            </div>
          )}

          {/* Riwayat Kesehatan & Pertumbuhan */}
          <div class="row g-4">
            <div class="col-12">
              <div class="bg-white rounded-4 border p-4 mb-4">
                <Typography variant="h3" weight="bold" color="coffee-brown" className="mb-3 fs-6">
                  Riwayat Kesehatan & Pertumbuhan
                </Typography>

                <div class="mb-4">
                  <SheepWeightChart records={chartRecords.value} />
                </div>

                {/* Riwayat Kesehatan */}
                {healthRecords.value.length > 0 && (
                  <div>
                    <Typography variant="span" size="text-xs" weight="bold" className="text-secondary text-uppercase d-block mb-2">Riwayat Kesehatan</Typography>
                    <div class="d-flex flex-column gap-2">
                      {[...healthRecords.value]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map(h => (
                          <div key={h.id} class="d-flex justify-content-between align-items-center p-3 rounded-3 bg-light">
                            <div>
                              <Typography variant="span" size="text-sm" weight="bold" className="text-secondary d-block">
                                {new Date(h.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </Typography>
                              <Typography variant="span" size="text-sm" className="text-muted">{h.notes}</Typography>
                            </div>
                            <Badge 
                              variant={h.status === 'Sehat' ? 'solid-success' : (h.status === 'Sakit' ? 'solid-danger' : 'solid-primary')} 
                              className="px-3 py-1"
                            >
                              {h.status}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Riwayat Perkawinan */}
                {matingRecords.value.length > 0 && (
                  <div class="mt-4 pt-4 border-top">
                    <Typography variant="span" size="text-xs" weight="bold" className="text-secondary text-uppercase d-block mb-2">Riwayat Perkawinan</Typography>
                    <div class="d-flex flex-column gap-2">
                      {[...matingRecords.value]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map(m => (
                          <div key={m.id} class="d-flex justify-content-between align-items-center p-3 rounded-3 bg-light">
                            <div>
                              <Typography variant="span" size="text-sm" weight="bold" className="text-secondary d-block">
                                {new Date(m.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </Typography>
                              <Typography variant="span" size="text-sm" className="text-muted">
                                Pasangan: {m.partner_name || 'Tidak diketahui'} • {m.notes || 'Tanpa catatan'}
                              </Typography>
                            </div>
                            <Badge 
                              variant={m.status === 'berhasil' || m.status === 'sukses' ? 'solid-success' : (m.status === 'proses' ? 'solid-warning' : 'solid-danger')} 
                              className="px-3 py-1"
                            >
                              {m.status.toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {weightRecords.value.length === 0 && healthRecords.value.length === 0 && matingRecords.value.length === 0 && (
                  <div class="d-flex flex-column align-items-center justify-content-center py-5" style={{ color: 'var(--color-gray-500)' }}>
                    <img src="/icon/statistic.png" style={{ width: '48px', opacity: 0.3, marginBottom: '1rem', display: 'block' }} alt="" />
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Belum ada riwayat pencatatan</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Silsilah Keluarga — 3 Generasi (FR2-02) */}
          <div class="bg-white rounded-4 border p-4 mb-4">
            <Typography variant="h3" weight="bold" color="coffee-brown" className="mb-4 fs-6">
              Silsilah Keluarga (3 Generasi)
            </Typography>

            {detailLoading.value ? (
              <div class="text-center py-3 text-secondary" style={{ fontSize: '0.85rem' }}>Memuat silsilah...</div>
            ) : silsilah.value === null ? (
              <div class="text-center py-3 text-muted small">Data silsilah tidak tersedia</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                {/* Generasi 2 (Buyut/Great-grandparents) */}
                <div class="d-flex justify-content-around gap-2 mb-3">
                  <div class="d-flex flex-column gap-2">
                    <SilsilahNode node={(silsilah.value?.father as any)?.father?.father} label="GG-Kakek ♂" depth={2} />
                    <SilsilahNode node={(silsilah.value?.father as any)?.father?.mother} label="GG-Nenek ♀" depth={2} />
                  </div>
                  <div class="d-flex flex-column gap-2">
                    <SilsilahNode node={(silsilah.value?.father as any)?.mother?.father} label="GG-Kakek ♂" depth={2} />
                    <SilsilahNode node={(silsilah.value?.father as any)?.mother?.mother} label="GG-Nenek ♀" depth={2} />
                  </div>
                  <div class="d-flex flex-column gap-2">
                    <SilsilahNode node={(silsilah.value?.mother as any)?.father?.father} label="GG-Kakek ♂" depth={2} />
                    <SilsilahNode node={(silsilah.value?.mother as any)?.father?.mother} label="GG-Nenek ♀" depth={2} />
                  </div>
                  <div class="d-flex flex-column gap-2">
                    <SilsilahNode node={(silsilah.value?.mother as any)?.mother?.father} label="GG-Kakek ♂" depth={2} />
                    <SilsilahNode node={(silsilah.value?.mother as any)?.mother?.mother} label="GG-Nenek ♀" depth={2} />
                  </div>
                </div>

                {/* Connector line */}
                <div style={{ borderTop: '2px solid var(--color-outline-variant)', margin: '0.25rem 0' }} />

                {/* Generasi 1 (Kakek-Nenek) */}
                <div class="d-flex justify-content-around gap-2 mb-3 mt-3">
                  <SilsilahNode node={(silsilah.value?.father as any)?.father} label="Kakek (Bapak) ♂" depth={1} />
                  <SilsilahNode node={(silsilah.value?.father as any)?.mother} label="Nenek (Bapak) ♀" depth={1} />
                  <SilsilahNode node={(silsilah.value?.mother as any)?.father} label="Kakek (Ibu) ♂" depth={1} />
                  <SilsilahNode node={(silsilah.value?.mother as any)?.mother} label="Nenek (Ibu) ♀" depth={1} />
                </div>

                <div style={{ borderTop: '2px solid var(--color-outline-variant)', margin: '0.25rem 0' }} />

                {/* Generasi 0 (Ayah/Ibu) */}
                <div class="d-flex justify-content-center gap-4 mb-3 mt-3">
                  <SilsilahNode node={silsilah.value?.father} label="Bapak ♂" depth={0} />
                  <SilsilahNode node={silsilah.value?.mother} label="Ibu ♀" depth={0} />
                </div>

                <div style={{ borderTop: '2px solid var(--color-primary)', margin: '0.25rem 0' }} />

                {/* Domba ini sendiri */}
                <div class="d-flex justify-content-center mt-3">
                  <div style={{
                    padding: '0.75rem 1.5rem', borderRadius: '10px',
                    background: 'var(--color-primary)', color: '#fff',
                    fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', minWidth: '160px',
                  }}>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8, marginBottom: '2px' }}>🐑 Domba Ini</div>
                    {ternak.nama} ({ternak.code})
                  </div>
                </div>

                {/* Warning jika silsilah tidak lengkap */}
                {(!silsilah.value?.father || !silsilah.value?.mother) && !String(ternak.asal).toLowerCase().includes('pembelian') && (
                  <div class="alert alert-warning mt-3 py-2 px-3 rounded-3" style={{ fontSize: '0.8rem' }}>
                    ⚠️ Silsilah tidak lengkap — data induk {!silsilah.value?.father ? 'jantan (sire)' : 'betina (dam)'} tidak tersedia. Validasi inbreeding mungkin tidak akurat.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modals */}
          <Teleport to="body">
            <EditLivestockModal 
              isOpen={showEditProfileModal.value}
              sheepData={currentSheepDetail.value}
              onClose={() => showEditProfileModal.value = false}
              onSuccess={refreshData}
            />

            {showPindahKandangModal.value && (
              <div class="peternakan-modal-overlay" onClick={() => showPindahKandangModal.value = false}>
                <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                  <div class="peternakan-modal-header">
                    <button class="peternakan-modal-close" onClick={() => showPindahKandangModal.value = false}>
                      <img src="/icon/close-cancel/grey-24.svg" alt="Tutup" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                    </button>
                    <div class="peternakan-modal-title">Pindah Kandang</div>
                  </div>

                  <div class="peternakan-modal-body">
                    <div class="p-3 bg-light rounded-4 border mb-4 text-start" style={{ fontSize: '0.88rem', color: 'var(--color-gray-800)' }}>
                      Pindahkan domba <strong>{ternak.nama} ({ternak.code})</strong> dari kandang saat ini <strong>Kandang {ternak.kandang}</strong> ke kandang baru:
                    </div>

                    <div class="col-12 text-start">
                      <label class="form-label text-secondary small fw-bold mb-2">Pilih Kandang Baru <span class="text-danger">*</span></label>
                      <CustomSelect 
                        placeholder="Pilih Kandang"
                        options={cagesList.value.map(cage => `${cage.code} — ${cage.name}`)}
                        modelValue={selectedNewCageId.value ? (cagesList.value.find(cage => String(cage.id) === String(selectedNewCageId.value))?.code + ' — ' + cagesList.value.find(cage => String(cage.id) === String(selectedNewCageId.value))?.name) : ''}
                        onUpdate:modelValue={(val: string) => {
                          const found = cagesList.value.find(cage => `${cage.code} — ${cage.name}` === val);
                          selectedNewCageId.value = found ? String(found.id) : '';
                        }}
                      />
                    </div>

                    <div class="mt-4 pt-3 border-top border-light">
                      <button 
                        class="peternakan-primary-btn w-100 m-0 justify-content-center" 
                        onClick={handlePindahKandang} 
                        disabled={isPindahLoading.value}
                      >
                        {isPindahLoading.value ? 'Memindahkan...' : 'Pindahkan Domba'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Teleport>
        </div>
      );
    };
  }
});
