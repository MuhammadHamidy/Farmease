import { formatSheepStatus, formatGender } from '@/shared/utils/i18nFormatters';
import { PETERNAKAN_API_BASE_URL } from '@/shared/api/client';
import { defineComponent, computed, ref, watch, type PropType, Teleport } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import router from '@/router';
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
import EditLivestockModal from '@/shared/ui/EditLivestockModal';
import SheepWeightChart from '@/shared/ui/SheepWeightChart';
import CustomSelect from '@/shared/ui/admin/Select';
import CustomAlertModal, { type AlertModalState } from '@/shared/ui/CustomAlertModal';
import '@/modules/ternak/assets/css/modules/RecordForm.css';

// ── Helpers ──────────────────────────────────────────────────────────────
// calcADG is now handled by the backend

const SilsilahNode = (props: { node: any; label: string; depth?: number; onClick?: () => void }) => {
  const node = props.node;
  const label = props.label;
  const depth = props.depth ?? 0;

  const cleanLabel = label.replace(/[♂♀]/g, '').trim();
  const lowerLabel = cleanLabel.toLowerCase();
  const isMale = node
    ? String(node.gender).toLowerCase().includes('jantan')
    : (lowerLabel.includes('kakek') || lowerLabel === 'bapak' || lowerLabel.includes('sire'));

  const isFemale = node
    ? String(node.gender).toLowerCase().includes('betina')
    : (lowerLabel.includes('nenek') || lowerLabel === 'ibu' || lowerLabel.includes('dam'));

  const targetId = node ? (node.id_sheep || node.id || node.sheep_id) : null;
  const isClickable = !!(props.onClick || targetId);

  const handleClick = () => {
    if (props.onClick) {
      props.onClick();
    } else if (targetId) {
      router.push(`/livestock/${targetId}`);
    }
  };

  if (!node) {
    return (
      <div
        style={{
          padding: '0.6rem 0.7rem',
          borderRadius: '10px',
          border: '1.5px dashed var(--color-outline-variant)',
          backgroundColor: 'color-mix(in srgb, var(--color-surface-container-low) 50%, transparent)',
          fontSize: '0.75rem',
          width: '135px',
          minHeight: '76px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div class="d-flex align-items-center justify-content-center gap-1 mb-1">
          <span style={{ fontWeight: 800, fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--color-outline)' }}>{cleanLabel}</span>
          {isMale && <img src="/icon/male.png" alt="♂" style={{ width: '13px', height: '13px', objectFit: 'contain', opacity: 0.6 }} />}
          {isFemale && <img src="/icon/female.png" alt="♀" style={{ width: '13px', height: '13px', objectFit: 'contain', opacity: 0.6 }} />}
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.72rem', color: 'var(--color-outline)' }}>Tidak Diketahui</div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '0.6rem 0.7rem',
        borderRadius: '10px',
        background: 'var(--color-surface-container-lowest)',
        border: '1.5px solid var(--color-outline-variant)',
        fontSize: '0.75rem',
        width: '135px',
        minHeight: '76px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        cursor: isClickable ? 'pointer' : 'default',
        boxShadow: isClickable ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
        transition: 'transform 0.15s ease',
        boxSizing: 'border-box',
      }}
      title={isClickable ? `Klik untuk lihat detail silsilah ${node.sheep_name || node.sheep_code || node.name}` : ''}
    >
      <div class="d-flex align-items-center justify-content-center gap-1 mb-1">
        <span style={{ fontWeight: 800, fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--color-primary)' }}>{cleanLabel}</span>
        {isMale && <img src="/icon/male.png" alt="♂" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />}
        {isFemale && <img src="/icon/female.png" alt="♀" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />}
      </div>
      <div style={{ fontWeight: 700, color: 'var(--color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
        {node.sheep_name || node.sheep_code || node.name || '—'}
      </div>
      <div class="d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.65rem', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
        <span>{node.sheep_code || node.code}</span>
        {node.gender && (
          <img
            src={String(node.gender).toLowerCase().includes('jantan') ? '/icon/male.png' : '/icon/female.png'}
            alt=""
            style={{ width: '13px', height: '13px', objectFit: 'contain' }}
          />
        )}
      </div>
    </div>
  );
};

const SiblingNode = (props: { sibling: any; orderTag?: string; dob?: string | null; onClick?: () => void }) => {
  const sib = props.sibling;
  const orderTag = props.orderTag || sib.orderTag || 'Saudara';
  const isMale = String(sib.gender).toLowerCase().includes('jantan');

  const orderTagStyle = orderTag === 'Kakak'
    ? { bg: '#faedcd', border: '#dda15e', text: '#8c5017' }
    : orderTag === 'Adik'
    ? { bg: '#e9edc9', border: '#a3b18a', text: '#3a471c' }
    : { bg: '#faf8f5', border: '#8b5e3c', text: '#8b5e3c' };

  return (
    <div
      onClick={props.onClick}
      style={{
        padding: '0.6rem 0.7rem',
        borderRadius: '10px',
        background: '#ffffff',
        border: `1.5px solid ${orderTagStyle.border}`,
        fontSize: '0.75rem',
        width: '135px',
        minHeight: '76px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        transition: 'transform 0.15s ease',
        boxSizing: 'border-box',
      }}
      title={`Klik untuk lihat silsilah ${sib.name || sib.sheep_name || sib.sheep_code}`}
    >
      <div class="d-flex align-items-center justify-content-center gap-1 mb-1">
        <span
          style={{
            fontSize: '0.62rem',
            fontWeight: 800,
            padding: '1px 8px',
            borderRadius: '4px',
            backgroundColor: orderTagStyle.bg,
            color: orderTagStyle.text,
            textTransform: 'uppercase',
          }}
        >
          {orderTag}
        </span>
        <img
          src={isMale ? '/icon/male.png' : '/icon/female.png'}
          alt=""
          style={{ width: '13px', height: '13px', objectFit: 'contain' }}
        />
      </div>
      <div style={{ fontWeight: 700, color: 'var(--color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
        {sib.name || sib.sheep_name || sib.sheep_code}
      </div>
      <div style={{ fontSize: '0.65rem', color: 'var(--color-on-surface-variant)' }}>
        {sib.code || sib.sheep_code}
      </div>
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
    const showFullSilsilahModal = ref(false);
    const selectedNewCageId = ref('');
    const isPindahLoading = ref(false);
    const alertModal = ref<AlertModalState>({
      isOpen: false,
      title: '',
      message: '',
      type: 'error',
    });

    const getSilsilahDepth = (node: any): number => {
      if (!node) return 0;
      const f = getSilsilahDepth(node.father);
      const m = getSilsilahDepth(node.mother);
      return 1 + Math.max(f, m);
    };

    const silsilahMaxDepth = computed(() => {
      if (!currentSilsilah.value) return 0;
      return getSilsilahDepth(currentSilsilah.value);
    });

    const selectedSilsilahDepth = ref<number>(3);

    watch(silsilahMaxDepth, (depth) => {
      if (depth > 0) {
        selectedSilsilahDepth.value = Math.max(3, Math.min(depth, 5));
      }
    }, { immediate: true });

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
        alertModal.value = {
          isOpen: true,
          title: 'Validasi Gagal',
          message: 'Silakan pilih kandang baru.',
          type: 'error',
        };
        return;
      }

      // Check cage capacity
      const targetCage = cagesList.value.find(c => String(c.id) === String(selectedNewCageId.value));
      if (targetCage && currentSheepDetail.value) {
        const isChangingCage = String(currentSheepDetail.value.id_cage) !== String(selectedNewCageId.value);
        if (isChangingCage) {
          const occupancy = sheep.value.filter(s => 
            s.cage_code === targetCage.code && 
            !['Mati', 'Terjual', 'Disembelih'].includes(s.status)
          ).length;
          
          if (occupancy >= targetCage.capacity) {
            alertModal.value = {
              isOpen: true,
              title: 'Kandang Penuh',
              message: `Gagal memindahkan domba. Kandang ${targetCage.name} sudah penuh (Kapasitas: ${targetCage.capacity} ekor).`,
              type: 'error',
            };
            return;
          }
        }
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
          status: current.status,
          origin: current.origin,
          id_type: String(current.id_type),
          id_father: current.id_father ? String(current.id_father) : null,
          id_mother: current.id_mother ? String(current.id_mother) : null,
          photo_url: current.photo_url || '',
          id_cage: selectedNewCageId.value,
          owner: current.owner || '',
        };

        await updateSheep(selectedTernakId.value, payload);

        alertModal.value = {
          isOpen: true,
          title: 'Berhasil',
          message: 'Berhasil memindahkan domba ke kandang baru.',
          type: 'success',
        };
        showPindahKandangModal.value = false;
        await refreshData();
      } catch (err: any) {
        console.error('Failed to move cage:', err);
        alertModal.value = {
          isOpen: true,
          title: 'Gagal',
          message: 'Gagal memindahkan kandang.',
          type: 'error',
        };
      } finally {
        isPindahLoading.value = false;
      }
    };
    
    const mappedDetail = computed(() => {
      if (currentSheepDetail.value) {
        const detail = currentSheepDetail.value as any;
        const birthDate = detail.date_of_birth
          ? new Date(detail.date_of_birth).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—';

        let poelStr = '—';
        if (detail.date_of_birth) {
          const bd = new Date(detail.date_of_birth);
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

        const cage = cagesList.value.find((cageItem) => String(cageItem.id) === String(detail.id_cage));
        const kandangStr = cage ? cage.code : ((detail as any).cage_code || String(detail.id_cage));

        let mappedStatus = detail.status || '';
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
          id: String(detail.id_sheep),
          code: detail.sheep_code,
          nama: detail.sheep_name,
          jenis: typeMapReverse[String(detail.id_type)] || String(detail.id_type),
          umur: detail.age_string || '—',
          poel: poelStr,
          status: mappedStatus,
          jk: detail.gender === 'jantan' ? 'Jantan' : (detail.gender === 'betina' ? 'Betina' : detail.gender),
          tgl_lahir: birthDate,
          kandang: kandangStr,
          asal: (detail as any).origin || '—',
          photo_url: detail.photo_url || null,
          owner: detail.owner || '—',
        };
      }
      if (sheepFromList.value) {
        const sheepItem = sheepFromList.value;
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
        if (sheepItem.birth_date) {
          const bd = new Date(sheepItem.birth_date);
          const now = new Date();
          const months = (now.getFullYear() - bd.getFullYear()) * 12 + (now.getMonth() - bd.getMonth());
          if (months < 12) poelStr = 'Cempe';
          else if (months < 18) poelStr = '1 Poel';
          else if (months < 24) poelStr = '2 Poel';
          else if (months < 36) poelStr = '3 Poel';
          else poelStr = '4 Poel';
        }

        const kandangStr = sheepItem.cage_code || '—';

        return {
          id: sheepItem.id,
          code: sheepItem.code,
          nama: sheepItem.name,
          jenis: typeMapReverse[sheepItem.type] || sheepItem.type,
          umur: sheepItem.age || '—',
          poel: poelStr,
          status: sheepItem.status,
          jk: sheepItem.gender === 'jantan' ? 'Jantan' : (sheepItem.gender === 'betina' ? 'Betina' : sheepItem.gender),
          tgl_lahir: sheepItem.birth_date 
            ? new Date(sheepItem.birth_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
          kandang: kandangStr,
          asal: sheepItem.origin || '—',
          photo_url: sheepItem.photo_url || null,
          owner: sheepItem.owner || '—',
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
          await pregnancyApi.updateStatus((activePregnancy as any).id_pregnancy, 'keguguran');
          alertModal.value = {
            isOpen: true,
            title: 'Berhasil',
            message: 'Berhasil melaporkan keguguran.',
            type: 'success',
          };
          await refreshData();
        } else {
          alertModal.value = {
            isOpen: true,
            title: 'Tidak Ditemukan',
            message: 'Data kehamilan aktif untuk domba ini tidak ditemukan.',
            type: 'error',
          };
        }
      } catch (e) {
        console.error('Failed to report miscarriage:', e);
        alertModal.value = {
          isOpen: true,
          title: 'Gagal',
          message: 'Gagal melaporkan keguguran.',
          type: 'error',
        };
      }
    };

    const navigateToSheep = (targetNode: any) => {
      if (!targetNode) return;
      const targetId = targetNode.id_sheep || targetNode.id || targetNode.sheep_id;
      if (targetId) {
        router.push(`/livestock/${targetId}`);
      }
    };

    return () => {
      if (detailLoading.value && !mappedDetail.value) {
        return (
          <div class="text-center py-5">
            <Typography variant="p" color="secondary">Memuat data ternak...</Typography>
          </div>
        );
      }

      if (!mappedDetail.value) {
        return (
          <div class="text-center py-5">
            <Typography>Data tidak ditemukan</Typography>
            <BackButton onClick={handleBack} className="mt-3" />
          </div>
        );
      }

      const ternak = mappedDetail.value;

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
                <img src={ternak.photo_url.startsWith('http') ? ternak.photo_url : `${PETERNAKAN_API_BASE_URL}${ternak.photo_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Domba" />
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
                    <Badge variant={ternak.status === 'Sehat' || ternak.status === 'sehat' ? 'solid-success' : (ternak.status === 'Hamil' || ternak.status === 'hamil' ? 'solid-warning' : 'solid-danger')} className="ms-2">
                      {formatSheepStatus(ternak.status)}
                    </Badge>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-2 ms-auto">
                  {!['mati', 'terjual', 'disembelih'].includes(String(ternak.status || '').toLowerCase()) && (
                    <>
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
                    </>
                  )}
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
                <div class="mb-4">
                  <Typography variant="span" size="text-xs" weight="bold" className="text-secondary text-uppercase d-block mb-2">Riwayat Kesehatan</Typography>
                  {healthRecords.value.length > 0 ? (
                    <div class="d-flex flex-column gap-3">
                      {[...healthRecords.value]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map(h => {
                          const isSehat = String(h.status).toLowerCase() === 'sehat' || String(h.status).toLowerCase() === 'normal';
                          return (
                            <div key={h.id} class="p-3 rounded-4 bg-light text-start border shadow-sm" style={{ borderColor: '#ede8e0' }}>
                              <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                                <div class="d-flex align-items-center gap-2">
                                  <span style={{ fontSize: '1.1rem' }}>🩺</span>
                                  <span class="fw-extrabold text-dark" style={{ fontSize: '0.85rem' }}>
                                    {new Date(h.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                  </span>
                                </div>
                                <Badge 
                                  variant={isSehat ? 'solid-success' : 'solid-danger'} 
                                  className="px-3 py-1 text-uppercase fw-extrabold"
                                  style={{ fontSize: '0.65rem' }}
                                >
                                  {h.status || 'Diagnosa'}
                                </Badge>
                              </div>
                              
                              <div class="row g-2" style={{ fontSize: '0.8rem' }}>
                                <div class="col-6 col-sm-4">
                                  <span class="text-muted d-block small" style={{ fontSize: '0.7rem' }}>Tindakan:</span>
                                  <span class="fw-bold text-dark">{h.action || '—'}</span>
                                </div>
                                <div class="col-6 col-sm-4">
                                  <span class="text-muted d-block small" style={{ fontSize: '0.7rem' }}>Obat & Dosis:</span>
                                  <span class="fw-bold text-dark">{h.medicine_given || '—'}</span>
                                </div>
                                <div class="col-6 col-sm-4">
                                  <span class="text-muted d-block small" style={{ fontSize: '0.7rem' }}>Petugas:</span>
                                  <span class="fw-bold text-dark">{h.inspector_name || '—'}</span>
                                </div>
                                <div class="col-12 mt-1">
                                  <span class="text-muted d-block small" style={{ fontSize: '0.7rem' }}>Catatan Observasi:</span>
                                  <span class="text-secondary">{h.notes || '—'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div class="p-3 text-center text-muted rounded-4 bg-light border border-dashed" style={{ fontSize: '0.85rem' }}>
                      Tidak ada catatan riwayat kesehatan pada domba ini
                    </div>
                  )}
                </div>

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

          {/* Silsilah Keluarga — Layout Cabang Keluarga Bapak (Sire) & Ibu (Dam) dengan Selector 3 - 5 Generasi */}
          <div class="bg-white rounded-4 border p-4 mb-4">
            <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
              <div>
                <Typography variant="h3" weight="bold" color="coffee-brown" className="mb-0 fs-6">
                  Silsilah Keluarga ({selectedSilsilahDepth.value} Generasi)
                </Typography>
                <span class="text-muted small">
                  Bagan silsilah mencakup Garis Keturunan Leluhur & Saudara (Kakak & Adik)
                </span>
                {silsilahMaxDepth.value >= 4 && (
                  <div>
                    <span class="badge bg-success-subtle text-success border border-success-subtle mt-1" style={{ fontSize: '0.7rem' }}>
                      Terdeteksi {silsilahMaxDepth.value} Generasi Leluhur Lengkap
                    </span>
                  </div>
                )}
              </div>

              {/* Selector Tombol Generasi (3, 4, 5 Generasi) — Menggunakan pencatatan-mode-toggle Peternakan */}
              <div class="pencatatan-mode-toggle" style={{ width: 'auto' }}>
                <button
                  type="button"
                  class={['pencatatan-mode-btn', selectedSilsilahDepth.value === 3 ? 'is-active' : '']}
                  onClick={() => selectedSilsilahDepth.value = 3}
                >
                  3 Generasi
                </button>
                <button
                  type="button"
                  class={['pencatatan-mode-btn', selectedSilsilahDepth.value === 4 ? 'is-active' : '']}
                  onClick={() => selectedSilsilahDepth.value = 4}
                >
                  4 Generasi
                </button>
                <button
                  type="button"
                  class={['pencatatan-mode-btn', selectedSilsilahDepth.value === 5 ? 'is-active' : '']}
                  onClick={() => selectedSilsilahDepth.value = 5}
                >
                  5 Generasi
                </button>
              </div>
            </div>

            {detailLoading.value ? (
              <div class="text-center py-3 text-secondary" style={{ fontSize: '0.85rem' }}>Memuat silsilah...</div>
            ) : silsilah.value === null ? (
              <div class="text-center py-3 text-muted small">Data silsilah tidak tersedia</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <div class="pencatatan-tree-container p-4 rounded-4 border" style={{ backgroundColor: '#fcfaf7', borderColor: '#e8ded1', minWidth: '1240px' }}>
                  
                  {/* Sub-Header Kolom Kiri (Bapak - Terracotta/Brown) & Kolom Kanan (Ibu - Forest Green) */}
                  <div class="row g-3 mb-3 text-center fw-extrabold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                    <div class="col-6">
                      <div class="p-2 rounded-3 border shadow-sm" style={{ backgroundColor: '#fdf6ee', borderColor: '#c19a6b', color: '#8b5e3c' }}>
                        KELUARGA PIHAK BAPAK (SIRE LINE)
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="p-2 rounded-3 border shadow-sm" style={{ backgroundColor: '#f4f6f0', borderColor: '#a3b18a', color: '#4a572c' }}>
                        KELUARGA PIHAK IBU (DAM LINE)
                      </div>
                    </div>
                  </div>

                  {/* Generasi 4 (Leluhur GGG) — jika depth === 5 */}
                  {selectedSilsilahDepth.value >= 5 && (
                    <div class="mb-3">
                      <div class="text-center text-muted small fw-bold text-uppercase mb-2" style={{ fontSize: '0.62rem', color: '#8c7a6b' }}>Generasi 4 (Leluhur GGG)</div>
                      <div class="row g-3">
                        {/* Pihak Bapak (2 Pasang Kotak) */}
                        <div class="col-6">
                          <div class="d-flex justify-content-center align-items-center gap-2">
                            <div class="d-flex justify-content-center align-items-center gap-1.5 p-2 rounded-4 shadow-sm" style={{ background: '#fdf6ee', border: '1.5px solid #dda15e' }}>
                              <SilsilahNode node={(silsilah.value?.father as any)?.father?.father?.father} label="GGG-Kakek ♂" depth={3} onClick={() => navigateToSheep((silsilah.value?.father as any)?.father?.father?.father)} />
                              <SilsilahNode node={(silsilah.value?.father as any)?.father?.father?.mother} label="GGG-Nenek ♀" depth={3} onClick={() => navigateToSheep((silsilah.value?.father as any)?.father?.father?.mother)} />
                            </div>
                            <div class="d-flex justify-content-center align-items-center gap-1.5 p-2 rounded-4 shadow-sm" style={{ background: '#fdf6ee', border: '1.5px solid #dda15e' }}>
                              <SilsilahNode node={(silsilah.value?.father as any)?.father?.mother?.father} label="GGG-Kakek ♂" depth={3} onClick={() => navigateToSheep((silsilah.value?.father as any)?.father?.mother?.father)} />
                              <SilsilahNode node={(silsilah.value?.father as any)?.father?.mother?.mother} label="GGG-Nenek ♀" depth={3} onClick={() => navigateToSheep((silsilah.value?.father as any)?.father?.mother?.mother)} />
                            </div>
                          </div>
                        </div>
                        {/* Pihak Ibu (2 Pasang Kotak) */}
                        <div class="col-6">
                          <div class="d-flex justify-content-center align-items-center gap-2">
                            <div class="d-flex justify-content-center align-items-center gap-1.5 p-2 rounded-4 shadow-sm" style={{ background: '#f4f6f0', border: '1.5px solid #a3b18a' }}>
                              <SilsilahNode node={(silsilah.value?.mother as any)?.father?.father?.father} label="GGG-Kakek ♂" depth={3} onClick={() => navigateToSheep((silsilah.value?.mother as any)?.father?.father?.father)} />
                              <SilsilahNode node={(silsilah.value?.mother as any)?.father?.father?.mother} label="GGG-Nenek ♀" depth={3} onClick={() => navigateToSheep((silsilah.value?.mother as any)?.father?.father?.mother)} />
                            </div>
                            <div class="d-flex justify-content-center align-items-center gap-1.5 p-2 rounded-4 shadow-sm" style={{ background: '#f4f6f0', border: '1.5px solid #a3b18a' }}>
                              <SilsilahNode node={(silsilah.value?.mother as any)?.father?.mother?.father} label="GGG-Kakek ♂" depth={3} onClick={() => navigateToSheep((silsilah.value?.mother as any)?.father?.mother?.father)} />
                              <SilsilahNode node={(silsilah.value?.mother as any)?.father?.mother?.mother} label="GGG-Nenek ♀" depth={3} onClick={() => navigateToSheep((silsilah.value?.mother as any)?.father?.mother?.mother)} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ borderTop: '1px dashed #dda15e', margin: '0.75rem 0' }} />
                    </div>
                  )}

                  {/* Generasi 3 (Buyut GG) — jika depth >= 4 */}
                  {selectedSilsilahDepth.value >= 4 && (
                    <div class="mb-3">
                      <div class="text-center small fw-bold text-uppercase mb-2" style={{ fontSize: '0.62rem', color: '#8c7a6b' }}>Generasi 3 (Buyut GG)</div>
                      <div class="row g-3">
                        {/* Buyut Bapak (2 Pasang Kotak) */}
                        <div class="col-6">
                          <div class="d-flex justify-content-center align-items-center gap-2">
                            <div class="d-flex justify-content-center align-items-center gap-2 p-2.5 rounded-4 shadow-sm" style={{ background: '#fdf9f3', border: '1.5px solid #dda15e' }}>
                              <SilsilahNode node={(silsilah.value?.father as any)?.father?.father} label="GG-Kakek ♂" depth={2} onClick={() => navigateToSheep((silsilah.value?.father as any)?.father?.father)} />
                              <SilsilahNode node={(silsilah.value?.father as any)?.father?.mother} label="GG-Nenek ♀" depth={2} onClick={() => navigateToSheep((silsilah.value?.father as any)?.father?.mother)} />
                            </div>
                            <div class="d-flex justify-content-center align-items-center gap-2 p-2.5 rounded-4 shadow-sm" style={{ background: '#fdf9f3', border: '1.5px solid #dda15e' }}>
                              <SilsilahNode node={(silsilah.value?.father as any)?.mother?.father} label="GG-Kakek ♂" depth={2} onClick={() => navigateToSheep((silsilah.value?.father as any)?.mother?.father)} />
                              <SilsilahNode node={(silsilah.value?.father as any)?.mother?.mother} label="GG-Nenek ♀" depth={2} onClick={() => navigateToSheep((silsilah.value?.father as any)?.mother?.mother)} />
                            </div>
                          </div>
                        </div>
                        {/* Buyut Ibu (2 Pasang Kotak) */}
                        <div class="col-6">
                          <div class="d-flex justify-content-center align-items-center gap-2">
                            <div class="d-flex justify-content-center align-items-center gap-2 p-2.5 rounded-4 shadow-sm" style={{ background: '#f6f8f4', border: '1.5px solid #a3b18a' }}>
                              <SilsilahNode node={(silsilah.value?.mother as any)?.father?.father} label="GG-Kakek ♂" depth={2} onClick={() => navigateToSheep((silsilah.value?.mother as any)?.father?.father)} />
                              <SilsilahNode node={(silsilah.value?.mother as any)?.father?.mother} label="GG-Nenek ♀" depth={2} onClick={() => navigateToSheep((silsilah.value?.mother as any)?.father?.mother)} />
                            </div>
                            <div class="d-flex justify-content-center align-items-center gap-2 p-2.5 rounded-4 shadow-sm" style={{ background: '#f6f8f4', border: '1.5px solid #a3b18a' }}>
                              <SilsilahNode node={(silsilah.value?.mother as any)?.mother?.father} label="GG-Kakek ♂" depth={2} onClick={() => navigateToSheep((silsilah.value?.mother as any)?.mother?.father)} />
                              <SilsilahNode node={(silsilah.value?.mother as any)?.mother?.mother} label="GG-Nenek ♀" depth={2} onClick={() => navigateToSheep((silsilah.value?.mother as any)?.mother?.mother)} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ borderTop: '1px dashed #dda15e', margin: '0.75rem 0' }} />
                    </div>
                  )}

                  {/* Generasi 2 (Kakek & Nenek) */}
                  <div class="mb-3">
                    <div class="text-center small fw-bold text-uppercase mb-2" style={{ fontSize: '0.65rem', color: 'var(--color-primary)' }}>Generasi 2 (Kakek & Nenek)</div>
                    <div class="row g-3">
                      {/* Kakek & Nenek Bapak */}
                      <div class="col-6">
                        <div class="d-flex justify-content-center align-items-center gap-3 p-3 rounded-4 shadow-sm" style={{ background: '#fdf6ee', border: '1.5px solid #dda15e', minHeight: '104px' }}>
                          <SilsilahNode node={(silsilah.value?.father as any)?.father} label="Kakek (Bapak) ♂" depth={1} onClick={() => navigateToSheep((silsilah.value?.father as any)?.father)} />
                          <SilsilahNode node={(silsilah.value?.father as any)?.mother} label="Nenek (Bapak) ♀" depth={1} onClick={() => navigateToSheep((silsilah.value?.father as any)?.mother)} />
                        </div>
                      </div>
                      {/* Kakek & Nenek Ibu */}
                      <div class="col-6">
                        <div class="d-flex justify-content-center align-items-center gap-3 p-3 rounded-4 shadow-sm" style={{ background: '#f4f6f0', border: '1.5px solid #a3b18a', minHeight: '104px' }}>
                          <SilsilahNode node={(silsilah.value?.mother as any)?.father} label="Kakek (Ibu) ♂" depth={1} onClick={() => navigateToSheep((silsilah.value?.mother as any)?.father)} />
                          <SilsilahNode node={(silsilah.value?.mother as any)?.mother} label="Nenek (Ibu) ♀" depth={1} onClick={() => navigateToSheep((silsilah.value?.mother as any)?.mother)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Garis Keturunan Kakek/Nenek ke Bapak & Ibu */}
                  <div class="row g-3 my-1">
                    <div class="col-6 d-flex flex-column align-items-center">
                      <div style={{ width: '160px', height: '2px', backgroundColor: '#dda15e' }} />
                      <div style={{ width: '2px', height: '14px', backgroundColor: '#dda15e' }} />
                    </div>
                    <div class="col-6 d-flex flex-column align-items-center">
                      <div style={{ width: '160px', height: '2px', backgroundColor: '#a3b18a' }} />
                      <div style={{ width: '2px', height: '14px', backgroundColor: '#a3b18a' }} />
                    </div>
                  </div>

                  {/* Generasi 1 (Perkawinan Bapak & Ibu) */}
                  <div class="mb-3">
                    <div class="text-center small fw-bold text-uppercase mb-2" style={{ fontSize: '0.65rem', color: '#8b5e3c' }}>Generasi 1 (Perkawinan Bapak & Ibu)</div>
                    <div class="row g-3">
                      <div class="col-6 d-flex justify-content-center">
                        <div class="d-flex justify-content-center align-items-center p-2 rounded-4 shadow-sm" style={{ background: '#fdf6ee', border: '1.5px solid #c19a6b' }}>
                          <SilsilahNode
                            node={silsilah.value?.father}
                            label="Bapak"
                            depth={0}
                            onClick={() => navigateToSheep(silsilah.value?.father)}
                          />
                        </div>
                      </div>
                      <div class="col-6 d-flex justify-content-center">
                        <div class="d-flex justify-content-center align-items-center p-2 rounded-4 shadow-sm" style={{ background: '#f4f6f0', border: '1.5px solid #a3b18a' }}>
                          <SilsilahNode
                            node={silsilah.value?.mother}
                            label="Ibu"
                            depth={0}
                            onClick={() => navigateToSheep(silsilah.value?.mother)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Garis Keturunan Bapak & Ibu ke Anak */}
                  <div class="position-relative my-2" style={{ height: '20px' }}>
                    <div style={{ position: 'absolute', top: '0', left: '25%', right: '25%', height: '2px', backgroundColor: '#8b5e3c' }} />
                    <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '2px', height: '20px', backgroundColor: '#8b5e3c' }} />
                  </div>

                  {/* Generasi 0 (Aku / Target & Kakak/Adik Kandung) */}
                  <div>
                    <div class="text-center small fw-bold text-uppercase mb-2" style={{ fontSize: '0.65rem', color: '#606c38' }}>Generasi Anak (Kakak ➔ Domba Ini ➔ Adik)</div>
                    {(() => {
                      const targetDOBStr = (currentSheepDetail.value as any)?.date_of_birth || (currentSheepDetail.value as any)?.birth_date;
                      const targetDOB = targetDOBStr ? new Date(targetDOBStr).getTime() : null;

                      // Filter HANYA saudara kandung (pasangan Bapak & Ibu sama)
                      const rawSiblings = (silsilah.value?.siblings || []).filter((sib: any) => sib.type === 'kandung');

                      const processedSiblings = rawSiblings.map((sib: any) => {
                        const fullObj = sheep.value.find(s => String(s.id) === String(sib.id_sheep) || s.code === sib.sheep_code);
                        const sibDOBStr = (fullObj as any)?.date_of_birth || (fullObj as any)?.birth_date || sib.date_of_birth;
                        const sibDOB = sibDOBStr ? new Date(sibDOBStr).getTime() : null;

                        let orderTag: 'Kakak' | 'Adik' | 'Kembar' = 'Adik';
                        let timeDiff = 0;

                        if (sibDOB && targetDOB) {
                          timeDiff = sibDOB - targetDOB;
                          if (sibDOB < targetDOB) orderTag = 'Kakak';
                          else if (sibDOB > targetDOB) orderTag = 'Adik';
                          else orderTag = 'Kembar';
                        }

                        return {
                          ...sib,
                          orderTag,
                          timeDiff,
                          name: fullObj?.name || sib.sheep_name || sib.sheep_code,
                          code: fullObj?.code || sib.sheep_code,
                          dobStr: sibDOBStr ? new Date(sibDOBStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
                        };
                      });

                      const kakakList = processedSiblings.filter((s: any) => s.orderTag === 'Kakak').sort((a: any, b: any) => a.timeDiff - b.timeDiff);
                      const adikList = processedSiblings.filter((s: any) => s.orderTag === 'Adik' || s.orderTag === 'Kembar').sort((a: any, b: any) => a.timeDiff - b.timeDiff);

                      return (
                        <div class="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-2 mb-2 p-3 rounded-4" style={{ backgroundColor: '#f4f6f0', border: '2px solid #a3b18a' }}>
                          {/* Kakak (Lebih Tua) */}
                          {kakakList.map((sib: any) => (
                            <SiblingNode
                              key={sib.id_sheep || sib.id}
                              sibling={sib}
                              orderTag={sib.orderTag}
                              dob={sib.dobStr}
                              onClick={() => navigateToSheep(sib)}
                            />
                          ))}

                          {/* Domba Utama (Domba Ini) */}
                          <div style={{
                            padding: '0.75rem 1.5rem', borderRadius: '12px',
                            background: 'var(--color-secondary)', color: 'var(--color-on-secondary)',
                            fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', minWidth: '160px',
                            boxShadow: '0 4px 12px color-mix(in srgb, var(--color-secondary) 30%, transparent)',
                            border: '2px solid color-mix(in srgb, var(--color-secondary) 80%, white)'
                          }}>
                            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.9, marginBottom: '2px', letterSpacing: '0.5px' }}>Domba Ini</div>
                            {ternak.nama} ({ternak.code})
                          </div>

                          {/* Adik (Lebih Muda) */}
                          {adikList.map((sib: any) => (
                            <SiblingNode
                              key={sib.id_sheep || sib.id}
                              sibling={sib}
                              orderTag={sib.orderTag}
                              dob={sib.dobStr}
                              onClick={() => navigateToSheep(sib)}
                            />
                          ))}
                        </div>
                      );
                    })()}
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
            {/* Modal Pohon Silsilah 5 Generasi */}
            {showFullSilsilahModal.value && (
              <div class="peternakan-modal-overlay" onClick={() => showFullSilsilahModal.value = false}>
                <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95vw', width: '1300px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <div class="peternakan-modal-header">
                    <button class="peternakan-modal-close" onClick={() => showFullSilsilahModal.value = false}>
                      <img src="/icon/close-cancel/grey-24.svg" alt="Tutup" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                    </button>
                    <div class="peternakan-modal-title">Pohon Silsilah Lengkap ({silsilahMaxDepth.value} Generasi) — {ternak.nama}</div>
                  </div>
                  <div class="peternakan-modal-body p-4" style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: '1050px' }}>
                      {/* Generasi 4 (Leluhur GGG) */}
                      {silsilahMaxDepth.value >= 5 && (
                        <div class="mb-4">
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>Generasi 4 (Leluhur GGG)</div>
                          <div class="d-flex justify-content-around gap-1">
                            {[
                              (silsilah.value?.father as any)?.father?.father?.father, (silsilah.value?.father as any)?.father?.father?.mother,
                              (silsilah.value?.father as any)?.father?.mother?.father, (silsilah.value?.father as any)?.father?.mother?.mother,
                              (silsilah.value?.father as any)?.mother?.father?.father, (silsilah.value?.father as any)?.mother?.father?.mother,
                              (silsilah.value?.father as any)?.mother?.mother?.father, (silsilah.value?.father as any)?.mother?.mother?.mother,
                              (silsilah.value?.mother as any)?.father?.father?.father, (silsilah.value?.mother as any)?.father?.father?.mother,
                              (silsilah.value?.mother as any)?.father?.mother?.father, (silsilah.value?.mother as any)?.father?.mother?.mother,
                              (silsilah.value?.mother as any)?.mother?.father?.father, (silsilah.value?.mother as any)?.mother?.father?.mother,
                              (silsilah.value?.mother as any)?.mother?.mother?.father, (silsilah.value?.mother as any)?.mother?.mother?.mother,
                            ].map((node, idx) => (
                              <SilsilahNode key={idx} node={node} label={`GGG-${idx+1}`} depth={4} />
                            ))}
                          </div>
                          <div style={{ borderTop: '2px dashed #ccc', margin: '0.75rem 0' }} />
                        </div>
                      )}

                      {/* Generasi 3 (Leluhur GG) */}
                      {silsilahMaxDepth.value >= 4 && (
                        <div class="mb-4">
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>Generasi 3 (Leluhur GG)</div>
                          <div class="d-flex justify-content-around gap-1">
                            {[
                              (silsilah.value?.father as any)?.father?.father, (silsilah.value?.father as any)?.father?.mother,
                              (silsilah.value?.father as any)?.mother?.father, (silsilah.value?.father as any)?.mother?.mother,
                              (silsilah.value?.mother as any)?.father?.father, (silsilah.value?.mother as any)?.father?.mother,
                              (silsilah.value?.mother as any)?.mother?.father, (silsilah.value?.mother as any)?.mother?.mother,
                            ].map((node, idx) => (
                              <SilsilahNode key={idx} node={node} label={`GG-${idx+1}`} depth={3} />
                            ))}
                          </div>
                          <div style={{ borderTop: '2px dashed #ccc', margin: '0.75rem 0' }} />
                        </div>
                      )}

                      {/* Generasi 2 (Buyut) */}
                      <div class="mb-4">
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>Generasi 2 (Buyut)</div>
                        <div class="d-flex justify-content-around gap-2">
                          <SilsilahNode node={(silsilah.value?.father as any)?.father?.father} label="GG-Kakek ♂" depth={2} />
                          <SilsilahNode node={(silsilah.value?.father as any)?.father?.mother} label="GG-Nenek ♀" depth={2} />
                          <SilsilahNode node={(silsilah.value?.father as any)?.mother?.father} label="GG-Kakek ♂" depth={2} />
                          <SilsilahNode node={(silsilah.value?.father as any)?.mother?.mother} label="GG-Nenek ♀" depth={2} />
                          <SilsilahNode node={(silsilah.value?.mother as any)?.father?.father} label="GG-Kakek ♂" depth={2} />
                          <SilsilahNode node={(silsilah.value?.mother as any)?.father?.mother} label="GG-Nenek ♀" depth={2} />
                          <SilsilahNode node={(silsilah.value?.mother as any)?.mother?.father} label="GG-Kakek ♂" depth={2} />
                          <SilsilahNode node={(silsilah.value?.mother as any)?.mother?.mother} label="GG-Nenek ♀" depth={2} />
                        </div>
                        <div style={{ borderTop: '2px solid var(--color-outline-variant)', margin: '0.75rem 0' }} />
                      </div>

                      {/* Generasi 1 (Kakek-Nenek) */}
                      <div class="mb-4">
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>Generasi 1 (Kakek & Nenek)</div>
                        <div class="d-flex justify-content-around gap-2">
                          <SilsilahNode node={(silsilah.value?.father as any)?.father} label="Kakek (Bapak) ♂" depth={1} />
                          <SilsilahNode node={(silsilah.value?.father as any)?.mother} label="Nenek (Bapak) ♀" depth={1} />
                          <SilsilahNode node={(silsilah.value?.mother as any)?.father} label="Kakek (Ibu) ♂" depth={1} />
                          <SilsilahNode node={(silsilah.value?.mother as any)?.mother} label="Nenek (Ibu) ♀" depth={1} />
                        </div>
                        <div style={{ borderTop: '2px solid var(--color-outline-variant)', margin: '0.75rem 0' }} />
                      </div>

                      {/* Generasi 0 (Bapak-Ibu) */}
                      <div class="mb-4">
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>Generasi 0 (Orang Tua)</div>
                        <div class="d-flex justify-content-center gap-4">
                          <SilsilahNode node={silsilah.value?.father} label="Bapak ♂" depth={0} />
                          <SilsilahNode node={silsilah.value?.mother} label="Ibu ♀" depth={0} />
                        </div>
                        <div style={{ borderTop: '2px solid var(--color-primary)', margin: '0.75rem 0' }} />
                      </div>

                      {/* Generasi Anak: Domba Ini + Kakak & Adik (Saudara Kandung & Tiri) dalam 1 baris */}
                      <div class="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-3 mb-2">
                        {/* Sibling nodes di sebelah kiri */}
                        {(silsilah.value?.siblings || []).slice(0, Math.ceil((silsilah.value?.siblings?.length || 0) / 2)).map((sib: any) => (
                          <SiblingNode
                            key={sib.id_sheep}
                            sibling={sib}
                            onClick={() => {
                              showFullSilsilahModal.value = false;
                              router.push(`/livestock/${sib.id_sheep}`);
                            }}
                          />
                        ))}

                        {/* Domba Utama (Domba Ini) */}
                        <div style={{
                          padding: '0.75rem 1.5rem', borderRadius: '10px',
                          background: 'var(--color-primary)', color: '#fff',
                          fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', minWidth: '160px',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                        }}>
                          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8, marginBottom: '2px' }}>🐑 Domba Ini</div>
                          {ternak.nama} ({ternak.code})
                        </div>

                        {/* Sibling nodes di sebelah kanan */}
                        {(silsilah.value?.siblings || []).slice(Math.ceil((silsilah.value?.siblings?.length || 0) / 2)).map((sib: any) => (
                          <SiblingNode
                            key={sib.id_sheep}
                            sibling={sib}
                            onClick={() => {
                              showFullSilsilahModal.value = false;
                              router.push(`/livestock/${sib.id_sheep}`);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

          {/* Custom Alert Modal */}
          {alertModal.value.isOpen && (
            <CustomAlertModal
              alert={alertModal.value}
              onClose={() => { alertModal.value.isOpen = false; }}
            />
          )}
        </div>
      );
    };
  }
});
