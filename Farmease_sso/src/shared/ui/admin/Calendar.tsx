import { defineComponent, ref, computed } from 'vue';
import '@/shared/assets/css/ui/admin/Calendar.css';

interface DayItem {
  date: number;
  monthType: 'prev' | 'current' | 'next';
  fullDate?: Date;
}

export default defineComponent({
  name: 'DatePicker',
  props: {
    modelValue: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isOpen = ref(false);
    const currentDate = ref(new Date());

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const currentMonthYear = computed(() => {
      const m = currentDate.value.getMonth();
      const y = currentDate.value.getFullYear();
      return `${monthNames[m]} ${y}`;
    });

    const calendarDays = computed<DayItem[]>(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();

      let firstDayIndex = new Date(year, month, 1).getDay();
      // Adjust from Sunday=0 to Monday=0
      firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

      const currMonthDaysNum = new Date(year, month + 1, 0).getDate();
      const prevMonthDaysNum = new Date(year, month, 0).getDate();

      const days: DayItem[] = [];

      // Preceding days from previous month
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        days.push({
          date: prevMonthDaysNum - i,
          monthType: 'prev'
        });
      }

      // Actual days of current month
      for (let i = 1; i <= currMonthDaysNum; i++) {
        days.push({
          date: i,
          monthType: 'current',
          fullDate: new Date(year, month, i)
        });
      }

      // Succeeding days from next month up to 42 cells (6 rows)
      const remainingCells = 42 - days.length;
      for (let i = 1; i <= remainingCells; i++) {
        days.push({
          date: i,
          monthType: 'next'
        });
      }

      return days;
    });

    const prevMonth = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
    };

    const nextMonth = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
    };

    const selectDay = (day: DayItem) => {
      if (day.monthType !== 'current' || !day.fullDate) return;
      const formatted = `${day.fullDate.getDate().toString().padStart(2, '0')} ${monthNames[day.fullDate.getMonth()]} ${day.fullDate.getFullYear()}`;
      emit('update:modelValue', formatted);
      isOpen.value = false;
    };

    const toggleCalendar = () => {
      isOpen.value = !isOpen.value;
    };

    // Close calendar when clicking inside while preventing it bubbling? Nah, just normal behavior for now.

    return () => (
      <div class="position-relative w-100" style={{ maxWidth: '300px' }}>
        {/* Input Toggle */}
        <div class="calendar-input bg-white border p-3 d-flex justify-content-between align-items-center rounded-3 cursor-pointer shadow-sm" onClick={toggleCalendar}>
          <span class={["text-sm", props.modelValue ? "text-dark fw-bold" : "text-secondary fw-bold"]}>
            {props.modelValue || 'Pilih tanggal'}
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EBEBEB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>

        {/* Dropdown Calendar */}
        {isOpen.value && (
          <div class="calendar-mockup bg-white border rounded-4 p-4 mt-2 position-absolute z-3 w-100 shadow">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <button class="btn btn-sm bg-white border rounded-circle p-1 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} onClick={prevMonth}>
                <img src="/icon/left-row.png" width="14" height="14" alt="Prev" />
              </button>
              <span class="fw-bold text-dark fs-6 border rounded-pill px-4 py-1">{currentMonthYear.value}</span>
              <button class="btn btn-sm bg-white border rounded-circle p-1 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} onClick={nextMonth}>
                <img src="/icon/right-row.png" width="14" height="14" alt="Next" />
              </button>
            </div>
            <div class="d-grid gap-3 text-center" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              <div class="text-danger fw-bold text-sm">Mo</div>
              <div class="text-dark fw-bold text-sm">Tu</div>
              <div class="text-dark fw-bold text-sm">We</div>
              <div class="text-dark fw-bold text-sm">Th</div>
              <div class="text-dark fw-bold text-sm">Fr</div>
              <div class="text-dark fw-bold text-sm">Sa</div>
              <div class="text-dark fw-bold text-sm">Su</div>
              
              {calendarDays.value.map((day, index) => {
                const isCurrent = day.monthType === 'current';
                const isSelected = isCurrent && day.fullDate && 
                  `${day.fullDate.getDate().toString().padStart(2, '0')} ${monthNames[day.fullDate.getMonth()]} ${day.fullDate.getFullYear()}` === props.modelValue;
                  
                const textColor = 
                  isSelected ? "text-white bg-success" : 
                  (isCurrent && index % 7 === 0) ? "text-danger" : 
                  isCurrent ? "text-dark" : "text-secondary opacity-50";

                const classes = [
                  "py-1 text-sm rounded transition-all",
                  textColor,
                  isCurrent ? "fw-bold cursor-pointer hover-bg" : "fw-normal",
                ];

                return (
                  <div 
                    key={`${day.monthType}-${index}`}
                    class={classes}
                    onClick={() => selectDay(day)}
                    style={isSelected ? { backgroundColor: 'var(--color-secondary)' } : undefined}
                  >
                    {day.date}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
});
