import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Sparkles,
  QrCode,
  CreditCard,
  Layers,
  CheckCircle,
  RefreshCw,
  FolderArchive,
  Eye,
  FileCheck,
  ShieldCheck,
  Check,
  Printer,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Lead } from '../App';
import {
  ArtworkTheme,
  generatePlate10x10DataUrl,
  generateCardNfcDataUrl,
  downloadPlate10x10Png,
  downloadCardNfcPng,
  downloadCompleteArtworkKitZip
} from '../utils/nfcPlateGenerator';
import { getDynamicQrUrl, getDirectLeadUrl } from '../utils/publicUrlHelper';
import { getPlateIdentification } from '../utils/plateNumberHelper';
import { openHighDefinitionPrintWindow } from '../utils/platePrintHelper';

interface NfcArtworkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  leads?: Lead[];
  onSelectDifferentLead?: (lead: Lead) => void;
  initialTheme?: ArtworkTheme;
  onMarkPrinted?: (leadId: string, currentStatus?: boolean) => void;
  onPrintPlate?: (lead?: Lead, theme?: ArtworkTheme, format?: 'plate-10x10' | 'plate-15x15' | 'a4-duo' | 'card-cr80') => void;
}

export function NfcArtworkDownloadModal({
  isOpen,
  onClose,
  lead,
  leads = [],
  onSelectDifferentLead,
  initialTheme = 'emerald_green',
  onMarkPrinted,
  onPrintPlate
}: NfcArtworkDownloadModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'plate_10x10' | 'card_horizontal' | 'card_vertical'>('plate_10x10');
  const [selectedTheme, setSelectedTheme] = useState<ArtworkTheme>(initialTheme);
  const [customInstaUrl, setCustomInstaUrl] = useState<string>('');
  const [customGoogleUrl, setCustomGoogleUrl] = useState<string>('');
  const [customTiktokUrl, setCustomTiktokUrl] = useState<string>('');
  const [socialNetworkType, setSocialNetworkType] = useState<'instagram' | 'tiktok'>('instagram');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [autoMarkPrinted, setAutoMarkPrinted] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Active lead being customized
  const currentLead = lead || leads[0];
  const plateInfo = getPlateIdentification(currentLead?.id, currentLead?.name);

  // Sync custom inputs when currentLead changes
  useEffect(() => {
    if (currentLead?.nfcInstagramUrl) {
      setCustomInstaUrl(currentLead.nfcInstagramUrl);
    }
    if (currentLead?.googleMapsUrl || currentLead?.nfcCustomUrl) {
      setCustomGoogleUrl(currentLead.googleMapsUrl || currentLead.nfcCustomUrl || '');
    }
    if ((currentLead as any)?.nfcTiktokUrl || (currentLead as any)?.tiktokUrl) {
      setCustomTiktokUrl((currentLead as any)?.nfcTiktokUrl || (currentLead as any)?.tiktokUrl || '');
    }
  }, [currentLead?.id, currentLead?.nfcInstagramUrl, currentLead?.googleMapsUrl, currentLead?.nfcCustomUrl]);

  // Choice between dynamic cloud link (changes anytime via system) vs direct destination
  const [qrTargetMode, setQrTargetMode] = useState<'direct' | 'dynamic'>('dynamic');

  const effectiveInstaUrl = customInstaUrl.trim() || currentLead?.nfcInstagramUrl || '';
  const effectiveInstaHandle = effectiveInstaUrl
    ? effectiveInstaUrl.replace(/.*instagram\.com\//, '').replace(/^@/, '').replace(/\/$/, '')
    : (currentLead?.name ? currentLead.name.replace(/\s+/g, '').toLowerCase() : 'seuperfil');

  const permanentUrl = currentLead
    ? (qrTargetMode === 'direct'
        ? (selectedTheme === 'instagram_official' && effectiveInstaUrl
            ? (effectiveInstaUrl.startsWith('http') ? effectiveInstaUrl : `https://instagram.com/${effectiveInstaUrl.replace(/^@/, '')}`)
            : getDirectLeadUrl(currentLead))
        : getDynamicQrUrl(currentLead.id))
    : (qrTargetMode === 'direct' ? 'https://maps.google.com' : getDynamicQrUrl('demo'));

  // Sync theme if initialTheme changes or lead has instagram configured
  useEffect(() => {
    if (initialTheme && initialTheme !== 'emerald_green') {
      setSelectedTheme(initialTheme);
    } else if (currentLead?.nfcRedirectActive === 'instagram' || (currentLead?.nfcInstagramUrl && currentLead.nfcInstagramUrl.length > 0)) {
      setSelectedTheme('instagram_official');
    } else if (initialTheme) {
      setSelectedTheme(initialTheme);
    }
  }, [initialTheme, isOpen, currentLead]);

  // Generate preview whenever format, theme, lead, or qrTargetMode changes
  useEffect(() => {
    if (!isOpen || !currentLead) return;

    let isMounted = true;
    setIsLoadingPreview(true);

    const generatePreview = async () => {
      try {
        const options = {
          businessName: currentLead.name || 'Empresa Exemplo',
          leadId: currentLead.id || 'TAG01',
          permanentUrl,
          googleUrl: customGoogleUrl.trim() || undefined,
          instagramUrl: effectiveInstaUrl,
          instagramHandle: effectiveInstaHandle,
          tiktokUrl: customTiktokUrl.trim() || undefined,
          socialNetworkType,
          qrTargetMode,
          theme: selectedTheme,
          city: currentLead.city || '',
          resolution: '4k' as const
        };

        let dataUrl = '';
        if (selectedFormat === 'plate_10x10') {
          dataUrl = await generatePlate10x10DataUrl(options);
        } else if (selectedFormat === 'card_horizontal') {
          dataUrl = await generateCardNfcDataUrl(options, 'horizontal');
        } else {
          dataUrl = await generateCardNfcDataUrl(options, 'vertical');
        }

        if (isMounted) {
          setPreviewDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Erro ao gerar preview de arte:', err);
      } finally {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      }
    };

    generatePreview();

    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    currentLead?.id,
    currentLead?.name,
    selectedFormat,
    selectedTheme,
    permanentUrl,
    qrTargetMode,
    effectiveInstaUrl,
    customGoogleUrl,
    customTiktokUrl,
    socialNetworkType
  ]);

  if (!isOpen || !currentLead) return null;

  const handleDownloadSingle = async () => {
    try {
      setIsDownloading(true);
      const options = {
        businessName: currentLead.name || 'Empresa Exemplo',
        leadId: currentLead.id || 'TAG01',
        permanentUrl,
        googleUrl: customGoogleUrl.trim() || undefined,
        instagramUrl: effectiveInstaUrl,
        instagramHandle: effectiveInstaHandle,
        tiktokUrl: customTiktokUrl.trim() || undefined,
        socialNetworkType,
        qrTargetMode,
        theme: selectedTheme,
        city: currentLead.city || '',
        resolution: '4k' as const
      };

      if (selectedFormat === 'plate_10x10') {
        await downloadPlate10x10Png(options);
        setDownloadSuccessMsg('Placa 10x10cm baixada em altíssima definição (600 DPI Ultra-HD)!');
      } else if (selectedFormat === 'card_horizontal') {
        await downloadCardNfcPng(options, 'horizontal');
        setDownloadSuccessMsg('Cartão NFC Horizontal baixado em altíssima definição (600 DPI Ultra-HD)!');
      } else {
        await downloadCardNfcPng(options, 'vertical');
        setDownloadSuccessMsg('Cartão NFC Vertical baixado em altíssima definição (600 DPI Ultra-HD)!');
      }

      if (autoMarkPrinted && currentLead?.id && onMarkPrinted && !currentLead.isPlaquePrinted) {
        onMarkPrinted(currentLead.id, false);
      }

      setTimeout(() => setDownloadSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Erro ao baixar arte:', err);
      alert('Falha ao processar download da imagem: ' + (err.message || 'Tente novamente'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadZipKit = async () => {
    try {
      setIsDownloading(true);
      const options = {
        businessName: currentLead.name || 'Empresa Exemplo',
        leadId: currentLead.id || 'TAG01',
        permanentUrl,
        theme: selectedTheme,
        city: currentLead.city || '',
        instagramUrl: effectiveInstaUrl,
        instagramHandle: effectiveInstaHandle,
        resolution: '4k' as const
      };

      await downloadCompleteArtworkKitZip(options);
      setDownloadSuccessMsg('Kit Completo de Artes (.ZIP) baixado com sucesso!');

      if (autoMarkPrinted && currentLead?.id && onMarkPrinted && !currentLead.isPlaquePrinted) {
        onMarkPrinted(currentLead.id, false);
      }

      setTimeout(() => setDownloadSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Erro ao baixar pacote ZIP:', err);
      alert('Falha ao gerar pacote ZIP: ' + (err.message || 'Tente novamente'));
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border-2 border-cyan-500/80 rounded-2xl shadow-2xl p-3 flex items-center gap-3 text-white animate-in slide-in-from-bottom-5 duration-200">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0 max-w-[180px] sm:max-w-xs">
          <p className="text-xs font-black truncate">Artes: {currentLead?.name || 'Cliente'}</p>
          <p className="text-[10px] text-cyan-300 font-mono truncate">ID: {currentLead?.id || ''}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Restaurar / Maximizar Central de Artes"
            aria-label="Restaurar Central de Artes"
          >
            <Maximize2 className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMinimized(false);
              onClose();
            }}
            className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Fechar"
            aria-label="Fechar Central de Artes"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-black text-white truncate">Central de Impressão &amp; Artes HD</h3>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase bg-cyan-950 text-cyan-400 px-1.5 sm:px-2 py-0.5 rounded-full border border-cyan-800 shrink-0">
                  600 DPI HD
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">
                Baixe a placa 10x10cm e o cartão NFC 5.4x8.5cm já com o QR Code dinâmico do cliente incorporado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Minimizar janela"
              aria-label="Minimizar"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Minimizar</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 hover:text-rose-100 border border-rose-500/30 rounded-xl font-black text-xs transition cursor-pointer active:scale-95 group"
              title="Fechar (Esc ou clique fora)"
              aria-label="Fechar"
            >
              <X className="w-4 h-4 text-rose-400 group-hover:rotate-90 transition-transform duration-200" />
              <span>Fechar</span>
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Left Column: Format, Theme & Lead Controls */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Lead Selector if multiple leads available */}
            {leads.length > 1 && onSelectDifferentLead && (
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                  Empresa / Estabelecimento Selecionado:
                </label>
                <select
                  value={currentLead.id}
                  onChange={(e) => {
                    const found = leads.find((l) => l.id === e.target.value);
                    if (found) onSelectDifferentLead(found);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} (ID: {l.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* QR Code Target Selector: Direct vs Dynamic Cloud */}
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-2.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tipo de Destino do QR Code:</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-normal">
                  {qrTargetMode === 'direct' ? '⚡ Direto (Sem intermediário)' : '🌐 Dinâmico na Nuvem'}
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQrTargetMode('direct')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    qrTargetMode === 'direct'
                      ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      ⚡ Link Direto
                    </span>
                    {qrTargetMode === 'direct' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    Grava o link final (Google 5★, Insta, etc.) direto no QR Code. Abre instantâneo no celular do cliente sem risco de tela de login!
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setQrTargetMode('dynamic')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    qrTargetMode === 'dynamic'
                      ? 'border-cyan-500 bg-cyan-950/40 text-white ring-1 ring-cyan-500'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-cyan-400 flex items-center gap-1">
                      🌐 QR Dinâmico
                    </span>
                    {qrTargetMode === 'dynamic' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    Grava o link curto público (/r/{currentLead.id}). Permite alterar o destino depois pelo painel sem precisar reimprimir a placa.
                  </p>
                </button>
              </div>

              <div className="text-[10px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono text-slate-300 break-all">
                <span className="text-slate-500 font-bold block mb-0.5 uppercase tracking-wider text-[9px]">URL impressa no QR Code:</span>
                {permanentUrl}
              </div>
            </div>

            {/* Format Selection (10x10 vs 5.4x8.5) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Escolha o Tamanho da Arte:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 10x10 cm */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('plate_10x10')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    selectedFormat === 'plate_10x10'
                      ? 'border-cyan-500 bg-cyan-950/40 text-white shadow-lg ring-1 ring-cyan-500'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black">Placa 10x10 cm</span>
                    {selectedFormat === 'plate_10x10' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <span className="text-[10px] block opacity-80">Quadrada • Balcão</span>
                  <span className="text-[9px] block text-cyan-300 font-mono mt-1">2400x2400px Ultra HD</span>
                </button>

                {/* 5.4 x 8.5 cm Horizontal */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('card_horizontal')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    selectedFormat === 'card_horizontal'
                      ? 'border-cyan-500 bg-cyan-950/40 text-white shadow-lg ring-1 ring-cyan-500'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black">Cartão 5.4x8.5</span>
                    {selectedFormat === 'card_horizontal' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <span className="text-[10px] block opacity-80">Horizontal • CR80</span>
                  <span className="text-[9px] block text-cyan-300 font-mono mt-1">2040x1296px Ultra HD</span>
                </button>

                {/* 5.4 x 8.5 cm Vertical */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('card_vertical')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    selectedFormat === 'card_vertical'
                      ? 'border-cyan-500 bg-cyan-950/40 text-white shadow-lg ring-1 ring-cyan-500'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black">Cartão Vertical</span>
                    {selectedFormat === 'card_vertical' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <span className="text-[10px] block opacity-80">Vertical • 5.4x8.5</span>
                  <span className="text-[9px] block text-cyan-300 font-mono mt-1">1296x2040px Ultra HD</span>
                </button>
              </div>
            </div>

            {/* Theme Selector - All identical themes from 3D Totem */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tema da Placa (Idêntico ao Totem 3D):</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'instagram_official', name: '📸 Instagram Oficial', desc: '100% Instagram com Logo Oficial HD, @perfil, QR e NFC', badge: 'DESTAQUE INSTAGRAM' },
                  { id: 'instagram_dual', name: '📸 Instagram + Google', desc: 'Modelo Real da Foto: Onda fluida, 2 QR Codes + 2 NFCs', badge: 'MOCKUP DA FOTO' },
                  { id: 'emerald_green', name: 'Verde Esmeralda', desc: 'Mockup Oficial Verde com fita esmeralda e ouro', badge: 'MOCKUP OFICIAL' },
                  { id: 'royal_blue', name: 'Azul Royal', desc: 'Mockup Oficial Azul com fita ciano e azul neon', badge: 'MOCKUP OFICIAL' },
                  { id: 'official_google', name: 'Preto Oficial', desc: 'Preto & Branco com onda Google colorida', badge: 'MOCKUP OFICIAL' },
                  { id: 'black_gold', name: 'Preto Piano & Ouro', desc: 'Preto nobre com detalhes 24K' },
                  { id: 'acrylic_crystal', name: 'Acrílico Cristal', desc: 'Vidro chanfrado branco clean' },
                  { id: 'cyber_neon', name: 'Cyber Neon LED', desc: 'Ciano elétrico com brilho LED' },
                  { id: 'rose_luxury', name: 'Rose Gold VIP', desc: 'Estética de luxo bronze rose' },
                  { id: 'gourmet_red', name: 'Veneza Gourmet', desc: 'Vinho nobre gastronômico' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setSelectedTheme(th.id as ArtworkTheme)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      selectedTheme === th.id
                        ? th.id === 'instagram_official' || th.id === 'instagram_dual'
                          ? 'border-pink-500 bg-gradient-to-br from-pink-950/60 to-purple-950/60 text-pink-300 font-bold shadow-md ring-1 ring-pink-500'
                          : 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold shadow-xs ring-1 ring-amber-400/50'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {th.badge && (
                      <span className={`text-[7.5px] uppercase font-black px-1 py-0.2 rounded border mb-1 inline-block ${
                        th.id === 'instagram_official'
                          ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {th.badge}
                      </span>
                    )}
                    <span className="text-xs block font-bold truncate">{th.name}</span>
                    <span className="text-[9px] block opacity-70 font-normal leading-tight mt-0.5">{th.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dual QR Code Routing Panel: Instagram + Google */}
            {selectedTheme === 'instagram_dual' && (
              <div className="bg-gradient-to-br from-purple-950/50 via-slate-900 to-blue-950/50 border border-purple-500/40 p-4 rounded-2xl space-y-3.5 shadow-xl animate-in fade-in">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔀</span>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        Roteamento de 2 QR Codes Distintos
                      </h4>
                      <p className="text-[10px] text-purple-300">Cada QR Code leva para um destino diferente na mesma arte</p>
                    </div>
                  </div>
                  <span className="text-[9.5px] font-extrabold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    2 Redes Independentes
                  </span>
                </div>

                {/* QR 1 (Top): Social Network (Instagram or TikTok) */}
                <div className="bg-slate-950/80 border border-pink-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-pink-300 uppercase tracking-wide flex items-center gap-1.5">
                      <span>📸 QR Code 1 (Superior):</span>
                      <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded font-mono">
                        {socialNetworkType === 'tiktok' ? 'TIKTOK' : 'INSTAGRAM'}
                      </span>
                    </label>
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSocialNetworkType('instagram')}
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded transition cursor-pointer ${
                          socialNetworkType === 'instagram' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Instagram
                      </button>
                      <button
                        type="button"
                        onClick={() => setSocialNetworkType('tiktok')}
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded transition cursor-pointer ${
                          socialNetworkType === 'tiktok' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        TikTok
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-pink-400 font-bold text-xs">@</span>
                      <input
                        type="text"
                        value={socialNetworkType === 'tiktok' ? customTiktokUrl : customInstaUrl}
                        onChange={(e) => {
                          if (socialNetworkType === 'tiktok') {
                            setCustomTiktokUrl(e.target.value);
                          } else {
                            setCustomInstaUrl(e.target.value);
                          }
                        }}
                        placeholder={socialNetworkType === 'tiktok' ? "perfil_tiktok ou https://tiktok.com/@perfil" : "perfil_insta ou https://instagram.com/perfil"}
                        className="w-full bg-slate-900 border border-pink-500/30 text-white rounded-lg pl-6 pr-3 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-pink-500"
                      />
                    </div>
                    <a
                      href={
                        socialNetworkType === 'tiktok'
                          ? (customTiktokUrl.startsWith('http') ? customTiktokUrl : `https://tiktok.com/@${customTiktokUrl.replace(/^@/, '')}`)
                          : (customInstaUrl.startsWith('http') ? customInstaUrl : `https://instagram.com/${customInstaUrl.replace(/^@/, '')}`)
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-pink-950/60 hover:bg-pink-900/60 border border-pink-500/40 text-pink-300 text-xs font-bold rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Testar destino do QR Code 1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Testar</span>
                    </a>
                  </div>

                  <div className="text-[9.5px] font-mono text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800 break-all">
                    <span className="text-pink-400 font-bold block mb-0.5 uppercase tracking-wider text-[8.5px]">
                      Destino do QR 1 gravado na arte:
                    </span>
                    {qrTargetMode === 'dynamic' ? getDynamicQrUrl(currentLead.id, socialNetworkType) : (socialNetworkType === 'tiktok' ? customTiktokUrl : customInstaUrl || `https://instagram.com/${effectiveInstaHandle}`)}
                  </div>
                </div>

                {/* QR 2 (Bottom): Google Reviews */}
                <div className="bg-slate-950/80 border border-blue-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
                      <span>⭐ QR Code 2 (Inferior):</span>
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">
                        GOOGLE AVALIAÇÕES 5★
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customGoogleUrl}
                      onChange={(e) => setCustomGoogleUrl(e.target.value)}
                      placeholder="Link do Google Maps ou perfil de avaliação..."
                      className="flex-1 bg-slate-900 border border-blue-500/30 text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-blue-500 font-mono"
                    />
                    <a
                      href={customGoogleUrl || getDirectLeadUrl(currentLead)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs font-bold rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Testar destino do QR Code 2"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Testar</span>
                    </a>
                  </div>

                  <div className="text-[9.5px] font-mono text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800 break-all">
                    <span className="text-blue-400 font-bold block mb-0.5 uppercase tracking-wider text-[8.5px]">
                      Destino do QR 2 gravado na arte:
                    </span>
                    {qrTargetMode === 'dynamic' ? getDynamicQrUrl(currentLead.id, 'google') : (customGoogleUrl || getDirectLeadUrl(currentLead))}
                  </div>
                </div>
              </div>
            )}

            {/* Instagram Configuration Box when 100% Instagram Theme is active */}
            {selectedTheme === 'instagram_official' && (
              <div className="bg-gradient-to-r from-pink-950/50 via-purple-950/40 to-slate-950/70 border border-pink-500/40 p-4 rounded-2xl space-y-2.5 shadow-xl animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📸 Perfil / Link do Instagram Oficial:</span>
                  </label>
                  <span className="text-[9.5px] font-extrabold text-amber-300 bg-pink-950/70 px-2 py-0.5 rounded-full border border-pink-500/30">
                    600 DPI • Vetor Ultra HD
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 font-bold text-xs">@</span>
                    <input
                      type="text"
                      value={customInstaUrl}
                      onChange={(e) => setCustomInstaUrl(e.target.value)}
                      placeholder="Ex: seu_perfil ou https://instagram.com/seu_perfil"
                      className="w-full bg-slate-900/90 border border-pink-500/40 text-white rounded-xl pl-7 pr-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-pink-500 placeholder:text-slate-500"
                    />
                  </div>
                  {customInstaUrl && (
                    <a
                      href={customInstaUrl.startsWith('http') ? customInstaUrl : `https://instagram.com/${customInstaUrl.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-pink-600/30 hover:bg-pink-600/50 text-pink-300 border border-pink-500/50 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                      title="Testar link no Instagram"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Testar</span>
                    </a>
                  )}
                </div>

                <p className="text-[10.5px] text-pink-200/80 leading-relaxed">
                  O QR Code e a aproximação NFC direcionam instantaneamente para este perfil. A arte gerada inclui o <strong>logo oficial do Instagram com efeito de reflexo vítreo e gradiente oficial Meta em altíssima definição</strong> para impressão em acrílico balcão ou corte a laser!
                </p>
              </div>
            )}

            {/* Technical Specifications Callout */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Link Permanente Gravado:</span>
                <span className="font-mono text-cyan-400 font-bold truncate max-w-[220px]">
                  {permanentUrl}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Identificador Físico no Adesivo:</span>
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span className="bg-slate-800 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border border-slate-700">
                    {plateInfo.roman ? `Nº ${plateInfo.roman} (#${plateInfo.numStr})` : `Nº ${plateInfo.numStr || '01'}`}
                  </span>
                  <span className="text-[10px] text-slate-400">(Canto inferior esquerdo)</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Resolução Gráfica de Impressão:</span>
                <span className="text-amber-300 font-extrabold flex items-center gap-1.5">
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-black border border-amber-400/30">4K ULTRA-HD</span>
                  4000 x 4000 px (600 DPI)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Fidelidade Visual:</span>
                <span className="text-emerald-400 font-bold">100% Idêntico ao Totem 3D Oficial</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadSingle}
                disabled={isDownloading || isLoadingPreview}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando Imagem Ultra HD...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>
                      Baixar Imagem Ultra HD (
                      {selectedFormat === 'plate_10x10'
                        ? 'Placa 10x10 cm • 2400x2400'
                        : selectedFormat === 'card_horizontal'
                        ? 'Cartão 5.4x8.5 cm • 2040x1296'
                        : 'Cartão Vertical • 1296x2040'}
                      )
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetFormat = selectedFormat === 'plate_10x10' ? 'plate-10x10' : 'card-cr80';
                  if (onPrintPlate) {
                    onPrintPlate(currentLead, selectedTheme, targetFormat);
                  } else {
                    openHighDefinitionPrintWindow({
                      lead: currentLead,
                      theme: selectedTheme,
                      format: targetFormat,
                      portalQrMode: qrTargetMode
                    });
                  }
                }}
                disabled={isDownloading || isLoadingPreview}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                title="Imprimir placa ou cartão em tamanho real milimétrico e 600 DPI Ultra-HD"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Imprimir Arte em Tamanho Real (4K • 600 DPI)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadZipKit}
                disabled={isDownloading || isLoadingPreview}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FolderArchive className="w-4 h-4 text-cyan-400" />
                <span>Baixar Kit Gráfica Completo (.ZIP com Placa + Cartões + Manual)</span>
              </button>

              {/* Toggle de Marcação de Impressão */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoMarkPrinted}
                    onChange={(e) => setAutoMarkPrinted(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-cyan-400 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="font-medium text-[11px]">Marcar placa como <strong className="text-emerald-400">"Já Impressa"</strong> ao baixar</span>
                </label>

                {currentLead && onMarkPrinted && (
                  <button
                    type="button"
                    onClick={() => onMarkPrinted(currentLead.id, currentLead.isPlaquePrinted)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                      currentLead.isPlaquePrinted
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700 hover:bg-emerald-900/60'
                        : 'bg-amber-950/60 text-amber-400 border-amber-700 hover:bg-amber-900/60'
                    }`}
                    title="Clique para alternar manualmente o status"
                  >
                    <Printer className="w-2.5 h-2.5" />
                    <span>{currentLead.isPlaquePrinted ? '✓ Impressa' : '🟡 Pendente'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Feedback message */}
            {downloadSuccessMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{downloadSuccessMsg}</span>
              </div>
            )}

          </div>

          {/* Right Column: Live High-Definition Preview */}
          <div className="lg:col-span-6 flex flex-col items-center justify-between bg-slate-950 p-6 rounded-3xl border border-slate-800/80 min-h-[420px] relative">
            <div className="w-full flex items-center justify-between z-10 mb-2">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-800 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>100% Idêntico ao Totem 3D</span>
              </span>

              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="text-[10px] font-bold text-slate-400 hover:text-white px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-lg transition cursor-pointer"
              >
                {isZoomed ? '🔍 Ajustar à Tela' : '🔎 Zoom 100% (Ultra HD)'}
              </button>
            </div>

            {isLoadingPreview ? (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-24 my-auto">
                <RefreshCw className="w-9 h-9 animate-spin text-cyan-400" />
                <span className="text-xs font-semibold">Renderizando Canvas Ultra HD em 300+ DPI...</span>
              </div>
            ) : previewDataUrl ? (
              <div className="flex flex-col items-center gap-3 my-auto w-full">
                <div
                  className={`bg-black/50 p-2 rounded-2xl print-container border border-white/15 flex items-center justify-center max-w-full transition-all ${
                    isZoomed
                      ? 'max-h-[440px] overflow-auto'
                      : 'overflow-hidden'
                  } ${
                    selectedFormat === 'plate_10x10'
                      ? isZoomed ? 'w-[480px]' : 'w-[280px] sm:w-[320px] aspect-square'
                      : selectedFormat === 'card_horizontal'
                      ? isZoomed ? 'w-[520px]' : 'w-[320px] sm:w-[360px] aspect-[8.5/5.4]'
                      : isZoomed ? 'w-[380px]' : 'w-[220px] sm:w-[250px] aspect-[5.4/8.5]'
                  }`}
                >
                  <img
                    src={previewDataUrl}
                    alt="Artwork Preview"
                    className="w-full h-full object-contain rounded-xl drop-shadow-2xl"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                </div>

                <div className="text-center space-y-1 mt-2">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    <CheckCircle className="w-3 h-3" />
                    <span>
                      {selectedFormat === 'plate_10x10'
                        ? 'Placa 10x10 cm • 2400 x 2400 px Ultra HD'
                        : selectedFormat === 'card_horizontal'
                        ? 'Cartão CR80 Horizontal • 2040 x 1296 px Ultra HD'
                        : 'Cartão CR80 Vertical • 1296 x 2040 px Ultra HD'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Com parafusos afastadores metálicos, beacon NFC e insígnia Google oficiais
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-500 my-auto">Selecione uma empresa para gerar o preview</span>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 text-center flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>ALF Automação • Produção Gráfica e NFC Inteligente</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
