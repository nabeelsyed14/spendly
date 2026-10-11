import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.jsx'
import { drainOnLaunch } from './lib/notifyCapture'
import { waitForInitialData } from './hooks/useData'

// Silent best-effort SMS drain: only runs when tracking is on and permission
// was already granted (never prompts on launch).
drainOnLaunch();

// Old APKs shipped a precaching service worker; it can keep serving stale
// bundles after an update. Remove it (and its caches) when running natively.
if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add('native');

  // Disable pinch/double-tap zoom inside the app WebView (web build stays zoomable).
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }

  navigator.serviceWorker?.getRegistrations?.()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {})
  window.caches?.keys?.()
    .then((keys) => keys.forEach((k) => window.caches.delete(k)))
    .catch(() => {})
}

// Seamless launch handoff: React wipes #root the instant it mounts.
// Clone the solid boot splash onto <body> as an opaque veil so the initial
// font load, theme/palette CSS vars, and IndexedDB hydration happen completely
// hidden from view, then cross-fade smoothly into the rock-solid dashboard.
const bootEl = document.querySelector('#root .boot');
let hideOverlay = () => {};

if (bootEl) {
  const overlay = bootEl.cloneNode(true);
  overlay.id = 'boot-overlay';
  overlay.style.transition = 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '99999';
  document.body.appendChild(overlay);

  let done = false;
  hideOverlay = () => {
    if (done) return;
    done = true;
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 320);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (bootEl) {
  const bootStart = Date.now();
  const MIN_SPLASH_MS = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350;
  const MAX_SPLASH_MS = 2000;

  const fontPromise = document.fonts?.ready ? document.fonts.ready : Promise.resolve();
  const dataPromise = waitForInitialData().catch(() => {});

  const readyPromise = Promise.all([fontPromise, dataPromise]);
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, MAX_SPLASH_MS));

  Promise.race([readyPromise, timeoutPromise]).then(() => {
    const elapsed = Date.now() - bootStart;
    const delay = Math.max(0, MIN_SPLASH_MS - elapsed);
    setTimeout(() => {
      requestAnimationFrame(() => hideOverlay());
    }, delay);
  });
}
