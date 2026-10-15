import JSZip from 'jszip';
import { detectNicheVisualProfile, NicheVisualProfile } from './nicheVisualDatabase';

export interface SiteExportOptions {
  theme?: 'clean' | 'dark' | 'vibrant';
  customWhatsapp?: string;
  customMessage?: string;
  domainName?: string;
}

export interface ExportLeadData {
  name: string;
  city: string;
  niche: string;
  phone?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  googleMapsUrl?: string;
}

export interface SiteImages {
  hero: string;
  about: string;
  gallery?: Array<{ url: string; title: string; category?: string }>;
  serviceThumbnails?: string[];
}

export interface SiteTemplateData {
  brand?: {
    name: string;
    slogan: string;
    nicheTag: string;
    city: string;
    badge: string;
  };
  nicheType?: string;
  themeStyle?: string;
  images?: SiteImages;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    surface?: string;
    text: string;
    darkBg?: string;
    cardBorder?: string;
  };
  hero: {
    tag?: string;
    title: string;
    subtitle: string;
    ctaText: string;
    secondaryCtaText?: string;
    trustMetrics?: Array<{ value: string; label: string }>;
  };
  interactiveQuote?: {
    title: string;
    subtitle: string;
    options: Array<{ name: string; estimatedPrice: string; highlight: string }>;
  };
  about: {
    title: string;
    text: string;
    highlights?: string[];
  };
  services: Array<{ title: string; description: string; badge?: string; imageUrl?: string }>;
  showcase?: Array<{ title: string; category: string; result?: string; imageUrl?: string }>;
  testimonials: Array<{ author: string; role: string; text: string; rating?: number; timeAgo?: string }>;
  faq?: Array<{ question: string; answer: string }>;
  cta: {
    title: string;
    text: string;
    buttonText: string;
    urgency?: string;
  };
}

// Format telephone for WhatsApp wa.me link
export function formatWhatsappNumber(phone: string = ''): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '5511999999999';
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  if (digits.startsWith('55')) return digits;
  return digits;
}

export function buildWhatsappUrl(phone: string = '', message: string = ''): string {
  const num = formatWhatsappNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${num}?text=${encoded}`;
}

export function generateFaviconSvg(businessName: string, primaryColor: string): string {
  const initial = (businessName.trim().charAt(0) || 'A').toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#g)"/>
  <text x="50%" y="54%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initial}</text>
</svg>`;
}

export function generateStyleCss(template: SiteTemplateData, theme: string = 'clean', nicheProfile?: NicheVisualProfile): string {
  const isDark = theme === 'dark';
  const primary = template.colors.primary || nicheProfile?.colors.primary || '#0f172a';
  const accent = template.colors.accent || nicheProfile?.colors.accent || '#10b981';
  const secondary = template.colors.secondary || nicheProfile?.colors.secondary || '#2563eb';
  const bg = isDark ? '#090d16' : (template.colors.bg || nicheProfile?.colors.bg || '#f8fafc');
  const surface = isDark ? '#111827' : (template.colors.surface || '#ffffff');
  const text = isDark ? '#f8fafc' : (template.colors.text || nicheProfile?.colors.text || '#0f172a');
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const border = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const headingFont = nicheProfile?.typography.headingFont || "-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif";

  const isLuxury = template.themeStyle === 'luxury' || nicheProfile?.styleMode === 'luxury';
  const isIndustrial = template.themeStyle === 'industrial' || nicheProfile?.styleMode === 'industrial';
  const isMarket = template.themeStyle === 'fresh_market' || nicheProfile?.styleMode === 'fresh_market';

  return `/* ============================================================
   ESTILOS DE PRODUÇÃO - ${template.brand?.name || 'WEBSITE PROFISSIONAL'}
   Gerado pelo ALF Automação • Consistência Visual do Ramo
   ============================================================ */

:root {
  --primary: ${primary};
  --accent: ${accent};
  --secondary: ${secondary};
  --bg: ${bg};
  --surface: ${surface};
  --text: ${text};
  --text-muted: ${textMuted};
  --border: ${border};
  --heading-font: ${headingFont};
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.12);
  --radius: ${isLuxury ? '20px' : isIndustrial ? '12px' : '16px'};
  --radius-sm: 8px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

body {
  overflow-x: hidden;
  min-height: 100vh;
}

h1, h2, h3, .section-title {
  font-family: var(--heading-font);
}

.container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 20px;
}

/* NAVBAR */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${isDark ? 'rgba(15, 23, 42, 0.88)' : isLuxury ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.92)'};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  transition: all 0.3s ease;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--primary);
  font-weight: 900;
  font-size: 1.15rem;
  letter-spacing: -0.02em;
}

.badge-status {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-links a {
  text-decoration: none;
  color: var(--text);
  font-size: 0.88rem;
  font-weight: 600;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--secondary);
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent);
  color: #ffffff;
  padding: 10px 22px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.28);
  border: none;
  cursor: pointer;
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.38);
  filter: brightness(1.05);
}

.btn-cta:active {
  transform: translateY(0);
}

/* HERO SECTION COM IMAGEM CINEMATOGRÁFICA DO RAMO */
.hero {
  position: relative;
  padding: 100px 0 80px;
  overflow: hidden;
  text-align: center;
  color: #ffffff;
  background: #090d16;
}

.hero-bg-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;
}

.hero-bg-img {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.05);
  filter: blur(1.5px);
  opacity: 0.45;
  transition: transform 0.5s ease-out;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(9, 13, 22, 0.82) 0%, rgba(9, 13, 22, 0.65) 50%, ${isDark ? '#090d16' : '#ffffff'} 100%);
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 22px;
}

.hero h1 {
  font-size: clamp(2.1rem, 5.2vw, 3.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 20px;
  max-width: 880px;
  margin-left: auto;
  margin-right: auto;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

.hero p {
  font-size: clamp(0.98rem, 2vw, 1.2rem);
  color: #e2e8f0;
  max-width: 700px;
  margin: 0 auto 36px;
  line-height: 1.65;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
  margin-bottom: 48px;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  backdrop-filter: blur(10px);
  padding: 10px 22px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-1px);
}

/* TRUST METRICS */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  max-width: 820px;
  margin: 0 auto;
}

.metric-card {
  background: ${isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  padding: 16px 12px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  text-align: center;
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-3px);
}

.metric-val {
  font-size: 1.45rem;
  font-weight: 900;
  color: var(--primary);
  display: block;
  line-height: 1.2;
}

.metric-lbl {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.03em;
  margin-top: 4px;
}

/* SECTIONS COMMON */
.section {
  padding: 80px 0;
}

.section-bg {
  background: ${isDark ? '#0b1120' : '#f1f5f9'};
}

.section-title-wrap {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 45px;
}

.section-subtitle {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--secondary);
  display: block;
  margin-bottom: 8px;
}

.section-title {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.section-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin-top: 8px;
}

/* GALERIA & CASOS REAIS (FOTOGRAFIA DO RAMO) */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.gallery-card {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  aspect-ratio: 4/3;
  background: var(--surface);
  border: 1px solid var(--border);
}

.gallery-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: block;
}

.gallery-card:hover img {
  transform: scale(1.08);
}

.gallery-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 16px 14px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.4) 65%, transparent 100%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.gallery-category {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #fbbf24;
}

.gallery-title {
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.3;
}

/* INTERACTIVE QUOTE BOX */
.quote-box {
  max-width: 600px;
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 32px;
  box-shadow: var(--shadow-lg);
}

.quote-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.quote-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  background: var(--surface);
}

.quote-option:hover {
  border-color: var(--secondary);
  transform: scale(1.01);
}

.quote-option.active {
  border-color: var(--secondary);
  background: ${isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.05)'};
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.12);
}

.quote-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.quote-name {
  font-size: 0.95rem;
  font-weight: 800;
}

.quote-badge {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
  background: #fef3c7;
  color: #92400e;
  display: inline-block;
  width: fit-content;
}

.quote-price {
  font-size: 0.88rem;
  font-weight: 900;
  color: var(--accent);
}

.radio-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.quote-option.active .radio-check {
  border-color: var(--secondary);
  background: var(--secondary);
}

.quote-option.active .radio-check::after {
  content: "✓";
  color: white;
  font-size: 13px;
  font-weight: 900;
}

/* SERVICES GRID */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 22px;
}

.service-card {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 30px 24px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-color: rgba(37, 99, 235, 0.3);
}

.service-badge {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--secondary);
  background: rgba(37, 99, 235, 0.1);
  padding: 4px 10px;
  border-radius: 999px;
  display: inline-block;
  margin-bottom: 14px;
}

.service-title {
  font-size: 1.18rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.service-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.6;
}

/* ABOUT SECTION SPLIT */
.about-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.about-img-box {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  aspect-ratio: 4/3;
  border: 1px solid var(--border);
}

.about-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.about-badge-float {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(10px);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* REVIEWS & TESTIMONIALS */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.review-card {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 24px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  position: relative;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.review-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--secondary), var(--primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.92rem;
}

.review-name {
  font-size: 0.92rem;
  font-weight: 800;
}

.review-verified {
  font-size: 0.7rem;
  font-weight: 800;
  color: #15803d;
  background: #dcfce7;
  padding: 3px 9px;
  border-radius: 999px;
}

.review-stars {
  color: #f59e0b;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.review-text {
  font-size: 0.88rem;
  color: var(--text);
  font-style: italic;
  line-height: 1.6;
}

/* FAQ ACCORDION */
.faq-box {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.faq-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.faq-question {
  width: 100%;
  padding: 16px 20px;
  text-align: left;
  background: none;
  border: none;
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: 0 20px;
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.6;
}

.faq-item.open .faq-answer {
  max-height: 300px;
  padding-bottom: 16px;
}

.faq-icon {
  transition: transform 0.25s ease;
}

.faq-item.open .faq-icon {
  transform: rotate(180deg);
}

/* FOOTER */
.footer {
  background: var(--primary);
  color: #ffffff;
  padding: 70px 0 35px;
  text-align: center;
}

.footer-content {
  max-width: 720px;
  margin: 0 auto;
}

.footer-title {
  font-size: 1.85rem;
  font-weight: 900;
  margin-bottom: 12px;
}

.footer-desc {
  font-size: 0.95rem;
  opacity: 0.85;
  margin-bottom: 28px;
}

.footer-meta {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.8rem;
  opacity: 0.7;
}

/* FLOATING WHATSAPP BUTTON */
.floating-whatsapp {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #25d366;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.88rem;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4);
  animation: pulse-wa 2.5s infinite;
  transition: transform 0.2s ease;
}

.floating-whatsapp:hover {
  transform: scale(1.05);
}

@keyframes pulse-wa {
  0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6); }
  70% { box-shadow: 0 0 0 16px rgba(37, 211, 102, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
}

/* MOBILE RESPONSIVE */
.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text);
  cursor: pointer;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .menu-toggle {
    display: block;
  }
  .hero {
    padding: 65px 0 50px;
  }
  .about-split {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .quote-box {
    padding: 20px;
  }
  .floating-whatsapp span {
    display: none;
  }
  .floating-whatsapp {
    padding: 14px;
    border-radius: 50%;
  }
}
`;
}

export function generateScriptJs(lead: ExportLeadData, defaultMessage: string = ''): string {
  const phone = formatWhatsappNumber(lead.phone || '');
  const cleanBusiness = (lead.name || 'Empresa').replace(/"/g, '\\"');

  return `// ============================================================
// SCRIPT INTERATIVO & GSAP ANIMATIONS - ${cleanBusiness}
// ============================================================

const WHATSAPP_PHONE = "${phone}";
let selectedService = "Atendimento Geral";

document.addEventListener("DOMContentLoaded", function() {
  // 1. GSAP & ScrollTrigger High Performance Animations
  if (typeof gsap !== "undefined") {
    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero entrance timeline
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .from(".hero-tag", { opacity: 0, y: -20, duration: 0.6 })
      .from(".hero h1", { opacity: 0, y: 25, duration: 0.8 }, "-=0.3")
      .from(".hero p", { opacity: 0, y: 15, duration: 0.7 }, "-=0.4")
      .from(".hero-actions", { opacity: 0, scale: 0.95, duration: 0.5 }, "-=0.3")
      .from(".metric-card", { opacity: 0, y: 20, stagger: 0.08, duration: 0.5 }, "-=0.2");

    // Parallax on hero background image
    const heroImg = document.querySelector(".hero-bg-img");
    if (heroImg && typeof ScrollTrigger !== "undefined") {
      gsap.to(heroImg, {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }

    // Scroll reveal on Gallery cards
    if (typeof ScrollTrigger !== "undefined") {
      gsap.utils.toArray(".gallery-card").forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          scale: 0.94,
          y: 30,
          duration: 0.6,
          delay: (i % 2) * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none none"
          }
        });
      });

      // Scroll reveal on Services
      gsap.utils.toArray(".service-card").forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 35,
          duration: 0.6,
          delay: (i % 3) * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none none"
          }
        });
      });

      // Scroll reveal on Quote box
      const quoteBox = document.querySelector(".quote-box");
      if (quoteBox) {
        gsap.from(quoteBox, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: quoteBox,
            start: "top 85%"
          }
        });
      }

      // Scroll reveal on About split
      const aboutImg = document.querySelector(".about-img-box");
      if (aboutImg) {
        gsap.from(aboutImg, {
          opacity: 0,
          x: -30,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: aboutImg,
            start: "top 85%"
          }
        });
      }
    }
  }

  // 2. Interactive Quote Simulator
  const quoteOptions = document.querySelectorAll(".quote-option");
  const quoteCtaBtn = document.getElementById("quote-cta-btn");
  
  if (quoteOptions.length > 0) {
    quoteOptions.forEach(opt => {
      opt.addEventListener("click", function() {
        quoteOptions.forEach(o => o.classList.remove("active"));
        this.classList.add("active");
        
        selectedService = this.getAttribute("data-service") || "Atendimento";
        const price = this.getAttribute("data-price") || "";
        
        if (quoteCtaBtn) {
          quoteCtaBtn.textContent = "Garantir " + selectedService + " no WhatsApp";
          const msg = encodeURIComponent("Olá! Gostaria de agendar o serviço: " + selectedService + " (" + price + ") em " + "${lead.city || 'minha região'}");
          quoteCtaBtn.href = "https://wa.me/" + WHATSAPP_PHONE + "?text=" + msg;
        }
      });
    });
  }

  // 3. FAQ Accordions
  const faqQuestions = document.querySelectorAll(".faq-question");
  faqQuestions.forEach(btn => {
    btn.addEventListener("click", function() {
      const item = this.parentElement;
      const isOpen = item.classList.contains("open");
      
      document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });

  // 4. Mobile Menu Toggle
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", function() {
      if (navLinks.style.display === "flex") {
        navLinks.style.display = "none";
      } else {
        navLinks.style.display = "flex";
        navLinks.style.flexDirection = "column";
        navLinks.style.position = "absolute";
        navLinks.style.top = "72px";
        navLinks.style.left = "0";
        navLinks.style.right = "0";
        navLinks.style.background = "var(--surface)";
        navLinks.style.padding = "20px";
        navLinks.style.boxShadow = "var(--shadow-md)";
      }
    });
  }
});
`;
}

export function generateHostingGuide(lead: ExportLeadData, template: SiteTemplateData): string {
  const business = lead.name || 'Cliente';
  const cleanName = business.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return `# GUIA DE HOSPEDAGEM DO SITE: ${business.toUpperCase()}
Data de Geração: ${new Date().toLocaleDateString('pt-BR')}

Este pacote contém os arquivos finais, responsivos e otimizados com efeitos GSAP e fotografia do ramo para colocar o site do seu cliente no ar em poucos minutos.

---

### OPÇÃO 1: Netlify Drop (GRÁTIS • 30 Segundos • Recomendado)
A maneira mais rápida do mundo para colocar o site no ar com SSL (cadeado verde HTTPS) de graça:
1. Acesse: https://app.netlify.com/drop
2. Arraste a pasta descompactada deste projeto (ou o arquivo index.html) diretamente na tela.
3. O site estará online IMEDIATAMENTE em um link provisório (ex: ${cleanName}.netlify.app).
4. (Opcional) Vá em "Domain management" e adicione o domínio próprio do seu cliente (ex: www.${cleanName}.com.br).

---

### OPÇÃO 2: Vercel (GRÁTIS • Alta Velocidade)
1. Crie uma conta gratuita em https://vercel.com
2. Instale o Vercel CLI ou suba a pasta no GitHub / Vercel Import.
3. Clique em "Deploy". Em 10 segundos o site está no ar com CDN mundial ultra-rápido.

---

### OPÇÃO 3: Hospedagem Tradicional cPanel (Hostinger, Hostgator, Locaweb)
Se o cliente já contratou uma hospedagem com cPanel:
1. Acesse o painel de controle (cPanel) da hospedagem do cliente.
2. Abra o "Gerenciador de Arquivos" (File Manager).
3. Entre na pasta "public_html".
4. Faça o upload deste arquivo ZIP e clique com o botão direito em "Extract" (Extrair).
5. Certifique-se de que o arquivo "index.html" fique diretamente dentro de "public_html".
6. Pronto! Ao acessar www.site-do-cliente.com.br, o site abrirá imediatamente.

---

### CONFIGURAÇÃO DO WHATSAPP & CONTATO
- Telefone configurado nos botões: ${lead.phone || '(11) 99999-9999'}
- Link direto: ${buildWhatsappUrl(lead.phone, `Olá! Gostaria de um orçamento com a ${business}`)}
- Cidade configurada: ${lead.city}
- Avaliações: 4.9 estrelas no Google Meu Negócio

Sucesso nas vendas e na entrega para seu cliente!
`;
}

// Generate the complete Standalone Single-File HTML (Ready to open with double-click or drag into Netlify Drop)
export function generateFullHtml(
  template: SiteTemplateData,
  lead: ExportLeadData,
  options: SiteExportOptions = {}
): string {
  const theme = options.theme || 'clean';
  const phone = options.customWhatsapp || lead.phone || '(11) 99999-9999';
  const formattedWa = formatWhatsappNumber(phone);
  const defaultMsg = options.customMessage || `Olá! Acessei o site da ${lead.name} e gostaria de solicitar um orçamento.`;
  const waUrl = `https://wa.me/${formattedWa}?text=${encodeURIComponent(defaultMsg)}`;

  // Obter perfil visual do ramo de atuação
  const nicheProfile = detectNicheVisualProfile(lead.niche, lead.name);

  // Garantir imagens condizentes com o ramo de atuação
  const heroImg = template.images?.hero || nicheProfile.images.hero;
  const aboutImg = template.images?.about || nicheProfile.images.about;
  const galleryItems = (template.images?.gallery && template.images.gallery.length > 0)
    ? template.images.gallery
    : nicheProfile.images.gallery;

  const brandName = template.brand?.name || lead.name || 'Empresa Referência';
  const slogan = template.brand?.slogan || `Especialistas em ${lead.niche || 'serviços'} em ${lead.city || 'sua região'}`;
  const css = generateStyleCss(template, theme, nicheProfile);
  const js = generateScriptJs(lead, defaultMsg);

  const trustMetrics = template.hero.trustMetrics || nicheProfile.defaultMetrics;
  const quoteOptions = template.interactiveQuote?.options || nicheProfile.defaultQuoteOptions;
  const services = (template.services && template.services.length > 0) ? template.services : nicheProfile.defaultServices;
  const testimonials = template.testimonials || [];
  const faqs = template.faq || [
    { question: 'Como funciona para solicitar um orçamento?', answer: 'Você clica no botão do WhatsApp, nos conta sua necessidade e respondemos em poucos minutos com orientações claras.' },
    { question: 'Possui garantia dos serviços?', answer: 'Sim, emitimos certificado de garantia formal e suporte continuado para todos os atendimentos realizados.' },
    { question: 'Quais as formas de pagamento aceitas?', answer: 'Aceitamos Pix com desconto, cartões de crédito em até 12x e boleto bancário facilitado.' }
  ];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brandName} | ${lead.niche} em ${lead.city}</title>
  <meta name="description" content="${template.hero.subtitle || slogan}">
  <meta property="og:title" content="${brandName} | ${slogan}">
  <meta property="og:description" content="${template.hero.subtitle || slogan}">
  <meta property="og:image" content="${heroImg}">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="${template.colors.primary || '#0f172a'}">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(generateFaviconSvg(brandName, template.colors.primary))}">
  
  ${nicheProfile.typography.fontImportUrl ? `<link rel="stylesheet" href="${nicheProfile.typography.fontImportUrl}">` : ''}

  <!-- GSAP & ScrollTrigger CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

  <style>
${css}
  </style>
</head>
<body>

  <!-- NAVBAR -->
  <header class="navbar">
    <div class="container nav-container">
      <a href="#" class="brand-logo">
        <span>${brandName}</span>
        <span class="badge-status">Aberto Hoje</span>
      </a>

      <nav class="nav-links">
        <a href="#galeria">Estrutura</a>
        <a href="#servicos">Serviços</a>
        <a href="#simulador">Orçamento Expresso</a>
        <a href="#sobre">Sobre Nós</a>
        <a href="#avaliacoes">Avaliações</a>
        <a href="#faq">Dúvidas</a>
      </nav>

      <div style="display: flex; align-items: center; gap: 10px;">
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-cta">
          <span>WhatsApp Direto</span>
        </a>
        <button class="menu-toggle" id="mobile-menu-toggle" aria-label="Abrir Menu">☰</button>
      </div>
    </div>
  </header>

  <!-- HERO SECTION COM IMAGEM CINEMATOGRÁFICA DO RAMO -->
  <section class="hero">
    <div class="hero-bg-container">
      <div class="hero-bg-img" style="background-image: url('${heroImg}');"></div>
      <div class="hero-overlay"></div>
    </div>

    <div class="container hero-content">
      <div class="hero-tag">
        <span>★ 4.9 no Google • ${lead.city}</span>
      </div>

      <h1>${template.hero.title}</h1>
      <p>${template.hero.subtitle}</p>

      <div class="hero-actions">
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-cta" style="font-size: 0.95rem; padding: 13px 32px;">
          ${template.hero.ctaText || 'Pedir Orçamento sem Compromisso no WhatsApp'}
        </a>
        <a href="#galeria" class="btn-secondary">
          ${template.hero.secondaryCtaText || 'Conhecer Nossa Estrutura'}
        </a>
      </div>

      <!-- TRUST METRICS -->
      <div class="metrics-grid">
        ${trustMetrics.map(m => `
          <div class="metric-card">
            <span class="metric-val">${m.value}</span>
            <span class="metric-lbl">${m.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- GALERIA VISUAL & CASOS REAIS (FOTOGRAFIA DO RAMO) -->
  <section class="section" id="galeria">
    <div class="container">
      <div class="section-title-wrap">
        <span class="section-subtitle">Excelência &amp; Estrutura</span>
        <h2 class="section-title">Padrão de Qualidade em ${lead.city}</h2>
        <p class="section-desc">Conheça nosso espaço, equipamentos e resultados que comprovam nossa dedicação.</p>
      </div>

      <div class="gallery-grid">
        ${galleryItems.map(g => `
          <div class="gallery-card">
            <img src="${g.url}" alt="${g.title}" loading="lazy" />
            <div class="gallery-caption">
              <span class="gallery-category">${g.category || 'Destaque'}</span>
              <span class="gallery-title">${g.title}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- INTERACTIVE BUDGET SIMULATOR -->
  <section class="section section-bg" id="simulador">
    <div class="container">
      <div class="section-title-wrap">
        <span class="section-subtitle">Simulador Imediato</span>
        <h2 class="section-title">${template.interactiveQuote?.title || 'Simulador de Atendimento Expresso'}</h2>
        <p class="section-desc">${template.interactiveQuote?.subtitle || 'Clique no serviço desejado para calcular a estimativa e iniciar a conversa:'}</p>
      </div>

      <div class="quote-box">
        <div class="quote-options">
          ${quoteOptions.map((opt, i) => `
            <div class="quote-option ${i === 0 ? 'active' : ''}" data-service="${opt.name}" data-price="${opt.estimatedPrice}">
              <div class="quote-left">
                <span class="quote-badge">${opt.highlight}</span>
                <span class="quote-name">${opt.name}</span>
                <span class="quote-price">${opt.estimatedPrice}</span>
              </div>
              <div class="radio-check"></div>
            </div>
          `).join('')}
        </div>

        <a href="${waUrl}" id="quote-cta-btn" target="_blank" rel="noopener noreferrer" class="btn-cta" style="width: 100%; justify-content: center; padding: 14px; font-size: 0.95rem;">
          Garantir ${quoteOptions[0]?.name || 'Atendimento'} no WhatsApp
        </a>
      </div>
    </div>
  </section>

  <!-- SERVICES SECTION -->
  <section class="section" id="servicos">
    <div class="container">
      <div class="section-title-wrap">
        <span class="section-subtitle">Especialidades</span>
        <h2 class="section-title">Soluções Completas para ${lead.niche}</h2>
        <p class="section-desc">Tudo o que você precisa com profissionais experientes, clareza e garantia formal.</p>
      </div>

      <div class="services-grid">
        ${services.map(svc => `
          <div class="service-card">
            <div>
              ${svc.badge ? `<span class="service-badge">${svc.badge}</span>` : ''}
              <h3 class="service-title">${svc.title}</h3>
              <p class="service-desc">${svc.description}</p>
            </div>
            <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent);">Garantia Inclusa</span>
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 0.8rem; font-weight: 800; color: var(--secondary); text-decoration: none;">Consultar →</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- ABOUT SECTION SPLIT -->
  <section class="section section-bg" id="sobre">
    <div class="container">
      <div class="about-split">
        <div class="about-img-box">
          <img src="${aboutImg}" alt="Sobre ${brandName}" loading="lazy" />
          <div class="about-badge-float">
            ★ Qualidade Comprovada em ${lead.city}
          </div>
        </div>

        <div>
          <span class="section-subtitle">Sobre Nós</span>
          <h2 class="section-title" style="margin-bottom: 16px; font-size: 1.85rem;">${template.about.title}</h2>
          <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 24px;">
            ${template.about.text}
          </p>

          ${template.about.highlights ? `
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${template.about.highlights.map(h => `
                <div style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem; font-weight: 700; color: var(--text);">
                  <span style="color: #166534; background: #dcfce7; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; shrink: 0;">✓</span>
                  <span>${h}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  </section>

  <!-- REVIEWS & TESTIMONIALS -->
  <section class="section" id="avaliacoes">
    <div class="container">
      <div class="section-title-wrap">
        <span class="section-subtitle">Prova Social</span>
        <h2 class="section-title">Avaliações Verificadas no Google Meu Negócio</h2>
        <p class="section-desc">Veja o que clientes de ${lead.city} dizem sobre a nossa dedicação.</p>
      </div>

      <div class="reviews-grid">
        ${testimonials.map(t => `
          <div class="review-card">
            <div class="review-header">
              <div class="review-user">
                <div class="review-avatar">${(t.author || 'C').charAt(0)}</div>
                <div>
                  <div class="review-name">${t.author}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${t.role || 'Cliente'}</div>
                </div>
              </div>
              <span class="review-verified">Google Verificado</span>
            </div>
            <div class="review-stars">★★★★★</div>
            <p class="review-text">"${t.text}"</p>
            <div style="margin-top: 10px; font-size: 0.75rem; color: var(--text-muted); text-align: right;">
              ${t.timeAgo || 'há 2 dias'}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- FAQ SECTION -->
  <section class="section section-bg" id="faq">
    <div class="container">
      <div class="section-title-wrap">
        <span class="section-subtitle">Perguntas Frequentes</span>
        <h2 class="section-title">Tire suas dúvidas antes de agendar</h2>
      </div>

      <div class="faq-box">
        ${faqs.map((faq, fIdx) => `
          <div class="faq-item ${fIdx === 0 ? 'open' : ''}">
            <button class="faq-question">
              <span>${faq.question}</span>
              <span class="faq-icon">▼</span>
            </button>
            <div class="faq-answer">
              ${faq.answer}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- FOOTER & CTA -->
  <footer class="footer">
    <div class="container footer-content">
      <h2 class="footer-title">${template.cta.title}</h2>
      <p class="footer-desc">${template.cta.text}</p>
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-cta" style="padding: 14px 34px; font-size: 0.95rem; background: #ffffff; color: var(--primary);">
        ${template.cta.buttonText}
      </a>

      <div class="footer-meta">
        <p><strong>${brandName}</strong> • ${lead.address || `Atendimento em toda a cidade de ${lead.city}`}</p>
        <p style="margin-top: 4px;">Telefone: ${lead.phone || '(11) 99999-9999'} • ${new Date().getFullYear()} © Todos os direitos reservados</p>
      </div>
    </div>
  </footer>

  <!-- FLOATING WHATSAPP BUTTON -->
  <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="floating-whatsapp" aria-label="Falar no WhatsApp">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
    <span>Falar no WhatsApp</span>
  </a>

  <!-- SCRIPTS -->
  <script>
${js}
  </script>
</body>
</html>`;
}

// Download ready-to-host ZIP package with complete project structure
export async function downloadClientSiteZip(
  template: SiteTemplateData,
  lead: ExportLeadData,
  options: SiteExportOptions = {}
): Promise<void> {
  const zip = new JSZip();
  const theme = options.theme || 'clean';
  const cleanBusiness = (lead.name || 'site-cliente').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const nicheProfile = detectNicheVisualProfile(lead.niche, lead.name);

  // 1. Single standalone HTML for rapid drag-and-drop
  const standaloneHtml = generateFullHtml(template, lead, options);
  zip.file('index.html', standaloneHtml);

  // 2. Separated CSS, JS, and Assets for traditional hosting
  const css = generateStyleCss(template, theme, nicheProfile);
  const js = generateScriptJs(lead, options.customMessage);
  zip.file('css/style.css', css);
  zip.file('js/script.js', js);
  zip.file('favicon.svg', generateFaviconSvg(lead.name || 'A', template.colors.primary));

  // 3. Complete Step-by-step Hosting Guide in Markdown and TXT
  const guide = generateHostingGuide(lead, template);
  zip.file('COMO_HOSPEDAR.md', guide);
  zip.file('LEIA-ME_GUIA_HOSPEDAGEM.txt', guide);

  // Generate and download zip blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `site_${cleanBusiness}_hospedagem.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

// Download single standalone HTML file (for zero-dependency drag-and-drop)
export function downloadSingleHtml(
  template: SiteTemplateData,
  lead: ExportLeadData,
  options: SiteExportOptions = {}
): void {
  const cleanBusiness = (lead.name || 'site-cliente').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const htmlContent = generateFullHtml(template, lead, options);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `index_${cleanBusiness}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Open full screen live preview in a new window/tab
export function openLiveSitePreview(
  template: SiteTemplateData,
  lead: ExportLeadData,
  options: SiteExportOptions = {}
): void {
  const htmlContent = generateFullHtml(template, lead, options);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

// Copy source code to clipboard
export async function copyHtmlToClipboard(
  template: SiteTemplateData,
  lead: ExportLeadData,
  options: SiteExportOptions = {}
): Promise<boolean> {
  try {
    const htmlContent = generateFullHtml(template, lead, options);
    await navigator.clipboard.writeText(htmlContent);
    return true;
  } catch (err) {
    console.error('Failed to copy HTML:', err);
    return false;
  }
}
