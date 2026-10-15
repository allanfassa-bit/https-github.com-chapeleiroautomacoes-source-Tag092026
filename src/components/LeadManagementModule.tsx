import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  Phone,
  MessageSquare,
  Share2,
  CheckCircle,
  TrendingUp,
  Plus,
  Trash2,
  Globe,
  Sliders,
  Star,
  Edit3,
  AlertTriangle,
  ArrowRight,
  Lock,
  Copy,
  Save,
  Download,
  Terminal,
  Activity,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Info,
  QrCode,
  Zap,
  Building2,
  ArrowLeft,
  Filter,
  Check,
  Printer
} from 'lucide-react';
import { Lead, Pitch, SiteTemplate, PRESET_NICHES } from '../App';
import { getPublicAppOrigin } from '../utils/publicUrlHelper';

interface LeadManagementModuleProps {
  leads: Lead[];
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
  city: string;
  setCity: (city: string) => void;
  niche: string;
  setNiche: (niche: string) => void;
  customNiche: string;
  setCustomNiche: (niche: string) => void;
  isSearching: boolean;
  searchStep: number;
  searchLogs: any[];
  searchErrorDetails: any;
  searchExecutionTime: number | null;
  isConsoleExpanded: boolean;
  setIsConsoleExpanded: (expanded: boolean) => void;
  antiTruncationRecovered: boolean;
  searchLocalBusinesses: () => void;
  nfcPrice: number;
  setNfcPrice: (p: number) => void;
  sitePrice: number;
  setSitePrice: (p: number) => void;
  comboPrice: number;
  setComboPrice: (p: number) => void;
  tableSearchTerm: string;
  setTableSearchTerm: (term: string) => void;
  selectedCityFilter: string;
  setSelectedCityFilter: (city: string) => void;
  ratingFilter: 'all' | 'lt_40' | 'lt_45' | 'gte_45';
  setRatingFilter: (r: 'all' | 'lt_40' | 'lt_45' | 'gte_45') => void;
  sortBy: 'default' | 'fewest_reviews' | 'most_reviews' | 'lowest_rating' | 'highest_rating' | 'no_website_first';
  setSortBy: (s: any) => void;
  easyConversionOnly: boolean;
  setEasyConversionOnly: (e: boolean) => void;
  filterOnlySearched: boolean;
  setFilterOnlySearched: (f: boolean) => void;
  lastSearchLeadIds: string[];
  updateLeadStage: (id: string, stage: any) => void;
  removeLead: (id: string) => void;
  handleWebShareLead: (lead: Lead) => void;
  requireMasterAccess: (tab: any, callback: () => void) => void;
  generateWebsiteTemplate: (lead: Lead) => Promise<any>;
  siteTemplate: SiteTemplate | null;
  setIsExportSiteModalOpen: (open: boolean) => void;
  setPlateTheme: (theme: any) => void;
  setGmbReviewLink: (url: string) => void;
  setActiveTab: (tab: any) => void;
  validateAndFixGoogleReviewLink: (url: string) => Promise<void>;
  isValidatingGmbUrl: boolean;
  gmbValidationFeedback: { type: 'success' | 'error' | 'info'; message: string } | null;
  updateLeadDetails: (id: string, updates: Partial<Lead>) => Promise<void>;
  generateSalesPitch: (lead: Lead) => void;
  pitch: Pitch | null;
  isGeneratingPitch: boolean;
  selectedPitchType: 'combo' | 'nfc' | 'site';
  setSelectedPitchType: (t: 'combo' | 'nfc' | 'site') => void;
  getWhatsAppLink: (lead: Lead, msg?: string) => string;
  isMasterAuthenticated: boolean;
  newHistoryNote: string;
  setNewHistoryNote: (n: string) => void;
}

export function LeadManagementModule(props: LeadManagementModuleProps) {
  const {
    leads,
    selectedLead,
    setSelectedLead,
    city,
    setCity,
    niche,
    setNiche,
    customNiche,
    setCustomNiche,
    isSearching,
    searchStep,
    searchLogs,
    searchErrorDetails,
    searchExecutionTime,
    isConsoleExpanded,
    setIsConsoleExpanded,
    antiTruncationRecovered,
    searchLocalBusinesses,
    nfcPrice,
    setNfcPrice,
    sitePrice,
    setSitePrice,
    comboPrice,
    setComboPrice,
    tableSearchTerm,
    setTableSearchTerm,
    selectedCityFilter,
    setSelectedCityFilter,
    ratingFilter,
    setRatingFilter,
    sortBy,
    setSortBy,
    easyConversionOnly,
    setEasyConversionOnly,
    filterOnlySearched,
    setFilterOnlySearched,
    lastSearchLeadIds,
    updateLeadStage,
    removeLead,
    handleWebShareLead,
    requireMasterAccess,
    generateWebsiteTemplate,
    siteTemplate,
    setIsExportSiteModalOpen,
    setPlateTheme,
    setGmbReviewLink,
    setActiveTab,
    validateAndFixGoogleReviewLink,
    isValidatingGmbUrl,
    gmbValidationFeedback,
    updateLeadDetails,
    generateSalesPitch,
    pitch,
    isGeneratingPitch,
    selectedPitchType,
    setSelectedPitchType,
    getWhatsAppLink,
    isMasterAuthenticated,
    newHistoryNote,
    setNewHistoryNote
  } = props;

  // Didactic view subtabs
  const [leadsSubTab, setLeadsSubTab] = useState<'directory' | 'search' | 'pricing'>('directory');
  const [leadDetailTab, setLeadDetailTab] = useState<'overview' | 'nfc' | 'site' | 'pitch' | 'edit'>('overview');
  const [leadCategoryFilter, setLeadCategoryFilter] = useState<'all' | 'nfc_active' | 'nfc_pending' | 'in_crm' | 'high_converting' | 'plaque_printed' | 'plaque_unprinted'>('all');

  // Edit lead form local state
  const [isEditingLeadData, setIsEditingLeadData] = useState(false);
  const [editLeadAddress, setEditLeadAddress] = useState('');
  const [editLeadPhone, setEditLeadPhone] = useState('');
  const [editLeadGoogleMapsUrl, setEditLeadGoogleMapsUrl] = useState('');
  const [editLeadPortalUsername, setEditLeadPortalUsername] = useState('');
  const [editLeadNfcPassword, setEditLeadNfcPassword] = useState('');

  // Filtering calculations
  const normalizeFilterText = (s: string) =>
    (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-_.,/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const availableCities = useMemo(() => {
    return Array.from(new Set(leads.map((l) => (l.city || '').trim()).filter(Boolean))).sort();
  }, [leads]);

  const displayedLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Text Search across name, address, niche, city, id
      if (tableSearchTerm.trim()) {
        const term = normalizeFilterText(tableSearchTerm);
        const nameM = normalizeFilterText(lead.name || '').includes(term);
        const addrM = normalizeFilterText(lead.address || '').includes(term);
        const cityM = normalizeFilterText(lead.city || '').includes(term);
        const nicheM = normalizeFilterText(lead.niche || '').includes(term);
        const idM = normalizeFilterText(lead.id || '').includes(term);
        if (!nameM && !addrM && !cityM && !nicheM && !idM) return false;
      }

      // 2. City filter
      if (selectedCityFilter !== 'all') {
        const cleanTarget = normalizeFilterText(selectedCityFilter);
        const lCity = normalizeFilterText(lead.city || '');
        const lAddr = normalizeFilterText(lead.address || '');
        if (!lCity.includes(cleanTarget) && !cleanTarget.includes(lCity) && !lAddr.includes(cleanTarget)) {
          return false;
        }
      }

      // 3. Category Filter
      if (leadCategoryFilter === 'nfc_active') {
        const hasNfc = Boolean(lead.googleMapsUrl || lead.nfcCustomUrl || lead.nfcInstagramUrl || lead.nfcWhatsappNum);
        if (!hasNfc || lead.nfcBillingStatus === 'suspended') return false;
      } else if (leadCategoryFilter === 'nfc_pending') {
        const hasNfc = Boolean(lead.googleMapsUrl || lead.nfcCustomUrl || lead.nfcInstagramUrl || lead.nfcWhatsappNum);
        if (hasNfc && lead.googleMapsUrl !== 'https://maps.google.com') return false;
      } else if (leadCategoryFilter === 'in_crm') {
        if (!lead.stage) return false;
      } else if (leadCategoryFilter === 'high_converting') {
        const r = typeof lead.rating === 'number' ? lead.rating : 5;
        const isHigh = r < 4.2 || (lead.reviewCount || 0) < 15 || !lead.hasWebsite;
        if (!isHigh) return false;
      } else if (leadCategoryFilter === 'plaque_printed') {
        if (!lead.isPlaquePrinted) return false;
      } else if (leadCategoryFilter === 'plaque_unprinted') {
        if (lead.isPlaquePrinted) return false;
      }

      // 4. Rating filter
      const r = typeof lead.rating === 'number' ? lead.rating : 5;
      if (ratingFilter === 'lt_40' && r >= 4.0) return false;
      if (ratingFilter === 'lt_45' && r >= 4.5) return false;
      if (ratingFilter === 'gte_45' && r < 4.5) return false;

      // 5. Easy conversion shortcut
      if (easyConversionOnly) {
        const isHighConverting = r < 4.2 || (lead.reviewCount || 0) < 15 || !lead.hasWebsite;
        if (!isHighConverting) return false;
      }

      return true;
    });
  }, [leads, tableSearchTerm, selectedCityFilter, leadCategoryFilter, ratingFilter, easyConversionOnly]);

  const sortedLeads = useMemo(() => {
    return [...displayedLeads].sort((a, b) => {
      const aReviews = typeof a.reviewCount === 'number' ? a.reviewCount : 0;
      const bReviews = typeof b.reviewCount === 'number' ? b.reviewCount : 0;
      const aRating = typeof a.rating === 'number' ? a.rating : 5;
      const bRating = typeof b.rating === 'number' ? b.rating : 5;

      if (sortBy === 'fewest_reviews') return aReviews - bReviews;
      if (sortBy === 'most_reviews') return bReviews - aReviews;
      if (sortBy === 'lowest_rating') return aRating - bRating;
      if (sortBy === 'highest_rating') return bRating - aRating;
      if (sortBy === 'no_website_first') {
        if (a.hasWebsite === b.hasWebsite) return 0;
        return a.hasWebsite ? 1 : -1;
      }
      return 0;
    });
  }, [displayedLeads, sortBy]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = leads.length;
    const nfcActive = leads.filter((l) => (l.googleMapsUrl || l.nfcCustomUrl || l.nfcInstagramUrl) && l.nfcBillingStatus !== 'suspended').length;
    const nfcPending = leads.filter((l) => !l.nfcCustomUrl && (!l.googleMapsUrl || l.googleMapsUrl === 'https://maps.google.com')).length;
    const inCrm = leads.filter((l) => l.stage).length;
    const highConverting = leads.filter((l) => (l.rating || 5) < 4.2 || (l.reviewCount || 0) < 15 || !l.hasWebsite).length;
    const plaquePrinted = leads.filter((l) => Boolean(l.isPlaquePrinted)).length;
    const plaqueUnprinted = total - plaquePrinted;
    return { total, nfcActive, nfcPending, inCrm, highConverting, plaquePrinted, plaqueUnprinted };
  }, [leads]);

  // Navigation index for current selected lead
  const currentLeadIndex = useMemo(() => {
    if (!selectedLead) return -1;
    return sortedLeads.findIndex((l) => l.id === selectedLead.id);
  }, [sortedLeads, selectedLead]);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    generateSalesPitch(lead);
    setIsEditingLeadData(false);
    setEditLeadAddress(lead.address || '');
    setEditLeadPhone(lead.phone || '');
    setEditLeadGoogleMapsUrl(lead.googleMapsUrl || '');
    setEditLeadPortalUsername(lead.portalUsername || lead.id);
    setEditLeadNfcPassword(lead.nfcPassword || '2026');
  };

  const handleNextLead = () => {
    if (sortedLeads.length === 0) return;
    const nextIdx = (currentLeadIndex + 1) % sortedLeads.length;
    handleSelectLead(sortedLeads[nextIdx]);
  };

  const handlePrevLead = () => {
    if (sortedLeads.length === 0) return;
    const prevIdx = (currentLeadIndex - 1 + sortedLeads.length) % sortedLeads.length;
    handleSelectLead(sortedLeads[prevIdx]);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150 text-left">
      {/* 1: Master Didactic Navigation Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setLeadsSubTab('directory')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              leadsSubTab === 'directory'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Base de Empresas</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded-full font-bold">
              {leads.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setLeadsSubTab('search')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              leadsSubTab === 'search'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>Nova Prospecção Google Maps</span>
          </button>

          <button
            type="button"
            onClick={() => setLeadsSubTab('pricing')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              leadsSubTab === 'pricing'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Tabela de Preços</span>
          </button>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 justify-end text-xs">
          {selectedLead && leadsSubTab === 'directory' && (
            <button
              type="button"
              onClick={() => setSelectedLead(null)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Catálogo Completo</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setLeadsSubTab(leadsSubTab === 'search' ? 'directory' : 'search')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
          >
            {leadsSubTab === 'search' ? (
              <>
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ver Empresas ({leads.length})</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Escanear Google</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2: SUBTAB DIRECTORY (BASE DE EMPRESAS & CLIENTES CADASTRADOS) */}
      {leadsSubTab === 'directory' && (
        <div className="space-y-5">
          {/* A: Super Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              {/* Main Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={tableSearchTerm}
                  onChange={(e) => setTableSearchTerm(e.target.value)}
                  placeholder={`🔍 Pesquisar entre todas as ${leads.length} empresas cadastradas (digite nome, cidade, endereço)...`}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-9 text-xs font-semibold focus:outline-hidden focus:border-blue-500 transition-all shadow-inner"
                />
                {tableSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setTableSearchTerm('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 text-xs font-bold p-0.5 rounded-full hover:bg-slate-200"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sliders className="h-3 w-3 text-slate-500" /> Ordenar:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 py-2 px-3 focus:outline-hidden focus:bg-white cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <option value="default">Padrão do Cadastro</option>
                  <option value="lowest_rating">⚠️ Menor Nota Google (Urgente)</option>
                  <option value="fewest_reviews">📉 Menos Avaliações (Fácil Placa NFC)</option>
                  <option value="no_website_first">🌐 Sem Site Primeiro (Venda Site)</option>
                  <option value="most_reviews">📈 Mais Avaliações</option>
                  <option value="highest_rating">⭐ Maior Nota</option>
                </select>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setLeadCategoryFilter('all');
                  setRatingFilter('all');
                  setEasyConversionOnly(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  leadCategoryFilter === 'all' && ratingFilter === 'all' && !easyConversionOnly
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Todas</span>
                <span className="text-[10px] opacity-80 font-mono">({stats.total})</span>
              </button>

              <button
                type="button"
                onClick={() => setLeadCategoryFilter('nfc_active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  leadCategoryFilter === 'nfc_active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span>🏷️ Placa NFC Ativa</span>
                <span className="text-[10px] font-mono">({stats.nfcActive})</span>
              </button>

              <button
                type="button"
                onClick={() => setLeadCategoryFilter('nfc_pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  leadCategoryFilter === 'nfc_pending'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span>🟡 Aguardando Placa</span>
                <span className="text-[10px] font-mono">({stats.nfcPending})</span>
              </button>

              <button
                type="button"
                onClick={() => setLeadCategoryFilter('plaque_unprinted')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  leadCategoryFilter === 'plaque_unprinted'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
                title="Filtrar placas novas que ainda não foram impressas"
              >
                <span>🟡 Placas Pendentes</span>
                <span className="text-[10px] font-mono font-black">({stats.plaqueUnprinted})</span>
              </button>

              <button
                type="button"
                onClick={() => setLeadCategoryFilter('plaque_printed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  leadCategoryFilter === 'plaque_printed'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
                title="Filtrar placas que já foram impressas"
              >
                <span>🟢 Placas Já Impressas</span>
                <span className="text-[10px] font-mono font-black">({stats.plaquePrinted})</span>
              </button>

              <button
                type="button"
                onClick={() => setLeadCategoryFilter('in_crm')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  leadCategoryFilter === 'in_crm'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                <span>💼 No Funil CRM</span>
                <span className="text-[10px] font-mono">({stats.inCrm})</span>
              </button>

              <button
                type="button"
                onClick={() => setLeadCategoryFilter('high_converting')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  leadCategoryFilter === 'high_converting'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-violet-50 text-violet-800 hover:bg-violet-100'
                }`}
              >
                <span>🎯 Alta Conversão</span>
                <span className="text-[10px] font-mono">({stats.highConverting})</span>
              </button>

              {/* City selector if multiple cities */}
              {availableCities.length > 1 && (
                <div className="flex items-center gap-1 ml-auto text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Cidade:</span>
                  <select
                    value={selectedCityFilter}
                    onChange={(e) => setSelectedCityFilter(e.target.value)}
                    className="bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold px-2 py-1"
                  >
                    <option value="all">Todas as Cidades ({leads.length})</option>
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c} ({leads.filter((l) => (l.city || '').toLowerCase().includes(c.toLowerCase())).length})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Results count text */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
              <span>
                Exibindo <strong className="text-slate-900 font-bold">{sortedLeads.length}</strong> de{' '}
                <strong className="text-slate-900 font-bold">{leads.length}</strong> empresas cadastradas no sistema.
              </span>
              {(tableSearchTerm || selectedCityFilter !== 'all' || leadCategoryFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setTableSearchTerm('');
                    setSelectedCityFilter('all');
                    setLeadCategoryFilter('all');
                  }}
                  className="text-blue-600 hover:underline font-bold"
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>
          </div>

          {/* B: Lead Detail View OR Directory Grid */}
          {selectedLead ? (
            /* DETAILED VIEW OF SELECTED COMPANY WITH SUBTABS & QUICK SWITCHER */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Selected Lead Ribbon / Switcher */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedLead(null)}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Voltar para a lista com todas as empresas"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                      {selectedLead.niche || 'Geral'} em {selectedLead.city || 'Brasil'}
                    </span>
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedLead.rating} ({selectedLead.reviewCount} avaliações)
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{selectedLead.name}</h3>
                  <p className="text-xs text-red-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Fragilidade Comercial: {selectedLead.weakness || 'QR Code Dinâmico'}</span>
                  </p>
                </div>

                {/* Quick Company Switcher Dropdown & Nav Buttons */}
                <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevLead}
                    className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                    title="Empresa anterior"
                  >
                    ◀
                  </button>
                  <div className="text-left">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Alternar Empresa:</span>
                    <select
                      value={selectedLead.id}
                      onChange={(e) => {
                        const found = leads.find((l) => l.id === e.target.value);
                        if (found) handleSelectLead(found);
                      }}
                      className="bg-slate-900 border border-slate-700 text-white text-xs font-bold py-1 px-2.5 rounded-lg focus:outline-hidden focus:border-cyan-400 max-w-[200px] truncate"
                    >
                      {sortedLeads.map((l, i) => (
                        <option key={l.id} value={l.id}>
                          {i + 1}. {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleNextLead}
                    className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                    title="Próxima empresa"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Sub-tabs inside selected lead */}
              <div className="border-b border-slate-200 bg-slate-50 px-4 pt-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setLeadDetailTab('overview')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border-b-2 ${
                    leadDetailTab === 'overview'
                      ? 'bg-white text-blue-900 border-blue-600 shadow-2xs font-black'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Visão Geral &amp; Ações</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadDetailTab('nfc')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border-b-2 ${
                    leadDetailTab === 'nfc'
                      ? 'bg-white text-amber-900 border-amber-600 shadow-2xs font-black'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-600" />
                  <span>Placa NFC &amp; Link Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadDetailTab('site')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border-b-2 ${
                    leadDetailTab === 'site'
                      ? 'bg-white text-emerald-900 border-emerald-600 shadow-2xs font-black'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Site Modelo Demonstrativo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadDetailTab('pitch')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border-b-2 ${
                    leadDetailTab === 'pitch'
                      ? 'bg-white text-violet-900 border-violet-600 shadow-2xs font-black'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-violet-600" />
                  <span>Pitch Comercial &amp; WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditLeadAddress(selectedLead.address || '');
                    setEditLeadPhone(selectedLead.phone || '');
                    setEditLeadGoogleMapsUrl(selectedLead.googleMapsUrl || '');
                    setEditLeadPortalUsername(selectedLead.portalUsername || selectedLead.id);
                    setEditLeadNfcPassword(selectedLead.nfcPassword || '2026');
                    setLeadDetailTab('edit');
                  }}
                  className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border-b-2 ${
                    leadDetailTab === 'edit'
                      ? 'bg-white text-orange-900 border-orange-600 shadow-2xs font-black'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                  <span>Editar Cadastro</span>
                </button>
              </div>

              {/* Tab 1: Overview & Quick Actions */}
              {leadDetailTab === 'overview' && (
                <div className="p-6 space-y-6">
                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleWebShareLead(selectedLead)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Compartilhar Lead</span>
                    </button>
                    <button
                      onClick={() => setLeadDetailTab('edit')}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Editar Dados</span>
                    </button>
                    <button
                      onClick={() => setLeadDetailTab('nfc')}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                    >
                      <QrCode className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Ver Placa NFC</span>
                    </button>
                    <button
                      onClick={() => setLeadDetailTab('site')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Ver Site Modelo</span>
                    </button>
                  </div>

                  {/* Info Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Localização &amp; Endereço</span>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{selectedLead.address || 'Endereço não informado'}</span>
                      </p>
                      <p className="text-xs text-slate-600">Cidade: <strong>{selectedLead.city || 'Brasil'}</strong></p>
                      <p className="text-xs text-slate-600">Telefone: <strong>{selectedLead.phone || 'Não informado'}</strong></p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status Comercial &amp; Portal</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">Etapa no Funil:</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                          {selectedLead.stage ? selectedLead.stage.toUpperCase() : 'NÃO INICIADO'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Código ID: <strong className="font-mono text-blue-700">{selectedLead.id}</strong>
                      </p>
                      <p className="text-xs text-slate-600">
                        Link Permanente: <strong className="font-mono text-cyan-700">/r/{selectedLead.id}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: NFC Plate & Direct Google Review Link */}
              {leadDetailTab === 'nfc' && (
                <div className="p-6 space-y-5">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                    <h4 className="text-sm font-black text-amber-950 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-amber-700" />
                      <span>Destino da Placa NFC &amp; QR Code</span>
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Esta placa física já está associada ao código <strong className="font-mono">/r/{selectedLead.id}</strong>.
                      Ao encostar o celular ou escanear, o cliente é redirecionado instantaneamente.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={selectedLead.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(selectedLead.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Star className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Testar Link de Avaliação Google</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setPlateTheme('black_gold');
                          setGmbReviewLink(selectedLead.googleMapsUrl);
                          setActiveTab('nfc_designer');
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Abrir Designer da Placa 10x10cm</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Site Model */}
              {leadDetailTab === 'site' && (
                <div className="p-6 space-y-5">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                    <h4 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-700" />
                      <span>Site Institucional Demonstrativo</span>
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Crie um site modelo moderno de alta conversão para mostrar ao dono da empresa como o negócio dele pode parecer muito mais profissional na internet.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => requireMasterAccess('site_preview', () => generateWebsiteTemplate(selectedLead))}
                        className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Gerar Site Modelo com IA</span>
                      </button>
                      <button
                        onClick={() => {
                          requireMasterAccess('site_preview', async () => {
                            if (!siteTemplate) await generateWebsiteTemplate(selectedLead);
                            setIsExportSiteModalOpen(true);
                          });
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Exportar Site em ZIP</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Commercial Pitch */}
              {leadDetailTab === 'pitch' && (
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Abordagem WhatsApp</h4>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setSelectedPitchType('combo')}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                          selectedPitchType === 'combo' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Combo
                      </button>
                      <button
                        onClick={() => setSelectedPitchType('nfc')}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                          selectedPitchType === 'nfc' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        NFC
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium text-slate-700 leading-relaxed max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                    {isGeneratingPitch ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                        <span>Escrevendo pitch persuasivo com IA...</span>
                      </div>
                    ) : (
                      pitch?.whatsapp || 'Selecione ou clique em Gerar Pitch para criar o texto com IA.'
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (pitch?.whatsapp) {
                          navigator.clipboard.writeText(pitch.whatsapp);
                          alert('Mensagem copiada para a área de transferência!');
                        }
                      }}
                      className="flex-1 text-center py-2.5 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Copiar Texto
                    </button>
                    <a
                      href={getWhatsAppLink(selectedLead, pitch?.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 transition-all text-center shadow-xs"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Enviar pelo WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Tab 5: Edit Data */}
              {leadDetailTab === 'edit' && (
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Endereço</label>
                      <input
                        type="text"
                        value={editLeadAddress}
                        onChange={(e) => setEditLeadAddress(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telefone</label>
                      <input
                        type="text"
                        value={editLeadPhone}
                        onChange={(e) => setEditLeadPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Link Google Maps / Avaliações</label>
                      <input
                        type="text"
                        value={editLeadGoogleMapsUrl}
                        onChange={(e) => setEditLeadGoogleMapsUrl(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-blue-500"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={async () => {
                          await updateLeadDetails(selectedLead.id, {
                            address: editLeadAddress.trim(),
                            phone: editLeadPhone.trim(),
                            googleMapsUrl: editLeadGoogleMapsUrl.trim(),
                            portalUsername: editLeadPortalUsername.trim(),
                            nfcPassword: editLeadNfcPassword.trim()
                          });
                          alert('Cadastro atualizado com sucesso!');
                          setLeadDetailTab('overview');
                        }}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase rounded-xl transition cursor-pointer"
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* DIRECTORY GRID: LIST OF ALL REGISTERED COMPANIES */
            <div className="space-y-4">
              {sortedLeads.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                  <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-base font-bold text-slate-800">Nenhuma empresa encontrada</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Não encontramos nenhuma empresa com os filtros atuais. Limpe a busca ou clique em Nova Prospecção para escanear novos comércios.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTableSearchTerm('');
                      setSelectedCityFilter('all');
                      setLeadCategoryFilter('all');
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition"
                  >
                    Ver Todas as {leads.length} Empresas
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedLeads.map((lead) => {
                    const hasNfc = Boolean(lead.googleMapsUrl || lead.nfcCustomUrl || lead.nfcInstagramUrl);
                    const isLowRating = typeof lead.rating === 'number' && lead.rating < 4.0;
                    return (
                      <div
                        key={lead.id}
                        onClick={() => handleSelectLead(lead)}
                        className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-2xl p-4 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              {lead.niche || 'Geral'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {/* Plaque print status tag */}
                              {lead.isPlaquePrinted ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateLeadDetails(lead.id, { isPlaquePrinted: false });
                                  }}
                                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition cursor-pointer"
                                  title="Placa impressa. Clique para desmarcar"
                                >
                                  🖨️ Impressa
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateLeadDetails(lead.id, { isPlaquePrinted: true, plaquePrintedAt: new Date().toISOString() });
                                  }}
                                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition cursor-pointer"
                                  title="Placa pendente. Clique para marcar como impressa"
                                >
                                  🟡 Pendente
                                </button>
                              )}

                              {hasNfc ? (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  ✓ NFC
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition leading-snug">
                            {lead.name}
                          </h4>

                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.city || 'Brasil'}</span>
                          </p>

                          <div className="flex items-center gap-2 pt-0.5">
                            <div className="flex items-center text-amber-500 text-xs font-bold gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span className={isLowRating ? 'text-red-600 font-black' : 'text-slate-700'}>
                                {lead.rating || 5.0}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              ({lead.reviewCount || 0} avaliações)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="font-mono text-[10px] text-slate-400">/r/{lead.id}</span>
                          <span className="font-bold text-blue-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
                            <span>Gerenciar</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3: SUBTAB SEARCH (NOVA PROSPECÇÃO GOOGLE MAPS) */}
      {leadsSubTab === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-600" />
                <span>Scanner de Crescimento Comercial</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Varredura ao vivo de estabelecimentos no Google Maps com Inteligência Artificial para identificar empresas com notas baixas, sem site e sem placa NFC.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Cidade ou Região</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: São Paulo, Campinas, Curitiba"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Segmento / Nicho</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_NICHES.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setNiche(n.id);
                        setCustomNiche('');
                      }}
                      className={`py-2 px-2.5 text-left text-xs rounded-lg border transition-all cursor-pointer truncate font-bold ${
                        niche === n.id && !customNiche
                          ? 'bg-slate-950 border-slate-950 text-white'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Outro Nicho (Opcional)</label>
                <input
                  type="text"
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  placeholder="Ex: Pizzaria, Pet Shop, Barbearia"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs font-semibold focus:bg-white focus:outline-hidden"
                />
              </div>

              <button
                onClick={searchLocalBusinesses}
                disabled={isSearching}
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-black py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Escanendo Google Maps (Etapa {searchStep}/5)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Iniciar Varredura no Google</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Progresso da Busca no Google Maps</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Acompanhamento de varredura e triagem de estabelecimentos locais
                </p>
              </div>
              {isSearching && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 animate-pulse">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Processando
                </span>
              )}
            </div>

            <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-xl text-xs text-slate-700 h-64 overflow-y-auto space-y-2">
              {searchLogs.length > 0 ? (
                searchLogs.map((l: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 py-1 border-b border-slate-100/80 last:border-0">
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">{l.timestamp}</span>
                    <span className="text-xs text-slate-700 font-medium leading-relaxed">{l.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 italic py-16 text-center text-xs">
                  Aguardando início de busca. Selecione a cidade e nicho ao lado e clique em &ldquo;Iniciar Varredura no Google&rdquo;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4: SUBTAB PRICING (TABELA DE PREÇOS COMERCIAL) */}
      {leadsSubTab === 'pricing' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900">Tabela de Preços Oficiais ALF Automações</h3>
            <p className="text-xs text-slate-500 mt-1">Ajuste os valores sugeridos para a venda de Placas NFC e Sites.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Placa NFC (Acrílico 10x10)</span>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs text-slate-400">R$</span>
                <input
                  type="number"
                  value={nfcPrice}
                  onChange={(e) => setNfcPrice(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-7 pr-2 font-bold text-slate-900 text-sm"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Criação de Site Institucional</span>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs text-slate-400">R$</span>
                <input
                  type="number"
                  value={sitePrice}
                  onChange={(e) => setSitePrice(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-7 pr-2 font-bold text-slate-900 text-sm"
                />
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">Combo Promocional</span>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs text-emerald-600">R$</span>
                <input
                  type="number"
                  value={comboPrice}
                  onChange={(e) => setComboPrice(Number(e.target.value))}
                  className="w-full bg-white border border-emerald-300 rounded-xl py-2 pl-7 pr-2 font-black text-emerald-950 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
