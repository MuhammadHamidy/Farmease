import { defineComponent, computed, ref, watch, onMounted, type PropType } from 'vue';
import { selectedTernakId } from '@/store/navigation';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import {
  sheep,
  currentSheepDetail,
  currentSilsilah,
  currentHealthRecords,
  currentWeightRecords,
  detailLoading,
  fetchSheepById,
  fetchSilsilah,
  fetchHealthForSheep,
  fetchWeightForSheep,
} from '@/store/livestock';

export default defineComponent({
  name: 'TernakDetailView',
  props: {
    onGoToPencatatan: { type: Function as PropType<() => void>, default: null },
  },
  setup(props) {
    const showReminderSheet = ref(false);

    // Lookup from sheep list first (fast), then fetch detail from BE
    const sheepFromList = computed(() =>
      sheep.value.find(s => s.id === selectedTernakId.value) || null,
    );

    const handleBack = () => {
      selectedTernakId.value = null;
      currentSheepDetail.value = null;
      currentSilsilah.value = null;
      currentHealthRecords.value = [];
      currentWeightRecords.value = [];
    };

    // Load detail, silsilah, riwayat when selectedTernakId changes
    watch(
      () => selectedTernakId.value,
      async (id) => {
        if (!id) return;
        const numId = Number(id);
        if (isNaN(numId)) return;
        await Promise.all([
          fetchSheepById(numId),
          fetchSilsilah(numId),
          fetchHealthForSheep(numId),
          fetchWeightForSheep(numId),
        ]);
      },
      { immediate: true },
    );

    // Use detail from BE if available, fallback to list
    const t = computed(() => {
      if (currentSheepDetail.value) {
        const d = currentSheepDetail.value;
        const birthDate = d.date_of_birth
          ? new Date(d.date_of_birth).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—';
        // Calculate age from birth date
        let age = '—';
        if (d.date_of_birth) {
          const born = new Date(d.date_of_birth);
          const now = new Date();
          const months = (now.getFullYear() - born.getFullYear()) * 12 + (now.getMonth() - born.getMonth());
          age = months >= 12 ? `${Math.floor(months / 12)} thn` : `${months} bln`;
        }
        return {
          id: String(d.id_sheep),
          code: d.sheep_code,
          nama: d.sheep_name,
          jenis: String(d.id_type),
          umur: age,
          status: d.status,
          jk: d.gender === 'jantan' ? 'Jantan' : 'Betina',
          tgl_lahir: birthDate,
          kandang: String(d.id_cage),
        };
      }
      // Fallback to list data
      if (sheepFromList.value) {
        const s = sheepFromList.value;
        return {
          id: s.id,
          code: s.code,
          nama: s.name,
          jenis: s.type,
          umur: s.age || '—',
          status: s.status,
          jk: s.gender === 'jantan' ? 'Jantan' : 'Betina',
          tgl_lahir: s.birth_date || '—',
          kandang: s.cage_code,
        };
      }
      return null;
    });

    const silsilah = computed(() => currentSilsilah.value);
    const healthRecords = computed(() => currentHealthRecords.value);
    const weightRecords = computed(() => currentWeightRecords.value);

    // Latest weight from weight records
    const latestWeight = computed(() => {
      if (weightRecords.value.length === 0) return '—';
      const sorted = [...weightRecords.value].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      return sorted[0] ? `${sorted[0].weight} kg` : '—';
    });

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
            <button onClick={handleBack} class="peternakan-primary-btn mt-3">Kembali</button>
          </div>
        );
      }

      const ternak = t.value;

      return (
        <div class="animate-fade-in-up">
          {/* Back Button */}
          <div class="d-flex align-items-center mb-4">
            <button
              onClick={handleBack}
              class="header-logout-btn"
              style={{ width: '42px', height: '42px', background: 'white' }}
              title="Kembali ke Daftar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <Typography variant="span" size="text-sm" weight="extrabold" className="ms-3 text-secondary">
              Detail Ternak
            </Typography>
          </div>

          {/* Detail Header */}
          <div class="detail-header-card" style={{ background: 'linear-gradient(135deg, #FBF6F1 0%, #F8F0EA 100%)', border: '1.5px solid #D4C4B0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(212, 165, 116, 0.08)' }}>
            <div class="detail-avatar-box">
              <img src="/icon/domba.png" style={{ width: '64px', height: '64px', objectFit: 'contain' }} alt="Domba" />
            </div>
            <div class="grow">
              <div class="d-flex align-items-center gap-2 mb-1">
                <Typography variant="h1" size="text-3xl" weight="extrabold" color="coffee-brown" className="m-0">
                  {ternak.nama}
                </Typography>
                <Badge variant={ternak.status === 'Sehat' ? 'success' : (ternak.status === 'Hamil' ? 'warning' : 'danger')}>
                  {ternak.status}
                </Badge>
              </div>
              <Typography variant="p" weight="bold" color="coffee-brown" className="mb-3">
                {ternak.code} • {ternak.jenis} • {ternak.jk}
              </Typography>

              <div class="detail-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Umur', value: ternak.umur },
                  { label: 'Berat', value: latestWeight.value },
                  { label: 'Kandang', value: ternak.kandang },
                  { label: 'Tgl Lahir', value: ternak.tgl_lahir },
                ].map(item => (
                  <div key={item.label} class="stat-box" style={{ background: 'linear-gradient(135deg, #FFFCF9 0%, #FFF8F4 100%)', border: '1.5px solid #DCC9B8', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                    <Typography variant="span" size="text-xs" weight="bold" color="coffee-brown" className="d-block text-uppercase">{item.label}</Typography>
                    <Typography variant="p" weight="extrabold" size="text-lg" color="coffee-brown" className="m-0" style={{ color: '#3D2E24' }}>{item.value}</Typography>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Riwayat Kesehatan & Pertumbuhan */}
          <div class="row g-4">
            <div class="col-12 col-md-7">
              <div class="bg-white rounded-4 border p-4 mb-4">
                <Typography variant="h3" weight="bold" color="coffee-brown" className="mb-3 fs-6">
                  Riwayat Kesehatan & Pertumbuhan
                </Typography>

                {/* Riwayat Berat Badan */}
                {weightRecords.value.length > 0 && (
                  <div class="mb-4">
                    <Typography variant="span" size="text-xs" weight="bold" className="text-secondary text-uppercase d-block mb-2">Riwayat Berat Badan</Typography>
                    <div class="d-flex flex-column gap-2">
                      {[...weightRecords.value]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map(w => (
                          <div key={w.id} class="d-flex justify-content-between align-items-center p-2 rounded-3 bg-light">
                            <Typography variant="span" size="text-xs" weight="bold" className="text-secondary">
                              {new Date(w.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </Typography>
                            <Badge variant="success" className="px-3 py-1">{w.weight} kg</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Riwayat Kesehatan */}
                {healthRecords.value.length > 0 && (
                  <div>
                    <Typography variant="span" size="text-xs" weight="bold" className="text-secondary text-uppercase d-block mb-2">Riwayat Kesehatan</Typography>
                    <div class="d-flex flex-column gap-2">
                      {[...healthRecords.value]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map(h => (
                          <div key={h.id} class="d-flex justify-content-between align-items-center p-2 rounded-3 bg-light">
                            <div>
                              <Typography variant="span" size="text-xs" weight="bold" className="text-secondary d-block">
                                {new Date(h.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </Typography>
                              <Typography variant="span" size="text-xs" className="text-muted">{h.notes}</Typography>
                            </div>
                            <Badge variant={h.status === 'Sehat' ? 'success' : 'warning'} className="px-3 py-1">{h.status}</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {weightRecords.value.length === 0 && healthRecords.value.length === 0 && (
                  <div class="text-center py-4" style={{ color: '#6B7280' }}>
                    <img src="/icon/statistic.png" style={{ width: '48px', opacity: 0.3, marginBottom: '1rem' }} alt="" />
                    <p style={{ fontSize: '0.9rem' }}>Belum ada riwayat kesehatan & pertumbuhan</p>
                  </div>
                )}
              </div>
            </div>

            {/* Agenda & Pengingat */}
            <div class="col-12 col-md-5">
              <div class="bg-white rounded-4 border p-4 shadow-sm mb-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <Typography variant="h3" weight="bold" color="coffee-brown" className="m-0 fs-6">
                    Agenda & Pengingat
                  </Typography>
                  {props.onGoToPencatatan && (
                    <button
                      class="btn btn-sm btn-link font-extrabold p-0 text-decoration-none"
                      style={{ color: '#5C3D2E', fontSize: '0.75rem' }}
                      onClick={() => {
                        selectedTernakId.value = null;
                        props.onGoToPencatatan?.();
                      }}
                    >
                      + Buat di Pencatatan
                    </button>
                  )}
                </div>

                <div class="text-center py-3">
                  <Typography variant="p" size="text-xs" color="coffee-brown" weight="bold">
                    Pengingat tersedia setelah jadwal dibuat
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Silsilah Keluarga */}
          <div class="bg-white rounded-4 border p-4 mb-4">
            <Typography variant="h3" weight="bold" color="coffee-brown" className="mb-4 fs-6">
              Silsilah Keluarga (Ancestry)
            </Typography>

            {detailLoading.value ? (
              <div class="text-center py-3 text-secondary" style={{ fontSize: '0.85rem' }}>Memuat silsilah...</div>
            ) : (
              <div class="lineage-container">
                <div class="row g-3">
                  {/* Ayah (Sire) */}
                  <div class="col-12 col-md-6">
                    <div class="p-3 rounded-4 mb-3 border" style={{ background: 'linear-gradient(135deg, #FFFCF9 0%, #FFF8F4 100%)', borderColor: '#DCC9B8' }}>
                      <Typography variant="span" size="text-xs" weight="bold" color="coffee-brown" className="text-uppercase mb-2 d-block">Ayah (Sire)</Typography>
                      {silsilah.value?.sire ? (
                        <>
                          <Typography variant="p" weight="extrabold" size="text-sm" color="coffee-brown">
                            {silsilah.value.sire.sheep_name || silsilah.value.sire.sheep_code || '—'} ({silsilah.value.sire.gender || '—'})
                          </Typography>
                          <div class="d-flex gap-2 mt-3 pt-3 border-top">
                            <div class="flex-fill">
                              <Typography variant="span" size="text-xs" weight="bold" color="coffee-brown" className="text-uppercase d-block" style={{ fontSize: '10px' }}>Kakek (Ayah)</Typography>
                              <Typography variant="p" weight="extrabold" size="text-xs" color="coffee-brown">
                                {(silsilah.value.sire as any).sire?.sheep_name || 'N/A'}
                              </Typography>
                            </div>
                            <div class="flex-fill">
                              <Typography variant="span" size="text-xs" weight="bold" color="coffee-brown" className="text-uppercase d-block" style={{ fontSize: '10px' }}>Nenek (Ayah)</Typography>
                              <Typography variant="p" weight="extrabold" size="text-xs" color="coffee-brown">
                                {(silsilah.value.sire as any).dam?.sheep_name || 'N/A'}
                              </Typography>
                            </div>
                          </div>
                        </>
                      ) : (
                        <Typography variant="p" size="text-sm" color="coffee-brown">Data tidak tersedia</Typography>
                      )}
                    </div>
                  </div>

                  {/* Ibu (Dam) */}
                  <div class="col-12 col-md-6">
                    <div class="p-3 rounded-4 mb-3 border" style={{ background: 'linear-gradient(135deg, #FFFCF9 0%, #FFF8F4 100%)', borderColor: '#DCC9B8' }}>
                      <Typography variant="span" size="text-xs" weight="bold" color="coffee-brown" className="text-uppercase mb-2 d-block">Ibu (Dam)</Typography>
                      {silsilah.value?.dam ? (
                        <>
                          <Typography variant="p" weight="extrabold" size="text-sm" color="coffee-brown">
                            {silsilah.value.dam.sheep_name || silsilah.value.dam.sheep_code || '—'} ({silsilah.value.dam.gender || '—'})
                          </Typography>
                          <div class="d-flex gap-2 mt-3 pt-3 border-top">
                            <div class="flex-fill">
                              <Typography variant="span" size="text-xs" weight="bold" color="coffee-brown" className="text-uppercase d-block" style={{ fontSize: '10px' }}>Kakek (Ibu)</Typography>
                              <Typography variant="p" weight="extrabold" size="text-xs" color="coffee-brown">
                                {(silsilah.value.dam as any).sire?.sheep_name || 'N/A'}
                              </Typography>
                            </div>
                            <div class="flex-fill">
                              <Typography variant="span" size="text-xs" weight="bold" color="coffee-brown" className="text-uppercase d-block" style={{ fontSize: '10px' }}>Nenek (Ibu)</Typography>
                              <Typography variant="p" weight="extrabold" size="text-xs" color="coffee-brown">
                                {(silsilah.value.dam as any).dam?.sheep_name || 'N/A'}
                              </Typography>
                            </div>
                          </div>
                        </>
                      ) : (
                        <Typography variant="p" size="text-sm" color="coffee-brown">Data tidak tersedia</Typography>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };
  },
});
