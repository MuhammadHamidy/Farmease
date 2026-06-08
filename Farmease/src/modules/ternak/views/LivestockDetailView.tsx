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

// ── Helpers ──────────────────────────────────────────────────────────────
// calcADG is now handled by the backend

const SilsilahNode = ({ node, label, depth = 0 }: { node: any; label: string; depth?: number }) => {
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
    const showReminderSheet = ref(false);

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

    const t = computed(() => {
      if (currentSheepDetail.value) {
        const d = currentSheepDetail.value as any;
        const birthDate = d.date_of_birth
          ? new Date(d.date_of_birth).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—';
        return {
          id: String(d.id_sheep),
          code: d.sheep_code,
          nama: d.sheep_name,
          jenis: String(d.id_type),
          umur: d.age_string || '—',
          status: d.status,
          jk: d.gender === 'jantan' ? 'Jantan' : 'Betina',
          tgl_lahir: birthDate,
          kandang: String(d.id_cage),
          asal: (d as any).origin || '—',
        };
      }
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
          asal: '—',
        };
      }
      return null;
    });

    const silsilah = computed(() => currentSilsilah.value);
    const healthRecords = computed(() => currentHealthRecords.value);
    const weightRecords = computed(() => currentWeightRecords.value);

    const latestWeight = computed(() => {
      if (weightRecords.value.length === 0) return '—';
      const sorted = [...weightRecords.value].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      return sorted[0] ? `${sorted[0].weight} kg` : '—';
    });

    // ── ADG calculation (FR2-03) ──
    const adgData = computed(() => {
      const detail = currentSheepDetail.value as any;
      if (detail && detail.adg !== undefined && detail.adg !== null) {
        return { adg: detail.adg, label: detail.adg_label || 'Kurang' };
      }
      return null;
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
              class="btn btn-light border shadow-sm rounded-pill d-flex align-items-center gap-2 px-3 py-2 fw-bold text-secondary"
              title="Kembali ke Daftar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
            <Typography variant="span" size="text-sm" weight="extrabold" className="ms-3 text-secondary">
              Detail Ternak
            </Typography>
          </div>

          {/* Detail Header */}
          <div class="detail-header-card d-flex flex-column flex-md-row gap-4 align-items-start" style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(61, 47, 36, 0.15)' }}>
            <div class="detail-avatar-box d-flex align-items-center justify-content-center" style={{ background: 'var(--color-surface)', border: '2px solid var(--color-surface-container-high)', borderRadius: '16px', padding: '1.25rem', flexShrink: 0 }}>
              <img src="/icon/domba.png" style={{ width: '80px', height: '80px', objectFit: 'contain' }} alt="Domba" />
            </div>
            <div class="grow w-100">
              <div class="d-flex align-items-center gap-2 mb-1">
                <Typography variant="h1" size="text-3xl" weight="extrabold" className="m-0" style={{ color: 'var(--color-surface)' }}>
                  {ternak.nama}
                </Typography>
                <Badge variant={ternak.status === 'Sehat' ? 'success' : (ternak.status === 'Hamil' ? 'warning' : 'danger')} className="ms-2">
                  {ternak.status}
                </Badge>
              </div>
              <Typography variant="p" weight="bold" className="mb-4" style={{ color: 'var(--color-outline-variant)' }}>
                {ternak.code} • {ternak.jenis} • {ternak.jk}
              </Typography>

              {/* Stat Cards including ADG */}
              <div class="detail-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Umur', value: ternak.umur },
                  { label: 'Berat Terakhir', value: latestWeight.value },
                  { label: 'Kandang', value: ternak.kandang },
                  { label: 'Tgl Lahir', value: ternak.tgl_lahir },
                  { label: 'Asal', value: ternak.asal },
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

          {/* Riwayat Kesehatan & Pertumbuhan */}
          <div class="row g-4">
            <div class="col-12">
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
                          <div key={w.id} class="d-flex justify-content-between align-items-center p-3 rounded-3 bg-light">
                            <Typography variant="span" size="text-sm" weight="bold" className="text-secondary">
                              {new Date(w.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
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
                          <div key={h.id} class="d-flex justify-content-between align-items-center p-3 rounded-3 bg-light">
                            <div>
                              <Typography variant="span" size="text-sm" weight="bold" className="text-secondary d-block">
                                {new Date(h.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </Typography>
                              <Typography variant="span" size="text-sm" className="text-muted">{h.notes}</Typography>
                            </div>
                            <Badge variant={h.status === 'Sehat' ? 'success' : 'warning'} className="px-3 py-1">{h.status}</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {weightRecords.value.length === 0 && healthRecords.value.length === 0 && (
                  <div class="text-center py-4" style={{ color: 'var(--color-gray-500)' }}>
                    <img src="/icon/statistic.png" style={{ width: '48px', opacity: 0.3, marginBottom: '1rem' }} alt="" />
                    <p style={{ fontSize: '0.9rem' }}>Belum ada riwayat kesehatan & pertumbuhan</p>
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
                    <SilsilahNode node={(silsilah.value?.sire as any)?.sire?.sire} label="GG-Kakek ♂" depth={2} />
                    <SilsilahNode node={(silsilah.value?.sire as any)?.sire?.dam} label="GG-Nenek ♀" depth={2} />
                  </div>
                  <div class="d-flex flex-column gap-2">
                    <SilsilahNode node={(silsilah.value?.sire as any)?.dam?.sire} label="GG-Kakek ♂" depth={2} />
                    <SilsilahNode node={(silsilah.value?.sire as any)?.dam?.dam} label="GG-Nenek ♀" depth={2} />
                  </div>
                  <div class="d-flex flex-column gap-2">
                    <SilsilahNode node={(silsilah.value?.dam as any)?.sire?.sire} label="GG-Kakek ♂" depth={2} />
                    <SilsilahNode node={(silsilah.value?.dam as any)?.sire?.dam} label="GG-Nenek ♀" depth={2} />
                  </div>
                  <div class="d-flex flex-column gap-2">
                    <SilsilahNode node={(silsilah.value?.dam as any)?.dam?.sire} label="GG-Kakek ♂" depth={2} />
                    <SilsilahNode node={(silsilah.value?.dam as any)?.dam?.dam} label="GG-Nenek ♀" depth={2} />
                  </div>
                </div>

                {/* Connector line */}
                <div style={{ borderTop: '2px solid var(--color-outline-variant)', margin: '0.25rem 0' }} />

                {/* Generasi 1 (Kakek-Nenek) */}
                <div class="d-flex justify-content-around gap-2 mb-3 mt-3">
                  <SilsilahNode node={(silsilah.value?.sire as any)?.sire} label="Kakek (Ayah) ♂" depth={1} />
                  <SilsilahNode node={(silsilah.value?.sire as any)?.dam} label="Nenek (Ayah) ♀" depth={1} />
                  <SilsilahNode node={(silsilah.value?.dam as any)?.sire} label="Kakek (Ibu) ♂" depth={1} />
                  <SilsilahNode node={(silsilah.value?.dam as any)?.dam} label="Nenek (Ibu) ♀" depth={1} />
                </div>

                <div style={{ borderTop: '2px solid var(--color-outline-variant)', margin: '0.25rem 0' }} />

                {/* Generasi 0 (Ayah/Ibu) */}
                <div class="d-flex justify-content-center gap-4 mb-3 mt-3">
                  <SilsilahNode node={silsilah.value?.sire} label="Ayah (Sire) ♂" depth={0} />
                  <SilsilahNode node={silsilah.value?.dam} label="Ibu (Dam) ♀" depth={0} />
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
                {(!silsilah.value?.sire || !silsilah.value?.dam) && (
                  <div class="alert alert-warning mt-3 py-2 px-3 rounded-3" style={{ fontSize: '0.8rem' }}>
                    ⚠️ Silsilah tidak lengkap — data induk {!silsilah.value?.sire ? 'jantan (sire)' : 'betina (dam)'} tidak tersedia. Validasi inbreeding mungkin tidak akurat.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    };
  },
});
