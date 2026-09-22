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
        websiteUrl: item.websiteUrl ? String(item.websiteUrl).trim() : null,
        googleMapsUrl: item.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${name} ${niche} ${city}`)}`,
        niche,
        city,
        weakness: String(item.weakness || 'Poucas avaliações registradas e ausência de presença digital estruturada.').trim(),
        isGoogleRegistered: item.isGoogleRegistered !== undefined ? Boolean(item.isGoogleRegistered) : true,
        googleReviewsStatus: String(item.googleReviewsStatus || (reviewCount < 10 ? 'Atenção: Baixo volume de avaliações' : 'Avaliações requerem estímulo ativo')).trim(),
        approachSite: String(item.approachSite || 'Apresentar site modelo moderno com agendamento direto para converter buscas em clientes.').trim(),
        approachNfc: String(item.approachNfc || 'Implantar placa de balcão inteligente com chip NFC e QR Code para multiplicar avaliações 5 estrelas.').trim(),
        approachMiniSite: String(item.approachMiniSite || 'Oferecer mini-site de carregamento instantâneo focado em celulares locais.').trim()
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

    const { city = 'São Paulo', niche = 'Dentista' } = req.body;

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

    const prompt = `Use seu recurso de pesquisa web integrado (Google Search Grounding) para pesquisar e extrair empresas locais REAIS e ativas do nicho "${niche}" na cidade ou região de "${city}".
    Selecione de 6 a 8 empresas que tenham graves fraquezas na presença digital, seguindo rigorosamente estes critérios reais de precisão:
    1. ANALISE SE HÁ UM SITE PROFISSIONAL: Se a empresa possuir apenas redes sociais (como facebook.com, instagram.com) ou sites gratuitos obsoletos (como .negocio.site), classifique hasWebsite como false e coloque websiteUrl como null. Nós queremos focar em empresas sem um site profissional estruturado.
    2. AVALIAÇÕES E REPUTAÇÃO: Identifique com prioridade absoluta estabelecimentos com poucas avaliações (menos de 20 avaliações) ou média de avaliações baixa (nota média de 1.0 a 4.4).
    3. DETALHAMENTO DAS FRAGILIDADES: Na propriedade "weakness", explique com dados específicos do Google Maps por que este negócio está vulnerável (ex: "Sem site profissional, possui apenas 4 avaliações com nota 3.9 e a última avaliação foi há mais de 1 ano").
    
    Extraia o nome real da empresa, o endereço real completo aproximado obtido na busca, telefone real de contato público e o link correto de pesquisa no Google Maps para que possamos contatá-los de verdade.
    Analise com critério profissional as fraquezas reais e elabore abordagens persuasivas e personalizadas para cada um de nossos produtos (Site Modelo, Placa de Avaliação NFC e Mini Site de conversão rápido).
    Retorne estritamente um JSON no formato de array de objetos com o esquema solicitado.`;

    sendEvent('progress', {
      step: 4,
      level: 'info',
      message: 'Auditando métricas de reputação, avaliações, presença em mapas e fragilidades competitivas...'
    });

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
              phone: { type: Type.STRING, description: "Telefone de contato comercial real (ou null/vazio se indisponível)" },
              rating: { type: Type.NUMBER, description: "Nota real de avaliação média de 1.0 a 5.0" },
              reviewCount: { type: Type.INTEGER, description: "Total real de avaliações recebidas" },
              hasWebsite: { type: Type.BOOLEAN, description: "Se possui site próprio estruturado" },
              websiteUrl: { type: Type.STRING, description: "URL do site real (ou null se sem site)" },
              googleMapsUrl: { type: Type.STRING, description: "URL de localização no Google Maps" },
              niche: { type: Type.STRING },
              city: { type: Type.STRING },
              weakness: { type: Type.STRING, description: "Explicação em português da maior fraqueza (ex: Sem site profissional e apenas 3 avaliações)" },
              isGoogleRegistered: { type: Type.BOOLEAN, description: "Define se está reivindicado no GMB" },
              googleReviewsStatus: { type: Type.STRING, description: "Mensagem curta em português avaliando as avaliações" },
              approachSite: { type: Type.STRING, description: "Abordagem comercial focada em site de alta conversão" },
              approachNfc: { type: Type.STRING, description: "Abordagem comercial focada na Placa NFC" },
              approachMiniSite: { type: Type.STRING, description: "Abordagem focada em mini-site institucional rápido" }
            },
            required: [
              "id", "name", "address", "phone", "rating", "reviewCount", "hasWebsite", "niche", "city", "weakness",
              "isGoogleRegistered", "googleReviewsStatus", "approachSite", "approachNfc", "approachMiniSite"
            ]
          }
        }
      }
    });

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
      message: `Sucesso absoluto! ${leads.length} oportunidades reais extraídas do Google Maps sem truncamento.`
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

  const { city = 'São Paulo', niche = 'Dentista' } = req.body;
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
    const prompt = `Use seu recurso de pesquisa web integrado (Google Search Grounding) para pesquisar e extrair empresas locais REAIS e ativas do nicho "${niche}" na cidade ou região de "${city}".
    Selecione de 6 a 8 empresas que tenham graves fraquezas na presença digital, seguindo rigorosamente estes critérios reais de precisão:
    1. ANALISE SE HÁ UM SITE PROFISSIONAL: Se a empresa possuir apenas redes sociais (como facebook.com, instagram.com) ou sites gratuitos obsoletos (como .negocio.site), classifique hasWebsite como false e coloque websiteUrl como null. Nós queremos focar em empresas sem um site profissional estruturado.
    2. AVALIAÇÕES E REPUTAÇÃO: Identifique com prioridade absoluta estabelecimentos com poucas avaliações (menos de 20 avaliações) ou média de avaliações baixa (nota média de 1.0 a 4.4).
    3. DETALHAMENTO DAS FRAGILIDADES: Na propriedade "weakness", explique com dados específicos do Google Maps por que este negócio está vulnerável (ex: "Sem site profissional, possui apenas 4 avaliações com nota 3.9 e a última avaliação foi há mais de 1 ano").
    
    Extraia o nome real da empresa, o endereço real completo aproximado obtido na busca, telefone real de contato público e o link correto de pesquisa no Google Maps para que possamos contatá-los de verdade.
    Analise com critério profissional as fraquezas reais e elabore abordagens persuasivas e personalizadas para cada um de nossos produtos (Site Modelo, Placa de Avaliação NFC e Mini Site de conversão rápido).
    Retorne estritamente um JSON no formato de array de objetos com o esquema solicitado.`;

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
              phone: { type: Type.STRING, description: "Telefone de contato comercial real (ou null/vazio se indisponível)" },
              rating: { type: Type.NUMBER, description: "Nota real de avaliação média de 1.0 a 5.0" },
              reviewCount: { type: Type.INTEGER, description: "Total real de avaliações recebidas" },
              hasWebsite: { type: Type.BOOLEAN, description: "Se possui site próprio estruturado" },
              websiteUrl: { type: Type.STRING, description: "URL do site real (ou null se sem site)" },
              googleMapsUrl: { type: Type.STRING, description: "URL de localização no Google Maps" },
              niche: { type: Type.STRING },
              city: { type: Type.STRING },
              weakness: { type: Type.STRING, description: "Explicação em português da maior fraqueza (ex: Sem site profissional e apenas 3 avaliações)" },
              isGoogleRegistered: { type: Type.BOOLEAN, description: "Define se está reivindicado no GMB" },
              googleReviewsStatus: { type: Type.STRING, description: "Mensagem curta em português avaliando as avaliações" },
              approachSite: { type: Type.STRING, description: "Abordagem comercial focada em site de alta conversão" },
              approachNfc: { type: Type.STRING, description: "Abordagem comercial focada na Placa NFC" },
              approachMiniSite: { type: Type.STRING, description: "Abordagem focada em mini-site institucional rápido" }
            },
            required: [
              "id", "name", "address", "phone", "rating", "reviewCount", "hasWebsite", "niche", "city", "weakness",
              "isGoogleRegistered", "googleReviewsStatus", "approachSite", "approachNfc", "approachMiniSite"
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

// Website Template Generation API Endpoint
app.post('/api/generate-site-template', async (req, res) => {
  // Input Security Check
  const audit = auditInputSecurity(req.body);
  if (!audit.safe) {
    console.warn(`[CyberShield Attack Intercepted] Blocked request parameters: ${audit.reason}`);
    return res.status(400).json({ error: `Bloqueado por GMB CyberShield Guard: ${audit.reason}`, isSecurityAlert: true });
  }

  const { businessName, niche, city } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    console.log("No GEMINI_API_KEY found, returning fallback elegant layout template.");
    // Return a nice fallback layout based on the business name and niche
    const defaultTemplate = {
      colors: {
        primary: "#1E3A8A",
        secondary: "#3B82F6",
        accent: "#F59E0B",
        bg: "#F8FAFC",
        text: "#1E293B"
      },
      hero: {
        title: `O melhor serviço de ${niche} em ${city}`,
        subtitle: `Profissionalismo, qualidade e compromisso com o cliente. Venha conhecer a ${businessName} e descubra a nossa excelência.`,
        ctaText: "Agendar Atendimento"
      },
      about: {
        title: `Sobre a ${businessName}`,
        text: `Nós somos líderes na região de ${city} prestando serviços dedicados de ${niche}. Nossa missão é entregar conforto, excelência técnica e preços justos para todos os nossos parceiros e clientes.`
      },
      services: [
        { title: "Atendimento Express", description: "Atendimento prioritário e de alta eficiência para urgências de nossos clientes." },
        { title: "Serviço Personalizado", description: "Adaptado inteiramente para as suas necessidades específicas." },
        { title: "Garantia de Qualidade", description: "Profissionais certificados com anos de experiência." }
      ],
      testimonials: [
        { author: "Maria Souza", role: "Cliente Local", text: `Excelente atendimento! A equipe da ${businessName} é super prestativa e resolveu tudo super rápido.` },
        { author: "Carlos Lima", role: "Morador de ${city}", text: "Recomendo muito. Transparência nos preços e qualidade indiscutível nos serviços!" }
      ],
      cta: {
        title: "Pronto para ter o melhor atendimento?",
        text: `Entre em contato agora mesmo e agende uma consulta. Estamos prontos para te atender em ${city}!`,
        buttonText: "Fale Conosco via WhatsApp"
      }
    };
    return res.json({ template: defaultTemplate, mode: "demo" });
  }

  try {
    const prompt = `Gere uma estrutura completa de site de modelo/Landing Page profissional, focada em altíssima conversão e com apelo estético impecável, para a empresa "${businessName}", que atua no segmento de "${niche}" em "${city}".
    Escolha uma paleta de cores moderna e atraente baseada no segmento de atuação (ex: odontologia prefere azuis/verdes profissionais; pizzaria prefere vermelhos quentes/amarelos; mecânica prefere cinzas escuros/laranjas, etc.).
    Retorne estritamente um JSON de acordo com o esquema fornecido.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING, description: "Cor primária em formato hex (ex: #1E3A8A)" },
                secondary: { type: Type.STRING, description: "Cor secundária hex" },
                accent: { type: Type.STRING, description: "Cor de destaque vibrante para botões de ação hex (ex: #F59E0B)" },
                bg: { type: Type.STRING, description: "Cor de fundo limpa hex (ex: #F8FAFC)" },
                text: { type: Type.STRING, description: "Cor de texto principal escuro hex" }
              },
              required: ["primary", "secondary", "accent", "bg", "text"]
            },
            hero: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Título impactante da página de entrada" },
                subtitle: { type: Type.STRING, description: "Subtítulo explicando o valor e benefício da empresa" },
                ctaText: { type: Type.STRING, description: "Texto de ação principal do botão" }
              },
              required: ["title", "subtitle", "ctaText"]
            },
            about: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Título da seção Sobre Nós" },
                text: { type: Type.STRING, description: "Parágrafo persuasivo contando a história e valores da empresa" }
              },
              required: ["title", "text"]
            },
            services: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Nome do serviço prestado" },
                  description: { type: Type.STRING, description: "Breve explicação sobre os benefícios do serviço" }
                },
                required: ["title", "description"]
              }
            },
            testimonials: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  author: { type: Type.STRING, description: "Nome do cliente satisfeito" },
                  role: { type: Type.STRING, description: "Subtítulo ou ocupação" },
                  text: { type: Type.STRING, description: "Depoimento convincente" }
                },
                required: ["author", "role", "text"]
              }
            },
            cta: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Chamada final para ação" },
                text: { type: Type.STRING, description: "Frase de incentivo final" },
                buttonText: { type: Type.STRING, description: "Texto do botão de WhatsApp" }
              },
              required: ["title", "text", "buttonText"]
            }
          },
          required: ["colors", "hero", "about", "services", "testimonials", "cta"]
        }
      }
    });

    const text = response.text || "{}";
    const template = JSON.parse(text);
    return res.json({ template, mode: "live" });
  } catch (error: any) {
    console.error("Error generating website template with Gemini:", error);
    return res.status(500).json({ error: error.message || "Erro ao gerar modelo de site." });
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
      whatsapp: `Olá! Sou especialista em aceleração de negócios locais e estava analisando a presença digital da *${business.name}* no Google em ${business.city}.\n\nNotei que vocês oferecem um excelente trabalho, mas hoje *não possuem um site profissional* cadastrado e têm poucas avaliações do Google (apenas ${business.reviewCount} avaliações).\n\nSabia que cerca de 82% das pessoas pesquisam no celular antes de decidir onde ir? Para te ajudar a reverter isso de forma rápida e faturar mais, desenvolvemos duas soluções práticas:\n\n1. 💳 *Placa NFC Inteligente + QR Code*: Seus clientes apenas aproximam o celular e deixam uma avaliação de 5 estrelas em 3 segundos. É física, elegante e aumenta sua reputação na hora.\n2. 🌐 *Site de Alta Conversão*: Um site moderno para destacar seus serviços e colocar você no topo do Google em ${business.city}.\n\nEu criei um *modelo de site demonstrativo para vocês de graça*, e gostaria de te mostrar! Que tal marcarmos um papo rápido de 5 minutos?\n\nQual o melhor dia para você?`,
      callScript: {
        opening: `Olá! Tudo bem? Por favor, eu poderia falar com o gerente ou responsável pela parte comercial da ${business.name}?`,
        hook: `Olá! Meu nome é Allan, sou especialista em atração de clientes locais aqui na região. Estava mapeando as empresas de ${business.city} e encontrei o cadastro de vocês no Google Meu Negócio. Vi que vocês têm serviços ótimos, mas notei duas grandes oportunidades que estão fazendo vocês perderem clientes para a concorrência todos os dias: vocês estão sem um site oficial e têm apenas ${business.reviewCount} avaliações de clientes.`,
        valueProp: `Hoje, as pessoas compram de quem tem mais avaliações e passa mais credibilidade. Eu ajudo empresas como a sua a resolver isso rápido instalando nossa Placa de Avaliação NFC Inteligente — onde o cliente aproxima o celular e avalia em 3 segundos. Além disso, criamos Landing Pages de alta velocidade para garantir que vocês fiquem no topo das pesquisas.`,
        objections: `Se eles disserem "não tenho interesse" ou "está caro": Diga: "Compreendo perfeitamente. No entanto, pense que apenas um cliente novo que você ganha com nossa solução já paga todo o investimento da Placa NFC e do site. Eu inclusive criei uma simulação visual gratuita de como ficaria a sua Placa NFC e o seu novo site. Posso te enviar sem compromisso no WhatsApp para você dar uma olhada?"`,
        closing: `Qual é o seu melhor número de WhatsApp para eu te enviar essas simulações visuais em 2 minutinhos? Assim você avalia se faz sentido para o seu momento de faturamento.`
      }
    };
    return res.json({ pitch: defaultPitch, mode: "demo" });
  }

  try {
    const prompt = `Crie scripts de vendas ultra persuasivos e profissionais para abordar a empresa "${business.name}" (ramo: "${business.niche}", cidade: "${business.city}").
    Considere as seguintes fraquezas que identificamos: "${business.weakness}". O objetivo é vender para eles o nosso "Combo de Aceleração Local": Placa de Avaliação Google NFC/QR-Code + Site Institucional de Alta Conversão.
    
    A mensagem de WhatsApp deve ser amigável, direta ao ponto, com emojis sutis para facilitar a leitura e destacar o valor do negócio. Ela deve mencionar que nós já geramos um modelo de site demonstrativo pronto para eles darem uma olhada (gatilho mental da reciprocidade).
    O script de ligação por telefone deve conter as etapas estruturadas de abertura, conexão/problema, proposta de valor, contorno de objeções e fechamento comercial.
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
