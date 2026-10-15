import JSZip from 'jszip';
import QRCode from 'qrcode';

export interface MiniSiteConfig {
  id?: string;
  companyName: string;
  niche: string;
  city: string;
  tagline?: string;
  bio?: string;
  logoUrl?: string;
  primaryColor?: string;
  theme?: 'dark_neon' | 'glass_luxury' | 'sunset_purple' | 'emerald_pro' | 'cyber_blue';
  
  // 1-Click Action Buttons
  whatsappNumber?: string;
  whatsappMessage?: string;
  instagramUrl?: string;
  instagramHandle?: string;
  telegramUrl?: string;
  tiktokUrl?: string;
  websiteUrl?: string;
  googleReviewUrl?: string;
  
  // 1-Click Pix
  pixKey?: string;
  pixKeyType?: 'cnpj' | 'cpf' | 'telefone' | 'email' | 'aleatoria';
  pixBeneficiary?: string;
  
  // 1-Click Wi-Fi
  wifiSsid?: string;
  wifiPassword?: string;
  wifiSecurity?: 'WPA' | 'WEP' | 'nopass';
  
  // Location, Contact & Details
  address?: string;
  phone?: string;
  openingHours?: string;
  rating?: number;
  reviewCount?: number;
}

export function formatMiniSitePhone(phone: string = ''): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '5511999999999';
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.startsWith('55')) return digits;
  return `55${digits}`;
}

export function buildMiniSiteWhatsappUrl(phone: string = '', message: string = ''): string {
  const num = formatMiniSitePhone(phone);
  const msg = message || 'Olá! Vi seu Mini Site e gostaria de atendimento.';
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

export function sanitizeMiniSiteHandle(urlOrHandle: string = '', prefix: string = ''): string {
  let clean = urlOrHandle.trim();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?(instagram\.com|tiktok\.com|t\.me)\//i, '');
  clean = clean.replace(/^@/, '');
  clean = clean.replace(/\/$/, '');
  return clean ? `${prefix}${clean}` : '';
}

export interface QrCodeOverrides {
  pixQrUrl?: string;
  wifiQrUrl?: string;
}

/**
 * Generates standalone static HTML string for the Mini Site.
 * Can be called synchronously with fallback online QR codes,
 * or with pre-generated embedded Base64 data URLs.
 */
export function generateMiniSiteHtml(config: MiniSiteConfig, qrOverrides?: QrCodeOverrides): string {
  const name = (config.companyName || 'Sua Empresa').trim();
  const niche = (config.niche || 'Atendimento Exclusivo').trim();
  const city = (config.city || 'Brasil').trim();
  const tagline = config.tagline || `${niche} de excelência em ${city}`;
  const initial = (name.charAt(0) || 'A').toUpperCase();
  
  const whatsappUrl = buildMiniSiteWhatsappUrl(
    config.whatsappNumber || config.phone || '5511999999999',
    config.whatsappMessage || `Olá! Vim através do Mini Site de ${name}. Gostaria de mais informações!`
  );
  
  const instaHandle = sanitizeMiniSiteHandle(config.instagramUrl || '', '@');
  const instaUrl = config.instagramUrl
    ? (config.instagramUrl.startsWith('http') ? config.instagramUrl : `https://instagram.com/${config.instagramUrl.replace(/^@/, '')}`)
    : 'https://instagram.com';

  const telegramUrl = config.telegramUrl
    ? (config.telegramUrl.startsWith('http') ? config.telegramUrl : `https://t.me/${config.telegramUrl.replace(/^@/, '')}`)
    : '';

  const tiktokHandle = sanitizeMiniSiteHandle(config.tiktokUrl || '', '@');
  const tiktokUrl = config.tiktokUrl
    ? (config.tiktokUrl.startsWith('http') ? config.tiktokUrl : `https://tiktok.com/@${config.tiktokUrl.replace(/^@/, '')}`)
    : '';

  const siteUrl = config.websiteUrl
    ? (config.websiteUrl.startsWith('http') ? config.websiteUrl : `https://${config.websiteUrl}`)
    : '';

  const reviewUrl = config.googleReviewUrl || 'https://maps.google.com';
  
  const pixKey = config.pixKey || 'pix@empresa.com.br';
  const pixBeneficiary = config.pixBeneficiary || name;
  const pixType = (config.pixKeyType || 'Chave Pix').toUpperCase();

  const wifiSsid = config.wifiSsid || `${name.replace(/\s+/g, '_')}_WiFi`;
  const wifiPass = config.wifiPassword || 'VisiteNos123';
  const wifiSec = config.wifiSecurity || 'WPA';
  const wifiQrData = `WIFI:T:${wifiSec};S:${wifiSsid};P:${wifiPass};;`;

  // Use embedded Base64 QR code if supplied, otherwise fallback to fast URL
  const wifiQrUrl = qrOverrides?.wifiQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(wifiQrData)}`;
  const pixQrUrl = qrOverrides?.pixQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(pixKey)}`;

  // Address & Google Maps route URL
  const addressText = config.address ? config.address.trim() : '';
  const mapsSearchUrl = addressText ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText + ' ' + city)}` : '';

  // Phone direct call
  const phoneDigits = config.phone ? config.phone.replace(/\D/g, '') : '';
  const phoneCallUrl = phoneDigits ? `tel:${phoneDigits}` : '';

  // Theme palettes
  const theme = config.theme || 'dark_neon';
  let bgGradient = 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #030712 100%)';
  let accentColor = '#38bdf8';
  let cardBg = 'rgba(255, 255, 255, 0.04)';
  let cardBorder = 'rgba(255, 255, 255, 0.1)';
  let glowColor = 'rgba(56, 189, 248, 0.25)';

  if (theme === 'glass_luxury') {
    bgGradient = 'linear-gradient(135deg, #111827 0%, #1e1b4b 50%, #0f172a 100%)';
    accentColor = '#818cf8';
    glowColor = 'rgba(129, 140, 248, 0.3)';
  } else if (theme === 'sunset_purple') {
    bgGradient = 'linear-gradient(135deg, #18052e 0%, #2e1065 50%, #090214 100%)';
    accentColor = '#e879f9';
    glowColor = 'rgba(232, 121, 249, 0.3)';
  } else if (theme === 'emerald_pro') {
    bgGradient = 'linear-gradient(135deg, #021a10 0%, #064e3b 50%, #02140d 100%)';
    accentColor = '#34d399';
    glowColor = 'rgba(52, 211, 153, 0.3)';
  } else if (theme === 'cyber_blue') {
    bgGradient = 'linear-gradient(135deg, #031b33 0%, #0c4a6e 50%, #021324 100%)';
    accentColor = '#38bdf8';
    glowColor = 'rgba(56, 189, 248, 0.35)';
  }

  const exportDate = new Date().toLocaleDateString('pt-BR');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<!-- 
  ==========================================================================
  MINI SITE ESTÁTICO AUTÔNOMO - ${name}
  Gerado por ALF Automação / Hub NFC & Link-in-Bio
  Data de Geração: ${exportDate}
  
  ESTE É UM ARQUIVO 100% ESTÁTICO E INDEPENDENTE:
  - Não requer banco de dados ou servidor back-end.
  - Pode ser hospedado gratuitamente no Netlify, Vercel, GitHub Pages, Firebase
    ou em qualquer hospedagem cPanel/Apache/NGINX como 'index.html'.
  - Funciona até mesmo offline abrindo diretamente com 2 cliques no navegador!
  ==========================================================================
-->
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${name} - Conexão Inteligente &amp; Links</title>
  <meta name="description" content="Mini Site oficial de ${name}. Acesse WhatsApp, Instagram, Pix, Wi-Fi e avaliações com 1 clique.">
  <meta name="theme-color" content="#0f172a">

  <!-- OpenGraph Social Share -->
  <meta property="og:title" content="${name} - Mini Site Oficial">
  <meta property="og:description" content="${tagline}">
  <meta property="og:type" content="website">

  <!-- Fonts with fallback to system fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    body {
      background: ${bgGradient};
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 24px 16px 48px;
      overflow-x: hidden;
      position: relative;
    }

    /* Ambient dynamic glows */
    .ambient-glow {
      position: fixed;
      width: 380px;
      height: 380px;
      border-radius: 50%;
      background: ${glowColor};
      filter: blur(100px);
      pointer-events: none;
      z-index: 0;
      opacity: 0.6;
      animation: float 12s ease-in-out infinite alternate;
    }
    .ambient-glow-top { top: -100px; left: 50%; transform: translateX(-50%); }
    .ambient-glow-bottom { bottom: -120px; right: 10%; background: ${glowColor}; }

    @keyframes float {
      0% { transform: translate(-50%, 0) scale(1); }
      100% { transform: translate(-45%, 40px) scale(1.15); }
    }

    .container {
      width: 100%;
      max-width: 440px;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 14px;
      position: relative;
    }

    /* Header Profile Card */
    .profile-card {
      background: ${cardBg};
      border: 1px solid ${cardBorder};
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 28px;
      padding: 28px 20px 22px;
      text-align: center;
      position: relative;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
    }

    .avatar-wrapper {
      position: relative;
      width: 88px;
      height: 88px;
      margin: 0 auto 16px;
    }

    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 26px;
      background: linear-gradient(135deg, ${accentColor}, #2563eb);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 38px;
      font-weight: 900;
      color: #ffffff;
      box-shadow: 0 10px 25px -5px ${glowColor};
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .verified-badge {
      position: absolute;
      bottom: -4px;
      right: -4px;
      background: #3b82f6;
      color: white;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #0f172a;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }

    .company-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .niche-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 12px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.08);
      color: ${accentColor};
      border: 1px solid rgba(255, 255, 255, 0.12);
      margin-bottom: 8px;
    }

    .bio-text {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
      max-width: 320px;
      margin: 0 auto;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #34d399;
      background: rgba(52, 211, 153, 0.1);
      border: 1px solid rgba(52, 211, 153, 0.25);
      padding: 4px 12px;
      border-radius: 12px;
      margin-top: 10px;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 8px #34d399;
      animation: pulse 2s infinite;
    }

    .hours-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 3px 10px;
      border-radius: 8px;
      margin-top: 6px;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    /* Action Buttons List */
    .buttons-group {
      display: flex;
      flex-direction: column;
      gap: 11px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 18px;
      border-radius: 22px;
      background: ${cardBg};
      border: 1px solid ${cardBorder};
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      text-decoration: none;
      color: #f8fafc;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 20px -8px rgba(0,0,0,0.3);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      width: 100%;
      text-align: left;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.22);
      box-shadow: 0 14px 28px -10px rgba(0,0,0,0.5);
    }

    .action-btn:active {
      transform: scale(0.98);
    }

    .btn-left {
      display: flex;
      align-items: center;
      gap: 13px;
      min-width: 0;
      flex: 1;
    }

    .btn-icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }

    .btn-icon svg {
      width: 22px;
      height: 22px;
    }

    .btn-info {
      text-align: left;
      min-width: 0;
      flex: 1;
    }

    .btn-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .btn-subtitle {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 500;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-badge {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 8px;
      letter-spacing: 0.05em;
    }

    .btn-arrow {
      color: #64748b;
      transition: transform 0.2s ease;
      flex-shrink: 0;
      margin-left: 8px;
    }

    .action-btn:hover .btn-arrow {
      color: #f8fafc;
      transform: translateX(3px);
    }

    /* Button Specific Themes */
    .btn-google .btn-icon {
      background: linear-gradient(135deg, #4285F4, #34A853);
      color: white;
    }
    .btn-google {
      background: linear-gradient(135deg, rgba(66, 133, 244, 0.12), rgba(251, 188, 4, 0.08));
      border-color: rgba(251, 188, 4, 0.35);
    }
    .btn-google:hover {
      border-color: rgba(251, 188, 4, 0.65);
      box-shadow: 0 12px 25px -8px rgba(251, 188, 4, 0.25);
    }

    .btn-whatsapp .btn-icon {
      background: linear-gradient(135deg, #25D366, #128C7E);
      color: white;
    }
    .btn-whatsapp {
      border-color: rgba(37, 211, 102, 0.28);
    }
    .btn-whatsapp:hover {
      border-color: rgba(37, 211, 102, 0.55);
      box-shadow: 0 12px 25px -8px rgba(37, 211, 102, 0.3);
    }

    .btn-wifi .btn-icon {
      background: linear-gradient(135deg, #0ea5e9, #3b82f6);
      color: white;
    }
    .btn-wifi {
      border-color: rgba(14, 165, 233, 0.3);
    }
    .btn-wifi:hover {
      border-color: rgba(14, 165, 233, 0.6);
      box-shadow: 0 12px 25px -8px rgba(14, 165, 233, 0.25);
    }

    .btn-pix .btn-icon {
      background: linear-gradient(135deg, #32BCAD, #16887B);
      color: white;
    }
    .btn-pix {
      border-color: rgba(50, 188, 173, 0.3);
    }
    .btn-pix:hover {
      border-color: rgba(50, 188, 173, 0.6);
      box-shadow: 0 12px 25px -8px rgba(50, 188, 173, 0.25);
    }

    .btn-instagram .btn-icon {
      background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
      color: white;
    }
    .btn-instagram {
      border-color: rgba(225, 48, 108, 0.25);
    }
    .btn-instagram:hover {
      border-color: rgba(225, 48, 108, 0.55);
      box-shadow: 0 12px 25px -8px rgba(225, 48, 108, 0.3);
    }

    .btn-maps .btn-icon {
      background: linear-gradient(135deg, #ea4335, #fbbc04);
      color: white;
    }
    .btn-maps {
      border-color: rgba(234, 67, 53, 0.28);
    }
    .btn-maps:hover {
      border-color: rgba(234, 67, 53, 0.55);
      box-shadow: 0 12px 25px -8px rgba(234, 67, 53, 0.3);
    }

    .btn-phone .btn-icon {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
    }
    .btn-phone {
      border-color: rgba(59, 130, 246, 0.3);
    }

    .btn-site .btn-icon {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
    }

    .btn-telegram .btn-icon {
      background: linear-gradient(135deg, #2AABEE, #229ED9);
      color: white;
    }

    .btn-tiktok .btn-icon {
      background: linear-gradient(135deg, #000000, #1f1f1f);
      border: 1px solid #fe2c55;
      color: white;
    }

    /* Modal dialog styles (Pix & Wi-Fi) */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(3, 7, 18, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-overlay.active {
      display: flex;
      animation: modalFade 0.2s ease-out;
    }

    @keyframes modalFade {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-content {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 28px;
      padding: 28px 24px;
      max-width: 360px;
      width: 100%;
      text-align: center;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);
    }

    .modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.15s ease;
    }
    .modal-close:hover {
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
    }

    .qr-container {
      background: white;
      border-radius: 20px;
      padding: 12px;
      width: 200px;
      height: 200px;
      margin: 16px auto;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
    }
    .qr-container img {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 12px;
      object-fit: contain;
    }

    .modal-btn {
      width: 100%;
      padding: 14px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
      margin-top: 12px;
    }
    .modal-btn:active {
      transform: scale(0.98);
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
      z-index: 200;
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      pointer-events: none;
    }
    .toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* Footer Branding */
    .footer {
      text-align: center;
      padding-top: 16px;
      font-size: 11px;
      color: #64748b;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .footer strong {
      color: #94a3b8;
    }
    .footer-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <div class="ambient-glow ambient-glow-top"></div>
  <div class="ambient-glow ambient-glow-bottom"></div>

  <main class="container">
    
    <!-- Profile Card -->
    <header class="profile-card">
      <div class="avatar-wrapper">
        <div class="avatar">
          ${config.logoUrl ? `<img src="${config.logoUrl}" alt="${name}" onerror="this.style.display='none'">` : initial}
        </div>
        <div class="verified-badge" title="Empresa Verificada">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>

      <h1 class="company-title">${name}</h1>
      <div class="niche-badge">${niche} • ${city}</div>
      <p class="bio-text">${tagline}</p>

      ${config.openingHours ? `
      <div class="hours-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>${config.openingHours}</span>
      </div>
      ` : ''}

      <div class="status-pill">
        <span class="status-dot"></span>
        <span>Aberto agora • Atendimento Online</span>
      </div>
    </header>

    <!-- Action Buttons -->
    <div class="buttons-group">

      <!-- 1. GOOGLE REVIEW (Avaliação 5 Estrelas) -->
      <a href="${reviewUrl}" target="_blank" rel="noopener noreferrer" class="action-btn btn-google">
        <div class="btn-left">
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="btn-info">
            <div class="btn-title">
              <span>Avaliar no Google</span>
              <span class="btn-badge" style="background:#fef08a;color:#854d0e;">⭐⭐⭐⭐⭐</span>
            </div>
            <div class="btn-subtitle">Avalie nosso atendimento em 5 segundos</div>
          </div>
        </div>
        <div class="btn-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </a>

      <!-- 2. WHATSAPP DIRETO -->
      <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="action-btn btn-whatsapp">
        <div class="btn-left">
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
            </svg>
          </div>
          <div class="btn-info">
            <div class="btn-title">
              <span>WhatsApp Direto</span>
              <span class="btn-badge" style="background:#dcfce7;color:#166534;">1-Clique</span>
            </div>
            <div class="btn-subtitle">Fale com nossa equipe agora mesmo</div>
          </div>
        </div>
        <div class="btn-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </a>

      <!-- 3. WI-FI COM 1 CLIQUE -->
      <button type="button" onclick="openWifiModal()" class="action-btn btn-wifi">
        <div class="btn-left">
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
              <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
          </div>
          <div class="btn-info">
            <div class="btn-title">
              <span>Conectar ao Wi-Fi</span>
              <span class="btn-badge" style="background:#e0f2fe;color:#0369a1;">Grátis</span>
            </div>
            <div class="btn-subtitle">Conexão instantânea sem digitar senha</div>
          </div>
        </div>
        <div class="btn-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </button>

      <!-- 4. PIX (1-CLIQUE COPIA & QR CODE) -->
      <button type="button" onclick="handlePixClick()" class="action-btn btn-pix">
        <div class="btn-left">
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.654 6.786l-2.654 2.654-2.654-2.654 2.654-2.654 2.654 2.654zm-2.654 7.786l2.654-2.654 2.654 2.654-2.654 2.654-2.654-2.654zm7.786-2.654l2.654-2.654-2.654-2.654-2.654 2.654 2.654 2.654zm-15.572 0l-2.654-2.654 2.654-2.654 2.654 2.654-2.654 2.654z"/>
            </svg>
          </div>
          <div class="btn-info">
            <div class="btn-title">
              <span>Pagamento via Pix</span>
              <span class="btn-badge" style="background:#ccfbf1;color:#115e59;">Copia &amp; Cola</span>
            </div>
            <div class="btn-subtitle">Copie a chave Pix com 1 toque ou veja o QR Code</div>
          </div>
        </div>
        <div class="btn-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </button>

      <!-- 5. INSTAGRAM -->
      <a href="${instaUrl}" target="_blank" rel="noopener noreferrer" class="action-btn btn-instagram">
        <div class="btn-left">
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <div class="btn-info">
            <div class="btn-title">
              <span>Instagram Oficial</span>
              ${instaHandle ? `<span style="font-size:11px;color:#f472b6;">${instaHandle}</span>` : ''}
            </div>
            <div class="btn-subtitle">Siga nossas novidades, fotos e stories</div>
          </div>
        </div>
        <div class="btn-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </a>

      <!-- 6. ENDEREÇO & COMO CHEGAR (se cadastrado) -->
      ${addressText ? `
      <a href="${mapsSearchUrl}" target="_blank" rel="noopener noreferrer" class="action-btn btn-maps">
        <div class="btn-left">
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div class="btn-info">
            <div class="btn-title">
              <span>Como Chegar / Endereço</span>
              <span class="btn-badge" style="background:#fee2e2;color:#991b1b;">Maps</span>
            </div>
            <div class="btn-subtitle">${addressText}</div>
          </div>
        </div>
        <div class="btn-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </a>
      ` : ''}

      <!-- 7. LIGAR DIRETO (se cadastrado) -->
      ${phoneCallUrl ? `
      <a href="${phoneCallUrl}" class="action-btn btn-phone">
        <div class="btn-left">
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div class="btn-info">
            <div class="btn-title">
              <span>Ligar no Telefone</span>
              <span class="btn-badge" style="background:#dbeafe;color:#1e40af;">Ligação</span>
            </div>
            <div class="btn-subtitle">${config.phone || 'Atendimento comercial direto'}</div>
          </div>
        </div>
        <div class="btn-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </a>
      ` : ''}

      <!-- 8. SITE OFICIAL (se configurado) -->
      ${siteUrl ? `
      <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" class="action-btn btn-site">
        <div class="btn-left">
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <div class="btn-info">
            <div class="btn-title">
              <span>Nosso Site Oficial</span>
              <span class="btn-badge" style="background:#e0e7ff;color:#3730a3;">Web</span>
            </div>
            <div class="btn-subtitle">Cardápio, portfólio e serviços completos</div>
          </div>
        </div>
        <div class="btn-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </a>
      ` : ''}

      <!-- 9. TELEGRAM (se configurado) -->
      ${telegramUrl ? `
      <a href="${telegramUrl}" target="_blank" rel="noopener noreferrer" class="action-btn btn-telegram">
        <div class="btn-left">
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.46c.536-.196 1.006.128.832.945z"/>
            </svg>
          </div>
          <div class="btn-info">
            <div class="btn-title"><span>Canal no Telegram</span></div>
            <div class="btn-subtitle">Avisos e promoções exclusivas</div>
          </div>
        </div>
        <div class="btn-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </a>
      ` : ''}

      <!-- 10. TIKTOK (se configurado) -->
      ${tiktokUrl ? `
      <a href="${tiktokUrl}" target="_blank" rel="noopener noreferrer" class="action-btn btn-tiktok">
        <div class="btn-left">
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </div>
          <div class="btn-info">
            <div class="btn-title"><span>TikTok</span></div>
            <div class="btn-subtitle">${tiktokHandle || 'Vídeos e novidades'}</div>
          </div>
        </div>
        <div class="btn-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </a>
      ` : ''}

    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        <span>Mini Site NFC Integrado</span>
      </div>
      <p>&copy; ${new Date().getFullYear()} <strong>${name}</strong>. Todos os direitos reservados.</p>
    </footer>

  </main>

  <!-- PIX MODAL -->
  <div id="pixModal" class="modal-overlay">
    <div class="modal-content">
      <button class="modal-close" onclick="closePixModal()">✕</button>
      <div style="width:48px;height:48px;border-radius:14px;background:#32BCAD;color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.654 6.786l-2.654 2.654-2.654-2.654 2.654-2.654 2.654 2.654zm-2.654 7.786l2.654-2.654 2.654 2.654-2.654 2.654-2.654-2.654zm7.786-2.654l2.654-2.654-2.654-2.654-2.654 2.654 2.654 2.654zm-15.572 0l-2.654-2.654 2.654-2.654 2.654 2.654-2.654 2.654z"/>
        </svg>
      </div>
      <h3 style="font-size:18px;font-weight:800;color:white;margin-bottom:4px;">Chave Pix Instantânea</h3>
      <p style="font-size:12px;color:#94a3b8;margin-bottom:12px;">Escaneie o QR Code ou copie a chave abaixo:</p>
      
      <div class="qr-container">
        <img src="${pixQrUrl}" alt="QR Code Pix" onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixKey)}'">
      </div>

      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:10px 14px;text-align:left;margin-bottom:12px;">
        <span style="font-size:10px;text-transform:uppercase;font-weight:700;color:#94a3b8;display:block;">${pixType}:</span>
        <span id="pixKeyText" style="font-size:13px;font-family:monospace;font-weight:700;color:#38bdf8;word-break:break-all;">${pixKey}</span>
        <span style="font-size:11px;color:#cbd5e1;display:block;margin-top:2px;">Favorecido: <strong>${pixBeneficiary}</strong></span>
      </div>

      <button type="button" class="modal-btn" style="background:#32BCAD;color:#042f2e;" onclick="copyPixFromModal()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>Copiar Chave Pix</span>
      </button>
    </div>
  </div>

  <!-- WI-FI MODAL -->
  <div id="wifiModal" class="modal-overlay">
    <div class="modal-content">
      <button class="modal-close" onclick="closeWifiModal()">✕</button>
      <div style="width:48px;height:48px;border-radius:14px;background:#0ea5e9;color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
          <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
      </div>
      <h3 style="font-size:18px;font-weight:800;color:white;margin-bottom:4px;">Conectar ao Wi-Fi</h3>
      <p style="font-size:12px;color:#94a3b8;margin-bottom:12px;">Aponte a câmera do seu celular para o QR Code para conectar na hora:</p>
      
      <div class="qr-container">
        <img src="${wifiQrUrl}" alt="QR Code Wi-Fi" onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(wifiQrData)}'">
      </div>

      <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:10px 14px;text-align:left;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:10px;text-transform:uppercase;font-weight:700;color:#94a3b8;">Rede (SSID):</span>
          <strong style="font-size:12px;color:white;">${wifiSsid}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:10px;text-transform:uppercase;font-weight:700;color:#94a3b8;">Senha:</span>
          <strong id="wifiPassText" style="font-size:12px;font-family:monospace;color:#38bdf8;">${wifiPass}</strong>
        </div>
      </div>

      <button type="button" class="modal-btn" style="background:#0ea5e9;color:#082f49;" onclick="copyWifiPassword()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>Copiar Senha do Wi-Fi</span>
      </button>
    </div>
  </div>

  <!-- TOAST NOTIFICATION -->
  <div id="toast" class="toast">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span id="toastMsg">Chave Pix copiada com sucesso!</span>
  </div>

  <script>
    const PIX_KEY = "${pixKey.replace(/"/g, '\\"')}";
    const WIFI_PASS = "${wifiPass.replace(/"/g, '\\"')}";

    function showToast(msg) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toastMsg');
      toastMsg.innerText = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function handlePixClick() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(PIX_KEY).then(() => {
          showToast("Chave Pix copiada com sucesso!");
        }).catch(() => {});
      }
      openPixModal();
    }

    function openPixModal() {
      document.getElementById('pixModal').classList.add('active');
    }

    function closePixModal() {
      document.getElementById('pixModal').classList.remove('active');
    }

    function copyPixFromModal() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(PIX_KEY).then(() => {
          showToast("Chave Pix copiada com sucesso!");
        }).catch(() => fallbackCopy(PIX_KEY, "Chave Pix copiada!"));
      } else {
        fallbackCopy(PIX_KEY, "Chave Pix copiada!");
      }
    }

    function openWifiModal() {
      document.getElementById('wifiModal').classList.add('active');
    }

    function closeWifiModal() {
      document.getElementById('wifiModal').classList.remove('active');
    }

    function copyWifiPassword() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(WIFI_PASS).then(() => {
          showToast("Senha do Wi-Fi copiada!");
        }).catch(() => fallbackCopy(WIFI_PASS, "Senha do Wi-Fi copiada!"));
      } else {
        fallbackCopy(WIFI_PASS, "Senha do Wi-Fi copiada!");
      }
    }

    function fallbackCopy(text, msg) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showToast(msg);
      } catch (e) {}
      document.body.removeChild(textarea);
    }

    // Close modal on background click
    window.addEventListener('click', function(e) {
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closePixModal();
        closeWifiModal();
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Generates 100% self-contained standalone HTML with Base64-inlined QR Codes.
 * Runs asynchronously to compile the QR images directly into the HTML markup.
 */
export async function generateMiniSiteStandaloneHtml(config: MiniSiteConfig): Promise<string> {
  const pixKey = config.pixKey || 'pix@empresa.com.br';
  const name = config.companyName || 'Sua Empresa';
  const wifiSsid = config.wifiSsid || `${name.replace(/\s+/g, '_')}_WiFi`;
  const wifiPass = config.wifiPassword || 'VisiteNos123';
  const wifiSec = config.wifiSecurity || 'WPA';
  const wifiQrData = `WIFI:T:${wifiSec};S:${wifiSsid};P:${wifiPass};;`;

  let pixQrUrl: string | undefined;
  let wifiQrUrl: string | undefined;

  try {
    pixQrUrl = await QRCode.toDataURL(pixKey, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#042f2e', light: '#ffffff' }
    });
  } catch (err) {
    console.warn('QRCode generation for Pix failed, using fallback:', err);
  }

  try {
    wifiQrUrl = await QRCode.toDataURL(wifiQrData, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#082f49', light: '#ffffff' }
    });
  } catch (err) {
    console.warn('QRCode generation for Wi-Fi failed, using fallback:', err);
  }

  return generateMiniSiteHtml(config, { pixQrUrl, wifiQrUrl });
}

/**
 * Downloads single standalone HTML file (`index.html` by default, ideal for hosting roots).
 */
export async function downloadMiniSiteHtml(config: MiniSiteConfig, filename?: string): Promise<void> {
  const htmlContent = await generateMiniSiteStandaloneHtml(config);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (config.companyName || 'minisite').toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.href = url;
  a.download = filename || `index.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads complete ZIP package with:
 * 1. `index.html`: Fully self-contained static mini-site with embedded Base64 QR codes.
 * 2. `README.txt`: 30-second hosting instructions for Netlify Drop, Vercel, GitHub Pages, or cPanel.
 * 3. `configuracao_empresa.json`: Complete backup of all company links, colors, and parameters.
 * 4. `INSTRUCOES_DE_PUBLICACAO.html`: Interactive visual guide for the client.
 */
export async function downloadMiniSiteZip(config: MiniSiteConfig, filename?: string): Promise<void> {
  const zip = new JSZip();
  const htmlContent = await generateMiniSiteStandaloneHtml(config);
  const safeName = (config.companyName || 'minisite').toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Main standalone static page
  zip.file('index.html', htmlContent);

  // Backup configuration JSON
  const configJson = JSON.stringify(config, null, 2);
  zip.file('configuracao_empresa.json', configJson);

  // README with instant hosting manual
  const readmeContent = `========================================================================
MINI SITE ESTÁTICO AUTÔNOMO - ${config.companyName || 'Sua Empresa'}
Tecnologia de Conexão Inteligente & NFC Hub por ALF Automação
========================================================================

Parabéns! Este pacote contém o Mini Site Oficial da sua empresa 100% pronto,
autônomo e sem dependências de nenhuma mensalidade externa.

------------------------------------------------------------------------
CONTEÚDO DO PACOTE:
------------------------------------------------------------------------
1. [index.html] -> O arquivo principal do Mini Site. Abre com 2 cliques em
   qualquer navegador e está pronto para ser hospedado em qualquer servidor.
2. [configuracao_empresa.json] -> Cópia de segurança com todos os seus dados
   (WhatsApp, Pix, Wi-Fi, links, endereço e cores).
3. [INSTRUCOES_DE_PUBLICACAO.html] -> Guia visual passo a passo para colocar
   no ar em 30 segundos.

------------------------------------------------------------------------
COMO COLOCAR NO AR EM 30 SEGUNDOS (GRÁTIS E COM SSL / HTTPS):
------------------------------------------------------------------------
OPÇÃO 1: Netlify Drop (Mais Fácil - Recomendado)
1. Acesse no navegador: https://app.netlify.com/drop
2. Arraste este arquivo ZIP ou a pasta descompactada para a página.
3. Seu site estará no ar na mesma hora com um link próprio e seguro!
4. Você pode vincular seu próprio domínio (ex: links.suaempresa.com.br).

OPÇÃO 2: Vercel ou Cloudflare Pages
1. Acesse https://vercel.com ou https://pages.cloudflare.com
2. Importe ou arraste a pasta com o arquivo index.html.

OPÇÃO 3: Hospedagem Própria (cPanel, Hostinger, Locaweb, Apache, NGINX)
1. Acesse o Gerenciador de Arquivos do seu cPanel.
2. Abra a pasta 'public_html' (ou subdomínio desejado).
3. Faça o upload do arquivo 'index.html'.

------------------------------------------------------------------------
ONDE DIVULGAR SEU MINI SITE:
------------------------------------------------------------------------
- Na bio do seu perfil no Instagram
- No botão de link dos Stories
- Na mensagem de saudação automática do WhatsApp Business
- Gravado no chip da sua Placa ou Totem NFC físico
- No QR Code impresso no balcão, mesas ou cartões de visita

Suporte e Atualizações: ALF Automação Comercial
`;
  zip.file('README.txt', readmeContent);

  // Visual Quick Guide HTML for the client
  const visualGuideHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Instruções de Publicação - ${config.companyName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 32px 16px; display: flex; justify-content: center; }
    .card { max-width: 600px; width: 100%; background: #1e293b; border-radius: 20px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    h1 { font-size: 24px; color: #38bdf8; margin-bottom: 8px; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
    .step { background: rgba(255,255,255,0.04); border-left: 4px solid #38bdf8; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px; }
    .step strong { color: #ffffff; display: block; font-size: 15px; margin-bottom: 4px; }
    .btn { display: inline-block; background: #0284c7; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 10px; }
    .btn:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Como Publicar seu Mini Site</h1>
    <p>O arquivo <strong>index.html</strong> que acompanha este pacote é 100% autônomo e já está com todos os seus botões e QR codes prontos.</p>
    
    <div class="step">
      <strong>Passo 1: Acesse o Netlify Drop</strong>
      <span>Abra <a href="https://app.netlify.com/drop" target="_blank" style="color:#38bdf8;">app.netlify.com/drop</a> no seu computador.</span>
    </div>

    <div class="step">
      <strong>Passo 2: Arraste a pasta ou ZIP</strong>
      <span>Basta arrastar a pasta descompactada para o centro da tela.</span>
    </div>

    <div class="step">
      <strong>Passo 3: Pronto! Seu link está online</strong>
      <span>Copie o link gerado e coloque na bio do Instagram ou envie para seus clientes.</span>
    </div>

    <a href="index.html" class="btn">Abrir Meu Mini Site Agora ➔</a>
  </div>
</body>
</html>`;
  zip.file('INSTRUCOES_DE_PUBLICACAO.html', visualGuideHtml);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `minisite_${safeName}_completo.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Open live preview in a new browser tab with standalone HTML.
 */
export async function openMiniSiteLivePreview(config: MiniSiteConfig): Promise<void> {
  const htmlContent = await generateMiniSiteStandaloneHtml(config);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

/**
 * Copy complete standalone HTML code to clipboard.
 */
export async function copyMiniSiteHtmlToClipboard(config: MiniSiteConfig): Promise<boolean> {
  try {
    const htmlContent = await generateMiniSiteStandaloneHtml(config);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(htmlContent);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = htmlContent;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    console.error('Failed to copy HTML:', e);
    return false;
  }
}

/**
 * Generates pre-formatted WhatsApp message for the operator to send to the client.
 */
export function generateClientShareMessage(config: MiniSiteConfig, hostingUrl?: string): string {
  const name = config.companyName || 'Sua Empresa';
  const url = hostingUrl || 'https://seumini-site.com';
  return `Olá, tudo bem? 🚀

Aqui está o *Mini Site Exclusivo* de *${name}*!

✨ *O que está incluso:*
⭐ Botão direto para Avaliação 5 Estrelas no Google
💬 WhatsApp 1-clique para seus clientes falarem direto com você
📶 Conexão Wi-Fi Instantânea por QR Code (sem precisar digitar senha)
⚡ Pagamento via Pix com 1 toque (Copia e Cola + QR Code)
📸 Instagram Oficial
📍 Endereço e Rota pelo Google Maps

📂 *Como hospedar:*
O arquivo *index.html* anexado é 100% seu e autônomo, sem nenhuma mensalidade.
Basta arrastar para o Netlify (app.netlify.com/drop) ou subir na sua hospedagem!

${hostingUrl ? `🔗 Acesse a demonstração online: ${url}\n` : ''}Qualquer dúvida estamos à disposição!`;
}
