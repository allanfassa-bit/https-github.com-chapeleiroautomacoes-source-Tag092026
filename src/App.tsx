import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { PWAInstallButton } from './components/PWAInstallButton';
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
  Smartphone,
  Laptop,
  Coins,
  Award,
  Shield,
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
  Compass
} from 'lucide-react';

// Interfaces
export interface SearchLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  step?: number;
}

interface Lead {
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
  nfcRedirectActive?: 'gmb' | 'whatsapp' | 'instagram' | 'website' | 'custom';
  nfcCustomUrl?: string;
  nfcInstagramUrl?: string;
  nfcWhatsappNum?: string;
  nfcWhatsappMsg?: string;
  nfcBillingStatus?: 'active' | 'suspended';
  nfcModulesAllowed?: {
    gmb: boolean;
    whatsapp: boolean;
    instagram: boolean;
    website: boolean;
    custom: boolean;
  };
}

interface SiteTemplate {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  about: {
    title: string;
    text: string;
  };
  services: Array<{ title: string; description: string }>;
  testimonials: Array<{ author: string; role: string; text: string }>;
  cta: {
    title: string;
    text: string;
    buttonText: string;
  };
}

interface Pitch {
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
const PRESET_NICHES = [
  { id: 'Dentista', label: '🦷 Dentista / Odonto' },
  { id: 'Mecânica', label: '🚗 Oficina Mecânica' },
  { id: 'Restaurante', label: '🍕 Restaurante / Pizzaria' },
  { id: 'Salão de Beleza', label: '💇‍♀️ Salão & Estética' },
  { id: 'Imobiliária', label: '🏢 Imobiliária' },
  { id: 'Academia', label: '💪 Academia / Fitness' },
  { id: 'Pet Shop', label: '🐶 Pet Shop / Vet' },
  { id: 'Advogado', label: '⚖️ Advocacia' }
];

export default function App() {
  // Navigation / Tabs State
  const [activeTab, setActiveTab] = useState<'leads' | 'crm' | 'site_preview' | 'nfc_designer' | 'calculator' | 'portal'>('leads');

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

  // Product configurations
  const [nfcPrice, setNfcPrice] = useState(149);
  const [sitePrice, setSitePrice] = useState(699);
  const [comboPrice, setComboPrice] = useState(749);

  // Site generator state
  const [siteTemplate, setSiteTemplate] = useState<SiteTemplate | null>(null);
  const [isGeneratingSite, setIsGeneratingSite] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [simulatedScroll, setSimulatedScroll] = useState<number>(0);

  // Pitch state
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [selectedPitchType, setSelectedPitchType] = useState<'combo' | 'nfc' | 'site'>('combo');

  // NFC Plate configuration state
  const [plateTheme, setPlateTheme] = useState<'black_gold' | 'acrylic_clean' | 'warm_red' | 'navy_blue'>('black_gold');
  const [gmbReviewLink, setGmbReviewLink] = useState('');
  const [newHistoryNote, setNewHistoryNote] = useState('');

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
  const [adminSelectedLeadId, setAdminSelectedLeadId] = useState<string>('');

  // Manual Account Creation States
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccountId, setNewAccountId] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountNiche, setNewAccountNiche] = useState('Salão de Beleza');
  const [newAccountCity, setNewAccountCity] = useState('');
  const [newAccountGmb, setNewAccountGmb] = useState('');
  const [newAccountPin, setNewAccountPin] = useState('1234');

  // Dynamic filter state for prospecting list
  const [filterOnlySearched, setFilterOnlySearched] = useState(true);

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

  // Load initial demo leads on mount from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'leads'), (snapshot) => {
      const loadedLeads: Lead[] = [];
      snapshot.forEach((doc) => {
        loadedLeads.push(doc.data() as Lead);
      });
      
      if (loadedLeads.length === 0) {
        // First boot: seed the database with defaults
        seedDefaultLeads();
      } else {
        setLeads(loadedLeads);
        // Keep the selectedLead synchronized
        setSelectedLead(prev => {
          if (!prev) return loadedLeads[0] || null;
          const current = loadedLeads.find(l => l.id === prev.id);
          return current || loadedLeads[0] || null;
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    });

    return () => unsubscribe();
  }, []);

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
        saleValue: 749,
        productType: "combo",
        isGoogleRegistered: true,
        googleReviewsStatus: "Crítico: Nota abaixo de 4.0 e menos de 5 avaliações.",
        approachSite: "Apresentar o site modelo de Odonto com agendamento direto. Médicos e dentistas precisam de credibilidade.",
        approachNfc: "Oferecer a Placa de Avaliação Google NFC para balcão, gerando avaliações no final do atendimento.",
        approachMiniSite: "Sugerir mini-site otimizado com botões de emergência via WhatsApp.",
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
        saleValue: 149,
        productType: "nfc",
        isGoogleRegistered: true,
        googleReviewsStatus: "Alerta: Poucas avaliações (8) para o tamanho do negócio.",
        approachSite: "Site modelo com destaque para orçamentos rápidos via celular.",
        approachNfc: "Placa NFC de Avaliação no balcão da oficina na hora da entrega das chaves.",
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
        saleValue: 699,
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
    const selectedNiche = customNiche.trim() ? customNiche : niche;
    
    // Reset and initialize telemetry logs
    setSearchLogs([]);
    addLogEntry(`Iniciando varredura digital em "${city}" para o segmento "${selectedNiche}"...`, 'info', 1);
    setSearchFeedback(`Conectando ao cluster Gemini 3.8 Flash para varredura de "${selectedNiche}" em "${city}"...`);

    let finalData: any = null;
    let streamSuccess = false;

    // 1. Canal Primário: Requisição Assíncrona com Streaming (Server-Sent Events)
    try {
      addLogEntry(`Conectando ao canal de telemetria assíncrona (/api/prospect/stream)...`, 'info', 1);
      const streamResponse = await fetch('/api/prospect/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, niche: selectedNiche }),
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
            setSearchFeedback(`Analisando estabelecimentos reais: "${selectedNiche}" em "${city}" (Tentativa ${attempt})...`);
          }

          setSearchStep(3);
          const response = await fetch('/api/prospect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city, niche: selectedNiche }),
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
        addLogEntry(`Sincronizando ${newLeads.length} leads com o banco de dados Firestore...`, 'info', 5);
        
        // Persistência com tratamento individual de erros
        const writeResults = await Promise.allSettled(
          newLeads.map((lead: Lead) => setDoc(doc(db, 'leads', lead.id), lead))
        );

        const succeeded = writeResults.filter(r => r.status === 'fulfilled').length;
        const failed = writeResults.filter(r => r.status === 'rejected').length;

        if (failed > 0) {
          addLogEntry(`Aviso: ${failed} leads falharam ao salvar no Firestore. ${succeeded} salvos com sucesso.`, 'warn', 5);
        } else {
          addLogEntry(`Todos os ${succeeded} leads foram sincronizados no Firestore com sucesso!`, 'success', 5);
        }

        setSelectedLead(newLeads[0]);
        setSearchFeedback(`Sucesso! ${newLeads.length} oportunidades reais validadas sem truncamento.`);
        addLogEntry(`Varredura concluída com sucesso em ${((Date.now() - startTime) / 1000).toFixed(1)}s!`, 'success', 5);
      } else {
        // Fallback transparente com logs detalhados
        setDemoMode(true);
        addLogEntry(`Ativando catálogo de simulação inteligente para "${selectedNiche}" em "${city}"...`, 'warn', 5);
        const mockResult = fallbackProspect(city, selectedNiche);
        
        await Promise.allSettled(
          mockResult.map((lead: Lead) => setDoc(doc(db, 'leads', lead.id), lead))
        );

        setSelectedLead(mockResult[0]);
        setSearchFeedback(`Modo resiliente ativo: Exibindo dados adaptados para "${selectedNiche}" em "${city}".`);
        addLogEntry(`Catálogo de demonstração carregado com 3 oportunidades.`, 'info', 5);
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
          city: lead.city
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setSiteTemplate(data.template);
    } catch (e) {
      // Offline fallback template based on niche
      const colors = getNicheColors(lead.niche);
      setSiteTemplate({
        colors,
        hero: {
          title: `${lead.name} - Excelência em ${lead.niche}`,
          subtitle: `Referência em qualidade e atendimento em ${lead.city}. Garanta já a sua reserva com condições exclusivas pelo site.`,
          ctaText: "Falar com Atendente"
        },
        about: {
          title: `Quem Somos`,
          text: `A ${lead.name} atende o público de ${lead.city} com foco na alta qualidade, satisfação total e transparência. Contamos com profissionais competentes e comprometidos para te entregar a melhor experiência.`
        },
        services: [
          { title: "Serviço Personalizado", description: "Adaptado especificamente ao seu perfil e necessidade do dia." },
          { title: "Profissionais Especialistas", description: "Equipe certificada e experiente no mercado de atuação." },
          { title: "Atendimento Rápido", description: "Compromisso com prazos rápidos e suporte dedicado." }
        ],
        testimonials: [
          { author: "Ricardo Fernandes", role: "Cliente Regular", text: "Excelente profissionalismo! O serviço foi prestado com rapidez e altíssima precisão. Com certeza voltarei." },
          { author: "Aline Costa", role: "Cliente local", text: "Melhor experiência que tive na região. Preços justos, equipe atenciosa e infraestrutura de ponta." }
        ],
        cta: {
          title: "Não espere para resolver o seu problema!",
          text: `Entre em contato agora mesmo via WhatsApp e agende seu horário com a ${lead.name}.`,
          buttonText: "Iniciar Agendamento no WhatsApp"
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
        whatsapp: `Olá! Sou consultor de presença digital e estava analisando o perfil da *${lead.name}* no Google Meu Negócio aqui em ${lead.city}.\n\nNotei que vocês oferecem um excelente trabalho, mas hoje *não possuem um site profissional* cadastrado e têm poucas avaliações do Google (apenas ${lead.reviewCount} avaliações).\n\nSabia que cerca de 82% das pessoas pesquisam no celular antes de decidir onde ir? Para te ajudar a reverter isso de forma rápida e faturar mais, desenvolvemos duas soluções práticas:\n\n1. 💳 *Placa NFC Inteligente + QR Code*: Seus clientes apenas aproximam o celular e deixam uma avaliação de 5 estrelas em 3 segundos. É física, elegante e aumenta sua reputação na hora.\n2. 🌐 *Site de Alta Conversão*: Um site moderno para destacar seus serviços e colocar você no topo do Google em ${lead.city}.\n\nEu criei um *modelo de site demonstrativo para vocês de graça*, e gostaria de te mostrar! Que tal marcarmos um papo rápido de 5 minutos?\n\nQual o melhor dia para você?`,
        callScript: {
          opening: `Olá! Tudo bem? Por favor, eu poderia falar com o gerente ou responsável pela ${lead.name}?`,
          hook: `Olá! Meu nome é Allan, sou especialista em atração de clientes locais na região. Estava mapeando as empresas de ${lead.city} e encontrei o cadastro de vocês no Google Meu Negócio. Vi que vocês têm serviços ótimos, mas notei duas grandes oportunidades que estão fazendo vocês perderem clientes para a concorrência todos os dias: vocês estão sem um site oficial e têm apenas ${lead.reviewCount} avaliações de clientes.`,
          valueProp: `Hoje, as pessoas compram de quem tem mais avaliações e passa mais credibilidade. Eu ajudo empresas como a sua a resolver isso rápido instalando nossa Placa de Avaliação NFC Inteligente — onde o cliente aproxima o celular e avalia em 3 segundos. Além disso, criamos Landing Pages de alta velocidade para garantir que vocês fiquem no topo das pesquisas.`,
          objections: `Se eles disserem "não tenho interesse" ou "está caro": Diga: "Compreendo perfeitamente. No entanto, pense que apenas um cliente novo que você ganha com nossa solução já paga todo o investimento da Placa NFC e do site. Eu inclusive criei uma simulação visual gratuita de como ficaria a sua Placa NFC e o seu novo site. Posso te enviar sem compromisso no WhatsApp para você dar uma olhada?"`,
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
        await setDoc(doc(db, 'leads', leadId), cleaned);
        if (selectedLead?.id === leadId) setSelectedLead(cleaned);
        if (loggedInClient?.id === leadId) setLoggedInClient(cleaned);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `leads/${leadId}`);
      }
    }
  };

  const updateLeadDetails = async (leadId: string, updates: Partial<Lead>) => {
    const targetLead = leads.find(l => l.id === leadId);
    if (targetLead) {
      const updated = { ...targetLead, ...updates };
      
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
        await setDoc(doc(db, 'leads', leadId), cleaned);
        if (selectedLead?.id === leadId) setSelectedLead(cleaned);
        if (loggedInClient?.id === leadId) setLoggedInClient(cleaned);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `leads/${leadId}`);
      }
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

  const print10x10Plate = (leadToPrint?: Lead) => {
    const targetLead = leadToPrint || selectedLead;
    const businessName = targetLead ? targetLead.name : 'Sua Empresa';
    const redirectUrl = targetLead 
      ? `${window.location.origin}/r/${targetLead.id}` 
      : (gmbReviewLink || 'https://maps.google.com');

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(redirectUrl)}`;

    const printWindow = window.open('', '_blank', 'width=800,height=800');
    if (!printWindow) {
      alert("Por favor, libere os pop-ups para imprimir a placa.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Placa 10x10cm - ${businessName}</title>
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap');
            @media print {
              body {
                margin: 0;
                padding: 0;
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print {
                display: none !important;
              }
              .print-container {
                border: none !important;
                box-shadow: none !important;
                margin: 0 !important;
              }
            }
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              background-color: #f1f5f9;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="no-print bg-slate-900 text-white px-6 py-4 rounded-2xl mb-8 flex items-center justify-between gap-6 max-w-lg shadow-xl border border-slate-800">
            <div class="space-y-1">
              <h3 class="text-sm font-black">Placa de Mesa Premium GMB 10x10 cm</h3>
              <p class="text-xs text-slate-400">Pronta para impressão direta em papel fotográfico, PVC ou adesivo.</p>
            </div>
            <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-500 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md">
              🖨️ Imprimir Placa
            </button>
          </div>

          <!-- Exact 10x10cm Box -->
          <div class="print-container w-[10cm] h-[10cm] bg-white border-2 border-slate-300 rounded-3xl overflow-hidden flex flex-col justify-between p-6 shadow-2xl relative select-none shrink-0" style="width: 10cm; height: 10cm;">
            <!-- Top Header -->
            <div class="text-center space-y-1.5">
              <span class="text-[9px] font-black text-blue-600 tracking-widest block uppercase">Sua opinião vale muito!</span>
              
              <!-- 5 golden stars -->
              <div class="flex justify-center gap-1">
                ${[...Array(5)].map(() => `
                  <svg class="w-4 h-4 text-amber-400 fill-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                `).join('')}
              </div>
              
              <h2 class="text-[17px] font-extrabold text-slate-800 leading-tight uppercase tracking-tight mt-1">
                AVALIE-NOS NO GOOGLE
              </h2>
            </div>

            <!-- Central Google Multi-color G Icon Logo -->
            <div class="flex justify-center items-center my-1.5">
              <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center shadow-md border border-slate-100">
                <svg class="w-9 h-9" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
            </div>

            <!-- Bottom Row: NFC Left, QR Code Right -->
            <div class="flex items-center justify-between border-t border-slate-100 pt-4 gap-4">
              <!-- Left: NFC Tapping smartphone Wave instruction -->
              <div class="flex flex-col items-center text-center space-y-1.5 flex-1">
                <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <!-- Wireless/NFC Signal Symbol -->
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H13.5M10.5 22.5H13.5M17.25 4.5V19.5a2.25 2.25 0 01-2.25 2.25H9a2.25 2.25 0 01-2.25-2.25V4.5A2.25 2.25 0 019 2.25H15a2.25 2.25 0 012.25 2.25z"></path>
                  </svg>
                </div>
                <div class="space-y-0.5">
                  <span class="text-[8px] font-black uppercase text-blue-600 tracking-wider block">APROXIME O CELULAR</span>
                  <span class="text-[6.5px] font-bold text-slate-400 block uppercase">NFC integrado</span>
                </div>
              </div>

              <!-- Center Separator -->
              <div class="w-px h-12 bg-slate-100 shrink-0"></div>

              <!-- Right: QR Code Dynamic -->
              <div class="flex flex-col items-center text-center space-y-1.5 flex-1">
                <div class="bg-slate-50 p-1.5 rounded-xl border border-slate-100 shadow-xs inline-block">
                  <img src="${qrCodeUrl}" class="w-12 h-12" alt="QR Code" />
                </div>
                <div class="space-y-0.5">
                  <span class="text-[8px] font-black uppercase text-slate-700 tracking-wider block">OU LEIA O QR CODE</span>
                  <span class="text-[6.5px] font-bold text-slate-400 block uppercase">Câmera Fotográfica</span>
                </div>
              </div>
            </div>

            <!-- Absolute tiny identifier tag for manual logistics -->
            <div class="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[5.5px] font-black uppercase text-slate-300 tracking-widest whitespace-nowrap">
              ALF AUTOMACAO - PLACA ID: ${targetLead ? targetLead.id : 'NFC-GOLD'}
            </div>
          </div>

          <p class="no-print text-xs text-slate-400 font-semibold mt-4 text-center">
            Para obter melhores resultados, configure sua impressora para 100% de escala e papel 10x10cm.
          </p>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  // Drag and drop or Click-to-move CRM Pipeline stages
  const getLeadsByStage = (stage: Lead['stage']) => {
    return leads.filter(l => l.stage === stage);
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

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 font-sans flex flex-col antialiased">
      
      {/* Top Professional Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              {/* Premium ALF Brand Symbol */}
              <div className="relative bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                <span className="relative text-base font-extrabold tracking-widest text-white font-mono">
                  ALF
                </span>
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
                  ALF Automação
                  <span className="bg-slate-900 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm">
                    Sales SaaS
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                  Local Growth Intelligence Engine
                </p>
              </div>
            </div>
            
            {/* PWA Install Button & Direct Project ZIP Export */}
            <div className="flex items-center gap-2 ml-auto sm:ml-2 shrink-0">
              <PWAInstallButton />
              <a
                href="/api/export/zip"
                download="alf-automacao-gmb.zip"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-xs cursor-pointer"
                title="Baixar código-fonte completo em arquivo .ZIP"
                id="btn-download-project-zip"
              >
                <Download className="h-3.5 w-3.5 text-slate-600" />
                <span>Exportar (.ZIP)</span>
              </a>
            </div>
          </div>

          {/* Senior UX Tab Navigation System */}
          <nav className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 w-full lg:w-auto overflow-x-auto scrollbar-none gap-0.5">
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'leads' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-900'
              }`}
              id="tab-leads"
            >
              <Search className="h-3.5 w-3.5 text-slate-500" />
              Prospecção
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'crm' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-900'
              }`}
              id="tab-crm"
            >
              <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
              Funil CRM
            </button>
            <button
              onClick={() => {
                if (selectedLead) {
                  generateWebsiteTemplate(selectedLead);
                } else {
                  setActiveTab('site_preview');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'site_preview' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-900'
              }`}
              id="tab-site"
            >
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              Site Demonstrativo
            </button>
            <button
              onClick={() => setActiveTab('nfc_designer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'nfc_designer' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-900'
              }`}
              id="tab-nfc"
            >
              <QrCode className="h-3.5 w-3.5 text-slate-500" />
              Placa NFC
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'calculator' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-900'
              }`}
              id="tab-calculator"
            >
              <Coins className="h-3.5 w-3.5 text-slate-500" />
              Calculadora ROI
            </button>
            <button
              onClick={() => setActiveTab('portal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === 'portal' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-900'
              }`}
              id="tab-portal"
            >
              <Key className="h-3.5 w-3.5 text-slate-500" />
              Portal do Cliente
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* API Key Status Info Banner */}
        {demoMode && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-semibold text-sm">Modo de Simulação Ativado (Offline)</p>
                <p className="text-xs text-amber-700">O sistema está gerando empresas e layouts pré-configurados pela IA. Para fazer buscas reais em tempo real, configure sua chave do Google Gemini em <strong className="font-semibold">Settings &gt; Secrets</strong>.</p>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-md font-bold self-start sm:self-auto shrink-0 uppercase">Demo</span>
          </div>
        )}

        {/* TAB 1: SEARCH & PROSPECT LOCAL BUSINESSES */}
        {activeTab === 'leads' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Search Setup Side Panel */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Search className="h-4 w-4 text-slate-900" />
                  Mecanismo de Prospecção
                </h2>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                  Scanner de Crescimento de Vendas
                </p>
              </div>

              {/* Form parameters */}
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden transition-all"
                      id="input-city"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Segmento / Nicho principal</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_NICHES.map((n) => {
                      const isSelected = niche === n.id && !customNiche;
                      return (
                        <button
                          key={n.id}
                          onClick={() => { setNiche(n.id); setCustomNiche(''); }}
                          className={`py-2 px-2.5 text-left text-xs rounded-lg border transition-all cursor-pointer truncate font-bold ${
                            isSelected 
                              ? 'bg-slate-950 border-slate-950 text-white' 
                              : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-600'
                          }`}
                          id={`niche-${n.id}`}
                        >
                          {n.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Outro Nicho (Opcional)</label>
                  <input
                    type="text"
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                    placeholder="Ex: Pizzaria, Floricultura, Padaria"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden transition-all"
                    id="input-custom-niche"
                  />
                </div>

                <button
                  onClick={searchLocalBusinesses}
                  disabled={isSearching}
                  className="w-full bg-slate-950 hover:bg-slate-900 active:bg-black text-white font-black py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  id="btn-search"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                      Scanner Ativo (Etapa {searchStep}/5)...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      Buscar Oportunidades
                    </>
                  )}
                </button>

                {/* Progress Bar & Stage Indicator */}
                {(isSearching || searchStep > 0) && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        {isSearching ? (
                          <Activity className="h-3 w-3 text-cyan-500 animate-pulse" />
                        ) : (
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                        )}
                        {searchStep === 1 && "1/5: Sanitização CyberShield Guard"}
                        {searchStep === 2 && "2/5: Conexão Gemini 3.8 Flash"}
                        {searchStep === 3 && "3/5: Varredura Google Maps Grounding"}
                        {searchStep === 4 && "4/5: Auditoria de Fragilidades & Notas"}
                        {searchStep === 5 && "5/5: Sincronização e Validação"}
                        {searchStep === 0 && "Varredura Pronta"}
                      </span>
                      <span className="font-mono text-slate-600">
                        {Math.min(100, searchStep * 20)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          searchStep === 5 ? 'bg-emerald-500' : 'bg-slate-900'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(10, searchStep * 20))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Anti-Truncation Badge */}
                {antiTruncationRecovered && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-[10px] font-bold text-emerald-800">
                    <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Algoritmo anti-truncamento ativo: Todos os registros foram recuperados e validados.</span>
                  </div>
                )}

                {/* Error Banner with Direct Recovery */}
                {searchErrorDetails && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5 text-left">
                    <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-[11px]">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                      <span>{searchErrorDetails.code ? `Erro: ${searchErrorDetails.code}` : 'Falha na Varredura'}</span>
                    </div>
                    <p className="text-[10px] text-rose-700 font-medium">
                      {searchErrorDetails.message}
                    </p>
                    {searchErrorDetails.details && (
                      <p className="text-[9px] text-rose-600 font-mono bg-rose-100/60 p-1.5 rounded">
                        {searchErrorDetails.details}
                      </p>
                    )}
                    <button
                      onClick={searchLocalBusinesses}
                      disabled={isSearching}
                      className="w-full mt-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1 px-2 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Tentar Novamente Agora
                    </button>
                  </div>
                )}

                {/* Real-time Telemetry Logs Terminal */}
                {searchLogs.length > 0 && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner text-left font-mono">
                    <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-[10px] font-extrabold text-slate-200 uppercase tracking-wider">
                          Logs de Telemetria
                        </span>
                        {isSearching && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {searchExecutionTime && (
                          <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {(searchExecutionTime / 1000).toFixed(1)}s
                          </span>
                        )}
                        <button
                          onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                          className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                          title={isConsoleExpanded ? "Recolher console" : "Expandir console"}
                        >
                          {isConsoleExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isConsoleExpanded && (
                      <div className="p-2.5 max-h-44 overflow-y-auto space-y-1.5 text-[10px] text-slate-300 scrollbar-thin scrollbar-thumb-slate-800">
                        {searchLogs.map((log) => {
                          const levelColors = {
                            info: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40',
                            warn: 'text-amber-300 bg-amber-950/60 border-amber-800/40',
                            error: 'text-rose-400 bg-rose-950/60 border-rose-800/40',
                            success: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40'
                          };

                          return (
                            <div key={log.id} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-slate-500 text-[9px] shrink-0 font-mono">
                                [{log.timestamp}]
                              </span>
                              <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded border shrink-0 ${levelColors[log.level]}`}>
                                {log.level}
                              </span>
                              <span className="break-words text-slate-300">
                                {log.message}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing settings */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5 text-slate-500" />
                  Configurar Preços de Venda
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">Placa NFC</span>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-xs text-slate-400">R$</span>
                      <input
                        type="number"
                        value={nfcPrice}
                        onChange={(e) => setNfcPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 pl-6 pr-1 text-xs text-center font-bold focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">Criar Site</span>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-xs text-slate-400">R$</span>
                      <input
                        type="number"
                        value={sitePrice}
                        onChange={(e) => setSitePrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 pl-6 pr-1 text-xs text-center font-bold focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">Combo</span>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-xs text-slate-400">R$</span>
                      <input
                        type="number"
                        value={comboPrice}
                        onChange={(e) => setComboPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 pl-6 pr-1 text-xs text-center font-bold focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Leads list and single details */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Opportunities List Container */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {(() => {
                  const activeNicheFilter = (customNiche.trim() ? customNiche : niche).trim().toLowerCase();
                  const activeCityFilter = city.trim().toLowerCase();

                  const displayedLeads = leads.filter(lead => {
                    if (!filterOnlySearched) return true;
                    
                    const leadCity = (lead.city || '').trim().toLowerCase();
                    const cityMatch = !activeCityFilter || leadCity.includes(activeCityFilter) || activeCityFilter.includes(leadCity);

                    const leadNiche = (lead.niche || '').trim().toLowerCase();
                    const nicheMatch = !activeNicheFilter || leadNiche.includes(activeNicheFilter) || activeNicheFilter.includes(leadNiche);

                    return cityMatch && nicheMatch;
                  });

                  return (
                    <>
                      <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <h2 className="text-base font-bold text-slate-900">
                            Empresas Encontradas ({displayedLeads.length})
                          </h2>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            {filterOnlySearched 
                              ? `Filtro: "${customNiche.trim() ? customNiche : niche}" em "${city}"` 
                              : "Mostrando histórico completo de buscas"
                            }
                          </p>
                        </div>
                        
                        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto shrink-0 border border-slate-200">
                          <button
                            onClick={() => setFilterOnlySearched(true)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                              filterOnlySearched 
                                ? 'bg-white text-slate-800 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Filtrado
                          </button>
                          <button
                            onClick={() => setFilterOnlySearched(false)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                              !filterOnlySearched 
                                ? 'bg-white text-slate-800 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Todos ({leads.length})
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                        {displayedLeads.length === 0 ? (
                          <div className="text-center py-12 px-4">
                            <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-sm">Nenhum lead encontrado neste filtro.</p>
                            <p className="text-slate-400 text-xs mt-1">Clique em "Buscar Oportunidades" ao lado para varrer esta cidade, ou altere o filtro para "Todos" acima.</p>
                          </div>
                        ) : (
                          displayedLeads.map((lead) => {
                      const isSelected = selectedLead?.id === lead.id;
                      const badgeStyles = lead.hasWebsite 
                        ? 'bg-amber-50 text-amber-800 border-amber-200/50' 
                        : 'bg-red-50 text-red-800 border-red-200/50';
                      
                      return (
                        <div
                          key={lead.id}
                          onClick={() => { setSelectedLead(lead); generateSalesPitch(lead); }}
                          className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all hover:bg-slate-50/60 ${
                            isSelected ? 'bg-slate-100/70 border-l-3 border-l-slate-900' : ''
                          }`}
                          id={`lead-card-${lead.id}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-extrabold text-xs text-slate-900 tracking-tight">{lead.name}</h3>
                              <span className={`text-[9px] px-2 py-0.5 rounded-md border font-extrabold uppercase tracking-wider ${badgeStyles}`}>
                                {lead.hasWebsite ? 'Site Amador/Incompleto' : 'Sem Site Cadastrado'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3 inline shrink-0" /> {lead.address}
                            </p>
                            <div className="flex items-center gap-2.5 pt-0.5">
                              <div className="flex items-center text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < Math.floor(lead.rating) ? 'fill-amber-400' : 'text-slate-300'}`}
                                  />
                                ))}
                                <span className="text-xs font-bold text-slate-700 ml-1">{lead.rating}</span>
                              </div>
                              <span className="text-[11px] text-slate-400">({lead.reviewCount} avaliações)</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-auto">
                            {lead.stage ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/60 px-2 py-1 rounded-md">
                                No Funil
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateLeadStage(lead.id, 'to_contact');
                                }}
                                className="text-xs font-semibold bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200/80 py-1.5 px-3 rounded-lg transition-all flex items-center gap-1"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Salvar Funil
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeLead(lead.id);
                              }}
                              className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                    </>
                  );
                })()}
              </div>

              {/* Single Lead Detail & Action Center */}
              {selectedLead && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6" id="lead-actions-panel">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                    <div>
                      <span className="bg-slate-100 text-slate-800 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md border border-slate-200/50">
                        {selectedLead.niche} em {selectedLead.city}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-2">{selectedLead.name}</h3>
                      <p className="text-xs text-red-600 font-extrabold mt-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                        Fraqueza: {selectedLead.weakness}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateWebsiteTemplate(selectedLead)}
                        className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
                        id="btn-generate-site-model"
                      >
                        <Globe className="h-3.5 w-3.5 text-cyan-400" />
                        Criar Site Modelo
                      </button>
                      <button
                        onClick={() => {
                          setPlateTheme('black_gold');
                          setGmbReviewLink(selectedLead.googleMapsUrl);
                          setActiveTab('nfc_designer');
                        }}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
                        id="btn-generate-plate-model"
                      >
                        <QrCode className="h-3.5 w-3.5 text-slate-600" />
                        Ver Placa NFC
                      </button>
                    </div>
                  </div>

                  {/* Core Action Sections: Pitch & Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Pitch Script generated */}
                    <div className="space-y-3">
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

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium text-slate-700 leading-relaxed max-h-[180px] overflow-y-auto whitespace-pre-wrap">
                        {isGeneratingPitch ? (
                          <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                            <span>Escrevendo pitch persuasivo com IA...</span>
                          </div>
                        ) : (
                          pitch?.whatsapp || "Selecione ou busque uma empresa para gerar o pitch inteligente com IA."
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (pitch) {
                              navigator.clipboard.writeText(pitch.whatsapp);
                              alert("Mensagem copiada para a área de transferência!");
                            }
                          }}
                          className="flex-1 text-center py-2 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Copiar Texto
                        </button>
                        <a
                          href={getWhatsAppLink(selectedLead, pitch?.whatsapp)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-all text-center shadow-xs"
                          id="btn-send-whatsapp"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Enviar WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* Quick CRM Info & Details update */}
                    <div className="space-y-4 bg-slate-50/60 border border-slate-100 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200/50 flex items-center justify-between">
                        <span>Configurações Comercial</span>
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm font-black tracking-widest uppercase">GMB Analisado</span>
                      </h4>
                      
                      <div className="space-y-3">
                        {/* Google registration verified badge */}
                        <div className="bg-slate-100/80 p-2.5 rounded-lg border border-slate-200/50 space-y-1.5">
                          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Verificação de Registro GMB</span>
                          <div className="flex items-center gap-1.5">
                            {selectedLead.isGoogleRegistered !== false ? (
                              <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle className="h-3 w-3" /> Registrada no Google
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-red-700 text-xs font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                                <AlertTriangle className="h-3 w-3" /> Não Reivindicada / Pendente
                              </div>
                            )}
                          </div>
                          {selectedLead.googleReviewsStatus && (
                            <p className="text-[10px] text-slate-600 font-semibold mt-1">
                              ⭐ <span className="text-slate-500">Status Avaliações:</span> {selectedLead.googleReviewsStatus}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Produto Oferecido</label>
                          <select
                            value={selectedLead.productType || 'combo'}
                            onChange={(e) => {
                              const val = e.target.value as Lead['productType'];
                              const price = val === 'nfc' ? nfcPrice : val === 'site' ? sitePrice : comboPrice;
                              updateLeadDetails(selectedLead.id, { productType: val, saleValue: price });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden"
                          >
                            <option value="combo">Combo: Placa NFC + Site (R$ {comboPrice})</option>
                            <option value="nfc">Apenas Placa NFC Avaliação (R$ {nfcPrice})</option>
                            <option value="site">Apenas Criação de Site (R$ {sitePrice})</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Telefone Comercial / WhatsApp</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={selectedLead.phone}
                              onChange={(e) => updateLeadDetails(selectedLead.id, { phone: e.target.value })}
                              className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium flex-1 focus:outline-hidden"
                            />
                            <a
                              href={`tel:${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                              className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg flex items-center justify-center transition-all"
                              title="Ligar para o cliente"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Status do Funil</label>
                          <select
                            value={selectedLead.stage || 'new'}
                            onChange={(e) => updateLeadStage(selectedLead.id, e.target.value as Lead['stage'])}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-hidden text-blue-700"
                          >
                            <option value="new">Novo Lead (Encontrado)</option>
                            <option value="to_contact">A Contatar (Abordagem)</option>
                            <option value="contacted">Contatado / Em conversa</option>
                            <option value="proposal">Proposta Comercial Enviada</option>
                            <option value="negotiation">Em Negociação</option>
                            <option value="won">Vendido 🎉 (Fechar Negócio)</option>
                            <option value="lost">Recusado</option>
                          </select>
                        </div>

                        {/* CRM SALES CYCLE: NEXT FOLLOW-UP DATE */}
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Próximo Acompanhamento (Follow-Up)</label>
                          <input
                            type="date"
                            value={selectedLead.nextFollowUp || ""}
                            onChange={(e) => updateLeadDetails(selectedLead.id, { nextFollowUp: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-hidden text-slate-700"
                          />
                        </div>

                        {/* OUTREACH SCRIPTS BY SOLUTION (NFC / Site / Mini-site) */}
                        <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/80 space-y-2 mt-2">
                          <span className="block text-[9px] font-bold text-blue-800 uppercase tracking-wider">💡 Abordagens de Especialista Sugeridas</span>
                          
                          {selectedLead.approachNfc && (
                            <div className="space-y-0.5">
                              <span className="block text-[8px] font-black uppercase text-blue-700">Abordagem Placa NFC:</span>
                              <p className="text-[10px] text-slate-600 leading-snug">{selectedLead.approachNfc}</p>
                            </div>
                          )}
                          
                          {selectedLead.approachSite && (
                            <div className="space-y-0.5 pt-1 border-t border-blue-100/50">
                              <span className="block text-[8px] font-black uppercase text-blue-700">Abordagem Site de Modelo:</span>
                              <p className="text-[10px] text-slate-600 leading-snug">{selectedLead.approachSite}</p>
                            </div>
                          )}

                          {selectedLead.approachMiniSite && (
                            <div className="space-y-0.5 pt-1 border-t border-blue-100/50">
                              <span className="block text-[8px] font-black uppercase text-blue-700">Abordagem Mini-Site Local:</span>
                              <p className="text-[10px] text-slate-600 leading-snug">{selectedLead.approachMiniSite}</p>
                            </div>
                          )}
                        </div>

                        {/* CRM SALES HISTORY LOG */}
                        <div className="space-y-2 pt-2 border-t border-slate-200/50">
                          <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Anotações do Histórico</label>
                          
                          {/* List of notes */}
                          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                            {!selectedLead.historyNotes || selectedLead.historyNotes.length === 0 ? (
                              <p className="text-[10px] text-slate-400 italic">Nenhuma anotação registrada ainda.</p>
                            ) : (
                              selectedLead.historyNotes.map((note, index) => (
                                <div key={index} className="bg-white border border-slate-200 p-2 rounded-lg text-[10px] text-slate-600 leading-relaxed font-medium shadow-2xs relative">
                                  {note}
                                </div>
                              ))
                            )}
                          </div>

                          {/* Add a new note form */}
                          <div className="flex gap-1.5 mt-2">
                            <input
                              type="text"
                              value={newHistoryNote}
                              onChange={(e) => setNewHistoryNote(e.target.value)}
                              placeholder="Digite uma nova anotação do ciclo..."
                              className="bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-medium flex-1 focus:outline-hidden"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newHistoryNote.trim()) {
                                  e.preventDefault();
                                  const updatedNotes = [...(selectedLead.historyNotes || []), newHistoryNote.trim()];
                                  updateLeadDetails(selectedLead.id, { historyNotes: updatedNotes });
                                  setNewHistoryNote('');
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                if (newHistoryNote.trim()) {
                                  const updatedNotes = [...(selectedLead.historyNotes || []), newHistoryNote.trim()];
                                  updateLeadDetails(selectedLead.id, { historyNotes: updatedNotes });
                                  setNewHistoryNote('');
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-lg text-xs cursor-pointer flex items-center"
                            >
                              +
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

          </div>
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

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
              
              {/* STAGE 1: TO CONTACT */}
              <div className="bg-slate-100 border border-slate-200/60 rounded-2xl p-3 min-w-[240px] flex flex-col h-[520px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">A Contatar</span>
                  <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    {getLeadsByStage('to_contact').length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {getLeadsByStage('to_contact').map(lead => (
                    <div key={lead.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2 hover:border-blue-400 transition-all">
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">{lead.name}</h4>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>{lead.niche}</span>
                        <span className="font-semibold text-slate-700">R$ {lead.saleValue}</span>
                      </div>
                      {lead.nextFollowUp && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-blue-800 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-sm w-fit">
                          📅 F/U: {lead.nextFollowUp.split('-').reverse().join('/')}
                        </div>
                      )}
                      {lead.historyNotes && lead.historyNotes.length > 0 && (
                        <p className="text-[9px] text-slate-500 italic truncate max-w-full">
                          📝 {lead.historyNotes[lead.historyNotes.length - 1]}
                        </p>
                      )}
                      <div className="flex gap-1 pt-1.5 border-t border-slate-100">
                        <button
                          onClick={() => updateLeadStage(lead.id, 'contacted')}
                          className="flex-1 py-1 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-md text-[10px]"
                        >
                          Contatar
                        </button>
                        <button
                          onClick={() => { setSelectedLead(lead); generateWebsiteTemplate(lead); }}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md text-[10px]"
                          title="Gerar Site de Modelo"
                        >
                          Site
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STAGE 2: CONTACTED */}
              <div className="bg-slate-100 border border-slate-200/60 rounded-2xl p-3 min-w-[240px] flex flex-col h-[520px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-blue-700">Contatado</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">
                    {getLeadsByStage('contacted').length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {getLeadsByStage('contacted').map(lead => (
                    <div key={lead.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2 hover:border-blue-400 transition-all">
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">{lead.name}</h4>
                      <p className="text-[10px] text-amber-600 font-semibold leading-tight">💬 {lead.weakness}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>{lead.phone}</span>
                        <span className="font-semibold text-slate-700">R$ {lead.saleValue}</span>
                      </div>
                      {lead.nextFollowUp && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-blue-800 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-sm w-fit">
                          📅 F/U: {lead.nextFollowUp.split('-').reverse().join('/')}
                        </div>
                      )}
                      {lead.historyNotes && lead.historyNotes.length > 0 && (
                        <p className="text-[9px] text-slate-500 italic truncate max-w-full">
                          📝 {lead.historyNotes[lead.historyNotes.length - 1]}
                        </p>
                      )}
                      <div className="flex gap-1 pt-1.5 border-t border-slate-100">
                        <button
                          onClick={() => updateLeadStage(lead.id, 'proposal')}
                          className="flex-1 py-1 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-md text-[10px]"
                        >
                          Enviar Proposta
                        </button>
                        <a
                          href={getWhatsAppLink(lead)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[10px] flex items-center justify-center"
                          title="Conversar no WhatsApp"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STAGE 3: PROPOSAL */}
              <div className="bg-slate-100 border border-slate-200/60 rounded-2xl p-3 min-w-[240px] flex flex-col h-[520px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-indigo-700">Proposta Enviada</span>
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full font-bold">
                    {getLeadsByStage('proposal').length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {getLeadsByStage('proposal').map(lead => (
                    <div key={lead.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2 hover:border-blue-400 transition-all">
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">{lead.name}</h4>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>{lead.productType?.toUpperCase()}</span>
                        <span className="font-semibold text-slate-700">R$ {lead.saleValue}</span>
                      </div>
                      {lead.nextFollowUp && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-blue-800 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-sm w-fit">
                          📅 F/U: {lead.nextFollowUp.split('-').reverse().join('/')}
                        </div>
                      )}
                      {lead.historyNotes && lead.historyNotes.length > 0 && (
                        <p className="text-[9px] text-slate-500 italic truncate max-w-full">
                          📝 {lead.historyNotes[lead.historyNotes.length - 1]}
                        </p>
                      )}
                      <div className="flex gap-1 pt-1.5 border-t border-slate-100">
                        <button
                          onClick={() => updateLeadStage(lead.id, 'won')}
                          className="flex-1 py-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-[10px]"
                        >
                          Fechar Venda 🎉
                        </button>
                        <button
                          onClick={() => updateLeadStage(lead.id, 'lost')}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-md text-[10px]"
                          title="Recusada"
                        >
                          Perdido
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STAGE 4: WON */}
              <div className="bg-slate-100 border border-slate-200/60 rounded-2xl p-3 min-w-[240px] flex flex-col h-[520px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-emerald-700">Fechado 🎉</span>
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                    {getLeadsByStage('won').length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {getLeadsByStage('won').map(lead => (
                    <div key={lead.id} className="bg-white border border-emerald-300 rounded-xl p-3 shadow-xs space-y-2 relative overflow-hidden">
                      <div className="absolute right-0 top-0 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-bl-lg">PAGO</div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight pr-6">{lead.name}</h4>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-emerald-700 font-semibold">{lead.productType?.toUpperCase()}</span>
                        <span className="font-bold text-slate-800">R$ {lead.saleValue}</span>
                      </div>
                      {lead.nextFollowUp && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-blue-800 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-sm w-fit">
                          📅 F/U: {lead.nextFollowUp.split('-').reverse().join('/')}
                        </div>
                      )}
                      {lead.historyNotes && lead.historyNotes.length > 0 && (
                        <p className="text-[9px] text-slate-500 italic truncate max-w-full">
                          📝 {lead.historyNotes[lead.historyNotes.length - 1]}
                        </p>
                      )}
                      <div className="flex gap-1 pt-1.5 border-t border-slate-100">
                        <button
                          onClick={() => { setSelectedLead(lead); generateWebsiteTemplate(lead); }}
                          className="flex-1 py-1 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md text-[10px]"
                        >
                          Configurar Site
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STAGE 5: LOST */}
              <div className="bg-slate-100 border border-slate-200/60 rounded-2xl p-3 min-w-[240px] flex flex-col h-[520px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-slate-500">Recusado</span>
                  <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                    {getLeadsByStage('lost').length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {getLeadsByStage('lost').map(lead => (
                    <div key={lead.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2 opacity-65">
                      <h4 className="font-bold text-xs text-slate-500 leading-tight">{lead.name}</h4>
                      <div className="flex gap-1 justify-end pt-1">
                        <button
                          onClick={() => updateLeadStage(lead.id, 'to_contact')}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[9px]"
                        >
                          Reativar Lead
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: AI WEBSITE MODEL GENERATOR */}
        {activeTab === 'site_preview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Template parameters live-editor panel */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="h-4.5 w-4.5 text-blue-600" />
                  Editor de Site de Modelo
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Customize a Landing Page criada pela Inteligência Artificial para encantar a empresa.
                </p>
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
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:bg-white focus:outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subtítulo explicativo</label>
                    <textarea
                      value={siteTemplate.hero.subtitle}
                      onChange={(e) => setSiteTemplate({
                        ...siteTemplate,
                        hero: { ...siteTemplate.hero, subtitle: e.target.value }
                      })}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:bg-white focus:outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Chamada no Botão (CTA)</label>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Paleta de Cores Hex</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">Primária</span>
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
                        <span className="block text-[10px] text-slate-500 font-semibold mb-0.5">Botões / CTA</span>
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

                  {selectedLead && (
                    <div className="pt-4 border-t border-slate-100 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                      <h4 className="text-xs font-extrabold text-blue-900">Script de Apresentação</h4>
                      <p className="text-[11px] text-blue-800 mt-1">"Eu tomei a liberdade de criar esse site demonstrativo personalizado para mostrar o impacto que um design profissional tem no posicionamento de vocês do Google Meu Negócio de {selectedLead.city}..."</p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-12 px-4 space-y-4">
                  <Globe className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-slate-500 font-medium text-sm">Nenhum site de modelo gerado no momento.</p>
                  <p className="text-slate-400 text-xs">Vá em Buscar Oportunidades, selecione um lead e clique em "Criar Site Modelo".</p>
                </div>
              )}
            </div>

            {/* Browser Simulator Canvas */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setDeviceView('desktop')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      deviceView === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Laptop className="h-3.5 w-3.5" />
                    Computador (Desktop)
                  </button>
                  <button
                    onClick={() => setDeviceView('mobile')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      deviceView === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    Celular (Mobile)
                  </button>
                </div>
                
                {selectedLead && (
                  <span className="text-xs text-slate-500 font-semibold bg-white px-3 py-1.5 border border-slate-200 rounded-xl">
                    Site Demonstrativo de: <strong className="font-extrabold text-slate-800">{selectedLead.name}</strong>
                  </span>
                )}
              </div>

              {/* Simulator view frame */}
              {isGeneratingSite ? (
                <div className="bg-white border border-slate-200 rounded-2xl h-[550px] shadow-sm flex flex-col items-center justify-center gap-4 text-slate-500 p-8">
                  <div className="relative flex items-center justify-center">
                    <div className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75"></div>
                    <div className="relative rounded-full h-8 w-8 bg-blue-600 flex items-center justify-center text-white font-bold">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="font-bold text-slate-800 text-base">A IA está criando e codificando a Landing Page...</p>
                  <p className="text-xs text-slate-400 text-center max-w-sm">Estruturando paleta de cores para o segmento, criando textos de gatilho mental, benefícios específicos e formulário de vendas de alta performance.</p>
                </div>
              ) : siteTemplate ? (
                <div className="flex justify-center bg-slate-200/50 p-6 rounded-2xl border border-slate-300/40 shadow-inner overflow-hidden">
                  
                  {/* Outer Frame Wrapper */}
                  <div className={`bg-white border border-slate-300 rounded-2xl shadow-xl transition-all duration-300 ${
                    deviceView === 'mobile' ? 'w-[360px] h-[550px]' : 'w-full h-[550px]'
                  } flex flex-col`}>
                    
                    {/* Simulator top browser bar */}
                    <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2 rounded-t-2xl shrink-0">
                      <div className="flex gap-1 shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-md py-0.5 px-3.5 text-[10px] text-slate-400 font-mono font-bold flex-1 truncate text-center flex items-center justify-center gap-1">
                        <Shield className="h-2.5 w-2.5 text-emerald-500" />
                        https://www.{selectedLead ? selectedLead.name.toLowerCase().replace(/[^a-z]/g, '') : 'site-modelo'}.com.br
                      </div>
                    </div>

                    {/* Simulated website body content */}
                    <div 
                      className="flex-1 overflow-y-auto scroll-smooth" 
                      onScroll={(e) => setSimulatedScroll(e.currentTarget.scrollTop)}
                      style={{ backgroundColor: siteTemplate.colors.bg, color: siteTemplate.colors.text }}
                    >
                      
                      {/* Nav Header */}
                      <header className="px-4 py-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10 shadow-xs">
                        <span className="font-black text-xs uppercase tracking-wider" style={{ color: siteTemplate.colors.primary }}>
                          {selectedLead ? selectedLead.name : 'Logotipo'}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                          Aberta Hoje
                        </span>
                      </header>

                      {/* Interactive GSAP-Style Immersive Cinema Simulator */}
                      <div className="relative h-56 md:h-64 w-full overflow-hidden shrink-0 flex items-center justify-center bg-slate-950">
                        {/* Background zoom image that scrubs on scroll */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-75 ease-out opacity-85"
                          style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')`,
                            transform: `scale(${1 + (simulatedScroll / 500)}) translateY(${simulatedScroll * 0.12}px)`,
                            filter: `blur(${Math.min(3, simulatedScroll / 120)}px)`
                          }}
                        />
                        {/* Elegant overlay vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
                        
                        {/* Floating elements with 3D parallax */}
                        <div 
                          className="relative z-10 text-center px-4 space-y-2 transition-all duration-75 ease-out"
                          style={{
                            transform: `translateY(${-simulatedScroll * 0.08}px)`,
                            opacity: Math.max(0, 1 - (simulatedScroll / 180))
                          }}
                        >
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] uppercase font-bold tracking-widest border border-cyan-400/20 backdrop-blur-xs">
                            <Sparkles className="h-3 w-3 animate-pulse" />
                            Tecnologia GSAP Ativa
                          </span>
                          <h2 className="text-lg md:text-xl font-black text-white tracking-tight leading-none drop-shadow-md">
                            {selectedLead ? selectedLead.name : 'Ambiente Premium'}
                          </h2>
                          <p className="text-[10px] text-slate-300 font-medium max-w-xs mx-auto drop-shadow-sm">
                            Role a página para ver o efeito de zoom cinemático imersivo da imagem
                          </p>
                        </div>

                        {/* Interactive dynamic scroll indicator */}
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
                          <span className="text-[8px] text-white/50 font-bold uppercase tracking-widest">Scroll</span>
                          <div className="w-1.5 h-3 rounded-full border border-white/30 flex items-start justify-center p-0.5">
                            <div className="w-0.5 h-1 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>

                      {/* Hero Section */}
                      <section className="px-5 py-8 md:py-12 text-center space-y-4 border-b border-slate-100 bg-linear-to-b from-white/20 to-transparent">
                        <h1 className="text-xl md:text-2xl font-black leading-tight tracking-tight text-slate-900">
                          {siteTemplate.hero.title}
                        </h1>
                        <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                          {siteTemplate.hero.subtitle}
                        </p>
                        <button
                          className="px-6 py-2.5 text-xs font-black rounded-full shadow-md hover:opacity-90 active:scale-95 transition-all text-white cursor-pointer mx-auto block uppercase tracking-wider"
                          style={{ backgroundColor: siteTemplate.colors.accent }}
                        >
                          {siteTemplate.hero.ctaText}
                        </button>
                      </section>

                      {/* Services / Benefits Section */}
                      <section className="px-5 py-8 space-y-5">
                        <div className="text-center">
                          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Nossos Serviços</h2>
                          <p className="text-sm font-black text-slate-900 mt-1">Especialidades de alto padrão</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {siteTemplate.services.map((svc, sIdx) => (
                            <div key={sIdx} className="bg-white border border-slate-100/80 p-4 rounded-xl shadow-xs space-y-1.5">
                              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                                <Award className="h-4 w-4" style={{ color: siteTemplate.colors.primary }} />
                              </div>
                              <h3 className="font-bold text-xs text-slate-900">{svc.title}</h3>
                              <p className="text-[11px] text-slate-500 leading-normal">{svc.description}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* About Us Section */}
                      <section className="px-5 py-8 bg-white/40 border-y border-slate-100/50 flex flex-col md:flex-row items-center gap-6">
                        <div className="space-y-3 flex-1">
                          <h2 className="text-sm font-black text-slate-900">{siteTemplate.about.title}</h2>
                          <p className="text-xs text-slate-600 leading-relaxed">{siteTemplate.about.text}</p>
                          <div className="flex gap-4 pt-1">
                            <div>
                              <span className="block text-sm font-black" style={{ color: siteTemplate.colors.primary }}>10+ Anos</span>
                              <span className="text-[9px] text-slate-400 uppercase font-bold">Experiência</span>
                            </div>
                            <div>
                              <span className="block text-sm font-black" style={{ color: siteTemplate.colors.primary }}>4.8+ Google</span>
                              <span className="text-[9px] text-slate-400 uppercase font-bold">Avaliação Média</span>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Testimonials */}
                      <section className="px-5 py-8 space-y-5">
                        <div className="text-center">
                          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Avaliações de Clientes</h2>
                          <p className="text-sm font-black text-slate-900 mt-1">Quem já conhece, aprova</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {siteTemplate.testimonials.map((t, tIdx) => (
                            <div key={tIdx} className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">
                                  {t.author.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-[11px] text-slate-900">{t.author}</h4>
                                  <p className="text-[9px] text-slate-400">{t.role}</p>
                                </div>
                              </div>
                              <p className="text-xs italic text-slate-600 leading-relaxed">"{t.text}"</p>
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* CTA & Contact info Footer */}
                      <section className="px-5 py-10 text-center space-y-5 text-white" style={{ backgroundColor: siteTemplate.colors.primary }}>
                        <h2 className="text-lg font-black leading-tight">{siteTemplate.cta.title}</h2>
                        <p className="text-xs opacity-90 max-w-sm mx-auto leading-relaxed">{siteTemplate.cta.text}</p>
                        <button
                          className="px-6 py-2.5 text-xs font-black rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all text-slate-900 bg-white cursor-pointer mx-auto block uppercase tracking-wider"
                          style={{ color: siteTemplate.colors.primary }}
                        >
                          {siteTemplate.cta.buttonText}
                        </button>
                        <div className="pt-4 border-t border-white/10 text-[10px] opacity-75 space-y-1">
                          <p>{selectedLead?.address || 'Rua Principal, Centro'}</p>
                          <p>Contato: {selectedLead?.phone || '(11) 99999-9999'}</p>
                        </div>
                      </section>

                    </div>

                  </div>

                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl h-[550px] shadow-sm flex flex-col items-center justify-center gap-2 text-slate-500">
                  <Globe className="h-10 w-10 text-slate-300" />
                  <p className="font-bold text-slate-700 text-sm">Pronto para demonstrar</p>
                  <p className="text-xs text-slate-400">Gere o site de modelo no menu anterior para ver a prévia interativa.</p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 4: PHYSICAL NFC CARD DESIGNER */}
        {activeTab === 'nfc_designer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Design Controls */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <QrCode className="h-4.5 w-4.5 text-blue-600" />
                  Configurar Placa NFC de Avaliação
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Estilize o design físico da Placa/Cartão para o cliente e gere o QR-Code direto para as avaliações no Google Meu Negócio.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Estilo Visual do Cartão</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPlateTheme('black_gold')}
                      className={`py-2 px-3 text-xs rounded-xl border text-center transition-all ${
                        plateTheme === 'black_gold' ? 'bg-slate-900 text-white border-black font-semibold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Preto e Ouro Luxury
                    </button>
                    <button
                      onClick={() => setPlateTheme('acrylic_clean')}
                      className={`py-2 px-3 text-xs rounded-xl border text-center transition-all ${
                        plateTheme === 'acrylic_clean' ? 'bg-white text-slate-800 border-slate-300 font-semibold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Acrílico Transparente
                    </button>
                    <button
                      onClick={() => setPlateTheme('warm_red')}
                      className={`py-2 px-3 text-xs rounded-xl border text-center transition-all ${
                        plateTheme === 'warm_red' ? 'bg-red-600 text-white border-red-700 font-semibold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Veneza Vermelho
                    </button>
                    <button
                      onClick={() => setPlateTheme('navy_blue')}
                      className={`py-2 px-3 text-xs rounded-xl border text-center transition-all ${
                        plateTheme === 'navy_blue' ? 'bg-blue-900 text-white border-blue-950 font-semibold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Azul Corporativo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Nome do Negócio Impresso</label>
                  <input
                    type="text"
                    value={selectedLead ? selectedLead.name : 'Sua Empresa Aqui'}
                    onChange={(e) => {
                      if (selectedLead) {
                        updateLeadDetails(selectedLead.id, { name: e.target.value });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Link de Avaliação Google (ou Maps)</label>
                  <input
                    type="text"
                    value={gmbReviewLink || (selectedLead ? selectedLead.googleMapsUrl : 'https://g.page/r/sua-empresa/review')}
                    onChange={(e) => setGmbReviewLink(e.target.value)}
                    placeholder="Cole o link do Google Meu Negócio"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block leading-normal">
                    Este link será programado no chip NFC interno e impresso no QR Code do cartão físico.
                  </span>
                </div>

                {selectedLead && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold text-slate-700">Abordagem de Venda da Placa:</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      "Com essa Placa NFC em cima do seu balcão ou caixa, você consegue mais avaliações em 5 segundos do que em 1 ano inteiro de forma orgânica. Cada cliente satisfeito que aproxima o celular ajuda a elevar seu rank do Google!"
                    </p>
                  </div>
                )}

                {selectedLead && (
                  <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-xl space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        Gravação do Chip NFC Físico
                      </h4>
                      <p className="text-[10px] text-blue-700 leading-normal">
                        Para ativar uma tag NFC modelo ou definitiva para o cliente aproximar o celular e ser redirecionado, siga o passo a passo abaixo:
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Link de Programação Inteligente:</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/r/${selectedLead.id}`}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-mono text-slate-600"
                        />
                        <button
                          onClick={() => handleCopyNfcUrl(`${window.location.origin}/r/${selectedLead.id}`)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-3 rounded-lg transition-all active:scale-95 cursor-pointer uppercase shrink-0"
                        >
                          {copiedNfcUrl ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-blue-100 space-y-2">
                      <span className="block text-[10px] font-bold text-blue-900 uppercase">Passo a Passo de Gravação (Celular):</span>
                      <ol className="text-[10px] text-slate-600 space-y-1 list-decimal pl-3.5 leading-normal">
                        <li>Baixe o aplicativo gratuito <strong className="text-blue-700">NFC Tools</strong> na <strong className="font-semibold">App Store (iPhone)</strong> ou <strong className="font-semibold">Google Play (Android)</strong>.</li>
                        <li>Abra o aplicativo e selecione a opção <strong className="text-blue-700">Escrever / Write</strong>.</li>
                        <li>Clique em <strong className="text-blue-700">Adicionar Registro</strong> e selecione <strong className="text-blue-700">URL / URI</strong>.</li>
                        <li>Cole o link inteligente copiado acima e clique em <strong className="font-bold">OK</strong>.</li>
                        <li>Clique em <strong className="text-blue-700">Escrever / Write (último botão)</strong> e aproxime a traseira do celular da placa de mesa ou chip NFC para gravar em 1 segundo!</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Acrylic Plate Preview Rendering */}
            <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-6 bg-slate-200/50 p-8 rounded-2xl border border-slate-300/40">
              
              <div className="text-center space-y-1">
                <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Mockup Físico de Apresentação</span>
                <h3 className="text-sm font-black text-slate-800">Visualização de como a placa acrílica final vai parecer</h3>
              </div>

              {/* Physical Card Render Container */}
              <div className={`w-[320px] h-[480px] rounded-2xl p-6 flex flex-col justify-between items-center transition-all duration-300 shadow-2xl border ${
                plateTheme === 'black_gold' 
                  ? 'bg-slate-950 text-white border-amber-500/40 shadow-slate-900/40' 
                  : plateTheme === 'acrylic_clean' 
                  ? 'bg-white text-slate-900 border-slate-300/80 shadow-slate-400/20' 
                  : plateTheme === 'warm_red' 
                  ? 'bg-gradient-to-br from-red-600 to-red-700 text-white border-red-500 shadow-red-950/25'
                  : 'bg-gradient-to-br from-blue-900 to-indigo-950 text-white border-blue-800 shadow-indigo-950/25'
              }`}>
                
                {/* Top header - NFC Signal Icon */}
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-full ${plateTheme === 'black_gold' ? 'bg-amber-400' : 'bg-blue-600'}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-80">NFC LINK INSIDE</span>
                  </div>
                  
                  {/* Google Review Badge logo */}
                  <div className="bg-white/10 backdrop-blur-xs px-2 py-1 rounded-md border border-white/15 flex items-center gap-1 text-[10px] font-black">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-yellow-500">o</span>
                    <span className="text-blue-500">g</span>
                    <span className="text-green-500">l</span>
                    <span className="text-red-500">e</span>
                  </div>
                </div>

                {/* Center Core Display */}
                <div className="text-center space-y-4 my-auto">
                  
                  <div className="space-y-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${plateTheme === 'black_gold' ? 'text-amber-400' : 'text-slate-500'}`}>
                      Aproxime para Avaliar
                    </span>
                    <h4 className="text-base font-black tracking-tight leading-tight px-4 line-clamp-2">
                      {selectedLead ? selectedLead.name : 'Sua Empresa Aqui'}
                    </h4>
                  </div>

                  {/* Contactless tap wave animation graphic */}
                  <div className="relative py-2 flex justify-center">
                    <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-blue-400 opacity-20"></div>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                      plateTheme === 'black_gold' ? 'border-amber-400/30 text-amber-400' : 'border-blue-600/30 text-blue-600'
                    }`}>
                      <Smartphone className="h-6 w-6 animate-pulse" />
                    </div>
                  </div>

                  {/* QR Code generator integration */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-md inline-block">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(gmbReviewLink || 'https://maps.google.com')}`}
                      alt="Review QR Code"
                      className="w-24 h-24 shrink-0"
                    />
                  </div>

                  <p className="text-[10px] opacity-75 font-semibold px-4">
                    Ou escaneie o código com a câmera do celular para avaliar rápido
                  </p>

                </div>

                {/* Bottom - Star Ratings display */}
                <div className="w-full text-center pt-3 border-t border-white/10 flex flex-col items-center gap-1.5">
                  <div className="flex text-amber-400 gap-1 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-85">
                    Sua nota é o seu melhor marketing local
                  </span>
                </div>

              </div>

              {/* Actions for Printing and Exporting */}
              <div className="flex flex-col sm:flex-row gap-3 w-[320px] justify-center">
                <button
                  onClick={() => print10x10Plate()}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  Gerar Placa 10x10cm
                </button>
              </div>

              {/* Instructions to print or present */}
              <div className="max-w-md text-center">
                <p className="text-xs text-slate-500 font-medium">
                  💡 <strong>Dica de Fechamento comercial:</strong> Tire um print desta placa e envie para o WhatsApp do cliente dizendo: <em>"Fiz essa simulação de placa NFC exclusiva para colocar no seu balcão e acelerar o faturamento da {selectedLead?.name || 'sua empresa'}. O que achou?"</em>
                </p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: BUSINESS VALUE & ROI CALCULATOR */}
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

        {/* TAB 6: SAAS PORTAL AND CLIENT NFC MANAGER */}
        {activeTab === 'portal' && (
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
              <div className="flex gap-2.5 mt-6 border-t border-slate-800/80 pt-5">
                <button
                  onClick={() => setPortalMode('admin')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    portalMode === 'admin' 
                      ? 'bg-white text-slate-900 shadow-md' 
                      : 'bg-slate-900/40 text-slate-300 hover:bg-slate-900/80 border border-slate-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Console Admin ALF
                </button>
                <button
                  onClick={() => {
                    if (loggedInClient) {
                      setPortalMode('client_panel');
                    } else {
                      setPortalMode('client_login');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    portalMode === 'client_login' || portalMode === 'client_panel'
                      ? 'bg-white text-slate-900 shadow-md' 
                      : 'bg-slate-900/40 text-slate-300 hover:bg-slate-900/80 border border-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  📱 Área do Cliente {loggedInClient && `(${loggedInClient.name})`}
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
                              onChange={(e) => setNewAccountId(e.target.value)}
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
                              href={`${window.location.origin}/r/${l.id}`} 
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
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Link do Instagram</label>
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

                          {/* Printable Plate Generator Block */}
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="space-y-1 text-center sm:text-left">
                              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Impressão Física da Placa 10x10 cm</h5>
                              <p className="text-[10px] text-slate-400">Gere e imprima instantaneamente a arte final quadrada para o balcão do cliente.</p>
                            </div>
                            <button
                              onClick={() => print10x10Plate(l)}
                              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
                            >
                              <QrCode className="w-4 h-4" />
                              Gerar Placa de Mesa 10x10
                            </button>
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
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Portal do Cliente - ALF Automação</h3>
                  <p className="text-xs text-slate-400">Acesse e configure onde sua Placa NFC e QR Code redirecionam em tempo real.</p>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setClientErrorMessage('');
                    const target = leads.find(item => item.id === clientLoginId);
                    if (target) {
                      if (target.nfcPassword && target.nfcPassword === clientLoginPassword) {
                        setLoggedInClient(target);
                        setPortalMode('client_panel');
                      } else {
                        setClientErrorMessage('Código PIN / Senha de acesso incorreto. Verifique com o administrador da ALF Automação.');
                      }
                    } else {
                      setClientErrorMessage('Nenhum estabelecimento encontrado com este código ID.');
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Código ID do Estabelecimento</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: lead_1"
                      value={clientLoginId}
                      onChange={(e) => setClientLoginId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 uppercase font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Senha de Acesso (PIN)</label>
                    <input
                      type="password"
                      required
                      placeholder="Digite sua senha PIN de 4 dígitos"
                      value={clientLoginPassword}
                      onChange={(e) => setClientLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {clientErrorMessage && (
                    <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-xs text-red-700 leading-normal">
                      ⚠️ {clientErrorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold py-3 rounded-xl shadow-md cursor-pointer transition duration-150"
                  >
                    Acessar Meu Portal
                  </button>
                </form>

                <div className="text-center mt-6 text-[10px] text-slate-400">
                  Perdeu seu código de acesso? Entre em contato com o suporte da ALF Automação.
                </div>
              </div>
            )}

            {/* C: LOGGED IN CLIENT PANEL - THE CLIENT SELF-SERVICE PORTAL */}
            {portalMode === 'client_panel' && loggedInClient && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Panel: Link display & QR Code */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6">
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
                          {window.location.origin}/r/{loggedInClient.id}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/r/${loggedInClient.id}`);
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
                  <div className="bg-slate-950 text-white rounded-2xl p-5 text-center flex flex-col items-center gap-3 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial-gradient from-blue-600/10 to-transparent pointer-events-none"></div>
                    
                    <span className="text-[9px] bg-white/10 uppercase font-black px-2.5 py-1 rounded-full tracking-wider">QR Code Dinâmico Inteligente</span>
                    
                    <div className="bg-white p-3.5 rounded-xl shadow-inner mt-2">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/r/${loggedInClient.id}`)}`}
                        alt="Dynamic Client QR Code"
                        className="w-36 h-36 shrink-0"
                      />
                    </div>
                    
                    <button
                      onClick={() => {
                        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${window.location.origin}/r/${loggedInClient.id}`)}`, '_blank');
                      }}
                      className="bg-slate-800 hover:bg-slate-750 text-xs font-semibold py-1.5 px-4 rounded-xl border border-white/10 flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Imprimir QR Code
                    </button>
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
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase">Link de Avaliações (GMB)</label>
                        <input
                          type="text"
                          value={loggedInClient.googleMapsUrl || ''}
                          onChange={(e) => updateLeadDetails(loggedInClient.id, { googleMapsUrl: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                          placeholder="Cole seu link de avaliações do Google Meu Negócio"
                        />
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

      </main>

      {/* Footer Branding */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
          <p className="font-semibold">Plataforma desenvolvida para fechamento de vendas de auto-conversão no varejo físico e digital.</p>
          <p>© 2026 ALF Automação. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
