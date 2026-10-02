import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.jsx'

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
