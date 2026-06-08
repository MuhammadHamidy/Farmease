import { defineComponent, ref, computed, watch } from 'vue';
import '@/modules/ternak/assets/css/modules/RecordForm.css';
import { activePencatatanForm, selectedPencatatanPayload, cageSession, userSession } from '@/store/navigation';
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

const JENIS_ICONS: Record<string, string> = {
  pakan: '/icon/catat_pakan.png',
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

    const alertModal = ref({
      isOpen: false,
      title: '',
      message: '',
      type: 'error' as 'error' | 'success',
    });

    const closeAlertModal = () => {
      alertModal.value.isOpen = false;
      if (alertModal.value.type === 'success') {
        activePencatatanForm.value = null;
        selectedPencatatanPayload.value = null;
        router.push({ name: 'ternak' });
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
        if (formItem.mode === 'individu' && !formItem.targetId.trim()) return showError('ID Ternak wajib diisi pada mode individu.');
        if (formItem.mode === 'kelompok' && !formItem.targetId.trim()) return showError('ID Kandang wajib diisi.');
        
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
            const male = sheep.value.find(sheepItem => sheepItem.code.toUpperCase() === id2Str);
            const female = sheep.value.find(sheepItem => sheepItem.code.toUpperCase() === id1Str);
            
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

      isSubmitting.value = true;
      submitResult.value = null;

      const payload = {
        type: activePencatatanForm.value?.jenis?.id || 'pencatatan',
        data: {
          items: forms.value,
          summary: `Mencatat ${forms.value.length} rincian ${activePencatatanForm.value?.jenis?.name}`,
        },
      };

      const result = await submitPencatatanSubmission({
        type: payload.type,
        scope: selectedScope.value,
        summary: payload.data.summary,
        payload,
        operatorCode: userSession.value?.code,
        operatorName: userSession.value?.name,
        cageCode: cageSession.value?.code,
        taskId: activePencatatanForm.value?.taskId,
      });

      isSubmitting.value = false;
      submitResult.value = result;

      if (result.success) {
        pencatatanSubmissions.value.unshift({
          id: `SUB-${Date.now().toString().slice(-6)}`,
          type: activePencatatanForm.value?.jenis?.id || 'pencatatan',
          typeLabel: activePencatatanForm.value?.jenis?.name || 'Pencatatan',
          operatorCode: userSession.value?.code || 'OPT001',
          operatorName: userSession.value?.name || 'Operator Ternak',
          cageCode: cageSession.value?.code || 'A',
          scope: selectedScope.value,
          summary: payload.data.summary,
          payload: payload,
          submittedAt: Date.now(),
          approvalStatus: 'pending',
          taskId: activePencatatanForm.value?.taskId,
        } as any);

        alertModal.value = {
          isOpen: true,
          title: 'Berhasil Dikirim',
          message: `Pencatatan ${activePencatatanForm.value?.jenis?.name} berhasil dimasukkan ke antrean persetujuan!`,
          type: 'success'
        };

        selectedPencatatanPayload.value = payload;
      }
    };

    const goBack = () => {
      activePencatatanForm.value = null;
    };

    const matchedStocks = computed(() => {
      const type = activePencatatanForm.value?.jenis?.id || '';
      return stocks.value.filter(
        (s) =>
          ((type === 'pakan' || type === 'stok_pakan') && (s.category === 'hijauan' || s.category === 'konsentrat')) ||
          (type === 'kesehatan' && s.category === 'vitamin') ||
          (type === 'kotoran' && s.category === 'kotoran'),
      );
    });

    return () => {
      const jenis = activePencatatanForm.value?.jenis;
      if (!jenis) return null;

      const jenisIcon = JENIS_ICONS[jenis.id] || '/icon/catat_kotoran.png';

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
              <div class={jenis.id === 'pakan' || jenis.id === 'stok_pakan' ? 'col-lg-8' : 'col-lg-12'}>
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

              {(jenis.id === 'pakan' || jenis.id === 'stok_pakan') && (
                <div class="col-lg-4">
                  <div class="sticky-top" style={{ top: '2rem' }}>
                    <div class="pencatatan-form-card">
                      <div class="d-flex align-items-center gap-2 mb-4">
                        <img src="/icon/statistic.png" style={{ width: '20px', height: '20px', opacity: 0.6 }} alt="" />
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
                  </div>
                </div>
              )}
            </div>

            {/* Custom Alert Modal */}
            {alertModal.value.isOpen && (
              <div class="peternakan-modal-overlay" style={{ zIndex: 1050, alignItems: 'center' }} onClick={alertModal.value.type === 'error' ? closeAlertModal : undefined}>
                <div class="peternakan-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', backgroundColor: '#fff', borderRadius: '24px', animation: 'scaleUp 0.3s ease' }}>
                  <div class="p-4 text-center">
                    <div style={{ marginBottom: '1.5rem' }}>
                      {alertModal.value.type === 'error' ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: 'var(--color-danger-transparent)', color: 'var(--color-danger)', borderRadius: '50%' }}>
                          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>!</span>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: 'var(--color-success-transparent)', color: 'var(--color-success-dark)', borderRadius: '50%' }}>
                          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>✓</span>
                        </div>
                      )}
                    </div>
                    
                    <h4 style={{ fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.25rem', color: 'var(--color-gray-900)' }}>
                      {alertModal.value.title}
                    </h4>
                    
                    <p style={{ color: 'var(--color-gray-500)', marginBottom: '1.5rem', whiteSpace: 'pre-line', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {alertModal.value.message}
                    </p>

                    <button style={{ width: '100%', padding: '0.75rem', borderRadius: '50rem', backgroundColor: 'var(--color-button-primary)', color: '#fff', border: 'none', fontWeight: 'bold' }} onClick={closeAlertModal}>
                      {alertModal.value.type === 'error' ? 'Mengerti' : 'Selesai'}
                    </button>
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
