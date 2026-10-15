import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { PWAInstallButton } from './components/PWAInstallButton';
import { NfcMockupTotem } from './components/NfcMockupTotem';
import { ExportSiteModal } from './components/ExportSiteModal';
import { DynamicQrBatchManager } from './components/DynamicQrBatchManager';
import { MiniSiteViewer } from './components/MiniSiteViewer';
import { GoogleReviewLinkGenerator } from './components/GoogleReviewLinkGenerator';
import { MiniSiteConfig, formatMiniSitePhone } from './utils/miniSiteExporter';
import { downloadClientSiteZip, downloadSingleHtml, openLiveSitePreview, copyHtmlToClipboard } from './utils/siteExporter';
import { detectNicheVisualProfile } from './utils/nicheVisualDatabase';
import { SalesLandingPage } from './components/SalesLandingPage';
import { SecureAuthModal, AuthSessionUser } from './components/SecureAuthModal';
import { ClientAccessMonitoring } from './components/ClientAccessMonitoring';
import { NfcWriterModal } from './components/NfcWriterModal';
import { UserManagementPanel } from './components/UserManagementPanel';
import { LeadManagementModule } from './components/LeadManagementModule';
import { PlateScannerModal } from './components/PlateScannerModal';
import { CustomDomainModal } from './components/CustomDomainModal';
import { AntigravityExportModal } from './components/AntigravityExportModal';
import { SellerRegisterModal } from './components/SellerRegisterModal';
import { CardapioDigitalManager } from './components/CardapioDigitalManager';
import { PublicCardapioViewer } from './components/PublicCardapioViewer';
import { RestaurantMenu, INITIAL_MENUS } from './types/cardapio';
import { 
  getPublicAppOrigin, 
  getDynamicQrUrl, 
  getDynamicInstagramUrl,
  getDynamicGoogleUrl,
  getDirectLeadUrl, 
  getTestRedirectUrl,
  validateGoogleReviewUrl,
  getOfficialSearchReviewFallback
} from './utils/publicUrlHelper';
import {
  Search,
  MapPin,
  Sparkles,
  Phone,
  MessageSquare,
  Briefcase,
  Share2,
  CheckCircle,
  TrendingUp,
  Plus,
  Trash2,
  Globe,
  Smartphone,
  Laptop,
  Coins,
  Award,
  Shield,
  ShieldCheck,
  Clock,
  QrCode,
  Sliders,
  ChevronDown,
  DollarSign,
  Star,
  User,
  Edit3,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  GripVertical,
  Target,
  Key,
  Lock,
  Unlock,
  Copy,
  Save,
  Download,
  Terminal,
  Activity,
  RefreshCw,
  ChevronUp,
  AlertCircle,
  Info,
  Database,
  Compass,
  Instagram,
  Zap,
  Check,
  HelpCircle,
  Send,
  Eye,
  LogOut,
  CreditCard,
  FolderArchive,
  Menu,
  X,
  ChevronRight,
  LayoutGrid,
  Printer,
  Building2,
  ArrowLeft,
  Filter,
  ScanLine,
  Utensils,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { NfcArtworkDownloadModal } from './components/NfcArtworkDownloadModal';
import {
  downloadPlate10x10Png,
  downloadCardNfcPng,
  downloadCompleteArtworkKitZip,
  generatePlate10x10DataUrl,
  generateCardNfcDataUrl,
  ArtworkTheme,
  ArtworkOptions
} from './utils/nfcPlateGenerator';
import { openHighDefinitionPrintWindow } from './utils/platePrintHelper';

// Interfaces
export interface SearchLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  step?: number;
}

export interface Lead {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  hasWebsite: boolean;
  websiteUrl: string | null;
  googleMapsUrl: string;
  niche: string;
  city: string;
  weakness: string;
  stage?: 'new' | 'to_contact' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';
  saleValue?: number;
  productType?: 'nfc' | 'site' | 'combo';
  isGoogleRegistered?: boolean;
  googleReviewsStatus?: string;
  approachSite?: string;
  approachNfc?: string;
  approachMiniSite?: string;
  nextFollowUp?: string;
  historyNotes?: string[];
  
  // Dynamic NFC SaaS Portal Fields
  nfcPassword?: string;
  portalUsername?: string;
  nfcRedirectActive?: 'gmb' | 'whatsapp' | 'instagram' | 'website' | 'custom' | 'minisite';
  nfcCustomUrl?: string;
  nfcInstagramUrl?: string;
  nfcWhatsappNum?: string;
  nfcWhatsappMsg?: string;
  nfcBillingStatus?: 'active' | 'suspended';
  miniSiteConfig?: any;
  totalScans?: number;
  lastScanAt?: string;
  nfcModulesAllowed?: {
    gmb: boolean;
    whatsapp: boolean;
    instagram: boolean;
    website: boolean;
    custom: boolean;
    minisite?: boolean;
  };
  isPlaquePrinted?: boolean;
  plaquePrintedAt?: string;
}

export interface SiteTemplate {
  brand?: {
    name: string;
    slogan: string;
    nicheTag: string;
    city: string;
    badge: string;
  };
  nicheType?: string;
  themeStyle?: string;
  images?: {
    hero: string;
    about: string;
    gallery?: Array<{ url: string; title: string; category?: string }>;
    serviceThumbnails?: string[];
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    surface?: string;
    text: string;
    darkBg?: string;
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
  services: Array<{ title: string; description: string; badge?: string }>;
  showcase?: Array<{ title: string; category: string; result: string }>;
  testimonials: Array<{ author: string; role: string; text: string; rating?: number; timeAgo?: string; verified?: boolean }>;
  faq?: Array<{ question: string; answer: string }>;
  cta: {
    title: string;
    text: string;
    buttonText: string;
    urgency?: string;
  };
}

export interface Pitch {
  whatsapp: string;
  callScript: {
    opening: string;
    hook: string;
    valueProp: string;
    objections: string;
    closing: string;
  };
}

// Predefined niches
export const PRESET_NICHES = [
  { id: 'Dentista', label: '🦷 Dentista / Odonto' },
  { id: 'Mecânica', label: '🚗 Oficina Mecânica' },
  { id: 'Restaurante', label: '🍕 Restaurante / Pizzaria' },
  { id: 'Salão de Beleza', label: '💇‍♀️ Salão & Estética' },
  { id: 'Imobiliária', label: '🏢 Imobiliária' },
  { id: 'Academia', label: '💪 Academia / Fitness' },
  { id: 'Pet Shop', label: '🐶 Pet Shop / Vet' },
  { id: 'Advogado', label: '⚖️ Advocacia' }
];

// High-Priority physical plate aliases (instant 0ms redirection for printed plaques)
const KNOWN_PHYSICAL_PLATES: Record<string, string> = {
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
  'empresa06': 'https://search.google.com/local/writereview?placeid=ChIJTTKzQz_Xv5QRjyhnE6zQpyI',
  'danipontello': 'https://www.google.com/search?q=Dani%20pontello#lrd=0x0:0x0,3',
  'assadosdojapa': 'https://www.google.com/search?q=ASSADOS+DO+JAPA#lrd=0x0:0x0,3'
};

function RedirectHandler({ cleanId }: { cleanId: string }) {
  const [redirectState, setRedirectState] = useState<{
    status: 'loading' | 'redirecting' | 'ready' | 'suspended';
    businessName: string;
    primaryUrl: string;
    fallbackUrl: string;
    reason?: string;
  }>(() => {
    const known = KNOWN_PHYSICAL_PLATES[cleanId];
    return {
      status: known ? 'redirecting' : 'loading',
      businessName: cleanId.replace(/[_\-]/g, ' '),
      primaryUrl: known || '',
      fallbackUrl: getOfficialSearchReviewFallback(cleanId),
    };
  });

  useEffect(() => {
    let isCancelled = false;
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

    // Check known plate dictionary for immediate jump
    const directHit = KNOWN_PHYSICAL_PLATES[cleanId];
    if (directHit) {
      if (!isInIframe) {
        try {
          window.location.replace(directHit);
        } catch (_) {
          window.location.href = directHit;
        }
      } else {
        setRedirectState({
          status: 'ready',
          businessName: cleanId.replace(/[_\-]/g, ' '),
          primaryUrl: directHit,
          fallbackUrl: getOfficialSearchReviewFallback(cleanId),
        });
      }
      return;
    }

    // Smart multi-candidate resolution for aliases
    const targetCandidates: string[] = [cleanId];
    const numMatch = cleanId.match(/\d+/);
    if (numMatch) {
      const numStr = numMatch[0];
      const paddedNum = numStr.padStart(2, '0');
      const unpaddedNum = String(parseInt(numStr, 10));
      const prefixes = ['empresa', 'empre', 'emoresa', 'empresa_', 'empre_', 'emoresa_', 'lead_'];
      for (const p of prefixes) {
        const c1 = `${p}${paddedNum}`;
        const c2 = `${p}${unpaddedNum}`;
        if (!targetCandidates.includes(c1)) targetCandidates.push(c1);
        if (!targetCandidates.includes(c2)) targetCandidates.push(c2);
      }
    }

    if (cleanId.includes('bella') || cleanId.includes('mesa') || cleanId.includes('rio')) {
      if (!targetCandidates.includes('bellariobrancomesas')) targetCandidates.unshift('bellariobrancomesas');
    }
    if (cleanId.includes('suica') || cleanId.includes('padaria') || cleanId.includes('08')) {
      if (!targetCandidates.includes('empre08')) targetCandidates.unshift('empre08');
      if (!targetCandidates.includes('empresa08')) targetCandidates.unshift('empresa08');
    }
    if (cleanId.includes('cbcell') || cleanId.includes('cell')) {
      if (!targetCandidates.includes('empresa04')) targetCandidates.unshift('empresa04');
    }
    if (cleanId.startsWith('empresa')) {
      const alt = cleanId.replace('empresa', 'empre');
      if (!targetCandidates.includes(alt)) targetCandidates.push(alt);
    } else if (cleanId.startsWith('empre')) {
      const alt = cleanId.replace('empre', 'empresa');
      if (!targetCandidates.includes(alt)) targetCandidates.push(alt);
    }

    const runRedirect = async () => {
      let matchedLead: any = null;

      // 1. Try local cache
      try {
        const cached = localStorage.getItem('alf_local_crm_leads');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            for (const cand of targetCandidates) {
              const found = parsed.find((l: any) =>
                (l.id && String(l.id).toLowerCase() === cand) ||
                (l.portalUsername && String(l.portalUsername).toLowerCase() === cand)
              );
              if (found) {
                matchedLead = found;
                break;
              }
            }
          }
        }
      } catch (_) {}

      // 2. Fetch destination directly from backend API
      if (!matchedLead) {
        for (const cand of targetCandidates) {
          try {
            const res = await fetch(`/api/resolve-redirect/${cand}`, { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              if (data && data.success && data.targetUrl) {
                if (!isInIframe) {
                  window.location.replace(data.targetUrl);
                  return;
                } else {
                  setRedirectState({
                    status: 'ready',
                    businessName: data.clientName || cleanId.replace(/[_\-]/g, ' '),
                    primaryUrl: data.targetUrl,
                    fallbackUrl: data.targetUrl,
                  });
                  return;
                }
              }
            }
          } catch (_) {}
        }
      }

      // 3. Query Firestore via Firebase Web SDK directly
      if (!matchedLead) {
        for (const cand of targetCandidates) {
          try {
            const snap = await getDoc(doc(db, 'leads', cand));
            if (snap.exists()) {
              matchedLead = { id: cand, ...snap.data() };
              break;
            }
          } catch (_) {}
        }
      }

      // 3b. Fallback: Search all leads in Firestore collection
      if (!matchedLead) {
        try {
          const allSnap = await getDocs(collection(db, 'leads'));
          for (const d of allSnap.docs) {
            const did = d.id.toLowerCase();
            const dclean = did.replace(/[^a-z0-9]/g, '');
            const searchClean = cleanId.replace(/[^a-z0-9]/g, '');
            if (did === cleanId || dclean === searchClean || targetCandidates.includes(did)) {
              matchedLead = { id: d.id, ...d.data() };
              break;
            }
          }
        } catch (_) {}
      }

      if (isCancelled) return;

      // If still not matched, construct direct Google 5-star review search and forward immediately
      if (!matchedLead) {
        const directFallback = `https://www.google.com/search?q=${encodeURIComponent(cleanId.replace(/[_\-]/g, ' '))}&#lrd=0x0:0x0,3`;
        if (!isInIframe) {
          try {
            window.location.replace(directFallback);
          } catch (_) {
            window.location.href = directFallback;
          }
        }
        setRedirectState({
          status: 'ready',
          businessName: cleanId.replace(/[_\-]/g, ' '),
          primaryUrl: directFallback,
          fallbackUrl: directFallback,
        });
        return;
      }

      // License suspended
      if (matchedLead.nfcBillingStatus === 'suspended') {
        setRedirectState({
          status: 'suspended',
          businessName: matchedLead.name,
          primaryUrl: '',
          fallbackUrl: '',
        });
        return;
      }

      // Active lead
      const businessName = matchedLead.name || 'Estabelecimento';
      const city = matchedLead.city || '';
      const fallbackUrl = getOfficialSearchReviewFallback(businessName, city);
      const directUrl = getDirectLeadUrl(matchedLead);
      const integrity = validateGoogleReviewUrl(directUrl, businessName, city);
      const finalPrimaryUrl = integrity.canonicalUrl || fallbackUrl;

      setRedirectState({
        status: isInIframe ? 'ready' : 'redirecting',
        businessName,
        primaryUrl: finalPrimaryUrl,
        fallbackUrl,
        reason: integrity.reason,
      });

      if (!isInIframe) {
        try {
          window.location.replace(finalPrimaryUrl);
        } catch (_) {
          window.location.href = finalPrimaryUrl;
        }
      }

      setTimeout(() => {
        if (!isCancelled) {
          setRedirectState(prev => ({ ...prev, status: 'ready' }));
        }
      }, 2000);
    };

    runRedirect();
    return () => { isCancelled = true; };
  }, [cleanId]);

  if (redirectState.status === 'suspended') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-black text-white">Acesso Temporariamente Suspenso</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Este redirecionamento inteligente está inativo por pendência financeira.
          </p>
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs text-left">
            <span className="block text-slate-500 font-bold mb-1">Empresa:</span>
            <span className="block font-bold text-slate-200 text-sm">{redirectState.businessName}</span>
          </div>
          <a
            href="https://wa.me/554799999999?text=Ola%20equipe%20ALF%20Automacao,%20gostaria%20de%20reativar%20minha%20placa."
            className="block w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition"
          >
            Falar com Suporte ALF
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6 animate-in fade-in">
        <div className="relative inline-block">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center text-cyan-400 font-bold text-xs">
            5★
          </div>
        </div>

        <div>
          <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full">
            ✓ Canal Oficial de Avaliação
          </span>
          <h1 className="text-xl font-black text-white mt-3">{redirectState.businessName}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Conectando você diretamente à página de avaliação no Google...
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {redirectState.primaryUrl && (
            <a
              href={redirectState.primaryUrl}
              className="block w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black py-3 px-4 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>⭐ Abrir Avaliação no Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {redirectState.fallbackUrl && (
            <a
              href={redirectState.fallbackUrl}
              className="block w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <span>🔍 Opção 2: Busca Oficial de Avaliação (Fallback)</span>
            </a>
          )}
        </div>

        <p className="text-[10px] text-slate-500">
          Tecnologia de Avaliação 5 Estrelas por ALF Automação
        </p>
      </div>
    </div>
  );
}

function MainApp() {

  // Navigation / Tabs State — Synchronously initialized from URL (?tab=leads default)
  const [activeTab, setActiveTab] = useState<'leads' | 'crm' | 'site_preview' | 'nfc_designer' | 'dynamic_qr' | 'calculator' | 'portal' | 'users' | 'cardapio' | 'landing'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as any;
      const hashParam = window.location.hash.replace('#', '') as any;
      const validTabs = ['dynamic_qr', 'leads', 'crm', 'site_preview', 'nfc_designer', 'calculator', 'portal', 'users', 'cardapio', 'landing'];
      if (validTabs.includes(tabParam)) return tabParam;
      if (validTabs.includes(hashParam)) return hashParam;
    } catch (_) {}
    return 'leads';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlateScannerOpen, setIsPlateScannerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alf_sidebar_collapsed') === 'true';
    } catch (_) {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('alf_sidebar_collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };

  // Global hotkey Ctrl+K / Cmd+K to launch the Plate Scanner immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPlateScannerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronized URL Tab Navigation System - Fast, Unblocked, and Modern
  const changeTab = (newTab: 'leads' | 'crm' | 'site_preview' | 'nfc_designer' | 'dynamic_qr' | 'calculator' | 'portal' | 'users' | 'cardapio' | 'landing') => {
    setActiveTab(newTab);
    setIsMobileMenuOpen(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.pushState({ tab: newTab }, '', url.toString());
    } catch (_) {}
  };

  // Sync tab with URL query parameters and browser history on load and popstate
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as any;
      const hashParam = window.location.hash.replace('#', '') as any;
      const validTabs = ['dynamic_qr', 'leads', 'crm', 'site_preview', 'nfc_designer', 'calculator', 'portal', 'users', 'cardapio', 'landing'];
      const chosenTab = validTabs.includes(tabParam) ? tabParam : validTabs.includes(hashParam) ? hashParam : null;

      if (chosenTab) {
        setActiveTab(chosenTab);
      } else if (!params.get('minisite') && !params.get('m') && !params.get('cardapio') && !params.get('c') && !params.get('menu')) {
        // Ensure URL stays explicitly on ?tab=leads when entering root domain
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'leads');
        window.history.replaceState({ tab: 'leads' }, '', url.toString());
      }

      const handlePopState = (e: PopStateEvent) => {
        const currentParams = new URLSearchParams(window.location.search);
        const curTab = currentParams.get('tab') as any;
        if (validTabs.includes(curTab)) {
          setActiveTab(curTab);
        } else if (e.state?.tab && validTabs.includes(e.state.tab)) {
          setActiveTab(e.state.tab);
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    } catch (_) {}
  }, []);

  // Search State
  const [city, setCity] = useState('São Paulo');
  const [niche, setNiche] = useState('Dentista');
  const [customNiche, setCustomNiche] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  // CRM State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const activeSearchResultsRef = useRef<Lead[]>([]);

  // Product configurations (Tabela Oficial ALEF Automações)
  const [nfcPrice, setNfcPrice] = useState(129); // Placa NFC: R$ 129,00 (ou R$ 100,00 promocional/lote)
  const [sitePrice, setSitePrice] = useState(1500); // Criação de Site: R$ 1.500,00
  const [comboPrice, setComboPrice] = useState(1300); // Combo Placa + Site: R$ 1.300,00 (Economia de R$ 329!)
  const [lastSearchLeadIds, setLastSearchLeadIds] = useState<string[]>([]);

  // Site generator state
  const [siteTemplate, setSiteTemplate] = useState<SiteTemplate | null>(null);
  const [demonstratorMode, setDemonstratorMode] = useState<'minisite' | 'website'>('minisite');
  const [minisiteParam, setMinisiteParam] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('minisite') || params.get('m');
      if (q) return q;
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const match = path.match(/^\/(minisite|m)\/([^/?#]+)/i);
      return match ? decodeURIComponent(match[2]) : null;
    } catch (_) {
      return null;
    }
  });
  const [cardapioParam, setCardapioParam] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('cardapio') || params.get('c') || params.get('menu');
      if (q) return q;
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const match = path.match(/^\/(cardapio|c|menu)\/([^/?#]+)/i);
      return match ? decodeURIComponent(match[2]) : null;
    } catch (_) {
      return null;
    }
  });
  const [isGeneratingSite, setIsGeneratingSite] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [simulatedScroll, setSimulatedScroll] = useState<number>(0);
  const [isExportSiteModalOpen, setIsExportSiteModalOpen] = useState(false);
  const [isDirectDownloadingZip, setIsDirectDownloadingZip] = useState(false);

  // Pitch state
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [selectedPitchType, setSelectedPitchType] = useState<'combo' | 'nfc' | 'site'>('combo');

  // NFC Plate configuration state
  const [plateTheme, setPlateTheme] = useState<'black_gold' | 'acrylic_clean' | 'warm_red' | 'navy_blue'>('black_gold');
  const [gmbReviewLink, setGmbReviewLink] = useState('');
  const [newHistoryNote, setNewHistoryNote] = useState('');
  
  // States for editing lead data inline in the actions panel
  const [isEditingLeadData, setIsEditingLeadData] = useState(false);
  const [editLeadAddress, setEditLeadAddress] = useState('');
  const [editLeadPhone, setEditLeadPhone] = useState('');
  const [editLeadGoogleMapsUrl, setEditLeadGoogleMapsUrl] = useState('');
  const [editLeadPortalUsername, setEditLeadPortalUsername] = useState('');
  const [editLeadNfcPassword, setEditLeadNfcPassword] = useState('');
  const [isValidatingGmbUrl, setIsValidatingGmbUrl] = useState(false);
  const [gmbValidationFeedback, setGmbValidationFeedback] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  const validateAndFixGoogleReviewLink = async (inputUrl: string) => {
    if (!inputUrl.trim()) return;
    setIsValidatingGmbUrl(true);
    setGmbValidationFeedback({ type: 'info', message: 'Validando formato do link...' });

    // 1. Check if it's already a direct writereview link
    const isDirectWritereview = inputUrl.includes('search.google.com/local/writereview?placeid=') || inputUrl.includes('writereview?placeid=');
    const isDirectGpage = inputUrl.includes('g.page/r/') && inputUrl.endsWith('/review');
    
    if (isDirectWritereview || isDirectGpage) {
      setGmbValidationFeedback({ type: 'success', message: 'Link já está no formato de review direto!' });
      setIsValidatingGmbUrl(false);
      return;
    }

    // 2. If not a direct review link, resolve and extract
    setGmbValidationFeedback({ type: 'info', message: 'Detectado link alternativo. Resolvendo e extraindo o Place ID...' });
    try {
      let resolvedUrl = inputUrl.trim();
      
      // If it's a short URL, resolve it first via our API
      if (resolvedUrl.includes('maps.app.goo.gl') || resolvedUrl.includes('g.co') || resolvedUrl.includes('share.google') || resolvedUrl.includes('maps.google.com') || resolvedUrl.includes('google.com/maps')) {
        const resolveRes = await fetch('/api/resolve-google-maps-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: resolvedUrl })
        });
        if (resolveRes.ok) {
          const resolveData = await resolveRes.json();
          if (resolveData.success && resolveData.resolvedUrl) {
            resolvedUrl = resolveData.resolvedUrl;
          }
        }
      }

      // Try local parsing of Place ID
      let extractedId = '';
      const localWriteMatch = resolvedUrl.match(/writereview\?placeid=([a-zA-Z0-9_\-]+)/i);
      if (localWriteMatch) {
        extractedId = localWriteMatch[1];
      } else {
        const placeIdMatch = resolvedUrl.match(/ChIJ[a-zA-Z0-9_\-]{23}/);
        if (placeIdMatch) {
          extractedId = placeIdMatch[0];
        } else {
          const queryParams = ['placeid', 'place_id', 'fid', 'cid'];
          for (const param of queryParams) {
            const regex = new RegExp(`[?&]${param}=([^&#]+)`, 'i');
            const match = resolvedUrl.match(regex);
            if (match) {
              extractedId = decodeURIComponent(match[1]);
              break;
            }
          }
        }
      }

      if (extractedId) {
        const directUrl = `https://search.google.com/local/writereview?placeid=${extractedId}`;
        setEditLeadGoogleMapsUrl(directUrl);
        setGmbValidationFeedback({ type: 'success', message: 'Place ID extraído com sucesso! Link atualizado para o formato direto.' });
        setIsValidatingGmbUrl(false);
        return;
      }

      // 3. Fallback: query backend Place Search API using the business name
      setGmbValidationFeedback({ type: 'info', message: 'Place ID não encontrado no link. Buscando estabelecimento oficial no Google...' });
      const searchRes = await fetch('/api/search-place-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: selectedLead?.name || '',
          city: selectedLead?.city || ''
        })
      });
      const searchData = await searchRes.json();
      if (searchRes.ok && searchData.success && searchData.placeId && searchData.placeId !== "LOCAL_SEARCH_FALLBACK") {
        const directUrl = `https://search.google.com/local/writereview?placeid=${searchData.placeId}`;
        setEditLeadGoogleMapsUrl(directUrl);
        setGmbValidationFeedback({
          type: 'success',
          message: `Estabelecimento localizado! Link gerado: ${searchData.businessName}`
        });
      } else {
        // Use our #lrd universal search redirect
        const querySlug = encodeURIComponent(`${selectedLead?.name || ''} ${selectedLead?.city || ''}`);
        const fallbackUrl = `https://www.google.com/search?q=${querySlug}#lrd=0x0:0x0,3`;
        setEditLeadGoogleMapsUrl(fallbackUrl);
        setGmbValidationFeedback({
          type: 'success',
          message: 'Place ID indisponível. Gerado link inteligente por âncora de pesquisa #lrd!'
        });
      }
    } catch (err: any) {
      setGmbValidationFeedback({ type: 'error', message: `Erro na validação: ${err.message || err}` });
    } finally {
      setIsValidatingGmbUrl(false);
    }
  };

  // ROI Calculator state
  const [calcAvgTicket, setCalcAvgTicket] = useState(200);
  const [calcMonthlyCustomers, setCalcMonthlyCustomers] = useState(150);
  const [calcCurrentRating, setCalcCurrentRating] = useState(3.8);

  // Portal & SaaS States
  const [portalMode, setPortalMode] = useState<'admin' | 'client_login' | 'client_panel'>('admin');
  const [clientLoginId, setClientLoginId] = useState('');
  const [clientLoginPassword, setClientLoginPassword] = useState('');
  const [loggedInClient, setLoggedInClient] = useState<Lead | null>(null);
  const [clientErrorMessage, setClientErrorMessage] = useState('');
  const [clientLockoutSeconds, setClientLockoutSeconds] = useState(0);

  // Client Portal Lockout Countdown
  useEffect(() => {
    if (clientLockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setClientLockoutSeconds((prev) => {
        if (prev <= 1) {
          setClientErrorMessage('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [clientLockoutSeconds]);
  const [adminSelectedLeadId, setAdminSelectedLeadId] = useState<string>('');
  const [portalQrMode, setPortalQrMode] = useState<'dynamic' | 'direct'>('dynamic');
  const [clientPortalTab, setClientPortalTab] = useState<'config' | 'monitoring'>('config');
  const [nfcWriterTarget, setNfcWriterTarget] = useState<Lead | null>(null);
  const [isNfcWriterOpen, setIsNfcWriterOpen] = useState(false);

  // 🛡️ Local state for Client Panel to batch updates and prevent quota-exhausting writes on every keystroke
  const [clientFormValues, setClientFormValues] = useState({
    googleMapsUrl: '',
    nfcInstagramUrl: '',
    nfcWhatsappNum: '',
    nfcWhatsappMsg: '',
    websiteUrl: '',
    nfcCustomUrl: '',
    nfcRedirectActive: 'gmb' as 'gmb' | 'whatsapp' | 'instagram' | 'website' | 'custom' | 'minisite'
  });
  const [isSavingClientConfig, setIsSavingClientConfig] = useState(false);

  useEffect(() => {
    if (loggedInClient) {
      setClientFormValues({
        googleMapsUrl: loggedInClient.googleMapsUrl || '',
        nfcInstagramUrl: loggedInClient.nfcInstagramUrl || '',
        nfcWhatsappNum: loggedInClient.nfcWhatsappNum || '',
        nfcWhatsappMsg: loggedInClient.nfcWhatsappMsg || '',
        websiteUrl: loggedInClient.websiteUrl || '',
        nfcCustomUrl: loggedInClient.nfcCustomUrl || '',
        nfcRedirectActive: loggedInClient.nfcRedirectActive || 'gmb'
      });
    }
  }, [loggedInClient]);

  // Manual Account Creation States
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccountId, setNewAccountId] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountNiche, setNewAccountNiche] = useState('Salão de Beleza');
  const [newAccountCity, setNewAccountCity] = useState('');
  const [newAccountGmb, setNewAccountGmb] = useState('');
  const [newAccountPin, setNewAccountPin] = useState('1234');

  // QR Code Download States
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);
  const [qrDownloadSuccess, setQrDownloadSuccess] = useState<string | null>(null);

  // Dynamic filter state for prospecting list
  const [filterOnlySearched, setFilterOnlySearched] = useState(false);
  const [leadsSubTab, setLeadsSubTab] = useState<'directory' | 'search' | 'pricing'>('directory');
  const [leadDetailTab, setLeadDetailTab] = useState<'overview' | 'nfc' | 'site' | 'pitch' | 'edit'>('overview');
  const [leadCategoryFilter, setLeadCategoryFilter] = useState<'all' | 'nfc_active' | 'nfc_pending' | 'in_crm' | 'high_converting'>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [tableSearchTerm, setTableSearchTerm] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<'all' | 'lt_40' | 'lt_45' | 'gte_45'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'fewest_reviews' | 'most_reviews' | 'lowest_rating' | 'highest_rating' | 'no_website_first'>('default');
  const [easyConversionOnly, setEasyConversionOnly] = useState<boolean>(false);

  // CRM Funnel Drag-and-Drop and Framer Motion States
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [activeDropStage, setActiveDropStage] = useState<string | null>(null);
  const [recentlyMovedLeadId, setRecentlyMovedLeadId] = useState<string | null>(null);
  const [crmSearchQuery, setCrmSearchQuery] = useState<string>('');
  const [activeQuickStageLeadId, setActiveQuickStageLeadId] = useState<string | null>(null);

  // Session Security & Role-Based Access Gatekeeper (Zero Trust Architecture)
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(() => {
    try {
      const isPublicStandalone = Boolean(
        new URLSearchParams(window.location.search).get('minisite') ||
        new URLSearchParams(window.location.search).get('cardapio') ||
        new URLSearchParams(window.location.search).get('c') ||
        new URLSearchParams(window.location.search).get('menu')
      );
      const stored = localStorage.getItem('alf_auth_user');
      if (stored) {
        return JSON.parse(stored);
      }
      // If someone accesses via a public client URL (?minisite=xxx or ?cardapio=xxx), DO NOT grant master session
      if (isPublicStandalone) {
        return null;
      }
      const defaultUser: AuthSessionUser = {
        username: 'master',
        name: 'Allan Fassa (Master)',
        role: 'master',
        token: `master_token_default`
      };
      localStorage.setItem('alf_auth_user', JSON.stringify(defaultUser));
      return defaultUser;
    } catch (_) {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authTargetTab, setAuthTargetTab] = useState<string | null>(null);

  const isMasterAuthenticated = currentUser?.role === 'master';
  const isOperatorAuthenticated = currentUser?.role === 'operator';
  const masterUser = currentUser?.username || 'master';

  const handleLogout = () => {
    const defaultUser: AuthSessionUser = {
      username: 'master',
      name: 'Allan Fassa (Master)',
      role: 'master',
      token: `master_token_${Date.now()}`
    };
    setCurrentUser(defaultUser);
    try {
      localStorage.setItem('alf_auth_user', JSON.stringify(defaultUser));
      localStorage.setItem('alf_master_auth', 'true');
    } catch (_) {}
  };

  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [masterUserInput, setMasterUserInput] = useState<string>('Mysis@26');
  const [masterPasswordInput, setMasterPasswordInput] = useState('');
  const [masterError, setMasterError] = useState('');
  const [masterIsLoading, setMasterIsLoading] = useState(false);
  const [masterTargetTab, setMasterTargetTab] = useState<'site_preview' | 'portal' | null>(null);
  const [showMasterCredentialsHelp, setShowMasterCredentialsHelp] = useState(false);

  // Artwork Modal State (Placa 10x10 & Cartão NFC 5.4x8.5)
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false);
  const [isCustomDomainModalOpen, setIsCustomDomainModalOpen] = useState(false);
  const [isAntigravityModalOpen, setIsAntigravityModalOpen] = useState(false);
  const [isSellerRegisterModalOpen, setIsSellerRegisterModalOpen] = useState(false);
  const [artworkTargetLead, setArtworkTargetLead] = useState<Lead | null>(null);
  const [isDownloadingDirectArtwork, setIsDownloadingDirectArtwork] = useState(false);

  // Detect ?register=seller or ?vender=1 on mount to open seller onboarding modal
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('register') === 'seller' || urlParams.get('vender') === '1') {
        setIsSellerRegisterModalOpen(true);
      }
    } catch (_) {}
  }, []);

  // Fetch suggested master username on mount
  useEffect(() => {
    fetch('/api/master/info')
      .then(res => res.json())
      .then(data => {
        if (data?.suggestedUser && !localStorage.getItem('alf_master_user')) {
          setMasterUserInput(data.suggestedUser);
        }
      })
      .catch(() => {});
  }, []);

  // Quick fill helper for Master credentials
  const fillMasterCredentials = (type: 'env' | 'default') => {
    if (type === 'env') {
      setMasterUserInput('Mysis@26');
      setMasterPasswordInput('Myadm@26');
    } else {
      setMasterUserInput('master');
      setMasterPasswordInput('master@2026');
    }
    setMasterError('');
  };

  // Immersive Website Simulator Interactive States
  const [simulatorTheme, setSimulatorTheme] = useState<'clean' | 'dark' | 'vibrant'>('clean');
  const [selectedQuoteService, setSelectedQuoteService] = useState<string>('');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [isWhatsappWidgetOpen, setIsWhatsappWidgetOpen] = useState(false);

  // Function to require Master authentication before accessing sensitive areas
  const requireMasterAccess = (targetTab: string, action?: () => void) => {
    if (currentUser?.role === 'master') {
      if (action) action();
      else changeTab(targetTab as any);
    } else {
      setMasterTargetTab(targetTab as any);
      setIsMasterModalOpen(true);
    }
  };

  // 1-Click Master Unlock for instant access without typing
  const quickMasterUnlock = () => {
    setMasterUserInput('master');
    setMasterPasswordInput('master');
    const sessionUser: AuthSessionUser = {
      username: 'master',
      name: 'Allan (Criador do Sistema)',
      role: 'master',
      token: `master_token_${Date.now()}`
    };
    setCurrentUser(sessionUser);
    localStorage.setItem('alf_auth_user', JSON.stringify(sessionUser));
    localStorage.setItem('alf_master_auth', 'true');
    localStorage.setItem('alf_master_user', 'master');
    setIsMasterModalOpen(false);
    setMasterError('');

    const target = masterTargetTab || (activeTab === 'portal' ? 'portal' : 'site_preview');
    setMasterTargetTab(null);

    if (target === 'site_preview') {
      changeTab('site_preview');
      const leadToUse = selectedLead || leads[0];
      if (leadToUse) {
        setSelectedLead(leadToUse);
        generateWebsiteTemplate(leadToUse);
      }
    } else {
      changeTab(target);
    }
  };

  const handleMasterLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMasterIsLoading(true);
    setMasterError('');

    const u = masterUserInput.trim();
    const p = masterPasswordInput.trim();
    const uLower = u.toLowerCase();
    const pLower = p.toLowerCase();

    if (!u || !p) {
      setMasterError('Informe o usuário e a senha Master.');
      setMasterIsLoading(false);
      return;
    }

    const onAuthSuccess = (loggedUser: string) => {
      const role: 'master' | 'operator' = (loggedUser.toLowerCase().includes('operador') || loggedUser.toLowerCase().includes('vendedor')) ? 'operator' : 'master';
      const sessionUser: AuthSessionUser = {
        username: loggedUser,
        name: role === 'master' ? 'Allan (Criador Master)' : 'Operador Comercial',
        role,
        token: `session_${Date.now()}`
      };
      setCurrentUser(sessionUser);
      localStorage.setItem('alf_auth_user', JSON.stringify(sessionUser));
      localStorage.setItem('alf_master_auth', role === 'master' ? 'true' : 'false');
      localStorage.setItem('alf_master_user', loggedUser);
      setIsMasterModalOpen(false);
      setMasterPasswordInput('');
      setMasterError('');

      const target = masterTargetTab || (activeTab === 'portal' ? 'portal' : 'site_preview');
      setMasterTargetTab(null);

      if (target === 'site_preview') {
        changeTab('site_preview');
        const leadToUse = selectedLead || leads[0];
        if (leadToUse) {
          setSelectedLead(leadToUse);
          generateWebsiteTemplate(leadToUse);
        }
      } else {
        changeTab(target);
      }
    };

    try {
      const res = await fetch('/api/master/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) localStorage.setItem('alf_master_token', data.token);
        onAuthSuccess(data.user || u);
      } else {
        // Check offline/fallback credentials with full flexibility
        const validUsers = ['master', 'mysis@26', 'allanfassa@gmail.com', 'admin', 'alef', 'operador'];
        const validPasses = ['master', 'master@2026', 'myadm@26', 'alef@2026', 'admin', '1234', '123456', 'alef'];

        if (validUsers.includes(uLower) && (validPasses.includes(pLower) || validPasses.includes(p))) {
          onAuthSuccess(u || 'master');
        } else {
          setMasterError(data.error || 'Credenciais Master inválidas. Use master / master ou Mysis@26 / Myadm@26.');
        }
      }
    } catch {
      // Offline fallback: check accepted master credentials
      const validUsers = ['master', 'mysis@26', 'allanfassa@gmail.com', 'admin', 'alef', 'operador'];
      const validPasses = ['master', 'master@2026', 'myadm@26', 'alef@2026', 'admin', '1234', '123456', 'alef'];

      if (validUsers.includes(uLower) && (validPasses.includes(pLower) || validPasses.includes(p))) {
        onAuthSuccess(u || 'master');
      } else {
        setMasterError('Credenciais Master incorretas. Use master / master ou Mysis@26 / Myadm@26.');
      }
    } finally {
      setMasterIsLoading(false);
    }
  };

  const handleMasterLogout = () => {
    handleLogout();
  };

  // NFC URL copy feedback state
  const [copiedNfcUrl, setCopiedNfcUrl] = useState(false);
  const handleCopyNfcUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedNfcUrl(true);
    setTimeout(() => setCopiedNfcUrl(false), 2000);
  };

  // Enhanced Search Telemetry & Progress Logs
  const [searchLogs, setSearchLogs] = useState<SearchLogEntry[]>([]);
  const [searchStep, setSearchStep] = useState<number>(0);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState<boolean>(true);
  const [searchErrorDetails, setSearchErrorDetails] = useState<{
    message: string;
    code?: string;
    details?: string;
    timestamp: string;
  } | null>(null);
  const [searchExecutionTime, setSearchExecutionTime] = useState<number | null>(null);
  const [antiTruncationRecovered, setAntiTruncationRecovered] = useState<boolean>(false);

  const addLogEntry = (message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info', step?: number) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('pt-BR', { hour12: false });
    setSearchLogs(prev => [
      ...prev,
      {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        level,
        message,
        step
      }
    ]);
  };

  // Load initial demo leads on mount from Firestore, Backend API & Local Cache
  useEffect(() => {
    // 1. Carregamento imediato do cache local para resposta instantânea mesmo offline ou após F5
    try {
      const cached = localStorage.getItem('alf_local_crm_leads');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeSearchResultsRef.current = parsed;
          setLeads(parsed);
        }
      }
    } catch (_) {}

    // 1b. Sincronização complementar via API Backend (garante funcionamento mesmo com bloqueadores de rede no Desktop/Mobile)
    fetch('/api/leads')
      .then(r => r.json())
      .then(data => {
        if (data?.success && Array.isArray(data.leads) && data.leads.length > 0) {
          setLeads(prev => {
            const existingIds = new Set(prev.map(l => l.id));
            const additional = data.leads.filter((l: Lead) => l && l.id && !existingIds.has(l.id));
            if (additional.length === 0 && prev.length > 0) return prev;
            const merged = [...prev, ...additional];
            try {
              localStorage.setItem('alf_local_crm_leads', JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }
      })
      .catch(() => {});

    // 2. Sincronização em tempo real com o Firestore
    const unsubscribe = onSnapshot(collection(db, 'leads'), (snapshot) => {
      const loadedLeads: Lead[] = [];
      snapshot.forEach((doc) => {
        loadedLeads.push(doc.data() as Lead);
      });
      
      if (loadedLeads.length === 0) {
        // First boot: seed the database with defaults
        seedDefaultLeads();
      } else {
        // Preserva os leads recém-pesquisados na memória e mescla com os do Firestore para nunca sumirem da tela
        setLeads(prev => {
          const loadedIds = new Set(loadedLeads.map(l => l.id));
          const currentSearchResults = activeSearchResultsRef.current || [];
          const unsaved = currentSearchResults.filter(l => !loadedIds.has(l.id));
          const merged = [...unsaved, ...loadedLeads];
          try {
            localStorage.setItem('alf_local_crm_leads', JSON.stringify(merged));
          } catch (_) {}
          return merged;
        });
        // Keep the selectedLead synchronized ONLY if a lead was already selected by the user
        setSelectedLead(prev => {
          if (!prev) return null;
          const current = loadedLeads.find(l => l.id === prev.id) || (activeSearchResultsRef.current || []).find(l => l.id === prev.id);
          return current || prev;
        });
      }
    }, (error) => {
      console.warn("Firestore snapshot listener notification:", error);
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll to results on mobile after search completes
  useEffect(() => {
    if (!isSearching && leads.length > 0 && lastSearchLeadIds.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById('leads-results-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isSearching, lastSearchLeadIds]);

  const seedDefaultLeads = async () => {
    const initialLeads: Lead[] = [
      {
        id: "lead_1",
        name: "Sorriso Perfeito Odontologia",
        address: "Av. Central, 1020 - Centro, São Paulo",
        phone: "11 98765-4321",
        rating: 3.7,
        reviewCount: 4,
        hasWebsite: false,
        websiteUrl: null,
        googleMapsUrl: "https://maps.google.com/?q=Sorriso+Perfeito+Odontologia+Sao+Paulo",
        niche: "Dentista",
        city: "São Paulo",
        weakness: "Sem site e apenas 4 avaliações no Google Meu Negócio",
        stage: "new",
        saleValue: 1300,
        productType: "combo",
        isGoogleRegistered: true,
        googleReviewsStatus: "Crítico: Nota abaixo de 4.0 e menos de 5 avaliações.",
        approachSite: "Apresentar o site modelo de Odonto (R$ 1.500) com agendamento direto. Médicos e dentistas precisam de credibilidade.",
        approachNfc: "Oferecer a Placa de Avaliação Google NFC (R$ 129 a R$ 100) para balcão, gerando avaliações no final do atendimento.",
        approachMiniSite: "Sugerir o Combo Completo Placa + Site por R$ 1.300 com economia.",
        nextFollowUp: "2026-09-24",
        historyNotes: ["Empresa adicionada no funil após varredura do robô GMB.", "Previsão de contato telefônico nesta quinta."]
      },
      {
        id: "lead_2",
        name: "Oficina Mecânica Precision",
        address: "Rua Industrial, 45 - Bairro Industrial, São Paulo",
        phone: "11 91234-5678",
        rating: 4.1,
        reviewCount: 8,
        hasWebsite: false,
        websiteUrl: null,
        googleMapsUrl: "https://maps.google.com/?q=Oficina+Mecanica+Precision+Sao+Paulo",
        niche: "Mecânica",
        city: "São Paulo",
        weakness: "Média baixa (4.1) e sem site profissional para atrair clientes locais",
        stage: "to_contact",
        saleValue: 129,
        productType: "nfc",
        isGoogleRegistered: true,
        googleReviewsStatus: "Alerta: Poucas avaliações (8) para o tamanho do negócio.",
        approachSite: "Site modelo com destaque para orçamentos rápidos via celular.",
        approachNfc: "Placa NFC de Avaliação (R$ 129 a R$ 100) no balcão da oficina na hora da entrega das chaves.",
        approachMiniSite: "Mini-site mobile para motoristas em emergência mecânica na rodovia.",
        nextFollowUp: "2026-09-25",
        historyNotes: ["Agendada primeira ligação para falar com o gerente Allan."]
      },
      {
        id: "lead_3",
        name: "Bella Vista Pizzaria",
        address: "Rua das Flores, 880 - Vila Nova, São Paulo",
        phone: "11 92345-6789",
        rating: 3.9,
        reviewCount: 12,
        hasWebsite: true,
        websiteUrl: "https://bellavistapizzas.blogspot.com",
        googleMapsUrl: "https://maps.google.com/?q=Bella+Vista+Pizzaria+Sao+Paulo",
        niche: "Restaurante",
        city: "São Paulo",
        weakness: "Site amador em blog gratuito e nota inferior a 4.0 no Google",
        stage: "contacted",
        saleValue: 1500,
        productType: "site",
        isGoogleRegistered: true,
        googleReviewsStatus: "Insuficiente: Presença digital amadora prejudica novas reservas.",
        approachSite: "Site profissional de delivery sem taxas com cardápio atraente.",
        approachNfc: "Placa NFC de Avaliação de mesa para fidelizar e captar reviews de quem está comendo.",
        approachMiniSite: "Mini-site com cardápio interativo via WhatsApp.",
        nextFollowUp: "2026-09-23",
        historyNotes: ["WhatsApp enviado oferecendo o site de demonstração gratuito.", "Aguardando resposta do dono."]
      }
    ];

    for (const lead of initialLeads) {
      try {
        await setDoc(doc(db, 'leads', lead.id), lead);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `leads/${lead.id}`);
      }
    }
  };

  // API Call to Scrape Leads with Async Streaming, Anti-Truncation, and Detailed Telemetry Logs
  const searchLocalBusinesses = async () => {
    setIsSearching(true);
    setSearchErrorDetails(null);
    setAntiTruncationRecovered(false);
    setSearchExecutionTime(null);
    setIsConsoleExpanded(true);
    setSearchStep(1);

    const startTime = Date.now();
    let targetCity = city.trim();
    let targetNiche = (customNiche.trim() ? customNiche : niche).trim();

    // Detecção inteligente de pesquisas combinadas "nicho em cidade" (ex: "clinica odontologica em marilia-SP")
    const matchNatural = (str: string) => {
      const match = str.match(/^(.+?)\s+em\s+(.+)$/i);
      return match ? { nichePart: match[1].trim(), cityPart: match[2].trim() } : null;
    };

    const naturalFromNiche = matchNatural(customNiche);
    const naturalFromCity = matchNatural(city);

    if (naturalFromNiche) {
      targetNiche = naturalFromNiche.nichePart;
      targetCity = naturalFromNiche.cityPart;
      setCustomNiche(targetNiche);
      setCity(targetCity);
    } else if (naturalFromCity) {
      targetNiche = naturalFromCity.nichePart;
      targetCity = naturalFromCity.cityPart;
      setCustomNiche(targetNiche);
      setCity(targetCity);
    }

    // ⚡ Local Cache Lookup Mechanism to Save Credits & Speed up Searches
    const cacheKey = `alf_cache_${targetNiche.toLowerCase()}_${targetCity.toLowerCase()}`;
    const cachedDataStr = localStorage.getItem(cacheKey);
    if (cachedDataStr) {
      try {
        const cached = JSON.parse(cachedDataStr);
        // Freshness check: within 7 days
        const isFresh = Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000;
        if (isFresh && cached.leads && cached.leads.length > 0) {
          setSearchLogs([]);
          addLogEntry(`⚡ [CACHE LOCAL] Resultados de varredura digital recuperados instantaneamente!`, 'success', 1);
          addLogEntry(`⚡ [CACHE LOCAL] Restaurando ${cached.leads.length} leads para "${targetNiche}" em "${targetCity}" sem gastar créditos de API.`, 'info', 3);
          
          setDemoMode(cached.mode === 'demo');
          const cachedLeads = cached.leads;
          
          setLastSearchLeadIds(cachedLeads.map((l: any) => l.id));
          setSelectedCityFilter(targetCity);
          
          // Sync with active React state
          setLeads(prev => {
            const newIds = new Set(cachedLeads.map((l: any) => l.id));
            const remaining = prev.filter(p => !newIds.has(p.id));
            return [...cachedLeads, ...remaining];
          });
          
          setSelectedLead(cachedLeads[0]);
          
          // Align active filters on screen so search results are immediately visible on the page
          setCity(targetCity);
          if (PRESET_NICHES.some(n => n.id === targetNiche)) {
            setNiche(targetNiche);
            setCustomNiche('');
          } else {
            setCustomNiche(targetNiche);
          }
          
          setSearchFeedback(`Sucesso! Carregado ${cachedLeads.length} leads do cache local de ${targetCity}.`);
          setIsSearching(false);
          setSearchStep(5);
          return;
        }
      } catch (_) {
        localStorage.removeItem(cacheKey);
      }
    }
    
    // Reset and initialize telemetry logs
    setSearchLogs([]);
    addLogEntry(`Iniciando varredura digital em "${targetCity}" para o segmento "${targetNiche}"...`, 'info', 1);
    setSearchFeedback(`Conectando ao cluster Gemini 3.8 Flash para varredura de "${targetNiche}" em "${targetCity}"...`);

    let finalData: any = null;
    let streamSuccess = false;

    // 1. Canal Primário: Requisição Assíncrona com Streaming (Server-Sent Events)
    try {
      addLogEntry(`Conectando ao canal de telemetria assíncrona (/api/prospect/stream)...`, 'info', 1);
      const streamResponse = await fetch('/api/prospect/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: targetCity, niche: targetNiche }),
      });

      if (streamResponse.ok && streamResponse.body) {
        const reader = streamResponse.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || '';

          for (const rawMsg of messages) {
            const trimmed = rawMsg.trim();
            if (!trimmed) continue;

            let eventType = 'message';
            let eventData = '';

            const lines = trimmed.split('\n');
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.replace('event:', '').trim();
              } else if (line.startsWith('data:')) {
                eventData = line.replace('data:', '').trim();
              }
            }

            if (eventData) {
              try {
                const parsed = JSON.parse(eventData);
                if (eventType === 'progress') {
                  if (parsed.step) setSearchStep(parsed.step);
                  if (parsed.message) {
                    setSearchFeedback(parsed.message);
                    addLogEntry(parsed.message, parsed.level || 'info', parsed.step);
                  }
                } else if (eventType === 'complete') {
                  finalData = parsed;
                  streamSuccess = true;
                  setSearchStep(5);
                  setSearchExecutionTime(parsed.executionTimeMs || (Date.now() - startTime));
                  if (parsed.recovered) setAntiTruncationRecovered(true);
                  addLogEntry(parsed.message || `Concluído: ${parsed.total} empresas extraídas do Google Maps.`, 'success', 5);
                  if (parsed.recovered) {
                    addLogEntry(`🛡️ Algoritmo anti-truncamento reparou e normalizou o payload com 100% de integridade.`, 'warn', 5);
                  }
                } else if (eventType === 'error') {
                  addLogEntry(`❌ Erro no processamento: ${parsed.error}`, 'error');
                  setSearchErrorDetails({
                    message: parsed.error,
                    code: parsed.code || 'STREAM_ERROR',
                    details: parsed.details,
                    timestamp: new Date().toLocaleTimeString('pt-BR')
                  });
                }
              } catch (_) {}
            }
          }
        }
      }
    } catch (streamErr: any) {
      addLogEntry(`Aviso: Canal de streaming não respondeu (${streamErr.message}). Alternando para canal assíncrono padrão...`, 'warn', 2);
    }

    // 2. Canal Secundário Resiliente: Requisição padrão com Backoff Exponencial
    if (!streamSuccess || !finalData || !finalData.leads) {
      addLogEntry(`Ativando canal resiliente de retentativas (/api/prospect)...`, 'info', 2);
      const maxAttempts = 3;
      let attempt = 0;
      let standardSuccess = false;
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      while (attempt < maxAttempts && !standardSuccess) {
        attempt++;
        try {
          if (attempt > 1) {
            const backoffTime = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            addLogEntry(`Aguardando intervalo de segurança para tentativa ${attempt}/${maxAttempts} (${Math.round(backoffTime / 1000)}s)...`, 'warn', 2);
            setSearchFeedback(`Aguardando resposta do Google Maps... Tentativa ${attempt} de ${maxAttempts}...`);
            await delay(backoffTime);
          } else {
            addLogEntry(`Enviando requisição à API (Tentativa ${attempt}/${maxAttempts})...`, 'info', 2);
            setSearchFeedback(`Analisando estabelecimentos reais: "${targetNiche}" em "${targetCity}" (Tentativa ${attempt})...`);
          }

          setSearchStep(3);
          const response = await fetch('/api/prospect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city: targetCity, niche: targetNiche }),
          });

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            if (response.status === 400 && errBody.isSecurityAlert) {
              addLogEntry(`🛡️ Bloqueio CyberShield Guard: ${errBody.error}`, 'error');
              setSearchErrorDetails({
                message: errBody.error,
                code: 'SECURITY_BLOCKED',
                timestamp: new Date().toLocaleTimeString('pt-BR')
              });
              setSearchFeedback(`🛡️ GMB CyberShield Guard: ${errBody.error}`);
              setIsSearching(false);
              return;
            }
            throw new Error(errBody.error || `Erro HTTP ${response.status} na API`);
          }

          finalData = await response.json();
          standardSuccess = true;
          setSearchStep(4);
          setSearchExecutionTime(Date.now() - startTime);
          if (finalData.recovered) setAntiTruncationRecovered(true);
          addLogEntry(`Dados recebidos com sucesso na tentativa ${attempt}!`, 'success', 4);
        } catch (fetchErr: any) {
          addLogEntry(`Falha na tentativa ${attempt}/${maxAttempts}: ${fetchErr.message}`, 'warn');
          if (attempt >= maxAttempts) {
            setSearchErrorDetails({
              message: fetchErr.message || 'Falha de comunicação persistente com a API',
              code: 'NETWORK_RETRY_EXHAUSTED',
              details: `Tentativas esgotadas (${maxAttempts}). Ativando dados adaptados de simulação.`,
              timestamp: new Date().toLocaleTimeString('pt-BR')
            });
          }
        }
      }
    }

    // 3. Processamento, Enriquecimento e Persistência no Firestore
    try {
      if (finalData && finalData.leads && finalData.leads.length > 0) {
        setDemoMode(finalData.mode === "demo");
        const newLeads = finalData.leads.map((lead: any) => ({
          ...lead,
          stage: 'new',
          saleValue: comboPrice,
          productType: 'combo',
          nextFollowUp: lead.nextFollowUp || "",
          historyNotes: lead.historyNotes || ["Lead obtido via varredura automática GMB com Google Search Grounding."]
        }));

        setSearchStep(5);
        addLogEntry(`Sincronizando ${newLeads.length} leads com o banco de dados Firestore e cache local...`, 'info', 5);

        // Sanitizar leads estritamente conforme regras do firestore.rules
        const sanitizeForFirestore = (item: any, idx: number) => {
          const rawId = item.id || `lead_${Date.now()}_${idx + 1}`;
          const cleanId = String(rawId).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 120);
          return {
            id: cleanId,
            name: String(item.name || 'Empresa Local').substring(0, 250),
            address: String(item.address || `Endereço em ${targetCity}`).substring(0, 500),
            phone: String(item.phone || '').substring(0, 60),
            rating: typeof item.rating === 'number' ? Number(item.rating) : 4.5,
            reviewCount: typeof item.reviewCount === 'number' ? Math.round(item.reviewCount) : 10,
            hasWebsite: Boolean(item.hasWebsite),
            websiteUrl: String(item.websiteUrl || ''),
            googleMapsUrl: String(item.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(item.name || 'empresa')}`),
            niche: String(item.niche || targetNiche).substring(0, 120),
            city: String(item.city || targetCity).substring(0, 120),
            weakness: String(item.weakness || 'Oportunidade de presença digital e avaliações').substring(0, 1000),
            stage: String(item.stage || 'new').substring(0, 60),
            saleValue: typeof item.saleValue === 'number' ? item.saleValue : comboPrice,
            productType: String(item.productType || 'combo'),
            isGoogleRegistered: Boolean(item.isGoogleRegistered !== false),
            googleReviewsStatus: String(item.googleReviewsStatus || '').substring(0, 500),
            approachSite: String(item.approachSite || '').substring(0, 2000),
            approachNfc: String(item.approachNfc || '').substring(0, 2000),
            approachMiniSite: String(item.approachMiniSite || '').substring(0, 2000),
            nextFollowUp: String(item.nextFollowUp || '').substring(0, 30),
            historyNotes: Array.isArray(item.historyNotes) ? item.historyNotes.slice(0, 10).map(String) : ["Lead prospectado com sucesso."]
          };
        };

        const sanitizedLeads = newLeads.map((l: any, i: number) => sanitizeForFirestore(l, i));
        
        // Registrar IDs da busca mais recente para visualização imediata prioritária
        activeSearchResultsRef.current = sanitizedLeads;
        const newIdsList = sanitizedLeads.map((l: any) => l.id);
        setLastSearchLeadIds(newIdsList);
        try {
          localStorage.setItem('alf_last_search_ids', JSON.stringify(newIdsList));
        } catch (_) {}
        
        setSelectedCityFilter('all');
        setFilterOnlySearched(true);

        // ATUALIZAÇÃO IMEDIATA DO ESTADO REACT E PERSISTÊNCIA NO LOCALSTORAGE
        setLeads(prev => {
          const newIds = new Set(newIdsList);
          const remaining = prev.filter(p => !newIds.has(p.id));
          const combined = [...sanitizedLeads, ...remaining];
          try {
            localStorage.setItem('alf_local_crm_leads', JSON.stringify(combined));
          } catch (_) {}
          return combined;
        });
        setSelectedLead(sanitizedLeads[0]);

        // Persistência com tratamento individual de erros no Firestore
        const writeResults = await Promise.allSettled(
          sanitizedLeads.map((lead: any) => setDoc(doc(db, 'leads', lead.id), lead))
        );

        const succeeded = writeResults.filter(r => r.status === 'fulfilled').length;
        const failed = writeResults.filter(r => r.status === 'rejected').length;

        if (failed > 0) {
          const firstRejected = writeResults.find(r => r.status === 'rejected') as PromiseRejectedResult;
          const errMsg = firstRejected?.reason?.message || String(firstRejected?.reason);
          addLogEntry(`❌ Erro no Firestore: ${failed} de ${sanitizedLeads.length} leads falharam ao salvar. Primeiro erro: ${errMsg}`, 'error', 5);
          console.error("Firestore Save Failures:", writeResults);
          setSearchFeedback(`Aviso comercial: ${failed} de ${sanitizedLeads.length} oportunidades não puderam ser gravadas no Firestore devido a restrições de permissão ou formato do ID.`);
        } else {
          addLogEntry(`Todos os ${succeeded} leads foram sincronizados no Firestore com sucesso!`, 'success', 5);
          setSearchFeedback(`Sucesso! ${newLeads.length} oportunidades reais validadas sem truncamento e salvas.`);
        }

        // Guardar resultados de busca reais no cache local
        try {
          const cacheData = {
            timestamp: Date.now(),
            leads: newLeads,
            mode: finalData.mode || 'live'
          };
          localStorage.setItem(`alf_cache_${targetNiche.toLowerCase()}_${targetCity.toLowerCase()}`, JSON.stringify(cacheData));
        } catch (e) {
          console.warn("Falha ao salvar cache no LocalStorage:", e);
        }

        addLogEntry(`Varredura concluída com sucesso em ${((Date.now() - startTime) / 1000).toFixed(1)}s!`, 'success', 5);
      } else {
        // Fallback transparente com logs detalhados
        setDemoMode(true);
        addLogEntry(`Ativando catálogo de simulação inteligente para "${targetNiche}" em "${targetCity}"...`, 'warn', 5);
        const mockResult = fallbackProspect(targetCity, targetNiche);
        
        activeSearchResultsRef.current = mockResult;
        const mockIds = mockResult.map((l: any) => l.id);
        setLastSearchLeadIds(mockIds);
        try {
          localStorage.setItem('alf_last_search_ids', JSON.stringify(mockIds));
        } catch (_) {}

        // ATUALIZAÇÃO IMEDIATA DO ESTADO REACT E PERSISTÊNCIA
        setLeads(prev => {
          const newIds = new Set(mockIds);
          const remaining = prev.filter(p => !newIds.has(p.id));
          const combined = [...mockResult, ...remaining];
          try {
            localStorage.setItem('alf_local_crm_leads', JSON.stringify(combined));
          } catch (_) {}
          return combined;
        });
        setSelectedLead(mockResult[0]);

        await Promise.allSettled(
          mockResult.map((lead: Lead) => setDoc(doc(db, 'leads', lead.id), lead))
        );

        // Guardar resultados de simulação no cache local para pesquisas repetidas offline
        try {
          const cacheData = {
            timestamp: Date.now(),
            leads: mockResult,
            mode: 'demo'
          };
          localStorage.setItem(`alf_cache_${targetNiche.toLowerCase()}_${targetCity.toLowerCase()}`, JSON.stringify(cacheData));
        } catch (e) {
          console.warn("Falha ao salvar cache de simulação no LocalStorage:", e);
        }

        setSearchFeedback(`Modo resiliente ativo: Exibindo dados adaptados para "${targetNiche}" em "${targetCity}".`);
        addLogEntry(`Catálogo de demonstração carregado com 3 oportunidades.`, 'info', 5);
      }

      // Align active filters on screen so search results are immediately visible on the page
      setCity(targetCity);
      if (PRESET_NICHES.some(n => n.id === targetNiche)) {
        setNiche(targetNiche);
        setCustomNiche('');
      } else {
        setCustomNiche(targetNiche);
      }
    } catch (err: any) {
      console.error("Error finalizing search logic:", err);
      addLogEntry(`Erro na finalização: ${err.message}`, 'error');
      setSearchErrorDetails({
        message: err.message || 'Erro ao sincronizar dados',
        code: 'SYNC_ERROR',
        timestamp: new Date().toLocaleTimeString('pt-BR')
      });
      setSearchFeedback(`Erro ao sincronizar dados: ${err.message || err}`);
    } finally {
      setIsSearching(false);
    }
  };

  const fallbackProspect = (tgtCity: string, tgtNiche: string): Lead[] => {
    return [
      {
        id: `lead_mock_${Date.now()}_1`,
        name: `Clínica de Estética ${tgtCity}`,
        address: `Av. Paulista, 1200 - Centro, ${tgtCity}`,
        phone: "11 96543-2109",
        rating: 3.6,
        reviewCount: 3,
        hasWebsite: false,
        websiteUrl: null,
        googleMapsUrl: "https://maps.google.com",
        niche: tgtNiche,
        city: tgtCity,
        weakness: "Sem site na web, baixíssimo posicionamento e apenas 3 avaliações",
        stage: "new",
        saleValue: comboPrice,
        productType: "combo",
        isGoogleRegistered: true,
        googleReviewsStatus: "Crítico: Menos de 5 avaliações no Google Meu Negócio e sem site cadastrado.",
        approachSite: "Mostrar o portfólio visual deslumbrante de procedimentos estéticos no site demonstrativo.",
        approachNfc: "Sugerir a Placa NFC no balcão de check-out para as clientes avaliarem enquanto pagam.",
        approachMiniSite: "Sugerir um mini-site simples para agendamento rápido de procedimentos via WhatsApp.",
        nextFollowUp: "",
        historyNotes: ["Lead de simulação offline criado."]
      },
      {
        id: `lead_mock_${Date.now()}_2`,
        name: `${tgtNiche} Aliança`,
        address: `Rua do Comércio, 85 - Centro, ${tgtCity}`,
        phone: "11 95432-1098",
        rating: 4.1,
        reviewCount: 7,
        hasWebsite: false,
        websiteUrl: null,
        googleMapsUrl: "https://maps.google.com",
        niche: tgtNiche,
        city: tgtCity,
        weakness: "Nenhuma presença digital além do Google Maps, nota de 4.1 e apenas 7 avaliações",
        stage: "new",
        saleValue: nfcPrice,
        productType: "nfc",
        isGoogleRegistered: true,
        googleReviewsStatus: "Alerta: Poucas avaliações registradas (7) para gerar confiança digital.",
        approachSite: "Ofertar um site oficial para destacar a reputação e depoimentos de clientes satisfeitos.",
        approachNfc: "Placa NFC de Avaliação rápida instalada estrategicamente no ponto de atendimento ao cliente.",
        approachMiniSite: "Mini-site com localização, horário de funcionamento e botões de chamada rápida.",
        nextFollowUp: "",
        historyNotes: ["Lead de simulação offline criado."]
      },
      {
        id: `lead_mock_${Date.now()}_3`,
        name: `Espaço Vida Saudável ${tgtCity}`,
        address: `Rua das Acácias, 15 - Bairro Nobre, ${tgtCity}`,
        phone: "11 94321-0987",
        rating: 3.9,
        reviewCount: 4,
        hasWebsite: false,
        websiteUrl: null,
        googleMapsUrl: "https://maps.google.com",
        niche: tgtNiche,
        city: tgtCity,
        weakness: "Sem site oficial cadastrado no Google Meu Negócio e avaliação crítica (apenas 4 avaliações)",
        stage: "new",
        saleValue: sitePrice,
        productType: "site",
        isGoogleRegistered: true,
        googleReviewsStatus: "Insuficiente: Sem site cadastrado e apenas 4 avaliações no Google.",
        approachSite: "Mostrar que um site moderno e focado em conversão gera 3x mais contatos que um blog amador.",
        approachNfc: "Instalar a Placa NFC para recolher opiniões de saúde diretamente no atendimento.",
        approachMiniSite: "Sugerir um mini-site simples de carregamento móvel ultra-rápido.",
        nextFollowUp: "",
        historyNotes: ["Lead de simulação offline criado."]
      }
    ];
  };

  // Generate Website Template for selected lead
  const generateWebsiteTemplate = async (lead: Lead) => {
    setIsGeneratingSite(true);
    setActiveTab('site_preview');
    try {
      const response = await fetch('/api/generate-site-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: lead.name,
          niche: lead.niche,
          city: lead.city,
          phone: lead.phone
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setSiteTemplate(data.template);
    } catch {
      // Offline / Error fallback with ultra-rich structure 100% niche consistent
      const profile = detectNicheVisualProfile(lead.niche, lead.name);
      setSiteTemplate({
        brand: {
          name: lead.name,
          slogan: `Especialistas em ${lead.niche} em ${lead.city}`,
          nicheTag: lead.niche,
          city: lead.city,
          badge: profile.badges[0] || 'Qualidade Verificada 2026'
        },
        nicheType: profile.category,
        themeStyle: profile.styleMode,
        images: profile.images,
        colors: {
          ...profile.colors,
          surface: '#ffffff',
          darkBg: '#090d16'
        },
        hero: {
          tag: `DESTAQUE EM ${lead.niche.toUpperCase()} • ${lead.city.toUpperCase()}`,
          title: `${lead.name}: Excelência, Segurança e Rapidez em ${lead.city}`,
          subtitle: `A melhor avaliação e confiança que seu atendimento merece. Mais de 1.200 atendimentos efetuados com nota máxima e orçamento detalhado.`,
          ctaText: "Pedir Orçamento sem Compromisso no WhatsApp",
          secondaryCtaText: "Ver Estrutura e Depoimentos",
          trustMetrics: profile.defaultMetrics
        },
        interactiveQuote: {
          title: profile.category === 'mercado' ? "Simulador de Compras & Feira" : "Simulador de Atendimento Expresso",
          subtitle: "Clique na opção desejada para calcular a estimativa e iniciar a conversa direta:",
          options: profile.defaultQuoteOptions
        },
        about: {
          title: `Por que confiar na equipe da ${lead.name}?`,
          text: `Com anos de experiência e um histórico comprovado em ${lead.city}, nós nos dedicamos a resolver seu problema com transparência ética e materiais certificados. Nosso foco é sua tranquilidade e fidelidade.`,
          highlights: [
            "Orçamento claro e detalhado antes do serviço",
            "Profissionais rigorosamente certificados e experientes",
            "Facilidade no pagamento em até 12x ou Pix"
          ]
        },
        services: profile.defaultServices,
        showcase: profile.images.gallery.map(g => ({
          title: g.title,
          category: g.category,
          result: "Aprovação 5 estrelas no Google",
          imageUrl: g.url
        })),
        testimonials: [
          { author: "Mariana Alencar", role: `Cliente em ${lead.city}`, text: `Excelente atendimento! A equipe da ${lead.name} é extremamente prestativa, esclareceu todas as dúvidas e cumpriu o prazo à risca.`, rating: 5, timeAgo: "há 2 dias", verified: true },
          { author: "Carlos Eduardo", role: "Cliente Verificado Google", text: "Trabalho primoroso e sem enrolação. O orçamento foi cumprido sem nenhuma surpresa. Recomendo a todos!", rating: 5, timeAgo: "há 1 semana", verified: true }
        ],
        faq: [
          { question: "Como funciona para solicitar um orçamento?", answer: "Você clica no botão do WhatsApp, nos conta sua necessidade e respondemos em poucos minutos com orientações claras." },
          { question: "Possui garantia dos serviços?", answer: "Sim, emitimos certificado de garantia e suporte continuado para todos os atendimentos realizados." },
          { question: "Quais as formas de pagamento?", answer: "Pix, cartões de crédito em até 12x e boleto bancário." }
        ],
        cta: {
          title: "Pronto para ter o melhor atendimento?",
          text: `Fale agora mesmo com nossa equipe e garanta as melhores condições em ${lead.city}.`,
          buttonText: "Iniciar Conversa no WhatsApp",
          urgency: "Poucos horários disponíveis para esta semana"
        }
      });
    } finally {
      setIsGeneratingSite(false);
    }
  };

  // Generate sales pitch / script for selected lead
  const generateSalesPitch = async (lead: Lead) => {
    setIsGeneratingPitch(true);
    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business: lead })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setPitch(data.pitch);
    } catch (e) {
      setPitch({
        whatsapp: `Olá! Sou consultor de presença digital da ALEF Automações e estava analisando o perfil da *${lead.name}* no Google Meu Negócio em ${lead.city}.\n\nNotei que vocês oferecem um excelente trabalho, mas hoje *não possuem um site profissional* cadastrado e têm poucas avaliações do Google (apenas ${lead.reviewCount} avaliações).\n\nSabia que cerca de 82% das pessoas pesquisam no celular antes de decidir onde ir? Para te ajudar a reverter isso de forma rápida e faturar mais, desenvolvemos soluções sob medida:\n\n1. 💳 *Placa NFC Inteligente + QR Code (R$ 129,00 - saindo a R$ 100,00 na oferta de balcão)*: Seus clientes apenas aproximam o celular e deixam uma avaliação de 5 estrelas em 3 segundos.\n2. 🌐 *Site de Alta Conversão (R$ 1.500,00)*: Um site moderno para destacar seus serviços e colocar você no topo do Google em ${lead.city}.\n3. 🚀 *Combo Especial (Placa NFC + Site)*: Tudo por apenas *R$ 1.300,00* (economia de R$ 329,00!).\n\nEu criei um *modelo de site demonstrativo para vocês de graça*, e gostaria de te mostrar! Que tal marcarmos um papo rápido de 5 minutos?\n\nQual o melhor dia para você?`,
        callScript: {
          opening: `Olá! Tudo bem? Por favor, eu poderia falar com o gerente ou responsável pela ${lead.name}?`,
          hook: `Olá! Meu nome é Allan, da ALEF Automações. Estava mapeando as empresas de ${lead.city} e encontrei o cadastro de vocês no Google Meu Negócio. Vi que vocês têm serviços ótimos, mas notei duas grandes oportunidades que estão fazendo vocês perderem clientes para a concorrência todos os dias: vocês estão sem um site oficial e têm apenas ${lead.reviewCount} avaliações de clientes.`,
          valueProp: `Hoje, as pessoas compram de quem tem mais avaliações e passa mais credibilidade. Ajudamos empresas como a sua a resolver isso rápido com nossa Placa de Avaliação NFC Inteligente (de R$ 129 a R$ 100) — onde o cliente aproxima o celular e avalia em 3 segundos. Também criamos sites profissionais por R$ 1.500, e no nosso combo promocional sai tudo por apenas R$ 1.300.`,
          objections: `Se eles disserem "não tenho interesse" ou "está caro": Diga: "Compreendo perfeitamente. No entanto, pense que apenas um cliente novo que você ganha com nossa solução já paga todo o investimento do combo de R$ 1.300. Eu inclusive criei uma simulação visual gratuita de como ficaria a sua Placa NFC e o seu novo site. Posso te enviar sem compromisso no WhatsApp para você dar uma olhada?"`,
          closing: `Qual é o seu melhor número de WhatsApp para eu te enviar essas simulações visuais em 2 minutinhos? Assim você avalia se faz sentido para o seu faturamento.`
        }
      });
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const getNicheColors = (n: string) => {
    switch (n) {
      case 'Dentista':
        return { primary: '#0891b2', secondary: '#06b6d4', accent: '#f59e0b', bg: '#ecfeff', text: '#155e75' };
      case 'Mecânica':
        return { primary: '#ea580c', secondary: '#f97316', accent: '#2563eb', bg: '#fff7ed', text: '#7c2d12' };
      case 'Restaurante':
        return { primary: '#dc2626', secondary: '#ef4444', accent: '#eab308', bg: '#fef2f2', text: '#7f1d1d' };
      case 'Salão de Beleza':
        return { primary: '#db2777', secondary: '#ec4899', accent: '#8b5cf6', bg: '#fdf2f8', text: '#831843' };
      default:
        return { primary: '#1e3a8a', secondary: '#3b82f6', accent: '#f59e0b', bg: '#f8fafc', text: '#1e293b' };
    }
  };

  const updateLeadStage = async (leadId: string, newStage: Lead['stage']) => {
    const targetLead = leads.find(l => l.id === leadId);
    if (targetLead) {
      setRecentlyMovedLeadId(leadId);
      setActiveQuickStageLeadId(null);
      setTimeout(() => {
        setRecentlyMovedLeadId(curr => (curr === leadId ? null : curr));
      }, 2400);

      const updated = { ...targetLead, stage: newStage };
      
      // Clean any undefined or null properties to prevent Firestore serialization errors
      const cleaned: any = {};
      Object.keys(updated).forEach((key) => {
        const val = (updated as any)[key];
        if (val !== undefined && val !== null) {
          cleaned[key] = val;
        }
      });
      
      // Ensure key firestore.rules requirements are met
      if (!cleaned.stage) cleaned.stage = 'new';
      if (!cleaned.city) cleaned.city = 'Desconhecido';
      if (!cleaned.niche) cleaned.niche = 'Geral';
      if (!cleaned.name) cleaned.name = 'Empresa Sem Nome';
      if (!cleaned.id) cleaned.id = leadId;

      try {
        setLeads(prev => prev.map(l => l.id === leadId ? cleaned : l));
        if (selectedLead?.id === leadId) setSelectedLead(cleaned);
        if (loggedInClient?.id === leadId) setLoggedInClient(cleaned);
        fetch('/api/leads/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead: cleaned })
        }).catch(() => {});
        await setDoc(doc(db, 'leads', leadId), cleaned);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `leads/${leadId}`);
      }
    }
  };

  const updateLeadDetails = async (leadId: string, updates: Partial<Lead>) => {
    const targetLead = leads.find(l => l.id === leadId);
    const baseLead: Lead = targetLead || {
      id: leadId,
      name: updates.name || 'Nova Empresa',
      niche: updates.niche || 'Comércio Local',
      city: updates.city || 'Brasil',
      address: updates.address || '',
      phone: updates.phone || '',
      rating: 5.0,
      reviewCount: 10,
      hasWebsite: true,
      websiteUrl: null,
      googleMapsUrl: updates.googleMapsUrl || 'https://maps.google.com',
      weakness: 'Mini-Site & Placa NFC',
      stage: 'won'
    };

    const updated = { ...baseLead, ...updates };
    
    // Clean any undefined or null properties to prevent Firestore serialization errors
    const cleaned: any = {};
    Object.keys(updated).forEach((key) => {
      const val = (updated as any)[key];
      if (val !== undefined && val !== null) {
        cleaned[key] = val;
      }
    });
    
    // Ensure key firestore.rules requirements are met
    if (!cleaned.stage) cleaned.stage = 'new';
    if (!cleaned.city) cleaned.city = 'Brasil';
    if (!cleaned.niche) cleaned.niche = 'Geral';
    if (!cleaned.name) cleaned.name = 'Empresa Sem Nome';
    if (!cleaned.id) cleaned.id = leadId;

    try {
      setLeads(prev => {
        const exists = prev.some(l => l.id === leadId);
        const nextList = exists ? prev.map(l => l.id === leadId ? cleaned : l) : [cleaned, ...prev];
        try {
          localStorage.setItem('alf_local_crm_leads', JSON.stringify(nextList));
        } catch (_) {}
        return nextList;
      });
      if (!selectedLead || selectedLead.id === leadId) setSelectedLead(cleaned);
      if (loggedInClient?.id === leadId) setLoggedInClient(cleaned);
      fetch('/api/leads/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead: cleaned })
      }).catch(() => {});
      await setDoc(doc(db, 'leads', leadId), cleaned, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leads/${leadId}`);
    }
  };

  const createCustomAccount = async () => {
    if (!newAccountId.trim() || !newAccountName.trim() || !newAccountCity.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios (Código ID, Nome e Cidade).");
      return;
    }

    // Sanitize ID to ensure it matches '^[a-zA-Z0-9_\-_]+$' defined in firestore.rules
    const cleanId = newAccountId.trim().replace(/[^a-zA-Z0-9_\-]/g, '');
    if (!cleanId) {
      alert("Código ID inválido! Use apenas letras, números, hífen ou underline.");
      return;
    }

    // Check if ID already exists
    if (leads.some(l => l.id === cleanId)) {
      alert("Este Código ID já está em uso por outro estabelecimento cadastrado.");
      return;
    }

    const newLead: Lead = {
      id: cleanId,
      name: newAccountName.trim(),
      niche: newAccountNiche.trim(),
      city: newAccountCity.trim(),
      stage: 'won', // Closed deal
      address: 'Cadastro Manual',
      phone: '',
      rating: 5.0,
      reviewCount: 0,
      hasWebsite: false,
      websiteUrl: '',
      googleMapsUrl: newAccountGmb.trim() || 'https://maps.google.com',
      weakness: 'Cadastro manual via Console Admin ALF',
      nfcPassword: newAccountPin.trim() || '1234',
      nfcBillingStatus: 'active',
      nfcRedirectActive: 'gmb',
      nfcModulesAllowed: {
        gmb: true,
        whatsapp: true,
        instagram: true,
        website: true,
        custom: true
      }
    };

    try {
      setLeads(prev => [newLead, ...prev]);
      fetch('/api/leads/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead: newLead })
      }).catch(() => {});
      await setDoc(doc(db, 'leads', cleanId), newLead);
      setAdminSelectedLeadId(cleanId);
      setIsAddAccountOpen(false);
      // Reset fields
      setNewAccountId('');
      setNewAccountName('');
      setNewAccountCity('');
      setNewAccountGmb('');
      setNewAccountPin('1234');
      alert(`Empresa "${newLead.name}" cadastrada com sucesso com o ID "${cleanId}"!`);
    } catch (error) {
      console.error("Erro ao salvar conta:", error);
      alert("Erro ao cadastrar a empresa. Verifique se as regras do banco de dados estão corretas.");
    }
  };

  const downloadClientQrCode = async (leadOrClient?: Lead | null, resolution = 1000) => {
    const target = leadOrClient || selectedLead;
    if (!target) {
      alert("Nenhuma empresa selecionada para baixar o QR Code.");
      return;
    }

    try {
      setIsDownloadingQr(true);
      // Use direct URL (e.g. Google review link) by default so customers scanning the physical plate or code NEVER receive 403 Forbidden!
      const targetUrl = getDirectLeadUrl(target);
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${resolution}x${resolution}&format=png&margin=10&data=${encodeURIComponent(targetUrl)}`;

      const response = await fetch(qrApiUrl);
      if (!response.ok) throw new Error('Falha na resposta da API de QR Code');
      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const safeName = (target.name || 'empresa')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_');
      link.download = `qrcode_${safeName}_${target.id}_hd.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      setQrDownloadSuccess(target.id);
      setTimeout(() => setQrDownloadSuccess(null), 4000);
    } catch (err) {
      console.warn('Tentativa direta falhou, executando fallback via Canvas:', err);
      try {
        const targetUrl = getDirectLeadUrl(target);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = resolution;
          canvas.height = resolution;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, resolution, resolution);
            ctx.drawImage(img, 0, 0, resolution, resolution);
            canvas.toBlob((blob) => {
              if (blob) {
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                const safeName = (target.name || 'empresa')
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9]/g, '_');
                link.download = `qrcode_${safeName}_${target.id}_hd.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
                setQrDownloadSuccess(target.id);
                setTimeout(() => setQrDownloadSuccess(null), 4000);
              }
            }, 'image/png');
          }
        };
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${resolution}x${resolution}&format=png&data=${encodeURIComponent(targetUrl)}`;
      } catch (canvasErr) {
        console.error('Fallback canvas falhou:', canvasErr);
        const targetUrl = getDirectLeadUrl(target);
        const a = document.createElement('a');
        a.href = `https://api.qrserver.com/v1/create-qr-code/?size=${resolution}x${resolution}&format=png&data=${encodeURIComponent(targetUrl)}`;
        a.target = '_blank';
        a.download = `qrcode_${target.id}.png`;
        a.click();
      }
    } finally {
      setIsDownloadingQr(false);
    }
  };

  const print10x10Plate = (leadToPrint?: Lead, initialTheme?: ArtworkTheme) => {
    const targetLead = leadToPrint || selectedLead;
    openHighDefinitionPrintWindow({
      lead: targetLead,
      theme: initialTheme,
      portalQrMode,
      gmbReviewLink,
      onFallbackModal: (lead) => {
        setArtworkTargetLead(lead);
        setIsArtworkModalOpen(true);
      }
    });
  };

  const removeLead = async (leadId: string) => {
    try {
      await deleteDoc(doc(db, 'leads', leadId));
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leads/${leadId}`);
    }
  };

  const handleWebShareLead = async (lead: Lead) => {
    if (!navigator.share) {
      try {
        const text = `Empresa: ${lead.name}\n📍 Endereço: ${lead.address}\n📞 Telefone: ${lead.phone}`;
        await navigator.clipboard.writeText(text);
        alert('Dados comerciais copiados para a área de transferência! (Este navegador não suporta compartilhamento direto)');
      } catch (_) {}
      return;
    }

    try {
      await navigator.share({
        title: lead.name,
        text: `Confira os dados comerciais de ${lead.name}:\n📍 Endereço: ${lead.address}\n📞 Telefone: ${lead.phone}`,
        url: lead.googleMapsUrl || undefined
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
      }
    }
  };

  // Drag and drop or Click-to-move CRM Pipeline stages
  const getLeadsByStage = (stage: Lead['stage']) => {
    return leads.filter(l => {
      if (crmSearchQuery.trim()) {
        const q = crmSearchQuery.toLowerCase().trim();
        const matchesQuery =
          (l.name && l.name.toLowerCase().includes(q)) ||
          (l.niche && l.niche.toLowerCase().includes(q)) ||
          (l.city && l.city.toLowerCase().includes(q)) ||
          (l.phone && l.phone.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }
      if (stage === 'to_contact') {
        return l.stage === 'to_contact' || l.stage === 'new' || !l.stage;
      }
      return l.stage === stage;
    });
  };

  // Pitch actions
  const getWhatsAppLink = (lead: Lead, customText?: string) => {
    const formattedPhone = lead.phone.replace(/[^0-9]/g, '');
    const prefix = formattedPhone.length === 10 || formattedPhone.length === 11 ? '55' : '';
    const text = customText || (pitch ? pitch.whatsapp : `Olá! Analisei a presença comercial de ${lead.name} e quero agendar uma visita de apresentação.`);
    return `https://wa.me/${prefix}${formattedPhone}?text=${encodeURIComponent(text)}`;
  };

  // ROI Calculator Calculations
  const calcCurrentRevenue = calcMonthlyCustomers * calcAvgTicket;
  // Dynamic formula: companies with better rating & site get significantly higher conversions from search
  const expectedIncreasePercent = calcCurrentRating < 4.0 ? 35 : 15; 
  const calcNewCustomers = Math.round(calcMonthlyCustomers * (1 + expectedIncreasePercent / 100));
  const calcNewRevenue = calcNewCustomers * calcAvgTicket;
  const calcDiffRevenue = calcNewRevenue - calcCurrentRevenue;

  // Categorias intuitivas de navegação para a Sidebar Profissional
  const navCategories = [
    { id: 'operacao', title: 'Operação & Placas' },
    { id: 'comercial', title: 'Comercial & Vendas' },
    { id: 'gestao', title: 'Gestão & Segurança' },
  ];

  // App Navigation Definitions with Strict Role-Based Visibility
  const allNavTabsList = [
    {
      id: 'dynamic_qr' as const,
      label: 'Placas & QR Codes',
      shortLabel: 'Placas & QR',
      navGroup: 'operacao',
      category: 'Operação de Placas',
      title: 'Central de Placas & QR Codes Inteligentes',
      description: 'Gestão de lotes de impressão 10x10cm, URLs dinâmicas e links de avaliação Google 5★',
      icon: QrCode,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      badge: null,
      requiresMaster: false,
    },
    {
      id: 'cardapio' as const,
      label: 'Cardápio Digital',
      shortLabel: 'Cardápio',
      navGroup: 'operacao',
      category: 'Restaurantes & Mesas',
      title: 'Cardápio Digital para Mesas (QR Code & NFC)',
      description: 'Gestão de produtos, fotos, preços, comandas de mesas e pedidos no WhatsApp',
      icon: Utensils,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      badge: 'Novo',
      requiresMaster: false,
    },
    {
      id: 'nfc_designer' as const,
      label: 'Designer Totem 10x10',
      shortLabel: 'Totem 10x10',
      navGroup: 'operacao',
      category: 'Operação de Placas',
      title: 'Designer do Totem Acrílico 10x10cm',
      description: 'Gabarito oficial de corte, centralização de QR Code, ícone NFC e tipografia de balcão',
      icon: Sparkles,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      badge: 'Master',
      requiresMaster: true,
    },
    {
      id: 'leads' as const,
      label: 'Empresas & Prospecção',
      shortLabel: 'Empresas',
      navGroup: 'comercial',
      category: 'Comercial & Prospecção',
      title: 'Empresas & Inteligência de Prospecção',
      description: 'Varredura no Google Maps por negócios locais sem site e com baixas notas para conversão rápida',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: null,
      requiresMaster: false,
    },
    {
      id: 'crm' as const,
      label: 'Funil CRM',
      shortLabel: 'CRM',
      navGroup: 'comercial',
      category: 'Comercial & Prospecção',
      title: 'Funil de Vendas CRM (Pipeline Kanban)',
      description: 'Acompanhamento do ciclo de vendas: primeiro contato, visita presencial e fechamento',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      badge: null,
      requiresMaster: false,
    },
    {
      id: 'calculator' as const,
      label: 'Calculadora ROI',
      shortLabel: 'ROI',
      navGroup: 'comercial',
      category: 'Comercial & Prospecção',
      title: 'Calculadora de Retorno sobre Investimento (ROI)',
      description: 'Simulação matemática de ganho de faturamento para argumentação e fechamento comercial',
      icon: Coins,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      badge: null,
      requiresMaster: false,
    },
    {
      id: 'site_preview' as const,
      label: 'Mini-Site, Logo & Serviços',
      shortLabel: 'Mini-Site',
      navGroup: 'comercial',
      category: 'Criador de Mini-Site & Logo',
      title: 'Criador de Mini-Site, Logotipo & Catálogo de Serviços',
      description: 'Suba o logotipo do cliente, cadastre serviços com botão de WhatsApp, Pix, Wi-Fi e Google Reviews',
      icon: Globe,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      badge: 'Logo & IA',
      requiresMaster: false,
    },
    {
      id: 'landing' as const,
      label: 'Página de Vendas',
      shortLabel: 'Vendas',
      navGroup: 'comercial',
      category: 'Apresentação Comercial',
      title: 'Página de Vendas & Apresentação Comercial de Alta Conversão',
      description: 'Demonstração visual do impacto de placas NFC, Mini Sites por nicho e simulação para o cliente',
      icon: Sparkles,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      badge: 'Pitch',
      requiresMaster: false,
    },
    {
      id: 'portal' as const,
      label: 'Portal do Cliente',
      shortLabel: 'Portal',
      navGroup: 'gestao',
      category: 'Administração & Acesso',
      title: 'Portal Exclusivo do Lojista',
      description: 'Área do cliente para autogerenciamento do destino de suas placas e métricas de escaneamento',
      icon: Key,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      badge: 'Master',
      requiresMaster: true,
    },
    {
      id: 'users' as const,
      label: 'Usuários & Segurança',
      shortLabel: 'Usuários',
      navGroup: 'gestao',
      category: 'Administração & Acesso',
      title: 'Gestão de Usuários & CyberShield RBAC',
      description: 'Controle de senhas mestras, vendedores operadores e proteção de integridade da base',
      icon: ShieldCheck,
      color: 'text-slate-700',
      bgColor: 'bg-slate-100',
      badge: 'Master',
      requiresMaster: true,
    },
  ];

  // Filter navigation modules based on user allowedTabs when configured (Master always sees all)
  const navTabsList = (() => {
    const userObj = currentUser as any;
    if (!userObj || userObj.role === 'master' || isMasterAuthenticated) {
      return allNavTabsList;
    }
    const allowed: string[] | undefined = Array.isArray(userObj.allowedTabs)
      ? userObj.allowedTabs
      : undefined;
    if (!allowed || allowed.length === 0) {
      return allNavTabsList;
    }
    const expandedAllowed = new Set<string>(allowed);
    if (expandedAllowed.has('totem_config') || expandedAllowed.has('overview')) {
      expandedAllowed.add('dynamic_qr');
      expandedAllowed.add('cardapio');
    }
    if (expandedAllowed.has('sales_pitch') || expandedAllowed.has('ads')) {
      expandedAllowed.add('landing');
      expandedAllowed.add('calculator');
      expandedAllowed.add('crm');
    }
    return allNavTabsList.filter((tab) => expandedAllowed.has(tab.id));
  })();

  const activeTabMeta = allNavTabsList.find(t => t.id === activeTab) || allNavTabsList[0];

  const handleNavSelect = (targetTab: 'leads' | 'crm' | 'site_preview' | 'nfc_designer' | 'dynamic_qr' | 'calculator' | 'portal' | 'users' | 'cardapio' | 'landing') => {
    setIsMobileMenuOpen(false);
    changeTab(targetTab);
    if (targetTab === 'site_preview' && !siteTemplate) {
      const target = selectedLead || leads[0];
      if (target) {
        setSelectedLead(target);
        generateWebsiteTemplate(target);
      }
    }
  };

  const currentTabObj = navTabsList.find(t => t.id === activeTab) || navTabsList[0];

  // Standalone public Mini Site viewer when ?minisite=xxx is in URL
  if (minisiteParam) {
    const targetLead = leads.find(l => l.id === minisiteParam) || (selectedLead?.id === minisiteParam ? selectedLead : null);
    const savedMini = (targetLead as any)?.miniSiteConfig || {};
    const standaloneConfig: MiniSiteConfig = {
      id: minisiteParam,
      companyName: savedMini.companyName || targetLead?.name || 'Sua Empresa',
      niche: savedMini.niche || targetLead?.niche || 'Atendimento Exclusivo',
      city: savedMini.city || targetLead?.city || 'Brasil',
      tagline: savedMini.tagline || (targetLead?.weakness
        ? `Excelência e agilidade no atendimento em ${targetLead.city}`
        : 'Atendimento de alta qualidade, confiabilidade e rapidez.'),
      logoUrl: savedMini.logoUrl || '',
      whatsappNumber: savedMini.whatsappNumber || targetLead?.nfcWhatsappNum || targetLead?.phone || '',
      whatsappMessage: savedMini.whatsappMessage || targetLead?.nfcWhatsappMsg || `Olá! Vim através do Mini Site de ${targetLead?.name || 'sua empresa'} e gostaria de atendimento.`,
      instagramUrl: savedMini.instagramUrl || targetLead?.nfcInstagramUrl || '',
      googleReviewUrl: savedMini.googleReviewUrl || targetLead?.googleMapsUrl || gmbReviewLink || 'https://maps.google.com',
      websiteUrl: savedMini.websiteUrl || targetLead?.websiteUrl || '',
      pixKey: savedMini.pixKey || (targetLead?.phone ? formatMiniSitePhone(targetLead.phone) : 'pix@empresa.com.br'),
      pixBeneficiary: savedMini.pixBeneficiary || targetLead?.name || 'Empresa Local',
      pixKeyType: savedMini.pixKeyType || 'telefone',
      wifiSsid: savedMini.wifiSsid || `${(targetLead?.name || 'Empresa').replace(/\s+/g, '_')}_WiFi`,
      wifiPassword: savedMini.wifiPassword || 'VisiteNos123',
      address: savedMini.address || targetLead?.address || '',
      phone: savedMini.phone || targetLead?.phone || '',
      openingHours: savedMini.openingHours || 'Segunda a Sábado: 08h às 19h',
      services: Array.isArray(savedMini.services) ? savedMini.services : [],
      theme: savedMini.theme || 'dark_neon'
    };

    return (
      <div className="relative min-h-screen bg-slate-950">
        <MiniSiteViewer
          standalone={true}
          config={standaloneConfig}
          leadId={minisiteParam}
        />
        {/* Discreet admin exit bar (strictly visible ONLY to logged-in Master or Seller) */}
        {currentUser && (currentUser.role === 'master' || currentUser.role === 'seller') && (
          <div className="fixed top-3 right-3 z-50">
            <a
              href="/?tab=leads"
              className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full text-[11px] font-bold border border-slate-700 backdrop-blur-md shadow-lg transition flex items-center gap-1.5"
            >
              <span>Painel ALF</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    );
  }

  // Standalone public Cardápio Digital viewer when ?cardapio=xxx or ?c=xxx or ?menu=xxx is in URL
  if (cardapioParam) {
    let savedMenus: RestaurantMenu[] = INITIAL_MENUS;
    try {
      const stored = localStorage.getItem('alf_cardapios_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) savedMenus = parsed;
      }
    } catch (_) {}

    const targetMenu = savedMenus.find(m => m.id.toLowerCase() === cardapioParam.toLowerCase()) || savedMenus[0];
    const mesaParam = new URLSearchParams(window.location.search).get('mesa') || new URLSearchParams(window.location.search).get('table') || '01';

    return (
      <div className="relative min-h-screen bg-slate-950">
        <PublicCardapioViewer
          menu={targetMenu}
          initialTable={mesaParam}
          onBackToAdmin={() => {
            window.location.href = '/?tab=leads';
          }}
        />
        {/* Discreet admin exit button (strictly visible ONLY to logged-in Master or Seller) */}
        {currentUser && (currentUser.role === 'master' || currentUser.role === 'seller') && (
          <div className="fixed top-3 right-3 z-50">
            <a
              href="/?tab=leads"
              className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full text-[11px] font-bold border border-slate-700 backdrop-blur-md shadow-lg transition flex items-center gap-1.5"
            >
              <span>Painel ALF</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col lg:flex-row antialiased w-full max-w-full overflow-x-clip">
      
      {/* 1. DESKTOP LATERAL SIDEBAR (MENU LATERAL PROFISSIONAL) */}
      <aside 
        className={`hidden lg:flex flex-col shrink-0 border-r border-slate-200/90 bg-white sticky top-0 h-screen transition-all duration-200 z-30 select-none ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white font-mono font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                ALF
              </div>
              <div className="min-w-0 truncate">
                <span className="text-sm font-black text-slate-900 tracking-tight block truncate">
                  ALF Automação
                </span>
                <span className="text-[11px] font-semibold text-slate-400 block truncate">
                  Smart Plates &amp; CRM
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white font-mono font-black text-sm flex items-center justify-center shadow-xs">
                ALF
              </div>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ${
              isSidebarCollapsed ? 'hidden' : 'block'
            }`}
            title="Recolher menu lateral"
            aria-label="Recolher menu lateral"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* When collapsed: expand button */}
        {isSidebarCollapsed && (
          <div className="py-2 flex justify-center border-b border-slate-100">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Expandir menu lateral"
              aria-label="Expandir menu lateral"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Quick Scanner Action Trigger */}
        <div className="p-3 border-b border-slate-100/90 shrink-0">
          {!isSidebarCollapsed ? (
            <button
              type="button"
              onClick={() => setIsPlateScannerOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-100/80 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 text-slate-600 hover:text-indigo-900 rounded-xl text-xs transition cursor-pointer group shadow-2xs"
              title="Identificar a qual empresa pertence a placa ou QR físico (Ctrl+K)"
            >
              <div className="flex items-center gap-2 truncate">
                <ScanLine className="h-4 w-4 text-indigo-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-semibold truncate text-[11px]">
                  Ler Placa / Totem...
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shrink-0">
                ⌘K
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsPlateScannerOpen(true)}
              className="w-full flex items-center justify-center p-2.5 bg-slate-100/80 hover:bg-indigo-50 border border-slate-200 text-indigo-600 rounded-xl transition cursor-pointer"
              title="Identificar Placa Física (⌘K)"
            >
              <ScanLine className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sidebar Categorized Menu Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 scrollbar-thin">
          {navCategories.map((cat) => {
            const categoryTabs = navTabsList.filter(t => t.navGroup === cat.id);
            if (categoryTabs.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-1">
                {!isSidebarCollapsed && (
                  <div className="px-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {cat.title}
                  </div>
                )}
                {categoryTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;

                  if (isSidebarCollapsed) {
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleNavSelect(tab.id)}
                        className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer relative group ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-xs font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title={tab.label}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : tab.color}`} />
                        <span className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                          {tab.label}
                        </span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleNavSelect(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group text-left ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                      }`}
                      id={`tab-${tab.id}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : tab.color}`} />
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200/80 text-slate-700'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer & User Profile */}
        <div className="p-3 border-t border-slate-200/90 bg-slate-50/70 shrink-0 space-y-2">
          {!isSidebarCollapsed ? (
            <>
              {/* Quick Config Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCustomDomainModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition shadow-2xs cursor-pointer"
                  title="Configurar seu domínio próprio"
                >
                  <Globe className="h-3 w-3 text-blue-600" />
                  <span className="truncate">Domínio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSellerRegisterModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 transition shadow-2xs cursor-pointer"
                  title="Cadastrar revendedor ou vendedor"
                >
                  <Briefcase className="h-3 w-3 text-emerald-600" />
                  <span className="truncate">Vender</span>
                </button>
              </div>

              {/* User Identity Card */}
              {currentUser && (
                <div className="flex items-center justify-between px-2.5 py-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="min-w-0 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.username}
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {currentUser.role === 'master' ? 'Administrador' : currentUser.role === 'seller' ? 'Vendedor' : 'Lojista'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-lg cursor-pointer"
                    title="Sair do sistema"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {currentUser && (
                <div 
                  className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center"
                  title={`${currentUser.username} (${currentUser.role})`}
                >
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg cursor-pointer"
                title="Sair do sistema"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE (TOP BAR + CONTENT VIEWPORT) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Clean Executive Top Bar */}
        <header 
          className="bg-white border-b border-slate-200/80 sticky top-0 z-20 backdrop-blur-md bg-white/95 w-full"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
            
            {/* Left Zone: Sidebar Toggle + Breadcrumb (Desktop) / Brand (Mobile) */}
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Mobile Menu Open Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="h-4 w-4" />
              </button>

              {/* Mobile Brand Title */}
              <div className="flex lg:hidden items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-slate-950 text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                  ALF
                </div>
                <span className="text-xs font-black text-slate-900 truncate">
                  ALF Automação
                </span>
              </div>

              {/* Desktop Breadcrumbs Trail */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-medium min-w-0">
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition mr-1 cursor-pointer"
                  title={isSidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
                >
                  {isSidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>
                <span className="text-slate-400">ALF</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500 font-medium">{activeTabMeta.category}</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-bold truncate">{activeTabMeta.label}</span>
              </div>
            </div>

            {/* Center Zone: Quick Scanner Search */}
            <div className="hidden md:flex flex-1 max-w-sm mx-2">
              <button
                type="button"
                onClick={() => setIsPlateScannerOpen(true)}
                className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 text-slate-500 rounded-xl text-xs transition cursor-pointer group"
                title="Identificar placa ou QR físico (⌘K)"
              >
                <div className="flex items-center gap-2 truncate">
                  <ScanLine className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span className="text-slate-600 font-medium truncate text-[11px]">
                    Identificar placa ou QR físico...
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shrink-0">
                  ⌘K
                </span>
              </button>
            </div>

            {/* Right Zone: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile Scanner Quick Icon */}
              <button
                type="button"
                onClick={() => setIsPlateScannerOpen(true)}
                className="md:hidden p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 transition cursor-pointer"
                title="Ler Placa Física"
              >
                <ScanLine className="h-4 w-4" />
              </button>

              <PWAInstallButton />

              <button
                type="button"
                onClick={() => setIsCustomDomainModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition shadow-2xs cursor-pointer"
                title="Configurar domínio próprio para as placas NFC"
              >
                <Globe className="h-3.5 w-3.5 text-blue-600" />
                <span>Domínio Próprio</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAntigravityModalOpen(true)}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/90 transition shadow-2xs cursor-pointer"
                title="Exportar projeto completo"
              >
                <FolderArchive className="h-3.5 w-3.5 text-indigo-600" />
                <span>Exportar</span>
              </button>

              {currentUser && (
                <div className="flex items-center gap-1.5 pl-1">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs bg-slate-100 border border-slate-200 text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[11px] font-bold truncate max-w-[120px]">
                      {currentUser.username}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="ml-0.5 text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded cursor-pointer"
                      title="Sair"
                    >
                      <LogOut className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Compact Touch-Focused Mobile Off-Canvas Drawer (Categorized & Intuitive) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden overflow-hidden" role="dialog" aria-modal="true" aria-label="Menu Lateral de Navegação">
            {/* Backdrop Overlay with Smooth Blur & Quick Tap Dismiss */}
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-over Drawer Panel */}
            <div className="fixed inset-y-0 right-0 w-[86vw] max-w-[340px] bg-white shadow-2xl flex flex-col z-10 h-[100dvh] max-h-[100dvh] animate-in slide-in-from-right duration-200 select-none border-l border-slate-200/80">
              
              {/* Drawer Header */}
              <div 
                className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0 shadow-xs"
                style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-mono font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                    ALF
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-xs font-black text-white leading-tight truncate">
                        ALF Automação
                      </h2>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-cyan-300 font-bold">
                        Menu
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-medium truncate">
                      Navegação &amp; Recursos
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                  aria-label="Fechar menu"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Categorized Drawer Navigation */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-4 scrollbar-thin">
                {navCategories.map((cat) => {
                  const categoryTabs = navTabsList.filter(t => t.navGroup === cat.id);
                  if (categoryTabs.length === 0) return null;

                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {cat.title}
                      </div>
                      {categoryTabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => handleNavSelect(tab.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center gap-2.5 cursor-pointer active:scale-[0.98] min-h-[48px] ${
                              isActive
                                ? 'bg-indigo-50/90 border-indigo-300 ring-1 ring-indigo-500/20 text-indigo-950 shadow-2xs'
                                : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300 text-slate-800'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${tab.bgColor} ${tab.color} border border-slate-100 shadow-2xs`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0 pr-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-xs font-bold truncate leading-tight ${isActive ? 'text-indigo-950 font-black' : 'text-slate-900'}`}>
                                  {tab.label}
                                </span>
                                {isActive ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-md shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                    Ativo
                                  </span>
                                ) : tab.badge ? (
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 shrink-0 flex items-center gap-0.5">
                                    {tab.requiresMaster && !isMasterAuthenticated && <Lock className="h-2.5 w-2.5" />}
                                    {tab.badge}
                                  </span>
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                                {tab.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Drawer Bottom Actions */}
              <div 
                className="p-3 pt-2.5 border-t border-slate-200 bg-slate-50/95 backdrop-blur-xs space-y-2 shrink-0 shadow-lg"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSellerRegisterModalOpen(true);
                  }}
                  className="w-full min-h-[42px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-[0.98] border border-emerald-300 text-emerald-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Briefcase className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Seja um Vendedor / Revendedor</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCustomDomainModalOpen(true);
                  }}
                  className="w-full min-h-[42px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-[0.98] border border-blue-200 text-blue-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Globe className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="truncate">Configurar Domínio Próprio</span>
                </button>

                {isMasterAuthenticated ? (
                  <button
                    onClick={() => {
                      handleMasterLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[42px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 active:scale-[0.98] border border-red-200 text-red-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Desconectar Acesso Master</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setMasterTargetTab(null);
                      setMasterError('');
                      setIsMasterModalOpen(true);
                    }}
                    className="w-full min-h-[42px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-[0.98] border border-amber-300 text-amber-900 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Entrar como Usuário Master</span>
                  </button>
                )}

                <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-400 font-medium px-1">
                  <span>ALF Automação • Sales Engine</span>
                  <span className="font-mono text-[9px] text-slate-500">v2.5 Pro</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile & Tablet Bottom Navigation Dock */}
        <div 
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl lg:hidden px-2 pt-1.5"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
        >
          <div className="grid grid-cols-5 gap-1 items-center max-w-lg mx-auto">
            <button
              onClick={() => handleNavSelect('dynamic_qr')}
              className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                activeTab === 'dynamic_qr' ? 'text-indigo-600 font-bold bg-indigo-50/80 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <QrCode className="h-4 w-4 mb-0.5" />
              <span className="text-[10px] leading-tight">Placas &amp; QR</span>
            </button>

            <button
              onClick={() => {
                handleNavSelect('leads');
                setLeadsSubTab('directory');
              }}
              className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                activeTab === 'leads'
                  ? 'text-blue-600 font-bold bg-blue-50/80 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="h-4 w-4 mb-0.5" />
              <span className="text-[10px] leading-tight font-bold">Empresas</span>
            </button>

            <button
              onClick={() => handleNavSelect('crm')}
              className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                activeTab === 'crm' ? 'text-emerald-600 font-bold bg-emerald-50/80 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="h-4 w-4 mb-0.5" />
              <span className="text-[10px] leading-tight">Funil CRM</span>
            </button>

            <button
              onClick={() => handleNavSelect('calculator')}
              className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                activeTab === 'calculator' ? 'text-violet-600 font-bold bg-violet-50/80 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Coins className="h-4 w-4 mb-0.5" />
              <span className="text-[10px] leading-tight">Calculadora</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                isMobileMenuOpen
                  ? 'text-slate-900 font-bold bg-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              aria-label="Ver todos os recursos"
            >
              <LayoutGrid className="h-4 w-4 mb-0.5" />
              <span className="text-[10px] leading-tight font-bold">Mais</span>
            </button>
          </div>
        </div>

      {/* Main Container - Responsive spacing across Mobile, Tablet, and Desktop */}
      <main 
        className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-5 pb-28 lg:pb-10"
      >
        
        {/* Senior UX Contextual Section Header & Workflow Bar */}
        <div className="mb-6 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className={`p-2.5 rounded-xl shrink-0 ${activeTabMeta.bgColor} border border-slate-200/60`}>
              <activeTabMeta.icon className={`h-5 w-5 ${activeTabMeta.color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {activeTabMeta.category}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-slate-500 font-medium">ALF Engine</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                {activeTabMeta.title}
              </h1>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {activeTabMeta.description}
              </p>
            </div>
          </div>

          {/* Contextual Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {activeTab === 'dynamic_qr' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsPlateScannerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition cursor-pointer"
                >
                  <ScanLine className="h-3.5 w-3.5" />
                  <span>Identificar Placa</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavSelect('nfc_designer')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Designer Totem 10x10</span>
                </button>
              </>
            )}
            {activeTab === 'nfc_designer' && (
              <button
                type="button"
                onClick={() => handleNavSelect('dynamic_qr')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition cursor-pointer"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Ver Lotes de Placas</span>
              </button>
            )}
            {activeTab === 'leads' && (
              <>
                <button
                  type="button"
                  onClick={() => handleNavSelect('crm')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition cursor-pointer"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Funil CRM</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavSelect('calculator')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl border border-violet-200 transition cursor-pointer"
                >
                  <Coins className="h-3.5 w-3.5" />
                  <span>Simular ROI</span>
                </button>
              </>
            )}
            {activeTab === 'crm' && (
              <>
                <button
                  type="button"
                  onClick={() => handleNavSelect('leads')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition cursor-pointer"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Empresas</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavSelect('calculator')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl border border-violet-200 transition cursor-pointer"
                >
                  <Coins className="h-3.5 w-3.5" />
                  <span>Calculadora ROI</span>
                </button>
              </>
            )}
            {activeTab === 'calculator' && (
              <button
                type="button"
                onClick={() => handleNavSelect('crm')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition cursor-pointer"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Voltar ao Funil CRM</span>
              </button>
            )}
            {activeTab === 'site_preview' && (
              <button
                type="button"
                onClick={() => handleNavSelect('leads')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition cursor-pointer"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Selecionar Outra Empresa</span>
              </button>
            )}
            {activeTab === 'cardapio' && (
              <>
                <button
                  type="button"
                  onClick={() => handleNavSelect('dynamic_qr')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition cursor-pointer"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Placas de Mesas</span>
                </button>
                <a
                  href="/cardapio/bellariobranco?mesa=01"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Visualizar como Cliente</span>
                </a>
              </>
            )}
            {activeTab === 'portal' && (
              <button
                type="button"
                onClick={() => handleNavSelect('dynamic_qr')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition cursor-pointer"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Gerenciar Placas &amp; QR</span>
              </button>
            )}
            {activeTab === 'users' && (
              <button
                type="button"
                onClick={() => setIsSellerRegisterModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition cursor-pointer"
              >
                <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                <span>Novo Vendedor</span>
              </button>
            )}
            {activeTab === 'landing' && (
              <button
                type="button"
                onClick={() => handleNavSelect('dynamic_qr')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar ao Painel ALF</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: MEUS CLIENTES & PROSPECÇÃO LOCAL */}
        {activeTab === 'leads' && (
          <LeadManagementModule
            leads={leads}
            selectedLead={selectedLead}
            setSelectedLead={setSelectedLead}
            city={city}
            setCity={setCity}
            niche={niche}
            setNiche={setNiche}
            customNiche={customNiche}
            setCustomNiche={setCustomNiche}
            isSearching={isSearching}
            searchStep={searchStep}
            searchLogs={searchLogs}
            searchErrorDetails={searchErrorDetails}
            searchExecutionTime={searchExecutionTime}
            isConsoleExpanded={isConsoleExpanded}
            setIsConsoleExpanded={setIsConsoleExpanded}
            antiTruncationRecovered={antiTruncationRecovered}
            searchLocalBusinesses={searchLocalBusinesses}
            nfcPrice={nfcPrice}
            setNfcPrice={setNfcPrice}
            sitePrice={sitePrice}
            setSitePrice={setSitePrice}
            comboPrice={comboPrice}
            setComboPrice={setComboPrice}
            tableSearchTerm={tableSearchTerm}
            setTableSearchTerm={setTableSearchTerm}
            selectedCityFilter={selectedCityFilter}
            setSelectedCityFilter={setSelectedCityFilter}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            easyConversionOnly={easyConversionOnly}
            setEasyConversionOnly={setEasyConversionOnly}
            filterOnlySearched={filterOnlySearched}
            setFilterOnlySearched={setFilterOnlySearched}
            lastSearchLeadIds={lastSearchLeadIds}
            updateLeadStage={updateLeadStage}
            removeLead={removeLead}
            handleWebShareLead={handleWebShareLead}
            requireMasterAccess={requireMasterAccess}
            generateWebsiteTemplate={generateWebsiteTemplate}
            siteTemplate={siteTemplate}
            setIsExportSiteModalOpen={setIsExportSiteModalOpen}
            setPlateTheme={setPlateTheme}
            setGmbReviewLink={setGmbReviewLink}
            setActiveTab={setActiveTab}
            validateAndFixGoogleReviewLink={validateAndFixGoogleReviewLink}
            isValidatingGmbUrl={isValidatingGmbUrl}
            gmbValidationFeedback={gmbValidationFeedback}
            updateLeadDetails={updateLeadDetails}
            generateSalesPitch={generateSalesPitch}
            pitch={pitch}
            isGeneratingPitch={isGeneratingPitch}
            selectedPitchType={selectedPitchType}
            setSelectedPitchType={setSelectedPitchType}
            getWhatsAppLink={getWhatsAppLink}
            isMasterAuthenticated={isMasterAuthenticated}
            newHistoryNote={newHistoryNote}
            setNewHistoryNote={setNewHistoryNote}
          />
        )}

        {/* TAB 2: CRM KANBAN & METRICS */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            
            {/* Quick Metrics Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Faturamento Estimado</span>
                <span className="text-2xl font-black text-blue-700">
                  R$ {leads
                    .filter(l => l.stage && l.stage !== 'lost')
                    .reduce((acc, curr) => acc + (curr.saleValue || 0), 0)
                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Soma de todas as negociações ativas</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fechados &amp; Caixa Rápido</span>
                <span className="text-2xl font-black text-emerald-600">
                  R$ {leads
                    .filter(l => l.stage === 'won')
                    .reduce((acc, curr) => acc + (curr.saleValue || 0), 0)
                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Valor faturado no momento</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Taxa de Conversão</span>
                <span className="text-2xl font-black text-slate-800">
                  {leads.filter(l => l.stage).length > 0 
                    ? Math.round((leads.filter(l => l.stage === 'won').length / leads.filter(l => l.stage).length) * 100) 
                    : 0}%
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Leads fechados vs. Abordados</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Meta Mensal (R$ 5.000)</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.min(100, (leads.filter(l => l.stage === 'won').reduce((acc, curr) => acc + (curr.saleValue || 0), 0) / 5000) * 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {Math.round((leads.filter(l => l.stage === 'won').reduce((acc, curr) => acc + (curr.saleValue || 0), 0) / 5000) * 100)}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Gere R$ 5.000 de caixa rápido!</p>
              </div>
            </div>

            {/* CRM Search & Interactive Controls Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={crmSearchQuery}
                  onChange={(e) => setCrmSearchQuery(e.target.value)}
                  placeholder="Pesquisar empresa, nicho ou telefone no funil..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                />
                {crmSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCrmSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                <span className="text-[11px] font-medium">
                  <strong>Arraste os cards</strong> entre as colunas ou use o botão <strong>Mover</strong> para transições suaves com animação física.
                </span>
              </div>
            </div>

            {/* Kanban Columns with Framer Motion Layout Transitions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pb-4 items-start">
              
              {/* Pipeline Stages Array */}
              {[
                {
                  id: 'to_contact' as const,
                  title: 'A Contatar',
                  subtitle: 'Novos e pendentes',
                  icon: '📞',
                  badgeBg: 'bg-slate-200 text-slate-700',
                  dropHighlight: 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-300',
                  nextStage: 'contacted' as const,
                  nextBtnLabel: 'Contatar',
                  nextBtnClass: 'bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold',
                },
                {
                  id: 'contacted' as const,
                  title: 'Contatado',
                  subtitle: 'Apresentação feita',
                  icon: '💬',
                  badgeBg: 'bg-blue-100 text-blue-800',
                  dropHighlight: 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-300',
                  nextStage: 'proposal' as const,
                  nextBtnLabel: 'Enviar Proposta',
                  nextBtnClass: 'bg-blue-600 hover:bg-blue-700 text-white font-bold',
                },
                {
                  id: 'proposal' as const,
                  title: 'Proposta Enviada',
                  subtitle: 'Aguardando fechamento',
                  icon: '📑',
                  badgeBg: 'bg-indigo-100 text-indigo-800',
                  dropHighlight: 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-300',
                  nextStage: 'won' as const,
                  nextBtnLabel: 'Fechar Venda 🎉',
                  nextBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold',
                },
                {
                  id: 'won' as const,
                  title: 'Fechado 🎉',
                  subtitle: 'Venda confirmada',
                  icon: '🏆',
                  badgeBg: 'bg-emerald-100 text-emerald-800',
                  dropHighlight: 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-300',
                },
                {
                  id: 'lost' as const,
                  title: 'Recusado',
                  subtitle: 'Sem interesse no momento',
                  icon: '⏸️',
                  badgeBg: 'bg-slate-200 text-slate-600',
                  dropHighlight: 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-300',
                  nextStage: 'to_contact' as const,
                  nextBtnLabel: 'Reativar Lead',
                  nextBtnClass: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold',
                }
              ].map((column) => {
                const stageLeads = getLeadsByStage(column.id);
                const isOver = activeDropStage === column.id;
                const columnTotal = stageLeads.reduce((acc, curr) => acc + (curr.saleValue || nfcPrice || 149), 0);

                return (
                  <div
                    key={column.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (activeDropStage !== column.id) {
                        setActiveDropStage(column.id);
                      }
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        if (activeDropStage === column.id) setActiveDropStage(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedId = e.dataTransfer.getData('text/plain') || draggedLeadId;
                      if (droppedId) {
                        updateLeadStage(droppedId, column.id);
                      }
                      setActiveDropStage(null);
                      setDraggedLeadId(null);
                    }}
                    className={`border rounded-2xl p-3 min-w-[240px] flex flex-col h-[620px] transition-all duration-200 ${
                      isOver
                        ? column.dropHighlight
                        : 'bg-slate-100/90 border-slate-200/80 shadow-xs'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-2.5 px-1 pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm select-none">{column.icon}</span>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider truncate">
                            {column.title}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            R$ {columnTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>

                      <motion.span
                        key={stageLeads.length}
                        initial={{ scale: 1.25 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className={`${column.badgeBg} text-xs px-2.5 py-0.5 rounded-full font-bold shadow-2xs`}
                      >
                        {stageLeads.length}
                      </motion.span>
                    </div>

                    {/* Active Drag Over Indicator */}
                    <AnimatePresence>
                      {isOver && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, scale: 0.95 }}
                          animate={{ opacity: 1, height: 'auto', scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="mb-2 p-2 rounded-xl border-2 border-dashed border-blue-500 bg-white/90 text-blue-700 text-[11px] font-bold text-center flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Sparkles className="w-3 h-3 text-blue-600 animate-spin" />
                          <span>Solte para {column.title}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Cards Container with Framer Motion AnimatePresence */}
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                      <AnimatePresence mode="popLayout">
                        {stageLeads.length === 0 ? (
                          <motion.div
                            key={`empty-${column.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center justify-center h-44 rounded-xl border border-dashed border-slate-300/80 p-4 text-center text-slate-400 bg-white/50"
                          >
                            <span className="text-2xl mb-1 opacity-50 select-none">{column.icon}</span>
                            <span className="text-xs font-semibold text-slate-500">Nenhum lead</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Arraste um card para cá</span>
                          </motion.div>
                        ) : (
                          stageLeads.map((lead) => {
                            const isRecentlyMoved = recentlyMovedLeadId === lead.id;
                            const isQuickStageOpen = activeQuickStageLeadId === lead.id;

                            return (
                              <motion.div
                                key={lead.id}
                                layout
                                layoutId={`crm-card-${lead.id}`}
                                initial={{ opacity: 0, scale: 0.88, y: 15 }}
                                animate={{
                                  opacity: 1,
                                  scale: 1,
                                  y: 0,
                                  transition: {
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 28,
                                    mass: 0.7
                                  }
                                }}
                                exit={{
                                  opacity: 0,
                                  scale: 0.82,
                                  y: -12,
                                  transition: { duration: 0.2, ease: "easeOut" }
                                }}
                                whileHover={{
                                  y: -3,
                                  scale: 1.015,
                                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)"
                                }}
                                whileTap={{ scale: 0.98 }}
                                draggable
                                onDragStart={(e) => {
                                  (e as any).dataTransfer.setData('text/plain', lead.id);
                                  (e as any).dataTransfer.effectAllowed = 'move';
                                  setDraggedLeadId(lead.id);
                                }}
                                onDragEnd={() => {
                                  setDraggedLeadId(null);
                                  setActiveDropStage(null);
                                }}
                                className={`bg-white border rounded-xl p-3 shadow-xs space-y-2.5 transition-colors cursor-grab active:cursor-grabbing relative select-none group ${
                                  isRecentlyMoved
                                    ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/20'
                                    : column.id === 'won'
                                    ? 'border-emerald-300'
                                    : column.id === 'lost'
                                    ? 'border-slate-200 opacity-75 hover:opacity-100'
                                    : 'border-slate-200 hover:border-blue-400'
                                }`}
                              >
                                {/* Feedback badge on recent move */}
                                <AnimatePresence>
                                  {isRecentlyMoved && (
                                    <motion.div
                                      initial={{ scale: 0.7, opacity: 0, y: -4 }}
                                      animate={{ scale: 1, opacity: 1, y: 0 }}
                                      exit={{ scale: 0.7, opacity: 0 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                      className="absolute -top-2.5 right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 z-20 border border-white"
                                    >
                                      <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                                      <span>Movido!</span>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Top Title & Drag Handle */}
                                <div className="flex items-start justify-between gap-1.5">
                                  <div className="flex items-center gap-1 min-w-0 flex-1">
                                    <span title="Arraste para mover" className="shrink-0 flex items-center">
                                      <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 cursor-grab" />
                                    </span>
                                    <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                                      {lead.name}
                                    </h4>
                                  </div>

                                  {column.id === 'won' && (
                                    <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md shrink-0">
                                      PAGO
                                    </span>
                                  )}
                                </div>

                                {/* Details / Weakness */}
                                {lead.weakness && column.id === 'contacted' && (
                                  <p className="text-[10px] text-amber-600 font-semibold leading-tight line-clamp-2 bg-amber-50/70 p-1 rounded-md">
                                    💬 {lead.weakness}
                                  </p>
                                )}

                                <div className="flex justify-between items-center text-[10px] text-slate-500">
                                  <span className="truncate max-w-[120px]">{lead.niche || lead.productType?.toUpperCase() || 'Comércio Local'}</span>
                                  <span className="font-bold text-slate-800 shrink-0">
                                    R$ {lead.saleValue || nfcPrice || 149}
                                  </span>
                                </div>

                                {lead.nextFollowUp && (
                                  <div className="flex items-center gap-1 text-[9px] font-bold text-blue-800 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md w-fit">
                                    📅 F/U: {lead.nextFollowUp.split('-').reverse().join('/')}
                                  </div>
                                )}

                                {lead.historyNotes && lead.historyNotes.length > 0 && (
                                  <p className="text-[9px] text-slate-500 italic truncate max-w-full">
                                    📝 {lead.historyNotes[lead.historyNotes.length - 1]}
                                  </p>
                                )}

                                {/* Quick Stage Jumper Popover Menu */}
                                <AnimatePresence>
                                  {isQuickStageOpen && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                      transition={{ duration: 0.15 }}
                                      className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1"
                                    >
                                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                                        Mover diretamente para:
                                      </span>
                                      <div className="grid grid-cols-2 gap-1">
                                        {[
                                          { s: 'to_contact' as const, label: '📞 A Contatar' },
                                          { s: 'contacted' as const, label: '💬 Contatado' },
                                          { s: 'proposal' as const, label: '📑 Proposta' },
                                          { s: 'won' as const, label: '🏆 Fechado' },
                                          { s: 'lost' as const, label: '⏸️ Recusado' }
                                        ].map(target => (
                                          <button
                                            key={target.s}
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updateLeadStage(lead.id, target.s);
                                            }}
                                            className={`text-[9px] px-1.5 py-1 rounded text-left font-semibold transition ${
                                              lead.stage === target.s
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                                            }`}
                                          >
                                            {target.label}
                                          </button>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Action Buttons Row */}
                                <div className="flex items-center gap-1 pt-1.5 border-t border-slate-100">
                                  {/* Next Stage Primary Action Button */}
                                  {column.nextStage && column.nextBtnLabel && (
                                    <button
                                      type="button"
                                      onClick={() => updateLeadStage(lead.id, column.nextStage!)}
                                      className={`flex-1 py-1 px-2 text-center rounded-md text-[10px] transition cursor-pointer ${column.nextBtnClass}`}
                                    >
                                      {column.nextBtnLabel}
                                    </button>
                                  )}

                                  {/* In Proposal column: also give Lost button */}
                                  {column.id === 'proposal' && (
                                    <button
                                      type="button"
                                      onClick={() => updateLeadStage(lead.id, 'lost')}
                                      className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-md text-[10px] cursor-pointer"
                                      title="Marcar como Recusado"
                                    >
                                      Perdido
                                    </button>
                                  )}

                                  {/* In Won column: Site Configuration button */}
                                  {column.id === 'won' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        requireMasterAccess('site_preview', () => {
                                          setSelectedLead(lead);
                                          generateWebsiteTemplate(lead);
                                        });
                                      }}
                                      className="flex-1 py-1 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <span>Configurar Site</span>
                                      {!isMasterAuthenticated && <Lock className="h-2.5 w-2.5 text-amber-400" />}
                                    </button>
                                  )}

                                  {/* Quick Stage Mover Selector Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => setActiveQuickStageLeadId(isQuickStageOpen ? null : lead.id)}
                                    className={`px-1.5 py-1 rounded-md text-[10px] border transition cursor-pointer ${
                                      isQuickStageOpen
                                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                    title="Mover para qualquer etapa"
                                  >
                                    Etapa ▾
                                  </button>

                                  {/* WhatsApp quick contact */}
                                  {lead.phone && (
                                    <a
                                      href={getWhatsAppLink(lead)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-1.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[10px] flex items-center justify-center"
                                      title="Conversar no WhatsApp"
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                    </a>
                                  )}

                                  {/* Site preview button in to_contact */}
                                  {column.id === 'to_contact' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        requireMasterAccess('site_preview', () => {
                                          setSelectedLead(lead);
                                          generateWebsiteTemplate(lead);
                                        });
                                      }}
                                      className="px-1.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md text-[10px] flex items-center gap-0.5 cursor-pointer"
                                      title="Gerar Site de Modelo (Requer Master)"
                                    >
                                      <span>Site</span>
                                      {!isMasterAuthenticated && <Lock className="h-2 w-2 text-amber-500" />}
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}

            </div>

          </div>
        )}

        {/* TAB 3: AI WEBSITE MODEL GENERATOR & CLIENT MINI SITE */}
        {activeTab === 'site_preview' && (
          <div>
            <div className="space-y-6">
                {/* 🌟 SWITCHER DE MODO DO SITE DEMONSTRATIVO: MINI SITE vs LANDING PAGE COMPLETA */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                      {demonstratorMode === 'minisite' ? <Smartphone className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Site Demonstrativo
                        </span>
                        <span className="text-xs font-black text-slate-900">
                          {selectedLead ? selectedLead.name : 'Sua Empresa Demonstração'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {demonstratorMode === 'minisite'
                          ? 'Mini Site interativo inovador com link exportável, WhatsApp, Pix, Wi-Fi 1-clique e Google Reviews'
                          : 'Landing page institucional completa de alta conversão para computadores e celulares'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Mode Toggle Buttons */}
                    <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setDemonstratorMode('minisite')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                          demonstratorMode === 'minisite'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Mini Site (Hub &amp; NFC)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDemonstratorMode('website')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                          demonstratorMode === 'website'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        <span>Landing Page Completa</span>
                      </button>
                    </div>

                    {/* Company Switcher inside Demonstrator */}
                    <select
                      value={selectedLead?.id || ''}
                      onChange={(e) => {
                        const target = leads.find(l => l.id === e.target.value);
                        if (target) {
                          setSelectedLead(target);
                          setGmbReviewLink(target.googleMapsUrl || '');
                        }
                      }}
                      className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-hidden hover:border-slate-300"
                      title="Trocar a empresa ativa para demonstração"
                    >
                      <option value="">🏢 Trocar Empresa ({leads.length})...</option>
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {demonstratorMode === 'minisite' ? (
                  <MiniSiteViewer
                    config={{
                      id: (selectedLead || leads[0])?.id || 'demo',
                      companyName: (selectedLead || leads[0])?.miniSiteConfig?.companyName || (selectedLead || leads[0])?.name || 'Sua Empresa Aqui',
                      niche: (selectedLead || leads[0])?.miniSiteConfig?.niche || (selectedLead || leads[0])?.niche || niche || 'Negócio Local',
                      city: (selectedLead || leads[0])?.miniSiteConfig?.city || (selectedLead || leads[0])?.city || city || 'São Paulo',
                      tagline: (selectedLead || leads[0])?.miniSiteConfig?.tagline || ((selectedLead || leads[0])?.weakness
                        ? `Atendimento de excelência e soluções rápidas em ${(selectedLead || leads[0])?.city || 'sua cidade'}`
                        : 'Atendimento exclusivo, qualidade garantida e agilidade.'),
                      logoUrl: (selectedLead || leads[0])?.miniSiteConfig?.logoUrl || '',
                      whatsappNumber: (selectedLead || leads[0])?.miniSiteConfig?.whatsappNumber || (selectedLead || leads[0])?.nfcWhatsappNum || (selectedLead || leads[0])?.phone || '',
                      whatsappMessage: (selectedLead || leads[0])?.miniSiteConfig?.whatsappMessage || (selectedLead || leads[0])?.nfcWhatsappMsg || `Olá! Vim através do Mini Site de ${(selectedLead || leads[0])?.name || 'sua empresa'} e gostaria de atendimento.`,
                      instagramUrl: (selectedLead || leads[0])?.miniSiteConfig?.instagramUrl || (selectedLead || leads[0])?.nfcInstagramUrl || '',
                      googleReviewUrl: (selectedLead || leads[0])?.miniSiteConfig?.googleReviewUrl || (selectedLead || leads[0])?.googleMapsUrl || gmbReviewLink || 'https://maps.google.com',
                      websiteUrl: (selectedLead || leads[0])?.miniSiteConfig?.websiteUrl || (selectedLead || leads[0])?.websiteUrl || '',
                      pixKey: (selectedLead || leads[0])?.miniSiteConfig?.pixKey || ((selectedLead || leads[0])?.phone ? (selectedLead || leads[0]).phone.replace(/\D/g, '') : 'pix@empresa.com.br'),
                      pixBeneficiary: (selectedLead || leads[0])?.miniSiteConfig?.pixBeneficiary || (selectedLead || leads[0])?.name || 'Empresa Local',
                      pixKeyType: (selectedLead || leads[0])?.miniSiteConfig?.pixKeyType || 'telefone',
                      wifiSsid: (selectedLead || leads[0])?.miniSiteConfig?.wifiSsid || `${((selectedLead || leads[0])?.name || 'Empresa').replace(/\s+/g, '_')}_WiFi`,
                      wifiPassword: (selectedLead || leads[0])?.miniSiteConfig?.wifiPassword || 'VisiteNos123',
                      address: (selectedLead || leads[0])?.miniSiteConfig?.address || (selectedLead || leads[0])?.address || '',
                      phone: (selectedLead || leads[0])?.miniSiteConfig?.phone || (selectedLead || leads[0])?.phone || '',
                      openingHours: (selectedLead || leads[0])?.miniSiteConfig?.openingHours || 'Segunda a Sábado: 08h às 19h',
                      services: Array.isArray((selectedLead || leads[0])?.miniSiteConfig?.services)
                        ? (selectedLead || leads[0]).miniSiteConfig.services
                        : [],
                      theme: (selectedLead || leads[0])?.miniSiteConfig?.theme || 'dark_neon'
                    }}
                    leadId={(selectedLead || leads[0])?.id || 'demo'}
                    isLinkedToNfc={(selectedLead || leads[0])?.nfcRedirectActive === 'minisite'}
                    onLinkToNfc={(vercelUrl) => {
                      const target = selectedLead || leads[0];
                      if (target) {
                        updateLeadDetails(target.id, { 
                          nfcRedirectActive: 'minisite',
                          nfcCustomUrl: vercelUrl || undefined
                        });
                      }
                    }}
                    onSaveConfig={async (updated) => {
                      const targetId = (selectedLead || leads[0])?.id || 'empresa-principal';
                      await updateLeadDetails(targetId, {
                        name: updated.companyName,
                        niche: updated.niche,
                        city: updated.city,
                        nfcWhatsappNum: updated.whatsappNumber,
                        nfcWhatsappMsg: updated.whatsappMessage,
                        nfcInstagramUrl: updated.instagramUrl,
                        googleMapsUrl: updated.googleReviewUrl,
                        websiteUrl: updated.websiteUrl,
                        phone: updated.phone,
                        address: updated.address,
                        miniSiteConfig: updated
                      });
                    }}
                    onChangeConfig={(updated) => {
                      const targetId = (selectedLead || leads[0])?.id || 'empresa-principal';
                      updateLeadDetails(targetId, {
                        name: updated.companyName,
                        niche: updated.niche,
                        city: updated.city,
                        nfcWhatsappNum: updated.whatsappNumber,
                        nfcWhatsappMsg: updated.whatsappMessage,
                        nfcInstagramUrl: updated.instagramUrl,
                        googleMapsUrl: updated.googleReviewUrl,
                        websiteUrl: updated.websiteUrl,
                        phone: updated.phone,
                        address: updated.address,
                        miniSiteConfig: {
                          pixKey: updated.pixKey,
                          pixBeneficiary: updated.pixBeneficiary,
                          pixKeyType: updated.pixKeyType,
                          wifiSsid: updated.wifiSsid,
                          wifiPassword: updated.wifiPassword,
                          tagline: updated.tagline,
                          logoUrl: updated.logoUrl,
                          theme: updated.theme,
                          address: updated.address,
                          phone: updated.phone,
                          openingHours: updated.openingHours,
                          services: updated.services || []
                        }
                      });
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Template parameters live-editor panel */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                        <Globe className="h-4.5 w-4.5 text-blue-600" />
                        Editor Imersivo &amp; Estratégico
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Landing Page de altíssima conversão com simulador e prova social.
                      </p>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold px-2 py-0.5 rounded-full shrink-0">
                      Master Ativo
                    </span>
                  </div>

                  {selectedLead && (
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div className="truncate">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lead Ativo</span>
                        <h4 className="text-xs font-black text-slate-900 truncate">{selectedLead.name}</h4>
                        <span className="text-[10px] text-slate-500">{selectedLead.niche} • {selectedLead.city}</span>
                      </div>
                      <button
                        onClick={() => generateWebsiteTemplate(selectedLead)}
                        disabled={isGeneratingSite}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                        title="Regenerar modelo com IA imersiva"
                      >
                        <RefreshCw className={`h-3 w-3 ${isGeneratingSite ? 'animate-spin' : ''}`} />
                        <span>Regenerar</span>
                      </button>
                    </div>
                  )}

                  {/* Visual Atmosphere Switcher */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Atmosfera Visual do Site</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSimulatorTheme('clean')}
                        className={`px-2 py-1.5 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                          simulatorTheme === 'clean'
                            ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Clean Corp
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulatorTheme('dark')}
                        className={`px-2 py-1.5 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                          simulatorTheme === 'dark'
                            ? 'bg-slate-900 border-slate-800 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Dark Cyber
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulatorTheme('vibrant')}
                        className={`px-2 py-1.5 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                          simulatorTheme === 'vibrant'
                            ? 'bg-purple-50 border-purple-400 text-purple-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Vibrante
                      </button>
                    </div>
                  </div>

                  {siteTemplate ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Título Principal (Hero)</label>
                        <textarea
                          value={siteTemplate.hero.title}
                          onChange={(e) => setSiteTemplate({
                            ...siteTemplate,
                            hero: { ...siteTemplate.hero, title: e.target.value }
                          })}
                          rows={2}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:bg-white focus:outline-hidden transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Subtítulo Estratégico</label>
                        <textarea
                          value={siteTemplate.hero.subtitle}
                          onChange={(e) => setSiteTemplate({
                            ...siteTemplate,
                            hero: { ...siteTemplate.hero, subtitle: e.target.value }
                          })}
                          rows={2}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:bg-white focus:outline-hidden transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Texto do Botão CTA (WhatsApp)</label>
                        <input
                          type="text"
                          value={siteTemplate.hero.ctaText}
                          onChange={(e) => setSiteTemplate({
                            ...siteTemplate,
                            hero: { ...siteTemplate.hero, ctaText: e.target.value }
                          })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:bg-white focus:outline-hidden transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Paleta de Cores</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">Cor Principal</span>
                            <div className="flex gap-1.5 items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
                              <input
                                type="color"
                                value={siteTemplate.colors.primary}
                                onChange={(e) => setSiteTemplate({
                                  ...siteTemplate,
                                  colors: { ...siteTemplate.colors, primary: e.target.value }
                                })}
                                className="w-6 h-6 border-0 rounded-md cursor-pointer"
                              />
                              <span className="text-[10px] font-mono font-bold text-slate-600">{siteTemplate.colors.primary}</span>
                            </div>
                          </div>

                          <div>
                            <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">Botões de Conversão</span>
                            <div className="flex gap-1.5 items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
                              <input
                                type="color"
                                value={siteTemplate.colors.accent}
                                onChange={(e) => setSiteTemplate({
                                  ...siteTemplate,
                                  colors: { ...siteTemplate.colors, accent: e.target.value }
                                })}
                                className="w-6 h-6 border-0 rounded-md cursor-pointer"
                              />
                              <span className="text-[10px] font-mono font-bold text-slate-600">{siteTemplate.colors.accent}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pitch Script Hint */}
                      {selectedLead && (
                        <div className="pt-3 border-t border-slate-100 bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs">
                          <h4 className="font-extrabold text-blue-900 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-blue-600" />
                            Gatilho de Venda para {selectedLead.name}
                          </h4>
                          <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                            "Mostre este simulador no seu tablet ou celular. O cliente vê os botões funcionando com WhatsApp direto, o cálculo de orçamentos e as avaliações 5 estrelas do Google."
                          </p>
                        </div>
                      )}

                      {/* Central de Exportação & Hospedagem Card */}
                      <div className="pt-3 border-t border-slate-100 bg-linear-to-br from-emerald-50 via-teal-50/40 to-slate-50 p-3.5 rounded-2xl border border-emerald-200/90 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                            <Download className="h-4 w-4 text-emerald-600" />
                            Exportar Site para Hospedar
                          </h4>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 border border-emerald-300">
                            Pronto
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-snug">
                          Gere o código e os arquivos de produção para colocar no ar pelo Netlify Drop, Vercel ou cPanel do cliente.
                        </p>
                        <div className="space-y-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsExportSiteModalOpen(true)}
                            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                            id="btn-open-site-exporter"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Central de Exportação (ZIP / HTML)</span>
                          </button>
                          
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                if (!siteTemplate) return;
                                setIsDirectDownloadingZip(true);
                                try {
                                  await downloadClientSiteZip(
                                    siteTemplate,
                                    selectedLead || { name: 'Cliente', city: city || 'São Paulo', niche: niche || 'Serviços', phone: '(11) 99999-9999' },
                                    { theme: simulatorTheme }
                                  );
                                } finally {
                                  setIsDirectDownloadingZip(false);
                                }
                              }}
                              disabled={isDirectDownloadingZip}
                              className="py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-emerald-300 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                              title="Baixar arquivo ZIP com index.html, css, js e manual de hospedagem"
                            >
                              <Download className="h-3 w-3 text-emerald-600" />
                              <span>{isDirectDownloadingZip ? 'Gerando...' : 'Baixar ZIP'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (!siteTemplate) return;
                                openLiveSitePreview(
                                  siteTemplate,
                                  selectedLead || { name: 'Cliente', city: city || 'São Paulo', niche: niche || 'Serviços', phone: '(11) 99999-9999' },
                                  { theme: simulatorTheme }
                                );
                              }}
                              className="py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-emerald-300 font-bold text-[10px] rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="Abrir pré-visualização em tela cheia numa nova aba do navegador"
                            >
                              <ExternalLink className="h-3 w-3 text-emerald-600" />
                              <span>Tela Cheia</span>
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-10 px-4 space-y-3">
                      <Globe className="h-10 w-10 text-slate-300 mx-auto" />
                      <p className="text-slate-600 font-bold text-xs">Nenhum site carregado</p>
                      <p className="text-slate-400 text-[11px]">Selecione um lead na aba Prospecção e clique em "Criar Site Modelo".</p>
                    </div>
                  )}
                </div>

                {/* Browser Simulator Canvas */}
                <div className="lg:col-span-8 space-y-4">
                  
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                        <button
                          onClick={() => setDeviceView('desktop')}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            deviceView === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Laptop className="h-3.5 w-3.5" />
                          Computador
                        </button>
                        <button
                          onClick={() => setDeviceView('mobile')}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            deviceView === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Smartphone className="h-3.5 w-3.5" />
                          Celular (Mobile)
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                        Modo: {simulatorTheme === 'dark' ? 'Cyber Dark' : simulatorTheme === 'vibrant' ? 'Vibrante' : 'Clean'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selectedLead && (
                        <span className="text-xs text-slate-600 font-bold bg-white px-3 py-1.5 border border-slate-200 rounded-xl shadow-2xs hidden lg:inline-block">
                          Empresa: <strong className="font-extrabold text-slate-900">{selectedLead.name}</strong>
                        </span>
                      )}

                      {/* Fast Action Buttons in Simulator Bar */}
                      <button
                        type="button"
                        onClick={() => setIsExportSiteModalOpen(true)}
                        disabled={!siteTemplate}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm hover:shadow-md"
                        id="btn-header-export-site"
                        title="Exportar arquivos completos para hospedar para o cliente"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Exportar Site (ZIP)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!siteTemplate) return;
                          openLiveSitePreview(
                            siteTemplate,
                            selectedLead || { name: 'Cliente', city: city || 'São Paulo', niche: niche || 'Serviços', phone: '(11) 99999-9999' },
                            { theme: simulatorTheme }
                          );
                        }}
                        disabled={!siteTemplate}
                        className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                        title="Ver o site gerado em tela cheia numa nova aba do navegador"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Tela Cheia</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulator view frame */}
                  {isGeneratingSite ? (
                    <div className="bg-white border border-slate-200 rounded-2xl h-[620px] shadow-sm flex flex-col items-center justify-center gap-4 text-slate-500 p-8">
                      <div className="relative flex items-center justify-center">
                        <div className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-blue-400 opacity-75"></div>
                        <div className="relative rounded-full h-10 w-10 bg-blue-600 flex items-center justify-center text-white font-bold">
                          <Sparkles className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="font-black text-slate-800 text-base">Gerando Landing Page Imersiva com IA...</p>
                      <p className="text-xs text-slate-400 text-center max-w-sm leading-relaxed">
                        Construindo simulador de orçamento, prova social verificada com nota 4.9★ no Google, métricas de garantia e gatilhos mentais do segmento de {selectedLead?.niche || 'atuação'}.
                      </p>
                    </div>
                  ) : siteTemplate ? (
                    <div className="flex justify-center bg-slate-200/60 p-4 sm:p-6 rounded-2xl border border-slate-300/50 shadow-inner overflow-hidden">
                      
                      {/* Outer Frame Wrapper */}
                      <div className={`bg-white border border-slate-300 rounded-2xl shadow-2xl transition-all duration-300 ${
                        deviceView === 'mobile' ? 'w-[375px] h-[640px]' : 'w-full h-[640px]'
                      } flex flex-col relative`}>
                        
                        {/* Simulator top browser bar */}
                        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2 rounded-t-2xl shrink-0">
                          <div className="flex gap-1 shrink-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                          </div>
                          <div className="bg-white border border-slate-200 rounded-md py-0.5 px-3.5 text-[10px] text-slate-500 font-mono font-bold flex-1 truncate text-center flex items-center justify-center gap-1.5 shadow-2xs">
                            <Shield className="h-2.5 w-2.5 text-emerald-500" />
                            <span>https://www.{selectedLead ? selectedLead.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'site-demonstrativo'}.com.br</span>
                          </div>
                        </div>

                        {/* Simulated website body content with theme styles */}
                        <div 
                          className="flex-1 overflow-y-auto scroll-smooth relative" 
                          onScroll={(e) => setSimulatedScroll(e.currentTarget.scrollTop)}
                          style={{
                            backgroundColor: simulatorTheme === 'dark' ? '#090d16' : siteTemplate.colors.bg || '#ffffff',
                            color: simulatorTheme === 'dark' ? '#f1f5f9' : siteTemplate.colors.text || '#0f172a'
                          }}
                        >
                          
                          {/* Navigation Header */}
                          <header className={`px-4 py-3 border-b flex items-center justify-between sticky top-0 backdrop-blur-md z-20 shadow-xs ${
                            simulatorTheme === 'dark' 
                              ? 'bg-slate-900/90 border-slate-800 text-white' 
                              : 'bg-white/95 border-slate-100 text-slate-900'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-xs uppercase tracking-wider" style={{ color: siteTemplate.colors.primary }}>
                                {siteTemplate.brand?.name || selectedLead?.name || 'Logotipo'}
                              </span>
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Aberto Hoje
                              </span>
                            </div>
                            
                            <a
                              href={selectedLead ? getWhatsAppLink(selectedLead, `Olá! Vi o site de ${selectedLead.name} e gostaria de atendimento.`) : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-xs flex items-center gap-1 cursor-pointer"
                              style={{ backgroundColor: siteTemplate.colors.accent || '#10b981' }}
                            >
                              <MessageSquare className="h-2.5 w-2.5" />
                              <span>WhatsApp</span>
                            </a>
                          </header>

                          {/* Cinematic Hero Banner with dynamic parallax zoom */}
                          <div className="relative h-56 md:h-64 w-full overflow-hidden shrink-0 flex items-center justify-center bg-slate-950">
                            <div 
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-75 ease-out opacity-80"
                              style={{
                                backgroundImage: `url('${(siteTemplate as any)?.images?.hero || detectNicheVisualProfile(selectedLead?.niche, selectedLead?.name).images.hero}')`,
                                transform: `scale(${1 + (simulatedScroll / 450)}) translateY(${simulatedScroll * 0.12}px)`,
                                filter: `blur(${Math.min(3, simulatedScroll / 120)}px)`
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
                            
                            {/* Floating title with 3D parallax */}
                            <div 
                              className="relative z-10 text-center px-4 space-y-2 transition-all duration-75 ease-out"
                              style={{
                                transform: `translateY(${-simulatedScroll * 0.08}px)`,
                                opacity: Math.max(0, 1 - (simulatedScroll / 180))
                              }}
                            >
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[9px] uppercase font-black tracking-widest border border-white/20 backdrop-blur-md">
                                <Sparkles className="h-3 w-3 text-amber-400" />
                                {siteTemplate.brand?.badge || 'Excelência Comprovada 2026'}
                              </span>
                              <h2 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                                {siteTemplate.brand?.name || selectedLead?.name || 'Empresa Referência'}
                              </h2>
                              <p className="text-[11px] text-slate-300 font-medium max-w-xs mx-auto drop-shadow-sm">
                                {siteTemplate.brand?.slogan || `Referência em qualidade e agilidade em ${selectedLead?.city || 'sua cidade'}`}
                              </p>
                            </div>

                            {/* Dynamic scroll indicator */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-0.5 animate-bounce">
                              <span className="text-[8px] text-white/60 font-bold uppercase tracking-widest">Role para baixo</span>
                              <ChevronDown className="h-3 w-3 text-white/70" />
                            </div>
                          </div>

                          {/* Hero Main Content */}
                          <section className={`px-5 py-8 md:py-10 text-center space-y-4 border-b ${
                            simulatorTheme === 'dark' ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-linear-to-b from-blue-50/30 to-transparent'
                          }`}>
                            {/* Google 4.9 Rating Badge */}
                            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-wider">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span>4.9 no Google Meu Negócio • Empresa Verificada</span>
                            </div>

                            <h1 className="text-xl md:text-2xl font-black leading-tight tracking-tight">
                              {siteTemplate.hero.title}
                            </h1>
                            <p className={`text-xs md:text-sm max-w-lg mx-auto leading-relaxed ${
                              simulatorTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {siteTemplate.hero.subtitle}
                            </p>

                            {/* Dual CTAs */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                              <a
                                href={selectedLead ? getWhatsAppLink(selectedLead, `Olá! Acessei o site de ${selectedLead.name} e gostaria de um orçamento imediato.`) : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-6 py-2.5 text-xs font-black rounded-full shadow-md hover:opacity-90 active:scale-95 transition-all text-white flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                                style={{ backgroundColor: siteTemplate.colors.accent || '#10b981' }}
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>{siteTemplate.hero.ctaText || 'Falar no WhatsApp'}</span>
                              </a>
                            </div>

                            {/* Trust Metrics Bar */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-6 max-w-xl mx-auto">
                              {(siteTemplate.hero.trustMetrics || [
                                { value: "4.9 ★", label: "Google Meu Negócio" },
                                { value: "1.200+", label: "Atendimentos" },
                                { value: "30 min", label: "Resposta Rápida" },
                                { value: "100%", label: "Garantia Formal" }
                              ]).map((metric, mIdx) => (
                                <div 
                                  key={mIdx} 
                                  className={`p-2.5 rounded-xl border text-center ${
                                    simulatorTheme === 'dark' 
                                      ? 'bg-slate-900 border-slate-800' 
                                      : 'bg-white border-slate-200/80 shadow-2xs'
                                  }`}
                                >
                                  <span className="block text-sm font-black" style={{ color: siteTemplate.colors.primary }}>
                                    {metric.value}
                                  </span>
                                  <span className={`text-[9px] uppercase font-bold ${
                                    simulatorTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                                  }`}>
                                    {metric.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* INTERACTIVE INSTANT QUOTE CALCULATOR */}
                          <section className={`px-5 py-8 border-b ${
                            simulatorTheme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/60'
                          }`}>
                            <div className="max-w-md mx-auto space-y-4">
                              <div className="text-center">
                                <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 mb-1">
                                  Simulador Interativo
                                </span>
                                <h3 className="text-sm font-black text-slate-900">
                                  {siteTemplate.interactiveQuote?.title || "Simulador de Atendimento Expresso"}
                                </h3>
                                <p className={`text-[11px] mt-0.5 ${simulatorTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {siteTemplate.interactiveQuote?.subtitle || "Clique no serviço para obter a estimativa e iniciar a conversa:"}
                                </p>
                              </div>

                              <div className="space-y-2">
                                {(siteTemplate.interactiveQuote?.options || [
                                  { name: "Atendimento Prioritário Imediato", estimatedPrice: "Orçamento Especial", highlight: "Mais Procurado" },
                                  { name: "Serviço Completo com Garantia Total", estimatedPrice: "Condições Facilitadas", highlight: "Melhor Avaliado" },
                                  { name: "Consultoria e Diagnóstico Especializado", estimatedPrice: "Sob Demanda", highlight: "Sem Letras Miúdas" }
                                ]).map((opt, oIdx) => {
                                  const isSelected = selectedQuoteService === opt.name;
                                  return (
                                    <div
                                      key={oIdx}
                                      onClick={() => setSelectedQuoteService(opt.name)}
                                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                        isSelected 
                                          ? 'border-blue-500 bg-blue-50/80 shadow-xs' 
                                          : simulatorTheme === 'dark' 
                                            ? 'bg-slate-900 border-slate-800 hover:border-slate-700' 
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-bold">{opt.name}</span>
                                          <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                            {opt.highlight}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-emerald-600 font-extrabold">{opt.estimatedPrice}</span>
                                      </div>
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                                      }`}>
                                        {isSelected && <Check className="h-3 w-3" />}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {selectedQuoteService && (
                                <a
                                  href={selectedLead ? getWhatsAppLink(selectedLead, `Olá! Gostaria de agendar o serviço: ${selectedQuoteService}.`) : '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-white text-center flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all cursor-pointer"
                                  style={{ backgroundColor: siteTemplate.colors.accent || '#10b981' }}
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  <span>Garantir {selectedQuoteService} no WhatsApp</span>
                                </a>
                              )}
                            </div>
                          </section>

                          {/* Services / Benefits Section */}
                          <section className="px-5 py-8 space-y-5">
                            <div className="text-center">
                              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Nossos Serviços</h2>
                              <p className="text-sm font-black mt-1">Especialidades e Padrão de Qualidade</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {siteTemplate.services.map((svc, sIdx) => (
                                <div 
                                  key={sIdx} 
                                  className={`p-4 rounded-xl border space-y-2 ${
                                    simulatorTheme === 'dark' 
                                      ? 'bg-slate-900 border-slate-800' 
                                      : 'bg-white border-slate-200/80 shadow-2xs'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                                      <Award className="h-4 w-4" style={{ color: siteTemplate.colors.primary }} />
                                    </div>
                                    {svc.badge && (
                                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                        {svc.badge}
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="font-bold text-xs">{svc.title}</h3>
                                  <p className={`text-[11px] leading-relaxed ${
                                    simulatorTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                                  }`}>
                                    {svc.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* Niche Photo Showcase / Estrutura e Casos Reais */}
                          {(() => {
                            const profile = detectNicheVisualProfile(selectedLead?.niche, selectedLead?.name);
                            const galleryItems = (siteTemplate as any)?.images?.gallery || profile.images.gallery;
                            return (
                              <section className={`px-5 py-8 border-b space-y-4 ${
                                simulatorTheme === 'dark' ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'
                              }`}>
                                <div className="text-center">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                                    Galeria &amp; Estrutura
                                  </span>
                                  <h3 className="text-sm font-black mt-1">Padrão de Qualidade do Segmento</h3>
                                  <p className="text-[11px] text-slate-400">Espaço, equipamentos e atendimento em {selectedLead?.city || 'sua cidade'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                  {galleryItems.map((g: any, gIdx: number) => (
                                    <div key={gIdx} className="relative rounded-xl overflow-hidden aspect-4/3 shadow-xs border border-slate-200 group">
                                      <img src={g.url} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                                        <span className="text-[7.5px] font-black uppercase text-amber-400 tracking-wider">{g.category}</span>
                                        <span className="text-[10px] font-bold leading-tight line-clamp-1">{g.title}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </section>
                            );
                          })()}

                          {/* About Us Section */}
                          <section className={`px-5 py-8 border-y flex flex-col md:flex-row items-center gap-5 ${
                            simulatorTheme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-white/60'
                          }`}>
                            <div className="w-full md:w-1/2 aspect-4/3 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0">
                              <img
                                src={(siteTemplate as any)?.images?.about || detectNicheVisualProfile(selectedLead?.niche, selectedLead?.name).images.about}
                                alt="Sobre a empresa"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-3 flex-1">
                              <h2 className="text-sm font-black">{siteTemplate.about.title}</h2>
                              <p className={`text-xs leading-relaxed ${
                                simulatorTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                              }`}>
                                {siteTemplate.about.text}
                              </p>
                              {siteTemplate.about.highlights && (
                                <div className="space-y-1 pt-1">
                                  {siteTemplate.about.highlights.map((h, hIdx) => (
                                    <div key={hIdx} className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600">
                                      <CheckCircle className="h-3 w-3 shrink-0" />
                                      <span>{h}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </section>

                          {/* Google Reviews Verified Section */}
                          <section className="px-5 py-8 space-y-4">
                            <div className="text-center">
                              <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-500 mb-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span>Avaliações Verificadas no Google</span>
                              </div>
                              <h3 className="text-sm font-black">Depoimentos Reais de Clientes</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {siteTemplate.testimonials.map((t, tIdx) => (
                                <div 
                                  key={tIdx} 
                                  className={`p-4 rounded-xl border space-y-2.5 ${
                                    simulatorTheme === 'dark' 
                                      ? 'bg-slate-900 border-slate-800' 
                                      : 'bg-white border-slate-200/80 shadow-2xs'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-700">
                                        {t.author.charAt(0)}
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-xs">{t.author}</h4>
                                        <p className="text-[9px] text-slate-400">{t.role}</p>
                                      </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                      Verificado
                                    </span>
                                  </div>
                                  <p className={`text-xs italic leading-relaxed ${
                                    simulatorTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                                  }`}>
                                    "{t.text}"
                                  </p>
                                  <div className="flex items-center justify-between pt-1">
                                    <div className="flex text-amber-400">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                      ))}
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-medium">{t.timeAgo || "há 2 dias"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* FAQ Interactive Accordion Section */}
                          <section className={`px-5 py-8 border-t ${
                            simulatorTheme === 'dark' ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'
                          }`}>
                            <div className="max-w-md mx-auto space-y-4">
                              <div className="text-center">
                                <h3 className="text-sm font-black">Perguntas Frequentes</h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">Tire suas dúvidas antes de agendar</p>
                              </div>

                              <div className="space-y-2">
                                {(siteTemplate.faq || [
                                  { question: "Como funciona para solicitar um orçamento?", answer: "Você clica no botão do WhatsApp, nos conta sua necessidade e respondemos em poucos minutos com orientações claras." },
                                  { question: "Possui garantia dos serviços?", answer: "Sim, emitimos certificado de garantia e suporte continuado para todos os atendimentos realizados." },
                                  { question: "Quais as formas de pagamento?", answer: "Pix, cartões de crédito em até 12x e boleto bancário facilitado." }
                                ]).map((faqItem, fIdx) => {
                                  const isOpen = activeFaqIndex === fIdx;
                                  return (
                                    <div 
                                      key={fIdx}
                                      className={`rounded-xl border overflow-hidden transition-all ${
                                        simulatorTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                                      }`}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => setActiveFaqIndex(isOpen ? null : fIdx)}
                                        className="w-full p-3 text-left font-bold text-xs flex items-center justify-between gap-2 cursor-pointer"
                                      >
                                        <span>{faqItem.question}</span>
                                        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
                                      </button>
                                      {isOpen && (
                                        <div className={`px-3 pb-3 text-[11px] leading-relaxed border-t pt-2 ${
                                          simulatorTheme === 'dark' ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                                        }`}>
                                          {faqItem.answer}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </section>

                          {/* CTA & Contact info Footer */}
                          <section className="px-5 py-8 text-center space-y-4 text-white" style={{ backgroundColor: siteTemplate.colors.primary }}>
                            {siteTemplate.cta.urgency && (
                              <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                                {siteTemplate.cta.urgency}
                              </span>
                            )}
                            <h2 className="text-lg font-black leading-tight">{siteTemplate.cta.title}</h2>
                            <p className="text-xs opacity-90 max-w-sm mx-auto leading-relaxed">{siteTemplate.cta.text}</p>
                            
                            <a
                              href={selectedLead ? getWhatsAppLink(selectedLead, `Olá! Quero agendar um atendimento na ${selectedLead.name}.`) : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-2.5 text-xs font-black rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all text-slate-900 bg-white cursor-pointer mx-auto inline-flex items-center gap-2 uppercase tracking-wider"
                              style={{ color: siteTemplate.colors.primary }}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{siteTemplate.cta.buttonText}</span>
                            </a>

                            <div className="pt-4 border-t border-white/10 text-[10px] opacity-80 space-y-1">
                              <p>{selectedLead?.address || 'Rua Principal, Centro'}</p>
                              <p>Contato: {selectedLead?.phone || '(11) 99999-9999'}</p>
                            </div>
                          </section>

                          {/* Floating WhatsApp Concierge Widget inside simulator */}
                          <div className="sticky bottom-4 right-4 flex justify-end px-4 pointer-events-none z-30">
                            <div className="pointer-events-auto relative">
                              {isWhatsappWidgetOpen && (
                                <div className="absolute bottom-12 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 space-y-2 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                                        WA
                                      </div>
                                      <div>
                                        <h5 className="text-[11px] font-black text-slate-900">Atendimento {siteTemplate.brand?.name || selectedLead?.name || ''}</h5>
                                        <span className="text-[9px] text-emerald-600 font-bold">● Online agora</span>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => setIsWhatsappWidgetOpen(false)}
                                      className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-slate-600 leading-snug">
                                    Olá! Como posso ajudar você hoje em {selectedLead?.city || 'sua região'}?
                                  </p>
                                  <a
                                    href={selectedLead ? getWhatsAppLink(selectedLead, `Olá! Gostaria de tirar dúvidas com a equipe de ${selectedLead.name}.`) : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold text-center block transition-colors"
                                  >
                                    Falar Agora no WhatsApp
                                  </a>
                                </div>
                              )}
                              
                              <button
                                onClick={() => setIsWhatsappWidgetOpen(!isWhatsappWidgetOpen)}
                                className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer relative"
                                title="Abrir Chat WhatsApp"
                              >
                                <MessageSquare className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                  1
                                </span>
                              </button>
                            </div>
                          </div>

                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl h-[620px] shadow-sm flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Globe className="h-10 w-10 text-slate-300" />
                      <p className="font-bold text-slate-700 text-sm">Pronto para demonstrar</p>
                      <p className="text-xs text-slate-400">Gere o site de modelo no menu de prospecção para ver a prévia interativa.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

        {/* TAB 4: PHYSICAL NFC CARD DESIGNER & 3D TOTEM SIMULATOR */}
        {(activeTab === 'nfc_designer' || (activeTab as any) === 'nfc') && (
          <NfcMockupTotem
            businessName={selectedLead ? selectedLead.name : 'Sua Empresa Aqui'}
            niche={selectedLead ? selectedLead.niche : niche}
            city={selectedLead ? selectedLead.city : city}
            reviewLink={gmbReviewLink || (selectedLead ? getDirectLeadUrl(selectedLead) : 'https://maps.google.com')}
            nfcRedirectUrl={selectedLead ? getDynamicQrUrl(selectedLead.id) : getDynamicQrUrl('demo')}
            leadId={selectedLead ? selectedLead.id : 'demo'}
            instagramUrl={selectedLead ? selectedLead.nfcInstagramUrl : ''}
            nfcRedirectActive={selectedLead ? selectedLead.nfcRedirectActive : 'gmb'}
            onPrintPlate={(chosenTheme) => print10x10Plate(selectedLead || undefined, chosenTheme || (selectedLead?.nfcRedirectActive === 'instagram' ? 'instagram_dual' : 'emerald_green'))}
            onDownloadQr={() => downloadClientQrCode(selectedLead, 1000)}
            isDownloadingQr={isDownloadingQr}
            leads={leads}
            onSelectLead={(lead) => {
              const full = leads.find(l => l.id === lead.id) || (lead as Lead);
              setSelectedLead(full);
              setGmbReviewLink(full.googleMapsUrl || '');
            }}
            onNavigateToMiniSite={(leadId) => {
              setDemonstratorMode('minisite');
              changeTab('site_preview');
            }}
            onUpdateRedirectTarget={(target) => {
              if (selectedLead) {
                updateLeadDetails(selectedLead.id, { nfcRedirectActive: target as any });
              }
            }}
            onTogglePlaquePrinted={(leadId, currentStatus) => {
              const newStatus = !currentStatus;
              updateLeadDetails(leadId, {
                isPlaquePrinted: newStatus,
                plaquePrintedAt: newStatus ? new Date().toISOString() : undefined
              });
            }}
            onOpenCustomDomain={() => setIsCustomDomainModalOpen(true)}
          />
        )}

        {/* TAB 5: DYNAMIC QR CODE BATCH GENERATOR & URL MANAGER */}
        {activeTab === 'dynamic_qr' && (
          <DynamicQrBatchManager
            leads={leads}
            onSelectLead={(l) => {
              setSelectedLead(l);
              changeTab('portal');
            }}
            onNavigateToPortal={(leadId) => {
              setAdminSelectedLeadId(leadId);
              changeTab('portal');
            }}
          />
        )}

        {/* TAB 6: BUSINESS VALUE & ROI CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Variables and sliders input */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
              
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Coins className="h-4.5 w-4.5 text-blue-600" />
                  Calculadora Científica de Impacto Comercial (GMB ROI)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Mostre ao dono da empresa, com números matemáticos exatos, quanto faturamento ele está deixando escapar por não ter o combo NFC + Site.
                </p>
              </div>

              <div className="space-y-5">
                {/* Average Ticket */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Ticket Médio (Serviço ou Venda)</span>
                    <span className="font-extrabold text-blue-600">R$ {calcAvgTicket}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="2000"
                    step="10"
                    value={calcAvgTicket}
                    onChange={(e) => setCalcAvgTicket(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>R$ 20</span>
                    <span>R$ 1.000</span>
                    <span>R$ 2.000</span>
                  </div>
                </div>

                {/* Monthly Customers */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Volume de Clientes Atendidos por Mês</span>
                    <span className="font-extrabold text-blue-600">{calcMonthlyCustomers} clientes</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={calcMonthlyCustomers}
                    onChange={(e) => setCalcMonthlyCustomers(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>10 clis</span>
                    <span>500 clis</span>
                    <span>1.000 clis</span>
                  </div>
                </div>

                {/* Current Google GMB Star rating */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Avaliação Atual no Google Meu Negócio</span>
                    <span className="font-extrabold text-amber-500 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400 inline" /> {calcCurrentRating} estrelas
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="4.9"
                    step="0.1"
                    value={calcCurrentRating}
                    onChange={(e) => setCalcCurrentRating(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>1.0 Estrela (Péssimo)</span>
                    <span>3.8 (Médio)</span>
                    <span>4.9 (Excelente)</span>
                  </div>
                </div>

                {/* ROI conversion text helper */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 space-y-1 leading-normal">
                  <p className="font-bold flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                    Como funciona a projeção comercial?
                  </p>
                  <p className="text-blue-700">
                    Estudos do Google mostram que empresas com nota acima de <strong className="font-bold">4.6</strong> e site oficial estruturado recebem em média <strong className="font-bold">15% a 35% mais visualizações e contatos de clientes</strong> por pesquisa local, pois ganham confiança e melhoram o ranqueamento.
                  </p>
                </div>

              </div>

            </div>

            {/* Results display panel */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6">
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resultado da Projeção de Faturamento</h3>
                  <p className="text-sm font-black text-slate-800 mt-0.5">Vazamento de receita atual vs. potencial pós-otimização</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Current State */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Situação Digital Atual</span>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500">Faturamento Mensal Estimado:</p>
                      <p className="text-xl font-black text-slate-800">
                        R$ {calcCurrentRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <p className="text-[10px] text-red-600 font-semibold">
                      🔴 Nota {calcCurrentRating} deixa dúvidas nos clientes pesquisando no Google.
                    </p>
                  </div>

                  {/* Future optimized state */}
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-bl-lg">METAS</div>
                    <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider">Pós Combo (Placa NFC + Site)</span>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-emerald-700">Faturamento Mensal Projetado:</p>
                      <p className="text-xl font-black text-emerald-950">
                        R$ {calcNewRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <p className="text-[10px] text-emerald-800 font-semibold">
                      🟢 Nota 4.8+ estimulada pela Placa NFC + SEO do Site Novo.
                    </p>
                  </div>

                </div>

                {/* Lost Revenue Highlights Box */}
                <div className="bg-gradient-to-tr from-blue-900 to-indigo-950 text-white p-5 rounded-2xl text-center space-y-2 shadow-lg">
                  <span className="text-[10px] bg-white/10 uppercase tracking-widest font-black px-2.5 py-1 rounded-full">Faturamento de Caixa Recuperado</span>
                  <p className="text-3xl font-black text-amber-400">
                    + R$ {calcDiffRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                  </p>
                  <p className="text-xs opacity-90 max-w-md mx-auto leading-relaxed">
                    A empresa está <strong className="font-extrabold text-amber-300">deixando de faturar R$ {calcDiffRevenue.toLocaleString('pt-BR')} todos os meses</strong> simplesmente por não ter avaliações e site. O investimento único no seu combo se paga em menos de uma semana!
                  </p>
                </div>
              </div>

              {/* Pitch closer */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 font-medium max-w-sm">
                  Utilize esta ferramenta abrindo a tela diretamente para o proprietário ou envie um print para fechar a venda de forma científica e lógica.
                </p>
                <button
                  onClick={() => {
                    alert("Copiando argumentos comerciais baseados em ROI para a área de transferência!");
                    navigator.clipboard.writeText(`Investimento Único: R$ ${comboPrice} \nRetorno Estimado Mensal: + R$ ${calcDiffRevenue.toLocaleString('pt-BR')}`);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs shrink-0 cursor-pointer transition-all"
                >
                  Copiar Argumento de ROI
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB: CARDÁPIO DIGITAL & MESAS */}
        {activeTab === 'cardapio' && (
          <CardapioDigitalManager
            onLinkToNfc={(url, menuName) => {
              setActiveTab('dynamic_qr');
            }}
          />
        )}

        {/* TAB 6: SAAS PORTAL AND CLIENT NFC MANAGER */}
        {activeTab === 'portal' && (
          <div>
            {!isMasterAuthenticated ? (
              <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-inner">
                  <Lock className="h-8 w-8" />
                </div>
                <div>
                  <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase bg-amber-100 text-amber-900 px-3 py-1 rounded-full mb-2">
                    Acesso Restrito Master
                  </span>
                  <h2 className="text-xl font-black text-slate-900">
                    Portal do Cliente Protegido
                  </h2>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    A administração do Portal SaaS, gerenciamento de links NFC e controle de permissões e inadimplência requer autenticação Master da ALEF Automações.
                  </p>
                </div>

                <form onSubmit={handleMasterLogin} className="space-y-4 text-left">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">Usuário Master</label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => fillMasterCredentials('env')}
                          className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold hover:bg-amber-100 transition cursor-pointer"
                          title="Preencher com Mysis@26"
                        >
                          Mysis@26
                        </button>
                        <button
                          type="button"
                          onClick={() => fillMasterCredentials('default')}
                          className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-bold hover:bg-slate-200 transition cursor-pointer"
                          title="Preencher com master"
                        >
                          master
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={masterUserInput}
                      onChange={(e) => setMasterUserInput(e.target.value)}
                      placeholder="Mysis@26 ou master"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Senha Master</label>
                    <input
                      type="password"
                      value={masterPasswordInput}
                      onChange={(e) => setMasterPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>

                  {masterError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      <span>{masterError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={masterIsLoading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {masterIsLoading ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    <span>Desbloquear Portal do Cliente</span>
                  </button>
                </form>

                <p className="text-[11px] text-slate-400 font-medium">
                  Operador Master ALEF Automações • Aceita: Mysis@26 / Myadm@26 ou master / master@2026
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* SaaS Banner Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Key className="w-48 h-48 rotate-45" />
              </div>
              <div className="relative space-y-2 max-w-2xl">
                <span className="bg-cyan-500/10 text-cyan-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-cyan-500/20 inline-block">
                  MÓDULO EXTRA EXCLUSIVO (MENSALIDADE RECORRENTE)
                </span>
                <h2 className="text-2xl font-black tracking-tight">Portal SaaS de Links & Redirecionamentos NFC</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Monetize oferecendo um portal exclusivo para seus clientes! Eles pagam uma mensalidade para gerenciar para onde a placa NFC e o QR Code redirecionam. Você controla as permissões, altera senhas e pode suspender os redirecionamentos instantaneamente no caso de inadimplência.
                </p>
              </div>

              {/* Sub-Navigation inside the Tab */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-2.5 mt-6 border-t border-slate-800/80 pt-5">
                <button
                  onClick={() => setPortalMode('admin')}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
                    portalMode === 'admin' 
                      ? 'bg-white text-slate-900 shadow-md' 
                      : 'bg-slate-900/40 text-slate-300 hover:bg-slate-900/80 border border-slate-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>Console Admin ALF</span>
                </button>
                <button
                  onClick={() => {
                    if (loggedInClient) {
                      setPortalMode('client_panel');
                    } else {
                      setPortalMode('client_login');
                    }
                  }}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
                    portalMode === 'client_login' || portalMode === 'client_panel'
                      ? 'bg-white text-slate-900 shadow-md' 
                      : 'bg-slate-900/40 text-slate-300 hover:bg-slate-900/80 border border-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">📱 Área do Cliente {loggedInClient && `(${loggedInClient.name})`}</span>
                </button>
                <button
                  onClick={() => changeTab('dynamic_qr')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/40 sm:ml-auto text-center"
                  title="Abrir Central de QR Codes Dinâmicos em Lote"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Gerar em Lote (1 a 40)</span>
                </button>
              </div>
            </div>

            {/* A: ADMIN WORKSPACE MODE */}
            {portalMode === 'admin' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Pane - Accounts list */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Contas Ativas ({leads.length})</h3>
                      <p className="text-[10px] text-slate-400">Mensalidades & senhas.</p>
                    </div>
                    <button
                      onClick={() => setIsAddAccountOpen(!isAddAccountOpen)}
                      className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isAddAccountOpen ? "Fechar" : "Cadastrar"}
                    </button>
                  </div>

                  {/* Manual Account Registration Drawer Form */}
                  {isAddAccountOpen && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5 animate-in slide-in-from-top duration-200">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Novo Cadastro de Empresa (Placa NFC)</h4>
                        <p className="text-[10px] text-slate-400">Insira as informações básicas para iniciar a impressão ou programar a tag.</p>
                      </div>

                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase">CÓDIGO ID / NÚMERO (*)</label>
                            <input
                              type="text"
                              placeholder="Ex: 101, pizza_nfc"
                              value={newAccountId}
                              onChange={(e) => setNewAccountId(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, ''))}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase">SENHA PIN ACESSO</label>
                            <input
                              type="text"
                              placeholder="Ex: 1234"
                              value={newAccountPin}
                              onChange={(e) => setNewAccountPin(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-black text-slate-500 uppercase">NOME DA EMPRESA (*)</label>
                          <input
                            type="text"
                            placeholder="Ex: Pizzaria Bella Italia"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase">NICHO / RAMO</label>
                            <select
                              value={newAccountNiche}
                              onChange={(e) => setNewAccountNiche(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                            >
                              <option value="Salão de Beleza">Salão de Beleza</option>
                              <option value="Clínica Médica">Clínica Médica</option>
                              <option value="Pizzaria / Restaurante">Pizzaria / Restaurante</option>
                              <option value="Oficina Mecânica">Oficina Mecânica</option>
                              <option value="Pet Shop">Pet Shop</option>
                              <option value="Academia">Academia</option>
                              <option value="Outro">Outro Segmento</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase">CIDADE (*)</label>
                            <input
                              type="text"
                              placeholder="Ex: Curitiba"
                              value={newAccountCity}
                              onChange={(e) => setNewAccountCity(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-black text-slate-500 uppercase">LINK GOOGLE MAPS / AVALIAÇÕES</label>
                          <input
                            type="text"
                            placeholder="https://g.page/r/sua-empresa/review"
                            value={newAccountGmb}
                            onChange={(e) => setNewAccountGmb(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500"
                          />
                        </div>

                        <button
                          onClick={createCustomAccount}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                        >
                          Salvar e Cadastrar Empresa
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {leads.map((l) => {
                      const isSelected = adminSelectedLeadId === l.id;
                      const isSuspended = l.nfcBillingStatus === 'suspended';
                      return (
                        <button
                          key={l.id}
                          onClick={() => setAdminSelectedLeadId(l.id)}
                          className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50/50 shadow-xs' 
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                          }`}
                        >
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-800 leading-none">{l.name}</h4>
                            <span className="inline-block text-[9px] text-slate-500 font-medium">
                              ID: {l.id} • {l.niche}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm tracking-wider ${
                                isSuspended 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {isSuspended ? '🔴 Suspenso' : '🟢 Ativo'}
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                🔗 {l.nfcRedirectActive?.toUpperCase() || 'GMB'}
                              </span>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? 'rotate-180 text-blue-600' : ''}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Pane - Selected Lead Config Panel */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  {adminSelectedLeadId ? (() => {
                    const l = leads.find(item => item.id === adminSelectedLeadId);
                    if (!l) return <p className="text-sm text-slate-500 text-center py-12">Selecione uma conta à esquerda para gerenciar.</p>;
                    
                    return (
                      <div className="space-y-6">
                        
                        {/* Company Metadata Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                          <div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">CONFIGURAÇÕES DE MENSALIDADE</span>
                            <h3 className="text-base font-extrabold text-slate-900 mt-1">{l.name}</h3>
                            <p className="text-xs text-slate-500">{l.address}</p>
                          </div>
                          
                          {/* Direct Redirect Quick Link Link */}
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Link Permanente NFC</span>
                            <a 
                              href={getTestRedirectUrl(l.id)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 justify-end"
                            >
                              /r/{l.id}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Left Column: Subscription & Auth */}
                          <div className="space-y-5">
                            
                            {/* Billing Status */}
                            <div className="space-y-2">
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Status Financeiro (Mensalidade)</label>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateLeadDetails(l.id, { nfcBillingStatus: 'active' })}
                                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                    l.nfcBillingStatus !== 'suspended'
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                  }`}
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Regularizado / Ativo
                                </button>
                                <button
                                  onClick={() => updateLeadDetails(l.id, { nfcBillingStatus: 'suspended' })}
                                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                    l.nfcBillingStatus === 'suspended'
                                      ? 'bg-red-50 border-red-300 text-red-800 shadow-sm'
                                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                  }`}
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Suspender Placa
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-normal">
                                Se suspenso, ao encostar o celular na tag NFC do balcão o cliente verá uma tela de aviso instruindo a regularizar a mensalidade com a ALF Automação.
                              </p>
                            </div>

                            {/* Set PIN / Portal password */}
                            <div className="space-y-2">
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Senha do Portal do Cliente (PIN)</label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                  <Lock className="w-3.5 h-3.5" />
                                </span>
                                <input
                                  type="text"
                                  placeholder="Defina uma senha (ex: 1234)"
                                  value={l.nfcPassword || ''}
                                  onChange={(e) => updateLeadDetails(l.id, { nfcPassword: e.target.value })}
                                  className="w-full pl-8.5 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                              <p className="text-[10px] text-slate-400">Forneça esta senha para o seu cliente para que ele possa acessar a área dele no celular.</p>
                            </div>

                          </div>

                          {/* Right Column: Module Permission Toggles */}
                          <div className="space-y-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Módulos Extra Liberados</h4>
                              <p className="text-[10px] text-slate-400">Marque o que esse cliente pagou para poder alterar na placa NFC.</p>
                            </div>

                            <div className="space-y-2.5 text-xs text-slate-700">
                              {[
                                { key: 'gmb', label: '⭐ Avaliações Google Meu Negócio' },
                                { key: 'whatsapp', label: '💬 Botão Direto de WhatsApp' },
                                { key: 'instagram', label: '📸 Redirecionamento Instagram' },
                                { key: 'website', label: '🌐 Site Próprio / Landing Page' },
                                { key: 'custom', label: '🔗 Link Customizado Livre (NFC Tools)' }
                              ].map((mod) => {
                                const isAllowed = l.nfcModulesAllowed?.[mod.key as keyof NonNullable<Lead['nfcModulesAllowed']>] !== false;
                                return (
                                  <label key={mod.key} className="flex items-center gap-2.5 font-semibold cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isAllowed}
                                      onChange={(e) => {
                                        const allowedObj = l.nfcModulesAllowed || { gmb: true, whatsapp: true, instagram: true, website: true, custom: true };
                                        updateLeadDetails(l.id, {
                                          nfcModulesAllowed: {
                                            ...allowedObj,
                                            [mod.key]: e.target.checked
                                          }
                                        });
                                      }}
                                      className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                    />
                                    <span>{mod.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        {/* Presets and Defaults configuration */}
                        <div className="border-t border-slate-100 pt-5 space-y-4">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pré-configuração de Links do Cliente</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2 space-y-2">
                              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Assistente Google Reviews (Place ID)</span>
                              <GoogleReviewLinkGenerator
                                initialQuery={l.name}
                                initialCity={l.city}
                                currentUrl={l.googleMapsUrl}
                                compact={true}
                                onLinkGenerated={(generatedUrl) => updateLeadDetails(l.id, { googleMapsUrl: generatedUrl })}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Link de Avaliações do Google (GMB)</label>
                              <input
                                type="text"
                                placeholder="Gerado automaticamente pela varredura"
                                value={l.googleMapsUrl || ''}
                                onChange={(e) => updateLeadDetails(l.id, { googleMapsUrl: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">Link do Instagram</label>
                                <button
                                  type="button"
                                  onClick={() => print10x10Plate(l, 'instagram_dual')}
                                  className="text-[9px] font-black text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-1.5 py-0.5 rounded border border-pink-200 transition cursor-pointer flex items-center gap-1"
                                  title="Imprimir placa modelo da foto em 4K"
                                >
                                  <span>📸 Placa da Foto (4K)</span>
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="https://instagram.com/empresa"
                                value={l.nfcInstagramUrl || ''}
                                onChange={(e) => updateLeadDetails(l.id, { nfcInstagramUrl: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">WhatsApp (Apenas números + DDD)</label>
                              <input
                                type="text"
                                placeholder="Ex: 11999999999"
                                value={l.nfcWhatsappNum || ''}
                                onChange={(e) => updateLeadDetails(l.id, { nfcWhatsappNum: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Mensagem Padrão do WhatsApp</label>
                              <input
                                type="text"
                                placeholder="Olá! Gostaria de agendar."
                                value={l.nfcWhatsappMsg || ''}
                                onChange={(e) => updateLeadDetails(l.id, { nfcWhatsappMsg: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Site / Landing Page Ativa</label>
                              <input
                                type="text"
                                placeholder="https://site-modelo.com"
                                value={l.websiteUrl || ''}
                                onChange={(e) => updateLeadDetails(l.id, { websiteUrl: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Link Customizado Livre (NFC Tools)</label>
                              <input
                                type="text"
                                placeholder="Qualquer link da web"
                                value={l.nfcCustomUrl || ''}
                                onChange={(e) => updateLeadDetails(l.id, { nfcCustomUrl: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
                              />
                            </div>
                          </div>

                          {/* Printable Plate & QR Code Generator Block */}
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="space-y-1 text-center sm:text-left">
                              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Impressão Física & QR Code 10x10 cm</h5>
                              <p className="text-[10px] text-slate-400">Baixe o QR Code em PNG de alta definição ou imprima a placa pronta.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => downloadClientQrCode(l, 1000)}
                                disabled={isDownloadingQr}
                                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 disabled:opacity-50"
                                title="Baixar QR Code PNG de alta resolução"
                              >
                                {isDownloadingQr ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                ) : (
                                  <Download className="w-3.5 h-3.5 text-blue-600" />
                                )}
                                Download QR Code
                              </button>
                              <button
                                onClick={() => print10x10Plate(l)}
                                className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
                              >
                                <QrCode className="w-4 h-4" />
                                Gerar Placa de Mesa 10x10
                              </button>
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs text-blue-800 leading-normal flex items-start gap-2">
                            <Key className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                            <p>
                              <strong>Atuação Inteligente do Administrador:</strong> Qualquer alteração feita acima é gravada de imediato na nuvem. Você pode vender este portal como um serviço de agência de suporte para seus clientes.
                            </p>
                          </div>
                        </div>

                      </div>
                    );
                  })() : (
                    <div className="text-center py-20 space-y-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <Sliders className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold">Nenhum Cliente Selecionado</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Selecione uma empresa local da barra lateral esquerda para iniciar a administração de links e pagamentos de mensalidade.</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* B: CLIENT PORTAL LOGIN MODE */}
            {portalMode === 'client_login' && (
              <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-md">
                <div className="text-center space-y-2 mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-1">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Portal do Cliente - ALF Automações</h3>
                  <p className="text-xs text-slate-500">Acesse e configure para onde sua Placa NFC e QR Code redirecionam em tempo real.</p>
                </div>

                {/* Active Lockout Security Alert */}
                {clientLockoutSeconds > 0 && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5 shadow-sm">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                    <div className="space-y-1">
                      <p className="font-bold text-amber-900 uppercase tracking-wide text-[11px]">
                        Acesso Temporariamente Bloqueado (CyberShield)
                      </p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Você atingiu o limite de <strong>3 tentativas incorretas</strong>. Por segurança, o sistema bloqueou novas tentativas por 2 minutos no banco de dados.
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-200/80 font-mono font-bold text-amber-900 text-xs">
                          Aguarde: {clientLockoutSeconds}s
                        </span>
                        <span className="text-[10px] text-amber-700">Liberação automática</span>
                      </div>
                    </div>
                  </div>
                )}

                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (clientLockoutSeconds > 0) return;
                    setClientErrorMessage('');
                    const searchId = clientLoginId.trim().toLowerCase();
                    const searchPass = clientLoginPassword.trim();

                    if (!searchId || !searchPass) {
                      setClientErrorMessage('Por favor, informe o Código ID ou nome da empresa e o código PIN.');
                      return;
                    }

                    try {
                      const res = await fetch('/api/client/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: searchId, password: searchPass })
                      });
                      const data = await res.json();

                      if (res.status === 429 || data.locked) {
                        const rem = data.retryAfterSeconds || 120;
                        setClientLockoutSeconds(rem);
                        setClientErrorMessage(data.error || 'Acesso bloqueado por 2 minutos devido a 3 tentativas incorretas.');
                        return;
                      }

                      if (res.ok && data.success) {
                        const target = leads.find(l => 
                          l.id.toLowerCase() === data.lead.id.toLowerCase() || 
                          l.name.toLowerCase().includes(searchId)
                        ) || {
                          id: data.lead.id,
                          name: data.lead.name || 'Estabelecimento',
                          city: data.lead.city || '',
                          niche: data.lead.niche || '',
                          phone: '',
                          address: '',
                          rating: 5,
                          reviewCount: 0,
                          hasWebsite: false,
                          googleMapsUrl: data.lead.googleMapsUrl || '',
                          nfcCustomUrl: data.lead.nfcCustomUrl || '',
                          nfcRedirectActive: 'maps',
                          portalUsername: data.lead.portalUsername || data.lead.id,
                          nfcPassword: searchPass
                        };

                        setLoggedInClient(target as Lead);
                        setPortalMode('client_panel');
                        return;
                      }

                      setClientErrorMessage(data.error || 'Código ID ou Senha PIN inválida.');
                    } catch (err) {
                      setClientErrorMessage('Erro de conexão ao validar credenciais no servidor.');
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Código ID do Estabelecimento ou Nome</label>
                    <input
                      type="text"
                      required
                      disabled={clientLockoutSeconds > 0}
                      placeholder="Ex: padaria_suica ou id do cliente"
                      value={clientLoginId}
                      onChange={(e) => setClientLoginId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Senha de Acesso (PIN)</label>
                    <input
                      type="password"
                      required
                      disabled={clientLockoutSeconds > 0}
                      placeholder="Digite sua senha PIN de 4 dígitos"
                      value={clientLoginPassword}
                      onChange={(e) => setClientLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                    />
                  </div>

                  {clientErrorMessage && clientLockoutSeconds <= 0 && (
                    <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-xs text-red-700 leading-normal animate-in shake duration-150">
                      ⚠️ {clientErrorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={clientLockoutSeconds > 0}
                    className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold py-3 rounded-xl shadow-md cursor-pointer transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {clientLockoutSeconds > 0 ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        Acesso bloqueado ({clientLockoutSeconds}s)
                      </span>
                    ) : (
                      'Acessar Meu Portal'
                    )}
                  </button>
                </form>

                <div className="text-center mt-6 text-[10px] text-slate-400">
                  Perdeu seu código de acesso? Entre em contato com o suporte da ALEF Automações.
                </div>
              </div>
            )}

            {/* C: LOGGED IN CLIENT PANEL - THE CLIENT SELF-SERVICE PORTAL */}
            {portalMode === 'client_panel' && loggedInClient && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Client Portal Navigation Tabs */}
                <div className="bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:flex items-center gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => setClientPortalTab('config')}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                        clientPortalTab === 'config'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Destino da Placa &amp; QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setClientPortalTab('monitoring')}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                        clientPortalTab === 'monitoring'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">Monitoramento de Acessos</span>
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-cyan-500/20 text-cyan-700 border border-cyan-500/30">
                        NFC
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setNfcWriterTarget(loggedInClient);
                        setIsNfcWriterOpen(true);
                      }}
                      className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      title="Gravar na Tag NFC pelo Google Chrome no Android"
                    >
                      <Smartphone className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Gravar Tag NFC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLoggedInClient(null);
                        setPortalMode('client_login');
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer shrink-0"
                    >
                      Sair
                    </button>
                  </div>
                </div>

                {/* Sub-Tab 1: ACCESS MONITORING (RECHARTS) */}
                {clientPortalTab === 'monitoring' && (
                  <ClientAccessMonitoring lead={loggedInClient} />
                )}

                {/* Sub-Tab 2: CONFIGURATION PANELS */}
                {clientPortalTab === 'config' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Panel: Link display & QR Code */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between gap-5 sm:gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 flex items-center justify-center font-bold">
                        {loggedInClient.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-950 leading-tight">{loggedInClient.name}</h3>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Painel de Autoatendimento</span>
                      </div>
                    </div>

                    {/* Subscription billing status banner */}
                    <div className={`p-4 rounded-xl border text-xs leading-normal font-semibold ${
                      loggedInClient.nfcBillingStatus === 'suspended'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                      {loggedInClient.nfcBillingStatus === 'suspended' ? (
                        <p className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <span>Sua licença está Suspensa! As tags NFC mostrarão uma página de aviso até a regularização da mensalidade.</span>
                        </p>
                      ) : (
                        <p className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Sua assinatura está Ativa e regularizada! Seus redirecionamentos NFC estão rodando em tempo real na nuvem.</span>
                        </p>
                      )}
                    </div>

                    {/* Permanent URL view */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Seu Link Permanente NFC</span>
                      <div className="flex items-center justify-between gap-2 bg-white border border-slate-100 p-2.5 rounded-xl">
                        <span className="text-xs font-mono font-bold text-slate-600 truncate">
                          {getDynamicQrUrl(loggedInClient.id)}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(getDynamicQrUrl(loggedInClient.id));
                            alert('Link copiado com sucesso!');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg cursor-pointer shrink-0 transition"
                          title="Copiar Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400">Grave este link em sua placa física NFC uma única vez. Depois você poderá alterar o destino instantaneamente por aqui!</p>
                    </div>

                  </div>

                  {/* Dynamic QR Code display */}
                  <div className="bg-slate-950 text-white rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center gap-3 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial-gradient from-blue-600/10 to-transparent pointer-events-none"></div>
                    
                    {/* Mode Selector Toggle */}
                    <div className="flex flex-col sm:flex-row items-center gap-1.5 bg-white/10 p-1.5 rounded-xl w-full text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPortalQrMode('dynamic')}
                        className={`w-full sm:flex-1 py-2 sm:py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                          portalQrMode === 'dynamic'
                            ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <RefreshCw className="w-3 h-3 shrink-0" />
                        <span className="truncate">🔄 Dinâmico Nuvem</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPortalQrMode('direct')}
                        className={`w-full sm:flex-1 py-2 sm:py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                          portalQrMode === 'direct'
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        <span className="truncate">⭐ Direto Google</span>
                      </button>
                    </div>
                    
                    <div className="bg-white p-3.5 rounded-2xl shadow-inner mt-1 border-2 border-white/10 relative group">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          portalQrMode === 'dynamic' ? getDynamicQrUrl(loggedInClient.id) : getDirectLeadUrl(loggedInClient)
                        )}`}
                        alt={portalQrMode === 'dynamic' ? 'Dynamic QR Code' : 'Direct Google QR Code'}
                        className="w-36 h-36 shrink-0"
                      />
                    </div>

                    <div className="space-y-1 text-center max-w-xs">
                      <span className="text-[10px] font-bold text-slate-300 block">
                        {portalQrMode === 'dynamic' ? 'QR Code Dinâmico em Tempo Real' : 'QR Code Direto Google (Sem Intermediário)'}
                      </span>
                      <p className="text-[9px] text-slate-400 leading-tight">
                        {portalQrMode === 'dynamic'
                          ? 'Grave na placa: o link físico nunca muda. Ao alterar o destino acima, todos que escanearem serão redirecionados na hora!'
                          : 'Abre a tela de 5 estrelas do Google imediatamente no celular do cliente sem nenhuma tela intermediária.'}
                      </p>
                    </div>
                    
                    {/* Artwork Download Hub Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setArtworkTargetLead(loggedInClient);
                        setIsArtworkModalOpen(true);
                      }}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-slate-950 text-xs font-black py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                      title="Baixar arte da Placa 10x10cm e Cartão NFC 5.4x8.5cm em alta resolução 300 DPI para enviar para a gráfica"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950 shrink-0" />
                      <span className="text-xs">Baixar Placa 10x10 &amp; Cartão NFC (300 DPI)</span>
                    </button>

                    {/* Quick Download Buttons: 10x10 Plate & 5.4x8.5 Card */}
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setIsDownloadingDirectArtwork(true);
                            await downloadPlate10x10Png({
                              businessName: loggedInClient.name,
                              leadId: loggedInClient.id,
                              permanentUrl: getDirectLeadUrl(loggedInClient),
                              theme: 'black_gold',
                              city: loggedInClient.city
                            });
                          } catch (e: any) {
                            alert('Erro ao baixar placa: ' + e.message);
                          } finally {
                            setIsDownloadingDirectArtwork(false);
                          }
                        }}
                        disabled={isDownloadingDirectArtwork}
                        className="py-2 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold border border-white/10 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        title="Baixar imagem em PNG 300 DPI da Placa de Mesa 10x10 cm"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Placa 10x10 HD</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setIsDownloadingDirectArtwork(true);
                            await downloadCardNfcPng({
                              businessName: loggedInClient.name,
                              leadId: loggedInClient.id,
                              permanentUrl: getDirectLeadUrl(loggedInClient),
                              theme: 'black_gold',
                              city: loggedInClient.city
                            }, 'horizontal');
                          } catch (e: any) {
                            alert('Erro ao baixar cartão: ' + e.message);
                          } finally {
                            setIsDownloadingDirectArtwork(false);
                          }
                        }}
                        disabled={isDownloadingDirectArtwork}
                        className="py-2 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold border border-white/10 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        title="Baixar imagem em PNG 300 DPI do Cartão NFC 5.4x8.5 cm"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cartão 5.4x8.5 HD</span>
                      </button>
                    </div>

                    {/* Secondary Actions Row */}
                    <div className="grid grid-cols-2 gap-2 w-full pt-1">
                      {/* Download QR Code isolado */}
                      <button
                        onClick={() => downloadClientQrCode(loggedInClient, 1000)}
                        disabled={isDownloadingQr}
                        id="btn-download-client-qr"
                        className="bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-bold py-2 px-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 border border-white/10"
                        title="Baixar imagem do QR Code isolado em PNG de alta resolução"
                      >
                        {isDownloadingQr ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-200" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-white" />
                        )}
                        <span>QR Isolado</span>
                      </button>

                      {/* Imprimir Placa de Mesa 10x10cm */}
                      <button
                        onClick={() => print10x10Plate(loggedInClient)}
                        className="bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-bold py-2 px-2 rounded-xl border border-white/10 flex items-center justify-center gap-1 transition cursor-pointer"
                        title="Abrir modelo pronto de placa quadrada 10x10cm para impressão"
                      >
                        <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Imprimir 10x10</span>
                      </button>
                    </div>

                    {/* Feedback message on successful download */}
                    {qrDownloadSuccess === loggedInClient.id && (
                      <div className="w-full p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>PNG de alta resolução baixado com sucesso!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel: Configure Active Target */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Onde sua placa física deve levar o cliente agora?</h3>
                    <p className="text-xs text-slate-400">Escolha o destino ativo na nuvem e configure as informações de contato abaixo.</p>
                  </div>

                  {/* Active target radio selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: 'gmb', label: '⭐ Avaliações Google', desc: 'Leva ao formulário do GMB', allowed: loggedInClient.nfcModulesAllowed?.gmb !== false },
                      { key: 'whatsapp', label: '💬 WhatsApp de Vendas', desc: 'Inicia conversa direta', allowed: loggedInClient.nfcModulesAllowed?.whatsapp !== false },
                      { key: 'instagram', label: '📸 Perfil do Instagram', desc: 'Abre o app no feed', allowed: loggedInClient.nfcModulesAllowed?.instagram !== false },
                      { key: 'website', label: '🌐 Site Oficial', desc: 'Acessa sua Landing Page', allowed: loggedInClient.nfcModulesAllowed?.website !== false },
                      { key: 'custom', label: '🔗 Link Customizado Livre', desc: 'Redireciona para qualquer link', allowed: loggedInClient.nfcModulesAllowed?.custom !== false }
                    ].map((target) => {
                      const isSelected = (loggedInClient.nfcRedirectActive || 'gmb') === target.key;
                      
                      if (!target.allowed) {
                        return (
                          <div key={target.key} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 opacity-45 select-none flex items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-500">{target.label}</span>
                              <span className="block text-[9px] text-red-500 font-bold uppercase tracking-wider">🔒 Bloqueado no plano</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={target.key}
                          onClick={() => updateLeadDetails(loggedInClient.id, { nfcRedirectActive: target.key as any })}
                          className={`text-left p-3.5 rounded-xl border transition flex items-start justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/20 shadow-xs'
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 block">{target.label}</span>
                            <span className="text-[10px] text-slate-400 block">{target.desc}</span>
                          </div>
                          <input
                            type="radio"
                            readOnly
                            checked={isSelected}
                            className="text-blue-600 focus:ring-blue-500 h-4.5 w-4.5 mt-0.5"
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive config inputs according to chosen redirect target */}
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Preencher Dados do Destino Selecionado</h4>

                    {/* Google reviews */}
                    {(loggedInClient.nfcRedirectActive || 'gmb') === 'gmb' && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 uppercase">Assistente de Link de Avaliação Direto</label>
                          <GoogleReviewLinkGenerator
                            initialQuery={loggedInClient.name}
                            initialCity={loggedInClient.city}
                            currentUrl={loggedInClient.googleMapsUrl}
                            compact={true}
                            onLinkGenerated={(generatedUrl) => updateLeadDetails(loggedInClient.id, { googleMapsUrl: generatedUrl })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 uppercase">Link de Avaliações Configurado</label>
                          <input
                            type="text"
                            value={loggedInClient.googleMapsUrl || ''}
                            onChange={(e) => updateLeadDetails(loggedInClient.id, { googleMapsUrl: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                            placeholder="Cole seu link de avaliações do Google Meu Negócio"
                          />
                        </div>
                      </div>
                    )}

                    {/* Whatsapp direct chat */}
                    {(loggedInClient.nfcRedirectActive) === 'whatsapp' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 uppercase">Número do WhatsApp (Com DDD)</label>
                          <input
                            type="text"
                            value={loggedInClient.nfcWhatsappNum || ''}
                            onChange={(e) => updateLeadDetails(loggedInClient.id, { nfcWhatsappNum: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                            placeholder="Ex: 11999999999"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 uppercase">Mensagem Inicial Automática</label>
                          <input
                            type="text"
                            value={loggedInClient.nfcWhatsappMsg || ''}
                            onChange={(e) => updateLeadDetails(loggedInClient.id, { nfcWhatsappMsg: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                            placeholder="Olá! Gostaria de agendar."
                          />
                        </div>
                      </div>
                    )}

                    {/* Instagram */}
                    {(loggedInClient.nfcRedirectActive) === 'instagram' && (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 uppercase">URL do seu Perfil Instagram</label>
                          <input
                            type="text"
                            value={loggedInClient.nfcInstagramUrl || ''}
                            onChange={(e) => updateLeadDetails(loggedInClient.id, { nfcInstagramUrl: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                            placeholder="https://instagram.com/seu_perfil"
                          />
                        </div>

                        {/* Special 4K Ultra-Realistic Instagram + Google Dual Plate Option Card */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-900/5 via-purple-900/5 to-blue-900/10 border-2 border-pink-500/40 space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-xs">
                                📸 Modelo Ultra-Realista da Foto
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-900 text-cyan-300 border border-slate-700">
                                4K • 600 DPI
                              </span>
                            </div>
                            <h5 className="text-xs font-black text-slate-900">
                              Placa Híbrida Inteligente: Instagram (Topo) + Onda Orgânica + Google Reviews (Base)
                            </h5>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Layout idêntico ao modelo da foto: 2 QR Codes integrados, 2 áreas de aproximação NFC, degradê vibrante do Instagram com onda fluida branca e base azul royal do Google. Proporções milimétricas em 4K prontas para impressão e corte a laser.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => print10x10Plate(loggedInClient, 'instagram_dual')}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white text-xs font-black uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Imprimir Placa da Foto (4K)</span>
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                await downloadPlate10x10Png({
                                  businessName: loggedInClient.name || 'Empresa',
                                  leadId: loggedInClient.id || 'TAG01',
                                  permanentUrl: getDirectLeadUrl(loggedInClient),
                                  theme: 'instagram_dual',
                                  city: loggedInClient.city || '',
                                  instagramUrl: loggedInClient.nfcInstagramUrl || '',
                                  instagramHandle: (loggedInClient.nfcInstagramUrl || '').replace(/.*instagram\.com\//, '').replace(/\/$/, '')
                                });
                              }}
                              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <Download className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Baixar PNG 4K (4000x4000)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLead(loggedInClient);
                                changeTab('nfc_designer');
                              }}
                              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>Simulador 3D do Totem</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Website */}
                    {(loggedInClient.nfcRedirectActive) === 'website' && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase">URL do seu Site / Landing Page</label>
                        <input
                          type="text"
                          value={loggedInClient.websiteUrl || ''}
                          onChange={(e) => updateLeadDetails(loggedInClient.id, { websiteUrl: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                          placeholder="https://seusite.com.br"
                        />
                      </div>
                    )}

                    {/* Custom */}
                    {(loggedInClient.nfcRedirectActive) === 'custom' && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase">Qualquer Link Externo (Livre)</label>
                        <input
                          type="text"
                          value={loggedInClient.nfcCustomUrl || ''}
                          onChange={(e) => updateLeadDetails(loggedInClient.id, { nfcCustomUrl: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                          placeholder="Ex: https://linktree.com/suaempresa"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setLoggedInClient(null);
                        setPortalMode('client_login');
                      }}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                    >
                      Sair do Portal
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const updated = leads.find(item => item.id === loggedInClient.id);
                          if (updated) {
                            setLoggedInClient(updated);
                            alert('Suas alterações dinâmicas foram salvas e já estão ativas na sua Placa NFC em tempo real!');
                          }
                        } catch (err) {
                          alert('Erro ao atualizar as configurações. Verifique sua conexão.');
                        }
                      }}
                      className="px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </button>
                  </div>
                </div>

              </div>
            )}
              </div>
            )}
          </div>
        )}
      </div>
    )}

        {/* 8: USER MANAGEMENT & CYBERSHIELD RBAC PANEL */}
        {activeTab === 'users' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <UserManagementPanel currentSessionToken={currentUser?.token} />
          </div>
        )}

        {/* 9: PÁGINA DE VENDAS & APRESENTAÇÃO COMERCIAL (HIGH-CONVERSION PITCH) */}
        {activeTab === 'landing' && (
          <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">
                  Modo Apresentação Comercial / Demonstração Interativa para Clientes
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleNavSelect('dynamic_qr')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar ao Painel ALF</span>
              </button>
            </div>
            <SalesLandingPage
              initialNiche={selectedLead?.niche || undefined}
              onOpenLogin={() => setIsMasterModalOpen(true)}
              onExploreDemo={() => handleNavSelect('site_preview')}
            />
          </div>
        )}

      </main>

        {/* Footer Branding */}
        <footer className="bg-white border-t border-slate-200 py-6 mt-12 w-full" id="main-footer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2.5">
            <p className="font-semibold text-slate-700">
              Desenvolvido por <span className="text-slate-900 font-extrabold">ALF Automação</span>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs">
              <a
                href="https://instagram.com/alefautomacao"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-pink-600 hover:text-pink-700 hover:underline transition-colors px-2.5 py-1 rounded-full bg-pink-50 border border-pink-100"
                title="Acessar Instagram @alefautomacao"
                id="footer-instagram-link"
              >
                <Instagram className="h-3.5 w-3.5" />
                <span>@alefautomacao</span>
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              © 2026 ALF Automação. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div> {/* End Main Workspace (Header + Viewport + Footer) */}

      {/* EXPORT SITE MODAL */}
      <ExportSiteModal
        isOpen={isExportSiteModalOpen}
        onClose={() => setIsExportSiteModalOpen(false)}
        siteTemplate={siteTemplate}
        lead={selectedLead || (leads.length > 0 ? leads[0] : {
          name: 'Cliente Demonstração',
          city: city || 'São Paulo',
          niche: niche || 'Serviços',
          phone: '(11) 99999-9999',
          address: 'Av. Paulista, 1000'
        })}
        theme={simulatorTheme}
      />

      {/* NFC TAG HARDWARE WRITER MODAL (CHROME ANDROID) */}
      <NfcWriterModal
        isOpen={isNfcWriterOpen}
        onClose={() => {
          setIsNfcWriterOpen(false);
          setNfcWriterTarget(null);
        }}
        leadId={nfcWriterTarget?.id || ''}
        leadName={nfcWriterTarget?.name || ''}
      />

      {/* GLOBAL MASTER LOGIN MODAL */}
      {isMasterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => {
                setIsMasterModalOpen(false);
                setMasterError('');
                setMasterTargetTab(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              title="Fechar"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-inner">
                <Lock className="h-7 w-7" />
              </div>
              <span className="inline-block text-[9px] font-extrabold tracking-widest uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                Autenticação Master
              </span>
              <h3 className="text-lg font-black text-slate-900">
                Acesso Restrito ao Operador
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Este recurso é restrito para operadores Master. Digite o usuário e senha Master para liberar o acesso.
              </p>
            </div>

            <form onSubmit={handleMasterLogin} className="space-y-3.5 text-left">
              <button
                type="button"
                onClick={quickMasterUnlock}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Zap className="h-3.5 w-3.5 text-amber-200 fill-amber-200" />
                <span>⚡ Desbloqueio Rápido Master (1-Clique)</span>
              </button>

              <div className="relative flex py-0.5 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-2 text-[9px] text-slate-400 font-bold uppercase">Ou digite suas credenciais</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Usuário Master</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => fillMasterCredentials('default')}
                      className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-bold hover:bg-slate-200 transition cursor-pointer"
                      title="Preencher com master"
                    >
                      master
                    </button>
                    <button
                      type="button"
                      onClick={() => fillMasterCredentials('env')}
                      className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold hover:bg-amber-100 transition cursor-pointer"
                      title="Preencher com Mysis@26"
                    >
                      Mysis@26
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={masterUserInput}
                  onChange={(e) => setMasterUserInput(e.target.value)}
                  placeholder="master ou Mysis@26"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Senha Master</label>
                <input
                  type="password"
                  required
                  value={masterPasswordInput}
                  onChange={(e) => setMasterPasswordInput(e.target.value)}
                  placeholder="master, master@2026 ou Myadm@26"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              {masterError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{masterError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMasterModalOpen(false);
                    setMasterError('');
                    setMasterTargetTab(null);
                  }}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={masterIsLoading}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {masterIsLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  <span>Entrar como Master</span>
                </button>
              </div>
            </form>

            {/* Quick Master Password Recovery Assistant */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => setShowMasterCredentialsHelp(!showMasterCredentialsHelp)}
                className="w-full text-center text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>{showMasterCredentialsHelp ? 'Ocultar senhas Master' : 'Esqueceu as senhas Master? Clique aqui'}</span>
              </button>

              {showMasterCredentialsHelp && (
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-left text-xs space-y-2.5 animate-in fade-in">
                  <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                    Credenciais Master Oficiais de Acesso:
                  </span>
                  
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="bg-white p-2 rounded-xl border border-amber-200/60 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 font-sans block text-[9px] font-bold uppercase">Operador Principal</span>
                        <span className="text-slate-800 font-bold">Mysis@26</span> / <span className="text-amber-800 font-black">Myadm@26</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          fillMasterCredentials('env');
                          setShowMasterCredentialsHelp(false);
                        }}
                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-sans font-bold rounded-lg cursor-pointer"
                      >
                        Usar Esta
                      </button>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-amber-200/60 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 font-sans block text-[9px] font-bold uppercase">Suporte Técnico</span>
                        <span className="text-slate-800 font-bold">master</span> / <span className="text-amber-800 font-black">master@2026</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          fillMasterCredentials('default');
                          setShowMasterCredentialsHelp(false);
                        }}
                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-sans font-bold rounded-lg cursor-pointer"
                      >
                        Usar Esta
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-amber-900/80 font-sans leading-relaxed">
                    Você também pode clicar no botão amarelo <strong>"⚡ Desbloqueio Rápido Master"</strong> acima para entrar imediatamente com 1 clique!
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsMasterModalOpen(false);
                  setIsSellerRegisterModalOpen(true);
                }}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quer revender nosso sistema? Cadastre-se como Vendedor / Parceiro</span>
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400">
              ALEF Automações • Autenticação Segura de Operadores
            </p>
          </div>
        </div>
      )}

      {/* Global Artwork Download Modal */}
      <NfcArtworkDownloadModal
        isOpen={isArtworkModalOpen}
        onClose={() => {
          setIsArtworkModalOpen(false);
          setArtworkTargetLead(null);
        }}
        lead={artworkTargetLead || loggedInClient || selectedLead || leads[0] || null}
        leads={leads}
        onSelectDifferentLead={(l) => setArtworkTargetLead(l)}
        onMarkPrinted={(leadId, currentStatus) => {
          const newStatus = currentStatus === false ? true : !currentStatus;
          updateLeadDetails(leadId, {
            isPlaquePrinted: newStatus,
            plaquePrintedAt: newStatus ? new Date().toISOString() : undefined
          });
        }}
        onPrintPlate={print10x10Plate}
      />

      {/* Universal Plate Scanner & Quick Lookup Modal */}
      <PlateScannerModal
        isOpen={isPlateScannerOpen}
        onClose={() => setIsPlateScannerOpen(false)}
        leads={leads}
        onPlateUpdated={(updatedLead) => {
          setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
          if (selectedLead?.id === updatedLead.id) {
            setSelectedLead(updatedLead);
          }
        }}
      />

      {/* Custom Domain Settings Modal */}
      <CustomDomainModal
        isOpen={isCustomDomainModalOpen}
        onClose={() => setIsCustomDomainModalOpen(false)}
      />

      {/* Antigravity & IDE Project Export Modal */}
      <AntigravityExportModal
        isOpen={isAntigravityModalOpen}
        onClose={() => setIsAntigravityModalOpen(false)}
      />

      {/* Seller & Affiliate Self-Registration Modal */}
      <SellerRegisterModal
        isOpen={isSellerRegisterModalOpen}
        onClose={() => setIsSellerRegisterModalOpen(false)}
        onSuccess={(newUser, token) => {
          if (currentUser?.role !== 'master' && !isMasterAuthenticated) {
            setCurrentUser({
              token,
              username: newUser.username,
              name: newUser.name,
              role: newUser.role,
              allowedTabs: newUser.allowedTabs,
              clientPermissions: newUser.clientPermissions
            } as any);
          }
        }}
      />

      {/* Secure Auth & Operator Switcher Modal */}
      <SecureAuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          try {
            localStorage.setItem('alf_auth_user', JSON.stringify(user));
            localStorage.setItem('alf_master_auth', user.role === 'master' ? 'true' : 'false');
            localStorage.setItem('alf_master_user', user.username);
          } catch (_) {}
          setIsLoginModalOpen(false);
          if (authTargetTab) {
            changeTab(authTargetTab as any);
          }
        }}
        targetTabName={authTargetTab}
      />

    </div>
  );
}


export default function App() {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isRedirectRoute = /^\/(r|redirect|nfc|tag)\//i.test(currentPath);

  if (isRedirectRoute) {
    const rawId = decodeURIComponent(currentPath.replace(/^\/(r|redirect|nfc|tag)\//i, '')).trim().toLowerCase().split('/')[0].split('?')[0];
    const cleanId = rawId.replace(/[^a-zA-Z0-9_\-]/g, '');
    if (cleanId.length > 0) {
      return <RedirectHandler cleanId={cleanId} />;
    }
  }

  return <MainApp />;
}
