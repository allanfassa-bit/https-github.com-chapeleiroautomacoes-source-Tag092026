import express from 'express';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, setDoc, updateDoc, increment } from 'firebase/firestore';

// Inlined or imported configuration
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0330090716',
  appId: '1:831777299961:web:1078a94d7287c4e044b128',
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyABnDNnARpH-z3EkexT9TgKVQY5UKa6sVg',
  authDomain: 'gen-lang-client-0330090716.firebaseapp.com',
  firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || 'ai-studio-alfautomaogmbsal-702a33aa-2f38-4afe-9ac9-5641b8c276cd',
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Reuse or initialize Firebase client
const fbApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId);

// In-memory cache for ultra-fast Vercel serverless warm execution
const cache = new Map<string, any>();

// Known hardcoded aliases for printed physical plates
const PHYSICAL_ALIASES: Record<string, string> = {
  'bellariobrancomesas': 'https://search.google.com/local/writereview?placeid=ChIJTTKzQz_Xv5QRjyhnE6zQpyI',
  'bellariobranco': 'https://search.google.com/local/writereview?placeid=ChIJTTKzQz_Xv5QRjyhnE6zQpyI',
  'padariabellariobranco': 'https://search.google.com/local/writereview?placeid=ChIJTTKzQz_Xv5QRjyhnE6zQpyI',
  'bella': 'https://search.google.com/local/writereview?placeid=ChIJTTKzQz_Xv5QRjyhnE6zQpyI',
  'empre08': 'https://search.google.com/local/writereview?placeid=ChIJx2ytYDXXv5QRQzIXgn7RRrc',
  'empresa08': 'https://search.google.com/local/writereview?placeid=ChIJx2ytYDXXv5QRQzIXgn7RRrc',
  'emp08': 'https://search.google.com/local/writereview?placeid=ChIJx2ytYDXXv5QRQzIXgn7RRrc',
  'suica': 'https://search.google.com/local/writereview?placeid=ChIJx2ytYDXXv5QRQzIXgn7RRrc',
  'padariasuica': 'https://search.google.com/local/writereview?placeid=ChIJx2ytYDXXv5QRQzIXgn7RRrc',
  'empresa04': 'https://search.google.com/local/writereview?placeid=ChIJCyHYx7zXv5QRn264H27HvhY',
  'cbcell': 'https://search.google.com/local/writereview?placeid=ChIJCyHYx7zXv5QRn264H27HvhY',
  'assadosdojapa': 'https://www.google.com/search?q=ASSADOS+DO+JAPA#lrd=0x0:0x0,3',
  'danipontello': 'https://www.google.com/search?q=Dani%20pontello#lrd=0x0:0x0,3',
  'empresa06': 'https://search.google.com/local/writereview?placeid=ChIJTTKzQz_Xv5QRjyhnE6zQpyI'
};

function resolveCandidates(cleanId: string): string[] {
  const lower = cleanId.toLowerCase();
  const candidates: string[] = [cleanId];

  // Number extraction (e.g. 08, 8 -> empresa08, empre08)
  const numMatch = lower.match(/\d+/);
  if (numMatch) {
    const numStr = numMatch[0];
    const padded = numStr.padStart(2, '0');
    const unpadded = String(parseInt(numStr, 10));
    const prefixes = ['empresa', 'empre', 'emoresa', 'empresa_', 'empre_', 'emoresa_', 'lead_'];
    for (const p of prefixes) {
      const c1 = `${p}${padded}`;
      const c2 = `${p}${unpadded}`;
      if (!candidates.includes(c1)) candidates.push(c1);
      if (!candidates.includes(c2)) candidates.push(c2);
    }
  }

  if (lower.includes('bella') || lower.includes('mesa') || lower.includes('rio')) {
    if (!candidates.includes('bellariobrancomesas')) candidates.unshift('bellariobrancomesas');
  }

  if (lower.includes('suica') || lower.includes('padaria') || lower.includes('08')) {
    if (!candidates.includes('empre08')) candidates.unshift('empre08');
    if (!candidates.includes('empresa08')) candidates.unshift('empresa08');
  }

  if (lower.includes('cbcell') || lower.includes('cell')) {
    if (!candidates.includes('empresa04')) candidates.unshift('empresa04');
    if (!candidates.includes('cbcell')) candidates.unshift('cbcell');
  }

  if (lower.startsWith('empresa')) {
    const alt = lower.replace('empresa', 'empre');
    if (!candidates.includes(alt)) candidates.push(alt);
  } else if (lower.startsWith('empre')) {
    const alt = lower.replace('empre', 'empresa');
    if (!candidates.includes(alt)) candidates.push(alt);
  }

  return candidates;
}

async function findLeadData(cleanId: string): Promise<{ leadId: string; data: any } | null> {
  const lower = cleanId.toLowerCase();
  if (cache.has(lower)) {
    return cache.get(lower);
  }

  const candidates = resolveCandidates(cleanId);
  for (const cand of candidates) {
    if (cache.has(cand.toLowerCase())) {
      return cache.get(cand.toLowerCase());
    }
  }

  // Direct Firestore doc lookup
  for (const cand of candidates) {
    try {
      const snap = await getDoc(doc(db, 'leads', cand));
      if (snap.exists()) {
        const result = { leadId: cand, data: snap.data() };
        cache.set(cand.toLowerCase(), result);
        cache.set(lower, result);
        return result;
      }
    } catch (_) {}
  }

  // Fallback: search collection
  try {
    const snap = await getDocs(collection(db, 'leads'));
    for (const d of snap.docs) {
      const did = d.id.toLowerCase();
      const dclean = did.replace(/[^a-z0-9]/g, '');
      const searchClean = lower.replace(/[^a-z0-9]/g, '');
      if (did === lower || dclean === searchClean || candidates.map(c => c.toLowerCase()).includes(did)) {
        const result = { leadId: d.id, data: d.data() };
        cache.set(lower, result);
        cache.set(did, result);
        return result;
      }
    }
  } catch (_) {}

  return null;
}

function computeTargetUrl(leadResult: { leadId: string; data: any } | null, cleanId: string, channel?: string): string {
  const lower = cleanId.toLowerCase();
  
  // 1. Direct hardcoded alias check
  if (PHYSICAL_ALIASES[lower]) {
    return PHYSICAL_ALIASES[lower];
  }
  for (const [key, url] of Object.entries(PHYSICAL_ALIASES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return url;
    }
  }

  if (leadResult?.data) {
    const data = leadResult.data;
    const reqChannel = channel?.toLowerCase();

    if (reqChannel === 'instagram' || reqChannel === 'insta') {
      const insta = data.nfcInstagramUrl || data.instagramUrl;
      if (insta) return insta.startsWith('http') ? insta : `https://instagram.com/${insta.replace(/^@/, '')}`;
    }

    if (reqChannel === 'whatsapp' || reqChannel === 'zap') {
      const num = data.nfcWhatsappNum;
      if (num) return num.startsWith('http') ? num : `https://wa.me/${num.replace(/\D/g, '')}`;
    }

    // Google review / GMB URL
    if (data.googleMapsUrl && (data.googleMapsUrl.includes('placeid=') || data.googleMapsUrl.includes('writereview') || data.googleMapsUrl.includes('ChIJ'))) {
      return data.googleMapsUrl;
    }

    if (data.nfcCustomUrl && data.nfcCustomUrl.startsWith('http')) {
      return data.nfcCustomUrl;
    }

    if (data.googleMapsUrl && data.googleMapsUrl.startsWith('http')) {
      return data.googleMapsUrl;
    }

    if (data.name && data.name !== '.' && data.name !== 'Estabelecimento') {
      return `https://www.google.com/search?q=${encodeURIComponent(data.name)}#lrd=0x0:0x0,3`;
    }
  }

  // Universal ultimate fallback: Google 5-star review search
  const cleanName = cleanId.replace(/[_\-]/g, ' ');
  return `https://www.google.com/search?q=${encodeURIComponent(cleanName)}#lrd=0x0:0x0,3`;
}

// Redirect controller for /r/:id, /qr/:id, /redirect/:id, etc.
const handleRedirect = async (req: express.Request, res: express.Response) => {
  const rawId = String(req.params.leadId || req.params.id || '').trim();
  const cleanId = decodeURIComponent(rawId).replace(/[^a-zA-Z0-9_\-]/g, '');

  if (!cleanId) {
    return res.redirect(302, '/');
  }

  const channel = req.params.channel ? String(req.params.channel) : (req.query.channel || req.query.to || req.query.dest) ? String(req.query.channel || req.query.to || req.query.dest) : undefined;

  let leadResult: { leadId: string; data: any } | null = null;
  try {
    leadResult = await findLeadData(cleanId);
  } catch (_) {}

  // Check billing suspension
  if (leadResult?.data?.nfcBillingStatus === 'suspended') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(403).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head><meta charset="utf-8"><title>Acesso Suspenso</title></head>
      <body style="background:#020617;color:#fff;font-family:sans-serif;text-align:center;padding:40px;">
        <h2>Acesso Temporariamente Suspenso</h2>
        <p>Entre em contato com o suporte para reativar.</p>
      </body>
      </html>
    `);
  }

  const targetUrl = computeTargetUrl(leadResult, cleanId, channel);

  // Instant HTTP 302 Redirect with bulletproof HTML fallback
  res.status(302);
  res.setHeader('Location', targetUrl);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=${targetUrl}">
  <title>Avaliação Google</title>
  <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
</head>
<body style="background:#020617;color:#e2e8f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:20px;">
  <div>
    <div style="font-size:32px;margin-bottom:12px;">⭐</div>
    <div style="font-weight:bold;font-size:16px;color:#fff;">Redirecionando para avaliação no Google...</div>
    <div style="margin-top:16px;">
      <a href="${targetUrl}" style="display:inline-block;padding:10px 20px;background:#059669;color:#fff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:bold;">Abrir Avaliação Agora</a>
    </div>
  </div>
</body>
</html>`);
};

// Mount redirect routes
app.get(['/r/:leadId', '/r/:leadId/:channel', '/qr/:leadId', '/redirect/:leadId', '/p/:leadId', '/nfc/:leadId', '/tag/:leadId', '/l/:leadId'], handleRedirect);

// Fast JSON API for clients
app.get(['/api/resolve-redirect/:leadId', '/api/resolve-redirect/r/:leadId'], async (req, res) => {
  const rawId = String(req.params.leadId || '').trim();
  const cleanId = decodeURIComponent(rawId).replace(/[^a-zA-Z0-9_\-]/g, '');
  const channel = (req.query.channel || req.query.to) ? String(req.query.channel || req.query.to) : undefined;

  let leadResult: { leadId: string; data: any } | null = null;
  try {
    leadResult = await findLeadData(cleanId);
  } catch (_) {}

  const targetUrl = computeTargetUrl(leadResult, cleanId, channel);
  res.setHeader('Cache-Control', 'no-store, no-cache');
  return res.json({
    success: true,
    leadId: cleanId,
    targetUrl,
    businessName: leadResult?.data?.name || cleanId
  });
});

// Quick plate bind endpoint
app.post('/api/quick-bind-plate', async (req, res) => {
  try {
    const { leadId, name, googleMapsUrl } = req.body;
    const cleanId = String(leadId || '').replace(/[^a-zA-Z0-9_\-]/g, '');
    if (!cleanId) return res.status(400).send('ID inválido');

    await setDoc(doc(db, 'leads', cleanId), {
      id: cleanId,
      name: name || 'Estabelecimento',
      googleMapsUrl: googleMapsUrl || '',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    cache.delete(cleanId.toLowerCase());
    return res.redirect(302, `/r/${cleanId}`);
  } catch (err) {
    return res.status(500).send('Erro ao salvar placa');
  }
});

// Health check
app.get(['/health', '/api/health', '/ping'], (req, res) => {
  res.status(200).json({ status: 'ok', serverless: true, timestamp: new Date().toISOString() });
});

// Default catch-all for /api
app.all('*', (req, res) => {
  if (req.path.startsWith('/r/')) {
    (req.params as any).leadId = req.path.replace(/^\/r\//, '');
    return handleRedirect(req, res);
  }
  return res.status(404).json({ error: 'Route not found in API' });
});

export default app;
