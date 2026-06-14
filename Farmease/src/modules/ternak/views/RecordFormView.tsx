import { defineComponent, ref, computed, watch } from 'vue';
import '@/modules/ternak/assets/css/modules/RecordForm.css';
import { activePencatatanForm, selectedPencatatanPayload, cageSession, userSession, cagesList } from '@/store/navigation';
import { operatorTasks, submitPencatatanSubmission } from '@/store/operatorAdmin';
import { pencatatanSubmissions } from '@/modules/ternak/store/operatorAdmin';
import { stocks, fetchStocks } from '@/modules/ternak/store/peternakan';
import { sheep } from '@/store/livestock';
import { feedsApi, breedingApi } from '@/shared/api';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import PencatatanTypeFields, { type PencatatanFormItem } from '@/modules/ternak/components/pencatatan/PencatatanTypeFields';
import type { PencatatanMode } from '@/modules/ternak/components/pencatatan/PencatatanModeToggle';
import { useRouter } from 'vue-router';
import CustomAlertModal, { type AlertModalState } from '../components/shared/CustomAlertModal';

const JENIS_ICONS: Record<string, string> = {
  pakan: '/icon/catat_pakan.png',
  stok_pakan: '/icon/inventory.png',
  kesehatan: '/icon/catat_sehat.png',
  perkawinan: '/icon/catat_kawin.png',
  kelahiran: '/icon/catat_lahir.png',
  kotoran: '/icon/catat_kotoran.png',
  berat_badan: '/icon/statistic.png',
};



export default defineComponent({
  name: 'PencatatanFormView',
  setup() {
    const router = useRouter();
    const rincianItems = computed(() => activePencatatanForm.value?.rincian || []);
    const selectedScope = computed(() => activePencatatanForm.value?.scope || 'domba');
    const forms = ref<PencatatanFormItem[]>([]);
    const isSubmitting = ref(false);
    const submitResult = ref<{ success: boolean; message: string } | null>(null);
    const showRecap = ref(false);
    const recapPayload = ref<any | null>(null);

    const initForms = () => {
      forms.value = rincianItems.value.map((item: { id: string; name: string; mode?: string }) => ({
        id: item.id,
        name: item.name,
        mode: (selectedScope.value === 'kandang' ? 'kelompok' : 'individu') as PencatatanMode,
        targetId: '',
        qty: '',
        unit: 'kg',
        note: '',
        tindakan: '',
        obat: '',
        vitaminAmount: '',
        kotoranState: 'campur',
        idPejantan: '',
        metoda: 'alami',
        jumlahAnak: '',
        kondisiInduk: 'Sehat',
        kondisiAnak: 'Sehat',
        tanggal: new Date().toISOString().split('T')[0],
        pemanfaatan: 'Pupuk Organik Kebun',
        kandangAnak: '',
        namaAnak: '',
        beratLahir: '',
      }));

      forms.value.forEach((f) => {
        if (f.mode === 'kelompok' || activePencatatanForm.value?.jenis?.id === 'kotoran') {
          if (cageSession.value?.code) {
            f.targetId = cageSession.value.code;
          }
        }
      });
    };

    watch(
      () => activePencatatanForm.value,
      (val) => {
        submitResult.value = null;
        if (val?.rincian?.length) initForms();
      },
      { immediate: true },
    );

    // Fetch stocks when form opens
    watch(
      () => activePencatatanForm.value?.jenis?.id,
      (jenisId) => {
        if (jenisId) fetchStocks();
      },
      { immediate: true },
    );

    const handleModeChange = (form: PencatatanFormItem, mode: PencatatanMode) => {
      form.mode = mode;
      form.targetId = mode === 'kelompok' ? cageSession.value?.code || '' : '';
    };

    const alertModal = ref<AlertModalState>({
      isOpen: false,
      title: '',
      message: '',
      type: 'error',
    });

    const closeAlertModal = () => {
      alertModal.value.isOpen = false;
      if (alertModal.value.type === 'success') {
        activePencatatanForm.value = null;
        selectedPencatatanPayload.value = null;
        router.push({ name: 'ternak-dasbor' });
      }
    };

    // ── STEP 2: final submit (after recap), updates task status and submits to queue
    const handleFinalSubmit = async () => {
      if (!recapPayload.value) return;
      isSubmitting.value = true;

      const result = await submitPencatatanSubmission({
        type: recapPayload.value.type,
        scope: selectedScope.value,
        summary: recapPayload.value.data.summary,
        payload: recapPayload.value,
        operatorCode: userSession.value?.code,
        operatorName: userSession.value?.name,
        cageCode: cageSession.value?.code,
        taskId: activePencatatanForm.value?.taskId,
      });

      isSubmitting.value = false;

      if (result.success) {
        pencatatanSubmissions.value.unshift({
          id: `SUB-${Date.now().toString().slice(-6)}`,
          type: activePencatatanForm.value?.jenis?.id || 'pencatatan',
          typeLabel: activePencatatanForm.value?.jenis?.name || 'Pencatatan',
          operatorCode: userSession.value?.code || 'OP001',
          operatorName: userSession.value?.name || 'Operator Ternak',
          cageCode: cageSession.value?.code || 'A',
          scope: selectedScope.value,
          summary: recapPayload.value.data.summary,
          payload: recapPayload.value,
          submittedAt: Date.now(),
          approvalStatus: 'pending',
          taskId: activePencatatanForm.value?.taskId,
        } as any);

        selectedPencatatanPayload.value = recapPayload.value;
        activePencatatanForm.value = null;
        recapPayload.value = null;
        showRecap.value = false;
        router.push({ name: 'ternak-dasbor' });
      } else {
        alertModal.value = {
          isOpen: true,
          title: 'Gagal Mengirim',
          message: result.message,
          type: 'error',
        };
      }
    };

    const handleSaved = async () => {
      const isValid = forms.value.every((f) => {
        if (activePencatatanForm.value?.jenis?.id === 'stok_pakan') {
          return true;
        }
        return !!f.targetId;
      });
      if (!isValid) {
        alertModal.value = {
          isOpen: true,
          title: 'Validasi Gagal',
          message: 'Mohon lengkapi ID Ternak/Kandang pada setiap kartu pencatatan.',
          type: 'error'
        };
        return;
      }

      if (activePencatatanForm.value?.jenis?.id === 'pakan') {
        let isStockInsufficient = false;
        let insufficientMessage = '';

        for (const f of forms.value) {
          const feedName = f.obat; // dropdown value for Jenis Pakan
          const requestedQty = parseFloat(f.qty) || 0;
          if (feedName && requestedQty > 0) {
            const stockItem = stocks.value.find((s: any) => s.name.toLowerCase() === feedName.toLowerCase());
            if (!stockItem || stockItem.qty < requestedQty) {
              isStockInsufficient = true;
              insufficientMessage = `Stok pakan "${feedName}" tidak mencukupi!\nTersedia: ${stockItem ? stockItem.qty : 0} kg\nDibutuhkan: ${requestedQty} kg.`;
              break;
            }
          }
        }

        if (isStockInsufficient) {
          alertModal.value = {
            isOpen: true,
            title: 'Stok Tidak Mencukupi',
            message: `${insufficientMessage}\n\nMohon catat penambahan stok pakan terlebih dahulu sebelum melakukan pencatatan pemberian pakan ini.`,
            type: 'error'
          };
          return;
        }
      }

      const showError = (msg: string) => {
        alertModal.value = {
          isOpen: true,
          title: 'Form Tidak Lengkap',
          message: msg,
          type: 'error',
        };
      };

      const categoryId = activePencatatanForm.value?.jenis?.id;
      for (const formItem of forms.value) {
        if (categoryId !== 'stok_pakan') {
          if (formItem.mode === 'individu') {
            if (!formItem.targetId.trim()) return showError('ID Ternak wajib diisi pada mode individu.');
            const foundSheep = sheep.value.find(s => s.code.toUpperCase() === formItem.targetId.trim().toUpperCase() || s.id.toString() === formItem.targetId.trim());
            if (!foundSheep) return showError(`Domba dengan ID / Kode "${formItem.targetId}" tidak ditemukan.`);
            
            const activeCage = cageSession.value?.code;
            if (activeCage && foundSheep.cage_code !== activeCage) {
               return showError(`Domba "${formItem.targetId}" tidak berada di Kandang ${activeCage}.`);
            }
          } else if (formItem.mode === 'kelompok' && !formItem.targetId.trim()) {
            return showError('ID Kandang wajib diisi.');
          }
        }
        
        if (categoryId === 'pakan' && (!formItem.obat || !formItem.qty)) return showError('Jenis pakan dan jumlah pakan wajib diisi.');
        if (categoryId === 'stok_pakan') {
          const isConversion = formItem.name === 'Konversi Pakan';
          if (!isConversion && (!formItem.obat || !formItem.qty)) return showError('Nama pakan sumber dan jumlah masuk wajib diisi.');
          if (isConversion && (!formItem.obat || !formItem.qty || !formItem.idPejantan || !formItem.vitaminAmount)) return showError('Semua field konversi pakan wajib diisi.');
        }
        if (categoryId === 'kesehatan' && (!formItem.tindakan || !formItem.obat)) return showError('Tindakan/Diagnosa dan Obat/Vitamin wajib diisi.');
        if (categoryId === 'kotoran' && !formItem.qty) return showError('Jumlah produksi kotoran wajib diisi.');
        if (categoryId === 'perkawinan' && !formItem.idPejantan) return showError('ID Pejantan wajib diisi.');
        if (categoryId === 'kelahiran' && (!formItem.jumlahAnak || !formItem.idPejantan || !formItem.namaAnak || !formItem.kandangAnak || !formItem.tanggal || !formItem.beratLahir)) return showError('Seluruh data kelahiran anak (ID Pejantan, Nama Anak, Kandang Anak, Tanggal Lahir, Berat, dan Jumlah) wajib diisi.');
        if (categoryId === 'berat_badan' && !formItem.qty) return showError('Berat badan wajib diisi.');
      }

      if (activePencatatanForm.value?.jenis?.id === 'perkawinan') {
        let isInbreedingRisk = false;
        let inbreedingMessage = '';

        for (const formEntry of forms.value) {
          const id1Str = String(formEntry.targetId || '').trim().toUpperCase();
          const id2Str = String(formEntry.idPejantan || '').trim().toUpperCase();
          
          if (id1Str && id2Str) {
            const male = sheep.value.find(sheepItem => String(sheepItem.id) === id2Str);
            const female = sheep.value.find(sheepItem => String(sheepItem.id) === id1Str);
            
            if (!male || !female) {
              alertModal.value = {
                isOpen: true, title: 'Validasi Gagal', message: 'ID Domba pejantan atau induk tidak ditemukan di database.', type: 'error'
              };
              return;
            }

            try {
              const breedingCheckResult = await breedingApi.checkInbreeding(Number(male.id), Number(female.id));
              if (breedingCheckResult?.inbreeding_flag) {
                isInbreedingRisk = true;
                inbreedingMessage = `Perkawinan antara betina ${id1Str} dan pejantan ${id2Str} memiliki risiko inbreeding tinggi.\nKategori: ${breedingCheckResult.risk_category || 'Tinggi'} (${breedingCheckResult.inbreeding_percentage?.toFixed(2)}%).`;
                break;
              }
            } catch (error) {
              alertModal.value = {
                isOpen: true, title: 'Error Server', message: 'Gagal menghubungi server untuk cek inbreeding.', type: 'error'
              };
              return;
            }
          }
        }

        if (isInbreedingRisk) {
          alertModal.value = {
            isOpen: true,
            title: 'Risiko Inbreeding Tinggi',
            message: `${inbreedingMessage}\n\nSistem memblokir pencatatan ini untuk mencegah risiko cacat genetik pada anakan.`,
            type: 'error'
          };
          return;
        }
      }

      isSubmitting.value = false;

      // Store payload and show recap screen — actual submission happens on 'Selesai'
      recapPayload.value = {
        type: activePencatatanForm.value?.jenis?.id || 'pencatatan',
        data: {
          items: forms.value.map(f => ({ ...f })), // snapshot
          summary: `Mencatat ${forms.value.length} rincian ${activePencatatanForm.value?.jenis?.name}`,
        },
      };
      showRecap.value = true;
    };

    const goBack = () => {
      activePencatatanForm.value = null;
    };

    const matchedStocks = computed(() => {
      const type = activePencatatanForm.value?.jenis?.id || '';
      return stocks.value.filter(
        (s) =>
          ((type === 'pakan' || type === 'stok_pakan') && (s.category === 'hijauan' || s.category === 'konsentrat' || s.category === 'pellet' || s.category === 'greenery')) ||
          (type === 'kesehatan' && s.category === 'vitamin') ||
          (type === 'kotoran' && s.category === 'kotoran'),
      );
    });

    const getCageName = (code: string) => {
      const cage = cagesList.value.find(c => c.code === code);
      return cage ? cage.name : `Kandang ${code}`;
    };

    const siapKawinBetina = computed(() => {
      return sheep.value.filter((s) => {
        if (s.cage_code !== cageSession.value?.code) return false;
        if (s.gender !== 'betina' || s.status !== 'Sehat') return false;
        if (s.birth_date) {
          const birthDate = new Date(s.birth_date);
          const now = new Date();
          const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
          return ageInMonths >= 8;
        }
        return true;
      });
    });

    const siapKawinJantan = computed(() => {
      return sheep.value.filter((s) => {
        if (s.cage_code !== cageSession.value?.code) return false;
        if (s.gender !== 'jantan' || s.status !== 'Sehat') return false;
        if (s.birth_date) {
          const birthDate = new Date(s.birth_date);
          const now = new Date();
          const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
          return ageInMonths >= 12;
        }
        return true;
      });
    });

    return () => {
      const jenis = activePencatatanForm.value?.jenis;
      if (!jenis) return null;

      const jenisIcon = JENIS_ICONS[jenis.id] || '/icon/catat_kotoran.png';

      // ── RECAP SCREEN ─────────────────────────────────────────
      if (showRecap.value && recapPayload.value) {
        const items: any[] = recapPayload.value.data?.items || [];
        return (
          <div class="pencatatan-form-overlay animate-fade-in">
            <div class="container-fluid mx-auto" style={{ maxWidth: '720px' }}>
              {/* Header */}
              <div class="text-center mb-5">
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #606C38, #30360E)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <img src={jenisIcon} style={{ width: '36px', height: '36px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} alt="" />
                </div>
                <Typography variant="h3" weight="extrabold" className="m-0 text-almond-beige">Rekap Pencatatan</Typography>
                <Typography variant="p" size="text-sm" color="secondary" className="mt-2 mb-0">
                  Periksa data berikut sebelum mengirim ke admin untuk disetujui.
                </Typography>
              </div>

              {/* Summary Card */}
              <div style={{
                background: '#fff', borderRadius: '20px', padding: '1.5rem',
                border: '1px solid #E6D9CE', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f0ebe4' }}>
                  <img src={jenisIcon} style={{ width: '28px', height: '28px', objectFit: 'contain' }} alt="" />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jenis Pencatatan</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#1a1a1a' }} class="text-capitalize">{jenis.name}</div>
                  </div>
                  <div class="ms-auto">
                    <span style={{
                      background: '#F4F5F0', border: '1px solid #D8DCC8',
                      borderRadius: '8px', padding: '0.2rem 0.65rem',
                      fontSize: '0.72rem', fontWeight: '700', color: '#30360E'
                    }}>
                      {items.length} Rincian
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#6C757D' }}>Operator</span>
                    <span style={{ fontWeight: '700', color: '#1a1a1a' }}>{userSession.value?.name || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#6C757D' }}>Kandang</span>
                    <span style={{ fontWeight: '700', color: '#1a1a1a' }}>{cageSession.value?.name || cageSession.value?.code || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#6C757D' }}>Waktu</span>
                    <span style={{ fontWeight: '700', color: '#1a1a1a' }}>
                      {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB — {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#6C757D' }}>Ringkasan</span>
                    <span style={{ fontWeight: '700', color: '#1a1a1a' }}>{recapPayload.value.data.summary}</span>
                  </div>
                  {activePencatatanForm.value?.taskId && (
                    <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: '#F0F7FF', borderRadius: '10px', border: '1px solid #BDE0FE' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1A5276' }}>
                        🔗 Terhubung ke Tugas Rutin — status tugas akan berubah ke <b>Menunggu Validasi</b> setelah klik Selesai.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items detail */}
              {items.map((item: any, idx: number) => (
                <div key={idx} style={{
                  background: '#FAFAF8', borderRadius: '14px', padding: '1rem',
                  border: '1px solid #E6D9CE', marginBottom: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Rincian #{idx + 1} — {item.name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {item.targetId && <span style={{ background: '#E8F5E9', color: '#2E7D32', borderRadius: '8px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: '600' }}>ID: {item.targetId}</span>}
                    {item.qty && <span style={{ background: '#E3F2FD', color: '#1565C0', borderRadius: '8px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: '600' }}>{item.qty} {item.unit || ''}</span>}
                    {item.tindakan && <span style={{ background: '#FFF3E0', color: '#E65100', borderRadius: '8px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: '600' }}>{item.tindakan}</span>}
                    {item.obat && <span style={{ background: '#F3E5F5', color: '#6A1B9A', borderRadius: '8px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: '600' }}>{item.obat}</span>}
                    {item.note && <span style={{ background: '#F5F5F5', color: '#424242', borderRadius: '8px', padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: '600' }}>📝 {item.note}</span>}
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  class="btn rounded-pill fw-bold"
                  style={{ flex: 1, padding: '0.75rem', border: '1.5px solid #D8DCC8', background: 'transparent', color: '#606C38', fontSize: '0.9rem' }}
                  onClick={() => { showRecap.value = false; }}
                  disabled={isSubmitting.value}
                >
                  ← Ubah Data
                </button>
                <button
                  type="button"
                  class="btn rounded-pill fw-bold text-white"
                  style={{ flex: 2, padding: '0.75rem', background: 'linear-gradient(135deg, #606C38, #30360E)', border: 'none', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(48,54,14,0.3)' }}
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting.value}
                >
                  {isSubmitting.value ? '⏳ Mengirim...' : '✅ Selesai — Kirim ke Admin'}
                </button>
              </div>

              <CustomAlertModal alert={alertModal.value} onClose={closeAlertModal} />
            </div>
          </div>
        );
      }

      return (
        <div class="pencatatan-form-overlay animate-fade-in">
          <div class="container-fluid mx-auto" style={{ maxWidth: '1200px' }}>
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 mb-4 mb-md-5">
              <div class="d-flex align-items-center flex-grow-1 min-w-0">
                <Button
                  variant="ghost"
                  onClick={goBack}
                  v-slots={{
                    iconLeft: () => (
                      <img
                        src="/icon/left-row.png"
                        style={{ width: '14px', height: '14px', objectFit: 'contain' }}
                      />
                    ),
                  }}
                >
                  <div class="ms-1 text-start min-w-0">
                    <Typography variant="h2" weight="extrabold" className="m-0 text-almond-beige text-truncate">
                      Isi Form Pencatatan
                    </Typography>
                    <div class="d-flex align-items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="solid-primary" className="px-2 py-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                        {jenis.name.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="px-2 py-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                        {selectedScope.value === 'kandang' ? 'KANDANG' : 'INDIVIDU DOMBA'}
                      </Badge>
                    </div>
                  </div>
                </Button>
              </div>

              <div class="d-flex gap-2 w-100 justify-content-md-end" style={{ maxWidth: '100%' }}>
                <Button variant="secondary" shape="pill" onClick={goBack} disabled={isSubmitting.value} className="flex-grow-1 flex-md-grow-0 text-center">
                  Batal
                </Button>
                <Button variant="primary" shape="pill" onClick={handleSaved} className="shadow-sm flex-grow-1 flex-md-grow-0 text-center" disabled={isSubmitting.value}>
                  {isSubmitting.value ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>

            {/* Result Feedback */}
            {submitResult.value && (
              <div
                class={['alert rounded-4 border-0 mb-4 animate-fade-in', submitResult.value.success ? 'alert-success' : 'alert-danger']}
                style={submitResult.value.success ? { backgroundColor: 'var(--color-primary-fixed)', color: 'var(--color-primary)' } : {}}
              >
                {submitResult.value.success ? '✅' : '❌'} {submitResult.value.message}
              </div>
            )}

            <div class="row g-4">
              <div class={jenis.id === 'pakan' || jenis.id === 'stok_pakan' || jenis.id === 'perkawinan' ? 'col-lg-8' : 'col-lg-12'}>
                <div class="d-flex flex-column gap-4">
                  {forms.value.map((form, index) => (
                    <div key={index} class="pencatatan-form-card">
                      <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
                        <div class="d-flex align-items-center gap-3">
                          <div class="pencatatan-form-card-header-icon">
                            <img src={jenisIcon} style={{ width: '30px', height: '30px', objectFit: 'contain' }} alt="" />
                          </div>
                          <div>
                            <Typography variant="h4" weight="extrabold" className="m-0">
                              {form.name}
                            </Typography>
                            <Typography variant="p" size="text-xs" color="secondary" className="m-0">
                              Rincian Pencatatan #{index + 1}
                            </Typography>
                          </div>
                        </div>


                      </div>

                      <PencatatanTypeFields jenisId={jenis.id} form={form} showModeToggle={false} />
                    </div>
                  ))}
                </div>
              </div>

              {(jenis.id === 'pakan' || jenis.id === 'stok_pakan' || jenis.id === 'perkawinan') && (
                <div class="col-lg-4">
                  <div class="sticky-top" style={{ top: '2rem' }}>
                    
                    {/* Panel Pakan */}
                    {(jenis.id === 'pakan' || jenis.id === 'stok_pakan') && (
                      <div class="pencatatan-form-card">
                        <div class="d-flex align-items-center gap-2 mb-4">
                          <img src="/icon/inventory.png" style={{ width: '20px', height: '20px', opacity: 0.6 }} alt="" />
                          <Typography variant="h5" weight="extrabold" className="m-0">
                            Informasi Stok Terkait
                          </Typography>
                        </div>

                        <div class="stock-list-compact">
                          {matchedStocks.value.length === 0 ? (
                            <div class="text-center py-4 rounded-2xl bg-surface-container-low text-on-surface-variant small">
                              Tidak ada stok yang sesuai
                            </div>
                          ) : (
                            matchedStocks.value.map((s) => (
                              <div
                                class="d-flex justify-content-between align-items-center p-3 mb-2 rounded-2xl bg-surface-container-low"
                                key={s.id}
                              >
                                <div class="min-w-0">
                                  <Typography
                                    variant="p"
                                    size="text-xs"
                                    weight="extrabold"
                                    className="mb-0 text-truncate d-block"
                                  >
                                    {s.name}
                                  </Typography>
                                  <Typography
                                    variant="span"
                                    style={{ fontSize: '0.65rem' }}
                                    weight="bold"
                                    className="text-muted d-block mt-1 text-truncate"
                                  >
                                    {s.category}
                                  </Typography>
                                </div>
                                <div class="text-end ps-3">
                                  <Badge variant="solid-primary" className="px-2 py-1">
                                    {s.qty} {s.unit}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Panel Perkawinan */}
                    {jenis.id === 'perkawinan' && (
                      <div class="pencatatan-form-card">
                        <div class="d-flex align-items-center gap-2 mb-4">
                          <img src="/icon/catat_kawin.png" style={{ width: '20px', height: '20px', opacity: 0.6 }} alt="" />
                          <Typography variant="h5" weight="extrabold" className="m-0">
                            Info Daftar Ternak
                          </Typography>
                        </div>

                        <div class="stock-list-compact">
                          {/* Indukan Betina */}
                          <Typography variant="p" size="text-xs" weight="bold" className="text-muted mb-2 mt-1 px-2">
                            Betina (Sudah Waktunya Kawin / Birahi)
                          </Typography>
                          {siapKawinBetina.value.length === 0 ? (
                            <div class="text-center py-3 rounded-2xl bg-surface-container-low text-on-surface-variant small mb-3">
                              Tidak ada betina
                            </div>
                          ) : (
                            siapKawinBetina.value.slice(0, 5).map((s) => (
                              <div class="d-flex justify-content-between align-items-center p-3 mb-2 rounded-2xl bg-surface-container-low border border-light" key={s.id}>
                                <div class="min-w-0">
                                  <Typography variant="p" size="text-xs" weight="extrabold" className="mb-0 text-truncate d-block">
                                    {s.name}
                                  </Typography>
                                  <Typography variant="span" style={{ fontSize: '0.65rem' }} weight="bold" className="text-muted d-block mt-1 text-truncate">
                                    {s.code} • {getCageName(s.cage_code)}
                                  </Typography>
                                </div>
                                <div class="text-end ps-3">
                                  <Badge variant="solid-primary" className="px-2 py-1">
                                    Betina
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}

                          {/* Pejantan */}
                          <Typography variant="p" size="text-xs" weight="bold" className="text-muted mb-2 mt-4 px-2">
                            Pejantan Dewasa (Siap Kawin)
                          </Typography>
                          {siapKawinJantan.value.length === 0 ? (
                            <div class="text-center py-3 rounded-2xl bg-surface-container-low text-on-surface-variant small">
                              Tidak ada pejantan
                            </div>
                          ) : (
                            siapKawinJantan.value.slice(0, 5).map((s) => (
                              <div class="d-flex justify-content-between align-items-center p-3 mb-2 rounded-2xl bg-surface-container-low border border-light" key={s.id}>
                                <div class="min-w-0">
                                  <Typography variant="p" size="text-xs" weight="extrabold" className="mb-0 text-truncate d-block">
                                    {s.name}
                                  </Typography>
                                  <Typography variant="span" style={{ fontSize: '0.65rem' }} weight="bold" className="text-muted d-block mt-1 text-truncate">
                                    {s.code} • {getCageName(s.cage_code)}
                                  </Typography>
                                </div>
                                <div class="text-end ps-3">
                                  <Badge variant="secondary" className="px-2 py-1">
                                    Pejantan
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Alert Modal */}
            <CustomAlertModal alert={alertModal.value} onClose={closeAlertModal} />
          </div>
        </div>
      );
    };
  },
});
