import { ref } from 'vue'
import { feedsApi, type Feed } from '@/shared/api'

export interface StockItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category?: string; // e.g., 'hijauan', 'vitamin', 'konsentrat', 'kotoran'
}

export interface StockEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export const stocks = ref<StockItem[]>([]);
export const stocksLoading = ref(false);
export const stocksError = ref<string | null>(null);
export const events = ref<StockEvent[]>([]);

function mapFeedToStock(feed: Feed): StockItem {
  return {
    id: String((feed as any).id_feed || feed.id),
    name: feed.feed_name,
    qty: feed.stock !== undefined && feed.stock !== null ? feed.stock : ((feed as any).available_stock || 0),
    unit: feed.unit,
    category: (feed.feed_type || (feed as any).category || 'umum').toLowerCase(),
  };
}

export async function fetchStocks() {
  try {
    stocksLoading.value = true;
    stocksError.value = null;
    const list = await feedsApi.getList();
    stocks.value = list.map(mapFeedToStock);
  } catch (err: unknown) {
    stocksError.value = err instanceof Error ? err.message : 'Gagal memuat stok pakan';
    console.error('Error fetching stocks:', err);
  } finally {
    stocksLoading.value = false;
  }
}

export function recordEvent(type: string, payload: any) {
  const ev: StockEvent = { id: `EV-${Date.now().toString().slice(-6)}`, type, payload, timestamp: Date.now() };
  events.value.unshift(ev);
  // cap history to 200 items to avoid unbounded growth
  if (events.value.length > 200) events.value.splice(200);
}

export function clearEvents() {
  events.value = [];
}

export default { stocks, events, fetchStocks, recordEvent, clearEvents }
