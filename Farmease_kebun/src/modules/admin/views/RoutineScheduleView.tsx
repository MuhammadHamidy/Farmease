import { defineComponent, ref, reactive, computed, onMounted, watch, Teleport } from 'vue';
import type { PropType } from 'vue';
import Typography from '@/shared/ui/admin/Typography';
import Button from '@/shared/ui/admin/Button';
import Select from '@/shared/ui/admin/Select';
import CustomInput from '@/shared/ui/admin/Input';
import RoutineScheduleCard from '../components/routine/RoutineScheduleCard';
import RoutineScheduleDetailModal from '../components/routine/RoutineScheduleDetailModal';
import RoutineScheduleFormModal from '../components/routine/RoutineScheduleFormModal';
import { landsList, fetchLandsList, cagesList, fetchCagesList } from '@/store/navigation';
import apiClient from '@/shared/api/client';
import '@/modules/kebun/assets/css/PerkebunanDetailPages.css';
import {
  routineSchedules,
  addRoutineSchedule,
  updateRoutineSchedule,
  deleteRoutineSchedule,
  fetchRoutineSchedules,
  operatorTasks,
  fetchTasks,
  updateOperatorTask,
  deleteOperatorTask,
  type RoutineSchedule,
  type PencatatanCategory,
  type ScheduleFrequency,
  type OperatorTask,
  fetchAccountsList,
  metadataEnums
} from '@/store/operatorAdmin';

const operators = [
  { code: 'OP001', name: 'Operator Ternak' },
  { code: 'OP002', name: 'Operator Kebun' },
  { code: 'PEM001', name: 'Pemilik' },
  { code: 'ADM001', name: 'Admin' },
];

const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default defineComponent({
  name: 'RoutineScheduleView',
  props: {
    type: {
      type: String as PropType<'peternakan' | 'perkebunan'>,
      default: 'perkebunan'
    }
  },
  setup(props) {
    const isModalOpen = ref(false);
    const isEditing = ref(false);
    const isDetailOpen = ref(false);
    const selectedTask = ref<OperatorTask | null>(null);
    const isDeleteModalOpen = ref(false);
    const taskToDelete = ref<OperatorTask | null>(null);

    const toastMessage = ref('');
    const toastType = ref<'success'|'error'>('success');
    const showToast = ref(false);

    const displayToast = (msg: string, type: 'success'|'error' = 'success') => {
      toastMessage.value = msg;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => { showToast.value = false; }, 3000);
    };

    const sessionFilter = ref('Semua Sesi');
    const statusFilter = ref('Semua Status');
    const getLocalDateStr = () => {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    const dateFilter = ref(getLocalDateStr());

    watch(dateFilter, async (newVal) => {
      await fetchTasks(newVal);
    });

    const categories = computed(() => {
      const allCats = metadataEnums.value?.task_category || [];
      const filterKeys = props.type === 'peternakan'
        ? ['pakan', 'kesehatan', 'kotoran', 'perkawinan', 'kelahiran', 'umum']
        : ['penyiraman', 'pemupukan', 'pemangkasan', 'panen', 'pembersihan', 'pengolahan_pupuk', 'umum'];
      
      return allCats
        .filter(c => filterKeys.includes(c.value))
        .map(c => c.label);
    });
      
    const categoryValues = computed(() => {
      const allCats = metadataEnums.value?.task_category || [];
      const filterKeys = props.type === 'peternakan'
        ? ['pakan', 'kesehatan', 'kotoran', 'perkawinan', 'kelahiran', 'umum']
        : ['penyiraman', 'pemupukan', 'pemangkasan', 'panen', 'pembersihan', 'pengolahan_pupuk', 'umum'];
      
      return allCats
        .filter(c => filterKeys.includes(c.value))
        .map(c => c.value);
    });

    const ternakRincianOptions: Record<string, string[]> = {
      pakan: ['Pakan Pagi', 'Pakan Sore'],
      stok_pakan: ['Konversi Pakan'],
      kesehatan: ['Pemberian Obat', 'Pemberian Vitamin', 'Vaksinasi', 'Pemeriksaan Medis'],
      perkawinan: ['Kawin Alami', 'Inseminasi Buatan', 'Kontrol Kebuntingan'],
      kelahiran: ['Pencatatan Kelahiran', 'Pemeriksaan Anak & Induk'],
      kotoran: ['Pembersihan Kandang'],
      berat_badan: [],
      umum: []
    };

    const kebunRincianOptions: Record<string, string[]> = {
      panen: ['Panen Buah'],
      pemangkasan: ['Pemangkasan Pemeliharaan'],
      pembersihan: ['Penyiangan Gulma', 'Pembumbunan Tanah', 'Sanitasi Serasah & Ranting'],
      pembuahan: ['Merangsang Pembungaan', 'Penjarangan Buah', 'Pembungkusan Buah'],
      penanaman: ['Bibit Baru', 'Penggantian Bibit'],
      'pengendalian hama': ['Insektisida', 'Fungisida', 'Pestisida'],
      pemupukan: ['Pupuk Organik Cair', 'Pupuk Organik Padat', 'Pupuk Kimia'],
      penyiraman: ['Siram Manual', 'Irigrasi Drip / Pipanisasi'],
      pengolahan_pupuk: ['Fermentasi Pupuk', 'Cek Fermentasi'],
      umum: []
    };

    const locationOptions = computed(() => {
      if (props.type === 'peternakan') {
        if (cagesList.value.length === 0) return [{ value: 'A', label: 'Kandang A' }, { value: 'B', label: 'Kandang B' }, { value: 'C', label: 'Kandang C' }];
        return cagesList.value.map(c => ({ value: c.code, label: c.name || `Kandang ${c.code}` }));
      } else {
        if (landsList.value.length === 0) return [{ value: 'L001', label: 'L001' }, { value: 'L002', label: 'L002' }, { value: 'L003', label: 'L003' }];
        return landsList.value.map(l => ({ value: l.code, label: l.code }));
      }
    });

    const viewTitle = computed(() =>
      props.type === 'peternakan'
        ? 'Jadwal Rutin Peternakan'
        : 'Jadwal Rutin Perkebunan'
    );

    const viewSubtitle = computed(() =>
      props.type === 'peternakan'
        ? 'Kelola jadwal rutin dan tinjau pembagian tugas harian operator peternakan'
        : 'Kelola jadwal rutin dan tinjau pembagian tugas harian operator perkebunan'
    );

    const form = reactive({
      id: '',
      scheduleId: undefined as string | undefined,
      title: '',
      description: '',
      rincian: '',
      category: '' as any,
      cageCode: '',
      assigneeCode: props.type === 'peternakan' ? 'OP001' : 'OP002',
      frequency: '' as any,
      startDate: new Date().toISOString().split('T')[0],
      time: '08:00',
      endTime: '12:00',
      daysOfWeek: [1, 2, 3, 4, 5] as number[],
      dayOfMonth: 1,
      priority: '' as any,
      active: true,
    });

    const currentRincianOptions = computed(() => {
      if (!form.category) return [];
      
      const allRincian = metadataEnums.value?.task_rincian || [];
      const categoryMap: Record<string, string[]> = {
        pakan: ['Pakan Pagi', 'Pakan Sore', 'Konversi Pakan'],
        kesehatan: ['Pemberian Obat', 'Pemberian Vitamin', 'Vaksinasi', 'Pemeriksaan Medis'],
        kotoran: ['Pembersihan Kandang'],
        perkawinan: ['Kawin Alami', 'Inseminasi Buatan'],
        kelahiran: ['Pencatatan Kelahiran', 'Pemeriksaan Anak & Induk'],
      };
      
      const allowedVals = categoryMap[form.category];
      if (allowedVals) {
        return allRincian
          .filter(r => allowedVals.includes(r.value))
          .map(r => r.label);
      }
      
      const opts = props.type === 'peternakan' ? ternakRincianOptions : kebunRincianOptions;
      return opts[form.category] || ['Lainnya'];
    });

    const getLandName = (cageCode: string) => {
      const land = landsList.value.find((l) => l.code === cageCode);
      if (land) {
        return land.name.replace(/lahan/gi, '').trim();
      }
      if (cageCode === 'L001' || cageCode === 'A') return 'Alpukat';
      if (cageCode === 'L002' || cageCode === 'B') return 'Kelengkeng';
      if (cageCode === 'L003' || cageCode === 'C') return 'Alpukat';
      return cageCode;
    };

    const getJenisPencatatan = (task: any) => {
      const titleLower = (task.title || '').toLowerCase();
      const descLower = (task.description || '').toLowerCase();
      const text = titleLower + ' ' + descLower;

      if (text.includes('siram') || text.includes('penyiraman') || text.includes('air')) return 'Penyiraman';
      if (text.includes('pupuk') || text.includes('pemupukan')) return 'Pemupukan';
      if (text.includes('pangkas') || text.includes('pemangkasan') || text.includes('ranting')) return 'Pemangkasan';
      if (text.includes('panen') || text.includes('buah') || text.includes('petik')) return 'Panen';
      if (text.includes('bersih') || text.includes('pembersihan') || text.includes('gulma') || text.includes('rumput')) return 'Pembersihan';

      if (titleLower.includes('admin report') || task.category === 'umum') {
        if (task.cageCode === 'A' || task.cageCode === 'L001') return 'Panen';
        if (task.cageCode === 'B' || task.cageCode === 'L002') return 'Pemangkasan';
        return 'Pemupukan';
      }

      if (task.category && task.category !== 'umum') {
        return task.category;
      }
      return 'Umum';
    };

    onMounted(async () => {
      await fetchAccountsList();
      if (props.type === 'perkebunan') {
        await fetchLandsList();
      } else {
        await fetchCagesList();
      }
      await fetchTasks(dateFilter.value);
      await fetchRoutineSchedules();
    });

    const frequencyLabel = (f: string) => {
      if (f === 'sekali') return 'Sekali';
      if (f === 'harian') return 'Harian';
      if (f === 'mingguan') return 'Mingguan';
      if (f === 'bulanan') return 'Bulanan';
      return '';
    };

    const getTaskFrequency = (task: OperatorTask) => {
      const schedule = routineSchedules.value.find((s) => s.title === task.title && s.cageCode === task.cageCode);
      return schedule ? frequencyLabel(schedule.frequency) : 'Sekali';
    };

    const openAdd = () => {
      isEditing.value = false;
      
      form.id = '';
      form.scheduleId = undefined;
      form.category = '';
      form.rincian = '';
      form.title = '';
      form.description = '';
      form.cageCode = '';
      form.assigneeCode = props.type === 'peternakan' ? 'OP001' : 'OP002';
      form.frequency = '' as any;
      form.startDate = new Date().toISOString().split('T')[0];
      form.time = '08:00';
      form.endTime = '12:00';
      form.daysOfWeek = [1, 2, 3, 4, 5];
      form.dayOfMonth = 1;
      form.priority = '' as any;
      form.active = true;
      isModalOpen.value = true;
    };

    const openEdit = (task: OperatorTask) => {
      isEditing.value = true;
      const schedule = routineSchedules.value.find((s) => s.title === task.title && s.cageCode === task.cageCode);
      Object.assign(form, {
        id: task.id,
        scheduleId: schedule?.id || undefined,
        title: task.title,
        description: task.description || '',
        rincian: task.rincian || '',
        category: task.category as any,
        cageCode: task.cageCode,
        assigneeCode: task.assigneeCode,
        frequency: schedule ? schedule.frequency : 'sekali',
        startDate: task.dueDate || new Date().toISOString().split('T')[0],
        time: task.dueTime || '08:00',
        endTime: task.endTime || '12:00',
        daysOfWeek: schedule ? [...schedule.daysOfWeek] : [],
        dayOfMonth: schedule ? schedule.dayOfMonth : 1,
        priority: task.priority,
        active: schedule ? schedule.active : true,
      });
      if (!form.rincian) form.rincian = currentRincianOptions.value[0] || '';
      isModalOpen.value = true;
    };

    const openDetail = (task: OperatorTask) => {
      selectedTask.value = task;
      isDetailOpen.value = true;
    };

    const saveSchedule = async () => {
      if (!form.category) {
        displayToast('Harap pilih jenis pencatatan / kegiatan!', 'error');
        return;
      }
      if (!form.rincian && currentRincianOptions.value.length > 0) {
        displayToast('Harap pilih rincian pencatatan!', 'error');
        return;
      }
      if (!form.cageCode) {
        displayToast(props.type === 'peternakan' ? 'Harap pilih kode kandang!' : 'Harap pilih kode lahan!', 'error');
        return;
      }
      // Default frequency to 'harian' if not set (frequency field hidden per mockup design)
      if (!form.frequency) {
        form.frequency = 'harian';
      }
      if (!form.priority) {
        displayToast('Harap pilih prioritas!', 'error');
        return;
      }
      const catLabel = categories.value[categoryValues.value.indexOf(form.category)] || form.category;
      form.title = `${catLabel} - ${form.rincian}`;
      const assignee = operators.find((o) => o.code === form.assigneeCode);
      const payload = {
        title: form.title,
        description: form.description,
        rincian: form.rincian,
        category: form.category,
        cageCode: form.cageCode,
        assigneeCode: form.assigneeCode,
        assigneeName: assignee?.name || form.assigneeCode,
        frequency: form.frequency,
        startDate: form.startDate,
        time: form.time,
        endTime: form.endTime,
        daysOfWeek: [...form.daysOfWeek],
        dayOfMonth: form.dayOfMonth,
        priority: form.priority,
        active: form.active,
      };

      try {
        if (isEditing.value) {
          await updateOperatorTask(form.id, {
            ...payload,
            dueDate: payload.startDate,
            dueTime: payload.time,
          });
          if (form.scheduleId) {
            updateRoutineSchedule(form.scheduleId, payload);
          }
          displayToast('Tugas berhasil diperbarui!');
        } else {
          await addRoutineSchedule(payload);
          displayToast('Tugas baru berhasil ditambahkan!');
        }
        isModalOpen.value = false;
        await fetchTasks(dateFilter.value);
      } catch (err) {
        displayToast('Terjadi kesalahan saat menyimpan tugas. Silakan coba lagi.', 'error');
      }
    };

    const getSessionFromTime = (timeStr: string): 'Pagi' | 'Siang' | 'Sore' => {
      if (!timeStr) return 'Pagi';
      const hour = parseInt(timeStr.split(':')[0] || '0');
      if (hour >= 4 && hour < 12) return 'Pagi';
      if (hour >= 12 && hour < 17) return 'Siang';
      return 'Sore';
    };

    const statusLabel = (s: string) => {
      if (s === 'selesai') return 'Selesai';
      if (s === 'terlambat') return 'Terlambat';
      return 'Belum Dikerjakan';
    };

    const statusClass = (s: string) => {
      if (s === 'selesai') return 'selesai';
      if (s === 'terlambat') return 'terlambat';
      return 'belum';
    };

    // Filtered lists based on props.type
    const filteredSchedules = computed(() => {
      const targetAssignee = props.type === 'peternakan' ? 'OP001' : 'OP002';
      return routineSchedules.value.filter((s) => s.assigneeCode === targetAssignee);
    });

    const filteredTasks = computed(() => {
      const targetAssignee = props.type === 'peternakan' ? 'OP001' : 'OP002';
      return operatorTasks.value
        .filter((t) => t.assigneeCode === targetAssignee)
        .filter((t) => t.dueDate === dateFilter.value)
        .filter(t => {
          // Session Filter
          if (sessionFilter.value !== 'Semua Sesi') {
            const session = getSessionFromTime(t.dueTime);
            if (session !== sessionFilter.value) return false;
          }

          // Status Filter
          if (statusFilter.value !== 'Semua Status') {
            if (statusFilter.value === 'Belum Dikerjakan' && t.status !== 'belum' && t.status !== 'proses') return false;
            if (statusFilter.value === 'Selesai' && t.status !== 'selesai') return false;
            if (statusFilter.value === 'Terlambat' && t.status !== 'terlambat') return false;
          }

          return true;
        });
    });

    // Task Statistics Computed
    const totalTodayTasks = computed(() => filteredTasks.value.length);
    const completedTasksCount = computed(() => filteredTasks.value.filter(t => t.status === 'selesai').length);
    const pendingTasksCount = computed(() => filteredTasks.value.filter(t => t.status === 'belum' || t.status === 'proses').length);
    const lateTasksCount = computed(() => filteredTasks.value.filter(t => t.status === 'terlambat').length);

    // Grouping computed
    const groupedTasks = computed(() => {
      const groups = {
        Pagi: [] as OperatorTask[],
        Siang: [] as OperatorTask[],
        Sore: [] as OperatorTask[],
      };
      for (const t of filteredTasks.value) {
        const session = getSessionFromTime(t.dueTime);
        groups[session].push(t);
      }
      return groups;
    });

    const activeCount = computed(() => filteredSchedules.value.filter((s) => s.active).length);

    // Pagination per sesi — max 3 tugas per halaman
    const TASKS_PER_PAGE = 3;
    const sessionPages = reactive<Record<string, number>>({
      Pagi: 1,
      Siang: 1,
      Sore: 1,
    });

    // Reset halaman sesi ketika filter berubah
    watch([filteredTasks, sessionFilter, statusFilter, dateFilter], () => {
      sessionPages.Pagi = 1;
      sessionPages.Siang = 1;
      sessionPages.Sore = 1;
    });

    const pagedTasksForSession = (sessionName: 'Pagi' | 'Siang' | 'Sore') => {
      const all = groupedTasks.value[sessionName];
      const page = sessionPages[sessionName];
      const start = (page - 1) * TASKS_PER_PAGE;
      return all.slice(start, start + TASKS_PER_PAGE);
    };

    const totalPagesForSession = (sessionName: 'Pagi' | 'Siang' | 'Sore') =>
      Math.ceil(groupedTasks.value[sessionName].length / TASKS_PER_PAGE);

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
        const filename = `Ekspor_Data_Jadwal_Rutin_${dateStr}.csv`
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
        {showToast.value && (
          <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: toastType.value === 'success' ? '#4caf50' : '#f44336', color: 'white', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeInDown 0.3s ease' }}>
            {toastType.value === 'success' ? '✅' : '⚠️'} {toastMessage.value}
          </div>
        )}

        {/* Header Section */}
        <div class="view-header align-items-center mb-4">
          <div>
            <Typography variant="h2" class="view-title">
              {viewTitle.value}
            </Typography>
            <Typography variant="span" color="secondary">
              {viewSubtitle.value}
            </Typography>
          </div>
          <div class="d-flex gap-2 flex-wrap">
              <Button 
                variant="solid" 
                onClick={openAdd}
                style={{ backgroundColor: '#38431F', color: '#ffffff', borderColor: '#38431F' }}
              >
                + Tambah Jadwal Rutin
              </Button>
          </div>
        </div>

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

        {/* Ringkasan Informasi Cards */}
        <div class="row g-3 mb-4">
          <div class="col-12 col-sm-6 col-md-3">
            <div class="bg-white rounded-4 p-3" style={{ border: '1px solid #E6D9CE' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#2C3E50', marginBottom: '0.5rem' }}>TOTAL TUGAS HARI INI</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#000', marginBottom: '0.5rem', fontFamily: "'Inter', sans-serif" }}>{totalTodayTasks.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#6C757D', fontWeight: '600' }}>rutin + insidental</div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="bg-white rounded-4 p-3" style={{ border: '1px solid #E6D9CE' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#2C3E50', marginBottom: '0.5rem' }}>SELESAI</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#000', marginBottom: '0.5rem', fontFamily: "'Inter', sans-serif" }}>{completedTasksCount.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#6C757D', fontWeight: '600' }}>dari tugas</div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="bg-white rounded-4 p-3" style={{ border: '1px solid #E6D9CE' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#2C3E50', marginBottom: '0.5rem' }}>BELUM DIKERJAKAN</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#000', marginBottom: '0.5rem', fontFamily: "'Inter', sans-serif" }}>{pendingTasksCount.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#6C757D', fontWeight: '600' }}>perlu perhatian</div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="bg-white rounded-4 p-3" style={{ border: '1px solid #E6D9CE' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#2C3E50', marginBottom: '0.5rem' }}>TUGAS TERLAMBAT</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#000', marginBottom: '0.5rem', fontFamily: "'Inter', sans-serif" }}>{lateTasksCount.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#6C757D', fontWeight: '600' }}>lewat waktu tenggat</div>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns Section */}
        <div class="mb-4 rounded-4 p-4" style={{ backgroundColor: '#F4F1EA', border: '1px solid #E6D9CE' }}>
          <div class="row g-3 w-100 m-0">
            <div class="col-12 col-md-4">
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#374151', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase' }}>Tanggal</label>
              <input
                type="date"
                class="form-control bg-white"
                style={{ height: '42px', border: '1px solid #E6D9CE', borderRadius: '8px', fontWeight: '600', color: '#374151' }}
                value={dateFilter.value}
                onInput={(e: any) => { dateFilter.value = e.target.value; }}
              />
            </div>
            <div class="col-12 col-md-4">
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#374151', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase' }}>Semua Sesi</label>
              <Select
                options={['Semua Sesi', 'Pagi', 'Siang', 'Sore']}
                modelValue={sessionFilter.value}
                onUpdate:modelValue={(val: string) => {
                  sessionFilter.value = val;
                }}
                theme={props.type}
              />
            </div>
            <div class="col-12 col-md-4">
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#374151', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase' }}>Semua Status</label>
              <Select
                options={['Semua Status', 'Belum Dikerjakan', 'Selesai', 'Terlambat']}
                modelValue={statusFilter.value}
                onUpdate:modelValue={(val: string) => {
                  statusFilter.value = val;
                }}
                theme={props.type}
              />
            </div>
          </div>
        </div>

        {/* Dynamic grouped task cards */}
        <div class="sessions-container">
          {(['Pagi', 'Siang', 'Sore'] as const).map(sessionName => {
            const tasksInSession = groupedTasks.value[sessionName];
            if (sessionFilter.value !== 'Semua Sesi' && sessionFilter.value !== sessionName) return null;
            if (tasksInSession.length === 0) return null;

            const currentPage = sessionPages[sessionName];
            const totalPages = totalPagesForSession(sessionName);
            const pagedTasks = pagedTasksForSession(sessionName);

            return (
              <div class="session-section mb-4" key={sessionName}>
                <div class="d-flex align-items-center gap-2 mb-3 mt-4">
                  <span style={{ fontSize: '1.2rem' }}>
                    {sessionName === 'Pagi' ? '☀️' : sessionName === 'Siang' ? '🌤️' : '🌙'}
                  </span>
                  <Typography variant="h3" size="text-md" weight="extrabold" className="m-0 text-dark text-uppercase">
                    Sesi {sessionName}
                  </Typography>
                  <span class="badge rounded-pill ms-1" style={{ backgroundColor: '#6C757D', fontSize: '0.7rem', padding: '0.35rem 0.65rem' }}>
                    {tasksInSession.length} Tugas
                  </span>
                </div>
                <hr style={{ borderColor: '#2C3E50', opacity: 0.6, margin: '0 0 1.25rem 0' }} />
                <div class="row g-3">
                  {pagedTasks.map(task => (
                    <RoutineScheduleCard
                      key={task.id}
                      task={task}
                      type={props.type}
                      landName={getLandName(task.cageCode)}
                      jenisPencatatan={getJenisPencatatan(task)}
                      frequency={getTaskFrequency(task)}
                      statusLabel={statusLabel}
                      onOpen-detail={openDetail}
                    />
                  ))}
                </div>

                {/* Pagination — hanya muncul jika lebih dari 3 tugas */}
                {totalPages > 1 && (
                  <div class="d-flex align-items-center justify-content-between mt-3 px-1">
                    <span style={{ fontSize: '0.78rem', color: '#6C757D', fontWeight: '600' }}>
                      Menampilkan {((currentPage - 1) * TASKS_PER_PAGE) + 1}–{Math.min(currentPage * TASKS_PER_PAGE, tasksInSession.length)} dari {tasksInSession.length} tugas
                    </span>
                    <div class="d-flex align-items-center gap-2">
                      <button
                        class="btn btn-sm rounded-3"
                        style={{
                          border: '1.5px solid #E6D9CE',
                          backgroundColor: currentPage === 1 ? '#F4F1EA' : '#fff',
                          color: currentPage === 1 ? '#C4B9AE' : '#2C3E50',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          padding: '0.3rem 0.75rem',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        }}
                        disabled={currentPage === 1}
                        onClick={() => { sessionPages[sessionName] = currentPage - 1; }}
                      >
                        ‹ Sebelumnya
                      </button>
                      <div class="d-flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                          <button
                            key={pg}
                            class="btn btn-sm rounded-3"
                            style={{
                              width: '32px',
                              height: '32px',
                              padding: '0',
                              fontWeight: '700',
                              fontSize: '0.8rem',
                              border: pg === currentPage ? 'none' : '1.5px solid #E6D9CE',
                              backgroundColor: pg === currentPage
                                ? (props.type === 'peternakan' ? '#2D7D46' : '#4A7C59')
                                : '#fff',
                              color: pg === currentPage ? '#fff' : '#2C3E50',
                            }}
                            onClick={() => { sessionPages[sessionName] = pg; }}
                          >
                            {pg}
                          </button>
                        ))}
                      </div>
                      <button
                        class="btn btn-sm rounded-3"
                        style={{
                          border: '1.5px solid #E6D9CE',
                          backgroundColor: currentPage === totalPages ? '#F4F1EA' : '#fff',
                          color: currentPage === totalPages ? '#C4B9AE' : '#2C3E50',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          padding: '0.3rem 0.75rem',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        }}
                        disabled={currentPage === totalPages}
                        onClick={() => { sessionPages[sessionName] = currentPage + 1; }}
                      >
                        Berikutnya ›
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredTasks.value.length === 0 && (
            <div class="text-center py-5 bg-white border rounded-5 shadow-sm text-secondary">
              Tidak ada tugas rutin ditemukan untuk sesi/status terpilih.
            </div>
          )}
        </div>

        {/* Task Detail Modal */}
        <RoutineScheduleDetailModal
          isOpen={isDetailOpen.value}
          task={selectedTask.value}
          type={props.type}
          statusLabel={statusLabel}
          statusClass={statusClass}
          getSessionFromTime={getSessionFromTime}
          onClose={() => isDetailOpen.value = false}
          onEdit={(task) => {
            isDetailOpen.value = false;
            openEdit(task);
          }}
          onDelete={async (task) => {
            isDetailOpen.value = false;
            taskToDelete.value = task;
            isDeleteModalOpen.value = true;
          }}
        />

        {/* Create/Edit Schedule Modal */}
        <RoutineScheduleFormModal
          isOpen={isModalOpen.value}
          isEditing={isEditing.value}
          form={form}
          type={props.type}
          categories={categories.value}
          categoryValues={categoryValues.value}
          currentRincianOptions={currentRincianOptions.value}
          locationOptions={locationOptions.value}
          frequencyLabel={frequencyLabel}
          onClose={() => isModalOpen.value = false}
          onSave={saveSchedule}
          onUpdateCategory={() => {
            form.rincian = currentRincianOptions.value[0] || '';
          }}
        />

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen.value && taskToDelete.value && (
          <div class="peternakan-modal-overlay" style={{ zIndex: 1060 }} onClick={() => isDeleteModalOpen.value = false}>
            <div class="peternakan-modal-card animate-fade-in-up" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
              <div class="peternakan-modal-header border-0 pb-0">
                <div class="peternakan-modal-title text-danger">Konfirmasi Hapus</div>
              </div>
              <div class="peternakan-modal-body text-center pt-3">
                <p class="mb-4" style={{ color: '#2C3E50', fontSize: '1rem' }}>
                  {taskToDelete.value.scheduleId 
                    ? <span>Apakah Anda yakin ingin menghapus jadwal rutin <br/><strong>"{taskToDelete.value.title}"</strong> beserta seluruh tugasnya?</span>
                    : <span>Apakah Anda yakin ingin menghapus tugas <br/><strong>"{taskToDelete.value.title}"</strong>?</span>
                  }
                </p>
                <div class="d-flex gap-2 w-100 mt-2">
                  <button class="btn btn-light w-50 fw-bold py-2 rounded-pill" onClick={() => isDeleteModalOpen.value = false}>Batal</button>
                  <button class="btn w-50 fw-bold py-2 rounded-pill text-white" style={{ backgroundColor: 'var(--color-danger, #dc3545)' }} onClick={async () => {
                    if (taskToDelete.value!.scheduleId) {
                      await deleteRoutineSchedule(taskToDelete.value!.scheduleId);
                      displayToast('Jadwal rutin dan seluruh tugasnya berhasil dihapus!');
                    } else {
                      await deleteOperatorTask(taskToDelete.value!.id);
                      displayToast('Tugas berhasil dihapus!');
                    }
                    isDeleteModalOpen.value = false;
                    isDetailOpen.value = false;
                    await fetchTasks(dateFilter.value);
                  }}>Ya, Hapus</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
});
