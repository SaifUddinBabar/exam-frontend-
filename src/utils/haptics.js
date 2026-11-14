/**
 * Examino Haptic Touch & Micro-interaction Utility
 * Provides tactile feedback for mobile and smooth interaction across devices.
 */
export function triggerHaptic(type = "light") {
  if (typeof window === "undefined" || !window.navigator || !window.navigator.vibrate) {
    return;
  }
  try {
    switch (type) {
      case "light":
        window.navigator.vibrate(10);
        break;
      case "medium":
        window.navigator.vibrate(20);
        break;
      case "success":
        window.navigator.vibrate([12, 40, 15]);
        break;
      case "warning":
        window.navigator.vibrate([25, 40, 25]);
        break;
      case "error":
        window.navigator.vibrate([40, 30, 40, 30, 50]);
        break;
      default:
        window.navigator.vibrate(10);
    }
  } catch (e) {
    // Graceful fallback for browsers without vibrate permissions
  }
}
