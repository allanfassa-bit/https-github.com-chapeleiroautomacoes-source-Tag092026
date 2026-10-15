import { Lead } from '../App';
import {
  generatePlate10x10DataUrl,
  generateCardNfcDataUrl,
  ArtworkTheme,
  ArtworkOptions
} from './nfcPlateGenerator';
import {
  getDirectLeadUrl,
  getDynamicGoogleUrl,
  getDynamicInstagramUrl,
  getDynamicQrUrl
} from './publicUrlHelper';

export interface PrintPlateOptions {
  lead?: Lead | null;
  theme?: ArtworkTheme;
  format?: 'plate-10x10' | 'plate-15x15' | 'a4-duo' | 'card-cr80';
  portalQrMode?: 'dynamic' | 'direct';
  gmbReviewLink?: string;
  onFallbackModal?: (lead: Lead) => void;
}

/**
 * Abre janela de impressão em altíssima definição (4K Ultra-HD • 600 DPI)
 * com proporções milimétricas oficiais (1:1 10x10 cm, 15x15 cm ou Cartão CR80)
 * idênticas à foto de referência (Instagram no topo + onda orgânica branca + Google na base).
 */
export async function openHighDefinitionPrintWindow(options: PrintPlateOptions): Promise<void> {
  const {
    lead,
    theme = 'instagram_dual',
    format = 'plate-10x10',
    portalQrMode = 'dynamic',
    gmbReviewLink = 'https://maps.google.com',
    onFallbackModal
  } = options;

  const businessName = lead ? lead.name : 'Sua Empresa';
  const redirectUrl = lead ? getDirectLeadUrl(lead) : (gmbReviewLink || 'https://maps.google.com');

  const effectiveTheme: ArtworkTheme = theme || (
    (lead?.nfcRedirectActive === 'instagram' || (lead?.nfcInstagramUrl && lead.nfcInstagramUrl.length > 0))
      ? 'instagram_dual'
      : 'emerald_green'
  );

  const effectiveGoogleUrl = (portalQrMode === 'dynamic' && lead?.id)
    ? getDynamicGoogleUrl(lead.id)
    : (lead?.googleMapsUrl || redirectUrl);

  const effectiveInstaUrl = (portalQrMode === 'dynamic' && lead?.id)
    ? getDynamicInstagramUrl(lead.id)
    : (lead?.nfcInstagramUrl || (businessName ? `https://instagram.com/${businessName.replace(/\s+/g, '').toLowerCase()}` : 'https://instagram.com'));

  const sanitizeInstaHandle = (raw: string) => {
    if (!raw) return businessName ? businessName.replace(/\s+/g, '').toLowerCase() : 'empresa';
    let clean = raw.trim();
    clean = clean.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
    clean = clean.split('?')[0].split('&')[0];
    clean = clean.split('/')[0];
    clean = clean.replace(/^@/, '').trim();
    return clean || (businessName ? businessName.replace(/\s+/g, '').toLowerCase() : 'empresa');
  };
  const instaHandle = sanitizeInstaHandle(lead?.nfcInstagramUrl || '');

  // 1. Abre a janela pop-up imediatamente para sincronia de evento do usuário (evita bloqueador)
  const printWindow = window.open('', '_blank', 'width=1100,height=980');
  if (printWindow) {
    printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Renderizando Placa 4K Ultra-HD...</title>
  <style>
    body {
      margin: 0;
      background: #090d16;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
    .loader {
      width: 56px;
      height: 56px;
      border: 4px solid #1e293b;
      border-top-color: #ec4899;
      border-right-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 19px; font-weight: 800; margin: 24px 0 6px; letter-spacing: -0.02em; }
    p { font-size: 13px; color: #94a3b8; margin: 0; }
  </style>
</head>
<body>
  <div class="loader"></div>
  <h2>Gerando Placa de Impressão 4K Ultra-HD (600 DPI)</h2>
  <p>Alinhando proporções milimétricas oficiais (10x10 cm • Modelo da Foto)...</p>
</body>
</html>`);
    printWindow.document.close();
  }

  try {
    // 2. Renderização 4K Ultra-HD exata via Canvas Vector Engine
    const baseArtworkOptions: ArtworkOptions = {
      businessName,
      leadId: lead?.id || 'TAG01',
      permanentUrl: (portalQrMode === 'dynamic' && lead?.id) ? getDynamicQrUrl(lead.id) : redirectUrl,
      googleUrl: effectiveGoogleUrl,
      instagramUrl: effectiveInstaUrl,
      instagramHandle: instaHandle,
      tiktokUrl: (lead as any)?.nfcTiktokUrl || undefined,
      theme: effectiveTheme,
      city: lead?.city || '',
      qrTargetMode: portalQrMode || 'dynamic',
      resolution: '4k'
    };

    const [plateDual4k, plateGreen4k, plateBlue4k, plateBlack4k, plateInstaOficial4k, cardCr804k] = await Promise.all([
      generatePlate10x10DataUrl({ ...baseArtworkOptions, theme: 'instagram_dual' }, '4k'),
      generatePlate10x10DataUrl({ ...baseArtworkOptions, theme: 'emerald_green' }, '4k'),
      generatePlate10x10DataUrl({ ...baseArtworkOptions, theme: 'royal_blue' }, '4k'),
      generatePlate10x10DataUrl({ ...baseArtworkOptions, theme: 'black_gold' }, '4k'),
      generatePlate10x10DataUrl({ ...baseArtworkOptions, theme: 'instagram_official' }, '4k'),
      generateCardNfcDataUrl(baseArtworkOptions, 'horizontal')
    ]);

    if (!printWindow || printWindow.closed) {
      if (lead && onFallbackModal) {
        onFallbackModal(lead);
      }
      return;
    }

    const initialImgSrc = effectiveTheme === 'emerald_green' ? plateGreen4k
      : effectiveTheme === 'royal_blue' ? plateBlue4k
      : effectiveTheme === 'black_gold' ? plateBlack4k
      : effectiveTheme === 'instagram_official' ? plateInstaOficial4k
      : plateDual4k;

    // 3. Monta documento autônomo com CSS puro para tela e impressão (SEM dependência de CDN externa)
    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Placa Oficial 10x10cm 4K Ultra-HD - ${businessName}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    @page {
      size: auto;
      margin: 8mm;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #090d16;
      color: #f1f5f9;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }

    .no-print {
      display: flex;
    }

    /* BARRA SUPERIOR DE FERRAMENTAS */
    .top-bar {
      width: 100%;
      max-width: 980px;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 18px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
    }

    .top-title-box h1 {
      font-size: 15px;
      font-weight: 800;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .badge-4k {
      background: linear-gradient(135deg, #ec4899, #f43f5e);
      color: white;
      font-size: 10px;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 9999px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .top-title-box p {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 3px;
    }

    .btn-group {
      display: inline-flex;
      background: #030712;
      border: 1px solid #1f2937;
      border-radius: 12px;
      padding: 3px;
      gap: 3px;
    }

    .btn-option {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .btn-option:hover {
      color: #ffffff;
      background: #1f2937;
    }

    .btn-option.active {
      color: #ffffff;
      background: #2563eb;
      box-shadow: 0 2px 8px rgba(37,99,235,0.4);
    }

    .btn-option.active-pink {
      color: #ffffff;
      background: #db2777;
      box-shadow: 0 2px 8px rgba(219,39,119,0.4);
    }

    .btn-print-main {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      border: none;
      padding: 10px 22px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 900;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
      box-shadow: 0 4px 14px rgba(16,185,129,0.4);
    }

    .btn-print-main:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    .btn-download-png {
      background: #1e293b;
      color: #38bdf8;
      border: 1px solid #334155;
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .btn-download-png:hover {
      background: #334155;
      color: #ffffff;
    }

    /* ÁREA DA PLACA */
    .print-sheet-stage {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .scale-ruler-badge {
      background: #1e293b;
      color: #cbd5e1;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 14px;
      border-radius: 20px;
      border: 1px solid #334155;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .print-container,
    .plate-outer-frame {
      position: relative;
      background: #ffffff;
      padding: 0;
      margin: 0 auto;
      letter-spacing: -0.02em;
      line-height: 1.35;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      /* Box-shadow suave simulando profundidade física e relevo de placa real premium */
      box-shadow: 
        0 2px 4px 0 rgba(0, 0, 0, 0.08),
        0 12px 32px -4px rgba(0, 0, 0, 0.22),
        0 28px 64px -12px rgba(0, 0, 0, 0.45),
        inset 0 0 0 1px rgba(255, 255, 255, 0.2),
        inset 0 1px 2px 0 rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      transition: box-shadow 0.25s ease, transform 0.25s ease;
    }

    .print-container *,
    .plate-outer-frame * {
      letter-spacing: -0.02em;
    }

    /* Prevenção de colisão entre Nome da Empresa e Estrelas */
    .print-container .company-name,
    .plate-outer-frame .company-name {
      letter-spacing: -0.025em;
      line-height: 1.24;
      margin-top: 0.25rem;
      margin-bottom: 0.35rem;
    }

    .print-container .stars-row,
    .plate-outer-frame .stars-row {
      line-height: 1;
      margin-bottom: 0.45rem;
    }

    /* TAMANHOS FÍSICOS EM MILÍMETROS */
    .size-plate-10x10 {
      width: 100mm;
      height: 100mm;
      max-width: 100mm;
      max-height: 100mm;
      border-radius: 6mm;
    }

    .size-plate-15x15 {
      width: 150mm;
      height: 150mm;
      max-width: 150mm;
      max-height: 150mm;
      border-radius: 8mm;
    }

    .size-card-cr80 {
      width: 85mm;
      height: 54mm;
      max-width: 85mm;
      max-height: 54mm;
      border-radius: 3.5mm;
    }

    .duo-container {
      display: flex;
      flex-direction: row;
      gap: 12mm;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    }

    .plate-art-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      image-rendering: -webkit-optimize-contrast;
    }

    /* MARCAS DE CORTE DE PRECISÃO (CROP MARKS) */
    .crop-mark {
      position: absolute;
      width: 12px;
      height: 12px;
      pointer-events: none;
      z-index: 50;
    }
    .crop-tl { top: 0; left: 0; border-top: 2px solid rgba(0,0,0,0.3); border-left: 2px solid rgba(0,0,0,0.3); }
    .crop-tr { top: 0; right: 0; border-top: 2px solid rgba(0,0,0,0.3); border-right: 2px solid rgba(0,0,0,0.3); }
    .crop-bl { bottom: 0; left: 0; border-bottom: 2px solid rgba(0,0,0,0.3); border-left: 2px solid rgba(0,0,0,0.3); }
    .crop-br { bottom: 0; right: 0; border-bottom: 2px solid rgba(0,0,0,0.3); border-right: 2px solid rgba(0,0,0,0.3); }

    /* GUIA DE FURAÇÃO PARAFUSOS AFASTADORES */
    .drill-guide {
      position: absolute;
      width: 5mm;
      height: 5mm;
      border-radius: 50%;
      border: 1px dashed rgba(255,255,255,0.7);
      background: rgba(0,0,0,0.15);
      pointer-events: none;
      z-index: 40;
    }
    .drill-tl { top: 5mm; left: 5mm; }
    .drill-tr { top: 5mm; right: 5mm; }
    .drill-bl { bottom: 5mm; left: 5mm; }
    .drill-br { bottom: 5mm; right: 5mm; }

    .instructions-box {
      margin-top: 24px;
      max-width: 720px;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 14px;
      padding: 14px 18px;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
      text-align: center;
    }

    .instructions-box strong {
      color: #f1f5f9;
    }

    /* REGRAS ESTRITAS DE IMPRESSÃO - ZERO DISTORÇÃO */
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        min-height: auto !important;
        display: block !important;
      }

      .no-print {
        display: none !important;
      }

      .print-sheet-stage {
        width: 100% !important;
        margin: 0 auto !important;
        padding: 0 !important;
        page-break-inside: avoid !important;
      }

      .print-container,
      .plate-outer-frame {
        box-shadow: none !important;
        border: none !important;
        page-break-inside: avoid !important;
        margin: 0 auto !important;
      }

      .crop-mark {
        display: block !important;
      }

      .drill-guide {
        display: block !important;
      }
    }
  </style>
</head>
<body>

  <div class="no-print top-bar">
    <div class="top-title-box">
      <h1>
        <span>📸 Base de Impressão Oficial 4K</span>
        <span class="badge-4k">600 DPI Ultra-HD</span>
      </h1>
      <p>Cliente: <strong>${businessName}</strong> • Corte e proporção milimétricos prontos para gráfica</p>
    </div>

    <!-- SELETOR DE TAMANHO -->
    <div style="display:flex; flex-direction:column; gap:4px;">
      <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase;">Tamanho de Impressão:</span>
      <div class="btn-group">
        <button type="button" class="btn-option ${format === 'plate-10x10' ? 'active' : ''}" id="btn-size-10x10" onclick="setSize('plate-10x10')">
          📐 10x10 cm (Mesa)
        </button>
        <button type="button" class="btn-option ${format === 'plate-15x15' ? 'active' : ''}" id="btn-size-15x15" onclick="setSize('plate-15x15')">
          📐 15x15 cm (Totem)
        </button>
        <button type="button" class="btn-option ${format === 'a4-duo' ? 'active' : ''}" id="btn-size-a4duo" onclick="setSize('a4-duo')">
          📄 Folha A4 (2 Placas)
        </button>
        <button type="button" class="btn-option ${format === 'card-cr80' ? 'active' : ''}" id="btn-size-cr80" onclick="setSize('card-cr80')">
          💳 Cartão CR80
        </button>
      </div>
    </div>

    <!-- SELETOR DE TEMA -->
    <div style="display:flex; flex-direction:column; gap:4px;">
      <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase;">Modelo Visual:</span>
      <div class="btn-group">
        <button type="button" class="btn-option ${effectiveTheme === 'instagram_dual' ? 'active-pink' : ''}" id="btn-theme-insta-dual" onclick="setTheme('instagram_dual')">
          📸 Modelo da Foto (Dual)
        </button>
        <button type="button" class="btn-option ${effectiveTheme === 'emerald_green' ? 'active' : ''}" id="btn-theme-green" onclick="setTheme('emerald_green')">
          🟢 Verde Esmeralda
        </button>
        <button type="button" class="btn-option ${effectiveTheme === 'royal_blue' ? 'active' : ''}" id="btn-theme-blue" onclick="setTheme('royal_blue')">
          🔵 Azul Royal
        </button>
        <button type="button" class="btn-option ${effectiveTheme === 'black_gold' ? 'active' : ''}" id="btn-theme-black" onclick="setTheme('black_gold')">
          ⚫ Preto Piano
        </button>
        <button type="button" class="btn-option ${effectiveTheme === 'instagram_official' ? 'active-pink' : ''}" id="btn-theme-insta-oficial" onclick="setTheme('instagram_official')">
          📸 Instagram 100%
        </button>
      </div>
    </div>

    <!-- BOTÕES DE AÇÃO -->
    <div style="display:flex; align-items:center; gap:8px;">
      <button type="button" class="btn-print-main" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
        <span>Imprimir Agora (Ctrl+P)</span>
      </button>

      <button type="button" class="btn-download-png" onclick="downloadCurrentPng()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        <span>Baixar PNG 4K</span>
      </button>
    </div>
  </div>

  <div class="print-sheet-stage">
    
    <div class="no-print scale-ruler-badge" id="scale-badge">
      <span>📏 Proporção Rigorosa: <strong>100 mm × 100 mm (10,0 cm × 10,0 cm • 1:1 Quadrado)</strong></span>
    </div>

    <div class="plate-outer-frame size-plate-10x10 print-container" id="main-plate-frame">
      <div class="crop-mark crop-tl"></div>
      <div class="crop-mark crop-tr"></div>
      <div class="crop-mark crop-bl"></div>
      <div class="crop-mark crop-br"></div>

      <div class="drill-guide drill-tl" title="Furação para parafuso espaçador"></div>
      <div class="drill-guide drill-tr" title="Furação para parafuso espaçador"></div>
      <div class="drill-guide drill-bl" title="Furação para parafuso espaçador"></div>
      <div class="drill-guide drill-br" title="Furação para parafuso espaçador"></div>

      <img src="${initialImgSrc}" class="plate-art-img" id="plate-image-tag" alt="Placa 4K Ultra-HD">
    </div>

    <div class="duo-container" id="duo-frame" style="display:none;">
      <div class="plate-outer-frame size-plate-10x10 print-container">
        <div class="crop-mark crop-tl"></div>
        <div class="crop-mark crop-tr"></div>
        <div class="crop-mark crop-bl"></div>
        <div class="crop-mark crop-br"></div>
        <div class="drill-guide drill-tl"></div>
        <div class="drill-guide drill-tr"></div>
        <div class="drill-guide drill-bl"></div>
        <div class="drill-guide drill-br"></div>
        <img src="${initialImgSrc}" class="plate-art-img duo-img" alt="Placa 1">
      </div>

      <div class="plate-outer-frame size-plate-10x10 print-container">
        <div class="crop-mark crop-tl"></div>
        <div class="crop-mark crop-tr"></div>
        <div class="crop-mark crop-bl"></div>
        <div class="crop-mark crop-br"></div>
        <div class="drill-guide drill-tl"></div>
        <div class="drill-guide drill-tr"></div>
        <div class="drill-guide drill-bl"></div>
        <div class="drill-guide drill-br"></div>
        <img src="${initialImgSrc}" class="plate-art-img duo-img" alt="Placa 2">
      </div>
    </div>

    <div class="no-print instructions-box">
      <p>
        💡 <strong>Instruções de Impressão:</strong> Na caixa de diálogo do navegador (Ctrl+P), configure <strong>Escala: 100% (Tamanho Real)</strong>, ative <strong>"Gráficos de segundo plano"</strong> e defina margens como <strong>Nenhuma</strong> ou <strong>Padrão</strong>.<br>
        Recomendado: Papel Fotográfico Glossy 230g ou Vinil Adesivo Laminado para colagem em Acrílico Cristal 2mm/3mm.
      </p>
    </div>

  </div>

  <script>
    const themes = {
      instagram_dual: "${plateDual4k}",
      emerald_green: "${plateGreen4k}",
      royal_blue: "${plateBlue4k}",
      black_gold: "${plateBlack4k}",
      instagram_official: "${plateInstaOficial4k}",
      card_cr80: "${cardCr804k}"
    };

    let currentTheme = "${effectiveTheme}";
    let currentSize = "${format}";

    function setTheme(t) {
      currentTheme = t;
      const mainImg = document.getElementById('plate-image-tag');
      const targetSrc = currentSize === 'card-cr80' ? themes.card_cr80 : (themes[t] || themes.instagram_dual);
      if (mainImg) mainImg.src = targetSrc;

      document.querySelectorAll('.duo-img').forEach(img => {
        img.src = themes[t] || themes.instagram_dual;
      });

      document.querySelectorAll('#btn-theme-insta-dual, #btn-theme-green, #btn-theme-blue, #btn-theme-black, #btn-theme-insta-oficial').forEach(b => {
        b.className = 'btn-option';
      });

      const activeBtn = t === 'instagram_dual' ? document.getElementById('btn-theme-insta-dual')
        : t === 'emerald_green' ? document.getElementById('btn-theme-green')
        : t === 'royal_blue' ? document.getElementById('btn-theme-blue')
        : t === 'black_gold' ? document.getElementById('btn-theme-black')
        : document.getElementById('btn-theme-insta-oficial');

      if (activeBtn) {
        activeBtn.className = (t === 'instagram_dual' || t === 'instagram_official') ? 'btn-option active-pink' : 'btn-option active';
      }
    }

    function setSize(s) {
      currentSize = s;
      const singleFrame = document.getElementById('main-plate-frame');
      const duoFrame = document.getElementById('duo-frame');
      const scaleBadge = document.getElementById('scale-badge');
      const mainImg = document.getElementById('plate-image-tag');

      document.querySelectorAll('#btn-size-10x10, #btn-size-15x15, #btn-size-a4duo, #btn-size-cr80').forEach(b => {
        b.className = 'btn-option';
      });

      if (s === 'a4-duo') {
        singleFrame.style.display = 'none';
        duoFrame.style.display = 'flex';
        document.getElementById('btn-size-a4duo').className = 'btn-option active';
        scaleBadge.innerHTML = '<span>📄 Otimização Folha A4: <strong>2x Placas de 100mm × 100mm Lado a Lado</strong></span>';
      } else {
        duoFrame.style.display = 'none';
        singleFrame.style.display = 'flex';
        singleFrame.className = 'plate-outer-frame print-container';

        if (s === 'plate-10x10') {
          singleFrame.classList.add('size-plate-10x10');
          document.getElementById('btn-size-10x10').className = 'btn-option active';
          scaleBadge.innerHTML = '<span>📏 Proporção Rigorosa: <strong>100 mm × 100 mm (10,0 cm × 10,0 cm • 1:1 Quadrado)</strong></span>';
          if (mainImg) mainImg.src = themes[currentTheme] || themes.instagram_dual;
        } else if (s === 'plate-15x15') {
          singleFrame.classList.add('size-plate-15x15');
          document.getElementById('btn-size-15x15').className = 'btn-option active';
          scaleBadge.innerHTML = '<span>📏 Proporção Rigorosa: <strong>150 mm × 150 mm (15,0 cm × 15,0 cm • Totem Ampliado)</strong></span>';
          if (mainImg) mainImg.src = themes[currentTheme] || themes.instagram_dual;
        } else if (s === 'card-cr80') {
          singleFrame.classList.add('size-card-cr80');
          document.getElementById('btn-size-cr80').className = 'btn-option active';
          scaleBadge.innerHTML = '<span>💳 Cartão CR80 Padrão ISO: <strong>85 mm × 54 mm (8,5 cm × 5,4 cm)</strong></span>';
          if (mainImg) mainImg.src = themes.card_cr80;
        }
      }
    }

    function downloadCurrentPng() {
      const src = (currentSize === 'card-cr80') ? themes.card_cr80 : (themes[currentTheme] || themes.instagram_dual);
      const a = document.createElement('a');
      const safeName = "${businessName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}";
      a.download = "placa_4k_ultra_hd_" + safeName + "_" + currentTheme + ".png";
      a.href = src;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Aplica o formato inicial se não for o padrão
    if ("${format}" !== "plate-10x10") {
      setSize("${format}");
    }
  </script>
</body>
</html>`);
    printWindow.document.close();
  } catch (err: any) {
    console.error('Erro ao renderizar arte 4K para impressão:', err);
    if (lead && onFallbackModal) {
      onFallbackModal(lead);
    }
  }
}
