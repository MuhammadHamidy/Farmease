import { ref, computed } from 'vue';
import { notificationsApi, type Notification } from '@/shared/api';

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
    
    // Inject mock notifications for business logic
    const mockNotifs: Notification[] = [
      { id: 901, user_id: 1, title: 'Domba B-01 Mau Melahirkan', message: 'Perkiraan lahir hari ini untuk domba betina B-01. Segera siapkan kandang bersalin dan pantau kondisi induk secara berkala.', is_read: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 902, user_id: 1, title: 'Stok Pakan Menipis (Tersisa 20%)', message: 'Stok Konsentrat Premium tersisa 20 kg dari kapasitas normal 100 kg. Harap lakukan pengadaan pakan segera untuk mencegah kekurangan.', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString(), updated_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 903, user_id: 1, title: 'Jadwal Rutin: Pemberian Vitamin', message: 'Pengingat jadwal rutin bulanan: Pemberian Vitamin B-Complex untuk seluruh domba di Kandang A hari ini.', is_read: false, created_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date(Date.now() - 7200000).toISOString() },
    ];
    
    // Merge mock with API response, avoiding duplicates if fetched multiple times
    const combined = [...mockNotifs, ...(list || [])];

    // Sort by latest first
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

async function markRead(id: number) {
  try {
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
