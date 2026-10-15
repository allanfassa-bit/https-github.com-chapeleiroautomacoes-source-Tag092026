import React, { useState, useEffect } from 'react';
import {
  Search,
  Link,
  Star,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  HelpCircle,
  Sparkles,
  MapPin,
  Building,
  Check
} from 'lucide-react';

interface GoogleReviewLinkGeneratorProps {
  initialQuery?: string;
  initialCity?: string;
  onLinkGenerated: (url: string) => void;
  currentUrl?: string;
  compact?: boolean;
}

export const GoogleReviewLinkGenerator: React.FC<GoogleReviewLinkGeneratorProps> = ({
  initialQuery = '',
  initialCity = '',
  onLinkGenerated,
  currentUrl = '',
  compact = false
}) => {
  const [mode, setMode] = useState<'parse' | 'search'>('parse');
  const [pasteUrl, setPasteUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchCity, setSearchCity] = useState(initialCity);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    placeId: string;
    businessName?: string;
    reviewUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
    if (initialCity) setSearchCity(initialCity);
  }, [initialQuery, initialCity]);

  // Frontend parsing of Place ID
  const parsePlaceIdFromUrl = (urlStr: string): string | null => {
    try {
      const url = urlStr.trim();

      // 1. Direct PlaceID query param check
      const queryParams = ['placeid', 'place_id', 'fid', 'cid'];
      for (const param of queryParams) {
        const regex = new RegExp(`[?&]${param}=([^&#]+)`, 'i');
        const match = url.match(regex);
        if (match) {
          // If it's a CID or other type, we'll try to use it directly, but placeid is preferred
          return decodeURIComponent(match[1]);
        }
      }

      // 2. Format g.page/r/[placeid]/review or maps/place/...
      const gPageRegex = /g\.page\/r\/([a-zA-Z0-9_\-]+)/i;
      const gPageMatch = url.match(gPageRegex);
      if (gPageMatch) {
        return gPageMatch[1];
      }

      // 3. Format google.com/local/writereview?placeid=[placeid]
      const localWriteRegex = /writereview\?placeid=([a-zA-Z0-9_\-]+)/i;
      const localWriteMatch = url.match(localWriteRegex);
      if (localWriteMatch) {
        return localWriteMatch[1];
      }

      // 4. Raw PlaceID check (e.g. ChIJ7WWYAF_Xv5QRVTfJnVWBFKw is 27 chars, starting with ChI)
      const rawPlaceIdRegex = /^(ChI[a-zA-Z0-9_\-]{24})$/i;
      const rawMatch = url.match(rawPlaceIdRegex);
      if (rawMatch) {
        return rawMatch[0];
      }

      return null;
    } catch (_) {
      return null;
    }
  };

  const handleParse = async () => {
    setError(null);
    setResult(null);
    setApplied(false);

    const trimmedUrl = pasteUrl.trim();
    if (!trimmedUrl) {
      setError('Por favor, informe um link do Google Maps ou um Place ID.');
      return;
    }

    // Try direct synchronous parsing
    const extractedId = parsePlaceIdFromUrl(trimmedUrl);
    if (extractedId) {
      const generatedUrl = `https://search.google.com/local/writereview?placeid=${extractedId}`;
      setResult({
        placeId: extractedId,
        reviewUrl: generatedUrl
      });
      return;
    }

    // If it's a shortened link (maps.app.goo.gl or g.co), we need the backend to follow the redirect
    if (trimmedUrl.includes('maps.app.goo.gl') || trimmedUrl.includes('g.co') || trimmedUrl.includes('maps.google.com') || trimmedUrl.includes('google.com/maps') || trimmedUrl.includes('share.google')) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/resolve-google-maps-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmedUrl })
        });

        if (!response.ok) {
          throw new Error('Falha ao resolver o link curto.');
        }

        const data = await response.json();
        if (data.success && data.resolvedUrl) {
          const secondExtractedId = parsePlaceIdFromUrl(data.resolvedUrl);
          if (secondExtractedId) {
            setResult({
              placeId: secondExtractedId,
              reviewUrl: `https://search.google.com/local/writereview?placeid=${secondExtractedId}`
            });
          } else {
            // Try to extract business name to search for Place ID automatically
            let extractedName = '';
            try {
              const rawDecoded = decodeURIComponent(data.resolvedUrl);
              const qMatch = rawDecoded.match(/[?&]q=([^&]+)/i);
              if (qMatch) {
                extractedName = qMatch[1].replace(/\+/g, ' ').trim();
              } else {
                const placeMatch = rawDecoded.match(/maps\/place\/([^/]+)/i);
                if (placeMatch) {
                  extractedName = placeMatch[1].replace(/\+/g, ' ').trim();
                }
              }
            } catch (_) {}

            const fallbackQuery = extractedName || initialQuery || '';
            if (fallbackQuery) {
              try {
                const searchRes = await fetch('/api/search-place-id', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    query: fallbackQuery,
                    city: initialCity || ''
                  })
                });
                const searchData = await searchRes.json();
                if (searchRes.ok && searchData.success) {
                  setResult({
                    placeId: searchData.placeId,
                    businessName: searchData.businessName,
                    reviewUrl: searchData.reviewUrl
                  });
                  return;
                }
              } catch (_) {}
            }
            setError('Não conseguimos extrair o Place ID direto do link resolvido. Tente buscar pelo Nome da Empresa.');
          }
        } else {
          setError('Não foi possível resolver este link encurtado.');
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao conectar no servidor de resolução.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Link do Google Maps inválido ou não reconhecido. Certifique-se de que é um link válido ou use a Busca por Nome.');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Por favor, digite o nome do estabelecimento.');
      return;
    }

    setError(null);
    setResult(null);
    setIsLoading(true);
    setApplied(false);

    try {
      const response = await fetch('/api/search-place-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          city: searchCity.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResult({
          placeId: data.placeId,
          businessName: data.businessName,
          reviewUrl: data.reviewUrl
        });
      } else {
        setError(data.error || 'Nenhum estabelecimento encontrado. Verifique a ortografia ou tente colar o link.');
      }
    } catch (err: any) {
      setError('Erro ao pesquisar estabelecimento na nuvem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onLinkGenerated(result.reviewUrl);
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
    }
  };

  const handleCopy = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result.reviewUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (_) {}
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 text-white rounded-2xl ${compact ? 'p-3.5 space-y-3' : 'p-5 space-y-4'} shadow-lg relative overflow-hidden`}>
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Star className="w-24 h-24 text-amber-400 fill-amber-400" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400">
            <Star className="w-4 h-4 fill-amber-400/20" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">Gerador de Link de Avaliação Direto</h4>
            <p className="text-[10px] text-slate-400">Padrão Google Writereview Place ID</p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => { setMode('parse'); setError(null); setResult(null); }}
            className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
              mode === 'parse' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Extrair Link/ID
          </button>
          <button
            type="button"
            onClick={() => { setMode('search'); setError(null); setResult(null); }}
            className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
              mode === 'search' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Buscar por Nome
          </button>
        </div>
      </div>

      {mode === 'parse' ? (
        <div className="space-y-2">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cole o link do Google Maps ou Place ID:</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={pasteUrl}
                onChange={(e) => setPasteUrl(e.target.value)}
                placeholder="Cole o link curto maps.app.goo.gl ou Place ID"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:border-amber-500 focus:outline-hidden transition-all text-slate-200"
              />
            </div>
            <button
              type="button"
              onClick={handleParse}
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Analisar'}
            </button>
          </div>
          <p className="text-[9px] text-slate-500 leading-normal">
            Suporta links encurtados, links do Google Maps completo com cid/placeid, links compartilhados do GMB ou o próprio código do Place ID (ex: <code className="font-mono text-amber-300">ChIJ7WWYAF...</code>).
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Nome da Empresa</label>
              <div className="relative">
                <Building className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex: Sorriso Perfeito"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs font-medium focus:border-amber-500 focus:outline-hidden transition-all text-slate-200"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cidade / Região</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs font-medium focus:border-amber-500 focus:outline-hidden transition-all text-slate-200"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Buscando Place ID na Nuvem Google...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                <span>Consultar Local & Gerar Link de Avaliação</span>
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-[10px] font-semibold flex items-start gap-1.5 leading-normal">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-200 text-left">
          <div className="flex items-start justify-between border-b border-slate-800/80 pb-2">
            <div className="space-y-0.5">
              <span className="text-[8px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">✓ Sucesso</span>
              {result.businessName && (
                <h5 className="text-xs font-black text-slate-200 mt-1">{result.businessName}</h5>
              )}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="font-mono bg-slate-900 border border-slate-800/80 px-1.5 py-0.5 rounded text-amber-300">
                  PlaceID: {result.placeId}
                </span>
              </div>
            </div>
            
            <a
              href={result.reviewUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              title="Testar link em nova aba"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-1">
            <span className="block text-[9px] uppercase font-bold text-slate-400">Link Direto Formatado de Avaliação:</span>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800/60 p-2 rounded-lg font-mono text-[10px] text-sky-300 break-all select-all">
              {result.reviewUrl}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold border border-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleApply}
              className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer ${
                applied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {applied ? <CheckCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              <span>{applied ? 'Aplicado!' : 'Vincular no Cadastro'}</span>
            </button>
          </div>
        </div>
      )}

      {currentUrl && !result && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 border border-slate-850 p-2 rounded-xl">
          <span className="truncate">Link atual: <strong className="font-mono text-[10px] text-slate-300">{currentUrl}</strong></span>
          <a href={currentUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-0.5 shrink-0 ml-1">
            Testar
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      )}
    </div>
  );
};
