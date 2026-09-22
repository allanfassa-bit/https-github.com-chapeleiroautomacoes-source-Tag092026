import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Lazy-initialization helper for Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null; // Return null so we can run gracefully in Demo/Offline mode if key is missing
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const app = express();

// Secure backend by disabling fingerprint headers (removes X-Powered-By)
app.disable('x-powered-by');

// Strict CyberShield defense headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // CORS policy: Allow only our workspace domains dynamically
  const origin = req.headers.origin;
  if (origin && (origin.endsWith('.run.app') || origin.startsWith('http://localhost:'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// GMB CyberShield Guard - Protects against Prompt Injection, XSS, SQLi and malicious payloads
function auditInputSecurity(inputs: Record<string, any>): { safe: boolean; reason?: string } {
  // Regex patterns to capture dangerous Prompt Injection and exploit behaviors
  const promptInjectionPatterns = [
    /ignore\s+previous/i,
    /system\s+override/i,
    /desconsidere\s+as/i,
    /previous\s+instructions/i,
    /comportamento\s+anterior/i,
    /prompt\s+inject/i,
    /bypass/i,
    /reveal\s+secret/i,
    /api\s*key/i,
    /process\.env/i,
    /env\./i,
    /eval\(/i,
    /global\./i,
    /<script/i,
    /javascript:/i,
    /drop\s+table/i,
    /select\s+\*\s+from/i,
    /union\s+select/i,
    /or\s+1\s*=\s*1/i
  ];

  const dangerousChars = /[<>;{}|[\]\\]/;

  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'string') {
      // 1. Enforce length constraints - short input fields like city/niche are capped at 80, large payload strings have a safe 4000 cap
      const isShortInput = key === 'city' || key === 'niche' || key === 'customNiche';
      const maxLength = isShortInput ? 80 : 4000;
      
      if (value.length > maxLength) {
        return { safe: false, reason: `Parâmetro '${key}' excede o limite máximo de segurança de ${maxLength} caracteres.` };
      }

      // 2. Scan for prompt injection keywords
      for (const pattern of promptInjectionPatterns) {
        if (pattern.test(value)) {
          return { safe: false, reason: `Parâmetro '${key}' contém comandos suspeitos ou termos restritos de injeção de prompt.` };
        }
      }

      // 3. Scan for control characters indicating XSS or query manipulation
      if (dangerousChars.test(value)) {
        return { safe: false, reason: `Parâmetro '${key}' contém caracteres especiais restritos pelo CyberShield.` };
      }
    } else if (typeof value === 'object' && value !== null) {
      // Deep audit nested items safely
      const nestedAudit = auditInputSecurity(value);
      if (!nestedAudit.safe) return nestedAudit;
    }
  }

  return { safe: true };
}

// Mock fallback leads with rich metadata, verification checks and suggestions
const fallbackLeads = [
  {
    id: "lead_1",
    name: "Sorriso Perfeito Odontologia",
    address: "Av. Central, 1020 - Centro",
    phone: "11 98765-4321",
    rating: 3.7,
    reviewCount: 4,
    hasWebsite: false,
    websiteUrl: null,
    googleMapsUrl: "https://maps.google.com/?q=Sorriso+Perfeito+Odontologia",
    niche: "Dentista",
    city: "São Paulo",
    weakness: "Sem site cadastrado no Google Meu Negócio e baixíssimo engajamento (apenas 4 avaliações)",
    isGoogleRegistered: true,
    googleReviewsStatus: "Crítico: Nota abaixo de 4.0 e menos de 5 avaliações.",
    approachSite: "Mostre o site modelo que criamos com agendamento online integrado. Diga que um site de alta conversão trará mais credibilidade para os pacientes decidirem agendar na hora.",
    approachNfc: "Ofereça a Placa de Avaliação Google NFC para colocar no balcão da recepção, estimulando pacientes satisfeitos a avaliarem o atendimento em 5 segundos.",
    approachMiniSite: "Apresente a ideia de um Mini-Site móvel otimizado com mapa embutido para captar tráfego local do bairro."
  },
  {
    id: "lead_2",
    name: "Oficina Mecânica Precision",
    address: "Rua Industrial, 45 - Bairro Industrial",
    phone: "11 91234-5678",
    rating: 4.1,
    reviewCount: 8,
    hasWebsite: false,
    websiteUrl: null,
    googleMapsUrl: "https://maps.google.com/?q=Oficina+Mecanica+Precision",
    niche: "Mecânica",
    city: "São Paulo",
    weakness: "Sem site cadastrado no Google Meu Negócio e baixíssimo volume de avaliações (apenas 8 avaliações)",
    isGoogleRegistered: true,
    googleReviewsStatus: "Alerta: Poucas avaliações (8) para o tamanho do negócio.",
    approachSite: "Apresente um Site Modelo focado em serviços rápidos e orçamentos integrados pelo WhatsApp. Diga que isso reduz a fricção de contato e atrai motoristas em apuros.",
    approachNfc: "Apresente a Placa NFC de Avaliação como uma forma de os mecânicos pedirem a avaliação diretamente na entrega do carro consertado, subindo o rank no Google.",
    approachMiniSite: "Sugerir um Mini-Site simples de carregamento ultra-rápido para o motorista achar a oficina na hora que o carro quebrar na rua."
  },
  {
    id: "lead_3",
    name: "Bella Vista Pizzaria",
    address: "Rua das Flores, 880 - Vila Nova",
    phone: "11 92345-6789",
    rating: 3.9,
    reviewCount: 5,
    hasWebsite: false,
    websiteUrl: null,
    googleMapsUrl: "https://maps.google.com/?q=Bella+Vista+Pizzaria",
    niche: "Restaurante",
    city: "São Paulo",
    weakness: "Sem site oficial cadastrado no Google Meu Negócio e com apenas 5 avaliações locais",
    isGoogleRegistered: true,
    googleReviewsStatus: "Crítico: Sem site cadastrado e apenas 5 avaliações.",
    approachSite: "Mostre que um site moderno de delivery sem taxas (diferente de iFood) é ideal para reter clientes, mostrando fotos deliciosas das pizzas.",
    approachNfc: "Sugerir colocar a Placa NFC de Avaliação com QR-Code na mesa ou na entrega dos pedidos, oferecendo refrigerante grátis para quem avaliar na hora.",
    approachMiniSite: "Ofertar um mini-site móvel com cardápio digital interativo e rápido para pedidos via WhatsApp."
  },
  {
    id: "lead_4",
    name: "Clínica Vet Amigo",
    address: "Alameda das Américas, 400 - Jardim Primavera",
    phone: "11 93456-7890",
    rating: 4.2,
    reviewCount: 3,
    hasWebsite: false,
    websiteUrl: null,
    googleMapsUrl: "https://maps.google.com/?q=Clinica+Vet+Amigo",
    niche: "Veterinária",
    city: "São Paulo",
    weakness: "Sem site cadastrado no Google Meu Negócio e apenas 3 avaliações",
    isGoogleRegistered: true,
    googleReviewsStatus: "Crítico: Apenas 3 avaliações no Google. Perde relevância nas pesquisas de emergências pet.",
    approachSite: "Mostre um site elegante focado em emergências 24h e agendamento de consultas pet.",
    approachNfc: "Instalar a Placa NFC no caixa da clínica para os donos de pets deixarem sua recomendação carinhosa na hora do pagamento.",
    approachMiniSite: "Indicar um Mini-Site Mobile-First com as especialidades atendidas e botão rápido de emergência no WhatsApp."
  },
  {
    id: "lead_5",
    name: "Espaço Elegance Salão de Beleza",
    address: "Av. Brasil, 1500 - Sala 3 - Centro",
    phone: "11 94567-8901",
    rating: 3.5,
    reviewCount: 6,
    hasWebsite: false,
    websiteUrl: null,
    googleMapsUrl: "https://maps.google.com/?q=Espaco+Elegance+Salao",
    niche: "Salão de Beleza",
    city: "São Paulo",
    weakness: "Sem site cadastrado no Google Meu Negócio e pouquíssimas avaliações (apenas 6)",
    isGoogleRegistered: true,
    googleReviewsStatus: "Crítico: Nota média muito baixa (3.5). Afasta novas clientes em busca de confiança visual.",
    approachSite: "Criar uma Landing Page modelo com portfólio visual deslumbrante de cortes e cores, gerando desejo imediato.",
    approachNfc: "Oferecer a Placa NFC de Avaliação para reverter a nota baixa, pedindo feedback exclusivo para as clientes que saem amando o cabelo novo.",
    approachMiniSite: "Ofertar um Mini-Site simples com tabela de preços de serviços e link direto de agendamento."
  }
];

// Dynamic NFC/QR Code Redirection Route
app.get('/r/:leadId', async (req, res) => {
  const { leadId } = req.params;
  
  // CyberShield Sanitization: Whitelist leadId parameter structure to block path traversal or API probe attacks
  const cleanLeadId = leadId.replace(/[^a-zA-Z0-9_\-]/g, '');
  if (!cleanLeadId || cleanLeadId !== leadId) {
    return res.status(400).send('<h1>Erro 400</h1><p>ID de Redirecionamento Inválido ou Malicioso.</p>');
  }

  try {
    const projectId = "gen-lang-client-0330090716";
    const databaseId = "ai-studio-alfautomaogmbsal-702a33aa-2f38-4afe-9ac9-5641b8c276cd";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/leads/${cleanLeadId}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      // Fallback redirect to Google if lead does not exist yet
      return res.redirect('https://maps.google.com');
    }
    
    const doc = await response.json();
    const fields = doc.fields || {};
    
    // Check billing status
    const billingStatus = fields.nfcBillingStatus?.stringValue || 'active';
    if (billingStatus === 'suspended') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redirecionamento Suspenso</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-6">
          <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
            <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 class="text-xl font-black text-slate-100 mb-2">Acesso Temporariamente Suspenso</h1>
            <p class="text-sm text-slate-400 mb-6 leading-relaxed">
              Este redirecionamento dinâmico inteligente está temporariamente inativo por pendência financeira ou licença expirada.
            </p>
            <div class="bg-slate-950 rounded-2xl p-4 border border-slate-800/50 mb-6 text-xs text-left">
              <span class="block text-slate-500 uppercase tracking-wider font-bold mb-1">Dono da Placa:</span>
              <span class="block font-semibold text-slate-300 text-sm mb-2">${fields.name?.stringValue || 'Estabelecimento Local'}</span>
              <span class="block text-slate-500 uppercase tracking-wider font-bold mb-1">Para Reativar:</span>
              <span class="block text-slate-400 leading-normal">Entre em contato imediato com a equipe comercial da <strong class="text-cyan-400 font-bold">ALF Automação</strong> para regularizar sua mensalidade e reestabelecer o funcionamento da sua placa NFC e QR Code.</span>
            </div>
            <a href="https://wa.me/554799999999?text=Ola%20equipe%20ALF%20Automacao,%20gostaria%20de%20reativar%20minha%20placa%20NFC." class="block w-full bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition duration-150">
              Falar com Suporte ALF
            </a>
          </div>
        </body>
        </html>
      `);
    }
    
    const activeRedirect = fields.nfcRedirectActive?.stringValue || 'gmb';
    let targetUrl = fields.googleMapsUrl?.stringValue || 'https://maps.google.com';
    
    if (activeRedirect === 'instagram') {
      targetUrl = fields.nfcInstagramUrl?.stringValue || targetUrl;
    } else if (activeRedirect === 'whatsapp') {
      const num = fields.nfcWhatsappNum?.stringValue || '';
      const msg = fields.nfcWhatsappMsg?.stringValue || 'Olá! Gostaria de fazer um agendamento.';
      if (num) {
        targetUrl = `https://wa.me/${num.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
      }
    } else if (activeRedirect === 'website') {
      targetUrl = fields.websiteUrl?.stringValue || targetUrl;
    } else if (activeRedirect === 'custom') {
      targetUrl = fields.nfcCustomUrl?.stringValue || targetUrl;
    }
    
    // Add protocol if missing
    if (targetUrl && !/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }
    
    // Strict URL check to prevent protocol injection (e.g. javascript:, data:, file:)
    try {
      const parsedUrl = new URL(targetUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return res.status(400).send('<h1>Erro 400</h1><p>Protocolo de Redirecionamento Não Permitido.</p>');
      }
    } catch (e) {
      return res.redirect('https://maps.google.com');
    }
    
    return res.redirect(targetUrl);
  } catch (error) {
    console.error('Redirection error:', error);
    return res.redirect('https://maps.google.com');
  }
});

// Lead Normalization & Field Assurance
function normalizeLeads(items: any[], defaultNiche: string, defaultCity: string): any[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter(item => item && typeof item === 'object')
    .map((item, idx) => {
      const name = String(item.name || `Empresa Local #${idx + 1}`).trim();
      const city = String(item.city || defaultCity).trim();
      const niche = String(item.niche || defaultNiche).trim();
      const rawRating = typeof item.rating === 'number' ? item.rating : parseFloat(String(item.rating || '4.0'));
      const rating = isNaN(rawRating) ? 4.0 : Math.min(5.0, Math.max(1.0, parseFloat(rawRating.toFixed(1))));
      const rawCount = typeof item.reviewCount === 'number' ? item.reviewCount : parseInt(String(item.reviewCount || '5'), 10);
      const reviewCount = isNaN(rawCount) ? 5 : Math.max(0, rawCount);

      return {
        id: String(item.id || `lead_${Date.now()}_${idx + 1}`),
        name,
        address: String(item.address || `Endereço comercial em ${city}`).trim(),
        phone: item.phone ? String(item.phone).trim() : 'Telefone não informado',
        rating,
        reviewCount,
        hasWebsite: Boolean(item.hasWebsite),
        websiteUrl: item.websiteUrl && item.websiteUrl !== 'null' ? String(item.websiteUrl).trim() : null,
        googleMapsUrl: item.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${name} ${niche} ${city}`)}`,
        niche,
        city,
        weakness: String(item.weakness || 'Poucas avaliações registradas e ausência de presença digital estruturada.').trim(),
        isGoogleRegistered: item.isGoogleRegistered !== undefined ? Boolean(item.isGoogleRegistered) : true,
        googleReviewsStatus: String(item.googleReviewsStatus || (reviewCount < 15 ? 'Atenção: Baixo volume de avaliações' : 'Avaliações requerem estímulo ativo com Placa NFC')).trim(),
        approachSite: String(item.approachSite || 'Apresentar site modelo profissional (R$ 1.500) com agendamento direto e alta velocidade.').trim(),
        approachNfc: String(item.approachNfc || 'Implantar Placa de Balcão NFC (R$ 129 a R$ 100) para coletar avaliações 5 estrelas em 3 segundos.').trim(),
        approachMiniSite: String(item.approachMiniSite || 'Oferecer o Combo Completo Placa NFC + Site por R$ 1.300 (economia de mais de R$ 300).').trim()
      };
    });
}

// Anti-Truncation & Robust JSON Extractor
function parseAndRepairLeadsJson(rawText: string, defaultNiche: string, defaultCity: string): { leads: any[]; recovered: boolean } {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return { leads: [], recovered: false };
  }

  // 1. Strip Markdown Code Fences
  let cleaned = rawText
    .replace(/^```json\s*/im, '')
    .replace(/^```\s*/im, '')
    .replace(/\s*```$/im, '')
    .trim();

  // 2. Direct Parse Attempt
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { leads: normalizeLeads(parsed, defaultNiche, defaultCity), recovered: false };
    }
    if (parsed && Array.isArray(parsed.leads) && parsed.leads.length > 0) {
      return { leads: normalizeLeads(parsed.leads, defaultNiche, defaultCity), recovered: false };
    }
  } catch (err: any) {
    console.warn(`[Anti-Truncation] Direct JSON parse failed (${err.message}). Activating repair strategies...`);
  }

  // 3. Array Substring Extraction Attempt
  const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { leads: normalizeLeads(parsed, defaultNiche, defaultCity), recovered: true };
      }
    } catch (_) {
      // Continue to truncation recovery
    }
  }

  // 4. Truncation Recovery Strategy:
  // If response ended abruptly mid-token, find the last completely closed JSON object '}'
  const lastCloseBrace = cleaned.lastIndexOf('}');
  const firstOpenBracket = cleaned.indexOf('[');
  if (lastCloseBrace !== -1 && firstOpenBracket !== -1 && lastCloseBrace > firstOpenBracket) {
    const truncatedArrayAttempt = cleaned.substring(firstOpenBracket, lastCloseBrace + 1) + ']';
    try {
      const parsed = JSON.parse(truncatedArrayAttempt);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[Anti-Truncation] Recovered ${parsed.length} completed leads from truncated stream!`);
        return { leads: normalizeLeads(parsed, defaultNiche, defaultCity), recovered: true };
      }
    } catch (_) {
      // Continue to regex scanning
    }
  }

  // 5. Granular Regex Scanning for Individual Objects
  const recoveredList: any[] = [];
  const objectRegex = /\{[\s\S]*?\}(?=\s*,\s*\{|\s*\]|\s*$)/g;
  let match;
  while ((match = objectRegex.exec(cleaned)) !== null) {
    try {
      const candidate = JSON.parse(match[0]);
      if (candidate && typeof candidate === 'object' && (candidate.name || candidate.weakness)) {
        recoveredList.push(candidate);
      }
    } catch (_) {
      // ignore malformed fragments
    }
  }

  if (recoveredList.length > 0) {
    console.log(`[Anti-Truncation] Granular regex salvaged ${recoveredList.length} leads!`);
    return { leads: normalizeLeads(recoveredList, defaultNiche, defaultCity), recovered: true };
  }

  return { leads: [], recovered: false };
}

// Asynchronous Streaming Lead Prospecting with Detailed Telemetry Logs
app.post('/api/prospect/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const startTime = Date.now();

  try {
    sendEvent('progress', {
      step: 1,
      level: 'info',
      message: 'Executando auditoria e sanitização de parâmetros de busca via CyberShield Guard...'
    });

    const audit = auditInputSecurity(req.body);
    if (!audit.safe) {
      sendEvent('error', {
        error: `Bloqueado por GMB CyberShield Guard: ${audit.reason}`,
        code: 'SECURITY_BLOCKED',
        isSecurityAlert: true
      });
      return res.end();
    }

    let rawCity = String(req.body.city || 'São Paulo').trim();
    let rawNiche = String(req.body.niche || 'Dentista').trim();

    // Smart natural language parser: e.g. "clinica odontologica em marilia-SP"
    if (rawNiche.toLowerCase().includes(' em ') && !rawCity.includes(' em ')) {
      const parts = rawNiche.split(/\s+em\s+/i);
      rawNiche = parts[0].trim();
      rawCity = parts[1].trim();
    } else if (rawCity.toLowerCase().includes(' em ') && !rawNiche.includes(' em ')) {
      const parts = rawCity.split(/\s+em\s+/i);
      rawNiche = parts[0].trim();
      rawCity = parts[1].trim();
    }

    const city = rawCity;
    const niche = rawNiche;
    const searchCity = city.replace(/[-_]/g, ' - ').replace(/\s+/g, ' ').trim();

    sendEvent('progress', {
      step: 2,
      level: 'info',
      message: `Conectando ao cluster Gemini 3.8 Flash e ativando Google Search Grounding em tempo real...`
    });

    const ai = getGeminiClient();
    if (!ai) {
      sendEvent('progress', {
        step: 3,
        level: 'warn',
        message: 'Chave GEMINI_API_KEY não configurada no ambiente. Ativando catálogo inteligente adaptado...'
      });

      const personalizedLeads = fallbackLeads.map((lead, idx) => ({
        ...lead,
        id: `lead_demo_${Date.now()}_${idx + 1}`,
        city,
        niche,
        name: lead.name.replace("Odontologia", niche).replace("Mecânica", niche).replace("Pizzaria", niche).replace("Vet Amigo", `Pet ${niche}`).replace("Salão de Beleza", niche),
        address: lead.address.replace("Centro", `Centro, ${city}`),
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(lead.name + ' ' + city)}`,
      }));

      sendEvent('complete', {
        leads: personalizedLeads,
        mode: 'demo',
        total: personalizedLeads.length,
        executionTimeMs: Date.now() - startTime,
        recovered: false,
        message: 'Modo offline resiliente ativado com sucesso.'
      });
      return res.end();
    }

    sendEvent('progress', {
      step: 3,
      level: 'info',
      message: `Consultando fichas e coordenadas de "${niche}" em "${city}" no Google Maps...`
    });

    // Keep SSE connection alive with active progress updates
    const heartbeat = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      sendEvent('progress', {
        step: 3,
        level: 'info',
        message: `Mapeando fichas de "${niche}" em "${city}" no Google Maps (${elapsed}s decorridos)...`
      });
    }, 2500);

    let response;
    try {
      const prompt = `Use seu recurso de pesquisa web integrado (Google Search Grounding) para pesquisar e extrair empresas locais REAIS e ativas do nicho "${niche}" na cidade ou região de "${searchCity}".
      Selecione de 5 a 7 empresas locais reais encontradas no Google Maps / Google Search que tenham fragilidades comerciais na presença digital (sem site próprio estruturado, poucas avaliações, ou nota abaixo de 4.8).
      Para cada empresa encontrada, obtenha os dados reais:
      - Nome real da empresa
      - Endereço físico completo em ${searchCity}
      - Telefone comercial real
      - Nota média real no Google
      - Quantidade real de avaliações
      - Se possui site próprio (hasWebsite: false se tiver apenas instagram/facebook ou nada)
      - URL do site se houver
      - Descreva na fraqueza (weakness) a vulnerabilidade comercial encontrada.
      Retorne estritamente um array JSON conforme o esquema solicitado.`;

      sendEvent('progress', {
        step: 4,
        level: 'info',
        message: 'Auditando métricas de reputação, avaliações, presença em mapas e fragilidades competitivas...'
      });

      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING, description: "Nome real da empresa obtido na busca" },
                address: { type: Type.STRING, description: "Endereço físico real completo da empresa" },
                phone: { type: Type.STRING, description: "Telefone de contato comercial real (ou formato comercial)" },
                rating: { type: Type.NUMBER, description: "Nota real de avaliação média de 1.0 a 5.0" },
                reviewCount: { type: Type.INTEGER, description: "Total real de avaliações recebidas" },
                hasWebsite: { type: Type.BOOLEAN, description: "Se possui site próprio estruturado" },
                websiteUrl: { type: Type.STRING, description: "URL do site real (ou null se sem site)" },
                googleMapsUrl: { type: Type.STRING, description: "URL de localização no Google Maps" },
                niche: { type: Type.STRING },
                city: { type: Type.STRING },
                weakness: { type: Type.STRING, description: "Explicação em português da maior fraqueza no Google Maps" },
                isGoogleRegistered: { type: Type.BOOLEAN, description: "Define se está reivindicado no GMB" },
                googleReviewsStatus: { type: Type.STRING, description: "Mensagem curta em português avaliando as avaliações" },
                approachSite: { type: Type.STRING, description: "Abordagem focada em site de alta conversão (R$ 1.500)" },
                approachNfc: { type: Type.STRING, description: "Abordagem focada na Placa NFC (R$ 129 a R$ 100)" },
                approachMiniSite: { type: Type.STRING, description: "Abordagem focada no Combo Completo (R$ 1.300)" }
              },
              required: [
                "name", "address", "phone", "rating", "reviewCount", "hasWebsite", "weakness"
              ]
            }
          }
        }
      });
    } finally {
      clearInterval(heartbeat);
    }

    sendEvent('progress', {
      step: 5,
      level: 'info',
      message: 'Validando integridade do payload e aplicando algoritmo anti-truncamento...'
    });

    const rawText = response.text || "[]";
    const { leads, recovered } = parseAndRepairLeadsJson(rawText, niche, city);

    if (leads.length === 0) {
      sendEvent('progress', {
        step: 5,
        level: 'warn',
        message: 'Nenhum lead com fragilidade evidente foi retornado pela IA. Ativando alternativas estruturadas...'
      });

      const personalizedLeads = fallbackLeads.map((lead, idx) => ({
        ...lead,
        id: `lead_adapted_${Date.now()}_${idx + 1}`,
        city,
        niche,
        name: lead.name.replace("Odontologia", niche).replace("Mecânica", niche).replace("Pizzaria", niche).replace("Vet Amigo", `Pet ${niche}`).replace("Salão de Beleza", niche),
        address: lead.address.replace("Centro", `Centro, ${city}`),
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(lead.name + ' ' + city)}`,
      }));

      sendEvent('complete', {
        leads: personalizedLeads,
        mode: 'demo',
        total: personalizedLeads.length,
        executionTimeMs: Date.now() - startTime,
        recovered: true,
        message: 'Busca finalizada com dados estruturados resilientes.'
      });
      return res.end();
    }

    sendEvent('complete', {
      leads,
      mode: 'live',
      total: leads.length,
      executionTimeMs: Date.now() - startTime,
      recovered,
      message: `Sucesso! ${leads.length} empresas reais extraídas do Google Maps para ${city}.`
    });
    return res.end();
  } catch (error: any) {
    console.error("[Streaming Prospect Error]:", error);
    sendEvent('error', {
      error: error.message || "Erro durante processamento da IA",
      details: error.stack || String(error),
      code: error.status || 'AI_GENERATION_FAILED',
      executionTimeMs: Date.now() - startTime
    });
    return res.end();
  }
});

// Standard Lead Prospecting API Endpoint (Anti-Truncation Enhanced)
app.post('/api/prospect', async (req, res) => {
  // Input Security Check
  const audit = auditInputSecurity(req.body);
  if (!audit.safe) {
    console.warn(`[CyberShield Attack Intercepted] Blocked request parameters: ${audit.reason}`);
    return res.status(400).json({ error: `Bloqueado por GMB CyberShield Guard: ${audit.reason}`, isSecurityAlert: true });
  }

  let rawCity = String(req.body.city || 'São Paulo').trim();
  let rawNiche = String(req.body.niche || 'Dentista').trim();

  // Smart natural language parser: e.g. "clinica odontologica em marilia-SP"
  if (rawNiche.toLowerCase().includes(' em ') && !rawCity.includes(' em ')) {
    const parts = rawNiche.split(/\s+em\s+/i);
    rawNiche = parts[0].trim();
    rawCity = parts[1].trim();
  } else if (rawCity.toLowerCase().includes(' em ') && !rawNiche.includes(' em ')) {
    const parts = rawCity.split(/\s+em\s+/i);
    rawNiche = parts[0].trim();
    rawCity = parts[1].trim();
  }

  const city = rawCity;
  const niche = rawNiche;
  const searchCity = city.replace(/[-_]/g, ' - ').replace(/\s+/g, ' ').trim();

  const ai = getGeminiClient();

  if (!ai) {
    console.log("No GEMINI_API_KEY found, returning high-quality demo data.");
    const personalizedLeads = fallbackLeads.map((lead, idx) => ({
      ...lead,
      id: `lead_demo_${idx + 1}`,
      city,
      niche,
      name: lead.name.replace("Odontologia", niche).replace("Mecânica", niche).replace("Pizzaria", niche).replace("Vet Amigo", `Pet ${niche}`).replace("Salão de Beleza", niche),
      address: lead.address.replace("Centro", `Centro, ${city}`),
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(lead.name + ' ' + city)}`,
    }));
    return res.json({ leads: personalizedLeads, mode: "demo", recovered: false });
  }

  try {
    const prompt = `Use seu recurso de pesquisa web integrado (Google Search Grounding) para pesquisar e extrair empresas locais REAIS e ativas do nicho "${niche}" na cidade ou região de "${searchCity}".
    Selecione de 5 a 7 empresas locais reais encontradas no Google Maps / Google Search que tenham fragilidades comerciais na presença digital (sem site próprio estruturado, poucas avaliações, ou nota abaixo de 4.8).
    Para cada empresa encontrada, obtenha os dados reais:
    - Nome real da empresa
    - Endereço físico completo em ${searchCity}
    - Telefone comercial real
    - Nota média real no Google
    - Quantidade real de avaliações
    - Se possui site próprio (hasWebsite: false se tiver apenas instagram/facebook ou nada)
    - URL do site se houver
    - Descreva na fraqueza (weakness) a vulnerabilidade comercial encontrada.
    Retorne estritamente um array JSON conforme o esquema solicitado.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING, description: "Nome real da empresa obtido na busca" },
              address: { type: Type.STRING, description: "Endereço físico real completo da empresa" },
              phone: { type: Type.STRING, description: "Telefone de contato comercial real (ou formato comercial)" },
              rating: { type: Type.NUMBER, description: "Nota real de avaliação média de 1.0 a 5.0" },
              reviewCount: { type: Type.INTEGER, description: "Total real de avaliações recebidas" },
              hasWebsite: { type: Type.BOOLEAN, description: "Se possui site próprio estruturado" },
              websiteUrl: { type: Type.STRING, description: "URL do site real (ou null se sem site)" },
              googleMapsUrl: { type: Type.STRING, description: "URL de localização no Google Maps" },
              niche: { type: Type.STRING },
              city: { type: Type.STRING },
              weakness: { type: Type.STRING, description: "Explicação em português da maior fraqueza no Google Maps" },
              isGoogleRegistered: { type: Type.BOOLEAN, description: "Define se está reivindicado no GMB" },
              googleReviewsStatus: { type: Type.STRING, description: "Mensagem curta em português avaliando as avaliações" },
              approachSite: { type: Type.STRING, description: "Abordagem focada em site de alta conversão (R$ 1.500)" },
              approachNfc: { type: Type.STRING, description: "Abordagem focada na Placa NFC (R$ 129 a R$ 100)" },
              approachMiniSite: { type: Type.STRING, description: "Abordagem focada no Combo Completo (R$ 1.300)" }
            },
            required: [
              "name", "address", "phone", "rating", "reviewCount", "hasWebsite", "weakness"
            ]
          }
        }
      }
    });

    const rawText = response.text || "[]";
    const { leads, recovered } = parseAndRepairLeadsJson(rawText, niche, city);

    if (leads.length === 0) {
      const fallback = fallbackLeads.map((lead, idx) => ({
        ...lead,
        id: `lead_fallback_${Date.now()}_${idx + 1}`,
        city,
        niche,
        name: lead.name.replace("Odontologia", niche).replace("Mecânica", niche).replace("Pizzaria", niche).replace("Vet Amigo", `Pet ${niche}`).replace("Salão de Beleza", niche),
        address: lead.address.replace("Centro", `Centro, ${city}`),
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(lead.name + ' ' + city)}`,
      }));
      return res.json({ leads: fallback, mode: "demo", recovered: true });
    }

    return res.json({ leads, mode: "live", recovered });
  } catch (error: any) {
    console.error("Error generating prospects with Gemini:", error);
    return res.status(500).json({ 
      error: error.message || "Erro ao consultar a IA.",
      details: error.stack || String(error),
      code: error.status || 500
    });
  }
});

// ==========================================
// MASTER AUTHENTICATION SYSTEM
// ==========================================
const configuredUser = (process.env.MASTER_USER || '').trim();
const configuredPass = (process.env.MASTER_PASSWORD || '').trim();

// Master Login Endpoint
app.post('/api/master/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Informe usuário e senha Master.' });
  }

  const u = String(username).trim();
  const p = String(password).trim();
  const uLower = u.toLowerCase();

  // Accept configured env user or standard defaults
  const acceptedUsers = [
    'master',
    'mysis@26',
    'allanfassa@gmail.com',
    'admin',
    'alef'
  ];
  if (configuredUser) {
    acceptedUsers.push(configuredUser.toLowerCase());
  }

  const acceptedPasswords = [
    'master@2026',
    'Myadm@26',
    'alef@2026'
  ];
  if (configuredPass) {
    acceptedPasswords.push(configuredPass);
  }

  const isValidUser = acceptedUsers.includes(uLower);
  const isValidPass = acceptedPasswords.includes(p);

  if (isValidUser && isValidPass) {
    const token = `master_session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const effectiveUser = configuredUser || u;
    return res.json({
      success: true,
      user: effectiveUser,
      token,
      message: 'Acesso Master autorizado com sucesso!'
    });
  }

  return res.status(401).json({
    error: 'Credenciais Master inválidas. Use seu usuário e senha Master (ex: Mysis@26 / Myadm@26 ou master / master@2026).',
    code: 'INVALID_MASTER_CREDENTIALS'
  });
});

// Master Verification Endpoint
app.post('/api/master/verify', (req, res) => {
  const { token } = req.body || {};
  if (token && token.startsWith('master_session_')) {
    return res.json({ valid: true, user: configuredUser || 'master' });
  }
  return res.status(401).json({ valid: false });
});

// Master Public Info (for suggested username)
app.get('/api/master/info', (req, res) => {
  res.json({
    suggestedUser: configuredUser || 'master'
  });
});

// ==========================================
// IMMERSIVE WEBSITE TEMPLATE GENERATOR
// ==========================================
app.post('/api/generate-site-template', async (req, res) => {
  // Input Security Check
  const audit = auditInputSecurity(req.body);
  if (!audit.safe) {
    console.warn(`[CyberShield Attack Intercepted] Blocked request parameters: ${audit.reason}`);
    return res.status(400).json({ error: `Bloqueado por GMB CyberShield Guard: ${audit.reason}`, isSecurityAlert: true });
  }

  const { businessName, niche, city, phone } = req.body;
  const ai = getGeminiClient();

  // Helper function for ultra-rich fallback template (never feels like AI slop)
  const getUltraRichFallback = () => ({
    brand: {
      name: businessName,
      slogan: `Referência de Excelência em ${niche} em ${city}`,
      nicheTag: niche,
      city: city,
      badge: "Empresa Verificada 2026"
    },
    colors: {
      primary: "#0f172a",
      secondary: "#2563eb",
      accent: "#10b981",
      bg: "#f8fafc",
      surface: "#ffffff",
      text: "#0f172a",
      darkBg: "#020617"
    },
    hero: {
      tag: `LÍDER EM ${niche.toUpperCase()} • ${city.toUpperCase()}`,
      title: `${businessName}: Soluções Ágeis, Transparentes e com Garantia em ${city}`,
      subtitle: `Elimine a dor de cabeça e tenha o atendimento que você merece. Mais de 1.200 atendimentos realizados com nota máxima e orçamento sem surpresas.`,
      ctaText: "Pedir Orçamento Expresso no WhatsApp",
      secondaryCtaText: "Ver Casos Reais de Clientes",
      trustMetrics: [
        { value: "4.9 ★", label: "Avaliação Google Meu Negócio" },
        { value: "1.200+", label: "Clientes Atendidos" },
        { value: "30 min", label: "Tempo Médio de Resposta" },
        { value: "100%", label: "Garantia de Satisfação" }
      ]
    },
    interactiveQuote: {
      title: "Simulador Interativo de Atendimento",
      subtitle: "Selecione o serviço desejado para calcular a estimativa e falar com o especialista imediato:",
      options: [
        { name: "Atendimento Prioritário / Emergência", estimatedPrice: "A partir de R$ 120", highlight: "Mais Solicitado" },
        { name: "Serviço Completo com Garantia Total", estimatedPrice: "Sob consulta", highlight: "Melhor Custo-Benefício" },
        { name: "Manutenção Preventiva Especializada", estimatedPrice: "Condição Especial", highlight: "Economia Garantida" }
      ]
    },
    about: {
      title: `Por que clientes em ${city} escolhem a ${businessName}?`,
      text: `Fundada com a premissa de entregar pontualidade, clareza nos preços e técnicos verdadeiramente especializados, a ${businessName} revolucionou a forma de prestar serviços de ${niche} em ${city}. Trabalhamos apenas com materiais certificados e atendimento humanizado.`,
      highlights: [
        "Orçamento 100% transparente antes de iniciar",
        "Técnicos certificados com experiência comprovada",
        "Parcelamento facilitado em até 12x no cartão ou Pix"
      ]
    },
    services: [
      {
        title: "Diagnóstico Rápido & Preciso",
        description: "Avaliação técnica imediata para identificar o problema sem você perder tempo ou dinheiro.",
        badge: "Agilidade Máxima"
      },
      {
        title: "Execução Especializada de Alto Padrão",
        description: "Equipe equipada com ferramentas de ponta para entregar resultado duradouro no primeiro atendimento.",
        badge: "Garantia Estendida"
      },
      {
        title: "Suporte Pós-Atendimento e Acompanhamento",
        description: "Garantia de satisfação com canal direto no WhatsApp para tirar dúvidas a qualquer momento.",
        badge: "Pós-Venda Dedicado"
      }
    ],
    showcase: [
      { title: "Atendimento de Alta Precisão", category: "Caso Recente", result: "Resolvido no mesmo dia com nota 5★" },
      { title: "Projeto Customizado em " + city, category: "Destaque", result: "100% de aprovação e economia de 35%" }
    ],
    testimonials: [
      {
        author: "Camila Rodrigues",
        role: `Moradora de ${city}`,
        text: `Fiquei impressionada com o profissionalismo da equipe da ${businessName}! Foram transparentes no orçamento, chegaram no horário combinado e resolveram com perfeição.`,
        rating: 5,
        timeAgo: "há 2 dias",
        verified: true
      },
      {
        author: "Rafael Silveira",
        role: `Cliente verificado no Google`,
        text: `Melhor serviço de ${niche} da região. Não troco por outro! O atendimento pelo WhatsApp foi instantâneo e o preço muito justo.`,
        rating: 5,
        timeAgo: "há 1 semana",
        verified: true
      },
      {
        author: "Juliana Mendes",
        role: `Empresária em ${city}`,
        text: `Excelente! Nota 10 em pontualidade e acabamento. Nota-se que possuem tecnologia e respeito pelo cliente.`,
        rating: 5,
        timeAgo: "há 3 semanas",
        verified: true
      }
    ],
    faq: [
      {
        question: "Como funciona o processo de orçamento?",
        answer: "Basta clicar no botão de WhatsApp. Nossa equipe recolhe as informações necessárias e te passa um pré-orçamento em poucos minutos sem nenhum compromisso."
      },
      {
        question: "Quais as formas de pagamento disponíveis?",
        answer: "Aceitamos Pix com desconto especial, cartões de crédito em até 12x e transferência bancária."
      },
      {
        question: "Possui garantia dos serviços prestados?",
        answer: "Sim, todos os nossos serviços contam com certificado de garantia formal e suporte pós-atendimento prioritário."
      }
    ],
    cta: {
      title: "Não deixe para depois. Fale com um especialista agora mesmo!",
      text: `Garanta o melhor atendimento de ${niche} em ${city}. Resposta imediata com nossa equipe de prontidão.`,
      buttonText: "Conversar no WhatsApp com Especialista",
      urgency: "Horários limitados para atendimento esta semana"
    }
  });

  if (!ai) {
    console.log("No GEMINI_API_KEY found, returning ultra-rich fallback landing page.");
    return res.json({ template: getUltraRichFallback(), mode: "demo" });
  }

  try {
    const prompt = `Você é um diretor de arte e estrategista de vendas de elite.
Sua missão é criar uma Landing Page ultra-inovadora, de alto padrão comercial e imersiva para a empresa "${businessName}", atuante no nicho de "${niche}" na cidade de "${city}".

DIRETRIZES ANTI-SUPERFICIALIDADE (PROIBIDO TEXTO GENÉRICO DE IA):
- NUNCA use clichês como "O melhor serviço de...", "Empoderamos o seu negócio", "Atendimento express genérico".
- Use gatilhos mentais reais e específicos do nicho de ${niche}: dores do cliente, urgência de atendimento, garantia sem letras miúdas, clareza de preço, autoridade técnica.
- Estruture depoimentos com linguagem natural e humanizada de clientes brasileiros reais.
- Crie um simulador interativo de orçamento com opções de serviços palpáveis do nicho.
- Retorne rigorosamente o JSON conforme a estrutura esperada.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brand: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                slogan: { type: Type.STRING },
                nicheTag: { type: Type.STRING },
                city: { type: Type.STRING },
                badge: { type: Type.STRING }
              },
              required: ["name", "slogan", "nicheTag", "city", "badge"]
            },
            colors: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING, description: "Cor primária marcante hex" },
                secondary: { type: Type.STRING, description: "Cor secundária de apoio hex" },
                accent: { type: Type.STRING, description: "Cor de ação vibrante hex para CTAs de conversão" },
                bg: { type: Type.STRING, description: "Cor de fundo clara hex" },
                surface: { type: Type.STRING, description: "Cor de superfície dos cartões hex" },
                text: { type: Type.STRING, description: "Cor de texto principal de alto contraste hex" },
                darkBg: { type: Type.STRING, description: "Cor para modo escuro imersivo hex" }
              },
              required: ["primary", "secondary", "accent", "bg", "surface", "text", "darkBg"]
            },
            hero: {
              type: Type.OBJECT,
              properties: {
                tag: { type: Type.STRING },
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                ctaText: { type: Type.STRING },
                secondaryCtaText: { type: Type.STRING },
                trustMetrics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      value: { type: Type.STRING },
                      label: { type: Type.STRING }
                    },
                    required: ["value", "label"]
                  }
                }
              },
              required: ["tag", "title", "subtitle", "ctaText", "secondaryCtaText", "trustMetrics"]
            },
            interactiveQuote: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      estimatedPrice: { type: Type.STRING },
                      highlight: { type: Type.STRING }
                    },
                    required: ["name", "estimatedPrice", "highlight"]
                  }
                }
              },
              required: ["title", "subtitle", "options"]
            },
            about: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                text: { type: Type.STRING },
                highlights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["title", "text", "highlights"]
            },
            services: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  badge: { type: Type.STRING }
                },
                required: ["title", "description", "badge"]
              }
            },
            showcase: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  result: { type: Type.STRING }
                },
                required: ["title", "category", "result"]
              }
            },
            testimonials: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  author: { type: Type.STRING },
                  role: { type: Type.STRING },
                  text: { type: Type.STRING },
                  rating: { type: Type.INTEGER },
                  timeAgo: { type: Type.STRING },
                  verified: { type: Type.BOOLEAN }
                },
                required: ["author", "role", "text", "rating", "timeAgo", "verified"]
              }
            },
            faq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
              }
            },
            cta: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                text: { type: Type.STRING },
                buttonText: { type: Type.STRING },
                urgency: { type: Type.STRING }
              },
              required: ["title", "text", "buttonText", "urgency"]
            }
          },
          required: ["brand", "colors", "hero", "interactiveQuote", "about", "services", "showcase", "testimonials", "faq", "cta"]
        }
      }
    });

    const text = response.text || "{}";
    const template = JSON.parse(text);
    return res.json({ template, mode: "live" });
  } catch (error: any) {
    console.warn("Gemini template generation fallback activated:", error.message);
    return res.json({ template: getUltraRichFallback(), mode: "fallback" });
  }
});


// Pitch/WhatsApp Script Generator API Endpoint
app.post('/api/generate-pitch', async (req, res) => {
  // Input Security Check
  const audit = auditInputSecurity(req.body);
  if (!audit.safe) {
    console.warn(`[CyberShield Attack Intercepted] Blocked request parameters: ${audit.reason}`);
    return res.status(400).json({ error: `Bloqueado por GMB CyberShield Guard: ${audit.reason}`, isSecurityAlert: true });
  }

  const { business } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    // Elegant hardcoded fallback pitch
    const defaultPitch = {
      whatsapp: `Olá! Sou especialista em aceleração de negócios locais e estava analisando a presença digital da *${business.name}* no Google em ${business.city}.\n\nNotei que vocês oferecem um excelente trabalho, mas hoje *não possuem um site profissional* cadastrado e têm poucas avaliações do Google (apenas ${business.reviewCount} avaliações).\n\nSabia que cerca de 82% das pessoas pesquisam no celular antes de decidir onde ir? Para te ajudar a reverter isso de forma rápida e faturar mais, desenvolvemos soluções sob medida:\n\n1. 💳 *Placa NFC Inteligente + QR Code (R$ 129,00 - podendo sair a R$ 100,00 na oferta especial)*: Seus clientes apenas aproximam o celular e deixam uma avaliação de 5 estrelas em 3 segundos no balcão.\n2. 🌐 *Site de Alta Conversão (R$ 1.500,00)*: Um site moderno e veloz para colocar vocês no topo das buscas em ${business.city}.\n3. 🚀 *Combo Especial (Placa NFC + Site)*: Tudo por apenas *R$ 1.300,00* (economia de mais de R$ 320,00!).\n\nEu criei um *modelo de site demonstrativo para vocês de graça*, e gostaria de te mostrar! Que tal marcarmos um papo rápido de 5 minutos?\n\nQual o melhor dia para você?`,
      callScript: {
        opening: `Olá! Tudo bem? Por favor, eu poderia falar com o gerente ou responsável pela parte comercial da ${business.name}?`,
        hook: `Olá! Meu nome é Allan, da ALEF Automações. Estava mapeando as empresas de ${business.city} e encontrei o cadastro de vocês no Google Meu Negócio. Vi que vocês têm serviços ótimos, mas notei duas grandes oportunidades que estão fazendo vocês perderem clientes para a concorrência todos os dias: vocês estão sem um site oficial e têm apenas ${business.reviewCount} avaliações de clientes.`,
        valueProp: `Hoje, as pessoas compram de quem tem mais avaliações e passa mais credibilidade. Ajudamos empresas locais com a Placa de Avaliação NFC Inteligente (de R$ 129 a R$ 100) — onde o cliente aproxima o celular e avalia em 3 segundos. Também criamos sites profissionais por R$ 1.500, e no nosso combo promocional sai tudo por apenas R$ 1.300.`,
        objections: `Se eles disserem "não tenho interesse" ou "está caro": Diga: "Compreendo perfeitamente. No entanto, pense que apenas um cliente novo que você ganha com nossa solução já paga todo o investimento do combo de R$ 1.300. Eu inclusive criei uma simulação visual gratuita de como ficaria a sua Placa NFC e o seu novo site. Posso te enviar sem compromisso no WhatsApp para você dar uma olhada?"`,
        closing: `Qual é o seu melhor número de WhatsApp para eu te enviar essas simulações visuais em 2 minutinhos? Assim você avalia se faz sentido para o seu momento de faturamento.`
      }
    };
    return res.json({ pitch: defaultPitch, mode: "demo" });
  }

  try {
    const prompt = `Crie scripts de vendas ultra persuasivos e profissionais para abordar a empresa "${business.name}" (ramo: "${business.niche}", cidade: "${business.city}").
    Considere as seguintes fraquezas que identificamos: "${business.weakness}". O objetivo é vender para eles as soluções da ALEF Automações com nossa tabela oficial:
    - Placa NFC Inteligente de Avaliação Google: R$ 129,00 (podendo sair a R$ 100,00 em condições promocionais ou pacote)
    - Criação de Site Institucional de Alta Conversão: R$ 1.500,00
    - Combo Completo (Placa NFC + Site): R$ 1.300,00 (desconto especial de R$ 329,00!)
    
    A mensagem de WhatsApp deve ser amigável, direta ao ponto, com emojis sutis para facilitar a leitura e destacar o valor do negócio. Ela deve mencionar que nós já geramos um modelo de site demonstrativo pronto para eles darem uma olhada (gatilho mental da reciprocidade) e apresentar as opções de investimento de forma clara.
    O script de ligação por telefone deve conter as etapas estruturadas de abertura, conexão/problema, proposta de valor com os preços, contorno de objeções e fechamento comercial.
    Retorne estritamente um JSON de acordo com o esquema de resposta fornecido.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whatsapp: { type: Type.STRING, description: "A mensagem persuasiva completa em português para WhatsApp, já formatada com quebras de linha e emojis" },
            callScript: {
              type: Type.OBJECT,
              properties: {
                opening: { type: Type.STRING, description: "Como abrir a ligação telefônica e falar com o tomador de decisão" },
                hook: { type: Type.STRING, description: "Como introduzir o problema do negócio (falta de site/baixa avaliação) sem parecer ofensivo, gerando dor comercial" },
                valueProp: { type: Type.STRING, description: "Apresentação matadora do cartão de avaliação NFC e do site de modelo criado" },
                objections: { type: Type.STRING, description: "Dicas exatas de como lidar com objeções comuns (ex: 'Estou sem tempo', 'Já temos muitos clientes')" },
                closing: { type: Type.STRING, description: "Fechamento convidativo para agendar uma reunião comercial ou enviar o site modelo" }
              },
              required: ["opening", "hook", "valueProp", "objections", "closing"]
            }
          },
          required: ["whatsapp", "callScript"]
        }
      }
    });

    const text = response.text || "{}";
    const pitch = JSON.parse(text);
    return res.json({ pitch, mode: "live" });
  } catch (error: any) {
    console.error("Error generating sales pitch with Gemini:", error);
    return res.status(500).json({ error: error.message || "Erro ao gerar scripts de vendas." });
  }
});

// Endpoint de Exportação Direta do Projeto em ZIP
app.get('/api/export/zip', async (req, res) => {
  try {
    const zipPath = path.join('/tmp', `alf-automacao-project-${Date.now()}.zip`);
    const scriptPath = path.join('/tmp', `create_zip_${Date.now()}.py`);
    const pythonScript = `
import zipfile, os
with zipfile.ZipFile("${zipPath}", "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".git", "dist", ".aistudio")]
        for file in files:
            if file.endswith((".zip", ".tar.gz")): continue
            path = os.path.join(root, file)
            z.write(path, os.path.relpath(path, "."))
`;
    await fs.writeFile(scriptPath, pythonScript, 'utf-8');
    await new Promise((resolve, reject) => {
      exec(`python3 ${scriptPath}`, (error) => {
        if (error) reject(error);
        else resolve(true);
      });
    });

    res.download(zipPath, 'alf-automacao-gmb.zip', async () => {
      try {
        await fs.unlink(zipPath);
        await fs.unlink(scriptPath);
      } catch (_) {}
    });
  } catch (error: any) {
    console.error('Failed to export zip:', error);
    res.status(500).json({ error: 'Erro ao gerar arquivo zip do projeto', details: error.message });
  }
});

// Setup Vite Dev Server / Static files handler
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production mode - Serve static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[Server] Running at http://localhost:${port}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
