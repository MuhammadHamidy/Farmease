import { defineComponent, ref, computed, type PropType } from 'vue';
import '@/shared/assets/css/ui/admin/CalendarPicker.css';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const DAY_HEADERS = [
  { label: 'Min', red: true },
  { label: 'Sen', red: false },
  { label: 'Sel', red: false },
  { label: 'Rab', red: false },
  { label: 'Kam', red: false },
  { label: 'Jum', red: false },
  { label: 'Sab', red: false },
];

interface DayCell {
  date: number;
  type: 'prev' | 'current' | 'next';
  fullDate?: string; // YYYY-MM-DD
  isSunday: boolean;
  isToday: boolean;
}

export default defineComponent({
  name: 'CalendarPicker',
  props: {
    modelValue: { type: String as PropType<string | null>, default: null }, // YYYY-MM-DD
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    const viewDate = ref(new Date(today.getFullYear(), today.getMonth(), 1));

    const monthYearLabel = computed(() =>
      `${MONTH_NAMES[viewDate.value.getMonth()]} ${viewDate.value.getFullYear()}`
    );

    const cells = computed<DayCell[]>(() => {
      const year = viewDate.value.getFullYear();
      const month = viewDate.value.getMonth();

      // Week starts Sunday (index 0)
      const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrev = new Date(year, month, 0).getDate();

      const result: DayCell[] = [];

      // Previous month filler
      for (let i = firstDow - 1; i >= 0; i--) {
        result.push({ date: daysInPrev - i, type: 'prev', isSunday: false, isToday: false });
      }

      // Current month days
      for (let d = 1; d <= daysInMonth; d++) {
        const dow = new Date(year, month, d).getDay();
        const fullDate = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        result.push({
          date: d,
          type: 'current',
          fullDate,
          isSunday: dow === 0,
          isToday: fullDate === todayStr,
        });
      }

      // Next month filler to complete grid rows (multiples of 7)
      let n = 1;
      while (result.length % 7 !== 0) {
        result.push({ date: n++, type: 'next', isSunday: false, isToday: false });
      }

      return result;
    });

    const prevMonth = () => {
      const d = viewDate.value;
      viewDate.value = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    };
    const nextMonth = () => {
      const d = viewDate.value;
      viewDate.value = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    };
    const selectDay = (cell: DayCell) => {
      if (cell.type !== 'current' || !cell.fullDate) return;
      emit('update:modelValue', cell.fullDate);
    };

    return () => (
      <div class="cal-picker">
        {/* Navigation */}
        <div class="cal-nav">
          <button class="cal-nav-btn" onClick={prevMonth}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span class="cal-month-label">{monthYearLabel.value}</span>
          <button class="cal-nav-btn" onClick={nextMonth}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        {/* Day grid */}
        <div class="cal-grid">
          {/* Headers */}
          {DAY_HEADERS.map(h => (
            <div key={h.label} class={['cal-day-header', h.red ? 'red' : '']}>{h.label}</div>
          ))}
          {/* Day cells */}
          {cells.value.map((cell, i) => (
            <div
              key={`${cell.type}-${i}`}
              class={[
                'cal-day',
                cell.type !== 'current' ? 'other-month' : '',
                cell.isSunday && cell.type === 'current' ? 'sunday' : '',
                cell.isToday ? 'today' : '',
                cell.fullDate && cell.fullDate === props.modelValue ? 'selected' : '',
              ]}
              onClick={() => selectDay(cell)}
            >
              {cell.date}
            </div>
          ))}
        </div>
      </div>
    );
  }
});
