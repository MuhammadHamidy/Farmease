import { ref, computed } from 'vue';
import { notificationsApi, feedsApi, type Notification } from '@/shared/api';

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
    
    // Map backend response fields to local Vue notification format
    const mapped = (list || []).map((n: any) => ({
      id: n.id_notification || n.id,
      user_id: n.id_account || n.user_id,
      title: n.title,
      message: n.message,
      is_read: n.is_read,
      created_at: n.created_at,
      updated_at: n.updated_at || n.created_at,
    }));

    // Fetch feed stocks to check if there is any critical stock!
    try {
      const feeds = await feedsApi.getList();
      const hasCritical = (feeds || []).some(f => 
        (f.feed_type || '').toLowerCase() === 'konsentrat' && 
        (f.stock || 0) < 100
      );
      if (hasCritical) {
        const alreadyExists = mapped.some((n: any) => n.id === 'mock-critical-stock-notification');
        if (!alreadyExists) {
          mapped.push({
            id: 'mock-critical-stock-notification',
            user_id: 'system',
            title: '🚨 ALARM: Stok Pakan Kritis!',
            message: 'Stok pakan kategori Konsentrat berada di bawah ambang batas minimum aman (100 kg). Harap segera lakukan pengisian stok di gudang.',
            is_read: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch feeds for notification check:', e);
    }

    // Sort by latest first
    notifications.value = mapped.sort(
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
    if (id !== 'mock-critical-stock-notification') {
      await notificationsApi.markAsRead(id);
    }
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
