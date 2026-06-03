import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PerkebunanHeader',
  props: {
    currentDateText: {
      type: String,
      required: true,
    },
  },
  emits: ['back'],
  setup(props, { emit }) {
    const handleLogout = () => {
      // In a real app we would log out, here we go back to login/home
      emit('back')
    }

    return () => (
      <div class="perkebunan-header-shell">
        {/* Global Desktop/Tablet Top Header */}
        <div class="tablet-header-wrapper">
          <div class="tablet-logo-area">
            <img src="/icon/logo_farmease.png" alt="FarmEase Logo" class="tablet-logo" />
          </div>
          <div class="tablet-header-actions">
            <button class="action-bell-btn">
              <img src="/icon/notification/black-24.svg" alt="Notification" class="tablet-icon" />
            </button>
            <button class="action-logout-btn" onClick={handleLogout}>
              <img src="/icon/logout/black-24.svg" alt="Logout" class="tablet-icon" />
            </button>
          </div>
        </div>

        {/* Page Section Details (back button removed; header logout remains) */}
      </div>
    )
  },
})
