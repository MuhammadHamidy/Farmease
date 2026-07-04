import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import '@/modules/ternak/assets/css/modules/RecordForm.css';
import { activePencatatanForm, selectedPencatatanPayload, cageSession, userSession, cagesList, fetchCagesList, prefilledPencatatanSheepId, prefilledPencatatanCageCode } from '@/store/navigation';
import { operatorTasks, submitPencatatanSubmission } from '@/store/operatorAdmin';
import { pencatatanSubmissions, fetchSubmissions } from '@/modules/ternak/store/operatorAdmin';
import { stocks, fetchStocks } from '@/modules/ternak/store/peternakan';
import { sheep, fetchSheep } from '@/store/livestock';
import { feedsApi, breedingApi, pregnancyApi } from '@/shared/api';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import SubmitButton from '@/shared/ui/SubmitButton';
import BackButton from '@/shared/ui/BackButton';
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
      forms.value = rincianItems.value.map((item: { id: string; name: string; mode?: string }) => {
        let forcedMode = selectedScope.value === 'kandang' ? 'kelompok' : 'individu';
        const jenisId = activePencatatanForm.value?.jenis?.id;
        if (jenisId === 'kotoran') {
          forcedMode = 'kelompok';
        } else if (['berat_badan', 'perkawinan', 'kelahiran'].includes(jenisId)) {
          forcedMode = 'individu';
        }

        return {
          id: item.id,
          name: item.name,
          mode: forcedMode as PencatatanMode,
          targetId: prefilledPencatatanSheepId.value || '',
          qty: '',
          unit: 'kg',
          note: '',
          tindakan: '',
          obat: '',
          vitaminAmount: '',
          kotoranState: 'campur',
          idPejantan: '',
          metoda: jenisId === 'pakan' ? 'dadakan' : (((item.name === 'IB' || item.name === 'Inseminasi Buatan') ? 'ib' : 'alami')),
          jumlahAnak: '',
          kondisiInduk: 'Sehat',
          kondisiAnak: 'sehat',
          tanggal: new Date().toISOString().split('T')[0],
          pemanfaatan: 'Pupuk Organik Kebun',
          kandangAnak: '',
          namaAnak: '',
          sheepCode: '',
          genderAnak: 'jantan',
          beratLahir: '',
          asalSemen: '',
          namaInseminator: '',
          waktuIB: new Date().toISOString().slice(0, 16), // local datetime string format
          sumberPejantan: 'internal',
          donorName: '',
          donorOrigin: '',
          idMating: activePencatatanForm.value?.idMating || '',
          metodePemeriksaan: 'manual',
          hasilPemeriksaan: 'masih_menunggu',
          hijauan: '',
          energi: '',
          protein: '',
          mineral: '',
          selectedCageCode: prefilledPencatatanCageCode.value || '',
          petugas: '',
        };
      });

      // Clear prefilled values after mapping
      prefilledPencatatanSheepId.value = null;
      prefilledPencatatanCageCode.value = null;

      forms.value.forEach((f) => {
        if (f.mode === 'kelompok' || activePencatatanForm.value?.jenis?.id === 'kotoran') {
          const linkedTask = activePencatatanForm.value?.taskId 
            ? operatorTasks.value.find(t => String(t.id) === String(activePencatatanForm.value.taskId)) 
            : null;
          if (linkedTask && linkedTask.cageCode) {
            f.targetId = linkedTask.cageCode;
          } else if (cageSession.value?.code) {
            f.targetId = cageSession.value.code;
          }
        } else {
          if (cageSession.value?.code) {
            f.selectedCageCode = cageSession.value.code;
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

    const activeMatings = ref<any[]>([]);
    const fetchActiveMatings = async () => {
      try {
        const list = await breedingApi.getMatingList({ status: 'proses' });
        activeMatings.value = list || [];
      } catch (err) {
        console.error('Failed to fetch active matings:', err);
      }
    };

    const pregnancies = ref<any[]>([]);
    const fetchPregnancies = async () => {
      try {
        const res = await pregnancyApi.getList();
        pregnancies.value = res || [];
      } catch (err) {
        console.error('Failed to fetch pregnancies:', err);
      }
    };

    const pregnantCageSheepList = computed(() => {
      const activeCode = forms.value[0]?.selectedCageCode || cageSession.value?.code || '';
      if (!activeCode) return [];
      
      return sheep.value
        .filter(s => s.cage_code === activeCode && s.gender === 'betina' && s.status === 'Hamil')
        .map(s => {
          const targetIdStr = String(s.id);
          const foundPreg = pregnancies.value.find((p: any) => {
            const idMother = String(p.id_sheep || p.mother_sheep?.id_sheep || p.dam_sheep?.id_sheep || p.id_sheep_female || '');
            const statusStr = (p.status || p.pregnancy_status || '').toLowerCase();
            const isActive = statusStr === 'dikandung' || statusStr === 'hamil' || statusStr === 'aktif';
            return idMother === targetIdStr && isActive;
          });
          
          let startDate = foundPreg 
            ? new Date(foundPreg.pregnancy_start_date || foundPreg.created_at)
            : new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000);
            
          if (isNaN(startDate.getTime()) || startDate.getFullYear() <= 1970) {
            startDate = new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000);
          }
            
          const hpl = new Date(startDate.getTime() + 150 * 24 * 60 * 60 * 1000);
          const today = new Date();
          today.setHours(0,0,0,0);
          hpl.setHours(0,0,0,0);
          const diffTime = hpl.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let countdownText = '';
          if (diffDays > 0) countdownText = `H-${diffDays} Hari`;
          else if (diffDays === 0) countdownText = 'HPL Hari Ini';
          else countdownText = `Lewat HPL ${Math.abs(diffDays)} Hari`;

          return {
            id: s.id,
            code: s.code,
            name: s.name,
            countdownText,
            hpl: hpl.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
            cage_code: s.cage_code
          };
        });
    });

    // Fetch stocks when form opens
    watch(
      () => activePencatatanForm.value?.jenis?.id,
      (jenisId) => {
        if (jenisId) {
          fetchStocks();
          if (jenisId === 'pakan' || jenisId === 'stok_pakan' || jenisId === 'perkawinan') {
            fetchSubmissions();
          }
          if (jenisId === 'perkawinan') {
            fetchActiveMatings();
          }
          if (jenisId === 'kelahiran') {
            fetchPregnancies();
          }
        }
      },
      { immediate: true },
    );

    onMounted(() => {
      if (!activePencatatanForm.value) {
        router.push({ name: 'ternak-pencatatan' });
      }
      if (cagesList.value.length === 0) {
        fetchCagesList();
      }
      if (sheep.value.length === 0) {
        fetchSheep();
      }
      fetchPregnancies();
    });

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
        recapPayload.value = null;
        showRecap.value = false;
        router.push({ name: 'ternak-pencatatan' });
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
        cageCode: cageSession.value?.code || displayCageCode.value,
        taskId: activePencatatanForm.value?.taskId,
      });

      isSubmitting.value = false;

      if (result.success) {
        alertModal.value = {
          isOpen: true,
          title: 'Berhasil',
          message: result.message,
          type: 'success',
        };
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
          const requestedQty = parseFloat(f.qty) || 0;
          if (requestedQty <= 0) continue;

          if (f.metoda === 'dadakan') {
            // Pakan Dadakan (Validate only selected feeds)
            const feedsToCheck = [];
            const scale = f.hijauan ? 0.104 : 0.0312;
            if (f.energi) feedsToCheck.push({ name: f.energi, pct: 0.018 / scale, label: 'Energi' });
            if (f.protein) feedsToCheck.push({ name: f.protein, pct: 0.0108 / scale, label: 'Protein' });
            if (f.mineral) feedsToCheck.push({ name: f.mineral, pct: 0.0024 / scale, label: 'Mineral' });
            if (f.hijauan) feedsToCheck.push({ name: f.hijauan, pct: 0.0728 / scale, label: 'Hijauan' });

            for (const item of feedsToCheck) {
              const reqAmount = requestedQty * item.pct;
              const stockItem = stocks.value.find((s: any) => s.name.toLowerCase() === item.name.toLowerCase());
              if (!stockItem || stockItem.qty < reqAmount) {
                isStockInsufficient = true;
                insufficientMessage = `Stok pakan ${item.label} "${item.name}" tidak mencukupi!\nTersedia: ${stockItem ? stockItem.qty.toFixed(2) : 0} kg\nDibutuhkan (proporsional): ${reqAmount.toFixed(2)} kg.`;
                break;
              }
            }
            if (isStockInsufficient) break;
          } else {
            // Pakan Silase / Stok
            const feedName = f.obat;
            if (feedName) {
              const stockItem = stocks.value.find((s: any) => s.name.toLowerCase() === feedName.toLowerCase());
              if (!stockItem || stockItem.qty < requestedQty) {
                isStockInsufficient = true;
                insufficientMessage = `Stok pakan "${feedName}" tidak mencukupi!\nTersedia: ${stockItem ? stockItem.qty : 0} kg\nDibutuhkan: ${requestedQty} kg.`;
                break;
              }
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

      if (activePencatatanForm.value?.jenis?.id === 'stok_pakan') {
        let isStockInsufficient = false;
        let insufficientMessage = '';

        for (const f of forms.value) {
          if (f.name === 'Konversi Pakan') {
            const rawFeed = f.hijauan;
            const energyFeed = f.energi;
            const proteinFeed = f.protein;
            const mineralFeed = f.mineral;
            const targetQty = parseFloat(f.qty) || 0;

            if (rawFeed && energyFeed && proteinFeed && mineralFeed && targetQty > 0) {
              const reqRaw = targetQty * 0.7;
              const reqEnergy = targetQty * 0.3 * (0.0180 / 0.0312);
              const reqProtein = targetQty * 0.3 * (0.0108 / 0.0312);
              const reqMineral = targetQty * 0.3 * (0.0024 / 0.0312);

              const checkItems = [
                { name: rawFeed, req: reqRaw, label: 'Pakan Mentah', pct: '70%' },
                { name: energyFeed, req: reqEnergy, label: 'Pakan Energi (Additive)', pct: '17.3%' },
                { name: proteinFeed, req: reqProtein, label: 'Pakan Protein', pct: '10.4%' },
                { name: mineralFeed, req: reqMineral, label: 'Pakan Mineral', pct: '2.3%' }
              ];

              for (const item of checkItems) {
                const stockItem = stocks.value.find((s: any) => s.name.toLowerCase() === item.name.toLowerCase());
                if (!stockItem || stockItem.qty < item.req) {
                  isStockInsufficient = true;
                  insufficientMessage = `Stok ${item.label} "${item.name}" tidak mencukupi!\nTersedia: ${stockItem ? stockItem.qty.toFixed(2) : 0} kg\nDibutuhkan (${item.pct}): ${item.req.toFixed(2)} kg.`;
                  break;
                }
              }
              if (isStockInsufficient) break;
            }
          }
        }

        if (isStockInsufficient) {
          alertModal.value = {
            isOpen: true,
            title: 'Stok Tidak Mencukupi',
            message: `${insufficientMessage}\n\nMohon sesuaikan target atau tambahkan stok terlebih dahulu.`,
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
            if (activeCage && foundSheep.cage_code !== activeCage && categoryId !== 'perkawinan') {
               return showError(`Domba "${formItem.targetId}" tidak berada di Kandang ${activeCage}.`);
            }
          } else if (formItem.mode === 'kelompok' && !formItem.targetId.trim()) {
            return showError('ID Kandang wajib diisi.');
          }
        }
        
        if (categoryId === 'pakan') {
          if (formItem.metoda === 'dadakan') {
            const hasIngredients = formItem.hijauan || formItem.energi || formItem.protein || formItem.mineral;
            if (!hasIngredients) {
              return showError('Minimal satu jenis pakan wajib dipilih untuk pakan dadakan.');
            }
            if (!formItem.qty) {
              return showError('Total jumlah pakan wajib diisi.');
            }
          } else {
            if (!formItem.obat || !formItem.qty) {
              return showError('Jenis pakan dan jumlah pakan wajib diisi.');
            }
          }
        }
        if (categoryId === 'stok_pakan') {
          const isConversion = formItem.name === 'Konversi Pakan';
          if (!isConversion && (!formItem.obat || !formItem.qty)) return showError('Nama pakan sumber dan jumlah masuk wajib diisi.');
          if (isConversion && (!formItem.hijauan || !formItem.energi || !formItem.protein || !formItem.mineral || !formItem.qty)) {
            return showError('Semua field konversi pakan (Pakan Mentah dan ketiga Pakan Tambahan) wajib diisi.');
          }
        }
        if (categoryId === 'kesehatan') {
          const isCheckup = formItem.name === 'Pemeriksaan Rutin' || formItem.name === 'Pemeriksaan Kesehatan';
          if (isCheckup) {
            if (!formItem.tindakan || !formItem.tindakan.trim()) {
              return showError('Kolom Diagnosa wajib diisi.');
            }
            if (!formItem.obat || !formItem.obat.trim()) {
              return showError('Kolom Tindakan wajib diisi.');
            }
          } else {
            if (!formItem.tindakan || !formItem.tindakan.trim()) {
              return showError('Kolom tindakan penanganan medis wajib diisi.');
            }
            if (!formItem.obat || !formItem.obat.trim() || !formItem.vitaminAmount || Number(formItem.vitaminAmount) <= 0) {
              return showError('Nama obat/vitamin dan dosis realisasi wajib diisi.');
            }
          }
        }
        if (categoryId === 'kotoran' && !formItem.qty) return showError('Jumlah produksi kotoran wajib diisi.');
        if (categoryId === 'perkawinan') {
          if (formItem.name === 'Kontrol Kebuntingan') {
            if (!formItem.idMating) return showError('Data Perkawinan wajib dipilih.');
            if (!formItem.metodePemeriksaan) return showError('Metode Pemeriksaan wajib dipilih.');
            if (!formItem.hasilPemeriksaan) return showError('Hasil Pemeriksaan wajib dipilih.');
          } else if (formItem.name === 'Cek Birahi' || formItem.name === 'Pencatatan Birahi' || formItem.name === 'Pengecekan Birahi') {
            if (!formItem.hasilPemeriksaan) return showError('Hasil Cek Birahi wajib dipilih.');
          } else {
            const isExternalIB = formItem.metoda === 'ib' && formItem.sumberPejantan === 'eksternal';
            if (!isExternalIB && !formItem.idPejantan) return showError('ID Pejantan wajib diisi.');
            if (isExternalIB && !formItem.donorName?.trim()) return showError('Nama / Kode Pejantan Donor wajib diisi.');
            if (isExternalIB && !formItem.donorOrigin?.trim()) return showError('Asal Donor / Balai Inseminasi wajib diisi.');
            if (formItem.metoda === 'ib') {
              if (!formItem.asalSemen?.trim()) return showError('Asal Semen (No batch/straw) wajib diisi untuk Inseminasi Buatan.');
              if (!formItem.namaInseminator?.trim()) return showError('Nama Inseminator wajib diisi untuk Inseminasi Buatan.');
              if (!formItem.waktuIB) return showError('Tanggal dan Jam IB wajib diisi untuk Inseminasi Buatan.');
            }
          }
        }
        if (categoryId === 'kelahiran') {
          if (formItem.name === 'Keguguran') {
            if (!formItem.tanggal) {
              return showError('Tanggal keguguran wajib diisi.');
            }
          } else {
            if (!formItem.jumlahAnak || !formItem.idPejantan || !formItem.namaAnak || !formItem.sheepCode || !formItem.kandangAnak || !formItem.tanggal || !formItem.beratLahir) {
              return showError('Seluruh data kelahiran anak (ID Pejantan, Nama Anak, Kode Ear Tag Anak, Kandang Anak, Tanggal Lahir, Berat, dan Jumlah) wajib diisi.');
            }
            const numAnak = Number(formItem.jumlahAnak) || 0;
            const numBerat = Number(formItem.beratLahir) || 0;
            if (numAnak < 1 || numBerat <= 0) {
              return showError('Jumlah anak dan berat lahir harus bernilai positif.');
            }
            // Check if mother and father are the same sheep
            const motherClean = formItem.targetId.trim().toUpperCase();
            const fatherClean = formItem.idPejantan.trim().toUpperCase();
            const motherSheep = sheep.value.find(s => s.code.toUpperCase() === motherClean || String(s.id) === motherClean);
            const fatherSheep = sheep.value.find(s => s.code.toUpperCase() === fatherClean || String(s.id) === fatherClean);
            if (motherClean === fatherClean || (motherSheep && fatherSheep && motherSheep.id === fatherSheep.id)) {
              return showError('Induk jantan dan induk betina tidak boleh domba yang sama.');
            }
            // Check if code / ear tag already exists in active sheep list
            const codeExists = sheep.value.some(s => s.code.toUpperCase() === formItem.sheepCode.trim().toUpperCase() && !['Mati', 'Terjual', 'Disembelih'].includes(s.status));
            if (codeExists) {
              return showError(`Kode Ear Tag Anak "${formItem.sheepCode}" sudah terdaftar untuk domba lain yang masih aktif.`);
            }
            // Validate cage capacity
            const cage = cagesList.value.find(c => c.code === formItem.kandangAnak);
            const capacity = cage?.capacity || 50;
            const currentSheepCount = sheep.value.filter(s => s.cage_code === formItem.kandangAnak && !['Mati', 'Terjual', 'Disembelih'].includes(s.status)).length;
            if (currentSheepCount >= capacity) {
              alertModal.value = {
                isOpen: true,
                title: 'Kandang Penuh',
                message: `Gagal mencatat kelahiran. Kandang "${formItem.kandangAnak}" sudah penuh (${currentSheepCount}/${capacity} ekor). Silakan pindahkan sebagian domba atau pilih kandang lain.`,
                type: 'error'
              };
              return;
            }
          }
        }
        if (categoryId === 'berat_badan' && !formItem.qty) return showError('Berat badan wajib diisi.');
      }

      if (activePencatatanForm.value?.jenis?.id === 'perkawinan') {
        let isInbreedingRisk = false;
        let inbreedingMessage = '';

        const getAgeInMonths = (birthDateStr?: string) => {
          if (!birthDateStr) return 0;
          const bd = new Date(birthDateStr);
          if (isNaN(bd.getTime())) return 0;
          const now = new Date();
          return (now.getFullYear() - bd.getFullYear()) * 12 + (now.getMonth() - bd.getMonth());
        };

        for (const formEntry of forms.value) {
          if (formEntry.name === 'Kontrol Kebuntingan' || formEntry.name === 'Cek Birahi' || formEntry.name === 'Pencatatan Birahi' || formEntry.name === 'Pengecekan Birahi') continue;
          const id1Str = String(formEntry.targetId || '').trim().toUpperCase();
          const id2Str = String(formEntry.idPejantan || '').trim().toUpperCase();
          
          if (id1Str && id2Str) {
            const s1 = sheep.value.find(s => String(s.id).toUpperCase() === id1Str || String(s.code).toUpperCase() === id1Str);
            const s2 = sheep.value.find(s => String(s.id).toUpperCase() === id2Str || String(s.code).toUpperCase() === id2Str);
            
            if (!s1 || !s2) {
              alertModal.value = {
                isOpen: true, title: 'Validasi Gagal', message: 'ID Domba pejantan atau induk tidak ditemukan di database.', type: 'error'
              };
              return;
            }

            const male = s1.gender === 'jantan' ? s1 : (s2.gender === 'jantan' ? s2 : null);
            const female = s1.gender === 'betina' ? s1 : (s2.gender === 'betina' ? s2 : null);

            if (!male || !female) {
              alertModal.value = {
                isOpen: true, title: 'Validasi Gagal', message: 'Harus memilih satu domba jantan dan satu domba betina untuk perkawinan.', type: 'error'
              };
              return;
            }

            // check if female has been estrus-checked
            if (female.mating_status === 'Belum Cek Birahi' || female.mating_status === 'Belum Pencatatan Birahi') {
              alertModal.value = {
                isOpen: true,
                title: 'Belum Pencatatan Birahi',
                message: `Domba betina ${female.code} belum dicatat birahinya.\nSilakan lakukan Pencatatan Birahi terlebih dahulu sebelum mencatat perkawinan.`,
                type: 'error'
              };
              return;
            }

            // check if female weight has been inputted (robust check: 0, empty, or no unit)
            const femaleWeightVal = female.weight ? parseFloat(String(female.weight).replace(/[^0-9.]/g, '')) : 0;
            if (isNaN(femaleWeightVal) || femaleWeightVal <= 0) {
              alertModal.value = {
                isOpen: true,
                title: 'Validasi Gagal',
                message: `Gagal mencatat perkawinan. Domba betina ${female.code} (${female.name}) belum di-inputkan berat badan. Silakan catat berat badan terlebih dahulu.`,
                type: 'error'
              };
              return;
            }

            // check if female is underage
            const femaleAgeMonths = getAgeInMonths(female.birth_date);
            if (female.mating_status === 'Tidak (Belum Cukup Umur)' || (femaleAgeMonths > 0 && femaleAgeMonths < 8)) {
              alertModal.value = {
                isOpen: true,
                title: 'Gagal Menyimpan',
                message: `Gagal menyimpan data perkawinan.\nInduk Betina ${female.code} masih di bawah umur.\nStatus: Belum Cukup Umur (umur: ${female.age || 'di bawah 8 bulan'}).`,
                type: 'error'
              };
              return;
            }

            // check if male is underage
            const maleAgeMonths = getAgeInMonths(male.birth_date);
            if (male.mating_status === 'Tidak (Belum Cukup Umur)' || (maleAgeMonths > 0 && maleAgeMonths < 12)) {
              alertModal.value = {
                isOpen: true,
                title: 'Gagal Menyimpan',
                message: `Gagal menyimpan data perkawinan.\nPejantan ${male.code} masih di bawah umur.\nStatus: Belum Cukup Umur (umur: ${male.age || 'di bawah 12 bulan'}).`,
                type: 'error'
              };
              return;
            }

            // check other readiness restrictions for female
            // Also accept if local submission shows birahi (even if not yet admin-approved)
            const femaleHasLocalBirahi = checkIsSheepBirahi(female);
            if (!femaleHasLocalBirahi && !female.is_ready_to_mate && female.mating_status && female.mating_status !== 'Siap Kawin' && !female.mating_status.includes('Birahi') && female.mating_status !== 'Belum Pencatatan Birahi') {
              alertModal.value = {
                isOpen: true,
                title: 'Gagal Menyimpan',
                message: `Gagal menyimpan data perkawinan.\nInduk Betina ${female.code} (${female.name}) tidak dapat dikawinkan.\nStatus: ${female.mating_status}.`,
                type: 'error'
              };
              return;
            }

            // check other readiness restrictions for male
            if (!male.is_ready_to_mate && male.mating_status && male.mating_status !== 'Siap Kawin') {
              alertModal.value = {
                isOpen: true,
                title: 'Gagal Menyimpan',
                message: `Gagal menyimpan data perkawinan.\nPejantan ${male.code} tidak siap kawin.\nStatus: ${male.mating_status}.`,
                type: 'error'
              };
              return;
            }

            try {
              const breedingCheckResult = await breedingApi.checkInbreeding(male.id, female.id);
              if (breedingCheckResult?.inbreeding_flag) {
                isInbreedingRisk = true;
                inbreedingMessage = `Perkawinan antara betina ${female.code} (${female.name}) dan pejantan ${male.code} (${male.name}) memiliki risiko inbreeding tinggi.\nKategori: ${breedingCheckResult.risk_category || 'Tinggi'} (${breedingCheckResult.inbreeding_percentage?.toFixed(2)}%).`;
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
      showRecap.value = false;
      recapPayload.value = null;
      activePencatatanForm.value = null;
      router.push({ name: 'ternak-pencatatan' });
    };

    const matchedStocks = computed(() => {
      const type = activePencatatanForm.value?.jenis?.id || '';
      // For pakan, filter by the current form's metoda
      const currentMetoda = forms.value[0]?.metoda || 'dadakan';

      if (type === 'pakan') {
        if (currentMetoda === 'silase') {
          // Only show silase-type stocks when silase method selected
          return stocks.value
            .filter(s => s.category === 'silase' || s.name.toLowerCase().includes('silase') || s.name.toLowerCase().includes('cacah'))
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentMetoda === 'hijauan_kebun') {
          // Only show raw garden clippings/greenery
          return stocks.value
            .filter(s => s.category === 'greenery' || s.name.toLowerCase().includes('mentah') || s.name.toLowerCase().includes('kebun') || s.name.toLowerCase().includes('pemangkasan'))
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name));
        } else {
          // dadakan: show hijauan + konsentrat + pellet
          return stocks.value
            .filter(s => s.category === 'hijauan' || s.category === 'konsentrat' || s.category === 'pellet' || s.category === 'greenery')
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name));
        }
      }

      if (type === 'stok_pakan') {
        // Show all pakan stocks (raw materials for konversi, and silase for tambah stok)
        return stocks.value
          .filter(s => s.category === 'hijauan' || s.category === 'konsentrat' || s.category === 'pellet' || s.category === 'greenery' || s.category === 'silase')
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name));
      }

      return stocks.value
        .filter(
          (s) =>
            (type === 'kesehatan' && s.category === 'vitamin') ||
            (type === 'kotoran' && s.category === 'kotoran'),
        )
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name));
    });

    const selectedFeedNames = computed(() => {
      const names = new Set<string>();
      forms.value.forEach(f => {
        if (activePencatatanForm.value?.jenis?.id === 'pakan') {
          if (f.metoda === 'silase' || f.metoda === 'hijauan_kebun') {
            if (f.obat) names.add(f.obat.toLowerCase());
          } else {
            if (f.hijauan) names.add(f.hijauan.toLowerCase());
            if (f.energi) names.add(f.energi.toLowerCase());
            if (f.protein) names.add(f.protein.toLowerCase());
            if (f.mineral) names.add(f.mineral.toLowerCase());
          }
        } else if (activePencatatanForm.value?.jenis?.id === 'stok_pakan') {
          if (f.name === 'Konversi Pakan') {
            if (f.hijauan) names.add(f.hijauan.toLowerCase());
            if (f.energi) names.add(f.energi.toLowerCase());
            if (f.protein) names.add(f.protein.toLowerCase());
            if (f.mineral) names.add(f.mineral.toLowerCase());
            if (f.obat) names.add(f.obat.toLowerCase());
          } else {
            if (f.obat) names.add(f.obat.toLowerCase());
          }
        }
      });
      return names;
    });

    const getCageName = (code: string) => {
      const cage = cagesList.value.find(c => c.code === code);
      return cage ? cage.name : `Kandang ${code}`;
    };

    const displayCageCode = computed(() => {
      if (cageSession.value?.code) return cageSession.value.code;
      if (forms.value.length > 0) {
        const firstForm = forms.value[0];
        if (firstForm) {
          if (firstForm.mode === 'kelompok' && firstForm.targetId) {
            return firstForm.targetId;
          } else if (firstForm.targetId) {
            const targetClean = firstForm.targetId.trim().toUpperCase();
            const sheepObj = sheep.value.find(s => s.code.toUpperCase() === targetClean || String(s.id) === targetClean);
            if (sheepObj && sheepObj.cage_code) {
              return sheepObj.cage_code;
            }
          }
        }
      }
      return undefined;
    });

    const displayCageName = computed(() => {
      if (cageSession.value?.name) return cageSession.value.name;
      if (cageSession.value?.code) return getCageName(cageSession.value.code);
      const codeFallback = displayCageCode.value;
      if (codeFallback) {
        return getCageName(codeFallback);
      }
      return '—';
    });

    const currentSelectedCageCode = computed(() => {
      const perkawinanForm = forms.value.find(f => f.selectedCageCode || (f.mode === 'kelompok' && f.targetId));
      if (perkawinanForm) {
        return perkawinanForm.selectedCageCode || (perkawinanForm.mode === 'kelompok' ? perkawinanForm.targetId : '');
      }
      return cageSession.value?.code || '';
    });

    const checkIsSheepBirahi = (s: any) => {
      if (!s) return false;
      // Check local submissions first (works even if pending admin approval)
      for (const sub of pencatatanSubmissions.value) {
        if (sub.approvalStatus === 'rejected') continue;
        const dataObj: any = (sub.payload as any)?.data || sub.payload;
        const items = dataObj?.items || [];
        for (const item of items) {
          const isEstrusCheck = item.name === 'Cek Birahi' || item.name === 'Pencatatan Birahi' || item.name === 'Pengecekan Birahi';
          if (isEstrusCheck && (String(item.targetId) === String(s.code) || String(item.targetId) === String(s.id))) {
            // If there's any birahi submission for this sheep, check the result
            if (item.hasilPemeriksaan === 'birahi') return true;
            if (item.hasilPemeriksaan && item.hasilPemeriksaan !== 'birahi') return false;
          }
        }
      }
      // Fallback to backend flag (for fully approved submissions)
      return !!s.is_ready_to_mate;
    };

    const siapKawinBetina = computed(() => {
      const cageCode = currentSelectedCageCode.value;
      
      const hasSelectedMale = forms.value.some((f) => {
        if (!f.idPejantan) return false;
        const sh = sheep.value.find(s => String(s.id) === String(f.idPejantan) || String(s.code).toUpperCase() === String(f.idPejantan).trim().toUpperCase());
        return sh && sh.gender === 'jantan';
      });

      return sheep.value.filter((s) => {
        if (s.gender !== 'betina') return false;
        if (!hasSelectedMale && cageCode && s.cage_code !== cageCode) return false;
        
        // Exclude already mated or pending mating sheeps
        const isActiveMated = activeMatings.value.some(m => String(m.id_sheep_female) === String(s.id));
        const isPendingMated = pencatatanSubmissions.value.some(sub => {
          if (sub.approvalStatus === 'rejected') return false;
          const dataObj: any = (sub.payload as any)?.data || sub.payload;
          const items = dataObj?.items || [];
          return items.some((item: any) => {
            if (item.name === 'Kawin Alam' || item.name === 'Kawin Alami' || item.name === 'IB' || item.name === 'Inseminasi Buatan') {
              const targetVal = item.targetId || item.idSheepFemale || item.id_sheep_female;
              return String(targetVal) === String(s.id) || String(targetVal) === String(s.code);
            }
            return false;
          });
        });
        if (isActiveMated || isPendingMated) return false;

        return checkIsSheepBirahi(s);
      });
    });

    const siapKawinJantan = computed(() => {
      return sheep.value.filter((s) => {
        if (s.gender !== 'jantan') return false;
        return checkIsSheepBirahi(s);
      });
    });

    const cageActiveMatings = computed(() => {
      const activeCage = currentSelectedCageCode.value;
      if (!activeCage) return activeMatings.value;
      return activeMatings.value.filter((m) => {
        const female = sheep.value.find((s) => String(s.id) === String(m.id_sheep_female));
        return female && female.cage_code === activeCage;
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
                  background: 'linear-gradient(135deg, #5d4e41 0%, #3D2F24 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', padding: '0', overflow: 'hidden'
                }}>
                  <img src={jenisIcon} style={{ width: '36px', height: '36px', objectFit: 'contain', display: 'block', margin: '0', padding: '0', verticalAlign: 'middle' }} alt="" />
                </div>
                <Typography variant="h3" weight="extrabold" className="m-0 text-almond-beige">Konfirmasi Kirim Persetujuan</Typography>
                <Typography variant="p" size="text-sm" color="secondary" className="mt-2 mb-0">
                  Harap periksa dan pastikan seluruh rincian form pencatatan di bawah ini telah sesuai sebelum dikirim ke Admin untuk disetujui.
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
                    <span style={{ fontWeight: '700', color: '#1a1a1a' }}>{displayCageName.value}</span>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', alignItems: 'center', marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px dashed #E6D9CE' }}>
                      <span style={{ color: '#6C757D', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <img src="/icon/rutin_task.png" style={{ width: '16px', height: '16px', objectFit: 'contain' }} alt="" />
                        Tugas Rutin
                      </span>
                      <span style={{ fontWeight: '700', color: '#30360E', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {activePencatatanForm.value?.rincian?.[0]?.name || 'Tugas Terkait'}
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#FCF3CF', color: '#B7950B', borderRadius: '6px', fontWeight: '700' }}>
                          Menunggu Validasi
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items detail */}
              {items.map((item: any, idx: number) => {
                const isCage = item.mode === 'kelompok' || activePencatatanForm.value?.scope === 'kandang';
                const targetLabel = isCage ? 'ID Kandang' : 'ID Domba';

                let qtyLabel = 'Jumlah';
                if (jenis.id === 'pakan') qtyLabel = 'Jumlah Pakan';
                else if (jenis.id === 'stok_pakan') qtyLabel = 'Jumlah Masuk';
                else if (jenis.id === 'kotoran') qtyLabel = 'Jumlah Produksi';
                else if (jenis.id === 'berat_badan') qtyLabel = 'Berat Badan';
                else if (jenis.id === 'kelahiran') qtyLabel = 'Berat Lahir';

                return (
                  <div key={idx} style={{
                    background: '#FAFAF8', borderRadius: '14px', padding: '1rem',
                    border: '1px solid #E6D9CE', marginBottom: '0.75rem'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Rincian #{idx + 1} — {item.name}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {item.targetId && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>{targetLabel}</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>
                            : {(() => {
                              if (item.mode === 'kelompok') return item.targetId;
                              const s = sheep.value.find(x => String(x.id) === String(item.targetId) || String(x.code) === String(item.targetId));
                              return s ? `[${s.code}] ${s.name}` : item.targetId;
                            })()}
                          </span>
                        </div>
                      )}
                      {item.qty && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>{qtyLabel}</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.qty} {item.unit || ''}</span>
                        </div>
                      )}
                      {jenis.id === 'pakan' && item.metoda !== 'silase' ? (
                        <>
                          <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                            <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Hijauan</span>
                            <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.hijauan}</span>
                          </div>
                          <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                            <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Sumber Energi</span>
                            <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.energi}</span>
                          </div>
                          <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                            <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Sumber Protein</span>
                            <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.protein}</span>
                          </div>
                          <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                            <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Pemberian Mineral</span>
                            <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.mineral}</span>
                          </div>
                        </>
                      ) : item.name === 'Konversi Pakan' ? (
                        <>
                          <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                            <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Pakan Mentah Asal</span>
                            <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.hijauan}</span>
                          </div>
                          <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                            <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Pakan Tambahan (Energi)</span>
                            <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.energi}</span>
                          </div>
                          <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                            <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Pakan Tambahan (Protein)</span>
                            <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.protein}</span>
                          </div>
                          <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                            <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Pakan Tambahan (Mineral)</span>
                            <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.mineral}</span>
                          </div>
                          <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                            <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Hasil Konversi Jadi</span>
                            <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.obat}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          {item.tindakan && (
                            <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                              <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Tindakan</span>
                              <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.tindakan}</span>
                            </div>
                          )}
                          {item.obat && (
                            <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                              <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>
                                {jenis.id === 'pakan' ? 'Jenis Pakan' : 'Obat / Vitamin'}
                              </span>
                              <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.obat}</span>
                            </div>
                          )}
                        </>
                      )}
                      {item.vitaminAmount && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Dosis</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.vitaminAmount} ml</span>
                        </div>
                      )}
                      {item.kotoranState && jenis.id === 'kotoran' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Kondisi Kotoran</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }} class="text-capitalize">: {item.kotoranState}</span>
                        </div>
                      )}
                      {item.pemanfaatan && jenis.id === 'kotoran' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Pemanfaatan</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.pemanfaatan}</span>
                        </div>
                      )}
                      {item.idPejantan && item.name !== 'Kontrol Kebuntingan' && item.name !== 'Cek Birahi' && item.name !== 'Pencatatan Birahi' && item.name !== 'Pengecekan Birahi' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>ID Pejantan</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.idPejantan}</span>
                        </div>
                      )}
                      {item.metoda && jenis.id === 'perkawinan' && item.name !== 'Kontrol Kebuntingan' && item.name !== 'Cek Birahi' && item.name !== 'Pencatatan Birahi' && item.name !== 'Pengecekan Birahi' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Metode Kawin</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }} class="text-capitalize">: {item.metoda === 'ib' ? 'Inseminasi Buatan (IB)' : item.metoda}</span>
                        </div>
                      )}
                      {(item.name === 'Cek Birahi' || item.name === 'Pencatatan Birahi' || item.name === 'Pengecekan Birahi') && (
                        <>
                          {item.hasilPemeriksaan && (
                            <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                              <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Hasil Cek Birahi</span>
                              <span style={{ fontWeight: '700', color: '#1a1a1a' }} class="text-capitalize">
                                : {item.hasilPemeriksaan === 'birahi' ? 'Birahi (Siap Kawin)' : 'Tidak Birahi'}
                              </span>
                            </div>
                          )}
                          {item.tanggal && (
                            <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                              <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Tgl Periksa</span>
                              <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.tanggal}</span>
                            </div>
                          )}
                        </>
                      )}
                      {item.metoda === 'ib' && item.asalSemen && item.name !== 'Kontrol Kebuntingan' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Asal Semen</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.asalSemen}</span>
                        </div>
                      )}
                      {item.metoda === 'ib' && item.namaInseminator && item.name !== 'Kontrol Kebuntingan' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Inseminator</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.namaInseminator}</span>
                        </div>
                      )}
                      {item.metoda === 'ib' && item.waktuIB && item.name !== 'Kontrol Kebuntingan' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Waktu IB</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {new Date(item.waktuIB).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      )}
                      {item.name === 'Kontrol Kebuntingan' && (
                        <>
                          {item.idMating && (
                            <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                              <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>ID Perkawinan</span>
                              <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.idMating}</span>
                            </div>
                          )}
                          {item.tanggal && (
                            <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                              <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Tgl Periksa</span>
                              <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.tanggal}</span>
                            </div>
                          )}
                          {item.metodePemeriksaan && (
                            <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                              <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Metode Periksa</span>
                              <span style={{ fontWeight: '700', color: '#1a1a1a' }} class="text-capitalize">
                                : {item.metodePemeriksaan === 'non_return_estrus' ? 'Non-Return Estrus' : item.metodePemeriksaan === 'usg_palpasi' ? 'USG / Palpasi' : 'Manual'}
                              </span>
                            </div>
                          )}
                          {item.hasilPemeriksaan && (
                            <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                              <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Hasil Periksa</span>
                              <span style={{ fontWeight: '700', color: '#1a1a1a' }} class="text-capitalize">
                                : {item.hasilPemeriksaan === 'bunting_terkonfirmasi' ? 'Bunting Terkonfirmasi' : item.hasilPemeriksaan === 'masih_menunggu' ? 'Masih Menunggu' : item.hasilPemeriksaan === 'gagal' ? 'Gagal' : 'Keguguran'}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {item.sheepCode && jenis.id === 'kelahiran' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Ear Tag Anak</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.sheepCode}</span>
                        </div>
                      )}
                      {item.namaAnak && jenis.id === 'kelahiran' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Nama Anak</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.namaAnak}</span>
                        </div>
                      )}
                      {item.genderAnak && jenis.id === 'kelahiran' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Kelamin Anak</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }} class="text-capitalize">: {item.genderAnak}</span>
                        </div>
                      )}
                      {item.kandangAnak && jenis.id === 'kelahiran' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Kandang Anak</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.kandangAnak}</span>
                        </div>
                      )}
                      {item.jumlahAnak && jenis.id === 'kelahiran' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Jumlah Anak</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.jumlahAnak} ekor</span>
                        </div>
                      )}
                      {item.beratLahir && jenis.id === 'kelahiran' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Berat Lahir</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.beratLahir} kg</span>
                        </div>
                      )}
                      {item.kondisiAnak && jenis.id === 'kelahiran' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Kondisi Anak</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.kondisiAnak}</span>
                        </div>
                      )}
                      {item.kondisiInduk && jenis.id === 'kelahiran' && (
                        <div style={{ display: 'flex', fontSize: '0.82rem' }}>
                          <span style={{ color: '#6C757D', width: '140px', flexShrink: 0 }}>Kondisi Induk</span>
                          <span style={{ fontWeight: '700', color: '#1a1a1a' }}>: {item.kondisiInduk}</span>
                        </div>
                      )}
                      {item.note && (
                        <div style={{ display: 'flex', fontSize: '0.82rem', flexDirection: 'column', gap: '0.2rem', marginTop: '0.25rem', padding: '0.5rem', background: '#F5F5F5', borderRadius: '8px' }}>
                          <span style={{ color: '#6C757D', fontWeight: '600' }}>Catatan</span>
                          <span style={{ color: '#424242', fontWeight: '500', lineHeight: '1.4' }}>{item.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <BackButton
                  onClick={() => { showRecap.value = false; initForms(); }}
                  label="Ubah Data"
                  style={{ flex: 1 }}
                />
                <SubmitButton
                  label="Kirim Persetujuan"
                  loading={isSubmitting.value}
                  onClick={handleFinalSubmit}
                  style={{ flex: 2 }}
                />
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
                <SubmitButton
                  label="Simpan"
                  loading={isSubmitting.value}
                  onClick={handleSaved}
                  className="shadow-sm flex-grow-1 flex-md-grow-0 text-center"
                />
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
              <div class={jenis.id === 'pakan' || jenis.id === 'stok_pakan' || jenis.id === 'perkawinan' || jenis.id === 'kelahiran' ? 'col-lg-8' : 'col-lg-12'}>
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

              {(jenis.id === 'pakan' || jenis.id === 'stok_pakan' || jenis.id === 'perkawinan' || jenis.id === 'kelahiran') && (
                <div class="col-lg-4">
                  <div class="sticky-top" style={{ top: '2rem' }}>
                    
                    {/* Panel Pakan */}
                    {(jenis.id === 'pakan' || jenis.id === 'stok_pakan') && (
                      <div class="pencatatan-form-card">
                        <div class="d-flex align-items-center gap-2 mb-4">
                          <img src="/icon/inventory.png" style={{ width: '20px', height: '20px', opacity: 0.6 }} alt="" />
                          <Typography variant="h5" weight="extrabold" className="m-0">
                            {(() => {
                              if (jenis.id === 'pakan') {
                                if (forms.value[0]?.metoda === 'silase') return 'Stok Silase Tersedia';
                                if (forms.value[0]?.metoda === 'hijauan_kebun') return 'Stok Hijauan Kebun Tersedia';
                              }
                              return 'Informasi Stok Terkait';
                            })()}
                          </Typography>
                        </div>

                        <div class="stock-list-compact">
                          {matchedStocks.value.length === 0 ? (
                            <div class="text-center py-4 rounded-2xl bg-surface-container-low text-on-surface-variant small">
                              {(() => {
                                if (jenis.id === 'pakan') {
                                  if (forms.value[0]?.metoda === 'silase') return 'Belum ada stok silase. Lakukan Konversi Pakan terlebih dahulu.';
                                  if (forms.value[0]?.metoda === 'hijauan_kebun') return 'Belum ada stok hijauan kebun (mentah) tersedia.';
                                }
                                return 'Tidak ada stok yang sesuai';
                              })()}
                            </div>
                          ) : (
                            matchedStocks.value.map((s) => {
                              const isSelected = selectedFeedNames.value.has(s.name.toLowerCase());
                              return (
                                <div
                                  class="d-flex justify-content-between align-items-center p-3 mb-2 rounded-2xl bg-surface-container-low"
                                  style={isSelected ? { borderLeft: '4px solid var(--color-primary, #bc6c25)', borderTop: '1px solid rgba(188, 108, 37, 0.2)', borderBottom: '1px solid rgba(188, 108, 37, 0.2)', borderRight: '1px solid rgba(188, 108, 37, 0.2)' } : {}}
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
                            );
                          })
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


                          {/* Pejantan Dewasa vs Data Perkawinan Tercatat */}
                          {(() => {
                            const firstFormName = forms.value[0]?.name || '';
                            const isIBOrPregnancy = firstFormName === 'IB' || firstFormName === 'Inseminasi Buatan' || firstFormName === 'Kontrol Kebuntingan';

                            if (isIBOrPregnancy) {
                              return (
                                <>
                                  <Typography variant="p" size="text-xs" weight="bold" className="text-muted mb-2 mt-4 px-2">
                                    Data Perkawinan Tercatat
                                  </Typography>
                                  <div class="px-2 py-1.5 mb-2 rounded-3 bg-light text-muted border" style={{ fontSize: '0.72rem' }}>
                                    💡 <em>Metode Kontrol Kebuntingan tersedia: Cek USG, Palpasi, atau Testpack.</em>
                                  </div>
                                  {cageActiveMatings.value.length === 0 ? (
                                    <div class="text-center py-3 rounded-2xl bg-surface-container-low text-on-surface-variant small">
                                      Tidak ada perkawinan tercatat
                                    </div>
                                  ) : (
                                    cageActiveMatings.value.slice(0, 5).map((m) => {
                                      const female = sheep.value.find((s) => String(s.id) === String(m.id_sheep_female));
                                      const male = sheep.value.find((s) => String(s.id) === String(m.id_sheep_male));
                                      const matingDate = new Date(m.mating_date);
                                      const diffDays = m.days_since_mating || 0;
                                      const dateStr = matingDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
                                      
                                      return (
                                        <div class="d-flex justify-content-between align-items-center p-3 mb-2 rounded-2xl bg-surface-container-low border border-light" key={m.id_mating}>
                                          <div class="min-w-0">
                                            <Typography variant="p" size="text-xs" weight="extrabold" className="mb-0 text-truncate d-block">
                                              {female ? female.name : `Domba #${m.id_sheep_female}`}
                                            </Typography>
                                            <Typography variant="span" style={{ fontSize: '0.65rem' }} weight="bold" className="text-muted d-block mt-1 text-truncate">
                                              {female ? female.code : '—'} • {(m.mating_method === 'ib' || m.mating_method === 'inseminasi buatan') ? 'Inseminasi Buatan' : (male ? `w/ ${male.name}` : 'Kawin Alam')}
                                            </Typography>
                                            <Typography variant="span" style={{ fontSize: '0.6rem' }} className="text-primary d-block mt-1">
                                              Kawin: {dateStr} ({diffDays} hari lalu)
                                            </Typography>
                                          </div>
                                          <div class="text-end ps-3">
                                            <Badge variant="solid-primary" className="px-2 py-1" style={{ fontSize: '0.65rem' }}>
                                              {m.status_mating === 'proses' ? 'Proses' : m.status_mating}
                                            </Badge>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </>
                              );
                            } else {
                              return (
                                <>
                                  <Typography variant="p" size="text-xs" weight="bold" className="text-muted mb-2 mt-4 px-2">
                                    Betina Siap Kawin (Birahi)
                                  </Typography>
                                  {siapKawinBetina.value.length === 0 ? (
                                    <div class="text-center py-3 rounded-2xl bg-surface-container-low text-on-surface-variant small">
                                      Tidak ada betina siap kawin
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
                                </>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Panel Kelahiran */}
                    {jenis.id === 'kelahiran' && (
                      <div class="pencatatan-form-card">
                        <div class="d-flex align-items-center gap-2 mb-4">
                          <img src="/icon/catat_lahir.png" style={{ width: '20px', height: '20px', opacity: 0.6 }} alt="" />
                          <Typography variant="h5" weight="extrabold" className="m-0">
                            Info Daftar Ternak
                          </Typography>
                        </div>

                        <div class="stock-list-compact">
                          <Typography variant="p" size="text-xs" weight="bold" className="text-muted mb-2 mt-4 px-2">
                            Indukan Siap Melahirkan (Hamil)
                          </Typography>
                          {pregnantCageSheepList.value.length === 0 ? (
                            <div class="text-center py-3 rounded-2xl bg-surface-container-low text-on-surface-variant small">
                              Tidak ada indukan hamil di kandang terpilih
                            </div>
                          ) : (
                            pregnantCageSheepList.value.map((s) => (
                              <div class="d-flex justify-content-between align-items-center p-3 mb-2 rounded-2xl bg-surface-container-low border border-light" key={s.id}>
                                <div class="min-w-0">
                                  <Typography variant="p" size="text-xs" weight="extrabold" className="mb-0 text-truncate d-block text-dark">
                                    {s.name}
                                  </Typography>
                                  <Typography variant="span" style={{ fontSize: '0.65rem' }} weight="bold" className="text-muted d-block mt-1 text-truncate">
                                    {s.code} • HPL: {s.hpl}
                                  </Typography>
                                </div>
                                <div class="text-end ps-3">
                                  <Badge variant="solid-primary" className="px-2 py-1">
                                    {s.countdownText}
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
