import { ref, watch } from 'vue'

export interface StockItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category?: string; // e.g., 'perkebunan', 'vitamin', 'konsentrat'
}

export interface StockEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

const STORAGE_KEY_STOCKS = 'fe:peternakan:stocks';
const STORAGE_KEY_EVENTS = 'fe:peternakan:events';

const defaultStocks: StockItem[] = [
  { id: 'FS-001', name: 'Rumput Gajah (Hijauan)', qty: 200, unit: 'kg', category: 'hijauan' },
  { id: 'FS-002', name: 'Ampas Tahu', qty: 80, unit: 'kg', category: 'hijauan' },
  { id: 'VT-001', name: 'Vitamin A', qty: 50, unit: 'botol', category: 'vitamin' },
  { id: 'KT-001', name: 'Konsentrat', qty: 120, unit: 'kg', category: 'konsentrat' },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn('Failed to load', key, error);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save', key, error);
  }
}

export const stocks = ref<StockItem[]>(loadFromStorage<StockItem[]>(STORAGE_KEY_STOCKS, defaultStocks));
export const events = ref<StockEvent[]>(loadFromStorage<StockEvent[]>(STORAGE_KEY_EVENTS, []));

// Persist stocks and events automatically when they change
watch(stocks, (value) => saveToStorage(STORAGE_KEY_STOCKS, value), { deep: true });
watch(events, (value) => saveToStorage(STORAGE_KEY_EVENTS, value), { deep: true });

export function addStock(item: Omit<StockItem, 'id'>) {
  const nameSafe = item.name || 'PK';
  const prefix = nameSafe.split(' ')[0] || 'PK';
  const id = `${prefix.toUpperCase().slice(0,2)}-${Date.now().toString().slice(-4)}`;
  const newItem: StockItem = { id, ...item };
  stocks.value.push(newItem);
  recordEvent('add_stock', { item: newItem });
}

export function consumeStock(id: string, amount: number) {
  const item = stocks.value.find(stock => stock.id === id);
  if (!item) return false;
  const before = item.qty;
  item.qty = Math.max(0, item.qty - amount);
  recordEvent('consume_stock', { id, amount, before, after: item.qty });
  return true;
}

export function adjustStock(id: string, qty: number) {
  const item = stocks.value.find(stock => stock.id === id);
  if (!item) return false;
  const before = item.qty;
  item.qty = qty;
  recordEvent('adjust_stock', { id, before, after: qty });
  return true;
}

export function recordEvent(type: string, payload: any) {
  const eventItem: StockEvent = { id: `EV-${Date.now().toString().slice(-6)}`, type, payload, timestamp: Date.now() };
  events.value.unshift(eventItem);
  // cap history to 200 items to avoid unbounded growth
  if (events.value.length > 200) events.value.splice(200);
}

export function clearEvents() {
  events.value = [];
}

export default { stocks, events, addStock, consumeStock, adjustStock, recordEvent, clearEvents }
