import React, { useState, useEffect, useMemo } from 'react';
import {
  QrCode,
  Download,
  Printer,
  FileSpreadsheet,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Globe,
  Instagram,
  Phone,
  Eye,
  Sliders,
  X,
  Database,
  Upload,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Zap,
  MapPin,
  HelpCircle,
  Server,
  ArrowRight,
  BookOpen,
  Layers,
  Terminal,
  AlertTriangle,
  Camera,
  ScanLine,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Lead } from '../App';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { NfcArtworkDownloadModal } from './NfcArtworkDownloadModal';
import { NfcWriterModal } from './NfcWriterModal';
import {
  generateQrDataUrl,
  downloadBatchQrZip,
  openBatchPrintWindow,
  downloadDataUrl,
  DynamicQrItem
} from '../utils/qrCodeGenerator';
import {
  getPublicAppOrigin,
  getDynamicQrUrl,
  setCustomPublicDomain,
  getCustomPublicDomain,
  getDirectLeadUrl,
  hasCustomPublicDomain,
  getTestRedirectUrl
} from '../utils/publicUrlHelper';
import { getPlateIdentification } from '../utils/plateNumberHelper';

interface DynamicQrBatchManagerProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
  onNavigateToPortal?: (leadId: string) => void;
}

export function DynamicQrBatchManager({ leads, onSelectLead, onNavigateToPortal }: DynamicQrBatchManagerProps) {
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active'>('all');

  // Batch Generator Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchPrefix, setBatchPrefix] = useState('Empresa');
  const [batchIdPrefix, setBatchIdPrefix] = useState('empresa');
  const [batchQuantity, setBatchQuantity] = useState(40);
  const [batchStartNum, setBatchStartNum] = useState(1);
  const [batchInitialType, setBatchInitialType] = useState<'open' | 'custom' | 'gmb' | 'whatsapp' | 'instagram' | 'website'>('open');
  const [batchDefaultUrl, setBatchDefaultUrl] = useState('');
  const [batchPin, setBatchPin] = useState('1234');
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Single QR Create Modal State
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [singleId, setSingleId] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singleUrl, setSingleUrl] = useState('');
  const [singleType, setSingleType] = useState<'custom' | 'gmb' | 'whatsapp' | 'instagram' | 'website'>('custom');

  // Quick On-The-Spot Activation Modal State (Venda em Campo)
  const [isQuickActivateOpen, setIsQuickActivateOpen] = useState(false);
  const [quickPlateId, setQuickPlateId] = useState('');
  const [quickBusinessName, setQuickBusinessName] = useState('');
  const [quickTargetUrl, setQuickTargetUrl] = useState('');
  const [quickRedirectType, setQuickRedirectType] = useState<'gmb' | 'whatsapp' | 'instagram' | 'website' | 'custom'>('gmb');
  const [quickPin, setQuickPin] = useState('2026');
  const [quickCity, setQuickCity] = useState('');
  const [quickNiche, setQuickNiche] = useState('');
  const [isActivatingQuick, setIsActivatingQuick] = useState(false);
  const [quickActivatedLead, setQuickActivatedLead] = useState<Lead | null>(null);

  // Preview & QR detail modal
  const [viewingQr, setViewingQr] = useState<Lead | null>(null);
  const [viewingQrDataUrl, setViewingQrDataUrl] = useState<string>('');
  const [isQrModalMinimized, setIsQrModalMinimized] = useState<boolean>(false);

  // Inline URL editing states: map leadId -> current input value
  const [editingUrls, setEditingUrls] = useState<Record<string, string>>({});
  const [editingTypes, setEditingTypes] = useState<Record<string, 'custom' | 'gmb' | 'whatsapp' | 'instagram' | 'website'>>({});
  const [editingNames, setEditingNames] = useState<Record<string, string>>({});
  const [isEditingNameId, setIsEditingNameId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Batch Export states
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number } | null>(null);

  // Backup & Restore states
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Artwork Modal states (10x10 & 5.4x8.5)
  const [artworkLead, setArtworkLead] = useState<Lead | null>(null);
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false);

  // Custom Public Domain Modal
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState(() => getCustomPublicDomain());
  const [domainModalTab, setDomainModalTab] = useState<'settings' | 'deploy_tutorial' | 'dns_guide'>('settings');

  // Educational Modal State (Direct vs Dynamic QR explanation)
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);

  // Identify Plate Modal (Scan camera, upload photo, or paste URL/ID)
  const [isIdentifyModalOpen, setIsIdentifyModalOpen] = useState(false);
  const [identifyQuery, setIdentifyQuery] = useState('');
  const [identifyResult, setIdentifyResult] = useState<Lead | null>(null);
  const [identifySearched, setIdentifySearched] = useState(false);
  const identifyFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Quick Bind in Identify Modal State
  const [bindBusinessName, setBindBusinessName] = useState('');
  const [bindTargetUrl, setBindTargetUrl] = useState('');
  const [isBindingLead, setIsBindingLead] = useState(false);
  const [bindSuccessMessage, setBindSuccessMessage] = useState<string | null>(null);
  const [isSearchingPlaceId, setIsSearchingPlaceId] = useState(false);

  // NFC Writer Modal state
  const [nfcWriterLead, setNfcWriterLead] = useState<Lead | null>(null);
  const [isNfcWriterOpen, setIsNfcWriterOpen] = useState(false);

  // Export / Print Mode: 'dynamic' (/r/:id na nuvem) vs 'direct' (Oficial Google Reviews direto)
  const [qrExportMode, setQrExportMode] = useState<'direct' | 'dynamic'>('dynamic');
  // Modal inspection tab
  const [modalQrTab, setModalQrTab] = useState<'direct' | 'dynamic'>('dynamic');
  const [viewingDirectQrDataUrl, setViewingDirectQrDataUrl] = useState('');
  const [viewingDynamicQrDataUrl, setViewingDynamicQrDataUrl] = useState('');

  // Derive QR Codes list from all leads
  // A dynamic QR code is any lead registered in the system
  const dynamicQrs = useMemo(() => {
    return leads.map((l) => {
      const permanentUrl = getDynamicQrUrl(l.id);
      const directUrl = getDirectLeadUrl(l);
      let targetUrl = '';
      const redirectType = l.nfcRedirectActive || 'custom';

      if (redirectType === 'custom') {
        targetUrl = l.nfcCustomUrl || '';
      } else if (redirectType === 'instagram') {
        targetUrl = l.nfcInstagramUrl || '';
      } else if (redirectType === 'whatsapp') {
        targetUrl = l.nfcWhatsappNum ? `https://wa.me/${l.nfcWhatsappNum.replace(/\D/g, '')}` : '';
      } else if (redirectType === 'website') {
        targetUrl = l.websiteUrl || '';
      } else if (redirectType === 'gmb') {
        targetUrl = l.googleMapsUrl || '';
      }

      const hasTarget = Boolean(targetUrl && targetUrl !== 'https://maps.google.com');
      const status: 'active' | 'pending' | 'suspended' =
        l.nfcBillingStatus === 'suspended' ? 'suspended' : hasTarget ? 'active' : 'pending';

      const activeQrUrl = (qrExportMode === 'direct' && hasTarget) ? directUrl : permanentUrl;

      return {
        lead: l,
        id: l.id,
        name: l.name || `QR ${l.id}`,
        permanentUrl,
        directUrl,
        activeQrUrl,
        hasTarget,
        targetUrl,
        redirectType,
        status,
      };
    });
  }, [leads, qrExportMode]);

  // Filtered dynamic QRs
  const filteredQrs = useMemo(() => {
    return dynamicQrs.filter((item) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const plateInfo = getPlateIdentification(item.name, item.id);
        const matchName = item.name.toLowerCase().includes(query);
        const matchId = item.id.toLowerCase().includes(query);
        const matchUrl = item.targetUrl.toLowerCase().includes(query);
        const matchRoman = plateInfo.roman && plateInfo.roman.toLowerCase() === query;
        const matchNum = plateInfo.numStr && plateInfo.numStr === query.replace(/^0+/, '');
        const matchTag = plateInfo.displayTag && plateInfo.displayTag.toLowerCase().includes(query);
        if (!matchName && !matchId && !matchUrl && !matchRoman && !matchNum && !matchTag) return false;
      }

      // Status filter
      if (statusFilter === 'pending' && item.status !== 'pending') return false;
      if (statusFilter === 'active' && item.status !== 'active') return false;

      return true;
    });
  }, [dynamicQrs, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = dynamicQrs.length;
    const active = dynamicQrs.filter((q) => q.status === 'active').length;
    const pending = dynamicQrs.filter((q) => q.status === 'pending').length;
    return { total, active, pending };
  }, [dynamicQrs]);

  // Sync editing fields with lead data
  useEffect(() => {
    const initialUrls: Record<string, string> = {};
    const initialTypes: Record<string, any> = {};
    const initialNames: Record<string, string> = {};

    dynamicQrs.forEach((item) => {
      initialUrls[item.id] = item.targetUrl;
      initialTypes[item.id] = item.redirectType;
      initialNames[item.id] = item.name;
    });

    setEditingUrls((prev) => ({ ...initialUrls, ...prev }));
    setEditingTypes((prev) => ({ ...initialTypes, ...prev }));
    setEditingNames((prev) => ({ ...initialNames, ...prev }));
  }, [dynamicQrs]);

  // Generate QR preview when viewingQr changes
  useEffect(() => {
    if (viewingQr) {
      const directUrl = getDirectLeadUrl(viewingQr);
      const permanentUrl = getDynamicQrUrl(viewingQr.id);
      generateQrDataUrl(directUrl, { width: 500, margin: 2 }).then(setViewingDirectQrDataUrl);
      generateQrDataUrl(permanentUrl, { width: 500, margin: 2 }).then(setViewingDynamicQrDataUrl);
      generateQrDataUrl(permanentUrl, { width: 500, margin: 2 }).then(setViewingQrDataUrl);
    } else {
      setViewingDirectQrDataUrl('');
      setViewingDynamicQrDataUrl('');
      setViewingQrDataUrl('');
    }
  }, [viewingQr]);

  // Handle ESC key to easily close viewingQr modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewingQr) {
        setViewingQr(null);
        setIsQrModalMinimized(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingQr]);

  // Copy link handler
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Save specific QR Code URL
  const handleSaveUrl = async (id: string) => {
    const targetLead = leads.find((l) => l.id === id);
    if (!targetLead) return;

    setSavingId(id);
    const newUrl = (editingUrls[id] || '').trim();
    const newType = editingTypes[id] || 'custom';
    const newName = (editingNames[id] || targetLead.name).trim();

    const updates: Partial<Lead> = {
      name: newName,
      nfcRedirectActive: newType,
    };

    if (newType === 'custom') {
      updates.nfcCustomUrl = newUrl;
    } else if (newType === 'instagram') {
      updates.nfcInstagramUrl = newUrl;
    } else if (newType === 'whatsapp') {
      updates.nfcWhatsappNum = newUrl;
    } else if (newType === 'website') {
      updates.websiteUrl = newUrl;
    } else if (newType === 'gmb') {
      updates.googleMapsUrl = newUrl;
    }

    try {
      const merged = { ...targetLead, ...updates };
      // Ensure required rules
      if (!merged.stage) merged.stage = 'won';
      if (!merged.city) merged.city = 'Brasil';
      if (!merged.niche) merged.niche = 'Geral';

      await setDoc(doc(db, 'leads', id), merged);
      setSavedSuccessId(id);
      setIsEditingNameId(null);
      setTimeout(() => setSavedSuccessId(null), 2500);
    } catch (err) {
      console.error('Erro ao salvar URL:', err);
      handleFirestoreError(err, OperationType.WRITE, `leads/${id}`);
    } finally {
      setSavingId(null);
    }
  };

  // Batch Generation Execution
  const handleExecuteBatch = async () => {
    if (batchQuantity < 1) {
      alert('Informe uma quantidade válida (mínimo 1).');
      return;
    }

    setIsGeneratingBatch(true);
    const total = batchQuantity;
    setBatchProgress({ current: 0, total });

    try {
      for (let i = 0; i < total; i++) {
        const num = batchStartNum + i;
        const numFormatted = String(num).padStart(2, '0');
        const cleanPrefix = batchIdPrefix
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');

        const id = `${cleanPrefix || 'empresa'}_${numFormatted}`;
        const name = `${batchPrefix} ${numFormatted}`;

        // Create initial lead payload conforming strictly to firestore.rules
        const newLead: Lead = {
          id,
          name,
          niche: 'Geral',
          city: 'Brasil',
          stage: 'won',
          address: `Lote de QR Codes #${numFormatted}`,
          phone: '',
          rating: 5.0,
          reviewCount: 0,
          hasWebsite: false,
          websiteUrl: batchInitialType === 'website' ? batchDefaultUrl : '',
          googleMapsUrl: batchInitialType === 'gmb' ? batchDefaultUrl : '',
          weakness: 'QR Code dinâmico reservado em lote para ativação de cliente',
          nfcPassword: batchPin || '1234',
          nfcBillingStatus: 'active',
          nfcRedirectActive: batchInitialType === 'open' ? 'custom' : batchInitialType,
          nfcCustomUrl: batchInitialType === 'custom' ? batchDefaultUrl : '',
          nfcInstagramUrl: batchInitialType === 'instagram' ? batchDefaultUrl : '',
          nfcWhatsappNum: batchInitialType === 'whatsapp' ? batchDefaultUrl : '',
          nfcWhatsappMsg: 'Olá! Gostaria de informações.',
          nfcModulesAllowed: {
            gmb: true,
            whatsapp: true,
            instagram: true,
            website: true,
            custom: true,
          },
        };

        await setDoc(doc(db, 'leads', id), newLead);
        setBatchProgress({ current: i + 1, total });
      }

      setIsBatchModalOpen(false);
      alert(`Sucesso! ${total} QR Codes dinâmicos foram gerados de "${batchPrefix} ${String(batchStartNum).padStart(2, '0')}" até "${batchPrefix} ${String(batchStartNum + total - 1).padStart(2, '0')}". Agora você pode cadastrar as URLs de cada um.`);
    } catch (err) {
      console.error('Erro na criação em lote:', err);
      alert('Houve uma falha ao gerar alguns QR Codes. Verifique sua conexão.');
    } finally {
      setIsGeneratingBatch(false);
      setBatchProgress(null);
    }
  };

  // Single QR Code Creation
  const handleCreateSingle = async () => {
    if (!singleId.trim() || !singleName.trim()) {
      alert('Preencha o Código ID e o Nome.');
      return;
    }

    const cleanId = singleId.toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
    if (leads.some((l) => l.id === cleanId)) {
      alert('Já existe um QR Code ou empresa com este ID.');
      return;
    }

    const newLead: Lead = {
      id: cleanId,
      name: singleName.trim(),
      niche: 'Geral',
      city: 'Brasil',
      stage: 'won',
      address: 'Cadastro de QR Code Dinâmico',
      phone: '',
      rating: 5.0,
      reviewCount: 0,
      hasWebsite: false,
      websiteUrl: singleType === 'website' ? singleUrl : '',
      googleMapsUrl: singleType === 'gmb' ? singleUrl : '',
      weakness: 'QR Code Dinâmico',
      nfcPassword: '1234',
      nfcBillingStatus: 'active',
      nfcRedirectActive: singleType,
      nfcCustomUrl: singleType === 'custom' ? singleUrl : '',
      nfcInstagramUrl: singleType === 'instagram' ? singleUrl : '',
      nfcWhatsappNum: singleType === 'whatsapp' ? singleUrl : '',
      nfcWhatsappMsg: 'Olá! Gostaria de falar com você.',
      nfcModulesAllowed: {
        gmb: true,
        whatsapp: true,
        instagram: true,
        website: true,
        custom: true,
      },
    };

    try {
      await setDoc(doc(db, 'leads', cleanId), newLead);
      setIsSingleModalOpen(false);
      setSingleId('');
      setSingleName('');
      setSingleUrl('');
    } catch (err) {
      console.error('Erro ao criar QR Code:', err);
      alert('Erro ao salvar no banco de dados.');
    }
  };

  // Quick On-The-Spot Activation Execution (Venda Presencial Rápida)
  const handleExecuteQuickActivate = async () => {
    const cleanId = quickPlateId.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
    if (!cleanId) {
      alert('Selecione ou informe o código da placa que está na sua mão.');
      return;
    }
    if (!quickBusinessName.trim()) {
      alert('Informe o nome do estabelecimento.');
      return;
    }
    if (!quickTargetUrl.trim()) {
      alert('Informe o link de destino (link do Google Meu Negócio / Maps, WhatsApp, etc).');
      return;
    }

    setIsActivatingQuick(true);
    try {
      const existing = leads.find((l) => l.id.toLowerCase() === cleanId.toLowerCase());
      const updatedLead: Lead = {
        id: cleanId,
        name: quickBusinessName.trim(),
        niche: quickNiche.trim() || existing?.niche || 'Comércio Local',
        city: quickCity.trim() || existing?.city || 'Brasil',
        stage: 'won',
        address: existing?.address || 'Placa Ativada em Campo',
        phone: existing?.phone || '',
        rating: existing?.rating || 5.0,
        reviewCount: existing?.reviewCount || 0,
        hasWebsite: Boolean(existing?.hasWebsite),
        websiteUrl: quickRedirectType === 'website' ? quickTargetUrl.trim() : (existing?.websiteUrl || null),
        googleMapsUrl: quickRedirectType === 'gmb' ? quickTargetUrl.trim() : (existing?.googleMapsUrl || ''),
        weakness: 'Placa ativada presencialmente em campo',
        nfcPassword: quickPin.trim() || existing?.nfcPassword || '2026',
        nfcBillingStatus: 'active',
        nfcRedirectActive: quickRedirectType,
        nfcCustomUrl: quickRedirectType === 'custom' ? quickTargetUrl.trim() : (existing?.nfcCustomUrl || ''),
        nfcInstagramUrl: quickRedirectType === 'instagram' ? quickTargetUrl.trim() : (existing?.nfcInstagramUrl || ''),
        nfcWhatsappNum: quickRedirectType === 'whatsapp' ? quickTargetUrl.trim() : (existing?.nfcWhatsappNum || ''),
        nfcWhatsappMsg: existing?.nfcWhatsappMsg || 'Olá! Gostaria de falar com você.',
        portalUsername: cleanId,
        nfcModulesAllowed: existing?.nfcModulesAllowed || {
          gmb: true,
          whatsapp: true,
          instagram: true,
          website: true,
          custom: true,
        },
      };

      await setDoc(doc(db, 'leads', cleanId), updatedLead);
      setQuickActivatedLead(updatedLead);
    } catch (err) {
      console.error('Erro na ativação rápida:', err);
      alert('Houve um erro ao salvar a ativação no banco de dados. Verifique a conexão.');
    } finally {
      setIsActivatingQuick(false);
    }
  };

  // Delete QR Code
  const handleDeleteQr = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o QR Code "${name}" (${id})? Esta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (err) {
      console.error('Erro ao deletar:', err);
      alert('Erro ao excluir QR Code.');
    }
  };

  // Identify Plate logic: takes any string (URL, ID, or raw QR payload) and finds the corresponding lead
  const findLeadFromRawCode = (raw: string): Lead | null => {
    if (!raw || !raw.trim()) return null;
    const clean = raw.trim();

    // 1. Check exact ID match
    let match = leads.find((l) => l.id.toLowerCase() === clean.toLowerCase());
    if (match) return match;

    // 2. If it's a URL (e.g. .../r/empresa08, .../r/assadosdojapa)
    const rMatch = clean.match(/\/(r|qr|p|nfc|tag|l|m)\/([a-zA-Z0-9_\-]+)/i);
    if (rMatch && rMatch[2]) {
      const extractedId = rMatch[2].toLowerCase();
      match = leads.find((l) => l.id.toLowerCase() === extractedId || l.id.toLowerCase().replace(/_/g, '') === extractedId.replace(/_/g, ''));
      if (match) return match;
    }

    // 3. Match numbers (e.g. "08", "8" -> empresa08, empre08)
    const numMatch = clean.match(/\d+/);
    if (numMatch) {
      const num = parseInt(numMatch[0], 10);
      match = leads.find((l) => {
        const leadNumMatch = l.id.match(/\d+/);
        return leadNumMatch && parseInt(leadNumMatch[0], 10) === num;
      });
      if (match) return match;
    }

    // 4. Match by Place ID
    const placeIdMatch = clean.match(/ChIJ[a-zA-Z0-9_\-]{23,}/);
    if (placeIdMatch) {
      match = leads.find((l) => (l.googleMapsUrl || '').includes(placeIdMatch[0]) || (l.nfcCustomUrl || '').includes(placeIdMatch[0]));
      if (match) return match;
    }

    // 5. Match by business name contains
    match = leads.find((l) => l.name.toLowerCase().includes(clean.toLowerCase()) || clean.toLowerCase().includes(l.name.toLowerCase()));
    return match || null;
  };

  const handleIdentifySearch = (overrideQuery?: string) => {
    setIdentifySearched(true);
    setBindSuccessMessage(null);
    const q = overrideQuery !== undefined ? overrideQuery : identifyQuery;
    const found = findLeadFromRawCode(q);
    setIdentifyResult(found);
    if (found) {
      const isGeneric = found.name.toLowerCase().startsWith('empresa') || 
                        found.name.toUpperCase().includes('SOBRE SUA EXPERIÊNCIA') || 
                        found.name === '.';
      setBindBusinessName(isGeneric ? '' : found.name);
      setBindTargetUrl(found.googleMapsUrl || found.nfcCustomUrl || '');
    }
  };

  const handleQuickBindInIdentifyModal = async () => {
    if (!identifyResult) return;
    if (!bindBusinessName.trim()) {
      alert('Por favor, informe o nome do estabelecimento que comprou esta placa.');
      return;
    }
    if (!bindTargetUrl.trim()) {
      alert('Por favor, informe o link de avaliação do Google da empresa.');
      return;
    }

    setIsBindingLead(true);
    setBindSuccessMessage(null);

    try {
      const finalTargetUrl = bindTargetUrl.trim();
      const ref = doc(db, 'leads', identifyResult.id);
      
      const updatedData: Partial<Lead> = {
        name: bindBusinessName.trim(),
        googleMapsUrl: finalTargetUrl,
        nfcCustomUrl: finalTargetUrl,
        nfcRedirectActive: 'gmb',
        nfcBillingStatus: 'active'
      };

      await updateDoc(ref, updatedData);

      setIdentifyResult({
        ...identifyResult,
        ...updatedData
      } as Lead);

      setBindSuccessMessage(`✅ Placa física (${identifyResult.id}) vinculada com sucesso para "${bindBusinessName.trim()}"!`);
    } catch (err: any) {
      console.error('Erro ao vincular empresa na placa:', err);
      alert('Erro ao salvar no banco de dados. Tente novamente.');
    } finally {
      setIsBindingLead(false);
    }
  };

  const handleSearchPlaceIdForBind = async () => {
    if (!bindBusinessName.trim()) {
      alert('Digite o nome do estabelecimento primeiro.');
      return;
    }
    setIsSearchingPlaceId(true);
    try {
      const res = await fetch('/api/search-place-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: bindBusinessName.trim(),
          city: identifyResult?.city || 'Brasil'
        })
      });
      const data = await res.json();
      if (data.reviewUrl) {
        setBindTargetUrl(data.reviewUrl);
      } else if (data.placeId) {
        setBindTargetUrl(`https://search.google.com/local/writereview?placeid=${data.placeId}`);
      }
    } catch (err) {
      console.warn('Erro ao buscar Place ID:', err);
    } finally {
      setIsSearchingPlaceId(false);
    }
  };

  const handleIdentifyImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if ('BarcodeDetector' in window) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => { img.onload = resolve; });
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(img);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          const raw = barcodes[0].rawValue;
          setIdentifyQuery(raw);
          setIdentifySearched(true);
          setIdentifyResult(findLeadFromRawCode(raw));
          return;
        }
      }
    } catch (_) {}

    const found = findLeadFromRawCode(file.name);
    setIdentifySearched(true);
    setIdentifyResult(found);
  };

  // Download Batch ZIP
  const handleDownloadAllZip = async () => {
    if (dynamicQrs.length === 0) {
      alert('Nenhum QR Code cadastrado para exportar.');
      return;
    }

    setIsExportingZip(true);
    setZipProgress({ current: 0, total: dynamicQrs.length });

    try {
      const items: DynamicQrItem[] = dynamicQrs.map((q) => ({
        id: q.id,
        name: q.name,
        permanentUrl: q.activeQrUrl,
        targetUrl: q.targetUrl,
        status: q.status,
      }));

      const zipPrefix = qrExportMode === 'direct' ? 'qrcodes_diretos_oficiais' : 'qrcodes_dinamicos_nuvem';
      await downloadBatchQrZip(items, `${zipPrefix}_${items.length}_unidades.zip`, (cur, tot) => {
        setZipProgress({ current: cur, total: tot });
      });
    } catch (err) {
      console.error('Falha ao gerar ZIP:', err);
      alert('Erro ao gerar pacote ZIP.');
    } finally {
      setIsExportingZip(false);
      setZipProgress(null);
    }
  };

  // Batch Print
  const handleBatchPrint = async () => {
    if (dynamicQrs.length === 0) {
      alert('Nenhum QR Code disponível para imprimir.');
      return;
    }

    const items: DynamicQrItem[] = dynamicQrs.map((q) => ({
      id: q.id,
      name: q.name,
      permanentUrl: q.activeQrUrl,
      targetUrl: q.targetUrl,
      status: q.status,
    }));

    const title = qrExportMode === 'direct' 
      ? 'Cartela de QR Codes Oficiais (Links Diretos Sem Erro 403)' 
      : 'Cartela de QR Codes Dinâmicos Nuvem (/r/...)';

    await openBatchPrintWindow(items, title);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (dynamicQrs.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }

    let csv = 'ID,Nome,Modo QR Exportado,Link Gravado no QR,Link Permanente Nuvem,URL de Destino Atual,Tipo,Status\n';
    dynamicQrs.forEach((q) => {
      const safeTarget = (q.targetUrl || 'Aguardando configuração').replace(/"/g, '""');
      const safeName = q.name.replace(/"/g, '""');
      const safeActive = q.activeQrUrl.replace(/"/g, '""');
      csv += `"${q.id}","${safeName}","${qrExportMode}","${safeActive}","${q.permanentUrl}","${safeTarget}","${q.redirectType}","${q.status}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planilha_qrcodes_${qrExportMode}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Full Database JSON Backup Handler
  const handleBackupDatabase = () => {
    if (leads.length === 0) {
      alert('Nenhuma empresa ou QR Code cadastrado para fazer backup.');
      return;
    }

    const backupPayload = {
      system: 'ALF Automação - Sistema de QR Codes & Tags NFC',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      totalRecords: leads.length,
      leads: leads
    };

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_alf_automacao_empresas_tags_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Full Database JSON Restore Handler
  const handleRestoreDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const itemsToRestore: Lead[] = Array.isArray(data) ? data : Array.isArray(data.leads) ? data.leads : [];

      if (itemsToRestore.length === 0) {
        alert('O arquivo selecionado não contém um formato de backup válido.');
        return;
      }

      if (!confirm(`Deseja restaurar ${itemsToRestore.length} empresas e tags do backup? Isso atualizará ou criará os registros no banco de dados.`)) {
        return;
      }

      setIsRestoring(true);
      setRestoreProgress({ current: 0, total: itemsToRestore.length });

      let successCount = 0;
      for (let i = 0; i < itemsToRestore.length; i++) {
        const item = itemsToRestore[i];
        if (item && item.id) {
          const cleanItem: Lead = {
            id: String(item.id),
            name: String(item.name || `Empresa ${item.id}`),
            niche: String(item.niche || 'Geral'),
            city: String(item.city || 'Brasil'),
            stage: item.stage || 'won',
            address: item.address || '',
            phone: item.phone || '',
            rating: typeof item.rating === 'number' ? item.rating : 5.0,
            reviewCount: typeof item.reviewCount === 'number' ? item.reviewCount : 0,
            hasWebsite: Boolean(item.hasWebsite),
            websiteUrl: item.websiteUrl || null,
            googleMapsUrl: item.googleMapsUrl || '',
            weakness: item.weakness || 'Restaurado do backup',
            nfcPassword: item.nfcPassword || '1234',
            nfcBillingStatus: item.nfcBillingStatus || 'active',
            nfcRedirectActive: item.nfcRedirectActive || 'custom',
            nfcCustomUrl: item.nfcCustomUrl || '',
            nfcInstagramUrl: item.nfcInstagramUrl || '',
            nfcWhatsappNum: item.nfcWhatsappNum || '',
            nfcWhatsappMsg: item.nfcWhatsappMsg || 'Olá!',
            nfcModulesAllowed: item.nfcModulesAllowed || {
              gmb: true,
              whatsapp: true,
              instagram: true,
              website: true,
              custom: true
            }
          };

          await setDoc(doc(db, 'leads', cleanItem.id), cleanItem);
          successCount++;
        }
        setRestoreProgress({ current: i + 1, total: itemsToRestore.length });
      }

      alert(`Backup restaurado com sucesso! ${successCount} registros salvos no banco de dados.`);
    } catch (err: any) {
      console.error('Erro na restauração:', err);
      alert('Falha ao processar arquivo de backup: ' + (err.message || 'Arquivo inválido.'));
    } finally {
      setIsRestoring(false);
      setRestoreProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Download Single QR Code image (Direct Official Google Reviews or Dynamic Nuvem)
  const handleDownloadSingleQr = async (lead: Lead, forceMode?: 'direct' | 'dynamic') => {
    const mode = forceMode || qrExportMode;
    const directUrl = getDirectLeadUrl(lead);
    const permanentUrl = getDynamicQrUrl(lead.id);
    const hasTarget = Boolean(
      (lead.googleMapsUrl && lead.googleMapsUrl !== 'https://maps.google.com') ||
      lead.nfcCustomUrl ||
      lead.nfcInstagramUrl ||
      lead.nfcWhatsappNum ||
      lead.websiteUrl
    );
    const targetUrl = (mode === 'direct' && hasTarget) ? directUrl : permanentUrl;
    const dataUrl = await generateQrDataUrl(targetUrl, { width: 1000, margin: 2 });
    const safeName = lead.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_');
    const suffix = (mode === 'direct' && hasTarget) ? 'direto_oficial' : 'dinamico';
    downloadDataUrl(dataUrl, `qrcode_${suffix}_${safeName}_${lead.id}_hd.png`);
  };

  return (
    <div className="space-y-6">
      {/* Executive Clean Header */}
      <div className="bg-slate-900 border border-slate-800 text-white p-4 sm:p-7 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Totens Acrílicos 10x10cm &amp; QR Codes Contactless</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="text-emerald-400 font-bold">Google 5 Estrelas Direto</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Central de Placas &amp; QR Codes Inteligentes
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Imprima suas placas com antecedência: o QR code impresso <strong className="text-white">nunca muda</strong>. Ao realizar uma venda presencial, leia a placa ou selecione o código abaixo para vincular o novo cliente na hora!
            </p>
          </div>

          {/* Clean Action Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={() => {
                const pendingPlate = dynamicQrs.find((q) => q.status === 'pending');
                if (pendingPlate) {
                  setQuickPlateId(pendingPlate.id);
                } else if (dynamicQrs.length > 0) {
                  setQuickPlateId(dynamicQrs[0].id);
                }
                setQuickBusinessName('');
                setQuickTargetUrl('');
                setQuickRedirectType('gmb');
                setQuickPin('2026');
                setQuickCity('');
                setQuickNiche('');
                setQuickActivatedLead(null);
                setIsQuickActivateOpen(true);
              }}
              className="w-full lg:w-auto bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 cursor-pointer text-center"
              id="btn-quick-activate-field"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950 shrink-0" />
              <span>⚡ Ativar Placa na Hora</span>
            </button>

            <button
              onClick={() => {
                setIdentifyQuery('');
                setIdentifyResult(null);
                setIdentifySearched(false);
                setBindSuccessMessage(null);
                setIsIdentifyModalOpen(true);
              }}
              className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition border border-indigo-400/30 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
              title="Aponte a câmera ou digite o código da placa física para saber qual é a empresa e cadastrar o novo cliente"
            >
              <ScanLine className="w-4 h-4 shrink-0" />
              <span>🔍 Identificar Placa Impressa</span>
            </button>

            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="w-full lg:w-auto bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
              id="btn-open-batch-generator"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Gerar Lote (1 a 40)</span>
            </button>

            <button
              onClick={() => setIsSingleModalOpen(true)}
              className="w-full lg:w-auto bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Novo Individual</span>
            </button>
          </div>
        </div>

        {/* Clean Unboxed Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Total de Placas Cadastradas</span>
              <span className="text-lg font-black text-white">{stats.total} unidades</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center font-bold border border-emerald-800/40 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Com Link 5★ Configurado</span>
              <span className="text-lg font-black text-emerald-400">{stats.active} ativas</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center font-bold border border-amber-800/40 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Livres para Novos Clientes</span>
              <span className="text-lg font-black text-amber-300">{stats.pending} disponíveis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operating Mode & Public Domain Control Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-4 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800 px-2.5 py-0.5 rounded-full">
                Formato dos QR Codes
              </span>
              <span className="text-xs font-black text-slate-200">Escolha o Modo para Download e Impressão de Placas:</span>
            </div>
            <p className="text-[11px] text-slate-400">
              O <strong className="text-emerald-400">Modo Direto Oficial</strong> grava a URL de avaliação do Google (sem intermediário, 100% à prova de falhas em qualquer celular). O <strong className="text-cyan-400">Modo Dinâmico</strong> usa o redirecionamento permanente (/r/...).
            </p>
          </div>

          {/* Mode Switcher Buttons & Educational Guide */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsEduModalOpen(true)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-center"
              title="Entenda as diferenças técnicas e práticas entre Link Direto e Link Dinâmico"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Diferença: Direto vs Dinâmico</span>
            </button>

            <div className="flex flex-col sm:flex-row bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold shadow-inner w-full sm:w-auto">
              <button
                onClick={() => setQrExportMode('direct')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  qrExportMode === 'direct'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">⭐ Direto Oficial (Google)</span>
              </button>
              <button
                onClick={() => setQrExportMode('dynamic')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  qrExportMode === 'dynamic'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">🔄 Dinâmico Nuvem (/r/:id)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Domain status indicator & Notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              hasCustomPublicDomain()
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
            }`}>
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-300">Domínio Público do Redirecionador:</span>
                {hasCustomPublicDomain() ? (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ✓ Domínio Próprio Conectado
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-amber-300 border border-amber-800/60 font-bold px-2 py-0.5 rounded-full">
                    Ambiente em Nuvem (Configure seu Domínio)
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400 break-all mt-0.5">
                {hasCustomPublicDomain() ? getCustomPublicDomain() : getPublicAppOrigin()}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setCustomDomainInput(getCustomPublicDomain());
                setDomainModalTab('settings');
                setIsDomainModalOpen(true);
              }}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>Configurar Domínio Próprio</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomDomainInput(getCustomPublicDomain());
                setDomainModalTab('deploy_tutorial');
                setIsDomainModalOpen(true);
              }}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5 shrink-0" />
              <span>Como Subir no Seu Domínio (Tutorial)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Bar: Search, Filters & Batch Exports */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, ID (ex: 01, 25)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200 text-xs font-bold overflow-x-auto scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todos ({dynamicQrs.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                statusFilter === 'pending' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Aguardando ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center ${
                statusFilter === 'active' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Ativos ({stats.active})
            </button>
          </div>
        </div>

        {/* Right: Export All Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto justify-stretch sm:justify-end">
          <button
            onClick={handleDownloadAllZip}
            disabled={isExportingZip || dynamicQrs.length === 0}
            className="col-span-2 sm:col-auto bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-center"
            title="Baixar arquivo ZIP com todos os QR Codes em PNG HD 1000px"
          >
            {isExportingZip ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />
                <span className="truncate">Compactando ({zipProgress?.current}/{zipProgress?.total})...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Baixar Todos em ZIP ({dynamicQrs.length})</span>
              </>
            )}
          </button>

          <button
            onClick={handleBatchPrint}
            disabled={dynamicQrs.length === 0}
            className="bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-200 font-bold text-xs py-2 px-3.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs text-center"
            title="Imprimir cartela formatada com todos os QR Codes para corte"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">Imprimir Cartela</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={dynamicQrs.length === 0}
            className="bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-200 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs text-center"
            title="Exportar planilha CSV com links permanentes e URLs de destino"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>CSV</span>
          </button>

          {/* Backup Database Button */}
          <button
            onClick={handleBackupDatabase}
            disabled={dynamicQrs.length === 0}
            className="bg-cyan-50 hover:bg-cyan-100 active:scale-95 text-cyan-900 border border-cyan-200 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs text-center"
            title="Baixar Backup Completo de todas as empresas e tags em JSON com 1 clique"
          >
            <Database className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
            <span>Backup JSON</span>
          </button>

          {/* Restore Database Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestoreDatabase}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRestoring}
            className="bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-200 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs text-center"
            title="Restaurar empresas e tags a partir de um arquivo de backup JSON"
          >
            {isRestoring ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700 shrink-0" />
                <span className="truncate">Restaurando...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Restaurar</span>
              </>
            )}
          </button>

          {/* Central Artwork Download Button */}
          <button
            onClick={() => {
              setArtworkLead(leads[0] || null);
              setIsArtworkModalOpen(true);
            }}
            disabled={dynamicQrs.length === 0}
            className="col-span-2 sm:col-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs text-center"
            title="Baixar arte da Placa 10x10cm e Cartão NFC 5.4x8.5cm em alta resolução 300 DPI com QR Code do cliente"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
            <span className="truncate">Artes Gráficas (10x10 &amp; Cartão)</span>
          </button>
        </div>
      </div>

      {/* Main QR Code List / Fast URL Editor */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-cyan-600" />
              <span>Gerenciador de URLs Dinâmicas ({filteredQrs.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Altere a URL de destino abaixo e clique em <strong className="text-slate-700">Salvar</strong>. O redirecionamento atualizará instantaneamente no mundo real sem precisar reimprimir nada.
            </p>
          </div>
        </div>

        {filteredQrs.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Nenhum QR Code encontrado</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {searchTerm || statusFilter !== 'all'
                  ? 'Nenhum resultado com os filtros atuais. Limpe a busca para ver todos.'
                  : 'Você ainda não possui QR Codes gerados. Clique no botão "Gerar em Lote (1 a 40)" acima para criar seus primeiros 40 QR Codes instantaneamente!'}
              </p>
            </div>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider transition cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gerar 40 QR Codes Dinâmicos Agora</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredQrs.map((item, index) => {
              const plateInfo = getPlateIdentification(item.name, item.id, index + 1);
              const currentInputUrl = editingUrls[item.id] !== undefined ? editingUrls[item.id] : item.targetUrl;
              const currentType = editingTypes[item.id] || item.redirectType;
              const currentName = editingNames[item.id] !== undefined ? editingNames[item.id] : item.name;
              const isSavingThis = savingId === item.id;
              const isSavedSuccess = savedSuccessId === item.id;
              const isEditingName = isEditingNameId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center gap-4 justify-between"
                >
                  {/* Column 1: QR Thumbnail & Identity */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 sm:min-w-[240px]">
                    {/* QR Thumbnail Button (Click to enlarge) */}
                    <button
                      type="button"
                      onClick={() => setViewingQr(item.lead)}
                      className="w-14 h-14 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs hover:border-cyan-500 hover:shadow-md transition shrink-0 cursor-pointer group relative"
                      title="Clique para ampliar o QR Code"
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.activeQrUrl)}`}
                        alt={`QR ${item.name}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                      <span className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center text-white">
                        <Eye className="w-4 h-4" />
                      </span>
                    </button>

                    {/* Name, ID & Permanent link */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {isEditingName ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={currentName}
                              onChange={(e) => setEditingNames((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              className="text-xs font-black px-2 py-0.5 border border-cyan-400 rounded-lg bg-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveUrl(item.id);
                                if (e.key === 'Escape') setIsEditingNameId(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveUrl(item.id)}
                              className="p-1 text-emerald-600 hover:text-emerald-700"
                              title="Confirmar nome"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 shrink-0 shadow-2xs"
                              title={`Identificador físico no adesivo da placa: ${plateInfo.displayTag}`}
                            >
                              {plateInfo.leftEdgeTag || `Nº ${plateInfo.numStr}`}
                            </span>
                            <span className="text-xs font-black text-slate-900 truncate">{item.name}</span>
                            <button
                              onClick={() => setIsEditingNameId(item.id)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Renomear empresa"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Status Badge */}
                        {item.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-200 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Aguardando URL
                          </span>
                        )}
                      </div>

                      {/* Permanent Redirect Link */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                        <span className="text-slate-400">/r/{item.id}</span>
                        <button
                          onClick={() => handleCopyLink(item.permanentUrl, item.id)}
                          className="text-slate-400 hover:text-blue-600 transition cursor-pointer p-0.5"
                          title="Copiar Link Permanente Fixo"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={item.permanentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-700 transition"
                          title="Testar Redirecionamento em nova aba"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Direct Inline URL Editor */}
                  <div className="flex-1 max-w-2xl w-full">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {/* Destination Type Selector */}
                      <select
                        value={currentType}
                        onChange={(e) =>
                          setEditingTypes((prev) => ({ ...prev, [item.id]: e.target.value as any }))
                        }
                        className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:bg-white focus:outline-hidden shrink-0"
                      >
                        <option value="custom">🔗 URL Livre (Qualquer Site)</option>
                        <option value="whatsapp">💬 WhatsApp (Número + DDD)</option>
                        <option value="instagram">📸 Instagram (@ ou link)</option>
                        <option value="website">🌐 Site Próprio / Landing</option>
                        <option value="gmb">⭐ Google Meu Negócio</option>
                      </select>

                      {/* Input URL field */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder={
                            currentType === 'whatsapp'
                              ? 'Ex: 11999999999'
                              : currentType === 'instagram'
                              ? 'Ex: https://instagram.com/suaempresa'
                              : currentType === 'gmb'
                              ? 'Ex: https://maps.google.com/...'
                              : 'Cadastre a URL de destino (ex: https://...)'
                          }
                          value={currentInputUrl}
                          onChange={(e) =>
                            setEditingUrls((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveUrl(item.id);
                          }}
                          className={`w-full px-3 py-2 text-xs rounded-xl border font-medium transition-all ${
                            item.status === 'pending' && !currentInputUrl
                              ? 'bg-amber-50/40 border-amber-300 focus:bg-white focus:border-amber-500'
                              : 'bg-white border-slate-200 focus:border-cyan-500'
                          }`}
                        />
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={() => handleSaveUrl(item.id)}
                        disabled={isSavingThis}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-2xs ${
                          isSavedSuccess
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                        }`}
                        title="Salvar URL para este QR Code"
                      >
                        {isSavingThis ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                            <span>Salvando...</span>
                          </>
                        ) : isSavedSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Salvo!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3 text-cyan-400" />
                            <span>Salvar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick helper tip */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pl-1">
                      <span>
                        {item.targetUrl ? (
                          <span className="text-slate-600">
                            Destino ativo:{' '}
                            <strong className="text-slate-800 font-mono truncate inline-block max-w-[280px] align-bottom">
                              {item.targetUrl}
                            </strong>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold">
                            ⚠️ Sem destino definido. Ao escanear, o cliente verá a página de reserva da empresa.
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Column 3: Individual Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start sm:self-end lg:self-center">
                    <button
                      onClick={() => {
                        setArtworkLead(item.lead);
                        setIsArtworkModalOpen(true);
                      }}
                      className="py-1.5 px-2.5 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer flex items-center gap-1 text-[11px] font-black border border-indigo-200/60"
                      title="Baixar arte pronta para gráfica da Placa 10x10cm e Cartão NFC 5.4x8.5cm deste QR Code"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Artes HD</span>
                    </button>

                    <button
                      onClick={() => handleDownloadSingleQr(item.lead)}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                      title="Baixar PNG HD 1000px deste QR Code"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-700" />
                    </button>

                    <button
                      onClick={() => setViewingQr(item.lead)}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                      title="Ver e ampliar QR Code"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-700" />
                    </button>

                    <button
                      onClick={() => {
                        setNfcWriterLead(item.lead);
                        setIsNfcWriterOpen(true);
                      }}
                      className="p-2 text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition cursor-pointer"
                      title="Gravar Tag NFC no Celular (Android Chrome)"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>

                    {onNavigateToPortal && (
                      <button
                        onClick={() => onNavigateToPortal(item.id)}
                        className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
                        title="Abrir no Portal do Cliente"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteQr(item.id, item.name)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Excluir QR Code"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 0: QUICK ON-THE-SPOT PLATE ACTIVATION (VENDA EM CAMPO) */}
      {isQuickActivateOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Zap className="w-3 h-3 fill-emerald-800" />
                  Ativação Relâmpago na Visita
                </div>
                <h3 className="text-xl font-black text-slate-900">Ativar Placa Física no Cliente</h3>
                <p className="text-xs text-slate-500">
                  Cadastre o estabelecimento e vincule à placa que está na sua mão em menos de 30 segundos.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsQuickActivateOpen(false);
                  setQuickActivatedLead(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Already Activated: Success Screen */}
            {quickActivatedLead ? (
              <div className="space-y-5 animate-in zoom-in-95 duration-200">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-emerald-950">Placa Ativada com Sucesso!</h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      A placa física agora redireciona instantaneamente para <strong>{quickActivatedLead.name}</strong>.
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3 text-xs text-slate-700 text-left space-y-1.5 border border-emerald-100">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-bold uppercase">Código da Placa:</span>
                      <span className="font-mono font-black text-emerald-700">/r/{quickActivatedLead.id}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-bold uppercase">Empresa:</span>
                      <span className="font-bold text-slate-900">{quickActivatedLead.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-bold uppercase">PIN do Portal:</span>
                      <span className="font-mono font-bold text-slate-800">{quickActivatedLead.nfcPassword || '2026'}</span>
                    </div>
                  </div>
                </div>

                {/* Live Pitch Instructions */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl text-xs space-y-2 border border-slate-800">
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" />
                    <span>Momento de Fechar a Venda:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    1. Pegue a placa acrílica na mão e diga: <em>"Encoste seu celular aqui ou aponte a câmera pro QR Code."</em><br />
                    2. O celular do dono do comércio abrirá <strong>imediatamente</strong> na página de avaliação 5 estrelas do Google dele!<br />
                    3. Diga: <em>"Pronto, está funcionando! Vamos deixar aqui no balcão?"</em>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <a
                    href={getDynamicQrUrl(quickActivatedLead.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl text-center uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Testar Redirecionamento</span>
                  </a>
                  <button
                    onClick={() => {
                      setQuickBusinessName('');
                      setQuickTargetUrl('');
                      setQuickRedirectType('gmb');
                      setQuickCity('');
                      setQuickNiche('');
                      setQuickActivatedLead(null);
                      // Pick next pending plate if available
                      const nextPending = dynamicQrs.find(
                        (q) => q.status === 'pending' && q.id !== quickActivatedLead.id
                      );
                      if (nextPending) setQuickPlateId(nextPending.id);
                    }}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Ativar Outra Placa
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActivateOpen(false);
                      setQuickActivatedLead(null);
                    }}
                    className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              /* Activation Form */
              <div className="space-y-4 text-left">
                {/* 1: Plate Selection */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>1. Qual Placa Física você está segurando?</span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {dynamicQrs.filter((q) => q.status === 'pending').length} placas aguardando link
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={quickPlateId}
                      onChange={(e) => setQuickPlateId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                    >
                      <option value="">-- Selecione uma placa do lote --</option>
                      {dynamicQrs.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.id} ({q.name}) {q.status === 'pending' ? '🟡 Livre' : '✓ Já Ativa'}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Ou digite o código (ex: placa_01)"
                      value={quickPlateId}
                      onChange={(e) => setQuickPlateId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    O QR Code e chip NFC desta placa já estão pré-gravados apontando para{' '}
                    <strong className="text-slate-600 font-mono">/r/{quickPlateId || 'sua_placa'}</strong>.
                  </p>
                </div>

                {/* 2: Business Name & City */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                      2. Nome do Estabelecimento (Cliente)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pizzaria Forno Nobre, Barbearia Silva"
                      value={quickBusinessName}
                      onChange={(e) => setQuickBusinessName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                      Cidade (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: São Paulo"
                      value={quickCity}
                      onChange={(e) => setQuickCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* 3: Destination Type */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    3. Para onde a placa vai direcionar?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuickRedirectType('gmb')}
                      className={`p-2 rounded-xl text-left border transition text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        quickRedirectType === 'gmb'
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>⭐ Google Avaliações</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickRedirectType('whatsapp')}
                      className={`p-2 rounded-xl text-left border transition text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        quickRedirectType === 'whatsapp'
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>💬 WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickRedirectType('instagram')}
                      className={`p-2 rounded-xl text-left border transition text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        quickRedirectType === 'instagram'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-pink-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>📸 Instagram</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickRedirectType('website')}
                      className={`p-2 rounded-xl text-left border transition text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        quickRedirectType === 'website'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>🌐 Site / Cardápio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickRedirectType('custom')}
                      className={`p-2 rounded-xl text-left border transition text-xs font-bold flex items-center gap-1.5 cursor-pointer sm:col-span-2 ${
                        quickRedirectType === 'custom'
                          ? 'bg-slate-900 text-white border-slate-950 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>🔗 Qualquer Outro Link</span>
                    </button>
                  </div>
                </div>

                {/* 4: Destination URL Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    {quickRedirectType === 'gmb'
                      ? 'Link do Google Meu Negócio / Maps da Empresa'
                      : quickRedirectType === 'whatsapp'
                      ? 'Número do WhatsApp (com DDD)'
                      : quickRedirectType === 'instagram'
                      ? 'Link do Instagram ou @perfil'
                      : 'URL de Destino'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      quickRedirectType === 'gmb'
                        ? 'Cole aqui o link do Google Maps da empresa...'
                        : quickRedirectType === 'whatsapp'
                        ? 'Ex: 11999999999'
                        : quickRedirectType === 'instagram'
                        ? 'Ex: https://instagram.com/empresa'
                        : 'https://...'
                    }
                    value={quickTargetUrl}
                    onChange={(e) => setQuickTargetUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-medium focus:border-emerald-500 focus:outline-hidden"
                  />
                  {quickRedirectType === 'gmb' && (
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 leading-snug">
                      ⭐ <strong>Conversão Inteligente Automática:</strong> Pode colar qualquer link do Google Maps
                      ou de busca. O sistema redirecionará o cliente direto para o pop-up oficial de 5 estrelas do Google!
                    </div>
                  )}
                </div>

                {/* 5: PIN & Portal Code */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">
                      Senha PIN para o Portal do Cliente:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      O cliente poderá alterar esse link depois sozinho
                    </span>
                  </div>
                  <input
                    type="text"
                    value={quickPin}
                    onChange={(e) => setQuickPin(e.target.value)}
                    placeholder="2026"
                    className="w-24 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickActivateOpen(false)}
                    disabled={isActivatingQuick}
                    className="flex-1 py-3 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteQuickActivate}
                    disabled={isActivatingQuick || !quickPlateId || !quickBusinessName || !quickTargetUrl}
                    className="flex-2 py-3 text-xs font-black rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isActivatingQuick ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Ativando Placa...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                        <span>🚀 Ativar Placa em 1 Segundo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: BATCH QR CODE GENERATOR (1 TO 40) */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Gerador Automático
                </div>
                <h3 className="text-xl font-black text-slate-900">Gerar QR Codes Dinâmicos em Lote</h3>
                <p className="text-xs text-slate-500">
                  Crie dezenas de QR codes numerados em segundos para imprimir placas ou cartazes com antecedência.
                </p>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                disabled={isGeneratingBatch}
                className="flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 group shrink-0"
                title="Fechar janela (Esc ou clique fora)"
                aria-label="Fechar janela"
              >
                <X className="w-4 h-4 text-slate-500 group-hover:text-rose-600" />
                <span>Fechar</span>
              </button>
            </div>

            {/* Quick Presets for Quantity */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quantidade de QR Codes a Gerar
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[10, 20, 30, 40, 50].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setBatchQuantity(qty)}
                    className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      batchQuantity === qty
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {qty === 40 ? '⭐ 40' : qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Prefixo do Nome</label>
                <input
                  type="text"
                  value={batchPrefix}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  placeholder="Ex: Empresa, Mesa, Ponto"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
                <span className="text-[9px] text-slate-400">Gera: "{batchPrefix} 01", "{batchPrefix} 02"...</span>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Prefixo do Link (ID)</label>
                <input
                  type="text"
                  value={batchIdPrefix}
                  onChange={(e) => setBatchIdPrefix(e.target.value)}
                  placeholder="Ex: empresa, tag, mesa"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs"
                />
                <span className="text-[9px] text-slate-400">Gera: /r/{batchIdPrefix}_01, /r/{batchIdPrefix}_02...</span>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Iniciar do Número</label>
                <input
                  type="number"
                  min={1}
                  value={batchStartNum}
                  onChange={(e) => setBatchStartNum(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Senha Padrão Portal (PIN)</label>
                <input
                  type="text"
                  value={batchPin}
                  onChange={(e) => setBatchPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs"
                />
              </div>
            </div>

            {/* Initial Destination Option */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold text-slate-600 uppercase">Destino Inicial das URLs</label>
              <select
                value={batchInitialType}
                onChange={(e) => setBatchInitialType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold"
              >
                <option value="open">🟡 Em Aberto / Reservado (Vou cadastrar as URLs depois)</option>
                <option value="whatsapp">💬 WhatsApp Padrão da ALF</option>
                <option value="instagram">📸 Instagram</option>
                <option value="custom">🔗 URL Específica Inicial</option>
              </select>
              {batchInitialType !== 'open' && (
                <input
                  type="text"
                  placeholder="Digite a URL padrão inicial..."
                  value={batchDefaultUrl}
                  onChange={(e) => setBatchDefaultUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white mt-2"
                />
              )}
            </div>

            {/* Summary preview */}
            <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-2xl text-xs text-cyan-900 leading-relaxed">
              <strong>Resumo da geração:</strong> O sistema criará{' '}
              <strong className="font-extrabold">{batchQuantity} registros</strong> de{' '}
              <strong className="font-mono">
                {batchPrefix} {String(batchStartNum).padStart(2, '0')}
              </strong>{' '}
              até{' '}
              <strong className="font-mono">
                {batchPrefix} {String(batchStartNum + batchQuantity - 1).padStart(2, '0')}
              </strong>
              . Links permanentes: <strong className="font-mono">/r/{batchIdPrefix}_...</strong>
            </div>

            {/* Progress Bar if generating */}
            {isGeneratingBatch && batchProgress && (
              <div className="space-y-1 text-left">
                <div className="flex justify-between text-[10px] font-bold text-slate-600">
                  <span>Gravando QR Codes no Firestore...</span>
                  <span>
                    {batchProgress.current} / {batchProgress.total} (
                    {Math.round((batchProgress.current / batchProgress.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full transition-all duration-150"
                    style={{
                      width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                disabled={isGeneratingBatch}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteBatch}
                disabled={isGeneratingBatch}
                className="flex-1 py-2.5 text-xs font-black rounded-xl bg-slate-900 hover:bg-slate-800 text-white uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                id="btn-confirm-generate-batch"
              >
                {isGeneratingBatch ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Gerar {batchQuantity} QR Codes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE SINGLE QR CODE */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200 relative">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Novo QR Code Individual</h3>
                <p className="text-xs text-slate-500">Adicione um novo QR Code dinâmico específico.</p>
              </div>
              <button
                onClick={() => setIsSingleModalOpen(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 group shrink-0"
                title="Fechar janela (Esc ou clique fora)"
                aria-label="Fechar janela"
              >
                <X className="w-4 h-4 text-slate-500 group-hover:text-rose-600" />
                <span>Fechar</span>
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Código ID / Slug Fixo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400 font-mono">
                    /r/
                  </span>
                  <input
                    type="text"
                    placeholder="empresa_especial"
                    value={singleId}
                    onChange={(e) => setSingleId(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Nome do Estabelecimento / Rótulo</label>
                <input
                  type="text"
                  placeholder="Ex: Pizzaria Forno Nobre"
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Tipo de Destino</label>
                <select
                  value={singleType}
                  onChange={(e) => setSingleType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="custom">URL Livre (Qualquer Site)</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="website">Site Institucional</option>
                  <option value="gmb">Google Meu Negócio</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">URL ou Destino (Opcional agora)</label>
                <input
                  type="text"
                  placeholder="https://... ou em branco para preencher depois"
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSingleModalOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateSingle}
                className="flex-1 py-2.5 text-xs font-black rounded-xl bg-slate-900 hover:bg-slate-800 text-white uppercase tracking-wider shadow-md cursor-pointer"
              >
                Criar QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW / ENLARGE QR CODE DETAILS (DUAL DIRECT & DYNAMIC) - WITH MINIMIZE & CLOSE */}
      {viewingQr && (
        isQrModalMinimized ? (
          /* Minimized floating bar at bottom-right */
          <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border-2 border-cyan-500/80 rounded-2xl shadow-2xl p-3 flex items-center gap-3 text-white animate-in slide-in-from-bottom-5 duration-200">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="min-w-0 max-w-[180px] sm:max-w-xs">
              <p className="text-xs font-black truncate">{viewingQr.name}</p>
              <p className="text-[10px] text-cyan-300 font-mono truncate">ID: {viewingQr.id}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <button
                type="button"
                onClick={() => setIsQrModalMinimized(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Restaurar / Maximizar QR Code"
                aria-label="Restaurar tela do QR Code"
              >
                <Maximize2 className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewingQr(null);
                  setIsQrModalMinimized(false);
                }}
                className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Fechar"
                aria-label="Fechar QR Code"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Full expanded modal with mobile support, minimize button and backdrop click */
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setViewingQr(null);
              }
            }}
          >
            <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 text-center shadow-2xl space-y-4 border border-slate-200 relative animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
              {/* Header Action Bar: Title, Minimize & Highly Visible Intuitive 'X' Close Button */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-xs pt-1 pb-3 -mt-2 border-b border-slate-100 flex items-center justify-between gap-2 text-left z-20">
                <div className="min-w-0 pr-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">{viewingQr.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">ID da Placa: {viewingQr.id}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Minimize Button */}
                  <button
                    type="button"
                    onClick={() => setIsQrModalMinimized(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
                    title="Minimizar janela para o canto da tela"
                    aria-label="Minimizar visualização do QR Code"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden sm:inline">Minimizar</span>
                  </button>

                  {/* Super Visible & Intuitive Close 'X' Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setViewingQr(null);
                      setIsQrModalMinimized(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 hover:text-rose-900 border border-rose-200/90 rounded-xl font-black text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95 group"
                    title="Fechar janela (Esc ou clique fora)"
                    aria-label="Fechar visualização do QR Code"
                  >
                    <X className="w-4 h-4 text-rose-600 group-hover:rotate-90 transition-transform duration-200 stroke-[2.5]" />
                    <span>Fechar</span>
                  </button>
                </div>
              </div>

              {/* Modal Tabs: Direct Official vs Dynamic Nuvem */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalQrTab('direct')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                    modalQrTab === 'direct'
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>⭐ Direto (Oficial)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalQrTab('dynamic')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                    modalQrTab === 'dynamic'
                      ? 'bg-cyan-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>🔄 Dinâmico (/r/...)</span>
                </button>
              </div>

              {modalQrTab === 'direct' ? (
                /* TAB 1: DIRECT OFFICIAL QR CODE */
                <div className="space-y-3">
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 rounded-full">
                    ✓ Sem Erro 403 • Abre Google Reviews Imediatamente
                  </span>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 inline-block shadow-inner">
                    {viewingDirectQrDataUrl ? (
                      <img
                        src={viewingDirectQrDataUrl}
                        alt={`QR Direto ${viewingQr.name}`}
                        className="w-48 h-48 sm:w-52 sm:h-52 mx-auto rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">Link Gravado neste QR:</span>
                    <span className="font-mono text-[11px] text-emerald-700 break-all block leading-tight">
                      {getDirectLeadUrl(viewingQr)}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Garante que qualquer celular de cliente na rua abra a tela de 5 estrelas do Google sem nenhuma tela de bloqueio.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDownloadSingleQr(viewingQr, 'direct')}
                      className="flex-1 py-2.5 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar QR Direto HD</span>
                    </button>
                    <a
                      href={getDirectLeadUrl(viewingQr)}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                      title="Testar link no navegador"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                /* TAB 2: DYNAMIC PERMANENT QR CODE */
                <div className="space-y-3">
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-0.5 rounded-full">
                    Redirecionamento Nuvem ALF Automação
                  </span>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 inline-block shadow-inner">
                    {viewingDynamicQrDataUrl ? (
                      <img
                        src={viewingDynamicQrDataUrl}
                        alt={`QR Dinâmico ${viewingQr.name}`}
                        className="w-48 h-48 sm:w-52 sm:h-52 mx-auto rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" />
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700">Link Fixo: </span>
                      <span className="font-mono text-[11px] text-blue-600 break-all">
                        {getDynamicQrUrl(viewingQr.id)}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Destino Atual: </span>
                      <span className="text-[11px] text-slate-800 break-all">
                        {viewingQr.googleMapsUrl ||
                          viewingQr.nfcCustomUrl ||
                          viewingQr.websiteUrl ||
                          viewingQr.nfcInstagramUrl ||
                          'Em Aberto (Aguardando link)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDownloadSingleQr(viewingQr, 'dynamic')}
                      className="flex-1 py-2.5 text-xs font-black rounded-xl bg-slate-900 hover:bg-slate-800 text-white uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Baixar QR Dinâmico HD</span>
                    </button>
                    <a
                      href={getTestRedirectUrl(viewingQr.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                      title="Testar Redirecionamento Nuvem no navegador"
                    >
                      <ExternalLink className="w-4 h-4 text-cyan-600" />
                    </a>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setNfcWriterLead(viewingQr);
                  setIsNfcWriterOpen(true);
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-200" />
                <span>Gravar Tag NFC no Celular (Android Chrome)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setArtworkLead(viewingQr);
                  setIsArtworkModalOpen(true);
                }}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Gerar Placa 10x10cm & Cartão NFC</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewingQr(null);
                  setIsQrModalMinimized(false);
                }}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1 mt-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Fechar Visualização</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* Custom Domain & Cloud Deploy Modal */}
      {isDomainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Domínio Próprio & Publicação na Nuvem</h3>
                  <p className="text-xs text-slate-400">Suba o sistema no seu domínio e garanta redirecionamentos 100% livres de telas do Google</p>
                </div>
              </div>
              <button
                onClick={() => setIsDomainModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs: Settings, Deploy Tutorial, DNS Guide */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setDomainModalTab('settings')}
                className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  domainModalTab === 'settings'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>1. Configurar Domínio</span>
              </button>
              <button
                type="button"
                onClick={() => setDomainModalTab('deploy_tutorial')}
                className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  domainModalTab === 'deploy_tutorial'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>2. Como Subir (Deploy)</span>
              </button>
              <button
                type="button"
                onClick={() => setDomainModalTab('dns_guide')}
                className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  domainModalTab === 'dns_guide'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3. Configurar DNS</span>
              </button>
            </div>

            {/* TAB 1: DOMAIN SETTINGS */}
            {domainModalTab === 'settings' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Por que configurar seu próprio domínio?</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Ao definir seu domínio próprio (ex: <code className="text-cyan-300 font-mono">https://meuavaliar.com.br</code>), todos os QR Codes gerados, impressos e exportados para ZIP passarão a usar esse endereço permanente. O cliente na rua que escanear a placa <strong>nunca verá o Google Studio</strong> e será redirecionado em 100ms direto para o link da empresa!
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-200 uppercase tracking-wider text-[10px] block">
                    URL ou Domínio Comprado (com https://):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="https://suaempresa.com.br ou https://placas.suaempresa.com.br"
                      value={customDomainInput}
                      onChange={(e) => setCustomDomainInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white pl-3 pr-24 py-2.5 rounded-xl text-xs font-mono focus:border-cyan-500 focus:outline-hidden"
                    />
                    {customDomainInput && (
                      <button
                        type="button"
                        onClick={() => setCustomDomainInput('')}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-[11px] px-2 py-0.5 rounded-lg bg-slate-800"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Exemplo: <code>https://alfautomacao.com.br</code> ou <code>https://avaliar.top</code>. Deixe vazio para usar a URL padrão.
                  </span>
                </div>

                {/* Live Preview Box */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Exemplo de Link que será impresso no QR Code da placa:
                  </span>
                  <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-cyan-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                    <span className="break-all">
                      {(customDomainInput.trim() || getPublicAppOrigin()).replace(/\/+$/, '')}/r/empresa_01
                    </span>
                    <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                      Link Físico Permanente
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    ⚡ Quando o cliente ler a placa, o servidor faz um redirecionamento HTTP 302 direto para a tela de avaliação do Google em menos de 0,1 segundo.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPublicDomain(customDomainInput);
                      alert('Domínio configurado com sucesso! Todos os novos QR Codes e placas geradas usarão este endereço.');
                      setIsDomainModalOpen(false);
                    }}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg"
                  >
                    Salvar e Aplicar Domínio
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDomainModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: DEPLOY TUTORIAL */}
            {domainModalTab === 'deploy_tutorial' && (
              <div className="space-y-4 text-xs text-slate-300">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-black text-emerald-400 text-sm flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Qual a melhor e mais fácil maneira de subir no seu domínio?
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Este sistema é uma aplicação fullstack moderna (Express + Vite + React + Firebase). Existem 3 formas excelentes de publicar:
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Opção 1: Render / Railway (Mais Recomendada) */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-400 text-xs flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Opção 1: Render.com ou Railway.app (Mais Rápida e Fácil)
                      </span>
                      <span className="text-[9px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                        Recomendado
                      </span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                      <li>Crie uma conta gratuita em <strong className="text-white">Render.com</strong> ou <strong className="text-white">Railway.app</strong>.</li>
                      <li>Conecte seu repositório GitHub com o código deste projeto.</li>
                      <li>
                        Configure os comandos de execução:
                        <div className="bg-slate-900 p-2 rounded-lg font-mono text-[10px] text-slate-200 mt-1 space-y-0.5">
                          <div><strong>Build Command:</strong> <code>npm run build</code></div>
                          <div><strong>Start Command:</strong> <code>npm run start</code> (ou <code>node server.ts</code>)</div>
                        </div>
                      </li>
                      <li>Na aba <strong className="text-white">"Custom Domains"</strong>, digite o domínio que você comprou. O Render/Railway gera o certificado SSL HTTPS gratuitamente em 2 minutos!</li>
                    </ol>
                  </div>

                  {/* Opção 2: Google Cloud Run */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="font-black text-cyan-400 text-xs flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      Opção 2: Google Cloud Run (Onde o App já está rodando)
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Como o projeto já roda no Google Cloud Run, você pode vincular seu domínio diretamente:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                      <li>Acesse o <strong className="text-slate-200">Google Cloud Console &gt; Cloud Run</strong>.</li>
                      <li>Clique em <strong className="text-slate-200">"Gerenciar Domínios Personalizados"</strong> &gt; <strong className="text-slate-200">"Adicionar Mapeamento"</strong>.</li>
                      <li>Insira seu domínio e copie os registros de DNS fornecidos pelo Google.</li>
                    </ol>
                  </div>

                  {/* Opção 3: VPS Hostinger / Hetzner */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Opção 3: VPS Ubuntu Própria (Custo fixo R$ 25/mês)
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Para quem prefere uma VPS na Hostinger ou Hetzner, basta rodar com Node.js + PM2 ou Docker com Nginx/Caddy com SSL automático via Let's Encrypt.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setDomainModalTab('dns_guide')}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Ver Como Configurar o DNS no seu Registrador</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: DNS CONFIGURATION GUIDE */}
            {domainModalTab === 'dns_guide' && (
              <div className="space-y-4 text-xs text-slate-300">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-black text-amber-400 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Como Apontar o DNS na Empresa Onde Comprou o Domínio
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Se você comprou no <strong className="text-white">Registro.br</strong>, <strong className="text-white">Hostinger</strong>, <strong className="text-white">GoDaddy</strong> ou usa <strong className="text-white">Cloudflare</strong>, siga esta configuração de 2 passos:
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Cenário A: Subdomínio */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-xs block">
                      A. Se for usar um subdomínio (Ex: <code className="text-cyan-400">placas.suaempresa.com.br</code> ou <code className="text-cyan-400">avaliar.suaempresa.com.br</code>) - RECOMENDADO:
                    </span>
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-[11px] font-mono space-y-1">
                      <div><strong>Tipo:</strong> <span className="text-cyan-400 font-bold">CNAME</span></div>
                      <div><strong>Nome / Entrada:</strong> <span className="text-emerald-400 font-bold">placas</span> (ou <span className="text-emerald-400 font-bold">avaliar</span>)</div>
                      <div><strong>Dados / Destino:</strong> <span className="text-amber-400 font-bold">o-link-do-seu-servidor.onrender.com</span></div>
                      <div><strong>TTL:</strong> 1 hora (ou Padrão)</div>
                    </div>
                  </div>

                  {/* Cenário B: Domínio Principal */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="font-bold text-white text-xs block">
                      B. Se for usar o domínio principal direto (Ex: <code className="text-cyan-400">meuavaliar.com.br</code>):
                    </span>
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-[11px] font-mono space-y-1">
                      <div><strong>Tipo:</strong> <span className="text-cyan-400 font-bold">A</span></div>
                      <div><strong>Nome / Entrada:</strong> <span className="text-emerald-400 font-bold">@</span> (ou em branco no Registro.br)</div>
                      <div><strong>Dados / IP:</strong> <span className="text-amber-400 font-bold">IP fornecido pelo seu servidor</span></div>
                      <div><strong>TTL:</strong> 1 hora (ou Padrão)</div>
                    </div>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-800/80 p-3.5 rounded-2xl text-[11px] text-emerald-200 flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Certificado SSL (Cadeado Verde HTTPS):</strong>
                      <p className="mt-0.5 text-slate-300">
                        Tanto o Render, Railway quanto o Cloudflare geram o HTTPS automaticamente. Você não precisa pagar por certificado SSL!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDomainModalTab('settings')}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Voltar para Configurar Domínio
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDomainModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDUCATIONAL MODAL: LINK DIRETO VS LINK DINÂMICO */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Entendendo: Link Direto vs Link Dinâmico</h3>
                  <p className="text-xs text-slate-400">Qual formato escolher para suas placas físicas e como garantir que nunca quebrem</p>
                </div>
              </div>
              <button
                onClick={() => setIsEduModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Link Direto */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-900/60 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded-full">
                      ⭐ Link Direto Oficial
                    </span>
                    <span className="text-[10px] text-slate-500">Sem Servidor Intermediário</span>
                  </div>

                  <h4 className="text-sm font-black text-white">Google Reviews Direto</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    O QR Code e a tag NFC física são gravados <strong>DIRETAMENTE</strong> com o link oficial de avaliação do Google da empresa:
                  </p>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-400 break-all">
                    https://search.google.com/local/writereview?placeid=ChIJ...
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="text-emerald-300 flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>Vantagem:</strong> Abre na mesma hora a janela de 5 estrelas do Google. Não depende do seu servidor estar ligado.</span>
                    </div>
                    <div className="text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>Desvantagem / Risco:</strong> Se a empresa mudar de endereço, trocar de telefone ou o Google alterar o PlaceID, a placa física <strong>não pode ser alterada</strong> (o QR code impresso vira lixo).</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Quando usar:</span>
                  <span className="text-xs text-slate-300">Venda avulsa de placa única sem cobrar mensalidade do cliente.</span>
                </div>
              </div>

              {/* Card 2: Link Dinâmico */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-cyan-900/60 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-950 border border-cyan-800 px-2.5 py-1 rounded-full">
                      🔄 Link Dinâmico Nuvem
                    </span>
                    <span className="text-[10px] text-cyan-300 font-bold">Placa Eterna (SaaS)</span>
                  </div>

                  <h4 className="text-sm font-black text-white">Redirecionamento Inteligente (/r/:id)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    O QR Code e a tag NFC física são gravados com o seu link curto permanente:
                  </p>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-cyan-400 break-all">
                    https://seu-dominio.com.br/r/empresa_01
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="text-cyan-300 flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>Placa Eterna:</strong> Troque o destino a qualquer momento no painel (Google, WhatsApp, Instagram, Cardápio) sem mexer na placa física.</span>
                    </div>
                    <div className="text-cyan-300 flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>Métricas & Recorrência:</strong> Conta acessos em tempo real e permite pausar o redirecionamento caso o cliente fique inadimplente na mensalidade.</span>
                    </div>
                    <div className="text-cyan-300 flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>Estoque Pré-Impresso:</strong> Ande com 50 placas prontas e ative na hora da visita em 30 segundos!</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Quando usar:</span>
                  <span className="text-xs text-slate-300">Modelo de assinatura mensal (R$ 29 a R$ 99/mês) e escala de vendas.</span>
                </div>
              </div>
            </div>

            {/* Crucial Explanations: Google Studio & Why links never break */}
            <div className="space-y-3 pt-2">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-amber-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  "Por que nos meus testes o celular tentou abrir o Google Studio?"
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Isso acontece exclusivamente porque você estava testando com a URL do ambiente de desenvolvimento do Google Studio (<code className="text-slate-400 font-mono">ais-dev-...run.app</code>). Como esse endereço é privado para programar, qualquer celular sem login no Google Studio cai na tela de acesso.
                </p>
                <p className="text-xs text-emerald-300 leading-relaxed font-semibold">
                  ✓ Para clientes finais na rua: uma vez configurado o seu Domínio Próprio ou feito o deploy, o link do QR Code é <strong>https://seu-dominio.com.br/r/:id</strong>. O celular do visitante redireciona em 100ms direto para a tela de avaliação do Google, sem que o cliente veja tela nenhuma de sistema!
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-cyan-400 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  "Como o sistema garante que nenhum link ou QR Code fique quebrado?"
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-300 pt-1">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-white block mb-1">1. Conversão de PlaceID:</strong>
                    Converte links encurtados (<code className="text-cyan-300 text-[10px]">maps.app.goo.gl</code>) para a URL canônica de 5 estrelas.
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-white block mb-1">2. Busca Universal:</strong>
                    Se o PlaceID mudar, o servidor faz fallback automático via pesquisa com gatilho <code className="text-cyan-300 text-[10px]">#lrd=...</code> para nunca dar erro 403.
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <strong className="text-white block mb-1">3. Tela de Ativação:</strong>
                    Se a placa física for escaneada antes de você cadastrar o destino, abre uma página elegante com o nome da empresa, nunca um erro 404.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEduModalOpen(false);
                  setDomainModalTab('deploy_tutorial');
                  setIsDomainModalOpen(true);
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <Server className="w-4 h-4" />
                <span>Ver Passo a Passo para Subir no Seu Domínio</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEduModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Entendi, Fechar Guia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Artwork High-Definition Download Modal */}
      <NfcArtworkDownloadModal
        isOpen={isArtworkModalOpen}
        onClose={() => {
          setIsArtworkModalOpen(false);
          setArtworkLead(null);
        }}
        lead={artworkLead}
        leads={leads}
        onSelectDifferentLead={(lead) => setArtworkLead(lead)}
      />

      {/* IDENTIFY PRINTED PLATE MODAL */}
      {isIdentifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <ScanLine className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Identificador de Placa & QR Code Impresso</h3>
                  <p className="text-xs text-slate-400">Descubra a qual empresa pertence uma placa física que já está impressa na sua mão</p>
                </div>
              </div>
              <button
                onClick={() => setIsIdentifyModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input & Search Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Cole o link lido pelo celular ou digite o código/número da placa:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Ex: https://.../r/assadosdojapa, empresa08, 08 ou Japa..."
                    value={identifyQuery}
                    onChange={(e) => {
                      setIdentifyQuery(e.target.value);
                      if (e.target.value) handleIdentifySearch(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleIdentifySearch();
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-400 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleIdentifySearch()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shrink-0"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => identifyFileInputRef.current?.click()}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2.5 rounded-xl text-xs transition cursor-pointer border border-slate-700 flex items-center gap-1.5 shrink-0"
                  title="Enviar foto do QR Code da placa"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Foto da Placa</span>
                </button>
                <input
                  ref={identifyFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleIdentifyImageFile}
                  className="hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                💡 <strong>Dica rápida:</strong> Aponte a câmera do celular para o QR Code da placa. O próprio celular mostra o endereço antes de abrir (ex: <code className="text-amber-300 font-mono">.../r/empre08</code>). Digite apenas o finalzinho (ex: <code className="text-amber-300 font-mono">08</code> ou <code className="text-amber-300 font-mono">assadosdojapa</code>) para achar na hora!
              </p>
            </div>

            {/* Result Display */}
            {identifySearched && (
              <div className="pt-2">
                {identifyResult ? (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Placa Encontrada no Cadastro
                      </span>
                      <span className="text-xs font-mono text-cyan-400 font-bold">ID: {identifyResult.id}</span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-white">{identifyResult.name}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {identifyResult.city || 'Brasil'} • Nicho: {identifyResult.niche || 'Geral'}
                      </p>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Canal Ativo na Placa:</span>
                        <span className="font-bold uppercase text-amber-400">
                          {identifyResult.nfcRedirectActive === 'gmb' ? '⭐ Avaliação Google Reviews' :
                           identifyResult.nfcRedirectActive === 'whatsapp' ? '💬 WhatsApp' :
                           identifyResult.nfcRedirectActive === 'instagram' ? '📸 Instagram' :
                           identifyResult.nfcRedirectActive === 'website' ? '🌐 Website' : '🔗 Link Personalizado'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        <strong>Destino configurado:</strong>{' '}
                        <span className="text-slate-300 font-mono">
                          {identifyResult.googleMapsUrl || identifyResult.nfcCustomUrl || identifyResult.nfcWhatsappNum || 'Busca Google 5 Estrelas (Padrão)'}
                        </span>
                      </div>
                    </div>

                    {/* Fast Bind Form for the Seller */}
                    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          Vender / Vincular Cliente nesta Placa Física
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          QR impresso: /r/{identifyResult.id}
                        </span>
                      </div>

                      {bindSuccessMessage && (
                        <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 font-bold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{bindSuccessMessage}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 block">
                          🏢 Nome da Empresa que comprou esta Placa:
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Padaria Central, Barbearia Silva, CB CELL..."
                          value={bindBusinessName}
                          onChange={(e) => setBindBusinessName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-300">
                            ⭐ Link de Avaliação do Google do Cliente:
                          </label>
                          <button
                            type="button"
                            onClick={handleSearchPlaceIdForBind}
                            disabled={isSearchingPlaceId || !bindBusinessName.trim()}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            {isSearchingPlaceId ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>Buscando no Google...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" />
                                <span>Buscar Place ID no Google</span>
                              </>
                            )}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Cole aqui o link do Google Maps ou de avaliação..."
                          value={bindTargetUrl}
                          onChange={(e) => setBindTargetUrl(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-hidden focus:border-amber-400"
                        />
                        <span className="text-[10px] text-slate-400 block">
                          💡 O sistema converte automaticamente qualquer link do Google Maps para a janela de 5 estrelas!
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleQuickBindInIdentifyModal}
                          disabled={isBindingLead || !bindBusinessName.trim() || !bindTargetUrl.trim()}
                          className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                        >
                          {isBindingLead ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                              <span>Salvando na Placa...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 fill-slate-950" />
                              <span>🚀 Salvar e Ativar Placa para Este Cliente</span>
                            </>
                          )}
                        </button>
                        <a
                          href={getTestRedirectUrl(identifyResult.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 border border-slate-700"
                          title="Testar se o QR code já está abrindo no Google"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Testar no Google</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-4 text-center space-y-1 text-xs">
                    <p className="font-bold text-amber-300">Nenhuma placa encontrada com este código.</p>
                    <p className="text-slate-400 text-[11px]">
                      Verifique se digitou o ID correto ou confira a tabela completa de placas abaixo.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Reference Table of All Plates */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                📋 Relação Completa de Placas Cadastradas no Sistema ({leads.length} cadastradas):
              </span>
              <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/60 text-xs">
                {leads.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      setIdentifyQuery(l.id);
                      handleIdentifySearch(l.id);
                    }}
                    className={`p-3 flex items-center justify-between hover:bg-slate-800 transition cursor-pointer ${
                      identifyResult?.id === l.id ? 'bg-amber-500/10 border-l-4 border-amber-400' : ''
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm">
                          Placa {l.id.replace(/[^0-9]/g, '') ? `#${l.id.replace(/[^0-9]/g, '')}` : l.id}
                        </span>
                        {l.name.toLowerCase().startsWith('empresa') || l.name.toUpperCase().includes('SOBRE SUA EXPERIÊNCIA') || l.name === '.' ? (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            🟢 Disponível
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            🏢 {l.name}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400 block">ID: {l.id} • Link impresso: /r/{l.id}</span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>Vincular</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsIdentifyModalOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NFC Tag Hardware Writer Modal */}
      <NfcWriterModal
        isOpen={isNfcWriterOpen}
        onClose={() => {
          setIsNfcWriterOpen(false);
          setNfcWriterLead(null);
        }}
        leadId={nfcWriterLead?.id || ''}
        leadName={nfcWriterLead?.name || ''}
      />
    </div>
  );
}
