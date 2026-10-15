import React, { useState } from 'react';
import {
  Smartphone,
  QrCode,
  Copy,
  ExternalLink,
  Download,
  Share2,
  Check,
  Star,
  Globe,
  Wifi,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Radio,
  RefreshCw,
  FolderArchive,
  Phone,
  FileCode,
  Send,
  Zap,
  MapPin,
  Clock,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  Code2,
  PackageCheck,
  Eye,
  X
} from 'lucide-react';
import {
  MiniSiteConfig,
  generateMiniSiteHtml,
  generateMiniSiteStandaloneHtml,
  downloadMiniSiteHtml,
  downloadMiniSiteZip,
  openMiniSiteLivePreview,
  copyMiniSiteHtmlToClipboard,
  generateClientShareMessage,
  buildMiniSiteWhatsappUrl,
  sanitizeMiniSiteHandle
} from '../utils/miniSiteExporter';
import {
  cleanClientSlug,
  getClientVercelUrl,
  downloadVercelClientZip,
  generateVercelClientPitchWhatsapp
} from '../utils/vercelMiniSiteExporter';
import { getPublicAppOrigin } from '../utils/publicUrlHelper';
import { GoogleReviewLinkGenerator } from './GoogleReviewLinkGenerator';

interface MiniSiteViewerProps {
  config: MiniSiteConfig;
  onChangeConfig?: (updated: MiniSiteConfig) => void;
  standalone?: boolean;
  onLinkToNfc?: (vercelUrl?: string) => void;
  leadId?: string;
  isLinkedToNfc?: boolean;
}

export const MiniSiteViewer: React.FC<MiniSiteViewerProps> = ({
  config,
  onChangeConfig,
  standalone = false,
  onLinkToNfc,
  leadId = 'demo',
  isLinkedToNfc = false
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'vercel' | 'export'>('preview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedVercelLink, setCopiedVercelLink] = useState(false);
  const [copiedVercelPitch, setCopiedVercelPitch] = useState(false);
  const [copiedVercelCli, setCopiedVercelCli] = useState(false);
  const [customVercelDomain, setCustomVercelDomain] = useState('');
  const [isZipping, setIsZipping] = useState(false);
  const [isZippingVercel, setIsZippingVercel] = useState(false);
  const [isDownloadingHtml, setIsDownloadingHtml] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'pix' | 'wifi'>('none');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const shareableUrl = `${getPublicAppOrigin()}/?minisite=${leadId || config.id || 'demo'}`;

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      showToast('Link do Mini Site copiado para a área de transferência!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (_) {}
  };

  const handlePixClick = async () => {
    const key = config.pixKey || 'pix@empresa.com.br';
    try {
      await navigator.clipboard.writeText(key);
      setCopiedPix(true);
      showToast('Chave Pix copiada com sucesso!');
      setTimeout(() => setCopiedPix(false), 2500);
    } catch (_) {}
    setActiveModal('pix');
  };

  const handleWifiClick = () => {
    setActiveModal('wifi');
  };

  const handleCopyWifiPass = async () => {
    const pass = config.wifiPassword || 'VisiteNos123';
    try {
      await navigator.clipboard.writeText(pass);
      setCopiedWifi(true);
      showToast('Senha do Wi-Fi copiada!');
      setTimeout(() => setCopiedWifi(false), 2500);
    } catch (_) {}
  };

  const handleCopyHtml = async () => {
    const ok = await copyMiniSiteHtmlToClipboard(config);
    if (ok) {
      setCopiedHtml(true);
      showToast('Código HTML 100% estático copiado!');
      setTimeout(() => setCopiedHtml(false), 2500);
    }
  };

  const handleDownloadHtml = async () => {
    setIsDownloadingHtml(true);
    try {
      await downloadMiniSiteHtml(config);
      showToast('Download do arquivo index.html concluído com sucesso!');
    } catch (e) {
      console.error(e);
      showToast('Erro ao baixar arquivo HTML.');
    } finally {
      setIsDownloadingHtml(false);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadMiniSiteZip(config);
      showToast('Download do pacote ZIP pronto para hospedagem concluído!');
    } catch (e) {
      console.error(e);
      showToast('Erro ao gerar pacote ZIP.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyClientMessage = async () => {
    const msg = generateClientShareMessage(config, shareableUrl);
    try {
      await navigator.clipboard.writeText(msg);
      setCopiedMessage(true);
      showToast('Mensagem para WhatsApp do cliente copiada!');
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch (_) {}
  };

  // Values
  const name = config.companyName || 'Sua Empresa';
  const niche = config.niche || 'Atendimento Exclusivo';
  const city = config.city || 'Brasil';
  const initial = (name.trim().charAt(0) || 'A').toUpperCase();
  const whatsappUrl = buildMiniSiteWhatsappUrl(
    config.whatsappNumber || config.phone || '5511999999999',
    config.whatsappMessage || `Olá! Vim através do Mini Site de ${name}. Gostaria de mais informações!`
  );
  const instaHandle = sanitizeMiniSiteHandle(config.instagramUrl || '', '@');
  const tiktokHandle = sanitizeMiniSiteHandle(config.tiktokUrl || '', '@');
  const pixKey = config.pixKey || 'pix@empresa.com.br';
  const pixBeneficiary = config.pixBeneficiary || name;
  const wifiSsid = config.wifiSsid || `${name.replace(/\s+/g, '_')}_WiFi`;
  const wifiPass = config.wifiPassword || 'VisiteNos123';

  // Pix and WiFi QR codes
  const pixQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(pixKey)}`;
  const wifiQrData = `WIFI:T:${config.wifiSecurity || 'WPA'};S:${wifiSsid};P:${wifiPass};;`;
  const wifiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(wifiQrData)}`;

  // Interactive phone preview card
  const renderPhoneSimulator = () => (
    <div className="relative mx-auto w-full max-w-[380px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-white/10 select-none">
      {/* Smartphone Notch / Dynamic Island */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-30 flex items-center justify-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/60"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
      </div>

      {/* Screen Body */}
      <div className="relative rounded-[36px] bg-gradient-to-b from-[#090d16] via-[#0f172a] to-[#030712] text-slate-100 p-5 pt-12 pb-8 overflow-y-auto max-h-[660px] scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* Glow behind profile */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-sky-500/20 blur-3xl pointer-events-none"></div>

        {/* Profile Header */}
        <div className="relative z-10 text-center space-y-2 mb-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-sky-500/30 border-2 border-white/20 overflow-hidden">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt={name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              ) : (
                initial
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-slate-900 shadow-sm" title="Verificado">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-black text-white tracking-tight">{name}</h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full bg-white/10 border border-white/10 text-[10px] uppercase font-bold text-sky-300">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>{niche} • {city}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-[260px] mx-auto">
              {config.tagline || `${niche} de excelência em ${city}`}
            </p>
          </div>

          {config.openingHours && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-300">
              <Clock className="w-3 h-3 text-sky-400" />
              <span>{config.openingHours}</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Aberto agora • Atendimento Online</span>
          </div>
        </div>

        {/* Action Buttons List */}
        <div className="relative z-10 space-y-2.5">
          
          {/* 1. Google Review */}
          <a
            href={config.googleReviewUrl || 'https://maps.google.com'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-amber-950/20 to-blue-950/40 border border-amber-400/40 hover:border-amber-400/70 transition-all cursor-pointer group shadow-sm active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Star className="w-5 h-5 fill-amber-300 text-amber-200" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">Avaliar no Google</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300">⭐⭐⭐⭐⭐</span>
                </div>
                <p className="text-[10px] text-slate-400">Avalie nosso atendimento em 5s</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* 2. WhatsApp Direct */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-sm active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                <Send className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">WhatsApp Direto</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300">1-Clique</span>
                </div>
                <p className="text-[10px] text-slate-400">Fale com nossa equipe agora</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* 3. 1-Click Wi-Fi Connect */}
          <button
            type="button"
            onClick={handleWifiClick}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-sky-950/20 border border-sky-500/30 hover:border-sky-500/60 transition-all cursor-pointer group shadow-sm active:scale-98 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">Conectar ao Wi-Fi</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-sky-500/20 text-sky-300">Grátis</span>
                </div>
                <p className="text-[10px] text-slate-400">Conecte sem digitar senha</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* 4. 1-Click Pix Payment */}
          <button
            type="button"
            onClick={handlePixClick}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-teal-950/20 border border-teal-500/30 hover:border-teal-500/60 transition-all cursor-pointer group shadow-sm active:scale-98 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white shadow-md">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">Pagamento via Pix</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-teal-500/20 text-teal-300">Copia &amp; Cola</span>
                </div>
                <p className="text-[10px] text-slate-400">Copie a chave ou pague por QR</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* 5. Instagram */}
          <a
            href={config.instagramUrl || 'https://instagram.com'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-950/20 border border-pink-500/30 hover:border-pink-500/60 transition-all cursor-pointer group shadow-sm active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Radio className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">Instagram</span>
                  {instaHandle && <span className="text-[10px] text-pink-300 font-bold">{instaHandle}</span>}
                </div>
                <p className="text-[10px] text-slate-400">Fotos, novidades e stories</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* 6. Endereço & Rota Google Maps (se cadastrado) */}
          {config.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address + ' ' + (config.city || ''))}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/60 transition-all cursor-pointer group shadow-sm active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">Como Chegar</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300">Maps</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-[190px]">{config.address}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          {/* 7. Ligar Direto (se cadastrado) */}
          {config.phone && (
            <a
              href={`tel:${config.phone.replace(/\D/g, '')}`}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/30 hover:border-blue-500/60 transition-all cursor-pointer group shadow-sm active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">Ligar no Telefone</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-300">Ligação</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{config.phone}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          {/* 8. Website (se configurado) */}
          {config.websiteUrl && (
            <a
              href={config.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 hover:border-indigo-500/60 transition-all cursor-pointer group shadow-sm active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-white block">Site Oficial &amp; Cardápio</span>
                  <p className="text-[10px] text-slate-400">Catálogo completo de serviços</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          {/* 9. Telegram (se configurado) */}
          {config.telegramUrl && (
            <a
              href={config.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-950/20 border border-sky-400/30 hover:border-sky-400/60 transition-all cursor-pointer group shadow-sm active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-md">
                  <Send className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-white block">Canal no Telegram</span>
                  <p className="text-[10px] text-slate-400">Promoções e avisos diretos</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          {/* 10. TikTok (se configurado) */}
          {config.tiktokUrl && (
            <a
              href={config.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900 border border-rose-500/30 hover:border-rose-500/60 transition-all cursor-pointer group shadow-sm active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black border border-rose-500/40 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-white block">TikTok Oficial</span>
                  <p className="text-[10px] text-slate-400">{tiktokHandle || 'Vídeos e tendências'}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 text-center space-y-1">
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
            <Radio className="w-2.5 h-2.5 text-sky-400" />
            Tecnologia NFC &amp; Link-in-Bio
          </span>
          <p className="text-[9px] text-slate-600">
            &copy; {new Date().getFullYear()} {name}. Todos os direitos reservados.
          </p>
        </div>

      </div>

      {/* Simulator Modal for Pix */}
      {activeModal === 'pix' && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-[44px] p-6 z-40 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
          <button
            onClick={() => setActiveModal('none')}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center mb-2">
            <Zap className="w-6 h-6 fill-teal-400" />
          </div>
          <h3 className="text-base font-black text-white">Chave Pix Instantânea</h3>
          <p className="text-xs text-slate-400 mb-3">Aponte o app do banco ou copie a chave:</p>
          
          <div className="bg-white p-2.5 rounded-2xl shadow-lg mb-3">
            <img src={pixQrUrl} alt="Pix QR" className="w-36 h-36 rounded-xl" />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 w-full text-left mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{config.pixKeyType || 'Chave Pix'}:</span>
            <span className="text-xs font-mono font-bold text-sky-400 break-all">{pixKey}</span>
            <span className="text-[11px] text-slate-300 block mt-1">Favorecido: <strong>{pixBeneficiary}</strong></span>
          </div>

          <button
            onClick={async () => {
              await navigator.clipboard.writeText(pixKey);
              showToast('Chave Pix copiada!');
            }}
            className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>Copiar Chave Pix</span>
          </button>
        </div>
      )}

      {/* Simulator Modal for Wi-Fi */}
      {activeModal === 'wifi' && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-[44px] p-6 z-40 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
          <button
            onClick={() => setActiveModal('none')}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center mb-2">
            <Wifi className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-white">Conectar ao Wi-Fi</h3>
          <p className="text-xs text-slate-400 mb-3">Aponte a câmera do celular para o QR Code:</p>
          
          <div className="bg-white p-2.5 rounded-2xl shadow-lg mb-3">
            <img src={wifiQrUrl} alt="Wi-Fi QR" className="w-36 h-36 rounded-xl" />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 w-full text-left space-y-1 mb-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Rede (SSID):</span>
              <strong className="text-white">{wifiSsid}</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Senha:</span>
              <strong className="text-sky-400 font-mono">{wifiPass}</strong>
            </div>
          </div>

          <button
            onClick={handleCopyWifiPass}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>Copiar Senha do Wi-Fi</span>
          </button>
        </div>
      )}

    </div>
  );

  // If standalone full-page mode (when someone opens ?minisite=ID directly)
  if (standalone) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        {renderPhoneSimulator()}
        {toastMessage && (
          <div className="fixed bottom-6 bg-emerald-600 text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-xl animate-in slide-in-from-bottom duration-200 z-50 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // Dashboard / Editor / Demonstrative mode
  return (
    <div className="space-y-6">
      
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-300" />
              Mini Site Inovador • Hub Digital NFC
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <PackageCheck className="w-3 h-3" />
              Exportável 1-Clique
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Hospedagem 100% Independente
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
            Mini Site de Alta Conversão ({name})
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Página ultrarrápida para bio do Instagram e redirecionamento de placas NFC: botões de WhatsApp, Pix automático, Wi-Fi 1-clique, Google Reviews e redes sociais.
          </p>
        </div>

        {/* Action button triggers */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          
          {/* PRIMARY: EXPORT HTML MODAL BUTTON */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 border border-emerald-400/30"
            title="Exportar arquivo HTML estático completo para o cliente hospedar independentemente"
          >
            <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Exportar HTML Estático</span>
            <span className="bg-slate-950/20 text-[9px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider text-slate-950">
              Autônomo
            </span>
          </button>

          <button
            onClick={handleCopyShareLink}
            className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title="Copiar link compartilhável do Mini Site"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
          </button>

          <button
            onClick={() => openMiniSiteLivePreview(config)}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            title="Abrir o Mini Site em nova aba em tela cheia"
          >
            <ExternalLink className="w-4 h-4 text-sky-400" />
            <span>Ver em Nova Aba</span>
          </button>

          {onLinkToNfc && (
            <button
              onClick={() => onLinkToNfc()}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer ${
                isLinkedToNfc
                  ? 'bg-emerald-600 text-white border border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
              }`}
              title="Vincular este Mini Site como destino do Totem e Placa NFC deste cliente"
            >
              <Radio className="w-4 h-4" />
              <span>{isLinkedToNfc ? '✓ Placa NFC Vinculada' : 'Vincular à Placa NFC'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Controls / Right Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Customization & Tabs */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Navigation Sub-Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'preview' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Visão Geral</span>
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'edit' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Editar Dados</span>
            </button>
            <button
              onClick={() => setActiveTab('vercel')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'vercel' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="font-mono font-black text-xs">▲</span>
              <span>Hospedar na Vercel</span>
              <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded-md bg-emerald-500 text-slate-950">
                Cliente
              </span>
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'export' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & SHARING */}
          {activeTab === 'preview' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Link Compartilhável do Mini Site</span>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={shareableUrl}
                    className="flex-1 bg-transparent text-xs font-mono font-bold text-slate-700 outline-none"
                  />
                  <button
                    onClick={handleCopyShareLink}
                    className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Envie este link no WhatsApp para seu cliente testar, coloque na bio do Instagram ou grave diretamente na placa NFC.
                </p>
              </div>

              {/* Botões Ativos Overview Cards */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Botões Ativos no Mini Site:</h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                    <div>
                      <strong className="block text-slate-900">Google Reviews</strong>
                      <span className="text-[10px] text-slate-500">5 estrelas direto</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block text-slate-900">WhatsApp</strong>
                      <span className="text-[10px] text-slate-500">1-clique conversa</span>
                    </div>
                  </div>

                  <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl flex items-center gap-2">
                    <Zap className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <strong className="block text-slate-900">Pix Instantâneo</strong>
                      <span className="text-[10px] text-slate-500">Copia chave + QR</span>
                    </div>
                  </div>

                  <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-xl flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <strong className="block text-slate-900">Wi-Fi 1-Clique</strong>
                      <span className="text-[10px] text-slate-500">QR Code sem senha</span>
                    </div>
                  </div>

                  <div className="p-3 bg-pink-50/60 border border-pink-200 rounded-xl flex items-center gap-2">
                    <Radio className="w-4 h-4 text-pink-600 shrink-0" />
                    <div>
                      <strong className="block text-slate-900">Instagram</strong>
                      <span className="text-[10px] text-slate-500">{instaHandle || 'Perfil oficial'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <strong className="block text-slate-900">Endereço &amp; Maps</strong>
                      <span className="text-[10px] text-slate-500">{config.address ? 'Rota no Google' : 'Cadastre abaixo'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to action for export */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    <strong className="text-xs font-black text-emerald-950">Entregar Mini Site ao Cliente</strong>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Exporte o arquivo HTML único ou o pacote ZIP com manual de hospedagem gratuita.
                  </p>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition cursor-pointer shrink-0 shadow-sm"
                >
                  Exportar Agora
                </button>
              </div>

              {/* NFC Integration Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status na Placa NFC</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {isLinkedToNfc ? '🟢 Placa NFC redireciona para este Mini Site' : '⚪ Placa NFC redireciona para Google Reviews'}
                  </p>
                </div>
                {onLinkToNfc && (
                  <button
                    onClick={() => onLinkToNfc()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    {isLinkedToNfc ? 'Manter Mini Site' : 'Vincular Agora'}
                  </button>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: EDIT BUTTONS & DETAILS */}
          {activeTab === 'edit' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 max-h-[620px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Personalizar Dados do Mini Site</h4>
                <span className="text-[10px] text-slate-400 font-semibold">Salva em tempo real</span>
              </div>

              {/* Company Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    value={config.companyName}
                    onChange={(e) => onChangeConfig && onChangeConfig({ ...config, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nicho / Categoria</label>
                  <input
                    type="text"
                    value={config.niche}
                    onChange={(e) => onChangeConfig && onChangeConfig({ ...config, niche: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={config.city}
                    onChange={(e) => onChangeConfig && onChangeConfig({ ...config, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Horário de Funcionamento</label>
                  <input
                    type="text"
                    value={config.openingHours || ''}
                    onChange={(e) => onChangeConfig && onChangeConfig({ ...config, openingHours: e.target.value })}
                    placeholder="Seg a Sáb: 08h às 19h"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Slogan / Bio Curta</label>
                <input
                  type="text"
                  value={config.tagline || ''}
                  onChange={(e) => onChangeConfig && onChangeConfig({ ...config, tagline: e.target.value })}
                  placeholder="Ex: O melhor café artesanal da cidade"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">URL do Logo (Opcional)</label>
                <input
                  type="text"
                  value={config.logoUrl || ''}
                  onChange={(e) => onChangeConfig && onChangeConfig({ ...config, logoUrl: e.target.value })}
                  placeholder="https://exemplo.com/logo.png"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-sky-500"
                />
              </div>

              {/* Endereço & Telefone */}
              <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-black uppercase text-rose-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  Localização &amp; Telefone Comercial
                </span>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">Endereço Completo (Gera botão de rota no Google Maps)</label>
                    <input
                      type="text"
                      value={config.address || ''}
                      onChange={(e) => onChangeConfig && onChangeConfig({ ...config, address: e.target.value })}
                      placeholder="Av. Paulista, 1000 - Bela Vista"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">Telefone Fixo / Comercial (Gera botão 'Ligar Direto')</label>
                    <input
                      type="text"
                      value={config.phone || ''}
                      onChange={(e) => onChangeConfig && onChangeConfig({ ...config, phone: e.target.value })}
                      placeholder="(11) 3333-4444"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Config */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-black uppercase text-emerald-800 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  Botão WhatsApp Direto
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">Número (com DDD)</label>
                    <input
                      type="text"
                      value={config.whatsappNumber || config.phone || ''}
                      onChange={(e) => onChangeConfig && onChangeConfig({ ...config, whatsappNumber: e.target.value })}
                      placeholder="11999999999"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">Mensagem Inicial</label>
                    <input
                      type="text"
                      value={config.whatsappMessage || ''}
                      onChange={(e) => onChangeConfig && onChangeConfig({ ...config, whatsappMessage: e.target.value })}
                      placeholder="Olá! Gostaria de informações."
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Wi-Fi Config */}
              <div className="p-3 bg-sky-50/50 border border-sky-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-black uppercase text-sky-800 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-sky-600" />
                  Botão Wi-Fi Instantâneo
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">Nome da Rede (SSID)</label>
                    <input
                      type="text"
                      value={config.wifiSsid || ''}
                      onChange={(e) => onChangeConfig && onChangeConfig({ ...config, wifiSsid: e.target.value })}
                      placeholder="Nome_Do_WiFi"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">Senha do Wi-Fi</label>
                    <input
                      type="text"
                      value={config.wifiPassword || ''}
                      onChange={(e) => onChangeConfig && onChangeConfig({ ...config, wifiPassword: e.target.value })}
                      placeholder="Senha123"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold font-mono focus:outline-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pix Config */}
              <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-black uppercase text-teal-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-teal-600" />
                  Botão Pix Instantâneo
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">Chave Pix</label>
                    <input
                      type="text"
                      value={config.pixKey || ''}
                      onChange={(e) => onChangeConfig && onChangeConfig({ ...config, pixKey: e.target.value })}
                      placeholder="CNPJ, E-mail ou Celular"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold font-mono focus:outline-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">Beneficiário / Nome</label>
                    <input
                      type="text"
                      value={config.pixBeneficiary || ''}
                      onChange={(e) => onChangeConfig && onChangeConfig({ ...config, pixBeneficiary: e.target.value })}
                      placeholder="Nome da Empresa"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Google Reviews Link Generator */}
              <div className="space-y-2">
                <GoogleReviewLinkGenerator
                  initialQuery={config.companyName}
                  initialCity={config.city}
                  currentUrl={config.googleReviewUrl}
                  compact={true}
                  onLinkGenerated={(generatedUrl) => {
                    if (onChangeConfig) {
                      onChangeConfig({ ...config, googleReviewUrl: generatedUrl });
                    }
                  }}
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Instagram (@ ou URL)</label>
                  <input
                    type="text"
                    value={config.instagramUrl || ''}
                    onChange={(e) => onChangeConfig && onChangeConfig({ ...config, instagramUrl: e.target.value })}
                    placeholder="@empresa ou link"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Telegram (Opcional)</label>
                  <input
                    type="text"
                    value={config.telegramUrl || ''}
                    onChange={(e) => onChangeConfig && onChangeConfig({ ...config, telegramUrl: e.target.value })}
                    placeholder="t.me/canal"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">TikTok (Opcional)</label>
                  <input
                    type="text"
                    value={config.tiktokUrl || ''}
                    onChange={(e) => onChangeConfig && onChangeConfig({ ...config, tiktokUrl: e.target.value })}
                    placeholder="@tiktok_perfil"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-sky-500"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: VERCEL HOSTING MODEL FOR EACH CLIENT */}
          {activeTab === 'vercel' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
              
              {/* Vercel Header Card */}
              <div className="bg-linear-to-r from-slate-950 via-slate-900 to-blue-950 p-5 rounded-2xl text-white space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-mono font-black text-sm">
                      ▲
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">Modelo de Link Vercel para {name}</h3>
                      <p className="text-[11px] text-slate-300">
                        {niche} • {city}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Hospedagem 1-Clique
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  Este modelo gera um link de carregamento ultrarrápido hospedado na Vercel para cada cliente cadastrado. O cliente pode utilizar este link exclusivo na bio do Instagram, no WhatsApp e em suas placas NFC.
                </p>
              </div>

              {/* Unique Client Link Configuration */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Link Exclusivo do Cliente na Vercel
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    HTTPS Grátis • CDN Global
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 flex items-center gap-2 focus-within:border-slate-900">
                    <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={customVercelDomain || getClientVercelUrl(name)}
                      onChange={(e) => setCustomVercelDomain(e.target.value)}
                      placeholder={`https://${cleanClientSlug(name)}.vercel.app`}
                      className="w-full text-xs font-mono font-bold text-slate-900 bg-transparent outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const url = customVercelDomain || getClientVercelUrl(name);
                      await navigator.clipboard.writeText(url);
                      setCopiedVercelLink(true);
                      showToast('Link da Vercel copiado com sucesso!');
                      setTimeout(() => setCopiedVercelLink(false), 2500);
                    }}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    {copiedVercelLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={customVercelDomain || getClientVercelUrl(name)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>Testar Link</span>
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-1 pt-1">
                  <span>Subdomínio Vercel: <strong>{cleanClientSlug(name)}.vercel.app</strong></span>
                  {onLinkToNfc && (
                    <button
                      type="button"
                      onClick={() => onLinkToNfc(customVercelDomain || getClientVercelUrl(name))}
                      className="text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
                    >
                      Gravar este link na Placa NFC deste cliente ➔
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons: ZIP Package and WhatsApp Pitch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* 1. Download Vercel ZIP Bundle */}
                <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">▲</span>
                      <strong className="text-xs font-black text-slate-900">Baixar Pacote Vercel (ZIP)</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Estruturado com <code className="text-slate-900 font-bold">vercel.json</code>, <code className="text-slate-900 font-bold">package.json</code>, <code className="text-slate-900 font-bold">index.html</code> e manual didático.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsZippingVercel(true);
                      try {
                        const targetUrl = customVercelDomain || getClientVercelUrl(name);
                        await downloadVercelClientZip(config, targetUrl);
                        showToast('Pacote Vercel baixado com sucesso!');
                      } catch (err) {
                        console.error(err);
                        showToast('Erro ao baixar pacote Vercel.');
                      } finally {
                        setIsZippingVercel(false);
                      }
                    }}
                    disabled={isZippingVercel}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isZippingVercel ? (
                      <span className="animate-pulse">Gerando ZIP Vercel...</span>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Baixar Pacote Vercel</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. WhatsApp Delivery Pitch */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-emerald-600" />
                      <strong className="text-xs font-black text-slate-900">Mensagem de Entrega no WhatsApp</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Texto formatado com o link da Vercel para você enviar no WhatsApp de <strong>{name}</strong>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const targetUrl = customVercelDomain || getClientVercelUrl(name);
                      const pitch = generateVercelClientPitchWhatsapp(name, targetUrl, niche);
                      await navigator.clipboard.writeText(pitch);
                      setCopiedVercelPitch(true);
                      showToast('Mensagem de WhatsApp copiada!');
                      setTimeout(() => setCopiedVercelPitch(false), 2500);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    {copiedVercelPitch ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Mensagem Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Mensagem WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Vercel CLI Box & Steps */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Como Publicar na Vercel para Este Cliente (Passo a Passo)
                </span>

                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500">$</span>
                    <span className="text-emerald-400 font-bold">npx vercel --prod</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText('npx vercel --prod');
                      setCopiedVercelCli(true);
                      showToast('Comando npx vercel --prod copiado!');
                      setTimeout(() => setCopiedVercelCli(false), 2000);
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-sans font-bold transition cursor-pointer"
                  >
                    {copiedVercelCli ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center">1</span>
                    <strong className="block text-slate-900 font-bold">Descompacte o ZIP</strong>
                    <p className="text-[11px] text-slate-500">Extraia a pasta do cliente no seu computador.</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center">2</span>
                    <strong className="block text-slate-900 font-bold">Execute o Comando</strong>
                    <p className="text-[11px] text-slate-500">Digite <code>npx vercel --prod</code> ou suba no painel web da Vercel.</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center">3</span>
                    <strong className="block text-slate-900 font-bold">Entregue ao Cliente</strong>
                    <p className="text-[11px] text-slate-500">Envie o link ou grave na Placa NFC física do cliente.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: EXPORT OPTIONS */}
          {activeTab === 'export' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    Exportação de Mini Site Independente
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Gera arquivos estáticos que o cliente pode hospedar em qualquer lugar para sempre.
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Sem Servidor
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Single HTML */}
                <div className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-400 transition bg-slate-50/50">
                  <div className="space-y-1.5 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <strong className="text-sm text-slate-900 block font-black">index.html (Arquivo Único)</strong>
                    <p className="text-xs text-slate-500">
                      Arquivo único com CSS, ícones e QR Codes base64 embutidos. 100% autônomo, funciona sem internet e sem dependências.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadHtml}
                    disabled={isDownloadingHtml}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloadingHtml ? 'Gerando index.html...' : 'Baixar index.html'}</span>
                  </button>
                </div>

                {/* 2. Full ZIP */}
                <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-400 transition">
                  <div className="space-y-1.5 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FolderArchive className="w-4 h-4" />
                    </div>
                    <strong className="text-sm text-slate-900 block font-black">Pacote ZIP Completo</strong>
                    <p className="text-xs text-slate-500">
                      Inclui index.html + manual de publicação em 30 segundos no Netlify Drop + backup JSON das configurações.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isZipping ? 'Compactando...' : 'Baixar Pacote ZIP'}</span>
                  </button>
                </div>

              </div>

              {/* Action Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleCopyHtml}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                  <span>{copiedHtml ? 'HTML Copiado!' : 'Copiar Código HTML'}</span>
                </button>

                <button
                  onClick={handleCopyClientMessage}
                  className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{copiedMessage ? 'Mensagem Copiada!' : 'Copiar Texto para WhatsApp'}</span>
                </button>
              </div>

              {/* Hosting Guide Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                <strong className="block font-black text-slate-800 text-xs">
                  🚀 Como o cliente hospeda gratuitamente em 30 segundos:
                </strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                  <li>Acesse <strong>app.netlify.com/drop</strong> no navegador.</li>
                  <li>Arraste o arquivo <strong>index.html</strong> ou o ZIP para a página.</li>
                  <li>O site entra no ar na hora com SSL gratuito (https://) e link próprio!</li>
                  <li>O cliente pode colar o link na bio do Instagram ou você grava na Placa NFC.</li>
                </ol>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Live Interactive Smartphone Simulator */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="text-center mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Simulador em Tempo Real • Toque nos Botões
            </span>
          </div>
          {renderPhoneSimulator()}
        </div>

      </div>

      {/* DEDICATED EXPORT MODAL FOR OPERATOR */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 md:p-8 text-white relative shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-1.5 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wide">
                  Exportador de Mini Site Independente
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black uppercase tracking-wide">
                  100% Autônomo
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white">
                Exportar Mini Site de {name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gere um arquivo estático contendo todas as configurações da empresa (links, WhatsApp, Pix, Wi-Fi, Google Reviews, cores e logo) para que o cliente possa hospedar o mini-site independentemente em qualquer servidor ou abrir localmente.
              </p>
            </div>

            {/* Configs summary checklist */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-6">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                Configurações da Empresa Inclusas no Arquivo:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">🏢 {name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">💬 WhatsApp 1-clique</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">⭐ Google Reviews 5★</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">⚡ Pix ({config.pixKeyType || 'Chave'})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">📶 Wi-Fi 1-clique</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">📸 Instagram Oficial</span>
                </div>
                {config.address && (
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">📍 Rota Google Maps</span>
                  </div>
                )}
                {config.phone && (
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">📞 Ligação Direta</span>
                  </div>
                )}
                {config.openingHours && (
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">🕒 Horário Cadastrado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Download Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              
              {/* Option 1: Single index.html */}
              <div className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-400 transition">
                <div className="space-y-1.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <strong className="text-sm font-black text-white block">
                    index.html (Arquivo Único)
                  </strong>
                  <p className="text-xs text-slate-300">
                    Arquivo estático com CSS e QR codes Base64 já embutidos. É o padrão oficial para subir em qualquer hospedagem web ou abrir localmente.
                  </p>
                </div>
                <button
                  onClick={handleDownloadHtml}
                  disabled={isDownloadingHtml}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>{isDownloadingHtml ? 'Gerando index.html...' : 'Baixar index.html'}</span>
                </button>
              </div>

              {/* Option 2: Full ZIP Package */}
              <div className="bg-slate-800/80 border border-blue-500/40 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-400 transition">
                <div className="space-y-1.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <strong className="text-sm font-black text-white block">
                    Pacote ZIP de Hospedagem
                  </strong>
                  <p className="text-xs text-slate-300">
                    Contém index.html + manual de publicação em 30 segundos no Netlify Drop + backup JSON completo de todas as configurações.
                  </p>
                </div>
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>{isZipping ? 'Compactando...' : 'Baixar Pacote ZIP'}</span>
                </button>
              </div>

            </div>

            {/* Quick Secondary Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
              <button
                onClick={handleCopyHtml}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-sky-400" />
                <span>{copiedHtml ? 'Código Copiado!' : 'Copiar Código HTML'}</span>
              </button>

              <button
                onClick={handleCopyClientMessage}
                className="py-2.5 px-3 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>{copiedMessage ? 'Mensagem Copiada!' : 'Copiar Texto p/ WhatsApp'}</span>
              </button>

              <button
                onClick={() => openMiniSiteLivePreview(config)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Testar Arquivo em Nova Aba</span>
              </button>
            </div>

            {/* 30-Second Hosting Instructions for Operator/Client */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <strong className="text-white font-bold">Instruções para o Cliente Hospedar:</strong>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                <strong>Opção mais rápida (30 segundos):</strong> O cliente só precisa acessar <strong>app.netlify.com/drop</strong> e arrastar o arquivo <strong>index.html</strong> ou a pasta. O site ganha um link https com certificado de segurança gratuito. Ele também pode usar Vercel, GitHub Pages ou subir no gerenciador do cPanel da hospedagem própria.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-950 text-white border border-slate-700 px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl animate-in slide-in-from-bottom duration-200 z-50 flex items-center gap-2.5">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
