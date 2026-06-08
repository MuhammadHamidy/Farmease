import { onMounted, onUnmounted, ref } from 'vue';

/**
 * Composable: useInactivityTimer
 * Auto-logout after a period of user inactivity (FR1-02)
 *
 * @param timeoutMs - inactivity timeout in milliseconds (default: 15 minutes)
 * @param warningMs - warning before timeout in milliseconds (default: 1 minute before)
 * @param onTimeout - callback when timeout fires (e.g. logout + redirect)
 */
export function useInactivityTimer(
  timeoutMs: number = 15 * 60 * 1000,
  warningMs: number = 1 * 60 * 1000,
  onTimeout: () => void,
) {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  let warningHandle: ReturnType<typeof setTimeout> | null = null;

  const showWarning = ref(false);
  const secondsLeft = ref(60);
  let countdownHandle: ReturnType<typeof setInterval> | null = null;

  const clearTimers = () => {
    if (timeoutHandle) { clearTimeout(timeoutHandle); timeoutHandle = null; }
    if (warningHandle) { clearTimeout(warningHandle); warningHandle = null; }
    if (countdownHandle) { clearInterval(countdownHandle); countdownHandle = null; }
    showWarning.value = false;
    secondsLeft.value = 60;
  };

  const startCountdown = () => {
    secondsLeft.value = Math.round(warningMs / 1000);
    showWarning.value = true;
    countdownHandle = setInterval(() => {
      secondsLeft.value -= 1;
      if (secondsLeft.value <= 0) {
        if (countdownHandle) clearInterval(countdownHandle);
      }
    }, 1000);
  };

  const resetTimer = () => {
    clearTimers();

    warningHandle = setTimeout(() => {
      startCountdown();
    }, timeoutMs - warningMs);

    timeoutHandle = setTimeout(() => {
      clearTimers();
      onTimeout();
    }, timeoutMs);
  };

  const EVENTS: string[] = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];

  const handleActivity = () => {
    if (showWarning.value) return; // don't reset during warning window
    resetTimer();
  };

  onMounted(() => {
    resetTimer();
    EVENTS.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));
  });

  onUnmounted(() => {
    clearTimers();
    EVENTS.forEach((ev) => window.removeEventListener(ev, handleActivity));
  });

  return { showWarning, secondsLeft };
}
