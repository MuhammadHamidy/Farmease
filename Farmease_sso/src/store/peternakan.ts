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
  } catch (e) {
    console.warn('Failed to load', key, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save', key, e);
  }
}

export const stocks = ref<StockItem[]>(loadFromStorage<StockItem[]>(STORAGE_KEY_STOCKS, defaultStocks));
export const events = ref<StockEvent[]>(loadFromStorage<StockEvent[]>(STORAGE_KEY_EVENTS, []));

// Persist stocks and events automatically when they change
watch(stocks, (v) => saveToStorage(STORAGE_KEY_STOCKS, v), { deep: true });
watch(events, (v) => saveToStorage(STORAGE_KEY_EVENTS, v), { deep: true });

export function addStock(item: Omit<StockItem, 'id'>) {
  const nameSafe = item.name || 'PK';
  const prefix = nameSafe.split(' ')[0] || 'PK';
  const id = `${prefix.toUpperCase().slice(0,2)}-${Date.now().toString().slice(-4)}`;
  const newItem: StockItem = { id, ...item };
  stocks.value.push(newItem);
  recordEvent('add_stock', { item: newItem });
}

export function consumeStock(id: string, amount: number) {
  const i = stocks.value.find(s => s.id === id);
  if (!i) return false;
  const before = i.qty;
  i.qty = Math.max(0, i.qty - amount);
  recordEvent('consume_stock', { id, amount, before, after: i.qty });
  return true;
}

export function adjustStock(id: string, qty: number) {
  const i = stocks.value.find(s => s.id === id);
  if (!i) return false;
  const before = i.qty;
  i.qty = qty;
  recordEvent('adjust_stock', { id, before, after: qty });
  return true;
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

export default { stocks, events, addStock, consumeStock, adjustStock, recordEvent, clearEvents }
