import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PerkebunanHeader',
  props: {
    currentDateText: {
      type: String,
      required: true,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ['back', 'bell-click'],
  setup(props, { emit }) {
    const handleLogout = () => {
      emit('back')
    }

    return () => (
      <div class="perkebunan-header-shell">
        <div class="tablet-header-wrapper">
          <div class="tablet-logo-area" style="display: flex; align-items: center; gap: 0.4rem;">
            <img src="/icon/logo_farmease.png" alt="FarmEase Logo" class="tablet-logo" style="height: 1.8rem; width: 1.8rem;" />
            <span style="font-size: 1.15rem; font-weight: 800; color: #111827; letter-spacing: -0.02em; font-family: 'Nunito', sans-serif;"><span style="color: #38431f;">FARM</span>ease</span>
          </div>
          <div class="tablet-header-actions">
            <button class="action-bell-btn" style="position: relative;" onClick={() => emit('bell-click')}>
              <img src="/icon/notification/black-24.svg" alt="Notification" class="tablet-icon" />
              {props.unreadCount > 0 && (
                <span style="position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; font-size: 0.65rem; font-weight: 800; border-radius: 50%; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; line-height: 1;">
                  {props.unreadCount}
                </span>
              )}
            </button>
            <button class="action-logout-btn" onClick={handleLogout}>
              <img src="/icon/logout/black-24.svg" alt="Logout" class="tablet-icon" />
            </button>
          </div>
        </div>
      </div>
    )
  },
})
