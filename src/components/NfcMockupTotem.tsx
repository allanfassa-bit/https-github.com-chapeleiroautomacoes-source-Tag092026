import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  Star,
  CheckCircle,
  Download,
  Share2,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Radio,
  Layers,
  Check,
  Copy,
  FolderArchive,
  CreditCard,
  Image as ImageIcon,
  RefreshCw,
  Building2,
  Search,
  ChevronDown,
  Globe,
  Send,
  Wifi,
  Printer
} from 'lucide-react';
import { NfcArtworkDownloadModal } from './NfcArtworkDownloadModal';
import {
  downloadPlate10x10Png,
  downloadCardNfcPng,
  downloadCompleteArtworkKitZip,
  ArtworkTheme
} from '../utils/nfcPlateGenerator';
import { getPublicAppOrigin, getDynamicQrUrl, getDynamicInstagramUrl, getDynamicGoogleUrl } from '../utils/publicUrlHelper';
import { getPlateIdentification } from '../utils/plateNumberHelper';

export type TotemTheme =
  | 'instagram_official'
  | 'instagram_dual'
  | 'emerald_green'
  | 'royal_blue'
  | 'black_gold'
  | 'acrylic_crystal'
  | 'cyber_neon'
  | 'rose_luxury'
  | 'gourmet_red';

export interface LeadSummary {
  id: string;
  name: string;
  niche?: string;
  city?: string;
  rating?: number;
  reviewCount?: number;
  googleMapsUrl?: string;
  nfcRedirectActive?: string;
  nfcInstagramUrl?: string;
  nfcWhatsappNum?: string;
  nfcWhatsappMsg?: string;
  phone?: string;
  [key: string]: any;
}

interface NfcMockupTotemProps {
  businessName: string;
  niche?: string;
  city?: string;
  reviewLink: string;
  nfcRedirectUrl: string;
  leadId?: string;
  instagramUrl?: string;
  nfcRedirectActive?: string;
  onPrintPlate?: (theme?: ArtworkTheme) => void;
  onDownloadQr?: () => void;
  isDownloadingQr?: boolean;
  leads?: LeadSummary[];
  onSelectLead?: (lead: LeadSummary) => void;
  onNavigateToMiniSite?: (leadId?: string) => void;
  onUpdateRedirectTarget?: (target: string) => void;
  onTogglePlaquePrinted?: (leadId: string, currentStatus?: boolean) => void;
  onOpenCustomDomain?: () => void;
}

export const NfcMockupTotem: React.FC<NfcMockupTotemProps> = ({
  businessName,
  niche = 'Negócio Local',
  city = '',
  reviewLink,
  nfcRedirectUrl,
  leadId = 'demo',
  instagramUrl = '',
  nfcRedirectActive = 'gmb',
  onPrintPlate,
  onDownloadQr,
  isDownloadingQr = false,
  leads = [],
  onSelectLead,
  onNavigateToMiniSite,
  onUpdateRedirectTarget,
  onTogglePlaquePrinted,
  onOpenCustomDomain,
}) => {
  const [theme, setTheme] = useState<TotemTheme>(
    nfcRedirectActive === 'instagram' || (instagramUrl && instagramUrl.length > 0) ? 'instagram_dual' : 'emerald_green'
  );
  const [customInstaUrl, setCustomInstaUrl] = useState(instagramUrl || '');
  const [isCompanySelectorOpen, setIsCompanySelectorOpen] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [printFilter, setPrintFilter] = useState<'all' | 'unprinted' | 'printed'>('all');
  const [isTappingPhone, setIsTappingPhone] = useState(false);
  const [tapStage, setTapStage] = useState<'idle' | 'approaching' | 'contact' | 'detected' | 'review_open'>('idle');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPhoneSim, setShowPhoneSim] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<{ rotateX: number; rotateY: number; glossX: number; glossY: number }>({
    rotateX: 0,
    rotateY: 0,
    glossX: 50,
    glossY: 50
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [standAngle, setStandAngle] = useState<'slanted' | 'straight'>('slanted');
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false);
  const [isDownloadingPlateArt, setIsDownloadingPlateArt] = useState(false);
  const [isDownloadingCardArt, setIsDownloadingCardArt] = useState(false);
  const [artDownloadSuccess, setArtDownloadSuccess] = useState<string | null>(null);
  const [qrTargetMode, setQrTargetMode] = useState<'direct_google' | 'dynamic_cloud'>('dynamic_cloud');
  const totemRef = useRef<HTMLDivElement>(null);

  // Clean public shared origin
  const cloudUrl = getDynamicQrUrl(leadId);
  const directUrl = reviewLink || 'https://maps.google.com';
  const effectivePermanentUrl = qrTargetMode === 'direct_google' ? directUrl : (nfcRedirectUrl || cloudUrl);
  const plateInfo = getPlateIdentification(leadId, businessName);

  // Sync customInstaUrl when instagramUrl prop changes
  useEffect(() => {
    setCustomInstaUrl(instagramUrl || '');
  }, [instagramUrl]);

  // Active lead object and print counters
  const currentLeadObj = (leads || []).find((l) => l.id === leadId || l.name === businessName);
  const unprintedCount = (leads || []).filter((l) => !l.isPlaquePrinted).length;
  const printedCount = (leads || []).filter((l) => Boolean(l.isPlaquePrinted)).length;

  // Filter leads based on search term AND print status filter
  const filteredLeads = (leads || []).filter((l) => {
    if (printFilter === 'unprinted' && l.isPlaquePrinted) return false;
    if (printFilter === 'printed' && !l.isPlaquePrinted) return false;

    if (!companySearchTerm.trim()) return true;
    const term = companySearchTerm.toLowerCase();
    return (
      (l.name && l.name.toLowerCase().includes(term)) ||
      (l.niche && l.niche.toLowerCase().includes(term)) ||
      (l.city && l.city.toLowerCase().includes(term))
    );
  });

  // Auto-switch to instagram_dual when instagram redirect is active
  useEffect(() => {
    if (nfcRedirectActive === 'instagram') {
      setTheme('instagram_dual');
    }
  }, [nfcRedirectActive]);

  // Map TotemTheme to ArtworkTheme
  const mapTotemToArtworkTheme = (t: TotemTheme): ArtworkTheme => {
    if (t === 'instagram_official') return 'instagram_official';
    if (t === 'instagram_dual') return 'instagram_dual';
    if (t === 'emerald_green') return 'emerald_green';
    if (t === 'royal_blue') return 'royal_blue';
    if (t === 'acrylic_crystal') return 'acrylic_crystal';
    if (t === 'cyber_neon') return 'cyber_neon';
    if (t === 'rose_luxury') return 'rose_luxury';
    if (t === 'gourmet_red') return 'gourmet_red';
    return 'official_google';
  };

  const handleQuickDownloadPlate = async () => {
    try {
      setIsDownloadingPlateArt(true);
      await downloadPlate10x10Png({
        businessName,
        leadId,
        permanentUrl: effectivePermanentUrl,
        theme: mapTotemToArtworkTheme(theme),
        city,
        instagramUrl: customInstaUrl || instagramUrl || '',
        instagramHandle: (customInstaUrl || instagramUrl || '').replace(/.*instagram\.com\//, '').replace(/\/$/, '')
      });
      setArtDownloadSuccess('Placa 10x10cm baixada com sucesso (4K Ultra-HD • 600 DPI)!');
      setTimeout(() => setArtDownloadSuccess(null), 3500);
    } catch (err: any) {
      alert('Falha ao baixar imagem da placa: ' + err.message);
    } finally {
      setIsDownloadingPlateArt(false);
    }
  };

  const handleQuickDownloadCard = async () => {
    try {
      setIsDownloadingCardArt(true);
      await downloadCardNfcPng({
        businessName,
        leadId,
        permanentUrl: effectivePermanentUrl,
        theme: mapTotemToArtworkTheme(theme),
        city
      }, 'horizontal');
      setArtDownloadSuccess('Cartão NFC 5.4x8.5cm baixado com sucesso (600 DPI Ultra-HD)!');
      setTimeout(() => setArtDownloadSuccess(null), 3500);
    } catch (err: any) {
      alert('Falha ao baixar imagem do cartão: ' + err.message);
    } finally {
      setIsDownloadingCardArt(false);
    }
  };

  // Audio synthesize function for NFC tap chime
  const playNfcChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Pleasant double-tone contactless beep
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12); // A6

      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.05); // E6

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime + 0.05);
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (_) {}
  };

  // Trigger NFC Phone Tap Animation sequence
  const triggerNfcTapSimulation = () => {
    setShowPhoneSim(true);
    setIsTappingPhone(true);
    setTapStage('approaching');
    setReviewSubmitted(false);

    // Step 1: Approaching phone
    setTimeout(() => {
      setTapStage('contact');
      playNfcChime();
    }, 600);

    // Step 2: Contactless wave & detected
    setTimeout(() => {
      setTapStage('detected');
    }, 1200);

    // Step 3: Open Google Review dialog
    setTimeout(() => {
      setTapStage('review_open');
    }, 2000);
  };

  const resetSimulation = () => {
    setIsTappingPhone(false);
    setTapStage('idle');
    setReviewSubmitted(false);
  };

  // 3D Mouse Parallax effect on Totem
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!totemRef.current) return;
    const rect = totemRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -12; // tilt degrees
    const rotateY = ((x - centerX) / centerX) * 14;
    
    const glossX = (x / rect.width) * 100;
    const glossY = (y / rect.height) * 100;

    setTiltStyle({ rotateX, rotateY, glossX, glossY });
  };

  const handleMouseLeave = () => {
    setTiltStyle({ rotateX: 0, rotateY: 0, glossX: 50, glossY: 50 });
  };

  const handleCopyNfc = () => {
    navigator.clipboard.writeText(effectivePermanentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const effectiveQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
    effectivePermanentUrl
  )}`;

  // Theme styling definitions
  const themeStyles = {
    instagram_official: {
      plateBg: 'bg-white',
      border: 'border-pink-500/50 shadow-pink-500/25',
      accentColor: 'text-pink-500',
      accentBg: 'bg-gradient-to-r from-[#ffd600] via-[#ff0069] to-[#7638fa]',
      accentBorder: 'border-pink-500/50',
      goldText: 'text-amber-300 font-extrabold',
      bolt: 'bg-gradient-to-tr from-slate-300 via-slate-100 to-white border-slate-400 shadow-md',
      tag: 'bg-pink-950/60 text-pink-300 border-pink-400/40',
      textColor: 'text-white',
      subTextColor: 'text-pink-200/80',
      waveColor: 'border-white',
      baseGlow: 'shadow-[0_25px_50px_-12px_rgba(225,48,108,0.4)]',
      headerBg: 'bg-gradient-to-r from-[#405de6] via-[#833ab4] via-[#e1306c] to-[#f77737]',
      ribbonBg: 'bg-gradient-to-r from-[#ffd600] via-[#ff0069] to-[#7638fa]',
      ribbonGlow: 'shadow-pink-500/40',
      name: '📸 Instagram Oficial (100% Instagram)'
    },
    instagram_dual: {
      plateBg: 'bg-gradient-to-b from-[#75187e] via-[#c52e77] to-[#0c3a82]',
      border: 'border-pink-500/50 shadow-pink-500/25',
      accentColor: 'text-pink-400',
      accentBg: 'bg-pink-500',
      accentBorder: 'border-pink-400/50',
      goldText: 'text-amber-300 font-extrabold',
      bolt: 'bg-gradient-to-tr from-slate-300 via-slate-100 to-white border-slate-400 shadow-md',
      tag: 'bg-pink-950/60 text-pink-300 border-pink-400/40',
      textColor: 'text-white',
      subTextColor: 'text-pink-200/80',
      waveColor: 'border-white',
      baseGlow: 'shadow-[0_25px_50px_-12px_rgba(227,65,87,0.35)]',
      headerBg: 'bg-gradient-to-r from-[#75187e] via-[#c52e77] via-[#e34157] to-[#f75f3a]',
      ribbonBg: 'bg-white',
      ribbonGlow: 'shadow-white/50',
      name: '📸 Instagram + Google (Modelo da Foto)'
    },
    emerald_green: {
      plateBg: 'bg-gradient-to-b from-[#02180d] via-[#05331b] to-[#031a0e]',
      border: 'border-emerald-500/40 shadow-emerald-500/20',
      accentColor: 'text-emerald-400',
      accentBg: 'bg-emerald-500',
      accentBorder: 'border-emerald-400/50',
      goldText: 'text-amber-300 font-extrabold',
      bolt: 'bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-100 border-amber-700 shadow-md',
      tag: 'bg-emerald-950/60 text-emerald-300 border-emerald-400/40',
      textColor: 'text-white',
      subTextColor: 'text-emerald-200/70',
      waveColor: 'border-emerald-400/60',
      baseGlow: 'shadow-[0_25px_50px_-12px_rgba(16,185,129,0.3)]',
      headerBg: 'bg-gradient-to-b from-[#02180d] via-[#05331b] to-[#084d29]',
      ribbonBg: 'bg-gradient-to-r from-[#047857] via-[#10b981] via-[#fbbf24] to-[#059669]',
      ribbonGlow: 'shadow-emerald-500/40',
      name: 'Verde Esmeralda (Mockup Oficial)'
    },
    royal_blue: {
      plateBg: 'bg-gradient-to-b from-[#02122b] via-[#062454] to-[#041738]',
      border: 'border-blue-500/40 shadow-blue-500/20',
      accentColor: 'text-blue-400',
      accentBg: 'bg-blue-500',
      accentBorder: 'border-blue-400/50',
      goldText: 'text-sky-300 font-extrabold',
      bolt: 'bg-gradient-to-tr from-blue-600 via-sky-300 to-white border-blue-500 shadow-md',
      tag: 'bg-blue-950/60 text-blue-300 border-blue-400/40',
      textColor: 'text-white',
      subTextColor: 'text-blue-200/70',
      waveColor: 'border-blue-400/60',
      baseGlow: 'shadow-[0_25px_50px_-12px_rgba(59,130,246,0.3)]',
      headerBg: 'bg-gradient-to-b from-[#02122b] via-[#062454] to-[#0b3d88]',
      ribbonBg: 'bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] via-[#0284c7] to-[#38bdf8]',
      ribbonGlow: 'shadow-blue-500/40',
      name: 'Azul Royal (Mockup Oficial)'
    },
    black_gold: {
      plateBg: 'bg-gradient-to-b from-neutral-950 via-neutral-900 to-black',
      border: 'border-amber-400/40 shadow-amber-500/10',
      accentColor: 'text-amber-400',
      accentBg: 'bg-amber-400',
      accentBorder: 'border-amber-400/50',
      goldText: 'text-amber-300 font-extrabold',
      bolt: 'bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-100 border-amber-700 shadow-md',
      tag: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
      textColor: 'text-white',
      subTextColor: 'text-neutral-400',
      waveColor: 'border-amber-400/60',
      baseGlow: 'shadow-[0_25px_50px_-12px_rgba(245,158,11,0.25)]',
      headerBg: 'bg-black',
      ribbonBg: 'bg-gradient-to-r from-[#EA4335] via-[#FBBC05] via-[#34A853] to-[#4285F4]',
      ribbonGlow: 'shadow-blue-500/30',
      name: 'Preto Piano (Mockup Oficial)'
    },
    acrylic_crystal: {
      plateBg: 'bg-gradient-to-b from-white/95 via-white/80 to-white/90 backdrop-blur-md',
      border: 'border-slate-300/80 shadow-slate-900/15',
      accentColor: 'text-blue-600',
      accentBg: 'bg-blue-600',
      accentBorder: 'border-blue-500/40',
      goldText: 'text-amber-500 font-extrabold',
      bolt: 'bg-gradient-to-tr from-slate-400 via-slate-100 to-white border-slate-400 shadow-md',
      tag: 'bg-blue-50 text-blue-700 border-blue-200',
      textColor: 'text-slate-900',
      subTextColor: 'text-slate-500',
      waveColor: 'border-blue-500/60',
      baseGlow: 'shadow-[0_25px_50px_-12px_rgba(15,23,42,0.2)]',
      headerBg: 'bg-slate-900',
      ribbonBg: 'bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600',
      ribbonGlow: 'shadow-blue-500/30',
      name: 'Acrílico Cristal 5mm'
    },
    cyber_neon: {
      plateBg: 'bg-gradient-to-b from-slate-950 via-cyan-950/40 to-black',
      border: 'border-cyan-400/60 shadow-cyan-500/20',
      accentColor: 'text-cyan-400',
      accentBg: 'bg-cyan-500',
      accentBorder: 'border-cyan-400/60',
      goldText: 'text-cyan-300 font-extrabold',
      bolt: 'bg-gradient-to-tr from-cyan-600 via-cyan-200 to-white border-cyan-500 shadow-md',
      tag: 'bg-cyan-950/60 text-cyan-300 border-cyan-400/40',
      textColor: 'text-white',
      subTextColor: 'text-cyan-200/70',
      waveColor: 'border-cyan-400/70',
      baseGlow: 'shadow-[0_25px_50px_-12px_rgba(6,182,212,0.35)]',
      headerBg: 'bg-gradient-to-b from-slate-950 to-cyan-950',
      ribbonBg: 'bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500',
      ribbonGlow: 'shadow-cyan-500/40',
      name: 'Cyber Neon LED Glow'
    },
    rose_luxury: {
      plateBg: 'bg-gradient-to-b from-stone-900 via-rose-950/50 to-neutral-950',
      border: 'border-rose-300/40 shadow-rose-500/10',
      accentColor: 'text-rose-300',
      accentBg: 'bg-rose-400',
      accentBorder: 'border-rose-300/40',
      goldText: 'text-rose-200 font-extrabold',
      bolt: 'bg-gradient-to-tr from-rose-700 via-rose-200 to-rose-50 border-rose-400 shadow-md',
      tag: 'bg-rose-950/40 text-rose-200 border-rose-300/30',
      textColor: 'text-white',
      subTextColor: 'text-rose-200/70',
      waveColor: 'border-rose-400/60',
      baseGlow: 'shadow-[0_25px_50px_-12px_rgba(244,63,94,0.25)]',
      headerBg: 'bg-gradient-to-b from-stone-900 to-rose-950',
      ribbonBg: 'bg-gradient-to-r from-rose-600 via-amber-300 to-rose-500',
      ribbonGlow: 'shadow-rose-500/40',
      name: 'Rose Gold & Estética VIP'
    },
    gourmet_red: {
      plateBg: 'bg-gradient-to-b from-red-950 via-neutral-900 to-black',
      border: 'border-red-500/40 shadow-red-500/15',
      accentColor: 'text-red-500',
      accentBg: 'bg-red-600',
      accentBorder: 'border-red-500/40',
      goldText: 'text-amber-400 font-extrabold',
      bolt: 'bg-gradient-to-tr from-amber-600 via-amber-200 to-white border-amber-400 shadow-md',
      tag: 'bg-red-950/60 text-red-200 border-red-500/30',
      textColor: 'text-white',
      subTextColor: 'text-neutral-400',
      waveColor: 'border-red-500/70',
      baseGlow: 'shadow-[0_25px_50px_-12px_rgba(239,68,68,0.25)]',
      headerBg: 'bg-gradient-to-b from-red-950 to-neutral-900',
      ribbonBg: 'bg-gradient-to-r from-red-600 via-amber-400 to-rose-600',
      ribbonGlow: 'shadow-red-500/40',
      name: 'Veneza Gourmet & Gastronomia'
    }
  };

  const currentTheme = themeStyles[theme];

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 md:p-6 shadow-xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Tecnologia Patenteada NFC + QR Code
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Frequência 13.56 MHz
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
            Totem de Mesa &amp; Placa Inteligente NFC
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Simulador interativo 3D com aproximação de smartphone ao vivo. Seus clientes tocam o celular na placa e avaliam no Google em 3 segundos.
          </p>
        </div>

        {/* Action button triggers */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={triggerNfcTapSimulation}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            title="Clique para ver o smartphone encostando na placa e abrindo o Google"
          >
            <Smartphone className="w-4 h-4 animate-bounce" />
            <span>Simular Toque com Celular (NFC Tap)</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-600 transition"
            title={soundEnabled ? "Desativar som do bipe NFC" : "Ativar som do bipe NFC"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* 🏢 BARRA DE SELEÇÃO E TROCA DE EMPRESA NA TELA DE PLACAS NFC */}
      <div className="bg-white border-2 border-blue-500/30 rounded-3xl p-4 md:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0 font-black text-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Empresa Ativa na Placa NFC
                </span>
                {nfcRedirectActive === 'minisite' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-sky-600" />
                    Destino: Mini Site Hub
                  </span>
                ) : nfcRedirectActive === 'instagram' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                    Destino: Instagram Oficial
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Destino: Google Reviews
                  </span>
                )}

                {/* Print status badge & interactive toggle for active lead */}
                {currentLeadObj && (
                  <button
                    type="button"
                    onClick={() => onTogglePlaquePrinted?.(currentLeadObj.id, currentLeadObj.isPlaquePrinted)}
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 transition cursor-pointer ${
                      currentLeadObj.isPlaquePrinted
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                        : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 animate-pulse'
                    }`}
                    title="Clique para alternar se a placa física desta empresa já foi impressa ou está pendente"
                  >
                    <Printer className="w-3 h-3 text-emerald-600" />
                    <span>{currentLeadObj.isPlaquePrinted ? '✓ Placa Já Impressa' : '🟡 Placa Pendente (Imprimir)'}</span>
                  </button>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {businessName}
              </h3>
              <p className="text-xs text-slate-500">
                {niche} • {city || 'Brasil'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Botão de Trocar Empresa */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCompanySelectorOpen(!isCompanySelectorOpen)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-sm hover:shadow flex items-center gap-2 transition cursor-pointer"
                id="btn-trocar-empresa-nfc"
                title="Trocar a empresa que você está visualizando e customizando nesta tela"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Trocar Empresa {leads && leads.length > 0 ? `(${leads.length})` : ''}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCompanySelectorOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu de Empresas (Mobile centered modal / Desktop dropdown - Nunca corta no mobile) */}
              {isCompanySelectorOpen && (
                <>
                  {/* Backdrop on mobile */}
                  <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 sm:hidden"
                    onClick={() => setIsCompanySelectorOpen(false)}
                  />

                  <div className="fixed inset-x-3 top-20 max-w-sm mx-auto sm:max-w-none sm:mx-0 sm:inset-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 border-b border-slate-100 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Selecionar Empresa para Placa NFC
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsCompanySelectorOpen(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Search Input */}
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={companySearchTerm}
                          onChange={(e) => setCompanySearchTerm(e.target.value)}
                          placeholder="Buscar por nome, nicho ou cidade..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium focus:bg-white focus:outline-hidden focus:border-blue-500"
                          autoFocus
                        />
                      </div>

                      {/* Filter Tabs: Todas / Pendentes / Impressas */}
                      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                        <button
                          type="button"
                          onClick={() => setPrintFilter('all')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition shrink-0 cursor-pointer ${
                            printFilter === 'all'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Todas ({leads?.length || 0})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrintFilter('unprinted')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition shrink-0 flex items-center gap-1 cursor-pointer ${
                            printFilter === 'unprinted'
                              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                          }`}
                          title="Filtrar placas novas que ainda precisam ser impressas"
                        >
                          <span>🟡 Não Impressas</span>
                          <span className="font-mono font-black">({unprintedCount})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrintFilter('printed')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition shrink-0 flex items-center gap-1 cursor-pointer ${
                            printFilter === 'printed'
                              ? 'bg-emerald-600 text-white font-black shadow-xs'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                          title="Filtrar placas já impressas"
                        >
                          <span>🟢 Já Impressas</span>
                          <span className="font-mono font-black">({printedCount})</span>
                        </button>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-thin">
                      {/* Demo Option */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectLead) {
                            onSelectLead({
                              id: 'demo',
                              name: 'Sua Empresa Demonstração',
                              niche: 'Gastronomia & Serviços',
                              city: 'São Paulo',
                              googleMapsUrl: 'https://maps.google.com'
                            });
                          }
                          setIsCompanySelectorOpen(false);
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 text-left transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                            ✨
                          </div>
                          <div>
                            <strong className="text-xs font-bold text-slate-800 block">Sua Empresa Demonstração</strong>
                            <span className="text-[10px] text-slate-500">Modelo genérico para apresentação</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition">
                          Selecionar
                        </span>
                      </button>

                      {filteredLeads.map((l) => {
                        const isCurrent = (leadId === l.id) || (businessName === l.name);
                        return (
                          <div
                            key={l.id}
                            className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between gap-2 ${
                              isCurrent
                                ? 'bg-blue-50 border border-blue-200'
                                : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectLead) onSelectLead(l);
                                setIsCompanySelectorOpen(false);
                              }}
                              className="flex items-center gap-2.5 truncate flex-1 text-left cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
                                {(l.name.charAt(0) || 'E').toUpperCase()}
                              </div>
                              <div className="truncate">
                                <strong className="text-xs font-bold text-slate-900 block truncate">{l.name}</strong>
                                <span className="text-[10px] text-slate-500 truncate block">
                                  {l.niche || 'Negócio'} • {l.city || 'Local'}
                                </span>
                              </div>
                            </button>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Print status badge with 1-click toggle */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTogglePlaquePrinted?.(l.id, l.isPlaquePrinted);
                                }}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition cursor-pointer flex items-center gap-1 border ${
                                  l.isPlaquePrinted
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                }`}
                                title={l.isPlaquePrinted ? 'Placa impressa. Clique para desmarcar' : 'Placa pendente. Clique para marcar como impressa'}
                              >
                                <Printer className="w-2.5 h-2.5" />
                                <span>{l.isPlaquePrinted ? 'Impressa' : 'Pendente'}</span>
                              </button>

                              {isCurrent ? (
                                <span className="text-[10px] font-black text-blue-600 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                                  Ativa
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onSelectLead) onSelectLead(l);
                                    setIsCompanySelectorOpen(false);
                                  }}
                                  className="text-[10px] font-bold text-slate-400 hover:text-blue-600 cursor-pointer"
                                >
                                  Escolher
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {filteredLeads.length === 0 && (
                        <p className="text-center py-4 text-xs text-slate-400">
                          Nenhuma empresa encontrada{companySearchTerm ? ` com "${companySearchTerm}"` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Botão de Domínio Próprio */}
            {onOpenCustomDomain && (
              <button
                type="button"
                onClick={onOpenCustomDomain}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                title="Configurar domínio próprio para as placas NFC e QR codes"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Domínio Próprio</span>
              </button>
            )}

            {/* Botão para ver/abrir o Mini Site */}
            {onNavigateToMiniSite && (
              <button
                type="button"
                onClick={() => onNavigateToMiniSite(leadId)}
                className="px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                title="Abrir o Mini Site Interativo com link exportável desta empresa"
              >
                <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                <span>Mini Site Desta Empresa</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Customization Controls & NFC Programming */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Theme Selector */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Acabamento &amp; Material do Totem
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(themeStyles) as TotemTheme[]).map((tKey) => {
                const isSelected = theme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => setTheme(tKey)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                        {themeStyles[tKey].name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
              <span className="font-semibold">Inclinação do Display:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setStandAngle('slanted')}
                  className={`px-3 py-1 text-[11px] rounded-lg border font-bold ${
                    standAngle === 'slanted' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Angulado 15° (Balcão)
                </button>
                <button
                  onClick={() => setStandAngle('straight')}
                  className={`px-3 py-1 text-[11px] rounded-lg border font-bold ${
                    standAngle === 'straight' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Vertical Reto
                </button>
              </div>
            </div>
          </div>

          {/* Business Customization */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Dados Gravados na Placa
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome Fantasia na Placa</label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900">
                  {businessName || 'Empresa Exemplo'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Link de Redirecionamento NFC Inteligente</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={nfcRedirectUrl}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-600"
                  />
                  <button
                    onClick={handleCopyNfc}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  🛡️ Roteador dinâmico: Permite alterar o destino do chip a qualquer momento sem trocar a placa física!
                </span>
              </div>

              {/* Destino do Toque NFC */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Destino ao Aproximar Celular (NFC / QR)</span>
                  <span className="text-[10px] text-blue-600 font-bold">1-Clique</span>
                </label>

                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => onUpdateRedirectTarget && onUpdateRedirectTarget('gmb')}
                    className={`p-2 rounded-xl border text-left text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      nfcRedirectActive === 'gmb' || !nfcRedirectActive
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                    <span className="truncate">Google Reviews</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateRedirectTarget && onUpdateRedirectTarget('minisite')}
                    className={`p-2 rounded-xl border text-left text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      nfcRedirectActive === 'minisite'
                        ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="truncate">✨ Mini Site Hub</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateRedirectTarget) onUpdateRedirectTarget('instagram');
                      setTheme('instagram_dual');
                    }}
                    className={`p-2 rounded-xl border text-left text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      nfcRedirectActive === 'instagram'
                        ? 'bg-pink-50 border-pink-300 text-pink-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span className="truncate">Instagram Oficial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateRedirectTarget && onUpdateRedirectTarget('whatsapp')}
                    className={`p-2 rounded-xl border text-left text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      nfcRedirectActive === 'whatsapp'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">WhatsApp Direto</span>
                  </button>
                </div>

                {nfcRedirectActive === 'minisite' && onNavigateToMiniSite && (
                  <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-2 mt-2">
                    <span className="text-[11px] text-sky-800 font-semibold">
                      Mini Site configurado com Pix, Wi-Fi, WhatsApp e Avaliação.
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigateToMiniSite(leadId)}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shrink-0 transition"
                    >
                      Ver / Editar
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>📸 Link / Perfil do Instagram (@empresa)</span>
                  <span className="text-[9px] bg-pink-50 text-pink-600 font-extrabold px-1.5 py-0.5 rounded border border-pink-200 uppercase">Modelo da Foto</span>
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customInstaUrl}
                    onChange={(e) => {
                      setCustomInstaUrl(e.target.value);
                      if (theme !== 'instagram_dual') setTheme('instagram_dual');
                    }}
                    placeholder="Ex: https://instagram.com/sua_empresa"
                    className="flex-1 bg-white border border-pink-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setTheme('instagram_dual')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
                      theme === 'instagram_dual'
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100'
                    }`}
                  >
                    <span>{theme === 'instagram_dual' ? 'Ativo' : 'Ver Placa da Foto'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Ativa a placa híbrida da foto (Instagram em cima com onda orgânica + Google embaixo).
                </p>
              </div>
            </div>

            {/* Quick Pitch Guide */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs uppercase">
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                Script de Venda Pronta para o Dono
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                "Esta placa acrílica de luxo com chip NFC fica no balcão de pagamento. Enquanto o cliente passa o cartão, ele só aproxima o celular ou aponta a câmera para o QR Code. Em 3 segundos a avaliação de 5 estrelas é postada no seu Google Meu Negócio, subindo você na frente dos concorrentes de {city || 'sua cidade'}!"
              </p>
            </div>

            {/* Export and Print Buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => setIsArtworkModalOpen(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-98 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Abrir estúdio com download da arte da Placa 10x10cm e Cartão NFC 5.4x8.5cm em altíssima resolução 600 DPI"
              >
                <Sparkles className="w-4 h-4 text-cyan-200 fill-cyan-300" />
                <span>Baixar Artes da Placa & Cartão NFC (600 DPI Ultra-HD)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleQuickDownloadPlate}
                  disabled={isDownloadingPlateArt}
                  className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  title="Baixar imagem em PNG alta definição da Placa de Mesa 10x10 cm"
                >
                  {isDownloadingPlateArt ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span>Placa 10x10 HD</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickDownloadCard}
                  disabled={isDownloadingCardArt}
                  className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  title="Baixar imagem em PNG alta definição do Cartão NFC 5.4x8.5 cm (Formato CR80)"
                >
                  {isDownloadingCardArt ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Cartão 5.4x8.5 HD</span>
                </button>
              </div>

              {artDownloadSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{artDownloadSuccess}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {onDownloadQr && (
                  <button
                    onClick={onDownloadQr}
                    disabled={isDownloadingQr}
                    className="flex-1 py-2 px-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>QR Code Isolado</span>
                  </button>
                )}
                {onPrintPlate && (
                  <button
                    onClick={() => onPrintPlate(mapTotemToArtworkTheme(theme))}
                    className="flex-1 py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-slate-600" />
                    <span>Gabarito Impressão</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right: 3D Photorealistic Acrylic Totem Display & Phone Simulation */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-radial from-slate-900 via-slate-950 to-neutral-950 p-6 md:p-10 rounded-3xl border border-slate-800 relative overflow-hidden shadow-2xl min-h-[620px]">
          
          {/* Ambient Lighting & Desk Backdrop Texture */}
          <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Interactive Simulation Status Overlay */}
          <div className="w-full flex items-center justify-between z-10 mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-slate-300">
                {isTappingPhone
                  ? tapStage === 'approaching'
                    ? '📱 Celular se aproximando da placa...'
                    : tapStage === 'contact' || tapStage === 'detected'
                    ? '⚡ NFC Conectado! Lendo chip 13.56 MHz...'
                    : '🎉 Avaliação Google Aberta com 5 Estrelas!'
                  : 'Passe o mouse para girar o acrílico em 3D'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isTappingPhone && (
                <button
                  onClick={resetSimulation}
                  className="text-[11px] font-bold text-slate-400 hover:text-white px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reiniciar
                </button>
              )}
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                Visualização 3D Real
              </span>
            </div>
          </div>

          {/* 3D Scene Container */}
          <div className="relative w-full flex items-center justify-center py-6 perspective-1000">
            
            {/* The Acrylic Totem Card */}
            <div
              ref={totemRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${standAngle === 'slanted' ? tiltStyle.rotateX + 6 : tiltStyle.rotateX}deg) rotateY(${tiltStyle.rotateY}deg)`,
                transition: isTappingPhone ? 'all 0.5s ease-out' : 'transform 0.1s ease-out',
              }}
              className={`relative w-[310px] sm:w-[330px] rounded-3xl p-6 transition-all select-none border-2 ${currentTheme.plateBg} ${currentTheme.border} ${currentTheme.baseGlow} print-container`}
            >
              
              {/* Glossy Acrylic Bevel & Reflection Streak */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden opacity-25 z-30"
                style={{
                  background: `linear-gradient(${tiltStyle.glossX + 45}deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)`,
                }}
              />

              {theme === 'instagram_official' ? (
                /* MODELO 100% EXCLUSIVO INSTAGRAM OFICIAL */
                <div className="flex flex-col h-full rounded-2xl overflow-hidden relative bg-white">
                  {/* METALLIC STANDOFF BOLTS */}
                  <div className="absolute top-1.5 left-1.5 w-3 h-3 rounded-full bg-gradient-to-tr from-slate-400 via-white to-slate-300 border border-slate-400 shadow-xs z-30 flex items-center justify-center">
                    <div className="w-1.5 h-0.5 bg-slate-500"></div>
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-gradient-to-tr from-slate-400 via-white to-slate-300 border border-slate-400 shadow-xs z-30 flex items-center justify-center">
                    <div className="w-1.5 h-0.5 bg-slate-500"></div>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 w-3 h-3 rounded-full bg-gradient-to-tr from-slate-400 via-white to-slate-300 border border-slate-400 shadow-xs z-30 flex items-center justify-center">
                    <div className="w-1.5 h-0.5 bg-slate-500"></div>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full bg-gradient-to-tr from-slate-400 via-white to-slate-300 border border-slate-400 shadow-xs z-30 flex items-center justify-center">
                    <div className="w-1.5 h-0.5 bg-slate-500"></div>
                  </div>

                  {/* TOP HALF: VIBRANT INSTAGRAM SUNSET GRADIENT */}
                  <div className="bg-gradient-to-tr from-[#405de6] via-[#833ab4] via-[#e1306c] to-[#f77737] p-3 pt-3.5 pb-4 text-white text-center relative z-10 shadow-inner">
                    {/* Official Instagram Badge */}
                    <div className="flex justify-center mb-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ffd600] via-[#ff0069] to-[#7638fa] p-0.5 shadow-lg border border-white/60 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-lg border-2 border-white flex items-center justify-center relative">
                          <div className="w-3.5 h-3.5 rounded-full border-1.5 border-white"></div>
                          <div className="w-1 h-1 rounded-full bg-white absolute top-1 right-1"></div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] font-black tracking-wide text-white drop-shadow-md uppercase leading-tight">
                      Siga-nos no Instagram
                    </p>
                    <p className="text-[8px] font-extrabold text-white/90 uppercase tracking-widest mt-0.5 truncate">
                      {businessName || 'SUA EMPRESA'}
                    </p>

                    {/* Pill Handle Badge */}
                    <div className="mt-1.5 inline-flex items-center gap-1 bg-black/40 border border-amber-300/80 px-2.5 py-0.5 rounded-full shadow-sm max-w-[90%]">
                      <span className="text-[7.5px] font-bold text-amber-300 truncate">
                        @{((customInstaUrl || instagramUrl || businessName || 'perfil').replace(/.*instagram\.com\//, '').replace(/^@/, '').replace(/\/$/, ''))}
                      </span>
                    </div>
                  </div>

                  {/* WAVY SEPARATOR RIBBON */}
                  <div className="relative -my-1.5 z-20 w-full overflow-hidden leading-none">
                    <div className="h-2 bg-gradient-to-r from-[#ffd600] via-[#ff0069] to-[#7638fa] shadow-xs"></div>
                  </div>

                  {/* BOTTOM WHITE ACRYLIC SECTION (NFC + OU + QR CODE) */}
                  <div className="bg-white p-3 pt-3 text-slate-800 text-center flex-1 flex flex-col justify-between relative">
                    <div className="grid grid-cols-12 gap-1 items-center my-auto">
                      {/* NFC Phone */}
                      <div className="col-span-5 flex flex-col items-center">
                        <span className="text-[7px] font-black uppercase text-slate-800 tracking-tight mb-1">
                          Aproxime seu celular
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-2xs">
                          <Radio className="w-5 h-5 text-pink-600 animate-pulse" />
                        </div>
                        <span className="text-[6px] font-semibold text-slate-500 mt-1">
                          Sem aplicativo
                        </span>
                      </div>

                      {/* Center OU */}
                      <div className="col-span-2 flex flex-col items-center justify-center">
                        <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-[7px] font-black text-slate-600 flex items-center justify-center shadow-2xs">
                          OU
                        </span>
                      </div>

                      {/* Instagram QR Code */}
                      <div className="col-span-5 flex flex-col items-center">
                        <span className="text-[7px] font-black uppercase text-slate-800 tracking-tight mb-1">
                          Aponte a câmera
                        </span>
                        <div className="p-1 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                              customInstaUrl || instagramUrl || `https://instagram.com/${businessName.replace(/\s+/g, '').toLowerCase()}`
                            )}`}
                            alt="Instagram QR"
                            className="w-10 h-10 object-contain rounded-xs"
                          />
                        </div>
                        <span className="text-[6px] font-semibold text-slate-500 mt-1">
                          ⚡ Em 3 segundos
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[6.5px] font-mono text-slate-400">
                      <span>CHIP NFC • ID: {leadId ? leadId.substring(0, 6).toUpperCase() : 'INSTA01'}</span>
                      <span>ALF AUTOMAÇÃO</span>
                    </div>
                  </div>
                </div>
              ) : theme === 'instagram_dual' ? (
                /* MODELO REAL DA FOTO: INSTAGRAM (TOPO) + ONDA ORGÂNICA + GOOGLE (BASE) */
                <div className="flex flex-col h-full rounded-2xl overflow-hidden relative">
                  {/* METALLIC STANDOFF BOLTS */}
                  <div className="absolute top-1.5 left-1.5 w-3 h-3 rounded-full bg-gradient-to-tr from-slate-400 via-white to-slate-300 border border-slate-400 shadow-xs z-30 flex items-center justify-center">
                    <div className="w-1.5 h-0.5 bg-slate-500"></div>
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-gradient-to-tr from-slate-400 via-white to-slate-300 border border-slate-400 shadow-xs z-30 flex items-center justify-center">
                    <div className="w-1.5 h-0.5 bg-slate-500"></div>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 w-3 h-3 rounded-full bg-gradient-to-tr from-slate-400 via-white to-slate-300 border border-slate-400 shadow-xs z-30 flex items-center justify-center">
                    <div className="w-1.5 h-0.5 bg-slate-500"></div>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full bg-gradient-to-tr from-slate-400 via-white to-slate-300 border border-slate-400 shadow-xs z-30 flex items-center justify-center">
                    <div className="w-1.5 h-0.5 bg-slate-500"></div>
                  </div>

                  {/* TOP HALF: INSTAGRAM SECTION */}
                  <div className="bg-gradient-to-r from-[#75187e] via-[#c52e77] via-[#e34157] to-[#f75f3a] p-3 pt-3.5 pb-4 text-white text-center relative z-10">
                    <div className="flex items-center justify-between gap-1 px-1">
                      {/* Left: Instagram QR */}
                      <div className="flex flex-col items-center">
                        <span className="text-[7.5px] font-bold text-white/95 mb-0.5">leia o QR Code</span>
                        <div className="p-1 rounded-lg bg-white/20 border border-white/40 shadow-xs">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                              qrTargetMode === 'dynamic_cloud' && leadId
                                ? getDynamicInstagramUrl(leadId)
                                : (customInstaUrl || instagramUrl || `https://instagram.com/${businessName.replace(/\s+/g, '').toLowerCase()}`)
                            )}`}
                            alt="Instagram QR"
                            className="w-10 h-10 object-contain rounded-xs"
                          />
                        </div>
                        <span className="text-[6.5px] font-mono font-bold text-white/80 mt-0.5">
                          {leadId ? leadId.substring(0, 6).toLowerCase() : 'z1v9ef'}
                        </span>
                      </div>

                      {/* Center: Instagram Camera Glyph */}
                      <div className="flex flex-col items-center justify-center px-1">
                        <div className="w-10 h-10 rounded-xl border-2 border-white flex items-center justify-center relative shadow-sm">
                          <div className="w-4.5 h-4.5 rounded-full border-2 border-white"></div>
                          <div className="w-1 h-1 rounded-full bg-white absolute top-1.5 right-1.5"></div>
                        </div>
                      </div>

                      {/* Right: Phone with NFC */}
                      <div className="flex flex-col items-center">
                        <span className="text-[6.5px] font-bold text-white/95 mb-0.5">Aproxime seu Telefone</span>
                        <div className="p-1 rounded-xl bg-white/10 border border-white/30 flex items-center gap-1 shadow-xs">
                          <div className="text-white">
                            <Radio className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="w-5.5 h-9 rounded-sm border border-white bg-white/10 flex flex-col items-center justify-center relative">
                            <span className="text-[6px] font-black text-white">NFC</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-center">
                      <p className="text-[10px] font-black tracking-wide text-white drop-shadow-sm uppercase">
                        Siga-nos no Instagram
                      </p>
                      {customInstaUrl || instagramUrl ? (
                        <p className="text-[8px] font-bold text-amber-200 truncate">
                          @{(customInstaUrl || instagramUrl || '').replace(/.*instagram\.com\//, '').replace(/\/$/, '')}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* ORGANIC WHITE WAVE SEPARATOR */}
                  <div className="relative -my-2 z-20 w-full overflow-hidden leading-none">
                    <svg viewBox="0 0 500 36" preserveAspectRatio="none" className="w-full h-4.5 text-white fill-current drop-shadow-md">
                      <path d="M0,14 C140,32 360,-4 500,18 L500,36 L0,36 Z"></path>
                    </svg>
                  </div>

                  {/* BOTTOM HALF: GOOGLE REVIEWS SECTION */}
                  <div className="bg-gradient-to-b from-[#0c3a82] via-[#1052ab] to-[#0a3272] p-3 pt-3 pb-3.5 text-white text-center relative z-10 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-white drop-shadow-sm">
                        Sua opinião Importa
                      </p>
                      <div className="flex justify-center gap-1 my-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1 my-1 px-1">
                      {/* Left: Phone with NFC */}
                      <div className="flex flex-col items-center">
                        <span className="text-[6.5px] font-bold text-white/95 mb-0.5">Aproxime seu Telefone</span>
                        <div className="p-1 rounded-xl bg-white/10 border border-white/30 flex items-center gap-1 shadow-xs">
                          <div className="text-white">
                            <Radio className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="w-5.5 h-9 rounded-sm border border-white bg-white/10 flex flex-col items-center justify-center relative">
                            <span className="text-[6px] font-black text-white">NFC</span>
                          </div>
                        </div>
                      </div>

                      {/* Center: Google G Logo Badge */}
                      <div className="w-10 h-10 rounded-full bg-white shadow-xl border-2 border-slate-200 flex items-center justify-center shrink-0 ring-2 ring-white/70">
                        <svg className="w-5.5 h-5.5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                      </div>

                      {/* Right: Google Reviews QR */}
                      <div className="flex flex-col items-center">
                        <span className="text-[7.5px] font-bold text-white/95 mb-0.5">leia o QR Code</span>
                        <div className="p-1 rounded-lg bg-white/20 border border-white/40 shadow-xs">
                          <img
                            src={
                              qrTargetMode === 'dynamic_cloud' && leadId
                                ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getDynamicGoogleUrl(leadId))}`
                                : effectiveQrUrl
                            }
                            alt="Google QR"
                            className="w-10 h-10 object-contain rounded-xs"
                          />
                        </div>
                        <span className="text-[6.5px] font-mono font-bold text-white/80 mt-0.5">
                          {leadId ? leadId.substring(Math.max(0, leadId.length - 6)).toLowerCase() : 'w3d7ul'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-white/20 flex items-center justify-between text-[6.5px] font-mono text-white/70">
                      <span className="font-bold flex items-center gap-1">
                        <span className="bg-white/20 px-1 py-0.5 rounded border border-white/30 text-white font-mono">
                          {plateInfo.roman ? `Nº ${plateInfo.roman}` : (plateInfo.numStr ? `Nº ${plateInfo.numStr}` : 'PLACA')}
                        </span>
                        <span>• CHIP NTAG215</span>
                      </span>
                      <span>ALF AUTOMAÇÃO</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* STANDARD SINGLE THEME TOTEM LAYOUT */
                <>
                  {/* TOP THEMED SECTION */}
                  <div className={`${(currentTheme as any).headerBg || 'bg-black'} text-white pt-4 pb-6 px-4 rounded-t-3xl text-center relative z-10 transition-colors duration-300`}>
                    {/* 5 Golden Spaced Realistic Stars */}
                    <div className="flex justify-center gap-2.5 mb-2.5 stars-row" data-element="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-md animate-pulse"
                          style={{ animationDelay: `${i * 120}ms` }}
                        />
                      ))}
                    </div>

                    {/* Headline Typography */}
                    <p className="text-[9px] font-black uppercase tracking-[-0.02em] text-slate-300 leading-snug">
                      NÓS ADORARÍAMOS A SUA
                    </p>
                    <p className="text-[11px] font-black uppercase tracking-[-0.02em] text-white leading-snug mb-1">
                      AVALIAÇÃO NO GOOGLE
                    </p>

                    {/* HERO CLIENT TAG (BEM MAIOR E ALINHADO COM A PLACA - SEM COLISÃO) */}
                    <div className="my-1.5 company-name" data-element="company-name">
                      <span className="text-sm sm:text-base font-black text-amber-400 uppercase tracking-[-0.025em] leading-normal drop-shadow-sm line-clamp-1 border-b border-amber-400/50 pb-0.5 inline-block max-w-[95%]">
                        {businessName ? businessName : 'DANI PONTELLO'}
                      </span>
                    </div>
                    <p className="text-[8px] font-medium text-slate-300/80 mt-1 subtitle tracking-[-0.015em] leading-normal">
                      Sua opinião de 5 estrelas é muito importante para nós!
                    </p>
                  </div>

                  {/* THEMED NEON WAVE RIBBON & CENTER "G" EMBLEM */}
                  <div className="relative h-7 w-full -my-3.5 z-20 flex items-center justify-center">
                    {/* Neon Glowing Ribbon Background */}
                    <div className={`absolute inset-x-0 h-3.5 ${(currentTheme as any).ribbonBg || 'bg-gradient-to-r from-[#EA4335] via-[#FBBC05] via-[#34A853] to-[#4285F4]'} shadow-lg ${(currentTheme as any).ribbonGlow || 'shadow-blue-500/30'} transform -skew-y-1 border-t border-white/60 transition-all duration-300`}></div>

                    {/* Center Google "G" Badge with Metallic Bevel Rim */}
                    <div className="relative w-12 h-12 rounded-full bg-white shadow-2xl border-2 border-slate-200 flex items-center justify-center shrink-0 ring-4 ring-slate-100/80">
                      <svg className="w-6.5 h-6.5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    </div>
                  </div>

                  {/* BOTTOM WHITE SECTION: TWO COLUMNS (NFC | OU | QR CODE) */}
                  <div className="bg-white text-slate-900 pt-7 pb-4 px-3 rounded-b-3xl relative z-10 shadow-inner">
                    {/* Contactless waves animation when phone taps */}
                    {isTappingPhone && (tapStage === 'contact' || tapStage === 'detected') && (
                      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
                        <div className="w-20 h-20 rounded-full border-4 border-blue-500 animate-ping opacity-80"></div>
                        <div className="w-28 h-28 rounded-full border-2 border-amber-400 animate-ping opacity-50" style={{ animationDelay: '150ms' }}></div>
                      </div>
                    )}

                    <div className="grid grid-cols-12 gap-1 items-center">
                      {/* Left Column: Official Contactless NFC Touch Illustration */}
                      <div className="col-span-5 text-center flex flex-col items-center">
                        <span className="text-[9px] font-black uppercase text-slate-800 tracking-tight mb-1">
                          Aproxime seu celular
                        </span>

                        {/* Official Clean Contactless Phone Graphic */}
                        <div className={`px-2.5 py-2 rounded-2xl border-2 border-slate-200 bg-slate-50 transition-transform flex items-center justify-center gap-2 ${isTappingPhone && tapStage === 'contact' ? 'scale-110 ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                          {/* Contactless Waves */}
                          <div className="flex items-center text-blue-600">
                            <Radio className="w-4 h-4 text-blue-600" />
                          </div>
                          {/* Smartphone body */}
                          <div className="w-8 h-12 rounded-lg border-2 border-slate-900 bg-white flex flex-col items-center justify-between py-1 shadow-xs relative">
                            {/* Top speaker notch */}
                            <div className="w-3.5 h-0.5 bg-slate-900 rounded-full"></div>
                            {/* Centered NFC symbol */}
                            <div className="flex flex-col items-center justify-center -my-0.5">
                              <span className="text-[8px] font-black text-slate-900 tracking-wider">NFC</span>
                            </div>
                            {/* Bottom home bar */}
                            <div className="w-3.5 h-0.5 bg-slate-400 rounded-full"></div>
                          </div>
                        </div>

                        <span className="text-[7.5px] font-bold text-slate-500 mt-1">
                          Sem aplicativo
                        </span>
                      </div>

                      {/* Center Column: OU */}
                      <div className="col-span-2 text-center">
                        <span className="text-xs font-black text-slate-900 uppercase">
                          OU
                        </span>
                      </div>

                      {/* Right Column: QR Code with Bracket Accents */}
                      <div className="col-span-5 text-center flex flex-col items-center">
                        <div className="relative p-1 bg-white border border-slate-300 rounded-lg shadow-sm">
                          <img
                            src={effectiveQrUrl}
                            alt="QR Code"
                            className="w-16 h-16 sm:w-18 sm:h-18 object-contain"
                          />
                        </div>

                        <span className="text-[8px] font-black text-slate-800 tracking-tight mt-1">
                          Aponte a câmera
                        </span>
                        <span className="text-[7px] text-slate-500 font-semibold">
                          ⚡ 3 segundos
                        </span>
                      </div>
                    </div>

                    {/* Footer security chip metadata */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[7px] font-mono text-slate-400 px-1">
                      <span className="font-bold text-slate-600 flex items-center gap-1">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-mono">
                          {plateInfo.roman ? `Nº ${plateInfo.roman}` : (plateInfo.numStr ? `Nº ${plateInfo.numStr}` : 'PLACA')}
                        </span>
                        <span>• NFC ID: {leadId.substring(0, 8).toUpperCase()}</span>
                      </span>
                      <span>ALF AUTOMAÇÃO</span>
                    </div>
                  </div>
                </>
              )}

              {/* Discrete lower-left watermark of plate number */}
              {plateInfo.roman && (
                <div className="absolute bottom-2 left-2 z-20 pointer-events-none opacity-40 hover:opacity-100 transition">
                  <span className="text-[6.5px] font-mono font-bold text-slate-400">
                    Nº {plateInfo.roman}
                  </span>
                </div>
              )}
            </div>

            {/* Acrylic Base Pedestal (Suporte Físico de Balcão) */}
            <div
              className={`absolute -bottom-4 w-[280px] h-6 rounded-b-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 border-t border-white/20 shadow-2xl ${
                standAngle === 'slanted' ? 'skew-x-6' : ''
              }`}
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 5px 15px rgba(0,0,0,0.5)',
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-1 bg-white/20 rounded-full"></div>
              </div>
            </div>

            {/* INTERACTIVE 3D SMARTPHONE OVERLAY FOR NFC TAP SIMULATION */}
            {isTappingPhone && (
              <div
                style={{
                  transform:
                    tapStage === 'approaching'
                      ? 'translate(60px, -180px) rotate(-18deg) scale(0.95)'
                      : tapStage === 'contact' || tapStage === 'detected'
                      ? 'translate(20px, -60px) rotate(-8deg) scale(1)'
                      : 'translate(10px, 0px) rotate(0deg) scale(1.05)',
                  transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  zIndex: 40,
                }}
                className="absolute top-4 right-2 sm:right-6 w-[230px] sm:w-[250px] bg-slate-900 border-4 border-slate-700 rounded-[36px] shadow-2xl p-3 text-white overflow-hidden"
              >
                {/* Phone Speaker Notch / Dynamic Island */}
                <div className="w-20 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500/50"></div>
                </div>

                {/* Notification Dropdown on Tap Contact */}
                {(tapStage === 'contact' || tapStage === 'detected') && (
                  <div className="animate-bounce bg-white/95 text-slate-900 rounded-2xl p-3 shadow-xl mb-3 border border-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <Radio className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-black uppercase text-blue-700 block">Tag NFC Detectada</span>
                        <p className="text-[10px] font-bold text-slate-800 line-clamp-1">Google Avaliações</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Google Review Screen inside phone when opened */}
                {tapStage === 'review_open' && (
                  <div className="bg-white text-slate-900 rounded-2xl p-3 space-y-2.5 text-center shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-[10px] font-black text-slate-800">Google Reviews</span>
                      </div>
                      <span className="text-[9px] text-emerald-600 font-black">Online</span>
                    </div>

                    <div className="space-y-0.5">
                      <h5 className="text-[11px] font-black text-slate-900 line-clamp-1">{businessName}</h5>
                      <p className="text-[9px] text-slate-500">Deixe sua nota para este estabelecimento</p>
                    </div>

                    {/* Interactive 5 Star selection */}
                    <div className="flex justify-center gap-1 py-1">
                      {[1, 2, 3, 4, 5].map((starNum) => (
                        <button
                          key={starNum}
                          onClick={() => setSelectedStars(starNum)}
                          className="cursor-pointer transition-transform hover:scale-125"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              starNum <= selectedStars
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    {reviewSubmitted ? (
                      <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Avaliação 5★ Postada com Sucesso!</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewSubmitted(true)}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-sm cursor-pointer"
                      >
                        Publicar Avaliação
                      </button>
                    )}

                    <div className="pt-1 text-[8px] text-slate-400">
                      ⚡ Redirecionado instantaneamente via chip NFC
                    </div>
                  </div>
                )}

                {/* Simulated Home Bar */}
                <div className="w-24 h-1 bg-white/40 rounded-full mx-auto mt-3"></div>
              </div>
            )}

          </div>

          {/* Interactive Instructions Footer */}
          <div className="z-10 mt-8 text-center max-w-md">
            <p className="text-xs text-slate-400">
              💡 <strong>Dica de Fechamento de Venda:</strong> Demonstre essa animação na reunião com o cliente ou envie um vídeo/print pelo WhatsApp. Nenhum empresário resiste a ver sua marca estampada em um totem com aproximação celular instantânea!
            </p>
          </div>

        </div>

      </div>

      {/* Artwork High-Definition Download Modal */}
      <NfcArtworkDownloadModal
        isOpen={isArtworkModalOpen}
        onClose={() => setIsArtworkModalOpen(false)}
        lead={{
          id: leadId,
          name: businessName,
          niche,
          city,
          stage: 'won',
          address: '',
          phone: '',
          rating: 5.0,
          reviewCount: 0,
          hasWebsite: false,
          websiteUrl: '',
          googleMapsUrl: reviewLink,
          weakness: '',
          nfcInstagramUrl: customInstaUrl || instagramUrl || ''
        }}
        leads={leads as any}
        onSelectDifferentLead={(l) => {
          if (onSelectLead) onSelectLead(l as any);
        }}
        initialTheme={mapTotemToArtworkTheme(theme)}
      />
    </div>
  );
};
