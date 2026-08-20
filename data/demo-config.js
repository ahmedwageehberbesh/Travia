/** Client app runs in frontend-only demo mode (no backend required). */
export const CLIENT_DEMO_MODE = true;

/** Simulated network delay for demo UX. */
export const DEMO_DELAY_MS = 350;

export function demoDelay(ms = DEMO_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
