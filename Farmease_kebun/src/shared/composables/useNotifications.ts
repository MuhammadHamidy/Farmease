import { ref, computed } from 'vue';
import { notificationsApi, type Notification, submissionsApi, stokApi } from '@/shared/api/perkebunan';
import { cropsList, fetchCropsList } from '@/store/navigation';
import { operatorTasks, fetchTasks } from '@/store/operatorAdmin';

const notifications = ref<Notification[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.is_read).length;
});

async function fetchNotifications() {
  loading.value = true;
  error.value = null;
  try {
    const list = await notificationsApi.getList().catch(() => []);
    
    // Fetch dependencies if not loaded
    if (cropsList.value.length === 0) {
      await fetchCropsList().catch(() => {});
    }
    if (operatorTasks.value.length === 0) {
      await fetchTasks().catch(() => {});
    }

    const mockNotifs: Notification[] = [];

    // --- A. Daily Tasks Notifications ---
    const now = new Date();
    const localYear = now.getFullYear();
    const localMonth = String(now.getMonth() + 1).padStart(2, '0');
    const localDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${localYear}-${localMonth}-${localDay}`;

    const todayTasks = operatorTasks.value.filter(
      (task) => task.dueDate === todayStr && task.status !== 'selesai' && task.status !== 'done'
    );

    todayTasks.forEach((task, idx) => {
      mockNotifs.push({
        id: 700 + idx,
        user_id: 1,
        title: `Tugas Rutin Baru Hari Ini`,
        message: `Tugas rutin baru "${task.title}" dijadwalkan hari ini pukul ${task.dueTime || '08:00'} WIB. Silakan lakukan pencatatan jika sudah selesai dikerjakan.`,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });

    // --- B. Fertilizer Stock Warnings ---
    const allSubmissions = await submissionsApi.getList().catch(() => []);
    
    const parseQty = (qtyStr: any, unitStr: string) => {
      const val = parseFloat(qtyStr) || 0;
      const u = (unitStr || '').toLowerCase();
      if (u.includes('gram') || u === 'g') {
        return val / 1000;
      }
      if (u.includes('liter') || u === 'l') {
        return val * 1000;
      }
      return val;
    };

    const pupukStockMap: Record<string, number> = {
      'Pupuk Organik Padat': 0,
      'Pupuk Organik Cair': 0,
      'NPK': 0,
      'Urea': 0,
      'SP - 36': 0,
      'NPK Kelengkeng': 0,
    };

    const apiPupukList = (await stokApi.getPupukList().catch(() => [])) || [];
    apiPupukList.forEach((p: any) => {
      const name = p.nama_pupuk || p.nama || '';
      if (name) {
        pupukStockMap[name] = (pupukStockMap[name] || 0) + (Number(p.jumlah) || 0);
      }
    });

    allSubmissions
      .filter((s: any) => s.approvalStatus === 'approved')
      .forEach((s: any) => {
        const type = (s.type || '').toLowerCase();
        const item = s.payload?.data?.items?.[0] || {};

        if (type === 'stok pupuk') {
          const val = parseQty(item.volumeObat, item.satuanVolumeObat);
          const name = item.namaObat || '';
          if (name && item.tujuanPemanfaatan !== 'bahan') {
            pupukStockMap[name] = (pupukStockMap[name] || 0) + val;
          }
        }
        else if (type === 'pengolahan pupuk' && (item.selectedRincian?.includes('Fermentasi') || item.rincian?.includes('Fermentasi')) && !(item.selectedRincian?.includes('Cek') || item.rincian?.includes('Cek'))) {
          const outVal = parseQty(item.qty, item.unit);
          const name = item.hasilJadi || '';
          if (name) {
            pupukStockMap[name] = (pupukStockMap[name] || 0) + outVal;
          }
        }
        else if (type === 'pemupukan') {
          const name = item.jenisPupukDetail || '';
          if (name) {
            const nameLower = name.toLowerCase();
            const isCair = nameLower.includes('poc') || nameLower.includes('cair');
            const isOrganik = nameLower.includes('kandang') || nameLower.includes('kotoran') || nameLower.includes('kompos') || nameLower.includes('organik');
            let unit = 'gram';
            if (isCair) unit = 'liter';
            else if (isOrganik) unit = 'kilogram';
            const usedVal = parseQty(item.jumlahBeratPupuk, unit);
            pupukStockMap[name] = Math.max(0, (pupukStockMap[name] || 0) - usedVal);
          }
        }
      });

    const reqMap: Record<string, number> = {
      'Pupuk Organik Padat': 0,
      'Pupuk Organik Cair': 0,
      'NPK': 0,
      'Urea': 0,
      'SP - 36': 0,
      'NPK Kelengkeng': 0,
    };

    cropsList.value.forEach((crop) => {
      const nameLower = (crop.name || '').toLowerCase();
      const landLower = (crop.land || '').toLowerCase();
      const faseLower = (crop.type || '').toLowerCase();
      const isVegetatif = faseLower.includes('vegetatif') || faseLower.includes('0-3') || faseLower.includes('belum');
      
      const isKelengkeng = nameLower.includes('kelengkeng') || landLower.includes('kelengkeng');
      
      if (isKelengkeng) {
        reqMap['Pupuk Organik Padat'] += isVegetatif ? 7.5 : 17.5;
        reqMap['Pupuk Organik Cair'] += isVegetatif ? 0.15 : 0.35;
        reqMap['NPK Kelengkeng'] += isVegetatif ? 0.175 : 0.75;
      } else {
        reqMap['Pupuk Organik Padat'] += isVegetatif ? 7.5 : 17.5;
        reqMap['Pupuk Organik Cair'] += isVegetatif ? 0.15 : 0.35;
        reqMap['NPK'] += isVegetatif ? 0.175 : 0.75;
        reqMap['Urea'] += isVegetatif ? 0.15 : 0.5;
        reqMap['SP - 36'] += isVegetatif ? 0.15 : 0.5;
      }
    });

    Object.entries(reqMap).forEach(([pupukName, requiredAmount], idx) => {
      const actualStock = pupukStockMap[pupukName] || 0;
      if (requiredAmount > 0 && actualStock < requiredAmount) {
        const unit = pupukName.includes('Cair') ? 'L' : 'kg';
        mockNotifs.push({
          id: 800 + idx,
          user_id: 1,
          title: `Stok ${pupukName} Menipis`,
          message: `Stok pupuk "${pupukName}" kurang dari kebutuhan pohon di seluruh Lahan. Tersedia: ${actualStock.toFixed(1)} ${unit}, Kebutuhan: ${requiredAmount.toFixed(1)} ${unit}. Harap lakukan pengisian stok atau pengolahan pupuk baru.`,
          is_read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });

    const combined = [...mockNotifs, ...(list || [])];
    notifications.value = combined.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (err: any) {
    error.value = err.message || 'Gagal memuat notifikasi';
    console.error('Error fetching notifications:', err);
  } finally {
    loading.value = false;
  }
}

async function markRead(id: string | number) {
  try {
    // If it's a mock notification, we don't need to call the API
    if (typeof id === 'number' && id >= 700) {
      const index = notifications.value.findIndex(n => n.id === id);
      if (index !== -1) {
        notifications.value[index] = {
          ...notifications.value[index]!,
          is_read: true,
        };
      }
      return;
    }
    await notificationsApi.markAsRead(id);
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value[index] = {
        ...notifications.value[index]!,
        is_read: true,
      };
    }
  } catch (err) {
    console.error('Error marking notification as read:', err);
  }
}

export function useNotifications() {
  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markRead,
  };
}
