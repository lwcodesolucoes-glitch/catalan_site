'use strict';

// Local previews do not resolve directory URLs to index.html as a web server does.
if (location.protocol === 'file:') {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href?.endsWith('/') && !href.startsWith('http') && !href.startsWith('//')) {
      link.setAttribute('href', `${href}index.html`);
    }
  });
}

const measurementId = document.querySelector('meta[name="google-analytics-id"]')?.content.trim();
const analyticsConfigured = /^G-[A-Z0-9]+$/.test(measurementId || '') && !measurementId.includes('XXXX');
const consentKey = 'catalan_analytics_consent';
let analyticsLoaded = false;

function loadAnalytics() {
  if (!analyticsConfigured || analyticsLoaded) return;
  analyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);
}

function saveConsent(value) {
  localStorage.setItem(consentKey, value);
  document.querySelector('#analytics-consent')?.remove();
  if (analyticsConfigured) window[`ga-disable-${measurementId}`] = value !== 'granted';
  if (value === 'granted') {
    loadAnalytics();
    window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
  } else {
    window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  }
}

function showConsent() {
  document.querySelector('#analytics-consent')?.remove();
  const banner = document.createElement('section');
  banner.id = 'analytics-consent';
  banner.className = 'consent-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-labelledby', 'consent-title');
  banner.innerHTML = `
    <div>
      <h2 id="consent-title">Sua privacidade</h2>
      <p>Usamos métricas opcionais do Google Analytics para entender visitas e melhorar o atendimento. Elas só são ativadas com sua escolha.</p>
    </div>
    <div class="consent-actions">
      <button type="button" data-consent="denied">Recusar</button>
      <button type="button" class="consent-accept" data-consent="granted">Aceitar métricas</button>
    </div>`;
  banner.addEventListener('click', event => {
    const button = event.target.closest('[data-consent]');
    if (button) saveConsent(button.dataset.consent);
  });
  document.body.append(banner);
}

if (analyticsConfigured) {
  const consent = localStorage.getItem(consentKey);
  if (consent === 'granted') loadAnalytics();
  else if (consent !== 'denied') showConsent();
}

document.querySelector('#privacy-preferences')?.addEventListener('click', () => {
  if (analyticsConfigured) showConsent();
});

function track(name, parameters = {}) {
  if (analyticsLoaded && localStorage.getItem(consentKey) === 'granted') window.gtag('event', name, parameters);
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link) return;
  const href = link.href;
  if (href.includes('wa.me/')) {
    track('generate_lead', { method: 'whatsapp', link_url: href, link_text: link.textContent.trim() });
  } else if (href.includes('google.com/maps')) {
    track('select_content', { content_type: 'contact', item_id: 'google_maps' });
  } else if (href.includes('instagram.com/')) {
    track('select_content', { content_type: 'social', item_id: 'instagram' });
  } else if (link.protocol === 'tel:') {
    track('generate_lead', { method: 'phone' });
  } else if (link.protocol === 'mailto:') {
    track('generate_lead', { method: 'email' });
  }
});
